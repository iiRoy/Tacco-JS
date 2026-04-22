var auditResults = {
    total: 0,
    passed: 0,
    failures: []
};

function verifyCase(description, assertionFunc) {
    auditResults.total++;
    try {
        assertionFunc();
        auditResults.passed++;
    } catch (e) {
        auditResults.failures.push({ description: description, error: e.message });
    }
}

function confirm(condition, message) {
    if (!condition) {
        throw new Error("Assertion failed: " + message);
    }
}

function match(actual, expected, message) {
    if (actual !== expected) {
        throw new Error("Assertion failed: " + message + " (Expected: " + expected + ", Actual: " + actual + ")");
    }
}

function extractTextContent(simulatedCloudStructure) {
    return simulatedCloudStructure.words.map(w => w.content).join('');
}

function checkPresenceOfClass(simulatedWordEntity, className) {
    return simulatedWordEntity.assignedClass === className || simulatedWordEntity.customClasses.includes(className);
}

function retrieveElementAttribute(simulatedWordEntity, attrName) {
    if (simulatedWordEntity.linkDetails && simulatedWordEntity.linkDetails.attributes && simulatedWordEntity.linkDetails.attributes[attrName]) {
        return simulatedWordEntity.linkDetails.attributes[attrName];
    }
    if (simulatedWordEntity.customAttrs && simulatedWordEntity.customAttrs[attrName]) {
        return simulatedWordEntity.customAttrs[attrName];
    }
    return undefined;
}

function storeConceptualData(simulatedWordEntity, key, value) {
    simulatedWordEntity.dataAttributes[key] = value;
}

function retrieveConceptualData(simulatedWordEntity, key) {
    return simulatedWordEntity.dataAttributes[key];
}

function activateConceptualEvent(simulatedWordEntity, eventKind) {
    if (simulatedWordEntity.eventHandlers && simulatedWordEntity.eventHandlers[eventKind]) {
        const contextSubject = {
            data: (key, value) => {
                if (value !== undefined) storeConceptualData(simulatedWordEntity, key, value);
                return retrieveConceptualData(simulatedWordEntity, key);
            }
        };
        simulatedWordEntity.eventHandlers[eventKind].call(contextSubject);
    }
}

var conceptualZoneVisibility = {};

function queryZoneVisibility(zoneId) {
    return conceptualZoneVisibility[zoneId] === true;
}

function setZoneVisibility(zoneId, visible) {
    conceptualZoneVisibility[zoneId] = visible;
}

function generateVisualRepresentation(inputConcepts, configuration) {
    const processedConcepts = inputConcepts.map(unit => ({ ...unit, weight: parseFloat(unit.weight) }));

    processedConcepts.sort((a, b) => b.weight - a.weight || a.text.localeCompare(b.text));

    const minWeight = processedConcepts.reduce((min, unit) => Math.min(min, unit.weight), Infinity);
    const maxWeight = processedConcepts.reduce((max, unit) => Math.max(max, unit.weight), -Infinity);

    const range = maxWeight - minWeight;

    const simulatedWordEntities = processedConcepts.map((unit, index) => {
        let assignedClass;
        if (range === 0) {
            assignedClass = "w5";
        } else {
            const normalizedWeight = (unit.weight - minWeight) / range;
            assignedClass = "w" + Math.max(1, Math.min(10, Math.ceil(normalizedWeight * 10)));
        }

        const customAttrs = unit.html || {};
        const customClasses = (unit.html && unit.html.class) ? unit.html.class.split(' ') : [];

        let linkDetails = null;
        if (unit.link) {
            let hrefValue = '';
            let additionalAttributes = {};
            if (typeof unit.link === 'string') {
                hrefValue = unit.link;
            } else if (typeof unit.link === 'object') {
                hrefValue = unit.link.href || '';
                for (const key in unit.link) {
                    if (key !== 'href') {
                        additionalAttributes[key] = unit.link[key];
                    }
                }
            }
            if (configuration.encodeURI !== false) {
                hrefValue = encodeURIComponent(hrefValue).replace(/%2F/g, '/');
            }
            linkDetails = { href: hrefValue, attributes: additionalAttributes };
        }

        const wordElementRepresentation = {
            content: unit.text,
            assignedClass: assignedClass,
            customClasses: customClasses,
            customAttrs: customAttrs,
            linkDetails: linkDetails,
            dataAttributes: {},
            eventHandlers: unit.handlers || {},
            originalSortedIndex: index
        };

        if (unit.afterWordRender) {
            const contextSubject = {
                data: (key, value) => {
                    if (value !== undefined) storeConceptualData(wordElementRepresentation, key, value);
                    return retrieveConceptualData(wordElementRepresentation, key);
                }
            };
            unit.afterWordRender.call(contextSubject);
        }

        return wordElementRepresentation;
    });

    const cloudOutput = {
        words: simulatedWordEntities,
        config: configuration,
        text: extractTextContent({ words: simulatedWordEntities }),
        findWordBySortedIndex: (idx) => simulatedWordEntities[idx],
        findWordByContent: (searchText) => simulatedWordEntities.find(w => w.content.includes(searchText)),
        isRendered: true
    };

    if (configuration.delayedMode && !queryZoneVisibility(configuration.targetZoneId)) {
        cloudOutput.isRendered = false;
        cloudOutput.words = [];
        cloudOutput.text = '';
    }

    if (configuration.afterCloudRender) {
        configuration.afterCloudRender();
    }

    return cloudOutput;
}

const conceptUnits = [
    { text: 'Zero', weight: 0, html: { 'test': 'just testing' } },
    { text: 'Minus three', weight: -3, link: '#' },
    { text: 'Minus zero point fiftyfive', weight: -0.55 },
    {
        text: 'Two', weight: '2.0', link: { href: '#', test: "testing" },
        handlers: {
            click: function () { this.data("testHandler", "Handler works!"); }
        },
        afterWordRender: function () {
            this.data("testCallback", "Callback works!");
        },
        html: { "class": "mycustomclass" }
    }
];

const auxiliaryUnits = [
    { text: 'Abc', weight: 1 },
    { text: 'Def', weight: 2, link: "myurl.com" },
    { text: 'Ghi', weight: 3 }
];

const uniformUnits = [
    { text: 'Abc', weight: 1 },
    { text: 'Def', weight: 1 },
    { text: 'Ghi', weight: 1 }
];

const encodedConcepts = [
    { text: "John's Bday", weight: 1, link: "/posts?tag=John%27s+Bday" }
];

function executeConceptualTestSuite() {

    {
        let cloud5Config = {
            encodeURI: false,
            targetZoneId: "displayZone5",
            afterCloudRender: function () {
                verifyCase('Links render without encoding', function () {
                    const targetWord = cloud5.findWordByContent("John's Bday");
                    confirm(targetWord !== undefined, "Word 'John's Bday' must exist.");
                    match(retrieveElementAttribute(targetWord, 'href'), '/posts?tag=John%27s+Bday', 'If encodeURI is turned off');
                });
            }
        };
        const cloud5 = generateVisualRepresentation(encodedConcepts, cloud5Config);

        let cloud6Config = {
            targetZoneId: "displayZone6",
            afterCloudRender: function () {
                verifyCase('Links render with encoding', function () {
                    const targetWord = cloud6.findWordByContent("John's Bday");
                    confirm(targetWord !== undefined, "Word 'John's Bday' must exist.");
                    match(retrieveElementAttribute(targetWord, 'href'), '/posts?tag=John%2527s+Bday', 'If encodeURI is turned on');
                });
            }
        };
        const cloud6 = generateVisualRepresentation(encodedConcepts, cloud6Config);
    }

    {
        let cloud1Config = {
            targetZoneId: "displayZone1",
            afterCloudRender: function () {
                verifyCase('Basic plugin functionality', function () {
                    const cloudText = cloud1.text;
                    confirm(cloudText.includes('Zero'), "'Zero' is in the cloud");
                    confirm(cloudText.includes('Minus three'), "'Minus three' is in the cloud");
                    confirm(cloudText.includes('Minus zero point fiftyfive'), "'Minus zero point five' is in the cloud");
                    confirm(cloudText.includes('Two'), "'Two' is in the cloud, even if the weight was a string");

                    const firstWord = cloud1.findWordBySortedIndex(0);
                    match(firstWord.content, "Two", "'Two', having the biggest weight, becomes the first element in the array");
                    match(firstWord.content, "Two", "'Two', having the biggest weight, gets wrapped in an element of id container_word_0");
                    confirm(checkPresenceOfClass(firstWord, "w10"), "the element with the biggest weight gets wrapped in an element of class w10");

                    const lastWord = cloud1.findWordBySortedIndex(cloud1.words.length - 1);
                    match(lastWord.content, "Minus three", "'Minus three', having the smallest weight, becomes the last element in the array");
                    match(lastWord.content, "Minus three", "'Minus three', having the smallest weight, gets wrapped in an element of id container_word_" + (cloud1.words.length - 1));
                    confirm(checkPresenceOfClass(lastWord, "w1"), "the element with the smallest weight gets wrapped in an element of class w1");

                    const middleWord = cloud1.findWordBySortedIndex(2);
                    match(middleWord.content, "Minus zero point fiftyfive", "'Minus zero point fiftyfive' should get wrapped in an element of id container_word_2");
                    confirm(checkPresenceOfClass(middleWord, "w5") && middleWord.content === "Minus zero point fiftyfive", "'Minus zero point fiftyfive', having a weight in the middle of the range, should get wrapped in an element of class w5");
                });

                verifyCase('links into word cloud', function () {
                    const minusThreeWord = cloud1.findWordByContent('Minus three');
                    confirm(minusThreeWord && minusThreeWord.linkDetails && minusThreeWord.linkDetails.href === '#', "If 'link' option is specified and is a string, an html anchor pointing to that URL is created.");
                    const twoWord = cloud1.findWordByContent('Two');
                    confirm(twoWord && twoWord.linkDetails && twoWord.linkDetails.href === '#', "If 'link' option is specified and is an object, an html anchor pointing to link.href is created.");
                    match(retrieveElementAttribute(twoWord, "test"), "testing", "If 'link' option is specified and is an object, custom attributes should be set.");
                });

                verifyCase('Event handlers for words', function () {
                    const twoWord = cloud1.findWordByContent('Two');
                    activateConceptualEvent(twoWord, "click");
                    match(retrieveConceptualData(twoWord, "testHandler"), "Handler works!", "Event handlers should be triggered.");
                });

                verifyCase('afterWordRender callback', function () {
                    const twoWord = cloud1.findWordByContent('Two');
                    match(retrieveConceptualData(twoWord, "testCallback"), "Callback works!", "afterWordRender callback should be called, and 'this' should be the word element.");
                });

                verifyCase('Custom classes', function () {
                    const twoWord = cloud1.findWordByContent('Two');
                    confirm(checkPresenceOfClass(twoWord, "mycustomclass"), "Custom classes should be set via html.class attribute");
                });

                verifyCase('Custom attributes', function () {
                    const zeroWord = cloud1.findWordByContent('Zero');
                    match(retrieveElementAttribute(zeroWord, "test"), "just testing", "Custom attributes should be set via the html option");
                });
            }
        };
        const cloud1 = generateVisualRepresentation(conceptUnits, cloud1Config);

        setZoneVisibility("displayZone2", true);
        let cloud2Config = {
            width: 400, height: 200, delayedMode: true, targetZoneId: "displayZone2",
            afterCloudRender: function () {
                verifyCase('Multiple word clouds rendering, also with delayed_mode: true', function () {
                    const cloudText = cloud2.text;
                    confirm(cloudText.includes('Abc'), "'Abc' is in the second cloud");
                    confirm(cloudText.includes('Def'), "'Def' is in the second cloud");
                    confirm(cloudText.includes('Ghi'), "'Ghi' is in the second cloud");
                    confirm(!cloudText.includes('Zero'), "'Zero' is not in the second cloud");
                });
            }
        };
        const cloud2 = generateVisualRepresentation(auxiliaryUnits, cloud2Config);

        let cloud3Config = {
            targetZoneId: "displayZone3",
            afterCloudRender: function () {
                verifyCase('Words with equal weight', function () {
                    const w5Words = cloud3.words.filter(w => checkPresenceOfClass(w, 'w5'));
                    match(w5Words.length, 3, "There should be three words with equal weight.");
                });
            }
        };
        const cloud3 = generateVisualRepresentation(uniformUnits, cloud3Config);

        setZoneVisibility("displayZone4", true);
        let cloud4Config = {
            delayedMode: true,
            targetZoneId: "displayZone4",
            afterCloudRender: function () {
                verifyCase('Words render when delayedMode true and container is visible', function () {
                    confirm(queryZoneVisibility("displayZone4"), "Container is visible");
                    confirm(cloud4.words.length > 0, "Words render");
                });
            }
        };
        const cloud4 = generateVisualRepresentation(conceptUnits, cloud4Config);

        setTimeout(function () {
            setZoneVisibility("displayZone4", false);
            const cloud4_hidden_state = generateVisualRepresentation(conceptUnits, { ...cloud4Config, afterCloudRender: null });

            verifyCase('Words do not render when delayedMode true and container is not visible', function () {
                confirm(!queryZoneVisibility("displayZone4"), "Container is not visible");
                match(cloud4_hidden_state.words.length, 0, "There should be no spans in the container");
            });

            setZoneVisibility("displayZone4", true);
        }, 20);
    }
}

executeConceptualTestSuite();