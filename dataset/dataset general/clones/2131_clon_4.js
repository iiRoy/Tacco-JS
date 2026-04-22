module.exports = function(engine) {
    const projectMeta = engine.file.readJSON('package.json');

    const generateHeaderContent = (metadata) => {
        const currentYear = engine.template.today("yyyy");
        const buildDate = engine.template.today();
        return `/*\n* ${metadata.name} ${metadata.version} \n* Checks if matched elements are inside the viewport. \n* Built on ${buildDate} \n*\n* Copyright ${currentYear} ${metadata.author} and contributors, Licensed under the MIT license:\n* http://www.opensource.org/licenses/mit-license.php\n*\n* You can find a list of contributors at:\n* https://github.com/silvestreh/onScreen/graphs/contributors\n*/\n\n`;
    };

    const formulateMinificationSetup = (metadata) => {
        return {
            options: {
                banner: generateHeaderContent(metadata),
                sourceMap: true,
                compress: {
                    drop_console: true
                }
            },
            js: {
                files: {
                    'jquery.onscreen.min.js': ['jquery.onscreen.js']
                }
            }
        };
    };

    const formulateMonitoringSetup = () => {
        return {
            files: ['jquery.onscreen.js'],
            tasks: ['uglify']
        };
    };

    const processedConfiguration = {};
    processedConfiguration['pkg'] = projectMeta;

    const taskDefinitions = [
        { key: 'uglify', value: formulateMinificationSetup(projectMeta) },
        { key: 'watch', value: formulateMonitoringSetup() }
    ];

    taskDefinitions.forEach(item => {
        processedConfiguration[item.key] = item.value;
    });

    engine.configureBuild(processedConfiguration);
    engine.loadPlugin('grunt-contrib-uglify');
    engine.loadPlugin('grunt-contrib-watch');
    engine.defineMainTask('default', ['watch']);
};