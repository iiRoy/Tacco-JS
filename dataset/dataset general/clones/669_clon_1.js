// This file contains a Type I clone of a JavaScript test script.
// The purpose is to demonstrate code cloning where only whitespace
// and comments are altered, while the underlying logic remains identical.
//
// This script initializes a Typo.js dictionary and runs a series of
// tests against it to verify its functionality.
//
// All identifiers, keywords, operators, and expressions are preserved exactly.
// Only formatting (indentation, spacing, blank lines) and comments have been changed.

function run( ) {
  // Initialize a new Typo object for utility operations.
  var utilityDict = new Typo( );

  // Read the affix data file for dictionary configuration.
  // The path is constructed using chrome.extension.getURL.
  var affData = utilityDict._readFile( chrome.extension.getURL( "tests/dictionaries/la/la.aff" ) ) ;
  // Read the word data file, which contains the actual dictionary words.
  var wordData = utilityDict._readFile( chrome.extension.getURL( "tests/dictionaries/la/la.dic" ) ) ;


  // Create the main dictionary instance using the loaded data.
  // This dictionary is configured for the "la" (Latin) language.
  var hashDict = new Typo( "la", affData, wordData, "hash" ) ;

  // Execute the test suite against the newly created dictionary.
  testDictionary( hashDict ) ;
}


/*
 * This function defines and executes a series of tests
 * against a given dictionary object. It verifies various
 * aspects of the dictionary's word checking capabilities.
 */
function testDictionary( dict ) {

    // Test case: Verify that the dictionary's attributes are correctly set.
    test( "Dictionary object attributes are properly set", function ( ) {
        // The dictionary property should match the language code "la".
        equal( dict.dictionary, "la" ) ;
    } ) ;


    // Test case: Check words that do not have any affixes.
    test( "Correct checking of words with no affixes", function ( ) {
        equal( dict.check( "firmiter" ) , true ) ; // Should be true
        equal( dict.check( "quaequam" ) , true ) ; // Another valid word
        equal( dict.check( "quantarumcumque" ) , true ) ; // A longer valid word
    } ) ;

    // Test case: Check root words that have single affixes, but these affixes are not applied.
    test( "Correct checking of root words with single affixes (affixes not used)", function ( ) {
        equal( dict.check( "pertransiveris" ) , true ) ; // Base form
        equal( dict.check( "saxum" ) , true ) ; // Noun in nominative singular
        equal( dict.check( "sepulchrum" ) , true ) ; // Another noun
        equal( dict.check( "terra" ) , true ) ; // Simple word
    } ) ;

    // Test case: Check root words with affix rules that allow multiple applications.
    test( "Correct checking of root words with single affixes rules that can be applied multiple times", function ( ) {
        equal( dict.check( "pertransiverisque" ) , true ) ; // 'que' suffix
        equal( dict.check( "pertransiverisne" ) , true ) ; // 'ne' suffix
        equal( dict.check( "pertransiverisve" ) , true ) ; // 've' suffix
    } ) ;

    // Test case: Check root words where single affixes *are* applied.
    test( "Correct checking of root words with single affixes (affixes used)", function ( ) {
        equal( dict.check( "pertransiverisque" ) , true ) ; // Word with affix
        equal( dict.check( "saxi" ) , true ) ; // Genitive singular of 'saxum'
        equal( dict.check( "sepulchra" ) , true ) ; // Plural of 'sepulchrum'
        equal( dict.check( "terrae" ) , true ) ; // Genitive singular or nominative plural of 'terra'
    } ) ;

    // Test case: Verify that words not present in the dictionary are marked as misspelled.
    test( "Words not in the dictionary in any form are marked as misspelled.", function ( ) {
        equal( dict.check( "labhfblhbf" ) , false ) ; // Random string, should be false
        equal( dict.check( "weluhf73" ) , false ) ; // Another random string
        equal( dict.check( "nxnxnxnxn" ) , false ) ; // Yet another random string
        equal( dict.check( "saxiii" ) , false ) ; // Misspelling of 'saxi'
    } ) ;

    // Test case: Ensure that leading and trailing whitespace does not affect word checking.
    test( "Leading and trailing whitespace is ignored.", function ( ) {
        equal( dict.check( "saxi " ) , true ) ; // Trailing space
        equal( dict.check( " saxi" ) , true ) ; // Leading space
        equal( dict.check( "  saxi" ) , true ) ; // Multiple leading spaces
        equal( dict.check( "saxi  " ) , true ) ; // Multiple trailing spaces
        equal( dict.check( "  saxi  " ) , true ) ; // Both leading and trailing spaces
    } ) ;

    /* This block is a commented-out test case for ligature handling.
     * It is kept commented to maintain the original test structure.
     * If uncommented, it would check words containing ligatures like 'Æ'.
     *
     * test("Ligature", function () {
     *    equal(dict.check("FILIAE"), true);
     *    equal(dict.check("FILIÆ"), true);
     * });
     */
}

// Attach the 'run' function to the 'load' event of the document.
// This ensures the tests are executed once the page content is fully loaded.
addEventListener( "load" , run , false ) ;