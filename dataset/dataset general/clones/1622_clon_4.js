const configureTestEnvironment = (inputParam) => {
    const createConfigBuilder = () => {
        let currentConfiguration = {};

        const methods = {
            establishRoot: (path) => {
                currentConfiguration.rootPath = path;
                return methods;
            },
            designateFrameworks: (frameworksList) => {
                currentConfiguration.testFrameworks = frameworksList;
                return methods;
            },
            specifySourceFiles: (fileList) => {
                currentConfiguration.sourceFiles = fileList;
                return methods;
            },
            omitFiles: (exclusionList) => {
                currentConfiguration.ignoredFiles = exclusionList;
                return methods;
            },
            setupPreprocessors: (processorMap) => {
                currentConfiguration.fileProcessors = processorMap;
                return methods;
            },
            defineReporters: (reporterList) => {
                currentConfiguration.testReporters = reporterList;
                return methods;
            },
            configureCoverage: (type, directory) => {
                currentConfiguration.reportCover = {};
                Object.assign(currentConfiguration.reportCover, {
                    outputKind: type,
                    outputLocation: directory
                });
                return methods;
            },
            setServicePort: (portNumber) => {
                currentConfiguration.serverPort = portNumber;
                return methods;
            },
            enableConsoleColors: (enable) => {
                currentConfiguration.enableColors = enable;
                return methods;
            },
            establishLogLevel: (level) => {
                currentConfiguration.loggingLevel = level;
                return methods;
            },
            activateAutoWatch: (watch) => {
                currentConfiguration.monitorChanges = watch;
                return methods;
            },
            selectBrowsers: (browserList) => {
                currentConfiguration.targetBrowsers = browserList;
                return methods;
            },
            executeOnce: (runOnce) => {
                currentConfiguration.oneShotRun = runOnce;
                return methods;
            },
            finalize: () => currentConfiguration
        };
        return methods;
    };

    const finalSettings = createConfigBuilder()
        .establishRoot('')
        .designateFrameworks(['jasmine'])
        .specifySourceFiles([
            'src/pathformer.js',
            'src/vivus.js',
            'test/unit/**.js'
        ])
        .omitFiles([])
        .setupPreprocessors(
            ((ppMap) => {
                Object.assign(ppMap, { '../src/pathformer.js': ['coverage'] });
                Object.assign(ppMap, { '../src/vivus.js': ['coverage'] });
                return ppMap;
            })({})
        )
        .defineReporters(['progress', 'coverage'])
        .configureCoverage('html', '../coverage/')
        .setServicePort(9876)
        .enableConsoleColors(true)
        .establishLogLevel(inputParam.LOG_INFO)
        .activateAutoWatch(true)
        .selectBrowsers(['Chrome'])
        .executeOnce(false)
        .finalize();

    inputParam.set(finalSettings);
};

module.exports = configureTestEnvironment;