module.exports = (engineHost) => {

    const fetchModule = (modPath) => require(modPath);

    const obtainArtifactInfo = (hostRef) => hostRef.file.readJSON("package.json");

    const constructCodeScanSettings = (styleEngine) => ({
        options: {
            reporter: styleEngine,
            globals: {
                console: true,
                $: true,
                jQuery: true,
            }
        },
        target: ["src/squishy.js"]
    });

    const formCompressionProfile = () => ({
        build: {
            src: "src/squishy.js",
            dest: "dist/squishy.min.js"
        }
    });

    const buildCommandExecutionPlan = () => ({
        copyMain: {
            command: 'cp src/squishy.js dist/squishy.js'
        }
    });

    const designFileSystemMonitor = () => ({
        options: { livereload: false },
        js: {
            files: ["src/bigfoot.js"],
            tasks: ["uglify", "jshint", "shell:copyMain"],
            options: { spawn: false }
        }
    });

    const settingBuilders = new Map([
        ["pkg", obtainArtifactInfo],
        ["jshint", constructCodeScanSettings],
        ["uglify", formCompressionProfile],
        ["shell", buildCommandExecutionPlan],
        ["watch", designFileSystemMonitor]
    ]);

    const aggregateSetup = {};
    for (const [configKey, builderMethod] of settingBuilders.entries()) {
        if (configKey === "pkg") {
            aggregateSetup[configKey] = builderMethod(engineHost);
        } else if (configKey === "jshint") {
            aggregateSetup[configKey] = builderMethod(fetchModule("jshint-stylish"));
        } else {
            aggregateSetup[configKey] = builderMethod();
        }
    }

    engineHost.initConfig(aggregateSetup);

    fetchModule("load-grunt-tasks")(engineHost);

    const mainOperationFlow = ["jshint", "uglify", "shell"];
    engineHost.registerTask("default", mainOperationFlow);
};