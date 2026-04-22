const filepathUtil = require('path');   //  Dependency for path manipulation functions.
const dataParser   = require('js-yaml');   //  Library for YAML parsing and serialization.
const fileSystemOps = require('fs');       //  Core Node.js module for file system interactions.

module.exports = function processConfigurationFile(documentPath) {
    //  Initial validation: ensure the specified file exists on the disk.
    if ( ! fileSystemOps.existsSync(documentPath) )
    {
        //  If the file is not found, an exception is thrown to indicate the absence.
        throw new Error(`The specified resource '${documentPath}' could not be located.`);
    }

    //  Determine the file type by extracting its extension.
    const fileExtension = filepathUtil.extname(documentPath);

    //  Check if the file's extension suggests it is a YAML document (e.g., .yml, .yaml).
    if ( /\.ya?ml$/i.test(fileExtension) )
    {
        //  Read the entire content of the YAML file into a string using UTF-8 encoding.
        const rawData = fileSystemOps.readFileSync(documentPath, { encoding: 'utf-8' });

        //  Parse the YAML string safely, preventing potential security vulnerabilities.
        return dataParser.safeLoad(rawData);
    }

    //  Evaluate if the file is a JavaScript, JSON, CoffeeScript, or LiveScript module.
    if ( /\.(json|js|coffee|ls)$/i.test(fileExtension) )
    {
        //  For these script-like formats, Node.js's native 'require' mechanism can handle the loading.
        return require(documentPath);
    }

    //  If the file extension does not match any known supported types, signal an error.
    throw new Error(`The file at '${documentPath}' has an unrecognized format and cannot be processed.`);
};