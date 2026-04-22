'use strict'; /** * This module contains various controller functions for different timeline views, * along with a utility function to populate Angular scope objects. */

/**
 * A helper function designed to transfer specific properties from a source object
 * to a destination context object. This is often used to expose fetched data
 * directly onto an Angular $scope or similar view model.
 *
 * @param {object} context    The target object (e.g., $scope) where properties will be assigned.
 * @param {object} sourceInfo The source object from which property values are retrieved.
 * @param {Array<string>} targetKeys An array of strings, where each string is a property name
 *                                   to be copied from `sourceInfo` to `context`.
 */
function populateContext( context , sourceInfo , targetKeys ) {
    // Iterate through each key specified in the `targetKeys` array.
    for ( const keyIter in targetKeys ) {
        // Ensure that `keyIter` is an own property of `targetKeys` to avoid iterating prototype chain.
        if ( Object.prototype.hasOwnProperty.call( targetKeys , keyIter ) ) {
            const currentKey = targetKeys[keyIter]; // Get the actual key name.
            context[currentKey] = sourceInfo[currentKey]; // Assign the value from source to destination.
        }
    }
}

/**
 * Controller for managing the daily health timeline view.
 * It fetches and displays health-related data specific to a single day.
 *
 * @param {object} $viewContext   The Angular scope object associated with the daily view.
 * @param {object} $dataFetcher   The Angular $http service for making API calls.
 */
function DailySummaryController( $viewContext , $dataFetcher ) {
    // Initiate an asynchronous GET request to retrieve daily timeline data.
    $dataFetcher.get( 'http://hreader.local/timeline.json?page=day' , { cache : false } )
        .success( function( fetchedPayload ) {
            // Once data is successfully retrieved, populate the view context with key metrics.
            populateContext( $viewContext , fetchedPayload , [ 'vitals' , 'results' , 'symptoms' , 'pain' , 'mood' , 'energy' , 'conditions' , 'levels' ] );

            // Assign specific data fields directly to the view context.
            $viewContext.prescriptions = fetchedPayload.timeline_medications;
            $viewContext.displayPattern = 'yyyy/d/MM'; // Define the date format for display.
        } );
}

/**
 * Controller responsible for the weekly health overview.
 * It fetches and processes data aggregated over a week.
 *
 * @param {object} $viewContext   The Angular scope for the weekly view.
 * @param {object} $dataFetcher   The Angular $http service.
 */
function WeeklyOverviewController( $viewContext , $dataFetcher ) {
    // Fetch data tailored for a weekly timeline.
    $dataFetcher.get( 'http://hreader.local/timeline.json?page=week' , { cache : false } )
        .success( function( fetchedPayload ) {
            // Load the relevant weekly data points into the view model.
            populateContext( $viewContext , fetchedPayload , [ 'vitals' , 'symptoms' , 'levels' , 'conditions' , 'observations' , 'start_date' , 'end_date' ] );
        } );
}

/**
 * Controller for the monthly health report.
 * It retrieves and presents data for a given month.
 *
 * @param {object} $viewContext   The Angular scope for the monthly view.
 * @param {object} $dataFetcher   The Angular $http service.
 */
function MonthlyReportController( $viewContext , $dataFetcher ) {
    // Request monthly timeline data from the backend.
    $dataFetcher.get( 'http://hreader.local/timeline.json?page=month' , { cache : false } )
        .success( function( fetchedPayload ) {
            // Populate the view context with monthly specific attributes.
            populateContext( $viewContext , fetchedPayload , [ 'vitals' , 'symptoms' , 'medications' , 'conditions' , 'encounters' , 'start_date' , 'end_date' ] );
        } );
}

/**
 * Controller for the annual health digest.
 * It gathers and displays health information over a full year.
 *
 * @param {object} $viewContext   The Angular scope for the annual view.
 * @param {object} $dataFetcher   The Angular $http service.
 */
function AnnualDigestController( $viewContext , $dataFetcher ) {
    // Execute an HTTP GET request to obtain yearly timeline data.
    $dataFetcher.get( 'http://hreader.local/timeline.json?page=year' , { cache : false } )
        .success( function( fetchedPayload ) {
            // Transfer the yearly health data into the view model for rendering.
            populateContext( $viewContext , fetchedPayload , [ 'vitals' , 'symptoms' , 'conditions' , 'treatments' , 'start_date' , 'end_date' ] );
        } );
}

/**
 * Controller for the decennial health chronicle.
 * This controller handles data spanning an entire decade.
 *
 * @param {object} $viewContext   The Angular scope for the decennial view.
 * @param {object} $dataFetcher   The Angular $http service.
 */
function DecennialChronicleController( $viewContext , $dataFetcher ) {
    // Send a request to fetch data for the decadal timeline.
    $dataFetcher.get( 'http://hreader.local/timeline.json?page=decade' , { cache : false } )
        .success( function( fetchedPayload ) {
            // Populate the view context with decadal data points.
            populateContext( $viewContext , fetchedPayload , [ 'vitals' , 'symptoms' , 'conditions' , 'levels' , 'start_date' , 'end_date' ] );
            // Expose the global Math object to the scope for complex calculations within the view.
            $viewContext.Calculus = window.Math;
        } );

    /**
     * Calculates the horizontal pixel offset for a timeline entry based on its timestamp.
     * This function is exposed on the scope for use in the view.
     *
     * @param {object} recordItem An object representing a single entry in the timeline,
     *                            expected to have a `timestamp` property.
     * @returns {object} An object containing a 'horizontalPos' property with the calculated pixel value.
     */
    $viewContext.ChroniclePosition = function( recordItem ) {
        // Perform a complex calculation to determine the position value.
        // The constants are specific to the timeline's scaling logic.
        const positionValue = ( recordItem.timestamp * 1000 - ( 1.01e+12 ) ) / ( 315569259747 / 460 );
        // Return an object that can be directly used for CSS styling (e.g., ng-style).
        return { 'horizontalPos' : positionValue + 'px' };
    };
}