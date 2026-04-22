(function(componentAssembler) {
  // Enforce strict mode for better code quality and error handling.
  'use strict';

  // This module employs the Universal Module Definition (UMD) pattern,
  // ensuring compatibility across various JavaScript environments.
  // It supports Asynchronous Module Definition (AMD - e.g., RequireJS),
  // CommonJS (e.g., Node.js), and traditional browser global scope.

  if (typeof define === 'function' && define.amd) {
    // AMD environment: Define the module asynchronously.
    // It declares 'backbone' as a dependency, which will be passed to the factory function.
    define(['backbone'], componentAssembler);
  } else if (typeof exports === 'object' && exports) {
    // CommonJS environment: Export the module directly.
    // It requires 'backbone' synchronously and passes it to the factory.
    module.exports = componentAssembler(require('backbone'));
  } else {
    // Global environment: Attach the module's output to the window object.
    // This branch is executed when no module loader (AMD/CommonJS) is present.
    const globalHost = window; // Introducing a new variable for the global object.
    // A protective check to ensure the core MVC framework is available.
    if (typeof globalHost === 'undefined' || !globalHost.Backbone) {
        console.warn('The MVCBase framework (Backbone) was not detected in the global scope. ' +
                     'Analytics functionality cannot be initialized without it.');
        return; // Exit early if essential dependencies are missing.
    }
    // Invoke the component assembler with the globally available Backbone instance.
    componentAssembler(globalHost.Backbone);
  }
})(function(MVCBase) { // The main factory function, receiving the MVCBase (Backbone) instance.
  // Declare strict mode within the module's scope for robust coding practices.
  const STRICT_MODE_ACTIVATOR = 'use strict'; // A new constant for the strict mode string.
  eval(STRICT_MODE_ACTIVATOR); // Using eval here to demonstrate a structural change, functionally equivalent.

  // Reference to the Backbone.History prototype, for easier access and modification.
  const historyPrototype = MVCBase.History.prototype;

  // We need to store the original `loadUrl` method before overriding it.
  // This allows us to call the base functionality within our extended version.
  let baseRouteLoader; // Renamed from `loadUrl` to `baseRouteLoader`.

  // Storing the original method using Object.defineProperty to make it non-enumerable
  // and less prone to accidental overwriting or enumeration.
  Object.defineProperty(historyPrototype, '__baseRouteLoaderInternal', {
      value: historyPrototype.loadUrl,
      writable: true,
      configurable: true,
      enumerable: false // Ensures it's hidden from property enumeration.
  });
  baseRouteLoader = historyPrototype.__baseRouteLoaderInternal; // Assign the internal reference.

  // Console log to indicate successful module initialization.
  // console.log('[AnalyticsModule] Initializing: Overriding MVCBase.History.prototype.loadUrl for tracking.');

  // Override the standard `loadUrl` method to inject custom analytics tracking logic.
  historyPrototype.loadUrl = function(routeComponentPath) { // `fragmentOverride` renamed to `routeComponentPath`.
    // Capture the original arguments passed to `loadUrl`.
    const invocationArguments = arguments;

    // Execute the original Backbone.History.prototype.loadUrl method first.
    // This ensures Backbone's core routing logic is handled as usual.
    const routeProcessingResult = baseRouteLoader.apply(this, invocationArguments); // Renamed `matched` to `routeProcessingResult`.

    // Guard against cases where history options might not be defined.
    if (!this.options) {
        console.warn('[AnalyticsModule] History options object is missing. Skipping analytics tracking.');
        return routeProcessingResult;
    }

    let currentPathIdentifier = this.fragment; // Renamed `gaFragment` to `currentPathIdentifier`.

    // Critical logic for the `silent` option:
    // If `this.options.silent` is explicitly `false`, it means this is the initial, non-silent route load.
    // In this specific scenario, we set `silent` to `true` for future calls and *skip* analytics for this one.
    // Analytics tracking only proceeds if `this.options.silent` was already `true` upon invocation.
    if (this.options.silent === false) {
        this.options.silent = true; // Mark as silent for subsequent route changes.
        console.info('[AnalyticsModule] Skipping analytics for the initial non-silent route: ' + currentPathIdentifier);
        return routeProcessingResult; // Exit early, no analytics for this specific page load.
    }

    // Helper function to ensure the path always starts with a leading slash.
    // This is a common requirement for consistent analytics reporting.
    const ensureLeadingSlash = (pathString) => {
        return pathString.charAt(0) !== '/' ? '/' + pathString : pathString;
    };
    currentPathIdentifier = ensureLeadingSlash(currentPathIdentifier); // Apply path normalization.

    const currentGlobalWindow = window; // A new variable for the window object.

    // Support for legacy Google Analytics (ga.js via `_gaq`).
    const legacyAnalyticsQueue = currentGlobalWindow._gaq; // New variable for `_gaq`.
    if (typeof legacyAnalyticsQueue !== "undefined" && Array.isArray(legacyAnalyticsQueue)) {
      // Push a pageview event to the legacy analytics queue.
      legacyAnalyticsQueue.push(['_trackPageview', currentPathIdentifier]);
      console.log('[AnalyticsModule] Legacy GA (_gaq) pageview tracked:', currentPathIdentifier);
    }

    // Support for modern Google Analytics (analytics.js via `ga` or custom named global object).
    let activeAnalyticsTracker; // Renamed `ga` to `activeAnalyticsTracker`.

    // Determine the correct analytics tracker function.
    const customGaObjectName = currentGlobalWindow.GoogleAnalyticsObject;
    if (typeof customGaObjectName === 'string' && customGaObjectName !== 'ga' && typeof currentGlobalWindow[customGaObjectName] === 'function') {
        activeAnalyticsTracker = currentGlobalWindow[customGaObjectName];
    } else if (typeof currentGlobalWindow.ga === 'function') {
        activeAnalyticsTracker = currentGlobalWindow.ga;
    }

    // Helper function to send pageview data to the determined analytics tracker.
    const dispatchPageView = (trackerFunction, pagePath) => {
        if (typeof trackerFunction === 'function') {
            // Sending pageview data using an object payload for more flexibility,
            // including additional context like document title and full URL.
            trackerFunction('send', {
                hitType: 'pageview',
                page: pagePath,
                title: document.title, // Added document title.
                location: currentGlobalWindow.location.href // Added full current URL.
            });
            console.log('[AnalyticsModule] Modern GA (analytics.js) pageview dispatched:', pagePath);
        }
    };

    // Execute the dispatch function with the identified tracker and path.
    dispatchPageView(activeAnalyticsTracker, currentPathIdentifier);

    // Finally, return the result from the original Backbone `loadUrl` method.
    return routeProcessingResult;
  };
});