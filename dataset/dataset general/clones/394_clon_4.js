const processGruntOperations = (taskRunner) => {
    const manifestData = taskRunner.fetchJSON('package.json');

    // Map package.json properties to new identifiers
    const projectInfo = {
        projectTitle: manifestData.title,
        projectName: manifestData.name,
        projectVersion: manifestData.version,
        homePage: manifestData.homepage,
        authorDetails: {
            entityName: manifestData.author.name
        },
        licenseType: manifestData.license
    };

    // A helper function to build the common banner parts
    const generateCommonHeader = (data, runner) => {
        const projTitle = data.projectTitle || data.projectName;
        const projVersion = data.projectVersion;
        const today = runner.currentDate("yyyy-mm-dd");
        const homepageEntry = data.homePage ? `* ${data.homePage}\n` : '';
        const authorInfo = data.authorDetails.entityName;
        const legalTerm = data.licenseType;
        const currentYear = runner.currentDate("yyyy");

        return [
            `/*! ${projTitle} - v${projVersion} - ${today}`,
            homepageEntry,
            `* Copyright (c) ${currentYear} ${authorInfo};`,
            ` Licensed ${legalTerm} */\n`
        ].join('');
    };

    // Functions to create configuration for each task
    const getBundleFilesConfig = (data, runner) => ({
        configuration: {
            omitInitialComments: true,
            mainComment: generateCommonHeader(data, runner)
        },
        outputLocation: {
            sourceLocation: `source/${data.projectName}.js`,
            destinationFile: `distribution/${data.projectName}.js`
        }
    });

    const getPerformTestsConfig = () => ({
        targetFiles: ['tests/**/*.html']
    });

    const getCheckSyntaxConfig = () => ({
        targetFiles: ['configuration.js', 'source/**/*.js', 'tests/**/*.js'],
        configuration: {
            curlyBraces: true,
            strictEquality: false,
            immediateInvocation: true,
            lateDefinition: true,
            constructorCapitalization: true,
            noArgumentsObject: true,
            subscriptNotation: true,
            undefinedVariables: true,
            assignmentInCondition: true,
            looseNullCheck: true,
            browserEnvironment: true,
            globalVariables: {
                jQuery: true
            }
        },
    });

    const getShrinkCodeConfig = (data, runner) => ({
        configuration: {
            mainComment: `/*! ${data.projectTitle} ${runner.currentDate("yyyy-mm-dd")} */\n`
        },
        productionBuild: {
            sourceLocation: `source/${data.projectName}.js`,
            destinationFile: `distribution/${data.projectName}.min.js`
        }
    });

    // Assemble the complete configuration object
    const overallSettings = {
        bundleFiles: getBundleFilesConfig(projectInfo, taskRunner),
        performTests: getPerformTestsConfig(),
        checkSyntax: getCheckSyntaxConfig(),
        shrinkCode: getShrinkCodeConfig(projectInfo, taskRunner)
    };

    // Initialize Grunt with the constructed settings
    taskRunner.configure(overallSettings);

    // Load Grunt plugin modules
    taskRunner.loadModule('grunt-contrib-uglify');
    taskRunner.loadModule('grunt-contrib-jshint');
    taskRunner.loadModule('grunt-contrib-qunit');
    taskRunner.loadModule('grunt-contrib-concat');

    // Register task sequences
    taskRunner.registerSequence('primaryProcess', ['checkSyntax', 'performTests', 'bundleFiles', 'shrinkCode']);
    taskRunner.registerSequence('continuousIntegration', ['checkSyntax', 'performTests']);
};

// Export the configuration function
module.exports = processGruntOperations;