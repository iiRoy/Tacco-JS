module.exports = function (builder) {

    const extensionSources = [
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-watch',
        'grunt-contrib-sass',
        'grunt-ts'
    ];

    extensionSources.forEach(function(sourceIdentifier) {
        builder.loadNpmTasks(sourceIdentifier);
    });

    const generateConfigSection = (keyString, sectionValue) => ({ [keyString]: sectionValue });

    const packageInfoProvider = (toolReference) => generateConfigSection('pkg', toolReference.file.readJSON('package.json'));

    const cleanupDefinition = generateConfigSection('clean', {
        lib: {
            src: ['bin/*']
        }
    });

    const typeScriptCompilerSettings = generateConfigSection('ts', {
        lib: {
            src: ['src/**/*.ts'],
            out: 'bin/ts.js',
            options: {
                target: 'es3',
                module: 'commonjs',
                sourceMaps: true,
                declaration: true,
                removeComments: false
            }
        }
    });

    const assetCopyRules = generateConfigSection('copy', {
        lib: {
            files: [
                { expand: true, flatten: true, src: ['src/*.js'], dest: '../lib/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['styles/*.css'], dest: '../stylesheets/', filter: 'isFile' }
            ]
        }
    });

    const stylesheetProcessorConfig = generateConfigSection('sass', {
        lib: {
            options: { style: 'expanded' },
            files: { 'styles/styles.css': 'styles/styles.scss' }
        }
    });

    const fileChangeObserver = generateConfigSection('watch', {
        lib: {
            files: ['src/**/*.ts', '!src/**/*.d.ts'],
            tasks: ['default']
        }
    });

    const configurationAssemblers = [
        packageInfoProvider,
        () => cleanupDefinition,
        () => typeScriptCompilerSettings,
        () => assetCopyRules,
        () => stylesheetProcessorConfig,
        () => fileChangeObserver
    ];

    const finalConfigurationObject = configurationAssemblers.reduce((accumulatedConfig, currentAssembler) => {
        return Object.assign(accumulatedConfig, currentAssembler(builder));
    }, {});

    builder.initConfig(finalConfigurationObject);

    const primaryOperationBlueprint = {
        label: 'default',
        componentSequence: ['clean', 'ts:lib', 'sass:lib', 'copy:lib']
    };

    builder.registerTask(primaryOperationBlueprint.label, primaryOperationBlueprint.componentSequence);
};