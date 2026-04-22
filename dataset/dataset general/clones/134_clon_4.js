module.exports = (externalConfig = {}) => {

    const {
        initialChoiceIndex: startingIndex = 0,
        iOSButtonTitle: labelText = '',
        title: panelTitle = '',
        rtl: isRTL = false,
        ...remainingConfigForPicker
    } = externalConfig;

    const currentDeviceOS = Ti.Platform.getOsname();

    const isApplePlatform = currentDeviceOS !== 'android';
    const isPhone = currentDeviceOS === 'iphone';
    const isPad = currentDeviceOS === 'ipad';
    const isGooglePlatform = currentDeviceOS === 'android';

    const labelFieldDefaultSettings = {
        value: labelText,
        height: 40,
        width: '90%',
        enabled: false,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
    };

    const labelFieldMergeableProperties = new Set(['left', 'right', 'top', 'bottom', 'width', 'height']);

    const finalLabelFieldConfiguration = { ...labelFieldDefaultSettings };
    for (const propName of labelFieldMergeableProperties) {
        if (externalConfig.hasOwnProperty(propName)) {
            finalLabelFieldConfiguration[propName] = externalConfig[propName];
        }
    }

    const selectorComponentConfiguration = { ...remainingConfigForPicker };
    if (isPhone) {
        selectorComponentConfiguration.top = 44;
    }

    if (isApplePlatform) {
        for (const propName of labelFieldMergeableProperties) {
            if (externalConfig.hasOwnProperty(propName)) {
                delete selectorComponentConfiguration[propName];
            }
        }
    }

    const choiceSelectorComponent = Ti.UI.createPicker(selectorComponentConfiguration);
    choiceSelectorComponent.setSelectedRow(0, startingIndex);

    let overlayPanelElement = null;
    let inputTriggerElement = null;
    let currentlySelectedIndex = startingIndex;

    const handleSelectionConfirmation = (eventData) => {
        if (inputTriggerElement) {
            currentlySelectedIndex = eventData.rowIndex;
            const selectedItemRow = choiceSelectorComponent.getSelectedRow(0);
            if (selectedItemRow && selectedItemRow.changedName !== undefined) {
                inputTriggerElement.setValue(selectedItemRow.changedName);
            }
        }
    };

    choiceSelectorComponent.addEventListener('change', handleSelectionConfirmation);

    if (isPhone) {
        overlayPanelElement = Ti.UI.createView({
            height: 252,
            bottom: -252,
            zIndex: 99,
            backgroundColor: 'red'
        });

        const showPanelAnimation = Ti.UI.createAnimation({ bottom: 0 });
        const hidePanelAnimation = Ti.UI.createAnimation({ bottom: -252 });

        overlayPanelElement.addEventListener('slideUp', () => {
            overlayPanelElement.animate(showPanelAnimation);
            choiceSelectorComponent.setSelectedRow(0, currentlySelectedIndex, true);
        });
        overlayPanelElement.addEventListener('slideDown', () => {
            overlayPanelElement.animate(hidePanelAnimation);
        });

        const cancelAction = Ti.UI.createButton({
            title: L('Cancel'),
            style: Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });
        cancelAction.addEventListener('click', () => {
            overlayPanelElement.fireEvent('slideDown');
        });

        const acceptAction = Ti.UI.createButton({
            title: L('Done'),
            style: Ti.UI.iPhone.SystemButtonStyle.DONE
        });
        acceptAction.addEventListener('click', handleSelectionConfirmation);
        acceptAction.addEventListener('click', () => {
            overlayPanelElement.fireEvent('slideDown');
        });

        const controlBarElement = Ti.UI.iOS.createToolbar({
            top: 0,
            items: [
                cancelAction,
                Ti.UI.createButton({ systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE }),
                acceptAction
            ]
        });
        overlayPanelElement.add(controlBarElement);

    } else if (isPad) {
        overlayPanelElement = Ti.UI.iPad.createPopover({
            width: 200,
            height: 200,
            title: panelTitle,
            arrowDirection: Ti.UI.iPad.POPOVER_ARROW_DIRECTION_ANY
        });
    }

    if (isApplePlatform) {
        overlayPanelElement.add(choiceSelectorComponent);

        const disclosureRotation = Ti.UI.create2DMatrix();
        inputTriggerElement = Ti.UI.createTextField(finalLabelFieldConfiguration);

        if (isRTL) {
            inputTriggerElement.leftButton = Ti.UI.createButton({
                style: Ti.UI.iPhone.SystemButton.DISCLOSURE,
                transform: disclosureRotation.rotate(90)
            });
            inputTriggerElement.setTextAlign(Ti.UI.TEXT_ALIGNMENT_RIGHT);
        } else {
            inputTriggerElement.rightButton = Ti.UI.createButton({
                style: Ti.UI.iPhone.SystemButton.DISCLOSURE,
                transform: disclosureRotation.rotate(90)
            });
        }

        inputTriggerElement.addEventListener('click', () => {
            if (isPad) {
                overlayPanelElement.show({
                    view: inputTriggerElement,
                    animated: true
                });
                choiceSelectorComponent.setSelectedRow(0, currentlySelectedIndex, true);
            } else if (isPhone) {
                overlayPanelElement.fireEvent('slideUp');
            }
        });
    }

    const retrieveVisualElements = () => {
        if (isGooglePlatform) {
            return choiceSelectorComponent;
        } else if (isPhone) {
            return [inputTriggerElement, overlayPanelElement];
        } else if (isPad) {
            return inputTriggerElement;
        }
    };

    const obtainSelectorComponent = () => choiceSelectorComponent;
    const fetchOverlayPanel = () => overlayPanelElement;
    const accessInputTrigger = () => inputTriggerElement;

    return {
        retrieveVisualElements,
        obtainSelectorComponent,
        fetchOverlayPanel,
        accessInputTrigger
    };
};