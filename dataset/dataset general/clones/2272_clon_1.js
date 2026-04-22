/*
 * Self-executing anonymous function to encapsulate the application logic.
 * This module depends on jQuery ($), Leaflet (L), and a prettySize utility
 * for human-readable file size conversions.
 */
( function ( $, L, prettySize ) {
    var map; // Global variable to hold the Leaflet map instance.
    var heat; // Global variable for the Leaflet heatmap layer.

    // Default configuration options for the heatmap layer.
    // These values can be modified by user controls later.
    var heatOptions = {
        tileOpacity: 1, // Opacity of the underlying map tiles (0-1).
        heatOpacity: 1, // Opacity of the heatmap overlay itself (0-1).
        radius: 25,     // Radius in pixels for each data point on the heatmap.
        blur: 15        // Amount of blur applied to the heatmap; higher values smooth the heatmap.
    };

    /*
     * Application entry point.
     * Initiates the first phase of the user interface and data loading process.
     */
    stageOne();


    /**
     * @function stageOne
     * @description Initializes the Leaflet map and configures the Dropzone for file uploads.
     * This function sets up the initial user interface for file selection.
     */
    function stageOne() {
        var dropzone; // Local variable to store the Dropzone instance.

        // Initialize the Leaflet map on the 'map' div.
        // Sets the initial view to coordinates [0,0] with a zoom level of 2.
        map = L.map( 'map' ) . setView( [ 0, 0 ], 2 );

        // Add a base tile layer from OpenStreetMap to the map.
        // Includes necessary attribution and defines the zoom level constraints.
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: 'location-history-visualizer is open source and available <a href="https://github.com/theopolisme/location-history-visualizer">on GitHub</a>. Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.',
                maxZoom: 18, // The maximum zoom level users can reach.
                minZoom: 2   // The minimum zoom level, providing a global view.
            }
        ).addTo( map ); // Attaches the configured tile layer to the map instance.

        // Initialize the Dropzone.js library for drag-and-drop file uploads.
        // The entire document body acts as the drop target.
        dropzone = new Dropzone(
            document.body,
            {
                url: '/', // A dummy URL, as file processing is handled client-side.
                // Suppress preview elements by creating an off-screen container.
                previewsContainer: document.createElement( 'div' ),
                clickable: false, // Disables Dropzone's default click-to-select-file behavior.
                accept: function ( file, done ) {
                    // When a file is dropped, move to the next stage of processing.
                    stageTwo( file );
                    dropzone.disable(); // Disable dropzone once a file has been received.
                }
            }
        );

        // Provides an alternative file input method for mobile devices
        // or users who prefer a traditional file picker.
        $( '#file' ).change(
            function () {
                // Process the first selected file and then disable the dropzone.
                stageTwo( this.files[0] );
                dropzone.disable();
            }
        );
    } // End of stageOne function definition.


    /**
     * @function stageTwo
     * @param {File} file - The File object containing the user's location history data.
     * @description This stage initializes the heatmap layer, updates the UI to reflect
     * the 'working' state, and begins the actual file processing.
     */
    function stageTwo( file ) {
        // Create an initial, empty heatmap layer and add it to the map.
        // Data will be populated into this layer after file parsing.
        heat = L.heatLayer( [ ], heatOptions ) . addTo( map );

        // Update the user interface to show the 'working' status.
        // This involves adding/removing CSS classes to control visibility.
        $( 'body' ).addClass( 'working' );
        $( '#intro' ).addClass( 'hidden' );
        $( '#working' ).removeClass( 'hidden' );

        // Kick off the file processing routine.
        processFile( file );

        /**
         * @private
         * @function status
         * @param {string} message - The message string to be displayed to the user.
         * @description A utility function to update the on-screen status message.
         */
        function status( message ) {
            $( '#currentStatus' ).text( message );
        }

        /**
         * @private
         * @function processFile
         * @param {File} file - The File object containing location data.
         * @description Reads the content of the provided file and delegates
         * to appropriate parsing functions based on file type.
         */
        function processFile( file ) {
            var fileSize = prettySize( file.size ); // Get a human-readable size for the file.
            var reader = new FileReader();           // Instantiate a new FileReader object.

            // Inform the user that the file import process is starting.
            status( 'Preparing to import file (' + fileSize + ')...' );

            /**
             * @private
             * @function getLocationDataFromJson
             * @param {string} data - The raw JSON string from Google Takeout.
             * @returns {Array<Array<number>>} An array of [latitude, longitude] pairs.
             * @throws {ReferenceError} If the JSON data does not contain expected location data.
             * @description Parses location data from a Google Takeout JSON file.
             */
            function getLocationDataFromJson( data ) {
                // Google stores latitude and longitude as integers scaled by 1e7.
                const SCALAR_E7 = 0.0000001;
                // Parse the JSON string and extract the 'locations' array.
                var locations = JSON.parse( data ) . locations;

                // Check if the 'locations' array exists and contains data.
                if ( !locations || locations.length === 0 ) {
                    throw new ReferenceError( 'No location data found.' );
                }

                // Map the raw location objects into a simpler array of [latitude, longitude] pairs.
                return locations.map( function ( location ) {
                    return [ location.latitudeE7 * SCALAR_E7, location.longitudeE7 * SCALAR_E7 ];
                } );
            }

            /**
             * @private
             * @function getLocationDataFromKml
             * @param {string} data - The raw KML string.
             * @returns {Array<Array<number>>} An array of [latitude, longitude] pairs.
             * @description Extracts location data from a KML file using regular expressions.
             */
            function getLocationDataFromKml( data ) {
                // Regular expression to find <when> and <gx:coord> elements in KML.
                // It captures timestamp, longitude, latitude, and altitude.
                const KML_DATA_REGEXP = /<when>(.*?)<\/when>\s*<gx:coord>(\S*)\s(\S*)\s(\S*)<\/gx:coord>/g;
                var locations = [ ]; // Array to store the parsed [latitude, longitude] points.
                var match = KML_DATA_REGEXP.exec( data ); // Perform the first regex match.

                /*
                 * Breakdown of the regex capture groups:
                 *   match[1]: ISO 8601 formatted timestamp (e.g., "2023-01-01T12:30:00Z").
                 *   match[2]: Longitude value.
                 *   match[3]: Latitude value.
                 *   match[4]: Altitude value (currently not used for visualization).
                 */

                // Loop through all occurrences found by the regular expression.
                while ( match !== null ) {
                    // Add the latitude and longitude (converted to Number) to the locations array.
                    // Note: KML's gx:coord order is longitude latitude altitude, so match[3] is lat, match[2] is lon.
                    locations.push( [ Number( match[3] ), Number( match[2] ) ] );
                    match = KML_DATA_REGEXP.exec( data ); // Find the next match.
                }

                return locations; // Return the collected array of location coordinates.
            }

            // Event handler for the FileReader's progress event.
            // Updates the UI with the percentage of the file loaded.
            reader.onprogress = function ( e ) {
                var percentLoaded = Math.round( ( e.loaded / e.total ) * 100 );
                status( percentLoaded + '% of ' + fileSize + ' loaded...' );
            };

            // Event handler for when the FileReader has successfully loaded the file content.
            reader.onload = function ( e ) {
                var latlngs; // Variable to store the extracted latitude/longitude data.

                status( 'Generating map...' ); // Update status to indicate map generation is in progress.

                try {
                    // Check the file extension to determine the correct parsing method.
                    if ( /\.kml$/i.test( file.name ) ) {
                        latlngs = getLocationDataFromKml( e.target.result );
                    } else {
                        // If not KML, assume it's a JSON file.
                        latlngs = getLocationDataFromJson( e.target.result );
                    }
                } catch ( ex ) {
                    // Catch and display any errors that occur during data parsing.
                    status( 'Something went wrong generating your map. Ensure you\'re uploading a Google Takeout JSON file that contains location data and try again, or create an issue on GitHub if the problem persists. (error: ' + ex.message + ')' );
                    return; // Exit the function if an error occurred.
                }

                // Assign the newly parsed location data to the heatmap layer.
                heat._latlngs = latlngs;

                // Force the heatmap layer to redraw with the new data.
                heat.redraw();
                // Proceed to the final stage, passing the total number of processed points.
                stageThree( latlngs.length );
            };

            // Event handler for FileReader errors during the file reading process.
            reader.onerror = function () {
                status( 'Something went wrong reading your JSON file. Ensure you\'re uploading a "direct-from-Google" JSON file and try again, or create an issue on GitHub if the problem persists. (error: ' + reader.error + ')' );
            };

            // Start reading the contents of the file as plain text.
            reader.readAsText( file );
        } // End of processFile function.
    } // End of stageTwo function.


    /**
     * @function stageThree
     * @param {number} numberProcessed - The count of location points successfully processed.
     * @description This final stage updates the UI to show completion, displays the total
     * number of points, and activates the interactive map controls.
     */
    function stageThree( numberProcessed ) {
        var $done = $( '#done' ); // Cache the jQuery selector for the 'done' message element.

        // Transition the UI from 'working' state to 'done' state.
        $( 'body' ).removeClass( 'working' );
        $( '#working' ).addClass( 'hidden' );
        $done.removeClass( 'hidden' );

        // Update the display with the total number of location points processed.
        $( '#numberProcessed' ).text( numberProcessed.toLocaleString() );

        // Attach a one-time click handler to the 'done' message.
        // This makes the message disappear and enables map interaction.
        $done.one( 'click', function () {
            $( 'body' ).addClass( 'map-active' ); // Add class to indicate map is now primary focus.
            $done.fadeOut();                      // Animate the 'done' message fading out.
            activateControls();                   // Enable the map customization controls.
        } );

        /**
         * @private
         * @function activateControls
         * @description Sets up event listeners for the map customization controls,
         * allowing users to adjust heatmap and tile layer properties.
         */
        function activateControls() {
            var $tileLayer = $( '.leaflet-tile-pane' );         // jQuery object for the base tile layer DOM element.
            var $heatmapLayer = $( '.leaflet-heatmap-layer' ); // jQuery object for the heatmap canvas layer.
            // Create a deep copy of the current heatmap options to use for resetting later.
            var originalHeatOptions = $.extend( {}, heatOptions );

            /**
             * @private
             * @function updateInputs
             * @description Synchronizes the values of the UI input elements
             * with the current state of the `heatOptions` object.
             */
            function updateInputs() {
                var option; // Loop variable for iterating through heatmap options.
                for ( option in heatOptions ) {
                    // Ensure the property belongs directly to heatOptions, not its prototype chain.
                    if ( heatOptions.hasOwnProperty( option ) ) {
                        // Update the value of the corresponding HTML input element.
                        document.getElementById( option ).value = heatOptions[option];
                    }
                }
            }

            updateInputs(); // Call once to set the initial values of the control inputs.

            // Attach a change event listener to all elements with the 'control' class.
            $( '.control' ).change( function () {
                // Use a switch statement to handle different controls based on their ID.
                switch ( this.id ) {
                    case 'tileOpacity':
                        // Adjust the CSS opacity of the base map tile layer.
                        $tileLayer.css( 'opacity', this.value );
                        break;
                    case 'heatOpacity':
                        // Adjust the CSS opacity of the heatmap overlay layer.
                        $heatmapLayer.css( 'opacity', this.value );
                        break;
                    default:
                        // For other controls (like radius, blur), update heatOptions and redraw the heatmap.
                        heatOptions[ this.id ] = Number( this.value ); // Convert input value to a number.
                        heat.setOptions( heatOptions );                 // Apply the updated options to the heatmap.
                        break;
                }
            } );

            // Attach a click event listener to the 'reset' button.
            $( '#reset' ).click( function () {
                // Restore the heatmap options to their original values.
                $.extend( heatOptions, originalHeatOptions );
                updateInputs();           // Update the UI input elements to reflect the reset options.
                heat.setOptions( heatOptions ); // Apply the reset options to the heatmap layer.

                // Explicitly reset the CSS opacity for both layers, as setOptions might not handle this.
                $heatmapLayer.css( 'opacity', originalHeatOptions.heatOpacity );
                $tileLayer.css( 'opacity', originalHeatOptions.tileOpacity );
            } );
        } // End of activateControls function.
    } // End of stageThree function.

}( jQuery, L, prettySize ) ); // Immediately invoke the function with its dependencies.