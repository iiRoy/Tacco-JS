function renderJsonTree(targetElement, sourceData) {
    function escapeHtml(unfiltered) {
        if (typeof unfiltered !== 'string') return unfiltered;
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(document.createTextNode(unfiltered));
        return tempDiv.innerHTML;
    }

    function constructSegment(dataUnit, currentDepth) {
        currentDepth = currentDepth || 0;
        let segmentContainer;

        if (Array.isArray(dataUnit)) {
            if (dataUnit.length === 0) {
                segmentContainer = document.createElement('div');
                segmentContainer.className = `empty-data-array depth-${currentDepth}`;
                segmentContainer.textContent = '[ ]';
            } else {
                segmentContainer = document.createElement('div');
                segmentContainer.className = `data-array-container depth-${currentDepth}`;
                const entryList = document.createElement('ol');
                entryList.className = 'array-entry-list';
                entryList.title = `Array with ${dataUnit.length} items`;

                dataUnit.forEach(item => {
                    const entryItem = document.createElement('li');
                    entryItem.className = 'array-entry';

                    const toggleControl = document.createElement('a');
                    toggleControl.href = '#';
                    toggleControl.className = 'array-toggle-control';
                    toggleControl.textContent = '[-]';
                    entryItem.appendChild(toggleControl);

                    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                        const valueDisplay = document.createElement('p');
                        valueDisplay.className = 'text-data-representation';
                        valueDisplay.textContent = escapeHtml(item);
                        entryItem.appendChild(valueDisplay);
                    } else if (item === null) {
                        const nullDisplay = document.createElement('p');
                        nullDisplay.className = 'null-data-representation';
                        nullDisplay.textContent = 'null';
                        entryItem.appendChild(nullDisplay);
                    } else {
                        entryItem.appendChild(constructSegment(item, currentDepth + 1));
                    }
                    entryList.appendChild(entryItem);
                });
                segmentContainer.appendChild(entryList);
            }
        } else if (typeof dataUnit === 'object' && dataUnit !== null) {
            const objectKeys = Object.keys(dataUnit);
            if (objectKeys.length === 0) {
                segmentContainer = document.createElement('div');
                segmentContainer.className = `empty-data-object depth-${currentDepth}`;
            } else {
                segmentContainer = document.createElement('div');
                segmentContainer.className = `data-object-container depth-${currentDepth}`;
                const keyValueList = document.createElement('ul');
                keyValueList.className = 'object-key-value-list';

                objectKeys.forEach(key => {
                    const keyValuePair = document.createElement('li');
                    keyValuePair.className = 'object-key-value-pair';

                    const definitionBlock = document.createElement('dl');
                    definitionBlock.className = 'key-value-definition';

                    const keyLabel = document.createElement('dt');
                    keyLabel.className = 'data-key-label';
                    keyLabel.textContent = escapeHtml(key) + ':';

                    const toggleControl = document.createElement('a');
                    toggleControl.href = '#';
                    toggleControl.className = 'object-toggle-control';
                    toggleControl.textContent = '[-]';
                    keyLabel.appendChild(toggleControl);

                    const valueContent = document.createElement('dd');
                    valueContent.className = 'data-value-content';

                    const itemValue = dataUnit[key];
                    if (typeof itemValue === 'string' || typeof itemValue === 'number' || typeof itemValue === 'boolean') {
                        const valueDisplay = document.createElement('p');
                        valueDisplay.className = 'text-data-representation';
                        valueDisplay.textContent = escapeHtml(itemValue);
                        valueContent.appendChild(valueDisplay);
                    } else if (itemValue === null) {
                        const nullDisplay = document.createElement('p');
                        nullDisplay.className = 'null-data-representation';
                        nullDisplay.textContent = 'null';
                        valueContent.appendChild(nullDisplay);
                    } else {
                        valueContent.appendChild(constructSegment(itemValue, currentDepth + 1));
                    }

                    definitionBlock.appendChild(keyLabel);
                    definitionBlock.appendChild(valueContent);
                    keyValuePair.appendChild(definitionBlock);
                    keyValueList.appendChild(keyValuePair);
                });
                segmentContainer.appendChild(keyValueList);
            }
        } else if (typeof dataUnit === 'string' || typeof dataUnit === 'number' || typeof dataUnit === 'boolean') {
            segmentContainer = document.createElement('p');
            segmentContainer.className = 'text-data-representation';
            segmentContainer.textContent = escapeHtml(dataUnit);
        } else if (dataUnit === null) {
            segmentContainer = document.createElement('p');
            segmentContainer.className = 'null-data-representation';
            segmentContainer.textContent = 'null';
        } else {
            segmentContainer = document.createElement('p');
            segmentContainer.className = 'unknown-data-representation';
            segmentContainer.textContent = String(dataUnit);
        }

        return segmentContainer;
    }

    const mainVisualWrapper = document.createElement('div');
    mainVisualWrapper.className = 'visual-data-tree';
    mainVisualWrapper.appendChild(constructSegment(sourceData, 0));

    targetElement.innerHTML = '';
    targetElement.appendChild(mainVisualWrapper);

    mainVisualWrapper.addEventListener('click', function(evt) {
        const clickedElement = evt.target;
        const isArrayToggle = clickedElement.classList.contains('array-toggle-control');
        const isObjectToggle = clickedElement.classList.contains('object-toggle-control');

        if (isArrayToggle || isObjectToggle) {
            evt.preventDefault();
            evt.stopPropagation();

            let contentToAffect = null;
            let classApplyingElement = null; // Element to apply 'collapsed-' class to
            let typeIdentifier = 'unknown-entry';

            if (isArrayToggle) {
                const arrayEntry = clickedElement.closest('.array-entry');
                if (!arrayEntry) return;

                contentToAffect = arrayEntry.querySelector('.data-array-container, .data-object-container, .text-data-representation, .null-data-representation');
                classApplyingElement = arrayEntry;

                if (!contentToAffect || contentToAffect.classList.contains('text-data-representation') || contentToAffect.classList.contains('null-data-representation')) {
                    clickedElement.textContent = '';
                    return;
                }
                typeIdentifier = contentToAffect.classList.contains('data-array-container') ? 'array-entry' : 'object-entry';

            } else if (isObjectToggle) {
                const keyLabel = clickedElement.closest('.data-key-label');
                if (!keyLabel) return;
                const valueDescription = keyLabel.nextElementSibling;
                if (!valueDescription) return;

                contentToAffect = valueDescription.querySelector('.data-array-container, .data-object-container, .text-data-representation, .null-data-representation');
                classApplyingElement = keyLabel;

                if (!contentToAffect || contentToAffect.classList.contains('text-data-representation') || contentToAffect.classList.contains('null-data-representation')) {
                    clickedElement.textContent = '';
                    return;
                }
                typeIdentifier = contentToAffect.classList.contains('data-array-container') ? 'array-entry' : 'object-entry';
            }

            if (!contentToAffect) return;

            if (contentToAffect.style.display === 'none') {
                contentToAffect.style.display = '';
                clickedElement.textContent = '[-]';
                classApplyingElement.classList.remove(`collapsed-${typeIdentifier}`);
            } else {
                contentToAffect.style.display = 'none';
                clickedElement.textContent = '[+]';
                classApplyingElement.classList.add(`collapsed-${typeIdentifier}`);
            }
        }
    });
}