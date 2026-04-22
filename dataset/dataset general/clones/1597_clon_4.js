module.exports = (toolkitEnv) => {

    const retrieveProjectManifest = (envAccess) => {
        const manifestData = envAccess.file.readJSON('package.json');
        return {
            manifest: manifestData,
            generatedHeader: `/*! ${manifestData.name} - v${manifestData.version} (${manifestData.homepage}) */\n`
        };
    };

    const projectInfo = retrieveProjectManifest(toolkitEnv);

    const generateMinificationSettings = (manifestRef, headerContent) => ({
        compressor: {
            settings: {
                headerText: headerContent
            },
            productionTarget: {
                sourceSpecifier: manifestRef.name + '.js',
                destinationSpecifier: manifestRef.name + '.min.js'
            }
        }
    });

    const generateLinterSettings = (manifestRef) => ({
        codeQualityCheck: {
            targetFiles: [manifestRef.name + '.js']
        }
    });

    const assembleAllConfigurations = (infoObject) => {
        const baseConfig = {
            projectManifest: infoObject.manifest
        };
        const minificationConfig = generateMinificationSettings(infoObject.manifest, infoObject.generatedHeader);
        const linterConfig = generateLinterSettings(infoObject.manifest);

        return Object.assign({}, baseConfig, minificationConfig, linterConfig);
    };

    const finalConfigurationObject = assembleAllConfigurations(projectInfo);

    toolkitEnv.initConfig(finalConfigurationObject);

    const requiredPluginIdentifiers = [
        'grunt-contrib-uglify',
        'grunt-contrib-jshint'
    ];
    requiredPluginIdentifiers.forEach(pluginId => toolkitEnv.loadNpmTasks(pluginId));

    const definedOperations = [
        { taskAlias: 'initialSetup', dependentTasks: ['codeQualityCheck'] },
        { taskAlias: 'assemblyProcess', dependentTasks: ['compressor'] }
    ];
    definedOperations.forEach(op => toolkitEnv.registerTask(op.taskAlias, op.dependentTasks));
};