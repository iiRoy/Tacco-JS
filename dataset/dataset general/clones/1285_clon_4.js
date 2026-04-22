const buildDropdownNavigator = (targetNodes, settingsBundle = {}) => {

    const baseDefaults = {
        selectorQuery: "nav",
        flattenHierarchy: true,

        encaseOutput: true,
        enclosingTag: "nav",
        enclosingStyle: "adaptive-navigator-frame",
        enclosingKey: "",

        dropdownStyle: "adaptive-selector",
        dropdownKey: "",

        placeholderText: "Select a destination...",

        categorizeItems: true,
        categoryLabelAttribute: "label",
        categoryOrderAttribute: "order"
    };

    const activeSettings = Object.assign({}, baseDefaults, settingsBundle);

    const sortCategories = (firstElement, secondElement) => {
        const orderA = parseInt(firstElement.dataset[activeSettings.categoryOrderAttribute], 10);
        const orderB = parseInt(secondElement.dataset[activeSettings.categoryOrderAttribute], 10);

        if ((Number.isNaN(orderA) && Number.isNaN(orderB)) || orderA === orderB) {
            return 0;
        } else if (Number.isNaN(orderB) || orderA < orderB) {
            return -1;
        }
        return 1;
    };

    const createOptionElement = (linkNode) => {
        const choiceEntry = document.createElement("option");
        choiceEntry.value = linkNode.getAttribute("href");
        choiceEntry.textContent = linkNode.textContent;
        return choiceEntry;
    };

    const createOptgroupElement = (label, order, options) => {
        const categoryNode = document.createElement("optgroup");
        categoryNode.label = label;
        categoryNode.dataset[activeSettings.categoryOrderAttribute] = order;
        options.forEach(optionElement => categoryNode.appendChild(optionElement));
        return categoryNode;
    };

    Array.from(targetNodes).forEach(processingContainer => {
        let navigationBlocks = Array.from(processingContainer.querySelectorAll(activeSettings.selectorQuery));
        let assembledElements = [];
        let dropdownElement;

        if (navigationBlocks.length === 0) {
            return;
        }

        const userExplicitlySetCategorize = settingsBundle.categorizeItems !== undefined;
        if (navigationBlocks.length === 1 && !userExplicitlySetCategorize) {
            activeSettings.categorizeItems = false;
        }

        if (activeSettings.flattenHierarchy) {
            navigationBlocks.forEach(currentBlock => {
                Array.from(currentBlock.querySelectorAll(activeSettings.selectorQuery))
                    .forEach(nestedBlock => {
                        if (currentBlock.contains(nestedBlock)) {
                             currentBlock.removeChild(nestedBlock);
                             processingContainer.appendChild(nestedBlock);
                        }
                    });
            });
            navigationBlocks = Array.from(processingContainer.querySelectorAll(activeSettings.selectorQuery));
        }

        assembledElements = navigationBlocks.flatMap(currentBlock => {
            const blockOptions = Array.from(currentBlock.querySelectorAll("a"))
                                    .map(createOptionElement);

            if (activeSettings.categorizeItems) {
                const categoryLabel = currentBlock.dataset[activeSettings.categoryLabelAttribute] || '';
                const categoryOrder = currentBlock.dataset[activeSettings.categoryOrderAttribute] || '';
                return [createOptgroupElement(categoryLabel, categoryOrder, blockOptions)];
            } else {
                return blockOptions;
            }
        });

        if (activeSettings.categorizeItems) {
            assembledElements.sort(sortCategories);
        }

        dropdownElement = document.createElement("select");
        dropdownElement.classList.add(activeSettings.dropdownStyle);
        if (activeSettings.dropdownKey) {
            dropdownElement.id = activeSettings.dropdownKey;
        }

        const promptOption = document.createElement("option");
        promptOption.textContent = activeSettings.placeholderText;
        promptOption.disabled = true;
        dropdownElement.appendChild(promptOption);

        assembledElements.forEach(item => {
            dropdownElement.appendChild(item);
        });

        dropdownElement.addEventListener("change", (event) => {
            window.location.href = event.target.value;
        });

        if (activeSettings.encaseOutput) {
            const encapsulationElement = document.createElement(activeSettings.enclosingTag);
            encapsulationElement.classList.add(activeSettings.enclosingStyle);
            if (activeSettings.enclosingKey) {
                encapsulationElement.id = activeSettings.enclosingKey;
            }
            encapsulationElement.appendChild(dropdownElement);
            processingContainer.appendChild(encapsulationElement);
        } else {
            processingContainer.appendChild(dropdownElement);
        }
    });
};