(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define('PortalNexus', [], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.PortalNexus = factory();
    }
}(this, function() {

    const defaultConfiguration = {
        mainPortalSelector: '.modal',
        innerBoxSelector: '.modal-inner',
        contentAreaSelector: '.modal-content',
        triggerOpenSelector: '[rel="modal:open"]',
        triggerCloseSelector: '[rel="modal:close"]',
        pageBodySelector: 'body',
        activeClass: 'modal-visible',
        initialLoadClass: 'vanilla-modal',
        allowClickOutside: true,
        escapeKeyCode: 27,
        enableTransitions: true,
        transitionEndEventName: null,
        beforeActivate: function() {},
        beforeDeactivate: function() {},
        onActivate: function() {},
        onDeactivate: function() {}
    };

    function combineConfigurations(base, custom) {
        const result = { ...base
        };
        if (typeof custom === 'object' && custom !== null) {
            for (const key in custom) {
                if (Object.prototype.hasOwnProperty.call(custom, key)) {
                    if (typeof base[key] === 'object' && base[key] !== null &&
                        typeof custom[key] === 'object' && custom[key] !== null && !Array.isArray(base[key])) {
                        result[key] = combineConfigurations(base[key], custom[key]);
                    } else {
                        result[key] = custom[key];
                    }
                }
            }
        }
        return result;
    }

    function queryElement(selector, context = document) {
        const element = context.querySelector(selector);
        if (!element) {
            console.error(`PortalNexus: Element for selector "${selector}" not found.`);
        }
        return element;
    }

    function sniffTransitionEndEvent() {
        const testElement = document.createElement('div');
        const eventMap = {
            'transition': 'transitionend',
            'OTransition': 'otransitionend',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };
        for (const prop in eventMap) {
            if (Object.prototype.hasOwnProperty.call(eventMap, prop) && testElement.style[prop] !== undefined) {
                return eventMap[prop];
            }
        }
        return undefined;
    }

    function hasActiveTransition(element) {
        const computedStyle = window.getComputedStyle(element, null);
        const transitionProperties = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];
        return transitionProperties.some(prop => {
            const duration = computedStyle[prop];
            return typeof duration === 'string' && parseFloat(duration) > 0;
        });
    }

    function findMatchingAncestor(initialTarget, selector) {
        let currentElement = initialTarget;
        while (currentElement && currentElement !== document.body) {
            if (currentElement.matches(selector)) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }
        return null;
    }

    function createPortalNexus(userOptions) {
        let currentConfig = combineConfigurations(defaultConfiguration, userOptions);
        let domElements = {};
        let portalActive = false;
        let activeContentNode = null;
        let systemAnomaly = false;

        const boundHandlers = {};

        function initializeDomReferences() {
            domElements.pageBody = queryElement(currentConfig.pageBodySelector);
            domElements.mainPortal = queryElement(currentConfig.mainPortalSelector);
            if (!domElements.mainPortal || !domElements.pageBody) {
                systemAnomaly = true;
                return;
            }
            domElements.innerBox = queryElement(currentConfig.innerBoxSelector, domElements.mainPortal);
            domElements.contentArea = queryElement(currentConfig.contentAreaSelector, domElements.mainPortal);
            if (!domElements.innerBox || !domElements.contentArea) {
                systemAnomaly = true;
            }
        }

        function updateElementClass(element, className, add) {
            if (element && element instanceof HTMLElement) {
                element.classList.toggle(className, add);
            }
        }

        function updatePagePortalId(id) {
            if (domElements.pageBody) {
                if (id) {
                    domElements.pageBody.setAttribute('data-current-modal', id);
                } else {
                    domElements.pageBody.removeAttribute('data-current-modal');
                }
            }
        }

        function transferContentToPortal() {
            if (activeContentNode && domElements.contentArea) {
                const fragment = document.createDocumentFragment();
                while (activeContentNode.firstChild) {
                    fragment.appendChild(activeContentNode.firstChild);
                }
                domElements.contentArea.appendChild(fragment);
            }
        }

        function returnContentFromPortal() {
            if (activeContentNode && domElements.contentArea) {
                const fragment = document.createDocumentFragment();
                while (domElements.contentArea.firstChild) {
                    fragment.appendChild(domElements.contentArea.firstChild);
                }
                activeContentNode.appendChild(fragment);
            }
        }

        function resolveContentTarget(source) {
            if (source instanceof Element) {
                return source;
            } else if (typeof source === 'string') {
                return queryElement(source);
            } else if (source && typeof source.hash === 'string') {
                return queryElement(source.hash);
            } else {
                console.error('PortalNexus: Invalid target supplied for activation.');
                return null;
            }
        }

        function finalizeDeactivation() {
            updatePagePortalId(null);
            returnContentFromPortal();
            portalActive = false;
            activeContentNode = null;
            if (typeof currentConfig.onDeactivate === 'function') {
                currentConfig.onDeactivate.call(portalAPI);
            }
        }

        function keypressMonitor(evt) {
            if (typeof currentConfig.escapeKeyCode === 'number' && evt.which === currentConfig.escapeKeyCode && portalActive) {
                evt.preventDefault();
                deactivatePortal();
            }
        }

        function outsideClickMonitor(evt) {
            if (!currentConfig.allowClickOutside || !portalActive || !domElements.innerBox) return;

            let targetNode = evt.target;
            while (targetNode && targetNode !== document.body) {
                if (targetNode === domElements.innerBox) {
                    return;
                }
                targetNode = targetNode.parentNode;
            }
            deactivatePortal();
        }

        function delegatedClickMonitor(evt) {
            const openTrigger = findMatchingAncestor(evt.target, currentConfig.triggerOpenSelector);
            if (openTrigger) {
                evt.preventDefault();
                activatePortal(openTrigger);
                return;
            }

            const closeTrigger = findMatchingAncestor(evt.target, currentConfig.triggerCloseSelector);
            if (closeTrigger) {
                evt.preventDefault();
                deactivatePortal();
                return;
            }
        }

        function attachListeners() {
            if (systemAnomaly) return;

            boundHandlers.keypressMonitor = keypressMonitor;
            boundHandlers.delegatedClickMonitor = delegatedClickMonitor;
            boundHandlers.outsideClickMonitor = outsideClickMonitor;

            document.addEventListener('keydown', boundHandlers.keypressMonitor);
            document.addEventListener('click', boundHandlers.delegatedClickMonitor);
            domElements.mainPortal.addEventListener('click', boundHandlers.outsideClickMonitor);
        }

        function detachListeners() {
            if (boundHandlers.keypressMonitor) {
                document.removeEventListener('keydown', boundHandlers.keypressMonitor);
            }
            if (boundHandlers.delegatedClickMonitor) {
                document.removeEventListener('click', boundHandlers.delegatedClickMonitor);
            }
            if (boundHandlers.outsideClickMonitor && domElements.mainPortal) {
                domElements.mainPortal.removeEventListener('click', boundHandlers.outsideClickMonitor);
            }
        }

        function activatePortal(target) {
            if (portalActive || systemAnomaly) return;

            activeContentNode = resolveContentTarget(target);
            if (!activeContentNode || !(activeContentNode instanceof HTMLElement)) {
                console.error('PortalNexus: Target content node for activation is invalid or does not exist on page.');
                return;
            }

            if (typeof currentConfig.beforeActivate === 'function') {
                currentConfig.beforeActivate.call(portalAPI);
            }

            transferContentToPortal();
            updateElementClass(domElements.pageBody, currentConfig.activeClass, true);
            updatePagePortalId(activeContentNode.id || 'anonymous-portal');
            portalActive = true;

            if (typeof currentConfig.onActivate === 'function') {
                currentConfig.onActivate.call(portalAPI);
            }
        }

        function deactivatePortal() {
            if (!portalActive || systemAnomaly) return;

            if (typeof currentConfig.beforeDeactivate === 'function') {
                currentConfig.beforeDeactivate.call(portalAPI);
            }

            updateElementClass(domElements.pageBody, currentConfig.activeClass, false);

            const hasTransitions = currentConfig.enableTransitions && currentConfig.transitionEndEventName && hasActiveTransition(domElements.mainPortal);

            if (hasTransitions) {
                const transitionEndCallback = () => {
                    domElements.mainPortal.removeEventListener(currentConfig.transitionEndEventName, transitionEndCallback);
                    finalizeDeactivation();
                };
                domElements.mainPortal.addEventListener(currentConfig.transitionEndEventName, transitionEndCallback);
            } else {
                finalizeDeactivation();
            }
        }

        function disposePortal() {
            if (portalActive) {
                deactivatePortal();
            }
            detachListeners();
            updateElementClass(domElements.pageBody, currentConfig.initialLoadClass, false);
            domElements = {};
            currentConfig = {};
            systemAnomaly = true;
        }

        currentConfig.transitionEndEventName = sniffTransitionEndEvent();
        initializeDomReferences();

        if (!systemAnomaly) {
            updateElementClass(domElements.pageBody, currentConfig.initialLoadClass, true);
            attachListeners();
        } else {
            console.error('PortalNexus: Initialization aborted due to missing required DOM elements.');
        }

        const portalAPI = {
            activate: activatePortal,
            deactivate: deactivatePortal,
            dispose: disposePortal,
            get isActive() { return portalActive; }
        };

        return portalAPI;
    }

    return createPortalNexus;
}));