const processTableData = function(dataGridElement) {
    if (!dataGridElement || !(dataGridElement instanceof HTMLElement)) {
        console.error('Provided element is not a valid HTML element.');
        return;
    }

    let primaryContainer = dataGridElement;
    let summaryRowElement = primaryContainer.querySelector('tfoot tr');
    let contentRowElements = Array.from(primaryContainer.querySelectorAll('tbody tr'));
    let notificationElements = Array.from(document.querySelectorAll('.alert'));
    let storedCellContent = '';

    const extractNumericValue = function(cellNode) {
        const rawText = cellNode.textContent.trim();
        const convertedValue = Number.parseFloat(rawText);
        return Number.isNaN(convertedValue) ? 0 : convertedValue;
    };

    const recomputeColumnSum = function(columnIdentifier) {
        let currentSum = 0;
        contentRowElements.forEach(rowNode => {
            const rowCells = Array.from(rowNode.children);
            if (rowCells[columnIdentifier]) {
                currentSum += extractNumericValue(rowCells[columnIdentifier]);
            }
        });

        const summaryCells = Array.from(summaryRowElement.children);
        if (summaryCells[columnIdentifier]) {
            summaryCells[columnIdentifier].textContent = currentSum.toString();
        }
        return currentSum;
    };

    const validateCellContent = function(targetNode, inputValue) {
        const cellPosition = Array.from(targetNode.parentNode.children).indexOf(targetNode);

        if (cellPosition === 0) {
            return !!inputValue && inputValue.trim().length > 0;
        } else {
            const convertedValue = Number.parseFloat(inputValue);
            return !Number.isNaN(convertedValue) && Number.isFinite(convertedValue);
        }
    };

    const displayMessageToUser = function(messageText = 'An issue has occurred!') {
        notificationElements.forEach(messageDisplay => {
            messageDisplay.textContent = messageText;
            messageDisplay.style.display = 'block';
        });
    };

    const hideMessageFromUser = function() {
        notificationElements.forEach(messageDisplay => {
            messageDisplay.style.display = 'none';
        });
    };

    const onCellFocus = function(eventData) {
        storedCellContent = eventData.target.textContent;
    };

    const onCellBlur = function(eventData) {
        const modifiedCell = eventData.target;
        const cellPosition = Array.from(modifiedCell.parentNode.children).indexOf(modifiedCell);

        if (!validateCellContent(modifiedCell, modifiedCell.textContent)) {
            modifiedCell.textContent = storedCellContent;
            displayMessageToUser('Input validation failed. Value restored.');
            if (cellPosition === 0) { hideMessageFromUser(); }
            return;
        }

        if (cellPosition === 0) {
            hideMessageFromUser();
            return;
        }

        const updatedSum = recomputeColumnSum(cellPosition);

        if (cellPosition === 1 && updatedSum > 5000) {
            displayMessageToUser('Column two total exceeds 5000! Input rejected.');
            modifiedCell.textContent = storedCellContent;
            recomputeColumnSum(cellPosition);
            return;
        } else {
            hideMessageFromUser();
        }
    };

    const initializeColumnSums = function() {
        const summaryCells = Array.from(summaryRowElement.children);
        for (let idx = 1; idx < summaryCells.length; idx++) {
            recomputeColumnSum(idx);
        }
    };

    const attachCellListeners = function() {
        const dataInputCells = primaryContainer.querySelectorAll('tbody td');
        dataInputCells.forEach(cellItem => {
            cellItem.setAttribute('contenteditable', 'true');
            cellItem.addEventListener('focus', onCellFocus);
            cellItem.addEventListener('blur', onCellBlur);
        });
    };

    attachCellListeners();
    initializeColumnSums();

    return primaryContainer;
};