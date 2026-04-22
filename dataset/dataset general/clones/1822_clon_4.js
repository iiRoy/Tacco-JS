let responsiveTableInstanceCounter = 1;

const defaultBehaviorSettings = {
    captionLabel: "[NUM] hidden columns...",
    containerClass: "responsiveControlWrapper"
};

function initializeResponsiveTable(targetElement, customOptions) {
    if (!(targetElement instanceof HTMLTableElement)) {
        console.error("Provided element is not a table:", targetElement);
        return null;
    }

    const currentBehavior = Object.assign({}, defaultBehaviorSettings, customOptions);
    const uniqueInstanceId = responsiveTableInstanceCounter++;
    targetElement.classList.add(`responsive-table-instance-${uniqueInstanceId}`);

    let columnInformation = [];
    let menuContainer = null;
    let menuActivatorLink = null;
    let controlCheckboxList = null;

    function retrieveColumnElements(columnKey) {
        const headerMatch = targetElement.querySelector(`#${columnKey}`);
        const dataCellMatches = targetElement.querySelectorAll(`[headers~="${columnKey}"]`);
        return headerMatch ? [headerMatch, ...Array.from(dataCellMatches)] : Array.from(dataCellMatches);
    }

    function scanTableHeaders() {
        columnInformation = [];
        const tableRows = Array.from(targetElement.rows);
        const headerRows = [];
        let dataRowFound = false;

        for (const row of tableRows) {
            if (row.querySelector('td')) {
                dataRowFound = true;
                break;
            }
            headerRows.push(row);
        }

        const primaryHeaderCells = headerRows.flatMap(row => Array.from(row.querySelectorAll('th')));

        primaryHeaderCells.forEach(cell => {
            const cellId = cell.id;
            const cellText = cell.textContent.trim();

            if (cellId && cellText !== "") {
                const parentHeaderAttr = cell.getAttribute('headers');
                const firstParentId = parentHeaderAttr ? parentHeaderAttr.split(/\s+/).filter(Boolean)[0] : null;

                columnInformation.push({
                    key: cellId,
                    label: cellText,
                    parentKey: firstParentId,
                    associatedDomElements: retrieveColumnElements(cellId)
                });
            }
        });
    }

    function generateControlInterface() {
        const interfaceWrapper = document.createElement('div');
        interfaceWrapper.className = currentBehavior.containerClass;

        menuActivatorLink = document.createElement('a');
        menuActivatorLink.href = `#toggleMenu_${uniqueInstanceId}`;
        menuActivatorLink.textContent = currentBehavior.captionLabel.replace('[NUM]', 0);
        interfaceWrapper.appendChild(menuActivatorLink);

        controlCheckboxList = document.createElement('ul');
        controlCheckboxList.id = `toggleMenu_${uniqueInstanceId}`;
        controlCheckboxList.style.display = 'none';
        interfaceWrapper.appendChild(controlCheckboxList);

        targetElement.parentNode.insertBefore(interfaceWrapper, targetElement);
        menuContainer = interfaceWrapper; // Keep a reference to the main container

        const headerNodeMap = new Map();
        columnInformation.forEach(colUnit => {
            const listItem = document.createElement('li');
            listItem.id = `controlItem_${uniqueInstanceId}_${colUnit.key}`;

            const labelNode = document.createElement('label');
            labelNode.htmlFor = `colControlCheckbox_${uniqueInstanceId}_${colUnit.key}`;

            const checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            checkboxInput.className = 'column-visibility-toggle';
            checkboxInput.id = `colControlCheckbox_${uniqueInstanceId}_${colUnit.key}`;
            checkboxInput.name = `columnVisibility_${uniqueInstanceId}[]`;
            checkboxInput.value = colUnit.key;
            checkboxInput.checked = true;
            checkboxInput.dataset.columnRef = colUnit.key;

            labelNode.appendChild(checkboxInput);
            labelNode.appendChild(document.createTextNode(` ${colUnit.label}`));
            listItem.appendChild(labelNode);

            if (colUnit.parentKey && headerNodeMap.has(colUnit.parentKey)) {
                let parentListItem = headerNodeMap.get(colUnit.parentKey);
                let subUl = parentListItem.querySelector('ul');
                if (!subUl) {
                    subUl = document.createElement('ul');
                    parentListItem.appendChild(subUl);
                }
                subUl.appendChild(listItem);
            } else {
                controlCheckboxList.appendChild(listItem);
            }
            headerNodeMap.set(colUnit.key, listItem);
        });
    }

    function toggleMenuDisplay(event) {
        event.preventDefault();
        if (controlCheckboxList.style.display === 'none') {
            controlCheckboxList.style.display = 'block';
        } else {
            controlCheckboxList.style.display = 'none';
        }
    }

    function handleCheckboxChange(event) {
        const changedCheckbox = event.target;
        if (changedCheckbox.classList.contains('column-visibility-toggle')) {
            const columnIdentifier = changedCheckbox.dataset.columnRef;
            const isColumnVisible = changedCheckbox.checked;

            const targetColUnit = columnInformation.find(unit => unit.key === columnIdentifier);
            if (targetColUnit) {
                targetColUnit.associatedDomElements.forEach(el => {
                    if (isColumnVisible) {
                        el.classList.remove('column-hidden-state');
                    } else {
                        el.classList.add('column-hidden-state');
                    }
                });
            }
            updateHiddenColumnsLabel();
        }
    }

    function updateHiddenColumnsLabel() {
        const hiddenCount = controlCheckboxList.querySelectorAll('input.column-visibility-toggle:not(:checked)').length;
        menuActivatorLink.textContent = currentBehavior.captionLabel.replace('[NUM]', hiddenCount);
    }

    function dynamicallyAdjustLayout() {
        // First, reveal all columns to get the full width
        controlCheckboxList.querySelectorAll('input.column-visibility-toggle').forEach(input => {
            input.checked = true;
            const currentColumnUnit = columnInformation.find(unit => unit.key === input.dataset.columnRef);
            if (currentColumnUnit) {
                currentColumnUnit.associatedDomElements.forEach(el => el.classList.remove('column-hidden-state'));
            }
        });

        const parentContainerWidth = targetElement.parentNode.offsetWidth;
        const orderedCheckboxes = Array.from(controlCheckboxList.querySelectorAll('input.column-visibility-toggle'));

        let currentTableRenderWidth = targetElement.offsetWidth;
        const columnsToHide = new Set();

        // Hide columns from right to left until the table fits
        while (currentTableRenderWidth > parentContainerWidth && orderedCheckboxes.length > 0) {
            const rightmostVisibleCheckbox = orderedCheckboxes.pop();
            const columnKeyToConceal = rightmostVisibleCheckbox.dataset.columnRef;

            if (!columnsToHide.has(columnKeyToConceal)) {
                rightmostVisibleCheckbox.checked = false;
                columnsToHide.add(columnKeyToConceal);

                const unitToConceal = columnInformation.find(unit => unit.key === columnKeyToConceal);
                if (unitToConceal) {
                    unitToConceal.associatedDomElements.forEach(el => el.classList.add('column-hidden-state'));
                }
            }
            currentTableRenderWidth = targetElement.offsetWidth;
        }

        updateHiddenColumnsLabel();
    }

    function attachAllListeners() {
        menuActivatorLink.addEventListener('click', toggleMenuDisplay);
        controlCheckboxList.addEventListener('change', handleCheckboxChange);
        window.addEventListener('resize', dynamicallyAdjustLayout);
        document.addEventListener('DOMContentLoaded', dynamicallyAdjustLayout);
    }

    function startTableManagement() {
        scanTableHeaders();
        generateControlInterface();
        attachAllListeners();
        dynamicallyAdjustLayout();
    }

    startTableManagement();

    return {
        refresh: dynamicallyAdjustLayout,
        getManagerId: () => uniqueInstanceId
    };
}

(function() {
    function applyResponsiveBehavior(selector, options = {}) {
        const selectedTables = document.querySelectorAll(selector);
        selectedTables.forEach(tbl => initializeResponsiveTable(tbl, options));
    }

    // Expose the function to the global scope
    window.activateResponsiveTables = applyResponsiveBehavior;
})();