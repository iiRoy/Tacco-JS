const componentRegistry = new WeakMap();

function setupActionComposer(hostElement, setupOptionsOrQuery) {
    if (typeof setupOptionsOrQuery === 'string' && setupOptionsOrQuery === 'data') {
        const managerInstance = componentRegistry.get(hostElement);
        if (managerInstance) {
            return managerInstance.retrieveFormData();
        }
        return null;
    }

    const config = setupOptionsOrQuery || {};
    let managerInstance = componentRegistry.get(hostElement);

    if (!managerInstance) {
        managerInstance = createFormManager(hostElement, config);
        componentRegistry.set(hostElement, managerInstance);
    }
    return managerInstance;
}

function createFormManager(containerElement, initialConfiguration) {
    let internalState = {
        definitions: initialConfiguration.actions || [],
        actionEntries: []
    };

    const generateUniqueId = () => 'uid_' + Math.random().toString(36).substring(2, 11);

    const locateDefinitionByName = (name) => {
        return internalState.definitions.find(def => def.name === name);
    };

    const constructDomElement = (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        for (const key in attributes) {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key === 'dataAttributes') {
                for (const dataKey in attributes[key]) {
                    element.dataset[dataKey] = attributes[key][dataKey];
                }
            } else {
                element.setAttribute(key, attributes[key]);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        return element;
    };

    const renderInputForParameter = (paramDef, currentParamValue) => {
        const paramWrapper = constructDomElement('div', { className: 'parameter-group' });
        const paramLabel = constructDomElement('label', { textContent: paramDef.label });
        paramWrapper.appendChild(paramLabel);

        let inputControl;
        let nestedParamArea = constructDomElement('div', { className: 'nested-param-zone' });

        if (paramDef.fieldType === 'select') {
            inputControl = constructDomElement('select', { name: paramDef.name });
            paramDef.options.forEach(opt => {
                const optionEl = constructDomElement('option', { textContent: opt.label, value: opt.name });
                if (opt.params) {
                    optionEl.dataset.nestedParamDefs = JSON.stringify(opt.params);
                }
                inputControl.appendChild(optionEl);
            });

            inputControl.value = currentParamValue !== undefined ? currentParamValue : '';

            const handleOptionChange = () => {
                const selectedOption = inputControl.options[inputControl.selectedIndex];
                nestedParamArea.innerHTML = '';
                if (selectedOption && selectedOption.dataset.nestedParamDefs) {
                    const nestedDefs = JSON.parse(selectedOption.dataset.nestedParamDefs);
                    nestedDefs.forEach(nestedDef => {
                        nestedParamArea.appendChild(renderInputForParameter(nestedDef, null));
                    });
                }
            };

            inputControl.addEventListener('change', handleOptionChange);
            if (currentParamValue || inputControl.value) {
                handleOptionChange();
            }

        } else if (paramDef.fieldType === 'text' || paramDef.fieldType === 'numeric') {
            inputControl = constructDomElement('input', { type: 'text', name: paramDef.name });
            if (paramDef.fieldType === 'numeric') {
                inputControl.classList.add('numerical-input');
            }
        } else if (paramDef.fieldType === 'textarea') {
            inputControl = constructDomElement('textarea', { name: paramDef.name, id: 'text_area_' + generateUniqueId() });
        } else {
            inputControl = constructDomElement('input', { type: 'text', name: paramDef.name });
        }

        if (inputControl) {
            inputControl.value = currentParamValue !== undefined ? currentParamValue : '';
            paramWrapper.appendChild(inputControl);
            paramWrapper.appendChild(nestedParamArea);
        }

        return paramWrapper;
    };

    const renderActionBlock = (actionData) => {
        const actionBlockContainer = constructDomElement('div', { className: 'action-item-block', dataAttributes: { actionIdentifier: actionData.id } });
        const actionTypeSelection = constructDomElement('select', { className: 'action-type-dropdown', name: 'action-kind-selector' });

        internalState.definitions.forEach(def => {
            actionTypeSelection.appendChild(
                constructDomElement('option', { textContent: def.label, value: def.name })
            );
        });

        actionTypeSelection.value = actionData.type;

        const parameterFieldArea = constructDomElement('div', { className: 'action-param-zone' });

        const updateParameterFields = () => {
            parameterFieldArea.innerHTML = '';
            const currentActionDef = locateDefinitionByName(actionTypeSelection.value);
            if (currentActionDef && currentActionDef.params) {
                for (const paramKey in currentActionDef.params) {
                    const paramDefinition = currentActionDef.params[paramKey];
                    const paramValue = actionData.parameters[paramKey];
                    parameterFieldArea.appendChild(renderInputForParameter(paramDefinition, paramValue));
                }
            }
            actionBlockContainer.className = `action-item-block ${actionTypeSelection.value}`;
        };

        actionTypeSelection.addEventListener('change', () => {
            actionData.type = actionTypeSelection.value;
            actionData.parameters = {};
            updateParameterFields();
            refreshFullDisplay();
        });

        const removeLink = constructDomElement('a', { href: '#', className: 'remove-item-link', textContent: 'Delete Item' });
        removeLink.addEventListener('click', (e) => {
            e.preventDefault();
            internalState.actionEntries = internalState.actionEntries.filter(item => item.id !== actionData.id);
            refreshFullDisplay();
        });

        actionBlockContainer.appendChild(actionTypeSelection);
        actionBlockContainer.appendChild(parameterFieldArea);
        actionBlockContainer.appendChild(removeLink);

        updateParameterFields();

        return actionBlockContainer;
    };

    const refreshFullDisplay = () => {
        containerElement.innerHTML = '';

        const formMainWrapper = constructDomElement('div', { className: 'dynamic-form-shell' });
        const controlSection = constructDomElement('div', { className: 'form-action-controls' });
        const addNewItemButton = constructDomElement('a', { href: '#', className: 'add-new-item-button', textContent: 'Add New Entry' });

        addNewItemButton.addEventListener('click', (e) => {
            e.preventDefault();
            internalState.actionEntries.push({
                id: generateUniqueId(),
                type: internalState.definitions.length > 0 ? internalState.definitions[0].name : '',
                parameters: {}
            });
            refreshFullDisplay();
        });

        controlSection.appendChild(addNewItemButton);
        formMainWrapper.appendChild(controlSection);

        const itemListContainer = constructDomElement('div', { className: 'entry-list-area' });
        internalState.actionEntries.forEach(item => {
            itemListContainer.appendChild(renderActionBlock(item));
        });
        formMainWrapper.appendChild(itemListContainer);

        containerElement.appendChild(formMainWrapper);
    };

    const retrieveFormData = () => {
        const collectedDataOutput = [];
        const actionBlocks = containerElement.querySelectorAll('.action-item-block');

        actionBlocks.forEach(block => {
            const typeDropdown = block.querySelector('.action-type-dropdown');
            const actionTypeName = typeDropdown ? typeDropdown.value : '';

            const actionResultObject = { name: actionTypeName };
            const collectedParameters = {};

            const recursivelyCollectParameters = (parentDomElement, targetCollection) => {
                const parameterGroups = parentDomElement.querySelectorAll(':scope > .parameter-group');
                parameterGroups.forEach(group => {
                    const inputOrSelect = group.querySelector('input, select, textarea');
                    if (inputOrSelect) {
                        const paramKey = inputOrSelect.name;
                        let paramValue = inputOrSelect.value;

                        if (inputOrSelect.classList.contains('numerical-input')) {
                            paramValue = Number(paramValue);
                        }
                        targetCollection[paramKey] = paramValue;

                        const nestedZone = group.querySelector(':scope > .nested-param-zone');
                        if (nestedZone && nestedZone.children.length > 0) {
                            recursivelyCollectParameters(nestedZone, targetCollection);
                        }
                    }
                });
            };

            const paramZone = block.querySelector('.action-param-zone');
            if (paramZone) {
                recursivelyCollectParameters(paramZone, collectedParameters);
                if (Object.keys(collectedParameters).length > 0) {
                    actionResultObject.params = collectedParameters;
                }
            }
            collectedDataOutput.push(actionResultObject);
        });
        return collectedDataOutput;
    };

    if (initialConfiguration.data && Array.isArray(initialConfiguration.data)) {
        internalState.actionEntries = initialConfiguration.data.map(dataItem => {
            const newEntry = {
                id: generateUniqueId(),
                type: dataItem.name,
                parameters: {}
            };
            if (dataItem.params) {
                Object.assign(newEntry.parameters, dataItem.params);
            }
            return newEntry;
        });
    }

    refreshFullDisplay();

    return {
        retrieveFormData: retrieveFormData
    };
}