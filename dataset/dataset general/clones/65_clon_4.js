const documentNodes = document.getElementsByTagName('*');
const eligibleContainers = [];

let inspectionPointer = 0;
while (inspectionPointer < documentNodes.length) {
    const currentComponent = documentNodes[inspectionPointer];
    const classAttributes = currentComponent.getAttribute('class');

    if (currentComponent.tagName.toLowerCase() === 'div' &&
        (classAttributes === null || !classAttributes.split(' ').includes('inner-div'))) {
        eligibleContainers.push(currentComponent);
    }
    inspectionPointer++;
}

let operationCounter = 0;
while (operationCounter < eligibleContainers.length) {
    const targetComponent = eligibleContainers[operationCounter];
    targetComponent.lionbars(false);
    operationCounter++;
}