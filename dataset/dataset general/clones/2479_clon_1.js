/*
 * This JavaScript code handles dynamic population of date dropdowns
 * and fetches/renders bug graph data using AJAX and Flot.js.
 *
 * It's structured into three main functions:
 * 1. populatedropdown: Initializes month and year selection dropdowns.
 * 2. getBugGraph: Orchestrates fetching bug data from a server.
 * 3. getlatestgraph: Processes the fetched data and renders it as a time-series graph.
 */


// Global array containing the full names of months, used for display purposes.
var monthtext = [
    'January',   /* Month 0  */
    'February',  /* Month 1  */
    'March',     /* Month 2  */
    'April',     /* Month 3  */
    'May',       /* Month 4  */
    'June',      /* Month 5  */
    'July',      /* Month 6  */
    'August',    /* Month 7  */
    'September', /* Month 8  */
    'October',   /* Month 9  */
    'November',  /* Month 10 */
    'December'   /* Month 11 */
];


/**
 * Populates 'month' and 'year' HTML select elements.
 * It creates options for all 12 months and the current year plus 4 preceding years.
 *
 * @param {string} monthfrom - The DOM ID of the 'month from' select element.
 * @param {string} yearfrom  - The DOM ID of the 'year from' select element.
 * @param {string} monthto   - The DOM ID of the 'month to' select element.
 * @param {string} yearto    - The DOM ID of the 'year to' select element.
 */
function populatedropdown( monthfrom, yearfrom, monthto, yearto )
{

    // Get the current date object to determine the current year and month.
    var today = new Date();

    // Obtain references to the HTML select elements using their provided IDs.
    var monthfrom = document.getElementById( monthfrom );
    var yearfrom  = document.getElementById( yearfrom );
    var monthto   = document.getElementById( monthto );
    var yearto    = document.getElementById( yearto );


    // Loop through all 12 months to add them as options to both month dropdowns.
    for ( var m = 0; m < 12; m++ )
    {
        monthfrom.options[ m ] = new Option( monthtext[ m ], m ); // Add month option to 'month from'.
        monthto.options[ m ]   = new Option( monthtext[ m ], m );   // Add month option to 'month to'.
    }


    // Get the current full year.
    var thisyear = today.getFullYear();

    // Loop to populate year dropdowns. It adds the current year and the four previous years.
    for ( var y = 0; y < 5; y++ )
    {
        yearfrom.options[ y ] = new Option( thisyear, thisyear ); // Add year option to 'year from'.
        yearto.options[ y ]   = new Option( thisyear, thisyear );   // Add year option to 'year to'.
        thisyear -= 1;                                            // Decrement year for the next iteration.
    }


    // Set default selected values for the month dropdowns.
    // 'January' (index 0) is pre-selected for the 'month from' dropdown.
    monthfrom.options[ 0 ] = new Option( 'January', 0, true, true );

    // The current month is pre-selected for the 'month to' dropdown.
    monthto.options[ today.getMonth() ] = new Option( monthtext[ today.getMonth() ], today.getMonth(), true, true );

}


/**
 * Initiates an AJAX call to retrieve bug graph data from the server.
 * It constructs the request based on selected date ranges from dropdowns,
 * processes the server's response, and then passes the data to `getlatestgraph` for rendering.
 */
function getBugGraph()
{

    // Create a new XMLHttpRequest object for asynchronous communication.
    var xmlhttp = new XMLHttpRequest();

    // Define the event handler for when the readyState of the request changes.
    xmlhttp.onreadystatechange = function()
    {
        // Check if the request is complete (readyState 4).
        if ( xmlhttp.readyState == 4 )
        {
            // Extract the 'retrivalTime' from the XML response.
            var i      = xmlhttp.responseText.indexOf( "retrivalTime" ) + "retrivalTime/>".length;
            var j      = xmlhttp.responseText.indexOf( '</span>', i );
            var upTime = xmlhttp.responseText.substring( i, j );

            // Update the 'retrivalTime' element on the webpage with the extracted time.
            var rt = document.getElementById( "retrivalTime" );
            rt.innerHTML = "Last Updated On : " + upTime;

            // Extract and evaluate the 'datasets' from the XML response.
            // Note: `eval` can be a security risk if the source of `responseText` is untrusted.
            i = xmlhttp.responseText.indexOf( 'datasets', j ) + "datasets/>".length;
            j = xmlhttp.responseText.indexOf( '</span>', i );
            var datasets = eval( xmlhttp.responseText.substring( i, j ) );

            // Call the graph rendering function with the fetched data and date range.
            getlatestgraph( datasets, fromDate, toDate );
        }
    };


    // Define the base URL for the bug graph API endpoint.
    var url = "buggraph?";

    // Get references to the HTML select elements for month and year ranges.
    var monthfrom = document.getElementById( "monthFrom" );
    var yearfrom  = document.getElementById( "yearFrom" );
    var monthto   = document.getElementById( "monthTo" );
    var yearto    = document.getElementById( "yearto" );

    // Extract the selected values from the dropdowns.
    // Add 1 to month selectedIndex as it's 0-based.
    var monfrom = ( monthfrom.selectedIndex + 1 ).toString();
    var yrfrom  = yearfrom.options[ yearfrom.selectedIndex ].value;
    var monto   = ( monthto.selectedIndex + 1 ).toString();
    var yrto    = yearto.options[ yearto.selectedIndex ].value;


    // Pad single-digit month values with a leading '0' for consistent date formatting.
    if ( monfrom.length == 1 )
    {
        monfrom = '0' + monfrom;
    }
    if ( monto.length == 1 )
    {
        monto = '0' + monto;
    }


    // Construct the 'fromDate' and 'toDate' strings in YYYY/MM/DD format.
    // The day is fixed to '01' for the start date and '31' for the end date.
    fromDate = yrfrom + "/" + monfrom + "/" + "01";
    toDate   = yrto   + "/" + monto   + "/" + "31";


    // Validate the selected date range: 'From Date' must not be later than 'To Date'.
    if ( ( new Date( toDate ) ) < ( new Date( fromDate ) ) )
    {
        alert( 'Please Enter the year correctly (From Date < To Date)' );
        return; // Exit the function if the date range is invalid.
    }


    // Assemble the URL parameters for the AJAX request.
    var parameters = 'fromDate=' + fromDate + '&toDate=' + toDate;

    // Open the XMLHttpRequest with GET method, the constructed URL, and asynchronous flag set to true.
    xmlhttp.open( "GET", url + parameters, true );
    // Send the request to the server.
    xmlhttp.send( null );

}


/**
 * Processes raw bug data and renders it as a time-series graph using Flot.js.
 * It categorizes bugs into 'New', 'Confirmed', and 'Wishlist' series,
 * configures the graph's appearance (axes, legend, grid), and adds interactive tooltips on hover.
 *
 * @param {Array}  data     - The raw bug data, typically an array of arrays.
 * @param {string} fromDate - The start date string (YYYY/MM/DD) for the graph's X-axis range.
 * @param {string} toDate   - The end date string (YYYY/MM/DD) for the graph's X-axis range.
 */
function getlatestgraph( data, fromDate, toDate )
{
    // Initialize arrays to store the processed data for each bug category.
    var newbug    = [];
    var confirmed = [];
    var wishlist  = [];


    // Iterate through the input data to categorize and format it for Flot.js.
    // The outer loop `i` represents the bug category (0: New, 1: Confirmed, 2: Wishlist).
    for ( var i in data )
    {
        // The inner loop `j` iterates through individual bug entries within a category.
        for ( var j in data[ i ] )
        {
            // Each entry `data[i][j]` is expected to be [year, month, count].
            // Convert year and month to a timestamp for the X-axis.
            var dateTimestamp = ( new Date( data[ i ][ j ][ 0 ] + '/' + data[ i ][ j ][ 1 ] + '/01' ) ).getTime();
            var bugCount      = data[ i ][ j ][ 2 ];

            if ( i == 0 )
            {
                // New bugs series: [timestamp, count].
                newbug.push( [ dateTimestamp, bugCount ] );
            }
            else if ( i == 1 )
            {
                // Confirmed bugs series: [timestamp, count].
                confirmed.push( [ dateTimestamp, bugCount ] );
            }
            else
            {
                // Wishlist bugs series: [timestamp, count].
                wishlist.push( [ dateTimestamp, bugCount ] );
            }
        }
    }


    // Initialize the Flot.js plot on the element with ID "placeholder".
    $.plot( $( "#placeholder" ),
        [
            // Data series for "New" bugs.
            {
                data: newbug,
                label: "New",
                lines: { show: true, lineWidth: 1 }
            },
            // Data series for "Confirmed" bugs.
            {
                data: confirmed,
                label: "Confirmed",
                lines: { show: true, lineWidth: 1 }
            },
            // Data series for "Wishlist" bugs.
            {
                data: wishlist,
                label: "Wishlist",
                lines: { show: true, lineWidth: 1 }
            }
        ],
        // Configuration options for the Flot.js plot.
        {
            xaxis: {
                mode: "time",                // X-axis displays time values.
                timeformat: "%b%y",          // Format time ticks as "MonthYear" (e.g., Jan15).
                minTickSize: [ 1, "month" ], // Minimum interval between ticks is one month.
                min: ( new Date( fromDate ) ).getTime(), // Set the minimum X-axis value (start date).
                max: ( new Date( toDate ) ).getTime()     // Set the maximum X-axis value (end date).
            },
            yaxis: {
                min: 0                       // Y-axis starts from zero.
            },
            shadowSize: 1,                   // Small shadow effect for the series.
            selection: { mode: "xy" },       // Enable selection (zooming) on both X and Y axes.
            legend: {
                show: true,                  // Display the legend.
                position: 'nw',              // Position the legend in the north-west corner.
                noColumns: 3                 // Display legend items in 3 columns.
            },
            grid: {
                hoverable: true,             // Enable hover events on the plot.
                clickable: true,             // Enable click events on the plot.
                backgroundColor: "#fffaff"   // Set a light background color for the grid area.
            },
            points: { show: true }           // Display points on the data lines.
        }
    );


    /**
     * Helper function to display a custom tooltip near the mouse pointer.
     *
     * @param {number} x        - The X-coordinate for the tooltip's position.
     * @param {number} y        - The Y-coordinate for the tooltip's position.
     * @param {string} contents - The HTML string to be displayed inside the tooltip.
     */
    function showTooltip( x, y, contents )
    {
        $( '<div id="tooltip">' + contents + '</div>' ) // Create a new div for the tooltip.
            .css( {
                position: 'absolute',
                display: 'none',
                top: y + 5,
                left: x + 5,
                border: '1px solid #fdd',
                padding: '2px',
                'background-color': '#fee',
                opacity: 0.80
            } )
            .appendTo( "body" ) // Add the tooltip to the body.
            .fadeIn( 200 );     // Fade it in over 200 milliseconds.
    }


    var previousPoint = null; // Variable to store the data point that was previously hovered over.

    // Bind the 'plothover' event to the graph placeholder.
    // This event fires when the mouse moves over the plot.
    $( "#placeholder" ).bind( "plothover", function ( event, pos, item )
    {
        // Update display elements (if any) with current mouse coordinates.
        $( "#x" ).text( pos.x.toFixed( 0 ) );
        $( "#y" ).text( pos.y.toFixed( 0 ) );

        // Check if the mouse is currently hovering over a data point (item is not null).
        if ( item )
        {
            // If the hovered data point is different from the previously hovered one.
            if ( previousPoint != item.datapoint )
            {
                previousPoint = item.datapoint; // Update `previousPoint`.

                $( "#tooltip" ).remove(); // Remove any existing tooltip.

                // Extract the x (timestamp) and y (bug count) values from the hovered data point.
                var x  = item.datapoint[ 0 ],
                    y  = item.datapoint[ 1 ];
                var dt = new Date( x ); // Convert the timestamp back to a Date object.

                // Format the date for the tooltip label (e.g., "January 2023").
                var labelX = monthtext[ dt.getMonth() ] + " " + dt.getFullYear();

                // Customize the tooltip content based on the series label.
                if ( item.series.label == 'New' )
                {
                    showTooltip( item.pageX, item.pageY,
                        y + " " + item.series.label + " Bugs " + " of " + labelX );
                }
                else if ( ( item.series.label == 'Confirmed' ) )
                {
                    showTooltip( item.pageX, item.pageY,
                        y + ' (' + item.series.label + "+Inprogress )" + "Bugs of " + labelX );
                }
                else
                {
                    showTooltip( item.pageX, item.pageY,
                        y + " " + item.series.label + " of " + labelX );
                }
            }
        }
        else
        {
            // If the mouse is not hovering over any data point, remove the tooltip.
            $( "#tooltip" ).remove();
            previousPoint = null; // Reset `previousPoint`.
        }
    } );

}