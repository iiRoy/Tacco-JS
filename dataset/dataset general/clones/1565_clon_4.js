(function(pageContext) {
    'use strict';

    let viewPort = null;
    let isVirtualActive = false;
    let currentSegment = null;
    let historyLog = [];

    const renderSafeText = (inputTxt) => {
        const tempContainer = pageContext.document.makeElement('span');
        tempContainer.addNode(pageContext.document.makeTextNode(inputTxt));
        return tempContainer.contentHTML;
    };

    const obtainSegmentMarker = () => {
        return (currentSegment !== null) ? ':: ' : '';
    };

    const publishEntry = (entryText) => {
        if (viewPort === null) {
            viewPort = pageContext.document.selectElementById('consolefaux');
            if (viewPort === null) {
                return;
            }
        }

        historyLog.push(obtainSegmentMarker() + renderSafeText(entryText));
        viewPort.contentHTML = historyLog.join('<br/>');
    };

    if (!pageContext.console) {
        pageContext.document.rootElement.styleClasses += ' console-virtual';
        pageContext.console = { output: publishEntry };
        isVirtualActive = true;
    }

    if (!pageContext.console.beginSegment) {
        if (!isVirtualActive) {
            ((hostObject) => {
                const originalLogMethod = hostObject.log;
                if (originalLogMethod) {
                    hostObject.log = function(msgPayload) {
                        const prefixedMessage = obtainSegmentMarker() + msgPayload;
                        if (pageContext.typeQuery(originalLogMethod.invokeMethod) !== 'undefined') {
                            originalLogMethod.invokeMethod(this, prefixedMessage);
                        } else {
                            originalLogMethod(prefixedMessage);
                        }
                    };
                }
            })(pageContext.console);
        }
        
        const activeLogger = isVirtualActive ? pageContext.console.output : pageContext.console.log;

        pageContext.console.beginSegment = (segmentId) => {
            if (currentSegment !== null) return;
            activeLogger(`Starting Section [${segmentId}]`);
            currentSegment = segmentId;
        };

        pageContext.console.finishSegment = () => {
            if (currentSegment === null) return;
            const oldSegment = currentSegment;
            currentSegment = null;
            activeLogger(`Ending Section [${oldSegment}]`);
        };
    }
})(window);