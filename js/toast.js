import { UIElement } from './element.js'
import { element, on, removeAttribute, setAttribute } from './utils.js'

class UIToast extends UIElement {
    mount() {
        setAttribute(this, 'role', 'status')

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.hideToast()
            }
        })
    }

    showToast(options = {}) {
        let existingToast = this.template().nextElementSibling

        if (existingToast) existingToast.destroyToast()

        let duration = Number(options.duration === undefined ? 5000 : options.duration)

        let slots = options.slots || {}
        let dataset = options.dataset || {}

        let templateEl = this.querySelector('template')

        if (! templateEl) {
            return console.warn('ui-toast: no template element found', this)
        }

        let template = templateEl.content.cloneNode(true).firstElementChild

        template.setAttribute('aria-atomic', 'true')

        Object.entries(slots).forEach(([key, value]) => {
            if ([null, undefined, false].includes(value)) return

            template.querySelectorAll(`slot[name="${key}"]`).forEach(i => {
                i.replaceWith(document.createTextNode(value))
            })
        })

        Object.entries(dataset).forEach(([key, value]) => {
            template.dataset[key] = value
        })

        // Clean out unused slots...
        template.querySelectorAll('slot').forEach(slot => slot.remove())

        let show = () => {
            // We can't make this a <dialog>.show() because it won't appear in front of another .showModal() dialog...
            template.showPopover()
        }

        let hide = () => {
            template._hiding = true

            template.hidePopover()

            if (template.getAnimations().length) { // Only remove from DOM if transition is finished...
                template.addEventListener('transitionend', () => {
                    template.remove()
                }, { once: true })
            } else {
                template.remove()
            }
        }

        this.appendChild(template)

        show()

        template.hideToast = hide

        let hideTimeout = duration !== 0 && setTimeout(() => {
            hide()
        }, duration)

        template.destroyToast = () => {
            hideTimeout && clearTimeout(hideTimeout)

            template.remove()
        }
    }

    hideToast() {
        let toast = this.template().nextElementSibling

        toast && toast.destroyToast()
    }

    template() {
        return this.querySelector('template')
    }
}

element('toast', UIToast)
