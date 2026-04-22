//
//  Copyright (c) Manuel Stofer 2013 - rtp.ch - RTP.PinchZoom.js
//
//
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//


// Ensure global objects are available.
// Specifically: jQuery, console, define, setTimeout, window are used.
(  function (  )  {

  'use strict' ;
  var definePinchZoom = function ( $ ) {

        //
        // PinchZoom class definition
        // Uses jQuery for DOM manipulation
        // @version 0.0.2 - Initial public release
        // @author Manuel Stofer <mst@rtp.ch>
        // @param {HTMLElement} el - The element to apply pinch zoom to
        // @param {Object} options - Configuration options
        // @constructor
        //
        var PinchZoom = function ( el , options )
        {
          this.el = $ ( el ) ;
          this.zoomFactor = 1 ;
          this.lastScale = 1 ;
          this.offset = {
            x : 0 ,
            y : 0
          } ;
          this.options = $ . extend ( { } , this.defaults , options ) ;
          this.setupMarkup ( ) ;
          this.bindEvents ( ) ;
          this.update ( ) ;

          // By default, the pinch zoom functionality is enabled immediately.
          this.enable ( ) ;

        };
        // Helper function to sum two numbers.
        var sum = function ( a , b )
        {
          return a + b ;
        };
        // Helper function to check if a value is approximately equal to an expected value.
        var isCloseTo = function ( value , expected )
        {
          return value > expected - 0.01 && value < expected + 0.01 ;
        };

        PinchZoom.prototype = {

          // Default configuration settings for the PinchZoom instance.
          defaults : {
            tapZoomFactor : 2 , // Factor by which to zoom in on a double tap.
            zoomOutFactor : 1.3 , // Threshold for zooming out automatically.
            animationDuration : 300 , // Duration of animations in milliseconds.
            animationInterval : 5 , // Interval for animation frames in milliseconds.
            maxZoom : 4 , // Maximum allowed zoom level.
            minZoom : 0.5 , // Minimum allowed zoom level.
            lockDragAxis : false , // Whether to lock dragging to a single axis.
            use2d : true , // Not explicitly used in the provided code, but kept.
            zoomStartEventName : 'pz_zoomstart' , // Custom event name for zoom start.
            zoomEndEventName : 'pz_zoomend' , // Custom event name for zoom end.
            dragStartEventName : 'pz_dragstart' , // Custom event name for drag start.
            dragEndEventName : 'pz_dragend' , // Custom event name for drag end.
            doubleTapEventName : 'pz_doubletap' // Custom event name for double tap.
          } ,

          //
          // Event handler for the 'dragstart' event.
          // Initiates a drag operation.
          // @param {Event} event - The DOM event object.
          //
          handleDragStart : function ( event ) {
            this.el.trigger ( this.options.dragStartEventName ) ;
            this.stopAnimation ( ) ; // Stop any ongoing animation.
            this.lastDragPosition = false ;
            this.hasInteraction = true ;
            this.handleDrag ( event ) ;
          } ,

          //
          // Event handler for the 'drag' event, occurring during a drag operation.
          // This method processes the drag movement if the zoom factor is greater than 1.
          // @param {Event} event - The DOM event object containing touch information.
          //
          handleDrag : function ( event ) {

            if ( this.zoomFactor > 1.0 ) {
              var touch = this.getTouches ( event ) [ 0 ] ;
              this.drag ( touch , this.lastDragPosition ) ;
              this.offset = this.sanitizeOffset ( this.offset ) ;
              this.lastDragPosition = touch ;
            }
          } ,

          // Event handler for the 'dragend' event.
          // Signals the completion of a drag operation.
          handleDragEnd : function ( ) {
            this.el.trigger ( this.options.dragEndEventName ) ;
            this.end ( ) ; // Finalizes the interaction.
          } ,

          //
          // Event handler for 'zoomstart'.
          // Prepares the component for a new zoom gesture.
          // @param {Event} event - The event object that triggered the zoom start.
          //
          handleZoomStart : function ( event ) {
            this.el . trigger ( this.options.zoomStartEventName ) ;
            this.stopAnimation ( ) ; // Stop any ongoing animations.
            this.lastScale = 1 ;
            this.nthZoom = 0 ;
            this.lastZoomCenter = false ;
            this.hasInteraction = true ;
          } ,

          //
          // Event handler for the 'zoom' event.
          // Processes the ongoing zoom gesture.
          // @param {Event} event - The DOM event object.
          // @param {Number} newScale - The new scale factor provided by the zoom gesture.
          //
          handleZoom : function ( event , newScale ) {

            // A relative scale factor is computed based on the previous scale.
            var touchCenter = this.getTouchCenter ( this.getTouches ( event ) ) ,
                scale = newScale / this.lastScale ;

            this.lastScale = newScale ;

            // Discard initial touch events for precision.
            this.nthZoom += 1 ;
            if ( this.nthZoom > 3 ) {

              this.scale ( scale , touchCenter ) ;
              this.drag ( touchCenter , this.lastZoomCenter ) ;
            }
            this.lastZoomCenter = touchCenter ;
          } ,

          // Event handler for 'zoomend'.
          // Triggered when a zoom gesture concludes.
          handleZoomEnd : function ( ) {
            this.el . trigger ( this.options.zoomEndEventName ) ;
            this.end ( ) ; // Final cleanup after interaction.
          } ,

          //
          // Event handler for the 'doubletap' event.
          // Toggles the zoom level between the current zoom and a predefined tap zoom factor.
          // @param {Event} event - The DOM event object.
          //
          handleDoubleTap : function ( event ) {
            var center = this.getTouches ( event ) [ 0 ] ,
                zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor ,
                startZoomFactor = this.zoomFactor ,
                updateProgress = ( function ( progress ) {
                  this.scaleTo ( startZoomFactor + progress * ( zoomFactor - startZoomFactor ) , center ) ;
                } ) . bind ( this ) ;

            if ( this.hasInteraction ) {
              return ; // Ignore double taps if an interaction is already active.
            }

            if ( startZoomFactor > zoomFactor ) {
              center = this.getCurrentZoomCenter ( ) ; // Recalculate center for zooming out.
            }

            this.animate ( this.options.animationDuration , this.options.animationInterval , updateProgress , this.swing ) ;
            this.el . trigger ( this.options.doubleTapEventName ) ;
          } ,

          //
          // Calculates and returns a sanitized offset, ensuring it stays within valid boundaries
          // determined by the current zoom factor and container dimensions.
          // @param {Object} offset - The current offset {x, y}.
          // @return {Object} The sanitized offset {x, y}.
          //
          sanitizeOffset : function ( offset ) {
            var maxX = ( this.zoomFactor - 1 ) * this.getContainerX ( ) ,
                maxY = ( this.zoomFactor - 1 ) * this.getContainerY ( ) ,
                maxOffsetX = Math.max ( maxX , 0 ) ,
                maxOffsetY = Math.max ( maxY , 0 ) ,
                minOffsetX = Math.min ( maxX , 0 ) ,
                minOffsetY = Math.min ( maxY , 0 ) ;

            return {
              x : Math.min ( Math.max ( offset.x , minOffsetX ) , maxOffsetX ) ,
              y : Math.min ( Math.max ( offset.y , minOffsetY ) , maxOffsetY )
            } ;
          } ,

          //
          // Scales the element to a specific absolute zoom factor.
          // This is not a relative scale operation.
          // @param {Number} zoomFactor - The target absolute zoom factor.
          // @param {Object} center - The center point {x, y} for the scaling operation.
          //
          scaleTo : function ( zoomFactor , center ) {
            this.scale ( zoomFactor / this.zoomFactor , center ) ;
          } ,

          //
          // Applies a relative scale to the element, originating from a specified center point.
          // @param {Number} scale - The relative scale factor.
          // @param {Object} center - The center point {x, y} for the scaling operation.
          //
          scale : function ( scale , center ) {
            scale = this.scaleZoomFactor ( scale ) ;
            this.addOffset ( {
              x : ( scale - 1 ) * ( center.x + this.offset.x ) ,
              y : ( scale - 1 ) * ( center.y + this.offset.y )
            } ) ;
          } ,

          //
          // Adjusts the internal zoom factor by a relative scale,
          // clamping it between minZoom and maxZoom options.
          // @param {Number} scale - The relative scale factor to apply.
          // @return {Number} The actual scale factor applied, considering min/max constraints.
          //
          scaleZoomFactor : function ( scale ) {
            var originalZoomFactor = this.zoomFactor ;
            this.zoomFactor *= scale ;
            this.zoomFactor = Math.min ( this.options.maxZoom , Math.max ( this.zoomFactor , this.options.minZoom ) ) ;
            return this.zoomFactor / originalZoomFactor ;
          } ,

          //
          // Drags the zoomed element by updating its offset based on touch movement.
          // Optionally locks dragging to a single axis.
          // @param {Object} center - The current touch center {x, y}.
          // @param {Object} lastCenter - The previous touch center {x, y}.
          //
          drag : function ( center , lastCenter ) {
            if ( lastCenter ) {
              if ( this.options.lockDragAxis ) {
                // Determine the primary axis of movement (X or Y) and lock to it.
                if ( Math.abs ( center.x - lastCenter.x ) > Math.abs ( center.y - lastCenter.y ) ) {
                  this.addOffset ( {
                    x : - ( center.x - lastCenter.x ) ,
                    y : 0
                  } ) ;
                }
                else {
                  this.addOffset ( {
                    y : - ( center.y - lastCenter.y ) ,
                    x : 0
                  } ) ;
                }
              }
              else {
                // Drag freely on both axes.
                this.addOffset ( {
                  y : - ( center.y - lastCenter.y ) ,
                  x : - ( center.x - lastCenter.x )
                } ) ;
              }
            }
          } ,

          //
          // Computes the geometric center point for a set of touch inputs.
          // @param {Array<Object>} touches - An array of touch objects, each with x and y coordinates.
          // @return {Object} The calculated center point {x, y}.
          //
          getTouchCenter : function ( touches ) {
            return this.getVectorAvg ( touches ) ;
          } ,

          //
          // Calculates the average of a collection of 2D vectors (objects with x, y properties).
          // @param {Array<Object>} vectors - An array of vector objects.
          // @return {Object} An object representing the average vector {x, y}.
          //
          getVectorAvg : function ( vectors ) {
            return {
              x : vectors . map ( function ( v ) { return v.x ; } ) . reduce ( sum ) / vectors.length ,
              y : vectors . map ( function ( v ) { return v.y ; } ) . reduce ( sum ) / vectors.length
            } ;
          } ,

          //
          // Modifies the current offset of the element by adding a given offset vector.
          // @param {Object} offset - The offset {x, y} to be added.
          //
          addOffset : function ( offset ) {
            this.offset = {
              x : this.offset.x + offset.x ,
              y : this.offset.y + offset.y
            } ;
          } ,

          // Performs a sanitization check on the current zoom and offset.
          // Initiates an animation if the state is outside acceptable bounds.
          sanitize : function ( ) {
            if ( this.zoomFactor < this.options.zoomOutFactor ) {
              this.zoomOutAnimation ( ) ; // Zoom out if below threshold.
            } else if ( this.isInsaneOffset ( this.offset ) ) {
              this.sanitizeOffsetAnimation ( ) ; // Correct offset if out of bounds.
            }
          } ,

          //
          // Determines if the current offset is "insane" (i.e., outside its valid boundaries)
          // given the current zoom factor.
          // @param {Object} offset - The offset {x, y} to check.
          // @return {Boolean} True if the offset is insane, false otherwise.
          //
          isInsaneOffset : function ( offset ) {
            var sanitizedOffset = this.sanitizeOffset ( offset ) ;
            return sanitizedOffset.x !== offset.x ||
                   sanitizedOffset.y !== offset.y ;
          } ,

          //
          // Initiates an animation to smoothly move the element's offset
          // from its current (potentially "insane") position to a valid,
          // "sane" position within the container bounds.
          //
          sanitizeOffsetAnimation : function ( ) {
            var targetOffset = this.sanitizeOffset ( this.offset ) ,
                startOffset = {
                  x : this.offset.x ,
                  y : this.offset.y
                } ,
                updateProgress = ( function ( progress ) {
                  this.offset.x = startOffset.x + progress * ( targetOffset.x - startOffset.x ) ;
                  this.offset.y = startOffset.y + progress * ( targetOffset.y - startOffset.y ) ;
                  this.update ( ) ;
                } ) . bind ( this ) ;

            this.animate (
              this.options.animationDuration ,
              this.options.animationInterval ,
              updateProgress ,
              this.swing
            ) ;
          } ,

          //
          // Creates an animation that smoothly zooms the element back to its
          // original, unzoomed state (zoom factor 1, no offset).
          //
          zoomOutAnimation : function ( ) {
            var startZoomFactor = this.zoomFactor ,
                zoomFactor = 1 , // Target zoom factor.
                center = this.getCurrentZoomCenter ( ) , // Zoom center for the animation.
                updateProgress = ( function ( progress ) {
                  this.scaleTo ( startZoomFactor + progress * ( zoomFactor - startZoomFactor ) , center ) ;
                } ) . bind ( this ) ;

            this.animate (
              this.options.animationDuration ,
              this.options.animationInterval ,
              updateProgress ,
              this.swing
            ) ;
          } ,

          //
          // Recalculates and updates the container's height to maintain the element's aspect ratio.
          //
          updateAspectRatio : function ( ) {
            this.setContainerY ( this.getContainerX ( ) / this.getAspectRatio ( ) ) ;
          } ,

          //
          // Computes the initial zoom factor required for the element to perfectly fit
          // within its container without any overflow.
          // @return {Number} The calculated initial zoom factor.
          //
          getInitialZoomFactor : function ( ) {
            // Note: Using .offsetWidth instead of jQuery's .width() to get the true, untransformed width.
            // This is crucial because jQuery's .width() might return the transformed width in some contexts
            // (e.g., with Zepto), unlike .offsetWidth which gives the layout width.
            return this.container [ 0 ] . offsetWidth / this.el [ 0 ] . offsetWidth ;
          } ,

          //
          // Determines the aspect ratio (width / height) of the main element.
          // @return {Number} The aspect ratio of the element.
          //
          getAspectRatio : function ( ) {
            return this.el [ 0 ] . offsetWidth / this.el [ 0 ] . offsetHeight ;
          } ,

          //
          // Computes the effective zoom center based on the current offset and zoom level.
          // This is particularly useful for reversing zoom operations.
          // @return {Object} The current virtual zoom center {x, y}.
          //
          getCurrentZoomCenter : function ( ) {

            // The calculation for the X-axis zoom center uses a ratio of left to right offsets.
            // Formula: offset_left / offset_right = zoomcenter_x / (container_x - zoomcenter_x)
            var length = this.container [ 0 ] . offsetWidth * this.zoomFactor ,
                offsetLeft = this.offset.x ,
                offsetRight = length - offsetLeft - this.container [ 0 ] . offsetWidth ,
                widthOffsetRatio = offsetLeft / offsetRight ,
                centerX = widthOffsetRatio * this.container [ 0 ] . offsetWidth / ( widthOffsetRatio + 1 ) ;

            // The same logical approach is applied to determine the Y-axis zoom center.
            var height = this.container [ 0 ] . offsetHeight * this.zoomFactor ,
                offsetTop = this.offset.y ,
                offsetBottom = height - offsetTop - this.container [ 0 ] . offsetHeight ,
                heightOffsetRatio = offsetTop / offsetBottom ,
                centerY = heightOffsetRatio * this.container [ 0 ] . offsetHeight / ( heightOffsetRatio + 1 ) ;

            // Handle edge cases to prevent division by zero, ensuring valid center coordinates.
            if ( offsetRight === 0 ) {
              centerX = this.container [ 0 ] . offsetWidth ;
            }
            if ( offsetBottom === 0 ) {
              centerY = this.container [ 0 ] . offsetHeight ;
            }

            return {
              x : centerX ,
              y : centerY
            } ;
          } ,

          // Checks if the element can currently be dragged.
          // Dragging is enabled only if the zoom factor is significantly different from 1 (original size).
          canDrag : function ( ) {
            return !isCloseTo ( this.zoomFactor , 1 ) ;
          } ,

          //
          // Extracts touch points from an event object and normalizes their coordinates
          // relative to the container's position.
          // @param {Event} event - The touch event object.
          // @return {Array<Object>} An array of touch objects, each with x and y coordinates
          //                           relative to the container.
          //
          getTouches : function ( event ) {
            var position = this.container.offset ( ) ;
            return Array.prototype.slice.call ( event.touches ) . map ( function ( touch ) {
              return {
                x : touch.pageX - position.left ,
                y : touch.pageY - position.top
              } ;
            } ) ;
          } ,

          //
          // Generic animation loop utility.
          // Important: This implementation does not support concurrent animations;
          // only one animation can be active at a time.
          // @param {Number} duration - Total duration of the animation in milliseconds.
          // @param {Number} interval - Time interval between animation frames in milliseconds.
          // @param {Function} framefn - Function to call for each animation frame, receives progress (0-1).
          // @param {Function} [timefn] - Optional timing function to modify progress (e.g., ease-in/out).
          // @param {Function} [callback] - Optional function to call once the animation completes.
          //
          animate : function ( duration , interval , framefn , timefn , callback ) {
            var startTime = new Date ( ) . getTime ( ) ,
                renderFrame = ( function ( ) {
                  // If animation has been stopped externally, exit.
                  if ( !this.inAnimation ) {
                    return ;
                  }

                  var frameTime = new Date ( ) . getTime ( ) - startTime ,
                      progress = frameTime / duration ;

                  if ( frameTime >= duration ) {
                    framefn ( 1 ) ; // Ensure final state is reached.
                    if ( callback ) {
                      callback ( ) ;
                    }
                    this.update ( ) ;
                    this.stopAnimation ( ) ; // Mark animation as finished.
                    this.update ( ) ; // One last update for final state.
                  } else {
                    if ( timefn ) {
                      progress = timefn ( progress ) ; // Apply timing function.
                    }
                    framefn ( progress ) ;
                    this.update ( ) ;
                    setTimeout ( renderFrame , interval ) ; // Schedule next frame.
                  }
                } ) . bind ( this ) ;

            this.inAnimation = true ; // Flag that an animation is active.
            renderFrame ( ) ; // Start the animation loop.
          } ,

          //
          // Immediately halts any currently active animation.
          //
          stopAnimation : function ( ) {
            this.inAnimation = false ;
          } ,

          //
          // Implements a 'swing' (ease-in-out) timing function, commonly used in animations.
          // This function transforms a linear progress value into a smoother,
          // accelerating and then decelerating, curve.
          // @param {Number} p - The linear progress (a value between 0 and 1).
          // @return {Number} The eased progress value.
          //
          swing : function ( p ) {
            return - Math.cos ( p * Math.PI ) / 2 + 0.5 ;
          } ,

          // Returns the current width of the container element.
          getContainerX : function ( ) {
            return this.container [ 0 ] . offsetWidth ;
          } ,

          // Returns the current height of the container element.
          getContainerY : function ( ) {
            return this.container [ 0 ] . offsetHeight ;
          } ,

          // Sets the height of the container element.
          // @param {Number} y - The target height in pixels.
          setContainerY : function ( y ) {
            return this.container . height ( y ) ;
          } ,

          //
          // Constructs the necessary HTML markup for the pinch-zoom functionality.
          // It wraps the target element (`this.el`) within a new container div.
          //
          setupMarkup : function ( ) {
            this.container = $ ( '<div class="pinch-zoom-container"></div>' ) ;
            this.el . before ( this.container ) ; // Insert container before the element.
            this.container . append ( this.el ) ; // Move the element inside the new container.

            this.container . css ( {
              'overflow' : 'hidden' ,