(function() {
    const GLOBAL_WINDOW_REFERENCE = window;
    const DOCUMENT_REFERENCE = document;

    // Helper for applying styles with vendor prefixes
    function applyStyleProperty(element, property, value) {
        const vendorPrefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
        for (let i = 0; i < vendorPrefixes.length; i++) {
            element.style[vendorPrefixes[i] + property] = value;
        }
    }

    // Helper for retrieving computed style property
    function retrieveComputedStyle(element, property) {
        return GLOBAL_WINDOW_REFERENCE.getComputedStyle(element)[property];
    }

    // Helper for parsing translate3d values
    function extractTransformXValue(transformString) {
        if (transformString === 'none') return 0;
        const match = transformString.match(/translate3d\(([^,]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // Class for managing the carousel functionality
    class DynamicPanelHandler {
        constructor(hostElement, userOptions) {
            this.rootDisplayElement = hostElement;
            this.contentViewport = hostElement.children[0]; // Assumes the direct child is the scrollable wrapper

            this.runtimeData = {
                currentFeedback: {},
                originalPanelData: [], // Stores original panel information
                lazyLoadPanelData: [], // Specific panels marked for lazy loading
                transitionTimers: {},
                resizeTimers: {},
                actionDelayTimers: {},

                initialInteractionPoint: {},
                previousInteractionPoint: {},
                currentInteractionPoint: {},
                pageVerticalOffset: 0,
                isActivelyDragging: false,
                currentTransformOffset: 0,
                dragDisplacementValue: 0,
            };

            this.operationalParameters = Object.assign({}, DynamicPanelHandler.defaultConfiguration, userOptions);

            this.initializeCoreSystem();
        }

        static defaultConfiguration = {
            activeItemClass: 'active-item',
            swipeDragThreshold: 0.2, // Percentage of container width
            revertOnNoSwipe: true,
            motionDuration: 400,
            motionEasing: 'ease-in-out',
            autoAdvancePanels: false,
            autoAdvanceInterval: 5000,
            windowResizeDebounce: 250,
            transformStyle: 'transform', // Can be 'transform' or 'margin-left' for older browsers
            // Custom hooks (placeholders)
            onPanelMotionStart: () => {},
            onPanelMotionComplete: () => {},
            onSystemInitialized: () => {},
            onContentLoaded: () => {},
            // Navigation controls (DOM references)
            nextPanelControl: null,
            previousPanelControl: null,
            panelIndicators: null,
            // Internal environment flags
            browserAgent: '',
            isMobileDevice: false,
        };

        // --- Core System Initialization ---
        initializeCoreSystem() {
            this.rootDisplayElement.dataset.panelPilotId = DynamicPanelHandler.instanceCount++; // Assign unique ID
            this.rootDisplayElement.dataset.panelPilot = 'active'; // Mark as initialized

            this.detectOperatingEnvironment();
            this.extractOriginalPanelContent();

            if (this.runtimeData.originalPanelData.length <= 1) {
                // If only one panel, just set it as active and trigger callbacks
                if (this.contentViewport.children.length > 0) {
                    this.contentViewport.children[0].classList.add(this.operationalParameters.activeItemClass);
                }
                this.triggerSystemHook(this.operationalParameters.onSystemInitialized, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);
                this.triggerSystemHook(this.operationalParameters.onContentLoaded, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);
                return;
            }

            this.replicatePanelContentForLoop(); // Create multiple copies for seamless looping
            this.updateViewportTotalWidth(); // Set initial width of wrapper
            this.adjustCurrentFocus(1); // Set initial focal panel (first original panel)
            this.positionVisualElements(); // Position instantly

            this.attachEventListeners();
            this.beginAutoAdvancement();

            this.triggerSystemHook(this.operationalParameters.onSystemInitialized, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);
            this.triggerSystemHook(this.operationalParameters.onContentLoaded, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);
        }

        // --- Environment Detection ---
        detectOperatingEnvironment() {
            const userAgentString = navigator.userAgent;
            this.operationalParameters.browserAgent = userAgentString;
            this.operationalParameters.isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgentString);
            // Basic check for older IE to use margin-left
            if (userAgentString.indexOf('MSIE 6') > -1 || userAgentString.indexOf('MSIE 7') > -1 || userAgentString.indexOf('MSIE 8') > -1 || userAgentString.indexOf('MSIE 9') > -1) {
                this.operationalParameters.transformStyle = 'margin-left';
            }
        }

        // --- Panel Content Extraction ---
        extractOriginalPanelContent() {
            Array.from(this.contentViewport.children).forEach((childElement, index) => {
                const panelInfo = {
                    originalNode: childElement, // Reference to the original DOM node
                    panelOrdinal: index + 1,
                    elementIdentifier: childElement.id,
                    displayClass: childElement.className.split(' ')[0], // First class name
                    innerMarkup: childElement.innerHTML
                };
                this.runtimeData.originalPanelData.push(panelInfo);

                if (childElement.querySelector('.sldr-load')) { // Using original class name for detection
                    this.runtimeData.lazyLoadPanelData.push(panelInfo);
                }
            });

            // Clear original content from viewport, will be replaced by replicated content
            this.contentViewport.innerHTML = '';
        }

        // --- Replicate Panel Content for Infinite Loop ---
        replicatePanelContentForLoop() {
            const originalPanelCount = this.runtimeData.originalPanelData.length;
            const replicationFactor = 5; // How many times to repeat the original set of panels

            for (let r = 0; r < replicationFactor; r++) {
                this.runtimeData.originalPanelData.forEach(panelInformation => {
                    const clonedElement = DOCUMENT_REFERENCE.createElement('div');
                    clonedElement.innerHTML = panelInformation.innerMarkup;
                    clonedElement.className = panelInformation.displayClass; // Re-apply original class
                    if (panelInformation.elementIdentifier) clonedElement.id = `${panelInformation.elementIdentifier}-clone-${r}`; // Ensure unique ID for clones
                    this.contentViewport.appendChild(clonedElement);
                });
            }
        }

        // --- Update Viewport Total Width (wrapper width) ---
        updateViewportTotalWidth() {
            const totalWidth = Array.from(this.contentViewport.children).reduce((accumulator, el) => accumulator + el.offsetWidth, 0);
            this.contentViewport.style.width = `${totalWidth}px`;
        }

        // --- Event Listener Attachment ---
        attachEventListeners() {
            // Window resize handler
            GLOBAL_WINDOW_REFERENCE.addEventListener('resize', this.debounceWindowResize.bind(this));

            // Navigation control handlers
            if (this.operationalParameters.nextPanelControl) {
                this.operationalParameters.nextPanelControl.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePanelNavigation('next');
                });
                this.manageAutoAdvanceInteractions(this.operationalParameters.nextPanelControl);
            }
            if (this.operationalParameters.previousPanelControl) {
                this.operationalParameters.previousPanelControl.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePanelNavigation('prev');
                });
                this.manageAutoAdvanceInteractions(this.operationalParameters.previousPanelControl);
            }
            if (this.operationalParameters.panelIndicators) {
                Array.from(this.operationalParameters.panelIndicators.children).forEach((indicatorElement, index) => {
                    indicatorElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        Array.from(this.operationalParameters.panelIndicators.children).forEach(el => el.classList.remove(this.operationalParameters.activeItemClass));
                        indicatorElement.classList.add(this.operationalParameters.activeItemClass);
                        this.handlePanelNavigation(index + 1, 'indicator');
                    });
                    this.manageAutoAdvanceInteractions(indicatorElement);
                });
                this.operationalParameters.panelIndicators.children[0].classList.add(this.operationalParameters.activeItemClass);
            }

            // Swipe/Drag handlers
            if (this.operationalParameters.swipeDragThreshold > 0 || this.operationalParameters.isMobileDevice) {
                this.contentViewport.addEventListener('mousemove', this.handlePointerMovement.bind(this));
                this.contentViewport.addEventListener('touchmove', this.handlePointerMovement.bind(this));
                this.contentViewport.addEventListener('mousedown', this.handlePointerDown.bind(this));
                this.contentViewport.addEventListener('touchstart', this.handlePointerDown.bind(this));
                this.contentViewport.addEventListener('mouseup', this.handlePointerUp.bind(this));
                this.contentViewport.addEventListener('touchend', this.handlePointerUp.bind(this));
            }
        }

        manageAutoAdvanceInteractions(element) {
            if (this.operationalParameters.autoAdvancePanels) {
                element.addEventListener('mouseenter', this.suspendAutoAdvancement.bind(this));
                element.addEventListener('mouseleave', this.beginAutoAdvancement.bind(this));
            }
        }

        // --- Panel Navigation Logic ---
        handlePanelNavigation(targetIdentifier, navigationMethod = 'default') {
            this.suspendAutoAdvancement();
            let desiredPanelNumber;
            if (typeof targetIdentifier === 'number') {
                desiredPanelNumber = targetIdentifier;
            } else if (targetIdentifier === 'next') {
                desiredPanelNumber = this.runtimeData.currentFeedback.nextOriginalPanelNumber;
            } else if (targetIdentifier === 'prev') {
                desiredPanelNumber = this.runtimeData.currentFeedback.previousOriginalPanelNumber;
            }

            const motionDetails = this.adjustCurrentFocus(desiredPanelNumber, navigationMethod);
            if (motionDetails) {
                this.initiatePanelMotion(motionDetails);
            }
            this.beginAutoAdvancement();
        }

        // --- Adjust Current Focus (core logic for determining new panel) ---
        adjustCurrentFocus(requestedPanelNumber, method = 'default') {
            const totalOriginalPanels = this.runtimeData.originalPanelData.length;
            if (!this.runtimeData.originalPanelData[requestedPanelNumber - 1]) return; // Invalid panel number

            this.triggerSystemHook(this.operationalParameters.onPanelMotionStart, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);

            const allVisiblePanels = Array.from(this.contentViewport.children);
            const currentActivePanel = this.contentViewport.querySelector(`.${this.operationalParameters.activeItemClass}`);
            const currentActivePanelDOMIndex = currentActivePanel ? allVisiblePanels.indexOf(currentActivePanel) : -1;

            const targetPanelInfo = this.runtimeData.originalPanelData[requestedPanelNumber - 1];
            const targetPanelClass = targetPanelInfo.displayClass;

            // If already on the requested panel, do nothing
            if (currentActivePanel && currentActivePanel.classList.contains(targetPanelClass)) {
                return false;
            }

            let nextFocalPanelDOMIndex = -1;

            // Find the closest DOM element matching the target class
            const matchingElements = allVisiblePanels.filter(el => el.classList.contains(targetPanelClass));
            if (matchingElements.length > 0) {
                // Find the closest one to the current focal point
                const distances = matchingElements.map(el => Math.abs(allVisiblePanels.indexOf(el) - currentActivePanelDOMIndex));
                const minDistance = Math.min(...distances);
                const closestMatchIndex = distances.indexOf(minDistance);
                nextFocalPanelDOMIndex = allVisiblePanels.indexOf(matchingElements[closestMatchIndex]);

                // If multiple matches at same distance, prioritize based on method
                if (distances.filter(d => d === minDistance).length > 1) {
                    const candidateElements = matchingElements.filter((el, i) => Math.abs(allVisiblePanels.indexOf(el) - currentActivePanelDOMIndex) === minDistance);
                    if (method === 'prev') {
                        // Pick the one to the left (smaller index)
                        const leftCandidate = candidateElements.find(el => allVisiblePanels.indexOf(el) < currentActivePanelDOMIndex);
                        nextFocalPanelDOMIndex = leftCandidate ? allVisiblePanels.indexOf(leftCandidate) : allVisiblePanels.indexOf(candidateElements[candidateElements.length - 1]); // Fallback to last if no left
                    } else {
                        // Pick the one to the right (larger index)
                        const rightCandidate = candidateElements.find(el => allVisiblePanels.indexOf(el) > currentActivePanelDOMIndex);
                        nextFocalPanelDOMIndex = rightCandidate ? allVisiblePanels.indexOf(rightCandidate) : allVisiblePanels.indexOf(candidateElements[0]); // Fallback to first if no right
                    }
                }
            }

            if (nextFocalPanelDOMIndex === -1) {
                console.warn('Target panel element not found in viewport.');
                return false;
            }

            const nextActivePanelElement = allVisiblePanels[nextFocalPanelDOMIndex];
            allVisiblePanels.forEach(el => el.classList.remove(this.operationalParameters.activeItemClass));
            nextActivePanelElement.classList.add(this.operationalParameters.activeItemClass);

            // Calculate current visual offset
            let currentTransform = extractTransformXValue(retrieveComputedStyle(this.contentViewport, this.operationalParameters.transformStyle));

            // Calculate the target position for the new focal element
            let targetOffsetFromLeftEdge = 0;
            for (let i = 0; i < nextFocalPanelDOMIndex; i++) {
                targetOffsetFromLeftEdge += allVisiblePanels[i].offsetWidth;
            }
            const targetTransformPosition = this.rootDisplayElement.offsetWidth / 2 - targetOffsetFromLeftEdge - (nextActivePanelElement.offsetWidth / 2);

            // Check if we need to "snap" the wrapper to an equivalent position to maintain infinite scroll illusion
            const originalPanelCount = this.runtimeData.originalPanelData.length;
            const singleOriginalBlockWidth = this.runtimeData.originalPanelData.reduce((acc, panel) => acc + panel.originalNode.offsetWidth, 0);
            const numberOfBlocks = Math.floor(allVisiblePanels.length / originalPanelCount);

            const currentBlockIndex = Math.floor(nextFocalPanelDOMIndex / originalPanelCount);
            const centralBlockOffset = Math.floor(numberOfBlocks / 2);

            let requiresInstantJump = false;
            let instantaneousShiftAmount = 0;

            if (currentBlockIndex !== centralBlockOffset) {
                 requiresInstantJump = true;
                 instantaneousShiftAmount = (currentBlockIndex - centralBlockOffset) * singleOriginalBlockWidth;
            }

            // Apply instantaneous shift if needed
            if (requiresInstantJump) {
                this.contentViewport.style.transition = 'none'; // Disable transition for instant jump
                const newTransformValueForJump = currentTransform + instantaneousShiftAmount;
                applyStyleProperty(this.contentViewport, this.operationalParameters.transformStyle, `translate3d(${newTransformValueForJump}px, 0, 0)`);
                // Update currentTransform for the animation calculation
                currentTransform = newTransformValueForJump;
            }

            // Update feedback object
            const nextOriginalPanelNum = (requestedPanelNumber % totalOriginalPanels) + 1;
            const previousOriginalPanelNum = (requestedPanelNumber - 2 + totalOriginalPanels) % totalOriginalPanels + 1;

            this.runtimeData.currentFeedback = {
                displayHost: this.rootDisplayElement,
                previousOriginalPanelNumber: previousOriginalPanelNum,
                currentOriginalPanelNumber: requestedPanelNumber,
                currentActivePanelClasses: nextActivePanelElement.className,
                currentActivePanelId: nextActivePanelElement.id,
                currentFocalPointTranslateX: targetTransformPosition,
                animationMovementAmount: targetTransformPosition - currentTransform,
                nextOriginalPanelNumber: nextOriginalPanelNum
            };

            // Update indicator navigation
            if (this.operationalParameters.panelIndicators) {
                Array.from(this.operationalParameters.panelIndicators.children).forEach(el => el.classList.remove(this.operationalParameters.activeItemClass));
                this.operationalParameters.panelIndicators.children[requestedPanelNumber - 1].classList.add(this.operationalParameters.activeItemClass);
            }

            return {
                targetPosition: targetTransformPosition,
                animationDelta: targetTransformPosition - currentTransform,
                instantaneousJump: requiresInstantJump,
                instantaneousOffset: instantaneousShiftAmount
            };
        }

        // --- Initiate Panel Motion (animated move) ---
        initiatePanelMotion(motionSpecifications) {
            if (!motionSpecifications) return;

            // Re-enable transition if it was temporarily disabled for a jump
            if (motionSpecifications.instantaneousJump) {
                 // Force browser reflow to ensure 'none' transition is applied before re-enabling
                 this.contentViewport.offsetWidth;
                 this.contentViewport.style.transition = `${this.operationalParameters.transformStyle} ${this.operationalParameters.motionDuration}ms ${this.operationalParameters.motionEasing}`;
            }

            clearTimeout(this.runtimeData.actionDelayTimers[this.rootDisplayElement.dataset.panelPilotId]); // Clear previous delays

            this.runtimeData.actionDelayTimers[this.rootDisplayElement.dataset.panelPilotId] = setTimeout(() => {
                if (this.operationalParameters.transformStyle === 'margin-left') {
                    // Fallback for older browsers (no CSS transform)
                    this.contentViewport.style.marginLeft = `${motionSpecifications.targetPosition}px`;
                    this.completePanelMotion();
                } else {
                    applyStyleProperty(this.contentViewport, this.operationalParameters.transformStyle, `translate3d(${motionSpecifications.targetPosition}px, 0, 0)`);
                    // Listen for transition end to trigger completion callback
                    const onTransitionEnd = () => {
                        this.contentViewport.removeEventListener('transitionend', onTransitionEnd);
                        this.completePanelMotion();
                    };
                    this.contentViewport.addEventListener('transitionend', onTransitionEnd);
                }
            }, 100); // Small delay to allow DOM updates/reflow
        }

        // --- Position Visual Elements (instant move) ---
        positionVisualElements(motionSpecifications) {
            // This function is for instant positioning, typically on resize or initial load.
            // It applies the position without transitions.
            if (!motionSpecifications) {
                // If no specific motion details, calculate for the current active panel
                const currentActivePanel = this.contentViewport.querySelector(`.${this.operationalParameters.activeItemClass}`);
                if (!currentActivePanel) return;

                const allVisiblePanels = Array.from(this.contentViewport.children);
                const currentActivePanelDOMIndex = allVisiblePanels.indexOf(currentActivePanel);

                let targetOffsetFromLeftEdge = 0;
                for (let i = 0; i < currentActivePanelDOMIndex; i++) {
                    targetOffsetFromLeftEdge += allVisiblePanels[i].offsetWidth;
                }
                motionSpecifications = {
                    targetPosition: this.rootDisplayElement.offsetWidth / 2 - targetOffsetFromLeftEdge - (currentActivePanel.offsetWidth / 2)
                };
            }

            clearTimeout(this.runtimeData.actionDelayTimers[this.rootDisplayElement.dataset.panelPilotId]);
            this.runtimeData.actionDelayTimers[this.rootDisplayElement.dataset.panelPilotId] = setTimeout(() => {
                this.contentViewport.style.transition = 'none'; // Ensure no transition
                if (this.operationalParameters.transformStyle === 'margin-left') {
                    this.contentViewport.style.marginLeft = `${motionSpecifications.targetPosition}px`;
                } else {
                    applyStyleProperty(this.contentViewport, this.operationalParameters.transformStyle, `translate3d(${motionSpecifications.targetPosition}px, 0, 0)`);
                }
                // Force browser reflow
                this.contentViewport.offsetWidth;
                // Re-enable transition for future animations
                this.contentViewport.style.transition = `${this.operationalParameters.transformStyle} ${this.operationalParameters.motionDuration}ms ${this.operationalParameters.motionEasing}`;
                this.completePanelMotion();
            }, this.operationalParameters.windowResizeDebounce + 1);
        }

        // --- Panel Motion Complete Callback ---
        completePanelMotion() {
            this.triggerSystemHook(this.operationalParameters.onPanelMotionComplete, this.runtimeData.originalPanelData, this.runtimeData.currentFeedback);
        }

        // --- Debounce Window Resize Handling ---
        debounceWindowResize() {
            clearTimeout(this.runtimeData.resizeTimers[this.rootDisplayElement.dataset.panelPilotId]);
            this.suspendAutoAdvancement();
            this.runtimeData.resizeTimers[this.rootDisplayElement.dataset.panelPilotId] = setTimeout(() => {
                this.updateViewportTotalWidth(); // Recalculate total width
                this.positionVisualElements(); // Reposition current panel instantly
                this.beginAutoAdvancement();
            }, this.operationalParameters.windowResizeDebounce);
        }

        // --- Auto Advancement Control ---
        beginAutoAdvancement() {
            if (!this.operationalParameters.autoAdvancePanels) return;
            this.suspendAutoAdvancement(); // Clear any existing timer
            this.runtimeData.transitionTimers[this.rootDisplayElement.dataset.panelPilotId] = setInterval(() => {
                this.handlePanelNavigation('next');
            }, this.operationalParameters.autoAdvanceInterval);
        }

        suspendAutoAdvancement() {
            clearInterval(this.runtimeData.transitionTimers[this.rootDisplayElement.dataset.panelPilotId]);
        }

        // --- Pointer/Touch Events ---
        handlePointerMovement(event) {
            if (!this.runtimeData.isActivelyDragging) return;
            event.preventDefault(); // Prevent scrolling on touch devices
            this.contentViewport.style.transition = 'none'; // Disable transition during drag

            const currentPointerX = event.touches ? event.touches[0].pageX : event.clientX;
            const currentTransform = extractTransformXValue(retrieveComputedStyle(this.contentViewport, this.operationalParameters.transformStyle));

            if (!this.runtimeData.previousInteractionPoint.x) { // First movement after mousedown/touchstart
                 this.runtimeData.previousInteractionPoint = { x: currentPointerX, trans: currentTransform };
            }

            const movementDelta = currentPointerX - this.runtimeData.previousInteractionPoint.x;
            this.runtimeData.currentTransformOffset = currentTransform + movementDelta;
            applyStyleProperty(this.contentViewport, this.operationalParameters.transformStyle, `translate3d(${this.runtimeData.currentTransformOffset}px, 0, 0)`);

            this.runtimeData.previousInteractionPoint.x = currentPointerX; // Update previous for next move event
            this.runtimeData.currentInteractionPoint.x = currentPointerX; // Keep track of current for up event
        }

        handlePointerDown(event) {
            if (this.runtimeData.pageVerticalOffset !== GLOBAL_WINDOW_REFERENCE.pageYOffset) return; // Ignore if page scrolled while dragging

            event.preventDefault();
            this.suspendAutoAdvancement();
            this.runtimeData.isActivelyDragging = true;
            this.contentViewport.style.transition = 'none'; // Ensure no transition on drag start

            const currentTransform = extractTransformXValue(retrieveComputedStyle(this.contentViewport, this.operationalParameters.transformStyle));
            const pointerX = event.touches ? event.touches[0].pageX : event.clientX;
            const pointerY = event.touches ? event.touches[0].pageY : event.clientY;

            this.runtimeData.initialInteractionPoint = { x: pointerX, y: pointerY, trans: currentTransform };
            this.runtimeData.previousInteractionPoint = { x: pointerX, y: pointerY, trans: currentTransform }; // Initialize previous for movement
            this.runtimeData.currentInteractionPoint = { x: pointerX, y: pointerY }; // Initialize current

            this.runtimeData.dragDisplacementValue = 0; // Reset drag displacement
        }

        handlePointerUp(event) {
            if (!this.runtimeData.isActivelyDragging) return;
            if (this.runtimeData.pageVerticalOffset !== GLOBAL_WINDOW_REFERENCE.pageYOffset) return;

            event.preventDefault();
            this.runtimeData.isActivelyDragging = false;
            this.contentViewport.style.transition = `${this.operationalParameters.transformStyle} ${this.operationalParameters.motionDuration}ms ${this.operationalParameters.motionEasing}`; // Re-enable transition

            const finalPointerX = event.changedTouches ? event.changedTouches[0].pageX : event.clientX;
            this.runtimeData.dragDisplacementValue = this.runtimeData.initialInteractionPoint.x - finalPointerX;

            let motionDetails = null;
            const swipeThreshold = this.rootDisplayElement.offsetWidth * this.operationalParameters.swipeDragThreshold;

            if (this.runtimeData.dragDisplacementValue > 0 && this.runtimeData.dragDisplacementValue > swipeThreshold) {
                // Swiped left, go to next panel
                motionDetails = this.adjustCurrentFocus(this.runtimeData.currentFeedback.nextOriginalPanelNumber, 'next');
            } else if (this.runtimeData.dragDisplacementValue < 0 && -(this.runtimeData.dragDisplacementValue) > swipeThreshold) {
                // Swiped right, go to previous panel
                motionDetails = this.adjustCurrentFocus(this.runtimeData.currentFeedback.previousOriginalPanelNumber, 'prev');
            } else if (this.operationalParameters.revertOnNoSwipe) {
                // Snap back to initial drag position
                motionDetails = { targetPosition: this.runtimeData.initialInteractionPoint.trans, animationDelta: 0 };
            }

            if (motionDetails) {
                this.initiatePanelMotion(motionDetails);
            }
            this.beginAutoAdvancement();
        }

        // --- Utility for System Hooks (Callbacks) ---
        triggerSystemHook(hookFunction, panels, data) {
            if (typeof hookFunction === 'function') {
                hookFunction({ panels: panels, feedback: data, configuration: this.operationalParameters });
            }
        }
    }

    // Assign a unique ID to each instance for timer management
    DynamicPanelHandler.instanceCount = 0;

    // Extend the global jQuery object if it exists, otherwise provide a standalone function
    if (typeof jQuery !== 'undefined' && jQuery.fn) {
        jQuery.fn.panelPilot = function(options) {
            return this.each(function() {
                if (!jQuery.data(this, 'panelPilot')) {
                    jQuery.data(this, 'panelPilot', new DynamicPanelHandler(this, options));
                }
            });
        };

        // Expose default options for modification
        jQuery.panelPilot = {
            defaultConfiguration: DynamicPanelHandler.defaultConfiguration
        };
    } else {
        // Standalone implementation if jQuery is not present
        GLOBAL_WINDOW_REFERENCE.initializePanelPilot = function(element, options) {
            if (!element.dataset.panelPilot) {
                new DynamicPanelHandler(element, options);
            }
        };

        GLOBAL_WINDOW_REFERENCE.PanelPilotDefaults = DynamicPanelHandler.defaultConfiguration;
    }

})();