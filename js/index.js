/** Popover polyfill */
/** iOS Safari 16 or lower doesn't support [popover]... */
import '@oddbird/popover-polyfill';

import { apply, isSupported, isPolyfilled } from '@oddbird/popover-polyfill/fn';

if (! isSupported() && ! isPolyfilled()) {
    apply()
}

/** Components */
import './disclosure.js'
import './resizable.js'
import './checkbox.js'
import './dropdown.js'
import './context.js'
import './options.js'
import './toolbar.js'
import './tooltip.js'
import './select.js'
import './switch.js'
import './field.js'
import './modal.js'
import './toast.js'
import './radio.js'
import './menu.js'
import './tabs.js'

/** Flux global store object */
import './store.js'
