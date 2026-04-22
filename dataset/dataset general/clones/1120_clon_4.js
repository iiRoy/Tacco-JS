(function () {
    const defaultJourneyConfigurationParameters = {
        targetIdentifier: null, // Will be dynamically set from the initial selector
        journeySettings: {
            keyboardNavigationEnabled: true,
            autoScrollEnabled: true,
            spacingValue: '40px',
            animationDuration: 0.3, // seconds for CSS transitions
            minimumViewportHeight: 400,
        },
        backdropSettings: {
            styleClass: 'guided-journey-backdrop',
            backgroundColor: 'rgba(0,0,0,0.8)',
            escapeKeyCloses: true,
            onDismiss: false // Function callback
        },
        controlElements: {
            dismiss: {
                styleClass: 'guided-journey-control-dismiss',
                displayLabel: 'Close',
                onActivate: false // Function callback
            },
            previous: {
                styleClass: 'guided-journey-control-previous',
                displayLabel: '&#10094;',
                onActivate: false // Function callback
            },
            next: {
                styleClass: 'guided-journey-control-next',
                displayLabel: '&#10095;',
                onActivate: false // Function callback
            }
        },
        componentStyleClasses: {
            arrowShapes: {
                above: "journey-arrow-above",
                right: "journey-arrow-right",
                below: "journey-arrow-below",
                left: "journey-arrow-left"
            },
            contentParts: {
                controlsContainer: "guided-journey-controls",
                itemDisplayArea: "guided-journey-item-display",
                textDisplay: "guided-journey-text-display",
                tooltipPanel: "guided-journey-tooltip-panel"
            }
        },
        dataLabels: {
            stepOrder: "data-journey-order",
            previousPosition: "data-journey-prev-pos",
            previousZIndex: "data-journey-prev-zindex",
            tooltipContent: "data-journey-tip"
        },
        onJourneyStart: false, // Function callback
        mainContainerId: "guided-journey-main-container"
    };

    // Utility for deep merging objects, without using jQuery.extend
    function deepMergeObjects(target, source) {
        const output = Object.assign({}, target);
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, {
                            [key]: source[key]
                        });
                    } else {
                        output[key] = deepMergeObjects(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, {
                        [key]: source[key]
                    });
                }
            });
        }
        return output;
    }

    class GuidedJourneyEngine {
        constructor(initialSelectorString, userConfiguration) {
            this.journeyConfiguration = deepMergeObjects(defaultJourneyConfigurationParameters, userConfiguration);
            this.journeyConfiguration.targetIdentifier = initialSelectorString.replace('.', '').replace('#', '');

            this.currentStepPosition = 0;
            this.allCandidateElements = []; // All matching elements before filtering/ordering
            this.orderedDisplayElements = []; // Elements actively participating in the tour
            this.mainJourneyContainerElement = null;
            this.uiElementsCache = {}; // Cache for frequently accessed DOM elements
            this.originalElementStyles = new Map(); // Stores original styles of elements modified during the tour
            this.highlightedElement = null; // The DOM element currently being highlighted
            this.styleTransitionTimer = null; // For delayed style updates
            this.scrollAnimationId = null; // For smooth scroll animation frame
            
            // Bound event handlers for proper `this` context and easy removal
            this.keyInputHandler = this.handleKeyboardInput.bind(this);
            this.viewportResizeHandler = this.repositionCurrentStep.bind(this);
            this.containerInteractionHandler = this.handleContainerClick.bind(this);

            this.initialQueryString = initialSelectorString;
        }

        commenceGuidance() {
            if (window.innerHeight <= this.journeyConfiguration.journeySettings.minimumViewportHeight) {
                console.warn(`Guided Journey cannot begin. Minimum viewport height of ${this.journeyConfiguration.journeySettings.minimumViewportHeight}px is required.`);
                return;
            }

            this.gatherAndSequenceElements();

            if (this.orderedDisplayElements.length === 0) {
                console.warn('No valid elements found to participate in the Guided Journey.');
                return;
            }

            this.removeExistingJourneyUI();
            this.constructJourneyUI();
            this.attachGlobalEventListeners();

            this.displayJourneyStep(this.currentStepPosition);

            // Animate main container visibility using CSS transitions
            this.mainJourneyContainerElement.style.opacity = '0';
            this.mainJourneyContainerElement.style.display = 'block';
            requestAnimationFrame(() => {
                this.mainJourneyContainerElement.style.transition = `opacity ${this.journeyConfiguration.journeySettings.animationDuration}s ease-in-out`;
                this.mainJourneyContainerElement.style.opacity = '1';
            });

            if (typeof this.journeyConfiguration.onJourneyStart === 'function') {
                this.journeyConfiguration.onJourneyStart();
            }
        }

        gatherAndSequenceElements() {
            const allCandidates = document.querySelectorAll(this.initialQueryString);
            const validTourElements = [];
            let hasExplicitOrder = false;

            allCandidates.forEach(element => {
                const hasRequiredClass = element.classList.contains(this.journeyConfiguration.targetIdentifier);
                const hasContentAttribute = element.hasAttribute(this.journeyConfiguration.dataLabels.tooltipContent);
                const hasOrderAttribute = element.hasAttribute(this.journeyConfiguration.dataLabels.stepOrder);

                if (hasRequiredClass && hasContentAttribute) {
                    validTourElements.push(element);
                    if (hasOrderAttribute) {
                        hasExplicitOrder = true;
                    }
                }
            });

            if (hasExplicitOrder) {
                // If any element has an order attribute, sort all valid elements by it
                this.orderedDisplayElements = validTourElements
                    .filter(el => el.hasAttribute(this.journeyConfiguration.dataLabels.stepOrder))
                    .sort((a, b) => {
                        const orderA = parseInt(a.getAttribute(this.journeyConfiguration.dataLabels.stepOrder), 10);
                        const orderB = parseInt(b.getAttribute(this.journeyConfiguration.dataLabels.stepOrder), 10);
                        return orderA - orderB;
                    });
            } else {
                // Otherwise, use the natural DOM order of valid elements
                this.orderedDisplayElements = validTourElements;
            }

            this.allCandidateElements = validTourElements; // Keep a reference to all collected elements
        }

        removeExistingJourneyUI() {
            const existingElement = document.getElementById(this.journeyConfiguration.mainContainerId);
            if (existingElement) {
                existingElement.remove();
            }
        }

        constructJourneyUI() {
            const config = this.journeyConfiguration;
            const containerDiv = document.createElement('div');
            containerDiv.id = config.mainContainerId;
            containerDiv.className = config.mainContainerId; // Mimic original's behavior of adding ID as class
            containerDiv.style.display = 'none'; // Keep hidden initially

            const backdropDiv = document.createElement('div');
            backdropDiv.className = config.backdropSettings.styleClass;
            backdropDiv.style.position = 'fixed';
            backdropDiv.style.left = '0px';
            backdropDiv.style.top = '0px';
            backdropDiv.style.right = '0px';
            backdropDiv.style.bottom = '0px';
            backdropDiv.style.backgroundColor = config.backdropSettings.backgroundColor;

            const contentWrapperDiv = document.createElement('div');
            contentWrapperDiv.className = config.componentStyleClasses.contentParts.itemDisplayArea;
            contentWrapperDiv.style.position = 'absolute';
            contentWrapperDiv.style.left = '0px';
            contentWrapperDiv.style.top = '0px';
            contentWrapperDiv.style.right = '0px';
            contentWrapperDiv.style.bottom = '0px';

            const tooltipPanelDiv = document.createElement('div');
            tooltipPanelDiv.className = config.componentStyleClasses.contentParts.tooltipPanel;

            const textContentDiv = document.createElement('div');
            textContentDiv.className = config.componentStyleClasses.contentParts.textDisplay;

            const controlsSectionDiv = document.createElement('div');
            controlsSectionDiv.className = config.componentStyleClasses.contentParts.controlsContainer;

            const closeActionLink = document.createElement('a');
            closeActionLink.href = '#';
            closeActionLink.className = config.controlElements.dismiss.styleClass;
            closeActionLink.innerHTML = config.controlElements.dismiss.displayLabel;

            const previousActionLink = document.createElement('a');
            previousActionLink.href = '#';
            previousActionLink.className = config.controlElements.previous.styleClass;
            previousActionLink.innerHTML = config.controlElements.previous.displayLabel;

            const nextActionLink = document.createElement('a');
            nextActionLink.href = '#';
            nextActionLink.className = config.controlElements.next.styleClass;
            nextActionLink.innerHTML = config.controlElements.next.displayLabel;

            // Assemble the UI hierarchy
            controlsSectionDiv.append(closeActionLink, previousActionLink, nextActionLink);
            tooltipPanelDiv.append(textContentDiv, controlsSectionDiv);
            contentWrapperDiv.append(tooltipPanelDiv);
            containerDiv.append(backdropDiv, contentWrapperDiv);
            document.body.append(containerDiv);

            this.mainJourneyContainerElement = containerDiv;
            this.uiElementsCache = {
                backdrop: backdropDiv,
                contentHolder: contentWrapperDiv,
                tooltipPanel: tooltipPanelDiv,
                textDisplay: textContentDiv,
                controlsSection: controlsSectionDiv,
                dismissButton: closeActionLink,
                previousButton: previousActionLink,
                nextButton: nextActionLink
            };
        }

        attachGlobalEventListeners() {
            const cache = this.uiElementsCache;
            const config = this.journeyConfiguration;

            if (config.journeySettings.keyboardNavigationEnabled || config.backdropSettings.escapeKeyCloses) {
                document.addEventListener('keyup', this.keyInputHandler);
            }

            cache.dismissButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (typeof config.controlElements.dismiss.onActivate === 'function') {
                    if (config.controlElements.dismiss.onActivate()) { // If callback returns true, proceed to close
                        this.endGuidance();
                    }
                } else {
                    this.endGuidance();
                }
            });

            cache.previousButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.navigatePrevious();
            });

            cache.nextButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.navigateNext();
            });

            cache.backdrop.addEventListener('click', this.containerInteractionHandler);
            window.addEventListener('resize', this.viewportResizeHandler);
        }

        detachGlobalEventListeners() {
            document.removeEventListener('keyup', this.keyInputHandler);
            this.uiElementsCache.dismissButton.removeEventListener('click', this.containerInteractionHandler);
            this.uiElementsCache.previousButton.removeEventListener('click', this.containerInteractionHandler);
            this.uiElementsCache.nextButton.removeEventListener('click', this.containerInteractionHandler);
            this.uiElementsCache.backdrop.removeEventListener('click', this.containerInteractionHandler);
            window.removeEventListener('resize', this.viewportResizeHandler);
        }

        handleKeyboardInput(event) {
            const config = this.journeyConfiguration;
            if (config.journeySettings.keyboardNavigationEnabled) {
                if (event.key === 'ArrowLeft') {
                    this.navigatePrevious();
                } else if (event.key === 'ArrowRight') {
                    this.navigateNext();
                }
            }
            if (config.backdropSettings.escapeKeyCloses && event.key === 'Escape') {
                if (typeof config.backdropSettings.onDismiss === 'function') {
                    config.backdropSettings.onDismiss();
                }
                this.endGuidance();
            }
        }

        handleContainerClick(event) {
            const config = this.journeyConfiguration;
            if (event.target === this.uiElementsCache.backdrop) {
                if (typeof config.backdropSettings.onDismiss === 'function') {
                    config.backdropSettings.onDismiss();
                }
                this.endGuidance();
            }
        }

        displayJourneyStep(index) {
            if (index < 0 || index >= this.orderedDisplayElements.length) {
                return; // Invalid step index
            }

            // Reset styles of the previously highlighted element
            if (this.highlightedElement && this.originalElementStyles.has(this.highlightedElement)) {
                const original = this.originalElementStyles.get(this.highlightedElement);
                this.highlightedElement.style.zIndex = original.zIndex;
                this.highlightedElement.style.position = original.position;
                this.highlightedElement.removeAttribute(this.journeyConfiguration.dataLabels.previousZIndex);
                this.highlightedElement.removeAttribute(this.journeyConfiguration.dataLabels.previousPosition);
                this.highlightedElement.style.opacity = ''; // Reset any applied opacity
                this.highlightedElement.style.transition = ''; // Reset any applied transition
                this.originalElementStyles.delete(this.highlightedElement); // Clean up map
            }

            this.currentStepPosition = index;
            this.highlightedElement = this.orderedDisplayElements[this.currentStepPosition];

            if (!this.highlightedElement) {
                return;
            }

            const config = this.journeyConfiguration;
            const cache = this.uiElementsCache;
            const transitionDelayMs = config.journeySettings.animationDuration * 1000;

            // Store original styles and apply new ones for the highlighted element
            const elementComputedStyle = window.getComputedStyle(this.highlightedElement);
            const currentZIndex = elementComputedStyle.zIndex;
            const currentPosition = elementComputedStyle.position;

            this.originalElementStyles.set(this.highlightedElement, {
                zIndex: currentZIndex,
                position: currentPosition
            });

            this.highlightedElement.setAttribute(config.dataLabels.previousZIndex, currentZIndex);
            this.highlightedElement.setAttribute(config.dataLabels.previousPosition, currentPosition);

            // Temporarily adjust fixed-position elements to absolute to prevent z-index issues
            document.querySelectorAll('*').forEach(el => {
                const elStyle = window.getComputedStyle(el);
                if (elStyle.position === 'fixed' && !el.hasAttribute(config.dataLabels.previousPosition)) {
                    el.setAttribute(config.dataLabels.previousPosition, 'fixed');
                    el.style.position = 'absolute';
                }
            });

            // Apply z-index and position updates with a slight delay
            if (this.styleTransitionTimer) {
                clearTimeout(this.styleTransitionTimer);
            }
            this.styleTransitionTimer = setTimeout(() => {
                this.highlightedElement.style.zIndex = '2147483637'; // Maximum z-index to ensure visibility
                if (currentPosition === 'static') {
                    this.highlightedElement.style.position = 'relative'; // Make z-index effective if static
                }
                // Fade in the element itself
                this.highlightedElement.style.opacity = '0';
                this.highlightedElement.style.transition = `opacity ${config.journeySettings.animationDuration / 2}s ease-in-out`;
                requestAnimationFrame(() => {
                    this.highlightedElement.style.opacity = '1';
                });

            }, transitionDelayMs * 0.75); // Delay for element to settle before z-index/opacity

            // Update tooltip text content
            cache.textDisplay.innerHTML = this.highlightedElement.getAttribute(config.dataLabels.tooltipContent);

            // Recalculate and apply positioning for the current step's tooltip
            this.repositionCurrentStep();

            this.updateControlDisplay();
        }

        repositionCurrentStep() {
            if (!this.highlightedElement || !this.mainJourneyContainerElement) {
                return;
            }

            const config = this.journeyConfiguration;
            const cache = this.uiElementsCache;
            const spacing = parseInt(config.journeySettings.spacingValue.replace('px', ''), 10);

            const elementBoundaries = this.highlightedElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Position the main container (which holds the tooltip and provides visual context)
            const containerTop = elementBoundaries.top + window.scrollY - (spacing / 2);
            const containerLeft = elementBoundaries.left + window.scrollX - (spacing / 2);
            const containerWidth = elementBoundaries.width + spacing;
            const containerHeight = elementBoundaries.height + spacing;

            this.mainJourneyContainerElement.style.top = `${containerTop}px`;
            this.mainJourneyContainerElement.style.left = `${containerLeft}px`;
            this.mainJourneyContainerElement.style.width = `${containerWidth}px`;
            this.mainJourneyContainerElement.style.height = `${containerHeight}px`;

            // Reset and prepare tooltip for repositioning
            const tooltipPanel = cache.tooltipPanel;
            tooltipPanel.style.left = '';
            tooltipPanel.style.right = '';
            tooltipPanel.style.marginLeft = '';
            tooltipPanel.style.marginRight = '';
            tooltipPanel.className = config.componentStyleClasses.contentParts.tooltipPanel; // Reset existing arrow classes

            const currentTooltipRect = tooltipPanel.getBoundingClientRect(); // Get tooltip dimensions after reset

            // Determine vertical positioning (above or below)
            const spaceAboveElement = elementBoundaries.top;
            const spaceBelowElement = viewportHeight - elementBoundaries.bottom;

            if (spaceBelowElement < currentTooltipRect.height + 40 && spaceAboveElement > currentTooltipRect.height + 40) {
                // Not enough space below, but enough above
                tooltipPanel.classList.add(config.componentStyleClasses.arrowShapes.below);
                tooltipPanel.style.top = `-${currentTooltipRect.height + 20}px`;
                if (config.journeySettings.autoScrollEnabled) {
                    this.smoothScrollTo(window.scrollY + elementBoundaries.top - currentTooltipRect.height - 40);
                }
            } else {
                // Default to below, or if not enough space above either
                tooltipPanel.classList.add(config.componentStyleClasses.arrowShapes.above);
                tooltipPanel.style.top = `${elementBoundaries.height + spacing - 20}px`;
                if (config.journeySettings.autoScrollEnabled) {
                    this.smoothScrollTo(window.scrollY + elementBoundaries.top - 20);
                }
            }

            // Determine horizontal positioning (left, right, or center)
            const spaceToLeft = elementBoundaries.left;
            const spaceToRight = viewportWidth - elementBoundaries.right;

            if (spaceToLeft < 100 && spaceToRight > 100) {
                // Not much space on the left, align tooltip to left edge
                tooltipPanel.classList.add(config.componentStyleClasses.arrowShapes.left);
                tooltipPanel.style.left = '0px';
                tooltipPanel.style.right = 'auto';
                tooltipPanel.style.marginLeft = 'inherit';
            } else if (spaceToRight < 100 && spaceToLeft > 100) {
                // Not much space on the right, align tooltip to right edge
                tooltipPanel.classList.add(config.componentStyleClasses.arrowShapes.right);
                tooltipPanel.style.left = 'auto';
                tooltipPanel.style.right = '0px';
                tooltipPanel.style.marginRight = 'inherit';
            } else {
                // Center the tooltip horizontally
                tooltipPanel.style.left = '50%';
                tooltipPanel.style.right = 'auto';
                tooltipPanel.style.marginLeft = `-${tooltipPanel.offsetWidth / 2}px`;
            }
        }

        smoothScrollTo(destinationY) {
            if (this.scrollAnimationId) {
                cancelAnimationFrame(this.scrollAnimationId);
            }

            const startY = window.scrollY;
            const travelDistance = destinationY - startY;
            const animationDuration = 500; // milliseconds
            let animationStartTime = null;

            const animateScroll = (currentTime) => {
                if (!animationStartTime) animationStartTime = currentTime;
                const elapsedProgress = (currentTime - animationStartTime) / animationDuration;
                const easingFunction = elapsedProgress < 0.5 ? 2 * elapsedProgress * elapsedProgress : 1 - Math.pow(-2 * elapsedProgress + 2, 2) / 2; // Ease-in-out quadratic

                window.scrollTo(0, startY + travelDistance * easingFunction);

                if (elapsedProgress < 1) {
                    this.scrollAnimationId = requestAnimationFrame(animateScroll);
                } else {
                    this.scrollAnimationId = null;
                }
            };
            this.scrollAnimationId = requestAnimationFrame(animateScroll);
        }

        updateControlDisplay() {
            const cache = this.uiElementsCache;
            const totalSteps = this.orderedDisplayElements.length;

            if (this.currentStepPosition === 0) {
                cache.previousButton.style.display = 'none';
            } else {
                cache.previousButton.style.display = 'inline-block';
            }

            if (this.currentStepPosition === totalSteps - 1) {
                cache.nextButton.style.display = 'none';
            } else {
                cache.nextButton.style.display = 'inline-block';
            }
        }

        navigatePrevious() {
            if (this.currentStepPosition > 0) {
                this.currentStepPosition--;
                this.displayJourneyStep(this.currentStepPosition);
                if (typeof this.journeyConfiguration.controlElements.previous.onActivate === 'function') {
                    this.journeyConfiguration.controlElements.previous.onActivate(this.currentStepPosition, this.orderedDisplayElements);
                }
            }
        }

        navigateNext() {
            if (this.currentStepPosition < this.orderedDisplayElements.length - 1) {
                this.currentStepPosition++;
                this.displayJourneyStep(this.currentStepPosition);
                if (typeof this.journeyConfiguration.controlElements.next.onActivate === 'function') {
                    this.journeyConfiguration.controlElements.next.onActivate(this.currentStepPosition, this.orderedDisplayElements);
                }
            }
        }

        endGuidance() {
            if (this.styleTransitionTimer) {
                clearTimeout(this.styleTransitionTimer);
            }
            if (this.scrollAnimationId) {
                cancelAnimationFrame(this.scrollAnimationId);
            }

            // Fade out the main journey container
            if (this.mainJourneyContainerElement) {
                this.mainJourneyContainerElement.style.opacity = '0';
                this.mainJourneyContainerElement.style.transition = `opacity ${this.journeyConfiguration.journeySettings.animationDuration}s ease-in-out`;

                // After fade-out, clean up DOM and reset styles
                setTimeout(() => {
                    if (this.mainJourneyContainerElement) {
                        this.mainJourneyContainerElement.remove();
                        this.mainJourneyContainerElement = null;
                    }

                    // Restore original styles for all elements that were modified
                    this.originalElementStyles.forEach((original, element) => {
                        element.style.zIndex = original.zIndex;
                        element.style.position = original.position;
                        element.removeAttribute(this.journeyConfiguration.dataLabels.previousZIndex);
                        element.removeAttribute(this.journeyConfiguration.dataLabels.previousPosition);
                        element.style.opacity = '';
                        element.style.transition = '';
                    });
                    this.originalElementStyles.clear();

                    // Restore fixed position elements
                    document.querySelectorAll(`[${this.journeyConfiguration.dataLabels.previousPosition}="fixed"]`).forEach(el => {
                        el.style.position = 'fixed';
                        el.removeAttribute(this.journeyConfiguration.dataLabels.previousPosition);
                    });

                    // Reset internal state
                    this.currentStepPosition = 0;
                    this.highlightedElement = null;
                    this.orderedDisplayElements = [];
                    this.allCandidateElements = [];
                    this.uiElementsCache = {};

                    this.detachGlobalEventListeners();

                }, this.journeyConfiguration.journeySettings.animationDuration * 1000);
            }
        }
    }

    // Expose a global function to initiate the guided journey, mimicking a plugin interface
    window.initiateGuidedJourney = function (targetSelector, journeyOptions) {
        if (typeof targetSelector !== 'string' || !targetSelector.trim()) {
            console.error('initiateGuidedJourney: A valid CSS selector string is required to start the journey.');
            return;
        }
        const journeyInstance = new GuidedJourneyEngine(targetSelector, journeyOptions);
        journeyInstance.commenceGuidance();
        return journeyInstance; // Return the instance for potential external control
    };

})();