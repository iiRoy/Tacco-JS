/*
 * FocusLens 1.0.0 - jQuery extension
 * http://focuslens.io
 *
 * Copyright (c) 2012 John Doe (http://example.com)
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Designed for jQuery library
 * http://jquery.com
 *
 * Further enhancements and refactoring by Alex Smith ( alex@codesmith.org )
 * Logic has been optimized and restructured.
 *
 */

(function(jq) {

  // @object MagnifierState Object - Stores configuration and runtime data for each lens instance
  'use strict';
  let MagnifierState = {
    instanceTally : [],
    currentCoords : null
  };

  /**
   * @method     magnifyTool   Function    - jQuery plugin for enhanced viewing
   * @param      triggerEvt    String      - Event to activate the magnifier
   * @param      configOpts    object      - Object containing configuration options
   */
  jq.fn.magnifyTool = function (triggerEvt, configOpts) {


    // @variable initialSettings Object - Default options, overridden by user-provided configOpts
    const initialSettings = {
      magnifyDim    : 200,
      circularShape : true,
      shineEffect   : true,
      activatable   : false,
      dataAttribute : 'href',
      frameStyle    : '5px solid #999',
      magnifyStartCb: null,  // Callback when magnification initializes
      magnifyBeginCb: null, // Callback when magnification begins
      magnifyEndCb  : null, // Callback when magnification concludes
      staticPosition: false, // Display magnifier at a fixed screen location
      staticXCoord  : 0, // X-coordinate for static magnifier
      staticYCoord  : 0
    };

    // Merge default settings with user-provided options
    configOpts = jq.extend(initialSettings, configOpts);

    // Detect if device supports touch input
    const isTouchDevice = ( ( 'ontouchstart' in window ) || ( window.DocumentTouch && document instanceof DocumentTouch ) ) ? true : false;

    // Check for CSS transform support
    const transformSupport = ( function () {
      const bodyElem = document.body || document.documentElement;
      const styleProp = bodyElem.style;
      let prefixProp = 'transition';
      let vendorPrefixes;
      if ( typeof styleProp[prefixProp] === 'string' ) {
        return true;
      }

      // Test for vendor-specific prefixes
      vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
      prefixProp = prefixProp.charAt(0).toUpperCase() + prefixProp.substr(1);
      for ( let i = 0; i < vendorPrefixes.length; i++ ) {
        if ( typeof styleProp[vendorPrefixes[i] + prefixProp] === 'string' ) {
          return true;
        }
      }
      return false;
    } )();

    // Determine the primary activation event based on touch support
    const primaryAction = ( isTouchDevice ) ? 'touchstart' : 'click';


    /* @object      utilityMethods   Object      - Collection of helper functions for FocusLens
     * @method      coordinateHelpers   Object      - Position calculation utilities
     *
     * @method      boundaryCalc    Function    - Helps calculate boundary points for collision detection
     * @param       coordVal        Integer     - Thumbnail image's position
     * @param       sizeVal         Integer     - Size of the magnified element
     * @param       offsetVal       Integer     - Border size for offset
     * @param       stopVal         Integer     - Calculated stop position
     *
     * @method      cursorRelative  Function    - Calculates mouse position relative to the image
     * @param       pageCoord       Integer     - Offset from the page edge
     * @param       thumbOffset     Integer     - Offset from the thumbnail
     * @param       halfDim         Integer     - Half the dimension of the magnified element
     *
     * @method      lensPosition    Function    - Determines the position of the magnified element
     * @param       pageCoord       Integer     - Offset from the page edge
     * @param       elPosition      Integer     - Element's current position
     * @param       ratioVal        Integer     - Magnification ratio
     * @param       halfDim         Integer     - Half the dimension of the magnified element
     * @param       offsetVal       Integer     - Border size for offset
     *
     */
    const utilityMethods = {
      coordinateHelpers: {
        boundaryCalc: function ( coordVal, sizeVal, offsetVal, stopVal ) {
          return ( coordVal - sizeVal - offsetVal ) + stopVal;
        },
        cursorRelative: function ( pageCoord, thumbOffset, halfDim ) {
          return pageCoord - thumbOffset - halfDim;
        },
        lensPosition: function ( pageCoord, elPosition, ratioVal, halfDim, offsetVal ) {
          return ( ( pageCoord - elPosition ) / ratioVal ) - halfDim + offsetVal;
        }
      },
      /* @method  styleCompiler   Function  - Generates a CSS object from an array of properties
       */
      styleCompiler: function(styleProps){

        if ( typeof styleProps !== 'undefined' && styleProps.length > 0 ) {

          if ( configOpts.staticPosition ) {
            styleProps[2] = configOpts.staticXCoord;
            styleProps[3] = configOpts.staticYCoord;
          }

          const translate = 'translate3d(' + styleProps[2] + 'px, ' + styleProps[3] + 'px, 0)';
          const movement  = ( transformSupport ) ? {
            '-webkit-transform'   : translate,
            '-moz-transform'      : translate,
            '-ms-transform'       : translate,
            '-o-transform'        : translate,
            'transform'           : translate
          } : {
            'top'   : styleProps[3] + 'px',
            'left'  : styleProps[2] + 'px'
          };

          return jq.extend( { 'backgroundPosition'  : '-' + styleProps[0] + 'px ' + '-' + styleProps[1] + 'px' }, movement );
        } else {
          return {};
        }
      },
      // Calculates the aspect ratio
      aspectRatio: function(dim1, dim2){
        return dim1 / dim2;
      },
      // Sets up various parameters for a given magnifier instance
      configureParameters: function(magnifierEl){

        const instanceId = magnifierEl.attr('rel');

        MagnifierState[instanceId].dimensions         = {};
        MagnifierState[instanceId].dimensions.full    = configOpts.magnifyDim + ( MagnifierState[instanceId].lens.frameWidth * 2 );
        MagnifierState[instanceId].dimensions.half    = MagnifierState[instanceId].dimensions.full / 2;
        MagnifierState[instanceId].dimensions.ratioX  = utilityMethods.aspectRatio( MagnifierState[instanceId].visual.width, MagnifierState[instanceId].lens.x );
        MagnifierState[instanceId].dimensions.ratioY  = utilityMethods.aspectRatio( MagnifierState[instanceId].visual.height, MagnifierState[instanceId].lens.y );
        MagnifierState[instanceId].dimensions.lensX   = MagnifierState[instanceId].lens.x - MagnifierState[instanceId].dimensions.full;
        MagnifierState[instanceId].dimensions.lensY   = MagnifierState[instanceId].lens.y - MagnifierState[instanceId].dimensions.full;

        MagnifierState[instanceId].limits         = {};
        MagnifierState[instanceId].limits.primary = MagnifierState[instanceId].dimensions.half - ( MagnifierState[instanceId].dimensions.half * MagnifierState[instanceId].dimensions.ratioX ) - ( MagnifierState[instanceId].lens.frameWidth * MagnifierState[instanceId].dimensions.ratioX ) + MagnifierState[instanceId].lens.frameWidth;
        MagnifierState[instanceId].limits.right   = utilityMethods.coordinateHelpers.boundaryCalc( MagnifierState[instanceId].visual.width, MagnifierState[instanceId].dimensions.full, MagnifierState[instanceId].lens.frameWidth, MagnifierState[instanceId].limits.primary );
        MagnifierState[instanceId].limits.bottom  = utilityMethods.coordinateHelpers.boundaryCalc( MagnifierState[instanceId].visual.height, MagnifierState[instanceId].dimensions.full, MagnifierState[instanceId].lens.frameWidth, MagnifierState[instanceId].limits.primary );
      }
    };

    /* @object  interactionLogic  Object    - Manages events that directly affect visual elements
     *
     * @method  overlapDetector Function  - Checks for boundary collisions
     * @param   pointerX        Integer   - X-coordinate of the pointer
     * @param   pointerY        Integer   - Y-coordinate of the pointer
     * @param   instanceData    Object    - Data for the current magnifier instance
     *
     * @method  positionCases   Function  - Provides an array of coordinates for different collision scenarios
     * @param   caseIndex       Integer   - Index representing the collision case
     * @param   instanceData    Object    - Data for the current magnifier instance
     * @param   backgroundX     Integer   - X-coordinate for the background image position
     * @param   backgroundY     Integer   - Y-coordinate for the background image position
     * @param   pointerX        Integer   - X-coordinate of the pointer
     * @param   pointerY        Integer   - Y-coordinate of the pointer
     *
     * @method  shiftLens       Function  - Calculates and applies movement for the magnified element
     * @param   targetEl        Object    - The main element (e.g., an anchor wrapping an image)
     * @param   magnifierEl     Object    - The magnified display element
     * @param   evtObj          Object    - The event object (e.g., mousemove or touchmove)
     *
     * @method  styleToggle     Function  - Toggles CSS classes on the main element
     * @param   targetEl        Object    - The main element
     *
     * @method  activateLens    Function  - Handles the initiation of magnification
     * @param   targetEl        Object    - The main element
     * @param   magnifierEl     Object    - The magnified display element
     *
     * @method  deactivateLens  Function  - Manages the cessation of magnification
     * @param   targetEl        Object    - The main element
     * @param   magnifierEl     Object    - The magnified display element
     * @param   flag            Integer   - A flag indicating the state of the magnifier
     *
     * @method  executeCallback Function  - Executes a provided callback function
     * @param   cbType          Function  - The actual callback function to be invoked
     * @param   magnifierEl     Object    - The magnified element to extract data from
     */
    const interactionLogic = {

      overlapDetector: function(pointerX, pointerY, instanceData){

        // Test for boundary collisions
        const conditionA   = -instanceData.limits.primary <= pointerX;
        const conditionE2  = -instanceData.limits.primary > pointerX;
        const conditionB   = -instanceData.limits.primary <= pointerY;
        const conditionF   = -instanceData.limits.primary > pointerY;
        const conditionD   = instanceData.limits.bottom > pointerY;
        const conditionG   = instanceData.limits.bottom <= pointerY;
        const conditionC   = instanceData.limits.right > pointerX;
        const conditionJ   = instanceData.limits.right <= pointerX;

        // Results of collision detection, mapping to specific regions
        return ( conditionA && conditionB && conditionC && conditionD ) ? 0 : ( conditionE2 ) ? ( conditionB && conditionD ) ? 1 : ( conditionF ) ? 2 : ( conditionG ) ? 3 : null : ( conditionF ) ? ( conditionC ) ? 4 : 5 : ( conditionJ ) ? ( conditionD ) ? 6 : 7 : ( conditionG ) ? 8 : null;

      },

      positionCases: function(caseIndex, instanceData, backgroundX, backgroundY, pointerX, pointerY){

        const caseFunctions = {
          // In the central area
          0 : [backgroundX, backgroundY, pointerX, pointerY],

          // On the left side
          1 : [0, backgroundY, -instanceData.limits.primary, pointerY],

          // Top-left corner
          2 : [0, 0, -instanceData.limits.primary, -instanceData.limits.primary],

          // Bottom-left corner
          3 : [0, instanceData.dimensions.lensY, -instanceData.limits.primary, instanceData.limits.bottom],

          // Along the top edge
          4 : [backgroundX, 0, pointerX, -instanceData.limits.primary],

          // Top-right corner
          5 : [instanceData.dimensions.lensX, 0, instanceData.limits.right, -instanceData.limits.primary],

          // On the right side
          6 : [instanceData.dimensions.lensX, backgroundY, instanceData.limits.right, pointerY],

          // Bottom-right corner
          7 : [instanceData.dimensions.lensX, instanceData.dimensions.lensY, instanceData.limits.right, instanceData.limits.bottom],

          // Along the bottom edge
          8 : [backgroundX, instanceData.dimensions.lensY, pointerX, instanceData.limits.bottom]
        };

        return caseFunctions[caseIndex];

      },

      // Relocates the magnification cursor
      shiftLens: function (targetEl, magnifierEl, evtObj) {

        // Retrieve instance data to avoid re-calculating variables
        const instanceId    = magnifierEl.attr('rel');
        const targetOffset  = targetEl.offset();
        const instanceData  = MagnifierState[instanceId];
        const verticalShift = ( isTouchDevice ) ? -70 : 0;

        // Only dynamic variables
        const pointerX      = utilityMethods.coordinateHelpers.cursorRelative( evtObj.pageX, targetOffset.left , instanceData.dimensions.half );
        const pointerY      = utilityMethods.coordinateHelpers.cursorRelative( evtObj.pageY + verticalShift, targetOffset.top, instanceData.dimensions.half );
        const backgroundX   = utilityMethods.coordinateHelpers.lensPosition( evtObj.pageX, targetOffset.left, instanceData.dimensions.ratioX, instanceData.dimensions.half, MagnifierState[instanceId].lens.frameWidth );
        const backgroundY   = utilityMethods.coordinateHelpers.lensPosition( evtObj.pageY + verticalShift, targetOffset.top , instanceData.dimensions.ratioY, instanceData.dimensions.half, MagnifierState[instanceId].lens.frameWidth );

        const collisionCaseIndex = interactionLogic.overlapDetector( pointerX, pointerY, instanceData );

        // Compile CSS object to move the magnified element
        const computedStyle = utilityMethods.styleCompiler( interactionLogic.positionCases( collisionCaseIndex, instanceData, backgroundX, backgroundY, pointerX, pointerY ) );
        // Uncomment to see Index number for collision type
        // console.log(collisionCaseIndex);
        // Apply the computed style
        magnifierEl.css(computedStyle);

      },

      // Adjusts classes for the original image's visual effect
      styleToggle: function (targetEl) {
        const idx = targetEl.find('.magnifyTool').attr('rel');
        if ( MagnifierState[idx].status === 0 || MagnifierState[idx].status === null ) {
          targetEl.removeClass('inactive');
        } else {
          targetEl.addClass('inactive');
        }
      },

      // Initiates magnification when entering the target area
      activateLens: function (targetEl, magnifierEl) {
        const idx = magnifierEl.attr('rel');
        MagnifierState[idx].status = 1;
        magnifierEl.css('visibility', 'visible');
        interactionLogic.styleToggle(targetEl);
      },

      // Ends magnification when leaving the target area
      deactivateLens: function (targetEl, magnifierEl, flag) {
        const idx = magnifierEl.attr('rel');
        if ( flag !== null ) {
          MagnifierState[idx].status = null;
        } else {
          MagnifierState[idx].status = 0;
        }
        magnifierEl.css('visibility', 'hidden');
        interactionLogic.styleToggle(targetEl);
      },

      // Handles the execution of user-defined callbacks
      executeCallback: function (cbType, magnifierEl) {
        const callbackFunc = cbType;
        const magnifierId = magnifierEl.attr('rel');

        if ( callbackFunc !== null && typeof callbackFunc === 'function' ) {

          callbackFunc( jq.extend( {}, MagnifierState[magnifierId], MagnifierState.currentCoords ) );

        }

      }


    };

    // Styling Object, holds most visual properties
    const appearanceManager = {

      // Calculates border-radius for rounded or square shapes
      getBorderRadius: function (arg1, arg2) {
        return ( !configOpts.circularShape ) ? 0 : ( arg1 === undefined ) ? '100%' : configOpts.magnifyDim / 2 + 'px ' + configOpts.magnifyDim / 2 + 'px 0px 0px';
      },

      // Applies a glare effect to the magnifier
      applyShineEffect: function (magnifierEl) {
        magnifierEl
          .children('span')
          .css({
            height          : configOpts.magnifyDim / 2,
            width           : configOpts.magnifyDim - 10,
            margin          : '5px auto',
            'border-radius' : appearanceManager.getBorderRadius(0)
          });
      },

      // Parses and returns border style and width
      getFrameStyle: function (magnifierEl) {

        const rawFrame    = configOpts.frameStyle.replace(/^\s*|\s*$/g,'');
        const frameParts  = rawFrame.split(' ');
        const numVal      = parseFloat(frameParts[0]);
        const frameWidth  = ( frameParts.length > 2 && numVal * 1 === numVal ) ? numVal : 0;

        return [rawFrame, frameWidth];
      },

      // Applies appropriate styling to the elements
      configureAppearance: function (targetEl, magnifierEl) {
        const imageEl           = targetEl.children('img');

        // Parse border properties
        const borderDetails     = appearanceManager.getFrameStyle(magnifierEl);

        // Margin properties
        const spacing           = {
          'marginTop'     : imageEl.css('margin-top'),
          'marginRight'   : imageEl.css('margin-right'),
          'marginBottom'  : imageEl.css('margin-bottom'),
          'marginLeft'    : imageEl.css('margin-left')
        };

        // Float properties
        const positioning       = {
          'float': imageEl.css('float')
        };

        // Minimum styles for magnifier functionality
        const baseStyling       = {
          'display': 'block',
          height: imageEl.height(),
          width: imageEl.width(),
          'position': 'relative'
        };

        // Check parent's text alignment for centering
        const checkParentAlignment = function () {

          const alignmentString = targetEl.parent('*:first').css('text-align');
          if ( alignmentString === 'center' ) {
            spacing.marginRight = 'auto';
            spacing.marginLeft  = 'auto';
          }

        };

        const instanceId  = magnifierEl.attr('rel');
        const computedCss = {};

        if ( positioning['float'] === 'none' ) {
          checkParentAlignment();
        }

        jq.extend( computedCss, spacing, positioning, baseStyling );

        MagnifierState[instanceId].visual = computedCss;

        if ( !configOpts.shineEffect ) {
          if ( configOpts.staticPosition ) {
            magnifierEl.children('span').css({
              height  : configOpts.magnifyDim - 10,
              width   : configOpts.magnifyDim - 10
            });
          } else {
            magnifierEl.children('span').css({
              height  : configOpts.magnifyDim - 10,
              width   : configOpts.magnifyDim - 10
            });
          }

        }

        if ( configOpts.staticPosition ) {
          magnifierEl.css({
            height          : configOpts.magnifyDim,
            width           : configOpts.magnifyDim,
            top             : 0,
            left            : 0,
            'border-radius' : appearanceManager.getBorderRadius(undefined, borderDetails[1]),
            border          : borderDetails[0]
          });
        } else {
          magnifierEl.css({
            height          : configOpts.magnifyDim,
            width           : configOpts.magnifyDim,
            top             : 0,
            left            : 0,
            'border-radius' : appearanceManager.getBorderRadius(undefined, borderDetails[1]),
            border          : borderDetails[0]
          });
        }

        imageEl.css('margin', '0px');
        imageEl.one("load", function () {

          targetEl.css(MagnifierState[instanceId].visual);

          if ( targetEl.parent('.magnifyTool-wrap').length ) {
            targetEl.parent('.magnifyTool-wrap').css(MagnifierState[instanceId].visual);
          }

        }).each(function () {
          if ( this.complete ) {
            jq(this).trigger("load");
          }
        });

      }


    };

    // Element Constructor Object, elements are added to the DOM here
    const elementConstructor = {

      // Loads the image for magnification
      loadImageAsset: function (imageSource, magnifierEl, callback) {
        const instanceId = magnifierEl.attr('rel');

        // Move the magnifier out of view while loading the image
        magnifierEl.show().css({top:'-9999px', left: '-9999px'});

        if ( magnifierEl.find('img').attr('src') !== imageSource ) {
          magnifierEl.find('img').attr('src', imageSource).load(function () {

            const assetsToAdd   = ( configOpts.shineEffect ) ? '<span/>' : '';
            const borderDetails = appearanceManager.getFrameStyle(magnifierEl);


            MagnifierState[instanceId].lens = {
              'x'         : magnifierEl.find('img').width(),
              'y'         : magnifierEl.find('img').height(),
              'frameWidth': borderDetails[1]
            };

            magnifierEl.append(assetsToAdd)
              .css({
                'background-image': 'url(' + imageSource + ')',
                top: '0px',
                left: '0px',
                visibility: 'hidden'
              })
              .find('img')
              .remove();

            appearanceManager.applyShineEffect(magnifierEl);
            utilityMethods.configureParameters(magnifierEl);
            callback();

          }).each(function () {

            if ( this.complete ) {

              jq(this).trigger("load");

            }
          });

        }
      },

      // Adds the magnification element to the page
      createMagnifyElement: function (targetEl, idx) {

        // Initialize state for this instance
        MagnifierState[idx] = {
          status: null,
          index : idx
        };

        MagnifierState.instanceTally.push(0);

        // Determine image source from the correct attribute
        const imageSource = ( typeof ( targetEl.attr(configOpts.dataAttribute) ) === 'string' && configOpts.dataAttribute !== 'href' ) ? targetEl.attr(configOpts.dataAttribute) : targetEl.attr('href');
        let magnifierEl = null;
        const initializationCallback = configOpts.magnifyStartCb;
        const actionHandler = function () {

          const startCallback = configOpts.magnifyBeginCb;
          const endCallback   = configOpts.magnifyEndCb;

          // Event listener for mouse/touch movement
          const moveListener = function (evtObj) {
            interactionLogic.shiftLens(targetEl, magnifierEl, evtObj);
            MagnifierState.currentCoords = {
              x : evtObj.pageX,
              y : evtObj.pageY
            };
          };

          // Event listener for mouse/touch entering the area
          const enterListener = function () {
            interactionLogic.activateLens(targetEl, magnifierEl);
            interactionLogic.executeCallback(startCallback, magnifierEl);
          };

          // Event listener for mouse/touch leaving the area
          const leaveListener = function () {
            interactionLogic.deactivateLens(targetEl, magnifierEl, null);
            interactionLogic.executeCallback(endCallback, magnifierEl);
          };

          if ( configOpts.activatable ) {
            // If activatable, only show on click/tap
            targetEl.on(primaryAction + '.magnifyTool', function (evt) {
              evt.preventDefault();
              if ( MagnifierState[idx].status === 0 || MagnifierState[idx].status === null ) {
                enterListener();
                targetEl.on('mousemove.magnifyTool touchmove.magnifyTool', moveListener);
              } else {
                leaveListener();
                targetEl.off('mousemove.magnifyTool touchmove.magnifyTool', moveListener);
              }
            });
          } else {
            // Default behavior: show on hover/touch
            targetEl.on('mouseenter.magnifyTool touchstart.magnifyTool', enterListener)
                    .on('mousemove.magnifyTool touchmove.magnifyTool', moveListener)
                    .on('mouseleave.magnifyTool touchend.magnifyTool', leaveListener);
          }
        };

        // Create the magnifier element and wrap the target image
        magnifierEl = jq('<div class="magnifyTool" rel="' + idx + '"><img src="' + imageSource + '" /></div>');

        targetEl.wrap('<div class="magnifyTool-wrap" rel="' + idx + '" />');
        jq('.magnifyTool-wrap[rel="' + idx + '"]').append(magnifierEl);

        // Apply initial styling
        appearanceManager.configureAppearance(targetEl, magnifierEl);

        // Load the image for the magnifier
        elementConstructor.loadImageAsset(imageSource, magnifierEl, function () {
          interactionLogic.executeCallback(initializationCallback, magnifierEl);
          actionHandler(); // Set up event handlers after image is loaded
        });
      }
    };

    // Iterate over each selected element
    return this.each(function (idx) {
      const targetEl = jq(this);
      elementConstructor.createMagnifyElement(targetEl, idx);
    });
  };
})(jQuery);