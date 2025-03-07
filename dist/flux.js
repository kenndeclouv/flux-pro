(() => {
  // node_modules/@oddbird/popover-polyfill/dist/popover.js
  var ToggleEvent = class extends Event {
    oldState;
    newState;
    constructor(type, { oldState = "", newState = "", ...init } = {}) {
      super(type, init);
      this.oldState = String(oldState || "");
      this.newState = String(newState || "");
    }
  };
  var popoverToggleTaskQueue = /* @__PURE__ */ new WeakMap();
  function queuePopoverToggleEventTask(element2, oldState, newState) {
    popoverToggleTaskQueue.set(
      element2,
      setTimeout(() => {
        if (!popoverToggleTaskQueue.has(element2)) return;
        element2.dispatchEvent(
          new ToggleEvent("toggle", {
            cancelable: false,
            oldState,
            newState
          })
        );
      }, 0)
    );
  }
  var ShadowRoot2 = globalThis.ShadowRoot || function() {
  };
  var HTMLDialogElement = globalThis.HTMLDialogElement || function() {
  };
  var topLayerElements = /* @__PURE__ */ new WeakMap();
  var autoPopoverList = /* @__PURE__ */ new WeakMap();
  var visibilityState = /* @__PURE__ */ new WeakMap();
  function getPopoverVisibilityState(popover) {
    return visibilityState.get(popover) || "hidden";
  }
  var popoverInvoker = /* @__PURE__ */ new WeakMap();
  function popoverTargetAttributeActivationBehavior(element2) {
    const popover = element2.popoverTargetElement;
    if (!(popover instanceof HTMLElement)) {
      return;
    }
    const visibility = getPopoverVisibilityState(popover);
    if (element2.popoverTargetAction === "show" && visibility === "showing") {
      return;
    }
    if (element2.popoverTargetAction === "hide" && visibility === "hidden") return;
    if (visibility === "showing") {
      hidePopover(popover, true, true);
    } else if (checkPopoverValidity(popover, false)) {
      popoverInvoker.set(popover, element2);
      showPopover(popover);
    }
  }
  function checkPopoverValidity(element2, expectedToBeShowing) {
    if (element2.popover !== "auto" && element2.popover !== "manual") {
      return false;
    }
    if (!element2.isConnected) return false;
    if (expectedToBeShowing && getPopoverVisibilityState(element2) !== "showing") {
      return false;
    }
    if (!expectedToBeShowing && getPopoverVisibilityState(element2) !== "hidden") {
      return false;
    }
    if (element2 instanceof HTMLDialogElement && element2.hasAttribute("open")) {
      return false;
    }
    if (document.fullscreenElement === element2) return false;
    return true;
  }
  function getStackPosition(popover) {
    if (!popover) return 0;
    return Array.from(autoPopoverList.get(popover.ownerDocument) || []).indexOf(
      popover
    ) + 1;
  }
  function topMostClickedPopover(target) {
    const clickedPopover = nearestInclusiveOpenPopover(target);
    const invokerPopover = nearestInclusiveTargetPopoverForInvoker(target);
    if (getStackPosition(clickedPopover) > getStackPosition(invokerPopover)) {
      return clickedPopover;
    }
    return invokerPopover;
  }
  function topMostAutoPopover(document2) {
    const documentPopovers = autoPopoverList.get(document2);
    for (const popover of documentPopovers || []) {
      if (!popover.isConnected) {
        documentPopovers.delete(popover);
      } else {
        return popover;
      }
    }
    return null;
  }
  function getRootNode(node) {
    if (typeof node.getRootNode === "function") {
      return node.getRootNode();
    }
    if (node.parentNode) return getRootNode(node.parentNode);
    return node;
  }
  function nearestInclusiveOpenPopover(node) {
    while (node) {
      if (node instanceof HTMLElement && node.popover === "auto" && visibilityState.get(node) === "showing") {
        return node;
      }
      node = node instanceof Element && node.assignedSlot || node.parentElement || getRootNode(node);
      if (node instanceof ShadowRoot2) node = node.host;
      if (node instanceof Document) return;
    }
  }
  function nearestInclusiveTargetPopoverForInvoker(node) {
    while (node) {
      const nodePopover = node.popoverTargetElement;
      if (nodePopover instanceof HTMLElement) return nodePopover;
      node = node.parentElement || getRootNode(node);
      if (node instanceof ShadowRoot2) node = node.host;
      if (node instanceof Document) return;
    }
  }
  function topMostPopoverAncestor(newPopover) {
    const popoverPositions = /* @__PURE__ */ new Map();
    let i = 0;
    for (const popover of autoPopoverList.get(newPopover.ownerDocument) || []) {
      popoverPositions.set(popover, i);
      i += 1;
    }
    popoverPositions.set(newPopover, i);
    i += 1;
    let topMostPopoverAncestor22 = null;
    function checkAncestor(candidate) {
      const candidateAncestor = nearestInclusiveOpenPopover(candidate);
      if (candidateAncestor === null) return null;
      const candidatePosition = popoverPositions.get(candidateAncestor);
      if (topMostPopoverAncestor22 === null || popoverPositions.get(topMostPopoverAncestor22) < candidatePosition) {
        topMostPopoverAncestor22 = candidateAncestor;
      }
    }
    checkAncestor(newPopover.parentElement || getRootNode(newPopover));
    return topMostPopoverAncestor22;
  }
  function isFocusable(focusTarget) {
    if (focusTarget.hidden || focusTarget instanceof ShadowRoot2) return false;
    if (focusTarget instanceof HTMLButtonElement || focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLSelectElement || focusTarget instanceof HTMLTextAreaElement || focusTarget instanceof HTMLOptGroupElement || focusTarget instanceof HTMLOptionElement || focusTarget instanceof HTMLFieldSetElement) {
      if (focusTarget.disabled) return false;
    }
    if (focusTarget instanceof HTMLInputElement && focusTarget.type === "hidden") {
      return false;
    }
    if (focusTarget instanceof HTMLAnchorElement && focusTarget.href === "") {
      return false;
    }
    return typeof focusTarget.tabIndex === "number" && focusTarget.tabIndex !== -1;
  }
  function focusDelegate(focusTarget) {
    if (focusTarget.shadowRoot && focusTarget.shadowRoot.delegatesFocus !== true) {
      return null;
    }
    let whereToLook = focusTarget;
    if (whereToLook.shadowRoot) {
      whereToLook = whereToLook.shadowRoot;
    }
    let autoFocusDelegate = whereToLook.querySelector("[autofocus]");
    if (autoFocusDelegate) {
      return autoFocusDelegate;
    } else {
      const slots = whereToLook.querySelectorAll("slot");
      for (const slot of slots) {
        const assignedElements = slot.assignedElements({ flatten: true });
        for (const el of assignedElements) {
          if (el.hasAttribute("autofocus")) {
            return el;
          } else {
            autoFocusDelegate = el.querySelector("[autofocus]");
            if (autoFocusDelegate) {
              return autoFocusDelegate;
            }
          }
        }
      }
    }
    const walker2 = focusTarget.ownerDocument.createTreeWalker(
      whereToLook,
      NodeFilter.SHOW_ELEMENT
    );
    let descendant = walker2.currentNode;
    while (descendant) {
      if (isFocusable(descendant)) {
        return descendant;
      }
      descendant = walker2.nextNode();
    }
  }
  function popoverFocusingSteps(subject) {
    focusDelegate(subject)?.focus();
  }
  var previouslyFocusedElements = /* @__PURE__ */ new WeakMap();
  function showPopover(element2) {
    if (!checkPopoverValidity(element2, false)) {
      return;
    }
    const document2 = element2.ownerDocument;
    if (!element2.dispatchEvent(
      new ToggleEvent("beforetoggle", {
        cancelable: true,
        oldState: "closed",
        newState: "open"
      })
    )) {
      return;
    }
    if (!checkPopoverValidity(element2, false)) {
      return;
    }
    let shouldRestoreFocus = false;
    if (element2.popover === "auto") {
      const originalType = element2.getAttribute("popover");
      const ancestor = topMostPopoverAncestor(element2) || document2;
      hideAllPopoversUntil(ancestor, false, true);
      if (originalType !== element2.getAttribute("popover") || !checkPopoverValidity(element2, false)) {
        return;
      }
    }
    if (!topMostAutoPopover(document2)) {
      shouldRestoreFocus = true;
    }
    previouslyFocusedElements.delete(element2);
    const originallyFocusedElement = document2.activeElement;
    element2.classList.add(":popover-open");
    visibilityState.set(element2, "showing");
    if (!topLayerElements.has(document2)) {
      topLayerElements.set(document2, /* @__PURE__ */ new Set());
    }
    topLayerElements.get(document2).add(element2);
    popoverFocusingSteps(element2);
    if (element2.popover === "auto") {
      if (!autoPopoverList.has(document2)) {
        autoPopoverList.set(document2, /* @__PURE__ */ new Set());
      }
      autoPopoverList.get(document2).add(element2);
      setInvokerAriaExpanded(popoverInvoker.get(element2), true);
    }
    if (shouldRestoreFocus && originallyFocusedElement && element2.popover === "auto") {
      previouslyFocusedElements.set(element2, originallyFocusedElement);
    }
    queuePopoverToggleEventTask(element2, "closed", "open");
  }
  function hidePopover(element2, focusPreviousElement = false, fireEvents = false) {
    if (!checkPopoverValidity(element2, true)) {
      return;
    }
    const document2 = element2.ownerDocument;
    if (element2.popover === "auto") {
      hideAllPopoversUntil(element2, focusPreviousElement, fireEvents);
      if (!checkPopoverValidity(element2, true)) {
        return;
      }
    }
    setInvokerAriaExpanded(popoverInvoker.get(element2), false);
    popoverInvoker.delete(element2);
    if (fireEvents) {
      element2.dispatchEvent(
        new ToggleEvent("beforetoggle", {
          oldState: "open",
          newState: "closed"
        })
      );
      if (!checkPopoverValidity(element2, true)) {
        return;
      }
    }
    topLayerElements.get(document2)?.delete(element2);
    autoPopoverList.get(document2)?.delete(element2);
    element2.classList.remove(":popover-open");
    visibilityState.set(element2, "hidden");
    if (fireEvents) {
      queuePopoverToggleEventTask(element2, "open", "closed");
    }
    const previouslyFocusedElement = previouslyFocusedElements.get(element2);
    if (previouslyFocusedElement) {
      previouslyFocusedElements.delete(element2);
      if (focusPreviousElement) {
        previouslyFocusedElement.focus();
      }
    }
  }
  function closeAllOpenPopovers(document2, focusPreviousElement = false, fireEvents = false) {
    let popover = topMostAutoPopover(document2);
    while (popover) {
      hidePopover(popover, focusPreviousElement, fireEvents);
      popover = topMostAutoPopover(document2);
    }
  }
  function hideAllPopoversUntil(endpoint, focusPreviousElement, fireEvents) {
    const document2 = endpoint.ownerDocument || endpoint;
    if (endpoint instanceof Document) {
      return closeAllOpenPopovers(document2, focusPreviousElement, fireEvents);
    }
    let lastToHide = null;
    let foundEndpoint = false;
    for (const popover of autoPopoverList.get(document2) || []) {
      if (popover === endpoint) {
        foundEndpoint = true;
      } else if (foundEndpoint) {
        lastToHide = popover;
        break;
      }
    }
    if (!foundEndpoint) {
      return closeAllOpenPopovers(document2, focusPreviousElement, fireEvents);
    }
    while (lastToHide && getPopoverVisibilityState(lastToHide) === "showing" && autoPopoverList.get(document2)?.size) {
      hidePopover(lastToHide, focusPreviousElement, fireEvents);
    }
  }
  var popoverPointerDownTargets = /* @__PURE__ */ new WeakMap();
  function lightDismissOpenPopovers(event) {
    if (!event.isTrusted) return;
    const target = event.composedPath()[0];
    if (!target) return;
    const document2 = target.ownerDocument;
    const topMostPopover = topMostAutoPopover(document2);
    if (!topMostPopover) return;
    const ancestor = topMostClickedPopover(target);
    if (ancestor && event.type === "pointerdown") {
      popoverPointerDownTargets.set(document2, ancestor);
    } else if (event.type === "pointerup") {
      const sameTarget = popoverPointerDownTargets.get(document2) === ancestor;
      popoverPointerDownTargets.delete(document2);
      if (sameTarget) {
        hideAllPopoversUntil(ancestor || document2, false, true);
      }
    }
  }
  var initialAriaExpandedValue = /* @__PURE__ */ new WeakMap();
  function setInvokerAriaExpanded(el, force = false) {
    if (!el) return;
    if (!initialAriaExpandedValue.has(el)) {
      initialAriaExpandedValue.set(el, el.getAttribute("aria-expanded"));
    }
    const popover = el.popoverTargetElement;
    if (popover instanceof HTMLElement && popover.popover === "auto") {
      el.setAttribute("aria-expanded", String(force));
    } else {
      const initialValue = initialAriaExpandedValue.get(el);
      if (!initialValue) {
        el.removeAttribute("aria-expanded");
      } else {
        el.setAttribute("aria-expanded", initialValue);
      }
    }
  }
  var ShadowRoot22 = globalThis.ShadowRoot || function() {
  };
  function isSupported() {
    return typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype === "object" && "popover" in HTMLElement.prototype;
  }
  function patchSelectorFn(object, name, mapper) {
    const original = object[name];
    Object.defineProperty(object, name, {
      value(selector) {
        return original.call(this, mapper(selector));
      }
    });
  }
  var nonEscapedPopoverSelector = /(^|[^\\]):popover-open\b/g;
  function hasLayerSupport() {
    return typeof globalThis.CSSLayerBlockRule === "function";
  }
  function getStyles() {
    const useLayer = hasLayerSupport();
    return `
${useLayer ? "@layer popover-polyfill {" : ""}
  :where([popover]) {
    position: fixed;
    z-index: 2147483647;
    inset: 0;
    padding: 0.25em;
    width: fit-content;
    height: fit-content;
    border-width: initial;
    border-color: initial;
    border-image: initial;
    border-style: solid;
    background-color: canvas;
    color: canvastext;
    overflow: auto;
    margin: auto;
  }

  :where([popover]:not(.\\:popover-open)) {
    display: none;
  }

  :where(dialog[popover].\\:popover-open) {
    display: block;
  }

  :where(dialog[popover][open]) {
    display: revert;
  }

  :where([anchor].\\:popover-open) {
    inset: auto;
  }

  :where([anchor]:popover-open) {
    inset: auto;
  }

  @supports not (background-color: canvas) {
    :where([popover]) {
      background-color: white;
      color: black;
    }
  }

  @supports (width: -moz-fit-content) {
    :where([popover]) {
      width: -moz-fit-content;
      height: -moz-fit-content;
    }
  }

  @supports not (inset: 0) {
    :where([popover]) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
${useLayer ? "}" : ""}
`;
  }
  var popoverStyleSheet = null;
  function injectStyles(root) {
    const styles = getStyles();
    if (popoverStyleSheet === null) {
      try {
        popoverStyleSheet = new CSSStyleSheet();
        popoverStyleSheet.replaceSync(styles);
      } catch {
        popoverStyleSheet = false;
      }
    }
    if (popoverStyleSheet === false) {
      const sheet = document.createElement("style");
      sheet.textContent = styles;
      if (root instanceof Document) {
        root.head.prepend(sheet);
      } else {
        root.prepend(sheet);
      }
    } else {
      root.adoptedStyleSheets = [popoverStyleSheet, ...root.adoptedStyleSheets];
    }
  }
  function apply() {
    if (typeof window === "undefined") return;
    window.ToggleEvent = window.ToggleEvent || ToggleEvent;
    function rewriteSelector(selector) {
      if (selector?.includes(":popover-open")) {
        selector = selector.replace(
          nonEscapedPopoverSelector,
          "$1.\\:popover-open"
        );
      }
      return selector;
    }
    patchSelectorFn(Document.prototype, "querySelector", rewriteSelector);
    patchSelectorFn(Document.prototype, "querySelectorAll", rewriteSelector);
    patchSelectorFn(Element.prototype, "querySelector", rewriteSelector);
    patchSelectorFn(Element.prototype, "querySelectorAll", rewriteSelector);
    patchSelectorFn(Element.prototype, "matches", rewriteSelector);
    patchSelectorFn(Element.prototype, "closest", rewriteSelector);
    patchSelectorFn(
      DocumentFragment.prototype,
      "querySelectorAll",
      rewriteSelector
    );
    Object.defineProperties(HTMLElement.prototype, {
      popover: {
        enumerable: true,
        configurable: true,
        get() {
          if (!this.hasAttribute("popover")) return null;
          const value2 = (this.getAttribute("popover") || "").toLowerCase();
          if (value2 === "" || value2 == "auto") return "auto";
          return "manual";
        },
        set(value2) {
          if (value2 === null) {
            this.removeAttribute("popover");
          } else {
            this.setAttribute("popover", value2);
          }
        }
      },
      showPopover: {
        enumerable: true,
        configurable: true,
        value() {
          showPopover(this);
        }
      },
      hidePopover: {
        enumerable: true,
        configurable: true,
        value() {
          hidePopover(this, true, true);
        }
      },
      togglePopover: {
        enumerable: true,
        configurable: true,
        value(force) {
          if (visibilityState.get(this) === "showing" && force === void 0 || force === false) {
            hidePopover(this, true, true);
          } else if (force === void 0 || force === true) {
            showPopover(this);
          }
        }
      }
    });
    const originalAttachShadow = Element.prototype.attachShadow;
    if (originalAttachShadow) {
      Object.defineProperties(Element.prototype, {
        attachShadow: {
          enumerable: true,
          configurable: true,
          writable: true,
          value(options) {
            const shadowRoot = originalAttachShadow.call(this, options);
            injectStyles(shadowRoot);
            return shadowRoot;
          }
        }
      });
    }
    const originalAttachInternals = HTMLElement.prototype.attachInternals;
    if (originalAttachInternals) {
      Object.defineProperties(HTMLElement.prototype, {
        attachInternals: {
          enumerable: true,
          configurable: true,
          writable: true,
          value() {
            const internals = originalAttachInternals.call(this);
            if (internals.shadowRoot) {
              injectStyles(internals.shadowRoot);
            }
            return internals;
          }
        }
      });
    }
    const popoverTargetAssociatedElements = /* @__PURE__ */ new WeakMap();
    function applyPopoverInvokerElementMixin(ElementClass) {
      Object.defineProperties(ElementClass.prototype, {
        popoverTargetElement: {
          enumerable: true,
          configurable: true,
          set(targetElement) {
            if (targetElement === null) {
              this.removeAttribute("popovertarget");
              popoverTargetAssociatedElements.delete(this);
            } else if (!(targetElement instanceof Element)) {
              throw new TypeError(
                `popoverTargetElement must be an element or null`
              );
            } else {
              this.setAttribute("popovertarget", "");
              popoverTargetAssociatedElements.set(this, targetElement);
            }
          },
          get() {
            if (this.localName !== "button" && this.localName !== "input") {
              return null;
            }
            if (this.localName === "input" && this.type !== "reset" && this.type !== "image" && this.type !== "button") {
              return null;
            }
            if (this.disabled) {
              return null;
            }
            if (this.form && this.type === "submit") {
              return null;
            }
            const targetElement = popoverTargetAssociatedElements.get(this);
            if (targetElement && targetElement.isConnected) {
              return targetElement;
            } else if (targetElement && !targetElement.isConnected) {
              popoverTargetAssociatedElements.delete(this);
              return null;
            }
            const root = getRootNode(this);
            const idref = this.getAttribute("popovertarget");
            if ((root instanceof Document || root instanceof ShadowRoot22) && idref) {
              return root.getElementById(idref) || null;
            }
            return null;
          }
        },
        popoverTargetAction: {
          enumerable: true,
          configurable: true,
          get() {
            const value2 = (this.getAttribute("popovertargetaction") || "").toLowerCase();
            if (value2 === "show" || value2 === "hide") return value2;
            return "toggle";
          },
          set(value2) {
            this.setAttribute("popovertargetaction", value2);
          }
        }
      });
    }
    applyPopoverInvokerElementMixin(HTMLButtonElement);
    applyPopoverInvokerElementMixin(HTMLInputElement);
    const handleInvokerActivation = (event) => {
      const composedPath = event.composedPath();
      const target = composedPath[0];
      if (!(target instanceof Element) || target?.shadowRoot) {
        return;
      }
      const root = getRootNode(target);
      if (!(root instanceof ShadowRoot22 || root instanceof Document)) {
        return;
      }
      const invoker = composedPath.find(
        (el) => el.matches?.("[popovertargetaction],[popovertarget]")
      );
      if (invoker) {
        popoverTargetAttributeActivationBehavior(invoker);
        event.preventDefault();
        return;
      }
    };
    const onKeydown = (event) => {
      const key = event.key;
      const target = event.target;
      if (!event.defaultPrevented && target && (key === "Escape" || key === "Esc")) {
        hideAllPopoversUntil(target.ownerDocument, true, true);
      }
    };
    const addEventListeners = (root) => {
      root.addEventListener("click", handleInvokerActivation);
      root.addEventListener("keydown", onKeydown);
      root.addEventListener("pointerdown", lightDismissOpenPopovers);
      root.addEventListener("pointerup", lightDismissOpenPopovers);
    };
    addEventListeners(document);
    injectStyles(document);
  }
  if (!isSupported()) apply();

  // node_modules/@oddbird/popover-polyfill/dist/popover-fn.js
  var ToggleEvent2 = class extends Event {
    oldState;
    newState;
    constructor(type, { oldState = "", newState = "", ...init } = {}) {
      super(type, init);
      this.oldState = String(oldState || "");
      this.newState = String(newState || "");
    }
  };
  var popoverToggleTaskQueue2 = /* @__PURE__ */ new WeakMap();
  function queuePopoverToggleEventTask2(element2, oldState, newState) {
    popoverToggleTaskQueue2.set(
      element2,
      setTimeout(() => {
        if (!popoverToggleTaskQueue2.has(element2)) return;
        element2.dispatchEvent(
          new ToggleEvent2("toggle", {
            cancelable: false,
            oldState,
            newState
          })
        );
      }, 0)
    );
  }
  var ShadowRoot3 = globalThis.ShadowRoot || function() {
  };
  var HTMLDialogElement2 = globalThis.HTMLDialogElement || function() {
  };
  var topLayerElements2 = /* @__PURE__ */ new WeakMap();
  var autoPopoverList2 = /* @__PURE__ */ new WeakMap();
  var visibilityState2 = /* @__PURE__ */ new WeakMap();
  function getPopoverVisibilityState2(popover) {
    return visibilityState2.get(popover) || "hidden";
  }
  var popoverInvoker2 = /* @__PURE__ */ new WeakMap();
  function popoverTargetAttributeActivationBehavior2(element2) {
    const popover = element2.popoverTargetElement;
    if (!(popover instanceof HTMLElement)) {
      return;
    }
    const visibility = getPopoverVisibilityState2(popover);
    if (element2.popoverTargetAction === "show" && visibility === "showing") {
      return;
    }
    if (element2.popoverTargetAction === "hide" && visibility === "hidden") return;
    if (visibility === "showing") {
      hidePopover2(popover, true, true);
    } else if (checkPopoverValidity2(popover, false)) {
      popoverInvoker2.set(popover, element2);
      showPopover2(popover);
    }
  }
  function checkPopoverValidity2(element2, expectedToBeShowing) {
    if (element2.popover !== "auto" && element2.popover !== "manual") {
      return false;
    }
    if (!element2.isConnected) return false;
    if (expectedToBeShowing && getPopoverVisibilityState2(element2) !== "showing") {
      return false;
    }
    if (!expectedToBeShowing && getPopoverVisibilityState2(element2) !== "hidden") {
      return false;
    }
    if (element2 instanceof HTMLDialogElement2 && element2.hasAttribute("open")) {
      return false;
    }
    if (document.fullscreenElement === element2) return false;
    return true;
  }
  function getStackPosition2(popover) {
    if (!popover) return 0;
    return Array.from(autoPopoverList2.get(popover.ownerDocument) || []).indexOf(
      popover
    ) + 1;
  }
  function topMostClickedPopover2(target) {
    const clickedPopover = nearestInclusiveOpenPopover2(target);
    const invokerPopover = nearestInclusiveTargetPopoverForInvoker2(target);
    if (getStackPosition2(clickedPopover) > getStackPosition2(invokerPopover)) {
      return clickedPopover;
    }
    return invokerPopover;
  }
  function topMostAutoPopover2(document2) {
    const documentPopovers = autoPopoverList2.get(document2);
    for (const popover of documentPopovers || []) {
      if (!popover.isConnected) {
        documentPopovers.delete(popover);
      } else {
        return popover;
      }
    }
    return null;
  }
  function getRootNode2(node) {
    if (typeof node.getRootNode === "function") {
      return node.getRootNode();
    }
    if (node.parentNode) return getRootNode2(node.parentNode);
    return node;
  }
  function nearestInclusiveOpenPopover2(node) {
    while (node) {
      if (node instanceof HTMLElement && node.popover === "auto" && visibilityState2.get(node) === "showing") {
        return node;
      }
      node = node instanceof Element && node.assignedSlot || node.parentElement || getRootNode2(node);
      if (node instanceof ShadowRoot3) node = node.host;
      if (node instanceof Document) return;
    }
  }
  function nearestInclusiveTargetPopoverForInvoker2(node) {
    while (node) {
      const nodePopover = node.popoverTargetElement;
      if (nodePopover instanceof HTMLElement) return nodePopover;
      node = node.parentElement || getRootNode2(node);
      if (node instanceof ShadowRoot3) node = node.host;
      if (node instanceof Document) return;
    }
  }
  function topMostPopoverAncestor2(newPopover) {
    const popoverPositions = /* @__PURE__ */ new Map();
    let i = 0;
    for (const popover of autoPopoverList2.get(newPopover.ownerDocument) || []) {
      popoverPositions.set(popover, i);
      i += 1;
    }
    popoverPositions.set(newPopover, i);
    i += 1;
    let topMostPopoverAncestor22 = null;
    function checkAncestor(candidate) {
      const candidateAncestor = nearestInclusiveOpenPopover2(candidate);
      if (candidateAncestor === null) return null;
      const candidatePosition = popoverPositions.get(candidateAncestor);
      if (topMostPopoverAncestor22 === null || popoverPositions.get(topMostPopoverAncestor22) < candidatePosition) {
        topMostPopoverAncestor22 = candidateAncestor;
      }
    }
    checkAncestor(newPopover.parentElement || getRootNode2(newPopover));
    return topMostPopoverAncestor22;
  }
  function isFocusable2(focusTarget) {
    if (focusTarget.hidden || focusTarget instanceof ShadowRoot3) return false;
    if (focusTarget instanceof HTMLButtonElement || focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLSelectElement || focusTarget instanceof HTMLTextAreaElement || focusTarget instanceof HTMLOptGroupElement || focusTarget instanceof HTMLOptionElement || focusTarget instanceof HTMLFieldSetElement) {
      if (focusTarget.disabled) return false;
    }
    if (focusTarget instanceof HTMLInputElement && focusTarget.type === "hidden") {
      return false;
    }
    if (focusTarget instanceof HTMLAnchorElement && focusTarget.href === "") {
      return false;
    }
    return typeof focusTarget.tabIndex === "number" && focusTarget.tabIndex !== -1;
  }
  function focusDelegate2(focusTarget) {
    if (focusTarget.shadowRoot && focusTarget.shadowRoot.delegatesFocus !== true) {
      return null;
    }
    let whereToLook = focusTarget;
    if (whereToLook.shadowRoot) {
      whereToLook = whereToLook.shadowRoot;
    }
    let autoFocusDelegate = whereToLook.querySelector("[autofocus]");
    if (autoFocusDelegate) {
      return autoFocusDelegate;
    } else {
      const slots = whereToLook.querySelectorAll("slot");
      for (const slot of slots) {
        const assignedElements = slot.assignedElements({ flatten: true });
        for (const el of assignedElements) {
          if (el.hasAttribute("autofocus")) {
            return el;
          } else {
            autoFocusDelegate = el.querySelector("[autofocus]");
            if (autoFocusDelegate) {
              return autoFocusDelegate;
            }
          }
        }
      }
    }
    const walker2 = focusTarget.ownerDocument.createTreeWalker(
      whereToLook,
      NodeFilter.SHOW_ELEMENT
    );
    let descendant = walker2.currentNode;
    while (descendant) {
      if (isFocusable2(descendant)) {
        return descendant;
      }
      descendant = walker2.nextNode();
    }
  }
  function popoverFocusingSteps2(subject) {
    focusDelegate2(subject)?.focus();
  }
  var previouslyFocusedElements2 = /* @__PURE__ */ new WeakMap();
  function showPopover2(element2) {
    if (!checkPopoverValidity2(element2, false)) {
      return;
    }
    const document2 = element2.ownerDocument;
    if (!element2.dispatchEvent(
      new ToggleEvent2("beforetoggle", {
        cancelable: true,
        oldState: "closed",
        newState: "open"
      })
    )) {
      return;
    }
    if (!checkPopoverValidity2(element2, false)) {
      return;
    }
    let shouldRestoreFocus = false;
    if (element2.popover === "auto") {
      const originalType = element2.getAttribute("popover");
      const ancestor = topMostPopoverAncestor2(element2) || document2;
      hideAllPopoversUntil2(ancestor, false, true);
      if (originalType !== element2.getAttribute("popover") || !checkPopoverValidity2(element2, false)) {
        return;
      }
    }
    if (!topMostAutoPopover2(document2)) {
      shouldRestoreFocus = true;
    }
    previouslyFocusedElements2.delete(element2);
    const originallyFocusedElement = document2.activeElement;
    element2.classList.add(":popover-open");
    visibilityState2.set(element2, "showing");
    if (!topLayerElements2.has(document2)) {
      topLayerElements2.set(document2, /* @__PURE__ */ new Set());
    }
    topLayerElements2.get(document2).add(element2);
    popoverFocusingSteps2(element2);
    if (element2.popover === "auto") {
      if (!autoPopoverList2.has(document2)) {
        autoPopoverList2.set(document2, /* @__PURE__ */ new Set());
      }
      autoPopoverList2.get(document2).add(element2);
      setInvokerAriaExpanded2(popoverInvoker2.get(element2), true);
    }
    if (shouldRestoreFocus && originallyFocusedElement && element2.popover === "auto") {
      previouslyFocusedElements2.set(element2, originallyFocusedElement);
    }
    queuePopoverToggleEventTask2(element2, "closed", "open");
  }
  function hidePopover2(element2, focusPreviousElement = false, fireEvents = false) {
    if (!checkPopoverValidity2(element2, true)) {
      return;
    }
    const document2 = element2.ownerDocument;
    if (element2.popover === "auto") {
      hideAllPopoversUntil2(element2, focusPreviousElement, fireEvents);
      if (!checkPopoverValidity2(element2, true)) {
        return;
      }
    }
    setInvokerAriaExpanded2(popoverInvoker2.get(element2), false);
    popoverInvoker2.delete(element2);
    if (fireEvents) {
      element2.dispatchEvent(
        new ToggleEvent2("beforetoggle", {
          oldState: "open",
          newState: "closed"
        })
      );
      if (!checkPopoverValidity2(element2, true)) {
        return;
      }
    }
    topLayerElements2.get(document2)?.delete(element2);
    autoPopoverList2.get(document2)?.delete(element2);
    element2.classList.remove(":popover-open");
    visibilityState2.set(element2, "hidden");
    if (fireEvents) {
      queuePopoverToggleEventTask2(element2, "open", "closed");
    }
    const previouslyFocusedElement = previouslyFocusedElements2.get(element2);
    if (previouslyFocusedElement) {
      previouslyFocusedElements2.delete(element2);
      if (focusPreviousElement) {
        previouslyFocusedElement.focus();
      }
    }
  }
  function closeAllOpenPopovers2(document2, focusPreviousElement = false, fireEvents = false) {
    let popover = topMostAutoPopover2(document2);
    while (popover) {
      hidePopover2(popover, focusPreviousElement, fireEvents);
      popover = topMostAutoPopover2(document2);
    }
  }
  function hideAllPopoversUntil2(endpoint, focusPreviousElement, fireEvents) {
    const document2 = endpoint.ownerDocument || endpoint;
    if (endpoint instanceof Document) {
      return closeAllOpenPopovers2(document2, focusPreviousElement, fireEvents);
    }
    let lastToHide = null;
    let foundEndpoint = false;
    for (const popover of autoPopoverList2.get(document2) || []) {
      if (popover === endpoint) {
        foundEndpoint = true;
      } else if (foundEndpoint) {
        lastToHide = popover;
        break;
      }
    }
    if (!foundEndpoint) {
      return closeAllOpenPopovers2(document2, focusPreviousElement, fireEvents);
    }
    while (lastToHide && getPopoverVisibilityState2(lastToHide) === "showing" && autoPopoverList2.get(document2)?.size) {
      hidePopover2(lastToHide, focusPreviousElement, fireEvents);
    }
  }
  var popoverPointerDownTargets2 = /* @__PURE__ */ new WeakMap();
  function lightDismissOpenPopovers2(event) {
    if (!event.isTrusted) return;
    const target = event.composedPath()[0];
    if (!target) return;
    const document2 = target.ownerDocument;
    const topMostPopover = topMostAutoPopover2(document2);
    if (!topMostPopover) return;
    const ancestor = topMostClickedPopover2(target);
    if (ancestor && event.type === "pointerdown") {
      popoverPointerDownTargets2.set(document2, ancestor);
    } else if (event.type === "pointerup") {
      const sameTarget = popoverPointerDownTargets2.get(document2) === ancestor;
      popoverPointerDownTargets2.delete(document2);
      if (sameTarget) {
        hideAllPopoversUntil2(ancestor || document2, false, true);
      }
    }
  }
  var initialAriaExpandedValue2 = /* @__PURE__ */ new WeakMap();
  function setInvokerAriaExpanded2(el, force = false) {
    if (!el) return;
    if (!initialAriaExpandedValue2.has(el)) {
      initialAriaExpandedValue2.set(el, el.getAttribute("aria-expanded"));
    }
    const popover = el.popoverTargetElement;
    if (popover instanceof HTMLElement && popover.popover === "auto") {
      el.setAttribute("aria-expanded", String(force));
    } else {
      const initialValue = initialAriaExpandedValue2.get(el);
      if (!initialValue) {
        el.removeAttribute("aria-expanded");
      } else {
        el.setAttribute("aria-expanded", initialValue);
      }
    }
  }
  var ShadowRoot23 = globalThis.ShadowRoot || function() {
  };
  function isSupported2() {
    return typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype === "object" && "popover" in HTMLElement.prototype;
  }
  function isPolyfilled() {
    return Boolean(
      document.body?.showPopover && !/native code/i.test(document.body.showPopover.toString())
    );
  }
  function patchSelectorFn2(object, name, mapper) {
    const original = object[name];
    Object.defineProperty(object, name, {
      value(selector) {
        return original.call(this, mapper(selector));
      }
    });
  }
  var nonEscapedPopoverSelector2 = /(^|[^\\]):popover-open\b/g;
  function hasLayerSupport2() {
    return typeof globalThis.CSSLayerBlockRule === "function";
  }
  function getStyles2() {
    const useLayer = hasLayerSupport2();
    return `
${useLayer ? "@layer popover-polyfill {" : ""}
  :where([popover]) {
    position: fixed;
    z-index: 2147483647;
    inset: 0;
    padding: 0.25em;
    width: fit-content;
    height: fit-content;
    border-width: initial;
    border-color: initial;
    border-image: initial;
    border-style: solid;
    background-color: canvas;
    color: canvastext;
    overflow: auto;
    margin: auto;
  }

  :where([popover]:not(.\\:popover-open)) {
    display: none;
  }

  :where(dialog[popover].\\:popover-open) {
    display: block;
  }

  :where(dialog[popover][open]) {
    display: revert;
  }

  :where([anchor].\\:popover-open) {
    inset: auto;
  }

  :where([anchor]:popover-open) {
    inset: auto;
  }

  @supports not (background-color: canvas) {
    :where([popover]) {
      background-color: white;
      color: black;
    }
  }

  @supports (width: -moz-fit-content) {
    :where([popover]) {
      width: -moz-fit-content;
      height: -moz-fit-content;
    }
  }

  @supports not (inset: 0) {
    :where([popover]) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
${useLayer ? "}" : ""}
`;
  }
  var popoverStyleSheet2 = null;
  function injectStyles2(root) {
    const styles = getStyles2();
    if (popoverStyleSheet2 === null) {
      try {
        popoverStyleSheet2 = new CSSStyleSheet();
        popoverStyleSheet2.replaceSync(styles);
      } catch {
        popoverStyleSheet2 = false;
      }
    }
    if (popoverStyleSheet2 === false) {
      const sheet = document.createElement("style");
      sheet.textContent = styles;
      if (root instanceof Document) {
        root.head.prepend(sheet);
      } else {
        root.prepend(sheet);
      }
    } else {
      root.adoptedStyleSheets = [popoverStyleSheet2, ...root.adoptedStyleSheets];
    }
  }
  function apply2() {
    if (typeof window === "undefined") return;
    window.ToggleEvent = window.ToggleEvent || ToggleEvent2;
    function rewriteSelector(selector) {
      if (selector?.includes(":popover-open")) {
        selector = selector.replace(
          nonEscapedPopoverSelector2,
          "$1.\\:popover-open"
        );
      }
      return selector;
    }
    patchSelectorFn2(Document.prototype, "querySelector", rewriteSelector);
    patchSelectorFn2(Document.prototype, "querySelectorAll", rewriteSelector);
    patchSelectorFn2(Element.prototype, "querySelector", rewriteSelector);
    patchSelectorFn2(Element.prototype, "querySelectorAll", rewriteSelector);
    patchSelectorFn2(Element.prototype, "matches", rewriteSelector);
    patchSelectorFn2(Element.prototype, "closest", rewriteSelector);
    patchSelectorFn2(
      DocumentFragment.prototype,
      "querySelectorAll",
      rewriteSelector
    );
    Object.defineProperties(HTMLElement.prototype, {
      popover: {
        enumerable: true,
        configurable: true,
        get() {
          if (!this.hasAttribute("popover")) return null;
          const value2 = (this.getAttribute("popover") || "").toLowerCase();
          if (value2 === "" || value2 == "auto") return "auto";
          return "manual";
        },
        set(value2) {
          if (value2 === null) {
            this.removeAttribute("popover");
          } else {
            this.setAttribute("popover", value2);
          }
        }
      },
      showPopover: {
        enumerable: true,
        configurable: true,
        value() {
          showPopover2(this);
        }
      },
      hidePopover: {
        enumerable: true,
        configurable: true,
        value() {
          hidePopover2(this, true, true);
        }
      },
      togglePopover: {
        enumerable: true,
        configurable: true,
        value(force) {
          if (visibilityState2.get(this) === "showing" && force === void 0 || force === false) {
            hidePopover2(this, true, true);
          } else if (force === void 0 || force === true) {
            showPopover2(this);
          }
        }
      }
    });
    const originalAttachShadow = Element.prototype.attachShadow;
    if (originalAttachShadow) {
      Object.defineProperties(Element.prototype, {
        attachShadow: {
          enumerable: true,
          configurable: true,
          writable: true,
          value(options) {
            const shadowRoot = originalAttachShadow.call(this, options);
            injectStyles2(shadowRoot);
            return shadowRoot;
          }
        }
      });
    }
    const originalAttachInternals = HTMLElement.prototype.attachInternals;
    if (originalAttachInternals) {
      Object.defineProperties(HTMLElement.prototype, {
        attachInternals: {
          enumerable: true,
          configurable: true,
          writable: true,
          value() {
            const internals = originalAttachInternals.call(this);
            if (internals.shadowRoot) {
              injectStyles2(internals.shadowRoot);
            }
            return internals;
          }
        }
      });
    }
    const popoverTargetAssociatedElements = /* @__PURE__ */ new WeakMap();
    function applyPopoverInvokerElementMixin(ElementClass) {
      Object.defineProperties(ElementClass.prototype, {
        popoverTargetElement: {
          enumerable: true,
          configurable: true,
          set(targetElement) {
            if (targetElement === null) {
              this.removeAttribute("popovertarget");
              popoverTargetAssociatedElements.delete(this);
            } else if (!(targetElement instanceof Element)) {
              throw new TypeError(
                `popoverTargetElement must be an element or null`
              );
            } else {
              this.setAttribute("popovertarget", "");
              popoverTargetAssociatedElements.set(this, targetElement);
            }
          },
          get() {
            if (this.localName !== "button" && this.localName !== "input") {
              return null;
            }
            if (this.localName === "input" && this.type !== "reset" && this.type !== "image" && this.type !== "button") {
              return null;
            }
            if (this.disabled) {
              return null;
            }
            if (this.form && this.type === "submit") {
              return null;
            }
            const targetElement = popoverTargetAssociatedElements.get(this);
            if (targetElement && targetElement.isConnected) {
              return targetElement;
            } else if (targetElement && !targetElement.isConnected) {
              popoverTargetAssociatedElements.delete(this);
              return null;
            }
            const root = getRootNode2(this);
            const idref = this.getAttribute("popovertarget");
            if ((root instanceof Document || root instanceof ShadowRoot23) && idref) {
              return root.getElementById(idref) || null;
            }
            return null;
          }
        },
        popoverTargetAction: {
          enumerable: true,
          configurable: true,
          get() {
            const value2 = (this.getAttribute("popovertargetaction") || "").toLowerCase();
            if (value2 === "show" || value2 === "hide") return value2;
            return "toggle";
          },
          set(value2) {
            this.setAttribute("popovertargetaction", value2);
          }
        }
      });
    }
    applyPopoverInvokerElementMixin(HTMLButtonElement);
    applyPopoverInvokerElementMixin(HTMLInputElement);
    const handleInvokerActivation = (event) => {
      const composedPath = event.composedPath();
      const target = composedPath[0];
      if (!(target instanceof Element) || target?.shadowRoot) {
        return;
      }
      const root = getRootNode2(target);
      if (!(root instanceof ShadowRoot23 || root instanceof Document)) {
        return;
      }
      const invoker = composedPath.find(
        (el) => el.matches?.("[popovertargetaction],[popovertarget]")
      );
      if (invoker) {
        popoverTargetAttributeActivationBehavior2(invoker);
        event.preventDefault();
        return;
      }
    };
    const onKeydown = (event) => {
      const key = event.key;
      const target = event.target;
      if (!event.defaultPrevented && target && (key === "Escape" || key === "Esc")) {
        hideAllPopoversUntil2(target.ownerDocument, true, true);
      }
    };
    const addEventListeners = (root) => {
      root.addEventListener("click", handleInvokerActivation);
      root.addEventListener("keydown", onKeydown);
      root.addEventListener("pointerdown", lightDismissOpenPopovers2);
      root.addEventListener("pointerup", lightDismissOpenPopovers2);
    };
    addEventListeners(document);
    injectStyles2(document);
  }

  // js/utils.js
  function inject(callback) {
    let styles = callback({
      css: (strings, ...values) => `@layer base { ${strings.raw[0] + values.join("")} }`
    });
    if (document.adoptedStyleSheets === void 0) {
      let styleElement = document.createElement("style");
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      return;
    }
    let sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  function closest(el, condition) {
    let current = el;
    while (current) {
      if (condition(current)) return current;
      current = current.parentElement;
    }
  }
  function walker(el, callback) {
    let walker2 = document.createTreeWalker(
      el,
      NodeFilter.SHOW_ELEMENT,
      callback ? {
        acceptNode: (el2) => {
          let skipped, rejected;
          callback(el2, {
            skip: () => skipped = true,
            reject: () => rejected = true
          });
          if (skipped) return NodeFilter.FILTER_SKIP;
          if (rejected) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      } : {}
    );
    return new Traverse(walker2);
  }
  var Traverse = class {
    constructor(walker2) {
      this.walker = walker2;
    }
    from(el) {
      this.walker.currentNode = el;
      return this;
    }
    first() {
      return this.walker.firstChild();
    }
    last() {
      return this.walker.lastChild();
    }
    next(el) {
      this.walker.currentNode = el;
      return this.walker.nextSibling();
    }
    nextOrFirst(el) {
      let found = this.next(el);
      if (found) return found;
      this.walker.currentNode = this.walker.root;
      return this.first();
    }
    prev(el) {
      this.walker.currentNode = el;
      return this.walker.previousSibling();
    }
    prevOrLast(el) {
      let found = this.prev(el);
      if (found) return found;
      this.walker.currentNode = this.walker.root;
      return this.last();
    }
    closest(el, condition) {
      let walker2 = this.from(el).walker;
      while (walker2.currentNode) {
        if (condition(walker2.currentNode)) return walker2.currentNode;
        walker2.parentNode();
      }
    }
    contains(el) {
      return this.find((i) => i === el);
    }
    find(callback) {
      return this.walk((el, bail) => {
        callback(el) && bail(el);
      });
    }
    findOrFirst(callback) {
      let found = this.find(callback);
      if (!found) this.walker.currentNode = this.walker.root;
      return this.first();
    }
    each(callback) {
      this.walk((el) => callback(el));
    }
    some(callback) {
      return !!this.find(callback);
    }
    every(callback) {
      let every = true;
      this.walk((el) => {
        callback(el) || (every = false);
      });
      return every;
    }
    map(callback) {
      let els = [];
      this.walk((el) => els.push(callback(el)));
      return els;
    }
    filter(callback) {
      let els = [];
      this.walk((el) => callback(el) && els.push(el));
      return els;
    }
    walk(callback) {
      let current;
      let walker2 = this.walker;
      let bailed;
      while (walker2.nextNode()) {
        current = walker2.currentNode;
        callback(current, (bailValue) => bailed = bailValue);
        if (bailed !== void 0) {
          break;
        }
      }
      return bailed;
    }
  };
  function element(name, type) {
    customElements.define(`ui-${name}`, type);
  }
  function on(target, event, handler, options = {}) {
    target.addEventListener(event, handler, options);
    return {
      off: () => target.removeEventListener(event, handler),
      pause: (callback) => {
        target.removeEventListener(event, handler), callback();
        target.addEventListener(event, handler);
      }
    };
  }
  function isFocusable3(el) {
    let selectors = [
      "a[href]",
      "area[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "iframe",
      "object",
      "embed",
      "[tabindex]",
      "[contenteditable]"
    ];
    return selectors.some((selector) => el.matches(selector)) && el.tabIndex >= 0;
  }
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      let context = this, args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  var using = "pointer";
  document.addEventListener("keydown", () => using = "keyboard", { capture: true });
  document.addEventListener("pointerdown", (e) => {
    using = e.pointerType === "mouse" ? "mouse" : "touch";
  }, { capture: true });
  function isUsingKeyboard() {
    return using === "keyboard";
  }
  function isUsingTouch() {
    return using === "touch";
  }
  function search(el, callback) {
    let runningQuery = "";
    let clearRunningQuery = debounce(() => {
      runningQuery = "";
    }, 300);
    el.addEventListener("keydown", (e) => {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        runningQuery += e.key;
        callback(runningQuery);
        e.stopPropagation();
      }
      clearRunningQuery();
    });
  }
  function dispenseId(el, prefix) {
    return "lofi-" + (prefix ? prefix + "-" : "") + Math.random().toString(16).slice(2);
  }
  function assignId(el, prefix) {
    let id = el.hasAttribute("id") ? el.getAttribute("id") : dispenseId(el, prefix);
    setAttribute2(el, "id", id);
    if (!el._x_bindings) el._x_bindings = {};
    if (!el._x_bindings.id) el._x_bindings.id = id;
    return id;
  }
  function detangle() {
    let blocked = false;
    return (callback) => (...args) => {
      if (blocked) return;
      blocked = true;
      callback(...args);
      blocked = false;
    };
  }
  function interest(trigger, panel, { gain, lose, focusable, useSafeArea }) {
    let engaged = false;
    focusable && document.addEventListener("focusin", (e) => {
      if (!isUsingKeyboard()) return;
      if (trigger.contains(e.target) || panel.contains(e.target)) {
        engaged = true;
        gain();
      } else {
        engaged = false;
        lose();
      }
    });
    let removeSafeArea = () => {
    };
    let removePointerMoveHandler = () => {
    };
    let disinterest = () => {
      engaged = false;
      lose();
      removeSafeArea();
      removePointerMoveHandler();
    };
    let clear = () => {
      engaged = false;
      removeSafeArea();
      removePointerMoveHandler();
    };
    trigger.addEventListener("pointerenter", (e) => {
      if (isUsingTouch()) return;
      if (engaged) return;
      engaged = true;
      gain();
      setTimeout(() => {
        let { safeArea, redraw: redrawSafeArea, remove } = useSafeArea ? createSafeArea(trigger, panel, e.clientX, e.clientY) : nullSafeArea();
        removeSafeArea = remove;
        let pointerStoppedOverSafeAreaTimeout;
        let pointerMoveHandler = throttle((e2) => {
          let panelRect = panel.getBoundingClientRect();
          let triggerRect = trigger.getBoundingClientRect();
          let mouseState;
          if (safeArea.contains(e2.target) && mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, e2.clientX, e2.clientY)) mouseState = "safeArea";
          else if (panel.contains(e2.target)) mouseState = "panel";
          else if (trigger.contains(e2.target)) mouseState = "trigger";
          else mouseState = "outside";
          if (pointerStoppedOverSafeAreaTimeout) {
            clearTimeout(pointerStoppedOverSafeAreaTimeout);
          }
          switch (mouseState) {
            case "outside":
              disinterest();
              break;
            case "trigger":
              redrawSafeArea(e2.clientX, e2.clientY);
              break;
            case "panel":
              removeSafeArea();
              break;
            case "safeArea":
              redrawSafeArea(e2.clientX, e2.clientY);
              pointerStoppedOverSafeAreaTimeout = setTimeout(() => {
                disinterest();
              }, 300);
              break;
            default:
              break;
          }
        }, 100);
        document.addEventListener("pointermove", pointerMoveHandler);
        removePointerMoveHandler = () => document.removeEventListener("pointermove", pointerMoveHandler);
      });
    });
    return { clear };
  }
  function createSafeArea(trigger, panel, x, y) {
    let safeArea = document.createElement("div");
    let panelRect = panel.getBoundingClientRect();
    let triggerRect = trigger.getBoundingClientRect();
    safeArea.style.position = "fixed";
    setAttribute2(safeArea, "data-safe-area", "");
    let draw = (x2, y2) => {
      if (panelRect.top === 0 && panelRect.bottom === 0) return;
      let direction;
      if (panelRect.left < triggerRect.left) direction = "left";
      if (panelRect.right > triggerRect.right) direction = "right";
      if (panelRect.top < triggerRect.top && panelRect.bottom < y2) direction = "up";
      if (panelRect.bottom > triggerRect.bottom && panelRect.top > y2) direction = "down";
      if (direction === void 0) direction = "right";
      let left, right, width, top, bottom, height, offset3, shape;
      let padding = 10;
      switch (direction) {
        case "left":
          left = panelRect.right;
          right = Math.max(panelRect.right, x2) + 5;
          width = right - left;
          top = Math.min(triggerRect.top, panelRect.top) - padding;
          bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding;
          height = bottom - top;
          offset3 = y2 - top;
          shape = `polygon(0% 0%, 100% ${offset3}px, 0% 100%)`;
          break;
        case "right":
          left = Math.min(panelRect.left, x2) - 5;
          right = panelRect.left;
          width = right - left;
          top = Math.min(triggerRect.top, panelRect.top) - padding;
          bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding;
          height = bottom - top;
          offset3 = y2 - top;
          shape = `polygon(0% ${offset3}px, 100% 0%, 100% 100%)`;
          break;
        case "up":
          left = Math.min(x2, panelRect.left) - padding;
          right = Math.max(x2, panelRect.right) + padding;
          width = right - left;
          top = panelRect.bottom;
          bottom = Math.max(panelRect.bottom, y2) + 5;
          height = bottom - top;
          offset3 = x2 - left;
          shape = `polygon(0% 0%, 100% 0%, ${offset3}px 100%)`;
          break;
        case "down":
          left = Math.min(x2, panelRect.left) - padding;
          right = Math.max(x2, panelRect.right) + padding;
          width = right - left;
          top = Math.min(panelRect.top, y2) - 5;
          bottom = panelRect.top;
          height = bottom - top;
          offset3 = x2 - left;
          shape = `polygon(${offset3}px 0%, 100% 100%, 0% 100%)`;
          break;
      }
      safeArea.style.left = `${left}px`;
      safeArea.style.top = `${top}px`;
      safeArea.style.width = `${width}px`;
      safeArea.style.height = `${height}px`;
      safeArea.style.clipPath = shape;
    };
    return {
      safeArea,
      redraw: (x2, y2) => {
        if (!safeArea.isConnected) trigger.appendChild(safeArea);
        draw(x2, y2);
      },
      remove: () => {
        safeArea.remove();
      }
    };
  }
  function mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, x, y) {
    return !mouseIsOverTrigger(triggerRect, x, y) && !mouseIsOverPanel(panelRect, x, y);
  }
  function mouseIsOverTrigger(triggerRect, x, y) {
    if (triggerRect.left <= x && x <= triggerRect.right && (triggerRect.top <= y && y <= triggerRect.bottom)) return true;
    return false;
  }
  function mouseIsOverPanel(panelRect, x, y) {
    if (panelRect.left <= x && x <= panelRect.right && (panelRect.top <= y && y <= panelRect.bottom)) return true;
    return false;
  }
  function setAttribute2(el, name, value2) {
    if (el._durableAttributeObserver === void 0) {
      el._durableAttributeObserver = attributeObserver(el, [name]);
    }
    if (!el._durableAttributeObserver.hasAttribute(name)) {
      el._durableAttributeObserver.addAttribute(name);
    }
    el._durableAttributeObserver.pause(() => {
      el.setAttribute(name, value2);
    });
  }
  function removeAndReleaseAttribute(el, name) {
    removeAttribute(el, name);
    releaseAttribute(el, name);
  }
  function removeAttribute(el, name) {
    if (el._durableAttributeObserver === void 0) {
      el._durableAttributeObserver = attributeObserver(el, [name]);
    }
    if (!el._durableAttributeObserver.hasAttribute(name)) {
      el._durableAttributeObserver.addAttribute(name);
    }
    el._durableAttributeObserver.pause(() => {
      el.removeAttribute(name);
    });
  }
  function releaseAttribute(el, name) {
    if (!el?._durableAttributeObserver?.hasAttribute(name)) return;
    el._durableAttributeObserver.releaseAttribute(name);
  }
  function attributeObserver(el, initialAttributes) {
    let processMutations = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.oldValue === null) {
          el._durableAttributeObserver.pause(() => removeAttribute(el, mutation.attributeName));
        } else {
          el._durableAttributeObserver.pause(() => setAttribute2(el, mutation.attributeName, mutation.oldValue));
        }
      });
    };
    let observer = new MutationObserver((mutations) => processMutations(mutations));
    observer.observe(el, { attributeFilter: initialAttributes, attributeOldValue: true });
    return {
      attributes: initialAttributes,
      hasAttribute(name) {
        return this.attributes.includes(name);
      },
      addAttribute(name) {
        this.attributes.includes(name) || this.attributes.push(name);
        observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true });
      },
      releaseAttribute(name) {
        if (!this.hasAttribute(name)) return;
        observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true });
      },
      pause(callback) {
        processMutations(observer.takeRecords());
        observer.disconnect();
        callback();
        observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true });
      }
    };
  }
  function nullSafeArea() {
    return {
      safeArea: { contains: () => false },
      redraw: () => {
      },
      remove: () => {
      }
    };
  }
  function debounce(callback, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }
  var lockCount = 0;
  function lockScroll(allowScroll = false) {
    if (allowScroll) return { lock: () => {
    }, unlock: () => {
    } };
    let undoLockStyles = () => {
    };
    return {
      lock() {
        lockCount++;
        if (lockCount > 1) return;
        undoLockStyles = chain(
          setStyle(document.documentElement, "paddingRight", `${window.innerWidth - document.documentElement.clientWidth}px`),
          setStyle(document.documentElement, "overflow", "hidden")
        );
      },
      unlock() {
        lockCount = Math.max(0, lockCount - 1);
        undoLockStyles();
      }
    };
  }
  function setStyle(element2, style, value2) {
    let currentValue = element2.style[style];
    element2.style[style] = value2;
    return () => {
      element2.style[style] = currentValue;
    };
  }
  function chain(...fns) {
    return (...args) => {
      for (let fn of fns) {
        fn(...args);
      }
    };
  }
  function initFauxButton(el, isDisabled, action) {
    let ifKey = (key, callback) => (e) => {
      if (e.key === key && !isDisabled()) {
        callback();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    setAttribute2(el, "role", "button");
    let syncDisabledAttributes = () => {
      if (el.hasAttribute("disabled")) {
        setAttribute2(el, "aria-disabled", "true");
        setAttribute2(el, "tabindex", "-1");
      } else {
        removeAttribute(el, "aria-disabled");
        setAttribute2(el, "tabindex", "0");
      }
    };
    let observer = new MutationObserver(() => syncDisabledAttributes());
    observer.observe(el, { attributes: true, attributeFilter: ["disabled"] });
    syncDisabledAttributes();
    on(el, "click", () => action());
    on(el, "keydown", ifKey("Enter", () => action()));
    on(el, "keydown", ifKey(" ", () => {
    }));
    on(el, "keyup", ifKey(" ", () => action()));
  }
  function responsiveAttributeValue(el, name, fallback = null) {
    let getValue = () => {
      let value2 = el.getAttribute(name);
      let breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536
      };
      for (let [breakpoint, minWidth] of Object.entries(breakpoints).reverse()) {
        let responsiveValue = el.getAttribute(`${breakpoint}:${name}`);
        if (responsiveValue && window.innerWidth >= minWidth) {
          return responsiveValue;
        }
      }
      return value2 || fallback;
    };
    let currentValue = getValue();
    let callbacks = [];
    new ResizeObserver(() => {
      let newValue = getValue();
      let memo = JSON.stringify(currentValue);
      if (JSON.stringify(newValue) !== memo) {
        currentValue = newValue;
        callbacks.forEach((callback) => callback(newValue));
      }
    }).observe(window.document.documentElement);
    return [currentValue, (callback) => callbacks.push(callback)];
  }
  function getLocale() {
    return navigator?.language || document.documentElement.lang || "en-US";
  }
  function hydrateTemplate(template, slotsAndAttributes = { slots: {}, attrs: {} }) {
    let { slots = {}, attrs = {} } = slotsAndAttributes;
    let clone = template.content.cloneNode(true).firstElementChild;
    Object.entries(slots).forEach(([key, value2]) => {
      let slotNodes = key === "default" ? clone.querySelectorAll("slot:not([name])") : clone.querySelectorAll(`slot[name="${key}"]`);
      slotNodes.forEach((i) => i.replaceWith(
        typeof value2 === "string" ? document.createTextNode(value2) : value2
      ));
    });
    clone.querySelectorAll("slot").forEach((slot) => slot.remove());
    Object.entries(attrs).forEach(([key, value2]) => {
      clone.setAttribute(key, value2);
    });
    return clone;
  }

  // js/element.js
  var UIElement = class extends HTMLElement {
    constructor() {
      super();
      this.boot?.();
    }
    connectedCallback() {
      queueMicrotask(() => {
        this.mount?.();
      });
    }
    mixin(func, options = {}) {
      return new func(this, options);
    }
    // @todo: this is redundant now...
    appendMixin(func, options = {}) {
      return new func(this, options);
    }
    use(func) {
      let found;
      this.mixins.forEach((mixin) => {
        if (mixin instanceof func) found = mixin;
      });
      return found;
    }
    uses(func) {
      let found;
      this.mixins.forEach((mixin) => {
        if (mixin instanceof func) found = true;
      });
      return !!found;
    }
    on(event, handler) {
      return on(this, event, handler);
    }
    root(name, attributes = {}) {
      if (name === void 0) return this.__root;
      let el = document.createElement(name);
      for (let name2 in attributes) {
        setAttribute(el, name2, attributes[name2]);
      }
      let shadow = this.attachShadow({ mode: "open" });
      el.appendChild(document.createElement("slot"));
      shadow.appendChild(el);
      this.__root = el;
      return this.__root;
    }
  };
  var UIControl = class extends UIElement {
    //
  };

  // js/mixins/mixin.js
  var Mixin = class {
    constructor(el, options = {}) {
      this.el = el;
      this.grouped = options.grouped === void 0 ? true : false;
      this.el.mixins = this.el.mixins ? this.el.mixins : /* @__PURE__ */ new Map();
      this.el.mixins.set(this.constructor.name, this);
      this.el[this.constructor.name] = true;
      if (!this.el.use) this.el.use = UIElement.prototype.use.bind(this.el);
      this.opts = options;
      this.boot?.({
        options: (defaults) => {
          let options2 = defaults;
          Object.entries(this.opts).forEach(([key, value2]) => {
            if (value2 !== void 0) {
              options2[key] = value2;
            }
          });
          this.opts = options2;
        }
      });
      queueMicrotask(() => {
        this.mount?.();
      });
    }
    options() {
      return this.opts;
    }
    hasGroup() {
      return !!this.group();
    }
    group() {
      if (this.grouped === false) return;
      return closest(this.el, (i) => i[this.groupedByType.name])?.use(this.groupedByType);
    }
    on(event, handler) {
      return on(this.el, event, handler);
    }
  };
  var MixinGroup = class extends Mixin {
    constructor(el, options = {}) {
      super(el, options);
    }
    walker() {
      return walker(this.el, (el, { skip, reject }) => {
        if (el[this.constructor.name] && el !== this.el) return reject();
        if (!el[this.groupOfType.name]) return skip();
        if (!el.mixins.get(this.groupOfType.name).grouped) return skip();
      });
    }
  };

  // js/mixins/controllable.js
  var Controllable = class extends Mixin {
    boot({ options }) {
      this.initialState = this.el.value;
      this.getterFunc = () => {
      };
      this.setterFunc = (value2) => this.initialState = value2;
      Object.defineProperty(this.el, "value", {
        get: () => {
          return this.getterFunc();
        },
        set: (value2) => {
          this.setterFunc(value2);
        }
      });
    }
    initial(callback) {
      callback(this.initialState);
    }
    getter(func) {
      this.getterFunc = func;
    }
    setter(func) {
      this.setterFunc = func;
    }
    dispatch() {
      this.el.dispatchEvent(new Event("input", {
        bubbles: false,
        cancelable: true
      }));
      this.el.dispatchEvent(new Event("change", {
        bubbles: false,
        cancelable: true
      }));
    }
  };

  // js/mixins/disclosable.js
  var Disclosable = class extends Mixin {
    boot({ options }) {
      this.onChanges = [];
      this.state = false;
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    getState() {
      return this.state;
    }
    setState(value2) {
      let oldState = this.state;
      this.state = !!value2;
      if (this.state !== oldState) {
        this.onChanges.forEach((i) => i());
      }
    }
  };

  // js/disclosure.js
  var UIDisclosure = class extends UIElement {
    boot() {
      let button = this.button();
      let details = this.details();
      if (!button) {
        return console.warn("ui-disclosure: no trigger element found", this);
      } else if (!details) {
        return console.warn("ui-disclosure: no panel element found", this);
      }
      this._disabled = this.hasAttribute("disabled");
      this._controllable = new Controllable(this, { disabled: this._disabled });
      details._disclosable = new Disclosable(details);
      this._controllable.initial((initial) => initial && details._disclosable.setState(true));
      this._controllable.getter(() => details._disclosable.getState());
      this._controllable.setter((value2) => details._disclosable.setState(value2));
      details._disclosable.onChange(() => {
        this.dispatchEvent(new CustomEvent("lofi-disclosable-change", { bubbles: true }));
        this._controllable.dispatch();
      });
      let refresh = () => {
        if (details._disclosable.getState()) {
          setAttribute2(this, "data-open", "");
          setAttribute2(button, "data-open", "");
          setAttribute2(details, "data-open", "");
        } else {
          removeAttribute(this, "data-open");
          removeAttribute(button, "data-open");
          removeAttribute(details, "data-open");
        }
      };
      details._disclosable.onChange(() => refresh());
      refresh();
      if (!this._disabled) {
        on(button, "click", (e) => {
          details._disclosable.setState(!details._disclosable.getState());
        });
      }
      let id = assignId(details, "disclosure");
      setAttribute2(button, "aria-controls", id);
      setAttribute2(button, "aria-expanded", "false");
      details._disclosable.onChange(() => {
        details._disclosable.getState() ? setAttribute2(button, "aria-expanded", "true") : setAttribute2(button, "aria-expanded", "false");
      });
      if (this.hasAttribute("open")) {
        details._disclosable.setState(true);
      }
    }
    button() {
      return this.querySelector("button");
    }
    details() {
      return this.lastElementChild;
    }
  };
  var UIDisclosureGroup = class _UIDisclosureGroup extends UIElement {
    boot() {
      this.exclusive = this.hasAttribute("exclusive");
      if (this.exclusive) {
        on(this, "lofi-disclosable-change", (e) => {
          e.stopPropagation();
          if (e.target.localName === "ui-disclosure" && e.target.value) {
            this.disclosureWalker().each((el) => {
              if (el === e.target) return;
              el.value = false;
            });
          }
        });
      }
    }
    disclosureWalker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof _UIDisclosureGroup && el !== this) return reject();
        if (el.localName !== "ui-disclosure") return reject();
      });
    }
  };
  inject(({ css }) => css`ui-disclosure { display: block; }`);
  element("disclosure", UIDisclosure);
  element("disclosure-group", UIDisclosureGroup);

  // js/resizable.js
  var UIResizable = class extends UIElement {
    boot() {
    }
  };
  var UIGrip = class extends UIElement {
    boot() {
      let dimension = this.hasAttribute("resize") ? this.getAttribute("resize") : "both";
      let shrink = this.hasAttribute("shrink");
      let container = this.closest("ui-resizable");
      let maxWidth, maxHeight;
      let hasAttemptedAResizeYet = false;
      if (!container) throw "Resizable container not found";
      this.addEventListener("pointerdown", (e) => {
        if (!hasAttemptedAResizeYet) {
          maxWidth = container.offsetWidth;
          maxHeight = container.offsetHeight;
          hasAttemptedAResizeYet = true;
        }
        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = parseInt(getComputedStyle(container).width, 10);
        let startHeight = parseInt(getComputedStyle(container).height, 10);
        let resize = (e2) => {
          let width = startWidth + (e2.clientX - startX);
          let height = startHeight + (e2.clientY - startY);
          if (dimension === "width" || dimension === "both") {
            if (shrink) {
              container.style.width = `${Math.min(width, maxWidth)}px`;
            } else {
              container.style.width = `${width}px`;
            }
          }
          if (dimension === "height" || dimension === "both") {
            if (shrink) {
              container.style.height = `${Math.min(height, maxHeight)}px`;
            } else {
              container.style.height = `${height}px`;
            }
          }
        };
        document.addEventListener("pointermove", resize);
        document.addEventListener("pointerup", () => {
          this.releasePointerCapture(e.pointerId);
          document.removeEventListener("pointermove", resize);
        }, { once: true });
        this.setPointerCapture(e.pointerId);
      });
    }
  };
  inject(({ css }) => css`ui-resizable { display: block; }`);
  element("resizable", UIResizable);
  element("grip", UIGrip);

  // js/mixins/selectable.js
  var SelectableGroup = class extends MixinGroup {
    groupOfType = Selectable;
    boot({ options }) {
      options({
        multiple: false
      });
      this.state = this.options().multiple ? /* @__PURE__ */ new Set() : null;
      this.onChanges = [];
    }
    onInitAndChange(callback) {
      callback();
      this.onChanges.push(callback);
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    changed(selectable, silent = false) {
      if (selectable.ungrouped) return;
      let value2 = selectable.value;
      let selected = selectable.isSelected();
      let multiple = this.options().multiple;
      if (selected) {
        multiple ? this.state.add(value2) : this.state = value2;
      } else {
        multiple ? this.state.delete(value2) : this.state = null;
      }
      if (!silent) {
        this.onChanges.forEach((i) => i());
      }
    }
    getState() {
      return this.options().multiple ? Array.from(this.state) : this.state;
    }
    hasValue(value2) {
      return this.options().multiple ? this.state.has(value2) : this.state === value2;
    }
    setState(value2) {
      if (value2 === null || value2 === "") value2 = this.options().multiple ? [] : "";
      if (this.options().multiple) {
        if (!Array.isArray(value2)) value2 = [value2];
        value2 = value2.map((i) => i + "");
      } else {
        value2 = value2 + "";
      }
      this.state = this.options().multiple ? new Set(value2) : value2;
      let values = this.options().multiple ? value2 : [value2];
      this.walker().each((el) => {
        let selectable = el.use(Selectable);
        if (selectable.ungrouped) return;
        let selected = values.includes(selectable.value);
        if (selected && !selectable.isSelected()) {
          selectable.surgicallySelect();
        } else if (!selected && selectable.isSelected()) {
          selectable.surgicallyDeselect();
        }
      });
      this.onChanges.forEach((i) => i());
    }
    selected() {
      return this.walker().find((item) => item.use(Selectable).isSelected()).use(Selectable);
    }
    selecteds() {
      return this.walker().filter((el) => el.use(Selectable).isSelected()).map((el) => el.use(Selectable));
    }
    selectFirst() {
      this.walker().first()?.use(Selectable).select();
    }
    selectAll() {
      this.walker().filter((el) => !el.use(Selectable).isSelected()).map((el) => el.use(Selectable).select());
    }
    deselectAll() {
      this.walker().filter((el) => el.use(Selectable).isSelected()).map((el) => el.use(Selectable).deselect());
    }
    allAreSelected() {
      return this.walker().filter((el) => el.use(Selectable).isSelected()).length === this.walker().filter((el) => true).length;
    }
    noneAreSelected() {
      return this.state === null || this.state?.size === 0;
    }
    selectableByValue(value2) {
      return this.walker().find((el) => el.use(Selectable).value === value2)?.use(Selectable);
    }
    deselectOthers(except) {
      this.walker().each((el) => {
        if (el === except) return;
        el.use(Selectable).surgicallyDeselect();
      });
    }
    selectedTextValue() {
      if (!this.options().multiple) return this.convertValueStringToElementText(this.state);
      return Array.from(this.state).map((i) => {
        return this.convertValueStringToElementText(i);
      }).join(", ");
    }
    convertValueStringToElementText(value2) {
      let selected = this.findByValue(value2);
      if (selected) {
        return selected.label || selected.value;
      } else {
        return value2;
      }
    }
    findByValue(value2) {
      return this.selecteds().find((i) => i.value === value2);
    }
    walker() {
      return walker(this.el, (el, { skip, reject }) => {
        if (el[this.constructor.name] && el !== this.el) return reject();
        if (!el[this.groupOfType.name]) return skip();
        if (el.mixins.get(this.groupOfType.name).ungrouped) return skip();
      });
    }
  };
  var Selectable = class extends Mixin {
    boot({ options }) {
      this.groupedByType = SelectableGroup;
      options({
        ungrouped: false,
        togglable: false,
        value: void 0,
        label: void 0,
        selectedInitially: false,
        dataAttr: "data-selected",
        ariaAttr: "aria-selected"
      });
      this.ungrouped = this.options().ungrouped;
      this.value = this.options().value === void 0 ? this.el.value : this.options().value;
      this.value = this.value + "";
      this.label = this.options().label;
      let state = this.options().selectedInitially;
      if (this.group()) {
        if (this.group().hasValue(this.value)) state = true;
      }
      this.multiple = this.hasGroup() ? this.group().options().multiple : false;
      this.toggleable = this.options().toggleable || this.multiple;
      this.onSelects = [];
      this.onUnselects = [];
      this.onChanges = [];
      if (state) {
        this.select(true);
      } else {
        this.state = state;
        this.surgicallyDeselect(true);
      }
    }
    mount() {
      this.el.hasAttribute(this.options().ariaAttr) || setAttribute2(this.el, this.options().ariaAttr, "false");
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    onSelect(callback) {
      this.onSelects.push(callback);
    }
    onUnselect(callback) {
      this.onUnselects.push(callback);
    }
    setState(value2) {
      value2 ? this.select() : this.deselect();
    }
    getState() {
      return this.state;
    }
    // @todo: depricate in favor of "trigger"...
    press() {
      this.toggleable ? this.toggle() : this.select();
    }
    trigger() {
      this.toggleable ? this.toggle() : this.select();
    }
    toggle() {
      this.isSelected() ? this.deselect() : this.select();
    }
    isSelected() {
      return this.state;
    }
    select(silent = false) {
      let changed = !this.isSelected();
      this.toggleable || this.group()?.deselectOthers(this.el);
      this.state = true;
      setAttribute2(this.el, this.options().ariaAttr, "true");
      setAttribute2(this.el, this.options().dataAttr, "");
      if (changed) {
        if (!silent) {
          this.onSelects.forEach((i) => i());
          this.onChanges.forEach((i) => i());
        }
        this.group()?.changed(this, silent);
      }
    }
    surgicallySelect() {
      let changed = !this.isSelected();
      this.state = true;
      setAttribute2(this.el, this.options().ariaAttr, "true");
      setAttribute2(this.el, this.options().dataAttr, "");
      if (changed) {
        this.onSelects.forEach((i) => i());
        this.onChanges.forEach((i) => i());
      }
    }
    deselect(notify = true) {
      let changed = this.isSelected();
      this.state = false;
      setAttribute2(this.el, this.options().ariaAttr, "false");
      removeAttribute(this.el, this.options().dataAttr);
      if (changed) {
        this.onUnselects.forEach((i) => i());
        this.onChanges.forEach((i) => i());
        notify && this.group()?.changed(this);
      }
    }
    surgicallyDeselect(silent = false) {
      let changed = this.isSelected();
      this.state = false;
      setAttribute2(this.el, this.options().ariaAttr, "false");
      removeAttribute(this.el, this.options().dataAttr);
      if (changed && !silent) {
        this.onUnselects.forEach((i) => i());
        this.onChanges.forEach((i) => i());
      }
    }
    getValue() {
      return this.value;
    }
    getLabel() {
      return this.label;
    }
  };

  // js/mixins/disableable.js
  var Disableable = class extends Mixin {
    boot({ options }) {
      this.onChanges = [];
      Object.defineProperty(this.el, "disabled", {
        get: () => {
          return this.el.hasAttribute("disabled");
        },
        set: (value2) => {
          if (value2) {
            this.el.setAttribute("disabled", "");
          } else {
            this.el.removeAttribute("disabled");
          }
        }
      });
      if (this.el.hasAttribute("disabled")) {
        this.el.disabled = true;
      } else if (this.el.closest("[disabled]")) {
        this.el.disabled = true;
      }
      let observer = new MutationObserver((mutations) => {
        this.onChanges.forEach((i) => i(this.el.disabled));
      });
      observer.observe(this.el, { attributeFilter: ["disabled"] });
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    onInitAndChange(callback) {
      callback(this.el.disabled);
      this.onChanges.push(callback);
    }
    enabled(callback) {
      return (...args) => {
        if (this.el.disabled) return;
        return callback(...args);
      };
    }
    disabled(callback) {
      return (...args) => {
        if (!this.el.disabled) return;
        return callback(...args);
      };
    }
    isDisabled() {
      return this.el.disabled;
    }
  };

  // js/checkbox.js
  var UICheckboxGroup = class _UICheckboxGroup extends UIControl {
    boot() {
      this._disableable = new Disableable(this);
      let undoDisableds = [];
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          this.walker().each((el) => {
            if (!el.hasAttribute("disabled")) {
              el.setAttribute("disabled", "");
              undoDisableds.push(() => el.removeAttribute("disabled"));
            }
          });
        } else {
          undoDisableds.forEach((fn) => fn());
          undoDisableds = [];
        }
      });
      this._selectable = new SelectableGroup(this, { multiple: true });
      this._controllable = new Controllable(this, { disabled: this._disabled });
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      this._detangled = detangle();
      this._controllable.setter(this._detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(this._detangled(() => {
        this._controllable.dispatch();
      }));
      setAttribute2(this, "role", "group");
    }
    initCheckAll(checkAll) {
      let detangled = detangle();
      checkAll._selectable.onChange(detangled(() => {
        if (checkAll.indeterminate) {
          this._selectable.selectAll();
          checkAll.checked = true;
          checkAll.indeterminate = false;
        } else if (checkAll.checked) {
          this._selectable.selectAll();
          checkAll.checked = true;
          checkAll.indeterminate = false;
        } else {
          this._selectable.deselectAll();
          checkAll.checked = false;
          checkAll.indeterminate = false;
        }
      }));
      let setCheckAllIndeterminate = () => {
        if (this._selectable.allAreSelected()) {
          checkAll.indeterminate = false;
          checkAll._selectable.select();
        } else if (this._selectable.noneAreSelected()) {
          checkAll.indeterminate = false;
          checkAll._selectable.deselect();
        } else {
          checkAll.indeterminate = true;
        }
      };
      this._selectable.onChange(detangled(() => {
        setCheckAllIndeterminate();
      }));
      setCheckAllIndeterminate();
    }
    walker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof _UICheckboxGroup) return reject();
        if (!(el.localName === "ui-checkbox")) return skip();
      });
    }
  };
  var UICheckbox = class extends UIControl {
    boot() {
      let button = this;
      this.isIndeterminate = false;
      this._disableable = new Disableable(this);
      if (this.hasAttribute("all")) {
        this._selectable = new Selectable(button, {
          ungrouped: true,
          toggleable: true,
          value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
          label: this.hasAttribute("label") ? this.getAttribute("label") : null,
          selectedInitially: this.hasAttribute("checked"),
          dataAttr: "data-checked",
          ariaAttr: "aria-checked"
        });
        queueMicrotask(() => {
          this.closest("ui-checkbox-group")?.initCheckAll(this);
        });
      } else {
        this._selectable = new Selectable(button, {
          toggleable: true,
          dataAttr: "data-checked",
          ariaAttr: "aria-checked",
          value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
          label: this.hasAttribute("label") ? this.getAttribute("label") : null,
          selectedInitially: this.hasAttribute("checked")
        });
        this._selectable.onChange(() => {
          if (this.indeterminate) this.indeterminate = false;
        });
        this.value = this._selectable.getValue();
      }
      this._detangled = detangle();
      this._selectable.onChange(this._detangled(() => {
        this.dispatchEvent(new Event("input", { bubbles: false, cancelable: true }));
        this.dispatchEvent(new Event("change", { bubbles: false, cancelable: true }));
      }));
      setAttribute2(button, "role", "checkbox");
      this._disableable.onInitAndChange((disabled) => {
        disabled ? removeAttribute(button, "tabindex", "0") : setAttribute2(button, "tabindex", "0");
      });
      on(button, "click", this._disableable.disabled((e) => {
        e.preventDefault();
        e.stopPropagation();
      }), { capture: true });
      on(button, "click", this._disableable.enabled((e) => {
        this._selectable.press();
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === "Enter") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keyup", this._disableable.enabled((e) => {
        if (e.key === " ") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      respondToLabelClick(button);
    }
    get checked() {
      return this._selectable.isSelected();
    }
    set checked(value2) {
      let groupDetangled = this.closest("ui-checkbox-group")?._detangled || ((i) => i);
      this._detangled(groupDetangled(() => {
        value2 ? this._selectable.select() : this._selectable.deselect();
      }))();
    }
    get indeterminate() {
      return this.isIndeterminate;
    }
    set indeterminate(value2) {
      this.isIndeterminate = !!value2;
      if (this.isIndeterminate) {
        setAttribute2(this, "data-indeterminate", "");
      } else {
        removeAttribute(this, "data-indeterminate");
      }
    }
  };
  element("checkbox-group", UICheckboxGroup);
  element("checkbox", UICheckbox);
  inject(({ css }) => css`ui-checkbox-group { display: block; user-select: none; }`);
  inject(({ css }) => css`ui-checkbox { display: inline-block; user-select: none; }`);
  function respondToLabelClick(el) {
    el.closest("label")?.addEventListener("click", (e) => {
      if (!el.contains(e.target)) {
        el._selectable.press();
      }
    });
  }

  // js/mixins/popoverable.js
  var currentlyOpenPopoversByScope = /* @__PURE__ */ new Map();
  var Popoverable = class extends Mixin {
    boot({ options }) {
      options({ triggers: [], scope: null });
      let scope = this.options().scope || "global";
      setAttribute2(this.el, "popover", "manual");
      this.triggers = this.options().triggers;
      this.onChanges = [];
      this.state = false;
      on(this.el, "beforetoggle", (e) => {
        let oldState = this.state;
        this.state = e.newState === "open";
        if (this.state) {
          closeOtherOpenPopovers(this.el, scope);
          let controller = new AbortController();
          let activeElement = document.activeElement;
          let triggers = [...this.triggers, activeElement];
          setTimeout(() => {
            closeOnClickOutside(this.el, triggers, controller);
            closeOnFocusAway(this.el, triggers, controller);
            closeOnEscape(this.el, triggers, controller);
          });
          this.el.addEventListener("beforetoggle", (e2) => {
            if (e2.newState === "closed") {
              controller.abort();
              activeElement?.focus();
            }
          }, { signal: controller.signal });
        }
        if (oldState !== this.state) {
          this.onChanges.forEach((i) => i(this.state, oldState));
        }
      });
      on(this.el, "toggle", (e) => {
        if (e.newState === "open") {
          if (!currentlyOpenPopoversByScope.has(scope)) {
            currentlyOpenPopoversByScope.set(scope, /* @__PURE__ */ new Set());
          }
          currentlyOpenPopoversByScope.get(scope).add(this.el);
        } else if (e.newState === "closed") {
          if (!currentlyOpenPopoversByScope.has(scope)) return;
          currentlyOpenPopoversByScope.get(scope).delete(this.el);
          if (currentlyOpenPopoversByScope.get(scope).size === 0) {
            currentlyOpenPopoversByScope.delete(scope);
          }
        }
      });
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    setState(value2) {
      value2 ? this.show() : this.hide();
    }
    getState() {
      return this.state;
    }
    toggle() {
      this.el.togglePopover();
    }
    show() {
      this.el.showPopover();
    }
    hide() {
      this.el.hidePopover();
    }
  };
  function closeOtherOpenPopovers(el, scope) {
    if (!currentlyOpenPopoversByScope.has(scope)) return;
    currentlyOpenPopoversByScope.get(scope).forEach((popoverEl) => {
      if (el.contains(popoverEl) || popoverEl.contains(el)) return;
      popoverEl.hidePopover();
    });
  }
  function closeOnClickOutside(el, except, controller) {
    document.addEventListener("click", (e) => {
      if (el.contains(e.target) || except.includes(e.target)) return;
      el.hidePopover();
    }, { signal: controller.signal });
  }
  function closeOnFocusAway(el, except, controller) {
    document.addEventListener("focusin", (e) => {
      if (el.contains(e.target) || except.includes(e.target)) return;
      controller.abort();
      el.hidePopover();
    }, {
      // Without "capture: true", when you focus away from the popover onto an element that triggers a popover
      // on focus (a tooltip), it will focus back this popover's trigger instead of keeping focus on the tooltip button.
      // It does this because only one popover can be open at a time, so focusing the tooltip, opens a popover, closing this one,
      // which will trigger the "focus back" behavior.
      capture: true,
      signal: controller.signal
    });
  }
  function closeOnEscape(el, except, controller) {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      el.hidePopover();
    }, { signal: controller.signal });
  }

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
  var min = Math.min;
  var max = Math.max;
  var round = Math.round;
  var floor = Math.floor;
  var createCoords = (v) => ({
    x: v,
    y: v
  });
  var oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  var oppositeAlignmentMap = {
    start: "end",
    end: "start"
  };
  function clamp(start, value2, end) {
    return max(start, min(value2, end));
  }
  function evaluate(value2, param) {
    return typeof value2 === "function" ? value2(param) : value2;
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getOppositeAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function getAxisLength(axis) {
    return axis === "y" ? "height" : "width";
  }
  function getSideAxis(placement) {
    return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
  }
  function getSideList(side, isStart, rtl) {
    const lr = ["left", "right"];
    const rl = ["right", "left"];
    const tb = ["top", "bottom"];
    const bt = ["bottom", "top"];
    switch (side) {
      case "top":
      case "bottom":
        if (rtl) return isStart ? rl : lr;
        return isStart ? lr : rl;
      case "left":
      case "right":
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === "start", rtl);
    if (alignment) {
      list = list.map((side) => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== "number" ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  // node_modules/@floating-ui/core/dist/floating-ui.core.mjs
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === "y";
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }
  var computePosition = async (reference, floating, config) => {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
    let rects = await platform2.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform: platform2,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === "object") {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform2.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform: platform2,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = "clippingAncestors",
      rootBoundary = "viewport",
      elementContext = "floating",
      altBoundary = false,
      padding = 0
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === "floating" ? "reference" : "floating";
    const element2 = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
      element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element2))) != null ? _await$platform$isEle : true) ? element2 : element2.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === "floating" ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
    } : rects.reference;
    const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
    const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements,
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }
  var flip = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "flip",
      options,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform: platform2,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = "bestFit",
          fallbackAxisSideDirection = "none",
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements2 = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides2 = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];
        if (!overflows.every((side2) => side2 <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements2[nextIndex];
          if (nextPlacement) {
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
          let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case "bestFit": {
                var _overflowsData$filter2;
                const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === "y";
                  }
                  return true;
                }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement2) {
                  resetPlacement = placement2;
                }
                break;
              }
              case "initialPlacement":
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };
  async function convertValueToCoords(state, options) {
    const {
      placement,
      platform: platform2,
      elements
    } = state;
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === "y";
    const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === "number" ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
    };
    if (alignment && typeof alignmentAxis === "number") {
      crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }
  var offset = function(options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: "offset",
      options,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state;
        const diffCoords = await convertValueToCoords(state, options);
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };
  var shift = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "shift",
      options,
      async fn(state) {
        const {
          x,
          y,
          placement
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: (_ref) => {
              let {
                x: x2,
                y: y2
              } = _ref;
              return {
                x: x2,
                y: y2
              };
            }
          },
          ...detectOverflowOptions
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === "y" ? "top" : "left";
          const maxSide = mainAxis === "y" ? "bottom" : "right";
          const min2 = mainAxisCoord + overflow[minSide];
          const max2 = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min2, mainAxisCoord, max2);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === "y" ? "top" : "left";
          const maxSide = crossAxis === "y" ? "bottom" : "right";
          const min2 = crossAxisCoord + overflow[minSide];
          const max2 = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min2, crossAxisCoord, max2);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis
            }
          }
        };
      }
    };
  };
  var size = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "size",
      options,
      async fn(state) {
        var _state$middlewareData, _state$middlewareData2;
        const {
          placement,
          rects,
          platform: platform2,
          elements
        } = state;
        const {
          apply: apply3 = () => {
          },
          ...detectOverflowOptions
        } = evaluate(options, state);
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const side = getSide(placement);
        const alignment = getAlignment(placement);
        const isYAxis = getSideAxis(placement) === "y";
        const {
          width,
          height
        } = rects.floating;
        let heightSide;
        let widthSide;
        if (side === "top" || side === "bottom") {
          heightSide = side;
          widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
        } else {
          widthSide = side;
          heightSide = alignment === "end" ? "top" : "bottom";
        }
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        const maximumClippingWidth = width - overflow.left - overflow.right;
        const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
        const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
        const noShift = !state.middlewareData.shift;
        let availableHeight = overflowAvailableHeight;
        let availableWidth = overflowAvailableWidth;
        if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
          availableWidth = maximumClippingWidth;
        }
        if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
          availableHeight = maximumClippingHeight;
        }
        if (noShift && !alignment) {
          const xMin = max(overflow.left, 0);
          const xMax = max(overflow.right, 0);
          const yMin = max(overflow.top, 0);
          const yMax = max(overflow.bottom, 0);
          if (isYAxis) {
            availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
          } else {
            availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
          }
        }
        await apply3({
          ...state,
          availableWidth,
          availableHeight
        });
        const nextDimensions = await platform2.getDimensions(elements.floating);
        if (width !== nextDimensions.width || height !== nextDimensions.height) {
          return {
            reset: {
              rects: true
            }
          };
        }
        return {};
      }
    };
  };

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || "").toLowerCase();
    }
    return "#document";
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value2) {
    if (!hasWindow()) {
      return false;
    }
    return value2 instanceof Node || value2 instanceof getWindow(value2).Node;
  }
  function isElement(value2) {
    if (!hasWindow()) {
      return false;
    }
    return value2 instanceof Element || value2 instanceof getWindow(value2).Element;
  }
  function isHTMLElement(value2) {
    if (!hasWindow()) {
      return false;
    }
    return value2 instanceof HTMLElement || value2 instanceof getWindow(value2).HTMLElement;
  }
  function isShadowRoot(value2) {
    if (!hasWindow() || typeof ShadowRoot === "undefined") {
      return false;
    }
    return value2 instanceof ShadowRoot || value2 instanceof getWindow(value2).ShadowRoot;
  }
  function isOverflowElement(element2) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle2(element2);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
  }
  function isTableElement(element2) {
    return ["table", "td", "th"].includes(getNodeName(element2));
  }
  function isTopLayer(element2) {
    return [":popover-open", ":modal"].some((selector) => {
      try {
        return element2.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
    return ["transform", "translate", "scale", "rotate", "perspective"].some((value2) => css[value2] ? css[value2] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((value2) => (css.willChange || "").includes(value2)) || ["paint", "layout", "strict", "content"].some((value2) => (css.contain || "").includes(value2));
  }
  function getContainingBlock(element2) {
    let currentNode = getParentNode(element2);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("-webkit-backdrop-filter", "none");
  }
  function isLastTraversableNode(node) {
    return ["html", "body", "#document"].includes(getNodeName(node));
  }
  function getComputedStyle2(element2) {
    return getWindow(element2).getComputedStyle(element2);
  }
  function getNodeScroll(element2) {
    if (isElement(element2)) {
      return {
        scrollLeft: element2.scrollLeft,
        scrollTop: element2.scrollTop
      };
    }
    return {
      scrollLeft: element2.scrollX,
      scrollTop: element2.scrollY
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result = (
      // Step into the shadow DOM of the parent of a slotted node.
      node.assignedSlot || // DOM Element detected.
      node.parentNode || // ShadowRoot detected.
      isShadowRoot(node) && node.host || // Fallback.
      getDocumentElement(node)
    );
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  // node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
  function getCssDimensions(element2) {
    const css = getComputedStyle2(element2);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element2);
    const offsetWidth = hasOffset ? element2.offsetWidth : width;
    const offsetHeight = hasOffset ? element2.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }
  function unwrapElement(element2) {
    return !isElement(element2) ? element2.contextElement : element2;
  }
  function getScale(element2) {
    const domElement = unwrapElement(element2);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;
    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  var noOffsets = /* @__PURE__ */ createCoords(0);
  function getVisualOffsets(element2) {
    const win = getWindow(element2);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element2, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element2)) {
      return false;
    }
    return isFixed;
  }
  function getBoundingClientRect(element2, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element2.getBoundingClientRect();
    const domElement = unwrapElement(element2);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element2);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle2(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }
  function getWindowScrollBarX(element2, rect) {
    const leftScroll = getNodeScroll(element2).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element2)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }
  function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
    if (ignoreScrollbarX === void 0) {
      ignoreScrollbarX = false;
    }
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
      // RTL <body> scrollbar.
      getWindowScrollBarX(documentElement, htmlRect)
    ));
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === "fixed";
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }
  function getClientRects(element2) {
    return Array.from(element2.getClientRects());
  }
  function getDocumentRect(element2) {
    const html = getDocumentElement(element2);
    const scroll = getNodeScroll(element2);
    const body = element2.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element2);
    const y = -scroll.scrollTop;
    if (getComputedStyle2(body).direction === "rtl") {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getViewportRect(element2, strategy) {
    const win = getWindow(element2);
    const html = getDocumentElement(element2);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getInnerBoundingClientRect(element2, strategy) {
    const clientRect = getBoundingClientRect(element2, true, strategy === "fixed");
    const top = clientRect.top + element2.clientTop;
    const left = clientRect.left + element2.clientLeft;
    const scale = isHTMLElement(element2) ? getScale(element2) : createCoords(1);
    const width = element2.clientWidth * scale.x;
    const height = element2.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element2, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === "viewport") {
      rect = getViewportRect(element2, strategy);
    } else if (clippingAncestor === "document") {
      rect = getDocumentRect(getDocumentElement(element2));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element2);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element2, stopNode) {
    const parentNode = getParentNode(element2);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
  }
  function getClippingElementAncestors(element2, cache) {
    const cachedResult = cache.get(element2);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element2, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle2(element2).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element2) : element2;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle2(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === "fixed") {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element2, currentNode);
      if (shouldDropCurrentNode) {
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element2, result);
    return result;
  }
  function getClippingRect(_ref) {
    let {
      element: element2,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element2) ? [] : getClippingElementAncestors(element2, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element2, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element2, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  function getDimensions(element2) {
    const {
      width,
      height
    } = getCssDimensions(element2);
    return {
      width,
      height
    };
  }
  function getRectRelativeToOffsetParent(element2, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === "fixed";
    const rect = getBoundingClientRect(element2, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }
  function isStaticPositioned(element2) {
    return getComputedStyle2(element2).position === "static";
  }
  function getTrueOffsetParent(element2, polyfill) {
    if (!isHTMLElement(element2) || getComputedStyle2(element2).position === "fixed") {
      return null;
    }
    if (polyfill) {
      return polyfill(element2);
    }
    let rawOffsetParent = element2.offsetParent;
    if (getDocumentElement(element2) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }
  function getOffsetParent(element2, polyfill) {
    const win = getWindow(element2);
    if (isTopLayer(element2)) {
      return win;
    }
    if (!isHTMLElement(element2)) {
      let svgOffsetParent = getParentNode(element2);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element2, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element2) || win;
  }
  var getElementRects = async function(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };
  function isRTL(element2) {
    return getComputedStyle2(element2).direction === "rtl";
  }
  var platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };
  function rectsAreEqual(a, b) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }
  function observeMove(element2, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element2);
    function cleanup() {
      var _io;
      clearTimeout(timeoutId);
      (_io = io) == null || _io.disconnect();
      io = null;
    }
    function refresh(skip, threshold) {
      if (skip === void 0) {
        skip = false;
      }
      if (threshold === void 0) {
        threshold = 1;
      }
      cleanup();
      const elementRectForRootMargin = element2.getBoundingClientRect();
      const {
        left,
        top,
        width,
        height
      } = elementRectForRootMargin;
      if (!skip) {
        onMove();
      }
      if (!width || !height) {
        return;
      }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
      const options = {
        rootMargin,
        threshold: max(0, min(1, threshold)) || 1
      };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) {
            return refresh();
          }
          if (!ratio) {
            timeoutId = setTimeout(() => {
              refresh(false, 1e-7);
            }, 1e3);
          } else {
            refresh(false, ratio);
          }
        }
        if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element2.getBoundingClientRect())) {
          refresh();
        }
        isFirstUpdate = false;
      }
      try {
        io = new IntersectionObserver(handleObserve, {
          ...options,
          // Handle <iframe>s
          root: root.ownerDocument
        });
      } catch (e) {
        io = new IntersectionObserver(handleObserve, options);
      }
      io.observe(element2);
    }
    refresh(true);
    return cleanup;
  }
  function autoUpdate(reference, floating, update, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      ancestorScroll = true,
      ancestorResize = true,
      elementResize = typeof ResizeObserver === "function",
      layoutShift = typeof IntersectionObserver === "function",
      animationFrame = false
    } = options;
    const referenceEl = unwrapElement(reference);
    const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.addEventListener("scroll", update, {
        passive: true
      });
      ancestorResize && ancestor.addEventListener("resize", update);
    });
    const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
    let reobserveFrame = -1;
    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver((_ref) => {
        let [firstEntry] = _ref;
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            var _resizeObserver;
            (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
          });
        }
        update();
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      var _resizeObserver2;
      ancestors.forEach((ancestor) => {
        ancestorScroll && ancestor.removeEventListener("scroll", update);
        ancestorResize && ancestor.removeEventListener("resize", update);
      });
      cleanupIo == null || cleanupIo();
      (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
      resizeObserver = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }
  var offset2 = offset;
  var shift2 = shift;
  var flip2 = flip;
  var size2 = size;
  var computePosition2 = (reference, floating, options) => {
    const cache = /* @__PURE__ */ new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  // js/mixins/anchorable.js
  var Anchorable = class extends Mixin {
    boot({ options }) {
      options({
        reference: null,
        auto: true,
        position: "bottom start",
        gap: "5",
        offset: "0",
        matchWidth: false,
        crossAxis: false
      });
      if (this.options().reference === null) return;
      if (this.options().position === null) return;
      let [setPosition, cleanupDurablePositioning] = createDurablePositionSetter(this.el);
      let reposition = anchor(this.el, this.options().reference, setPosition, {
        position: this.options().position,
        gap: this.options().gap,
        offset: this.options().offset,
        matchWidth: this.options().matchWidth,
        crossAxis: this.options().crossAxis
      });
      let cleanupAutoUpdate = () => {
      };
      this.reposition = (...args) => {
        if (this.options().auto) {
          cleanupAutoUpdate = autoUpdate(this.options().reference, this.el, reposition);
        } else {
          reposition(null, ...args);
        }
      };
      this.cleanup = () => {
        cleanupAutoUpdate();
        cleanupDurablePositioning();
      };
    }
  };
  function anchor(target, invoke, setPosition, { position, offset: offsetValue, gap, matchWidth, crossAxis }) {
    return (event, forceX, forceY) => {
      computePosition2(invoke, target, {
        placement: compilePlacement(position),
        // Placements: ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']
        middleware: [
          // Offset needs to be first, as per the Floating UI docs...
          offset2({
            mainAxis: Number(gap),
            alignmentAxis: Number(offsetValue)
          }),
          flip2(),
          shift2({ padding: 5, crossAxis }),
          size2({
            padding: 5,
            apply({ rects, elements, availableHeight }) {
              if (matchWidth) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`
                });
              }
              elements.floating.style.maxHeight = availableHeight >= elements.floating.scrollHeight ? "" : `${availableHeight}px`;
            }
          })
        ]
      }).then(({ x, y }) => {
        setPosition(forceX || x, forceY || y);
      });
    };
  }
  function compilePlacement(anchor2) {
    return anchor2.split(" ").join("-");
  }
  function createDurablePositionSetter(target) {
    let position = (x, y) => {
      Object.assign(target.style, {
        position: "absolute",
        overflowY: "auto",
        left: `${x}px`,
        top: `${y}px`,
        // This is required to reset the `popover` default styles, otherwise the dropdown appears in the middle of the screen...
        right: "auto",
        bottom: "auto"
      });
    };
    let lastX, lastY;
    let observer = new MutationObserver(() => position(lastX, lastY));
    return [
      (x, y) => {
        lastX = x;
        lastY = y;
        observer.disconnect();
        position(lastX, lastY);
        observer.observe(target, { attributeFilter: ["style"] });
      },
      () => {
        observer.disconnect();
      }
    ];
  }

  // js/dropdown.js
  var UIDropdown = class extends UIElement {
    boot() {
      let trigger = this.trigger();
      let overlay = this.overlay();
      if (!trigger) {
        return console.warn("ui-dropdown: no trigger element found", this);
      } else if (!overlay) {
        return console.warn("ui-dropdown: no [popover] overlay found", this);
      }
      this._disabled = this.hasAttribute("disabled");
      this._controllable = new Controllable(this);
      overlay._popoverable = new Popoverable(overlay);
      overlay._anchorable = new Anchorable(overlay, {
        reference: trigger,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      overlay._popoverable.onChange(() => {
        overlay._popoverable.getState() ? overlay._anchorable.reposition() : overlay._anchorable.cleanup();
      });
      if (["ui-menu", "ui-context"].includes(overlay.localName)) {
        let { lock, unlock } = lockScroll();
        overlay._popoverable.onChange(() => {
          overlay._popoverable.getState() ? lock() : unlock();
        });
      }
      this._controllable.initial((initial) => overlay._popoverable.setState(initial));
      this._controllable.getter(() => overlay._popoverable.getState());
      let detangled = detangle();
      this._controllable.setter((value2) => overlay._popoverable.setState(value2));
      overlay._popoverable.onChange(detangled(() => this._controllable.dispatch()));
      if (this.hasAttribute("hover")) {
        interest(trigger, overlay, {
          gain() {
            overlay._popoverable.setState(true);
          },
          lose() {
            overlay._popoverable.setState(false);
          },
          focusable: true
        });
      }
      on(trigger, "click", () => overlay._popoverable.toggle());
      if (overlay._popoverable.getState()) {
        setAttribute2(this, "data-open", "");
        setAttribute2(trigger, "data-open", "");
        setAttribute2(overlay, "data-open", "");
      } else {
        removeAttribute(this, "data-open");
        removeAttribute(trigger, "data-open");
        removeAttribute(overlay, "data-open");
      }
      overlay._popoverable.onChange(() => {
        if (overlay._popoverable.getState()) {
          setAttribute2(this, "data-open", "");
          setAttribute2(trigger, "data-open", "");
          setAttribute2(overlay, "data-open", "");
        } else {
          removeAttribute(this, "data-open");
          removeAttribute(trigger, "data-open");
          removeAttribute(overlay, "data-open");
        }
      });
      let id = assignId(overlay, "dropdown");
      setAttribute2(trigger, "aria-haspopup", "true");
      setAttribute2(trigger, "aria-controls", id);
      setAttribute2(trigger, "aria-expanded", overlay._popoverable.getState() ? "true" : "false");
      overlay._popoverable.onChange(() => {
        setAttribute2(trigger, "aria-expanded", overlay._popoverable.getState() ? "true" : "false");
      });
      overlay._popoverable.onChange(() => {
        setTimeout(
          () => overlay._popoverable.getState() ? overlay.onPopoverShow?.() : overlay.onPopoverHide?.()
        );
      });
    }
    trigger() {
      return this.querySelector("button");
    }
    overlay() {
      return this.lastElementChild?.matches("[popover]") && this.lastElementChild;
    }
  };
  element("dropdown", UIDropdown);

  // js/calendar/date.js
  var DateValue = class _DateValue {
    constructor(year, month, day = 1) {
      this._date = new Date(Date.UTC(year, month - 1, day));
    }
    isBetween(min2, max2) {
      if (!min2 && !max2) return true;
      if (!min2) return this._date <= max2._date;
      if (!max2) return this._date >= min2._date;
      return this._date >= min2._date && this._date <= max2._date;
    }
    isSameDay(date) {
      if (!date) return false;
      return this._date.getUTCDate() === date._date.getUTCDate() && this._date.getUTCMonth() === date._date.getUTCMonth() && this._date.getUTCFullYear() === date._date.getUTCFullYear();
    }
    isBefore(date) {
      if (!date) return false;
      return this._date < date._date;
    }
    isAfter(date) {
      if (!date) return false;
      return this._date > date._date;
    }
    /** Immutable manipulators */
    incrementDays(days) {
      let copy = this.getCopy();
      copy._date.setUTCDate(copy._date.getUTCDate() + days);
      return copy;
    }
    addMonths(months) {
      let copy = this.getCopy();
      copy._date.setUTCMonth(copy._date.getUTCMonth() + months);
      return copy;
    }
    addDays(days) {
      let copy = this.getCopy();
      copy._date.setUTCDate(copy._date.getUTCDate() + days);
      return copy;
    }
    /** Getters */
    getYear() {
      return this._date.getUTCFullYear();
    }
    getMonth() {
      return this._date.getUTCMonth() + 1;
    }
    getPaddedMonth() {
      return String(this.getMonth()).padStart(2, "0");
    }
    getDay() {
      return this._date.getUTCDate();
    }
    getPaddedDay() {
      return String(this.getDay()).padStart(2, "0");
    }
    getDate() {
      return this._date;
    }
    getCopy() {
      return new _DateValue(this.getYear(), this.getMonth(), this.getDay());
    }
    getDayOfWeek() {
      return this._date.getUTCDay();
    }
    getDaysInMonth() {
      return new _DateValue(this.getYear(), this.getMonth() + 1, 0).getDay();
    }
    getFirstDayOfMonth() {
      return new _DateValue(this.getYear(), this.getMonth(), 1).getDayOfWeek();
    }
    getWeekNumber() {
      let firstDayOfYear = new Date(Date.UTC(this._date.getUTCFullYear(), 0, 1));
      let firstThursday = new Date(firstDayOfYear);
      firstThursday.setUTCDate(1 + (11 - firstDayOfYear.getUTCDay()) % 7);
      let targetThursday = new Date(this._date);
      targetThursday.setUTCDate(this._date.getUTCDate() + (11 - this._date.getUTCDay()) % 7);
      let weeksBetween = Math.floor((targetThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1e3));
      return weeksBetween + 1;
    }
    /** Setters */
    setDay(day) {
      this._date.setUTCDate(day);
    }
    setMonth(month) {
      this._date.setUTCMonth(month - 1);
    }
    setYear(year) {
      this._date.setUTCFullYear(year);
    }
    /** Static factories: */
    static fromIsoDateString(isoString) {
      if (!isoString) return null;
      let [year, month, day] = isoString.split("T")[0]?.split("-")?.map(Number);
      return new _DateValue(year, month, day);
    }
    static fromLocalDate(date) {
      if (!date) return null;
      return new _DateValue(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
    static fromDate(date) {
      if (!date) return null;
      return new _DateValue(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
    static fromParts(year, month, day) {
      return new _DateValue(year, month, day);
    }
    static today() {
      return _DateValue.fromDate(/* @__PURE__ */ new Date());
    }
    /** Formats */
    toIsoDateString() {
      return [this.getYear(), this.getPaddedMonth(), this.getPaddedDay()].join("-");
    }
    toParts() {
      return [this.getYear(), this.getMonth(), this.getDay()];
    }
    toDate() {
      return new Date(this.getYear(), this.getMonth() - 1, this.getDay());
    }
    toFormattedString(locale, options) {
      return this.toDate().toLocaleDateString(locale, options);
    }
  };

  // js/calendar/render.js
  function renderMonth(monthEl, config, viewState, metadata) {
    let headingTemplate = monthEl.querySelector('template[name="heading"]');
    let weekdayTemplate = monthEl.querySelector('template[name="weekday"]');
    let weekTemplate = monthEl.querySelector('template[name="week"]');
    headingTemplate && renderHeading(headingTemplate, config, viewState);
    weekdayTemplate && renderWeekdays(weekdayTemplate, config);
    weekTemplate && renderDates(weekTemplate, config, viewState, metadata);
  }
  function renderHeading(template, config, viewState) {
    renderTemplate(template, (hydrate) => {
      return hydrate({
        slots: {
          default: new Intl.DateTimeFormat(config.locale, {
            month: template.hasAttribute("display") ? template.getAttribute("display") : "long",
            year: "numeric",
            timeZone: "UTC"
          }).format(new DateValue(viewState.year, viewState.month).getDate())
        }
      });
    });
  }
  function renderWeekdays(template, config) {
    let format = (date) => {
      if (template.hasAttribute("display")) {
        return new Intl.DateTimeFormat(config.locale, { weekday: template.getAttribute("display") }).format(date);
      }
      let formatter = new Intl.DateTimeFormat(config.locale, { weekday: "short" });
      let safeTwoCharLocales = ["en", "es", "de", "fr", "it", "pt"];
      if (safeTwoCharLocales.includes(config.locale.split("-")[0])) {
        return formatter.format(date).slice(0, 2);
      }
      return formatter.format(date);
    };
    let weekdays = Array.from({ length: 7 }, (_, idx) => {
      let adjustedIdx = (idx + config.startDay) % 7;
      let date = new Date(2024, 0, adjustedIdx + 7);
      return format(date);
    });
    renderTemplate(template, (hydrate) => {
      return weekdays.map((weekday) => hydrate({ slots: { default: weekday } }));
    });
  }
  function renderDates(template, config, viewState, metadata) {
    let month = viewState.month;
    let year = viewState.year;
    let firstDay = (new DateValue(year, month).getFirstDayOfMonth() - config.startDay + 7) % 7;
    let totalDays = new DateValue(year, month).getDaysInMonth();
    let [prevYear, prevMonth] = new DateValue(year, month).addMonths(-1).toParts();
    let prevMonthDays = new DateValue(prevYear, prevMonth).getDaysInMonth();
    let [displayDates, actualDates] = [[], []];
    for (let i = 0; i < firstDay; i++) {
      displayDates.push(0);
      let prevDate = prevMonthDays - firstDay + i + 1;
      actualDates.push(new DateValue(prevYear, prevMonth, prevDate).toIsoDateString());
    }
    for (let i = 1; i <= totalDays; i++) {
      displayDates.push(i);
      actualDates.push(new DateValue(year, month, i).toIsoDateString());
    }
    let totalCells = firstDay + totalDays;
    let remainingDays = (7 - totalCells % 7) % 7;
    let [nextYear, nextMonth] = new DateValue(year, month).addMonths(1).toParts();
    for (let i = 1; i <= remainingDays; i++) {
      displayDates.push(0);
      actualDates.push(new DateValue(nextYear, nextMonth, i).toIsoDateString());
    }
    if (config.fixedWeeks) {
      let currentWeeks = Math.ceil(displayDates.length / 7);
      let targetWeeks = config.fixedWeeks;
      let weeksDiff = targetWeeks - currentWeeks;
      if (weeksDiff > 0) {
        for (let i = 0; i < weeksDiff * 7; i++) {
          displayDates.push(0);
          actualDates.push(DateValue.fromIsoDateString(actualDates[actualDates.length - 1]).addDays(1).toIsoDateString());
        }
      } else if (weeksDiff < 0) {
        displayDates.length = targetWeeks * 7;
        actualDates.length = targetWeeks * 7;
      }
    }
    let splitIntoWeeks = (arr) => Array.from(
      { length: Math.ceil(arr.length / 7) },
      (_, idx) => arr.slice(idx * 7, (idx + 1) * 7)
    );
    let displayWeeks = splitIntoWeeks(displayDates);
    let actualWeeks = splitIntoWeeks(actualDates);
    renderTemplate(template, (hydrate) => {
      return displayWeeks.map((week, weekIdx) => {
        let weekEl = hydrate();
        let actualWeekDates = actualWeeks[weekIdx];
        let numberTemplate = weekEl.querySelector('template[name="number"]');
        if (numberTemplate) {
          let fourthDayIdx = (4 - config.startDay + 7) % 7;
          let weekNumber = DateValue.fromIsoDateString(actualWeekDates[fourthDayIdx]).getWeekNumber();
          renderTemplate(numberTemplate, (hydrate2) => {
            return hydrate2({ slots: { default: weekNumber } });
          });
        }
        renderTemplate(weekEl.querySelector('template[name="day"]'), (hydrate2) => {
          return week.map((day, dayIdx) => {
            if (day === 0) {
              let weekDate = DateValue.fromIsoDateString(actualWeekDates[dayIdx]);
              let dayNumber = weekDate.getDay();
              return hydrate2({
                slots: { default: dayNumber },
                attrs: { "data-outside": "" }
              });
            }
            let date = DateValue.fromIsoDateString(actualWeekDates[dayIdx]);
            let dayEl = hydrate2({
              slots: { default: day },
              attrs: { "data-date": actualWeekDates[dayIdx] }
            });
            let subtext = metadata.subtext(date);
            let details = metadata.details(date);
            let variant = metadata.variant(date);
            if (![false, null, void 0].includes(variant)) {
              dayEl.dataset.dateVariant = variant;
            }
            if (![false, null, void 0].includes(subtext)) {
              let template2 = dayEl.querySelector('template[name="subtext"]');
              template2 && renderTemplate(template2, (hydrate3) => hydrate3({ slots: { default: subtext } }));
            }
            if (![false, null, void 0].includes(details)) {
              let template2 = dayEl.querySelector('template[name="details"]');
              template2 && renderTemplate(template2, (hydrate3) => hydrate3({ slots: { default: details } }));
            }
            return dayEl;
          });
        });
        return weekEl;
      });
    });
  }
  function updateMonth(el, disabled, config, viewState, selectable, validator) {
    let getFirstDateToMakeTabbable = (month, year) => {
      return selectable.lowerBound(() => {
        let isCurrentMonth = DateValue.today().getMonth() === month && DateValue.today().getYear() === year;
        return isCurrentMonth ? DateValue.today() : new DateValue(year, month);
      });
    };
    let tabbable = getFirstDateToMakeTabbable(viewState.month, viewState.year);
    el.querySelectorAll("[data-outside]").forEach((cell) => {
      setAttribute2(cell, "disabled", "");
      setAttribute2(cell, "role", "gridcell");
      setAttribute2(cell, "aria-hidden", "true");
      setAttribute2(cell, "aria-disabled", "true");
      let button = cell.querySelector("button");
      button && setAttribute2(button, "tabindex", "-1");
      button && setAttribute2(button, "disabled", "");
      button && setAttribute2(button, "aria-disabled", "true");
    });
    el.querySelectorAll("[data-date]").forEach((cell) => {
      setAttribute2(cell, "role", "gridcell");
      let button = cell.querySelector("button");
      let date = dateFromCell(cell);
      if (!date) return;
      button ? setAttribute2(button, "aria-label", date.toFormattedString(config.locale, { day: "numeric", month: "long", year: "numeric", weekday: "long" })) : setAttribute2(cell, "aria-label", date.toFormattedString(config.locale, { day: "numeric", month: "long", year: "numeric", weekday: "long" }));
      if (!validator.isValid(date)) {
        setAttribute2(cell, "disabled", "");
        setAttribute2(cell, "aria-disabled", "true");
        button && setAttribute2(button, "disabled", "");
        validator.isUnavailable(date) && setAttribute2(cell, "data-unavailable", "");
      } else if (disabled) {
        setAttribute2(cell, "disabled", "");
        setAttribute2(cell, "aria-disabled", "true");
        button && setAttribute2(button, "disabled", "");
      } else {
        removeAttribute(cell, "disabled");
        removeAttribute(cell, "data-unavailable");
        removeAttribute(cell, "aria-disabled");
        button && removeAttribute(button, "disabled");
      }
      if (DateValue.today().isSameDay(date)) {
        setAttribute2(cell, "data-today", "");
      } else {
        removeAttribute(cell, "data-today", "");
      }
      selectable.attributes(cell, date);
      if (date.isSameDay(tabbable)) {
        button && setAttribute2(button, "tabindex", "0");
      } else {
        button && setAttribute2(button, "tabindex", "-1");
      }
    });
  }
  function renderTemplate(template, callback) {
    if (!template) return;
    let cleanup = () => {
      let sibling = template.nextElementSibling;
      while (sibling && sibling.__hydrated__ === true) {
        let toRemove = sibling;
        sibling = sibling.nextElementSibling;
        toRemove.remove();
      }
    };
    cleanup();
    let hydrated = callback(({ slots = {}, attrs = {} } = {}) => {
      let clone = template.content.cloneNode(true).firstElementChild;
      Object.entries(slots).forEach(([key, value2]) => {
        let slotNodes = key === "default" ? clone.querySelectorAll("slot:not([name])") : clone.querySelectorAll(`slot[name="${key}"]`);
        slotNodes.forEach((i) => i.replaceWith(
          typeof value2 === "string" ? document.createTextNode(value2) : value2
        ));
      });
      clone.querySelectorAll("slot").forEach((slot) => slot.remove());
      Object.entries(attrs).forEach(([key, value2]) => {
        clone.setAttribute(key, value2);
      });
      return clone;
    });
    hydrated = Array.isArray(hydrated) ? hydrated : [hydrated];
    hydrated.reverse().forEach((node) => {
      node.__hydrated__ = true;
      template.after(node);
    });
    return { cleanup };
  }
  function dateFromCell(cell) {
    if (!cell) return null;
    if (!cell.hasAttribute("data-date")) return null;
    return DateValue.fromIsoDateString(cell.getAttribute("data-date"));
  }

  // js/calendar/observable.js
  var ObservableTrigger = class {
    static SELECTION = 1;
    static ACTIVATION = 2;
    static VIEW_CHANGE = 3;
  };
  var Observable = class {
    constructor() {
      this.subscribers = [];
      this.subscriberTypes = /* @__PURE__ */ new WeakMap();
    }
    subscribe(type, callback) {
      let types = Array.isArray(type) ? type : [type];
      this.subscribers.push(callback);
      if (!this.subscriberTypes.has(callback)) this.subscriberTypes.set(callback, []);
      this.subscriberTypes.get(callback).push(...types);
    }
    notify(type) {
      let types = Array.isArray(type) ? type : [type];
      this.subscribers.forEach((callback) => {
        if (types.length && !this.subscriberTypes.get(callback)?.some((t) => types.includes(t))) return;
        callback();
      });
    }
  };

  // js/calendar/selectable.js
  var CalendarModes = class {
    static SINGLE = "single";
    static MULTIPLE = "multiple";
    static RANGE = "range";
  };
  var Selectable2 = class _Selectable {
    constructor(selection, config, observable) {
      this.config = config;
      this.observable = observable;
      this.selection = selection;
      this.active = null;
      this.displayResolver = (i) => i;
    }
    setDisplayResolver(resolver) {
      this.displayResolver = resolver;
    }
    select(date) {
      let previousSelection = this.selection;
      this.selection = this.selection.select(date, this.config);
      if (this.selection.shouldNotify(previousSelection)) this.observable.notify(ObservableTrigger.SELECTION);
      else this.observable.notify(ObservableTrigger.ACTIVATION);
    }
    activate(date) {
      let memo = this.active;
      if (!date) {
        this.active = null;
      } else {
        this.active = date;
      }
      this.selection.activate(date);
      if (memo !== this.active) this.observable.notify(ObservableTrigger.ACTIVATION);
    }
    setValue(value2) {
      let previousSelection = this.selection;
      this.selection = this.createSelectionFromValue(value2, this.config);
      if (this.selection.shouldNotify(previousSelection)) this.observable.notify(ObservableTrigger.SELECTION);
      else this.observable.notify(ObservableTrigger.ACTIVATION);
    }
    getValue() {
      return this.selection.value();
    }
    isSelectable(date) {
      return this.selection.selectable(date, this.config);
    }
    /** Passthrough methods */
    contains(...params) {
      return this.selection.contains(...params);
    }
    hasSelection() {
      return this.selection.hasSelection();
    }
    lowerBound(...params) {
      return this.selection.lowerBound(...params);
    }
    upperBound(...params) {
      return this.selection.upperBound(...params);
    }
    display(...params) {
      return this.displayResolver(this.selection.display(...params));
    }
    attributes(...params) {
      return this.selection.attributes(...params);
    }
    createSelectionFromValue(value2, config) {
      if (config.mode === CalendarModes.MULTIPLE) {
        let dates = value2 ? value2.map((i) => DateValue.fromIsoDateString(i)) : [];
        return new MultipleSelection(dates);
      } else if (config.mode === CalendarModes.RANGE) {
        let { start, end, preset } = value2 || {};
        if (preset && presets[preset] && preset !== "custom") return new PresetRangeSelection(preset, config);
        if (!start && !end) return new EmptyRangeSelection();
        if (!end) return new PartialRangeSelection(DateValue.fromIsoDateString(start));
        return new RangeSelection(DateValue.fromIsoDateString(start), DateValue.fromIsoDateString(end));
      } else {
        if (!value2) return new NoneSelection();
        return new SingleSelection(DateValue.fromIsoDateString(value2));
      }
    }
    static createFromValueStringAttribute(value2, config, observable) {
      let selection = _Selectable.createSelectionFromValueStringAttribute(value2, config);
      return new _Selectable(selection, config, observable);
    }
    static createSelectionFromValueStringAttribute(value2, config) {
      if (config.mode === CalendarModes.MULTIPLE) {
        let dates = value2 ? value2.split(",").map((i) => i.trim()).map((i) => DateValue.fromIsoDateString(i)) : [];
        return new MultipleSelection(dates);
      } else if (config.mode === CalendarModes.RANGE) {
        if (!value2) return new EmptyRangeSelection();
        let [start, end] = value2.split("/").map((i) => i.trim());
        if (!end && start && presets[start] && start !== "custom") {
          return new PresetRangeSelection(start, config);
        }
        start = DateValue.fromIsoDateString(start);
        if (!end) {
          return new PartialRangeSelection(start);
        }
        end = DateValue.fromIsoDateString(end);
        return new RangeSelection(start, end);
      } else {
        if (!value2) return new NoneSelection();
        return new SingleSelection(DateValue.fromIsoDateString(value2));
      }
    }
  };
  var DeferredSelectable = class {
    constructor(selectable, observable) {
      this.selectable = selectable;
      this.observable = observable;
      this._selection = this.selectable.selection;
      this.selectable.observable.subscribe(ObservableTrigger.SELECTION, () => {
        this._blockSync() || this.sync();
      });
      this._blockSync = () => {
      };
    }
    blockSyncIf(condition) {
      this._blockSync = condition;
    }
    sync() {
      this._selection = this.selectable.selection;
      this.observable.notify(ObservableTrigger.SELECTION);
    }
    setValue(value2) {
      return this.selectable.setValue(value2);
    }
    getValue() {
      return this._selection.value();
    }
    isSelectable(date) {
      return this._selection.selectable(date, this.config);
    }
    hasSelection() {
      return this._selection.hasSelection();
    }
    display(...params) {
      return this.selectable.displayResolver(this._selection.display(...params));
    }
  };
  var Selection = class {
    contains() {
    }
    shouldNotify(previousSelection) {
      return true;
    }
    hasSelection() {
      return false;
    }
    lowerBound(fallback) {
      return value(fallback);
    }
    upperBound(fallback) {
      return this.lowerBound(fallback);
    }
    selectable(date, config) {
      return true;
    }
    display() {
    }
    value() {
    }
    activate() {
    }
    attributes(el, date) {
      if (this.contains(date)) {
        setAttribute2(el, "data-selected", "");
        setAttribute2(el, "aria-selected", "true");
      } else {
        removeAttribute(el, "data-selected");
        setAttribute2(el, "aria-selected", "false");
      }
    }
  };
  var NoneSelection = class _NoneSelection extends Selection {
    shouldNotify(selection) {
      return !(selection instanceof _NoneSelection);
    }
    hasSelection() {
      return false;
    }
    contains() {
      return false;
    }
    select(date) {
      return new SingleSelection(date);
    }
    lowerBound(fallback) {
      return value(fallback);
    }
    display(locale) {
      return "";
    }
    value() {
      return null;
    }
  };
  var SingleSelection = class _SingleSelection extends Selection {
    constructor(date) {
      super();
      this._date = date;
    }
    hasSelection() {
      return true;
    }
    shouldNotify(previousSelection) {
      if (previousSelection instanceof _SingleSelection && this._date.isSameDay(previousSelection._date)) return false;
      return true;
    }
    select(date) {
      if (this._date.isSameDay(date)) return new NoneSelection();
      return new _SingleSelection(date);
    }
    contains(date) {
      return this._date.isSameDay(date);
    }
    lowerBound() {
      return this._date;
    }
    display(locale) {
      return this._date.toFormattedString(locale, { day: "numeric", month: "short", year: "numeric" });
    }
    value() {
      return this._date.toIsoDateString();
    }
  };
  var MultipleSelection = class _MultipleSelection extends Selection {
    constructor(dates) {
      super();
      this._dates = dates;
    }
    hasSelection() {
      return this._dates.length > 0;
    }
    shouldNotify(previousSelection) {
      if (previousSelection instanceof _MultipleSelection && this._dates.every((i) => previousSelection._dates.includes(i)) && previousSelection._dates.every((i) => this._dates.includes(i))) return false;
      return true;
    }
    select(date) {
      let containsDate = this._dates.some((i) => i.isSameDay(date));
      if (containsDate) return new _MultipleSelection(this._dates.filter((i) => !i.isSameDay(date)));
      return new _MultipleSelection([...this._dates, date]);
    }
    contains(date) {
      return this._dates.some((i) => i.isSameDay(date));
    }
    lowerBound(fallback) {
      let sortedDates = this._dates.sort((a, b) => a.isBefore(b) ? -1 : 1);
      return sortedDates[sortedDates.length - 1] || value(fallback);
    }
    upperBound(fallback) {
      let sortedDates = this._dates.sort((a, b) => a.isBefore(b) ? -1 : 1);
      return sortedDates[0] || value(fallback);
    }
    display(locale) {
      return this._dates.map((i) => i.toFormattedString(locale, { day: "numeric", month: "short", year: "numeric" })).join(", ");
    }
    value() {
      return this._dates.map((i) => i.toIsoDateString());
    }
  };
  var EmptyRangeSelection = class _EmptyRangeSelection extends Selection {
    constructor() {
      super();
    }
    hasSelection() {
      return false;
    }
    shouldNotify(previousSelection) {
      return !(previousSelection instanceof _EmptyRangeSelection || previousSelection instanceof PartialRangeSelection);
    }
    select(date) {
      return new PartialRangeSelection(date);
    }
    contains() {
      return false;
    }
    lowerBound(fallback) {
      return value(fallback);
    }
    display(locale) {
      return "";
    }
    value() {
      return null;
    }
  };
  var PartialRangeSelection = class _PartialRangeSelection extends Selection {
    constructor(start) {
      super();
      this._start = start;
      this._endPreview = null;
    }
    hasSelection() {
      return false;
    }
    shouldNotify(previousSelection) {
      return false;
    }
    select(date, config) {
      if (date.isBefore(this._start)) return new _PartialRangeSelection(date);
      if (date.isSameDay(this._start) && config.minRange > 1) {
        return new EmptyRangeSelection();
      }
      return new RangeSelection(this._start, date);
    }
    activate(date) {
      this._endPreview = date;
    }
    selectable(date, config) {
      if (config.maxRange) {
        if (date.isBefore(this._start)) return false;
        if (this._start.addDays(config.maxRange - 1).isBefore(date)) return false;
      }
      if (config.minRange) {
        if (this._start.isSameDay(date)) return true;
        if (date.isBefore(this._start)) return false;
        if (this._start.addDays(config.minRange - 1).isAfter(date)) return false;
      }
      let nextUnavailable = config.unavailable.filter((d) => d.isAfter(this._start)).sort((a, b) => a.toDate() - b.toDate())[0];
      let prevUnavailable = config.unavailable.filter((d) => d.isBefore(this._start)).sort((a, b) => b.toDate() - a.toDate())[0];
      if (date.isAfter(this._start)) {
        return !nextUnavailable || date.isBefore(nextUnavailable);
      }
      if (date.isBefore(this._start)) {
        return !prevUnavailable || date.isAfter(prevUnavailable);
      }
      return true;
    }
    contains(date) {
      return date.isSameDay(this._start);
    }
    lowerBound() {
      return this._start;
    }
    display(locale) {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(this._start.getDate()) + " -";
    }
    value() {
      return null;
    }
    attributes(el, date) {
      if (this._endPreview && date.isBetween(this._start, this._endPreview)) {
        setAttribute2(el, "data-in-range", "");
        setAttribute2(el, "aria-selected", "true");
      } else {
        removeAttribute(el, "data-in-range");
        removeAttribute(el, "aria-selected");
      }
      date.isSameDay(this._start) ? setAttribute2(el, "data-selected", "") : removeAttribute(el, "data-selected");
      date.isSameDay(this._start) ? setAttribute2(el, "aria-selected", "true") : removeAttribute(el, "aria-selected");
      date.isSameDay(this._start) ? setAttribute2(el, "data-start", "") : removeAttribute(el, "data-start");
      date.isSameDay(this._endPreview) ? setAttribute2(el, "data-end-preview", "") : removeAttribute(el, "data-end-preview");
    }
  };
  var RangeSelection = class _RangeSelection extends Selection {
    constructor(start, end) {
      super();
      this._start = start;
      this._end = end;
    }
    hasSelection() {
      return true;
    }
    shouldNotify(previousSelection) {
      if (previousSelection instanceof _RangeSelection && this._start.isSameDay(previousSelection._start) && this._end.isSameDay(previousSelection._end)) return false;
      return true;
    }
    select(date) {
      return new PartialRangeSelection(date);
    }
    contains(date) {
      return date.isBetween(this._start, this._end);
    }
    lowerBound() {
      return this._start;
    }
    upperBound() {
      return this._end;
    }
    display(locale) {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).formatRange(this._start.getDate(), this._end.getDate()).replaceAll("\u2009", " ");
    }
    value() {
      return { start: this._start.toIsoDateString(), end: this._end.toIsoDateString() };
    }
    attributes(el, date) {
      date.isSameDay(this._start) || date.isSameDay(this._end) ? setAttribute2(el, "data-selected", "") : removeAttribute(el, "data-selected");
      date.isSameDay(this._start) ? setAttribute2(el, "data-start", "") : removeAttribute(el, "data-start");
      date.isSameDay(this._end) ? setAttribute2(el, "data-end", "") : removeAttribute(el, "data-end");
      if (this.contains(date)) {
        setAttribute2(el, "data-in-range", "");
        setAttribute2(el, "aria-selected", "true");
      } else {
        removeAttribute(el, "data-in-range");
        removeAttribute(el, "aria-selected");
      }
    }
  };
  var PresetRangeSelection = class _PresetRangeSelection extends Selection {
    constructor(preset, config) {
      super();
      this._preset = preset;
      this._config = config;
    }
    get _start() {
      let [start] = presets[this._preset](this._config);
      return this._config.min && start.isBefore(this._config.min) ? this._config.min : start;
    }
    get _end() {
      let [, end] = presets[this._preset](this._config);
      return this._config.max && end.isAfter(this._config.max) ? this._config.max : end;
    }
    hasSelection() {
      return true;
    }
    shouldNotify(previousSelection) {
      return !(previousSelection instanceof _PresetRangeSelection && this._preset === previousSelection._preset);
    }
    select(date) {
      return new PartialRangeSelection(date, this._config);
    }
    contains(date) {
      return date.isBetween(this._start, this._end);
    }
    lowerBound() {
      if (this._preset === "allTime") return DateValue.today();
      return this._start;
    }
    upperBound() {
      if (this._preset === "allTime") return DateValue.today();
      return DateValue.today();
    }
    display(locale) {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).formatRange(this._start.getDate(), this._end.getDate()).replaceAll("\u2009", " ");
    }
    value() {
      return { start: this._start.toIsoDateString(), end: this._end.toIsoDateString(), preset: this._preset };
    }
    attributes(el, date) {
      date.isSameDay(this._start) || date.isSameDay(this._end) ? setAttribute2(el, "data-selected", "") : removeAttribute(el, "data-selected");
      date.isSameDay(this._start) ? setAttribute2(el, "data-start", "") : removeAttribute(el, "data-start");
      date.isSameDay(this._end) ? setAttribute2(el, "data-end", "") : removeAttribute(el, "data-end");
      if (this.contains(date)) {
        setAttribute2(el, "data-in-range", "");
        setAttribute2(el, "aria-selected", "true");
      } else {
        removeAttribute(el, "data-in-range");
        removeAttribute(el, "aria-selected");
      }
    }
  };
  function value(i) {
    return typeof i === "function" ? i() : i;
  }
  var presets = {
    today: () => {
      return [DateValue.today(), DateValue.today()];
    },
    yesterday: () => {
      let date = DateValue.today().incrementDays(-1);
      return [date, date];
    },
    thisWeek: (config) => {
      let start = DateValue.today().getCopy().incrementDays(config.startDay - DateValue.today().getDayOfWeek());
      let end = start.incrementDays(6);
      return [start, end];
    },
    lastWeek: (config) => {
      let start = DateValue.today().incrementDays(config.startDay - (DateValue.today().getDayOfWeek() + 7));
      let end = start.incrementDays(6);
      return [start, end];
    },
    last7Days: () => {
      let end = DateValue.today();
      let start = DateValue.today().incrementDays(-6);
      return [start, end];
    },
    thisMonth: () => {
      let start = DateValue.fromParts(DateValue.today().getYear(), DateValue.today().getMonth(), 1);
      let end = DateValue.fromParts(DateValue.today().getYear(), DateValue.today().getMonth(), DateValue.today().getDaysInMonth());
      return [start, end];
    },
    lastMonth: () => {
      let month = DateValue.today().getMonth() - 1;
      let year = DateValue.today().getYear();
      if (month < 1) {
        month += 12;
        year--;
      }
      let start = DateValue.fromParts(year, month, 1);
      let end = DateValue.fromParts(year, month, start.getDaysInMonth());
      return [start, end];
    },
    thisQuarter: () => {
      let quarter = Math.floor((DateValue.today().getMonth() - 1) / 3);
      let startMonth = quarter * 3 + 1;
      let endMonth = startMonth + 2;
      let start = DateValue.fromParts(DateValue.today().getYear(), startMonth, 1);
      let endMonthStart = DateValue.fromParts(DateValue.today().getYear(), endMonth, 1);
      let end = DateValue.fromParts(DateValue.today().getYear(), endMonth, endMonthStart.getDaysInMonth());
      return [start, end];
    },
    lastQuarter: () => {
      let quarter = Math.floor((DateValue.today().getMonth() - 4) / 3);
      let startMonth = quarter * 3 + 1;
      let endMonth = startMonth + 2;
      let year = DateValue.today().getYear();
      if (startMonth < 1) {
        startMonth += 12;
        endMonth += 12;
        year--;
      }
      let start = DateValue.fromParts(year, startMonth, 1);
      let endMonthStart = DateValue.fromParts(year, endMonth, 1);
      let end = DateValue.fromParts(year, endMonth, endMonthStart.getDaysInMonth());
      return [start, end];
    },
    thisYear: () => {
      let start = DateValue.fromParts(DateValue.today().getYear(), 1, 1);
      let end = DateValue.fromParts(DateValue.today().getYear(), 12, 31);
      return [start, end];
    },
    lastYear: () => {
      let year = DateValue.today().getYear() - 1;
      let start = DateValue.fromParts(year, 1, 1);
      let end = DateValue.fromParts(year, 12, 31);
      return [start, end];
    },
    last14Days: () => {
      let end = DateValue.today();
      let start = DateValue.today().incrementDays(-13);
      return [start, end];
    },
    last30Days: () => {
      let end = DateValue.today();
      let start = DateValue.today().incrementDays(-29);
      return [start, end];
    },
    last3Months: () => {
      let end = DateValue.today();
      let day = DateValue.today().getDay() + 1;
      let month = DateValue.today().getMonth() - 3;
      let year = DateValue.today().getYear();
      if (month < 1) {
        month += 12;
        year--;
      }
      let start = DateValue.fromParts(year, month, day);
      return [start, end];
    },
    last6Months: () => {
      let end = DateValue.today();
      let day = DateValue.today().getDay() + 1;
      let month = DateValue.today().getMonth() - 6;
      let year = DateValue.today().getYear();
      if (month < 1) {
        month += 12;
        year--;
      }
      let start = DateValue.fromParts(year, month, day);
      return [start, end];
    },
    yearToDate: () => {
      let start = DateValue.fromParts(DateValue.today().getYear(), 1, 1);
      let end = DateValue.today();
      return [start, end];
    },
    allTime: (config) => {
      if (!config.min) throw new Error("Min date is required for allTime preset");
      let start = config.min;
      let end = DateValue.today();
      return [start, end];
    }
  };

  // js/calendar/view.js
  var CalendarViewState = class {
    constructor(month, year, config, observable) {
      this.month = month;
      this.year = year;
      this.config = config;
      this.observable = observable;
    }
    generateOffsetState(offset3) {
      return new CalendarOffsetViewState(this, offset3);
    }
    canNavigatePrevious() {
      let [prevYear, prevMonth] = new DateValue(this.year, this.month).addMonths(-1).toParts();
      return !(this.config.min && DateValue.fromParts(prevYear, prevMonth).isBefore(this.config.min));
    }
    canNavigateNext() {
      let [nextYear, nextMonth] = new DateValue(this.year, this.month).addMonths(this.config.months).toParts();
      return !(this.config.max && DateValue.fromParts(nextYear, nextMonth).isAfter(this.config.max));
    }
    nextMonth() {
      if (!this.canNavigateNext()) return;
      this.adjustMonth(1);
    }
    previousMonth() {
      this.adjustMonth(-1);
    }
    setMonth(month) {
      if (!month) return;
      if (this.config.min && DateValue.fromParts(this.year, month).isBefore(this.config.min)) return;
      if (this.config.max && DateValue.fromParts(this.year, month).isAfter(this.config.max)) return;
      this.month = month;
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
    setYear(year) {
      this.year = year;
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
    setDate(date) {
      this.setMonth(date.getMonth());
      this.setYear(date.getYear());
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
    adjustMonth(delta) {
      let [nextYear, nextMonth] = new DateValue(this.year, this.month).addMonths(delta).toParts();
      if (this.config.min && DateValue.fromParts(nextYear, nextMonth).isBefore(this.config.min)) return;
      if (this.config.max && DateValue.fromParts(nextYear, nextMonth).isAfter(this.config.max)) return;
      [this.month, this.year] = [nextMonth, nextYear];
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
  };
  var CalendarOffsetViewState = class {
    constructor(viewState, offset3 = 0) {
      this.offset = offset3;
      this.viewState = viewState;
    }
    get month() {
      let [, newMonth] = new DateValue(this.viewState.year, this.viewState.month).addMonths(this.offset).toParts();
      return newMonth;
    }
    get year() {
      let [newYear] = new DateValue(this.viewState.year, this.viewState.month).addMonths(this.offset).toParts();
      return newYear;
    }
  };

  // js/calendar/validator.js
  var Validator = class {
    constructor(selectable, metadata, config) {
      this.min = config.min;
      this.max = config.max;
      this.unavailable = config.unavailable;
      this.selectable = selectable;
      this.metadata = metadata;
    }
    isBetweenMinMax(date) {
      return date.isBetween(this.min, this.max);
    }
    isUnavailable(date) {
      return this.unavailable.some((i) => i.isSameDay(date)) || this.metadata.unavailable(date);
    }
    isBlocked(date) {
      return !this.selectable.isSelectable(date);
    }
    isValid(date) {
      return this.isBetweenMinMax(date) && !this.isUnavailable(date) && !this.isBlocked(date);
    }
  };

  // js/calendar/meta.js
  var DateMetadata = class {
    constructor(observable) {
      this.metadata = {};
      this.observable = observable;
    }
    resetFromJSON(json) {
      this.reset(JSON.parse(json));
    }
    appendFromJSON(json) {
      this.append(JSON.parse(json));
    }
    append(object) {
      this.metadata = { ...this.metadata, ...object };
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
    reset(object) {
      this.metadata = object;
      this.observable.notify(ObservableTrigger.VIEW_CHANGE);
    }
    get(date) {
      return this.metadata[date.toIsoDateString()];
    }
    has(date) {
      return this.metadata[date.toIsoDateString()] !== void 0;
    }
    subtext(date) {
      return this.metadata[date.toIsoDateString()]?.subtext;
    }
    details(date) {
      return this.metadata[date.toIsoDateString()]?.details;
    }
    variant(date) {
      return this.metadata[date.toIsoDateString()]?.variant;
    }
    unavailable(date) {
      return !!this.metadata[date.toIsoDateString()]?.unavailable;
    }
  };

  // js/calendar/index.js
  var UICalendar = class extends UIElement {
    boot() {
      let elDrivingConfig = this.closest("ui-date-picker") || this;
      let [months, onMonthsChange] = responsiveAttributeValue(elDrivingConfig, "months", 1);
      this.observable = new Observable();
      let locale = elDrivingConfig.hasAttribute("locale") ? elDrivingConfig.getAttribute("locale") : getLocale();
      this.config = {
        mode: elDrivingConfig.getAttribute("mode") === "range" ? CalendarModes.RANGE : elDrivingConfig.hasAttribute("multiple") ? CalendarModes.MULTIPLE : CalendarModes.SINGLE,
        months: parseInt(months),
        min: elDrivingConfig.hasAttribute("min") ? elDrivingConfig.getAttribute("min") === "today" ? DateValue.today() : DateValue.fromIsoDateString(elDrivingConfig.getAttribute("min")) : null,
        max: elDrivingConfig.hasAttribute("max") ? elDrivingConfig.getAttribute("max") === "today" ? DateValue.today() : DateValue.fromIsoDateString(elDrivingConfig.getAttribute("max")) : null,
        maxRange: elDrivingConfig.hasAttribute("max-range") ? parseInt(elDrivingConfig.getAttribute("max-range")) : null,
        minRange: elDrivingConfig.hasAttribute("min-range") ? parseInt(elDrivingConfig.getAttribute("min-range")) : null,
        startDay: elDrivingConfig.hasAttribute("start-day") ? parseInt(elDrivingConfig.getAttribute("start-day")) : (new Intl.Locale(locale).weekInfo?.firstDay || 7) % 7,
        unavailable: elDrivingConfig.hasAttribute("unavailable") ? elDrivingConfig.getAttribute("unavailable").split(",").map((i) => DateValue.fromIsoDateString(i.trim())) : [],
        locale,
        fixedWeeks: elDrivingConfig.hasAttribute("fixed-weeks") ? 6 : null
      };
      onMonthsChange((months2) => {
        this.config.months = parseInt(months2);
        this.observable.notify(ObservableTrigger.VIEW_CHANGE);
      });
      this.selectable = Selectable2.createFromValueStringAttribute(elDrivingConfig.getAttribute("value"), this.config, this.observable);
      this.metadata = new DateMetadata(this.observable);
      this.validator = new Validator(this.selectable, this.metadata, this.config);
      let openToDate = elDrivingConfig.hasAttribute("open-to") ? DateValue.fromIsoDateString(elDrivingConfig.getAttribute("open-to")) : this.selectable.lowerBound(() => DateValue.today());
      this.viewState = new CalendarViewState(openToDate.getMonth(), openToDate.getYear(), this.config, this.observable);
      this._disableable = new Disableable(this);
      if (!this.hasAttribute("static")) {
        let { enable: enableListeners, disable: disableListeners } = initializeEventListeners(this, this.selectable, this.viewState, this.validator);
        this._disableable.onInitAndChange((disabled) => {
          disabled ? disableListeners() : enableListeners();
        });
      }
      this._controllable = new Controllable(this);
      let detangled = detangle();
      this._controllable.initial((initial) => initial && this.selectable.setValue(initial));
      this._controllable.getter(() => this.selectable.getValue());
      this._controllable.setter(detangled((value2) => {
        this.selectable.setValue(value2);
      }));
      this.observable.subscribe(ObservableTrigger.SELECTION, detangled(() => {
        this.dispatchEvent(new Event("select", { bubbles: false, cancelable: true }));
        this._controllable.dispatch();
      }));
      this.observable.subscribe(ObservableTrigger.SELECTION, () => {
        this.anchorSelection();
      });
      this.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => {
        this.dispatchEvent(new Event("navigate", { bubbles: false, cancelable: true }));
      });
      queueMicrotask(() => {
        this.closest("ui-date-picker")?.bootWithCalendar(this);
      });
    }
    navigateNext() {
      this.viewState.nextMonth();
    }
    navigatePrevious() {
      this.viewState.previousMonth();
    }
    anchorSelection() {
      let focusedEl = document.activeElement;
      let isFocusedOnADateButton = this.contains(focusedEl) && focusedEl.closest("[data-date]") !== null;
      if (isFocusedOnADateButton) return;
      this.viewState.setDate(
        this.selectable.lowerBound(DateValue.today())
      );
    }
    appendMetadata(object) {
      this.metadata.append(object);
    }
    resetMetadata(object = {}) {
      this.metadata.reset(object);
    }
    visibleDateRange() {
      return [
        DateValue.fromParts(this.viewState.year, this.viewState.month, 1).toIsoDateString(),
        DateValue.fromParts(this.viewState.year, this.viewState.month + 1, 0).toIsoDateString()
      ];
    }
  };
  var UICalendarPrevious = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      initFauxButton(this, () => this._disableable.isDisabled(), () => calendar.navigatePrevious());
      let setDisabled = () => {
        if (calendar.viewState.canNavigatePrevious() && !this._disableable.isDisabled()) {
          removeAttribute(this, "disabled");
        } else {
          setAttribute2(this, "disabled", "");
        }
      };
      calendar.observable.subscribe(ObservableTrigger.VIEW_CHANGE, setDisabled);
      this._disableable.onInitAndChange(() => {
        setDisabled();
      });
    }
  };
  var UICalendarNext = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      initFauxButton(this, () => this._disableable.isDisabled(), () => calendar.navigateNext());
      let setDisabled = () => {
        if (calendar.viewState.canNavigateNext() && !this._disableable.isDisabled()) {
          removeAttribute(this, "disabled");
        } else {
          setAttribute2(this, "disabled", "");
        }
      };
      calendar.observable.subscribe(ObservableTrigger.VIEW_CHANGE, setDisabled);
      this._disableable.onInitAndChange(() => {
        setDisabled();
      });
    }
  };
  var UICalendarMonth = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      this.offset = this.hasAttribute("offset") ? parseInt(this.getAttribute("offset")) : 0;
      this.config = calendar.config;
      this.viewState = calendar.viewState;
      this.offsetState = this.viewState.generateOffsetState(this.offset);
      this.validator = calendar.validator;
      let select = this.querySelector("select");
      let display = this.hasAttribute("display") ? this.getAttribute("display") : "long";
      if (select) {
        this.renderSelectOptions(select, display);
        select.value = this.viewState.month;
        select.addEventListener("change", this._disableable.enabled(() => {
          this.viewState.setMonth(parseInt(select.value));
        }));
        calendar.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => {
          this.renderSelectOptions(select, display);
          select.value = this.viewState.month;
        });
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            setAttribute2(select, "disabled", "");
          } else {
            removeAttribute(select, "disabled");
          }
        });
      } else {
        let update = () => this.textContent = new Intl.DateTimeFormat(this.config.locale, {
          month: this.hasAttribute("display") ? this.getAttribute("display") : "long",
          timeZone: "UTC"
        }).format(new DateValue(this.offsetState.year, this.offsetState.month).getDate());
        update();
        this.viewState.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => update());
      }
    }
    renderSelectOptions(select, display) {
      let months = Array.from({ length: 12 }, (_, idx) => idx + 1);
      let renderableMonths = months.map((month) => {
        let firstDayOfMonth = new DateValue(this.viewState.year, month);
        let lastDayOfMonth = new DateValue(this.viewState.year, month + 1, 0);
        if (!this.validator.isBetweenMinMax(firstDayOfMonth) && !this.validator.isBetweenMinMax(lastDayOfMonth)) {
          return null;
        }
        return {
          month,
          label: new Intl.DateTimeFormat(this.config.locale, { month: display, timeZone: "UTC" }).format(new DateValue(2024, month).getDate())
        };
      }).filter(Boolean);
      renderTemplate(select.querySelector("template"), (hydrate) => {
        return renderableMonths.map((month) => {
          let option = hydrate({ slots: { default: month.label } });
          option.setAttribute("value", month.month);
          return option;
        });
      });
    }
  };
  var UICalendarYear = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      this.offset = this.hasAttribute("offset") ? parseInt(this.getAttribute("offset")) : 0;
      this.config = calendar.config;
      this.viewState = calendar.viewState;
      this.offsetState = this.viewState.generateOffsetState(this.offset);
      let select = this.querySelector("select");
      if (select) {
        this.renderSelectOptions(select);
        select.value = this.viewState.year;
        select.addEventListener("change", this._disableable.enabled(() => {
          this.viewState.setYear(parseInt(select.value));
        }));
        calendar.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => {
          select.value = this.viewState.year;
        });
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            setAttribute2(select, "disabled", "");
          } else {
            removeAttribute(select, "disabled");
          }
        });
      } else {
        let update = () => this.textContent = new Intl.DateTimeFormat(this.config.locale, {
          year: this.hasAttribute("display") ? this.getAttribute("display") : "numeric",
          timeZone: "UTC"
        }).format(new DateValue(this.offsetState.year, this.offsetState.month).getDate());
        update();
        this.viewState.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => update());
      }
    }
    renderSelectOptions(select) {
      let numberOfPastYears = 100;
      let numberOfFutureYears = 10;
      let currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      let years = Array.from(
        { length: numberOfPastYears + numberOfFutureYears + 1 },
        (_, i) => currentYear - numberOfPastYears + i
      );
      renderTemplate(select.querySelector("template"), (hydrate) => {
        return years.map((year) => hydrate({ slots: { default: year } }));
      });
    }
  };
  var UICalendarMonths = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      this.offset = this.hasAttribute("offset") ? parseInt(this.getAttribute("offset")) : 0;
      this.config = calendar.config;
      this.selectable = calendar.selectable;
      this.observable = calendar.observable;
      this.metadata = calendar.metadata;
      this.validator = calendar.validator;
      this.viewState = calendar.viewState;
      this.offsetState = this.viewState.generateOffsetState(this.offset);
      this.monthEls = [];
      this.renderMonths();
      let render = () => this.monthEls.forEach((month) => renderMonth(month, this.config, month.offsetState, this.metadata));
      let update = () => this.monthEls.forEach((month) => updateMonth(month, this._disableable.isDisabled(), this.config, month.offsetState, this.selectable, this.validator));
      render();
      update();
      let months = this.config.months;
      this.viewState.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => {
        if (months !== this.config.months) {
          months = this.config.months;
          this.renderMonths();
        }
        render();
        update();
      });
      this.observable.subscribe([ObservableTrigger.SELECTION, ObservableTrigger.ACTIVATION], () => {
        update();
      });
      this._disableable.onChange(() => update());
    }
    renderMonths() {
      let template = this.querySelector('template:not([name]), template[name="month"]');
      renderTemplate(template, (hydrate) => {
        let monthOffsetTemplate = Array.from({ length: this.config.months }).map((_, idx) => idx);
        this.monthEls = monthOffsetTemplate.map((offset3) => {
          let offsetState = this.viewState.generateOffsetState(offset3);
          let monthEl = hydrate({ attrs: { "data-month": "" } });
          monthEl.offsetState = offsetState;
          let head = monthEl.querySelector("thead")?.set;
          setAttribute2(monthEl, "role", "grid");
          head && setAttribute2(head, "aria-hidden", "true");
          return monthEl;
        });
        return this.monthEls;
      });
    }
  };
  var UICalendarToday = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar, ui-date-picker");
      this._disableable = calendar._disableable;
      this.behavior = this.hasAttribute("behavior") ? this.getAttribute("behavior") : "auto";
      initFauxButton(this, () => this._disableable.isDisabled(), () => this.navigateAndSelectToday());
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          setAttribute2(this, "disabled", "");
        } else {
          removeAttribute(this, "disabled");
        }
      });
      let template = this.querySelector("template");
      template && renderTemplate(template, (hydrate) => {
        return hydrate({ slots: { default: DateValue.today().getDay() } });
      });
    }
    navigateAndSelectToday() {
      let calendar = this.closest("ui-calendar, ui-date-picker");
      let isViewingCurrentMonth = () => {
        let viewState = calendar.viewState;
        let today = DateValue.today();
        return viewState.year === today.getYear() && viewState.month === today.getMonth();
      };
      let shouldSelect = this.behavior === "select" || this.behavior === "auto" && isViewingCurrentMonth();
      if (shouldSelect) {
        if (calendar.config.mode === CalendarModes.RANGE) {
          calendar.selectable.setValue({ start: DateValue.today().toIsoDateString(), end: DateValue.today().toIsoDateString() });
        } else if (calendar.config.mode === CalendarModes.MULTIPLE) {
          calendar.selectable.setValue([DateValue.today().toIsoDateString()]);
        } else {
          calendar.selectable.setValue(DateValue.today().toIsoDateString());
        }
      }
      calendar.viewState.setMonth(DateValue.today().getMonth());
      calendar.viewState.setYear(DateValue.today().getYear());
    }
  };
  var UICalendarPresets = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      this.offset = this.hasAttribute("offset") ? parseInt(this.getAttribute("offset")) : 0;
      this.selectable = calendar.selectable;
      this.observable = calendar.observable;
      this.config = calendar.config;
      this.viewState = calendar.viewState;
      this.offsetState = this.viewState.generateOffsetState(this.offset);
      if (this.config.mode !== CalendarModes.RANGE) throw "Presets can only be used with range calendars";
      let selectable = this.firstElementChild;
      if (selectable) {
        let getLabelFromPreset = (preset) => {
          if (selectable._selectable instanceof SelectableGroup) {
            let option = selectable._selectable.findByValue(preset);
            if (!option) return null;
            return option?.el?.textContent;
          } else if (selectable instanceof HTMLSelectElement) {
            return selectable.querySelector(`option[value="${preset}"]`)?.textContent;
          }
          return null;
        };
        this.selectable.setDisplayResolver((i) => {
          let preset = this.selectable.getValue()?.preset || "";
          if (preset) {
            let label = getLabelFromPreset(preset);
            if (label) return label;
          }
          return i;
        });
        selectable.value = this.selectable.getValue()?.preset || "custom";
        selectable.addEventListener("change", this._disableable.enabled(() => {
          if (["", "custom"].includes(selectable.value)) {
            let { start, end } = this.selectable.getValue() || {};
            if (start && end) this.selectable.setValue({ start, end });
          } else {
            this.selectable.setValue({ preset: selectable.value });
          }
        }));
        this.observable.subscribe(ObservableTrigger.SELECTION, () => {
          let value2 = this.selectable.getValue();
          selectable.value = value2?.preset || "custom";
        });
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            setAttribute2(selectable, "disabled", "");
          } else {
            removeAttribute(selectable, "disabled");
          }
        });
      }
    }
  };
  var UICalendarInputs = class extends UIElement {
    boot() {
      let calendar = this.closest("ui-calendar");
      this._disableable = calendar._disableable;
      this.offset = this.hasAttribute("offset") ? parseInt(this.getAttribute("offset")) : 0;
      this.selectable = calendar.selectable;
      this.observable = calendar.observable;
      this.config = calendar.config;
      this.viewState = calendar.viewState;
      this.offsetState = this.viewState.generateOffsetState(this.offset);
      let [firstInput, secondInput] = this.querySelectorAll("input");
      if (this.config.mode === CalendarModes.RANGE) {
        syncInputStateWithRangeSelectionState(firstInput, secondInput, calendar);
      } else {
        syncInputStateWithSingleSelectionState(firstInput, calendar);
      }
    }
  };
  inject(({ css }) => css`
    ui-calendar-preset,
    ui-calendar-previous,
    ui-calendar-next {
        display: block;
        user-select: none;
    }
`);
  element("calendar", UICalendar);
  element("calendar-today", UICalendarToday);
  element("calendar-presets", UICalendarPresets);
  element("calendar-previous", UICalendarPrevious);
  element("calendar-inputs", UICalendarInputs);
  element("calendar-next", UICalendarNext);
  element("calendar-months", UICalendarMonths);
  element("calendar-month", UICalendarMonth);
  element("calendar-year", UICalendarYear);
  function initializeEventListeners(el, selectable, viewState, validator) {
    let blocked = false;
    let readonly = el.hasAttribute("readonly");
    on(el, "click", (e) => {
      if (blocked || readonly) return;
      let cell = e.target.closest("[data-date]");
      if (!cell) return;
      let date = dateFromCell2(cell);
      validator.isValid(date) && selectable.select(date);
    });
    on(el, "mouseover", (e) => {
      if (blocked || readonly) return;
      let cell = e.target.closest("[data-date]");
      if (!cell) return;
      let date = dateFromCell2(cell);
      if (!validator.isValid(date)) return;
      selectable.activate(date);
    });
    on(el, "mouseout", () => {
      if (blocked || readonly) return;
      selectable.activate(null);
    });
    on(el, "focusin", (e) => {
      if (blocked || readonly) return;
      let cell = e.target.closest("[data-date]");
      if (!cell) return;
      let date = dateFromCell2(cell);
      if (!validator.isValid(date)) return;
      selectable.activate(date);
    });
    on(el, "keydown", (e) => {
      if (blocked) return;
      let cell = e.target.closest("[data-date]");
      if (!cell) return;
      let handled = true;
      let direction;
      let focusedDate = dateFromCell2(cell);
      let adjustActive = (adjustment) => {
        let activeDate = focusedDate.getCopy();
        let direction2 = Math.sign(adjustment);
        let safetyCounter = 366;
        activeDate.setDay(activeDate.getDay() + adjustment);
        while (!validator.isValid(activeDate) && safetyCounter > 0) {
          activeDate.setDay(activeDate.getDay() + direction2);
          safetyCounter--;
        }
        focusedDate = activeDate;
      };
      switch (e.key) {
        case "ArrowRight":
          direction = "forward";
          adjustActive(1);
          break;
        case "ArrowLeft":
          direction = "backward";
          adjustActive(-1);
          break;
        case "ArrowUp":
          direction = "backward";
          adjustActive(-7);
          break;
        case "ArrowDown":
          direction = "forward";
          adjustActive(7);
          break;
        case "Home":
          viewState.previousMonth();
          break;
        case "End":
          viewState.nextMonth();
          break;
        case "PageUp":
          if (e.shiftKey) {
            viewState.previousMonth();
          } else {
            viewState.previousMonth();
          }
          break;
        case "PageDown":
          if (e.shiftKey) {
            viewState.nextMonth();
          } else {
            viewState.nextMonth();
          }
          break;
        default:
          handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        let cell2 = Array.from(el.querySelectorAll("[data-date]")).find((cell3) => dateFromCell2(cell3).isSameDay(focusedDate));
        if (!cell2 && direction) {
          if (direction === "forward") {
            viewState.nextMonth();
          } else {
            viewState.previousMonth();
          }
          cell2 = Array.from(el.querySelectorAll("[data-date]")).find((cell3) => dateFromCell2(cell3).isSameDay(focusedDate));
        }
        cell2?.querySelector("button")?.focus();
      }
    });
    return { enable() {
      blocked = false;
    }, disable() {
      blocked = true;
    } };
  }
  function dateFromCell2(cell) {
    if (!cell) return null;
    if (!cell.hasAttribute("data-date")) return null;
    return DateValue.fromIsoDateString(cell.getAttribute("data-date"));
  }
  function syncInputStateWithSingleSelectionState(input, subject) {
    preventInputEventsFromBubblingToSelectRoot(input);
    let detangled = detangle();
    let sync = detangled(() => {
      let selected = subject.selectable.getValue();
      input.value = selected || "";
    });
    subject.observable.subscribe(ObservableTrigger.SELECTION, sync);
    sync();
    input.addEventListener("change", detangled(() => {
      let date = input.valueAsDate;
      if (date) {
        subject.selectable.setValue(
          DateValue.fromLocalDate(date).toIsoDateString()
        );
        subject.viewState.setDate(DateValue.fromLocalDate(date));
      } else {
        subject.selectable.setValue("");
      }
    }));
  }
  function syncInputStateWithRangeSelectionState(input, secondInput, subject) {
    preventInputEventsFromBubblingToSelectRoot(input);
    preventInputEventsFromBubblingToSelectRoot(secondInput);
    let detangled = detangle();
    let setInputsFromValue = detangled(() => {
      let { start, end } = subject.selectable.getValue() || {};
      input.value = start || "";
      secondInput.value = end || "";
    });
    let setValueFromInputs = detangled(() => {
      let start = input.valueAsDate;
      let end = secondInput.valueAsDate;
      if (start && end) {
        subject.selectable.setValue(
          { start: DateValue.fromLocalDate(start).toIsoDateString(), end: DateValue.fromLocalDate(end).toIsoDateString() }
        );
      } else if (start) {
        subject.selectable.setValue(
          { start: DateValue.fromLocalDate(start).toIsoDateString(), end: null }
        );
      } else {
        subject.selectable.setValue(
          { start: null, end: null }
        );
      }
    });
    subject.observable.subscribe(ObservableTrigger.SELECTION, setInputsFromValue);
    setInputsFromValue();
    input.addEventListener("change", setValueFromInputs);
    secondInput.addEventListener("change", setValueFromInputs);
  }
  function preventInputEventsFromBubblingToSelectRoot(input) {
    on(input, "change", (e) => e.stopPropagation());
    on(input, "input", (e) => e.stopPropagation());
  }

  // js/mixins/dialogable.js
  var lastMouseDownEvent = null;
  document.addEventListener("mousedown", (event) => lastMouseDownEvent = event);
  var Dialogable = class extends Mixin {
    boot({ options }) {
      options({
        clickOutside: true,
        triggers: []
      });
      this.onChanges = [];
      this.state = false;
      let triggers = this.options().triggers;
      let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName !== "open") return;
          this.el.hasAttribute("open") ? this.state = true : this.state = false;
        });
        this.onChanges.forEach((i) => i());
      });
      observer.observe(this.el, { attributeFilter: ["open"] });
      if (this.options().clickOutside) {
        this.el.addEventListener("click", (e) => {
          if (e.target !== this.el) {
            lastMouseDownEvent = null;
            return;
          }
          if (lastMouseDownEvent && clickHappenedOutside(this.el, lastMouseDownEvent) && clickHappenedOutside(this.el, e)) {
            this.cancel();
            e.preventDefault();
            e.stopPropagation();
          }
          lastMouseDownEvent = null;
        });
      }
      if (this.el.hasAttribute("open")) {
        this.state = true;
        this.hide();
        this.show();
      }
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    show() {
      this.el.showModal();
    }
    hide() {
      this.el.close();
    }
    toggle() {
      this.state ? this.hide() : this.show();
    }
    cancel() {
      let event = new Event("cancel", { bubbles: false, cancelable: true });
      this.el.dispatchEvent(event);
      if (!event.defaultPrevented) {
        this.hide();
      }
    }
    getState() {
      return this.state;
    }
    setState(value2) {
      value2 ? this.show() : this.hide();
    }
  };
  function clickHappenedOutside(el, event) {
    let rect = el.getBoundingClientRect();
    let x = event.clientX;
    let y = event.clientY;
    let isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    return !isInside;
  }

  // js/calendar/picker.js
  var UIDatePicker = class extends UIControl {
    bootWithCalendar(calendar) {
      let isRange = calendar.config.mode === CalendarModes.RANGE;
      this.calendar = calendar;
      this._disableable = new Disableable(this);
      this.observable = new Observable();
      this.selectable = new DeferredSelectable(this.calendar.selectable, this.observable);
      this.viewState = this.calendar.viewState;
      this.querySelector("ui-selected-date")?.bootWithCalendar();
      this.querySelector("ui-date-picker-select")?.bootWithCalendar();
      let popoverEl = this.querySelector("dialog");
      if (!popoverEl) return;
      let inputEl = this.querySelector("input");
      inputEl = popoverEl?.contains(inputEl) ? null : inputEl;
      let secondInputEl = Array.from(this.querySelectorAll("input")).find((i) => i !== inputEl);
      secondInputEl = popoverEl?.contains(secondInputEl) ? null : secondInputEl;
      inputEl && inputEl.addEventListener("click", (e) => e.preventDefault());
      secondInputEl && secondInputEl.addEventListener("click", (e) => e.preventDefault());
      let buttonEl = this.querySelector("button");
      buttonEl = popoverEl?.contains(buttonEl) ? null : buttonEl;
      let calendarId = assignId(this.calendar, "calendar");
      let triggerEl = inputEl || buttonEl;
      if (!triggerEl) return;
      setAttribute2(triggerEl, "role", "combobox");
      setAttribute2(triggerEl, "aria-controls", calendarId);
      this.calendar._disableable.onInitAndChange((disabled) => {
        if (disabled) setAttribute2(triggerEl, "disabled", "");
        else removeAttribute(triggerEl, "disabled");
      });
      this._dialogable = new Dialogable(popoverEl, {
        clickOutside: !this.hasAttribute("disable-click-outside"),
        triggers: [buttonEl, inputEl, secondInputEl].filter(Boolean)
      });
      this._anchorable = new Anchorable(popoverEl, {
        reference: triggerEl,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      this.querySelectorAll("button").forEach((button) => {
        if (button === triggerEl) return;
        if (popoverEl.contains(button)) return;
        setAttribute2(button, "aria-controls", calendarId);
        setAttribute2(button, "aria-haspopup", "combobox");
        linkExpandedStateToPopover(button, this._dialogable);
        on(button, "click", () => this._dialogable.toggle());
      });
      initPopover(this, triggerEl, popoverEl, this._dialogable, this._anchorable);
      linkExpandedStateToPopover(triggerEl, this._dialogable);
      preventScrollWhenPopoverIsOpen(this, this._dialogable);
      controlPopoverWithKeyboard(triggerEl, this._dialogable);
      handlePopoverClosing(this, this.calendar.config.mode, this.observable, this.selectable, this._dialogable);
      if (isRange && popoverEl && inputEl && secondInputEl) {
        highlightInputContentsWhenFocused(inputEl);
        highlightInputContentsWhenFocused(secondInputEl);
        syncInputStateWithRangeSelectionState(inputEl, secondInputEl, this);
      } else if (popoverEl && inputEl) {
        let input = inputEl;
        highlightInputContentsWhenFocused(input);
        syncInputStateWithSingleSelectionState(input, this);
      } else if (popoverEl) {
        let button = buttonEl;
        togglePopoverWithMouse(button, this._dialogable);
      }
      this._controllable = new Controllable(this);
      let detangled = detangle();
      this._controllable.initial((initial) => initial && this.selectable.setValue(initial));
      this._controllable.getter(() => this.selectable.getValue());
      this._controllable.setter(detangled((value2) => this.selectable.setValue(value2)));
      this.observable.subscribe(ObservableTrigger.SELECTION, detangled(() => {
        this.dispatchEvent(new Event("select", { bubbles: false, cancelable: true }));
        this._controllable.dispatch();
      }));
      this.observable.subscribe(ObservableTrigger.VIEW_CHANGE, () => {
        this.dispatchEvent(new Event("navigate", { bubbles: false, cancelable: true }));
      });
    }
    input() {
      return this.querySelector("input");
    }
    clear() {
      this.selectable.setValue(null);
    }
    open() {
      this._dialogable.setState(true);
    }
    close() {
      this._dialogable.setState(false);
    }
  };
  var UISelectedDate = class extends UIElement {
    bootWithCalendar() {
      this.picker = this.closest("ui-date-picker");
      this.querySelectorAll("[data-appended]").forEach((el) => el.remove());
      if (!this.querySelector('template[name="date"]')) {
        let template = document.createElement("template");
        template.setAttribute("name", "date");
        template.innerHTML = "<div><slot></slot></div>";
        this.appendChild(template);
      }
      this.templates = {
        placeholder: this.querySelector('template[name="placeholder"]'),
        date: this.querySelector('template[name="date"]')
      };
      this.picker.observable.subscribe(ObservableTrigger.SELECTION, () => {
        this.render(this.picker);
      });
      this.render(this.picker);
    }
    render(picker) {
      this.templates.placeholder?.clearPlaceholder?.();
      this.templates.date?.clearDate?.();
      if (picker.selectable.hasSelection()) {
        let { cleanup } = renderTemplate(this.templates.date, (hydrate) => {
          return hydrate({ slots: { default: picker.selectable.display() } });
        });
        this.templates.date.clearDate = cleanup;
      } else {
        if (!this.templates.placeholder) return;
        let { cleanup } = renderTemplate(this.templates.placeholder, (hydrate) => {
          return hydrate({ slots: {} });
        });
        this.templates.placeholder.clearPlaceholder = cleanup;
      }
    }
  };
  var UIDatePickerSelect = class extends UIElement {
    bootWithCalendar() {
      this.picker = this.closest("ui-date-picker");
      this.picker.selectable.blockSyncIf(() => {
        return this.getBoundingClientRect().width > 0;
      });
      initFauxButton(this, () => this.picker._disableable.isDisabled(), () => {
        this.picker.selectable.sync();
        this.picker._dialogable.setState(false);
      });
    }
  };
  element("date-picker", UIDatePicker);
  element("date-picker-select", UIDatePickerSelect);
  element("selected-date", UISelectedDate);
  inject(({ css }) => css`ui-date-picker { display: block; }`);
  inject(({ css }) => css`
/* For Chrome, Safari, Edge */
ui-date-picker input[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}
`);
  function linkExpandedStateToPopover(el, dialogable) {
    setAttribute2(el, "aria-haspopup", "listbox");
    let refreshPopover = () => {
      setAttribute2(el, "aria-expanded", dialogable.getState() ? "true" : "false");
      dialogable.getState() ? setAttribute2(el, "data-open", "") : removeAttribute(el, "data-open", "");
    };
    dialogable.onChange(() => {
      refreshPopover();
    });
    refreshPopover();
  }
  function initPopover(root, trigger, popover, dialogable, anchorable) {
    let refreshPopover = () => {
      Array.from([root, popover]).forEach((i) => {
        dialogable.getState() ? setAttribute2(i, "data-open", "") : removeAttribute(i, "data-open", "");
      });
      dialogable.getState() && anchorable.reposition();
    };
    dialogable.onChange(() => refreshPopover());
    refreshPopover();
    dialogable.onChange(() => {
      if (dialogable.getState()) {
        root.dispatchEvent(new Event("open", {
          bubbles: false,
          cancelable: false
        }));
      } else {
        root.dispatchEvent(new Event("close", {
          bubbles: false,
          cancelable: false
        }));
      }
    });
  }
  function controlPopoverWithKeyboard(button, dialogable) {
    on(button, "keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
      if (e.key === "ArrowDown") {
        if (!dialogable.getState()) {
          dialogable.setState(true);
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      } else if (e.key === "ArrowUp") {
        if (!dialogable.getState()) {
          dialogable.setState(true);
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      } else if (e.key === "Escape") {
        if (dialogable.getState()) {
          dialogable.setState(false);
        }
      }
    });
  }
  function togglePopoverWithMouse(button, dialogable) {
    on(button, "click", () => {
      dialogable.setState(!dialogable.getState());
    });
  }
  function highlightInputContentsWhenFocused(input) {
    on(input, "focus", () => input.select());
  }
  function preventScrollWhenPopoverIsOpen(root, dialogable) {
    let { lock, unlock } = lockScroll();
    dialogable.onChange(() => {
      dialogable.getState() ? lock() : unlock();
    });
  }
  function handlePopoverClosing(root, mode, observable, selectable, dialogable) {
    let closeOnSelect = mode !== CalendarModes.MULTIPLE;
    if (root.hasAttribute("close")) {
      let close = root.getAttribute("close");
      closeOnSelect = close.split(" ").includes("auto");
      if (close === "manual") closeOnSelect = false;
    }
    if (!closeOnSelect) return;
    observable.subscribe(ObservableTrigger.SELECTION, () => {
      if (selectable.hasSelection()) {
        dialogable.setState(false);
      }
    });
  }

  // js/context.js
  var UIContext = class extends UIElement {
    boot() {
      let trigger = this.trigger();
      let overlay = this.overlay();
      this._disabled = this.hasAttribute("disabled");
      this._popoverable = new Popoverable(overlay);
      this._anchorable = new Anchorable(overlay, {
        reference: trigger,
        auto: false,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      let { lock, unlock } = lockScroll();
      this._popoverable.onChange(() => {
        this._popoverable.getState() ? lock() : unlock();
      });
      on(trigger, "contextmenu", (e) => {
        e.preventDefault();
        this._anchorable.reposition(e.pageX, e.pageY);
        this._popoverable.setState(true);
        if (this.hasAttribute("detail")) {
          setAttribute2(overlay, "data-detail", this.getAttribute("detail"));
        }
      });
      if (this.hasAttribute("detail")) {
        setAttribute2(overlay, "data-detail", "");
      }
    }
    trigger() {
      return this.firstElementChild;
    }
    overlay() {
      if (this.hasAttribute("target")) {
        let target = this.getAttribute("target");
        return document.getElementById(target);
      } else {
        return this.lastElementChild.matches("[popover]") && this.lastElementChild;
      }
    }
  };
  element("context", UIContext);

  // js/mixins/activatable.js
  var ActivatableGroup = class extends MixinGroup {
    groupOfType = Activatable;
    boot({ options }) {
      options({
        wrap: false,
        filter: false
      });
      this.onChanges = [];
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    activated(activeEl) {
      this.onChanges.forEach((i) => i());
    }
    activateFirst() {
      this.filterAwareWalker().first()?.use(Activatable).activate();
    }
    activateBySearch(query) {
      let found = this.filterAwareWalker().find((i) => i.textContent.toLowerCase().trim().startsWith(query.toLowerCase()));
      found?.use(Activatable).activate();
    }
    activateSelectedOrFirst(selectedEl) {
      let isHidden = (el) => el.matches("ui-option") ? getComputedStyle(el).display === "none" : false;
      if (!selectedEl || isHidden(selectedEl)) {
        this.filterAwareWalker().first()?.use(Activatable).activate();
        return;
      }
      selectedEl?.use(Activatable).activate();
    }
    activateActiveOrFirst() {
      let active = this.getActive();
      if (!active) {
        this.filterAwareWalker().first()?.use(Activatable).activate();
        return;
      }
      active?.use(Activatable).activate();
    }
    activateActiveOrLast() {
      let active = this.getActive();
      if (!active) {
        this.filterAwareWalker().last()?.use(Activatable).activate();
        return;
      }
      active?.use(Activatable).activate();
    }
    activatePrev() {
      let active = this.getActive();
      if (!active) {
        this.filterAwareWalker().last()?.use(Activatable).activate();
        return;
      }
      let found;
      if (this.options.wrap) {
        found = this.filterAwareWalker().prevOrLast(active);
      } else {
        found = this.filterAwareWalker().prev(active);
      }
      found?.use(Activatable).activate();
    }
    activateNext() {
      let active = this.getActive();
      if (!active) {
        this.filterAwareWalker().first()?.use(Activatable).activate();
        return;
      }
      let found;
      if (this.options.wrap) {
        found = this.filterAwareWalker().nextOrFirst(active);
      } else {
        found = this.filterAwareWalker().next(active);
      }
      found?.use(Activatable).activate();
    }
    getActive() {
      return this.walker().find((i) => i.use(Activatable).isActive());
    }
    clearActive() {
      this.getActive()?.use(Activatable).deactivate();
    }
    filterAwareWalker() {
      let isHidden = (el) => el.matches("ui-option") ? getComputedStyle(el).display === "none" : false;
      return walker(this.el, (el, { skip, reject }) => {
        if (el[this.constructor.name] && el !== this.el) return reject();
        if (!el[this.groupOfType.name]) return skip();
        if (el.hasAttribute("disabled")) return reject();
        if (isHidden(el)) return reject();
      });
    }
  };
  var Activatable = class _Activatable extends Mixin {
    groupedByType = ActivatableGroup;
    mount() {
      this.el.addEventListener("mouseenter", () => {
        this.activate();
      });
      this.el.addEventListener("mouseleave", () => {
        this.deactivate();
      });
    }
    activate() {
      if (this.group()) {
        this.group().walker().each((item) => item.use(_Activatable).deactivate(false));
      }
      setAttribute2(this.el, "data-active", "");
      this.el.scrollIntoView({ block: "nearest" });
      this.group() && this.group().activated(this.el);
    }
    deactivate(notify = true) {
      removeAttribute(this.el, "data-active");
      notify && this.group() && this.group().activated(this.el);
    }
    isActive() {
      return this.el.hasAttribute("data-active");
    }
  };

  // js/mixins/filterable.js
  var FilterableGroup = class extends MixinGroup {
    groupOfType = Filterable;
    boot({ options }) {
      options({});
      this.onChanges = [];
      this.lastSearch = "";
    }
    onChange(callback) {
      this.onChanges.push(callback);
    }
    filter(search2) {
      if (search2 === "") {
        this.walker().each((i) => {
          i.use(Filterable).unfilter();
        });
      } else {
        this.walker().each((i) => {
          if (this.matches(i, search2)) {
            i.use(Filterable).unfilter();
          } else {
            i.use(Filterable).filter();
          }
        });
      }
      if (this.lastSearch !== search2) {
        this.onChanges.forEach((i) => i());
      }
      this.lastSearch = search2;
    }
    matches(el, search2) {
      return el.textContent.toLowerCase().trim().includes(search2.toLowerCase().trim());
    }
    hasResults() {
      return this.walker().some((i) => !i.use(Filterable).isFiltered());
    }
  };
  var Filterable = class extends Mixin {
    groupedByType = FilterableGroup;
    boot({ options }) {
      options({ mirror: null, keep: false });
      this.onChanges = [];
    }
    filter() {
      if (this.options().keep) return;
      setAttribute2(this.el, "data-hidden", "");
      if (this.options().mirror) setAttribute2(this.options().mirror, "data-hidden", "");
    }
    unfilter() {
      removeAttribute(this.el, "data-hidden");
      if (this.options().mirror) removeAttribute(this.options().mirror, "data-hidden", "");
    }
    isFiltered() {
      return this.el.hasAttribute("data-hidden");
    }
  };

  // js/mixins/focusable.js
  var FocusableGroup = class extends MixinGroup {
    groupOfType = Focusable;
    boot({ options }) {
      options({ wrap: false, ensureTabbable: true });
    }
    mount() {
      this.options().ensureTabbable && this.ensureTabbable();
    }
    focusFirst() {
      let target;
      target = target || this.walker().find((i) => i.hasAttribute("autofocus"));
      target = target || this.walker().find((i) => i.getAttribute("tabindex") === "0");
      target = target || this.walker().find((i) => i.getAttribute("tabindex") === "-1");
      target = target || this.walker().find((i) => isFocusable3(i));
      target?.focus();
    }
    focusPrev() {
      this.moveFocus((from) => {
        return this.options().wrap ? this.walker().prevOrLast(from) : this.walker().prev(from);
      });
    }
    focusNext() {
      this.moveFocus((from) => {
        return this.options().wrap ? this.walker().nextOrFirst(from) : this.walker().next(from);
      });
    }
    focusBySearch(query) {
      let found = this.walker().find((i) => i.textContent.toLowerCase().trim().startsWith(query.toLowerCase()));
      found?.use(Focusable).tabbable();
      found?.use(Focusable).focus();
    }
    moveFocus(callback) {
      let tabbable = this.walker().find((i) => i.use(Focusable).isTabbable());
      let to = callback(tabbable);
      to?.use(Focusable).focus();
    }
    ensureTabbable() {
      this.walker().findOrFirst((el) => {
        el.use(Focusable).isTabbable();
      })?.use(Focusable).tabbable();
    }
    wipeTabbables() {
      this.walker().each((el) => {
        el.use(Focusable).untabbable();
      });
    }
    untabbleOthers(except) {
      this.walker().each((el) => {
        if (el === except) return;
        el.use(Focusable).untabbable();
      });
    }
    walker() {
      return walker(this.el, (el, { skip, reject }) => {
        if (el[this.constructor.name] && el !== this.el) return reject();
        if (!el[this.groupOfType.name]) return skip();
        if (el.hasAttribute("disabled")) return reject();
      });
    }
  };
  var Focusable = class extends Mixin {
    groupedByType = FocusableGroup;
    boot({ options }) {
      options({ hover: false, disableable: null, tabbable: false, tabbableAttr: null });
    }
    mount() {
      let disableable = this.options().disableable;
      if (!disableable) throw "Focusable requires a Disableable instance...";
      if (!this.el.hasAttribute("tabindex")) {
        this.options().tabbable ? this.tabbable() : this.untabbable();
      }
      this.pauseFocusListener = this.on("focus", disableable.enabled(() => {
        this.focus(false);
      })).pause;
      this.on("focus", disableable.enabled(() => {
        isUsingKeyboard() && setAttribute2(this.el, "data-focus", "");
      }));
      this.on("blur", disableable.enabled(() => {
        removeAttribute(this.el, "data-focus");
      }));
      this.options().hover && this.on("pointerenter", disableable.enabled(() => {
        this.group()?.untabbleOthers(this.el);
        this.tabbable();
      }));
      this.options().hover && this.on("pointerleave", disableable.enabled((e) => {
        this.untabbable();
      }));
    }
    focus(focusProgramatically = true) {
      this.group()?.untabbleOthers(this.el);
      this.tabbable();
      focusProgramatically && this.pauseFocusListener(() => {
        this.el.focus({ focusVisible: false });
      });
    }
    tabbable() {
      setAttribute2(this.el, "tabindex", "0");
      this.options().tabbableAttr && setAttribute2(this.el, this.options().tabbableAttr, "");
    }
    untabbable() {
      setAttribute2(this.el, "tabindex", "-1");
      this.options().tabbableAttr && removeAttribute(this.el, this.options().tabbableAttr);
    }
    isTabbable() {
      return this.el.getAttribute("tabindex") === "0";
    }
  };

  // js/options.js
  var UIOptions = class extends UIElement {
    boot() {
      setAttribute2(this, "tabindex", "-1");
      if (this.hasAttribute("popover")) {
        this.addEventListener("lofi-close-popovers", () => {
          this.hidePopover();
        });
      }
      setAttribute2(this, "role", "listbox");
    }
  };
  var UIOption = class extends UIElement {
    mount() {
      this._disabled = this.hasAttribute("disabled");
      let target = this;
      if (this._disabled) {
        setAttribute2(target, "disabled", "");
        setAttribute2(target, "aria-disabled", "true");
      }
      let id = assignId(target, "option");
      setAttribute2(target, "role", "option");
      this._filterable = new Filterable(target, {
        mirror: this,
        keep: !!this.closest("ui-empty") || this.getAttribute("filter") === "manual"
      });
      if (this._disabled) return;
      this._activatable = new Activatable(target);
      if (!this.hasAttribute("action")) {
        this._selectable = new Selectable(target, {
          value: this.getValue(),
          label: this.getLabel(),
          selectedInitially: this.hasAttribute("selected")
        });
      }
      let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "selected") {
            if (this.hasAttribute("selected")) this._selectable.setState(true);
            else this._selectable.setState(false);
          }
        });
      });
      observer.observe(this, { attributeFilter: ["selected"] });
    }
    get selected() {
      if (this._disabled) return false;
      if (!this?._selectable) return false;
      return this._selectable.isSelected();
    }
    set selected(value2) {
      if (this._disabled) return;
      if (!this?._selectable) return false;
      this._selectable.setState(value2);
    }
    getLabel() {
      return this.hasAttribute("label") ? this.getAttribute("label") : this.textContent.trim();
    }
    getValue() {
      return this.hasAttribute("value") ? this.getAttribute("value") : this.textContent.trim();
    }
  };
  inject(({ css }) => css`ui-options:not([popover]), ui-option { display: block; cursor: default; }`);
  element("options", UIOptions);
  element("option", UIOption);

  // js/selected.js
  var UISelected = class extends UIElement {
    boot() {
      this.querySelectorAll("[data-appended]").forEach((el) => el.remove());
      if (!this.querySelector("template")) {
        let template = document.createElement("template");
        template.setAttribute("name", "placeholder");
        template.innerHTML = "<span>" + this.innerHTML + "</span>";
        this.innerHTML = "";
        this.appendChild(template);
      }
      if (!this.querySelector('template[name="options"]')) {
        let template = document.createElement("template");
        template.setAttribute("name", "options");
        template.innerHTML = "<div><slot></slot></div>";
        this.appendChild(template);
      }
      if (!this.querySelector('template[name="option"]')) {
        let template = document.createElement("template");
        template.setAttribute("name", "option");
        template.innerHTML = "<div><slot></slot></div>";
        this.appendChild(template);
      }
      this.templates = {
        placeholder: this.querySelector('template[name="placeholder"]'),
        overflow: this.querySelector('template[name="overflow"]'),
        options: this.querySelector('template[name="options"]'),
        option: this.querySelector('template[name="option"]')
      };
      this.templates.options.elsByValue = /* @__PURE__ */ new Map();
      this.max = this.templates.overflow?.getAttribute("max") ? this.templates.overflow.getAttribute("max") : Infinity;
      this.selecteds = /* @__PURE__ */ new Map();
      this.picker = this.closest("ui-select");
      this.multiple = this.picker.hasAttribute("multiple");
    }
    mount() {
      queueMicrotask(() => {
        this.picker._selectable.onInitAndChange(() => {
          this.render(true);
        });
        let optionsEl = this.picker.list();
        if (optionsEl) {
          new MutationObserver((mutations) => {
            queueMicrotask(() => this.render());
          }).observe(optionsEl, { childList: true });
        }
      });
    }
    render(retry) {
      if (!this.multiple) {
        let value2 = this.picker.value;
        if (Array.from(this.selecteds.keys()).includes(value2)) {
          return;
        }
        this.selecteds.clear();
        let selected = this.picker._selectable.findByValue(value2);
        if (selected) {
          this.selecteds.set(value2, selected);
        } else {
          if (!["", null, void 0].includes(value2)) {
            if (retry) return setTimeout(() => {
              console.log("retrying...");
              this.render();
            });
            else throw `Could not find option for value "${value2}"`;
          }
        }
        this.templates.placeholder?.clearPlaceholder?.();
        this.templates.option?.clearOption?.();
        if (this.selecteds.size > 0) {
          this.renderOption();
        } else {
          this.renderPlaceholder();
        }
      } else {
        let values = this.picker.value;
        let removedValues = Array.from(this.selecteds.keys()).filter((i) => !values.includes(i));
        let newValues = values.filter((i) => !this.selecteds.has(i));
        removedValues.forEach((value2) => this.selecteds.delete(value2));
        let newSelecteds = /* @__PURE__ */ new Map();
        for (let value2 of newValues) {
          let selected = this.picker._selectable.findByValue(value2);
          if (!selected) {
            if (retry) return setTimeout(() => this.render());
            else throw `Could not find option for value "${value2}"`;
          }
          newSelecteds.set(value2, selected);
        }
        newSelecteds.forEach((selected, value2) => this.selecteds.set(value2, selected));
        this.templates.placeholder?.clearPlaceholder?.();
        this.templates.overflow?.clearOverflow?.();
        this.templates.options?.clearOptions?.();
        if (this.selecteds.size > 0) {
          this.renderOptions({
            hasOverflowed: (rendered) => {
              if (this.max === "auto") {
                let willOverflow = false;
                this.renderOverflow(this.selecteds.size, this.selecteds.size - rendered);
                if (this.clientWidth < this.scrollWidth) {
                  willOverflow = true;
                }
                this.templates.overflow?.clearOverflow?.();
                if (willOverflow) {
                  return true;
                }
              }
              return rendered > parseInt(this.max);
            },
            renderOverflow: (remainder) => {
              if (this.templates?.overflow?.getAttribute("mode") !== "append") {
                this.templates.options?.clearOptions?.();
              }
              this.renderOverflow(this.selecteds.size, remainder);
            }
          });
        } else {
          this.renderPlaceholder();
        }
      }
    }
    renderOptions({ hasOverflowed, renderOverflow }) {
      let container = document.createElement("div");
      container.style.display = "contents";
      let optionsEl = hydrateTemplate2(this.templates.options, {
        default: container
      });
      this.templates.options.after(optionsEl);
      this.templates.options.clearOptions = () => {
        optionsEl.remove();
        this.templates.options.clearOptions = () => {
        };
      };
      let rendered = 0;
      let shouldRenderOverflow = false;
      for (let [value2, selected] of this.selecteds) {
        let fragment2 = new DocumentFragment();
        fragment2.append(...selected.el.cloneNode(true).childNodes);
        let optionEl = hydrateTemplate2(this.templates.option, {
          text: selected.el.textContent.trim(),
          default: fragment2,
          value: value2
        });
        optionEl.setAttribute("data-value", value2);
        optionEl.setAttribute("data-appended", "");
        optionEl.deselect = () => selected.deselect();
        container.appendChild(optionEl);
        rendered++;
        if (hasOverflowed(rendered)) {
          shouldRenderOverflow = true;
          container.removeChild(optionEl);
          rendered--;
          break;
        }
      }
      let fragment = new DocumentFragment();
      fragment.append(...container.childNodes);
      container.replaceWith(fragment);
      if (shouldRenderOverflow) {
        renderOverflow(this.selecteds.size - rendered);
      }
    }
    renderOption() {
      for (let [value2, selected] of this.selecteds) {
        let fragment = new DocumentFragment();
        fragment.append(...selected.el.cloneNode(true).childNodes);
        let optionEl = hydrateTemplate2(this.templates.option, {
          text: selected.el.textContent.trim(),
          default: fragment,
          value: value2
        });
        optionEl.setAttribute("data-value", value2);
        optionEl.setAttribute("data-appended", value2);
        optionEl.deselect = () => selected.deselect();
        this.templates.option.after(optionEl);
        this.templates.option.clearOption = () => {
          optionEl.remove();
          this.templates.option.clearOption = () => {
          };
        };
      }
    }
    renderPlaceholder() {
      if (!this.templates.placeholder) return;
      let el = hydrateTemplate2(this.templates.placeholder);
      el.setAttribute("data-appended", "");
      this.templates.placeholder.after(el);
      this.templates.placeholder.clearPlaceholder = () => {
        el.remove();
        this.templates.placeholder.clearPlaceholder = () => {
        };
      };
    }
    renderOverflow(count, remainder) {
      if (!this.templates.overflow) return;
      let el = hydrateTemplate2(this.templates.overflow, {
        remainder,
        count: this.selecteds.size
      });
      el.setAttribute("data-appended", "");
      this.templates.overflow.after(el);
      this.templates.overflow.clearOverflow = () => {
        el.remove();
        this.templates.placeholder.clearOverflow = () => {
        };
      };
    }
  };
  function hydrateTemplate2(template, slots = {}) {
    let fragment = template.content.cloneNode(true);
    Object.entries(slots).forEach(([key, value2]) => {
      let slotNodes = key === "default" ? fragment.querySelectorAll("slot:not([name])") : fragment.querySelectorAll(`slot[name="${key}"]`);
      slotNodes.forEach((i) => i.replaceWith(
        typeof value2 === "string" ? document.createTextNode(value2) : value2
      ));
    });
    return fragment.firstElementChild;
  }

  // js/select.js
  var UISelect = class extends UIControl {
    boot() {
      let list = this.list();
      this._controllable = new Controllable(this);
      this._selectable = new SelectableGroup(list, {
        multiple: this.hasAttribute("multiple")
      });
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(detangled(() => {
        this._controllable.dispatch();
        this.dispatchEvent(new CustomEvent("select", { bubbles: false }));
      }));
    }
    mount() {
      this._disableable = new Disableable(this);
      let input = this.input();
      let button = this.button();
      let list = this.list();
      let multiple = this.hasAttribute("multiple");
      let autocomplete = this.hasAttribute("autocomplete");
      let strictAutocomplete = this.hasAttribute("autocomplete") && this.getAttribute("autocomplete").trim().split(" ").includes("strict");
      let listbox = this.querySelector("ui-options") || this;
      let listId = initListbox(listbox, "options");
      this._activatable = new ActivatableGroup(listbox, { filter: "data-hidden" });
      if (!input && !button) {
        this._disableable.onInitAndChange((disabled) => {
          disabled ? this.removeAttribute("tabindex") : this.setAttribute("tabindex", "0");
        });
      }
      if (this.hasAttribute("filter") && this.getAttribute("filter") !== "manual") {
        this._filterable = new FilterableGroup(list);
        this._filterable.onChange(() => {
          this._activatable.clearActive();
          if (this._filterable.hasResults()) {
            this._activatable.activateFirst();
          }
        });
        this.addEventListener("close", () => {
          if (this._filterable) {
            this._filterable.filter("");
          }
        });
      }
      let popoverEl = this.querySelector("[popover]:not(ui-tooltip > [popover])");
      let popoverInputEl = popoverEl?.querySelector("input");
      let inputEl = this.querySelector("input");
      inputEl = popoverEl?.contains(inputEl) ? null : inputEl;
      let buttonEl = this.querySelector("button");
      buttonEl = popoverEl?.contains(buttonEl) ? null : buttonEl;
      if (!(popoverEl || inputEl)) {
        handleKeyboardNavigation(this, this._activatable);
        handleKeyboardSelection(this, this, this._activatable);
        handleActivationOnFocus(this, this._activatable, this._selectable);
      } else if (!popoverEl && inputEl) {
        let input2 = inputEl;
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            input2 && setAttribute2(input2, "disabled", "");
          } else {
            input2 && removeAttribute(input2, "disabled");
          }
        });
        handleInputClearing(this, input2, this._selectable, this._popoverable);
        handleActivationOnFocus(input2, this._activatable, this._selectable);
        handleAutocomplete(autocomplete, strictAutocomplete, this, input2, this._selectable, this._popoverable);
        preventInputEventsFromBubblingToSelectRoot2(input2);
        highlightInputContentsWhenFocused2(input2);
        this._filterable && filterResultsByInput(input2, this._filterable);
        trackActiveDescendant(input2, this._activatable);
        handleKeyboardNavigation(input2, this._activatable);
        handleKeyboardSelection(this, input2, this._activatable);
        handleMouseSelection(this, this._activatable);
      } else if (popoverEl && inputEl) {
        let input2 = inputEl;
        setAttribute2(input2, "role", "combobox");
        setAttribute2(input2, "aria-controls", listId);
        let popover = popoverEl;
        this._popoverable = new Popoverable(popover);
        this._anchorable = new Anchorable(popover, {
          reference: input2,
          matchWidth: true,
          position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
          gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
          offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
        });
        handleAutocomplete(autocomplete, strictAutocomplete, this, input2, this._selectable, this._popoverable);
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            input2 && setAttribute2(input2, "disabled", "");
          } else {
            input2 && removeAttribute(input2, "disabled");
          }
        });
        this.querySelectorAll("button").forEach((button2) => {
          if (popover.contains(button2)) return;
          setAttribute2(button2, "tabindex", "-1");
          setAttribute2(button2, "aria-controls", listId);
          setAttribute2(button2, "aria-haspopup", "listbox");
          linkExpandedStateToPopover2(button2, this._popoverable);
          on(button2, "click", () => {
            this._popoverable.toggle();
            input2.focus();
          });
        });
        handleInputClearing(this, input2, this._selectable, this._popoverable);
        initPopover2(this, input2, popover, this._popoverable, this._anchorable);
        preventScrollWhenPopoverIsOpen2(this, this._popoverable);
        linkExpandedStateToPopover2(input2, this._popoverable);
        preventInputEventsFromBubblingToSelectRoot2(input2);
        highlightInputContentsWhenFocused2(input2);
        this._filterable && filterResultsByInput(input2, this._filterable);
        trackActiveDescendant(input2, this._activatable);
        controlPopoverWithInput(input2, this._popoverable);
        controlPopoverWithKeyboard2(input2, this._popoverable, this._activatable, this._selectable);
        openPopoverWithMouse(input2, this._popoverable);
        handleKeyboardNavigation(input2, this._activatable);
        handleKeyboardSelection(this, input2, this._activatable);
        handleMouseSelection(this, this._activatable);
        controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
        handlePopoverClosing2(this, this._selectable, this._popoverable, multiple);
      } else if (popoverEl && popoverInputEl) {
        let button2 = buttonEl;
        let input2 = popoverInputEl;
        let popover = popoverEl;
        setAttribute2(button2, "role", "combobox");
        setAttribute2(input2, "role", "combobox");
        setAttribute2(button2, "aria-controls", listId);
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            button2 && setAttribute2(button2, "disabled", "");
            input2 && setAttribute2(input2, "disabled", "");
          } else {
            button2 && removeAttribute(button2, "disabled");
            input2 && removeAttribute(input2, "disabled");
          }
        });
        this._popoverable = new Popoverable(popover);
        this._anchorable = new Anchorable(popover, {
          reference: button2,
          matchWidth: true,
          position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
          gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
          offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
        });
        preventInputEventsFromBubblingToSelectRoot2(input2);
        highlightInputContentsWhenFocused2(input2);
        this._filterable && filterResultsByInput(input2, this._filterable);
        focusInputWhenPopoverOpens(input2, this._popoverable);
        initPopover2(this, button2, popover, this._popoverable, this._anchorable);
        preventScrollWhenPopoverIsOpen2(this, this._popoverable);
        linkExpandedStateToPopover2(button2, this._popoverable);
        handleInputClearing(this, input2, this._selectable, this._popoverable);
        controlPopoverWithKeyboard2(button2, this._popoverable, this._activatable, this._selectable);
        togglePopoverWithMouse2(button2, this._popoverable);
        handleKeyboardNavigation(input2, this._activatable);
        handleKeyboardSearchNavigation(button2, this._activatable, this._popoverable);
        handleKeyboardSelection(this, input2, this._activatable);
        handleMouseSelection(this, this._activatable);
        controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
        handlePopoverClosing2(this, this._selectable, this._popoverable, multiple);
      } else if (popoverEl) {
        let button2 = buttonEl;
        let popover = popoverEl;
        setAttribute2(button2, "role", "combobox");
        setAttribute2(button2, "aria-controls", listId);
        this._disableable.onInitAndChange((disabled) => {
          if (disabled) {
            button2 && setAttribute2(button2, "disabled", "");
            input && setAttribute2(input, "disabled", "");
          } else {
            button2 && removeAttribute(button2, "disabled");
            input && removeAttribute(input, "disabled");
          }
        });
        this._popoverable = new Popoverable(popover);
        this._anchorable = new Anchorable(popover, {
          reference: button2,
          matchWidth: true,
          position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
          gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
          offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
        });
        initPopover2(this, button2, popover, this._popoverable, this._anchorable);
        preventScrollWhenPopoverIsOpen2(this, this._popoverable);
        linkExpandedStateToPopover2(button2, this._popoverable);
        controlPopoverWithKeyboard2(button2, this._popoverable, this._activatable, this._selectable);
        togglePopoverWithMouse2(button2, this._popoverable);
        handleKeyboardNavigation(button2, this._activatable);
        handleKeyboardSearchNavigation(button2, this._activatable, this._popoverable);
        handleKeyboardSelection(this, button2, this._activatable);
        handleMouseSelection(this, this._activatable);
        controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
        handlePopoverClosing2(this, this._selectable, this._popoverable, multiple);
      }
      let observer = new MutationObserver(() => {
        setTimeout(() => {
          if (!this._popoverable || this._popoverable.getState()) {
            let firstSelectedOption = this._selectable.selecteds()[0]?.el;
            setTimeout(() => {
              this._activatable.activateSelectedOrFirst(firstSelectedOption);
            });
          } else {
            this._activatable.clearActive();
          }
        });
      });
      observer.observe(list, { childList: true });
    }
    button() {
      return Array.from(this.querySelectorAll("button")).find(
        (button) => button.nextElementSibling?.matches("[popover]")
      ) || null;
    }
    input() {
      return this.querySelector("input");
    }
    list() {
      return this.querySelector("ui-options") || this;
    }
    clear() {
      if (!this.input()) return;
      this.input().value = "";
      this.input().dispatchEvent(new Event("input", { bubbles: false }));
    }
    open() {
      this._popoverable.setState(true);
    }
    close() {
      this._popoverable.setState(false);
    }
    deselectLast() {
      if (!this.hasAttribute("multiple") && this.value !== null) {
        this.value = null;
        this.dispatchEvent(new Event("input", { bubbles: false }));
        this.dispatchEvent(new Event("change", { bubbles: false }));
      }
      if (this.hasAttribute("multiple") && this.value.length !== 0) {
        this.value = this.value.slice(0, -1);
        this.dispatchEvent(new Event("input", { bubbles: false }));
        this.dispatchEvent(new Event("change", { bubbles: false }));
      }
    }
  };
  var UIEmpty = class extends UIElement {
    boot() {
      setAttribute2(this, "data-hidden", "");
    }
    mount() {
      queueMicrotask(() => {
        let picker = this.closest("ui-autocomplete, ui-combobox, ui-select");
        let list = this.closest("ui-options");
        if (!list) return;
        let isHidden = (el) => el.hasAttribute("data-hidden");
        let refresh = () => {
          let empty;
          if (CSS.supports("selector(&)")) {
            empty = Array.from(list.querySelectorAll("& > ui-option")).filter((i) => !isHidden(i)).length === 0;
          } else {
            empty = Array.from(list.querySelectorAll(":scope > ui-option")).filter((i) => !isHidden(i)).length === 0;
          }
          if (empty) {
            removeAttribute(this, "data-hidden");
          } else {
            setAttribute2(this, "data-hidden", "");
          }
        };
        refresh();
        let filterable = picker._filterable;
        if (filterable) {
          filterable.onChange(refresh);
        }
        let observer = new MutationObserver((mutations) => {
          setTimeout(() => refresh());
        });
        observer.observe(list, { childList: true });
      });
    }
  };
  element("selected", UISelected);
  element("select", UISelect);
  element("empty", UIEmpty);
  inject(({ css }) => css`ui-select { display: block; }`);
  inject(({ css }) => css`ui-selected-option { display: contents; }`);
  inject(({ css }) => css`ui-empty { display: block; cursor: default; }`);
  function handleKeyboardNavigation(el, activatable) {
    on(el, "keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
      if (e.key === "ArrowDown") {
        activatable.activateNext();
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "ArrowUp") {
        activatable.activatePrev();
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  function handleKeyboardSearchNavigation(el, activatable, popoverable) {
    search(el, (query) => {
      activatable.activateBySearch(query);
      if (!popoverable.getState()) {
        activatable.getActive()?.click();
      }
    });
  }
  function handleKeyboardSelection(root, el, activatable) {
    on(el, "keydown", (e) => {
      if (e.key === "Enter") {
        let activeEl = activatable.getActive();
        e.preventDefault();
        e.stopPropagation();
        if (!activeEl) return;
        activeEl.click();
        root.dispatchEvent(new CustomEvent("action", {
          bubbles: false,
          cancelable: false
        }));
      }
    });
  }
  function handleMouseSelection(root, activatable, pointerdown = false) {
    on(root, pointerdown ? "pointerdown" : "click", (e) => {
      if (e.target.closest("ui-option")) {
        let option = e.target.closest("ui-option");
        if (option._disabled) return;
        option._selectable?.trigger();
        root.dispatchEvent(new CustomEvent("action", {
          bubbles: false,
          cancelable: false
        }));
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  function handleActivationOnFocus(el, activatable, selectable) {
    on(el, "focus", () => {
      let firstSelectedOption = selectable.selecteds()[0]?.el;
      activatable.activateSelectedOrFirst(firstSelectedOption);
    });
    on(el, "blur", () => {
      activatable.clearActive();
    });
  }
  function initListbox(el) {
    let listId = assignId(el, "options");
    setAttribute2(el, "role", "listbox");
    return listId;
  }
  function linkExpandedStateToPopover2(el, popoverable) {
    setAttribute2(el, "aria-haspopup", "listbox");
    let refreshPopover = () => {
      setAttribute2(el, "aria-expanded", popoverable.getState() ? "true" : "false");
      popoverable.getState() ? setAttribute2(el, "data-open", "") : removeAttribute(el, "data-open", "");
    };
    popoverable.onChange(() => {
      refreshPopover();
    });
    refreshPopover();
  }
  function initPopover2(root, trigger, popover, popoverable, anchorable) {
    let refreshPopover = () => {
      Array.from([root, popover]).forEach((i) => {
        popoverable.getState() ? setAttribute2(i, "data-open", "") : removeAttribute(i, "data-open", "");
      });
      popoverable.getState() ? anchorable.reposition() : anchorable.cleanup();
    };
    popoverable.onChange(() => refreshPopover());
    refreshPopover();
    popoverable.onChange(() => {
      if (popoverable.getState()) {
        root.dispatchEvent(new Event("open", {
          bubbles: false,
          cancelable: false
        }));
      } else {
        root.dispatchEvent(new Event("close", {
          bubbles: false,
          cancelable: false
        }));
      }
    });
  }
  function controlActivationWithPopover(popoverable, activatable, selectable) {
    popoverable.onChange(() => {
      if (popoverable.getState()) {
        let firstSelectedOption = selectable.selecteds()[0]?.el;
        setTimeout(() => {
          activatable.activateSelectedOrFirst(firstSelectedOption);
        });
      } else {
        activatable.clearActive();
      }
    });
  }
  function controlPopoverWithKeyboard2(button, popoverable) {
    on(button, "keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
      if (e.key === "ArrowDown") {
        if (!popoverable.getState()) {
          popoverable.setState(true);
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      } else if (e.key === "ArrowUp") {
        if (!popoverable.getState()) {
          popoverable.setState(true);
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      } else if (e.key === "Escape") {
        if (popoverable.getState()) {
          popoverable.setState(false);
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    });
  }
  function openPopoverWithMouse(el, popoverable) {
    on(el, "click", () => {
      if (!popoverable.getState()) {
        popoverable.setState(true);
        el.focus();
      }
    });
  }
  function togglePopoverWithMouse2(button, popoverable) {
    on(button, "click", () => {
      popoverable.setState(!popoverable.getState());
      button.focus();
    });
  }
  function focusInputWhenPopoverOpens(input, popoverable) {
    popoverable.onChange(() => {
      if (popoverable.getState()) {
        setTimeout(() => input.focus());
      }
    });
  }
  function filterResultsByInput(input, filterable) {
    filterable && on(input, "input", (e) => {
      filterable.filter(e.target.value);
    });
  }
  function highlightInputContentsWhenFocused2(input) {
    on(input, "focus", () => input.select());
  }
  function preventInputEventsFromBubblingToSelectRoot2(input) {
    on(input, "change", (e) => e.stopPropagation());
    on(input, "input", (e) => e.stopPropagation());
  }
  function controlPopoverWithInput(input, popoverable) {
    on(input, "keydown", (e) => {
      if (/^[a-zA-Z0-9]$/.test(e.key) || e.key === "Backspace") {
        popoverable.getState() || popoverable.setState(true);
      }
    });
  }
  function handleInputClearing(root, input, selectable, popoverable) {
    let shouldClear = root.hasAttribute("clear");
    if (!shouldClear) return;
    let setInputValue = (value2) => {
      input.value = value2;
      input.dispatchEvent(new Event("input", { bubbles: false }));
    };
    let clear = root.getAttribute("clear");
    let clearOnAction = clear === "" || clear.split(" ").includes("action");
    let clearOnSelect = clear === "" || clear.split(" ").includes("select");
    let clearOnClose = clear === "" || clear.split(" ").includes("close");
    let clearOnEsc = clear === "" || clear.split(" ").includes("esc");
    if (clear === "none") clearOnAction = clearOnSelect = clearOnClose = clearOnEsc = false;
    if (clearOnAction) {
      root.addEventListener("action", (e) => {
        setInputValue("");
      });
    } else if (clearOnSelect) {
      selectable.onChange(() => {
        queueMicrotask(() => setInputValue(""));
      });
    }
    if (clearOnClose) {
      popoverable.onChange(() => {
        if (!popoverable.getState()) {
          setInputValue("");
        }
      });
    }
    if (clearOnEsc) {
      on(input, "keydown", (e) => {
        if (e.key === "Escape") {
          setInputValue("");
        }
      });
    }
  }
  function handlePopoverClosing2(root, selectable, popoverable, multiple) {
    let closeOnAction = !multiple;
    let closeOnSelect = !multiple;
    if (root.hasAttribute("close")) {
      let close = root.getAttribute("close");
      closeOnAction = close === "" || close.split(" ").includes("action");
      closeOnSelect = close.split(" ").includes("select");
      if (close === "none") closeOnAction = closeOnSelect = false;
    }
    if (closeOnAction) {
      root.addEventListener("action", (e) => {
        popoverable.setState(false);
      });
    } else if (closeOnSelect) {
      selectable.onChange(() => {
        popoverable.setState(false);
      });
    }
  }
  function trackActiveDescendant(input, activatable) {
    activatable.onChange(() => {
      let activeEl = activatable.getActive();
      activeEl ? setAttribute2(input, "aria-activedescendant", activeEl.id) : removeAttribute(input, "aria-activedescendant");
    });
  }
  function handleAutocomplete(autocomplete, isStrict, root, input, selectable, popoverable) {
    if (!autocomplete) {
      setAttribute2(input, "autocomplete", "off");
      setAttribute2(input, "aria-autocomplete", "none");
      return;
    }
    let setInputValue = (value2) => {
      input.value = value2;
      input.dispatchEvent(new Event("input", { bubbles: false }));
    };
    setAttribute2(input, "autocomplete", "off");
    setAttribute2(input, "aria-autocomplete", "list");
    selectable.setState(input.value);
    queueMicrotask(() => {
      selectable.onInitAndChange(() => {
        input.value = selectable.selectedTextValue();
      });
    });
    root.addEventListener("action", (e) => {
      setInputValue(selectable.selectedTextValue());
    });
    if (isStrict) {
      popoverable.onChange(() => {
        if (!popoverable.getState()) {
          setInputValue(selectable.selectedTextValue());
        }
      });
    }
  }
  function preventScrollWhenPopoverIsOpen2(root, popoverable) {
    let { lock, unlock } = lockScroll();
    popoverable.onChange(() => {
      popoverable.getState() ? lock() : unlock();
    });
  }

  // js/menu.js
  var UIMenu = class _UIMenu extends UIElement {
    boot() {
      this._focusable = new FocusableGroup(this, { wrap: false, ensureTabbable: false });
      on(this, "keydown", (e) => {
        if (["ArrowDown"].includes(e.key)) {
          e.target === this ? this._focusable.focusFirst() : this._focusable.focusNext();
          e.preventDefault();
          e.stopPropagation();
        } else if (["ArrowUp"].includes(e.key)) {
          e.target === this ? this._focusable.focusFirst() : this._focusable.focusPrev();
          e.preventDefault();
          e.stopPropagation();
        }
      });
      search(this, (query) => this._focusable.focusBySearch(query));
      if (this.hasAttribute("popover")) {
        this.addEventListener("lofi-close-popovers", () => {
          setTimeout(() => this.hidePopover(), 50);
        });
      }
      if (this.parentElement.localName === "ui-dropdown") {
        let dropdown = this.parentElement;
        on(dropdown.trigger(), "keydown", (e) => {
          if (e.key === "ArrowDown") {
            this.fromArrowDown = true;
            this.showPopover();
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
      setAttribute2(this, "role", "menu");
      setAttribute2(this, "tabindex", "-1");
    }
    mount() {
      this.initializeMenuItems();
      let observer = new MutationObserver((mutations) => {
        this.initializeMenuItems();
      });
      observer.observe(this, { childList: true, subtree: true });
    }
    onPopoverShow() {
      queueMicrotask(() => {
        if (this.fromArrowDown) {
          this._focusable.focusFirst();
          this.fromArrowDown = false;
        } else {
          this.focus();
        }
      });
    }
    onPopoverHide() {
      this._focusable.wipeTabbables();
    }
    initializeMenuItems() {
      this.walker().each((el) => {
        if (el._disableable) return;
        initializeMenuItem(el);
      });
    }
    walker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof _UIMenu) return reject();
        if (el instanceof UISelect) return reject();
        if (!["a", "button"].includes(el.localName)) return skip();
      });
    }
  };
  var UISubmenu = class extends UIElement {
    boot() {
    }
  };
  var UIMenuCheckbox = class extends UIElement {
    boot() {
      this._disabled = this.hasAttribute("disabled");
      this._disableable = new Disableable(this);
      let button = this;
      if (this._disabled) {
        setAttribute2(button, "disabled", "");
        setAttribute2(button, "aria-disabled", "true");
      }
      assignId(button, "menu-checkbox");
      setAttribute2(button, "role", "menuitemcheckbox");
      if (this._disabled) return;
      button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: "data-active" });
      button._selectable = new Selectable(button, {
        toggleable: true,
        value: this.hasAttribute("value") ? this.getAttribute("value") : button.textContent.trim(),
        label: this.hasAttribute("label") ? this.getAttribute("label") : button.textContent.trim(),
        dataAttr: "data-checked",
        ariaAttr: "aria-checked",
        selectedInitially: this.hasAttribute("checked")
      });
      this._controllable = new Controllable(this);
      this._controllable.initial((initial) => initial && button._selectable.setState(initial));
      this._controllable.getter(() => button._selectable.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(detangled(() => {
        this._controllable.dispatch();
      }));
      on(button, "click", () => {
        this.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
        button._selectable.press();
      });
      respondToKeyboardClick(button);
    }
  };
  var UIMenuRadio = class extends UIElement {
    boot() {
      this._disabled = this.hasAttribute("disabled");
      this._disableable = new Disableable(this);
      let button = this;
      if (this._disabled) {
        setAttribute2(button, "disabled", "");
        setAttribute2(button, "aria-disabled", "true");
      }
      assignId(button, "menu-radio");
      setAttribute2(button, "role", "menuitemradio");
      if (this._disabled) return;
      button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: "data-active" });
      button._selectable = new Selectable(button, {
        toggleable: false,
        value: this.hasAttribute("value") ? this.getAttribute("value") : button.textContent.trim(),
        label: this.hasAttribute("label") ? this.getAttribute("label") : button.textContent.trim(),
        dataAttr: "data-checked",
        ariaAttr: "aria-checked",
        selectedInitially: this.hasAttribute("checked")
      });
      on(button, "click", () => {
        this.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
        button._selectable.press();
      });
      respondToKeyboardClick(button);
    }
  };
  var UIMenuRadioGroup = class extends UIElement {
    boot() {
      this._selectable = new SelectableGroup(this);
      this._controllable = new Controllable(this);
      setAttribute2(this, "role", "group");
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(detangled(() => {
        this._controllable.dispatch();
      }));
    }
  };
  var UIMenuCheckboxGroup = class extends UIElement {
    boot() {
      this._selectable = new SelectableGroup(this, { multiple: true });
      this._controllable = new Controllable(this);
      setAttribute2(this, "role", "group");
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(detangled(() => {
        this._controllable.dispatch();
      }));
    }
  };
  inject(({ css }) => css`ui-menu[popover]:popover-open { display: block; }`);
  inject(({ css }) => css`ui-menu[popover].\:popover-open { display: block; }`);
  inject(({ css }) => css`ui-menu-checkbox, ui-menu-radio { cursor: default; display: contents; }`);
  element("menu", UIMenu);
  element("submenu", UISubmenu);
  element("menu-checkbox", UIMenuCheckbox);
  element("menu-radio", UIMenuRadio);
  element("menu-radio-group", UIMenuRadioGroup);
  element("menu-checkbox-group", UIMenuCheckboxGroup);
  function respondToKeyboardClick(el) {
    on(el, "keydown", (e) => {
      if (e.key === "Enter") {
        el.click();
        e.preventDefault();
        e.stopPropagation();
      }
    });
    on(el, "keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    on(el, "keyup", (e) => {
      if (e.key === " ") {
        el.click();
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  function initializeMenuItem(el) {
    el._disableable = new Disableable(el);
    el._disabled = el.hasAttribute("disabled");
    let link = el.querySelector("a");
    let button = el;
    let submenu = el.parentElement.matches("ui-submenu") && el.parentElement.querySelector("ui-menu[popover]");
    let target = link || button;
    if (el._disabled) {
      setAttribute2(target, "disabled", "");
      setAttribute2(target, "aria-disabled", "true");
    }
    assignId(target, "menu-item");
    setAttribute2(target, "role", "menuitem");
    if (el._disabled) return;
    target._focusable = new Focusable(target, { disableable: el._disableable, hover: true, tabbableAttr: "data-active" });
    if (!submenu) {
      el.hasAttribute("disabled") || on(el, "click", () => {
        el.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
      });
      respondToKeyboardClick(button);
    } else {
      submenu._popoverable = new Popoverable(submenu, { triggers: [button] });
      submenu._anchorable = new Anchorable(submenu, {
        reference: button,
        position: submenu.hasAttribute("position") ? submenu.getAttribute("position") : "right start",
        gap: submenu.hasAttribute("gap") ? submenu.getAttribute("gap") : "-5",
        crossAxis: true
      });
      button.addEventListener("click", (e) => {
        submenu._popoverable.setState(true);
      });
      let { clear } = interest(button, submenu, {
        gain() {
          submenu._popoverable.setState(true);
        },
        lose() {
          submenu._popoverable.setState(false);
        },
        focusable: false
      });
      submenu._popoverable.onChange(() => {
        if (!submenu._popoverable.getState()) {
          clear();
          submenu._focusable.wipeTabbables();
        }
        submenu._popoverable.getState() ? submenu._anchorable.reposition() : submenu._anchorable.cleanup();
      });
      on(button, "keydown", (e) => {
        if (e.key === "Enter") {
          submenu._popoverable.setState(true);
          setTimeout(() => submenu._focusable.focusFirst());
        }
      });
      on(button, "keydown", (e) => {
        if (e.key === "ArrowRight") {
          submenu._popoverable.setState(true);
          setTimeout(() => submenu._focusable.focusFirst());
        }
      });
      on(submenu, "keydown", (e) => {
        if (e.key === "ArrowLeft") {
          submenu._popoverable.setState(false);
          button.focus();
          e.stopPropagation();
        }
      });
    }
  }

  // js/toolbar.js
  var UIToolbar = class _UIToolbar extends UIElement {
    mount() {
      this._focusable = new FocusableGroup(this, { wrap: true });
      this._disableable = new Disableable(this);
      let undoDisableds = [];
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          setAttribute2(this, "aria-disabled", "true");
          this.walker().each((el) => {
            if (!el.hasAttribute("disabled")) {
              setAttribute2(el, "disabled", "true");
              setAttribute2(el, "aria-disabled", "true");
              undoDisableds.push(() => {
                removeAndReleaseAttribute(el, "disabled");
                removeAndReleaseAttribute(el, "aria-disabled");
              });
            }
          });
        } else {
          removeAndReleaseAttribute(this, "aria-disabled");
          undoDisableds.forEach((fn) => fn());
          undoDisableds = [];
        }
      });
      on(this, "keydown", (e) => {
        if (["ArrowRight"].includes(e.key)) {
          e.target === this ? this._focusable.focusFirst() : this._focusable.focusNext();
          e.preventDefault();
          e.stopPropagation();
        } else if (["ArrowLeft"].includes(e.key)) {
          e.target === this ? this._focusable.focusFirst() : this._focusable.focusPrev();
          e.preventDefault();
          e.stopPropagation();
        }
      });
      setAttribute2(this, "role", "toolbar");
      this.initializeToolbarItems();
    }
    initializeToolbarItems() {
      this.walker().each((el) => {
        if (el._disableable) return;
        initializeToolbarItem(el);
      });
    }
    walker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof _UIToolbar) return reject();
        if (el.hasAttribute("popover")) return reject();
        if (el instanceof UIMenu) return reject();
        if (el instanceof UIOptions) return reject();
        if (!["a", "button"].includes(el.localName)) return skip();
      });
    }
  };
  element("toolbar", UIToolbar);
  function initializeToolbarItem(el) {
    el._disableable = new Disableable(el);
    el._disabled = el.hasAttribute("disabled");
    let link = el.querySelector("a");
    let button = el;
    let target = link || button;
    if (el._disabled) {
      setAttribute2(target, "disabled", "");
      setAttribute2(target, "aria-disabled", "true");
    }
    if (el._disabled) return;
    target._focusable = new Focusable(target, { disableable: el._disableable });
  }

  // js/tooltip.js
  var UITooltip = class extends UIElement {
    boot() {
      let type = this.hasAttribute("label") ? "label" : "description";
      let button = this.button();
      let overlay = this.overlay();
      if (!button) {
        return console.warn("ui-tooltip: no trigger element found", this);
      } else if (!overlay) {
        return;
      }
      this._disabled = this.hasAttribute("disabled");
      overlay._popoverable = new Popoverable(overlay, { scope: "tooltip" });
      overlay._anchorable = new Anchorable(overlay, {
        reference: button,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      overlay._popoverable.onChange(() => {
        overlay._popoverable.getState() ? overlay._anchorable.reposition() : overlay._anchorable.cleanup();
      });
      if (!this._disabled) {
        interest(button, overlay, {
          gain() {
            overlay._popoverable.setState(true);
          },
          lose() {
            overlay._popoverable.setState(false);
          },
          focusable: true,
          useSafeArea: false
        });
      }
      let id = assignId(overlay, "tooltip");
      let interactive = this.hasAttribute("interactive");
      let wantsLabel = this.hasAttribute("label") || button.textContent.trim() === "";
      if (interactive) {
        setAttribute2(button, "aria-controls", id);
        setAttribute2(button, "aria-expanded", "false");
        overlay._popoverable.onChange(() => {
          overlay._popoverable.getState() ? setAttribute2(button, "aria-expanded", "true") : setAttribute2(button, "aria-expanded", "false");
        });
      } else {
        if (wantsLabel) setAttribute2(button, "aria-labelledby", id);
        else setAttribute2(button, "aria-describedby", id);
        setAttribute2(overlay, "aria-hidden", "true");
      }
      setAttribute2(overlay, "role", "tooltip");
    }
    button() {
      return this.firstElementChild;
    }
    overlay() {
      return this.lastElementChild !== this.button() && this.lastElementChild;
    }
  };
  element("tooltip", UITooltip);

  // js/switch.js
  var UISwitch = class extends UIControl {
    boot() {
      let button = this;
      this._disableable = new Disableable(this);
      this._selectable = new Selectable(button, {
        toggleable: true,
        dataAttr: "data-checked",
        ariaAttr: "aria-checked",
        value: this.hasAttribute("value") ? this.getAttribute("value") : null,
        label: this.hasAttribute("label") ? this.getAttribute("label") : null,
        selectedInitially: this.hasAttribute("checked")
      });
      this.value = this._selectable.getValue();
      this._detangled = detangle();
      this._selectable.onChange(this._detangled(() => {
        this.dispatchEvent(new Event("input", { bubbles: false, cancelable: true }));
        this.dispatchEvent(new Event("change", { bubbles: false, cancelable: true }));
      }));
      setAttribute2(button, "role", "switch");
      if (this.hasAttribute("name")) {
        let name = this.getAttribute("name");
        let input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = this._selectable.getState();
        this.appendChild(input);
        this._selectable.onChange(() => {
          input.value = this._selectable.getState();
        });
      }
      this._disableable.onInitAndChange((disabled) => {
        disabled ? removeAttribute(button, "tabindex", "0") : setAttribute2(button, "tabindex", "0");
      });
      on(button, "click", this._disableable.disabled((e) => {
        e.preventDefault();
        e.stopPropagation();
      }), { capture: true });
      on(button, "click", this._disableable.enabled((e) => {
        this._selectable.press();
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === "Enter") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keyup", this._disableable.enabled((e) => {
        if (e.key === " ") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      respondToLabelClick2(button);
    }
    get checked() {
      return this._selectable.isSelected();
    }
    set checked(value2) {
      this._detangled(() => {
        value2 ? this._selectable.select() : this._selectable.deselect();
      })();
    }
  };
  function respondToLabelClick2(el) {
    el.closest("label")?.addEventListener("click", (e) => {
      if (!el.contains(e.target)) {
        el.click();
      }
    });
  }
  inject(({ css }) => css`ui-switch { display: inline-block; user-select: none; }`);
  element("switch", UISwitch);

  // js/field.js
  var UIField = class _UIField extends UIElement {
    mount() {
      this.control = this.fieldWalker().find((el) => this.isControl(el));
      if (!this.control) return;
    }
    associateLabelWithControl(control) {
      if (!control) return;
      if (!this.label) return;
      this.control = control;
      if (this.control.hasAttribute("aria-labelledby")) return;
      setAttribute2(this.elOrButton(this.control), "aria-labelledby", this.label.id);
      if (this.control && !(this.control instanceof UIControl) && this.hasAttribute("disabled")) {
        this.control.setAttribute("disabled", "");
      }
    }
    associateDescriptionWithControl(control) {
      if (!control) return;
      if (!this.description) return;
      this.control = control;
      if (this.control.hasAttribute("aria-describedby")) return;
      setAttribute2(this.elOrButton(this.control), "aria-describedby", this.description.id);
    }
    associateLabel(label) {
      this.label = label;
      on(label, "click", (e) => {
        if (["a", "button"].includes(e.target.localName)) return;
        this.focusOrTogggle(this.control);
      });
      this.control && this.associateLabelWithControl(this.control);
    }
    associateDescription(description) {
      this.description = description;
      this.control && this.associateDescriptionWithControl(this.control);
    }
    fieldWalker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof _UIField && el !== this) return reject();
        if (el.parentElement.localName === "ui-editor" && el !== this) return reject();
      });
    }
    isControl(el) {
      if (el instanceof UIControl) return true;
      if (el.matches("input, textarea, select")) return true;
      return false;
    }
    focusOrTogggle(control) {
      if (!control) return;
      if (control.disabled || control.hasAttribute("disabled")) return;
      let isCheckable = control.localName === "input" && ["checkbox", "radio"].includes(control.type) || ["ui-switch", "ui-radio", "ui-checkbox"].includes(control.localName);
      if (isCheckable) {
        control.click();
        control.focus();
      } else if (control.localName === "input" && ["file"].includes(control.type)) {
        control.click();
      } else if (["ui-select"].includes(control.localName)) {
        control.trigger().focus();
      } else if (["ui-editor"].includes(control.localName)) {
        control.focus();
      } else {
        control.focus();
      }
    }
    elOrButton(el) {
      if (el instanceof UIElement && el.firstElementChild instanceof HTMLButtonElement) return el.firstElementChild;
      return el;
    }
  };
  var UILabel = class extends UIElement {
    mount() {
      assignId(this, "label");
      setAttribute2(this, "aria-hidden", "true");
      this.closest("ui-field")?.associateLabel(this);
    }
  };
  var UIDescription = class extends UIElement {
    mount() {
      assignId(this, "description");
      setAttribute2(this, "aria-hidden", "true");
      this.closest("ui-field")?.associateDescription(this);
    }
  };
  inject(({ css }) => css`
    ui-label { display: inline-block; cursor: default; user-select: none; }
    ui-description { display: block; }
`);
  element("field", UIField);
  element("label", UILabel);
  element("description", UIDescription);

  // js/chart/observable.js
  var Observable2 = class {
    constructor() {
      this.subscribers = [];
    }
    subscribe(reason, callback) {
      this.subscribers.push({ reason, callback });
    }
    notify(reason, data) {
      this.subscribers.forEach(({ reason: subReason, callback }) => {
        if (reason === subReason) {
          callback(data);
        }
      });
    }
  };

  // js/chart/chart.js
  function generateChartObject(config) {
    let scaleFns = {
      "time": scaleTime,
      "linear": scaleLinear,
      "categorical": scaleCategorical
    };
    let dataMemoKey = Date.now();
    let dimensionsMemoKey = Date.now();
    let memoizedValues = {};
    let memoize = (name, key, fn) => {
      let memoKey = `${name}-${key}`;
      for (let existingKey in memoizedValues) {
        if (existingKey.startsWith(`${name}-`) && !existingKey.endsWith(String(key))) {
          delete memoizedValues[existingKey];
        }
      }
      if (!memoizedValues[memoKey]) {
        memoizedValues[memoKey] = fn();
      }
      return memoizedValues[memoKey];
    };
    let chart = {
      data: [],
      width: config.width,
      height: config.height,
      inset: config.inset,
      axes: {
        x: {
          axis: "x",
          key: config.axes.x.key,
          format: config.axes.x.format,
          inset: { start: 0, end: 0 },
          position: config.axes.x.position || "bottom",
          tickStart: config.axes.x.tickStart,
          tickEnd: config.axes.x.tickEnd,
          tickCount: config.axes.x.tickCount,
          tickStep: config.axes.x.tickStep,
          tickValues: config.axes.x.tickValues,
          tickSuffix: config.axes.x.tickSuffix,
          tickPrefix: config.axes.x.tickPrefix,
          get rawValues() {
            return memoize("x.rawValues", dataMemoKey, () => chart.data.map((d) => d[this.key]));
          },
          get type() {
            return memoize("x.type", dataMemoKey, () => {
              return config.axes.x.scale || (this.rawValues.every((v) => isDateish(v)) ? "time" : "categorical");
            });
          },
          get values() {
            return memoize("x.values", dataMemoKey, () => this.rawValues.map((v) => {
              if (this.type === "time") {
                return dateFromString(v);
              } else if (this.type === "linear") {
                return Number(v);
              } else {
                return v;
              }
            }));
          },
          get ticks() {
            return memoize("x.ticks", dataMemoKey, () => {
              let xTickValues = generateTickValues(chart.data, this, generateDomain(this.type, this.values));
              let xTickLabels = generateTickLabels(xTickValues, this.type, this.format, this.tickSuffix, this.tickPrefix);
              return xTickValues.map((value2, index) => ({ value: value2, label: xTickLabels[index] }));
            });
          },
          get domain() {
            return memoize("x.domain", dataMemoKey, () => generateDomain(this.type, [...this.ticks.map((t) => t.value), ...this.values]));
          },
          get range() {
            return memoize("x.range", dimensionsMemoKey, () => [chart.inset.left + this.inset.start, chart.width - chart.inset.right - this.inset.end]);
          },
          get scale() {
            return memoize("x.scale", dimensionsMemoKey + dataMemoKey, () => scaleFns[this.type](this.domain, this.range, this.values));
          }
        },
        y: {
          axis: "y",
          keys: config.axes.y.keys,
          format: config.axes.y.format,
          inset: { start: 0, end: 0 },
          position: config.axes.y.position || "left",
          tickStart: config.axes.y.tickStart,
          tickEnd: config.axes.y.tickEnd,
          tickCount: config.axes.y.tickCount,
          tickStep: config.axes.y.tickStep,
          tickValues: config.axes.y.tickValues,
          tickSuffix: config.axes.y.tickSuffix,
          tickPrefix: config.axes.y.tickPrefix,
          get values() {
            return memoize("y.values", dataMemoKey, () => chart.data.flatMap((d) => this.keys.reduce((acc, key) => {
              if (!d[key]) {
                return acc;
              }
              acc.push(d[key]);
              return acc;
            }, [])));
          },
          get type() {
            return memoize("y.type", dataMemoKey, () => {
              return config.axes.y.scale || "linear";
            });
          },
          get ticks() {
            return memoize("y.ticks", dataMemoKey, () => {
              let yTickValues = generateTickValues(chart.data, this, generateDomain(this.type, this.values));
              let yTickLabels = generateTickLabels(yTickValues, this.type, this.format, this.tickSuffix, this.tickPrefix);
              return yTickValues.map((value2, index) => ({ value: value2, label: yTickLabels[index] }));
            });
          },
          get domain() {
            return memoize("y.domain", dataMemoKey, () => generateDomain(this.type, [...this.ticks.map((t) => t.value), ...this.values]));
          },
          get range() {
            return memoize("y.range", dimensionsMemoKey, () => [chart.height - chart.inset.bottom - this.inset.end, chart.inset.top + this.inset.start]);
          },
          get scale() {
            return memoize("y.scale", dimensionsMemoKey + dataMemoKey, () => scaleFns[this.type](this.domain, this.range, this.values));
          }
        }
      },
      get series() {
        return memoize("series", dataMemoKey + dimensionsMemoKey, () => this.axes.y.keys.reduce((acc, key) => {
          if (!chart.data[0].hasOwnProperty(key)) {
            console.warn(`ui-chart: series field "${key}" does not exist`);
            return acc;
          }
          let points = chart.data.map((datum) => ({
            x: chart.axes.x.scale(datum[chart.axes.x.key]),
            y: chart.axes.y.scale(datum[key]),
            datum
          }));
          let series = {
            field: key,
            values: chart.data.map((d) => d[key]),
            linePath(curve = "monotone") {
              let points2 = this.points.map((p) => [p.x, p.y]);
              return {
                monotone: monotoneX,
                none: noCurve
              }[curve](points2);
            },
            areaPath(curve = "monotone") {
              let linePath = {
                monotone: monotoneX,
                none: noCurve
              }[curve](this.points.map((p) => [p.x, p.y]));
              let areaPath = `${linePath} L${chart.axes.x.scale(chart.axes.x.domain[1])},${chart.axes.y.scale(chart.axes.y.domain[0])} L${chart.axes.x.scale(chart.axes.x.domain[0])},${chart.axes.y.scale(chart.axes.y.domain[0])} Z`;
              return areaPath;
            },
            points
          };
          acc[key] = series;
          return acc;
        }, {}));
      },
      closestXPoint(xPosition) {
        return this.closestXPoints(xPosition)[0];
      },
      closestXPoints(xPosition) {
        return memoize("closestXPoints", dataMemoKey + dimensionsMemoKey + xPosition, () => {
          let closestPoints = [];
          let minDistance = Infinity;
          Object.values(this.series).forEach((series) => {
            let lastPoint = null;
            series.points.forEach((point) => {
              const distance = Math.abs(point.x - xPosition);
              if (distance < minDistance) {
                minDistance = distance;
                lastPoint = point;
              }
            });
            lastPoint && closestPoints.push(lastPoint);
          });
          return closestPoints;
        });
      },
      updateDimensions(dimensions, inset) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.inset = inset;
        dimensionsMemoKey = Date.now();
      },
      updateData(rawData) {
        let data = JSON.parse(JSON.stringify(rawData));
        if (data[0] && typeof data[0] !== "object") {
          data = data.map((d, i) => {
            return {
              value: d
            };
          });
        }
        if (!data.every((d) => d.index)) {
          data.forEach((d, i) => {
            d.index = i;
          });
        }
        this.data = data;
        dataMemoKey = Date.now();
      }
    };
    chart.updateData(config.data);
    return chart;
  }
  function generateDomain(type, values) {
    let deduplicatedValues = [...new Set(values)];
    if (type === "time") {
      return generateTimeDomain(deduplicatedValues);
    } else if (type === "linear") {
      deduplicatedValues.sort((a, b) => Number(a) - Number(b));
      return [Number(deduplicatedValues[0]), Number(deduplicatedValues[deduplicatedValues.length - 1])];
    } else {
      return [
        deduplicatedValues[0],
        deduplicatedValues[deduplicatedValues.length - 1]
      ];
    }
  }
  function generateTickValues(data, axis, domain) {
    let tickValues = [];
    if (axis.type === "linear") {
      if (axis.tickValues) {
        return axis.tickValues;
      }
      let [minValue, maxValue] = domain;
      let targetCount = axis.tickCount ? Number(axis.tickCount) : 5;
      let tickStart = axis.tickStart === 0 || axis.tickStart === "0" ? 0 : axis.tickStart || "auto";
      let tickEnd = axis.tickEnd === 0 || axis.tickEnd === "0" ? 0 : axis.tickEnd || "auto";
      if (tickStart === "auto" && minValue > 0 && maxValue > 0) {
        minValue = 0;
      }
      if (tickEnd !== "auto" && tickEnd !== "max" && !isNaN(Number(tickEnd))) {
        maxValue = Number(tickEnd);
      }
      let range = maxValue - minValue;
      let rawStep = range / (targetCount - 1);
      let magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      let normalizedStep = rawStep / magnitude;
      let niceStep;
      if (normalizedStep < 1.5) niceStep = 1;
      else if (normalizedStep < 3) niceStep = 2;
      else if (normalizedStep < 7) niceStep = 5;
      else niceStep = 10;
      niceStep *= magnitude;
      let start;
      if (tickStart === "auto") {
        start = Math.floor(minValue / niceStep) * niceStep;
      } else if (tickStart === "min") {
        start = minValue;
      } else {
        start = Number(tickStart);
      }
      let currentTick = start;
      while (currentTick <= maxValue + niceStep * 0.1) {
        if (currentTick >= minValue - niceStep * 0.1) {
          tickValues.push(currentTick);
        }
        currentTick += niceStep;
      }
      if (tickEnd === "max") {
        if (Math.abs(tickValues[tickValues.length - 1] - domain[1]) > niceStep * 0.1) {
          tickValues.push(domain[1]);
        }
      } else if (tickEnd !== "auto" && !isNaN(Number(tickEnd))) {
        const end = Number(tickEnd);
        const count = tickValues.length;
        tickValues = Array.from(
          { length: count },
          (_, i) => start + (end - start) * (i / (count - 1))
        );
      }
      if (tickValues.length > targetCount * 2) {
        let step = Math.ceil(tickValues.length / targetCount);
        tickValues = tickValues.filter((_, i) => i % step === 0);
      }
    } else if (axis.type === "time") {
      let [_, ticks] = generateDateFormatAndTicks(domain[0], domain[1], axis.tickCount);
      return ticks;
    } else if (axis.type === "categorical") {
      data.forEach((datum) => {
        let value2 = datum[axis.key];
        tickValues.push(value2);
      });
      if (axis.tickCount && tickValues.length > axis.tickCount) {
        const step = Math.ceil(tickValues.length / axis.tickCount);
        tickValues = tickValues.filter((_, i) => i % step === 0);
      }
    }
    return tickValues;
  }
  function generateTickLabels(tickValues, type, format, tickSuffix, tickPrefix) {
    let labels = [];
    if (type === "time") {
      if (!format) {
        [format] = generateDateFormatAndTicks(tickValues[0], tickValues[tickValues.length - 1]);
      }
      format = { ...format, timeZone: "UTC" };
      labels = tickValues.map((value2) => new Date(value2).toLocaleString(getLocale(), format));
    } else if (type === "linear") {
      if (format) labels = tickValues.map((value2) => value2.toLocaleString(getLocale(), format));
      else labels = tickValues.map((value2) => value2.toLocaleString(getLocale()));
    } else {
      labels = tickValues.map((value2) => value2 + "");
    }
    if (tickPrefix) labels = labels.map((l) => tickPrefix + l);
    if (tickSuffix) labels = labels.map((l) => l + tickSuffix);
    return labels;
  }
  function scaleCategorical(domain, range, values) {
    const uniqueValues = [...new Set(values)];
    const step = (range[1] - range[0]) / (uniqueValues.length - 1);
    const categoryMap = new Map(
      uniqueValues.map((category, i) => [
        category,
        range[0] + i * step
      ])
    );
    return function(value2) {
      if (value2 === null || value2 === void 0) {
        return void 0;
      }
      return categoryMap.get(value2);
    };
  }
  function scaleLinear(domain, range) {
    const domainDiff = domain[1] - domain[0];
    const rangeDiff = range[1] - range[0];
    return function(value2) {
      return range[0] + (value2 - domain[0]) * (rangeDiff / domainDiff);
    };
  }
  function monotoneX(points) {
    if (points.length < 2) return "";
    const sign = (x) => x < 0 ? -1 : 1;
    const calculateSlope = (x0, y0, x1, y1, x2, y2) => {
      const h0 = x1 - x0;
      const h1 = x2 - x1;
      const s0 = (y1 - y0) / (h0 || h1 < 0 && -0);
      const s1 = (y2 - y1) / (h1 || h0 < 0 && -0);
      const p = (s0 * h1 + s1 * h0) / (h0 + h1);
      return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
    };
    const endpointSlope = (x0, y0, x1, y1, t) => {
      const h = x1 - x0;
      return h ? (3 * (y1 - y0) / h - t) / 2 : t;
    };
    let path = `M${points[0][0]},${points[0][1]}`;
    if (points.length === 2) {
      return path + `L${points[1][0]},${points[1][1]}`;
    }
    for (let i = 0; i < points.length - 2; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      if (p0[0] === p1[0] && p0[1] === p1[1]) continue;
      const p2 = points[i + 2];
      const t1 = calculateSlope(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1]);
      const dx = (p1[0] - p0[0]) / 3;
      const c1x = p0[0] + dx;
      const c1y = p0[1] + dx * (i === 0 ? endpointSlope(p0[0], p0[1], p1[0], p1[1], t1) : points[i - 1] ? calculateSlope(points[i - 1][0], points[i - 1][1], p0[0], p0[1], p1[0], p1[1]) : t1);
      const c2x = p1[0] - dx;
      const c2y = p1[1] - dx * t1;
      path += `C${c1x},${c1y} ${c2x},${c2y} ${p1[0]},${p1[1]}`;
    }
    const n = points.length;
    const last = points[n - 1];
    const secondLast = points[n - 2];
    if (!(last[0] === secondLast[0] && last[1] === secondLast[1])) {
      const t0 = calculateSlope(
        points[n - 3][0],
        points[n - 3][1],
        secondLast[0],
        secondLast[1],
        last[0],
        last[1]
      );
      const dx = (last[0] - secondLast[0]) / 3;
      const c1x = secondLast[0] + dx;
      const c1y = secondLast[1] + dx * t0;
      const c2x = last[0] - dx;
      const c2y = last[1] - dx * endpointSlope(secondLast[0], secondLast[1], last[0], last[1], t0);
      path += `C${c1x},${c1y} ${c2x},${c2y} ${last[0]},${last[1]}`;
    }
    return path;
  }
  function simpleCurve(points, smoothing = 0.05) {
    if (!points || points.length < 2) return "";
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      const prevPoint = points[i - 2] || previous;
      const nextPoint = points[i + 1] || current;
      const cp1x = previous[0] + (nextPoint[0] - prevPoint[0]) * smoothing;
      const cp1y = previous[1] + (nextPoint[1] - prevPoint[1]) * smoothing;
      const cp2x = current[0] - (nextPoint[0] - prevPoint[0]) * smoothing;
      const cp2y = current[1] - (nextPoint[1] - prevPoint[1]) * smoothing;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current[0]} ${current[1]}`;
    }
    return path;
  }
  function noCurve(points) {
    return simpleCurve(points, 0);
  }
  function isDateish(value2) {
    return value2 instanceof Date || typeof value2 === "string" && value2.includes("-") && !isNaN(Date.parse(value2));
  }
  function generateTimeDomain(values) {
    values.sort((a, b) => {
      if (typeof a === "string") {
        return a.localeCompare(b);
      }
      return a - b;
    });
    return [
      dateFromString(values[0]),
      dateFromString(values[values.length - 1])
    ];
  }
  function scaleTime(domain, range) {
    let minValue = new Date(domain[0]).getTime();
    let maxValue = new Date(domain[1]).getTime();
    let domainDiff = maxValue - minValue;
    let rangeDiff = range[1] - range[0];
    return function(value2) {
      if (!value2) return void 0;
      const dateValue = dateFromString(value2);
      if (isNaN(dateValue.getTime())) return void 0;
      const percent = (dateValue.getTime() - minValue) / domainDiff;
      return range[0] + percent * rangeDiff;
    };
  }
  function generateDateFormatAndTicks(start, end, tickCount) {
    let startDate = start;
    let endDate = end;
    const diffMs = endDate - startDate;
    const diffSeconds = diffMs / 1e3;
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;
    const diffYears = diffDays / 365;
    let format;
    let incrementFn;
    let firstTick;
    if (diffHours < 1) {
      format = { hour: "numeric", minute: "numeric", hour12: true };
      let hourStep = tickCount ? Math.max(1, Math.floor(diffMinutes / (tickCount - 1))) : 1;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes() + hourStep));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), startDate.getUTCHours()));
    } else if (diffDays < 1) {
      format = { hour: "numeric", hour12: true };
      let hourStep = tickCount ? Math.max(1, Math.floor(diffHours / (tickCount - 1))) : 1;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + hourStep));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0));
    } else if (diffDays <= 7) {
      format = { weekday: "short", hour: "numeric", hour12: true };
      let hourStep = tickCount ? Math.max(1, Math.floor(diffHours / (tickCount - 1))) : 6;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + hourStep));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0));
    } else if (diffDays <= 30) {
      format = { month: "short", day: "numeric" };
      let dateStep = tickCount ? Math.max(1, Math.floor(diffDays / (tickCount - 1))) : 1;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + dateStep));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    } else if (diffMonths <= 6) {
      format = { month: "short", day: "numeric" };
      let dateStep = tickCount ? Math.max(1, Math.floor(diffDays / (tickCount - 1))) : 7;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + dateStep));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    } else if (diffYears < 2) {
      format = { month: "short" };
      let monthStep = tickCount ? Math.max(1, Math.floor(diffMonths / (tickCount - 1))) : 1;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthStep, 1));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth()));
    } else {
      format = { year: "numeric" };
      let yearStep = tickCount ? Math.max(1, Math.floor(diffYears / (tickCount - 1))) : 1;
      incrementFn = (date) => new Date(Date.UTC(date.getUTCFullYear() + yearStep, 0, 1));
      firstTick = new Date(Date.UTC(startDate.getUTCFullYear(), 0, 1));
    }
    let ticks = [startDate];
    let currentTick = startDate;
    while (currentTick <= endDate) {
      currentTick = incrementFn(currentTick);
      if (currentTick <= endDate) {
        ticks.push(new Date(currentTick.getTime()));
      }
    }
    return [format, ticks];
  }
  function dateFromString(value2) {
    if (value2 instanceof Date) return value2;
    let {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    } = parseDateString(value2);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  }
  function parseDateString(dateStr) {
    const match = dateStr.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z)?)?$/);
    if (!match) {
      throw new Error("Invalid date format");
    }
    return {
      year: match[1] ? parseInt(match[1], 10) : null,
      month: match[2] ? parseInt(match[2], 10) : null,
      day: match[3] ? parseInt(match[3], 10) : null,
      hour: match[4] ? parseInt(match[4], 10) : null,
      minute: match[5] ? parseInt(match[5], 10) : null,
      second: match[6] ? parseInt(match[6], 10) : null,
      millisecond: match[7] ? parseInt(match[7].padEnd(3, "0"), 10) : null,
      utc: !!match[8]
    };
  }

  // js/chart/index.js
  var UIChart = class extends HTMLElement {
    constructor() {
      super();
      let svgTemplate = this.querySelector('template[name="svg"]');
      let svg = hydrateTemplate(svgTemplate);
      svgTemplate.after(svg);
      this.init(svgTemplate, svg);
    }
    init(svgTemplate, svg) {
      this._data = this.hasAttribute("value") ? JSON.parse(this.getAttribute("value")) : [];
      this._observable = new Observable2();
      this._selectable = { getState: () => this._data, setState: (value2) => {
        this._data = value2;
        this._observable.notify("data", this._data);
      } };
      this._controllable = new Controllable(this);
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      this._controllable.setter((value2) => {
        this._selectable.setState(value2);
      });
      let templates = {
        svg: svgTemplate,
        lines: {},
        areas: {},
        points: {},
        cursor: svgTemplate.content.querySelector('template[name="cursor"]'),
        zeroLine: svgTemplate.content.querySelector('template[name="zero-line"]'),
        axes: {
          x: {
            template: svgTemplate.content.querySelector('template[name="axis"][axis="x"]'),
            axisLine: svgTemplate.content.querySelector('template[name="axis"][axis="x"] template[name="axis-line"]'),
            gridLine: svgTemplate.content.querySelector('template[name="axis"][axis="x"] template[name="grid-line"]'),
            tickMark: svgTemplate.content.querySelector('template[name="axis"][axis="x"] template[name="tick-mark"]'),
            tickLabel: svgTemplate.content.querySelector('template[name="axis"][axis="x"] template[name="tick-label"]')
          },
          y: {
            template: svgTemplate.content.querySelector('template[name="axis"][axis="y"]'),
            axisLine: svgTemplate.content.querySelector('template[name="axis"][axis="y"] template[name="axis-line"]'),
            gridLine: svgTemplate.content.querySelector('template[name="axis"][axis="y"] template[name="grid-line"]'),
            tickMark: svgTemplate.content.querySelector('template[name="axis"][axis="y"] template[name="tick-mark"]'),
            tickLabel: svgTemplate.content.querySelector('template[name="axis"][axis="y"] template[name="tick-label"]')
          }
        },
        tooltip: this.querySelector('template[name="tooltip"]'),
        summary: this.querySelector('template[name="summary"]')
      };
      svgTemplate.content.querySelectorAll('template[name="line"]').forEach((template) => {
        templates.lines[template.getAttribute("field")] = template;
      });
      svgTemplate.content.querySelectorAll('template[name="area"]').forEach((template) => {
        templates.areas[template.getAttribute("field")] = template;
      });
      svgTemplate.content.querySelectorAll('template[name="point"]').forEach((template) => {
        templates.points[template.getAttribute("field")] = template;
      });
      let repositionCursorLine = () => {
      };
      let repositionTooltip = () => {
      };
      let updateSummary = () => {
      };
      let activatePoint = () => {
      };
      let cursorLine = null;
      let overlay = null;
      let tooltip = null;
      let summary = null;
      overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      overlay.setAttribute("data-overlay", "");
      overlay.setAttribute("fill", "none");
      overlay.setAttribute("pointer-events", "all");
      overlay.addEventListener("mousemove", throttle(function(event) {
        repositionCursorLine(event);
        repositionTooltip(event);
        updateSummary(event);
        activatePoint(event);
      }, 1));
      overlay.addEventListener("mouseleave", () => {
        repositionCursorLine(null);
        repositionTooltip(null);
        updateSummary(null);
        activatePoint(null);
      });
      svg.appendChild(overlay);
      if (templates.cursor) {
        cursorLine = hydrateSvgTemplate(templates.cursor);
        cursorLine.setAttribute("data-cursor", "");
        svg.appendChild(cursorLine);
      }
      if (templates.tooltip) {
        tooltip = hydrateTemplate(templates.tooltip);
        templates.tooltip.after(tooltip);
      }
      if (templates.summary) {
        summary = hydrateTemplate(templates.summary);
        templates.summary.after(summary);
      }
      let gutter = { left: 8, right: 8, top: 8, bottom: 8 };
      if (templates.svg?.hasAttribute("gutter")) {
        let values = templates.svg?.getAttribute("gutter").split(" ").map((i) => i.replace("px", "")).map(Number);
        if (values.length === 1) {
          gutter.top = values[0];
          gutter.right = values[0];
          gutter.bottom = values[0];
          gutter.left = values[0];
        } else if (values.length === 2) {
          gutter.top = values[0];
          gutter.right = values[1];
          gutter.bottom = values[0];
          gutter.left = values[1];
        } else if (values.length === 3) {
          gutter.top = values[0];
          gutter.right = values[1];
          gutter.bottom = values[2];
          gutter.left = values[1];
        } else if (values.length === 4) {
          gutter.top = values[0];
          gutter.right = values[1];
          gutter.bottom = values[2];
          gutter.left = values[3];
        }
      }
      let [xKey, yKeys] = discoverXandYKeys(svg);
      let chart = generateChartObject({
        data: this._data,
        width: svg.parentElement.getBoundingClientRect().width,
        height: svg.parentElement.getBoundingClientRect().height,
        inset: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        axes: {
          x: {
            key: xKey,
            format: templates.axes.x.template?.hasAttribute("format") ? JSON.parse(templates.axes.x.template?.getAttribute("format")) : null,
            scale: templates.axes.x.template?.getAttribute("scale"),
            position: templates.axes.x.template?.getAttribute("position"),
            tickCount: templates.axes.x.template?.getAttribute("tick-count") || templates.axes.x.tickLabel?.getAttribute("target-tick-count"),
            tickStart: templates.axes.x.template?.getAttribute("tick-start"),
            tickEnd: templates.axes.x.template?.getAttribute("tick-end"),
            tickStep: templates.axes.x.template?.getAttribute("tick-step") ? Number(templates.axes.x.template?.getAttribute("tick-step")) : null,
            tickSuffix: templates.axes.x.template?.getAttribute("tick-suffix"),
            tickPrefix: templates.axes.x.template?.getAttribute("tick-prefix"),
            tickValues: templates.axes.x.template?.hasAttribute("tick-values") ? JSON.parse(templates.axes.x.template?.getAttribute("tick-values")) : null
          },
          y: {
            keys: yKeys,
            format: templates.axes.y.template?.hasAttribute("format") ? JSON.parse(templates.axes.y.template?.getAttribute("format")) : null,
            scale: templates.axes.y.template?.getAttribute("scale"),
            position: templates.axes.y.template?.getAttribute("position"),
            tickCount: templates.axes.y.template?.getAttribute("tick-count") || templates.axes.y.tickLabel?.getAttribute("target-tick-count"),
            tickStart: templates.axes.y.template?.getAttribute("tick-start"),
            tickEnd: templates.axes.y.template?.getAttribute("tick-end"),
            tickStep: templates.axes.y.template?.getAttribute("tick-step") ? Number(templates.axes.y.template?.getAttribute("tick-step")) : null,
            tickSuffix: templates.axes.y.template?.getAttribute("tick-suffix"),
            tickPrefix: templates.axes.y.template?.getAttribute("tick-prefix"),
            tickValues: templates.axes.y.template?.hasAttribute("tick-values") ? JSON.parse(templates.axes.y.template?.getAttribute("tick-values")) : null
          }
        }
      });
      let redraw = (checkOverflow = true) => {
        setAttribute2(svg, "viewBox", `0 0 ${chart.width} ${chart.height}`);
        if (chart.data.length === 0) {
          return;
        }
        if (chart.data.length === 1) {
          console.warn("ui-chart: chart only has one data point so it cannot be rendered.");
          return;
        }
        if (chart.data[0][chart.axes.x.key] === void 0) {
          console.warn(`ui-chart: axis field "${chart.axes.x.key}" does not exist`);
          return;
        }
        Object.entries(chart.series).forEach(([field, series]) => {
          let line = svg.querySelector(`[data-line][data-series="${field}"]`);
          let template = templates.lines[field];
          if (template) {
            let curve = template.getAttribute("curve") || "monotone";
            if (!line) {
              let lineEl = hydrateSvgTemplate(template);
              lineEl.setAttribute("data-line", "");
              lineEl.setAttribute("data-series", field);
              lineEl.setAttribute("d", series.linePath(curve));
              svg.appendChild(lineEl);
            } else {
              line.setAttribute("d", series.linePath(curve));
            }
          }
        });
        Object.entries(chart.series).forEach(([field, series]) => {
          let area = svg.querySelector(`[data-area][data-series="${field}"]`);
          let template = templates.areas[field];
          if (template) {
            let curve = template.getAttribute("curve") || "monotone";
            if (!area) {
              let areaEl = hydrateSvgTemplate(template);
              areaEl.setAttribute("data-area", "");
              areaEl.setAttribute("data-series", field);
              areaEl.setAttribute("d", series.areaPath(curve));
              svg.appendChild(areaEl);
            } else {
              area.setAttribute("d", series.areaPath(curve));
            }
          }
        });
        Object.entries(chart.series).forEach(([field, series]) => {
          let pointGroupEl = svg.querySelector(`[data-point-group][data-series="${field}"]`);
          let template = templates.points[field];
          if (template) {
            svg.querySelector(`[data-point-group][data-series="${field}"]`)?.remove();
            pointGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            pointGroupEl.setAttribute("data-point-group", "");
            pointGroupEl.setAttribute("data-series", field);
            series.points.forEach((point) => {
              let pointEl = hydrateSvgTemplate(template);
              pointEl.setAttribute("data-point", "");
              pointEl.setAttribute("data-series", field);
              pointEl.setAttribute("cx", point.x);
              pointEl.setAttribute("cy", point.y);
              pointGroupEl.appendChild(pointEl);
            });
            svg.appendChild(pointGroupEl);
          }
        });
        activatePoint = (event) => {
          svg.querySelectorAll("[data-point-group]").forEach((pointGroupEl) => {
            pointGroupEl.querySelectorAll("[data-point]").forEach((i) => i.removeAttribute("data-active"));
            if (event) {
              let mouseX = event.clientX - svg.getBoundingClientRect().left;
              let mouseY = event.clientY - svg.getBoundingClientRect().top;
              if (mouseX >= chart.inset.left && mouseX <= chart.width - chart.inset.right && mouseY >= chart.inset.top && mouseY <= chart.height - chart.inset.bottom) {
                let closestPoints = chart.closestXPoints(mouseX);
                closestPoints.forEach((point) => {
                  pointGroupEl.querySelectorAll(`[data-point][cx="${point.x}"]`).forEach((i) => i.setAttribute("data-active", ""));
                });
              }
            } else {
              pointGroupEl.querySelectorAll("[data-point]").forEach((i) => i.removeAttribute("data-active"));
            }
          });
        };
        if (templates.axes.x.template) {
          if (templates.axes.x.axisLine) {
            svg.querySelector('[data-axis-line][data-axis="x"]')?.remove();
            let axisLineEl = hydrateSvgTemplate(templates.axes.x.axisLine);
            axisLineEl.setAttribute("data-axis-line", "");
            axisLineEl.setAttribute("data-axis", "x");
            axisLineEl.setAttribute("x1", chart.axes.x.scale(chart.axes.x.domain[0]));
            axisLineEl.setAttribute("x2", chart.axes.x.scale(chart.axes.x.domain[1]));
            axisLineEl.setAttribute("y1", chart.axes.y.scale(chart.axes.y.domain[chart.axes.x.position === "bottom" ? 0 : 1]));
            axisLineEl.setAttribute("y2", chart.axes.y.scale(chart.axes.y.domain[chart.axes.x.position === "bottom" ? 0 : 1]));
            svg.appendChild(axisLineEl);
          }
          if (templates.axes.x.gridLine) {
            svg.querySelector('[data-grid-line-group][data-axis="x"]')?.remove();
            let gridLineGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gridLineGroupEl.setAttribute("data-grid-line-group", "");
            gridLineGroupEl.setAttribute("data-axis", "x");
            chart.axes.x.ticks.forEach(({ value: value2 }) => {
              let gridLineEl = hydrateSvgTemplate(templates.axes.x.gridLine);
              gridLineEl.setAttribute("data-grid-line", "");
              gridLineEl.setAttribute("data-axis", "x");
              gridLineEl.setAttribute("x1", chart.axes.x.scale(value2));
              gridLineEl.setAttribute("x2", chart.axes.x.scale(value2));
              gridLineEl.setAttribute("y1", chart.inset.top);
              gridLineEl.setAttribute("y2", chart.height - chart.inset.bottom);
              gridLineGroupEl.appendChild(gridLineEl);
            });
            svg.appendChild(gridLineGroupEl);
          }
          if (templates.axes.x.tickMark) {
            svg.querySelector('[data-tick-mark-group][data-axis="x"]')?.remove();
            let tickMarkGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            tickMarkGroupEl.setAttribute("data-tick-mark-group", "");
            tickMarkGroupEl.setAttribute("data-axis", "x");
            chart.axes.x.ticks.forEach(({ value: value2, label }) => {
              let position = { x: chart.axes.x.scale(value2), y: chart.axes.y.scale(chart.axes.y.domain[chart.axes.x.position === "bottom" ? 0 : 1]) };
              let tickMarkEl = hydrateSvgTemplate(templates.axes.x.tickMark);
              tickMarkEl.setAttribute("data-tick-mark", "");
              tickMarkEl.setAttribute("data-axis", "x");
              tickMarkEl.setAttribute("transform", `translate(${position.x}, ${position.y})`);
              tickMarkGroupEl.appendChild(tickMarkEl);
            });
            svg.appendChild(tickMarkGroupEl);
          }
          if (templates.axes.x.tickLabel) {
            svg.querySelector('[data-tick-label-group][data-axis="x"]')?.remove();
            let tickLabelGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            tickLabelGroupEl.setAttribute("data-tick-label-group", "");
            tickLabelGroupEl.setAttribute("data-axis", "x");
            chart.axes.x.ticks.forEach(({ value: value2, label }) => {
              let position = { x: chart.axes.x.scale(value2), y: chart.axes.y.scale(chart.axes.y.domain[chart.axes.x.position === "bottom" ? 0 : 1]) };
              let tickLabelEl = hydrateSvgTemplate(templates.axes.x.tickLabel);
              tickLabelEl.querySelectorAll("slot").forEach((i) => i.replaceWith(document.createTextNode(label)));
              tickLabelEl.setAttribute("data-tick-label", "");
              tickLabelEl.setAttribute("data-axis", "x");
              tickLabelEl.setAttribute("transform", `translate(${position.x}, ${position.y})`);
              tickLabelGroupEl.appendChild(tickLabelEl);
            });
            svg.appendChild(tickLabelGroupEl);
            handleTickOverflow(tickLabelGroupEl, chart.axes.x);
          }
        }
        if (templates.axes.y.template) {
          if (templates.axes.y.axisLine) {
            svg.querySelector('[data-axis-line][data-axis="y"]')?.remove();
            let axisLineEl = hydrateSvgTemplate(templates.axes.y.axisLine);
            axisLineEl.setAttribute("data-axis-line", "");
            axisLineEl.setAttribute("data-axis", "y");
            axisLineEl.setAttribute("x1", chart.axes.x.scale(chart.axes.x.domain[chart.axes.y.position === "left" ? 0 : 1]));
            axisLineEl.setAttribute("x2", chart.axes.x.scale(chart.axes.x.domain[chart.axes.y.position === "left" ? 0 : 1]));
            axisLineEl.setAttribute("y1", chart.axes.y.scale(chart.axes.y.domain[0]));
            axisLineEl.setAttribute("y2", chart.axes.y.scale(chart.axes.y.domain[1]));
            svg.appendChild(axisLineEl);
          }
          if (templates.axes.y.gridLine) {
            svg.querySelector('[data-grid-line-group][data-axis="y"]')?.remove();
            let gridLineGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gridLineGroupEl.setAttribute("data-grid-line-group", "");
            gridLineGroupEl.setAttribute("data-axis", "y");
            chart.axes.y.ticks.forEach(({ value: value2, label }) => {
              let position = { x: chart.axes.x.scale(chart.axes.x.domain[0]), y: chart.axes.y.scale(value2) };
              let gridLineEl = hydrateSvgTemplate(templates.axes.y.gridLine);
              gridLineEl.setAttribute("data-grid-line", "");
              gridLineEl.setAttribute("data-axis", "y");
              gridLineEl.setAttribute("x1", chart.inset.left);
              gridLineEl.setAttribute("x2", chart.width - chart.inset.right);
              gridLineEl.setAttribute("y1", position.y);
              gridLineEl.setAttribute("y2", position.y);
              gridLineGroupEl.appendChild(gridLineEl);
            });
            svg.appendChild(gridLineGroupEl);
          }
          if (templates.axes.y.tickMark) {
            svg.querySelector('[data-tick-mark-group][data-axis="y"]')?.remove();
            let tickMarkGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            tickMarkGroupEl.setAttribute("data-tick-mark-group", "");
            tickMarkGroupEl.setAttribute("data-axis", "y");
            chart.axes.y.ticks.forEach(({ value: value2, label }) => {
              let position = { x: chart.axes.x.scale(chart.axes.x.domain[chart.axes.y.position === "left" ? 0 : 1]), y: chart.axes.y.scale(value2) };
              let tickMarkEl = hydrateSvgTemplate(templates.axes.y.tickMark);
              tickMarkEl.setAttribute("data-tick-mark", "");
              tickMarkEl.setAttribute("data-axis", "y");
              tickMarkEl.setAttribute("transform", `translate(${position.x}, ${position.y})`);
              tickMarkGroupEl.appendChild(tickMarkEl);
            });
            svg.appendChild(tickMarkGroupEl);
          }
          if (templates.axes.y.tickLabel) {
            svg.querySelector('[data-tick-label-group][data-axis="y"]')?.remove();
            let tickLabelGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
            tickLabelGroupEl.setAttribute("data-tick-label-group", "");
            tickLabelGroupEl.setAttribute("data-axis", "y");
            chart.axes.y.ticks.forEach(({ value: value2, label }) => {
              let position = { x: chart.axes.x.scale(chart.axes.x.domain[chart.axes.y.position === "left" ? 0 : 1]), y: chart.axes.y.scale(value2) };
              let tickLabelEl = hydrateSvgTemplate(templates.axes.y.tickLabel);
              tickLabelEl.querySelectorAll("slot").forEach((i) => i.replaceWith(document.createTextNode(label)));
              tickLabelEl.setAttribute("data-tick-label", "");
              tickLabelEl.setAttribute("data-axis", "y");
              tickLabelEl.setAttribute("transform", `translate(${position.x}, ${position.y})`);
              tickLabelGroupEl.appendChild(tickLabelEl);
            });
            svg.appendChild(tickLabelGroupEl);
            handleTickOverflow(tickLabelGroupEl, chart.axes.y);
          }
          if (templates.zeroLine && chart.axes.y.domain[0] < 0 && chart.axes.y.domain[1] > 0) {
            svg.querySelector('[data-zero-line][data-axis="y"]')?.remove();
            let zeroLineEl = hydrateSvgTemplate(templates.zeroLine);
            zeroLineEl.setAttribute("data-zero-line", "");
            zeroLineEl.setAttribute("data-axis", "y");
            zeroLineEl.setAttribute("x1", chart.axes.x.scale(chart.axes.x.domain[0]));
            zeroLineEl.setAttribute("x2", chart.axes.x.scale(chart.axes.x.domain[1]));
            zeroLineEl.setAttribute("y1", chart.axes.y.scale(0));
            zeroLineEl.setAttribute("y2", chart.axes.y.scale(0));
            svg.appendChild(zeroLineEl);
          }
        }
        if (overlay) {
          overlay.setAttribute("width", chart.width);
          overlay.setAttribute("height", chart.height);
          overlay.setAttribute("x", 0);
          overlay.setAttribute("y", 0);
        }
        if (cursorLine) {
          repositionCursorLine = (event) => {
            if (event) {
              let mouseX = event.clientX - svg.getBoundingClientRect().left;
              let mouseY = event.clientY - svg.getBoundingClientRect().top;
              if (mouseX >= chart.inset.left && mouseX <= chart.width - chart.inset.right && mouseY >= chart.inset.top && mouseY <= chart.height - chart.inset.bottom) {
                let closestXPoint = chart.closestXPoint(mouseX);
                cursorLine.setAttribute("opacity", "1");
                cursorLine.setAttribute("x1", closestXPoint.x);
                cursorLine.setAttribute("x2", closestXPoint.x);
                cursorLine.setAttribute("y1", chart.axes.y.scale(chart.axes.y.domain[0]));
                cursorLine.setAttribute("y2", chart.axes.y.scale(chart.axes.y.domain[1]));
              } else {
                cursorLine.setAttribute("opacity", "0");
              }
            } else {
              cursorLine.setAttribute("opacity", "0");
            }
          };
        }
        if (tooltip) {
          repositionTooltip = (event) => {
            if (event === null) {
              removeAttribute(tooltip, "data-active");
            } else {
              let mouseX = event.clientX - svg.getBoundingClientRect().left;
              let mouseY = event.clientY - svg.getBoundingClientRect().top;
              if (mouseX >= chart.inset.left && mouseX <= chart.width - chart.inset.right && mouseY >= chart.inset.top && mouseY <= chart.height - chart.inset.bottom) {
                let closestXPoint = chart.closestXPoint(mouseX);
                if (closestXPoint) {
                  setAttribute2(tooltip, "data-active", "");
                  let tooltipRect = tooltip.getBoundingClientRect();
                  let svgRect = svg.getBoundingClientRect();
                  let rightSpace = svgRect.width - (closestXPoint.x + tooltipRect.width + 15);
                  let bottomSpace = svgRect.height - (mouseY + tooltipRect.height + 15);
                  let xOffset = rightSpace < 0 ? closestXPoint.x - tooltipRect.width - 15 : closestXPoint.x + 15;
                  let yOffset = bottomSpace < 0 ? mouseY - tooltipRect.height - 15 : mouseY + 15;
                  tooltip.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                  let tooltipClone = templates.tooltip.content.cloneNode(true).firstElementChild;
                  tooltipClone.querySelectorAll("slot").forEach((slot) => {
                    let field = slot.getAttribute("field");
                    if (field) {
                      let format = slot.hasAttribute("format") ? JSON.parse(slot.getAttribute("format")) : {};
                      format = { ...format, timeZone: "UTC" };
                      let value2 = closestXPoint.datum[field];
                      if (isNumeric(value2)) {
                        value2 = Number(value2).toLocaleString(getLocale(), format);
                      } else if (isDateish2(value2)) {
                        value2 = new Date(value2).toLocaleDateString(getLocale(), format);
                      }
                      slot.textContent = value2;
                    }
                  });
                  tooltip.innerHTML = tooltipClone.innerHTML;
                } else {
                  removeAttribute(tooltip, "data-active");
                }
              } else {
                removeAttribute(tooltip, "data-active");
              }
            }
          };
        }
        if (summary) {
          updateSummary = (event) => {
            let closestXPoint = null;
            if (event !== null) {
              let mouseX = event.clientX - svg.getBoundingClientRect().left;
              let mouseY = event.clientY - svg.getBoundingClientRect().top;
              if (mouseX >= chart.inset.left && mouseX <= chart.width - chart.inset.right && mouseY >= chart.inset.top && mouseY <= chart.height - chart.inset.bottom) {
                closestXPoint = chart.closestXPoint(mouseX);
              }
            }
            closestXPoint = closestXPoint || chart.closestXPoint(chart.axes.x.range[1]);
            if (closestXPoint) {
              let summaryClone = templates.summary.content.cloneNode(true).firstElementChild;
              summaryClone.querySelectorAll("slot").forEach((slot) => {
                let field = slot.getAttribute("field");
                if (field) {
                  let format = slot.hasAttribute("format") ? JSON.parse(slot.getAttribute("format")) : {};
                  format = { ...format, timeZone: "UTC" };
                  let value2 = slot.hasAttribute("fallback") && event === null ? slot.getAttribute("fallback") : closestXPoint.datum[field];
                  if (isNumeric(value2)) {
                    value2 = Number(value2).toLocaleString(getLocale(), format);
                  } else if (isDateish2(value2)) {
                    value2 = new Date(value2).toLocaleString(getLocale(), format);
                  }
                  slot.textContent = value2;
                }
              });
              summary.innerHTML = summaryClone.innerHTML;
            }
          };
          updateSummary(null);
        }
        svg.appendChild(overlay);
        svg.querySelectorAll("[data-grid-line-group]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-axis-line]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-zero-line]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-area]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-line]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-cursor]").forEach((i) => overlay.before(i));
        svg.querySelectorAll("[data-point-group]").forEach((i) => overlay.before(i));
        if (checkOverflow) {
          let overflow = getSvgOverflow(svg);
          chart.updateDimensions({ width: chart.width, height: chart.height }, {
            left: gutter.left + overflow.left,
            right: gutter.right + overflow.right,
            top: gutter.top + overflow.top,
            bottom: gutter.bottom + overflow.bottom
          });
          redraw(false);
        }
      };
      this._observable.subscribe("resize", () => {
        chart.updateDimensions({
          width: svg.parentElement.getBoundingClientRect().width,
          height: svg.parentElement.getBoundingClientRect().height
        }, {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        });
        redraw();
      });
      this._observable.subscribe("data", () => {
        chart.updateData(this._data);
        redraw();
      });
      new ResizeObserver(() => {
        this._observable.notify("resize");
      }).observe(this);
    }
  };
  customElements.define("ui-chart", UIChart);
  function discoverXandYKeys(svg) {
    let xKey = null;
    let yKeys = [];
    svg.querySelectorAll('template[name="line"], template[name="area"], template[name="point"]').forEach((template) => {
      yKeys.push(template.getAttribute("field") || "value");
    });
    svg.querySelectorAll('template[name="axis"][axis="x"]').forEach((template) => {
      xKey = template.getAttribute("field") || "index";
    });
    yKeys = Array.from(new Set(yKeys));
    if (xKey === null) xKey = "index";
    if (yKeys.length === 0) yKeys = ["value"];
    return [xKey, yKeys];
  }
  function hydrateSvgTemplate(template) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("version", "1.1");
    svg.innerHTML = template.innerHTML;
    return svg.firstElementChild;
  }
  function handleTickOverflow(tickLabelGroupEl, axis) {
    if (!hasOverlappingTicks(tickLabelGroupEl, axis)) return;
    if (axis.axis === "x" && axis.type === "categorical") {
      rotateTickLabels(tickLabelGroupEl);
    } else if (axis.axis === "x" && axis.type === "time") {
      let undo = hideEveryOtherTickLabel(tickLabelGroupEl);
      if (!hasOverlappingTicks(tickLabelGroupEl, axis)) return;
      undo();
      onlyShowFirstAndLastTickLabel(tickLabelGroupEl);
    }
  }
  function hasOverlappingTicks(tickLabelGroupEl, axis) {
    let children = Array.from(tickLabelGroupEl.children);
    children = children.filter((child) => {
      return child.style.display != "none";
    });
    for (let i = 0; i < children.length; i++) {
      let tickLabelEl = children[i];
      let nextTickLabelEl = children[i + 1];
      if (!nextTickLabelEl) break;
      let tickLabelRect = tickLabelEl.getBoundingClientRect();
      let nextTickLabelRect = nextTickLabelEl.getBoundingClientRect();
      let overlapMargin = 20;
      if (axis.axis === "y") {
        if (tickLabelRect.bottom + overlapMargin < nextTickLabelRect.top) {
          return true;
        }
      } else {
        if (tickLabelRect.right + overlapMargin > nextTickLabelRect.left) {
          return true;
        }
      }
    }
    return false;
  }
  function rotateTickLabels(tickLabelGroupEl) {
    let undos = [];
    Array.from(tickLabelGroupEl.children).forEach((child, index) => {
      let textNode = child.matches("text") ? child : child.querySelector("text");
      Array.from(tickLabelGroupEl.children).forEach((child2, index2) => {
        let textNode2 = child2.matches("text") ? child2 : child2.querySelector("text");
        if (textNode2) {
          textNode2.style.transform = "rotate(-45deg)";
          textNode2.style.textAnchor = "end";
          undos.push(() => {
            textNode2.style.transform = null;
            textNode2.style.textAnchor = null;
          });
        }
      });
    });
    return () => undos.forEach((undo) => undo());
  }
  function hideEveryOtherTickLabel(tickLabelGroupEl) {
    let children = Array.from(tickLabelGroupEl.children);
    children.forEach((child, index) => {
      if (index % 2 === 1) child.style.display = "none";
    });
    return () => children.forEach((child, index) => {
      child.style.display = "inline";
    });
  }
  function onlyShowFirstAndLastTickLabel(tickLabelGroupEl) {
    let children = Array.from(tickLabelGroupEl.children);
    children.forEach((child, index) => {
      child.style.display = "none";
    });
    let firstChild = children[0];
    let lastChild = children[children.length - 1];
    let firstTextNode = firstChild.matches("text") ? firstChild : firstChild.querySelector("text");
    let lastTextNode = lastChild.matches("text") ? lastChild : lastChild.querySelector("text");
    firstChild.style.display = "inline";
    firstTextNode.style.textAnchor = "start";
    lastChild.style.display = "inline";
    lastTextNode.style.textAnchor = "end";
    return () => children.forEach((child, index) => {
      child.style.display = "inline";
    });
  }
  function isNumeric(value2) {
    return typeof value2 === "number" || typeof value2 === "string" && !isNaN(Number(value2));
  }
  function isDateish2(value2) {
    return value2 instanceof Date || typeof value2 === "string" && !isNaN(Date.parse(value2));
  }
  function getSvgOverflow(svg) {
    let svgRect = svg.getBoundingClientRect();
    let contentRect = { top: Infinity, right: -Infinity, bottom: -Infinity, left: Infinity };
    Array.from(svg.children).forEach((el) => {
      if (el.hasAttribute("data-overlay")) return;
      if (el.style.display === "none") return;
      let rect = el.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      contentRect.top = Math.min(contentRect.top, rect.top);
      contentRect.right = Math.max(contentRect.right, rect.right);
      contentRect.bottom = Math.max(contentRect.bottom, rect.bottom);
      contentRect.left = Math.min(contentRect.left, rect.left);
    });
    return {
      top: Math.max(0, svgRect.top - contentRect.top),
      right: Math.max(0, contentRect.right - svgRect.right),
      bottom: Math.max(0, contentRect.bottom - svgRect.bottom),
      left: Math.max(0, svgRect.left - contentRect.left)
    };
  }

  // js/modal.js
  var UIModal = class extends UIElement {
    boot() {
      this._controllable = new Controllable(this, { disabled: this.hasAttribute("disabled") });
      let button = this.button();
      let dialog = this.dialog();
      if (!dialog) return;
      dialog._dialogable = new Dialogable(dialog, {
        clickOutside: !this.hasAttribute("disable-click-outside")
      });
      this._controllable.initial((initial) => initial && dialog._dialogable.show());
      this._controllable.getter(() => dialog._dialogable.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        dialog._dialogable.setState(value2);
      }));
      dialog._dialogable.onChange(detangled(() => {
        this._controllable.dispatch();
      }));
      let refresh = () => {
        if (dialog._dialogable.getState()) {
          setAttribute2(this, "data-open", "");
          button?.setAttribute("data-open", "");
          setAttribute2(dialog, "data-open", "");
        } else {
          removeAttribute(this, "data-open");
          button?.removeAttribute("data-open");
          removeAttribute(dialog, "data-open");
        }
      };
      dialog._dialogable.onChange(() => refresh());
      refresh();
      let { lock, unlock } = lockScroll();
      dialog._dialogable.onChange(() => {
        dialog._dialogable.getState() ? lock() : unlock();
      });
      button && on(button, "click", (e) => {
        dialog._dialogable.show();
      });
    }
    button() {
      let button = this.querySelector("button");
      let dialog = this.dialog();
      if (dialog?.contains(button)) return;
      return button;
    }
    dialog() {
      return this.querySelector("dialog");
    }
    showModal() {
      let dialog = this.dialog();
      if (!dialog) return;
      dialog.showModal();
    }
  };
  var UIClose = class extends UIElement {
    mount() {
      let button = this.querySelector("button");
      on(button, "click", () => {
        let dialogable = closest(this, (el) => !!el._dialogable)?._dialogable;
        dialogable?.hide();
      });
    }
  };
  inject(({ css }) => css`dialog, ::backdrop { margin: auto; }`);
  element("modal", UIModal);
  element("close", UIClose);

  // js/toast.js
  var UIToast = class extends UIElement {
    mount() {
      setAttribute2(this, "role", "status");
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideToast();
        }
      });
    }
    showToast(options = {}) {
      let existingToast = this.template().nextElementSibling;
      if (existingToast) existingToast.destroyToast();
      let duration = Number(options.duration === void 0 ? 5e3 : options.duration);
      let slots = options.slots || {};
      let dataset = options.dataset || {};
      let templateEl = this.querySelector("template");
      if (!templateEl) {
        return console.warn("ui-toast: no template element found", this);
      }
      let template = templateEl.content.cloneNode(true).firstElementChild;
      template.setAttribute("aria-atomic", "true");
      Object.entries(slots).forEach(([key, value2]) => {
        if ([null, void 0, false].includes(value2)) return;
        template.querySelectorAll(`slot[name="${key}"]`).forEach((i) => {
          i.replaceWith(document.createTextNode(value2));
        });
      });
      Object.entries(dataset).forEach(([key, value2]) => {
        template.dataset[key] = value2;
      });
      template.querySelectorAll("slot").forEach((slot) => slot.remove());
      let show = () => {
        template.showPopover();
      };
      let hide2 = () => {
        template._hiding = true;
        template.hidePopover();
        if (template.getAnimations().length) {
          template.addEventListener("transitionend", () => {
            template.remove();
          }, { once: true });
        } else {
          template.remove();
        }
      };
      this.appendChild(template);
      show();
      template.hideToast = hide2;
      let hideTimeout = duration !== 0 && setTimeout(() => {
        hide2();
      }, duration);
      template.destroyToast = () => {
        hideTimeout && clearTimeout(hideTimeout);
        template.remove();
      };
    }
    hideToast() {
      let toast = this.template().nextElementSibling;
      toast && toast.destroyToast();
    }
    template() {
      return this.querySelector("template");
    }
  };
  element("toast", UIToast);

  // js/radio.js
  var UIRadioGroup = class extends UIControl {
    boot() {
      this._selectable = new SelectableGroup(this);
      this._controllable = new Controllable(this, { disabled: this._disabled });
      this._focusable = new FocusableGroup(this, { wrap: true });
      this._controllable.initial((initial) => initial && this._selectable.setState(initial));
      this._controllable.getter(() => this._selectable.getState());
      this._detangled = detangle();
      this._controllable.setter(this._detangled((value2) => {
        this._selectable.setState(value2);
      }));
      this._selectable.onChange(this._detangled(() => {
        this._controllable.dispatch();
      }));
      on(this, "keydown", (e) => {
        if (["ArrowDown", "ArrowRight"].includes(e.key)) {
          this._focusable.focusNext();
          e.preventDefault();
          e.stopPropagation();
        } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
          this._focusable.focusPrev();
          e.preventDefault();
          e.stopPropagation();
        }
      });
      setAttribute2(this, "role", "radiogroup");
    }
  };
  var UIRadio = class extends UIControl {
    boot() {
      let button = this;
      this._disableable = new Disableable(this);
      this._selectable = new Selectable(button, {
        value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
        label: this.hasAttribute("label") ? this.getAttribute("label") : null,
        selectedInitially: this.hasAttribute("checked"),
        dataAttr: "data-checked",
        ariaAttr: "aria-checked"
      });
      this.value = this._selectable.getValue();
      this._selectable.onChange(() => {
        if (this._selectable.isSelected()) this._focusable.focus(false);
      });
      this._disableable.onChange((disabled) => {
        if (disabled) {
          this._focusable.untabbable();
        } else {
          this._selectable.isSelected() && this._focusable.tabbable();
        }
      });
      setAttribute2(button, "role", "radio");
      this._focusable = new Focusable(button, { disableable: this._disableable, tabbableAttr: "data-active" });
      on(button, "click", this._disableable.disabled((e) => {
        e.preventDefault();
        e.stopPropagation();
      }), { capture: true });
      on(button, "click", this._disableable.enabled((e) => {
        this._selectable.press();
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === "Enter") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keydown", this._disableable.enabled((e) => {
        if (e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      on(button, "keyup", this._disableable.enabled((e) => {
        if (e.key === " ") {
          this._selectable.press();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
      respondToLabelClick3(button);
      on(button, "focus", (e) => {
        isUsingKeyboard() && this._selectable.select();
      });
    }
    get checked() {
      return this._selectable.isSelected();
    }
    set checked(value2) {
      let detangled = this.closest("ui-radio-group")?._detangled || (() => {
      });
      detangled(() => {
        value2 && this._selectable.select();
      })();
    }
  };
  function respondToLabelClick3(el) {
    el.closest("label")?.addEventListener("click", (e) => {
      if (!el.contains(e.target)) {
        el.click();
      }
    });
  }
  inject(({ css }) => css`ui-radio-group { display: block; }`);
  inject(({ css }) => css`ui-radio { display: inline-block; user-select: none; }`);
  element("radio-group", UIRadioGroup);
  element("radio", UIRadio);

  // js/tabs.js
  var UITabGroup = class _UITabGroup extends UIElement {
    boot() {
      this._disabled = this.hasAttribute("disabled");
    }
    mount() {
      this.walkPanels((el) => initializePanel(el));
      new MutationObserver((mutations) => {
        this.walkPanels((el) => initializePanel(el));
      }).observe(this, { childList: true });
    }
    showPanel(name) {
      this.walkPanels((el) => {
        if (el.getAttribute("name") === name) el.show();
        else el.hide();
      });
    }
    getPanel(name) {
      return this.walkPanels((el, bail) => {
        if (el.getAttribute("name") === name) {
          bail(el);
        }
      });
    }
    walkPanels(callback) {
      let bailed = false;
      let bailedReturn;
      for (let child of this.children) {
        if (child instanceof _UITabGroup) continue;
        if (child instanceof UITabs) continue;
        callback(child, (forward) => {
          bailed = true;
          bailedReturn = forward;
        });
        if (bailed) break;
      }
      return bailedReturn;
    }
  };
  var UITabs = class _UITabs extends UIControl {
    boot() {
      this._focusable = new FocusableGroup(this, { wrap: true });
      this._selectableGroup = new SelectableGroup(this);
      this._controllable = new Controllable(this, { disabled: this._disabled });
      this._controllable.initial((initial) => initial && this._selectableGroup.setState(initial));
      this._controllable.getter(() => this._selectableGroup.getState());
      let detangled = detangle();
      this._controllable.setter(detangled((value2) => {
        this._selectableGroup.setState(value2);
      }));
      this._selectableGroup.onChange(detangled(() => {
        this._controllable.dispatch();
      }));
      on(this, "keydown", (e) => {
        if (["ArrowDown", "ArrowRight"].includes(e.key)) {
          this._focusable.focusNext();
          e.preventDefault();
          e.stopPropagation();
        } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
          this._focusable.focusPrev();
          e.preventDefault();
          e.stopPropagation();
        }
      });
      setAttribute2(this, "role", "tablist");
    }
    mount() {
      this.initializeTabs();
      this._focusable.ensureTabbable();
      if (!this._selectableGroup.getState()) {
        this._selectableGroup.selectFirst();
      }
      new MutationObserver((mutations) => {
        this.initializeTabs();
        let selected = this._selectableGroup.selected();
        selected.el.closest("ui-tab-group").showPanel(selected.value);
      }).observe(this, { childList: true });
    }
    initializeTabs() {
      this.walker().each((el) => {
        if (el._initialized) return;
        if (el._disableable) return;
        if (el.hasAttribute("action")) return;
        initializeTab(el);
        el._initialized = true;
      });
    }
    walker() {
      return walker(this, (el, { skip, reject }) => {
        if (el instanceof UITabGroup) return reject();
        if (el instanceof _UITabs) return reject();
        if (!["a", "button"].includes(el.localName)) return skip();
      });
    }
  };
  function initializeTab(el) {
    el._disableable = new Disableable(el);
    el._disabled = el.hasAttribute("disabled");
    let link = el.matches("a") ? el : null;
    let target = link || el;
    if (el._disabled) {
      setAttribute2(target, "disabled", "");
      setAttribute2(target, "aria-disabled", "true");
    }
    let id = assignId(target, "tab");
    setAttribute2(target, "role", "tab");
    if (el._disabled) return;
    target._focusable = new Focusable(target, { disableable: el._disableable, tabbableAttr: "data-active" });
    if (!link) {
      let panel = el.getAttribute("name");
      el._selectable = new Selectable(el, {
        value: panel || Math.random().toString(36).substring(2, 10),
        label: el.hasAttribute("label") ? el.getAttribute("label") : el.textContent.trim(),
        selectedInitially: el.hasAttribute("selected"),
        toggleable: false
      });
      on(el, "click", () => el._selectable.press());
      el._selectable.onChange(() => {
        let panelEl = el.closest("ui-tab-group")?.getPanel(panel);
        el._selectable.getState() ? panelEl?.show() : panelEl?.hide();
        if (el._selectable.getState()) {
          el._focusable.focus(false);
        }
      });
      if (!el.closest("ui-tab-group")?.hasAttribute("manual")) {
        on(el, "focus", () => el._selectable.select());
      }
      queueMicrotask(() => {
        let container = el.closest("ui-tab-group");
        if (!container) return;
        let panelEl = container.getPanel(panel);
        if (!panelEl) throw new Error("Could not find panel...");
        setAttribute2(el, "aria-controls", panelEl.id);
        setAttribute2(panelEl, "aria-labelledby", el.id);
      });
    }
  }
  function initializePanel(el) {
    if (el._initialized) return;
    assignId(el, "tab-panel");
    setAttribute2(el, "role", "tabpanel");
    el.hasAttribute("tabindex") || setAttribute2(el, "tabindex", "-1");
    el.show = () => {
      setAttribute2(el, "data-selected", "");
      setAttribute2(el, "tabindex", "0");
    };
    el.hide = () => {
      removeAttribute(el, "data-selected");
      setAttribute2(el, "tabindex", "-1");
    };
    el._initialized = true;
  }
  inject(({ css }) => css`ui-tab-group, ui-tabs { display: block; cursor: default; }`);
  element("tab-group", UITabGroup);
  element("tabs", UITabs);

  // js/store.js
  document.addEventListener("alpine:init", () => {
    let applyAppearance = window.Flux?.applyAppearance;
    if (!applyAppearance) {
      applyAppearance = () => {
        window.Flux.appearance = null;
        window.localStorage.removeItem("flux.appearance");
      };
    }
    let flux = Alpine.reactive({
      toast(...params) {
        let detail = { slots: {}, dataset: {} };
        if (typeof params[0] === "string") {
          detail.slots.text = params.shift();
        }
        if (typeof params[0] === "string") {
          detail.slots.heading = detail.slots.text;
          detail.slots.text = params.shift();
        }
        let options = params.shift() || {};
        if (options.text) detail.slots.text = options.text;
        if (options.heading) detail.slots.heading = options.heading;
        if (options.variant) detail.dataset.variant = options.variant;
        if (options.position) detail.dataset.position = options.position;
        if (options.duration !== void 0) detail.duration = options.duration;
        document.dispatchEvent(new CustomEvent("toast-show", { detail }));
      },
      modal(name) {
        return {
          show() {
            document.dispatchEvent(new CustomEvent("modal-show", { detail: { name } }));
          },
          close() {
            document.dispatchEvent(new CustomEvent("modal-close", { detail: { name } }));
          }
        };
      },
      modals() {
        return { close() {
          document.dispatchEvent(new CustomEvent("modal-close", { detail: {} }));
        } };
      },
      appearance: window.localStorage.getItem("flux.appearance") || "system",
      systemAppearanceChanged: 1,
      // A counter to trigger reactivity when the system appearance changes...
      get dark() {
        JSON.stringify(flux.systemAppearanceChanged);
        if (flux.appearance === "system") {
          let media2 = window.matchMedia("(prefers-color-scheme: dark)");
          return media2.matches;
        } else {
          return flux.appearance === "dark";
        }
      },
      set dark(value2) {
        let current = this.dark;
        if (value2 === current) return;
        if (value2) {
          flux.appearance = "dark";
        } else {
          flux.appearance = "light";
        }
      }
    });
    window.Flux = flux;
    Alpine.magic("flux", () => flux);
    Alpine.effect(() => {
      applyAppearance(flux.appearance);
    });
    document.addEventListener("livewire:navigated", () => {
      applyAppearance(flux.appearance);
    });
    let media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", () => {
      flux.systemAppearanceChanged++;
      applyAppearance(flux.appearance);
    });
  });

  // js/index.js
  if (!isSupported2() && !isPolyfilled()) {
    apply2();
  }
})();
