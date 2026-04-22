const highlightMediaAsset = (triggerEl) => {
    let currentTarget = null;
    if (typeof triggerEl === 'string') {
        currentTarget = document.getElementById(triggerEl) || document.querySelector(triggerEl);
    } else {
        currentTarget = triggerEl;
    }

    if (!currentTarget) {
        console.warn('Highlight trigger element not found.');
        return;
    }

    const parentList = currentTarget.closest('ul');
    if (parentList) {
        const allItems = parentList.querySelectorAll('li');
        allItems.forEach(item => {
            if (item.classList.contains('active-display')) {
                item.classList.remove('active-display');
            }
        });
    }

    const containingListItem = currentTarget.closest('li');
    if (containingListItem) {
        containingListItem.classList.add('active-display');
    } else {
        console.log('No parent list item found for selection.');
    }
};

const activateThumbnail = (triggerElement) => {
    let referenceNode = triggerElement;
    if (typeof triggerElement === 'string') {
        referenceNode = document.getElementById(triggerElement);
    }
    if (!referenceNode) {
        console.error('Thumbnail trigger element missing.');
        return;
    }

    const targetSize = referenceNode.getAttribute('href')?.split('#')[1] || 'large';
    let currentImageElement = null;

    const ancestorListItem = referenceNode.closest('li');
    if (ancestorListItem) {
        ancestorListItem.classList.remove('active-display');
        currentImageElement = ancestorListItem.querySelector('img');
    }

    if (!currentImageElement) {
        console.error('Associated image element not found for thumbnail.');
        return;
    }

    const originalSource = currentImageElement.src;
    const newSource = originalSource.replace(/_thumb\./, `${targetSize}.`);
    const imageAltText = currentImageElement.alt || 'Image description';

    integrateSelectedAsset(newSource, imageAltText);
};

const handleUploadCompletion = async (uploadedUrl, descriptiveAlt, resourceIdentifier) => {
    const feedbackArea = document.getElementById('media_upload_status_display');
    if (feedbackArea) {
        feedbackArea.innerHTML = '';
        const uploadInfo = document.createElement('p');
        uploadInfo.textContent = `Upload successful for ID: ${resourceIdentifier || 'N/A'}. URL: ${uploadedUrl}`;
        feedbackArea.appendChild(uploadInfo);
    }

    try {
        const response = await fetch('/image_management_api/gallery_data?page=1', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Gallery data refreshed:', data);
        updateImageGallery(data);
    } catch (error) {
        console.error('Failed to refresh gallery:', error);
        if (feedbackArea) {
            feedbackArea.innerHTML += `<p style="color:red;">Error refreshing gallery: ${error.message}</p>`;
        }
    }
};

function updateImageGallery(galleryData) {
    const galleryList = document.getElementById('media_asset_gallery');
    if (galleryList) {
        galleryList.innerHTML = '';
        if (galleryData && Array.isArray(galleryData.images)) {
            galleryData.images.forEach(img => {
                const li = document.createElement('li');
                li.innerHTML = `<img src="${img.thumbnail}" alt="${img.alt}" data-id="${img.id}" />`;
                galleryList.appendChild(li);
            });
        } else {
            galleryList.innerHTML = '<p>No images found or invalid gallery data.</p>';
        }
    }
}

const integrateSelectedAsset = (assetURL, assetAlt) => {
    const imageDialogForm = getEditorFormReference();
    if (!imageDialogForm) {
        console.error('Editor form not found.');
        return;
    }

    imageDialogForm.elements?.sourcePathField?.value && (imageDialogForm.elements.sourcePathField.value = assetURL);
    imageDialogForm.elements?.alternativeDescription?.value && (imageDialogForm.elements.alternativeDescription.value = assetAlt);

    if (typeof editorTabController !== 'undefined' && editorTabController.displayPanel) {
        editorTabController.displayPanel('main_content_tab', 'main_content_panel');
    } else {
        console.warn('Editor tab controller not available.');
    }

    if (typeof mediaPreviewHandler !== 'undefined' && mediaPreviewHandler.displayAssetPreview) {
        mediaPreviewHandler.displayAssetPreview(assetURL);
    } else {
        console.warn('Media preview handler not available.');
    }
};

const getEditorFormReference = () => {
    const specificForm = document.getElementById('image_editor_config_form');
    if (specificForm) {
        return specificForm;
    }
    if (document.forms.length > 1) {
        return document.forms[1];
    }
    console.error('Could not locate the image editor configuration form.');
    return null;
};

const initializeEditorUpload = () => {
    const galleryDisplayArea = document.getElementById('media_asset_gallery');
    if (galleryDisplayArea) {
        galleryDisplayArea.innerHTML = `
            <span>Processing upload...</span><br />
            <img src='/assets/common/loading_spinner.gif' alt='Loading' style='width: 24px; height: 24px;' />
        `;
    }

    if (typeof editorTabController !== 'undefined' && editorTabController.displayPanel) {
        editorTabController.displayPanel('asset_selection_tab', 'asset_selection_panel');
    }

    const uploadFrameId = 'content_editor_asset_upload_frame';
    let hiddenUploadFrame = document.getElementById(uploadFrameId);

    if (!hiddenUploadFrame) {
        hiddenUploadFrame = createDomElement('iframe', uploadFrameId);
        hiddenUploadFrame.src = 'about:blank';
        Object.assign(hiddenUploadFrame.style, {
            border: '0',
            position: 'absolute',
            width: '1px',
            height: '1px',
            visibility: 'hidden'
        });

        const uploadContainer = document.getElementById('asset-upload-interface');
        uploadContainer?.appendChild(hiddenUploadFrame) || console.error('Upload container element not found.');
    } else {
        console.log('Hidden upload iframe already exists.');
    }

    const uploadFormElement = document.getElementById('asset_upload_form_element');
    if (uploadFormElement) {
        uploadFormElement.action = getUploadServiceEndpoint();
        uploadFormElement.method = 'POST';
        uploadFormElement.enctype = 'multipart/form-data';
    } else {
        console.error('Upload form element not found.');
    }
};

const getUploadServiceEndpoint = () => {
    const apiBase = window.appConfig?.apiEndpoints?.imageUpload || '/api/media/upload';
    return apiBase;
};

const createDomElement = (tagName, idName, attributes = {}) => {
    if (!tagName || typeof tagName !== 'string') {
        console.error('Invalid tag name provided for DOM element creation.');
        return null;
    }
    const newElement = document.createElement(tagName);

    idName && (newElement.id = idName);

    for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
            newElement.setAttribute(key, attributes[key]);
        }
    }
    return newElement;
};

// Mock or renamed TinyMCEPopup and editor context for standalone execution
const editorDialogUtils = {
    getEditorInstance: () => {
        return window.tinymce && window.tinymce.activeEditor ? window.tinymce.activeEditor : {
            dom: {
                get: (id) => document.getElementById(id),
                getAttrib: (el, attr) => el?.getAttribute(attr),
                setAttribs: (el, attrs) => {
                    const target = typeof el === 'string' ? document.getElementById(el) : el;
                    if (target) {
                        for (const key in attrs) {
                            if (attrs[key] !== null && attrs[key] !== undefined) {
                                target.setAttribute(key, attrs[key]);
                            }
                        }
                    }
                },
                setAttrib: (el, attr, value) => {
                    const target = typeof el === 'string' ? document.getElementById(el) : el;
                    if (target) target.setAttribute(attr, value);
                },
                getStyle: (el, style) => el?.style?.[style.replace(/-([a-z])/g, (g) => g[1].toUpperCase())],
                setStyle: (el, style, value) => {
                    if (el?.style) el.style[style.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value;
                },
                create: (tag, attrs) => {
                    const el = document.createElement(tag);
                    for (const key in attrs) el.setAttribute(key, attrs[key]);
                    return el;
                },
                serializeStyle: (styleStr) => styleStr,
                parseStyle: (styleStr) => styleStr,
                remove: (el) => el?.parentNode?.removeChild(el),
                getParent: (id, tagName) => {
                    let el = document.getElementById(id);
                    while (el && el.tagName !== tagName.toUpperCase()) {
                        el = el.parentNode;
                    }
                    return el;
                },
                getClasses: () => [{ title: 'Custom Class 1', 'class': 'custom-class-1' }, { title: 'Custom Class 2', 'class': 'custom-class-2' }]
            },
            selection: {
                getNode: () => window.tinymce?.activeEditor?.selection?.getNode() || null
            },
            settings: {
                inline_styles: true
            },
            documentBaseURI: {
                toAbsolute: (url) => {
                    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
                    const base = window.location.origin;
                    return new URL(url, base).href;
                }
            },
            getLang: (key) => {
                const lang = {
                    'update': 'Update',
                    'image_dialog.alt_text_required': 'You must enter an alternative text for the image for accessibility reasons. Do you want to continue without it?'
                };
                return lang[key] || `[${key} - localized]`;
            },
            getParam: (key, defaultValue) => {
                const params = {
                    "constrain_proportions_default": true,
                    "accessibility_validation_enabled": 1,
                    "update_dimensions_on_asset_change": true,
                    "external_image_list_url": null,
                    "advanced_style_definitions": "Class 1=class1;Class 2=class2"
                };
                return params[key] !== undefined ? params[key] : defaultValue;
            },
            execCommand: (cmd, ui, val, args) => console.log(`Editor Command: ${cmd}, Value: ${val}, Args:`, args),
            undoManager: { add: () => console.log('Undo state added.') },
            windowManager: {
                confirm: (message, callback) => {
                    if (window.confirm(message)) {
                        callback(true);
                    }
                }
            },
            getWin: () => window
        };
    },
    loadLanguagePack: () => console.log('Language pack loaded.'),
    getDialogParameter: (key, defaultValue) => {
        return editorDialogUtils.getEditorInstance().getParam(key, defaultValue);
    },
    adjustDialogSize: () => console.log('Dialog size adjusted.'),
    closeDialogWindow: () => console.log('Dialog window closed.'),
    getLocalizedText: (key) => editorDialogUtils.getEditorInstance().getLang(key),
    onInit: {
        callbacks: [],
        add: function(func, scope) {
            this.callbacks.push({ func, scope });
        },
        fire: function(ed) {
            this.callbacks.forEach(({ func, scope }) => func.call(scope, ed));
        }
    }
};

// Global for image list data (renamed from tinyMCEImageList)
window.imageGalleryData = [
    ["Small Image", "/images/small_image.jpg"],
    ["Medium Image", "/images/medium_image.jpg"],
    ["Large Image", "/images/large_image.jpg"]
];

// Mock tinymce object if not present
if (typeof tinymce === 'undefined') {
    window.tinymce = {
        isWebKit: navigator.userAgent.includes('WebKit'),
        activeEditor: editorDialogUtils.getEditorInstance()
    };
}

const editorTabController = {
    displayPanel: (tabId, panelId) => console.log(`Displaying tab: ${tabId}, panel: ${panelId}`)
};

const mediaPreviewHandler = {
    displayAssetPreview: (url) => mediaAssetManager.displayAssetPreview(url)
};


const mediaAssetManager = {
    cachedImageForCalculations: null,

    prepareInitialization: function() {
        let externalScriptUrl;
        editorDialogUtils.loadLanguagePack();

        if (externalScriptUrl = editorDialogUtils.getDialogParameter("external_image_list_url")) {
            const scriptEl = document.createElement('script');
            scriptEl.language = 'javascript';
            scriptEl.type = 'text/javascript';
            scriptEl.src = editorDialogUtils.getEditorInstance().documentBaseURI.toAbsolute(externalScriptUrl);
            document.head.appendChild(scriptEl);
        }
    },

    initialize: function(editorInstance) {
        const dialogForm = getEditorFormReference();
        if (!dialogForm) {
            console.error('Dialog form not available during initialization.');
            return;
        }

        const formElements = dialogForm.elements;
        const currentEditor = editorInstance;
        const domHandler = currentEditor.dom;
        const selectedNode = currentEditor.selection.getNode();

        editorDialogUtils.adjustDialogSize();
        this.populateStyleClasses('style_category_list');
        this.populateAssetList('source_asset_list', window.imageGalleryData);
        this.populateAssetList('hover_effect_list', window.imageGalleryData);
        this.populateAssetList('mouseout_effect_list', window.imageGalleryData);

        if (selectedNode && selectedNode.nodeName === 'IMG') {
            formElements.sourcePathField.value = domHandler.getAttrib(selectedNode, 'src');
            formElements.imageWidth.value = domHandler.getAttrib(selectedNode, 'width');
            formElements.imageHeight.value = domHandler.getAttrib(selectedNode, 'height');
            formElements.alternativeDescription.value = domHandler.getAttrib(selectedNode, 'alt');
            formElements.imageTitle.value = domHandler.getAttrib(selectedNode, 'title');
            formElements.verticalPadding.value = this.retrieveAttributeValue(selectedNode, 'vspace');
            formElements.horizontalPadding.value = this.retrieveAttributeValue(selectedNode, 'hspace');
            formElements.imageBorder.value = this.retrieveAttributeValue(selectedNode, 'border');

            setSelectOption(formElements.alignment_option, this.retrieveAttributeValue(selectedNode, 'align'));
            setSelectOption(formElements.style_category_list, domHandler.getAttrib(selectedNode, 'class'));
            formElements.inlineStyle.value = domHandler.getAttrib(selectedNode, 'style');
            formElements.elementId.value = domHandler.getAttrib(selectedNode, 'id');

            formElements.actionButton.value = currentEditor.getLang('update');

            const hoverSrcAttr = domHandler.getAttrib(selectedNode, 'onmouseover');
            if (hoverSrcAttr && hoverSrcAttr.includes("this.src='") && hoverSrcAttr.includes("';")) {
                formElements.hoverImagePath.value = hoverSrcAttr.match(/this\.src='([^']+)'/)?.[1] || '';
            }
            const outSrcAttr = domHandler.getAttrib(selectedNode, 'onmouseout');
            if (outSrcAttr && outSrcAttr.includes("this.src='") && outSrcAttr.includes("';")) {
                formElements.mouseoutImagePath.value = outSrcAttr.match(/this\.src='([^']+)'/)?.[1] || '';
            }

            if (currentEditor.settings.inline_styles) {
                domHandler.getAttrib(selectedNode, 'align') && this.applyInlineStyleUpdate('alignment');
                domHandler.getAttrib(selectedNode, 'hspace') && this.applyInlineStyleUpdate('horizontalSpacing');
                domHandler.getAttrib(selectedNode, 'border') && this.applyInlineStyleUpdate('borderStyle');
                domHandler.getAttrib(selectedNode, 'vspace') && this.applyInlineStyleUpdate('verticalSpacing');
            }
        }

        const srcBrowserContainer = document.getElementById('source_browser_wrapper');
        if (srcBrowserContainer) {
            const srcInput = document.getElementById('sourcePathField');
            if (srcInput && srcBrowserContainer.style.display !== 'none') {
                srcInput.style.width = 'calc(100% - 70px)';
            }
        }

        if (editorDialogUtils.getDialogParameter("constrain_proportions_default", true)) {
            formElements.maintain_aspect_ratio.checked = true;
        }

        const hasHoverEffect = formElements.hoverImagePath.value || formElements.mouseoutImagePath.value;
        this.configureHoverImage(!!hasHoverEffect);

        this.adjustVisualProperties();
        this.displayAssetPreview(formElements.sourcePathField.value, true);
    },

    confirmSelection: function(fileInfo, contentTitle) {
        const currentEditor = editorDialogUtils.getEditorInstance();
        const dialogForm = getEditorFormReference();
        if (!dialogForm) {
            console.error('Dialog form not found for insertion.');
            return;
        }

        if (!dialogForm.elements.sourcePathField.value || dialogForm.elements.sourcePathField.value.trim() === '') {
            if (currentEditor.selection.getNode()?.nodeName === 'IMG') {
                currentEditor.dom.remove(currentEditor.selection.getNode());
                currentEditor.execCommand('mceRepaint');
            }
            editorDialogUtils.closeDialogWindow();
            return;
        }

        if (editorDialogUtils.getDialogParameter("accessibility_validation_enabled", 1)) {
            if (!dialogForm.elements.alternativeDescription.value || dialogForm.elements.alternativeDescription.value.trim() === '') {
                currentEditor.windowManager.confirm(
                    editorDialogUtils.getLocalizedText('image_dialog.alt_text_required'),
                    (userConfirmed) => {
                        if (userConfirmed) {
                            this.finalizeInsertion();
                        }
                    }
                );
                return;
            }
        }

        this.finalizeInsertion();
    },

    finalizeInsertion: function() {
        const currentEditor = editorDialogUtils.getEditorInstance();
        const dialogForm = getEditorFormReference();
        if (!dialogForm) {
            console.error('Dialog form not found for final insertion.');
            return;
        }
        const formElements = dialogForm.elements;
        const domHandler = currentEditor.dom;

        if (typeof tinymce !== 'undefined' && tinymce.isWebKit) {
            currentEditor.getWin().focus();
        }

        let attributesToSet = {};
        let currentElement = currentEditor.selection.getNode();

        if (!currentEditor.settings.inline_styles) {
            attributesToSet = {
                'data-vertical-spacing': formElements.verticalPadding.value,
                'data-horizontal-spacing': formElements.horizontalPadding.value,
                'data-border-size': formElements.imageBorder.value,
                'data-alignment': getSelectOptionValue(formElements.alignment_option)
            };
        } else {
            attributesToSet = {
                'data-vertical-spacing': '',
                'data-horizontal-spacing': '',
                'data-border-size': '',
                'data-alignment': ''
            };
        }

        Object.assign(attributesToSet, {
            src: formElements.sourcePathField.value,
            width: formElements.imageWidth.value,
            height: formElements.imageHeight.value,
            alt: formElements.alternativeDescription.value,
            title: formElements.imageTitle.value,
            class: getSelectOptionValue(formElements.style_category_list),
            style: formElements.inlineStyle.value
        });

        if (currentElement && currentElement.nodeName === 'IMG') {
            domHandler.setAttribs(currentElement, attributesToSet);
        } else {
            const tempId = '__editor_temp_image_placeholder';
            currentEditor.execCommand('mceInsertContent', false, `<img id="${tempId}" src="javascript:;" />`, { skip_undo: 1 });
            domHandler.setAttribs(tempId, attributesToSet);
            domHandler.setAttrib(tempId, 'id', '');
            currentEditor.undoManager.add();
        }

        editorDialogUtils.closeDialogWindow();
    },

    retrieveAttributeValue: function(domElement, attributeName) {
        const currentEditor = editorDialogUtils.getEditorInstance();
        const domHandler = currentEditor.dom;
        let retrievedValue, secondaryValue;

        if (currentEditor.settings.inline_styles) {
            switch (attributeName) {
                case 'align':
                    if (retrievedValue = domHandler.getStyle(domElement, 'float')) return retrievedValue;
                    if (retrievedValue = domHandler.getStyle(domElement, 'vertical-align')) return retrievedValue;
                    break;

                case 'hspace':
                    retrievedValue = domHandler.getStyle(domElement, 'margin-left');
                    secondaryValue = domHandler.getStyle(domElement, 'margin-right');
                    if (retrievedValue && retrievedValue === secondaryValue) {
                        return parseInt(retrievedValue.replace(/[^0-9]/g, ''), 10);
                    }
                    break;

                case 'vspace':
                    retrievedValue = domHandler.getStyle(domElement, 'margin-top');
                    secondaryValue = domHandler.getStyle(domElement, 'margin-bottom');
                    if (retrievedValue && retrievedValue === secondaryValue) {
                        return parseInt(retrievedValue.replace(/[^0-9]/g, ''), 10);
                    }
                    break;

                case 'border':
                    retrievedValue = 0;
                    const borderSides = ['top', 'right', 'bottom', 'left'];
                    let borderMismatch = false;

                    for (const side of borderSides) {
                        const currentBorderWidth = domHandler.getStyle(domElement, `border-${side}-width`);
                        if (!currentBorderWidth || (currentBorderWidth !== retrievedValue && retrievedValue !== 0)) {
                            retrievedValue = 0;
                            borderMismatch = true;
                            break;
                        }
                        if (currentBorderWidth) {
                            retrievedValue = currentBorderWidth;
                        }
                    }

                    if (retrievedValue && !borderMismatch) {
                        return parseInt(retrievedValue.replace(/[^0-9]/g, ''), 10);
                    }
                    break;
            }
        }

        if (retrievedValue = domHandler.getAttrib(domElement, attributeName)) {
            return retrievedValue;
        }

        return '';
    },

    configureHoverImage: function(enableHoverEffects) {
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements) return;
        const formElements = dialogForm.elements;

        formElements.enableHoverEffectCheckbox.checked = enableHoverEffects;
        formElements.hover_image_browser_btn.disabled = !enableHoverEffects;
        formElements.mouseout_image_browser_btn.disabled = !enableHoverEffects;

        formElements.hover_effect_list && (formElements.hover_effect_list.disabled = !enableHoverEffects);
        formElements.mouseout_effect_list && (formElements.mouseout_effect_list.disabled = !enableHoverEffects);

        formElements.hoverImagePath.disabled = !enableHoverEffects;
        formElements.mouseoutImagePath.disabled = !enableHoverEffects;
    },

    populateStyleClasses: function(targetSelectId) {
        const domHandler = editorDialogUtils.getEditorInstance().dom;
        const targetSelectElement = domHandler.get(targetSelectId);
        let classOptions;

        if (classOptions = editorDialogUtils.getDialogParameter('advanced_style_definitions')) {
            classOptions = classOptions.split(';').map(definition => {
                const parts = definition.split('=');
                return { title: parts[0], className: parts[1] };
            });
        } else {
            classOptions = editorDialogUtils.getEditorInstance().dom.getClasses();
        }

        if (classOptions.length > 0 && targetSelectElement) {
            targetSelectElement.options[targetSelectElement.options.length] = new Option(editorDialogUtils.getLocalizedText('option.not_set'), '');

            classOptions.forEach(option => {
                targetSelectElement.options[targetSelectElement.options.length] = new Option(option.title || option.className, option.className);
            });
        } else if (targetSelectElement) {
            const parentRow = domHandler.getParent(targetSelectId, 'tr');
            if (parentRow) domHandler.remove(parentRow);
        }
    },

    populateAssetList: function(targetSelectId, sourceList) {
        const domHandler = editorDialogUtils.getEditorInstance().dom;
        const targetSelectElement = domHandler.get(targetSelectId);

        if (sourceList && sourceList.length > 0 && targetSelectElement) {
            targetSelectElement.options[targetSelectElement.options.length] = new Option('', '');

            sourceList.forEach(asset => {
                targetSelectElement.options[targetSelectElement.options.length] = new Option(asset[0], asset[1]);
            });
        } else if (targetSelectElement) {
            const parentRow = domHandler.getParent(targetSelectId, 'tr');
            if (parentRow) domHandler.remove(parentRow);
        }
    },

    clearImageDimensions: function() {
        const dialogForm = getEditorFormReference();
        if (dialogForm?.elements) {
            dialogForm.elements.imageWidth.value = '';
            dialogForm.elements.imageHeight.value = '';
        }
    },

    updateImageMetadata: function(imageElement, isPreviewOnly) {
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements || !imageElement) return;

        if (!isPreviewOnly) {
            dialogForm.elements.imageWidth.value = imageElement.width;
            dialogForm.elements.imageHeight.value = imageElement.height;
        }

        this.cachedImageForCalculations = imageElement;
    },

    adjustVisualProperties: function() {
        const currentEditor = editorDialogUtils.getEditorInstance();
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements) return;
        const formElements = dialogForm.elements;
        const sampleImage = document.getElementById('alignment_sample_image');

        if (sampleImage) {
            if (currentEditor.getParam('inline_styles')) {
                currentEditor.dom.setAttrib(sampleImage, 'style', formElements.inlineStyle.value);
            } else {
                sampleImage.align = formElements.alignment_option.value;
                sampleImage.border = formElements.imageBorder.value;
                sampleImage.hspace = formElements.horizontalPadding.value;
                sampleImage.vspace = formElements.verticalPadding.value;
            }
        }
    },

    recalculateHeight: function() {
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements) return;
        const formElements = dialogForm.elements;

        if (!formElements.maintain_aspect_ratio.checked || !this.cachedImageForCalculations) {
            return;
        }

        if (!formElements.imageWidth.value || !formElements.imageHeight.value) {
            return;
        }

        const newWidth = parseInt(formElements.imageWidth.value, 10);
        const originalWidth = this.cachedImageForCalculations.width;
        const originalHeight = this.cachedImageForCalculations.height;

        if (isNaN(newWidth) || newWidth === 0 || originalWidth === 0) {
            console.warn('Invalid width or original image dimensions for height recalculation.');
            return;
        }

        const calculatedHeight = (newWidth / originalWidth) * originalHeight;
        formElements.imageHeight.value = calculatedHeight.toFixed(0);
    },

    recalculateWidth: function() {
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements) return;
        const formElements = dialogForm.elements;

        if (!formElements.maintain_aspect_ratio.checked || !this.cachedImageForCalculations) {
            return;
        }

        if (!formElements.imageWidth.value || !formElements.imageHeight.value) {
            return;
        }

        const newHeight = parseInt(formElements.imageHeight.value, 10);
        const originalWidth = this.cachedImageForCalculations.width;
        const originalHeight = this.cachedImageForCalculations.height;

        if (isNaN(newHeight) || newHeight === 0 || originalHeight === 0) {
            console.warn('Invalid height or original image dimensions for width recalculation.');
            return;
        }

        const calculatedWidth = (newHeight / originalHeight) * originalWidth;
        formElements.imageWidth.value = calculatedWidth.toFixed(0);
    },

    applyInlineStyleUpdate: function(styleCategory) {
        const domHandler = editorDialogUtils.getEditorInstance().dom;
        const dialogForm = getEditorFormReference();
        if (!dialogForm?.elements) return;
        const formElements = dialogForm.elements;

        const tempImage = domHandler.create('img', { style: formElements.inlineStyle.value });

        if (editorDialogUtils.getEditorInstance().settings.inline_styles) {
            let styleValue;

            switch (styleCategory) {
                case 'alignment':
                    domHandler.setStyle(tempImage, 'float', '');
                    domHandler.setStyle(tempImage, 'vertical-align', '');

                    styleValue = getSelectOptionValue(formElements.alignment_option);
                    if (styleValue) {
                        if (styleValue === 'left' || styleValue === 'right') {
                            domHandler.setStyle(tempImage, 'float', styleValue);
                        } else {
                            tempImage.style.verticalAlign = styleValue;
                        }
                    }
                    break;

                case 'borderStyle':
                    domHandler.setStyle(tempImage, 'border', '');
                    styleValue = formElements.imageBorder.value;
                    if (styleValue || styleValue === '0') {
                        tempImage.style.border = (styleValue === '0') ? '' : `${styleValue}px solid black`;
                    }
                    break;

                case 'horizontalSpacing':
                    domHandler.setStyle(tempImage, 'marginLeft', '');
                    domHandler.setStyle(tempImage, 'marginRight', '');

                    styleValue = formElements.horizontalPadding.value;
                    if (styleValue) {
                        tempImage.style.marginLeft = `${styleValue}px`;
                        tempImage.style.marginRight = `${styleValue}px`;
                    }
                    break;

                case 'verticalSpacing':
                    domHandler.setStyle(tempImage, 'marginTop', '');
                    domHandler.setStyle(tempImage, 'marginBottom', '');

                    styleValue = formElements.verticalPadding.value;
                    if (styleValue) {
                        tempImage.style.marginTop = `${styleValue}px`;
                        tempImage.style.marginBottom = `${styleValue}px`;
                    }
                    break;
                default:
                    console.warn(`Unknown style category for update: ${styleCategory}`);
            }

            formElements.inlineStyle.value = domHandler.serializeStyle(domHandler.parseStyle(tempImage.style.cssText));
        }
    },

    handleMouseInteraction: function() {
        console.log('Mouse interaction handler triggered (placeholder).');
    },

    displayAssetPreview: function(assetSource, isInitialLoad) {
        const previewContainer = document.getElementById('image_preview_display');
        if (!previewContainer) {
            console.error('Image preview container not found.');
            return;
        }

        if (!assetSource) {
            previewContainer.innerHTML = '';
            return;
        }

        if (!isInitialLoad && editorDialogUtils.getDialogParameter("update_dimensions_on_asset_change", true)) {
            this.clearImageDimensions();
        }

        const absoluteAssetSource = editorDialogUtils.getEditorInstance().documentBaseURI.toAbsolute(assetSource);

        const previewImageId = 'preview_image_element';
        const imageHtml = `<img id="${previewImageId}" src="${absoluteAssetSource}" alt="Preview" style="max-width: 100%; height: auto; border: 0;" />`;

        previewContainer.innerHTML = imageHtml;

        const previewImgElement = document.getElementById(previewImageId);
        if (previewImgElement) {
            if (!isInitialLoad) {
                previewImgElement.onload = () => this.updateImageMetadata(previewImgElement);
                previewImgElement.onerror = () => {
                    this.clearImageDimensions();
                    console.error('Failed to load preview image: ' + absoluteAssetSource);
                    previewContainer.innerHTML = '<p style="color:red;">Error loading image preview.</p>';
                };
            } else {
                previewImgElement.onload = () => this.updateImageMetadata(previewImgElement, true);
            }
        }
    }
};

// Helper functions for select elements
function setSelectOption(selectElement, valueToSelect) {
    if (!selectElement || !valueToSelect) return;
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === valueToSelect) {
            selectElement.selectedIndex = i;
            return;
        }
    }
}

function getSelectOptionValue(selectElement) {
    if (!selectElement || selectElement.selectedIndex === -1) return '';
    return selectElement.options[selectElement.selectedIndex].value;
}

// Initial setup and event listeners
mediaAssetManager.prepareInitialization();
editorDialogUtils.onInit.add(mediaAssetManager.initialize, mediaAssetManager);

document.addEventListener('DOMContentLoaded', () => {
    initializeEditorUpload();
    // Simulate TinyMCE editor being ready for the dialog if not actually loaded
    if (!window.tinymce || !window.tinymce.activeEditor) {
        editorDialogUtils.onInit.fire(editorDialogUtils.getEditorInstance());
    }
});