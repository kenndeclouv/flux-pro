import { on, setAttribute } from '../utils.js'
import { Mixin } from './mixin.js'

let currentlyOpenPopoversByScope = new Map

export class Popoverable extends Mixin {
    boot({ options }) {
        options({ trigger: null, scope: null })

        let scope = this.options().scope || 'global'

        setAttribute(this.el, 'popover', 'manual')

        this.trigger = this.options().trigger
        this.onChanges = []
        this.state = false

        on(this.el, 'beforetoggle', e => {
            let oldState = this.state

            this.state = e.newState === 'open'

            if (this.state) {
                closeOtherOpenPopovers(this.el, scope)

                let controller = new AbortController()
                let trigger = document.activeElement

                // setTimeout is here because otherwise, these listeners would immediately fire as the click events are still bubbling up...
                setTimeout(() => {
                    closeOnClickOutside(this.el, trigger, controller)
                    closeOnFocusAway(this.el, trigger, controller)
                    closeOnEscape(this.el, trigger, controller)
                })

                // "focus back" the trigger button anytime the popover is closed...
                this.el.addEventListener('beforetoggle', e => {
                    if (e.newState === 'closed') {
                        controller.abort()
                        trigger.focus()
                    }
                }, { signal: controller.signal })
            }

            if (oldState !== this.state) {
                this.onChanges.forEach(i => i(this.state, oldState))
            }
        })

        on(this.el, 'toggle', e => {
            if (e.newState === 'open') {
                if (! currentlyOpenPopoversByScope.has(scope)) {
                    currentlyOpenPopoversByScope.set(scope, new Set)
                }

                currentlyOpenPopoversByScope.get(scope).add(this.el)
            } else if (e.newState === 'closed') {
                if (! currentlyOpenPopoversByScope.has(scope)) return

                currentlyOpenPopoversByScope.get(scope).delete(this.el)

                if (currentlyOpenPopoversByScope.get(scope).size === 0) {
                    currentlyOpenPopoversByScope.delete(scope)
                }
            }
        })
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    setState(value) {
        value ? this.show() : this.hide()
    }

    getState() {
        return this.state
    }

    toggle() {
        this.el.togglePopover()
    }

    show() {
        this.el.showPopover()
    }

    hide() {
        this.el.hidePopover()
    }
}

function closeOtherOpenPopovers(el, scope) {
    // Close other open popovers...
    if (! currentlyOpenPopoversByScope.has(scope)) return

    currentlyOpenPopoversByScope.get(scope).forEach(popoverEl => {
        if (el.contains(popoverEl) || popoverEl.contains(el)) return

        popoverEl.hidePopover()
    })
}

function closeOnClickOutside(el, except, controller) {
    document.addEventListener('click', e => {
        if (el.contains(e.target) || except === e.target) return

        el.hidePopover()
    }, { signal: controller.signal })

}

function closeOnFocusAway(el, except, controller) {
    document.addEventListener('focusin', e => {
        if (el.contains(e.target) || except === e.target) return

        // This prevents the normal "focusback" behavior so that focus can continue on to the next element...
        controller.abort()

        el.hidePopover()
    }, {
        // Without "capture: true", when you focus away from the popover onto an element that triggers a popover
        // on focus (a tooltip), it will focus back this popover's trigger instead of keeping focus on the tooltip button.
        // It does this because only one popover can be open at a time, so focusing the tooltip, opens a popover, closing this one,
        // which will trigger the "focus back" behavior.
        capture: true,
        signal: controller.signal,
    })
}

function closeOnEscape(el, except, controller) {
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return

        el.hidePopover()
    }, { signal: controller.signal })
}
