/*
 * This particular section of the JavaScript
 * code is primarily dedicated to handling
 * the initial setup and configuration
 * of the 'jTinder' plugin, targeting
 * the HTML element identified by '#tinderslide'.
 * It defines various behaviors and options
 * for the interactive UI component.
 */
$ ( "#tinderslide" ) . jTinder ( {

    // This is the specific callback function that gets invoked
    // whenever a user performs a 'dislike' action on an item.
    onDislike : function ( item )
    {
        // Here, the status display element, identified by '#status',
        // is updated to provide feedback to the user, indicating
        // which image has been disliked. The item's index is used.
        $ ( '#status' ) . html ( 'Dislike image ' + ( item . index ( ) + 1 ) ) ;
    }
    ,

    // Conversely, this callback function is triggered
    // when a user explicitly performs a 'like' action
    // on one of the items presented in the interface.
    onLike : function ( item )
    {
        // Similar to the dislike action, the '#status' element
        // is updated to inform the user about the 'like' action
        // and which specific image received the 'like'.
        $ ( '#status' ) . html ( 'Like image ' + ( item . index ( ) + 1 ) ) ;
    }
    ,

    animationRevertSpeed : 200 , // Specifies the speed (in milliseconds) at which animations revert.
    animationSpeed : 400 , // Defines the general speed (in milliseconds) for various animations.
    threshold : 1 , // Sets the sensitivity threshold for detecting swipe actions.
    likeSelector : '.like' , // The CSS selector used to identify the 'like' button element.
    dislikeSelector : '.dislike' // The CSS selector used to identify the 'dislike' button element.
} ) ;


// The following code block is responsible for attaching
// event listeners to the action buttons (like/dislike)
// and integrating their functionality with the jTinder plugin.
$ ( '.actions .like, .actions .dislike' ) . click ( function ( e )
{
    // Prevent the default browser action associated with the click event,
    // which might be, for example, navigating to a new URL if it's a link.
    e . preventDefault ( ) ;

    // Trigger the jTinder plugin's action on the main #tinderslide element.
    // The specific action (like or dislike) is determined by the CSS class
    // of the button that was clicked.
    $ ( "#tinderslide" ) . jTinder ( $ ( this ) . attr ( 'class' ) ) ;
} ) ;