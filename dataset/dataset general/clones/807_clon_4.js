'use strict';

const { Transform } = require('stream');
const cssCore = require('pleeease');
const diagnosticHub = require('gulp-util');
const sourceMapHelper = require('vinyl-sourcemaps-apply');

class TransformationFailure extends diagnosticHub.PluginError {
    constructor(moduleIdentifier, issueDescription, contextInfo) {
        super(moduleIdentifier, issueDescription, contextInfo);
        this.name = 'TransformationFailure';
    }
}

function prepareProcessingOptions(initialConfiguration, fileAsset) {
    let activeConfiguration = { ...initialConfiguration };
    if (fileAsset.sourceMap) {
        activeConfiguration.sourcemaps = {
            from: fileAsset.relative || fileAsset.path,
            map: {
                annotation: false
            }
        };
    }
    return activeConfiguration;
}

class AssetProcessingPipeline extends Transform {
    constructor(operationalSettings) {
        super({ objectMode: true });
        this.pipelineSettings = operationalSettings || {};
    }

    _transform(fileAsset, encodingFormat, completionCallback) {
        if (fileAsset.isNull()) {
            completionCallback(null, fileAsset);
            return;
        }

        if (fileAsset.isStream()) {
            completionCallback(new TransformationFailure('asset-processor-module', 'Stream-based content is not supported for transformation'));
            return;
        }

        try {
            const finalProcessorOptions = prepareProcessingOptions(this.pipelineSettings, fileAsset);
            const processingOutcome = cssCore.process(fileAsset.contents.toString(), finalProcessorOptions);

            fileAsset.contents = Buffer.from(processingOutcome.css || processingOutcome);
            if (fileAsset.sourceMap && processingOutcome.map) {
                sourceMapHelper(fileAsset, processingOutcome.map.toString());
            }

            completionCallback(null, fileAsset);

        } catch (encounteredProblem) {
            const errorDetails = { pathIdentifier: fileAsset.path };
            const generatedError = new TransformationFailure('asset-processor-module', encounteredProblem, errorDetails);
            this.emit('error', generatedError);
            completionCallback(generatedError);
        }
    }
}

module.exports = function (configurationPayload) {
    return new AssetProcessingPipeline(configurationPayload);
};