const viewportClassIdentifier = 'viewport-tablette';

const actionMap = new Map([
    ['.button-vp-phone', (targetElement) => targetElement.classList.remove(viewportClassIdentifier)],
    ['.button-vp-tablette', (targetElement) => targetElement.classList.add(viewportClassIdentifier)]
]);

document.addEventListener('click', (interactionEvent) => {
    const sourceElement = interactionEvent.target;

    for (const [selectorCriterion, operationExecutor] of actionMap.entries()) {
        if (sourceElement.matches(selectorCriterion)) {
            operationExecutor(document.body);
            break;
        }
    }
});