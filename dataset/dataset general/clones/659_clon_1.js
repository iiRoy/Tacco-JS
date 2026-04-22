/*
 * This script is designed to process Geonames postal code data
 * and import it into a MongoDB database collection.
 * It uses the 'optimist' library for command-line argument parsing
 * and 'csv' for handling CSV file parsing.
 */

// --- Section 1: Command-line Argument Parsing ---

// Parse the command-line options provided by the user.
// The 'optimist' library helps define and validate these arguments.
var   argv =   require('optimist')
    // Define the script's usage message, displayed if arguments are incorrect or missing.
    .usage('Usage: $0 -f [geonamesFile] -c [configFile]')

    // Ensure that both the 'file' (-f) and 'config' (-c) options are provided.
    .demand(['f' , 'c'])

    // Establish an alias for the 'f' option, allowing '--file' to be used.
    .alias('f' , 'file')

    // Provide a description for the 'f' option, explaining its purpose and format.
    .describe('f' , 'Path to a Geonames postal codes file, e.g. /tmp/US.txt')

    // Establish an alias for the 'c' option, allowing '--config' to be used.
    .alias('c' , 'config')

    // Provide a description for the 'c' option, explaining its purpose and format.
    .describe('c' , 'Path to a Javascript configuration file, e.g. /tmp/local.config.js')

    // Finally, parse the arguments and store them in the 'argv' object.
    .argv
; // End of optimist chain for argument parsing.


// --- Section 2: MongoDB Connection Initialization ---

// Load the custom 'mongo-postal' library, which handles MongoDB interactions.
var mongoPostal = require('../lib/mongo-postal') ;

// Log the configuration file being used for MongoDB settings.
console.log( "Using MongoDB settings in configuration file: %s" , argv.config );

// Import the Node.js file system module for reading the configuration file.
var fs = require('fs');

// Read the configuration file specified by argv.config, parse it as JSON,
// and store the settings in the 'config' variable.
var config = JSON.parse(fs.readFileSync(argv.config , 'utf-8'));

// Initialize the database connection using settings from 'config'
// and then select the specific collection for postal codes.
var dbCollection = mongoPostal.initDb(config) .collection(config.mongo.collection);


/*
 * --- Section 3: Geonames Postal Code File Processing ---
 *
 * This section reads the specified Geonames postal codes file,
 * transforms the data, and saves it into the MongoDB collection.
 */

// Inform the user about the file currently being processed.
console.log( "Reading postal codes from Geonames file: %s" , argv.file );

// Set up necessary indexes in the MongoDB collection for efficient querying.
mongoPostal.setUpIndexing(dbCollection);

// Load the 'csv' parsing library.
var csv = require('csv');

// Begin the CSV parsing pipeline:
csv()
    // Specify the input file path and parsing options.
    .fromPath(argv.file , {
        // The delimiter used in the Geonames file is a tab character.
        delimiter : '\t' ,
        // Define the column headers for easier access to data fields.
        columns : [
            'country_code' ,  // ISO country code (e.g., "US")
            'postal_code'  ,  // The postal code itself
            'place_name'   ,  // Name of the place/city
            'admin_name1'  ,  // First order administrative division name (e.g., state)
            'admin_code1'  ,  // First order administrative division code
            'admin_name2'  ,  // Second order administrative division name (e.g., county)
            'admin_code2'  ,  // Second order administrative division code
            'admin_name3'  ,  // Third order administrative division name
            'admin_code3'  ,  // Third order administrative division code
            'latitude'     ,  // Geographic latitude coordinate
            'longitude'    ,  // Geographic longitude coordinate
            'accuracy'        // Accuracy of the coordinates
        ]
    })
    // Apply a transformation function to each row of data.
    // This maps the raw CSV data into a more suitable format for MongoDB.
    .transform(function(data , index) {
        // Return a new object with renamed and structured fields.
        return {
            country     : data.country_code ,
            zipcode     : data.postal_code  ,
            city        : data.place_name   ,
            state_long  : data.admin_name1  ,
            state_short : data.admin_code1  ,

            /*
             * Convert the provided longitude and latitude properties
             * into a MongoDB GeoJSON 'loc' object (array of [longitude, latitude]).
             * This format is crucial for geospatial indexing in MongoDB.
             * (Refer to: http://www.mongodb.org/display/DOCS/Geospatial+Indexing for more details)
             */
            loc : [
                parseFloat(data.longitude) ,
                parseFloat(data.latitude)
            ]
        };
    })
    // Event listener for each transformed data record.
    .on('data' , function(data , index) {
        // Save the processed postal code data into the MongoDB collection.
        mongoPostal.savePostalCode(dbCollection , data);
    })
    // Event listener for when the entire file has been processed.
    .on('end' , function(count) {
        // Log the total number of postal codes processed.
        console.log( 'Number of postal codes: ' + count );
        // Exit the process after successful completion.
        process.exit();
    })
    // Event listener for any errors encountered during processing.
    .on('error' , function(error) {
        // Log the error message to the console.
        console.error(error.message);
    })
; // End of CSV processing chain.