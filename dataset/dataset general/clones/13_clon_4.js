const browserAttributeSupportVerifier = (() => {
    const assembleElements = (markupString) => {
        const temporaryContainer = document.createElement('section');
        temporaryContainer.innerHTML = markupString;
        return Array.from(temporaryContainer.children);
    };

    const determinePropertyAvailability = (targetElement, propertyKey) => {
        return typeof targetElement[propertyKey] !== 'undefined';
    };

    const evaluateAttributeReadiness = () => {
        const [mainField, textInput] = assembleElements('<input data-type-id="entry"/><textarea data-type-id="narrative"></textarea>');

        const mainFieldSupport = determinePropertyAvailability(mainField, 'placeholder');
        const textInputSupport = determinePropertyAvailability(textInput, 'placeholder');

        return mainFieldSupport && textInputSupport;
    };

    return {
        queryFeature: evaluateAttributeReadiness
    };
})();