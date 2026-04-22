function createOperationHandler(
    renderStateUpdate,
    httpService,
    editorAccess,
    codeDisplayFormatter,
    outputContainerElement
) {
    let currentProcessStatus = {
        notificationType: '',
        notificationHeading: '',
        notificationMessage: '',
        notificationActive: false,
        displayModalReady: false,
        conversionInProgress: false,
        currentGeneratedText: ''
    };

    const refreshView = (newStatePart) => {
        Object.assign(currentProcessStatus, newStatePart);
        renderStateUpdate(currentProcessStatus);
    };

    const presentNotification = (category, header, content) => {
        refreshView({
            notificationType: category,
            notificationHeading: header,
            notificationMessage: content,
            notificationActive: true
        });
    };

    const clearAllNotifications = () => {
        refreshView({
            notificationHeading: '',
            notificationMessage: '',
            notificationActive: false
        });
    };

    const showGeneratedOutput = (generatedContent) => {
        outputContainerElement.innerHTML = codeDisplayFormatter(generatedContent, 'lang-go', false);
        refreshView({
            displayModalReady: true,
            currentGeneratedText: generatedContent
        });
        editorAccess.restrictEditing(true);
    };

    const hideGeneratedOutput = () => {
        refreshView({
            currentGeneratedText: '',
            displayModalReady: false
        });
        editorAccess.restrictEditing(false);
    };

    const initiateDataConversion = async (inputJsonPayload) => {
        refreshView({ conversionInProgress: true });

        try {
            const serverResponse = await httpService.transmit('/parse', inputJsonPayload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (serverResponse.success) {
                showGeneratedOutput(serverResponse.payload);
            } else {
                presentNotification('error', 'Data Conversion Failed |', serverResponse.payload);
            }
        } catch (operationError) {
            presentNotification('error', 'Request Issue |', operationError.message);
        } finally {
            refreshView({ conversionInProgress: false });
        }
    };

    const setupInitialState = () => {
        refreshView({ displayModalReady: false });
    };

    const prepareEditorComponent = () => {
        editorAccess.restrictEditing(false);
    };

    const executeConversionWorkflow = async () => {
        const rawEditorContent = editorAccess.obtainTextValue();
        clearAllNotifications();

        try {
            JSON.parse(rawEditorContent);
            await initiateDataConversion(rawEditorContent);
        } catch (syntaxError) {
            presentNotification('error', 'Invalid JSON Input |', syntaxError.message);
        }
    };

    setupInitialState();

    return {
        broadcastFeedback: presentNotification,
        revokeFeedback: clearAllNotifications,
        displayOutputSection: showGeneratedOutput,
        hideOutputSection: hideGeneratedOutput,
        startDataProcessing: initiateDataConversion,
        configureComponent: prepareEditorComponent,
        executeConversionWorkflow: executeConversionWorkflow,
        retrieveCurrentStatus: () => ({ ...currentProcessStatus })
    };
}