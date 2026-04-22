var   activeTab    =    null ;   /* Stores the currently active tab identifier. */
var   activeCollapse   =   null ;   // Stores the identifier of the currently open accordion panel.

var   timeago      =    true ;   // Flag to enable/disable "time ago" formatting for events.
var   autorefresh  =    true ;   // Flag to enable/disable automatic data refreshing.

var   cache        =    {}   ;   /* A simple object used for caching UI element states. */


/*
 * Helper functions to check media queries for responsive design.
 * These are attached directly to the window object for global access.
 */
window . matchMediaPhone  =  function ( )
{
    return  matchMedia ( '(max-width: 767px)' ) . matches ;
}


window . matchMediaTablet  =  function ( )
{
    return  matchMedia ( '(min-width: 768px) and (max-width: 979px)' ) . matches ;
}


window . matchMediaDesktop  =  function ( )
{
    return  matchMedia ( '(min-width: 979px)' ) . matches ;
}

// Initialize the 'timeago' setting by fetching configuration from the server.
$ . ajax (
    {
        type        :  "GET" ,
        url         :  "/api/config/eventtimeago" ,
        contentType :  "application/json; charset=utf-8" ,
        dataType    :  "json" ,
        data        :  "{}" ,
        success     :  function ( res )
        {
            // Update the global 'timeago' flag based on the server response.
            timeago  =  res . eventtimeago . toLowerCase ( )  ==  "true" ;
        }
    }
) ;


/**
 * Processes a list of events and renders them using a Handlebars template.
 * Each event's datetime is converted to a human-readable calendar format.
 *
 * @param {Array<Object>} list - The array of event objects to process.
 * @returns {string} The HTML string rendered by the Handlebars template.
 */
function  createEvents ( list )
{
    // Retrieve the Handlebars template source from the DOM.
    var   source    =    $ ( "#events-template" ) . html ( ) ;
    var   template  =    Handlebars . compile ( source ) ;


    // Reverse the list and format the time for each event.
    list . reverse ( ) . forEach (
        function ( ev ,   i )
        {
            ev . time  =  moment ( ev . datetime ) . calendar ( ) ;
        }
    ) ;

    // Render the template with the processed events and the global timeago setting.
    return  template ( { events : list ,   timeago : timeago } ) ;
}


/*
 * Generates detailed information for zones and partitions using a Handlebars template.
 * It processes raw data, assigns display properties, and determines active collapse states.
 *
 * @param {Object} obj - The main data object containing zone and partition information.
 * @param {string} templateId - The ID of the Handlebars template to use.
 * @returns {string} The rendered HTML string for the details section.
 */
function  details ( obj ,   templateId )
{
    // Fetch the Handlebars template from the specified ID.
    var   source    =    $ ( templateId ) . html ( ) ;
    var   template  =    Handlebars . compile ( source ) ;


    var   zones     =    [ ] ; // Array to hold processed zone objects.
    // Iterate through potential zone IDs (1 to 64).
    for ( var   i  =  1 ;   i  <  65 ;   i ++ )
    {
        var   zone  =  obj . zone [ i + '' ] ; // Access zone data using stringified index.
        if ( zone  &&  zone . name )
        {
            zone . id       =  i ;
            // Determine CSS class based on zone status.
            zone . class    =  zone . status . open  ?  'badge-important'  :  'badge-success' ;
            // Determine icon based on zone status.
            zone . icon     =  ! zone . status . open  ?  'icon-ok-sign'     :  'icon-minus-sign' ;
            // Create events HTML for the zone.
            zone . events   =  createEvents ( zone . lastevents ) ;
            zone . selected =  "" ;
            // Check if this zone's collapse panel is currently active.
            if ( activeCollapse  ==  "collapseZone"  +  i )
            {
                zone . selected  =  "in" ;
            }
            zones . push ( zone ) ;
        }
    }


    var   partitions  =  [ ] ; // Array to hold processed partition objects.
    // Iterate through potential partition IDs (1 to 64).
    for ( var   i  =  1 ;   i  <  65 ;   i ++ )
    {
        var   partition  =  obj . partition [ i + '' ] ; // Access partition data using stringified index.
        if ( partition  &&  partition . name )
        {
            partition . id       =  i ;
            // Determine CSS class based on partition status.
            partition . class    =  partition . status . ready  ?  'badge-success'  :  'badge-important' ;
            // Determine icon based on partition status.
            partition . icon     =  partition . status . ready  ?  'icon-ok-sign'   :  'icon-minus-sign' ;
            // Create events HTML for the partition.
            partition . events   =  createEvents ( partition . lastevents ) ;
            partition . selected =  "" ;
            // Check if this partition's collapse panel is currently active.
            if ( activeCollapse  ==  "collapsePart"  +  i )
            {
                partition . selected  =  "in" ;
            }
            partitions . push ( partition ) ;
        }
    }


    // Render the template with all processed data.
    return  template (
        {
            zones                  :  zones ,
            zoneAllEvents          :  createEvents ( obj . zone . lastevents ) ,
            partitions             :  partitions ,
            partitionAllEvents     :  createEvents ( obj . partition . lastevents ) ,
            zoneAllSelected        :  activeCollapse  ==  "collapseZoneAll"  ?  "in"  :  "" ,
            partitionAllSelected   :  activeCollapse  ==  "collapsePartAll"  ?  "in"  :  ""
        }
    ) ;
}


// Generates action buttons based on the current alarm system status.
function  actions ( obj )
{
    // Get the Handlebars template for actions.
    var   source    =    $ ( "#actions-template" ) . html ( ) ;
    var   template  =    Handlebars . compile ( source ) ;

    // Return the rendered template with status-dependent action flags.
    return  template (
        {
            // 'arm' button is active if partition 1 is not armed and not in exit delay.
            arm    :  ! obj . partition [ "1" ] . status . armed  &&  ! obj . partition [ "1" ] . status . exit_delay ,
            // 'disarm' button is active if partition 1 is armed.
            disarm :  obj . partition [ "1" ] . status . armed ,
            // 'cancel' button is active if partition 1 is in exit delay.
            cancel :  obj . partition [ "1" ] . status . exit_delay ,
            // 'pgm' button is active if partition 1 has PGM output active.
            pgm    :  obj . partition [ "1" ] . status . pgm_output
        }
    ) ;
}


/**
 * Initiates the disarm process for the alarm system.
 * Prompts the user for their alarm code using alertify.
 */
function  disarm ( )
{
    // Display a prompt for the alarm code.
    alertify . prompt (
        "What is your code?" ,
        function ( e ,   code )
        {
            // If the user confirmed (e is true), proceed with the disarm action.
            if ( e )
            {
                doAction ( "/api/alarm/disarm?alarmcode="  +  code ) ;
            }
        }
    ) ;
}


/*
 * Triggers a PGM (Programmable Output) on the alarm system.
 * First prompts for the PGM number, then for the alarm code.
 */
function  pgm ( )
{
    // Prompt for the PGM number to trigger.
    alertify . prompt (
        "Enter PGM # to trigger" ,
        function ( e ,   pgmnum )
        {
            if ( e )
            {
                // If PGM number is provided, prompt for the alarm code.
                alertify . prompt (
                    "What is your code?" ,
                    function ( e1 ,   code )
                    {
                        if ( e1 )
                        {
                            // If alarm code is provided, execute the PGM action.
                            doAction ( "/api/pgm?pgmnum="  +  pgmnum  +  "&alarmcode="  +  code ) ;
                        }
                    }
                ) ;
            }
        }
    ) ;
}


/**
 * Arms the alarm system, requiring an alarm code.
 * Logs the code to console and calls doAction on success, shows error on failure.
 */
function  armwithcode ( )
{
    // Prompt the user for their alarm code.
    alertify . prompt (
        "What is your code?" ,
        function ( e ,   code )
        {
            if ( e )
            {
                // Log the provided code (for debugging purposes).
                console . log ( code ) ;
                // Execute the arming action with the provided code.
                doAction ( "/api/alarm/armwithcode?alarmcode="  +  code ) ;
            }
            else
            {
                // If user cancels or provides no code, display an error message.
                alertify . error ( "not armed" ) ;
            }
        }
    ) ;
}


/*
 * Executes an AJAX request to the specified action URL.
 * Handles success and error responses by logging and displaying alertify messages.
 *
 * @param {string} action - The URL endpoint for the action to be performed.
 */
function  doAction ( action )
{
    console . log ( action ) ; // Log the action URL for debugging.

    // Perform an AJAX GET request.
    $ . ajax (
        {
            type        :  "GET" ,
            url         :  action ,
            contentType :  "application/json; charset=utf-8" ,
            dataType    :  "json" ,
            success     :  function ( res )
            {
                console . log ( res . response ) ; // Log the server's response.
                alertify . success ( res . response ) ; // Display success message.
            } ,
            error       :  function ( )
            {
                alertify . error ( "error performing action" ) ; // Display error message.
            }
        }
    ) ;
}


/**
 * Updates the message display area with current alarm system statuses.
 * Checks various status flags for partition 1 and appends corresponding labels.
 *
 * @param {Object} obj - The main data object containing partition information.
 */
function  message ( obj )
{
    var   str  =  '' ; // Initialize an empty string to build the HTML message.

    // Check for entry delay status.
    if ( obj . partition [ "1" ] . status . entry_delay )
    {
        str  +=  '<span class="label label-info">Entry delay</span>' ;
    }

    // Check for exit delay status.
    if ( obj . partition [ "1" ] . status . exit_delay )
    {
        str  +=  '<span class="label label-info">Exit delay</span>' ;
    }

    // Check for alarm status.
    if ( obj . partition [ "1" ] . status . alarm )
    {
        str  +=  '<span class="label label-important">Alarm</span>' ;
    }

    // Check for trouble status.
    if ( obj . partition [ "1" ] . status . trouble )
    {
        str  +=  '<span class="label label-warning">Trouble</span>' ;
    }

    // Check for tamper status.
    if ( obj . partition [ "1" ] . status . tamper )
    {
        str  +=  '<span class="label label-warning">Tamper</span>' ;
    }

    // Check for PGM output in progress status.
    if ( obj . partition [ "1" ] . status . pgm_output )
    {
        str  +=  '<span class="label label-info">PGM Output in progress</span>' ;
    }

    // Update the '#message' element with the generated HTML and fade it in.
    $ ( '#message' ) . html ( str ) . fadeIn ( ) ;
}


/*
 * Updates a DOM element's HTML content if its value has changed or if forced.
 * Stores the new value in a cache object to prevent unnecessary updates.
 *
 * @param {string} id - The ID selector of the DOM element to update.
 * @param {string} value - The new HTML content to set.
 * @param {boolean} force - If true, forces an update regardless of value change.
 * @returns {boolean} True if the element was updated, false otherwise.
 */
function  update ( id ,   value ,   force )
{
    var   old  =  cache [ id ] ; // Retrieve the old value from cache.

    // Check if the value has changed or if the update is forced.
    if ( old  !=  value  ||  force )
    {
        $ ( id ) . html ( value ) . fadeIn ( ) ; // Update element HTML and fade in.
        cache [ id ]  =  value ; // Store the new value in cache.
        return  true ; // Indicate that an update occurred.
    }
    return  false ; // Indicate no update occurred.
}


/**
 * Refreshes the entire UI with the latest data from the server.
 * Updates various sections like details, actions, and messages,
 * while maintaining active tab and collapse states.
 *
 * @param {boolean} force - If true, forces updates regardless of value changes.
 */
function  refresh ( force )
{
    // Perform an AJAX GET request to the main API endpoint.
    $ . ajax (
        {
            type        :  "GET" ,
            url         :  "/api" ,
            contentType :  "application/json; charset=utf-8" ,
            dataType    :  "json" ,
            data        :  "{}" ,
            success     :  function ( res )
            {
                // Check if the current device is a phone.
                if ( matchMediaPhone ( ) )
                {
                    // Update mobile-specific details.
                    update ( '#mobile-details' ,   details ( res ,   "#mobile-template" ) ,   force ) ;
                }
                else
                {
                    // Update desktop/tablet details.
                    // Note: The original code has a comma operator here, which is preserved.
                    if ( update ( '#details' ,   details ( res ,   "#template" ) ) ,   force )
                    {
                        // Restore active tab if one was previously selected.
                        if ( activeTab )
                        {
                            $ ( '#tabs a[href="'  +  activeTab  +  '"]' ) . tab ( 'show' ) ;
                        }
                    }
                }
                // Update the actions section.
                update ( '#actions' ,   actions ( res ) ,   force ) ;
                // Initialize Bootstrap tabs.
                $ ( '#tabs' ) . tab ( ) ;

                // Event listener for when a tab is shown to update activeTab.
                $ ( '#tabs a[data-toggle="tab"]' ) . on (
                    'shown' ,
                    function ( e )
                    {
                        activeTab  =  e . target . hash ;
                    }
                ) ;
                // Event listeners for accordion panels to update activeCollapse.
                $ ( '.accordion-body' ) . on (
                    'show' ,
                    function ( )
                    {
                        activeCollapse  =  this . id ;
                    }
                ) . on (
                    'hide' ,
                    function ( )
                    {
                        activeCollapse  =  null ;
                    }
                ) ;

                // Add 'active' class to autorefresh button if enabled.
                if ( autorefresh )
                {
                    $ ( "#autorefresh" ) . addClass ( 'active' ) ;
                }

                // Add 'active' class to timeago button if enabled.
                if ( timeago )
                {
                    $ ( "#timeago" ) . addClass ( 'active' ) ;
                }

                // Display system messages.
                message ( res ) ;
            }
        }
    ) ;
}


// Document ready function: executes when the DOM is fully loaded.
$ ( document ) . ready (
    function ( )
    {
        refresh ( ) ; // Perform an initial refresh of the UI.
        FastClick . attach ( document . body ) ; // Initialize FastClick for mobile responsiveness.
    }
) ;


// Set up an interval to periodically refresh the data if autorefresh is enabled.
setInterval (
    function ( )
    {
        if ( autorefresh )
        {
            refresh ( false ) ; // Refresh without forcing all updates.
        }
    } ,
    5000 // Refresh every 5000 milliseconds (5 seconds).
) ;