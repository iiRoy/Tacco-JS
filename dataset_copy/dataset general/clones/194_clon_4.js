function InitiateContentSculptor(targetElement, configurationParameters) {
    class InternalContentSculptor {
        constructor(hostElement, settings = {}) {
            const defaultSettings = {
                mainEditorElementId: "content-sculptor-wysiwyg",
                codeSourceElementId: "content-sculptor-code",
                previewPaneElementId: "content-sculptor-preview",
                tabNavigationElementId: "content-sculptor-tabs",
                controlPanelElementId: "content-sculptor-controls"
            };
            this.config = Object.assign({}, defaultSettings, settings);

            this.hostNode = hostElement;
            this.codeViewInstance = null;
            this.selectionPreserver = null;
            this.activeElementPreserver = null;

            this.visualEditorNode = null;
            this.codeEditorNode = null;
            this.previewNode = null;
            this.commandBarNode = null;
            this.tabControlsNode = null;

            this.constructUserInterface();
            this.bindInteractionEvents();
            this.configureEditorCommands();
        }

        storeCurrentSelection() {
            const currentBrowserSelection = window.getSelection();
            if (currentBrowserSelection.rangeCount > 0) {
                this.selectionPreserver = currentBrowserSelection.getRangeAt(0);
            } else {
                this.selectionPreserver = null;
            }
            this.activeElementPreserver = document.activeElement;
        }

        restorePreviousSelection() {
            if (this.selectionPreserver) {
                const currentBrowserSelection = window.getSelection();
                currentBrowserSelection.removeAllRanges();
                currentBrowserSelection.addRange(this.selectionPreserver);

                setTimeout(() => {
                    if (this.activeElementPreserver && typeof this.activeElementPreserver.focus === "function") {
                        this.activeElementPreserver.focus();
                    }
                }, 1);
            }
        }

        constructUserInterface() {
            document.execCommand('insertBrOnReturn', false, true);
            document.execCommand('enableObjectResizing', false, true);

            this.visualEditorNode = document.createElement("div");
            this.visualEditorNode.id = this.config.mainEditorElementId;
            this.visualEditorNode.contentEditable = "true";
            this.visualEditorNode.setAttribute("unselectable", "off");
            this.visualEditorNode.innerHTML = this.hostNode.innerHTML;

            this.codeEditorNode = document.createElement("div");
            this.codeEditorNode.id = this.config.codeSourceElementId;

            this.previewNode = document.createElement("div");
            this.previewNode.id = this.config.previewPaneElementId;

            this.hostNode.innerHTML = '';
            this.hostNode.appendChild(this.visualEditorNode);

            if (this.config.codeSourceElementId) {
                this.codeEditorNode.innerHTML = this.visualEditorNode.innerHTML;
                this.hostNode.appendChild(this.codeEditorNode);
            }
            if (this.config.previewPaneElementId) {
                this.hostNode.appendChild(this.previewNode);
            }

            if (this.config.tabNavigationElementId) {
                this.visualEditorNode.classList.add("tab-pane", "active");
                this.codeEditorNode.classList.add("tab-pane");
                this.previewNode.classList.add("tab-pane");

                this.tabControlsNode = document.getElementById(this.config.tabNavigationElementId);
                if (this.tabControlsNode) {
                    this.tabControlsNode.addEventListener('click', (evt) => this.handleTabTransition(evt));
                }
            }

            if (typeof window.ace !== 'undefined') {
                this.codeViewInstance = window.ace.edit(this.config.codeSourceElementId);
                this.codeViewInstance.getSession().setMode("ace/mode/html");
            }
        }

        bindInteractionEvents() {
            this.previewNode.addEventListener("click", () => {
                this.previewNode.innerHTML = this.visualEditorNode.innerHTML;
            });

            if (this.codeViewInstance) {
                this.codeViewInstance.getSession().on("change", () => {
                    try {
                        this.visualEditorNode.innerHTML = this.codeViewInstance.getSession().getValue();
                    } catch (err) {
                        console.error("ACE code synchronization error:", err);
                    }
                });
            }

            this.visualEditorNode.addEventListener("input", () => this.syncVisualToCode());
            this.visualEditorNode.addEventListener("blur", () => this.syncVisualToCode());

            const colorControlButtons = this.hostNode.querySelectorAll('[data-control="bgcolor"],[data-control="fgcolor"]');
            colorControlButtons.forEach(buttonWrapper => {
                buttonWrapper.addEventListener("mousedown", (evt) => {
                    this.storeCurrentSelection();
                    const colorInput = buttonWrapper.querySelector("input[type='color']");
                    if (colorInput) {
                        colorInput.click();
                    }
                    evt.preventDefault();
                });
            });

            const bgInput = this.hostNode.querySelector('[data-control="bgcolor"] input');
            if (bgInput) {
                bgInput.addEventListener("change", (evt) => {
                    this.visualEditorNode.style.backgroundColor = evt.target.value;
                });
            }

            const fgInput = this.hostNode.querySelector('[data-control="fgcolor"] input');
            if (fgInput) {
                fgInput.addEventListener("change", (evt) => {
                    this.restorePreviousSelection();
                    document.execCommand('foreColor', false, evt.target.value);
                });
            }

            const codePreviewTabTriggers = this.hostNode.querySelectorAll(".tab-code-trigger, .tab-preview-trigger");
            codePreviewTabTriggers.forEach(trigger => {
                trigger.addEventListener("mousedown", () => {
                    const panel = document.getElementById(this.config.controlPanelElementId);
                    if (panel) {
                        panel.style.display = "none";
                    }
                    const globalEditorWrapper = document.getElementById("rte");
                    if (globalEditorWrapper) {
                        globalEditorWrapper.style.bottom = "0";
                    }
                });
            });

            const wysiwygTabTrigger = this.hostNode.querySelector(".tab-wysiwyg-trigger");
            if (wysiwygTabTrigger) {
                wysiwygTabTrigger.addEventListener("mousedown", () => {
                    const panel = document.getElementById(this.config.controlPanelElementId);
                    if (panel) {
                        panel.style.display = "block";
                    }
                    const globalEditorWrapper = document.getElementById("rte");
                    if (globalEditorWrapper) {
                        globalEditorWrapper.style.bottom = "33px";
                    }
                });
            }
        }

        syncVisualToCode() {
            try {
                if (this.codeViewInstance) {
                    this.codeViewInstance.getSession().setValue(this.visualEditorNode.innerHTML);
                }
            } catch (err) {
                console.error("Visual editor synchronization error:", err);
            }
        }

        commandDefinitionMap = new Map();

        configureEditorCommands() {
            this.commandDefinitionMap.set("text-bold", { command: 'bold', value: null });
            this.commandDefinitionMap.set("text-italic", { command: 'italic', value: null });
            this.commandDefinitionMap.set("text-underline", { command: 'underline', value: null });
            this.commandDefinitionMap.set("text-strike", { command: 'strikeThrough', value: null });
            this.commandDefinitionMap.set("align-left", { command: 'justifyLeft', value: null });
            this.commandDefinitionMap.set("align-center", { command: 'justifyCenter', value: null });
            this.commandDefinitionMap.set("align-right", { command: 'justifyRight', value: null });
            this.commandDefinitionMap.set("align-full", { command: 'justifyFull', value: null });
            this.commandDefinitionMap.set("list-unordered", { command: 'insertUnorderedList', value: null });
            this.commandDefinitionMap.set("list-ordered", { command: 'insertOrderedList', value: null });
            this.commandDefinitionMap.set("insert-paragraph", { command: 'insertParagraph', value: null });
            this.commandDefinitionMap.set("indent-text", { command: 'indent', value: null });
            this.commandDefinitionMap.set("outdent-text", { command: 'outdent', value: null });
            this.commandDefinitionMap.set("create-hyperlink", { command: 'createlink', value: null, requiresPrompt: true });

            this.hostNode.addEventListener("mousedown", (evt) => {
                const commandActivator = evt.target.closest('[data-control]');
                if (commandActivator) {
                    const controlKey = commandActivator.getAttribute('data-control');
                    const commandSettings = this.commandDefinitionMap.get(controlKey);

                    if (commandSettings) {
                        evt.preventDefault();

                        if (commandSettings.requiresPrompt) {
                            const linkDestination = prompt("Please provide the link destination:");
                            if (linkDestination && linkDestination !== '' && linkDestination !== 'http://') {
                                document.execCommand(commandSettings.command, false, linkDestination);
                            }
                        } else {
                            document.execCommand(commandSettings.command, false, commandSettings.value);
                        }
                    }
                }
            });
        }

        handleTabTransition(eventObject) {
            const tabActivator = eventObject.target.closest('[data-switch-tab]');
            if (tabActivator) {
                eventObject.preventDefault();
                const targetPanelId = tabActivator.getAttribute('href').substring(1);

                const allPanels = this.hostNode.querySelectorAll('.tab-pane');
                allPanels.forEach(panel => panel.classList.remove('active'));

                const activatedPanel = document.getElementById(targetPanelId);
                if (activatedPanel) {
                    activatedPanel.classList.add('active');
                }

                const commandBar = document.getElementById(this.config.controlPanelElementId);
                const globalEditorContainer = document.getElementById("rte");

                if (targetPanelId === this.config.mainEditorElementId) {
                    if (commandBar) commandBar.style.display = "block";
                    if (globalEditorContainer) globalEditorContainer.style.bottom = "33px";
                } else {
                    if (commandBar) commandBar.style.display = "none";
                    if (globalEditorContainer) globalEditorContainer.style.bottom = "0";
                }
            }
        }
    }

    return new InternalContentSculptor(targetElement, configurationParameters);
}