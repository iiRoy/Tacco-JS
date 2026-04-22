/*
 * popnote.js - A jQuery plugin for generating interactive pop-up notes.
 *
 * Copyright (c) 2023 Acme Corp
 * https://acmecorp.com
 *
 * Licensed under Apache 2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Initiated : September 2023
 * Build     : 2.1.0-beta
 * Released  : Monday 1st January, 2024 - 10:00
 * Minified: popnote.min.js
 */
( function( jQ )
{
   // Core widget functionality
   jQ.fn.hintbox = function( settings, globalAction )
   {
      var idx, itemKey, toolHandles, mergedConfig, widgetRef, instruction, elemSettings, instanceApi;

      // Handle API command requests
      if ( typeof settings == 'string' )
      {
         // Verify widget data presence
         if( typeof jQ( this ).data( 'hintbox' ) !== 'object' )
            jQ.fn.hintbox.logger.issue.call( this, 1, jQ.fn.hintbox.enums.NO_WIDGET_FOUND, false );

         // Retrieve specific object
         if ( settings == 'api' )
            return jQ( this ).data( 'hintbox' ).widgetHandles[ jQ( this ).data( 'hintbox' ).activeHandle ];
         else if ( settings == 'handles' )
            return jQ( this ).data( 'hintbox' ).widgetHandles;
      }

      // Process new widget creation requests
      else
      {
         // Ensure settings object is initialized
         if ( !settings ) settings = {};

         // Cleanse and normalize configuration options
         if ( typeof settings.mainContent !== 'object' || ( settings.mainContent.jquery && settings.mainContent.length > 0 ) ) settings.mainContent = { displayText: settings.mainContent };
         if ( typeof settings.mainContent.headerText !== 'object' ) settings.mainContent.headerText = { displayText: settings.mainContent.headerText };
         if ( typeof settings.placement !== 'object' ) settings.placement = { anchorPoint: settings.placement };
         if ( typeof settings.placement.anchorPoint !== 'object' ) settings.placement.anchorPoint = { focusElement: settings.placement.anchorPoint, widgetElement: settings.placement.anchorPoint };
         if ( typeof settings.display !== 'object' ) settings.display = { triggerConditions: settings.display };
         if ( typeof settings.display.triggerConditions !== 'object' ) settings.display.triggerConditions = { triggerEvent: settings.display.triggerConditions };
         if ( typeof settings.display.animationSettings !== 'object' ) settings.display.animationSettings = { motionType: settings.display.animationSettings };
         if ( typeof settings.conceal !== 'object' ) settings.conceal = { triggerConditions: settings.conceal };
         if ( typeof settings.conceal.triggerConditions !== 'object' ) settings.conceal.triggerConditions = { triggerEvent: settings.conceal.triggerConditions };
         if ( typeof settings.conceal.animationSettings !== 'object' ) settings.conceal.animationSettings = { motionType: settings.conceal.animationSettings };
         if ( typeof settings.visuals !== 'object' ) settings.visuals = { name: settings.visuals };
         settings.visuals = normalizeDisplay( settings.visuals );

         // Combine user settings with defaults
         mergedConfig = jQ.extend( true, {}, jQ.fn.hintbox.defaultOptions, settings );

         // Inherit styling properties
         mergedConfig.visuals = composeDisplay.call( { options: mergedConfig }, mergedConfig.visuals );
         mergedConfig.user = jQ.extend( true, {}, settings );
      }

      // Process each selected DOM element
      return jQ( this ).each( function() // Adhere to jQuery's chainability conventions
      {
         // Check if a string command was provided
         if ( typeof settings == 'string' )
         {
            instruction = settings.toLowerCase();
            toolHandles = jQ( this ).hintbox( 'handles' );

            // Ensure widget data exists for API calls
            if( typeof toolHandles == 'object' )
            {
               // Handle global destroy command
               if( globalAction === true && instruction == 'destroy' )
                  while( toolHandles.length > 0 ) toolHandles[ toolHandles.length - 1 ].destroy();

               // Handle specific API commands
               else
               {
                  // Limit scope to current widget if not global
                  if( globalAction !== true ) toolHandles = [ jQ( this ).hintbox( 'api' ) ];

                  // Execute command on relevant widgets
                  for( idx = 0; idx < toolHandles.length; idx++ )
                  {
                     // Destruction does not require rendering
                     if( instruction == 'destroy' ) toolHandles[ idx ].destroy();

                     // Other API calls require the widget to be rendered
                     else if( toolHandles[ idx ].currentState.isDisplayed === true )
                     {
                        if( instruction == 'show' ) toolHandles[ idx ].show();
                        else if( instruction == 'hide' ) toolHandles[ idx ].hide();
                        else if( instruction == 'focus' ) toolHandles[ idx ].focus();
                        else if( instruction == 'disable' ) toolHandles[ idx ].disable( true );
                        else if( instruction == 'enable' ) toolHandles[ idx ].disable( false );
                     }
                  }
               }
            }
         }

         // No API command, proceed with widget creation
         else
         {
            // Create a unique configuration for this instance
            elemSettings = jQ.extend( true, {}, mergedConfig );
            elemSettings.conceal.animationSettings.durationMs = mergedConfig.conceal.animationSettings.durationMs;
            elemSettings.display.animationSettings.durationMs = mergedConfig.display.animationSettings.durationMs;

            // Normalize target elements
            if( elemSettings.placement.container === false ) elemSettings.placement.container = jQ( document.body );
            if( elemSettings.placement.focusElement === false ) elemSettings.placement.focusElement = jQ( this );
            if( elemSettings.display.triggerConditions.focusElement === false ) elemSettings.display.triggerConditions.focusElement = jQ( this );
            if( elemSettings.conceal.triggerConditions.focusElement === false ) elemSettings.conceal.triggerConditions.focusElement = jQ( this );

            // Determine widget identifier (reusing available slots)
            itemKey = jQ.fn.hintbox.widgetHandles.length;
            for( idx = 0; idx < itemKey; idx++ )
            {
               if( typeof jQ.fn.hintbox.widgetHandles[ idx ] == 'undefined' ){ itemKey = idx; break; }
            }

            // Instantiate the new widget object
            widgetRef = new PopNoteBuilder( jQ( this ), elemSettings, itemKey );

            // Store API reference globally
            jQ.fn.hintbox.widgetHandles[ itemKey ] = widgetRef;

            // Check if element already has widget data
            if( typeof jQ( this ).data( 'hintbox' ) == 'object' )
            {
               // Assign new active interface ID
               if( typeof jQ( this ).attr( 'popnote' ) === 'undefined' )
                  jQ( this ).data( 'hintbox' ).activeHandle = jQ( this ).data( 'hintbox' ).widgetHandles.length;

               // Add new API interface to element's array
               jQ( this ).data( 'hintbox' ).widgetHandles.push( widgetRef );
            }

            // No widget data present, create it now
            else jQ( this ).data( 'hintbox', { activeHandle: 0, widgetHandles: [ widgetRef ] } );

            // If pre-building is disabled, create widget on trigger event
            if( elemSettings.mainContent.prebuild === false && elemSettings.display.triggerConditions.triggerEvent !== false && elemSettings.display.isReady !== true )
            {
               elemSettings.display.triggerConditions.focusElement.bind( elemSettings.display.triggerConditions.triggerEvent + '.hintbox-' + itemKey + '-create', { widgetId: itemKey }, function( evt )
               {
                  // Retrieve API interface using the widget ID
                  instanceApi = jQ.fn.hintbox.widgetHandles[ evt.data.widgetId ];

                  // Unbind the show event and cache mouse coordinates
                  instanceApi.options.display.triggerConditions.focusElement.unbind( instanceApi.options.display.triggerConditions.triggerEvent + '.hintbox-' + evt.data.widgetId + '-create' );
                  instanceApi.dataStore.cursorPos = { xCoord: evt.pageX, yCoord: evt.pageY };

                  // Render and initiate event sequence
                  setupHintBox.call( instanceApi );
                  instanceApi.options.display.triggerConditions.focusElement.trigger( instanceApi.options.display.triggerConditions.triggerEvent );
               });
            }

            // Pre-building is enabled, create widget immediately
            else
            {
               // Cache mouse position to top-left of the target element
               widgetRef.dataStore.cursorPos = {
                  xCoord: elemSettings.display.triggerConditions.focusElement.offset().left,
                  yCoord: elemSettings.display.triggerConditions.focusElement.offset().top
               };

               // Construct the widget
               setupHintBox.call( widgetRef );
            }
         }
      });
   };

   // Widget Constructor
   function PopNoteBuilder( targetElem, widgetOptions, widgetId )
   {
      // Self-reference for scope
      var thisInstance = this;

      // Initialize core properties
      thisInstance.id = widgetId;
      thisInstance.options = widgetOptions;
      thisInstance.currentState = {
         isAnimating: false,
         isDisplayed: false,
         isDisabled: false,
         isFocused: false
      };
      thisInstance.domElements = {
         focusElement: targetElem.addClass( thisInstance.options.visuals.cssClasses.focusElement ),
         widgetElement: null,
         containerWrap: null,
         mainContent: null,
         contentContainer: null,
         headerText: null,
         closeButton: null,
         pointerArrow: null,
         iframeShim: null
      };
      thisInstance.dataStore = {
         cursorPos: {},
         placement: {},
         visibilityState: 0
      };
      thisInstance.delayTimers = {};

      // Extend with exposed API methods
      jQ.extend( thisInstance, thisInstance.options.api,
      {
         show: function( evt )
         {
            var eventResult, exclusiveTarget;

            // Ensure widget is rendered; if not, exit
            if( !thisInstance.currentState.isDisplayed )
               return jQ.fn.hintbox.logger.issue.call( thisInstance, 2, jQ.fn.hintbox.enums.WIDGET_NOT_DISPLAYED, 'show' );

            // Proceed only if widget is currently hidden
            if( thisInstance.domElements.widgetElement.css( 'display' ) !== 'none' ) return thisInstance;

            // Clear any pending animations
            thisInstance.domElements.widgetElement.stop( true, false );

            // Execute pre-display callback; halt if it returns false
            eventResult = thisInstance.onBeforeDisplay.call( thisInstance, evt );
            if( eventResult === false ) return thisInstance;

            // Define post-display callback
            function onAfterDisplayCallback()
            {
               // Call API method and focus if not static
               if( thisInstance.options.placement.motionType !== 'static' ) thisInstance.focus();
               thisInstance.onAfterDisplay.call( thisInstance, evt );

               // Address IE7 filter bug
               if( jQ.browser.msie ) thisInstance.domElements.widgetElement.get( 0 ).style.removeAttribute( 'filter' );
            }

            // Update visibility state
            thisInstance.dataStore.visibilityState = 1;

            // Recalculate position if not static
            if( thisInstance.options.placement.motionType !== 'static' )
               thisInstance.recalculatePlacement( evt, ( thisInstance.options.display.animationSettings.durationMs > 0 ) );

            // Handle exclusive display mode
            if( typeof thisInstance.options.display.exclusiveMode == 'object' ) exclusiveTarget = jQ( thisInstance.options.display.exclusiveMode );
            else if( thisInstance.options.display.exclusiveMode === true ) exclusiveTarget = jQ( 'div.hintbox' ).not( thisInstance.domElements.widgetElement );
            if( exclusiveTarget ) exclusiveTarget.each( function(){ if( jQ( this ).hintbox( 'api' ).currentState.isDisplayed === true ) jQ( this ).hintbox( 'api' ).hide(); });

            // Animate widget display
            if( typeof thisInstance.options.display.animationSettings.motionType == 'function' )
            {
               thisInstance.options.display.animationSettings.motionType.call( thisInstance.domElements.widgetElement, thisInstance.options.display.animationSettings.durationMs );
               thisInstance.domElements.widgetElement.queue( function(){ onAfterDisplayCallback(); jQ( this ).dequeue(); } );
            }
            else
            {
               switch( thisInstance.options.display.animationSettings.motionType.toLowerCase() )
               {
                  case 'fade':
                     thisInstance.domElements.widgetElement.fadeIn( thisInstance.options.display.animationSettings.durationMs, onAfterDisplayCallback );
                     break;
                  case 'slide':
                     thisInstance.domElements.widgetElement.slideDown( thisInstance.options.display.animationSettings.durationMs, function()
                     {
                        onAfterDisplayCallback();
                        if( thisInstance.options.placement.motionType !== 'static' ) thisInstance.recalculatePlacement( evt, true );
                     });
                     break;
                  case 'grow':
                     thisInstance.domElements.widgetElement.show( thisInstance.options.display.animationSettings.durationMs, onAfterDisplayCallback );
                     break;
                  default:
                     thisInstance.domElements.widgetElement.show( null, onAfterDisplayCallback );
                     break;
               }

               // Apply active class
               thisInstance.domElements.widgetElement.addClass( thisInstance.options.visuals.cssClasses.isActive );
            }

            // Log event and return instance
            return jQ.fn.hintbox.logger.issue.call( thisInstance, 1, jQ.fn.hintbox.enums.DISPLAY_TRIGGERED, 'show' );
         },

         hide: function( evt )
         {
            var eventResult;

            // Ensure widget is rendered; if not, exit
            if( !thisInstance.currentState.isDisplayed )
               return jQ.fn.hintbox.logger.issue.call( thisInstance, 2, jQ.fn.hintbox.enums.WIDGET_NOT_DISPLAYED, 'hide' );

            // Proceed only if widget is currently visible
            else if( thisInstance.domElements.widgetElement.css( 'display' ) === 'none' ) return thisInstance;

            // Stop display timer and animation queue
            clearTimeout( thisInstance.delayTimers.show );
            thisInstance.domElements.widgetElement.stop( true, false );

            // Execute pre-conceal callback; halt if it returns false
            eventResult = thisInstance.onBeforeConceal.call( thisInstance, evt );
            if( eventResult === false ) return thisInstance;

            // Define post-conceal callback
            function onAfterConcealCallback(){ thisInstance.onAfterConceal.call( thisInstance, evt ); }

            // Update visibility state
            thisInstance.dataStore.visibilityState = 0;

            // Animate widget concealment
            if( typeof thisInstance.options.conceal.animationSettings.motionType == 'function' )
            {
               thisInstance.options.conceal.animationSettings.motionType.call( thisInstance.domElements.widgetElement, thisInstance.options.conceal.animationSettings.durationMs );
               thisInstance.domElements.widgetElement.queue( function(){ onAfterConcealCallback(); jQ( this ).dequeue(); } );
            }
            else
            {
               switch( thisInstance.options.conceal.animationSettings.motionType.toLowerCase() )
               {
                  case 'fade':
                     thisInstance.domElements.widgetElement.fadeOut( thisInstance.options.conceal.animationSettings.durationMs, onAfterConcealCallback );
                     break;
                  case 'slide':
                     thisInstance.domElements.widgetElement.slideUp( thisInstance.options.conceal.animationSettings.durationMs, onAfterConcealCallback );
                     break;
                  case 'grow':
                     thisInstance.domElements.widgetElement.hide( thisInstance.options.conceal.animationSettings.durationMs, onAfterConcealCallback );
                     break;
                  default:
                     thisInstance.domElements.widgetElement.hide( null, onAfterConcealCallback );
                     break;
               }

               // Remove active class
               thisInstance.domElements.widgetElement.removeClass( thisInstance.options.visuals.cssClasses.isActive );
            }

            // Log event and return instance
            return jQ.fn.hintbox.logger.issue.call( thisInstance, 1, jQ.fn.hintbox.enums.CONCEAL_TRIGGERED, 'hide' );
         },

         recalculatePlacement: function( evt, shouldAnimate )
         {
            var counter, focusElemData, widgetElemData, coordSet, mapLabel, imgPosition, newCalculatedPos, ieAdjustments, ie6Adjustments, borderOffsets, mouseOffsets, currentOffset, finalPosition, eventResult;

            // Ensure widget is rendered; if not, exit
            if( !thisInstance.currentState.isDisplayed )
               return jQ.fn.hintbox.logger.issue.call( thisInstance, 2, jQ.fn.hintbox.enums.WIDGET_NOT_DISPLAYED, 'recalculatePlacement' );

            // If widget is static, positioning is not applicable
            else if( thisInstance.options.placement.motionType == 'static' )
               return jQ.fn.hintbox.logger.issue.call( thisInstance, 1, jQ.fn.hintbox.enums.STATIC_WIDGET_NO_MOVE, 'recalculatePlacement' );

            // Initialize data objects for positioning
            focusElemData = {
               placement: { leftCoord: 0, topCoord: 0 },
               sizeMetrics: { heightVal: 0, widthVal: 0 },
               anchorPoint: thisInstance.options.placement.anchorPoint.focusElement
            };
            widgetElemData = {
               placement: thisInstance.getWidgetPosition(),
               sizeMetrics: thisInstance.getWidgetSize(),
               anchorPoint: thisInstance.options.placement.anchorPoint.widgetElement
            };

            // Determine target element type
            if( thisInstance.options.placement.focusElement !== 'cursor' )
            {
               // Special handling for AREA elements
               if( thisInstance.options.placement.focusElement.get( 0 ).tagName.toLowerCase() == 'area' )
               {
                  // Parse coordinates from attribute
                  coordSet = thisInstance.options.placement.focusElement.attr( 'coords' ).split( ',' );
                  for( counter = 0; counter < coordSet.length; counter++ ) coordSet[ counter ] = parseInt( coordSet[ counter ] );

                  // Determine target position based on image map
                  mapLabel = thisInstance.options.placement.focusElement.parent( 'map' ).attr( 'name' );
                  imgPosition = jQ( 'img[usemap="#' + mapLabel + '"]:first' ).offset();
                  focusElemData.placement = {
                     leftCoord: Math.floor( imgPosition.left + coordSet[ 0 ] ),
                     topCoord: Math.floor( imgPosition.top + coordSet[ 1 ] )
                  };

                  // Calculate dimensions based on area shape
                  switch( thisInstance.options.placement.focusElement.attr( 'shape' ).toLowerCase() )
                  {
                     case 'rect':
                        focusElemData.sizeMetrics = {
                           widthVal: Math.ceil( Math.abs( coordSet[ 2 ] - coordSet[ 0 ] ) ),
                           heightVal: Math.ceil( Math.abs( coordSet[ 3 ] - coordSet[ 1 ] ) )
                        };
                        break;

                     case 'circle':
                        focusElemData.sizeMetrics = {
                           widthVal: coordSet[ 2 ] + 1,
                           heightVal: coordSet[ 2 ] + 1
                        };
                        break;

                     case 'poly':
                        focusElemData.sizeMetrics = {
                           widthVal: coordSet[ 0 ],
                           heightVal: coordSet[ 1 ]
                        };

                        for( counter = 0; counter < coordSet.length; counter++ )
                        {
                           if( counter % 2 == 0 )
                           {
                              if( coordSet[ counter ] > focusElemData.sizeMetrics.widthVal )
                                 focusElemData.sizeMetrics.widthVal = coordSet[ counter ];
                              if( coordSet[ counter ] < coordSet[ 0 ] )
                                 focusElemData.placement.leftCoord = Math.floor( imgPosition.left + coordSet[ counter ] );
                           }
                           else
                           {
                              if( coordSet[ counter ] > focusElemData.sizeMetrics.heightVal )
                                 focusElemData.sizeMetrics.heightVal = coordSet[ counter ];
                              if( coordSet[ counter ] < coordSet[ 1 ] )
                                 focusElemData.placement.topCoord = Math.floor( imgPosition.top + coordSet[ counter ] );
                           }
                        }

                        focusElemData.sizeMetrics.widthVal = focusElemData.sizeMetrics.widthVal - ( focusElemData.placement.leftCoord - imgPosition.left );
                        focusElemData.sizeMetrics.heightVal = focusElemData.sizeMetrics.heightVal - ( focusElemData.placement.topCoord - imgPosition.top );
                        break;

                     default:
                        return jQ.fn.hintbox.logger.issue.call( thisInstance, 4, jQ.fn.hintbox.enums.BAD_AREA_GEOMETRY, 'recalculatePlacement' );
                  }

                  // Minor adjustment for positioning quirks
                  focusElemData.sizeMetrics.widthVal -= 2; focusElemData.sizeMetrics.heightVal -= 2;
               }

               // Target is the entire document
               else if( thisInstance.options.placement.focusElement.add( document.body ).length === 1 )
               {
                  focusElemData.placement = { leftCoord: jQ( document ).scrollLeft(), topCoord: jQ( document ).scrollTop() };
                  focusElemData.sizeMetrics = { heightVal: jQ( window ).height(), widthVal: jQ( window ).width() };
               }

               // Target is a standard HTML element
               else
               {
                  // If target is another widget, get its cached position
                  if( typeof thisInstance.options.placement.focusElement.attr( 'popnote' ) !== 'undefined' )
                     focusElemData.placement = thisInstance.options.placement.focusElement.hintbox( 'api' ).dataStore.placement;
                  else
                     focusElemData.placement = thisInstance.options.placement.focusElement.offset();

                  // Set dimensions
                  focusElemData.sizeMetrics = {
                     heightVal: thisInstance.options.placement.focusElement.fullHeight(),
                     widthVal: thisInstance.options.placement.focusElement.fullWidth()
                  };
               }

               // Adjust target corner position
               newCalculatedPos = jQ.extend( {}, focusElemData.placement );
               if( focusElemData.anchorPoint.search( /right/i ) !== -1 )
                  newCalculatedPos.leftCoord += focusElemData.sizeMetrics.widthVal;

               if( focusElemData.anchorPoint.search( /bottom/i ) !== -1 )
                  newCalculatedPos.topCoord += focusElemData.sizeMetrics.heightVal;

               if( focusElemData.anchorPoint.search( /((top|bottom)Middle)|center/ ) !== -1 )
                  newCalculatedPos.leftCoord += ( focusElemData.sizeMetrics.widthVal / 2 );

               if( focusElemData.anchorPoint.search( /((left|right)Middle)|center/ ) !== -1 )
                  newCalculatedPos.topCoord += ( focusElemData.sizeMetrics.heightVal / 2 );
            }

            // Cursor is the target, use current mouse coordinates
            else
            {
               // Set target position and dimensions
               focusElemData.placement = newCalculatedPos = { leftCoord: thisInstance.dataStore.cursorPos.xCoord, topCoord: thisInstance.dataStore.cursorPos.yCoord };
               focusElemData.sizeMetrics = { heightVal: 1, widthVal: 1 };
            }

            // Adjust widget corner position
            if( widgetElemData.anchorPoint.search( /right/i ) !== -1 )
               newCalculatedPos.leftCoord -= widgetElemData.sizeMetrics.widthVal;

            if( widgetElemData.anchorPoint.search( /bottom/i ) !== -1 )
               newCalculatedPos.topCoord -= widgetElemData.sizeMetrics.heightVal;

            if( widgetElemData.anchorPoint.search( /((top|bottom)Middle)|center/ ) !== -1 )