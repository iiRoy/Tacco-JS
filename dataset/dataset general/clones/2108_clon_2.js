module.exports=function(buildTool){/* This function configures the build tasks for the project. */

    // Load necessary Grunt plugins to extend functionality
    buildTool.loadNpmTasks('grunt-contrib-clean');
    buildTool.loadNpmTasks('grunt-contrib-copy');
    buildTool.loadNpmTasks('grunt-contrib-watch');
    buildTool.loadNpmTasks('grunt-contrib-sass');
    buildTool.loadNpmTasks('grunt-ts');

    buildTool.initConfig(
    {
        /* Project metadata from package.json */
        projectInfo: buildTool.file.readJSON('package.json'),

        // Task to remove generated files
        purify: {
            outputDir: {
                sourcePaths: ['bin/*']
            }
        },

        // TypeScript compilation task
        typeScriptCompile: {
            mainModule: {
                inputFiles: ['src/**/*.ts'],
                outputFile: 'bin/ts.js',
                compilerOpts: {
                    codeTarget: 'es3',
                    moduleKind: 'commonjs',
                    generateMaps: true,
                    emitDeclarations: true,
                    stripComments: false
                }
            }
        },

        // File distribution task
        distributeAssets: {
            resourceFiles: {
                fileMappings: [
                    { shouldExpand: true, shouldFlatten: true, sourceGlob: ['src/*.js'], targetPath: '../lib/', fileFilter: 'isFile' },
                    { shouldExpand: true, shouldFlatten: true, sourceGlob: ['styles/*.css'], targetPath: '../stylesheets/', fileFilter: 'isFile' }
                ]
            }
        },

        // SASS preprocessor task
        styleProcessor: {
            appStyles: {
                processorOpts: { outputStyle: 'expanded' },
                styleMaps: { 'styles/styles.css': 'styles/styles.scss' }
            }
        },

        // File monitoring for development
        fileWatcher: {
            devWatch: {
                watchedGlobs: ['src/**/*.ts', '!src/**/*.d.ts'],
                tasksToRun: ['default']
            }
        }
    });

    // Register the default task sequence
    buildTool.registerTask(
        'default',
        ['purify', 'typeScriptCompile:mainModule', 'styleProcessor:appStyles', 'distributeAssets:resourceFiles']
    );
}