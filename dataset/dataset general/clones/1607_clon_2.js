exportObject = function (toolKit) {
    // This is the main configuration block for the development toolkit.
    toolKit.initializeConfiguration({
        // Project metadata, read from the manifest file.
        projectData: toolKit.fsUtility.parseJsonFile('manifest.json'),

        // Configuration for the code minification process.
        minifyCode: {
            // General settings for the minifier.
            settings: {
                // A header comment to be added to the top of the minified file.
                headerComment: '/* ! <%= projectData.name %> v<%= projectData.version %> */\n'
            },
            // Specific target for the production build.
            productionTarget: {
                sourceFile: 'assets/component.js', // Input file for minification.
                destinationFile: 'assets/component.min.js' // Output file after minification.
            }
        },
        // Path to the manifest file for version updates.
        versionUpdater: 'manifest.json'
    });

    // Load necessary external modules for the toolkit.
    toolKit.loadPluginModules('tool-plugin-minify');
    toolKit.loadPluginModules('tool-plugin-version');

    // Define various operations (tasks) that can be run.

    toolKit.defineOperation('standard', ['monitorFiles']); // Default task alias.

    toolKit.defineOperation('deployFinal', ['incrementVersion', 'minifyCode']); // Task to prepare for deployment.

    // Custom operation to update the project version.
    toolKit.defineOperation('incrementVersion', function (updateMode) {
        updateMode = updateMode ? updateMode : 'minor'; // Default to 'minor' if no mode is specified.
        toolKit.performTask("versionUpdater:" + updateMode); // Execute the version update plugin.
    });
};