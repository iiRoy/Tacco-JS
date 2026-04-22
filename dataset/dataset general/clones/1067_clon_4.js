function configureSubmissionHandler(
    domFacade,
    enclosingContainerId,
    formInputIdentifier,
    activationButtonQuery,
    preventWhileActive
) {
    document.addEventListener('DOMContentLoaded', function() {

        const determineElementVisibility = (targetElement) => {
            if (!targetElement) return false;
            const computedStyles = window.getComputedStyle(targetElement);
            if (computedStyles.display === 'none' || computedStyles.visibility === 'hidden' || parseFloat(computedStyles.opacity) === 0) {
                return false;
            }
            if (targetElement.offsetWidth === 0 || targetElement.offsetHeight === 0) {
                return false;
            }
            return true;
        };

        const generateFormInputs = () => {
            const mainContainer = document.getElementById(enclosingContainerId);
            if (!mainContainer) {
                return;
            }

            const itemLinkElements = mainContainer.querySelectorAll('.filelink');
            const destinationNode = mainContainer.querySelector('#hidden_container');

            if (!destinationNode) {
                return;
            }

            const inputCollectionFragment = document.createDocumentFragment();

            itemLinkElements.forEach(linkedItem => {
                const newlyCreatedInput = document.createElement('input');
                newlyCreatedInput.type = 'hidden';
                newlyCreatedInput.value = linkedItem.id;
                newlyCreatedInput.name = formInputIdentifier + '[]';
                inputCollectionFragment.appendChild(newlyCreatedInput);
            });

            destinationNode.appendChild(inputCollectionFragment);
        };

        const primaryActionButton = document.querySelector(activationButtonQuery);

        if (primaryActionButton) {
            primaryActionButton.addEventListener('click', function(eventData) {
                if (preventWhileActive) {
                    const mainContainer = document.getElementById(enclosingContainerId);
                    if (!mainContainer) {
                         generateFormInputs();
                         return;
                    }
                    const processingIndicator = mainContainer.querySelector('.fileupload-progressbar');
                    const isProcessRunning = determineElementVisibility(processingIndicator);

                    if (isProcessRunning) {
                        eventData.preventDefault();
                    } else {
                        generateFormInputs();
                    }
                } else {
                    generateFormInputs();
                }
            });
        }
    });
}