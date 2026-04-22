var initialRequestBlueprint;
var defaultRequestBlueprint = {
    requestProtocol: '',
    locationTemplate: '',
    payloadExamples: {},
    locationParameters: [],
    baseAddress: '/'
};

function parseEncodedContent(encodedString) {
    if (!encodedString) return "";
    return decodeURIComponent(encodedString.replace(/\+/gi, "%20")).replace(/\r\n/gi, "\n");
}

function adjustHeaderEntry(headersArray, headerKey, headerValue) {
    const normalizedKey = headerKey.toLowerCase();
    let found = false;
    for (let i = 0; i < headersArray.length; i++) {
        if (headersArray[i].key.toLowerCase() === normalizedKey) {
            headersArray[i].value = headerValue;
            found = true;
            break;
        }
    }
    if (!found) {
        headersArray.push({ key: headerKey, value: headerValue });
    }
}

async function processNetworkResponse(networkResult) {
    const statusNumeric = networkResult.status;
    const statusDescription = networkResult.statusText;
    const responseMetadata = networkResult.headers;
    const rawContentPromise = networkResult.text();

    let adjustedStatusNumeric = statusNumeric;
    if (statusNumeric === 1223) {
        adjustedStatusNumeric = 204;
    }

    return rawContentPromise.then(rawContent => {
        let headersString = '';
        for (const [key, value] of responseMetadata.entries()) {
            headersString += `${key}: ${value}\n`;
        }
        const summaryStatus = `${adjustedStatusNumeric}/${statusDescription}`;
        return { statusDisplay: summaryStatus, metadata: headersString, bodyContent: rawContent };
    });
}

function constructResourceLocation(locationTemplate, locationParameters) {
    let finalPath = locationTemplate;

    finalPath = locationParameters.reduce((currentPath, paramItem) => {
        if (paramItem.active) {
            const paramData = paramItem.data;
            if (paramData !== "") {
                const placeholderToken = `{${paramItem.key}}`;
                return currentPath.replace(placeholderToken, paramData);
            }
        } else {
            return pruneLocationSegment(currentPath, paramItem.key);
        }
        return currentPath;
    }, finalPath);

    finalPath = finalPath.replace(/\/\?/g, "?");
    finalPath = finalPath.replace(/\?&/g, "?");
    finalPath = finalPath.replace(/[\?&]$/, "");

    return finalPath;
}

function pruneLocationSegment(initialTemplate, segmentKey) {
    let currentPath = initialTemplate;
    const segmentIdentifier = `{${segmentKey}}`;
    const segmentPattern = `${segmentKey}=${segmentIdentifier}`;

    currentPath = currentPath.replace(segmentPattern, "");
    currentPath = currentPath.replace(segmentIdentifier, "");
    return currentPath;
}

async function dispatchNetworkCall(requestMethod, targetUrl, headerEntries, payloadContent, responseHandler) {
    if (!requestMethod) {
        alert("Request Method cannot be empty.");
        return false;
    }
    if (!targetUrl) {
        alert("Target URL cannot be empty.");
        return false;
    }

    const requestOptions = {
        method: requestMethod,
        headers: new Headers(),
    };

    try {
        headerEntries.forEach(header => {
            if (header.key && header.value) {
                requestOptions.headers.append(header.key, header.value);
            }
        });
    } catch (e) {
        alert("Invalid header configuration.");
        return false;
    }

    const methodsWithBody = ['POST', 'PUT', 'PATCH'];
    if (methodsWithBody.includes(requestMethod.toUpperCase()) && payloadContent !== null) {
        requestOptions.body = payloadContent;
    }

    try {
        const encodedTargetUrl = encodeURI(targetUrl);
        const networkResponse = await fetch(encodedTargetUrl, requestOptions);
        const processedOutcome = await processNetworkResponse(networkResponse);
        responseHandler(processedOutcome);
        return true;
    } catch (e) {
        alert(`Network request failed: ${e.message || e}`);
        return false;
    }
}

class ApiInteractionManager {
    constructor(inputConfig) {
        this._config = inputConfig;
        this._elements = this._gatherDomElements();

        this._requestProtocol = inputConfig.requestProtocol || '';
        this._locationTemplate = inputConfig.locationTemplate || '';
        this._currentLocation = this._locationTemplate;
        this._payloadExamples = inputConfig.payloadExamples || {};
        this._availableFormats = Object.keys(this._payloadExamples);

        this._locationParameters = (inputConfig.locationParameters || []).map(param => ({
            key: param.name,
            data: param.value,
            active: true
        }));

        this._operationHeaders = [];
        if (this._availableFormats.length > 0) {
            this._contentFormat = this._availableFormats[0];
            adjustHeaderEntry(this._operationHeaders, "content-type", this._contentFormat);
        } else {
            this._contentFormat = '';
        }
        this._displayPayloadSection = this._availableFormats.length > 0;
        this._currentPayload = '';
        this._operationResult = null;

        this._setupInitialUIState();
        this._attachEventHandlers();
        this._refreshPathDisplay();
        this._refreshPayloadSection();
    }

    _gatherDomElements() {
        return {
            mainModal: document.getElementById('main-interface-modal'),
            resultModal: document.getElementById('result-display-modal'),
            invokeButton: document.getElementById('invoke-action-button'),
            methodInput: document.getElementById('method-selector'),
            pathTemplateDisplay: document.getElementById('path-template-display'),
            actualPathDisplay: document.getElementById('actual-path-display'),
            paramContainer: document.getElementById('param-list-container'),
            headerContainer: document.getElementById('header-list-container'),
            addHeaderButton: document.getElementById('add-header-button'),
            formatSelector: document.getElementById('format-selector'),
            payloadSection: document.getElementById('payload-input-section'),
            payloadInput: document.getElementById('payload-content-input'),
            resultDisplay: document.getElementById('result-content-display'),
            mainModalClose: document.querySelector('#main-interface-modal .close-button'),
            resultModalClose: document.querySelector('#result-display-modal .close-button'),
            openMainModalButton: document.getElementById('launch-client-button')
        };
    }

    _setupInitialUIState() {
        if (this._elements.methodInput) {
            this._elements.methodInput.value = this._requestProtocol;
        }
        if (this._elements.pathTemplateDisplay) {
            this._elements.pathTemplateDisplay.textContent = this._locationTemplate;
        }

        if (this._elements.formatSelector) {
            this._elements.formatSelector.innerHTML = '';
            this._availableFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format;
                this._elements.formatSelector.appendChild(option);
            });
            this._elements.formatSelector.value = this._contentFormat;
        }
        this._renderLocationParameters();
        this._renderOperationHeaders();
    }

    _attachEventHandlers() {
        if (this._elements.openMainModalButton) {
            this._elements.openMainModalButton.addEventListener('click', () => this._showModal(this._elements.mainModal));
        }

        if (this._elements.mainModalClose) {
            this._elements.mainModalClose.addEventListener('click', () => this._hideModal(this._elements.mainModal));
        }
        if (this._elements.resultModalClose) {
            this._elements.resultModalClose.addEventListener('click', () => this._hideModal(this._elements.resultModal));
        }

        if (this._elements.mainModal) {
            this._elements.mainModal.addEventListener('click', (e) => {
                if (e.target === this._elements.mainModal) this._hideModal(this._elements.mainModal);
            });
        }
        if (this._elements.resultModal) {
            this._elements.resultModal.addEventListener('click', (e) => {
                if (e.target === this._elements.resultModal) this._hideModal(this._elements.resultModal);
            });
        }

        if (this._elements.methodInput) {
            this._elements.methodInput.addEventListener('change', (e) => {
                this._requestProtocol = e.target.value;
            });
        }

        if (this._elements.addHeaderButton) {
            this._elements.addHeaderButton.addEventListener('click', () => this.appendHeader());
        }

        if (this._elements.formatSelector) {
            this._elements.formatSelector.addEventListener('change', (e) => {
                this._contentFormat = e.target.value;
                this._updatePayloadAndHeadersForFormat();
            });
        }

        if (this._elements.payloadInput) {
            this._elements.payloadInput.addEventListener('input', (e) => {
                this._currentPayload = e.target.value;
                this._updateContentLengthHeader();
            });
        }

        if (this._elements.invokeButton) {
            this._elements.invokeButton.addEventListener('click', () => this.initiateCommunication());
        }
    }

    _showModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    _hideModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    _renderLocationParameters() {
        if (!this._elements.paramContainer) return;
        this._elements.paramContainer.innerHTML = '';
        this._locationParameters.forEach((param, index) => {
            const paramDiv = document.createElement('div');
            paramDiv.className = 'param-entry';
            paramDiv.innerHTML = `
                <span>${param.key}:</span>
                <input type="text" value="${param.data}" data-param-index="${index}" class="param-value-input">
                <input type="checkbox" ${param.active ? 'checked' : ''} data-param-index="${index}" class="param-active-toggle">
            `;
            this._elements.paramContainer.appendChild(paramDiv);

            paramDiv.querySelector('.param-value-input').addEventListener('input', (e) => {
                this._locationParameters[index].data = e.target.value;
                this._refreshPathDisplay();
            });
            paramDiv.querySelector('.param-active-toggle').addEventListener('change', (e) => {
                this._locationParameters[index].active = e.target.checked;
                this._refreshPathDisplay();
            });
        });
    }

    _renderOperationHeaders() {
        if (!this._elements.headerContainer) return;
        this._elements.headerContainer.innerHTML = '';
        this._operationHeaders.forEach((header, index) => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-entry';
            headerDiv.innerHTML = `
                <input type="text" value="${header.key}" data-header-index="${index}" data-header-part="key" placeholder="Header Name">
                <input type="text" value="${header.value}" data-header-index="${index}" data-header-part="value" placeholder="Header Value">
                <button type="button" data-header-index="${index}" class="remove-header-button">X</button>
            `;
            this._elements.headerContainer.appendChild(headerDiv);

            headerDiv.querySelector('input[data-header-part="key"]').addEventListener('input', (e) => {
                this._operationHeaders[index].key = e.target.value;
            });
            headerDiv.querySelector('input[data-header-part="value"]').addEventListener('input', (e) => {
                this._operationHeaders[index].value = e.target.value;
            });
            headerDiv.querySelector('.remove-header-button').addEventListener('click', () => this.discardHeader(index));
        });
    }

    _refreshPathDisplay() {
        this._currentLocation = constructResourceLocation(this._locationTemplate, this._locationParameters);
        if (this._elements.actualPathDisplay) {
            this._elements.actualPathDisplay.textContent = this._currentLocation;
        }
    }

    _refreshPayloadSection() {
        if (!this._elements.payloadSection || !this._elements.payloadInput) return;
        if (this._displayPayloadSection) {
            this._elements.payloadSection.style.display = 'block';
            this._elements.payloadInput.value = this._currentPayload;
        } else {
            this._elements.payloadSection.style.display = 'none';
        }
    }

    _updatePayloadAndHeadersForFormat() {
        this._currentPayload = parseEncodedContent(this._payloadExamples[this._contentFormat]) || "";
        adjustHeaderEntry(this._operationHeaders, "content-type", this._contentFormat);
        this._updateContentLengthHeader();
        this._renderOperationHeaders();
        this._refreshPayloadSection();
    }

    _updateContentLengthHeader() {
        const payloadLength = this._currentPayload.length;
        adjustHeaderEntry(this._operationHeaders, "content-length", payloadLength.toString());
        this._renderOperationHeaders();
    }

    appendHeader() {
        this._operationHeaders.splice(0, 0, { key: "", value: "" });
        this._renderOperationHeaders();
    }

    discardHeader(index) {
        this._operationHeaders.splice(index, 1);
        this._renderOperationHeaders();
        this._updateContentLengthHeader();
    }

    async initiateCommunication() {
        const resolvedPath = this._currentLocation;
        const httpPrefix = "http://";
        const httpsPrefix = "https://";

        const targetAddress = (resolvedPath.startsWith(httpPrefix) || resolvedPath.startsWith(httpsPrefix)) ?
            resolvedPath :
            this._config.baseAddress + resolvedPath;

        const requestMethod = this._requestProtocol;
        const headerEntries = this._operationHeaders.filter(h => h.key && h.value);
        const payloadContent = this._displayPayloadSection ? this._currentPayload : null;

        await dispatchNetworkCall(requestMethod, targetAddress, headerEntries, payloadContent, (outcome) => {
            this._operationResult = outcome;
            if (this._elements.resultDisplay) {
                this._elements.resultDisplay.textContent = `Status: ${outcome.statusDisplay}\n\nHeaders:\n${outcome.metadata}\n\nBody:\n${outcome.bodyContent}`;
            }
            this._showModal(this._elements.resultModal);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('main-interface-modal')) {
        document.body.innerHTML += `
            <style>
                .modal-overlay {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0,0,0,0.4);
                }
                .modal-content {
                    background-color: #fefefe;
                    margin: 15% auto;
                    padding: 20px;
                    border: 1px solid #888;
                    width: 80%;
                    max-width: 600px;
                    position: relative;
                }
                .close-button {
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .close-button:hover, .close-button:focus {
                    color: black;
                    text-decoration: none;
                    cursor: pointer;
                }
                .modal-open { overflow: hidden; }
                .param-entry, .header-entry { margin-bottom: 5px; }
                #payload-input-section { margin-top: 10px; }
                #payload-content-input { width: 100%; box-sizing: border-box; }
                #invoke-action-button { margin-top: 15px; padding: 8px 15px; }
            </style>

            <button id="launch-client-button">Open Request Client</button>

            <div id="main-interface-modal" class="modal-overlay">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>API Request Client</h2>
                    <div>
                        <label for="method-selector">Method:</label>
                        <input type="text" id="method-selector" value="GET">
                    </div>
                    <div>
                        <label>Path Template:</label>
                        <span id="path-template-display"></span>
                    </div>
                    <div>
                        <label>Current Path:</label>
                        <span id="actual-path-display"></span>
                    </div>
                    <h3>Parameters</h3>
                    <div id="param-list-container"></div>
                    <h3>Headers <button id="add-header-button">+</button></h3>
                    <div id="header-list-container"></div>
                    <div id="payload-input-section">
                        <h3>Payload</h3>
                        <label for="format-selector">Format:</label>
                        <select id="format-selector"></select>
                        <textarea id="payload-content-input" rows="10" cols="50"></textarea>
                    </div>
                    <button id="invoke-action-button">Send Request</button>
                </div>
            </div>

            <div id="result-display-modal" class="modal-overlay">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Request Result</h2>
                    <pre id="result-content-display"></pre>
                </div>
            </div>
        `;
    }

    const currentBlueprint = initialRequestBlueprint || defaultRequestBlueprint;
    new ApiInteractionManager(currentBlueprint);
});