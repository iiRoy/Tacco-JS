const visualContentSynthesizer = require('../index.js');
const fileOutputGenerator = require('fs').createWriteStream;
const currentExecutionPath = __dirname;

const documentTransformer = {
    createConversionProcess: (outputFormat, initialSource) => {
        const underlyingProcess = visualContentSynthesizer.spawn(outputFormat, initialSource);
        return {
            getStreamForOutput: () => underlyingProcess.stdout,
            getStreamForInput: () => underlyingProcess.stdin,
            getProcessInstance: () => underlyingProcess
        };
    },
    connectStreams: (source, destination) => {
        source.pipe(destination);
    }
};

async function performDocumentCreation(specification) {
    return new Promise((completionCallback, errorCallback) => {
        let activeConversion;
        let contentInputChannel;

        if (specification.kind === 'url' || specification.kind === 'file') {
            activeConversion = documentTransformer.createConversionProcess('pdf', specification.source);
        } else if (specification.kind === 'string') {
            activeConversion = documentTransformer.createConversionProcess('pdf');
            contentInputChannel = activeConversion.getStreamForInput();
            contentInputChannel.end(specification.source, 'utf-8');
        } else {
            return errorCallback(new Error(`Unsupported content type: ${specification.kind}`));
        }

        const outputTarget = fileOutputGenerator(specification.destinationFile);
        documentTransformer.connectStreams(activeConversion.getStreamForOutput(), outputTarget);

        outputTarget.on('finish', () => completionCallback(`Artifact ${specification.destinationFile} rendered.`));
        outputTarget.on('error', (err) => errorCallback(new Error(`Output write failure for ${specification.destinationFile}: ${err.message}`)));
        activeConversion.getProcessInstance().on('error', (err) => errorCallback(new Error(`Conversion engine failure for ${specification.destinationFile}: ${err.message}`)));
    });
}

const processingInstructions = [
    {
        kind: 'url',
        source: 'http://nodejs.org/api/all.html',
        destinationFile: currentExecutionPath + "/webpageAsDocument.pdf"
    },
    {
        kind: 'file',
        source: currentExecutionPath + '/sample_content.html',
        destinationFile: currentExecutionPath + "/localFileAsDocument.pdf"
    },
    {
        kind: 'string',
        source: '<h2>Programmatic Content</h2><p>This paragraph illustrates content provided directly as a text block for document generation.</p>',
        destinationFile: currentExecutionPath + "/textBlockAsDocument.pdf"
    }
];

(async () => {
    for (const instruction of processingInstructions) {
        try {
            await performDocumentCreation(instruction);
        } catch (problem) {
            // Error handling for each conversion task would go here.
            // For this example, we simply absorb the error to allow other tasks to proceed.
        }
    }
})();