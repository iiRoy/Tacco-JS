/*
 * This module defines a function responsible for processing
 * a given record, specifically tailoring it for CSS injection.
 * It ensures the record's MIME type is set correctly and
 * generates a JavaScript string for dynamic CSS injection.
 */

exports = module.exports = function (
    record,     // The record object to be processed.
    options,    // Optional configuration settings (unused in this specific logic).
    callback    // The callback function to be invoked upon completion.
)
{
    // Assign the appropriate MIME type for CSS content.
    // This is a crucial step for proper content identification.
    record.mimetype = "text/css" ;

    // Construct the 'processed' string. This string represents
    // a JavaScript call to 'servitude.injectCSS' with the
    // entire record object stringified as its argument.
    // This allows the client-side to dynamically inject CSS.
    record.processed = 'servitude.injectCSS('  +  JSON.stringify(record)  +  ');' ;


    // Invoke the provided callback function.
    // The first argument is null, indicating no error occurred.
    // The second argument is the modified record object.
    callback(
        null,       // No error to report.
        record      // The updated record object.
    ) ;

} ; // End of the module's exported function.