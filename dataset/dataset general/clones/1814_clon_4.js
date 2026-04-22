const DataGridManager = (function() {
    class InternalGridHandler {
        #targetElement;
        #gridSettings;

        constructor(domElement, initialProps) {
            if (!(domElement instanceof HTMLTableElement)) {
                console.error("InternalGridHandler: Provided element is not a valid HTMLTableElement.");
                throw new Error("Invalid element type.");
            }

            this.#targetElement = domElement;

            const defaultGridStructure = {
                headerLabels: [],
                columnMapKeys: []
            };

            this.#gridSettings = {
                ...defaultGridStructure,
                ...initialProps
            };

            this.#establishTableLayout();
            this.#populateHeaderCells();

            this.#targetElement.dataset.gridConfigPayload = JSON.stringify(this.#gridSettings);
        }

        #establishTableLayout() {
            let tableHead = this.#targetElement.querySelector('thead');
            if (!tableHead) {
                tableHead = document.createElement('thead');
                this.#targetElement.appendChild(tableHead);
            }

            let headRow = tableHead.querySelector('tr');
            if (!headRow) {
                headRow = document.createElement('tr');
                tableHead.appendChild(headRow);
            }

            let tableBody = this.#targetElement.querySelector('tbody');
            if (!tableBody) {
                tableBody = document.createElement('tbody');
                this.#targetElement.appendChild(tableBody);
            }
        }

        #populateHeaderCells() {
            const headRow = this.#targetElement.querySelector('thead tr');
            if (headRow) {
                headRow.innerHTML = '';
                for (const columnTitle of this.#gridSettings.headerLabels) {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = columnTitle;
                    headRow.appendChild(headerCell);
                }
            }
        }

        async updateGridContent(contentOptions) {
            const defaultContentOptions = {
                contentSource: undefined,
                rowStyleName: undefined,
                completionAction: undefined
            };

            const currentContentOptions = {
                ...defaultContentOptions,
                ...contentOptions
            };

            const storedConfigJSON = this.#targetElement.dataset.gridConfigPayload;
            if (storedConfigJSON) {
                this.#gridSettings = { ...this.#gridSettings, ...JSON.parse(storedConfigJSON) };
            }

            let dataEntries = [];

            if (typeof currentContentOptions.contentSource === "string") {
                try {
                    const responseFetch = await fetch(currentContentOptions.contentSource);
                    if (!responseFetch.ok) {
                        throw new Error(`Network issue! Status: ${responseFetch.status}`);
                    }
                    dataEntries = await responseFetch.json();
                } catch (problem) {
                    console.error("Failed to retrieve data:", problem);
                    dataEntries = [];
                }
            } else if (Array.isArray(currentContentOptions.contentSource)) {
                dataEntries = currentContentOptions.contentSource;
            } else {
                console.warn("Invalid data source provided. Expecting a URL string or an array.");
                return;
            }

            this.#renderBodyRows(dataEntries, currentContentOptions.rowStyleName, currentContentOptions.completionAction);
        }

        #renderBodyRows(dataEntries, rowStyleName, completionAction) {
            const tableBody = this.#targetElement.querySelector('tbody');
            if (!tableBody) {
                console.error("Table body missing for content rendering.");
                return;
            }

            tableBody.innerHTML = '';

            let recordIndex = 0;
            for (const dataRecord of dataEntries) {
                const tableEntryRow = document.createElement('tr');
                if (rowStyleName) {
                    tableEntryRow.classList.add(rowStyleName);
                }

                for (const columnKey of this.#gridSettings.columnMapKeys) {
                    const cellItem = document.createElement('td');
                    if (columnKey === '*') {
                        cellItem.textContent = String(recordIndex + 1);
                    } else {
                        cellItem.textContent = String(dataRecord[columnKey] ?? '');
                    }
                    tableEntryRow.appendChild(cellItem);
                }
                tableBody.appendChild(tableEntryRow);
                recordIndex++;
            }

            if (typeof completionAction === "function") {
                completionAction();
            }

            window.dispatchEvent(new Event('resize'));
        }
    }
    return InternalGridHandler;
})();

const TableStructureBuilder = (function() {
    const gridInstancesRegistry = new WeakMap();

    return {
        constructGrid: function(domElement, initialProps) {
            if (!(domElement instanceof HTMLElement)) {
                console.error("TableStructureBuilder: Target must be an HTMLElement.");
                return null;
            }

            let gridHandler = gridInstancesRegistry.get(domElement);
            if (!gridHandler) {
                gridHandler = new DataGridManager(domElement, initialProps);
                gridInstancesRegistry.set(domElement, gridHandler);
            } else {
                gridHandler = new DataGridManager(domElement, initialProps);
                gridInstancesRegistry.set(domElement, gridHandler);
            }

            return {
                refreshData: async function(updateProps) {
                    await gridHandler.updateGridContent(updateProps);
                }
            };
        },

        updateExistingGridData: async function(domElement, updateProps) {
            if (!(domElement instanceof HTMLElement)) {
                console.error("TableStructureBuilder: Target must be an HTMLElement.");
                return;
            }

            const gridHandler = gridInstancesRegistry.get(domElement);
            if (gridHandler) {
                await gridHandler.updateGridContent(updateProps);
            } else {
                console.error("TableStructureBuilder: No grid handler found for this element. Please construct the grid first.");
            }
        }
    };
})();