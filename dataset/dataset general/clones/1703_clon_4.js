class TableDataOrganizer {
    // Regular expression for common date formats (dd/mm/yyyy, mm/dd/yyyy, dd.mm.yyyy, dd-mm-yyyy)
    static datePattern = /^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/;

    constructor(targetElement) {
        this.targetElement = targetElement;
        this.currentSortColumnIdentifier = -1; // Stores the index of the currently sorted column
        this.sortOrderDirection = 1; // 1 for ascending, -1 for descending

        this.prepareDocumentStructure();
        this.enableInteraction();
    }

    prepareDocumentStructure() {
        // Ensure table has a header section
        if (this.targetElement.tHead === null) {
            const newHeader = this.targetElement.createTHead();
            if (this.targetElement.rows.length > 0) {
                newHeader.appendChild(this.targetElement.rows[0]);
            }
        }
        // Ensure table has a body section
        if (this.targetElement.tBodies.length === 0) {
            this.targetElement.createTBody();
        }

        // Relocate rows marked with 'bottom-fixed' class to the table footer
        const fixedRows = Array.from(this.targetElement.rows).filter(rowItem => rowItem.classList.contains('bottom-fixed'));
        if (fixedRows.length > 0) {
            let footerElement = this.targetElement.tFoot;
            if (footerElement === null) {
                footerElement = this.targetElement.createTFoot();
            }
            fixedRows.forEach(rowItem => footerElement.appendChild(rowItem));
        }

        // Process header cells to determine sort capabilities and types
        const headerCells = this.targetElement.tHead.rows[0].cells;
        Array.from(headerCells).forEach((cellElement, cellIndex) => {
            if (cellElement.classList.contains('no-sort')) {
                cellElement.dataset.isSortable = 'false';
            } else {
                let inferredType = 'textual'; // Default sort type
                const specificTypeMatch = cellElement.className.match(/sort-as-([a-z0-9]+)/);
                if (specificTypeMatch) {
                    inferredType = specificTypeMatch[1];
                } else {
                    // Automatically deduce column data type
                    inferredType = this.deduceColumnType(cellIndex);
                }
                cellElement.dataset.isSortable = 'true';
                cellElement.dataset.columnType = inferredType;
                cellElement.dataset.colIndex = cellIndex;
            }
        });
    }

    enableInteraction() {
        const headerRow = this.targetElement.tHead.rows[0];
        headerRow.addEventListener('click', (eventObject) => this.handleHeaderCellClick(eventObject));
    }

    handleHeaderCellClick(eventObject) {
        const clickedHeaderCell = eventObject.target.closest('th'); // Find the actual TH element
        if (!clickedHeaderCell || clickedHeaderCell.dataset.isSortable !== 'true') {
            return;
        }

        const columnIndex = parseInt(clickedHeaderCell.dataset.colIndex, 10);

        if (this.currentSortColumnIdentifier === columnIndex) {
            this.sortOrderDirection *= -1; // Toggle sort direction
        } else {
            this.currentSortColumnIdentifier = columnIndex;
            this.sortOrderDirection = 1; // Default to ascending for a new column
        }

        this.executeDataSorting(columnIndex, clickedHeaderCell.dataset.columnType);
        this.updateHeaderVisuals(clickedHeaderCell);
    }

    executeDataSorting(colIndex, dataType) {
        const tableBodyElement = this.targetElement.tBodies[0];
        if (!tableBodyElement) return;

        const allBodyRows = Array.from(tableBodyElement.rows);

        // Pre-process rows for efficient sorting (Schwartzian transform)
        const enrichedRows = allBodyRows.map(rowItem => {
            const cellValue = this.retrieveCellContent(rowItem.cells[colIndex]);
            return {
                originalRowRef: rowItem,
                sortableValue: cellValue
            };
        });

        // Sort the enriched rows based on the determined data type
        enrichedRows.sort((first, second) => {
            const comparisonResult = this.compareColumnValues(first.sortableValue, second.sortableValue, dataType);
            return comparisonResult * this.sortOrderDirection;
        });

        // Re-insert rows into the table body in their new sorted order
        enrichedRows.forEach(item => tableBodyElement.appendChild(item.originalRowRef));
    }

    updateHeaderVisuals(activeHeaderCell) {
        // Remove existing sort indicators from all headers
        Array.from(this.targetElement.tHead.rows[0].cells).forEach(cell => {
            cell.classList.remove('ascending', 'descending');
            const indicatorSpan = cell.querySelector('.sort-arrow');
            if (indicatorSpan) {
                indicatorSpan.remove();
            }
        });

        // Add new indicator to the currently sorted header
        if (this.sortOrderDirection === 1) {
            activeHeaderCell.classList.add('ascending');
            activeHeaderCell.insertAdjacentHTML('beforeend', '<span class="sort-arrow">&nbsp;&#x25BC;</span>'); // Down triangle for ascending (original convention)
        } else {
            activeHeaderCell.classList.add('descending');
            activeHeaderCell.insertAdjacentHTML('beforeend', '<span class="sort-arrow">&nbsp;&#x25B2;</span>'); // Up triangle for descending (original convention)
        }
    }

    retrieveCellContent(cellNode) {
        // Prioritize content from a custom data attribute
        if (cellNode.dataset.customSortKey !== undefined) {
            return cellNode.dataset.customSortKey;
        }

        // Handle input elements within the cell
        const inputField = cellNode.querySelector('input');
        if (inputField) {
            return inputField.value.trim();
        }

        // Fallback to plain text content
        return cellNode.textContent.trim();
    }

    deduceColumnType(colIdentifier) {
        const tableBodyElement = this.targetElement.tBodies[0];
        if (!tableBodyElement) return 'textual';

        let potentialDateType = null;

        for (let i = 0; i < tableBodyElement.rows.length; i++) {
            const currentCell = tableBodyElement.rows[i].cells[colIdentifier];
            if (!currentCell) continue;
            const content = this.retrieveCellContent(currentCell);

            if (content === '') continue; // Ignore empty cells for type deduction

            // Check for numeric content first
            if (content.match(/^-?[£$¤]?[\d,.]+%?$/)) {
                return 'numeric'; // If a number is found, assume numeric for the column
            }

            // Check for date content
            const dateMatch = content.match(TableDataOrganizer.datePattern);
            if (dateMatch) {
                const [_, partA, partB, yearPart] = dateMatch;
                const valA = parseInt(partA, 10);
                const valB = parseInt(partB, 10);

                if (valA > 12) { // Definitely dd/mm format
                    return 'date-ddmm';
                } else if (valB > 12) { // Definitely mm/dd format
                    return 'date-mmdd';
                } else {
                    // Ambiguous date (e.g., 01/02/2023 could be dd/mm or mm/dd),
                    // original implementation assumed dd/mm in such cases
                    potentialDateType = 'date-ddmm';
                }
            }
        }
        // If no definitive type found after checking all non-empty cells,
        // return the ambiguous date type if one was encountered, otherwise textual
        return potentialDateType || 'textual';
    }

    compareColumnValues(valueA, valueB, typeOfData) {
        switch (typeOfData) {
            case 'numeric':
                const numericA = parseFloat(valueA.replace(/[^0-9.-]/g, '')) || 0;
                const numericB = parseFloat(valueB.replace(/[^0-9.-]/g, '')) || 0;
                return numericA - numericB;
            case 'date-ddmm':
                return this.compareParsedDates(valueA, valueB, 'ddmm');
            case 'date-mmdd':
                return this.compareParsedDates(valueA, valueB, 'mmdd');
            case 'textual':
            default:
                return valueA.localeCompare(valueB);
        }
    }

    compareParsedDates(dateStringA, dateStringB, dateFormat) {
        const parseDateString = (str, format) => {
            const matchResult = str.match(TableDataOrganizer.datePattern);
            if (!matchResult) return new Date(0); // Invalid date, will be sorted to beginning

            let [_, p1, p2, yr] = matchResult;
            // Handle 2-digit year (assume 20xx)
            if (yr.length === 2) yr = `20${yr}`;

            let monthComponent, dayComponent;
            if (format === 'ddmm') {
                dayComponent = parseInt(p1, 10);
                monthComponent = parseInt(p2, 10);
            } else { // mmdd
                monthComponent = parseInt(p1, 10);
                dayComponent = parseInt(p2, 10);
            }
            // Month in JavaScript Date is 0-indexed
            return new Date(yr, monthComponent - 1, dayComponent);
        };

        const dateObjA = parseDateString(dateStringA, dateFormat);
        const dateObjB = parseDateString(dateStringB, dateFormat);

        return dateObjA.getTime() - dateObjB.getTime();
    }
}

// Global initialization logic to find and enable sorting on tables
document.addEventListener('DOMContentLoaded', () => {
    const interactiveTables = document.querySelectorAll('table.sortable-interactive'); // New class name for target tables
    interactiveTables.forEach(tableNode => {
        new TableDataOrganizer(tableNode);
    });
});