import { assignId, element, inject, interest, on, search, setAttribute, walker, detangle } from './utils.js'
import { SelectableGroup, Selectable } from './mixins/selectable.js'
import { FocusableGroup, Focusable } from './mixins/focusable.js'
import { Controllable } from './mixins/controllable.js'
import { Popoverable } from './mixins/popoverable.js'
import { Disableable } from './mixins/disableable.js'
import { Anchorable } from './mixins/anchorable.js'
import { UIElement } from './element.js'
import { UISelect } from './select.js'

export class UIMenu extends UIElement {
    boot() {
        this._focusable = new FocusableGroup(this, { wrap: false, ensureTabbable: false })

        on(this, 'keydown', e => {
            if (['ArrowDown'].includes(e.key)) {
                e.target === this ? this._focusable.focusFirst() : this._focusable.focusNext()
                e.preventDefault(); e.stopPropagation()
            } else if (['ArrowUp'].includes(e.key)) {
                e.target === this ? this._focusable.focusFirst() : this._focusable.focusPrev()
                e.preventDefault(); e.stopPropagation()
            }
        })

        search(this, query => this._focusable.focusBySearch(query))

        if (this.hasAttribute('popover')) {
            this.addEventListener('lofi-close-popovers', () => {
                // This is delayed so that users can see a selection apear before closing...
                setTimeout(() => this.hidePopover(), 50)
            })
        }

        if (this.parentElement.localName === 'ui-dropdown') {
            let dropdown = this.parentElement

            on(dropdown.trigger(), 'keydown', e => {
                if (e.key === 'ArrowDown'){
                    this.fromArrowDown = true
                    this.showPopover()
                    e.preventDefault(); e.stopPropagation()
                }
            })
        }

        setAttribute(this, 'role', 'menu')
        setAttribute(this, 'tabindex', '-1')
    }

    mount() {
        this.initializeMenuItems()

        let observer = new MutationObserver(mutations => {
            this.initializeMenuItems()
        })

        observer.observe(this, { childList: true, subtree: true })
    }

    onPopoverShow() {
        queueMicrotask(() => {
            if (this.fromArrowDown) {
                this._focusable.focusFirst()

                this.fromArrowDown = false
            } else {
                this.focus()
            }
        })
    }

    onPopoverHide() {
        this._focusable.wipeTabbables()
    }

    initializeMenuItems() {
        this.walker().each(el => {
            if (el._disableable) return

            initializeMenuItem(el)
        })
    }

    walker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UIMenu) return reject()
            if (el instanceof UISelect) return reject()
            if (! ['a', 'button'].includes(el.localName)) return skip()
        })
    }
}

class UISubmenu extends UIElement {
    boot() {
        //
    }
}

class UIMenuCheckbox extends UIElement {
    boot() {
        this._disabled = this.hasAttribute('disabled')
        this._disableable = new Disableable(this)

        let button = this

        if (this._disabled) {
            setAttribute(button, 'disabled', '')
            setAttribute(button, 'aria-disabled', 'true')
        }

        assignId(button, 'menu-checkbox')

        setAttribute(button, 'role', 'menuitemcheckbox')

        if (this._disabled) return

        button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: 'data-active' })
        button._selectable = new Selectable(button, {
            toggleable: true,
            value: this.hasAttribute('value') ? this.getAttribute('value') : button.textContent.trim(),
            label: this.hasAttribute('label') ? this.getAttribute('label') : button.textContent.trim(),
            dataAttr: 'data-checked',
            ariaAttr: 'aria-checked',
            selectedInitially: this.hasAttribute('checked'),
        })
        this._controllable = new Controllable(this)

        this._controllable.initial(initial => initial && button._selectable.setState(initial))
        this._controllable.getter(() => button._selectable.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { this._selectable.setState(value) }))
        this._selectable.onChange(detangled(() => { this._controllable.dispatch() }))

        on(button, 'click', () => {
            this.dispatchEvent(new CustomEvent('lofi-close-popovers', { bubbles: true }))

            button._selectable.press()
        })

        respondToKeyboardClick(button)
    }
}

class UIMenuRadio extends UIElement {
    boot() {
        this._disabled = this.hasAttribute('disabled')
        this._disableable = new Disableable(this)

        let button = this

        if (this._disabled) {
            setAttribute(button, 'disabled', '')
            setAttribute(button, 'aria-disabled', 'true')
        }

        assignId(button, 'menu-radio')

        setAttribute(button, 'role', 'menuitemradio')

        if (this._disabled) return

        button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: 'data-active' })
        button._selectable = new Selectable(button, {
            toggleable: false,
            value: this.hasAttribute('value') ? this.getAttribute('value') : button.textContent.trim(),
            label: this.hasAttribute('label') ? this.getAttribute('label') : button.textContent.trim(),
            dataAttr: 'data-checked',
            ariaAttr: 'aria-checked',
            selectedInitially: this.hasAttribute('checked'),
        })

        on(button, 'click', () => {
            this.dispatchEvent(new CustomEvent('lofi-close-popovers', { bubbles: true }))
            button._selectable.press()
        })

        respondToKeyboardClick(button)
    }
}

class UIMenuRadioGroup extends UIElement {
    boot() {
        this._selectable = new SelectableGroup(this)
        this._controllable = new Controllable(this)

        setAttribute(this, 'role', 'group')

        this._controllable.initial(initial => initial && this._selectable.setState(initial))
        this._controllable.getter(() => this._selectable.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { this._selectable.setState(value) }))
        this._selectable.onChange(detangled(() => { this._controllable.dispatch() }))
    }
}

class UIMenuCheckboxGroup extends UIElement {
    boot() {
        this._selectable = new SelectableGroup(this, { multiple: true })
        this._controllable = new Controllable(this)

        setAttribute(this, 'role', 'group')

        this._controllable.initial(initial => initial && this._selectable.setState(initial))
        this._controllable.getter(() => this._selectable.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { this._selectable.setState(value) }))
        this._selectable.onChange(detangled(() => { this._controllable.dispatch() }))
    }
}

inject(({ css }) => css`ui-menu[popover]:popover-open { display: block; }`)
inject(({ css }) => css`ui-menu[popover].\:popover-open { display: block; }`) // For popover polyfill...
inject(({ css }) => css`ui-menu-checkbox, ui-menu-radio { cursor: default; display: contents; }`)

element('menu', UIMenu)
element('submenu', UISubmenu)
element('menu-checkbox', UIMenuCheckbox)
element('menu-radio', UIMenuRadio)
element('menu-radio-group', UIMenuRadioGroup)
element('menu-checkbox-group', UIMenuCheckboxGroup)

function respondToKeyboardClick(el) {
    on(el, 'keydown', (e) => { if (e.key === 'Enter') { el.click(); e.preventDefault(); e.stopPropagation() }})
    on(el, 'keydown', (e) => { if (e.key === ' ') { e.preventDefault(); e.stopPropagation() }})
    on(el, 'keyup', (e) => { if (e.key === ' ') { el.click(); e.preventDefault(); e.stopPropagation() }})
}

function initializeMenuItem(el) {
    el._disableable = new Disableable(el)
    el._disabled = el.hasAttribute('disabled')

    let link = el.querySelector('a')
    let button = el
    let submenu = el.parentElement.matches('ui-submenu') && el.parentElement.querySelector('ui-menu[popover]')

    let target = link || button

    if (el._disabled) {
        setAttribute(target, 'disabled', '')
        setAttribute(target, 'aria-disabled', 'true')
    }

    assignId(target, 'menu-item')

    setAttribute(target, 'role', 'menuitem')

    if (el._disabled) return

    target._focusable = new Focusable(target, { disableable: el._disableable, hover: true, tabbableAttr: 'data-active' })

    if (! submenu) {
        el.hasAttribute('disabled') || on(el, 'click', () => {
            el.dispatchEvent(new CustomEvent('lofi-close-popovers', { bubbles: true }))
        })

        respondToKeyboardClick(button)
    } else { // Submenu treatment...
        submenu._popoverable = new Popoverable(submenu, { trigger: button })
        submenu._anchorable = new Anchorable(submenu, {
            reference: button,
            position: submenu.hasAttribute('position') ? submenu.getAttribute('position') : 'right start',
            gap: submenu.hasAttribute('gap') ? submenu.getAttribute('gap') : '-5',
        })

        button.addEventListener('click', e => {
            submenu._popoverable.setState(true)
        })

        let { clear } = interest(button, submenu, {
            gain() { submenu._popoverable.setState(true) },
            lose() { submenu._popoverable.setState(false) },
            focusable: false,
        })

        submenu._popoverable.onChange(() => {
            if (! submenu._popoverable.getState()) {
                clear()
                submenu._focusable.wipeTabbables()
            }

            submenu._anchorable.reposition()
        })

        on(button, 'keydown', e => {
            if (e.key === 'Enter') {
                submenu._popoverable.setState(true)
                // This set timeout fixes an obscure bug with [popover]:
                // Without it, "getBoundingClientRect" returns the wrong value for the
                // submenu trigger, so floadingUI get's tripped up and positions the submenu in a wonky way...
                setTimeout(() => submenu._focusable.focusFirst())
            }
        })

        on(button, 'keydown', e => {
            if (e.key === 'ArrowRight') {
                submenu._popoverable.setState(true)
                setTimeout(() => submenu._focusable.focusFirst())
            }
        })

        on(submenu, 'keydown', e => {
            if (e.key === 'ArrowLeft') {
                submenu._popoverable.setState(false)
                button.focus()
                e.stopPropagation()
            }
        })
    }
}
