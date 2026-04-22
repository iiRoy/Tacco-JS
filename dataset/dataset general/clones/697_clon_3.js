define(function (require) {

    // Helper utilities (mimicking original framework's T, T.dom, T.page)
    const ElementUtils = {
        // Retrieves an HTML element by ID or CSS selector, or returns the element itself
        fetchElement: function (inputRef) {
            if (typeof inputRef === 'string') {
                const foundById = document.getElementById(inputRef);
                if (foundById) {
                    return foundById;
                }
                // Fallback to querySelector for more general selectors
                return document.querySelector(inputRef);
            }
            return inputRef; // Assume it's already an HTMLElement
        },

        // Collects multiple HTML elements based on a CSS selector
        findManyElements: function (selectorString, searchContext = document) {
            if (!selectorString || typeof selectorString !== 'string') {
                return [];
            }
            return Array.from(searchContext.querySelectorAll(selectorString));
        },

        // Appends a CSS class to an element's class list
        appendCssClass: function (targetElement, className) {
            if (targetElement instanceof HTMLElement && className && typeof className === 'string') {
                targetElement.classList.add(className);
            }
        },

        // Verifies if an element possesses a specific CSS class
        hasSpecificClass: function (targetElement, className) {
            return targetElement instanceof HTMLElement && targetElement.classList.contains(className);
        },

        // Determines if a parent element contains a child element
        encompasses: function (parentEl, childEl) {
            return parentEl instanceof HTMLElement && childEl instanceof HTMLElement && parentEl.contains(childEl);
        },

        // Extracts the original target of a DOM event
        getOriginalEventTarget: function (domEvent) {
            return domEvent.target || domEvent.srcElement;
        },

        // Calculates the absolute position and dimensions of an element
        calculateElementOffset: function (targetEl) {
            if (!(targetEl instanceof HTMLElement)) {
                return { top: 0, left: 0, width: 0, height: 0 };
            }
            const boundingBox = targetEl.getBoundingClientRect();
            const docBody = document.body;
            const docRoot = document.documentElement;

            const currentScrollY = window.pageYOffset || docRoot.scrollTop || docBody.scrollTop;
            const currentScrollX = window.pageXOffset || docRoot.scrollLeft || docBody.scrollLeft;

            const clientBorderTop = docRoot.clientTop || docBody.clientTop || 0;
            const clientBorderLeft = docRoot.clientLeft || docBody.clientLeft || 0;

            const absoluteTop = boundingBox.top + currentScrollY - clientBorderTop;
            const absoluteLeft = boundingBox.left + currentScrollX - clientBorderLeft;

            return {
                top: Math.round(absoluteTop),
                left: Math.round(absoluteLeft),
                width: targetEl.offsetWidth,
                height: targetEl.offsetHeight
            };
        }
    };

    const ViewportMetrics = {
        getCurrentScrollY: function () {
            return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        },
        getCurrentScrollX: function () {
            return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        },
        getVisibleWidth: function () {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },
        getVisibleHeight: function () {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }
    };

    const EventUtilities = {
        // Attaches an event listener to an element
        attachListener: function (element, eventType, handlerFn, useCapture = false) {
            if (element instanceof HTMLElement && eventType && typeof handlerFn === 'function') {
                element.addEventListener(eventType, handlerFn, useCapture);
            }
        },
        // Detaches an event listener from an element
        detachListener: function (element, eventType, handlerFn, useCapture = false) {
            if (element instanceof HTMLElement && eventType && typeof handlerFn === 'function') {
                element.removeEventListener(eventType, handlerFn, useCapture);
            }
        },
        // Simple check to confirm if a value is a string primitive
        isStringValue: function (value) {
            return typeof value === 'string';
        }
    };

    // Mock BaseComponent based on the original structure's implied inheritance from 'Control'
    // This provides a base for configuration and event handling.
    function BaseComponent() {
        this.configSettings = {};
        this.registeredEvents = {};
    }

    BaseComponent.prototype = {
        // Placeholder method to apply configuration settings
        setOptions: function (newOptions) {
            // Simple merge for demonstration; real implementation might be more complex
            Object.assign(this.configSettings, newOptions);
            return this.configSettings;
        },

        // Method to trigger custom events
        triggerEvent: function (eventName, eventPayload) {
            if (this.registeredEvents[eventName]) {
                this.registeredEvents[eventName].forEach(callback => callback(eventPayload));
            }
        },

        // Method to bind specific instance methods to the current object context
        performMethodBinding: function (methodNamesString) {
            const methodList = methodNamesString.split(',');
            methodList.forEach(methodName => {
                const trimmedName = methodName.trim();
                if (typeof this[trimmedName] === 'function') {
                    this[trimmedName] = this[trimmedName].bind(this);
                }
            });
        }
    };


    // Main module definition using AMD pattern
    const BaseComponent = require('./BaseComponent'); // Path changed to reflect new name

    /**
     * Component for displaying a contextual floating panel.
     *
     * @class FloatingPanel
     * @augments module:BaseComponent
     * @requires BaseComponent
     */
    var FloatingPanel = function () {
        // Call the parent constructor with the current arguments
        BaseComponent.apply(this, arguments);
    };

    FloatingPanel.prototype = Object.create(BaseComponent.prototype);
    FloatingPanel.prototype.constructor = FloatingPanel;

    // Mimic the superClass property for compatibility with original framework
    FloatingPanel.prototype.constructor.superClass = BaseComponent.prototype;

    Object.assign(FloatingPanel.prototype, {

        /**
         * Unique identifier for this component type.
         *
         * @private
         * @type {string}
         */
        componentKind: 'FloatingPanel',

        /**
         * Default configuration parameters for the floating panel.
         *
         * @private
         * @name module:FloatingPanel#configSettings
         * @type {Object}
         * @property {boolean} isDeactivated - Indicates if the panel is disabled.
         * @property {(string | HTMLElement)} rootElementRef - Reference to the panel's main container.
         * @property {(string | HTMLElement)} anchorElementRef - The element relative to which the panel is positioned.
         * @property {string | Array.<HTMLElement>} activationTriggers - Elements that cause the panel to appear.
         * @property {string | HTMLElement} dynamicTriggersHost - Parent element for dynamically added triggers.
         * @property {string} displayContent - HTML content to be shown inside the panel.
         * @property {string} positioningDirection - Placement relative to the anchor (e.g., 'top-right', 'bottom-left').
         * @property {string} styleNamespace - CSS class prefix for the panel.
         * @property {Object.<string, number>} spatialOffset - Pixel offset for fine-tuning position.
         * @property {number} spatialOffset.horizontal - X-axis offset.
         * @property {number} spatialOffset.vertical - Y-axis offset.
         */
        configSettings: {

            /**
             * Panel's inactive state. If true, the panel will not appear.
             *
             * @type {boolean}
             * @default false
             */
            isDeactivated: false,

            /**
             * The primary container element for the panel.
             * Can be a CSS selector string or an HTMLElement.
             *
             * @type {(string | HTMLElement)}
             */
            rootElementRef: '',

            /**
             * Element used as a reference point for panel placement.
             *
             * @type {(string | HTMLElement)}
             */
            anchorElementRef: '',

            /**
             * CSS selector or an array of elements that activate the panel.
             * If `dynamicTriggersHost` is set, this must be a string (CSS class).
             *
             * @type {string | Array.<HTMLElement>}
             */
            activationTriggers: '',

            /**
             * A parent element that hosts dynamically created activation triggers.
             * Event delegation will be used on this element.
             *
             * @type {string | HTMLElement}
             */
            dynamicTriggersHost: '',

            /**
             * The HTML content to be displayed within the panel.
             *
             * @type {string}
             */
            displayContent: '',

            /**
             * Desired relative position of the panel to its anchor.
             * Examples: 'tr' (top-right), 'bl' (bottom-left), 'tc' (top-center), etc.
             *
             * @type {string}
             * @default 'bl'
             */
            positioningDirection: 'bl',

            /**
             * Base CSS class prefix for the panel and its internal elements.
             *
             * @type {string}
             * @default 'app-floating-panel'
             */
            styleNamespace: 'app-floating-panel',

            /**
             * Adjustments in pixels for the panel's final position.
             *
             * @type {Object}
             */
            spatialOffset: {

                /**
                 * Horizontal pixel adjustment.
                 *
                 * @type {number}
                 * @default 0
                 */
                horizontal: 0,

                /**
                 * Vertical pixel adjustment.
                 *
                 * @type {number}
                 * @default 0
                 */
                vertical: 0
            }
        },

        /**
         * Names of methods that need their `this` context bound to the instance.
         * Comma-separated string.
         *
         * @private
         * @type {string}
         */
        methodBindings: 'handleWindowResize, handleActivationRequest, handleDeactivationRequest',

        /**
         * Initializes the floating panel component with provided options.
         *
         * @private
         * @param {Object} setupOptions - Configuration object.
         * @see module:FloatingPanel#configSettings
         */
        initializeComponent: function (setupOptions) {
            // Apply and store the configuration
            const currentConfig = this.setOptions(setupOptions);

            this.isDeactivated = currentConfig.isDeactivated;
            this.displayContent = currentConfig.displayContent;

            // Resolve the anchor element reference
            if (currentConfig.anchorElementRef) {
                this.anchorElement = ElementUtils.fetchElement(currentConfig.anchorElementRef);
                if (!this.anchorElement) {
                    console.warn('FloatingPanel: Anchor element not found for reference:', currentConfig.anchorElementRef);
                }
            }

            const panelCssPrefix = currentConfig.styleNamespace;
            // Resolve or create the main panel element
            this.rootElement = ElementUtils.fetchElement(currentConfig.rootElementRef);

            if (!this.rootElement) {
                // If no root element was provided, create a new div
                this.rootElement = document.createElement('div');
                this.rootElement.style.position = 'absolute'; // Ensure it's absolutely positioned
                this.rootElement.style.zIndex = '9999'; // Give it a high z-index
                this.rootElement.style.left = '-9999px'; // Initially off-screen
                this.rootElement.style.top = '-9999px'; // Also off-screen vertically
                ElementUtils.appendCssClass(this.rootElement, panelCssPrefix);
            } else {
                // If an existing root element is provided, just add the class
                ElementUtils.appendCssClass(this.rootElement, panelCssPrefix);
            }

            const instanceRef = this;
            const dynamicHost = currentConfig.dynamicTriggersHost;
            const triggers = currentConfig.activationTriggers;

            // Handle dynamic triggers via event delegation
            if (dynamicHost) {
                const hostElement = ElementUtils.fetchElement(dynamicHost);
                if (hostElement) {
                    EventUtilities.attachListener(hostElement, 'click', instanceRef.handleActivationRequest);
                    this.dynamicTriggersParent = hostElement; // Store reference to the host
                } else {
                    console.warn('FloatingPanel: Dynamic triggers host element not found:', dynamicHost);
                }
            } else if (triggers) {
                // Handle static triggers
                let triggerElements = [];
                if (EventUtilities.isStringValue(triggers)) {
                    triggerElements = ElementUtils.findManyElements(triggers);
                } else if (Array.isArray(triggers)) {
                    triggerElements = triggers.map(ElementUtils.fetchElement).filter(Boolean); // Ensure elements are valid
                } else if (triggers instanceof HTMLElement) {
                    triggerElements = [triggers];
                }

                if (triggerElements.length === 0) {
                    console.warn('FloatingPanel: No static trigger elements found for:', triggers);
                }

                triggerElements.forEach(triggerElement => {
                    EventUtilities.attachListener(triggerElement, 'click', instanceRef.handleActivationRequest);
                });
                this.staticTriggerElements = triggerElements; // Store reference
            }

            // Bind methods now that `this.performMethodBinding` is available
            this.performMethodBinding(this.methodBindings);
        },

        /**
         * Renders the floating panel into the DOM.
         *
         * @public
         * @fires module:FloatingPanel#itemClicked Custom event when an item inside the panel is clicked.
         * @returns {module:FloatingPanel} The current instance for chaining.
         */
        composeView: function () {
            const currentRoot = this.rootElement;

            if (!this.isViewComposed) {
                this.isViewComposed = true;
                // Append to body only if the root element was newly created by the component
                if (!this.configSettings.rootElementRef && !currentRoot.parentNode) {
                    document.body.appendChild(currentRoot);
                }

                const self = this;

                EventUtilities.attachListener(
                    currentRoot,
                    'click',
                    function (evt) {
                        /**
                         * @event module:FloatingPanel#itemClicked
                         * @type {Object}
                         * @property {DOMEvent} originalEvent - The native DOM event object.
                         */
                        self.triggerEvent('itemClicked', { originalEvent: evt });
                    }
                );
            }

            // Update content only if provided
            if (this.displayContent) {
                currentRoot.innerHTML = this.displayContent;
            }

            return this;
        },

        /**
         * Callback for when the browser window is resized.
         * Debounces the position recalculation.
         *
         * @private
         */
        handleWindowResize: function () {
            clearTimeout(this.resizeDebounceTimer);

            const componentInstance = this;

            // Debounce the call to displayPanel to avoid excessive recalculations
            this.resizeDebounceTimer = setTimeout(function () {
                componentInstance.displayPanel();
            }, 150); // Slightly increased debounce time
        },

        /**
         * Handles requests to make the panel visible.
         *
         * @private
         * @param {DOMEvent} activationEvent - The DOM event that triggered the activation.
         * @fires module:FloatingPanel#panelActivating Before the panel becomes visible.
         */
        handleActivationRequest: function (activationEvent) {
            /**
             * @event module:FloatingPanel#panelActivating
             * @type {Object}
             * @property {DOMEvent} originalEvent - The DOM event that initiated the activation.
             */
            this.triggerEvent('panelActivating', { originalEvent: activationEvent });

            if (this.isDeactivated) {
                return; // Exit if the panel is disabled
            }

            const componentSelf = this;
            const eventOrigin = ElementUtils.getOriginalEventTarget(activationEvent);
            const dynamicHostParent = this.dynamicTriggersParent;

            // Logic for dynamic triggers
            if (dynamicHostParent) {
                const triggerClass = this.configSettings.activationTriggers; // This should be a class string
                let currentTargetNode = eventOrigin;

                // Traverse up the DOM tree to find the actual trigger element
                while (currentTargetNode && currentTargetNode !== dynamicHostParent) {
                    if (ElementUtils.hasSpecificClass(currentTargetNode, triggerClass)) {
                        break; // Found the trigger element
                    }
                    currentTargetNode = currentTargetNode.parentNode;
                }

                // If no matching trigger class found within the host, or it's the host itself (not a child trigger)
                if (!currentTargetNode || !ElementUtils.hasSpecificClass(currentTargetNode, triggerClass)) {
                    return; // Not a valid dynamic trigger activation
                }
                this.currentTriggerSource = currentTargetNode; // Store the actual trigger element
            } else {
                // For static triggers, the event origin IS the trigger (or a child of it).
                // We'll just assume eventOrigin is the trigger for static cases.
                this.currentTriggerSource = eventOrigin;
            }

            // Ensure the view is composed before displaying
            if (!this.isViewComposed) {
                this.composeView();
            }

            this.displayPanel();

            // Delay attaching global hide/resize listeners to prevent immediate hiding
            this.eventAttachDelayTimer = setTimeout(function () {
                EventUtilities.attachListener(document, 'click', componentSelf.handleDeactivationRequest);
                EventUtilities.attachListener(window, 'resize', componentSelf.handleWindowResize);
            }, 50); // Short delay
        },

        /**
         * Handles requests to hide the panel.
         *
         * @private
         * @param {DOMEvent} hideEvent - The DOM event that triggered the deactivation.
         */
        handleDeactivationRequest: function (hideEvent) {
            const eventTarget = ElementUtils.getOriginalEventTarget(hideEvent);
            const panelRoot = this.rootElement;

            // If the click is inside the panel, do not hide it
            if (panelRoot === eventTarget || ElementUtils.encompasses(panelRoot, eventTarget)) {
                return;
            }

            this.concealPanel();
            clearTimeout(this.resizeDebounceTimer);
        },

        /**
         * Makes the floating panel visible and positions it.
         *
         * @public
         * @fires module:FloatingPanel#panelDisplayed When the panel becomes visible.
         */
        displayPanel: function () {
            // Ensure the view is composed before attempting to display
            if (!this.isViewComposed) {
                this.composeView();
            }

            this.determinePanelPlacement();
            this.rootElement.style.display = ''; // Ensure it's not hidden by display: none

            /**
             * @event module:FloatingPanel#panelDisplayed
             */
            this.triggerEvent('panelDisplayed');
            this.isCurrentlyVisible = true;
        },

        /**
         * Hides the floating panel.
         *
         * @public
         * @fires module:FloatingPanel#panelHidden When the panel is no longer visible.
         */
        concealPanel: function () {
            if (!this.isCurrentlyVisible) {
                return; // Already hidden
            }
            this.rootElement.style.left = '-9999px'; // Move off-screen
            this.rootElement.style.top = '-9999px'; // Also off-screen vertically
            this.rootElement.style.display = 'none'; // Also hide using display none for accessibility/rendering

            /**
             * @event module:FloatingPanel#panelHidden
             */
            this.triggerEvent('panelHidden');

            EventUtilities.detachListener(document, 'click', this.handleDeactivationRequest);
            EventUtilities.detachListener(window, 'resize', this.handleWindowResize);

            clearTimeout(this.eventAttachDelayTimer);
            clearTimeout(this.resizeDebounceTimer);
            this.isCurrentlyVisible = false;
        },

        /**
         * Calculates and applies the correct CSS position for the panel and its potential arrow.
         *
         * @private
         */
        determinePanelPlacement: function () {
            const currentOptions = this.configSettings;
            // The actual target element for positioning, prioritizing explicit anchor over the trigger
            const effectiveAnchor = this.anchorElement || (this.currentTriggerSource || (this.staticTriggerElements && this.staticTriggerElements[0]));
            const panelMainElement = this.rootElement;

            // Guard: If no effective anchor, cannot position
            if (!effectiveAnchor) {
                console.warn('FloatingPanel: No anchor element found for positioning.');
                return;
            }

            const anchorPosition = ElementUtils.calculateElementOffset(effectiveAnchor);

            // Anchor element's key coordinates
            const anchorTop = anchorPosition.top;
            const anchorLeft = anchorPosition.left;
            const anchorWidth = anchorPosition.width;
            const anchorHeight = anchorPosition.height;
            const anchorRight = anchorLeft + anchorWidth;
            const anchorBottom = anchorTop + anchorHeight;
            const anchorCenterX = anchorLeft + (anchorWidth / 2);
            const anchorCenterY = anchorTop + (anchorHeight / 2);

            // Panel's dimensions
            const panelWidth = panelMainElement.offsetWidth;
            const panelHeight = panelMainElement.offsetHeight;

            // Current viewport scroll and dimensions
            const viewportScrollY = ViewportMetrics.getCurrentScrollY();
            const viewportScrollX = ViewportMetrics.getCurrentScrollX();
            const viewportRightEdge = viewportScrollX + ViewportMetrics.getVisibleWidth();
            const viewportBottomEdge = viewportScrollY + ViewportMetrics.getVisibleHeight();

            // Override positioning direction if specified via data attribute on the anchor
            let effectiveDirection = currentOptions.positioningDirection;
            const dataDirAttribute = effectiveAnchor.getAttribute('data-floating-panel-dir');
            if (dataDirAttribute && /^[trbl]{2}$/.test(dataDirAttribute)) {
                effectiveDirection = dataDirAttribute;
            }

            let primaryAxis, secondaryAxis; // 't', 'b', 'l', 'r' for primary; 't', 'c', 'b', 'l', 'r' for secondary

            // Logic for 'auto' positioning: attempt to find a fit within the viewport
            if (effectiveDirection === 'auto') {
                // Check horizontal fit: 'c' (center), 'l' (left), 'r' (right)
                const preferredHorizontal = (anchorWidth > panelWidth ||
                                             (anchorLeft - (panelWidth - anchorWidth) / 2 >= viewportScrollX &&
                                              anchorRight + (panelWidth - anchorWidth) / 2 <= viewportRightEdge))
                                            ? 'c' // Center if fits or if anchor is wide enough
                                            : (anchorLeft + panelWidth > viewportRightEdge)
                                                ? 'r' // Right-aligned if panel overflows right
                                                : 'l'; // Left-aligned otherwise

                // Check vertical fit: 'c' (center), 't' (top), 'b' (bottom)
                const preferredVertical = (anchorHeight > panelHeight ||
                                           (anchorTop - (panelHeight - anchorHeight) / 2 >= viewportScrollY &&
                                            anchorBottom + (panelHeight - anchorHeight) / 2 <= viewportBottomEdge))
                                          ? 'c' // Center if fits or if anchor is tall enough
                                          : (anchorTop + panelHeight > viewportBottomEdge)
                                              ? 'b' // Bottom-aligned if panel overflows bottom
                                              : 't'; // Top-aligned otherwise

                // Try positioning below the anchor first
                if (anchorBottom + panelHeight <= viewportBottomEdge) {
                    primaryAxis = 'b';
                    secondaryAxis = preferredHorizontal;
                }
                // Then try to the right
                else if (anchorRight + panelWidth <= viewportRightEdge) {
                    primaryAxis = 'r';
                    secondaryAxis = preferredVertical;
                }
                // Then try above
                else if (anchorTop - panelHeight >= viewportScrollY) {
                    primaryAxis = 't';
                    secondaryAxis = preferredHorizontal;
                }
                // Finally, try to the left
                else if (anchorLeft - panelWidth >= viewportScrollX) {
                    primaryAxis = 'l';
                    secondaryAxis = preferredVertical;
                }
                // If all fails, default to 'bl' (bottom-left)
                else {
                    primaryAxis = 'b';
                    secondaryAxis = 'l';
                }

                effectiveDirection = primaryAxis + secondaryAxis; // Construct the chosen direction
            } else {
                // Parse explicit direction string
                primaryAxis = effectiveDirection.charAt(0);
                secondaryAxis = effectiveDirection.charAt(1);
            }

            const currentOffset = currentOptions.spatialOffset;
            let finalPanelLeft = 0;
            let finalPanelTop = 0;

            // Calculate position based on primary axis (top/bottom or left/right)
            if (primaryAxis === 't' || primaryAxis === 'b') {
                // Panel is above or below the anchor
                finalPanelLeft = {
                    l: anchorLeft,
                    c: anchorCenterX - (panelWidth / 2),
                    r: anchorRight - panelWidth
                }[secondaryAxis];

                finalPanelTop = (primaryAxis === 't')
                    ? anchorTop - panelHeight
                    : anchorBottom;
            } else if (primaryAxis === 'l' || primaryAxis === 'r') {
                // Panel is to the left or right of the anchor
                finalPanelTop = {
                    t: anchorTop,
                    c: anchorCenterY - (panelHeight / 2),
                    b: anchorBottom - panelHeight
                }[secondaryAxis];

                finalPanelLeft = (primaryAxis === 'l')
                    ? anchorLeft - panelWidth
                    : anchorRight;
            } else {
                // Default to bottom-left if direction is invalid or unhandled
                finalPanelLeft = anchorLeft;
                finalPanelTop = anchorBottom;
            }

            // Apply manual offsets
            finalPanelLeft += currentOffset.horizontal;
            finalPanelTop += currentOffset.vertical;

            // Apply calculated styles
            panelMainElement.style.left = finalPanelLeft + 'px';
            panelMainElement.style.top = finalPanelTop + 'px';
        }
    });

    return FloatingPanel;
});