document.addEventListener('DOMContentLoaded', function() {

    const primaryActionElement = document.getElementById('verify-contribution');

    const eventDispatcher = {
        processBeforeRequest: function(triggeringEvent) {
            const repositoryOwnerInput = document.getElementById('repo-owner');
            const repositoryNameInput = document.getElementById('repo-name');

            const jQElementForData = jQuery(this);
            const requestPayloadDetails = {
                repositoryIdentifierOwner: repositoryOwnerInput.value,
                repositoryIdentifierName: repositoryNameInput.value
            };
            jQElementForData.data('requestConfiguration', requestPayloadDetails);
        },

        handleSuccessfulResponse: function(triggeringEvent, responsePayload, statusMessage, httpRequestObject) {
            const parsedContent = JSON.parse(httpRequestObject.responseText);
            const statusNotificationArea = document.getElementById('contribution-message');
            const targetRepositoryList = document.getElementById('github-repos');

            statusNotificationArea.textContent = parsedContent.success;
            statusNotificationArea.classList.remove('alert-error');
            statusNotificationArea.classList.add('alert', 'submission-feedback-area');

            targetRepositoryList.insertAdjacentHTML('beforeend', parsedContent.html);
        },

        handleFailedResponse: function(triggeringEvent, httpRequestObject, statusMessage, errorInformation) {
            const parsedContent = JSON.parse(httpRequestObject.responseText);
            const statusNotificationArea = document.getElementById('contribution-message');

            statusNotificationArea.textContent = parsedContent.error;
            statusNotificationArea.classList.add('alert', 'alert-error', 'submission-feedback-area');
        }
    };

    const bindingInstructions = {
        'ajax:before': eventDispatcher.processBeforeRequest,
        'ajax:success': eventDispatcher.handleSuccessfulResponse,
        'ajax:error': eventDispatcher.handleFailedResponse
    };

    const jQPrimaryElement = jQuery(primaryActionElement);
    for (const eventIdentifier in bindingInstructions) {
        if (Object.prototype.hasOwnProperty.call(bindingInstructions, eventIdentifier)) {
            jQPrimaryElement.on(eventIdentifier, bindingInstructions[eventIdentifier]);
        }
    }
});