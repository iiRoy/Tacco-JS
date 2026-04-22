const createScrollSynchronizedTable = (targetElement, customOptions) => {
    let tableInstance;

    // Helper to get an element safely
    const obtainElement = (identifier) => {
        if (typeof identifier === 'string') {
            return document.querySelector(identifier);
        } else if (identifier instanceof HTMLElement) {
            return identifier;
        }
        return null;
    };

    const initialTable = obtainElement(targetElement);
    if (initialTable) {
        tableInstance = new ScrollSynchronizedTableManager(initialTable, customOptions);
    } else {
        console.error('Target table not found or invalid element provided.');
    }
    return tableInstance;
};

class ScrollSynchronizedTableManager {
    constructor(baseTable, inputConfiguration) {
        this.sourceTable = baseTable;
        this.configuration = this._processConfiguration(inputConfiguration);
        this.structuralElements = {}; // Stores references to new DOM elements
        this.computedMeasures = {}; // Stores calculated dimensions

        if (!this._validateTableStructure()) {
            console.error('Table must contain <thead> and <tbody> elements.');
            return;
        }

        this._constructLayout();
        this._establishFooter(); // Must run before _handleFixedSections for fixed footer
        this._establishFixedSections(); // Must run before _calculateAllMeasures
        this._calculateAllMeasures();
        this._applyInitialStyles();
        this._registerScrollEvents();

        if (typeof this.configuration.onReadyCallback === 'function') {
            this.configuration.onReadyCallback.call(this.sourceTable);
        }

        if (!this.configuration.visibleAtStart) {
            this.conceal();
        }
    }

    _processConfiguration(userOptions) {
        const defaultOptions = {
            frameWidth: '100%',
            frameHeight: '100%',
            stylingBaseClass: 'sst-default',
            fixedColumnQuantity: 0,
            legacyFixedColIndicator: false, // For backward compatibility
            allowSorting: false,
            visibleAtStart: true,
            displayTableFooter: false,
            duplicateHeaderAsFooter: false,
            enableAutoResize: false,
            onReadyCallback: null
        };
        const mergedConfig = { ...defaultOptions, ...userOptions };

        if (mergedConfig.legacyFixedColIndicator === true && mergedConfig.fixedColumnQuantity <= 0) {
            mergedConfig.fixedColumnQuantity = 1;
        }
        return mergedConfig;
    }

    _validateTableStructure() {
        return this.sourceTable.tagName === 'TABLE' &&
               this.sourceTable.querySelector('thead') &&
               this.sourceTable.querySelector('tbody');
    }

    _constructLayout() {
        const originalParent = this.sourceTable.parentNode;

        // Main wrapper for the entire component
        this.structuralElements.mainFrame = document.createElement('div');
        this.structuralElements.mainFrame.classList.add('sst-main-frame', this.configuration.stylingBaseClass);
        this.structuralElements.mainFrame.style.width = this.configuration.frameWidth;
        this.structuralElements.mainFrame.style.height = this.configuration.frameHeight;
        originalParent.insertBefore(this.structuralElements.mainFrame, this.sourceTable);

        // Header section (cloned from original table's thead)
        this.structuralElements.headerContainer = document.createElement('div');
        this.structuralElements.headerContainer.classList.add('sst-header-container');
        const clonedHeaderTable = this.sourceTable.cloneNode(false);
        clonedHeaderTable.classList.add('sst-content-render-table');
        clonedHeaderTable.appendChild(this.sourceTable.querySelector('thead').cloneNode(true));
        this.structuralElements.headerContainer.appendChild(clonedHeaderTable);
        this.structuralElements.mainFrame.appendChild(this.structuralElements.headerContainer);

        // Body section (contains the original table)
        this.structuralElements.bodyContainer = document.createElement('div');
        this.structuralElements.bodyContainer.classList.add('sst-body-container');
        this.structuralElements.mainFrame.appendChild(this.structuralElements.bodyContainer);
        this.structuralElements.bodyContainer.appendChild(this.sourceTable); // Move original table here

        this.sourceTable.classList.add('sst-content-render-table');
        // Hide the original header by offsetting its margin
        this.sourceTable.style.marginTop = `-${this.structuralElements.headerContainer.offsetHeight}px`;
    }

    _establishFooter() {
        if (!this.configuration.displayTableFooter && !this.configuration.duplicateHeaderAsFooter) return;

        let footerContentNode;
        const originalTfoot = this.sourceTable.querySelector('tfoot');

        if (this.configuration.displayTableFooter && originalTfoot) {
            footerContentNode = originalTfoot.cloneNode(true);
        } else if (this.configuration.duplicateHeaderAsFooter) {
            // If cloning header, ensure it's wrapped in a <tfoot> tag
            const clonedHead = this.sourceTable.querySelector('thead').cloneNode(true);
            const newTfootElement = document.createElement('tfoot');
            while(clonedHead.firstChild) {
                newTfootElement.appendChild(clonedHead.firstChild);
            }
            footerContentNode = newTfootElement;
        } else {
            return; // No footer to create based on config
        }

        this.structuralElements.footerContainer = document.createElement('div');
        this.structuralElements.footerContainer.classList.add('sst-footer-container');
        const clonedFooterTable = this.sourceTable.cloneNode(false);
        clonedFooterTable.classList.add('sst-content-render-table');
        clonedFooterTable.appendChild(footerContentNode);
        this.structuralElements.footerContainer.appendChild(clonedFooterTable);
        this.structuralElements.mainFrame.appendChild(this.structuralElements.footerContainer);
    }

    _establishFixedSections() {
        const numFixedCols = this.configuration.fixedColumnQuantity;
        if (numFixedCols === 0) return;

        // Create container for fixed columns
        this.structuralElements.fixedColumnFrame = document.createElement('div');
        this.structuralElements.fixedColumnFrame.classList.add('sst-fixed-column-frame');
        this.structuralElements.mainFrame.appendChild(this.structuralElements.fixedColumnFrame);

        // Create a wrapper for the horizontally scrollable content (header, body, footer)
        this.structuralElements.scrollableContentWrapper = document.createElement('div');
        this.structuralElements.scrollableContentWrapper.classList.add('sst-scrollable-content-wrapper');
        this.structuralElements.mainFrame.appendChild(this.structuralElements.scrollableContentWrapper);
        
        // Move header, body, footer into the scrollable wrapper
        this.structuralElements.scrollableContentWrapper.appendChild(this.structuralElements.headerContainer);
        this.structuralElements.scrollableContentWrapper.appendChild(this.structuralElements.bodyContainer);
        if (this.structuralElements.footerContainer) {
            this.structuralElements.scrollableContentWrapper.appendChild(this.structuralElements.footerContainer);
        }
        
        // --- Fixed Header ---
        const fixedHeaderTable = this.sourceTable.cloneNode(false);
        fixedHeaderTable.classList.add('sst-content-render-table');
        const fixedThead = this.sourceTable.querySelector('thead').cloneNode(true);
        // Remove non-fixed columns from the cloned header
        fixedThead.querySelectorAll(`th:nth-child(n+${numFixedCols + 1})`).forEach(el => el.remove());
        fixedHeaderTable.appendChild(fixedThead);
        const fixedHeaderWrapper = document.createElement('div');
        fixedHeaderWrapper.classList.add('sst-fixed-header-container');
        fixedHeaderWrapper.appendChild(fixedHeaderTable);
        this.structuralElements.fixedColumnFrame.appendChild(fixedHeaderWrapper);

        // --- Fixed Body ---
        const fixedBodyTable = this.sourceTable.cloneNode(false);
        fixedBodyTable.classList.add('sst-content-render-table', 'sst-fixed-body-table');
        const fixedTbody = this.sourceTable.querySelector('tbody').cloneNode(true);
        fixedTbody.querySelectorAll('tr').forEach(row => {
            row.querySelectorAll(`td:nth-child(n+${numFixedCols + 1})`).forEach(el => el.remove());
        });
        fixedBodyTable.appendChild(fixedTbody);
        const fixedBodyWrapper = document.createElement('div');
        fixedBodyWrapper.classList.add('sst-fixed-body-container');
        fixedBodyWrapper.appendChild(fixedBodyTable);
        this.structuralElements.fixedColumnFrame.appendChild(fixedBodyWrapper);

        // --- Fixed Footer (if exists) ---
        if (this.structuralElements.footerContainer) {
            const fixedFooterTable = this.sourceTable.cloneNode(false);
            fixedFooterTable.classList.add('sst-content-render-table');
            
            let sourceForFixedTfoot;
            const originalTfoot = this.sourceTable.querySelector('tfoot');
            if (this.configuration.displayTableFooter && originalTfoot) {
                sourceForFixedTfoot = originalTfoot.cloneNode(true);
            } else if (this.configuration.duplicateHeaderAsFooter) {
                const clonedHeadForFoot = this.sourceTable.querySelector('thead').cloneNode(true);
                const tempTfoot = document.createElement('tfoot');
                while(clonedHeadForFoot.firstChild) { tempTfoot.appendChild(clonedHeadForFoot.firstChild); }
                sourceForFixedTfoot = tempTfoot;
            }

            if (sourceForFixedTfoot) {
                sourceForFixedTfoot.querySelectorAll(`th:nth-child(n+${numFixedCols + 1})`).forEach(el => el.remove());
                sourceForFixedTfoot.querySelectorAll(`td:nth-child(n+${numFixedCols + 1})`).forEach(el => el.remove());
                fixedFooterTable.appendChild(sourceForFixedTfoot);
                const fixedFooterWrapper = document.createElement('div');
                fixedFooterWrapper.classList.add('sst-fixed-footer-container');
                fixedFooterWrapper.appendChild(fixedFooterTable);
                this.structuralElements.fixedColumnFrame.appendChild(fixedFooterWrapper);
            }
        }

        // Mousewheel for fixed column body to scroll main body vertically
        fixedBodyWrapper.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.structuralElements.bodyContainer.scrollTop += event.deltaY;
        });
    }

    _calculateAllMeasures() {
        const headerHeight = this.structuralElements.headerContainer.offsetHeight;
        const footerHeight = this.structuralElements.footerContainer ? this.structuralElements.footerContainer.offsetHeight : 0;
        const mainFrameHeight = this.structuralElements.mainFrame.clientHeight;
        const bodyContainer = this.structuralElements.bodyContainer;

        const computedBodyStyle = getComputedStyle(bodyContainer);
        const bodyBorderTop = parseFloat(computedBodyStyle.borderTopWidth || '0');
        const bodyBorderBottom = parseFloat(computedBodyStyle.borderBottomWidth || '0');
        const bodyVerticalBorders = bodyBorderTop + bodyBorderBottom;

        // Calculate body container height
        this.computedMeasures.bodyHeight = mainFrameHeight - headerHeight - footerHeight - bodyVerticalBorders;
        bodyContainer.style.height = `${this.computedMeasures.bodyHeight}px`;

        // Adjust table width to account for scrollbar
        const scrollbarSize = this._getScrollbarDimension();
        let effectiveTableWidth;
        if (this.configuration.frameWidth.includes('%')) {
            effectiveTableWidth = this.structuralElements.mainFrame.clientWidth;
        } else {
            effectiveTableWidth = parseFloat(this.configuration.frameWidth);
        }
        
        const contentTableWidth = `${effectiveTableWidth - scrollbarSize}px`;
        this.sourceTable.style.width = contentTableWidth;
        this.structuralElements.headerContainer.querySelector('.sst-content-render-table').style.width = contentTableWidth;
        if (this.structuralElements.footerContainer) {
            this.structuralElements.footerContainer.querySelector('.sst-content-render-table').style.width = contentTableWidth;
        }

        // If fixed columns are present, calculate their width and adjust scrollable area
        if (this.configuration.fixedColumnQuantity > 0) {
            let fixedColumnTotalWidth = 0;
            const headerCells = this.sourceTable.querySelector('thead tr').children;
            for (let i = 0; i < this.configuration.fixedColumnQuantity; i++) {
                if (headerCells[i]) {
                    fixedColumnTotalWidth += headerCells[i].offsetWidth;
                }
            }
            this.structuralElements.fixedColumnFrame.style.width = `${fixedColumnTotalWidth}px`;
            this.structuralElements.scrollableContentWrapper.style.marginLeft = `${fixedColumnTotalWidth}px`;
            this.structuralElements.scrollableContentWrapper.style.width = `calc(100% - ${fixedColumnTotalWidth}px)`;

            // Set fixed body container height
            const fixedBodyContainer = this.structuralElements.fixedColumnFrame.querySelector('.sst-fixed-body-container');
            if (fixedBodyContainer) {
                const computedFixedBodyStyle = getComputedStyle(fixedBodyContainer);
                const fixedBodyBorderTop = parseFloat(computedFixedBodyStyle.borderTopWidth || '0');
                const fixedBodyBorderBottom = parseFloat(computedFixedBodyStyle.borderBottomWidth || '0');
                const fixedBodyVerticalBorders = fixedBodyBorderTop + fixedBodyBorderBottom;
                fixedBodyContainer.style.height = `${this.computedMeasures.bodyHeight - fixedBodyVerticalBorders}px`;
            }
        }
    }

    _applyInitialStyles() {
        // Apply border-collapse if configured
        if (this.configuration.borderCollapse) {
            const tables = this.structuralElements.mainFrame.querySelectorAll('.sst-content-render-table');
            tables.forEach(tbl => tbl.style.borderCollapse = 'collapse');
        }
    }

    _registerScrollEvents() {
        const bodyScrollable = this.structuralElements.bodyContainer;
        const headerContentTable = this.structuralElements.headerContainer.querySelector('.sst-content-render-table');
        const footerContentTable = this.structuralElements.footerContainer ? this.structuralElements.footerContainer.querySelector('.sst-content-render-table') : null;

        bodyScrollable.addEventListener('scroll', () => {
            // Synchronize horizontal scroll for header and footer using CSS transform
            headerContentTable.style.transform = `translateX(-${bodyScrollable.scrollLeft}px)`;
            if (footerContentTable) {
                footerContentTable.style.transform = `translateX(-${bodyScrollable.scrollLeft}px)`;
            }

            // Synchronize vertical scroll for fixed column body using CSS transform
            if (this.configuration.fixedColumnQuantity > 0 && this.structuralElements.fixedColumnFrame) {
                const fixedColumnBodyContentTable = this.structuralElements.fixedColumnFrame.querySelector('.sst-fixed-body-table');
                if (fixedColumnBodyContentTable) {
                    fixedColumnBodyContentTable.style.transform = `translateY(-${bodyScrollable.scrollTop}px)`;
                }
            }
        });
    }

    _getScrollbarDimension() {
        const testDiv = document.createElement('div');
        testDiv.style.width = '100px';
        testDiv.style.height = '100px';
        testDiv.style.overflow = 'scroll';
        testDiv.style.position = 'absolute';
        testDiv.style.top = '-9999px';
        document.body.appendChild(testDiv);
        const scrollbarWidth = testDiv.offsetWidth - testDiv.clientWidth;
        document.body.removeChild(testDiv);
        return scrollbarWidth;
    }

    // Public API methods
    display() { // Renamed from show
        if (this.structuralElements.mainFrame) {
            this.structuralElements.mainFrame.style.display = ''; // Revert to default display
        }
    }

    conceal() { // Renamed from hide
        if (this.structuralElements.mainFrame) {
            this.structuralElements.mainFrame.style.display = 'none';
        }
    }

    applyAlternatingRowStyles(alternateClass = 'sst-alternating-row') { // Renamed from altRows
        this.sourceTable.querySelectorAll('tbody tr:nth-child(odd)').forEach(row => {
            row.classList.add(alternateClass);
        });
    }

    restoreOriginalTable() { // Renamed from destroy
        if (!this.structuralElements.mainFrame) return;

        // Move the original table back to its original parent
        const originalParent = this.structuralElements.mainFrame.parentNode;
        originalParent.insertBefore(this.sourceTable, this.structuralElements.mainFrame);

        // Clean up styles/classes added to the original table
        this.sourceTable.style.marginTop = '';
        this.sourceTable.style.width = '';
        this.sourceTable.classList.remove('sst-content-render-table');

        // Remove all plugin-generated wrapper elements
        this.structuralElements.mainFrame.remove();

        // Clear internal references
        this.structuralElements = {};
        this.computedMeasures = {};
        this.configuration = {};
    }
}