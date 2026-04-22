/*
 * This is a Type I clone of the original Notifier system.
 * It functions identically, but has extensive changes in
 * whitespace and comments to appear visually distinct.
 *
 * All identifiers, keywords, operators, and expressions are
 * preserved exactly as in the original source code.
 */
var Notifier = function ()
{
    // Initialize properties for the Notifier instance.
    this.m_localStorageKey = 'notifier_event'; // Key used for localStorage operations
    this.m_isAvailable = this.isLocalStorageAvailable(); // Check if localStorage is supported
    this.m_notifierId = this.generateNotifierId(); // Generate a unique ID for this notifier
    this.bindEvent(); // Set up event listeners
} ;

/**
 *  Retrieve the unique identifier assigned to this Notifier instance.
 *
 *  @returns { String } The current notifier ID.
 */
Notifier.prototype.getNotifierId = function ( ) {
    return this.m_notifierId;
} ;


// Method to determine if the browser supports localStorage.
// @returns { boolean } True if localStorage is available, false otherwise.
Notifier.prototype.isLocalStorageAvailable = function()
{
    return typeof window.localStorage != 'undefined' && window.localStorage;
} ;


/*
 * Checks the availability status of the Notifier system.
 *
 * @returns { boolean } Indicates whether the Notifier can function.
 */
Notifier.prototype.isAvailable = function ( ) {
    return this.m_isAvailable ;
} ;


/**
 * Generates a random alphanumeric string to serve as a unique notifier ID.
 *
 * @param { number } [idLength=8] The desired length of the generated ID.
 * @returns { String | boolean } The generated ID string, or `false` if the notifier is not available.
 */
Notifier.prototype.generateNotifierId = function ( idLength )
{
    // Check if the notifier system itself is operational.
    if ( ! this.isAvailable ( ) )
        return false ;

    // Set a default length if none is provided.
    if ( ! idLength )
        idLength = 8 ;

    var nId = '' ; // Initialize the ID string
    var allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' ; // Characters for ID generation

    // Loop to build the ID character by character.
    for ( var i = 0 ; i < idLength ; ++ i )
    {
        // Append a random character from the allowed set.
        nId += allowedChars.charAt ( Math.floor ( Math.random ( ) * allowedChars.length ) ) ;
    }

    return nId ; // Return the generated ID.
} ;


/*
 * Establishes an event listener for changes within the localStorage.
 * This allows different browser tabs/windows to communicate.
 *
 * @returns { void | boolean } Returns `false` if the notifier is not available, otherwise nothing.
 */
Notifier.prototype.bindEvent = function ( )
{
    // Ensure the notifier is functional before binding events.
    if ( ! this.isAvailable ( ) ) {
        return false ;
    }

    var t = this ; // Cache 'this' for use within the event handler's scope.

    // Bind to the 'storage' event on the window object.
    $( window ).bind ( 'storage', function ( e ) {
        var evt = e.originalEvent ; // Access the native DOM event.

        // Check if the changed key is the one this notifier is interested in.
        if ( evt.key == t.m_localStorageKey )
        {
            // Parse the new value and pass it to the handler.
            t.handleLsEvent ( JSON.parse ( evt.newValue ) ) ;
        }
    } ) ;
} ;


/**
 * Processes incoming localStorage events based on their 'event' type.
 *
 * @param { Object } evt The event object received from localStorage.
 * @returns { void }
 */
Notifier.prototype.handleLsEvent = function ( evt )
{
    switch ( evt.event )
    {
        case 'audiostate' :
            this.handleAudioStateEvent ( evt ) ;
            break ;
        // Potentially more cases could be added here for other event types.
    }
} ;


/**
 * Sends a notification by saving data to localStorage, which in turn triggers
 * a 'storage' event in other browser contexts (tabs/windows).
 *
 * @param { String } event The name of the custom event to notify about (e.g., 'audiostate').
 * @param { Object } data Any relevant data associated with the event.
 * @returns { boolean } True if the notification was successfully sent, false otherwise.
 **/
Notifier.prototype.notify = function ( event, data )
{
    // Pre-check for notifier availability.
    if ( ! this.isAvailable ( ) ) {
        return false ;
    }

    // Construct the event object to be stored.
    var evt = {
        'notifier_id' : this.getNotifierId ( ) , // ID of the notifier sending this event
        'event' : event ,                     // The custom event name
        'event_data' : data ,                 // Data payload for the event
        'event_ts' : Math.round ( new Date ( ).getTime ( ) / 1000 ) // Timestamp of the event
    } ;

    try
    {
        // Store the stringified event object in localStorage.
        window.localStorage.setItem ( this.m_localStorageKey , JSON.stringify ( evt ) ) ;
    }
    catch ( e )
    {
        // Log any errors that occur during localStorage operations.
        console.error ( e ) ;
        return false ; // Indicate failure.
    }

    return true ; // Indicate success.
} ;

/* ======================================================================== */
/*                          Custom Event Handlers                           */
/* ======================================================================== */

/**
 * Handles the 'audiostate' custom event.
 * This method is called when another notifier signals an audio state change.
 *
 * @param { Object } evt The event object containing 'notifier_id' and 'event_data'.
 * @returns { void }
 */
Notifier.prototype.handleAudioStateEvent = function ( evt )
{
    // Only act if the event did NOT originate from this notifier instance.
    if ( evt.notifier_id != this.getNotifierId ( ) )
    {
        // Check the specific audio state being reported.
        if ( evt.event_data.state == 'play' )
        {
            // If another player started playing, pause the local player.
            // Assuming 'player' is a globally accessible object or defined elsewhere.
            player.pause ( ) ;
        }
    }
} ;