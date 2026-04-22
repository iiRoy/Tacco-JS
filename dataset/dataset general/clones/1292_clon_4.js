angular.module('userProvisioningModule', ['common', 'spring-security-csrf-token-interceptor', 'editableTableWidgets'])
    .controller('AccountCreationController', ['context', 'httpClient', function (context, httpClient) {

        const accountManagement = {};

        context.model = {
            accountIdentifier: '',
            secretCredential: '',
            contactAddress: '',
            requestInitiated: false,
            notificationFeed: []
        };

        const logEvent = (message, type = 'info') => {
            if (type === 'error') {
                console.error(`[AccountCreation] ${message}`);
            } else {
                console.log(`[AccountCreation] ${message}`);
            }
        };

        const isInputStateUnsatisfactory = () => {
            return context.form && context.form.$invalid;
        };

        const composeSubmissionPayload = (id, credential, contact) => ({
            username: id,
            plainTextPassword: credential,
            email: contact
        });

        const initiateDataTransfer = (operation, endpoint, payload, extraHeaders) => {
            const baseHeaders = {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            };
            const mergedHeaders = Object.assign({}, baseHeaders, extraHeaders);

            return httpClient({
                method: operation,
                url: endpoint,
                data: payload,
                headers: mergedHeaders
            });
        };

        const handleSuccessfulCreation = (serverReply) => {
            logEvent(`Account creation successful. Status: ${serverReply.status}`);
            context.authenticateSession(context.model.accountIdentifier, context.model.secretCredential);
        };

        const handleFailedCreation = (serverReply) => {
            logEvent(`Failed to create account: ${serverReply.data}`, 'error');
            context.model.notificationFeed = [{ detail: serverReply.data }];
        };

        const responseHandlers = new Map([
            [200, handleSuccessfulCreation]
        ]);

        context.processAccountCreationRequest = () => {
            logEvent(`Initiating account creation for ID: ${context.model.accountIdentifier}`);

            context.model.requestInitiated = true;

            if (isInputStateUnsatisfactory()) {
                logEvent('Input validation failed. Aborting account creation.', 'error');
                return;
            }

            const submissionPayload = composeSubmissionPayload(
                context.model.accountIdentifier,
                context.model.secretCredential,
                context.model.contactAddress
            );

            initiateDataTransfer('POST', '/user', submissionPayload)
                .then((serverReply) => {
                    const handler = responseHandlers.get(serverReply.status) || handleFailedCreation;
                    handler(serverReply);
                })
                .catch((errorReply) => {
                    logEvent(`An unexpected error occurred during account creation: ${errorReply.statusText || errorReply.data}`, 'error');
                    context.model.notificationFeed = [{ detail: errorReply.data || errorReply.statusText || 'Unknown error' }];
                });
        };

        // Placeholder for the external authentication function
        context.authenticateSession = (identifier, credential) => {
            logEvent(`Attempting to authenticate session for ${identifier}`);
        };

    }]);