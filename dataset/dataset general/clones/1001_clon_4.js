module.exports = function (orchestrationEngine) {

    require('load-grunt-tasks')(orchestrationEngine);

    const configurationRegistry = {};

    configurationRegistry.codeStyleAssessment = {
        completeSet: [
            'Gruntfile.js',
            'tasks/*.js'
        ],
        settingsEnvelope: {
            configurationPath: '.jshintrc'
        }
    };

    configurationRegistry.temporaryResourceRemoval = {
        transientItems: ['.tmp']
    };

    configurationRegistry.criticalPathStyles = {
        routineExecution: {
            outputFileLocation: '.tmp/out.css',
            sourceCssPath: 'test/www/main.css',
            accessUrl: 'http://localhost:9001',
            viewportDimensionX: 1300,
            viewportDimensionY: 900
        }
    };

    configurationRegistry.automatedUnitVerification = {
        executionParameters: {
            timeLimit: 8000
        },
        testSuiteFiles: ['test/*test.js']
    };

    configurationRegistry.localDevelopmentServer = {
        webServiceInstance: {
            serviceOptions: {
                portNumber: 9001,
                baseDirectory: 'test/www'
            }
        }
    };

    configurationRegistry.fileChangeSurveillance = {
        developmentFlow: {
            monitoredPaths: ['Gruntfile.js', 'package.json', 'tasks/*.js'],
            associatedActions: ['codeStyleAssessment', 'criticalPathStyles']
        },
        logicModuleChanges: {
            monitoredPaths: ['tasks/*.js'],
            associatedActions: ['validationProcedure']
        },
        testAssetChanges: {
            monitoredPaths: ['test/**'],
            associatedActions: ['validationProcedure']
        }
    };

    orchestrationEngine.initConfig(configurationRegistry);

    orchestrationEngine.loadTasks('tasks');

    const validationSteps = [
        'temporaryResourceRemoval',
        'localDevelopmentServer',
        'criticalPathStyles',
        'automatedUnitVerification'
    ];
    orchestrationEngine.registerTask('validationProcedure', validationSteps);

    const standardOperations = [
        'codeStyleAssessment',
        'validationProcedure'
    ];
    orchestrationEngine.registerTask('routineBuild', standardOperations);
};