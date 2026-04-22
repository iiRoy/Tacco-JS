// This is a Type I clone generated from the original fancyBox source code.
// No functional changes have been made; only whitespace and comments differ.

;
( function ( window, document, $, undefined ) {

  "use strict"
  ; // Strict mode enabled for this module.

  // Core variables for frequently used jQuery objects and fancyBox instance.
  var H = $ ( "html" )
    ;
  var W = $ ( window )
    ;
  var D = $ ( document )
    ;
  var F = $.fancybox = function ( ) {
    // Call the open method on the fancyBox instance.
    F.open.apply ( this, arguments )
    ;
  }
  ;

  // Browser detection for IE.
  var IE = navigator.userAgent.match ( /msie/i )
    ;

  // Internal state variables.
  var didUpdate = null
    ;
  var isTouch = document.createTouch !== undefined
    ;

  // Helper function definitions.
  var isQuery = function ( obj ) {
    // Checks if the object is a jQuery instance.
    return obj && obj.hasOwnProperty && obj instanceof $
    ;
  }
  ;

  var isString = function ( str ) {
    // Verifies if the input is a string type.
    return str && $.type ( str ) === "string"
    ;
  }
  ;

  var isPercentage = function ( str ) {
    // Determines if a string represents a percentage value.
    return isString ( str ) && str.indexOf ( '%' ) > 0
    ;
  }
  ;

  var isScrollable = function ( el ) {
    // Checks if an element is scrollable.
    return (
      el &&
      ! ( el.style.overflow && el.style.overflow === 'hidden' ) &&
      (
        ( el.clientWidth && el.scrollWidth > el.clientWidth ) ||
        ( el.clientHeight && el.scrollHeight > el.clientHeight )
      )
    )
    ;
  }
  ;

  var getScalar = function ( orig, dim ) {
    // Parses a value, potentially converting percentages based on a dimension.
    var value = parseInt ( orig, 10 ) || 0
      ;

    if ( dim && isPercentage ( orig ) ) {
      // Calculate percentage based on viewport dimension.
      value = F.getViewport ( ) [ dim ] / 100 * value
      ;
    }

    return Math.ceil ( value )
    ;
  }
  ;

  var getValue = function ( value, dim ) {
    // Returns a CSS pixel value.
    return getScalar ( value, dim ) + 'px'
    ;
  }
  ;

  // Extend the main fancyBox object with properties and methods.
  $.extend ( F, {

    // Current version string.
    version : '2.1.5',

    // Default configuration options.
    defaults : {
      padding : 15, // Inner padding.
      margin  : 20, // Outer margin.

      width     : 800, // Default width for content.
      height    : 600, // Default height for content.
      minWidth  : 100, // Minimum width allowed.
      minHeight : 100, // Minimum height allowed.
      maxWidth  : 9999, // Maximum width allowed.
      maxHeight : 9999, // Maximum height allowed.
      pixelRatio: 1, // Set to 2 for retina display support.

      autoSize   : true, // Automatically adjust size.
      autoHeight : false, // Automatically adjust height.
      autoWidth  : false, // Automatically adjust width.

      autoResize  : true, // Auto resize on window change.
      autoCenter  : !isTouch, // Center content automatically.
      fitToView   : true, // Fit content within viewport.
      aspectRatio : false, // Maintain aspect ratio.
      topRatio    : 0.5, // Top position ratio.
      leftRatio   : 0.5, // Left position ratio.

      scrolling : 'auto', // 'auto', 'yes' or 'no' for content scrolling.
      wrapCSS   : '', // Custom CSS class for the wrapper.

      arrows     : true, // Show navigation arrows.
      closeBtn   : true, // Show close button.
      closeClick : false, // Close on click outside.
      nextClick  : false, // Navigate to next on content click.
      mouseWheel : true, // Enable mouse wheel navigation.
      autoPlay   : false, // Start slideshow automatically.
      playSpeed  : 3000, // Slideshow play speed in ms.
      preload    : 3, // Number of items to preload.
      modal      : false, // Modal mode (no closing on overlay click).
      loop       : true, // Loop through gallery items.

      ajax  : {
        dataType : 'html', // Data type for AJAX requests.
        headers  : { 'X-fancyBox': true } // Custom headers for AJAX.
      },

      iframe : {
        scrolling : 'auto', // Scrolling behavior for iframes.
        preload   : true // Preload iframe content.
      },

      swf : {
        wmode: 'transparent', // Window mode for SWF.
        allowfullscreen   : 'true', // Allow fullscreen for SWF.
        allowscriptaccess : 'always' // Allow script access for SWF.
      },

      keys  : {
        next : {
          13 : 'left', // enter key for next.
          34 : 'up',   // page down key for next.
          39 : 'left', // right arrow key for next.
          40 : 'up'    // down arrow key for next.
        },
        prev : {
          8  : 'right',  // backspace key for previous.
          33 : 'down',   // page up key for previous.
          37 : 'right',  // left arrow key for previous.
          38 : 'down'    // up arrow key for previous.
        },
        close  : [27], // escape key to close.
        play   : [32], // space bar to start/stop slideshow.
        toggle : [70]  // letter "f" to toggle fullscreen.
      },

      direction : {
        next : 'left', // Direction for next item animation.
        prev : 'right' // Direction for previous item animation.
      },

      scrollOutside  : true, // Allow scrolling of the page content when fancyBox is open.

      // Override some properties for individual items.
      index   : 0, // Current index in the group.
      type    : null, // Content type (image, ajax, iframe, etc.).
      href    : null, // URL or selector for content.
      content : null, // Direct content to display.
      title   : null, // Title for the content.

      // HTML templates used for various fancyBox elements.
      tpl : {
        wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
        image    : '<img class="fancybox-image" src="{href}" alt="" />',
        iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
        error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
        closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
        next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
        prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>',
        loading  : '<div id="fancybox-loading"><div></div></div>'
      },

      // Properties for each animation type.
      // Opening fancyBox animation settings.
      openEffect  : 'fade', // 'elastic', 'fade' or 'none'.
      openSpeed   : 250, // Speed of opening animation.
      openEasing  : 'swing', // Easing function for opening.
      openOpacity : true, // Animate opacity during opening.
      openMethod  : 'zoomIn', // Method for opening animation.

      // Closing fancyBox animation settings.
      closeEffect  : 'fade', // 'elastic', 'fade' or 'none'.
      closeSpeed   : 250, // Speed of closing animation.
      closeEasing  : 'swing', // Easing function for closing.
      closeOpacity : true, // Animate opacity during closing.
      closeMethod  : 'zoomOut', // Method for closing animation.

      // Changing to next gallery item animation settings.
      nextEffect : 'elastic', // 'elastic', 'fade' or 'none'.
      nextSpeed  : 250, // Speed of next item animation.
      nextEasing : 'swing', // Easing function for next item.
      nextMethod : 'changeIn', // Method for next item animation.

      // Changing to previous gallery item animation settings.
      prevEffect : 'elastic', // 'elastic', 'fade' or 'none'.
      prevSpeed  : 250, // Speed of previous item animation.
      prevEasing : 'swing', // Easing function for previous item.
      prevMethod : 'changeOut', // Method for previous item animation.

      // Enable default helpers.
      helpers : {
        overlay : true, // Enable overlay helper.
        title   : true // Enable title helper.
      },

      // Callbacks for various stages of fancyBox lifecycle.
      onCancel     : $.noop, // Callback when canceled.
      beforeLoad   : $.noop, // Callback before content loads.
      afterLoad    : $.noop, // Callback after content loads.
      beforeShow   : $.noop, // Callback before showing item.
      afterShow    : $.noop, // Callback after item is shown.
      beforeChange : $.noop, // Callback before changing gallery item.
      beforeClose  : $.noop, // Callback before closing.
      afterClose   : $.noop // Callback after closing.
    }, // End of defaults object.

    // Current state variables for fancyBox.
    group    : {}, // The currently selected group of items.
    opts     : {}, // Options for the current group.
    previous : null,  // Reference to the previously loaded element.
    coming   : null,  // Reference to the element currently being loaded.
    current  : null,  // Reference to the currently displayed element.
    isActive : false, // Flag indicating if fancyBox is active.
    isOpen   : false, // Flag indicating if fancyBox is currently open.
    isOpened : false, // Flag indicating if fancyBox has been fully opened at least once.

    wrap  : null, // jQuery object for the main wrapper.
    skin  : null, // jQuery object for the skin element.
    outer : null, // jQuery object for the outer element.
    inner : null, // jQuery object for the inner content element.

    player : {
      timer    : null, // Timer for slideshow.
      isActive : false // Flag for player activity.
    },

    // Loaders for content.
    ajaxLoad   : null, // AJAX request object.
    imgPreload : null, // Image preload object.

    // Collections for transitions and helpers.
    transitions : {}, // Registered transition methods.
    helpers     : {}, // Registered helper modules.

    /*
     *	Static methods of the fancyBox instance.
     */
    open : function ( group, opts ) {
      // Check if a group is provided.
      if ( ! group ) {
        return
        ;
      }

      // Ensure options is a plain object.
      if ( ! $.isPlainObject ( opts ) ) {
        opts = {}
        ;
      }

      // Close any existing fancyBox instance if active.
      if ( false === F.close ( true ) ) {
        return
        ;
      }

      // Normalize the group into an array of objects.
      if ( ! $.isArray ( group ) ) {
        group = isQuery ( group ) ? $ ( group ) .get ( ) : [ group ]
        ;
      }

      // Iterate through each element in the group to process and set content type.
      $.each ( group, function ( i, element ) {
        var obj = {}
          , href
          , title
          , content
          , type
          , rez
          , hrefParts
          , selector
          ;

        if ( $.type ( element ) === "object" ) {
          // If it's a DOM element, wrap it in jQuery.
          if ( element.nodeType ) {
            element = $ ( element )
            ;
          }

          // If it's a jQuery object.
          if ( isQuery ( element ) ) {
            obj = {
              href    : element.data ( 'fancybox-href' ) || element.attr ( 'href' ),
              title   : $ ( '<div/>' ) .text ( element.data ( 'fancybox-title' ) || element.attr ( 'title' ) || '' ) .html ( ),
              isDom   : true,
              element : element
            }
            ;

            // If jQuery metadata plugin is available, extend options.
            if ( $.metadata ) {
              $.extend ( true, obj, element.metadata ( ) )
              ;
            }

          } else {
            // It's already a plain object.
            obj = element
            ;
          }
        }

        // Determine href, title, content, and type.
        href  = opts.href  || obj.href || ( isString ( element ) ? element : null )
        ;
        title = opts.title !== undefined ? opts.title : obj.title || ''
        ;

        content = opts.content || obj.content
        ;
        type    = content ? 'html' : ( opts.type  || obj.type )
        ;

        // Try to guess type from data attributes or class names if not explicitly set.
        if ( ! type && obj.isDom ) {
          type = element.data ( 'fancybox-type' )
          ;

          if ( ! type ) {
            rez  = element.prop ( 'class' ) .match ( /fancybox\.(\w+)/ )
            ;
            type = rez ? rez [ 1 ] : null
            ;
          }
        }

        // Process href to determine content type or extract selector.
        if ( isString ( href ) ) {
          // Guess the content type based on href.
          if ( ! type ) {
            if ( F.isImage ( href ) ) {
              type = 'image'
              ;

            } else if ( F.isSWF ( href ) ) {
              type = 'swf'
              ;

            } else if ( href.charAt ( 0 ) === '#' ) {
              type = 'inline'
              ;

            } else if ( isString ( element ) ) {
              type    = 'html'
              ;
              content = element
              ;
            }
          }

          // For 'ajax' type, split URL into source and content selector.
          if ( type === 'ajax' ) {
            hrefParts = href.split ( /\s+/, 2 )
            ;
            href      = hrefParts.shift ( )
            ;
            selector  = hrefParts.shift ( )
            ;
          }
        }

        // Set content based on type if not already defined.
        if ( ! content ) {
          if ( type === 'inline' ) {
            if ( href ) {
              content = $ ( isString ( href ) ? href.replace ( /.*(?=#[^\s]+$)/, '' ) : href )
              ; // Strip for IE7 compatibility.

            } else if ( obj.isDom ) {
              content = element
              ;
            }

          } else if ( type === 'html' ) {
            content = href
            ;

          } else if ( ! type && ! href && obj.isDom ) {
            type    = 'inline'
            ;
            content = element
            ;
          }
        }

        // Extend the current object with processed properties.
        $.extend ( obj, {
          href     : href,
          type     : type,
          content  : content,
          title    : title,
          selector : selector
        } )
        ;

        group [ i ] = obj
        ;
      } )
      ; // End of $.each loop.

      // Merge defaults with user-provided options.
      F.opts = $.extend ( true, {}, F.defaults, opts )
      ;

      // Handle keys option specifically (not recursive merge).
      if ( opts.keys !== undefined ) {
        F.opts.keys = opts.keys ? $.extend ( {}, F.defaults.keys, opts.keys ) : false
        ;
      }

      F.group = group
      ; // Store the processed group.

      // Start the fancyBox with the specified index.
      return F._start ( F.opts.index )
      ;
    }, // End of F.open method.

    // Method to cancel current loading or opening operation.
    cancel : function ( ) {
      var coming = F.coming
        ;

      // Trigger 'onCancel' callback.
      if ( coming && false === F.trigger ( 'onCancel' ) ) {
        return
        ;
      }

      // Hide any loading indicators.
      F.hideLoading ( )
      ;

      if ( ! coming ) {
        return
        ;
      }

      // Abort AJAX request if active.
      if ( F.ajaxLoad ) {
        F.ajaxLoad.abort ( )
        ;
      }

      F.ajaxLoad = null
      ;

      // Clear image preload handlers.
      if ( F.imgPreload ) {
        F.imgPreload.onload = F.imgPreload.onerror = null
        ;
      }

      // Clean up the coming wrapper if it exists.
      if ( coming.wrap ) {
        coming.wrap.stop ( true, true ) .trigger ( 'onReset' ) .remove ( )
        ;
      }

      F.coming = null
      ; // Clear the coming item.

      // If the first item was canceled, perform full cleanup.
      if ( ! F.current ) {
        F._afterZoomOut ( coming )
        ;
      }
    }, // End of F.cancel method.

    // Method to close fancyBox.
    close : function ( event ) {
      // First, cancel any pending operations.
      F.cancel ( )
      ;

      // Trigger 'beforeClose' callback.
      if ( false === F.trigger ( 'beforeClose' ) ) {
        return
        ;
      }

      // Unbind all fancyBox related events.
      F.unbindEvents ( )
      ;

      // If fancyBox is not active, nothing to close.
      if ( ! F.isActive ) {
        return
        ;
      }

      // If not fully open or forced close (event === true).
      if ( ! F.isOpen || event === true ) {
        // Immediately remove all fancybox wraps.
        $ ( '.fancybox-wrap' ) .stop ( true ) .trigger ( 'onReset' ) .remove ( )
        ;

        F._afterZoomOut ( )
        ; // Perform after zoom out cleanup.

      } else {
        // Perform animated close.
        F.isOpen = F.isOpened = false
        ;
        F.isClosing = true
        ;

        // Remove specific elements.
        $ ( '.fancybox-item, .fancybox-nav' ) .remove ( )
        ;

        // Stop wrapper animation and remove 'fancybox-opened' class.
        F.wrap.stop ( true, true ) .removeClass ( 'fancybox-opened' )
        ;

        // Execute the defined close animation method.
        F.transitions [ F.current.closeMethod ] ( )
        ;
      }
    }, // End of F.close method.

    // Method to manage the slideshow functionality.
    // $.fancybox.play(); - toggle slideshow
    // $.fancybox.play( true ); - start
    // $.fancybox.play( false ); - stop
    play : function ( action ) {
      var clear = function ( ) {
          clearTimeout ( F.player.timer )
          ;
        }
        , set = function ( ) {
          clear ( )
          ;

          if ( F.current && F.player.isActive ) {
            F.player.timer = setTimeout ( F.next, F.current.playSpeed )
            ;
          }
        }
        , stop = function ( ) {
          clear ( )
          ;

          D.unbind ( '.player' )
          ;

          F.player.isActive = false
          ;

          F.trigger ( 'onPlayEnd' )
          ;
        }
        , start = function ( ) {
          if ( F.current && ( F.current.loop || F.current.index < F.group.length - 1 ) ) {
            F.player.isActive = true
            ;

            D.bind ( {
              'onCancel.player beforeClose.player' : stop,
              'onUpdate.player'   : set,
              'beforeLoad.player' : clear
            } )
            ;

            set ( )
            ;

            F.trigger ( 'onPlayStart' )
            ;
          }
        }
        ; // End of internal function declarations.

      // Control slideshow based on action.
      if ( action === true || ( ! F.player.isActive && action !== false ) ) {
        start ( )
        ;
      } else {
        stop ( )
        ;
      }
    }, // End of F.play method.

    // Method to navigate to the next gallery item.
    next : function ( direction ) {
      var current = F.current
        ;

      if ( current ) {
        // Determine the direction if not explicitly provided.
        if ( ! isString ( direction ) ) {
          direction = current.direction.next
          ;
        }

        // Jump to the next item in the group.
        F.jumpto ( current.index + 1, direction, 'next' )
        ;
      }
    }, // End of F.next method.

    // Method to navigate to the previous gallery item.
    prev : function ( direction ) {
      var current = F.current
        ;

      if ( current ) {
        // Determine the direction if not explicitly provided.
        if ( ! isString ( direction ) ) {
          direction = current.direction.prev
          ;
        }

        // Jump to the previous item in the group.
        F.jumpto ( current.index - 1, direction, 'prev' )
        ;
      }
    } // End of F.prev method.
  }); // This closes the $.extend(F, { ... }); call.

})(window, document, jQuery, undefined); // This closes the IIFE.