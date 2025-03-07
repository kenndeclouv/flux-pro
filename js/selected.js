import { UIElement } from "./element"

export class UISelected extends UIElement {
    boot() {
        // Clear out any left-over elements from a previous initialization...
        // This can happen with back button caches in Livewire navigation...
        this.querySelectorAll('[data-appended]').forEach(el => el.remove())

        if (! this.querySelector('template')) { // Legacy support...
            let template = document.createElement('template')
            template.setAttribute('name', 'placeholder')
            template.innerHTML = '<span>' + this.innerHTML + '</span>'

            this.innerHTML = ''

            this.appendChild(template)
        }

        if (! this.querySelector('template[name="options"]')) {
            let template = document.createElement('template')
            template.setAttribute('name', 'options')
            template.innerHTML = '<div><slot></slot></div>'

            this.appendChild(template)
        }

        if (! this.querySelector('template[name="option"]')) {
            let template = document.createElement('template')
            template.setAttribute('name', 'option')
            template.innerHTML = '<div><slot></slot></div>'

            this.appendChild(template)
        }

        this.templates = {
            placeholder: this.querySelector('template[name="placeholder"]'),
            overflow: this.querySelector('template[name="overflow"]'),
            options: this.querySelector('template[name="options"]'),
            option: this.querySelector('template[name="option"]'),
        }

        this.templates.options.elsByValue = new Map()

        this.max = this.templates.overflow?.getAttribute('max') ? this.templates.overflow.getAttribute('max') : Infinity

        this.selecteds = new Map()

        this.picker = this.closest('ui-select')

        this.multiple = this.picker.hasAttribute('multiple')
    }

    mount() {
        queueMicrotask(() => { // Wrap in queueMicrotask to allow all ui-options to be mounted...
            this.picker._selectable.onInitAndChange(() => {
                // We need to retry here if the render fails for the following scenario:
                // A new option's value is selected in Livewire data, but the actual option element hasn't rendered yet.
                // We are attempting right away instead of always deffering to preven the opposite problem where
                // An option is set, but Alpine has already cleared the option elements in the DOM before we can reference them...
                this.render(true)
            })

            let optionsEl = this.picker.list()

            if (optionsEl) {
                new MutationObserver(mutations => {
                    queueMicrotask(() => this.render()) // Wrap in queueMicrotask to allow newly added options to be mounted...
                }).observe(optionsEl, { childList: true })
            }
        })
    }

    render(retry) {
        if (! this.multiple) {
            let value = this.picker.value

            if (Array.from(this.selecteds.keys()).includes(value)) {
                return // The value hasn't changed, so we don't need to re-render...
            }

            this.selecteds.clear()

            let selected = this.picker._selectable.findByValue(value)

            if (selected) {
                this.selecteds.set(value, selected)
            } else {
                if (! ['', null, undefined].includes(value)) {
                    if (retry) return setTimeout(() => { console.log('retrying...'); this.render() })
                    else throw `Could not find option for value "${value}"`
                }
            }

            this.templates.placeholder?.clearPlaceholder?.()
            this.templates.option?.clearOption?.()

            if (this.selecteds.size > 0) {
                this.renderOption()
            } else {
                this.renderPlaceholder()
            }
        } else {
            let values = this.picker.value // We are ensuring this will always be an array...

            let removedValues = Array.from(this.selecteds.keys()).filter(i => ! values.includes(i))
            let newValues = values.filter(i => ! this.selecteds.has(i))

            removedValues.forEach(value => this.selecteds.delete(value))

            let newSelecteds = new Map()

            for (let value of newValues) {
                let selected = this.picker._selectable.findByValue(value)

                if (! selected) {
                    if (retry) return setTimeout(() => this.render())
                    else throw `Could not find option for value "${value}"`
                }

                newSelecteds.set(value, selected)
            }

            newSelecteds.forEach((selected, value) => this.selecteds.set(value, selected))

            this.templates.placeholder?.clearPlaceholder?.()
            this.templates.overflow?.clearOverflow?.()
            this.templates.options?.clearOptions?.()

            if (this.selecteds.size > 0) {
                this.renderOptions({
                    hasOverflowed: (rendered) => {
                        if (this.max === 'auto') {
                            let willOverflow = false

                            this.renderOverflow(this.selecteds.size, this.selecteds.size - rendered)

                            if (this.clientWidth < this.scrollWidth) {
                                willOverflow =  true
                            }

                            this.templates.overflow?.clearOverflow?.()

                            if (willOverflow) {
                                return true
                            }
                        }

                        return rendered > parseInt(this.max)
                    },
                    renderOverflow: (remainder) => {
                        if (this.templates?.overflow?.getAttribute('mode') !== 'append') {
                            this.templates.options?.clearOptions?.()
                        }

                        this.renderOverflow(this.selecteds.size, remainder)
                    }
                })
            } else {
                this.renderPlaceholder()
            }
        }
    }

    renderOptions({ hasOverflowed, renderOverflow }) {
        let container = document.createElement('div')
        container.style.display = 'contents'

        let optionsEl = hydrateTemplate(this.templates.options, {
            default: container,
        })

        this.templates.options.after(optionsEl)

        this.templates.options.clearOptions = () => {
            optionsEl.remove()

            this.templates.options.clearOptions = () => {}
        }

        let rendered = 0

        let shouldRenderOverflow = false

        for (let [value, selected] of this.selecteds) {
            let fragment = new DocumentFragment()
            fragment.append(...selected.el.cloneNode(true).childNodes)

            let optionEl = hydrateTemplate(this.templates.option, {
                text: selected.el.textContent.trim(),
                default: fragment,
                value,
            })

            optionEl.setAttribute('data-value', value)
            optionEl.setAttribute('data-appended', '')
            optionEl.deselect = () => selected.deselect()

            container.appendChild(optionEl)

            rendered++

            if (hasOverflowed(rendered)) {
                shouldRenderOverflow = true

                container.removeChild(optionEl)
                rendered--

                break
            }
        }

        let fragment = new DocumentFragment()
        fragment.append(...container.childNodes)
        container.replaceWith(fragment)

        if (shouldRenderOverflow) {
            renderOverflow(this.selecteds.size - rendered)
        }
    }

    renderOption() {
        for (let [value, selected] of this.selecteds) {
            let fragment = new DocumentFragment()
            fragment.append(...selected.el.cloneNode(true).childNodes)

            let optionEl = hydrateTemplate(this.templates.option, {
                text: selected.el.textContent.trim(),
                default: fragment,
                value,
            })

            optionEl.setAttribute('data-value', value)
            optionEl.setAttribute('data-appended', value)
            optionEl.deselect = () => selected.deselect()

            this.templates.option.after(optionEl)

            this.templates.option.clearOption = () => {
                optionEl.remove()

                this.templates.option.clearOption = () => {}
            }
        }
    }

    renderPlaceholder() {
        if (! this.templates.placeholder) return

        let el = hydrateTemplate(this.templates.placeholder)

        this.templates.placeholder.after(el)

        this.templates.placeholder.clearPlaceholder = () => {
            el.remove()

            this.templates.placeholder.clearPlaceholder = () => {}
        }
    }

    renderOverflow(count, remainder) {
        if (! this.templates.overflow) return

        let el = hydrateTemplate(this.templates.overflow, {
            remainder,
            count: this.selecteds.size,
        })

        el.setAttribute('data-appended', '')

        this.templates.overflow.after(el)

        this.templates.overflow.clearOverflow = () => {
            el.remove()

            this.templates.placeholder.clearOverflow = () => {}
        }
    }
}

function hydrateTemplate(template, slots = {}) {
    let fragment = template.content.cloneNode(true)

    Object.entries(slots).forEach(([key, value]) => {
        let slotNodes = key === 'default' ? fragment.querySelectorAll('slot:not([name])') : fragment.querySelectorAll(`slot[name="${key}"]`)

        slotNodes.forEach(i => i.replaceWith(
            typeof value === 'string' ? document.createTextNode(value) : value
        ))
    })

    return fragment.firstElementChild
}
