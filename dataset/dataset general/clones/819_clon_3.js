Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

/**
 * AppLinkerUtility: A comprehensive module for dynamically integrating external application
 * launch options into various browser UI contexts, such as view menus, content context menus,
 * tab context menus, and toolbar buttons. It manages the lifecycle of these UI elements,
 * their visibility based on user preferences, and their dynamic addition/removal.
 */
let AppLinkerUtility = {

    // An array to store configurations for all UI locations where external app launchers can be placed.
    // Each entry describes a specific insertion point and its associated properties.
    uiPlacementConfigs: [],

    // Internal flag to ensure that the initialization process runs only once.
    #isInitialized: false,

    /**
     * Entry point for the utility, invoked upon the browser window's full load.
     * Responsible for initiating the core setup process.
     */
    initialSetup: function() {
        // Detach this event listener immediately to prevent redundant calls.
        window.removeEventListener('load', AppLinkerUtility.initialSetup, false);
        // Begin the detailed configuration of all user interface components.
        this.configureComponents();
    },

    /**
     * Core method for setting up and configuring all UI elements related to external application launching.
     * This includes fetching necessary browser elements, attaching event listeners, and registering
     * dynamic menu/button insertion points.
     */
    configureComponents: function() {
        // If components have already been configured, exit to prevent re-initialization side effects.
        if (this.#isInitialized) {
            return;
        }
        this.#isInitialized = true; // Mark as initialized.

        // Import the essential core logic module which handles application list management and UI factories.
        Components.utils.import('resource://openwith/openwith.jsm');

        // Retrieve current application details for conditional logic (e.g., Firefox vs. SeaMonkey).
        const currentApplicationName = Services.appinfo.name;
        const currentApplicationVersion = Number.parseFloat(Services.appinfo.version);

        // Obtain a reference to the main browser content area.
        const mainContentElement = document.getElementById('content');

        /**
         * Helper function to streamline the process of adding new UI placement configurations.
         * @param {object} configObj - An object containing details for a UI placement,
         *                             e.g., prefName, container, targetType, factory.
         */
        const addPlacementConfiguration = (configObj) => {
            // Basic validation to ensure the configuration object is meaningful.
            if (!configObj.prefName || !configObj.container) {
                console.warn("AppLinkerUtility: Skipping invalid UI placement configuration:", configObj);
                return;
            }
            this.uiPlacementConfigs.push(configObj);
        };

        /* --- Global View Menu Integration --- */
        // Identify the placeholder and separator elements within the browser's 'View' menu.
        this.mainViewPlaceholderElem = document.getElementById('openwith-viewmenuplaceholder');
        this.mainViewSeparatorElem = document.getElementById('openwith-viewmenuseparator');
        // Account for potential differences in menu IDs across browser versions (e.g., 'menu_viewPopup' vs 'menu_View_Popup').
        const mainViewParentMenu = document.getElementById('menu_viewPopup') ||
                                   document.getElementById('menu_View_Popup');

        // Proceed only if the main view menu element is successfully located.
        if (mainViewParentMenu) {
            mainViewParentMenu.addEventListener('popupshowing', this.onPopupDisplay.bind(this), false);
            mainViewParentMenu.addEventListener('popuphidden', this.onPopupHide.bind(this), false);
            // Initialize an array to hold dynamically generated items for this menu.
            this.mainViewItemsArray = [];
            addPlacementConfiguration({
                prefName: 'viewmenu',
                container: this.mainViewItemsArray // This is where the actual menuitems will be stored.
            });
        } else {
            console.warn("AppLinkerUtility: Main 'View' menu not found. View menu integration disabled.");
            this.mainViewPlaceholderElem = null; // Mark as unavailable for subsequent checks.
        }

        /* --- Global View Menu Submenu --- */
        // Locate the submenu and its popup container within the main 'View' menu.
        this.mainViewSubmenuElem = document.getElementById('openwith-viewsubmenu');
        this.mainViewSubmenuPopupElem = document.getElementById('openwith-viewsubmenupopup');
        addPlacementConfiguration({
            prefName: 'viewmenu.submenu',
            container: this.mainViewSubmenuPopupElem // The actual DOM element for the submenu's contents.
        });


        /* --- Content Area Right-Click Context Menu --- */
        // Elements related to the context menu that appears when right-clicking on content.
        this.contentAreaSeparator = document.getElementById('openwith-contextmenuseparator');
        this.contentAreaPlaceholder = document.getElementById('openwith-contextmenuplaceholder');

        const contentAreaContextMenu = document.getElementById('contentAreaContextMenu');
        if (contentAreaContextMenu) {
            contentAreaContextMenu.addEventListener('popupshowing', this.onPopupDisplay.bind(this), false);
            contentAreaContextMenu.addEventListener('popuphidden', this.onPopupHide.bind(this), false);
            this.contentAreaItems = []; // Storage for generic content context menu items.
            addPlacementConfiguration({
                prefName: 'contextmenu',
                container: this.contentAreaItems
            });
        } else {
            console.warn("AppLinkerUtility: Content area context menu not found. Generic content context integration disabled.");
            this.contentAreaPlaceholder = null;
        }

        /* --- Content Area Context Menu Submenu --- */
        this.contentAreaSubmenu = document.getElementById('openwith-contextsubmenu');
        this.contentAreaSubmenuPopup = document.getElementById('openwith-contextsubmenupopup');
        addPlacementConfiguration({
            prefName: 'contextmenu.submenu',
            container: this.contentAreaSubmenuPopup
        });


        /* --- Context Menu (Link-Specific Items) --- */
        // Special placeholder and item collection for context menu items that appear only when a link is clicked.
        this.linkContextMenuPlaceholder = document.getElementById('openwith-contextmenulinkplaceholder');
        this.linkContextMenuItems = [];
        addPlacementConfiguration({
            prefName: 'contextmenulink',
            targetType: OpenWithCore.TARGET_LINK, // Designates these items for link targets.
            container: this.linkContextMenuItems
        });

        /* --- Context Menu (Link-Specific Submenu) --- */
        this.linkContextSubmenu = document.getElementById('openwith-contextlinksubmenu');
        this.linkContextSubmenuPopup = document.getElementById('openwith-contextlinksubmenupopup');
        addPlacementConfiguration({
            prefName: 'contextmenulink.submenu',
            targetType: OpenWithCore.TARGET_LINK,
            container: this.linkContextSubmenuPopup
        });


        /* --- Bookmarks/Places Context Menu --- */
        // Placeholder for items within the bookmarks/history context menu.
        this.bookmarkContextPlaceholder = document.getElementById('openwith-placescontextlinkplaceholder');

        const bookmarksPanelContextMenu = document.getElementById('placesContext');
        if (bookmarksPanelContextMenu) {
            bookmarksPanelContextMenu.addEventListener('popupshowing', this.onPopupDisplay.bind(this), false);
            bookmarksPanelContextMenu.addEventListener('popuphidden', this.onPopupHide.bind(this), false);
            this.bookmarkContextItems = []; // Storage for bookmark context menu items.
            addPlacementConfiguration({
                prefName: 'placescontext',
                targetType: OpenWithCore.TARGET_PLACES, // Designates these items for places targets.
                container: this.bookmarkContextItems
            });
        } else {
            console.warn("AppLinkerUtility: Bookmarks/Places context menu not found. Places integration disabled.");
            this.bookmarkContextPlaceholder = null;
        }

        /* --- Bookmarks/Places Context Menu Submenu --- */
        this.bookmarkContextSubmenu = document.getElementById('openwith-placescontextsubmenu');
        this.bookmarkContextSubmenuPopup = document.getElementById('openwith-placescontextsubmenupopup');
        addPlacementConfiguration({
            prefName: 'placescontext.submenu',
            targetType: OpenWithCore.TARGET_PLACES,
            container: this.bookmarkContextSubmenuPopup
        });


        /* --- Browser Tab Context Menu Integration --- */
        // This section involves dynamic creation of menu elements for the tab context menu,
        // as they are typically not pre-defined in XUL.
        try {
            let singleTabReferenceItem, tabContextMenuParent;
            // Logic varies based on the application (e.g., SeaMonkey's anonymous content vs. Firefox's ID-based).
            if (currentApplicationName === 'SeaMonkey') {
                tabContextMenuParent = document.getAnonymousElementByAttribute(mainContentElement, 'anonid', 'tabContextMenu');
                if (tabContextMenuParent) {
                    singleTabReferenceItem = tabContextMenuParent.lastChild; // Use the last child as a reference for insertion.
                }
            } else {
                // For Firefox, find a known tab context menu item to locate its parent.
                singleTabReferenceItem = document.getElementById('context_openTabInWindow') ||
                                         document.getElementById('context_closeTab');
                if (singleTabReferenceItem) {
                    tabContextMenuParent = singleTabReferenceItem.parentNode;
                }
            }

            // Only proceed if a valid tab context menu parent and reference item were found.
            if (tabContextMenuParent && singleTabReferenceItem) {
                // Create a visual separator for better organization.
                this.tabItemSeparator = document.createElement('menuseparator');
                this.tabItemSeparator.id = 'openwith-tabmenuseparator';
                tabContextMenuParent.insertBefore(this.tabItemSeparator, singleTabReferenceItem.nextSibling);

                // Create a placeholder item that will be dynamically hidden/shown.
                this.tabItemPlaceholder = document.createElement('menuitem');
                this.tabItemPlaceholder.id = 'openwith-tabmenuplaceholder';
                this.tabItemPlaceholder.setAttribute('label',
                    OpenWithCore.strings.GetStringFromName('openWithPlaceholderLabel'));
                tabContextMenuParent.insertBefore(this.tabItemPlaceholder, this.tabItemSeparator.nextSibling);

                // Construct the submenu structure for tab-related options.
                this.tabItemSubmenu = document.createElement('menu');
                // Re-use an existing label for consistency in UI strings.
                this.tabItemSubmenu.setAttribute('label',
                    document.getElementById('openwith-viewsubmenu').getAttribute('label'));
                this.tabItemSubmenuPopup = document.createElement('menupopup');
                this.tabItemSubmenu.appendChild(this.tabItemSubmenuPopup);
                tabContextMenuParent.insertBefore(this.tabItemSubmenu, this.tabItemPlaceholder.nextSibling);

                // Attach event handlers to the newly identified tab context menu.
                tabContextMenuParent.addEventListener('popupshowing', this.onPopupDisplay.bind(this), false);
                tabContextMenuParent.addEventListener('popuphidden', this.onPopupHide.bind(this), false);

                // Register the configuration for tab menu items.
                this.tabItemCollection = [];
                addPlacementConfiguration({
                    prefName: 'tabmenu',
                    targetType: OpenWithCore.TARGET_TAB,
                    container: this.tabItemCollection
                });

                /* --- Tab Menu Submenu (nested within tab context menu) --- */
                addPlacementConfiguration({
                    prefName: 'tabmenu.submenu',
                    targetType: OpenWithCore.TARGET_TAB,
                    container: this.tabItemSubmenuPopup
                });
            } else {
                console.warn("AppLinkerUtility: Tab context menu elements could not be fully identified or created. Tab menu integration skipped.");
                this.tabItemPlaceholder = null; // Ensure this is null if setup failed.
            }
        } catch (e) {
            this.tabItemPlaceholder = null; // Mark as unavailable on error.
            console.error('AppLinkerUtility: Encountered an error during tab menu setup:', e);
            Services.console.logStringMessage('AppLinkerUtility: Tab menu items will be unavailable due to a configuration error.');
        }


        /* --- Tab Bar Button Integration (Primarily for legacy Firefox or SeaMonkey) --- */
        // This functionality is often specific to older browser architectures.
        if (currentApplicationName !== 'Firefox' || currentApplicationVersion < 4) {
            try {
                this.tabBarButtonWrapper = document.createElement('toolbaritem');
                this.tabBarButtonWrapper.id = 'openwith-tabbarbox';
                // Assign application-specific CSS classes for visual differentiation.
                this.tabBarButtonWrapper.className = (currentApplicationName === 'SeaMonkey') ?
                    'openwith-tabbarbox-seamonkey tabs-right' : 'openwith-tabbarbox-firefox';
                this.tabBarButtonWrapper.setAttribute('align', 'center');
                this.tabBarButtonWrapper.setAttribute('context', ''); // Allow for a custom context menu on the button.

                let insertionParent, targetInsertionSibling;
                // Complex navigation through anonymous content to find the correct tab bar insertion point.
                insertionParent = document.getAnonymousElementByAttribute(mainContentElement, 'anonid', 'tabcontainer');
                if (insertionParent) {
                    insertionParent = document.getAnonymousNodes(insertionParent).item(0)?.childNodes[1];
                    if (currentApplicationName === 'SeaMonkey' && insertionParent) {
                        insertionParent = insertionParent.firstChild;
                    }

                    targetInsertionSibling = insertionParent?.firstChild;
                    // Loop to find a suitable reference sibling element for insertion.
                    while (targetInsertionSibling &&
                            targetInsertionSibling.localName !== 'arrowscrollbox' &&
                            targetInsertionSibling.id !== 'tabs-right-space' && // Compatibility with Tab Mix Plus.
                            !(currentApplicationName === 'SeaMonkey' && targetInsertionSibling.localName === 'hbox')) {
                        targetInsertionSibling = targetInsertionSibling.nextSibling;
                    }
                    if (targetInsertionSibling) {
                        targetInsertionSibling = targetInsertionSibling.nextSibling; // Insert after the found element.
                    }
                    insertionParent?.insertBefore(this.tabBarButtonWrapper, targetInsertionSibling);

                    // Create the actual toolbar button with a menu dropdown.
                    const dropdownToolbarButton = document.createElement('toolbarbutton');
                    dropdownToolbarButton.setAttribute('type', 'menu');
                    dropdownToolbarButton.setAttribute('image', 'chrome://openwith/content/openwith16.png');
                    dropdownToolbarButton.setAttribute('tooltiptext',
                        OpenWithCore.strings.GetStringFromName('openWithDropDownTooltip'));
                    this.tabBarButtonWrapper.appendChild(dropdownToolbarButton);

                    this.tabBarDropdownMenu = document.createElement('menupopup');
                    dropdownToolbarButton.appendChild(this.tabBarDropdownMenu);

                    // Register the tab bar button configuration.
                    addPlacementConfiguration({
                        prefName: 'tabbar',
                        // Custom 'empty' function to preserve the static toolbar button while clearing dynamic items.
                        empty: function() {
                            while (this.container.childNodes.length > 1) {
                                this.container.removeChild(this.container.lastChild);
                            }
                        },
                        factory: OpenWithCore.createToolbarButton, // Factory for creating button items.
                        container: this.tabBarButtonWrapper
                    });

                    /* --- Tab Bar Menu (Dropdown from the tab bar button) --- */
                    addPlacementConfiguration({
                        prefName: 'tabbar.menu',
                        container: this.tabBarDropdownMenu
                    });
                } else {
                    console.warn("AppLinkerUtility: Tab bar container element not found. Tab bar button integration skipped.");
                    this.tabBarButtonWrapper = null;
                }
            } catch (e) {
                this.tabBarButtonWrapper = null;
                console.error('AppLinkerUtility: An error occurred during tab bar button setup:', e);
                Services.console.logStringMessage('AppLinkerUtility: Tab bar buttons will be unavailable due to an error.');
            }
        }


        /* --- Main Browser Toolbar Button Integration --- */
        // This handles a button that users can drag onto the main browser toolbar.
        this.mainToolbarButtonWrapper = null; // Initialize to null.
        try {
            // First attempt: retrieve by ID, assuming it might already be in the customized toolbar.
            this.mainToolbarButtonWrapper = document.getElementById('openwith-toolbarbox');
            // If not found by direct ID, search within the toolbar palette (for initial placement or customization).
            if (!this.mainToolbarButtonWrapper) {
                const browserToolboxPalette = document.getElementById('navigator-toolbox')?.palette;
                if (browserToolboxPalette) {
                    // Iterate backwards for potential performance if it's typically added at the end.
                    for (let paletteIndex = browserToolboxPalette.childElementCount - 1; paletteIndex >= 0; paletteIndex--) {
                        if (browserToolboxPalette.children[paletteIndex].id === 'openwith-toolbarbox') {
                            this.mainToolbarButtonWrapper = browserToolboxPalette.children[paletteIndex];
                            break;
                        }
                    }
                }
            }

            if (this.mainToolbarButtonWrapper) {
                addPlacementConfiguration({
                    prefName: 'toolbar',
                    // Custom 'empty' function to preserve the static toolbar button while clearing dynamic items.
                    empty: function() {
                        while (this.container.childNodes.length > 1) {
                            this.container.removeChild(this.container.lastChild);
                        }
                    },
                    factory: OpenWithCore.createToolbarButton,
                    container: this.mainToolbarButtonWrapper
                });

                /* --- Main Toolbar Menu (Dropdown from the toolbar button) --- */
                // Locate the menupopup child of the toolbar button.
                this.mainToolbarDropdownMenu = this.mainToolbarButtonWrapper.getElementsByTagName('menupopup').item(0);
                if (this.mainToolbarDropdownMenu) {
                    addPlacementConfiguration({
                        prefName: 'toolbar.menu',
                        container: this.mainToolbarDropdownMenu
                    });
                } else {
                    console.warn("AppLinkerUtility: Main toolbar dropdown menu element not found.");
                }
            } else {
                console.warn("AppLinkerUtility: Main toolbar button container not found. Toolbar integration skipped.");
            }
        } catch (e) {
            this.mainToolbarButtonWrapper = null;
            console.error('AppLinkerUtility: An error occurred during main toolbar button setup:', e);
            Services.console.logStringMessage('AppLinkerUtility: Main toolbar buttons will be unavailable due to an error.');
        }


        /* --- Customizable UI (PanelUI/Hamburger Menu) Integration --- */
        // This is for newer Firefox versions that use the PanelUI (the "hamburger" menu).
        if ('CustomizableUI' in window && document.getElementById('PanelUI-openwith')) {
            const panelUIParentContainer = document.getElementById('PanelUI-openwith')?.firstElementChild;
            if (panelUIParentContainer) {
                addPlacementConfiguration({
                    factory: OpenWithCore.createToolbarButton,
                    targetType: OpenWithCore.TARGET_PANEL_UI,
                    suffix: '_widget', // Standard suffix for PanelUI widget IDs.
                    container: panelUIParentContainer
                });
            } else {
                console.warn("AppLinkerUtility: PanelUI container for 'openwith' not found. PanelUI integration skipped.");
            }
        } else {
            console.log("AppLinkerUtility: CustomizableUI (PanelUI) integration skipped (API not available or element not found).");
        }

        // After all UI elements are identified and configured, load the initial list of applications.
        OpenWithCore.loadList(false);
        // Then, perform an initial refresh of all UI elements to reflect the loaded list and current preferences.
        this.updateUIElements();

        // Register as an observer to react to changes in the application list or UI placement preferences.
        Services.obs.addObserver(this, 'openWithListChanged', true);
        Services.obs.addObserver(this, 'openWithLocationsChanged', true);
    },

    /**
     * XPCOM QueryInterface implementation for observer support.
     * Generates standard interfaces for observing XPCOM notifications.
     */
    getInterface: XPCOMUtils.generateQI([
        Components.interfaces.nsIObserver,
        Components.interfaces.nsISupportsWeakReference,
        Components.interfaces.nsISupports
    ]),

    /**
     * Callback method for XPCOM observer notifications.
     * Responds to specific topics by triggering a UI refresh.
     * @param {object} subject - The subject of the notification.
     * @param {string} topic - The topic string of the notification.
     * @param {string} data - Additional data associated with the notification.
     */
    handleNotification: function(subject, topic, data) {
        // Only react to relevant topics indicating a change in the application list or UI settings.
        if (topic === 'openWithListChanged' || topic === 'openWithLocationsChanged') {
            AppLinkerUtility.updateUIElements();
        }
        // Unrecognized topics are silently ignored.
    },

    /**
     * Updates the visibility and content of all registered UI elements based on current preferences
     * and the state of the external application list.
     */
    updateUIElements: function() {
        // Toggle visibility of the tab bar dropdown menu based on its preference.
        if (this.tabBarDropdownMenu) {
            const isTabBarMenuPrefEnabled = OpenWithCore.prefs.getBoolPref('tabbar.menu');
            this.tabBarDropdownMenu.parentNode.hidden = !isTabBarMenuPrefEnabled;
        }

        // Toggle visibility of the main toolbar dropdown menu based on its preference.
        if (this.mainToolbarDropdownMenu) {
            const isToolbarMenuPrefEnabled = OpenWithCore.prefs.getBoolPref('toolbar.menu');
            this.mainToolbarDropdownMenu.parentNode.hidden = !isToolbarMenuPrefEnabled;
        }

        // Update the flag indicating whether the external application list is empty.
        this.isListEmpty = OpenWithCore.list.length === 0;

        // Delegate the actual UI refresh logic to the OpenWithCore module, passing the document
        // and all registered UI placement configurations.
        OpenWithCore.refreshUI(document, this.uiPlacementConfigs);
    },

    /**
     * Event handler triggered when a menu popup is about to be displayed.
     * Dynamically inserts relevant menu items based on the menu's context and user preferences.
     * @param {Event} event - The DOM event object for 'popupshowing'.
     */
    onPopupDisplay: function(event) {
        // Ensure the event targets the current menu element, not a nested submenu.
        if (event.target !== this) {
            return;
        }

        const activeMenuId = this.id; // The ID of the menu currently showing.

        /**
         * Helper function to insert an array of dynamic menu items into a parent menu.
         * @param {HTMLElement} parentMenu - The menu element where items will be inserted.
         * @param {Array<HTMLElement>} itemsCollection - An array of menu item elements to insert.
         * @param {HTMLElement|null} nextInsertionSibling - The sibling element before which items should be inserted.
         */
        const insertDynamicMenuItems = (parentMenu, itemsCollection, nextInsertionSibling) => {
            for (const dynamicItem of itemsCollection) {
                // Add a specific class to identify these items for later removal.
                dynamicItem.classList.add('app-launcher-dynamic-item');
                parentMenu.insertBefore(dynamicItem, nextInsertionSibling);
            }
        };

        // Handle menu-specific logic based on the menu's ID.
        switch (activeMenuId) {
            case 'menu_viewPopup':
            case 'menu_View_Popup':
            case 'placesContext': {
                let currentDisplayPref, currentSubmenuPref, currentPlaceholder, currentSubmenu, currentItems;
                const evaluatedMenuTargetId = activeMenuId; // Local variable for switch context.

                // Logic specific to the 'placesContext' menu.
                if (evaluatedMenuTargetId === 'placesContext') {
                    // Determine if the right-clicked node is a bookmark item.
                    const isTargetingBookmark = (document.popupNode?.localName === 'menuitem' ||
                                                 (document.popupNode?.localName === 'toolbarbutton' &&
                                                  document.popupNode.getAttribute('type') !== 'menu')) &&
                                                document.popupNode.classList.contains('bookmark-item');

                    // If not targeting a bookmark, hide relevant elements and exit early.
                    if (!isTargetingBookmark) {
                        this.bookmarkContextPlaceholder?.setAttribute('hidden', 'true');
                        this.bookmarkContextSubmenu?.setAttribute('hidden', 'true');
                        return;
                    }

                    currentDisplayPref = OpenWithCore.prefs.getBoolPref('placescontext');
                    currentSubmenuPref = OpenWithCore.prefs.getBoolPref('placescontext.submenu');
                    currentPlaceholder = AppLinkerUtility.bookmarkContextPlaceholder;
                    currentSubmenu = AppLinkerUtility.bookmarkContextSubmenu;
                    currentItems = AppLinkerUtility.bookmarkContextItems;
                } else { // Logic for the general 'View' menu.
                    currentDisplayPref = OpenWithCore.prefs.getBoolPref('viewmenu');
                    currentSubmenuPref = OpenWithCore.prefs.getBoolPref('viewmenu.submenu');
                    // Control the separator's visibility based on menu/submenu prefs and list emptiness.
                    this.mainViewSeparatorElem?.setAttribute('hidden',
                        (!currentDisplayPref && !currentSubmenuPref) || AppLinkerUtility.isListEmpty);
                    currentPlaceholder = AppLinkerUtility.mainViewPlaceholderElem;
                    currentSubmenu = AppLinkerUtility.mainViewSubmenuElem;
                    currentItems = AppLinkerUtility.mainViewItemsArray;
                }

                // Hide the placeholder element as it's replaced by dynamic items.
                currentPlaceholder?.setAttribute('hidden', 'true');
                // Control submenu visibility based on preferences and if the list is empty.
                currentSubmenu?.setAttribute('hidden', !currentSubmenuPref || AppLinkerUtility.isListEmpty);

                // If the main items are enabled and available, insert them.
                if (currentDisplayPref && currentItems.length > 0) {
                    const insertionPoint = currentPlaceholder ? currentPlaceholder.nextSibling : null;
                    insertDynamicMenuItems(this, currentItems, insertionPoint);
                }
                return;
            }
            case 'contentAreaContextMenu': {
                const isCtxMenuEnabled = OpenWithCore.prefs.getBoolPref('contextmenu');
                const isCtxSubmenuEnabled = OpenWithCore.prefs.getBoolPref('contextmenu.submenu');
                const isCtxLinkMenuEnabled = OpenWithCore.prefs.getBoolPref('contextmenulink');
                const isCtxLinkSubmenuEnabled = OpenWithCore.prefs.getBoolPref('contextmenulink.submenu');

                // Determine if generic content menu items should be displayed, based on Firefox's gContextMenu state.
                const canShowGenericContextItems = !(gContextMenu.isContentSelected || gContextMenu.onLink ||
                                                     gContextMenu.onImage || gContextMenu.onCanvas || gContextMenu.onVideo ||
                                                     gContextMenu.onAudio || gContextMenu.onTextInput);

                // Initially hide all context menu related placeholders.
                this.linkContextMenuPlaceholder?.setAttribute('hidden', 'true');
                this.contentAreaPlaceholder?.setAttribute('hidden', 'true');

                // Control visibility of separator and submenus for generic content.
                this.contentAreaSeparator?.setAttribute('hidden',
                    (!isCtxMenuEnabled && !isCtxSubmenuEnabled) || AppLinkerUtility.isListEmpty || !canShowGenericContextItems);
                this.contentAreaSubmenu?.setAttribute('hidden',
                    !isCtxSubmenuEnabled || AppLinkerUtility.isListEmpty || !canShowGenericContextItems);
                // Control visibility of submenu specifically for links.
                this.linkContextSubmenu?.setAttribute('hidden',
                    !isCtxLinkSubmenuEnabled || AppLinkerUtility.isListEmpty || !gContextMenu.onLink || gContextMenu.onMailtoLink);

                // Insert link-specific items if enabled, a link is targeted, and it's not a mailto link.
                if (isCtxLinkMenuEnabled && gContextMenu.onLink && !gContextMenu.onMailtoLink && AppLinkerUtility.linkContextMenuItems.length > 0) {
                    const insertionPoint = this.linkContextMenuPlaceholder ? this.linkContextMenuPlaceholder.nextSibling : null;
                    insertDynamicMenuItems(this, AppLinkerUtility.linkContextMenuItems, insertionPoint);
                }

                // Insert generic content items if enabled and no specific content context applies.
                if (isCtxMenuEnabled && canShowGenericContextItems && AppLinkerUtility.contentAreaItems.length > 0) {
                    const insertionPoint = this.contentAreaPlaceholder ? this.contentAreaPlaceholder.nextSibling : null;
                    insertDynamicMenuItems(this, AppLinkerUtility.contentAreaItems, insertionPoint);
                }
                return;
            }
            default: { // Handles the tab context menu, which may not have a distinct ID.
                if (!AppLinkerUtility.tabItemPlaceholder) {
                    return; // If tab menu elements weren't initialized, exit.
                }

                const isTabMenuEnabled = OpenWithCore.prefs.getBoolPref('tabmenu');
                const isTabSubmenuEnabled = OpenWithCore.prefs.getBoolPref('tabmenu.submenu');

                // Initially hide all tab menu related elements.
                AppLinkerUtility.tabItemPlaceholder.setAttribute('hidden', 'true');
                AppLinkerUtility.tabItemSeparator?.setAttribute('hidden', 'true');
                AppLinkerUtility.tabItemSubmenu?.setAttribute('hidden', 'true');

                // Only show tab menu items if the popup node is indeed a tab.
                if (document.popupNode?.localName !== 'tab') {
                    return;
                }

                // Control visibility of tab menu separator and submenu.
                AppLinkerUtility.tabItemSeparator?.setAttribute('hidden',
                    (!isTabMenuEnabled && !isTabSubmenuEnabled) || AppLinkerUtility.isListEmpty);
                AppLinkerUtility.tabItemSubmenu?.setAttribute('hidden',
                    !isTabSubmenuEnabled || AppLinkerUtility.isListEmpty);

                // Insert tab-specific items if enabled.
                if (isTabMenuEnabled && AppLinkerUtility.tabItemCollection.length > 0) {
                    const insertionPoint = AppLinkerUtility.tabItemPlaceholder.nextSibling;
                    insertDynamicMenuItems(this, AppLinkerUtility.tabItemCollection, insertionPoint);
                }
                return;
            }
        }
    },

    /**
     * Event handler triggered when a menu popup is hidden.
     * Removes dynamically inserted menu items to clean up the UI.
     * @param {Event} event - The DOM event object for 'popuphidden'.
     */
    onPopupHide: function(event) {
        // Ensure the event targets the current menu element.
        if (event.target !== this) {
            return;
        }

        const activeMenuId = this.id; // The ID of the menu currently hiding.

        /**
         * Helper function to remove dynamic menu items inserted previously.
         * Items are identified by the 'app-launcher-dynamic-item' class.
         * @param {HTMLElement} parentMenu - The menu element from which items should be removed.
         * @param {HTMLElement|null} startingSibling - The sibling element from which to start checking for items to remove.
         */
        const removeDynamicMenuItems = (parentMenu, startingSibling) => {
            let currentSibling = startingSibling;
            while (currentSibling && currentSibling.classList.contains('app-launcher-dynamic-item')) {
                const itemToRemove = currentSibling;
                currentSibling = itemToRemove.nextSibling; // Get next sibling before removing current.
                parentMenu.removeChild(itemToRemove);
            }
        };

        // Handle menu-specific cleanup logic.
        switch (activeMenuId) {
            case 'menu_viewPopup':
            case 'menu_View_Popup':
            case 'placesContext': {
                let currentPlaceholder;
                if (activeMenuId === 'placesContext') {
                    currentPlaceholder = AppLinkerUtility.bookmarkContextPlaceholder;
                } else {
                    currentPlaceholder = AppLinkerUtility.mainViewPlaceholderElem;
                }

                if (currentPlaceholder) {
                    currentPlaceholder.removeAttribute('hidden'); // Restore placeholder visibility.
                    removeDynamicMenuItems(this, currentPlaceholder.nextSibling);
                }
                return;
            }
            case 'contentAreaContextMenu': {
                if (AppLinkerUtility.linkContextMenuPlaceholder) {
                    AppLinkerUtility.linkContextMenuPlaceholder.removeAttribute('hidden'); // Restore visibility.
                    removeDynamicMenuItems(this, AppLinkerUtility.linkContextMenuPlaceholder.nextSibling);
                }
                if (AppLinkerUtility.contentAreaPlaceholder) {
                    AppLinkerUtility.contentAreaPlaceholder.removeAttribute('hidden'); // Restore visibility.
                    removeDynamicMenuItems(this, AppLinkerUtility.contentAreaPlaceholder.nextSibling);
                }
                return;
            }
            default: { // Tab menu cleanup.
                if (AppLinkerUtility.tabItemPlaceholder) {
                    AppLinkerUtility.tabItemPlaceholder.removeAttribute('hidden'); // Restore visibility.
                    removeDynamicMenuItems(this, AppLinkerUtility.tabItemPlaceholder.nextSibling);
                }
                return;
            }
        }
    }
};

// Register the main utility's initialization method to run once the window has fully loaded.
window.addEventListener('load', AppLinkerUtility.initialSetup, false);