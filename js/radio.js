import { SelectableGroup, Selectable } from './mixins/selectable.js'
import { FocusableGroup, Focusable } from './mixins/focusable.js'
import { inject, element, on, isUsingKeyboard, removeAttribute, setAttribute, detangle } from './utils.js'
import { Controllable } from './mixins/controllable.js'
import { UIControl } from './element.js'
import { Disableable } from './mixins/disableable.js'

class UIRadioGroup extends UIControl {
    boot() {
        this._selectable = new SelectableGroup(this)
        this._controllable = new Controllable(this, { disabled: this._disabled })
        this._focusable = new FocusableGroup(this, { wrap: true })

        this._controllable.initial(initial => initial && this._selectable.setState(initial))
        this._controllable.getter(() => this._selectable.getState())

        this._detangled = detangle()

        this._controllable.setter(this._detangled(value => { this._selectable.setState(value) }))
        this._selectable.onChange(this._detangled(() => { this._controllable.dispatch() }))

        on(this, 'keydown', e => {
            if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
                this._focusable.focusNext()
                e.preventDefault(); e.stopPropagation()
            } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
                this._focusable.focusPrev()
                e.preventDefault(); e.stopPropagation()
            }
        })

        setAttribute(this, 'role', 'radiogroup')
    }
}

class UIRadio extends UIControl {
    boot() {
        let button = this

        this._disableable = new Disableable(this)

        this._selectable = new Selectable(button, {
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

        this.value = this._selectable.getValue()

        this._selectable.onChange(() => {
            if (this._selectable.isSelected()) this._focusable.focus(false)
        })

        this._disableable.onChange(disabled => {
            if (disabled) {
                this._focusable.untabbable()
            } else {
                this._selectable.isSelected() && this._focusable.tabbable()
            }
        })

        setAttribute(button, 'role', 'radio')

        this._focusable = new Focusable(button, { disableable: this._disableable, tabbableAttr: 'data-active' })

        on(button, 'click', this._disableable.disabled((e) => { e.preventDefault(); e.stopPropagation() }), { capture: true })

        on(button, 'click', this._disableable.enabled((e) => { this._selectable.press() }))
        on(button, 'keydown', this._disableable.enabled((e) => { if (e.key === 'Enter') { this._selectable.press(); e.preventDefault(); e.stopPropagation() }}))
        on(button, 'keydown', this._disableable.enabled((e) => { if (e.key === ' ') { e.preventDefault(); e.stopPropagation() }}))
        on(button, 'keyup', this._disableable.enabled((e) => { if (e.key === ' ') { this._selectable.press(); e.preventDefault(); e.stopPropagation() }}))

        respondToLabelClick(button)

        on(button, 'focus', e => {
            isUsingKeyboard() && this._selectable.select() // Selection follows focus...
        })
    }

    get checked() {
        return this._selectable.isSelected()
    }

    set checked(value) {
        let detangled = this.closest('ui-radio-group')?._detangled || (() => {})

        detangled(() => {
            value && this._selectable.select()
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

inject(({ css }) => css`ui-radio-group { display: block; }`)
inject(({ css }) => css`ui-radio { display: inline-block; user-select: none; }`)

element('radio-group', UIRadioGroup)
element('radio', UIRadio)
