import { Mixin } from './mixin.js'

export class Dialogable extends Mixin {
    boot({ options }) {
        options({
            clickOutside: true,
        })

        this.onChanges = []

        this.state = false

        // dialog only fires a "close" event (not open), so we need to
        // watch for the "open" attribute being added/removed...
        let observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName !== 'open') return

                this.el.hasAttribute('open')
                    ? this.state = true
                    : this.state = false
                })

                this.onChanges.forEach(i => i())
        })

        observer.observe(this.el, { attributeFilter: ['open'] })

        if (this.options().clickOutside) {
            // Clicking outside the dialog should close it...
            this.el.addEventListener('click', e => {
                // Clicking the ::backdrop pseudo-element is treated the same as clicking the <dialog> element itself
                // Therefore, we can dissregard clicks on any element other than the <dialog> element itself...
                if (e.target !== this.el) return

                // Again, because we can't listen for clicks on ::backdrop, we have to test for intersection
                // between the click and the visible parts of the dialog elements...
                if (clickHappenedOutside(this.el, e)) {
                    this.cancel()

                    e.preventDefault(); e.stopPropagation()
                }
            })
        }

        if (this.el.hasAttribute('open')) {
            this.state = true
            this.hide()
            this.show()
        }
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    show() {
        this.el.showModal()
    }

    hide() {
        this.el.close()
    }

    cancel() {
        // Dispatch a `cancel` event that simulates the cancel event that is dispatched by the
        // `dialog` element when escape is pressed. The native cancel event does not bubble
        // but it can be cancelled...
        let event = new Event('cancel', { bubbles: false, cancelable: true })

        this.el.dispatchEvent(event)

        if (! event.defaultPrevented) {
            this.hide()
        }
    }

    getState() {
        return this.state
    }

    setState(value) {
        value ? this.show() : this.hide()
    }
}

function clickHappenedOutside(el, event) {
    let rect = el.getBoundingClientRect()

    let x = event.clientX
    let y = event.clientY

    let isInside =
        x >= rect.left && x <= rect.right &&
        y >= rect.top  && y <= rect.bottom

    return ! isInside
}
