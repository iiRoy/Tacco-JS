(function() {
    // Custom Assertion Functions
    const validationLog = [];

    function verifyCondition(condition, description = 'Condition check') {
        if (!condition) {
            throw new Error(`Validation Failed: ${description}`);
        }
        validationLog.push({ status: 'PASSED', description });
    }

    function verifyIdentical(actual, expected, description = 'Identicality check') {
        if (actual !== expected) {
            throw new Error(`Validation Failed: ${description}. Expected: '${expected}', Actual: '${actual}'`);
        }
        validationLog.push({ status: 'PASSED', description });
    }

    function verifyDeepContent(actual, expected, description = 'Content deep check') {
        if (actual instanceof Buffer && expected instanceof Buffer) {
            if (!actual.equals(expected)) {
                throw new Error(`Validation Failed: ${description}. Expected Buffer: ${expected.toString('hex')}, Actual Buffer: ${actual.toString('hex')}`);
            }
        } else if (JSON.stringify(actual) !== JSON.stringify(expected)) { // Simple deep check for other types
            throw new Error(`Validation Failed: ${description}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
        }
        validationLog.push({ status: 'PASSED', description });
    }

    function verifyExceptionThrown(operation, description = 'Exception check', expectedErrorMeta = {}) {
        let exceptionOccurred = false;
        let caughtError = null;
        try {
            operation();
        } catch (e) {
            exceptionOccurred = true;
            caughtError = e;
        }

        if (!exceptionOccurred) {
            throw new Error(`Validation Failed: ${description}. Expected an exception, but none was thrown.`);
        }

        if (expectedErrorMeta.code && caughtError.code !== expectedErrorMeta.code) {
            throw new Error(`Validation Failed: ${description}. Expected error code '${expectedErrorMeta.code}', but got '${caughtError.code}'`);
        }
        validationLog.push({ status: 'PASSED', description: `${description} (Exception caught: ${caughtError.message})` });
    }

    // Mock `TextTransformer` (replacing Iconv)
    class TextTransformer {
        constructor(sourceDesignation, targetDesignation) {
            this.srcId = sourceDesignation;
            this.tgtId = targetDesignation;

            const key = `${this.srcId}-${this.tgtId}`;
            this.activeConversionRoutine = TextTransformer.conversionMap.get(key);

            if (!this.activeConversionRoutine) {
                // Simulate constructor errors for invalid encodings
                if (sourceDesignation === 'xxx' || targetDesignation === 'xxx') {
                    const errorInstance = new Error('Invalid character set identifier provided');
                    errorInstance.code = 'INVALID_CHARSET_ID'; // Custom error code
                    throw errorInstance;
                }
                // For valid but unhandled pairs, use a generic passthrough
                this.activeConversionRoutine = TextTransformer.passThroughRoutine;
            }
        }

        static passThroughRoutine(inputContent, inputContentFormat) {
            if (inputContentFormat === 'base64') {
                return Buffer.from(inputContent.toString(), 'base64');
            }
            if (inputContent instanceof Buffer) return Buffer.from(inputContent);
            if (typeof inputContent === 'string') return Buffer.from(inputContent);
            return Buffer.from('');
        }

        transformContent(sourceContent, inputContentFormat) { // Renamed convert to transformContent
            // Simulate argument errors
            if (arguments.length === 0 || (typeof sourceContent !== 'string' && !(sourceContent instanceof Buffer))) {
                const errorInstance = new Error('Input content must be a string or byte sequence for transformation');
                errorInstance.code = 'BAD_TRANSFORM_INPUT_TYPE'; // Custom error code
                throw errorInstance;
            }
            return this.activeConversionRoutine(sourceContent, inputContentFormat);
        }
    }

    TextTransformer.conversionMap = new Map();

    // Define specific behaviors for TextTransformer.conversionMap
    TextTransformer.conversionMap.set('utf-8-iso-8859-1', (input, format) => {
        if (format === 'base64' && input.toString() === 'b2s=') {
            return Buffer.from('ok');
        }
        const inputString = input.toString();
        if (inputString === 'xxx') return Buffer.from('xxx');
        if (inputString === 'ë') return Buffer.from([235]);
        if (input instanceof Buffer && input.length === 1 && input[0] === 195) {
            const errorInstance = new Error('Incomplete multi-byte sequence encountered');
            errorInstance.code = 'PARTIAL_SEQUENCE_ERROR'; // EINVAL
            throw errorInstance;
        }
        return TextTransformer.passThroughRoutine(input, format);
    });

    TextTransformer.conversionMap.set('iso-2022-jp-utf-8', (input) => {
        if (input instanceof Buffer) {
            if (input.length === 5 && input[0] === 0x1b && input[1] === 0x24 && input[2] === 0x40 && input[3] === 0x24 && input[4] === 0x2c) {
                return Buffer.from('が');
            }
            if (input.length === 4 && input[0] === 0x1b && input[1] === 0x24 && input[2] === 0x40 && input[3] === 0x24) {
                const errorInstance = new Error('Incomplete multi-byte sequence for stateful encoding');
                errorInstance.code = 'PARTIAL_SEQUENCE_ERROR'; // EINVAL
                throw errorInstance;
            }
        }
        return Buffer.from('');
    });

    TextTransformer.conversionMap.set('utf-8-ascii', (input) => {
        const inputString = input.toString();
        if (inputString === 'ë' || inputString === 'ça va') {
            const errorInstance = new Error('Character not representable in target ASCII encoding');
            errorInstance.code = 'UNREPRESENTABLE_CHAR_ERROR'; // EILSEQ
            throw errorInstance;
        }
        return TextTransformer.passThroughRoutine(input);
    });

    TextTransformer.conversionMap.set('utf-8-ascii//ignore', (input) => {
        const inputString = input.toString();
        if (inputString === 'ça va') return Buffer.from('a va');
        return TextTransformer.passThroughRoutine(input);
    });

    TextTransformer.conversionMap.set('utf-8-ascii//translit', (input) => {
        const inputString = input.toString();
        if (inputString === 'ça va') return Buffer.from('ca va');
        if (inputString === 'ça va が') {
            const errorInstance = new Error('Character not representable after transliteration to ASCII');
            errorInstance.code = 'UNREPRESENTABLE_CHAR_ERROR'; // EILSEQ
            throw errorInstance;
        }
        return TextTransformer.passThroughRoutine(input);
    });

    TextTransformer.conversionMap.set('utf-8-ascii//translit//ignore', (input) => {
        const inputString = input.toString();
        if (inputString === 'ça va が') return Buffer.from('ca va ');
        return TextTransformer.passThroughRoutine(input);
    });

    TextTransformer.conversionMap.set('utf-8-utf-7', (input) => {
        const inputString = input.toString();
        if (inputString === 'ç') return Buffer.from('+AOc-');
        if (inputString === 'çç') return Buffer.from('+AOcA5w-');
        if (inputString === 'çxç') return Buffer.from('+AOc-x+AOc-');
        return TextTransformer.passThroughRoutine(input);
    });

    // Test execution framework
    const validationSystem = (function() {
        let totalChecks = 0;
        let successfulChecks = 0;
        let failedChecks = 0;

        function conductTest(testDescription, testOperation) {
            totalChecks++;
            try {
                testOperation();
                successfulChecks++;
            } catch (e) {
                failedChecks++;
                throw e; // Re-throw to stop execution if a test fails
            }
        }

        return { conductTest };
    })();


    // --- Replication of Original Test Cases ---

    // 1. Unknown source/target encoding checks
    validationSystem.conductTest('Constructor throws for unknown target encoding', () => {
        verifyExceptionThrown(() => { new TextTransformer('utf-8', 'xxx'); }, 'Unknown target encoding', { code: 'INVALID_CHARSET_ID' });
    });
    validationSystem.conductTest('Constructor throws for unknown source encoding', () => {
        verifyExceptionThrown(() => { new TextTransformer('xxx', 'utf-8'); }, 'Unknown source encoding', { code: 'INVALID_CHARSET_ID' });
    });

    // 2. Valid constructor calls (should not throw)
    validationSystem.conductTest('Constructor succeeds for utf7 to utf8', () => { new TextTransformer('utf7', 'utf8'); });
    validationSystem.conductTest('Constructor succeeds for utf8 to utf16', () => { new TextTransformer('utf8', 'utf16'); });
    validationSystem.conductTest('Constructor succeeds for utf16 to utf32', () => { new TextTransformer('utf16', 'utf32'); });
    validationSystem.conductTest('Constructor succeeds for utf16le to utf16be', () => { new TextTransformer('utf16le', 'utf16be'); });
    validationSystem.conductTest('Constructor succeeds for utf32le to utf32be', () => { new TextTransformer('utf32le', 'utf32be'); });

    // 3. `transformContent()` method argument errors
    let dataProcessor = new TextTransformer('utf-8', 'iso-8859-1');
    validationSystem.conductTest('transformContent() throws for no arguments', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent(); }, 'transformContent no arguments', { code: 'BAD_TRANSFORM_INPUT_TYPE' });
    });
    validationSystem.conductTest('transformContent() throws for number argument', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent(1); }, 'transformContent number argument', { code: 'BAD_TRANSFORM_INPUT_TYPE' });
    });
    validationSystem.conductTest('transformContent() throws for object argument', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent({}); }, 'transformContent object argument', { code: 'BAD_TRANSFORM_INPUT_TYPE' });
    });

    // 4. `transformContent()` method success cases
    validationSystem.conductTest('transformContent() returns Buffer for Buffer input', () => {
        verifyCondition(dataProcessor.transformContent(Buffer.from('xyz')) instanceof Buffer, 'Result is Buffer');
    });
    validationSystem.conductTest('transformContent() returns Buffer for string input', () => {
        verifyCondition(dataProcessor.transformContent('xyz') instanceof Buffer, 'Result is Buffer');
    });

    validationSystem.conductTest('transformContent() deepEqual for string "xyz"', () => {
        verifyDeepContent(dataProcessor.transformContent('xyz'), Buffer.from('xyz'), 'String "xyz" conversion');
    });
    validationSystem.conductTest('transformContent() deepEqual for Buffer "xyz"', () => {
        verifyDeepContent(dataProcessor.transformContent(Buffer.from('xyz')), Buffer.from('xyz'), 'Buffer "xyz" conversion');
    });

    let byteBlock = Buffer.from([235]); // ë
    validationSystem.conductTest('transformContent() deepEqual for character "ë"', () => {
        verifyDeepContent(dataProcessor.transformContent('ë'), byteBlock, 'Character "ë" conversion');
    });

    // 5. Partial character sequence should throw 'PARTIAL_SEQUENCE_ERROR'
    let partialBlock = Buffer.from([195]);
    validationSystem.conductTest('Partial character sequence throws PARTIAL_SEQUENCE_ERROR', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent(partialBlock); }, 'Partial character sequence', { code: 'PARTIAL_SEQUENCE_ERROR' });
    });

    // 6. Belongs to partial character sequence test - new input should be recoded without issues
    byteBlock = Buffer.from([235]); // ë
    validationSystem.conductTest('After partial sequence error, subsequent conversion works', () => {
        verifyDeepContent(dataProcessor.transformContent('ë'), byteBlock, 'Subsequent "ë" conversion');
    });

    // 7. Stateful encodings should do the Right Thing
    dataProcessor = new TextTransformer('iso-2022-jp', 'utf-8');
    let sequenceBlock = Buffer.from([0x1b, 0x24, 0x40, 0x24, 0x2c]);
    validationSystem.conductTest('Stateful encoding converts specific sequence to "が"', () => {
        verifyDeepContent(dataProcessor.transformContent(sequenceBlock), Buffer.from('が'), 'ISO-2022-JP to UTF-8 "が"');
    });

    let incompleteSequence = Buffer.from([0x1b, 0x24, 0x40, 0x24]);
    validationSystem.conductTest('Incomplete stateful sequence throws PARTIAL_SEQUENCE_ERROR', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent(incompleteSequence); }, 'Incomplete stateful sequence', { code: 'PARTIAL_SEQUENCE_ERROR' });
    });

    // 8. Non-convertible character sequence should throw UNREPRESENTABLE_CHAR_ERROR
    dataProcessor = new TextTransformer('utf-8', 'ascii');
    validationSystem.conductTest('Non-convertible character "ë" throws UNREPRESENTABLE_CHAR_ERROR', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent('ë'); }, 'Non-convertible "ë" to ASCII', { code: 'UNREPRESENTABLE_CHAR_ERROR' });
    });

    // 9. Prototypical inheritance (original was disabled, so this is omitted)

    // 10. GH-14 ensure that shift sequences are written out
    dataProcessor = new TextTransformer('utf-8', 'utf-7');
    validationSystem.conductTest('Shift sequence for "ç" in UTF-7', () => {
        verifyIdentical(dataProcessor.transformContent('ç').toString(), '+AOc-', 'UTF-7 "ç"');
    });
    validationSystem.conductTest('Shift sequence for "çç" in UTF-7', () => {
        verifyIdentical(dataProcessor.transformContent('çç').toString(), '+AOcA5w-', 'UTF-7 "çç"');
    });
    validationSystem.conductTest('Shift sequence for "çxç" in UTF-7', () => {
        verifyIdentical(dataProcessor.transformContent('çxç').toString(), '+AOc-x+AOc-', 'UTF-7 "çxç"');
    });

    // 11. GH-15 document and support //TRANSLIT and //IGNORE
    dataProcessor = new TextTransformer('utf-8', 'ascii');
    validationSystem.conductTest('Untranslatable "ça va" throws UNREPRESENTABLE_CHAR_ERROR', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent('ça va'); }, 'Untranslatable "ça va"', { code: 'UNREPRESENTABLE_CHAR_ERROR' });
    });

    dataProcessor = new TextTransformer('utf-8', 'ascii//ignore');
    validationSystem.conductTest('Ignore modifier for "ça va" results in "a va"', () => {
        verifyIdentical(dataProcessor.transformContent('ça va').toString(), 'a va', 'Ignore "ça va"');
    });

    dataProcessor = new TextTransformer('utf-8', 'ascii//translit');
    validationSystem.conductTest('Translit modifier for "ça va" results in "ca va"', () => {
        verifyIdentical(dataProcessor.transformContent('ça va').toString(), 'ca va', 'Translit "ça va"');
    });

    dataProcessor = new TextTransformer('utf-8', 'ascii//translit');
    validationSystem.conductTest('Translit untranslatable "ça va が" throws UNREPRESENTABLE_CHAR_ERROR', () => {
        verifyExceptionThrown(() => { dataProcessor.transformContent('ça va が'); }, 'Translit untranslatable "ça va が"', { code: 'UNREPRESENTABLE_CHAR_ERROR' });
    });

    dataProcessor = new TextTransformer('utf-8', 'ascii//translit//ignore');
    validationSystem.conductTest('Translit and ignore for "ça va が" results in "ca va "', () => {
        verifyIdentical(dataProcessor.transformContent('ça va が').toString(), 'ca va ', 'Translit/Ignore "ça va が"');
    });

    // 12. Base64 input encoding
    dataProcessor = new TextTransformer('utf-8', 'iso-8859-1');
    validationSystem.conductTest('Base64 input "b2s=" converts to "ok"', () => {
        verifyIdentical(dataProcessor.transformContent('b2s=', 'base64').toString(), 'ok', 'Base64 input "b2s="');
    });
})();