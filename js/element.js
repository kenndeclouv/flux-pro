import { on } from "./utils.js"

export class UIElement extends HTMLElement {
    constructor() {
        super()

        this.boot?.()
    }

    connectedCallback() {
        queueMicrotask(() => {
            this.mount?.()
        })
    }

    mixin(func, options = {}) {
        return new func(this, options)
    }

    // @todo: this is redundant now...
    appendMixin(func, options = {}) {
        return new func(this, options)
    }

    use(func) {
        let found

        this.mixins.forEach(mixin => {
            if (mixin instanceof func) found = mixin
        })

        return found
    }

    uses(func) {
        let found

        this.mixins.forEach(mixin => {
            if (mixin instanceof func) found = true
        })

        return !! found
    }

    on(event, handler) {
        return on(this, event, handler)
    }

    root(name, attributes = {}) {
        if (name === undefined) return this.__root

        let el = document.createElement(name)

        for (let name in attributes) {
            setAttribute(el, name, attributes[name])
        }

        let shadow = this.attachShadow({ mode: 'open' })
        el.appendChild(document.createElement('slot'))
        shadow.appendChild(el)

        this.__root = el

        return this.__root
    }
}

export class UIControl extends UIElement {
    //
}

