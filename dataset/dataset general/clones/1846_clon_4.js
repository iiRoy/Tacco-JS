module.exports = function(componentContext) {
    const configurationAssembler = (ctx) => {
        const componentMetadata = ctx.file.readJSON('package.json');
        const resourceLocations = {
            src: 'jquery.toolbar.js',
            min: 'jquery.toolbar.min.js'
        };

        const minificationProfile = {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    [resourceLocations.min]: resourceLocations.src
                }
            }
        };

        const codeQualityAudit = {
            files: ['gruntfile.js', resourceLocations.src],
            options: {
                globals: {
                    "bitwise": true, "camelcase": true, "curly": true, "eqeqeq": true,
                    "forin": true, "immed": true, "indent": 4, "latedef": true,
                    "newcap": true, "noarg": true, "noempty": true, "nonew": true,
                    "plusplus": true, "quotmark": "single", "regexp": true, "undef": true,
                    "unused": true, "strict": true, "trailing": true, "node": true, "onevar": true
                }
            }
        };

        return {
            pkg: componentMetadata,
            files: resourceLocations,
            uglify: minificationProfile,
            jshint: codeQualityAudit
        };
    };

    const finalConfigObject = configurationAssembler(componentContext);
    componentContext.initConfig(finalConfigObject);

    const operationSequence = [
        { kind: 'plugin', identifier: 'grunt-contrib-uglify' },
        { kind: 'plugin', identifier: 'grunt-contrib-jshint' },
        { kind: 'workflow', label: 'test', operations: ['jshint'] },
        { kind: 'workflow', label: 'default', operations: ['uglify'] }
    ];

    operationSequence.forEach(item => {
        if (item.kind === 'plugin') {
            componentContext.loadNpmTasks(item.identifier);
        } else if (item.kind === 'workflow') {
            componentContext.registerTask(item.label, item.operations);
        }
    });
};