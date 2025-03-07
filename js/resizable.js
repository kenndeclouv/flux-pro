import { element, inject, removeAttribute, setAttribute } from './utils.js'
import { UIElement } from './element.js'

class UIResizable extends UIElement {
    boot() {
        //
    }
}

class UIGrip extends UIElement {
    boot() {
        let dimension = this.hasAttribute('resize') ? this.getAttribute('resize') : 'both'
        let shrink = this.hasAttribute('shrink')
        // let container = this.closest('ui-resizable')?.querySelector('ui-resizable > *:not(ui-grip):not(ui-resizable)')
        let container = this.closest('ui-resizable')
        let maxWidth, maxHeight
        let hasAttemptedAResizeYet = false

        if (! container) throw 'Resizable container not found'

        this.addEventListener('pointerdown', e => {
            if (! hasAttemptedAResizeYet) {
                maxWidth = container.offsetWidth
                maxHeight = container.offsetHeight
                hasAttemptedAResizeYet = true
            }

            let startX = e.clientX
            let startY = e.clientY
            let startWidth = parseInt(getComputedStyle(container).width, 10)
            let startHeight = parseInt(getComputedStyle(container).height, 10)

            let resize = e => {
                let width = startWidth + (e.clientX - startX)
                let height = startHeight + (e.clientY - startY)
                if (dimension === 'width' || dimension === 'both') {
                    if (shrink) {
                        container.style.width = `${Math.min(width, maxWidth)}px`;
                    } else {
                        container.style.width = `${width}px`;
                    }
                }

                if (dimension === 'height' || dimension === 'both') {
                    if (shrink) {
                        container.style.height = `${Math.min(height, maxHeight)}px`;
                    } else {
                        container.style.height = `${height}px`;
                    }
                }
            }

            document.addEventListener('pointermove', resize)
            document.addEventListener('pointerup', () => {
                this.releasePointerCapture(e.pointerId)
                document.removeEventListener('pointermove', resize)
            }, { once: true })

            this.setPointerCapture(e.pointerId)
        })
    }
}

inject(({ css }) => css`ui-resizable { display: block; }`)

element('resizable', UIResizable)
element('grip', UIGrip)
