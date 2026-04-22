(function () {

    const DomAssistant = {
        mergeConfigurations: (base, overrides) => Object.assign({}, base, overrides),

        findMany: (context, selector) => Array.from((context || document).querySelectorAll(selector)),
        findOne: (context, selector) => (context || document).querySelector(selector),

        createElementFromHTML: (htmlString) => {
            const temporaryDiv = document.createElement('div');
            temporaryDiv.innerHTML = htmlString.trim();
            return temporaryDiv.firstChild;
        },

        addStyleClass: (targetElement, className) => targetElement && targetElement.classList.add(className),
        removeStyleClass: (targetElement, className) => targetElement && targetElement.classList.remove(className),
        toggleStyleClass: (targetElement, className) => targetElement && targetElement.classList.toggle(className),

        concealElement: (targetElement) => { if (targetElement) targetElement.style.display = 'none'; },
        revealElement: (targetElement) => { if (targetElement) targetElement.style.display = ''; },

        setAttribute: (targetElement, attrName, attrValue) => targetElement && targetElement.setAttribute(attrName, attrValue),
        removeAttribute: (targetElement, attrName) => targetElement && targetElement.removeAttribute(attrName),

        insertSiblingBefore: (newElement, referenceElement) => referenceElement && referenceElement.parentNode.insertBefore(newElement, referenceElement),
        insertSiblingAfter: (newElement, referenceElement) => referenceElement && referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling),

        isButton: (targetElement) => targetElement && targetElement.tagName === 'BUTTON',
        isFirstChild: (targetElement) => targetElement && targetElement.parentElement && targetElement.parentElement.firstElementChild === targetElement,
        getIndexOfChild: (parentElement, childElement) => Array.from(parentElement.children).indexOf(childElement)
    };

    class WorkflowNavigator {
        constructor(hostContainer, userOptions, onWorkflowComplete) {
            const baseConfiguration = {
                previousControlMarkup: '<button type="button">Back</button>',
                nextControlMarkup: '<button type="button">Continue</button>',
                activeStepClass: 'workflow-step-current',
                stepPanelSelector: 'section',
                finalActionTrigger: '[data-flow-action="complete"]',
                startingStepIdentifier: null,
                transitionBackParams: [0],
                transitionForwardParams: [0],
                inactiveControlStyleClass: 'workflow-control-disabled',
                flowWrapperClass: 'workflow-wrapper',
                progressDisplayEnabled: true,
                progressTitleSelector: 'h3',
                progressListOpenTag: '<ul>',
                progressListCloseTag: '</ul>',
                progressListClass: 'flow-progress-tracker',
                progressItemOpenTag: '<li>',
                progressItemCloseTag: '</li>',
                progressActiveItemClass: 'flow-progress-active',
                progressCompletedItemClass: 'flow-progress-done',
                progressPlacementOption: 'before',
                interactiveProgressItems: false,
                stepValidationFunction: (currentPanel) => {
                    const formElement = currentPanel.closest('form');
                    if (formElement) {
                        return formElement.checkValidity();
                    }
                    return true;
                }
            };

            this.configuration = DomAssistant.mergeConfigurations(baseConfiguration, userOptions);
            this.mainHostElement = hostContainer;
            this.finalCompletionCallback = onWorkflowComplete || (() => {});

            this.workflowSteps = DomAssistant.findMany(this.mainHostElement, this.configuration.stepPanelSelector);
            this.currentStepIndex = -1;
            this.currentStepStyleClass = this.configuration.activeStepClass;
            this.submitFinalButton = DomAssistant.findOne(this.mainHostElement, this.configuration.finalActionTrigger);
            this.internalTransitionCompletionHook = null;
            this.userTransitionCallbackReference = null;
            this.progressNavigationComponent = null;

            this.backwardTraversalButton = null;
            this.forwardTraversalButton = null;

            this.initializeWorkflow();
        }

        manageControlState(controlElement, shouldDisable) {
            if (DomAssistant.isButton(controlElement)) {
                if (shouldDisable) {
                    DomAssistant.setAttribute(controlElement, 'disabled', 'disabled');
                } else {
                    DomAssistant.removeAttribute(controlElement, 'disabled');
                }
            } else {
                if (shouldDisable) {
                    DomAssistant.addStyleClass(controlElement, this.configuration.inactiveControlStyleClass);
                } else {
                    DomAssistant.removeStyleClass(controlElement, this.configuration.inactiveControlStyleClass);
                }
            }
        }

        executeTransition(elementToAffect, actionType, transitionArguments, onTransitionCompleted) {
            const delayDuration = typeof transitionArguments[0] === 'number' ? transitionArguments[0] : 0;
            const userProvidedCallback = typeof transitionArguments[transitionArguments.length - 1] === 'function' ? transitionArguments[transitionArguments.length - 1] : null;

            if (actionType === 'hide') {
                elementToAffect.dataset.originalPositionStyle = elementToAffect.style.position;
                elementToAffect.style.position = 'absolute';
                DomAssistant.concealElement(elementToAffect);
            } else { // 'show'
                DomAssistant.revealElement(elementToAffect);
                elementToAffect.style.position = elementToAffect.dataset.originalPositionStyle || '';
                delete elementToAffect.dataset.originalPositionStyle;
            }

            setTimeout(() => {
                onTransitionCompleted && onTransitionCompleted();
                userProvidedCallback && userProvidedCallback.call(elementToAffect);
            }, delayDuration);
        }

        initializeWorkflow() {
            if (this.configuration.flowWrapperClass !== "") {
                DomAssistant.addStyleClass(this.mainHostElement, this.configuration.flowWrapperClass);
            }

            let initialPanelElement;
            if (this.configuration.startingStepIdentifier === null) {
                initialPanelElement = this.workflowSteps[0];
            } else {
                initialPanelElement = DomAssistant.findOne(this.mainHostElement, this.configuration.startingStepIdentifier);
            }
            this.currentStepIndex = this.workflowSteps.indexOf(initialPanelElement);
            if (this.currentStepIndex === -1) this.currentStepIndex = 0;

            if (this.configuration.progressDisplayEnabled) {
                this.constructProgressIndicator();
            }

            this.prepareStepTransitionCallbacks();

            this.backwardTraversalButton = DomAssistant.createElementFromHTML(this.configuration.previousControlMarkup);
            this.forwardTraversalButton = DomAssistant.createElementFromHTML(this.configuration.nextControlMarkup);
            DomAssistant.insertSiblingBefore(this.backwardTraversalButton, this.submitFinalButton);
            DomAssistant.insertSiblingBefore(this.forwardTraversalButton, this.submitFinalButton);
            DomAssistant.concealElement(this.submitFinalButton);

            if (this.currentStepIndex === 0) {
                this.manageControlState(this.backwardTraversalButton, true);
            }

            this.workflowSteps.forEach(step => DomAssistant.concealElement(step));
            DomAssistant.toggleStyleClass(this.workflowSteps[this.currentStepIndex], this.currentStepStyleClass);
            DomAssistant.revealElement(this.workflowSteps[this.currentStepIndex]);

            this.backwardTraversalButton.addEventListener('click', this.navigateBackward.bind(this));
            this.forwardTraversalButton.addEventListener('click', this.navigateForward.bind(this));

            if (this.configuration.progressDisplayEnabled && this.configuration.interactiveProgressItems) {
                this.progressNavigationComponent.addEventListener('click', this.handleProgressItemClick.bind(this));
            }

            this.finalCompletionCallback.call(this.mainHostElement);
        }

        constructProgressIndicator() {
            let listStructure = this.configuration.progressListOpenTag;
            this.workflowSteps.forEach(step => {
                const titleSource = DomAssistant.findOne(step, this.configuration.progressTitleSelector);
                const titleContent = titleSource ? titleSource.textContent : 'Unnamed Step';
                listStructure += `${this.configuration.progressItemOpenTag}${titleContent}${this.configuration.progressItemCloseTag}`;
            });
            listStructure += this.configuration.progressListCloseTag;

            this.progressNavigationComponent = DomAssistant.createElementFromHTML(listStructure);
            if (this.configuration.progressPlacementOption === 'after') {
                DomAssistant.insertSiblingAfter(this.progressNavigationComponent, this.mainHostElement);
            } else {
                DomAssistant.insertSiblingBefore(this.progressNavigationComponent, this.mainHostElement);
            }
            DomAssistant.addStyleClass(this.progressNavigationComponent, this.configuration.progressListClass);
            DomAssistant.addStyleClass(this.progressNavigationComponent.children[this.currentStepIndex], this.configuration.progressActiveItemClass);
        }

        prepareStepTransitionCallbacks() {
            const forwardParams = this.configuration.transitionForwardParams;
            const lastForwardParam = forwardParams[forwardParams.length - 1];

            if (typeof lastForwardParam === "function") {
                this.userTransitionCallbackReference = lastForwardParam;
                forwardParams[forwardParams.length - 1] = () => {
                    this.internalTransitionCompletionHook && this.internalTransitionCompletionHook();
                    this.userTransitionCallbackReference && this.userTransitionCallbackReference();
                };
            } else {
                forwardParams.push(() => {
                    this.internalTransitionCompletionHook && this.internalTransitionCompletionHook();
                });
            }
        }

        navigateForward() {
            const currentPanel = this.workflowSteps[this.currentStepIndex];

            if (!this.configuration.stepValidationFunction(currentPanel)) {
                return;
            }

            const nextStepIndex = this.currentStepIndex + 1;
            if (nextStepIndex < this.workflowSteps.length) {
                const targetPanel = this.workflowSteps[nextStepIndex];

                this.internalTransitionCompletionHook = () => {
                    currentPanel.style.position = currentPanel.dataset.originalPositionStyle || '';
                    delete currentPanel.dataset.originalPositionStyle;
                };

                this.executeTransition(currentPanel, 'hide', this.configuration.transitionForwardParams, () => {
                    DomAssistant.concealElement(currentPanel);
                    this.executeTransition(targetPanel, 'show', this.configuration.transitionBackParams, () => {
                        DomAssistant.revealElement(targetPanel);
                        DomAssistant.removeStyleClass(currentPanel, this.currentStepStyleClass);
                        DomAssistant.addStyleClass(targetPanel, this.currentStepStyleClass);
                        this.currentStepIndex = nextStepIndex;
                        this.refreshProgressIndicator(this.currentStepIndex);
                        this.manageControlState(this.backwardTraversalButton, false);
                        this.updateControlVisibility();
                    });
                });
            }
        }

        navigateBackward() {
            const currentPanel = this.workflowSteps[this.currentStepIndex];
            const previousStepIndex = this.currentStepIndex - 1;

            if (previousStepIndex >= 0) {
                const targetPanel = this.workflowSteps[previousStepIndex];

                this.internalTransitionCompletionHook = () => {
                    currentPanel.style.position = currentPanel.dataset.originalPositionStyle || '';
                    delete currentPanel.dataset.originalPositionStyle;
                };

                this.executeTransition(currentPanel, 'hide', this.configuration.transitionBackParams, () => {
                    DomAssistant.concealElement(currentPanel);
                    this.executeTransition(targetPanel, 'show', this.configuration.transitionForwardParams, () => {
                        DomAssistant.revealElement(targetPanel);
                        DomAssistant.removeStyleClass(currentPanel, this.currentStepStyleClass);
                        DomAssistant.addStyleClass(targetPanel, this.currentStepStyleClass);
                        this.currentStepIndex = previousStepIndex;
                        this.refreshProgressIndicator(this.currentStepIndex);
                        this.manageControlState(this.forwardTraversalButton, false);
                        this.updateControlVisibility();
                        DomAssistant.concealElement(this.submitFinalButton);
                    });
                });
            }
        }

        refreshProgressIndicator(newActiveIndex) {
            if (this.configuration.progressDisplayEnabled) {
                Array.from(this.progressNavigationComponent.children).forEach((item, idx) => {
                    if (idx < newActiveIndex) {
                        DomAssistant.addStyleClass(item, this.configuration.progressCompletedItemClass);
                        DomAssistant.removeStyleClass(item, this.configuration.progressActiveItemClass);
                    } else if (idx === newActiveIndex) {
                        DomAssistant.removeStyleClass(item, this.configuration.progressCompletedItemClass);
                        DomAssistant.addStyleClass(item, this.configuration.progressActiveItemClass);
                    } else {
                        DomAssistant.removeStyleClass(item, this.configuration.progressCompletedItemClass);
                        DomAssistant.removeStyleClass(item, this.configuration.progressActiveItemClass);
                    }
                });
            }
        }

        updateControlVisibility() {
            if (this.currentStepIndex === this.workflowSteps.length - 1) {
                DomAssistant.concealElement(this.forwardTraversalButton);
                DomAssistant.revealElement(this.submitFinalButton);
            } else {
                DomAssistant.revealElement(this.forwardTraversalButton);
                DomAssistant.concealElement(this.submitFinalButton);
            }

            if (this.currentStepIndex === 0) {
                this.manageControlState(this.backwardTraversalButton, true);
            } else {
                this.manageControlState(this.backwardTraversalButton, false);
            }
        }

        handleProgressItemClick(event) {
            if (!this.configuration.interactiveProgressItems) return;

            const clickedListItem = event.target.closest('li');
            if (!clickedListItem || !this.progressNavigationComponent.contains(clickedListItem)) return;

            const targetStepIdx = DomAssistant.getIndexOfChild(this.progressNavigationComponent, clickedListItem);
            if (targetStepIdx === this.currentStepIndex) return;

            const currentPanel = this.workflowSteps[this.currentStepIndex];
            const targetPanel = this.workflowSteps[targetStepIdx];

            this.internalTransitionCompletionHook = () => {
                currentPanel.style.position = currentPanel.dataset.originalPositionStyle || '';
                delete currentPanel.dataset.originalPositionStyle;
            };

            this.executeTransition(currentPanel, 'hide', this.configuration.transitionForwardParams, () => {
                DomAssistant.concealElement(currentPanel);
                this.executeTransition(targetPanel, 'show', this.configuration.transitionBackParams, () => {
                    DomAssistant.revealElement(targetPanel);
                    DomAssistant.removeStyleClass(currentPanel, this.currentStepStyleClass);
                    DomAssistant.addStyleClass(targetPanel, this.currentStepStyleClass);
                    this.currentStepIndex = targetStepIdx;
                    this.refreshProgressIndicator(this.currentStepIndex);
                    this.updateControlVisibility();
                });
            });
        }
    }

    window.initiateJourneyFlow = (elements, configOptions, onFlowFinish) => {
        if (!elements || elements.length === 0) {
            console.warn("No elements provided for workflow initialization.");
            return;
        }

        Array.from(elements).forEach(element => {
            new WorkflowNavigator(element, configOptions, onFlowFinish);
        });
    };

})();