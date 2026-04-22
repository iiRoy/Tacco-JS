const DataProcessor = {
    encode: function(input) {
        if (typeof RJSON !== 'undefined' && typeof RJSON.pack === 'function') {
            return RJSON.pack(input);
        }
        throw new Error("RJSON.pack function not found in the environment. Cannot perform encoding tests.");
    },
    decode: function(input) {
        if (typeof RJSON !== 'undefined' && typeof RJSON.unpack === 'function') {
            return RJSON.unpack(input);
        }
        throw new Error("RJSON.unpack function not found in the environment. Cannot perform decoding tests.");
    }
};

const EvaluationSystem = (function() {
    let totalChecks = 0;
    let successfulChecks = 0;

    function reportOutcome(assertionName, successIndicator, detailMessage) {
        totalChecks++;
        if (successIndicator) {
            // console.log(`✓ ${assertionName}: ${detailMessage}`);
            successfulChecks++;
        } else {
            console.error(`✗ ${assertionName}: ${detailMessage}`);
        }
    }

    function compareObjectContent(valA, valB) {
        if (valA === valB) return true;
        if (valA == null || valB == null || typeof valA != "object" || typeof valB != "object") return false;

        const keysA = Object.keys(valA);
        const keysB = Object.keys(valB);

        if (keysA.length != keysB.length) return false;

        for (let i = 0; i < keysA.length; i++) {
            const key = keysA[i];
            if (!keysB.includes(key) || !compareObjectContent(valA[key], valB[key])) {
                return false;
            }
        }
        return true;
    }

    const verification = {
        strictMatch: function(firstValue, secondValue, descriptor) {
            reportOutcome(descriptor, firstValue === secondValue, `Expected "${secondValue}", got "${firstValue}"`);
        },
        contentMatch: function(firstEntity, secondEntity, descriptor) {
            reportOutcome(descriptor, compareObjectContent(firstEntity, secondEntity), `Entities differ for "${descriptor}"`);
        },
        initiateTestSequence: function(sequenceTitle, sequenceFunction) {
            console.log(`\n--- Starting Sequence: ${sequenceTitle} ---`);
            sequenceFunction();
            console.log(`--- Finished Sequence: ${sequenceTitle} ---`);
        },
        getSummary: function() {
            return `\nTotal assertions: ${totalChecks}, Passed: ${successfulChecks}, Failed: ${totalChecks - successfulChecks}`;
        }
    };
    return verification;
})();

const encodingFacilitator = {
    assessSerialization: function(inputData, anticipatedOutputString, contextualNote) {
        const actualSerialized = JSON.stringify(DataProcessor.encode(inputData));
        EvaluationSystem.strictMatch(actualSerialized, anticipatedOutputString, contextualNote);
    }
};

const roundtripValidator = {
    verifySinglePass: function(originalPayload) {
        const primaryEncoded = DataProcessor.encode(originalPayload);
        const serializedEncoded = JSON.stringify(primaryEncoded);
        const parsedEncoded = JSON.parse(serializedEncoded);
        const rehydratedPayload = DataProcessor.decode(parsedEncoded);
        EvaluationSystem.contentMatch(originalPayload, rehydratedPayload, 'Original and single-pass rehydrated data identical');
    },

    verifyDualPass: function(originalPayload) {
        const firstEncoded = DataProcessor.encode(originalPayload);
        const secondEncoded = DataProcessor.encode(firstEncoded);
        const serializedSecond = JSON.stringify(secondEncoded);
        const parsedSecond = JSON.parse(serializedSecond);
        const firstDecoded = DataProcessor.decode(parsedSecond);
        const finalRehydrated = DataProcessor.decode(firstDecoded);
        EvaluationSystem.contentMatch(originalPayload, finalRehydrated, 'Original and dual-pass rehydrated data identical');
    }
};

const fundamentalValueCases = [
    { source: 'Hello!', target: '"Hello!"', note: 'String primitive' },
    { source: true, target: 'true', note: 'Boolean true' },
    { source: false, target: 'false', note: 'Boolean false' },
    { source: 0, target: '0', note: 'Number zero' },
    { source: 1, target: '1', note: 'Number one' },
    { source: 3.14, target: '3.14', note: 'Float number' },
    { source: 2e4, target: '20000', note: 'Scientific notation number' },
    { source: null, target: 'null', note: 'Null value' },
    { source: undefined, target: undefined, note: 'Undefined value' }
];

const associativeMapCases = [
    { source: {}, target: '{}', note: 'Empty object' },
    { source: { a: 1 }, target: '{"a":1}', note: 'Object with single key' },
    { source: { a: 1, b: 2 }, target: '{"a":1,"b":2}', note: 'Object with two keys' },
    { source: { a: 1, b: ['tag1', 'tag2'] }, target: '{"a":1,"b":["tag1","tag2"]}', note: 'Object with nested array' },
    { source: [{ a: 1 }, { b: null }], target: '[{"a":1},{"b":null}]', note: 'Array of objects' },
    { source: [{ a: 1 }, { a: 7 }], target: '[{"a":1},[1,7]]', note: 'Array of objects with schema reuse 1' },
    { source: [{ a: 1 }, { a: 7 }, { a: 8 }], target: '[{"a":1},[1,7,8]]', note: 'Array of objects with schema reuse 2' },
    { source: [{ a: 1 }, { a: 7 }, { a: 8 }, { a: 9 }], target: '[{"a":1},[1,7,8,9]]', note: 'Array of objects with schema reuse 3' },
    { source: [{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10, b: 11 }], target: '[{"a":1,"b":2},[1,8,9,10,11]]', note: 'Array of objects with schema reuse 4' },
    { source: { id: 1, items: [{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10 }] }, target: '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10}]}', note: 'Complex object with nested array of objects 1' },
    { source: { id: 1, items: [{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10 }, { a: 11 }, { a: 12 }] }, target: '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10},[3,11,12]]}', note: 'Complex object with nested array of objects 2' },
    { source: { 'test': [{ 'b': '1', 'a': '1' }, { 'b': '2', 'a': '2' }] }, target: '{"test":[{"a":"1","b":"1"},[2,"2","2"]]}', note: 'Object with array of objects, key order test' }
];

const sequentialListCases = [
    { source: [], target: '[]', note: 'Empty array' },
    { source: ['A'], target: '["A"]', note: 'Array with single string' },
    { source: [['A']], target: '[["A"]]', note: 'Nested array with single string' },
    { source: ['A', 'B', 'C'], target: '["A","B","C"]', note: 'Array of strings' },
    { source: [1, 2, 3], target: '[0,1,2,3]', note: 'Array of numbers 1' },
    { source: [0, 1], target: '[0,0,1]', note: 'Array of numbers 2' },
    { source: [0], target: '[0,0]', note: 'Array of numbers 3' },
    { source: [1], target: '[0,1]', note: 'Array of numbers 4' },
    { source: [1.618, 3.14], target: '[0,1.618,3.14]', note: 'Array of floats' },
    { source: [[1.618, 3.14]], target: '[[0,1.618,3.14]]', note: 'Nested array of floats' },
    { source: [['X', 'Y'], ['A', 'B']], target: '[["X","Y"],["A","B"]]', note: 'Array of string arrays' },
    { source: [[1, 2], [3, 4]], target: '[[0,1,2],[0,3,4]]', note: 'Array of number arrays' }
];

const intricateValueCases = [
    { source: new Date(), target: '{}', note: 'New Date object' },
    { source: new Function(), target: undefined, note: 'New Function object' },
    { source: function() {}, target: undefined, note: 'Anonymous function' },
    { source: new String(), target: '{}', note: 'New String object' },
    { source: new Number(), target: '{}', note: 'New Number object' },
    { source: new Boolean(), target: '{}', note: 'New Boolean object' }
];

const sampleUnitA = [
    { key1: 1, key2: 2 },
    { key1: 3, key2: 4 },
    { key1: 5, key2: 6, key3: 7 },
    { key1: 8, key2: 9, key3: 10 },
    { key1: 1, key2: 12 },
    { key1: 13, key2: 14, key3: 15 }
];

const sampleUnitB = {
    'id': 1,
    'items': [
        { 'key1': 7e5, 'key2': 'two' },
        { 'key1': true, 'key2': false, 'key3': [0, 1, 2] },
        { 'key1': null, 'key2': '', 'key3': [true, false] },
        { 'key1': 3, 'key2': [['X', 'Y'], ['X', 'Z']], 'key3': ['A', 'B', 'C'] },
        { 'key1': '', 'key2': [['X', 'Y']], 'key3': [[0, 1]] },
        { 'key1': '', 'key2': [[['X', 'Y']], ['Z']], 'key3': [[[0, 1]]]},
        { 'parent': { 'key1': '1', 'key2': 2 } },
        { 'parent': { 'key1': '4', 'key2': 5 } },
        { id: 8, creator: { id: 1, name: 'Name1' }, tags: [{ id: 2, name: 'Tag2' }] },
        { id: 9, creator: { id: 2, name: 'Name2' }, tags: [{ id: 2, name: 'Tag2' }, { id: 3, name: 'Tag3' }] },
        { id: 10, creator: null, tags: [[{ id: 4, name: 'Tag4' }, { id: 5, name: 'Tag5' }]] },
        { id: 10, creator: { id: 3 }, tags: [] },
        { id: 11, creator: {}, tags: [] },
        { id: 12, creator: {}, tags: [] }
    ],
    'box': [[-14.833, -199.035, -30.143], [14.833, 199.035, 0.184]]
};

const sampleUnitC = {
    id: 2,
    data: [{ a: 6, b: 7 }, { b: 8, a: 9 }]
};

const sampleUnitD = { test: [{ b: '1', a: '1' }, { b: '2', a: '2' }] };

const collectionOfSamples = [sampleUnitA, sampleUnitB, sampleUnitC, sampleUnitD];

EvaluationSystem.initiateTestSequence('Fundamental Values Serialization', () => {
    fundamentalValueCases.forEach(scenario => {
        encodingFacilitator.assessSerialization(scenario.source, scenario.target, scenario.note);
    });
});

EvaluationSystem.initiateTestSequence('Associative Maps Serialization', () => {
    associativeMapCases.forEach(scenario => {
        encodingFacilitator.assessSerialization(scenario.source, scenario.target, scenario.note);
    });
});

EvaluationSystem.initiateTestSequence('Sequential Lists Serialization', () => {
    sequentialListCases.forEach(scenario => {
        encodingFacilitator.assessSerialization(scenario.source, scenario.target, scenario.note);
    });
});

EvaluationSystem.initiateTestSequence('Intricate Values Serialization', () => {
    intricateValueCases.forEach(scenario => {
        encodingFacilitator.assessSerialization(scenario.source, scenario.target, scenario.note);
    });
});

let sampleIndex = 0;
collectionOfSamples.forEach(currentSample => {
    sampleIndex++;
    EvaluationSystem.initiateTestSequence(`Sample Document ${sampleIndex} Roundtrip Verification`, () => {
        roundtripValidator.verifySinglePass(currentSample);
        roundtripValidator.verifyDualPass(currentSample);
    });
});

console.log(EvaluationSystem.getSummary());