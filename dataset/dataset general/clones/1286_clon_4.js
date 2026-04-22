const applicationFacade = (() => {

    const elementIdentifiers = {
        mainContainerSection: '#allparameters',
        parameterTemplateEntry: '.httpparameter:first',
        fileTemplateEntry: '.httpfile:first',
        addParameterButton: '#addprambutton',
        addFileButton: '#addfilebutton',
        removeEntryButton: '.close',
        temporaryNameInput: '.fakeinputname',
        actualValueInput: '.realinputvalue',
        targetUrlField: '#urlvalue',
        requestMethodSelect: '#httpmethod',
        statusCodeDisplay: '#statuspre',
        responseBodyDisplay: '#outputpre',
        responseHeadersDisplay: '#headerpre',
        legacyOutputFrame: '#outputframe',
        ajaxResultDisplayContainer: '#ajaxoutput',
        loadingAnimationElement: '#ajaxspinner',
        initiateRequestButton: '#submitajax',
        mainPayloadForm: '#paramform',
        fileSelectorInput: '.input-file',
        errorNotificationZone: '#errordiv'
    };

    const manageSectionVisibility = () => {
        const primaryContainer = document.querySelector(elementIdentifiers.mainContainerSection);
        const relevantInputs = primaryContainer ? primaryContainer.querySelectorAll(elementIdentifiers.actualValueInput) : [];
        if (primaryContainer) {
            if (relevantInputs.length > 0) {
                primaryContainer.style.display = '';
            } else {
                primaryContainer.style.display = 'none';
            }
        }
    };

    const updateAssociatedNameAttribute = (eventHandle) => {
        const triggeredElement = eventHandle.target;
        if (triggeredElement.matches(elementIdentifiers.temporaryNameInput)) {
            const newAttributeValue = triggeredElement.value;
            const parentComponent = triggeredElement.closest('.httpparameter, .httpfile');
            if (parentComponent) {
                const targetInputElement = parentComponent.querySelector(elementIdentifiers.actualValueInput);
                if (targetInputElement) {
                    targetInputElement.setAttribute('name', newAttributeValue);
                }
            }
        }
    };

    const detachComponentAndRefreshView = (eventHandle) => {
        eventHandle.preventDefault();
        const activator = eventHandle.target;
        if (activator.matches(elementIdentifiers.removeEntryButton)) {
            const removableParentComponent = activator.closest('.httpparameter, .httpfile');
            if (removableParentComponent && removableParentComponent.parentNode) {
                removableParentComponent.parentNode.removeChild(removableParentComponent);
                manageSectionVisibility();
            }
        }
    };

    const cloneAndAppendItem = (sourceSelector, destinationSelector) => (eventHandle) => {
        eventHandle.preventDefault();
        const sourceNode = document.querySelector(sourceSelector);
        const destinationNode = document.querySelector(destinationSelector);

        if (sourceNode && destinationNode) {
            const replicatedNode = sourceNode.cloneNode(true);
            replicatedNode.style.display = '';
            destinationNode.appendChild(replicatedNode);
            manageSectionVisibility();
        }
    };

    const determineIfFileInputsExist = () => {
        const formElement = document.querySelector(elementIdentifiers.mainPayloadForm);
        return formElement ? formElement.querySelectorAll(elementIdentifiers.fileSelectorInput).length > 0 : false;
    };

    const generateStandardPayload = () => {
        const collectedData = {};
        const inputElements = document.querySelectorAll(`${elementIdentifiers.mainContainerSection} ${elementIdentifiers.actualValueInput}`);

        Array.from(inputElements).forEach(inputElement => {
            const attributeName = inputElement.getAttribute('name');
            if (attributeName && attributeName !== 'undefined') {
                collectedData[attributeName] = inputElement.value;
            }
        });
        return collectedData;
    };

    const constructMultiPartPayload = () => {
        const payloadObject = new FormData();
        const inputElements = document.querySelectorAll(`${elementIdentifiers.mainContainerSection} ${elementIdentifiers.actualValueInput}`);

        Array.from(inputElements).forEach(inputElement => {
            const attributeName = inputElement.getAttribute('name');
            if (attributeName && attributeName !== 'undefined') {
                if (inputElement.files && inputElement.files[0]) {
                    payloadObject.append(attributeName, inputElement.files[0]);
                } else {
                    payloadObject.append(attributeName, inputElement.value);
                }
            }
        });
        return payloadObject;
    };

    const displayConnectivityIssueAlert = () => {
        const alertArea = document.querySelector(elementIdentifiers.errorNotificationZone);
        if (alertArea) {
            const messageElement = document.createElement('div');
            messageElement.className = 'alert alert-error';
            messageElement.innerHTML = '<a class="close" data-dismiss="alert">&times;</a> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your Firebug...';
            alertArea.appendChild(messageElement);
        }
    };

    const executeNetworkOperation = async (operationConfig) => {
        const urlSource = document.querySelector(elementIdentifiers.targetUrlField);
        const methodSelector = document.querySelector(elementIdentifiers.requestMethodSelect);
        const statusOutputField = document.querySelector(elementIdentifiers.statusCodeDisplay);
        const bodyOutputField = document.querySelector(elementIdentifiers.responseBodyDisplay);
        const headersOutputField = document.querySelector(elementIdentifiers.responseHeadersDisplay);
        const oldFrame = document.querySelector(elementIdentifiers.legacyOutputFrame);
        const resultContainer = document.querySelector(elementIdentifiers.ajaxResultDisplayContainer);
        const spinnerIndicator = document.querySelector(elementIdentifiers.loadingAnimationElement);

        if (!urlSource || !methodSelector || !statusOutputField || !bodyOutputField || !headersOutputField || !oldFrame || !resultContainer || !spinnerIndicator) {
            console.error("Missing essential DOM elements for request processing.");
            return;
        }

        const requestTargetUrl = urlSource.value;
        const requestVerb = methodSelector.value;

        oldFrame.style.display = 'none';
        bodyOutputField.textContent = '';
        headersOutputField.textContent = '';
        oldFrame.setAttribute('src', '');
        resultContainer.style.display = '';
        statusOutputField.textContent = '0';
        statusOutputField.classList.remove('alert-success', 'alert-error', 'alert-warning');
        spinnerIndicator.style.display = '';

        try {
            const fetchOptions = {
                method: requestVerb,
                headers: {},
            };

            if (operationConfig.payload) {
                if (operationConfig.payload instanceof FormData) {
                    fetchOptions.body = operationConfig.payload;
                } else if (typeof operationConfig.payload === 'object' && !Array.isArray(operationConfig.payload)) {
                    fetchOptions.body = new URLSearchParams(operationConfig.payload).toString();
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            }

            Object.assign(fetchOptions, operationConfig.fetchOverrides || {});

            const networkResponse = await fetch(requestTargetUrl, fetchOptions);

            const currentStatus = networkResponse.status;
            statusOutputField.textContent = `HTTP ${currentStatus} ${networkResponse.statusText}`;

            let statusCategoryClass = '';
            if (currentStatus >= 200 && currentStatus < 300) {
                statusCategoryClass = 'alert-success';
            } else if (currentStatus >= 400) {
                statusCategoryClass = 'alert-error';
            } else {
                statusCategoryClass = 'alert-warning';
            }
            if (statusCategoryClass) {
                statusOutputField.classList.add(statusCategoryClass);
            }

            let collectedHeaders = '';
            networkResponse.headers.forEach((value, name) => {
                collectedHeaders += `${name}: ${value}\n`;
            });
            headersOutputField.textContent = collectedHeaders;

            bodyOutputField.textContent = await networkResponse.text();

        } catch (err) {
            console.error("Network request encountered an issue:", err);
            statusOutputField.textContent = "HTTP 0 Network Error";
            statusOutputField.classList.add('alert-error');
            displayConnectivityIssueAlert();
        } finally {
            spinnerIndicator.style.display = 'none';
        }
    };

    const handleSubmissionInitiation = (eventHandle) => {
        eventHandle.preventDefault();
        if (determineIfFileInputsExist()) {
            executeNetworkOperation({
                payload: constructMultiPartPayload(),
                fetchOverrides: {}
            });
        } else {
            executeNetworkOperation({
                payload: generateStandardPayload()
            });
        }
    };

    const initializeInterface = () => {
        manageSectionVisibility();

        document.addEventListener('click', (e) => {
            detachComponentAndRefreshView(e);
        });
        document.addEventListener('blur', (e) => {
            updateAssociatedNameAttribute(e);
        }, true);

        document.querySelector(elementIdentifiers.addParameterButton)?.addEventListener('click', cloneAndAppendItem(elementIdentifiers.parameterTemplateEntry, elementIdentifiers.mainContainerSection));
        document.querySelector(elementIdentifiers.addFileButton)?.addEventListener('click', cloneAndAppendItem(elementIdentifiers.fileTemplateEntry, elementIdentifiers.mainContainerSection));
        document.querySelector(elementIdentifiers.initiateRequestButton)?.addEventListener('click', handleSubmissionInitiation);

        const initialParamTemplate = document.querySelector(elementIdentifiers.parameterTemplateEntry);
        if (initialParamTemplate) initialParamTemplate.style.display = 'none';
        const initialFileTemplate = document.querySelector(elementIdentifiers.fileTemplateEntry);
        if (initialFileTemplate) initialFileTemplate.style.display = 'none';
    };

    return {
        startApplication: initializeInterface
    };

})();

document.addEventListener('DOMContentLoaded', applicationFacade.startApplication);