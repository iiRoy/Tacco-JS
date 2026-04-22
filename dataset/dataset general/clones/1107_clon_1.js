/*
 * This file contains the Babel compiler plugin for Meteor.
 * It integrates Babel for transpiling modern JavaScript syntax.
 *
 * It uses Npm modules for core functionalities like file system access
 * and path manipulation, as well as the Babel core library.
 */
var    to5    =     Npm.require    (    'babel-core'    )   ;
var    fs     =     Npm.require    (    'fs'         )   ;
var    path   =     Npm.require    (    'path'       )   ;



/*
 * Helper function to merge properties from a source object into a destination object.
 * This is a shallow merge, overwriting existing properties in destination.
 * @param {Object} destination - The target object to receive properties.
 * @param {Object} source      - The object providing properties to merge.
 * @returns {Object} The modified destination object.
 */
Object    .    merge    =    function    (    destination    ,    source    )
{
        // Iterate over all enumerable properties of the source object.
        for     (    var    property    in    source    )
        {
                // Assign the property value from source to destination.
                destination    [    property    ]    =    source    [    property    ]    ;
        }

        // Return the updated destination object.
        return    destination    ;
}



/*
 * Default configuration settings for the Babel plugin.
 * These can be overridden by a 'babel.json' file in the application root.
 */
var    defaultConfig    =
{
    "debug"      :    false      ,    /* Flag to indicate whether to print the loaded configuration. */
    "verbose"    :    true       ,    /* Flag to indicate whether to print active file extensions.   */
    "extensions" :    [    'es6.js'    ,    'es6'    ,    'jsx'    ]    ,    // List of file extensions that Babel should process.
    "stage"      :    0          // Babel stage for experimental features (e.g., ES7 proposals).
}    ;



/*
 * The main handler function registered with Meteor's plugin system.
 * This function processes source files through Babel.
 *
 * @param {Object} compileStep  - Object provided by Meteor containing file information and utilities.
 * @param {boolean} isLiterate  - Flag indicating if the file is a literate programming file (unused here).
 */
var    handler    =    function    (    compileStep    ,    isLiterate    )
{
    // Read the source content of the file.
    var    source    =    compileStep    .    read    (    )    .    toString    (    'utf8'    )    ;

    // Determine the output file path.
    var    outputFile    =    compileStep    .    inputPath    +    ".js"    ;

    // Variable to hold Babel's output.
    var    to5output    =    ""    ;


    try
    {
        // Attempt to transform the source code using Babel.
        to5output    =    to5    .    transform    (    source    ,
        {
            blacklist    :    [    "useStrict"    ]    ,    // Prevent Babel from adding 'use strict'; directives.
            sourceMap    :    true               ,    // Generate a source map for easier debugging.
            stage        :    config    .    stage    ,    // Apply the configured Babel stage.
            filename     :    compileStep    .    pathForSourceMap    // Path for source map reference.
        }    )    ;
    }
    catch    (    e    )
    {
        // If an error occurs during transformation, log it and report to Meteor.
        console    .    log    (    e    )    ;    /* Display the nicely formatted Babel error message. */

        return    compileStep    .    error    (
        {
            message    :    'Babel transform error'    ,
            sourcePath    :    compileStep    .    inputPath    ,
            line        :    e    .    loc    .    line    ,
            column      :    e    .    loc    .    column
        }    )    ;
    }


    // Add the transformed JavaScript code and its source map to the compile step.
    compileStep    .    addJavaScript    (
    {
        path        :    outputFile    ,
        sourcePath    :    compileStep    .    inputPath    ,
        data        :    to5output    .    code    ,
        sourceMap    :    JSON    .    stringify    (    to5output    .    map    )
    }    )    ;
}    ;



// --- Plugin Initialization Section ---
// This block runs once when the Meteor application starts up.

// Determine the application's root directory.
var    appdir    =    process    .    env    .    PWD    ||    process    .    cwd    (    )    ;

// Construct the full path to the user's Babel configuration file.
var    filename    =    path    .    join    (    appdir    ,    'babel.json'    )    ;

// Initialize an empty object for user-defined configuration.
var    userConfig    =    {    }    ;


// Check if a user-defined configuration file exists.
if    (    fs    .    existsSync    (    filename    )    )
{
    // If it exists, read its content and parse it as JSON.
    userConfig    =    JSON    .    parse    (    fs    .    readFileSync    (    filename    ,    {    encoding    :    'utf8'    }    )    )    ;
}


// Merge the default configuration with any user-defined overrides.
// User configuration takes precedence.
var    config    =    Object    .    merge    (    defaultConfig    ,    userConfig    )    ;


// Register the source handler for each specified file extension.
config    .    extensions    .    forEach    (    function    (    ext    )
{
    Plugin    .    registerSourceHandler    (    ext    ,    handler    )    ;
}    )    ;


// Log active extensions if verbose mode is enabled.
if    (    config    .    verbose    )
{
    console    .    log    (    "Babel active on file extensions: "    +    config    .    extensions    .    join    (    ', '    )    )    ;
}


// Log the full Babel configuration if debug mode is enabled.
if    (    config    .    debug    )
{
    console    .    log    (    "\nBabel config:"    )    ;
    console    .    log    (    config    )    ;
}