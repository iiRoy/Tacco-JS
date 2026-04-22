const automationAgent = casper;

const inputTranslator = {
    directional: {
        forwardRight: automationAgent.page.event.key.Right,
        forwardDown: automationAgent.page.event.key.Down,
        backwardLeft: automationAgent.page.event.key.Left,
        backwardUp: automationAgent.page.event.key.Left // Original uses Left for Up
    },
    navigation: {
        tab: automationAgent.page.event.key.Tab,
        home: automationAgent.page.event.key.Home,
        end: automationAgent.page.event.key.End,
        pageDown: automationAgent.page.event.key.PageDown,
        pageUp: automationAgent.page.event.key.PageUp,
        space: automationAgent.page.event.key.Space
    },
    alphabetic: {
        jKey: automationAgent.page.event.key.J,
        lKey: automationAgent.page.event.key.L,
        kKey: automationAgent.page.event.key.K,
        hKey: automationAgent.page.event.key.H
    },
    functional: {
        f5: automationAgent.page.event.key.F5,
        escape: automationAgent.page.event.key.Escape
    }
};

const scenarioRegistry = [
    {
        caption: 'Advancing by Rightward Arrow',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.directional.forwardRight },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Advancing by Downward Arrow',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.directional.forwardDown },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Advancing by Tab Key',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.navigation.tab },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'No advancement by Ctrl + Tab',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.navigation.tab, controlKeys: 'ctrl' },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Current slide #1 remains active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Advancing by J Key',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.alphabetic.jKey },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Advancing by L Key',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.alphabetic.lKey },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Advancing by Spacebar',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.navigation.space },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Advancing by Page Down',
        startPoint: 'http://0.0.0.0:7497/tests/#1',
        keyPress: { code: inputTranslator.navigation.pageDown },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Next slide #2 is now active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Receding by Leftward Arrow',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.directional.backwardLeft },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Receding by Upward Arrow',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.directional.backwardUp },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Receding by Shift + Tab',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.navigation.tab, controlKeys: 'shift' },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'No recedence by Ctrl + Shift + Tab',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.navigation.tab, controlKeys: 'ctrl+shift' },
        asserts: [
            { checkType: 'elementExistence', target: '[id="2"].active', description: 'Current slide #2 remains active' },
            { checkType: 'urlPattern', target: /\/#2/, description: 'URL reflects slide #2' }
        ]
    },
    {
        caption: 'Receding by K Key',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.alphabetic.kKey },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Receding by H Key',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.alphabetic.hKey },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Receding by Shift + Spacebar',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.navigation.space, controlKeys: 'shift' },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Receding by Page Up',
        startPoint: 'http://0.0.0.0:7497/tests/#2',
        keyPress: { code: inputTranslator.navigation.pageUp },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Previous slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Navigating to First Slide via Home Key',
        startPoint: 'http://0.0.0.0:7497/tests/#MyID',
        keyPress: { code: inputTranslator.navigation.home },
        asserts: [
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'First slide #1 is now active' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'URL reflects slide #1' }
        ]
    },
    {
        caption: 'Navigating to Last Slide via End Key',
        startPoint: 'http://0.0.0.0:7497/tests/#MyID',
        keyPress: { code: inputTranslator.navigation.end },
        asserts: [
            { checkType: 'elementExistence', target: '[id="6"].active', description: 'Last slide #6 is now active' },
            { checkType: 'urlPattern', target: /\/#6/, description: 'URL reflects slide #6' }
        ]
    },
    {
        caption: 'Activating Fullscreen with F5',
        startPoint: 'http://0.0.0.0:7497/tests/#MyID',
        keyPress: { code: inputTranslator.functional.f5 },
        asserts: [
            { checkType: 'elementExistence', target: 'body.full', description: 'Body is in full screen mode' },
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'First slide #1 is active in full screen' },
            { checkType: 'urlPattern', target: /\/\?full#1/, description: 'Full screen URL for slide #1' }
        ]
    },
    {
        caption: 'Activating Fullscreen with Shift + F5',
        startPoint: 'http://0.0.0.0:7497/tests/#MyID',
        keyPress: { code: inputTranslator.functional.f5, controlKeys: 'shift' },
        asserts: [
            { checkType: 'elementExistence', target: 'body.full', description: 'Body is in full screen mode' },
            { checkType: 'elementExistence', target: '[id="MyID"].active', description: 'Current slide #MyID is active in full screen' },
            { checkType: 'urlPattern', target: /\/\?full#MyID/, description: 'Full screen URL for slide #MyID' }
        ]
    },
    {
        caption: 'Deactivating Fullscreen with F5',
        startPoint: 'http://0.0.0.0:7497/tests/?full#1',
        keyPress: { code: inputTranslator.functional.f5 },
        asserts: [
            { checkType: 'elementExistence', target: 'body.list', description: 'Body is in list mode' },
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Slide #1 is active in list mode' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'List mode URL for slide #1' }
        ]
    },
    {
        caption: 'Deactivating Fullscreen with Escape Key',
        startPoint: 'http://0.0.0.0:7497/tests/?full#1',
        keyPress: { code: inputTranslator.functional.escape },
        asserts: [
            { checkType: 'elementExistence', target: 'body.list', description: 'Body is in list mode' },
            { checkType: 'elementExistence', target: '[id="1"].active', description: 'Slide #1 is active in list mode' },
            { checkType: 'urlPattern', target: /\/#1/, description: 'List mode URL for slide #1' }
        ]
    }
];

function processAutomatedValidation(scenarioDef) {
    automationAgent.launchVerification(scenarioDef.caption, scenarioDef.asserts.length, function examination(assertionEngine) {
        let executionFlow = automationAgent.commenceNavigation(scenarioDef.startPoint);

        executionFlow = executionFlow.andProceed(function() {
            const keyOpts = scenarioDef.keyPress.controlKeys ? { controlKeys: scenarioDef.keyPress.controlKeys } : {};
            this.dispatchInput('body', scenarioDef.keyPress.code, keyOpts);
        });

        executionFlow = executionFlow.andProceed(function() {
            scenarioDef.asserts.forEach(check => {
                if (check.checkType === 'elementExistence') {
                    assertionEngine.confirmPresence(check.target, check.description);
                } else if (check.checkType === 'urlPattern') {
                    assertionEngine.validatePathPattern(check.target, check.description);
                }
            });
        });

        executionFlow.executeSequence(function() { assertionEngine.completeVerification() }).resetEnvironment();
    });
}

scenarioRegistry.forEach(processAutomatedValidation);