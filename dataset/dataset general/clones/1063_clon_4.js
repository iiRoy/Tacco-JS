(function (globalScope, documentObject) {

    const defaultConfiguration = {
        itemsPerDisplay: 4,
        controlPanelEnabled: true,
        autoCycle: true,
        flowDirection: 'up',
        movementSpeed: 500, // Milliseconds
        cycleInterval: 4000, // Milliseconds
        pauseOnHover: true,
    };

    // Utility for merging objects (shallow merge is sufficient here)
    const combineSettings = (base, overrides) => {
        const result = {};
        for (const key in base) {
            result[key] = base[key];
        }
        for (const key in overrides) {
            result[key] = overrides[key];
        }
        return result;
    };

    // Helper for animating height and opacity using CSS transitions
    const animateVisibilityAndSize = (element, targetState, durationMs, callback) => {
        if (!element) {
            if (callback) callback();
            return;
        }

        // Set transition properties
        element.style.transition = `max-height ${durationMs}ms ease-in-out, opacity ${durationMs}ms ease-in-out`;
        element.style.overflow = 'hidden';

        if (targetState === 'expand') { // Mimic slideDown
            element.style.display = 'block'; // Ensure element is visible before animating
            element.style.maxHeight = '0px';
            element.style.opacity = '0';
            // Force reflow to ensure initial state is applied before transition
            element.offsetHeight; 
            element.style.maxHeight = `${element.scrollHeight}px`;
            element.style.opacity = '1';
        } else if (targetState === 'collapse') { // Mimic slideUp
            element.style.maxHeight = `${element.scrollHeight}px`;
            element.style.opacity = '1';
            // Force reflow
            element.offsetHeight;
            element.style.maxHeight = '0px';
            element.style.opacity = '0';
        }

        const handleTransitionEnd = () => {
            element.removeEventListener('transitionend', handleTransitionEnd);
            element.style.transition = ''; // Remove transition property
            element.style.overflow = ''; // Reset overflow

            if (targetState === 'expand') {
                element.style.maxHeight = ''; // Remove explicit max-height, let CSS handle natural height
                element.style.opacity = ''; // Remove explicit opacity
            } else if (targetState === 'collapse') {
                element.style.display = 'none'; // Hide element completely after transition
                element.style.maxHeight = '0px'; // Keep max-height at 0 for hidden state
                element.style.opacity = '0'; // Keep opacity at 0 for hidden state
            }
            if (callback) callback();
        };

        element.addEventListener('transitionend', handleTransitionEnd);
    };

    // Main class for the content rotation mechanism
    class ContentRotator {
        constructor(hostElement, userSettings) {
            this._rootElement = hostElement;
            this._settings = combineSettings(defaultConfiguration, userSettings);

            const initialItem = this._rootElement.firstElementChild;
            if (!initialItem) {
                console.warn("ContentRotator: Host element must contain child elements.");
                return;
            }
            this._elementTag = initialItem.tagName.toLowerCase();
            this._elementClass = initialItem.className;

            this._cycleTimer = null;
            this._resizeDebounceTimer = null;
            this._isAnimationActive = false;
            this._isPointerEngaged = false; // Corresponds to isHovered

            // Bind event handlers to the instance
            this._onElementEnter = this._onElementEnter.bind(this);
            this._onElementLeave = this._onElementLeave.bind(this);
            this._handleWindowResized = this._handleWindowResized.bind(this);

            this.startOperation();
        }

        startOperation() {
            this.layoutElements();

            if (this._settings.autoCycle) {
                this.beginCycling();
            }

            if (this._settings.controlPanelEnabled) {
                this.createControlInterface();
            }
        }

        layoutElements() {
            const allContentElements = Array.from(this._rootElement.children);

            // Adjust visible items if count exceeds available elements
            if (allContentElements.length < this._settings.itemsPerDisplay) {
                this._settings.itemsPerDisplay = allContentElements.length;
            }

            let cumulativeHeight = 0;
            allContentElements.forEach((element, index) => {
                element.style.display = 'block'; // Ensure it's visible for height calculation
                if (index < this._settings.itemsPerDisplay) {
                    cumulativeHeight += element.offsetHeight + 10; // +10px per item as in original
                    element.style.maxHeight = ''; // Clear explicit max-height
                    element.style.opacity = ''; // Clear explicit opacity
                } else {
                    element.style.display = 'none'; // Hide elements beyond visible count
                    element.style.maxHeight = '0px';
                    element.style.opacity = '0';
                }
            });

            this._rootElement.style.overflowY = 'hidden';
            this._rootElement.style.height = `${cumulativeHeight}px`;

            // Re-attach hover listeners for all items
            allContentElements.forEach(element => {
                element.removeEventListener('mouseenter', this._onElementEnter);
                element.removeEventListener('mouseleave', this._onElementLeave);
                element.addEventListener('mouseenter', this._onElementEnter);
                element.addEventListener('mouseleave', this._onElementLeave);
            });

            // Set up debounced window resize handler
            globalScope.removeEventListener('resize', this._handleWindowResized); // Remove previous to prevent duplicates
            globalScope.addEventListener('resize', this._handleWindowResized);
        }

        _handleWindowResized() {
            if (this._resizeDebounceTimer) {
                clearTimeout(this._resizeDebounceTimer);
            }
            this._resizeDebounceTimer = setTimeout(() => {
                this.layoutElements();
            }, 200);
        }

        _onElementEnter() {
            this.managePlayback(true); // Pause
        }

        _onElementLeave() {
            this.managePlayback(false); // Resume
        }

        locateParentContainer() {
            let current = this._rootElement;
            while (current && current.parentNode) {
                current = current.parentNode;
                // The original checks if the grandparent has 'panel' class and returns the parent.
                // So if current.parentNode has 'panel' class, it's the element to return.
                if (current.classList && current.classList.contains('panel')) {
                    return current;
                }
            }
            return null;
        }

        createControlInterface() {
            const containerFrame = this.locateParentContainer();
            if (containerFrame) {
                const navStructure = documentObject.createElement('div');
                navStructure.innerHTML = '<ul class="pagination pull-right" style="margin: 0px;">' +
                                         '<li><a href="#" class="previous-item-action"><span class="glyphicon glyphicon-chevron-down"></span></a></li>' +
                                         '<li><a href="#" class="next-item-action"><span class="glyphicon glyphicon-chevron-up"></span></a></li>' +
                                         '</ul><div class="clearfix"></div>';
                
                let footerElement = containerFrame.querySelector(".panel-footer");
                if (!footerElement) {
                    footerElement = documentObject.createElement('div');
                    footerElement.className = 'panel-footer';
                    containerFrame.appendChild(footerElement);
                }
                footerElement.appendChild(navStructure);

                const prevButton = navStructure.querySelector('.previous-item-action');
                const nextButton = navStructure.querySelector('.next-item-action');

                prevButton.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.scrollUpward();
                });

                nextButton.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.scrollDownward();
                });
            }
        }

        managePlayback(isPaused) {
            this._isPointerEngaged = isPaused;
            if (this._cycleTimer) {
                clearTimeout(this._cycleTimer);
            }
            if (this._settings.autoCycle && !isPaused) { // If resuming from pause
                this.beginCycling();
            }
        }

        reinitiateCycling(isHoveredState) {
            if (this._cycleTimer) {
                clearTimeout(this._cycleTimer);
            }
            if (this._settings.autoCycle) {
                this._isPointerEngaged = isHoveredState;
                this.beginCycling();
            }
        }

        beginCycling() {
            this._cycleTimer = setTimeout(() => {
                if (!this._settings.pauseOnHover) {
                    this._isPointerEngaged = false;
                }

                if (!this._isPointerEngaged) {
                    if (this._settings.flowDirection === 'up') {
                        this.scrollDownward();
                    } else {
                        this.scrollUpward();
                    }
                }
            }, this._settings.cycleInterval);
        }

        scrollUpward() { // Corresponds to onPrev
            if (this._isAnimationActive) {
                return false;
            }
            this._isAnimationActive = true;

            const currentElements = Array.from(this._rootElement.children);
            const lastVisibleElement = currentElements[currentElements.length - 1];

            const newElement = documentObject.createElement(this._elementTag);
            newElement.className = this._elementClass;
            newElement.innerHTML = lastVisibleElement.innerHTML;
            newElement.style.display = 'none'; // Initially hidden
            newElement.style.maxHeight = '0px';
            newElement.style.opacity = '0';
            
            this._rootElement.insertBefore(newElement, this._rootElement.firstElementChild);

            // Animate the newly prepended element to slide down
            animateVisibilityAndSize(newElement, 'expand', this._settings.movementSpeed, () => {
                this._rootElement.removeChild(lastVisibleElement); // Remove the original last item
                this._isAnimationActive = false;
                this.reinitiateCycling(this._isPointerEngaged);
            });
            
            // Animate the element that goes out of view (the one that was at itemsPerDisplay position)
            const elementToCollapse = currentElements[this._settings.itemsPerDisplay - 1];
            if (elementToCollapse) {
                animateVisibilityAndSize(elementToCollapse, 'collapse', this._settings.movementSpeed);
            }

            // Re-attach hover listeners (as in original)
            Array.from(this._rootElement.children).forEach(element => {
                element.removeEventListener('mouseenter', this._onElementEnter);
                element.removeEventListener('mouseleave', this._onElementLeave);
                element.addEventListener('mouseenter', this._onElementEnter);
                element.addEventListener('mouseleave', this._onElementLeave);
            });
        }

        scrollDownward() { // Corresponds to onNext
            if (this._isAnimationActive) {
                return false;
            }
            this._isAnimationActive = true;

            const currentElements = Array.from(this._rootElement.children);
            const firstVisibleElement = currentElements[0];

            const newElement = documentObject.createElement(this._elementTag);
            newElement.className = this._elementClass;
            newElement.innerHTML = firstVisibleElement.innerHTML;
            newElement.style.display = 'none'; // Initially hidden
            newElement.style.maxHeight = '0px';
            newElement.style.opacity = '0';

            this._rootElement.appendChild(newElement);

            // Animate the original first element to slide up
            animateVisibilityAndSize(firstVisibleElement, 'collapse', this._settings.movementSpeed, () => {
                this._rootElement.removeChild(firstVisibleElement);
            });

            // Animate the newly appended element (which becomes visible) to slide down
            const elementToExpand = currentElements[this._settings.itemsPerDisplay]; // This is the newly appended one
            if (elementToExpand) {
                 animateVisibilityAndSize(elementToExpand, 'expand', this._settings.movementSpeed, () => {
                    this._isAnimationActive = false;
                    this.reinitiateCycling(this._isPointerEngaged);
                 });
            } else { // Fallback if no element to expand (e.g., less than itemsPerDisplay elements)
                 this._isAnimationActive = false;
                 this.reinitiateCycling(this._isPointerEngaged);
            }

            // Re-attach hover listeners (as in original)
            Array.from(this._rootElement.children).forEach(element => {
                element.removeEventListener('mouseenter', this._onElementEnter);
                element.removeEventListener('mouseleave', this._onElementLeave);
                element.addEventListener('mouseenter', this._onElementEnter);
                element.addEventListener('mouseleave', this._onElementLeave);
            });
        }
    }

    // Expose a global function to initialize the content rotator
    globalScope.activateContentScroller = function (selector, options) {
        const targetElements = documentObject.querySelectorAll(selector);
        targetElements.forEach(element => {
            // Store instance on element to prevent re-initialization
            if (!element._contentRotatorInstance) {
                element._contentRotatorInstance = new ContentRotator(element, options);
            }
        });
    };

})(window, document);