class RichTextProcessor {
    constructor(inputSelector, configurationSettings = {}) {
        this.configuration = configurationSettings;
        this.cloudUploadConfiguration = configurationSettings.cloudUploads || null;

        const targetElements = Array.from(document.querySelectorAll(inputSelector));
        targetElements.forEach(element => this.setupEditorInstance(element));
    }

    setupEditorInstance(hostElement) {
        if (!(hostElement instanceof HTMLTextAreaElement)) {
            console.warn('RichTextProcessor expects a TEXTAREA element.');
            return;
        }

        const componentIdentifier = hostElement.id || `editor-${Math.random().toString(36).substring(2, 11)}`;
        hostElement.id = componentIdentifier;

        const editorInstance = CodeMirror.fromTextArea(hostElement, {
            mode: 'markdown',
            lineNumbers: true,
            lineWrapping: true,
            theme: "default",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        });

        hostElement._embeddedEditor = editorInstance; // Store reference

        editorInstance.on('change', () => {
            hostElement.value = editorInstance.getValue(); // Update the textarea's value
        });

        const actionDispatchMap = new Map();
        actionDispatchMap.set('insert-text', (triggerButton) => {
            editorInstance.replaceSelection(triggerButton.dataset.prefix + editorInstance.getSelection());
            if (triggerButton.dataset.suffix) {
                editorInstance.replaceSelection(triggerButton.dataset.suffix, 'start');
            }
        });
        actionDispatchMap.set('insert-web-link', () => {
            const hyperlink = window.prompt('Provide a URL:');
            if (hyperlink) {
                editorInstance.replaceSelection(`[${hyperlink}](${hyperlink})`);
            }
        });
        actionDispatchMap.set('insert-media-link', () => {
            const mediaUrl = window.prompt('Enter a video URL (e.g., https://www.youtube.com/watch?v=bGutVrdL3M8):');
            if (mediaUrl) {
                editorInstance.replaceSelection(`\n${mediaUrl}\n\n`);
            }
        });
        actionDispatchMap.set('insert-graphic', (triggerButton) => {
            const associatedFileInputId = triggerButton.closest('[data-component-id]').dataset.componentId + '-file-uploader';
            document.getElementById(associatedFileInputId)?.click();
        });

        const controlPanel = document.querySelector(`.editor-control-panel[data-component-id="${componentIdentifier}"]`);
        if (controlPanel) {
            controlPanel.addEventListener('click', (event) => {
                const clickedButton = event.target.closest('.action-button');
                if (clickedButton) {
                    const actionType = clickedButton.dataset.actionType || 'insert-text';
                    const handlerFunction = actionDispatchMap.get(actionType);
                    if (handlerFunction) {
                        handlerFunction(clickedButton);
                        editorInstance.focus();
                        event.preventDefault();
                    }
                }
            });
        }

        const previewActivationButton = document.querySelector(`.view-toggle-button[data-component-id="${componentIdentifier}"]`);
        const renderedPreviewArea = document.querySelector(`.markdown-display-area[data-component-id="${componentIdentifier}"]`);

        if (previewActivationButton && renderedPreviewArea) {
            renderedPreviewArea.classList.add('hidden-segment'); // Initialize hidden

            previewActivationButton.addEventListener('click', (event) => {
                const editorVisualWrapper = editorInstance.getWrapperElement();
                editorVisualWrapper.classList.toggle('hidden-segment');
                renderedPreviewArea.classList.toggle('hidden-segment');

                if (!renderedPreviewArea.classList.contains('hidden-segment')) {
                    renderedPreviewArea.innerHTML = marked(editorInstance.getValue());
                }
                event.preventDefault();
            });
        }

        if (this.cloudUploadConfiguration && this.cloudUploadConfiguration.cloudName && this.cloudUploadConfiguration.uploadPreset) {
            this.prepareCloudUpload(hostElement, editorInstance, this.cloudUploadConfiguration);
        }
    }

    prepareCloudUpload(linkedElement, editorReference, cloudSettings) {
        const uploaderId = linkedElement.id + '-file-uploader';
        const uploaderForm = document.createElement('form');
        uploaderForm.enctype = 'multipart/form-data';
        uploaderForm.style.display = 'none';

        const fileInputElement = document.createElement('input');
        fileInputElement.type = 'file';
        fileInputElement.name = 'file';
        fileInputElement.id = uploaderId;
        fileInputElement.multiple = true;
        fileInputElement.dataset.componentId = linkedElement.id;

        uploaderForm.appendChild(fileInputElement);
        document.body.appendChild(uploaderForm);

        fileInputElement.addEventListener('change', async (event) => {
            const uploadedFile = event.target.files[0];
            if (!uploadedFile) return;

            const uploadDestination = `https://api.cloudinary.com/v1_1/${cloudSettings.cloudName}/image/upload`;
            const uploadPayload = new FormData();
            uploadPayload.append('file', uploadedFile);
            uploadPayload.append('upload_preset', cloudSettings.uploadPreset);
            uploadPayload.append('tags', 'browser_uploads');

            try {
                const networkResponse = await fetch(uploadDestination, {
                    method: 'POST',
                    body: uploadPayload
                });

                if (!networkResponse.ok) {
                    throw new Error(`Upload operation failed: ${networkResponse.statusText}`);
                }

                const responseData = await networkResponse.json();
                const constructedImageUrl = `https://res.cloudinary.com/${cloudSettings.cloudName}/image/upload/${responseData.public_id}`;
                editorReference.replaceSelection(`![](${constructedImageUrl})\n`);
                editorReference.focus();
            } catch (issue) {
                console.error('Cloudinary upload issue:', issue);
                alert('Image upload encountered an error. Please try again.');
            } finally {
                fileInputElement.value = ''; // Reset file input
            }
        });
    }
}