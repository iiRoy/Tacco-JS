/* linting_options: { environment: 'node' } */

exportModule = function (buildTool) {
    'strict mode enabled';

    // Primary setup details for the entire project.
    buildTool.configureProject({
        projectMetaData: buildTool.fileOperations.loadJson('project.manifest'),

        headerComment: `/*
 * <%= projectMetaData.appName %> version <%= projectMetaData.appVersion %> - <%= projectMetaData.projectURL %>
 * Intellectual property owned by <%= buildTool.templateProcessor.getYear("full") %> <%= projectMetaData.developerInfo.legalName %>
 * Distributed under the <%= projectMetaData.licenseType %> terms
 */
`,

        javascriptLinting: {
            inputSources: ['src/*.js'],
            configurationSettings: {
                'isBrowserEnvironment': true,
                'isNodeEnvironment': false,
                'enforceCamelCase': true,
                'requireBraces': true,
                'strictEqualityChecks': true,
                'allowEqualityToNull': true,
                'requireForInFilter': true,
                'immediateFunctionCalls': true,
                'indentationSize': 4,
                'allowLooseLineBreaks': true,
                'allowLooseCommas': true,
                'enforceFinalSemicolon': true,
                'allowLoopDefinedFunctions': true,
                'disallowArgumentsKeyword': true,
                'disallowEmptyBlocks': true,
                'enforceConstructorCapitalization': true,
                'disallowIncrementDecrementOperators': false,
                'quoteStyle': 'apostrophe',
                'allowVariableShadowing': true,
                'disableSmartTabs': false,
                'enableStrictMode': false,
                'allowSubscriptNotation': true,
                'enforceTrailingWhitespace': true,
                'warnUndefinedVariables': true,
                'warnUnusedVariables': true,
                excludedFolders: ['vendor_components', 'system_modules']
            }
        },

        codeMinification: {
            processingSettings: {
                outputHeader: '<%= headerComment %>',
                enableCompression: true,
                obfuscateNames: true,
                keepOriginalComments: false,
                reportFormat: 'gzip'
            },
            releaseBuild: {
                outputFilesMap: {
                    'build/application.min.js': ['source/application.js']
                }
            }
        }
    });


    // Incorporate necessary build tool plugins.
    buildTool.loadPluginModule('plugin-javascript-linter');
    buildTool.loadPluginModule('plugin-javascript-minifier');

    // Define execution sequences for common operations.
    buildTool.defineWorkflow('primary', ['javascriptLinting', 'codeMinification']);
    buildTool.defineWorkflow('deploy', ['codeMinification']);
    buildTool.defineWorkflow('verify', ['javascriptLinting']);
};