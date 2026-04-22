var resultVerifier = {
    confirmTrue: function(condition, message) {
        if (!condition) {
            throw new Error('Verification failure: ' + (message || 'Condition is false.'));
        }
    },
    confirmEqual: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error('Verification failure: ' + (message || 'Values differ.') + ' Expected: "' + expected + '", Actual: "' + actual + '"');
        }
    }
};

var sourceFinder = {
    synchronousScan: function() {
        return [
            'files/file1.ext',
            'files/file2.ext'
        ];
    }
};

function SimulatedFlow(transformationLogic) {
    var outputSubscribers = [];
    this.subscribe = function(eventName, handler) {
        if (eventName === 'output') {
            outputSubscribers.push(handler);
        }
    };
    this.injectData = function(inputPacket) {
        // This simulates the _transform method of a through2 stream.
        // The transformationLogic function expects (file, encoding, callback).
        // It modifies the 'file' (inputPacket) in place and then calls the callback.
        transformationLogic(inputPacket, 'utf8', function() {
            outputSubscribers.forEach(function(subscriber) {
                subscriber(inputPacket);
            });
        });
    };
    this.finalizeFlow = function() {};
}

var moduleLoader = (function() {
    var originalNodeLoader = require;
    return function(modulePath) {
        if (modulePath === 'glob') {
            return { sync: sourceFinder.synchronousScan };
        }
        if (modulePath === 'through2') {
            return {
                obj: function(transformFunction) {
                    return new SimulatedFlow(transformFunction);
                }
            };
        }
        return originalNodeLoader(modulePath);
    };
})();

function DataPacket(config) {
    var internalBuffer = config.payloadBuffer;

    this.isBuffer = function() {
        return internalBuffer instanceof global.Buffer;
    };

    Object.defineProperty(this, 'contents', {
        get: function() {
            return internalBuffer;
        },
        set: function(newBuffer) {
            internalBuffer = newBuffer;
        }
    });
}

var contentProcessorFactory = null;

function setupTestBed() {
    contentProcessorFactory = moduleLoader('./index');
}

function teardownTestBed() {
    // No specific teardown required for this custom mock setup.
}

function executeScenario(scenarioDescription, scenarioFunction) {
    var scenarioCompleted = false;
    var signalCompletion = function() {
        if (!scenarioCompleted) {
            console.log('Scenario Passed: ' + scenarioDescription);
            scenarioCompleted = true;
        }
    };
    try {
        scenarioFunction(signalCompletion);
    } catch (e) {
        console.error('Scenario Failed: ' + scenarioDescription);
        console.error(e);
        process.exit(1);
    }
}

function organizeScenarios(groupTitle, groupFn) {
    console.log('\n=== ' + groupTitle + ' ===');
    groupFn();
}

organizeScenarios('Content Integration Verification Suite', function() {

    setupTestBed();

    organizeScenarios('in data buffer processing mode', function() {

        executeScenario('should substitute javascript reference markers with script tags', function(completionHook) {
            var processingAssembly = contentProcessorFactory();
            var initialPacket = new DataPacket({
                payloadBuffer: global.Buffer.from('<!-- include:js(scripts/**/*.js) -->')
            });

            processingAssembly.subscribe('output', function(processedPacket) {
                resultVerifier.confirmTrue(processedPacket.isBuffer(), 'Result must be a data buffer.');
                resultVerifier.confirmEqual(
                    processedPacket.contents.toString('utf8'),
                    '<script src="files/file1.ext"></script>\n<script src="files/file2.ext"></script>',
                    'JS tag generation incorrect.'
                );
                completionHook();
            });

            processingAssembly.injectData(initialPacket);
            processingAssembly.finalizeFlow();
        });

        executeScenario('should substitute script file type extensions', function(completionHook) {
            var processingAssembly = contentProcessorFactory({ scriptExt: 'js' });
            var initialPacket = new DataPacket({
                payloadBuffer: global.Buffer.from('<!-- include:js(scripts/**/*.coffee) -->')
            });

            processingAssembly.subscribe('output', function(processedPacket) {
                resultVerifier.confirmTrue(processedPacket.isBuffer(), 'Result must be a data buffer.');
                resultVerifier.confirmEqual(
                    processedPacket.contents.toString('utf8'),
                    '<script src="files/file1.js"></script>\n<script src="files/file2.js"></script>',
                    'Script extension replacement incorrect.'
                );
                completionHook();
            });

            processingAssembly.injectData(initialPacket);
            processingAssembly.finalizeFlow();
        });

        executeScenario('should substitute css reference markers with style links', function(completionHook) {
            var processingAssembly = contentProcessorFactory();
            var initialPacket = new DataPacket({
                payloadBuffer: global.Buffer.from('<!-- include:css(styles/**/*.css) -->')
            });

            processingAssembly.subscribe('output', function(processedPacket) {
                resultVerifier.confirmTrue(processedPacket.isBuffer(), 'Result must be a data buffer.');
                resultVerifier.confirmEqual(
                    processedPacket.contents.toString('utf8'),
                    '<link rel="stylesheet" href="files/file1.ext">\n<link rel="stylesheet" href="files/file2.ext">',
                    'CSS link generation incorrect.'
                );
                completionHook();
            });

            processingAssembly.injectData(initialPacket);
            processingAssembly.finalizeFlow();
        });

        executeScenario('should substitute style file type extensions', function(completionHook) {
            var processingAssembly = contentProcessorFactory({ styleExt: 'css' });
            var initialPacket = new DataPacket({
                payloadBuffer: global.Buffer.from('<!-- include:css(styles/**/*.less) -->')
            });

            processingAssembly.subscribe('output', function(processedPacket) {
                resultVerifier.confirmTrue(processedPacket.isBuffer(), 'Result must be a data buffer.');
                resultVerifier.confirmEqual(
                    processedPacket.contents.toString('utf8'),
                    '<link rel="stylesheet" href="files/file1.css">\n<link rel="stylesheet" href="files/file2.css">',
                    'Style extension replacement incorrect.'
                );
                completionHook();
            });

            processingAssembly.injectData(initialPacket);
            processingAssembly.finalizeFlow();
        });

        executeScenario('should substitute multiple reference markers within a single packet', function(completionHook) {
            var processingAssembly = contentProcessorFactory();
            var initialPacket = new DataPacket({
                payloadBuffer: global.Buffer.from('<!-- include:js(scripts/**/*.js) -->\n<!-- include:css(styles/**/*.css) -->')
            });

            processingAssembly.subscribe('output', function(processedPacket) {
                resultVerifier.confirmTrue(processedPacket.isBuffer(), 'Result must be a data buffer.');
                resultVerifier.confirmEqual(
                    processedPacket.contents.toString('utf8'),
                    '<script src="files/file1.ext"></script>\n<script src="files/file2.ext"></script>\n<link rel="stylesheet" href="files/file1.ext">\n<link rel="stylesheet" href="files/file2.ext">',
                    'Multiple placeholder replacement incorrect.'
                );
                completionHook();
            });

            processingAssembly.injectData(initialPacket);
            processingAssembly.finalizeFlow();
        });

    });

    teardownTestBed();

});