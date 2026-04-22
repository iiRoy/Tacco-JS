/*
 * This file contains logic for managing Online-Go.com game notifications
 * and opening related tabs in the Chrome browser.
 * It's part of a browser extension.
 */


    var boardsToMove; /* A variable that is declared but not explicitly used in the provided snippet.
                         Perhaps it's intended for future features or other parts of the extension. */


var gamesToOpen = [ ]; // This array stores IDs of games that are awaiting a player's move.


    /**
     * This function is responsible for opening new browser tabs based on
     * the user's game notification settings and pending games.
     * It's typically triggered when the browser action button is clicked.
     */
function openGames( )
{

    /* Retrieve the user's preference regarding opening the chat tab. */
    var chatAtGamesOpen = localStorage [ 'chatAtGamesOpen' ];

    // Check if the user wants to open the chat when games are opened.
    if ( chatAtGamesOpen == "true" )
    {

        /* Create a new tab for the Online-Go.com chat. */
        chrome.tabs.create( { url: "https://online-go.com/chat" } );
    }


    /* Get the user's preference for how to open games (e.g., all, first, summary). */
    var open = localStorage [ 'open' ];

    // If there are no games to open, or the 'open' setting is null/summary,
    // then just open the main Online-Go.com page.
    if ( gamesToOpen.length == 0 || open == null || open == 'summary' )
        {
            chrome.tabs.create( { url: "https://online-go.com/" } );
            return ; // Exit the function after opening the main page.
        }


    // Iterate through the list of games that need to be opened.
    for ( var i = 0 ; i < gamesToOpen.length ; i++ )
        {
            // For each game, create a new tab with the specific game URL.
            chrome.tabs.create( { url: "https://online-go.com/game/" + gamesToOpen [ i ] } );

            // If the user only wants to open the first game, break the loop after the first iteration.
            if ( open == 'firstGame' )
                {
                    break ;
                }
        }

    // After opening the games, clear the list of pending games.
    gamesToOpen = [ ] ;
    // Also, clear the badge text on the browser action icon.
    chrome.browserAction.setBadgeText( { text: "" } ) ;

} /* End of openGames function */


    /*
     * Initiates an asynchronous GET request to the Online-Go.com API
     * to fetch user notifications.
     */
function checkForGames( )
{
    // The response will be processed by the 'updateAwaitingGames' callback function.
    $.get( "https://online-go.com/api/v1/me/notifications" , updateAwaitingGames , "json" ) ;
}


/**
 * This callback function processes the notifications received from the API.
 * It identifies games awaiting the user's move and updates the browser action badge.
 * @param {Array} notifications - An array of notification objects.
 */
function updateAwaitingGames ( notifications )
{
        // Log the full notification payload for debugging purposes.
    console.debug( JSON.stringify( notifications ) ) ;

    var awaitingGamesNo = 0 ; // Counter for games awaiting a move.
    var newGamesToOpen = [ ] ; // Temporary array to hold new game IDs.

    // Loop through all received notifications.
    for ( var i = 0 ; i < notifications.length ; i++ )
    {
        // Check if the notification type indicates a 'yourMove' situation.
        if ( notifications [ i ] . type == 'yourMove' )
        {
            awaitingGamesNo ++ ; // Increment the counter.
            newGamesToOpen.push( notifications [ i ] . game_id ) ; // Add the game ID to the list.
        }
    }
    // Output the total number of awaiting games to the console.
    console.debug( "awaiting games number: " + awaitingGamesNo ) ;


    /* Determine the text to display on the browser action badge.
       It's the number of games if greater than 0, otherwise an empty string. */
    var awaitingGamesLabel = awaitingGamesNo > 0 ? "" + awaitingGamesNo : "" ;

    // Set the badge text on the Chrome browser action icon.
    chrome.browserAction.setBadgeText( { text: awaitingGamesLabel } ) ;

    // Update the global 'gamesToOpen' array with the newly found games.
    gamesToOpen = newGamesToOpen ;
} /* End of updateAwaitingGames function */


// Attach the 'openGames' function as a listener to the browser action button click event.
chrome.browserAction.onClicked.addListener( openGames ) ;


// Inform the console about the interval for checking games.
console.info( "setting game check interval to 1 minute" ) ;

// Set up a recurring timer to call 'checkForGames' every 60 seconds (60000 milliseconds).
window.setInterval( checkForGames , 60000 ) ;


/* Retrieve the user's preference regarding opening the chat tab on browser startup. */
var chatAtStartup = localStorage [ 'chatAtStartup' ] ;

// Check if the user wants to open the chat tab when the extension starts.
if ( chatAtStartup == "true" )
    {
        chrome.tabs.create( { url: "https://online-go.com/chat" } ) ;
    }


// Perform an immediate check for games upon extension startup.
checkForGames( ) ;

// Log a message indicating that the extension has successfully started.
console.info( "started" ) ;