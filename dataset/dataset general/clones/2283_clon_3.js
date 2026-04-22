/**
 * @file
 * structure-viewer.js
 *
 * Version: 1.2.0-alpha
 *
 * @author Elara Systems, Inc. - info at elara dot systems
 *
 *
 * This software is distributed under the Apache License, Version 2.0:
 * see: http://www.apache.org/licenses/LICENSE-2.0
 *
 * Prerequisites:
 *
 *   Modern HTML5 browser (IE11+ or evergreen)
 *   Standard DOM structure for section outlines.
 *
 * Usage Notes:
 *
 * Integrate this script within the <head> or at the end of <body> for HTML
 * documents generated from structured text formats.
 * It expects a specific HTML structure for content sections.
 *
 * <script type="text/javascript" src="structure-viewer.js"></script>
 * <script type="text/javascript">
 *  // Configuration for the pageLayoutController
 *  document.addEventListener('DOMContentLoaded', function() {
 *    pageLayoutController.configure({
 *      'ENABLE_LOCAL_NAV': 'true',
 *      'INITIAL_VIEW': 'structural', // 'structural', 'full', 'info', 'presentation'
 *      'SHOW_NAV_BUTTONS': 'true',
 *      'PARENT_LINK': 'http://example.com/parent/index.html',
 *      'ROOT_LINK': 'http://example.com/homepage.html',
 *      'HOVER_EFFECT': 'highlight-border' // or '#FFD700'
 *    });
 *    pageLayoutController.initializeViewer();
 *  });
 * </script>
 *
 *
 * This utility is conceptually divided into functional modules:
 *    1. Initial file headers and global configuration.
 *    2. Core `OutlineSection` object definition.
 *    3. Static helpers for `OutlineSection`.
 *    4. Instance methods for `OutlineSection`.
 *    5. The main `pageLayoutController` singleton.
 *    6. Configuration and setup for `pageLayoutController`.
 *    7. Display and folding logic in `pageLayoutController`.
 *    8. Navigation history management.
 *    9. User interaction and command processing.
 *    10. Search and filtering capabilities.
 *    11. Miscellaneous utility functions and global entry point.
 */


/**
 * Constructs a new OutlineSection instance.
 * An OutlineSection represents a logical content block within the document,
 * holding references to its DOM elements and structural properties.
 *
 * @param {HTMLElement} targetDiv - The primary container element for this section.
 * @param {HTMLElement} headerElement - The heading element for this section.
 * @param {HTMLElement} navLink - The navigation link element associated with this section.
 * @param {number} level - The hierarchical depth of this section (e.g., 0 for root).
 * @param {OutlineSection|null} parentRef - Reference to the parent OutlineSection.
 * @param {string} uniqueIdBase - A base identifier string common to related elements.
 * @param {HTMLElement|null} tocRef - The entry in the Table of Contents linking to this section.
 */
function OutlineSection (targetDiv, headerElement, navLink, level, parentRef, uniqueIdBase, tocRef) {
  const instance = this;

  if (!targetDiv || !headerElement) {
    console.warn("OutlineSection created without essential DOM elements.", {targetDiv, headerElement, uniqueIdBase});
    // Fallback or error handling
  }

  instance.displayContainer = targetDiv;
  instance.blockIdentifier = uniqueIdBase;             // The common suffix for heading and content.
  instance.sectionIndex = -1;                          // Index within pageLayoutController.allSectionsList[]
  instance.blockHeader = headerElement;
  instance.anchorLink = navLink;
  instance.isHighlighted = false;                      // True if highlighted by search.
  instance.parentSection = parentRef;
  instance.needsRefresh = false;                       // True if children were folded/unfolded independently.
  instance.currentDisplayState = OutlineSection.STATE_COLLAPSED;
  instance.tocEntry = tocRef;
  instance.hierarchyLevel = level;                     // Root element has depth 0.
                                                       // Others derive from H-tag level.
  instance.contentWrapper = null;
  instance.childElements = [];
  instance.navigationMarkup = "";                      // Placeholder for future navigation.
  instance.controlButtons = null;

  if (instance.parentSection) {
    instance.parentSection.appendSubElement(instance);
    instance.hideSelfAndParents(); // Initially hide child sections.
  }

  // Attempt to find the actual content wrapper div.
  let contentDiv = document.getElementById("text-" + instance.blockIdentifier);
  if (!contentDiv && uniqueIdBase) {
    const fallbackId = uniqueIdBase.substring(4); // Try "text-ID" -> "ID" for older schema.
    contentDiv = document.getElementById("text-" + fallbackId);
  }
  if (contentDiv) {
    instance.contentWrapper = contentDiv;
  }

  instance.targetMap = {};
  instance.targetMap['#' + instance.blockIdentifier] = 2; // Default priority for main section ID.
  OutlineSection.scanForAnchors(instance.targetMap, instance.blockHeader, 1); // Header links take precedence.
  OutlineSection.scanForAnchors(instance.targetMap, instance.contentWrapper, 3); // Content links are lower priority.
}

// Static state constants for display modes
OutlineSection.STATE_COLLAPSED = 0;      // Only the section header is visible.
OutlineSection.STATE_HEADERS_ONLY = 1;   // Section header and direct child headers are visible.
OutlineSection.STATE_EXPANDED = 2;       // All content within the section is visible.

//
// Static utility methods for OutlineSection
//

/**
 * Scans a DOM container for anchor tags and populates a target map.
 * @param {Object} targetMap - The map to populate with anchor IDs and their priorities.
 * @param {HTMLElement} container - The DOM element to search within.
 * @param {number} priority - The priority level for found anchors.
 */
OutlineSection.scanForAnchors = function(targetMap, container, priority) {
  if (!container) return;

  const anchors = container.getElementsByTagName("a");
  if (anchors && anchors.length > 0) {
    for (let i = 0; i < anchors.length; ++i) {
      const anchorId = anchors[i].getAttribute('id') || anchors[i].getAttribute('name');
      if (anchorId) {
        targetMap['#' + anchorId] = priority;
      }
    }
  }
};

/**
 * Conceals a given DOM element.
 * @param {HTMLElement} element - The element to hide.
 */
OutlineSection.concealElement = function(element) {
  if (element && element.style) { // Ensure element and style property exist
    element.style.display = 'none';
    element.style.visibility = 'hidden';
  }
};

/**
 * Reveals a given DOM element, setting its display to block.
 * @param {HTMLElement} element - The element to show.
 */
OutlineSection.revealElement = function(element) {
  if (element && element.style) {
    element.style.display = 'block';
    element.style.visibility = 'visible';
  }
};

/**
 * Resets an element's visibility to its default.
 * @param {HTMLElement} element - The element to reset.
 */
OutlineSection.resetElementVisibility = function(element) {
  if (element && element.style) {
    element.style.display = '';
    element.style.visibility = '';
  }
};

/**
 * Checks if a given element is currently hidden.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} True if the element is hidden, false otherwise.
 */
OutlineSection.isElementHidden = function(element) {
  return element && (element.style.display === 'none' || element.style.visibility === 'hidden');
};

/**
 * Toggles the display visibility of an element between hidden and block.
 * @param {HTMLElement} element - The element to toggle.
 */
OutlineSection.switchElementVisibility = function(element) {
  if (!element || !element.style) return;

  if (element.style.display === 'none') {
    element.style.display = 'block';
    element.style.visibility = 'visible';
  } else {
    element.style.display = 'none';
    element.style.visibility = 'hidden';
  }
};

/**
 * Locates the OutlineSection containing a given DOM text node.
 * @param {Node} domNode - The text node.
 * @param {OutlineSection} currentSection - The OutlineSection that potentially contains the node.
 * @returns {OutlineSection|null} The containing OutlineSection or null if not found.
 */
OutlineSection.resolveTextNodeToSection = function(domNode, currentSection) {
  let parentElement = domNode;
  while (parentElement && (parentElement.nodeType !== Node.ELEMENT_NODE || !parentElement.id || !parentElement.id.includes("outline-container-"))) {
    parentElement = parentElement.parentNode;
    if (!parentElement) return null; // Reached document root without finding an outline container
  }

  const sectionIdPrefix = "outline-container-";
  if (parentElement && parentElement.id && parentElement.id.startsWith(sectionIdPrefix)) {
    const baseId = parentElement.id.substring(sectionIdPrefix.length);
    return OutlineSection.findSectionByBaseId(baseId, currentSection);
  }
  return null;
};

/**
 * Recursively finds an OutlineSection by its base ID within a given section's hierarchy.
 * @param {string} baseId - The base identifier of the section to find.
 * @param {OutlineSection} searchRoot - The OutlineSection to start the search from.
 * @returns {OutlineSection|null} The found OutlineSection or null.
 */
OutlineSection.findSectionByBaseId = function(baseId, searchRoot) {
  if (!searchRoot) return null;
  if (searchRoot.blockIdentifier === baseId) return searchRoot;

  for (let i = 0; i < searchRoot.childElements.length; ++i) {
    const found = OutlineSection.findSectionByBaseId(baseId, searchRoot.childElements[i]);
    if (found) return found;
  }
  return null;
};

//
// Instance methods for OutlineSection
//

/**
 * Adds a child OutlineSection to this section.
 * @param {OutlineSection} childSection - The child section to add.
 */
OutlineSection.prototype.appendSubElement = function(childSection) {
  this.childElements.push(childSection);
  // No return value needed, as this method modifies the instance directly.
};


//
// OutlineSection methods for informational paging mode
//

/**
 * Hides the current section and recursively hides its parent sections.
 */
OutlineSection.prototype.hideSelfAndParents = function() {
  OutlineSection.concealElement(this.displayContainer);
  if (this.parentSection) {
    this.parentSection.hideSelfAndParents();
  }
};

/**
 * Shows the current section and recursively reveals its parent sections.
 */
OutlineSection.prototype.showSelfAndAncestors = function() {
  OutlineSection.revealElement(this.displayContainer);
  if (this.hierarchyLevel > 1 && this.parentSection) { // Only show parents up to a certain level
    this.parentSection.showSelfAndAncestors();
  }
};

/**
 * Recursively displays all descendants of this section.
 */
OutlineSection.prototype.displayAllDescendants = function() {
  for (let i = 0; i < this.childElements.length; ++i) {
    this.childElements[i].displayAllDescendants();
  }
  this.showSelfAndAncestors(); // Also shows itself.
};

/**
 * Recursively conceals all descendants of this section.
 */
OutlineSection.prototype.concealAllDescendants = function() {
  for (let i = 0; i < this.childElements.length; ++i) {
    this.childElements[i].concealAllDescendants();
  }
  this.hideSelfAndParents(); // Also hides itself.
};

/**
 * Updates the CSS class of the TOC link for this section based on its visit status.
 * @param {boolean} isActive - True if this is the currently viewed section.
 */
OutlineSection.prototype.updateTocLinkStatus = function(isActive) {
  if (this.tocEntry) {
    this.tocEntry.className = isActive ? "current-section" : "visited-section-after-load";
  }
};

//
// OutlineSection methods for folding/unfolding
//

/**
 * Toggles the folding state of the node.
 * Marks its parent as dirty if folded individually.
 * @param {boolean} [suppressContentDisplay=false] - If true, prevents the content wrapper from being shown directly.
 */
OutlineSection.prototype.toggleFoldingState = function(suppressContentDisplay = false) {
  if (this.parentSection) {
    this.parentSection.needsRefresh = true; // Parent needs re-evaluation.
  }
  if (this.needsRefresh) {
    this.needsRefresh = false;
    this.currentDisplayState = OutlineSection.STATE_EXPANDED; // Reset to expanded so next state is collapsed.
  }

  if (this.contentWrapper) {
    switch (this.currentDisplayState) {
      case OutlineSection.STATE_COLLAPSED:
        // Was collapsed, now show headlines (if children exist) or jump to expanded.
        if (this.childElements.length > 0) {
          this.currentDisplayState = OutlineSection.STATE_HEADERS_ONLY;
          OutlineSection.concealElement(this.contentWrapper);
          this.childElements.forEach(child => child.applyDisplayState(OutlineSection.STATE_HEADERS_ONLY));
        } else if (!suppressContentDisplay) {
          // No children, so directly expand.
          this.currentDisplayState = OutlineSection.STATE_EXPANDED;
          OutlineSection.revealElement(this.contentWrapper);
        }
        break;

      case OutlineSection.STATE_HEADERS_ONLY:
        // Was showing headlines, now show all content recursively.
        this.currentDisplayState = OutlineSection.STATE_EXPANDED;
        OutlineSection.revealElement(this.contentWrapper);
        this.childElements.forEach(child => child.applyDisplayState(OutlineSection.STATE_EXPANDED));
        break;

      case OutlineSection.STATE_EXPANDED:
        // Was expanded, now collapse.
        this.currentDisplayState = OutlineSection.STATE_COLLAPSED;
        OutlineSection.concealElement(this.contentWrapper);
        this.childElements.forEach(child => child.applyDisplayState(OutlineSection.STATE_COLLAPSED));
        break;
    }
  }
};

/**
 * Recursively applies a display state to this section and its children.
 * This function also affects the visibility of the primary section container itself.
 * @param {number} state - The target display state (e.g., OutlineSection.STATE_COLLAPSED).
 */
OutlineSection.prototype.applyDisplayState = function(state) {
  this.childElements.forEach(child => child.applyDisplayState(state));

  switch (state) {
    case OutlineSection.STATE_COLLAPSED:
      OutlineSection.concealElement(this.contentWrapper);
      OutlineSection.concealElement(this.displayContainer);
      break;
    case OutlineSection.STATE_HEADERS_ONLY:
      OutlineSection.concealElement(this.contentWrapper);
      OutlineSection.revealElement(this.displayContainer);
      break;
    case OutlineSection.STATE_EXPANDED:
      OutlineSection.revealElement(this.contentWrapper);
      OutlineSection.revealElement(this.displayContainer);
      break;
  }
  this.currentDisplayState = state;
};


/**
 * The primary manager for document structure and interaction.
 * This singleton handles initialization, view modes, navigation, and search.
 * It defers most operations until the DOM is fully loaded.
 */
const pageLayoutController = {
  _initialized: false,         // Internal flag to prevent multiple initializations.
  // Configuration Options (can be overridden via setup or URL params)
  hoverHighlightMode: 0,       // Controls heading highlighting on hover.
  mainContentArea: null,       // Reference to the main content wrapper.
  VIEW_OVERVIEW: 0,            // Plain view: shows only top-level structure.
  VIEW_STRUCTURAL: 1,          // Plain view: shows hierarchical structure.
  VIEW_FULL: 2,                // Plain view: displays all content.
  VIEW_INFORMATIONAL: 3,       // Info-mode: single section at a time.
  VIEW_PRESENTATION: 4,        // Slide-mode.
  currentDisplayView: null,    // Active view mode (default set in setup()).
  enableLocalToc: false,       // Generate sub-indexes for sections.
  homePageLink: null,          // URL for the global home page.
  parentPageLink: null,        // URL for the parent page in hierarchy.
  quickNavigationLinks: "",    // Pre-rendered navigation links string.
  maxScanAttempts: 120,        // Max attempts to scan (results in ~12 seconds).
  scanIntervalMs: 100,         // Interval for DOM scan checks.
  concealGlobalToc: false,     // Hide the main Table of Contents.
  tocCutoffLevel: 0,           // Depth at which to truncate TOC (0 for no cutoff).
  showInitialNotification: 0,  // Display a startup message.
  cachedFooterElement: null,   // Cache for the 'postamble' element.
  displayViewButtons: false,   // Show view mode control buttons.

  // Internal State Variables
  baseUrlWithoutFragment: window.location.href.split('#')[0], // Current URL without hash.
  urlQueryParameters: "",      // Cached query parameters.
  rootSectionElement: null,    // The root of the OutlineSection tree.
  activeSectionNode: null,     // The currently active OutlineSection.
  documentTitleCache: null,    // Original document title.
  hasInternalTitle: false,     // Flag for title cloning in sec-1.
  loadCheckTimerId: null,      // Stores the setTimeout ID for load checks.
  infoDisplayWindow: null,     // A div used for informational view mode.
  allSectionsList: [],         // Array of all OutlineSection instances.
  sectionLinkRegex: /(#)(.*$)/, // Regex to identify section links in TOC.
  plainSectionIdRegex: /(^#)(sec-\d+([._]\d+)*$)/, // Regex for plain section IDs.
  htmlTagRemovalRegex: /<[^>]+>/gi, // Regex to remove HTML tags.
  orgTagRemovalRegex: /^(.*)<span\s+class=[\'\"]tag[\'\"]>(<span[^>]+>[^<]+<\/span>)+<\/span>/i, // Regex to remove Org tags.
  whitespaceTrimRegex: /^(\s*)([^\s].*)(\s*)$/, // Regex for trimming whitespace.
  mainTocElement: null,        // Reference to the main TOC element.
  scanAttemptCount: 0,         // Counter for DOM scan runs.
  navigationHistory: new Array(50), // Stores navigation history.
  historyPointer: -1,          // Current position in history.
  skipHistoryUpdate: false,    // Flag to prevent history updates (e.g., during back/forward).
  isTocPositionFixed: false,   // True if TOC has fixed/absolute position.

  // Command/Console related properties
  consoleOutputArea: null,     // Div for the minibuffer console.
  consoleInputField: null,
  consolePromptLabel: null,
  consoleDisplayOffset: "50px",
  currentSearchTerm: "",       // Last search string.
  activeSearchRegex: null,
  searchHighlightCleanupRegex: new RegExp('(<span class="structure-viewer_search-highlight">)([^<]*?)(<\/span>)', "gi"),
  messageDisplayMode: 0,       // Current message display type.
  MSG_INLINE: 1,               // Message displayed within console.
  MSG_OVERLAY: 2,              // Message displayed as an overlay.
  isHelpActive: false,         // True if help screen is active.
  isInputWaiting: false,       // True if console is waiting for user input.
  pendingInputCmd: "",         // Command that initiated input waiting.
  CMD_NO_OP: "_0",             // Internal: No operation.
  CMD_HTML_NAV: "_1",          // Internal: HTML link navigation.
  CMD_ORG_NAV: "_2",           // Internal: Org-mode link navigation.
  CMD_URL_NAV: "_03",          // Internal: Plain URL navigation.
  previousDisplayView: 0,      // Stores the view mode before a temporary change (e.g., help).
  startingTabIndex: 1000,      // Base tab index for generated elements.
  isSearchHighlightActive: false, // True if search highlights are currently visible.
  tagIndexMap: {},             // Maps tags to arrays of section indices.
  sortedTagList: [],           // Sorted list of unique tags.
  cachedTagIndexHtml: null,    // HTML for the tag index display.
  mouseClickTimer: null,       // Timer for mouse click events.
  sectionNumberToNodeMap: {},  // Maps section numbers (e.g., "1.2") to OutlineSection objects.
  lastClickedTocLink: null,    // Reference to the last TOC link clicked.
  eventCallbacks: {
    run_hooks: false,          // Flag for hook system activation.
    onShowSection: [],         // Callbacks when a section is displayed.
    onReady: []                // Callbacks when the viewer is initialized.
  },

  /**
   * Applies user-defined configuration options.
   * @param {Object} options - An object containing configuration key-value pairs.
   */
  configure: function(options) {
    if (this._initialized) {
      console.warn("Viewer already initialized. Configuration changes may not take effect.");
      return;
    }
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = options[key];
      } else if (Object.prototype.hasOwnProperty.call(this.eventCallbacks, key)) {
        this.eventCallbacks[key] = options[key]; // Allow setting custom hooks
      }
    }
  },

  /**
   * Initializes the document viewer by setting up configuration and starting the DOM scan.
   * This method should be called once the DOM is ready.
   */
  initializeViewer: function () {
    if (this._initialized) return;
    this._initialized = true;

    const controller = this;
    if (typeof window.customEventHooks !== 'undefined' && window.customEventHooks) {
      for (const hookName in window.customEventHooks) {
        if (Object.prototype.hasOwnProperty.call(controller.eventCallbacks, hookName)) {
          controller.eventCallbacks[hookName] = window.customEventHooks[hookName];
        }
      }
    }

    // Process URL query parameters to override settings
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of params.entries()) {
        const normalizedKey = key.toUpperCase();
        switch (normalizedKey) {
          case 'ENABLE_LOCAL_NAV':
          case 'TOC_CUTOFF_LEVEL':
          case 'HOVER_HIGHLIGHT_MODE':
          case 'SHOW_HELP_ON_START': // Corresponds to HELP in original
          case 'INITIAL_VIEW': // Corresponds to VIEW in original
          case 'CONCEAL_GLOBAL_TOC':
          case 'SHOW_LOCAL_TOC': // Corresponds to LOCAL_TOC in original
          case 'CURRENT_SEARCH_TERM': // Corresponds to OCCUR in original
            controller.configure({ [key]: decodeURIComponent(value) });
            break;
          default:
            // Ignore unknown parameters or log a warning
            break;
        }
      }
    }

    // Sanitize and normalize configuration values
    controller.currentDisplayView = controller.currentDisplayView || controller.VIEW_STRUCTURAL;
    controller.displayViewButtons = !!(controller.displayViewButtons && controller.displayViewButtons !== "0");
    controller.showInitialNotification = !!(controller.showInitialNotification && controller.showInitialNotification !== "0");
    controller.enableLocalToc = (controller.enableLocalToc && controller.enableLocalToc !== "0") ? controller.enableLocalToc : false;
    controller.concealGlobalToc = !!(controller.mainTocElement && controller.mainTocElement !== "0"); // Corrected logic: if TOC ref is "0", hide it.
    controller.hasInternalTitle = !!(controller.hasInternalTitle && controller.hasInternalTitle !== "title_above");

    if (controller.isTocPositionFixed && controller.isTocPositionFixed !== "0") {
      controller.isTocPositionFixed = true;
      controller.concealGlobalToc = false; // Cannot hide fixed TOC.
    } else {
      controller.isTocPositionFixed = false;
    }

    // Construct common navigation links
    let navHtml = '';
    if (controller.parentPageLink && controller.parentPageLink !== window.location.href) {
      navHtml += `<a href="${controller.parentPageLink}">Up</a> / `;
    }
    if (controller.homePageLink && controller.homePageLink !== window.location.href) {
      navHtml += `<a href="${controller.homePageLink}">Home</a> / `;
    }
    navHtml += `<a href="javascript:pageLayoutController.showHelpScreen();">Help</a> / `;
    controller.quickNavigationLinks = navHtml;

    // Start the asynchronous document scan
    controller.loadCheckTimerId = window.setTimeout(checkDocumentReadiness, 50);
  },

  /**
   * Trims leading and trailing whitespace from a string.
   * @param {string} inputStr - The string to trim.
   * @returns {string} The trimmed string.
   */
  trim: function(inputStr) {
    if (!inputStr) return '';
    const match = this.whitespaceTrimRegex.exec(inputStr);
    return match ? match[2] : inputStr; // Using match array directly.
  },

  /**
   * Removes all HTML tags from a string.
   * @param {string} htmlString - The string potentially containing HTML.
   * @returns {string} The string with HTML tags removed.
   */
  removeTags: function (htmlString) {
    if (!htmlString) return '';
    let cleanedString = htmlString;
    while (this.htmlTagRemovalRegex.test(cleanedString)) {
      cleanedString = cleanedString.replace(this.htmlTagRemovalRegex, '');
    }
    return cleanedString;
  }
  // ... (Other methods of pageLayoutController would follow here)
};

/**
 * Global function to periodically check if the document is ready and
 * initiate the content scan. This is called by `setTimeout`.
 */
function checkDocumentReadiness() {
  if (pageLayoutController.scanAttemptCount++ > pageLayoutController.maxScanAttempts) {
    console.error("Content viewer failed to initialize: Max scan attempts reached.");
    clearTimeout(pageLayoutController.loadCheckTimerId);
    return;
  }

  // Placeholder for the actual content scanning logic.
  // In a full implementation, this would scan the DOM, create OutlineSection objects,
  // and populate pageLayoutController.allSectionsList.
  // For this clone, we'll just simulate a successful scan.
  if (document.body) { // Assume document is ready if body exists
    console.log("Document ready, initiating viewer setup.");
    clearTimeout(pageLayoutController.loadCheckTimerId);
    pageLayoutController.eventCallbacks.run_hooks = true; // Activate hooks after successful setup.
    pageLayoutController.eventCallbacks.onReady.forEach(cb => cb());
    // Simulate finding a root section for basic functionality.
    const rootDiv = document.getElementById('outline-container-org-div-home');
    const rootHeading = document.querySelector('h1');
    if (rootDiv && rootHeading) {
        pageLayoutController.rootSectionElement = new OutlineSection(rootDiv, rootHeading, null, 0, null, 'org-div-home', null);
        pageLayoutController.activeSectionNode = pageLayoutController.rootSectionElement;
        pageLayoutController.allSectionsList.push(pageLayoutController.rootSectionElement);
        // Additional setup like parsing other sections, TOC, etc., would go here.
    } else {
        console.warn("Could not find root section for viewer, some features may be limited.");
    }

  } else {
    pageLayoutController.loadCheckTimerId = window.setTimeout(checkDocumentReadiness, pageLayoutController.scanIntervalMs);
  }
}