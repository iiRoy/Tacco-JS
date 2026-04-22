/*
 * This is a JavaScript file containing cron job management logic.
 * It uses jQuery for DOM manipulation and AJAX requests.
 */

// Define a global array of page identifiers.
var PAGES = [ 'home' , 'new' , 'active' ] ;


// Execute code when the DOM is fully loaded and ready.
$( document ).ready( function ( ) {
    /*
     * Get the current hash from the window location.
     * This is used to determine which page to display initially.
     */
    var hash = window.location.hash ;

    // Check if the hash corresponds to the 'new' page.
    if ( hash == '#new' )
    {
        changePage( 'new' ) ;
    }

    // Check if the hash corresponds to the 'active' page.
    if ( hash == '#active' )
    {
        changePage( 'active' ) ;
    }


    /*
     * Bind click event handlers to various buttons.
     * The 'save-btn' triggers onSaveButtonClick.
     */
    $( '#save-btn' ).bind( 'click' , onSaveButtonClick ) ;

    // All elements with class 'delete-all-btn' trigger onDeleteAllJobsClick.
    $( '.delete-all-btn' ).bind( 'click' , onDeleteAllJobsClick ) ;
} ) ;


/*
 * Function to handle the click event for deleting all jobs.
 * This sends an AJAX request to clear all cron jobs.
 * @param {Event} event - The click event object.
 */
function onDeleteAllJobsClick( event )
{
    // Perform an AJAX GET request to the deleteall.php script.
    $.ajax( { url : "lib/deleteall.php" } ).done( function ( data )
    {
        // Reload the page after successful deletion to reflect changes.
        location.reload( ) ;
    } ) ;
}


/*
 * Function to handle the click event for deleting a specific job.
 * Sends a POST request with the job ID to be deleted.
 * @param {number} jobID - The ID of the job to be deleted.
 */
function onDeleteJobClick( jobID )
{
    // Send a POST request to deletejob.php with the job ID.
    $.post( "lib/deletejob.php" ,
        { "jobid" : jobID } ,
        function ( data )
        {
            // Reload the page upon successful deletion.
            location.reload( ) ;
        }
    ) ;
}


/*
 * Function to handle the click event for saving a new cron job.
 * Gathers input values from form fields and sends them via AJAX.
 * @param {Event} event - The click event object.
 */
function onSaveButtonClick( event )
{
    // Retrieve values from various input fields.
    var minute = $( '.add-minute' ).val( ) ;
    var hour = $( '.add-hour' ).val( ) ;
    var dayweek = $( '.add-dayweek' ).val( ) ;
    var daymonth = $( '.add-daymonth' ).val( ) ;
    var month = $( '.add-month' ).val( ) ;
    var name = $( '.add-name' ).val( ) ;
    var command = $( '.add-command' ).val( ) ;

    // Send a POST request to add.php with all the cron job details.
    $.post( "lib/add.php" ,
        {
            "minute" : minute ,
            "hour" : hour ,
            "dayweek" : dayweek ,
            "daymonth" : daymonth ,
            "month" : month ,
            "name" : name ,
            "command" : command
        } ,
        function ( data )
        {
            // Log the response data to the console for debugging.
            console.log( data ) ;

            // Change to the 'active' page after adding a new job.
            changePage( 'active' ) ;
        }
    ) ;
}


/*
 * Function to change the currently displayed page.
 * It hides all pages and shows the specified one, updating navigation.
 * @param {string} page - The identifier of the page to display.
 */
function changePage( page )
{
    // First, refresh the list of active cron jobs.
    getActiveCronjobs( ) ;

    // Iterate through all defined pages and hide them.
    for ( var i = 0 ; i < PAGES.length ; i++ )
    {
        $( '#' + PAGES[ i ] ).hide( ) ;
    }

    // Remove the 'active' class from all navigation list items.
    $( '.nav li' ).removeClass( 'active' ) ;

    // Show the specified page element.
    $( '#' + page ).show( ) ;

    // Add the 'active' class to the navigation item corresponding to the current page.
    $( '.nav-' + page ).addClass( 'active' ) ;
}


/*
 * Function to fetch and display active cron jobs.
 * It makes an AJAX request to retrieve job data and populates a table.
 */
function getActiveCronjobs( )
{
    // Perform an AJAX GET request to active.php to get cron job data in JSON format.
    $.getJSON( 'lib/active.php' , function ( data )
    {
        var items = '' ; // Initialize an empty string to build table rows.

        // Iterate over the received JSON data.
        $.each( data , function ( key , val )
        {
            // Split the cron job string by spaces.
            var n = val.split( ' ' ) ;

            // Start a new table row.
            items += '<tr>' ;

            // Iterate over the parts of the cron job string.
            $.each( n , function ( x , y )
            {
                // Add a table data cell for each part.
                items += '<td>' + y + '</td>' ;
            } ) ;

            // Add a 'Remove' button with an onclick handler for deleting the job.
            items += '<td><a class="btn btn-warning remove_' + key + '" onclick="onDeleteJobClick(' + key + ')">Remove</a></td>' ;

            // Close the table row.
            items += '</tr>' ;
        } ) ;

        // Insert the generated HTML into the '.active-job-list' element.
        $( '.active-job-list' ).html( items ) ;
    } ) ;
}