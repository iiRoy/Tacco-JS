applicationCore.componentFactory('viewScroller', function () {
    // This defines a custom behavior for HTML elements within our application.
    // It enables enhanced scrolling capabilities using the iScroll library.
    return {
        // Directives with 'A' restrict to attribute usage, e.g., <div view-scroller="...">
        restrict: 'A',

        // The linking function establishes behavior, reacting to scope changes and DOM events.
        linkingFunction: function (componentScope, targetElement, elementAttributes) {
            // --- Configuration Setup ---

            // Validate iScroll library presence before proceeding.
            if (typeof iScroll === 'undefined') {
                console.error('ViewScroller: The iScroll library is not loaded. Please ensure iScroll.js is included.');
                return; // Abort if iScroll is unavailable.
            }

            // Default delay for scroll initialization in milliseconds.
            let initialDelayMillis = 5;

            // Base options for the iScroll instance.
            const scrollConfig = {
                snap: true,        // Enable snapping to elements
                momentum: true,    // Enable momentum scrolling
                hScrollbar: false  // Hide horizontal scrollbar by default
            };

            // Determine the unique identifier for this scrollable area.
            // It's derived from the 'view-scroller' attribute value or the element's 'id'.
            const instanceIdentifier = elementAttributes.viewScroller || elementAttributes.id || `default-scroll-${Math.random().toString(36).substring(2, 9)}`;

            // Apply global scroll settings from the root scope, if available.
            // These settings act as general defaults for all scroller instances.
            if (componentScope.$root.globalScrollSettings && typeof componentScope.$root.globalScrollSettings === 'object') {
                Object.assign(scrollConfig, componentScope.$root.globalScrollSettings);
                console.log(`ViewScroller (${instanceIdentifier}): Applied root-level global settings.`);
            }

            // Apply instance-specific settings from the parent scope, overriding global ones.
            // These are specific configurations for this particular scroller.
            if (componentScope.$parent.globalScrollSettings &&
                typeof componentScope.$parent.globalScrollSettings === 'object' &&
                componentScope.$parent.globalScrollSettings[instanceIdentifier] &&
                typeof componentScope.$parent.globalScrollSettings[instanceIdentifier] === 'object') {
                Object.assign(scrollConfig, componentScope.$parent.globalScrollSettings[instanceIdentifier]);
                console.log(`ViewScroller (${instanceIdentifier}): Applied instance-specific settings from parent scope.`);
            }

            // Handle 'formOptimization' attribute for specific form element behavior.
            // This prevents default iScroll behavior for form inputs.
            const enableFormOptimization = Boolean(elementAttributes.formOptimization);
            if (enableFormOptimization) {
                scrollConfig.useTransform = false; // Disable CSS transforms for better form compatibility.
                scrollConfig.onBeforeScrollStart = (eventObject) => {
                    let eventTarget = eventObject.target;
                    // Traverse up the DOM tree until a valid element node is found.
                    while (eventTarget && eventTarget.nodeType !== 1) {
                        eventTarget = eventTarget.parentNode;
                    }

                    // Prevent default scroll behavior if the target is not a selectable form element.
                    if (eventTarget && !['SELECT', 'INPUT', 'TEXTAREA'].includes(eventTarget.tagName)) {
                        eventObject.preventDefault();
                    }
                };
                console.log(`ViewScroller (${instanceIdentifier}): Form optimization enabled.`);
            }

            // Parse custom delay for initialization, if specified.
            if (elementAttributes.activationDelay) {
                const parsedDelay = parseInt(elementAttributes.activationDelay, 10);
                if (!isNaN(parsedDelay) && parsedDelay >= 0) {
                    initialDelayMillis = parsedDelay;
                    console.log(`ViewScroller (${instanceIdentifier}): Custom activation delay set to ${initialDelayMillis}ms.`);
                } else {
                    console.warn(`ViewScroller (${instanceIdentifier}): Invalid activation delay specified: '${elementAttributes.activationDelay}'. Using default ${initialDelayMillis}ms.`);
                }
            }


            // --- Scroll Instance Management ---

            // Function to instantiate or re-instantiate the iScroll component.
            const initializeScrollComponent = () => {
                // Ensure the parent scope has a container for scroll instances.
                if (!componentScope.$parent.managedScrollInstances) {
                    componentScope.$parent.managedScrollInstances = {};
                }

                // Create a new iScroll instance for the target element.
                // Guard against targetElement[0] being null/undefined.
                if (targetElement && targetElement[0]) {
                    componentScope.$parent.managedScrollInstances[instanceIdentifier] = new iScroll(targetElement[0], scrollConfig);
                    console.info(`ViewScroller (${instanceIdentifier}): iScroll component initialized successfully.`);
                } else {
                    console.error(`ViewScroller (${instanceIdentifier}): Target element not found for iScroll initialization.`);
                }
            };

            // --- Event Watchers ---

            // Watch for changes in the 'viewScroller' attribute value.
            // This is typically used to trigger re-initialization when content might change.
            if (elementAttributes.viewScroller) {
                componentScope.$watch(elementAttributes.viewScroller, () => {
                    console.log(`ViewScroller (${instanceIdentifier}): Triggering re-initialization due to attribute change.`);
                    // Defer initialization to allow DOM rendering to complete.
                    setTimeout(initializeScrollComponent, initialDelayMillis);
                });
            } else {
                 // If no specific watcher attribute, initialize once after a delay.
                setTimeout(initializeScrollComponent, initialDelayMillis);
            }


            // Watch for changes in content specified by 'contentObserver'.
            // This allows refreshing the scroll area when dynamic content is loaded.
            if (elementAttributes.contentObserver) {
                componentScope.$watch(elementAttributes.contentObserver, () => {
                    console.log(`ViewScroller (${instanceIdentifier}): Content observer detected change, refreshing scroll.`);
                    const currentScrollInstance = componentScope.$parent.managedScrollInstances && componentScope.$parent.managedScrollInstances[instanceIdentifier];
                    if (currentScrollInstance && typeof currentScrollInstance.refresh === 'function') {
                        currentScrollInstance.refresh();
                        console.log(`ViewScroller (${instanceIdentifier}): iScroll instance refreshed.`);
                    } else {
                        console.warn(`ViewScroller (${instanceIdentifier}): Refresh requested but no active iScroll instance found.`);
                    }
                }, true); // Deep watch for object/array changes.
            }
        }
    };
});