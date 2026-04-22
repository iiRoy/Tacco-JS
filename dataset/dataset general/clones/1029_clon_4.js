import { test, strict as assert } from 'node:test';
import { path as filePathUtils } from 'node:path';
import { TextEncoder, TextDecoder } from 'node:util'; // For buffer operations
import { Buffer } from 'node:buffer'; // For base64 decoding

// --- Mocking and Global Setup ---

const mockedFileSystem = new Map();
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function storeMockContent(identifier, content) {
    mockedFileSystem.set(identifier, textEncoder.encode(content));
}

function retrieveMockContent(identifier) {
    const data = mockedFileSystem.get(identifier);
    return data ? textDecoder.decode(data) : undefined;
}

const capturedLogs = [];
const capturedWarnings = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

function beginConsoleCapture() {
    console.log = (...args) => capturedLogs.push(args.join(' '));
    console.warn = (...args) => capturedWarnings.push(args.join(' '));
    capturedLogs.length = 0;
    capturedWarnings.length = 0;
}

function endConsoleCapture() {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
}

const projectRootPath = '/project/tests'; // Analogous to __dirname
const assetSourcePath = filePathUtils.join(projectRootPath, 'assets');
const defaultAssetData = 'console.log("hello world");\n'; // Analogous to sourceContent

// Pre-fill mock file system for various test cases
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld.js'), defaultAssetData);
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld2.js.map'), JSON.stringify({
    version: 3,
    file: 'helloworld2.js',
    sources: ['helloworld2.js'],
    sourcesContent: ['source content from source map'],
    mappings: ''
}));
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld3.js.map'), JSON.stringify({
    version: 3,
    file: 'helloworld3.js',
    sources: ['helloworld.js', 'test1.js'], // test1.js content needs to be loaded
    mappings: ''
}));
storeMockContent(filePathUtils.join(assetSourcePath, 'test1.js'), 'test1\n');
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld4.js.map'), JSON.stringify({
    version: 3,
    file: 'helloworld4.js',
    sources: ['helloworld.js', 'missingfile'], // 'missingfile' does not exist
    mappings: ''
}));
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld5.js.map'), JSON.stringify({
    version: 3,
    file: 'helloworld5.js',
    sources: ['../helloworld.js', '../test1.js'], // Sources relative to sourceRoot
    sourceRoot: 'test',
    mappings: ''
}));
storeMockContent(filePathUtils.join(assetSourcePath, 'helloworld6.js.map'), JSON.stringify({
    version: 3,
    file: 'helloworld6.js',
    sources: ['helloworld.js', 'http://example2.com/test1.js'], // URL source
    mappings: ''
}));

// --- Asset Object (Vinyl-like abstraction) ---

class AssetObject {
    constructor(config = {}) {
        this.currentWorkingDir = config.currentWorkingDir || projectRootPath;
        this.basePath = config.basePath || assetSourcePath;
        this.fullPath = config.fullPath || '';
        this.dataContent = config.dataContent === undefined ? null : config.dataContent; // Uint8Array or null (for stream-like)
        this.metadataMap = config.metadataMap || null; // Source map object
    }

    get contentAsString() {
        if (this.dataContent === null) {
            return null; // Represents a stream
        }
        if (this.dataContent instanceof Uint8Array) {
            return textDecoder.decode(this.dataContent);
        }
        return String(this.dataContent);
    }

    set contentAsString(value) {
        this.dataContent = textEncoder.encode(value);
    }
}

// --- Asset Creation Helpers ---

function createContentfulAsset() {
    return new AssetObject({
        currentWorkingDir: projectRootPath,
        basePath: assetSourcePath,
        fullPath: filePathUtils.join(assetSourcePath, 'helloworld.js'),
        dataContent: textEncoder.encode(defaultAssetData)
    });
}

function createStreamingAsset() {
    return new AssetObject({
        currentWorkingDir: projectRootPath,
        basePath: assetSourcePath,
        fullPath: filePathUtils.join(assetSourcePath, 'helloworld.js'),
        dataContent: null // Signifies stream content
    });
}

function createAssetWithEmbeddedMap() {
    const embeddedMapString = 'console.log("line 1.1"),console.log("line 1.2"),console.log("line 2.1"),console.log("line 2.2");\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxsLmpzIiwic291cmNlcyI6WyJ0ZXN0MS5qcyIsInRlc3QyLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBQSxRQUFBQyxJQUFBLFlBQ0FELFFBQUFDLElBQUEsWUNEQUQsUUFBQUMsSUFBQSxZQUNBRCxRQUFBQyxJQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ2xpbmUgMS4xJyk7XG5jb25zb2xlLmxvZygnbGluZSAxLjInKTtcbiIsImNvbnNvbGUubG9nKCdsaW5lIDIuMScpO1xuY29uc29sZS5sb2coJ2xpbmUgMi4yJyk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9';
    return new AssetObject({
        currentWorkingDir: projectRootPath,
        basePath: assetSourcePath,
        fullPath: filePathUtils.join(assetSourcePath, 'all.js'),
        dataContent: textEncoder.encode(embeddedMapString)
    });
}

// --- Core Logic: Asset Processor (sourcemaps.init equivalent) ---

async function processAsset(inputAsset, opts = {}) {
    const processingOptions = {
        loadMaps: false,
        debug: false,
        ...opts
    };

    if (!inputAsset || inputAsset.dataContent === undefined) {
        return inputAsset;
    }

    if (inputAsset.dataContent === null) {
        throw new Error('Asset content cannot be a stream.');
    }

    const outputAsset = new AssetObject({ ...inputAsset });
    outputAsset.metadataMap = null;

    let currentAssetContent = outputAsset.contentAsString;
    let mapReference = null;
    let mapCommentMatch = null;

    // Regex to find //# sourceMappingURL=... or /*# sourceMappingURL=... */
    const commentPattern = /(?:\/{2}[#@]\s*sourceMappingURL=(.*)\s*)|(?:\/\*[#@]\s*sourceMappingURL=(.*?)\s*\*\/)/g;
    while ((mapCommentMatch = commentPattern.exec(currentAssetContent)) !== null) {
        mapReference = mapCommentMatch[1] || mapCommentMatch[2];
        break; // Take the last one found, similar to gulp-sourcemaps behavior
    }

    if (mapReference && processingOptions.loadMaps) {
        if (mapReference.startsWith('data:')) {
            const base64Part = mapReference.match(/^data:application\/json;base64,(.*)$/);
            if (base64Part) {
                try {
                    const decodedJson = textDecoder.decode(Buffer.from(base64Part[1], 'base64'));
                    outputAsset.metadataMap = JSON.parse(decodedJson);
                    currentAssetContent = currentAssetContent.replace(mapCommentMatch[0], ''); // Remove comment
                } catch (e) {
                    console.warn('AssetProcessor: Failed to parse embedded metadata map:', e);
                }
            }
        } else {
            const externalMapPath = filePathUtils.resolve(filePathUtils.dirname(outputAsset.fullPath), mapReference);
            const externalMapData = retrieveMockContent(externalMapPath);
            if (externalMapData) {
                try {
                    outputAsset.metadataMap = JSON.parse(externalMapData);
                    currentAssetContent = currentAssetContent.replace(mapCommentMatch[0], ''); // Remove comment
                } catch (e) {
                    console.warn('AssetProcessor: Failed to parse external metadata map:', e);
                }
            } else {
                if (processingOptions.debug) {
                    console.warn(`AssetProcessor: External metadata map file not found: ${externalMapPath}`);
                }
            }
        }
    }

    if (!outputAsset.metadataMap && processingOptions.loadMaps) {
        const implicitMapPath = outputAsset.fullPath + '.map';
        const implicitMapData = retrieveMockContent(implicitMapPath);
        if (implicitMapData) {
            try {
                outputAsset.metadataMap = JSON.parse(implicitMapData);
            } catch (e) {
                console.warn('AssetProcessor: Failed to parse implicit external metadata map:', e);
            }
        }
    }

    if (!outputAsset.metadataMap) {
        outputAsset.metadataMap = {
            version: 3,
            file: filePathUtils.relative(outputAsset.basePath, outputAsset.fullPath).replace(/\\/g, '/'),
            sources: [filePathUtils.relative(outputAsset.basePath, outputAsset.fullPath).replace(/\\/g, '/')],
            sourcesContent: [currentAssetContent],
            mappings: ''
        };
    } else {
        if (processingOptions.loadMaps && outputAsset.metadataMap.sources) {
            const updatedSourcesContent = [];
            for (const [idx, sourceIdentifier] of outputAsset.metadataMap.sources.entries()) {
                if (outputAsset.metadataMap.sourcesContent && outputAsset.metadataMap.sourcesContent[idx]) {
                    updatedSourcesContent.push(outputAsset.metadataMap.sourcesContent[idx]);
                    continue;
                }

                if (sourceIdentifier.startsWith('http://') || sourceIdentifier.startsWith('https://')) {
                    updatedSourcesContent.push(null);
                    continue;
                }

                let absoluteSourceFilePath;
                const mapDir = filePathUtils.dirname(outputAsset.fullPath);
                if (outputAsset.metadataMap.sourceRoot) {
                    absoluteSourceFilePath = filePathUtils.resolve(mapDir, outputAsset.metadataMap.sourceRoot, sourceIdentifier);
                } else {
                    absoluteSourceFilePath = filePathUtils.resolve(mapDir, sourceIdentifier);
                }

                let loadedContent = retrieveMockContent(absoluteSourceFilePath);

                if (loadedContent === undefined) {
                    const currentAssetRelativePath = filePathUtils.relative(outputAsset.basePath, outputAsset.fullPath).replace(/\\/g, '/');
                    let normalizedSourceIdentifier = sourceIdentifier;
                    if (outputAsset.metadataMap.sourceRoot) {
                        normalizedSourceIdentifier = filePathUtils.join(outputAsset.metadataMap.sourceRoot, sourceIdentifier);
                    }
                    normalizedSourceIdentifier = normalizedSourceIdentifier.replace(/\\/g, '/');

                    if (normalizedSourceIdentifier === currentAssetRelativePath || sourceIdentifier === currentAssetRelativePath) {
                        loadedContent = currentAssetContent;
                    } else {
                        if (processingOptions.debug) {
                            console.log(`AssetProcessor: No source content for "${sourceIdentifier}". Loading from file.`);
                            console.warn(`AssetProcessor: source file not found: ${absoluteSourceFilePath}`);
                        }
                        loadedContent = null;
                    }
                }
                updatedSourcesContent.push(loadedContent);
            }
            outputAsset.metadataMap.sourcesContent = updatedSourcesContent;
        }
    }

    outputAsset.contentAsString = currentAssetContent;
    return outputAsset;
}

// --- Tests ---

test('assetProcessor: should pass through an empty asset', async () => {
    const emptyAsset = new AssetObject();
    const processed = await processAsset(emptyAsset);
    assert.ok(processed, 'should return an asset');
    assert.ok(processed instanceof AssetObject, 'should return an asset object');
    assert.strictEqual(processed.metadataMap, null, 'should not add a metadata map');
    assert.deepStrictEqual(processed, emptyAsset, 'should not modify the asset');
});

test('assetProcessor: should throw an error if asset content is stream-like', async () => {
    const streamingAsset = createStreamingAsset();
    let caughtError = false;
    try {
        await processAsset(streamingAsset);
    } catch (err) {
        caughtError = true;
        assert.strictEqual(err.message, 'Asset content cannot be a stream.', 'should throw specific error message');
    }
    assert.ok(caughtError, 'should have thrown an error');
});

test('assetProcessor: should generate a basic metadata map for an asset', async () => {
    const contentfulAsset = createContentfulAsset();
    const processed = await processAsset(contentfulAsset);
    assert.ok(processed, 'should return an asset');
    assert.ok(processed instanceof AssetObject, 'should return an asset object');
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.strictEqual(processed.metadataMap.sources[0], 'assets/helloworld.js', 'map sources should include the asset path');
    assert.strictEqual(processed.metadataMap.sourcesContent[0], defaultAssetData, 'map sourcesContent should include asset content');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should load an existing inline metadata map', async () => {
    const inlineMapAsset = createAssetWithEmbeddedMap();
    const processed = await processAsset(inlineMapAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['test1.js', 'test2.js'], 'map sources should match inline map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, ['console.log(\'line 1.1\');\nconsole.log(\'line 1.2\');\n', 'console.log(\'line 2.1\');\nconsole.log(\'line 2.2\');'], 'map sourcesContent should match inline map');
    assert.strictEqual(processed.metadataMap.mappings, 'AAAAA,QAAAC,IAAA,YACAD,QAAAC,IAAA,YCDAD,QAAAC,IAAA,YACAD,QAAAC,IAAA', 'map mappings should match inline map');
});

test('assetProcessor: should remove the inline metadata map comment from content', async () => {
    const inlineMapAsset = createAssetWithEmbeddedMap();
    const originalContent = inlineMapAsset.contentAsString;
    const processed = await processAsset(inlineMapAsset, { loadMaps: true });
    assert.ok(originalContent.includes('sourceMappingURL='), 'original content should contain map comment');
    assert.strictEqual(processed.contentAsString.indexOf('sourceMappingURL='), -1, 'processed content should not have map comment');
});

test('assetProcessor: should load external metadata map referenced by `//#` comment', async () => {
    const externalMapAsset = createContentfulAsset();
    externalMapAsset.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld2.js.map');

    const processed = await processAsset(externalMapAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld2.js'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, ['source content from source map'], 'map sourcesContent should match external map');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should remove `//#` comment after loading external map', async () => {
    const externalMapAsset = createContentfulAsset();
    externalMapAsset.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld2.js.map');

    const processed = await processAsset(externalMapAsset, { loadMaps: true });
    assert.strictEqual(processed.contentAsString.indexOf('sourceMappingURL='), -1, 'processed content should not have map comment');
});

test('assetProcessor: should load external metadata map referenced by `/*# */` comment', async () => {
    const externalMapAsset = createContentfulAsset();
    externalMapAsset.dataContent = textEncoder.encode(defaultAssetData + '\n/*# sourceMappingURL=helloworld2.js.map */');

    const processed = await processAsset(externalMapAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld2.js'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, ['source content from source map'], 'map sourcesContent should match external map');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should remove `/*# */` comment after loading external map', async () => {
    const externalMapAsset = createContentfulAsset();
    externalMapAsset.dataContent = textEncoder.encode(defaultAssetData + '\n/*# sourceMappingURL=helloworld2.js.map */');

    const processed = await processAsset(externalMapAsset, { loadMaps: true });
    assert.strictEqual(processed.contentAsString.indexOf('sourceMappingURL='), -1, 'processed content should not have map comment');
});

test('assetProcessor: should load external metadata map if no comment but map file exists', async () => {
    const implicitMapAsset = createContentfulAsset();
    implicitMapAsset.fullPath = implicitMapAsset.fullPath.replace('helloworld.js', 'helloworld2.js');

    const processed = await processAsset(implicitMapAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld2.js'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, ['source content from source map'], 'map sourcesContent should match external map');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should load external map and fill missing sourcesContent', async () => {
    const assetWithMissingContent = createContentfulAsset();
    assetWithMissingContent.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld3.js.map');

    const processed = await processAsset(assetWithMissingContent, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld.js', 'test1.js'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, [assetWithMissingContent.contentAsString, 'test1\n'], 'map sourcesContent should be filled from files');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should not fail when source file for sourcesContent is absent', async () => {
    const assetWithMissingSource = createContentfulAsset();
    assetWithMissingSource.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld4.js.map');

    const processed = await processAsset(assetWithMissingSource, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld.js', 'missingfile'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, [assetWithMissingSource.contentAsString, null], 'missing sourcesContent should be null');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should use normalized (unix-style) paths in metadata map', async () => {
    const unixPathAsset = createContentfulAsset();
    unixPathAsset.basePath = unixPathAsset.currentWorkingDir; // Simulating base = cwd

    const processed = await processAsset(unixPathAsset);
    assert.strictEqual(processed.metadataMap.file, 'assets/helloworld.js', 'map file path should be unix-style relative to base');
    assert.deepStrictEqual(processed.metadataMap.sources, ['assets/helloworld.js'], 'map sources paths should be unix-style relative to base');
});

test('assetProcessor: should respect sourceRoot when resolving source paths', async () => {
    const sourceRootAsset = createContentfulAsset();
    sourceRootAsset.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld5.js.map');

    const processed = await processAsset(sourceRootAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['../helloworld.js', '../test1.js'], 'map sources should match external map (relative to sourceRoot)');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, [sourceRootAsset.contentAsString, 'test1\n'], 'map sourcesContent should be filled correctly');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
    assert.strictEqual(processed.metadataMap.sourceRoot, 'test', 'map sourceRoot should be preserved');
});

test('assetProcessor: should not load source content for URL paths', async () => {
    const urlSourceAsset = createContentfulAsset();
    urlSourceAsset.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld6.js.map');

    const processed = await processAsset(urlSourceAsset, { loadMaps: true });
    assert.ok(processed.metadataMap, 'should have a metadata map object');
    assert.strictEqual(String(processed.metadataMap.version), '3', 'map version should be 3');
    assert.deepStrictEqual(processed.metadataMap.sources, ['helloworld.js', 'http://example2.com/test1.js'], 'map sources should match external map');
    assert.deepStrictEqual(processed.metadataMap.sourcesContent, [urlSourceAsset.contentAsString, null], 'URL sourcesContent should be null');
    assert.strictEqual(processed.metadataMap.mappings, '', 'map mappings should be empty');
});

test('assetProcessor: should log debug messages for missing sourcesContent when debug is true', async () => {
    const debugAsset = createContentfulAsset();
    debugAsset.dataContent = textEncoder.encode(defaultAssetData + '\n//# sourceMappingURL=helloworld4.js.map'); // References 'missingfile'

    beginConsoleCapture();
    try {
        await processAsset(debugAsset, { loadMaps: true, debug: true });
        assert.strictEqual(capturedLogs[0], 'AssetProcessor: No source content for "missingfile". Loading from file.', 'should log specific info message');
        assert.ok(capturedWarnings[0].startsWith('AssetProcessor: source file not found: '), 'should log a warning about missing file');
    } finally {
        endConsoleCapture();
    }
});