const applicationConfiguration = window.EE || {
    editorConfig: {
        fields: {}
    },
    publish: {
        markitup: {
            fields: {}
        }
    }
};

const mainMarkupOptions = window.mySettings || {};
const composeModeMarkupOptions = window.myWritemodeSettings || {};

function initializeContentFormatter(elementIdentifier, settings) {
    const targetElement = document.getElementById(elementIdentifier);
    if (targetElement && typeof targetElement.TextileEditor === 'function') {
        targetElement.TextileEditor(settings);
    }
}

function removeMarkupEditor(elementIdentifier) {
    const targetElement = document.getElementById(elementIdentifier);
    if (targetElement && typeof targetElement.markItUpRemove === 'function') {
        targetElement.markItUpRemove();
    }
}

function applyDefaultMarkup(elementIdentifier, options) {
    const targetElement = document.getElementById(elementIdentifier);
    if (targetElement && typeof targetElement.markItUp === 'function') {
        targetElement.markItUp(options);
    }
}

function activateResourceBrowser(elementIdentifier) {
    if (typeof window.teh_filebrowser === 'function') {
        window.teh_filebrowser(elementIdentifier);
    }
}

const domOperations = {
    retrieveSingle: (selectorTxt) => document.querySelector(selectorTxt),
    retrieveMultiple: (selectorTxt) => Array.from(document.querySelectorAll(selectorTxt)),
    setElementAttribute: (el, attrKey, attrValue) => el.setAttribute(attrKey, attrValue),
    getElementAttribute: (el, attrKey) => el.getAttribute(attrKey),
    checkElementPresence: (el) => !!el,
    deleteNode: (el) => el && el.parentNode && el.parentNode.removeChild(el),
    attachEventToElement: (el, eventName, handlerFn) => el.addEventListener(eventName, handlerFn),
    findClosestAncestor: (el, ancestorSelector) => el.closest(ancestorSelector)
};

domOperations.attachEventToElement(document, 'DOMContentLoaded', function() {

    domOperations.retrieveMultiple("textarea[name*='field_id_']").forEach(function(contentArea) {
        let areaIdentifier = domOperations.getElementAttribute(contentArea, 'name');
        if (!domOperations.getElementAttribute(contentArea, 'id')) {
            domOperations.setElementAttribute(contentArea, 'id', areaIdentifier);
        }

        const currentFieldConfiguration = applicationConfiguration && applicationConfiguration.editorConfig && applicationConfiguration.editorConfig.fields[areaIdentifier];

        if (currentFieldConfiguration !== undefined) {
            const numericalKey = currentFieldConfiguration;

            if (domOperations.checkElementPresence(domOperations.retrieveSingle('#markItUpField_id_' + numericalKey))) {
                removeMarkupEditor(areaIdentifier);
            }

            initializeContentFormatter(areaIdentifier, applicationConfiguration.editorConfig);
            activateResourceBrowser(areaIdentifier);
        }
    });

    domOperations.retrieveMultiple("select[name*='field_ft_']").forEach(function(formatSelectionControl) {
        const controlName = domOperations.getElementAttribute(formatSelectionControl, 'name');
        const numericalKey = controlName.substring('field_ft_'.length);
        const linkedAreaIdentifier = 'field_id_' + numericalKey;

        const defaultMarkupExpected = (applicationConfiguration && applicationConfiguration.publish && applicationConfiguration.publish.markitup && applicationConfiguration.publish.markitup.fields && applicationConfiguration.publish.markitup.fields[linkedAreaIdentifier]) ? true : false;

        domOperations.attachEventToElement(formatSelectionControl, 'change', function(eventData) {
            let controlPanelContainer = domOperations.retrieveSingle('#textile-toolbar-' + linkedAreaIdentifier);

            if (eventData.target.value === 'textile') {
                if (defaultMarkupExpected && domOperations.checkElementPresence(domOperations.retrieveSingle('#markItUpField_id_' + numericalKey))) {
                    removeMarkupEditor(linkedAreaIdentifier);
                }
                if (!controlPanelContainer) {
                    initializeContentFormatter(linkedAreaIdentifier, applicationConfiguration.editorConfig);
                    activateResourceBrowser(linkedAreaIdentifier);
                }
            } else {
                if (controlPanelContainer) {
                    domOperations.deleteNode(controlPanelContainer);
                }
                if (defaultMarkupExpected && !domOperations.checkElementPresence(domOperations.retrieveSingle('#markItUpField_id_' + numericalKey))) {
                    applyDefaultMarkup(linkedAreaIdentifier, mainMarkupOptions);
                }
            }
        });
    });

    domOperations.retrieveMultiple(".write_mode_trigger").forEach(function(triggerButton) {
        domOperations.attachEventToElement(triggerButton, 'click', function(eventData) {
            eventData.preventDefault();

            const parentWrapper = domOperations.findClosestAncestor(eventData.target, ".publish_field");
            const parentHasTextilePanel = domOperations.checkElementPresence(parentWrapper && parentWrapper.querySelector(".textile-toolbar"));
            const composeModeTargetIdentifier = "write_mode_textarea";
            const composeModePanelPresent = domOperations.checkElementPresence(domOperations.retrieveSingle('#textile-toolbar-' + composeModeTargetIdentifier));
            const composeModeDefaultMarkupPresent = domOperations.checkElementPresence(domOperations.retrieveSingle('#markItUp' + composeModeTargetIdentifier));

            if (parentHasTextilePanel) {
                if (!composeModePanelPresent) {
                    removeMarkupEditor(composeModeTargetIdentifier);
                    initializeContentFormatter(composeModeTargetIdentifier, applicationConfiguration.editorConfig);
                    activateResourceBrowser(composeModeTargetIdentifier);
                }
                domOperations.retrieveSingle('#' + composeModeTargetIdentifier).focus();
            } else {
                if (composeModePanelPresent) {
                    domOperations.deleteNode(domOperations.retrieveSingle('#textile-toolbar-' + composeModeTargetIdentifier));
                }
                if (!composeModeDefaultMarkupPresent) {
                    applyDefaultMarkup(composeModeTargetIdentifier, composeModeMarkupOptions);
                }
            }
        });
    });
});