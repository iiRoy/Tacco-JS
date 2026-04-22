document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.setAttribute('data-script-status', 'enabled');

    const controlQuery = '//*[@class and (contains(concat(" ", normalize-space(@class), " "), " checkbox ") or contains(concat(" ", normalize-space(@class), " "), " radio "))]';
    const elementIterator = document.evaluate(controlQuery, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    let currentElement;

    while (currentElement = elementIterator.iterateNext()) {
        currentElement.insertAdjacentHTML('afterbegin', '<i class="indicator-glyph"></i><i class="animated-icon"></i>');
    }

    function synchronizeVisuals() {
        const visualTargetQuery = '//*[@class and (contains(concat(" ", normalize-space(@class), " "), " checkbox ") or contains(concat(" ", normalize-space(@class), " "), " radio "))]';
        const targetIterator = document.evaluate(visualTargetQuery, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        let processingNode;

        while (processingNode = targetIterator.iterateNext()) {
            const inputField = processingNode.querySelector('input[type="checkbox"], input[type="radio"]');

            if (inputField) {
                processingNode.classList.remove('state-selected', 'state-unavailable');

                if (inputField.checked) {
                    processingNode.classList.add('state-selected');
                }
                if (inputField.disabled) {
                    processingNode.classList.add('state-unavailable');
                }
            }
        }
    }

    synchronizeVisuals();

    document.addEventListener('click', function(eventObject) {
        const interactionTarget = eventObject.target;
        const potentialContainer = interactionTarget.closest('.checkbox, .radio');
        if (potentialContainer) {
            synchronizeVisuals();
        }
    });
});