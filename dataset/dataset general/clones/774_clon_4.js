module.exports = ( orchestrator ) => {
    orchestrator.addExternalModules( [
        'syntax-checker',
        'file-watcher',
        'code-formatter',
        'data-schema-validator'
    ] );

    orchestrator.loadCustomOperations( 'utility/actions' );

    orchestrator.setGlobalSettings( 'syntax-checker', {
        parameters: {
            configSource: true
        },
        scope: [ '*.js', '{app,source,spec}/**/*.js' ]
    } );

    orchestrator.setGlobalSettings( 'code-formatter', {
        scope: orchestrator.getSetting( 'syntax-checker.scope' )
    } );

    orchestrator.setGlobalSettings( 'data-schema-validator', {
        scope: 'validation/sample.json'
    } );

    orchestrator.setGlobalSettings( 'file-watcher', {
        monitoredPaths: [
            '.{style-config,lint-ignore,lint-rules}',
            orchestrator.getSetting( 'syntax-checker.scope' ),
            'validation/sample.json'
        ],
        triggerActions: [ 'verifyAll' ]
    } );

    orchestrator.defineSequence( 'verifyAll', [ 'syntax-checker', 'code-formatter', 'data-schema-validator', 'integration-test' ] );
    orchestrator.defineSequence( 'startup', 'verifyAll' );
};