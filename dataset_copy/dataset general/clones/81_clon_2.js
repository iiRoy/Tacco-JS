/*
 *  js.component-Rotator
 *  @creator ArtfulDev
 *  @licensing MIT License
 *  @project_page https://example.com/artfuldev/js.component-rotator
 */
( function( jQ ) {

    jQ.fn.Rotator = function( config ) {

        var containerEl = this;
        var options = jQ.extend( {
            forwardButton: '.next-item',
            backwardButton: '.prev-item',
            hideControls: false,
            displayMode: false,
            syncHeight: false,
            animationSpeed: 900,
            enableLogging: false,
            isMoving: false,
            loopSlides: false
        }, config );

        // Store configuration and initialize various internal properties
        containerEl.options = options;
        containerEl.contentReady = false;
        containerEl.itemList = jQ( 'ul:first', this );
        containerEl.listItems = jQ( 'li', containerEl.itemList );
        containerEl.firstItem = jQ( 'li:first', containerEl.itemList );
        containerEl.itemIndex = 0;
        containerEl.containerId = jQ( this ).attr( 'id' );
        containerEl.forwardControl = jQ( containerEl.options.forwardButton, this );
        containerEl.backwardControl = jQ( containerEl.options.backwardButton, this );
        containerEl.maxItemHeight = 0;
        containerEl.listWidth = 0;
        containerEl.viewportWidth = 0;
        containerEl.visibleItemsCount = 0;
        containerEl.visibleItemsRatio = 0;
        containerEl.itemWidth = 0; // This variable seems unused in original, retaining for structure

        /**
         *  Core initialization logic encapsulated within a function.
         *  This function is called for each element matched by the selector.
         */
        var initializeCarousel = function() {

            // Conditionally hide backward control if not looping and hideControls is enabled
            if ( containerEl.options.hideControls && !containerEl.options.loopSlides ) {
                containerEl.backwardControl.hide();
            }

            /**
             *  Sets up the carousel dimensions and event handlers.
             *  This part runs once the entire window content is loaded.
             */
            containerEl.prepareLayout = function() {
                containerEl.contentReady = true;

                // Debugging output for setup phase
                if ( containerEl.options.enableLogging ) {
                    console.info( '--- Rotator: Initializing layout ---' );
                    console.log( 'Element ID:', containerEl.containerId );
                    console.debug( '--- Current Configuration ---' );
                    console.dir( options ); // Using dir for object logging
                    if ( containerEl.options.displayMode == 'gallary' ) {
                        console.info( 'Gallery display mode activated.' );
                    }
                    console.log( 'Total list items:', containerEl.listItems.length );
                    console.log( 'Applying container and list styling...' );
                }

                // Apply necessary CSS for the main container element
                jQ( containerEl ).css( {
                    'overflow': 'hidden',
                    'position': 'relative'
                } );

                // Apply CSS for the unordered list (item container)
                containerEl.itemList.css( {
                    'list-style': 'none',
                    'overflow': 'hidden',
                    'position': 'relative',
                    'float': 'left',
                    'width': '99999px' // Ensures all items can be on one line initially
                } );

                // Calculate the effective width for the visible items area
                containerEl.viewportWidth = ( jQ( containerEl ).outerWidth() - containerEl.forwardControl.outerWidth() - containerEl.backwardControl.outerWidth() );

                // More debugging for calculated widths
                if ( containerEl.options.enableLogging ) {
                    console.log( 'Container outer width:', jQ( containerEl ).outerWidth() );
                    console.log( 'Forward button width:', containerEl.forwardControl.outerWidth() );
                    console.log( 'Backward button width:', containerEl.backwardControl.outerWidth() );
                    console.log( 'Effective viewport width:', containerEl.viewportWidth );
                }

                // Setup individual list items (li)
                if ( containerEl.options.enableLogging ) {
                    console.log( 'Configuring list items and determining max height.' );
                }

                containerEl.listItems.each( function() {
                    // Find the maximum height among all list items
                    if ( containerEl.maxItemHeight < jQ( this ).outerHeight( true ) ) {
                        containerEl.maxItemHeight = jQ( this ).outerHeight( true );
                    }

                    // Apply base styling to each list item
                    jQ( this ).css( {
                        'list-style': 'none',
                        'position': 'relative',
                        'float': 'left'
                    } );

                    // Special handling for gallery mode items
                    if ( containerEl.options.displayMode == 'gallary' ) {
                        jQ( this ).addClass( 'grp_' + containerEl.containerId );
                        jQ( this ).attr( 'data-ref', 'grp_' + containerEl.containerId + '_' + containerEl.itemIndex );
                        jQ( this ).css( 'cursor', 'pointer' );
                        jQ( this ).on( 'click', containerEl.handleGalleryClick ); // Use .on for event binding
                        containerEl.itemIndex++;
                    }
                } );

                // Calculate how many items can be fully visible
                containerEl.visibleItemsCount = Math.ceil( containerEl.viewportWidth / containerEl.listItems[0].clientWidth );
                containerEl.visibleItemsRatio = ( containerEl.viewportWidth / containerEl.listItems[0].clientWidth );

                if ( containerEl.options.enableLogging ) {
                    console.log( 'Full visible items:', containerEl.visibleItemsCount );
                    console.log( 'Partial visible items ratio:', containerEl.visibleItemsRatio );
                }

                // If height synchronization is enabled, set container height to max item height
                if ( containerEl.options.syncHeight ) {
                    if ( options.enableLogging ) {
                        console.log( 'Max item height:', containerEl.maxItemHeight );
                    }
                    jQ( containerEl ).height( containerEl.maxItemHeight );
                }
            };

            /**
             *  Displays a modal/overlay window.
             *  @param {object} modalConfig - Configuration for the modal.
             *  @param {string} contentHtml - HTML content to display inside the modal.
             *  @param {function} [onOpenCallback] - Callback function to execute after modal opens.
             */
            containerEl.showModal = function( modalConfig, contentHtml, onOpenCallback ) {
                var currentModalOpts = jQ.extend( {
                    width: 'auto',
                    height: 'auto',
                    closable: true,
                    mode: false,
                    customStyle: '',
                    itemRef: false
                }, modalConfig );

                var closeBtnHtml = '';
                var nextBtnHtml = '';
                var prevBtnHtml = '';

                // Generate navigation buttons for gallery mode
                if ( currentModalOpts.mode == 'gallary' ) {
                    nextBtnHtml = '<div id="LightBoxNextBtn" style="position:absolute;top:0;bottom:0;right:-25px;background: url(\'assets/img/rotator-forward.png\') right center no-repeat; width:75px;cursor:pointer;" data-ref="' + currentModalOpts.itemRef + '"></div>';
                    prevBtnHtml = '<div id="LightBoxPrevBtn" style="position:absolute;top:0;bottom:0;left:-25px;background: url(\'assets/img/rotator-backward.png\') left center no-repeat; width:75px;cursor:pointer;" data-ref="' + currentModalOpts.itemRef + '"></div>'
                }

                // Generate close button if closable
                if ( currentModalOpts.closable ) {
                    closeBtnHtml = '<img id="LightBoxCloseBtn" style="position:absolute;top:-28px;right:-28px;z-index:1002;cursor:pointer;" src="assets/img/rotator-close.png">';
                }

                // Append main overlay if it doesn't exist
                if ( jQ( '#LightBoxContainer' ).html() == null ) {
                    jQ( 'body' ).append( '<div id="LightBoxContainer" style="position:fixed;top:0;bottom:0;left:0;right:0;background:#000;opacity:0.6;z-index:1000;"></div>' );
                }

                // Append or update modal content box
                if ( jQ( '#LightBoxContent' ).html() == null ) {
                    jQ( 'body' ).append( '<div id="LightBoxContent" style="display:none;position:fixed;top:50%;left:50%;background:#fff;z-index:1001;width:' + currentModalOpts.width + ';height:' + currentModalOpts.height + ';' + currentModalOpts.customStyle + '">' + contentHtml + '' + closeBtnHtml + '' + nextBtnHtml + '' + prevBtnHtml + '</div>' );
                    containerEl.bindModalEvents( currentModalOpts, onOpenCallback );
                } else {
                    jQ( '#LightBoxContent' ).css( {
                        width: currentModalOpts.width + 'px',
                        height: currentModalOpts.height + 'px'
                    } );
                    jQ( '#LightBoxContent' ).html( contentHtml + '' + closeBtnHtml + '' + nextBtnHtml + '' + prevBtnHtml );
                    containerEl.bindModalEvents( currentModalOpts, onOpenCallback );
                }
            };

            /**
             *  Binds events and positions the modal window.
             *  @param {object} modalOpts - Options for the modal.
             *  @param {function} [callback] - Callback function to execute after binding and showing.
             */
            containerEl.bindModalEvents = function( modalOpts, callback ) {
                // Center the modal box using negative margins
                jQ( '#LightBoxContent' ).css( {
                    'margin-top': '-' + ( jQ( '#LightBoxContent' ).outerHeight() / 2 ) + 'px',
                    'margin-left': '-' + ( jQ( '#LightBoxContent' ).outerWidth() / 2 ) + 'px'
                } );

                // Bind close events if modal is closable
                if ( modalOpts.closable ) {
                    jQ( '#LightBoxContainer' ).on( 'click', containerEl.closeModal );
                    jQ( '#LightBoxCloseBtn' ).on( 'click', containerEl.closeModal );
                }

                // Bind gallery navigation events
                if ( modalOpts.mode == 'gallary' ) {
                    jQ( '#LightBoxNextBtn' ).on( 'click', containerEl.showNextGalleryItem );
                    jQ( '#LightBoxPrevBtn' ).on( 'click', containerEl.showPreviousGalleryItem );
                }

                // Show the modal box with a slow animation or directly
                if ( jQ( '#LightBoxContent' ).is( ':hidden' ) ) {
                    jQ( '#LightBoxContent' ).show( 'slow', function() {
                        if ( callback ) {
                            callback();
                        }
                    } );
                } else {
                    if ( callback ) {
                        callback();
                    }
                }
            };

            /**
             *  Closes and removes the modal and its overlay.
             */
            containerEl.closeModal = function() {
                jQ( '#LightBoxContainer' ).remove();
                jQ( '#LightBoxContent' ).remove();
            };

            /**
             *  Handler for clicking a gallery item.
             *  Extracts image source and item reference to load the full image.
             */
            containerEl.handleGalleryClick = function() {
                var imageSrc = jQ( 'img', jQ( this ) ).attr( 'data-image-full' ), // Changed 'rel' to 'data-image-full' for image source
                    itemReference = jQ( this ).attr( 'data-ref' );
                containerEl.loadGalleryImage( itemReference, imageSrc );
            };

            /**
             *  Generates an array of all gallery item references.
             *  @returns {Array<string>} An array of data-ref attributes for gallery items.
             */
            containerEl.getGalleryItemRefs = function() {
                var references = [];
                jQ( '.grp_' + containerEl.containerId ).each( function() {
                    references.push( jQ( this ).attr( 'data-ref' ) );
                } );
                return references;
            };

            /**
             *  Navigates to the previous gallery item in the modal.
             */
            containerEl.showPreviousGalleryItem = function() {
                var itemReferences = containerEl.getGalleryItemRefs(),
                    currentItemRef = jQ( this ).attr( 'data-ref' );
                var currentIndex = itemReferences.indexOf( currentItemRef );

                // Loop around if at the beginning
                if ( currentIndex == 0 ) {
                    currentIndex = itemReferences.length - 1;
                } else {
                    currentIndex--;
                }

                // Find the image source for the new item
                var newImageSrc = jQ( 'img', jQ( "li[data-ref='" + itemReferences[currentIndex] + "']" ) ).attr( 'data-image-full' );
                containerEl.loadGalleryImage( itemReferences[currentIndex], newImageSrc );
            };

            /**
             *  Navigates to the next gallery item in the modal.
             */
            containerEl.showNextGalleryItem = function() {
                var itemReferences = containerEl.getGalleryItemRefs(),
                    currentItemRef = jQ( this ).attr( 'data-ref' );
                var currentIndex = itemReferences.indexOf( currentItemRef );

                // Loop around if at the end
                if ( itemReferences.length - 1 < currentIndex + 1 ) {
                    currentIndex = 0;
                } else {
                    currentIndex++;
                }

                // Find the image source for the new item
                var newImageSrc = jQ( 'img', jQ( "li[data-ref='" + itemReferences[currentIndex] + "']" ) ).attr( 'data-image-full' );
                containerEl.loadGalleryImage( itemReferences[currentIndex], newImageSrc );
            };

            /**
             *  Loads and displays a gallery image in the modal.
             *  @param {string} ref - The reference string of the gallery item.
             *  @param {string} src - The URL of the image to load.
             */
            containerEl.loadGalleryImage = function( ref, src ) {
                var loadingModalOpts = {
                    customStyle: 'padding:25px;',
                    closable: false
                };
                containerEl.showModal( loadingModalOpts, '<center>Please wait, loading image...</center>', function() {
                    var currentImage = new Image();
                    currentImage.onload = function() {
                        var imageModalOpts = {
                            width: this.width,
                            height: this.height,
                            mode: 'gallary',
                            itemRef: ref
                        };
                        containerEl.showModal( imageModalOpts, '<img src="' + this.src + '" alt="Gallery Image">' );
                    };
                    currentImage.src = src + '?' + ( new Date().getTime() ); // Cache busting
                } );
            };

            /**
             *  Moves the carousel forward to the next set of items.
             *  This function is bound to the forward control button.
             */
            containerEl.moveForward = function() {
                // Prevent animation if already animating or content is not ready
                if ( containerEl.options.isMoving || !containerEl.contentReady ) {
                    return false;
                }
                containerEl.options.isMoving = true;

                var firstVisibleLi = jQ( 'li:not(:hidden):first', containerEl.itemList );
                var allVisibleLis = jQ( 'li:not(:hidden)', containerEl.itemList );

                // Hide forward button if not looping and near the end of items
                if ( !containerEl.options.loopSlides && containerEl.options.hideControls && allVisibleLis.length <= ( containerEl.visibleItemsRatio + 1 ) ) {
                    containerEl.forwardControl.hide();
                }

                // If there are too few items to scroll or not looping, stop
                if ( allVisibleLis.length <= containerEl.visibleItemsRatio && !containerEl.options.loopSlides ) {
                    containerEl.options.isMoving = false;
                    return false;
                }

                // For looping carousel, move the first item to the end if necessary
                if ( allVisibleLis.length <= ( containerEl.visibleItemsRatio + 1 ) && containerEl.options.loopSlides ) {
                    jQ( 'li:first', containerEl.itemList ).appendTo( containerEl.itemList ).css( 'left', 0 ).show();
                }

                var itemFullWidth = jQ( firstVisibleLi ).outerWidth( true );

                // Animate the first visible item out
                jQ( firstVisibleLi ).animate( { left: '-' + itemFullWidth + 'px' }, containerEl.options.animationSpeed, function() {
                    jQ( this ).hide();
                    containerEl.options.isMoving = false;
                } );

                // Replicating the eval-based animation for subsequent items
                // Original: `var st = "$(el)"; st += ".next()"; eval(st+end);`
                // This relies on `el` being a variable in the current scope that `eval` can resolve.
                var evalSelectorString = "jQ(firstVisibleLi)";
                var animationCommandString = ".animate({left: '-' + itemFullWidth + 'px'}, containerEl.options.animationSpeed, function() { jQ(this).css('left','');});";
                for ( var i = 0; i < containerEl.visibleItemsCount; i++ ) {
                    if ( i > 0 ) {
                        evalSelectorString += ".next()";
                    }
                    eval( evalSelectorString + animationCommandString );
                }

                return false;
            };

            /**
             *  Moves the carousel backward to the previous set of items.
             *  This function is bound to the backward control button.
             */
            containerEl.moveBackward = function() {
                // Prevent animation if already animating or content is not ready
                if ( containerEl.options.isMoving || !containerEl.contentReady ) {
                    return false;
                }
                containerEl.options.isMoving = true;

                var lastHiddenLi = jQ( 'li:hidden:last', containerEl.itemList ),
                    firstCurrentlyVisibleLi = jQ( 'li:not(:hidden):first', containerEl.itemList );

                // If no hidden items and not looping, or hideControls is on, stop
                if ( jQ( 'li:hidden', containerEl.itemList ).length == 0 && !containerEl.options.hideControls && !containerEl.options.loopSlides ) {
                    containerEl.options.isMoving = false;
                    return false;
                }

                // If no hidden items but looping is enabled, move the last item to the front
                if ( jQ( 'li:hidden', containerEl.itemList ).length == 0 && containerEl.options.loopSlides ) {
                    var lastLiInList = jQ( 'li:last', containerEl.itemList );
                    var itemFullWidth = lastLiInList.outerWidth( true );
                    jQ( lastLiInList ).css( { left: '-' + itemFullWidth + 'px' } );
                    lastLiInList.insertBefore( jQ( 'li:first', containerEl.itemList ) );
                    lastHiddenLi = lastLiInList; // This item is now the one to animate in
                }

                var itemFullWidth = lastHiddenLi.outerWidth( true ); // Get width of the item being revealed
                lastHiddenLi.show();
                lastHiddenLi.animate( { left: '0px' }, 1000, function() { // Hardcoded 1000ms duration in original here
                    jQ( this ).css( 'left', '' );
                    containerEl.options.isMoving = false;
                } );

                // Replicating the eval-based animation for subsequent items
                // Original: `var st = "linhf"; if(i != 0) st += ".next()"; eval(st+end);`
                // `linhf` is a variable name, so `eval` will resolve it.
                var evalSelectorString = "firstCurrentlyVisibleLi";
                var animationCommandString = ".css('left','-' + itemFullWidth + 'px').animate({left: '0px'}, 1000, function() {jQ(this).css('left','');});"; // Hardcoded 1000ms duration in original here

                for ( var i = 0; i < containerEl.visibleItemsCount; i++ ) {
                    if ( i != 0 ) {
                        evalSelectorString += ".next()";
                    }
                    eval( evalSelectorString + animationCommandString );
                }

                // Adjust button visibility after animation
                if ( jQ( 'li:hidden', containerEl.itemList ).length == 0 && containerEl.options.hideControls && !containerEl.options.loopSlides ) {
                    containerEl.backwardControl.hide();
                }
                if ( !containerEl.options.loopSlides && containerEl.options.hideControls ) {
                    containerEl.forwardControl.show();
                }

                return false;
            };

            // Bind click events to the navigation controls
            containerEl.forwardControl.on( 'click', containerEl.moveForward );
            containerEl.backwardControl.on( 'click', containerEl.moveBackward );

            // Ensure layout setup runs after all assets (images, etc.) are loaded
            jQ( window ).on( 'load', function() { containerEl.prepareLayout(); } );
        };

        // Apply the initialization function to each selected element
        return this.each( initializeCarousel );
    };

} )( jQuery );