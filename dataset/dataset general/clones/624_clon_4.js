const KEY_MOD_CONTROL_VAL = 0x1000;
const KEY_MOD_SHIFT_VAL = 0x2000;
const KEY_MOD_ALT_VAL = 0x4000;

function assemblePathSegments(baseSource, relativeTarget) {
    if (!baseSource) return relativeTarget;
    if (!relativeTarget) return baseSource;
    return baseSource.endsWith('/') ? baseSource + relativeTarget : baseSource + '/' + relativeTarget;
}

(function(targetObject) {
    const settingsBlueprint = {
        plainValues: [
            { keyName: 'CustomConfigurationsPath', value: '' },
            { keyName: 'EditorAreaStyles', value: '' },
            { keyName: 'ToolbarComboPreviewCSS', value: '' },
            { keyName: 'DocType', value: '' },
            { keyName: 'BaseHref', value: '' },
            { keyName: 'FullPage', value: false },
            { keyName: 'StartupShowBlocks', value: false },
            { keyName: 'Debug', value: false },
            { keyName: 'AllowQueryStringDebug', value: true },
            { keyName: 'SkinEditorCSS', value: '' },
            { keyName: 'SkinDialogCSS', value: '' },
            { keyName: 'AutoGrowMax', value: 400 },
            { keyName: 'AutoDetectLanguage', value: true },
            { keyName: 'DefaultLanguage', value: 'en' },
            { keyName: 'ContentLangDirection', value: 'ltr' },
            { keyName: 'ProcessHTMLEntities', value: true },
            { keyName: 'IncludeLatinEntities', value: true },
            { keyName: 'IncludeGreekEntities', value: true },
            { keyName: 'ProcessNumericEntities', value: false },
            { keyName: 'AdditionalNumericEntities', value: '' },
            { keyName: 'FillEmptyBlocks', value: true },
            { keyName: 'FormatSource', value: true },
            { keyName: 'FormatOutput', value: true },
            { keyName: 'FormatIndentator', value: '    ' },
            { keyName: 'EMailProtection', value: 'encode' },
            { keyName: 'EMailProtectionFunction', value: 'mt(NAME,DOMAIN,SUBJECT,BODY)' },
            { keyName: 'StartupFocus', value: false },
            { keyName: 'ForcePasteAsPlainText', value: false },
            { keyName: 'AutoDetectPasteFromWord', value: true },
            { keyName: 'ShowDropDialog', value: true },
            { keyName: 'ForceSimpleAmpersand', value: false },
            { keyName: 'TabSpaces', value: 0 },
            { keyName: 'ShowBorders', value: true },
            { keyName: 'SourcePopup', value: false },
            { keyName: 'ToolbarStartExpanded', value: true },
            { keyName: 'ToolbarCanCollapse', value: true },
            { keyName: 'IgnoreEmptyParagraphValue', value: true },
            { keyName: 'FloatingPanelsZIndex', value: 10000 },
            { keyName: 'HtmlEncodeOutput', value: false },
            { keyName: 'TemplateReplaceAll', value: true },
            { keyName: 'TemplateReplaceCheckbox', value: true },
            { keyName: 'ToolbarLocation', value: 'In' },
            { keyName: 'EnterMode', value: 'p' },
            { keyName: 'ShiftEnterMode', value: 'br' },
            { keyName: 'ContextMenu', value: ['Generic','Link','Anchor','Image','Flash','Select','Textarea','Checkbox','Radio','TextField','HiddenField','ImageButton','Button','BulletedList','NumberedList','Table','Form','DivContainer'] },
            { keyName: 'BrowserContextMenuOnCtrl', value: false },
            { keyName: 'BrowserContextMenu', value: false },
            { keyName: 'EnableMoreFontColors', value: true },
            { keyName: 'FontColors', value: '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,808080,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF' },
            { keyName: 'FontFormats', value: 'p;h1;h2;h3;h4;h5;h6;pre;address;div' },
            { keyName: 'FontNames', value: 'Arial;Comic Sans MS;Courier New;Tahoma;Times New Roman;Verdana' },
            { keyName: 'FontSizes', value: 'smaller;larger;xx-small;x-small;small;medium;large;x-large;xx-large' },
            { keyName: 'StylesXmlPath', value: '/bcms_config/fckstyles.xml' },
            { keyName: 'SpellChecker', value: 'ieSpell' },
            { keyName: 'IeSpellDownloadUrl', value: 'http://www.iespell.com/download.php' },
            { keyName: 'SpellerPagesServerScript', value: 'server-scripts/spellchecker.php' },
            { keyName: 'FirefoxSpellChecker', value: false },
            { keyName: 'MaxUndoLevels', value: 15 },
            { keyName: 'DisableObjectResizing', value: false },
            { keyName: 'DisableFFTableHandles', value: true },
            { keyName: 'LinkDlgHideTarget', value: false },
            { keyName: 'LinkDlgHideAdvanced', value: false },
            { keyName: 'ImageDlgHideLink', value: false },
            { keyName: 'ImageDlgHideAdvanced', value: false },
            { keyName: 'FlashDlgHideAdvanced', value: false },
            { keyName: 'ProtectedTags', value: '' },
            { keyName: 'BodyId', value: '' },
            { keyName: 'BodyClass', value: '' },
            { keyName: 'DefaultStyleLabel', value: '' },
            { keyName: 'DefaultFontFormatLabel', value: '' },
            { keyName: 'DefaultFontLabel', value: '' },
            { keyName: 'DefaultFontSizeLabel', value: '' },
            { keyName: 'DefaultLinkTarget', value: '' },
            { keyName: 'CleanWordKeepsStructure', value: false },
            { keyName: 'RemoveFormatTags', value: 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var' },
            { keyName: 'RemoveAttributes', value: 'class,style,lang,width,height,align,hspace,valign' },
            { keyName: 'IndentLength', value: 40 },
            { keyName: 'IndentUnit', value: 'px' },
            { keyName: 'IndentClasses', value: [] },
            { keyName: 'JustifyClasses', value: [] },
            { keyName: 'LinkBrowser', value: true },
            { keyName: 'ImageBrowser', value: true },
            { keyName: 'FlashBrowser', value: true },
            { keyName: 'LinkUpload', value: false },
            { keyName: 'ImageUpload', value: false },
            { keyName: 'FlashUpload', value: false },
            { keyName: 'LinkUploadAllowedExtensions', value: ".(7z|aiff|asf|avi|bmp|csv|doc|fla|flv|gif|gz|gzip|jpeg|jpg|mid|mov|mp3|mp4|mpc|mpeg|mpg|ods|odt|pdf|png|ppt|pxd|qt|ram|rar|rm|rmi|rmvb|rtf|sdc|sitd|swf|sxc|sxw|tar|tgz|tif|tiff|txt|vsd|wav|wma|wmv|xls|xml|zip)$" },
            { keyName: 'LinkUploadDeniedExtensions', value: "" },
            { keyName: 'ImageUploadAllowedExtensions', value: ".(jpg|gif|jpeg|png|bmp)$" },
            { keyName: 'ImageUploadDeniedExtensions', value: "" },
            { keyName: 'FlashUploadAllowedExtensions', value: ".(swf|flv)$" },
            { keyName: 'FlashUploadDeniedExtensions', value: "" },
            { keyName: 'SmileyColumns', value: 8 },
            { keyName: 'SmileyWindowWidth', value: 320 },
            { keyName: 'SmileyWindowHeight', value: 210 },
            { keyName: 'BackgroundBlockerColor', value: '#ffffff' },
            { keyName: 'BackgroundBlockerOpacity', value: 0.50 },
            { keyName: 'MsWebBrowserControlCompat', value: false },
            { keyName: 'PreventSubmitHandler', value: false }
        ],
        pathBasedValues: [
            { keyName: 'EditorAreaCSS', pathSegment: 'css/fck_editorarea.css' },
            { keyName: 'SkinPath', pathSegment: 'skins/default/' },
            { keyName: 'PluginsPath', pathSegment: 'plugins/' },
            { keyName: 'SmileyPath', pathSegment: 'images/smiley/msn/' }
        ],
        preloadImageSources: [
            'images/toolbar.start.gif',
            'images/toolbar.buttonarrow.gif'
        ],
        toolbarStructures: {
            "Default": [
                ['Source','DocProps','-','Save','NewPage','Preview','-','Templates'],
                ['Cut','Copy','Paste','PasteText','PasteWord','-','Print','SpellCheck'],
                ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
                ['Form','Checkbox','Radio','TextField','Textarea','Select','Button','ImageButton','HiddenField'],
                '/',
                ['Bold','Italic','Underline','StrikeThrough','-','Subscript','Superscript'],
                ['OrderedList','UnorderedList','-','Outdent','Indent','Blockquote','CreateDiv'],
                ['JustifyLeft','JustifyCenter','JustifyRight','JustifyFull'],
                ['Link','Unlink','Anchor'],
                ['Image','Flash','Table','Rule','Smiley','SpecialChar','PageBreak'],
                '/',
                ['Style','FontFormat','FontName','FontSize'],
                ['TextColor','BGColor'],
                ['FitWindow','ShowBlocks','-','About']
            ],
            "Basic": [
                ['Bold','Italic','-','OrderedList','UnorderedList','-','Link','Unlink','-','About']
            ]
        },
        keyboardCommandBindings: [
            { modifiers: KEY_MOD_CONTROL_VAL, code: 65, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 67, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 70, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 83, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 84, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 88, command: true },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 86, command: 'Paste' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 45, command: true },
            { modifiers: KEY_MOD_SHIFT_VAL, code: 45, command: 'Paste' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 88, command: 'Cut' },
            { modifiers: KEY_MOD_SHIFT_VAL, code: 46, command: 'Cut' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 90, command: 'Undo' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 89, command: 'Redo' },
            { modifiers: KEY_MOD_CONTROL_VAL | KEY_MOD_SHIFT_VAL, code: 90, command: 'Redo' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 76, command: 'Link' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 66, command: 'Bold' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 73, command: 'Italic' },
            { modifiers: KEY_MOD_CONTROL_VAL, code: 85, command: 'Underline' },
            { modifiers: KEY_MOD_CONTROL_VAL | KEY_MOD_SHIFT_VAL, code: 83, command: 'Save' },
            { modifiers: KEY_MOD_CONTROL_VAL | KEY_MOD_ALT_VAL, code: 13, command: 'FitWindow' },
            { modifiers: KEY_MOD_SHIFT_VAL, code: 32, command: 'Nbsp' }
        ],
        coreStyleDefinitions: [
            { id: 'Bold', elementTag: 'strong', overrideValue: 'b' },
            { id: 'Italic', elementTag: 'em', overrideValue: 'i' },
            { id: 'Underline', elementTag: 'u' },
            { id: 'StrikeThrough', elementTag: 'strike' },
            { id: 'Subscript', elementTag: 'sub' },
            { id: 'Superscript', elementTag: 'sup' },
            { id: 'p', elementTag: 'p' },
            { id: 'div', elementTag: 'div' },
            { id: 'pre', elementTag: 'pre' },
            { id: 'address', elementTag: 'address' },
            { id: 'h1', elementTag: 'h1' },
            { id: 'h2', elementTag: 'h2' },
            { id: 'h3', elementTag: 'h3' },
            { id: 'h4', elementTag: 'h4' },
            { id: 'h5', elementTag: 'h5' },
            { id: 'h6', elementTag: 'h6' },
            { id: 'FontFace', elementTag: 'span', cssProps: { 'font-family': '#("Font")' }, overrideValue: [{ Element: 'font', Attributes: { 'face': null } }] },
            { id: 'Size', elementTag: 'span', cssProps: { 'font-size': '#("Size","fontSize")' }, overrideValue: [{ Element: 'font', Attributes: { 'size': null } }] },
            { id: 'Color', elementTag: 'span', cssProps: { 'color': '#("Color","color")' }, overrideValue: [{ Element: 'font', Attributes: { 'color': null } }] },
            { id: 'BackColor', elementTag: 'span', cssProps: { 'background-color': '#("Color","color")' } },
            { id: 'SelectionHighlight', elementTag: 'span', cssProps: { 'background-color': 'navy', 'color': 'white' } }
        ],
        fileConnectorSetup: {
            browserTypeIdentifier: 'php',
            uploaderTypeIdentifier: 'php',
            displayViewportWidth: 1024,
            displayViewportHeight: 768
        },
        smileyImageNames: ['regular_smile.gif','sad_smile.gif','wink_smile.gif','teeth_smile.gif','confused_smile.gif','tounge_smile.gif','embaressed_smile.gif','omg_smile.gif','whatchutalkingabout_smile.gif','angry_smile.gif','angel_smile.gif','shades_smile.gif','devil_smile.gif','cry_smile.gif','lightbulb.gif','thumbs_down.gif','thumbs_up.gif','heart.gif','broken_heart.gif','kiss.gif','envelope.gif'],
        configurationOverrides: [
            { targetKey: 'CustomConfigurationsPath', value: '{{BASE_PATH}}../../site/customconfig.js' },
            { targetKey: 'SkinPath', value: '{{BASE_PATH}}skins/silver/' },
            { targetKey: 'ToolbarSets.CMS', value: [
                ['Source','-','Cut','Copy','Paste','PasteText','PasteWord','SpellCheck','-','Undo','Redo','Find','Replace','RemoveFormat','-','OrderedList','UnorderedList','Outdent','Indent','Rule'],
                ['Link','Unlink','Anchor','Image','Table','SpecialChar','-','Bold','Italic','Underline','JustifyLeft','JustifyCenter','JustifyRight','JustifyFull','-','TextColor','Style']
            ]},
            { targetKey: 'ToolbarSets.CMSForms', value: [
                ['Source','-','Cut','Copy','Paste','PasteText','PasteWord','SpellCheck','-','Undo','Redo','Find','Replace','RemoveFormat','-','OrderedList','UnorderedList','Outdent','Indent','Rule'],
                ['Link','Unlink','Anchor','Image','Table','SpecialChar','Bold','Italic','Underline','JustifyLeft','JustifyCenter','JustifyRight','JustifyFull','TextColor','Style'],
                ['TextField','Select','Checkbox','Radio','Textarea','Button','ImageButton','HiddenField']
            ]},
            { targetKey: 'LinkBrowserURL', value: '{{BASE_PATH}}filemanager/browser/default/browser.html?Connector=/bcms_fckeditor/file_browser.xml' },
            { targetKey: 'ImageBrowserURL', value: '{{BASE_PATH}}filemanager/browser/default/browser.html?Type=Image&Connector=/bcms_fckeditor/file_browser.xml' },
            { targetKey: 'ToolbarCanCollapse', value: false }
        ]
    };

    const interimConfig = {};

    interimConfig.BasePath = (targetObject && targetObject.BasePath) || '/default_editor_base/';
    interimConfig.EditorPath = (targetObject && targetObject.EditorPath) || interimConfig.BasePath;

    settingsBlueprint.plainValues.forEach(item => {
        interimConfig[item.keyName] = item.value;
    });

    settingsBlueprint.pathBasedValues.forEach(item => {
        interimConfig[item.keyName] = assemblePathSegments(interimConfig.BasePath, item.pathSegment);
    });

    interimConfig.PreloadImages = settingsBlueprint.preloadImageSources.map(src => assemblePathSegments(interimConfig.SkinPath, src));

    interimConfig.ToolbarSets = {};
    for (const setName in settingsBlueprint.toolbarStructures) {
        interimConfig.ToolbarSets[setName] = settingsBlueprint.toolbarStructures[setName];
    }

    interimConfig.Keystrokes = settingsBlueprint.keyboardCommandBindings.map(binding => {
        return [binding.modifiers + binding.code, binding.command];
    });

    interimConfig.CoreStyles = {};
    settingsBlueprint.coreStyleDefinitions.forEach(styleDef => {
        const styleObject = { Element: styleDef.elementTag };
        if (styleDef.overrideValue !== undefined) {
            styleObject.Overrides = styleDef.overrideValue;
        }
        if (styleDef.cssProps) {
            styleObject.Styles = styleDef.cssProps;
        }
        interimConfig.CoreStyles[styleDef.id] = styleObject;
    });

    const fileConf = settingsBlueprint.fileConnectorSetup;
    interimConfig.ScreenWidth = fileConf.displayViewportWidth;
    interimConfig.ScreenHeight = fileConf.displayViewportHeight;

    const browserLangId = fileConf.browserTypeIdentifier;
    const uploadLangId = fileConf.uploaderTypeIdentifier;

    const browserFileExtension = browserLangId === 'perl' ? 'cgi' : browserLangId;
    const uploadFileExtension = uploadLangId === 'perl' ? 'cgi' : uploadLangId;

    const connectorBaseDir = assemblePathSegments(interimConfig.BasePath, 'filemanager/connectors/');
    const browserHtmlPage = assemblePathSegments(interimConfig.BasePath, 'filemanager/browser/default/browser.html');
    const uploadServiceBase = assemblePathSegments(interimConfig.BasePath, 'filemanager/connectors/');

    interimConfig.LinkBrowserURL = `${browserHtmlPage}?Connector=${encodeURIComponent(assemblePathSegments(connectorBaseDir, browserLangId + '/connector.' + browserFileExtension))}`;
    interimConfig.LinkBrowserWindowWidth = interimConfig.ScreenWidth * 0.7;
    interimConfig.LinkBrowserWindowHeight = interimConfig.ScreenHeight * 0.7;

    interimConfig.ImageBrowserURL = `${browserHtmlPage}?Type=Image&Connector=${encodeURIComponent(assemblePathSegments(connectorBaseDir, browserLangId + '/connector.' + browserFileExtension))}`;
    interimConfig.ImageBrowserWindowWidth = interimConfig.ScreenWidth * 0.7;
    interimConfig.ImageBrowserWindowHeight = interimConfig.ScreenHeight * 0.7;

    interimConfig.FlashBrowserURL = `${browserHtmlPage}?Type=Flash&Connector=${encodeURIComponent(assemblePathSegments(connectorBaseDir, browserLangId + '/connector.' + browserFileExtension))}`;
    interimConfig.FlashBrowserWindowWidth = interimConfig.ScreenWidth * 0.7;
    interimConfig.FlashBrowserWindowHeight = interimConfig.ScreenHeight * 0.7;

    interimConfig.LinkUploadURL = assemblePathSegments(uploadServiceBase, uploadLangId + '/upload.' + uploadFileExtension);
    interimConfig.ImageUploadURL = assemblePathSegments(uploadServiceBase, uploadLangId + '/upload.' + uploadFileExtension + '?Type=Image');
    interimConfig.FlashUploadURL = assemblePathSegments(uploadServiceBase, uploadLangId + '/upload.' + uploadFileExtension + '?Type=Flash');

    interimConfig.SmileyImages = settingsBlueprint.smileyImageNames;

    interimConfig.TemplatesXmlPath = assemblePathSegments(interimConfig.EditorPath, 'fcktemplates.xml');

    settingsBlueprint.configurationOverrides.forEach(override => {
        let valueToSet = override.value;
        if (typeof valueToSet === 'string') {
            valueToSet = valueToSet.replace('{{BASE_PATH}}', interimConfig.BasePath);
        }

        const pathParts = override.targetKey.split('.');
        let currentLevel = interimConfig;
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!(part in currentLevel) || typeof currentLevel[part] !== 'object' || currentLevel[part] === null) {
                currentLevel[part] = {};
            }
            currentLevel = currentLevel[part];
        }
        currentLevel[pathParts[pathParts.length - 1]] = valueToSet;
    });

    Object.assign(targetObject, interimConfig);

})((typeof globalThis !== 'undefined' ? globalThis : window)['FCKConfig'] || {});