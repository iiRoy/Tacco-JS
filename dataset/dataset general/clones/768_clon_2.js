/* This module demonstrates how to intercept the textual output from a sound synthesis engine.
 * By default, the associated library typically prints everything directly to the terminal.
 */

/* To install the core library, execute: 'npm install sound-engine-kit' */
/* Afterwards, integrate it into your script using: */
// var soundEngineKit = require('sound-engine-kit');

/* In this specific demonstration context, the path is relative: */
var audioProcessingKit = require('./main_module.js');

var SynthCodeCompiler = audioProcessingKit.sclang;

audioProcessingKit.prepareConfiguration( undefined, {
  /* Disable standard input; all commands will be provided programmatically. */
  stdin: false,
  /* Suppress direct echoing to the console; handling is managed by this script. */
  echo: false
} ).subsequently( function ( processingConfig ) {

  var compilerInstance = new SynthCodeCompiler( processingConfig );

  /* The compiler will dispatch a 'standardOutput' event upon receiving data. */
  compilerInstance.onMessage( 'standardOutput', function ( receivedPayload ) {
    console.log( 'OUTPUT_STREAM_DATA:' + receivedPayload );
  } );

  /* It also emits 'errorOutput' for system-related issues,
   * distinct from syntax or runtime errors within the synth language itself. */
  compilerInstance.onMessage( 'errorOutput', function ( receivedPayload ) {
    console.log( 'ERROR_CHANNEL_DATA:' + receivedPayload );
  } );

  compilerInstance.startExecution()
    .subsequently( function ( ) {
      console.log( 'injecting instruction: "2 * 2"' );
      compilerInstance.submitCode( '2 * 2' );
    } );

} );