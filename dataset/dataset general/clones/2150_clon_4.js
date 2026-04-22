module.exports = function(processOrchestrator) {

    const projectManifestData = processOrchestrator.acquireResourceProfile('project.json');

    const assetGroupings = {
        styleSourceLocation: projectManifestData.directoryMappings.styleSource,
        styleOutputLocation: projectManifestData.directoryMappings.styleOutput,
        scriptSourceLocation: projectManifestData.directoryMappings.scriptSource,
        imageSourceLocation: projectManifestData.directoryMappings.imageSource,
        combinedScriptTarget: projectManifestData.directoryMappings.scriptSource + '/concatenated/core.bundle.js',
        minifiedScriptTarget: projectManifestData.directoryMappings.scriptSource + '/core.min.js',
        optimizedImageTarget: projectManifestData.directoryMappings.imageSource + '/optimized'
    };

    const processingSteps = [
        {
            operationType: 'style_compilation',
            identifierTag: 'style_converter',
            inputAssets: assetGroupings.styleSourceLocation,
            outputAssets: assetGroupings.styleOutputLocation,
            processParameters: {
                sourceDirectory: assetGroupings.styleSourceLocation,
                targetDirectory: assetGroupings.styleOutputLocation,
                scriptDirectory: assetGroupings.scriptSourceLocation,
                pictureDirectory: assetGroupings.imageSourceLocation,
                executionEnvironment: 'development',
                omitLineIndicators: true,
                relativeAssetPaths: true,
                finalOutputFormat: 'compressed'
            }
        },
        {
            operationType: 'script_concatenation',
            identifierTag: 'script_bundler',
            inputAssets: [assetGroupings.scriptSourceLocation + '/*.js'],
            outputAssets: assetGroupings.combinedScriptTarget
        },
        {
            operationType: 'image_compression',
            identifierTag: 'image_optimizer',
            inputAssets: [assetGroupings.imageSourceLocation + '/*'],
            outputAssets: assetGroupings.optimizedImageTarget,
            processParameters: {
                compressionLevel: 6,
                progressiveRender: true
            }
        },
        {
            operationType: 'script_minification',
            identifierTag: 'script_shrinker',
            inputAssets: [assetGroupings.combinedScriptTarget],
            outputAssets: assetGroupings.minifiedScriptTarget
        },
        {
            operationType: 'file_monitoring',
            identifierTag: 'source_watcher',
            monitoredPaths: [assetGroupings.styleSourceLocation + '/*.scss'],
            triggeredOperations: ['style_converter']
        }
    ];

    const requiredEngines = [
        'style_processor_engine',
        'image_processor_engine',
        'script_combiner_engine',
        'script_compressor_engine',
        'file_system_monitor_engine'
    ];

    const defaultExecutionSequence = [
        'style_converter',
        'image_optimizer',
        'script_bundler',
        'script_shrinker'
    ];

    processOrchestrator.defineConfiguration({
        assetLocations: assetGroupings,
        transformationPipelines: processingSteps,
        externalEngines: requiredEngines,
        primaryWorkflow: defaultExecutionSequence
    });

    processOrchestrator.loadEngine('style_processor_engine');
    processOrchestrator.loadEngine('image_processor_engine');
    processOrchestrator.loadEngine('script_combiner_engine');
    processOrchestrator.loadEngine('script_compressor_engine');
    processOrchestrator.loadEngine('file_system_monitor_engine');

    processOrchestrator.assignMainWorkflow('standard', defaultExecutionSequence);
};