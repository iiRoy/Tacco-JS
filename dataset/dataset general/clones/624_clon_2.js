/*
 *  RichTextEditor - A content creation tool for web applications.
 *  Proprietary information (C) 2003-2008 Knabben Software Solutions.
 *
 *  === START OF LICENSING TERMS ===
 *
 *  This software is made available under the terms of your
 *  chosen license agreement:
 *
 *   - GNU General Public License Version 2 or later (the "GPL")
 *     See: http://www.gnu.org/licenses/gpl.html
 *
 *   - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 *     See: http://www.gnu.org/licenses/lgpl.html
 *
 *   - Mozilla Public License Version 1.1 or later (the "MPL")
 *     See: http://www.mozilla.org/MPL/MPL-1.1.html
 *
 *  === END OF LICENSING TERMS ===
 *
 *  Main settings for the editor instance.
 *
 *  For further details, consult the documentation:
 *  http://docs.fckeditor.net/FCKeditor_2.x/Developers_Guide/Configuration/Configuration_Options
 */

EditorSettings.UserSpecificSettingsPath = '';

EditorSettings.ContentAreaStyles = EditorSettings.ApplicationPath + 'css/editor_content_area.css';
EditorSettings.ContentAreaCustomStyles = '';
EditorSettings.ToolpaneDropdownPreviewStyles = '';

EditorSettings.DocumentMarkupType = '';

EditorSettings.RootReferenceURL = '';

EditorSettings.IsFullPageMode = false;

// This setting determines if the "Show Blocks" visual aid is active at start-up.
EditorSettings.InitialBlockDisplay = false;

EditorSettings.DiagnosticMode = false;
EditorSettings.PermitURLParamDiagnostics = true;

EditorSettings.ThemeLocation = EditorSettings.ApplicationPath + 'themes/standard/';
EditorSettings.ThemeEditorStyles = ''; // EditorSettings.ThemeLocation + "|<minified css>" ;
EditorSettings.ThemeDialogStyles = ''; // EditorSettings.ThemeLocation + "|<minified css>" ;

EditorSettings.PreloadedGraphics = [
  EditorSettings.ThemeLocation + 'images/toolbar_start.gif',
  EditorSettings.ThemeLocation + 'images/toolbar_button_arrow.gif'
];

EditorSettings.ExtensionsDirectory = EditorSettings.ApplicationPath + 'modules/';

// EditorSettings.Extensions.AddExtension( 'autogrow' ) ;
// EditorSettings.Extensions.AddExtension( 'dragresizetable' );
EditorSettings.MaximumAutoExpandHeight = 400;

// EditorSettings.SecuredContentPatterns.IncludePattern( /<%[\s\S]*?%>/g ) ;  // ASP-like server code <%...%>
// EditorSettings.SecuredContentPatterns.IncludePattern( /<\?[\s\S]*?\?>/g ) ;  // PHP-like server code
// EditorSettings.SecuredContentPatterns.IncludePattern( /(<asp:[^\>]+>[\s|\S]*?<\/asp:[^\>]+>)|(<asp:[^\>]+\/>)/gi ) ;  // ASP.Net-like tags <asp:control>

EditorSettings.AutomaticLanguageDetection = true;
EditorSettings.StandardLanguage = 'en';
EditorSettings.TextDirection = 'ltr';

EditorSettings.ParseHTMLEntityCodes = true;
EditorSettings.EmbedLatinCharacters = true;
EditorSettings.EmbedGreekCharacters = true;

EditorSettings.ParseNumericEntityCodes = false;

EditorSettings.ExtraNumericEntities = ''; // Single Quote: "'"

EditorSettings.PopulateEmptyBlocks = true;

EditorSettings.BeautifySource = true;
EditorSettings.BeautifyOutput = true;
EditorSettings.IndentationString = '    ';

EditorSettings.EmailObfuscation = 'encode'; // none | encode | function
EditorSettings.EmailObfuscationMethod = 'processMailto(NAME,DOMAIN,SUBJECT,BODY)';

EditorSettings.FocusOnLaunch = false;
EditorSettings.RequirePlainTextPaste = false;
EditorSettings.AutoDetectWordPaste = true; // For IE browsers exclusively.
EditorSettings.DisplayDropMenu = true;
EditorSettings.EnforceSimpleAmpersand = false;
EditorSettings.TabIndentationSpaces = 0;
EditorSettings.DisplayBorders = true;
EditorSettings.SourceCodeInPopup = false;
EditorSettings.ToolpaneInitiallyExpanded = true;
EditorSettings.ToolpaneCollapsible = true;
EditorSettings.DisregardEmptyParagraphContent = true;
EditorSettings.FloatingElementsLayerIndex = 10000;
EditorSettings.EncodeHTMLOutput = false;

EditorSettings.TemplateSubstituteAll = true;
EditorSettings.TemplateSubstituteCheckbox = true;

EditorSettings.ToolpanePlacement = 'In';

EditorSettings.ToolpaneCollections["Standard"] = [
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
  ['FitWindow', 'ShowBlocks', '-', 'About'] // No trailing comma for the final item.
];

EditorSettings.ToolpaneCollections["Minimal"] = [
  ['Bold', 'Italic', '-', 'OrderedList', 'UnorderedList', '-', 'Link', 'Unlink', '-', 'About']
];

EditorSettings.NewLineMode = 'p'; // p | div | br
EditorSettings.ShiftNewLineMode = 'br'; // p | div | br

EditorSettings.KeyboardShortcuts = [
  [CONTROL_KEY + 65 /*A*/, true],
  [CONTROL_KEY + 67 /*C*/, true],
  [CONTROL_KEY + 70 /*F*/, true],
  [CONTROL_KEY + 83 /*S*/, true],
  [CONTROL_KEY + 84 /*T*/, true],
  [CONTROL_KEY + 88 /*X*/, true],
  [CONTROL_KEY + 86 /*V*/, 'Paste'],
  [CONTROL_KEY + 45 /*INS*/, true],
  [SHIFT_KEY + 45 /*INS*/, 'Paste'],
  [CONTROL_KEY + 88 /*X*/, 'Cut'],
  [SHIFT_KEY + 46 /*DEL*/, 'Cut'],
  [CONTROL_KEY + 90 /*Z*/, 'Undo'],
  [CONTROL_KEY + 89 /*Y*/, 'Redo'],
  [CONTROL_KEY + SHIFT_KEY + 90 /*Z*/, 'Redo'],
  [CONTROL_KEY + 76 /*L*/, 'Link'],
  [CONTROL_KEY + 66 /*B*/, 'Bold'],
  [CONTROL_KEY + 73 /*I*/, 'Italic'],
  [CONTROL_KEY + 85 /*U*/, 'Underline'],
  [CONTROL_KEY + SHIFT_KEY + 83 /*S*/, 'Save'],
  [CONTROL_KEY + ALT_KEY + 13 /*ENTER*/, 'FitWindow'],
  [SHIFT_KEY + 32 /*SPACE*/, 'Nbsp']
];

EditorSettings.RightClickMenuOptions = ['Generic', 'Link', 'Anchor', 'Image', 'Flash', 'Select', 'Textarea', 'Checkbox', 'Radio', 'TextField', 'HiddenField', 'ImageButton', 'Button', 'BulletedList', 'NumberedList', 'Table', 'Form', 'DivContainer'];
EditorSettings.BrowserRightClickOnControl = false;
EditorSettings.BrowserRightClickEnabled = false;

EditorSettings.AllowExtendedFontColors = true;
EditorSettings.AvailableFontColors = '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,808080,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF';

EditorSettings.TextFormats = 'p;h1;h2;h3;h4;h5;h6;pre;address;div';
EditorSettings.FontFamilyNames = 'Arial;Comic Sans MS;Courier New;Tahoma;Times New Roman;Verdana';
EditorSettings.TextSizes = 'smaller;larger;xx-small;x-small;small;medium;large;x-large;xx-large';

EditorSettings.StyleDefinitionsXMLPath = '/bcms_config/editor_styles.xml';
EditorSettings.TemplateDefinitionsXMLPath = EditorSettings.ApplicationPath + 'editor_templates.xml';

EditorSettings.SpellingCheckEngine = 'ieSpell'; // 'ieSpell' | 'SpellerPages'
EditorSettings.IeSpellDownloadLink = 'http://www.iespell.com/download.php';
EditorSettings.SpellingServiceScript = 'server-scripts/spellcheck_processor.php'; // Supported extensions: .php .cfm .pl
EditorSettings.FirefoxSpellCheckEnabled = false;

EditorSettings.MaximumUndoActions = 15;

EditorSettings.PreventObjectResizing = false;
EditorSettings.PreventFirefoxTableHandles = true;

EditorSettings.LinkDialogConcealTarget = false;
EditorSettings.LinkDialogConcealAdvanced = false;

EditorSettings.ImageDialogConcealLink = false;
EditorSettings.ImageDialogConcealAdvanced = false;

EditorSettings.FlashDialogConcealAdvanced = false;

EditorSettings.ProtectedHTMLTags = '';

// This value will be assigned to the 'id' attribute of the editor's body element.
EditorSettings.ContentBodyIdentifier = '';
EditorSettings.ContentBodyClass = '';

EditorSettings.StandardStyleLabel = '';
EditorSettings.StandardFontFormatLabel = '';
EditorSettings.StandardFontLabel = '';
EditorSettings.StandardFontSizeLabel = '';

EditorSettings.StandardLinkTarget = '';

// This setting determines whether to maintain the original HTML structure or
// to adjust it to resemble content pasted from Microsoft Word.
EditorSettings.WordCleanPreservesStructure = false;

// Only inline-level elements are considered valid for removal.
EditorSettings.TagsToRemoveOnFormatClear = 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var';

// Attributes that will be stripped from elements.
EditorSettings.AttributesToRemove = 'class,style,lang,width,height,align,hspace,valign';

// Do not alter, rename, or remove any styles here. Only modify their definitions.
EditorSettings.FundamentalStyles =
{
  // Core Inline Formatting.
  'StrongText': { HtmlElement: 'strong', OverrideElements: 'b' },
  'EmphasizedText': { HtmlElement: 'em', OverrideElements: 'i' },
  'UnderlinedText': { HtmlElement: 'u' },
  'StrikethroughText': { HtmlElement: 'strike' },
  'SubscriptText': { HtmlElement: 'sub' },
  'SuperscriptText': { HtmlElement: 'sup' },

  // Core Block-level Formatting (from Font Format dropdown).
  'Paragraph': { HtmlElement: 'p' },
  'Division': { HtmlElement: 'div' },
  'Preformatted': { HtmlElement: 'pre' },
  'AddressBlock': { HtmlElement: 'address' },
  'Heading1': { HtmlElement: 'h1' },
  'Heading2': { HtmlElement: 'h2' },
  'Heading3': { HtmlElement: 'h3' },
  'Heading4': { HtmlElement: 'h4' },
  'Heading5': { HtmlElement: 'h5' },
  'Heading6': { HtmlElement: 'h6' },

  // Additional formatting features.
  'FontType':
  {
    HtmlElement: 'span',
    CSSProperties: { 'font-family': '#("Font")' },
    OverrideElements: [{ HtmlElement: 'font', HtmlAttributes: { 'face': null } }]
  },

  'FontDimension':
  {
    HtmlElement: 'span',
    CSSProperties: { 'font-size': '#("Size","fontSize")' },
    OverrideElements: [{ HtmlElement: 'font', HtmlAttributes: { 'size': null } }]
  },

  'FontColor':
  {
    HtmlElement: 'span',
    CSSProperties: { 'color': '#("Color","color")' },
    OverrideElements: [{ HtmlElement: 'font', HtmlAttributes: { 'color': null } }]
  },

  'BackgroundColor': { HtmlElement: 'span', CSSProperties: { 'background-color': '#("Color","color")' } },

  'HighlightSelection': { HtmlElement: 'span', CSSProperties: { 'background-color': 'navy', 'color': 'white' } }
};

// The pixel distance for each indentation step.
EditorSettings.IndentationSize = 40;
EditorSettings.IndentationMeasurement = 'px';

// As an alternative, the editor can use CSS classes for block indentation.
// This will override the IndentationSize/IndentationMeasurement settings.
EditorSettings.IndentationCSSClasses = [];

// [ Left, Center, Right, Justified ] alignment classes.
EditorSettings.AlignmentCSSClasses = [];

// The following setting dictates which File Browser connector and Quick Upload
// "uploader" implementation to utilize. This is specific to the default implementation
// and is included here solely for configuration clarity.
// It is not possible to modify this value via an external file or inline when
// initializing the editor. In such scenarios, you must directly set the values
// for LinkFileBrowserURL, ImageFileBrowserURL, etc.
// Custom implementations should simply disregard this variable.
var _FileManagerScriptLanguage = 'php'; // asp | aspx | cfm | lasso | perl | php | py
var _FastUploadScriptLanguage = 'php'; // asp | aspx | cfm | lasso | perl | php | py

// Ignore the subsequent two lines. They merely compute the correct connector
// extension for the default File Browser (Perl uses "cgi" instead).
var _FileManagerScriptExtension = _FileManagerScriptLanguage == 'perl' ? 'cgi' : _FileManagerScriptLanguage;
var _FastUploadScriptExtension = _FastUploadScriptLanguage == 'perl' ? 'cgi' : _FastUploadScriptLanguage;

EditorSettings.LinkFileBrowserEnabled = true;
EditorSettings.LinkFileBrowserURL = EditorSettings.ApplicationPath + 'file_manager/browser/default/browser_view.html?Connector=' + encodeURIComponent(EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FileManagerScriptLanguage + '/connector.' + _FileManagerScriptExtension);
EditorSettings.LinkFileBrowserWidth = EditorSettings.DisplayWidth * 0.7; // 70 percent
EditorSettings.LinkFileBrowserHeight = EditorSettings.DisplayHeight * 0.7; // 70 percent

EditorSettings.ImageFileBrowserEnabled = true;
EditorSettings.ImageFileBrowserURL = EditorSettings.ApplicationPath + 'file_manager/browser/default/browser_view.html?Type=Image&Connector=' + encodeURIComponent(EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FileManagerScriptLanguage + '/connector.' + _FileManagerScriptExtension);
EditorSettings.ImageFileBrowserWidth = EditorSettings.DisplayWidth * 0.7; // 70 percent
EditorSettings.ImageFileBrowserHeight = EditorSettings.DisplayHeight * 0.7; // 70 percent

EditorSettings.FlashFileBrowserEnabled = true;
EditorSettings.FlashFileBrowserURL = EditorSettings.ApplicationPath + 'file_manager/browser/default/browser_view.html?Type=Flash&Connector=' + encodeURIComponent(EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FileManagerScriptLanguage + '/connector.' + _FileManagerScriptExtension);
EditorSettings.FlashFileBrowserWidth = EditorSettings.DisplayWidth * 0.7; // 70 percent
EditorSettings.FlashFileBrowserHeight = EditorSettings.DisplayHeight * 0.7; // 70 percent

EditorSettings.LinkFileUploadEnabled = false;
EditorSettings.LinkFileUploadURL = EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FastUploadScriptLanguage + '/upload.' + _FastUploadScriptExtension;
EditorSettings.LinkFileUploadPermittedExtensions = ".(7z|aiff|asf|avi|bmp|csv|doc|fla|flv|gif|gz|gzip|jpeg|jpg|mid|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|qt|ram|rar|rm|rmi|rmvb|rtf|sdc|sitd|swf|sxc|sxw|tar|tgz|tif|tiff|txt|vsd|wav|wma|wmv|xls|xml|zip)$"; // empty for all
EditorSettings.LinkFileUploadForbiddenExtensions = ""; // empty for no restrictions

EditorSettings.ImageFileUploadEnabled = false;
EditorSettings.ImageFileUploadURL = EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FastUploadScriptLanguage + '/upload.' + _FastUploadScriptExtension + '?Type=Image';
EditorSettings.ImageFileUploadPermittedExtensions = ".(jpg|gif|jpeg|png|bmp)$"; // empty for all
EditorSettings.ImageFileUploadForbiddenExtensions = ""; // empty for no restrictions

EditorSettings.FlashFileUploadEnabled = false;
EditorSettings.FlashFileUploadURL = EditorSettings.ApplicationPath + 'file_manager/connectors/' + _FastUploadScriptLanguage + '/upload.' + _FastUploadScriptExtension + '?Type=Flash';
EditorSettings.FlashFileUploadPermittedExtensions = ".(swf|flv)$"; // empty for all
EditorSettings.FlashFileUploadForbiddenExtensions = ""; // empty for no restrictions

EditorSettings.EmoticonDirectory = EditorSettings.ApplicationPath + 'gfx/emoticons/msn/';
EditorSettings.EmoticonFiles = ['regular_smile.gif', 'sad_smile.gif', 'wink_smile.gif', 'teeth_smile.gif', 'confused_smile.gif', 'tounge_smile.gif', 'embaressed_smile.gif', 'omg_smile.gif', 'whatchutalkingabout_smile.gif', 'angry_smile.gif', 'angel_smile.gif', 'shades_smile.gif', 'devil_smile.gif', 'cry_smile.gif', 'lightbulb.gif', 'thumbs_down.gif', 'thumbs_up.gif', 'heart.gif', 'broken_heart.gif', 'kiss.gif', 'envelope.gif'];
EditorSettings.EmoticonGridColumns = 8;
EditorSettings.EmoticonDialogWidth = 320;
EditorSettings.EmoticonDialogHeight = 210;

EditorSettings.OverlayBackgroundColor = '#ffffff';
EditorSettings.OverlayBackgroundOpacity = 0.50;

EditorSettings.MsBrowserCompatibilityMode = false;

EditorSettings.BlockFormSubmissionHandler = false;

// @ PLATFORM_INTEGRATION CUSTOMIZATION
//  External configuration file path (INTEG-0)
EditorSettings.UserSpecificSettingsPath = EditorSettings.ApplicationPath + '../../platform/custom_settings.js';
// @ END PLATFORM_INTEGRATION CUSTOMIZATION

// @ PLATFORM_INTEGRATION Customization (INTEG-1)
EditorSettings.ThemeLocation = EditorSettings.ApplicationPath + 'themes/silver/';
// @ End PLATFORM_INTEGRATION Customization

// @ PLATFORM_INTEGRATION CUSTOMIZATION
//  Specialized configuration for the Basic Platform editor (INTEG-2)
EditorSettings.ToolpaneCollections["PlatformEditor"] = [
  ['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
  ['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', '-', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', '-', 'TextColor', 'Style']
];

// Specialized configuration for Basic Platform Forms editor (INTEG-2)
EditorSettings.ToolpaneCollections["PlatformForms"] = [
  ['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
  ['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', 'TextColor', 'Style'],
  ['TextField', 'Select', 'Checkbox', 'Radio', 'Textarea', 'Button', 'ImageButton', 'HiddenField']
];
// @ END PLATFORM_INTEGRATION CUSTOMIZATION

// @PLATFORM_INTEGRATION Customization (INTEG-4)
// Utilize the Platform's dedicated file connector.
EditorSettings.LinkFileBrowserURL = EditorSettings.ApplicationPath + 'file_manager/browser/default/browser_view.html?Connector=/platform_editor/file_navigator.xml';
// @ End PLATFORM_INTEGRATION Customization

// @PLATFORM_INTEGRATION Customization (INTEG-5)
// Utilize the Platform's dedicated image connector.
EditorSettings.ImageFileBrowserURL = EditorSettings.ApplicationPath + 'file_manager/browser/default/browser_view.html?Type=Image&Connector=/platform_editor/file_navigator.xml';
// @ End PLATFORM_INTEGRATION Customization

// @PLATFORM_INTEGRATION Customization
EditorSettings.ToolpaneCollapsible = false;
// @ End PLATFORM_INTEGRATION Customization