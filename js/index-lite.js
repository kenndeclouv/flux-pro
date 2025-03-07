/** Popover polyfill */
/** iOS Safari 16 or lower doesn't support [popover]... */
import '@oddbird/popover-polyfill';

import { apply, isSupported, isPolyfilled } from '@oddbird/popover-polyfill/fn';

if (! isSupported() && ! isPolyfilled()) {
    apply()
}

import './dropdown.js'
import './tooltip.js'
import './menu.js'

/** Flux global store object */
import './store.js'
