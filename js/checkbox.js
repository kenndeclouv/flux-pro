import { detangle, element, inject, on, removeAttribute, setAttribute, walker } from './utils.js'
import { Selectable, SelectableGroup } from './mixins/selectable.js'
import { Controllable } from './mixins/controllable.js'
import { Disableable } from './mixins/disableable.js'
import { UIControl } from './element.js'

class UICheckboxGroup extends UIControl {
    boot() {
        this._disableable = new Disableable(this)

        let undoDisableds = []
        this._disableable.onInitAndChange(disabled => {
            if (disabled) {
                this.walker().each(el => {
                    if (! el.hasAttribute('disabled')) {
                        el.setAttribute('disabled', '')
                        undoDisableds.push(() => el.removeAttribute('disabled'))
                    }
                })
            } else {
                undoDisableds.forEach(fn => fn())
                undoDisableds = []
            }
        })

        this._selectable = new SelectableGroup(this, { multiple: true })
        this._controllable = new Controllable(this, { disabled: this._disabled })

        this._controllable.initial(initial => initial && this._selectable.setState(initial))
        this._controllable.getter(() => this._selectable.getState())

        this._detangled = detangle()

        this._controllable.setter(this._detangled(value => { this._selectable.setState(value) }))
        this._selectable.onChange(this._detangled(() => { this._controllable.dispatch() }))

        setAttribute(this, 'role', 'group')
    }

    initCheckAll(checkAll) {
        let detangled = detangle()

        checkAll._selectable.onChange(detangled(() => {
            if (checkAll.indeterminate) {
                this._selectable.selectAll()
                checkAll.checked = true
                checkAll.indeterminate = false
            } else if (checkAll.checked) {
                this._selectable.selectAll()
                checkAll.checked = true
                checkAll.indeterminate = false
            } else {
                this._selectable.deselectAll()
                checkAll.checked = false
                checkAll.indeterminate = false
            }
        }))

        let setCheckAllIndeterminate = () => {
            if (this._selectable.allAreSelected()) {
                checkAll.indeterminate = false
                checkAll._selectable.select()
            } else if (this._selectable.noneAreSelected()) {
                checkAll.indeterminate = false
                checkAll._selectable.deselect()
            } else {
                checkAll.indeterminate = true
            }
        }

        this._selectable.onChange(detangled(() => {
            setCheckAllIndeterminate()
        }))

        setCheckAllIndeterminate()
    }

    walker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UICheckboxGroup) return reject()
            if (! (el.localName === 'ui-checkbox')) return skip()
        })
    }
}

class UICheckbox extends UIControl {
    boot() {
        let button = this

        this.isIndeterminate = false

        this._disableable = new Disableable(this)

        if (this.hasAttribute('all')) {
            this._selectable = new Selectable(button, {
                ungrouped: true,
                toggleable: true,
                value: this.hasAttribute('value')
                    ? this.getAttribute('value')
                    : Math.random().toString(36).substring(2, 10),
                label: this.hasAttribute('label')
                    ? this.getAttribute('label')
                    : null,
                selectedInitially: this.hasAttribute('checked'),
                dataAttr: 'data-checked',
                ariaAttr: 'aria-checked',
            })

            queueMicrotask(() => { // Delaying this until all checkboxes are mounted...
                this.closest('ui-checkbox-group')?.initCheckAll(this)
            })
        } else {
            this._selectable = new Selectable(button, {
                toggleable: true,
                dataAttr: 'data-checked',
                ariaAttr: 'aria-checked',
                value: this.hasAttribute('value')
                    ? this.getAttribute('value')
                    : Math.random().toString(36).substring(2, 10),
                label: this.hasAttribute('label')
                    ? this.getAttribute('label')
                    : null,
                selectedInitially: this.hasAttribute('checked'),
            })

            this._selectable.onChange(() => {
                if (this.indeterminate) this.indeterminate = false
            })

            // Setting .value statically, because unlike other control inputs, checkboxes
            // have a static value and a dyncamic checked state...
            this.value = this._selectable.getValue()
        }

        this._detangled = detangle()

        this._selectable.onChange(this._detangled(() => {
            // Dispatching these manually because this component doesn't use the controllable mixin...
            this.dispatchEvent(new Event('input', { bubbles: false, cancelable: true, }))
            this.dispatchEvent(new Event('change', { bubbles: false, cancelable: true, }))
        }))

        setAttribute(button, 'role', 'checkbox')

        this._disableable.onInitAndChange(disabled => {
            disabled ? removeAttribute(button, 'tabindex', '0') : setAttribute(button, 'tabindex', '0')
        })

        on(button, 'click', this._disableable.disabled((e) => { e.preventDefault(); e.stopPropagation() }), { capture: true })

        on(button, 'click', this._disableable.enabled((e) => { this._selectable.press() }))
        on(button, 'keydown', this._disableable.enabled((e) => { if (e.key === 'Enter') { this._selectable.press(); e.preventDefault(); e.stopPropagation() }}))
        on(button, 'keydown', this._disableable.enabled((e) => { if (e.key === ' ') { e.preventDefault(); e.stopPropagation() }}))
        on(button, 'keyup', this._disableable.enabled((e) => { if (e.key === ' ') { this._selectable.press(); e.preventDefault(); e.stopPropagation() }}))

        respondToLabelClick(button)
    }

    get checked() {
        return this._selectable.isSelected()
    }

    set checked(value) {
        let groupDetangled = this.closest('ui-checkbox-group')?._detangled || (i => i)

        this._detangled(groupDetangled(() => {
            value ? this._selectable.select() : this._selectable.deselect()
        }))()
    }

    get indeterminate() {
        return this.isIndeterminate
    }

    set indeterminate(value) {
        this.isIndeterminate = !! value

        if (this.isIndeterminate) {
            setAttribute(this, 'data-indeterminate', '')
        } else {
            removeAttribute(this, 'data-indeterminate')
        }
    }
}

element('checkbox-group', UICheckboxGroup)
element('checkbox', UICheckbox)

inject(({ css }) => css`ui-checkbox-group { display: block; user-select: none; }`)
inject(({ css }) => css`ui-checkbox { display: inline-block; user-select: none; }`)

function respondToLabelClick(el) {
    el.closest('label')?.addEventListener('click', (e) => {
        if (! el.contains(e.target)) {
            el._selectable.press()
        }
    })
}
