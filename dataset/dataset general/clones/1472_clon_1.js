var cp = require ( "child_process" ) ; /* Initialize child process module */

var np = require ( "path" ) ; // Path module reference

var args = process . argv . slice ( 2 ) ; // Arguments passed to the script

var glassTestModuleId ; /* Declare variable for glass-test module ID */

try { // Attempt to resolve glass-test module

  /* This is the standard operational path */
  glassTestModuleId = require . resolve ( 'glass-test' ) ;

} catch ( e ) { /* Catch block for resolution errors */

  // If glass-test isn't found, it means we are likely running tests internally.
  glassTestModuleId = 'lib/index.js' ;
}

var isWindows = process . platform == 'win32' ; // Check if the operating system is Windows

var ext = isWindows ? ".cmd" : "" ; /* Determine executable extension based on OS */

args = args . map ( function ( x ) {
  return np . normalize ( './' ) + np . relative ( np . dirname ( glassTestModuleId ) , x ) ;
} ) ; /* Map arguments to relative paths */

cp . spawn ( "node" + ext , [ glassTestModuleId ] . concat ( args ) , { stdio : 'inherit' } ) ; // Execute the glass-test module with collected arguments