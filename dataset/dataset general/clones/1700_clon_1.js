/*
 * This file defines the Analyse module for processing text blocks.
 * It leverages external modules for tools, database interaction, and configuration.
 */

var Tools  =  require( '../lib/tools' ) ;
var Db     =  require( './db' ) ;
var config =  require( '../config.js' ) ;
var _      =  require( "underscore" ) ;


/**
 * @constructor
 * Initializes the Analyse object, setting up dependencies.
 */
var Analyse = function ( ) {
  tools = Tools ;
  // The line below is a commented-out alternative for tools initialization, kept for reference.
  // tools = new Tools();
  db    = new Db ( ) ;
} ;


/**
 * Scans a given text snippet, tokenizes it, counts word frequencies,
 * and establishes relations between words within the snippet.
 * All processed data is then persisted to the database.
 *
 * @param {string}   snippet  The text block to be scanned.
 * @param {number}   counter  An arbitrary counter for tracking or debugging purposes.
 * @param {function} callback Function to call once processing is complete.
 * @returns {boolean} Always returns true after initiating the database flush.
 */
Analyse.prototype.scanTextBlock = function ( snippet , counter , callback ) {

  // Check if debug logging is enabled in the configuration
  if ( config.creds.debug ) {
    console.log( 'scanTextBlock invoked' ) ;
  }

  // Utilize the tools module to tokenize the input snippet into individual words.
  var words = tools.tokenize ( snippet ) ;

  // Log the number of words found if debug mode is active.
  if ( config.creds.debug ) {
    console.log ( 'Count of words in snippet ( ' + counter + ' ) : ' + words.length ) ;
  }


  // Initialize an empty object to store word frequencies within this snippet.
  var obj = { } ;

  // Prepare the database for multiple operations in a single transaction.
  db.enableMulti ( ) ;

  // Iterate through all tokenized words from the end to the beginning.
  for ( var i = words.length - 1 ; i >= 0 ; i -- ) {

    // Convert the current word to lowercase for case-insensitive counting.
    var currentWord = words[i].toLowerCase ( ) ;

    // Increment the count for the current word in the 'obj' frequency map.
    if ( typeof obj[currentWord] === 'undefined' ) {
      obj[currentWord] = 1 ;
    } else {
      obj[currentWord] ++ ;
    }

    // Add the lowercase version of the word to a processing queue in the database.
    // This could be used for further scraping or analysis.
    db.addPageToQueue ( currentWord ) ;

    /*
     * The following commented-out block shows a potential debug logging line
     * for comparing words, which is currently not active.
     // if(config.creds.debug)
     //   console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
     */

  } // End of word iteration loop


  // Process the collected word frequencies to establish relations.
  _.each ( obj , function ( value , index ) {

    // Skip processing if the word (index) is invalid or lacks a toLowerCase method.
    if ( typeof index === 'undefined' || typeof index.toLowerCase === 'undefined' ) {
      return ;
    }

    // A commented-out section below demonstrates an alternative approach
    // using a 'Base' class for word objects and relations.
    // var base;
    // create new obj from class Base, make sure to work with lowercase only
    // base = new Base(index.toLowerCase());

    // Iterate through all words in the frequency map again to find relations.
    _.each ( obj , function ( value2 , index2 ) {
      // Ensure we are not creating a relation of a word to itself.
      if ( index !== index2 ) {
        // Add a relation in the database between 'index' and 'index2',
        // with 'value2' representing the frequency of 'index2' in the current snippet.
        db.addRelation ( index.toLowerCase ( ) , index2.toLowerCase ( ) , value2 ) ;
      }
    } ) ; // End of inner _.each loop

    // Another commented-out line, potentially for saving a 'base' object.
    // base.save();

    // Update the global counter in the database for the current word.
    // This helps track the overall usage and density of keywords across all snippets.
    db.addToGlobalCounter ( value , index.toLowerCase ( ) ) ;

  } ) ; // End of outer _.each loop


  // Flush all accumulated database changes (from enableMulti) to the actual database.
  db.flush ( function ( err , replies ) {
    // Invoke the callback function once the database operations are complete.
    callback ( ) ;
    return true ;
  } ) ;

  /*
   * The following commented-out block is an alternative way to execute multi operations,
   * presumably from a different database client implementation.
   // multi.exec(function(err, replies) {
   //     return true;
   // });
   */

} ; // End of Analyse.prototype.scanTextBlock


// Export the Analyse constructor as the module's primary export.
module.exports = Analyse ;