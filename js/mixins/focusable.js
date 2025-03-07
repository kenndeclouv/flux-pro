import { MixinGroup, Mixin } from './mixin.js'
import { isFocusable, isUsingKeyboard, removeAttribute, setAttribute, walker } from '../utils.js'

export class FocusableGroup extends MixinGroup {
    groupOfType = Focusable

    boot({ options }) {
        options({ wrap: false, ensureTabbable: true })
    }

    mount() {
        this.options().ensureTabbable && this.ensureTabbable()
    }

    focusFirst() {
        let target

        target = target || this.walker().find(i => i.hasAttribute('autofocus'))
        target = target || this.walker().find(i => i.getAttribute('tabindex') === '0')
        target = target || this.walker().find(i => i.getAttribute('tabindex') === '-1')
        target = target || this.walker().find(i => isFocusable(i))

        target?.focus()
    }

    focusPrev() {
        this.moveFocus(from => {
            return this.options().wrap
                ? this.walker().prevOrLast(from)
                : this.walker().prev(from)
        })
    }

    focusNext() {
        this.moveFocus(from => {
            return this.options().wrap
                ? this.walker().nextOrFirst(from)
                : this.walker().next(from)
        })
    }

    focusBySearch(query) {
        let found = this.walker().find(i => i.textContent.toLowerCase().trim().startsWith(query.toLowerCase()))

        found?.use(Focusable).tabbable()
        found?.use(Focusable).focus()
    }

    moveFocus(callback) {
        let tabbable = this.walker().find(i => i.use(Focusable).isTabbable())

        let to = callback(tabbable)

        to?.use(Focusable).focus()
    }

    ensureTabbable() {
        this.walker().findOrFirst(el => {
            el.use(Focusable).isTabbable()
        })?.use(Focusable).tabbable()
    }

    wipeTabbables() {
        this.walker().each(el => {
            el.use(Focusable).untabbable()
        })
    }

    untabbleOthers(except) {
        this.walker().each(el => {
            if (el === except) return

            el.use(Focusable).untabbable()
        })
    }

    walker() {
        return walker(this.el, (el, { skip, reject }) => {
            if (el[this.constructor.name] && el !== this.el) return reject()
            if (! (el[this.groupOfType.name])) return skip()
            if (el.hasAttribute('disabled')) return reject()
        })
    }
}

export class Focusable extends Mixin {
    groupedByType = FocusableGroup

    boot({ options }) {
        options({ hover: false, disableable: null, tabbable: false, tabbableAttr: null })
    }

    mount() {
        let disableable = this.options().disableable

        if (! disableable) throw 'Focusable requires a Disableable instance...'

        if (! this.el.hasAttribute('tabindex')) {
            this.options().tabbable ? this.tabbable() : this.untabbable()
        }

        // Not sure this was here...
        // Enabling it makes all click-downs show a focus ring when they shouldn't...
        // this.on('pointerdown', e => {
            // this.el.focus()
        // })

        // Prevent a mousedown from "focusing" in Chrome (wait for full click)...
        // this.on('mousedown', e => e.preventDefault())

        // Move focus when tabbing through, but prevent recursion with pausing...
        this.pauseFocusListener = this.on('focus', disableable.enabled(() => {
            this.focus(false)
        })).pause

        this.on('focus', disableable.enabled(() => {
            isUsingKeyboard() && setAttribute(this.el, 'data-focus', '')
        }))

        this.on('blur', disableable.enabled(() => {
            removeAttribute(this.el, 'data-focus')
        }))

        this.options().hover && this.on('pointerenter', disableable.enabled(() => {
            this.group()?.untabbleOthers(this.el)

            this.tabbable()
        }))

        this.options().hover && this.on('pointerleave', disableable.enabled(e => {
            this.untabbable()
        }))
    }

    focus(focusProgramatically = true) {
        this.group()?.untabbleOthers(this.el)

        this.tabbable()

        focusProgramatically && this.pauseFocusListener(() => {
            this.el.focus({ focusVisible: false })
        })
    }

    tabbable() {
        setAttribute(this.el, 'tabindex', '0')
        this.options().tabbableAttr && setAttribute(this.el, this.options().tabbableAttr, '')
    }

    untabbable() {
        setAttribute(this.el, 'tabindex', '-1')
        this.options().tabbableAttr && removeAttribute(this.el, this.options().tabbableAttr)
    }

    isTabbable() {
        return this.el.getAttribute('tabindex') === '0'
    }
}
