/*******************************************************************************

scrollstream.jquery.js (v1.0.2)
https://github.com/photoshelter/scrollstream

Copyright 2012 PhotoShelter, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*******************************************************************************/

class DynamicPanel {
    constructor(outerContainer, configSettings) {
        const defaultParameters = {
            designation: 'dynamic-panel',
            scrollContext: null,
            loggingEnabled: false,
            signalNames: {
                request: 'request.dynamicpanel',
                response: 'response.dynamicpanel',
                processStart: 'processstart.dynamicpanel',
                processStop: 'processstop.dynamicpanel'
            },
            delayTimers: {
                activityDebounce: 500,
                feedbackInterval: 200,
                queueCheckInterval: 100
            },
            placeholderContent: null,
            styleClasses: {
                orderedList: null,
                listItem: null
            }
        };

        this._preferences = Object.assign({}, defaultParameters, configSettings);

        this._domRefs = {};
        this._computedProps = {};
        this._timingHandles = {};
        this._pendingRequests = [];
        this._pendingResponses = [];

        this._domRefs.outerWrapper = outerContainer;

        this._constructInitialLayout();
        this._mapDomElements();

        if (this._domRefs.scrollingArea && this._domRefs.scrollingArea !== window) {
            this._domRefs.scrollingArea.style.overflowY = 'scroll';
        }
    }

    _preferences = null;
    _domRefs = null;
    _computedProps = null;
    _timingHandles = null;
    _pendingRequests = null;
    _pendingResponses = null;

    _precedingRowCounter = null;
    _scrollStateChanged = null;
    _dimensionChanged = null;
    _scrollEventHandler = null;
    _responseEventHandler = null;

    _constructInitialLayout() {
        const preId = this._preferences.designation + '-leading';
        const blockId = this._preferences.designation + '-content-block';

        const leadingDiv = document.createElement('div');
        leadingDiv.id = preId;
        this._domRefs.outerWrapper.appendChild(leadingDiv);

        const contentList = document.createElement('ol');
        contentList.id = blockId;
        if (this._preferences.styleClasses.orderedList) {
            contentList.classList.add(this._preferences.styleClasses.orderedList);
        }
        this._domRefs.outerWrapper.appendChild(contentList);
    }

    _mapDomElements() {
        if (typeof this._preferences.scrollContext === 'function') {
            this._domRefs.scrollingArea = this._preferences.scrollContext();
        } else if (this._preferences.scrollContext instanceof HTMLElement) {
            this._domRefs.scrollingArea = this._preferences.scrollContext;
        } else {
            this._domRefs.scrollingArea = window;
        }

        this._domRefs.preDisplay = this._domRefs.outerWrapper.querySelector('#' + this._preferences.designation + '-leading');
        this._domRefs.itemDisplay = this._domRefs.outerWrapper.querySelector('#' + this._preferences.designation + '-content-block');
    }

    activateComponent(itemDetails) {
        this._preferences.buffer = itemDetails.buffer;
        this._preferences.item = itemDetails.item;

        if (typeof this._preferences.buffer !== 'number' ||
            typeof this._preferences.item.count !== 'number' ||
            typeof this._preferences.item.height !== 'number' ||
            typeof this._preferences.item.width !== 'number') {
            throw new TypeError("Malformulated item details for DynamicPanel activation.");
        }

        if (this._preferences.item.count < 1) {
            this._domRefs.itemDisplay.innerHTML = '';
            return;
        }

        if (this._preferences.buffer < 2) this._preferences.buffer = 2;

        this._computedProps = this._deriveLayoutMetrics();
        this._domRefs.outerWrapper.style.height = (this._computedProps.totalContentRows * this._preferences.item.height) + 'px';
        this._domRefs.itemDisplay.style.height = (this._computedProps.visibleBlockRows * this._preferences.item.height) + 'px';

        if (this._preferences.loggingEnabled) {
            console.log("[DynamicPanel: activateComponent]");
            console.log("itemsInRow:     " + this._computedProps.itemsInRow);
            console.log("totalContentRows: " + this._computedProps.totalContentRows);
            console.log("visibleBlockRows: " + this._computedProps.visibleBlockRows);
            console.log("itemsInBlock:   " + this._computedProps.itemsInBlock);
            console.log("----------------------------------------");
        }

        this._initiateContentFlow();
        this._registerContentArrivalHandler();

        this._domRefs.scrollingArea.scrollTop = 0;
        this._domRefs.preDisplay.style.height = '0px';
        this._precedingRowCounter = 0;
        this._manageScrollUpdate('initial', 0, this._computedProps.itemsInBlock, null, false);

        this._scrollStateChanged = false;
        this._dimensionChanged = false;

        this._scrollEventHandler = () => { this._scrollStateChanged = true; };
        this._domRefs.scrollingArea.addEventListener('scroll', this._scrollEventHandler);
        this._timingHandles.monitor = window.setInterval(this._assessViewChanges.bind(this), this._preferences.delayTimers.feedbackInterval);
    }

    _deriveLayoutMetrics() {
        const itemDimensions = this._preferences.item;

        let itemsInRow = Math.floor(this._domRefs.itemDisplay.offsetWidth / itemDimensions.width);
        if (itemsInRow < 1) itemsInRow = 1;

        const totalContentRows = Math.ceil(itemDimensions.count / itemsInRow);

        let visibleWindowRows;
        if (this._domRefs.scrollingArea === window) {
            visibleWindowRows = Math.ceil(window.innerHeight / itemDimensions.height);
        } else {
            visibleWindowRows = Math.ceil(this._domRefs.scrollingArea.offsetHeight / itemDimensions.height);
        }
        
        let visibleBlockRows;
        if (visibleWindowRows < 1) visibleBlockRows = 1 + (2 * this._preferences.buffer);
        else visibleBlockRows = visibleWindowRows + (2 * this._preferences.buffer);
        if (visibleBlockRows > totalContentRows) visibleBlockRows = totalContentRows;

        let itemsInBlock = visibleBlockRows * itemsInRow;
        if (itemDimensions.count < itemsInBlock) itemsInBlock = itemDimensions.count;

        return {
            itemsInRow: itemsInRow,
            totalContentRows: totalContentRows,
            visibleBlockRows: visibleBlockRows,
            itemsInBlock: itemsInBlock
        };
    }

    _initiateContentFlow() {
        this._timingHandles.processing = window.setInterval(() => {
            while (this._pendingRequests.length > 0 && this._pendingResponses.length > 0) {
                const currentRequest = this._pendingRequests[0];
                let matchFound = false;

                for (let i = 0, len = this._pendingResponses.length; i < len; i++) {
                    const responseData = this._pendingResponses[i];

                    if (currentRequest.start === responseData.start &&
                        currentRequest.size === responseData.liHtml.length) {
                            this._pendingRequests.shift();
                            this._pendingResponses.splice(i, 1);
                            this._integrateReceivedContent(currentRequest, responseData);

                            matchFound = true;
                            break;
                    }
                }

                if (!matchFound) break;
            }
        }, this._preferences.delayTimers.queueCheckInterval);
    }

    _registerContentArrivalHandler() {
        this._responseEventHandler = (evt) => {
            const responseData = evt.detail;
            if (typeof responseData.start !== 'number' ||
                !responseData.liHtml || !(responseData.liHtml instanceof Array) ||
                (responseData.liData && typeof responseData.liData !== 'object')) {
                throw new TypeError("Malformulated DynamicPanel response type.");
            }
            this._pendingResponses.push(responseData);
        };
        this._domRefs.outerWrapper.addEventListener(this._preferences.signalNames.response, this._responseEventHandler);
    }

    _assessViewChanges() {
        if (!this._dimensionChanged && !this._scrollStateChanged) return;

        const currentScrollPosition = this._domRefs.scrollingArea.scrollTop;
        const currentPrecedingRows = this._computeLeadingRows(Math.floor(currentScrollPosition / this._preferences.item.height));

        if (!this._dimensionChanged && currentPrecedingRows === this._precedingRowCounter) {
            this._scrollStateChanged = false;
            return;
        }

        this._domRefs.preDisplay.style.height = (currentPrecedingRows * this._preferences.item.height) + 'px';

        let actionKind, startIndex, itemQuantity, itemsToRemove;

        const rowDifference = currentPrecedingRows - this._precedingRowCounter;
        if (!this._dimensionChanged && Math.abs(rowDifference) < this._computedProps.visibleBlockRows) {
            const hasPartialLastRow = (this._preferences.item.count % this._computedProps.itemsInRow) !== 0;

            if (rowDifference < 0) {
                actionKind = 'prepend';

                startIndex = currentPrecedingRows * this._computedProps.itemsInRow;
                itemQuantity = -rowDifference * this._computedProps.itemsInRow;

                if ((this._precedingRowCounter === this._computedProps.totalContentRows -
                    this._computedProps.visibleBlockRows) && hasPartialLastRow) {
                        itemsToRemove = itemQuantity - this._computedProps.itemsInRow +
                            (this._preferences.item.count % this._computedProps.itemsInRow);
                } else {
                    itemsToRemove = itemQuantity;
                }
            } else {
                actionKind = 'append';

                startIndex = this._computedProps.itemsInRow *
                    (this._precedingRowCounter + this._computedProps.visibleBlockRows);
                itemsToRemove = rowDifference * this._computedProps.itemsInRow;

                if ((currentPrecedingRows === this._computedProps.totalContentRows -
                    this._computedProps.visibleBlockRows) && hasPartialLastRow) {
                        itemQuantity = itemsToRemove - this._computedProps.itemsInRow +
                            (this._preferences.item.count % this._computedProps.itemsInRow);
                } else {
                    itemQuantity = itemsToRemove;
                }
            }
        } else {
            actionKind = 'replace';

            startIndex = currentPrecedingRows * this._computedProps.itemsInRow;
            itemsToRemove = null;

            if (startIndex + this._computedProps.itemsInBlock <= this._preferences.item.count) {
                itemQuantity = this._computedProps.itemsInBlock;
            } else {
                itemQuantity = this._computedProps.itemsInBlock - this._computedProps.itemsInRow +
                    (this._preferences.item.count % this._computedProps.itemsInRow);
            }
        }

        this._manageScrollUpdate(actionKind, startIndex, itemQuantity, itemsToRemove, true);

        this._precedingRowCounter = currentPrecedingRows;
        this._scrollStateChanged = false;
        this._dimensionChanged = false;
    }

    _computeLeadingRows(scrollRowPosition) {
        if (this._preferences.item.count <= this._computedProps.itemsInBlock) return 0;

        if (scrollRowPosition < this._preferences.buffer) return 0;
        else if (scrollRowPosition <
            this._computedProps.totalContentRows - this._computedProps.visibleBlockRows + this._preferences.buffer) {
            return scrollRowPosition - this._preferences.buffer;
        } else {
            return this._computedProps.totalContentRows - this._computedProps.visibleBlockRows;
        }
    }

    _debounceActivityTimer = null;

    _manageScrollUpdate(actionKind, startIndex, itemQuantity, itemsToRemove, useDebounce) {
        this._adjustVisibleContent({
            type: actionKind,
            start: startIndex,
            size: itemQuantity,
            remove: itemsToRemove
        });

        if (!useDebounce) {
            this._requestMissingContent();
            return;
        }

        if (this._debounceActivityTimer) window.clearTimeout(this._debounceActivityTimer);
        this._debounceActivityTimer = window.setTimeout(this._requestMissingContent.bind(this), this._preferences.delayTimers.activityDebounce);
    }

    _requestMissingContent() {
        let firstItemOffset;
        const placeholderIndicators = [];

        const visibleItems = Array.from(this._domRefs.itemDisplay.children);
        if (visibleItems.length === 0) return;

        visibleItems.forEach((itemElement, index) => {
            if (index === 0) {
                firstItemOffset = parseInt(itemElement.id.split(this._preferences.designation + '-item-')[1], 10);
            }
            placeholderIndicators.push(itemElement.firstElementChild.classList.contains(this._preferences.designation + '-loading-marker'));
        });

        const contentGaps = this._identifyPlaceholderSegments(placeholderIndicators);
        for (let i = 0, len = contentGaps.length; i < len; i++) {
            if (contentGaps[i].state !== true) continue;

            const requestData = {
                start: firstItemOffset + contentGaps[i].begin,
                size: contentGaps[i].length
            };

            this._pendingRequests.push(requestData);
            this._domRefs.outerWrapper.dispatchEvent(new CustomEvent(this._preferences.signalNames.request, { detail: requestData }));
        }
    }

    _identifyPlaceholderSegments(inputArray) {
        if (inputArray.length === 0) return [];

        return inputArray.reduce((segments, currentValue, currentIndex) => {
            if (currentIndex === 0) {
                segments.push({ begin: 0, length: 1, state: currentValue });
            } else if (currentValue === segments[segments.length - 1].state) {
                segments[segments.length - 1].length++;
            } else {
                segments.push({ begin: currentIndex, length: 1, state: currentValue });
            }
            return segments;
        }, []);
    }

    _adjustVisibleContent(itemRequest) {
        const startSignal = this._preferences.signalNames.processStart;
        if (startSignal) this._domRefs.outerWrapper.dispatchEvent(new CustomEvent(startSignal));

        const loadingMarkerClass = this._preferences.designation + '-loading-marker';
        const loadingContentHtml = (typeof this._preferences.placeholderContent === 'function') ?
            this._preferences.placeholderContent() : '';

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < itemRequest.size; i++) {
            const listItemId = this._preferences.designation + '-item-' + (itemRequest.start + i);

            const newListItem = document.createElement('li');
            newListItem.id = listItemId;
            if (this._preferences.styleClasses.listItem) {
                newListItem.classList.add(this._preferences.styleClasses.listItem);
            }

            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add(loadingMarkerClass);
            newListItem.appendChild(loadingDiv);
            newListItem.innerHTML += loadingContentHtml;

            fragment.appendChild(newListItem);
        }

        if (this._preferences.loggingEnabled) {
            console.log("[DynamicPanel: _adjustVisibleContent]");
            console.log("type:          " + itemRequest.type);
            console.log("start+size:    " + itemRequest.start + "+" + itemRequest.size);
            console.log("remove:        " + itemRequest.remove);
            console.log("----------------------------------------");
        }

        switch (itemRequest.type) {
            case 'append':
                this._domRefs.itemDisplay.append(fragment);
                Array.from(this._domRefs.itemDisplay.children)
                    .slice(0, itemRequest.remove)
                    .forEach(child => child.remove());
                break;
            case 'prepend':
                this._domRefs.itemDisplay.prepend(fragment);
                Array.from(this._domRefs.itemDisplay.children)
                    .slice(-itemRequest.remove)
                    .forEach(child => child.remove());
                break;
            case 'replace':
                this._domRefs.itemDisplay.innerHTML = '';
                this._domRefs.itemDisplay.append(fragment);
                break;
        }
    }

    _integrateReceivedContent(processedRequest, incomingData) {
        const startIndex = processedRequest.start;
        const endIndex = processedRequest.start + processedRequest.size;

        const targetItems = Array.from(this._domRefs.itemDisplay.children).filter(itemElement => {
            const itemIdNum = parseInt(itemElement.id.split('-').pop(), 10);
            return itemIdNum >= startIndex && itemIdNum < endIndex;
        });

        targetItems.forEach((itemElement, index) => {
            itemElement.innerHTML = incomingData.liHtml[index];

            if (incomingData.liData && typeof incomingData.liData[index] === 'object') {
                Object.entries(incomingData.liData[index]).forEach(([key, value]) => {
                    itemElement.dataset[key] = value;
                });
            }

            if (incomingData.liClass && typeof incomingData.liClass[index] === 'string') {
                itemElement.classList.add(incomingData.liClass[index]);
            }
        });

        const stopSignal = this._preferences.signalNames.processStop;
        if (stopSignal) this._domRefs.outerWrapper.dispatchEvent(new CustomEvent(stopSignal));
    }

    getTotalContentHeight() {
        return this._computedProps.totalContentRows * this._preferences.item.height;
    }

    getPanelItemCountPerRow() {
        return this._computedProps.itemsInRow;
    }

    refreshLayout() {
        if (!this._preferences.item) return;

        const newMetrics = this._deriveLayoutMetrics();

        if (newMetrics.itemsInRow === this._computedProps.itemsInRow &&
            newMetrics.visibleBlockRows === this._computedProps.visibleBlockRows) return;

        this._pendingRequests = [];
        this._pendingResponses = [];

        this._computedProps = newMetrics;
        this._dimensionChanged = true;
    }
}