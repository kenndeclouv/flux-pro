import { removeAttribute, setAttribute, walker } from '../utils.js'
import { Mixin, MixinGroup } from './mixin.js'

export class SelectableGroup extends MixinGroup {
    groupOfType = Selectable

    boot({ options }) {
        options({
            multiple: false,
        })

        this.state = this.options().multiple ? new Set : null

        this.onChanges = []
    }

    onInitAndChange(callback) {
        callback()

        this.onChanges.push(callback)
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    changed(selectable, silent = false) {
        if (selectable.ungrouped) return

        let value = selectable.value
        let selected = selectable.isSelected()
        let multiple = this.options().multiple

        if (selected) {
            multiple ? this.state.add(value) : this.state = value
        } else {
            multiple ? this.state.delete(value) : this.state =  null
        }

       if (! silent) {
           this.onChanges.forEach(i => i())
       }
    }

    getState() {
        return this.options().multiple ? Array.from(this.state) : this.state
    }

    hasValue(value) {
        return this.options().multiple ? this.state.has(value) : this.state === value
    }

    setState(value) {
        if (value === null) value = this.multiple ? [] : ''

        if (this.options().multiple) {
            if (! Array.isArray(value)) value = [value]

            // Ensure that the value is a string. Select values can only be strings...
            value = value.map(i => i + '')
        } else {
            // Ensure that the value is a string. Select values can only be strings...
            value = value + ''
        }

        this.state = this.options().multiple ? new Set(value) : value

        let values = this.options().multiple ? value : [value]

        this.walker().each(el => {
            let selectable = el.use(Selectable)

            if (selectable.ungrouped) return

            let selected = values.includes(selectable.value)

            if (selected && ! selectable.isSelected())  {
                selectable.surgicallySelect()
            } else if (! selected && selectable.isSelected()) {
                selectable.surgicallyDeselect()
            }
        })

        this.onChanges.forEach(i => i())
    }

    selected() {
        return this.walker().find(item => item.use(Selectable).isSelected()).use(Selectable)
    }

    selecteds() {
        return this.walker().filter(el => el.use(Selectable).isSelected()).map(el => el.use(Selectable))
    }

    selectFirst() {
        this.walker().first()?.use(Selectable).select()
    }

    selectAll() {
        this.walker().filter(el => ! el.use(Selectable).isSelected()).map(el => el.use(Selectable).select())
    }

    deselectAll() {
        this.walker().filter(el => el.use(Selectable).isSelected()).map(el => el.use(Selectable).deselect())
    }

    allAreSelected() {
        return this.walker().filter(el => el.use(Selectable).isSelected()).length
            === this.walker().filter(el => true).length
    }

    noneAreSelected() {
        return this.state === null || this.state?.size === 0
    }

    selectableByValue(value) {
        return this.walker().find(el => el.use(Selectable).value === value)?.use(Selectable)
    }

    deselectOthers(except) {
        this.walker().each(el => {
            if (el === except) return

            el.use(Selectable).surgicallyDeselect()
        })
    }

    selectedTextValue() {
        if (! this.options().multiple) return this.convertValueStringToElementText(this.state)

        return Array.from(this.state).map(i => {
            return this.convertValueStringToElementText(i)
        }).join(', ')
    }

    convertValueStringToElementText(value) {
        // First, let's find a selected element matching this value...
        let selected = this.findByValue(value)

        if (selected) {
            return selected.label || selected.value
        } else {
            return value
        }
    }

    findByValue(value) {
        return this.selecteds().find(i => i.value === value)
    }

    walker() {
        return walker(this.el, (el, { skip, reject }) => {
            if (el[this.constructor.name] && el !== this.el) return reject()
            if (! (el[this.groupOfType.name])) return skip()
            if ((el.mixins.get(this.groupOfType.name)).ungrouped) return skip()
        })
    }
}

export class Selectable extends Mixin {
    boot({ options }) {
        // For some reason this won't work as a public property on the class...
        this.groupedByType = SelectableGroup

        options({
            ungrouped: false,
            togglable: false,
            value: undefined,
            label: undefined,
            selectedInitially: false,
            dataAttr: 'data-selected',
            ariaAttr: 'aria-selected',
        })

        this.ungrouped = this.options().ungrouped

        this.value = this.options().value === undefined
            ? this.el.value
            : this.options().value

        this.value = this.value + ''

        this.label = this.options().label

        let state = this.options().selectedInitially

        if (this.group()) {
            if (this.group().hasValue(this.value)) state = true
        }

        this.multiple = this.hasGroup() ? this.group().options().multiple : false

        this.toggleable = this.options().toggleable || this.multiple

        this.onSelects = []
        this.onUnselects = []
        this.onChanges = []

        if (state) {
            this.select(true)
        } else {
            this.state = state

            this.surgicallyDeselect(true)
        }
    }

    mount() {
        this.el.hasAttribute(this.options().ariaAttr) || setAttribute(this.el, this.options().ariaAttr, 'false')
    }

    onChange(callback) { this.onChanges.push(callback) }

    onSelect(callback) { this.onSelects.push(callback) }

    onUnselect(callback) { this.onUnselects.push(callback) }

    setState(value) {
        value ? this.select() : this.deselect()
    }

    getState() {
        return this.state
    }

    // @todo: depricate in favor of "trigger"...
    press() {
        this.toggleable ? this.toggle() : this.select()
    }

    trigger() {
        this.toggleable ? this.toggle() : this.select()
    }

    toggle() {
        this.isSelected() ? this.deselect() : this.select()
    }

    isSelected() {
        return this.state
    }

    select(silent = false) {
        let changed = ! this.isSelected()

        this.toggleable || this.group()?.deselectOthers(this.el)

        this.state = true
        setAttribute(this.el, this.options().ariaAttr, 'true')
        setAttribute(this.el, this.options().dataAttr, '')

        if (changed) {
            if (! silent) {
                this.onSelects.forEach(i => i())
                this.onChanges.forEach(i => i())
            }

            this.group()?.changed(this, silent)
        }
    }

    surgicallySelect() { // Select without deselecting others or triggering group change events...
        let changed = ! this.isSelected()

        this.state = true
        setAttribute(this.el, this.options().ariaAttr, 'true')
        setAttribute(this.el, this.options().dataAttr, '')

        if (changed) {
            this.onSelects.forEach(i => i())
            this.onChanges.forEach(i => i())
        }
    }

    deselect(notify = true) {
        let changed = this.isSelected()

        this.state = false

        setAttribute(this.el, this.options().ariaAttr, 'false')
        removeAttribute(this.el, this.options().dataAttr)

        if (changed) {
            this.onUnselects.forEach(i => i())
            this.onChanges.forEach(i => i())

            notify && this.group()?.changed(this)
        }
    }

    surgicallyDeselect(silent = false) { // Deselect without triggering group change events...
        let changed = this.isSelected()

        this.state = false

        setAttribute(this.el, this.options().ariaAttr, 'false')
        removeAttribute(this.el, this.options().dataAttr)

        if (changed && ! silent) {
            this.onUnselects.forEach(i => i())
            this.onChanges.forEach(i => i())
        }
    }

    getValue() {
        return this.value
    }

    getLabel() {
        return this.label
    }
}
