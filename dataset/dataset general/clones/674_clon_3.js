const requestTimeoutDuration = 30000;
const pendingRequests = [];

function initiateAsyncRequest(targetUrl, resultHandler, isRecurring, payloadData) {
    if (!targetUrl || typeof targetUrl !== 'string') {
        console.error("Invalid URL for async request.");
        return;
    }
    if (!resultHandler || (typeof resultHandler !== 'string' && typeof resultHandler !== 'function')) {
        console.error("Invalid result handler. Must be a string ID or a function.");
        return;
    }

    const requestEntry = {};
    const initiationMoment = new Date();

    requestEntry.requestUrl = targetUrl;
    requestEntry.responseTarget = resultHandler;
    requestEntry.shouldRepeat = !!isRecurring;
    requestEntry.xhrInstance = null;

    if (typeof XMLHttpRequest !== 'undefined') {
        requestEntry.xhrInstance = new XMLHttpRequest();
    } else if (typeof ActiveXObject !== 'undefined') {
        try {
            requestEntry.xhrInstance = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            console.warn("ActiveXObject 'Microsoft.XMLHTTP' not supported.", e);
            return;
        }
    } else {
        console.error("Browser does not support XMLHttpRequest or ActiveXObject.");
        return;
    }

    if (requestEntry.xhrInstance) {
        try {
            requestEntry.xhrInstance.open("POST", requestEntry.requestUrl, true);
            requestEntry.xhrInstance.send(payloadData);
        } catch (e) {
            console.error(`Error opening/sending request to ${requestEntry.requestUrl}:`, e);
            return;
        }
    }

    requestEntry.requestTimestamp = initiationMoment.getTime();
    pendingRequests.push(requestEntry);
}

function monitorAsyncOperations() {
    const currentMoment = new Date();
    const reQueueBuffer = [];

    while (pendingRequests.length > 0) {
        const processedRequest = pendingRequests.shift();

        if (!processedRequest || !processedRequest.xhrInstance) {
            console.warn("Skipping an invalid request entry.");
            continue;
        }

        const timeElapsed = currentMoment.getTime() - processedRequest.requestTimestamp;
        const xhr = processedRequest.xhrInstance;

        if (xhr.readyState === 4 && xhr.status === 200) {
            if (typeof processedRequest.responseTarget === 'function') {
                processedRequest.responseTarget(xhr.responseXML?.documentElement);
            } else if (typeof processedRequest.responseTarget === 'string') {
                const targetElement = document.getElementById(processedRequest.responseTarget);
                if (targetElement) {
                    targetElement.innerHTML = xhr.responseText;
                } else {
                    console.warn(`DOM element ID '${processedRequest.responseTarget}' not found.`);
                }
            }

            xhr.abort();
            processedRequest.xhrInstance = null;

            if (processedRequest.shouldRepeat) {
                initiateAsyncRequest(processedRequest.requestUrl, processedRequest.responseTarget, processedRequest.shouldRepeat);
            }
            continue;
        }

        if (timeElapsed > requestTimeoutDuration) {
            if (typeof processedRequest.responseTarget === 'function') {
                processedRequest.responseTarget(null);
            } else {
                console.error(`Async command to ${processedRequest.requestUrl} timed out. Connection lost.`);
            }

            xhr.abort();
            processedRequest.xhrInstance = null;

            if (processedRequest.shouldRepeat) {
                initiateAsyncRequest(processedRequest.requestUrl, processedRequest.responseTarget, processedRequest.shouldRepeat);
            }
            continue;
        }

        reQueueBuffer.push(processedRequest);
    }

    pendingRequests.push(...reQueueBuffer);
    setTimeout(monitorAsyncOperations, 10);
}

function extractXmlNodeValue(xmlDocument, tagName) {
    try {
        const targetElement = xmlDocument.getElementsByTagName(tagName)[0];
        return targetElement?.firstChild?.nodeValue ?? null;
    } catch (parsingError) {
        console.warn(`Error extracting XML value for tag '${tagName}':`, parsingError.message);
        return null;
    }
}

setTimeout(monitorAsyncOperations, 500);

let headerContent = [];
let moduleSettings = [];

function composePageHeader() {
    const headerContainer = document.getElementById('Y');
    if (!headerContainer) {
        console.error("Header container 'Y' not found.");
        return;
    }

    headerContainer.innerHTML = `
        <table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'>
            <tr>
                <td width='10%'>
                    <a class='hw' href='index.htm'><img src='home.gif' border='0' alt='Home'></a>
                </td>
                <td width='80%' align='center'>
                    <a>${headerContent[0] || ''}<br>${headerContent[1] || ''}</a>
                </td>
                <td width='10%' align='right'>
                    <a href='http://wiki.smarthome.com/index.php?title=SmartLinc_Help' target='_blank'>
                        <img src='help.gif' border='0' alt='Help'>
                    </a>
                </td>
            </tr>
        </table>
    `;
}

function composePageFooter() {
    const footerContainer = document.getElementById('foot');
    if (!footerContainer) {
        console.error("Footer container 'foot' not found.");
        return;
    }

    footerContainer.innerHTML = `
        <table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'>
            <tr>
                <td width='33%'><a href='rooms.htm'><img src='addroom.gif' border='0' alt='Add Room'></a></td>
                <td width='34%' align='center'><a href='network.htm'><img src='settings.gif' border='0' alt='Settings'></a></td>
                <td id='RT' width='33%' align='right'>${headerContent[2] || ''}</td>
            </tr>
        </table><br><br>
    `;
}

function composeSceneFooter() {
    const footerContainer = document.getElementById('foot');
    if (!footerContainer) {
        console.error("Scene footer container 'foot' not found.");
        return;
    }

    footerContainer.innerHTML = `
        <table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'>
            <tr>
                <td width='33%'><a onclick='gotoscenes()'><img src='addscene.gif' border='0' alt='Add Scene'></a></td>
                <td width='34%' align='center'><a href='network.htm'><img src='settings.gif' border='0' alt='Settings'></a></td>
                <td id='RT' width='33%' align='right'>${headerContent[2] || ''}</td>
            </tr>
        </table><br><br>
    `;
}

function composeRoomFooter() {
    const footerContainer = document.getElementById('foot');
    if (!footerContainer) {
        console.error("Room footer container 'foot' not found.");
        return;
    }

    footerContainer.innerHTML = `
        <table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'>
            <tr>
                <td width='33%'><a onclick='UpdateAllandgoback(0)'><u>Save</u></a></td>
                <td width='34%' align='center'><a href='network.htm'><img src='settings.gif' border='0' alt='Settings'></a></td>
                <td id='RT' width='33%' align='right'>${headerContent[2] || ''}</td>
            </tr>
        </table><br><br>
    `;
}

function preloadImages(imageSources) {
    return imageSources.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
}

function renderInteractiveControls(sceneGroupIndex) {
    const controlLoopStart = 1;
    const controlLoopEnd = 16;

    const controlActionImages = preloadImages([
        "on.gif",
        "off.gif",
        "bright.gif",
        "dim.gif"
    ]);

    const controlsContainer = document.getElementById('X');
    if (!controlsContainer) {
        console.error("Controls container 'X' not found.");
        return;
    }

    if (headerContent[3] && headerContent[3] !== "*") {
        controlsContainer.innerHTML = `
            <br>
            <center>
                <table width='1000'>
                    <tr>
                        <td width='125'></td>
                        <td width='400'><iframe width='320px' height='240px' src='${headerContent[3]}' title='Embedded Content'></iframe></td>
                    </tr>
                </table>
            </center>
            <br>
        `;
    } else {
        controlsContainer.innerHTML = '';
    }

    let disabledControlsCount = 0;
    if (moduleSettings[17]) {
        for (let i = 0; i < 16; i++) {
            if (moduleSettings[17].charAt(i) === 'f') {
                disabledControlsCount++;
            }
        }
    }
    if (disabledControlsCount === 16 && moduleSettings[17]) {
        moduleSettings[17] = "tfffffffffffffff";
    }

    const controlRowsHtml = [];

    for (let i = controlLoopStart; i <= controlLoopEnd; i++) {
        const paddedControlIndex = String(i).padStart(2, '0');
        const calculatedSceneValue = i + ((sceneGroupIndex - 1) * 16);
        const paddedSceneGroupIndex = String(sceneGroupIndex).padStart(2, '0');

        if (moduleSettings[17]?.charAt(i - 1) !== 'f' && moduleSettings[i - 1] !== undefined && moduleSettings[i - 1] !== "") {
            controlRowsHtml.push(`
                <div id='controlRow${paddedControlIndex}'>
                    <center>
                        <table width='1000' border='0' cellpadding='4' cellspacing='0'>
                            <tr>
                                <td width='100'><input type='image' id='btnUp${paddedControlIndex}' class='sicons' value='&#8593;' onclick="initiateAsyncRequest('0?15${calculatedSceneValue}=I=0', null, false)"></td>
                                <td width='100'><input type='image' id='btnOn${paddedControlIndex}' class='icons' value='ON' onclick="initiateAsyncRequest('0?11${calculatedSceneValue}=I=0', null, false)"></td>
                                <td width='400' align='center'><span class='r01s'>${moduleSettings[i - 1]}</span></td>
                                <td width='150'><input type='image' id='btnOff${paddedControlIndex}' class='icons' value='OFF' onclick="initiateAsyncRequest('0?13${calculatedSceneValue}=I=0', null, false)"></td>
                                <td width='150'><input type='image' id='btnDown${paddedControlIndex}' class='sicons' value='&#8595;' onclick="initiateAsyncRequest('0?16${calculatedSceneValue}=I=0', null, false)"></td>
                                <td width='100'><a href='setup.htm?${paddedControlIndex}=${paddedSceneGroupIndex}=F' class='set'>Settings</a></td>
                            </tr>
                        </table>
                    </center>
                    <br><br>
                </div>
            `);
        }
    }
    controlsContainer.innerHTML += controlRowsHtml.join('');

    for (let i = 1; i <= 16; i++) {
        const paddedIndex = String(i).padStart(2, '0');

        if (moduleSettings[17]?.charAt(i - 1) !== 'f') {
            const controlConfig = moduleSettings[16];
            if (!controlConfig || controlConfig.length < (i - 1) * 4 + 4) {
                console.warn(`Config for control ${i} is incomplete in moduleSettings[16].`);
                continue;
            }

            const updateButton = (idPrefix, configOffset, imageIndex) => {
                const targetButton = document.getElementById(`${idPrefix}${paddedIndex}`);
                if (targetButton) {
                    if (controlConfig.charAt((i - 1) * 4 + configOffset) === 'f') {
                        targetButton.style.display = "none";
                    } else {
                        targetButton.src = controlActionImages[imageIndex].src;
                    }
                }
            };

            updateButton("btnUp", 0, 2);
            updateButton("btnOn", 1, 0);
            updateButton("btnOff", 2, 1);
            updateButton("btnDown", 3, 3);
        }
    }

    setTimeout(scrollToPageTop, 100);
}

function updateLiveStatus(xmlData) {
    if (xmlData) {
        const statusElement = document.getElementById('RT');
        if (statusElement) {
            statusElement.innerHTML = extractXmlNodeValue(xmlData, 'RT') || 'N/A';
        } else {
            console.warn("Status display element 'RT' not found.");
        }
    } else {
        console.warn("No XML data for status update or request timed out.");
    }

    setTimeout(() => initiateAsyncRequest('rstatus.xml', updateLiveStatus, true), 10000);
}

function scrollToPageTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function gotoscenes() {
    console.log("gotoscenes() called - functionality not defined in this clone.");
}

function UpdateAllandgoback(param) {
    console.log(`UpdateAllandgoback(${param}) called - functionality not defined in this clone.`);
}