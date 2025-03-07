import { assignId, detangle, element, inject, lockScroll, on, removeAttribute, search, setAttribute } from './utils.js'
import { ActivatableGroup } from './mixins/activatable.js'
import { SelectableGroup } from './mixins/selectable.js'
import { FilterableGroup } from './mixins/filterable.js'
import { Controllable } from './mixins/controllable.js'
import { Popoverable } from './mixins/popoverable.js'
import { Disableable } from './mixins/disableable.js'
import { Anchorable } from './mixins/anchorable.js'
import { UIControl, UIElement } from './element.js'
import { UISelected } from './selected.js'

export class UISelect extends UIControl {
    boot() {
        let list = this.list()

        this._controllable = new Controllable(this)
        this._selectable = new SelectableGroup(list, {
            multiple: this.hasAttribute('multiple')
        })

        this._controllable.initial(initial => initial && this._selectable.setState(initial))
        this._controllable.getter(() => this._selectable.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { this._selectable.setState(value) }))

        this._selectable.onChange(detangled(() => {
            this._controllable.dispatch()

            this.dispatchEvent(new CustomEvent('select', { bubbles: false }))
        }))
    }

    mount() {
        this._disableable = new Disableable(this)

        let input = this.input()
        let button = this.button()
        let list = this.list()
        let multiple = this.hasAttribute('multiple')
        let autocomplete = this.hasAttribute('autocomplete')
        let strictAutocomplete = this.hasAttribute('autocomplete') && this.getAttribute('autocomplete').trim().split(' ').includes('strict')

        let listbox = this.querySelector('ui-options') || this

        let listId = initListbox(listbox, 'options')

        this._activatable = new ActivatableGroup(listbox, { filter: 'data-hidden' })

        // Handle control...

        if (! input && ! button) { // This is the static listbox...
            this._disableable.onInitAndChange((disabled) => {
                disabled ? this.removeAttribute('tabindex') : this.setAttribute('tabindex', '0')
            })
        }

        if (this.hasAttribute('filter') && this.getAttribute('filter') !== 'manual') {
            this._filterable = new FilterableGroup(list)

            this._filterable.onChange(() => {
                this._activatable.clearActive()

                if (this._filterable.hasResults()) {
                    this._activatable.activateFirst()
                }
            })

            this.addEventListener('close', () => {
                if (this._filterable) {
                    this._filterable.filter('')
                }
            })
        }

        let popoverEl = this.querySelector('[popover]:not(ui-tooltip > [popover])')
        let popoverInputEl = popoverEl?.querySelector('input')

        let inputEl = this.querySelector('input')
        inputEl = popoverEl?.contains(inputEl) ? null : inputEl

        let buttonEl = this.querySelector('button')
        buttonEl = popoverEl?.contains(buttonEl) ? null : buttonEl

        // Handle the different select shapes...
        if (! (popoverEl || inputEl)) { // static listbox...
            handleKeyboardNavigation(this, this._activatable)
            handleKeyboardSelection(this, this, this._activatable)
            handleActivationOnFocus(this, this._activatable, this._selectable)
        } else if (! popoverEl && inputEl) { // static listbox with input control
            let input = inputEl

            this._disableable.onInitAndChange((disabled) => {
                if (disabled) {
                    input && setAttribute(input, 'disabled', '')
                } else {
                    input && removeAttribute(input, 'disabled')
                }
            })

            handleInputClearing(this, input, this._selectable, this._popoverable)
            handleActivationOnFocus(input, this._activatable, this._selectable)
            handleAutocomplete(autocomplete, strictAutocomplete, this, input, this._selectable, this._popoverable)
            preventInputEventsFromBubblingToSelectRoot(input)
            highlightInputContentsWhenFocused(input)
            this._filterable && filterResultsByInput(input, this._filterable)
            trackActiveDescendant(input, this._activatable)
            handleKeyboardNavigation(input, this._activatable)
            handleKeyboardSelection(this, input, this._activatable)
            handleMouseSelection(this, this._activatable)
        } else if (popoverEl && inputEl) { // popover listbox with input control
            let input = inputEl

            setAttribute(input, 'role', 'combobox')
            setAttribute(input, 'aria-controls', listId)

            let popover = popoverEl

            this._popoverable = new Popoverable(popover)

            this._anchorable = new Anchorable(popover, {
                reference: input,
                matchWidth: true,
                position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
                gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
                offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
            })

            handleAutocomplete(autocomplete, strictAutocomplete, this, input, this._selectable, this._popoverable)

            this._disableable.onInitAndChange((disabled) => {
                if (disabled) {
                    input && setAttribute(input, 'disabled', '')
                } else {
                    input && removeAttribute(input, 'disabled')
                }
            })

            // Register trigger buttons...
            this.querySelectorAll('button').forEach(button => {
                if (popover.contains(button)) return

                setAttribute(button, 'tabindex', '-1')
                setAttribute(button, 'aria-controls', listId)
                setAttribute(button, 'aria-haspopup', 'listbox')
                linkExpandedStateToPopover(button, this._popoverable)
                on(button, 'click', () => {
                    this._popoverable.toggle()
                    input.focus()
                })
            })

            handleInputClearing(this, input, this._selectable, this._popoverable)
            initPopover(this, input, popover, this._popoverable, this._anchorable)
            preventScrollWhenPopoverIsOpen(this, this._popoverable)
            linkExpandedStateToPopover(input, this._popoverable)
            preventInputEventsFromBubblingToSelectRoot(input)
            highlightInputContentsWhenFocused(input)
            this._filterable && filterResultsByInput(input, this._filterable)
            trackActiveDescendant(input, this._activatable)
            controlPopoverWithInput(input, this._popoverable)
            controlPopoverWithKeyboard(input, this._popoverable, this._activatable, this._selectable)
            openPopoverWithMouse(input, this._popoverable)
            handleKeyboardNavigation(input, this._activatable)
            handleKeyboardSelection(this, input, this._activatable)
            handleMouseSelection(this, this._activatable)
            controlActivationWithPopover(this._popoverable, this._activatable, this._selectable)
            handlePopoverClosing(this, this._selectable, this._popoverable, multiple)
        } else if (popoverEl && popoverInputEl) { // popover listbox with button control and popover input control
            let button = buttonEl

            let input = popoverInputEl
            let popover = popoverEl

            setAttribute(button, 'role', 'combobox')
            setAttribute(input, 'role', 'combobox')
            setAttribute(button, 'aria-controls', listId)

            this._disableable.onInitAndChange((disabled) => {
                if (disabled) {
                    button && setAttribute(button, 'disabled', '')
                    input && setAttribute(input, 'disabled', '')
                } else {
                    button && removeAttribute(button, 'disabled')
                    input && removeAttribute(input, 'disabled')
                }
            })

            this._popoverable = new Popoverable(popover)
            this._anchorable = new Anchorable(popover, {
                reference: button,
                matchWidth: true,
                position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
                gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
                offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
            })

            preventInputEventsFromBubblingToSelectRoot(input)
            highlightInputContentsWhenFocused(input)
            this._filterable && filterResultsByInput(input, this._filterable)
            focusInputWhenPopoverOpens(input, this._popoverable)
            initPopover(this, button, popover, this._popoverable, this._anchorable)
            preventScrollWhenPopoverIsOpen(this, this._popoverable)
            linkExpandedStateToPopover(button, this._popoverable)
            handleInputClearing(this, input, this._selectable, this._popoverable)
            controlPopoverWithKeyboard(button, this._popoverable, this._activatable, this._selectable)
            togglePopoverWithMouse(button, this._popoverable)
            handleKeyboardNavigation(input, this._activatable)
            handleKeyboardSearchNavigation(button, this._activatable, this._popoverable)
            handleKeyboardSelection(this, input, this._activatable)
            handleMouseSelection(this, this._activatable)
            controlActivationWithPopover(this._popoverable, this._activatable, this._selectable)
            handlePopoverClosing(this, this._selectable, this._popoverable, multiple)
        } else if (popoverEl) { // popover listbox with button control
            let button = buttonEl
            let popover = popoverEl

            setAttribute(button, 'role', 'combobox')
            setAttribute(button, 'aria-controls', listId)

            this._disableable.onInitAndChange((disabled) => {
                if (disabled) {
                    button && setAttribute(button, 'disabled', '')
                    input && setAttribute(input, 'disabled', '')
                } else {
                    button && removeAttribute(button, 'disabled')
                    input && removeAttribute(input, 'disabled')
                }
            })

            this._popoverable = new Popoverable(popover)
            this._anchorable = new Anchorable(popover, {
                reference: button,
                matchWidth: true,
                position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
                gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
                offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
            })

            initPopover(this, button, popover, this._popoverable, this._anchorable)
            preventScrollWhenPopoverIsOpen(this, this._popoverable)
            linkExpandedStateToPopover(button, this._popoverable)
            controlPopoverWithKeyboard(button, this._popoverable, this._activatable, this._selectable)
            togglePopoverWithMouse(button, this._popoverable)
            handleKeyboardNavigation(button, this._activatable)
            handleKeyboardSearchNavigation(button, this._activatable, this._popoverable)
            handleKeyboardSelection(this, button, this._activatable)
            handleMouseSelection(this, this._activatable)
            controlActivationWithPopover(this._popoverable, this._activatable, this._selectable)
            handlePopoverClosing(this, this._selectable, this._popoverable, multiple)
        }

        let observer = new MutationObserver(() => {
            setTimeout(() => {
                if ((! this._popoverable) || (this._popoverable.getState())) {
                    let firstSelectedOption = this._selectable.selecteds()[0]?.el

                    queueMicrotask(() => { // We need to let the popover fully become visible first so that we detect which elements are visible...
                        this._activatable.activateSelectedOrFirst(firstSelectedOption)
                    })
                } else {
                    this._activatable.clearActive()
                }
            })
        })

        observer.observe(list, { childList: true })
    }

    button() {
        // @todo: fix this:
        return this.querySelector('button:has(+ [popover])')
    }

    input() {
        return this.querySelector('input')
    }

    list() {
        return this.querySelector('ui-options') || this
    }

    clear() {
        if (! this.input()) return

        this.input().value = ''
        this.input().dispatchEvent(new Event('input', { bubbles: false }))
    }

    open() {
        this._popoverable.setState(true)
    }

    close() {
        this._popoverable.setState(false)
    }

    deselectLast() {
        if ((! this.hasAttribute('multiple')) && this.value !== null) {
            this.value = null;

            this.dispatchEvent(new Event('input', { bubbles: false }))
            this.dispatchEvent(new Event('change', { bubbles: false }))
        }

        if (this.hasAttribute('multiple') && this.value.length !== 0) {
            this.value = this.value.slice(0, -1)

            this.dispatchEvent(new Event('input', { bubbles: false }))
            this.dispatchEvent(new Event('change', { bubbles: false }))
        }
    }
}

class UIEmpty extends UIElement {
    boot() {
        setAttribute(this, 'data-hidden', '')
    }

    mount() {
        // We need this extra microtask here to make sure all
        // ui-option sub-elements have finished mounting...
        queueMicrotask(() => {
            let picker = this.closest('ui-autocomplete, ui-combobox, ui-select')
            let list = this.closest('ui-options')

            if (! list) return

            let isHidden = el => getComputedStyle(el).display === 'none'

            let refresh = () => {
                let empty

                if (CSS.supports('selector(&)')) { // Old safari doesn't support "&"...
                    empty = Array.from(list.querySelectorAll('& > ui-option')).filter(i => ! isHidden(i)).length === 0
                } else {
                    empty = Array.from(list.querySelectorAll(':scope > ui-option')).filter(i => ! isHidden(i)).length === 0
                }

                if (empty) {
                    removeAttribute(this, 'data-hidden')
                } else {
                    setAttribute(this, 'data-hidden', '')
                }
            }

            refresh()

            // Re-run when the list changes...

            let filterable = picker._filterable

            if (filterable) {
                filterable.onChange(refresh)
            }

            let observer = new MutationObserver(mutations => {
                setTimeout(() => refresh())
            })

            observer.observe(list, { childList: true })
        })
    }
}

element('selected', UISelected)
element('select', UISelect)
element('empty', UIEmpty)

inject(({ css }) => css`ui-select { display: block; }`)
inject(({ css }) => css`ui-selected-option { display: contents; }`)
inject(({ css }) => css`ui-empty { display: block; cursor: default; }`)

function handleKeyboardNavigation(el, activatable) {
    on(el, 'keydown', e => {
        if (! ['ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) return;

        if (e.key === 'ArrowDown') {
            activatable.activateNext();
            e.preventDefault(); e.stopPropagation();
        } else if (e.key === 'ArrowUp') {
            activatable.activatePrev();
            e.preventDefault(); e.stopPropagation();
        }
    })
}

function handleKeyboardSearchNavigation(el, activatable, popoverable) {
    search(el, query => {
        activatable.activateBySearch(query)

        // If the popover is closed, we want to mimic native select behavior,
        // by changing the selection when a user types on the button trigger...
        if (! popoverable.getState()) {
            activatable.getActive()?.click()
        }
    })
}

function handleKeyboardSelection(root, el, activatable) {
    on(el, 'keydown', e => {
        if (e.key === 'Enter') {
            let activeEl = activatable.getActive()

            e.preventDefault(); e.stopPropagation()

            if (! activeEl) return

            // Forward click events so people can use things like x-on:click in command palettes and such...
            activeEl.click()

            root.dispatchEvent(new CustomEvent('action', {
                bubbles: false,
                cancelable: false,
            }))
        }
    })
}

function handleMouseSelection(root, activatable, pointerdown = false) {
    on(root, pointerdown ? 'pointerdown' : 'click', e => {
        if (e.target.closest('ui-option')) {
            let option = e.target.closest('ui-option')

            if (option._disabled) return

            option._selectable?.trigger()

            root.dispatchEvent(new CustomEvent('action', {
                bubbles: false,
                cancelable: false,
            }))

            e.preventDefault(); e.stopPropagation()
        }
    })
}

function handleActivationOnFocus(el, activatable, selectable) {
    on(el, 'focus', () => {
        let firstSelectedOption = selectable.selecteds()[0]?.el

        activatable.activateSelectedOrFirst(firstSelectedOption)
    })

    on(el, 'blur', () => {
        activatable.clearActive()
    })
}

function initListbox(el) {
    let listId = assignId(el, 'options')

    setAttribute(el, 'role', 'listbox')

    return listId
}

function linkExpandedStateToPopover(el, popoverable) {
    setAttribute(el, 'aria-haspopup', 'listbox')

    let refreshPopover = () => {
        setAttribute(el, 'aria-expanded', popoverable.getState() ? 'true' : 'false')

        popoverable.getState() ? setAttribute(el, 'data-open', '') : removeAttribute(el, 'data-open', '')
    }

    popoverable.onChange(() => {
        refreshPopover()
    }); refreshPopover()
}

function initPopover(root, trigger, popover, popoverable, anchorable) {
    let refreshPopover = () => {
        Array.from([root, popover]).forEach(i => {
            popoverable.getState() ? setAttribute(i, 'data-open', '') : removeAttribute(i, 'data-open', '')
        })

        popoverable.getState() && anchorable.reposition()
    }

    popoverable.onChange(() => refreshPopover()); refreshPopover()

    popoverable.onChange(() => {
        if (popoverable.getState()) {
            root.dispatchEvent(new Event('open', {
                bubbles: false,
                cancelable: false,
            }))
        } else {
            root.dispatchEvent(new Event('close', {
                bubbles: false,
                cancelable: false,
            }))
        }
    })
}

function controlActivationWithPopover(popoverable, activatable, selectable) {
    popoverable.onChange(() => {
        if (popoverable.getState()) {
            let firstSelectedOption = selectable.selecteds()[0]?.el

            queueMicrotask(() => { // We need to let the popover fully become visible first so that we detect which elements are visible...
                activatable.activateSelectedOrFirst(firstSelectedOption)
            })
        } else {
            activatable.clearActive()
        }
    })
}

function controlPopoverWithKeyboard(button, popoverable) {
    on(button, 'keydown', e => {
        if (! ['ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) return;

        if (e.key === 'ArrowDown') {
            if (! popoverable.getState()) {
                popoverable.setState(true);
                e.preventDefault(); e.stopImmediatePropagation();
            }
        } else if (e.key === 'ArrowUp') {
            if (! popoverable.getState()) {
                popoverable.setState(true);
                e.preventDefault(); e.stopImmediatePropagation();
            }
        } else if (e.key === 'Escape') {
            if (popoverable.getState()) {
                popoverable.setState(false);
            }
        }
    })
}

function openPopoverWithMouse(el, popoverable) {
    on(el, 'click', () => {
        if (! popoverable.getState()) {
            popoverable.setState(true)
            el.focus()
        }
    })
}

function togglePopoverWithMouse(button, popoverable) {
    on(button, 'click', () => {
        popoverable.setState(! popoverable.getState())
        button.focus()
    })
}

function focusInputWhenPopoverOpens(input, popoverable) {
    popoverable.onChange(() => {
        if (popoverable.getState()) {
            setTimeout(() => input.focus())
        }
    })
}

function filterResultsByInput(input, filterable) {
    filterable && on(input, 'input', e => {
        filterable.filter(e.target.value)
    })
}

function highlightInputContentsWhenFocused(input) {
    on(input, 'focus', () => input.select())
}

function preventInputEventsFromBubblingToSelectRoot(input) {
    on(input, 'change', e => e.stopPropagation())
    on(input, 'input', e => e.stopPropagation())
}

function controlPopoverWithInput(input, popoverable) {
    on(input, 'keydown', (e) => {
        if (/^[a-zA-Z0-9]$/.test(e.key) || e.key === 'Backspace') {
            popoverable.getState() || popoverable.setState(true)
        }
    })
}

function handleInputClearing(root, input, selectable, popoverable) {
    let shouldClear = root.hasAttribute('clear')

    if (! shouldClear) return

    let setInputValue = value => {
        input.value = value
        input.dispatchEvent(new Event('input', { bubbles: false }))
    }

    let clear = root.getAttribute('clear')
    let clearOnAction = clear === '' || clear.split(' ').includes('action')
    let clearOnSelect = clear === '' || clear.split(' ').includes('select')
    let clearOnClose = clear === '' || clear.split(' ').includes('close')
    let clearOnEsc = clear === '' || clear.split(' ').includes('esc')

    if (clear === 'none') clearOnAction = clearOnSelect = clearOnClose = clearOnEsc = false

    if (clearOnAction) {
        root.addEventListener('action', e => {
            setInputValue('')
        })
    } else if (clearOnSelect) {
        selectable.onChange(() => {
            // This microtask is here so that if the input has x-model on it
            // Without this microtask, if the input has x-model on it, the x-model
            // dependancy will become part of the x-model effects for the entire ui-select.
            // Next time the dependancy changes, it will trigger a ui-select "change" event,
            // which will clear the input, causing a loop of clearing the input value every
            // time the input is typed into...
            queueMicrotask(() => setInputValue(''))
        })
    }

    if (clearOnClose) {
        popoverable.onChange(() => {
            if (! popoverable.getState()) {
                setInputValue('')
            }
        })
    }

    if (clearOnEsc) {
        on(input, 'keydown', e => {
            if (e.key === 'Escape') {
                setInputValue('')
            }
        })
    }
}

function handlePopoverClosing(root, selectable, popoverable, multiple) {
    let closeOnAction = ! multiple
    let closeOnSelect = ! multiple

    if (root.hasAttribute('close')) {
        let close = root.getAttribute('close')

        closeOnAction = close === '' || close.split(' ').includes('action')
        closeOnSelect = close.split(' ').includes('select')

        if (close === 'none') closeOnAction = closeOnSelect = false
    }

    if (closeOnAction) {
        root.addEventListener('action', e => {
            popoverable.setState(false)
        })
    } else if (closeOnSelect) {
        selectable.onChange(() => {
            popoverable.setState(false)
        })
    }
}

function trackActiveDescendant(input, activatable) {
    activatable.onChange(() => {
        let activeEl = activatable.getActive()

        activeEl ? setAttribute(input, 'aria-activedescendant', activeEl.id) : removeAttribute(input, 'aria-activedescendant')
    })
}

function handleAutocomplete(autocomplete, isStrict, root, input, selectable, popoverable) {
    if (! autocomplete) {
        setAttribute(input, 'autocomplete', 'off')
        setAttribute(input, 'aria-autocomplete', 'none')

        return
    }

    let setInputValue = value => {
        input.value = value
        input.dispatchEvent(new Event('input', { bubbles: false }))
    }

    setAttribute(input, 'autocomplete', 'off')
    setAttribute(input, 'aria-autocomplete', 'list')

    queueMicrotask(() => {
        selectable.onInitAndChange(() => {
            input.value = selectable.selectedTextValue()
        })
    })

    root.addEventListener('action', e => {
        setInputValue(selectable.selectedTextValue())
    })

    if (isStrict) {
        popoverable.onChange(() => {
            if (! popoverable.getState()) {
                setInputValue(selectable.selectedTextValue())
            }
        })
    }
}

function preventScrollWhenPopoverIsOpen(root, popoverable) {
    let { lock, unlock } = lockScroll()

    popoverable.onChange(() => {
        popoverable.getState() ? lock() : unlock()
    })
}