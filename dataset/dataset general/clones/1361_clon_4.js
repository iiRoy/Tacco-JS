const examinationSystem = (function() {
    let currentTestSuiteLabel = '';
    let totalAssertions = 0;
    let passedAssertions = 0;
    let completedTests = 0;
    let testQueue = [];
    let isRunning = false;
    let currentTestFailed = false;

    function recordAssertion(condition, message) {
        totalAssertions++;
        if (condition) {
            passedAssertions++;
            console.log(`PASS: ${message}`);
        } else {
            currentTestFailed = true;
            console.error(`FAIL: ${message}`);
        }
    }

    function designateSuite(label) {
        currentTestSuiteLabel = label;
        console.log(`\n--- Test Suite: ${currentTestSuiteLabel} ---`);
    }

    function queueDeferredEvaluation(label, expectedAsserts, testFunction) {
        testQueue.push({ label, expectedAsserts, testFunction, suite: currentTestSuiteLabel });
        if (!isRunning) {
            executeNextTest();
        }
    }

    async function executeNextTest() {
        if (testQueue.length === 0) {
            isRunning = false;
            console.log(`\n--- All evaluation tasks concluded ---`);
            console.log(`Total Confirmations: ${totalAssertions}, Successful: ${passedAssertions}, Unsuccessful: ${totalAssertions - passedAssertions}`);
            return;
        }

        isRunning = true;
        const testCase = testQueue.shift();
        console.log(`\n  >> Initiating: ${testCase.suite} - ${testCase.label}`);
        let assertsInTest = 0;
        currentTestFailed = false;

        const testContext = {
            check: (condition, message) => {
                assertsInTest++;
                recordAssertion(condition, message);
            },
            conclude: () => {
                if (assertsInTest !== testCase.expectedAsserts) {
                    currentTestFailed = true;
                    console.error(`FAIL: Expected ${testCase.expectedAsserts} confirmations but received ${assertsInTest} in '${testCase.label}'`);
                    totalAssertions++;
                }
                if (currentTestFailed) {
                    console.error(`  >> Evaluation '${testCase.label}' concluded with failures.`);
                } else {
                    console.log(`  >> Evaluation '${testCase.label}' concluded successfully.`);
                }
                completedTests++;
                executeNextTest();
            },
            postponeExecution: (duration, callback) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        callback();
                        resolve();
                    }, duration);
                });
            }
        };

        try {
            await testCase.testFunction(testContext);
        } catch (e) {
            console.error(`  >> Evaluation '${testCase.label}' encountered an unexpected exception:`, e.message);
            currentTestFailed = true;
            testContext.conclude();
        }
    }

    return {
        designateSuite,
        queueDeferredEvaluation
    };
})();

function retrieveNode(selector) {
    return document.querySelector(selector);
}

function retrieveNodes(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function activateElement(element) {
    if (!element) {
        throw new Error("Cannot activate a null element.");
    }
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(clickEvent);
}

function isRendered(node) {
    if (!node) return false;
    const style = window.getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && node.offsetWidth > 0 && node.offsetHeight > 0;
}

function countChildren(parentNode, selector = '*') {
    if (!parentNode) return 0;
    return parentNode.querySelectorAll(selector).length;
}

examinationSystem.designateSuite('interactive-toggle');

examinationSystem.queueDeferredEvaluation('expand-collapse-action', 6, async (evaluator) => {
    const triggerElement = retrieveNode('.open-close .actionable');
    const commentSection = retrieveNode('#long-comment');

    evaluator.check(commentSection.innerHTML.trim() === '', 'Comment section begins devoid of content');

    activateElement(triggerElement);

    const openStateView = triggerElement.querySelector('.when-open');
    const closedStateView = triggerElement.querySelector('.when-closed');

    evaluator.check(isRendered(openStateView), 'Open state element became visible');
    evaluator.check(!isRendered(closedStateView), 'Closed state element became hidden');

    evaluator.check(countChildren(commentSection, 'img') === 1, 'Loading indicator image appeared in comment section');

    await evaluator.postponeExecution(100, () => {
        evaluator.check(countChildren(commentSection, 'img') === 0, 'Loading indicator vanished post-content-load');
        evaluator.check(countChildren(commentSection, 'p') === 3, 'Comment section populated with three paragraph elements');
    });

    evaluator.conclude();
});

examinationSystem.designateSuite('submission-processor');

examinationSystem.queueDeferredEvaluation('form-submission-flow', 3, async (evaluator) => {
    const controlNode = retrieveNode('.submit-form .actionable');
    const joyContainer = retrieveNode('#sethappy');

    evaluator.check(countChildren(joyContainer) === 1, 'Joy container initially holds only one child element');

    activateElement(controlNode);

    await evaluator.postponeExecution(100, () => {
        evaluator.check(countChildren(joyContainer, '.actionable') === 0, 'Interactive component removed from joy container');
        evaluator.check(countChildren(joyContainer, 'p') === 1, 'Joy container updated with a single paragraph element');
    });

    evaluator.conclude();
});

examinationSystem.designateSuite('content-substitution');

examinationSystem.queueDeferredEvaluation('element-replacement-sequence', 3, async (evaluator) => {
    const interactiveComponent = retrieveNode('.replace .actionable');
    const fundBox = retrieveNode('#money');

    evaluator.check(countChildren(fundBox) === 1, 'Fund box initially contains only one child element');

    activateElement(interactiveComponent);

    await evaluator.postponeExecution(100, () => {
        evaluator.check(countChildren(fundBox, '.actionable') === 0, 'Interactive component no longer present in fund box');
        evaluator.check(countChildren(fundBox, 'pre') === 1, 'Fund box now contains one preformatted text element');
    });

    evaluator.conclude();
});