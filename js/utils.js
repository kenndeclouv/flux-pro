
export function inject(callback) {
    let styles = callback({
        css: (strings, ...values) => strings.raw[0] + values.join('')
    })

    // Dirty polyfill for Safari < 16.4...
    if (document.adoptedStyleSheets === undefined) {
        let styleElement = document.createElement('style')

        styleElement.textContent = styles

        document.head.appendChild(styleElement)

        return
    }

    let sheet = new CSSStyleSheet()

    sheet.replaceSync(styles)

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
}

export function closest(el, condition) {
    let current = el

    while (current) {
        if (condition(current)) return current

        current = current.parentElement
    }
}

export function walker(el, callback) {
    let walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_ELEMENT,
        callback ? {
            acceptNode: el => {
                let skipped, rejected

                callback(el, {
                    skip: () => skipped = true,
                    reject: () => rejected = true,
                })

                if (skipped) return NodeFilter.FILTER_SKIP
                if (rejected) return NodeFilter.FILTER_REJECT
                return NodeFilter.FILTER_ACCEPT
            }
        } : {},
    )

    return new Traverse(walker)
}

export class Traverse {
    constructor(walker) {
        this.walker = walker
    }

    from(el) {
        this.walker.currentNode = el

        return this
    }

    first() {
        return this.walker.firstChild()
    }

    last() {
        return this.walker.lastChild()
    }

    next(el) {
        this.walker.currentNode = el

        return this.walker.nextSibling()
    }

    nextOrFirst(el) {
        let found = this.next(el)

        if (found) return found

        this.walker.currentNode = this.walker.root

        return this.first()
    }

    prev(el) {
        this.walker.currentNode = el

        return this.walker.previousSibling()
    }

    prevOrLast(el) {
        let found = this.prev(el)

        if (found) return found

        this.walker.currentNode = this.walker.root

        return this.last()
    }

    closest(el, condition) {
        let walker = this.from(el).walker

        while (walker.currentNode) {
            if (condition(walker.currentNode)) return walker.currentNode

            walker.parentNode()
        }
    }

    contains(el) {
        return this.find(i => i === el)
    }

    find(callback) {
        return this.walk((el, bail) => {
            callback(el) && bail(el)
        })
    }

    findOrFirst(callback) {
        let found = this.find(callback)

        if (! found) this.walker.currentNode = this.walker.root

        return this.first()
    }

    each(callback) {
        this.walk(el => callback(el))
    }

    some(callback) {
        return !! this.find(callback)
    }

    every(callback) {
        let every = true

        this.walk(el => { callback(el) || (every = false) })

        return every
    }

    map(callback) {
        let els = []

        this.walk(el => els.push(callback(el)))

        return els
    }

    filter(callback) {
        let els = []

        this.walk(el => callback(el) && els.push(el))

        return els
    }

    walk(callback) {
        let current
        let walker = this.walker
        let bailed

        while (walker.nextNode()) {
            current = walker.currentNode

            callback(current, bailValue => bailed = bailValue)

            if (bailed !== undefined) {
                break;
            }
        }

        return bailed
    }
}

export function element(name, type) {
    customElements.define(`ui-${name}`, type)
}

export function assert(subject) {
    if (subject === undefined || subject === null) {
        throw 'Failed assertion...'
    }

    return subject
}

export function on(target, event, handler, options = {}) {
    target.addEventListener(event, handler, options)

    return {
        off: () => target.removeEventListener(event, handler),

        pause: (callback) => {
            target.removeEventListener(event, handler),

            callback()

            target.addEventListener(event, handler)
        },
    }
}

export function isFocusable(el) {
    let selectors = [
        'a[href]',
        'area[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'iframe',
        'object',
        'embed',
        '[tabindex]',
        '[contenteditable]'
    ]

    return selectors.some(selector => el.matches(selector)) && el.tabIndex >= 0
}

export function focusFirst(el) {
    let autofocus = walker(el, (i, { skip }) => i.hasAttribute('autofocus') || skip()).first()

    if (! autofocus) {
        if (el.getAttribute('tabindex', '0')) {
            el.focus()
        } else {
            let focusable = walker(el, (i, { skip }) => isFocusable(i) || skip()).first()

            focusable && focusable.focus()
        }
    }
}

export function tap(thing, callback) {
    callback(thing)

    return thing
}

export function throttle(func, limit) {
    let inThrottle

    return function() {
        let context = this, args = arguments

        if (! inThrottle) {
            func.apply(context, args)

            inThrottle = true

            setTimeout(() => inThrottle = false, limit)
        }
    }
}

export function pushTo(object, key, item) {
    if (! object[key]) object[key] = []

    object[key].push(item)
}

let using = 'pointer'

document.addEventListener('keydown', () => using = 'keyboard', { capture: true })
document.addEventListener('pointerdown', e => {
    using = e.pointerType === 'mouse' ? 'mouse' : 'touch'
}, { capture: true })

export function isUsingKeyboard() {
    return using === 'keyboard'
}

export function isUsingTouch() {
    return using === 'touch'
}

export function isUsingMouse() {
    return using === 'mouse'
}

export function search(el, callback) {
    let runningQuery = ''

    let clearRunningQuery = debounce(() => {
        runningQuery = ''
    }, 300)

    el.addEventListener('keydown', e => {
        if ((e.key.length === 1 && /[a-zA-Z]/.test(e.key))) {
            runningQuery += e.key

            callback(runningQuery)

            e.stopPropagation()
        }

        clearRunningQuery()
    })
}

export function dispenseId(el, prefix) {
    return 'lofi-' + (prefix ? prefix + '-' : '') + Math.random().toString(16).slice(2)
}

export function assignId(el, prefix) {
    let id = el.hasAttribute('id')
        ? el.getAttribute('id')
        : dispenseId(el, prefix)

    setAttribute(el, 'id', id)

    // This is a hack to preserve dynamically added IDs during Livewire/Alpine morphing...
    if (! el._x_bindings) el._x_bindings = {}
    if (! el._x_bindings.id) el._x_bindings.id = id

    return id
}

export function detangle() {
    let blocked = false

    return callback => (...args) => {
        if (blocked) return

        blocked = true

        callback(...args)

        blocked = false
    }
}

/**
 * Interest detection...
 */

export function interest(trigger, panel, { gain, lose, focusable, useSafeArea }) {
    let engaged = false

    focusable && document.addEventListener('focusin', e => {
        if (! isUsingKeyboard()) return

        if (trigger.contains(e.target) || panel.contains(e.target)) {
            engaged = true

            gain()
        } else {
            engaged = false

            lose()
        }
    })

    let removeSafeArea = () => {}
    let removePointerMoveHandler = () => {}

    let disinterest = () => {
        engaged = false
        lose()
        removeSafeArea()
        removePointerMoveHandler()
    }

    let clear = () => {
        engaged = false
        removeSafeArea()
        removePointerMoveHandler()
    }

    trigger.addEventListener('pointerenter', e => {
        // Only open on desktop mouse hover...
        if (isUsingTouch()) return

        if (engaged) return
        engaged = true
        gain()

        // Timeout is here in case anchor positioning takes a tick...
        setTimeout(() => {
            let { safeArea, redraw: redrawSafeArea, remove } = useSafeArea ? createSafeArea(trigger, panel, e.clientX, e.clientY) : nullSafeArea()

            removeSafeArea = remove

            let pointerStoppedOverSafeAreaTimeout

            let pointerMoveHandler = throttle(e => {
                let panelRect = panel.getBoundingClientRect()
                let triggerRect = trigger.getBoundingClientRect()

                let mouseState

                if (safeArea.contains(e.target) && mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, e.clientX, e.clientY)) mouseState = 'safeArea'
                else if (panel.contains(e.target)) mouseState = 'panel'
                else if (trigger.contains(e.target)) mouseState = 'trigger'
                else mouseState = 'outside'

                if (pointerStoppedOverSafeAreaTimeout) {
                    clearTimeout(pointerStoppedOverSafeAreaTimeout)
                }

                switch (mouseState) {
                    case 'outside':
                        disinterest()
                        break;

                    case 'trigger':
                        redrawSafeArea(e.clientX, e.clientY)
                        break;

                    case 'panel':
                        removeSafeArea()
                        break;

                    case 'safeArea':
                        redrawSafeArea(e.clientX, e.clientY)

                        pointerStoppedOverSafeAreaTimeout = setTimeout(() => {
                            disinterest()
                        }, 300)

                        break;

                    default:
                        break;
                }
            }, 100)

            document.addEventListener('pointermove', pointerMoveHandler)

            removePointerMoveHandler = () => document.removeEventListener('pointermove', pointerMoveHandler)
        })
    })

    return { clear }
}

export function createSafeArea(trigger, panel, x, y) {
    let safeArea = document.createElement('div')
    let panelRect = panel.getBoundingClientRect()
    let triggerRect = trigger.getBoundingClientRect()

    safeArea.style.position = 'fixed'
    setAttribute(safeArea, 'data-safe-area', '')

    let draw = (x, y) => {
        if (panelRect.top === 0 && panelRect.bottom === 0) return

        let direction

        if (panelRect.left < triggerRect.left) direction = 'left'
        if (panelRect.right > triggerRect.right) direction = 'right'
        if (panelRect.top < triggerRect.top && (panelRect.bottom < y)) direction = 'up'
        if (panelRect.bottom > triggerRect.bottom && (panelRect.top > y)) direction = 'down'
        if (direction === undefined) direction = 'right'

       let left, right, width, top, bottom, height, offset, shape

       let padding = 10

        switch (direction) {
            case 'left':
                left = panelRect.right
                right = Math.max(panelRect.right, x) + 5
                width = right - left

                top = Math.min(triggerRect.top, panelRect.top) - padding
                bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding
                height = bottom - top

                offset = y - top
                shape = `polygon(0% 0%, 100% ${offset}px, 0% 100%)`

                break;

            case 'right':
                left = Math.min(panelRect.left, x) - 5
                right = panelRect.left
                width = right - left

                top = Math.min(triggerRect.top, panelRect.top) - padding
                bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding
                height = bottom - top

                offset = y - top
                shape = `polygon(0% ${offset}px, 100% 0%, 100% 100%)`

                break;

            case 'up':
                left = Math.min(x, panelRect.left) - padding
                right = Math.max(x, panelRect.right) + padding
                width = right - left

                top = panelRect.bottom
                bottom = Math.max(panelRect.bottom, y) + 5
                height = bottom - top

                offset = x - left
                shape = `polygon(0% 0%, 100% 0%, ${offset}px 100%)`

                break;

            case 'down':
                left = Math.min(x, panelRect.left) - padding
                right = Math.max(x, panelRect.right) + padding
                width = right - left

                top = Math.min(panelRect.top, y) - 5
                bottom = panelRect.top
                height = bottom - top

                offset = x - left
                shape = `polygon(${offset}px 0%, 100% 100%, 0% 100%)`

                break;
        }

        safeArea.style.left = `${left}px`
        safeArea.style.top = `${top}px`
        safeArea.style.width = `${width}px`
        safeArea.style.height = `${height}px`
        safeArea.style.clipPath = shape
    }

    return {
        safeArea,
        redraw: (x, y) => {
            if (! safeArea.isConnected) trigger.appendChild(safeArea)

            draw(x, y)
        },
        remove: () => {
            safeArea.remove()
        },
    }
}

function mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, x, y) {
    return ! mouseIsOverTrigger(triggerRect, x, y) && ! mouseIsOverPanel(panelRect, x, y)
}

function mouseIsOverTrigger(triggerRect, x, y) {
    if ((triggerRect.left <= x && x <= triggerRect.right) && (triggerRect.top <= y && y <= triggerRect.bottom)) return true
    return false
}

function mouseIsOverPanel(panelRect, x, y) {
    if ((panelRect.left <= x && x <= panelRect.right) && (panelRect.top <= y && y <= panelRect.bottom)) return true
    return false
}

/**
 * Prevent attribute manipulation from outside sources like morphing algorithms...
 */

export function setAttribute(el, name, value) {
    if (el._durableAttributeObserver === undefined) {
        el._durableAttributeObserver = attributeObserver(el, [ name ])
    }

    if (! el._durableAttributeObserver.hasAttribute(name)) {
        el._durableAttributeObserver.addAttribute(name)
    }

    el._durableAttributeObserver.pause(() => {
        el.setAttribute(name, value)
    })
}

export function removeAndReleaseAttribute(el, name) {
    removeAttribute(el, name)

    releaseAttribute(el, name)
}

export function removeAttribute(el, name) {
    if (el._durableAttributeObserver === undefined) {
        el._durableAttributeObserver = attributeObserver(el, [ name ])
    }

    if (! el._durableAttributeObserver.hasAttribute(name)) {
        el._durableAttributeObserver.addAttribute(name)
    }

    el._durableAttributeObserver.pause(() => {
        el.removeAttribute(name)
    })
}

export function releaseAttribute(el, name) {
    if (! el?._durableAttributeObserver?.hasAttribute(name)) return

    el._durableAttributeObserver.releaseAttribute(name)
}

function attributeObserver(el, initialAttributes) {
    let processMutations = mutations => {
        mutations.forEach(mutation => {
            if (mutation.oldValue === null) {
                el._durableAttributeObserver.pause(() => removeAttribute(el, mutation.attributeName))
            } else {
                el._durableAttributeObserver.pause(() => setAttribute(el, mutation.attributeName, mutation.oldValue))
            }
        })
    }

    let observer = new MutationObserver(mutations => processMutations(mutations))

    observer.observe(el, { attributeFilter: initialAttributes, attributeOldValue: true })

    return {
        attributes: initialAttributes,

        hasAttribute(name) {
            return this.attributes.includes(name)
        },

        addAttribute(name) {
            this.attributes.includes(name) || this.attributes.push(name)

            observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true })
        },

        releaseAttribute(name) {
            if (! this.hasAttribute(name)) return

            observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true })
        },

        pause(callback) {
            // We need to flush the observer's buffer before disconnecting...
            processMutations(observer.takeRecords())

            observer.disconnect()

            callback()

            observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true })
        },
    }
}

function nullSafeArea() {
    return {
        safeArea: { contains: () => false },
        redraw: () => {},
        remove: () => {},
    }
}

export function debounce(callback, delay) {
    let timeout

    return (...args) => {
        clearTimeout(timeout)

        timeout = setTimeout(() => {
            callback(...args)
        }, delay)
    }
}

let lockCount = 0

export function lockScroll(allowScroll = false) {
    if (allowScroll) return { lock: () => {}, unlock: () => {} }

    let undoLockStyles = () => {}

    return {
        lock() {
            lockCount++

            if (lockCount > 1) return

            undoLockStyles = chain(
                setStyle(document.documentElement, 'paddingRight', `${window.innerWidth - document.documentElement.clientWidth}px`),
                setStyle(document.documentElement, 'overflow', 'hidden'),
            )
        },

        unlock() {
            lockCount = Math.max(0, lockCount - 1)

            undoLockStyles()
        },
    }
}

export function setStyle(element, style, value) {
    let currentValue = element.style[style];

    element.style[style] = value;

    return () => {
        element.style[style] = currentValue;
    }
}

export function chain(...fns) {
    return (...args) => {
        for (let fn of fns) {
            fn(...args)
        }
    }
}
