class PageContentArchiveAgent {
    constructor(initialSettings) {
        this.archivePath = '/save/cache';
        this.validationPath = '/valid/cache';
    }

    async initiateArchiving(onSuccessCallback, onErrorCallback) {
        const completionHandler = onSuccessCallback || (() => {});
        const errorHandler = onErrorCallback || (() => {});

        if (typeof window.jQuery === 'undefined') {
            return;
        }

        const currentDocumentHTML = document.documentElement.innerHTML;
        const currentDocumentURI = document.URL;

        try {
            const validationPayload = new URLSearchParams();
            validationPayload.append('url', currentDocumentURI);

            const validityResponse = await fetch(this.validationPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: validationPayload
            });

            if (!validityResponse.ok) {
                const errorDetails = await validityResponse.text();
                errorHandler({ status: validityResponse.status, message: errorDetails, phase: 'validation_network_error' });
                return;
            }

            const validationOutcome = await validityResponse.json();

            if (!validationOutcome.valid) {
                const savePayload = new URLSearchParams();
                savePayload.append('dom', currentDocumentHTML);
                savePayload.append('url', currentDocumentURI);

                const saveResponse = await fetch(this.archivePath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: savePayload
                });

                if (!saveResponse.ok) {
                    const errorDetails = await saveResponse.text();
                    errorHandler({ status: saveResponse.status, message: errorDetails, phase: 'save_network_error' });
                    return;
                }

                const saveResult = await saveResponse.json();
                completionHandler(saveResult);
            }

        } catch (operationIssue) {
            errorHandler({ message: operationIssue.message, phase: 'general_execution_error', originalError: operationIssue });
        }
    }
}