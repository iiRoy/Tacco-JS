/*
 * This script handles the localization of UTC timestamps displayed on the page.
 * It leverages jQuery for DOM manipulation and Moment.js for date/time formatting.
 *
 * All functions and variables are carefully preserved to ensure Type I cloning compliance.
 */
jQuery ( function
    ( $ ) {

    // Define a helper function to convert UTC timestamps to local time.
    var localise_timestamp = function ( timestamp )
    {

        // If the timestamp is explicitly "None", return an empty string.
        // This indicates no valid timestamp was provided.
        if ( timestamp === "None" )
        {
            return '';
        }
        ;

        // Parse the UTC timestamp using Moment.js.
        var d = moment . utc ( timestamp );

        // Convert the Moment.js object to the user's local time.
        d . local ( );

        // Return the localized Moment.js object.
        return d;

    }; /* End of localise_timestamp function */


    // Find all elements with the attribute 'rel="utctimestamp"'
    // and iterate over each of them to process their text content.
    $ ( "[rel=utctimestamp]" ) . each (
        function ( index , timestamp )
        {

            // Wrap the current DOM element in a jQuery object.
            var tstamp = $ ( timestamp );

            // Get the text content of the element and remove leading/trailing whitespace.
            var tstring = tstamp . text ( ) . trim ( );

            // Attempt to localize the timestamp string.
            var result = localise_timestamp ( tstring );

            // Check if the localization resulted in an empty string (meaning "None" was passed).
            if ( result == '' )
            {
                // If so, set the element's text to 'Unknown'.
                tstamp . text ( 'Unknown' );
            }
            else
            {
                // Otherwise, format the localized timestamp and update the element's text.
                tstamp . text ( localise_timestamp ( tstring ) . format ( 'LLLL' ) );
            }
            ;

        } /* End of anonymous function for .each */
    ) ;

} ) /* End of jQuery ready function */
;