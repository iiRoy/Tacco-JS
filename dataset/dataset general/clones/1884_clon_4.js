class ProcessTerminationEvent extends Error {
    constructor(detail, ...params) {
        super(detail, ...params);
        this.name = 'ProcessTerminationEvent';
    }
}

const DataLog = (() => {
    const output = (label, ...args) => {
        if (label === 'INFORMATION') {
            console.log.apply(console, args);
        } else if (label === 'FAULT') {
            console.error.apply(console, args);
        } else if (label === 'PROGRESS') {
            console.log.apply(console, args);
        }
    };
    return {
        broadcast: (...args) => output('INFORMATION', ...args),
        signal: (...args) => output('PROGRESS', ...args),
        reportFault: (...args) => output('FAULT', ...args)
    };
})();

const DeferredExecution = (() => {
    const queueAction = (actionJob) => {
        Promise.resolve().then(actionJob).catch(errorSource => {
            DataLog.reportFault("Unhandled asynchronous error:", errorSource);
            throw new ProcessTerminationEvent("Unhandled asynchronous error");
        });
    };
    return {
        scheduleInstant: queueAction
    };
})();

const ValidationService = (() => {
    const evaluateEquality = (firstOperand, secondOperand) => {
        const outcome = firstOperand == secondOperand;
        DataLog.signal(outcome ? "VERIFIED" : "FAILED", `${firstOperand} ~ ${secondOperand}`);
        if (!outcome) {
            throw new ProcessTerminationEvent("VALIDATION FAILED");
        }
    };
    return {
        confirmEquality: evaluateEquality,
        confirmTruth: (subjectValue) => evaluateEquality(subjectValue, true)
    };
})();

const ScenarioCoordinator = (() => {
    const registeredScenarios = [];
    let currentScenario = null;
    let scenarioPointer = 0;
    const documentName = "script_component.js";

    const enterPhase = () => {};
    const exitPhase = () => {};

    const advanceScenario = () => {
        const executeNext = () => {
            if (scenarioPointer < registeredScenarios.length) {
                enterPhase();
                currentScenario = registeredScenarios[scenarioPointer++];
                DataLog.broadcast("SCENARIO-INFO | " + documentName + " | Initiating " + currentScenario.identity);
                try {
                    currentScenario.operation();
                } catch (errorSource) {
                    if (errorSource instanceof ProcessTerminationEvent) {
                        DataLog.reportFault("Scenario terminated due to:", errorSource.message);
                        throw errorSource;
                    } else {
                        DataLog.reportFault("Scenario encountered an unexpected issue:", errorSource);
                        throw new ProcessTerminationEvent(errorSource.toString());
                    }
                }
            }
        };

        DeferredExecution.scheduleInstant(executeNext);

        if (currentScenario !== null) {
            exitPhase();
        }
    };

    return {
        registerScenario: (scenarioFunction) => {
            registeredScenarios.push({
                identity: scenarioFunction.name || `anonymous_scenario_${registeredScenarios.length}`,
                operation: scenarioFunction
            });
            return scenarioFunction;
        },
        initiateProgression: advanceScenario,
        getValidator: () => ValidationService,
        getNotifier: () => DataLog,
        haltExecution: (messageText) => {
            DataLog.reportFault(messageText);
            throw new ProcessTerminationEvent(messageText);
        }
    };
})();

const reportProblem = (issueMessage, supplementaryDetail) => ScenarioCoordinator.haltExecution(issueMessage);

const conveyMessage = (...items) => ScenarioCoordinator.getNotifier().broadcast(...items);

const deferAction = (jobTask) => DeferredExecution.scheduleInstant(jobTask);

const acknowledgeStart = () => {};
const acknowledgeEnd = () => {};

const verifyEquality = (lhsOperand, rhsOperand) => ScenarioCoordinator.getValidator().confirmEquality(lhsOperand, rhsOperand);

const verifyTruth = (conditionState) => ScenarioCoordinator.getValidator().confirmTruth(conditionState);

const SCRIPT_REFERENCE = "script_component.js";

const includeTest = (actionRoutine) => ScenarioCoordinator.registerScenario(actionRoutine);

const proceedToNext = () => ScenarioCoordinator.initiateProgression();