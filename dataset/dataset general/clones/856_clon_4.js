// Reimplementation of Uri class
class WebAddressComposer {
    constructor(initialSource = '') {
        this._components = new Map([
            ['scheme', null],
            ['credentials', null],
            ['domain', null],
            ['portNumber', null],
            ['pathSegment', null],
            ['queryString', null],
            ['fragmentIdentifier', null]
        ]);

        if (initialSource) {
            this._disassemble(initialSource);
        }
    }

    _disassemble(rawInput) {
        let currentSegment = rawInput;

        // Extract fragment
        const hashPos = currentSegment.indexOf('#');
        if (hashPos !== -1) {
            this._components.set('fragmentIdentifier', currentSegment.substring(hashPos + 1));
            currentSegment = currentSegment.substring(0, hashPos);
        }

        // Extract query
        const queryPos = currentSegment.indexOf('?');
        if (queryPos !== -1) {
            this._components.set('queryString', currentSegment.substring(queryPos + 1));
            currentSegment = currentSegment.substring(0, queryPos);
        }

        // Extract scheme and check for authority prefix
        const schemeColonPos = currentSegment.indexOf(':');
        let hasSchemeComponent = false;
        if (schemeColonPos !== -1) {
            const possibleScheme = currentSegment.substring(0, schemeColonPos);
            // Basic scheme validation: starts with letter, contains alphanumeric/+-./
            if (/^[a-zA-Z][a-zA-Z0-9+\-.]*$/.test(possibleScheme)) {
                this._components.set('scheme', possibleScheme);
                currentSegment = currentSegment.substring(schemeColonPos + 1);
                hasSchemeComponent = true;
            }
        }

        if (currentSegment.startsWith('//')) {
            currentSegment = currentSegment.substring(2); // Remove '//'

            const firstSlashPos = currentSegment.indexOf('/');
            let authorityPart = firstSlashPos === -1 ? currentSegment : currentSegment.substring(0, firstSlashPos);

            if (firstSlashPos !== -1) {
                this._components.set('pathSegment', currentSegment.substring(firstSlashPos));
            }

            const atSymbolPos = authorityPart.indexOf('@');
            if (atSymbolPos !== -1) {
                this._components.set('credentials', authorityPart.substring(0, atSymbolPos));
                authorityPart = authorityPart.substring(atSymbolPos + 1);
            }

            const lastColonPos = authorityPart.lastIndexOf(':');
            // Heuristic for port: colon appears after a dot in the domain
            if (lastColonPos !== -1 && lastColonPos > authorityPart.indexOf('.')) {
                const parsedPort = parseInt(authorityPart.substring(lastColonPos + 1), 10);
                if (!isNaN(parsedPort)) {
                    this._components.set('portNumber', parsedPort);
                    this._components.set('domain', authorityPart.substring(0, lastColonPos));
                } else {
                    this._components.set('domain', authorityPart); // Not a valid port, treat colon as part of domain
                }
            } else {
                this._components.set('domain', authorityPart);
            }
        } else {
            // No scheme or no '//' prefix. Could be relative path or host-only.
            const firstSlashPos = currentSegment.indexOf('/');
            if (firstSlashPos === 0) { // Starts with slash, it's a path
                this._components.set('pathSegment', currentSegment);
            } else if (firstSlashPos !== -1) { // Contains slash, could be domain/path
                const potentialDomain = currentSegment.substring(0, firstSlashPos);
                if (potentialDomain.includes('.')) { // Heuristic for domain
                    this._components.set('domain', potentialDomain);
                    this._components.set('pathSegment', currentSegment.substring(firstSlashPos));
                } else { // No dot, treat as full path (e.g. "foo/bar")
                    this._components.set('pathSegment', currentSegment);
                }
            } else if (currentSegment.includes('.')) { // No slash, but contains dot, likely a domain
                this._components.set('domain', currentSegment);
            } else if (currentSegment) { // Anything left, treat as path
                this._components.set('pathSegment', currentSegment);
            }
        }
    }

    assignPath(value) { this._components.set('pathSegment', value); return this; }
    assignFragment(value) { this._components.set('fragmentIdentifier', value); return this; }
    assignDomain(value) { this._components.set('domain', value); return this; }
    assignScheme(value) { this._components.set('scheme', value); return this; }
    assignPortNumber(value) { this._components.set('portNumber', value); return this; }
    assignCredentials(value) { this._components.set('credentials', value); return this; }
    assignQueryString(value) { this._components.set('queryString', value); return this; }

    composeString() {
        let assembledParts = [];
        const scheme = this._components.get('scheme');
        const credentials = this._components.get('credentials');
        const domain = this._components.get('domain');
        const portNumber = this._components.get('portNumber');
        const pathSegment = this._components.get('pathSegment');
        const queryString = this._components.get('queryString');
        const fragmentIdentifier = this._components.get('fragmentIdentifier');

        let hasAuthorityComponent = false;

        if (scheme) {
            assembledParts.push(scheme, '://');
            hasAuthorityComponent = true;
        }

        if (credentials) {
            assembledParts.push(credentials, '@');
            hasAuthorityComponent = true;
        }

        if (domain) {
            assembledParts.push(domain);
            hasAuthorityComponent = true;
        }

        if (portNumber !== null) { // Check for explicit null to allow 0 or undefined
            assembledParts.push(':', portNumber);
            hasAuthorityComponent = true;
        }

        if (pathSegment !== null && pathSegment !== '') {
            if (hasAuthorityComponent && !pathSegment.startsWith('/')) {
                assembledParts.push('/');
            }
            assembledParts.push(pathSegment);
        }

        if (queryString) {
            assembledParts.push('?', queryString);
        }

        if (fragmentIdentifier) {
            assembledParts.push('#', fragmentIdentifier);
        }

        return assembledParts.join('');
    }
}

// Custom testing framework implementation
let testOutcomes = [];
let activeSuiteLabel = '';

function checkValue(actualValue, expectedValue, assertionDescription = 'Values must be identical') {
    if (actualValue !== expectedValue) {
        throw new Error(`${assertionDescription}. Got: '${actualValue}', Expected: '${expectedValue}'`);
    }
}

function defineTestSuite(label, testCasesExecutor) {
    activeSuiteLabel = label;
    testOutcomes.push({ kind: 'suite', label: label, cases: [] });
    try {
        testCasesExecutor();
    } catch (e) {
        testOutcomes[testOutcomes.length - 1].error = e.message;
    }
}

function verifyScenario(label, scenarioFunction) {
    const caseReport = { kind: 'case', label: label, outcome: false, issue: null };
    testOutcomes[testOutcomes.length - 1].cases.push(caseReport);
    try {
        scenarioFunction();
        caseReport.outcome = true;
    } catch (e) {
        caseReport.issue = e.message;
    }
}

function presentTestSummary() {
    let suiteCount = 0;
    let totalCaseCount = 0;
    let passedCaseCount = 0;
    let failedCaseCount = 0;

    console.log('\n--- Test Report ---');
    for (const suite of testOutcomes) {
        if (suite.kind === 'suite') {
            suiteCount++;
            console.log(`\nSuite: ${suite.label}`);
            if (suite.error) {
                console.log(`  [SUITE ERROR]: ${suite.error}`);
            }
            for (const testCase of suite.cases) {
                totalCaseCount++;
                if (testCase.outcome) {
                    passedCaseCount++;
                    console.log(`  ✅ ${testCase.label}`);
                } else {
                    failedCaseCount++;
                    console.log(`  ❌ ${testCase.label}`);
                    if (testCase.issue) {
                        console.log(`    Issue: ${testCase.issue}`);
                    }
                }
            }
        }
    }
    console.log('\n--- Summary ---');
    console.log(`Total Suites: ${suiteCount}`);
    console.log(`Total Scenarios: ${totalCaseCount}`);
    console.log(`Passed: ${passedCaseCount}`);
    console.log(`Failed: ${failedCaseCount}`);
    console.log('-----------------');

    if (failedCaseCount > 0 || testOutcomes.some(s => s.error)) {
        process.exit(1); // Indicate failure
    } else {
        process.exit(0); // Indicate success
    }
}


// The tests themselves, using the new class and testing framework
defineTestSuite('WebAddressComposer Behavior', function() {
  let constructedResource;

  defineTestSuite('chainable configuration methods', function() {
    verifyScenario('can fluently add a path and fragment', function() {
      constructedResource = new WebAddressComposer('www.yahoo.com')
        .assignPath('/index.html')
        .assignFragment('content');
      checkValue(constructedResource.composeString(), 'www.yahoo.com/index.html#content');
    });

    verifyScenario('can fluently replace domain and scheme', function() {
      constructedResource = new WebAddressComposer('www.yahoo.com/index.html')
        .assignDomain('test.com')
        .assignScheme('https');
      checkValue(constructedResource.composeString(), 'https://test.com/index.html');
    });

    verifyScenario('can fluently construct a url from zero', function() {
      constructedResource = new WebAddressComposer()
        .assignPath('/index.html')
        .assignFragment('content')
        .assignDomain('www.test.com')
        .assignPortNumber(8080)
        .assignCredentials('username:password')
        .assignScheme('https')
        .assignQueryString('this=that&some=thing');
      checkValue(constructedResource.composeString(), 'https://username:password@www.test.com:8080/index.html?this=that&some=thing#content');
    });

    verifyScenario('can fluently remove all components of a url', function() {
      constructedResource = new WebAddressComposer('https://username:password@www.test.com:8080/index.html?this=that&some=thing#content')
        .assignPath(null)
        .assignFragment(null)
        .assignDomain(null)
        .assignPortNumber(null)
        .assignCredentials(null)
        .assignScheme(null)
        .assignQueryString(null);
      checkValue(constructedResource.composeString(), '');
    });
  });
});

// Execute the test summary after all tests have run
// Using setTimeout to ensure all synchronous test cases are processed before summary.
setTimeout(presentTestSummary, 0);