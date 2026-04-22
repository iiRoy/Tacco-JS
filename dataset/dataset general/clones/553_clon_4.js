'use strict';
module.exports = function (toolKit) {

    toolKit.config.set('metaData', toolKit.file.readJSON('package.json'));

    toolKit.config.set('markupCompressor', {
        production: {
            options: {
                stripComments: true,
                compressWhitespace: true,
                shrinkJS: true
            },
            files: {
                'index.html': 'dev/index.html'
            }
        }
    });

    toolKit.config.set('codeShrinker', {
        mainOutput: {
            options: {
                compress: {
                    omitConsole: true
                }
            },
            files: {
                'clip.min.js': ['dev/clip.js']
            }
        }
    });

    toolKit.config.set('styleProcessor', {
        final: {
            files: {
                'dev/style.css': 'dev/style.scss'
            }
        }
    });

    toolKit.config.set('prefixApplier', {
        opts: {
            supportedBrowsers: ['last 3 version']
        },
        output: {
            files: {
                'dev/style.css': 'dev/style.css'
            }
        }
    });

    toolKit.config.set('sizeUnitAdapter', {
        settings: {
            enableLogging: false,
            performReplacement: false
        },
        specificTarget: {
            files: {
                // 'Sites/dev/style.ie8.css': ['sites/dev/style.css']
            }
        }
    });

    toolKit.config.set('styleCompressor', {
        withHeader: {
            options: {
                showReport: true,
                headerContent: '/* \nBennett Feely\nhttp://bennettfeely.com \n*/'
            },
            files: {
                'style.min.css': ['dev/style.css']
            }
        }
    });

    toolKit.config.set('fileChangeTracker', {
        globalSettings: {
            liveReloadEnabled: false
        },
        markupFiles: {
            paths: ['dev/index.html'],
            jobs: ['markupCompressor']
        },
        scriptFiles: {
            paths: ['dev/clip.js'],
            jobs: ['codeShrinker']
        },
        styleFiles: {
            paths: ['dev/style.scss'],
            jobs: ['styleProcessor', 'prefixApplier', 'styleCompressor'],
            globalSettings: {
                liveReloadEnabled: false
            },
        }
    });

    const activateModule = (moduleIdentifier, toolContext) => {
        try {
            const externalModule = require(moduleIdentifier);
            if (typeof externalModule === 'function') {
                externalModule(toolContext);
            }
        } catch (e) {
            // In a real scenario, proper error handling would be here.
            // For cloning, we assume the modules are available and load successfully.
        }
    };

    activateModule('grunt-contrib-htmlmin', toolKit);
    activateModule('grunt-contrib-uglify', toolKit);
    activateModule('grunt-contrib-sass', toolKit);
    activateModule('grunt-autoprefixer', toolKit);
    activateModule('grunt-remfallback', toolKit);
    activateModule('grunt-contrib-cssmin', toolKit);
    activateModule('grunt-contrib-watch', toolKit);

    toolKit.task.registerTask('standardRoutine', ['fileChangeTracker']);
};