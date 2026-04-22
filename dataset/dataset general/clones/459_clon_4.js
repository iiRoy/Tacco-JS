(function( globalScope ) {

    const combineRecursive = (target, ...sources) => {
        if (!sources.length) return target;
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    combineRecursive(target[key], source[key]);
                } else if (Array.isArray(source[key])) {
                    target[key] = source[key].map(item => (isObject(item) ? combineRecursive({}, item) : item));
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return combineRecursive(target, ...sources);
    };

    const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

    const essentialVariables = globalScope.ap_vars;
    const visualEditorConfigurator = globalScope.tinyMCEPreInit;
    const quickTagManager = globalScope.QTags;
    const editorSwitcher = globalScope.switchEditors;

    const baseConfiguration = {
        'displayMode': 'html',
        'tinySettings' : {
            "theme": "modern",
            "skin": "lightgray",
            "language": "en",
            "formats": {
                "alignleft": [
                    { "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"left"}, "deep": false, "remove": "none" },
                    { "selector": "img,table,dl.wp-caption", "classes": ["alignleft"], "deep":false, "remove":"none" }
                ],
                "aligncenter": [
                    { "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"center"}, "deep": false, "remove": "none" },
                    { "selector": "img,table,dl.wp-caption", "classes": ["aligncenter"], "deep": false, "remove": "none" }
                ],
                "alignright": [
                    { "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", "styles": {"textAlign":"right"}, "deep": false, "remove": "none" },
                    { "selector": "img,table,dl.wp-caption", "classes": ["alignright"], "deep": false, "remove": "none" }
                ],
                "strikethrough": {"inline":"del","deep":true,"split":true}
            },
            "relative_urls": false,
            "remove_script_host": false,
            "convert_urls": false,
            "browser_spellcheck": true,
            "fix_list_elements": true,
            "entities": "38,amp,60,lt,62,gt",
            "entity_encoding": "raw",
            "keep_styles": false,
            "paste_webkit_styles": "font-weight font-style color",
            "preview_styles": "font-family font-size font-weight font-style text-decoration text-transform",
            "wpeditimage_disable_captions": false,
            "wpeditimage_html5_captions": false,
            "plugins": "charmap,hr,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview,image",
            "content_css": (essentialVariables ? essentialVariables.includes_url : '') + "css/dashicons.css?ver=3.9," + (essentialVariables ? essentialVariables.includes_url : '') + "js/mediaelement/mediaelementplayer.min.css?ver=3.9," + (essentialVariables ? essentialVariables.includes_url : '') + "js/mediaelement/wp-mediaelement.css?ver=3.9," + (essentialVariables ? essentialVariables.includes_url : '') + "js/tinymce/skins/wordpress/wp-content.css?ver=3.9",
            "selector": "#initialEditorId",
            "resize": "vertical",
            "menubar": false,
            "wpautop": true,
            "indent": false,
            "toolbar1": "bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
            "toolbar2": "formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
            "toolbar3": "",
            "toolbar4": "",
            "tabfocus_elements": ":prev,:next",
            "body_class": "initialEditorId"
        }
    };

    globalScope.createContentEditor = function( targetElements, customSettings ) {
        if (!targetElements) return;

        const targets = Array.isArray(targetElements) ? targetElements : [targetElements];

        if (typeof visualEditorConfigurator === 'undefined' || typeof quickTagManager === 'undefined' || typeof essentialVariables === 'undefined') {
            console.warn('Required global variables (tinyMCEPreInit, QTags, ap_vars) are not loaded. Editor cannot be initialized.');
            return targets;
        }

        const effectiveSettings = combineRecursive({}, baseConfiguration);
        if (visualEditorConfigurator.mceInit && visualEditorConfigurator.mceInit['initialEditorId']) {
            combineRecursive(effectiveSettings.tinySettings, visualEditorConfigurator.mceInit['initialEditorId']);
        }
        combineRecursive(effectiveSettings, customSettings);

        targets.forEach(element => {
            if (!(element instanceof HTMLTextAreaElement)) {
                console.warn('Element must be a textarea:', element);
                return;
            }

            const currentElementId = element.id;
            if (!currentElementId) {
                console.warn('Textarea must have an ID to be initialized as an editor.', element);
                return;
            }

            const elementTinySettings = combineRecursive({}, effectiveSettings.tinySettings);

            const replaceIdInObject = (obj, oldId, newId) => {
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const value = obj[key];
                        if (typeof value === 'string') {
                            obj[key] = value.split(oldId).join(newId);
                        } else if (isObject(value)) {
                            replaceIdInObject(value, oldId, newId);
                        } else if (Array.isArray(value)) {
                            value.forEach(item => {
                                if (isObject(item)) replaceIdInObject(item, oldId, newId);
                            });
                        }
                    }
                }
            };
            replaceIdInObject(elementTinySettings, 'initialEditorId', currentElementId);

            effectiveSettings.displayMode = effectiveSettings.displayMode === 'tmce' ? 'tmce' : 'html';

            visualEditorConfigurator.mceInit[currentElementId] = elementTinySettings;

            element.classList.add('wp-editor-area');
            element.style.display = '';

            let activeElement = element;

            const existingWrap = element.closest('.wp-editor-wrap');
            if (existingWrap) {
                const parentOfWrap = existingWrap.parentElement;
                const clonedOriginal = element.cloneNode(true);
                existingWrap.remove();
                if (parentOfWrap) { // Ensure parent exists before inserting
                    parentOfWrap.insertBefore(clonedOriginal, parentOfWrap.querySelector(`#${currentElementId}`));
                }
                activeElement = clonedOriginal;
            }

            const mainWrapper = document.createElement('div');
            mainWrapper.id = `wp-${currentElementId}-wrap`;
            mainWrapper.classList.add('wp-core-ui', 'wp-editor-wrap', `${effectiveSettings.displayMode}-active`);

            const editorToolsDiv = document.createElement('div');
            editorToolsDiv.id = `wp-${currentElementId}-editor-tools`;
            editorToolsDiv.classList.add('wp-editor-tools', 'hide-if-no-js');

            const editorTabsDiv = document.createElement('div');
            editorTabsDiv.classList.add('wp-editor-tabs');

            const htmlSwitchLink = document.createElement('a');
            htmlSwitchLink.id = `${currentElementId}-html`;
            htmlSwitchLink.classList.add('wp-switch-editor', 'switch-html');
            htmlSwitchLink.href = '#';
            htmlSwitchLink.textContent = 'Text';
            htmlSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                editorSwitcher.switchto(e.currentTarget);
            });

            const tmceSwitchLink = document.createElement('a');
            tmceSwitchLink.id = `${currentElementId}-tmce`;
            tmceSwitchLink.classList.add('wp-switch-editor', 'switch-tmce');
            tmceSwitchLink.href = '#';
            tmceSwitchLink.textContent = 'Visual';
            tmceSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                editorSwitcher.switchto(e.currentTarget);
            });

            const mediaButtonsDiv = document.createElement('div');
            mediaButtonsDiv.id = `wp-${currentElementId}-media-buttons`;
            mediaButtonsDiv.classList.add('wp-media-buttons');

            const insertMediaButton = document.createElement('a');
            insertMediaButton.href = '#';
            insertMediaButton.id = 'insert-media-button';
            insertMediaButton.classList.add('button', 'insert-media', 'add_media');
            insertMediaButton.dataset.editor = currentElementId;
            insertMediaButton.title = 'Add Media';
            const mediaIconSpan = document.createElement('span');
            mediaIconSpan.classList.add('wp-media-buttons-icon');
            insertMediaButton.appendChild(mediaIconSpan);
            insertMediaButton.appendChild(document.createTextNode(' Add Media'));

            const editorContainerDiv = document.createElement('div');
            editorContainerDiv.id = `wp-${currentElementId}-editor-container`;
            editorContainerDiv.classList.add('wp-editor-container');

            mediaButtonsDiv.appendChild(insertMediaButton);
            editorToolsDiv.appendChild(mediaButtonsDiv);

            editorTabsDiv.appendChild(htmlSwitchLink);
            editorTabsDiv.appendChild(tmceSwitchLink);
            editorToolsDiv.appendChild(editorTabsDiv);

            mainWrapper.appendChild(editorToolsDiv);
            mainWrapper.appendChild(editorContainerDiv);

            const clonedArea = activeElement.cloneNode(true);
            clonedArea.classList.add('wp-editor-area');
            editorContainerDiv.appendChild(clonedArea);

            const contentCssUrls = elementTinySettings.content_css ? elementTinySettings.content_css.split(',') : [];
            contentCssUrls.forEach(cssUrl => {
                if (!document.head.querySelector(`link[href="${cssUrl}"]`)) {
                    const linkElement = document.createElement('link');
                    linkElement.rel = 'stylesheet';
                    linkElement.type = 'text/css';
                    linkElement.href = cssUrl;
                    document.head.appendChild(linkElement);
                }
            });

            if (!document.head.querySelector(`link[id="editor-buttons-css"]`)) {
                const editorButtonsLink = document.createElement('link');
                editorButtonsLink.rel = 'stylesheet';
                editorButtonsLink.id = 'editor-buttons-css';
                editorButtonsLink.href = essentialVariables.includes_url + 'css/editor.css';
                editorButtonsLink.type = 'text/css';
                editorButtonsLink.media = 'all';
                document.head.appendChild(editorButtonsLink);
            }
            
            if (activeElement.parentNode) {
                activeElement.parentNode.insertBefore(mainWrapper, activeElement);
                activeElement.remove();
            }

            new quickTagManager(currentElementId);
            quickTagManager._buttonsInit();
            editorSwitcher.go(currentElementId, effectiveSettings.displayMode);

            mainWrapper.addEventListener('click', (event) => {
                if (event.target && event.target.matches('.insert-media')) {
                    const triggeringElement = event.target;
                    const editorTargetId = triggeringElement.dataset.editor;
                    const mediaOptions = {
                        frame:    'post',
                        state:    'insert',
                        title:    globalScope.wp.media.view.l10n.addMedia,
                        multiple: true
                    };

                    event.preventDefault();
                    triggeringElement.blur();

                    if (triggeringElement.classList.contains('gallery')) {
                        mediaOptions.state = 'gallery';
                        mediaOptions.title = globalScope.wp.media.view.l10n.createGalleryTitle;
                    }

                    globalScope.wp.media.editor.open( editorTargetId, mediaOptions );
                }
            });
        });

        return targets;
    };

})( window );