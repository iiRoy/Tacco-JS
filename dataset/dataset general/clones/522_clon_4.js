class PersistentSettingsManager {
    static retrieveValue(keyIdentifier, defaultValue, transformationFn = val => val) {
        const stored = localStorage.getItem(keyIdentifier);
        return stored !== null ? transformationFn(stored) : defaultValue;
    }

    static storeValue(keyIdentifier, val) {
        localStorage.setItem(keyIdentifier, val);
    }
}

class SystemActivityLogger {
    constructor(activeState) {
        this.activityEnabled = activeState;
    }

    report(...messages) {
        if (this.activityEnabled) {
            console.info.apply(console, messages);
        }
    }

    setActivityStatus(status) {
        this.activityEnabled = status;
        PersistentSettingsManager.storeValue("verbosity_enabled_flag", status);
    }

    getActivityStatus() {
        return this.activityEnabled;
    }
}

const checkWebAddressValidity = (urlAddress) => {
    return urlAddress.startsWith('http://') || urlAddress.startsWith('https://');
};

class KeySequenceDefinition {
    constructor(properties) {
        this.controlMod = properties.controlMod || false;
        this.shiftMod = properties.shiftMod || false;
        this.altMod = properties.altMod || false;
        this.metaMod = properties.metaMod || false;
        this.primaryChar = properties.primaryChar || '';
    }

    composeIdentifier() {
        return (this.altMod ? "alt_key_" : "")
            + (this.metaMod ? "command_key_" : "")
            + (this.controlMod ? "control_key_" : "")
            + (this.shiftMod ? "shift_key_" : "")
            + (this.primaryChar);
    }
}

class PageDiscardPile {
    constructor(initialCapacity) {
        this.discardedItems = [];
        this.maximumCapacity = initialCapacity;
    }

    addEntry(pageData) {
        if (checkWebAddressValidity(pageData.url)) {
            this.discardedItems.unshift({ url: pageData.url, title: pageData.title, favIconUrl: pageData.favIconUrl });
        }
        this.trimToCapacity();
    }

    trimToCapacity() {
        if (this.discardedItems.length > this.maximumCapacity) {
            this.discardedItems.splice(this.maximumCapacity);
        }
    }

    setCapacity(newCapacity) {
        this.maximumCapacity = newCapacity;
        PersistentSettingsManager.storeValue("discard_pile_limit", newCapacity);
        this.trimToCapacity();
    }

    getCapacity() {
        return this.maximumCapacity;
    }

    findEntryIndexByAddress(urlAddress) {
        return this.discardedItems.findIndex(item => item.url === urlAddress);
    }

    removeEntryAtIndex(index) {
        if (index >= 0 && index < this.discardedItems.length) {
            this.discardedItems.splice(index, 1);
        }
    }

    clearAll() {
        this.discardedItems = [];
    }

    getContents() {
        return this.discardedItems;
    }
}

class BrowserEnvironmentManager {
    constructor() {
        this.systemTracer = new SystemActivityLogger(
            PersistentSettingsManager.retrieveValue("verbosity_enabled_flag", false, val => val === 'true')
        );

        this.activeBrowseSessions = [];
        this.favoriteDestinations = [];

        this.pageDiscardHistory = new PageDiscardPile(
            PersistentSettingsManager.retrieveValue("discard_pile_limit", 10, val => parseInt(val, 10) || 0)
        );

        this.systemTracer.report("BrowserEnvironmentManager initialized.");
    }

    fetchDiscardHistoryCapacity() {
        return this.pageDiscardHistory.getCapacity();
    }
    setDiscardHistoryCapacity(value) {
        this.pageDiscardHistory.setCapacity(value);
    }

    fetchNavigationStyle() {
        return PersistentSettingsManager.retrieveValue("navigation_flow_style", "");
    }
    setNavigationStyle(value) {
        PersistentSettingsManager.storeValue("navigation_flow_style", value);
    }

    fetchPageMovementStride() {
        return PersistentSettingsManager.retrieveValue("page_jump_increment", 5, val => parseInt(val, 10) || 0);
    }
    setPageMovementStride(value) {
        PersistentSettingsManager.storeValue("page_jump_increment", value);
    }

    shouldDisplayDeveloperTools() {
        return PersistentSettingsManager.retrieveValue("include_dev_tools_display", false, val => val === 'true');
    }
    setDisplayDeveloperTools(value) {
        PersistentSettingsManager.storeValue("include_dev_tools_display", value);
    }

    shouldDisplayPageAddresses() {
        return PersistentSettingsManager.retrieveValue("show_page_addresses", true, val => val === 'true');
    }
    setDisplayPageAddresses(value) {
        PersistentSettingsManager.storeValue("show_page_addresses", value);
    }

    shouldSearchPageAddresses() {
        return PersistentSettingsManager.retrieveValue("search_page_addresses", false, val => val === 'true');
    }
    setSearchPageAddresses(value) {
        PersistentSettingsManager.storeValue("search_page_addresses", value);
    }

    shouldDisplayTabCounter() {
        return PersistentSettingsManager.retrieveValue("show_page_counter", true, val => val === 'true');
    }
    setDisplayTabCounter(value) {
        PersistentSettingsManager.storeValue("show_page_counter", value);
        this.refreshInterfaceBadgeDisplay(this.activeBrowseSessions.length);
    }

    shouldDisplayHoverTips() {
        return PersistentSettingsManager.retrieveValue("show_hover_info", true, val => val === 'true');
    }
    setDisplayHoverTips(value) {
        PersistentSettingsManager.storeValue("show_hover_info", value);
    }

    shouldDisplayPageIcons() {
        return PersistentSettingsManager.retrieveValue("show_page_icons", true, val => val === 'true');
    }
    setDisplayPageIcons(value) {
        PersistentSettingsManager.storeValue("show_page_icons", value);
    }

    fetchSearchProviderUri() {
        return PersistentSettingsManager.retrieveValue("search_query_uri", 'http://www.google.com/search?q=%s');
    }
    setSearchProviderUri(value) {
        PersistentSettingsManager.storeValue("search_query_uri", value);
    }

    fetchCustomInterfaceStyles() {
        return PersistentSettingsManager.retrieveValue("custom_css_rules", '');
    }
    setCustomInterfaceStyles(value) {
        PersistentSettingsManager.storeValue("custom_css_rules", value);
    }

    retrieveKeyCombo(storageKey, defaultProps) {
        const storedCombo = PersistentSettingsManager.retrieveValue(storageKey, null);
        if (storedCombo) {
            return new KeySequenceDefinition(JSON.parse(storedCombo));
        } else {
            return new KeySequenceDefinition(defaultProps);
        }
    }

    storeKeyCombo(storageKey, comboObject) {
        PersistentSettingsManager.storeValue(storageKey, JSON.stringify(comboObject));
    }

    getPopupActivationKey() {
        return this.retrieveKeyCombo("popup_trigger_key", {});
    }
    clearLegacyPopupKey() {
        PersistentSettingsManager.storeValue("popup_trigger_key", null);
    }

    getPageCloseKey() {
        return this.retrieveKeyCombo("single_page_close_key", { controlMod: true, primaryChar: "d" });
    }
    setPageCloseKey(keyDef) {
        this.storeKeyCombo("single_page_close_key", keyDef);
    }

    getAllPagesCloseKey() {
        return this.retrieveKeyCombo("all_pages_close_key", { controlMod: true, shiftMod: true, primaryChar: "d" });
    }
    setAllPagesCloseKey(keyDef) {
        this.storeKeyCombo("all_pages_close_key", keyDef);
    }

    includePageInListing(pageItem) {
        return !(
            !this.shouldDisplayDeveloperTools() &&
            pageItem.url &&
            pageItem.url.startsWith('chrome-devtools://')
        );
    }

    findPageIndexById(pageId) {
        return this.activeBrowseSessions.findIndex(p => p.id === pageId);
    }

    captureNewPageEntry(pageData) {
        if (this.includePageInListing(pageData)) {
            this.activeBrowseSessions.push(pageData);
        }
    }

    processPageElimination(pageIds, completionCallback) {
        pageIds.forEach(pageId => {
            const index = this.findPageIndexById(pageId);
            if (index >= 0) {
                const page = this.activeBrowseSessions[index];
                this.pageDiscardHistory.addEntry(page);
                this.activeBrowseSessions.splice(index, 1);
                this.refreshInterfaceBadgeDisplay(this.activeBrowseSessions.length);
            } else {
                this.systemTracer.report("Failed to remove page", pageId, ", not found in active list.");
            }
        });
        if (completionCallback) {
            completionCallback();
        }
    }

    prioritizeActivePage(pageId) {
        const index = this.findPageIndexById(pageId);
        if (index >= 0) {
            const page = this.activeBrowseSessions[index];
            this.activeBrowseSessions.splice(index, 1);
            this.activeBrowseSessions.unshift(page);
        }
    }

    prioritizeMultipleActivePages(pageCollection) {
        for (let i = pageCollection.length - 1; i >= 0; i--) {
            this.prioritizeActivePage(pageCollection[i].id);
        }
    }

    initializeInterfaceBadge() {
        chrome.browserAction.setBadgeBackgroundColor({ color: [32, 7, 114, 255] });
        this.refreshInterfaceBadgeDisplay(0);
    }

    refreshInterfaceBadgeDisplay(count) {
        if (this.shouldDisplayTabCounter()) {
            chrome.browserAction.setBadgeText({ text: String(count) });
        } else {
            chrome.browserAction.setBadgeText({ text: "" });
        }
    }

    activateSpecificPage(pageIdentifier, completionCallback) {
        chrome.tabs.get(pageIdentifier, (pageObject) => {
            if (pageObject) {
                chrome.windows.update(pageObject.windowId, { focused: true }, () => {
                    chrome.tabs.update(pageObject.id, { selected: true }, () => {
                        if (completionCallback) {
                            completionCallback();
                        }
                    });
                });
            } else {
                this.systemTracer.report("Attempted to activate non-existent page:", pageIdentifier);
                if (completionCallback) completionCallback();
            }
        });
    }

    processBookmarkNodeRecursively(node, accumulatedBookmarks) {
        if (node.url !== undefined && node.url !== null) {
            accumulatedBookmarks.push(node);
        }

        if (node.children) {
            node.children.forEach(childItem => {
                this.processBookmarkNodeRecursively(childItem, accumulatedBookmarks);
            });
        }
        return accumulatedBookmarks;
    }

    retrieveAllBookmarksData(callback) {
        chrome.bookmarks.getTree((treeStructure) => {
            this.favoriteDestinations = [];
            if (treeStructure && treeStructure.length > 0) {
                this.processBookmarkNodeRecursively(treeStructure[0], this.favoriteDestinations);
            }
            callback(this.favoriteDestinations);
        });
    }

    prepareBookmarkManagement() {
        this.retrieveAllBookmarksData((result) => {
            this.favoriteDestinations = result;
        });
    }

    registerEventHandlers() {
        chrome.tabs.onRemoved.addListener((pageId) => {
            this.processPageElimination([pageId], null);
        });

        chrome.tabs.onCreated.addListener((page) => {
            if (!this.includePageInListing(page)) {
                return;
            }
            const discardedIndex = this.pageDiscardHistory.findEntryIndexByAddress(page.url);
            if (discardedIndex >= 0) {
                this.pageDiscardHistory.removeEntryAtIndex(discardedIndex);
            }

            this.activeBrowseSessions.unshift(page);
            this.refreshInterfaceBadgeDisplay(this.activeBrowseSessions.length);
            this.prioritizeActivePage(page.id);
        });

        chrome.tabs.onUpdated.addListener((pageId, changeInfo, page) => {
            const index = this.findPageIndexById(pageId);
            if (index >= 0) {
                this.activeBrowseSessions[index] = page;
            } else {
                if (this.includePageInListing(page)) {
                    this.captureNewPageEntry(page);
                    this.refreshInterfaceBadgeDisplay(this.activeBrowseSessions.length);
                }
            }
        });

        chrome.tabs.onActivated.addListener((activationInfo) => {
            this.prioritizeActivePage(activationInfo.tabId);
        });

        chrome.windows.onFocusChanged.addListener((windowId) => {
            if (windowId !== chrome.windows.WINDOW_ID_NONE) {
                chrome.tabs.query({ windowId: windowId, active: true }, (pageArray) => {
                    this.prioritizeMultipleActivePages(pageArray);
                });
            }
        });

        const bookmarkChangeHandler = () => this.prepareBookmarkManagement();
        chrome.bookmarks.onCreated.addListener(bookmarkChangeHandler);
        chrome.bookmarks.onRemoved.addListener(bookmarkChangeHandler);
        chrome.bookmarks.onChanged.addListener(bookmarkChangeHandler);
        chrome.bookmarks.onMoved.addListener(bookmarkChangeHandler);
    }

    startApplicationLifecycle() {
        this.activeBrowseSessions = [];
        this.pageDiscardHistory.clearAll();
        this.favoriteDestinations = [];

        this.initializeInterfaceBadge();

        chrome.windows.getAll({ populate: true }, (allWindows) => {
            allWindows.forEach(windowObject => {
                windowObject.tabs.forEach(pageItem => {
                    this.captureNewPageEntry(pageItem);
                });
            });

            this.refreshInterfaceBadgeDisplay(this.activeBrowseSessions.length);

            chrome.tabs.query({ currentWindow: true, active: true }, (activePageArray) => {
                this.prioritizeMultipleActivePages(activePageArray);
            });
        });

        this.registerEventHandlers();
        this.prepareBookmarkManagement();
    }
}

const applicationCore = new BrowserEnvironmentManager();
applicationCore.startApplicationLifecycle();

const applicationInterface = {
    getActivePages: () => applicationCore.activeBrowseSessions,
    getDiscardedPages: () => applicationCore.pageDiscardHistory.getContents(),
    getBookmarkedItems: () => applicationCore.favoriteDestinations,

    trace: (...args) => applicationCore.systemTracer.report(...args),
    setTraceStatus: (val) => applicationCore.systemTracer.setActivityStatus(val),
    getTraceStatus: () => applicationCore.systemTracer.getActivityStatus(),

    getDiscardHistorySize: () => applicationCore.fetchDiscardHistoryCapacity(),
    setDiscardHistorySize: (val) => applicationCore.setDiscardHistoryCapacity(val),
    getNavStyle: () => applicationCore.fetchNavigationStyle(),
    setNavStyle: (val) => applicationCore.setNavigationStyle(val),
    getPageSkipSize: () => applicationCore.fetchPageMovementStride(),
    setPageSkipSize: (val) => applicationCore.setPageMovementStride(val),
    getDevToolsDisplay: () => applicationCore.shouldDisplayDeveloperTools(),
    setDevToolsDisplay: (val) => applicationCore.setDisplayDeveloperTools(val),
    getPageAddressDisplay: () => applicationCore.shouldDisplayPageAddresses(),
    setPageAddressDisplay: (val) => applicationCore.setDisplayPageAddresses(val),
    getSearchAddressFlag: () => applicationCore.shouldSearchPageAddresses(),
    setSearchAddressFlag: (val) => applicationCore.setSearchPageAddresses(val),
    getTabCounterDisplay: () => applicationCore.shouldDisplayTabCounter(),
    setTabCounterDisplay: (val) => applicationCore.setDisplayTabCounter(val),
    getHoverTipsDisplay: () => applicationCore.shouldDisplayHoverTips(),
    setHoverTipsDisplay: (val) => applicationCore.setDisplayHoverTips(val),
    getPageIconsDisplay: () => applicationCore.shouldDisplayPageIcons(),
    setPageIconsDisplay: (val) => applicationCore.setDisplayPageIcons(val),
    getSearchUri: () => applicationCore.fetchSearchProviderUri(),
    setSearchUri: (val) => applicationCore.setSearchProviderUri(val),
    getCustomStyles: () => applicationCore.fetchCustomInterfaceStyles(),
    setCustomStyles: (val) => applicationCore.setCustomInterfaceStyles(val),

    getPopupKey: () => applicationCore.getPopupActivationKey(),
    clearOldPopupKey: () => applicationCore.clearLegacyPopupKey(),
    getClosePageKey: () => applicationCore.getPageCloseKey(),
    setClosePageKey: (keyDef) => applicationCore.setPageCloseKey(keyDef),
    getCloseAllPagesKey: () => applicationCore.getAllPagesCloseKey(),
    setCloseAllPagesKey: (keyDef) => applicationCore.setAllPagesCloseKey(keyDef),

    identifyPageIndex: (id) => applicationCore.findPageIndexById(id),
    identifyPageIndexByUrl: (arr, url) => arr.findIndex(item => item.url === url),
    updateBadge: (val) => applicationCore.refreshInterfaceBadgeDisplay(val),
    switchActivePage: (id, cb) => applicationCore.activateSpecificPage(id, cb),
    adjustDiscardedPagesCapacity: () => applicationCore.pageDiscardHistory.trimToCapacity(),

    KeySequenceDefinition: KeySequenceDefinition
};

window.serviceHub = applicationInterface;