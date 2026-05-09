const activeTabClass = 'tab_selected';
const inactiveTabClass = 'tab_unselected';
const activePaneClass = 'pane_selected';
const inactivePaneClass = 'pane_unselected';
const persistentStoreKey = 'user_tab_preference_map';
const currentPathIdentifier = window.location.pathname.replace(/^\//, '');

const dataVault = (function() {
    let memoryCache = {};

    function readAllRecords() {
        if (Object.keys(memoryCache).length === 0) {
            try {
                const storedValue = localStorage.getItem(persistentStoreKey);
                memoryCache = storedValue ? JSON.parse(storedValue) : {};
            } catch (error) {
                console.error("DataVault: Error retrieving from local storage:", error);
                memoryCache = {};
            }
        }
        return memoryCache;
    }

    function writeAllRecords() {
        try {
            localStorage.setItem(persistentStoreKey, JSON.stringify(memoryCache));
        } catch (error) {
            console.error("DataVault: Error saving to local storage:", error);
        }
    }

    function retrieveEntry(uniqueKey) {
        return readAllRecords()[uniqueKey];
    }

    function updateEntry(uniqueKey, entryValue) {
        readAllRecords();
        memoryCache[uniqueKey] = entryValue;
        writeAllRecords();
    }

    return {
        getEntry: retrieveEntry,
        setEntry: updateEntry
    };
})();

function constructLookupKey(panelIdentifier) {
    return `${currentPathIdentifier}::${panelIdentifier}`;
}

function adjustDisplayState(activatedTabElement) {
    if (!activatedTabElement || !activatedTabElement.classList.contains('tab')) {
        return;
    }

    const containingSection = activatedTabElement.closest('.tabbed_panel');
    if (!containingSection) return;

    const associatedContentId = activatedTabElement.dataset.targetPane;
    const associatedContentElement = document.getElementById(associatedContentId);

    if (!associatedContentElement) return;

    Array.from(containingSection.querySelectorAll('.tab')).forEach(tabItem => {
        tabItem.classList.remove(activeTabClass);
        tabItem.classList.add(inactiveTabClass);
    });
    Array.from(containingSection.querySelectorAll('.tab_content_pane')).forEach(contentItem => {
        contentItem.classList.remove(activePaneClass);
        contentItem.classList.add(inactivePaneClass);
    });

    activatedTabElement.classList.remove(inactiveTabClass);
    activatedTabElement.classList.add(activeTabClass);
    associatedContentElement.classList.remove(inactivePaneClass);
    associatedContentElement.classList.add(activePaneClass);
}

function processInteraction(eventObject) {
    eventObject.preventDefault();

    const clickedElement = eventObject.target.closest('a');
    if (!clickedElement) return;

    const parentTabElement = clickedElement.closest('.tab');
    if (!parentTabElement) return;

    const parentPanelId = parentTabElement.closest('.tabbed_panel').id;
    const currentTabId = parentTabElement.id;

    adjustDisplayState(parentTabElement);
    dataVault.setEntry(constructLookupKey(parentPanelId), currentTabId);
}

function configureSection(panelSectionElement) {
    const sectionId = panelSectionElement.id;
    if (!sectionId) return;

    const storedPreference = dataVault.getEntry(constructLookupKey(sectionId));

    let initialTabElement = null;
    if (storedPreference) {
        initialTabElement = document.getElementById(storedPreference);
    }

    if (!initialTabElement || !panelSectionElement.contains(initialTabElement)) {
        initialTabElement = panelSectionElement.querySelector('.tab');
    }

    if (initialTabElement) {
        adjustDisplayState(initialTabElement);
    }
}

function commenceOperation() {
    document.addEventListener('click', function(eventObject) {
        if (eventObject.target.closest('.tabbed_panel .tab a')) {
            processInteraction(eventObject);
        }
    });

    document.querySelectorAll('.tabbed_panel').forEach(configureSection);
}

document.addEventListener('DOMContentLoaded', commenceOperation);