Components.utils.import( 'resource://gre/modules/Services.jsm' ) ; // Import Services module
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm'); /* Import XPCOM utilities */


// Main application object
let OpenWith =
{
	/*
	 * Array to store references to UI locations where OpenWith items can be displayed.
	 * Each entry typically includes a preference name, a target type, and a container.
	 */
	locations :
	[
	],

	// Initialization function called when the window finishes loading
	onLoad: function()
	{
		// Remove this event listener to prevent multiple initializations
		window.removeEventListener('load', OpenWith.onLoad, false);

		// Proceed with the main initialization logic
		OpenWith.init();
	}, // End of onLoad function


	/*
	 * Core initialization method for the OpenWith application.
	 * This sets up UI elements, event listeners, and observers.
	 */
	init: function()
	{
		// Import the core OpenWith logic module
		Components.utils.import('resource://openwith/openwith.jsm');

		// Retrieve application name and version for conditional logic
		let appname = Services.appinfo.name; // Get current application name
		let appversion = parseFloat(Services.appinfo.version); // Parse app version as float

		// Get the main content element of the window
		let content = document.getElementById('content');


		// --- SECTION: View Menu Initialization ---

		// Placeholder for menu items in the main View menu
		this.viewMenuPlaceholder = document.getElementById('openwith-viewmenuplaceholder');
		// Separator element for the View menu
		this.viewMenuSeparator = document.getElementById('openwith-viewmenuseparator');

		// Get the View menu popup element, handling SeaMonkey specific ID
		let viewMenu = document.getElementById('menu_viewPopup') ||
				document.getElementById('menu_View_Popup'); // Fallback for SeaMonkey

		// Add event listeners for when the View menu is shown or hidden
		viewMenu.addEventListener('popupshowing', this.popupShowing, false);
		viewMenu.addEventListener('popuphidden', this.popupHidden, false);

		// Array to hold dynamically created View menu items
		this.viewMenuItems = [ ];

		// Register the View menu location
		this.locations.push(
		{
			prefName: 'viewmenu',
			container: this.viewMenuItems
		}
		);


		// --- SECTION: View Menu Submenu Initialization ---

		// Submenu element for the View menu
		this.viewSubmenu = document.getElementById('openwith-viewsubmenu');
		// Popup container for the View submenu
		this.viewSubmenuPopup = document.getElementById('openwith-viewsubmenupopup');

		// Register the View menu submenu location
		this.locations.push({
			prefName: 'viewmenu.submenu',
			container: this.viewSubmenuPopup
		});


		// --- SECTION: Context Menu Initialization ---

		// Separator for the main content area context menu
		this.contextMenuSeparator = document.getElementById('openwith-contextmenuseparator');
		// Placeholder for general context menu items
		this.contextMenuPlaceholder = document.getElementById('openwith-contextmenuplaceholder');

		// Get the content area context menu element
		let contextMenu = document.getElementById('contentAreaContextMenu');
		// Add event listeners for context menu showing/hiding
		contextMenu.addEventListener('popupshowing', this.popupShowing, false);
		contextMenu.addEventListener('popuphidden', this.popupHidden, false);

		// Array to hold dynamically created general context menu items
		this.contextMenuItems = [];

		// Register the general context menu location
		this.locations.push(
		{
			prefName: 'contextmenu',
			container: this.contextMenuItems
		}
		);


		// --- SECTION: Context Menu Submenu Initialization ---

		// Submenu element for the general context menu
		this.contextSubmenu = document.getElementById('openwith-contextsubmenu');
		// Popup container for the general context submenu
		this.contextSubmenuPopup = document.getElementById('openwith-contextsubmenupopup');

		// Register the general context menu submenu location
		this.locations.push({
			prefName: 'contextmenu.submenu',
			container: this.contextSubmenuPopup
		});


		// --- SECTION: Context Menu (Links) Initialization ---

		// Placeholder for context menu items specifically for links
		this.contextMenuLinkPlaceholder = document.getElementById('openwith-contextmenulinkplaceholder');
		// Array to hold dynamically created link context menu items
		this.contextMenuLinkItems = [];

		// Register the link context menu location
		this.locations.push({
			prefName: 'contextmenulink',
			targetType: OpenWithCore.TARGET_LINK,
			container: this.contextMenuLinkItems
		});


		// --- SECTION: Context Menu (Links) Submenu Initialization ---

		// Submenu element for link context menu
		this.contextLinkSubmenu = document.getElementById('openwith-contextlinksubmenu');
		// Popup container for link context submenu
		this.contextLinkSubmenuPopup = document.getElementById('openwith-contextlinksubmenupopup');

		// Register the link context menu submenu location
		this.locations.push({
			prefName: 'contextmenulink.submenu',
			targetType: OpenWithCore.TARGET_LINK,
			container: this.contextLinkSubmenuPopup
		});


		// --- SECTION: Places Context Menu Initialization ---

		// Placeholder for places context menu items (e.g., bookmarks, history)
		this.placesContextPlaceholder = document.getElementById('openwith-placescontextlinkplaceholder');

		// Get the Places context menu element
		let placesContext = document.getElementById('placesContext');
		// Add event listeners for Places context menu showing/hiding
		placesContext.addEventListener('popupshowing', this.popupShowing, false);
		placesContext.addEventListener('popuphidden', this.popupHidden, false);

		// Array to hold dynamically created Places context menu items
		this.placesContextItems = [];

		// Register the Places context menu location
		this.locations.push({
			prefName: 'placescontext',
			targetType: OpenWithCore.TARGET_PLACES,
			container: this.placesContextItems
		});


		// --- SECTION: Places Context Menu Submenu Initialization ---

		// Submenu element for Places context menu
		this.placesContextSubmenu = document.getElementById('openwith-placescontextsubmenu');
		// Popup container for Places context submenu
		this.placesContextSubmenuPopup = document.getElementById('openwith-placescontextsubmenupopup');

		// Register the Places context menu submenu location
		this.locations.push({
			prefName: 'placescontext.submenu',
			targetType: OpenWithCore.TARGET_PLACES,
			container: this.placesContextSubmenuPopup
		});


		// --- SECTION: Tab Menu Initialization ---
		try
		{
			let tabMenuItem, tabMenu;
			if (appname == 'SeaMonkey')
			{
				// SeaMonkey specific way to get tab context menu
				tabMenu = document.getAnonymousElementByAttribute(content, 'anonid', 'tabContextMenu');
				tabMenuItem = tabMenu.lastChild; // The last item in SeaMonkey's tab menu
			}
			else
			{
				// Firefox and other browsers
				tabMenuItem = document.getElementById('context_openTabInWindow') ||
						document.getElementById('context_closeTab'); // Common tab menu items
				tabMenu = tabMenuItem.parentNode; // The parent is the tab context menu itself
			}

			// Create a separator for OpenWith items in the tab menu
			this.tabMenuSeparator = document.createElement('menuseparator');
			this.tabMenuSeparator.id = 'openwith-tabmenuseparator';
			tabMenu.insertBefore(this.tabMenuSeparator, tabMenuItem.nextSibling);

			// Create a placeholder menu item for OpenWith items
			this.tabMenuPlaceholder = document.createElement('menuitem');
			this.tabMenuPlaceholder.id = 'openwith-tabmenuplaceholder';
			this.tabMenuPlaceholder.setAttribute('label',
				OpenWithCore.strings.GetStringFromName('openWithPlaceholderLabel'));
			tabMenu.insertBefore(this.tabMenuPlaceholder, this.tabMenuSeparator.nextSibling);

			// Create the tab submenu
			this.tabSubmenu = document.createElement('menu');
			this.tabSubmenu.setAttribute('label',
				document.getElementById('openwith-viewsubmenu').getAttribute('label')); // Reuse label from view submenu
			this.tabSubmenuPopup = document.createElement('menupopup');
			this.tabSubmenu.appendChild(this.tabSubmenuPopup);
			tabMenu.insertBefore(this.tabSubmenu, this.tabMenuPlaceholder.nextSibling);

			// Add event listeners to the tab menu
			tabMenu.addEventListener('popupshowing', this.popupShowing, false);
			tabMenu.addEventListener('popuphidden', this.popupHidden, false);

			// Array to hold dynamically created tab menu items
			this.tabMenuItems = [];

			// Register the tab menu location
			this.locations.push({
				prefName: 'tabmenu',
				targetType: OpenWithCore.TARGET_TAB,
				container: this.tabMenuItems
			});

			// --- SECTION: Tab Menu Submenu Initialization ---
			// Register the tab menu submenu location
			this.locations.push({
				prefName: 'tabmenu.submenu',
				targetType: OpenWithCore.TARGET_TAB,
				container: this.tabSubmenuPopup
			});
		}
		catch (e)
		{
			// If tab menu initialization fails, set placeholder to null and report error
			this.tabMenuPlaceholder = null;
			Components.utils.reportError(e);
			Services.console.logStringMessage('OpenWith: tab menu items will be unavailable');
		}


		// --- SECTION: Tab Bar Initialization ---
		// This feature is typically for older Firefox versions or SeaMonkey
		if (appname != 'Firefox' || appversion < 4)
		{
			try
			{
				// Create a toolbar item to house tab bar buttons
				this.tabButtonContainer = document.createElement('toolbaritem');
				this.tabButtonContainer.id = 'openwith-tabbarbox';
				if (appname == 'SeaMonkey')
				{
					this.tabButtonContainer.className = 'openwith-tabbarbox-seamonkey tabs-right';
				}
				else
				{
					this.tabButtonContainer.className = 'openwith-tabbarbox-firefox';
				}
				this.tabButtonContainer.setAttribute('align', 'center');
				this.tabButtonContainer.setAttribute('context', ''); // Allow context menu on this item

				let parent, before;
				// Find the tab container element
				parent = document.getAnonymousElementByAttribute(content, 'anonid', 'tabcontainer');
				parent = document.getAnonymousNodes(parent).item(0).childNodes[1];
				if (appname == 'SeaMonkey')
				{
					parent = parent.firstChild;
				}
				// Determine where to insert the new toolbar item
				before = parent.firstChild;
				while (before && before.localName != 'arrowscrollbox' &&
						before.id != 'tabs-right-space' && // Handle Tab Mix Plus specific ID
						(appname != 'SeaMonkey' || before.localName != 'hbox')) // SeaMonkey specific check
				{
					before = before.nextSibling;
				}
				if (before)
				{
					before = before.nextSibling;
				}
				parent.insertBefore(this.tabButtonContainer, before);

				// Create a toolbar button for the tab bar
				let toolbarButton = document.createElement('toolbarbutton');
				toolbarButton.setAttribute('type', 'menu'); // Make it a menu button
				toolbarButton.setAttribute('image', 'chrome://openwith/content/openwith16.png');
				toolbarButton.setAttribute('tooltiptext',
					OpenWithCore.strings.GetStringFromName('openWithDropDownTooltip'));
				this.tabButtonContainer.appendChild(toolbarButton);

				// Create the menupopup for the tab bar button
				this.tabBarMenu = document.createElement('menupopup');
				toolbarButton.appendChild(this.tabBarMenu);

				// Register the tab bar location
				this.locations.push({
					prefName: 'tabbar',
					empty: function() {
						// Custom empty function to remove all but the first child (the menu button)
						while (this.container.childNodes.length > 1)
							this.container.removeChild(this.container.lastChild);
					},
					factory: OpenWithCore.createToolbarButton,
					container: this.tabButtonContainer
				});

				// --- SECTION: Tab Bar Menu Initialization ---
				// Register the tab bar menu location
				this.locations.push({
					prefName: 'tabbar.menu',
					container: this.tabBarMenu
				});
			}
			catch (e)
			{
				// If tab bar initialization fails, set container to null and report error
				this.tabButtonContainer = null;
				Components.utils.reportError(e);
				Services.console.logStringMessage('OpenWith: tab bar buttons will be unavailable');
			}
		}


		// --- SECTION: Toolbar Initialization ---
		this.toolbarButtonContainer = null;
		try
		{
			// Attempt to find the toolbar button container by ID
			this.toolbarButtonContainer = document.getElementById('openwith-toolbarbox');
			if (!this.toolbarButtonContainer)
			{
				// If not found directly, search the palette for customizable toolbar items
				let palette = document.getElementById('navigator-toolbox').palette;
				for (let i = palette.childElementCount - 1; i >= 0; i--)
				{
					if (palette.children[i].id == 'openwith-toolbarbox')
					{
						this.toolbarButtonContainer = palette.children[i];
						break;
					}
				}
			}
			if (this.toolbarButtonContainer)
			{
				// Register the toolbar location
				this.locations.push({
					prefName: 'toolbar',
					empty: function() {
						// Custom empty function to remove all but the first child (the menu button)
						while (this.container.childNodes.length > 1)
							this.container.removeChild(this.container.lastChild);
					},
					factory: OpenWithCore.createToolbarButton,
					container: this.toolbarButtonContainer
				});

				// --- SECTION: Toolbar Menu Initialization ---
				// Get the menupopup associated with the toolbar button
				this.toolbarMenu = this.toolbarButtonContainer.getElementsByTagName('menupopup').item(0);
				// Register the toolbar menu location
				this.locations.push({
					prefName: 'toolbar.menu',
					container: this.toolbarMenu
				});
			}
		}
		catch (e)
		{
			// If toolbar initialization fails, set container to null and report error
			this.tabButtonContainer = null; // Note: This should probably be toolbarButtonContainer
			Components.utils.reportError(e);
			Services.console.logStringMessage('OpenWith: toolbar buttons will be unavailable');
		}


		// --- SECTION: CustomizableUI (Panel UI) Initialization ---
		// Check if CustomizableUI is available (e.g., Firefox Australis)
		if ('CustomizableUI' in window)
		{
			this.locations.push({
				factory: OpenWithCore.createToolbarButton,
				targetType: OpenWithCore.TARGET_PANEL_UI,
				suffix: '_widget',
				container: document.getElementById('PanelUI-openwith').firstElementChild
			});
		}


		// Load the list of applications and refresh the UI
		OpenWithCore.loadList(false); // Load initial list of applications
		OpenWith.loadLists(); // Refresh all UI elements based on loaded list

		// Add observers for preference changes
		Services.obs.addObserver(this, 'openWithListChanged', true); // Observe changes to app list
		Services.obs.addObserver(this, 'openWithLocationsChanged', true); // Observe changes to location prefs
	}, // End of init function


	/*
	 * XPCOM QueryInterface implementation for observer pattern.
	 */
	QueryInterface: XPCOMUtils.generateQI([
		Components.interfaces.nsIObserver,
		Components.interfaces.nsISupportsWeakReference,
		Components.interfaces.nsISupports
	]),


	/*
	 * Observer method, called when a watched topic changes.
	 */
	observe: function(subject, topic, data)
	{
		// Handle different observation topics
		switch (topic)
		{
		case 'openWithListChanged':
		case 'openWithLocationsChanged':
			// If application list or locations change, reload and refresh UI
			OpenWith.loadLists();
			break;
		}
	}, // End of observe function


	/*
	 * Reloads and refreshes the UI lists based on current preferences and application data.
	 */
	loadLists: function()
	{
		// Handle visibility of the tab bar menu
		if (this.tabBarMenu)
		{
			if (!OpenWithCore.prefs.getBoolPref('tabbar.menu'))
			{
				this.tabBarMenu.parentNode.setAttribute('hidden', 'true');
			}
			else
			{
				this.tabBarMenu.parentNode.removeAttribute('hidden');
			}
		}

		// Handle visibility of the toolbar menu
		if (this.toolbarMenu)
		{
			if (!OpenWithCore.prefs.getBoolPref('toolbar.menu'))
			{
				this.toolbarMenu.parentNode.setAttribute('hidden', 'true');
			}
			else
			{
				this.toolbarMenu.parentNode.removeAttribute('hidden');
			}
		}

		// Determine if the application list is empty
		this.emptyList = OpenWithCore.list.length == 0;
		// Refresh all registered UI locations
		OpenWithCore.refreshUI(document, this.locations);
	}, // End of loadLists function


	/*
	 * Event handler for 'popupshowing' event on various menus.
	 * Dynamically shows/hides menu items based on context and preferences.
	 */
	popupShowing: function(event)
	{
		// Ensure the event is for the popup itself, not its children
		if (event.target != this)
		{
			return;
		}

		// Differentiate logic based on the ID of the menu
		switch (this.id)
		{
			case 'menu_viewPopup': // Firefox View menu
			case 'menu_View_Popup': // SeaMonkey View menu
			case 'placesContext': // Places context menu (bookmarks, history)
			{
				let pref, submenuPref, placeholder, submenu, items;
				if (this.id == 'placesContext')
				{
					// Special handling for placesContext menu
					if ((document.popupNode.localName == 'menuitem' ||
							(document.popupNode.localName == 'toolbarbutton' && document.popupNode.getAttribute('type') != 'menu'))
							&& document.popupNode.classList.contains('bookmark-item'))
					{
						// Check preferences only if the clicked item is a bookmark
						pref = OpenWithCore.prefs.getBoolPref('placescontext');
						submenuPref = OpenWithCore.prefs.getBoolPref('placescontext.submenu');
					}
					else
					{
						// If not a bookmark, don't show any OpenWith items
						pref = false;
						submenuPref = false;
					}
					placeholder = OpenWith.placesContextPlaceholder;
					submenu = OpenWith.placesContextSubmenu;
					items = OpenWith.placesContextItems;
				}
				else
				{
					// Logic for View menu
					pref = OpenWithCore.prefs.getBoolPref('viewmenu');
					submenuPref = OpenWithCore.prefs.getBoolPref('viewmenu.submenu');
					OpenWith.viewMenuSeparator.hidden = (!pref && !submenuPref) || OpenWith.emptyList;
					placeholder = OpenWith.viewMenuPlaceholder;
					submenu = OpenWith.viewSubmenu;
					items = OpenWith.viewMenuItems;
				}

				// Hide the placeholder and show/hide submenu based on preferences and list emptiness
				placeholder.hidden = true;
				submenu.hidden = !submenuPref || OpenWith.emptyList;

				if (pref)
				{
					// If main menu items are enabled, insert them after the placeholder
					let next = placeholder.nextSibling;
					for (let item of items)
					{
						if ('__MenuEdit_insertBefore_orig' in this)
						{
							// Handle MenuEdit extension compatibility
							this.__MenuEdit_insertBefore_orig(item, next);
						}
						else
						{
							this.insertBefore(item, next);
						}
					}
				}
				return;
			}
			case 'contentAreaContextMenu': // Main content area context menu
			{
				let contextMenuPref = OpenWithCore.prefs.getBoolPref('contextmenu');
				let contextSubmenuPref = OpenWithCore.prefs.getBoolPref('contextmenu.submenu');
				let contextMenuLinkPref = OpenWithCore.prefs.getBoolPref('contextmenulink');
				let contextSubmenuLinkPref = OpenWithCore.prefs.getBoolPref('contextmenulink.submenu');

				// Determine if the general context menu items should be shown (no specific target selected)
				// (from http://mxr.mozilla.org/mozilla-central/source/browser/base/content/nsContextMenu.js)
				let shouldShow = !(gContextMenu.isContentSelected || gContextMenu.onLink ||
					gContextMenu.onImage || gContextMenu.onCanvas || gContextMenu.onVideo ||
					gContextMenu.onAudio || gContextMenu.onTextInput);

				// Hide placeholders initially
				OpenWith.contextMenuLinkPlaceholder.hidden = true;
				OpenWith.contextMenuPlaceholder.hidden = true;

				// Set visibility for separator and submenus based on preferences, list emptiness, and context
				OpenWith.contextMenuSeparator.hidden = (!contextMenuPref && !contextSubmenuPref) ||
							OpenWith.emptyList || !shouldShow;
				OpenWith.contextSubmenu.hidden = !contextSubmenuPref ||
							OpenWith.emptyList || !shouldShow;
				OpenWith.contextLinkSubmenu.hidden = !contextSubmenuLinkPref ||
							OpenWith.emptyList || !gContextMenu.onLink || gContextMenu.onMailtoLink;

				// Insert link-specific menu items if applicable
				if (contextMenuLinkPref && gContextMenu.onLink && !gContextMenu.onMailtoLink)
				{
					let next = OpenWith.contextMenuLinkPlaceholder.nextSibling;
					for (let item of OpenWith.contextMenuLinkItems)
					{
						if ('__MenuEdit_insertBefore_orig' in this)
						{
							this.__MenuEdit_insertBefore_orig(item, next);
						}
						else
						{
							this.insertBefore(item, next);
						}
					}
				}

				// Insert general context menu items if applicable
				if (contextMenuPref && shouldShow)
				{
					let next = OpenWith.contextMenuPlaceholder.nextSibling;
					for (let item of OpenWith.contextMenuItems)
					{
						if ('__MenuEdit_insertBefore_orig' in this)
						{
							this.__MenuEdit_insertBefore_orig(item, next);
						}
						else
						{
							this.insertBefore(item, next);
						}
					}
				}
				return;
			}
			default: // Tab menu (doesn't have a fixed ID)
			{
				if (OpenWith.tabMenuPlaceholder)
				{
					let tabMenuPref = OpenWithCore.prefs.getBoolPref('tabmenu');
					let tabSubmenuPref = OpenWithCore.prefs.getBoolPref('tabmenu.submenu');

					// Hide placeholder, separator, and submenu initially
					OpenWith.tabMenuPlaceholder.hidden = true;
					OpenWith.tabMenuSeparator.hidden = true;
					OpenWith.tabSubmenu.hidden = true;

					// Only show tab menu items if a tab is right-clicked
					if (document.popupNode.localName != 'tab')
					{
						return;
					}

					// Set visibility based on preferences and list emptiness
					OpenWith.tabMenuSeparator.hidden = (!tabMenuPref && !tabSubmenuPref) || OpenWith.emptyList;
					OpenWith.tabSubmenu.hidden = !tabSubmenuPref || OpenWith.emptyList;

					// Insert tab menu items if enabled
					if (tabMenuPref)
					{
						let next = OpenWith.tabMenuPlaceholder.nextSibling;
						for (let item of OpenWith.tabMenuItems)
						{
							if ('__MenuEdit_insertBefore_orig' in this)
							{
								this.__MenuEdit_insertBefore_orig(item, next);
							}
							else
							{
								this.insertBefore(item, next);
							}
						}
					}
				}
				return;
			}
		}
	}, // End of popupShowing function


	/*
	 * Event handler for 'popuphidden' event on various menus.
	 * Cleans up dynamically added menu items and restores placeholders.
	 */
	popupHidden: function(event)
	{
		// Ensure the event is for the popup itself
		if (event.target != this)
		{
			return;
		}

		// Differentiate logic based on the ID of the menu
		switch (this.id)
		{
		case 'menu_viewPopup':
		case 'menu_View_Popup':
		case 'placesContext':
		{
				let placeholder;
				if (this.id == 'placesContext')
				{
					placeholder = OpenWith.placesContextPlaceholder;
				}
				else
				{
					placeholder = OpenWith.viewMenuPlaceholder;
				}

				// Show the placeholder again
				placeholder.hidden = false;

				// Remove all dynamically added OpenWith items
				let next = placeholder.nextSibling;
				while (next && next.className.indexOf('openwith') == 0)
				{
					if ('__MenuEdit_removeChild_orig' in this)
					{
						this.__MenuEdit_removeChild_orig(next);
					}
					else
					{
						this.removeChild(next);
					}
					next = placeholder.nextSibling;
				}
				return;
			}
		case 'contentAreaContextMenu':
		{
				// Show both context menu placeholders
				OpenWith.contextMenuLinkPlaceholder.hidden = false;
				OpenWith.contextMenuPlaceholder.hidden = false;

				// Remove dynamically added link context menu items
				let next = OpenWith.contextMenuLinkPlaceholder.nextSibling;
				while (next && next.className.indexOf('openwith') == 0)
				{
					if ('__MenuEdit_removeChild_orig' in this)
					{
						this.__MenuEdit_removeChild_orig(next);
					}
					else
					{
						this.removeChild(next);
					}
					next = OpenWith.contextMenuLinkPlaceholder.nextSibling;
				}

				// Remove dynamically added general context menu items
				next = OpenWith.contextMenuPlaceholder.nextSibling;
				while (next && next.className.indexOf('openwith') == 0)
				{
					if ('__MenuEdit_removeChild_orig' in this)
					{
						this.__MenuEdit_removeChild_orig(next);
					}
					else
					{
						this.removeChild(next);
					}
					next = OpenWith.contextMenuPlaceholder.nextSibling;
				}
				return;
			}
		default: // Tab menu
		{
				if (OpenWith.tabMenuPlaceholder)
				{
					// Show the tab menu placeholder
					OpenWith.tabMenuPlaceholder.hidden = false;

					// Remove dynamically added tab menu items
					let next = OpenWith.tabMenuPlaceholder.nextSibling;
					while (next && next.className.indexOf('openwith') == 0)
					{
						if ('__MenuEdit_removeChild_orig' in this)
						{
							this.__MenuEdit_removeChild_orig(next);
						}
						else
						{
							this.removeChild(next);
						}
						next = OpenWith.tabMenuPlaceholder.nextSibling;
					}
				}
				return;
			}
		}
	} // End of popupHidden function
}; // End of OpenWith object definition


// Add the initial load event listener to the window
window.addEventListener('load', OpenWith.onLoad, false);
// EOF - End of File - OpenWith Overlay Script