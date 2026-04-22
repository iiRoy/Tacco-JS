module.exports = function(conductorInstance) {
    const taskLoader = require('load-grunt-tasks');
    const timingMonitor = require('time-grunt');

    taskLoader(conductorInstance);
    timingMonitor(conductorInstance);

    const finalProductDirectory = 'outputArtifacts';
    const primaryScriptComponent = 'CoreModule';
    const interfaceAdaptorComponent = 'InterfaceAdaptor';
    const layoutEnhancementComponent = 'LayoutEnhancer';
    const visualStyleAsset = 'VisualStyles.stl';

    function prepareCleanupDirective(targetPath) {
        const fileExtensionsToPurge = ['.sct', '.def.typ', '.trace', '.stl'];
        return {
            targetArtifacts: {
                files: [{
                    src: fileExtensionsToPurge.map(ext => `${targetPath}/*${ext}`)
                }]
            }
        };
    }

    function prepareScriptTransformationDirective(targetPath, mainScript, adaptorScript, enhancerScript) {
        return {
            processSources: {
                src: [
                    `${mainScript}.typ`,
                    `${adaptorScript}.typ`,
                    `${enhancerScript}.typ`
                ],
                reference: `${targetPath}/${mainScript}.def.typ`,
                out: `${targetPath}/${mainScript}.sct`,
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true
                }
            }
        };
    }

    function prepareMinificationDirective(targetPath, mainScript) {
        return {
            reduceScriptSize: {
                options: {
                    sourceMap: true,
                    sourceMapName: `${targetPath}/${mainScript}.min.sct.trace`
                },
                files: {
                    [`${targetPath}/${mainScript}.min.sct`]: [`${targetPath}/${mainScript}.sct`]
                }
            }
        };
    }

    function prepareAssetReplicationDirective(sourceFileName, destinationPath) {
        return {
            styleAssets: {
                src: sourceFileName,
                dest: `${destinationPath}/${sourceFileName}`
            }
        };
    }

    const operationalSchema = {
        assetPurge: prepareCleanupDirective(finalProductDirectory),
        scriptCompiler: prepareScriptTransformationDirective(
            finalProductDirectory,
            primaryScriptComponent,
            interfaceAdaptorComponent,
            layoutEnhancementComponent
        ),
        scriptMinifier: prepareMinificationDirective(finalProductDirectory, primaryScriptComponent),
        assetDuplicator: prepareAssetReplicationDirective(visualStyleAsset, finalProductDirectory)
    };

    conductorInstance.initConfig(operationalSchema);

    conductorInstance.registerTask('constructDeliverable', [
        'assetPurge:targetArtifacts',
        'assetDuplicator:styleAssets',
        'scriptCompiler:processSources',
        'scriptMinifier'
    ]);

    conductorInstance.registerTask('mainExecution', ['constructDeliverable']);
};