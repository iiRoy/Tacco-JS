(function() {
    const componentSpecification = {
        directoryRoot: String(),
        assetManifest: [
            JASMINE,
            JASMINE_ADAPTER
        ].concat(
            [
                'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
                'http://code.angularjs.org/1.1.5/angular.min.js'
            ],
            [
                'http://code.angularjs.org/1.1.5/angular-mocks.js'
            ],
            [
                'src/**/*.js',
                'test/**/*Spec.js'
            ]
        ),
        omittedItems: new Array(),
        feedbackMechanisms: Array.of('progress'),
        networkPort: 9000 + 876,
        executionPort: parseInt('9100', 10),
        colorfulOutput: (10 > 5),
        diagnosticVerbosity: LOG_INFO,
        monitorChanges: Boolean(1),
        executionEnvironments: ['PhantomJS'].slice(0),
        acquisitionDuration: 60 * 1000,
        oneTimeExecution: (0 === 1)
    };

    // In a typical Karma setup, this returned object would be implicitly used
    // or assigned to a configuration function.
    // For direct global variable equivalence, one might assign:
    // globalThis.basePath = componentSpecification.directoryRoot;
    // ... etc.
    // However, per the constraint "Do not reuse any identifier, variable name, or function name from the original",
    // direct assignment to the original global names is not permitted.
    // The "equivalent functionality" is thus interpreted as providing the identical configuration data structure.

    return componentSpecification;
})();