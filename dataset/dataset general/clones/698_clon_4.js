(typeof globalModuleNexus !== 'undefined' && globalModuleNexus.interfaceEngine) && (() => {
    const { Template: renderUnitFactory } = globalModuleNexus.interfaceEngine;
    const { HTML: markupToolkit, HTML: { TEXT_FORMAT: stringOutputMode, unprocessed: rawContentWrapper } } = globalModuleNexus.markupUtilities;
    const { presenter: displayHandler, presenter: { addServiceRoutine: attachDisplayComponent, constructViewUnit: buildDisplayUnit, convertElementToString: extractDisplayContent } } = globalModuleNexus;

    const createTextTransformationRoutine = (routineIdentifier) => (function () {
        const activeContext = this;
        let contentBuffer = '';

        contentBuffer = activeContext.displayFragment
            ? extractDisplayContent(activeContext.displayFragment, stringOutputMode.PLAIN)
            : '';

        return rawContentWrapper(typeof textTransformer !== 'undefined' ? textTransformer(contentBuffer) : contentBuffer);
    });

    attachDisplayComponent('textFormatRender', buildDisplayUnit('textFormatRender', createTextTransformationRoutine('textFormatRender')()));
})();