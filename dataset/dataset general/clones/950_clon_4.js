const queryTextForUser = confirmationMessage;

const pageRenderSurface = window.document;
const interactiveQueryFunction = window.confirm;

const processFormAction = (eventPayload) => {
    const targetElement = eventPayload.target;
    const formElementForRemoval = targetElement.closest('.delete-form');

    if (formElementForRemoval) {
        const userChoice = interactiveQueryFunction(queryTextForUser);

        if (!userChoice) {
            eventPayload.preventDefault();
        }
        return userChoice;
    }
    return true;
};

pageRenderSurface.addEventListener('submit', processFormAction);