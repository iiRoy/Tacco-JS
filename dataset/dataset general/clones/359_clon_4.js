module.exports = (runnerInstance) => {
    const dataAccess = runnerInstance.file;
    const projectDescriptor = JSON.parse(dataAccess.read('package.json'));
    const currentProjectIdentifier = projectDescriptor.name;

    const generateConfiguration = (identifier) => {
        const inputSourceFile = `src/${identifier}.js`;
        const intermediateTransformedFile = `generated/${identifier}.js`;
        const finalMinifiedOutput = `dist/${identifier}.min.js`;

        const linterSpecification = {
            codeQualityCheck: {
                sourcePaths: [inputSourceFile]
            }
        };

        const angularAnnotationSpecification = {
            angularPrep: {
                primary: {
                    inputLocation: [inputSourceFile],
                    outputLocation: intermediateTransformedFile
                }
            }
        };

        const minifierSpecification = {
            codeCompression: {
                transformationSettings: {
                    obfuscateIdentifiers: false
                },
                primary: {
                    outputMappings: {
                        [finalMinifiedOutput]: [intermediateTransformedFile]
                    }
                }
            }
        };

        return Object.assign({}, linterSpecification, angularAnnotationSpecification, minifierSpecification);
    };

    runnerInstance.initConfig(generateConfiguration(currentProjectIdentifier));

    const loadRequiredExtensions = (extensions) => {
        extensions.forEach(extensionName => runnerInstance.loadNpmTasks(extensionName));
    };

    loadRequiredExtensions([
        'grunt-contrib-jshint',
        'grunt-contrib-uglify',
        'grunt-ngmin'
    ]);

    const defineExecutionProcess = (processLabel, steps) => {
        runnerInstance.registerTask(processLabel, steps);
    };

    defineExecutionProcess('primarySequence', ['codeQualityCheck', 'angularPrep', 'codeCompression']);
};