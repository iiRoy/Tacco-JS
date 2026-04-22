/*
 * Author: Albert Sun
 * WSJ.com News Graphics Team
 */

/*
 * JSLint Configuration Directives:
 * white: false - Permit mixed tabs/spaces, or arbitrary spacing.
 * nomen: false - Allow dangling _ in identifiers.
 * debug: false - Prevent debugger statements.
 * devel: true - Allow console and alert.
 * onevar: false - Allow multiple var statements in a function.
 * plusplus: false - Allow ++ and --.
 * browser: true - Assume a browser environment.
 * bitwise: false - Allow bitwise operators.
 * es5: true - Allow ECMAScript 5 features.
 * maxerr: 200 - Maximum number of errors to report.
 */
/*
 * Global Variables:
 * jQuery: false, $: false - jQuery library.
 * log: false - Custom log function.
 * window: false - The global window object.
 * WSJNG: false - Custom WSJNG namespace.
 * _: false - Underscore.js or similar utility library.
 * google: false - Google Maps API.
 * localStorage: false - HTML5 localStorage.
 */


//  Essential utility functions for the application.
if ( ! window . typeOf )
{
    window.typeOf = function ( b )
    {
        var a = typeof b;

        if ( a === "object" )
        {
            if ( b )
            {
                if ( b instanceof Array )
                {
                    a = "array";
                }
            }
            else
            {
                a = "null";
            }
        }

        return a;
    };
}


// Check for the console object to prevent errors in older browsers
// or environments where console is not available.
if ( ! window . console )
{
    window . console = {
        "log": function ( ) { } // Provide a dummy log function
    };
}


// Establish a global namespace for Google Maps related functionalities.
// This ensures our variables don't pollute the global scope.
var gmap = gmap || {};

( function ( ) {

    // Include a lightweight underscore-like `_` utility for common operations
    // if a full Underscore.js library isn't already available.
    // This avoids a hard dependency just for `_.extend`.
    // Source inspiration: https://github.com/documentcloud/underscore/
    gmap._ = window._ || ( function ( ) {
        var _ = { };
        var breaker = { };

        var slice = Array . prototype . slice;
        var nativeForEach = Array . prototype . forEach;

        // The core iteration function, known as `each` or `forEach`.
        // It supports objects with a built-in `forEach` method, standard arrays,
        // and plain JavaScript objects.
        // It will use the native `forEach` provided by ECMAScript 5 if available.
        var each = _.each = _.forEach = function ( obj, iterator, context )
        {
            if ( obj == null ) return;

            if ( nativeForEach && obj . forEach === nativeForEach )
            {
                obj . forEach ( iterator, context );
            }
            else if ( obj . length === + obj . length )
            {
                // Iterate over array-like objects.
                for ( var i = 0, l = obj . length; i < l; i ++ )
                {
                    if ( i in obj && iterator . call ( context, obj [ i ], i, obj ) === breaker )
                    {
                        return;
                    }
                }
            }
            else
            {
                // Iterate over plain objects.
                for ( var key in obj )
                {
                    if ( hasOwnProperty . call ( obj, key ) )
                    {
                        if ( iterator . call ( context, obj [ key ], key, obj ) === breaker )
                        {
                            return;
                        }
                    }
                }
            }
        };

        // Extends a target object with properties from one or more source objects.
        // Properties from later source objects overwrite earlier ones.
        _.extend = function ( obj )
        {
            each ( slice . call ( arguments, 1 ), function ( source )
            {
                for ( var prop in source )
                {
                    // Only copy properties that are not undefined.
                    if ( source [ prop ] !== void 0 )
                    {
                        obj [ prop ] = source [ prop ];
                    }
                }
            } );

            return obj;
        };

        return _;
    } ( ) );


    // Extend the Google Maps LatLng prototype to include a `toGeoJSON` method.
    // This converts a LatLng object into a GeoJSON-compatible coordinate array [longitude, latitude].
    google . maps . LatLng . prototype . toGeoJSON = function ( )
    {
        return [ this . lng ( ), this . lat ( ) ];
    };


    // Extend the Google Maps MVCArray prototype to include a `toGeoJSON` method.
    // This method converts an array of LatLng objects (or objects with `toGeoJSON`)
    // into a GeoJSON-compatible array of coordinate arrays.
    google . maps . MVCArray . prototype . toGeoJSON = function ( )
    {
        var thisarray = this . getArray ( );
        var newarray = [ ];

        for ( var i = 0, len = thisarray . length; i < len; i ++ )
        {
            newarray . push ( thisarray [ i ] . toGeoJSON ( ) );
        }

        return newarray;
    };


    /**
     * Represents a geometric feature that can be displayed on a Google Map.
     * This constructor initializes a feature with its geographical data and display properties.
     *
     * @param { Object } params - Configuration object for the feature.
     * @param { String } params.id - A unique identifier for this feature.
     * @param { Array } params.multipolygon - A GeoJSON-like multipolygon structure,
     *                                        containing arrays of LatLng objects.
     *                                        Example: [ [ [ {google.maps.LatLng}, ... ], ... ], ... ]
     * @param { Object } params.fields - An object holding key-value data associated with the feature.
     * @param { google.maps.Map } params.map - The Google Maps instance where the feature's polygons will be rendered.
     * @param { Object } params.controller - A controller object responsible for managing the feature's
     *                                        selection state (e.g., which feature is currently selected).
     * @param { Function } [params.highlightCallback] - Optional callback function executed when the feature's
     *                                                  highlighted state changes.
     * @param { Function } [params.selectCallback] - Optional callback function executed when the feature's
     *                                               selected state changes.
     * @param { String } [params.color] - Optional fill color for the polygons when unselected.
     * @param { Function } [params.responsive_unselected_opts] - Function returning dynamic options for unselected state.
     * @param { Function } [params.responsive_highlighted_opts] - Function returning dynamic options for highlighted state.
     * @param { Function } [params.responsive_selected_opts] - Function returning dynamic options for selected state.
     */
    gmap . Feature = function ( params )
    {
        var self = this;

        this . id = params . id;
        this . polygons = [ ];

        if ( params . fields )
        {
            this . fields = params . fields;
            // The original code had commented-out logic for humanizing fields.
            // This is kept commented as per Type I clone requirements (modifying comments).
            // this.humanized_fields = {};
            // for (var prop in params.fields) {
            //     if (params.fields.hasOwnProperty(prop)) {
            //         this.humanized_fields[prop] = gmap.util.humanize.addCommas(params.fields[prop]);
            //     }
            // }
        }

        this . controller = params . controller;

        this . _selected = false;
        this . _highlighted = false;

        this . highlightCallback = params . highlightCallback;
        this . selectCallback = params . selectCallback;

        // A default empty function for responsive options if not provided.
        var empty_function = function ( ) { return { }; };

        this . _responsive_unselected_poly_options = params . responsive_unselected_opts == null ? empty_function : params . responsive_unselected_opts;
        this . _responsive_highlighted_poly_options = params . responsive_highlighted_opts == null ? empty_function : params . responsive_highlighted_opts;
        this . _responsive_selected_poly_options = params . responsive_selected_opts == null ? empty_function : params . responsive_selected_opts;

        // Apply a custom color if provided, otherwise use default unselected options.
        if ( params . color )
        {
            this . unselected_poly_options = gmap . _ . extend ( { }, this . _unselected_poly_options, { "fillColor": params . color } );
        }
        else
        {
            this . unselected_poly_options = gmap . _ . extend ( { }, this . _unselected_poly_options );
        }

        // --- Event Handlers for Polygons ---

        // Handler for mouseover event: highlights the feature.
        function mouseoverHandler ( e )
        {
            self . setHighlighted ( true );
        }

        // Handler for mouseout event: unhighlights the feature.
        function mouseoutHandler ( e )
        {
            self . setHighlighted ( false );
        }

        // Handler for click event: toggles the selected state of the feature.
        function clickHandler ( e )
        {
            if ( self . getSelected ( ) )
            {
                self . setSelected ( false );
            }
            else
            {
                self . setSelected ( true );
            }
        }

        // Initialize and add Google Maps Polygons for each part of the multipolygon.
        for ( var i = 0, len = params . multipolygon . length; i < len; i ++ )
        {
            this . polygons . push ( new google . maps . Polygon ( gmap . _ . extend ( { }, this . unselected_poly_options, this . _responsive_unselected_poly_options ( ), {
                paths: params . multipolygon [ i ],
                map: params . map
            } ) ) );

            // Attach event listeners to each polygon.
            google . maps . event . addListener ( this . polygons [ i ], "mousemove", mouseoverHandler );
            google . maps . event . addListener ( this . polygons [ i ], "mouseout", mouseoutHandler );
            google . maps . event . addListener ( this . polygons [ i ], "click", clickHandler );
        }
    };

    // Prototype methods and properties for gmap.Feature.
    gmap . Feature . prototype = {

        // Default options for an unselected polygon.
        _unselected_poly_options: {
            clickable: true,
            fillColor: "#AAAAAA",
            strokeColor: "#000000",
            strokeWeight: 1.0,
            strokeOpacity: 0.25
        },

        // Default options for a selected polygon.
        _selected_poly_options: {
            strokeOpacity: 1.0,
            strokeWeight: 1.0,
            strokeColor: "#0000FF" /* Blue stroke for selected */
        },

        // Default options for a highlighted polygon.
        _highlighted_poly_options: {
            strokeOpacity: 1.0,
            strokeWeight: 1.0,
            strokeColor: "#00FF00" /* Green stroke for highlighted */
        },

        /**
         * Removes the feature's polygons from the map and cleans up references.
         * @param { Event } e - The event object (optional, not used).
         */
        remove: function ( e )
        {
            for ( var i = 0, len = this . polygons . length; i < len; i ++ )
            {
                // Clear all attached event listeners to prevent memory leaks.
                google . maps . event . clearListeners ( this . polygons [ i ], "mousemove" );
                google . maps . event . clearListeners ( this . polygons [ i ], "mouseout" );
                // Set map to null to remove the polygon from the display.
                this . polygons [ i ] . setMap ( null );
            }

            // Nullify references to aid garbage collection.
            this . controller = null;
            this . polygons = null;
        },

        /**
         * Converts the feature's polygons to a GeoJSON-compatible multipolygon array.
         * @returns { Array } A GeoJSON multipolygon representation of the feature.
         */
        toGeoJSON: function ( )
        {
            var multipoly = [ ];
            for ( var i = 0, len = this . polygons . length; i < len; i ++ )
            {
                multipoly . push ( this . polygons [ i ] . getPaths ( ) . toGeoJSON ( ) );
            }
            return multipoly;
        },

        /**
         * Redraws the polygons associated with this feature, applying the correct
         * styling based on its current selected and highlighted states.
         * Highlighted and selected styles are layered on top of the unselected state.
         *
         * NOTE: Ensure that the z-index for highlighted/selected polygons is set higher
         *       than unselected polygons for proper visual layering.
         */
        redraw: function ( )
        {
            // Start with the base unselected options, including any responsive ones.
            var opts = gmap . _ . extend ( { }, this . unselected_poly_options, this . _responsive_unselected_poly_options ( ) );

            // If highlighted, merge in highlighted options.
            if ( this . _highlighted )
            {
                opts = gmap . _ . extend ( opts, this . _highlighted_poly_options, this . _responsive_highlighted_poly_options ( ) );
            }

            // If selected, merge in selected options (this will override highlighted if both apply).
            if ( this . _selected )
            {
                opts = gmap . _ . extend ( opts, this . _selected_poly_options, this . _responsive_selected_poly_options ( ) );
            }

            // Apply the final set of options to all polygons of the feature.
            for ( i = 0, len = this . polygons . length; i < len; i ++ )
            {
                this . polygons [ i ] . setOptions ( opts );
            }
        },

        /**
         * Checks if the feature is currently selected.
         * @returns { Boolean } True if selected, false otherwise.
         */
        getSelected: function ( )
        {
            return this . _selected;
        },

        /**
         * Sets the selected state of the feature.
         * If selecting, it will deselect any other currently selected feature via the controller.
         * @param { Boolean } value - True to select, false to deselect.
         */
        setSelected: function ( value )
        {
            var i, len;

            if ( value === true )
            {
                // If another feature is currently selected by the controller, deselect it first.
                if ( this . controller . selected !== null )
                {
                    this . controller . selected . setSelected ( false );
                }

                this . _selected = true;
                this . controller . selected = this; // Update controller's reference to the selected feature.
                this . redraw ( ); // Update visual styling.

                if ( this . selectCallback )
                {
                    this . selectCallback ( ); // Execute select callback if defined.
                }
            }
            else if ( value === false )
            {
                this . _selected = false;
                this . redraw ( ); // Update visual styling.
            }
        },

        /**
         * Checks if the feature is currently highlighted.
         * @returns { Boolean } True if highlighted, false otherwise.
         */
        getHighlighted: function ( )
        {
            return this . _highlighted;
        },

        /**
         * Sets the highlighted state of the feature.
         * Only redraws if the state actually changes.
         * @param { Boolean } value - True to highlight, false to unhighlight.
         */
        setHighlighted: function ( value )
        {
            var i, len;

            if ( ( value === true ) && ( this . _highlighted === false ) )
            {
                this . _highlighted = true;
                this . redraw ( ); // Update visual styling.

                if ( this . highlightCallback )
                {
                    this . highlightCallback ( ); // Execute highlight callback if defined.
                }
            }
            else if ( ( value === false ) && ( this . _highlighted === true ) )
            {
                this . _highlighted = false;
                this . redraw ( ); // Update visual styling.
            }
        }
    };

} ( ) );