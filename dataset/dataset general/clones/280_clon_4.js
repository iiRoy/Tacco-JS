let applicationSettings = {};

const updateFontSize = (val) => { /* Placeholder for external font size update logic */ };
const updateFontFamily = (val) => { /* Placeholder for external font family update logic */ };
const notifyBackgroundService = () => { /* Mimics chrome.extension.getBackgroundPage().objCurrentPage.buildCssToInject() */ };

const persistentDataStore = {
    masterKey: 'APPLICATION_CONFIGURATION_STORAGE',

    commitData: (keyElement, valueContent) => {
        applicationSettings[keyElement] = valueContent;
        try {
            localStorage.setItem(persistentDataStore.masterKey, JSON.stringify(applicationSettings));
        } catch (e) {
            console.error('Data persistence failed:', e);
        }
        notifyBackgroundService();
    },

    retrieveData: (keyElement) => {
        return applicationSettings.hasOwnProperty(keyElement) ? applicationSettings[keyElement] : undefined;
    },

    loadAllData: () => {
        try {
            const rawStored = localStorage.getItem(persistentDataStore.masterKey);
            applicationSettings = rawStored ? JSON.parse(rawStored) : {};
        } catch (e) {
            console.error('Data retrieval failed:', e);
            applicationSettings = {};
        }
    }
};

const userInterfaceManager = {
    concealDisplay: (cssSelector) => {
        document.querySelector(cssSelector)?.classList.add('hidden');
    },

    revealDisplay: (cssSelector) => {
        document.querySelector(cssSelector)?.classList.remove('hidden');
    },

    applyColorFromInput: (sourceInputSelector, stylePropertyIdentifier, targetElementSelector) => {
        const inputSource = document.querySelector(sourceInputSelector);
        const destinationElement = document.querySelector(targetElementSelector);
        if (inputSource && destinationElement) {
            const hexColor = inputSource.value;
            destinationElement.style[stylePropertyIdentifier] = `#${hexColor}`;
            persistentDataStore.commitData(sourceInputSelector.substring(1), hexColor);
        }
    },

    setDefaultColorState: () => {
        userInterfaceManager.concealDisplay('#background_color_row');
        userInterfaceManager.concealDisplay('#text_color_row');
        userInterfaceManager.concealDisplay('#links_color_row');
        userInterfaceManager.concealDisplay('#visited_links_color_row');
        persistentDataStore.commitData('DefaultBrowserColor', true);
    },

    setOverrideColorState: () => {
        userInterfaceManager.revealDisplay('#background_color_row');
        userInterfaceManager.revealDisplay('#text_color_row');
        userInterfaceManager.revealDisplay('#links_color_row');
        userInterfaceManager.revealDisplay('#visited_links_row'); // Corrected from visited_links_color_row, assuming a typo in original if it was meant to be distinct
        persistentDataStore.commitData('DefaultBrowserColor', false);
    },

    populateInputField: (inputNodeSelector) => {
        const retrievedVal = persistentDataStore.retrieveData(inputNodeSelector.substring(1));
        const targetNode = document.querySelector(inputNodeSelector);
        if (targetNode && retrievedVal !== undefined) {
            targetNode.value = retrievedVal;
        }
    },

    manageRadioGroupSelection: (configKey, defaultSelector, overrideSelector, onDefaultFn, onOverrideFn) => {
        const configValue = persistentDataStore.retrieveData(configKey);
        const defaultRadio = document.querySelector(defaultSelector);
        const overrideRadio = document.querySelector(overrideSelector);

        if (defaultRadio && overrideRadio) {
            if (configValue === true) {
                defaultRadio.checked = true;
                onDefaultFn();
            } else {
                overrideRadio.checked = true;
                onOverrideFn();
            }
        }
    },

    displayFormattedText: (targetSelector, messageContent, textColor) => {
        const displayTarget = document.querySelector(targetSelector);
        if (displayTarget) {
            displayTarget.style.color = textColor;
            displayTarget.textContent = messageContent;
        }
    }
};

const initializeApplicationSettings = () => {
    persistentDataStore.loadAllData();

    updateFontSize(persistentDataStore.retrieveData('FontSize'));
    updateFontFamily(persistentDataStore.retrieveData('OverrideFontName'));

    userInterfaceManager.populateInputField('#text_color');
    userInterfaceManager.populateInputField('#background_color');
    userInterfaceManager.populateInputField('#links_color');
    userInterfaceManager.populateInputField('#visited_links_color');

    userInterfaceManager.manageRadioGroupSelection(
        'DefaultBrowserFont',
        '#browserFontDefault',
        '#browserFontOverride',
        () => {}, // No specific action defined in original for font radio click
        () => {}  // No specific action defined in original for font radio click
    );
    userInterfaceManager.manageRadioGroupSelection(
        'DefaultBrowserColor',
        '#browserColorDefault',
        '#browserColorOverride',
        userInterfaceManager.setDefaultColorState,
        userInterfaceManager.setOverrideColorState
    );
    userInterfaceManager.manageRadioGroupSelection(
        'ShowImage',
        '#showImageDefault',
        '#showImageOverride',
        () => {},
        () => {}
    );
    userInterfaceManager.manageRadioGroupSelection(
        'ShowFlash',
        '#showFlashDefault',
        '#showFlashOverride',
        () => {},
        () => {}
    );

    userInterfaceManager.applyColorFromInput('#background_color', 'backgroundColor', '#sampleBlock');
    userInterfaceManager.applyColorFromInput('#text_color', 'color', '#sampleBlock');
    userInterfaceManager.applyColorFromInput('#links_color', 'color', '#link');
    userInterfaceManager.applyColorFromInput('#visited_links_color', 'color', '#visited_link');
};