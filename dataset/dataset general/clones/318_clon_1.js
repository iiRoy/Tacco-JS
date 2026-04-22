/**
 * @preserve
 * VideoFrame: HTML5 Video - SMTPE Time Code capturing and Frame Seeking API
 *
 * This utility provides functionalities to interact with HTML5 video elements
 * by frame number, SMPTE time codes, and other time-based formats.
 *
 * @version 0.2.2
 * @author Allen Sarkisyan
 * @copyright (c) 2013 Allen Sarkisyan
 * @license Released under the Open Source MIT License (MIT)
 *
 * Contributors to this project include:
 * - Allen Sarkisyan (Lead Engineer, Architect)
 * - Paige Raynes (Product Development, UI/UX)
 * - Dan Jacinto (Video Asset Quality Analyst, Testing)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and/or distribute copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in all
 *    copies or substantial portions of the Software.
 * 2. Attribution must be credited to the original authors in any derivative works
 *    or redistributions.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


/**
 * @class
 * @classdesc Main VideoFrame Implementation. This class provides methods
 *            for precise control and information retrieval from HTML5 video elements
 *            based on frames and time codes.
 * @param {Object} options - Configuration object for initialization.
 *                           Expected properties: `id` (video element ID) and `frameRate`.
 */
var VideoFrame = function ( options ) {

    // Ensure 'this' refers to a new instance if called without 'new' keyword
    if ( this === window ) {
        return new VideoFrame(options);
    }

    this.obj = options || {}; // Store configuration
    this.frameRate = this.obj.frameRate || 24; // Default frame rate is 24 FPS

    // Attempt to get the video element by ID or the first video tag on the page
    this.video = document.getElementById(this.obj.id) || document.getElementsByTagName('video')[0];

}; // End of VideoFrame constructor


/**
 * FrameRates - Industry standard frame rates enumeration.
 * Provides commonly used frame rates for easy access.
 *
 * @namespace
 * @type {Object}
 * @property {Number} film      - 24 frames per second (e.g., standard film)
 * @property {Number} NTSC      - 29.97 frames per second (e.g., North American broadcast television)
 * @property {Number} NTSC_Film - 23.98 frames per second (e.g., telecine for NTSC)
 * @property {Number} NTSC_HD   - 59.94 frames per second (e.g., high-definition NTSC)
 * @property {Number} PAL       - 25 frames per second (e.g., European broadcast television)
 * @property {Number} PAL_HD    - 50 frames per second (e.g., high-definition PAL)
 * @property {Number} web       - 30 frames per second (common for web video)
 * @property {Number} high      - 60 frames per second (high frame rate, e.g., gaming, some HD)
 */
var FrameRates = {
    film: 24,
    NTSC : 29.97,
    NTSC_Film: 23.98,
    NTSC_HD : 59.94,
    PAL: 25,
    PAL_HD: 50,
    web: 30,
    high: 60
}; // End of FrameRates object definition


// Define prototype methods for the VideoFrame class
VideoFrame.prototype = {

    /**
     * Returns the current frame number of the video.
     * This is calculated based on the video's current time and the configured frame rate.
     *
     * @return {Number} - The current frame number in the video.
     */
    get : function() {
        return Math.floor(this.video.currentTime.toFixed(5) * this.frameRate);
    },

    /**
     * Event listener for handling callback execution at a specified interval.
     * The interval is typically set to be faster than the frame rate to ensure
     * precise frame capturing.
     *
     * @param  {String} format - The desired output format for the callback.
     *                           Accepted formats are: 'SMPTE', 'time', 'frame'.
     * @param  {Number} tick   - Optional. The interval in milliseconds at which
     *                           the callback should be executed. If not provided,
     *                           it defaults to half the frame duration (1000 / frameRate / 2).
     * @return {Number} Returns a value at a set interval. This method primarily
     *                  sets up an interval and does not return an immediate value.
     */
    listen : function ( format, tick ) {
        var _video = this; // Capture 'this' for use within the interval callback

        // Basic validation for the required format parameter
        if ( !format ) {
            console.log('VideoFrame: Error - The listen method requires the format parameter.');
            return;
        }

        // Set up the interval
        this.interval = setInterval(function () {
            // If the video is paused or has ended, do nothing
            if ( _video.video.paused || _video.video.ended ) {
                return;
            }

            // Determine the frame value based on the requested format
            var frame = ( ( format === 'SMPTE' )
                            ? _video.toSMPTE()
                            : ( ( format === 'time' )
                                    ? _video.toTime()
                                    : _video.get()
                              )
                        );

            // Execute the callback function if it's defined in the options
            if ( _video.obj.callback ) {
                _video.obj.callback(frame, format);
            }

            return frame; // Return the frame value (though not directly used by setInterval)
        },
        // Calculate the interval duration: default to 1000ms / (frameRate * 2) if tick is not provided
        ( tick ? tick : ( 1000 / _video.frameRate / 2 ) )
        );
    },

    /**
     * Clears the current interval set by the `listen` method,
     * effectively stopping the continuous callback execution.
     */
    stopListen : function () {
        var _video = this; // Reference to the current instance
        clearInterval(_video.interval); // Clear the interval using its ID
    },

    // Expose FrameRates as a property for convenience
    fps : FrameRates

}; // End of VideoFrame.prototype


/**
 * Returns the current time code in the video in HH:MM:SS format,
 * or HH:MM:SS:FF if frames are provided.
 * This method is also used internally for conversion to SMPTE format.
 *
 * @param  {Number} [frames] - Optional. If provided, represents a time in seconds
 *                              that should be converted. Otherwise, uses the video's
 *                              current time.
 * @return {String} Returns the formatted time code (HH:MM:SS or HH:MM:SS:FF).
 */
VideoFrame.prototype.toTime = function ( frames ) {
    // Determine the base time: either provided frames (in seconds) or current video time
    var time = ( typeof frames !== 'number' ? this.video.currentTime : frames );
    var frameRate = this.frameRate;

    var dt = ( new Date() ); // Create a new Date object to help with time calculations
    // Define the format string, appending ':ff' if frames (meaning time in seconds) was provided
    var format = 'hh:mm:ss' + ( typeof frames === 'number' ? ':ff' : '' );

    // Reset date object to start of day for accurate time calculation
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    dt.setMilliseconds(time * 1000); // Set milliseconds based on the 'time' value

    /**
     * Internal helper function to ensure two-digit formatting.
     * @param {Number} n - The number to format.
     * @return {String} The formatted two-digit string.
     */
    function wrap(n) {
        return ( ( n < 10 ) ? '0' + n : n );
    }

    // Replace placeholders in the format string with actual time components
    return format.replace(/hh|mm|ss|ff/g, function ( format ) {
        switch ( format ) {
            case "hh":
                // Handle 12-hour format for hours
                return wrap(dt.getHours() < 13 ? dt.getHours() : ( dt.getHours() - 12 ));
            case "mm":
                return wrap(dt.getMinutes());
            case "ss":
                return wrap(dt.getSeconds());
            case "ff":
                // Calculate frame number based on fractional part of time
                return wrap(Math.floor( ( ( time % 1 ) * frameRate ) ));
        }
    });
}; // End of toTime method


/**
 * Returns the current SMPTE Time code in the video (HH:MM:SS:FF format).
 * This method can also be used as a conversion utility from a frame number.
 *
 * @param  {Number} [frame] - OPTIONAL: A specific frame number for conversion
 *                              to its equivalent SMPTE Time code. If not provided,
 *                              the video's current time is used.
 * @return {String} Returns a SMPTE Time code in HH:MM:SS:FF format.
 */
VideoFrame.prototype.toSMPTE = function ( frame ) {
    // If no frame number is provided, use the current video time to generate SMPTE
    if ( !frame ) {
        return this.toTime(this.video.currentTime);
    }

    var frameNumber = Number(frame); // Ensure frame is treated as a number
    var fps = this.frameRate; // Get the current frame rate

    /**
     * Internal helper function to ensure two-digit formatting.
     * @param {Number} n - The number to format.
     * @return {String} The formatted two-digit string.
     */
    function wrap(n) {
        return ( ( n < 10 ) ? '0' + n : n );
    }

    // Calculate total frames for an hour and a minute
    var _hour = ( ( fps * 60 ) * 60 );
    var _minute = ( fps * 60 );

    // Calculate hours, minutes, seconds, and frames components
    var _hours = ( frameNumber / _hour ).toFixed(0);
    var _minutes = ( Number( ( frameNumber / _minute ).toString().split('.')[0] ) % 60 );
    var _seconds = ( Number( ( frameNumber / fps ).toString().split('.')[0] ) % 60 );

    // Assemble the SMPTE string
    var SMPTE = ( wrap(_hours) + ':' + wrap(_minutes) + ':' + wrap(_seconds) + ':' + wrap(frameNumber % fps) );

    return SMPTE;
}; // End of toSMPTE method


/**
 * Converts a SMPTE Time code to total seconds.
 *
 * @param  {String} [SMPTE] - OPTIONAL: A SMPTE time code in HH:MM:SS:FF format.
 *                              If not provided, the video's current time in seconds is returned.
 * @return {Number} Returns the total second count of a SMPTE Time code.
 */
VideoFrame.prototype.toSeconds = function ( SMPTE ) {
    // If no SMPTE string is provided, return the current video time (floored to integer seconds)
    if ( !SMPTE ) {
        return Math.floor(this.video.currentTime);
    }

    var time = SMPTE.split(':'); // Split the SMPTE string into components

    // Calculate total seconds: hours * 3600 + minutes * 60 + seconds
    return ( ( ( Number(time[0]) * 60 ) * 60 ) + ( Number(time[1]) * 60 ) + Number(time[2]) );
}; // End of toSeconds method


/**
 * Converts a SMPTE Time code, or standard time code (HH:MM:SS), to total milliseconds.
 *
 * @param  {String} [SMPTE] - OPTIONAL: A SMPTE time code in HH:MM:SS:FF format,
 *                              or a standard time code in HH:MM:SS format.
 *                              If not provided, the video's current SMPTE is used.
 * @return {Number} Returns the total Millisecond count of the provided (or current) Time code.
 */
VideoFrame.prototype.toMilliseconds = function ( SMPTE ) {
    // Extract the frame component (FF) from the SMPTE string
    var frames = ( !SMPTE ) ? Number(this.toSMPTE().split(':')[3]) : Number(SMPTE.split(':')[3]);

    // Calculate milliseconds contributed by the frame component
    var milliseconds = ( 1000 / this.frameRate ) * ( isNaN(frames) ? 0 : frames );

    // Combine seconds (converted to milliseconds) with the frame milliseconds
    return Math.floor( ( ( this.toSeconds(SMPTE) * 1000 ) + milliseconds ) );
}; // End of toMilliseconds method


/**
 * Converts a SMPTE Time code to its equivalent long-running frame number.
 *
 * @param  {String} [SMPTE] - OPTIONAL: A SMPTE time code in HH:MM:SS:FF format.
 *                              If not provided, the video's current SMPTE is used.
 * @return {Number} Returns the total frame number corresponding to the Time code.
 */
VideoFrame.prototype.toFrames = function ( SMPTE ) {
    // Get time components from SMPTE string or current video SMPTE
    var time = ( !SMPTE ) ? this.toSMPTE().split(':') : SMPTE.split(':');
    var frameRate = this.frameRate; // Get the current frame rate

    // Calculate frames for hours, minutes, seconds, and add the frame component
    var hh = ( ( ( Number(time[0]) * 60 ) * 60 ) * frameRate ); // Hours to frames
    var mm = ( ( Number(time[1]) * 60 ) * frameRate );         // Minutes to frames
    var ss = ( Number(time[2]) * frameRate );                  // Seconds to frames
    var ff = Number(time[3]);                                  // Direct frame component

    // Sum all components to get the total frame number
    return Math.floor( ( hh + mm + ss + ff ) );
}; // End of toFrames method


/**
 * Private method used internally for the seeking functionality.
 * It adjusts the video's current time based on frame increments.
 *
 * @private
 * @param  {String} direction - The direction to seek. Accepted values: 'forward', 'backward'.
 * @param  {Number} frames    - The number of frames to seek by.
 */
VideoFrame.prototype.__seek = function ( direction, frames ) {
    // If video is playing, pause it before seeking to prevent jumpiness
    if ( !this.video.paused ) {
        this.video.pause();
    }

    var frame = Number(this.get()); // Get the current frame number

    /**
     * To seek accurately, especially forward, a small epsilon (0.00001)
     * is added to the calculated time to ensure the browser registers
     * a new time and updates the video frame.
     */
    this.video.currentTime = ( ( ( direction === 'backward' ? ( frame - frames ) : ( frame + frames ) ) ) / this.frameRate ) + 0.00001;
}; // End of __seek method


/**
 * Seeks forward by a specified number of frames in the video.
 *
 * @param  {Number}   [frames]   - Optional. The number of frames to seek forward. Defaults to 1.
 * @param  {Function} [callback] - Optional. A callback function to execute once seeking is complete.
 * @return {Boolean} Returns true if the operation was initiated.
 */
VideoFrame.prototype.seekForward = function ( frames, callback ) {
    // Default to seeking by 1 frame if 'frames' is not provided
    if ( !frames ) {
        frames = 1;
    }

    this.__seek('forward', Number(frames)); // Call the internal seek method

    // Execute callback if provided
    return ( callback ? callback() : true );
}; // End of seekForward method


/**
 * Seeks backward by a specified number of frames in the video.
 *
 * @param  {Number}   [frames]   - Optional. The number of frames to seek backward. Defaults to 1.
 * @param  {Function} [callback] - Optional. A callback function to execute once seeking is complete.
 * @return {Boolean} Returns true if the operation was initiated.
 */
VideoFrame.prototype.seekBackward = function ( frames, callback ) {
    // Default to seeking by 1 frame if 'frames' is not provided
    if ( !frames ) {
        frames = 1;
    }

    this.__seek('backward', Number(frames)); // Call the internal seek method

    // Execute callback if provided
    return ( callback ? callback() : true );
}; // End of seekBackward method


/**
 * For seeking to a certain SMPTE time code, standard time code, frame, second, or millisecond in the video.
 * This method allows precise seeking using various time representations.
 *
 * @param  {Object} config - Configuration Object for seeking.
 *                            Allowed keys are `SMPTE`, `time`, `frame`, `seconds`, and `milliseconds`.
 *                            Only one key should be provided per call.
 *                            Examples:
 *                            `{ SMPTE: '00:01:12:22' }`
 *                            `{ time: '00:01:12' }`
 *                            `{ frame: 1750 }`
 *                            `{ seconds: 72 }`
 *                            `{ milliseconds: 72916 }`
 */
VideoFrame.prototype.seekTo = function ( config ) {
    var obj = config || {}; // Use provided config or an empty object
    var seekTime;           // Variable to store the calculated time in seconds
    var SMPTE;              // Variable to store SMPTE string if needed

    // Get the first (and ideally only) key from the config object
    var option = Object.keys(obj)[0];

    // Handle SMPTE or 'time' (HH:MM:SS) options directly
    if ( option == 'SMPTE' || option == 'time' ) {
        SMPTE = obj[option];
        // Convert to milliseconds, then to seconds, and add a small epsilon for accuracy
        seekTime = ( ( this.toMilliseconds(SMPTE) / 1000 ) + 0.001 );
        this.video.currentTime = seekTime; // Set video's current time
        return; // Exit function after processing
    }

    // Use a switch statement for other seeking options
    switch ( option ) {
        case 'frame':
            // Convert frame number to SMPTE, then to milliseconds, then to seconds
            SMPTE = this.toSMPTE(obj[option]);
            seekTime = ( ( this.toMilliseconds(SMPTE) / 1000 ) + 0.001 );
            break;
        case 'seconds':
            // Direct assignment for seconds
            seekTime = Number(obj[option]);
            break;
        case 'milliseconds':
            // Convert milliseconds to seconds and add epsilon
            seekTime = ( ( Number(obj[option]) / 1000 ) + 0.001 );
            break;
    }

    // If a valid seekTime was calculated, update the video's current time
    if ( !isNaN(seekTime) ) {
        this.video.currentTime = seekTime;
    }
}; // End of seekTo method