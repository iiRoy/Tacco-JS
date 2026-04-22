document.addEventListener('DOMContentLoaded', () => {

    const gridOrganizer = (function() {

        const defaultConfiguration = {
            debugMode: false,
            ascendingClass: 'ordered-up',
            descendingClass: 'ordered-down',
            customSortFunction: null
        };

        function outputDebugMessage(message, configuration) {
            if (configuration.debugMode && console && console.log) {
                console.log(`[GridOrganizer] ${message}`);
            }
        }

        function createSortableGrid(targetGridElement, userOptions) {
            const currentSorterInstance = {};
            currentSorterInstance.gridElement = targetGridElement;
            currentSorterInstance.headerContainer = targetGridElement.querySelector('thead');
            currentSorterInstance.configuration = { ...defaultConfiguration, ...userOptions };

            currentSorterInstance.activeColumnIndex = null;
            currentSorterInstance.activeHeaderElement = null;
            currentSorterInstance.sortDirectionState = null;

            const headerCells = currentSorterInstance.gridElement.querySelectorAll('th');
            headerCells.forEach(header => {
                const boundClickHandler = () => processColumnSort(currentSorterInstance, header);
                header.addEventListener('click', boundClickHandler);
                header.__gridOrganizerClickHandler__ = boundClickHandler;
            });

            currentSorterInstance.initiateSort = function(headerElement, explicitDirection) {
                processColumnSort(currentSorterInstance, headerElement, explicitDirection);
            };

            currentSorterInstance.deactivate = function() {
                const headers = currentSorterInstance.gridElement.querySelectorAll('th');
                headers.forEach(header => {
                    const handler = header.__gridOrganizerClickHandler__;
                    if (handler) {
                        header.removeEventListener('click', handler);
                        delete header.__gridOrganizerClickHandler__;
                    }
                });
                delete currentSorterInstance.gridElement.__gridOrganizerInstance__;
                outputDebugMessage('Deactivated sortable grid instance.', currentSorterInstance.configuration);
            };

            return currentSorterInstance;
        }

        function processColumnSort(instance, headerElement, explicitDirection) {
            const operationStartTime = Date.now();
            const grid = instance.gridElement;
            const config = instance.configuration;

            const bodyRows = Array.from(grid.querySelectorAll('tbody tr'));
            const allGridRows = Array.from(grid.querySelectorAll('tr'));
            const dataRows = bodyRows.length > 0 ? bodyRows : allGridRows.slice(1);

            if (dataRows.length === 0) {
                outputDebugMessage("No data rows found for sorting.", config);
                return;
            }

            const headerCellsInRow = Array.from(headerElement.parentElement.children);
            const columnIndex = headerCellsInRow.indexOf(headerElement);
            if (columnIndex === -1) {
                outputDebugMessage("Could not determine column index.", config);
                return;
            }

            const targetColumnCells = dataRows.map(row => row.children[columnIndex]);
            if (targetColumnCells.length === 0) {
                outputDebugMessage("No cells found in the selected column for sorting.", config);
                return;
            }

            const extractedValues = targetColumnCells.map(cell => {
                const customCriterionFromData = headerElement.dataset.customSortCriterion;
                const customSortFnFromConfig = config.customSortFunction;

                if (typeof customSortFnFromConfig === 'function') {
                    return customSortFnFromConfig(headerElement, cell, instance);
                } else if (customCriterionFromData) {
                    return customCriterionFromData;
                }
                return cell.dataset.sortKey != null ? cell.dataset.sortKey : cell.textContent;
            });

            instance.gridElement.querySelectorAll('th').forEach(th => {
                th.classList.remove(config.ascendingClass, config.descendingClass);
            });

            let currentSortDirection;
            if (explicitDirection !== 'upward' && explicitDirection !== 'downward') {
                currentSortDirection = (instance.activeColumnIndex !== columnIndex || instance.sortDirectionState === 'downward') ? 'upward' : 'downward';
            } else {
                currentSortDirection = explicitDirection;
            }

            instance.sortDirectionState = currentSortDirection;
            instance.activeColumnIndex = columnIndex;
            instance.activeHeaderElement = headerElement;

            const comparisonMultiplier = currentSortDirection === 'upward' ? 1 : -1;

            const startEvent = new CustomEvent('gridOrganizer:start', { detail: { sorterInstance: instance } });
            grid.dispatchEvent(startEvent);
            outputDebugMessage(`Initiating sort on column ${columnIndex} in ${instance.sortDirectionState} order.`, config);

            const sortableEntries = dataRows.map((row, idx) => ({
                originalRow: row,
                comparisonValue: extractedValues[idx]
            }));

            sortableEntries.sort((entryA, entryB) => {
                const valA = entryA.comparisonValue;
                const valB = entryB.comparisonValue;

                if (!isNaN(parseFloat(valA)) && isFinite(valA) && !isNaN(parseFloat(valB)) && isFinite(valB)) {
                    return (parseFloat(valA) - parseFloat(valB)) * comparisonMultiplier;
                }

                const stringValA = String(valA).toLowerCase();
                const stringValB = String(valB).toLowerCase();

                if (stringValA > stringValB) {
                    return 1 * comparisonMultiplier;
                } else if (stringValA < stringValB) {
                    return -1 * comparisonMultiplier;
                } else {
                    return 0;
                }
            });

            const targetAppendContainer = grid.querySelector('tbody') || grid;
            const fragmentToAppend = document.createDocumentFragment();
            sortableEntries.forEach(entry => {
                fragmentToAppend.appendChild(entry.originalRow);
            });
            targetAppendContainer.appendChild(fragmentToAppend);

            headerElement.classList.add(config[currentSortDirection === 'upward' ? 'ascendingClass' : 'descendingClass']);

            outputDebugMessage(`Sort operation completed in ${Date.now() - operationStartTime}ms.`, config);
            const completeEvent = new CustomEvent('gridOrganizer:complete', { detail: { sorterInstance: instance } });
            grid.dispatchEvent(completeEvent);
        }

        function initializeGridSorter(tableElement, customOptions) {
            let existingInstance = tableElement.__gridOrganizerInstance__;

            if (existingInstance) {
                existingInstance.deactivate();
            }

            const newInstance = createSortableGrid(tableElement, customOptions);
            tableElement.__gridOrganizerInstance__ = newInstance;
            return newInstance;
        }

        return {
            init: initializeGridSorter
        };

    })();

    window.gridOrganizer = gridOrganizer;

});