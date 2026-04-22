( function ( ) {
    // This is an immediately invoked function expression (IIFE)
    // It creates a private scope to encapsulate the JPlayerBuffer class definition.

    // Define the JPlayerBuffer constructor function.
    // This class is responsible for managing and updating the buffer bar
    // for a jPlayer instance, based on audio buffering status.
    var JPlayerBuffer = function ( id ) {
        // Store the jPlayer instance ID. This ID is used to locate
        // the specific audio element associated with this player.
        this.jPlayerId    = id;

        // Define the CSS selector for the seek bar element.
        // This is typically a part of the jPlayer UI.
        this.cssSeekBar   = '.jp-seek-bar';

        // Define the CSS selector for the buffer bar element.
        // This bar visually represents the buffered portion of the media.
        this.cssBufferBar = '.jp-buffer-bar';
    };


    // Add a method to the JPlayerBuffer prototype.
    // This method is used to visually update the width of the buffer bar.
    JPlayerBuffer.prototype.setBufferWidth = function ( width ) {
        // Use jQuery to select the buffer bar element identified by 'cssBufferBar'
        // and directly manipulate its 'style' attribute to set the width.
        $( this.cssBufferBar ).attr( 'style', 'width: ' + width + '%' );
    };


    // Add another method to the JPlayerBuffer prototype.
    // This method returns an event handler function. This handler is intended
    // to be called repeatedly, typically on a 'timeupdate' event from the jPlayer.
    JPlayerBuffer.prototype.buffer = function ( ) {
        // Capture 'this' (which refers to the JPlayerBuffer instance)
        // into a variable 'that' to make it accessible within the nested closure.
        var that = this;

        // Return the actual event handler function.
        // This function will be executed by jPlayer when a relevant event occurs.
        return function ( event ) {

            // Attempt to retrieve the actual HTML audio element
            // based on the jPlayer ID. We expect it to be the first audio element
            // within the jPlayer container.
            var audio = $( '#' + that.jPlayerId + ' audio' )[ 0 ];

            // If for any reason the audio element is not found,
            // we exit the handler gracefully to prevent errors.
            if ( ! audio ) {
                return;
            }

            // Check if the audio element's 'buffered' property has any time ranges.
            // If there are no buffered ranges, it means nothing has been buffered yet.
            if ( ! audio.buffered.length ) {
                // In this case, ensure the buffer bar is set to zero width.
                that.setBufferWidth( 0 );
            } else {
                // If there is buffered data, proceed to calculate the buffer width.

                // Retrieve the total duration of the media from the jPlayer status.
                var duration   = event.jPlayer.status.duration;
                // Retrieve the current playback time from the jPlayer status.
                var playtime   = event.jPlayer.status.currentTime;
                // Get the end time of the first buffered range.
                // audio.buffered.end(0) returns the end time in seconds.
                var buffertime = audio.buffered.end( 0 );

                // Compare the floor values of duration and buffer time.
                // This comparison handles potential floating-point inaccuracies
                // that might occur when checking for full buffering.
                if ( Math.floor( duration ) == Math.floor( buffertime ) ) {
                    // If the media is essentially fully buffered to its duration,
                    // set the buffer bar width close to 100%.
                    // Subtracting a small value (0.2) helps prevent visual overflow
                    // or rendering glitches in some CSS implementations when the width is exactly 100%.
                    that.setBufferWidth( 100 - event.jPlayer.status.currentPercentRelative - 0.2 );

                    // This next part is a temporary fix for a visual issue
                    // (e.g., a "Bootstrap stack gap") that might appear when resizing.
                    // It slightly adjusts the width of the seek bar.
                    var width = $( that.cssSeekBar ).width( ) + 1;
                    $( that.cssSeekBar ).css( 'width', width + 'px' );
                } else {
                    // If the media is not fully buffered, calculate the buffer width
                    // based on the proportion of the buffered range that is ahead of the current playback time.
                    // (buffertime - playtime) gives the length of the buffered segment ahead of playhead.
                    // This is then scaled to a percentage of the total duration.
                    that.setBufferWidth( ( buffertime - playtime ) * 100 / duration );
                }
            }
        } // End of the returned event handler function.
    }; // End of JPlayerBuffer.prototype.buffer method definition.

    // Expose the JPlayerBuffer constructor function globally
    // by attaching it to the window object. This makes it accessible
    // from other scripts or parts of the application.
    window.JPlayerBuffer = JPlayerBuffer;

} ) ( ); // End of the IIFE execution.