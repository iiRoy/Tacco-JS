class ContentEditorManager {
    constructor(actionMap, configurationOptions) {
        this.actionMap = actionMap;
        this.settings = {
            onCommitSuccess: () => {},
            onDeletionSuccess: () => {},
            obtainElementIdentifier: (element) => element.dataset.itemId,
            captureElementContent: (element) => element.innerHTML,
            enableVisualEffects: true,
            displayColors: {
                successful: 'green',
                unsuccessful: 'red',
                normalText: ''
            },
            ...configurationOptions
        };

        this.originalContentRegistry = new Map();
        this.currentActiveEditors = 0;
        this.suppressEditActivation = false;

        this.initiateSystem();
    }

    initiateSystem() {
        const firstEditable = document.querySelector('[data-edit-type][data-item-id]');
        if (firstEditable && !this.settings.displayColors.normalText) {
            this.settings.displayColors.normalText = window.getComputedStyle(firstEditable).color;
        }

        document.body.addEventListener('click', this.handleElementClickEvent.bind(this));
        document.body.addEventListener('click', this.handleInternalLinkClick.bind(this));
    }

    handleInternalLinkClick(event) {
        if (event.target.matches('[data-edit-type][data-item-id] a')) {
            this.suppressEditActivation = true;
            setTimeout(() => { this.suppressEditActivation = false; }, 0);
        }
    }

    handleElementClickEvent(event) {
        if (this.suppressEditActivation) {
            return;
        }

        const clickedTarget = event.target.closest('[data-edit-type][data-item-id]');
        if (!clickedTarget) {
            return;
        }

        if (clickedTarget.classList.contains('is-being-modified')) {
            return;
        }

        if (this.currentActiveEditors === 0) {
            let elementsToConvert = [clickedTarget];
            const isTableCell = clickedTarget.tagName.toLowerCase() === 'td';

            if (isTableCell) {
                elementsToConvert = Array.from(clickedTarget.parentNode.children).filter(
                    child => child.matches('[data-edit-type][data-item-id]')
                );
            }

            elementsToConvert.forEach((el, index) => {
                this.convertElementToEditor(el, index === 0);
            });

        } else {
            const primaryEditorContainer = document.querySelector('.primary-editor-wrapper');
            if (primaryEditorContainer) {
                const isPrimaryTableCell = primaryEditorContainer.closest('[data-edit-type][data-item-id]').tagName.toLowerCase() === 'td';
                const isClickedTableCell = clickedTarget.tagName.toLowerCase() === 'td';

                if (isPrimaryTableCell && isClickedTableCell && primaryEditorContainer.closest('[data-edit-type][data-item-id]').parentNode === clickedTarget.parentNode) {
                    this.convertElementToEditor(clickedTarget, false);
                } else if (!isPrimaryTableCell && this.currentActiveEditors === 1) {
                    return;
                }
            } else {
                return;
            }
        }
    }

    convertElementToEditor(targetElement, isPrimaryInGroup) {
        if (targetElement.classList.contains('is-being-modified')) return;

        this.storeOriginalValue(targetElement);
        targetElement.classList.add('is-being-modified');
        targetElement.style.color = this.settings.displayColors.normalText;

        const currentContent = this.settings.captureElementContent(targetElement);
        const editorBox = document.createElement('div');
        editorBox.className = 'editor-input-box';

        const dataField = targetElement.dataset.editType.includes('Multi') ?
            document.createElement('textarea') :
            document.createElement('input');

        if (dataField.tagName === 'INPUT') {
            dataField.type = 'text';
            dataField.value = currentContent;
        } else {
            dataField.textContent = currentContent;
        }
        dataField.className = 'field-editor-control';
        if (isPrimaryInGroup) {
            dataField.classList.add('primary-field-control');
            editorBox.classList.add('primary-editor-wrapper');
            targetElement.classList.add('primary-editor-container');
        }

        editorBox.appendChild(dataField);
        targetElement.innerHTML = '';
        targetElement.appendChild(editorBox);

        this.currentActiveEditors++;

        if (isPrimaryInGroup) {
            this.addControlButtons(editorBox, () => {
                dataField.focus();
            });
        }
    }

    addControlButtons(parentBox, focusAction) {
        const controlsPanel = document.createElement('div');
        controlsPanel.className = 'editor-action-panel';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', this.submitChanges.bind(this));

        const cancelLink = document.createElement('a');
        cancelLink.href = 'javascript:;';
        cancelLink.className = 'action-discard';
        cancelLink.textContent = 'Cancel';
        cancelLink.addEventListener('click', this.revertAllChanges.bind(this));

        controlsPanel.appendChild(saveBtn);
        controlsPanel.appendChild(document.createTextNode(' or '));
        controlsPanel.appendChild(cancelLink);

        const hostElement = parentBox.parentNode;
        if (hostElement.classList.contains('removable-entry')) {
            const deleteLink = document.createElement('a');
            deleteLink.href = 'javascript:;';
            deleteLink.className = 'action-delete';
            deleteLink.textContent = 'Remove';
            deleteLink.addEventListener('click', this.removeEntry.bind(this));
            controlsPanel.prepend(deleteLink);
            controlsPanel.prepend(document.createTextNode(', '));
        }

        parentBox.appendChild(controlsPanel);

        const primaryInput = parentBox.querySelector('.primary-field-control');
        if (primaryInput) {
            primaryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.submitChanges();
                } else if (e.key === 'Escape') {
                    this.revertAllChanges();
                }
            });
        }

        if (this.settings.enableVisualEffects) {
            parentBox.style.display = 'none';
            parentBox.style.overflow = 'hidden';
            parentBox.style.height = '0px';
            parentBox.style.transition = 'height 0.5s ease-in-out';
            requestAnimationFrame(() => {
                parentBox.style.height = `${parentBox.scrollHeight}px`;
                parentBox.style.display = 'block';
            });
            parentBox.addEventListener('transitionend', function handler() {
                parentBox.style.height = '';
                parentBox.style.overflow = '';
                focusAction();
                parentBox.removeEventListener('transitionend', handler);
            }, { once: true });
        } else {
            parentBox.style.display = 'block';
            focusAction();
        }
    }

    revertAllChanges(event) {
        this.suppressEditActivation = typeof(event) !== 'undefined';

        document.querySelectorAll('.is-being-modified').forEach(element => {
            const storedValue = this.retrieveOriginalValue(element);
            this.restoreOriginalView(element, storedValue, false);
        });
        this.clearEditorState();
    }

    removeEntry() {
        this.suppressEditActivation = true;

        if (!confirm('Confirm deletion of this item?')) {
            return false;
        }

        const primaryControl = document.querySelector('.primary-field-control');
        if (!primaryControl) return;

        const containerElement = primaryControl.closest('[data-edit-type][data-item-id]');
        const identifier = this.settings.obtainElementIdentifier(containerElement);
        const removeEndpoint = this.actionMap.remove;

        document.querySelectorAll('.editor-input-box button, .editor-input-box a, .field-editor-control').forEach(ctrl => {
            if (ctrl.tagName === 'BUTTON' || ctrl.tagName === 'A') {
                 ctrl.disabled = true;
                 ctrl.textContent = 'Processing...';
            } else {
                 ctrl.readOnly = true;
            }
        });

        fetch(`${removeEndpoint}${identifier}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.text())
        .then(responsePayload => {
            const success = responsePayload === '1';
            document.querySelectorAll('.is-being-modified').forEach(element => {
                if (success) {
                    if (this.settings.enableVisualEffects) {
                        element.style.transition = 'height 0.5s ease-in-out, opacity 0.5s ease-in-out';
                        element.style.height = '0px';
                        element.style.opacity = '0';
                        element.addEventListener('transitionend', function handler() {
                            element.remove();
                        }, { once: true });
                    } else {
                        element.remove();
                    }
                } else {
                    this.restoreOriginalView(element, this.retrieveOriginalValue(element), false, this.settings.displayColors.unsuccessful);
                }
            });
            this.settings.onDeletionSuccess({ success, identifier });
            this.clearEditorState();
        })
        .catch(error => {
            console.error('Deletion operation failed:', error);
            document.querySelectorAll('.is-being-modified').forEach(element => {
                this.restoreOriginalView(element, this.retrieveOriginalValue(element), false, this.settings.displayColors.unsuccessful);
            });
            this.settings.onDeletionSuccess({ success: false, identifier });
            this.clearEditorState();
        });
    }

    restoreOriginalView(element, content, fadeColor = false, finalColor) {
        const editorBox = element.querySelector('.editor-input-box');
        const restorationProcedure = () => {
            element.innerHTML = content;
            element.classList.remove('is-being-modified');
            element.classList.remove('primary-editor-container');
            if (fadeColor) {
                element.style.color = finalColor;
                setTimeout(() => {
                    element.style.color = this.settings.displayColors.normalText;
                }, 5000);
            } else if (finalColor) {
                element.style.color = finalColor;
            }
            this.currentActiveEditors--;
            if (this.currentActiveEditors === 0) {
                this.clearEditorState();
            }
        };

        if (this.settings.enableVisualEffects && editorBox) {
            editorBox.style.height = `${editorBox.scrollHeight}px`;
            requestAnimationFrame(() => {
                editorBox.style.transition = 'height 0.5s ease-in-out, opacity 0.5s ease-in-out';
                editorBox.style.height = '0px';
                editorBox.style.opacity = '0';
            });
            editorBox.addEventListener('transitionend', function handler() {
                restorationProcedure();
                editorBox.removeEventListener('transitionend', handler);
            }, { once: true });
        } else {
            restorationProcedure();
        }
    }

    storeOriginalValue(element) {
        const key = this.settings.obtainElementIdentifier(element) + this.extractFieldDetails(element).fieldType;
        this.originalContentRegistry.set(key, element.innerHTML);
    }

    retrieveOriginalValue(element) {
        const key = this.settings.obtainElementIdentifier(element) + this.extractFieldDetails(element).fieldType;
        return this.originalContentRegistry.get(key);
    }

    extractFieldDetails(element) {
        const fieldType = element.dataset.editType;
        const targetEndpoint = this.actionMap[fieldType];
        return { fieldType, targetEndpoint };
    }

    submitChanges() {
        document.querySelectorAll('.editor-input-box button, .editor-input-box a, .field-editor-control').forEach(ctrl => {
            if (ctrl.tagName === 'BUTTON' || ctrl.tagName === 'A') {
                 ctrl.disabled = true;
            } else {
                 ctrl.readOnly = true;
            }
        });

        const activeFields = Array.from(document.querySelectorAll('.is-being-modified'));
        let requestsCompleted = 0;
        const totalRequests = activeFields.length;

        activeFields.forEach(element => {
            const fieldControl = element.querySelector('.field-editor-control');
            const newContent = fieldControl.value || fieldControl.textContent;
            const { fieldType, targetEndpoint } = this.extractFieldDetails(element);
            const identifier = this.settings.obtainElementIdentifier(element);

            fetch(`${targetEndpoint}${identifier}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(newContent)}`
            })
            .then(response => response.text())
            .then(responsePayload => {
                const success = responsePayload === '1';
                this.restoreOriginalView(element, newContent, true, success ? this.settings.displayColors.successful : this.settings.displayColors.unsuccessful);
                this.settings.onCommitSuccess({
                    success,
                    type: fieldType,
                    identifier,
                    updatedValue: newContent
                });
            })
            .catch(error => {
                console.error('Save operation failed:', error);
                this.restoreOriginalView(element, this.retrieveOriginalValue(element), false, this.settings.displayColors.unsuccessful);
                this.settings.onCommitSuccess({
                    success: false,
                    type: fieldType,
                    identifier,
                    updatedValue: newContent
                });
            })
            .finally(() => {
                requestsCompleted++;
                if (requestsCompleted === totalRequests) {
                    this.clearEditorState();
                }
            });
        });
    }

    clearEditorState() {
        this.currentActiveEditors = 0;
        this.originalContentRegistry.clear();
        document.querySelectorAll('.primary-editor-container').forEach(el => el.classList.remove('primary-editor-container'));
        document.querySelectorAll('.primary-field-control').forEach(el => el.classList.remove('primary-field-control'));
        document.querySelectorAll('.primary-editor-wrapper').forEach(el => el.classList.remove('primary-editor-wrapper'));
    }
}

function activateContentEditor(endpointMap, settings) {
    new ContentEditorManager(endpointMap, settings);
}

// Global exposure (similar to jQuery plugin registration)
// This is the entry point for the user.
// The user would call activateContentEditor({...}, {...})
// instead of $.inlineEdit({...}, {...})
// For example:
// document.addEventListener('DOMContentLoaded', () => {
//     activateContentEditor({
//         categoryName: 'category/edit/id/',
//         videoTitle: '/video/edit/title/',
//         videoDescription: '/video/edit/description/',
//         remove: '/item/delete/id/'
//     }, {
//         onCommitSuccess: (result) => console.log('Save finished:', result),
//         onDeletionSuccess: (result) => console.log('Delete finished:', result)
//     });
// });