/**
 * ChromaHub - A versatile color selection utility for web applications.
 *
 * This version is a Type III clone, featuring significant structural,
 * naming, and logical modifications while preserving core functionality.
 *
 * @version 2.0.0 (Type III Clone)
 * @license Reimagined under MIT-like terms.
 * @author  Anonymized Developer Group
 * @created 2023-01-01
 * @updated 2024-03-15
 * @link    https://chromahub.dev (fictitious)
 */

var ChromaHub = {

    // --- Global Configuration & State ---
    assetDirectory : '', // Base path for visual assets (e.g., images). Auto-detected if empty.
    triggerClass : 'chroma-input', // CSS class to automatically activate color pickers.
    autoActivate : true, // Enable automatic binding of pickers to elements with `triggerClass`.
    preLoadAssets : true, // Should core images be preloaded for quicker UI response?
    debugMode : false, // Enable verbose console logging for development.

    // Internal storage for visual assets and their loading status
    visualAssets : {
        huePad : [ 181, 101 ],       // Dimensions for hue/saturation pad image
        valSlide : [ 16, 101 ],      // Dimensions for value/lightness slider image
        pointerCross : [ 15, 15 ],   // Dimensions for crosshair pointer
        arrowIndicator : [ 7, 11 ]   // Dimensions for slider arrow
    },
    pendingLoads : {}, // Tracks image filenames that need to be loaded
    cachedImages : {}, // Stores loaded Image objects, keyed by filename


    // --- Core Lifecycle Management ---
    initLifecycle : function() {
        // Attach the primary setup routine to the window's load event
        ChromaHub.subscribeToEvent(window, 'load', ChromaHub.performInitialSetup);
    },

    // Main initialization routine executed once the page and resources are ready
    performInitialSetup : function() {
        if (ChromaHub.debugMode) console.log('ChromaHub: Initializing system...');

        if (ChromaHub.autoActivate) {
            ChromaHub.applyAutoActivation();
        }
        if (ChromaHub.preLoadAssets) {
            ChromaHub.commenceAssetPreload();
        }

        if (ChromaHub.debugMode) console.log('ChromaHub: System initialization complete.');
    },


    // --- Asset Path Resolution ---
    resolveAssetPath : function() {
        if (!ChromaHub.assetDirectory) {
            var discoveredPath = ChromaHub.discernAssetLocation();
            ChromaHub.assetDirectory = discoveredPath || 'chromahub/'; // Fallback if detection fails
        }
        return ChromaHub.assetDirectory;
    },

    // Attempts to automatically determine the script's own directory
    discernAssetLocation : function() {
        var currentBaseURL = window.location.href;

        // Check for <base> tag to correctly resolve relative paths
        var baseTags = document.getElementsByTagName('base');
        for (var idx = 0; idx < baseTags.length; idx++) {
            if (baseTags[idx].href) {
                currentBaseURL = baseTags[idx].href;
            }
        }

        // Iterate through all <script> tags to find the current script's source
        var scriptTags = document.getElementsByTagName('script');
        for (var idx = 0; idx < scriptTags.length; idx++) {
            var scriptSrc = scriptTags[idx].src;
            // Look for 'chromahub.js' or the original 'jscolor.js'
            if (scriptSrc && /(^|\/)(chromahub|jscolor)\.js([?#].*)?$/i.test(scriptSrc)) {
                var locationParser = new ChromaHub.ResourceLocator(scriptSrc);
                var absoluteLocation = locationParser.toAbsolute(currentBaseURL);
                absoluteLocation.path = absoluteLocation.path.replace(/[^\/]+$/, ''); // Remove filename
                absoluteLocation.query = null;    // Clear query string
                absoluteLocation.fragment = null; // Clear fragment
                return absoluteLocation.toString();
            }
        }
        return null; // No matching script found
    },


    // --- Automatic Picker Activation ---
    applyAutoActivation : function() {
        var activationPattern = new RegExp('(^|\\s)(' + ChromaHub.triggerClass + ')\\s*(\\{[^}]*\\})?', 'i');
        var inputElements = document.getElementsByTagName('input');

        for (var i = 0; i < inputElements.length; i++) {
            var currentInput = inputElements[i];
            var matchResult;

            // Check if the input element has the trigger class and hasn't been initialized yet
            if (!currentInput.chromaInstance && currentInput.className && (matchResult = currentInput.className.match(activationPattern))) {
                var configProps = {};
                if (matchResult[3]) { // Extract and parse configuration properties
                    try {
                        // Safely parse properties from the string (e.g., '{key:value, another:true}')
                        var propString = matchResult[3].trim().replace(/^\{|\}$/g, ''); // Remove outer braces
                        propString.split(',').forEach(function(pair) {
                            var parts = pair.split(':');
                            if (parts.length === 2) {
                                var key = parts[0].trim();
                                var valStr = parts[1].trim();
                                try {
                                    // Attempt to parse as JSON (numbers, booleans, strings in quotes)
                                    configProps[key] = JSON.parse(valStr);
                                } catch (e) {
                                    configProps[key] = valStr; // Treat as raw string if JSON parsing fails
                                }
                            }
                        });
                    } catch (eInvalidProp) {
                        if (ChromaHub.debugMode) console.warn('ChromaHub: Failed to parse config properties for input.', currentInput, eInvalidProp);
                    }
                }
                // Create a new ChromaPicker instance and attach it to the input element
                currentInput.chromaInstance = new ChromaHub.ChromaPicker(currentInput, configProps);
            }
        }
    },


    // --- Asset Preloading ---
    commenceAssetPreload : function() {
        for (var assetName in ChromaHub.pendingLoads) {
            // Ensure the property belongs to the object itself, not its prototype chain
            if (Object.prototype.hasOwnProperty.call(ChromaHub.pendingLoads, assetName)) {
                ChromaHub.loadVisualAsset(assetName);
            }
        }
    },

    // Registers an image filename to be preloaded
    registerAssetForLoad : function(filename) {
        ChromaHub.pendingLoads[filename] = true;
    },

    // Initiates loading of a specific image asset
    loadVisualAsset : function(filename) {
        if (!ChromaHub.cachedImages[filename]) {
            var img = new Image();
            img.src = ChromaHub.resolveAssetPath() + filename;
            ChromaHub.cachedImages[filename] = img;
            if (ChromaHub.debugMode) console.log('ChromaHub: Loading asset:', img.src);
        }
    },


    // --- DOM Utility Functions ---
    getDomElement : function(identifier) {
        if (typeof identifier === 'string') {
            var el = document.getElementById(identifier);
            if (!el && ChromaHub.debugMode) console.warn('ChromaHub: Element not found for ID:', identifier);
            return el;
        }
        return identifier; // Assume it's already a DOM element
    },

    subscribeToEvent : function(element, eventType, handlerFunc) {
        if (!element || !eventType || typeof handlerFunc !== 'function') {
            if (ChromaHub.debugMode) console.warn('ChromaHub: Invalid parameters for event subscription.', element, eventType, handlerFunc);
            return;
        }

        if (element.addEventListener) {
            element.addEventListener(eventType, handlerFunc, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventType, handlerFunc);
        }
    },

    triggerEvent : function(element, eventName) {
        if (!element) {
            if (ChromaHub.debugMode) console.warn('ChromaHub: Cannot trigger event on null element.');
            return;
        }

        var eventObject;
        if (document.createEvent) { // Modern browsers
            eventObject = document.createEvent('HTMLEvents');
            eventObject.initEvent(eventName, true, true);
            element.dispatchEvent(eventObject);
        } else if (document.createEventObject) { // IE < 9
            eventObject = document.createEventObject();
            element.fireEvent('on' + eventName, eventObject);
        }
        // Removed very old IE (IE5) fallback for traditional event model
    },

    retrieveElementOffset : function(element) {
        var currentElement = element;
        var offsetX = 0, offsetY = 0;

        if (currentElement && currentElement.offsetParent) {
            do {
                offsetX += currentElement.offsetLeft;
                offsetY += currentElement.offsetTop;
                currentElement = currentElement.offsetParent;
            } while (currentElement);
        }
        // Simplified: removed complex parentNode scroll compensation for modern usage
        return [offsetX, offsetY];
    },

    measureElementDimensions : function(element) {
        if (!element) return [0, 0];
        return [element.offsetWidth, element.offsetHeight];
    },

    getPointerCoordsRelative : function(event) {
        var evt = event || window.event;
        var relX = 0, relY = 0;

        if (evt.offsetX !== undefined) { // Standard for many browsers
            relX = evt.offsetX;
            relY = evt.offsetY;
        } else if (evt.layerX !== undefined) { // Firefox specific
            relX = evt.layerX;
            relY = evt.layerY;
        }
        // Could add clientX/Y with getBoundingClientRect for more robust fallback
        return { x: relX, y: relY };
    },

    getWindowScrollPosition : function() {
        var xScroll = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        var yScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return [xScroll, yScroll];
    },

    getWindowViewportDimensions : function() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        return [width, height];
    },


    // --- ResourceLocator: A basic URI parser and resolver ---
    // Inspired by RFC3986, but simplified for common web resource paths.
    ResourceLocator : function(uriString) {
        this.scheme = null;
        this.authority = null;
        this.path = '';
        this.query = null;
        this.fragment = null;

        var _parseURI = function(uri) {
            // Regex to break down a URI into its components
            var match = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
            this.scheme = match[3] ? match[2] : null;
            this.authority = match[5] ? match[6] : null;
            this.path = match[7] || ''; // Ensure path is always a string
            this.query = match[9] ? match[10] : null;
            this.fragment = match[12] ? match[13] : null;
            return this;
        }.bind(this); // Bind 'this' to the ResourceLocator instance

        this.toString = function() {
            var result = '';
            if (this.scheme !== null) result += this.scheme + ':';
            if (this.authority !== null) result += '//' + this.authority;
            if (this.path !== null) result += this.path; // Path can be empty string
            if (this.query !== null) result += '?' + this.query;
            if (this.fragment !== null) result += '#' + this.fragment;
            return result;
        };

        // Resolves a relative URI against a base URI
        this.toAbsolute = function(baseURI) {
            var base = new ChromaHub.ResourceLocator(baseURI);
            var resolved = new ChromaHub.ResourceLocator(); // New instance for the resolved URI

            // Default to base's scheme and authority
            resolved.scheme = base.scheme;
            resolved.authority = base.authority;

            if (this.scheme !== null) { // If current URI has a scheme, it's absolute
                resolved.scheme = this.scheme;
                resolved.authority = this.authority;
                resolved.path = this.path;
                resolved.query = this.query;
            } else if (this.authority !== null) { // Scheme relative, but authority absolute
                resolved.authority = this.authority;
                resolved.path = this.path;
                resolved.query = this.query;
            } else { // Path relative
                if (this.path === '') { // Empty path, inherit base path and potentially query
                    resolved.path = base.path;
                    resolved.query = this.query !== null ? this.query : base.query;
                } else if (this.path.charAt(0) === '/') { // Absolute path from root
                    resolved.path = this.path;
                    resolved.query = this.query;
                } else { // Relative path segment (e.g., "images/pic.png")
                    // Remove filename from base path and append current path
                    var basePath = base.path.substring(0, base.path.lastIndexOf('/') + 1);
                    resolved.path = _removeDotSegments(basePath + this.path);
                    resolved.query = this.query;
                }
            }
            resolved.fragment = this.fragment;
            return resolved;
        };

        // Helper to resolve ".." and "." segments in a path string
        var _removeDotSegments = function(path) {
            var segments = [];
            path.split('/').forEach(function(segment) {
                if (segment === '..') {
                    segments.pop(); // Go up one directory level
                } else if (segment !== '.' && segment !== '') {
                    segments.push(segment);
                }
            });
            return (path.charAt(0) === '/' ? '/' : '') + segments.join('/');
        };

        if (uriString) {
            _parseURI(uriString);
        }
    },


    // --- Internal Utility Functions for Color Conversion ---
    // These are moved to a dedicated internal namespace for better organization
    // and to avoid recreating them for every ChromaPicker instance.
    _internal : {
        clamp01 : function(val) { return Math.max(0, Math.min(1, val)); },
        clamp06 : function(val) { return Math.max(0, Math.min(6, val)); },

        hsvToRgb : function(h, s, v) {
            h = ChromaHub._internal.clamp06(h);
            s = ChromaHub._internal.clamp01(s);
            v = ChromaHub._internal.clamp01(v);

            var r, g, b;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
                default: r = v; g = t; b = p; break; // Should not occur with clamping
            }
            return [r, g, b];
        },

        rgbToHsv : function(r, g, b) {
            r = ChromaHub._internal.clamp01(r);
            g = ChromaHub._internal.clamp01(g);
b = ChromaHub._internal.clamp01(b);

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0; // Achromatic (no hue)
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6; // Normalize hue to 0-1 range for calculation then multiply by 6 for 0-6 range.
            }
            return [h * 6, s, v]; // Hue in 0-6 range
        },

        padHexComponent : function(c) {
            var hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        },

        parseHexFloat : function(val) {
            var parsed = parseInt(val, 16);
            if (isNaN(parsed)) return null;
            return parsed / 255;
        }
    },


    // --- ChromaPicker: The main color selection component logic ---
    // This constructor creates an instance of a color picker bound to a target element.
    ChromaPicker : function(targetElement, initialProperties) {
        var self = this; // Capture 'this' for consistent reference within the instance

        // --- Configuration Properties (can be overridden by initialProperties) ---
        self.isMandatory = true;     // Refuse empty color values?
        self.autoAdjust = true;      // Adjust value to uniform notation (e.g., 6-digit hex)?
        self.useHashPrefix = false;  // Prefix hex color with '#' symbol?
        self.forceUppercase = true;  // Output hex in uppercase?
        self.displaySlider = true;   // Show the value/lightness slider?

        self.targetInput = ChromaHub.getDomElement(targetElement); // The input field to bind to
        self.styleTarget = ChromaHub.getDomElement(targetElement); // The element whose background/text color will be updated
        self.onValueUpdate = null;   // Callback function (string or function) on color change

        // --- Internal Color State (read-only externally) ---
        self.huesatval = [0, 0, 1];   // [hue 0-6, saturation 0-1, value 0-1]
        self.redgreenblue = [1, 1, 1]; // [red 0-1, green 0-1, blue 0-1]

        // --- Picker UI Configuration ---
        self.activateOnFocus = true; // Display picker when target input gets focus?
        self.displayMode = 'HSV';    // 'HSV' (Hue-Saturation-Value) or 'HVS' (Hue-Value-Saturation)
        self.placement = 'bottom';   // 'left' | 'right' | 'top' | 'bottom' relative to target
        self.smartPositioning = true; // Auto-adjust picker position to stay within viewport
        self.buttonHeight = 20;      // Height of action buttons (e.g., Close) in pixels
        self.isClosable = false;     // Show a close button?
        self.closeText = 'Close Panel'; // Text for the close button
        self.buttonColor = 'ButtonText'; // CSS color for button text
        self.facePadding = 10;       // Padding around the color selection area in pixels
        self.faceColor = 'ThreeDFace'; // Background color of the picker panel
        self.borderThickness = 1;    // Border width in pixels
        self.borderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS border color
        self.insetDepth = 1;         // Inset border width
        self.insetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS inset border color
        self.zIndexLevel = 10000;    // Z-index for the picker panel to ensure visibility

        // Apply any initial properties provided in the constructor call
        if (initialProperties) {
            Object.assign(self, initialProperties);
        }

        // --- Internal Picker State and UI Management ---
        var _pickerElement = null; // Reference to the dynamically created picker DOM element

        // Checks if this ChromaPicker instance owns the currently displayed picker
        var _isPickerActive = function() {
            return _pickerElement && _pickerElement.owner === self;
        };

        // Placeholder for drawing the picker UI (actual DOM creation omitted for brevity)
        var _drawPicker = function(posX, posY) {
            if (ChromaHub.debugMode) console.log('ChromaHub: Drawing picker at', posX, posY);
            if (!_pickerElement) {
                _pickerElement = document.createElement('div');
                _pickerElement.style.position = 'absolute';
                _pickerElement.style.border = self.borderThickness + 'px solid ' + self.borderColor.split(' ')[0]; // Simplified border
                _pickerElement.style.backgroundColor = self.faceColor;
                _pickerElement.style.zIndex = self.zIndexLevel;
                _pickerElement.owner = self; // Mark ownership
                document.body.appendChild(_pickerElement);
            }
            _pickerElement.style.left = posX + 'px';
            _pickerElement.style.top = posY + 'px';
            _pickerElement.style.display = 'block'; // Ensure visibility

            // In a full implementation, this would create/update the color pad, slider, etc.
            _redrawPad();
            _redrawSld();
        };

        // Placeholder for removing the picker UI
        var _removePicker = function() {
            if (_pickerElement && _isPickerActive()) {
                if (ChromaHub.debugMode) console.log('ChromaHub: Removing picker.');
                document.body.removeChild(_pickerElement);
                _pickerElement = null;
            }
        };

        // Calculates the required dimensions for the picker panel
        var _getPickerDimensions = function(instance) {
            // Simplified calculation; actual dimensions depend on generated UI elements
            var width = instance.facePadding * 2 + ChromaHub.visualAssets.huePad[0] + (instance.displaySlider ? ChromaHub.visualAssets.valSlide[0] : 0);
            var height = instance.facePadding * 2 + ChromaHub.visualAssets.huePad[1] + (instance.isClosable ? instance.buttonHeight : 0);
            return [width, height];
        };

        // Placeholder for redrawing the hue/saturation pad within the picker
        var _redrawPad = function() {
            if (ChromaHub.debugMode) console.log('ChromaHub: Redrawing color pad based on HSV:', self.huesatval);
            // This would involve updating background images and positioning a crosshair element
        };

        // Placeholder for redrawing the value/lightness slider within the picker
        var _redrawSld = function() {
            if (ChromaHub.debugMode) console.log('ChromaHub: Redrawing slider based on HSV:', self.huesatval);
            // This would involve updating background images and positioning an arrow indicator
        };


        // --- Public Methods for ChromaPicker Instance ---
        self.concealInterface = function() {
            if (_isPickerActive()) {
                _removePicker();
            }
        };

        self.revealInterface = function() {
            if (!_isPickerActive()) {
                var targetPos = ChromaHub.retrieveElementOffset(self.targetInput);
                var targetSize = ChromaHub.measureElementDimensions(self.targetInput);
                var viewportScroll = ChromaHub.getWindowScrollPosition();
                var viewportSize = ChromaHub.getWindowViewportDimensions();
                var pickerSize = _getPickerDimensions(self);

                var finalX = targetPos[0];
                var finalY = targetPos[1] + targetSize[1]; // Default placement: bottom

                // Apply smart positioning logic to keep picker within viewport
                if (self.smartPositioning) {
                    var spaceBelow = viewportSize[1] - (finalY - viewportScroll[1]);
                    var spaceAbove = targetPos[1] - viewportScroll[1];

                    // If not enough space below, and more space above, place it above
                    if (pickerSize[1] > spaceBelow && pickerSize[1] < spaceAbove) {
                        finalY = targetPos[1] - pickerSize[1];
                    }

                    // Horizontal adjustment: if not enough space to the right, try shifting left
                    var spaceRight = viewportSize[0] - (finalX - viewportScroll[0]);
                    if (pickerSize[0] > spaceRight && pickerSize[0] < targetPos[0] - viewportScroll[0]) {
                        finalX = targetPos[0] - pickerSize[0] + targetSize[0];
                    }
                }

                _drawPicker(finalX, finalY);
            }
        };


        // Flags to control which parts of the UI/data are updated during `emitValue`
        var _Flags = {
            NONE: 0,
            LEAVE_VALUE: 1,    // Do not update the target input's value
            LEAVE_STYLE: 2,    // Do not update the style target's background/text color
            LEAVE_PAD: 4,      // Do not redraw the color pad in the picker
            LEAVE_SLIDER: 8    // Do not redraw the slider in the picker
        };


        self.ingestValue = function() {
            if (!self.targetInput) {
                self.emitValue(); // If no target input, just export current internal color
                return;
            }

            var inputValue = self.targetInput.value;

            // Handle cases based on `autoAdjust` and `isMandatory` settings
            if (!self.autoAdjust) {
                if (!self.parseAndSet(inputValue, _Flags.LEAVE_VALUE)) {
                    // If parsing failed and auto-adjustment is off, revert style
                    self.styleTarget.style.backgroundColor = self.styleTarget.chromaOriginalStyle.backgroundColor;
                    self.styleTarget.style.color = self.styleTarget.chromaOriginalStyle.color;
                    self.emitValue(_Flags.LEAVE_VALUE | _Flags.LEAVE_STYLE);
                }
            } else if (!self.isMandatory && /^\s*$/.test(inputValue)) {
                // If not mandatory and input is empty, clear value and style
                self.targetInput.value = '';
                self.styleTarget.style.backgroundColor = self.styleTarget.chromaOriginalStyle.backgroundColor;
                self.styleTarget.style.color = self.styleTarget.chromaOriginalStyle.color;
                self.emitValue(_Flags.LEAVE_VALUE | _Flags.LEAVE_STYLE);
            } else if (!self.parseAndSet(inputValue)) {
                // If parsing failed after all attempts, revert to previous valid state (or default)
                self.emitValue();
            }
        };


        self.emitValue = function(flags) {
            flags = flags || _Flags.NONE;

            // Update target input value if not explicitly prevented
            if (!(flags & _Flags.LEAVE_VALUE) && self.targetInput) {
                var outputValue = self.toHexString();
                if (self.forceUppercase) outputValue = outputValue.toUpperCase();
                if (self.useHashPrefix) outputValue = '#' + outputValue;
                self.targetInput.value = outputValue;
                // Trigger a 'change' event on the input for external listeners
                ChromaHub.triggerEvent(self.targetInput, 'change');
            }

            // Update style target's background and text color if not prevented
            if (!(flags & _Flags.LEAVE_STYLE) && self.styleTarget) {
                self.styleTarget.style.backgroundColor = '#' + self.toHexString();
                // Calculate luminance for contrasting text color (WCAG approximation)
                var brightness = (0.299 * self.redgreenblue[0]) + (0.587 * self.redgreenblue[1]) + (0.114 * self.redgreenblue[2]);
                self.styleTarget.style.color = brightness < 0.5 ? '#FFF' : '#000';
            }

            // Redraw picker components if the picker is active and not explicitly excluded
            if (_isPickerActive()) {
                if (!(flags & _Flags.LEAVE_PAD)) {
                    _redrawPad();
                }
                if (!(flags & _Flags.LEAVE_SLIDER)) {
                    _redrawSld();
                }
            }

            // Execute custom callback function if provided
            if (self.onValueUpdate) {
                if (typeof self.onValueUpdate === 'function') {
                    self.onValueUpdate.call(self); // Call with 'this' set to the ChromaPicker instance
                } else if (typeof self.onValueUpdate === 'string') {
                    // Direct eval is generally discouraged but maintained for clone fidelity
                    try {
                        eval(self.onValueUpdate);
                    } catch (e) {
                        if (ChromaHub.debugMode) console.error('ChromaHub: Error in onValueUpdate callback:', e);
                    }
                }
            }
        };


        self.setFromHSV = function(hue, sat, val, flags) {
            // Apply clamping and use current values if parameters are null
            hue = ChromaHub._internal.clamp06(hue === null ? self.huesatval[0] : hue);
            sat = ChromaHub._internal.clamp01(sat === null ? self.huesatval[1] : sat);
            val = ChromaHub._internal.clamp01(val === null ? self.huesatval[2] : val);

            // Update internal HSV state
            self.huesatval = [hue, sat, val];
            // Convert to RGB and update internal RGB state
            self.redgreenblue = ChromaHub._internal.hsvToRgb(hue, sat, val);

            self.emitValue(flags);
        };


        self.setFromRGB = function(red, green, blue, flags) {
            // Apply clamping and use current values if parameters are null
            red = ChromaHub._internal.clamp01(red === null ? self.redgreenblue[0] : red);
            green = ChromaHub._internal.clamp01(green === null ? self.redgreenblue[1] : green);
            blue = ChromaHub._internal.clamp01(blue === null ? self.redgreenblue[2] : blue);

            // Update internal RGB state
            self.redgreenblue = [red, green, blue];
            // Convert to HSV and update internal HSV state
            var hsv = ChromaHub._internal.rgbToHsv(red, green, blue);

            // Update HSV components, preserving hue if saturation is zero (achromatic)
            if (hsv[0] !== null && hsv[1] !== 0) {
                self.huesatval[0] = hsv[0];
            }
            self.huesatval[1] = hsv[1];
            self.huesatval[2] = hsv[2];

            self.emitValue(flags);
        };


        self.parseAndSet = function(hexString, flags) {
            // Regex to match 3-digit or 6-digit hex color strings
            var hexMatch = hexString.match(/^\W*([0-9A-F]{3}(?:[0-9A-F]{3})?)\W*$/i);

            if (!hexMatch) {
                if (ChromaHub.debugMode) console.log('ChromaHub: Failed to parse color string:', hexString);
                return false;
            }

            var hexValue = hexMatch[1];
            var r, g, b;

            if (hexValue.length === 6) { // Full 6-digit hex format
                r = ChromaHub._internal.parseHexFloat(hexValue.substring(0, 2));
                g = ChromaHub._internal.parseHexFloat(hexValue.substring(2, 4));
                b = ChromaHub._internal.parseHexFloat(hexValue.substring(4, 6));
            } else if (hexValue.length === 3) { // Shorthand 3-digit hex format
                r = ChromaHub._internal.parseHexFloat(hexValue.substring(0, 1) + hexValue.substring(0, 1));
                g = ChromaHub._internal.parseHexFloat(hexValue.substring(1, 2) + hexValue.substring(1, 2));
                b = ChromaHub._internal.parseHexFloat(hexValue.substring(2, 3) + hexValue.substring(2, 3));
            } else {
                // This case should ideally not be reached due to the regex
                if (ChromaHub.debugMode) console.warn('ChromaHub: Unexpected hex string length:', hexValue.length);
                return false;
            }

            if (r === null || g === null || b === null) {
                 if (ChromaHub.debugMode) console.warn('ChromaHub: Hex parsing resulted in invalid RGB components for string:', hexString);
                 return false;
            }

            self.setFromRGB(r, g, b, flags);
            return true;
        };


        self.toHexString = function() {
            var r = self.redgreenblue[0];
            var g = self.redgreenblue[1];
            var b = self.redgreenblue[2];
            return ChromaHub._internal.padHexComponent(r) +
                   ChromaHub._internal.padHexComponent(g) +
                   ChromaHub._internal.padHexComponent(b);
        };


        // --- Constructor Initialization Logic ---
        if (self.targetInput) {
            // Store original background/color for potential resetting or comparison
            self.styleTarget.chromaOriginalStyle = {
                backgroundColor: self.styleTarget.style.backgroundColor,
                color: self.styleTarget.style.color
            };

            // Attach event listeners to the target input element
            ChromaHub.subscribeToEvent(self.targetInput, 'focus', function() {
                if (self.activateOnFocus) {
                    self.revealInterface();
                }
            });
            // The original had a blur handler, but a robust picker needs to handle
            // focus shifting *to* the picker itself, not just hiding on any blur.
            // For simplicity in this clone, a strict hide on blur is omitted.
            /*
            ChromaHub.subscribeToEvent(self.targetInput, 'blur', function() {
                self.concealInterface();
            });
            */
            ChromaHub.subscribeToEvent(self.targetInput, 'keyup', function() {
                self.ingestValue(); // Re-parse and update on key input
            });

            self.ingestValue(); // Perform initial import of color from the input field
        }
    } // End ChromaPicker

};

// Initiate the ChromaHub library's lifecycle when the script is parsed
ChromaHub.initLifecycle();