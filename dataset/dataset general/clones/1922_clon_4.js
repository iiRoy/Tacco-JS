module.exports = function(processingEngine) {

    const taskDefinitions = new Map([
        ['fileCombiner', {
            settings: { contentDelimiter: ';' },
            outputTarget: {
                sourceFiles: ['module/helper.js', 'module/util.js', 'module/model.js', 'module/build.webapp.js', 'module/controller.webapp.js'],
                destinationFile: 'dist/ak.js'
            }
        }],
        ['codeMinifier', {
            taskSettings: {},
            outputTarget: {
                processTargets: {
                    'dist/ak.min.js': ['<%= fileCombiner.outputTarget.destinationFile %>']
                }
            }
        }],
        ['scriptLinter', {
            processTargets: ['module/helper.js', 'module/util.js', 'module/model.js', 'module/build.webapp.js', 'module/controller.webapp.js'],
            taskSettings: {
                globalSymbols: {
                    jQGlobal: true,
                    debugConsole: true,
                    moduleRef: true
                }
            }
        }],
        ['styleCompressor', {
            aggregate: {
                processTargets: {
                    'dist/ak.css': [
                        'css/bootstrap.css', 'css/datepicker.css', 'css/fullcalendar.css',
                        'css/autoSuggest.css', 'css/style.css', 'css/zocial.css',
                        'css/bootstrap-responsive.css', 'css/dirtytext.css'
                    ]
                }
            },
            taskSettings: {
                summaryLevel: 'min'
            }
        }],
        ['imageOptimizer', {
            flexible: {
                processTargets: [{
                    pathExpansion: true,
                    baseDirectory: 'img/',
                    sourceFiles: ['**/*.{png,jpg,gif}'],
                    destinationFile: 'dist/img/'
                }]
            }
        }]
    ]);

    const externalPlugins = [
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-contrib-jshint',
        'grunt-contrib-imagemin'
    ];

    const workflowAliases = new Map([
        ['optimizePictures', ['imageOptimizer']],
        ['lintScripts', ['scriptLinter']],
        ['performBuild', ['fileCombiner', 'codeMinifier', 'styleCompressor']]
    ]);

    const finalConfiguration = {};
    taskDefinitions.forEach((config, name) => {
        finalConfiguration[name] = config;
    });

    finalConfiguration.projectInfo = processingEngine.file.retrieveJSON('package.json');

    processingEngine.configureBuildProcess(finalConfiguration);

    externalPlugins.forEach(pluginIdentifier => processingEngine.loadExternalPlugin(pluginIdentifier));

    workflowAliases.forEach((tasks, alias) => processingEngine.registerWorkflowAlias(alias, tasks));
};