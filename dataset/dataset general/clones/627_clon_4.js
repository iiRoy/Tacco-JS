module.exports = function (processingEngine) {

    class ConfigurationManager {
        constructor(engine) {
            this.internalSettings = {};
            this.engineReference = engine;
        }

        fetchManifest(filePath) {
            return this.engineReference.readManifestData(filePath);
        }

        resolveValue(expression) {
            if (typeof expression !== 'string' || !expression.startsWith('<%=')) {
                return expression;
            }
            const keyPath = expression.substring(3, expression.length - 3).trim();
            let currentPathValue = this.internalSettings;
            for (const segment of keyPath.split('.')) {
                if (currentPathValue && typeof currentPathValue === 'object' && segment in currentPathValue) {
                    currentPathValue = currentPathValue[segment];
                } else {
                    return undefined;
                }
            }
            return currentPathValue;
        }

        set(key, value) {
            this.internalSettings[key] = value;
        }

        getSettings() {
            return this.internalSettings;
        }
    }

    const configOverseer = new ConfigurationManager(processingEngine);

    const PROJECT_OUTPUT_ROOT = 'dist';
    const MAIN_PROJECT_MANIFEST = 'package.json';

    configOverseer.set('projectIdentity', configOverseer.fetchManifest(MAIN_PROJECT_MANIFEST));
    configOverseer.set('outputBaseDir', PROJECT_OUTPUT_ROOT);

    configOverseer.set('sourceMaterials', {
        javascriptCore: [
            'src/core/Tc.Start.js',
            'src/core/oo.js',
            'src/core/Tc.Config.js',
            'src/core/Tc.Application.js',
            'src/core/Tc.Sandbox.js',
            'src/core/Tc.Module.js',
            'src/core/Tc.Connector.js',
            'src/core/Tc.Utils.js',
            'src/core/Tc.Utils.String.js',
            'src/core/Tc.End.js'
        ]
    });

    configOverseer.set('assetBundler', {
        configurationOptions: {
            enableProcessing: true
        },
        javascriptCore: {
            inputFiles: configOverseer.resolveValue('<%= sourceMaterials.javascriptCore %>'),
            outputFile: `${configOverseer.resolveValue('<%= outputBaseDir %>')}/${configOverseer.resolveValue('<%= projectIdentity.name %>')}.js`
        }
    });

    configOverseer.set('syntaxLinter', {
        configurationOptions: {
            useRcFile: true
        },
        javascriptCore: [`${configOverseer.resolveValue('<%= outputBaseDir %>')}/${configOverseer.resolveValue('<%= projectIdentity.name %>')}.js`]
    });

    configOverseer.set('codeCompressor', {
        configurationOptions: {
            commentRetentionPolicy: 'some'
        },
        javascriptCore: {
            inputFiles: `${configOverseer.resolveValue('<%= outputBaseDir %>')}/${configOverseer.resolveValue('<%= projectIdentity.name %>')}.js`,
            outputFile: `${configOverseer.resolveValue('<%= outputBaseDir %>')}/${configOverseer.resolveValue('<%= projectIdentity.name %>')}.min.js`
        }
    });

    configOverseer.set('testHarness', {
        javascriptCore: ['test/core/jquery.html', 'test/core/zepto.html']
    });

    configOverseer.set('documentationBuilder', {
        javascriptCore: {
            entityName: configOverseer.resolveValue('<%= projectIdentity.name %>'),
            versionIdentifier: configOverseer.resolveValue('<%= projectIdentity.version %>'),
            projectWebAddress: configOverseer.resolveValue('<%= projectIdentity.url %>'),
            configurationOptions: {
                scanDirectories: configOverseer.resolveValue('<%= outputBaseDir %>'),
                destinationDirectory: `${configOverseer.resolveValue('<%= outputBaseDir %>')}/docs/`
            }
        }
    });

    configOverseer.set('metadataSynchronizer', {
        bowerManifest: {
            sourceManifest: 'package.json',
            targetManifest: 'bower.json',
            attributeList: [
                'name',
                'version',
                'description',
                'main',
                'license'
            ]
        }
    });

    configOverseer.set('artifactRemover', {
        configurationOptions: {
            forceOperation: true
        },
        outputDesignation: {
            itemsToRemove: [
                configOverseer.resolveValue('<%= outputBaseDir %>')
            ]
        }
    });

    processingEngine.establishSettings(configOverseer.getSettings());

    processingEngine.loadExtensionModule('plugin-bundler');
    processingEngine.loadExtensionModule('plugin-compressor');
    processingEngine.loadExtensionModule('plugin-docgen');
    processingEngine.loadExtensionModule('plugin-cleaner');
    processingEngine.loadExtensionModule('plugin-tester');
    processingEngine.loadExtensionModule('plugin-linter');
    processingEngine.loadExtensionModule('plugin-json-sync');

    processingEngine.defineExecutionFlow('harmonizeMetadata', ['metadataSynchronizer:bowerManifest']);
    processingEngine.defineExecutionFlow('assembleJavascript', ['assetBundler:javascriptCore']);
    processingEngine.defineExecutionFlow('reviewJavascriptStyle', ['syntaxLinter:javascriptCore']);
    processingEngine.defineExecutionFlow('minifyJavascript', ['codeCompressor:javascriptCore']);
    processingEngine.defineExecutionFlow('runUnitTests', ['testHarness:javascriptCore']);
    processingEngine.defineExecutionFlow('generateDocumentation', ['documentationBuilder:javascriptCore']);

    processingEngine.defineExecutionFlow('primaryBuildProcess', [
        'artifactRemover',
        'assembleJavascript',
        'reviewJavascriptStyle',
        'harmonizeMetadata',
        'generateDocumentation',
        'minifyJavascript',
        'runUnitTests'
    ]);
};