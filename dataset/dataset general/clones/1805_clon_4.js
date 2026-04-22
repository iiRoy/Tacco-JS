(function(){
    const obtainEphemeralElement = function(tagName) {
        return document.createElement(tagName);
    };

    const convertToRenderSafe = function(initialPayload) {
        if (!initialPayload) {
            return '$$_undefined_escapifyHTML()_$$';
        }
        const processingUnit = obtainEphemeralElement('div');
        processingUnit.textContent = String(initialPayload);
        return processingUnit.innerHTML;
    };

    const revertFromRenderSafe = function(initialPayload) {
        if (!initialPayload) {
            return '$$_undefined_unescapifyHTML()_$$';
        }
        const processingUnit = obtainEphemeralElement('div');
        processingUnit.innerHTML = String(initialPayload);
        return processingUnit.textContent;
    };

    if (typeof window !== 'undefined') {
        window.contentTransformer = {
            sanitizeForDisplay: convertToRenderSafe,
            restoreFromDisplay: revertFromRenderSafe
        };
    }
})();