/*
 *  ImageSurrogate - v2.1 - Client-side image replacement utility
 *  (c) 2023 Acme Corp. / acmecorp.com
 *
 *  Distributed under the MIT License.
 *  Commercial use is permitted.
 *
 *  This script dynamically generates placeholder images or background
 *  styles based on specified parameters embedded in image `src`, `data-src`,
 *  or element `background-image` attributes. It supports fixed dimensions,
 *  fluid dimensions, custom text, colors, and fonts.
 */

var PlaceholderGen = PlaceholderGen || {};
(function (generator, globalScope) {

    // Internal flags and shared resources for placeholder generation
    var isModuleInitialized = false; // Tracks if the module has run its initial setup
    var requiresImageFallback = false; // True if canvas or data URLs are not supported for image generation
    var drawingCanvas = globalScope.document.createElement('canvas'); // Offscreen canvas for drawing
    var canvasContext = null; // 2D rendering context for the canvas, initialized if canvas is supported

    // --- Polyfills and Utility Functions (Rewritten/Simplified) ---

    // Simplified getElementsByClassName polyfill for older browsers
    if (!globalScope.document.getElementsByClassName) {
        globalScope.document.getElementsByClassName = function (targetClassName) {
            var collectedElements = [];
            var allPageElements = globalScope.document.getElementsByTagName('*');
            var classMatchPattern = new RegExp('(^|\\s)' + targetClassName + '(\\s|$)');
            for (var k = 0, numElements = allPageElements.length; k < numElements; k++) {
                if (classMatchPattern.test(allPageElements[k].className)) {
                    collectedElements.push(allPageElements[k]);
                }
            }
            return collectedElements;
        };
    }

    // Simplified getComputedStyle polyfill for older browsers
    if (!globalScope.getComputedStyle) {
        globalScope.getComputedStyle = function (targetElement) {
            // Basic fallback for IE < 9 using currentStyle
            return {
                getPropertyValue: function (cssProperty) {
                    // Convert CSS property name (e.g., 'background-image') to camelCase ('backgroundImage')
                    var camelCaseProperty = cssProperty.replace(/-(\w)/g, function (match, p1) {
                        return p1.toUpperCase();
                    });
                    return targetElement.currentStyle ? targetElement.currentStyle[camelCaseProperty] : null;
                }
            };
        };
    }

    // Custom DOM ready event handler (rewritten for modern event listeners with fallbacks)
    function onDomReady(readyCallback) {
        var domIsReady = false;
        var currentDocument = globalScope.document;

        function executeCallback() {
            if (!domIsReady) {
                domIsReady = true;
                readyCallback();
            }
        }

        // Check if the DOM is already fully loaded
        if (currentDocument.readyState === 'complete' || (currentDocument.readyState !== 'loading' && !currentDocument.documentElement.doScroll)) {
            executeCallback();
        } else {
            // Standard event listener for DOMContentLoaded
            currentDocument.addEventListener('DOMContentLoaded', executeCallback, false);
            // Fallback to window load event for comprehensive coverage
            globalScope.addEventListener('load', executeCallback, false);
            // IE-specific hack for older versions
            if (currentDocument.documentElement.doScroll && globalScope === globalScope.top) {
                (function checkDoScroll() {
                    try {
                        currentDocument.documentElement.doScroll('left');
                        executeCallback();
                    } catch (e) {
                        setTimeout(checkDoScroll, 50); // Retry until successful
                    }
                })();
            }
        }
    }

    // Generalized element selection utility (rewritten to use native methods)
    function selectElements(cssSelector) {
        var foundElements = [];
        if (!cssSelector || typeof cssSelector !== 'string') {
            return foundElements;
        }

        var firstChar = cssSelector.charAt(0);
        var querySubstring = cssSelector.substring(1);

        if (firstChar === '#') { // Select by ID
            var elementById = globalScope.document.getElementById(querySubstring);
            if (elementById) {
                foundElements.push(elementById);
            }
        } else if (firstChar === '.') { // Select by Class Name
            var elementsByClass = globalScope.document.getElementsByClassName(querySubstring);
            for (var i = 0, numNodes = elementsByClass.length; i < numNodes; i++) {
                foundElements.push(elementsByClass[i]);
            }
        } else { // Assume Tag Name
            var elementsByTag = globalScope.document.getElementsByTagName(cssSelector);
            for (var i = 0, numNodes = elementsByTag.length; i < numNodes; i++) {
                foundElements.push(elementsByTag[i]);
            }
        }
        return foundElements;
    }

    // Shallow object merge utility for configuration objects
    function mergeObjects(targetObj, sourceObj) {
        var mergedResult = {};
        for (var key in targetObj) {
            if (targetObj.hasOwnProperty(key)) {
                mergedResult[key] = targetObj[key];
            }
        }
        for (var key in sourceObj) {
            if (sourceObj.hasOwnProperty(key)) {
                mergedResult[key] = sourceObj[key];
            }
        }
        return mergedResult;
    }

    // hasOwnProperty polyfill - simplified for basic compatibility
    if (!Object.prototype.hasOwnProperty) {
        // This is a very basic, non-spec-compliant polyfill, primarily for environments
        // where it's completely missing. Most modern engines don't need this.
        Object.prototype.hasOwnProperty = function (property) {
            var currentObj = this;
            if (currentObj === null || typeof currentObj === 'undefined') {
                return false;
            }
            // Check if the property exists directly on the object (not inherited)
            return Object.prototype.toString.call(currentObj[property]) !== '[object Function]' &&
                   Object.prototype.toString.call(currentObj) === '[object Object]' &&
                   currentObj.constructor === Object &&
                   currentObj[property] !== undefined;
        };
    }

    // --- Core Placeholder Generation Logic ---

    /**
     * Calculates optimal text size for the placeholder to fit within given dimensions.
     * @param {number} elementWidth - The width of the placeholder area.
     * @param {number} elementHeight - The height of the placeholder area.
     * @param {object} themeSettings - Theme configuration including `size` for base font.
     * @returns {object} An object containing the calculated `height` for the text.
     */
    function calculateTextMetrics(elementWidth, elementHeight, themeSettings) {
        var dimensionsArray = [elementHeight, elementWidth].sort(function(a, b){ return a - b; });
        var maxDimensionFactor = Math.round(dimensionsArray[1] / 18); // Scale based on larger dimension
        var minDimensionFactor = Math.round(dimensionsArray[0] / 18); // Scale based on smaller dimension
        var effectiveTextHeight = Math.max(themeSettings.size, maxDimensionFactor);
        
        // Ensure a minimum readable font size for very small placeholders
        if (effectiveTextHeight < 8) {
            effectiveTextHeight = 8;
        }

        return {
            height: effectiveTextHeight
        };
    }

    /**
     * Draws the placeholder image onto the canvas and returns its data URL.
     * @param {CanvasRenderingContext2D} ctx2D - The 2D rendering context of the canvas.
     * @param {object} dimensions - Object with `width` and `height` properties.
     * @param {object} styleConfiguration - Styling config: `background`, `foreground`, `text`, `font`.
     * @param {number} pixelRatio - Device pixel ratio for high-DPI screens.
     * @returns {string} A data URL representing the generated image (e.g., "data:image/png;base64,...").
     */
    function generateImageData(ctx2D, dimensions, styleConfiguration, pixelRatio) {
        if (!ctx2D || !dimensions || !styleConfiguration) {
            console.error("Image data generation failed: missing essential parameters.");
            return "";
        }

        var textProperties = calculateTextMetrics(dimensions.width, dimensions.height, styleConfiguration);
        var textPixelHeight = textProperties.height;
        var canvasRenderWidth = dimensions.width * pixelRatio;
        var canvasRenderHeight = dimensions.height * pixelRatio;
        var preferredFont = styleConfiguration.font || "sans-serif";

        drawingCanvas.width = canvasRenderWidth;
        drawingCanvas.height = canvasRenderHeight;

        ctx2D.textAlign = "center";
        ctx2D.textBaseline = "middle";

        // Fill background
        ctx2D.fillStyle = styleConfiguration.background;
        ctx2D.fillRect(0, 0, canvasRenderWidth, canvasRenderHeight);

        // Set text color and content
        ctx2D.fillStyle = styleConfiguration.foreground;
        var textToDisplay = styleConfiguration.text || (dimensions.width + "x" + dimensions.height);
        
        // Dynamic font size adjustment to prevent overflow
        var currentCalculatedFontSize = textPixelHeight;
        ctx2D.font = "bold " + currentCalculatedFontSize + "px " + preferredFont;
        var measuredTextWidth = ctx2D.measureText(textToDisplay).width;

        // If text is too wide, scale down the font size
        if (measuredTextWidth / canvasRenderWidth > 0.9) { // Allow up to 90% of width
            currentCalculatedFontSize = currentCalculatedFontSize * (canvasRenderWidth * 0.9 / measuredTextWidth);
        }
        
        // Apply final font style, scaled by pixel ratio for crispness
        ctx2D.font = "bold " + (currentCalculatedFontSize * pixelRatio) + "px " + preferredFont;
        ctx2D.fillText(textToDisplay, (canvasRenderWidth / 2), (canvasRenderHeight / 2), canvasRenderWidth);
        
        // Optional: Add a subtle border if background and foreground are too similar
        if (styleConfiguration.background === styleConfiguration.foreground && styleConfiguration.background !== '#FFF' && styleConfiguration.background !== '#000') {
             ctx2D.strokeStyle = styleConfiguration.foreground === '#000' ? '#FFF' : '#000';
             ctx2D.lineWidth = 1 * pixelRatio;
             ctx2D.strokeRect(0, 0, canvasRenderWidth, canvasRenderHeight);
        }

        return drawingCanvas.toDataURL("image/png");
    }

    /**
     * Applies the generated placeholder (either as an <img> src or CSS background-image)
     * to a target DOM element.
     * @param {string} mode - "image" for <img> elements, "background" for other elements.
     * @param {HTMLElement} targetElement - The DOM element to apply the placeholder to.
     * @param {object} placeholderData - Parsed configuration for the placeholder.
     * @param {string} originalSourceString - The original attribute value (e.g., data-src, background-image URL).
     */
    function applyPlaceholderToElement(mode, targetElement, placeholderData, originalSourceString) {
        var elementDimensions = placeholderData.dimensions;
        var elementTheme = placeholderData.theme;
        var userDefinedText = placeholderData.text ? decodeURIComponent(placeholderData.text) : placeholderData.text;

        // Merge user-defined text and font into the theme for rendering
        if (userDefinedText) {
            elementTheme = mergeObjects(elementTheme, { text: userDefinedText });
        }
        if (placeholderData.font) {
            elementTheme = mergeObjects(elementTheme, { font: placeholderData.font });
        }

        var currentPixelRatio = 1;
        if (globalScope.devicePixelRatio && globalScope.devicePixelRatio > 1) {
            currentPixelRatio = globalScope.devicePixelRatio;
        }
        
        // Guard clause: do not render if dimensions are invalid
        if (elementDimensions.width < 1 || elementDimensions.height < 1) {
            console.warn("Skipping placeholder rendering due to invalid dimensions:", elementDimensions);
            return;
        }

        if (mode === "image") {
            targetElement.setAttribute("data-original-src", originalSourceString); // Preserve original source
            var displayAltText = userDefinedText || elementTheme.text || (elementDimensions.width + "x" + elementDimensions.height);
            targetElement.setAttribute("alt", displayAltText + " [Image Surrogate]");
            targetElement.style.width = elementDimensions.width + "px";
            targetElement.style.height = elementDimensions.height + "px";

            if (requiresImageFallback) {
                // Fallback for browsers without canvas or data URL support
                targetElement.style.backgroundColor = elementTheme.background;
                targetElement.style.color = elementTheme.foreground;
                targetElement.textContent = displayAltText; // Display text directly
                targetElement.style.display = 'flex'; // Use flex for centering text
                targetElement.style.alignItems = 'center';
                targetElement.style.justifyContent = 'center';
                targetElement.style.fontFamily = elementTheme.font || 'sans-serif';
                targetElement.style.fontSize = elementTheme.size + 'px';
            } else {
                // Render via canvas and set as image src
                targetElement.setAttribute("src", generateImageData(canvasContext, elementDimensions, elementTheme, currentPixelRatio));
            }
        } else if (mode === "background") {
            if (!requiresImageFallback) {
                // Render via canvas and set as background-image
                targetElement.style.backgroundImage = "url(" + generateImageData(canvasContext, elementDimensions, elementTheme, currentPixelRatio) + ")";
                targetElement.style.backgroundSize = elementDimensions.width + "px " + elementDimensions.height + "px";
                targetElement.style.backgroundRepeat = "no-repeat"; // Prevent tiling
                targetElement.style.backgroundPosition = "center center"; // Center the background
            } else {
                // Fallback for background elements
                targetElement.style.backgroundColor = elementTheme.background;
                targetElement.style.color = elementTheme.foreground;
                targetElement.textContent = userDefinedText || elementTheme.text || (elementDimensions.width + "x" + elementDimensions.height);
                targetElement.style.display = 'flex';
                targetElement.style.alignItems = 'center';
                targetElement.style.justifyContent = 'center';
                targetElement.style.fontFamily = elementTheme.font || 'sans-serif';
                targetElement.style.fontSize = elementTheme.size + 'px';
            }
        }
    }

    // Array to hold references to fluid placeholder elements that need dynamic updates
    var dynamicElements = [];

    /**
     * Handles fluid (percentage-based or auto-resizing) placeholders.
     * For fluid placeholders, a dynamic `div` replaces the original image,
     * and its text content is updated on resize events.
     * @param {HTMLElement} originalElement - The original <img> element that triggered the fluid placeholder.
     * @param {object} placeholderData - Parsed configuration for the fluid placeholder.
     * @param {string} originalSourceString - The original `src` or `data-src` string.
     */
    function handleFluidPlaceholder(originalElement, placeholderData, originalSourceString) {
        var dimensionConfig = placeholderData.dimensions;
        var themeConfig = placeholderData.theme;
        var userText = placeholderData.text;

        if (userText) {
            themeConfig = mergeObjects(themeConfig, { text: userText });
        }

        var surrogateDiv = globalScope.document.createElement("div");

        surrogateDiv.style.backgroundColor = themeConfig.background;
        surrogateDiv.style.color = themeConfig.foreground;
        surrogateDiv.className = originalElement.className + " surrogate-fluid-element"; // Add a specific class
        surrogateDiv.style.width = dimensionConfig.width + (String(dimensionConfig.width).indexOf("%") > -1 ? "" : "px");
        surrogateDiv.style.height = dimensionConfig.height + (String(dimensionConfig.height).indexOf("%") > -1 ? "" : "px");
        surrogateDiv.id = originalElement.id ? originalElement.id + "-surrogate" : ''; // Assign a derived ID
        
        // Apply styling for text centering and appearance
        surrogateDiv.style.display = 'flex';
        surrogateDiv.style.alignItems = 'center';
        surrogateDiv.style.justifyContent = 'center';
        surrogateDiv.style.fontWeight = 'bold';
        surrogateDiv.style.fontFamily = themeConfig.font || 'sans-serif';
        surrogateDiv.style.fontSize = themeConfig.size + 'px'; // Base font size from theme

        var textContentNode = globalScope.document.createTextNode(themeConfig.text || "Loading...");
        surrogateDiv.appendChild(textContentNode);

        // Hide the original image element and insert the new fluid div
        originalElement.style.width = '0px';
        originalElement.style.height = '0px';
        originalElement.style.display = 'none';
        originalElement.parentNode.insertBefore(surrogateDiv, originalElement.nextSibling);

        // Store references for later updates on resize
        dynamicElements.push({ element: surrogateDiv, textNode: textContentNode, theme: themeConfig });

        // Trigger an initial update to set correct dimensions/text after insertion
        setTimeout(updateFluidPlaceholders, 0);

        // New feature: If the original image eventually loads, replace the fluid placeholder with it.
        originalElement.addEventListener('load', function() {
            // Check if image actually loaded (naturalWidth > 0)
            if (originalElement.naturalWidth > 0 && originalElement.naturalHeight > 0) {
                originalElement.style.display = ''; // Show the actual image
                originalElement.style.width = surrogateDiv.style.width; // Restore dimensions
                originalElement.style.height = surrogateDiv.style.height;
                if (surrogateDiv.parentNode) {
                    surrogateDiv.parentNode.removeChild(surrogateDiv); // Remove the placeholder
                }
            }
        });
    }

    /**
     * Iterates through all registered fluid placeholders and updates their
     * text content and styling based on current element dimensions.
     * This function is typically bound to window resize and orientation change events.
     */
    function updateFluidPlaceholders() {
        // Iterate backwards to safely remove elements if they've been detached
        for (var i = dynamicElements.length - 1; i >= 0; i--) {
            var item = dynamicElements[i];
            var currentElement = item.element;
            var currentTextNode = item.textNode;
            var currentTheme = item.theme;

            // Remove item from array if element is no longer in the DOM
            if (!currentElement.parentNode) {
                dynamicElements.splice(i, 1);
                continue;
            }

            var actualWidth = currentElement.offsetWidth;
            var actualHeight = currentElement.offsetHeight;

            // Update text to reflect current dimensions
            currentTextNode.data = currentTheme.text || (actualWidth + "x" + actualHeight);
            
            // Adjust line-height for vertical centering
            currentElement.style.lineHeight = actualHeight + "px";
            
            // Recalculate and apply font size to ensure text fits
            var newFontSize = calculateTextMetrics(actualWidth, actualHeight, currentTheme).height;
            currentElement.style.fontSize = Math.max(8, newFontSize) + "px"; // Ensure minimum font size
        }
    }

    /**
     * Parses configuration flags from an array of strings (e.g., "300x200", "#FFF:#000").
     * @param {string[]} flagStringsArray - Array of flag strings.
     * @param {object} runtimeOptions - Options passed to the `processPlaceholders` method.
     * @returns {object|boolean} A parsed configuration object or `false` if no valid dimensions were found.
     */
    function processConfigurationFlags(flagStringsArray, runtimeOptions) {
        var parsedConfig = {
            theme: globalSettings.themes.gray // Start with the default gray theme
        };
        var hasValidDimensions = false; // Flag to ensure at least dimensions are parsed

        // Guard clause for empty or invalid input
        if (!Array.isArray(flagStringsArray) || flagStringsArray.length === 0) {
            return false;
        }

        for (var idx = 0; idx < flagStringsArray.length; idx++) {
            var currentFlag = flagStringsArray[idx];

            if (generator.configs.dimensions.matcher(currentFlag)) {
                parsedConfig.dimensions = generator.configs.dimensions.extractor(currentFlag);
                hasValidDimensions = true;
            } else if (generator.configs.fluid.matcher(currentFlag)) {
                parsedConfig.dimensions = generator.configs.fluid.extractor(currentFlag);
                parsedConfig.fluid = true; // Mark as a fluid placeholder
                hasValidDimensions = true;
            } else if (generator.configs.colors.matcher(currentFlag)) {
                parsedConfig.theme = generator.configs.colors.extractor(currentFlag);
            } else if (runtimeOptions.themes && runtimeOptions.themes[currentFlag]) {
                // If a named theme is provided, it takes precedence over custom colors
                parsedConfig.theme = mergeObjects(parsedConfig.theme, runtimeOptions.themes[currentFlag]);
            } else if (generator.configs.text.matcher(currentFlag)) {
                parsedConfig.text = generator.configs.text.extractor(currentFlag);
            } else if (generator.configs.font.matcher(currentFlag)) {
                parsedConfig.font = generator.configs.font.extractor(currentFlag);
            }
        }

        // Only return a config object if dimensions were successfully parsed
        return hasValidDimensions ? parsedConfig : false;
    }

    // --- Canvas Capability Check ---
    // This block runs immediately to determine if canvas rendering is supported.
    if (!drawingCanvas.getContext) {
        requiresImageFallback = true;
    } else {
        canvasContext = drawingCanvas.getContext("2d");
        // Further check: does the canvas support toDataURL for image export?
        if (drawingCanvas.toDataURL("image/png").indexOf("data:image/png") < 0) {
            requiresImageFallback = true;
        }
    }

    // --- Global Configuration and Public API ---

    var globalSettings = {
        pluginDomain: "imagesurrogate.net", // Identifier string used in URLs/background-images
        imageSelectors: "img", // Default CSS selector for image elements
        elementSelectors: ".surrogate", // Default CSS selector for generic elements
        themes: {
            "gray": {
                background: "#EEE",
                foreground: "#AAA",
                size: 12,
                font: "sans-serif"
            },
            "corporate": { // A new theme example
                background: "#34495E",
                foreground: "#ECF0F1",
                size: 14,
                font: "Roboto, sans-serif"
            },
            "vibrant": {
                background: "#FF6B6B",
                foreground: "#FFE66D",
                size: 16,
                font: "Impact, sans-serif"
            }
        },
        // Custom stylesheet injected for fluid elements, ensuring proper rendering
        fluidStylesheet: ".surrogate-fluid-element {font-size:16px;font-weight:bold;text-align:center;font-family:sans-serif;margin:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}"
    };

    // Configuration definitions for parsing flags (regex patterns and extractors)
    generator.configs = {
        dimensions: {
            regex: /^(\d+)x(\d+)$/, // Matches fixed width x height
            extractor: function (value) {
                var match = this.regex.exec(value);
                return {
                    width: parseInt(match[1], 10),
                    height: parseInt(match[2], 10)
                };
            }
        },
        fluid: {
            regex: /^([0-9%]+)x([0-9%]+)$/, // Matches fluid width x height (e.g., "100%x200")
            extractor: function (value) {
                var match = this.regex.exec(value);
                return {
                    width: match[1],
                    height: match[2]
                };
            }
        },
        colors: {
            regex: /#([0-9a-fA-F]{3,6})\:#([0-9a-fA-F]{3,6})/, // Matches two hex color codes
            extractor: function (value) {
                var match = this.regex.exec(value);
                return {
                    size: globalSettings.themes.gray.size, // Inherit default text size
                    foreground: "#" + match[2],
                    background: "#" + match[1]
                };
            }
        },
        text: {
            regex: /text\:(.*)/, // Matches custom text string
            extractor: function (value) {
                return this.regex.exec(value)[1];
            }
        },
        font: {
            regex: /font\:(.*)/, // Matches custom font family
            extractor: function (value) {
                return this.regex.exec(value)[1];
            }
        }
    };

    // Attach a common `matcher` function to all configuration objects for convenience
    for (var configKey in generator.configs) {
        if (generator.configs.hasOwnProperty(configKey)) {
            generator.configs[configKey].matcher = function (value) {
                return this.regex.test(value); // Use `test` for efficient boolean check
            };
        }
    }

    /**
     * Defines a new custom theme that can be referenced by name.
     * @param {string} themeName - The unique name for the new theme.
     * @param {object} themeConfiguration - Object with `background`, `foreground`, `size`, `font` properties.
     * @returns {object} The PlaceholderGen object for method chaining.
     */
    generator.defineTheme = function (themeName, themeConfiguration) {
        if (themeName && themeConfiguration && typeof themeConfiguration === 'object') {
            // Merge with a base theme (e.g., gray) to ensure all properties are present
            globalSettings.themes[themeName] = mergeObjects(globalSettings.themes.gray, themeConfiguration);
        }
        return generator;
    };

    /**
     * Programmatically adds an image placeholder to a specified DOM node.
     * This is useful for dynamically generated content.
     * @param {string} dataSourceString - The full placeholder data string (e.g., "imagesurrogate.net/200x100/text:Hello").
     * @param {string} parentSelector - CSS selector for the parent element where the image will be appended.
     * @returns {object} The PlaceholderGen object for method chaining.
     */
    generator.insertImage = function (dataSourceString, parentSelector) {
        var parentNodes = selectElements(parentSelector);
        if (parentNodes.length) {
            for (var i = 0, len = parentNodes.length; i < len; i++) {
                var newImageElement = globalScope.document.createElement("img");
                newImageElement.setAttribute("data-src", dataSourceString); // Use data-src for consistent parsing
                parentNodes[i].appendChild(newImageElement);
            }
        }
        return generator;
    };

    /**
     * Initiates the placeholder generation and application process across the document.
     * This method searches for elements matching configured selectors and applies placeholders.
     * @param {object} [overrideOptions] - Optional object to override default settings (e.g., `pluginDomain`, `themes`).
     * @returns {object} The PlaceholderGen object for method chaining.
     */
    generator.processPlaceholders = function (overrideOptions) {
        var effectiveOptions = mergeObjects(globalSettings, overrideOptions || {});

        // Gather elements to be processed
        var imageTargets = selectElements(effectiveOptions.imageSelectors);
        var genericTargets = selectElements(effectiveOptions.elementSelectors);

        // Guard clause: Early exit if no elements are found to process
        if (imageTargets.length === 0 && genericTargets.length === 0) {
            console.info("ImageSurrogate: No elements found matching configured selectors. Skipping processing.");
            return generator;
        }

        // Inject the custom stylesheet for fluid elements into the document head
        var styleTag = globalScope.document.createElement("style");
        styleTag.type = "text/css";
        if (styleTag.styleSheet) { // IE compatibility
            styleTag.styleSheet.cssText = effectiveOptions.fluidStylesheet;
        } else {
            styleTag.textContent = effectiveOptions.fluidStylesheet;
        }
        globalScope.document.getElementsByTagName("head")[0].appendChild(styleTag);

        // Regex to extract flags from background-image URLs that contain the plugin domain
        var backgroundFlagExtractorRegex = new RegExp(effectiveOptions.pluginDomain + "\\/(.*?)\"?\\)");

        // Process generic elements (e.g., divs with background-image styles)
        for (var i = 0; i < genericTargets.length; i++) {
            var currentTargetElement = genericTargets[i];
            var computedBackground = globalScope.getComputedStyle(currentTargetElement, null).getPropertyValue("background-image");
            var flagMatches = computedBackground ? computedBackground.match(backgroundFlagExtractorRegex) : null;

            if (flagMatches && flagMatches[1]) {
                var placeholderConfig = processConfigurationFlags(flagMatches[1].split("/"), effectiveOptions);
                if (placeholderConfig) {
                    applyPlaceholderToElement("background", currentTargetElement, placeholderConfig, computedBackground);
                }
            }
        }

        // Process image elements (<img> tags)
        for (var j = 0; j < imageTargets.length; j++) {
            var currentImageElement = imageTargets[j];
            var imageSrc = currentImageElement.getAttribute("src") || currentImageElement.getAttribute("data-src");

            if (imageSrc && imageSrc.indexOf(effectiveOptions.pluginDomain) > -1) {
                // Extract flags from the URL path after the plugin domain
                var urlPathSegment = imageSrc.substring(imageSrc.lastIndexOf(effectiveOptions.pluginDomain) + effectiveOptions.pluginDomain.length + 1);
                var placeholderConfig = processConfigurationFlags(urlPathSegment.split("/"), effectiveOptions);

                if (placeholderConfig) {
                    if (placeholderConfig.fluid) {
                        handleFluidPlaceholder(currentImageElement, placeholderConfig, imageSrc);
                    } else {
                        applyPlaceholderToElement("image", currentImageElement, placeholderConfig, imageSrc);
                    }
                }
            }
        }
        
        isModuleInitialized = true; // Mark that the module has completed its initial run
        return generator;
    };

    // --- Event Listeners and Module Initialization ---

    // Ensure placeholders are processed once the DOM is ready
    onDomReady(function () {
        // Attach resize and orientationchange listeners for fluid elements
        if (globalScope.addEventListener) {
            globalScope.addEventListener("resize", updateFluidPlaceholders, false);
            globalScope.addEventListener("orientationchange", updateFluidPlaceholders, false);
        } else { // Fallback for older IE versions
            globalScope.attachEvent("onresize", updateFluidPlaceholders);
        }
        
        // Automatically run placeholder processing if not explicitly called before DOM ready
        if (!isModuleInitialized) {
            generator.processPlaceholders();
        }
    });

    // --- AMD / RequireJS Compatibility ---
    // Allow the module to be loaded via AMD loaders if available
    if (typeof define === "function" && define.amd) {
        define("PlaceholderGen", [], function () {
            return generator;
        });
    }

})(PlaceholderGen, window);