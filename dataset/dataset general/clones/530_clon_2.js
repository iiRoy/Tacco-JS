exportUnit = function (buildTool) {

    // Configuration settings for the current project.
    buildTool.initializeConfig({
        projectInfo: buildTool.io.readJsonFile('project.data'),
        compressScripts: {
            configuration: {
                outputHeader: '/*! <%= projectInfo.name %> <%= buildTool.format.currentDate("yyyy-mm-dd") %> */\n'
            },
            createCompressed: {
                sourceFile: 'Codebase/js.excel-export.js',
                targetFile: 'Codebase/js.excel-export.min.js'
            },
            release: {
                sourceFile: 'Codebase/js.excel-export.js',
                targetFile: '../deploy/js.excel-export.min.js'
            }
        },
        replicateFiles: {
            primaryReplication: {
                sourceFile: 'Codebase/js.excel-export.js',
                targetFile: '../deploy/js.excel-export.js'
            }
        },
        monitorChanges: {
            monitoredFiles: 'Codebase/js.excel-export.js',
            scheduledTasks: ['compressScripts']
        }
    });

    // Load the necessary extension for script compression.
    buildTool.loadPlugin('buildtool-contrib-compress');

    // Load the necessary extension for file replication.
    buildTool.loadPlugin('buildtool-contrib-replicate');

    // Define the default build operations.
    buildTool.defineOperation('standardBuild', ['compressScripts', 'replicateFiles']);
};