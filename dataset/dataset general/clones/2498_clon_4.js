(function(scope) {
    const componentConfiguration = {
        allowConcurrentExpansion: true,
        enableSecondTapNav: false
    };

    const instanceRegistry = new WeakMap();

    const fetchDescendants = (base, selector) => Array.from(base.querySelectorAll(selector));
    const locateAncestor = (element, selector) => {
        let current = element;
        while (current && current !== document) {
            if (current.matches(selector)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    };

    class AccordionController {
        constructor(hostNode, customSettings) {
            this.hostNode = hostNode;
            this.activeConfiguration = { ...componentConfiguration, ...customSettings };
            this.registeredEventHandlers = [];

            this.prepareInitialDisplay();
            this.establishInteractionHandlers();

            instanceRegistry.set(this.hostNode, this);
        }

        prepareInitialDisplay() {
            const itemsWithSubmenus = fetchDescendants(this.hostNode, 'li:has(ul)');

            itemsWithSubmenus.forEach(item => {
                const subMenu = item.querySelector('ul');
                if (!subMenu) return;

                if (item.classList.contains('current-selection')) {
                    subMenu.classList.add('visible-group');
                    subMenu.classList.remove('hidden-group');
                } else {
                    subMenu.classList.add('hidden-group');
                    subMenu.classList.remove('visible-group');
                }
            });

            if (this.activeConfiguration.enableSecondTapNav) {
                const activeActionLinks = fetchDescendants(this.hostNode, 'li.current-selection:has(ul) > a');
                activeActionLinks.forEach(link => link.classList.add('tap-for-action'));
            }
        }

        establishInteractionHandlers() {
            const interactiveLinks = fetchDescendants(this.hostNode, 'li:has(ul) > a');

            interactiveLinks.forEach(link => {
                const handler = this.handleLinkActivation.bind(this);
                link.addEventListener('click', handler);
                this.registeredEventHandlers.push({ element: link, type: 'click', handler: handler });
            });
        }

        handleLinkActivation(event) {
            event.preventDefault();
            const activatedLink = event.currentTarget;
            const containingItem = locateAncestor(activatedLink, 'li');
            const childMenu = containingItem ? containingItem.querySelector('ul') : null;

            if (!containingItem || !childMenu) return;

            if (this.activeConfiguration.enableSecondTapNav) {
                if (this.manageSecondTapNavigation(activatedLink) && activatedLink.href && activatedLink.href !== "#" && activatedLink.href !== "") {
                    event.stopPropagation();
                    scope.location.href = activatedLink.href;
                    return;
                }
            }

            containingItem.classList.toggle('current-selection');
            this.updateSubMenuDisplay(childMenu);

            if (!this.activeConfiguration.allowConcurrentExpansion) {
                const siblingItems = Array.from(containingItem.parentNode.children).filter(child => child !== containingItem && child.tagName === 'LI');
                siblingItems.forEach(sibling => {
                    if (sibling.classList.contains('current-selection')) {
                        sibling.classList.remove('current-selection');
                        const siblingChildMenu = sibling.querySelector('ul.visible-group');
                        if (siblingChildMenu) {
                            this.updateSubMenuDisplay(siblingChildMenu, false);
                        }
                    }
                });
            }
        }

        manageSecondTapNavigation(linkElement) {
            if (linkElement.classList.contains('tap-for-action')) {
                linkElement.classList.remove('tap-for-action');
                return true;
            }

            if (linkElement.parentElement.querySelector('ul')) {
                const allActionLinks = fetchDescendants(this.hostNode, '.tap-for-action');
                allActionLinks.forEach(link => link.classList.remove('tap-for-action'));

                linkElement.classList.add('tap-for-action');
                return false;
            }
            return false;
        }

        updateSubMenuDisplay(subMenuElement, desiredState = null) {
            const isCurrentlyDisplayed = subMenuElement.classList.contains('visible-group');
            let shouldBeDisplayed;

            if (desiredState !== null) {
                shouldBeDisplayed = desiredState;
            } else {
                shouldBeDisplayed = !isCurrentlyDisplayed;
            }

            if (shouldBeDisplayed) {
                subMenuElement.classList.remove('hidden-group');
                subMenuElement.classList.add('visible-group');
            } else {
                subMenuElement.classList.remove('visible-group');
                subMenuElement.classList.add('hidden-group');
            }
        }

        deactivateComponent() {
            this.registeredEventHandlers.forEach(({ element, type, handler }) => {
                element.removeEventListener(type, handler);
            });
            this.registeredEventHandlers = [];

            instanceRegistry.delete(this.hostNode);
        }
    }

    scope.manageNavigation = function(targetElement, configOrMethod) {
        if (typeof targetElement === 'string') {
            targetElement = document.querySelector(targetElement);
        }
        if (!targetElement || targetElement.nodeType !== 1) {
            console.error("Invalid target element provided for navigation management.");
            return;
        }

        let instance = instanceRegistry.get(targetElement);

        if (typeof configOrMethod === 'string') {
            if (instance && typeof instance[configOrMethod] === 'function') {
                if (configOrMethod === 'deactivateComponent') {
                    instance.deactivateComponent();
                    return;
                }
            } else {
                console.warn(`Method '${configOrMethod}' not found or no active instance on the element.`);
            }
        } else {
            if (instance) {
                instance.deactivateComponent();
            }
            new AccordionController(targetElement, configOrMethod);
        }
    };

})(window);