class MenuNavigatore {
    static _coreIndicators = {
        breadCrumbMark: 'path-active-mark', // Renamed from bcClass
        menuActiveMark: 'navigation-enabled', // Renamed from menuClass
        linkWithSubmenuMark: 'has-dropdown-link', // Renamed from anchorClass
        arrowStyleMark: 'dropdown-arrows' // Renamed from menuArrowClass
    };

    static _browserFeatures = (function() {
        const userAgent = navigator.userAgent;
        const style = document.documentElement.style;
        return {
            isAppleTouchDevice: /iPhone|iPad|iPod/i.test(userAgent),
            isMicrosoftPhone: ('behavior' in style && 'fill' in style && /iemobile/i.test(userAgent)),
            supportsUnprefixedPointerEvents: (!!window.PointerEvent)
        };
    })();

    static _defaultConfiguration = {
        childMenuSelector: 'ul,.sf-mega', // Renamed from popUpSelector
        activeItemClass: 'current-hover', // Renamed from hoverClass
        initialPathClass: 'ancestor-path', // Renamed from pathClass
        pathDepth: 1, // Renamed from pathLevels
        hideDelayMs: 800, // Renamed from delay
        showAnimationOptions: { type: 'opacity', duration: 'normal' }, // Renamed from animation
        hideAnimationOptions: { type: 'opacity', duration: 'fast' }, // Renamed from animationOut
        showTransitionSpeed: 'normal', // Renamed from speed
        hideTransitionSpeed: 'fast', // Renamed from speedOut
        applyArrowStyles: true, // Renamed from cssArrows
        ignoreHoverIntent: false, // Renamed from disableHI (simplified to direct mouse events)
        onInitialize: () => {}, // Renamed from onInit
        onBeforeDisplay: () => {}, // Renamed from onBeforeShow
        onDisplay: () => {}, // Renamed from onShow
        onBeforeConceal: () => {}, // Renamed from onBeforeHide
        onConceal: () => {}, // Renamed from onHide
        onIdle: () => {}, // Renamed from onIdle
        onDeactivate: () => {} // Renamed from onDestroy
    };

    static _menuInstances = new WeakMap(); // Stores instance data for each menu element

    constructor(menuElement, options = {}) {
        if (!menuElement || !(menuElement instanceof Element)) {
            throw new Error("A valid DOM element must be provided to initialize MenuNavigatore.");
        }
        if (MenuNavigatore._menuInstances.has(menuElement)) {
            console.warn("MenuNavigatore is already initialized for this element. Skipping re-initialization.");
            return MenuNavigatore._menuInstances.get(menuElement).instance;
        }

        const effectiveConfig = { ...MenuNavigatore._defaultConfiguration, ...options };

        const instanceData = {
            element: menuElement,
            config: effectiveConfig,
            currentPathElements: [],
            concealTimerId: null,
            isPathRetained: false,
            // Store bound handlers to remove them later
            boundDelegateHandler: this._delegateEventHandler.bind(this),
            boundTouchHandler: this._handleTouchInteraction.bind(this)
        };
        MenuNavigatore._menuInstances.set(menuElement, { instance: this, data: instanceData });

        this._initializeMenu(menuElement, instanceData);
        effectiveConfig.onInitialize.call(menuElement);
    }

    _getInstanceData(element) {
        const entry = MenuNavigatore._menuInstances.get(element || this._element);
        return entry ? entry.data : null;
    }

    _initializeMenu(menuElement, instanceData) {
        const { config } = instanceData;
        const { _coreIndicators } = MenuNavigatore;

        this._applyRootClasses(menuElement, config);
        instanceData.currentPathElements = this._establishInitialPath(menuElement, config);
        this._adjustSubmenuLinkClasses(menuElement.querySelectorAll(`li:has(${config.childMenuSelector})`));
        this._configurePointerBehavior(menuElement);
        this._attachInteractionListeners(menuElement, instanceData.boundDelegateHandler, instanceData.boundTouchHandler);

        // Initially hide all submenus that are not part of the active path
        menuElement.querySelectorAll(`li:has(${config.childMenuSelector})`).forEach(item => {
            if (!item.classList.contains(_coreIndicators.breadCrumbMark)) {
                this.concealSubmenus(item, true); // Instant hide for non-path items
            }
        });
    }

    _applyRootClasses(menuElement, config, remove = false) {
        const { _coreIndicators } = MenuNavigatore;
        let classesToToggle = _coreIndicators.menuActiveMark;
        if (config.applyArrowStyles) {
            classesToToggle += ' ' + _coreIndicators.arrowStyleMark;
        }
        classesToToggle.split(' ').forEach(cls => {
            menuElement.classList.toggle(cls, !remove);
        });
    }

    _establishInitialPath(menuElement, config) {
        const { _coreIndicators } = MenuNavigatore;
        const pathItems = Array.from(menuElement.querySelectorAll(`li.${config.initialPathClass}`))
            .slice(0, config.pathDepth);

        pathItems.forEach(item => {
            item.classList.add(config.activeItemClass, _coreIndicators.breadCrumbMark);
            const submenu = item.querySelector(config.childMenuSelector);
            if (submenu) {
                // Ensure submenu is visible, without animation for path items
                submenu.style.display = 'block';
                submenu.style.opacity = '1';
                submenu.hidden = false;
                submenu.style.transition = 'none'; // No transition for path items
            }
            item.classList.remove(config.initialPathClass);
        });
        return pathItems;
    }

    _adjustSubmenuLinkClasses(listItemElements, remove = false) {
        const { _coreIndicators } = MenuNavigatore;
        listItemElements.forEach(li => {
            const link = li.querySelector('a');
            if (link) {
                link.classList.toggle(_coreIndicators.linkWithSubmenuMark, !remove);
            }
        });
    }

    _configurePointerBehavior(menuElement, reset = false) {
        const currentMsTouchAction = menuElement.style.msTouchAction;
        const currentTouchAction = menuElement.style.touchAction;

        let newTouchAction = 'pan-y'; // Default for Superfish to allow vertical scroll
        if (currentTouchAction === 'pan-y' || currentMsTouchAction === 'pan-y') {
            newTouchAction = 'auto'; // Toggle to auto if currently pan-y
        }
        if (reset) {
            newTouchAction = ''; // Clear styles on destroy
        }

        menuElement.style.msTouchAction = newTouchAction;
        menuElement.style.touchAction = newTouchAction;
    }

    _attachInteractionListeners(menuElement, delegateHandler, touchHandler) {
        const { _browserFeatures } = MenuNavigatore;

        menuElement.addEventListener('mouseover', delegateHandler);
        menuElement.addEventListener('mouseout', delegateHandler);
        menuElement.addEventListener('focusin', delegateHandler);
        menuElement.addEventListener('focusout', delegateHandler);

        let touchEventNames = ['pointerdown'];
        if (!_browserFeatures.isAppleTouchDevice) {
            touchEventNames.push('touchend');
        }
        if (_browserFeatures.isMicrosoftPhone) {
            touchEventNames.push('mousedown');
        }
        touchEventNames.forEach(eventName => {
            menuElement.addEventListener(eventName, touchHandler);
        });

        // iOS specific: clicks only bubble to body children
        if (_browserFeatures.isAppleTouchDevice) {
            window.addEventListener('load', this._iosLoadHandler = () => {
                // Ensure children are actual elements, not text nodes
                Array.from(document.body.children).forEach(child => {
                    if (child.nodeType === 1) child.addEventListener('click', () => {}, false); // No-op click handler
                });
            });
        }
    }

    _removeInteractionListeners(menuElement, delegateHandler, touchHandler) {
        const { _browserFeatures } = MenuNavigatore;

        menuElement.removeEventListener('mouseover', delegateHandler);
        menuElement.removeEventListener('mouseout', delegateHandler);
        menuElement.removeEventListener('focusin', delegateHandler);
        menuElement.removeEventListener('focusout', delegateHandler);

        let touchEventNames = ['pointerdown'];
        if (!_browserFeatures.isAppleTouchDevice) {
            touchEventNames.push('touchend');
        }
        if (_browserFeatures.isMicrosoftPhone) {
            touchEventNames.push('mousedown');
        }
        touchEventNames.forEach(eventName => {
            menuElement.removeEventListener(eventName, touchHandler);
        });

        if (_browserFeatures.isAppleTouchDevice && this._iosLoadHandler) {
            window.removeEventListener('load', this._iosLoadHandler);
            delete this._iosLoadHandler; // Clean up reference
        }
    }

    _delegateEventHandler(event) {
        const { element, config } = this._getInstanceData();
        const listItemWithSubmenuSelector = `li:has(${config.childMenuSelector})`;

        const targetListItem = event.target.closest(listItemWithSubmenuSelector);

        if (event.type === 'mouseover' || event.type === 'focusin') {
            if (targetListItem) {
                this._activateMenuItem(targetListItem);
            }
        } else if (event.type === 'mouseout' || event.type === 'focusout') {
            if (targetListItem) {
                this._deactivateMenuItem(targetListItem);
            }
        }
    }

    _handleTouchInteraction(event) {
        const { config } = this._getInstanceData();
        const targetLink = event.target.closest('a');
        if (!targetLink) return;

        const parentListItem = targetLink.parentElement;
        const submenuElement = parentListItem.querySelector(config.childMenuSelector);

        if (submenuElement && submenuElement.hidden) {
            event.preventDefault(); // Prevent default link navigation on first touch
            // Prevent subsequent click event from bubbling up
            targetLink.addEventListener('click', (e) => e.preventDefault(), { once: true });

            if (event.type === 'pointerdown' || event.type === 'MSPointerDown') {
                targetLink.focus();
            } else {
                this._activateMenuItem(parentListItem);
            }
        }
    }

    _activateMenuItem(listItemElement) {
        const instanceData = this._getInstanceData();
        const { config } = instanceData;

        clearTimeout(instanceData.concealTimerId);
        instanceData.concealTimerId = null;

        // Hide sibling submenus first
        Array.from(listItemElement.parentElement.children).forEach(sibling => {
            if (sibling.nodeType === 1 && sibling !== listItemElement && sibling.matches(`li:has(${config.childMenuSelector})`)) {
                this.concealSubmenus(sibling);
            }
        });

        this.displaySubmenus(listItemElement);
    }

    _deactivateMenuItem(listItemElement) {
        const instanceData = this._getInstanceData();
        const { config } = instanceData;
        const { _browserFeatures } = MenuNavigatore;

        if (_browserFeatures.isAppleTouchDevice) {
            this._finalizeDeactivation(listItemElement);
        } else {
            clearTimeout(instanceData.concealTimerId);
            instanceData.concealTimerId = setTimeout(() => {
                this._finalizeDeactivation(listItemElement);
            }, config.hideDelayMs);
        }
    }

    _finalizeDeactivation(listItemElement) {
        const instanceData = this._getInstanceData();
        const { config, currentPathElements } = instanceData;

        instanceData.isPathRetained = currentPathElements.includes(listItemElement);
        this.concealSubmenus(listItemElement);

        // Check if any parent element is still active
        if (!listItemElement.closest(`.${config.activeItemClass}`)) {
            config.onIdle.call(instanceData.element);
            if (currentPathElements.length) {
                // Re-activate the path if it exists
                this._activateMenuItem(currentPathElements[0]);
            }
        }
    }

    displaySubmenus(listItemElement) {
        const instanceData = this._getInstanceData();
        const { config } = instanceData;
        const submenuElement = listItemElement.querySelector(`:scope > ${config.childMenuSelector}`);
        if (!submenuElement) return this;

        config.onBeforeDisplay.call(submenuElement);
        listItemElement.classList.add(config.activeItemClass);

        const transitionDuration = this._mapSpeedToDuration(config.showTransitionSpeed);
        submenuElement.style.transition = `opacity ${transitionDuration} ease-in-out`;
        submenuElement.style.opacity = '0'; // Start invisible
        submenuElement.style.display = 'block'; // Make it visible for transition

        // Force reflow to ensure initial opacity:0 is applied before transition to opacity:1
        void submenuElement.offsetWidth;

        submenuElement.style.opacity = '1'; // Animate to visible

        const onTransitionEnd = () => {
            submenuElement.removeEventListener('transitionend', onTransitionEnd);
            config.onDisplay.call(submenuElement);
        };
        submenuElement.addEventListener('transitionend', onTransitionEnd, { once: true });
        return this;
    }

    concealSubmenus(listItemElement, instant = false) {
        const instanceData = this._getInstanceData();
        const { config, currentPathElements } = instanceData;

        const submenusToConsider = [];
        // 1. Get the direct submenu of the current listItemElement
        const directSubmenu = listItemElement.querySelector(`:scope > ${config.childMenuSelector}`);
        if (directSubmenu) {
            submenusToConsider.push(directSubmenu);
        }
        // 2. Get submenus of any active children within this listItemElement
        listItemElement.querySelectorAll(`li.${config.activeItemClass} > ${config.childMenuSelector}`).forEach(submenu => {
            submenusToConsider.push(submenu);
        });

        if (!submenusToConsider.length) return this;

        const pathElementsToExclude = instanceData.isPathRetained ? currentPathElements : [];
        instanceData.isPathRetained = false; // Reset retainPath after check

        submenusToConsider.forEach(submenuElement => {
            const parentLi = submenuElement.parentElement;
            // Only hide if not part of the active path that needs to be retained
            if (!pathElementsToExclude.includes(parentLi)) {
                config.onBeforeConceal.call(submenuElement);
                parentLi.classList.remove(config.activeItemClass);

                if (instant) {
                    submenuElement.style.transition = 'none'; // No transition
                    submenuElement.style.display = 'none';
                    submenuElement.style.opacity = ''; // Clear inline opacity
                    config.onConceal.call(submenuElement);
                } else {
                    const transitionDuration = this._mapSpeedToDuration(config.hideTransitionSpeed);
                    submenuElement.style.transition = `opacity ${transitionDuration} ease-in-out`;
                    submenuElement.style.opacity = '0'; // Animate to invisible

                    const onTransitionEnd = () => {
                        submenuElement.removeEventListener('transitionend', onTransitionEnd);
                        if (submenuElement.style.opacity === '0' || submenuElement.style.display === 'none') { // Ensure transition completed
                            submenuElement.style.display = 'none';
                            submenuElement.style.opacity = ''; // Clear inline opacity
                            submenuElement.style.transition = ''; // Clear transition property
                            config.onConceal.call(submenuElement);
                        }
                    };
                    submenuElement.addEventListener('transitionend', onTransitionEnd, { once: true });
                }
            }
        });
        return this;
    }

    _mapSpeedToDuration(speed) {
        switch (speed) {
            case 'fast': return '0.2s';
            case 'normal': return '0.4s';
            case 'slow': return '0.6s';
            default: return speed.toString(); // Allow custom CSS time strings
        }
    }

    removeBehavior() {
        const instanceData = this._getInstanceData();
        if (!instanceData) return this;

        const { element, config, concealTimerId, currentPathElements, boundDelegateHandler, boundTouchHandler } = instanceData;
        const { _coreIndicators } = MenuNavigatore;

        clearTimeout(concealTimerId);

        this._applyRootClasses(element, config, true); // Remove root classes
        this._adjustSubmenuLinkClasses(element.querySelectorAll(`li:has(${config.childMenuSelector})`), true); // Remove anchor classes
        this._configurePointerBehavior(element, true); // Reset touch-action styles
        this._removeInteractionListeners(element, boundDelegateHandler, boundTouchHandler); // Remove all event listeners

        // Clear animation's inline styles and ensure hidden
        element.querySelectorAll(config.childMenuSelector).forEach(submenu => {
            submenu.style.cssText = submenu.style.cssText.replace(/display[^;]+;?/g, '').replace(/opacity[^;]+;?/g, '').replace(/transition[^;]+;?/g, '');
            submenu.style.display = 'none'; // Explicitly hide
            submenu.style.opacity = ''; // Clear opacity
        });

        // Reset 'current' path classes
        currentPathElements.forEach(item => {
            item.classList.remove(config.activeItemClass, _coreIndicators.breadCrumbMark);
            item.classList.add(config.initialPathClass);
        });

        // Remove any remaining active item classes
        element.querySelectorAll(`.${config.activeItemClass}`).forEach(item => item.classList.remove(config.activeItemClass));

        config.onDeactivate.call(element);
        MenuNavigatore._menuInstances.delete(element); // Remove instance data
        return this;
    }
}

// Global factory function to mimic jQuery plugin style
window.SuperNav = function(selectorOrElement, methodOrOptions, ...args) {
    let targetElements;
    if (typeof selectorOrElement === 'string') {
        targetElements = document.querySelectorAll(selectorOrElement);
    } else if (selectorOrElement instanceof Element) {
        targetElements = [selectorOrElement];
    } else if (selectorOrElement instanceof NodeList || (Array.isArray(selectorOrElement) && selectorOrElement.every(el => el instanceof Element))) {
        targetElements = selectorOrElement;
    } else {
        throw new Error("Invalid target for SuperNav. Must be a CSS selector, a single Element, or a collection of Elements.");
    }

    const results = [];
    targetElements.forEach(element => {
        let instanceEntry = MenuNavigatore._menuInstances.get(element);
        let instance = instanceEntry ? instanceEntry.instance : null;

        if (typeof methodOrOptions === 'string') {
            if (!instance) {
                console.warn(`SuperNav: Attempted to call method "${methodOrOptions}" on an uninitialized element. Initializing first.`);
                instance = new MenuNavigatore(element);
                if (!instance) return; // If initialization failed or returned existing instance
            }
            if (typeof instance[methodOrOptions] === 'function') {
                results.push(instance[methodOrOptions](...args));
            } else {
                throw new Error(`Method "${methodOrOptions}" does not exist on SuperNav instance.`);
            }
        } else if (typeof methodOrOptions === 'object' || methodOrOptions === undefined) {
            if (instance) {
                // If already initialized, just return the existing instance
                results.push(instance);
            } else {
                // Initialize a new instance
                results.push(new MenuNavigatore(element, methodOrOptions));
            }
        }
    });

    // Return the result of the method call for single element, or array for multiple
    return results.length === 1 ? results[0] : results;
};

// Expose defaults for customization
window.SuperNav.defaultSettings = MenuNavigatore._defaultConfiguration;