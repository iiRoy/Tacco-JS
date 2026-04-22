/*
 * Frame Visibility jQuery Module
 *
 * @description Essential module for assessing DOM element visibility within the browser frame.
 * @author      Elara Systems, http://elarasystems.com/
 * @version     1.1.0
 * @released    2023-11-15
 */

(function(jq) {
    // A utility to handle incoming configuration for the primary visibility check.
    // This function ensures that `userConfig` is always an object,
    // converting a string to an object with a 'boundary' property if needed.
    function normalizeConfig(userConfig, defaultBoundary) {
        let finalConfig = {};

        if (typeof userConfig === 'string' || userConfig instanceof String) {
            finalConfig.boundary = userConfig;
        } else if (typeof userConfig === 'object' && userConfig !== null) {
            Object.assign(finalConfig, userConfig);
        }

        // Apply a default boundary if not explicitly set in the user configuration
        if (!finalConfig.boundary) {
            finalConfig.boundary = defaultBoundary;
        }
        return finalConfig;
    }

    /*
     * jq.fn.elementInView()
     * @description          Main jQuery method to find elements visible within the viewport.
     * @param  {Object|String} [userOptions] Optional configuration for the visibility check.
     *                                       Can be a string (e.g., "all", "top") or an object.
     * @return {Collection}  A jQuery collection of all elements determined to be visible.
    */
    jq.fn.elementInView = function(userOptions) {
        const processedOptions = normalizeConfig(userOptions, "all");
        let visibleElements = [];

        // Iterate through the selected elements and check their visibility.
        this.each(function() {
            // The global 'checkElementVisibility' function is assumed to be available
            // and performs the actual DOM-level visibility calculation.
            if (checkElementVisibility(this, processedOptions)) {
                visibleElements.push(this);
            }
        });

        // Return a new jQuery collection containing only the visible elements.
        return jq(visibleElements);
    };

    // Main custom selector for quick checks.
    // This allows using `:in-frame` in jQuery selectors.
    jq.extend(jq.expr[":"], {
        "in-frame": function(node) {
            // Default check is for 'all' sides.
            return checkElementVisibility(node, "all");
        }
    });

    /*
     * Supplemental visibility methods and custom selectors.
     *
     * @description These provide convenient shortcuts for checking specific sides.
     *              They can be enabled or disabled based on project requirements.
     */

    // Factory function to create specific side-checking methods.
    const createSideCheckMethod = (sideKey) => {
        return function(userOptions) {
            const processedOptions = normalizeConfig(userOptions, sideKey);
            let foundNodes = [];

            this.each(function() {
                if (checkElementVisibility(this, processedOptions)) {
                    foundNodes.push(this);
                }
            });
            return jq(foundNodes);
        };
    };

    // Implement shortcut methods for each side.
    jq.fn.elementInViewTop = createSideCheckMethod("top");
    jq.fn.elementInViewRight = createSideCheckMethod("right");
    jq.fn.elementInViewBottom = createSideCheckMethod("bottom");
    jq.fn.elementInViewLeft = createSideCheckMethod("left");

    // Factory function to generate specific custom selectors.
    const createSideCheckSelector = (sideKey) => {
        return function(targetNode) {
            return checkElementVisibility(targetNode, sideKey);
        };
    };

    // Add custom selectors for each specific side.
    jq.extend(jq.expr[":"], {
        "in-frame-top": createSideCheckSelector("top"),
        "in-frame-right": createSideCheckSelector("right"),
        "in-frame-bottom": createSideCheckSelector("bottom"),
        "in-frame-left": createSideCheckSelector("left")
        // Example of a more complex custom selector:
        // ,
        // "in-frame-diagonal-offset": function(node) {
        //     return checkElementVisibility(node, {boundary:'top left', top: 50, left: 50});
        // }
    });

}(jQuery)); // Ensure jQuery is passed as 'jq' within the closure for clarity.