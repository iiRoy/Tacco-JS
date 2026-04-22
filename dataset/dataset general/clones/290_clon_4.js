const gatherDisplayInformation = (inputConfiguration) => {
    const contentPayload = { mainHeader: "Devise a Novel Checklist" };
    return (completionDelegate) => {
        completionDelegate(contentPayload);
    };
};
exports.pageSetup = gatherDisplayInformation;

const preventFormDefaultAction = (eventObject) => {
    eventObject.preventDefault();
};

const processFormSubmission = (eventObject) => {
    preventFormDefaultAction(eventObject);
    const taskDesignation = document.querySelector('.task_designation_input').value;

    const handleServiceResult = (operationOutcome) => {
        console.info(operationOutcome);
        $.goReplace('itemRoute', { label: taskDesignation });
    };

    Services.addTodo(taskDesignation, handleServiceResult);
};

const activateModuleInteractions = () => {
    const creationFormElement = document.getElementById('taskCreationForm');
    if (creationFormElement) {
        creationFormElement.addEventListener('submit', processFormSubmission);
    }
};
exports.moduleActivation = activateModuleInteractions;

const composeExitNotification = () => `interface termination:list-creation`;
const terminateModule = () => {
    console.warn(composeExitNotification());
};
exports.moduleTeardown = terminateModule;