/*
 * FCKeditor - The Ultimate Text Editor for the Web
 * Copyright (C) 2003-2008 Frederico Caldeira Knabben
 *
 * This software is licensed under one of the following terms, at your discretion:
 *
 *  - GNU General Public License (GPL) Version 2 or later
 *    (See: http://www.gnu.org/licenses/gpl.html for details)
 *
 *  - GNU Lesser General Public License (LGPL) Version 2.1 or later
 *    (See: http://www.gnu.org/licenses/lgpl.html for details)
 *
 *  - Mozilla Public License (MPL) Version 1.1 or later
 *    (See: http://www.mozilla.org/MPL/MPL-1.1.html for details)
 *
 * For more information about FCKeditor configuration options, please visit:
 * http://docs.fckeditor.net/FCKeditor_2.x/Developers_Guide/Configuration/Configuration_Options
 *
 */

// Initialize Custom Configurations Path
FCKConfig.CustomConfigurationsPath = '';

// Editor Area and Toolbar Preview CSS settings
FCKConfig.EditorAreaCSS          = FCKConfig.BasePath + 'css/fck_editorarea.css';
FCKConfig.EditorAreaStyles       = '';
FCKConfig.ToolbarComboPreviewCSS = '';

// Document Type configuration
FCKConfig.DocType = '';

// Base Href for relative paths
FCKConfig.BaseHref = '';

// Full Page editing mode
FCKConfig.FullPage = false;

// Determines if "Show Blocks" feature is active on startup.
FCKConfig.StartupShowBlocks = false;

// Debugging settings
FCKConfig.Debug                 = false;
FCKConfig.AllowQueryStringDebug = true;

// Skin related configurations
FCKConfig.SkinPath      = FCKConfig.BasePath + 'skins/default/';
FCKConfig.SkinEditorCSS = ''; // Example: FCKConfig.SkinPath + "|<minified css>" ;
FCKConfig.SkinDialogCSS = ''; // Example: FCKConfig.SkinPath + "|<minified css>" ;

// Images to preload for better UI performance.
FCKConfig.PreloadImages = [
  FCKConfig.SkinPath + 'images/toolbar.start.gif',
  FCKConfig.SkinPath + 'images/toolbar.buttonarrow.gif'
];

// Plugins directory path
FCKConfig.PluginsPath = FCKConfig.BasePath + 'plugins/';

// Plugin activation examples (currently commented out)
// FCKConfig.Plugins.Add( 'autogrow' ) ;
// FCKConfig.Plugins.Add( 'dragresizetable' );

// Maximum height for the autogrow plugin
FCKConfig.AutoGrowMax = 400;

// Protected source patterns (server-side code examples)
// FCKConfig.ProtectedSource.Add( /<%[\s\S]*?%>/g ) ; // ASP style server side code <%...%>
// FCKConfig.ProtectedSource.Add( /<\?[\s\S]*?\?>/g ) ; // PHP style server side code
// FCKConfig.ProtectedSource.Add( /(<asp:[^\>]+>[\s|\S]*?<\/asp:[^\>]+>)|(<asp:[^\>]+\/>)/gi ) ; // ASP.Net style tags <asp:control>

// Language settings
FCKConfig.AutoDetectLanguage  = true;
FCKConfig.DefaultLanguage     = 'en';
FCKConfig.ContentLangDirection= 'ltr';

// HTML Entity processing
FCKConfig.ProcessHTMLEntities  = true;
FCKConfig.IncludeLatinEntities = true;
FCKConfig.IncludeGreekEntities = true;

// Numeric entity processing
FCKConfig.ProcessNumericEntities = false;

// Additional numeric entities to include
FCKConfig.AdditionalNumericEntities = ''; // Example: Single Quote: "'"

// Block filling behavior
FCKConfig.FillEmptyBlocks = true;

// Source formatting options
FCKConfig.FormatSource   = true;
FCKConfig.FormatOutput   = true;
FCKConfig.FormatIndentator = '    ';

// Email protection settings
FCKConfig.EMailProtection       = 'encode'; // Options: none | encode | function
FCKConfig.EMailProtectionFunction = 'mt(NAME,DOMAIN,SUBJECT,BODY)';

// Editor startup and interaction behaviors
FCKConfig.StartupFocus          = false;
FCKConfig.ForcePasteAsPlainText = false;
FCKConfig.AutoDetectPasteFromWord = true; // Note: IE only feature.
FCKConfig.ShowDropDialog        = true;
FCKConfig.ForceSimpleAmpersand  = false;
FCKConfig.TabSpaces             = 0;
FCKConfig.ShowBorders           = true;
FCKConfig.SourcePopup           = false;
FCKConfig.ToolbarStartExpanded  = true;
FCKConfig.ToolbarCanCollapse    = true;
FCKConfig.IgnoreEmptyParagraphValue = true;
FCKConfig.FloatingPanelsZIndex  = 10000;
FCKConfig.HtmlEncodeOutput      = false;

// Template replacement settings
FCKConfig.TemplateReplaceAll    = true;
FCKConfig.TemplateReplaceCheckbox = true;

// Toolbar location ('In' or 'Out')
FCKConfig.ToolbarLocation = 'In';

// Define the "Default" toolbar set
FCKConfig.ToolbarSets["Default"] = [
	['Source', 'DocProps', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates'],
	['Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', '-', 'Print', 'SpellCheck'],
	['Undo', 'Redo', '-', 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat'],
	['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
	'/', // Separator for toolbar rows
	['Bold', 'Italic', 'Underline', 'StrikeThrough', '-', 'Subscript', 'Superscript'],
	['OrderedList', 'UnorderedList', '-', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv'],
	['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull'],
	['Link', 'Unlink', 'Anchor'],
	['Image', 'Flash', 'Table', 'Rule', 'Smiley', 'SpecialChar', 'PageBreak'],
	'/', // Another separator
	['Style', 'FontFormat', 'FontName', 'FontSize'],
	['TextColor', 'BGColor'],
	['FitWindow', 'ShowBlocks', '-', 'About'] // No comma for the final item in the last row.
];

// Define the "Basic" toolbar set
FCKConfig.ToolbarSets["Basic"] = [
	['Bold', 'Italic', '-', 'OrderedList', 'UnorderedList', '-', 'Link', 'Unlink', '-', 'About']
];

// Enter key and Shift+Enter key behavior
FCKConfig.EnterMode      = 'p'; // Options: p | div | br
FCKConfig.ShiftEnterMode = 'br'; // Options: p | div | br

// Keyboard shortcuts (Keystrokes) configuration
FCKConfig.Keystrokes = [
	[CTRL + 65 /* A */, true],
	[CTRL + 67 /* C */, true],
	[CTRL + 70 /* F */, true],
	[CTRL + 83 /* S */, true],
	[CTRL + 84 /* T */, true],
	[CTRL + 88 /* X */, true],
	[CTRL + 86 /* V */, 'Paste'],
	[CTRL + 45 /* INS */, true],
	[SHIFT + 45 /* INS */, 'Paste'],
	[CTRL + 88 /* X */, 'Cut'],
	[SHIFT + 46 /* DEL */, 'Cut'],
	[CTRL + 90 /* Z */, 'Undo'],
	[CTRL + 89 /* Y */, 'Redo'],
	[CTRL + SHIFT + 90 /* Z */, 'Redo'],
	[CTRL + 76 /* L */, 'Link'],
	[CTRL + 66 /* B */, 'Bold'],
	[CTRL + 73 /* I */, 'Italic'],
	[CTRL + 85 /* U */, 'Underline'],
	[CTRL + SHIFT + 83 /* S */, 'Save'],
	[CTRL + ALT + 13 /* ENTER */, 'FitWindow'],
	[SHIFT + 32 /* SPACE */, 'Nbsp']
];

// Context menu items
FCKConfig.ContextMenu = [
	'Generic', 'Link', 'Anchor', 'Image', 'Flash', 'Select', 'Textarea', 'Checkbox',
	'Radio', 'TextField', 'HiddenField', 'ImageButton', 'Button', 'BulletedList',
	'NumberedList', 'Table', 'Form', 'DivContainer'
];
FCKConfig.BrowserContextMenuOnCtrl = false;
FCKConfig.BrowserContextMenu       = false;

// Font color settings
FCKConfig.EnableMoreFontColors = true;
FCKConfig.FontColors = '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,808080,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF';

// Font formatting options
FCKConfig.FontFormats = 'p;h1;h2;h3;h4;h5;h6;pre;address;div';
FCKConfig.FontNames   = 'Arial;Comic Sans MS;Courier New;Tahoma;Times New Roman;Verdana';
FCKConfig.FontSizes   = 'smaller;larger;xx-small;x-small;small;medium;large;x-large;xx-large';

// Path to XML configuration files
FCKConfig.StylesXmlPath    = '/bcms_config/fckstyles.xml';
FCKConfig.TemplatesXmlPath = FCKConfig.EditorPath + 'fcktemplates.xml';

// Spell checker configurations
FCKConfig.SpellChecker           = 'ieSpell'; // Options: 'ieSpell' | 'SpellerPages'
FCKConfig.IeSpellDownloadUrl     = 'http://www.iespell.com/download.php';
FCKConfig.SpellerPagesServerScript = 'server-scripts/spellchecker.php'; // Supported extensions: .php, .cfm, .pl
FCKConfig.FirefoxSpellChecker    = false;

// Undo/Redo levels
FCKConfig.MaxUndoLevels = 15;

// Object resizing and table handles
FCKConfig.DisableObjectResizing = false;
FCKConfig.DisableFFTableHandles = true;

// Link dialog options
FCKConfig.LinkDlgHideTarget   = false;
FCKConfig.LinkDlgHideAdvanced = false;

// Image dialog options
FCKConfig.ImageDlgHideLink    = false;
FCKConfig.ImageDlgHideAdvanced= false;

// Flash dialog options
FCKConfig.FlashDlgHideAdvanced= false;

// Tags to protect from editing
FCKConfig.ProtectedTags = '';

// These will be applied to the <body> element of the editor iframe
FCKConfig.BodyId    = '';
FCKConfig.BodyClass = '';

// Default labels for style dropdowns
FCKConfig.DefaultStyleLabel      = '';
FCKConfig.DefaultFontFormatLabel = '';
FCKConfig.DefaultFontLabel       = '';
FCKConfig.DefaultFontSizeLabel   = '';

// Default target for links
FCKConfig.DefaultLinkTarget = '';

// Word paste cleaning behavior
FCKConfig.CleanWordKeepsStructure = false;

// Tags to remove during format removal (only inline elements are valid)
FCKConfig.RemoveFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var';

// Attributes that will be removed during paste operations
FCKConfig.RemoveAttributes = 'class,style,lang,width,height,align,hspace,valign';

// Core Styles definition - DO NOT ADD, RENAME, OR REMOVE STYLES HERE.
// ONLY MODIFY DEFINITIONS.
FCKConfig.CoreStyles =
{
	// Basic Inline Styles
	'Bold'         : { Element : 'strong', Overrides : 'b' },
	'Italic'       : { Element : 'em', Overrides : 'i' },
	'Underline'    : { Element : 'u' },
	'StrikeThrough': { Element : 'strike' },
	'Subscript'    : { Element : 'sub' },
	'Superscript'  : { Element : 'sup' },

	// Basic Block Styles (used in Font Format Combo)
	'p'        : { Element : 'p' },
	'div'      : { Element : 'div' },
	'pre'      : { Element : 'pre' },
	'address'  : { Element : 'address' },
	'h1'       : { Element : 'h1' },
	'h2'       : { Element : 'h2' },
	'h3'       : { Element : 'h3' },
	'h4'       : { Element : 'h4' },
	'h5'       : { Element : 'h5' },
	'h6'       : { Element : 'h6' },

	// Other formatting features
	'FontFace' :
	{
		Element   : 'span',
		Styles    : { 'font-family' : '#("Font")' },
		Overrides : [ { Element : 'font', Attributes : { 'face' : null } } ]
	},

	'Size' :
	{
		Element   : 'span',
		Styles    : { 'font-size' : '#("Size","fontSize")' },
		Overrides : [ { Element : 'font', Attributes : { 'size' : null } } ]
	},

	'Color' :
	{
		Element   : 'span',
		Styles    : { 'color' : '#("Color","color")' },
		Overrides : [ { Element : 'font', Attributes : { 'color' : null } } ]
	},

	'BackColor' : { Element : 'span', Styles : { 'background-color' : '#("Color","color")' } },

	'SelectionHighlight' : { Element : 'span', Styles : { 'background-color' : 'navy', 'color' : 'white' } }
};

// Indentation settings
FCKConfig.IndentLength = 40;
FCKConfig.IndentUnit   = 'px';

// CSS classes for block indentation (overrides IndentLength/IndentUnit)
FCKConfig.IndentClasses = [];

// Justification classes: [ Left, Center, Right, Justified ]
FCKConfig.JustifyClasses = [];

// File Browser and Quick Upload connector settings.
// These values are for the default implementation and cannot be changed via external config.
// Custom implementations should disregard these.
var _FileBrowserLanguage = 'php'; // Supported: asp | aspx | cfm | lasso | perl | php | py
var _QuickUploadLanguage = 'php'; // Supported: asp | aspx | cfm | lasso | perl | php | py

// Determine the correct connector extension (Perl uses "cgi")
var _FileBrowserExtension = _FileBrowserLanguage == 'perl' ? 'cgi' : _FileBrowserLanguage;
var _QuickUploadExtension = _QuickUploadLanguage == 'perl' ? 'cgi' : _QuickUploadLanguage;

// Link Browser settings
FCKConfig.LinkBrowser             = true;
FCKConfig.LinkBrowserURL          = FCKConfig.BasePath + 'filemanager/browser/default/browser.html?Connector=' + encodeURIComponent( FCKConfig.BasePath + 'filemanager/connectors/' + _FileBrowserLanguage + '/connector.' + _FileBrowserExtension );
FCKConfig.LinkBrowserWindowWidth  = FCKConfig.ScreenWidth * 0.7; // 70% of screen width
FCKConfig.LinkBrowserWindowHeight = FCKConfig.ScreenHeight * 0.7; // 70% of screen height

// Image Browser settings
FCKConfig.ImageBrowser             = true;
FCKConfig.ImageBrowserURL          = FCKConfig.BasePath + 'filemanager/browser/default/browser.html?Type=Image&Connector=' + encodeURIComponent( FCKConfig.BasePath + 'filemanager/connectors/' + _FileBrowserLanguage + '/connector.' + _FileBrowserExtension );
FCKConfig.ImageBrowserWindowWidth  = FCKConfig.ScreenWidth * 0.7; // 70%
FCKConfig.ImageBrowserWindowHeight = FCKConfig.ScreenHeight * 0.7; // 70%

// Flash Browser settings
FCKConfig.FlashBrowser             = true;
FCKConfig.FlashBrowserURL          = FCKConfig.BasePath + 'filemanager/browser/default/browser.html?Type=Flash&Connector=' + encodeURIComponent( FCKConfig.BasePath + 'filemanager/connectors/' + _FileBrowserLanguage + '/connector.' + _FileBrowserExtension );
FCKConfig.FlashBrowserWindowWidth  = FCKConfig.ScreenWidth * 0.7; // 70%
FCKConfig.FlashBrowserWindowHeight = FCKConfig.ScreenHeight * 0.7; // 70%

// Link Upload settings
FCKConfig.LinkUpload            = false;
FCKConfig.LinkUploadURL         = FCKConfig.BasePath + 'filemanager/connectors/' + _QuickUploadLanguage + '/upload.' + _QuickUploadExtension;
FCKConfig.LinkUploadAllowedExtensions = ".(7z|aiff|asf|avi|bmp|csv|doc|fla|flv|gif|gz|gzip|jpeg|jpg|mid|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|qt|ram|rar|rm|rmi|rmvb|rtf|sdc|sitd|swf|sxc|sxw|tar|tgz|tif|tiff|txt|vsd|wav|wma|wmv|xls|xml|zip)$"; // Leave empty for all file types
FCKConfig.LinkUploadDeniedExtensions  = ""; // Leave empty for no denied file types

// Image Upload settings
FCKConfig.ImageUpload            = false;
FCKConfig.ImageUploadURL         = FCKConfig.BasePath + 'filemanager/connectors/' + _QuickUploadLanguage + '/upload.' + _QuickUploadExtension + '?Type=Image';
FCKConfig.ImageUploadAllowedExtensions = ".(jpg|gif|jpeg|png|bmp)$"; // Leave empty for all image types
FCKConfig.ImageUploadDeniedExtensions  = ""; // Leave empty for no denied image types

// Flash Upload settings
FCKConfig.FlashUpload            = false;
FCKConfig.FlashUploadURL         = FCKConfig.BasePath + 'filemanager/connectors/' + _QuickUploadLanguage + '/upload.' + _QuickUploadExtension + '?Type=Flash';
FCKConfig.FlashUploadAllowedExtensions = ".(swf|flv)$"; // Leave empty for all flash types
FCKConfig.FlashUploadDeniedExtensions  = ""; // Leave empty for no denied flash types

// Smiley configurations
FCKConfig.SmileyPath        = FCKConfig.BasePath + 'images/smiley/msn/';
FCKConfig.SmileyImages      = [
  'regular_smile.gif', 'sad_smile.gif', 'wink_smile.gif', 'teeth_smile.gif',
  'confused_smile.gif', 'tounge_smile.gif', 'embaressed_smile.gif', 'omg_smile.gif',
  'whatchutalkingabout_smile.gif', 'angry_smile.gif', 'angel_smile.gif', 'shades_smile.gif',
  'devil_smile.gif', 'cry_smile.gif', 'lightbulb.gif', 'thumbs_down.gif',
  'thumbs_up.gif', 'heart.gif', 'broken_heart.gif', 'kiss.gif', 'envelope.gif'
];
FCKConfig.SmileyColumns     = 8;
FCKConfig.SmileyWindowWidth = 320;
FCKConfig.SmileyWindowHeight= 210;

// Background blocker for dialogs
FCKConfig.BackgroundBlockerColor   = '#ffffff';
FCKConfig.BackgroundBlockerOpacity = 0.50;

// Compatibility for MsWebBrowserControl
FCKConfig.MsWebBrowserControlCompat = false;

// Prevent form submission handler
FCKConfig.PreventSubmitHandler = false;

// --- @ CMS CUSTOMIZATION BLOCK (CMS-0) ---
// Overrides the default custom configurations path to a CMS-specific one.
FCKConfig.CustomConfigurationsPath = FCKConfig.BasePath + '../../site/customconfig.js';
// --- @ END CMS CUSTOMIZATION BLOCK ---

// --- @ CMS Customization (CMS-1) ---
// Changes the editor skin to 'silver' for CMS integration.
FCKConfig.SkinPath = FCKConfig.BasePath + 'skins/silver/';
// --- @ End CMS Customization ---

// --- @ CMS CUSTOMIZATION BLOCK ---
// Custom toolbar set for a Basic CMS editor (CMS-2).
FCKConfig.ToolbarSets["CMS"] = [
	['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
	['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', '-', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', '-', 'TextColor', 'Style']
];

// Custom toolbar set for Basic CMS Forms editor (CMS-2).
FCKConfig.ToolbarSets["CMSForms"] = [
	['Source', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', 'SpellCheck', '-', 'Undo', 'Redo', 'Find', 'Replace', 'RemoveFormat', '-', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', 'Rule'],
	['Link', 'Unlink', 'Anchor', 'Image', 'Table', 'SpecialChar', 'Bold', 'Italic', 'Underline', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull', 'TextColor', 'Style'],
	['TextField', 'Select', 'Checkbox', 'Radio', 'Textarea', 'Button', 'ImageButton', 'HiddenField']
];
// --- @ END CMS CUSTOMIZATION BLOCK ---

// --- @CMS Customization (CMS-4) ---
// Utilizes the BrowserCMS file connector for link browsing.
FCKConfig.LinkBrowserURL = FCKConfig.BasePath + 'filemanager/browser/default/browser.html?Connector=/bcms_fckeditor/file_browser.xml';
// --- @ End CMS Customization ---

// --- @CMS Customization (CMS-5) ---
// Utilizes the BrowserCMS file connector for image browsing.
FCKConfig.ImageBrowserURL = FCKConfig.BasePath + 'filemanager/browser/default/browser.html?Type=Image&Connector=/bcms_fckeditor/file_browser.xml';
// --- @ End CMS Customization ---

// --- @CMS Customization ---
// Disables the ability to collapse the toolbar in the CMS.
FCKConfig.ToolbarCanCollapse = false;
// --- @ End CMS Customization ---