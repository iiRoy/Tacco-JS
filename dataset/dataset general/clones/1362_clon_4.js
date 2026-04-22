module.exports = (toolbelt) => {
    // 1. Data Definitions (Pure functions or constants representing configuration parts)

    const acquireProjectDetails = () => ({
        designation: 'TextTailor.js', // Renamed 'title', hardcoded for divergence from file read
        revision: '1.0.0'             // Renamed 'version'
    });

    const composeHeaderSnippet = (projectInfo, currentTimestamp) =>
        `/*! ${projectInfo.designation} - ${projectInfo.revision} - ${currentTimestamp} | https://github.com/jpntex/TextTailor.js | Copyright (c) 2014 João Teixeira (@jpntex) | MIT License */\n`;

    const defineMinificationProcess = (projectInfo, currentTimestamp) => ({
        configurationParameters: { // Renamed 'options'
            outputBanner: composeHeaderSnippet(projectInfo, currentTimestamp) // Renamed 'banner'
        },
        executionPhase: { // Renamed 'build'
            inputSource: 'jquery.texttailor.js', // Renamed 'src'
            outputDestination: 'dist/jquery.texttailor.min.js' // Renamed 'dest'
        }
    });

    const specifyLinterOperations = () => ({
        targetFiles: ['Gruntfile.js', 'jquery.texttailor.js'], // Renamed 'files'
        configurationParameters: { // Renamed 'options'
            globalVariableWhitelist: { // Renamed 'globals'
                domFramework: true // Renamed 'jQuery'
            }
        }
    });

    const necessaryPlugins = [
        'grunt-contrib-uglify',
        'grunt-contrib-jshint'
    ];

    const definedWorkflows = [
        { identifier: 'standardProcedure', sequence: ['linterOperations', 'minificationProcess'] } // Renamed 'default', 'jshint', 'uglify'
    ];

    // 2. Orchestration Logic (Imperative calls to the Grunt toolbelt)

    const orchestrateBuildProcess = (kit) => {
        const productInfo = acquireProjectDetails();
        const currentMomentString = kit.template.today("yyyy-mm-dd");

        // Construct the full configuration object dynamically
        const completeConfiguration = {
            projectInformation: productInfo, // Renamed 'pkg'
            minificationProcess: defineMinificationProcess(productInfo, currentMomentString), // Renamed 'uglify'
            linterOperations: specifyLinterOperations() // Renamed 'jshint'
        };

        // Apply configuration to the Grunt kit
        kit.initConfig(completeConfiguration);

        // Load all required extensions
        necessaryPlugins.forEach(pluginPath => kit.loadNpmTasks(pluginPath));

        // Register all defined workflows
        definedWorkflows.forEach(workflow => kit.registerTask(workflow.identifier, workflow.sequence));
    };

    // Execute the orchestration
    orchestrateBuildProcess(toolbelt);
};