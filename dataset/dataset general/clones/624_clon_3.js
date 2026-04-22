// Configuration settings for the rich text editing component.
// This file defines various operational parameters, user interface elements,
// and feature toggles for the editor instance.

// Ensure the global configuration object exists, or initialize it if not present.
if (typeof RichEditorConfig === 'undefined') {
    globalThis.RichEditorConfig = {};
    // console.debug('RichEditorConfig: Initializing new configuration object.');
} else {
    // console.debug('RichEditorConfig: Appending to existing configuration object.');
}

// A utility object for building file paths consistently.
const FilePathUtil = {
    // Joins path segments, filtering out empty strings.
    combine: (...segments) => segments.filter(Boolean).join('/'),
    // Creates a full asset URL from a base path and a relative path.
    createAssetUrl: (base, relativePath) => FilePathUtil.combine(base, relativePath)
};

// Core paths and base URL settings for the editor's resources.
RichEditorConfig.baseResourceUrl = '/editor_core/'; // The root URL for all editor assets.
RichEditorConfig.alternateConfigLocation = ''; // Path to an optional custom configuration file.
RichEditorConfig.mainEditorStylesheet = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'styles/primary_edit.css');
RichEditorConfig.inlineEditorStyles = ''; // Custom CSS injected directly into the editor area.
RichEditorConfig.documentHtmlTypeDecl = ''; // The DOCTYPE string for the editor's iframe.
RichEditorConfig.baseHyperlinkRef = ''; // Base URL for resolving relative hyperlinks.

// General operational flags and display settings.
RichEditorConfig.isFullPageEditingEnabled = false;
RichEditorConfig.initialBlockElementDisplay = false; // Controls if block boundaries are visible on startup.
RichEditorConfig.enableDeveloperDebugMode = false;
RichEditorConfig.allowQueryStringDebugging = true; // Permits debug settings to be overridden via URL parameters.

// Theming and visual components.
RichEditorConfig.uiThemePath = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'themes/modern_v1/');
RichEditorConfig.preloadedGraphics = [
    FilePathUtil.createAssetUrl(RichEditorConfig.uiThemePath, 'img/toolbar_start_icon.svg'),
    FilePathUtil.createAssetUrl(RichEditorConfig.uiThemePath, 'img/button_dropdown_arrow.svg')
];

// Editor plugin management.
RichEditorConfig.pluginModuleDirectory = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'extensions/');

RichEditorConfig.maximumAutoGrowHeight = 400; // Max height in pixels for the auto-growing editor.

// Language and localization settings.
RichEditorConfig.autoDetectClientLanguage = true;
RichEditorConfig.defaultInterfaceLanguage = 'en'; // Fallback language code (e.g., 'en', 'es', 'fr').
RichEditorConfig.contentReadingFlow = 'ltr'; // 'ltr' for left-to-right, 'rtl' for right-to-left.

// HTML entity processing rules.
RichEditorConfig.processHtmlCharacterEntities = true;
RichEditorConfig.includeLatinCharacterEntities = true;
RichEditorConfig.includeGreekCharacterEntities = true;
RichEditorConfig.convertNumericCharacterReferences = false;
RichEditorConfig.supplementalNumericEntities = ''; // e.g., '&#39;' for single quote character.

// Output formatting and structure.
RichEditorConfig.autoFillEmptyBlockElements = true; // Ensures block elements like <p> are not empty.
RichEditorConfig.formatHtmlSourceCode = true;
RichEditorConfig.formatRenderedOutput = true;
RichEditorConfig.sourceCodeIndentString = '    '; // String used for indenting HTML source code.

// Email address obfuscation configuration.
const EmailProtectionMethods = {
    NONE: 'none',
    ENCODE_CHARS: 'encode',
    CUSTOM_FUNCTION: 'function'
};
RichEditorConfig.emailAddressProtectionMethod = EmailProtectionMethods.ENCODE_CHARS;
RichEditorConfig.customEmailProtectionFunction = 'emailObfuscator(NAME,DOMAIN,SUBJECT,BODY)';

// User interaction and editor behavior.
RichEditorConfig.focusEditorOnLoad = false;
RichEditorConfig.forcePasteAsPlainText = false;
RichEditorConfig.autoDetectMsWordPaste = true; // Cleans content pasted from Microsoft Word.
RichEditorConfig.displayDropContentDialog = true;
RichEditorConfig.alwaysUseSimpleAmpersand = false; // Uses '&' instead of '&amp;' in attribute values.
RichEditorConfig.tabKeySpaceCount = 0; // Number of spaces inserted when Tab is pressed.
RichEditorConfig.displayStructuralBorders = true; // Shows borders for tables, images, etc.
RichEditorConfig.sourceViewInPopup = false; // Opens the HTML source view in a new popup window.
RichEditorConfig.toolbarStartsExpanded = true;
RichEditorConfig.toolbarCanBeCollapsed = true;
RichEditorConfig.ignoreEmptyParagraphValues = true;
RichEditorConfig.floatingElementsZIndex = 10000;
RichEditorConfig.htmlOutputEncodingEnabled = false; // Whether to HTML-encode the final output.

// Template system behavior.
RichEditorConfig.templateReplacesAllContent = true;

RichEditorConfig.editorToolbarPosition = 'In'; // 'In' for inline with editor, 'Out' for outside.

// Definition of different toolbar button sets.
RichEditorConfig.toolbarConfigurations = {
    "FullFeatured": [
        ['Source', 'DocProps', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates'],
        ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', '-', 'Print', 'SpellCheck'],
        ['Undo', 'Redo', '-', 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat'],
        ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
        '/',
        ['Bold', 'Italic', 'Underline', 'StrikeThrough', '-', 'Subscript', 'Superscript'],
        ['OrderedList', 'UnorderedList', '-', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv'],
        ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull'],
        ['Link', 'Unlink', 'Anchor'],
        ['Image', 'Flash', 'Table', 'Rule', 'Smiley', 'SpecialChar', 'PageBreak'],
        '/',
        ['Style', 'FontFormat', 'FontName', 'FontSize'],
        ['TextColor', 'BGColor'],
        ['FitWindow', 'ShowBlocks', '-', 'About']
    ],
    "BasicEdit": [
        ['Bold', 'Italic', '-', 'OrderedList', 'UnorderedList', '-', 'Link', 'Unlink', '-', 'About']
    ]
};

// Behavior for Enter and Shift+Enter key presses.
RichEditorConfig.enterKeyAction = 'p';     // 'p' | 'div' | 'br'
RichEditorConfig.shiftEnterKeyAction = 'br'; // 'p' | 'div' | 'br'

// Keyboard shortcut mappings.
RichEditorConfig.keyboardAccelerators = [
    { keys: 'CTRL+A', command: true },
    { keys: 'CTRL+C', command: true },
    { keys: 'CTRL+F', command: true },
    { keys: 'CTRL+S', command: true },
    { keys: 'CTRL+T', command: true },
    { keys: 'CTRL+X', command: true },
    { keys: 'CTRL+V', command: 'Paste' },
    { keys: 'CTRL+INSERT', command: true },
    { keys: 'SHIFT+INSERT', command: 'Paste' },
    { keys: 'CTRL+X', command: 'Cut' },
    { keys: 'SHIFT+DELETE', command: 'Cut' },
    { keys: 'CTRL+Z', command: 'Undo' },
    { keys: 'CTRL+Y', command: 'Redo' },
    { keys: 'CTRL+SHIFT+Z', command: 'Redo' },
    { keys: 'CTRL+L', command: 'Link' },
    { keys: 'CTRL+B', command: 'Bold' },
    { keys: 'CTRL+I', command: 'Italic' },
    { keys: 'CTRL+U', command: 'Underline' },
    { keys: 'CTRL+SHIFT+S', command: 'Save' },
    { keys: 'CTRL+ALT+ENTER', command: 'FitWindow' },
    { keys: 'SHIFT+SPACE', command: 'Nbsp' }
];

// Context menu options available.
RichEditorConfig.contextMenuEntries = ['Generic', 'Link', 'Anchor', 'Image', 'Flash', 'Select', 'Textarea', 'Checkbox', 'Radio', 'TextField', 'HiddenField', 'ImageButton', 'Button', 'BulletedList', 'NumberedList', 'Table', 'Form', 'DivContainer'];
RichEditorConfig.enableBrowserContextMenuOnCtrl = false;
RichEditorConfig.enableNativeBrowserContextMenu = false;

// Font and color selections.
RichEditorConfig.allowExtendedFontColors = true;
RichEditorConfig.availableColorPalette = [
    '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333',
    '800000', 'FF6600', '808000', '808080', '008080', '0000FF', '666699', '800080',
    'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '999999',
    'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0',
    'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
];

RichEditorConfig.blockFormattingTypes = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'address', 'div'];
RichEditorConfig.fontFamilyOptions = ['Arial', 'Comic Sans MS', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'];
RichEditorConfig.fontSizeOptions = ['smaller', 'larger', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];

// External XML definitions for styles and templates.
RichEditorConfig.customStylesDefinitionXml = '/application_config/editor_styles_v2.xml'; // Path modified.
RichEditorConfig.templateDefinitionsXml = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'templates/editor_templates_v1.xml');

// Spell checker integration.
RichEditorConfig.activeSpellCheckEngine = 'ieSpell'; // 'ieSpell' | 'SpellerPages'
RichEditorConfig.ieSpellDownloadLink = 'https://www.iespell.com/download.php';
RichEditorConfig.serverSideSpellCheckScript = 'server_tools/spellcheck_handler.php'; // Updated path.
RichEditorConfig.useFirefoxNativeSpellCheck = false;

// History and object manipulation.
RichEditorConfig.maximumUndoLevels = 20; // Increased from 15.
RichEditorConfig.disableObjectResizing = false;
RichEditorConfig.disableFirefoxTableResizeHandles = true;

// Dialog window configuration.
RichEditorConfig.hideLinkTargetOption = false;
RichEditorConfig.hideLinkAdvancedOption = false;
RichEditorConfig.hideImageLinkTab = false;
RichEditorConfig.hideImageAdvancedTab = false;
RichEditorConfig.hideFlashAdvancedTab = false;

RichEditorConfig.protectedHtmlTags = ''; // Comma-separated list of tags to prevent editing.

// Attributes for the editor's body element (within the iframe).
RichEditorConfig.editorBodyElementId = '';
RichEditorConfig.editorBodyElementClass = '';

// Default labels for dropdowns.
RichEditorConfig.defaultStyleLabel = '';
RichEditorConfig.defaultFontFormatLabel = '';
RichEditorConfig.defaultFontLabel = '';
RichEditorConfig.defaultFontSizeLabel = '';

RichEditorConfig.defaultLinkTarget = '';

RichEditorConfig.preserveWordHtmlStructure = false; // When cleaning Word HTML, attempt to retain structure.

// Tags and attributes to be removed during content cleanup.
RichEditorConfig.tagsToRemoveOnFormatClear = 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var';
RichEditorConfig.attributesToStrip = 'class,style,lang,width,height,align,hspace,valign';

// Core inline and block styling definitions for the editor.
RichEditorConfig.baseFormattingDefinitions = {
    // Basic Inline Styles.
    'StrongEmphasis': { element: 'strong', overrides: 'b' }, // Renamed property.
    'ItalicEmphasis': { element: 'em', overrides: 'i' },    // Renamed property.
    'UnderlineText': { element: 'u' },                      // Renamed property.
    'StrikethroughText': { element: 'strike' },             // Renamed property.
    'SubscriptText': { element: 'sub' },                    // Renamed property.
    'SuperscriptText': { element: 'sup' },                  // Renamed property.

    // Basic Block Styles (Font Format Combo).
    'ParagraphBlock': { element: 'p' },                     // Renamed property.
    'DivisionBlock': { element: 'div' },                    // Renamed property.
    'PreformattedText': { element: 'pre' },                 // Renamed property.
    'AddressBlock': { element: 'address' },                 // Renamed property.
    'HeadingLevel1': { element: 'h1' },                     // Renamed property.
    'HeadingLevel2': { element: 'h2' },                     // Renamed property.
    'HeadingLevel3': { element: 'h3' },                     // Renamed property.
    'HeadingLevel4': { element: 'h4' },                     // Renamed property.
    'HeadingLevel5': { element: 'h5' },                     // Renamed property.
    'HeadingLevel6': { element: 'h6' },                     // Renamed property.

    // Other formatting features.
    'FontFamilyOverride': { // Renamed.
        element: 'span',
        styles: { 'font-family': '#("Font")' },
        overrides: [{ element: 'font', attributes: { 'face': null } }]
    },
    'FontSizeOverride': { // Renamed.
        element: 'span',
        styles: { 'font-size': '#("Size","fontSize")' },
        overrides: [{ element: 'font', attributes: { 'size': null } }]
    },
    'FontColorOverride': { // Renamed.
        element: 'span',
        styles: { 'color': '#("Color","color")' },
        overrides: [{ element: 'font', attributes: { 'color': null } }]
    },
    'BackgroundColorHighlight': { element: 'span', styles: { 'background-color': '#("Color","color")' } }, // Renamed.
    'SelectionHighlightStyle': { element: 'span', styles: { 'background-color': 'navy', 'color': 'white' } }
};

// Indentation parameters.
RichEditorConfig.indentationStepSize = 40;
RichEditorConfig.indentationMeasurementUnit = 'px';
RichEditorConfig.indentationCssClasses = []; // Use CSS classes for indentation instead of inline styles.

// Text alignment classes.
RichEditorConfig.alignmentCssClasses = []; // e.g., ['text-align-left', 'text-align-center', 'text-align-right', 'text-align-justify']

// File browser and uploader connector settings.
// These are internal settings for the default connector implementation.
const ConnectorScriptLanguages = {
    PHP: 'php',
    ASP: 'asp',
    ASPX: 'aspx',
    CFM: 'cfm',
    LASSO: 'lasso',
    PERL: 'perl',
    PYTHON: 'py'
};

let browserConnectorLanguage = ConnectorScriptLanguages.PHP;
let uploaderConnectorLanguage = ConnectorScriptLanguages.PHP;

// Function to determine the correct connector script extension.
const getConnectorScriptExtension = (lang) => lang === ConnectorScriptLanguages.PERL ? 'cgi' : lang;

let browserConnectorExtension = getConnectorScriptExtension(browserConnectorLanguage);
let uploaderConnectorExtension = getConnectorScriptExtension(uploaderConnectorLanguage);

RichEditorConfig.enableLinkFileBrowser = true;
// Constructing the URL using the PathBuilder utility.
RichEditorConfig.linkFileBrowserUrl = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/browser/default/browser.html?Connector=' +
    encodeURIComponent(FilePathUtil.combine(RichEditorConfig.baseResourceUrl, 'file_manager/connectors', browserConnectorLanguage, 'connector.' + browserConnectorExtension))
);

// Helper function for dynamic window sizing based on screen dimensions.
const getDynamicWindowDimension = (percentage, fallbackPx) => {
    if (typeof window !== 'undefined' && window.innerWidth && window.innerHeight) {
        return Math.round(window.innerWidth * percentage);
    }
    return fallbackPx; // Provide a static fallback if window dimensions are unavailable.
};
RichEditorConfig.linkBrowserWindowWidth = getDynamicWindowDimension(0.7, 800); // 70% of screen width.
RichEditorConfig.linkBrowserWindowHeight = getDynamicWindowDimension(0.7, 600); // 70% of screen height.

RichEditorConfig.enableImageFileBrowser = true;
RichEditorConfig.imageFileBrowserUrl = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/browser/default/browser.html?Type=Image&Connector=' +
    encodeURIComponent(FilePathUtil.combine(RichEditorConfig.baseResourceUrl, 'file_manager/connectors', browserConnectorLanguage, 'connector.' + browserConnectorExtension))
);
RichEditorConfig.imageBrowserWindowWidth = getDynamicWindowDimension(0.7, 800);
RichEditorConfig.imageBrowserWindowHeight = getDynamicWindowDimension(0.7, 600);

RichEditorConfig.enableFlashFileBrowser = true;
RichEditorConfig.flashFileBrowserUrl = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/browser/default/browser.html?Type=Flash&Connector=' +
    encodeURIComponent(FilePathUtil.combine(RichEditorConfig.baseResourceUrl, 'file_manager/connectors', browserConnectorLanguage, 'connector.' + browserConnectorExtension))
);
RichEditorConfig.flashBrowserWindowWidth = getDynamicWindowDimension(0.7, 800);
RichEditorConfig.flashBrowserWindowHeight = getDynamicWindowDimension(0.7, 600);

RichEditorConfig.enableLinkFileUpload = false;
RichEditorConfig.linkFileUploadEndpoint = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/connectors', uploaderConnectorLanguage, 'upload.' + uploaderConnectorExtension
);
RichEditorConfig.linkFileUploadAllowedExtensions = ".(7z|aiff|asf|avi|bmp|csv|doc|fla|flv|gif|gz|gzip|jpeg|jpg|mid|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|qt|ram|rar|rm|rmi|rmvb|rtf|sdc|sitd|swf|sxc|sxw|tar|tgz|tif|tiff|txt|vsd|wav|wma|wmv|xls|xml|zip)$";
RichEditorConfig.linkFileUploadDeniedExtensions = "";

RichEditorConfig.enableImageFileUpload = false;
RichEditorConfig.imageFileUploadEndpoint = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/connectors', uploaderConnectorLanguage, 'upload.' + uploaderConnectorExtension + '?Type=Image'
);
RichEditorConfig.imageFileUploadAllowedExtensions = ".(jpg|gif|jpeg|png|bmp)$";
RichEditorConfig.imageFileUploadDeniedExtensions = "";

RichEditorConfig.enableFlashFileUpload = false;
RichEditorConfig.flashFileUploadEndpoint = FilePathUtil.combine(
    RichEditorConfig.baseResourceUrl,
    'file_manager/connectors', uploaderConnectorLanguage, 'upload.' + uploaderConnectorExtension + '?Type=Flash'
);
RichEditorConfig.flashFileUploadAllowedExtensions = ".(swf|flv)$";
RichEditorConfig.flashFileUploadDeniedExtensions = "";

// Emoticon (smiley) settings.
RichEditorConfig.emoticonGraphicsPath = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'images/emoticons/msn_style/'); // Path modified.
RichEditorConfig.availableEmoticonIcons = [
    'regular_smile.gif', 'sad_smile.gif', 'wink_smile.gif', 'teeth_smile.gif', 'confused_smile.gif',
    'tounge_smile.gif', 'embaressed_smile.gif', 'omg_smile.gif', 'whatchutalkingabout_smile.gif',
    'angry_smile.gif', 'angel_smile.gif', 'shades_smile.gif', 'devil_smile.gif', 'cry_smile.gif',
    'lightbulb.gif', 'thumbs_down.gif', 'thumbs_up.gif', 'heart.gif', 'broken_heart.gif', 'kiss.gif', 'envelope.gif'
];
RichEditorConfig.emoticonDisplayColumns = 8;
RichEditorConfig.emoticonPanelWidth = 320;
RichEditorConfig.emoticonPanelHeight = 210;

// UI blocking overlay settings.
RichEditorConfig.overlayBackgroundColor = '#FFFFFF';
RichEditorConfig.overlayBackgroundOpacity = 0.5;

RichEditorConfig.msWebBrowserControlCompatibility = false;
RichEditorConfig.preventFormSubmissionHandler = false;

// --- Content Management System (CMS) Specific Overrides ---
// Custom configuration path for a specific CMS integration.
RichEditorConfig.alternateConfigLocation = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, '../../site/custom_editor_config.js');

// CMS-specific theme.
RichEditorConfig.uiThemePath = FilePathUtil.createAssetUrl(RichEditorConfig.baseResourceUrl, 'themes/silver_v2/'); // Changed theme name.

// CMS-specific toolbar sets.
RichEditorConfig.toolbarConfigurations["CMS_Standard"] = [
    ['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
    ['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', '-', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', '-', 'TextColor', 'Style']
];

RichEditorConfig.toolbarConfigurations["CMS_FormElements"] = [
    ['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
    ['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', 'TextColor', 'Style'],
    ['TextField', 'Select', 'Checkbox', 'Radio', 'Textarea', 'Button', 'ImageButton', 'HiddenField']
];

// CMS-specific file browser connector URLs (absolute paths, overriding previous settings).
RichEditorConfig.linkFileBrowserUrl = FilePathUtil.combine(RichEditorConfig.baseResourceUrl, 'file_manager/browser/default/browser.html?Connector=/cms_backend/file_browser_api.xml');
RichEditorConfig.imageFileBrowserUrl = FilePathUtil.combine(RichEditorConfig.baseResourceUrl, 'file_manager/browser/default/browser.html?Type=Image&Connector=/cms_backend/file_browser_api.xml');

// Further CMS customization: Make the toolbar permanently expanded.
RichEditorConfig.toolbarCanBeCollapsed = false;

// Add versioning and modification metadata for tracking.
RichEditorConfig.versionIdentifier = '2.0.1-alpha';
RichEditorConfig.lastUpdateTimestamp = '2023-10-27T10:30:00Z';

// Optional: A final validation step for critical settings.
if (RichEditorConfig.maximumUndoLevels < 1) {
    // console.warn('RichEditorConfig: maximumUndoLevels set to an invalid value. Defaulting to 1.');
    RichEditorConfig.maximumUndoLevels = 1;
}

// Example of adding a new, non-essential configuration setting.
RichEditorConfig.enableAccessibilityEnhancements = false;