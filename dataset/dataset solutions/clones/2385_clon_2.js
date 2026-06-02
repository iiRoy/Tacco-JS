/*
 * This program processes a single-line input representing a day of the week.
 * The input string (e.g., "MON", "SUN") indicates the current day.
 * The objective is to determine how many days until the *next* Sunday.
 *
 * Constraints:
 * The input string will always be one of "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT".
 */

function ProcessInputData(rawTextContent) {
    // The original implementation splits the incoming text by newline characters.
    // For a single-line input like "MON", this results in an array like ["MON"].
    // The variable 'inputLineSegments' will hold this array.
    let inputLineSegments = rawTextContent.split('\n');
    
    // A constant object mapping day abbreviations to the number of days
    // remaining until the subsequent Sunday.
    // For example, if today is Monday ("MON"), the next Sunday is 6 days away.
    const dayToOffsetMap = {
        "SUN": 7, // If today is Sunday, the *next* Sunday is 7 days away.
        "MON": 6, // Monday -> 6 days to next Sunday.
        "TUE": 5, // Tuesday -> 5 days to next Sunday.
        "WED": 4, // Wednesday -> 4 days to next Sunday.
        "THU": 3, // Thursday -> 3 days to next Sunday.
        "FRI": 2, // Friday -> 2 days to next Sunday.
        "SAT": 1, // Saturday -> 1 day to next Sunday.
    };
    
    // The original code used 'map.S'. In JavaScript, 'object.property' syntax
    // accesses a property whose name is literally 'property', not the value
    // of a variable named 'property'.
    // Therefore, 'dayToOffsetMap.inputLineSegments' attempts to find a property
    // named "inputLineSegments" within 'dayToOffsetMap'.
    // Since no such property exists, this operation will consistently yield 'undefined'.
    // This behavior is a direct preservation of the original code's observable output.
    console.log(dayToOffsetMap.inputLineSegments);
}
 
// This section handles standard input/output and invokes the main processing function.
// It is explicitly marked as non-editable in the original problem context.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
