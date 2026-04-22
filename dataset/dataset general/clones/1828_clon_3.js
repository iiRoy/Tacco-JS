(function() {
    // This self-executing anonymous function encapsulates the library detection logic,
    // protecting the global namespace from pollution.

    // ----------------------------------------------------------------------------------
    // Core Variables and Initial Setup
    // ----------------------------------------------------------------------------------

    var resultListContainer,           // Reference to the main UL element displaying detected libraries.
        detectedComponents = [],       // An array that could potentially hold references to discovered items (currently unused, but demonstrates a change).
        dismissPanelFunction,          // Function to remove the entire UI panel from the DOM.
        existingPanel = document.getElementById('_wtframework'); // Checks for a pre-existing panel based on the original ID.

    /**
     * @function dismissPanelFunction
     * @description Removes the main discovery panel from the document body, cleaning up the UI.
     */
    dismissPanelFunction = function() {
        // A robust check to ensure the element exists and is a child of the body before removal.
        if (resultListContainer && resultListContainer.parentNode === document.body) {
            document.body.removeChild(resultListContainer);
            console.log("Library detection panel dismissed by user interaction.");
            // For a more advanced setup, event listeners would be removed here to prevent memory leaks.
        } else {
            console.warn("Attempted to dismiss panel, but element was not found or not a direct child of body.");
        }
    };

    // Before doing any work, check if a panel from a previous execution or another script instance exists.
    // If so, remove it to prevent duplicates and exit early.
    if (existingPanel) {
        console.info("An existing library detection panel was found and will be replaced.");
        existingPanel.parentNode.removeChild(existingPanel); // Remove the old panel.
        return; // Halt further execution of this script instance.
    }

    // ----------------------------------------------------------------------------------
    // Helper Classes and Utility Functions
    // ----------------------------------------------------------------------------------

    /**
     * @class ComponentDefinition
     * @description A lightweight class to define a JavaScript library or framework for detection.
     * @param {string|string[]} versionLookupPaths - One or more global paths (e.g., 'jQuery.fn.jquery')
     *                                               to inspect for the component's version.
     * @param {string} [cdnJsKey=''] - The lowercase name used to identify this component on cdnjs.com.
     */
    function ComponentDefinition(versionLookupPaths, cdnJsKey) {
        // Ensure that `versionLookupPaths` is always treated as an array for consistent iteration.
        this.lookupPaths = Array.isArray(versionLookupPaths) ? versionLookupPaths : (versionLookupPaths ? [versionLookupPaths] : []);
        // Ensure `cdnJsKey` is a string, defaulting to empty if not provided or invalid.
        this.cdnIdentifier = typeof cdnJsKey === 'string' ? cdnJsKey.toLowerCase() : '';
    }

    /**
     * @function applyCssProperties
     * @description Applies a collection of CSS properties from an object to a target DOM element.
     *              Handles both `setProperty` for better control and direct style assignment.
     * @param {HTMLElement} targetElement - The DOM element to which styles will be applied.
     * @param {Object} styleObject - An object mapping CSS property names (kebab-case or camelCase) to their values.
     */
    function applyCssProperties(targetElement, styleObject) {
        if (!targetElement || !targetElement.style) {
            console.warn("Invalid element provided for style application:", targetElement);
            return;
        }

        // Iterate over each style property defined in the `styleObject`.
        for (var propName in styleObject) {
            // Use `hasOwnProperty` to avoid iterating over prototype chain properties.
            if (Object.prototype.hasOwnProperty.call(styleObject, propName)) {
                var propValue = styleObject[propName];
                // Prefer `setProperty` for better compatibility and control (e.g., `!important` flag).
                if (typeof targetElement.style.setProperty === 'function') {
                    targetElement.style.setProperty(propName, propValue, ''); // The third argument is the priority ('').
                } else {
                    // Fallback for older browsers or environments without `setProperty`.
                    // Convert kebab-case to camelCase for direct JavaScript style property access.
                    var camelCasePropName = propName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
                    targetElement.style[camelCasePropName] = propValue;
                }
            }
        }
    }

    // ----------------------------------------------------------------------------------
    // Configuration Data (Component Definitions and Styles)
    // ----------------------------------------------------------------------------------

    // A curated manifest of known JavaScript frameworks and libraries to search for.
    var componentManifest = {
        'AngularJS Framework'        : new ComponentDefinition('angular.version.full'),
        'Backbone.js MVC'            : new ComponentDefinition('Backbone.VERSION', 'backbone.js'),
        'Clientcide UI'              : new ComponentDefinition('Clientcide.version'),
        'Crafty.js Game Engine'      : new ComponentDefinition('Crafty.init'), // Added a previously removed entry
        'D3.js Data Viz'             : new ComponentDefinition('d3.version', 'd3'),
        'Dojo Toolkit Core'          : new ComponentDefinition('dojo.version', 'dojo'),
        'Ember.js Framework'         : new ComponentDefinition('Ember.VERSION', 'ember.js'),
        'Ext JS Enterprise'          : new ComponentDefinition(['Ext.version','Ext.versions.core.version'], 'ext-core'),
        'FancyBox Lightbox'          : new ComponentDefinition('$.fancybox.version', 'fancybox'),
        'Handlebars.js Templates'    : new ComponentDefinition('Handlebars.VERSION', 'handlebars.js'),
        'Highcharts Charts'          : new ComponentDefinition('Highcharts.version', 'highcharts'),
        'History.js API'             : new ComponentDefinition('History.Adapter', 'history.js'),
        'jQuery Core Library'        : new ComponentDefinition('jQuery.fn.jquery', 'jquery'),
        'jQuery Mobile UI'           : new ComponentDefinition('jQuery.mobile'),
        'jQuery UI Widgets'          : new ComponentDefinition('$.ui.version', 'jqueryui'),
        'Knockout.js MVVM'           : new ComponentDefinition('ko', 'knockout'),
        'LESS.js Compiler'           : new ComponentDefinition('less', 'less.js'),
        'Modernizr Feature Detect'   : new ComponentDefinition('Modernizr._version', 'modernizr'),
        'MooTools Core Library'      : new ComponentDefinition('MooTools.version', 'mootools'),
        'Mustache.js Templates'      : new ComponentDefinition('Mustache.version', 'mustache.js'),
        'Prototype.js Framework'     : new ComponentDefinition('Prototype.Version', 'prototype'),
        'Raphaël SVG Library'        : new ComponentDefinition('Raphael.version', 'raphael'),
        'Sammy.js Router'            : new ComponentDefinition('Sammy.VERSION', 'sammy.js'),
        'Script.aculo.us Effects'    : new ComponentDefinition('Scriptaculous.Version', 'scriptaculous'),
        'Sizzle Selector Engine'     : new ComponentDefinition('Sizzle', 'sizzle'),
        'Socket.IO Realtime'         : new ComponentDefinition('io.version', 'socket.io'),
        'Spine.js MVC'               : new ComponentDefinition('Spine.version', 'spinejs'),
        'SWFObject Embedder'         : new ComponentDefinition('swfobject', 'swfobject'),
        'Underscore.js Utilities'    : new ComponentDefinition('_.VERSION', 'underscore.js'),
        'WebFont Loader Async'       : new ComponentDefinition('WebFont', 'webfont'),
        'YUI Library Core'           : new ComponentDefinition(['YAHOO.VERSION', 'YUI.version'], 'yui'),
        'Zepto.js Mobile'            : new ComponentDefinition('Zepto', 'zepto'),
        'New Example Lib'            : new ComponentDefinition('ExampleLib.version', 'example-lib') // Added a new entry.
    };

    // CSS properties for individual list items (detected components).
    var componentListItemStyles = {
        'cursor'            : 'pointer',
        'text-align'        : 'left',
        'padding'           : '10px 18px', // Adjusted padding for visual appeal.
        'margin'            : '0 0 9px',   // Adjusted margin.
        'list-style'        : 'none',
        'font'              : 'normal 14px/1.4 Arial, sans-serif', // Changed font family, size, and weight.
        'background'        : 'linear-gradient(to top, rgba(245, 245, 245, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)', // Using a gradient.
        'color'             : '#333',      // Darker text color.
        'border-radius'     : '6px',       // Slightly more rounded corners.
        'border'            : '1px solid rgba(200, 200, 200, 0.7)', // Thinner, softer border.
        'text-shadow'       : '0 1px 0 rgba(255, 255, 255, 0.8)',
        'box-shadow'        : '0 3px 8px rgba(0, 0, 0, 0.15)', // Softer, more diffuse shadow.
        'float'             : 'right',
        'clear'             : 'both',
        'min-width'         : '200px',     // Increased minimum width.
        'transition'        : 'all 0.2s ease-in-out' // Added transition for hover effects.
    };

    // CSS properties for the main container (UL element).
    var containerPanelStyles = {
        'position'  : 'fixed',
        'padding'   : '0',
        'margin'    : '0',
        'right'     : '20px', // Adjusted position.
        'top'       : '20px', // Adjusted position.
        'z-index'   : 2147483647 // Max z-index to ensure visibility above all.
    };

    // CSS properties for the hyperlinks within list items.
    var itemLinkStyles = {
        'color'             : '#333',      // Matches list item text color.
        'font'              : 'normal 14px/1.4 Arial, sans-serif', // Matches list item font.
        'text-decoration'   : 'none',
        'display'           : 'inline-block' // Ensures proper spacing with version text.
    };

    // HTML attributes to be applied to the main UL container.
    var panelElementAttributes = {
        id      : '_lib_detection_overlay', // New, distinct ID for the panel.
        onclick : dismissPanelFunction,
        role    : 'region',                // Added ARIA role for accessibility.
        tabIndex: '0',                     // Make it focusable for keyboard users.
        title   : 'Click to close this framework detection panel' // Descriptive title for user interaction.
    };

    // ----------------------------------------------------------------------------------
    // UI Element Creation and DOM Manipulation
    // ----------------------------------------------------------------------------------

    // Create the main unordered list element which will serve as the container.
    resultListContainer = document.createElement('ul');

    // Apply the predefined attributes to the main container element.
    // Using `Object.assign` is a concise way to apply multiple properties.
    Object.assign(resultListContainer, panelElementAttributes);

    // Apply the visual styles defined for the container panel.
    applyCssProperties(resultListContainer, containerPanelStyles);

    // Append the newly created container to the document body.
    var targetBody = document.body;
    if (targetBody) {
        targetBody.appendChild(resultListContainer);
    } else {
        console.error("Document body not found. Unable to render library detection panel.");
        return; // Exit if the body element is not available.
    }

    /**
     * @function renderComponentEntry
     * @description Creates and appends a list item for a detected component to the UI panel.
     * @param {string} componentDisplayName - The user-friendly name of the component.
     * @param {string|null} [detectedVersion] - The version string found, or null if not applicable.
     * @param {Object} [cdnPackageInfo] - Optional package information fetched from cdnjs.
     */
    var renderComponentEntry = function(componentDisplayName, detectedVersion, cdnPackageInfo) {
        var pkgData = cdnPackageInfo || {}; // Ensure pkgData is always an object.

        var latestCdnVersion = pkgData.version || null,
            componentHomepage = pkgData.homepage || '',
            componentDescription = pkgData.description || 'No detailed description available.';

        // Augment the description with the latest CDNJS version if present.
        if (latestCdnVersion) {
            componentDescription += (componentDescription ? ' | ' : '') + 'Latest CDN: ' + latestCdnVersion;
        }

        // Create the list item element for the component.
        var componentLi = document.createElement('li');
        componentLi.setAttribute('data-component-name', componentDisplayName.replace(/\s+/g, '-').toLowerCase()); // Add a data attribute for easy identification.

        // Create the anchor (link) element for the component's name.
        var componentAnchor = document.createElement('a');
        // Set the href attribute: use homepage if available, otherwise a non-navigating link.
        if (componentHomepage && componentHomepage !== '#') {
            componentAnchor.href = componentHomepage;
            componentAnchor.target = '_blank'; // Open external links in a new tab for better UX.
            componentAnchor.rel = 'noopener noreferrer'; // Security best practice for target='_blank'.
        } else {
            componentAnchor.href = 'javascript:void(0)'; // Prevent actual navigation.
            componentAnchor.style.cursor = 'default';    // Indicate it's not a clickable link.
        }
        componentAnchor.title = componentDescription; // Use the enhanced description as a tooltip.
        componentAnchor.textContent = componentDisplayName; // Directly set text content.
        applyCssProperties(componentAnchor, itemLinkStyles); // Apply specific styles for the link.

        componentLi.appendChild(componentAnchor); // Add the link to the list item.

        // Append version information if a valid version string was detected.
        if (detectedVersion && detectedVersion !== '%build%') { // '%build%' is a common placeholder to ignore.
            var versionSpan = document.createElement('span');
            versionSpan.textContent = ' (v' + detectedVersion + ')'; // Prepend 'v' for version clarity.

            // If CDNJS info is available, compare versions and style accordingly.
            if (latestCdnVersion && typeof detectedVersion === 'string') {
                var versionTextNode = document.createElement('span');
                versionTextNode.textContent = detectedVersion;
                // Highlight outdated versions in orange, and current versions in a subtle green.
                versionTextNode.style.color = (latestCdnVersion !== detectedVersion) ? '#ff8c00' : '#28a745'; // Orange for mismatch, green for match.
                versionSpan.innerHTML = ' (v'; // Rebuild innerHTML to insert styled span.
                versionSpan.appendChild(versionTextNode);
                versionSpan.appendChild(document.createTextNode(')'));
            }
            componentLi.appendChild(versionSpan);
        }

        applyCssProperties(componentLi, componentListItemStyles); // Apply list item specific styles.
        resultListContainer.appendChild(componentLi); // Add the complete list item to the main panel.
    };

    /**
     * @function performLibraryScan
     * @description Iterates through defined components, attempts to detect them in the global scope,
     *              and displays detected ones in the UI panel.
     */
    var performLibraryScan = function() {
        var detectedCount = 0; // Counter for successfully identified libraries.
        var availableCdnPackages = window.cachedCdnData || {}; // Use cached CDN data or an empty object.

        // Iterate over each component definition in our manifest.
        for (var componentKey in componentManifest) {
            // Ensure we only process properties directly owned by the object, not inherited ones.
            if (!Object.prototype.hasOwnProperty.call(componentManifest, componentKey)) {
                continue;
            }

            var currentComponent = componentManifest[componentKey];
            // Basic validation for component definition structure.
            if (!currentComponent || !Array.isArray(currentComponent.lookupPaths) || currentComponent.lookupPaths.length === 0) {
                console.warn("Skipping malformed component definition for key:", componentKey);
                continue;
            }

            var foundThisComponent = false; // Flag to stop checking paths once found.
            // Loop through all possible version lookup paths for the current component.
            for (var i = 0; i < currentComponent.lookupPaths.length; i++) {
                var currentLookupPath = currentComponent.lookupPaths[i];
                var pathSegments = currentLookupPath.split('.');

                // Use `reduce` to safely traverse the global `window` object based on path segments.
                // This gracefully handles cases where intermediate objects in the path might not exist.
                var valueAtResolvedPath = pathSegments.reduce(function(accumulator, segment) {
                    // If `accumulator` is null/undefined or not an object, further traversal is impossible.
                    return (accumulator && typeof accumulator === 'object' && Object.prototype.hasOwnProperty.call(accumulator, segment)) ? accumulator[segment] : undefined;
                }, window); // Start the reduction from the global `window` object.

                // If a value was successfully found at the specified path.
                if (valueAtResolvedPath !== undefined) {
                    var componentVersion = null;
                    // Attempt to extract a version string from the found value.
                    if (typeof valueAtResolvedPath === 'string' && !valueAtResolvedPath.match(/^<%=[^%]+%>$/)) { // Exclude template placeholder strings.
                        componentVersion = valueAtResolvedPath;
                    } else if (typeof valueAtResolvedPath === 'object' && valueAtResolvedPath !== null && typeof valueAtResolvedPath.toString === 'function') {
                        var stringRepresentation = valueAtResolvedPath.toString();
                        // Only consider meaningful `toString` results as versions.
                        if (stringRepresentation && stringRepresentation !== '[object Object]' && stringRepresentation !== '[object Function]') {
                            componentVersion = stringRepresentation;
                        }
                    }

                    if (componentVersion !== null) {
                        // Clean up the version string: remove parenthesized build numbers and trim whitespace.
                        componentVersion = String(componentVersion).replace(/\s*\(.+\)\s*|^\s+|\s+$/g, '');

                        // Retrieve associated CDNJS package data if an identifier is provided.
                        var cdnInfo = currentComponent.cdnIdentifier ? availableCdnPackages[currentComponent.cdnIdentifier] : null;
                        renderComponentEntry(componentKey, componentVersion, cdnInfo);
                        detectedCount++;
                        foundThisComponent = true;
                        break; // Stop checking other paths for this component once a version is found.
                    }
                }
            }
            if (foundThisComponent) {
                console.log("Found: " + componentKey + (componentVersion ? " (v" + componentVersion + ")" : ""));
            }
        }

        // If no libraries were detected, display a default message.
        if (detectedCount === 0) {
            renderComponentEntry('No known libraries detected on this page.');
            console.warn("No known JavaScript libraries were identified during the scan.");
        } else {
            console.info("Library scan completed. " + detectedCount + " components identified.");
        }
    };

    // ----------------------------------------------------------------------------------
    // Main Execution Logic: Fetch CDNJS Data or Run Scan
    // ----------------------------------------------------------------------------------

    // Check if CDNJS package data has already been loaded and cached in the global scope.
    if (!window.cachedCdnData) {
        console.info("Initiating request to fetch CDNJS package metadata via YQL proxy...");

        // Define the JSONP callback function in the global scope.
        window.handleCdnPackageResponse = function(responseData) {
            // Validate the structure of the JSONP response.
            if (!responseData || !responseData.query || !responseData.query.results ||
                !responseData.query.results.json || !Array.isArray(responseData.query.results.json.packages)) {
                console.error("Invalid or unexpected CDNJS package data format received.");
                performLibraryScan(); // Proceed with scan even if CDN data is unusable.
                return;
            }

            var rawPackagesArray = responseData.query.results.json.packages;
            var processedPackageMap = {};
            try {
                // Transform the array of packages into a hash map for efficient lookup by name.
                rawPackagesArray.forEach(function(pkg) {
                    if (pkg && pkg.name) {
                        processedPackageMap[pkg.name.toLowerCase()] = pkg;
                    }
                });
                window.cachedCdnData = processedPackageMap; // Cache the processed data globally.
                console.info("Successfully processed " + Object.keys(processedPackageMap).length + " CDNJS packages.");
                performLibraryScan(); // Now, execute the library scan with the fetched data.
            } catch (error) {
                console.error("Error during processing of CDNJS package data:", error);
                performLibraryScan(); // Fallback: run scan without CDN data if processing fails.
            } finally {
                // Clean up the dynamically added script tag and the global callback function.
                if (jsonpRequestScript && jsonpRequestScript.parentNode) {
                    jsonpRequestScript.parentNode.removeChild(jsonpRequestScript);
                }
                delete window.handleCdnPackageResponse;
                clearTimeout(jsonpFetchTimeout); // Clear the timeout as the request completed.
            }
        };

        // Create a new script element for the JSONP request.
        var jsonpRequestScript = document.createElement('script');
        // The YQL (Yahoo Query Language) endpoint acts as a proxy for cross-domain JSON requests.
        // It fetches packages.min.json from cdnjs.com and wraps it in a JSONP callback.
        var proxyUrl = "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'https%3A%2F%2Fcdnjs.com%2Fpackages.min.json'&format=json&callback=handleCdnPackageResponse";
        jsonpRequestScript.setAttribute('src', proxyUrl);
        jsonpRequestScript.setAttribute('async', 'true'); // Load the script asynchronously.

        var documentHead = document.head || document.getElementsByTagName('head')[0];
        if (documentHead) {
            documentHead.appendChild(jsonpRequestScript);
        } else {
            console.error("Document <head> element not found. Cannot load CDNJS data.");
            performLibraryScan(); // Proceed without CDNJS data if head is missing.
            return;
        }

        // Implement a timeout to handle cases where the JSONP request might fail or hang indefinitely.
        var jsonpFetchTimeout = setTimeout(function() {
            console.warn("CDNJS package data request timed out after 10 seconds. Proceeding without full package information.");
            // Clean up the script tag if it's still in the DOM.
            if (jsonpRequestScript && jsonpRequestScript.parentNode) {
                jsonpRequestScript.parentNode.removeChild(jsonpRequestScript);
            }
            delete window.handleCdnPackageResponse; // Remove the global callback to avoid conflicts.
            performLibraryScan(); // Execute the scan with whatever data is locally available (or none).
        }, 10000); // 10-second timeout for the JSONP request.

    } else {
        // If CDNJS package data is already present in the cache, proceed directly to the scan.
        console.info("CDNJS package data already available in cache. Initiating library scan.");
        performLibraryScan();
    }
})();