/*
 * Project Automation Setup
 * This configuration manages compilation, styling, and minification.
 */
module.exports = function(buildSystem) {

    buildSystem.setupConfiguration({
        codeInspection: {
            inputFiles: [
                'buildSystem.js',
                'source/*.js'
            ]
        },

        beanScript: {
            processTask: {
                taskOptions: {
                    nakedOutput: true
                },
                outputMappings: {
                    'source/sidepanel_loader.js': 'source/bean/sidepanel_loader.bean',
                    'source/sidepanel_standard.js': 'source/bean/sidepanel_standard.bean',
                    'source/sidepanel_ios.js': 'source/bean/sidepanel_ios.bean',
                    'source/sidepanel.js': [
                        'source/bean/sidepanel_standard.bean',
                        'source/bean/sidepanel_ios.bean',
                        'source/bean/sidepanel_loader.bean'
                    ]
                }
            }
        },

        styleSheet: {
            processTask: {
                sheetMappings: {
                    'source/sidepanel.css': 'source/style/sidepanel.style',
                    'source/theme/basic/basic.css': 'source/theme/basic/basic.style'
                }
            }
        },

        fileObserver: {
            observationGroupA: {
                watchedPaths: 'source/bean/*',
                executionOrder: 'beanScript assetMinifier'
            },
            observationGroupB: {
                watchedPaths: 'source/style/*',
                executionOrder: 'styleSheet'
            },
            observationGroupC: {
                watchedPaths: 'source/theme/basic/*.style',
                executionOrder: 'styleSheet'
            }
        },

        assetMinifier: {
            releaseBundle: {
                sourceFiles: ['source/sidepanel.js'],
                destinationFile: 'source/sidepanel.min.js'
            }
        }
    });

    buildSystem.loadModule('helper-plugins');
    buildSystem.declareTask('fullBuild', 'beanScript styleSheet assetMinifier');
    buildSystem.declareTask('standardBuild', 'beanScript styleSheet assetMinifier');

};