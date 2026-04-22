// This is the Swiper library, version 2.4.3.
// A mobile-friendly touch slider and framework, featuring hardware-accelerated transitions.
// For more details, visit: http://www.idangero.us/sliders/swiper/
//
// Copyright (c) 2010-2014, Vladimir Kharlampidi, from The iDangero.us.
// Official website: http://www.idangero.us/
//
// This software is dual-licensed under the GPL and MIT licenses.
// It was officially released on: January 29, 2014.

var Swiper = function( selector , params ) {

  // This section handles compatibility for older browsers, specifically IE8 and older versions of Firefox.
  if ( document.body.__defineGetter__ ) {
    if ( HTMLElement ) {
      var element = HTMLElement.prototype;
      if ( element.__defineGetter__ ) {
        element.__defineGetter__( "outerHTML" , function() {
          return new XMLSerializer().serializeToString( this );
        } );
      } // end if (element.__defineGetter__)
    } // end if (HTMLElement)
  } // end if (document.body.__defineGetter__)

  // Polyfill for `window.getComputedStyle` in environments where it's not natively available.
  if ( !window.getComputedStyle ) {
    window.getComputedStyle = function( el , pseudo ) {
      this.el = el;
      this.getPropertyValue = function( prop ) {
        var re = /(\-([a-z]){1})/g;
        if ( prop === 'float' ) {
          prop = 'styleFloat';
        }
        if ( re.test( prop ) ) {
          prop = prop.replace( re , function() {
            return arguments[2].toUpperCase();
          } );
        }
        return el.currentStyle[prop] ? el.currentStyle[prop] : null;
      }; // end getPropertyValue
      return this;
    }; // end window.getComputedStyle
  } // end if (!window.getComputedStyle)

  // Polyfill for `Array.prototype.indexOf` for compatibility.
  if ( !Array.prototype.indexOf ) {
    Array.prototype.indexOf = function( obj , start ) {
      for ( var i = ( start || 0 ) , j = this.length ; i < j ; i++ ) {
        if ( this[i] === obj ) {
          return i;
        }
      } // end for
      return -1;
    }; // end Array.prototype.indexOf
  } // end if (!Array.prototype.indexOf)

  // Check for `document.querySelectorAll` support, falling back to jQuery if needed.
  if ( !document.querySelectorAll ) {
    if ( !window.jQuery ) {
      return; // If neither is available, initialization cannot proceed.
    }
  } // end if (!document.querySelectorAll)

  // A utility function to query DOM elements, providing a fallback for older browsers.
  function $$( selector , context ) {
    if ( document.querySelectorAll ) {
      return ( context || document ).querySelectorAll( selector );
    }
    else {
      return jQuery( selector , context );
    }
  } // end $$ function

  // Ensure that a selector is provided to initialize Swiper.
  if ( typeof selector === 'undefined' ) {
    return;
  }

  // If the selector isn't a direct DOM node, attempt to find it. If not found, stop.
  if ( ! ( selector.nodeType ) ) {
    if ( $$( selector ).length === 0 ) {
      return;
    }
  }

  // Store a reference to the current Swiper instance for internal use.
  var _this = this;

  // Initialize properties related to touch events and interaction.
  _this.touches = {
    start:          0,
    startX:         0,
    startY:         0,
    current:        0,
    currentX:       0,
    currentY:       0,
    diff:           0,
    abs:            0
  };

  // Initialize properties for tracking slider positions.
  _this.positions = {
    start:          0,
    abs:            0,
    diff:           0,
    current:        0
  };

  // Initialize properties for timing touch interactions.
  _this.times = {
    start:          0,
    end:            0
  };

  // Generate a unique ID for this Swiper instance using the current timestamp.
  _this.id = ( new Date() ).getTime();

  // Determine the main container element for the Swiper.
  _this.container = ( selector.nodeType ) ? selector : $$( selector )[0];

  // Set up various internal flags and state variables.
  _this.isTouched             = false;
  _this.isMoved               = false;
  _this.activeIndex           = 0;
  _this.centerIndex           = 0;
  _this.activeLoaderIndex     = 0;
  _this.activeLoopIndex       = 0;
  _this.previousIndex         = null;
  _this.velocity              = 0;
  _this.snapGrid              = [ ];
  _this.slidesGrid            = [ ];
  _this.imagesToLoad          = [ ];
  _this.imagesLoaded          = 0;
  _this.wrapperLeft           = 0;
  _this.wrapperRight          = 0;
  _this.wrapperTop            = 0;
  _this.wrapperBottom         = 0;
  _this.isAndroid             = navigator.userAgent.toLowerCase().indexOf( 'android' ) >= 0;

  // Declare variables that will be used to store references to key DOM elements and measurements.
  var wrapper , slideSize , wrapperSize , direction , isScrolling , containerSize;

  // Define the default configuration parameters for the Swiper.
  var defaults = {
    eventTarget:                'wrapper', // Specifies whether events are bound to 'wrapper' or 'container'.
    mode :                      'horizontal', // The orientation of the slider: 'horizontal' or 'vertical'.
    touchRatio :                1,
    speed :                     300, // The speed of slide transitions in milliseconds.
    freeMode :                  false, // If true, slides do not snap to positions.
    freeModeFluid :             false, // Enables momentum in free mode.
    momentumRatio:              1,
    momentumBounce:             true,
    momentumBounceRatio:        1,
    slidesPerView :             1, // The number of slides visible at one time.
    slidesPerGroup :            1, // The number of slides to advance per swipe.
    simulateTouch :             true, // Enables/disables touch simulation for desktop.
    followFinger :              true, // If true, slider moves with finger; if false, it moves after release.
    shortSwipes :               true,
    longSwipesRatio:            0.5,
    moveStartThreshold:         false,
    onlyExternal :              false,
    createPagination :          true, // Automatically creates pagination bullets.
    pagination :                false, // Selector for the pagination container element.
    paginationElement:          'span',
    paginationClickable:        false,
    paginationAsRange:          true,
    resistance :                true, // Enables/disables the resistance effect at the ends.
    scrollContainer :           false,
    preventLinks :              true, // Prevents default behavior for links inside slides.
    preventLinksPropagation:    false,
    noSwiping :                 false, // A selector for elements inside slides that should not trigger swiping.
    noSwipingClass :            'swiper-no-swiping', // The class name for no-swiping elements.
    initialSlide:               0, // The index of the slide to start on.
    keyboardControl:            false, // Enables keyboard navigation.
    mousewheelControl :         false, // Enables mousewheel navigation.
    mousewheelControlForceToAxis : false,
    useCSS3Transforms :         true, // Uses CSS3 transforms for animations if available.

    // Autoplay configuration.
    autoplay:                   false, // Set to a number (ms) for autoplay, or false to disable.
    autoplayDisableOnInteraction: true, // Disables autoplay when the user interacts with the slider.
    autoplayStopOnLast:         false, // Stops autoplay after the last slide is reached.

    // Loop mode configuration.
    loop:                       false, // Enables infinite loop mode.
    loopAdditionalSlides:       0, // Number of slides to duplicate for seamless looping.

    // Auto Height configuration.
    calculateHeight:            false, // Dynamically calculates the wrapper height based on the active slide.
    cssWidthAndHeight:          false, // (Experimental) Uses CSS for width/height calculations.

    // Images Preloader configuration.
    updateOnImagesReady :       true, // Reinitializes Swiper once all images are loaded.

    // Form elements interaction.
    releaseFormElements :       true, // Releases focus from form elements on swipe.

    // Watch for active slide, useful for effects based on slide states.
    watchActiveIndex:           false,

    // Slides Visibility Fit configuration.
    visibilityFullFit :         false,

    // Slides Offset configuration.
    offsetPxBefore :            0,
    offsetPxAfter :             0,
    offsetSlidesBefore :        0,
    offsetSlidesAfter :         0,
    centeredSlides:             false,

    // Callback queuing options.
    queueStartCallbacks :       false,
    queueEndCallbacks :         false,

    // Auto Resize configuration.
    autoResize :                true, // Automatically resizes Swiper when the window size changes.
    resizeReInit :              false, // Reinitializes Swiper on every resize event.

    // DOM Animation configuration.
    DOMAnimation :              true,

    // Slides Loader configuration.
    loader: {
      slides:                   [ ], // An array to define slides for dynamic loading.
      slidesHTMLType:           'inner', // Specifies if slides are loaded as 'inner' HTML or 'outer'.
      surroundGroups:           1, // Number of slide groups to keep loaded around the view.
      logic:                    'reload', // Loading logic: 'reload' or 'change'.
      loadAllSlides:            false
    },

    // Namespace and class names for Swiper elements.
    slideElement :              'div',
    slideClass :                'swiper-slide',
    slideActiveClass :          'swiper-slide-active',
    slideVisibleClass :         'swiper-slide-visible',
    slideDuplicateClass:       'swiper-slide-duplicate',
    wrapperClass :              'swiper-wrapper',
    paginationElementClass:     'swiper-pagination-switch',
    paginationActiveClass :     'swiper-active-switch',
    paginationVisibleClass :    'swiper-visible-switch'
  };

  // Merge the user-provided parameters with the default settings.
  params = params || {}; // Ensure `params` is an object, even if not provided.
  for ( var prop in defaults ) {
    if ( prop in params && typeof params[prop] === 'object' ) {
      // If the property is an object, deep merge its sub-properties.
      for ( var subProp in defaults[prop] ) {
        if ( ! ( subProp in params[prop] ) ) {
          params[prop][subProp] = defaults[prop][subProp];
        }
      }
    }
    else if ( ! ( prop in params ) ) {
      // If the property does not exist in user params, assign the default.
      params[prop] = defaults[prop];
    }
  } // end for prop in defaults

  _this.params = params; // Assign the final merged parameters to the Swiper instance.

  // Adjust certain parameters based on other settings for logical consistency.
  if ( params.scrollContainer ) {
    params.freeMode = true;
    params.freeModeFluid = true;
  }
  if ( params.loop ) {
    params.resistance = '100%';
  }
  var isH = params.mode === 'horizontal'; // A convenient boolean flag for horizontal mode.

  // Define the appropriate touch event names for different browser environments.
  var desktopEvents = [ 'mousedown' , 'mousemove' , 'mouseup' ];
  if ( _this.browser.ie10 ) {
    desktopEvents = [ 'MSPointerDown' , 'MSPointerMove' , 'MSPointerUp' ];
  }
  if ( _this.browser.ie11 ) {
    desktopEvents = [ 'pointerdown' , 'pointermove' , 'pointerup' ];
  }

  _this.touchEvents = {
    touchStart : _this.support.touch || !params.simulateTouch  ? 'touchstart' : desktopEvents[0],
    touchMove  : _this.support.touch || !params.simulateTouch ? 'touchmove'  : desktopEvents[1],
    touchEnd   : _this.support.touch || !params.simulateTouch ? 'touchend'   : desktopEvents[2]
  };

  // Locate the Swiper wrapper element within the container.
  for ( var i = _this.container.childNodes.length - 1 ; i >= 0 ; i-- ) {
    if ( _this.container.childNodes[i].className ) {
      var _wrapperClasses = _this.container.childNodes[i].className.split( ' ' );
      for ( var j = 0 ; j < _wrapperClasses.length ; j++ ) {
        if ( _wrapperClasses[j] === params.wrapperClass ) {
          wrapper = _this.container.childNodes[i];
          break; // Found the wrapper, no need to check further classes for this node.
        }
      } // end for j
    } // end if (_this.container.childNodes[i].className)
  } // end for i

  _this.wrapper = wrapper; // Assign the identified wrapper to the Swiper instance.

  // Extends Swiper slide DOM elements with custom utility methods.
  _this._extendSwiperSlide = function ( el ) {
    el.append = function () {
      if ( params.loop ) {
        el.insertAfter( _this.slides.length - _this.loopedSlides );
      }
      else {
        _this.wrapper.appendChild( el );
        _this.reInit();
      }
      return el;
    }; // end append method

    el.prepend = function () {
      if ( params.loop ) {
        _this.wrapper.insertBefore( el , _this.slides[ _this.loopedSlides ] );
        _this.removeLoopedSlides();
        _this.calcSlides();
        _this.createLoop();
      }
      else {
        _this.wrapper.insertBefore( el , _this.wrapper.firstChild );
      }
      _this.reInit();
      return el;
    }; // end prepend method

    el.insertAfter = function ( index ) {
      if ( typeof index === 'undefined' ) {
        return false;
      }
      var beforeSlide;

      if ( params.loop ) {
        beforeSlide = _this.slides[ index + 1 + _this.loopedSlides ];
        if ( beforeSlide ) {
          _this.wrapper.insertBefore( el , beforeSlide );
        }
        else {
          _this.wrapper.appendChild( el );
        }
        _this.removeLoopedSlides();
        _this.calcSlides();
        _this.createLoop();
      }
      else {
        beforeSlide = _this.slides[ index + 1 ];
        _this.wrapper.insertBefore( el , beforeSlide );
      }
      _this.reInit();
      return el;
    }; // end insertAfter method

    el.clone = function () {
      return _this._extendSwiperSlide( el.cloneNode( true ) );
    }; // end clone method

    el.remove = function () {
      _this.wrapper.removeChild( el );
      _this.reInit();
    }; // end remove method

    el.html = function ( html ) {
      if ( typeof html === 'undefined' ) {
        return el.innerHTML;
      }
      else {
        el.innerHTML = html;
        return el;
      }
    }; // end html method

    el.index = function () {
      var index;
      for ( var i = _this.slides.length - 1 ; i >= 0 ; i-- ) {
        if ( el === _this.slides[i] ) {
          index = i;
        }
      }
      return index;
    }; // end index method

    el.isActive = function () {
      if ( el.index() === _this.activeIndex ) {
        return true;
      }
      else {
        return false;
      }
    }; // end isActive method

    // Ensure a data storage object exists for the slide.
    if ( !el.swiperSlideDataStorage ) {
      el.swiperSlideDataStorage = {};
    }

    el.getData = function ( name ) {
      return el.swiperSlideDataStorage[name];
    }; // end getData method

    el.setData = function ( name , value ) {
      el.swiperSlideDataStorage[name] = value;
      return el;
    }; // end setData method

    el.data = function ( name , value ) {
      if ( !value ) {
        return el.getAttribute( 'data-' + name );
      }
      else {
        el.setAttribute( 'data-' + name , value );
        return el;
      }
    }; // end data method

    el.getWidth = function ( outer ) {
      return _this.h.getWidth( el , outer );
    }; // end getWidth method

    el.getHeight = function ( outer ) {
      return _this.h.getHeight( el , outer );
    }; // end getHeight method

    el.getOffset = function() {
      return _this.h.getOffset( el );
    }; // end getOffset method

    return el;
  }; // end _extendSwiperSlide function

  // Calculates and updates the internal list of slides.
  _this.calcSlides = function ( forceCalcSlides ) {
    var oldNumber = _this.slides ? _this.slides.length : false;
    _this.slides = [ ];
    _this.displaySlides = [ ];

    // Iterate through child nodes of the wrapper to identify actual slides.
    for ( var i = 0 ; i < _this.wrapper.childNodes.length ; i++ ) {
      if ( _this.wrapper.childNodes[i].className ) {
        var _className = _this.wrapper.childNodes[i].className;
        var _slideClasses = _className.split( ' ' );
        for ( var j = 0 ; j < _slideClasses.length ; j++ ) {
          if ( _slideClasses[j] === params.slideClass ) {
            _this.slides.push( _this.wrapper.childNodes[i] );
          }
        } // end for j
      } // end if (_this.wrapper.childNodes[i].className)
    } // end for i

    // Apply the Swiper slide extension methods to each newly found slide.
    for ( i = _this.slides.length - 1 ; i >= 0 ; i-- ) {
      _this._extendSwiperSlide( _this.slides[i] );
    }

    // If this is the very first calculation, simply return.
    if ( oldNumber === false ) {
      return;
    }

    // If the number of slides has changed or a recalculation was forced, reinitialize parts of Swiper.
    if ( oldNumber !== _this.slides.length || forceCalcSlides ) {
      // These functions are assumed to be defined elsewhere in the Swiper scope.
      removeSlideEvents();
      addSlideEvents();
      _this.updateActiveSlide();
      if ( _this.params.pagination ) {
        _this.createPagination();
      }
      _this.callPlugins( 'numberOfSlidesChanged' );
    }
  }; // end calcSlides function

  // Creates a new Swiper slide DOM element.
  _this.createSlide = function ( html , slideClassList , el ) {
    var slideClassList = slideClassList || _this.params.slideClass;
    var el = el || params.slideElement;
    var newSlide = document.createElement( el );
    newSlide.innerHTML = html || '';
    newSlide.className = slideClassList;
    return _this._extendSwiperSlide( newSlide );
  }; // end createSlide function

  // Appends a new slide to the Swiper.
  _this.appendSlide = function ( html , slideClassList , el ) {
    if ( !html ) {
      return;
    }
    if ( html.nodeType ) {
      return _this._extendSwiperSlide( html ).append();
    }
    else {
      return _this.createSlide( html , slideClassList , el ).append();
    }
  }; // end appendSlide function

  // Prepends a new slide to the Swiper.
  _this.prependSlide = function ( html , slideClassList , el ) {
    if ( !html ) {
      return;
    }
    if ( html.nodeType ) {
      return _this._extendSwiperSlide( html ).prepend();
    }
    else {
      return _this.createSlide( html , slideClassList , el ).prepend();
    }
  }; // end prependSlide function

  // Inserts a new slide after a specified index.
  _this.insertSlideAfter = function ( index , html , slideClassList , el ) {
    if ( typeof index === 'undefined' ) {
      return false;
    }
    if ( html.nodeType ) {
      return _this._extendSwiperSlide( html ).insertAfter( index );
    }
    else {
      return _this.createSlide( html , slideClassList , el ).insertAfter( index );
    }
  }; // end insertSlideAfter function

  // Removes a slide at the specified index.
  _this.removeSlide = function ( index ) {
    if ( _this.slides[index] ) {
      if ( params.loop ) {
        if ( !_this.slides[ index + _this.loopedSlides ] ) {
          return false;
        }
        _this.slides[ index + _this.loopedSlides ].remove();
        _this.removeLoopedSlides();
        _this.calcSlides();
        _this.createLoop();
      }
      else {
        _this.slides[index].remove();
      }
      return true;
    }
    else {
      return false;
    }
  }; // end removeSlide function

  // Removes the last slide from the Swiper.
  _this.removeLastSlide = function () {
    if ( _this.slides.length > 0 ) {
      if ( params.loop ) {
        _this.slides[ _this.slides.length - 1 - _this.loopedSlides ].remove();
        _this.removeLoopedSlides();
        _this.calcSlides();
        _this.createLoop();
      }
      else {
        _this.slides[ ( _this.slides.length - 1 ) ].remove();
      }
      return true;
    }
    else {
      return false;
    }
  }; // end removeLastSlide function

  // Removes all slides from the Swiper.
  _this.removeAllSlides = function () {
    for ( var i = _this.slides.length - 1 ; i >= 0 ; i-- ) {
      _this.slides[i].remove();
    }
  }; // end removeAllSlides function

  // Retrieves a slide element by its index.
  _this.getSlide = function ( index ) {
    return _this.slides[index];
  }; // end getSlide function

  // Retrieves the last slide element.
  _this.getLastSlide = function () {
    return _this.slides[ _this.slides.length - 1 ];
  }; // end getLastSlide function

  // Retrieves the first slide element.
  _this.getFirstSlide = function () {
    return _this.slides[0];
  }; // end getFirstSlide function

  // Returns the currently active slide element.
  _this.activeSlide = function () {
    return _this.slides[ _this.activeIndex ];
  }; // end activeSlide function

  // This function acts as a wrapper for callbacks, supporting single functions or arrays of functions.
  _this.fireCallback = function() {
    var callback = arguments[0];
    if ( Object.prototype.toString.call( callback ) === '[object Array]' ) {
      for ( var i = 0 ; i < callback.length ; i++ ) {
        if ( typeof callback[i] === 'function' ) {
          callback[i]( arguments[1] , arguments[2] , arguments[3] , arguments[4] , arguments[5] );
        }
      } // end for
    }
    else if ( Object.prototype.toString.call( callback ) === '[object String]' ) {
      if ( params['on' + callback] ) {
        _this.fireCallback( params['on' + callback] );
      }
    }
    else {
      callback( arguments[1] , arguments[2] , arguments[3] , arguments[4] , arguments[5] );
    }
  }; // end fireCallback function
}; // end Swiper constructor function