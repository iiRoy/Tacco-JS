/*
 * File: document-info.js
 *
 * Edition: 0.1.7.1
 *
 * Author: Sebastian Rose, Hannover, Germany - sebastian_rose at gmx dot de
 *
 *
 * This software is distributed under the GNU General Public License version 3:
 * consult: http://www.gnu.org/licenses/
 *
 * Prerequisites:
 *
 *   Org-mode >= 6.12a
 *
 *   Org-mode > 6.23 (commit a68eb4b1e64cbe6e495fdd2c1eaf8ae597bf8602):
 *     You'll require at least document-info.js v.0.1.0.1
 *
 * How to Use:
 *
 * Embed this script within the <head> section of your HTML-exported Org files by
 * customizing the 'org-export-html-style' variable (NOTE: add file-specific export
 * options here later).
 * You'll also need to place the following snippet somewhere on the HTML page:
 *
 * <script type="text/javascript" language="JavaScript" src="document-info.js"></script>
 * <script type="text/javascript" language="JavaScript">
 *  // <![CDATA[ // enclose this part
 *  document_section_handler.set("HAS_LOCAL_INDEX", "1");
 *  document_section_handler.set("CURRENT_DISPLAY_MODE", "info");
 *  document_section_handler.set("VIEW_BUTTONS", "true");
 *  document_section_handler.set("PARENT_PAGE_LINK", "http://full/path/to/index/of/this/directory.html");
 *  document_section_handler.set("HOME_PAGE_LINK", "http://full/path/to/homepage.html");
 *  document_section_handler.set("HOVER_HIGHLIGHT_MODE", "underline"); // or a color like '#eeeeee'
 *  document_section_handler.initializeSystem();
 *  // ]]> // enclose this part
 * </script>
 *
 *
 * The script is now roughly segregated into logical parts using form-feeds.
 * Developers can navigate between sections using standard Emacs commands for this purpose
 * ('C-x ]' and 'C-x ]').
 *
 * The logical divisions are:
 *    1. This introductory comment block.
 *    2. Functionality pertaining to `SectionUnit` objects.
 *    3. The `document_section_handler` constructor and initialization logic.
 *    4. `document_section_handler` methods for folding and display management.
 *    5. `document_section_handler` methods for navigation history.
 *    6. `document_section_handler` handling of the minibuffer.
 *    7. `document_section_handler` user interaction.
 *    8. `document_section_handler` search capabilities.
 *    9. `document_section_handler` miscellaneous utilities.
 *    10. Global helper functions.
 */






/*
 * Creates a fresh SectionUnit instance.
 * A SectionUnit stores references to its associated node in the DOM
 * along with several supplementary properties.
 */
function SectionUnit(
  _containerElement,
  _titleElement,
  _navLink,
  _levelValue,
  _parentSection,
  _uniqueIdPart,
  _tocReference
) {
  var currentUnit = this;
  currentUnit.CONTAINER = _containerElement;
  currentUnit.IDENTIFIER_PART = _uniqueIdPart; /* The common suffix for the title and content blocks. */
  currentUnit.INDEX_IN_LIST = -1; /* The index within document_section_handler::ALL_SECTION_UNITS[] */
  currentUnit.TITLE_REF = _titleElement;
  currentUnit.NAV_LINK_REF = _navLink;
  currentUnit.IS_HIGHLIGHTED = false; /* Unit is highlighted (e.g., from search results) */
  currentUnit.PARENT_REF = _parentSection;
  currentUnit.HAS_CUSTOM_FOLD = false; /* Unit has a custom fold state if its children are
                                       folded independently. */
  currentUnit.DISPLAY_STATE = SectionUnit.VIEW_STATE_COLLAPSED;
  currentUnit.TOC_ELEMENT = _tocReference;
  currentUnit.HIERARCHY_LEVEL = _levelValue; /* The root element will have
                                              a level of 0. All other
                                              units derive their level from
                                              their HTML heading level (h1, h2...). */
  currentUnit.CONTENT_BLOCK = null;
  currentUnit.SUB_UNITS = new Array();
  currentUnit.NAVIGATION_STRING = ""; /* The info navigation text */
  currentUnit.CONTROL_BUTTONS = null;

  if (null != currentUnit.PARENT_REF) {
    currentUnit.PARENT_REF.appendSubUnit(this);
    currentUnit.conceal();
  }

  var contentBlock = document.getElementById("text-" + currentUnit.IDENTIFIER_PART);
  if (null == contentBlock && _uniqueIdPart) {
    var oldId = _uniqueIdPart.substring(4);
    contentBlock = document.getElementById("text-" + oldId); /* Attempt with old ID schema */
  }
  if (null != contentBlock)
    currentUnit.CONTENT_BLOCK = contentBlock;

  currentUnit.targetReferences = new Object();
  currentUnit.targetReferences["#" + currentUnit.IDENTIFIER_PART] = 2;
  SectionUnit.discoverTargetsWithin(currentUnit.targetReferences, currentUnit.TITLE_REF, 1); /* 1 == prioritize this as section link. */
  SectionUnit.discoverTargetsWithin(currentUnit.targetReferences, currentUnit.CONTENT_BLOCK, 3);
}

// Static class variables for SectionUnit
SectionUnit.VIEW_STATE_COLLAPSED = 0;
SectionUnit.VIEW_STATE_TITLES_ONLY = 1;
SectionUnit.VIEW_STATE_EXPANDED = 2;



/*
 *
 * Static helper routines for SectionUnit
 *
 */

SectionUnit.discoverTargetsWithin = function(targetMap, searchArea, priorityRank) {
  if (searchArea) {
    var anchorElements = searchArea.getElementsByTagName("a");
    if (anchorElements) {
      for (var idx = 0; idx < anchorElements.length; ++idx) {
        var elementId = anchorElements[idx].getAttribute('id');
        if (elementId) targetMap['#' + elementId] = priorityRank;
        else {
          elementId = anchorElements[idx].getAttribute('name');
          if (elementId) targetMap['#' + elementId] = priorityRank;
        }
      }
    }
  }
};

SectionUnit.concealElement = function(targetElement) {
  if (targetElement && targetElement['style']) { /* Check for 'style' is a quick fix for a related error (fixed toc and title) */
    targetElement.style.display = 'none';
    targetElement.style.visibility = 'hidden';
  }
};

SectionUnit.revealElement = function(targetElement) {
  if (targetElement && targetElement['style']) {
    targetElement.style.display = 'block';
    targetElement.style.visibility = 'visible';
  }
};

SectionUnit.restoreElementVisibility = function(targetElement) {
  targetElement.style.display = "";
  targetElement.style.visibility = "";
};

SectionUnit.isElementConcealed = function(targetElement) {
  if (targetElement.style.display == 'none' || targetElement.style.visibility == 'hidden')
    return true;
  return false;
};

SectionUnit.switchElementVisibility = function(targetElement) {
  if (targetElement.style.display == 'none') {
    targetElement.style.display = 'block';
    targetElement.style.visibility = 'visible';
  } else {
    targetElement.style.display = 'none';
    targetElement.style.visibility = 'hidden';
  }
};

/*
 * Locates the SectionUnit containing a given DOM text node.
 * @param domNode The text node in question.
 * @param sectionRoot The SectionUnit expected to contain the target.
 * @returns The found SectionUnit.
 */
SectionUnit.domToSectionIndex = function(domNode, sectionRoot) {
  while (domNode.nodeType != 1 /* IE lacks Node.ELEMENT_NODE constant... */ ||
    -1 == domNode.attributes["id"].value.indexOf("outline-container-")) {
    domNode = domNode.parentNode;
  }
  var sectionIdPart = domNode.attributes["id"].value.substr(18);
  return SectionUnit.findSectionByIndexPart(sectionIdPart, sectionRoot);
};

/*
 * Searches for a SectionUnit by its unique identifier part within a given SectionUnit's hierarchy.
 * @param targetIdPart The unique identifier string.
 * @param currentSection The SectionUnit to start the search from.
 * @returns The matching SectionUnit or null if not found.
 */
SectionUnit.findSectionByIndexPart = function(targetIdPart, currentSection) {
  if (currentSection.IDENTIFIER_PART == targetIdPart) return currentSection;
  for (var counter = 0; counter < currentSection.SUB_UNITS.length; ++counter) {
    var foundSection = SectionUnit.findSectionByIndexPart(searchIdentifier, currentSection.SUB_UNITS[counter]); /* NOTE: 'searchIdentifier' is a bug, should be 'targetIdPart' */
    if (null != foundSection) return foundSection;
  }
  return null;
};

//
// Member routines for SectionUnit instances
//

SectionUnit.prototype.appendSubUnit = function(newSubUnit) {
  this.SUB_UNITS.push(newSubUnit);
  return this.PARENT_REF;
};


//
// SectionUnit routines for paging (info mode)
//

SectionUnit.prototype.conceal = function() {
  SectionUnit.concealElement(this.CONTAINER);
  if (this.PARENT_REF)
    this.PARENT_REF.conceal();
};

SectionUnit.prototype.reveal = function() {
  SectionUnit.revealElement(this.CONTAINER);
  if (this.HIERARCHY_LEVEL > 2)
    this.PARENT_REF.reveal();
};

SectionUnit.prototype.revealAllSubUnits = function() {
  for (var idx = 0; idx < this.SUB_UNITS.length; ++idx) {
    this.SUB_UNITS[idx].revealAllSubUnits();
  }
  this.reveal();
};

SectionUnit.prototype.concealAllSubUnits = function() {
  for (var idx = 0; idx < this.SUB_UNITS.length; ++idx) {
    this.SUB_UNITS[idx].concealAllSubUnits();
  }
  this.conceal();
};

/*
 * Sets the CSS class for navigation links: 'current' for the active page, 'visited_after_load' for previously visited.
 * Note: visited pages status will reset upon page reload!
 */
SectionUnit.prototype.applyNavLinkStyle = function(isActive) {
  if (this.TOC_ELEMENT) {
    if (isActive) this.TOC_ELEMENT.className = "current";
    else this.TOC_ELEMENT.className = "visited_after_load";
  }
};

//
//  SectionUnit routines for folding content
//

/*
 * This method is invoked on a click event to change the folding state of the unit.
 * It marks its parent as 'dirty' because this unit is folded individually,
 * meaning the parent's next fold operation should fully collapse.
 * @param suppressContentDisplay Boolean. Used solely for the root element's unique
 * toggling behavior. If true, prevents this SectionUnit from displaying its content block.
 */
SectionUnit.prototype.toggleFolding = function(suppressContentDisplay) {
  if (this.PARENT_REF)
    this.PARENT_REF.HAS_CUSTOM_FOLD = true;
  if (this.HAS_CUSTOM_FOLD) {
    this.HAS_CUSTOM_FOLD = false;
    this.DISPLAY_STATE = SectionUnit.VIEW_STATE_EXPANDED; /* So the next state becomes COLLAPSED. See below. */
  }

  if (null != this.CONTENT_BLOCK) {

    if (this.DISPLAY_STATE == SectionUnit.VIEW_STATE_COLLAPSED) {
      // It was collapsed, but a user clicked on it. Now show only headlines recursively.
      if (this.SUB_UNITS.length) {
        this.DISPLAY_STATE = SectionUnit.VIEW_STATE_TITLES_ONLY;
        SectionUnit.concealElement(this.CONTENT_BLOCK);
        for (var idx = 0; idx < this.SUB_UNITS.length; ++idx) {
          this.SUB_UNITS[idx].setUnitDisplayState(SectionUnit.VIEW_STATE_TITLES_ONLY);
        }
      } else if (!suppressContentDisplay) {
        // If no children, directly transition to expanded state:
        this.DISPLAY_STATE = SectionUnit.VIEW_STATE_EXPANDED;
        SectionUnit.revealElement(this.CONTENT_BLOCK);
      }
    } else if (this.DISPLAY_STATE == SectionUnit.VIEW_STATE_TITLES_ONLY) {
      // Show all content recursively
      this.DISPLAY_STATE = SectionUnit.VIEW_STATE_EXPANDED;
      SectionUnit.revealElement(this.CONTENT_BLOCK);
      for (var idx = 0; idx < this.SUB_UNITS.length; ++idx) {
        this.SUB_UNITS[idx].setUnitDisplayState(SectionUnit.VIEW_STATE_EXPANDED);
      }
    } else {
      // Collapse. Display only its own title.
      this.DISPLAY_STATE = SectionUnit.VIEW_STATE_COLLAPSED;
      SectionUnit.concealElement(this.CONTENT_BLOCK);
      for (var idx = 0; idx < this.SUB_UNITS.length; ++idx) {
        this.SUB_UNITS[idx].setUnitDisplayState(SectionUnit.VIEW_STATE_COLLAPSED);
      }
    }
  }
};

/*
 * Recursively changes the display state. This function folds children of activated
 * parents. The display states have a slightly different interpretation here. In this context,
 * the enclosing div (outline-container-id) is also hidden.
 * Perhaps consider adding SectionUnit.VIEW_STATE_HIDDEN with the same numerical value?
 */
SectionUnit.prototype.setUnitDisplayState = function(newDisplayState) {
  var thisUnit = this;
  for (var idx = 0; idx < thisUnit.SUB_UNITS.length; ++idx) {
    thisUnit.SUB_UNITS[idx].setUnitDisplayState(newDisplayState);
  }
  switch (newDisplayState) {
    case SectionUnit.VIEW_STATE_COLLAPSED:
      SectionUnit.concealElement(thisUnit.CONTENT_BLOCK);
      SectionUnit.concealElement(thisUnit.CONTAINER);
      break;
    case SectionUnit.VIEW_STATE_TITLES_ONLY:
      SectionUnit.concealElement(thisUnit.CONTENT_BLOCK);
      SectionUnit.revealElement(thisUnit.CONTAINER);
      break;
    default:
      SectionUnit.revealElement(thisUnit.CONTENT_BLOCK);
      SectionUnit.revealElement(thisUnit.CONTAINER);
  }
  thisUnit.DISPLAY_STATE = newDisplayState;
};






/*
 * The `document_section_handler` manages all SectionUnit instances.
 * We avoid creating anything in its constructor, as the document's DOM
 * might not be fully loaded yet.
 */
var document_section_handler = {
  // Configuration settings
  HOVER_HIGHLIGHT_MODE: 0, // Should headings be highlighted under the mouse cursor?
  MAIN_DOCUMENT_BODY: null, // The primary container for all content.
  OVERVIEW_DISPLAY_MODE: 0, // We are in a simplified overview mode. On startup:= overview
  STRUCTURED_DISPLAY_MODE: 1, // Simplified view showing document structure
  FULL_CONTENT_DISPLAY_MODE: 2, // Simplified view showing all content
  PAGINATED_DISPLAY_MODE: 3, // We are in an info-style paginated view.
  PRESENTATION_DISPLAY_MODE: 4, // Slide presentation mode.
  CURRENT_DISPLAY_MODE: this.STRUCTURED_DISPLAY_MODE, // Default display mode (see initializeSystem())
  HAS_LOCAL_INDEX: false, // Should sub-indexes be generated (see initializeSystem()): "0", "1" "above", "below" (==1, default)
  HOME_PAGE_LINK: 0, // Link to this.HOME_PAGE_LINK?
  PARENT_PAGE_LINK: 0, // Link to this.PARENT_PAGE_LINK?
  NAVIGATION_LINKS_HTML: "", // Stores prepared navigation links for later use (see initializeSystem()),
  MAX_SCAN_ATTEMPTS: 1200, // Maximum number of attempts to scan (results in approx. 2 minutes)
  SCAN_INTERVAL_MS: 100, // Interval between scan attempts in milliseconds.
  CONCEAL_MAIN_TOC: false, // Hide the primary table of contents.
  MAIN_TOC_CUTOFF_LEVEL: 0, // Level at which to truncate the table of contents. No truncation if 0.
  SHOW_INITIAL_MESSAGE: 0, // Display an informational message on startup?
  FOOTER_ELEMENT_CACHE: null, // Caches the 'postamble' DOM element.
  // Internal properties
  DOCUMENT_BASE_URL: document.URL, // The URL without any '#sec-x.y.z' fragment
  QUERY_PARAMETER_STRING: "", // A query string like `?CURRENT_DISPLAY_MODE=content`
  SECTION_TREE_ROOT: null, // The root element of our SectionUnit tree
  ACTIVE_SECTION_UNIT: null, // The currently active section unit
  SAVED_DOCUMENT_TITLE: null, // Stores the document title for toggling visibility
  CLONED_TITLE_IN_SECTION: false, // Indicates if the title is cloned into 'sec-1'.
  LOAD_VERIFICATION_TIMER: null, // Holds the setTimeout()'s return value
  INFO_DISPLAY_WINDOW: null, // A div used to display paginated info view mode
  ALL_SECTION_UNITS: new Array(), // The flat list of all SectionUnit instances
  SECTION_LINK_REGEX: /(#)(.*$)/, // Regex to identify a section link in the TOC
  PLAIN_SECTION_ID_REGEX: /(^#)(sec-\d+([._]\d+)*$)/, // Regex to identify a simple section ID
  HTML_TAG_STRIPPER_REGEX: /<[^>]+>/i, // Regex to remove HTML tags
  ORG_TAG_STRIPPER_REGEX: /^(.*)<span\s+class=[\'\"]tag[\'\"]>(<span[^>]+>[^<]+<\/span>)+<\/span>/i, // Regex to remove Org tags
  WHITESPACE_TRIM_REGEX: /^(\s*)([^\s].*)(\s*)$/, // Regex for trimming leading/trailing whitespace
  MAIN_TOC_ELEMENT: null, // Reference to the main table of contents.
  SCAN_ATTEMPT_COUNT: 0, // Counter for the number of scan attempts.
  NAVIGATION_HISTORY: new Array(50), // Stores navigation history.
  HISTORY_POSITION_INDEX: 0,
  OMIT_FROM_HISTORY: false, // Set to true by popHistory() to prevent new entries.
  IS_TOC_POSITION_FIXED: false, // Should the TOC remain in place if its position is [fixed|absolute]?
  // Command handling:
  MINIBUFFER_CONTAINER: null, // The div that houses the minibuffer.
  MINIBUFFER_INPUT_FIELD: null,
  MINIBUFFER_PROMPT_LABEL: null,
  MINIBUFFER_VERTICAL_OFFSET: "50px",
  SEARCH_TERM_STRING: "", // The active search query string.
  CURRENT_SEARCH_PATTERN: "",
  SEARCH_HIGHLIGHT_REGEX: new RegExp('(<span class="org-info-js_search-highlight">)([^<]*?)(<\/span>)', "gi"),
  MESSAGE_DISPLAY_MODE: 0, // Current message display mode.
  MESSAGE_MODE_INLINE: 1,
  MESSAGE_MODE_TOP: 2,
  // Help display status:
  IS_HELP_ACTIVE: false,
  // Is the console in read mode?
  IS_COMMAND_INPUT_ACTIVE: false,
  // If in read mode, which command triggered it?
  ACTIVE_READ_COMMAND: "",
  // Numerical commands represent internal commands.
  CMD_TYPE_NONE: "_0",
  CMD_TYPE_HTML_REF: "_1",
  CMD_TYPE_ORG_REF: "_2",
  CMD_TYPE_SIMPLE_URL: "_03",
  PREVIOUS_DISPLAY_MODE: 0,
  INITIAL_TAB_INDEX: 1000, // Users might have predefined tab indexes!
  IS_SEARCH_HIGHLIGHT_ENABLED: false,
  SECTION_TAGS_MAP: {}, // Tags: {tag:[index,index2...],tag2:[index1,index2...]}
  ORDERED_TAG_LIST: new Array(), // Alphabetically sorted tags
  TAGS_INDEX_SCREEN_CACHE: null, // Caches the generated tags-index display
  MOUSE_CLICK_TIMER: null, // For handling mouse events
  SECTION_NUMBER_TO_UNIT_MAP: {}, // Maps section numbers to their corresponding SectionUnit objects
  LAST_TOC_NAV_LINK: null, // The last link activated in the Table of Contents
  EVENT_HOOKS: {
    hooks_ready: false, // Hooks. hooks_ready is false until onSystemInitialized() runs.
    onSectionRevealed: [],
    onSystemInitialized: []
  },

  /*
   * Configures the `document_section_handler` for scanning.
   * Here, the timeout function is established, which will periodically
   * awaken `document_section_handler` to attempt scanning the document.
   * All user-configurable options (the documented ones) are verified and
   * adjusted to valid values.
   */
  initializeSystem: function() {
    var selfRef = this;
    if (window['docSectionHooks']) {
      for (var loopIdx in docSectionHooks) {
        selfRef.EVENT_HOOKS[loopIdx] = docSectionHooks[loopIdx];
      }
      selfRef.EVENT_HOOKS['hooks_ready'] = false;
    }

    if (window.location.search) { // Allow overwriting of settings via URL
      var settingPairs = window.location.search.substring(1).split('&');
      for (var loopIdx = 0; loopIdx < settingPairs.length; ++loopIdx) {
        var equalsPos = settingPairs[loopIdx].indexOf('=');
        if (-1 != equalsPos) {
          var valueStr = settingPairs[loopIdx].substring(equalsPos + 1);
          var keyStr = settingPairs[loopIdx].substring(0, equalsPos);
          switch (keyStr) {
            // Explicitly permit overwrites for these keys.
            // Fall-through behavior:
            case 'TOC':
            case 'TOC_DEPTH':
            case 'MOUSE_HINT':
            case 'HELP':
            case 'VIEW':
            case 'HIDE_TOC':
            case 'LOCAL_TOC':
            case 'OCCUR':
              selfRef.set(keyStr, decodeURIComponent(valueStr));
              break;
            default:
              break;
          }
        }
      }
    }
    selfRef.CURRENT_DISPLAY_MODE = selfRef.CURRENT_DISPLAY_MODE ? selfRef.CURRENT_DISPLAY_MODE : selfRef.OVERVIEW_DISPLAY_MODE;
    selfRef.VIEW_BUTTONS = (selfRef.VIEW_BUTTONS && selfRef.VIEW_BUTTONS != "0") ? true : false;
    selfRef.SHOW_INITIAL_MESSAGE = (selfRef.SHOW_INITIAL_MESSAGE && selfRef.SHOW_INITIAL_MESSAGE != "0") ? true : false;
    selfRef.HAS_LOCAL_INDEX = (selfRef.HAS_LOCAL_INDEX && selfRef.HAS_LOCAL_INDEX != "0") ? selfRef.HAS_LOCAL_INDEX : false;
    selfRef.CONCEAL_MAIN_TOC = (selfRef.MAIN_TOC_ELEMENT && selfRef.MAIN_TOC_ELEMENT != "0") ? false : true;
    selfRef.CLONED_TITLE_IN_SECTION = (selfRef.CLONED_TITLE_IN_SECTION && selfRef.CLONED_TITLE_IN_SECTION != "title_above") ? false : true;
    if (selfRef.IS_TOC_POSITION_FIXED && selfRef.IS_TOC_POSITION_FIXED != "0") {
      selfRef.IS_TOC_POSITION_FIXED = true;
      selfRef.CONCEAL_MAIN_TOC = false;
    } else selfRef.IS_TOC_POSITION_FIXED = false;

    selfRef.NAVIGATION_LINKS_HTML +=
      ((selfRef.PARENT_PAGE_LINK && selfRef.PARENT_PAGE_LINK != document.URL) ? '<a href="' + selfRef.PARENT_PAGE_LINK + '">Up</a> / ' : "") +
      ((selfRef.HOME_PAGE_LINK && selfRef.HOME_PAGE_LINK != document.URL) ? '<a href="' + selfRef.HOME_PAGE_LINK + '">HOME</a> / ' : "") +
      '<a href="javascript:document_section_handler.showHelp();">HELP</a> / ';

    selfRef.LOAD_VERIFICATION_TIMER = window.setTimeout("DocSectionHandlerLoadVerifier()", 50);
  },

  stripWhitespace: function(inputString) {
    var matchResult = this.WHITESPACE_TRIM_REGEX.exec(inputString);
    return RegExp.$2;
  },

  stripHtmlTags: function(inputString) {
    if (inputString) {
      while (inputString.match(this.HTML_TAG_STRIPPER_REGEX)) {
        inputString = inputString.substr(0, inputString.indexOf('<')) + inputString.substr(inputString.indexOf('>') + 1);
      }
    }
    return inputString;
  },