import { FocusableGroup, Focusable } from './mixins/focusable.js'
import { element, on, removeAndReleaseAttribute, setAttribute, walker } from './utils.js'
import { Disableable } from './mixins/disableable.js'
import { UIElement } from './element.js'
import { UIOptions } from './options.js'
import { UIMenu } from './menu.js'

class UIToolbar extends UIElement {
    mount() {
        this._focusable = new FocusableGroup(this, { wrap: true })

        this._disableable = new Disableable(this)

        let undoDisableds = []
        this._disableable.onInitAndChange(disabled => {
            if (disabled) {
                setAttribute(this, 'aria-disabled', 'true')
                this.walker().each(el => {
                    if (! el.hasAttribute('disabled')) {
                        setAttribute(el, 'disabled', 'true')
                        setAttribute(el, 'aria-disabled', 'true')

                        undoDisableds.push(() => {
                            removeAndReleaseAttribute(el, 'disabled')
                            removeAndReleaseAttribute(el, 'aria-disabled')
                        })
                    }
                })
            } else {
                removeAndReleaseAttribute(this, 'aria-disabled')
                undoDisableds.forEach(fn => fn())
                undoDisableds = []
            }
        })

        on(this, 'keydown', e => {
            if (['ArrowRight'].includes(e.key)) {
                e.target === this ? this._focusable.focusFirst() : this._focusable.focusNext()
                e.preventDefault(); e.stopPropagation()
            } else if (['ArrowLeft'].includes(e.key)) {
                e.target === this ? this._focusable.focusFirst() : this._focusable.focusPrev()
                e.preventDefault(); e.stopPropagation()
            }
        })

        setAttribute(this, 'role', 'toolbar')

        this.initializeToolbarItems()
    }

    initializeToolbarItems() {
        this.walker().each(el => {
            if (el._disableable) return

            initializeToolbarItem(el)
        })
    }

    walker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UIToolbar) return reject()
            if (el.hasAttribute('popover')) return reject()
            if (el instanceof UIMenu) return reject()
            if (el instanceof UIOptions) return reject()
            if (! ['a', 'button'].includes(el.localName)) return skip()
        })
    }
}

element('toolbar', UIToolbar)

function initializeToolbarItem(el) {
    el._disableable = new Disableable(el)
    el._disabled = el.hasAttribute('disabled')

    let link = el.querySelector('a')
    let button = el

    let target = link || button

    if (el._disabled) {
        setAttribute(target, 'disabled', '')
        setAttribute(target, 'aria-disabled', 'true')
    }

    if (el._disabled) return

    target._focusable = new Focusable(target, { disableable: el._disableable })
}
