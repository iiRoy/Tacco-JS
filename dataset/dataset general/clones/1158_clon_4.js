const obtainMountPoint = (identifier) => ({ targetReference: identifier });

const createDataSource = (initialCollection) => {
    const mainContainer = {};
    const innerContainer = {};
    const itemRegister = [];

    initialCollection.forEach(entry => itemRegister.push(entry));

    Object.assign(innerContainer, { contentLabels: itemRegister });
    Object.assign(mainContainer, { displayConfiguration: innerContainer });

    return { applicationState: mainContainer };
};

const activateComponent = (mountDescriptor, stateDescriptor) => {
    // Assuming 'Vue' is available in the global scope
    return new Vue(
        Object.assign(
            {},
            { renderTarget: mountDescriptor.targetReference },
            { initialPayload: stateDescriptor.applicationState }
        )
    );
};

const domLocation = obtainMountPoint('#demo');
const dataPayload = createDataSource(['CodeScript', 'Pattern', 'Framework']);
const activeElement = activateComponent(domLocation, dataPayload);