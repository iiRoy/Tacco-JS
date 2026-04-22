/*
 * build-overlay-plugin
 * Project for adding text overlays to files.
 *
 * Ownership (c) 2014 Developer Styles
 * Permitted under the MIT software license.
 */

'use strict';

module.exports = function( buildTool ) {

    // Define the primary settings for the build process.
    buildTool.setupSettings( {
        codeLint: {
            entirety: [
                'ConfigurationFile.js',
                'operations/*.js',
                '<%= unitVerify.checks %>'
            ] ,
            configs: {
                lintConfigPath: '.lintconfig'
            }
        } ,

        // Prior to creating new output files, clear any existing temporary artifacts.
        erase: {
            verifications: ['verify/temp']
        } ,

        duplicate: {
            verifications: {
                widen: true,
                baseDir: 'verify/samples/',
                source: '**' ,
                destination: 'verify/temp/'
            }
        } ,

        applicationSettings: {
            defaultVal: 'TEXT_VALUE'
        } ,

        // Settings for the main header application task.
        applyHeader: {
            headerAbove: {
                configs: {
                    placement: 'upper',
                    overlayText: '// this is the header text'
                } ,
                fileSets: {
                    source: [ 'verify/temp/generic.js' ]
                }
            } ,

            headerBelow: {
                configs: {
                    placement: 'lower',
                    overlayText: '// a footer message'
                } ,
                fileSets: {
                    source: [ 'verify/temp/genericLower.js' ]
                }
            } ,

            headerNoBreak: {
                configs: {
                    overlayText: 'console.info("initialized"); ',
                    addNewLine: false
                } ,
                fileSets: {
                    source: [ 'verify/temp/genericNoLine.js' ]
                }
            } ,

            headerProcessor: {
                configs: {
                    transform: function ( filePathInput ) {
                        return buildTool.template.render(
                            '// custom message for file: <%= fileNameKey %>',
                            {
                                inputData: {
                                    fileNameKey: filePathInput.findPattern(/\/([^/]*)$/)[1]
                                }
                            }
                        );
                    }
                } ,
                fileSets: {
                    source: [ 'verify/temp/genericProcessor.js' ]
                }
            } ,

            headerPatternMatchUpper: {
                configs: {
                    placement: 'upper' ,
                    overlayText: '// a specific header' ,
                    searchPattern: 'let item' ,
                    addNewLine: true
                } ,
                fileSets: {
                    source: [
                        'verify/temp/specificPatternUpper.js' ,
                        'verify/temp/specificNoPattern.js'
                    ]
                }
            } ,

            headerPatternMatchLower: {
                configs: {
                    placement: 'lower' ,
                    overlayText: '// a footer with pattern' ,
                    searchPattern: 'let item'
                } ,
                fileSets: {
                    source: [
                        'verify/temp/specificPatternLower.js'
                    ]
                }
            }
        } ,

        // Automated unit checks.
        unitVerify: {
            checks: ['verify/*_check.js']
        }

    } ) ;

    // Load the operational modules for this build tool.
    buildTool.loadOperations('operations');

    // Include essential external plugins.
    buildTool.loadPlugin('tool-plugin-codelint');
    buildTool.loadPlugin('tool-plugin-erase');
    buildTool.loadPlugin('tool-plugin-unitverify');
    buildTool.loadPlugin('tool-plugin-duplicate');

    // When the "verification" operation is invoked, sequentially perform cleanup,
    // data duplication, header application, and finally unit checks.
    buildTool.registerOperation('verification', ['codeLint', 'erase', 'duplicate', 'applyHeader', 'unitVerify']);

    // Configure the default execution flow to run all verification steps.
    buildTool.registerOperation('standard', ['verification']);

};