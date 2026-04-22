module.exports = function (gruntInstance) {
    require('load-grunt-tasks')(gruntInstance);

    const sourceStylesPath = 'source_files/styles.less';
    const sourceScriptsPath = 'source_files/logic.js';
    const minifiedStyleOutput = 'distribution/styles.min.css';
    const unminifiedStyleOutput = 'distribution/styles.css';
    const minifiedScriptOutput = 'distribution/logic.min.js';

    const jobManifest = [
        {
            operationType: 'stylesheet_processor',
            jobIdentifier: 'minified_output',
            jobOptions: {
                compressionEnabled: true,
                yuiEnabled: true,
                optimisationLevel: 2
            },
            inputFiles: [sourceStylesPath],
            outputFile: minifiedStyleOutput
        },
        {
            operationType: 'stylesheet_processor',
            jobIdentifier: 'unminified_output',
            jobOptions: {},
            inputFiles: [sourceStylesPath],
            outputFile: unminifiedStyleOutput
        },
        {
            operationType: 'javascript_minifier',
            jobIdentifier: 'release_build',
            jobOptions: {
                obfuscateNames: true,
                generateMap: true,
                compressPayload: true,
                preserveCodeComments: false
            },
            inputFiles: [sourceScriptsPath],
            outputFile: minifiedScriptOutput
        },
        {
            operationType: 'javascript_linter',
            jobIdentifier: 'code_quality',
            inputFiles: [sourceScriptsPath]
        }
    ];

    const processStylesheet = (descriptorEntry) => {
        const taskOptions = {};
        if (descriptorEntry.jobOptions.compressionEnabled) taskOptions.compress = true;
        if (descriptorEntry.jobOptions.yuiEnabled) taskOptions.yuicompress = true;
        if (descriptorEntry.jobOptions.optimisationLevel) taskOptions.optimization = descriptorEntry.jobOptions.optimisationLevel;

        const filesConfig = {};
        filesConfig[descriptorEntry.outputFile] = descriptorEntry.inputFiles;

        return { options: taskOptions, files: filesConfig };
    };

    const processJavascript = (descriptorEntry) => {
        const taskOptions = {};
        if (descriptorEntry.jobOptions.obfuscateNames) taskOptions.mangle = true;
        if (descriptorEntry.jobOptions.generateMap) taskOptions.sourceMap = true;
        if (descriptorEntry.jobOptions.compressPayload) taskOptions.compress = true;
        taskOptions.preserveComments = descriptorEntry.jobOptions.preserveCodeComments;

        const filesConfig = {};
        filesConfig[descriptorEntry.outputFile] = descriptorEntry.inputFiles;

        return { options: taskOptions, files: filesConfig };
    };

    const processLinting = (descriptorEntry) => {
        return { source: descriptorEntry.inputFiles };
    };

    const assembledConfiguration = {};
    assembledConfiguration.less = {};
    assembledConfiguration.uglify = {};
    assembledConfiguration.jshint = {};

    jobManifest.forEach(descriptorEntry => {
        switch (descriptorEntry.operationType) {
            case 'stylesheet_processor':
                assembledConfiguration.less[descriptorEntry.jobIdentifier] = processStylesheet(descriptorEntry);
                break;
            case 'javascript_minifier':
                assembledConfiguration.uglify[descriptorEntry.jobIdentifier] = processJavascript(descriptorEntry);
                break;
            case 'javascript_linter':
                assembledConfiguration.jshint[descriptorEntry.jobIdentifier] = processLinting(descriptorEntry);
                break;
        }
    });

    gruntInstance.initConfig(assembledConfiguration);

    const defaultOperationSequence = ['uglify', 'less'];
    gruntInstance.registerTask('default', defaultOperationSequence);
};