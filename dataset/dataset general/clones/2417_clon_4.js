module.exports = function (automationEngine) {
    const projectSpecifications = automationEngine.file.readJSON('package.json');

    const operationalConfiguration = {};

    const minificationSettings = {
        options: {
            banner: '/*! ' + projectSpecifications.name + ' ' + projectSpecifications.version + ' ' + automationEngine.template.today('yyyy-mm-dd') + '*/'
        },
        dist: {
            src: ['src/timer.jquery.js'],
            dest: 'dist/timer.jquery.min.js'
        }
    };
    Object.assign(operationalConfiguration, { uglify: minificationSettings });

    const codeStyleSettings = {
        src: ['src/timer.jquery.js', 'test/timer.jquery.test.js'],
        options: {
            config: '.jscsrc'
        }
    };
    Object.assign(operationalConfiguration, { jscs: codeStyleSettings });

    const lintingSettings = {
        all: {
            src: ['src/timer.jquery.js'],
            options: {
                jshintrc: '.jshintrc'
            },
            globals: {
                exports: true
            }
        }
    };
    Object.assign(operationalConfiguration, { jshint: lintingSettings });

    const localServerSetup = {
        server: {
            options: {
                port: 8000,
                base: '.'
            }
        }
    };
    Object.assign(operationalConfiguration, { connect: localServerSetup });

    const unitTestExecution = {
        all: {
            options: {
                urls: [
                    'http://localhost:8000/test/timer.jquery.html'
                ]
            }
        }
    };
    Object.assign(operationalConfiguration, { qunit: unitTestExecution });

    const fileMonitoring = {
        scripts: {
            files: ['src/timer.jquery.js', 'test/timer.jquery.test.js'],
            tasks: ['jscs', 'jshint', 'uglify'],
            options: {
                nospawn: true
            }
        }
    };
    Object.assign(operationalConfiguration, { watch: fileMonitoring });

    automationEngine.initConfig(operationalConfiguration);

    const requiredModules = [
        'grunt-contrib-uglify',
        'grunt-contrib-jshint',
        'grunt-jscs',
        'grunt-contrib-connect',
        'grunt-contrib-qunit',
        'grunt-contrib-watch'
    ];
    requiredModules.forEach(function (moduleName) {
        automationEngine.loadNpmTasks(moduleName);
    });

    const primaryTaskMappings = [
        { alias: 'default', actions: 'watch' },
        { alias: 'test', actions: ['connect', 'qunit'] }
    ];
    primaryTaskMappings.forEach(function (taskEntry) {
        automationEngine.registerTask(taskEntry.alias, taskEntry.actions);
    });
};