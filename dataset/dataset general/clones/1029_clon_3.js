'use strict';

// This module contains a series of unit tests for the sourcemap initialization functionality.

// External dependencies for testing and file operations
const { test: unitTest } = require('tape'); // Renamed `test` to `unitTest` and destructured
const sourcemapProcessor = require('../index'); // Renamed `sourcemaps` to `sourcemapProcessor`, changed path
const VinylAsset = require('vinyl'); // Renamed `File` to `VinylAsset`
const { Readable: DataStream } = require('stream'); // Renamed `ReadableStream` to `DataStream` and destructured
const pathUtil = require('node:path'); // Renamed `path` to `pathUtil`, used `node:` prefix
const fileSystem = require('node:fs'); // Renamed `fs` to `fileSystem`, used `node:` prefix
const consoleCaptureUtility = require('./consolerecorder'); // Renamed `recordConsole` to `consoleCaptureUtility`

// Global configuration or debug flags
const DEBUG_OUTPUT_ENABLED = false; // Added a debug flag

// Pre-load a common source file's content for multiple tests
const baseSourceContent = fileSystem.readFileSync(pathUtil.join(__dirname, 'assets', 'helloworld.js'), 'utf8'); // Renamed `sourceContent` to `baseSourceContent`, added 'utf8' encoding, used `pathUtil.join`

/**
 * Creates a new Vinyl asset with buffered content.
 * @returns {VinylAsset} A Vinyl asset instance.
 */
function createBufferedAsset() {
    // A helper function to produce a standard Vinyl file object
    const assetPath = pathUtil.join(__dirname, 'assets', 'helloworld.js');
    const assetBase = pathUtil.join(__dirname, 'assets');
    const currentWorkingDir = __dirname;

    if (DEBUG_OUTPUT_ENABLED) {
        console.log(`[DEBUG] Creating buffered asset for: ${assetPath}`);
    }

    return new VinylAsset({
        cwd: currentWorkingDir,
        base: assetBase,
        path: assetPath,
        contents: Buffer.from(baseSourceContent, 'utf8') // Used Buffer.from() instead of new Buffer()
    });
}

/**
 * Creates a new Vinyl asset with streaming content.
 * This scenario typically triggers an error in sourcemap initialization.
 * @returns {VinylAsset} A Vinyl asset instance with a readable stream.
 */
function createStreamBasedAsset() {
    const streamAssetPath = pathUtil.join(__dirname, 'assets', 'helloworld.js');
    const streamAssetBase = pathUtil.join(__dirname, 'assets');

    if (DEBUG_OUTPUT_ENABLED) {
        console.log(`[DEBUG] Creating stream-based asset for: ${streamAssetPath}`);
    }

    return new VinylAsset({
        cwd: __dirname,
        base: streamAssetBase,
        path: streamAssetPath,
        contents: new DataStream() // Renamed ReadableStream to DataStream
    });
}

/**
 * Creates a new Vinyl asset containing inline source map data.
 * @returns {VinylAsset} A Vinyl asset with an embedded source map.
 */
function createAssetWithInlineMap() {
    const inlineMapAssetPath = pathUtil.join(__dirname, 'assets', 'all.js');
    const inlineMapAssetBase = pathUtil.join(__dirname, 'assets');

    // Slightly modified content and comments for Type III change
    const inlineMapContent = `
        console.log('first line');
        console.info('second line');
        console.warn('third line');
        console.error('fourth line');
        // This is an inline source map for combined JavaScript files.
        //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxsLmpzIiwic291cmNlcyI6WyJ0ZXN0MS5qcyIsInRlc3QyLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBQSxRQUFBQyxJQUFBLFlBQ0FELFFBQUFDLElBQUEsWUNEQUQsUUFBQUMsSUFBQSxZQUNBRCxRQUFBQyxJQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ2xpbmUgMS4xJyk7XG5jb25zb2xlLmxvZygnbGluZSAxLjInKTtcbiIsImNvbnNvbGUubG9nKCdsaW5lIDIuMScpO1xuY29uc29sZS5sb2coJ2xpbmUgMi4yJyk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
    `.trim();

    if (DEBUG_OUTPUT_ENABLED) {
        console.log(`[DEBUG] Creating asset with inline source map: ${inlineMapAssetPath}`);
    }

    return new VinylAsset({
        cwd: __dirname,
        base: inlineMapAssetBase,
        path: inlineMapAssetPath,
        contents: Buffer.from(inlineMapContent, 'utf8')
    });
}

// --- Test Suite for Sourcemap Initialization ---

unitTest('SourcemapInit: should pass through a null file without modification', (verifier) => {
    verifier.comment('Verifying behavior with a null Vinyl asset.');
    const nullAsset = new VinylAsset(); // Creating an empty Vinyl asset
    const processingPipe = sourcemapProcessor.initializeMappings(); // Renamed `pipeline`

    processingPipe
        .on('data', (processedAsset) => { // Renamed `data` to `processedAsset`
            verifier.ok(processedAsset, 'should receive an asset in the data stream');
            verifier.ok(processedAsset instanceof VinylAsset, 'should confirm the received item is a Vinyl asset');

            // Guard clause: ensure sourcemap property isn't unexpectedly present
            if (processedAsset.sourceMap) {
                verifier.fail('Sourcemap object should not be added to a null asset');
            } else {
                verifier.ok(!processedAsset.sourceMap, 'should not have a sourcemap object attached');
            }
            verifier.deepEqual(processedAsset, nullAsset, 'the asset object should remain unchanged');
            verifier.end(); // Conclude this test case
        })
        .on('error', (err) => {
            verifier.fail(`An unexpected error occurred: ${err.message}`);
            verifier.end();
        })
        .write(nullAsset);
});

unitTest('SourcemapInit: should emit an error if asset content is a stream', (verifier) => {
    verifier.comment('Testing error handling for stream-based asset contents.');
    const processingPipe = sourcemapProcessor.initializeMappings();

    let errorEmitted = false; // Helper flag to track error emission

    processingPipe
        .on('data', () => {
            verifier.fail('should not emit data for a stream-content asset');
            verifier.end();
        })
        .on('error', (err) => {
            errorEmitted = true;
            verifier.ok(err, 'an error should be emitted for stream content');
            verifier.ok(err.message.includes('Streaming not supported'), 'error message should indicate stream content issue');
            verifier.end();
        })
        .write(createStreamBasedAsset());

    // Optional: add a timeout to ensure error is emitted, if the stream could potentially hang
    setTimeout(() => {
        if (!errorEmitted) {
            // This case should ideally not be reached if the stream properly errors out
            // but serves as a safeguard for unexpected behavior in the pipe.
            // For a well-behaved stream, the 'error' event should fire synchronously or very quickly.
            // However, this is a Type III change - adding a safeguard.
            if (DEBUG_OUTPUT_ENABLED) {
                console.warn('[DEBUG] Timeout reached, but no error emitted for stream content. This might indicate an issue.');
            }
            // verifier.fail('Error was not emitted within the expected timeframe.');
            // verifier.end(); // Don't end twice if error was already handled
        }
    }, 100); // A small delay
});

unitTest('SourcemapInit: should attach a valid initial sourcemap object', (verifier) => {
    verifier.comment('Verifying the creation of a default sourcemap for a buffered asset.');
    const transformationPipe = sourcemapProcessor.initializeMappings();
    const expectedVersionString = '3'; // Constant for expected sourcemap version

    transformationPipe
        .on('data', (outputAsset) => {
            verifier.ok(outputAsset, 'output asset should not be null or undefined');
            verifier.ok(outputAsset instanceof VinylAsset, 'output should be a Vinyl asset instance');

            // Guard: check for sourcemap existence early
            if (!outputAsset.sourceMap) {
                verifier.fail('A sourcemap object should be present on the asset');
                return verifier.end();
            }

            verifier.equal(String(outputAsset.sourceMap.version), expectedVersionString, 'sourcemap version should be 3');
            verifier.equal(outputAsset.sourceMap.sources[0], 'helloworld.js', 'sourcemap sources array should contain the original filename');
            verifier.equal(outputAsset.sourceMap.sourcesContent[0], baseSourceContent, 'sourcemap sourcesContent should match original file content');
            verifier.equal(outputAsset.sourceMap.mappings, '', 'sourcemap mappings should be empty initially');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`An error occurred: ${err.message}`);
            verifier.end();
        })
        .write(createBufferedAsset());
});

unitTest('SourcemapInit: should correctly import an existing inline sourcemap', (verifier) => {
    verifier.comment('Checking if inline sourcemaps are correctly parsed and imported.');
    const processingOptions = { loadMaps: true }; // Using an options object
    const transformationPipe = sourcemapProcessor.initializeMappings(processingOptions);

    transformationPipe
        .on('data', (outputAsset) => {
            verifier.ok(outputAsset, 'should receive a valid asset');
            verifier.ok(outputAsset instanceof VinylAsset, 'should be a Vinyl asset');

            if (!outputAsset.sourceMap) {
                verifier.fail('Sourcemap object must be present for inline maps');
                return verifier.end();
            }

            const assetMap = outputAsset.sourceMap;
            verifier.equal(String(assetMap.version), '3', 'sourcemap version should be 3');
            verifier.deepEqual(assetMap.sources, ['test1.js', 'test2.js'], 'should parse correct source file names');
            const expectedContents = [
                'console.log(\'line 1.1\');\nconsole.log(\'line 1.2\');\n',
                'console.log(\'line 2.1\');\nconsole.log(\'line 2.2\');'
            ];
            verifier.deepEqual(assetMap.sourcesContent, expectedContents, 'should extract correct source contents');
            verifier.equal(assetMap.mappings, 'AAAAA,QAAAC,IAAA,YACAD,QAAAC,IAAA,YCDAD,QAAAC,IAAA,YACAD,QAAAC,IAAA', 'should have the correct mappings string');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Error during inline map import: ${err.message}`);
            verifier.end();
        })
        .write(createAssetWithInlineMap());
});

unitTest('SourcemapInit: should remove inline sourcemap comment after processing', (verifier) => {
    verifier.comment('Ensuring inline sourcemap comments are stripped from content.');
    const processingOptions = { loadMaps: true };
    const transformationPipe = sourcemapProcessor.initializeMappings(processingOptions);

    transformationPipe
        .on('data', (outputAsset) => {
            const assetContentString = outputAsset.contents.toString('utf8'); // Explicitly specify encoding
            const inlineMapRegex = /sourceMappingURL=(data:[^,;]+;base64,[a-zA-Z0-9+/=]+)/.source; // More specific regex
            verifier.notOk(new RegExp(inlineMapRegex).test(assetContentString), 'the inline sourcemap comment should be removed');
            verifier.end();
        })
        .write(createAssetWithInlineMap());
});

unitTest('SourcemapInit: should load external map referenced by `//#` comment', (verifier) => {
    verifier.comment('Testing loading of external sourcemap specified by `//#` syntax.');
    const originalAsset = createBufferedAsset();
    // Dynamically update the asset content with an external sourcemap reference
    originalAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld2.js.map`, 'utf8');

    const pipeConfig = { loadMaps: true };
    const processingPipeline = sourcemapProcessor.initializeMappings(pipeConfig);

    processingPipeline
        .on('data', (resultAsset) => {
            if (DEBUG_OUTPUT_ENABLED) {
                console.log(`[DEBUG] External map loaded for: ${resultAsset.path}`);
            }
            verifier.ok(resultAsset.sourceMap, 'a sourcemap object should be attached');
            verifier.equal(String(resultAsset.sourceMap.version), '3', 'sourcemap version should be 3');
            verifier.deepEqual(resultAsset.sourceMap.sources, ['helloworld2.js'], 'sources should reflect the external map file');
            verifier.deepEqual(resultAsset.sourceMap.sourcesContent, ['source content from source map'], 'sourcesContent should come from the external map');
            verifier.equal(resultAsset.sourceMap.mappings, '', 'mappings should be empty as per external map content');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`External map loading failed: ${err.message}`);
            verifier.end();
        })
        .write(originalAsset);
});

unitTest('SourcemapInit: should remove `//#` sourcemap comment post-load', (verifier) => {
    verifier.comment('Confirming removal of `//#` sourcemap comments after loading.');
    const targetAsset = createBufferedAsset();
    targetAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld2.js.map`, 'utf8');

    const config = { loadMaps: true };
    const pipelineProcess = sourcemapProcessor.initializeMappings(config);

    pipelineProcess
        .on('data', (processedAsset) => {
            const contentAfterProcessing = processedAsset.contents.toString('utf8');
            verifier.notOk(/\/\/#[ \t]*sourceMappingURL/.test(contentAfterProcessing), 'the `//#` sourcemap comment should no longer be present');
            verifier.end();
        })
        .write(targetAsset);
});

unitTest('SourcemapInit: should load external map referenced by `/*# */` comment', (verifier) => {
    verifier.comment('Testing loading of external sourcemap specified by `/*# */` syntax.');
    const assetWithBlockComment = createBufferedAsset();
    assetWithBlockComment.contents = Buffer.from(`${baseSourceContent}\n/*# sourceMappingURL=helloworld2.js.map */`, 'utf8');

    const opts = { loadMaps: true };
    const processingStream = sourcemapProcessor.initializeMappings(opts);

    processingStream
        .on('data', (outputFile) => {
            verifier.ok(outputFile.sourceMap, 'a sourcemap object should be available');
            verifier.equal(String(outputFile.sourceMap.version), '3', 'sourcemap version must be 3');
            verifier.deepEqual(outputFile.sourceMap.sources, ['helloworld2.js'], 'sources array should match external map');
            verifier.deepEqual(outputFile.sourceMap.sourcesContent, ['source content from source map'], 'sourcesContent should be loaded');
            verifier.equal(outputFile.sourceMap.mappings, '', 'mappings should be correctly empty');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Block comment map loading failed: ${err.message}`);
            verifier.end();
        })
        .write(assetWithBlockComment);
});

unitTest('SourcemapInit: should remove `/*# */` sourcemap comment post-load', (verifier) => { // Corrected description
    verifier.comment('Confirming removal of `/*# */` sourcemap comments after loading.');
    const assetWithBlockComment = createBufferedAsset();
    assetWithBlockComment.contents = Buffer.from(`${baseSourceContent}\n/*# sourceMappingURL=helloworld2.js.map */`, 'utf8');

    const opts = { loadMaps: true };
    const processingStream = sourcemapProcessor.initializeMappings(opts);

    processingStream
        .on('data', (outputFile) => {
            const fileContentAfter = outputFile.contents.toString('utf8');
            verifier.notOk(/\/\*#[ \t]*sourceMappingURL/.test(fileContentAfter), 'the block comment sourcemap reference should be removed');
            verifier.end();
        })
        .write(assetWithBlockComment);
});

unitTest('SourcemapInit: should load external map even without a comment reference', (verifier) => {
    verifier.comment('Verifying loading of external sourcemap based on convention (same name, .map extension).');
    const sourceAsset = createBufferedAsset();
    // Modify path to simulate a file that would have a corresponding .map file
    sourceAsset.path = pathUtil.resolve(pathUtil.dirname(sourceAsset.path), 'helloworld2.js'); // Changed path manipulation

    const initOptions = { loadMaps: true };
    const processingChannel = sourcemapProcessor.initializeMappings(initOptions);

    processingChannel
        .on('data', (resultAsset) => {
            verifier.ok(resultAsset.sourceMap, 'sourcemap object must be present');
            verifier.equal(String(resultAsset.sourceMap.version), '3', 'version should be 3');
            verifier.deepEqual(resultAsset.sourceMap.sources, ['helloworld2.js'], 'sources should match the expected external map');
            verifier.deepEqual(resultAsset.sourceMap.sourcesContent, ['source content from source map'], 'sourcesContent should be correctly populated');
            verifier.equal(resultAsset.sourceMap.mappings, '', 'mappings should be empty as defined');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Convention-based map loading failed: ${err.message}`);
            verifier.end();
        })
        .write(sourceAsset);
});

unitTest('SourcemapInit: should load external map and add missing sourceContent', (verifier) => {
    verifier.comment('Checking if sourceContent is added for sources that lack it in the external map.');
    const currentAsset = createBufferedAsset();
    currentAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld3.js.map`, 'utf8');

    const processingConfig = { loadMaps: true };
    const dataFlow = sourcemapProcessor.initializeMappings(processingConfig);

    dataFlow
        .on('data', (outputData) => {
            verifier.ok(outputData.sourceMap, 'a sourcemap object should be present on the output');
            verifier.equal(String(outputData.sourceMap.version), '3', 'sourcemap version should be 3');
            verifier.deepEqual(outputData.sourceMap.sources, ['helloworld.js', 'test1.js'], 'all sources should be listed');
            // Explicitly check the contents based on the file content and the 'test1' file
            const expectedSourceContents = [currentAsset.contents.toString('utf8'), 'test1\n'];
            verifier.deepEqual(outputData.sourceMap.sourcesContent, expectedSourceContents, 'sourcesContent should be filled for missing entries');
            verifier.equal(outputData.sourceMap.mappings, '', 'mappings should remain as defined');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Error during sourceContent addition: ${err.message}`);
            verifier.end();
        })
        .write(currentAsset);
});

unitTest('SourcemapInit: should not throw error if source file for sourceContent is missing', (verifier) => {
    verifier.comment('Ensuring robustness when a referenced source file for content is not found.');
    const targetAsset = createBufferedAsset();
    targetAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld4.js.map`, 'utf8');

    const streamSettings = { loadMaps: true };
    const processingFlow = sourcemapProcessor.initializeMappings(streamSettings);

    processingFlow
        .on('data', (resultAsset) => {
            verifier.ok(resultAsset.sourceMap, 'sourcemap object should still be present');
            verifier.equal(String(resultAsset.sourceMap.version), '3', 'version is 3');
            verifier.deepEqual(resultAsset.sourceMap.sources, ['helloworld.js', 'missingfile'], 'all sources, including missing, should be listed');
            const expectedContents = [targetAsset.contents.toString('utf8'), null]; // Missing file content becomes null
            verifier.deepEqual(resultAsset.sourceMap.sourcesContent, expectedContents, 'missing source file content should be null');
            verifier.equal(resultAsset.sourceMap.mappings, '', 'mappings should be as expected');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Unexpected error for missing sourceContent file: ${err.message}`);
            verifier.end();
        })
        .write(targetAsset);
});

unitTest('SourcemapInit: should use Unix-style paths in sourcemap output', (verifier) => {
    verifier.comment('Checking if generated sourcemap paths are normalized to Unix style.');
    const assetForPathTest = createBufferedAsset();
    // Simulate a Windows-style path or just ensure base is cwd for relative paths
    assetForPathTest.base = assetForPathTest.cwd; // This makes `file` relative to `cwd`

    const processOptions = {}; // No special options needed for this test
    const processingStream = sourcemapProcessor.initializeMappings(processOptions);

    processingStream
        .on('data', (outputAsset) => {
            const expectedFile = pathUtil.relative(assetForPathTest.base, assetForPathTest.path).replace(/\\/g, '/'); // Manual Unix conversion
            verifier.equal(outputAsset.sourceMap.file, expectedFile, 'sourcemap file property should be a Unix-style relative path');
            verifier.deepEqual(outputAsset.sourceMap.sources, [expectedFile], 'sourcemap sources should also use Unix-style relative paths');
            verifier.end();
        })
        .write(assetForPathTest);
});

unitTest('SourcemapInit: should respect sourceRoot when resolving source paths', (verifier) => {
    verifier.comment('Verifying that `sourceRoot` in an external map correctly influences source path resolution.');
    const rootTestAsset = createBufferedAsset();
    rootTestAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld5.js.map`, 'utf8');

    const pipelineSettings = { loadMaps: true };
    const transformationFlow = sourcemapProcessor.initializeMappings(pipelineSettings);

    transformationFlow
        .on('data', (finalAsset) => {
            verifier.ok(finalAsset.sourceMap, 'sourcemap object must exist');
            verifier.equal(String(finalAsset.sourceMap.version), '3', 'version 3 expected');
            verifier.deepEqual(finalAsset.sourceMap.sources, ['../helloworld.js', '../test1.js'], 'sources should be resolved relative to sourceRoot');
            const expectedSourceContents = [rootTestAsset.contents.toString('utf8'), 'test1\n'];
            verifier.deepEqual(finalAsset.sourceMap.sourcesContent, expectedSourceContents, 'sourcesContent should be loaded correctly');
            verifier.equal(finalAsset.sourceMap.mappings, '', 'mappings should be empty');
            verifier.equal(finalAsset.sourceMap.sourceRoot, 'test', 'sourceRoot property should be preserved');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Error during sourceRoot processing: ${err.message}`);
            verifier.end();
        })
        .write(rootTestAsset);
});

unitTest('SourcemapInit: should not load source content if the source path is a URL', (verifier) => {
    verifier.comment('Ensuring content is not loaded for remote source paths (URLs).');
    const urlSourceAsset = createBufferedAsset();
    urlSourceAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld6.js.map`, 'utf8');

    const pipeConfiguration = { loadMaps: true };
    const processingEngine = sourcemapProcessor.initializeMappings(pipeConfiguration);

    processingEngine
        .on('data', (outputFile) => {
            verifier.ok(outputFile.sourceMap, 'sourcemap object should be present');
            verifier.equal(String(outputFile.sourceMap.version), '3', 'version 3 expected');
            verifier.deepEqual(outputFile.sourceMap.sources, ['helloworld.js', 'http://example2.com/test1.js'], 'sources should include the URL');
            verifier.deepEqual(outputFile.sourceMap.sourcesContent, [null, null], 'source content for URL should be null'); // Both are null because baseSourceContent is null too for this specific test case. Ah, no, the first one should be loaded. Let me adjust the test to match the original behavior and my understanding.
            // Re-evaluating the original test: it expects both to be null. This implies the 'helloworld.js' in helloworld6.js.map is also considered remote or its content is not found locally.
            // My assumption was that local files would have content loaded and remote wouldn't. The original test implies that for 'helloworld6.js.map', it explicitly sets source content to null for both.
            // So, sticking to the original test's expectation of [null, null].
            verifier.equal(outputFile.sourceMap.mappings, '', 'mappings should be empty');
            verifier.end();
        })
        .on('error', (err) => {
            verifier.fail(`Error during URL source content handling: ${err.message}`);
            verifier.end();
        })
        .write(urlSourceAsset);
});

unitTest('SourcemapInit: should log debug messages for missing sourceContent when debug is enabled', (verifier) => {
    verifier.comment('Verifying console output for missing source content in debug mode.');
    const debugTestAsset = createBufferedAsset();
    debugTestAsset.contents = Buffer.from(`${baseSourceContent}\n//# sourceMappingURL=helloworld4.js.map`, 'utf8'); // Map that references a missing file

    const consoleRecorder = consoleCaptureUtility(); // Start recording console output
    const pipelineSettings = { loadMaps: true, debug: DEBUG_OUTPUT_ENABLED || true }; // Ensure debug is true for this test

    // Add a pre-check for debug flag to potentially skip this test if DEBUG_OUTPUT_ENABLED is false
    if (!pipelineSettings.debug) {
        verifier.skip('Skipping console debug test as debug mode is not enabled.');
        consoleRecorder.restore();
        return verifier.end();
    }

    const processingPipeline = sourcemapProcessor.initializeMappings(pipelineSettings);

    processingPipeline
        .on('data', (outputAsset) => {
            consoleRecorder.restore(); // Stop recording console output

            // Check the captured console logs
            const loggedMessages = consoleRecorder.history.log;
            const warnedMessages = consoleRecorder.history.warn;

            verifier.ok(loggedMessages.length > 0, 'at least one log message should be captured');
            verifier.ok(warnedMessages.length > 0, 'at least one warn message should be captured');

            verifier.equal(loggedMessages[0], 'sourcemap-init: No source content for "missingfile". Loading from file.', 'should log about missing source content');
            verifier.ok(warnedMessages[0].startsWith('sourcemap-init: source file not found: '), 'should warn about the missing file path');
            verifier.end();
        })
        .on('error', (err) => {
            consoleRecorder.restore();
            verifier.fail(`Unexpected error during debug test: ${err.message}`);
            verifier.end();
        })
        .write(debugTestAsset);
});