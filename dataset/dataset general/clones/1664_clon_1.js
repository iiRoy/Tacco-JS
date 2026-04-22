// This line imports the built-in Node.js File System module.
// It's essential for performing file-related operations, such as reading files from the disk.
var     fs   =   require   (   "fs"   )   ;


/*
 *
 *  This JSDoc comment block provides a comprehensive description for the primary function.
 *  It details its purpose, expected input parameters, and the nature of its return value.
 *
 *  @summary Synchronously parses a Gettext Portable Object (PO) file and transforms its content into a structured JSON object.
 *
 *  @description
 *  This function is responsible for initiating the parsing process of a specified PO file.
 *  It first resolves the real, canonical path of the input file (handling symlinks, etc.)
 *  and then reads its entire content into memory. Subsequently, it passes this raw file data
 *  along with any provided options to an internal parsing utility for conversion.
 *  The operation is synchronous, meaning it will block the Node.js event loop
 *  until the file has been successfully read and processed.
 *
 *  @param   { String }   fileName        - The absolute or relative path string indicating the location of the PO file that needs to be parsed.
 *  @param   { Object }   [ options ]     - An optional configuration object. This object can contain various properties
 *                                          that customize the behavior of the parsing logic, which is handled by the internal parsing module.
 *  @returns { Object | String }          - Returns a JavaScript Object representing the parsed data from the PO file.
 *                                          Depending on the content of the PO file or specific options provided,
 *                                          it might also return a String in certain edge cases or error scenarios.
 *
 */

module   .   exports   =   function   (   fileName   ,   options   )
{

    // First step: Resolve the real path of the file and then read its entire content.
    // `fs.realpathSync` ensures that any symbolic links are resolved to their actual target.
    // `fs.readFileSync` then reads the file's content into a Buffer.
    var     data     =   fs   .   readFileSync   (   fs   .   realpathSync   (   fileName   )   )   ;


    // Second step: Delegate the actual parsing logic to a separate, internal module.
    // This modular approach keeps the concerns separated and promotes reusability.
    // The `data` (file content) and `options` are passed directly to the parser.
    return   require   (   "./parse"   )   (   data   ,   options   )   ;

}   ;