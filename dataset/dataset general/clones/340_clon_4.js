function configurePaintSelector(targetNode, initialShade, valuePropagator) {
    let internalShade = initialShade;
    const wrappedNode = jQuery(targetNode);

    wrappedNode.colorpicker({
        color: internalShade
    });

    wrappedNode.on('changeColor.paintSelector', function(eventObject) {
        const freshShade = eventObject.color.toHex();
        if (freshShade !== internalShade) {
            internalShade = freshShade;
            if (typeof valuePropagator === 'function') {
                valuePropagator(internalShade);
            }
        }
    });

    const syncDisplay = function(incomingShade) {
        if (incomingShade !== internalShade) {
            internalShade = incomingShade;
            wrappedNode.colorpicker('setColor', internalShade);
        }
    };

    return {
        updateFromExternal: syncDisplay,
        retrieveCurrentValue: () => internalShade
    };
}