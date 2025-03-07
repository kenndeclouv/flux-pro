import { assignId, detangle, element, interest, lockScroll, on, removeAttribute, setAttribute } from './utils.js'
import { Controllable } from './mixins/controllable.js'
import { Popoverable } from './mixins/popoverable.js'
import { Anchorable } from './mixins/anchorable.js'
import { UIElement } from './element.js'

class UIDropdown extends UIElement {
    boot() {
        let trigger = this.trigger()
        let overlay = this.overlay()

        if (! trigger) {
            return console.warn('ui-dropdown: no trigger element found', this)
        } else if (! overlay) {
            return console.warn('ui-dropdown: no [popover] overlay found', this)
        }

        this._disabled = this.hasAttribute('disabled')
        this._controllable = new Controllable(this)
        overlay._popoverable = new Popoverable(overlay)
        overlay._anchorable = new Anchorable(overlay, {
            reference: trigger,
            position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
            gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
            offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
        })

        overlay._popoverable.onChange(() => {
            overlay._popoverable.getState()
                ? overlay._anchorable.reposition()
                : overlay._anchorable.cleanup()
        })

        if (['ui-menu', 'ui-context'].includes(overlay.localName)) {
            let { lock, unlock } = lockScroll()

            overlay._popoverable.onChange(() => {
                overlay._popoverable.getState() ? lock() : unlock()
            })
        }

        // Link with controllable...
        this._controllable.initial(initial => overlay._popoverable.setState(initial))
        this._controllable.getter(() => overlay._popoverable.getState())

        let detangled = detangle()

        this._controllable.setter(value => overlay._popoverable.setState(value))
        overlay._popoverable.onChange(detangled(() => this._controllable.dispatch()))

        // Make interactive...
        if (this.hasAttribute('hover')) {
            interest(trigger, overlay, {
                gain() { overlay._popoverable.setState(true) },
                lose() { overlay._popoverable.setState(false) },
                focusable: true
            })
        }

        on(trigger, 'click', () => overlay._popoverable.toggle())

        // Styling attributes...
        if (overlay._popoverable.getState()) {
            setAttribute(this, 'data-open', '')
            setAttribute(trigger, 'data-open', '')
            setAttribute(overlay, 'data-open', '')
        } else {
            removeAttribute(this, 'data-open')
            removeAttribute(trigger, 'data-open')
            removeAttribute(overlay, 'data-open')
        }

        overlay._popoverable.onChange(() => {
            if (overlay._popoverable.getState()) {
                setAttribute(this, 'data-open', '')
                setAttribute(trigger, 'data-open', '')
                setAttribute(overlay, 'data-open', '')
            } else {
                removeAttribute(this, 'data-open')
                removeAttribute(trigger, 'data-open')
                removeAttribute(overlay, 'data-open')
            }
        })

        // Accessibility attributes...
        let id = assignId(overlay, 'dropdown')

        setAttribute(trigger, 'aria-haspopup', 'true')
        setAttribute(trigger, 'aria-controls', id)

        setAttribute(trigger, 'aria-expanded', overlay._popoverable.getState() ? 'true' : 'false')
        overlay._popoverable.onChange(() => {
            setAttribute(trigger, 'aria-expanded', overlay._popoverable.getState() ? 'true' : 'false')
        })

        // Delegate things like stealing focus...
        overlay._popoverable.onChange(() => {
            overlay._popoverable.getState()
                ? overlay.onPopoverShow?.()
                : overlay.onPopoverHide?.()
        })
    }

    trigger() {
        return this.querySelector('button')
    }

    overlay() {
        return this.lastElementChild?.matches('[popover]') && this.lastElementChild
    }
}

element('dropdown', UIDropdown)
