(function() {
    "use strict";

    class ContentEditor {
        static defaultSettings = {
            containerClass: "content-editor",
            controlPanelClass: "editor-controls nav-bar",
            toolDefinitions: [
                { title: 'Upload Image', action: { name: 'insertHtml', sourceTag: 'mediaUpload' }, iconSymbol: '🖼️' },
                { title: 'Bold Text', action: { name: 'Bold' }, iconSymbol: '<b>B</b>' },
                { title: 'Blockquote', action: { name: 'formatBlock', value: 'blockquote' }, iconSymbol: '❝' },
                { title: 'Code Block', action: { name: 'formatBlock', value: 'pre' }, iconSymbol: '<code>&lt;/&gt;</code>' }
            ]
        };

        constructor(targetElement, configOptions) {
            this.activeElement = targetElement;
            this.activeElement.setAttribute('contenteditable', 'true');
            this.activeElement.dataset.isRichText = 'true';
            
            this.settings = Object.assign({}, ContentEditor.defaultSettings, configOptions);

            this.activeElement.classList.add(this.settings.containerClass);

            const controlPanel = document.createElement('nav');
            controlPanel.classList.add(this.settings.controlPanelClass);

            const controlList = document.createElement('ul');
            controlPanel.appendChild(controlList);

            this.settings.toolDefinitions.forEach(toolDef => {
                let { iconSymbol, action } = toolDef;

                let commandValue = action.value || null;
                let showUI = action.showUI || false;
                let triggerCallbackName;

                if (action.sourceTag) {
                    const encodedData = this.activeElement.dataset[action.sourceTag];
                    if (encodedData) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = encodedData;
                        commandValue = tempDiv.innerHTML;
                    }

                    const callbackKey = action.sourceTag + 'Callback';
                    triggerCallbackName = this.activeElement.dataset[callbackKey];
                    if (triggerCallbackName) {
                        this.activeElement.addEventListener("interactionEvent", () => {
                            if (window[triggerCallbackName] && typeof window[triggerCallbackName] === 'function') {
                                return window[triggerCallbackName]();
                            }
                        });
                    }
                }

                const listItem = document.createElement('li');
                const controlButton = document.createElement('button');
                controlButton.classList.add('control-button', toolDef.buttonClass || '');
                controlButton.setAttribute('tabindex', '-1');
                controlButton.setAttribute('type', 'button');
                controlButton.setAttribute('title', toolDef.title);
                controlButton.addEventListener('focus', e => e.stopPropagation());
                controlButton.addEventListener('click', e => {
                    document.execCommand(action.name, showUI, commandValue);
                    if (action.name === 'formatBlock') {
                        document.execCommand('insertHtml', false, '<p></p>');
                    }
                    if (action.sourceTag && triggerCallbackName) {
                        this.activeElement.dispatchEvent(new CustomEvent('interactionEvent'));
                    }
                });

                if (iconSymbol) {
                    const iconElement = document.createElement('span');
                    iconElement.classList.add('material-icon');
                    iconElement.innerHTML = iconSymbol;
                    controlButton.appendChild(iconElement);
                }
                listItem.appendChild(controlButton);
                controlList.appendChild(listItem);
            });
            this.activeElement.parentNode.insertBefore(controlPanel, this.activeElement);
        }
    }

    const editorInstances = new WeakMap(); // Using WeakMap to store instances without polluting DOM elements directly

    window.initializeRichTextEditor = function(elementRef, config = {}) {
        if (!(elementRef instanceof HTMLElement)) {
            console.error("Provided reference is not an HTMLElement.");
            return;
        }
        if (!editorInstances.has(elementRef)) {
            editorInstances.set(elementRef, new ContentEditor(elementRef, config));
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-editor-type="rich-text"]').forEach(element => {
            const elementConfig = {};
            for (const key in element.dataset) {
                if (key.startsWith('editor')) {
                    const propName = key.substring(6,7).toLowerCase() + key.substring(7);
                    if (propName === 'tools') { // Special handling for tool definitions array
                        try {
                            elementConfig.toolDefinitions = JSON.parse(element.dataset[key]);
                        } catch (e) {
                            console.error("Failed to parse editor tools from data-editor-tools:", e);
                        }
                    } else {
                        elementConfig[propName] = element.dataset[key];
                    }
                }
            }
            window.initializeRichTextEditor(element, elementConfig);
        });
    });

})();