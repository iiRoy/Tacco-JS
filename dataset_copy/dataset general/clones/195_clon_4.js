(function(jq, richTextEngine) {
    "use strict";

    const getStyleAssetPath = () => {
        const fullUrl = window.location.href;
        const adminSegmentIndex = fullUrl.indexOf("admin");
        let baseUrl;
        if (adminSegmentIndex !== -1) {
            baseUrl = fullUrl.slice(0, adminSegmentIndex);
        } else {
            // Replicate original's behavior: remove the last character if "admin" isn't found
            baseUrl = fullUrl.slice(0, fullUrl.length - 1);
        }
        return baseUrl + "Admin/css/";
    };

    const styleSheetPath = getStyleAssetPath();

    const getButtonDimensionClass = (opts) => (opts && opts.dimension) ? ` action-button-${opts.dimension}` : '';

    const HtmlFragmentGenerators = {
        "font-formats": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li class='drop-menu'>
                    <a class='action-button drop-menu-toggle${btnDimension}' data-ui-toggle='dropdown' href='#'>
                        <i class='icon-font'></i>&nbsp;<span class='current-text-style'>${res.fontSettings.standard}</span>&nbsp;<b class='down-arrow'></b>
                    </a>
                    <ul class='drop-menu-list'>
                        <li><a data-cmd-action='formatBlock' data-cmd-value='div'>${res.fontSettings.standard}</a></li>
                        <li><a data-cmd-action='formatBlock' data-cmd-value='h1'>${res.fontSettings.heading1}</a></li>
                        <li><a data-cmd-action='formatBlock' data-cmd-value='h2'>${res.fontSettings.heading2}</a></li>
                        <li><a data-cmd-action='formatBlock' data-cmd-value='h3'>${res.fontSettings.heading3}</a></li>
                    </ul>
                </li>`;
        },

        "emphasis-styles": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li>
                    <div class='action-button-group'>
                        <a class='action-button${btnDimension}' data-cmd-action='bold' title='CTRL+B'>${res.textEmphasis.strong}</a>
                        <a class='action-button${btnDimension}' data-cmd-action='italic' title='CTRL+I'>${res.textEmphasis.emphasized}</a>
                        <a class='action-button${btnDimension}' data-cmd-action='underline' title='CTRL+U'>${res.textEmphasis.underlined}</a>
                    </div>
                </li>`;
        },

        "list-options": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li>
                    <div class='action-button-group'>
                        <a class='action-button${btnDimension}' data-cmd-action='insertUnorderedList' title='${res.listing.unordered}'><i class='icon-list'></i></a>
                        <a class='action-button${btnDimension}' data-cmd-action='insertOrderedList' title='${res.listing.ordered}'><i class='icon-th-list'></i></a>
                        <a class='action-button${btnDimension}' data-cmd-action='Outdent' title='${res.listing.reduceIndent}'><i class='icon-indent-right'></i></a>
                        <a class='action-button${btnDimension}' data-cmd-action='Indent' title='${res.listing.increaseIndent}'><i class='icon-indent-left'></i></a>
                    </div>
                </li>`;
        },

        "hyperlink": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li>
                    <div class='composer-link-dialog modal hide fade'>
                        <div class='modal-header'>
                            <a class='close' data-modal-dismiss='modal'>&times;</a>
                            <h3>${res.linkHandling.add}</h3>
                        </div>
                        <div class='modal-body'>
                            <input value='http://' class='composer-link-input input-xlarge'>
                        </div>
                        <div class='modal-footer'>
                            <a href='#' class='action-button' data-modal-dismiss='modal'>${res.linkHandling.cancel}</a>
                            <a href='#' class='action-button action-button-primary' data-modal-dismiss='modal'>${res.linkHandling.add}</a>
                        </div>
                    </div>
                    <a class='action-button${btnDimension}' data-cmd-action='createLink' title='${res.linkHandling.add}'><i class='icon-share'></i></a>
                </li>`;
        },

        "picture": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li>
                    <div class='composer-image-dialog modal hide fade'>
                        <div class='modal-header'>
                            <a class='close' data-modal-dismiss='modal'>&times;</a>
                            <h3>${res.imageHandling.add}</h3>
                        </div>
                        <div class='modal-body'>
                            <input value='http://' class='composer-image-input input-xlarge'>
                        </div>
                        <div class='modal-footer'>
                            <a href='#' class='action-button' data-modal-dismiss='modal'>${res.imageHandling.cancel}</a>
                            <a href='#' class='action-button action-button-primary' data-modal-dismiss='modal'>${res.imageHandling.add}</a>
                        </div>
                    </div>
                    <a class='action-button${btnDimension}' data-cmd-action='insertImage' title='${res.imageHandling.add}'><i class='icon-picture'></i></a>
                </li>`;
        },

        "raw-html": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            return `
                <li>
                    <div class='action-button-group'>
                        <a class='action-button${btnDimension}' data-tool-action='change_view' title='${res.htmlEdit.edit}'><i class='icon-pencil'></i></a>
                    </div>
                </li>`;
        },

        "color-picker": (res, opts) => {
            const btnDimension = getButtonDimensionClass(opts);
            const colorOptions = [
                { value: 'black', text: res.palette.black },
                { value: 'silver', text: res.palette.silver },
                { value: 'gray', text: res.palette.grey },
                { value: 'maroon', text: res.palette.maroon },
                { value: 'red', text: res.palette.red },
                { value: 'purple', text: res.palette.purple },
                { value: 'green', text: res.palette.green },
                { value: 'olive', text: res.palette.olive },
                { value: 'navy', text: res.palette.navy },
                { value: 'blue', text: res.palette.blue },
                { value: 'orange', text: res.palette.orange }
            ];
            const colorItems = colorOptions.map(color => `
                <li>
                    <div class='composer-color-swatch' data-cmd-value='${color.value}'></div>
                    <a class='composer-color-label' data-cmd-action='foreColor' data-cmd-value='${color.value}'>${color.text}</a>
                </li>
            `).join('');

            return `
                <li class='drop-menu'>
                    <a class='action-button drop-menu-toggle${btnDimension}' data-ui-toggle='dropdown' href='#'>
                        <span class='current-color-display'>${res.palette.black}</span>&nbsp;<b class='down-arrow'></b>
                    </a>
                    <ul class='drop-menu-list'>
                        ${colorItems}
                    </ul>
                </li>`;
        }
    };

    const generateHtmlFragment = (key, resources, opts) => {
        if (!HtmlFragmentGenerators[key]) {
            console.warn(`No HTML fragment generator found for key: ${key}`);
            return '';
        }
        return HtmlFragmentGenerators[key](resources, opts);
    };

    class ContentComposer {
        constructor(targetElement, configParameters) {
            this.targetElement = targetElement;
            const effectiveConfig = configParameters || defaultConfiguration;

            if (effectiveConfig.customElementGenerators) {
                Object.assign(HtmlFragmentGenerators, effectiveConfig.customElementGenerators);
            }

            this.controlPanel = this.constructControlPanel(targetElement, effectiveConfig);
            this.textProcessor = this.initializeTextProcessor(effectiveConfig);

            // Replaced window.editor, assuming plugin manages instance via .data()
            // If the external wysihtml5 library strictly requires window.editor, this might break.

            jq('iframe.composer-sandbox-frame').each((idx, frameEl) => {
                jq(frameEl.contentWindow).off('focus.composer').on({
                    'focus.composer': () => {
                        jq('li.drop-menu').removeClass('open');
                    }
                });
            });
        }

        initializeTextProcessor(config) {
            const editorConfig = config || {};
            editorConfig.controlPanel = this.controlPanel[0];

            const processor = new richTextEngine.Editor(this.targetElement[0], editorConfig);

            if (editorConfig && editorConfig.listeners) {
                for (const eventKey in editorConfig.listeners) {
                    processor.on(eventKey, editorConfig.listeners[eventKey]);
                }
            }
            return processor;
        }

        constructControlPanel(targetElement, config) {
            const instanceRef = this;
            const panelContainer = jq("<ul/>", {
                'class': "content-composer-panel",
                'style': "display:none"
            });
            const culture = config.language || defaultConfiguration.language || "en";
            const currentResources = translationSet[culture];

            for (const key in defaultConfiguration) {
                if (!defaultConfiguration.hasOwnProperty(key) || ['language', 'listeners', 'parserRules', 'stylesheets', 'customElementGenerators'].includes(key)) {
                    continue;
                }

                let shouldInclude = false;
                if (config.hasOwnProperty(key)) {
                    if (config[key] === true) {
                        shouldInclude = true;
                    }
                } else {
                    shouldInclude = defaultConfiguration[key];
                }

                if (shouldInclude === true) {
                    const fragment = generateHtmlFragment(key, currentResources, config);
                    if (fragment) {
                        panelContainer.append(fragment);

                        if (key === "raw-html") {
                            this.setupHtmlToggler(panelContainer);
                        }
                        if (key === "hyperlink") {
                            this.configureLinkInsertion(panelContainer);
                        }
                        if (key === "picture") {
                            this.configureImageInsertion(panelContainer);
                        }
                    }
                }
            }

            if (config.controlPanelElements) {
                for (const elementKey in config.controlPanelElements) {
                    if (config.controlPanelElements.hasOwnProperty(elementKey)) {
                        panelContainer.append(config.controlPanelElements[elementKey]);
                    }
                }
            }

            panelContainer.find("a[data-cmd-action='formatBlock']").on('click', function(evt) {
                const triggeredElement = jq(evt.target || evt.srcElement);
                instanceRef.controlPanel.find('.current-text-style').text(triggeredElement.html());
            });

            panelContainer.find("a[data-cmd-action='foreColor']").on('click', function(evt) {
                const triggeredElement = jq(evt.target || evt.srcElement);
                instanceRef.controlPanel.find('.current-color-display').text(triggeredElement.html());
            });

            targetElement.before(panelContainer);

            return panelContainer;
        }

        setupHtmlToggler(panel) {
            const viewToggleSelector = "a[data-tool-action='change_view']";
            panel.find(viewToggleSelector).on('click', (evt) => {
                panel.find('a.action-button').not(viewToggleSelector).toggleClass('disabled');
            });
        }

        configureImageInsertion(panel) {
            const instanceRef = this;
            const imageDialog = panel.find('.composer-image-dialog');
            const urlInput = imageDialog.find('.composer-image-input');
            const confirmButton = imageDialog.find('a.action-button-primary');
            const initialInputValue = urlInput.val();
            let selectionBookmark = null;

            const executeImageInsert = () => {
                const imageUrl = urlInput.val();
                urlInput.val(initialInputValue);
                instanceRef.textProcessor.currentView.element.focus();
                if (selectionBookmark) {
                    instanceRef.textProcessor.composer.selection.setBookmark(selectionBookmark);
                    selectionBookmark = null;
                }
                instanceRef.textProcessor.composer.commands.exec("insertImage", imageUrl);
            };

            urlInput.on('keypress', (evt) => {
                if (evt.which === 13) {
                    executeImageInsert();
                    imageDialog.modal('hide');
                }
            });

            confirmButton.on('click', executeImageInsert);

            imageDialog.on('shown', () => {
                urlInput.focus();
            });

            imageDialog.on('hide', () => {
                instanceRef.textProcessor.currentView.element.focus();
            });

            panel.find('a[data-cmd-action=insertImage]').on('click', function() {
                const isActive = jq(this).hasClass("cmd-active");

                if (!isActive) {
                    instanceRef.textProcessor.currentView.element.focus(false);
                    selectionBookmark = instanceRef.textProcessor.composer.selection.getBookmark();
                    imageDialog.modal('show');
                    imageDialog.on('click.dismiss.modal', '[data-modal-dismiss="modal"]', (evt) => {
                        evt.stopPropagation();
                    });
                    return false;
                } else {
                    return true;
                }
            });
        }

        configureLinkInsertion(panel) {
            const instanceRef = this;
            const linkDialog = panel.find('.composer-link-dialog');
            const urlInput = linkDialog.find('.composer-link-input');
            const confirmButton = linkDialog.find('a.action-button-primary');
            const initialInputValue = urlInput.val();
            let selectionBookmark = null;

            const executeLinkInsert = () => {
                const linkUrl = urlInput.val();
                urlInput.val(initialInputValue);
                instanceRef.textProcessor.currentView.element.focus();
                if (selectionBookmark) {
                    instanceRef.textProcessor.composer.selection.setBookmark(selectionBookmark);
                    selectionBookmark = null;
                }
                instanceRef.textProcessor.composer.commands.exec("createLink", {
                    href: linkUrl,
                    target: "_blank",
                    rel: "nofollow"
                });
            };

            urlInput.on('keypress', (evt) => {
                if (evt.which === 13) {
                    executeLinkInsert();
                    linkDialog.modal('hide');
                }
            });

            confirmButton.on('click', executeLinkInsert);

            linkDialog.on('shown', () => {
                urlInput.focus();
            });

            linkDialog.on('hide', () => {
                instanceRef.textProcessor.currentView.element.focus();
            });

            panel.find('a[data-cmd-action=createLink]').on('click', function() {
                const isActive = jq(this).hasClass("cmd-active");

                if (!isActive) {
                    instanceRef.textProcessor.currentView.element.focus(false);
                    selectionBookmark = instanceRef.textProcessor.composer.selection.getBookmark();
                    linkDialog.appendTo('body').modal('show'); // Original code appends link modal to body
                    linkDialog.on('click.dismiss.modal', '[data-modal-dismiss="modal"]', (evt) => {
                        evt.stopPropagation();
                    });
                    return false;
                } else {
                    return true;
                }
            });
        }
    }

    const pluginOperations = {
        resetAllConfigs: function() {
            jq.fn.textComposer.defaultConfiguration = jq.extend(true, {}, jq.fn.textComposer.originalConfigurationCache);
        },
        skipDefaultConfigs: function(options) {
            return this.each(function() {
                const currentElement = jq(this);
                currentElement.data('textComposer', new ContentComposer(currentElement, options));
            });
        },
        mergeConfigsShallow: function(options) {
            const settings = Object.assign({}, jq.fn.textComposer.defaultConfiguration, options || {});
            const self = this;
            return pluginOperations.skipDefaultConfigs.apply(self, [settings]);
        },
        mergeConfigsDeep: function(options) {
            const settings = jq.extend(true, {}, jq.fn.textComposer.defaultConfiguration, options || {});
            const self = this;
            return pluginOperations.skipDefaultConfigs.apply(self, [settings]);
        },
        initialize: function(options) {
            const self = this;
            return pluginOperations.mergeConfigsShallow.apply(self, [options]);
        }
    };

    jq.fn.textComposer = function(method) {
        if (pluginOperations[method]) {
            return pluginOperations[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return pluginOperations.initialize.apply(this, arguments);
        } else {
            jq.error('Operation ' + method + ' does not exist on jQuery.textComposer');
        }
    };

    jq.fn.textComposer.Constructor = ContentComposer;

    const defaultConfiguration = jq.fn.textComposer.defaultConfiguration = {
        "font-formats": true,
        "color-picker": false,
        "emphasis-styles": true,
        "list-options": true,
        "raw-html": false,
        "hyperlink": true,
        "picture": true,
        listeners: {},
        parserRules: {
            classes: {
                "composer-color-silver": 1,
                "composer-color-gray": 1,
                "composer-color-white": 1,
                "composer-color-maroon": 1,
                "composer-color-red": 1,
                "composer-color-purple": 1,
                "composer-color-fuchsia": 1,
                "composer-color-green": 1,
                "composer-color-lime": 1,
                "composer-color-olive": 1,
                "composer-color-yellow": 1,
                "composer-color-navy": 1,
                "composer-color-blue": 1,
                "composer-color-teal": 1,
                "composer-color-aqua": 1,
                "composer-color-orange": 1
            },
            tags: {
                "b": {},
                "i": {},
                "br": {},
                "ol": {},
                "ul": {},
                "li": {},
                "h1": {},
                "h2": {},
                "h3": {},
                "blockquote": {},
                "u": 1,
                "img": {
                    "check_attributes": {
                        "width": "numbers",
                        "alt": "alt",
                        "src": "url",
                        "height": "numbers"
                    }
                },
                "a": {
                    set_attributes: {
                        target: "_blank",
                        rel: "nofollow"
                    },
                    check_attributes: {
                        href: "url"
                    }
                },
                "span": 1,
                "div": 1
            }
        },
        stylesheets: [styleSheetPath + "wysiwyg-color.css"],
        language: "en"
    };

    if (typeof jq.fn.textComposer.originalConfigurationCache === 'undefined') {
        jq.fn.textComposer.originalConfigurationCache = jq.extend(true, {}, jq.fn.textComposer.defaultConfiguration);
    }

    const translationSet = jq.fn.textComposer.translationSet = {
        en: {
            fontSettings: {
                standard: "Standard text",
                heading1: "Main Heading",
                heading2: "Sub Heading",
                heading3: "Minor Heading"
            },
            textEmphasis: {
                strong: "Bold",
                emphasized: "Italic",
                underlined: "Underline"
            },
            listing: {
                unordered: "Bullet list",
                ordered: "Numbered list",
                reduceIndent: "Decrease indent",
                increaseIndent: "Increase indent"
            },
            linkHandling: {
                add: "Insert web link",
                cancel: "Dismiss"
            },
            imageHandling: {
                add: "Insert graphic",
                cancel: "Dismiss"
            },
            htmlEdit: {
                edit: "Modify HTML"
            },
            palette: {
                black: "Black",
                silver: "Silver",
                grey: "Gray",
                maroon: "Maroon",
                red: "Red",
                purple: "Purple",
                green: "Green",
                olive: "Olive",
                navy: "Navy",
                blue: "Blue",
                orange: "Orange"
            }
        }
    };

}(window.jQuery, window.wysihtml5));