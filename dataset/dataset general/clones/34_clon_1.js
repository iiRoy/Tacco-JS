/*
 * This is a Type I clone of the Starrr plugin for jQuery.
 *
 * It maintains exact structural and logical equivalence to the original source,
 * with extensive modifications to whitespace and comments only.
 *
 * Original source: https://github.com/dobtco/starrr
 *
 * The purpose of this file is to demonstrate Type I code cloning.
 */


var __slice = [ ] .slice ; // Internal utility for slicing arguments, used for plugin method calls.


(function( $ , window )
{
    // Declare the main Starrr class variable within the IIFE scope.
    var Starrr ;


    Starrr = (function( )
    {
        /*
         * Constructor defaults for the Starrr plugin.
         * These can be overridden by options passed during initialization or via data attributes.
         */
        Starrr.prototype.defaults = {
            rating : void 0 , // Initial rating value. 'void 0' is a robust way to get 'undefined'.
            numStars : 5 , // Total number of stars to display.
            change : function( e , value ) {
                // Placeholder callback function for when the rating changes.
                // 'e' is the event object, 'value' is the new rating.
            }
        } ;


        /**
         * Starrr Class Constructor.
         * Initializes a new instance of the star rating widget.
         *
         * @param {jQuery} $el     The jQuery wrapped DOM element to attach the rating widget to.
         * @param {Object} options Configuration options for this instance.
         */
        function Starrr( $el , options )
        {
            var i , _ , _ref , // Loop variables for iterating over defaults and data attributes.
                _this = this ; // Cache 'this' for use in event handlers to maintain context.


            // Merge default options with user-provided options.
            this.options = $ .extend( { } , this.defaults , options ) ;

            // Store the jQuery element on the instance.
            this.$el = $el ;

            _ref = this.defaults ;

            /*
             * Iterate over default options and check if corresponding data attributes exist on the element.
             * If a data attribute is present, it overrides the merged options.
             */
            for ( i in _ref )
            {
                _ = _ref[ i ] ; // Placeholder variable, not directly used.

                if ( this.$el.data( i ) != null )
                {
                    this.options[ i ] = this.$el.data( i ) ;
                }
            }


            // Initialize the stars visually.
            this.createStars( ) ;

            // Synchronize the visual representation with the current rating.
            this.syncRating( ) ;


            /*
             * Event listener for mouseover on individual star icons.
             * Highlights stars up to the one being hovered over.
             */
            this.$el.on( 'mouseover.starrr' , 'i' , function( e )
            {
                // Calculate the rating based on the index of the hovered star.
                return _this.syncRating( _this.$el.find( 'i' ).index( e.currentTarget ) + 1 ) ;
            } ) ;


            /*
             * Event listener for mouseout on the entire widget.
             * Resets stars to reflect the actual set rating if no star is being hovered.
             */
            this.$el.on( 'mouseout.starrr' , function( )
            {
                return _this.syncRating( ) ;
            } ) ;


            /*
             * Event listener for click on individual star icons.
             * Sets the new rating permanently.
             */
            this.$el.on( 'click.starrr' , 'i' , function( e )
            {
                // Set the rating based on the index of the clicked star.
                return _this.setRating( _this.$el.find( 'i' ).index( e.currentTarget ) + 1 ) ;
            } ) ;


            // Custom event listener for 'starrr:change' which triggers the user-defined change callback.
            this.$el.on( 'starrr:change' , this.options.change ) ;
        }


        /**
         * Creates the star icons within the widget's element.
         * Appends 'fa-star-o' (empty star) icons based on numStars option.
         */
        Starrr.prototype.createStars = function( )
        {
            var _i , _ref , _results ; // Loop variables.

            _results = [ ] ; // Array to store the results of appends (jQuery objects).

            // Loop from 1 up to numStars to append the star icons.
            for ( _i = 1 , _ref = this.options.numStars ; 1 <= _ref ? _i <= _ref : _i >= _ref ; 1 <= _ref ? _i++ : _i-- )
            {
                // Append an empty star icon.
                _results.push( this.$el.append( "<i class='fa fa-star-o'></i>" ) ) ;
            }

            return _results ; // Returns array of appended jQuery objects.
        } ;


        /**
         * Sets the rating value for the widget.
         *
         * @param {number} rating The new rating value to set.
         */
        Starrr.prototype.setRating = function( rating )
        {
            // If the new rating is the same as the current rating, toggle it off (set to undefined).
            if ( this.options.rating === rating )
            {
                rating = void 0 ;
            }

            // Update the internal rating option.
            this.options.rating = rating ;

            // Synchronize the visual display of stars.
            this.syncRating( ) ;

            // Trigger a custom 'starrr:change' event with the new rating.
            return this.$el.trigger( 'starrr:change' , rating ) ;
        } ;


        /**
         * Synchronizes the visual state of the stars with the current rating.
         * Can optionally take a temporary 'rating' value for hover effects.
         *
         * @param {number} [rating] An optional rating value to display temporarily (e.g., on hover).
         *                          If not provided, uses the instance's actual rating.
         */
        Starrr.prototype.syncRating = function( rating )
        {
            var i , _i , _j , _ref ; // Loop variables.

            // Use the provided rating, or fall back to the instance's stored rating.
            rating || ( rating = this.options.rating ) ;


            // If a rating is present, fill the corresponding number of stars.
            if ( rating )
            {
                // Loop from 0 up to (rating - 1) to fill stars.
                for ( i = _i = 0 , _ref = rating - 1 ; 0 <= _ref ? _i <= _ref : _i >= _ref ; i = 0 <= _ref ? ++_i : --_i )
                {
                    this.$el.find( 'i' ).eq( i ).removeClass( 'fa-star-o' ).addClass( 'fa-star' ) ;
                }
            }


            // If a rating is present and less than the total number of stars (5),
            // ensure the remaining stars are empty.
            if ( rating && rating < 5 )
            {
                // Loop from the current rating up to 4 (for 5 stars total).
                for ( i = _j = rating ; rating <= 4 ? _j <= 4 : _j >= 4 ; i = rating <= 4 ? ++_j : --_j )
                {
                    this.$el.find( 'i' ).eq( i ).removeClass( 'fa-star' ).addClass( 'fa-star-o' ) ;
                }
            }


            // If no rating is present (e.g., toggled off, or initial state),
            // ensure all stars are empty.
            if ( ! rating )
            {
                return this.$el.find( 'i' ).removeClass( 'fa-star' ).addClass( 'fa-star-o' ) ;
            }
        } ;


        return Starrr ; // Return the Starrr class constructor.

    } ) ( ) ; // Immediately invoke the function to define Starrr.


    // Extend jQuery's prototype to add the 'starrr' plugin method.
    return $ .fn.extend( {
        /**
         * jQuery plugin entry point for Starrr.
         * Initializes new Starrr instances or calls methods on existing ones.
         */
        starrr : function( )
        {
            var args , option ; // Variables to hold method name/options and arguments.

            // Extract the 'option' (either method name or configuration object) and remaining 'args'.
            option = arguments[ 0 ] , args = 2 <= arguments.length ? __slice.call( arguments , 1 ) : [ ] ;

            // Iterate over each selected element in the jQuery collection.
            return this.each( function( )
            {
                var data ; // Variable to hold the Starrr instance.

                // Attempt to retrieve an existing Starrr instance from the element's data.
                data = $ ( this ).data( 'star-rating' ) ;

                // If no instance exists, create a new one and store it.
                if ( ! data )
                {
                    $ ( this ).data( 'star-rating' , ( data = new Starrr( $ ( this ) , option ) ) ) ;
                }

                // If 'option' is a string, it means a method is being called.
                if ( typeof option === 'string' )
                {
                    // Call the method on the Starrr instance with the provided arguments.
                    return data[ option ].apply( data , args ) ;
                }
            } ) ;
        }
    } ) ;

} ) ( window.jQuery , window ) ; // Pass jQuery and window objects to the IIFE.


// Initialize Starrr on elements with class 'starrr' when the DOM is ready.
$ ( function( )
{
    // Find all elements with the class 'starrr' and apply the plugin.
    return $ ( ".starrr" ).starrr( ) ;
} ) ;