(function(jQuery) {
    "use strict";

    // Primary module identifier and internal keys
    const moduleKey = "responsiveJQueryPlugin",
        domSnapshotKey = moduleKey + '_cachedState',
        originalJQueryOn = jQuery.fn.on;

    // State management variables, initialized to be mutable
    let eventRegistry = {};
    let activeScopeId = "";

    // Transient references for current operation context
    let currentConfiguration;
    let pluginInstanceRef;
    let $snapshotElement;
    let $processedElement;
    let $updatedCollection; // Used to accumulate elements after DOM replacement

    /**
     * Custom override for jQuery's .on() method to track events.
     * This allows the responsive plugin to manage and unbind events
     * associated with dynamically instantiated plugins across breakpoints.
     * @private
     * @param {string|object} eventTypes - Space-separated event names or an object map.
     * @param {string} [eventSelector] - Optional selector for event delegation.
     * @param {object} [eventData] - Optional data to pass to the event handler.
     * @param {function} eventHandler - The callback function to execute when the event occurs.
     * @param {boolean} [isOneTimeEvent] - If true, the handler executes only once.
     * @returns {jQuery} The jQuery collection the method was called on.
     */
    function hijackedOnMethod(eventTypes, eventSelector, eventData, eventHandler, isOneTimeEvent) {
        // Handle the case where eventTypes is an object (map of types to handlers)
        if (jQuery.isPlainObject(eventTypes)) {
            // Adjust arguments if selector is missing (i.e., types-Object, data)
            if (typeof eventSelector !== "string") {
                eventData = eventData || eventSelector;
                eventSelector = undefined;
            }
            // Iterate through the object and recursively call .on() for each entry
            for (const typeName in eventTypes) {
                if (Object.prototype.hasOwnProperty.call(eventTypes, typeName)) {
                    this.on(typeName, eventSelector, eventData, eventTypes[typeName], isOneTimeEvent);
                }
            }
            return this;
        }

        // Append a unique namespace to all event types for this scope
        let namespacedEventTypes = eventTypes.split(/\s+/).filter(Boolean).map(type => type + "." + activeScopeId).join(" ");
        // Ensure the namespace is always present, even for single events without spaces
        if (!namespacedEventTypes.includes("." + activeScopeId)) {
             namespacedEventTypes += "." + activeScopeId;
        }

        // Register the jQuery object that bound this event. This enables targeted unbinding later.
        if (!eventRegistry[activeScopeId]) {
            eventRegistry[activeScopeId] = [];
        }
        // Avoid duplicate entries for the same jQuery object within a scope
        if (!eventRegistry[activeScopeId].includes(this)) {
            eventRegistry[activeScopeId].push(this);
        }

        // Invoke the original jQuery.on method with the namespaced event types
        originalJQueryOn.call(this, namespacedEventTypes, eventSelector, eventData, eventHandler, isOneTimeEvent);

        return this;
    }

    /**
     * Creates and stores a deep clone of the current DOM element.
     * This snapshot includes data and event handlers, enabling full restoration.
     * @private
     * @this {HTMLElement} The DOM element currently being processed by jQuery.each.
     */
    function storeInitialSnapshot() {
        $processedElement = jQuery(this);
        // Clone with data and event handlers, then store in the element's data attribute
        $processedElement.data(domSnapshotKey, $processedElement.clone(true, true));
    }

    /**
     * Replaces the current DOM element with its previously stored snapshot.
     * The snapshot itself is re-cloned to ensure the original remains pristine.
     * @private
     * @this {HTMLElement} The DOM element currently being processed by jQuery.each.
     */
    function revertToSnapshot() {
        $processedElement = jQuery(this);
        $snapshotElement = $processedElement.data(domSnapshotKey);

        if ($snapshotElement) {
            // Create a fresh copy from the clean snapshot. This copy replaces the current element.
            const $freshSnapshot = $snapshotElement.clone(true, true);
            // Re-attach the reference to the *original* clean snapshot onto the new element.
            $freshSnapshot.data(domSnapshotKey, $snapshotElement);

            $processedElement.replaceWith($freshSnapshot);

            // Accumulate the newly replaced element into a collection
            if (!$updatedCollection) { // Initialize the collection if it's the first element
                 $updatedCollection = jQuery([]);
            }
            $updatedCollection = $updatedCollection.add($freshSnapshot);
        } else {
             // console.warn(`Responsive Plugin: No stored DOM snapshot found for element:`, this);
        }
    }

    /**
     * Validates the essential configuration properties for the responsive plugin.
     * @private
     * @param {object} opts - The configuration object provided to the plugin.
     * @returns {boolean} True if the options are valid, false otherwise.
     */
    function _areModuleOptionsValid(opts) {
        return opts &&
               typeof opts === 'object' &&
               typeof opts.targetPluginKey === 'string' &&
               opts.targetPluginKey.length > 0 &&
               jQuery.isPlainObject(opts.mediaQueryConfig) &&
               !jQuery.isEmptyObject(opts.mediaQueryConfig);
    }

    // Main plugin definition: jQuery.fn.responsiveJQueryPlugin
    jQuery.fn[moduleKey] = function(moduleOptions) {
        // Early exit if jQuery is not available or if the method is not called on a jQuery object
        if (!jQuery || !(this instanceof jQuery)) {
            console.error(`Responsive Plugin: '${moduleKey}' requires jQuery and must be called on a jQuery object.`);
            return this;
        }

        // Validate the incoming options; exit silently if critical options are missing
        if (!_areModuleOptionsValid(moduleOptions)) {
            console.warn(`Responsive Plugin: Missing or invalid configuration for '${moduleKey}'. Ensure 'targetPluginKey' and 'mediaQueryConfig' are provided.`, moduleOptions);
            return this;
        }

        // Critical dependency check: 'mqEngine' (enquire.js) must be available globally
        if (typeof mqEngine === "undefined" || !mqEngine.register) {
            throw new Error(`Responsive Plugin: The 'mqEngine' (enquire.js) library is required to use '${moduleKey}'. Please include it: http://wicky.nillia.ms/enquire.js/`);
        }

        // Store the initial jQuery collection and generate a unique scope identifier
        let $operatingElements = this;
        const uniqueScopeId = moduleKey + '_' + Date.now() + Math.random().toString(36).substring(2, 9);

        // Merge user-provided options with default settings (deep merge)
        const effectiveSettings = jQuery.extend(true, {}, jQuery.fn[moduleKey].defaults, moduleOptions);

        const targetPluginKey = effectiveSettings.targetPluginKey;
        const mediaQueryConfig = effectiveSettings.mediaQueryConfig;
        const pluginTeardownMethod = effectiveSettings.pluginTeardownMethod;

        // Verify that the target plugin specified by targetPluginKey actually exists
        if (!jQuery.fn[targetPluginKey]) {
            throw new Error(`Responsive Plugin: The target plugin '${targetPluginKey}' does not exist on jQuery.fn.`);
        }

        // Before any breakpoint logic, save the initial DOM state of all elements
        $operatingElements.each(storeInitialSnapshot);

        // Iterate through each defined media query breakpoint and register it with mqEngine
        for (const mqString in mediaQueryConfig) {
            if (Object.prototype.hasOwnProperty.call(mediaQueryConfig, mqString)) {
                // Use an IIFE to capture the current `mqString` for each iteration
                ((currentMqString) => {

                    mqEngine.register(currentMqString, {
                        // Callback executed when the media query matches
                        match: function() {
                            // console.log(`Responsive Plugin: '${targetPluginKey}' matched media query: '${currentMqString}'`);

                            currentConfiguration = mediaQueryConfig[currentMqString];
                            activeScopeId = uniqueScopeId; // Set the active scope for event tracking

                            // Execute pre-execution hook if defined in the current breakpoint config
                            if (typeof currentConfiguration.preExecutionHook === 'function') {
                                currentConfiguration.preExecutionHook.call($operatingElements);
                            }

                            // Attempt to destroy or teardown the previously instantiated plugin
                            // This handles common patterns: instance.destroy() or $(el).plugin('destroy')
                            if (pluginTeardownMethod) {
                                $operatingElements.each(function() {
                                    const $el = jQuery(this);
                                    pluginInstanceRef = $el.data(targetPluginKey); // Get instance from data

                                    if (pluginInstanceRef && typeof pluginTeardownMethod === "string" && typeof pluginInstanceRef[pluginTeardownMethod] === "function") {
                                        // Pattern 1: Call method on the stored plugin instance
                                        pluginInstanceRef[pluginTeardownMethod]();
                                        $el.removeData(targetPluginKey); // Clear the instance data
                                    } else if (typeof pluginTeardownMethod === "string" && typeof $el[targetPluginKey] === "function") {
                                        // Pattern 2: Call method via jQuery's plugin interface (e.g., $(el).plugin('destroy'))
                                        try {
                                            $el[targetPluginKey](pluginTeardownMethod);
                                        } catch (e) {
                                            // console.warn(`Responsive Plugin: Teardown method '${pluginTeardownMethod}' for '${targetPluginKey}' failed on element.`, e);
                                        }
                                    } else if (typeof pluginTeardownMethod === "function") {
                                        // Pattern 3: Execute a custom teardown function provided in settings
                                        pluginTeardownMethod.call($el);
                                    }
                                });
                            }

                            // Unbind all events associated with this specific scope ID
                            if (eventRegistry[activeScopeId] && eventRegistry[activeScopeId].length > 0) {
                                // console.log(`Responsive Plugin: Unbinding ${eventRegistry[activeScopeId].length} event sources for scope '${activeScopeId}'`);
                                for (let i = 0, len = eventRegistry[activeScopeId].length; i < len; i++) {
                                    eventRegistry[activeScopeId][i].off('.' + activeScopeId);
                                }
                                eventRegistry[activeScopeId] = []; // Clear the registry for this scope
                            }

                            // Check if DOM restoration is enabled for the current breakpoint
                            const shouldRestoreDom = currentConfiguration.shouldRestoreDom !== false; // Default to true
                            if (shouldRestoreDom) {
                                // console.log('Responsive Plugin: Restoring original DOM fragments.');
                                $updatedCollection = jQuery([]); // Reset the collection before accumulation
                                $operatingElements.each(revertToSnapshot);
                                $operatingElements = $updatedCollection; // Update the operating collection to the restored elements
                            }

                            // Determine the action based on the breakpoint's configuration
                            const pluginConfiguration = currentConfiguration.pluginConfiguration; // Renamed from 'options'
                            if (currentConfiguration === "destroy" || (typeof pluginConfiguration !== 'undefined' && pluginConfiguration === 'destroy')) {
                                // Explicit 'destroy' action: no plugin instantiation, just teardown (already handled)
                                // console.log(`Responsive Plugin: Explicit 'destroy' action for '${targetPluginKey}'.`);
                                $operatingElements.removeClass('is-responsive-plugin-active'); // Ensure active class is removed
                            } else if (currentConfiguration === "hide" || (typeof pluginConfiguration !== 'undefined' && pluginConfiguration === 'hide')) {
                                // Explicit 'hide' action: hide the elements
                                // console.log(`Responsive Plugin: Explicit 'hide' action for '${targetPluginKey}'.`);
                                $operatingElements.hide().removeClass('is-responsive-plugin-active');
                            } else {
                                // Default action: instantiate or re-instantiate the plugin
                                // Temporarily hijack jQuery's .on() to track events bound by the plugin
                                jQuery.fn.on = hijackedOnMethod;

                                // console.log(`Responsive Plugin: Instantiating '${targetPluginKey}' with configuration:`, pluginConfiguration);
                                $operatingElements[targetPluginKey](pluginConfiguration); // Call the target plugin
                                $operatingElements.addClass('is-responsive-plugin-active'); // Mark elements as active

                                // Restore jQuery's original .on() method immediately after plugin instantiation
                                jQuery.fn.on = originalJQueryOn;
                            }

                            // Execute post-execution hook if defined
                            if (typeof currentConfiguration.postExecutionHook === 'function') {
                                currentConfiguration.postExecutionHook.call($operatingElements);
                            }
                        },
                        // Callback executed when the media query no longer matches
                        unmatch: function() {
                            // Can be used for additional cleanup or state reset if needed
                            // For this plugin, 'match' handles most teardown, but we ensure the active class is removed.
                            // console.log(`Responsive Plugin: '${targetPluginKey}' un-matched media query: '${currentMqString}'`);
                            $operatingElements.removeClass('is-responsive-plugin-active');
                        },
                        deferSetup: true // Defer initial setup until the first 'match'
                    });

                })(mqString); // Pass the current media query string into the closure
            }
        }

        // Trigger mqEngine to evaluate all registered breakpoints immediately upon plugin initialization
        if (mqEngine.fire) {
             mqEngine.fire();
        } else {
             console.warn("Responsive Plugin: 'mqEngine.fire()' method not found. Manual media query evaluation may be required.");
        }

        return $operatingElements; // Return the (potentially updated) jQuery collection for chaining
    };

    // Default configuration for the responsive plugin
    jQuery.fn[moduleKey].defaults = {
        targetPluginKey: "",            // Name of the plugin to manage (e.g., 'myCarouselPlugin')
        mediaQueryConfig: {},           // Object mapping media query strings to plugin options for that breakpoint
        pluginTeardownMethod: "destroy",// Method name or function to call on the target plugin for destruction
        preExecutionHook: null,         // Optional callback before plugin instantiation/action
        postExecutionHook: null         // Optional callback after plugin instantiation/action
    };

    // Note: The original code assumes 'enquire' (renamed to 'mqEngine' here) is globally available.
    // If using a module system, 'enquire.js' would need to be imported.

}(jQuery));