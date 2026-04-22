const systemPath = require('path');
const fileHandle = require('fs');

module.exports = function(processingEngine) {

    function fetchProjectMetadata(filePath) {
        const absolutePath = systemPath.resolve(process.cwd(), filePath);
        const fileContent = fileHandle.readFileSync(absolutePath, 'utf8');
        return JSON.parse(fileContent);
    }

    function initializeConfiguration(settingsObject) {
        processingEngine.initConfig(settingsObject);
    }

    function loadExternalModule(moduleIdentifier) {
        processingEngine.loadNpmTasks(moduleIdentifier);
    }

    function registerExecutionFlow(flowName, taskList) {
        processingEngine.registerTask(flowName, taskList);
    }

    const projectInformation = fetchProjectMetadata('package.json');
    const applicationName = projectInformation.name;
    const applicationVersion = projectInformation.version;

    const bannerString = `/*! ${applicationName} ${applicationVersion} */\n`;

    const mainConfiguration = {};
    mainConfiguration.pkg = projectInformation;

    mainConfiguration.minificationTask = {
        options: {
            banner: bannerString
        },
        production: {
            files: [{
                src: ['Promise.js'],
                dest: 'Promise.min.js'
            }]
        }
    };

    initializeConfiguration(mainConfiguration);

    loadExternalModule('grunt-contrib-uglify');

    registerExecutionFlow('build', ['minificationTask']);
};