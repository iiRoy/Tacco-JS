window.addEventListener('DOMContentLoaded', function() {
    const connectionEndpoint = './include/process.php';
    const transmissionSettings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tag: 'getData' })
    };

    fetch(connectionEndpoint, transmissionSettings)
        .then(responseSignal => {
            if (!responseSignal.ok) {
                throw new Error('Network communication failed: ' + responseSignal.statusText);
            }
            return responseSignal.json();
        })
        .then(serverPayload => {
            const mainDisplayElement = document.querySelector('table');
            let dataInsertionPoint = mainDisplayElement.querySelector('tbody');

            if (!dataInsertionPoint) {
                dataInsertionPoint = document.createElement('tbody');
                mainDisplayElement.appendChild(dataInsertionPoint);
            }

            if (serverPayload && serverPayload.achievement) {
                Object.keys(serverPayload)
                    .filter(entryKey => !isNaN(Number(entryKey)))
                    .forEach(entryKey => {
                        const itemEntity = serverPayload[entryKey];
                        const displayLine = document.createElement('tr');

                        const identifierCell = document.createElement('td');
                        identifierCell.textContent = itemEntity.Id;
                        displayLine.appendChild(identifierCell);

                        const nameCell = document.createElement('td');
                        nameCell.textContent = itemEntity.Nombre;
                        displayLine.appendChild(nameCell);

                        const descriptionCell = document.createElement('td');
                        descriptionCell.textContent = itemEntity.Descripcion;
                        displayLine.appendChild(descriptionCell);

                        dataInsertionPoint.appendChild(displayLine);
                    });
            }

            function activateTableSorting(targetTable) {
                let headerSection = targetTable.querySelector('thead');
                const tableBodyContent = targetTable.querySelector('tbody');

                if (!headerSection) {
                    headerSection = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    ['ID_VAL', 'NAME_VAL', 'DESC_VAL'].forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        headerRow.appendChild(th);
                    });
                    headerSection.appendChild(headerRow);
                    targetTable.prepend(headerSection);
                }

                if (!tableBodyContent) return;

                Array.from(headerSection.querySelector('tr').children).forEach((headerCell, columnIndex) => {
                    headerCell.style.cursor = 'pointer';
                    let sortAscending = true;

                    headerCell.addEventListener('click', () => {
                        const rowsArray = Array.from(tableBodyContent.querySelectorAll('tr'));

                        rowsArray.sort((rowA, rowB) => {
                            const cellA = rowA.children[columnIndex].textContent.trim();
                            const cellB = rowB.children[columnIndex].textContent.trim();

                            let comparisonValue = 0;
                            const numA = parseFloat(cellA);
                            const numB = parseFloat(cellB);

                            if (!isNaN(numA) && !isNaN(numB)) {
                                comparisonValue = numA - numB;
                            } else {
                                comparisonValue = cellA.localeCompare(cellB);
                            }
                            return sortAscending ? comparisonValue : -comparisonValue;
                        });

                        while (tableBodyContent.firstChild) {
                            tableBodyContent.removeChild(tableBodyContent.firstChild);
                        }
                        rowsArray.forEach(sortedRow => tableBodyContent.appendChild(sortedRow));

                        sortAscending = !sortAscending;
                    });
                });
            }

            activateTableSorting(mainDisplayElement);
        })
        .catch(problem => {
            console.error('An issue occurred during data acquisition or processing:', problem);
            const errorDisplay = document.createElement('p');
            errorDisplay.textContent = 'Failed to retrieve information from the server.';
            document.body.appendChild(errorDisplay);
        });
});