(function() {
    const rootElement = document.documentElement;
    if (rootElement.classList.contains('no-js')) {
        rootElement.classList.remove('no-js');
    }
    rootElement.classList.add('js');

    let elementIdentifier = 0;

    function integrateAlternativeControls(selectionCriterion, visualizerDesignation, visualMarking) {
        const sourceInputs = document.querySelectorAll(selectionCriterion);
        sourceInputs.forEach(function(originalControl) {
            const currentUniqueId = elementIdentifier++;
            originalControl.setAttribute('data-control-identity', currentUniqueId);

            const displayProxy = document.createElement('span');
            displayProxy.className = visualizerDesignation;
            displayProxy.id = 'proxy-element-' + currentUniqueId;
            displayProxy.dataset.groupName = originalControl.name;
            displayProxy.textContent = visualMarking;
            displayProxy.style.textIndent = '-9999px';

            if (selectionCriterion.includes('checkbox')) {
                displayProxy.dataset.initialState = originalControl.checked ? 'true' : 'false';
            }

            originalControl.insertAdjacentElement('afterend', displayProxy);
            originalControl.style.display = 'none';
        });
    }

    integrateAlternativeControls('input[type="radio"]', 'radioDisplayComponent', '•');
    integrateAlternativeControls('input[type="checkbox"]', 'checkboxDisplayComponent', '✓');

    document.body.addEventListener('click', function(eventObject) {
        const clickedItem = eventObject.target;

        if (clickedItem.classList.contains('radioDisplayComponent')) {
            const itemId = clickedItem.id.replace('proxy-element-', '');
            const groupTag = clickedItem.dataset.groupName;

            const relatedRadio = document.querySelector('input[type="radio"][data-control-identity="' + itemId + '"]');

            if (relatedRadio) {
                relatedRadio.setAttribute('checked', 'checked');
            }

            const allGroupProxies = document.querySelectorAll('.radioDisplayComponent[data-group-name="' + groupTag + '"]');
            allGroupProxies.forEach(function(proxyItem) {
                proxyItem.style.textIndent = '-9999px';
            });

            clickedItem.style.textIndent = '0';

            const allGroupOriginals = document.querySelectorAll('input[type="radio"][name="' + groupTag + '"]');
            allGroupOriginals.forEach(function(originalControl) {
                originalControl.removeAttribute('checked');
            });
        }
    });

    document.body.addEventListener('click', function(eventObject) {
        const clickedItem = eventObject.target;

        if (clickedItem.classList.contains('checkboxDisplayComponent')) {
            const itemId = clickedItem.id.replace('proxy-element-', '');

            const relatedCheckbox = document.querySelector('input[type="checkbox"][data-control-identity="' + itemId + '"]');

            if (relatedCheckbox) {
                relatedCheckbox.click();
            }

            clickedItem.classList.toggle('status-active');
        }
    });
})();