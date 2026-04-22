const ModalOverseer = (function() {
    let dialogSequence = 0;
    const activeDialogStack = []; // Stores active dialog instances in order of appearance
    let documentScrollLockCount = 0; // To track if body should be locked

    // Default configuration for any new dialog
    const baseSettings = {
        isModal: false,
        headingText: null,
        mainContent: '',
        verticalPositionOffset: -1,
        includeCloseButton: true,
        closeButtonAccessibilityHint: 'Dismiss',
        contentDisplayWidth: 600,
        customCloseTriggerClass: '',
        allowEscapeKeyClose: true,
        initialFocusElementSelector: null, // true for first input, string for specific selector
        contentTypeSource: null, // [iframe, ajax, #elementId]
        remoteContentUrl: null, // iframe/ajax URL
        actionGroupButtons: [],
        transitionDurationMilliseconds: 200,
        iframeContentHeight: '300px',
        iframeContentWidth: '100%',
        maximumContentHeight: null,
        enableVerticalCentering: true,
        responsiveDisplay: false,
        backdropShade: null, // CSS color value
        backdropTransparency: null // opacity value
    };

    // Utility for generating unique IDs
    function generateUniqueUnitId(prefix = 'dialog-unit-') {
        dialogSequence++;
        return prefix + dialogSequence;
    }

    // Locks/unlocks document scroll, accounting for multiple dialogs
    function controlDocumentScroll(lock) {
        if (lock) {
            documentScrollLockCount++;
            if (documentScrollLockCount === 1) {
                document.body.classList.add('body-locked');
            }
        } else {
            documentScrollLockCount--;
            if (documentScrollLockCount === 0) {
                document.body.classList.remove('body-locked');
            }
        }
    }

    // Global keydown handler for escape key
    function handleGlobalKeyboardInput(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            if (activeDialogStack.length > 0) {
                const topmostDialog = activeDialogStack[activeDialogStack.length - 1];
                if (topmostDialog.config.allowEscapeKeyClose) {
                    event.stopImmediatePropagation();
                    topmostDialog.conceal();
                }
            }
        }
    }

    // Attach global escape listener once
    document.addEventListener('keydown', handleGlobalKeyboardInput);

    // Factory function to create individual dialog instances
    function createDialogUnit(userSettings) {
        const unitIdentifier = generateUniqueUnitId();
        const config = { ...baseSettings, ...userSettings }; // Merge settings
        let unitElements = {}; // Stores references to created DOM elements
        let priorFocusElement = null; // Store element to return focus to after closing

        // Public API for the dialog instance
        const dialogUnitInstance = {
            // Expose config for global handlers if needed
            config: config,
            modifyContent: (newContent) => {
                config.mainContent = newContent;
                return dialogUnitInstance;
            },
            showDisplay: () => {
                // Save current focused element to restore later
                priorFocusElement = document.activeElement;

                // Create DOM elements if they don't exist for this ID
                if (!unitElements.portalContainer) {
                    unitElements.portalContainer = document.createElement('div');
                    unitElements.portalContainer.classList.add('dialog-portal', unitIdentifier);
                    // Dynamic z-index based on stack size
                    unitElements.portalContainer.style.zIndex = 9000 + activeDialogStack.length;

                    unitElements.backdropElement = document.createElement('div');
                    unitElements.backdropElement.classList.add('dialog-backdrop');
                    if (config.backdropShade) { unitElements.backdropElement.style.backgroundColor = config.backdropShade; }
                    if (config.backdropTransparency) { unitElements.backdropElement.style.opacity = config.backdropTransparency; }
                    unitElements.portalContainer.appendChild(unitElements.backdropElement);

                    unitElements.displayWrapper = document.createElement('div');
                    unitElements.displayWrapper.classList.add('dialog-display');
                    unitElements.portalContainer.appendChild(unitElements.displayWrapper);

                    unitElements.contentWrapper = document.createElement('div');
                    unitElements.contentWrapper.classList.add('dialog-wrapper');
                    unitElements.contentWrapper.style.width = `${config.contentDisplayWidth}px`;
                    if (config.responsiveDisplay) {
                        unitElements.contentWrapper.style.maxWidth = '100%';
                    }
                    unitElements.displayWrapper.appendChild(unitElements.contentWrapper);

                    const internalContainer = document.createElement('div');
                    internalContainer.classList.add('dialog-container');
                    unitElements.contentWrapper.appendChild(internalContainer);

                    if (config.includeCloseButton !== false) {
                        unitElements.closeButtonElement = document.createElement('span');
                        unitElements.closeButtonElement.classList.add('dialog-shut');
                        unitElements.closeButtonElement.innerHTML = '&times;';
                        if (config.closeButtonAccessibilityHint) {
                            unitElements.closeButtonElement.title = config.closeButtonAccessibilityHint;
                        }
                        internalContainer.appendChild(unitElements.closeButtonElement);
                    }

                    if (config.headingText) {
                        unitElements.titleHeading = document.createElement('div');
                        unitElements.titleHeading.classList.add('dialog-head');
                        unitElements.titleHeading.textContent = config.headingText;
                        internalContainer.appendChild(unitElements.titleHeading);
                    }

                    unitElements.mainContentArea = document.createElement('div');
                    unitElements.mainContentArea.classList.add('dialog-text');
                    if (config.maximumContentHeight) {
                        unitElements.mainContentArea.style.maxHeight = config.maximumContentHeight;
                        unitElements.mainContentArea.style.overflowY = 'auto'; // Ensure scroll if content exceeds max height
                    }
                    internalContainer.appendChild(unitElements.mainContentArea);

                    if (config.actionGroupButtons.length > 0) {
                        unitElements.actionBlock = document.createElement('div');
                        unitElements.actionBlock.classList.add('dialog-actions');
                        config.actionGroupButtons.forEach(btnConfig => {
                            const btn = document.createElement('button');
                            btn.classList.add('dialog-press');
                            if (btnConfig.classname) { btn.classList.add(btnConfig.classname); }
                            btn.textContent = btnConfig.label;
                            if (btnConfig.clickHandler) {
                                btn.addEventListener('click', btnConfig.clickHandler);
                            }
                            unitElements.actionBlock.appendChild(btn);
                        });
                        internalContainer.appendChild(unitElements.actionBlock);
                    }

                    document.body.appendChild(unitElements.portalContainer);
                }

                // Load content if external
                fetchAndRenderRemoteContent();

                // Apply visibility classes for transition
                setTimeout(() => { // Small delay to allow DOM to render before applying transition
                    unitElements.portalContainer.classList.add('dialog-visible');
                }, 10);

                attachUnitEventHandlers();
                adjustUnitPosition();
                applyInitialInputFocus();

                activeDialogStack.push(dialogUnitInstance);
                controlDocumentScroll(true); // Lock document scroll

                return dialogUnitInstance;
            },
            conceal: () => {
                if (!unitElements.portalContainer) return false;

                detachUnitEventHandlers();

                // Trigger CSS fade out
                unitElements.portalContainer.classList.remove('dialog-visible');

                // Remove from DOM after transition
                unitElements.portalContainer.addEventListener('transitionend', function handler() {
                    unitElements.portalContainer.removeEventListener('transitionend', handler);
                    if (unitElements.portalContainer && unitElements.portalContainer.parentNode) {
                        unitElements.portalContainer.parentNode.removeChild(unitElements.portalContainer);
                        unitElements = {}; // Clear element references
                    }
                });

                const index = activeDialogStack.indexOf(dialogUnitInstance);
                if (index > -1) {
                    activeDialogStack.splice(index, 1);
                }
                controlDocumentScroll(false); // Unlock document scroll

                // Restore focus if an element was focused before opening
                if (priorFocusElement && typeof priorFocusElement.focus === 'function') {
                    priorFocusElement.focus();
                }

                return false;
            },
            addActionButton: (label, classname, clickHandler) => {
                const btn = { label: label };
                if (typeof classname === 'function') {
                    clickHandler = classname;
                    classname = '';
                }
                btn.classname = classname;

                if (typeof clickHandler === 'function') {
                    btn.clickHandler = clickHandler;
                } else {
                    btn.clickHandler = dialogUnitInstance.conceal; // Default to close
                }
                config.actionGroupButtons.push(btn);
                // If dialog is already displayed, dynamically add to the existing action block
                if (unitElements.actionBlock) {
                    const newBtn = document.createElement('button');
                    newBtn.classList.add('dialog-press');
                    if (btn.classname) { newBtn.classList.add(btn.classname); }
                    newBtn.textContent = btn.label;
                    if (btn.clickHandler) {
                        newBtn.addEventListener('click', btn.clickHandler);
                    }
                    unitElements.actionBlock.appendChild(newBtn);
                }
                return dialogUnitInstance;
            },
            addConfirmationAction: (handler) => {
                dialogUnitInstance.addActionButton('Confirm', 'confirm-action', handler);
                return dialogUnitInstance;
            },
            addRejectionAction: () => {
                dialogUnitInstance.addActionButton('Reject', 'reject-action', dialogUnitInstance.conceal);
                return dialogUnitInstance;
            },
            addDismissAction: () => {
                dialogUnitInstance.addActionButton('Dismiss', 'dismiss-action', dialogUnitInstance.conceal);
                return dialogUnitInstance;
            }
        };

        // --- Private utility functions for this dialog instance ---

        // Binds event listeners specific to this dialog instance
        function attachUnitEventHandlers() {
            // Close button
            if (unitElements.closeButtonElement) {
                unitElements.closeButtonElement.addEventListener('click', dialogUnitInstance.conceal);
            }
            // Custom close class
            if (config.customCloseTriggerClass) {
                const customCloseElements = unitElements.contentWrapper.querySelectorAll(`.${config.customCloseTriggerClass}`);
                customCloseElements.forEach(el => el.addEventListener('click', dialogUnitInstance.conceal));
            }

            // Click outside to close (if not modal)
            if (!config.isModal) {
                unitElements.portalContainer.addEventListener('click', (event) => {
                    // Only close if click is directly on portal or backdrop, not on content
                    if (event.target === unitElements.portalContainer || event.target === unitElements.backdropElement) {
                        dialogUnitInstance.conceal();
                    }
                });
            }

            // Recenter on resize
            window.addEventListener('resize', adjustUnitPosition);
        }

        // Unbinds event listeners specific to this dialog instance
        function detachUnitEventHandlers() {
            if (unitElements.closeButtonElement) {
                unitElements.closeButtonElement.removeEventListener('click', dialogUnitInstance.conceal);
            }
            if (config.customCloseTriggerClass) {
                const customCloseElements = unitElements.contentWrapper.querySelectorAll(`.${config.customCloseTriggerClass}`);
                customCloseElements.forEach(el => el.removeEventListener('click', dialogUnitInstance.conceal));
            }
            if (!config.isModal) {
                unitElements.portalContainer.removeEventListener('click', (event) => {
                    if (event.target === unitElements.portalContainer || event.target === unitElements.backdropElement) {
                        dialogUnitInstance.conceal();
                    }
                });
            }
            window.removeEventListener('resize', adjustUnitPosition);
        }

        // Update content in the DOM
        function refreshMainContent(contentElement) {
            if (unitElements.mainContentArea) {
                unitElements.mainContentArea.innerHTML = ''; // Clear previous content
                if (typeof contentElement === 'string') {
                    unitElements.mainContentArea.innerHTML = contentElement;
                } else if (contentElement instanceof HTMLElement) {
                    unitElements.mainContentArea.appendChild(contentElement);
                }
                applyInitialInputFocus();
                adjustUnitPosition();
            }
        }

        // Load external content
        async function fetchAndRenderRemoteContent() {
            if (config.contentTypeSource === 'ajax' && config.remoteContentUrl) {
                try {
                    const response = await fetch(config.remoteContentUrl);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.text();
                    const tempDiv = document.createElement('div');
                    tempDiv.classList.add('dialog-ajax-container');
                    tempDiv.innerHTML = data;
                    refreshMainContent(tempDiv);
                } catch (error) {
                    console.error('Failed to load AJAX content:', error);
                    refreshMainContent('<p>Error loading content.</p>');
                }
            } else if (config.contentTypeSource === 'iframe' && config.remoteContentUrl) {
                const iframeElement = document.createElement('iframe');
                iframeElement.classList.add('dialog-frame');
                iframeElement.src = config.remoteContentUrl;
                iframeElement.style.border = '0';
                iframeElement.style.width = config.iframeContentWidth;
                iframeElement.style.height = config.iframeContentHeight;
                refreshMainContent(iframeElement);
            } else if (config.contentTypeSource && config.contentTypeSource.startsWith('#')) {
                const sourceElement = document.querySelector(config.contentTypeSource);
                if (sourceElement) {
                    // Clone the content to avoid moving it from its original place
                    const clonedContent = sourceElement.cloneNode(true);
                    clonedContent.style.display = ''; // Ensure it's visible if it was hidden
                    refreshMainContent(clonedContent);
                } else {
                    refreshMainContent('<p>Source element not found.</p>');
                }
            } else if (config.mainContent) {
                refreshMainContent(config.mainContent);
            }
        }

        // Apply initial focus to an element within the dialog
        function applyInitialInputFocus() {
            if (config.initialFocusElementSelector === true) {
                const firstInput = unitElements.mainContentArea.querySelector('input, textarea, select, button');
                if (firstInput) {
                    firstInput.focus();
                }
            } else if (typeof config.initialFocusElementSelector === 'string') {
                const specificElement = unitElements.contentWrapper.querySelector(config.initialFocusElementSelector);
                if (specificElement) {
                    specificElement.focus();
                }
            }
        }

        // Adjusts the dialog's position (primarily vertical centering)
        function adjustUnitPosition() {
            if (unitElements.contentWrapper) {
                if (config.enableVerticalCentering && config.verticalPositionOffset < 0) {
                    // Flexbox handles centering by default, ensure no overriding styles
                    unitElements.contentWrapper.style.marginTop = '';
                    unitElements.contentWrapper.style.alignSelf = '';
                } else if (config.verticalPositionOffset >= 0) {
                    // If offset is provided, apply it and override flex centering
                    unitElements.contentWrapper.style.marginTop = `${config.verticalPositionOffset}px`;
                    unitElements.contentWrapper.style.alignSelf = 'flex-start';
                }
            }
        }

        return dialogUnitInstance;
    }

    return {
        create: createDialogUnit,
        getVisibleCount: () => activeDialogStack.length,
        getTopmostUnit: () => {
            if (activeDialogStack.length === 0) return null;
            return activeDialogStack[activeDialogStack.length - 1];
        }
    };
})();

// Expose a global alias for creating dialogs
window.EphemeralDialog = ModalOverseer.create;

// Embed necessary CSS for the dialogs. This is crucial for Type IV as it's a completely different rendering approach.
// In a real-world scenario, this would be in a separate CSS file.
(function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Ephemeral Dialog Styles */
        .dialog-portal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            visibility: hidden;
            opacity: 0;
            transition: opacity var(--dialog-transition-duration, 0.2s) ease-out, visibility 0s var(--dialog-transition-duration, 0.2s); /* visibility delay for smooth hide */
            z-index: 9000; /* Base z-index */
        }
        .dialog-portal.dialog-visible {
            visibility: visible;
            opacity: 1;
            transition: opacity var(--dialog-transition-duration, 0.2s) ease-out; /* no delay for smooth show */
        }

        .dialog-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
        }

        .dialog-display {
            position: relative;
            z-index: 1; /* Above backdrop */
            display: flex;
            justify-content: center;
            align-items: center; /* For vertical centering of dialog-wrapper */
            width: 100%; /* Allows dialog-wrapper to respect max-width */
            height: 100%;
        }

        .dialog-wrapper {
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 90%; /* Default responsive behavior */
            box-sizing: border-box;
            position: relative;
            z-index: 2; /* Above dialog-display's content */
            display: flex; /* For internal layout */
            flex-direction: column;
            max-height: 90vh; /* Prevent dialog from exceeding viewport height */
        }

        .dialog-container {
            padding: 20px;
            position: relative;
            flex-grow: 1; /* Allows content to expand */
            display: flex;
            flex-direction: column;
        }

        .dialog-shut {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            color: #999;
            background: none;
            border: none;
            padding: 0 5px;
            transition: color 0.2s ease;
        }
        .dialog-shut:hover {
            color: #333;
        }

        .dialog-head {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            padding-right: 30px; /* Make space for close button */
        }

        .dialog-text {
            line-height: 1.6;
            color: #555;
            flex-grow: 1; /* Allow content to take available space */
            overflow-y: auto; /* For scrollable content */
            margin-bottom: 15px; /* Space before action buttons */
        }
        .dialog-text:last-child {
            margin-bottom: 0; /* No margin if no action buttons */
        }

        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }

        .dialog-press {
            padding: 8px 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #f0f0f0;
            cursor: pointer;
            font-size: 14px;
            color: #333;
            transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .dialog-press:hover {
            background-color: #e0e0e0;
        }
        .dialog-press.confirm-action {
            background-color: #007bff;
            color: #fff;
            border-color: #007bff;
        }
        .dialog-press.confirm-action:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }
        .dialog-press.reject-action {
            background-color: #dc3545;
            color: #fff;
            border-color: #dc3545;
        }
        .dialog-press.reject-action:hover {
            background-color: #c82333;
            border-color: #c82333;
        }

        /* Body scroll lock */
        .body-locked {
            overflow: hidden;
            padding-right: 17px; /* Compensate for scrollbar to prevent layout shift */
        }
    `;
    document.head.appendChild(styleElement);
})();