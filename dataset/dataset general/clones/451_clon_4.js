(function() {
    function processLayoutAdaptation() {
        // Discard any previous responsive labels to prevent duplication
        document.querySelectorAll('.resp-header').forEach(item => item.remove());

        // Proceed only if the viewport width is below the specified threshold
        if (window.innerWidth < 700) {
            // Locate all table elements that are direct children of divs, excluding those within forms
            const candidateTables = document.querySelectorAll('div:not(form) > table');

            candidateTables.forEach(currentTableInstance => {
                // Populate any entirely blank table data cells with a non-breaking space
                currentTableInstance.querySelectorAll('td').forEach(dataCellUnit => {
                    if (dataCellUnit.textContent.trim() === '') {
                        dataCellUnit.innerHTML = '&nbsp;';
                    }
                });

                // Collect all header cells from the table's header section
                const headerElements = Array.from(currentTableInstance.querySelectorAll('thead > tr > th'));

                if (headerElements.length > 0) {
                    // Determine the total number of columns by inspecting the first row of the table body
                    const initialBodyRow = currentTableInstance.querySelector('tbody > tr');
                    const columnTotalCount = initialBodyRow ? initialBodyRow.children.length : 0;

                    // Iterate through each column to insert a corresponding header label
                    for (let colPosition = 0; colPosition < columnTotalCount; colPosition++) {
                        const headerContentValue = headerElements[colPosition] ? headerElements[colPosition].innerHTML : '&nbsp;';

                        // Select all data cells belonging to the current column
                        const specificColumnCells = currentTableInstance.querySelectorAll(`tbody > tr > td:nth-of-type(${colPosition + 1})`);

                        specificColumnCells.forEach(individualCell => {
                            // Construct a new span element to serve as the responsive label
                            const newHeaderLabel = document.createElement('span');
                            newHeaderLabel.className = 'resp-header';
                            newHeaderLabel.innerHTML = headerContentValue;

                            // Place the newly created label immediately before the data cell
                            individualCell.parentNode.insertBefore(newHeaderLabel, individualCell);
                        });
                    }
                } else {
                    // If no explicit table headers are present, apply fallback styling
                    currentTableInstance.querySelectorAll('td').forEach(dataCellUnit => {
                        dataCellUnit.style.paddingLeft = '0';
                        dataCellUnit.style.width = 'auto';
                        dataCellUnit.style.left = '3px';
                    });
                }
            });
        }
    }

    // Activate the table layout adjustment routine once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', processLayoutAdaptation);

    // Re-evaluate and adjust table layouts whenever the browser window is resized
    window.addEventListener('resize', processLayoutAdaptation);
})();