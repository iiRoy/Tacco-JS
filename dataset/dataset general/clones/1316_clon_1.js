/*
 * This entire script provides functionality for Twitter intents and a jQuery plugin
 * to create tweetable links. It's designed to make sharing content on Twitter easier.
 */
( function () {
    // Check if the handler is already initialized to prevent re-execution.
    if ( window . __twitterIntentHandler )
        return ;

    // Regular expression to match Twitter intent URLs.
    const intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/ ;

    // Standard window options for the pop-up.
    const windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes' ;

    // Desired dimensions for the pop-up window.
    let width = 550 ;
    let height = 420 ;

    // Screen dimensions to calculate pop-up position.
    var winHeight = screen . height ;
    var winWidth = screen . width ;


    /**
     * Handles click events for Twitter intent links.
     * @param {Event} e - The event object.
     */
    function handleIntent( e ) {
        e = e || window . event ; // Normalize event object for IE.

        var target = e . target || e . srcElement ; // Get the event target.
        let m ; // Match result for regex.
        let left ; // Left position for the pop-up.
        let top ; // Top position for the pop-up.

        // Traverse up the DOM tree until an anchor tag is found.
        while ( target && target . nodeName . toLowerCase () !== 'a' ) {
            target = target . parentNode ;
        }

        // If an anchor tag is found and it has an href, process it.
        if ( target && target . nodeName . toLowerCase () === 'a' && target . href ) {
            m = target . href . match ( intentRegex ) ; // Check if it's a Twitter intent link.

            if ( m ) {
                // Calculate the horizontal center position.
                left = Math . round ( ( winWidth / 2 ) - ( width / 2 ) ) ;
                top = 0 ; // Default top position.

                // If screen height allows, center vertically.
                if ( winHeight > height ) {
                    top = Math . round ( ( winHeight / 2 ) - ( height / 2 ) ) ;
                }

                // Open the new window with calculated dimensions and position.
                window . open ( target . href ,
                                'intent' ,
                                windowOptions + ',width=' + width +
                                ',height=' + height +
                                ',left=' + left +
                                ',top=' + top ) ;

                // Prevent default link behavior.
                e . returnValue = false ; // For older IE.
                e . preventDefault && e . preventDefault () ; // Standard way.
            }
        }
    }

    // Attach the event listener for clicks to the document.
    if ( document . addEventListener ) {
        document . addEventListener ( 'click' , handleIntent , false ) ;
    } else if ( document . attachEvent ) {
        document . attachEvent ( 'onclick' , handleIntent ) ;
    }
    // Mark the handler as initialized.
    window . __twitterIntentHandler = true ;
} () ) ;

/*
 * This section defines a jQuery plugin named 'tweetable'
 * which allows easy creation of links that open Twitter intent pop-ups.
 */
( function ( $ ) {

    // Default configuration options for the tweetable plugin.
    var options = {
        dataAttr : 'data-tweetable' , // The data attribute to fetch tweet text from.
        linkClass : 'tweetable' , // CSS class to apply to the generated link.
        via : null , // Optional Twitter handle to be mentioned.
        related : null , // Optional related Twitter handles.
        url : window . location . pathname // URL to be shared, defaults to current page.
    } ;

    /*
     * Exposes the internal options object for global configuration.
     * This allows users to change default settings before plugin initialization.
     */
    $ . tweetable = ( function () {
        return { options : options } ;
    } ) () ;


    /**
     * jQuery plugin function. Transforms selected elements into tweetable links.
     * @param {Object} [userOptions] - Optional object to override default options.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    $ . fn . tweetable = function ( userOptions ) {

        // Merge user-provided options with the default options.
        // This extends the global tweetable options, affecting all future calls
        // unless overridden again.
        $ . extend ( $ . tweetable . options , userOptions ) ;

        // Cache the selected elements for efficiency.
        var $elements = $ ( this ) ;

        // Iterate over each selected element and apply the tweetable logic.
        return $elements . each ( function () {

            var $e = $ ( this ) ; // Current element in the iteration.

            // Determine the tweet text.
            // First, try to get it from the 'data-tweetable' attribute.
            // If empty or undefined, fall back to the element's inner text.
            var tweetText = $e . attr ( $ . tweetable . options . dataAttr ) ;
            if ( tweetText == "" || tweetText === undefined ) {
                tweetText = $e . text () ;
            }

            // Enforce Twitter's character limit.
            if ( tweetText . length > 140 ) {
                // Log an error if the text exceeds the limit.
                console . error ( "Tweet text exceeds 140 characters. Please shorten it." ) ;
                return $e ; // Skip this element and return it.
            }

            // Encode the tweet text for URL safety.
            tweetText = encodeURIComponent ( tweetText ) ;

            // Construct the base Twitter intent URL.
            var twitterLink = 'https://twitter.com/intent/tweet?' ;
            twitterLink += "text=" + tweetText ; // Add the encoded tweet text.
            twitterLink += "&url=" + encodeURIComponent ( $ . tweetable . options . url ) ; // Add the URL to share.

            // Conditionally add 'via' and 'related' parameters if provided.
            if ( $ . tweetable . options . via )
                twitterLink += "&via=" + $ . tweetable . options . via ;
            if ( $ . tweetable . options . related )
                twitterLink += "&related=" + $ . tweetable . options . related ;

            // Wrap the current element with the newly constructed anchor tag.
            // This transforms the element into a clickable tweetable link.
            $e . wrap ( '<a class="' + $ . tweetable . options . linkClass + '" href="' + twitterLink + '"/>' ) ;

            return $e ; // Return the element for chaining.
        } ) ;
    } ;

} ( jQuery ) ) ;