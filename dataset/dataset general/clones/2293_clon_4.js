function applyVariableDimensions(elementsToModify, ...sizeParameters) {
    elementsToModify.forEach(item => {
        // This function would contain the specific logic to apply
        // variable dimensions based on 'sizeParameters' to each 'item'.
        // For example, setting data attributes or inline styles.
    });
}

function applyUniformDimensions(elementsToModify) {
    elementsToModify.forEach(item => {
        // This function would contain the specific logic to apply
        // uniform dimensions to each 'item'.
    });
}

const dimensionAssignments = [
    {
        targets: '.outer#first .line',
        operation: applyVariableDimensions,
        args: [3, 9]
    },
    {
        targets: '.outer#second .line, .outer#third .line',
        operation: applyUniformDimensions,
        args: []
    },
    {
        targets: '.outer#fourth .line',
        operation: applyVariableDimensions,
        args: [3, 4, 5]
    }
];

function initiateDimensionAdjustments() {
    dimensionAssignments.forEach(assignment => {
        const selectedElements = document.querySelectorAll(assignment.targets);
        if (selectedElements.length > 0) {
            assignment.operation(selectedElements, ...assignment.args);
        }
    });
}

document.addEventListener('DOMContentLoaded', initiateDimensionAdjustments);