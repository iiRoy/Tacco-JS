(function() {
    const defaultSettings = {
        animatedTransitions: true,
        animationDurationMs: 500,
        activateOnHover: false,
        hoverActivationDelayMs: 200,
initialActiveEntry: null
    };

    // Implements slide up/down using max-height transitions
    function performSlideTransition(elementNode, displayMode, duration) {
        if (displayMode === 'show') {
            elementNode.style.display = ''; // Ensure element is not 'none'
            elementNode.style.maxHeight = '0px'; // Reset for measurement
            elementNode.offsetHeight; // Force reflow for transition to work
            elementNode.style.transition = `max-height ${duration}ms ease-out`;
            elementNode.style.maxHeight = `${elementNode.scrollHeight}px`; // Animate to full height

            const onTransitionEnd = () => {
                elementNode.style.maxHeight = ''; // Remove max-height after transition
                elementNode.style.transition = ''; // Remove transition property
                elementNode.removeEventListener('transitionend', onTransitionEnd);
            };
            elementNode.addEventListener('transitionend', onTransitionEnd);

        } else { // 'hide'
            elementNode.style.maxHeight = `${elementNode.scrollHeight}px`; // Set to current height
            elementNode.offsetHeight; // Force reflow
            elementNode.style.transition = `max-height ${duration}ms ease-out`;
            elementNode.style.maxHeight = '0px'; // Animate to 0

            const onTransitionEnd = () => {
                elementNode.style.display = 'none'; // Hide completely after transition
                elementNode.style.transition = '';
                elementNode.removeEventListener('transitionend', onTransitionEnd);
            };
            elementNode.addEventListener('transitionend', onTransitionEnd);
        }
    }

    // Instant show/hide without animation
    function performInstantDisplay(elementNode, displayMode) {
        elementNode.style.display = displayMode === 'show' ? '' : 'none';
        elementNode.style.maxHeight = displayMode === 'show' ? '' : '0px'; // Ensure max-height is consistent
    }

    // Factory function to create an accordion controller
    function createAccordionController(domElement, userOptions) {
        const componentInstance = {};
        const configuration = Object.assign({}, defaultSettings, userOptions);

        const menuRoot = domElement;
        menuRoot.classList.add('accordion-component'); // Custom root class

        let activeEventName; // 'click' or 'mouseenter'
        let hoverTimeoutIdentifier = null;

        // Helper to generate a robust selector for the root element
        function generateRootSelector(el) {
            if (el.id) {
                return `#${el.id}`;
            }
            const firstClass = el.className.split(' ')[0];
            if (firstClass) {
                return `.${firstClass}`;
            }
            // Fallback for elements without ID or class (unlikely for a menu root)
            el.dataset.accordId = el.dataset.accordId || Math.random().toString(36).substr(2, 9);
            return `[data-accord-id="${el.dataset.accordId}"]`;
        }
        const rootSelector = generateRootSelector(menuRoot);
        const anchorSelector = `${rootSelector} a`; // Selector for interactive links

        // DOM query helpers
        function getDirectSubmenu(linkElement) {
            return linkElement.nextElementSibling;
        }

        function hasSubmenuContent(linkElement) {
            const submenu = getDirectSubmenu(linkElement);
            return submenu && submenu.tagName === 'UL';
        }

        function isSubmenuCurrentlyHidden(linkElement) {
            const submenu = getDirectSubmenu(linkElement);
            return submenu && (submenu.style.display === 'none' || submenu.style.maxHeight === '0px');
        }

        function isParentItemMarkedActive(linkElement) {
            return linkElement.parentElement.classList.contains('active-item');
        }

        // Display/conceal logic
        function revealMenuElement(targetElement) {
            if (configuration.animatedTransitions) {
                performSlideTransition(targetElement, 'show', configuration.animationDurationMs);
            } else {
                performInstantDisplay(targetElement, 'show');
            }
        }

        function concealMenuElement(targetElement) {
            if (configuration.animatedTransitions) {
                performSlideTransition(targetElement, 'hide', configuration.animationDurationMs);
            } else {
                performInstantDisplay(targetElement, 'hide');
            }
        }

        // Core menu state manipulation
        function expandMenuItem(triggerLink) {
            const parentEntry = triggerLink.parentElement;
            const targetSubmenu = getDirectSubmenu(triggerLink);

            // Close other active branches that are not ancestors of the current target
            menuRoot.querySelectorAll('.active-item').forEach(activeEntry => {
                const activeEntrySubmenu = activeEntry.querySelector('ul');
                if (activeEntrySubmenu && activeEntrySubmenu !== targetSubmenu && !targetSubmenu.contains(activeEntrySubmenu)) {
                    // Find the anchor for this active entry to fold it
                    const entryAnchor = activeEntry.querySelector('a');
                    if (entryAnchor) {
                        collapseMenuItem(entryAnchor);
                    }
                }
            });

            // Remove 'active-item' from parent items that are no longer in the current path
            menuRoot.querySelectorAll('.active-item').forEach(activeEntry => {
                const activeEntrySubmenu = activeEntry.querySelector('ul');
                if (activeEntrySubmenu && !targetSubmenu.contains(activeEntrySubmenu) && activeEntrySubmenu !== targetSubmenu) {
                    activeEntry.classList.remove('active-item');
                }
            });

            parentEntry.classList.add('active-item');
            revealMenuElement(targetSubmenu);

            if (configuration.openCallback) {
                configuration.openCallback(parentEntry);
            }
        }

        function collapseMenuItem(triggerLink) {
            const parentEntry = triggerLink.parentElement;
            const targetSubmenu = getDirectSubmenu(triggerLink);

            // Recursively close nested active items within the collapsing submenu
            targetSubmenu.querySelectorAll('li.active-item').forEach(nestedEntry => {
                nestedEntry.classList.remove('active-item');
                const nestedSubmenuToClose = nestedEntry.querySelector('ul');
                if (nestedSubmenuToClose) {
                    concealMenuElement(nestedSubmenuToClose);
                }
            });

            parentEntry.classList.remove('active-item');
            concealMenuElement(targetSubmenu);

            if (configuration.closeCallback) {
                configuration.closeCallback(parentEntry);
            }
        }

        // Main event handler for interactions
        function handleMenuInteraction(event) {
            const currentAnchor = event.target.closest(anchorSelector);

            if (!currentAnchor) return; // Not an accordion link

            if (hasSubmenuContent(currentAnchor) && isSubmenuCurrentlyHidden(currentAnchor)) {
                // Submenu is closed, attempt to open
                event.preventDefault();
                if (configuration.activateOnHover) {
                    clearTimeout(hoverTimeoutIdentifier);
                    hoverTimeoutIdentifier = setTimeout(() => {
                        if (currentAnchor.matches(':hover')) {
                            expandMenuItem(currentAnchor);
                        }
                    }, configuration.hoverActivationDelayMs);
                } else {
                    expandMenuItem(currentAnchor);
                }
            } else if (isParentItemMarkedActive(currentAnchor) && hasSubmenuContent(currentAnchor)) {
                // Submenu is open, attempt to close
                event.preventDefault();
                if (!configuration.activateOnHover) {
                    collapseMenuItem(currentAnchor);
                }
                // For hover, closing is implicitly handled by mouseleave (clearing timer)
            }
        }

        // Mouseleave handler for hover activation to clear timers
        function handleRootMouseLeave(event) {
            const currentAnchor = event.target.closest(anchorSelector);
            if (currentAnchor) {
                clearTimeout(hoverTimeoutIdentifier);
            }
        }

        // Event binding/unbinding
        function registerListeners() {
            activeEventName = configuration.activateOnHover ? 'mouseenter' : 'click';
            menuRoot.addEventListener(activeEventName, handleMenuInteraction);

            if (configuration.activateOnHover) {
                // Use capture phase to ensure this listener runs for all mouseleave events from descendants
                menuRoot.addEventListener('mouseleave', handleRootMouseLeave, true);
            }
        }

        function unregisterListeners() {
            menuRoot.removeEventListener(activeEventName, handleMenuInteraction);
            if (configuration.activateOnHover) {
                menuRoot.removeEventListener('mouseleave', handleRootMouseLeave, true);
            }
            clearTimeout(hoverTimeoutIdentifier);
        }

        // Initial setup routines
        function initializeHiddenSubmenus() {
            menuRoot.querySelectorAll('ul').forEach(submenu => {
                performInstantDisplay(submenu, 'hide');
            });
        }

        function initializeActiveMenuItem(entrySelector) {
            let targetEntryElement;
            if (entrySelector instanceof Element) {
                targetEntryElement = entrySelector;
            } else if (typeof entrySelector === 'string') {
                targetEntryElement = menuRoot.querySelector(entrySelector);
            }

            if (!targetEntryElement) return;

            // Ensure we have an anchor element
            let actualAnchor = targetEntryElement.tagName === 'A' ? targetEntryElement : targetEntryElement.querySelector('a');
            if (!actualAnchor) return;

            // Traverse up to mark all parent <li> elements as active and show their submenus
            let currentParent = actualAnchor.parentElement;
            const ancestorsToReveal = [];
            while (currentParent && currentParent !== menuRoot) {
                if (currentParent.tagName === 'LI') {
                    currentParent.classList.add('active-item');
                    const parentAnchor = currentParent.querySelector('a');
                    if (parentAnchor) {
                        ancestorsToReveal.unshift(parentAnchor); // Add to front for correct order
                    }
                }
                currentParent = currentParent.parentElement;
            }

            ancestorsToReveal.forEach(anchor => {
                const submenu = getDirectSubmenu(anchor);
                if (submenu) {
                    performInstantDisplay(submenu, 'show');
                }
            });
        }

        // Public API methods
        componentInstance.discardComponent = function() {
            unregisterListeners();
            revealAllElements(); // Show all submenus and remove active classes
            menuRoot.classList.remove('accordion-component');
            menuRoot.querySelectorAll('.active-item').forEach(item => item.classList.remove('active-item'));
            // Remove data attribute if it was used for selector fallback
            if (menuRoot.dataset.accordId) {
                delete menuRoot.dataset.accordId;
            }
        };

        componentInstance.concealAll = function() {
            menuRoot.querySelectorAll('ul').forEach(submenu => {
                concealMenuElement(submenu);
            });
        };

        componentInstance.revealAll = function() {
            revealAllElements();
        };

        function revealAllElements() {
            menuRoot.querySelectorAll('ul').forEach(submenu => {
                revealMenuElement(submenu);
            });
            menuRoot.querySelectorAll('li').forEach(item => item.classList.add('active-item'));
        }

        // Initial setup
        initializeHiddenSubmenus();
        registerListeners();
        if (configuration.initialActiveEntry !== null) {
            initializeActiveMenuItem(configuration.initialActiveEntry);
        }

        return componentInstance;
    }

    // Global utility to create or interact with accordion components
    const componentStorage = new WeakMap(); // Stores instances privately

    window.accordionMenuUtility = function(selectorOrElement, ...args) {
        let targetElements = [];

        if (typeof selectorOrElement === 'string') {
            targetElements = Array.from(document.querySelectorAll(selectorOrElement));
        } else if (selectorOrElement instanceof Element) {
            targetElements = [selectorOrElement];
        } else {
            console.error("Invalid target provided to accordionMenuUtility.");
            return [];
        }

        const methodResults = [];

        targetElements.forEach(el => {
            let instance = componentStorage.get(el);
            const firstArgument = args[0];
            const remainingArgs = args.slice(1);

            if (!instance) {
                // No instance found, assume initialization
                instance = createAccordionController(el, firstArgument);
                componentStorage.set(el, instance);
            }

            if (typeof firstArgument === 'string' && instance[firstArgument]) {
                // If first argument is a string and it's a valid method name
                const result = instance[firstArgument].apply(instance, remainingArgs);
                if (result !== undefined) {
                    methodResults.push(result);
                }
            } else if (typeof firstArgument === 'object' && instance) {
                // If options are provided for an existing instance, the original plugin typically ignores them
                // or re-initializes. Here, we just return the existing instance.
            }

            // If no specific method result was returned, push the instance itself for chaining
            if (typeof firstArgument !== 'string' || methodResults.length === 0 || methodResults[methodResults.length - 1] === undefined) {
                methodResults.push(instance);
            }
        });

        // Mimic jQuery's return behavior: single result for single element, array for multiple
        if (targetElements.length === 1 && methodResults.length === 1) {
            return methodResults[0];
        }
        return methodResults;
    };

}).call(this);