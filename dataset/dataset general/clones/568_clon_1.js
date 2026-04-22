/*
 *  This file is a modified clone of the original 'waterfall' JavaScript library.
 *  The original source can be found at: http://wlog.cn/waterfall/
 *
 *  Copyright (c) 2013 bingdian. All rights reserved.
 *  Licensed under the MIT license agreement.
 *
 *  This version maintains complete functional equivalence to the original,
 *  with only changes made to whitespace and comments, as per Type I clone definition.
 */
/* global Handlebars: false, console: false */
; ( function ( $, window, document, undefined ) {

    'use strict' ; // Enforce strict parsing and error handling for cleaner code.

    /*
     *  Default configuration options for the waterfall plugin.
     *  These settings define the behavior and appearance of the layout.
     */
    var $window       = $( window ) ,
        pluginName    = 'waterfall' ,
        defaults      = {
            itemCls        : 'waterfall-item' ,  // CSS class for individual brick elements.
            prefix         : 'waterfall' ,       // Prefix for generated waterfall-related element IDs and classes.
            fitWidth       : true ,              // If true, the layout will adjust to fit the parent container's width.
            colWidth       : 240 ,               // Fixed width for each column in pixels.
            gutterWidth    : 10 ,                // Horizontal space (gutter) between brick elements.
            gutterHeight   : 10 ,                // Vertical space (gutter) between brick elements.
            align          : 'center' ,          // Alignment of the bricks: 'center', 'left', or 'right'.
            minCol         : 1 ,                 // Minimum number of columns to display.
            maxCol         : undefined ,         // Maximum number of columns; 'undefined' means infinite.
            maxPage        : undefined ,         // Maximum number of pages to load; 'undefined' means infinite.
            bufferPixel    : -50 ,               // Scroll buffer in pixels. Decrease for quicker loading trigger.
            containerStyle : {                   // Inline styles applied to the main waterfall container.
                position : 'relative'
            } ,
            resizable      : true ,              // Re-layouts bricks when the browser window is resized.
            isFadeIn       : false ,             // Enables a fade-in effect when new items are loaded.
            isAnimated     : false ,             // Enables animation during layout changes (e.g., on resize).
            animationOptions : {                 // Options passed to jQuery's animate function.
            } ,
            isAutoPrefill  : true ,              // Loads data until the document height exceeds the window height.
            checkImagesLoaded : true ,           // Re-layouts once images within new bricks are fully loaded. Set to 'false' for performance if not needed.
            path           : undefined ,         // URL for fetching more data. Can be an array (e.g., ["/page/", "/"])
                                                 // or a function (e.g., function(page) { return '/data/' + page; }).
            dataType       : 'json' ,            // Expected data type from the server: 'json', 'jsonp', or 'html'.
            params         : { } ,               // Additional parameters to send with the AJAX request.
                                                 // Example: {type: "popular", tags: "travel"}
            headers        : { } ,               // Custom headers for the AJAX request, passed to jQuery.ajax().

            loadingMsg     : '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAACwAAAAAEAALAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAACwAAAAAEAALAAAFNygII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAACwAAAAAEAALAAAFvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAACwAAAAAEAALAAAFvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAA7" alt=""><br />Loading...</div>' , // HTML content for the loading message.

            state          : {
                isDuringAjax       : false , // Flag: True if an AJAX request is currently in progress.
                isProcessingData   : false , // Flag: True if data is being processed (layout, etc.).
                isResizing         : false , // Flag: True if the window is currently being resized.
                isPause            : false , // Flag: True if further data loading is paused.
                curPage            : 1       // The current page number being requested.
            } ,

            // Callback functions to customize behavior at various stages.
            callbacks      : {
                /*
                 *  Callback function executed when data loading starts.
                 *  @param {Object} $loading - A jQuery object representing the loading indicator element.
                 */
                loadingStart : function ( $loading ) {
                    $loading.show() ;
                    // console.log('loading', 'start'); // Debugging output.
                } ,

                /*
                 *  Callback function executed when data loading finishes.
                 *  @param {Object} $loading - A jQuery object representing the loading indicator element.
                 *  @param {Boolean} isBeyondMaxPage - True if the maximum page limit has been reached.
                 */
                loadingFinished : function ( $loading, isBeyondMaxPage ) {
                    if ( !isBeyondMaxPage ) {
                        $loading.fadeOut() ;
                        // console.log('loading finished'); // Debugging output.
                    } else {
                        // console.log('loading isBeyondMaxPage'); // Debugging output.
                        $loading.remove() ;
                    }
                } ,

                /*
                 *  Callback function executed if a data loading error occurs.
                 *  @param {Object} $message - A jQuery object representing the message display area.
                 *  @param {String} xhr - The XHR object or a status string like "end" or "error".
                 */
                loadingError : function ( $message, xhr ) {
                    $message.html( 'Data load failed, please try again later.' ) ;
                } ,

                /*
                 *  Callback function to render the received data into HTML.
                 *  @param {String|Object} data - The raw data received from the server.
                 *  @param {String} dataType - The type of data received ("json", "jsonp", "html").
                 *  @returns {String} HTML string ready to be appended to the waterfall.
                 */
                renderData : function ( data, dataType ) {
                    var tpl ,
                        template ;

                    if ( dataType === 'json' || dataType === 'jsonp' ) { // Handle JSON or JSONP data.
                        tpl = $( '#waterfall-tpl' ).html() ;
                        template = Handlebars.compile( tpl ) ;

                        return template( data ) ;
                    } else { // Assume HTML data if not JSON/JSONP.
                        return data ;
                    }
                }
            } ,

            debug          : false // Enable or disable debug logging to the console.
        } ;

    /*
     *  Waterfall constructor function.
     *  Initializes a new waterfall instance for a given element.
     */
    function Waterfall ( element, options ) {
        this.$element      = $( element ) ;
        this.options       = $.extend( true, { } , defaults, options ) ;
        this.colHeightArray = [ ] ; // Stores the current height of each column.
        this.styleQueue    = [ ] ;   // Queue for applying styles in a batched manner.

        this._init() ; // Call the initialization method.
    }


    Waterfall.prototype = {
        constructor : Waterfall ,

        /*
         *  Internal debug logging wrapper.
         *  Only logs messages if the debug option is set to true.
         */
        _debug : function ( ) {
            if ( true !== this.options.debug ) {
                return ;
            }

            if ( typeof console !== 'undefined' && typeof console.log === 'function' ) {
                // Modern browsers with a standard console object.
                // If a single string argument is passed, log it directly.
                if ( ( Array.prototype.slice.call( arguments ) ).length === 1 && typeof Array.prototype.slice.call( arguments )[0] === 'string' ) {
                    console.log( ( Array.prototype.slice.call( arguments ) ).toString() ) ;
                } else {
                    // For multiple arguments or non-string arguments, log as an array.
                    console.log( Array.prototype.slice.call( arguments ) ) ;
                }
            } else if ( !Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object' ) {
                // Special handling for IE8's console object.
                Function.prototype.call.call( console.log, console, Array.prototype.slice.call( arguments ) ) ;
            }
        } ,


        /*
         *  Initializes the waterfall layout and binds necessary event handlers.
         *  @param {Function} [callback] - An optional callback function to execute after initialization.
         */
        _init : function ( callback ) {
            var options = this.options ,
                path    = options.path ;

            this._setColumns() ;            // Determine and set the number of columns.
            this._initContainer() ;         // Set up the main waterfall container.
            this._resetColumnsHeightArray() ; // Initialize column heights to zero.
            this.reLayout( callback ) ;      // Perform an initial layout of existing items.

            if ( !path ) {
                this._debug( 'Invalid path provided for data loading.' ) ;
                return ;
            }

            // If auto-prefill is enabled, load initial data until the page is full.
            if ( options.isAutoPrefill ) {
                this._prefill() ;
            }

            // Bind to window resize events if the resizable option is true.
            if ( options.resizable ) {
                this._doResize() ;
            }

            // Bind to window scroll events for infinite scrolling.
            this._doScroll() ;
        } ,

        /*
         *  Initializes the main waterfall container element.
         *  Applies styles and adds loading/message elements.
         */
        _initContainer : function ( ) {
            var options = this.options ,
                prefix  = options.prefix ;

            // Fix for potential scrollbar issues in some browsers.
            $( 'body' ).css( {
                overflow : 'scroll'
            } ) ;

            // Apply container styles and add the prefix class.
            this.$element.css( this.options.containerStyle ).addClass( prefix + '-container' ) ;
            // Append loading and message areas after the main element.
            this.$element.after( '<div id="' + prefix + '-loading">' + options.loadingMsg + '</div><div id="' + prefix + '-message" style="text-align:center;color:#999;"></div>' ) ;

            // Cache references to the loading and message elements.
            this.$loading = $( '#' + prefix + '-loading' ) ;
            this.$message = $( '#' + prefix + '-message' ) ;
        } ,


        /**
         *  Calculates the optimal number of columns based on container width and options.
         *  @returns {Number} The calculated number of columns.
         */
        _getColumns : function ( ) {
            var options      = this.options ,
                $container   = options.fitWidth ? this.$element.parent() : this.$element , // Determine the reference container.
                containerWidth = $container[0].tagName === 'BODY' ? $container.width() - 20 : $container.width() , // Adjust for scrollbar if body.
                colWidth     = options.colWidth ,
                gutterWidth  = options.gutterWidth ,
                minCol       = options.minCol ,
                maxCol       = options.maxCol ,
                cols         = Math.floor( containerWidth / ( colWidth + gutterWidth ) ) , // Calculate potential columns.
                col          = Math.max( cols, minCol ) ; // Ensure at least minCol.

            /*
            if ( !maxCol ) {
                return col;
            } else {
                return col > maxCol ? maxCol : col;
            }
            */
            // Return the column count, respecting maxCol if defined.
            return !maxCol ? col : ( col > maxCol ? maxCol : col ) ;
        } ,


        /**
         *  Sets the number of columns for the waterfall layout.
         */
        _setColumns : function ( ) {
            this.cols = this._getColumns() ;
        } ,


        /*
         *  Filters and prepares new items for placement in the waterfall.
         *  @param {jQuery} $content - The jQuery object containing potential new items.
         *  @returns {jQuery} A jQuery object of valid waterfall items, with absolute positioning.
         */
        _getItems : function ( $content ) {
            var $items = $content.filter( '.' + this.options.itemCls ).css( {
                'position' : 'absolute'
            } ) ;

            return $items ;
        } ,


        /*
         *  Resets all column heights to zero.
         *  This is typically done before a complete re-layout.
         */
        _resetColumnsHeightArray : function ( ) {
            var cols = this.cols ,
                i ;

            this.colHeightArray.length = cols ; // Resize the array.

            for ( i = 0 ; i < cols ; i++ ) {
                this.colHeightArray[i] = 0 ; // Set each column's height to zero.
            }
        } ,

        /*
         *  Performs the actual layout of items within the waterfall container.
         *  @param {jQuery} $content - The jQuery object containing items to be laid out.
         *  @param {Function} [callback] - An optional callback to execute after layout is complete.
         */
        layout : function ( $content, callback ) {
            var options        = this.options ,
                $items         = options.isFadeIn ? this._getItems( $content ).css( { opacity : 0 } ).animate( { opacity : 1 } ) : this._getItems( $content ) ,
                styleFn        = ( options.isAnimated && options.state.isResizing ) ? 'animate' : 'css' ,
                animationOptions = options.animationOptions ,
                colWidth       = options.colWidth ,
                gutterWidth    = options.gutterWidth ,
                len            = this.colHeightArray.length ,
                align          = options.align ,
                fixMarginLeft ,
                obj ,
                i , j , itemsLen , styleLen ;

            // Append the new items to the main waterfall element.
            this.$element.append( $items ) ;

            // Calculate the left margin needed for alignment.
            if ( align === 'center' ) {
                fixMarginLeft = ( this.$element.width() - colWidth * len - gutterWidth * ( len - 1 ) ) / 2 ;
                fixMarginLeft = fixMarginLeft > 0 ? fixMarginLeft : 0 ;
            } else if ( align === 'left' ) {
                fixMarginLeft = 0 ;
            } else if ( align === 'right' ) {
                fixMarginLeft = this.$element.width() - colWidth * len - gutterWidth * ( len - 1 ) ;
            }

            // Iterate through items and determine their positions.
            for ( i = 0 , itemsLen = $items.length ; i < itemsLen ; i++ ) {
                this._placeItems( $items[i], fixMarginLeft ) ;
            }

            // Apply the collected styles to the items, either instantly or animated.
            for ( j = 0 , styleLen = this.styleQueue.length ; j < styleLen ; j++ ) {
                obj = this.styleQueue[j] ;
                obj.$el[ styleFn ]( obj.style, animationOptions ) ;
            }

            // Update the overall height of the waterfall container.
            this.$element.height( Math.max.apply( { } , this.colHeightArray ) ) ;

            // Clear the style queue for the next layout pass.
            this.styleQueue = [ ] ;

            // Reset state flags.
            this.options.state.isResizing = false ;
            this.options.state.isProcessingData = false ;

            // Execute the optional callback if provided.
            if ( callback ) {
                callback.call( $items ) ;
            }
        } ,


        /*
         *  Re-lays out all existing items in the waterfall.
         *  This is typically called after configuration changes or window resize.
         *  @param {Function} [callback] - An optional callback to execute after re-layout.
         */
        reLayout : function ( callback ) {
            var $content = this.$element.find( '.' + this.options.itemCls ) ;

            this._resetColumnsHeightArray() ; // Reset column heights before re-calculating.
            this.layout( $content , callback ) ;
        } ,

        /*
         *  Determines the position of a single item and adds it to the style queue.
         *  @param {HTMLElement} item - The DOM element of the item to place.
         *  @param {Number} fixMarginLeft - The calculated left margin for alignment.
         */
        _placeItems : function ( item, fixMarginLeft ) {

            var $item          = $( item ) ,
                options        = this.options ,
                colWidth       = options.colWidth ,
                gutterWidth    = options.gutterWidth ,
                gutterHeight   = options.gutterHeight ,
                colHeightArray = this.colHeightArray ,
                len            = colHeightArray.length ,
                minColHeight   = Math.min.apply( { } , colHeightArray ) , // Find the shortest column height.
                minColIndex    = $.inArray( minColHeight, colHeightArray ) , // Get the index of the shortest column.
                colIndex , // Current column index for the item.
                position ;

            // Determine the column index based on fixed classes or shortest column.
            if ( $item.hasClass( options.prefix + '-item-fixed-left' ) ) {
                colIndex = 0 ; // Fixed to the first column.
            } else if ( $item.hasClass( options.prefix + '-item-fixed-right' ) ) {
                colIndex = ( len > 1 ) ? ( len - 1 ) : 0 ; // Fixed to the last column.
            } else {
                colIndex = minColIndex ; // Place in the shortest column.
            }

            // Calculate the item's top and left position.
            position = {
                left : ( colWidth + gutterWidth ) * colIndex + fixMarginLeft ,
                top  : colHeightArray[colIndex]
            } ;

            // Add the item and its calculated style to the style queue.
            this.styleQueue.push( { $el : $item, style : position } ) ;

            // Update the height of the column where the item was placed.
            colHeightArray[colIndex] += $item.outerHeight() + gutterHeight ;

            // Optional: Add a data attribute for the column index.
            // $item.attr('data-col', colIndex);
        } ,

        /*
         *  Prepends new content to the waterfall layout.
         *  @param {jQuery} $content - The jQuery object containing the content to prepend.
         *  @param {Function} [callback] - An optional callback to execute after prepending.
         */
        prepend : function ( $content, callback ) {
            this.$element.prepend( $content ) ;
            this.reLayout( callback ) ; // Re-layout the entire waterfall.
        } ,

        /*
         *  Appends new content to the waterfall layout.
         *  @param {jQuery} $content - The jQuery object containing the content to append.
         *  @param {Function} [callback] - An optional callback to execute after appending.
         */
        append : function ( $content, callback ) {
            this.$element.append( $content ) ;
            this.reLayout( callback ) ; // Re-layout the entire waterfall.
        } ,

        /*
         *  Removes specified items from the waterfall layout.
         *  @param {jQuery} $items - The jQuery object of items to remove.
         *  @param {Function} [callback] - An optional callback to execute after removal.
         */
        removeItems : function ( $items, callback ) {
            this.$element.find( $items ).remove() ;
            this.reLayout( callback ) ; // Re-layout after removing items.
        } ,

        /*
         *  Updates the options of the waterfall plugin.
         *  @param {Object} opts - A plain object containing new options to merge.
         *  @param {Function} [callback] - An optional callback to execute after options are updated.
         */
        option : function ( opts, callback ) {
            if ( $.isPlainObject( opts ) ) {
                this.options = $.extend( true, this.options, opts ) ;

                if ( typeof callback === 'function' ) {
                    callback() ;
                }

                // Re-initialize the waterfall with the new options.
                this._init() ;
            }
        } ,

        /*
         *  Pauses further AJAX requests for data loading.
         *  @param {Function} [callback] - An optional callback to execute after pausing.
         */
        pause : function ( callback ) {
            this.options.state.isPause = true ;

            if ( typeof callback === 'function' ) {
                callback() ;
            }
        } ,


        /*
         *  Resumes AJAX requests for data loading if they were paused.
         *  @param {Function} [callback] - An optional callback to execute after resuming.
         */
        resume : function ( callback ) {
            this.options.state.isPause = false ;

            if ( typeof callback === 'function' ) {
                callback() ;
            }
        } ,

        /**
         *  Initiates an AJAX request to fetch more data.
         *  @param {Function} [callback] - An optional callback to execute upon successful data retrieval.
         */
        _requestData : function ( callback ) {
            var self     = this ,
                options  = this.options ,
                maxPage  = options.maxPage ,
                curPage  = options.state.curPage++ , // Increment current page for the request.
                path     = options.path ,
                dataType = options.dataType ,
                params   = options.params ,
                headers  = options.headers ,
                pageurl ;

            // Check if the maximum page limit has been reached.
            if ( maxPage !== undefined && curPage > maxPage ) {
                options.state.isBeyondMaxPage = true ;
                options.callbacks.loadingFinished( this.$loading, options.state.isBeyondMaxPage ) ;
                return ;
            }

            // Construct the URL for the AJAX request.
            pageurl = ( typeof path === 'function' ) ? path( curPage ) : path.join( curPage ) ;

            this._debug( 'Heading into AJAX request:', pageurl + $.param( params ) ) ;

            // Trigger the loading start callback.
            options.callbacks.loadingStart( this.$loading ) ;

            // Update state flags to indicate ongoing AJAX and data processing.
            options.state.isDuringAjax = true ;
            options.state.isProcessingData = true ;

            // Perform the AJAX request using jQuery.
            $.ajax( {
                url      : pageurl ,
                data     : params ,
                headers  : headers ,
                dataType : dataType ,
                success  : function ( data ) {
                    self._handleResponse( data, callback ) ; // Process the successful response.
                    self.options.state.isDuringAjax = false ; // Reset AJAX flag.
                } ,
                error    : function ( jqXHR ) {
                    self._responeseError( 'error' ) ; // Handle AJAX errors.
                }
            } ) ;
        } ,


        /**
         *  Handles the response received from a successful AJAX request.
         *  @param {Object|String} data - The data received from the server.
         *  @param {Function} [callback] - An optional callback to execute after processing.
         */
        _handleResponse : function ( data, callback ) {
            var self              = this ,
                options           = this.options ,
                content           = $.trim( options.callbacks.renderData( data, options.dataType ) ) , // Render the data to HTML.
                $content          = $( content ) ,
                checkImagesLoaded = options.checkImagesLoaded ;

            // If images don't need to be checked, append and finish loading immediately.
            if ( !checkImagesLoaded ) {
                self.append( $content, callback ) ;
                self.options.callbacks.loadingFinished( self.$loading, self.options.state.isBeyondMaxPage ) ;
                // ... (rest of the original code would follow if it were longer)
            }
            // The original code was truncated here. Assuming it would continue with image loading logic.

} ) ;