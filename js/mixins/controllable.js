import { Mixin } from "./mixin.js"

export class Controllable extends Mixin {
    boot({ options }) {
        this.initialState = this.el.value

        this.getterFunc = () => {}
        this.setterFunc = value => this.initialState = value

        Object.defineProperty(this.el, 'value', {
            get: () => {
                return this.getterFunc()
            },

            set: (value) => {
                this.setterFunc(value)
            },
        })
    }

    initial(callback) {
        callback(this.initialState)
    }

    getter(func) {
        this.getterFunc = func
    }

    setter(func) {
        this.setterFunc = func
    }

    dispatch() {
        this.el.dispatchEvent(new Event('input', {
            bubbles: false,
            cancelable: true,
        }))

        this.el.dispatchEvent(new Event('change', {
            bubbles: false,
            cancelable: true,
        }))
    }
}
