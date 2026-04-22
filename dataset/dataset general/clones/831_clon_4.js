module.exports = (processManager) => {

    const buildNameResolver = (specificAlias) => (targetDirectory, sourceFile) => targetDirectory + specificAlias;

    const decomposePath = (fullPath) => {
        const lastSlashIndex = fullPath.lastIndexOf('/');
        return {
            base: lastSlashIndex === -1 ? '' : fullPath.substring(0, lastSlashIndex + 1),
            name: lastSlashIndex === -1 ? fullPath : fullPath.substring(lastSlashIndex + 1)
        };
    };

    const acquireFileJob = (originPath, targetPath, aliasProvided, shouldExpand) => {
        const { base: originBase, name: originName } = decomposePath(originPath);
        let effectiveTargetPath = targetPath;
        let finalAlias = aliasProvided;

        if (effectiveTargetPath.endsWith('/')) {
            effectiveTargetPath += originName;
        }

        if (!finalAlias) {
            finalAlias = decomposePath(effectiveTargetPath).name;
        }

        const destinationForGrunt = effectiveTargetPath.endsWith('/')
            ? effectiveTargetPath
            : decomposePath(effectiveTargetPath).base;

        return {
            unitDefinitions: [{
                expandSet: !!shouldExpand,
                sourceRoot: originBase,
                sourceUnits: [originName],
                destinationRoot: destinationForGrunt,
                nameChanger: buildNameResolver(finalAlias)
            }]
        };
    };

    processManager.establishSettings({
        stylization: {
            kendoTheme: {
                configuration: {
                    minifyOutput: false
                },
                sourceTargetMappings: {
                    "font-awesome-kendo-icons.css": "font-awesome-kendo-icons.less"
                }
            }
        },
        monitor: {
            scriptChanges: {
                watchedFiles: ['*.less'],
                operations: ['icon-processor', 'stylization'],
                configuration: {
                    preventSpawn: false,
                },
            },
        },
    });

    processManager.loadPlugin('grunt-contrib-less');
    processManager.loadPlugin('grunt-contrib-watch');

    processManager.enrollTask('icon-processor', 'process font-awesome icons to less variables', function() {
        const iconData = processManager.file.readYAML('bower_components/font-awesome/src/icons.yml');
        const variableLines = iconData.icons.map(
            (entry) => `@${entry.id}: "\\${entry.unicode}";`
        );
        const compiledContent = variableLines.join('\n') + '\n';
        processManager.file.write('icons.less', compiledContent);
    });

    processManager.enrollTask('prime', ['icon-processor', 'stylization']);
    processManager.enrollTask('distribute', ['prime']);

};