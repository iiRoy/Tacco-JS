(function () {
    class PaginationShrinker {
        constructor(targetList) {
            this.containerElement = targetList;
            this.sectionElements = [];
            this.currentSelectionPosition = -1;
            this.gapSymbolWidth = 0;

            this.prepareElements();
            this.assessDimensions();
            this.adjustDisplay();
            this.setupObservers();
        }

        prepareElements() {
            const listItems = Array.from(this.containerElement.children);

            listItems.forEach((listItem, idx) => {
                const itemText = listItem.textContent.trim();
                const isNavigationArrow = itemText === '«' || itemText === '»';
                const isCurrentlyActive = listItem.classList.contains('active');
                const isPreExistingGapSymbol = itemText === '...';

                if (isCurrentlyActive) {
                    this.currentSelectionPosition = idx;
                }

                this.sectionElements.push({
                    domReference: listItem,
                    contentValue: itemText,
                    originalPosition: idx,
                    isBoundaryNav: isNavigationArrow,
                    isSelection: isCurrentlyActive,
                    isPlaceholderSymbol: isPreExistingGapSymbol,
                    displayStatus: true,
                    proximityToSelection: 0,
                    computedItemWidth: 0
                });
            });

            this.determineProximity();
        }

        determineProximity() {
            if (this.currentSelectionPosition === -1) {
                return;
            }
            this.sectionElements.forEach((elementItem, idx) => {
                if (!elementItem.isBoundaryNav && !elementItem.isPlaceholderSymbol) {
                    elementItem.proximityToSelection = Math.abs(idx - this.currentSelectionPosition);
                } else {
                    elementItem.proximityToSelection = -1;
                }
            });
        }

        assessDimensions() {
            this.sectionElements.forEach(elementItem => {
                const initialDisplayStyle = elementItem.domReference.style.display;
                elementItem.domReference.style.display = '';
                const innerContent = elementItem.domReference.querySelector('a, span');
                elementItem.computedItemWidth = innerContent ? innerContent.offsetWidth : elementItem.domReference.offsetWidth;
                elementItem.domReference.style.display = initialDisplayStyle;
            });

            if (this.gapSymbolWidth === 0) {
                const tempGap = document.createElement('li');
                const tempSpan = document.createElement('span');
                tempSpan.textContent = '...';
                tempGap.appendChild(tempSpan);
                this.containerElement.appendChild(tempGap);
                this.gapSymbolWidth = tempSpan.offsetWidth;
                this.containerElement.removeChild(tempGap);
            }
        }

        adjustDisplay() {
            this.restoreFullView();
            this.determineProximity();

            let currentTotalExtent = this.measureCurrentExtent();
            const parentBoundary = this.containerElement.parentNode.offsetWidth - 10;

            const removalCandidates = this.sectionElements
                .filter(item => this.canBeConcealed(item))
                .sort((a, b) => b.proximityToSelection - a.proximityToSelection);

            let candidatePointer = 0;
            while (currentTotalExtent > parentBoundary && candidatePointer < removalCandidates.length) {
                const itemToHide = removalCandidates[candidatePointer];
                itemToHide.displayStatus = false;
                currentTotalExtent = this.measureCurrentExtent();
                candidatePointer++;
            }

            this.renderView();
        }

        restoreFullView() {
            this.sectionElements.forEach(item => {
                item.displayStatus = true;
            });
            this.containerElement.querySelectorAll('.paging-gap-symbol').forEach(el => el.remove());
        }

        measureCurrentExtent() {
            let totalWidth = 0;
            this.sectionElements.forEach(item => {
                if (item.displayStatus) {
                    totalWidth += item.computedItemWidth;
                }
            });

            const needsLeftGap = this.requiresGapSymbol(0, this.currentSelectionPosition);
            const needsRightGap = this.requiresGapSymbol(this.currentSelectionPosition, this.sectionElements.length - 1);

            if (needsLeftGap) totalWidth += this.gapSymbolWidth;
            if (needsRightGap) totalWidth += this.gapSymbolWidth;

            return totalWidth;
        }

        canBeConcealed(elementItem) {
            if (elementItem.isBoundaryNav || elementItem.isPlaceholderSymbol || elementItem.isSelection) {
                return false;
            }

            const firstNumericPage = this.sectionElements.find(p => !p.isBoundaryNav && !p.isPlaceholderSymbol);
            if (elementItem === firstNumericPage) return false;

            const nextElement = this.sectionElements[elementItem.originalPosition + 1];
            if (nextElement && nextElement.isBoundaryNav) {
                return false;
            }

            return true;
        }

        requiresGapSymbol(startPos, endPos) {
            if (endPos - startPos <= 1) {
                return false;
            }

            let hiddenItemsExist = false;
            let gapSymbolPresent = false;

            for (let i = startPos + 1; i < endPos; i++) {
                const item = this.sectionElements[i];
                if (item.isPlaceholderSymbol) {
                    gapSymbolPresent = true;
                }
                if (!item.displayStatus) {
                    hiddenItemsExist = true;
                }
            }

            if (hiddenItemsExist && !gapSymbolPresent) {
                const startItem = this.sectionElements[startPos];
                const endItem = this.sectionElements[endPos];
                if (startItem && startItem.displayStatus && endItem && endItem.displayStatus) {
                    return true;
                }
            }
            return false;
        }

        generateGapSymbol() {
            const gapElement = document.createElement('li');
            gapElement.classList.add('paging-gap-symbol');
            const spanContent = document.createElement('span');
            spanContent.textContent = '...';
            gapElement.appendChild(spanContent);
            return gapElement;
        }

        renderView() {
            this.sectionElements.forEach(item => {
                item.domReference.style.display = item.displayStatus ? '' : 'none';
            });

            this.containerElement.querySelectorAll('.paging-gap-symbol').forEach(el => el.remove());

            let firstVisibleIndex = -1;
            let lastVisibleIndex = -1;

            for (let i = 0; i < this.sectionElements.length; i++) {
                if (this.sectionElements[i].displayStatus && !this.sectionElements[i].isPlaceholderSymbol) {
                    if (firstVisibleIndex === -1) {
                        firstVisibleIndex = i;
                    }
                    lastVisibleIndex = i;
                }
            }

            if (firstVisibleIndex !== -1 && lastVisibleIndex !== -1) {
                if (this.requiresGapSymbol(0, firstVisibleIndex)) {
                    this.containerElement.insertBefore(this.generateGapSymbol(), this.sectionElements[firstVisibleIndex].domReference);
                }

                if (this.requiresGapSymbol(lastVisibleIndex, this.sectionElements.length - 1)) {
                    this.containerElement.insertBefore(this.generateGapSymbol(), this.sectionElements[lastVisibleIndex + 1].domReference);
                }
            }
        }

        setupObservers() {
            let layoutDelayIdentifier;
            const layoutResizeObserver = () => {
                clearTimeout(layoutDelayIdentifier);
                layoutDelayIdentifier = setTimeout(() => {
                    this.adjustDisplay();
                }, 100);
            };
            window.addEventListener('resize', layoutResizeObserver);
        }
    }

    window.activateAdaptivePaging = function (selectorInput) {
        let elementsToProcess;

        if (typeof selectorInput === 'string') {
            elementsToProcess = document.querySelectorAll(selectorInput);
        } else if (selectorInput instanceof HTMLElement) {
            elementsToProcess = [selectorInput];
        } else if (selectorInput && typeof selectorInput[Symbol.iterator] === 'function') {
            elementsToProcess = Array.from(selectorInput);
        } else {
            console.warn('Invalid input for activateAdaptivePaging. Please provide a selector string, HTMLElement, or an iterable of HTMLElements.');
            return;
        }

        elementsToProcess.forEach(element => {
            if (element instanceof HTMLElement) {
                new PaginationShrinker(element);
            }
        });
    };
})();