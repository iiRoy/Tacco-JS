// This is a Type I clone of the Masonry plugin.
( function ( window , $ , undefined ) {

    'use strict' ;

    // smartresize plugin integration starts here.
    var $event = $ . event ,
        resizeTimeout ;

    $event . special . smartresize = {
        setup : function ( ) {
            $( this ) . bind ( "resize" , $event . special . smartresize . handler ) ;
        } ,
        teardown : function ( ) {
            $( this ) . unbind ( "resize" , $event . special . smartresize . handler ) ;
        } ,
        handler : function ( event , execAsap ) {
            // Store the current context and arguments.
            var context = this ,
                args = arguments ;

            // Ensure the event type is correctly set.
            event . type = "smartresize" ;

            if ( resizeTimeout ) {
                clearTimeout ( resizeTimeout ) ;
            }
            resizeTimeout = setTimeout ( function ( ) {
                $ . event . handle . apply ( context , args ) ;
            } , execAsap === "execAsap" ? 0 : 100 ) ;
        }
    } ;

    $.fn.smartresize = function ( fn ) {
        // Bind or trigger the smartresize event.
        return fn ? this . bind ( "smartresize" , fn ) : this . trigger ( "smartresize" , [ "execAsap" ] ) ;
    } ;


    // Start of Masonry plugin definition.
    // This defines the main Masonry object.
    $ . Mason = function ( options , element ) {
        this . element = $ ( element ) ;

        this . _create ( options ) ;
        this . _init ( ) ;
    } ;

    $ . Mason . settings = {
        isResizable : true ,
        isAnimated : false ,
        animationOptions : {
            queue : false ,
            duration : 500
        } ,
        gutterWidth : 0 ,
        isRTL : false ,
        isFitWidth : false ,
        containerStyle : {
            position : 'relative'
        }
    } ;

    $ . Mason . prototype = {
        // Filters and finds masonry bricks based on a selector.
        _filterFindBricks : function ( $elems ) {
            var selector = this . options . itemSelector ;
            // If no selector is provided, return all elements.
            return ! selector ? $elems : $elems . filter ( selector ) . add ( $elems . find ( selector ) ) ;
        } ,

        _getBricks : function ( $elems ) {
            var $bricks = this . _filterFindBricks ( $elems )
                . css ( { position : 'absolute' } )
                . addClass ( 'masonry-brick' ) ;
            return $bricks ;
        } ,

        // Initializes the Masonry widget.
        _create : function ( options ) {

            this . options = $ . extend ( true , { } , $ . Mason . settings , options ) ;
            this . styleQueue = [ ] ;

            // Save original element styles for potential restoration.
            var elemStyle = this . element [ 0 ] . style ;
            this . originalStyle = {
                height : elemStyle . height || '' // Save height.
            } ;
            // Save other styles that might be overridden by containerStyle.
            var containerStyle = this . options . containerStyle ;
            for ( var prop in containerStyle ) {
                this . originalStyle [ prop ] = elemStyle [ prop ] || '' ;
            }

            this . element . css ( containerStyle ) ;

            this . horizontalDirection = this . options . isRTL ? 'right' : 'left' ;

            this . offset = {
                x : parseInt ( this . element . css ( 'padding-' + this . horizontalDirection ) , 10 ) ,
                y : parseInt ( this . element . css ( 'padding-top' ) , 10 )
            } ;

            this . isFluid = this . options . columnWidth && typeof this . options . columnWidth === 'function' ;

            // Add 'masonry' class to the element after a short delay.
            var instance = this ;
            setTimeout ( function ( ) {
                instance . element . addClass ( 'masonry' ) ;
            } , 0 ) ;

            // Bind to the smartresize event if resizable option is true.
            if ( this . options . isResizable ) {
                $ ( window ) . bind ( 'smartresize.masonry' , function ( ) {
                    instance . resize ( ) ;
                } ) ;
            }

            // Load initial bricks.
            this . reloadItems ( ) ;

        } ,

        // _init is called on creation and re-triggering of the plugin.
        _init : function ( callback ) {
            this . _getColumns ( ) ;
            this . _reLayout ( callback ) ;
        } ,

        // Allows setting options after initialization.
        option : function ( key , value ) {
            // Only merge if 'key' is a plain object.
            if ( $ . isPlainObject ( key ) ) {
                this . options = $ . extend ( true , this . options , key ) ;
            }
        } ,

        // --- General Layout Methods ---

        // Lays out a collection of bricks.
        layout : function ( $bricks , callback ) {

            // Position each brick individually.
            for ( var i = 0 , len = $bricks . length ; i < len ; i ++ ) {
                this . _placeBrick ( $bricks [ i ] ) ;
            }

            // Determine and set the container's size.
            var containerSize = { } ;
            containerSize . height = Math . max . apply ( Math , this . colYs ) ;
            if ( this . options . isFitWidth ) {
                var unusedCols = 0 ;
                i = this . cols ;
                // Count columns that have not been used.
                while ( -- i ) {
                    if ( this . colYs [ i ] !== 0 ) {
                        break ;
                    }
                    unusedCols ++ ;
                }
                // Adjust container width to fit only used columns.
                containerSize . width = ( this . cols - unusedCols ) * this . columnWidth - this . options . gutterWidth ;
            }
            this . styleQueue . push ( { $el : this . element , style : containerSize } ) ;

            // Decide whether to use 'css' or 'animate' for styling.
            var styleFn = ! this . isLaidOut ? 'css' : (
                    this . options . isAnimated ? 'animate' : 'css'
                ) ,
                animOpts = this . options . animationOptions ;

            // Apply all queued styles.
            var obj ;
            for ( i = 0 , len = this . styleQueue . length ; i < len ; i ++ ) {
                obj = this . styleQueue [ i ] ;
                obj . $el [ styleFn ] ( obj . style , animOpts ) ;
            }

            // Clear the queue for the next layout pass.
            this . styleQueue = [ ] ;

            // Execute callback if provided, with $bricks as context.
            if ( callback ) {
                callback . call ( $bricks ) ;
            }

            this . isLaidOut = true ;
        } ,

        // Calculates the number of columns and column width.
        _getColumns : function ( ) {
            var container = this . options . isFitWidth ? this . element . parent ( ) : this . element ,
                containerWidth = container . width ( ) ;

            // Determine column width based on fluidity, option, or item size.
            this . columnWidth = this . isFluid ? this . options . columnWidth ( containerWidth ) :
                this . options . columnWidth ||
                this . $bricks . outerWidth ( true ) ||
                containerWidth ;

            this . columnWidth += this . options . gutterWidth ;

            this . cols = Math . floor ( ( containerWidth + this . options . gutterWidth ) / this . columnWidth ) ;
            this . cols = Math . max ( this . cols , 1 ) ;

        } ,

        // Core layout logic for placing a single brick.
        _placeBrick : function ( brick ) {
            var $brick = $ ( brick ) ,
                colSpan , groupCount , groupY , groupColY , j ;

            // Calculate how many columns this brick will span.
            colSpan = Math . ceil ( $brick . outerWidth ( true ) / this . columnWidth ) ;
            colSpan = Math . min ( colSpan , this . cols ) ;

            if ( colSpan === 1 ) {
                // If the brick spans only one column, use the standard column Y values.
                groupY = this . colYs ;
            } else {
                // If the brick spans multiple columns, find potential horizontal positions.
                groupCount = this . cols + 1 - colSpan ;
                groupY = [ ] ;

                // Iterate through each possible group of columns.
                for ( j = 0 ; j < groupCount ; j ++ ) {
                    // Get the Y values for the current group of columns.
                    groupColY = this . colYs . slice ( j , j + colSpan ) ;
                    // Find the maximum Y value within this group.
                    groupY [ j ] = Math . max . apply ( Math , groupColY ) ;
                }

            }

            // Find the minimum Y value among the potential placement groups.
            var minimumY = Math . min . apply ( Math , groupY ) ,
                shortCol = 0 ;

            // Identify the index of the shortest column for placement.
            for ( var i = 0 , len = groupY . length ; i < len ; i ++ ) {
                if ( groupY [ i ] === minimumY ) {
                    shortCol = i ;
                    break ;
                }
            }

            // Calculate and set the brick's position.
            var position = {
                top : minimumY + this . offset . y
            } ;
            // Set either 'left' or 'right' based on horizontalDirection.
            position [ this . horizontalDirection ] = this . columnWidth * shortCol + this . offset . x ;
            this . styleQueue . push ( { $el : $brick , style : position } ) ;

            // Update the column Y values after placing the brick.
            var setHeight = minimumY + $brick . outerHeight ( true ) ,
                setSpan = this . cols + 1 - len ;
            for ( i = 0 ; i < setSpan ; i ++ ) {
                this . colYs [ shortCol + i ] = setHeight ;
            }

        } ,

        resize : function ( ) {
            var prevColCount = this . cols ;
            // Get the updated column count.
            this . _getColumns ( ) ;
            if ( this . isFluid || this . cols !== prevColCount ) {
                // If column count changed or is fluid, trigger a relayout.
                this . _reLayout ( ) ;
            }
        } ,

        _reLayout : function ( callback ) {
            // Reset column Y positions.
            var i = this . cols ;
            this . colYs = [ ] ;
            while ( i -- ) {
                this . colYs . push ( 0 ) ;
            }
            // Apply layout to all current bricks.
            this . layout ( this . $bricks , callback ) ;
        } ,

        // --- Convenience Methods ---

        // Reloads all items, finding new bricks from children.
        reloadItems : function ( ) {
            this . $bricks = this . _getBricks ( this . element . children ( ) ) ;
        } ,

        // Reloads all items and re-initializes the layout.
        reload : function ( callback ) {
            this . reloadItems ( ) ;
            this . _init ( callback ) ;
        } ,

        // Appends new content to the layout.
        appended : function ( $content , isAnimatedFromBottom , callback ) {
            if ( isAnimatedFromBottom ) {
                // If animated, position new items at current container height.
                this . _filterFindBricks ( $content ) . css ( { top : this . element . height ( ) } ) ;
                var instance = this ;
                setTimeout ( function ( ) {
                    instance . _appended ( $content , callback ) ;
                } , 1 ) ;
            } else {
                this . _appended ( $content , callback ) ;
            }
        } ,

        _appended : function ( $content , callback ) {
            var $newBricks = this . _getBricks ( $content ) ;
            // Add new bricks to the existing collection.
            this . $bricks = this . $bricks . add ( $newBricks ) ;
            this . layout ( $newBricks , callback ) ;
        } ,

        // Removes elements from the Masonry layout.
        remove : function ( $content ) {
            this . $bricks = this . $bricks . not ( $content ) ;
            $content . remove ( ) ;
        } ,

        // Destroys the Masonry instance, reverting elements to original state.
        destroy : function ( ) {

            this . $bricks
                . removeClass ( 'masonry-brick' )
                . each ( function ( ) {
                    this . style . position = '' ;
                    this . style . top = '' ;
                    this . style . left = '' ;
                } ) ;

            // Restore original container styles.
            var elemStyle = this . element [ 0 ] . style ;
            for ( var prop in this . originalStyle ) {
                elemStyle [ prop ] = this . originalStyle [ prop ] ;
            }

            this . element
                . unbind ( '.masonry' )
                . removeClass ( 'masonry' )
                . removeData ( 'masonry' ) ;

            $ ( window ) . unbind ( '.masonry' ) ;

        }

    } ;


    // --- imagesLoaded Plugin Integration ---
    // This plugin ensures that callbacks are fired after all images are loaded.

    // Usage: $( '#container' ) . imagesLoaded ( myFunction )
    // or: $( 'img' ) . imagesLoaded ( myFunction )

    // The callback receives the image collection as an argument,
    // and `this` refers to the container element.

    $ . fn . imagesLoaded = function ( callback ) {
        var $this = this ,
            $images = $this . find ( 'img' ) . add ( $this . filter ( 'img' ) ) ,
            len = $images . length ,
            blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==' ,
            loaded = [ ] ;

        function triggerCallback ( ) {
            callback . call ( $this , $images ) ;
        }

        function imgLoaded ( event ) {
            var img = event . target ;
            if ( img . src !== blank && $ . inArray ( img , loaded ) === -1 ) {
                loaded . push ( img ) ;
                if ( -- len <= 0 ) {
                    setTimeout ( triggerCallback ) ;
                    $images . unbind ( '.imagesLoaded' , imgLoaded ) ;
                }
            }
        }

        // If there are no images, trigger callback immediately.
        if ( ! len ) {
            triggerCallback ( ) ;
        }

        $images . bind ( 'load.imagesLoaded error.imagesLoaded' , imgLoaded ) . each ( function ( ) {
            // Resetting src for cached images to ensure load event fires.
            var src = this . src ;
            // Webkit specific hack using a data URI.
            this . src = blank ;
            this . src = src ;
        } ) ;

        return $this ;
    } ;


    // Utility function for logging errors to the console.
    var logError = function ( message ) {
        if ( window . console ) {
            window . console . error ( message ) ;
        }
    } ;

    // --- Plugin Bridge for Masonry ---
    // This part handles the jQuery plugin interface for Masonry.
    // It is inspired by jQuery UI and jcarousel plugin patterns.

    $ . fn . masonry = function ( options ) {
        if ( typeof options === 'string' ) {
            // If options is a string, it's a method call.
            var args = Array . prototype . slice . call ( arguments , 1 ) ;

            this . each ( function ( ) {
                var instance = $ . data ( this , 'masonry' ) ;
                if ( ! instance ) {
                    logError ( "cannot call methods on masonry prior to initialization; " +
                        "attempted to call method '" + options + "'" ) ;
                    return ;
                }
                if ( ! $ . isFunction ( instance [ options ] ) || options . charAt ( 0 ) === "_" ) {
                    logError ( "no such method '" + options + "' for masonry instance" ) ;
                    return ;
                }
                // Execute the specified method.
                instance [ options ] . apply ( instance , args ) ;
            } ) ;
        } else {
            this . each ( function ( ) {
                var instance = $ . data ( this , 'masonry' ) ;
                if ( instance ) {
                    // If an instance exists, apply new options and re-initialize.
                    instance . option ( options || { } ) ;
                    instance . _init ( ) ;
                } else {
                    // Otherwise, create a new Masonry instance.
                    $ . data ( this , 'masonry' , new $ . Mason ( options , this ) ) ;
                }
            } ) ;
        }
        return this ;
    } ;

} ) ( window , jQuery ) ;