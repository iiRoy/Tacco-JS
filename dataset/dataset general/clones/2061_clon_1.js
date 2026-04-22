/*
 * jscolor, JavaScript Color Picker
 *
 * @version 1.3.11  - Updated version information
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html - License details
 * @author Jan Odvarko, http://odvarko.cz - Author's information
 * @created 2008-06-15 - Creation date
 * @updated 2011-11-07 - Last modification date
 * @link http://jscolor.com - Project website
 *
 * This file contains the core jscolor functionality, including the main
 * jscolor object and its utility methods, along with the URI parser
 * and the color object constructor.
 *
 */


var jscolor = {


    dir : '', // Specifies the location of the jscolor directory. Leave empty for automatic detection.


    bindClass : 'color', // The CSS class name used for automatic binding of color pickers to input fields.


    binding : true, // A boolean flag indicating whether automatic binding should be enabled.


    preloading : true, // Determines if image preloading is active to improve performance.


    install : function() {

        // Attaches the 'init' function to the window's 'load' event, ensuring it runs after the page is fully loaded.
        jscolor.addEvent(window, 'load', jscolor.init);

    },


    init : function() {

        // If automatic binding is enabled, proceed to bind color pickers.
        if ( jscolor.binding ) {

            jscolor.bind();

        }

        // If image preloading is enabled, start preloading necessary images.
        if ( jscolor.preloading ) {

            jscolor.preload();

        }

    },


    getDir : function() {

        // If the directory hasn't been set, attempt to detect it.
        if ( !jscolor.dir ) {

            var detected = jscolor.detectDir(); // Try to detect the directory path.
            jscolor.dir = detected !== false ? detected : 'jscolor/'; // Use detected path or default if detection fails.

        }

        return jscolor.dir; // Return the determined directory path.

    },


    detectDir : function() {

        var base = location.href; // Start with the current document's URL as the base.


        var e = document.getElementsByTagName('base'); // Check for <base> tags that might alter relative paths.
        for ( var i = 0; i < e.length; i += 1 ) {

            if ( e[i].href ) {

                base = e[i].href; // Update base URL if a <base> tag with href is found.

            }

        }


        e = document.getElementsByTagName('script'); // Get all <script> elements in the document.
        for ( var i = 0; i < e.length; i += 1 ) {

            // Check if the script's src matches 'jscolor.js', potentially with query parameters or hash.
            if ( e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src) ) {

                var src = new jscolor.URI(e[i].src); // Parse the script's source URL using jscolor's URI parser.
                var srcAbs = src.toAbsolute(base); // Convert the script's URL to an absolute path.
                srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // Remove the filename from the path to get the directory.
                srcAbs.query = null; // Clear query parameters.
                srcAbs.fragment = null; // Clear URL fragment.

                return srcAbs.toString(); // Return the absolute directory path as a string.

            }

        }

        return false; // Return false if the jscolor script's directory could not be detected.

    },


    bind : function() {

        // Regular expression to match the bindClass and optionally a JSON-like property string.
        var matchClass = new RegExp('(^|\\s)(' + jscolor.bindClass + ')\\s*(\\{[^}]*\\})?', 'i');
        var e = document.getElementsByTagName('input'); // Get all <input> elements.

        for ( var i = 0; i < e.length; i += 1 ) {

            var m;
            // Check if the input element has the bindClass and hasn't been processed yet.
            if ( !e[i].color && e[i].className && (m = e[i].className.match(matchClass)) ) {

                var prop = {}; // Initialize an empty object for properties.

                if ( m[3] ) { // If a property string (e.g., '{prop:value}') is found in the class name.

                    try {

                        eval('prop=' + m[3]); // Attempt to parse the property string as JSON.
                    } catch ( eInvalidProp ) {
                        // Ignore parsing errors for invalid properties.
                    }

                }

                // Create a new jscolor.color instance for the input element.
                e[i].color = new jscolor.color(e[i], prop);

            }

        }

    },


    preload : function() {

        // Iterate through all required images and load them.
        for ( var fn in jscolor.imgRequire ) {

            if ( jscolor.imgRequire.hasOwnProperty(fn) ) {

                jscolor.loadImage(fn); // Load each required image.

            }

        }

    },


    images : {

        pad : [ 181, 101 ], // Dimensions for the color pad image (width, height).
        sld : [ 16, 101 ], // Dimensions for the slider image.
        cross : [ 15, 15 ], // Dimensions for the crosshair image.
        arrow : [ 7, 11 ] // Dimensions for the arrow image.

    },


    imgRequire : {}, // Object to store images that are required to be preloaded.
    imgLoaded : {}, // Object to store Image objects once they are loaded.


    requireImage : function(filename) {

        jscolor.imgRequire[filename] = true; // Mark an image as required for preloading.

    },


    loadImage : function(filename) {

        // Only load if the image hasn't been loaded yet.
        if ( !jscolor.imgLoaded[filename] ) {

            jscolor.imgLoaded[filename] = new Image(); // Create a new Image object.
            jscolor.imgLoaded[filename].src = jscolor.getDir() + filename; // Set its source to trigger loading.

        }

    },


    fetchElement : function(mixed) {

        // Returns an element either by its ID (if string) or the element itself (if already an object).
        return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;

    },


    addEvent : function(el, evnt, func) {

        // Cross-browser event listener attachment.
        if ( el.addEventListener ) {

            el.addEventListener(evnt, func, false); // Standard W3C model.
        } else if ( el.attachEvent ) {

            el.attachEvent('on' + evnt, func); // Microsoft IE model.

        }

    },


    fireEvent : function(el, evnt) {

        if ( !el ) {

            return; // Exit if no element is provided.

        }

        // Cross-browser event firing.
        if ( document.createEvent ) {

            var ev = document.createEvent('HTMLEvents'); // Create a new event object.
            ev.initEvent(evnt, true, true); // Initialize it.
            el.dispatchEvent(ev); // Dispatch the event.

        } else if ( document.createEventObject ) {

            var ev = document.createEventObject(); // Create an IE event object.
            el.fireEvent('on' + evnt, ev); // Fire the IE event.

        } else if ( el['on' + evnt] ) { // Fallback for older browsers (IE5) using traditional event model.

            el['on' + evnt](); // Call the event handler directly.

        }

    },


    getElementPos : function(e) {

        var e1 = e, e2 = e;
        var x = 0, y = 0;

        // Accumulate offsetLeft/Top from offsetParent chain.
        if ( e1.offsetParent ) {

            do {

                x += e1.offsetLeft;
                y += e1.offsetTop;

            } while ( e1 = e1.offsetParent );

        }

        // Subtract scroll positions from parent elements until BODY.
        while ( (e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== 'BODY' ) {

            x -= e2.scrollLeft;
            y -= e2.scrollTop;

        }

        return [x, y]; // Return [x, y] coordinates.

    },


    getElementSize : function(e) {

        return [e.offsetWidth, e.offsetHeight]; // Return [width, height] of the element.

    },


    getRelMousePos : function(e) {

        var x = 0, y = 0;

        if ( !e ) {

            e = window.event; // Get event object for IE.

        }

        // Use offsetX/Y for IE/Opera or layerX/Y for Firefox.
        if ( typeof e.offsetX === 'number' ) {

            x = e.offsetX;
            y = e.offsetY;

        } else if ( typeof e.layerX === 'number' ) {

            x = e.layerX;
            y = e.layerY;

        }

        return { x: x, y: y }; // Return relative mouse position as an object.

    },


    getViewPos : function() {

        // Get scroll position of the viewport (pageXOffset/pageYOffset for modern browsers).
        if ( typeof window.pageYOffset === 'number' ) {

            return [window.pageXOffset, window.pageYOffset];

        } else if ( document.body && (document.body.scrollLeft || document.body.scrollTop) ) {

            // Fallback for IE (body scroll).
            return [document.body.scrollLeft, document.body.scrollTop];

        } else if ( document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop) ) {

            // Fallback for IE (documentElement scroll).
            return [document.documentElement.scrollLeft, document.documentElement.scrollTop];

        } else {

            return [0, 0]; // Default to [0,0] if no scroll position found.

        }

    },


    getViewSize : function() {

        // Get dimensions of the viewport (innerWidth/innerHeight for modern browsers).
        if ( typeof window.innerWidth === 'number' ) {

            return [window.innerWidth, window.innerHeight];

        } else if ( document.body && (document.body.clientWidth || document.body.clientHeight) ) {

            // Fallback for IE (body client dimensions).
            return [document.body.clientWidth, document.body.clientHeight];

        } else if ( document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight) ) {

            // Fallback for IE (documentElement client dimensions).
            return [document.documentElement.clientWidth, document.documentElement.clientHeight];

        } else {

            return [0, 0]; // Default to [0,0] if no dimensions found.

        }

    },


    URI : function(uri) { // This constructor implements a basic URI parser based on RFC3986.


        this.scheme = null; // Protocol scheme (e.g., 'http').
        this.authority = null; // Authority component (e.g., 'www.example.com').
        this.path = ''; // Path component (e.g., '/path/to/resource').
        this.query = null; // Query component (e.g., 'key=value').
        this.fragment = null; // Fragment identifier (e.g., 'section1').


        this.parse = function(uri) {

            // Regular expression to break down a URI into its components.
            var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);

            this.scheme = m[3] ? m[2] : null; // Extract scheme.
            this.authority = m[5] ? m[6] : null; // Extract authority.
            this.path = m[7]; // Extract path.
            this.query = m[9] ? m[10] : null; // Extract query.
            this.fragment = m[12] ? m[13] : null; // Extract fragment.

            return this; // Return the URI object itself for chaining.

        };


        this.toString = function() {

            var result = '';

            if ( this.scheme !== null ) { result = result + this.scheme + ':'; } // Append scheme if present.
            if ( this.authority !== null ) { result = result + '//' + this.authority; } // Append authority if present.
            if ( this.path !== null ) { result = result + this.path; } // Append path if present.
            if ( this.query !== null ) { result = result + '?' + this.query; } // Append query if present.
            if ( this.fragment !== null ) { result = result + '#' + this.fragment; } // Append fragment if present.

            return result; // Return the reconstructed URI string.

        };


        this.toAbsolute = function(base) {

            var base = new jscolor.URI(base); // Parse the base URI.
            var r = this; // 'r' refers to the relative URI.
            var t = new jscolor.URI; // 't' will be the target absolute URI.


            if ( base.scheme === null ) { return false; } // Base URI must have a scheme.


            // If relative URI has a scheme and it matches the base scheme, consider it scheme-relative.
            if ( r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase() ) {

                r.scheme = null; // Clear scheme for further processing.

            }


            if ( r.scheme !== null ) { // If relative URI still has a scheme (different from base).

                t.scheme = r.scheme;
                t.authority = r.authority;
                t.path = removeDotSegments(r.path); // Process dot segments in the path.
                t.query = r.query;

            } else { // Scheme is the same or missing.

                if ( r.authority !== null ) { // If relative URI has an authority.

                    t.authority = r.authority;
                    t.path = removeDotSegments(r.path);
                    t.query = r.query;

                } else { // Authority is the same or missing.

                    if ( r.path === '' ) { // If relative URI has an empty path.

                        t.path = base.path; // Inherit base path.
                        if ( r.query !== null ) {

                            t.query = r.query; // Use relative query.
                        } else {

                            t.query = base.query; // Inherit base query.

                        }

                    } else { // Relative URI has a path.

                        if ( r.path.substr(0, 1) === '/' ) { // If path is absolute (starts with '/').

                            t.path = removeDotSegments(r.path); // Process dot segments.

                        } else { // Path is relative.

                            if ( base.authority !== null && base.path === '' ) { // If base has authority but empty path.

                                t.path = '/' + r.path; // Prepend '/' to relative path.

                            } else {

                                t.path = base.path.replace(/[^\/]+$/, '') + r.path; // Combine base path (without filename) and relative path.

                            }

                            t.path = removeDotSegments(t.path); // Process dot segments.

                        }

                        t.query = r.query; // Use relative query.

                    }

                    t.authority = base.authority; // Inherit base authority.

                }

                t.scheme = base.scheme; // Inherit base scheme.

            }

            t.fragment = r.fragment; // Inherit fragment.


            return t; // Return the absolute URI object.

        };


        function removeDotSegments(path) {

            var out = ''; // Output path string.

            while ( path ) {

                if ( path.substr(0, 3) === '../' || path.substr(0, 2) === './' ) {

                    // Remove leading '../' or './'.
                    path = path.replace(/^\.+/, '').substr(1);

                } else if ( path.substr(0, 3) === '/./' || path === '/.' ) {

                    // Remove '/./' or '/.'.
                    path = '/' + path.substr(3);

                } else if ( path.substr(0, 4) === '/../' || path === '/..' ) {

                    // Remove '/../' or '/..' and the preceding segment.
                    path = '/' + path.substr(4);
                    out = out.replace(/\/?[^\/]*$/, ''); // Remove last segment from output.

                } else if ( path === '.' || path === '..' ) {

                    path = ''; // If path is just '.' or '..', it becomes empty.

                } else {

                    // Take the next segment.
                    var rm = path.match(/^\/?[^\/]*/)[0];
                    path = path.substr(rm.length);
                    out = out + rm; // Append segment to output.

                }

            }

            return out; // Return the path with dot segments removed.

        }


        if ( uri ) {

            this.parse(uri); // Parse the URI if provided during construction.

        }

    },


    /*
     * Usage example:
     * var myColor = new jscolor.color(myInputElement)
     *
     * The `jscolor.color` constructor creates a color picker instance
     * associated with a target input element. It manages color values,
     * display, and picker interaction.
     */

    color : function(target, prop) {


        this.required = true; // If true, empty values are not allowed.
        this.adjust = true; // If true, the value is adjusted to a uniform notation (e.g., 6-digit hex).
        this.hash = false; // If true, the color string is prefixed with '#'.
        this.caps = true; // If true, the hex color string is uppercase.
        this.slider = true; // If true, the value/saturation slider is displayed in the picker.
        this.valueElement = target; // The HTML element (usually an input) where the color value is stored.
        this.styleElement = target; // The HTML element whose background/text color will reflect the selected color.
        this.onImmediateChange = null; // Callback function or string to execute on immediate color changes.
        this.hsv = [0, 0, 1]; // Internal HSV color representation (Hue 0-6, Saturation 0-1, Value 0-1). Read-only.
        this.rgb = [1, 1, 1]; // Internal RGB color representation (Red 0-1, Green 0-1, Blue 0-1). Read-only.


        this.pickerOnfocus = true; // If true, the color picker appears when the input field gets focus.
        this.pickerMode = 'HSV'; // Determines the mode of the color picker ('HSV' or 'HVS').
        this.pickerPosition = 'bottom'; // Preferred position of the picker relative to the input ('left', 'right', 'top', 'bottom').
        this.pickerSmartPosition = true; // If true, the picker will adjust its position to stay within the viewport.
        this.pickerButtonHeight = 20; // Height of the close button in pixels.
        this.pickerClosable = false; // If true, a close button is shown on the picker.
        this.pickerCloseText = 'Close'; // Text displayed on the close button.
        this.pickerButtonColor = 'ButtonText'; // CSS color for the close button text.
        this.pickerFace = 10; // Padding around the color area in pixels.
        this.pickerFaceColor = 'ThreeDFace'; // CSS color for the picker's face.
        this.pickerBorder = 1; // Border width of the picker in pixels.
        this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color for the picker's border.
        this.pickerInset = 1; // Inset width of the picker in pixels.
        this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color for the picker's inset border.
        this.pickerZIndex = 10000; // Z-index for the picker element to ensure it's on top.


        // Apply custom properties passed in the 'prop' object.
        for ( var p in prop ) {

            if ( prop.hasOwnProperty(p) ) {

                this[p] = prop[p]; // Assign custom property values.

            }

        }


        this.hidePicker = function() {

            // Check if this instance is the current owner of the active picker.
            if ( isPickerOwner() ) {

                removePicker(); // If so, remove the picker from the DOM.

            }

        };


        this.showPicker = function() {

            // Only show the picker if this instance is not already the owner.
            if ( !isPickerOwner() ) {

                var tp = jscolor.getElementPos(target); // Get target element's absolute position.
                var ts = jscolor.getElementSize(target); // Get target element's dimensions.
                var vp = jscolor.getViewPos(); // Get viewport scroll position.
                var vs = jscolor.getViewSize(); // Get viewport dimensions.
                var ps = getPickerDims(this); // Get the calculated dimensions of the picker.

                var a, b, c; // Variables for position calculation based on pickerPosition.

                switch ( this.pickerPosition.toLowerCase() ) {

                    case 'left':
                        a = 1; b = 0; c = -1; // Horizontal alignment, negative offset.
                        break;
                    case 'right':
                        a = 1; b = 0; c = 1; // Horizontal alignment, positive offset.
                        break;
                    case 'top':
                        a = 0; b = 1; c = -1; // Vertical alignment, negative offset.
                        break;
                    default:
                        a = 0; b = 1; c = 1; // Default to 'bottom': Vertical alignment, positive offset.
                        break;

                }

                var l = (ts[b] + ps[b]) / 2; // Calculate half-length for centering/offset.


                var pp; // Variable to hold the final picker position.

                // Determine picker position based on smart positioning setting.
                if ( !this.pickerSmartPosition ) {

                    pp = [
                        tp[a], // Use target's primary position.
                        tp[b] + ts[b] - l + l * c // Calculate secondary position.
                    ];

                } else {

                    // Smart positioning logic to keep the picker within the viewport.
                    pp = [
                        // Adjust horizontal position (a-axis).
                        -vp[a] + tp[a] + ps[a] > vs[a] ? // If picker goes off right edge.
                            (-vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a]) : // Try left or keep original.
                            tp[a], // Otherwise, keep original.

                        // Adjust vertical position (b-axis).
                        -vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ? // If picker goes off bottom edge.
                            (-vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c) : // Try top or keep original.
                            (tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c) // Otherwise, keep original or adjust if negative.
                    ];

                }

                drawPicker(pp[a], pp[b]); // Draw the picker at the calculated position.

            }

        };


        this.importColor = function() {

            if ( !valueElement ) {

                // If no value element, just export the current color.
                this.exportColor();

            } else {

                // If 'adjust' is false, attempt to parse the value as-is.
                if ( !this.adjust ) {

                    if ( !this.fromString(valueElement.value, leaveValue) ) {

                        // If parsing fails, revert style and export without changing value/style.
                        styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                        styleElement.style.color = styleElement.jscStyle.color;
                        this.exportColor(leaveValue | leaveStyle);

                    }

                } else if ( !this.required && /^\s*$/.test(valueElement.value) ) {

                    // If not required and value is empty/whitespace, clear value and revert style.
                    valueElement.value = '';
                    styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                    styleElement.style.color = styleElement.jscStyle.color;
                    this.exportColor(leaveValue | leaveStyle);

                } else if ( this.fromString(valueElement.value) ) {

                    // If parsing is successful, color is imported.
                    // OK - nothing more to do here.

                } else {

                    // If parsing fails under 'adjust' mode, export current color (effectively resetting input).
                    this.exportColor();

                }

            }

        };


        this.exportColor = function(flags) {

            // Export color to valueElement if not prevented by flags.
            if ( !(flags & leaveValue) && valueElement ) {

                var value = this.toString(); // Get hex string representation.

                if ( this.caps ) { value = value.toUpperCase(); } // Apply uppercase if enabled.
                if ( this.hash ) { value = '#' + value; } // Add hash prefix if enabled.

                valueElement.value = value; // Set the input field's value.
                BlitzMap.updateOverlay(); // Placeholder for an external update function (e.g., UI refresh).

            }

            // Export color to styleElement if not prevented by flags.
            if ( !(flags & leaveStyle) && styleElement ) {

                styleElement.style.backgroundColor = '#' + this.toString(); // Set background color.

                // Determine text color for contrast (black or white).
                styleElement.style.color =
                    0.213 * this.rgb[0] + // Weighted sum for luminance calculation.
                        0.715 * this.rgb[1] +
                        0.072 * this.rgb[2]
                        < 0.5 ? '#FFF' : '#000'; // If dark, use white text; otherwise, black.

            }

            // Redraw color pad if not prevented by flags and picker is active.
            if ( !(flags & leavePad) && isPickerOwner() ) {

                redrawPad();

            }

            // Redraw slider if not prevented by flags and picker is active.
            if ( !(flags & leaveSld) && isPickerOwner() ) {

                redrawSld();

            }

        };


        this.fromHSV = function(h, s, v, flags) { // 'null' for a parameter means "don't change".

            // Clamp H, S, V values to their valid ranges.
            h < 0 && (h = 0) || h > 6 && (h = 6);
            s < 0 && (s = 0) || s > 1 && (s = 1);
            v < 0 && (v = 0) || v > 1 && (v = 1);

            // Convert HSV to RGB and update internal state.
            this.rgb = HSV_RGB(
                h === null ? this.hsv[0] : (this.hsv[0] = h), // Use existing H if null, otherwise update and use new H.
                s === null ? this.hsv[1] : (this.hsv[1] = s), // Use existing S if null, otherwise update and use new S.
                v === null ? this.hsv[2] : (this.hsv[2] = v) // Use existing V if null, otherwise update and use new V.
            );

            this.exportColor(flags); // Export the updated color.

        };


        this.fromRGB = function(r, g, b, flags) { // 'null' for a parameter means "don't change".

            // Clamp R, G, B values to their valid ranges.
            r < 0 && (r = 0) || r > 1 && (r = 1);
            g < 0 && (g = 0) || g > 1 && (g = 1);
            b < 0 && (b = 0) || b > 1 && (b = 1);

            // Convert RGB to HSV and update internal state.
            var hsv = RGB_HSV(
                r === null ? this.rgb[0] : (this.rgb[0] = r), // Use existing R if null, otherwise update and use new R.
                g === null ? this.rgb[1] : (this.rgb[1] = g), // Use existing G if null, otherwise update and use new G.
                b === null ? this.rgb[2] : (this.rgb[2] = b) // Use existing B if null, otherwise update and use new B.
            );

            if ( hsv[0] !== null ) {

                this.hsv[0] = hsv[0]; // Update Hue if it's a valid number.

            }

            if ( hsv[2] !== 0 ) { // Only update Saturation if Value is not zero (to avoid NaN for black).

                this.hsv[1] = hsv[1];

            }

            this.hsv[2] = hsv[2]; // Always update Value.

            this.exportColor(flags); // Export the updated color.

        };


        this.fromString = function(hex, flags) {

            // Regular expression to match 3-digit or 6-digit hex color format.
            var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);

            if ( !m ) {

                return false; // Return false if the hex string is invalid.

            } else {

                if ( m[1].length === 6 ) { // If it's a 6-character hex notation.

                    this.fromRGB(
                        parseInt(m[1].substr(0, 2), 16) / 255, // Extract Red component.
                        parseInt(m[1].substr(2, 2), 16) / 255, // Extract Green component.