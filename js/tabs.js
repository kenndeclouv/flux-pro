import { SelectableGroup, Selectable } from './mixins/selectable.js'
import { assignId, element, inject, on, walker, removeAttribute, setAttribute, detangle } from './utils.js'
import { FocusableGroup, Focusable } from './mixins/focusable.js'
import { UIControl, UIElement } from './element.js'
import { Disableable } from './mixins/disableable.js'
import { Controllable } from './mixins/controllable.js'

class UITabGroup extends UIElement {
    boot() {
        this._disabled = this.hasAttribute('disabled')
    }

    mount() {
        this.walkPanels(el => initializePanel(el)); // We need this semicolon to separate the this call from the next one...

        (new MutationObserver(mutations => {
            this.walkPanels(el => initializePanel(el))
        })).observe(this, { childList: true })
    }

    showPanel(name) {
        this.walkPanels(el => {
            if (el.getAttribute('name') === name) el.show()
            else el.hide()
        })
    }

    getPanel(name) {
        return this.walkPanels((el, bail) => {
            if (el.getAttribute('name') === name) {
                bail(el)
            }
        })
    }

    walkPanels(callback) {
        let bailed = false
        let bailedReturn

        for (let child of this.children) {
            if (child instanceof UITabGroup) continue
            if (child instanceof UITabs) continue

            callback(child, (forward) => { bailed = true; bailedReturn = forward })

            if (bailed) break
        }

        return bailedReturn
    }
}

class UITabs extends UIControl {
    boot() {
        this._focusable = new FocusableGroup(this, { wrap: true })

        this._selectableGroup = new SelectableGroup(this)
        this._controllable = new Controllable(this, { disabled: this._disabled })

        this._controllable.initial(initial => initial && this._selectableGroup.setState(initial))
        this._controllable.getter(() => this._selectableGroup.getState())

        let detangled = detangle()

        this._controllable.setter(detangled(value => { this._selectableGroup.setState(value) }))
        this._selectableGroup.onChange(detangled(() => { this._controllable.dispatch() }))

        on(this, 'keydown', e => {
            if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
                this._focusable.focusNext()
                e.preventDefault(); e.stopPropagation()
            } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
                this._focusable.focusPrev()
                e.preventDefault(); e.stopPropagation()
            }
        })

        setAttribute(this, 'role', 'tablist')
    }

    mount() {
        this.initializeTabs()

        this._focusable.ensureTabbable()

        if (! this._selectableGroup.getState()) {
            this._selectableGroup.selectFirst()
        }

        (new MutationObserver(mutations => {
            this.initializeTabs()

            // If a panel is added dynamically, and that panel is selected, we need to show it...
            let selected = this._selectableGroup.selected()

            selected.el.closest('ui-tab-group').showPanel(selected.value)
        })).observe(this, { childList: true })
    }

    initializeTabs() {
        this.walker().each(el => {
            if (el._initialized) return

            if (el._disableable) return
            if (el.hasAttribute('action')) return

            initializeTab(el)

            el._initialized = true
        })
    }

    walker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UITabGroup) return reject()
            if (el instanceof UITabs) return reject()
            if (! ['a', 'button'].includes(el.localName)) return skip()
        })
    }
}

function initializeTab(el) {
    el._disableable = new Disableable(el)

    el._disabled = el.hasAttribute('disabled')

    let link = el.matches('a') ? el : null

    let target = link || el

    if (el._disabled) {
        setAttribute(target, 'disabled', '')
        setAttribute(target, 'aria-disabled', 'true')
    }

    let id = assignId(target, 'tab')

    setAttribute(target, 'role', 'tab')

    if (el._disabled) return

    target._focusable = new Focusable(target, { disableable: el._disableable,  tabbableAttr: 'data-active' })

    if (! link) {
        let panel = el.getAttribute('name')

        el._selectable = new Selectable(el, {
            value: panel || Math.random().toString(36).substring(2, 10),
            label: el.hasAttribute('label') ? el.getAttribute('label') : el.textContent.trim(),
            selectedInitially: el.hasAttribute('selected'),
            toggleable: false,
        })

        on(el, 'click', () => el._selectable.press())

        el._selectable.onChange(() => {
            let panelEl = el.closest('ui-tab-group')?.getPanel(panel)

            el._selectable.getState() ? panelEl?.show() : panelEl?.hide()

            if (el._selectable.getState()) {
                el._focusable.focus(false)
            }
        })

        if (! el.closest('ui-tab-group')?.hasAttribute('manual')) {
            on(el, 'focus', () => el._selectable.select())
        }

        queueMicrotask(() => { // Faux "mount":
            let container = el.closest('ui-tab-group')

            if (! container) return

            let panelEl = container.getPanel(panel)

            if (! panelEl) throw new Error('Could not find panel...')

            setAttribute(el, 'aria-controls', panelEl.id)

            setAttribute(panelEl, 'aria-labelledby', el.id)
        })
    }
}

function initializePanel(el) {
    if (el._initialized) return

    assignId(el, 'tab-panel')

    setAttribute(el, 'role', 'tabpanel')
    el.hasAttribute('tabindex') || setAttribute(el, 'tabindex', '-1')

    el.show = () => {
        setAttribute(el, 'data-selected', '')
        setAttribute(el, 'tabindex', '0')
    }

    el.hide = () => {
        removeAttribute(el, 'data-selected')
        setAttribute(el, 'tabindex', '-1')
    }

    el._initialized = true
}

inject(({ css }) => css`ui-tab-group, ui-tabs { display: block; cursor: default; }`)

element('tab-group', UITabGroup)
element('tabs', UITabs)
