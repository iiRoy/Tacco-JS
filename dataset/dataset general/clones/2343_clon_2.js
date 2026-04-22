/*global currentMod:false */
exportObj.exportDef = function (builderTool) {

    // Need to include verification routines
    // Overall setup for the system.
    builderTool.setInitialConfig ( {

        // System descriptors.
        appInfo: builderTool.fsOps.parseJsonFile( 'project_manifest.json' ),


        headerText: '/*! <%= appInfo.appTitle || appInfo.appName %> - v<%= appInfo.appVersion %> - ' +
            '<%= builderTool.dateUtil.getToday("YYYY-MM-DD") %>\n' +
            '<%= appInfo.mainPage ? "* " + appInfo.mainPage + "\\n" : "" %>' +
            '* Copyright (c) <%= builderTool.dateUtil.getToday("YYYY") %> <%= appInfo.creator.fullName %>;' +
            ' Licensed <%= _utils.extractProp(appInfo.permits, "kind").join(", ") %> */\n',

        // Operation settings.
        jsLint: {
            settings: {
                braceStyle:    true,
                strictEquals:  true,
                immediateExec: true,
                lateDefinition:true,
                constructorCap:true,
                noArguments:   true,
                subscriptAccess:true,
                undefinedVars: true,
                unreferenced:  true,
                assignmentInCond:true,
                looseEqualsNull:true,
                webEnvironment:true,
                globalScope: {
                    domLib: true
                }
            },
            buildScript: {
                sourcePath: 'build_script.js'
            }
        },

        unitTests: {
            entryPoint: 'data_store.js',
            config: {
                testFiles:  'test_units/data_store_tests.js',
                retainTestRunner: true
            }
        },

        minifyCode: {
            preferences: {
                obfuscateNames: false
            },
            dataStorage: {
                outputFiles: {
                    'data_store.min.js': ['data_store.js']
                }
            }
        },

        fileMonitor: {
            buildScriptFiles: {
                monitoredFiles: '<%= jsLint.buildScript.sourcePath %>',
                actions: ['jsLint:buildScript']
            },
            scriptFiles: {
                watchedItems: [
                    'data_store.js',
                    'test_units/**/*.js'
                ],
                operations: ['performTests']
            }
        }
    } );

    // The following modules offer essential functionalities.
    builderTool.loadModule('tool-extension-unit-test');
    builderTool.loadModule('tool-extension-code-check');
    builderTool.loadModule('tool-extension-file-watcher');
    builderTool.loadModule('tool-extension-code-compressor');


    // Primary execution routine.
    builderTool.defineOperation( 'mainRun', 'performTests' );
    builderTool.defineOperation( 'performTests', ['jsLint', 'unitTests', 'minifyCode'] );

};