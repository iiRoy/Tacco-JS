/*
* This module provides a set of logging utilities.
* It returns an object containing functions for logging,
* potentially for debugging purposes, with namespace support.
*/
var     fs     = require(   'fs'   )   ;
var     util   = require(   'util' )   ;
var     path   = require(   'path' )   ;
// The 'debug' module is currently commented out, indicating it's not in active use.
// var debug = require('debug');
var     mkdirp = require(   'mkdirp' )   ;


var fileLoggerReady     = false; /* A flag indicating if the file logger has been initialized and is ready for use. */

// The following section configures the application to also write log messages to a file.
// The exact location of the log file depends on the operating system:
// - For Apple macOS (formerly OS X), logs are stored in: '/Users/user/Library/Application Support/pullover'
// - For Microsoft Windows 8 (and later), logs typically go to: 'C:\Users\User\AppData\Roaming\Pullover'
// - For older Windows versions like Windows XP, the path is: 'C:\Documents and Settings\User\Application Data\Pullover'
// - On Linux-based systems, a common location is: '/var/local/Pullover'
var appDataPath = process.env.APPDATA || (   process.platform == 'darwin' ? process.env.HOME + '/Library/Application\ Support' : '/var/local'   )   ;
var logPath     = path.join(   appDataPath   ,   'Pullover'   )   ;

// Display the determined log file path to the console for debugging or informational purposes.
console.log(   'LOG PATH: ' + logPath   )   ;

// Check if the directory for logs exists. If not, create it synchronously.
if (   !   fs.existsSync(   logPath   )   )
{
    mkdirp.sync(   logPath   )   ; // Ensure the log directory structure is in place.
}

// This loop manages the rotation of log files. It aims to keep a specified number of historical logs.
// Specifically, it retains the last 5 log files by shifting their numerical suffixes.
for (   i = 4   ;   i >= 1   ;   i--   )
{
    // For each existing log file (e.g., pullover.4.log, pullover.3.log, etc.),
    // check if it exists before attempting to rename it.
    if (   fs.existsSync(   path.join(   logPath   ,   'pullover.' + i + '.log'   )   )   )
    {
        // Rename the current log file to the next sequential index.
        // For example, 'pullover.2.log' will become 'pullover.3.log',
        // effectively making space for a new 'pullover.1.log'.
        fs.renameSync(   path.join(   logPath   ,   'pullover.' + i + '.log'   )   ,   path.join(   logPath   ,   'pullover.' + (   i + 1   ) + '.log'   )   )   ;
    }
}

// Define the path for the current, active log file. This will typically be 'pullover.1.log'.
var logFilePath     = path.join(   logPath   ,   'pullover.1.log'   )   ;

// Open the designated log file for writing. The 'w' flag truncates the file if it exists,
// or creates a new one if it doesn't, ensuring a fresh log for the current session.
var logFileHandle   = fs.openSync(   logFilePath   ,   'w'   )   ;


function    getLogFilePath  (   )
{
    // This function provides the full path to the currently active log file.
    return  logFilePath ;
}


function    getLogPath    (   )
{
    // This function returns the base directory where all log files are stored.
    return  logPath ;
}


function    logToFile   (   string   )
{
    // Append a carriage return and newline character to the end of the string,
    // ensuring each log entry is on its own line in the file.
    string  +=  '\r\n'  ;
    // Write the formatted string to the log file using its handle.
    fs.writeSync(   logFileHandle   ,   string   )   ;
}


function    getLogFn    (   namespace   )
{
    // Returns a logging function tailored for a specific namespace.
    // This function will format and output messages to both the console and the log file.
    return  function    (   )
    {
        // Capture the current date and time, then format it for consistent logging.
        var date    =   util.inspect(   new Date(   )   )   ;
        // Initialize the log string with the provided namespace, padded for readability.
        var string  =   '  '    +   namespace   +   '   '   ;

        // Iterate over all arguments passed to the logging function.
        // Each argument is inspected and appended to the log string.
        for (   i = 0   ;   i < arguments.length   ;   i++   )
        {
            string  +=  "   "   +   util.inspect(   arguments[i]   )   ;
        }

        // Write the full log entry (date + formatted string) to the persistent log file.
        logToFile(   date + string   )   ;
        // Also output the formatted string to the standard console output.
        console.log.call(   console   ,   string   )   ;
    }   ;
}

// This section contains functions that are currently disabled (commented out).
// They likely provided specialized logging or debugging capabilities using an external 'debug' module.

// function    getDebugFn  (   namespace   )
// {
//     var debugFn = (   namespace   !== undefined   )   ?   debug(   namespace   +   ':debug'   )   :   debug(   'app:debug'   )   ;
//     debugFn.log = console.warn.bind(   console   )   ;
//     return  debugFn ;
// }

// function    getErrorFn  (   namespace   )
// {
//     var errorFn = (   namespace   !== undefined   )   ?   debug(   namespace   +   ':error'   )   :   debug(   'app:error'   )   ;
//     errorFn.log = console.error.bind(   console   )   ;
//     return  errorFn ;
// }

// function    getShellLogFn   (   )
// {
//     return  console.log ;
// }

// function    getShellErrorLogFn  (   )
// {
//     return  function    (   )
//     {
//         if (   arguments.length   >   0   )
//         {
//             // If the first argument is a string, apply ANSI escape codes to make it appear red in the console.
//             if (   typeof arguments[0]   ==  'string'   ||   arguments[0]   instanceof  String   )
//             {
//                 arguments[0]    =   "\033[31m"  +   arguments[0]    +   "\033[37m"  ;
//             }
//             console.log.apply(   null   ,   arguments   )   ;
//         }
//     }   ;
// }

// function    getShellHighlightFn (   )
// {
//     return  function    (   )
//     {
//         // Set console text color to yellow (ANSI code 33m) for highlighting.
//         process.stdout.write(   "\033[33m"   )   ;
//         console.log.apply(   null   ,   arguments   )   ;
//         // Reset console text color to default (ANSI code 37m) after logging.
//         process.stdout.write(   "\033[37m"   )   ;
//     }   ;
// }


// Export the module's main function, which, when called with a namespace,
// returns an object containing various logging utilities.
module.exports  =   function    (   namespace   )
{
    return  {
        // Provides a standard logging function, namespaced.
        log                 :   getLogFn(   namespace   )   ,
        // The following debug, error, and shell-related functions are currently commented out
        // and therefore not exposed by this module export.
        // debug: getDebugFn(namespace),
        // error: getErrorFn(namespace),
        // shell: getShellLogFn(),
        // shellSpecial: getShellHighlightFn(),
        // shellErr: getShellErrorLogFn(),
        // Function to retrieve the complete path of the current log file.
        getLogFilePath      :   getLogFilePath  ,
        // Function to retrieve the base directory where all log files are stored.
        getLogPath          :   getLogPath
    }   ;
}   ;