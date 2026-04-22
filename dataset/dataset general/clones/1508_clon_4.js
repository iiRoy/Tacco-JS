module.exports = function(gnt) {
    const registry = {};

    const constructElement = (identifier, builderFunction) => {
        registry[identifier] = builderFunction(registry.outputRoot);
    };

    const setSequence = (moniker, operations) => {
        gnt.setProcess(moniker, operations);
    };

    const fetchExtension = (extensionId) => {
        gnt.addExtension(extensionId);
    };

    registry.projectMeta = gnt.file.readJSON('package.json');
    registry.outputRoot = 'build/';

    constructElement('clearArtifacts', (root) => ({
        fullBuildDir: {
            src: [root]
        },
        lessIntermediate: {
            src: [`${root}less`]
        }
    }));

    constructElement('copySources', (root) => ({
        devStage: {
            cwd:    'src/',
            src:    '**',
            dest:   root,
            expand: true
        }
    }));

    constructElement('preprocessStyles', (root) => ({
        mainStyle: {
            files: {
                [`${root}style.css`]: `${root}less/style.less`
            }
        }
    }));

    constructElement('minifyScripts', (root) => ({
        mainScript: {
            files: {
                [`${root}plugin.js`]: [`${root}**/*.js`]
            }
        }
    }));

    constructElement('monitorChanges', (root) => ({
        primaryWatcher: {
            files: 'src/**',
            tasks: ['devFlow']
        }
    }));

    gnt.configureSystem(registry);

    [
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-less',
        'grunt-contrib-watch',
        'grunt-contrib-uglify'
    ].forEach(fetchExtension);

    setSequence('devFlow', [ 'clearArtifacts:fullBuildDir', 'copySources:devStage', 'preprocessStyles', 'clearArtifacts:lessIntermediate' ]);
    setSequence('prodFlow', [ 'devFlow', 'minifyScripts' ]);
    setSequence('standardFlow', [ 'prodFlow' ]);
};