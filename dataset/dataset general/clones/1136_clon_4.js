const queryElements = require('soupselect').select;
const domProcessor = require("htmlparser");
const fileSystemUtils = require('fs');
const systemUtilities = require('sys');

const sourceHtmlContent = fileSystemUtils.readFileSync('testdata/test.html', 'utf-8');

const processHtmlForChecks = (assertionContext, domReadyHandler) => {
    const parsingAgent = new domProcessor.DefaultHandler((errorObject, parsedTree) => {
        if (errorObject) {
            systemUtilities.debug("Parsing Error: " + errorObject);
        } else {
            domReadyHandler(parsedTree);
        }
    });
    const domParser = new domProcessor.Parser(parsingAgent);
    domParser.parseComplete(sourceHtmlContent);
};

const verifySelectionIdentity = (assertionContext, documentObjectModel, queryPattern, anticipatedIdentifiers) => {
    const matchedNodes = queryElements(documentObjectModel, queryPattern);
    const foundIdentifiers = matchedNodes
        .map(nodeItem => (nodeItem.attribs && nodeItem.attribs.id) ? nodeItem.attribs.id : '')
        .sort();

    anticipatedIdentifiers.sort();

    assertionContext.deepEqual(
        anticipatedIdentifiers,
        foundIdentifiers,
        `Query: ${queryPattern}, Expected: ${systemUtilities.inspect(anticipatedIdentifiers)}, Found: ${systemUtilities.inspect(foundIdentifiers)}`
    );
};

const validateMultipleSelections = (assertionContext, documentObjectModel, specificationList) => {
    specificationList.forEach(currentSpecification => {
        verifySelectionIdentity(assertionContext, documentObjectModel, currentSpecification[0], currentSpecification[1]);
    });
};

module.exports.htmlElementAssertions = {
    singleTagVerification: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, 'title');
            assertionHandle.equal(selectedElements.length, 1);
            assertionHandle.equal(selectedElements[0].name, 'title');
            assertionHandle.equal(selectedElements[0].children[0].raw, 'The title');
        });
        assertionHandle.finished();
    },
    
    multipleTagVerification: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, 'div');
            assertionHandle.equal(selectedElements.length, 3);
            selectedElements.forEach(divisionElement => {
                assertionHandle.equal(divisionElement.name, 'div');
            });
        });
        assertionHandle.finished();
    },
    
    nestedTagSingleMatch: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            verifySelectionIdentity(assertionHandle, documentObjectModel, 'div div', ['inner']);
        });
        assertionHandle.finished();
    },
    
    nestedTagsMultipleMatch: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            verifySelectionIdentity(assertionHandle, documentObjectModel, 'span span', ['yx', 'yy']);
        });
        assertionHandle.finished();
    },
    
    nestedTagManyMatches: (assertionHandle) => {
        ['html div', 'html body div', 'body div'].forEach(cssQuery => {
            processHtmlForChecks(assertionHandle, (documentObjectModel) => {
                verifySelectionIdentity(assertionHandle, documentObjectModel, cssQuery, ['main', 'inner', 'footer']);
            });
        });
        assertionHandle.finished();
    },
    
    tagNoMatchExpected: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            assertionHandle.equal(queryElements(documentObjectModel, 'del').length, 0);
        });
        assertionHandle.finished();
    },
    
    tagInvalidSyntax: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            assertionHandle.equal(queryElements(documentObjectModel, 'tag%t').length, 0);
        });
        assertionHandle.finished();
    },
    
    headerTagsVerification: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
                ['h1', ['header1']],
                ['h2', ['header2', 'header3']]
            ]);
        });
        assertionHandle.finished();
    },
    
    classSelectorSingle: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            ['.onep', 'p.onep', 'html p.onep'].forEach(cssQuery => {
                const selectedElements = queryElements(documentObjectModel, cssQuery);
                assertionHandle.equal(selectedElements.length, 1);
                assertionHandle.equal(selectedElements[0].name, 'p');
                assertionHandle.equal(selectedElements[0].attribs.class, 'onep');
            });
        });
        assertionHandle.finished();
    },
    
    classMismatchedTag: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, 'div.onep');
            assertionHandle.equal(selectedElements.length, 0);
        });
        assertionHandle.finished();
    },
    
    multipleClassSelector: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, 'p.class1.class2.class3');
            assertionHandle.equal(selectedElements.length, 1);
        });
        assertionHandle.finished();
    },
    
    idSelectorSingle: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            ['div#inner', '#inner', 'div div#inner'].forEach(cssQuery => {
                verifySelectionIdentity(assertionHandle, documentObjectModel, cssQuery, ['inner']);
            });
        });
        assertionHandle.finished();
    },
    
    badIdSelector: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, '#doesnotexist');
            assertionHandle.equal(selectedElements.length, 0);
        });
        assertionHandle.finished();
    },
    
    itemsWithinId: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            const selectedElements = queryElements(documentObjectModel, 'div#inner p');
            assertionHandle.equal(selectedElements.length, 3);
            selectedElements.forEach(paragraphElement => {
                assertionHandle.equal(paragraphElement.name, 'p');
            });
            assertionHandle.equal(selectedElements[1].attribs.class, 'onep');
            
            assertionHandle.ok(typeof selectedElements[0].attribs == 'undefined');
            assertionHandle.finished();
        });
    },
    
    emptySelections: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            ['div#main del', 'div#main div.oops', 'div div#main'].forEach(cssQuery => {
                assertionHandle.equal(queryElements(documentObjectModel, cssQuery).length, 0);
            });
        });
        assertionHandle.finished();
    },
    
    multiClassSupport: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            ['.class1', 'p.class1', '.class2', 'p.class2', 
                '.class3', 'p.class3', 'html p.class2',
                'div#inner .class2'].forEach(cssQuery => {
                verifySelectionIdentity(assertionHandle, documentObjectModel, cssQuery, ['pmulti']);
            });
        });
        assertionHandle.finished();
    },
    
};

module.exports.attributeCriteriaAssertions = {
    
    attributeEquality: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
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
                ['[href="no-blah.css"]', []],
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeTilde: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
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
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeStartsWith: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
                ['[rel^="style"]', ['l1']],
                ['link[rel^="style"]', ['l1']],
                ['notlink[rel^="notstyle"]', []],
                ['[rel^="notstyle"]', []],
                ['link[rel^="notstyle"]', []],
                ['link[href^="bla"]', ['l1']],
                ['a[href^="http://"]', ['bob', 'me']],
                ['[href^="http://"]', ['bob', 'me']],
                ['[id^="p"]', ['pmulti', 'p1']],
                ['[id^="m"]', ['me', 'main']],
                ['div[id^="m"]', ['main']],
                ['a[id^="m"]', ['me']],
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeEndsWith: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
                ['[href$=".css"]', ['l1']],
                ['link[href$=".css"]', ['l1']],
                ['link[id$="1"]', ['l1']],
                ['[id$="1"]', ['l1', 'p1', 'header1']],
                ['div[id$="1"]', []],
                ['[id$="noending"]', []],
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeContainsSubstring: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
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
                ['[href*="."]', ['bob', 'me', 'l1']],
                ['a[href*="."]', ['bob', 'me']],
                ['link[href*="."]', ['l1']],
                ['div[id*="n"]', ['main', 'inner']],
                ['div[id*="nn"]', ['inner']],
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeExactOrHyphen: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
                ['p[lang|="en"]', ['lang-en', 'lang-en-gb', 'lang-en-us']],
                ['[lang|="en"]', ['lang-en', 'lang-en-gb', 'lang-en-us']],
                ['p[lang|="fr"]', ['lang-fr']],
                ['p[lang|="gb"]', []],
            ]);
        });
        assertionHandle.finished();
    },
    
    attributeExistence: (assertionHandle) => {
        processHtmlForChecks(assertionHandle, (documentObjectModel) => {
            validateMultipleSelections(assertionHandle, documentObjectModel, [
                ['[rel]', ['l1', 'bob', 'me']],
                ['link[rel]', ['l1']],
                ['a[rel]', ['bob', 'me']],
                ['[lang]', ['lang-en', 'lang-en-gb', 'lang-en-us', 'lang-fr']],
                ['p[class]', ['p1', 'pmulti']],
                ['[blah]', []],
                ['p[blah]', []],
            ]);
        });
        assertionHandle.finished();
    },
};