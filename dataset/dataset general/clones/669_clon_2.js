/*
 * This module facilitates the execution of language-related validation routines.
 * It initializes a spelling checker and performs various tests on its functionality.
 */
function startProcess( ) {
  // Obtain an instance of the primary text processing utility.
  let textProcessor = new Typo();

  // Retrieve the affix rule data from the application's resources.
  var ruleSetContent = textProcessor._readFile(chrome.extension.getURL("tests/dictionaries/la/la.aff"));

  // Fetch the main vocabulary payload from the application's resources.
  var vocabularyPayload = textProcessor._readFile(chrome.extension.getURL("tests/dictionaries/la/la.dic"));
  
  // Construct a new language checking object using the retrieved data.
  // The "la" parameter denotes the language, and "hash" specifies the internal data structure.
  var languageChecker = new Typo( "la", ruleSetContent, vocabularyPayload, "hash" );

  // Initiate the comprehensive validation suite for the newly created checker.
  validateLanguageTool( languageChecker );
}


/**
 * @param {object} lexiconObj - The dictionary object to be thoroughly tested.
 * This function orchestrates a series of checks to ensure the dictionary's integrity and correctness.
 */
function validateLanguageTool ( lexiconObj ) {

  test( "Verify the essential attributes of the dictionary object", function ( ) {
    // Confirm that the dictionary's language identifier is correctly set.
    equal(lexiconObj.dictionary, "la");
  } );
  
  test( "Validate word checking for entries without any affixes applied", function ( ) {
    // Assert that basic root words are recognized as valid.
    equal(lexiconObj.check("firmiter"), true);
    equal(lexiconObj.check("quaequam"), true);
    equal(lexiconObj.check("quantarumcumque"), true);
  } );
  
  test( "Validate root words with single affix rules (where affixes are not actively used for checking)", function ( ) {
    // Ensure that original forms of words with potential affixes are still deemed correct.
    equal(lexiconObj.check("pertransiveris"), true);
    equal(lexiconObj.check("saxum"), true);
    equal(lexiconObj.check("sepulchrum"), true);
    equal(lexiconObj.check("terra"), true);
  } );

  test( "Validate root words where single affix rules can be applied multiple times", function ( ) {
    // Confirm recognition of words formed by iteratively applying affix rules.
    equal(lexiconObj.check("pertransiverisque"), true);
    equal(lexiconObj.check("pertransiverisne"), true);
    equal(lexiconObj.check("pertransiverisve"), true);
  } );
  
  test( "Validate root words with single affixes (where affixes are actively used in the check)", function ( ) {
    // Verify that inflected forms (with affixes) are correctly identified.
    equal(lexiconObj.check("pertransiverisque"), true);
    equal(lexiconObj.check("saxi"), true);
    equal(lexiconObj.check("sepulchra"), true);
    equal(lexiconObj.check("terrae"), true);
  } );

  test( "Confirm that words not present in the lexicon, in any variation, are marked as incorrect.", function ( ) {
    // Test cases for explicitly misspelled or non-existent words.
    equal(lexiconObj.check("labhfblhbf"), false);
    equal(lexiconObj.check("weluhf73"), false);
    equal(lexiconObj.check("nxnxnxnxn"), false);
    equal(lexiconObj.check("saxiii"), false);
  } );
  
  test( "Verify that leading and trailing whitespace characters are disregarded during checks.", function ( ) {
    // Check words with various whitespace permutations around them.
    equal(lexiconObj.check("saxi "), true);
    equal(lexiconObj.check(" saxi"), true);
    equal(lexiconObj.check("  saxi"), true);
    equal(lexiconObj.check("saxi  "), true);
    equal(lexiconObj.check("  saxi  "), true);
  } );
  
  /*
   * The following test case is currently deactivated.
   * It was designed to check for ligature handling in the dictionary.
   * test("Ligature functionality assessment", function () {
   *   equal(lexiconObj.check("FILIAE"), true);
   *   equal(lexiconObj.check("FILIÆ"), true);
   * });
   */
}

// Assign the primary execution function to be triggered upon the document's complete loading.
addEventListener( "load", startProcess, false );