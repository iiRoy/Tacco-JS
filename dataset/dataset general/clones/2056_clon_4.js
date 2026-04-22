const pathUtil = require('node:path');
const fileUtil = require('node:fs');
const { Readable, Transform } = require('node:stream');

// Mock for gulp-util PluginError
class CustomPluginIssue extends Error {
    constructor(messageContent, options = {}) {
        super(messageContent);
        this.name = 'CustomPluginIssue';
        this.plugin = options.plugin || 'unknown';
        Error.captureStackTrace(this, CustomPluginIssue);
    }
}

// Helper to check for error objects, replacing 'isError'
const isProblem = (potentialIssue) => {
    return (potentialIssue instanceof Error) || (potentialIssue instanceof CustomPluginIssue);
};

// Renamed and re-imported original modules
const propertyUtilities = require('../../dist/props');
const streamProcessor = require('../../dist/stream-util');

// --- Custom Stream Simulation Utilities (replacing gulp, through2) ---

// This class adapts a Gulp plugin (which returns a `through2` stream)
// to a promise-based interface for sequential processing.
class StreamAdapter {
    constructor(pluginFactory) {
        this.factory = pluginFactory;
    }

    async process(inputVirtualFile) {
        return new Promise((resolve, reject) => {
            if (!inputVirtualFile) {
                // If a previous step consumed the file, this step also gets nothing.
                return resolve(null);
            }

            const streamInstance = this.factory();
            let outputVirtualFile = null;
            let streamProblem = null;

            streamInstance.once('data', (file) => {
                outputVirtualFile = file;
            });
            streamInstance.once('error', (err) => {
                streamProblem = err;
                reject(err);
            });
            streamInstance.once('end', () => {
                if (streamProblem) {
                    // Error already handled by reject
                } else {
                    resolve(outputVirtualFile);
                }
            });

            streamInstance.write(inputVirtualFile);
            streamInstance.end();
        });
    }
}

// This utility orchestrates an asynchronous pipeline of file transformations,
// replacing the `gulp.src().pipe().on()` pattern.
const executeFileSequence = async (inputPaths, pipelineSteps, initialContentMappers = {}) => {
    const finalResults = [];
    let overallProblem = null;

    for (const sourcePath of inputPaths) {
        let currentFileRepresentation;
        try {
            let fileTextContent = fileUtil.readFileSync(sourcePath, 'utf8');

            // Apply initial content modification if provided for this path
            if (initialContentMappers[sourcePath]) {
                fileTextContent = initialContentMappers[sourcePath](fileTextContent);
            }

            // Create a mock Vinyl-like file object
            currentFileRepresentation = {
                path: sourcePath,
                contents: Buffer.from(fileTextContent, 'utf8'),
                relative: pathUtil.basename(sourcePath)
            };

            for (const step of pipelineSteps) {
                if (step instanceof StreamAdapter) {
                    currentFileRepresentation = await step.process(currentFileRepresentation);
                } else if (typeof step === 'function') {
                    // This handles custom `through.obj` like transforms directly
                    currentFileRepresentation = await new Promise((resolve, reject) => {
                        step(currentFileRepresentation, 'utf8', (err, resultFile) => {
                            if (err) reject(err);
                            else resolve(resultFile);
                        });
                    });
                }
                if (!currentFileRepresentation) { // File was consumed/filtered by a step
                    break;
                }
            }
            if (currentFileRepresentation) {
                finalResults.push(currentFileRepresentation);
            }
        } catch (err) {
            overallProblem = err;
            break;
        }
    }
    return { processedFiles: finalResults, issue: overallProblem };
};

// --- Test Suite Definitions (using Jest-like syntax) ---

describe('propertyManagement module', () => {

    describe('getValueTransformRetrieval()', () => {
        test('raises an error if the value transform is not registered', () => {
            expect(() => {
                propertyUtilities.getValueTransform('nonexistent');
            }).toThrow();
        });
        test('returns a correct copy of the value transform', () => {
            const transformation = propertyUtilities.getValueTransform('color/rgb');
            expect(typeof transformation.matcher).toBe('function');
            expect(typeof transformation.transformer).toBe('function');
        });
    });

    describe('valueTransformExistenceCheck()', () => {
        test('returns true if the value transform is present', () => {
            expect(propertyUtilities.valueTransformIsRegistered('color/rgb')).toBe(true);
        });
        test('returns false if the value transform is absent', () => {
            expect(propertyUtilities.valueTransformIsRegistered('color/rgb/extra')).toBe(false);
        });
    });

    describe('valueTransformRegistration()', () => {
        const patternMatcher = () => {};
        const dataTransformer = () => {};
        test('raises an error if the identifier is not provided or not a string', () => {
            expect(() => {
                propertyUtilities.registerValueTransform();
            }).toThrow();
            expect(() => {
                propertyUtilities.registerValueTransform(true);
            }).toThrow();
        });
        test('raises an error if the pattern matcher is not provided or not a function', () => {
            expect(() => {
                propertyUtilities.registerValueTransform('testName');
            }).toThrow();
            expect(() => {
                propertyUtilities.registerValueTransform('testName', true);
            }).toThrow();
        });
        test('raises an error if the data transformer is not provided or not a function', () => {
            expect(() => {
                propertyUtilities.registerValueTransform('testName', () => {});
            }).toThrow();
            expect(() => {
                propertyUtilities.registerValueTransform('testName', () => {}, true);
            }).toThrow();
        });
        test('successfully registers the value transform', () => {
            propertyUtilities.registerValueTransform('testName', patternMatcher, dataTransformer);
            const retrieved = propertyUtilities.getValueTransform('testName');
            expect(retrieved.matcher).toBe(patternMatcher);
            expect(retrieved.transformer).toBe(dataTransformer);
        });
        test('registers and overwrites any existing value transforms with the same identifier', () => {
            const newMatcher = () => true;
            const newTransformer = (val) => val;
            propertyUtilities.registerValueTransform('testName', newMatcher, newTransformer);
            const retrieved = propertyUtilities.getValueTransform('testName');
            expect(retrieved.matcher).not.toBe(patternMatcher);
            expect(retrieved.transformer).not.toBe(dataTransformer);
            expect(retrieved.matcher).toBe(newMatcher);
            expect(retrieved.transformer).toBe(newTransformer);
        });
    });

    describe('getTransformationScheme()', () => {
        test('raises an error if the transformation scheme is not registered', () => {
            expect(() => {
                propertyUtilities.getTransform('nonexistentScheme');
            }).toThrow();
        });
        test('returns a copy of the transformation scheme', () => {
            const scheme = propertyUtilities.getTransform('web');
            expect(scheme).toContain('color/rgb');
        });
    });

    describe('transformationSchemeExistenceCheck()', () => {
        test('returns true if the transformation scheme is registered', () => {
            expect(propertyUtilities.transformIsRegistered('web')).toBe(true);
        });
        test('returns false if the transformation scheme is not registered', () => {
            expect(propertyUtilities.transformIsRegistered('nonexistentScheme')).toBe(false);
        });
    });

    describe('transformationSchemeRegistration()', () => {
        test('raises an error if the identifier is not provided or not a string', () => {
            expect(() => {
                propertyUtilities.registerTransform();
            }).toThrow();
            expect(() => {
                propertyUtilities.registerTransform(true);
            }).toThrow();
        });
        test('raises an error if the list of value matchers is not provided or not an array', () => {
            expect(() => {
                propertyUtilities.registerTransform('schemeName');
            }).toThrow();
            expect(() => {
                propertyUtilities.registerTransform('schemeName', true);
            }).toThrow();
        });
        test('raises an error if any of the value transformations are not registered', () => {
            expect(() => {
                propertyUtilities.registerTransform('schemeName', ['unregisteredTransform']);
            }).toThrow();
        });
        test('successfully registers the transformation scheme', () => {
            propertyUtilities.registerTransform('schemeName', ['testName']); // 'testName' was registered earlier
            const retrieved = propertyUtilities.getTransform('schemeName');
            expect(retrieved[0]).toBe('testName');
        });
        test('registers and overwrites any existing transformation schemes', () => {
            propertyUtilities.registerTransform('schemeName', ['color/rgb']);
            const retrieved = propertyUtilities.getTransform('schemeName');
            expect(retrieved[0]).toBe('color/rgb');
        });
    });

    describe('getOutputFormat()', () => {
        test('raises an error if the format is not registered', () => {
            expect(() => {
                propertyUtilities.getFormat('nonexistentFormat');
            }).toThrow();
        });
        test('returns a copy of the format function', () => {
            const formatFunc = propertyUtilities.getFormat('scss');
            expect(typeof formatFunc).toBe('function');
        });
    });

    describe('outputFormatExistenceCheck()', () => {
        test('returns true if the output format is registered', () => {
            expect(propertyUtilities.formatIsRegistered('scss')).toBe(true);
        });
        test('returns false if the output format is not registered', () => {
            expect(propertyUtilities.formatIsRegistered('nonexistentFormat')).toBe(false);
        });
    });

    describe('outputFormatRegistration()', () => {
        const outputFormatter = () => {};
        test('raises an error if the identifier is not provided or not a string', () => {
            expect(() => {
                propertyUtilities.registerFormat();
            }).toThrow();
            expect(() => {
                propertyUtilities.registerFormat(true);
            }).toThrow();
        });
        test('raises an error if the formatter is not provided or not a function', () => {
            expect(() => {
                propertyUtilities.registerFormat('formatName');
            }).toThrow();
            expect(() => {
                propertyUtilities.registerFormat('formatName', true);
            }).toThrow();
        });
        test('successfully registers the format', () => {
            propertyUtilities.registerFormat('formatName', outputFormatter);
            const retrieved = propertyUtilities.getFormat('formatName');
            expect(retrieved).toBe(outputFormatter);
        });
    });

});

describe('propertyManagement.extensions', () => {

    describe('processLegacyProperties()', () => {
        const mockLegacyPath = pathUtil.resolve(__dirname, 'mock', 'legacy.json');
        const mockLegacyAltPath = pathUtil.resolve(__dirname, 'mock', 'legacy-alt.json');

        const customThroughObjTransform = (transformFn) => async (file, enc, next) => {
            try {
                const parsedData = JSON.parse(file.contents.toString());
                const modifiedData = transformFn(parsedData);
                file.contents = Buffer.from(modifiedData);
                next(null, file);
            } catch (e) {
                next(e);
            }
        };

        test('pipes an error if an invalid Design Properties file is encountered', async () => {
            const contentModifier = (json) => '{"invalidJson":}';
            const { issue } = await executeFileSequence(
                [mockLegacyPath],
                [
                    customThroughObjTransform(contentModifier),
                    new StreamAdapter(propertyUtilities.extensions.legacy)
                ]
            );
            expect(isProblem(issue)).toBe(true);
            expect(issue.message).toMatch(/encountered an invalid/);
        });

        test('pipes an error if the Design Properties file is not an object', async () => {
            const contentModifier = (json) => '[]';
            const { issue } = await executeFileSequence(
                [mockLegacyPath],
                [
                    customThroughObjTransform(contentModifier),
                    new StreamAdapter(propertyUtilities.extensions.legacy)
                ]
            );
            expect(isProblem(issue)).toBe(true);
            expect(issue.message).toMatch(/non object/);
        });

        test('pipes an error if a property with no "name" key is found', async () => {
            const contentModifier = (json) => {
                json.theme.properties = [{"value":"red"}];
                return JSON.stringify(json);
            };
            const { issue } = await executeFileSequence(
                [mockLegacyPath],
                [
                    customThroughObjTransform(contentModifier),
                    new StreamAdapter(propertyUtilities.extensions.legacy)
                ]
            );
            expect(isProblem(issue)).toBe(true);
            expect(issue.message).toMatch(/name/);
        });

        test('creates a single JSON file', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            expect(processedFiles.length).toBe(1);
        });

        test('produces valid JSON', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            expect(() => {
                JSON.parse(processedFiles[0].contents.toString());
            }).not.toThrow();
        });

        test('converts legacy design properties to the new format', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(parsedData.props.a.value).toBe('foo');
            expect(parsedData.props.b.value).toBe('bar');
            expect(parsedData.theme).toBeUndefined();
        });

        test('converts legacy aliases to the new format', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(Array.isArray(parsedData.aliases)).toBe(false);
            expect(Object.prototype.hasOwnProperty.call(parsedData.aliases, 'SKY')).toBe(true);
        });

        test('imports legacy aliases', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyAltPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(Array.isArray(parsedData.aliases)).toBe(false);
            expect(Object.prototype.hasOwnProperty.call(parsedData.aliases, 'SKY')).toBe(true);
        });

        test('converts imports to auraImports', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyAltPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(Array.isArray(parsedData.auraImports)).toBe(true);
        });

        test('converts extends to auraExtends', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyAltPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(typeof parsedData.auraExtends).toBe('string');
        });

        test('adds a relevant type if possible', async () => {
            const { processedFiles } = await executeFileSequence(
                [mockLegacyAltPath],
                [new StreamAdapter(propertyUtilities.extensions.legacy)]
            );
            const parsedData = JSON.parse(processedFiles[0].contents.toString());
            expect(parsedData.props.d.type).toBe('color');
            expect(parsedData.props.e.type).toBe('size');
        });
    });

    describe('applyTransformation()', () => {
        test('transforms Design Properties from JSON', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            const { issue } = await executeFileSequence(
                [sampleJsonPath],
                [new StreamAdapter(propertyUtilities.extensions.transform), 'web'] // transform takes an argument
            );
            expect(issue).toBeUndefined();
        });

        test('transforms Design Properties from YML', async () => {
            const sampleYmlPath = pathUtil.resolve(__dirname, 'mock', 'sample.yml');
            const { issue } = await executeFileSequence(
                [sampleYmlPath],
                [new StreamAdapter(propertyUtilities.extensions.transform), 'web'] // transform takes an argument
            );
            expect(issue).toBeUndefined();
        });
    });

    describe('applyFormatting()', () => {
        test('raises an error for invalid options', () => {
            expect(() => {
                propertyUtilities.extensions.format('web', false);
            }).toThrow();
        });

        test('raises an error if options.propsFilter is not a function', () => {
            let caughtError;
            try {
                propertyUtilities.extensions.format('web', { propsFilter: false });
            } catch (e) {
                caughtError = e;
            }
            expect(caughtError).toBeDefined();
            expect(caughtError.message).toMatch(/function/);
        });

        test('formats properties', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            let finalOutput;
            const { processedFiles, issue } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    new StreamAdapter(propertyUtilities.extensions.format.bind(null, 'raw.json')),
                    // The getResult part will be handled by collecting the final file
                ]
            );

            expect(issue).toBeUndefined();
            finalOutput = processedFiles[0].contents.toString();
            expect(() => {
                JSON.parse(finalOutput);
            }).not.toThrow();
        });

        test('filters properties before formatting', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            let finalOutputData;
            const { processedFiles } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    new StreamAdapter(propertyUtilities.extensions.format.bind(null, 'raw.json', { propsFilter: (prop) => prop.name === 'account' }))
                ]
            );

            finalOutputData = JSON.parse(processedFiles[0].contents.toString());
            expect(finalOutputData.propKeys.length).toBe(1);
            expect(Object.keys(finalOutputData.props).length).toBe(1);
            expect(Object.prototype.hasOwnProperty.call(finalOutputData.props, 'account')).toBe(true);
        });

        test('renames the file correctly', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            let resultingFile;
            const customFileCollector = async (file, enc, next) => {
                resultingFile = file;
                next(null, file);
            };

            const { processedFiles } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    new StreamAdapter(propertyUtilities.extensions.format.bind(null, 'scss')),
                    customFileCollector // This is not a StreamAdapter, it's a direct transform
                ]
            );
            expect(resultingFile.relative).toBe('sample.scss');
        });
    });

    describe('retrieveResult()', () => {
        test('gets the result of a transformation', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            const actionMonitor = jest.fn();

            // The getResult plugin is designed to call a callback and pass the file through.
            // We need a custom step that uses the getResult plugin's functionality.
            const customGetResultStep = async (file) => {
                return new Promise((resolve, reject) => {
                    const getResultStream = propertyUtilities.extensions.getResult(actionMonitor);
                    getResultStream.on('data', (outputFile) => resolve(outputFile));
                    getResultStream.on('error', (err) => reject(err));
                    getResultStream.write(file);
                    getResultStream.end();
                });
            };

            const { issue } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    customGetResultStep
                ]
            );

            expect(issue).toBeUndefined();
            expect(actionMonitor).toHaveBeenCalledTimes(1);
            expect(() => {
                JSON.parse(actionMonitor.mock.calls[0][0]);
            }).not.toThrow();
        });

        test('gets the result of a format', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            const actionMonitor = jest.fn();

            const customGetResultStep = async (file) => {
                return new Promise((resolve, reject) => {
                    const getResultStream = propertyUtilities.extensions.getResult(actionMonitor);
                    getResultStream.on('data', (outputFile) => resolve(outputFile));
                    getResultStream.on('error', (err) => reject(err));
                    getResultStream.write(file);
                    getResultStream.end();
                });
            };

            const { issue } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    new StreamAdapter(propertyUtilities.extensions.format.bind(null, 'raw.json')),
                    customGetResultStep
                ]
            );

            expect(issue).toBeUndefined();
            expect(actionMonitor).toHaveBeenCalledTimes(1);
            expect(() => {
                JSON.parse(actionMonitor.mock.calls[0][0]);
            }).not.toThrow();
        });

        test('passes the file through the sequence', async () => {
            const sampleJsonPath = pathUtil.resolve(__dirname, 'mock', 'sample.json');
            const firstMonitor = jest.fn();
            const secondMonitor = jest.fn();

            const customGetResultStep = (monitor) => async (file) => {
                return new Promise((resolve, reject) => {
                    const getResultStream = propertyUtilities.extensions.getResult(monitor);
                    getResultStream.on('data', (outputFile) => resolve(outputFile));
                    getResultStream.on('error', (err) => reject(err));
                    getResultStream.write(file);
                    getResultStream.end();
                });
            };

            const { issue } = await executeFileSequence(
                [sampleJsonPath],
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'web')),
                    new StreamAdapter(propertyUtilities.extensions.format.bind(null, 'raw.json')),
                    customGetResultStep(firstMonitor),
                    customGetResultStep(secondMonitor)
                ]
            );

            expect(issue).toBeUndefined();
            expect(firstMonitor).toHaveBeenCalledTimes(1);
            expect(secondMonitor).toHaveBeenCalledTimes(1);
        });
    });

    describe('produceDifferenceLog()', () => {
        let producedFiles;
        beforeEach(async () => {
            const sourceFiles = [
                pathUtil.resolve(__dirname, 'mock', 'a.json'),
                pathUtil.resolve(__dirname, 'mock', 'b.json')
            ];
            const { processedFiles, issue } = await executeFileSequence(
                sourceFiles,
                [
                    new StreamAdapter(propertyUtilities.extensions.transform.bind(null, 'ios')),
                    new StreamAdapter(propertyUtilities.extensions.diff)
                ]
            );
            producedFiles = processedFiles;
            expect(issue).toBeUndefined(); // Ensure no error during setup
        });

        test('creates a single change log', () => {
            expect(producedFiles.length).toBe(1);
        });

        test('produces valid JSON', () => {
            expect(() => {
                JSON.parse(producedFiles[0].contents.toString());
            }).not.toThrow();
        });
    });
});