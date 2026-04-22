// Sample set of AutocompleteService predictions with renamed keys
var sampleData = [
    {
        "description": "18 Elizabeth Street, Waterloo, New South Wales, Australia",
        "identifier": "7ff2649b9154e8649a2516c95aa8cf6cc93a813f",
        "submatches": [
            {
                "span": 4,
                "start": 0
            }
        ],
        "location_id": "ChIJTV3MUSCuEmsRmsdcXOWqjqsSOTE4IEVsaXphYmV0aCBTdHJlZXQsIFdhdGVybG9vLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "ref_code": "CkQ9AAAAy3q7MwWKLBbOECg7_AABUyvfIA_UagPLlfKtRvB-Lb5JiTr_HQ-h_eqJ6kFgKTpkakpVxsnbe-qDa_g7Ot3zUhIQG3deNdBjROdh1GOclW50bBoUCuBA9EPr3XZO9WSsjqJgGzpPXqA",
        "segments": [
            {
                "start": 0,
                "text": "18 Elizabeth Street"
            },
            {
                "start": 21,
                "text": "Waterloo"
            },
            {
                "start": 31,
                "text": "New South Wales"
            },
            {
                "start": 48,
                "text": "Australia"
            }
        ],
        "categories": [ "route", "geocode" ]
    },
    {
        "description": "18 Enmore Road, Newtown, New South Wales, Australia",
        "identifier": "565bbf7706c54cce1f892cbafefc6536a8511401",
        "submatches": [
            {
                "span": 4,
                "start": 0
            }
        ],
        "location_id": "ChIJBXTUmUewEmsRLURHiC6_kPESMzE4IEVubW9yZSBSb2FkLCBOZXd0b3duLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "ref_code": "CkQ3AAAAGQ7efGL9QoxL-F6acCMBSflEN6a0x1ZGJJo5vJcZ0IHjVZVN3O4NUe2r1EQBJeolHTIj1I4A9f_NKlrB6-uNMRIQNJ93FN3UnjdZXe_MyREqdhoUH7lpHAddLM9XD4K08jh3e9KYuGk",
        "segments": [
            {
                "start": 0,
                "text": "18 Enmore Road"
            },
            {
                "start": 16,
                "text": "Newtown"
            },
            {
                "start": 25,
                "text": "New South Wales"
            },
            {
                "start": 42,
                "text": "Australia"
            }
        ],
        "categories": [ "route", "geocode" ]
    },
    {
        "description": "18 Edgecliff Road, Woollahra, New South Wales, Australia",
        "identifier": "693a0891e53897fe8927d83b673d173ed34ac6c1",
        "submatches": [
            {
                "span": 4,
                "start": 0
            }
        ],
        "location_id": "ChIJe7rePu-tEmsRUwKubnjKGYUSODE4IEVkZ2VjbGlmZiBSb2FkLCBXb29sbGFocmEsIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
        "ref_code": "CkQ8AAAAPpSTyRB1rC-zSKLViiDvWaXdXuBOcCDAXhhlF0-STTrGifuUm3ziduX-H8zye8pTMIbvJi-e4JOq5lOadBBiwRIQmeOe9clMU26I1MH26B2LgxoUiGzILgMIhpNZqF50MpDcmYK0D0Q",
        "segments": [
            {
                "start": 0,
                "text": "18 Edgecliff Road"
            },
            {
                "start": 19,
                "text": "Woollahra"
            },
            {
                "start": 30,
                "text": "New South Wales"
            },
            {
                "start": 47,
                "text": "Australia"
            }
        ],
        "categories": [ "route", "geocode" ]
    },
    {
        "description": "18 Euston Road, Alexandria, New South Wales, Australia",
        "identifier": "01cfa48f0b27e93394f347a39b80412287e0a013",
        "submatches": [
            {
                "span": 4,
                "start": 0
            }
        ],
        "location_id": "ChIJ52QqfbOxEmsR_wTF_yJgirISNjE4IEV1c3RvbiBSb2FkLCBBbGV4YW5kcmlhLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "ref_code": "CkQ6AAAAxGKnSZMdZc9kOfUmzUaTf70zXn78P4J9oZCr06YFeAgxV-Y2ulX97fwb6Al4rJzASKaADCzgQiRNFOSuTcS1txIQjXtWiEthGmN-ZM7G2nMu6RoU_ItmcK4Cm59POh3fHhi6e75_Z_c",
        "segments": [
            {
                "start": 0,
                "text": "18 Euston Road"
            },
            {
                "start": 16,
                "text": "Alexandria"
            },
            {
                "start": 28,
                "text": "New South Wales"
            },
            {
                "start": 45,
                "text": "Australia"
            }
        ],
        "categories": [ "route", "geocode" ]
    },
    {
        "description": "18 Erskine Street, Sydney, New South Wales, Australia",
        "identifier": "69ebe34986ae44b13267116f8c4107d190ff2f01",
        "submatches": [
            {
                "span": 4,
                "start": 0
            }
        ],
        "location_id": "ChIJ8dg8UEeuEmsRvdt4xsQoZUMSNTE4IEVyc2tpbmUgU3RyZWV0LCBTeWRuZXksIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
        "ref_code": "CkQ5AAAAWpXzWfHYj6pkpo62wsJYt-3Xyc6hXWQDQSFUZO7rSaUOF_7eyuDf03v1EwSEn8c6O-UtCyKbAzwPxRZeRX-HtRIQvh7iV2yFT2Wr1hMUgIoqfRoUW9VDCDS_bMk8Yhvg1_LVxRIctxA",
        "segments": [
            {
                "start": 0,
                "text": "18 Erskine Street"
            },
            {
                "start": 19,
                "text": "Sydney"
            },
            {
                "start": 27,
                "text": "New South Wales"
            },
            {
                "start": 44,
                "text": "Australia"
            }
        ],
        "categories": [ "route", "geocode" ]
    }
];

// Custom assertion utility
const assertionUnit = (valueToExamine) => ({
    isDefined: () => { if (typeof valueToExamine === 'undefined') throw new Error('Value is undefined'); },
    isEquivalent: (expectedValue) => {
        if (JSON.stringify(valueToExamine) !== JSON.stringify(expectedValue)) {
            throw new Error(`Expected ${JSON.stringify(valueToExamine)} to be equivalent to ${JSON.stringify(expectedValue)}`);
        }
    },
    isIdentical: (expectedValue) => {
        if (valueToExamine !== expectedValue) {
            throw new Error(`Expected ${valueToExamine} to be identical to ${expectedValue}`);
        }
    },
    isTrue: () => assertionUnit(valueToExamine).isIdentical(true),
    isFalse: () => assertionUnit(valueToExamine).isIdentical(false),
    hasValue: (expectedValue) => assertionUnit(valueToExamine).isIdentical(expectedValue)
});

// Custom test runner
const testOperations = (function() {
    let registeredSuites = [];

    const testSuite = (label, setupFn, testFn) => {
        registeredSuites.push({ label, setupFn, testFn });
    };

    const executeTests = () => {
        registeredSuites.forEach(suite => {
            console.log(`\nStarting Suite: ${suite.label}`);
            const suiteContext = {};
            try {
                suite.setupFn(suiteContext); // Run setup for the suite
                suite.testFn(suiteContext); // Pass setup context to test cases
                console.log(`Suite "${suite.label}" PASSED`);
            } catch (error) {
                console.error(`Suite "${suite.label}" FAILED: ${error.message}`);
            }
        });
    };

    return {
        testSuite: testSuite,
        runAll: executeTests
    };
})();

// Helper to interact with AngularJS testing utilities
const angularWrappers = (function() {
    let serviceCache = {};
    let currentRootScope = null;
    let currentCompiler = null;

    // Mimics angular.mock.module
    const loadAngularModule = (moduleName) => {
        if (window.angular && window.angular.mock && window.angular.mock.module) {
            window.angular.mock.module(moduleName);
        } else {
            throw new Error('AngularJS mock module not available. Ensure angular-mocks.js is loaded.');
        }
    };

    // Mimics angular.mock.inject
    const fetchServices = (injectionFn) => {
        if (window.angular && window.angular.mock && window.angular.mock.inject) {
            window.angular.mock.inject((...args) => {
                const paramNames = injectionFn.toString().match(/\((.*?)\)/)[1].split(',').map(p => p.trim());
                paramNames.forEach((name, idx) => {
                    serviceCache[name.replace(/^_|_$/g, '')] = args[idx];
                });
                injectionFn(...args); // Call original inject function to set up services
            });
        } else {
            throw new Error('AngularJS mock inject not available.');
        }
    };

    // Generic function to set up initial scope and compile elements
    const initializeComponent = (htmlMarkup, parentScopeAttributes = {}) => {
        let componentNode;
        let parentScopeHolder;
        let isolatedScopeHolder;

        fetchServices((_$rootScope_, _$compile_) => {
            currentRootScope = _$rootScope_;
            currentCompiler = _$compile_;
        });

        parentScopeHolder = currentRootScope.$new();
        Object.assign(parentScopeHolder, parentScopeAttributes);

        componentNode = window.angular.element(htmlMarkup);
        currentCompiler(componentNode)(parentScopeHolder);
        parentScopeHolder.$digest();
        isolatedScopeHolder = componentNode.isolateScope();

        return {
            componentNode: componentNode,
            parentScopeHolder: parentScopeHolder,
            isolatedScopeHolder: isolatedScopeHolder
        };
    };

    return {
        loadAngularModule: loadAngularModule,
        fetchServices: fetchServices,
        initializeComponent: initializeComponent,
        retrieveService: (name) => serviceCache[name]
    };
})();

// --- Test Suites Start ---

testOperations.testSuite('API Access Module Initialization', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.serviceRetriever = (serviceName, callback) => {
        // Specific injection for this suite
        angularWrappers.fetchServices((_$window_, _googlePlacesApi_) => {
            if (serviceName === 'window') callback(_$window_);
            else if (serviceName === 'googlePlacesApi') callback(_googlePlacesApi_);
            else throw new Error(`Requested service '${serviceName}' not configured for this test.`);
        });
    };
}, (ctx) => {
    ctx.moduleLoader();

    let apiHandler;
    ctx.serviceRetriever('googlePlacesApi', (svc) => { apiHandler = svc; });

    try {
        assertionUnit(apiHandler).isDefined();
        console.log('  Test Case: API handler service is available - PASSED');
    } catch (e) {
        console.error('  Test Case: API handler service is available - FAILED:', e.message);
    }
});


testOperations.testSuite('Autocomplete Input Component Behavior', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.componentBuilder = (html, initialScope) => angularWrappers.initializeComponent(html, initialScope);
}, (ctx) => {
    ctx.moduleLoader();

    const componentResult = ctx.componentBuilder(
        '<input type="text" g-places-autocomplete ng-model="dataHolder" />',
        { dataHolder: null }
    );

    // Original had a TODO. Adding a basic check for component existence.
    try {
        assertionUnit(componentResult.isolatedScopeHolder).isDefined();
        console.log('  Test Case: Autocomplete input component initializes - PASSED');
    } catch (e) {
        console.error('  Test Case: Autocomplete input component initializes - FAILED:', e.message);
    }
});


testOperations.testSuite('Autocomplete Display Panel Component Behavior', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.componentBuilder = (html, scopeProps) => angularWrappers.initializeComponent(html, scopeProps);
    ctx.panelDefinition = '<div g-places-autocomplete-drawer input="inputControl" query="currentQuery" predictions="suggestionList" active="activeIdx" selected="chosenIdx"></div>';
}, (ctx) => {
    ctx.moduleLoader();

    // Sub-group: when no suggestions are present
    (function() {
        const componentSetup = ctx.componentBuilder(ctx.panelDefinition, {
            inputControl: window.angular.element('<input type="text"/>'),
            currentQuery: '',
            suggestionList: []
        });
        try {
            assertionUnit(componentSetup.isolatedScopeHolder.isOpen()).isFalse();
            console.log('  Test Case: Panel remains closed with no suggestions - PASSED');
        } catch (e) {
            console.error('  Test Case: Panel remains closed with no suggestions - FAILED:', e.message);
        }
    })();

    // Sub-group: when suggestions are present
    (function() {
        const componentSetup = ctx.componentBuilder(ctx.panelDefinition, {
            inputControl: window.angular.element('<input type="text"/>'),
            currentQuery: '18',
            suggestionList: window.angular.copy(sampleData)
        });

        // Test: should open display panel
        try {
            assertionUnit(componentSetup.isolatedScopeHolder.isOpen()).isTrue();
            console.log('  Test Case: Panel opens with suggestions - PASSED');
        } catch (e) {
            console.error('  Test Case: Panel opens with suggestions - FAILED:', e.message);
        }

        // Test: should highlight active suggestion on hover
        const renderedItems = componentSetup.componentNode.children().children();
        const secondOption = window.angular.element(renderedItems[1]);
        secondOption.triggerHandler('mouseenter');
        try {
            assertionUnit(componentSetup.isolatedScopeHolder.activeIdx).hasValue(1);
            assertionUnit(componentSetup.isolatedScopeHolder.isActive(1)).isTrue();
            assertionUnit(componentSetup.isolatedScopeHolder.isActive(0)).isFalse();
            console.log('  Test Case: Active item highlights on mouse entry - PASSED');
        } catch (e) {
            console.error('  Test Case: Active item highlights on mouse entry - FAILED:', e.message);
        }

        // Test: should register selection on click
        const thirdOption = window.angular.element(renderedItems[2]);
        thirdOption.triggerHandler('click');
        try {
            assertionUnit(componentSetup.isolatedScopeHolder.chosenIdx).hasValue(2);
            console.log('  Test Case: Item selection registers on click - PASSED');
        } catch (e) {
            console.error('  Test Case: Item selection registers on click - FAILED:', e.message);
        }

        // Test: should determine display panel placement
        try {
            assertionUnit(componentSetup.isolatedScopeHolder.position).isDefined();
            console.log('  Test Case: Panel position attribute is set - PASSED');
        } catch (e) {
            console.error('  Test Case: Panel position attribute is set - FAILED:', e.message);
        }
    })();
});


testOperations.testSuite('Autocomplete Result Item Component Behavior', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.componentBuilder = (html, scopeProps) => angularWrappers.initializeComponent(html, scopeProps);
}, (ctx) => {
    ctx.moduleLoader();

    const componentResult = ctx.componentBuilder(
        '<div g-places-autocomplete-prediction index="itemPosition" prediction="itemDetails" query="searchStringValue"></div>',
        {
            itemPosition: 0,
            itemDetails: window.angular.copy(sampleData[0]),
            searchStringValue: '18'
        }
    );

    // Original had a TODO. Adding a basic check for component existence.
    try {
        assertionUnit(componentResult.isolatedScopeHolder).isDefined();
        console.log('  Test Case: Result item component initializes - PASSED');
    } catch (e) {
        console.error('  Test Case: Result item component initializes - FAILED:', e.message);
    }
});


testOperations.testSuite('Data Filter: Remaining Terms', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.filterObtainer = (filterName, callback) => {
        // Specific injection for this filter
        angularWrappers.fetchServices((_unmatchedTermsOnlyFilter_) => {
            if (filterName === 'unmatchedTermsOnlyFilter') callback(_unmatchedTermsOnlyFilter_);
            else throw new Error(`Requested filter '${filterName}' not configured for this test.`);
        });
    };
}, (ctx) => {
    ctx.moduleLoader();

    let termProcessor;
    ctx.filterObtainer('unmatchedTermsOnlyFilter', (f) => { termProcessor = f; });

    const sourceRecord = window.angular.copy(sampleData[0]);
    const processedSegments = termProcessor(sourceRecord.segments, sourceRecord);

    const expectedOutcome = [
        {
            "start": 21,
            "text": "Waterloo"
        },
        {
            "start": 31,
            "text": "New South Wales"
        },
        {
            "start": 48,
            "text": "Australia"
        }
    ];

    try {
        assertionUnit(processedSegments).isEquivalent(expectedOutcome);
        console.log('  Test Case: Filter returns only non-matching terms - PASSED');
    } catch (e) {
        console.error('  Test Case: Filter returns only non-matching terms - FAILED:', e.message);
    }
});


testOperations.testSuite('Data Filter: Conditional Comma', (ctx) => {
    ctx.moduleLoader = () => angularWrappers.loadAngularModule('google.places');
    ctx.filterObtainer = (filterName, callback) => {
        // Specific injection for this filter
        angularWrappers.fetchServices((_trailingCommaFilter_) => {
            if (filterName === 'trailingCommaFilter') callback(_trailingCommaFilter_);
            else throw new Error(`Requested filter '${filterName}' not configured for this test.`);
        });
    };
}, (ctx) => {
    ctx.moduleLoader();

    let commaAppender;
    ctx.filterObtainer('trailingCommaFilter', (f) => { commaAppender = f; });

    // Test: should append a trailing comma if condition is true
    const resultWithComma = commaAppender('a phrase', true);
    try {
        assertionUnit(resultWithComma).isIdentical('a phrase,');
        console.log('  Test Case: Appends comma when condition is true - PASSED');
    } catch (e) {
        console.error('  Test Case: Appends comma when condition is true - FAILED:', e.message);
    }

    // Test: should omit the trailing comma if condition is false
    const resultWithoutComma = commaAppender('a phrase', false);
    try {
        assertionUnit(resultWithoutComma).isIdentical('a phrase');
        console.log('  Test Case: Omits comma when condition is false - PASSED');
    } catch (e) {
        console.error('  Test Case: Omits comma when condition is false - FAILED:', e.message);
    }
});

// Execute all registered test suites
testOperations.runAll();