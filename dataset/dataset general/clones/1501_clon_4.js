const acquireInternationalizationBundle = function() {

    const componentData = [
        { itemType: 'button', identifier: 'bold', properties: { description: 'Bold' } },
        { itemType: 'button', identifier: 'italic', properties: { description: 'Itálico' } },
        { itemType: 'button', identifier: 'link', properties: { description: 'Insertar hipervínculo' } },
        { itemType: 'button', identifier: 'image', properties: { description: 'Insertar imagen' } },
        { itemType: 'button', identifier: 'code', properties: { description: 'Ejemplo de código' } },
        { itemType: 'button', identifier: 'quote', properties: { description: 'Blockquote' } },
        { itemType: 'button', identifier: 'numberlist', properties: { description: 'Lista numerada' } },
        { itemType: 'button', identifier: 'bulletlist', properties: { description: 'Lista con viñetas' } },
        { itemType: 'button', identifier: 'line', properties: { description: 'Línea horizontal' } },
        { itemType: 'button', identifier: 'heading', properties: { description: 'Denominación' } },
        { itemType: 'button', identifier: 'edit', properties: { label: 'Redactar', description: 'Ver en modo de edición' } },
        { itemType: 'button', identifier: 'preview', properties: { label: 'Prevista', description: 'Ver en modo de vista preliminar' } },
        { itemType: 'dialog', identifier: 'insertLink', properties: { header: 'Insertar hipervínculo', instructions: 'Escriba la dirección URL que desee insertar.', confirmAction: 'Insertar', cancelAction: 'Cancelar' } },
        { itemType: 'dialog', identifier: 'insertImage', properties: { header: 'Insertar imagen', instructions: 'Introduzca la dirección URL de la imagen que desee insertar.', confirmAction: 'Insertar', cancelAction: 'Cancelar' } }
    ];

    const processedLocalizationPack = componentData.reduce((accumulatedResult, currentElement) => {
        if (currentElement.itemType === 'button') {
            if (!accumulatedResult.defaultButtons) {
                accumulatedResult.defaultButtons = {};
            }
            const buttonConfiguration = {};
            if (currentElement.properties.label) {
                buttonConfiguration.text = currentElement.properties.label;
            }
            buttonConfiguration.tip = currentElement.properties.description;
            accumulatedResult.defaultButtons[currentElement.identifier] = buttonConfiguration;
        } else if (currentElement.itemType === 'dialog') {
            if (!accumulatedResult.dialog) {
                accumulatedResult.dialog = {};
            }
            accumulatedResult.dialog[currentElement.identifier] = {
                title: currentElement.properties.header,
                helpText: currentElement.properties.instructions,
                insertButton: currentElement.properties.confirmAction,
                cancelButton: currentElement.properties.cancelAction
            };
        }
        return accumulatedResult;
    }, {});

    return processedLocalizationPack;
}();