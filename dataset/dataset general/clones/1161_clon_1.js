/*
 * BetterZoom (c) 2013 Steve Sobel / honestbleeps
 *
 * BetterZoom is a HoverZoom replacement extension built with BabelExt.
 * It's designed to be a trustworthy alternative, given past issues
 * with HoverZoom.
 *
 * LICENSE INFORMATION:
 * I am currently evaluating suitable licenses for this software.
 * Your suggestions are highly welcome, as I aim to finalize a license soon.
 * My primary objective for the chosen license is to prevent
 * unauthorized repackaging of this code. I want to ensure that
 * no one can simply take this software, embed malicious tracking,
 * malware, or any other undesirable elements, without me retaining
 * the legal right to demand the removal of their modified software
 * due to a license violation.
 *
 */

/*
 *
 * Current Development To-Dos:
 *
 * - Implement comprehensive album support. This includes displaying multiple images
 *   within a single hover event and providing navigation controls.
 *
 * - Enhance the 'header' section of the zoom overlay. This could include:
 *   - Zoom in/out buttons (+ / -) for finer control over image size.
 *   - Navigation buttons (<< / >>) for browsing images within an album,
 *     once album support is fully integrated.
 *   - A "save" button to easily download the currently viewed image.
 *   - Introduce keyboard shortcuts for actions like album navigation,
 *     zooming, and opening images in a new tab.
 *   - Consider a 'fullscreen' button that maximizes the image, temporarily
 *     disables mouseout/mouseover events, and creates a lightbox effect.
 *
 * - Expand site compatibility by adding support for more sites that
 *   require API calls to retrieve media. Code from the Reddit Enhancement Suite's
 *   'viewImages' module (https://github.com/honestbleeps/Reddit-Enhancement-Suite/)
 *   could be adapted for this purpose.
 *
 * - Review and optimize the `getOptimalImagePosition` method. There's likely
 *   room for improvement in its logic for positioning and sizing images.
 *
 * - Develop a user preferences/settings interface. Given the need for
 *   cross-browser compatibility, this will likely leverage `BabelExt.storage`
 *   instead of browser-specific APIs. This might involve creating a settings
 *   console similar to the one found in RES.
 *
 * - Add support for VIDEO and AUDIO tags. The foundational structure for this
 *   is already present, so implementation should be relatively straightforward.
 *
 *
 */

var BZ, BetterZoom;

BZ = BetterZoom = {

  addModule: function ( moduleID, defineModule ) {
    // TODO: It might be beneficial to provide a more robust base object
    // for modules. Currently, the primary requirement is the `checkLinkForMedia`
    // function, which must return a promise.
    var base = {
      moduleID: moduleID,
      moduleName: moduleID
    };

    var module = defineModule.call(base, base, moduleID) || base;
    BZ.siteModules[moduleID] = module;

    // If a module specifies additional domains, map them for easy lookup.
    if ( module.additionalDomains ) {
      module.additionalDomains.forEach( function ( domain ) {
        BZ.domainToSiteModule[domain] = moduleID;
      } );
    }

  } ,

  screenPadding: 20, // Padding around the screen edges for media display.

  // Variables related to album functionality.
  currentAlbum: [ ] ,
  currentAlbumIndex: 0 ,
  showingAlbum: false , // Flag to enable/disable album navigation shortcuts.
  albumBookmarks: [ ] ,

  init: function ( ) {

    this.container = $( '<div id="BetterZoom-container"></div>' );
    // The callout is a triangular element that visually connects to the image container.
    this.callout = $( '<div id="BetterZoom-callout"></div>' );

    // Header elements for the overlay.
    this.header = $( '<div id="BetterZoom-header"></div>' );
    this.title = $( '<span id="BetterZoom-title">BetterZoom</div>' );
    this.toolbar = $( '<div id="BetterZoom-toolbar"></div>' );

    this.albumInfo = $( '<span id="BetterZoom-albumInfo"></div>' );
    this.closeButton =
      $( '<div id="BetterZoom-close">&times;</div>' )
        .click( BZ.hideMedia );

    this.header.append( this.title, this.toolbar, this.albumInfo, this.closeButton );

    this.mediaContainer = $( '<div id="BetterZoom-media">' );
    this.loader = $( '<div id="BetterZoom-loader"></div>' );

    $( this.container )
      .append( this.header, this.mediaContainer )
      .mouseleave( BZ.handleMouseOut )
      .mouseover( BZ.cancelHideTimer );

    this.img = new Image ( );
    $( this.img )
      .on( 'load', BZ.handleImageLoad );

    this.video = $( '<video>' );
    this.audio = $( '<audio>' );

    // this.getMediaLinks(); // This line appears to be commented out in the original.
    $( document.body )
      .on( 'mouseover', 'a, img', { }, BZ.handleMouseOver )
      .on( 'mouseout', 'a, img', { }, BZ.handleMouseOut )
      .append( this.container, this.callout );

    $( window ).on( 'mousemove', 'body', BZ.setMouseXY );
  } ,

  setMouseXY: function ( e ) {
    e = e || window.event;
    var cursor = {
      x: 0,
      y: 0
    };
    if ( e.pageX || e.pageY ) {
      cursor.x = e.pageX;
      cursor.y = e.pageY;
    } else {
      cursor.x = e.clientX +
        ( document.documentElement.scrollLeft ||
        document.body.scrollLeft ) -
        document.documentElement.clientLeft;
      cursor.y = e.clientY +
        ( document.documentElement.scrollTop ||
        document.body.scrollTop ) -
        document.documentElement.clientTop;
    }
    BZ.mouse = {
      x: cursor.x,
      y: cursor.y
    };
  } ,

  /**
   * Retrieves media links from a specified DOM element.
   * It first gets all links, then filters them to find those
   * that potentially contain media.
   *
   * @param  {DOM element} ele - The element to scan. If not provided, `document.body` is used.
   * @return {Array} - An array of DOM elements identified as media links.
   */
  getMediaLinks: function ( ele ) {
    ele = ele || document.body;
    var allLinks = this.getLinks( ele ) ,
        mediaLinks = [ ];

    // Iterate through the list to identify potential media links.
    for ( var i = 0 , len = allLinks.length ; i < len ; i++ ) {
      if ( this.checkLinkForMedia( allLinks[i] ) ) {
        mediaLinks.push( allLinks[i] );
      }
    }
  } ,

  /**
   * Fetches all anchor (`<a>`) elements within a given DOM element.
   *
   * @param  {DOM element} ele - The element to search within. Defaults to `document.body`.
   * @return {Array} - An array of DOM anchor elements.
   */
  getLinks: function ( ele ) {
    ele = ele || document.body;

    return $( ele ).find( 'a' );
  } ,

  handleMouseOver: function ( event ) {
    BZ.showTimer = setTimeout( function ( ) {
      BZ.processLink( event.target );
    } , 500 );
  } ,

  processLink: function ( ele ) {
    // Adjust target if it's an inner element and the parent has the actual target.
    if ( ele.target === undefined && ele.parentNode !== undefined && ele.parentNode.target !== undefined ) {
      ele = ele.parentNode;
    }
    BZ.checkLinkForGenericMedia( ele )
      .then( function ( mediaData ) {
        return BZ.checkLinkForMedia( mediaData );
      } ).then( function ( mediaData ) {
        return BZ.showMedia( mediaData );
      } );
  } ,

  handleMouseOverError: function ( error ) {
    console.log( error );
  } ,

  handleMouseOut: function ( event ) {
    if ( BZ.lightBoxActive ) {
      return; // Do not hide if lightbox is active.
    }
    if ( BZ.showTimer ) {
      clearTimeout( BZ.showTimer );
    }
    BZ.hideTimer = setTimeout( BZ.hideMedia, 500 );
  } ,

  handleImageLoad: function ( event ) {
    var w = ( event ) ? event.target.width : null ,
        h = ( event ) ? event.target.height : null ,
        pos = BZ.getOptimalImagePosition( w, h );

    if ( BZ.img.src ) {
        // Add the image source to browser history. The callback is required but can be empty.
        BabelExt.history.add( BZ.img.src, function ( ) { } );
    }

    $( BZ.container )
      .css(
        pos.position
      )
      .css( {
        height: 'auto' ,
        width: 'auto'
      } )
      .show( );

    BZ.showImageElement( );
  } ,

  showImageElement: function ( ) {
    $( BZ.loader ).hide( );
    $( BZ.img ).show( );
  } ,

  cancelHideTimer: function ( ) {
    if ( BZ.hideTimer ) {
      clearTimeout( BZ.hideTimer );
    }
  } ,

  cancelShowTimer: function ( ) {
    if ( BZ.showTimer ) {
      clearTimeout( BZ.showTimer );
    }
  } ,

  /**
   * Calculates the maximum width and height an image should occupy,
   * considering available screen space relative to the mouse cursor,
   * and determines the optimal position for the image container.
   *
   * @param  {number} width  - The natural width of the media.
   * @param  {number} height - The natural height of the media.
   *
   * @return {Object} - An object containing `maxWidth` and `maxHeight`
   *                    (in integer values) and the `position` object
   *                    for CSS styling.
   */
  getOptimalImagePosition: function ( width, height ) {
    var maxWidth, maxHeight,
        top, left, right, rel,
        offsetX = 30, // Horizontal offset from the mouse, accounting for the callout.
        // offsetY = 0, // Vertical offset from the mouse. Not currently used.
        headerHeight = 60,
        screenWidth = $( window ).width( ),
        screenHeight = $( window ).height( ),
        screenTop = $( window ).scrollTop( ),
        // screenBottom = screenTop + screenHeight, // Not currently used.
        // screenCenterY = $(window).scrollTop() + (screenHeight / 2), // Not currently used.
        screenCenterX = $( window ).scrollLeft( ) + ( screenWidth / 2 );

    if ( BZ.mouse.x < screenCenterX ) {
      // If the mouse is on the left side of the screen's center:
      // - Display the image to the right of the mouse.
      // - `maxWidth` is calculated from mouse position to the right edge,
      //   minus offsets and screen padding.
      rel = 'right';
      left = BZ.mouse.x + offsetX;
      right = null;
      maxWidth = screenWidth - BZ.mouse.x - offsetX - BZ.screenPadding;
    } else {
      // If the mouse is on the right side of the screen's center:
      // - Display the image to the left of the mouse.
      // - `maxWidth` is calculated from the left edge to the mouse position,
      //   minus offsets and screen padding.
      rel = 'left';
      left = null;
      right = ( screenWidth - BZ.mouse.x ) + offsetX - BZ.screenPadding;
      maxWidth = BZ.mouse.x - offsetX - BZ.screenPadding;
    }

    top = screenTop + BZ.screenPadding;

    // Adjust 'top' if the image's bottom is not aligned with the callout.
    // This ensures the callout points correctly to the image.
    if ( top + BZ.img.height < BZ.mouse.y ) {
      top = BZ.mouse.y - BZ.img.height;
    }

    maxHeight = screenHeight - BZ.screenPadding - headerHeight;

    return {
      relativeToCenter: rel ,
      position: {
        top: top ,
        left: left ,
        right: right
      } ,
      size: {
        maxWidth: maxWidth ,
        maxHeight: maxHeight
      }
    };
  } ,

  showMedia: function ( mediaData ) {
    // If no media data is returned, exit.
    if ( !mediaData.type ) {
      return;
    }
    BZ.showingAlbum = false;
    BZ.albumInfo.text( "" ); // Clear album info.

    $( window ).on( 'keydown', BZ.handleKeyPress ); // Start listening for keyboard events.
    var screenTop = $( window ).scrollTop( ),
        optimalPos = BZ.getOptimalImagePosition( ),
        calloutPos;

    // Ensure any pending hide timer is cleared.
    this.cancelHideTimer( );

    // Position the callout arrow near the mouse, pointing in the correct direction.
    calloutPos = {
      top: Math.max( BZ.mouse.y, screenTop + BZ.screenPadding )
    };

    if ( optimalPos.relativeToCenter === 'right' ) {
      // Add a small padding to prevent accidental clicks on the image itself.
      calloutPos.left = BZ.mouse.x + 10;
      calloutPos.right = null;
    } else {
      // Add padding for clicks on the left side.
      calloutPos.left = null;
      calloutPos.right = $( window ).width( ) - BZ.mouse.x - 10;
    }

    $( this.callout )
      .css( calloutPos )
      .show( )
      .attr( 'class', optimalPos.relativeToCenter ); // Set class for CSS styling (e.g., arrow direction).

    if ( mediaData.type === 'img' ) {
      BZ.populateImage( optimalPos, mediaData.src, mediaData.title );

    } else if ( mediaData.type === 'album' ) {
      // The expected format for an album is:
      // {
      //    images: [
      //      {
      //        src: 'http://some.directimage.url/foo.jpg',
      //        title: 'some title text here.'
      //      },
      //      {
      //        src: 'http://some.directimage.url/foo.jpg',
      //        title: 'another title here.'
      //      },
      //      ... (more image objects)
      //    ]
      // }

      BZ.showingAlbum = true; // Enable left/right navigation shortcuts.
      BZ.currentAlbum = mediaData.images;
      var firstImage = mediaData.images[0].src; // Use the first image's URL as a unique album identifier.

      BZ.currentAlbumIndex = BZ.albumBookmarks[firstImage] || 0; // Retrieve saved index, or default to 0.
      BZ.populateImage( optimalPos, mediaData.images[BZ.currentAlbumIndex].src, mediaData.images[BZ.currentAlbumIndex].title );
      BZ.albumInfo.text( ( BZ.currentAlbumIndex + 1 ) + "/" + BZ.currentAlbum.length ); // Update album progress text in the toolbar.
    }
    return true;
  } ,

  // 'val' specifies the offset for changing the album index: '1' for next, '-1' for previous.
  changeAlbumImage: function ( val ) {
    var currentIndex = ( BZ.currentAlbumIndex + val ) % BZ.currentAlbum.length , // Loop from last to first.
        length = BZ.currentAlbum.length;
    if ( currentIndex < 0 ) {
      currentIndex = length - 1; // Loop from first to last.
    }

    BZ.albumInfo.text( ( currentIndex + 1 ) + "/" + length ); // Update album progress text.

    BZ.albumBookmarks[BZ.currentAlbum[0].src] = BZ.currentAlbumIndex = currentIndex; // Update bookmark and current index.
    var optimalPos = BZ.getOptimalImagePosition( );
    BZ.populateImage( optimalPos, BZ.currentAlbum[currentIndex].src, BZ.currentAlbum[currentIndex].title );
  } ,

  populateImage: function ( optimalPos, src, title ) {
    // If an image is available:
    // 1) Clear `mediaContainer` and insert the loader and image elements.
    // 2) Display the loader.
    // 3) Update the `src` attribute of our `BetterZoom` image to the new URL.
    // 4) Upon successful load, determine and apply optimal screen position and size.
    //    (This is handled by the 'load' event listener on the image.)

    // Clear existing content and append loader and image.
    $( BZ.mediaContainer )
      .empty( )
      .append( BZ.loader )
      .append( BZ.img );

    // Hide the image and set its new source.
    $( BZ.img )
      .hide( )
      .attr( 'src', src );

    $( BZ.title ).text( title || 'BetterZoom' ); // Set the title, defaulting if none provided.

    // Apply the calculated optimal size to the image.
    $( BZ.img ).css( optimalPos.size );

    // Show the container, which initially displays the loader.
    $( BZ.container )
      .css(
        optimalPos.position
      )
      .show( );

    // If the image is already cached (i.e., has a width), the 'onload' event
    // might not fire. In this case, manually trigger `handleImageLoad`.
    if ( BZ.img.width > 0 ) {
      BZ.handleImageLoad( );
    } else {
      // Only show the loader if a new image actually needs to be loaded.
      $( BZ.loader )
        .show( );
    }
  } ,

  hideMedia: function ( ) {
    // Hide both the main container and the callout element.
    $( BZ.container ).hide( );
    $( BZ.callout ).hide( );

    // Stop listening for keyboard events once the popup is hidden.
    $( window ).off( 'keydown', BZ.handleKeyPress );
    BZ.lightBoxActive = false;
  } ,

  lightBox: function ( ) {
    BZ.lightBoxActive = true;
    $( BZ.callout ).hide( ); // Hide callout in lightbox mode.
    $( BZ.container ).css( {
      top: BZ.screenPadding + $( window ).scrollTop( ) ,
      left: BZ.screenPadding ,
      height: $( window ).height( ) - ( 2 * BZ.screenPadding ) ,
      width: $( window ).width( ) - ( 2 * BZ.screenPadding )
    } );
    $( BZ.img ).css( {
      maxHeight: $( window ).height( ) - ( 2 * BZ.screenPadding ) - $( BZ.header ).height( ) ,
      maxWidth: $( window ).width( ) - ( 2 * BZ.screenPadding )
    } );
  } ,

  handleKeyPress: function ( e ) {
    console.log( e.keyCode ); // Log the key code for debugging.
    // Handle different key presses.
    switch ( e.keyCode ) {
      case 27: // Escape key.
        BZ.hideMedia( );
        break;
      case 37: // Left arrow key.
        if ( BZ.showingAlbum ) {
          BZ.changeAlbumImage( -1 );
        }
        break;
      case 39: // Right arrow key.
        if ( BZ.showingAlbum ) {
          BZ.changeAlbumImage( 1 );
        }
        break;
      case 90: // 'Z' key.
        BZ.lightBox( );
        break;
      case 84: // 'T' key.
        BabelExt.tabs.create( BZ.img.src, false ); // Open image in a new tab.
        break;
      default:
        break;
    }
  } ,

  /**
   * Checks a given link for generic media content.
   * This typically involves checking if the URL ends with a common media file extension.
   *
   * @param  {DOM element} link - The anchor element to examine.
   * @return {Promise} - A promise that resolves with `mediaData`.
   */
  checkLinkForGenericMedia: function ( link ) {
    var promise = new RSVP.Promise( function ( resolve, reject ) {

      // Always perform a static image check first.
      var mediaData = BZ.staticImage.checkLink( link );
      resolve( mediaData ); // Resolve with the found media data.
    } );
    return promise;
  } ,

  checkLinkForMedia: function ( mediaData ) {
    var promise = new RSVP.Promise( function ( resolve, reject ) {
      // Initially, perform a static image check.
      var link = mediaData.link ,
          siteModule;

      mediaData = BZ.staticImage.checkLink( link );

      // Determine which site-specific module to use based on the link's hostname.
      siteModule = BZ.getSiteModule( link.hostname );

      // If a site-specific module is found, its `checkLinkForMedia` function
      // takes precedence over the generic check. This is crucial for sites
      // that might use `.jpg` extensions for HTML pages, for example.
      if ( siteModule ) {
        siteModule.checkLinkForMedia( mediaData )
          .then( function ( mediaData ) {
            resolve( mediaData ); // Resolve with data from the site module.
          } );
      } else {
        // If no specific site module is found, simply return the data
        // obtained from the generic check.
        resolve( mediaData );
      }
    } );
    return promise;
  }