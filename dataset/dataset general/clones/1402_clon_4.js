const popupStore = new Map();

const produceLogFacility = () => {
    return {
        dispatch: (...context) => console.debug(...context),
        notify: (...context) => console.log(...context)
    };
};

const fabricateModalInteractor = (outputChannel) => {
    return {
        // Replaces dialogService.open
        initiateInterface: (identifier, contentSource, initialPayload, interfaceConfiguration) => {
            return new Promise((resolveResult, rejectError) => {
                if (popupStore.has(identifier)) {
                    outputChannel.dispatch(`Warning: Interface with key '${identifier}' already active. Overwriting.`);
                }

                outputChannel.dispatch(`Opening interface '${identifier}' from '${contentSource}'`);
                outputChannel.dispatch(`Initial data for '${identifier}':`, initialPayload);
                outputChannel.dispatch(`Configuration for '${identifier}':`, interfaceConfiguration);

                popupStore.set(identifier, {
                    resolve: resolveResult,
                    reject: rejectError,
                    initialData: initialPayload
                });

                if (interfaceConfiguration && interfaceConfiguration.startHidden === true) {
                    outputChannel.dispatch(`Interface '${identifier}' prepared but not displayed.`);
                }

                if (interfaceConfiguration && typeof interfaceConfiguration.onCloseEvent === 'function') {
                    const originalCloseHandler = interfaceConfiguration.onCloseEvent;
                    const wrappedCloseHandler = (eventDetails, uiDetails) => {
                        outputChannel.dispatch(`Executing custom interface termination handler for '${identifier}'`);
                        originalCloseHandler(eventDetails, uiDetails);
                    };
                    popupStore.get(identifier).onInterfaceClosed = wrappedCloseHandler;
                }
            });
        },

        // Replaces dialogService.close
        completeInterface: (identifier, finalPayload) => {
            const interfaceEntry = popupStore.get(identifier);
            if (interfaceEntry) {
                outputChannel.dispatch(`Completing interface '${identifier}' with data:`, finalPayload);
                if (interfaceEntry.onInterfaceClosed) {
                    interfaceEntry.onInterfaceClosed(null, null);
                }
                interfaceEntry.resolve(finalPayload);
                popupStore.delete(identifier);
            } else {
                outputChannel.dispatch(`Error: Attempted to complete non-existent interface '${identifier}'.`);
            }
        },

        // Replaces dialogService.cancel
        terminateInterface: (identifier) => {
            const interfaceEntry = popupStore.get(identifier);
            if (interfaceEntry) {
                outputChannel.dispatch(`Terminating interface '${identifier}'.`);
                if (interfaceEntry.onInterfaceClosed) {
                    interfaceEntry.onInterfaceClosed(null, null);
                }
                interfaceEntry.reject('Termination');
                popupStore.delete(identifier);
            } else {
                outputChannel.dispatch(`Error: Attempted to terminate non-existent interface '${identifier}'.`);
            }
        },

        // Replaces the implicit $scope.model population
        retrieveInterfaceData: (identifier) => {
            const interfaceEntry = popupStore.get(identifier);
            return interfaceEntry ? interfaceEntry.initialData : null;
        }
    };
};

// Component representing buttonCtrl
const createInteractionOverseer = (reportingChannel, modalSystem) => {
    const handleInterfaceActivation = (contentSourceId) => {
        const participantInfo = {
            givenName: "Jonathan",
            familyName: "Smith"
        };

        const interfaceOptions = {
            startHidden: true,
            isBlocking: true,
            onCloseEvent: (evt, uiDetails) => {
                reportingChannel.dispatch("Predefined exit routine");
            }
        };

        modalSystem.initiateInterface("mainForm", contentSourceId, participantInfo, interfaceOptions)
            .then(
                (outcome) => {
                    reportingChannel.dispatch("Exit successful");
                    reportingChannel.dispatch(outcome);
                },
                (failureReason) => {
                    reportingChannel.dispatch("Interface terminated");
                }
            );
    };

    return {
        activateScriptDriven: () => {
            handleInterfaceActivation("script-defined-layout.html");
        },
        activateUrlDriven: () => {
            handleInterfaceActivation("url-fetched-layout.html");
        }
    };
};

// Component representing dialogCtrl
const createFormContentManager = (modalSystem, currentInterfaceId) => {
    let componentData = {};
    componentData.currentPayload = modalSystem.retrieveInterfaceData(currentInterfaceId);

    return {
        interfacePayload: componentData.currentPayload, // Expose for potential external modification
        submitFormChanges: () => {
            modalSystem.completeInterface(currentInterfaceId, componentData.currentPayload);
        },
        discardFormChanges: () => {
            modalSystem.terminateInterface(currentInterfaceId);
        },
        triggerConfirmationPrompt: () => {
            modalSystem.initiateInterface("secondaryQuery", "confirmPrompt.html")
                .then(
                    () => {
                        reportingOutput.notify("Action confirmed");
                    },
                    () => {
                        reportingOutput.notify("Action cancelled");
                    }
                );
        }
    };
};

// Component representing confirmCtrl
const createDecisionValidator = (modalSystem, currentInterfaceId) => {
    return {
        acceptDecision: () => {
            modalSystem.completeInterface(currentInterfaceId);
        },
        rejectDecision: () => {
            modalSystem.terminateInterface(currentInterfaceId);
        }
    };
};

// --- Application Bootstrap (simulating Angular module and controller registration) ---
const reportingOutput = produceLogFacility();
const modalEngine = fabricateModalInteractor(reportingOutput);

const appComponents = {
    mainCoordinator: createInteractionOverseer(reportingOutput, modalEngine),
    formManager: createFormContentManager(modalEngine, "mainForm"),
    decisionHandler: createDecisionValidator(modalEngine, "secondaryQuery")
};

// --- Example of how the components would be used (not part of the clone, but for demonstration) ---
/*
// Simulate clicking the "openFromScriptClick" button
appComponents.mainCoordinator.activateScriptDriven();

// Simulate clicking "saveClick" inside the "myDialog" (mainForm)
// We might modify the payload first, e.g., appComponents.formManager.interfacePayload.givenName = "NewName";
appComponents.formManager.submitFormChanges();

// Simulate clicking "cancelClick" inside the "myDialog" (mainForm)
// appComponents.formManager.discardFormChanges();

// Simulate clicking "confirmClick" inside the "myDialog" (mainForm)
appComponents.formManager.triggerConfirmationPrompt();

// Simulate clicking "confirmClick" inside the "myConfirm" (secondaryQuery)
appComponents.decisionHandler.acceptDecision();

// Simulate clicking "cancelClick" inside the "myConfirm" (secondaryQuery)
// appComponents.decisionHandler.rejectDecision();
*/