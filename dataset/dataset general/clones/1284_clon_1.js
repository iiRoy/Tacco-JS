/*
 * JSMovieclip V1.0 - A JavaScript Movieclip Library
 * Original Source: https://github.com/jeremypetrequin/jsMovieclip
 * Copyright 2013 Jeremy Petrequin. All rights reserved.
 * Licensed under the MIT license agreement.
 * See: https://github.com/jeremypetrequin/jsMovieclip/blob/master/MIT-license.txt
 *
 * This file contains the core JSMovieclip functionality.
 * Created for animating DOM elements with sprite sheets.
 */
( function( ) {

    // Enforce strict mode for cleaner code and fewer errors.
    "use strict" ;


    /**
     * JSMovieclip Constructor
     * Initializes a new Movieclip instance.
     * @param {HTMLElement|NodeList|Array<HTMLElement>} elmts - Elements to animate.
     * @param {Object} params - Configuration parameters.
     */
    function JSMovieclip ( elmts , params ) {

        // If no elements are provided, return the current context.
        if ( ! elmts ) {
            return this ;
        }

        // Store a reference to 'this' for use within the object.
        var t = this ;
        // Convert elements to a string representation for type checking.
        var str = elmts . toString( ) ;

        // Determine if elmts is an array-like object or a single element.
        // If it's an array, NodeList, or HTMLCollection, use it directly.
        // Otherwise, wrap the single element in an array.
        t . elmts = ( str === '[object Array]' || str === '[object NodeList]' || str === '[object HTMLCollection]' || str === '[object Object]' ) ? elmts : [ elmts ] ;

        // Nullify 'str' to free up memory (minor optimization).
        str = null ;

        // Initialize animation state.
        t . playing = false ;

        // Set the framerate, defaulting to 25 FPS if not provided.
        t . framerate = params . framerate || 25 ;

        // Initialize an empty array to store frame data.
        t . frames = [ ] ;

        // Set loop behavior, default to false.
        t . loop = false ;

        // Cache the number of elements for performance in loops.
        t . elmtsLength = t . elmts . length ;

        // Set a callback function to execute when the animation stops.
        t . stopCallback = params . stopCallback || null ;

        // Initialize the first and last frame indices for playback range.
        t . firstFrame = 1 ;
        t . lastFrame = 1 ;

        // Internal properties, prefixed with underscore.
        t . _label = '' ;         // Current label (not fully utilized in this version).
        t . _idx = 0 ;            // Current frame index.
        t . _timer = null ;       // Timer ID for setTimeout.
        t . _tmpFrames = [ ] ;    // Temporary frame storage, potentially reversed.
        t . _way = 1 ;            // Playback direction: 1 for forward, -1 for backward.
        t . _framesNumber = params . frames_number || 0 ; // Total number of frames.

        // Call updateFrames to initialize frame data based on provided parameters.
        t . updateFrames ( params . frames , params . direction , params . width , params . height , params . frames_number ) ;
    }


    // Extend the JSMovieclip prototype with methods.
    // This allows for custom extensions and overrides.
    JSMovieclip . prototype = {

        /**
         * "Protected" method: _render
         * Updates the background position of all animated elements to display the current frame.
         * This method is called repeatedly by _enterFrame.
         */
        _render : function ( ) {

            var i = this . elmtsLength ; // Counter for the elements loop.
            var t = this ;               // Reference to 'this' for scope.

            // Loop through all elements and update their background position.
            while ( i -- ) {
                this . elmts [ i ] . style . backgroundPosition = this . _tmpFrames [ this . _idx ] ;
            }

            // If the movieclip is currently playing, update the frame index.
            if ( t . playing ) {

                // Check if the current frame is the last frame in the sequence.
                if ( t . _idx >= t . lastFrame - 1 ) {

                    // If not looping, stop the animation.
                    if ( ! t . loop ) {
                        t . stop ( ) ;
                        return ; // Exit the render function.
                    }

                    // If looping, reset the frame index to the first frame.
                    t . _idx = t . firstFrame - 1 ;

                } else {
                    // Otherwise, advance to the next frame.
                    t . _idx ++ ;
                }
            }
        } ,


        /**
         * "Protected" method: _enterFrame
         * This method acts as the main animation loop, calling _render and scheduling the next frame.
         * Uses setTimeout to control the framerate.
         */
        _enterFrame : function ( ) {

            var t = this ; // Reference to 'this' for scope.

            // Render the current frame.
            t . _render . call ( t ) ;

            // If still playing, schedule the next frame.
            if ( t . playing ) {
                t . _timer = setTimeout ( function ( ) {
                    t . _enterFrame . call ( t ) ;
                } , 1000 / t . framerate ) ; // Calculate delay based on framerate.
            }
        } ,


        /**
         * "Protected" method: _calculateFrames
         * Populates the _tmpFrames array based on the current playback direction (_way).
         * If _way is 1 (normal), _tmpFrames is a copy of frames.
         * If _way is -1 (inverted), _tmpFrames is the reversed version of frames.
         * Also updates _framesNumber and clears any loop boundaries.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        _calculateFrames : function ( ) {

            this . _tmpFrames = [ ] ; // Reset temporary frames array.

            // If playing forward, use frames directly.
            if ( this . _way === 1 ) {
                this . _tmpFrames = this . frames ;
            } else {
                // If playing backward, reverse the frames.
                var i = this . frames . length ;
                while ( i -- ) {
                    this . _tmpFrames . push ( this . frames [ i ] ) ;
                }
            }

            // Update the total number of frames.
            this . _framesNumber = this . frames . length ;

            // Clear any active loop boundaries and return.
            return this . clearLoopBetween ( ) ;
        } ,


        /**
         * "Protected" method: _cacheFrames
         * Converts frame objects (x, y coordinates) into backgroundPosition CSS strings.
         * This optimizes rendering by pre-calculating the strings.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        _cacheFrames : function ( ) {

            var frames = this . frames ; // Store original frames.
            var i = frames . length ;    // Loop counter.

            this . frames = [ ] ; // Clear original frames array.

            // Convert each frame object to a CSS background-position string.
            while ( i -- ) {
                this . frames [ i ] = '-' + frames [ i ] . x + 'px -' + frames [ i ] . y + 'px' ;
            }

            return this ; // Allow method chaining.
        } ,


        // Public methods of the JSMovieclip prototype.

        /**
         * Public method: updateFrames
         * Updates the frame data for the movieclip. Can accept an array of pre-calculated frames
         * or generate them from a sprite sheet definition (direction, width, height, nbframe).
         * @param {Array<Object>} [frames] - Optional: An array of frame objects {x:number, y:number}.
         * @param {string} [direction] - 'h' for horizontal sprite, 'v' for vertical sprite.
         * @param {number} [width] - Width of a single frame (required for 'h' direction).
         * @param {number} [height] - Height of a single frame (required for 'v' direction).
         * @param {number} [nbframe] - Total number of frames in the sprite sheet.
         * @returns {JSMovieclip} - The current instance for chaining.
         * @throws {Error} If required parameters for sprite sheet generation are missing.
         */
        updateFrames : function ( frames , direction , width , height , nbframe ) {

            // If an array of frames is provided, use it directly.
            if ( frames ) {
                this . frames = frames ;
                return this . _cacheFrames ( ) . _calculateFrames ( ) ;
            }

            // --- Error reporting for sprite sheet generation ---
            if ( ! frames && ! direction ) {
                throw "JSMovieclip need at least frames array or a direction " ;
            }
            if ( direction === 'v' && ! height ) {
                throw "If you want to use a vertical sprite, JSMoviclip need a height" ;
            }
            if ( direction === 'h' && ! width ) {
                throw "If you want to use a horizontal sprite, JSMoviclip need a width" ;
            }
            if ( ! nbframe ) {
                throw "If you want to use a horizontal of vertical sprite, JSMoviclip need a number of frame" ;
            }

            // Generate frames based on direction, width/height, and number of frames.
            var i = 0 ;
            for ( ; i < nbframe ; i ++ ) {
                this . frames . push ( {
                    x : ( direction === 'h' ? i * width : 0 ) ,
                    y : ( direction === 'v' ? i * height : 0 )
                } ) ;
            }
            i = null ; // Clear loop variable.

            // Cache the generated frames and calculate the temporary frames array.
            return this . _cacheFrames ( ) . _calculateFrames ( ) ;
        } ,


        /**
         * Public method: getWay
         * Returns the current playback direction.
         * @returns {number} - 1 for normal (forward), -1 for inverted (backward).
         */
        getWay : function ( ) {
            return this . _way ;
        } ,


        /**
         * Public method: changeWay
         * Changes the playback direction of the movieclip.
         * @param {number} way - The new direction: 1 for normal, -1 for inverted.
         * @param {boolean} [keepFrame=false] - If true, attempts to maintain the visual frame
         *                                        when reversing (e.g., if on frame 5 of 10,
         *                                        reversing goes to frame 6 of 10 in reverse).
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        changeWay : function ( way , keepFrame ) {

            // If the way is already the same, do nothing.
            if ( way === this . _way ) {
                return this ;
            }

            // Ensure keepFrame is a boolean.
            keepFrame = !! keepFrame ;

            // Adjust the current frame index if keepFrame is true.
            if ( keepFrame === true ) {
                this . _idx = this . _framesNumber - this . _idx ;
            }

            this . _way = way ; // Update the playback direction.

            // Recalculate frames based on the new direction.
            return this . _calculateFrames ( ) ;
        } ,


        /**
         * Public method: clearLoopBetween
         * Resets the loop boundaries to encompass all available frames.
         * Sets firstFrame to 1 and lastFrame to the total number of frames.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        clearLoopBetween : function ( ) {
            this . firstFrame = 1 ;
            this . lastFrame = this . _framesNumber ;
            return this ;
        } ,


        /**
         * Public method: loopBetween
         * Sets specific start and end frames for looping.
         * Automatically adjusts the current frame if it falls outside the new loop range.
         * @param {number} firstFrame - The first frame number in the loop (1-indexed).
         * @param {number} lastFrame - The last frame number in the loop (1-indexed).
         * @returns {JSMovieclip} - The current instance for chaining.
         * @throws {Error} If firstFrame is greater than or equal to lastFrame.
         */
        loopBetween : function ( firstFrame , lastFrame ) {

            // Validate loop boundaries.
            if ( firstFrame >= lastFrame ) {
                firstFrame = lastFrame ;
                throw 'Firstframe and lastframe are equals or inverted' ;
            }

            // Ensure firstFrame is at least 1 and lastFrame does not exceed total frames.
            this . firstFrame = Math . max ( firstFrame , 1 ) ;
            this . lastFrame = Math . min ( lastFrame , this . _framesNumber ) ;

            // Adjust current frame if it's out of the new loop range.
            if ( this . _idx < this . firstFrame - 1 || this . _idx > this . lastFrame - 1 ) {
                this . _idx = this . firstFrame - 1 ;
            }

            return this ; // Allow method chaining.
        } ,


        /**
         * Public method: currentFrame
         * Gets the current frame number (1-indexed).
         * @returns {number} - The current frame index + 1.
         */
        currentFrame : function ( ) {
            return this . _idx + 1 ;
        } ,


        /**
         * Public method: prevFrame
         * Stops the movieclip and moves to the previous frame within the defined loop boundaries.
         * If at the first frame, it loops to the last frame.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        prevFrame : function ( ) {

            var current = this . currentFrame ( ) ; // Get current 1-indexed frame.

            // Calculate the target frame: previous, or last if currently at first.
            var targetFrame = ( current <= this . firstFrame ) ? this . lastFrame : current - 1 ;

            return this . gotoAndStop ( targetFrame ) ; // Go to and stop at the target frame.
        } ,


        /**
         * Public method: nextFrame
         * Stops the movieclip and moves to the next frame within the defined loop boundaries.
         * If at the last frame, it loops to the first frame.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        nextFrame : function ( ) {

            var current = this . currentFrame ( ) ; // Get current 1-indexed frame.

            // Calculate the target frame: next, or first if currently at last.
            var targetFrame = ( current >= this . lastFrame ) ? 1 : current + 1 ;

            return this . gotoAndStop ( targetFrame ) ; // Go to and stop at the target frame.
        } ,


        /**
         * Public method: toggle
         * Toggles the playing state of the movieclip (play if stopped, stop if playing).
         * @param {boolean} [loop] - If playing, whether to loop indefinitely.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        toggle : function ( loop ) {
            // Check if currently playing. If so, stop; otherwise, play.
            return ! this . playing ? this . play ( loop ) : this . stop ( ) ;
        } ,


        /**
         * Public method: play
         * Starts the movieclip animation.
         * If already playing, does nothing.
         * If at the last frame, resets to the first frame before playing.
         * @param {boolean} [loop=false] - Whether the animation should loop indefinitely.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        play : function ( loop ) {

            // If already playing, no action needed.
            if ( this . playing ) {
                return this ;
            }

            // If at the last frame, reset to the first frame for a fresh play.
            if ( this . _idx === this . lastFrame - 1 ) {
                this . _idx = this . firstFrame - 1 ;
            }

            this . playing = true ;       // Set playing state to true.
            this . loop = !! loop ;       // Ensure loop is a boolean.

            this . _enterFrame ( ) ;      // Start the animation loop.

            return this ;                 // Allow method chaining.
        } ,


        /**
         * Public method: stop
         * Stops the movieclip animation.
         * Clears the internal timer and executes the stopCallback if defined.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        stop : function ( ) {

            this . playing = false ; // Set playing state to false.

            // Clear any active timer.
            if ( this . _timer ) {
                clearTimeout ( this . _timer ) ;
                this . _timer = null ;
            }

            // Execute the stop callback if it exists.
            if ( this . stopCallback ) {
                this . stopCallback ( ) ;
            }

            return this ; // Allow method chaining.
        } ,


        /**
         * Public method: gotoAndPlay
         * Jumps to a specific frame and then starts playing the animation.
         * The frame will be clamped within the defined loop boundaries.
         * @param {number} frame - The target frame number (1-indexed).
         * @param {boolean} [loop=false] - Whether the animation should loop indefinitely after jumping.
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        gotoAndPlay : function ( frame , loop ) {

            // Set the current frame index, clamping it within loop boundaries.
            this . _idx = Math . min ( Math . max ( frame , this . firstFrame ) , this . lastFrame ) - 1 ;

            return this . play ( loop ) ; // Start playing from the new frame.
        } ,


        /**
         * Public method: gotoAndStop
         * Jumps to a specific frame and stops the animation.
         * The frame will be clamped within the defined loop boundaries.
         * @param {number} frame - The target frame number (1-indexed).
         * @returns {JSMovieclip} - The current instance for chaining.
         */
        gotoAndStop : function ( frame ) {

            // Set the current frame index, clamping it within loop boundaries.
            this . _idx = Math . min ( Math . max ( frame , this . firstFrame ) , this . lastFrame ) - 1 ;

            this . loop = false ;    // Ensure looping is off.
            this . playing = false ; // Ensure playing state is off.

            this . _enterFrame ( ) ; // Render the specific frame immediately.

            return this ;            // Allow method chaining.
        }
    } ;


    // Expose JSMovieclip to the global window object.
    window . JSMovieclip = JSMovieclip ;

} ) ( ) ;