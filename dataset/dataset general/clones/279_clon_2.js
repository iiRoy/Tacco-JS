/*!
 * ---------------------------- SLIDEMANAGER JS -------------------------------------
 *
 * Version: 1.0.0
 * https://github.com/Stereobit/dragend (adapted from)
 * Copyright (c) 2014 Tobias Otte, t@stereob.it (adapted from)
 *
 * Licensed under MIT-style license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

 ;( function( globalScope ) {
  "use strict";

  // Aid the minifier by aliasing global objects
  var pageDoc = document,
      globalScopeRef = globalScope;

  function initializePlugin( jQ ) {

    // Greetings from SlideManager JS
    // =============================
    //
    // SlideManager.js is a touch-enabled, fully responsive, content panel navigation script.
    // It operates without external dependencies, but can optionally integrate with jQuery
    // (https://github.com/jquery/jquery/) as a plugin.
    //
    // The current build is 1.0.0
    //
    // How to Use
    // =============================
    //
    // To activate SlideManager JS, simply invoke the function on a jQuery element:
    //
    // $("#panel-host").slideManager();
    //
    // You can also provide an options object or a string to trigger specific actions:
    // "up", "down", "left", "right" for moving in these directions,
    // "panel" with a numeric argument to navigate to a specific panel,
    // or without any argument to return to the initial panel.
    //
    // Configuration Options
    // =====================
    //
    // The following settings are available:
    //
    // * panelClass: CSS class selector for all elements designated as panels.
    // * motionDirection: "across" (horizontal) or "updown" (vertical).
    // * minimumPullDistance: The smallest distance (in pixels) a user must pull
    //   to initiate a panel transition.
    // * extraSpace: Additional pixel value for spacing, often at the end.
    // * onSlideBegin: Callback invoked before a panel animation starts.
    // * onSlideFinish: Callback invoked after a panel animation completes.
    // * onPullBegin: Callback fired when a user starts dragging.
    // * onPullActive: Callback during active dragging.
    // * onPullRelease: Callback when dragging ends.
    // * interPanelGap: Pixel value for spacing between panels.
    // * animationTime: Duration of the panel transition animation in milliseconds.
    // * haltPropagation: If true, stops event propagation during interaction.
    // * postSetup: Callback executed after initial panel sizing.
    // * blockUserPull: If true, disables user interaction, allowing only programmatic navigation.

    var

      // Base configuration object
      coreOptions = {
        panelClass         : "slide-panel",
        motionDirection    : "across",
        minimumPullDistance: "40",
        onSlideBegin       : emptyFunc,
        onSlideFinish      : emptyFunc,
        onPullBegin        : emptyFunc,
        onPullActive       : emptyFunc,
        onPullRelease      : emptyFunc,
        postSetup          : emptyFunc,
        keyInputNav        : false,
        haltPropagation    : false,
        elementsPerPanel   : 1,
        extraSpace         : 0,
        interPanelGap      : 0,
        animationTime      : 300,
        blockUserPull      : false
      },

      hasTouchSupport = 'ontouchstart' in globalScopeRef,

      beginEvent = hasTouchSupport ? 'touchbegin' : 'pointerdown',
      trackEvent = hasTouchSupport ? 'touchtrack' : 'pointermove',
      releaseEvent = hasTouchSupport ? 'touchrelease' : 'pointerup',

      directionKeys = {
        37: "dir-west",
        38: "dir-north",
        39: "dir-east",
        40: "dir-south"
      },

      issueMsgs = {
        sections: "No content panels detected"
      },

      wrapperStyles = {
        overflow: "hidden",
        padding : 0
      },

      // Check for CSS property support across vendors
      featureSupport = (function() {
         var testElement = pageDoc.createElement('div'),
             prefixList = 'ms Moz O webkit khtml'.split(' '),
             prefixCount = prefixList.length;

         return function( cssProperty ) {
            if ( cssProperty in testElement.style ) return true;

            cssProperty = cssProperty.replace(/^[a-z]/, function(charVal) {
               return charVal.toUpperCase();
            });

            while( prefixCount-- ) {
               if ( prefixList[prefixCount] + cssProperty in testElement.style ) {
                  return true;
               }
            }
            return false;
         };
      })(),

      canTransform = featureSupport('transform');

    // An empty function, often used as a default callback
    function emptyFunc() {}

    // A function that always returns false
    function returnFalse() {
      return false;
    }

    // Applies a set of CSS properties to a given DOM element
    function applyCss( targetElement, cssProps ) {

      var cssKey,
          cssValue;

      for ( cssKey in cssProps ) {

        if ( cssProps.hasOwnProperty(cssKey) ) {
          cssValue = cssProps[cssKey];

          switch ( cssKey ) {
            case "height":
            case "width":
            case "marginLeft":
            case "marginTop":
              cssValue += "px";
          }

          targetElement.style[cssKey] = cssValue;

        }

      }

      return targetElement;

    }

    // Merges properties from a source object into a destination object
    function mergeObjects( targetObj, sourceObj ) {

      var cssKey;

      for ( cssKey in sourceObj ) {
        targetObj[cssKey] = sourceObj[cssKey];
      }

      return targetObj;

    }

    // Creates a new function with a pre-bound context
    function bindContext( callbackFunc, thisContext ) {

      return function() {
        return callbackFunc.apply( thisContext, [].slice.call(arguments) );
      };

    }

    // Finds elements by class name, optionally using jQuery
    function findElementsByClass( classString, searchRoot ) {
      var foundElements;

      if ( jQ ) {
        foundElements = jQ(searchRoot).find("." + classString);
      } else {
        foundElements = [].slice.call(searchRoot.getElementsByClassName( classString ));
      }

      return foundElements;
    }

    // Performs an animation, optionally using jQuery
    function performAnimation( targetElement, animProperty, finalValue, animSpeed, animCallback ) {
      var animProps = {};

      animProps[animProperty] = finalValue;

      if (jQ) {
        jQ(targetElement).animate(animProps, animSpeed, animCallback);
      } else {
        applyCss(targetElement, animProps);
      }

    }

    /**
     * Retrieves the coordinates from an event, normalizing for touch or mouse input.
     * @param {Object} eventObj The event object
     * @returns {Object} An object containing x and y coordinates
     */
    function getPointerPosition(eventObj) {
      // Touch track and touch release events might have different touch data structures
      var touchData = eventObj.touches,
          coordData = touchData && touchData.length ? touchData : eventObj.changedTouches;

      return {
        coordX: hasTouchSupport ? coordData[0].pageX : eventObj.pageX,
        coordY: hasTouchSupport ? coordData[0].pageY : eventObj.pageY
      };
    }

    // Main constructor for the SlideManager
    function SlideManager( mainWrapper, options ) {
      var initialOptionsCopy = mergeObjects( {}, coreOptions );

      this.options             = mergeObjects( initialOptionsCopy, options );
      this.mainWrapper         = mainWrapper;
      this.panelHost           = pageDoc.createElement( "div" );
      this.boundaryOffset      = { coordX: 0, coordY: 0 };
      this.currentPanelIndex   = 0;
      this.preventMovement     = false;
      this.panelStyleAttributes = {
        margin: 0
      };

      // Bind all necessary event handlers to the instance context
      this._handleBegin              = bindContext( this._handleBegin, this );
      this._handleTrack              = bindContext( this._handleTrack, this );
      this._handleRelease            = bindContext( this._handleRelease, this );
      this._handleKeyPress           = bindContext( this._handleKeyPress, this );
      this._adjustPanelSizes         = bindContext( this._adjustPanelSizes, this );
      this._postMovementTransform    = bindContext(this._postMovementTransform, this);

      this.panelHost.innerHTML = mainWrapper.cloneNode(true).innerHTML;
      mainWrapper.innerHTML = "";
      mainWrapper.appendChild( this.panelHost );

      this._moveView       = canTransform ? this._moveViewWithTransform : this._moveViewWithoutTransform;
      this._animateViewMove = canTransform ? this._animateViewMoveWithTransform : this._animateViewMoveWithoutTransform;

      // Initial CSS application
      applyCss(mainWrapper, wrapperStyles);

      // Allow the DOM to update before final setup
      setTimeout( bindContext(function() {
          this.refreshConfiguration( options );
          if (!this.options.blockUserPull) {
            this._setupListeners();
          }
          this.options.postSetup.call(this);
      }, this), 10 );

    }

    // Attaches an event listener to an element
    function attachEvent(targetElement, eventType, callbackFunc) {
      if (jQ) {
        jQ(targetElement).on(eventType, callbackFunc);
      } else {
        targetElement.addEventListener(eventType, callbackFunc, false);
      }
    }

    // Removes an event listener from an element
    function detachEvent(targetElement, eventType, callbackFunc) {
      if (jQ) {
        jQ(targetElement).off(eventType, callbackFunc);
      } else {
        targetElement.removeEventListener(eventType, callbackFunc, false);
      }
    }

    mergeObjects(SlideManager.prototype, {

      // Internal utility methods
      // =========================

      // ### Boundary Check for Overscrolling
      //
      // Determines if the current panel is at the beginning or end
      // to apply a "slow-down" effect during overscrolling.
      //
      // Accepts:
      // Movement direction and current coordinates

      _evaluateBoundary: function( moveDirection, coordX, coordY ) {
        var positionInfo = {
          coordX: coordX,
          coordY: coordY,
          exceedsLimit: true
        };

        switch ( moveDirection ) {

          case "dir-east": // Moving right
            if ( !this.boundaryOffset.coordX ) {
              positionInfo.coordX = Math.round((coordX - this.boundaryOffset.coordX) / 5 );
              return positionInfo;
            }
            break;

          case "dir-west": // Moving left
            if ( (this.totalPanels - 1) * this.panelDimensions.panelWidth <= this.boundaryOffset.coordX ) {
              positionInfo.coordX = Math.round( - ((Math.ceil(this.totalPanels) - 1) * (this.panelDimensions.panelWidth + this.options.interPanelGap)) + coordX / 5 );
              return positionInfo;
            }
            break;

          case "dir-south": // Moving down
            if ( !this.boundaryOffset.coordY ) {
              positionInfo.coordY = Math.round( (coordY - this.boundaryOffset.coordY) / 5 );
              return positionInfo;
            }
            break;

          case "dir-north": // Moving up
            if ( (this.totalPanels - 1) * this.panelDimensions.panelHeight <= this.boundaryOffset.coordY ) {
              positionInfo.coordY = Math.round( - ((Math.ceil(this.totalPanels) - 1) * (this.panelDimensions.panelHeight + this.options.interPanelGap)) + coordY / 5 );
              return positionInfo;
            }
            break;
        }

        return {
          coordX: coordX - this.boundaryOffset.coordX,
          coordY: coordY - this.boundaryOffset.coordY,
          exceedsLimit: false
        };
      },

      // Sets up event listeners for user interaction and window resizing
      _setupListeners: function() {

        attachEvent(this.mainWrapper, beginEvent, this._handleBegin);
        this.mainWrapper.onselectstart = returnFalse;
        this.mainWrapper.ondragstart = returnFalse;

        if ( this.options.keyInputNav ) {
          attachEvent(pageDoc.body, "keydown", this._handleKeyPress);
        }

        attachEvent(globalScopeRef, "resize", this._adjustPanelSizes);

      },

      // Handles the start of a pointer or touch event
      _handleBegin: function(eventObj) {

        eventObj = eventObj.originalEvent || eventObj;

        if (this.options.haltPropagation) {
          eventObj.stopPropagation();
        }

        attachEvent(pageDoc.body, trackEvent, this._handleTrack);
        attachEvent(pageDoc.body, releaseEvent, this._handleRelease);

        this.initialCoords = getPointerPosition(eventObj);

        this.options.onPullBegin.call( this, eventObj );

      },

      // Handles pointer or touch movement
      _handleTrack: function( eventObj ) {

        eventObj = eventObj.originalEvent || eventObj;

        // Prevent swiping with multiple touches or pinching gestures
        if ( eventObj.touches && eventObj.touches.length > 1 || eventObj.scale && eventObj.scale !== 1) return;

        eventObj.preventDefault();
        if (this.options.haltPropagation) {
          eventObj.stopPropagation();
        }

        var analyzedEvent = this._analyzeEvent(eventObj),
            positionInfo = this._evaluateBoundary( analyzedEvent.moveDirection , - analyzedEvent.deltaX, - analyzedEvent.deltaY );

        this.options.onPullActive.call( this, this.currentPanelElement, analyzedEvent, positionInfo.exceedsLimit, eventObj );

        if ( !this.preventMovement ) {
          this._moveView( positionInfo );
        }
      },

      // Handles the end of a pointer or touch event
      _handleRelease: function( eventObj ) {

        eventObj = eventObj.originalEvent || eventObj;

        if (this.options.haltPropagation) {
          eventObj.stopPropagation();
        }

        var analyzedEvent = this._analyzeEvent(eventObj);

        this.initialCoords = { coordX: 0, coordY: 0 };

        if ( Math.abs(analyzedEvent.deltaX) > this.options.minimumPullDistance || Math.abs(analyzedEvent.deltaY) > this.options.minimumPullDistance) {
          this.slide( analyzedEvent.moveDirection );
        } else if (Math.abs(analyzedEvent.deltaX) > 0 || Math.abs(analyzedEvent.deltaY) > 0) {
          this._navigateToPanel();
        }

        this.options.onPullRelease.call( this, this.mainWrapper, this.currentPanelElement, this.currentPanelIndex + 1, eventObj );

        detachEvent(pageDoc.body, trackEvent, this._handleTrack);
        detachEvent(pageDoc.body, releaseEvent, this._handleRelease);

      },

      // Parses event data to determine movement
      _analyzeEvent: function( eventObj ) {
        var currentPosition = getPointerPosition(eventObj),
            deltaX = this.initialCoords.coordX - currentPosition.coordX,
            deltaY = this.initialCoords.coordY - currentPosition.coordY;

        return this._computeMovementValues( deltaX, deltaY );
      },

      // Calculates movement distances and direction
      _computeMovementValues: function( deltaX, deltaY ) {
        var movementData = {
          deltaX: 0,
          deltaY: 0
        };

        if ( this.options.motionDirection === "across" ) {
          movementData.deltaX = deltaX;
          movementData.moveDirection = deltaX > 0 ? "dir-west" : "dir-east";
        } else {
          movementData.deltaY = deltaY;
          movementData.moveDirection = deltaY > 0 ? "dir-north" : "dir-south";
        }

        return movementData;
      },

      // Handles keyboard input for navigation
      _handleKeyPress: function( eventObj ) {
        var moveDirection = directionKeys[eventObj.keyCode];

        if ( moveDirection ) {
          this._navigateToPanel(moveDirection);
        }
      },

      // Sets CSS properties for horizontal panel layout
      _setAcrossWrapperCss: function() {
        mergeObjects( this.panelStyleAttributes, {
          "float"        : "left",
          "overflowVertical": "auto",
          "overflowHorizontal": "hidden",
          "padding"      : 0,
          "display"      : "block"
        });

        applyCss(this.panelHost, {
          "overflow"                   : "hidden",
          "width"                      : (this.panelDimensions.panelWidth + this.options.interPanelGap) * this.totalPanels,
          "boxModel"                   : "content-box",
          "-webkit-backface-visibility": "hidden",
          "-webkit-perspective"        : 1000,
          "margin"                     : 0,
          "padding"                    : 0
        });
      },

      // Sets CSS properties for vertical panel layout
      _setUpdownWrapperCss: function() {
        mergeObjects( this.panelStyleAttributes, {
          "overflow": "hidden",
          "padding" : 0,
          "display" : "block"
        });

        applyCss(this.panelHost, {
          "bottomPadding"               : this.options.extraSpace,