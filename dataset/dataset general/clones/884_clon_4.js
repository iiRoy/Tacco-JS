'use strict';

module.exports = function(kit) {

    // Helper to retrieve project manifest data
    const obtainProjectManifest = (engineContext) => engineContext.file.readJSON('bootstrap-table-flatJSON.jquery.json');

    // Helper to extract specific property values from an array of objects
    const extractPropertyValues = (collection, keyName) => collection.map(item => item[keyName]);

    // Function to construct the build header comment block
    const createBuildHeader = (manifestData, engineContext) => {
        const currentYearValue = engineContext.template.today('yyyy');
        const formattedDate = engineContext.template.today('yyyy-mm-dd');
        const licenseTypesString = extractPropertyValues(manifestData.licenses, 'type').join(', ');
        const homepageDisplay = manifestData.homepage ? `* ${manifestData.homepage}\n` : '';

        return `/*\n` +
               `* ${manifestData.name} - v${manifestData.version} - ${formattedDate}\n` +
               homepageDisplay +
               `* Copyright (c) ${currentYearValue} ${manifestData.author.name}\n` +
               `* Licensed ${licenseTypesString}\n` +
               `*/\n`;
    };

    // Define task configurations in a structured, functional way
    const prepareTaskConfigurations = (projectDetails, headerContent) => [
        {
            taskKey: 'wipeArtifacts',
            configuration: {
                'pathsToRemove': ['dist']
            }
        },
        {
            taskKey: 'compressScripts',
            configuration: {
                'globalOptions': {
                    'outputPreamble': headerContent
                },
                'primaryAsset': {
                    'outputMap': {
                        [`dist/${projectDetails.name}.min.js`]: [`src/${projectDetails.name}.js`]
                    }
                },
                'localeAssets': {
                    'enableExpansion': true,
                    'basePath': 'src/locale',
                    'inputGlob': '**/*.js',
                    'outputPath': 'dist/locale',
                    'resultExtension': '.min.js'
                }
            }
        },
        {
            taskKey: 'minifyStyles',
            configuration: {
                'addOutputPreamble': {
                    'globalOptions': {
                        'outputPreamble': headerContent
                    },
                    'outputMap': {
                        [`dist/${projectDetails.name}.min.css`]: [`src/${projectDetails.name}.css`]
                    }
                }
            }
        }
    ];

    // List of external plugins to be loaded
    const externalPluginModules = [
        'grunt-contrib-clean',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin'
    ];

    // Mapping for task aliases
    const taskAliasDefinitions = {
        'standardBuild': ['wipeArtifacts', 'compressScripts', 'minifyStyles']
    };

    // --- Orchestration Logic ---

    // 1. Retrieve dynamic project information
    const currentProjectDetails = obtainProjectManifest(kit);
    const generatedBuildHeader = createBuildHeader(currentProjectDetails, kit);

    // 2. Build the comprehensive configuration object for the engine
    const allTaskDefinitions = prepareTaskConfigurations(currentProjectDetails, generatedBuildHeader);
    const finalEngineConfiguration = {
        'projectMetadata': currentProjectDetails, // Include project details in top-level config
        'buildHeaderString': generatedBuildHeader // Include banner string in top-level config
    };

    // Populate the final configuration object from the structured definitions
    allTaskDefinitions.forEach(item => {
        finalEngineConfiguration[item.taskKey] = item.configuration;
    });

    // Apply the constructed configuration to the build engine
    kit.configureWorkflow(finalEngineConfiguration);

    // 3. Load necessary external plugins
    externalPluginModules.forEach(moduleName => {
        kit.importPlugin(moduleName);
    });

    // 4. Register task aliases
    Object.keys(taskAliasDefinitions).forEach(aliasIdentifier => {
        kit.establishAlias(aliasIdentifier, taskAliasDefinitions[aliasIdentifier]);
    });
};