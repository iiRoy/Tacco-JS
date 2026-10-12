// This script evaluates a date provided via standard input
// to determine if it precedes a specific historical timestamp.
function ProcessInputData(rawData) {
    // The incoming string is expected in a "YYYY/MM/DD" format.
    // We split it by the forward slash to isolate year, month, and day components.
    let parsedSegments = rawData.split('/');

    // We then construct a standard date string "YYYY-MM-DD" and parse it
    // into the number of milliseconds that have elapsed since the Unix epoch (January 1, 1970, 00:00:00 UTC).
    let epochTimeMillis = Date.parse(`${parsedSegments[0]}-${parsedSegments[1]}-${parsedSegments[2]}`);

    // A conditional check is performed against a fixed epoch timestamp.
    // The value 1556636400000 represents May 1, 2019, 00:00:00 UTC.
    if (epochTimeMillis < 1556636400000) {
        // If the parsed date is earlier than this specific timestamp,
        // the string 'Heisei' is printed to the console.
        return console.log('Heisei');
    }
    else {
        // Otherwise, if the date is on or after the timestamp,
        // the string 'TBD' is outputted.
        return console.log('TBD');
    }
}

// The program initiates by reading data from standard input.
// It uses the 'fs' module to synchronously read the entire content of '/dev/stdin'
// as a UTF-8 encoded string, and then passes this string to the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
