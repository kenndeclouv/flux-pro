import { Mixin, MixinGroup } from './mixin.js'

export class Disableable extends Mixin {
    boot({ options }) {
        this.onChanges = []

        Object.defineProperty(this.el, 'disabled', {
            get: () => {
                return this.el.hasAttribute('disabled')
            },

            set: (value) => {
                if (value) {
                    this.el.setAttribute('disabled', '')
                } else {
                    this.el.removeAttribute('disabled')
                }
            },
        })

        if (this.el.hasAttribute('disabled')) {
            this.el.disabled = true
        } else if (this.el.closest('[disabled]')) {
            this.el.disabled = true
        }

        let observer = new MutationObserver(mutations => {
            this.onChanges.forEach(i => i(this.el.disabled))
        })

        observer.observe(this.el, { attributeFilter: ['disabled'] })
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    onInitAndChange(callback) {
        callback(this.el.disabled)

        this.onChanges.push(callback)
    }

    enabled(callback) {
        return (...args) => {
            if (this.el.disabled) return

            return callback(...args)
        }
    }

    disabled(callback) {
        return (...args) => {
            if (! this.el.disabled) return

            return callback(...args)
        }
    }
}
