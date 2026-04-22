/*
 * This file contains example code for interacting with the Google Analytics API.
 * It demonstrates authentication and data retrieval for specific metrics and dimensions.
 */
"use strict"
    ;/* Enforce strict mode for better error handling and cleaner code. */


var ga = require( '../lib/ga' )
    ; /* Import the 'ga' module from the local library path. */


// Initialize profile, username, and password variables.
// These would typically be loaded from a configuration file or environment variables.
var profile = ''
    ;
var username = ''
    ;
var password = ''
    ;


/* Create a new instance of the Google Analytics client. */
var GA = new ga.GA(
    {
        user: username,
        password: password
    }
)
    ;


// Define the dimensions to be queried from Google Analytics.
// 'ga:date' is used to group data by day.
var dimensions =
    [
        'ga:date'
    ]
    ;


// Define the metrics to be queried from Google Analytics.
// These include pageviews, visitors, transactions, and transaction revenue.
var metrics =
    [
        'ga:pageviews',
        'ga:visitors',
        'ga:transactions',
        'ga:transactionRevenue'
    ]
    ;


/*
 * Attempt to log in to the Google Analytics service.
 * The callback function handles the result of the login attempt.
 */
GA.login( function ( err, token ) {
    /* Handle any login errors. */
    if ( err ) {
        console.error( 'Login failed:', err );
        return;
    }

    /* Define query options for the GA data request. */
    var options =
        {
            'ids': 'ga:' + profile,                 // Google Analytics profile ID.
            'start-date': '2012-07-01',             // Start date for the data query.
            'end-date': '2012-07-02',               // End date for the data query.
            'dimensions': dimensions.join( ',' ),   // Comma-separated list of dimensions.
            'metrics': metrics.join( ',' ),         // Comma-separated list of metrics.
            'sort': 'ga:date'                       // Sort the results by date.
        }
        ;/* End of options object. */

    /*
     * Make a request to the Google Analytics API to retrieve data based on the defined options.
     * The callback function processes the retrieved entries or handles errors.
     */
    GA.get( options, function ( err, entries ) {
        if ( !err )
        {
            /* If no error occurred, print the CSV header. */
            console.log( 'date,pageviews,visitors,transactions,sales' )
                ;
            /* Iterate over each entry (row) received from GA. */
            entries.forEach( function ( entry ) {
                /* Initialize a buffer with the date dimension. */
                var buf = entry.dimensions[ 0 ][ 'ga:date' ]
                    ;

                /* Append each metric to the buffer, separated by commas. */
                metrics.forEach( function ( metric ) {
                    buf += ',' + entry.metrics[ 0 ][ metric ]
                        ;
                } )
                    ;

                /* Print the complete row to the console. */
                console.log( buf )
                    ;

            } )
                ;
        }
        else
        {
            /* If an error occurred during data retrieval, log it. */
            console.log( err )
                ;
        }
    } )
        ; /* End of GA.get callback. */
} )
    ; /* End of GA.login callback. */