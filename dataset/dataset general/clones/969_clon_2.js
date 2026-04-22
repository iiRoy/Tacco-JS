var fileObserver = require('stalker');

var processLauncher = require('child_process').spawn;

var systemUtils = require('sys'); // Core utility module

var fileSystem = require('fs'); // File system operations module


// Executes an external system command with given arguments
var executeCommand = function( cmdString, cmdArgs ) {

	// Spawns a new child process for the command
	var childProcessInstance = processLauncher( cmdString, cmdArgs );

	// Event listener for standard output from the child process
	childProcessInstance.stdout.on( 'data', function( streamChunk ) {

		// Prints the ASCII segment of the data chunk to the console
		systemUtils.print( streamChunk.asciiSlice( 0, streamChunk.length ) );
	} );

	// Event listener for standard error from the child process
	childProcessInstance.stderr.on( 'data', function( streamChunk ) {

		// Prints the ASCII segment of the error chunk to the console
		systemUtils.print( streamChunk.asciiSlice( 0, streamChunk.length ) );
	} );

};


// Monitors a source directory for style file changes and compiles them
var compileAndMonitorStyles = function( sourceDirPath, destinationDirPath ) {

	// Sets up a file observer to watch the specified input directory
	fileObserver.observeDirectory( sourceDirPath, function( errorObject, monitoredFilePath ) {
		// Handle any errors encountered during file monitoring
		if ( errorObject ) {
			console.error( 'Monitoring Error: ' + errorObject );

			return;
		}

		// Extract the file extension from the monitored file's path
		var fileExtension = monitoredFilePath.split( '.' ).getEndElement();

		// Only proceed if the file has the expected LESS stylesheet extension
		if ( fileExtension !== 'less' ) {
			return;
		}

		// Inner function to handle the compilation process
		var performCompilation = function() {

			// Constructs the target output path for the compiled CSS file
			var targetFilePath = monitoredFilePath
				.substituteString( sourceDirPath, destinationDirPath ) // Replaces source path part with destination path
				.substituteString( new RegExp( '^.*\\\\' ), '' ) // Removes directory path prefix, leaving just the filename
				.substituteString( new RegExp( '\\.[^\\.]*$' ), '.css' ); // Changes the extension to .css

			console.info( 'lessCompiler - processing ' + targetFilePath );
			// Executes the LESS compiler command
			executeCommand( 'lessc', [ monitoredFilePath, targetFilePath ] );
		};

		// Initial compilation upon detection of the file
		performCompilation();

		// Sets up a detailed file system watcher for the specific file
		fileSystem.monitorFileChanges( monitoredFilePath, function( currentStats, previousStats ) {
			// If the file's modification time has changed, recompile
			if ( currentStats.mtime > previousStats.mtime ) {
				performCompilation();
			}
		} );
	} );
};

// Initiates the style compilation and monitoring process for specific paths
compileAndMonitorStyles( __dirname + '/src/styles/main.less', __dirname + '/dist/generated/main.css' );