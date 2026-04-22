( function ( ) { /* This is the main Gmaps initialization block */


    // Initialize the global Gmaps object if it doesn't exist.
    this . Gmaps = {

        build : function(type, options) { // Function to build a new Gmaps object
            var model;  // Declare a variable for the model.

            if (options == null)
            {
                options = {}; // Ensure options is an object if not provided.
            }
            // Determine the model to use: either a custom handler or the default Gmaps.Objects.Handler.
            model = _.isFunction(options.handler) ? options.handler : Gmaps.Objects.Handler ;


            return new model(type, options); // Create and return a new instance of the chosen model.
        }
        ,

        Builders : { } , // Placeholder for builder classes.


        Objects : { } , // Placeholder for object classes.


        Google : { // Namespace for Google Maps specific objects.
            Objects : { } ,
            Builders : { }
        }
    } ;


} ) . call ( this ) ; // Immediately invoke the function with 'this' context.
( function ( ) {
    var moduleKeywords , // Keywords to prevent direct copying during extend/include.
        __indexOf = [ ] . indexOf || function ( item ) { // Polyfill for Array.prototype.indexOf
            for ( var i = 0 , l = this . length ; i < l ; i ++ ) {
                if ( i in this && this [ i ] === item ) return i ;
            }
            return - 1 ;
        } ;

    moduleKeywords = [ 'extended' , 'included' ] ; // List of keywords to check.

    // Define the Gmaps.Base class, providing extend and include capabilities.
    this . Gmaps . Base = ( function ( ) {


        function Base ( ) { } // Constructor for Base class.


        Base . extend = function ( obj ) { // Static method to extend the Base class itself.
            var key , value , _ref ; // Declare variables.
            for ( key in obj ) {
                value = obj [ key ] ;
                // Only copy properties that are not module keywords.
                if ( __indexOf . call ( moduleKeywords , key ) < 0 ) {
                    this [ key ] = value ;
                }
            }
            // Call the 'extended' hook if it exists.
            if ( ( _ref = obj . extended ) != null ) {
                _ref . apply ( this ) ;
            }
            return this ; // Return the extended class.
        } ;


        Base . include = function ( obj ) { // Static method to include properties into the prototype.
            var key , value , _ref ;
            for ( key in obj ) {
                value = obj [ key ] ;
                // Only copy properties that are not module keywords.
                if ( __indexOf . call ( moduleKeywords , key ) < 0 ) {
                    this . prototype [ key ] = value ;
                }
            }
            // Call the 'included' hook if it exists.
            if ( ( _ref = obj . included ) != null ) {
                _ref . apply ( this ) ;
            }
            return this ; // Return the modified class.
        } ;


        return Base ; // Return the Base class definition.

    } ) . call ( this ) ;


} ) . call ( this ) ;
( function ( ) {
    // Define Gmaps.Objects.BaseBuilder, a foundational class for all builders.
    this . Gmaps . Objects . BaseBuilder = ( function ( ) {


        function BaseBuilder ( ) { } // Constructor for BaseBuilder.

        // Prototype methods for BaseBuilder.
        BaseBuilder . prototype . build = function ( ) {
            // Instantiates the model class with the service object.
            return new ( this . model_class ( ) ) ( this . serviceObject ) ;
        } ;

        BaseBuilder . prototype . before_init = function ( ) { } ; // Hook for actions before initialization.

        BaseBuilder . prototype . after_init = function ( ) { } ; // Hook for actions after initialization.

        BaseBuilder . prototype . addListener = function ( action , fn ) {
            // Adds an event listener to the service object.
            return this . primitives ( ) . addListener ( this . getServiceObject ( ) , action , fn ) ;
        } ;

        BaseBuilder . prototype . getServiceObject = function ( ) {
            // Returns the underlying service object (e.g., Google Maps object).
            return this . serviceObject ;
        } ;

        BaseBuilder . prototype . primitives = function ( ) {
            // Returns the primitives provider (e.g., Gmaps.Google.Primitives).
            return this . constructor . PRIMITIVES ;
        } ;

        BaseBuilder . prototype . model_class = function ( ) {
            // Returns the model class associated with this builder.
            return this . constructor . OBJECT ;
        } ;


        return BaseBuilder ; // Return the BaseBuilder class.

    } ) . call ( this ) ;


} ) . call ( this ) ;
( function ( ) {
    // Factory function for creating Gmaps.Objects.Builders.
    this . Gmaps . Objects . Builders = function ( builderClass , objectClass , primitivesProvider ) {
        return {
            build : function ( args , provider_options , internal_options ) {
                var builder ; // Declare builder variable.

                // Assign static properties to the object and builder classes.
                objectClass . PRIMITIVES = primitivesProvider ;
                builderClass . OBJECT = objectClass ;
                builderClass . PRIMITIVES = primitivesProvider ;

                // Instantiate the builder with provided arguments.
                builder = new builderClass ( args , provider_options , internal_options ) ;
                return builder . build ( ) ; // Call the build method on the new builder instance.
            }
        } ;
    } ;


} ) . call ( this ) ;
( function ( ) {
    // Defines the Gmaps.Objects.Handler, the core class for managing map objects.
    this . Gmaps . Objects . Handler = ( function ( ) {


        function Handler ( type , options ) {
            this . type = type ; // Store the map type (e.g., 'Google').

            if ( options == null ) { // Initialize options if not provided.
                options = { } ;
            }
            this . setPrimitives ( options ) ; // Set the map API primitives.
            this . setOptions ( options ) ; // Set handler options like marker defaults.
            this . _cacheAllBuilders ( ) ; // Pre-cache all necessary builders.
            this . resetBounds ( ) ; // Initialize map bounds.
        }

        // Prototype methods for the Handler.

        Handler . prototype . buildMap = function ( options , onMapLoad ) {
            var _this = this ; // Capture 'this' for use in callbacks.

            if ( onMapLoad == null ) { // Default onMapLoad to an empty function if not provided.
                onMapLoad = function ( ) { } ;
            }

            // Build the map and store it, then create the clusterer and call onMapLoad.
            return this . map = this . _builder ( 'Map' ) . build ( options , function ( ) {
                _this . _createClusterer ( ) ; // Create the marker clusterer.
                return onMapLoad ( ) ; // Execute the user-defined map load callback.
            } ) ;
        } ;

        Handler . prototype . addMarkers = function ( markers_data , provider_options ) {
            var _this = this ;
            // Map over marker data and add each marker individually.
            return _ . map ( markers_data , function ( marker_data ) {
                return _this . addMarker ( marker_data , provider_options ) ;
            } ) ;
        } ;

        Handler . prototype . addMarker = function ( marker_data , provider_options ) {
            var marker ; // Declare marker variable.

            // Build a new marker instance.
            marker = this . _builder ( 'Marker' ) . build ( marker_data , provider_options , this . marker_options ) ;
            marker . setMap ( this . getMap ( ) ) ; // Set the marker's map.
            this . clusterer . addMarker ( marker ) ; // Add the marker to the clusterer.
            return marker ;
        } ;

        Handler . prototype . addCircles = function ( circles_data , provider_options ) {
            var _this = this ;
            return _ . map ( circles_data , function ( circle_data ) {
                return _this . addCircle ( circle_data , provider_options ) ;
            } ) ;
        } ;

        Handler . prototype . addCircle = function ( circle_data , provider_options ) {
            // Generic method to add a circle.
            return this . _addResource ( 'circle' , circle_data , provider_options ) ;
        } ;

        Handler . prototype . addPolylines = function ( polylines_data , provider_options ) {
            var _this = this ;
            return _ . map ( polylines_data , function ( polyline_data ) {
                return _this . addPolyline ( polyline_data , provider_options ) ;
            } ) ;
        } ;

        Handler . prototype . addPolyline = function ( polyline_data , provider_options ) {
            // Generic method to add a polyline.
            return this . _addResource ( 'polyline' , polyline_data , provider_options ) ;
        } ;

        Handler . prototype . addPolygons = function ( polygons_data , provider_options ) {
            var _this = this ;
            return _ . map ( polygons_data , function ( polygon_data ) {
                return _this . addPolygon ( polygon_data , provider_options ) ;
            } ) ;
        } ;

        Handler . prototype . addPolygon = function ( polygon_data , provider_options ) {
            // Generic method to add a polygon.
            return this . _addResource ( 'polygon' , polygon_data , provider_options ) ;
        } ;

        Handler . prototype . addKmls = function ( kmls_data , provider_options ) {
            var _this = this ;
            return _ . map ( kmls_data , function ( kml_data ) {
                return _this . addKml ( kml_data , provider_options ) ;
            } ) ;
        } ;

        Handler . prototype . addKml = function ( kml_data , provider_options ) {
            // Generic method to add a KML layer.
            return this . _addResource ( 'kml' , kml_data , provider_options ) ;
        } ;

        Handler . prototype . removeMarkers = function ( gem_markers ) {
            var _this = this ;
            // Remove multiple markers by mapping over the array.
            return _ . map ( gem_markers , function ( gem_marker ) {
                return _this . removeMarker ( gem_marker ) ;
            } ) ;
        } ;

        Handler . prototype . removeMarker = function ( gem_marker ) {
            gem_marker . clear ( ) ; // Clear the marker from the map.
            return this . clusterer . removeMarker ( gem_marker ) ; // Remove from clusterer.
        } ;

        Handler . prototype . fitMapToBounds = function ( ) {
            // Adjust the map's viewport to fit the current bounds.
            return this . map . fitToBounds ( this . bounds . getServiceObject ( ) ) ;
        } ;

        Handler . prototype . getMap = function ( ) {
            // Get the underlying map service object.
            return this . map . getServiceObject ( ) ;
        } ;

        Handler . prototype . setOptions = function ( options ) {
            // Set and extend various handler options.
            this . marker_options = _ . extend ( this . _default_marker_options ( ) , options . markers ) ;
            this . builders = _ . extend ( this . _default_builders ( ) , options . builders ) ;
            return this . models = _ . extend ( this . _default_models ( ) , options . models ) ;
        } ;

        Handler . prototype . resetBounds = function ( ) {
            // Reset the map bounds by building a new Bound object.
            return this . bounds = this . _builder ( 'Bound' ) . build ( ) ;
        } ;

        Handler . prototype . setPrimitives = function ( options ) {
            // Set the map API primitives provider.
            return this . primitives = options . primitives === void 0 ? this . _rootModule ( ) . Primitives ( ) : _ . isFunction ( options . primitives ) ? options . primitives ( ) : options . primitives ;
        } ;

        Handler . prototype . currentInfowindow = function ( ) {
            // Access the current infowindow from the Marker builder.
            return this . builders . Marker . CURRENT_INFOWINDOW ;
        } ;

        Handler . prototype . _addResource = function ( resource_name , resource_data , provider_options ) {
            var resource ; // Declare resource variable.

            // Build a resource, set its map, and return it.
            resource = this . _builder ( resource_name ) . build ( resource_data , provider_options ) ;
            resource . setMap ( this . getMap ( ) ) ;
            return resource ;
        } ;

        Handler . prototype . _cacheAllBuilders = function ( ) {
            var that ; // Store 'this' for closure.
            that = this ;

            // Iterate through common builder types and pre-cache them.
            return _ . each ( [ 'Bound' , 'Circle' , 'Clusterer' , 'Kml' , 'Map' , 'Marker' , 'Polygon' , 'Polyline' ] , function ( kind ) {
                return that . _builder ( kind ) ;
            } ) ;
        } ;

        Handler . prototype . _clusterize = function ( ) {
            // Check if clustering is enabled in marker options.
            return _ . isObject ( this . marker_options . clusterer ) ;
        } ;

        Handler . prototype . _createClusterer = function ( ) {
            // Create and initialize the marker clusterer.
            return this . clusterer = this . _builder ( 'Clusterer' ) . build ( {
                map : this . getMap ( )
            } , this . marker_options . clusterer ) ;
        } ;

        Handler . prototype . _default_marker_options = function ( ) {
            // Provide default options for markers, including clusterer settings.
            return _ . clone ( {
                singleInfowindow : true ,
                maxRandomDistance : 0 ,
                clusterer : {
                    maxZoom : 5 ,
                    gridSize : 50
                }
            } ) ;
        } ;

        Handler . prototype . _builder = function ( name ) {
            var _name ; // Internal variable for dynamic property name.

            name = this . _capitalize ( name ) ; // Capitalize the builder name.

            // Cache the builder if it hasn't been created yet.
            if ( this [ _name = "__builder" + name ] == null ) {
                this [ _name ] = Gmaps . Objects . Builders ( this . builders [ name ] , this . models [ name ] , this . primitives ) ;
            }
            return this [ "__builder" + name ] ; // Return the cached builder.
        } ;

        Handler . prototype . _default_models = function ( ) {
            var models ; // Declare models variable.
            models = _ . clone ( this . _rootModule ( ) . Objects ) ; // Clone default objects from root module.

            // If clustering is not enabled, use NullClusterer.
            if ( this . _clusterize ( ) ) {
                return models ;
            } else {
                models . Clusterer = Gmaps . Objects . NullClusterer ;
                return models ;
            }
        } ;

        Handler . prototype . _capitalize = function ( string ) {
            // Utility function to capitalize the first letter of a string.
            return string . charAt ( 0 ) . toUpperCase ( ) + string . slice ( 1 ) ;
        } ;

        Handler . prototype . _default_builders = function ( ) {
            // Return a clone of the default builders from the root module.
            return _ . clone ( this . _rootModule ( ) . Builders ) ;
        } ;

        Handler . prototype . _rootModule = function ( ) {
            // Lazily initialize and return the root Gmaps module (e.g., Gmaps.Google).
            if ( this . __rootModule == null ) {
                this . __rootModule = Gmaps [ this . type ] ;
            }
            return this . __rootModule ;
        } ;


        return Handler ; // Return the Handler class.

    } ) . call ( this ) ;


} ) . call ( this ) ;
( function ( ) {
    // Defines Gmaps.Objects.NullClusterer, a no-op clusterer for when clustering is disabled.
    this . Gmaps . Objects . NullClusterer = ( function ( ) {


        function NullClusterer ( ) { } // Constructor for NullClusterer.

        // NullClusterer prototype methods do nothing.
        NullClusterer . prototype . addMarkers = function ( ) { } ;

        NullClusterer . prototype . addMarker = function ( ) { } ;

        NullClusterer . prototype . clear = function ( ) { } ;

        NullClusterer . prototype . removeMarker = function ( ) { } ;


        return NullClusterer ; // Return the NullClusterer class.

    } ) . call ( this ) ;


} ) . call ( this ) ;
( function ( ) {
    // Defines Gmaps.Google.Objects.Common, a mixin for common map object functionalities.
    this . Gmaps . Google . Objects . Common = {

        getServiceObject : function ( ) { // Returns the underlying Google Maps service object.
            return this . serviceObject ;
        } ,

        setMap : function ( map ) { // Sets the map for the service object.
            return this . getServiceObject ( ) . setMap ( map ) ;
        } ,

        clear : function ( ) { // Clears the object from the map.
            return this . getServiceObject ( ) . setMap ( null ) ;
        } ,

        show : function ( ) { // Makes the object visible.
            return this . getServiceObject ( ) . setVisible ( true ) ;
        } ,

        hide : function ( ) { // Hides the object.
            return this . getServiceObject ( ) . setVisible ( false ) ;
        } ,

        isVisible : function ( ) { // Checks if the object is visible.
            return this . getServiceObject ( ) . getVisible ( ) ;
        } ,

        primitives : function ( ) { // Returns the primitives provider for the object's constructor.
            return this . constructor . PRIMITIVES ;
        }
    } ;


} ) . call ( this ) ;
( function ( ) {
    var __hasProp = { } . hasOwnProperty , // Helper for checking object properties.
        __extends = function ( child , parent ) { // Helper function for class inheritance.
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Bound, extending BaseBuilder.
    this . Gmaps . Google . Builders . Bound = ( function ( _super ) {
        __extends ( Bound , _super ) ; // Establish inheritance.


        function Bound ( options ) {
            this . before_init ( ) ; // Call pre-initialization hook.
            // Initialize the service object as a new LatLngBounds instance.
            this . serviceObject = new ( this . primitives ( ) . latLngBounds ) ;
            this . after_init ( ) ; // Call post-initialization hook.
        }


        return Bound ; // Return the Bound builder class.

    } ) ( Gmaps . Objects . BaseBuilder ) ; // Inherit from Gmaps.Objects.BaseBuilder.


} ) . call ( this ) ;
( function ( ) {
    var __hasProp = { } . hasOwnProperty ,
        __extends = function ( child , parent ) {
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Circle, a builder for Google Maps circles.
    this . Gmaps . Google . Builders . Circle = ( function ( _super ) {
        __extends ( Circle , _super ) ;


        function Circle ( args , provider_options ) {
            this . args = args ; // Store arguments for circle creation.
            this . provider_options = provider_options != null ? provider_options : { } ; // Default options.
            this . before_init ( ) ;
            this . serviceObject = this . create_circle ( ) ; // Create the actual Google Maps Circle object.
            this . after_init ( ) ;
        }

        Circle . prototype . create_circle = function ( ) {
            // Instantiates a new Google Maps Circle with calculated options.
            return new ( this . primitives ( ) . circle ) ( this . circle_options ( ) ) ;
        } ;

        Circle . prototype . circle_options = function ( ) {
            var base_options ; // Declare base options variable.
            // Define core options for the circle.
            base_options = {
                center : new ( this . primitives ( ) . latLng ) ( this . args . lat , this . args . lng ) ,
                radius : this . args . radius
            } ;
            // Merge base options with provider-specific options.
            return _ . defaults ( base_options , this . provider_options ) ;
        } ;


        return Circle ;

    } ) ( Gmaps . Objects . BaseBuilder ) ;


} ) . call ( this ) ;
( function ( ) {
    var __hasProp = { } . hasOwnProperty ,
        __extends = function ( child , parent ) {
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Clusterer, a builder for marker clusterers.
    this . Gmaps . Google . Builders . Clusterer = ( function ( _super ) {
        __extends ( Clusterer , _super ) ;


        function Clusterer ( args , options ) {
            this . args = args ; // Arguments for the clusterer.
            this . options = options ; // Options for the clusterer.
            this . before_init ( ) ;
            // Initialize the service object as a new Google Maps MarkerClusterer.
            this . serviceObject = new ( this . primitives ( ) . clusterer ) ( this . args . map , [ ] , this . options ) ;
            this . after_init ( ) ;
        }


        return Clusterer ;

    } ) ( Gmaps . Objects . BaseBuilder ) ;


} ) . call ( this ) ;
( function ( ) {
    var __hasProp = { } . hasOwnProperty ,
        __extends = function ( child , parent ) {
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Kml, a builder for Google Maps KML layers.
    this . Gmaps . Google . Builders . Kml = ( function ( _super ) {
        __extends ( Kml , _super ) ;


        function Kml ( args , provider_options ) {
            this . args = args ; // Arguments for KML layer (e.g., URL).
            this . provider_options = provider_options != null ? provider_options : { } ;
            this . before_init ( ) ;
            this . serviceObject = this . create_kml ( ) ; // Create the actual Google Maps KML layer object.
            this . after_init ( ) ;
        }

        Kml . prototype . create_kml = function ( ) {
            // Instantiates a new Google Maps KML layer.
            return new ( this . primitives ( ) . kml ) ( this . args . url , this . kml_options ( ) ) ;
        } ;

        Kml . prototype . kml_options = function ( ) {
            var base_options ;
            base_options = { } ; // No specific base options for KML, just provider_options.
            return _ . defaults ( base_options , this . provider_options ) ;
        } ;


        return Kml ;

    } ) ( Gmaps . Objects . BaseBuilder ) ;


} ) . call ( this ) ;
( function ( ) {
    var __hasProp = { } . hasOwnProperty ,
        __extends = function ( child , parent ) {
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Map, a builder for Google Maps map instances.
    this . Gmaps . Google . Builders . Map = ( function ( _super ) {
        __extends ( Map , _super ) ;


        function Map ( options , onMapLoad ) {
            var provider_options ; // Declare provider options variable.

            this . before_init ( ) ;
            // Merge default map options with provider-specific options.
            provider_options = _ . extend ( this . default_options ( ) , options . provider ) ;
            this . internal_options = options . internal ; // Store internal options.

            // Create the new Google Maps Map object.
            this . serviceObject = new ( this . primitives ( ) . map ) ( document . getElementById ( this . internal_options . id ) , provider_options ) ;
            this . on_map_load ( onMapLoad ) ; // Set up the map load callback.
            this . after_init ( ) ;
        }

        Map . prototype . build = function ( ) {
            // Returns a new map model instance, passing the service object and primitives.
            return new ( this . model_class ( ) ) ( this . serviceObject , this . primitives ( ) ) ;
        } ;

        Map . prototype . on_map_load = function ( onMapLoad ) {
            // Attaches a one-time listener for the 'idle' event on the map.
            return this . primitives ( ) . addListenerOnce ( this . serviceObject , 'idle' , onMapLoad ) ;
        } ;

        Map . prototype . default_options = function ( ) {
            // Provides default options for map creation.
            return {
                mapTypeId : this . primitives ( ) . mapTypes ( 'ROADMAP' ) ,
                center : new ( this . primitives ( ) . latLng ) ( 0 , 0 ) ,
                zoom : 8
            } ;
        } ;


        return Map ;

    } ) ( Gmaps . Objects . BaseBuilder ) ;


} ) . call ( this ) ;
( function ( ) {
    var __bind = function ( fn , me ) { // Helper for binding function context.
            return function ( ) {
                return fn . apply ( me , arguments ) ;
            } ;
        } ,
        __hasProp = { } . hasOwnProperty ,
        __extends = function ( child , parent ) {
            for ( var key in parent ) {
                if ( __hasProp . call ( parent , key ) ) child [ key ] = parent [ key ] ;
            }
            function ctor ( ) {
                this . constructor = child ;
            }
            ctor . prototype = parent . prototype ;
            child . prototype = new ctor ( ) ;
            child . __super__ = parent . prototype ;
            return child ;
        } ;

    // Defines Gmaps.Google.Builders.Marker, a builder for Google Maps markers.
    this . Gmaps . Google . Builders . Marker = ( function ( _super ) {
        __extends ( Marker , _super ) ;

        // Static properties for the Marker builder.
        Marker . CURRENT_INFOWINDOW = void 0 ; // Holds the currently open infowindow.

        Marker . CACHE_STORE = { } ; // Cache for marker instances.