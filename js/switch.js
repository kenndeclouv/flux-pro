import { Controllable } from './mixins/controllable.js'
import { Selectable } from './mixins/selectable.js'
import { Focusable } from './mixins/focusable.js'
import { UIControl } from './element.js'
import { detangle, element, inject, on, removeAttribute, setAttribute } from './utils.js'
import { Disableable } from './mixins/disableable.js'

class UISwitch extends UIControl {
    boot() {
        let button = this

        this._disableable = new Disableable(this)

        this._selectable = new Selectable(button, {
            toggleable: true,
            dataAttr: 'data-checked',
            ariaAttr: 'aria-checked',
            value: this.hasAttribute('value')
                ? this.getAttribute('value')
                : null,
            label: this.hasAttribute('label')
                ? this.getAttribute('label')
                : null,
            selectedInitially: this.hasAttribute('checked'),
        })

        // Setting .value statically, because unlike other control inputs, checkboxes
        // have a static value and a dyncamic checked state...
        this.value = this._selectable.getValue()

        this._detangled = detangle()

        this._selectable.onChange(this._detangled(() => {
            // Dispatching these manually because this component doesn't use the controllable mixin...
            this.dispatchEvent(new Event('input', { bubbles: false, cancelable: true, }))
            this.dispatchEvent(new Event('change', { bubbles: false, cancelable: true, }))
        }))

        setAttribute(button, 'role', 'switch')

        if (this.hasAttribute('name')) {
            let name = this.getAttribute('name')

            let input = document.createElement('input')
            input.type = 'hidden'
            input.name = name
            input.value = this._selectable.getState()

            this.appendChild(input)

            this._selectable.onChange(() => {
                input.value = this._selectable.getState()
            })
        }

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
        this._detangled(() => {
            value ? this._selectable.select() : this._selectable.deselect()
        })()
    }
}

function respondToLabelClick(el) {
    el.closest('label')?.addEventListener('click', (e) => {
        if (! el.contains(e.target)) {
            el.click()
        }
    })
}

inject(({ css }) => css`ui-switch { display: inline-block; user-select: none; }`)

element('switch', UISwitch)
