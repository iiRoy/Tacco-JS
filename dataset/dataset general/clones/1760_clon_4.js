function createDelayExecutor(actionRoutine, waitDuration) {
    let timerTag;
    return function(...processArguments) {
        const executionContext = this;
        clearTimeout(timerTag);
        timerTag = setTimeout(() => actionRoutine.apply(executionContext, processArguments), waitDuration);
    };
}

class GridLayoutManager {
    constructor(targetGridElement, initialSettings) {
        this.activeGrid = targetGridElement;
        this.layoutSettings = this.blendSettings(initialSettings);

        this.topPanelElement = null;
        this.bottomPanelElement = null;
        this.scrollableRegion = null;
        this.topPanelWrapper = null;
        this.bottomPanelWrapper = null;

        this.initialBottomMargin = '';
        this.originalStyleClasses = '';
        this.rowUnitHeight = 0;
        this.scrollChannelWidth = 15; // Consistent with original's magic number

        this.buildComponentTree();
        this.harmonizeComponentDimensions();

        const resizeProcessor = this.recalibrateLayout.bind(this);
        const debouncedResizeProcessor = createDelayExecutor(resizeProcessor, 150);
        window.addEventListener('resize', debouncedResizeProcessor);
    }

    blendSettings(userConfig) {
        const baseConfiguration = {
            visibleRowsCount: 10
        };
        return { ...baseConfiguration, ...userConfig };
    }

    buildComponentTree() {
        this.originalStyleClasses = this.activeGrid.className;
        this.initialBottomMargin = getComputedStyle(this.activeGrid).marginBottom;
        this.activeGrid.style.marginBottom = '0';

        const firstBodyRow = this.activeGrid.querySelector('tbody tr:first-child');
        this.rowUnitHeight = firstBodyRow ? firstBodyRow.offsetHeight : 0;
        const regionHeight = this.rowUnitHeight * this.layoutSettings.visibleRowsCount;

        this.topPanelElement = document.createElement('table');
        this.topPanelElement.className = `grid-fixed-top ${this.originalStyleClasses}`;
        this.topPanelElement.style.cssText = 'table-layout:fixed;width:auto;margin-bottom:0;';
        this.topPanelElement.innerHTML = '<thead><tr><td></td></tr></thead>'; // Placeholder

        this.bottomPanelElement = document.createElement('table');
        this.bottomPanelElement.className = `grid-fixed-bottom ${this.originalStyleClasses}`;
        this.bottomPanelElement.style.cssText = `table-layout:fixed;width:auto;margin-bottom:${this.initialBottomMargin};`;
        this.bottomPanelElement.innerHTML = '<tfoot><tr><td></td></tr></tfoot>'; // Placeholder

        this.scrollableRegion = document.createElement('div');
        this.scrollableRegion.className = 'grid-scroll-area';
        this.scrollableRegion.style.cssText = `height:${regionHeight}px;overflow-y:auto;`;

        this.activeGrid.parentNode.insertBefore(this.topPanelElement, this.activeGrid);
        this.activeGrid.parentNode.insertBefore(this.scrollableRegion, this.activeGrid);
        this.activeGrid.parentNode.insertBefore(this.bottomPanelElement, this.activeGrid.nextSibling);

        this.scrollableRegion.appendChild(this.activeGrid);

        this.scrollableRegion.addEventListener('scroll', this.synchronizeHorizontalScroll.bind(this));
    }

    harmonizeComponentDimensions() {
        const currentGrid = this.activeGrid;
        const currentTopPanel = this.topPanelElement;
        const currentBottomPanel = this.bottomPanelElement;
        const currentScrollRegion = this.scrollableRegion;

        const originalHeadSection = currentGrid.querySelector('thead');
        const originalFootSection = currentGrid.querySelector('tfoot');
        const originalCaptionElement = currentGrid.querySelector('caption');

        if (originalHeadSection) originalHeadSection.style.display = '';
        if (originalFootSection) originalFootSection.style.display = '';
        if (originalCaptionElement) originalCaptionElement.style.display = '';

        const hasHorizontalMovement = currentScrollRegion.clientWidth < currentScrollRegion.scrollWidth;
        const fullGridWidth = currentGrid.offsetWidth;

        if (hasHorizontalMovement) {
            currentTopPanel.style.width = `${fullGridWidth}px`;
            currentBottomPanel.style.width = `${fullGridWidth}px`;

            const effectiveRegionWidth = currentScrollRegion.clientWidth;
            const contentDisplayWidth = effectiveRegionWidth - this.scrollChannelWidth;

            if (!this.topPanelWrapper) {
                this.topPanelWrapper = document.createElement('div');
                this.topPanelWrapper.className = 'grid-top-panel-viewport';
                this.topPanelElement.parentNode.insertBefore(this.topPanelWrapper, this.topPanelElement);
                this.topPanelWrapper.appendChild(this.topPanelElement);
            }
            this.topPanelWrapper.style.cssText = `overflow:hidden;width:${contentDisplayWidth}px;`;

            if (!this.bottomPanelWrapper) {
                this.bottomPanelWrapper = document.createElement('div');
                this.bottomPanelWrapper.className = 'grid-bottom-panel-viewport';
                this.bottomPanelElement.parentNode.insertBefore(this.bottomPanelWrapper, this.bottomPanelElement);
                this.bottomPanelWrapper.appendChild(this.bottomPanelElement);
            }
            this.bottomPanelWrapper.style.cssText = `overflow:hidden;width:${contentDisplayWidth}px;`;
        } else {
            if (this.topPanelWrapper && this.topPanelWrapper.parentNode) {
                this.topPanelWrapper.parentNode.insertBefore(this.topPanelElement, this.topPanelWrapper);
                this.topPanelWrapper.remove();
                this.topPanelWrapper = null;
            }
            if (this.bottomPanelWrapper && this.bottomPanelWrapper.parentNode) {
                this.bottomPanelWrapper.parentNode.insertBefore(this.bottomPanelElement, this.bottomPanelWrapper);
                this.bottomPanelWrapper.remove();
                this.bottomPanelWrapper = null;
            }
            currentTopPanel.style.width = '';
            currentBottomPanel.style.width = '';
        }

        this.transferCellWidths(
            currentGrid.querySelectorAll('thead tr:first-child th, tbody tr:first-child td'),
            currentTopPanel.querySelectorAll('thead tr:first-child th')
        );
        this.transferCellWidths(
            currentGrid.querySelectorAll('tfoot tr:first-child td'),
            currentBottomPanel.querySelectorAll('tfoot tr:first-child td')
        );

        while (this.topPanelElement.firstChild) {
            this.topPanelElement.removeChild(this.topPanelElement.firstChild);
        }
        while (this.bottomPanelElement.firstChild) {
            this.bottomPanelElement.removeChild(this.bottomPanelElement.firstChild);
        }

        if (originalCaptionElement) {
            this.topPanelElement.appendChild(originalCaptionElement.cloneNode(true));
        }
        if (originalHeadSection) {
            this.topPanelElement.appendChild(originalHeadSection.cloneNode(true));
        }
        if (originalFootSection) {
            this.bottomPanelElement.appendChild(originalFootSection.cloneNode(true));
        }

        if (originalHeadSection) originalHeadSection.style.display = 'none';
        if (originalFootSection) originalFootSection.style.display = 'none';
        if (originalCaptionElement) originalCaptionElement.style.display = 'none';
    }

    transferCellWidths(sourceCellSet, targetCellSet) {
        if (!sourceCellSet || !targetCellSet || sourceCellSet.length === 0 || targetCellSet.length === 0) return;

        Array.from(sourceCellSet).forEach((srcCell, idx) => {
            if (targetCellSet[idx]) {
                const calculatedWidth = srcCell.offsetWidth;
                targetCellSet[idx].style.width = `${calculatedWidth}px`;
            }
        });
    }

    synchronizeHorizontalScroll() {
        const offsetLeft = this.scrollableRegion.scrollLeft;
        if (this.topPanelWrapper) {
            this.topPanelWrapper.scrollLeft = offsetLeft;
        }
        if (this.bottomPanelWrapper) {
            this.bottomPanelWrapper.scrollLeft = offsetLeft;
        }
    }

    recalibrateLayout() {
        const currentGrid = this.activeGrid;
        const currentTopPanel = this.topPanelElement;
        const currentBottomPanel = this.bottomPanelElement;
        const currentScrollRegion = this.scrollableRegion;

        const originalHeadSection = currentGrid.querySelector('thead');
        const originalFootSection = currentGrid.querySelector('tfoot');

        if (originalHeadSection) originalHeadSection.style.display = '';
        if (originalFootSection) originalFootSection.style.display = '';

        const hasHorizontalMovement = currentScrollRegion.clientWidth < currentScrollRegion.scrollWidth;

        if (hasHorizontalMovement) {
            const effectiveRegionWidth = currentScrollRegion.clientWidth;
            const contentDisplayWidth = effectiveRegionWidth - this.scrollChannelWidth;

            if (this.topPanelWrapper) {
                this.topPanelWrapper.style.width = `${contentDisplayWidth}px`;
            } else {
                 this.harmonizeComponentDimensions();
                 return;
            }
            if (this.bottomPanelWrapper) {
                this.bottomPanelWrapper.style.width = `${contentDisplayWidth}px`;
            }
        } else {
            if (this.topPanelWrapper && this.topPanelWrapper.parentNode) {
                this.topPanelWrapper.parentNode.insertBefore(this.topPanelElement, this.topPanelWrapper);
                this.topPanelWrapper.remove();
                this.topPanelWrapper = null;
            }
            if (this.bottomPanelWrapper && this.bottomPanelWrapper.parentNode) {
                this.bottomPanelWrapper.parentNode.insertBefore(this.bottomPanelElement, this.bottomPanelWrapper);
                this.bottomPanelWrapper.remove();
                this.bottomPanelWrapper = null;
            }
            currentTopPanel.style.width = '';
            currentBottomPanel.style.width = '';
        }

        this.transferCellWidths(
            currentGrid.querySelectorAll('thead tr:first-child th'),
            currentTopPanel.querySelectorAll('thead tr:first-child th')
        );
        this.transferCellWidths(
            currentGrid.querySelectorAll('tfoot tr:first-child td'),
            currentBottomPanel.querySelectorAll('tfoot tr:first-child td')
        );

        if (originalHeadSection) originalHeadSection.style.display = 'none';
        if (originalFootSection) originalFootSection.style.display = 'none';
    }
}

function arrangeScrollableGrid(elementsToProcess, configOptions) {
    const targetElements = Array.from(elementsToProcess);
    targetElements.forEach(element => {
        if (element.tagName === 'TABLE') {
            new GridLayoutManager(element, configOptions);
        }
    });
}

// Mimic jQuery plugin structure for invocation
(function (globalScope) {
    // This function will be called on a collection of elements, similar to jQuery's `$(selector).pluginName()`
    // We'll attach it to the Element.prototype or a custom utility.
    // For a pure vanilla JS context, it's more common to have a global function that accepts a NodeList.
    // However, to align with the *plugin* aspect, we'll create a utility that takes a selector or NodeList.

    if (!globalScope.GridFixerUtility) {
        globalScope.GridFixerUtility = {};
    }

    globalScope.GridFixerUtility.makeScrollable = function(selectorOrNodeList, options) {
        let elements;
        if (typeof selectorOrNodeList === 'string') {
            elements = document.querySelectorAll(selectorOrNodeList);
        } else if (selectorOrNodeList instanceof NodeList || Array.isArray(selectorOrNodeList)) {
            elements = selectorOrNodeList;
        } else if (selectorOrNodeList instanceof HTMLElement) { // Single element
            elements = [selectorOrNodeList];
        } else {
            console.warn("Invalid input for GridFixerUtility.makeScrollable. Expected selector, NodeList, Array, or HTMLElement.");
            return;
        }
        arrangeScrollableGrid(elements, options);
    };

})(window);