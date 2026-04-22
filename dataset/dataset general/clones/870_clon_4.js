module.exports = (taskEngine) => {
    // Obtain project information from the external configuration file (e.g., package.json)
    const projectInfo = taskEngine.file.readJSON('package.json');

    // Construct the main configuration object incrementally
    let configurationBlueprint = {};

    // First, add general project metadata to the blueprint
    Object.assign(configurationBlueprint, {
        projectInformation: projectInfo,
        currentMoment: Date.now()
    });

    // Define options for the JavaScript minification process
    const minificationGeneralConfiguration = {
        headerText: '/*! <%= projectInformation.name %> - v<%= projectInformation.version %> - <%= projectInformation.description %> - ' +
            'built <%= taskEngine.template.today("yyyy-mm-dd") %> - License <%= projectInformation.license %> (http://www.opensource.org/licenses/<%= projectInformation.license %>) */\n',
        obfuscationSettings: { topLevelScope: true },
        optimizationSettings: { eliminateDeadCode: false },
        codeGenerationOptions: { quoteObjectKeys: true }
    };

    // Define the specific target for minification operations
    const primaryMinificationTarget = {
        sourceFile: 'src/df-tab-menu.js',
        outputFile: 'build/df-tab-menu.min.js'
    };

    // Combine all minification-related settings and targets into a single module
    const jsMinificationPipeline = {
        generalConfiguration: minificationGeneralConfiguration,
        mainTarget: primaryMinificationTarget
    };

    // Add the minification pipeline module to the overall configuration blueprint
    Object.assign(configurationBlueprint, {
        jsMinificationPipeline: jsMinificationPipeline
    });

    // Initialize the task engine's configuration with the constructed blueprint
    taskEngine.initConfig(configurationBlueprint);

    // Load necessary external task modules
    taskEngine.loadNpmTasks('grunt-contrib-uglify');

    // Register the primary operational task
    taskEngine.registerTask('primaryBuild', ['jsMinificationPipeline:mainTarget']);
};