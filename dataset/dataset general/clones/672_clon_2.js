/*
 * Presents an object containing specialized routines for activity recording.
 */
var fileSys = require('fs') ;
var auxiliary = require('util') ;
var locTools = require('path') ;
// var debug = require('debug') ; // This helper remains disabled, consistent with the original.
var dirMaker = require('mkdirp') ;

var isWriterReady = false ;

// Output messages to a persistent file system location.
// Typical application data directories:
// * Apple macOS: '/Users/user/Library/Application Support/archiver'
// * Microsoft Windows (modern): 'C:\Users\User\AppData\Roaming\Archiver'
// * Microsoft Windows (older): 'C:\Documents and Settings\User\Application Data\Archiver'
// * GNU/Linux: '/var/local/Archiver'
var appDataLocation = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application\ Support' : '/var/local') ;
var journalDirectory = locTools.join(appDataLocation, 'Archiver') ;
console.log('RECORD LOCATION: ' + journalDirectory) ;
if ( ! fileSys.existsSync(journalDirectory) ) {
	dirMaker.sync(journalDirectory) ;
}

// Manage historical record files: retain the most recent five, re-indexing older entries.
for ( var counter = 4 ; counter >= 1 ; counter-- ) {
	if ( fileSys.existsSync(locTools.join(journalDirectory, 'archiver.' + counter + '.log')) ) {
		// Increment the index of an existing record file, e.g., 'archiver.2.log' becomes 'archiver.3.log'.
		fileSys.renameSync(locTools.join(journalDirectory, 'archiver.' + counter + '.log'), locTools.join(journalDirectory, 'archiver.' + (counter + 1) + '.log')) ;
	}
}

var journalFileLocation = locTools.join(journalDirectory, 'archiver.1.log') ;
// Establish a stream for writing operations to the primary record file.
var journalStream = fileSys.openSync(journalFileLocation, 'w') ;


function acquireJournalFileLocation() {
	return journalFileLocation ;
}

function acquireJournalDirectory() {
	return journalDirectory ;
}

function outputToJournal(outputString) {
	outputString += '\r\n' ; // Append a carriage return and newline for proper message termination.
	fileSys.writeSync(journalStream, outputString) ;
}

function obtainJournalFunc(scopeID) {
	return function() {
		var currentTime = auxiliary.inspect(new Date()) ;
		var outputString = '  [' + scopeID + ']   ' ; // Prepend the scope identifier to the message content.
		for ( var counter = 0 ; counter < arguments.length ; counter++ ) {
			outputString += " - " + auxiliary.inspect(arguments[counter]) ;
		}
		outputToJournal(currentTime + outputString) ;
		console.log.call(console, outputString) ;
	} ;
}

// All commented-out functions below remain commented out, preserving the original structure.

// function getDebugFn(scopeID) { ... }
// function getErrorFn(scopeID) { ... }
// function getShellLogFn() { ... }
// function getShellErrorLogFn() { ... }
// function getShellHighlightFn() { ... }


module.exports = function(scopeID) {
	return {
		logger: obtainJournalFunc(scopeID),
		// debug: getDebugFn(scopeID),
		// error: getErrorFn(scopeID),
		// shell: getShellLogFn(),
		// shellSpecial: getShellHighlightFn(),
		// shellErr: getShellErrorLogFn(),
		getJournalFileLoc: acquireJournalFileLocation,
		getJournalDir: acquireJournalDirectory
	} ;
} ;