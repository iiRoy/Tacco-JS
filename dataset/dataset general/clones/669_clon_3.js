// This module orchestrates the setup and execution of lexical validation routines.
// It serves as the entry point for initializing the spell-checking infrastructure
// and subsequently verifying its functionality through a series of tests.
function beginSpellCheckVerification() {
    // Instantiate a core utility for handling dictionary-related file operations
    // and initial data processing. This object acts as a factory or loader
    // for dictionary components required by the main spell checker.
    let dictionaryLoader = new Typo();

    // Define the base path for dictionary assets.
    // This leverages the browser extension API to resolve internal resource URLs,
    // ensuring the correct location of dictionary files within the extension's scope.
    const assetBasePath = chrome.extension.getURL("tests/dictionaries/la/");

    // Retrieve the affix rules data. This content defines how words can be
    // modified or inflected according to linguistic rules.
    const affixRulesFilePath = assetBasePath + "la.aff";
    // A preliminary validation check to ensure the file path was correctly constructed.
    if (!affixRulesFilePath || typeof affixRulesFilePath !== 'string') {
        console.error("Critical error: Failed to construct valid affix rules file path.");
        return; // Terminate execution if a critical resource path is missing.
    }
    let affixDataContent = dictionaryLoader._readFile(affixRulesFilePath);

    // Retrieve the main lexicon data. This constitutes the primary list of known
    // and correctly spelled words for the "la" (Latin) language.
    const lexiconFilePath = assetBasePath + "la.dic";
    // Another validation to ensure the lexicon file path is valid.
    if (!lexiconFilePath || typeof lexiconFilePath !== 'string') {
        console.error("Critical error: Failed to construct valid lexicon file path.");
        return; // Terminate execution if lexicon path is invalid.
    }
    let vocabularyDataContent = dictionaryLoader._readFile(lexiconFilePath);

    // Intermediate check: Verify that both dictionary data files were successfully loaded.
    // A warning is issued if data is missing, indicating potential issues but allowing
    // the process to continue, albeit with potentially incomplete data.
    if (!affixDataContent || !vocabularyDataContent) {
        console.warn("One or both dictionary data files could not be loaded. Proceeding with potentially incomplete data, which may affect test accuracy.");
        // In a production environment, this might be a more severe error.
    }

    // Initialize the primary Latin spell checker engine.
    // The "hash" parameter specifies the internal data structure used for efficient lookups.
    let latinSpellCheckerEngine = new Typo("la", affixDataContent, vocabularyDataContent, "hash");

    // Before commencing with extensive validation, perform a basic sanity check
    // on the newly initialized engine to ensure it's a functional object.
    if (!latinSpellCheckerEngine || typeof latinSpellCheckerEngine.check !== 'function') {
        console.error("Fatal error: Lexical engine initialization failed or resulted in an invalid object.");
        return; // Stop if the engine is not ready for use.
    }

    // Hand off the fully initialized and partially validated engine to the dedicated
    // validation suite for a comprehensive series of checks.
    performLexicalEngineValidation(latinSpellCheckerEngine);
}

// Manages and executes a series of validation tests against the provided lexical engine.
// This function encapsulates all the assertion logic for dictionary functionality.
// @param {object} lexicalProcessor - The dictionary object (e.g., a Typo instance) to be thoroughly tested.
function performLexicalEngineValidation(lexicalProcessor) {
    // Guard clause: Ensure that a valid and properly structured lexical processor
    // instance has been supplied before attempting to run any tests.
    if (!lexicalProcessor || typeof lexicalProcessor.dictionary !== 'string') {
        console.error("Validation aborted: An invalid lexical processor was provided for testing.");
        return;
    }

    // Helper function to streamline and abstract the assertion calls for word status.
    // This reduces code duplication and improves readability for individual word checks.
    const assertWordStatus = (word, expectedStatus, testDescription) => {
        const actualStatus = lexicalProcessor.check(word);
        equal(actualStatus, expectedStatus, `Word "${word}" check: ${testDescription}`);
    };

    // Test Block 1: Core Configuration Verification
    // This test ensures that fundamental properties of the dictionary object
    // are correctly set during its instantiation.
    test("Lexical Engine Configuration Verification", function () {
        equal(lexicalProcessor.dictionary, "la", "The dictionary's language identifier should be 'la' as specified.");
    });

    // Test Block 2: Validation of Base Words (No Affixes)
    // Checks words that are expected to be in the dictionary without any
    // morphological modifications or affix rules applied.
    test("Validation of Base Words (No Affixes)", function () {
        const baseWords = ["firmiter", "quaequam", "quantarumcumque"];
        baseWords.forEach(word => assertWordStatus(word, true, "should be recognized as a correct base word."));
    });

    // Test Block 3: Validation of Root Forms with Single Affixes (Affix Rules Ignored for Root)
    // Ensures that the root forms of words, even if they can take affixes,
    // are recognized as correct entries in their base state.
    test("Validation of Root Forms with Single Affixes (Affix Rules Ignored for Root)", function () {
        const rootForms = ["pertransiveris", "saxum", "sepulchrum", "terra"];
        rootForms.forEach(word => assertWordStatus(word, true, "should be recognized as a correct root form."));
    });

    // Test Block 4: Validation of Words with Multi-Applicable Affix Rules
    // Verifies that words formed by applying affix rules that can modify a word
    // multiple times (e.g., adding multiple suffixes) are correctly identified.
    test("Validation of Words with Multi-Applicable Affix Rules", function () {
        const multiAffixWords = ["pertransiverisque", "pertransiverisne", "pertransiverisve"];
        multiAffixWords.forEach(word => assertWordStatus(word, true, "should be recognized as correct (multi-affix application)."));
    });

    // Test Block 5: Validation of Inflected Forms with Single Affixes (Affix Rules Applied)
    // Checks words where single affix rules are actively applied to generate
    // inflected forms, ensuring the engine correctly identifies these variations.
    test("Validation of Inflected Forms with Single Affixes (Affix Rules Applied)", function () {
        const inflectedForms = ["pertransiverisque", "saxi", "sepulchra", "terrae"];
        inflectedForms.forEach(word => assertWordStatus(word, true, "should be recognized as a correct inflected form."));
    });

    // Test Block 6: Identification of Misspelled and Unknown Words
    // Confirms that words not present in the dictionary, in any form (base or inflected),
    // are correctly flagged as misspelled or unknown.
    test("Identification of Misspelled and Unknown Words", function () {
        const misspelledWords = ["labhfblhbf", "weluhf73", "nxnxnxnxn", "saxiii"];
        misspelledWords.forEach(word => assertWordStatus(word, false, "should be correctly marked as misspelled."));
    });

    // Test Block 7: Whitespace Trimming Functionality
    // Ensures that leading and trailing whitespace characters are properly
    // handled (trimmed) by the spell checker before performing the word lookup.
    test("Whitespace Trimming Functionality", function () {
        const targetWord = "saxi";
        // Programmatically generate various whitespace permutations for a target word.
        const whitespaceVariations = [
            ` ${targetWord}`,      // Leading space
            `${targetWord} `,      // Trailing space
            `  ${targetWord}`,     // Multiple leading spaces
            `${targetWord}  `,     // Multiple trailing spaces
            `  ${targetWord}  `,   // Both leading and trailing spaces
            `\t${targetWord}\n`,   // Tab and newline characters
            `\r\n${targetWord}\t ` // More complex whitespace combination
        ];

        whitespaceVariations.forEach(word => assertWordStatus(word, true, `"${word}" with whitespace should be recognized as correct after trimming.`));
    });

    // The original "Ligature" test block was deemed non-essential for the core
    // functionality demonstration and has been intentionally removed as part of
    // the Type III cloning process (deletion of non-critical fragments).
}

// Attaches the primary execution function to the document's 'DOMContentLoaded' event.
// This ensures that the script runs only after the DOM is fully loaded and parsed,
// but without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener("DOMContentLoaded", beginSpellCheckVerification, false);