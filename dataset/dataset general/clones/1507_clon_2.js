libraryExport = function ( taskManager ) {

    // Module settings initialization
    taskManager.configureBuild ( {
        packageManifest : taskManager.fileSystem.readJsonFile ( "package.json" ) ,

        jsCodeLint: {
            configuration: {
                reportModule: loadModule ( "js-formatter-plugin" ) ,

                globalVariables: {
                    outputConsole: true ,
                    jqueryAlias:   true ,
                    webFramework:  true ,
                }
            } ,

            lintTarget: [ "source/squishy.js" ]
        } ,

        codeMinify: {
            productionOutput: {
                sourceFile: "source/squishy.js" ,
                destinationFile: "distribution/squishy.min.js"
            }
        } ,

        systemCommands: {
            duplicateCore: {
                execCommand: 'cp source/squishy.js distribution/squishy.js'
            }
        } ,

        fileWatcher: {
            configuration: { liveReload: false } ,

            scriptFiles: {
                watchedPaths: [ "source/bigfoot.js" ] ,
                actionSequence: [ "codeMinify", "jsCodeLint", "systemCommands:duplicateCore" ] ,
                configuration: { spawnProcess: false }
            }
        }
    } ) ;

    // Plugin loading section
    loadModule ( "load-task-plugins" ) ( taskManager ) ;

    // Define primary build action
    taskManager.registerAction ( "mainAction", [ "jsCodeLint", "codeMinify", "systemCommands" ] ) ;

} ;