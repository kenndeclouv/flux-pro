import { removeAttribute, setAttribute } from '../utils.js'
import { Mixin, MixinGroup } from './mixin.js'

export class FilterableGroup extends MixinGroup {
    groupOfType = Filterable

    boot({ options }) {
        options({})

        this.onChanges = []

        this.lastSearch = ''
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    filter(search) {
        if (search === '') {
            this.walker().each(i => {
                i.use(Filterable).unfilter()
            })
        } else {
            this.walker().each(i => {
                if (this.matches(i, search)) {
                    i.use(Filterable).unfilter()
                } else {
                    i.use(Filterable).filter()
                }
            })
        }

        if (this.lastSearch !== search) {
            this.onChanges.forEach(i => i())
        }

        this.lastSearch = search
    }

    matches(el, search) {
        return el.textContent.toLowerCase().trim().includes(search.toLowerCase().trim())
    }

    hasResults() {
        return this.walker().some(i => ! i.use(Filterable).isFiltered())
    }
}

export class Filterable extends Mixin {
    groupedByType = FilterableGroup

    boot({ options }) {
        options({ mirror: null, keep: false })

        this.onChanges = []
    }

    filter() {
        if (this.options().keep) return
        setAttribute(this.el, 'data-hidden', '')
        if (this.options().mirror) setAttribute(this.options().mirror, 'data-hidden', '')
    }

    unfilter() {
        removeAttribute(this.el, 'data-hidden')
        if (this.options().mirror) removeAttribute(this.options().mirror, 'data-hidden', '')
    }

    isFiltered() {
        return this.el.hasAttribute('data-hidden')
    }
}
