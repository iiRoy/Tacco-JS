/*
 * app-strings-en.js
 * Default English localization strings for the application settings.
 * This module defines various UI labels, button texts, and setting descriptions.
 *
 * This file is part of the application's internationalization resources.
 * All rights reserved.
 */

/* global define */

// Define the core application localization data for the English language.
// This structure is designed to be consumed by an AMD loader.
define(function () {
    // --- Configuration Constants & Helper Data (for potential future use) ---
    // A simple identifier for this locale module.
    const CURRENT_LOCALE_ID = "en-US";
    // A flag to indicate if this is the primary language.
    const IS_PRIMARY_LANGUAGE = true;

    // The main collection of localized strings.
    const localizedContentMap = {
        // --- General Application Interface Elements ---
        "APP_SETTINGS_DLG_TITLE"          : "Application Preferences...",
        "BTN_ACTION_SAVE"                 : "Save Changes",
        "BTN_ACTION_CANCEL"               : "Discard",
        "COMMON_UNAVAILABLE_MESSAGE"      : "Not available",

        // --- Categories for Settings Panel ---
        "CATEGORY_GENERAL_LABEL"          : "General",
        "CATEGORY_NETWORK_LABEL"          : "Network Connection",
        "CATEGORY_EDITOR_LABEL"           : "Code Editor",
        "MISC_SETTINGS_CATEGORY"          : "Miscellaneous", // Added new category

        // --- Editor Settings Options ---
        "OPT_BRACKET_CLOSURE"             : "Auto-close Brackets",
        "OPT_BRACKET_CLOSURE_DESC"        : "Enables automatic closure for braces, brackets, and parentheses.",
        "OPT_DRAG_DROP_FEATURE"           : "Text Drag & Drop Functionality",
        "OPT_DRAG_DROP_FEATURE_DESC"      : "Toggle the ability to drag and drop text selections within the editor.",
        "OPT_SHOW_CURSOR_ON_SEL"          : "Visible Cursor During Selection",
        "OPT_SHOW_CURSOR_ON_SEL_DESC"     : "Keeps the text insertion cursor visible even when a text range is selected.",
        "OPT_UPPERCASE_COLORS"            : "Uppercase Color Values",
        "OPT_UPPERCASE_COLORS_DESC"       : "If true, color codes in the inline editor will be displayed in uppercase.",

        // --- Code Hinting Features ---
        "HEADING_CODE_ASSIST"             : "Code Hinting",
        "OPT_ENABLE_CODE_HINTS"           : "Activate All Code Hints",
        "OPT_ENABLE_CODE_HINTS_DESC"      : "When enabled, all available code hinting features are active.",
        "OPT_MAX_CODE_HINTS_DISPLAY"      : "Maximum Simultaneous Hints",
        "OPT_HINTS_HTML_ATTRIBUTES"       : "HTML Attribute Suggestions",
        "OPT_HINTS_CSS_PROPERTIES"        : "CSS/LESS/SCSS Property Hints",
        "OPT_HINTS_JAVASCRIPT_CODE"       : "JavaScript Code Suggestions",
        "OPT_HINTS_HTML_ENTITIES"         : "HTML Entity Hints",
        "OPT_HINTS_SVG_CODE"              : "SVG Code Hints",
        "OPT_HINTS_HTML_TAGS"             : "HTML Tag Completion",
        "OPT_HINTS_URL_PATHS"             : "URL Path Hints (HTML & CSS)",
        "OPT_JS_HINTS_NO_AUTO_ON_DOT"     : "Disable Auto JS Hints on Dot",
        "OPT_HIGHLIGHT_MATCHING_STRINGS"  : "Highlight Identical Strings",
        "OPT_HIGHLIGHT_MATCHING_STRINGS_DESC": "Automatically highlights all occurrences of the currently selected string. No highlighting if nothing is selected.",
        "STATUS_ENABLED"                  : "Active", // Renamed from LBL_ENABLED

        // --- Code Formatting & Inspection ---
        "HEADING_CODE_ANALYSIS"           : "Code Inspection",
        "OPT_TABS_OVER_SPACES"            : "Tabs Instead of Spaces",
        "OPT_TAB_VISUAL_SIZE"             : "Tab Display Size",
        "OPT_SPACE_INDENT_UNITS"          : "Space Indent Units",
        "OPT_TEXT_WORD_WRAP"              : "Word Wrapping",
        "OPT_AUTO_INDENT_SMART"           : "Smart Auto-Indentation",
        "OPT_INSERT_HINT_ON_TAB"          : "Insert Hint with Tab Key",
        "OPT_SORT_DIRECTORIES_FIRST"      : "Sort Directories First",
        "OPT_LIVE_PREVIEW_PORT"           : "Static Server Port",
        "OPT_ALLOW_SCROLL_PAST_END"       : "Scroll Beyond Document End",
        "OPT_USE_SOFT_TABS"               : "Employ Soft Tabs",

        // --- Network Proxy Configuration ---
        "HEADING_PROXY_CONFIG"            : "Proxy Server Settings",
        "OPT_PROXY_PROTOCOL_LABEL"        : "Protocol Type: ",
        "OPT_PROXY_PROTOCOL_NONE"         : "None",
        "OPT_PROXY_PROTOCOL_HTTP"         : "HTTP",
        "OPT_PROXY_PROTOCOL_HTTPS"        : "HTTPS (Secure)",
        "OPT_PROXY_USERNAME_LABEL"        : "User Name: ",
        "OPT_PROXY_PASSWORD_LABEL"        : "Passcode: ",
        "OPT_PROXY_SERVER_ADDRESS_LABEL"  : "Server Host: ",
        "OPT_PROXY_SERVER_PORT_LABEL"     : "Port Number: ",

        // --- Detailed Descriptions for Settings ---
        "DESC_CODE_ANALYSIS_ENABLED"      : "Controls whether code inspection features are active (default: true).",
        "DESC_TABS_OVER_SPACES"           : "Set to true to use tab characters for indentation instead of spaces (default: 4 spaces).",
        "DESC_TAB_VISUAL_SIZE"            : "Number of spaces that a tab character should visually represent (default: 4).",
        "DESC_SPACE_INDENT_UNITS"         : "The count of spaces utilized for space-based indentation (default: 4).",
        "DESC_TEXT_WORD_WRAP"             : "Indicates if text wrapping is enabled in the editor (default: true).",
        "DESC_AUTO_INDENT_SMART"          : "Automatically applies indentation when a new code block is created (default: true).",
        "DESC_INSERT_HINT_ON_TAB"         : "If true, pressing Tab will insert the currently selected code hint (default: false).",
        "DESC_SORT_DIRECTORIES_FIRST"     : "If true, directories will appear before files in the project tree (default: false for macOS, true otherwise).",
        "DESC_LIVE_PREVIEW_PORT"          : "The specific port number the integrated server should use for Live Preview functionality.",
        "DESC_ALLOW_SCROLL_PAST_END"      : "Enables scrolling beyond the actual end of the document content (default: false).",
        "DESC_USE_SOFT_TABS"              : "Set to false to disable the soft tabs behavior (default: true).",

        // --- Additional Placeholder/Meta Information ---
        "DEV_PLACEHOLDER_SETTING"         : "Future Feature Placeholder", // Added a new setting
        "DEV_PLACEHOLDER_DESC"            : "This is a setting reserved for upcoming functionality.",
        "FOOTER_COPYRIGHT_INFO"           : "© 2024 Application Development Team. All rights reserved." // Added new info
    };

    // Return the complete object map.
    return localizedContentMap;
});