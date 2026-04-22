showLog = true; /* Global flag to control logging output */

// Core logging utility function
function log( m )
{
    // Check if console is available and logging is enabled
    if ( window.console && showLog )
    {
        console.log( m ); // Output message to console
    }
}

/*
 * Query string parser utility
 * Extracts a specific field's value from the URL query string.
 */
function parseQuery( fldNm )
{
    // Regular expression to find the field in the query string
    var oRe = new RegExp( "[\\?&]" + fldNm + "=([^&#]*)", "i" );

    // Execute the regex against the parent window's location search string
    var fldVal = oRe.exec( parent.location.search );

    // Return the unescaped value if found, otherwise an empty string
    return ( fldVal ) ? unescape( fldVal[1] ) : "";
}


/*
 * Document ready function using jQuery
 * This block executes once the DOM is fully loaded.
 */
$( document ).ready( function ()
{

    // Define the test mode for the application
    test_mode = "full";
    // "full"      = displays all pass/fail outputs for each test case
    // "partial"   = shows a list of classes generated for each user agent string
    // "generate"  = generates a new array of user agent strings suitable for testing
    //               (useful after all initial testing is complete)

    // Initialize counters for passed and failed tests
    passed = 0;
    failed = 0;

    // Initialize an empty string to accumulate output HTML
    output = '';

    // Get the root HTML element
    h = document.documentElement;


    // Construct HTML for displaying current navigator and generated classes
    currentNavigator = '<h1><div class="user_agent">Your UA string: ' + navigator.userAgent + '<\/div><div class="generated_classes">Your HTML classes: ' + h.className + '<\/div><\/h1>';

    // If in "full" test mode, add a specific class to the document element
    if ( test_mode == "full" )
    {
        document.documentElement.className = document.documentElement.className + " full_test";
    }

    // Get the total number of user agent strings to process
    all = user_agent_strings.length;

    // If in "generate" mode, open a <pre> tag for preformatted output
    if ( test_mode == "generate" )
    {
        output += '<pre>';
    }


    /*
     * Iterate through each user agent string defined in the 'user_agent_strings' array.
     * 'index' is the current position, 'item' is the current array element [ua_string, expected_classes].
     */
    $.each( user_agent_strings, function( index, item )
    {
        // Extract the user agent string
        ua = item[0];

        // Extract the expected CSS classes for this user agent
        codes_expected = item[1];

        // Generate CSS classes using the browser selector function
        codes_returned = css_browser_selector( ua );


        /*
         * Remove specific classes that depend on the environment rather than the UA string itself.
         * These include orientation, min-width, max-width, and hi-dpi related classes.
         */
        codes_returned = codes_returned.replace( / ?orientation_\w+/g, "" ).replace( / [min|max|cl]+[w|h]_\d+/g, "" );
        codes_returned = codes_returned.replace( /\s(no-)?hidpi/, "" );


        // Log the processed (returned) codes for debugging
        log( "|" + codes_returned + "|" );

        // Determine the class for the output div based on expected codes
        generate_class = ( codes_expected == "header" ) ? codes_expected : "result partial";

        // Handle "generate" test mode output
        if ( test_mode == "generate" )
        {
            output += ( codes_expected == "header" ? '<br /><br />' : '<br />' ) +
                      '\t["' + ua + '","' + ( ( codes_expected == "header" ) ? codes_expected : codes_returned ) + '"]' +
                      ( index < all - 1 ? ',' : '' ) +
                      ( codes_expected == "header" ? '<br />' : '' );
        }
        // Handle "partial" test mode or header output
        else if ( test_mode == "partial" || codes_expected == "header" )
        {
            output += '<div class="' + generate_class + '"><h3>' + ua + '<\/h3>' +
                      ( codes_expected != "header" ? '\n<div class="returned">generated: ' + codes_returned + '<\/div>\n' : '' ) +
                      '<\/div>';
        }
        // Handle successful test case (expected matches returned)
        else if ( codes_expected == codes_returned )
        {
            output += '<div class="result pass"><h3>' + ua + '<\/h3>\n<div class="returned">got: ' + codes_returned + '<\/div>\n<\/div>';
            passed++; // Increment passed count
        }
        // Handle failed test case (expected does not match returned)
        else
        {
            output += '<div class="result fail">\n<h3>' + ua + '<\/h3>\n<div class="expected">expected: ' + codes_expected + '<\/div>\n<div class="got">got: ' + codes_returned + '<\/div>\n<\/div>';
            failed++; // Increment failed count
        }
    } ); // End of $.each loop


    // If in "generate" mode, close the <pre> tag
    if ( test_mode == "generate" )
    {
        output += '</pre>';
    }

    // Prepare header HTML for passed and failed test counts
    var passHead = '<h2 class="pass passed">' + passed + ' tests passed<\/h2>',
        failHead = '<h2 class="fail failed">' + failed + ' tests failed<\/h2>',
        outputHeaders =
            currentNavigator + "\n" +
            ( test_mode == "full" ? passHead + "\n" + failHead : "" ); // Only show pass/fail headers in full test mode


    // Create a container div and append it to the body
    $( "<div/>" ).attr( "id", "container" ).appendTo( "body" );

    // Append the generated headers to the container
    $( outputHeaders ).appendTo( "#container" );

    // Create a results div within the container
    $( "<div/>" ).attr( "id", "results" ).appendTo( "#container" );

    // Append the accumulated test results HTML to the results div
    $( output ).appendTo( "#results" );

    // Add "odd" class for zebra striping to alternate result rows
    $( "#results .result:odd" ).addClass( "odd" );

} ); // End of document.ready function