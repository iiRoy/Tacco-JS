const projectManifest = {
    assetSources: {
        primaryScripts: [
            'automation_core.js',
            'utility_modules/**/*.js',
            'integrity_checks/*.js'
        ]
    },

    changeObservation: {
        monitoredPaths: 'primaryScripts'
    },

    integrityVerification: {
        entryPoints: 'integrity_checks/*.js'
    },

    codeFormattingAudit: {
        targetSources: 'primaryScripts'
    },

    dataReplicationSettings: JSON.parse(require('fs').readFileSync('replication_config.json', 'utf8')),

    codeMetricConfiguration: JSON.parse(require('fs').readFileSync('analysis_params.json', 'utf8')),

    activeToolkits: [
        'integrityVerificationToolkit',
        'codeMetricToolkit',
        'codeFormattingToolkit'
    ],

    definedWorkflows: {
        defaultOperation: [
            'codeFormattingAudit',
            'integrityVerification',
            'codeMetricComputation'
        ]
    },

    customModuleDirectory: 'utility_modules'
};