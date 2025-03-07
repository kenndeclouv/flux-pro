import { computePosition, autoUpdate, flip, shift, offset, size } from '@floating-ui/dom'
import { Mixin } from './mixin.js'

export class Anchorable extends Mixin {
    boot({ options }) {
        options({
            reference: null,
            auto: true,
            position: 'bottom start',
            gap: '5',
            offset: '0',
            matchWidth: false,
        })

        if (this.options().reference === null) return
        if (this.options().position === null) return

        let [ setPosition, cleanupDurablePositioning ] = createDurablePositionSetter(this.el)

        let reposition = anchor(this.el, this.options().reference, setPosition, {
            position: this.options().position,
            gap: this.options().gap,
            offset: this.options().offset,
            matchWidth: this.options().matchWidth,
        })

        let cleanupAutoUpdate = () => {}

        this.reposition = (...args) => {
            if (this.options().auto) {
                cleanupAutoUpdate = autoUpdate(this.options().reference, this.el, reposition)
            } else {
                reposition(...args)
            }
        }

        this.cleanup = () => {
            cleanupAutoUpdate()
            cleanupDurablePositioning()
        }
    }
}

function anchor(target, invoke, setPosition, { position, offset: offsetValue, gap, matchWidth }) {
    return (forceX = null, forceY = null) => {
        computePosition(invoke, target, {
            placement: compilePlacement(position), // Placements: ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']
            middleware: [
                flip(),
                shift({ padding: 5, crossAxis: true }),
                offset({
                    mainAxis: Number(gap),
                    alignmentAxis: Number(offsetValue),
                }),
                matchWidth ? size({
                    apply({rects, elements}) {
                        Object.assign(elements.floating.style, {
                            width: `${rects.reference.width}px`,
                        });
                    },
                    })
                : undefined,
            ],
        }).then(({ x, y }) => {
            setPosition(forceX || x, forceY || y)
        })
    }
}

function compilePlacement(anchor) {
    return anchor.split(' ').join('-')
}

// Libraries like morphdom will whipe out the anchor positioning styles after a morph.
// This makes those styles "durable" and prevents them frmo being removed...
function createDurablePositionSetter(target) {
    let position = (x, y) => {
        Object.assign(target.style, {
            position: 'absolute', inset: `${y}px auto auto ${x}px`
        })
    }

    let lastX, lastY

    let observer = new MutationObserver(() => position(lastX, lastY))

    return [
        (x, y) => { // Set position...
            lastX = x
            lastY = y

            observer.disconnect()

            position(lastX, lastY)

            observer.observe(target, { attributeFilter: ['style'] })
        },
        () => { // Cleanup...
            observer.disconnect()
        }
    ]
}
