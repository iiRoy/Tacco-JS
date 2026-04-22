(function() {
    let testFeatureReports = [];
    let currentFeatureDescription = '';
    let testProcessQueue = [];
    let processActive = false;
    let successfulProcesses = 0;
    let failedProcesses = 0;
    let totalAssurancesMade = 0;
    let anticipatedAssurances = 0;
    let assurancesInCurrentProcess = 0;
    let currentProcessLabel = '';
    let contentHoldingArea = null;

    const documentOperations = {
        obtainElement: (selector) => document.querySelector(selector),
        obtainElements: (selector) => document.querySelectorAll(selector),
        elementPresent: (selector) => !!documentOperations.obtainElement(selector),
        fetchElementText: (element) => element ? element.textContent.trim() : '',
        setElementAttribute: (element, attribute, value) => { if (element) element.setAttribute(attribute, value); },
        triggerSimulatedEvent: (element, eventName, eventOptions = { bubbles: true }) => {
            if (element) {
                element.dispatchEvent(new Event(eventName, eventOptions));
            }
        },
        checkElementDisplay: (element) => {
            if (!element) return false;
            const computedStyle = window.getComputedStyle(element);
            return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0';
        },
        possessesClass: (element, className) => element && element.classList.contains(className),
        removeHtmlElement: (element) => { if (element && element.parentNode) element.parentNode.removeChild(element); },
        injectHtmlContent: (targetElement, htmlString) => {
            if (targetElement) targetElement.innerHTML = htmlString;
        },
        insertNewElement: (parent, tag, id, cssClass, content = '') => {
            const freshElement = document.createElement(tag);
            if (id) freshElement.id = id;
            if (cssClass) freshElement.className = cssClass;
            freshElement.innerHTML = content;
            if (parent) parent.appendChild(freshElement);
            return freshElement;
        }
    };

    function affirmCondition(state, message) {
        totalAssurancesMade++;
        assurancesInCurrentProcess++;
        if (!state) {
            console.error(`❌ Failure in "${currentFeatureDescription} / ${currentProcessLabel}": ${message}`);
            if (testFeatureReports.length > 0) {
                testFeatureReports[testFeatureReports.length - 1].failures++;
            }
            if (!testProcessQueue[0].failed) {
                failedProcesses++;
                testProcessQueue[0].failed = true;
            }
        }
    }

    function compareValues(valueA, valueB, message) {
        affirmCondition(valueA === valueB, `${message} (Expected: "${valueB}", Actual: "${valueA}")`);
    }

    function setExpectedAssurances(count) {
        anticipatedAssurances = count;
        assurancesInCurrentProcess = 0;
    }

    function describeFeatureCategory(description) {
        currentFeatureDescription = description;
        testFeatureReports.push({
            category: description,
            total: 0,
            failures: 0
        });
    }

    function executeVerificationProcess(label, processFunction, isAsynchronous = false) {
        if (!currentFeatureDescription) {
            console.error("Error: executeVerificationProcess called outside of a describeFeatureCategory block.");
            return;
        }
        testFeatureReports[testFeatureReports.length - 1].total++;
        testProcessQueue.push({
            label: label,
            func: processFunction,
            async: isAsynchronous,
            category: currentFeatureDescription,
            failed: false
        });
        if (!processActive) {
            beginVerificationSequence();
        }
    }

    function beginVerificationSequence() {
        processActive = true;
        advanceToNextProcess();
    }

    function advanceToNextProcess() {
        if (testProcessQueue.length === 0) {
            processActive = false;
            presentFinalReport();
            return;
        }

        const currentProcess = testProcessQueue[0];
        currentProcessLabel = currentProcess.label;
        anticipatedAssurances = 0;
        assurancesInCurrentProcess = 0;

        console.log(`\nInitiating Verification: ${currentFeatureDescription} / ${currentProcessLabel}`);

        try {
            if (currentProcess.async) {
                currentProcess.func();
            } else {
                currentProcess.func();
                concludeCurrentProcess();
            }
        } catch (error) {
            console.error(`Unhandled exception in "${currentFeatureDescription} / ${currentProcessLabel}":`, error);
            if (!currentProcess.failed) {
                failedProcesses++;
                testFeatureReports.find(m => m.category === currentProcess.category).failures++;
                currentProcess.failed = true;
            }
            concludeCurrentProcess();
        }
    }

    function concludeCurrentProcess() {
        const completedProcess = testProcessQueue.shift();
        if (anticipatedAssurances > 0 && assurancesInCurrentProcess !== anticipatedAssurances) {
            console.error(`❌ Assurance count mismatch in "${currentFeatureDescription} / ${completedProcess.label}": Expected ${anticipatedAssurances}, but received ${assurancesInCurrentProcess}.`);
            if (!completedProcess.failed) {
                failedProcesses++;
                testFeatureReports.find(m => m.category === completedProcess.category).failures++;
                completedProcess.failed = true;
            }
        }

        if (!completedProcess.failed) {
            successfulProcesses++;
        }
        advanceToNextProcess();
    }

    function presentFinalReport() {
        console.log("\n--- Verification Concluded ---");
        console.log(`Total Processes: ${successfulProcesses + failedProcesses}`);
        console.log(`Successful Processes: ${successfulProcesses}`);
        console.log(`Failed Processes: ${failedProcesses}`);
        console.log(`Total Assurances: ${totalAssurancesMade}`);

        testFeatureReports.forEach(report => {
            console.log(`\nCategory: ${report.category}`);
            console.log(`  Processes: ${report.total}, Failures: ${report.failures}`);
        });

        if (failedProcesses > 0) {
            console.error("\nSome verifications were unsuccessful.");
        } else {
            console.log("\nAll verifications passed!");
        }
    }

    let tourSystem = null;

    async function loadTestContentAndExecute(description, testProcedure, deferProcessCompletion = false, contentIdentifier = '#exampleContent') {
        executeVerificationProcess(description, async () => {
            if (!contentHoldingArea) {
                contentHoldingArea = documentOperations.insertNewElement(document.body, 'div', 'content-fixture-zone');
            }
            contentHoldingArea.innerHTML = '';

            try {
                const response = await fetch('../../example/index.html');
                if (!response.ok) throw new Error(`Network error! Status: ${response.status}`);
                const entireHtml = await response.text();

                const temporaryDiv = document.createElement('div');
                temporaryDiv.innerHTML = entireHtml;
                const desiredContent = temporaryDiv.querySelector(contentIdentifier);

                if (desiredContent) {
                    contentHoldingArea.appendChild(desiredContent.cloneNode(true));
                } else {
                    console.warn(`Content for selector "${contentIdentifier}" not found in example HTML.`);
                }

                await testProcedure();

                if (!deferProcessCompletion) {
                    if (technicalLearning && technicalLearning.pageGuide) {
                        technicalLearning.pageGuide.destroy();
                    }
                    concludeCurrentProcess();
                }

            } catch (error) {
                console.error("Error loading content fixture:", error);
                if (!testProcessQueue[0].failed) {
                    failedProcesses++;
                    testFeatureReports.find(m => m.category === currentFeatureDescription).failures++;
                    testProcessQueue[0].failed = true;
                }
                if (!deferProcessCompletion) {
                    concludeCurrentProcess();
                }
            }
        }, true);
    }

    function loadAndSetupTourSystem(description, testProcedure, contentIdentifier = null, deferProcessCompletion = false) {
        loadTestContentAndExecute(description, () => {
            tourSystem = technicalLearning.pageGuide.init({
                ready_callback: () => {
                    testProcedure();
                    if (!deferProcessCompletion) {
                        concludeCurrentProcess();
                        technicalLearning.pageGuide.destroy();
                    }
                }
            });
        }, true, contentIdentifier);
    }

    function validateTourSystemClosure(closureMethod) {
        setExpectedAssurances(3);
        documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
        closureMethod();
        affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideMessages')), 'message display area hidden');
        compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, 0, 'step shadows are not visible');
        compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, 0, 'step indicators are not visible');
    }

    function validateTourSystemActivation() {
        setExpectedAssurances(6);
        affirmCondition(documentOperations.possessesClass(documentOperations.obtainElement('body'), 'tlypageguide-open'), 'body has active class');
        affirmCondition(documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideMessages')), 'message display area is visible');
        compareValues(documentOperations.obtainElements('.tlypageguide-active').length, 1, 'only one active element');
        compareValues(documentOperations.fetchElementText(documentOperations.obtainElement('#tlyPageGuide > li:nth-child(1)')),
                        documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), 'initial caption is displayed');

        const totalGuideSteps = documentOperations.obtainElements('#tlyPageGuide > li').length;
        compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, totalGuideSteps, 'all step shadows are visible');
        compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, totalGuideSteps, 'all step indicators are visible');
    }

    function confirmOrderedIndicators() {
        const visibleIndicators = Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay);
        setExpectedAssurances(anticipatedAssurances + visibleIndicators.length);

        visibleIndicators.forEach((indicator, index) => {
            compareValues(index, (parseFloat(documentOperations.fetchElementText(indicator)) - 1), `indicator ${index} has correct ordinal number`);
        });
    }

    function queryStoredWelcomeStatus() {
        return !!localStorage.getItem('tlypageguide_welcome_shown_' + technicalLearning.pageGuide.hashUrl());
    }

    document.addEventListener('DOMContentLoaded', () => {
        describeFeatureCategory('technicalLearning.pageGuide Core');

        executeVerificationProcess('pageGuide library availability', () => {
            setExpectedAssurances(1);
            affirmCondition(technicalLearning && technicalLearning.pageGuide, 'technicalLearning.pageGuide namespace is accessible');
        });

        loadAndSetupTourSystem('system destruction mechanism', () => {
            setExpectedAssurances(5);
            technicalLearning.pageGuide.destroy();
            compareValues(documentOperations.obtainElements('#tlyPageGuideWrapper').length, 0, 'no wrapper element remains');
            compareValues(documentOperations.obtainElements('#tlyPageGuideOverlay').length, 0, 'no overlay element remains');
            affirmCondition(!documentOperations.possessesClass(documentOperations.obtainElement('body'), 'tlypageguide-open'), 'body lacks open class');
            affirmCondition(!documentOperations.possessesClass(documentOperations.obtainElement('body'), 'tlyPageGuideWelcomeOpen'), 'body lacks welcome open class');
            compareValues(documentOperations.obtainElements('.tlypageguide_shadow').length, 0, 'no shadow elements remain');
        });

        loadTestContentAndExecute('visibility check utility', async () => {
            setExpectedAssurances(2);
            affirmCondition(technicalLearning.pageGuide.isScrolledIntoView('#content-fixture-zone #qunit-header', 0), 'top element is within view');
            compareValues(technicalLearning.pageGuide.isScrolledIntoView('.data-block:last-child'), false, 'bottom element is not within view');
        });

        describeFeatureCategory('DOM: Element Existence');

        loadTestContentAndExecute('fixture content loaded', async () => {
            setExpectedAssurances(1);
            affirmCondition(documentOperations.elementPresent('#exampleContent'), 'fixture content was loaded');
        });

        loadAndSetupTourSystem('standard elements presence', () => {
            setExpectedAssurances(2);
            technicalLearning.pageGuide.init();
            affirmCondition(documentOperations.elementPresent('#tlyPageGuideWrapper'), 'wrapper element is present');
            affirmCondition(documentOperations.elementPresent('.tlypageguide_toggle'), 'toggle element is present');
        });

        loadAndSetupTourSystem('welcome message presence', () => {
            setExpectedAssurances(3);
            affirmCondition(documentOperations.elementPresent('#tlyPageGuideWrapper .tlyPageGuideWelcome'), 'welcome message resides within wrapper');
            compareValues(documentOperations.obtainElements('#tlyPageGuideOverlay').length, 1, 'only a single overlay element exists');
            affirmCondition(documentOperations.possessesClass(documentOperations.obtainElement('body'), 'tlyPageGuideWelcomeOpen'), 'body has welcome open class');
        }, '#examplePlusWelcome');

        describeFeatureCategory('DOM: Fundamental Interaction');

        loadAndSetupTourSystem('tour system activation', () => {
            setExpectedAssurances(6);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            validateTourSystemActivation();
        });

        loadAndSetupTourSystem('closure via toggle switch', () => {
            validateTourSystemClosure(() => {
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            });
        });

        loadAndSetupTourSystem('closure via dedicated button', () => {
            validateTourSystemClosure(() => {
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');
            });
        });

        loadAndSetupTourSystem('forward arrow navigation', () => {
            const stepCount = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(stepCount);

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            for (let i = 1; i <= stepCount; i++) {
                const stepIndex = i % 4;
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_fwd'), 'click');
                compareValues(documentOperations.fetchElementText(documentOperations.obtainElement(`#tlyPageGuide > li:nth-child(${stepIndex + 1})`)),
                                documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), `caption ${stepIndex} is displayed`);
            }
        });

        loadAndSetupTourSystem('backward arrow navigation', () => {
            const stepCount = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(stepCount);

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            for (let i = stepCount - 1; i >= 0; i--) {
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_back'), 'click');
                compareValues(documentOperations.fetchElementText(documentOperations.obtainElement(`#tlyPageGuide > li:nth-child(${i + 1})`)),
                                documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), `caption ${i} is displayed`);
            }
        });

        loadAndSetupTourSystem('bubble click navigation', () => {
            const stepCount = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(stepCount);

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            documentOperations.obtainElements('.tlyPageGuideStepIndex').forEach((element, i) => {
                documentOperations.triggerSimulatedEvent(element, 'click');
                compareValues(documentOperations.fetchElementText(documentOperations.obtainElement(`#tlyPageGuide > li:nth-child(${i + 1})`)),
                                documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), `caption ${i} is displayed`);
            });
        });

        describeFeatureCategory('DOM: Target Element Adjustments');

        loadAndSetupTourSystem('target removal before activation', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(initialStepQuantity + 1);

            documentOperations.removeHtmlElement(documentOperations.obtainElement('#second_element_to_target'));
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step shadows');
            compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step indicators');
            confirmOrderedIndicators();
        });

        loadAndSetupTourSystem('target re-addition after removal and activation', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(initialStepQuantity + 2);

            const secondTarget = documentOperations.obtainElement('#second_element_to_target');
            const secondTargetHtml = secondTarget ? secondTarget.outerHTML : '';
            if (secondTarget) documentOperations.removeHtmlElement(secondTarget);

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');

            if (secondTargetHtml) {
                documentOperations.injectHtmlContent(documentOperations.obtainElement('#exampleContent > .wrapper'), secondTargetHtml);
            }

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step shadows');
            compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step indicators');
            confirmOrderedIndicators();
        });

        loadAndSetupTourSystem('target concealment before activation', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(initialStepQuantity + 1);

            const secondTarget = documentOperations.obtainElement('#second_element_to_target');
            if (secondTarget) secondTarget.style.display = 'none';

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'shadows reflect hidden element');
            compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'indicators reflect hidden element');
            confirmOrderedIndicators();
        });

        loadAndSetupTourSystem('target revelation after concealment and activation', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(initialStepQuantity + 2);

            const secondTarget = documentOperations.obtainElement('#second_element_to_target');
            if (secondTarget) secondTarget.style.display = 'none';

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');

            if (secondTarget) secondTarget.style.display = '';

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step shadows');
            compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step indicators');
            confirmOrderedIndicators();
        });

        loadAndSetupTourSystem('target removal during active tour', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances(initialStepQuantity + 1);

            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            documentOperations.removeHtmlElement(documentOperations.obtainElement('#second_element_to_target'));
            tourSystem.updateVisible();

            compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step shadows');
            compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step indicators');
            confirmOrderedIndicators();
        });

        loadAndSetupTourSystem('target concealment during active tour', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances((initialStepQuantity + 1) * initialStepQuantity);

            documentOperations.obtainElements('.data-block').forEach((element, i) => {
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
                tourSystem.show_message(i);
                element.style.display = 'none';
                tourSystem.updateVisible();
                compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step shadows');
                compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, (initialStepQuantity - 1), 'correct count of step indicators');
                confirmOrderedIndicators();
                element.style.display = '';
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');
            });
        });

        loadAndSetupTourSystem('target revelation during active tour', () => {
            const initialStepQuantity = documentOperations.obtainElements('#tlyPageGuide > li').length;
            setExpectedAssurances((initialStepQuantity + 2) * initialStepQuantity);

            documentOperations.obtainElements('.data-block').forEach((element, i) => {
                element.style.display = 'none';
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
                tourSystem.show_message(i);
                element.style.display = '';
                tourSystem.updateVisible();
                compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step shadows');
                compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, initialStepQuantity, 'correct count of step indicators');
                confirmOrderedIndicators();
                documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');
            });
        });

        describeFeatureCategory('DOM: Welcome Notification');

        loadAndSetupTourSystem('welcome start button press', () => {
            setExpectedAssurances(9);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_start'), 'click');
            validateTourSystemActivation();
            affirmCondition(queryStoredWelcomeStatus(), 'local data item is present');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            localStorage.clear();
        }, '#examplePlusWelcome');

        loadAndSetupTourSystem('welcome start and activation sequence', () => {
            setExpectedAssurances(8);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_start'), 'click');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_close'), 'click');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            validateTourSystemActivation();
            localStorage.clear();
        }, '#examplePlusWelcome');

        loadAndSetupTourSystem('welcome toggle press', () => {
            setExpectedAssurances(9);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            validateTourSystemActivation();
            affirmCondition(queryStoredWelcomeStatus(), 'local data item is present');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            localStorage.clear();
        }, '#examplePlusWelcome');

        loadAndSetupTourSystem('welcome ignore button press', () => {
            setExpectedAssurances(5);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_ignore'), 'click');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            compareValues(queryStoredWelcomeStatus(), false, 'no local data item yet');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            affirmCondition(documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is visible again');
            affirmCondition(documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is visible again');
        }, '#examplePlusWelcome');

        loadAndSetupTourSystem('welcome dismiss button press', () => {
            setExpectedAssurances(11);
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_dismiss'), 'click');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            affirmCondition(queryStoredWelcomeStatus(), 'local data item is present');
            documentOperations.triggerSimulatedEvent(documentOperations.obtainElement('.tlypageguide_toggle'), 'click');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('.tlyPageGuideWelcome')), 'welcome message is hidden');
            affirmCondition(!documentOperations.checkElementDisplay(documentOperations.obtainElement('#tlyPageGuideOverlay')), 'overlay is hidden');
            validateTourSystemActivation();
            localStorage.clear();
        }, '#examplePlusWelcome');

        describeFeatureCategory('Multiple Page Guides');

        loadAndSetupTourSystem('two guides on a single page', () => {
            setExpectedAssurances(8);
            const secondGuideInstance = technicalLearning.pageGuide.init({
                steps_element: '#titlePageGuide',
                ready_callback: () => {
                    compareValues(documentOperations.obtainElements('.tlypageguide_toggle').length, 2, 'two toggle buttons exist');
                    compareValues(documentOperations.obtainElements('#tlyPageGuideWrapper').length, 1, 'only one wrapper exists');

                    documentOperations.triggerSimulatedEvent(documentOperations.obtainElements('.tlypageguide_toggle')[0], 'click');
                    compareValues(documentOperations.fetchElementText(documentOperations.obtainElement('#tlyPageGuide > li:nth-child(1)')),
                                    documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), 'first caption for first guide displayed');
                    const firstGuideSteps = documentOperations.obtainElements('#tlyPageGuide > li').length;
                    compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, firstGuideSteps, 'all step shadows for first guide visible');
                    compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, firstGuideSteps, 'all step indicators for first guide visible');
                    documentOperations.triggerSimulatedEvent(documentOperations.obtainElements('.tlypageguide_toggle')[0], 'click');

                    documentOperations.triggerSimulatedEvent(documentOperations.obtainElements('.tlypageguide_toggle')[1], 'click');
                    compareValues(documentOperations.fetchElementText(documentOperations.obtainElement('#titlePageGuide > li:nth-child(1)')),
                                    documentOperations.fetchElementText(documentOperations.obtainElement('.tlypageguide_text')), 'first caption for second guide displayed');
                    const secondGuideSteps = documentOperations.obtainElements('#titlePageGuide > li').length;
                    compareValues(Array.from(documentOperations.obtainElements('.tlypageguide_shadow')).filter(documentOperations.checkElementDisplay).length, secondGuideSteps, 'all step shadows for second guide visible');
                    compareValues(Array.from(documentOperations.obtainElements('.tlyPageGuideStepIndex')).filter(documentOperations.checkElementDisplay).length, secondGuideSteps, 'all step indicators for second guide visible');
                    documentOperations.triggerSimulatedEvent(documentOperations.obtainElements('.tlypageguide_toggle')[1], 'click');

                    concludeCurrentProcess();
                    technicalLearning.pageGuide.destroy();
                }
            });
        }, null, true);

        beginVerificationSequence();
    });

    if (typeof window.technicalLearning === 'undefined') {
        window.technicalLearning = {};
    }
})();