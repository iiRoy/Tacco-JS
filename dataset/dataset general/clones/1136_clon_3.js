// This module provides a comprehensive suite of tests for validating the functionality
// of an HTML element selection utility, specifically 'soupselect'.
// It integrates with 'htmlparser' for DOM generation and 'nodeunit' (implied by `test` object)
// for assertion capabilities.

// --- External Dependency Imports ---
// Importing the core selection utility function from 'soupselect'.
const queryHtmlElements = require('soupselect').select;
// Importing the HTML parsing library to construct a Document Object Model (DOM).
const domParserLib = require("htmlparser");
// Importing Node.js file system utilities to read test data from files.
const fileSystemUtil = require('fs');
// Importing Node.js system diagnostics utilities, primarily for debug output.
const systemDiagnostics = require('sys'); // Keeping 'sys' for close resemblance, though 'util' is modern.

// --- Configuration and Initial Data Loading ---
// Defining the relative path to the HTML document used for testing.
const testDocumentPath = 'testdata/test.html';

// Attempt to synchronously read the content of the test HTML document.
let documentContent = '';
try {
    documentContent = fileSystemUtil.readFileSync(testDocumentPath, 'utf-8');
    // Provide a warning if the document is unexpectedly empty.
    if (!documentContent) {
        systemDiagnostics.debug(`Warning: The test document at '${testDocumentPath}' was read but appears to be empty.`);
    }
} catch (readErr) {
    // Log a fatal error and terminate the process if the test document cannot be accessed.
    systemDiagnostics.debug(`Fatal Error: Unable to load test document from '${testDocumentPath}'. Details: ${readErr.message}`);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

/**
 * Orchestrates the execution of a DOM-based test.
 * It parses the pre-loaded HTML content and then invokes a provided callback with the resulting DOM.
 *
 * @param {object} testContext - The testing framework's context object (e.g., nodeunit's `test` object).
 * @param {function(object): void} processDomCallback - A function to be executed with the parsed DOM tree.
 */
function executeDomTest(testContext, processDomCallback) {
    // Initialize an event handler for the HTML parser. This handler will receive parsing results or errors.
    const parsingEventHandler = new domParserLib.DefaultHandler((errorObject, parsedDocumentTree) => {
        // Check for any errors during the HTML parsing process.
        if (errorObject) {
            systemDiagnostics.debug(`HTML Parsing Error Encountered: ${errorObject.message}`);
            // Assert that parsing failed, providing details to the test runner.
            testContext.ok(false, `HTML parsing failed for test document: ${errorObject.message}`);
            testContext.done(); // Ensure the current test concludes even if parsing fails.
            return; // Terminate execution for this handler call.
        }

        // If parsing completes without error, verify that a DOM tree was successfully generated.
        if (parsedDocumentTree) {
            processDomCallback(parsedDocumentTree); // Execute the test-specific logic with the DOM.
        } else {
            // This scenario indicates a logic error within the parser library or handler itself.
            systemDiagnostics.debug("Critical Warning: DOM tree is null/undefined after successful parsing (no error reported).");
            testContext.ok(false, "DOM tree was not generated as expected, despite no reported error.");
            testContext.done(); // Conclude the test with a failure.
        }
    });

    // Create a new HTML parser instance, linking it to our custom event handler.
    const htmlSyntaxParser = new domParserLib.Parser(parsingEventHandler);

    // Initiate the parsing of the entire HTML document content.
    // The `parseComplete` method is typically synchronous, triggering the handler immediately.
    htmlSyntaxParser.parseComplete(documentContent);
}

/**
 * Utility function to safely extract the 'id' attribute from a DOM element.
 * Returns an empty string if the element or its 'id' attribute is not present.
 *
 * @param {object} element - The DOM element object.
 * @returns {string} The value of the 'id' attribute, or an empty string.
 */
function getElementIdentifier(element) {
    // Robustly check for the existence of the element, its attributes, and the 'id' attribute.
    if (element && element.attribs && typeof element.attribs.id === 'string') {
        return element.attribs.id;
    }
    return ''; // Default to an empty string if ID is missing.
}

/**
 * Asserts that a given CSS selector, when applied to the DOM, yields elements
 * with a specific set of IDs. The order of IDs is not considered significant due to sorting.
 *
 * @param {object} testContext - The test framework's context.
 * @param {object} parsedDocumentTree - The HTML DOM tree.
 * @param {string} cssQueryString - The CSS selector string to apply.
 * @param {string[]} expectedIdentifierList - An array of IDs expected from the selection.
 */
function verifyElementSelection(testContext, parsedDocumentTree, cssQueryString, expectedIdentifierList) {
    // Guard clause: Handle cases where no IDs are expected.
    if (!expectedIdentifierList || expectedIdentifierList.length === 0) {
        const matchedElements = queryHtmlElements(parsedDocumentTree, cssQueryString);
        if (matchedElements.length === 0) {
            // Correctly found no elements as expected.
            testContext.ok(true, `Query "${cssQueryString}" correctly yielded no elements.`);
            return;
        } else {
            // Incorrectly found elements when none were expected.
            const actualFoundIds = matchedElements.map(getElementIdentifier);
            testContext.ok(false, `Query "${cssQueryString}" expected no elements but found: ${systemDiagnostics.inspect(actualFoundIds)}`);
            return;
        }
    }

    // Execute the CSS selector against the parsed DOM.
    const matchedElements = queryHtmlElements(parsedDocumentTree, cssQueryString);

    // Extract the 'id' attribute from each matched element using the helper function.
    const foundIdentifierList = matchedElements.map(getElementIdentifier);

    // Sort both the expected and found ID lists to ensure order-independent comparison.
    foundIdentifierList.sort();
    expectedIdentifierList.sort();

    // Construct a detailed diagnostic message for the assertion.
    const diagnosticMessage = `Selection mismatch for selector "${cssQueryString}". Expected: ${systemDiagnostics.inspect(expectedIdentifierList)}, Actual: ${systemDiagnostics.inspect(foundIdentifierList)}`;

    // Perform a deep equality check on the sorted ID arrays.
    testContext.deepEqual(expectedIdentifierList, foundIdentifierList, diagnosticMessage);
}

/**
 * Facilitates running multiple selector assertions based on a list of specifications.
 * Each specification is an array containing a selector string and its expected IDs.
 *
 * @param {object} testContext - The test framework's context.
 * @param {object} parsedDocumentTree - The HTML DOM tree.
 * @param {Array<[string, string[]]>} selectionSpecifications - An array of `[selector, expectedIds]` tuples.
 */
function checkMultipleSelections(testContext, parsedDocumentTree, selectionSpecifications) {
    // Guard clause: If no specifications are provided, there's nothing to check.
    if (!selectionSpecifications || selectionSpecifications.length === 0) {
        systemDiagnostics.debug("No selection specifications were supplied for multiple assertion check.");
        return;
    }

    // Iterate through each specification using a `for...of` loop.
    for (const currentSpecification of selectionSpecifications) {
        // Destructure the specification into its selector and expected IDs.
        const [selectorQuery, expectedIdsForQuery] = currentSpecification;
        // Call the individual selection verification function for each specification.
        verifyElementSelection(testContext, parsedDocumentTree, selectorQuery, expectedIdsForQuery);
    }
}

// --- Test Suite Definitions ---

// Exporting the test suites as modules.
module.exports = {
    // --- Collection of Fundamental CSS Selector Tests ---
    fundamentalQueries: {
        // Test case: Verifying selection of a single tag that occurs once in the document.
        testSingleTagExistence: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const selectedElements = queryHtmlElements(parsedDocumentTree, 'title');
                testContext.strictEqual(selectedElements.length, 1, 'Expected exactly one <title> element to be found.');
                testContext.strictEqual(selectedElements[0].name, 'title', 'The first selected element must be a "title" tag.');
                // Accessing child content robustly.
                const titleTextContent = selectedElements[0].children[0] ? selectedElements[0].children[0].raw : 'NO_CONTENT_FOUND';
                testContext.strictEqual(titleTextContent, 'The title', 'The content of the title element does not match.');
            });
            testContext.done(); // Marks the completion of this specific test.
        },

        // Test case: Ensuring correct selection when a tag appears multiple times.
        testMultipleTagOccurrences: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const selectedDivs = queryHtmlElements(parsedDocumentTree, 'div');
                testContext.strictEqual(selectedDivs.length, 3, 'Expected to find exactly three <div> elements.');
                // Verify that each found element is indeed a 'div'.
                for (const currentDiv of selectedDivs) {
                    testContext.strictEqual(currentDiv.name, 'div', 'Each selected element should consistently be a <div> tag.');
                }
            });
            testContext.done();
        },

        // Test case: Selecting a child element nested within another, expecting a single match.
        testNestedTagSingleMatch: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                verifyElementSelection(testContext, parsedDocumentTree, 'div div', ['inner']);
            });
            testContext.done();
        },

        // Test case: Selecting elements that are deeply nested, expecting multiple matches.
        testDeeplyNestedTags: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                verifyElementSelection(testContext, parsedDocumentTree, 'span span', ['yx', 'yy']);
            });
            testContext.done();
        },

        // Test case: Confirming selection across various parent-child path combinations.
        testVariousParentPaths: function(testContext) {
            const potentialSelectors = ['html div', 'html body div', 'body div'];
            for (const currentSelector of potentialSelectors) {
                executeDomTest(testContext, (parsedDocumentTree) => {
                    verifyElementSelection(testContext, parsedDocumentTree, currentSelector, ['main', 'inner', 'footer']);
                });
            }
            testContext.done();
        },

        // Test case: Verifying that a non-existent tag yields no results.
        testNonMatchingTag: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const queryResults = queryHtmlElements(parsedDocumentTree, 'nonexistenthtmltag');
                testContext.strictEqual(queryResults.length, 0, 'Expected zero elements for a tag that does not exist.');
            });
            testContext.done();
        },

        // Test case: Handling queries with syntactically invalid tag names.
        testInvalidTagNameQuery: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const invalidTagResults = queryHtmlElements(parsedDocumentTree, 'invalid%tag-name');
                testContext.strictEqual(invalidTagResults.length, 0, 'Expected no elements for an improperly formatted tag query.');
            });
            testContext.done();
        },

        // Test case: Assertions for selecting different header level tags.
        testHeaderTagSelection: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const headerSelectionSpecs = [
                    ['h1', ['header1']],
                    ['h2', ['header2', 'header3']]
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, headerSelectionSpecs);
            });
            testContext.done();
        },

        // Test case: Selection based on a single class name, with tag specificity variations.
        testSingleClassSelection: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const classQueryVariations = ['.onep', 'p.onep', 'html p.onep'];
                for (const currentClassQuery of classQueryVariations) {
                    const matchedItems = queryHtmlElements(parsedDocumentTree, currentClassQuery);
                    testContext.strictEqual(matchedItems.length, 1, `Expected a single element for query: "${currentClassQuery}"`);
                    testContext.strictEqual(matchedItems[0].name, 'p', 'The selected element must be a paragraph tag.');
                    testContext.strictEqual(matchedItems[0].attribs.class, 'onep', 'The selected element must possess the class "onep".');
                }
            });
            testContext.done();
        },

        // Test case: Class selector combined with an incorrect tag name.
        testClassTagMismatch: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const mismatchedResults = queryHtmlElements(parsedDocumentTree, 'div.onep');
                testContext.strictEqual(mismatchedResults.length, 0, 'Expected zero elements when tag and class do not match.');
            });
            testContext.done();
        },

        // Test case: Selecting an element that has multiple class attributes.
        testMultiClassSelection: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const multiClassElements = queryHtmlElements(parsedDocumentTree, 'p.class1.class2.class3');
                testContext.strictEqual(multiClassElements.length, 1, 'Expected one element matching all three specified classes.');
            });
            testContext.done();
        },

        // Test case: Selection of elements using their ID attribute.
        testIdentifierSelection: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const idQueryVariations = ['div#inner', '#inner', 'div div#inner'];
                for (const currentIdQuery of idQueryVariations) {
                    verifyElementSelection(testContext, parsedDocumentTree, currentIdQuery, ['inner']);
                }
            });
            testContext.done();
        },

        // Test case: Attempting to select a non-existent ID.
        testMissingIdentifier: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const absentElements = queryHtmlElements(parsedDocumentTree, '#nonexistentid');
                testContext.strictEqual(absentElements.length, 0, 'Expected no elements to be found for an ID that does not exist.');
            });
            testContext.done();
        },

        // Test case: Selecting child elements nested within an element identified by its ID.
        testChildrenWithinIdParent: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const paragraphsInInnerDiv = queryHtmlElements(parsedDocumentTree, 'div#inner p');
                testContext.strictEqual(paragraphsInInnerDiv.length, 3, 'Expected three paragraph elements within the #inner div.');
                // Validate the tag name for each found element.
                for (const paragraphElement of paragraphsInInnerDiv) {
                    testContext.strictEqual(paragraphElement.name, 'p', 'Each matched element should be a <p> tag.');
                }
                // Validate a specific attribute of one of the child elements.
                testContext.strictEqual(paragraphsInInnerDiv[1].attribs.class, 'onep', 'The second paragraph should have the class "onep".');

                // Explicitly check for the absence of a 'class' attribute on the first paragraph.
                const firstParagraphAttributes = paragraphsInInnerDiv[0].attribs;
                testContext.ok(!firstParagraphAttributes || !firstParagraphAttributes.class,
                    'The first paragraph element should not possess a class attribute.');
            });
            testContext.done();
        },

        // Test case: Multiple selectors that are expected to return an empty set of results.
        testEmptyResultsSet: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const nonMatchingSelectors = ['div#main del', 'div#main div.oops', 'div div#main'];
                for (const currentNonMatchingSelector of nonMatchingSelectors) {
                    const noMatches = queryHtmlElements(parsedDocumentTree, currentNonMatchingSelector);
                    testContext.strictEqual(noMatches.length, 0, `Expected zero elements for query: "${currentNonMatchingSelector}"`);
                }
            });
            testContext.done();
        },

        // Test case: Advanced scenarios involving multi-class selections.
        testAdvancedMultiClassSupport: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const complexClassSelectors = [
                    '.class1', 'p.class1', '.class2', 'p.class2',
                    '.class3', 'p.class3', 'html p.class2',
                    'div#inner .class2'
                ];
                for (const currentComplexSelector of complexClassSelectors) {
                    verifyElementSelection(testContext, parsedDocumentTree, currentComplexSelector, ['pmulti']);
                }
            });
            testContext.done();
        },
    },

    // --- Collection of Attribute-Based CSS Selector Tests ---
    attributeBasedQueries: {
        // Test case: Attribute exact value match selector `[attr="value"]`.
        testAttributeExactMatch: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const exactMatchSpecs = [
                    ['p[class="onep"]', ['p1']],
                    ['p[id="p1"]', ['p1']],
                    ['[class="onep"]', ['p1']],
                    ['[id="p1"]', ['p1']],
                    ['link[rel="stylesheet"]', ['l1']],
                    ['link[type="text/css"]', ['l1']],
                    ['link[href="blah.css"]', ['l1']],
                    ['link[href="no-blah.css"]', []],
                    ['[rel="stylesheet"]', ['l1']],
                    ['[type="text/css"]', ['l1']],
                    ['[href="blah.css"]', ['l1']],
                    ['[href="no-blah.css"]', []],
                    ['p[href="no-blah.css"]', []],
                    // This final entry is redundant from the original code, included for clone fidelity.
                    ['[href="no-blah.css"]', []],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, exactMatchSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute contains word selector `[attr~="word"]`.
        testAttributeContainsWord: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const containsWordSpecs = [
                    ['p[class~="class1"]', ['pmulti']],
                    ['p[class~="class2"]', ['pmulti']],
                    ['p[class~="class3"]', ['pmulti']],
                    ['[class~="class1"]', ['pmulti']],
                    ['[class~="class2"]', ['pmulti']],
                    ['[class~="class3"]', ['pmulti']],
                    ['a[rel~="friend"]', ['bob']],
                    ['a[rel~="met"]', ['bob']],
                    ['[rel~="friend"]', ['bob']],
                    ['[rel~="met"]', ['bob']],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, containsWordSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute value starts with a specific prefix `[attr^="prefix"]`.
        testAttributeStartsWith: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const startsWithSpecs = [
                    ['[rel^="style"]', ['l1']],
                    ['link[rel^="style"]', ['l1']],
                    ['notlink[rel^="notstyle"]', []], // Tag mismatch with attribute
                    ['[rel^="notstyle"]', []],
                    ['link[rel^="notstyle"]', []],
                    ['link[href^="bla"]', ['l1']],
                    ['a[href^="http://"]', ['bob', 'me']],
                    ['[href^="http://"]', ['bob', 'me']],
                    ['[id^="p"]', ['pmulti', 'p1']],
                    ['[id^="m"]', ['me', 'main']],
                    ['div[id^="m"]', ['main']],
                    ['a[id^="m"]', ['me']],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, startsWithSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute value ends with a specific suffix `[attr$="suffix"]`.
        testAttributeEndsWith: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const endsWithSpecs = [
                    ['[href$=".css"]', ['l1']],
                    ['link[href$=".css"]', ['l1']],
                    ['link[id$="1"]', ['l1']],
                    ['[id$="1"]', ['l1', 'p1', 'header1']],
                    ['div[id$="1"]', []], // Tag mismatch with attribute
                    ['[id$="noending"]', []],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, endsWithSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute value contains a specific substring `[attr*="substring"]`.
        testAttributeContainsSubstring: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const containsSubstringSpecs = [
                    // Re-testing cases from start/end with the broader 'contains' logic
                    ['[rel*="style"]', ['l1']],
                    ['link[rel*="style"]', ['l1']],
                    ['notlink[rel*="notstyle"]', []],
                    ['[rel*="notstyle"]', []],
                    ['link[rel*="notstyle"]', []],
                    ['link[href*="bla"]', ['l1']],
                    ['a[href*="http://"]', ['bob', 'me']],
                    ['[href*="http://"]', ['bob', 'me']],
                    ['[id*="p"]', ['pmulti', 'p1']],
                    ['div[id*="m"]', ['main']],
                    ['a[id*="m"]', ['me']],
                    ['[href*=".css"]', ['l1']],
                    ['link[href*=".css"]', ['l1']],
                    ['link[id*="1"]', ['l1']],
                    ['[id*="1"]', ['l1', 'p1', 'header1']],
                    ['div[id*="1"]', []],
                    ['[id*="noending"]', []],
                    // New specific 'contains' tests
                    ['[href*="."]', ['bob', 'me', 'l1']],
                    ['a[href*="."]', ['bob', 'me']],
                    ['link[href*="."]', ['l1']],
                    ['div[id*="n"]', ['main', 'inner']],
                    ['div[id*="nn"]', ['inner']],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, containsSubstringSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute value is an exact match or a hyphen-separated prefix `[attr|="value"]`.
        testAttributeExactOrHyphenPrefix: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const hyphenPrefixSpecs = [
                    ['p[lang|="en"]', ['lang-en', 'lang-en-gb', 'lang-en-us']],
                    ['[lang|="en"]', ['lang-en', 'lang-en-gb', 'lang-en-us']],
                    ['p[lang|="fr"]', ['lang-fr']],
                    ['p[lang|="gb"]', []], // Should not match 'en-gb' as 'gb' is not a full prefix or exact match.
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, hyphenPrefixSpecs);
            });
            testContext.done();
        },

        // Test case: Attribute existence selector `[attr]`.
        testAttributeExistence: function(testContext) {
            executeDomTest(testContext, (parsedDocumentTree) => {
                const existenceSpecs = [
                    ['[rel]', ['l1', 'bob', 'me']],
                    ['link[rel]', ['l1']],
                    ['a[rel]', ['bob', 'me']],
                    ['[lang]', ['lang-en', 'lang-en-gb', 'lang-en-us', 'lang-fr']],
                    ['p[class]', ['p1', 'pmulti']],
                    ['[nonexistentattr]', []], // Query for an attribute that does not exist.
                    ['p[nonexistentattr]', []],
                ];
                checkMultipleSelections(testContext, parsedDocumentTree, existenceSpecs);
            });
            testContext.done();
        },
    }
};