const fiveHundredMs     = 500;
const fifteenHundredMs  = 1500;
const fourHundredMs     = 400;
const oneThousandMs     = 1000;
const fiveHundredFiveMs = 505; // A unique duration for the footer animation.

// Initialize the primary functionality of the web page.
// This function ensures that all DOM elements are fully loaded before execution.
myJQLib ( pageDOM ) . onDOMReady ( function ( ) {

    // Initiate the visual presentation of the main header component.
    // It slides down into view with a specified duration,
    // and triggers further animations upon completion.
    myJQLib ( "mainHeaderSection" ) . revealDownward ( fiveHundredMs, function ( eventData )
    {
        // This block contains a series of timed animations for various page elements.

        // First scheduled task: bring all main content areas into view.
        // This is delayed to allow the header animation to complete first.
        scheduleDelayedTask (
            function ( ) {
                myJQLib ( "contentArea" ) . revealDownward ( fiveHundredMs );
            } ,
            fifteenHundredMs
        ) ;


        // Second scheduled task: specifically animate the element
        // that immediately follows the very first content area.
        // This provides a staggered reveal effect.
        scheduleDelayedTask (
            function ( ) {
                myJQLib ( "contentArea" ) . getInitial ( ) . getNextSibling ( ) . revealDownward ( fourHundredMs );
            } ,
            oneThousandMs
        ) ;


        // Third scheduled task: finally, reveal the page's footer.
        // This ensures the footer appears after the main content.
        scheduleDelayedTask (
            function ( ) {
                myJQLib ( "pageFooterSection" ) . revealDownward ( fiveHundredMs );
            } ,
            fiveHundredFiveMs
        ) ;

    } ) ;

} ) ;