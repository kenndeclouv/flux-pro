import { UIElement } from "../element.js"
import { assert, closest, walker, on } from "../utils.js"

export class Mixin {
    constructor(el, options = {}) {
        this.el = el

        this.grouped = options.grouped === undefined ? true : false

        this.el.mixins = this.el.mixins ? this.el.mixins : new Map

        this.el.mixins.set(this.constructor.name, this)

        this.el[this.constructor.name] = true

        if (! this.el.use) this.el.use = UIElement.prototype.use.bind(this.el)

        this.opts = options

        this.boot?.({
            options: (defaults) => {
                let options = defaults

                Object.entries(this.opts).forEach(([key, value]) => {
                    if (value !== undefined) {
                        options[key] = value
                    }
                })

                this.opts = options
            },
        })

        queueMicrotask(() => {
            this.mount?.()
        })
    }

    options() {
        return this.opts
    }

    hasGroup() {
        return !! this.group()
    }

    group() {
        if (this.grouped === false) return

        return closest(this.el, i => i[this.groupedByType.name])?.use(this.groupedByType)
    }

    on(event, handler) {
        return on(this.el, event, handler)
    }
}

export class MixinGroup extends Mixin {
    constructor(el, options = {}) {
        super(el, options)
    }

    walker() {
        return walker(this.el, (el, { skip, reject }) => {
            if (el[this.constructor.name] && el !== this.el) return reject()
            if (! (el[this.groupOfType.name])) return skip()
            if (! (el.mixins.get(this.groupOfType.name)).grouped) return skip()
        })
    }
}
