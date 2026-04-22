'use strict';
// This module exports a function that configures the entire build system.
module.exports = function (builderTool) {
    builderTool.initializeConfiguration({

        // Retrieve project details from the manifest file.
        projectInfo: builderTool.fileSystem.readJSON('project.manifest'),

        // HTML minification task settings.
        htmlOptimizer: {
          productionBuild: {
            configurationOptions: {
              stripHtmlComments: true,
              condenseWhitespace: true,
              compressInlineScripts: true
            },
            targetFiles: {
              'page.main.html' : 'source/page.main.html' // Output to root, input from source folder
            }
          }
        },
        // JavaScript minification task settings.
        scriptCompressor: {
          primaryScriptTarget: {
            compressionOptions : {
              minify: {
                removeConsoleStatements: true // Exclude console logs from production code.
              }
            },
            outputFiles: {
              'application.min.js': ['source/application.js'] // Minify main application script.
            }
          }
        },
        // SASS compilation task.
        scssProcessor: {
            release: {
                sourceMapFiles: {
                    'source/app.styles.css' : 'source/app.styles.scss' // Compile SASS to CSS.
                }
            }
        },
        // CSS vendor prefixing task.
        cssPrefixer: {
            settings: {
              browserCompatibility: ['last 4 versions'] // Target recent browser versions.
            },
            output: {
                destinationFiles: {
                    'source/app.styles.css' : 'source/app.styles.css' // Apply prefixes to the compiled CSS.
                }
            }
        },
        // Pixel fallback for REM units.
        remUnitPolyfill: {
          generalOptions: {
            enableLogging: false, // Disable logging for this task.
            performReplacement: false // Do not replace original files.
          },
          ie8Support: {
            outputFiles: {
              // 'WebResources/source/app.ie8.css': ['webresources/source/app.styles.css'] // Placeholder for IE8 specific CSS.
            }
          }
        },
        // CSS minification task.
        styleMinifier: {
            addHeader: {
                minificationOptions: {
                    displayReport: true, // Show a report after minification.
                    headerContent: '/* \nAuthor: Jane Doe\nWebsite: http://example.com \n*/' // Add a custom banner.
                },
                outputFiles: {
                    'app.min.css' : ['source/app.styles.css'] // Minify the final CSS.
                }
            }
        },
        // File monitoring for development.
        fileMonitor: {
          monitorOptions: {
              liveReloadFeature: false // Live reload is disabled for this setup.
          },
          markupChanges : {
            monitoredFiles: ['source/page.main.html'],
            actionTasks: ['htmlOptimizer'] // Rerun HTML minification on changes.
          },
          scriptChanges : {
            watchedFiles: ['source/application.js'],
            actionTasks: ['scriptCompressor'] // Rerun JS minification on changes.
          },
          scssChanges: {
              filesToObserve: ['source/app.styles.scss'],
              actionTasks: ['scssProcessor','cssPrefixer','styleMinifier'], // Recompile SCSS, prefix, and minify CSS.
              monitorSettings: {
                liveReloadFeature: false // Explicitly disable live reload here too.
              },
          },
        }
    });

    // Load necessary build system plugins.
    builderTool.loadPlugin('builder-plugin-htmlcompress');
    builderTool.loadPlugin('builder-plugin-jsshrink');

    builderTool.loadPlugin('builder-plugin-scssprocessor');
    builderTool.loadPlugin('builder-plugin-cssprefix');
    builderTool.loadPlugin('builder-plugin-pixelpolyfill');
    builderTool.loadPlugin('builder-plugin-stylecompress');

    builderTool.loadPlugin('builder-plugin-filemonitor');
    // Register the primary task to start watching files.
    builderTool.defineTask('primaryProcess', ["fileMonitor"]);
};