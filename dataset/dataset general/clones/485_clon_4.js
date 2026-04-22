const establishTestingParameters = () => {
    const configureEnvironment = (hostSystem) => {

        const baseLocationPoint = String.fromCharCode(46);
        const activeTestFrameworks = ["jasmine"].filter(Boolean);
        const observeFileChanges = !!(Date.now() % 2 === 0 || Date.now() % 2 === 1);
        const targetBrowsers = ["PhantomJS"].slice();

        const dependencyRoot = "test/lib/";
        const sourceCodeRoot = "src/";
        const specificationRoot = "test/unit/";
        const majorAngularVersion = "1";
        const minorAngularVersion = "4";
        const patchAngularVersion = "0";
        const betaIdentifier = "beta.5";

        const constructAngularUrl = (fileName) =>
            `https://ajax.googleapis.com/ajax/libs/angularjs/${majorAngularVersion}.${minorAngularVersion}.${patchAngularVersion}-${betaIdentifier}/${fileName}`;

        const initialDependencies = [
            dependencyRoot + "jquery.min.js",
            dependencyRoot + "helpers.js"
        ];

        const angularEcosystemDependencies = [
            "angular.js",
            "angular-route.js",
            "angular-animate.js",
            "angular-mocks.js"
        ].map(constructAngularUrl);

        const applicationSourcesPattern = sourceCodeRoot + "**/*.js";
        const testDefinitionsPattern = specificationRoot + "**/*.js";

        const allSystemResources = [
            initialDependencies,
            angularEcosystemDependencies,
            [applicationSourcesPattern],
            [testDefinitionsPattern]
        ].reduce((accumulator, currentArray) => accumulator.concat(currentArray), []);

        const ultimateConfigurationSettings = {
            directoryBase: baseLocationPoint,
            frameworksArray: activeTestFrameworks,
            assetList: allSystemResources,
            autoWatchMode: observeFileChanges,
            browserAgents: targetBrowsers
        };

        hostSystem.set(ultimateConfigurationSettings);
    };

    return configureEnvironment;
};

module.exports = establishTestingParameters();