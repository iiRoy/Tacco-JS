/*
 *  Project: Flip.js Library
 *  Description: A jQuery plugin for creating flip effects to change content sections.
 *  Author: Hiro Inami - Original developer
 *  License: MIT License (Open source and freely usable)
 *  Version: 1.0.0 (Initial release)
 *  Date: 2023-10-27
 */


// The leading semicolon is a crucial defensive programming technique.
// It guards against issues that can arise when concatenating JavaScript files,
// particularly if a preceding script might be missing its closing semicolon,
// which could otherwise lead to unexpected parsing errors or function invocation problems.
;( function    (   $,   window,   document,   undefined   ) {

  // The 'undefined' parameter is used here to ensure that the local 'undefined'
  // truly holds the value 'undefined'. In older ECMAScript 3 environments,
  // the global 'undefined' could theoretically be reassigned, leading to
  // unexpected behavior. By explicitly not passing a value for 'undefined'
  // in the IIFE call, we guarantee its correct, un-modified state within this scope.
  // Modern ES5+ environments have made 'undefined' non-writable, but this pattern
  // remains a robust best practice.

  // Passing 'window' and 'document' as local parameters instead of accessing them
  // directly from the global scope offers a slight performance improvement.
  // Local variable lookups are generally faster than global ones.
  // Additionally, this technique allows minifiers to compress these commonly
  // used global objects into shorter local variable names, leading to
  // more efficient code size.
  //
  var DIR_RTOL      = 'rtol'    ; // Direction: Right to Left
  var DIR_LTOR      = 'ltor'    ; // Direction: Left to Right
  var DIR_TTOB      = 'ttob'    ; // Direction: Top to Bottom
  var DIR_BTOT      = 'btot'    ; // Direction: Bottom to Top

  // Create the default options object for the plugin only once
  var pluginName    = 'flip'    ,
      defaults      = {
        effect:       'flip'          , // Specifies the animation effect: "flip" or "slide".
                                        // "slide" is automatically selected as a fallback
                                        // for browsers that do not support 3D CSS transitions.
        forwardDir:   DIR_RTOL        , // Defines the primary direction for content progression:
                                        // "ltor" (left to right), "rtol" (right to left),
                                        // "ttob" (top to bottom), or "btot" (bottom to top).
        height:       ''              , // Sets the height of the flip container.
                                        // An empty string "" indicates 'auto' height adjustment.
        keyboardNav:  true            , // A boolean flag to enable or disable keyboard navigation
                                        // (e.g., arrow keys) for flipping content.
        showPager:    false           , // A boolean flag to control the visibility of a pager
                                        // element, typically used for navigation indicators.
        loop:         false             // A boolean flag that determines if the content sequence
                                        // should loop back to the beginning after the end is reached.
      }                               ;

  var _PREFIX_DATA  = 'data-'   ; // Prefix for data attributes.
  var _NS           = 'flip-'   ; // Namespace for CSS classes and data attributes.

  var TYPE_TEXT     = 0         ; // Represents a text type for attribute parsing.
  var TYPE_BOOL     = 1         ; // Represents a boolean type for attribute parsing.

  // Array defining jQuery Mobile-like attributes and their corresponding types for parsing.
  var JQM_ATTRS     = [
    { key: 'effect',     attr: 'effect',       type: TYPE_TEXT } , // Effect attribute.
    { key: 'forwardDir', attr: 'forward-dir',  type: TYPE_TEXT } , // Forward direction attribute.
    { key: 'height',     attr: 'height',       type: TYPE_TEXT } , // Height attribute.
    { key: 'keyboardNav',attr: 'keyboard-nav', type: TYPE_BOOL } , // Keyboard navigation attribute.
    { key: 'showPager',  attr: 'show-pager',   type: TYPE_BOOL } , // Show pager attribute.
    { key: 'loop',       attr: 'loop',         type: TYPE_BOOL }   // Loop attribute.
  ]                                                               ;

  var _FIRST_HALF       = 1     ; // Constant representing the first half of a flipping element.
  var _SECOND_HALF      = -1    ; // Constant representing the second half of a flipping element.

  var CSSPREFIX         = ''    ; // Prefix for CSS properties (e.g., -webkit-, -moz-).
                                  // This should be dynamically set based on browser capabilities.
  var KEY_LEFT          = 37    ; // Key code for the left arrow key.
  var KEY_RIGHT         = 39    ; // Key code for the right arrow key.

  var CURRENT           = 'flipCurrent'     ; // Class name for the currently active flip element.
  var CLASS_CURRENT     = '.' + CURRENT     ; // Selector string for the current flip element.

  var FLIPPING_BASE_ZINDEX = 10000          ; // Base z-index for flipping elements to ensure they are on top.

  /**
   * Flip constructor function.
   * Initializes a new Flip instance for a given element with specified options.
   * @param {HTMLElement} element - The DOM element to apply the flip plugin to.
   * @param {Object} options - Configuration options for the flip effect.
   */
  function Flip ( element, options ) {
    this.START_OFFSET       = 8         ; // Initial offset for touch/mouse events.
    this.MAX_DISTANCE       = 250       ; // Maximum distance for a drag gesture.
    this.THREASHOLD_RATIO   = 0.5       ; // Ratio threshold for determining a full flip.

    this.element            = element   ; // The DOM element associated with this Flip instance.
    this.options            = options   ; // Merged options for the plugin.

    this.flippingSide       = null      ; // Tracks which half of the element is currently flipping.
    this.currentRatio       = null      ; // Represents the current progress of the flip animation (0 to 1).

    this.isInAnimation      = false     ; // Flag to indicate if an animation is currently in progress.

    this.flippingElement    = null      ; // Reference to the DOM element that is actively flipping.
    this.backFilippingElement = null    ; // Reference to the DOM element on the back side of the flip.
  }

  /**
   * Initializes the shadow element that creates the depth effect during a flip.
   * @private
   * @returns {jQuery} The created jQuery shadow element.
   */
  Flip.prototype._initShadow = function ( ) {
    var $elem       = $(this.element)           ; // The main container element.
    var $cur        = $elem.children(CLASS_CURRENT) ; // The currently visible content element.
    var elemWidth   = $cur.width()              ; // Width of the current content.
    var elemHeight  = $cur.height()             ; // Height of the current content.

    // Create the shadow div and set its initial styles.
    var $flipShadow = $('<div class="flipShadow"></div>').hide( ) ;

    $flipShadow .css( 'position',        'absolute'      )
                .css( 'background-color','#' + '111111'   ) // Dark background for shadow effect.
                .css( 'opacity',         '0.9'           ) // Semi-transparent.
                .css( 'display',         'none'          ) // Hidden by default.
                .css( 'zIndex',          FLIPPING_BASE_ZINDEX ) ; // Ensure it's above other static content.

    // Adjust shadow dimensions and position based on flip direction.
    if  ( this._isVertical( ) ) {
      $flipShadow .css( 'width',         ( elemWidth )           + 'px' )
                  .css( 'height',        ( elemHeight / 2 )      + 'px' )
                  .css( 'top',           ( elemHeight / 2 )      + 'px' )
                  .css( 'left',          '0'                     ) ;
    }
    else {
      $flipShadow .css( 'width',         ( elemWidth / 2 )       + 'px' )
                  .css( 'height',        elemHeight              + 'px' )
                  .css( 'left',          ( elemWidth / 2 )       + 'px' )
                  .css( 'top',           '0'                     ) ;
    }

    return $flipShadow    ; // Return the configured shadow element.
  };

  /**
   * Determines if the flip direction is vertical (top-to-bottom or bottom-to-top).
   * @private
   * @returns {boolean} True if the flip is vertical, false otherwise.
   */
  Flip.prototype._isVertical = function ( ) {
    return ( this.options.forwardDir === DIR_TTOB    ||
             this.options.forwardDir === DIR_BTOT    ) ? true : false ;
  }

  /**
   * Splits a given element into two halves (first and second) for the flip effect.
   * These halves are then appended to the main flip root element.
   * @private
   * @param {jQuery} $elem - The jQuery object of the element to split.
   * @param {string} customClass - A custom class to apply to the split halves (e.g., 'front', 'back').
   * @returns {Object} An object containing references to the first and second half jQuery elements.
   */
  Flip.prototype._splitElem = function ( $elem, customClass ) {

    var $flipRoot   = $(this.element) ; // The main container of the flip plugin.
    if  ( $elem === null    ||    $elem.length === 0 ) {
      // If no element is provided, create an empty placeholder div.
      var rootWidth   = $flipRoot.width()   ;
      var rootHeight  = $flipRoot.height()  ;

      if  ( this.options.showPager ) {
        var $pager    = $flipRoot.children('.pager')  ;
        rootHeight    -= $pager.height()              ; // Adjust height if pager is visible.
      }

      $elem = $('<div class="splitEmpty" style="width: ' +
                rootWidth + 'px; height: ' + rootHeight + 'px;"></div>') ;
    }

    var isVertical    = this._isVertical( ) ; // Check if the flip direction is vertical.

    var firstCustom   = customClass + 'First'   ; // Class for the first half.
    var secondCustom  = customClass + 'Second'  ; // Class for the second half.

    // Get or create the first half element.
    var $firstHalf    = $flipRoot.children(firstCustom) ;
    if  ( $firstHalf.length === 0 ) {
      $firstHalf = $('<div class="splitHalf firstHalf ' +
                      firstCustom + '"></div>').css('zIndex', FLIPPING_BASE_ZINDEX) ;
    } else {
      $firstHalf.empty()  ; // Clear existing content if element already exists.
    }

    // Get or create the second half element.
    var $secondHalf   = $flipRoot.children(secondCustom)  ;
    if  ( $secondHalf.length === 0 ) {
      $secondHalf = $('<div class="splitHalf secondHalf ' +
                      secondCustom + '"></div>').css('zIndex', FLIPPING_BASE_ZINDEX) ;
    } else {
      $secondHalf.empty() ; // Clear existing content.
    }

    // Clone the original element and append to both halves.
    $firstHalf.append($elem.clone())  ;
    $secondHalf.append($elem.clone()) ;

    // Disable anchor clicks within the flipping elements to prevent navigation during flip.
    // This is generally safe because the flip effect handles the content transition.
    $firstHalf.find('a').each(function(idx, anchor) {
        $(anchor).bind("click", function(event) {
          return false ; // Prevent default anchor behavior.
        }) ;
    }) ;

    $secondHalf.find('a').each(function(idx, anchor) {
        $(anchor).bind("click", function(event) {
          return false ; // Prevent default anchor behavior.
        }) ;
    }) ;

    // Adjust width/height for the split halves based on vertical or horizontal flip.
    var elemWidth   = $elem.width()   ;
    var elemHeight  = $elem.height()  ;

    // Configuration for the first half element.
    if  ( isVertical ) {
      $firstHalf
      .css('width',    elemWidth + 'px')
      .css('height',   Math.floor(elemHeight / 2) + 'px') ;

      $firstHalf.children(':first')
      .css('height',   elemHeight + 'px')
      .css('display',  'block') ;
    } else {
      $firstHalf
      .css('width',    Math.floor(elemWidth / 2) + 'px')
      .css('height',   elemHeight + 'px') ;

      $firstHalf.children(':first')
      .css('width',    elemWidth + 'px')
      .css('display',  'block') ;
    }


    // Configuration for the second half element.
    if  ( isVertical ) {
      $secondHalf
      .css('width',    elemWidth + 'px')
      .css('height',   Math.ceil(elemHeight / 2) + 'px')
      .css('top',      Math.floor(elemHeight / 2) + 'px') ;

      $secondHalf.children(':first')
      .css('height',   elemHeight + 'px')
      .css('display',  'block')
      .css('top',      -1 * Math.floor(elemHeight / 2) + 'px') ; // Adjust content position.
    } else {
      $secondHalf
      .css('width',    Math.ceil(elemWidth / 2) + 'px')
      .css('height',   elemHeight + 'px')
      .css('left',     Math.floor(elemWidth / 2) + 'px') ;

      $secondHalf.children(':first')
      .css('width',    elemWidth + 'px')
      .css('display',  'block')
      .css('left',     -1 * Math.floor(elemWidth / 2) + 'px') ; // Adjust content position.
    }

    // Append the halves to the root if they don't already exist.
    if  ( $flipRoot.children(firstCustom).length === 0 ) {
      $flipRoot.append($firstHalf) ;
    }

    if  ( $flipRoot.children(secondCustom).length === 0 ) {
      $flipRoot.append($secondHalf) ;
    }

    // Return an object containing references to both split halves.
    return { first: $firstHalf, second: $secondHalf } ;
  }

  /**
   * Initializes the flip animation, preparing the elements for the visual transition.
   * This method sets up the initial state of the flipping elements and the shadow.
   * @param {number} flippingSide - Indicates which half (_FIRST_HALF or _SECOND_HALF) is initiating the flip.
   */
  Flip.prototype.init = function ( flippingSide ) {
    // If currentRatio is not null, it means a flip is already in progress or partially set up.
    // In this case, we should not re-initialize.
    if  ( this.currentRatio !== null ) {
      return  ;
    }

    // Initialize currentRatio to 0, signifying the start of a new flip.
    this.currentRatio   = 0           ;
    this.flippingSide   = flippingSide  ;

    var $elem           = $(this.element) ; // The main container element.

    // Find the currently displayed content element within the container.
    var $cur            = $elem.children(CLASS_CURRENT) ;
    var $underContent   = null                        ; // The content that will be revealed under the flip.
    var $flippingElem   = null                        ; // The element that will perform the flip rotation.
    var $flippingBackElem = null                      ; // The element on the back side of the flip.

    // Determine which content (next or previous) should be loaded under the flip.
    if  ( this.options.forwardDir === DIR_LTOR && flippingSide === _FIRST_HALF    ||
          this.options.forwardDir === DIR_RTOL && flippingSide === _SECOND_HALF   ||
          this.options.forwardDir === DIR_TTOB && flippingSide === _FIRST_HALF    ||
          this.options.forwardDir === DIR_BTOT && flippingSide === _SECOND_HALF   ) {
      $underContent = this.getNextContent($cur) ;
    } else {
      $underContent = this.getPrevContent($cur) ;
    }

    // Split the 'under' content and the 'current' content into front and back halves.
    var back  = this._splitElem($underContent, 'back')  ;
    var front = this._splitElem($cur,          'front') ;

    // Assign the correct halves to be the flipping and back-flipping elements
    // based on which side is initiating the flip.
    if  ( flippingSide === _SECOND_HALF ) {
      $flippingElem     = front.second  ;
      $flippingBackElem = back.first    ;
    } else {
      $flippingElem     = front.first   ;
      $flippingBackElem = back.second   ;
    }

    // Store references to the active flipping elements.
    this.flippingElement      = $flippingElem       ;
    this.backFilippingElement = $flippingBackElem   ;

    // Set z-index to control stacking order during the flip.
    $flippingElem.css('zIndex',         FLIPPING_BASE_ZINDEX + 1 )  ; // Flipping element on top.
    $flippingBackElem.css('zIndex',     FLIPPING_BASE_ZINDEX     )  ; // Back element underneath.

    // Initialize the shadow element. It's hidden initially to prevent a flicker.
    var $flipShadow = this._initShadow()  ;

    if  ( this._isVertical() ) {
      // Add vertical-specific classes.
      $flippingElem.addClass('verticalFlipping')      ;
      $flippingBackElem.addClass('verticalFlipping')  ;

      if  ( flippingSide === _FIRST_HALF ) {
        $flipShadow.css('top', '0px') ; // Position shadow for first half vertical flip.
      }
    } else {
      // Add horizontal-specific classes.
      $flippingElem.addClass('holizontalFlipping')    ;
      $flippingBackElem.addClass('holizontalFlipping') ;

      if  ( flippingSide === _FIRST_HALF ) {
        $flipShadow.css('left', '0px') ; // Position shadow for first half horizontal flip.
      }
    }

    // Append the shadow to the main element.
    $elem.append($flipShadow) ;

    // Add classes to mark elements for flipping.
    $flippingElem.addClass('flipping')      ;
    $flippingBackElem.addClass('backflipping') ;

    // Update classes on the current element: remove 'CURRENT' and add 'working'.
    // 'working' signifies that this element is part of an ongoing flip operation.
    $cur = $elem.children(CLASS_CURRENT) ;
    $cur.removeClass(CURRENT)            ;
    $cur.addClass('working')             ;

    // Finally, show the flip shadow to create the depth effect.
    $flipShadow.show() ;
  }

  /**
   * Advances the flip animation to a specific ratio.
   * This method applies CSS transformations based on the given ratio to simulate the flip.
   * It also manages the visibility and z-index of the flipping elements and the shadow.
   * @param {number} ratio - The current progress ratio of the flip (e.g., 0 for start, 1 for end).
   */
  Flip.prototype.step = function ( ratio ) {
    var $working = $(this.element).children('.working') ; // Find the element marked as 'working'.
    if  ( $working.length === 0 ) {
      return  ; // If no working element, no flip is in progress.
    }

    this.currentRatio = ratio ; // Update the current flip ratio.

    var $flipping     = this.flippingElement        ; // The element currently rotating.
    var $backFlipping = this.backFilippingElement   ; // The element on the back side.

    // Apply CSS transform for rotation.
    var transformKey  = CSSPREFIX + 'Transform'     ;
    $flipping.css(transformKey,     this._calculateFlipRotateCSS(ratio))      ;
    $backFlipping.css(transformKey, this._calculateBackFlipRotateCSS(ratio))   ;

    // Helper function to calculate shadow opacity based on flip progress.
    // This formula creates a non-linear fading effect for the shadow.
    var formula = function ( p ) {
      var factor = 1.2 ;
      return -1 * factor * ( p - 1 ) * ( p - 1 ) + factor ;
    }

    var $elem         = $(this.element) ;
    var elemHeight    = $flipping.height() ; // Height of the flipping element.
    var flipShadowRatio = 0 ;

    var degree        = Math.abs(180 * ratio) ; // Calculate the current rotation degree.

    // Logic to switch visibility and z-index when the flip passes 90 degrees.
    if  ( degree > 90 ) {
      $flipping.css('zIndex',     FLIPPING_BASE_ZINDEX     ) ; // Flipping element goes underneath.
      $backFlipping.css('zIndex', FLIPPING_BASE_ZINDEX + 1 ) ; // Back element comes to top.

      if  ( $backFlipping.css('display') === 'none' ) {
        $backFlipping.css('display', 'block') ; // Show back element.
        $flipping.css('display',     'none' ) ; // Hide front element.
      }

      // Adjust the position of the flip shadow for the second half of the flip.
      if  ( this._isVertical() ) {
        if  ( this.flippingSide === _SECOND_HALF ) {
          $('.flipShadow').css('top', '0') ;
        } else {
          $('.flipShadow').css('top', elemHeight + 'px') ;
        }
      } else {
        if  ( this.flippingSide === _SECOND_HALF ) {
          $('.flipShadow').css('left', '0') ;
        } else {
          $('.flipShadow').css('left', '50%') ;
        }
      }

      // Calculate and apply shadow opacity for the second phase of the flip.
      flipShadowRatio = Math.max(0, 1 - formula((180 - degree) / 90)) ;
      $('.flipShadow').css('opacity', 0.9 * flipShadowRatio) ;

    } else {
      // Logic for the first 90 degrees of the flip.
      $flipping.css('zIndex',     FLIPPING_BASE_ZINDEX + 1 ) ; // Flipping element stays on top.
      $backFlipping.css('zIndex', FLIPPING_BASE_ZINDEX     ) ; // Back element stays underneath.

      if  ( $flipping.css('display') === 'none' ) {
        $backFlipping.css('display', 'none' ) ; // Hide back element.
        $flipping.css('display',     'block') ; // Show front element.
      }

      // Adjust the position of the flip shadow for the first half of the flip.
      if  ( this._isVertical() ) {
        if  ( this.flippingSide === _SECOND_HALF ) {
          // Vertical flip shadow position needs to consider the actual height of the flipping object
          // because the pager area might affect the 50% calculation.
          $('.flipShadow').css('top', elemHeight + 'px') ;
        } else {
          $('.flipShadow').css('top', '0') ;
        }
      } else {
        if  ( this.flippingSide === _SECOND_HALF ) {
          $('.flipShadow').css('left', '50%') ;
        } else {
          $('.flipShadow').css('left', '0') ;
        }
      }

      // Calculate and apply shadow opacity for the first phase of the flip.
      flipShadowRatio = Math.max(0, 1 - formula((degree) / 90)) ;
      $('.flipShadow').css('opacity', 0.9 * flipShadowRatio) ;
    }
  }

  /**
   * Calculates the CSS rotate transformation string for the main flipping element.
   * @private
   * @param {number} ratio - The current progress ratio of the flip (0 to 1).
   * @returns {string} The CSS transform string (e.g., 'rotateX(90deg)').
   */
  Flip.prototype._calculateFlipRotateCSS = function ( ratio )
  {
    if  ( this._isVertical() ) {
       return 'rotateX(' + ( -1 * 180 * ratio ) + 'deg)' ; // Vertical flip uses rotateX.
    } else {
       return 'rotateY(' + ( 180 * ratio )      + 'deg)' ; // Horizontal flip uses rotateY.
    }
  }

  /**
   * Calculates the CSS rotate transformation string for the back-flipping element.
   * This element is visible when the main flipping element has rotated past 90 degrees.
   * @private
   * @param {number} ratio - The current progress ratio of the flip (0 to 1).
   * @returns {string} The CSS transform string.
   */
  Flip.prototype._calculateBackFlipRotateCSS = function ( ratio )
  {
    if  ( this._isVertical() ) {
      if  ( this.flippingSide === _FIRST_HALF ) {
        return 'rotateX(' + ( -1 * ( 180 + ( 180 * ratio ) ) ) + 'deg)' ;
      } else {
        return 'rotateX(' + ( 180 - ( 180 * ratio ) )           + 'deg)' ;
      }
    } else {
      if  ( this.flippingSide === _FIRST_HALF ) {
        return 'rotateY(' + ( 180 + ( 180 * ratio ) )           + 'deg)' ;
      } else {
        return 'rotateY(' + ( -1 * ( 180 - ( 180 * ratio ) ) )   + 'deg)' ;
      }
    }
  }


  /**
   * (Backup/Alternative) Initiates a flip action using CSS keyframe animations.
   * This method is a placeholder or an alternative approach, marked as BK (Backup).
   * It aims to leverage CSS animations for potentially smoother performance.
   * @param {number} to - The target ratio for the flip (e.g., 0 or 1).
   */
  Flip.prototype.actionBK = function ( to ) {
    var endRatio    = to                ;
    var startRatio  = this.currentRatio ;

    // Get the appropriate rotateX or rotateY setting for CSS transforms.
    var $flipping       = this.flippingElement      ;
    var $backFlipping   = this.backFilippingElement ;

    // Add classes to trigger CSS animations.
    $flipping.addClass("flipAction")      ;
    $backFlipping.addClass("flipBackAction") ;

    // Define the start and end rotation values for the keyframe animation.
    var flipStartRotate = this._calculateFlipRotateCSS(startRatio) ;
    var flipEndRotate   = this._calculateFlipRotateCSS(endRatio)   ;

    // Construct the CSS keyframe rule.
    var keyframe = '@keyframes flip {'   ;
    keyframe += '0% {'+flipStartRotate+';}' ;
    keyframe += '100% {'+flipEndRotate+';}' ;
    keyframe += '}'                         ;

    // FIXME: Further implementation is needed here to properly control z-index or visibility
    // throughout the CSS animation, as plain keyframes might not handle this automatically.

    // Also, an event listener would be required to remove the animation classes
    // and clean up after the animation has completed, such as 'animationend' event.


  }

  /**
   * Performs the flip animation using a JavaScript-based easing function.
   * This method is typically used when CSS animations are not suitable or for custom control.
   * It iteratively updates the flip ratio over time.
   * @param {number} to - The target ratio for the flip (0 for reset, 1 for full flip).
   */
  Flip.prototype.action = function ( to ) {
    var endRatio      = to                  ; // The desired final ratio of the flip.
    var startRatio    = this.currentRatio   ; // The current starting ratio of the flip.

    var _this         = this                ; // Reference to the Flip instance for use inside closures.
    var x             = 0                   ; // Internal counter for animation progress.
    var b             = Math.abs(this.currentRatio) ; // Base value for easing function.
    var c             = Math.abs(to - this.currentRatio) ; // Change in value for easing function.
    var d             = c                   ; // Duration or total steps for easing function (simplified).

    var sign          = 1                   ; // Determines the direction of the flip.
    if  ( this.currentRatio < 0 ) {
      sign = -1 ;
    } else if ( this.currentRatio === 0 ) {
      if ( endRatio < 0 ) {
        sign = -1 ;
      }
    }

    // A quadratic ease-out formula for animation.
    var formulaA = function ( t ) {
      // simple version of quadratic easeOut
      t = Math.abs(t) / d ;
      return -1 * c * t * ( t - 2 ) + b ;
    }

    // A cubic ease-out formula for animation (smoother acceleration/deceleration).
    var formula = function ( t ) {
      // simple version of cubic easeOut
      t = Math.abs(t) / d ;
      t = t - 1 ; // Adjust 't' for easeOut calculation.
      return c * ( t * t * t + 1 ) + b ;
    }

    if  ( to === 0 ) {
      // If the target is 0 (reset), swap start and end values for consistent easing logic.
      b = 0 ;
    }

    // The animation loop function.
    var loop = function ( ) {
      // Increment 'x' (progress) towards 1, capping it at 1.
      x = Math.min(1, x + 0.05) ; // 0.05 controls the speed/granularity of the animation steps.
      var y = Math.min(1.0, formula(x)) ; // Calculate the eased value.

      if  ( endRatio === 0 ) {
        // If resetting, reverse the calculation to go back to 0 from the current position.
        y = Math.abs(startRatio) - y ;
      }