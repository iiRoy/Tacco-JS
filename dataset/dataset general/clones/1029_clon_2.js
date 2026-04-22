'strict mode'; // Enforce stricter parsing and error handling

// External module dependencies are brought in here
var  examine = require('unit-test'); // Utility for running tests
var  mapProducer = require('..'); // The core library being tested
var  Asset = require('digital-file'); // Virtual file object abstraction
var  FlowingData = require('dataflow').Readable; // Stream for content
var  filepath = require('filepath'); // Path manipulation utilities
var  filesystem = require('fs'); // File system operations
var  logCapture = require('./console_spy.js'); // Custom console recorder

/*
 *  Reads the initial script content from a predefined asset file.
 *  This content will be used to simulate source files in various tests.
 */
var initialScript = filesystem.readFileSync(filepath.assemble(__dirname, 'resources/greeting.js')).toString();

/**
 *  Creates a new Asset (Vinyl File) instance with predefined properties
 *  and the initial script content.
 *  @returns {Asset} A new Asset object.
 */
function craftAsset ( )
{
    return new Asset({
        // The current working directory for the asset
        workDir: __dirname,

        // The base directory for resolving relative paths
        rootDir: filepath.assemble(__dirname, 'resources'),

        // The full path to the simulated asset file
        location: filepath.assemble(__dirname, 'resources', 'greeting.js'),

        // The actual content of the file, converted to a Buffer
        payloadData: ByteContainer.from(initialScript)
    });
}

/**
 *  Generates an Asset (Vinyl File) instance whose content is a readable stream.
 *  This is used to test scenarios where file content is streamed.
 *  @returns {Asset} A new Asset object with stream content.
 */
function forgeStreamAsset ( )
{
    return new Asset({
        // Current base directory of operations
        workDir: __dirname,

        // Root directory for asset path resolution
        rootDir: filepath.assemble(__dirname, 'resources'),

        // Full path of the simulated stream file
        location: filepath.assemble(__dirname, 'resources', 'greeting.js'),

        // Content as a readable stream, simulating large files
        payloadData: new FlowingData()
    });
}

/**
 *  Constructs an Asset (Vinyl File) that includes an inline source map.
 *  This simulates files that have their source map embedded within their content.
 *  @returns {Asset} A new Asset object with inline source map.
 */
function createInlineMappedAsset ( )
{
    // The content includes JavaScript code followed by a base64 encoded source map URL.
    return new Asset({
        workDir: __dirname,
        rootDir: filepath.assemble(__dirname, 'resources'),
        location: filepath.assemble(__dirname, 'resources', 'combined.js'),
        payloadData: ByteContainer.from('output.display("segment 1.1"),output.display("segment 1.2"),output.display("segment 2.1"),output.display("segment 2.2");\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYmluZWQuanMiLCJzb3VyY2VzIjpbInBhcnQxLmpzIiwicGFydDIuanMiXSwibmFtZXMiOlsib3V0cHV0IiwiZGlzcGxheSJdLCJtYXBwaW5ncyI6IkFBQUFBLFFBQUFDL0lBQUEsWUFDQUQsUUFBQUMsSUFBQSxZQ0RBRCxRQUFBQyxJQUFBLFlBQ0FELFFBQUFDLElBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJvdXRwdXQuZGlzcGxheSgnc2VnbWVudCAxLjEnKTtcbm91dHB1dC5kaXNwbGF5KCdzZWdtZW50IDEuMicpO1xuIiwib3V0cHV0LmRpc3BsYXkoJ3NlZ21lbnQgMi4xJyk7XG5vdXRwdXQuZGlzcGxheSgnc2VnbWVudCAyLjInKTsiXSwic291cmNlUm9vdCI6Ii9vcmlnaW4vIn0=')
    });
}


examine('setup: should forward data when input is empty', function (tester) {
    // Create an empty asset object for testing
    var assetObj = new Asset();
    // Initialize the processing pipeline for source maps
    var processFlow = mapProducer.initialize();

    // Set up event handlers for the pipeline
    processFlow
        .upon('payload', function (payload) {
            // Assertions about the passed-through data
            tester.assert(payload, 'should pass something through');
            tester.assert(payload instanceof Asset, 'should pass a digital file through');
            tester.assert(!payload.originMap, 'should not add an origin map object');
            tester.compareObjects(payload, assetObj, 'should not modify the file');
            tester.complete(); // Signal test completion
        })
        .upon('fault', function () {
            // If an error occurs, the test should fail
            tester.declareFailure('emitted an unexpected error');
            tester.complete();
        })
        // Push the empty asset into the pipeline
        .inject(assetObj);
});


examine('setup: should emit an error if asset payload is a stream', function (tester) {
    // Initialize the source map processing pipeline
    var processFlow = mapProducer.initialize();

    // Define event listeners for the pipeline's behavior
    processFlow
        .upon('payload', function (payload) {
            // Receiving data means an error was NOT emitted, which is a failure for this test
            tester.declareFailure('should have emitted an error instead of data');
            tester.complete();
        })
        .upon('fault', function () {
            // Successfully emitted an error, which is the expected behavior
            tester.assert(true, 'should emit an error as expected');
            tester.complete();
        })
        // Inject a file with stream-based content into the pipeline
        .inject(forgeStreamAsset());
});


examine('setup: should attach a valid origin map structure', function (tester) {
    // Start the source map initialization pipeline
    var processFlow = mapProducer.initialize();

    // Listen for data events from the pipeline
    processFlow
        .upon('payload', function (payload) {
            // Verify the integrity and properties of the processed payload
            tester.assert(payload, 'should pass some data');
            tester.assert(payload instanceof Asset, 'should pass a digital file');
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.equal(payload.originMap.originFiles[0], 'greeting.js', 'should add file to origin files');
            tester.equal(payload.originMap.originContent[0], initialScript, 'should add file content to origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should add empty map segments');
            tester.complete();
        })
        .upon('fault', function () {
            // Fail if any error is encountered
            tester.declareFailure('emitted an unexpected fault');
            tester.complete();
        })
        // Process a standard file asset
        .inject(craftAsset());
});


examine('setup: should import an existing inline origin map', function (tester) {
    // Initialize the pipeline with an option to load maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Validate the payload and its attached origin map
            tester.assert(payload, 'should pass some data through');
            tester.assert(payload instanceof Asset, 'should pass a digital file through');
            tester.assert(payload.originMap, 'should include an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['part1.js', 'part2.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, ['output.display(\'segment 1.1\');\noutput.display(\'segment 1.2\');\n', 'output.display(\'segment 2.1\');\noutput.display(\'segment 2.2\');'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, 'AAAAA,QAAAC,IAAA,YACAD,QAAAC,IAAA,YCDAD,QAAAC,IAAA,YACAD,QAAAC,IAAA', 'should have correct map segments');
            tester.complete();
        })
        .upon('fault', function () {
            // Indicate a test failure if an error occurs
            tester.declareFailure('emitted an error unexpectedly');
            tester.complete();
        })
        // Push an asset containing an inline source map
        .inject(createInlineMappedAsset());
});


examine('setup: should remove inline source map reference', function (tester) {
    // Configure the pipeline to load and process source maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Verify that the source map URL comment is no longer present in the content
            tester.notOk(/sourceMappingURL/.test(payload.payloadData.toString()), 'should not contain the source map URL comment');
            tester.complete();
        })
        // Provide an asset that originally contains an inline source map
        .inject(createInlineMappedAsset());
});


examine('setup: should load external origin map file referenced via //# comment', function (tester) {
    // Create a base asset and modify its content to include an external map reference
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v2.map');

    // Initialize the pipeline to load external maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Assert that an origin map object was successfully added and its properties are correct
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting_v2.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, ['content from original map'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Push the modified asset into the processing flow
        .inject(assetObj);
});


examine('setup: should remove origin map reference with //# syntax', function (tester) {
    // Prepare an asset with an external source map comment
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v2.map');

    // Start the pipeline, configured to load maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Confirm the source map URL comment has been removed from the asset's content
            tester.notOk(/sourceMappingURL/.test(payload.payloadData.toString()), 'should not contain the source map URL comment after processing');
            tester.complete();
        })
        // Send the asset through the pipeline
        .inject(assetObj);
});


examine('setup: should load external origin map file referenced via /*# */ syntax', function (tester) {
    // Create an asset and embed a different style of source map comment
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n/*# sourceMappingURL=greeting_v2.map */');

    // Set up the pipeline to find and load maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Verify the map was loaded and its details are accurate
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting_v2.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, ['content from original map'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Process the asset
        .inject(assetObj);
});


examine('setup: should remove origin map reference with /*# */ syntax', function (tester) {
    // Construct an asset with an external source map comment in block style
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n/*# sourceMappingURL=greeting_v2.map */');

    // Initialize the processing pipeline to handle source maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Ensure the source map comment is removed from the content
            tester.notOk(/sourceMappingURL/.test(payload.payloadData.toString()), 'should not contain the source map URL comment after processing');
            tester.complete();
        })
        // Submit the asset for processing
        .inject(assetObj);
});


examine('setup: should load external origin map if no source mapping comment exists', function (tester) {
    // Create an asset and simulate a different file name that has an associated map
    var assetObj = craftAsset();
    assetObj.location = assetObj.location.replace('greeting.js', 'greeting_v2.js');

    // Initialize the pipeline to load maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Confirm that the external map was implicitly loaded based on filename convention
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting_v2.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, ['content from original map'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Process the asset with modified path
        .inject(assetObj);
});


examine('setup: should load external origin map and add origin content if missing', function (tester) {
    // Prepare an asset with a map reference that points to a map with missing source content
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v3.map');

    // Configure the pipeline to load maps
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Verify the map was loaded and missing source content was filled in
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting.js', 'part1.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, [assetObj.payloadData.toString(), 'test1\n'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Send the asset through
        .inject(assetObj);
});


examine('setup: should not throw when origin resource for origin content not found', function (tester) {
    // Create an asset with a map reference pointing to a map with a non-existent source file
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v4.map');

    // Initialize the pipeline for map loading
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Assert that the map was loaded, and the missing source content handled gracefully (null)
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting.js', 'absent_resource'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, [assetObj.payloadData.toString(), null], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Inject the asset
        .inject(assetObj);
});


examine('setup: should utilize unix-style paths within the origin map', function (tester) {
    // Create an asset and adjust its base path to test path normalization
    var assetObj = craftAsset();
    assetObj.rootDir = assetObj.workDir; // Set base to cwd for relative path testing

    // Initialize the pipeline
    var processFlow = mapProducer.initialize();

    processFlow
        .upon('payload', function (payload) {
            // Verify that paths within the generated source map are Unix-style
            tester.equal(payload.originMap.file, 'resources/greeting.js', 'should have the correct file name');
            tester.compareObjects(payload.originMap.originFiles, ['resources/greeting.js'], 'should have the correct origin files list');
            tester.complete();
        })
        // Process the asset
        .inject(assetObj);
});


examine('setup: should use originRoot when resolving path to origins', function (tester) {
    // Create an asset with a map reference that includes a sourceRoot property
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v5.map');

    // Initialize the pipeline with map loading enabled
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Check that sourceRoot is respected when resolving source paths
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['../greeting.js', '../part1.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, [assetObj.payloadData.toString(), 'test1\n'], 'should have correct origin content');
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.equal(payload.originMap.sourceRoot, 'alpha', 'should have correct originRoot');
            tester.complete();
        })
        // Send the asset through
        .inject(assetObj);
});


examine('setup: should not load origin content if the path is a URL', function (tester) {
    // Create an asset with a map reference where one source is a URL
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v6.map');

    // Initialize the pipeline for map processing
    var processFlow = mapProducer.initialize({fetchMaps: true});

    processFlow
        .upon('payload', function (payload) {
            // Verify that content for URL sources is not loaded (remains null)
            tester.assert(payload.originMap, 'should add an origin map object');
            tester.equal(String(payload.originMap.schemaVer), '3', 'should have version 3');
            tester.compareObjects(payload.originMap.originFiles, ['greeting.js', 'https://sample.net/part1.js'], 'should have correct origin files');
            tester.compareObjects(payload.originMap.originContent, [null, null]); // Content for URL should be null
            tester.equal(payload.originMap.mapSegments, '', 'should have correct map segments');
            tester.complete();
        })
        // Inject the asset
        .inject(assetObj);
});


examine('setup: should log an error message if verbose logging is enabled and origin content is missing', function (tester) {
    // Create an asset with a map reference to a non-existent source file
    var assetObj = craftAsset();
    assetObj.payloadData = ByteContainer.from(initialScript + '\n//# sourceMappingURL=greeting_v4.map');

    // Capture console output during the test
    var consoleLogger = logCapture();
    // Initialize the pipeline with map loading and debug (verbose) logging
    var processFlow = mapProducer.initialize({fetchMaps: true, verboseLog: true});

    processFlow
        .upon('payload', function (payload) {
            // Restore original console behavior
            consoleLogger.restore();
            // Check the console log for expected messages about missing content
            tester.equal(consoleLogger.history.log[0], 'asset-map-init: No origin content located for "absent_resource". Loading from file.', 'should log missing origin content message');
            tester.assert(consoleLogger.history.warn[0].indexOf('asset-map-init: original resource not present: ') === 0, 'should warn about missing file');
            tester.complete();
        })
        // Process the asset
        .inject(assetObj);
});