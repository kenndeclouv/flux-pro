import { assignId, element, inject, on, walker, removeAttribute, setAttribute } from './utils.js'
import { UIElement } from './element.js'
import { Controllable } from './mixins/controllable.js'
import { Disclosable } from './mixins/disclosable.js'

class UIDisclosure extends UIElement {
    boot() {
        let button = this.button()
        let details = this.details()

        if (! button) {
            return console.warn('ui-disclosure: no trigger element found', this)
        } else if (! details) {
            return console.warn('ui-disclosure: no panel element found', this)
        }

        this._disabled = this.hasAttribute('disabled')
        this._controllable = new Controllable(this, { disabled: this._disabled })
        details._disclosable = new Disclosable(details)

        this._controllable.initial(initial => initial && details._disclosable.setState(true))
        this._controllable.getter(() => details._disclosable.getState())

        this._controllable.setter(value => details._disclosable.setState(value))
        details._disclosable.onChange(() => {
            this.dispatchEvent(new CustomEvent('lofi-disclosable-change', { bubbles: true }))

            this._controllable.dispatch()
        })

        let refresh = () => {
            if (details._disclosable.getState()) {
                setAttribute(this, 'data-open', '')
                setAttribute(button, 'data-open', '')
                setAttribute(details, 'data-open', '')
            } else {
                removeAttribute(this, 'data-open')
                removeAttribute(button, 'data-open')
                removeAttribute(details, 'data-open')
            }
        }

        details._disclosable.onChange(() => refresh())

        refresh()

        if (! this._disabled) {
            on(button, 'click', e => {
                details._disclosable.setState(! details._disclosable.getState())
            })
        }

        let id = assignId(details, 'disclosure')

        setAttribute(button, 'aria-controls', id)
        setAttribute(button, 'aria-expanded', 'false')

        details._disclosable.onChange(() => {
            details._disclosable.getState()
                ? setAttribute(button, 'aria-expanded', 'true')
                : setAttribute(button, 'aria-expanded', 'false')
        })

        if (this.hasAttribute('open')) {
            details._disclosable.setState(true)
        }
    }

    button() {
        return this.querySelector('button')
    }

    details() {
        return this.lastElementChild
    }
}

class UIDisclosureGroup extends UIElement {
    boot() {
        this.exclusive = this.hasAttribute('exclusive')

        if (this.exclusive) {
            // Close others when a different one opens...
            on(this, 'lofi-disclosable-change', e => {
                if (e.target.localName === 'ui-disclosure' && e.target.value) {
                    this.disclosureWalker().each(el => {
                        if (el === e.target) return

                        el.value = false
                    })
                }
            })
        }
    }

    disclosureWalker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UIDisclosureGroup && el !== this) return reject()
            if (el.localName !== 'ui-disclosure') return reject()
        })
    }
}

inject(({ css }) => css`ui-disclosure { display: block; }`)

element('disclosure', UIDisclosure)
element('disclosure-group', UIDisclosureGroup)
