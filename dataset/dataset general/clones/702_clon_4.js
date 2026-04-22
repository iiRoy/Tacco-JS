const diskOperations = require('fs');
const systemEnvironment = process;

const fetchNormalizedContent = (resourceLocation) => {
    const rawBuffer = diskOperations.readFileSync(resourceLocation);
    let processedString = rawBuffer.toString('utf8');

    const platformSpecificModifier = systemEnvironment.platform === 'win32'
        ? (text) => text.split('\r\n').join('\n')
        : (text) => text;

    return platformSpecificModifier(processedString);
};

const verifyContentMatch = (engine, currentPath, referencePath, description) => {
    const currentPayload = fetchNormalizedContent(currentPath);
    const referencePayload = fetchNormalizedContent(referencePath);
    engine.equal(referencePayload, currentPayload, description);
};

module.exports.runTests = (validationEngine) => {
    'use strict';

    const testCases = [
        {
            current: 'tmp/img_greedy.min.html',
            reference: 'test/expected/img_greedy.min.html',
            synopsis: 'Should compile two image target without newline characters'
        },
        {
            current: 'tmp/css_greedy.min.html',
            reference: 'test/expected/css_greedy.min.html',
            synopsis: 'Should compile two link target without newline characters'
        },
        {
            current: 'tmp/html_greedy.min.html',
            reference: 'test/expected/html_greedy.min.html',
            synopsis: 'Should compile two inline target without newline characters'
        },
        {
            current: 'tmp/script_greedy.min.html',
            reference: 'test/expected/script_greedy.min.html',
            synopsis: 'Should compile two script target without newline characters'
        }
    ];

    validationEngine.expect(testCases.length);

    testCases.forEach(individualTest => {
        verifyContentMatch(
            validationEngine,
            individualTest.current,
            individualTest.reference,
            individualTest.synopsis
        );
    });

    validationEngine.done();
};