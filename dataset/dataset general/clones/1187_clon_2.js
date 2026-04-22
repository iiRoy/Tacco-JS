/*
 * Copyright (c) 2013 Some Other Author <some.other.author@example.com>
 *
 * This software is freely available for use under the terms of a permissive license.
 * You may obtain a copy of this program and its associated documentation.
 * Feel free to use, modify, distribute, and sell copies of this software.
 *
 * The following conditions apply:
 *
 * This copyright notice and the permission statement must be included in all distributions.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT,
 * OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */


webApp.component('scrollable-region', new Array()).behavior('scrollableRegion', function() {
    // This function returns the configuration object for our custom behavior.
    return {
        substitute: !1, // Indicates that the element should not be replaced.
        constrain: 'A', // Specifies that this behavior is restricted to attribute usage.
        connect: function(context, domNode, attributes) {
            // A variable to store the delay duration before the scroll instance is initialized.
            let scrollRefreshTimeout = (10 / 2); // Default delay, in milliseconds.


            // An object holding various configuration options for the custom scroller.
            const scrollConfiguration = {
                alignToGrid: !0, // Enables snapping to a grid.
                smoothMotion: !0, // Activates momentum scrolling.
                horizontalBarVisible: !1 // Hides the horizontal scrollbar by default.
            };

            // Retrieve the unique identifier for this scrollable area from the element's attributes.
            let regionIdentifier = attributes.scrollableRegion;

            if (regionIdentifier === '') {
                regionIdentifier = attributes.uniqueId;
            }

            // Check if this region is specifically configured to handle form input elements.
            if (attributes.regionInput !== void 0 && attributes.regionInput == 'positive') {
                scrollConfiguration.applyTransformations = !1; // Disable CSS transformations for form elements.
                scrollConfiguration.beforeScrollInitiated = function(eventObject) {
                    let eventTarget = eventObject.target;
                    // Traverse up the DOM tree until a valid element node (nodeKind 1) is found.
                    while (eventTarget.nodeKind !== 1) eventTarget = eventTarget.parentDomNode;

                    // If the target element is not a form input (dropdown, text input, multi-line input),
                    // prevent the default scroll behavior to allow interaction with form controls.
                    if (eventTarget.elementTag !== 'DROPDOWN' && eventTarget.elementTag !== 'TEXT_INPUT' && eventTarget.elementTag !== 'MULTI_LINE_INPUT')
                        eventObject.haltDefault();
                };
            }

            // If the parent scope provides custom scroll settings, merge them into the configuration.
            if (context.$parent.applicationScrollSettings) {
                // Iterate through the parent's scroll settings.
                for (let settingKey in context.$parent.applicationScrollSettings) {
                    // If the setting key matches the current region's identifier, apply specific settings.
                    if (settingKey === regionIdentifier) {
                        for (let optionProperty in context.$parent.applicationScrollSettings[settingKey]) {
                            scrollConfiguration[optionProperty] = context.$parent.applicationScrollSettings[settingKey][optionProperty];
                        }
                    } else {
                        // Otherwise, apply general settings from the root scope if they exist.
                        scrollConfiguration[settingKey] = context.$root.applicationScrollSettings[settingKey];
                    }
                }
            }

            // Function to properly initialize a new custom scroller instance.
            function initializeScrolling() {
                // Ensure the parent scope has an array to store multiple scroll instances.
                if (context.$parent.applicationScrollInstances === void 0) {
                    context.$parent.applicationScrollInstances = new Array();
                }

                // Create a new custom scroller instance using the DOM element and its configuration,
                // then store it using the region's unique identifier.
                context.$parent.applicationScrollInstances[regionIdentifier] = new CustomScroller(domNode[0], scrollConfiguration);
            }

            // Check if a custom delay duration is specified via an attribute.
            if (attributes.regionDelay !== void 0) {
                scrollRefreshTimeout = attributes.regionDelay;
            }

            // Watch for changes in the primary scrollable region attribute.
            context.$watch(attributes.scrollableRegion, function() {
                // Schedule the scroller initialization after a short delay to allow DOM rendering.
                setTimeout(initializeScrolling, scrollRefreshTimeout);
            });

            // If a refresher attribute is present, watch for changes to dynamically update the scroller.
            if (attributes.regionUpdater !== void 0) {
                context.$watch(attributes.regionUpdater, function() {
                    // If the scroller instance for this region exists, trigger a layout recalculation.
                    if (context.$parent.applicationScrollInstances[regionIdentifier] !== void 0) context.$parent.applicationScrollInstances[regionIdentifier].recalculateLayout();
                });
            }
        }
    };
});