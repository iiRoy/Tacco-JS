"use strict";

const informationDepot = (function() {
    const dataContainers = new Map();

    function establishContainer(designation, dataSupplier) {
        if (typeof dataSupplier === 'function') {
            dataContainers.set(designation, dataSupplier);
        } else {
            console.error('Data supplier must be a function.');
        }
    }

    function retrieveContainerData(designation) {
        const supplier = dataContainers.get(designation);
        return supplier ? supplier() : null;
    }

    return {
        establishContainer: establishContainer,
        retrieveContainerData: retrieveContainerData
    };
})();

informationDepot.establishContainer("mainDisplayUnit", () => ({ displayTitle: "Main Display" }));
informationDepot.establishContainer("secondaryDisplayUnit", () => ({ displayTitle: "Secondary Display" }));
informationDepot.establishContainer("tertiaryDisplayUnit", () => ({ displayTitle: "Tertiary Display" }));

const applicationKernel = (function() {
    const registeredOperations = new Map();

    function registerOperation(operationAlias, operationDefinition) {
        registeredOperations.set(operationAlias, operationDefinition);
    }

    function getOperation(operationAlias) {
        return registeredOperations.get(operationAlias);
    }

    return {
        registerOperation: registerOperation,
        getOperation: getOperation
    };
})();

applicationKernel.registerOperation("headerNavigator", function() {
    return {
        modifyStructure: function(parentComponent, componentConfiguration) {
            const currentSelectionMark = componentConfiguration.activeFocus;
            if (!currentSelectionMark) {
                return;
            }

            const navItems = parentComponent.querySelectorAll("[data-nav-group] > li");

            Array.from(navItems).forEach(function(listItem) {
                const anchorElements = listItem.querySelectorAll("a");

                if (anchorElements.length > 0 && anchorElements[0].textContent === currentSelectionMark) {
                    listItem.classList.add("activated");
                }
            });
        }
    };
});

(function() {
    document.addEventListener("DOMContentLoaded", function() {
        const targetElements = document.querySelectorAll('[data-process-as="headerNavigator"]');

        targetElements.forEach(function(targetElement) {
            const operationFactory = applicationKernel.getOperation("headerNavigator");
            if (operationFactory) {
                const operationInstance = operationFactory();

                const componentConfiguration = {
                    activeFocus: targetElement.getAttribute("data-active-focus")
                };

                operationInstance.modifyStructure(targetElement, componentConfiguration);
            }
        });
    });
})();