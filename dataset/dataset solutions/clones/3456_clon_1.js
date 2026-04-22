/*
 * This JavaScript module processes a list of cities provided via standard input.
 * It assigns a unique, formatted identifier to each city based on its prefecture
 * and its chronological order of establishment within that prefecture.
 * Finally, it outputs these identifiers.
 */

// Establish a convenient alias for console.log for quick logging.
log = console.log;


// Utilize the 'fs' module to synchronously read all data from standard input.
// The input is expected to be encoded in UTF-8.
var stdin = require("fs") . readFileSync( "/dev/stdin" ,  "UTF-8" );


// Break down the raw input string into an array of individual lines.
// Each line typically represents data for one city or initial parameters.
var lines = stdin . split ( "\n" ) ;


// From the very first line of input, extract the first numerical value.
// This is typically 'N', representing the total number of cities.
var N = Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ;


// Also from the first line, extract the second numerical value.
// This is typically 'M', which might be an unused parameter or for other purposes.
var M = Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ;


// Remove the initial line (which contained N and M) from the 'lines' array.
// The array now exclusively holds city-specific data lines.
lines = lines . splice ( 1 ) ;


/*
 * Transform the array of raw city data lines into an array of structured city objects.
 * Each object will temporarily store its original input order (cityIndex),
 * its prefecture ID (P), and its year of establishment (Y).
 */
cities = lines . map ( ( v , i ) => {

        // Parse the prefecture ID from the first space-separated part of the line.
        P = Number ( v . split ( " " ) [ 0 ] ) ;

        // Parse the establishment year from the second space-separated part of the line.
        Y = Number ( v . split ( " " ) [ 1 ] ) ;

        // Construct and return the city object.
        return {
                cityIndex : i ,        // Original zero-based index for sorting later
                prefecture : P ,       // Numeric prefecture identifier
                year : Y               // Numeric year of establishment
        } ;
} ) ;


/*
 * Sort the 'cities' array. The primary sorting key is the 'year' property.
 * This chronological ordering is crucial for correctly assigning sequential IDs
 * within each prefecture later on.
 */
cities . sort ( ( a , b ) => {
        // Sort in ascending order based on the 'year' property.
        return a . year - b . year ;
} ) ;


// Initialize an array to serve as a counter for cities within each prefecture.
// The index of this array will correspond to the prefecture ID.
count = [ ] ;


/*
 * Re-process the 'cities' array to assign a unique, formatted identifier to each city.
 * This ID incorporates the prefecture and a sequential number based on the city's year.
 */
cities = cities . map ( c => {

        // Check if this prefecture has been encountered before.
        // If not, initialize its count to 1; otherwise, increment its existing count.
        count [ c . prefecture ] === undefined
                ? ( count [ c . prefecture ] = 1 )
                : ( count [ c . prefecture ] += 1 ) ;


        // Format the prefecture ID into a six-digit string, padding with leading zeros if necessary.
        P = "000000" + c . prefecture . toString ( ) ;
        P = P . substr ( P . length - 6 , 6 ) ; // Extract the last 6 characters.


        // Format the sequential city count (within its prefecture) into a six-digit string.
        id = "000000" + count [ c . prefecture ] . toString ( ) ;
        id = id . substr ( id . length - 6 , 6 ) ; // Extract the last 6 characters.


        /*
         * Return a new city object containing the original index and the newly formatted IDs.
         * Note: The 'year' property here uses the global 'Y' variable, which retains the
         * value from the last iteration of the *previous* map function. This is a characteristic
         * of the original code's variable scoping and is preserved as per Type I cloning rules.
         */
        return {
                cityIndex : c . cityIndex , // Retain the original input order index.
                prefecture : P ,            // The formatted six-digit prefecture ID.
                year : Y ,                  // The year (as per original code's 'Y' variable).
                id : id                     // The formatted six-digit sequential city ID.
        } ;
} ) ;


/*
 * Re-sort the 'cities' array back into its original input order.
 * This is achieved by sorting based on the 'cityIndex' property.
 */
cities . sort ( ( a , b ) => {
        // Sort in ascending order based on the original 'cityIndex'.
        return a . cityIndex - b . cityIndex ;
} ) ;


/*
 * Finally, iterate through the re-ordered cities and output the
 * concatenated formatted prefecture ID and unique city ID for each.
 */
cities . forEach ( c =>
        // Log the combined string to standard output.
        console . log ( c . prefecture . toString ( ) + c . id . toString ( ) )
) ;