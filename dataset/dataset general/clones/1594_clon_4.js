const configurationRegistry = {
    'networkHostAddress': { elId: 'broker', initial: 'test.mosquitto.org', type: 'text' },
    'networkPortNumber': { elId: 'port', initial: 80, type: 'number' },
    'authenticationUser': { elId: 'username', initial: '', type: 'text' },
    'authenticationSecret': { elId: 'password', initial: '', type: 'text' },
    'topicSubscriptionPath': { elId: 'subtopic', initial: '/mqtt2chrome/messages', type: 'text' },
    'reconnectionDelaySeconds': { elId: 'reconnectTimeout', initial: 10, type: 'number' },
    'autoDismissNotifications': { elId: 'clearNotifications', initial: true, type: 'boolean' },
    'notificationDisplaySeconds': { elId: 'notificationTimeout', initial: 10, type: 'number' }
};

const preferencesStoreKey = 'application_preferences_bundle';

const retrieveElement = (identifier) => document.getElementById(identifier);

function provisionInitialConfig() {
    const defaultValues = {};
    for (const property in configurationRegistry) {
        defaultValues[property] = configurationRegistry[property].initial;
    }
    window.localStorage.setItem(preferencesStoreKey, JSON.stringify(defaultValues));
}

function loadConfiguration() {
    let storedConfigString = window.localStorage.getItem(preferencesStoreKey);
    let currentConfig;

    if (!storedConfigString) {
        provisionInitialConfig();
        storedConfigString = window.localStorage.getItem(preferencesStoreKey);
    }

    try {
        currentConfig = JSON.parse(storedConfigString);
    } catch (e) {
        provisionInitialConfig();
        currentConfig = JSON.parse(window.localStorage.getItem(preferencesStoreKey));
    }

    for (const property in configurationRegistry) {
        const settingInfo = configurationRegistry[property];
        const uiElement = retrieveElement(settingInfo.elId);

        if (uiElement) {
            const valueToSet = currentConfig[property] !== undefined ? currentConfig[property] : settingInfo.initial;

            if (settingInfo.type === 'boolean') {
                uiElement.checked = Boolean(valueToSet);
            } else {
                uiElement.value = valueToSet;
            }
        }
    }
}

function persistConfiguration() {
    const updatedValues = {};
    for (const property in configurationRegistry) {
        const settingInfo = configurationRegistry[property];
        const uiElement = retrieveElement(settingInfo.elId);

        if (uiElement) {
            if (settingInfo.type === 'boolean') {
                updatedValues[property] = uiElement.checked;
            } else {
                updatedValues[property] = settingInfo.type === 'number' ? Number(uiElement.value) : uiElement.value;
            }
        }
    }
    window.localStorage.setItem(preferencesStoreKey, JSON.stringify(updatedValues));
}

function commitAndTerminate() {
    persistConfiguration();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                chrome.tabs.remove(tabs[0].id);
            }
        });
    }
}

function startupRoutine() {
    loadConfiguration();
    const saveButton = retrieveElement('save');
    if (saveButton) {
        saveButton.addEventListener('click', commitAndTerminate);
    }
}

document.addEventListener('DOMContentLoaded', startupRoutine);