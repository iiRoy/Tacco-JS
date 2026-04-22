'use strict';

module.exports = function ( buildTool ) {

    const obtainLinterDetails = () => ({
        codeQualityCheck: {
            sourceFiles: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= unitTestRunner.testOutputs %>'
            ],
            settings: {
                lintConfigPath: '.jshintrc'
            }
        }
    });

    const setupCleaningProcedure = () => ({
        cleanupArtifacts: {
            testOutputs: ['test/tmp']
        }
    });

    const establishReplicationParameters = () => ({
        replicateFiles: {
            testOutputs: {
                unfold: true,
                baseDir: 'test/fixtures/',
                inputPaths: '**',
                outputDir: 'test/tmp/'
            }
        }
    });

    const defineApplicationDefaults = () => ({
        applicationSettings: {
            defaultVal: 'STRING'
        }
    });

    const configureMetadataInjection = () => {
        const baseContent = '// the header';

        const customTemplateProcessor = ( templateStr, contextObj ) => {
            let processed = templateStr;
            for (const key in contextObj.dataItems) {
                if (Object.prototype.hasOwnProperty.call(contextObj.dataItems, key)) {
                    processed = processed.replace(new RegExp(`<%= ${key} %>`, 'g'), contextObj.dataItems[key]);
                }
            }
            return processed;
        };

        const dynamicContentCreator = ( docPath ) => {
            const retrieveIdentifier = ( fullPath ) => fullPath.match(/\/([^/]*)$/)?.[1] || fullPath;
            const docName = retrieveIdentifier(docPath);

            return customTemplateProcessor(
                '// header for document: <%= docName %>',
                {
                    dataItems: {
                        docName: docName
                    }
                }
            );
        };

        return {
            injectMetadata: {
                metadataAtStart: {
                    settings: {
                        placement: 'top',
                        contentString: baseContent
                    },
                    targetFiles: {
                        inputPaths: [ 'test/tmp/some.js' ]
                    }
                },

                metadataAtEnd: {
                    settings: {
                        placement: 'bottom',
                        contentString: baseContent
                    },
                    targetFiles: {
                        inputPaths: [ 'test/tmp/someBottom.js' ]
                    }
                },

                metadataNoLineTerminator: {
                    settings: {
                        contentString: 'console.log("loaded"); ',
                        omitLineBreak: false
                    },
                    targetFiles: {
                        inputPaths: [ 'test/tmp/someNoLineBreak.js' ]
                    }
                },

                processedMetadata: {
                    settings: {
                        transformContent: dynamicContentCreator
                    },
                    targetFiles: {
                        inputPaths: [ 'test/tmp/someProcess.js' ]
                    }
                },

                patternMatchedMetadataStart: {
                    settings: {
                        placement: 'top',
                        contentString: baseContent,
                        searchPattern: 'var variable',
                        omitLineBreak: true

                    },
                    targetFiles: {
                        inputPaths: [
                            'test/tmp/someMatchingPatternTop.js',
                            'test/tmp/someNotMatchingPattern.js'
                        ]
                    }
                },

                patternMatchedMetadataEnd: {
                    settings: {
                        placement: 'bottom',
                        contentString: baseContent,
                        searchPattern: 'var variable'
                    },
                    targetFiles: {
                        inputPaths: [
                            'test/tmp/someMatchingPatternBottom.js'
                        ]
                    }
                }
            }
        };
    };

    const setupUnitTestExecutor = () => ({
        unitTestRunner: {
            testOutputs: ['test/*_test.js']
        }
    });

    let projectBlueprint = {};
    Object.assign(projectBlueprint, obtainLinterDetails());
    Object.assign(projectBlueprint, setupCleaningProcedure());
    Object.assign(projectBlueprint, establishReplicationParameters());
    Object.assign(projectBlueprint, defineApplicationDefaults());
    Object.assign(projectBlueprint, configureMetadataInjection());
    Object.assign(projectBlueprint, setupUnitTestExecutor());

    buildTool.configureProject(projectBlueprint);

    buildTool.ingestCustomModules('tasks');

    buildTool.incorporateExternalPlugins('grunt-contrib-jshint');
    buildTool.incorporateExternalPlugins('grunt-contrib-clean');
    buildTool.incorporateExternalPlugins('grunt-contrib-nodeunit');
    buildTool.incorporateExternalPlugins('grunt-contrib-copy');

    buildTool.defineWorkflow('validationRun', ['codeQualityCheck', 'cleanupArtifacts', 'replicateFiles', 'injectMetadata', 'unitTestRunner']);

    buildTool.defineWorkflow('standardExecution', ['validationRun']);

};