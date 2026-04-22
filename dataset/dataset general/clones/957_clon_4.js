(function() {
    class DataStructurePresenter {
        constructor(inputStructure, configurationOptions) {
            this.currentSettings = Object.assign({
                destinationElement: 'body',
                mainElementId: 'structure_display_root',
                enableCollapsing: false
            }, configurationOptions);

            this.buildVisualRepresentation(inputStructure);
        }

        buildVisualRepresentation(dataModel) {
            const targetHost = document.querySelector(this.currentSettings.destinationElement);
            if (!targetHost) {
                console.error('Display target not found:', this.currentSettings.destinationElement);
                return;
            }

            const primaryContainer = document.createElement('ul');
            primaryContainer.id = this.currentSettings.mainElementId;
            primaryContainer.classList.add('data-structure-presenter');

            for (const [topLevelKey, topLevelValue] of Object.entries(dataModel)) {
                const itemNode = this.constructDataNode(topLevelKey, topLevelValue);
                primaryContainer.appendChild(itemNode);
            }

            targetHost.appendChild(primaryContainer);

            if (this.currentSettings.enableCollapsing) {
                this.activateInteractiveToggles(primaryContainer);
            }
        }

        constructDataNode(nodeKeyName, nodeValueContent, isArrayEntry = false) {
            const entryElement = document.createElement('li');

            if (isArrayEntry && (typeof nodeValueContent !== 'object' || nodeValueContent === null)) {
                // For primitive array elements, just display the value
                const valueDisplay = document.createElement('span');
                this.assignValueFormatting(valueDisplay, nodeValueContent);
                entryElement.appendChild(valueDisplay);
            } else {
                // For non-primitive array elements or any object/top-level entry, show the key
                const keyDisplay = document.createElement('span');
                keyDisplay.classList.add('display-key');
                keyDisplay.textContent = (isArrayEntry ? '' : nodeKeyName + ': '); // Empty string for array object/array entries
                entryElement.appendChild(keyDisplay);

                if (nodeValueContent === null) {
                    const valueDisplay = document.createElement('span');
                    valueDisplay.classList.add('display-value-null');
                    valueDisplay.textContent = 'null';
                    entryElement.appendChild(valueDisplay);
                } else if (typeof nodeValueContent === 'object') {
                    const isContentArray = Array.isArray(nodeValueContent);
                    const openingSymbol = document.createElement('span');
                    openingSymbol.classList.add('display-symbol');
                    openingSymbol.textContent = isContentArray ? '[' : '{';
                    entryElement.appendChild(openingSymbol);

                    const childContainer = document.createElement('ul');
                    childContainer.classList.add('nested-data-container');

                    if (Object.keys(nodeValueContent).length > 0) {
                        for (const [childKeyName, childValueContent] of Object.entries(nodeValueContent)) {
                            const childNode = this.constructDataNode(childKeyName, childValueContent, isContentArray);
                            childContainer.appendChild(childNode);
                        }
                    } else {
                        // Empty object or array, ensure braces appear on the same line
                        childContainer.style.display = 'inline-block';
                        childContainer.style.width = '0';
                    }
                    entryElement.appendChild(childContainer);

                    const closingSymbol = document.createElement('span');
                    closingSymbol.classList.add('display-symbol');
                    closingSymbol.textContent = isContentArray ? ']' : '}';
                    entryElement.appendChild(closingSymbol);

                } else { // Primitive value (string, number, boolean)
                    const valueDisplay = document.createElement('span');
                    this.assignValueFormatting(valueDisplay, nodeValueContent);
                    entryElement.appendChild(valueDisplay);
                }
            }
            return entryElement;
        }

        assignValueFormatting(targetElement, value) {
            if (typeof value === 'string') {
                targetElement.classList.add('display-value-string');
                targetElement.textContent = `"${value}"`;
            } else if (typeof value === 'number') {
                targetElement.classList.add('display-value-number');
                targetElement.textContent = value;
            } else if (typeof value === 'boolean') {
                targetElement.classList.add('display-value-boolean');
                targetElement.textContent = value;
            } else {
                targetElement.textContent = String(value); // Fallback for undefined, etc.
            }
        }

        activateInteractiveToggles(rootDisplayElement) {
            rootDisplayElement.querySelectorAll('li > .nested-data-container').forEach(subList => {
                const parentListItem = subList.parentNode;
                const openingSymbolElement = parentListItem.querySelector('.display-symbol');
                
                if (openingSymbolElement) {
                    const toggleControl = document.createElement('span');
                    toggleControl.classList.add('structure-toggle');
                    toggleControl.classList.add('interactive-link');
                    toggleControl.textContent = ' + '; // Start in collapsed state

                    // Insert the toggle control right after the opening brace/bracket
                    openingSymbolElement.parentNode.insertBefore(toggleControl, openingSymbolElement.nextSibling);

                    subList.classList.add('hidden-content'); // Apply initial collapse state

                    toggleControl.addEventListener('click', () => {
                        if (subList.classList.contains('hidden-content')) {
                            subList.classList.remove('hidden-content');
                            toggleControl.textContent = ' - ';
                        } else {
                            subList.classList.add('hidden-content');
                            toggleControl.textContent = ' + ';
                        }
                    });
                }
            });
        }
    }

    window.StructureVisualizer = {
        render: function(dataToVisualize, visualizationOptions) {
            new DataStructurePresenter(dataToVisualize, visualizationOptions);
        }
    };
})();