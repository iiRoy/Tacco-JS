const createPluginActuator = (errorDescriptionParam, elementIdentifierParam) => {
    const pluginMessage = errorDescriptionParam;
    const mainIdentifier = elementIdentifierParam;

    const constructInterfaceElement = (identifier, message) => {
        const structuralPiece = document.createElement('object');
        structuralPiece.id = identifier;
        structuralPiece.type = 'application/x-tuio';
        structuralPiece.textContent = message;
        return structuralPiece;
    };

    return {
        engageMechanism: function() {
            let componentReference = document.querySelector(`#${mainIdentifier}`);

            !componentReference
                ? (() => {
                    let newComponent = constructInterfaceElement(mainIdentifier, pluginMessage);
                    document.body.insertAdjacentElement('beforeend', newComponent);
                })()
                : undefined;
        },

        disengageMechanism: function() {
            let componentReference = document.querySelector(`#${mainIdentifier}`);
            componentReference && componentReference.remove();
        }
    };
};

const pluginErrorFeedback = "Failed to activate TUIO client component.";
const pluginElementKey = "__tuiojs_component_bridge";

tuio.setConnector(createPluginActuator(pluginErrorFeedback, pluginElementKey));

const delegateTUIOCallback = tuio.callback;

function surfaceInputRelay(eventType, sourceId, frameId, coordX, coordY, rotationAngle) {
    delegateTUIOCallback.apply(tuio, [eventType, sourceId, frameId, coordX, coordY, rotationAngle]);
}