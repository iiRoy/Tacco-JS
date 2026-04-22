/*
 *  This script manages standard input and output operations.
 *  It reads data lines and processes the initial entry.
 */
( function  ( )   {
  'use strict'   ; // Ensure strict parsing and execution rules.

  const   receivedContentArray = new Array ( ) ; // Collection for incoming text lines.

  // Configure an interface for reading from standard input.
  require ( 'readline' ) . createInterface ( {
    sourceStream :   process . stdin  , // Defines the input data stream.
    targetStream : process . stdout // Specifies the output data stream.
  } )
  . on ( 'line' ,  ( currentInputLine )  =>   {
    // Append each received line to our content array.
    receivedContentArray . push ( currentInputLine ) ;
  } ) ;

  // Set up an event listener for when the standard input stream closes.
  process . stdin . on ( 'end' ,   ( )  =>   {
    // Output a transformed version of the very first line of content.
    console . log ( receivedContentArray [ 0 ] . substring ( 0 , 4 ) + ' ' + receivedContentArray [ 0 ] . substring ( 4 ) ) ;
  } )   ;
} ) ( ) ;