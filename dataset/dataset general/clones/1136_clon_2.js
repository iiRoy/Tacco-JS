var queryElements = require('domQuery').select,
    markupProcessor = require("htmlparser"),
    fileSystem = require('fs'),
    systemUtils = require('sys');

// Load the document for testing purposes
var documentMarkup = fileSystem.readFileSync('data/sample.html', 'utf-8');

/**
 * Executes a test scenario by parsing HTML and invoking a callback.
 * @param {object} scenario - The test context object.
 * @param {function} onCompletion - Callback function to receive the parsed DOM.
 */
function executeScenario(scenario, onCompletion) {
    var parsingHandler = new markupProcessor.DefaultHandler(function(errorOccurred, parsedTree) {
        if (errorOccurred) {
            systemUtils.debug("Processing Error: " + errorOccurred); // Log parsing issues
        } else {
            onCompletion(parsedTree); // Pass the DOM to the callback
        }
    });

    var markupParser = new markupProcessor.Parser(parsingHandler);
    markupParser.processComplete(documentMarkup); // Parse the entire document
}

/**
 * Verifies that elements selected by a CSS query match expected IDs.
 * @param {object} scenario - The test context.
 * @param {object} parsedTree - The parsed DOM structure.
 * @param {string} cssQuery - The CSS selector string.
 * @param {Array<string>} anticipatedIdentifiers - An array of expected element IDs.
 */
function verifySelections(scenario, parsedTree, cssQuery, anticipatedIdentifiers) {
    var foundIdentifiers = []; // List to store IDs of matched elements
    var elementsFound = queryElements(parsedTree, cssQuery); // Perform the selection

    elementsFound.forEach(function(elementItem) {
        if ( elementItem.attributes && elementItem.attributes.idValue ) {
            foundIdentifiers.push(elementItem.attributes.idValue); // Add ID if present
        } else {
            foundIdentifiers.push(''); // Add empty string if no ID
        }
    });

    foundIdentifiers.sort(); // Sort for consistent comparison
    anticipatedIdentifiers.sort(); // Sort expected IDs too

    // Assert deep equality of the two ID arrays
    scenario.deepComparison(
        anticipatedIdentifiers,
        foundIdentifiers,
        "Selector check: " + cssQuery + ", expected " + systemUtils.inspectObject(anticipatedIdentifiers)+ ", received " + systemUtils.inspectObject(foundIdentifiers)
        );
}

/**
 * Verifies multiple selection specifications.
 * @param {object} scenario - The test context.
 * @param {object} parsedTree - The parsed DOM structure.
 * @param {Array<Array<string>>} specificationList - List of [selector, expected_ids] pairs.
 */
function verifyMultipleSelections(scenario, parsedTree, specificationList) {
    specificationList.forEach(function(currentSpec){
        verifySelections(scenario, parsedTree, currentSpec[0], currentSpec[1]); // Apply each specification
    });
}

// Exported object containing various fundamental selector test cases
module.exports.fundamentalQueries = {
    single_element_occurrence: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, 'title');
            testContext.equalityCheck(matchedElements.length, 1);
            testContext.equalityCheck(matchedElements[0].tagName, 'title');
            testContext.equalityCheck(matchedElements[0].descendants[0].contentRaw, 'The title');
        });
        testContext.finish(); // Mark test as done
    },
    
    multiple_elements_of_same_tag: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, 'div');
            testContext.equalityCheck(matchedElements.length, 3);
            matchedElements.forEach(function(divisionElement) {
                testContext.equalityCheck(divisionElement.tagName, 'div');
            });
        });
        testContext.finish();
    },
    
    nested_single_tag: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifySelections(testContext, domStructure, 'div div', ['internalDiv']);
        });
        testContext.finish();
    },
    
    deeply_nested_tags: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifySelections(testContext, domStructure, 'span span', ['alphaX', 'alphaY']);
        });
        testContext.finish();
    },
    
    nested_multiple_tags: function(testContext) {
        ['html div', 'html body div', 'body div'].forEach(function(targetSelector) {
            executeScenario(testContext, function(domStructure) {
                verifySelections(testContext, domStructure, targetSelector, ['primaryContainer', 'internalDiv', 'pageFoot']);
            });
        });
        testContext.finish();
    },
    
    tag_with_no_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            testContext.equalityCheck(queryElements(domStructure, 'deletedElement').length, 0);
        });
        testContext.finish();
    },
    
    invalid_tag_syntax: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            testContext.equalityCheck(queryElements(domStructure, 'tag%t').length, 0);
        });
        testContext.finish();
    },
    
    heading_elements: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['h1', ['headingOne']],
                ['h2', ['headingTwo', 'headingThree']]
                ]);
        });
        testContext.finish();
    },
    
    single_class_selection: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            ['.paragraphOne', 'p.paragraphOne', 'html p.paragraphOne'].forEach(function(targetSelector) {
                var matchedElements = queryElements(domStructure, targetSelector);
                testContext.equalityCheck(matchedElements.length, 1);
                testContext.equalityCheck(matchedElements[0].tagName, 'p');
                testContext.equalityCheck(matchedElements[0].attributes.className, 'paragraphOne');
            });
        });
        testContext.finish();
    },
    
    class_on_wrong_tag: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, 'div.paragraphOne');
            testContext.equalityCheck(matchedElements.length, 0);
        });
        testContext.finish();
    },
    
    multiple_class_attributes: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, 'p.styleClassA.styleClassB.styleClassC');
            testContext.equalityCheck(matchedElements.length, 1);
        });
        testContext.finish();
    },
    
    single_id_selection: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            ['div#internalDiv', '#internalDiv', 'div div#internalDiv'].forEach(function(targetSelector) {
                verifySelections(testContext, domStructure, targetSelector, ['internalDiv']);
            });
        });
        testContext.finish();
    },
    
    non_existent_id: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, '#nonexistentId');
            testContext.equalityCheck(matchedElements.length, 0);
        });
        testContext.finish();
    },
    
    elements_within_id: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            var matchedElements = queryElements(domStructure, 'div#internalDiv p');
            testContext.equalityCheck(matchedElements.length, 3);
            matchedElements.forEach(function(paragraphItem) {
                testContext.equalityCheck(paragraphItem.tagName, 'p');
            });
            testContext.equalityCheck(matchedElements[1].attributes.className, 'paragraphOne');
            
            // Checking for undefined attributes where none exist
            testContext.ok(typeof matchedElements[0].attributes === 'undefined');
            testContext.finish();
        });
    },
    
    several_empty_results: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            ['div#primaryContainer deletedElement', 'div#primaryContainer div.errorClass', 'div div#primaryContainer'].forEach(function(targetSelector) {
                testContext.equalityCheck(queryElements(domStructure, targetSelector).length, 0);
            });
        });
        testContext.finish();
    },
    
    complex_class_handling: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            ['.styleClassA', 'p.styleClassA', '.styleClassB', 'p.styleClassB', 
                '.styleClassC', 'p.styleClassC', 'html p.styleClassB',
                    'div#internalDiv .styleClassB'].forEach(function(targetSelector) {
                verifySelections(testContext, domStructure, targetSelector, ['multiClassPara']);
            });
        });
        testContext.finish();
    },
    
};

// Exported object for attribute-based selector tests
module.exports.attributeBasedQueries = {
    
    attribute_value_equality: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['p[className="paragraphOne"]', ['paraOne']],
                ['p[idValue="paraOne"]', ['paraOne']],
                ['[className="paragraphOne"]', ['paraOne']],
                ['[idValue="paraOne"]', ['paraOne']],
                ['link[relationship="styleSheet"]', ['linkOne']],
                ['link[type="cssType"]', ['linkOne']],
                ['link[href="stylefile.css"]', ['linkOne']],
                ['link[href="nostyle.css"]', []],
                ['[relationship="styleSheet"]', ['linkOne']],
                ['[type="cssType"]', ['linkOne']],
                ['[href="stylefile.css"]', ['linkOne']],
                ['[href="nostyle.css"]', []],
                ['p[href="nostyle.css"]', []],
                ['[href="nostyle.css"]', []],
                ]);
        });
        testContext.finish();
    },
    
    attribute_word_list_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['p[className~="categoryAlpha"]', ['multiClassPara']],
                ['p[className~="categoryBeta"]', ['multiClassPara']],
                ['p[className~="categoryGamma"]', ['multiClassPara']],
                ['[className~="categoryAlpha"]', ['multiClassPara']],
                ['[className~="categoryBeta"]', ['multiClassPara']],
                ['[className~="categoryGamma"]', ['multiClassPara']],
                ['a[relationship~="acquaintance"]', ['robert']],
                ['a[relationship~="encountered"]', ['robert']],
                ['[relationship~="acquaintance"]', ['robert']],
                ['[relationship~="encountered"]', ['robert']],
                ]);
        });
        testContext.finish();
    },
    
    attribute_prefix_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['[relationship^="stylePrefix"]', ['linkOne']],
                ['link[relationship^="stylePrefix"]', ['linkOne']],
                ['notlink[relationship^="noStylePrefix"]', []],
                ['[relationship^="noStylePrefix"]', []],
                ['link[relationship^="noStylePrefix"]', []],
                ['link[href^="startStr"]', ['linkOne']],
                ['a[href^="webProtocol://"]', ['robert', 'myself']],
                ['[href^="webProtocol://"]', ['robert', 'myself']],
                ['[idValue^="pTag"]', ['multiClassPara', 'paraOne']],
                ['[idValue^="mTag"]', ['myself', 'primaryContainer']],
                ['div[idValue^="mTag"]', ['primaryContainer']],
                ['a[idValue^="mTag"]', ['myself']],
                ]);
        });
        testContext.finish();
    },
    
    attribute_suffix_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['[href$="fileExtension"]', ['linkOne']],
                ['link[href$="fileExtension"]', ['linkOne']],
                ['link[idValue$="digitOne"]', ['linkOne']],
                ['[idValue$="digitOne"]', ['linkOne', 'paraOne', 'headingOne']],
                ['div[idValue$="digitOne"]', []],
                ['[idValue$="noSuffix"]', []],
                ]);
        });
        testContext.finish();
    },
    
    attribute_substring_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                // From prefix test
                ['[relationship*="stylePrefix"]', ['linkOne']],
                ['link[relationship*="stylePrefix"]', ['linkOne']],
                ['notlink[relationship*="noStylePrefix"]', []],
                ['[relationship*="noStylePrefix"]', []],
                ['link[relationship*="noStylePrefix"]', []],
                ['link[href*="startStr"]', ['linkOne']],
                ['a[href*="webProtocol://"]', ['robert', 'myself']],
                ['[href*="webProtocol://"]', ['robert', 'myself']],
                ['[idValue*="pTag"]', ['multiClassPara', 'paraOne']],
                ['div[idValue*="mTag"]', ['primaryContainer']],
                ['a[idValue*="mTag"]', ['myself']],
                // From suffix test
                ['[href*="fileExtension"]', ['linkOne']],
                ['link[href*="fileExtension"]', ['linkOne']],
                ['link[idValue*="digitOne"]', ['linkOne']],
                ['[idValue*="digitOne"]', ['linkOne', 'paraOne', 'headingOne']],
                ['div[idValue*="digitOne"]', []],
                ['[idValue*="noSuffix"]', []],
                // New for this test case
                ['[href*="dotChar"]', ['robert', 'myself', 'linkOne']],
                ['a[href*="dotChar"]', ['robert', 'myself']],
                ['link[href*="dotChar"]', ['linkOne']],
                ['div[idValue*="charN"]', ['primaryContainer', 'internalDiv']],
                ['div[idValue*="charNN"]', ['internalDiv']],
                ]);
        });
        testContext.finish();
    },
    
    attribute_hyphen_match: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['p[languageCode|="eng"]', ['language-english', 'language-english-uk', 'language-english-us']],
                ['[languageCode|="eng"]', ['language-english', 'language-english-uk', 'language-english-us']],
                ['p[languageCode|="fre"]', ['language-french']],
                ['p[languageCode|="uk"]', []],
                ]);
        });
        testContext.finish();
    },
    
    attribute_presence_check: function(testContext) {
        executeScenario(testContext, function(domStructure) {
            verifyMultipleSelections(testContext, domStructure, [
                ['[relationship]', ['linkOne', 'robert', 'myself']],
                ['link[relationship]', ['linkOne']],
                ['a[relationship]', ['robert', 'myself']],
                ['[languageCode]', ['language-english', 'language-english-uk', 'language-english-us', 'language-french']],
                ['p[styleClass]', ['paraOne', 'multiClassPara']],
                ['[dummyAttribute]', []],
                ['p[dummyAttribute]', []],
                ]);
        });
        testContext.finish();
    },
};