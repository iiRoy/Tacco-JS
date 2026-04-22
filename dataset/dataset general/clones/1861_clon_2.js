// This utility module manages a dynamic collection of data entries.

let theRegistry = []; // Initialize an internal storage array for various records.

/*
 *   Function: obtainRecords
 *   Purpose: To retrieve the complete current set of stored data entries.
 *   Returns: An array instance containing all currently registered items.
 */
function obtainRecords()
{
    return theRegistry;
}


/*
 *   Function: depositEntry
 *   Purpose: To append a new, structured data entry into the main registry.
 *   Parameters:
 *     - firstArg: The primary component value for the new entry.
 *     - secondArg: The secondary component value for the new entry.
 */
function depositEntry( firstArg, secondArg )
{
    // Construct a new object literal with distinct property labels.
    theRegistry.push( { alpha: firstArg, beta: secondArg } );
}


/*
 *   Function: flushStorage
 *   Purpose: To completely reset the internal data registry, effectively
 *            erasing all previously stored entries.
 *   Side Effects: The 'theRegistry' variable is reassigned to an empty array.
 */
function flushStorage()
{
    theRegistry = [  ]; // Replace the existing array with a brand new, empty one.
}