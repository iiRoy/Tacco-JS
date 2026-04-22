"use strict";

class DisplayComposer {
    constructor() {
        this.documentRoot = document;
        this.htmlHead = this.documentRoot.head;
        this.htmlBody = this.documentRoot.body;

        if (window.location.search.includes('display_frame_mode=active') || window.location.protocol === 'data:') {
            return;
        }

        this.frameCapabilities = { dataUriSameOrigin: false };
        this.embeddedStyles = this.gatherAssetContent('style', 'data-frame-asset-type', 'style-sheet');
        this.embeddedScripts = this.gatherAssetContent('script', 'data-frame-asset-type', 'script-code');
        this.frameLoadURL = window.location.href.split('#')[0] + '?display_frame_mode=active';

        this.initializeComposer();
    }

    processCollection(items, callback) {
        Array.from(items).forEach(callback);
    }

    transformCollection(items, mapper) {
        return Array.from(items).map(mapper);
    }

    extractPropertyValues(items, propName) {
        return this.transformCollection(items, item => item[propName]);
    }

    interpretKeyValueString(inputString) {
        const parsedData = {};
        inputString.split(';').forEach(segment => {
            const trimmedSegment = segment.trim();
            if (trimmedSegment) {
                const parts = trimmedSegment.split('=');
                if (parts.length === 2) {
                    parsedData[parts[0]] = parts[1];
                }
            }
        });
        return parsedData;
    }

    stripElementClass(elements, classToRemove) {
        this.processCollection(elements, element => element.classList.remove(classToRemove));
    }

    transmitFrameMessage(targetFrameElement, messageContent) {
        if (targetFrameElement && targetFrameElement.contentWindow) {
            targetFrameElement.contentWindow.postMessage(messageContent, '*');
        }
    }

    gatherAssetContent(tagName, attributeKey, attributeValue) {
        const elements = this.htmlHead.querySelectorAll(`${tagName}[${attributeKey}="${attributeValue}"]`);
        return this.extractPropertyValues(elements, 'innerHTML').join('');
    }

    async initializeComposer() {
        await this.checkDataUriOriginPolicy();

        const codeSourceAreas = this.htmlBody.querySelectorAll('textarea');
        let currentFrameIndex = 0;

        this.processCollection(codeSourceAreas, (sourceArea) => {
            this.buildDisplayFrame(sourceArea, currentFrameIndex++);
            this.prepareInputResizer(sourceArea);
        });

        this.setupControlPanel();
    }

    checkDataUriOriginPolicy() {
        return new Promise(resolve => {
            const policyTestFrame = this.documentRoot.createElement('iframe');
            policyTestFrame.style.display = 'none';
            policyTestFrame.src = 'data:text/html,';
            this.htmlBody.appendChild(policyTestFrame);

            const testCompleted = () => {
                try {
                    if (policyTestFrame.contentDocument) {
                        this.frameCapabilities.dataUriSameOrigin = true;
                    }
                } catch (e) {
                    this.frameCapabilities.dataUriSameOrigin = false;
                } finally {
                    policyTestFrame.removeEventListener('load', testCompleted);
                    policyTestFrame.remove();
                    resolve();
                }
            };
            policyTestFrame.addEventListener('load', testCompleted);
        });
    }

    buildDisplayFrame(sourceArea, frameIndex) {
        const displayWrapper = this.documentRoot.createElement('div');
        displayWrapper.className = 'presentation-area';
        sourceArea.parentNode.insertBefore(displayWrapper, sourceArea);

        const viewportWrapper = this.documentRoot.createElement('div');
        viewportWrapper.className = 'adjustable-viewport';
        displayWrapper.appendChild(viewportWrapper);

        const contentFrame = this.documentRoot.createElement('iframe');
        contentFrame.setAttribute('scrolling', 'no');
        contentFrame.name = `previewContentFrame_${frameIndex}`;
        viewportWrapper.appendChild(contentFrame);

        const frameLoadingHandler = () => {
            const targetDoc = contentFrame.contentDocument;

            if (!this.frameCapabilities.dataUriSameOrigin && contentFrame.src !== this.frameLoadURL) {
                return;
            } else if (contentFrame.src === this.frameLoadURL) {
                const tempHtml = targetDoc.createElement('html');
                tempHtml.appendChild(targetDoc.createElement('head'));
                const tempBody = targetDoc.createElement('body');
                tempBody.innerHTML = sourceArea.value;
                tempHtml.appendChild(tempBody);
                targetDoc.replaceChild(tempHtml, targetDoc.documentElement);
            }

            const newFrameHead = targetDoc.createElement('head');
            const newStyleElement = targetDoc.createElement('style');
            newStyleElement.textContent = this.embeddedStyles;
            newFrameHead.appendChild(newStyleElement);

            const newScriptElement = targetDoc.createElement('script');
            newScriptElement.textContent = this.embeddedScripts;
            newFrameHead.appendChild(newScriptElement);

            const existingHead = targetDoc.getElementsByTagName('head')[0];
            if (existingHead) {
                existingHead.parentNode.replaceChild(newFrameHead, existingHead);
            } else {
                targetDoc.documentElement.insertBefore(newFrameHead, targetDoc.documentElement.firstChild);
            }

            this.transmitFrameMessage(contentFrame, 'requestFrameDimensions');
        };

        contentFrame.addEventListener('load', frameLoadingHandler);

        let frameSource;
        if (!this.frameCapabilities.dataUriSameOrigin) {
            frameSource = this.frameLoadURL;
        } else {
            frameSource = 'data:text/html;charset=utf-8,' +
                encodeURIComponent(`<!doctype html><html><head></head><body>${sourceArea.value}</body></html>`);
        }
        contentFrame.setAttribute('src', frameSource);

        const onSourceAreaChange = () => {
            if (contentFrame.contentDocument && contentFrame.contentDocument.body) {
                contentFrame.contentDocument.body.innerHTML = sourceArea.value;
                this.transmitFrameMessage(contentFrame, 'requestFrameDimensions');
            }
        };

        sourceArea.addEventListener('input', onSourceAreaChange);
    }

    prepareInputResizer(sourceArea) {
        const sizingMirror = this.documentRoot.createElement('div');
        sizingMirror.className = 'input-height-calculator';
        sizingMirror.style.cssText = `
            position: absolute;
            top: 0;
            left: -9999px;
            visibility: hidden;
            white-space: pre-wrap;
            word-wrap: break-word;
            box-sizing: border-box;
        `;

        const areaComputedStyle = window.getComputedStyle(sourceArea);
        ['width', 'padding', 'border', 'font', 'lineHeight', 'letterSpacing', 'textIndent', 'textTransform', 'textDecoration', 'textAlign'].forEach(prop => {
            sizingMirror.style[prop] = areaComputedStyle[prop];
        });
        this.htmlBody.appendChild(sizingMirror);

        const maximumAllowedHeight = parseInt(areaComputedStyle.getPropertyValue('max-height'), 10) || Infinity;

        const updateSourceAreaHeight = () => {
            sizingMirror.textContent = sourceArea.value + '\n';
            const calculatedPixelHeight = sizingMirror.offsetHeight;

            if (calculatedPixelHeight >= maximumAllowedHeight) {
                sourceArea.style.overflow = 'auto';
                sourceArea.style.height = maximumAllowedHeight + 'px';
            } else {
                sourceArea.style.overflow = 'hidden';
                sourceArea.style.height = calculatedPixelHeight + 'px';
            }
        };

        sourceArea.addEventListener('input', updateSourceAreaHeight);
        updateSourceAreaHeight();
    }

    setupControlPanel() {
        const panelElement = this.htmlBody.querySelector('[data-display-controls]');
        const allViewportWrappers = this.htmlBody.querySelectorAll('.adjustable-viewport');
        const viewportMarginCompensation = 30;

        const adjustDisplayWidths = (desiredWidth) => {
            localStorage.setItem('display-width-setting', desiredWidth);

            this.processCollection(allViewportWrappers, (wrapper) => {
                let actualWidth = desiredWidth;
                if (desiredWidth === 'auto') {
                    actualWidth = wrapper.parentNode.offsetWidth;
                }
                wrapper.style.width = actualWidth + 'px';
                this.transmitFrameMessage(wrapper.querySelector('iframe'), 'requestFrameDimensions');
            });
        };

        const storedWidthSetting = localStorage.getItem('display-width-setting');
        if (storedWidthSetting) {
            adjustDisplayWidths(storedWidthSetting);
            if (panelElement) {
                this.stripElementClass(panelElement.querySelectorAll('.active-option'), 'active-option');
                const matchedButton = panelElement.querySelector(`button[data-frame-size="${storedWidthSetting}"]`);
                if (matchedButton) {
                    matchedButton.classList.add('active-option');
                }
            }
        }

        window.addEventListener('message', (event) => {
            const messageData = event.data;
            if (!messageData || !event.source) {
                return;
            }

            if (messageData.height != null) {
                const sourceFrameRef = this.documentRoot.querySelector(`iframe[name="${event.source.name}"]`);
                if (sourceFrameRef) {
                    sourceFrameRef.parentNode.style.height = (messageData.height + viewportMarginCompensation) + 'px';
                }
            }
        }, false);

        if (panelElement && allViewportWrappers.length > 0) {
            panelElement.hidden = false;
            panelElement.addEventListener('click', (event) => {
                let clickedControl = event.target;
                if (clickedControl.tagName.toLowerCase() !== 'button') {
                    clickedControl = clickedControl.closest('button');
                }
                if (!clickedControl) {
                    return;
                }

                event.preventDefault();
                this.stripElementClass(panelElement.querySelectorAll('.active-option'), 'active-option');
                clickedControl.classList.add('active-option');
                const sizeValue = clickedControl.dataset.frameSize;
                adjustDisplayWidths(sizeValue);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DisplayComposer();
});