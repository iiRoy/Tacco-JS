class BlurInputHandler {
    constructor(hostInput, dataContainer, propertyIdentifier, transformationHook = (v) => v) {
        this.inputElement = hostInput;
        this.dataStore = dataContainer;
        this.propertyKey = propertyIdentifier;
        this.conversionFunction = transformationHook;
        this.inputElement.addEventListener('blur', this.onFocusLost.bind(this));
    }

    onFocusLost() {
        const revisedValue = this.conversionFunction(this.inputElement.value);
        if (this.dataStore[this.propertyKey] !== revisedValue) {
            this.dataStore[this.propertyKey] = revisedValue;
        }
    }
}

const entityClassifier = (() => {
    const mapDesignation = "ObjectMap";
    const listDesignation = "ValueList";
    const logicalDesignation = "LogicalState";
    const literalDesignation = "RawValue";

    const categorize = (target) => {
        const internalClassification = Object.prototype.toString.call(target);
        if (internalClassification === "[object Object]") return mapDesignation;
        if (internalClassification === "[object Array]") return listDesignation;
        if (internalClassification === "[object Boolean]") return logicalDesignation;
        return literalDesignation;
    };

    const isNumericString = (val) => !isNaN(parseFloat(val)) && isFinite(val);

    const convertToNumberIfPossible = (val) => isNumericString(val) ? parseFloat(val) : val;

    return {
        categorize,
        isNumericString,
        convertToNumberIfPossible,
        mapDesignation,
        listDesignation,
        logicalDesignation,
        literalDesignation
    };
})();

class HierarchicalDataPresenter {
    constructor(initialDataPackage, renderingConfiguration, targetDOMContainer) {
        this.sourceData = initialDataPackage;
        this.componentConfiguration = renderingConfiguration;
        this.renderHost = targetDOMContainer;

        this.internalManagement = {
            isFolded: this.componentConfiguration.initialFoldedState !== undefined ? this.componentConfiguration.initialFoldedState : false,
            foldingGlyph: "",
            newIdentifierInput: "",
            newValueInput: "",
            selectedKindForAddition: entityClassifier.literalDesignation,
            showEntryCreationPanel: false,
            draggedSourceIndex: -1,
            dropDestinationIndex: -1
        };

        this.availableEntryDesignations = [
            entityClassifier.literalDesignation,
            entityClassifier.mapDesignation,
            entityClassifier.listDesignation,
            entityClassifier.logicalDesignation,
            "SpecialPointerType"
        ];

        this.reactiveDataSource = this.createObservableData(this.sourceData);
        this.refreshFoldingGlyph();
        this.drawComponent();
    }

    createObservableData(dataEntity) {
        const currentInstance = this;
        return new Proxy(dataEntity, {
            set(target, attribute, incomingValue) {
                target[attribute] = incomingValue;
                currentInstance.drawComponent();
                return true;
            },
            deleteProperty(target, attribute) {
                const successfullyDeleted = delete target[attribute];
                if (successfullyDeleted) {
                    currentInstance.drawComponent();
                }
                return successfullyDeleted;
            }
        });
    }

    refreshFoldingGlyph() {
        this.internalManagement.foldingGlyph = this.internalManagement.isFolded ? "chevron-right-icon" : "chevron-down-icon";
    }

    toggleDisplayState() {
        this.internalManagement.isFolded = !this.internalManagement.isFolded;
        this.refreshFoldingGlyph();
        this.drawComponent();
    }

    relabelObjectProperty(previousKey, nextKey) {
        if (previousKey === nextKey || !nextKey) return;
        if (this.sourceData.hasOwnProperty(nextKey)) {
            if (!confirm(`An item with identifier "${nextKey}" already exists. Overwrite it?`)) {
                this.drawComponent();
                return;
            }
        }
        const temporaryValue = this.reactiveDataSource[previousKey];
        delete this.reactiveDataSource[previousKey];
        this.reactiveDataSource[nextKey] = temporaryValue;
    }

    removeDataEntry(keyOrPosition) {
        const currentEntityKind = entityClassifier.categorize(this.reactiveDataSource);
        let confirmationPrompt = '';

        if (currentEntityKind === entityClassifier.mapDesignation) {
            confirmationPrompt = `Delete "${keyOrPosition}" and all its contents?`;
        } else if (currentEntityKind === entityClassifier.listDesignation) {
            confirmationPrompt = `Delete item at position ${keyOrPosition}?`;
        } else {
            console.error("Removal not supported for this data entity type.");
            return;
        }

        if (confirm(confirmationPrompt)) {
            if (currentEntityKind === entityClassifier.mapDesignation) {
                delete this.reactiveDataSource[keyOrPosition];
            } else if (currentEntityKind === entityClassifier.listDesignation) {
                this.reactiveDataSource.splice(keyOrPosition, 1);
                this.drawComponent();
            }
        } else {
            this.drawComponent();
        }
    }

    performEntryAddition() {
        const currentEntityKind = entityClassifier.categorize(this.reactiveDataSource);
        let newEntryContent;

        switch (this.internalManagement.selectedKindForAddition) {
            case entityClassifier.literalDesignation:
                newEntryContent = entityClassifier.convertToNumberIfPossible(this.internalManagement.newValueInput || "");
                break;
            case entityClassifier.mapDesignation:
                newEntryContent = {};
                break;
            case entityClassifier.listDesignation:
                newEntryContent = [];
                break;
            case entityClassifier.logicalDesignation:
                newEntryContent = false;
                break;
            case "SpecialPointerType":
                newEntryContent = {"PointerReference": "to_be_resolved"};
                break;
            default:
                newEntryContent = "";
        }

        if (currentEntityKind === entityClassifier.mapDesignation) {
            const entryKey = this.internalManagement.newIdentifierInput;
            if (!entryKey) {
                alert("Please specify an identifier for the new entry.");
                return;
            }
            if (entryKey.startsWith("$") || entryKey.startsWith("_")) {
                alert("Identifier cannot begin with '$' or '_'.");
                return;
            }
            if (this.reactiveDataSource.hasOwnProperty(entryKey)) {
                if (!confirm(`An item with identifier "${entryKey}" already exists. Overwrite it?`)) {
                    return;
                }
            }
            this.reactiveDataSource[entryKey] = newEntryContent;
        } else if (currentEntityKind === entityClassifier.listDesignation) {
            this.reactiveDataSource.push(newEntryContent);
            this.drawComponent();
        } else {
            console.error("Addition of entries is not supported for this data type.");
            return;
        }

        this.internalManagement.newIdentifierInput = "";
        this.internalManagement.newValueInput = "";
        this.internalManagement.showEntryCreationPanel = false;
        this.drawComponent();
    }

    createDOMElement(tagName, cssClasses = [], attributes = {}, content = '') {
        const element = document.createElement(tagName);
        if (cssClasses.length) element.className = cssClasses.join(' ');
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
        if (content) element.textContent = content;
        return element;
    }

    createFoldingControl() {
        const controlIcon = this.createDOMElement('i', ['data-structure-control', this.internalManagement.foldingGlyph]);
        controlIcon.addEventListener('click', this.toggleDisplayState.bind(this));
        return controlIcon;
    }

    createDescriptionLabel() {
        const description = this.createDOMElement('span', ['data-structure-label'], {}, this.componentConfiguration.dataKind);
        return description;
    }

    generateValueField(currentValue, valueIdentifier, parentContainer) {
        const classification = entityClassifier.categorize(currentValue);
        let fieldElement;

        if (classification === entityClassifier.mapDesignation || classification === entityClassifier.listDesignation) {
            fieldElement = this.createDOMElement('div', ['nested-data-field']);
            new HierarchicalDataPresenter(currentValue, {
                dataKind: classification,
                initialFoldedState: this.componentConfiguration.initialFoldedState
            }, fieldElement);
        } else if (classification === entityClassifier.logicalDesignation) {
            fieldElement = this.createDOMElement('span', ['logical-field']);
            const toggleBox = this.createDOMElement('input', [], { type: 'checkbox' });
            toggleBox.checked = currentValue;
            toggleBox.addEventListener('change', (event) => {
                parentContainer[valueIdentifier] = event.target.checked;
            });
            fieldElement.appendChild(toggleBox);
        } else {
            fieldElement = this.createDOMElement('span', ['literal-field']);
            const valueInput = this.createDOMElement('input', ['field-text-input'], { type: 'text', placeholder: 'Empty' });
            valueInput.value = String(currentValue);
            new BlurInputHandler(valueInput, parentContainer, valueIdentifier, entityClassifier.convertToNumberIfPossible);
            fieldElement.appendChild(valueInput);
        }
        return fieldElement;
    }

    createEntryAdditionPanel() {
        const panelContainer = this.createDOMElement('div', ['entry-addition-panel']);
        const activationButton = this.createDOMElement('button', ['add-entry-trigger']);
        activationButton.innerHTML = '<i class="plus-icon"></i>';
        activationButton.addEventListener('click', () => {
            this.internalManagement.showEntryCreationPanel = true;
            this.drawComponent();
        });

        if (!this.internalManagement.showEntryCreationPanel) {
            panelContainer.appendChild(activationButton);
            return panelContainer;
        }

        const inputSection = this.createDOMElement('div', ['entry-input-section']);

        if (this.componentConfiguration.dataKind === entityClassifier.mapDesignation) {
            const identifierInput = this.createDOMElement('input', ['entry-key-input'], { type: 'text', placeholder: 'Identifier' });
            identifierInput.value = this.internalManagement.newIdentifierInput;
            identifierInput.addEventListener('input', (e) => this.internalManagement.newIdentifierInput = e.target.value);
            identifierInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.performEntryAddition(); });
            inputSection.appendChild(identifierInput);
        }

        const typeSelector = this.createDOMElement('select', ['entry-type-selector']);
        this.availableEntryDesignations.forEach(kind => {
            const option = this.createDOMElement('option', [], { value: kind }, kind);
            if (kind === this.internalManagement.selectedKindForAddition) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });
        typeSelector.addEventListener('change', (e) => {
            this.internalManagement.selectedKindForAddition = e.target.value;
            this.drawComponent();
        });
        inputSection.appendChild(typeSelector);

        if (this.internalManagement.selectedKindForAddition === entityClassifier.literalDesignation) {
            const valueInputField = this.createDOMElement('input', ['entry-value-input'], { type: 'text', placeholder: 'Value' });
            valueInputField.value = this.internalManagement.newValueInput;
            valueInputField.addEventListener('input', (e) => this.internalManagement.newValueInput = e.target.value);
            valueInputField.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.performEntryAddition(); });
            inputSection.appendChild(this.createDOMElement('span', [], {}, ': '));
            inputSection.appendChild(valueInputField);
        }

        const confirmButton = this.createDOMElement('button', ['action-button', 'confirm-add'], {}, 'Add');
        confirmButton.addEventListener('click', this.performEntryAddition.bind(this));
        inputSection.appendChild(confirmButton);

        const abortButton = this.createDOMElement('button', ['action-button', 'cancel-add'], {}, 'Cancel');
        abortButton.addEventListener('click', () => {
            this.internalManagement.showEntryCreationPanel = false;
            this.internalManagement.newIdentifierInput = "";
            this.internalManagement.newValueInput = "";
            this.drawComponent();
        });
        inputSection.appendChild(abortButton);

        panelContainer.appendChild(inputSection);
        return panelContainer;
    }

    configureListDragAndDrop(itemNode, itemPosition) {
        itemNode.setAttribute('draggable', 'true');
        itemNode.addEventListener('dragstart', (e) => {
            this.internalManagement.draggedSourceIndex = itemPosition;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', itemPosition);
            itemNode.classList.add('is-dragging');
        });

        itemNode.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (this.internalManagement.draggedSourceIndex !== itemPosition) {
                itemNode.classList.add('drag-over-target');
            }
        });

        itemNode.addEventListener('dragleave', () => {
            itemNode.classList.remove('drag-over-target');
        });

        itemNode.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        itemNode.addEventListener('drop', (e) => {
            e.preventDefault();
            itemNode.classList.remove('drag-over-target');
            this.internalManagement.dropDestinationIndex = itemPosition;

            if (this.internalManagement.draggedSourceIndex !== -1 && this.internalManagement.dropDestinationIndex !== -1 &&
                this.internalManagement.draggedSourceIndex !== this.internalManagement.dropDestinationIndex) {
                const [relocatedItem] = this.reactiveDataSource.splice(this.internalManagement.draggedSourceIndex, 1);
                this.reactiveDataSource.splice(this.internalManagement.dropDestinationIndex, 0, relocatedItem);
                this.drawComponent();
            }
            this.internalManagement.draggedSourceIndex = -1;
            this.internalManagement.dropDestinationIndex = -1;
        });

        itemNode.addEventListener('dragend', () => {
            itemNode.classList.remove('is-dragging');
            this.renderHost.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
            this.internalManagement.draggedSourceIndex = -1;
            this.internalManagement.dropDestinationIndex = -1;
        });
    }

    drawComponent() {
        this.renderHost.innerHTML = '';

        const componentWrapper = this.createDOMElement('div', ['data-structure-wrapper']);

        if (this.componentConfiguration.dataKind === entityClassifier.mapDesignation || this.componentConfiguration.dataKind === entityClassifier.listDesignation) {
            componentWrapper.appendChild(this.createFoldingControl());
            componentWrapper.appendChild(this.createDescriptionLabel());
        }

        const contentSection = this.createDOMElement('div', ['data-structure-section']);
        if (this.internalManagement.isFolded) {
            contentSection.style.display = 'none';
        }

        if (this.componentConfiguration.dataKind === entityClassifier.mapDesignation) {
            Object.keys(this.reactiveDataSource).forEach(key => {
                if (key.startsWith('_')) return;

                const propertyRow = this.createDOMElement('div', ['object-property-row']);

                const propertyKeyContainer = this.createDOMElement('span', ['object-property-key']);
                const keyRenameInput = this.createDOMElement('input', ['key-edit-input'], { type: 'text' });
                keyRenameInput.value = key;
                keyRenameInput.addEventListener('blur', (e) => this.relabelObjectProperty(key, e.target.value));
                keyRenameInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') e.target.blur(); });
                propertyKeyContainer.appendChild(keyRenameInput);

                const removeButton = this.createDOMElement('i', ['remove-entry-icon', 'trash-icon']);
                removeButton.addEventListener('click', () => this.removeDataEntry(key));
                propertyKeyContainer.appendChild(removeButton);

                propertyRow.appendChild(propertyKeyContainer);

                const propertyValueContainer = this.createDOMElement('span', ['object-property-value']);
                propertyValueContainer.appendChild(this.generateValueField(this.reactiveDataSource[key], key, this.reactiveDataSource));
                propertyRow.appendChild(propertyValueContainer);

                contentSection.appendChild(propertyRow);
            });
        } else if (this.componentConfiguration.dataKind === entityClassifier.listDesignation) {
            const dataList = this.createDOMElement('ol', ['array-data-list']);
            this.reactiveDataSource.forEach((item, index) => {
                const listItem = this.createDOMElement('li', ['array-data-item']);

                const removeButton = this.createDOMElement('i', ['remove-entry-icon', 'trash-icon']);
                removeButton.addEventListener('click', () => this.removeDataEntry(index));
                listItem.appendChild(removeButton);

                const dragHandle = this.createDOMElement('i', ['list-item-drag-handle', 'reorder-icon']);
                listItem.appendChild(dragHandle);

                listItem.appendChild(this.generateValueField(item, index, this.reactiveDataSource));

                this.configureListDragAndDrop(listItem, index);
                dataList.appendChild(listItem);
            });
            contentSection.appendChild(dataList);
        }

        if (this.componentConfiguration.dataKind === entityClassifier.mapDesignation || this.componentConfiguration.dataKind === entityClassifier.listDesignation) {
            contentSection.appendChild(this.createEntryAdditionPanel());
        }

        componentWrapper.appendChild(contentSection);
        this.renderHost.appendChild(componentWrapper);
    }
}

function initializeDataStructureEditor(targetElementIdentifier, initialSourceData, initialDisplayFolded = false) {
    const targetElement = document.getElementById(targetElementIdentifier);
    if (!targetElement) {
        console.error(`DOM element with ID "${targetElementIdentifier}" was not located.`);
        return;
    }

    const dataClassification = entityClassifier.categorize(initialSourceData);
    if (dataClassification !== entityClassifier.mapDesignation && dataClassification !== entityClassifier.listDesignation) {
        console.error("Initial data must be an object map or a value list.");
        return;
    }

    new HierarchicalDataPresenter(initialSourceData, {
        dataKind: dataClassification,
        initialFoldedState: initialDisplayFolded
    }, targetElement);
}