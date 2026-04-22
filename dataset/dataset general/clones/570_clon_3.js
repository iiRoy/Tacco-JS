module.exports = (taskRunner) => {

    const projectPaths = {
        source: 'source/',
        build: 'build/',
        distribution: 'dist/',
        packageJson: 'package.json'
    };

    const assetSubdirectories = {
        images: 'img/',
        scripts: 'js/',
        styles: 'css/',
        templates: 'assemble/'
    };

    const isProductionBuild = taskRunner.option('production') === true;

    taskRunner.initConfig({

        projectMetadata: taskRunner.file.readJSON(projectPaths.packageJson),

        templateProcessor: {
            configSettings: {
                mainLayout: 'page.hbs',
                layoutDirectory: `${projectPaths.source}${assetSubdirectories.templates}templates/layouts/`,
                partialTemplates: `${projectPaths.source}${assetSubdirectories.templates}templates/partials/**/*.hbs`,
                templateHelpers: `${projectPaths.source}${assetSubdirectories.templates}templates/helpers/**/*.js`,
                logOutput: true
            },
            localBuild: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.templates}content/_pages/`,
                        targetDir: projectPaths.build,
                        recursiveCopy: true,
                        flatStructure: true,
                        sourceFiles: ['**/*.hbs']
                    }
                ]
            },
            finalRelease: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.templates}content/_pages/`,
                        targetDir: projectPaths.distribution,
                        recursiveCopy: true,
                        flatStructure: true,
                        sourceFiles: ['**/*.hbs']
                    }
                ]
            }
        },

        resourceMover: {
            developmentEnv: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.images}`,
                        targetDir: `${projectPaths.build}${assetSubdirectories.images}`,
                        recursiveCopy: true,
                        sourceFiles: ['**/*']
                    }
                ]
            },
            productionEnv: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.images}`,
                        targetDir: `${projectPaths.distribution}${assetSubdirectories.images}`,
                        recursiveCopy: true,
                        sourceFiles: ['**/*']
                    }
                ]
            }
        },

        scriptBundler: {
            taskOptions: {
                importPattern: /^\/\/\s*include\s+['"]?([^'"]+)['"]?\s*$/
            },
            localDev: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.scripts}`,
                        targetDir: `${projectPaths.build}${assetSubdirectories.scripts}`,
                        recursiveCopy: true,
                        outputExtension: '.js',
                        sourceFiles: ['**/*.js']
                    }
                ]
            },
            finalDist: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.scripts}`,
                        targetDir: `${projectPaths.distribution}${assetSubdirectories.scripts}`,
                        recursiveCopy: true,
                        outputExtension: '.js',
                        sourceFiles: ['**/*.js']
                    }
                ]
            }
        },

        styleProcessor: {
            configSettings: {
                stripLineComments: true,
                cssOutputStyle: 'expanded',
                pluginDependencies: ['sass-globbing', 'compass/import-once', 'susy', 'compass-normalize'],
                sassSourceDir: `${projectPaths.source}sass/`,
                environmentSpecific: isProductionBuild ? { environment: 'production' } : { environment: 'development' }
            },
            localEnvironment: {
                configSettings: {
                    cssOutputDirectory: `${projectPaths.build}${assetSubdirectories.styles}`,
                    generateSourceMaps: true,
                    lineNumbers: true
                }
            },
            productionEnvironment: {
                configSettings: {
                    cssOutputDirectory: `${projectPaths.distribution}${assetSubdirectories.styles}`,
                    generateSourceMaps: false,
                    cssOutputStyle: 'compressed'
                }
            }
        },

        styleMinifier: {
            finalDist: {
                options: {
                    keepSpecialComments: 0
                },
                files: [
                    {
                        basePath: `${projectPaths.distribution}${assetSubdirectories.styles}`,
                        targetDir: `${projectPaths.distribution}${assetSubdirectories.styles}`,
                        recursiveCopy: true,
                        sourceFiles: ['*.css']
                    }
                ]
            }
        },

        scriptCompressor: {
            mainBundle: {
                files: {
                    [`${projectPaths.distribution}${assetSubdirectories.scripts}app.min.js`]: [`${projectPaths.distribution}${assetSubdirectories.scripts}main.js`],
                }
            },
            vendorBundle: {
                files: {
                    [`${projectPaths.distribution}${assetSubdirectories.scripts}vendor.min.js`]: [`${projectPaths.distribution}${assetSubdirectories.scripts}vendor.js`],
                }
            }
        },

        fileSynchronizer: {
            devJsSync: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.scripts}`,
                        targetDir: `${projectPaths.build}${assetSubdirectories.scripts}`,
                        sourceFiles: '**/*'
                    }
                ]
            },
            devAssetSync: {
                files: [
                    {
                        basePath: `${projectPaths.source}${assetSubdirectories.images}`,
                        targetDir: `${projectPaths.build}${assetSubdirectories.images}`,
                        sourceFiles: '**/*'
                    },
                    {
                        basePath: `${projectPaths.source}fonts/`,
                        targetDir: `${projectPaths.build}fonts/`,
                        sourceFiles: '**/*'
                    }
                ]
            }
        },

        fileMonitor: {
            configSettings: {
                autoReload: true,
                spawn: false
            },
            sassFiles: {
                files: [`${projectPaths.source}sass/**/*.scss`],
                tasks: ['styleProcessor:localEnvironment']
            },
            jsFiles: {
                files: [`${projectPaths.source}${assetSubdirectories.scripts}/**/*.js`],
                tasks: ['scriptBundler:localDev', 'fileSynchronizer:devJsSync']
            },
            templateFiles: {
                files: [`${projectPaths.source}${assetSubdirectories.templates}**/*.{json,hbs}`],
                tasks: ['templateProcessor:localBuild']
            },
            imageAssets: {
                files: [`${projectPaths.source}${assetSubdirectories.images}/**/*.{png,jpg,gif,svg}`],
                tasks: ['resourceMover:developmentEnv', 'fileSynchronizer:devAssetSync']
            }
        },

        localHost: {
            devServer: {
                configSettings: {
                    serverPort: 9000,
                    serverRoot: `./${projectPaths.build}`,
                    hostname: '0.0.0.0',
                    keepalive: false
                }
            }
        },

        cleanup: {
            options: {
                force: true
            },
            all: [`${projectPaths.build}**/*`, `${projectPaths.distribution}**/*`],
            development: [`${projectPaths.build}**/*`],
            production: [`${projectPaths.distribution}**/*`]
        }

    });

    taskRunner.loadNpmTasks('assemble');

    taskRunner.loadNpmTasks('grunt-sync');
    taskRunner.loadNpmTasks('grunt-includes');
    taskRunner.loadNpmTasks('grunt-contrib-copy');
    taskRunner.loadNpmTasks('grunt-contrib-clean');

    taskRunner.loadNpmTasks('grunt-contrib-compass');
    taskRunner.loadNpmTasks('grunt-contrib-cssmin');

    taskRunner.loadNpmTasks('grunt-contrib-uglify');

    taskRunner.loadNpmTasks('grunt-contrib-connect');
    taskRunner.loadNpmTasks('grunt-contrib-watch');

    taskRunner.registerTask('defaultWorkflow', ['devBuildWorkflow']);

    taskRunner.registerTask('devBuildWorkflow', 'Performs a development build and starts the server with file watching.', (target) => {
        taskRunner.log.writeln('\nRunning development build workflow...');

        if (target === 'quick') {
            taskRunner.log.writeln('Performing a quick development build (skipping cleanup).');
            taskRunner.task.run([
                'resourceMover:developmentEnv',
                'styleProcessor:localEnvironment',
                'scriptBundler:localDev',
                'templateProcessor:localBuild',
                'fileSynchronizer:devJsSync',
                'fileSynchronizer:devAssetSync',
                'localHost:devServer',
                'fileMonitor'
            ]);
        } else {
            taskRunner.log.writeln('Performing full development build with initial cleanup.');
            taskRunner.task.run([
                'cleanup:development',
                'resourceMover:developmentEnv',
                'styleProcessor:localEnvironment',
                'scriptBundler:localDev',
                'templateProcessor:localBuild',
                'fileSynchronizer:devJsSync',
                'fileSynchronizer:devAssetSync',
                'localHost:devServer',
                'fileMonitor'
            ]);
        }
    });

    taskRunner.registerTask('prodBuildWorkflow', 'Generates a minified, optimized production-ready build.', () => {
        taskRunner.log.writeln('\nInitiating production build process...');

        const productionTasks = [
            'cleanup:production',
            'resourceMover:productionEnv',
            'styleProcessor:productionEnvironment',
            'styleMinifier:finalDist',
            'scriptBundler:finalDist',
            'scriptCompressor:mainBundle',
            'scriptCompressor:vendorBundle',
            'templateProcessor:finalRelease'
        ];

        if (!taskRunner.file.exists(projectPaths.packageJson)) {
            taskRunner.log.error('Error: package.json not found. Cannot proceed with production build without project metadata.');
            return false;
        }

        taskRunner.task.run(productionTasks);

        taskRunner.log.ok('Production build completed successfully!');
    });

    taskRunner.registerTask('check-paths', 'Logs the defined project paths for verification.', function() {
        taskRunner.log.writeln('--- Project Path Configuration ---');
        taskRunner.log.writeln(`Source Directory: ${projectPaths.source}`);
        taskRunner.log.writeln(`Build Output Directory: ${projectPaths.build}`);
        taskRunner.log.writeln(`Distribution Output Directory: ${projectPaths.distribution}`);
        taskRunner.log.writeln('----------------------------------');
    });

};