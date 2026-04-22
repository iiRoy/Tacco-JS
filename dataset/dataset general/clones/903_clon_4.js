"use strict";
module.exports = function (processHost) {

    const obtainStructuredData = (path) => processHost.file.readJSON(path);
    const obtainRawText = (path) => processHost.file.read(path);

    const projectDetailsRaw = obtainStructuredData('component_manifest.json');
    const headerMaterialText = obtainRawText('intro_note.txt');

    const defineFlushOld = () => ({
        flushOld: {
            sources: ['dist_output', 'temporary_assets']
        }
    });

    const defineCombineSources = (appName) => ({
        combineSources: {
            configParameters: {
                header: '<%= intro_note_content %>',
                stripBanners: true
            },
            primaryModule: {
                origin: 'source_logic/components/visual_tree.js',
                destination: `dist_output/${appName}.js`
            }
        }
    });

    const defineMinifyCode = (appName) => ({
        minifyCode: {
            configParameters: {
                header: '<%= intro_note_content %>'
            },
            primaryModule: {
                origin: `dist_output/${appName}.js`,
                destination: `dist_output/${appName}.min.js`
            }
        }
    });

    const defineMonitorChanges = () => ({
        monitorChanges: {
            devWatch: {
                trackedFiles: [
                    'source_logic/**/*.js'
                ],
                activatedOperations: ['buildProcess']
            }
        }
    });

    const defineDocumentApi = (docTitle) => ({
        documentApi: {
            configParameters: {
                targetDirectory: 'temporary_assets',
                documentTitle: docTitle,
                html5Mode: false
            },
            allContent: ['source_logic/**/*.js']
        }
    });

    const assembleSettings = () => {
        const appName = projectDetailsRaw.name;
        return {
            component_manifest: projectDetailsRaw,
            intro_note_content: headerMaterialText,
            ...defineFlushOld(),
            ...defineCombineSources(appName),
            ...defineMinifyCode(appName),
            ...defineMonitorChanges(),
            ...defineDocumentApi("Frontend Tree Component Documentation")
        };
    };

    processHost.establishSettings(assembleSettings());

    const requiredExtensions = [
        'grunt-contrib-clean',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-watch',
        'grunt-contrib-connect',
        'grunt-contrib-copy',
        'grunt-ngdocs'
    ];

    requiredExtensions.forEach(extension => processHost.acquireExtensions(extension));

    const taskSequences = [
        { alias: 'initialSystemSetup', steps: ['flushOld', 'buildProcess'] },
        { alias: 'developmentWorkflow', steps: ['flushOld', 'buildProcess', 'serveApplication', 'monitorChanges'] },
        { alias: 'buildProcess', steps: ['combineSources', 'minifyCode'] }
    ];

    taskSequences.forEach(sequence => processHost.sequenceRegistrar(sequence.alias, sequence.steps));
};