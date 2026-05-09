var MailForge = function(providedJQueryInstance) {

  // This module aims to provide a reliable interface for interacting with Gmail's DOM and data.
  // It first attempts to use a provided jQuery instance to prevent conflicts with other scripts.
  // If no instance is provided, it falls back to the global `window.jQuery`.
  // A warning is logged if no jQuery instance is found, as it's a critical dependency.
  let $jqRef = null;
  if (typeof providedJQueryInstance === 'function' && typeof providedJQueryInstance.fn === 'object') {
    $jqRef = providedJQueryInstance;
  } else if (typeof window.jQuery === 'function' && typeof window.jQuery.fn === 'object') {
    $jqRef = window.jQuery;
  } else {
    // Fallback: If jQuery is missing, create a minimal mock object to prevent immediate errors,
    // though functionality will be severely limited. A console warning is issued.
    console.warn("MailForge initialization warning: No valid jQuery instance found. Core DOM functionalities may be impacted.");
    $jqRef = function(selector) {
      console.error(`MailForge: jQuery is not available. Cannot query selector: "${selector}".`);
      return {
        length: 0,
        find: () => $jqRef(),
        children: () => $jqRef(),
        each: (callback) => {}, // Mock each method
        hasClass: () => false,
        text: () => "",
        attr: () => "",
        is: () => false,
        get: () => [],
        0: undefined // Mimic direct index access returning undefined for no elements
      };
    };
    $jqRef.fn = {}; // Mimic jQuery plugin object for compatibility
  }

  // The primary object holding all the MailForge functionalities.
  // Sub-objects categorize different types of operations for better organization.
  var mailUtils = {
    retrievers: {}, // Functions responsible for fetching data or specific DOM elements.
    monitors: {}, // Placeholder for future event observation utilities.
    validators: {}, // Functions to check the current state or specific conditions.
    helpers: {}, // General utility and helper functions.
    dataStore: {}, // Functions and variables related to internal global data tracking.
    uiElements: {}, // Functions to locate and interact with specific user interface components.
    talkModule: {}, // Placeholder for chat-related interactions.
    drafting: {} // Functions pertaining to composing and managing email drafts.
  };

  // --- Core Configuration and Data Store Initialization ---

  mailUtils.version = "1.0.alpha"; // Current version of the MailForge library.
  // Global data array, typically injected by Gmail itself.
  mailUtils.dataStore.globalData = typeof GLOBAL_DATA_ARRAY !== 'undefined' ? GLOBAL_DATA_ARRAY : [];
  // Details about the current view, often an array.
  mailUtils.dataStore.currentViewDetails = (typeof CURRENT_VIEW_DETAILS !== 'undefined' && Array.isArray(CURRENT_VIEW_DETAILS)) ? CURRENT_VIEW_DETAILS : [];
  // An internal key, extracted from the global data. Defaults to null if not found.
  mailUtils.dataStore.internalKey = mailUtils.dataStore.globalData[9] || null;
  // Status of Google Hangouts (or similar chat service). Explicitly set to null.
  mailUtils.dataStore.hangoutStatus = null;

  // A flag indicating that MailForge has successfully completed its basic initialization.
  mailUtils.isInitialized = true;

  // --- Retrievers Module: Functions for Data Extraction ---

  /**
   * Retrieves information about the user's last active session.
   * This data is extracted from a specific, nested part of the global data array.
   * @returns {object|null} An object containing 'eventTime', 'ipAddress', 'hardwareID', and 'relativeDuration',
   *                        or `null` if the data structure is not as expected.
   */
  mailUtils.retrievers.fetchLastActivity = function() {
    const activityInfo = mailUtils.dataStore.globalData[17] && mailUtils.dataStore.globalData[17][15];
    if (!activityInfo || !Array.isArray(activityInfo) || activityInfo.length < 11) {
      console.warn("MailForge: Last activity data structure is missing or incomplete.");
      return null;
    }
    return {
      eventTime: activityInfo[1],
      ipAddress: activityInfo[3],
      hardwareID: activityInfo[9], // Renamed from 'mac_address' for broader abstraction.
      relativeDuration: activityInfo[10]
    };
  };

  /**
   * Gathers details for all currently logged-in user accounts within the session.
   * It parses a specific global data structure to compile a list of user objects.
   * @returns {Array<object>} An array of objects, each with 'userName' and 'userEmail'.
   *                          Returns an empty array if data is unavailable or malformed.
   */
  mailUtils.retrievers.retrieveActiveUsers = function() {
    const userDataContainer = mailUtils.dataStore.globalData[17] && mailUtils.dataStore.globalData[17][23];
    const accountList = [];

    if (!userDataContainer || !Array.isArray(userDataContainer[1])) {
      console.warn("MailForge: Active user data container not found or is malformed.");
      return accountList;
    }

    // Using a standard for loop for improved compatibility and performance over `for...in` on arrays.
    for (let i = 0; i < userDataContainer[1].length; i++) {
      const userEntry = userDataContainer[1][i];
      if (Array.isArray(userEntry) && userEntry.length >= 5) { // Ensure sufficient data points in the entry.
        accountList.push({
          userName: userEntry[4],
          userEmail: userEntry[0]
        });
      }
    }
    return accountList;
  };

  /**
   * Retrieves the primary email address of the currently logged-in user.
   * @returns {string|null} The user's email address, or `null` if it cannot be determined.
   */
  mailUtils.retrievers.getCurrentUserEmail = function() {
    return mailUtils.dataStore.globalData[10] || null; // Provides a null fallback for robustness.
  };

  /**
   * Attempts to determine the user's current locale (e.g., "en", "es").
   * It probes multiple locations within the global configuration data for a valid locale string.
   * @returns {string|null} The two-letter lowercase locale string if found, otherwise `null`.
   */
  mailUtils.retrievers.getSystemLocale = function() {
    /**
     * Internal helper to validate if a string conforms to a locale format.
     * A valid locale prefix is considered to be two lowercase alphabetic characters.
     * @param {string} localeCandidate - The string to be validated.
     * @returns {boolean} `true` if the candidate is a valid locale format, `false` otherwise.
     */
    const isValidLocaleFormat = function(localeCandidate) {
      if (typeof localeCandidate !== 'string' || localeCandidate.length < 2) {
        return false;
      }
      const prefixString = localeCandidate.substring(0, 2); // Using substring for clarity.
      return prefixString.toLowerCase() === prefixString && /^[a-z]{2}$/.test(prefixString); // Added regex for letter check.
    };

    const globalConfig = mailUtils.dataStore.globalData;

    // First potential location for locale data.
    let currentLocale = globalConfig[17] && globalConfig[17][8] && globalConfig[17][8][8];
    if (isValidLocaleFormat(currentLocale)) {
      return currentLocale;
    }

    // Second potential location for locale data.
    currentLocale = globalConfig[17] && globalConfig[17][9] && globalConfig[17][9][8];
    if (isValidLocaleFormat(currentLocale)) {
      return currentLocale;
    }

    return null; // Return null if no valid locale is found after all checks.
  };

  // --- Validators Module: Functions for Checking States ---

  /**
   * Verifies if the current view displays an email conversation thread.
   * This involves checking specific DOM elements and the count of visible email identifiers.
   * @returns {boolean} `true` if the current view is identified as a conversation thread, `false` otherwise.
   */
  mailUtils.validators.isConversationView = function() {
    // First DOM check: looks for a specific structure common in conversation views.
    const domCheckResult = $jqRef('.nH .if').children(":eq(1)").children().children(":eq(1)").children();
    // Second check: relies on the number of email IDs retrieved.
    const emailIdCheckResult = mailUtils.retrievers.getVisibleEmailIdentifiers();

    // A conversation view is typically characterized by multiple messages or a distinct DOM layout.
    return domCheckResult.length > 1 || emailIdCheckResult.length > 1;
  };

  /**
   * Determines if the preview pane feature is currently active within the inbox.
   * It inspects the main content area for specific elements indicating an active preview pane.
   * @returns {boolean} `true` if a preview pane is detected and active, `false` otherwise.
   */
  mailUtils.validators.isPreviewPaneActive = function() {
    const mainContainer = mailUtils.uiElements.getMainContentArea();
    if (!mainContainer || mainContainer.length === 0) {
      return false; // Early exit if the main content area itself is not found.
    }
    const itemContainers = mainContainer.find("[gh=tl]");

    let isPaneVisible = false;
    // Iterate through potential preview pane elements.
    itemContainers.each(function() {
      // The presence of class 'aia' on an item container suggests an active preview pane.
      if ($jqRef(this).hasClass('aia')) {
        isPaneVisible = true;
        return false; // Breaks the jQuery .each loop.
      }
    });

    return isPaneVisible;
  };

  /**
   * Checks if the user's inbox configuration includes multiple distinct inbox sections.
   * @returns {boolean} `true` if more than one inbox section is found, `false` otherwise.
   */
  mailUtils.validators.hasMultipleInboxes = function() {
    const inboxSections = mailUtils.uiElements.getInboxSections();
    return inboxSections.length > 1;
  };

  /**
   * Detects if the inbox is organized with a horizontal split layout (e.g., message list above, preview below).
   * This is inferred by the absence of a specific layout indicator class.
   * @returns {boolean} `true` if a horizontal split layout is detected, `false` otherwise.
   */
  mailUtils.validators.isHorizontalLayout = function() {
    const mainContainer = mailUtils.uiElements.getMainContentArea();
    if (!mainContainer || mainContainer.length === 0) return false;

    // The absence of elements with class 'nn' within the message list often signifies a horizontal split.
    const layoutIndicator = mainContainer.find("[gh=tl]").find('.nn');
    return layoutIndicator.length === 0;
  };

  /**
   * Determines if the inbox is using a vertical split layout (e.g., message list on left, preview on right).
   * This is logically the opposite of a horizontal split.
   * @returns {boolean} `true` if a vertical split layout is active, `false` otherwise.
   */
  mailUtils.validators.isVerticalLayout = function() {
    return !mailUtils.validators.isHorizontalLayout(); // Direct inverse of horizontal layout check.
  };

  /**
   * Checks if the user's inbox is utilizing the tabbed interface (e.g., Primary, Social, Promotions tabs).
   * @returns {boolean} `true` if the tabbed interface container is detected, `false` otherwise.
   */
  mailUtils.validators.isTabbedInterface = function() {
    return $jqRef(".aKh").length === 1; // Presence of a specific DOM element for tab containers.
  };

  /**
   * Ascertains if the chat sidebar is positioned on the right-hand side of the Gmail interface.
   * This check relies on a specific `aria-labelledby` attribute value on the chat element.
   * @returns {boolean} `true` if the chat sidebar is on the right, `false` otherwise.
   */
  mailUtils.validators.isChatSidebarRight = function() {
    const chatElement = $jqRef('.ApVoH')[0];
    // Ensure the element exists before attempting to access its attribute.
    return chatElement && chatElement.getAttribute('aria-labelledby') === ':wf';
  };

  /**
   * Determines if the current user account is part of a Google Apps (now Google Workspace) domain.
   * This is typically inferred by the absence of 'gmail.com' as the email domain.
   * @returns {boolean} `true` if the user is likely an enterprise user, `false` otherwise.
   */
  mailUtils.validators.isEnterpriseUser = function() {
    const userEmail = mailUtils.retrievers.getCurrentUserEmail();
    if (!userEmail) {
      return false; // Cannot determine enterprise status if no email is available.
    }
    const gmailDomain = 'gmail.com';
    // Checks if the user's email does NOT end with 'gmail.com'.
    return userEmail.indexOf(gmailDomain, userEmail.length - gmailDomain.length) === -1;
  };

  /**
   * Retrieves the current storage usage details for the user's account.
   * It parses numerical values from specific DOM elements displaying storage information.
   * @returns {object|null} An object containing `used`, `total` (as original text), and `percent` (rounded down),
   *                        or `null` if the required DOM elements are not found.
   */
  mailUtils.retrievers.getStorageDetails = function() {
    const storageDisplayDiv = $jqRef('.md.mj').find('div')[0];
    if (!storageDisplayDiv) {
      console.warn("MailForge: Storage display parent element not found.");
      return null;
    }

    const spanElements = $jqRef(storageDisplayDiv).find('span');
    if (spanElements.length < 2) {
      console.warn("MailForge: Insufficient span elements for storage details within the display div.");
      return null;
    }

    const storageUsedText = spanElements[0].textContent || spanElements[0].innerText;
    const storageTotalText = spanElements[1].textContent || spanElements[1].innerText;

    // Helper function to robustly parse a numeric value from text, stripping non-numeric characters.
    const parseNumericValue = (text) => parseFloat(text.replace(/[^0-9.]/g, ''));

    const storageUsed = parseNumericValue(storageUsedText);
    const storageTotal = parseNumericValue(storageTotalText);

    let storagePercentage = 0;
    if (!isNaN(storageUsed) && !isNaN(storageTotal) && storageTotal > 0) {
      storagePercentage = (storageUsed * 100) / storageTotal;
    }

    return {
      used: storageUsedText, // Retain original text for used storage.
      total: storageTotalText, // Retain original text for total storage.
      percent: Math.floor(storagePercentage) // Round down the calculated percentage.
    };
  };

  // --- UI Elements Module: Functions for Specific DOM Interactions ---

  /**
   * Fetches the main content area of the Gmail inbox, typically the primary view.
   * @returns {jQuery} A jQuery object representing the first `div` with `role="main"`.
   */
  mailUtils.uiElements.getMainContentArea = function() {
    return $jqRef('div[role=main]:first');
  };

  /**
   * Retrieves all identifiable inbox sections within the main content area.
   * These can represent different inbox types (Primary, Social, etc.) or multiple inboxes.
   * @returns {jQuery} A jQuery object containing all elements marked with `gh="tl"`.
   */
  mailUtils.uiElements.getInboxSections = function() {
    const mainContainer = mailUtils.uiElements.getMainContentArea();
    return mainContainer.find("[gh=tl]");
  };

  /**
   * Locates and returns the jQuery object corresponding to the visible email subject line element.
   * It iterates through potential subject elements, returning the first one that is visible.
   * @returns {jQuery} A jQuery object for the visible email subject, or an empty jQuery object if none are found.
   */
  mailUtils.uiElements.getEmailSubjectElement = function() {
    const subjectElements = $jqRef(".hP");

    for (let i = 0; i < subjectElements.length; i++) {
      const currentElement = $jqRef(subjectElements[i]);
      if (currentElement.is(':visible')) {
        return currentElement;
      }
    }

    return $jqRef(); // Return an empty jQuery object if no visible subject element is found.
  };

  /**
   * Extracts the text content of the visible email subject line.
   * @returns {string} The trimmed subject text, or an empty string if no subject element is found.
   */
  mailUtils.retrievers.getEmailSubjectText = function() {
    const subjectDom = mailUtils.uiElements.getEmailSubjectElement();
    return subjectDom.text().trim(); // Trim whitespace for cleaner output.
  };

  /**
   * Retrieves the DOM element that contains the primary email body content.
   * @returns {jQuery} A jQuery object representing the email body container.
   */
  mailUtils.uiElements.getEmailBodyContainer = function() {
    return $jqRef('.nH.hx');
  };

  /**
   * Identifies and returns the main toolbar element in the Gmail interface.
   * The function traverses down the DOM tree to find the most specific toolbar container.
   * @returns {jQuery} A jQuery object representing the effective toolbar element.
   */
  mailUtils.uiElements.getToolbarElement = function() {
    let toolbarRoot = $jqRef("[gh='mtb']");

    // Continuously navigate to the first child if it's the only child, to reach the "deepest" toolbar.
    while (toolbarRoot.length > 0 && toolbarRoot.children().length === 1) {
      toolbarRoot = toolbarRoot.children().first();
    }

    return toolbarRoot;
  };

  /**
   * Checks if the user is currently displaying the content of an individual email message or conversation.
   * This involves validating the current view against preview pane status and visible email content elements.
   * @returns {boolean} `true` if the user is viewing email content, `false` otherwise.
   */
  mailUtils.validators.isViewingEmailContent = function() {
    // If a preview pane is active, the user is not considered "inside" a full email view by this logic.
    if (mailUtils.validators.isPreviewPaneActive()) {
      return false;
    }

    const emailItemNodes = $jqRef('.ii.gt');
    const visibleEmailElements = [];

    for (let i = 0; i < emailItemNodes.length; i++) {
      const currentItem = emailItemNodes[i];
      const classList = currentItem.getAttribute('class') ? currentItem.getAttribute('class').split(' ') : [];
      const messageIdentifier = classList[2]; // The third class name often serves as a message ID.

      if (messageIdentifier && messageIdentifier !== 'undefined') { // Ensure ID exists and is not literal "undefined".
        if ($jqRef(currentItem).is(':visible')) { // Check if the element is actually rendered and visible.
          visibleEmailElements.push(currentItem);
        }
      }
    }

    // If at least one visible email content element is found, we are "inside an email".
    return visibleEmailElements.length > 0;
  };

  /**
   * Fetches an array of DOM elements that represent actual email message content.
   * It specifically excludes elements that are marked as editable (e.g., compose areas).
   * @returns {Array<HTMLElement>} An array of HTML elements containing email message content.
   */
  mailUtils.uiElements.fetchEmailContentElements = function() {
    const emailItemNodes = $jqRef('.ii.gt');
    const contentElements = [];

    for (let i = 0; i < emailItemNodes.length; i++) {
      const currentItem = emailItemNodes[i];
      const classList = currentItem.getAttribute('class') ? currentItem.getAttribute('class').split(' ') : [];
      const messageIdentifier = classList[2];
      const contentEditStatus = currentItem.getAttribute('contenteditable');

      // Only include elements with a valid message ID and that are not editable.
      if (messageIdentifier && messageIdentifier !== 'undefined' && contentEditStatus !== 'true') {
        contentElements.push(currentItem);
      }
    }

    return contentElements;
  };

  /**
   * Retrieves the unique identifiers of all currently visible email messages.
   * If in a conversation view, it attempts to collect IDs from all visible content elements.
   * @returns {Array<string>} An array of string identifiers for the visible emails. Returns an empty array if none are found.
   */
  mailUtils.retrievers.getVisibleEmailIdentifiers = function() {
    if (mailUtils.validators.isViewingEmailContent()) {
      const contentElements = mailUtils.uiElements.fetchEmailContentElements();
      const identifiers = new Set(); // Using a Set to automatically handle duplicate IDs.

      contentElements.forEach(el => {
        const classList = el.getAttribute('class') ? el.getAttribute('class').split(' ') : [];
        const msgId = classList[2];
        if (msgId && msgId !== 'undefined') {
          // The original code removes the first character (e.g., 'm123' -> '123').
          identifiers.add(msgId.substring(1));
        }
      });
      return Array.from(identifiers);
    }
    return [];
  };

  /**
   * Fetches the identifiers for all currently open draft messages.
   * @returns {Array<string>} An array of string identifiers for draft messages. Returns an empty array if no drafts are open.
   */
  mailUtils.retrievers.getDraftIdentifiers = function() {
    const draftIdList = [];
    // Selects input elements used for draft IDs within the compose window.
    const draftInputElements = $jqRef(".AD [name=draft]");
    for (let i = 0; i < draftInputElements.length; i++) {
      const draftValue = draftInputElements[i].value;
      if (draftValue && draftValue !== "undefined") { // Check for a non-empty, non-"undefined" string value.
        draftIdList.push(draftValue);
      }
    }
    return draftIdList;
  };

  /**
   * Determines the unique identifier for the email or conversation currently in view.
   * It handles logic for both preview pane views and standard full page email views.
   * @returns {string|null} The email ID (extracted from DOM or URL hash), or `null` if not found.
   */
  mailUtils.retrievers.getCurrentEmailIdentifier = function() {
    let currentEmailHash = null;

    if (mailUtils.validators.isViewingEmailContent()) {
      if (mailUtils.validators.isPreviewPaneActive()) {
        const contentElements = mailUtils.uiElements.fetchEmailContentElements();
        const visibleMailIds = [];

        for (let i = 0; i < contentElements.length; i++) {
          const currentItem = contentElements[i];
          const classList = currentItem.getAttribute('class') ? currentItem.getAttribute('class').split(' ') : [];
          const messageIdentifier = classList[2];
          const contentEditStatus = currentItem.getAttribute('contenteditable');
          // Check for actual element visibility using offset dimensions.
          const elementIsVisible = currentItem.offsetWidth > 0 && currentItem.offsetHeight > 0;

          if (messageIdentifier && messageIdentifier !== 'undefined' && elementIsVisible && contentEditStatus !== 'true') {
            visibleMailIds.push(messageIdentifier);
          }
        }
        // Assumes the first visible, non-editable email content element's ID is the primary one.
        if (visibleMailIds.length > 0) {
          currentEmailHash = visibleMailIds[0].substring(1); // Remove leading character (e.g., 'm').
        }
      } else {
        // For non-preview pane views, the ID is typically found in the URL hash.
        const hashSegment = window.location.hash.split("/").pop();
        if (hashSegment) {
          currentEmailHash = hashSegment.replace(/#/, '').split('?')[0]; // Clean up URL hash for the ID.
        }
      }
    }

    return currentEmailHash;
  };

  /**
   * Checks if the "Priority Inbox" feature is currently enabled and visible.
   * @returns {boolean} `true` if the priority inbox indicator is found, `false` otherwise.
   */
  mailUtils.validators.isPriorityInboxEnabled = function() {
    return $jqRef('.qh').length > 0;
  };

  // --- Extension Detection Validators ---
  // These functions attempt to detect the presence of popular Gmail browser extensions
  // by checking for specific DOM elements that these extensions inject into the page.

  /**
   * Checks for the presence of the Rapportive (now LinkedIn Sales Navigator) extension.
   * @returns {boolean} `true` if the Rapportive sidebar element is detected, `false` otherwise.
   */
  mailUtils.validators.hasRapportiveExtension = function() {
    return $jqRef('#rapportive-sidebar').length === 1;
  };

  /**
   * Checks for the presence of the Streak CRM extension.
   * @returns {boolean} `true` if any of Streak's characteristic 'bentoBox' elements are found, `false` otherwise.
   */
  mailUtils.validators.hasStreakExtension = function() {
    return $jqRef("[id^='bentoBox'],[id*=' bentoBox'],[class*=' bentoBox'],[class*='bentoBox']").length > 0;
  };

  /**
   * Checks for the presence of the Any.do extension.
   * @returns {boolean} `true` if any of Any.do's characteristic elements are found, `false` otherwise.
   */
  mailUtils.validators.hasAnyDoExtension = function() {
    return $jqRef("[id^='anydo'],[id*=' anydo'],[class*=' anydo'],[class*='anydo']").length > 0;
  };

  /**
   * Checks for the presence of the Boomerang for Gmail extension.
   * @returns {boolean} `true` if any of Boomerang's characteristic 'b4g_' elements are found, `false` otherwise.
   */
  mailUtils.validators.hasBoomerangExtension = function() {
    return $jqRef("[id^='b4g_'],[id*=' b4g_'],[class*=' b4g_'],[class*='b4g_']").length > 0;
  };

  /**
   * Checks for the presence of the Xobni (now part of Outlook) extension.
   * @returns {boolean} `true` if the Xobni frame element is detected, `false` otherwise.
   */
  mailUtils.validators.hasXobniExtension = function() {
    return $jqRef('#xobni_frame').length > 0;
  };

  /**
   * Checks for the presence of the Signal by HubSpot extension.
   * @returns {boolean} `true` if any of Signal's characteristic elements are found, `false` otherwise.
   */
  mailUtils.validators.hasSignalExtension = function() {
    return $jqRef("[id^='Signal'],[id*=' Signal'],[class*=' signal'],[class*='signal']").length > 0;
  };

  /**
   * Determines if keyboard shortcuts are currently enabled in Gmail's settings.
   * This relies on extracting a specific flag from Gmail's global configuration data.
   * @returns {boolean} `true` if keyboard shortcuts are active, `false` otherwise.
   *                    Defaults to `true` if the configuration flag cannot be definitively determined.
   */
  mailUtils.validators.keyboardShortcutsActive = function() {
    const shortcutFlagName = 'bx_hs';
    let shortcutFlagValue = undefined;
    let checkStatus = true; // Default assumption if flag is missing or unreadable.

    const configFlagsArray = mailUtils.dataStore.globalData[17] && mailUtils.dataStore.globalData[17][5] && mailUtils.dataStore.globalData[17][5][1];

    if (!Array.isArray(configFlagsArray)) {
      console.warn("MailForge: Global configuration flags array for shortcuts is missing or invalid.");
      return checkStatus;
    }

    for (let i = 0; i < configFlagsArray.length; i++) {
      const currentFlagEntry = configFlagsArray[i];
      if (Array.isArray(currentFlagEntry) && currentFlagEntry[0] === shortcutFlagName) {
        shortcutFlagValue = currentFlagEntry[1];
        break; // Exit loop once the target flag is found.
      }
    }

    if (shortcutFlagValue !== undefined) {
      const valueMapping = {
        '0': true,
        '1': false
      };
      // Assign the mapped boolean value, or retain default `checkStatus` if the value is unexpected.
      checkStatus = valueMapping[shortcutFlagValue] !== undefined ? valueMapping[shortcutFlagValue] : checkStatus;
    }

    return checkStatus;
  };

  // --- UI Elements Module: General DOM Element Retrieval ---

  /**
   * Retrieves all interactive links found within the left sidebar navigation pane.
   * @returns {jQuery} A jQuery object containing all navigation links that have a `title` attribute.
   */
  mailUtils.uiElements.getNavigationLinks = function() {
    return $jqRef("div[role=navigation] [title]");
  };

  /**
   * Retrieves the DOM element corresponding to the search bar input area.
   * @returns {jQuery} A jQuery object for the search bar container.
   */
  mailUtils.uiElements.getSearchInputArea = function() {
    return $jqRef("[gh=sb]");
  };

  /**
   * Extracts the current search query text from the Gmail search bar.
   * @returns {string} The current search query string, or an empty string if the search bar is not found or empty.
   */
  mailUtils.retrievers.getCurrentSearchQuery = function() {
    const searchBarDom = mailUtils.uiElements.getSearchInputArea();
    const searchInput = searchBarDom.find('input')[0];
    return searchInput ? searchInput.value : ''; // Return the input value if the element exists.
  };

  // --- Unread Email Counts Module ---

  /**
   * Helper function to abstract the common logic for retrieving unread email counts for various categories.
   * This function searches the navigation sidebar for elements whose `title` attribute contains the localized category name.
   * @param {string} categoryKey - The internal key representing the email category (e.g., 'inbox', 'drafts').
   * @returns {number} The count of unread emails for the specified category, or `0` if not found or unreadable.
   */
  const getUnreadCountForCategory = function(categoryKey) {
    // Use a helper to get the localized text for the category, assuming `translateText` exists.
    const categoryTitle = mailUtils.helpers.translateText(categoryKey);
    const navElement = $jqRef("div[role=navigation]").find("[title*='" + categoryTitle + "']");

    if (navElement.length > 0 && navElement[0].textContent) {
      const textContent = navElement[0].textContent;
      if (textContent.includes('(')) { // Look for counts enclosed in parentheses.
        const match = textContent.match(/\((\d+)\)/); // Regex to extract the number.
        if (match && match[1]) {
          return parseInt(match[1], 10); // Parse the matched number as an integer.
        }
      }
    }
    return 0; // Default to 0 if count cannot be extracted.
  };

  /**
   * Retrieves the count of unread emails in the primary inbox.
   * @returns {number} The unread inbox count.
   */
  mailUtils.retrievers.getUnreadInboxCount = function() {
    return getUnreadCountForCategory('inbox');
  };

  /**
   * Retrieves the count of unread draft emails.
   * @returns {number} The unread draft count.
   */
  mailUtils.retrievers.getUnreadDraftCount = function() {
    return getUnreadCountForCategory('drafts');
  };

  /**
   * Retrieves the count of unread spam emails.
   * @returns {number} The unread spam count.
   */
  mailUtils.retrievers.getUnreadSpamCount = function() {
    return getUnreadCountForCategory('spam');
  };

  /**
   * Retrieves the count of unread forum emails.
   * @returns {number} The unread forum count.
   */
  mailUtils.retrievers.getUnreadForumCount = function() {
    return getUnreadCountForCategory('forums');
  };

  /**
   * Retrieves the count of unread update emails.
   * @returns {number} The unread update count.
   */
  mailUtils.retrievers.getUnreadUpdateCount = function() {
    return getUnreadCountForCategory('updates');
  };

  /**
   * Retrieves the count of unread promotion emails.
   * @returns {number} The unread promotion count.
   */
  mailUtils.retrievers.getUnreadPromotionCount = function() {
    return getUnreadCountForCategory('promotions');
  };

  /**
   * Retrieves the count of unread social emails.
   * @returns {number} The unread social count.
   */
  mailUtils.retrievers.getUnreadSocialCount = function() {
    return getUnreadCountForCategory('social_updates');
  };

  /**
   * Provides the status of various beta features within the Gmail interface.
   * @returns {object} An object containing boolean flags for identified beta features.
   */
  mailUtils.retrievers.getBetaFeaturesStatus = function() {
    const betaFeatureFlags = {
      isNewNavigationBarVisible: $jqRef('#gbz').length === 0 // Assumes absence of old element implies new nav bar.
    };
    return betaFeatureFlags;
  };

  /**
   * Aggregates and returns all known unread email counts across different categories.
   * @returns {object} An object with keys for each category and their respective unread counts.
   */
  mailUtils.retrievers.getAllUnreadCounts = function() {
    return {
      inbox: mailUtils.retrievers.getUnreadInboxCount(),
      drafts: mailUtils.retrievers.getUnreadDraftCount(),
      spam: mailUtils.retrievers.getUnreadSpamCount(),
      forum: mailUtils.retrievers.getUnreadForumCount(),
      update: mailUtils.retrievers.getUnreadUpdateCount(),
      promotions: mailUtils.retrievers.getUnreadPromotionCount(),
      social: mailUtils.retrievers.getUnreadSocialCount()
    };
  };

  // --- Helpers Module: General Utility Functions ---

  /**
   * Logs an error message to the console. If `console.error` is unavailable, it throws an `Error` object.
   * @param {string} errorMessage - The descriptive error message to be logged or thrown.
   */
  mailUtils.helpers.logError = function(errorMessage) {
    if (typeof console !== 'undefined' && console.error) {
      console.error("MailForge Error: " + errorMessage);
    } else {
      throw new Error("MailForge Error: " + errorMessage); // Throws a new Error for better stack traces.
    }
  };

  /**
   * A mock internationalization (i18n) function. In a full implementation, this would
   * retrieve localized strings based on the current locale. For this clone, it provides
   * basic translations for common categories or falls back to the original key.
   * @param {string} key - The localization key to translate.
   * @returns {string} The translated string, or the original key if no translation is found.
   */
  mailUtils.helpers.translateText = function(key) {
    const translations = {
      'inbox': 'Inbox',
      'drafts': 'Drafts',
      'spam': 'Spam',
      'forums': 'Forums',
      'updates': 'Updates',
      'promotions': 'Promotions',
      'social_updates': 'Social' // Aligned with common Gmail UI labels.
    };
    return translations[key] || key; // Return translated string or the key itself as a fallback.
  };

  /**
   * Parses the query parameters from a given URL string into a JavaScript object.
   * Handles decoding of URI components for both keys and values.
   * @param {string} targetUrl - The full URL string from which to extract parameters.
   * @returns {object} An object where keys are parameter names and values are their decoded strings.
   *                   Returns an empty object if no parameters are found.
   */
  mailUtils.helpers.decodeUrlParameters = function(targetUrl) {
    const paramRegex = /[?&]([^=#]+)=([^&#]*)/g;
    const urlParameters = {};
    let paramMatch;

    // Iterates through all matches found by the regular expression in the URL string.
    while ((paramMatch = paramRegex.exec(targetUrl)) !== null) {
      if (paramMatch[1] && paramMatch[2]) {
        // Decode URI components to handle special characters correctly.
        urlParameters[decodeURIComponent(paramMatch[1])] = decodeURIComponent(paramMatch[2]);
      }
    }
    return urlParameters;
  };

  // The MailForge function returns the `mailUtils` object, exposing all its public APIs.
  return mailUtils;
};