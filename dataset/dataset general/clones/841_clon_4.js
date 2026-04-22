const isObjectLiteralValue = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
const createShallowCopy = (obj) => ({ ...obj });
const combineObjects = (obj1, obj2) => ({ ...obj1, ...obj2 });

const parseOperationArguments = (args) => {
    let sourceInput = undefined;
    let targetInput = undefined;
    let operationConfig = {};
    let resultHandler = undefined;

    const currentArguments = Array.from(args);

    for (let i = currentArguments.length - 1; i >= 0; i--) {
        if (typeof currentArguments[i] === 'function') {
            resultHandler = currentArguments[i];
            currentArguments.splice(i, 1);
            break;
        }
    }

    if (currentArguments.length === 1) {
        const arg = currentArguments[0];
        if (isObjectLiteralValue(arg)) {
            operationConfig = arg;
            sourceInput = arg.src || arg.target;
            targetInput = arg.dest || arg.output;
        } else if (typeof arg === 'string' || Array.isArray(arg)) {
            sourceInput = arg;
        }
    } else if (currentArguments.length === 2) {
        const arg1 = currentArguments[0];
        const arg2 = currentArguments[1];
        if ((typeof arg1 === 'string' || Array.isArray(arg1)) && isObjectLiteralValue(arg2)) {
            sourceInput = arg1;
            operationConfig = arg2;
        } else if ((typeof arg1 === 'string' || Array.isArray(arg1)) && (typeof arg2 === 'string' || Array.isArray(arg2))) {
            sourceInput = arg1;
            targetInput = arg2;
        }
    } else if (currentArguments.length >= 3) {
        sourceInput = currentArguments[0];
        targetInput = currentArguments[1];
        operationConfig = currentArguments[2];
    }

    return { sourceInput, targetInput, operationConfig, resultHandler };
};

const generateTaskDescriptors = (initialSources, initialTargets, baseConfiguration) => {
    let finalSources = [];
    let finalTargets = [];
    let effectiveConfig = isObjectLiteralValue(baseConfiguration) ? createShallowCopy(baseConfiguration) : {};

    if (initialSources && isObjectLiteralValue(initialSources)) {
        effectiveConfig = initialSources;
        finalSources.push(effectiveConfig.src || effectiveConfig.target);
        finalTargets.push(effectiveConfig.dest || effectiveConfig.output);
    } else if (typeof initialSources === 'string') {
        finalSources.push(initialSources);
        finalTargets.push(initialTargets);
    } else if (Array.isArray(initialSources)) {
        finalSources = initialSources;
        finalTargets = initialTargets;
    } else {
        finalSources = [];
        finalTargets = [];
    }

    return finalSources.map((singleSourcePath, index) => ({
        inputLocation: singleSourcePath,
        outputLocation: Array.isArray(finalTargets) ? (finalTargets[index] || '') : (finalTargets || ''),
        configSettings: effectiveConfig
    }));
};

const executeConcurrentOperations = (taskDescriptors, singleTaskProcessor) => {
    const promiseOperations = taskDescriptors.map(descriptor => {
        return new Promise((resolve, reject) => {
            singleTaskProcessor({
                src: descriptor.inputLocation,
                dest: descriptor.outputLocation,
                options: descriptor.configSettings
            }, (processingError, processingResult) => {
                if (processingError) {
                    return reject(processingError);
                }
                resolve(processingResult);
            });
        });
    });
    return Promise.all(promiseOperations);
};

const StyleCombiner = require('./combiner');
const packageInformation = require('../package.json');

const exportedFunctions = {
    composeStylesheets: function(...args) {
        const { sourceInput, targetInput, operationConfig, resultHandler } = parseOperationArguments(args);

        const descriptors = generateTaskDescriptors(sourceInput, targetInput, operationConfig);

        const processorFunction = (payload, doneCallback) => {
            const finalConfiguration = combineObjects(payload.options, {
                src: payload.src,
                dest: payload.dest
            });
            new StyleCombiner(finalConfiguration).build(doneCallback);
        };

        executeConcurrentOperations(descriptors, processorFunction)
            .then(outcomes => {
                if (resultHandler) {
                    resultHandler(null, outcomes);
                }
            })
            .catch(errorEncountered => {
                if (resultHandler) {
                    resultHandler(errorEncountered);
                } else {
                    console.error("Error during stylesheet composition:", errorEncountered);
                }
            });
    },

    inspectStylesheets: function(...args) {
        const { sourceInput, operationConfig, resultHandler } = parseOperationArguments(args);

        const descriptors = generateTaskDescriptors(sourceInput, '', operationConfig);

        const processorFunction = (payload, doneCallback) => {
            const finalConfiguration = combineObjects(payload.options, {
                src: payload.src,
                dest: payload.dest
            });
            new StyleCombiner(finalConfiguration).analyze(doneCallback);
        };

        executeConcurrentOperations(descriptors, processorFunction)
            .then(outcomes => {
                if (resultHandler) {
                    resultHandler(null, outcomes);
                }
            })
            .catch(errorEncountered => {
                if (resultHandler) {
                    resultHandler(errorEncountered);
                } else {
                    console.error("Error during stylesheet inspection:", errorEncountered);
                }
            });
    },

    toolVersion: packageInformation.version
};

module.exports = exportedFunctions;