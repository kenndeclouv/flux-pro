import { Activatable, ActivatableGroup } from './mixins/activatable.js'
import { Filterable, FilterableGroup } from './mixins/filterable.js'
import { SelectableGroup, Selectable } from './mixins/selectable.js'
import { inject, element, on, search, assignId, removeAttribute, setAttribute } from './utils.js'
import { FocusableGroup, Focusable } from './mixins/focusable.js'
import { UIElement } from './element.js'

export class UIOptions extends UIElement {
    boot() {
        setAttribute(this, 'tabindex', '-1')

        if (this.hasAttribute('popover')) {
            this.addEventListener('lofi-close-popovers', () => {
                this.hidePopover()
            })
        }

        setAttribute(this, 'role', 'listbox')
    }
}

class UIOption extends UIElement {
    mount() {
        this._disabled = this.hasAttribute('disabled')

        let target = this

        // target.setAttribute('tabindex', '-1')

        if (this._disabled) {
            setAttribute(target, 'disabled', '')
            setAttribute(target, 'aria-disabled', 'true')
        }

        let id = assignId(target, 'option')

        setAttribute(target, 'role', 'option')

        this._filterable = new Filterable(target, {
            mirror: this,
            keep: (!! this.closest('ui-empty')) || this.getAttribute('filter') === 'manual',
        })

        if (this._disabled) return

        this._activatable = new Activatable(target)

        if (! this.hasAttribute('action')) {
            this._selectable = new Selectable(target, {
                value: this.getValue(),
                label: this.getLabel(),
                selectedInitially: this.hasAttribute('selected'),
            })
        }

        let observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'selected') {
                    if (this.hasAttribute('selected')) this._selectable.setState(true)
                    else this._selectable.setState(false)
                }
            })
        })

         observer.observe(this, { attributeFilter: ['selected'] })
    }

    get selected() {
        if (this._disabled) return false

        if (! this?._selectable) return false

        return this._selectable.isSelected()
    }

    set selected(value) {
        if (this._disabled) return

        if (! this?._selectable) return false

        this._selectable.setState(value)
    }

    getLabel() {
        return this.hasAttribute('label')
            ? this.getAttribute('label')
            : this.textContent.trim()
    }

    getValue() {
        return this.hasAttribute('value')
            ? this.getAttribute('value')
            : this.textContent.trim()
    }
}

inject(({ css }) => css`ui-options:not([popover]), ui-option { display: block; cursor: default; }`)

element('options', UIOptions)
element('option', UIOption)
