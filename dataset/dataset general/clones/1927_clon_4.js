const API_ENDPOINT_URL = "https://online-go.com/api/v1/me/notifications";
const OGS_MAIN_SITE_URL = "https://online-go.com/";
const OGS_CHAT_PAGE_URL = "https://online-go.com/chat";
const OGS_GAME_PAGE_BASE = "https://online-go.com/game/";

const LOCAL_STORAGE_KEY_CHAT_ON_INTERACTION = 'chatAtGamesOpen';
const LOCAL_STORAGE_KEY_TAB_BEHAVIOR = 'open';
const LOCAL_STORAGE_KEY_CHAT_ON_STARTUP = 'chatAtStartup';

const TAB_BEHAVIOR_SUMMARY = 'summary';
const TAB_BEHAVIOR_FIRST = 'firstGame';

const retrieveConfiguration = (key) => localStorage[key];

const initiateBrowserTab = (destinationUrl) => {
    chrome.tabs.create({ url: destinationUrl });
};

const updateExtensionIndicator = (indicatorText) => {
    chrome.browserAction.setBadgeText({ text: indicatorText });
};

class NotificationProcessor {
    #recordedGameIDs = [];

    constructor() {
        this.#performInitialConfiguration();
        this.#attachEventHandlers();
        this.#schedulePeriodicPolling();
        console.info("NotificationProcessor module activated.");
    }

    #performInitialConfiguration() {
        if (retrieveConfiguration(LOCAL_STORAGE_KEY_CHAT_ON_STARTUP) === "true") {
            initiateBrowserTab(OGS_CHAT_PAGE_URL);
        }
        this.requestLatestNotifications();
    }

    #attachEventHandlers() {
        chrome.browserAction.onClicked.addListener(() => this.triggerGameNavigation());
    }

    #schedulePeriodicPolling() {
        console.info("Setting notification check interval to 60 seconds.");
        window.setInterval(() => this.requestLatestNotifications(), 60000);
    }

    async requestLatestNotifications() {
        try {
            const networkResponse = await fetch(API_ENDPOINT_URL);
            if (!networkResponse.ok) {
                throw new Error(`Network response was not OK: ${networkResponse.status}`);
            }
            const receivedData = await networkResponse.json();
            console.debug(JSON.stringify(receivedData));
            this.#processNotificationPayload(receivedData);
        } catch (errorDetails) {
            console.error("Failed to retrieve notifications:", errorDetails);
            updateExtensionIndicator("!"); // Indicate error state
        }
    }

    #processNotificationPayload(incomingAlerts) {
        const relevantGameIdentifiers = incomingAlerts
            .filter(alert => alert.type === 'yourMove')
            .map(alert => alert.game_id);

        const currentMoveCount = relevantGameIdentifiers.length;
        const indicatorValue = currentMoveCount > 0 ? String(currentMoveCount) : "";
        updateExtensionIndicator(indicatorValue);
        this.#recordedGameIDs = relevantGameIdentifiers;
        console.debug("Current active game count: " + currentMoveCount);
    }

    triggerGameNavigation() {
        if (retrieveConfiguration(LOCAL_STORAGE_KEY_CHAT_ON_INTERACTION) === "true") {
            initiateBrowserTab(OGS_CHAT_PAGE_URL);
        }

        const desiredTabBehavior = retrieveConfiguration(LOCAL_STORAGE_KEY_TAB_BEHAVIOR);

        const navigationAction = {
            [TAB_BEHAVIOR_SUMMARY]: () => initiateBrowserTab(OGS_MAIN_SITE_URL),
            [TAB_BEHAVIOR_FIRST]: () => {
                if (this.#recordedGameIDs.length > 0) {
                    initiateBrowserTab(OGS_GAME_PAGE_BASE + this.#recordedGameIDs[0]);
                } else {
                    initiateBrowserTab(OGS_MAIN_SITE_URL); // Fallback if no games
                }
            },
            allGames: () => {
                this.#recordedGameIDs.forEach(gameIdentifier => {
                    initiateBrowserTab(OGS_GAME_PAGE_BASE + gameIdentifier);
                });
            }
        };

        if (this.#recordedGameIDs.length === 0 || desiredTabBehavior === null || desiredTabBehavior === TAB_BEHAVIOR_SUMMARY) {
            navigationAction[TAB_BEHAVIOR_SUMMARY]();
        } else if (desiredTabBehavior === TAB_BEHAVIOR_FIRST) {
            navigationAction[TAB_BEHAVIOR_FIRST]();
        } else {
            navigationAction.allGames();
        }

        this.#recordedGameIDs = [];
        updateExtensionIndicator("");
    }
}

new NotificationProcessor();