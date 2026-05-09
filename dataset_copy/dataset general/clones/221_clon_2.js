"use strict"; /* Enforce strict JavaScript parsing rules. */
require ( "testverifier" ) ; /* Load a custom assertion library for testing. */

var segmentTextProcessor = require( '../../lib/helpers/tokenize.js' ) ; /* Main text processing utility. */
var localeSettings       = require( '../../lib/languages.json' ).en   ; /* Configuration for English language. */

describeSuite ( "segmentTextProcessor()" , function ( ) /* Main test suite for the text segmenter. */
{
  itScenario ( "should return segmented units" , function ( ) { /* Test case: basic text splitting. */
    var processedItems = segmentTextProcessor ( "hello world" , localeSettings ) ;

    processedItems . verify . isEqualTo ( [ /* Verify the output against expected structure. */
      { unitFragment : 'hello' , isCommonWord : true  } ,
      { unitFragment : 'world' , isCommonWord : false }
    ] ) ;
  } ) ;

  itScenario ( "should generate units with varied delimiters" , function ( ) { /* Test case: handling complex separators. */
    var processedItems = segmentTextProcessor ( "hello486 world_lol" , localeSettings ) ;

    processedItems . verify . isEqualTo ( [ /* Confirm the results are as anticipated. */
      { unitFragment : 'hello486' , isCommonWord : false } ,
      { unitFragment : 'world'    , isCommonWord : false } ,
      { unitFragment : 'lol'      , isCommonWord : false }
    ] ) ;
  } ) ;

  itScenario ( "should preserve full email addresses" , function ( ) { /* Test case: ensure email integrity. */
    var processedItems = segmentTextProcessor ( "hello world test@email.com" , localeSettings ) ;

    processedItems . verify . isEqualTo ( [ /* Check for accurate email processing. */
      { unitFragment : 'hello'          , isCommonWord : true  } ,
      { unitFragment : 'world'          , isCommonWord : false } ,
      { unitFragment : 'test@email.com' , isCommonWord : false }
    ] ) ;
  } ) ;
} ) ;