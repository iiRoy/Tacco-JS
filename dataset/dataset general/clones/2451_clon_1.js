/*
 *  This is a foundational JavaScript module, designed to create dynamic,
 *  animated circular timers.
 *
 *  The core idea is encapsulated within the `TC_Class`, which serves as the
 *  primary public interface. When you invoke it, for example:
 *
 *      var myTimerInstance = $(".my-timer-element").TimeCircles();
 *
 *  The `myTimerInstance` variable will hold a fully functional instance
 *  of this public `TimeCircles` class. It's important to understand that
 *  this library doesn't follow the typical jQuery chaining pattern for
 *  method calls. Refer to the official documentation for detailed
 *  information on how to properly chain operations with TimeCircles.
 *
 *  Once the public `TimeCircles` class is initialized or created, it proceeds
 *  to iterate through each element in its associated jQuery collection. For
 *  each of these elements, it either retrieves an existing instance of its
 *  internal, private class or creates a new one if none exists.
 *
 *  Subsequently, any method calls made on the public `TimeCircles` instance
 *  are intelligently forwarded to every corresponding private class instance
 *  that pertains to the relevant element collection. This ensures consistent
 *  behavior across multiple timer displays.
 */
( function( $ ) {

    // Reference to the global window object.
    var useWindow = window ;


    // Polyfill for Object.keys, for compatibility with older browsers like IE8.
    // The original source for this polyfill is from the Mozilla Developer Network (MDN):
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if ( ! Object.keys ) {

        Object.keys = ( function() {

            'use strict' ;

            var hasOwnProperty = Object.prototype.hasOwnProperty ,
                hasDontEnumBug = ! ( { toString : null } ) . propertyIsEnumerable ( 'toString' ) ,
                dontEnums = [
                    'toString' ,
                    'toLocaleString' ,
                    'valueOf' ,
                    'hasOwnProperty' ,
                    'isPrototypeOf' ,
                    'propertyIsEnumerable' ,
                    'constructor'
                ] ,
                dontEnumsLength = dontEnums.length ;

            return function ( obj ) {

                // Type check to ensure obj is an object or function, and not null.
                if ( typeof obj !== 'object' && ( typeof obj !== 'function' || obj === null ) ) {
                    throw new TypeError ( 'Object.keys called on non-object' ) ;
                }

                var result = [] ,
                    prop ,
                    i ;

                // Iterate over enumerable properties.
                for ( prop in obj ) {
                    if ( hasOwnProperty.call ( obj , prop ) ) {
                        result.push ( prop ) ;
                    }
                }

                // Handle properties that are not enumerable in older IE versions.
                if ( hasDontEnumBug ) {
                    for ( i = 0 ; i < dontEnumsLength ; i ++ ) {
                        if ( hasOwnProperty.call ( obj , dontEnums[i] ) ) {
                            result.push ( dontEnums[i] ) ;
                        }
                    }
                }
                return result ;
            } ;

        } ( ) ) ;

    }

    // Flag to enable limited functionality mode, primarily for IE8.
    var limited_mode = false ;

    // The duration (in milliseconds) for each animation tick or update cycle.
    var tick_duration = 200 ;

    // Check if debug mode is enabled via URL hash.
    var debug = ( location.hash === "#debug" ) ;

    /**
     *  Logs a message to the console if debug mode is active.
     *  @param {string} msg - The message to be logged.
     */
    function debug_log ( msg ) {
        if ( debug ) {
            console.log ( msg ) ;
        }
    }

    // Defines all possible time units used by the timer.
    var allUnits = [ "Days" , "Hours" , "Minutes" , "Seconds" ] ;

    // Maps each unit to the next larger unit for calculations.
    var nextUnits = {
        Seconds : "Minutes" ,
        Minutes : "Hours" ,
        Hours : "Days" ,
        Days : "Years"
    } ;

    // Specifies the number of seconds contained within each time unit.
    var secondsIn = {
        Seconds : 1 ,
        Minutes : 60 ,
        Hours : 3600 ,
        Days : 86400 ,
        Months : 2678400 ,
        Years : 31536000
    } ;

    /**
     * Converts a hexadecimal color code string into an object containing
     * integer values for its red, green, and blue components.
     * This utility function (hexToRgb) is adapted from:
     * http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     *
     * @param {string} hex - The hexadecimal color code (e.g., "#RRGGBB" or "#RGB").
     * @returns {object|null} An object `{ r: ..., g: ..., b: ... }` or `null` if parsing fails.
     */
    function hexToRgb ( hex ) {

        // Expand shorthand form (e.g., "03F") to its full form (e.g., "0033FF").
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i ;

        hex = hex.replace ( shorthandRegex , function ( m , r , g , b ) {
            return r + r + g + g + b + b ;
        } ) ;

        // Execute the regex to parse the full hex code.
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec ( hex ) ;

        // Return the parsed RGB values or null if no match was found.
        return result ? {
            r : parseInt ( result[1] , 16 ) ,
            g : parseInt ( result[2] , 16 ) ,
            b : parseInt ( result[3] , 16 )
        } : null ;

    }

    /**
     * Checks if the HTML5 Canvas element is supported by the current browser.
     * @returns {boolean} True if canvas is supported, false otherwise.
     */
    function isCanvasSupported ( ) {
        var elem = document.createElement ( 'canvas' ) ;
        return !! ( elem.getContext && elem.getContext ( '2d' ) ) ;
    }

    /**
     *  Function `s4()` and `guid()` are used to generate unique identifiers.
     *  They originate from:
     *  http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     */
    function s4 ( ) {
        return Math.floor ( ( 1 + Math.random ( ) ) * 0x10000 )
            .toString ( 16 )
            .substring ( 1 ) ;
    }

    /**
     * Generates a universally unique identifier (GUID/UUID).
     * @returns {String} A unique identifier string.
     */
    function guid ( ) {
        return s4 ( ) + s4 ( ) + '-' + s4 ( ) + '-' + s4 ( ) + '-' +
            s4 ( ) + '-' + s4 ( ) + s4 ( ) + s4 ( ) ;
    }

    /**
     * Polyfill for `Array.prototype.indexOf` for compatibility with older browsers,
     * such as Internet Explorer 8.
     *
     * @param {Mixed} elt - The element to locate in the array.
     * @param {Number} [from] - The index at which to begin the search. Defaults to 0.
     * @returns {Number} The index of the first occurrence of `elt`, or -1 if not found.
     */
    if ( ! Array.prototype.indexOf ) {
        Array.prototype.indexOf = function ( elt /*, from*/ ) {

            var len = this.length >>> 0 ; // Ensure len is an unsigned 32-bit integer.

            var from = Number ( arguments[1] ) || 0 ; // Get the 'from' argument, default to 0.
            from = ( from < 0 )
                ? Math.ceil ( from )
                : Math.floor ( from ) ;

            if ( from < 0 ) {
                from += len ; // Adjust negative 'from' index.
            }

            // Iterate through the array starting from 'from'.
            for ( ; from < len ; from ++ ) {
                if ( from in this &&
                    this[from] === elt ) {
                    return from ; // Element found.
                }
            }
            return -1 ; // Element not found.
        } ;
    }

    /**
     * Parses a date string into a Date object. Supports "YYYY-MM-DD HH:MM:SS" and
     * other formats that `Date.parse()` can handle.
     *
     * @param {string} str - The date string to parse.
     * @returns {Date} A Date object representing the parsed date, or a new Date() if parsing fails.
     */
    function parse_date ( str ) {

        // Attempt to parse a specific "YYYY-MM-DD HH:MM:SS" format.
        var match = str.match ( /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/ ) ;

        if ( match !== null && match.length > 0 ) {
            var parts = str.split ( " " ) ;
            var date = parts[0].split ( "-" ) ;
            var time = parts[1].split ( ":" ) ;
            return new Date ( date[0] , date[1] - 1 , date[2] , time[0] , time[1] , time[2] ) ;
        }

        // Fallback for other common date formats using Date.parse().
        var d = Date.parse ( str ) ;
        if ( ! isNaN ( d ) ) {
            return d ;
        }

        // Another fallback: replace hyphens with slashes and 'T' with space, then parse.
        d = Date.parse ( str.replace ( /-/g , '/' ) . replace ( 'T' , ' ' ) ) ;
        if ( ! isNaN ( d ) ) {
            return d ;
        }

        // If all parsing attempts fail, return the current date.
        return new Date ( ) ;

    }

    /**
     * Calculates time differences and percentages for various units.
     *
     * @param {number} diff - The current time difference in seconds.
     * @param {number} old_diff - The previous time difference in seconds.
     * @param {number} total_duration - The total duration in seconds for percentage calculation.
     * @param {Array<string>} units - An array of time unit names (e.g., ["Days", "Hours"]).
     * @param {boolean} floor - Whether to floor the unit values.
     * @returns {object} An object containing raw, floored, and percentage time values.
     */
    function parse_times ( diff , old_diff , total_duration , units , floor ) {

        var raw_time = { } ;
        var raw_old_time = { } ;
        var time = { } ;
        var pct = { } ;
        var old_pct = { } ;
        var old_time = { } ;

        var greater_unit = null ;

        // Loop through each specified unit to calculate its values.
        for ( var i = 0 ; i < units.length ; i ++ ) {

            var unit = units[i] ;
            var maxUnits ;

            // Determine the maximum number of units for the current unit.
            if ( greater_unit === null ) {
                maxUnits = total_duration / secondsIn[unit] ;
            }
            else {
                maxUnits = secondsIn[greater_unit] / secondsIn[unit] ;
            }

            var curUnits = ( diff / secondsIn[unit] ) ;
            var oldUnits = ( old_diff / secondsIn[unit] ) ;

            // Apply flooring if specified, handling positive and negative values.
            if ( floor ) {
                if ( curUnits > 0 ) {
                    curUnits = Math.floor ( curUnits ) ;
                }
                else {
                    curUnits = Math.ceil ( curUnits ) ;
                }
                if ( oldUnits > 0 ) {
                    oldUnits = Math.floor ( oldUnits ) ;
                }
                else {
                    oldUnits = Math.ceil ( oldUnits ) ;
                }
            }

            // Apply modulo for all units except "Days" to keep them within their cycle.
            if ( unit !== "Days" ) {
                curUnits = curUnits % maxUnits ;
                oldUnits = oldUnits % maxUnits ;
            }

            // Store calculated values.
            raw_time[unit] = curUnits ;
            time[unit] = Math.abs ( curUnits ) ;
            raw_old_time[unit] = oldUnits ;
            old_time[unit] = Math.abs ( oldUnits ) ;
            pct[unit] = Math.abs ( curUnits ) / maxUnits ;
            old_pct[unit] = Math.abs ( oldUnits ) / maxUnits ;

            greater_unit = unit ; // Set current unit as the 'greater_unit' for the next iteration.
        }

        // Return an object containing all calculated time breakdowns.
        return {
            raw_time : raw_time ,
            raw_old_time : raw_old_time ,
            time : time ,
            old_time : old_time ,
            pct : pct ,
            old_pct : old_pct
        } ;

    }

    // Global list to store all TimeCircles instances.
    var TC_Instance_List = { } ;

    /**
     * Synchronizes the TC_Instance_List with the window object,
     * ensuring global accessibility and persistence across iframes/windows.
     */
    function updateUsedWindow ( ) {

        if ( typeof useWindow.TC_Instance_List !== "undefined" ) {
            TC_Instance_List = useWindow.TC_Instance_List ;
        }
        else {
            useWindow.TC_Instance_List = TC_Instance_List ;
        }

        // Initialize requestAnimationFrame handler for the current window.
        initializeAnimationFrameHandler ( useWindow ) ;

    } ;

    /**
     * Initializes `requestAnimationFrame` and `cancelAnimationFrame` polyfills
     * for a given window object `w` if not natively supported.
     * This ensures smooth animation fallback across different browsers.
     *
     * @param {Window} w - The window object to initialize.
     */
    function initializeAnimationFrameHandler ( w ) {

        var vendors = [ 'webkit' , 'moz' ] ;

        // Check for vendor-prefixed implementations.
        for ( var x = 0 ; x < vendors.length && ! w.requestAnimationFrame ; ++ x ) {
            w.requestAnimationFrame = w[ vendors[x] + 'RequestAnimationFrame' ] ;
            w.cancelAnimationFrame = w[ vendors[x] + 'CancelAnimationFrame' ] ;
        }

        // Provide a setTimeout-based fallback if no native or prefixed implementation is found.
        if ( ! w.requestAnimationFrame || ! w.cancelAnimationFrame ) {

            w.requestAnimationFrame = function ( callback , element , instance ) {

                // If no instance is provided, create a dummy one to store last_frame.
                if ( typeof instance === "undefined" ) {
                    instance = { data : { last_frame : 0 } } ;
                }

                var currTime = new Date ( ) . getTime ( ) ;
                // Calculate time until next frame, aiming for ~60fps (16ms per frame).
                var timeToCall = Math.max ( 0 , 16 - ( currTime - instance.data.last_frame ) ) ;
                var id = w.setTimeout ( function ( ) {
                    callback ( currTime + timeToCall ) ;
                } , timeToCall ) ;

                instance.data.last_frame = currTime + timeToCall ;
                return id ;

            } ;

            w.cancelAnimationFrame = function ( id ) {
                clearTimeout ( id ) ;
            } ;

        }

    } ;


    /**
     * Constructor for a TimeCircles instance.
     * Manages the timer's state, configuration, and rendering for a single element.
     *
     * @param {HTMLElement} element - The DOM element to attach the timer to.
     * @param {object} options - Configuration options for this timer instance.
     * @constructor
     */
    var TC_Instance = function ( element , options ) {

        this.element = element ; // The DOM element associated with this timer.
        this.container ; // The jQuery container for the timer's visual components.
        this.listeners = null ; // Event listeners for the timer.

        this.data = {
            paused : false , // Whether the timer is currently paused.
            last_frame : 0 , // Timestamp of the last animation frame.
            animation_frame : null , // ID of the requestAnimationFrame call.
            interval_fallback : null , // ID of the setInterval fallback.
            timer : false , // The target date/time as a Date object or timestamp.
            total_duration : null , // The initial total duration in seconds.
            prev_time : null , // The timestamp of the previous update.
            drawn_units : [ ] , // Units that are configured to be displayed.
            text_elements : { // jQuery elements for displaying text for each unit.
                Days : null ,
                Hours : null ,
                Minutes : null ,
                Seconds : null
            } ,
            attributes : { // Canvas-related attributes.
                canvas : null ,
                context : null ,
                item_size : null ,
                line_width : null ,
                radius : null ,
                outer_radius : null
            } ,
            state : { // State variables for visual effects like fading.
                fading : {
                    Days : false ,
                    Hours : false ,
                    Minutes : false ,
                    Seconds : false
                }
            }
        } ;

        this.config = null ; // Will hold the merged configuration options.
        this.setOptions ( options ) ; // Apply initial options.
        this.initialize ( ) ; // Set up the timer's visual elements and start.

    } ;

    /**
     * Clears all registered listeners for this TimeCircles instance.
     * Initializes `listeners` object with empty arrays for 'all' and 'visible' categories.
     */
    TC_Instance.prototype.clearListeners = function ( ) {
        this.listeners = {
            all : [ ] ,
            visible : [ ]
        } ;
    } ;

    /**
     * Adds a specified number of seconds to the timer's reference date.
     *
     * @param {number} seconds_to_add - The number of seconds to add to the timer.
     */
    TC_Instance.prototype.addTime = function ( seconds_to_add ) {

        // Check if the reference date is a Date object.
        if ( this.data.attributes.ref_date instanceof Date ) {
            var d = this.data.attributes.ref_date ;
            d.setSeconds ( d.getSeconds ( ) + seconds_to_add ) ;
        }
        // If it's a numeric timestamp, add milliseconds.
        else if ( ! isNaN ( this.data.attributes.ref_date ) ) {
            this.data.attributes.ref_date += ( seconds_to_add * 1000 ) ;
        }

    } ;

    /**
     * Initializes or re-initializes the TimeCircles instance,
     * setting up its visual components and listeners.
     *
     * @param {boolean} [clear_listeners=true] - Whether to clear existing listeners.
     */
    TC_Instance.prototype.initialize = function ( clear_listeners ) {

        // Re-initialize the list of units that will actually be drawn.
        this.data.drawn_units = [ ] ;
        for ( var i = 0 ; i < Object.keys ( this.config.time ) . length ; i ++ ) {
            var unit = Object.keys ( this.config.time ) [ i ] ;
            if ( this.config.time[unit].show ) {
                this.data.drawn_units.push ( unit ) ;
            }
        }

        // Remove any previously created TimeCircles divs to prevent stacking.
        $ ( this.element ) . children ( 'div.time_circles' ) . remove ( ) ;

        // Determine whether to clear listeners based on argument or default to true.
        if ( typeof clear_listeners === "undefined" ) {
            clear_listeners = true ;
        }
        if ( clear_listeners || this.listeners === null ) {
            this.clearListeners ( ) ;
        }

        // Create the main container for the timer elements.
        this.container = $ ( "<div>" ) ;
        this.container.addClass ( 'time_circles' ) ;
        this.container.appendTo ( this.element ) ;

        // Determine the required width and height for the TimeCircles display.
        var height = this.element.offsetHeight ;
        var width = this.element.offsetWidth ;

        if ( height === 0 ) {
            height = $ ( this.element ) . height ( ) ;
        }
        if ( width === 0 ) {
            width = $ ( this.element ) . width ( ) ;
        }

        // Adjust dimensions if one is zero and the other is not.
        if ( height === 0 && width > 0 ) {
            height = width / this.data.drawn_units.length ;
        }
        else if ( width === 0 && height > 0 ) {
            width = height * this.data.drawn_units.length ;
        }

        // Create the canvas element for drawing the circles.
        var canvasElement = document.createElement ( 'canvas' ) ;
        canvasElement.width = width ;
        canvasElement.height = height ;

        // Append the canvas to the container.
        this.data.attributes.canvas = $ ( canvasElement ) ;
        this.data.attributes.canvas.appendTo ( this.container ) ;

        // Check for native canvas support.
        var canvasSupported = isCanvasSupported ( ) ;

        // If native support is missing, check for ExplorerCanvas (IE8 compatibility).
        if ( ! canvasSupported && typeof G_vmlCanvasManager !== "undefined" ) {
            G_vmlCanvasManager.initElement ( canvasElement ) ;
            limited_mode = true ; // Enter limited mode for IE8.
            canvasSupported = true ;
        }

        // Get the 2D rendering context if canvas is supported.
        if ( canvasSupported ) {
            this.data.attributes.context = canvasElement.getContext ( '2d' ) ;
        }

        // Calculate dimensions for individual timer items.
        this.data.attributes.item_size = Math.min ( width / this.data.drawn_units.length , height ) ;
        this.data.attributes.line_width = this.data.attributes.item_size * this.config.fg_width ;
        this.data.attributes.radius = ( ( this.data.attributes.item_size * 0.8 ) - this.data.attributes.line_width ) / 2 ;
        this.data.attributes.outer_radius = this.data.attributes.radius + 0.5 * Math.max ( this.data.attributes.line_width , this.data.attributes.line_width * this.config.bg_width ) ;


        // Prepare and append text elements (labels and numbers) for each visible unit.
        var i = 0 ; // Counter for positioning.
        for ( var key in this.data.text_elements ) {

            if ( ! this.config.time[key].show ) {
                continue ; // Skip if this unit is not configured to be shown.
            }

            var textElement = $ ( "<div>" ) ;
            textElement.addClass ( 'textDiv_' + key ) ;
            textElement.css ( "top" , Math.round ( 0.35 * this.data.attributes.item_size ) ) ;
            textElement.css ( "left" , Math.round ( i ++ * this.data.attributes.item_size ) ) ;
            textElement.css ( "width" , this.data.attributes.item_size ) ;
            textElement.appendTo ( this.container ) ;

            var headerElement = $ ( "<h4>" ) ;
            headerElement.text ( this.config.time[key].text ) ; // Use configured unit text.
            headerElement.css ( "font-size" , Math.round ( this.config.text_size * this.data.attributes.item_size ) ) ;
            headerElement.css ( "line-height" , Math.round ( this.config.text_size * this.data.attributes.item_size ) + "px" ) ;
            headerElement.appendTo ( textElement ) ;

            var numberElement = $ ( "<span>" ) ;
            numberElement.css ( "font-size" , Math.round ( 3 * this.config.text_size * this.data.attributes.item_size ) ) ;
            numberElement.css ( "line-height" , Math.round ( this.config.text_size * this.data.attributes.item_size ) + "px" ) ;
            numberElement.appendTo ( textElement ) ;

            this.data.text_elements[key] = numberElement ; // Store reference to the number element.

        }

        this.start ( ) ; // Begin the timer.

        // Pause immediately if 'start' option is false.
        if ( ! this.config.start ) {
            this.data.paused = true ;
        }

        // Set up an interval fallback for browsers that might not reliably support
        // requestAnimationFrame or as a general safety net.
        var _this = this ;
        this.data.interval_fallback = useWindow.setInterval ( function ( ) {
            _this.update.call ( _this , true ) ; // Call update with nodraw=true.
        } , 100 ) ;

    } ;

    /**
     * Updates the timer's display. This function is called repeatedly via
     * requestAnimationFrame or setInterval.
     *
     * @param {boolean} [nodraw=false] - If true, only updates internal state and listeners,
     *                                   without redrawing the canvas.
     */
    TC_Instance.prototype.update = function ( nodraw ) {

        // Default nodraw to false if not provided.
        if ( typeof nodraw === "undefined" ) {
            nodraw = false ;
        }
        // If nodraw is true and the timer is paused, exit early without doing anything.
        else if ( nodraw && this.data.paused ) {
            return ;
        }

        // In limited mode (e.g., IE8 with ExplorerCanvas), clear the entire canvas
        // because per-unit clearing might not work correctly.
        if ( limited_mode ) {
            this.data.attributes.context.clearRect ( 0 , 0 , this.data.attributes.canvas[0].width , this.data.attributes.canvas[0].hright ) ;
        }

        var diff , old_diff ; // Variables to store current and old time differences.

        var prevDate = this.data.prev_time ; // Get the previous update time.
        var curDate = new Date ( ) ; // Get the current time.
        this.data.prev_time = curDate ; // Update the previous time for the next cycle.

        if ( prevDate === null ) {
            prevDate = curDate ; // If this is the first update, prevDate is same as curDate.
        }

        // If 'count_past_zero' is false and the target date has already passed,
        // stop the timer and display zeros.
        if ( ! this.config.count_past_zero ) {
            if ( curDate > this.data.attributes.ref_date ) {

                // Iterate through drawn units to set text to "0" and draw arcs at 0 progress.
                for ( var i = 0 ; i < this.data.drawn_units.length ; i ++ ) {
                    var key = this.data.drawn_units[i] ;

                    // Set the text value to zero.
                    this.data.text_elements[key].text ( "0" ) ;

                    // Calculate center coordinates for drawing.
                    var x = ( i * this.data.attributes.item_size ) + ( this.data.attributes.item_size / 2 ) ;
                    var y = this.data.attributes.item_size / 2 ;
                    var color = this.config.time[key].color ;

                    // Draw a full background arc, and a foreground arc with 0 progress.
                    this.drawArc ( x , y , color , 0 ) ;
                }
                this.stop ( ) ; // Stop the timer animation.
                return ; // Exit the update function.
            }
        }

        // Calculate the difference between the reference date and current/previous dates in seconds.
        diff = ( this.data.attributes.ref_date - curDate ) / 1000 ;
        old_diff = ( this.data.attributes.ref_date - prevDate ) / 1000 ;

        // Determine if values should be floored based on animation type.
        var floor = this.config.animation !== "smooth" ;

        // Parse time differences for visible units and all units.
        var visible_times = parse_times ( diff , old_diff , this.data.total_duration , this.data.drawn_units , floor ) ;
        var all_times = parse_times ( diff , old_diff , secondsIn["Years"] , allUnits , floor ) ;

        var i = 0 ; // Generic loop counter.
        var j = 0 ; // Another generic loop counter.
        var lastKey = null ; // Placeholder, not used in this snippet.

        var cur_shown = this.data.drawn_units.slice ( ) ; // Create a shallow copy of drawn units.

        // Loop through all possible units to check for listener notifications.
        for ( var i in allUnits ) {

            var key = allUnits[i] ;

            // Notify 'all' listeners if the floored value of this unit has changed.
            if ( Math.floor ( all_times.raw_time[key] ) !== Math.floor ( all_times.raw_old_time[key] ) ) {
                this.notifyListeners ( key , Math.floor ( all_times.time[key] ) , Math.floor ( diff ) , "all" ) ;
            }

            // If the current unit is not configured to be shown, skip further processing for it.
            if ( cur_shown.indexOf ( key ) < 0 ) {
                continue ;
            }

            // Notify 'visible' listeners if the floored value of this visible unit has changed.
            if ( Math.floor ( visible_times.raw_time[key] ) !== Math.floor ( visible_times.raw_old_time[key] ) ) {
                this.notifyListeners ( key , Math.floor ( visible_times.time[key] ) , Math.floor ( diff ) , "visible" ) ;
            }

            // If nodraw is false, update the visual display.
            if ( ! nodraw ) {
                // Set the text for the current unit.
                this.data.text_elements[key].text ( Math.floor ( Math.abs ( visible_times.time[key] ) ) ) ;