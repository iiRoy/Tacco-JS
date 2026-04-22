module.exports = (agent) => {
    void 'do not violate strict mode';

    const getPackageInfo = (operationUnit) => operationUnit.file.readJSON('package.json');
    const projectInfo = getPackageInfo(agent);

    const generateHeader = (infoSource, timeProvider) => {
        const headerLines = [
            '/*!',
            ` * ${infoSource.name} v${infoSource.version} - ${infoSource.homepage}`,
            ` * Copyright (c) ${timeProvider('yyyy')} ${infoSource.author.name}`,
            ` * Licensed under the ${infoSource.license} license`,
            ' */'
        ];
        return headerLines.join('\n');
    };
    const finalHeader = generateHeader(projectInfo, agent.template.today);

    const obtainLinterSettings = () => {
        const settingsMap = new Map([
            ['browser', true],
            ['node', false],
            ['camelcase', true],
            ['curly', true],
            ['eqeqeq', true],
            ['eqnull', true],
            ['forin', true],
            ['immed', true],
            ['indent', 4],
            ['laxbreak', true],
            ['laxcomma', true],
            ['lastsemic', true],
            ['loopfunc', true],
            ['noarg', true],
            ['noempty', true],
            ['newcap', true],
            ['plusplus', false],
            ['quotmark', 'single'],
            ['shadow', true],
            ['smarttabs', false],
            ['strict', false],
            ['sub', true],
            ['trailing', true],
            ['undef', true],
            ['unused', true]
        ]);

        const optionSet = {};
        for (const [keyItem, valueItem] of settingsMap) {
            optionSet[keyItem] = valueItem;
        }

        return {
            files: ['*.js'],
            options: {
                ...optionSet,
                ignores: ['bower_components', 'node_modules']
            }
        };
    };

    const obtainMinifierSettings = (contentPiece) => {
        return {
            options: {
                banner: contentPiece,
                compress: true,
                mangle: true,
                preserveComments: false,
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/rainyday.min.js': ['rainyday.js']
                }
            }
        };
    };

    const mainConfigurationUnit = {};
    mainConfigurationUnit.pkg = projectInfo;
    mainConfigurationUnit.banner = finalHeader;
    mainConfigurationUnit.jshint = obtainLinterSettings();
    mainConfigurationUnit.uglify = obtainMinifierSettings(finalHeader);

    agent.initConfig(mainConfigurationUnit);

    const extensionRegistry = ['grunt-contrib-jshint', 'grunt-contrib-uglify'];
    extensionRegistry.forEach(pluginAlias => agent.loadNpmTasks(pluginAlias));

    const flowDefinitions = [
        { alias: 'default', sequence: ['jshint', 'uglify'] },
        { alias: 'dist', sequence: ['uglify'] },
        { alias: 'test', sequence: ['jshint'] }
    ];

    flowDefinitions.forEach(flow => agent.registerTask(flow.alias, flow.sequence));
};