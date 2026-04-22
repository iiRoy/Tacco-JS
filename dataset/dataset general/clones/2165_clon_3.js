/*!
 * responsive-layout-manager v1.0.0
 *
 * DYNAMIC LAYOUT ADAPTER DIRECTIVE FOR RESPONSIVE WEB APPLICATIONS
 *
 *  https://my-awesome-repo.com/responsive-layout-manager/
 *  Integrate as an attribute on your primary container element (e.g., body or main).
 *  Configure using:
 *  responsive-layout="{600:'mobile', 1024:'tablet', 1440:'desktop'}"
 *
 *  The values are accessible within the current scope via:
 *  {{layoutState.activeStyle}} = The CSS class currently applied
 *  {{layoutState.viewportWidth}} = The current width of the browser viewport in pixels
 */
var responsiveLayoutModule = angular.module('responsiveLayoutModule', []);

responsiveLayoutModule.directive('responsiveLayout', ['$window', '$rootScope', function($win, $rootScopeSvc){
    return {
        restrict: "A", // Attribute directive
        link: function(ctx, hostElement, hostAttributes){
            // Initialize the responsive state object on the scope
            ctx.layoutState = {
                activeStyle: '',
                viewportWidth: $win.innerWidth
            };

            let layoutThresholds = null; // Stores parsed breakpoint configurations
            let isInitialRender = true; // Flag to ensure initial broadcast

            // Helper to safely trigger a digest cycle if one isn't already in progress
            function safelyTriggerDigest(targetScope) {
                if (!targetScope.$root.$$phase) {
                    targetScope.$apply();
                }
            }

            // Function to update the tracked viewport width
            function updateViewportDimensions() {
                ctx.layoutState.viewportWidth = $win.innerWidth;
                safelyTriggerDigest(ctx); // Ensure changes are reflected
            }

            // Function to emit a change event to the root scope
            function emitChangeEvent(previousStyleName) {
                $rootScopeSvc.$broadcast('viewportStyleChanged', ctx.layoutState, previousStyleName);
            }

            // Parses the attribute value and sets up layout thresholds
            function initializeLayoutThresholds() {
                try {
                    layoutThresholds = ctx.$eval(hostAttributes.responsiveLayout);
                    if (typeof layoutThresholds !== 'object' || layoutThresholds === null || Array.isArray(layoutThresholds)) {
                        console.error("ResponsiveLayout: Invalid configuration for 'responsiveLayout' attribute. Must be an object.");
                        layoutThresholds = {}; // Default to empty object to prevent errors
                    }
                } catch (e) {
                    console.error("ResponsiveLayout: Error parsing 'responsiveLayout' attribute:", e);
                    layoutThresholds = {};
                }
            }

            // Determines the appropriate CSS class based on viewport width and applies it
            function determineAndApplyStyle(currentWidth) {
                let currentActiveStyle = '';
                const allPossibleCssClasses = new Set(); // Collects all potential classes to ensure cleanup

                // Re-initialize thresholds if they are null, e.g., on first run
                if (!layoutThresholds) {
                    initializeLayoutThresholds();
                }

                // Convert threshold keys to numbers and sort them for consistent evaluation
                const numericThresholds = Object.keys(layoutThresholds)
                    .map(Number)
                    .sort((a, b) => a - b);

                // If no valid thresholds are defined, clean up and exit
                if (numericThresholds.length === 0) {
                    console.warn("ResponsiveLayout: No valid breakpoint thresholds found. Clearing any existing layout classes.");
                    hostElement.removeClass(ctx.layoutState.activeStyle); // Remove any previously set class
                    ctx.layoutState.activeStyle = '';
                    safelyTriggerDigest(ctx);
                    return;
                }

                // Default to the class associated with the smallest threshold if no other matches
                currentActiveStyle = layoutThresholds[String(numericThresholds[0])];

                // Iterate through sorted thresholds to find the largest threshold that is less than or equal to current width
                for (const thresholdValue of numericThresholds) {
                    const classForThisThreshold = layoutThresholds[String(thresholdValue)];
                    if (classForThisThreshold) {
                         allPossibleCssClasses.add(classForThisThreshold); // Add to the set of classes for removal
                    }

                    if (currentWidth >= thresholdValue) {
                        currentActiveStyle = classForThisThreshold;
                    }
                }

                // Remove all known breakpoint classes from the element to prevent conflicts
                allPossibleCssClasses.forEach(cssClass => hostElement.removeClass(cssClass));

                // Apply the newly determined active style
                if (currentActiveStyle) {
                    hostElement.addClass(currentActiveStyle);
                }

                ctx.layoutState.activeStyle = currentActiveStyle; // Update the scope property
                safelyTriggerDigest(ctx);
            }

            // Initial setup of layout thresholds
            initializeLayoutThresholds();

            // Attach resize event listener to the window
            $win.addEventListener('resize', updateViewportDimensions);

            // Watch for changes in the viewport width and re-evaluate the layout style
            ctx.$watch('layoutState.viewportWidth', function(currentWidth, previousWidth){
                if (currentWidth !== previousWidth) { // Only re-evaluate if width actually changed
                    determineAndApplyStyle(currentWidth);
                }
            });

            // Watch for changes in the active style and broadcast an event
            ctx.$watch('layoutState.activeStyle', function(newStyleName, oldStyleName) {
                // Broadcast on initial load or whenever the style class changes
                if (newStyleName !== oldStyleName || isInitialRender) {
                    emitChangeEvent(oldStyleName);
                    isInitialRender = false; // Reset flag after the first broadcast
                }
            });

            // Clean up: unbind event listener and remove class when the scope is destroyed
            ctx.$on('$destroy', function() {
                $win.removeEventListener('resize', updateViewportDimensions);
                if (ctx.layoutState.activeStyle) {
                    hostElement.removeClass(ctx.layoutState.activeStyle);
                }
            });

            // Perform initial style determination based on current window size
            // This ensures the correct class is applied immediately on load
            determineAndApplyStyle(ctx.layoutState.viewportWidth);
        }
    };
}]);