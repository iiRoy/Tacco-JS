const InterfaceOverseer = (function() {

    let elementRegistry = new Map();
    let dynamicItemHolders = new Map();
    let notificationSubscriptionManager;

    const domOperations = {
        retrieveElement: (identifier) => document.getElementById(identifier),
        fabricateNode: (tag, attributes = {}) => {
            const node = document.createElement(tag);
            for (const key in attributes) {
                node.setAttribute(key, attributes[key]);
            }
            return node;
        },
        alterVisibility: (item, shouldBeHidden) => {
            if (item) {
                item.hidden = shouldBeHidden;
            }
        },
        injectDynamicElements: (parentContainer, insertionPoint, contentList) => {
            const insertionReference = insertionPoint ? insertionPoint.nextSibling : null;
            for (const item of contentList) {
                if ('__MenuEdit_insertBefore_orig' in parentContainer) {
                    parentContainer.__MenuEdit_insertBefore_orig(item, insertionReference);
                } else {
                    parentContainer.insertBefore(item, insertionReference);
                }
            }
        },
        extractDynamicElements: (parentContainer, startingPoint, itemIdentifierPrefix) => {
            let currentNode = startingPoint ? startingPoint.nextSibling : null;
            while (currentNode && currentNode.className && currentNode.className.startsWith(itemIdentifierPrefix)) {
                const nextCandidate = currentNode.nextSibling;
                if ('__MenuEdit_removeChild_orig' in parentContainer) {
                    parentContainer.__MenuEdit_removeChild_orig(currentNode);
                } else {
                    parentContainer.removeChild(currentNode);
                }
                currentNode = nextCandidate;
            }
        }
    };

    const interfaceComponentDefinitions = [
        {
            componentName: 'mainViewInterface',
            domId: 'menu_viewPopup',
            alternateDomId: 'menu_View_Popup',
            preferenceKey: 'viewmenu',
            submenuPreferenceKey: 'viewmenu.submenu',
            placeholderDomId: 'openwith-viewmenuplaceholder',
            separatorDomId: 'openwith-viewmenuseparator',
            submenuDomId: 'openwith-viewsubmenu',
            itemContainerKey: 'viewDisplayItems',
            contextEvaluation: () => true,
        },
        {
            componentName: 'contextAreaInterface',
            domId: 'contentAreaContextMenu',
            preferenceKey: 'contextmenu',
            submenuPreferenceKey: 'contextmenu.submenu',
            placeholderDomId: 'openwith-contextmenuplaceholder',
            separatorDomId: 'openwith-contextmenuseparator',
            submenuDomId: 'openwith-contextsubmenu',
            itemContainerKey: 'contextDisplayItems',
            contextEvaluation: () => !(gContextMenu.isContentSelected || gContextMenu.onLink ||
                                  gContextMenu.onImage || gContextMenu.onCanvas || gContextMenu.onVideo ||
                                  gContextMenu.onAudio || gContextMenu.onTextInput),
        },
        {
            componentName: 'contextAreaLinkInterface',
            domId: 'contentAreaContextMenu',
            preferenceKey: 'contextmenulink',
            submenuPreferenceKey: 'contextmenulink.submenu',
            placeholderDomId: 'openwith-contextmenulinkplaceholder',
            submenuDomId: 'openwith-contextlinksubmenu',
            itemContainerKey: 'contextLinkDisplayItems',
            targetCategory: 'TARGET_LINK',
            contextEvaluation: () => gContextMenu.onLink && !gContextMenu.onMailtoLink,
        },
        {
            componentName: 'placesInterface',
            domId: 'placesContext',
            preferenceKey: 'placescontext',
            submenuPreferenceKey: 'placescontext.submenu',
            placeholderDomId: 'openwith-placescontextlinkplaceholder',
            submenuDomId: 'openwith-placescontextsubmenu',
            itemContainerKey: 'placesDisplayItems',
            targetCategory: 'TARGET_PLACES',
            contextEvaluation: () => (document.popupNode.localName === 'menuitem' ||
                                 (document.popupNode.localName === 'toolbarbutton' && document.popupNode.getAttribute('type') !== 'menu')) &&
                                 document.popupNode.classList.contains('bookmark-item'),
        },
        {
            componentName: 'tabInterface',
            domId: null,
            preferenceKey: 'tabmenu',
            submenuPreferenceKey: 'tabmenu.submenu',
            placeholderDomId: 'openwith-tabmenuplaceholder',
            separatorDomId: 'openwith-tabmenuseparator',
            submenuDomId: 'openwith-tabsubmenu',
            itemContainerKey: 'tabDisplayItems',
            targetCategory: 'TARGET_TAB',
            contextEvaluation: () => document.popupNode && document.popupNode.localName === 'tab',
        },
        {
            componentName: 'tabBarMechanism',
            preferenceKey: 'tabbar',
            itemContainerKey: 'tabBarButtons',
            clearMethod: function() {
                const containerNode = elementRegistry.get('tabButtonBox');
                if (containerNode) {
                    while (containerNode.childNodes.length > 1) {
                        containerNode.removeChild(containerNode.lastChild);
                    }
                }
            },
            creationMethod: OpenWithCore.createToolbarButton,
            containerDomId: 'openwith-tabbarbox',
        },
        {
            componentName: 'tabBarSubmenuMechanism',
            preferenceKey: 'tabbar.menu',
            containerDomId: 'tabBarMenuPopupNode',
        },
        {
            componentName: 'toolbarMechanism',
            preferenceKey: 'toolbar',
            clearMethod: function() {
                const containerNode = elementRegistry.get('toolbarButtonBox');
                if (containerNode) {
                    while (containerNode.childNodes.length > 1) {
                        containerNode.removeChild(containerNode.lastChild);
                    }
                }
            },
            creationMethod: OpenWithCore.createToolbarButton,
            containerDomId: 'openwith-toolbarbox',
        },
        {
            componentName: 'toolbarSubmenuMechanism',
            preferenceKey: 'toolbar.menu',
            containerDomId: 'toolbarMenuPopupNode',
        },
        {
            componentName: 'panelInterfaceWidget',
            creationMethod: OpenWithCore.createToolbarButton,
            targetCategory: 'TARGET_PANEL_UI',
            labelSuffix: '_widget',
            containerDomId: 'PanelUI-openwith',
            contextEvaluation: () => 'CustomizableUI' in window,
        }
    ];

    const registeredLocations = [];

    class CustomObserverAgent {
        constructor(responseFunction) {
            this.callbackExecutor = responseFunction;
        }

        QueryInterface(iid) {
            return XPCOMUtils.generateQI([
                Components.interfaces.nsIObserver,
                Components.interfaces.nsISupportsWeakReference,
                Components.interfaces.nsISupports
            ]).QueryInterface(iid);
        }

        observe(subject, topic, data) {
            switch (topic) {
                case 'openWithListChanged':
                case 'openWithLocationsChanged':
                    this.callbackExecutor();
                    break;
            }
        }
    }

    function setupEnvironment() {
        Components.utils.import('resource://openwith/openwith.jsm');

        const applicationIdentifier = Services.appinfo.name;
        const applicationVersionNumber = parseFloat(Services.appinfo.version);

        const mainContentArea = domOperations.retrieveElement('content');

        for (const definition of interfaceComponentDefinitions) {
            if (definition.placeholderDomId) {
                elementRegistry.set(definition.placeholderDomId, domOperations.retrieveElement(definition.placeholderDomId));
            }
            if (definition.separatorDomId) {
                elementRegistry.set(definition.separatorDomId, domOperations.retrieveElement(definition.separatorDomId));
            }
            if (definition.submenuDomId) {
                elementRegistry.set(definition.submenuDomId, domOperations.retrieveElement(definition.submenuDomId));
                elementRegistry.set(definition.submenuDomId + 'Popup', domOperations.retrieveElement(definition.submenuDomId + 'popup'));
            }

            if (definition.itemContainerKey) {
                const itemHolder = [];
                dynamicItemHolders.set(definition.itemContainerKey, itemHolder);
                registeredLocations.push({
                    prefName: definition.preferenceKey,
                    targetType: OpenWithCore[definition.targetCategory] || undefined,
                    container: itemHolder,
                    empty: definition.clearMethod,
                    factory: definition.creationMethod,
                    suffix: definition.labelSuffix,
                    elementRef: definition.containerDomId ? domOperations.retrieveElement(definition.containerDomId) : undefined
                });
            }
        }

        const viewMenuHost = domOperations.retrieveElement('menu_viewPopup') || domOperations.retrieveElement('menu_View_Popup');
        if (viewMenuHost) {
            viewMenuHost.addEventListener('popupshowing', handleInterfaceDisplay, false);
            viewMenuHost.addEventListener('popuphidden', handleInterfaceConcealment, false);
            elementRegistry.set('viewMenuParent', viewMenuHost);
        }

        const contextMenuHost = domOperations.retrieveElement('contentAreaContextMenu');
        if (contextMenuHost) {
            contextMenuHost.addEventListener('popupshowing', handleInterfaceDisplay, false);
            contextMenuHost.addEventListener('popuphidden', handleInterfaceConcealment, false);
            elementRegistry.set('contextMenuParent', contextMenuHost);
        }

        const placesMenuHost = domOperations.retrieveElement('placesContext');
        if (placesMenuHost) {
            placesMenuHost.addEventListener('popupshowing', handleInterfaceDisplay, false);
            placesMenuHost.addEventListener('popuphidden', handleInterfaceConcealment, false);
            elementRegistry.set('placesMenuParent', placesMenuHost);
        }

        let tabMenuContext, tabMenuItemAnchor;
        try {
            if (applicationIdentifier === 'SeaMonkey') {
                tabMenuContext = document.getAnonymousElementByAttribute(mainContentArea, 'anonid', 'tabContextMenu');
                tabMenuItemAnchor = tabMenuContext.lastChild;
            } else {
                tabMenuItemAnchor = domOperations.retrieveElement('context_openTabInWindow') || domOperations.retrieveElement('context_closeTab');
                tabMenuContext = tabMenuItemAnchor ? tabMenuItemAnchor.parentNode : null;
            }

            if (tabMenuContext && tabMenuItemAnchor) {
                const tabMenuSeparatorNode = domOperations.fabricateNode('menuseparator', { id: 'openwith-tabmenuseparator' });
                tabMenuContext.insertBefore(tabMenuSeparatorNode, tabMenuItemAnchor.nextSibling);
                elementRegistry.set('tabMenuSeparator', tabMenuSeparatorNode);

                const tabMenuPlaceholderNode = domOperations.fabricateNode('menuitem', {
                    id: 'openwith-tabmenuplaceholder',
                    label: OpenWithCore.strings.GetStringFromName('openWithPlaceholderLabel')
                });
                tabMenuContext.insertBefore(tabMenuPlaceholderNode, tabMenuSeparatorNode.nextSibling);
                elementRegistry.set('tabMenuPlaceholder', tabMenuPlaceholderNode);

                const tabSubmenuContainer = domOperations.fabricateNode('menu', {
                    label: domOperations.retrieveElement('openwith-viewsubmenu').getAttribute('label')
                });
                const tabSubmenuPopupContainer = domOperations.fabricateNode('menupopup');
                tabSubmenuContainer.appendChild(tabSubmenuPopupContainer);
                tabMenuContext.insertBefore(tabSubmenuContainer, tabMenuPlaceholderNode.nextSibling);
                elementRegistry.set('tabSubmenu', tabSubmenuContainer);
                elementRegistry.set('tabSubmenuPopup', tabSubmenuPopupContainer);

                tabMenuContext.addEventListener('popupshowing', handleInterfaceDisplay, false);
                tabMenuContext.addEventListener('popuphidden', handleInterfaceConcealment, false);
                elementRegistry.set('tabMenuParent', tabMenuContext);

                const tabInterfaceDef = interfaceComponentDefinitions.find(d => d.componentName === 'tabInterface');
                if (tabInterfaceDef) {
                    registeredLocations.find(loc => loc.prefName === tabInterfaceDef.preferenceKey).container = dynamicItemHolders.get(tabInterfaceDef.itemContainerKey);
                }
                registeredLocations.push({
                    prefName: 'tabmenu.submenu',
                    targetType: OpenWithCore.TARGET_TAB,
                    container: tabSubmenuPopupContainer
                });
            } else {
                elementRegistry.set('tabMenuPlaceholder', null);
            }
        } catch (err) {
            elementRegistry.set('tabMenuPlaceholder', null);
            Components.utils.reportError(err);
            Services.console.logStringMessage('InterfaceOverseer: tab menu items unavailable');
        }

        if (applicationIdentifier !== 'Firefox' || applicationVersionNumber < 4) {
            try {
                const tabBarPanel = domOperations.fabricateNode('toolbaritem', { id: 'openwith-tabbarbox' });
                tabBarPanel.setAttribute('align', 'center');
                tabBarPanel.setAttribute('context', '');

                if (applicationIdentifier === 'SeaMonkey') {
                    tabBarPanel.className = 'openwith-tabbarbox-seamonkey tabs-right';
                } else {
                    tabBarPanel.className = 'openwith-tabbarbox-firefox';
                }

                let parentElement = document.getAnonymousElementByAttribute(mainContentArea, 'anonid', 'tabcontainer');
                parentElement = document.getAnonymousNodes(parentElement).item(0).childNodes[1];
                if (applicationIdentifier === 'SeaMonkey') {
                    parentElement = parentElement.firstChild;
                }

                let insertionPoint = parentElement.firstChild;
                while (insertionPoint && insertionPoint.localName !== 'arrowscrollbox' &&
                       insertionPoint.id !== 'tabs-right-space' &&
                       (applicationIdentifier !== 'SeaMonkey' || insertionPoint.localName !== 'hbox')) {
                    insertionPoint = insertionPoint.nextSibling;
                }
                if (insertionPoint) {
                    insertionPoint = insertionPoint.nextSibling;
                }
                parentElement.insertBefore(tabBarPanel, insertionPoint);
                elementRegistry.set('tabButtonBox', tabBarPanel);

                const toolbarButtonElement = domOperations.fabricateNode('toolbarbutton', {
                    type: 'menu',
                    image: 'chrome://openwith/content/openwith16.png',
                    tooltiptext: OpenWithCore.strings.GetStringFromName('openWithDropDownTooltip')
                });
                tabBarPanel.appendChild(toolbarButtonElement);

                const tabBarPopupNode = domOperations.fabricateNode('menupopup');
                toolbarButtonElement.appendChild(tabBarPopupNode);
                elementRegistry.set('tabBarMenuPopupNode', tabBarPopupNode);

                const tabBarConfig = interfaceComponentDefinitions.find(d => d.componentName === 'tabBarMechanism');
                if (tabBarConfig) {
                    const loc = registeredLocations.find(locDef => locDef.prefName === tabBarConfig.preferenceKey);
                    if (loc) {
                        loc.container = tabBarPanel;
                        loc.empty = tabBarConfig.clearMethod;
                        loc.factory = tabBarConfig.creationMethod;
                    }
                }
                const tabBarSubmenuConfig = interfaceComponentDefinitions.find(d => d.componentName === 'tabBarSubmenuMechanism');
                if (tabBarSubmenuConfig) {
                    const loc = registeredLocations.find(locDef => locDef.prefName === tabBarSubmenuConfig.preferenceKey);
                    if (loc) {
                        loc.container = tabBarPopupNode;
                    } else {
                        registeredLocations.push({
                            prefName: tabBarSubmenuConfig.preferenceKey,
                            container: tabBarPopupNode
                        });
                    }
                }

            } catch (err) {
                elementRegistry.set('tabButtonBox', null);
                Components.utils.reportError(err);
                Services.console.logStringMessage('InterfaceOverseer: tab bar buttons unavailable');
            }
        }

        let toolbarPanel = domOperations.retrieveElement('openwith-toolbarbox');
        if (!toolbarPanel) {
            const toolboxPalette = domOperations.retrieveElement('navigator-toolbox');
            if (toolboxPalette && toolboxPalette.palette) {
                for (let i = toolboxPalette.palette.childElementCount - 1; i >= 0; i--) {
                    if (toolboxPalette.palette.children[i].id === 'openwith-toolbarbox') {
                        toolbarPanel = toolboxPalette.palette.children[i];
                        break;
                    }
                }
            }
        }
        if (toolbarPanel) {
            elementRegistry.set('toolbarButtonBox', toolbarPanel);
            const toolbarPopupNode = toolbarPanel.getElementsByTagName('menupopup').item(0);
            elementRegistry.set('toolbarMenuPopupNode', toolbarPopupNode);

            const toolbarConfig = interfaceComponentDefinitions.find(d => d.componentName === 'toolbarMechanism');
            if (toolbarConfig) {
                const loc = registeredLocations.find(locDef => locDef.prefName === toolbarConfig.preferenceKey);
                if (loc) {
                    loc.container = toolbarPanel;
                    loc.empty = toolbarConfig.clearMethod;
                    loc.factory = toolbarConfig.creationMethod;
                }
            }
            const toolbarSubmenuConfig = interfaceComponentDefinitions.find(d => d.componentName === 'toolbarSubmenuMechanism');
            if (toolbarSubmenuConfig) {
                const loc = registeredLocations.find(locDef => locDef.prefName === toolbarSubmenuConfig.preferenceKey);
                if (loc) {
                    loc.container = toolbarPopupNode;
                } else {
                    registeredLocations.push({
                        prefName: toolbarSubmenuConfig.preferenceKey,
                        container: toolbarPopupNode
                    });
                }
            }
        } else {
            elementRegistry.set('toolbarButtonBox', null);
            Services.console.logStringMessage('InterfaceOverseer: toolbar buttons unavailable');
        }

        const panelWidgetDef = interfaceComponentDefinitions.find(d => d.componentName === 'panelInterfaceWidget');
        if (panelWidgetDef && panelWidgetDef.contextEvaluation()) {
            const panelWidgetContainer = domOperations.retrieveElement('PanelUI-openwith');
            if (panelWidgetContainer && panelWidgetContainer.firstElementChild) {
                registeredLocations.push({
                    factory: panelWidgetDef.creationMethod,
                    targetType: OpenWithCore[panelWidgetDef.targetCategory],
                    suffix: panelWidgetDef.labelSuffix,
                    container: panelWidgetContainer.firstElementChild
                });
            }
        }

        OpenWithCore.loadList(false);
        updateInterfaceElements();

        notificationSubscriptionManager = new CustomObserverAgent(updateInterfaceElements);
        Services.obs.addObserver(notificationSubscriptionManager, 'openWithListChanged', true);
        Services.obs.addObserver(notificationSubscriptionManager, 'openWithLocationsChanged', true);
    }

    function updateInterfaceElements() {
        const tabBarMenuNode = elementRegistry.get('tabBarMenuPopupNode');
        if (tabBarMenuNode) {
            const hideTabBarMenu = !OpenWithCore.prefs.getBoolPref('tabbar.menu');
            domOperations.alterVisibility(tabBarMenuNode.parentNode, hideTabBarMenu);
        }

        const toolbarMenuNode = elementRegistry.get('toolbarMenuPopupNode');
        if (toolbarMenuNode) {
            const hideToolbarMenu = !OpenWithCore.prefs.getBoolPref('toolbar.menu');
            domOperations.alterVisibility(toolbarMenuNode.parentNode, hideToolbarMenu);
        }

        const isApplicationListEmpty = OpenWithCore.list.length === 0;
        elementRegistry.set('isListEmpty', isApplicationListEmpty);

        OpenWithCore.refreshUI(document, registeredLocations);
    }

    const popupDisplayLogic = new Map([
        ['menu_viewPopup', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'mainViewInterface');
            const prefActive = OpenWithCore.prefs.getBoolPref(def.preferenceKey);
            const submenuPrefActive = OpenWithCore.prefs.getBoolPref(def.submenuPreferenceKey);
            const listIsEmpty = elementRegistry.get('isListEmpty');

            domOperations.alterVisibility(elementRegistry.get(def.separatorDomId), (!prefActive && !submenuPrefActive) || listIsEmpty);
            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), true);
            domOperations.alterVisibility(elementRegistry.get(def.submenuDomId), !submenuPrefActive || listIsEmpty);

            if (prefActive) {
                domOperations.injectDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), dynamicItemHolders.get(def.itemContainerKey));
            }
        }],
        ['menu_View_Popup', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'mainViewInterface');
            const prefActive = OpenWithCore.prefs.getBoolPref(def.preferenceKey);
            const submenuPrefActive = OpenWithCore.prefs.getBoolPref(def.submenuPreferenceKey);
            const listIsEmpty = elementRegistry.get('isListEmpty');

            domOperations.alterVisibility(elementRegistry.get(def.separatorDomId), (!prefActive && !submenuPrefActive) || listIsEmpty);
            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), true);
            domOperations.alterVisibility(elementRegistry.get(def.submenuDomId), !submenuPrefActive || listIsEmpty);

            if (prefActive) {
                domOperations.injectDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), dynamicItemHolders.get(def.itemContainerKey));
            }
        }],
        ['placesContext', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'placesInterface');
            if (!def.contextEvaluation()) {
                return;
            }
            const prefActive = OpenWithCore.prefs.getBoolPref(def.preferenceKey);
            const submenuPrefActive = OpenWithCore.prefs.getBoolPref(def.submenuPreferenceKey);
            const listIsEmpty = elementRegistry.get('isListEmpty');

            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), true);
            domOperations.alterVisibility(elementRegistry.get(def.submenuDomId), !submenuPrefActive || listIsEmpty);

            if (prefActive) {
                domOperations.injectDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), dynamicItemHolders.get(def.itemContainerKey));
            }
        }],
        ['contentAreaContextMenu', (parentHost) => {
            const mainDef = interfaceComponentDefinitions.find(d => d.componentName === 'contextAreaInterface');
            const linkDef = interfaceComponentDefinitions.find(d => d.componentName === 'contextAreaLinkInterface');

            const mainPref = OpenWithCore.prefs.getBoolPref(mainDef.preferenceKey);
            const mainSubmenuPref = OpenWithCore.prefs.getBoolPref(mainDef.submenuPreferenceKey);
            const linkPref = OpenWithCore.prefs.getBoolPref(linkDef.preferenceKey);
            const linkSubmenuPref = OpenWithCore.prefs.getBoolPref(linkDef.submenuPreferenceKey);

            const showMainContext = mainDef.contextEvaluation();
            const showLinkContext = linkDef.contextEvaluation();
            const listIsEmpty = elementRegistry.get('isListEmpty');

            domOperations.alterVisibility(elementRegistry.get(linkDef.placeholderDomId), true);
            domOperations.alterVisibility(elementRegistry.get(mainDef.placeholderDomId), true);

            domOperations.alterVisibility(elementRegistry.get(mainDef.separatorDomId), (!mainPref && !mainSubmenuPref) || listIsEmpty || !showMainContext);
            domOperations.alterVisibility(elementRegistry.get(mainDef.submenuDomId), !mainSubmenuPref || listIsEmpty || !showMainContext);
            domOperations.alterVisibility(elementRegistry.get(linkDef.submenuDomId), !linkSubmenuPref || listIsEmpty || !showLinkContext);

            if (linkPref && showLinkContext) {
                domOperations.injectDynamicElements(parentHost, elementRegistry.get(linkDef.placeholderDomId), dynamicItemHolders.get(linkDef.itemContainerKey));
            }

            if (mainPref && showMainContext) {
                domOperations.injectDynamicElements(parentHost, elementRegistry.get(mainDef.placeholderDomId), dynamicItemHolders.get(mainDef.itemContainerKey));
            }
        }],
        ['defaultTabMenuHandler', (parentHost) => {
            const tabPlaceholder = elementRegistry.get('tabMenuPlaceholder');
            if (!tabPlaceholder) return;

            const def = interfaceComponentDefinitions.find(d => d.componentName === 'tabInterface');
            if (!def.contextEvaluation()) return;

            const prefActive = OpenWithCore.prefs.getBoolPref(def.preferenceKey);
            const submenuPrefActive = OpenWithCore.prefs.getBoolPref(def.submenuPreferenceKey);
            const listIsEmpty = elementRegistry.get('isListEmpty');

            domOperations.alterVisibility(tabPlaceholder, true);
            domOperations.alterVisibility(elementRegistry.get(def.separatorDomId), (!prefActive && !submenuPrefActive) || listIsEmpty);
            domOperations.alterVisibility(elementRegistry.get(def.submenuDomId), !submenuPrefActive || listIsEmpty);

            if (prefActive) {
                domOperations.injectDynamicElements(parentHost, tabPlaceholder, dynamicItemHolders.get(def.itemContainerKey));
            }
        }]
    ]);

    function handleInterfaceDisplay(event) {
        if (event.target !== this) {
            return;
        }

        const currentTargetId = this.id;
        const handler = popupDisplayLogic.get(currentTargetId) ||
                        (currentTargetId === 'menu_View_Popup' && popupDisplayLogic.get('menu_View_Popup')) ||
                        popupDisplayLogic.get('defaultTabMenuHandler');

        if (handler) {
            handler(this);
        }
    }

    const popupConcealmentLogic = new Map([
        ['menu_viewPopup', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'mainViewInterface');
            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), false);
            domOperations.extractDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), 'openwith');
        }],
        ['menu_View_Popup', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'mainViewInterface');
            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), false);
            domOperations.extractDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), 'openwith');
        }],
        ['placesContext', (parentHost) => {
            const def = interfaceComponentDefinitions.find(d => d.componentName === 'placesInterface');
            domOperations.alterVisibility(elementRegistry.get(def.placeholderDomId), false);
            domOperations.extractDynamicElements(parentHost, elementRegistry.get(def.placeholderDomId), 'openwith');
        }],
        ['contentAreaContextMenu', (parentHost) => {
            const mainDef = interfaceComponentDefinitions.find(d => d.componentName === 'contextAreaInterface');
            const linkDef = interfaceComponentDefinitions.find(d => d.componentName === 'contextAreaLinkInterface');

            domOperations.alterVisibility(elementRegistry.get(linkDef.placeholderDomId), false);
            domOperations.alterVisibility(elementRegistry.get(mainDef.placeholderDomId), false);

            domOperations.extractDynamicElements(parentHost, elementRegistry.get(linkDef.placeholderDomId), 'openwith');
            domOperations.extractDynamicElements(parentHost, elementRegistry.get(mainDef.placeholderDomId), 'openwith');
        }],
        ['defaultTabMenuHandler', (parentHost) => {
            const tabPlaceholder = elementRegistry.get('tabMenuPlaceholder');
            if (!tabPlaceholder) return;
            domOperations.alterVisibility(tabPlaceholder, false);
            domOperations.extractDynamicElements(parentHost, tabPlaceholder, 'openwith');
        }]
    ]);

    function handleInterfaceConcealment(event) {
        if (event.target !== this) {
            return;
        }

        const currentTargetId = this.id;
        const handler = popupConcealmentLogic.get(currentTargetId) ||
                        (currentTargetId === 'menu_View_Popup' && popupConcealmentLogic.get('menu_View_Popup')) ||
                        popupConcealmentLogic.get('defaultTabMenuHandler');

        if (handler) {
            handler(this);
        }
    }

    return {
        commenceOperations: function() {
            window.removeEventListener('load', InterfaceOverseer.commenceOperations, false);
            setupEnvironment();
        }
    };
})();

window.addEventListener('load', InterfaceOverseer.commenceOperations, false);