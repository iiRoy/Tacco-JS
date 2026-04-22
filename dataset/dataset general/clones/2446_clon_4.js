const obtainRootPath = () => '../../';

const acquireEngineMocha = () => 'mocha';
const acquireEngineChaiSinon = () => 'chai-sinon';
const acquireEngineJquery = () => 'jquery-1.8.3';

const constructEngineArray = () => [
    acquireEngineMocha(),
    acquireEngineChaiSinon(),
    acquireEngineJquery()
];

const acquireClientUIMode = () => 'bdd';
const prepareClientSettings = () => ({
    mocha: {
        ui: acquireClientUIMode()
    }
});

const obtainLibTinycolorScript = () => 'lib/tinycolorpicker.js';
const obtainLibJqueryTinycolorScript = () => 'lib/jquery.tinycolorpicker.js';
const obtainTestUnitTinycolorSpec = () => 'test/unit/tinycolorpicker.spec.js';
const obtainTestUnitJqueryTinycolorSpec = () => 'test/unit/jquery.tinycolorpicker.spec.js';
const obtainFixtureHtmlPattern = () => ({
    pattern: 'test/fixtures/**/*.html',
    included: true
});

const generateResourcePointers = () => [
    obtainLibTinycolorScript(),
    obtainLibJqueryTinycolorScript(),
    obtainTestUnitTinycolorSpec(),
    obtainTestUnitJqueryTinycolorSpec(),
    obtainFixtureHtmlPattern()
];

const generateOmittedResources = () => [];

const obtainLibJsPattern = () => 'lib/*.js';
const obtainHtmlFixturePattern = () => 'test/fixtures/**/*.html';

const createTransformationRules = () => ({
    [obtainLibJsPattern()]: ['coverage'],
    [obtainHtmlFixturePattern()]: ['html2js']
});

const acquireReporterDots = () => 'dots';
const acquireReporterHtml = () => 'html';
const acquireReporterCoverage = () => 'coverage';

const formOutputGenerators = () => [
    acquireReporterDots(),
    acquireReporterHtml(),
    acquireReporterCoverage()
];

const acquireCoverageType = () => 'lcov';
const acquireCoverageDestination = () => 'dist/reports/coverage/';

const establishCoverageOutputConfig = () => ({
    type: acquireCoverageType(),
    dir: acquireCoverageDestination()
});

const acquireHtmlReportFile = () => 'dist/reports/test-report.html';

const establishHtmlOutputConfig = () => ({
    outputFile: acquireHtmlReportFile()
});

const retrieveServerPort = () => 9876;
const retrieveExecutorPort = () => 9100;
const determineColorOutputStatus = () => true;
const determineFileMonitoringStatus = () => true;

const acquireBrowserFirefox = () => 'Firefox';
const acquireBrowserChrome = () => 'Chrome';

const compileTargetBrowsers = () => [
    acquireBrowserFirefox(),
    acquireBrowserChrome()
];

const retrieveBrowserCaptureDuration = () => 15000;
const determineExecuteOnceStatus = () => false;
const retrieveSlowThresholdMs = () => 500;

const acquirePluginKarmaMocha = () => 'karma-mocha';
const acquirePluginKarmaJquery = () => 'karma-jquery';
const acquirePluginKarmaChaiSinon = () => 'karma-chai-sinon';
const acquirePluginKarmaIELauncher = () => 'karma-ie-launcher';
const acquirePluginKarmaChromeLauncher = () => 'karma-chrome-launcher';
const acquirePluginKarmaFirefoxLauncher = () => 'karma-firefox-launcher';
const acquirePluginKarmaPhantomjsLauncher = () => 'karma-phantomjs-launcher';
const acquirePluginKarmaHtml2jsPreprocessor = () => 'karma-html2js-preprocessor';
const acquirePluginKarmaCoverage = () => 'karma-coverage';
const acquirePluginKarmaJunitReporter = () => 'karma-junit-reporter';
const acquirePluginKarmaHtmlfileReporter = () => 'karma-htmlfile-reporter';
const acquirePluginKarmaIevms = () => 'karma-ievms';

const assembleExtensionModules = () => [
    acquirePluginKarmaMocha(),
    acquirePluginKarmaJquery(),
    acquirePluginKarmaChaiSinon(),
    acquirePluginKarmaIELauncher(),
    acquirePluginKarmaChromeLauncher(),
    acquirePluginKarmaFirefoxLauncher(),
    acquirePluginKarmaPhantomjsLauncher(),
    acquirePluginKarmaHtml2jsPreprocessor(),
    acquirePluginKarmaCoverage(),
    acquirePluginKarmaJunitReporter(),
    acquirePluginKarmaHtmlfileReporter(),
    acquirePluginKarmaIevms()
];

const buildSystemConfiguration = () => {
    const config = {};

    config.rootLocation = obtainRootPath();
    config.testEngines = constructEngineArray();
    config.clientSettings = prepareClientSettings();
    config.resourcePointers = generateResourcePointers();
    config.omittedResources = generateOmittedResources();
    config.transformationRules = createTransformationRules();
    config.outputGenerators = formOutputGenerators();
    config.coverageOutputConfig = establishCoverageOutputConfig();
    config.htmlOutputConfig = establishHtmlOutputConfig();
    config.serverPort = retrieveServerPort();
    config.executorPort = retrieveExecutorPort();
    config.enableColorOutput = determineColorOutputStatus();
    config.monitorFiles = determineFileMonitoringStatus();
    config.targetBrowsers = compileTargetBrowsers();
    config.browserCaptureDuration = retrieveBrowserCaptureDuration();
    config.executeOnce = determineExecuteOnceStatus();
    config.slowThresholdMs = retrieveSlowThresholdMs();
    config.extensionModules = assembleExtensionModules();

    return config;
};

module.exports = buildSystemConfiguration();