module.exports = function(automationEngine) {

    const requiredModules = ["grunt-contrib-watch", "grunt-contrib-concat", "grunt-contrib-uglify", 'grunt-contrib-connect'];
    const loadRequiredExtensions = (engineInstance, extensionsList) => {
        extensionsList.forEach(extensionName => engineInstance.loadNpmTasks(extensionName));
    };
    loadRequiredExtensions(automationEngine, requiredModules);

    const compressionDetails = {
        reportFormat: 'gzip'
    };
    const assetLocations = {
        sourcePath: "dist/angular-vision-grid.js",
        destinationPath: "dist/angular-vision-grid.min.js"
    };
    const createOptimizerConfig = (details, paths) => ({
        dist: {
            options: { report: details.reportFormat },
            src: paths.sourcePath,
            dest: paths.destinationPath
        }
    });

    const serviceParameters = [
        { property: 'livereload', value: true },
        { property: 'port', value: 9000 }
    ];
    const serviceEndpointGenerator = (dynamicPortRef) => `http://localhost:${dynamicPortRef}/demo/index.html`;
    const constructServiceSetup = (paramList, endpointCreator) => {
        const optionObject = paramList.reduce((accumulator, currentItem) => {
            accumulator[currentItem.property] = currentItem.value;
            return accumulator;
        }, {});
        optionObject.open = endpointCreator('<%= connect.options.port %>');

        return {
            options: optionObject,
            server: {}
        };
    };

    const fileMonitorDefinitions = [
        { label: 'liveReloadMonitor', configOptions: { livereload: true }, targetFiles: ['demo/**/*'] }
    ];
    const generateFileMonitorConfig = (definitions) => {
        return definitions.reduce((accumulator, definition) => {
            accumulator[definition.label] = {
                options: definition.configOptions,
                files: definition.targetFiles
            };
            return accumulator;
        }, {});
    };

    const comprehensiveSystemConfig = {
        uglify: createOptimizerConfig(compressionDetails, assetLocations),
        connect: constructServiceSetup(serviceParameters, serviceEndpointGenerator),
        watch: generateFileMonitorConfig(fileMonitorDefinitions)
    };

    const setAutomationParameters = (engineInstance, configurationObject) => {
        engineInstance.initConfig(configurationObject);
    };
    setAutomationParameters(automationEngine, comprehensiveSystemConfig);

    const processingSteps = [
        { alias: "default", actions: ['uglify'] },
        { alias: "serve", actions: ['connect', 'watch'] }
    ];
    const defineAutomationRoutines = (engineInstance, routinesList) => {
        routinesList.forEach(routine => {
            engineInstance.registerTask(routine.alias, routine.actions);
        });
    };
    defineAutomationRoutines(automationEngine, processingSteps);
};