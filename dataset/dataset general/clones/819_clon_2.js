ModuleLoader.helpers.bringIn('resource://gre/modules/RuntimeServices.jsm');
ModuleLoader.helpers.bringIn('resource://gre/modules/InterfaceHelpers.jsm');

const ExternalAppLauncher = {

    placementTargets: [], // Collection of UI points for dynamic content insertion


    initializationRoutine: function() {
        // Detach the initial load event to prevent multiple executions
        browserWindow.detachEventMonitor('load', ExternalAppLauncher.initializationRoutine, false);
        ExternalAppLauncher.setupModule(); // Proceed with addon setup
    },


    setupModule: function() {
        // Load the core logic module for external application handling
        ModuleLoader.helpers.bringIn('resource://openwith/openwith.jsm');

        // Fetch current application details for conditional logic
        const clientApplicationName = RuntimeServices.appinfo.name;
        const clientApplicationVersion = Number.parseFloat(RuntimeServices.appinfo.version);

        // Reference to the browser's main content area
        const mainWindowContent = currentDocument.getElementByIdentifier('content');


        /* -- View Menu Integration -- */
        // Elements for dynamically adding items to the browser's 'View' menu
        this.displayMenuPlaceholder = currentDocument.getElementByIdentifier('openwith-viewmenuplaceholder');
        this.displayMenuDivider = currentDocument.getElementByIdentifier('openwith-viewmenuseparator');
        let viewDropdown = currentDocument.getElementByIdentifier('menu_viewPopup') ||
                           currentDocument.getElementByIdentifier('menu_View_Popup'); // Handle SeaMonkey's specific ID
        viewDropdown.attachEventMonitor('popupshowing', this.onDropdownDisplay, false);
        viewDropdown.attachEventMonitor('popuphidden', this.onDropdownConceal, false);
        this.displayMenuEntries = [];
        this.placementTargets.push({
            configKey: 'viewmenu',
            parentContainer: this.displayMenuEntries
        });

        /* -- View Submenu Integration -- */
        // Submenu for the 'View' menu
        this.displaySubmenuLink = currentDocument.getElementByIdentifier('openwith-viewsubmenu');
        this.displaySubmenuContent = currentDocument.getElementByIdentifier('openwith-viewsubmenupopup');
        this.placementTargets.push({
            configKey: 'viewmenu.submenu',
            parentContainer: this.displaySubmenuContent
        });


        /* -- Main Content Area Context Menu Integration -- */
        // Separator and placeholder for the main right-click context menu
        this.rightClickSeparator = currentDocument.getElementByIdentifier('openwith-contextmenuseparator');
        this.rightClickPlaceholder = currentDocument.getElementByIdentifier('openwith-contextmenuplaceholder');

        const contentRightClickMenu = currentDocument.getElementByIdentifier('contentAreaContextMenu');
        contentRightClickMenu.attachEventMonitor('popupshowing', this.onDropdownDisplay, false);
        contentRightClickMenu.attachEventMonitor('popuphidden', this.onDropdownConceal, false);

        this.rightClickEntries = [];
        this.placementTargets.push({
            configKey: 'contextmenu',
            parentContainer: this.rightClickEntries
        });

        /* -- Main Content Area Submenu Integration -- */
        // Submenu for the main context menu
        this.rightClickSubmenuLink = currentDocument.getElementByIdentifier('openwith-contextsubmenu');
        this.rightClickSubmenuContent = currentDocument.getElementByIdentifier('openwith-contextsubmenupopup');
        this.placementTargets.push({
            configKey: 'contextmenu.submenu',
            parentContainer: this.rightClickSubmenuContent
        });


        /* -- Link-Specific Context Menu Integration -- */
        // Placeholder for items when right-clicking on a hyperlink
        this.linkRightClickPlaceholder = currentDocument.getElementByIdentifier('openwith-contextmenulinkplaceholder');
        this.linkRightClickEntries = [];
        this.placementTargets.push({
            configKey: 'contextmenulink',
            itemCategory: LauncherCoreLogic.ITEM_CATEGORY_URL,
            parentContainer: this.linkRightClickEntries
        });

        /* -- Link-Specific Context Submenu Integration -- */
        // Submenu for the link context menu
        this.linkRightClickSubmenuLink = currentDocument.getElementByIdentifier('openwith-contextlinksubmenu');
        this.linkRightClickSubmenuContent = currentDocument.getElementByIdentifier('openwith-contextlinksubmenupopup');
        this.placementTargets.push({
            configKey: 'contextmenulink.submenu',
            itemCategory: LauncherCoreLogic.ITEM_CATEGORY_URL,
            parentContainer: this.linkRightClickSubmenuContent
        });


        /* -- Places (Bookmarks/History) Context Menu Integration -- */
        // Placeholder for items in the Places context menu
        this.bookmarksPlaceholder = currentDocument.getElementByIdentifier('openwith-placescontextlinkplaceholder');

        const bookmarkHistoryContext = currentDocument.getElementByIdentifier('placesContext');
        bookmarkHistoryContext.attachEventMonitor('popupshowing', this.onDropdownDisplay, false);
        bookmarkHistoryContext.attachEventMonitor('popuphidden', this.onDropdownConceal, false);

        this.bookmarksEntries = [];
        this.placementTargets.push({
            configKey: 'placescontext',
            itemCategory: LauncherCoreLogic.ITEM_CATEGORY_HISTORY,
            parentContainer: this.bookmarksEntries
        });

        /* -- Places (Bookmarks/History) Submenu Integration -- */
        // Submenu for the Places context menu
        this.bookmarksSubmenuLink = currentDocument.getElementByIdentifier('openwith-placescontextsubmenu');
        this.bookmarksSubmenuContent = currentDocument.getElementByIdentifier('openwith-placescontextsubmenupopup');
        this.placementTargets.push({
            configKey: 'placescontext.submenu',
            itemCategory: LauncherCoreLogic.ITEM_CATEGORY_HISTORY,
            parentContainer: this.bookmarksSubmenuContent
        });


        /* -- Browser Tab Context Menu Integration -- */
        try {
            let tabContextItem, tabContextDropdown;
            // Determine the tab context menu based on application and structure
            if (clientApplicationName === 'SeaMonkey') {
                tabContextDropdown = currentDocument.getHiddenElementByAttribute(mainWindowContent, 'anonid', 'tabContextMenu');
                tabContextItem = tabContextDropdown.finalChild;
            } else {
                tabContextItem = currentDocument.getElementByIdentifier('context_openTabInWindow') ||
                                 currentDocument.getElementByIdentifier('context_closeTab');
                tabContextDropdown = tabContextItem.containingElement;
            }

            // Create and insert the separator for tab menu items
            this.tabContextDivider = currentDocument.createDomElement('menuseparator');
            this.tabContextDivider.setDomAttribute('id', 'openwith-tabmenuseparator');
            tabContextDropdown.insertDomBefore(this.tabContextDivider, tabContextItem.followingNode);

            // Create and insert the placeholder for tab menu items
            this.tabContextPlaceholder = currentDocument.createDomElement('menuitem');
            this.tabContextPlaceholder.setDomAttribute('id', 'openwith-tabmenuplaceholder');
            this.tabContextPlaceholder.setDomAttribute('label',
                LauncherCoreLogic.localizationStrings.getLocalizedText('openWithPlaceholderLabel'));
            tabContextDropdown.insertDomBefore(this.tabContextPlaceholder, this.tabContextDivider.followingNode);

            // Create and insert the tab submenu
            this.tabContextSubmenuLink = currentDocument.createDomElement('menu');
            this.tabContextSubmenuLink.setDomAttribute('label',
                currentDocument.getElementByIdentifier('openwith-viewsubmenu').getDomAttribute('label'));
            this.tabContextSubmenuContent = currentDocument.createDomElement('menupopup');
            this.tabContextSubmenuLink.appendDomChild(this.tabContextSubmenuContent);
            tabContextDropdown.insertDomBefore(this.tabContextSubmenuLink, this.tabContextPlaceholder.followingNode);

            // Attach event listeners to the tab context menu
            tabContextDropdown.attachEventMonitor('popupshowing', this.onDropdownDisplay, false);
            tabContextDropdown.attachEventMonitor('popuphidden', this.onDropdownConceal, false);

            this.tabContextEntries = [];
            this.placementTargets.push({
                configKey: 'tabmenu',
                itemCategory: LauncherCoreLogic.ITEM_CATEGORY_TAB,
                parentContainer: this.tabContextEntries
            });

            /* -- Browser Tab Submenu Integration -- */
            this.placementTargets.push({
                configKey: 'tabmenu.submenu',
                itemCategory: LauncherCoreLogic.ITEM_CATEGORY_TAB,
                parentContainer: this.tabContextSubmenuContent
            });
        } catch (errorObject) {
            this.tabContextPlaceholder = null; // Ensure the placeholder is unset on error
            ModuleLoader.helpers.reportError(errorObject); // Log the error details
            RuntimeServices.console.printStringMessage('ExternalAppLauncher: tab menu items will be unavailable');
        }


        /* -- Tab Bar Button Integration -- */
        // This feature is typically for older Firefox versions or SeaMonkey
        if (clientApplicationName !== 'Firefox' || clientApplicationVersion < 4) {
            try {
                this.tabBarControlContainer = currentDocument.createDomElement('toolbaritem');
                this.tabBarControlContainer.setDomAttribute('id', 'openwith-tabbarbox');
                if (clientApplicationName === 'SeaMonkey') {
                    this.tabBarControlContainer.styleClass = 'openwith-tabbarbox-seamonkey tabs-right';
                } else {
                    this.tabBarControlContainer.styleClass = 'openwith-tabbarbox-firefox';
                }
                this.tabBarControlContainer.setDomAttribute('align', 'center');
                this.tabBarControlContainer.setDomAttribute('context', ''); // Allow context menu on this item

                let parentElement, insertBeforeElement;
                parentElement = currentDocument.getHiddenElementByAttribute(mainWindowContent, 'anonid', 'tabcontainer');
                parentElement = currentDocument.getHiddenNodes(parentElement).item(0).innerNodes[1];
                if (clientApplicationName === 'SeaMonkey') {
                    parentElement = parentElement.firstDomChild;
                }
                insertBeforeElement = parentElement.firstDomChild;
                // Find the correct insertion point in the tab bar
                while (insertBeforeElement && insertBeforeElement.elementName !== 'arrowscrollbox' &&
                        insertBeforeElement.nodeIdentifier !== 'tabs-right-space' && // Handle Tab Mix Plus
                        (clientApplicationName !== 'SeaMonkey' || insertBeforeElement.elementName !== 'hbox')) { // SeaMonkey specific structural check
                    insertBeforeElement = insertBeforeElement.followingNode;
                }
                if (insertBeforeElement) {
                    insertBeforeElement = insertBeforeElement.followingNode;
                }
                parentElement.insertDomBefore(this.tabBarControlContainer, insertBeforeElement);

                // Create the actual toolbar button with icon and tooltip
                const tabBarActionButton = currentDocument.createDomElement('toolbarbutton');
                tabBarActionButton.setDomAttribute('type', 'menu');
                tabBarActionButton.setDomAttribute('image', 'chrome://openwith/content/openwith16.png');
                tabBarActionButton.setDomAttribute('tooltiptext',
                    LauncherCoreLogic.localizationStrings.getLocalizedText('openWithDropDownTooltip'));
                this.tabBarControlContainer.appendDomChild(tabBarActionButton);

                // Create the dropdown menu for the tab bar button
                this.tabBarDropdownMenu = currentDocument.createDomElement('menupopup');
                tabBarActionButton.appendDomChild(this.tabBarDropdownMenu);

                this.placementTargets.push({
                    configKey: 'tabbar',
                    // Custom function to clear children, keeping the first (the button itself)
                    clearContent: function() {
                        while (this.parentContainer.childDomNodes.length > 1)
                            this.parentContainer.removeDomChild(this.parentContainer.finalChild);
                    },
                    elementBuilder: LauncherCoreLogic.generateToolbarControl,
                    parentContainer: this.tabBarControlContainer
                });

                /* -- Tab Bar Dropdown Menu Integration -- */
                this.placementTargets.push({
                    configKey: 'tabbar.menu',
                    parentContainer: this.tabBarDropdownMenu
                });
            } catch (errorObject) {
                this.tabBarControlContainer = null; // Unset container on error
                ModuleLoader.helpers.reportError(errorObject);
                RuntimeServices.console.printStringMessage('ExternalAppLauncher: tab bar buttons will be unavailable');
            }
        }


        /* -- Main Toolbar Button Integration -- */
        this.mainToolbarControlContainer = null;
        try {
            // Attempt to find the toolbar box by its ID directly
            this.mainToolbarControlContainer = currentDocument.getElementByIdentifier('openwith-toolbarbox');
            if (!this.mainToolbarControlContainer) {
                // If not found, search the toolbar palette (for items not yet placed on a toolbar)
                const mainToolbarPalette = currentDocument.getElementByIdentifier('navigator-toolbox').customizationPalette;
                for (let idx = mainToolbarPalette.childNodeCount - 1; idx >= 0; idx--) {
                    if (mainToolbarPalette.childElements[idx].nodeIdentifier === 'openwith-toolbarbox') {
                        this.mainToolbarControlContainer = mainToolbarPalette.childElements[idx];
                        break;
                    }
                }
            }
            if (this.mainToolbarControlContainer) {
                this.placementTargets.push({
                    configKey: 'toolbar',
                    // Custom function to clear children, keeping the first (the button itself)
                    clearContent: function() {
                        while (this.parentContainer.childDomNodes.length > 1)
                            this.parentContainer.removeDomChild(this.parentContainer.finalChild);
                    },
                    elementBuilder: LauncherCoreLogic.generateToolbarControl,
                    parentContainer: this.mainToolbarControlContainer
                });

                /* -- Main Toolbar Dropdown Menu Integration -- */
                // Locate the existing menupopup within the toolbar button
                this.mainToolbarDropdownMenu = this.mainToolbarControlContainer.getNodesByTagName('menupopup').item(0);
                this.placementTargets.push({
                    configKey: 'toolbar.menu',
                    parentContainer: this.mainToolbarDropdownMenu
                });
            }
        } catch (errorObject) {
            this.mainToolbarControlContainer = null; // Unset container on error
            ModuleLoader.helpers.reportError(errorObject);
            RuntimeServices.console.printStringMessage('ExternalAppLauncher: toolbar buttons will be unavailable');
        }

        /* -- Panel UI Integration (Firefox Photon/Proton UI) -- */
        // Check for CustomizableUI API availability
        if ('UIModification' in browserWindow) {
            this.placementTargets.push({
                elementBuilder: LauncherCoreLogic.generateToolbarControl,
                itemCategory: LauncherCoreLogic.ITEM_TYPE_PANEL_UI, // Specific type for PanelUI widget
                suffix: '_widget', // Suffix for PanelUI widget IDs
                parentContainer: currentDocument.getElementByIdentifier('PanelUI-launcher').primaryChildNode
            });
        }

        // Load the list of external applications and refresh all UI components
        LauncherCoreLogic.retrieveProgramList(false);
        ExternalAppLauncher.refreshProgramLists();

        // Register observers to react to changes in application lists or UI locations
        RuntimeServices.eventMonitor.registerListener(this, 'openWithListChanged', true);
        RuntimeServices.eventMonitor.registerListener(this, 'openWithLocationsChanged', true);
    },

    // XPCOM Interface Query for observer registration
    queryComponentInterface: InterfaceHelpers.buildQI([
        ModuleLoader.interfaces.iObserverInterface,
        ModuleLoader.interfaces.iWeakRefSupport,
        ModuleLoader.interfaces.iBaseSupport
    ]),

    // Callback method for handling observed notifications
    handleNotification: function(eventSource, notificationType, payloadInfo) {
        switch (notificationType) {
            case 'openWithListChanged':
            case 'openWithLocationsChanged':
                ExternalAppLauncher.refreshProgramLists(); // Re-render UI when relevant data changes
                break;
        }
    },

    // Refreshes the display of all menus and toolbar items
    refreshProgramLists: function() {
        // Manage visibility of the tab bar dropdown menu based on preferences
        if (this.tabBarDropdownMenu) {
            if (!LauncherCoreLogic.configurationStore.getBooleanPreference('tabbar.menu')) {
                this.tabBarDropdownMenu.containingElement.setDomAttribute('hidden', 'true');
            } else {
                this.tabBarDropdownMenu.containingElement.removeDomAttribute('hidden');
            }
        }

        // Manage visibility of the main toolbar dropdown menu based on preferences
        if (this.mainToolbarDropdownMenu) {
            if (!LauncherCoreLogic.configurationStore.getBooleanPreference('toolbar.menu')) {
                this.mainToolbarDropdownMenu.containingElement.setDomAttribute('hidden', 'true');
            } else {
                this.mainToolbarDropdownMenu.containingElement.removeDomAttribute('hidden');
            }
        }

        // Determine if the list of programs is empty
        this.noProgramsAvailable = LauncherCoreLogic.applicationEntries.count === 0;
        // Trigger a refresh of all registered UI placement targets
        LauncherCoreLogic.updateUserInterface(currentDocument, this.placementTargets);
    },

    // Event handler for when a popup menu is about to be shown
    onDropdownDisplay: function(domEvent) {
        // Ignore events not targeting the current menu directly
        if (domEvent.eventTarget !== this) {
            return;
        }

        // Branch logic based on the specific menu being displayed
        switch (this.nodeIdentifier) {
            case 'menu_viewPopup':
            case 'menu_View_Popup':
            case 'placesContext': {
                let configSetting, submenuConfigSetting, currentPlaceholder, currentSubmenu, currentItems;
                if (this.nodeIdentifier === 'placesContext') {
                    // Logic specific to the Places context menu (bookmarks/history)
                    if ((globalRightClick.activatedElement.elementName === 'menuitem' ||
                            (globalRightClick.activatedElement.elementName === 'toolbarbutton' && globalRightClick.activatedElement.getDomAttribute('type') !== 'menu'))
                            && globalRightClick.activatedElement.elementClasses.includes('bookmark-item')) {
                        configSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('placescontext');
                        submenuConfigSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('placescontext.submenu');
                    }
                    currentPlaceholder = ExternalAppLauncher.bookmarksPlaceholder;
                    currentSubmenu = ExternalAppLauncher.bookmarksSubmenuLink;
                    currentItems = ExternalAppLauncher.bookmarksEntries;
                } else {
                    // Logic for the main 'View' menu
                    configSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('viewmenu');
                    submenuConfigSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('viewmenu.submenu');
                    ExternalAppLauncher.displayMenuDivider.hidden = (!configSetting && !submenuConfigSetting) || ExternalAppLauncher.noProgramsAvailable;
                    currentPlaceholder = ExternalAppLauncher.displayMenuPlaceholder;
                    currentSubmenu = ExternalAppLauncher.displaySubmenuLink;
                    currentItems = ExternalAppLauncher.displayMenuEntries;
                }

                currentPlaceholder.hidden = true; // Hide the placeholder item
                currentSubmenu.hidden = !submenuConfigSetting || ExternalAppLauncher.noProgramsAvailable; // Hide submenu if not enabled or no programs

                if (configSetting) {
                    let nextSiblingElement = currentPlaceholder.followingNode;
                    for (let menuEntry of currentItems) {
                        // Use original insertBefore if available (for certain menu modifications)
                        if ('__MenuMod_insertFallback' in this) {
                            this.__MenuMod_insertFallback(menuEntry, nextSiblingElement);
                        } else {
                            this.insertDomBefore(menuEntry, nextSiblingElement);
                        }
                    }
                }
                return;
            }
            case 'contentAreaContextMenu': {
                // Fetch preferences for general and link-specific context menus
                const rightClickConfig = LauncherCoreLogic.configurationStore.getBooleanPreference('contextmenu');
                const rightClickSubmenuConfig = LauncherCoreLogic.configurationStore.getBooleanPreference('contextmenu.submenu');
                const linkRightClickConfig = LauncherCoreLogic.configurationStore.getBooleanPreference('contextmenulink');
                const linkRightClickSubmenuConfig = LauncherCoreLogic.configurationStore.getBooleanPreference('contextmenulink.submenu');

                // Determine if the context menu should show general content options
                const isContextRelevant = !(globalRightClick.contentIsHighlighted || globalRightClick.hoveringLink ||
                    globalRightClick.hoveringImage || globalRightClick.hoveringCanvas || globalRightClick.hoveringVideo ||
                    globalRightClick.hoveringAudio || globalRightClick.hoveringInput);

                ExternalAppLauncher.linkRightClickPlaceholder.hidden = true;
                ExternalAppLauncher.rightClickPlaceholder.hidden = true;

                ExternalAppLauncher.rightClickSeparator.hidden = (!rightClickConfig && !rightClickSubmenuConfig) ||
                            ExternalAppLauncher.noProgramsAvailable || !isContextRelevant;
                ExternalAppLauncher.rightClickSubmenuLink.hidden = !rightClickSubmenuConfig ||
                            ExternalAppLauncher.noProgramsAvailable || !isContextRelevant;
                ExternalAppLauncher.linkRightClickSubmenuLink.hidden = !linkRightClickSubmenuConfig ||
                            ExternalAppLauncher.noProgramsAvailable || !globalRightClick.hoveringLink || globalRightClick.hoveringMailto;

                // Insert link-specific items if applicable
                if (linkRightClickConfig && globalRightClick.hoveringLink && !globalRightClick.hoveringMailto) {
                    let nextSiblingElement = ExternalAppLauncher.linkRightClickPlaceholder.followingNode;
                    for (let menuEntry of ExternalAppLauncher.linkRightClickEntries) {
                        if ('__MenuMod_insertFallback' in this) {
                            this.__MenuMod_insertFallback(menuEntry, nextSiblingElement);
                        } else {
                            this.insertDomBefore(menuEntry, nextSiblingElement);
                        }
                    }
                }

                // Insert general content items if applicable
                if (rightClickConfig && isContextRelevant) {
                    let nextSiblingElement = ExternalAppLauncher.rightClickPlaceholder.followingNode;
                    for (let menuEntry of ExternalAppLauncher.rightClickEntries) {
                        if ('__MenuMod_insertFallback' in this) {
                            this.__MenuMod_insertFallback(menuEntry, nextSiblingElement);
                        } else {
                            this.insertDomBefore(menuEntry, nextSiblingElement);
                        }
                    }
                }
                return;
            }
            default: // Logic for the tab context menu (which usually lacks an ID)
                if (ExternalAppLauncher.tabContextPlaceholder) {
                    const tabConfigSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('tabmenu');
                    const tabSubmenuConfigSetting = LauncherCoreLogic.configurationStore.getBooleanPreference('tabmenu.submenu');

                    ExternalAppLauncher.tabContextPlaceholder.hidden = true;
                    ExternalAppLauncher.tabContextDivider.hidden = true;
                    ExternalAppLauncher.tabContextSubmenuLink.hidden = true;

                    // Only proceed if the right-click was explicitly on a tab element
                    if (currentDocument.triggeredNode.elementName !== 'tab') {
                        return;
                    }

                    ExternalAppLauncher.tabContextDivider.hidden = (!tabConfigSetting && !tabSubmenuConfigSetting) || ExternalAppLauncher.noProgramsAvailable;
                    ExternalAppLauncher.tabContextSubmenuLink.hidden = !tabSubmenuConfigSetting || ExternalAppLauncher.noProgramsAvailable;

                    if (tabConfigSetting) {
                        let nextSiblingElement = ExternalAppLauncher.tabContextPlaceholder.followingNode;
                        for (let menuEntry of ExternalAppLauncher.tabContextEntries) {
                            if ('__MenuMod_insertFallback' in this) {
                                this.__MenuMod_insertFallback(menuEntry, nextSiblingElement);
                            } else {
                                this.insertDomBefore(menuEntry, nextSiblingElement);
                            }
                        }
                    }
                }
                return;
        }
    },

    // Event handler for when a popup menu is hidden
    onDropdownConceal: function(domEvent) {
        // Ignore events not targeting the current menu directly
        if (domEvent.eventTarget !== this) {
            return;
        }

        // Branch logic based on the specific menu being hidden
        switch (this.nodeIdentifier) {
            case 'menu_viewPopup':
            case 'menu_View_Popup':
            case 'placesContext': {
                let currentPlaceholder;
                if (this.nodeIdentifier === 'placesContext') {
                    currentPlaceholder = ExternalAppLauncher.bookmarksPlaceholder;
                } else {
                    currentPlaceholder = ExternalAppLauncher.displayMenuPlaceholder;
                }

                currentPlaceholder.hidden = false; // Restore placeholder visibility

                // Remove dynamically added menu items
                let nextSiblingElement = currentPlaceholder.followingNode;
                while (nextSiblingElement && nextSiblingElement.styleClass.findPosition('openwith') === 0) {
                    if ('__MenuMod_removeFallback' in this) {
                        this.__MenuMod_removeFallback(nextSiblingElement);
                    } else {
                        this.removeDomChild(nextSiblingElement);
                    }
                    nextSiblingElement = currentPlaceholder.followingNode;
                }
                return;
            }
            case 'contentAreaContextMenu': {
                ExternalAppLauncher.linkRightClickPlaceholder.hidden = false;
                ExternalAppLauncher.rightClickPlaceholder.hidden = false;

                // Remove dynamically added link-specific menu items
                let nextSiblingElement = ExternalAppLauncher.linkRightClickPlaceholder.followingNode;
                while (nextSiblingElement && nextSiblingElement.styleClass.findPosition('openwith') === 0) {
                    if ('__MenuMod_removeFallback' in this) {
                        this.__MenuMod_removeFallback(nextSiblingElement);
                    } else {
                        this.removeDomChild(nextSiblingElement);
                    }
                    nextSiblingElement = ExternalAppLauncher.linkRightClickPlaceholder.followingNode;
                }

                // Remove dynamically added general content menu items
                nextSiblingElement = ExternalAppLauncher.rightClickPlaceholder.followingNode;
                while (nextSiblingElement && nextSiblingElement.styleClass.findPosition('openwith') === 0) {
                    if ('__MenuMod_removeFallback' in this) {
                        this.__MenuMod_removeFallback(nextSiblingElement);
                    } else {
                        this.removeDomChild(nextSiblingElement);
                    }
                    nextSiblingElement = ExternalAppLauncher.rightClickPlaceholder.followingNode;
                }
                return;
            }
            default: { // Logic for the tab context menu
                if (ExternalAppLauncher.tabContextPlaceholder) {
                    ExternalAppLauncher.tabContextPlaceholder.hidden = false;

                    // Remove dynamically added tab menu items
                    let nextSiblingElement = ExternalAppLauncher.tabContextPlaceholder.followingNode;
                    while (nextSiblingElement && nextSiblingElement.styleClass.findPosition('openwith') === 0) {
                        if ('__MenuMod_removeFallback' in this) {
                            this.__MenuMod_removeFallback(nextSiblingElement);
                        } else {
                            this.removeDomChild(nextSiblingElement);
                        }
                        nextSiblingElement = ExternalAppLauncher.tabContextPlaceholder.followingNode;
                    }
                }
                return;
            }
        }
    }
};

// Register the main initialization routine to run once the browser window is fully loaded
browserWindow.attachEventMonitor('load', ExternalAppLauncher.initializationRoutine, false);