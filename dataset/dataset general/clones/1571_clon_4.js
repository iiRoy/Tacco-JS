(function(globalScope) {
    'use strict';

    const generatedDesignations = new Set();

    function createDesignationTag() {
        let newDesignation;
        do {
            newDesignation = 'uid' + Math.random().toString(36).substring(2, 9);
        } while (generatedDesignations.has(newDesignation) || globalScope.document.getElementById(newDesignation));
        generatedDesignations.add(newDesignation);
        return newDesignation;
    }

    function ensureControlIdentity(targetControl) {
        let currentIdentity = targetControl.id;
        if (!currentIdentity) {
            currentIdentity = createDesignationTag();
            targetControl.id = currentIdentity;
        }
        return currentIdentity;
    }

    function obtainControlHint(targetControl) {
        let hintText = targetControl.getAttribute('placeholder');
        if (hintText === null) {
            hintText = targetControl.getAttribute('title');
        }
        return hintText || '';
    }

    function updateCaptionPosition(targetControl, labelElement) {
        let currentContent = targetControl.value;

        if (targetControl.tagName.toLowerCase() === 'select') {
            const hintValue = obtainControlHint(targetControl);
            if (hintValue !== '' && hintValue === currentContent) {
                currentContent = '';
            }
        }

        if (currentContent !== '') {
            labelElement.classList.add('label-active-state');
        } else {
            labelElement.classList.remove('label-active-state');
        }
    }

    function decorateFormControl(controlElement) {
        const containerDiv = globalScope.document.createElement('div');
        containerDiv.className = 'control-wrapper';

        controlElement.parentNode.insertBefore(containerDiv, controlElement);
        containerDiv.appendChild(controlElement);

        const controlIdentity = ensureControlIdentity(controlElement);

        const captionContent = obtainControlHint(controlElement);
        const mandatoryIndicator = controlElement.hasAttribute('required') ? 'required-field' : '';

        const floatingLabel = globalScope.document.createElement('label');
        floatingLabel.className = 'floating-caption ' + mandatoryIndicator;
        if (controlElement.tagName.toLowerCase() === 'textarea') {
            floatingLabel.classList.add('multi-line-control');
        }
        floatingLabel.htmlFor = controlIdentity;
        floatingLabel.textContent = captionContent;

        containerDiv.insertBefore(floatingLabel, controlElement);

        updateCaptionPosition(controlElement, floatingLabel);

        controlElement.addEventListener('keyup', () => updateCaptionPosition(controlElement, floatingLabel));
        controlElement.addEventListener('blur', () => updateCaptionPosition(controlElement, floatingLabel));
        controlElement.addEventListener('change', () => updateCaptionPosition(controlElement, floatingLabel));
        controlElement.addEventListener('input', () => updateCaptionPosition(controlElement, floatingLabel));
    }

    globalScope.initFieldLabelAnimation = function(targetSelector) {
        if (!targetSelector || typeof targetSelector !== 'string') {
            globalScope.console.warn('initFieldLabelAnimation requires a valid CSS selector string.');
            return;
        }

        const selectedControls = globalScope.document.querySelectorAll(targetSelector);

        selectedControls.forEach(controlElement => {
            const nodeTag = controlElement.tagName.toLowerCase();
            const inputType = controlElement.getAttribute('type');

            if ((nodeTag === 'input' && inputType !== 'submit') || nodeTag === 'textarea' || nodeTag === 'select') {
                decorateFormControl(controlElement);
            }
        });
    };

})(window);