import { Controllable } from './mixins/controllable.js'
import { Dialogable } from './mixins/dialogable.js'
import { UIElement } from './element.js'
import { detangle, element, lockScroll, on, removeAttribute, setAttribute } from './utils.js'

class UIModal extends UIElement {
    boot() {
        this._controllable = new Controllable(this, { disabled: this.hasAttribute('disabled') })

        let button = this.button()

        let dialog = this.dialog()

        if (! dialog) return

        dialog._dialogable = new Dialogable(dialog, {
            clickOutside: ! this.hasAttribute('disable-click-outside'),
        })

        this._controllable.initial(initial => initial && dialog._dialogable.show())
        this._controllable.getter(() => dialog._dialogable.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { dialog._dialogable.setState(value) }))
        dialog._dialogable.onChange(detangled(() => { this._controllable.dispatch() }))

        let refresh = () => {
            if (dialog._dialogable.getState()) {
                setAttribute(this, 'data-open', '')
                button?.setAttribute('data-open', '')
                setAttribute(dialog, 'data-open', '')
            } else {
                removeAttribute(this, 'data-open')
                button?.removeAttribute('data-open')
                removeAttribute(dialog, 'data-open')
            }
        }

        dialog._dialogable.onChange(() => refresh())

        refresh()

        let { lock, unlock } = lockScroll()

        dialog._dialogable.onChange(() => {
            dialog._dialogable.getState() ? lock() : unlock()
        })

        button && on(button, 'click', e => {
            dialog._dialogable.show()
        })
    }

    button() {
        let button = this.querySelector('button')
        let dialog = this.dialog()

        if (dialog?.contains(button)) return

        return button
    }

    dialog() {
        return this.querySelector('dialog')
    }

    showModal() { // Forward calls to .showModal()...
        let dialog = this.dialog()

        if (! dialog) return

        dialog.showModal()
    }
}

class UIClose extends UIElement {
    mount() {
        let button = this.querySelector('button')

        on(button, 'click', e => {
            this.closest('ui-modal')?.dialog()._dialogable.hide()
        })
    }
}

element('modal', UIModal)
element('close', UIClose)
