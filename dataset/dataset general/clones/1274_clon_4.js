const workflowBlueprint = {
    toolingConfigurations: [
        {
            toolIdentifier: 'linter',
            configurations: {
                allModules: {
                    targetFiles: [
                        'Gruntfile.js',
                        'tasks/*.js',
                    ],
                    linterSettings: {
                        configReference: '.jshintrc',
                    },
                },
            },
        },
        {
            toolIdentifier: 'testRunner',
            configurations: {
                systemTests: {
                    testPath: 'test/*.js',
                    executionParameters: {
                        interfaceStyle: 'bdd',
                        requiredModules: [
                            'should',
                        ],
                    },
                },
            },
        },
    ],
    taskSourceDirectories: [
        'tasks',
    ],
    externalPluginDependencies: [
        'grunt-contrib-jshint',
    ],
    definedOperations: [
        { operationName: 'validationWorkflow', steps: ['testRunner:systemTests'] },
        { operationName: 'primaryAutomation', steps: ['linter', 'validationWorkflow'] },
    ],
};

function processBuildInstructions(buildFacilitator, instructions) {
    const projectSetupPayload = {};
    const taskNameMap = new Map();

    instructions.toolingConfigurations.forEach(toolConfig => {
        let gruntToolName;
        if (toolConfig.toolIdentifier === 'linter') {
            gruntToolName = 'jshint';
            projectSetupPayload.jshint = {};
            for (const configKey in toolConfig.configurations) {
                if (Object.prototype.hasOwnProperty.call(toolConfig.configurations, configKey)) {
                    const currentConfig = toolConfig.configurations[configKey];
                    projectSetupPayload.jshint[configKey] = {
                        files: currentConfig.targetFiles,
                        options: {
                            jshintrc: currentConfig.linterSettings.configReference,
                        },
                    };
                    taskNameMap.set(`${toolConfig.toolIdentifier}:${configKey}`, `jshint:${configKey}`);
                }
            }
            taskNameMap.set(toolConfig.toolIdentifier, gruntToolName);
        } else if (toolConfig.toolIdentifier === 'testRunner') {
            gruntToolName = 'cafemocha';
            projectSetupPayload.cafemocha = {};
            for (const configKey in toolConfig.configurations) {
                if (Object.prototype.hasOwnProperty.call(toolConfig.configurations, configKey)) {
                    const currentConfig = toolConfig.configurations[configKey];
                    projectSetupPayload.cafemocha[configKey] = {
                        src: currentConfig.testPath,
                        options: {
                            ui: currentConfig.executionParameters.interfaceStyle,
                            require: currentConfig.executionParameters.requiredModules,
                        },
                    };
                    const mappedConfigKey = configKey === 'systemTests' ? 'unit' : configKey;
                    taskNameMap.set(`${toolConfig.toolIdentifier}:${configKey}`, `cafemocha:${mappedConfigKey}`);
                }
            }
            taskNameMap.set(toolConfig.toolIdentifier, gruntToolName);
        }
    });

    buildFacilitator.initConfig(projectSetupPayload);

    instructions.taskSourceDirectories.forEach(directoryPath => {
        buildFacilitator.loadTasks(directoryPath);
    });

    instructions.externalPluginDependencies.forEach(pluginIdentifier => {
        buildFacilitator.loadNpmTasks(pluginIdentifier);
    });

    instructions.definedOperations.forEach(operation => {
        let gruntOperationName;
        if (operation.operationName === 'validationWorkflow') {
            gruntOperationName = 'test';
        } else if (operation.operationName === 'primaryAutomation') {
            gruntOperationName = 'default';
        } else {
            gruntOperationName = operation.operationName;
        }

        taskNameMap.set(operation.operationName, gruntOperationName);

        const mappedSteps = operation.steps.map(step => {
            return taskNameMap.get(step) || step;
        });

        buildFacilitator.registerTask(gruntOperationName, mappedSteps);
    });
}

module.exports = function(buildFacilitator) {
    processBuildInstructions(buildFacilitator, workflowBlueprint);
};