const processSteps = [
    {
        operationName: 'linterTool',
        subOperation: 'entireCollection',
        pluginRef: 'grunt-jslint',
        configPayload: {
            sourceFiles: ['backbone.router.title.helper.js'],
            ruleSettings: {
                namingRequirement: true,
                allowedGlobals: ['document', 'jQuery', 'Backbone', '_']
            }
        }
    },
    {
        operationName: 'testExecutor',
        subOperation: 'allScenarios',
        pluginRef: 'grunt-mocha-phantomjs',
        configPayload: ['test/*.html']
    },
    {
        operationName: 'codeCompressor',
        subOperation: 'optimizedOutput',
        pluginRef: 'grunt-contrib-uglify',
        configPayload: {
            inputPath: '<%= projectDetails.name %>.js',
            outputPath: '<%= projectDetails.name %>.min.js'
        }
    }
];

const primaryExecutionFlow = ['linterTool', 'testExecutor', 'codeCompressor'];

module.exports = (buildUtility) => {
    const projectInformation = buildUtility.file.fetchJSON('package.json');

    const generatedSettings = processSteps.reduce((accumulator, currentStep) => {
        accumulator[currentStep.operationName] = accumulator[currentStep.operationName] || {};
        if (currentStep.operationName === 'linterTool') {
            accumulator[currentStep.operationName][currentStep.subOperation] = {
                src: currentStep.configPayload.sourceFiles,
                directives: {
                    nomen: currentStep.configPayload.ruleSettings.namingRequirement,
                    predef: currentStep.configPayload.ruleSettings.allowedGlobals
                }
            };
        } else if (currentStep.operationName === 'testExecutor') {
            accumulator[currentStep.operationName][currentStep.subOperation] = currentStep.configPayload;
        } else if (currentStep.operationName === 'codeCompressor') {
            accumulator[currentStep.operationName][currentStep.subOperation] = {
                src: currentStep.configPayload.inputPath,
                dest: currentStep.configPayload.outputPath
            };
        }
        return accumulator;
    }, {});

    generatedSettings.projectDetails = projectInformation;

    buildUtility.initializeConfiguration(generatedSettings);

    processSteps.forEach(step => {
        buildUtility.bringInModule(step.pluginRef);
    });

    buildUtility.defineProcedure('standardWorkflow', primaryExecutionFlow);
};