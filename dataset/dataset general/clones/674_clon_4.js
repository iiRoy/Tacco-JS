let requestTimeoutDuration = 30000; // milliseconds

// This class encapsulates a single network operation.
class NetworkOperationUnit {
    constructor(operationUri, resultDestination, shouldAutoRestart, postDataContent) {
        this.resourceAddress = operationUri;
        this.resultTarget = resultDestination; // Could be a function or a DOM element ID
        this.repetitionEnabled = shouldAutoRestart;
        this.transmittedData = postDataContent;
        this.currentAbortController = null;
        this.lastExecutionTime = null;
    }

    async commenceExecution() {
        this.lastExecutionTime = Date.now();
        this.currentAbortController = new AbortController();
        const signalForAbort = this.currentAbortController.signal;

        try {
            const timeoutSignal = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timed out')), requestTimeoutDuration)
            );

            const networkRequest = fetch(this.resourceAddress, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: this.transmittedData,
                signal: signalForAbort
            });

            const operationResponse = await Promise.race([networkRequest, timeoutSignal]);

            if (!operationResponse.ok) {
                throw new Error(`Server responded with status: ${operationResponse.status}`);
            }

            const responseContentType = operationResponse.headers.get('content-type');
            let processedResult = null;

            if (responseContentType && responseContentType.includes('text/xml')) {
                const xmlString = await operationResponse.text();
                const domParser = new DOMParser();
                processedResult = domParser.parseFromString(xmlString, 'text/xml');
            } else {
                processedResult = await operationResponse.text();
            }

            this.handleCompletion(processedResult);

        } catch (operationError) {
            if (operationError.name === 'AbortError' || operationError.message === 'Operation timed out') {
                console.warn(`Network operation to ${this.resourceAddress} was cancelled or timed out.`);
                this.handleCompletion(null, true); // Indicate timeout/cancellation
            } else {
                console.error(`Network operation to ${this.resourceAddress} failed:`, operationError);
                this.handleCompletion(null, false); // Indicate generic failure
            }
        } finally {
            this.currentAbortController = null;
        }
    }

    handleCompletion(data, isTimeout = false) {
        if (typeof this.resultTarget === 'function') {
            this.resultTarget(data);
        } else if (typeof this.resultTarget === 'string') {
            const targetElement = document.getElementById(this.resultTarget);
            if (targetElement && data !== null) {
                targetElement.innerHTML = data;
            } else if (isTimeout) {
                alert("Service command failed.\nConnectivity lost.");
            }
        } else if (isTimeout) {
            alert("Service command failed.\nConnectivity lost.");
        }

        if (this.repetitionEnabled) {
            setTimeout(() => {
                startNetworkOperation(this.resourceAddress, this.resultTarget, this.repetitionEnabled, this.transmittedData);
            }, 10);
        }
    }
}

// Function to start a network operation (replaces newAJAXCommand)
function startNetworkOperation(addressUri, displayTarget, shouldAutoRestart, transmissionData) {
    const operation = new NetworkOperationUnit(addressUri, displayTarget, shouldAutoRestart, transmissionData);
    operation.commenceExecution();
}

// XML parsing function (replaces getXMLValue)
function retrieveXmlElementContent(xmlDocumentObject, tagName) {
    try {
        const element = xmlDocumentObject.querySelector(tagName);
        return element ? element.textContent : null;
    } catch (error) {
        return null;
    }
}

// Renamed and restructured DOM manipulation functions

function constructPageHeader() {
    const targetElement = document.getElementById('Y');
    if (!targetElement) return;

    const headerTable = document.createElement('table');
    headerTable.width = '100%';
    headerTable.height = '120px';
    headerTable.setAttribute('border', '0');
    headerTable.setAttribute('cellpadding', '4');
    headerTable.setAttribute('cellspacing', '0');
    headerTable.className = 'handf';

    const tableRow = document.createElement('tr');

    const cell1 = document.createElement('td');
    cell1.width = '10%';
    const homeLink = document.createElement('a');
    homeLink.className = 'hw';
    homeLink.href = 'index.htm';
    const homeImage = document.createElement('img');
    homeImage.src = 'home.gif';
    homeImage.setAttribute('border', '0');
    homeLink.appendChild(homeImage);
    cell1.appendChild(homeLink);

    const cell2 = document.createElement('td');
    cell2.width = '80%';
    cell2.align = 'center';
    const titleLink = document.createElement('a');
    titleLink.innerHTML = (typeof headerAssets !== 'undefined' && headerAssets[0] ? headerAssets[0] : '') + '<br>' + (typeof headerAssets !== 'undefined' && headerAssets[1] ? headerAssets[1] : '');
    cell2.appendChild(titleLink);

    const cell3 = document.createElement('td');
    cell3.width = '10%';
    cell3.align = 'right';
    const helpLink = document.createElement('a');
    helpLink.href = 'http://wiki.smarthome.com/index.php?title=SmartLinc_Help';
    helpLink.target = '_blank';
    const helpImage = document.createElement('img');
    helpImage.src = 'help.gif';
    helpImage.setAttribute('border', '0');
    helpLink.appendChild(helpImage);
    cell3.appendChild(helpLink);

    tableRow.appendChild(cell1);
    tableRow.appendChild(cell2);
    tableRow.appendChild(cell3);
    headerTable.appendChild(tableRow);

    targetElement.innerHTML = '';
    targetElement.appendChild(headerTable);
}

function constructPageFooter() {
    const targetElement = document.getElementById('foot');
    if (!targetElement) return;

    const footerTable = document.createElement('table');
    footerTable.width = '100%';
    footerTable.height = '120px';
    footerTable.setAttribute('border', '0');
    footerTable.setAttribute('cellpadding', '4');
    footerTable.setAttribute('cellspacing', '0');
    footerTable.className = 'handf';

    const tableRow = document.createElement('tr');

    const cell1 = document.createElement('td');
    cell1.width = '33%';
    const roomsLink = document.createElement('a');
    roomsLink.href = 'rooms.htm';
    const roomsImage = document.createElement('img');
    roomsImage.src = 'addroom.gif';
    roomsImage.setAttribute('border', '0');
    roomsLink.appendChild(roomsImage);
    cell1.appendChild(roomsLink);

    const cell2 = document.createElement('td');
    cell2.width = '34%';
    cell2.align = 'center';
    const networkLink = document.createElement('a');
    networkLink.href = 'network.htm';
    const networkImage = document.createElement('img');
    networkImage.src = 'settings.gif';
    networkImage.setAttribute('border', '0');
    networkLink.appendChild(networkImage);
    cell2.appendChild(networkLink);

    const cell3 = document.createElement('td');
    cell3.id = 'RT_display';
    cell3.width = '33%';
    cell3.align = 'right';
    cell3.textContent = (typeof headerAssets !== 'undefined' && headerAssets[2] ? headerAssets[2] : '');

    tableRow.appendChild(cell1);
    tableRow.appendChild(cell2);
    tableRow.appendChild(cell3);
    footerTable.appendChild(tableRow);

    targetElement.innerHTML = '';
    targetElement.appendChild(footerTable);
    targetElement.appendChild(document.createElement('br'));
    targetElement.appendChild(document.createElement('br'));
}

function constructSpecialFooter() {
    const targetElement = document.getElementById('foot');
    if (!targetElement) return;

    const footerTable = document.createElement('table');
    footerTable.width = '100%';
    footerTable.height = '120px';
    footerTable.setAttribute('border', '0');
    footerTable.setAttribute('cellpadding', '4');
    footerTable.setAttribute('cellspacing', '0');
    footerTable.className = 'handf';

    const tableRow = document.createElement('tr');

    const cell1 = document.createElement('td');
    cell1.width = '33%';
    const scenesLink = document.createElement('a');
    scenesLink.addEventListener('click', () => navigateToScenes());
    const scenesImage = document.createElement('img');
    scenesImage.src = 'addscene.gif';
    scenesImage.setAttribute('border', '0');
    scenesLink.appendChild(scenesImage);
    cell1.appendChild(scenesLink);

    const cell2 = document.createElement('td');
    cell2.width = '34%';
    cell2.align = 'center';
    const networkLink = document.createElement('a');
    networkLink.href = 'network.htm';
    const networkImage = document.createElement('img');
    networkImage.src = 'settings.gif';
    networkImage.setAttribute('border', '0');
    networkLink.appendChild(networkImage);
    cell2.appendChild(networkLink);

    const cell3 = document.createElement('td');
    cell3.id = 'RT_display';
    cell3.width = '33%';
    cell3.align = 'right';
    cell3.textContent = (typeof headerAssets !== 'undefined' && headerAssets[2] ? headerAssets[2] : '');

    tableRow.appendChild(cell1);
    tableRow.appendChild(cell2);
    tableRow.appendChild(cell3);
    footerTable.appendChild(tableRow);

    targetElement.innerHTML = '';
    targetElement.appendChild(footerTable);
    targetElement.appendChild(document.createElement('br'));
    targetElement.appendChild(document.createElement('br'));
}

function constructActionFooter() {
    const targetElement = document.getElementById('foot');
    if (!targetElement) return;

    const footerTable = document.createElement('table');
    footerTable.width = '100%';
    footerTable.height = '120px';
    footerTable.setAttribute('border', '0');
    footerTable.setAttribute('cellpadding', '4');
    footerTable.setAttribute('cellspacing', '0');
    footerTable.className = 'handf';

    const tableRow = document.createElement('tr');

    const cell1 = document.createElement('td');
    cell1.width = '33%';
    const saveLink = document.createElement('a');
    saveLink.addEventListener('click', () => updateAndReturn(0));
    saveLink.innerHTML = '<u>Save</u>';
    cell1.appendChild(saveLink);

    const cell2 = document.createElement('td');
    cell2.width = '34%';
    cell2.align = 'center';
    const networkLink = document.createElement('a');
    networkLink.href = 'network.htm';
    const networkImage = document.createElement('img');
    networkImage.src = 'settings.gif';
    networkImage.setAttribute('border', '0');
    networkLink.appendChild(networkImage);
    cell2.appendChild(networkLink);

    const cell3 = document.createElement('td');
    cell3.id = 'RT_display';
    cell3.width = '33%';
    cell3.align = 'right';
    cell3.textContent = (typeof headerAssets !== 'undefined' && headerAssets[2] ? headerAssets[2] : '');

    tableRow.appendChild(cell1);
    tableRow.appendChild(cell2);
    tableRow.appendChild(cell3);
    footerTable.appendChild(tableRow);

    targetElement.innerHTML = '';
    targetElement.appendChild(footerTable);
    targetElement.appendChild(document.createElement('br'));
    targetElement.appendChild(document.createElement('br'));
}

function renderSceneControls(sceneIndex) {
    const initialIndex = 1;
    const finalIndex = 16;

    const imageSources = {
        on: 'on.gif',
        off: 'off.gif',
        bright: 'bright.gif',
        dim: 'dim.gif'
    };

    const imagePreloader = new Map();
    for (const key in imageSources) {
        const img = new Image();
        img.src = imageSources[key];
        imagePreloader.set(key, img);
    }

    const controlContainer = document.getElementById('X');
    if (!controlContainer) return;

    controlContainer.innerHTML = ''; // Clear existing content

    if (typeof headerAssets !== 'undefined' && headerAssets[3] && headerAssets[3] !== '*') {
        const iframeWrapper = document.createElement('div');
        iframeWrapper.style.textAlign = 'center';
        const innerTable = document.createElement('table');
        innerTable.width = '1000';
        const innerRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.width = '125';
        const iframeCell = document.createElement('td');
        iframeCell.width = '400';
        const sceneIframe = document.createElement('iframe');
        sceneIframe.width = '320px';
        sceneIframe.height = '240px';
        sceneIframe.src = headerAssets[3];
        sceneIframe.setAttribute('more attributes', '');
        sceneIframe.textContent = 'Does Not support iframe';
        iframeCell.appendChild(sceneIframe);
        innerRow.appendChild(emptyCell);
        innerRow.appendChild(iframeCell);
        innerTable.appendChild(innerRow);
        iframeWrapper.appendChild(document.createElement('br'));
        iframeWrapper.appendChild(innerTable);
        iframeWrapper.appendChild(document.createElement('br'));
        controlContainer.appendChild(iframeWrapper);
    }

    let activeToggleCount = 0;
    if (typeof mainAssets !== 'undefined' && mainAssets[17]) {
        for (let idx = 0; idx <= 15; idx++) {
            if (mainAssets[17].charAt(idx) === 'f') activeToggleCount++;
        }
        if (activeToggleCount === 16) {
            mainAssets[17] = "tfffffffffffffff";
        }
    }

    for (let currentItem = initialIndex; currentItem <= finalIndex; currentItem++) {
        let formattedItemIndex = currentItem < 10 ? "0" + currentItem : "" + currentItem;
        let controlValue = currentItem + ((sceneIndex - 1) * 16);
        let formattedSceneIndex = sceneIndex < 10 ? "0" + sceneIndex : "" + sceneIndex;

        if (typeof mainAssets !== 'undefined' && mainAssets[17] && mainAssets[currentItem - 1] !== undefined && mainAssets[17].charAt(currentItem - 1) !== 'f' && mainAssets[currentItem - 1] !== "") {

            const lineDiv = document.createElement('div');
            lineDiv.id = 'controlLine' + formattedItemIndex;
            lineDiv.style.textAlign = 'center';

            const itemTable = document.createElement('table');
            itemTable.width = '1000';
            itemTable.setAttribute('border', '0');
            itemTable.setAttribute('cellpadding', '4');
            itemTable.setAttribute('cellspacing', '0');
            const itemRow = document.createElement('tr');

            const cell1 = document.createElement('td');
            cell1.width = '100';
            const button1 = document.createElement('input');
            button1.type = 'image';
            button1.id = 'controlBtn1_' + formattedItemIndex;
            button1.className = 'sicons';
            button1.value = '&#8593';
            button1.addEventListener('click', () => startNetworkOperation('0?15' + controlValue + '=I=0', null, false));
            cell1.appendChild(button1);

            const cell2 = document.createElement('td');
            cell2.width = '100';
            const button2 = document.createElement('input');
            button2.type = 'image';
            button2.id = 'controlBtn2_' + formattedItemIndex;
            button2.className = 'icons';
            button2.value = 'ON ';
            button2.addEventListener('click', () => startNetworkOperation('0?11' + controlValue + '=I=0', null, false));
            cell2.appendChild(button2);

            const cell3 = document.createElement('td');
            cell3.width = '400';
            cell3.align = 'center';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'r01s';
            labelSpan.textContent = mainAssets[currentItem - 1];
            cell3.appendChild(labelSpan);

            const cell4 = document.createElement('td');
            cell4.width = '150';
            const button3 = document.createElement('input');
            button3.type = 'image';
            button3.id = 'controlBtn3_' + formattedItemIndex;
            button3.className = 'icons';
            button3.value = 'OFF';
            button3.addEventListener('click', () => startNetworkOperation('0?13' + controlValue + '=I=0', null, false));
            cell4.appendChild(button3);

            const cell5 = document.createElement('td');
            cell5.width = '150';
            const button4 = document.createElement('input');
            button4.type = 'image';
            button4.id = 'controlBtn4_' + formattedItemIndex;
            button4.className = 'sicons';
            button4.value = '&#8595';
            button4.addEventListener('click', () => startNetworkOperation('0?16' + controlValue + '=I=0', null, false));
            cell5.appendChild(button4);

            const cell6 = document.createElement('td');
            cell6.width = '100';
            const settingsLink = document.createElement('a');
            settingsLink.href = 'setup.htm?' + formattedItemIndex + '=' + formattedSceneIndex + '=F';
            settingsLink.className = 'set';
            settingsLink.textContent = 'Settings';
            cell6.appendChild(settingsLink);

            itemRow.appendChild(cell1);
            itemRow.appendChild(cell2);
            itemRow.appendChild(cell3);
            itemRow.appendChild(cell4);
            itemRow.appendChild(cell5);
            itemRow.appendChild(cell6);
            itemTable.appendChild(itemRow);
            lineDiv.appendChild(itemTable);
            lineDiv.appendChild(document.createElement('br'));
            lineDiv.appendChild(document.createElement('br'));
            controlContainer.appendChild(lineDiv);
        }
    }

    for (let currentItem = 1; currentItem <= 16; currentItem++) {
        const formattedItemIndex = currentItem < 10 ? "0" + currentItem : "" + currentItem;

        if (typeof mainAssets !== 'undefined' && mainAssets[17] && mainAssets[currentItem - 1] !== undefined && mainAssets[17].charAt(currentItem - 1) !== 'f') {
            const controlFlags = mainAssets[16];

            const btn1 = document.getElementById('controlBtn1_' + formattedItemIndex);
            if (btn1) {
                if (controlFlags && controlFlags.charAt((currentItem - 1) * 4) === 'f') {
                    btn1.style.display = 'none';
                } else {
                    btn1.src = imagePreloader.get('bright').src;
                }
            }

            const btn2 = document.getElementById('controlBtn2_' + formattedItemIndex);
            if (btn2) {
                if (controlFlags && controlFlags.charAt((currentItem - 1) * 4 + 1) === 'f') {
                    btn2.style.display = 'none';
                } else {
                    btn2.src = imagePreloader.get('on').src;
                }
            }

            const btn3 = document.getElementById('controlBtn3_' + formattedItemIndex);
            if (btn3) {
                if (controlFlags && controlFlags.charAt((currentItem - 1) * 4 + 2) === 'f') {
                    btn3.style.display = 'none';
                } else {
                    btn3.src = imagePreloader.get('off').src;
                }
            }

            const btn4 = document.getElementById('controlBtn4_' + formattedItemIndex);
            if (btn4) {
                if (controlFlags && controlFlags.charAt((currentItem - 1) * 4 + 3) === 'f') {
                    btn4.style.display = 'none';
                } else {
                    btn4.src = imagePreloader.get('dim').src;
                }
            }
        }
    }
    startNetworkOperation('rstatus.xml', processStatusUpdate, false);
    setTimeout(returnToPageTop, 100);
}

function processStatusUpdate(xmlPayload) {
    const statusDisplayElement = document.getElementById('RT_display');
    if (statusDisplayElement && xmlPayload) {
        statusDisplayElement.textContent = retrieveXmlElementContent(xmlPayload, 'RT');
    }
    setTimeout(() => {
        startNetworkOperation('rstatus.xml', processStatusUpdate, false);
    }, 10000);
}

function returnToPageTop() {
    document.body.scrollTop = 0;
}

// Placeholder functions for original's implicit calls
function navigateToScenes() {
    console.log("Navigating to scenes...");
}

function updateAndReturn(param) {
    console.log("Updating all and going back with param:", param);
}

// The original script had `setTimeout("pollAJAX()",500);` to kick off its polling loop.
// Since the polling loop is replaced by self-managing NetworkOperationUnit instances,
// and the main recurring AJAX request (rstatus.xml) is initiated within `renderSceneControls`
// and then self-reschedules via `processStatusUpdate`, no global initial `setTimeout` is needed.
// The `renderSceneControls` function would be called by some other part of the application
// to set up the UI and start the status updates.
// For example, if it's meant to run on page load:
// document.addEventListener('DOMContentLoaded', () => { renderSceneControls(1); });
// (Assuming '1' is the default scene index based on the original's loop starting at 'start')