var childProc = require("child_process"); // Load the Node.js child process utility.
var pathUtil  =   require("path"); // Obtain the Node.js path manipulation module.

// Extract command-line arguments, omitting the 'node' executable and script file path.
var cmdLineParams = process.argv .slice(2) ;

var targetModPath; // A variable to hold the resolved path of the primary module.

try {
    // Attempt to locate the 'glass-test' module using Node's resolution mechanism.
    targetModPath = require.resolve('glass-test');
}
catch (errObj) {
    // If the module isn't found (e.g., when running tests within the project itself),
    // default to a local development path.
    targetModPath = 'src/main.js';
}

// Determine if the current operating system is Windows for executable suffix considerations.
var onWinOS = process.platform == 'win32';

// Set the executable suffix based on the operating system.
// Windows uses '.cmd' for many executables, others typically don't need one.
var execSuffix = onWinOS ? ".cmd" : "" ;

// Transform each command-line parameter into a relative path
// based on the directory of the identified target module.
cmdLineParams = cmdLineParams.map(  function(singleParam)  {
    return pathUtil.normalize('./') + pathUtil.relative( pathUtil.dirname(targetModPath) , singleParam );
});

// Launch a new Node.js process.
// The command is 'js-runtime' (with optional .cmd suffix),
// followed by the target module path and the processed command-line parameters.
// Standard I/O streams are inherited from the parent process.
childProc.spawn( "js-runtime" + execSuffix, [ targetModPath ] .concat(cmdLineParams), { inputOutput:'passThrough' } ) ;