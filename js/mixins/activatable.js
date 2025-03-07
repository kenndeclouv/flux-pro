import { removeAttribute, setAttribute, walker } from '../utils.js'
import { Mixin, MixinGroup } from './mixin.js'

export class ActivatableGroup extends MixinGroup {
    groupOfType = Activatable

    boot({ options }) {
        options({
            wrap: false,
            filter: false,
        })

        this.onChanges = []
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    activated(activeEl) {
        this.onChanges.forEach(i => i())
    }

    activateFirst() {
        this.filterAwareWalker().first()?.use(Activatable).activate()
    }

    activateBySearch(query) {
        let found = this.filterAwareWalker().find(i => i.textContent.toLowerCase().trim().startsWith(query.toLowerCase()))

        found?.use(Activatable).activate()
    }

    activateSelectedOrFirst(selectedEl) {
        let isHidden = el => el.matches('ui-option')
            ? (getComputedStyle(el).display === 'none')
            : false

        // If the selected element is hidden, we need to find the first visible element...
        if (! selectedEl || isHidden(selectedEl)) {
            this.filterAwareWalker().first()?.use(Activatable).activate()
            return
        }

        selectedEl?.use(Activatable).activate()
    }

    activateActiveOrFirst() {
        let active = this.getActive()

        if (! active) {
            this.filterAwareWalker().first()?.use(Activatable).activate()
            return
        }

        active?.use(Activatable).activate()
    }

    activateActiveOrLast() {
        let active = this.getActive()

        if (! active) {
            this.filterAwareWalker().last()?.use(Activatable).activate()
            return
        }

        active?.use(Activatable).activate()
    }

    activatePrev() {
        let active = this.getActive()

        if (! active) {
            this.filterAwareWalker().last()?.use(Activatable).activate()
            return
        }

        let found

        if (this.options.wrap) {
            found = this.filterAwareWalker().prevOrLast(active)
        } else {
            found = this.filterAwareWalker().prev(active)
        }

        found?.use(Activatable).activate()
    }

    activateNext() {
        let active = this.getActive()

        if (! active) {
            this.filterAwareWalker().first()?.use(Activatable).activate()
            return
        }

        let found

        if (this.options.wrap) {
            found = this.filterAwareWalker().nextOrFirst(active)
        } else {
            found = this.filterAwareWalker().next(active)
        }

        found?.use(Activatable).activate()
    }

    getActive() {
        return this.walker().find(i => i.use(Activatable).isActive())
    }

    clearActive() {
        this.getActive()?.use(Activatable).deactivate()
    }

    filterAwareWalker() {
        let isHidden = el => el.matches('ui-option')
            ? (getComputedStyle(el).display === 'none')
            : false

        return walker(this.el, (el, { skip, reject }) => {
            if (el[this.constructor.name] && el !== this.el) return reject()
            if (! (el[this.groupOfType.name])) return skip()
            if (el.hasAttribute('disabled')) return reject()
            if (isHidden(el)) return reject()
        })
    }
}

export class Activatable extends Mixin {
    groupedByType = ActivatableGroup

    mount() {
        this.el.addEventListener('mouseenter', () => {
            this.activate()
        })

        this.el.addEventListener('mouseleave', () => {
            this.deactivate()
        })
    }

    activate() {
        // Deactivate others...
        if (this.group()) {
            this.group().walker().each(item => item.use(Activatable).deactivate(false))
        }

        setAttribute(this.el, 'data-active', '')

        this.el.scrollIntoView({ block: 'nearest' })

        this.group() && this.group().activated(this.el)
    }

    deactivate(notify = true) {
        removeAttribute(this.el, 'data-active')

        notify && this.group() && this.group().activated(this.el)
    }

    isActive() {
        return this.el.hasAttribute('data-active')
    }
}

