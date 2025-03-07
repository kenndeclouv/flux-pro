import { assignId, element, inject, on, setAttribute, walker } from './utils.js'
import { UIControl, UIElement } from './element.js'

class UIField extends UIElement {
    mount() {
        this.control = this.fieldWalker().find(el => this.isControl(el))

        if (! this.control) return
    }

    associateLabelWithControl(control) {
        if (! control) return
        if (! this.label) return

        this.control = control

        if (this.control.hasAttribute('aria-labelledby')) return

        setAttribute(this.elOrButton(this.control), 'aria-labelledby', this.label.id)

        // Mark native inputs disabled...
        if (this.control && ! (this.control instanceof UIControl) && this.hasAttribute('disabled')) {
            this.control.setAttribute('disabled', '')
        }
    }

    associateDescriptionWithControl(control) {
        if (! control) return
        if (! this.description) return

        this.control = control

        if (this.control.hasAttribute('aria-describedby')) return

        setAttribute(this.elOrButton(this.control), 'aria-describedby', this.description.id)
    }

    associateLabel(label) {
        this.label = label

        on(label, 'click', e => {
            if (['a', 'button'].includes(e.target.localName)) return

            this.focusOrTogggle(this.control)
        })

        this.control && this.associateLabelWithControl(this.control)
    }

    associateDescription(description) {
        this.description = description

        this.control && this.associateDescriptionWithControl(this.control)
    }

    fieldWalker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UIField && el !== this) return reject()
            if (el.parentElement.localName === 'ui-editor' && el !== this) return reject()
        })
    }

    isControl(el) {
        if (el instanceof UIControl) return true

        if (el.matches('input, textarea, select')) return true

        return false
    }

    focusOrTogggle(control) {
        if (! control) return
        if (control.disabled || control.hasAttribute('disabled')) return

        let isCheckable = (control.localName === 'input' && ['checkbox', 'radio'].includes(control.type))
            || ['ui-switch', 'ui-radio', 'ui-checkbox'].includes(control.localName)

        if (isCheckable) {
            control.click()
            control.focus()
        } else if (control.localName === 'input' && ['file'].includes(control.type)) {
            control.click()
        } else if (['ui-select'].includes(control.localName)) {
            control.trigger().focus()
        } else if (['ui-editor'].includes(control.localName)) {
            control.focus()
        } else {
            control.focus()
        }
    }

    elOrButton(el) {
        if (el instanceof UIElement && el.firstElementChild instanceof HTMLButtonElement) return el.firstElementChild
        return el
    }
}

class UILabel extends UIElement {
    mount() {
        assignId(this, 'label')
        setAttribute(this, 'aria-hidden', 'true')
        this.closest('ui-field')?.associateLabel(this)
    }
}

class UIDescription extends UIElement {
    mount() {
        assignId(this, 'description')
        setAttribute(this, 'aria-hidden', 'true')
        this.closest('ui-field')?.associateDescription(this)
    }
}

inject(({ css }) => css`
    ui-label { display: inline-block; cursor: default; user-select: none; }
    ui-description { display: block; }
`)

element('field', UIField)
element('label', UILabel)
element('description', UIDescription)
