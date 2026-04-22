(function () {
    "use strict";

    let initialTimestamp = Date.now();
    let documentReadyTimestamp;
    let jsonProcessingStartTimestamp;
    let nonJsonDisplayTimestamp;
    let formattedDisplayTimestamp;

    let originalInitialContentElement = null;
    let mainContentWrapper = null;
    let customStylingElement = null;
    let delayedRevealHandle = null;

    function establishCommunicationListener() {
        chrome.runtime.onMessage.addListener(receiveBackendMessage);
    }

    function receiveBackendMessage(message, sender, sendResponse) {
        if (!message || !message.type) {
            return;
        }

        switch (message.type) {
            case 'NON_JSON_CONTENT':
                nonJsonDisplayTimestamp = Date.now();
                restoreOriginalPageContent();
                break;
            case 'DATA_PROCESSING_INITIATED':
                jsonProcessingStartTimestamp = Date.now();
                clearTimeout(delayedRevealHandle);
                prepareDisplayContainer();
                injectAllStyling();
                showProcessingIndicator();
                break;
            case 'FORMATTED_DATA_READY':
                formattedDisplayTimestamp = Date.now();
                renderFormattedContent(message.formattedHtml);
                exportParsedDataToWindow(message.parsedJson);
                break;
            default:
                break;
        }
    }

    function restoreOriginalPageContent() {
        if (originalInitialContentElement) {
            document.body.innerHTML = '';
            document.body.appendChild(originalInitialContentElement);
            originalInitialContentElement.style.display = '';
        }
        if (mainContentWrapper && mainContentWrapper.parentNode) {
            mainContentWrapper.parentNode.removeChild(mainContentWrapper);
        }
        if (customStylingElement && customStylingElement.parentNode) {
            customStylingElement.parentNode.removeChild(customStylingElement);
        }
    }

    function prepareDisplayContainer() {
        if (originalInitialContentElement && originalInitialContentElement.parentNode) {
            originalInitialContentElement.parentNode.removeChild(originalInitialContentElement);
        }

        if (!mainContentWrapper) {
            mainContentWrapper = document.createElement('div');
            mainContentWrapper.id = 'mainDataDisplay';
            document.body.appendChild(mainContentWrapper);
        } else {
            mainContentWrapper.innerHTML = '';
            mainContentWrapper.style.display = '';
        }
    }

    function injectAllStyling() {
        if (!customStylingElement) {
            customStylingElement = document.createElement('style');
            customStylingElement.id = 'dynamicStyleRules';
            document.head.appendChild(customStylingElement);
        }
        customStylingElement.textContent = `
            body { -webkit-user-select: text; overflow-y: scroll !important; margin: 0; position: relative; }
            #controlStrip { -webkit-user-select: none; display: block; position: absolute; top: 9px; right: 17px; }
            .viewToggleBtn { -webkit-border-radius: 2px; -webkit-box-shadow: 0px 1px 3px rgba(0,0,0,0.1); -webkit-user-select: none; background: -webkit-linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5); border: 1px solid #aaa; color: #444; font-size: 12px; margin-bottom: 0px; min-width: 4em; padding: 3px 0; position: relative; z-index: 10; display: inline-block; width: 80px; text-shadow: 1px 1px rgba(255,255,255,0.3); }
            #rawSourceBtn { margin-left: 0; border-top-left-radius: 0; border-bottom-left-radius: 0; }
            #parsedTreeBtn { margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none; }
            .viewToggleBtn:hover { -webkit-box-shadow: 0px 1px 3px rgba(0,0,0,0.2); background: #ebebeb -webkit-linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9); border-color: #999; color: #222; }
            .viewToggleBtn:active { -webkit-box-shadow: inset 0px 1px 3px rgba(0,0,0,0.2); background: #ebebeb -webkit-linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc); color: #333; }
            .viewToggleBtn.activeSelected { -webkit-box-shadow: inset 0px 1px 5px rgba(0,0,0,0.2); background: #ebebeb -webkit-linear-gradient(#e4e4e4, #dfdfdf 40%, #dcdcdc); color: #333; }
            .viewToggleBtn:focus { outline: 0; }
            #jsonpWrapperStart, #jsonpWrapperEnd { padding: 4px 0 0 8px; color: #000; margin-bottom: -6px; }
            #jsonpWrapperEnd { margin-top: 0; }
            #formattedDisplay { padding-left: 28px; padding-top: 6px; }
            #originalTextDisplay { padding: 36px 5px 5px 5px; }
            .nodeContainer { display: block; padding-left: 20px; margin-left: -20px; position: relative; }
            .nodeContainer[data-state="collapsed"] { white-space: nowrap; }
            .nodeContainer[data-state="collapsed"] > .nodeInner { display: none; }
            .nodeContainer[data-state="collapsed"] > .ellipsisIndicator:after { content: "…"; font-weight: bold; }
            .nodeContainer[data-state="collapsed"] > .ellipsisIndicator { margin: 0 4px; color: #888; }
            .nodeContainer[data-state="collapsed"] .nodeContainer { display: inline; }
            .expander { width: 20px; height: 18px; display: block; position: absolute; left: -2px; top: 1px; z-index: 5; background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYGBgOADE%2F3Hgw0DM4IRHgSsDFOzFInmMAQnY49ONzZRjDFiADT7dMLALiE8y4AGW6LoBAgwAuIkf%2FB7O9sAAAAASUVORK5CYII%3D"); background-repeat: no-repeat; background-position: center center; display: block; opacity: 0.15; }
            .nodeContainer[data-state="collapsed"] > .expander { -webkit-transform: rotate(-90deg); width: 18px; height: 20px; left: 0px; top: 0px; }
            .expander:hover { opacity: 0.35; }
            .expander:active { opacity: 0.5; }
            .nodeContainer[data-state="collapsed"] .nodeContainer .expander { display: none; }
            .nodeInner { display: block; padding-left: 24px; border-left: 1px dotted #bbb; margin-left: 2px; }
            #formattedDisplay, #jsonpWrapperStart, #jsonpWrapperEnd { color: #333; font: 13px/18px monospace; }
            #formattedDisplay { color: #444; }
            .keyName { font-weight: bold; }
            .stringValue { color: #0B7500; word-wrap: break-word; }
            a:link, a:visited { text-decoration: none; color: inherit; }
            a:hover, a:active { text-decoration: underline; color: #050; }
            .booleanValue, .nullValue, .numberValue { font-weight: bold; color: #1A01CC; }
            .objectKey { color: #000; }
            #processingMessage { font: 13px "Lucida Grande","Segoe UI","Tahoma"; padding: 10px 0 0 8px; margin: 0; color: #333; }
            #processingMessage > svg { margin: 0 7px; position: relative; top: 1px; }
            [hidden] { display: none !important; }
            span { white-space: pre-wrap; }
            @-webkit-keyframes rotateAnimation { from { -webkit-transform: rotate(0deg); } to { -webkit-transform: rotate(360deg); } }
            #loaderSpinner { -webkit-animation: rotateAnimation 2s linear infinite; }
            * { -webkit-font-smoothing: antialiased; }
            .nodeContainer[data-state="collapsed"]:after {
                content: " // " attr(data-item-count);
                color: #aaa;
            }
        `;
    }

    function showProcessingIndicator() {
        mainContentWrapper.innerHTML = `
            <p id="processingMessage">
                <svg id="loaderSpinner" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path>
                </svg>
                Processing...
            </p>
        `;
        let statusElement = document.getElementById('processingMessage');
        if (statusElement) {
            statusElement.hidden = true;
            setTimeout(() => {
                statusElement.hidden = false;
            }, 250);
        }
    }

    let isRawViewActive = false;
    let cachedOriginalContentText = '';

    function renderFormattedContent(formattedHtml) {
        const controlPanelHtml = `
            <div id="controlStrip">
                <button id="parsedTreeBtn" class="viewToggleBtn activeSelected">Parsed</button>
                <button id="rawSourceBtn" class="viewToggleBtn">Raw</button>
            </div>
        `;
        mainContentWrapper.innerHTML = controlPanelHtml + formattedHtml;

        setupViewToggleHandlers();
        setupNodeInteractionHandlers();
        
        if (originalInitialContentElement) {
            cachedOriginalContentText = originalInitialContentElement.innerText;
            const originalTextViewport = document.createElement('pre');
            originalTextViewport.id = 'originalTextDisplay';
            originalTextViewport.hidden = true;
            originalTextViewport.textContent = cachedOriginalContentText;
            mainContentWrapper.appendChild(originalTextViewport);
        }
    }

    function exportParsedDataToWindow(parsedJson) {
        setTimeout(() => {
            const scriptNode = document.createElement("script");
            scriptNode.textContent = 'window.parsedJsonData = ' + parsedJson + ';';
            document.head.appendChild(scriptNode);
        }, 100);
    }

    function setupViewToggleHandlers() {
        const rawBtn = document.getElementById('rawSourceBtn');
        const parsedBtn = document.getElementById('parsedTreeBtn');
        const formattedDisplay = document.getElementById('formattedDisplay');
        const originalTextDisplay = document.getElementById('originalTextDisplay');

        if (rawBtn && parsedBtn && formattedDisplay && originalTextDisplay) {
            rawBtn.addEventListener('click', () => {
                if (!isRawViewActive) {
                    isRawViewActive = true;
                    formattedDisplay.hidden = true;
                    originalTextDisplay.hidden = false;

                    parsedBtn.classList.remove('activeSelected');
                    rawBtn.classList.add('activeSelected');
                }
            });
            
            parsedBtn.addEventListener('click', () => {
                if (isRawViewActive) {
                    isRawViewActive = false;
                    formattedDisplay.hidden = false;
                    originalTextDisplay.hidden = true;

                    parsedBtn.classList.add('activeSelected');
                    rawBtn.classList.remove('activeSelected');
                }
            });
        }

        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 37 && rawBtn) {
                rawBtn.click();
            } else if (e.keyCode === 39 && parsedBtn) {
                parsedBtn.click();
            }
        });
    }

    let lastNodeExpanderId = 0;
    function compactElements(elementsToCompact) {
        elementsToCompact.forEach(el => {
            el.setAttribute('data-state', 'collapsed');

            if (!el.id) {
                el.id = 'nodeExpander' + (++lastNodeExpanderId);
                let innerBlock = el.querySelector('.nodeInner');
                if (innerBlock) {
                    let childCount = innerBlock.children.length;
                    el.setAttribute('data-item-count', childCount + (childCount === 1 ? ' item' : ' items'));
                }
            }
        });
    }

    function unfoldElements(elementsToUnfold) {
        elementsToUnfold.forEach(el => {
            el.removeAttribute('data-state');
        });
    }

    function checkModifierKey(event) {
        return navigator.platform.indexOf('Mac') !== -1 ? event.metaKey : event.ctrlKey;
    }

    function setupNodeInteractionHandlers() {
        document.addEventListener('click', (ev) => {
            if (ev.which === 1) {
                const clickedElement = ev.target;

                if (clickedElement.classList.contains('expander')) {
                    ev.preventDefault();

                    const containingNode = clickedElement.parentNode;
                    const containerParent = containingNode.parentNode;
                    
                    if (containingNode.getAttribute('data-state') === 'collapsed') {
                        if (checkModifierKey(ev)) {
                            unfoldElements(Array.from(containerParent.children).filter(c => c.classList.contains('nodeContainer')));
                        } else {
                            unfoldElements([containingNode]);
                        }
                    } else {
                        if (checkModifierKey(ev)) {
                            compactElements(Array.from(containerParent.children).filter(c => c.classList.contains('nodeContainer')));
                        } else {
                            compactElements([containingNode]);
                        }
                    }
                }
            }
        });
    }

    function initializeModule() {
        documentReadyTimestamp = Date.now();

        let initialBodyFirstChild = document.body.firstElementChild;
        let bodyChildrenCount = document.body.children.length;
        
        let isSinglePreElement = (bodyChildrenCount === 1 && initialBodyFirstChild && initialBodyFirstChild.tagName === 'PRE');
        let isRawTextInBody = (bodyChildrenCount === 0 && document.body.textContent.trim().length > 0) || 
                              (bodyChildrenCount === 1 && initialBodyFirstChild && initialBodyFirstChild.tagName === 'BODY' && initialBodyFirstChild.textContent.trim().length > 0);

        if (!isSinglePreElement && !isRawTextInBody) {
            return;
        }

        let contentToProcess = '';
        let contentByteLength = 0;

        if (isSinglePreElement) {
            originalInitialContentElement = initialBodyFirstChild;
            contentToProcess = originalInitialContentElement.innerText;
            contentByteLength = new TextEncoder().encode(contentToProcess).length;
        } else if (isRawTextInBody) {
            contentToProcess = document.body.textContent;
            contentByteLength = new TextEncoder().encode(contentToProcess).length;
            
            originalInitialContentElement = document.createElement('pre');
            originalInitialContentElement.textContent = contentToProcess;
            document.body.innerHTML = '';
            document.body.appendChild(originalInitialContentElement);
        }

        const MAXIMUM_CONTENT_BYTES = 3 * 1024 * 1024;
        if (contentByteLength > MAXIMUM_CONTENT_BYTES) {
            return;
        }

        if (originalInitialContentElement) {
            originalInitialContentElement.style.display = 'none';
        }

        delayedRevealHandle = setTimeout(() => {
            if (originalInitialContentElement) {
                originalInitialContentElement.style.display = '';
            }
            nonJsonDisplayTimestamp = Date.now();
        }, 1000);

        chrome.runtime.sendMessage({
            action: "ANALYZE_AND_FORMAT",
            payload: {
                textData: contentToProcess,
                size: contentByteLength
            }
        });
    }

    establishCommunicationListener();

    document.addEventListener("DOMContentLoaded", initializeModule, false);

})();