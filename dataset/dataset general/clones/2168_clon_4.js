(function(globalScope) {
    const initialSettings = {
        transferEndpoint: globalScope.ajaxurl + "?action=get_file_info",
        successMessagePrefix: "Successfully prepared file: <br/>"
    };

    function createFileReceiver(hostElement, inputSettings) {
        const currentConfiguration = Object.assign({}, initialSettings, inputSettings);

        const internalNodes = {};
        internalNodes.hiddenPathEntry = document.createElement('input');
        internalNodes.hiddenPathEntry.setAttribute('type', 'hidden');
        internalNodes.hiddenPathEntry.className = 'receptor_data_path';
        internalNodes.hiddenPathEntry.name = 'payload_info[destination]';
        hostElement.appendChild(internalNodes.hiddenPathEntry);

        internalNodes.hiddenTypeEntry = document.createElement('input');
        internalNodes.hiddenTypeEntry.setAttribute('type', 'hidden');
        internalNodes.hiddenTypeEntry.className = 'receptor_data_type';
        internalNodes.hiddenTypeEntry.name = 'payload_info[category]';
        hostElement.appendChild(internalNodes.hiddenTypeEntry);

        internalNodes.feedbackPanel = document.createElement('p');
        internalNodes.feedbackPanel.style.display = 'none';
        hostElement.appendChild(internalNodes.feedbackPanel);

        const displayFeedback = (message, isError) => {
            internalNodes.feedbackPanel.style.display = '';
            internalNodes.feedbackPanel.textContent = '';
            internalNodes.feedbackPanel.innerHTML = message;

            if (isError) {
                internalNodes.feedbackPanel.classList.remove('transfer_success');
                internalNodes.feedbackPanel.classList.add('transfer_error');
            } else {
                internalNodes.feedbackPanel.classList.remove('transfer_error');
                internalNodes.feedbackPanel.classList.add('transfer_success');
            }
        };

        const transmitPayload = (incomingFiles, itemIndex, activeZone, components) => {
            const currentPayload = incomingFiles[itemIndex];
            if (!currentPayload) return;

            activeZone.classList.remove('active_drop_zone');

            const payloadData = new FormData();
            payloadData.append('file_upload', currentPayload);

            fetch(currentConfiguration.transferEndpoint, {
                method: 'POST',
                body: payloadData,
                headers: {
                    'X-Payload-Category': currentPayload.type || 'application/octet-stream',
                    'X-Payload-Volume': currentPayload.size.toString(),
                    'X-Payload-Label': encodeURIComponent(currentPayload.name)
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(serverData => {
                if (serverData.issue) {
                    displayFeedback(serverData.issue, true);
                    return;
                }
                components.hiddenPathEntry.value = serverData.file_destination;
                components.hiddenTypeEntry.value = currentPayload.type;
                displayFeedback(currentConfiguration.successMessagePrefix + currentPayload.name, false);
            })
            .catch(transferError => {
                console.error("File transfer failed:", transferError);
                displayFeedback("Transfer problem: " + (transferError.message || JSON.stringify(transferError)), true);
            });
        };

        hostElement.addEventListener('dragenter', evt => {
            evt.preventDefault();
        });

        hostElement.addEventListener('dragover', evt => {
            evt.preventDefault();
            hostElement.classList.add('active_drop_zone');
        });

        hostElement.addEventListener('dragleave', evt => {
            evt.preventDefault();
            hostElement.classList.remove('active_drop_zone');
        });

        hostElement.addEventListener('drop', evt => {
            evt.preventDefault();
            const dataCollection = evt.dataTransfer.files;
            transmitPayload(dataCollection, 0, hostElement, internalNodes);
        });

        return {};
    }

    if (!globalScope.UtilityKit) {
        globalScope.UtilityKit = {};
    }
    globalScope.UtilityKit.initiateFileDropzone = function(selector, options) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => createFileReceiver(element, options));
    };

})(window);