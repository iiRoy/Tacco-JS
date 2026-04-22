const ContentDisplaySystem = (function() {
    "use strict";

    // --- Internal State Management ---
    const _displayElementData = new WeakMap(); // Stores configuration and runtime state for each viewer element
    const _activeListeners = new WeakMap(); // Stores references to event listeners for proper cleanup
    let _currentlyFocusedElement = null; // To restore focus after closing

    // --- Constants and Defaults ---
    const DEFAULT_SETTINGS = {
        hasOverlay: true,
        allowKeyboardDismiss: true,
        initialDisplay: true,
        overlayStatic: false // 'static' in original, boolean here for simplicity
    };
    const ANIMATION_DURATION_MILLIS = 300; // General animation duration
    const OVERLAY_ANIMATION_DURATION_MILLIS = 150; // Overlay animation duration
    const VIEWER_CLASS_IDENTIFIER = 'content-viewer';
    const VIEWER_ACTIVE_CLASS = 'is-active';
    const VIEWER_DIALOG_ELEMENT_CLASS = 'viewer-dialog';
    const VIEWER_CONTENT_ELEMENT_CLASS = 'viewer-content';
    const OVERLAY_ELEMENT_CLASS = 'content-overlay';
    const BODY_ACTIVE_CLASS_INDICATOR = 'contentviewer-active';

    // --- Utility Functions ---

    /** Dispatches a custom event from an element. */
    function _emitCustomEvent(targetElement, eventName, detail = {}) {
        const customEvent = new CustomEvent(`cv:${eventName}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });
        targetElement.dispatchEvent(customEvent);
        return customEvent.defaultPrevented;
    }

    /** Gets computed padding values for an element. */
    function _fetchComputedPadding(element) {
        const style = window.getComputedStyle(element);
        return {
            top: parseInt(style.paddingTop, 10),
            bottom: parseInt(style.paddingBottom, 10),
            left: parseInt(style.paddingLeft, 10),
            right: parseInt(style.paddingRight, 10)
        };
    }

    /** Waits for a CSS transition to end on an element. */
    function _awaitTransitionEnd(element, callback, durationMs) {
        const transitionProperty = window.getComputedStyle(element).transitionProperty;
        if (!transitionProperty || transitionProperty === 'none') {
            callback();
            return;
        }

        let called = false;
        const handler = (event) => {
            if (event.target === element && !called) {
                called = true;
                element.removeEventListener('transitionend', handler);
                callback();
            }
        };

        element.addEventListener('transitionend', handler);
        setTimeout(() => { // Fallback for transitionend not firing
            if (!called) {
                called = true;
                element.removeEventListener('transitionend', handler);
                callback();
            }
        }, durationMs + 50); // Add a small buffer
    }

    /** Forces a DOM reflow. */
    function _forceDomReflow(element) {
        return element.offsetWidth;
    }

    /** Handles focus trapping within the viewer. */
    function _constrainFocus(viewerElement) {
        const focusinHandler = (e) => {
            if (viewerElement !== e.target && !viewerElement.contains(e.target)) {
                viewerElement.focus();
            }
        };
        document.addEventListener('focusin', focusinHandler);
        _activeListeners.get(viewerElement).set('focusin', focusinHandler);
    }

    /** Handles keyboard input, primarily Escape key for dismissal. */
    function _manageKeyInput(viewerElement) {
        const { config, isVisible } = _displayElementData.get(viewerElement);
        const keyupHandler = _activeListeners.get(viewerElement).get('keyup');

        if (isVisible && config.allowKeyboardDismiss) {
            if (!keyupHandler) {
                const newKeyupHandler = (e) => {
                    if (e.key === 'Escape') {
                        _concealViewer(viewerElement);
                    }
                };
                document.addEventListener('keyup', newKeyupHandler);
                _activeListeners.get(viewerElement).set('keyup', newKeyupHandler);
            }
        } else if (!isVisible && keyupHandler) {
            document.removeEventListener('keyup', keyupHandler);
            _activeListeners.get(viewerElement).delete('keyup');
        }
    }

    /** Creates and manages the overlay element. */
    function _handleOverlay(viewerElement, completionCallback) {
        const { config, isVisible, overlayElement } = _displayElementData.get(viewerElement);
        const hasFadeClass = viewerElement.classList.contains('fade');
        const shouldAnimate = hasFadeClass;

        if (isVisible && config.hasOverlay) {
            let currentOverlay = overlayElement;
            if (!currentOverlay) {
                currentOverlay = document.createElement('div');
                currentOverlay.className = OVERLAY_ELEMENT_CLASS + (hasFadeClass ? ' fade' : '');
                document.body.appendChild(currentOverlay);
                _displayElementData.get(viewerElement).overlayElement = currentOverlay;

                currentOverlay.addEventListener('click', (e) => {
                    if (e.target !== e.currentTarget) return;
                    if (config.overlayStatic) {
                        viewerElement.focus();
                    } else {
                        _concealViewer(viewerElement);
                    }
                });
            }

            if (shouldAnimate) _forceDomReflow(currentOverlay);
            currentOverlay.classList.add(VIEWER_ACTIVE_CLASS);

            if (completionCallback) {
                shouldAnimate ?
                    _awaitTransitionEnd(currentOverlay, completionCallback, OVERLAY_ANIMATION_DURATION_MILLIS) :
                    completionCallback();
            }

        } else if (!isVisible && overlayElement) {
            overlayElement.classList.remove(VIEWER_ACTIVE_CLASS);
            if (completionCallback) {
                shouldAnimate ?
                    _awaitTransitionEnd(overlayElement, () => {
                        overlayElement.remove();
                        _displayElementData.get(viewerElement).overlayElement = null;
                        completionCallback();
                    }, OVERLAY_ANIMATION_DURATION_MILLIS) :
                    (() => {
                        overlayElement.remove();
                        _displayElementData.get(viewerElement).overlayElement = null;
                        completionCallback();
                    })();
            }
        } else if (completionCallback) {
            completionCallback();
        }
    }

    /** Loads remote content into the viewer element. */
    function _loadRemoteContent(viewerElement, url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                viewerElement.innerHTML = html;
            })
            .catch(error => {
                console.error("Failed to load remote content:", error);
            });
    }

    /** Adjusts the size of the viewer content, especially for images. */
    function _adjustContentDimensions(viewerElement, completionCallback) {
        const viewerContent = viewerElement.querySelector(`.${VIEWER_CONTENT_ELEMENT_CLASS}`);
        const viewerDialog = viewerElement.querySelector(`.${VIEWER_DIALOG_ELEMENT_CLASS}`);
        if (!viewerContent || !viewerDialog) {
            completionCallback();
            return;
        }

        const imageElement = viewerContent.querySelector('img:first-child');
        if (!imageElement) {
            completionCallback();
            return;
        }

        const preloader = new Image();
        preloader.onload = () => {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const padding = _fetchComputedPadding(viewerContent);

            let naturalWidth = preloader.naturalWidth || preloader.width;
            let naturalHeight = preloader.naturalHeight || preloader.height;

            const availableWidth = windowWidth - padding.left - padding.right;
            const availableHeight = windowHeight - padding.top - padding.bottom;

            let currentWidth = naturalWidth;
            let currentHeight = naturalHeight;

            if (currentWidth > availableWidth) {
                currentHeight = (availableWidth / currentWidth) * currentHeight;
                currentWidth = availableWidth;
            }

            if (currentHeight > availableHeight) {
                currentWidth = (availableHeight / currentHeight) * currentWidth;
                currentHeight = availableHeight;
            }

            viewerDialog.style.position = 'fixed';
            viewerDialog.style.width = `${currentWidth + padding.left + padding.right}px`;
            viewerDialog.style.height = `${currentHeight + padding.top + padding.bottom}px`;
            viewerDialog.style.top = `${(windowHeight / 2) - ((currentHeight + padding.top + padding.bottom) / 2)}px`;
            viewerDialog.style.left = '50%';
            viewerDialog.style.marginLeft = `${-1 * (currentWidth + padding.left + padding.right) / 2}px`;

            viewerContent.style.width = `${currentWidth + padding.left + padding.right}px`;
            viewerContent.style.height = `${currentHeight + padding.top + padding.bottom}px`;

            imageElement.style.width = `${currentWidth}px`;
            imageElement.style.height = `${currentHeight}px`;

            completionCallback();
        };
        preloader.onerror = () => {
            console.error("Failed to load image for sizing:", imageElement.src);
            completionCallback();
        };
        preloader.src = imageElement.src;
    }

    /** Hides the content viewer and cleans up. */
    function _concealContentAndCleanup(viewerElement, shouldSlide) {
        viewerElement.style.display = 'none';
        _handleOverlay(viewerElement, () => {
            if (!shouldSlide) {
                _emitCustomEvent(viewerElement, 'concealed');
            }
        });
    }

    // --- Public API Functions ---

    /**
     * Initializes a content viewer element with given options.
     * @param {HTMLElement} element - The DOM element for the content viewer.
     * @param {Object} options - Configuration options.
     */
    function setupViewer(element, options = {}) {
        if (!element || _displayElementData.has(element)) {
            return;
        }

        const dataOptions = {};
        for (const key in DEFAULT_SETTINGS) {
            const dataAttr = element.dataset[key.toLowerCase()];
            if (dataAttr !== undefined) {
                dataOptions[key] = (dataAttr === 'true' ? true : (dataAttr === 'false' ? false : dataAttr));
            }
        }

        const mergedConfig = { ...DEFAULT_SETTINGS, ...dataOptions, ...options };

        _displayElementData.set(element, {
            config: mergedConfig,
            isVisible: false,
            overlayElement: null
        });
        _activeListeners.set(element, new Map());
        return element;
    }

    /**
     * Displays the content viewer.
     * @param {HTMLElement} viewerElement - The content viewer element to display.
     * @param {HTMLElement} [triggerElement=null] - The element that triggered the display.
     */
    function presentViewer(viewerElement, triggerElement = null) {
        if (!_displayElementData.has(viewerElement)) {
            console.warn("Viewer not initialized:", viewerElement);
            return;
        }

        const data = _displayElementData.get(viewerElement);
        if (data.isVisible) return;

        const eventPrevented = _emitCustomEvent(viewerElement, 'present', { triggerElement: triggerElement });
        if (eventPrevented) return;

        data.isVisible = true;
        _currentlyFocusedElement = document.activeElement;

        _manageKeyInput(viewerElement);
        _constrainFocus(viewerElement);

        const dismissClickHandler = (e) => {
            const dismissButton = e.target.closest('[data-action="dismiss-viewer"]');
            if (dismissButton) {
                e.preventDefault();
                _concealViewer(viewerElement);
            }
        };
        viewerElement.addEventListener('click', dismissClickHandler);
        _activeListeners.get(viewerElement).set('dismissClick', dismissClickHandler);


        if (data.config.remote) {
            _loadRemoteContent(viewerElement, data.config.remote);
        }

        _adjustContentDimensions(viewerElement, () => {
            _handleOverlay(viewerElement, () => {
                if (!document.body.contains(viewerElement)) {
                    document.body.appendChild(viewerElement);
                }

                viewerElement.style.display = 'block';
                _forceDomReflow(viewerElement);

                viewerElement.classList.add(VIEWER_ACTIVE_CLASS);
                viewerElement.setAttribute('aria-hidden', 'false');

                viewerElement.focus();

                const hasFadeClass = viewerElement.classList.contains('fade');
                const dialogElement = viewerElement.querySelector(`.${VIEWER_DIALOG_ELEMENT_CLASS}`);

                if (hasFadeClass && dialogElement) {
                    _awaitTransitionEnd(dialogElement, () => {
                        _emitCustomEvent(viewerElement, 'presented', { triggerElement: triggerElement });
                    }, ANIMATION_DURATION_MILLIS);
                } else {
                    _emitCustomEvent(viewerElement, 'presented', { triggerElement: triggerElement });
                }
            });
        });
    }

    /**
     * Hides the content viewer.
     * @param {HTMLElement} viewerElement - The content viewer element to hide.
     * @param {Event} [originalEvent=null] - The event that triggered the hide (e.g., click).
     * @param {boolean} [isSliding=false] - True if hiding as part of a slide animation.
     */
    function _concealViewer(viewerElement, originalEvent = null, isSliding = false) {
        if (originalEvent) originalEvent.preventDefault();

        if (!_displayElementData.has(viewerElement)) {
            console.warn("Viewer not initialized:", viewerElement);
            return;
        }

        const data = _displayElementData.get(viewerElement);
        if (!data.isVisible) return;

        const eventPrevented = _emitCustomEvent(viewerElement, 'conceal');
        if (eventPrevented) return;

        data.isVisible = false;
        _manageKeyInput(viewerElement);

        const focusinHandler = _activeListeners.get(viewerElement).get('focusin');
        if (focusinHandler) {
            document.removeEventListener('focusin', focusinHandler);
            _activeListeners.get(viewerElement).delete('focusin');
        }

        const dismissClickHandler = _activeListeners.get(viewerElement).get('dismissClick');
        if (dismissClickHandler) {
            viewerElement.removeEventListener('click', dismissClickHandler);
            _activeListeners.get(viewerElement).delete('dismissClick');
        }

        viewerElement.classList.remove(VIEWER_ACTIVE_CLASS);
        viewerElement.setAttribute('aria-hidden', 'true');

        const hasFadeClass = viewerElement.classList.contains('fade');
        if (hasFadeClass) {
            _awaitTransitionEnd(viewerElement, () => {
                _concealContentAndCleanup(viewerElement, isSliding);
            }, ANIMATION_DURATION_MILLIS);
        } else {
            _concealContentAndCleanup(viewerElement, isSliding);
        }

        if (_currentlyFocusedElement && _currentlyFocusedElement.focus) {
            _currentlyFocusedElement.focus();
            _currentlyFocusedElement = null;
        }
    }

    /**
     * Navigates to the next or previous content viewer.
     * @param {HTMLElement} currentViewerElement - The currently active viewer.
     * @param {'next'|'previous'} direction - The direction to navigate.
     */
    function navigateContent(currentViewerElement, direction) {
        _concealViewer(currentViewerElement, null, true);

        const allViewers = Array.from(document.querySelectorAll(`.${VIEWER_CLASS_IDENTIFIER}`));
        const currentIndex = allViewers.indexOf(currentViewerElement);
        let nextIndex = -1;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % allViewers.length;
        } else if (direction === 'previous') {
            nextIndex = (currentIndex - 1 + allViewers.length) % allViewers.length;
        }

        const targetViewerElement = allViewers[nextIndex];

        if (targetViewerElement && targetViewerElement !== currentViewerElement) {
            presentViewer(targetViewerElement);
        } else {
            _emitCustomEvent(currentViewerElement, 'concealed');
        }
    }

    // --- Data API Initialization ---

    /** Handles clicks on elements that trigger content viewers. */
    function _handleTriggerClick(event) {
        const trigger = event.target.closest('[data-action="view-content"]');
        if (!trigger) return;

        event.preventDefault();

        const targetSelector = trigger.dataset.target || trigger.getAttribute('href');
        let viewerElement;
        let remoteUrl = null;

        if (targetSelector && targetSelector.startsWith('#')) {
            viewerElement = document.querySelector(targetSelector);
        } else if (targetSelector) {
            viewerElement = document.createElement('div');
            viewerElement.className = VIEWER_CLASS_IDENTIFIER + ' fade';
            viewerElement.setAttribute('tabindex', '-1');
            viewerElement.setAttribute('role', 'dialog');
            viewerElement.setAttribute('aria-hidden', 'true');
            viewerElement.innerHTML = `<div class="${VIEWER_DIALOG_ELEMENT_CLASS}"><div class="${VIEWER_CONTENT_ELEMENT_CLASS}"></div></div>`;
            remoteUrl = targetSelector;
        } else {
            viewerElement = trigger.closest(`.${VIEWER_CLASS_IDENTIFIER}`) || trigger;
        }

        if (!viewerElement) {
            console.warn("Could not find or create viewer element for trigger:", trigger);
            return;
        }

        let viewerOptions = {};
        if (remoteUrl) {
            viewerOptions.remote = remoteUrl;
        }

        const triggerDataOptions = {};
        for (const key in DEFAULT_SETTINGS) {
            const dataAttr = trigger.dataset[key.toLowerCase()];
            if (dataAttr !== undefined) {
                triggerDataOptions[key] = (dataAttr === 'true' ? true : (dataAttr === 'false' ? false : dataAttr));
            }
        }
        viewerOptions = { ...viewerOptions, ...triggerDataOptions };

        if (!_displayElementData.has(viewerElement)) {
            setupViewer(viewerElement, viewerOptions);
        } else {
            const currentConfig = _displayElementData.get(viewerElement).config;
            _displayElementData.get(viewerElement).config = { ...currentConfig, ...viewerOptions };
        }

        presentViewer(viewerElement, trigger);
    }

    /** Handles clicks on navigation controls within content viewers. */
    function _handleControlClick(event) {
        const control = event.target.closest('.viewer-control');
        if (!control) return;

        event.preventDefault();

        const parentViewer = control.closest(`.${VIEWER_CLASS_IDENTIFIER}`);
        if (!parentViewer) {
            console.warn("Viewer control found outside of a viewer:", control);
            return;
        }

        const direction = control.dataset.direction;
        if (direction === 'next' || direction === 'previous') {
            navigateContent(parentViewer, direction);
        }
    }

    // --- Document Ready / Event Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', _handleTriggerClick);
        document.body.addEventListener('click', _handleControlClick);

        document.body.addEventListener('cv:present', (event) => {
            if (event.target.classList.contains(VIEWER_CLASS_IDENTIFIER)) {
                document.body.classList.add(BODY_ACTIVE_CLASS_INDICATOR);
            }
        });
        document.body.addEventListener('cv:concealed', (event) => {
            if (event.target.classList.contains(VIEWER_CLASS_IDENTIFIER)) {
                const anyViewerActive = Array.from(document.querySelectorAll(`.${VIEWER_CLASS_IDENTIFIER}`)).some(
                    v => _displayElementData.has(v) && _displayElementData.get(v).isVisible
                );
                if (!anyViewerActive) {
                    document.body.classList.remove(BODY_ACTIVE_CLASS_INDICATOR);
                }
            }
        });
    });

    // --- Public API ---
    return {
        initialize: setupViewer,
        show: presentViewer,
        hide: (element) => _concealViewer(element),
        slide: navigateContent,
        noCollision: function() {
            return this;
        }
    };
})();

window.ContentDisplay = ContentDisplaySystem;