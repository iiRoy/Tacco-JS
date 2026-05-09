const applicationState = {
    editorCore: null,
    processingPauseHandle: null,
    lineIndications: new Map(),
    textHighlights: [],
    currentFocusLineRef: 0,
    processingDelayMs: 300,
    errorScanPattern: /^.*\.idr:(\d+):(\d+):/gm,
    indicatorChar: '\u25cf',
    serverServiceFailure: false,
    requestActive: false,
    requestQueuedForLater: false,
};

function generateElement(tagKind, classSpec, contentText) {
    const freshlyMadeElement = document.createElement(tagKind);
    if (Array.isArray(classSpec)) {
        freshlyMadeElement.classList.add(...classSpec);
    } else if (typeof classSpec === 'string' && classSpec) {
        freshlyMadeElement.classList.add(classSpec);
    }
    freshlyMadeElement.textContent = contentText;
    return freshlyMadeElement;
}

function establishPanelArrangement(targetNode, layoutConfig) {
    // This part assumes a jQuery UI Layout plugin is available.
    // We replace the jQuery selector and method call with native DOM and a direct call.
    // The configuration object structure is external to this code, so it remains similar.
    if (typeof targetNode.layout === 'function') {
        targetNode.layout(layoutConfig);
    } else {
        // Fallback or warning if the external layout library is not present
        console.warn('Layout library method not found on target node:', targetNode);
    }
}

async function performCodeTransmission() {
    if (applicationState.requestActive) {
        applicationState.requestQueuedForLater = true;
        return;
    }

    applicationState.requestActive = true;
    try {
        const networkResponse = await fetch('/sources/Foo.idr', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/x-haskell; charset=utf-8'
            },
            body: applicationState.editorCore.getValue()
        });

        const responsePayload = await networkResponse.text();
        handleServerResponse(responsePayload, networkResponse.statusText, networkResponse);
    } catch (errorDetails) {
        console.error('Code transmission failed:', errorDetails);
        applicationState.serverServiceFailure = true;
        handleServerResponse('', 'network failure', null);
    } finally {
        applicationState.requestActive = false;
        if (applicationState.requestQueuedForLater) {
            applicationState.requestQueuedForLater = false;
            initiateDeferredProcessing();
        }
    }
}

function initiateDeferredProcessing() {
    if (applicationState.serverServiceFailure) {
        return;
    }
    if (applicationState.processingPauseHandle) {
        window.clearTimeout(applicationState.processingPauseHandle);
    }
    applicationState.processingPauseHandle = window.setTimeout(performCodeTransmission, applicationState.processingDelayMs);
}

function handleServerResponse(responseData, statusMessage, fetchObject) {
    console.log("Response processing commenced.");
    console.log(responseData);
    console.log(statusMessage);
    console.log(fetchObject);

    applyErrorAnnotations(responseData || '');

    const resultDisplayElement = document.getElementById('result');
    if (resultDisplayElement) {
        resultDisplayElement.innerHTML = responseData;
    }
}

function applyErrorAnnotations(errorString) {
    console.log("Applying error markers...");
    console.log(errorString);

    removeExistingAnnotations();

    const allErrorMatches = Array.from(errorString.matchAll(applicationState.errorScanPattern));

    for (const currentMatch of allErrorMatches) {
        const lineIdx = parseInt(currentMatch[1], 10) - 1;
        const charIdx = parseInt(currentMatch[2], 10);
        const codePosition = { line: lineIdx, ch: charIdx };

        addGutterSymbol(lineIdx);
        highlightTextSegment(codePosition);
    }
}

function addGutterSymbol(lineNum) {
    const markerNode = generateElement('span', 'CodeMirror-x-errorLine', applicationState.indicatorChar);
    applicationState.editorCore.setGutterMarker(lineNum, "CodeMirror-x-errorLine", markerNode);
    applicationState.lineIndications.set(lineNum, markerNode); // Keep track for potential granular clearing
}

function removeExistingAnnotations() {
    applicationState.editorCore.clearGutter("CodeMirror-x-errorLine");
    applicationState.lineIndications.clear();

    for (const currentHighlight of applicationState.textHighlights) {
        currentHighlight.clear();
    }
    applicationState.textHighlights = [];
}

function highlightTextSegment(segmentPosition) {
    const tokenInfo = applicationState.editorCore.getTokenAt(segmentPosition);
    const segmentMarker = applicationState.editorCore.markText(
        { line: segmentPosition.line, ch: tokenInfo.start },
        { line: segmentPosition.line, ch: tokenInfo.end },
        { className: "CodeMirror-x-errorToken" }
    );
    applicationState.textHighlights.push(segmentMarker);
}

function initializeAppComponents() {
    const mainInterfaceContainer = document.getElementById('container');
    const panelConfiguration = {
        livePaneResizing: true,
        stateManagement__enabled: true,
        enableCursorHotkey: false,
        east__size: 500,
        north__resizable: false,
        north__closable: false,
        north__paneClass: 'nonexistentClass',
        north__resizerClass: 'nonexistentClass',
        south__resizable: false,
        south__closable: false,
        south__paneClass: 'nonexistentClass',
        south__resizerClass: 'nonexistentClass'
    };
    establishPanelArrangement(mainInterfaceContainer, panelConfiguration);

    const codeInputArea = document.getElementById("hs");
    applicationState.editorCore = CodeMirror.fromTextArea(codeInputArea, {
        mode: "haskell",
        lineNumbers: true,
        matchBrackets: true,
        autofocus: true,
        autoClearEmptyLines: true,
        indentUnit: 2,
        gutters: ["CodeMirror-x-errorLine"],
        onGutterClick: CodeMirror.newFoldFunction(CodeMirror.indentRangeFinder),
        extraKeys: {
            "Tab": function(cm) { cm.replaceSelection("    ", "end"); },
            "Shift-Tab": "indentLess"
        }
    });

    applicationState.editorCore.on("cursorActivity", () => {
        applicationState.editorCore.removeLineClass(applicationState.currentFocusLineRef, "background", "CodeMirror-x-activeLine");
        applicationState.currentFocusLineRef = applicationState.editorCore.addLineClass(
            applicationState.editorCore.getCursor().line, "background", "CodeMirror-x-activeLine");
    });

    applicationState.editorCore.on("change", () => initiateDeferredProcessing());

    applicationState.currentFocusLineRef = applicationState.editorCore.addLineClass(0, "background", "CodeMirror-x-activeLine");

    const clearInputButton = document.getElementById('clearButton');
    if (clearInputButton) {
        clearInputButton.addEventListener('click', () => {
            applicationState.editorCore.setValue('');
        });
    }

    performCodeTransmission();
}

document.addEventListener('DOMContentLoaded', initializeAppComponents);