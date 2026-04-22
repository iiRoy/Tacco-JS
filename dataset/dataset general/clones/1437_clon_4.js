(function() {

    const verificationEngine = {
        checkEquality: (actualData, expectedData, testStatement) => {
            if (actualData === expectedData) {
                console.log(`RESULT: PASSED - ${testStatement}`);
            } else {
                console.error(`RESULT: FAILED - ${testStatement} (Expected: "${expectedData}", Received: "${actualData}")`);
            }
        },
        checkTruthfulness: (actualData, testStatement) => {
            if (actualData === true) {
                console.log(`RESULT: PASSED - ${testStatement}`);
            } else {
                console.error(`RESULT: FAILED - ${testStatement} (Expected: true, Received: "${actualData}")`);
            }
        },
        checkFalseness: (actualData, testStatement) => {
            if (actualData === false) {
                console.log(`RESULT: PASSED - ${testStatement}`);
            } else {
                console.error(`RESULT: FAILED - ${testStatement} (Expected: false, Received: "${actualData}")`);
            }
        },
        displayCategory: (categoryLabel) => {
            console.info(`\n--- ${categoryLabel} Verifications ---`);
        }
    };

    function SimulatedElement(tagIdentifier, initialProperties) {
        this.tagIdentifier = tagIdentifier;
        this.htmlAttributes = initialProperties || {};
        this._eventListeners = {};

        this.retrieveAttribute = (attrName) => this.htmlAttributes[attrName];
        this.assignAttribute = (attrName, attrValue) => { this.htmlAttributes[attrName] = attrValue; };
        this.get = this.retrieveAttribute;

        if (this.htmlAttributes.value !== undefined) {
            this._currentValueState = this.htmlAttributes.value;
            Object.defineProperty(this, 'value', {
                get: () => this._currentValueState,
                set: (newValue) => { this._currentValueState = newValue; }
            });
        }

        this.registerEvent = (eventName, callbackFn) => {
            if (!this._eventListeners[eventName]) {
                this._eventListeners[eventName] = [];
            }
            this._eventListeners[eventName].push(callbackFn);
        };
        this.triggerEvent = (eventName) => {
            if (this._eventListeners[eventName]) {
                this._eventListeners[eventName].forEach(listener => listener());
            }
        };

        this.request = {
            headers: {},
            options: {},
            initiateOperation: () => {}
        };
    }

    function temporarilyAlterConfirm(desiredOutcome) {
        const originalConfirmationFunction = window.confirm;
        window.confirm = () => desiredOutcome;
        return originalConfirmationFunction;
    }

    verificationEngine.displayCategory('Form Security Token Access');

    const paramMeta = document.createElement('meta');
    paramMeta.setAttribute('name', 'csrf-param');
    paramMeta.setAttribute('content', 'authenticity_token');
    document.head.appendChild(paramMeta);

    const tokenMeta = document.createElement('meta');
    tokenMeta.setAttribute('name', 'csrf-token');
    tokenMeta.setAttribute('content', 'k2RViIJTPfc%2B0xyb8ELoPGg%2BSAjGkfzm4SW9DQGFlxU%3D');
    document.head.appendChild(tokenMeta);

    verificationEngine.checkEquality(rails.csrf.param, 'authenticity_token', 'CSRF parameter property should correctly reflect meta tag content');
    verificationEngine.checkEquality(rails.csrf.token, 'k2RViIJTPfc%2B0xyb8ELoPGg%2BSAjGkfzm4SW9DQGFlxU%3D', 'CSRF token property should correctly reflect meta tag content');

    document.head.removeChild(paramMeta);
    document.head.removeChild(tokenMeta);

    verificationEngine.displayCategory('Confirmation Logic');

    const confirmationTargetA = new SimulatedElement('input', { type: 'submit' });
    verificationEngine.checkTruthfulness(rails.confirmed(confirmationTargetA), 'Function should yield true for components without confirmation prompts');

    const originalConfirmerOne = temporarilyAlterConfirm(true);
    const confirmationTargetB = new SimulatedElement('input', {
        type: 'submit',
        'data-confirm': 'Proceed with this?'
    });
    verificationEngine.checkTruthfulness(rails.confirmed(confirmationTargetB), 'Function should yield true when prompt exists and user accepts');
    window.confirm = originalConfirmerOne;

    const originalConfirmerTwo = temporarilyAlterConfirm(false);
    const confirmationTargetC = new SimulatedElement('input', {
        type: 'submit',
        'data-confirm': 'Are you certain?'
    });
    verificationEngine.checkFalseness(rails.confirmed(confirmationTargetC), 'Function should yield false when prompt exists and user declines');
    window.confirm = originalConfirmerTwo;

    verificationEngine.displayCategory('Element Disablement Mechanism');

    const controlToDeactivate = new SimulatedElement('input', {
        type: 'button',
        'data-disable-with': 'Working...',
        value: 'Initiate'
    });
    rails.disable(controlToDeactivate);
    verificationEngine.checkEquality(controlToDeactivate.get('value'), 'Working...', 'Control value should update to disable text');

    controlToDeactivate.triggerEvent('ajax:complete');
    verificationEngine.checkEquality(controlToDeactivate.get('value'), 'Initiate', 'Control value should revert to original after AJAX completion');

    verificationEngine.displayCategory('Remote Form Interaction');

    const remoteSubmissionForm = new SimulatedElement('form', {
        action: '/target_path',
        'data-method': 'patch'
    });
    let defaultActionPreventedFlag = false;
    const syntheticEventObject = {
        preventDefault: () => { defaultActionPreventedFlag = true; }
    };

    rails.handleRemote.call(remoteSubmissionForm, syntheticEventObject);

    verificationEngine.checkTruthfulness(defaultActionPreventedFlag, 'Default event behavior must be halted');
    verificationEngine.checkEquality(remoteSubmissionForm.request.headers['Accept'], '*/*', 'Request Accept header must be set to wildcard');
    verificationEngine.checkEquality(remoteSubmissionForm.request.options.data, remoteSubmissionForm, 'Request data option should reference the form component');
    verificationEngine.checkEquality(remoteSubmissionForm.request.options.url, '/target_path', 'Request URL option should align with form action');
    verificationEngine.checkEquality(remoteSubmissionForm.request.options.method, 'patch', 'Request method option should align with data-method attribute');

})();