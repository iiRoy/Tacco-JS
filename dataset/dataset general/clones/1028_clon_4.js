const createModalityHub = ( initialSettings = {} ) => {
    let currentDialogue = null;
    let veilElement = null;
    let storedButtons = [];
    let abortController = null; // Used for fetch API cancellation
    let resizeListenerId = null;
    let escapeKeyListenerId = null;

    const defaultSettings = {
        onDisplayHook: () => {},
        verticalOffset: null, // Will default to 40 if null/0/falsy as per original logic
        veilOpacity: 0.3,
        veilColor: "#000000",
        dialogueWidth: 400,
        isMovable: true,
        enableEscapeKey: true,
        veilDismissible: true,
        showCloseButton: true,
        hideHeaderSection: false,
        hideFooterSection: false,
        affirmativeLabel: "Proceed",
        negativeLabel: "Decline",
        frameTemplate: "<div class=\"dialogue-header\"><h1>{_HEADING_}</h1></div><div class=\"dialogue-body\"><div class=\"content-area\">{_CONTENT_}</div></div><div class=\"dialogue-footer\"></div>"
    };

    let activeSettings = { ...defaultSettings, ...initialSettings };

    // Helper for DOM element creation
    const makeElement = (tag, attributes = {}, children = []) => {
        const elem = document.createElement(tag);
        for (const key in attributes) {
            if (key === 'className') {
                elem.className = attributes[key];
            } else if (key === 'html') {
                elem.innerHTML = attributes[key];
            } else if (key === 'events') {
                for (const eventType in attributes[key]) {
                    elem.addEventListener(eventType, attributes[key][eventType]);
                }
            } else {
                elem.setAttribute(key, attributes[key]);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                elem.appendChild(document.createTextNode(child));
            } else {
                elem.appendChild(child);
            }
        });
        return elem;
    };

    // Helper for template string replacement
    const fillTemplate = (pattern, data) => {
        return Object.keys(data).reduce((acc, key) => {
            return acc.replace(new RegExp(`{${key}}`, 'g'), data[key]);
        }, pattern);
    };

    // Manages the overlay element visibility and behavior
    const manageVeil = (action) => {
        const bodyTag = document.body;
        const veilIdentifier = "modality-hub-veil";

        if (action === 'reveal') {
            manageVeil('conceal'); // Ensure no duplicate veil

            veilElement = makeElement("div", { id: veilIdentifier });
            Object.assign(veilElement.style, {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                zIndex: "9998",
                backgroundColor: activeSettings.veilColor,
                opacity: "0",
                transition: "opacity 0.3s ease-in-out"
            });
            bodyTag.appendChild(veilElement);

            setTimeout(() => {
                veilElement.style.opacity = activeSettings.veilOpacity;
            }, 10);

            if (activeSettings.veilDismissible) {
                veilElement.addEventListener("click", () => dismiss());
            }

            resizeListenerId = () => repositionDialogue();
            window.addEventListener("resize", resizeListenerId);

        } else if (action === 'conceal') {
            if (veilElement) {
                veilElement.style.opacity = "0";
                veilElement.addEventListener('transitionend', () => {
                    try { veilElement.remove(); } catch (e) {}
                    veilElement = null;
                }, { once: true });
            }

            if (currentDialogue) {
                try { currentDialogue.remove(); } catch (e) {}
                currentDialogue = null;
            }

            window.removeEventListener("resize", resizeListenerId);
            if (escapeKeyListenerId) {
                window.removeEventListener("keydown", escapeKeyListenerId);
                escapeKeyListenerId = null;
            }
            storedButtons = [];
            if (abortController) {
                try { abortController.abort(); } catch (e) {}
                abortController = null;
            }
        }
    };

    // Renders the main dialogue window
    const fabricateDialogue = (specificOptions) => {
        manageVeil('conceal');
        const bodyTag = document.body;

        currentDialogue = makeElement("div", { id: "modality-hub-dialogue", className: "modality-hub-dialogue" });
        bodyTag.appendChild(currentDialogue);

        const filledContent = fillTemplate(activeSettings.frameTemplate, {
            "_HEADING_": specificOptions.heading || "Attention",
            "_CONTENT_": specificOptions.text || ""
        });
        currentDialogue.innerHTML = filledContent;

        appendAllButtons();
        activeSettings.onDisplayHook();

        return currentDialogue;
    };

    // Creates and stores a button element
    const furnishButton = (caption, styleClass, clickHandler) => {
        const buttonElement = makeElement('button', {
            type: "button",
            className: styleClass,
            html: caption,
            events: {
                click: (event) => {
                    event.preventDefault();
                    (clickHandler || dismiss)();
                }
            }
        });
        storedButtons.push(buttonElement);
        return buttonElement;
    };

    // Injects all stored buttons into the dialogue footer
    const appendAllButtons = () => {
        const footerSection = currentDialogue.querySelector(".dialogue-footer");
        if (footerSection) {
            storedButtons.forEach(btn => footerSection.appendChild(btn));
        }
    };

    // Adds a close button to the top of the dialogue
    const installDismissButton = () => {
        const dismissButton = makeElement("a", { className: "close-action", href: "#", html: "×" });
        currentDialogue.insertBefore(dismissButton, currentDialogue.firstChild);
        dismissButton.addEventListener("click", (e) => {
            e.preventDefault();
            dismiss();
        });
        return dismissButton;
    };

    // Handles loading content dynamically (AJAX or image)
    const retrieveContent = async (contentParams) => {
        if (!currentDialogue) return;

        currentDialogue.classList.add("loading-state");

        if (abortController) {
            abortController.abort(); // Abort previous request
        }
        abortController = new AbortController();
        const { signal } = abortController;

        const imageRegex = /\.(jpg|png|gif|jpeg)$/i;
        if (contentParams.url && imageRegex.test(contentParams.url)) {
            currentDialogue.classList.add("no-footer-area");
            if (veilElement) veilElement.removeEventListener("click", dismiss);

            const img = new Image();
            img.onload = () => {
                currentDialogue.classList.remove("loading-state");
                const contentWrapper = currentDialogue.querySelector(".content-area");
                contentWrapper.innerHTML = '';
                contentWrapper.appendChild(img);

                const currentDialogueRect = currentDialogue.getBoundingClientRect();
                const currentContentRect = contentWrapper.getBoundingClientRect();
                const paddingHorizontal = currentContentRect.left - currentDialogueRect.left + (currentDialogueRect.right - currentContentRect.right);

                const targetWidth = img.naturalWidth + paddingHorizontal;
                const targetHeight = img.naturalHeight;

                currentDialogue.style.width = `${targetWidth}px`;
                contentWrapper.style.height = `${targetHeight}px`;

                img.style.opacity = "0";
                img.style.transition = "opacity 0.3s ease-in-out";
                setTimeout(() => img.style.opacity = "1", 50);

                repositionDialogue();
                activateEscapeKeyBehavior();
                abortController = null; // Clear controller after successful load
            };
            img.onerror = () => {
                currentDialogue.classList.remove("loading-state");
                currentDialogue.querySelector(".content-area").innerHTML = "Failed to load image.";
                repositionDialogue();
                activateEscapeKeyBehavior();
                abortController = null;
            };
            img.src = contentParams.url;

        } else if (contentParams.url) {
            try {
                const response = await fetch(contentParams.url, { signal });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const rawContent = await response.text();

                const scriptMatch = rawContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
                const htmlContent = rawContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

                currentDialogue.classList.remove("loading-state");
                const contentArea = currentDialogue.querySelector(".content-area");
                contentArea.innerHTML = htmlContent;

                if (scriptMatch) {
                    scriptMatch.forEach(scriptTag => {
                        const scriptContentMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                        if (scriptContentMatch && scriptContentMatch[1]) {
                            try {
                                new Function(scriptContentMatch[1])();
                            } catch (e) {
                                console.error("ModalityHub: Error executing dynamic script:", e);
                            }
                        }
                    });
                }

                if (contentParams.onCompletionHook) {
                    contentParams.onCompletionHook();
                }
                repositionDialogue();
                activateEscapeKeyBehavior();
                abortController = null;
            } catch (error) {
                if (error.name === 'AbortError') {
                    // Request was aborted, do nothing or log silently
                    console.log("ModalityHub: Content fetch aborted.");
                } else {
                    currentDialogue.classList.remove("loading-state");
                    currentDialogue.querySelector(".content-area").innerHTML = `Content retrieval failed: ${error.message}`;
                    repositionDialogue();
                    activateEscapeKeyBehavior();
                    console.error("ModalityHub: Content fetch error:", error);
                }
                abortController = null;
            }
        }
    };

    // Adjusts the position of the dialogue and veil
    const repositionDialogue = () => {
        if (veilElement) {
            veilElement.style.height = `${document.documentElement.scrollHeight}px`;
        }

        if (currentDialogue) {
            const dialogueRect = currentDialogue.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            const topPosition = activeSettings.verticalOffset || 40; // Replicates original `|| 40` logic

            const leftPosition = (viewportWidth - dialogueRect.width) / 2;

            Object.assign(currentDialogue.style, {
                position: "fixed",
                top: `${topPosition}px`,
                left: `${leftPosition}px`,
                zIndex: "9999"
            });
        }
    };

    // Enables dismissal via the Escape key
    const activateEscapeKeyBehavior = () => {
        if (activeSettings.enableEscapeKey) {
            if (escapeKeyListenerId) {
                window.removeEventListener("keydown", escapeKeyListenerId);
            }
            escapeKeyListenerId = (e) => {
                if (e.key === "Escape") {
                    dismiss();
                }
            };
            window.addEventListener("keydown", escapeKeyListenerId);
        }
    };

    // Implements custom drag functionality for the dialogue
    const enableDialogueMovement = (dialogueNode, handleNode) => {
        if (!dialogueNode || !handleNode) return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            e.preventDefault();

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const computedStyle = window.getComputedStyle(dialogueNode);
            initialLeft = parseFloat(computedStyle.left) || 0;
            initialTop = parseFloat(computedStyle.top) || 0;

            dialogueNode.classList.add("is-moving");
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            dialogueNode.style.left = `${initialLeft + dx}px`;
            dialogueNode.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            dialogueNode.classList.remove("is-moving");
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handleNode.style.cursor = "grab";
        handleNode.addEventListener('mousedown', onMouseDown);
    };

    // Public method to display a dialogue
    const presentDialogue = (config = {}) => {
        activeSettings = { ...defaultSettings, ...initialSettings, ...config };

        manageVeil("reveal");

        switch (config.typeIdentifier) {
            case "affirmation":
                furnishButton(activeSettings.affirmativeLabel, "control-button primary-action btn-spacing", () => {
                    try { config.onConfirmCallback(); } catch (err) {}
                    dismiss();
                });
                furnishButton(activeSettings.negativeLabel, "control-button secondary-action");
                fabricateDialogue(config);
                activateEscapeKeyBehavior();
                break;
            case "generic":
                fabricateDialogue(config);
                activateEscapeKeyBehavior();
                break;
            case "remote-content":
                fabricateDialogue(config);
                retrieveContent({
                    url: config.contentSource.resourceURL || "",
                    onCompletionHook: config.contentSource.onLoadedCallback || (() => {})
                });
                break;
            default: // Alert/default
                furnishButton(activeSettings.affirmativeLabel, "control-button primary-action");
                fabricateDialogue(config);
                activateEscapeKeyBehavior();
                break;
        }

        currentDialogue.style.width = `${activeSettings.dialogueWidth}px`;

        if (activeSettings.hideHeaderSection) currentDialogue.classList.add("no-header-area");
        if (activeSettings.hideFooterSection) currentDialogue.classList.add("no-footer-area");

        if (activeSettings.showCloseButton) installDismissButton();

        if (activeSettings.isMovable) {
            const headerHandle = currentDialogue.querySelector(".dialogue-header");
            enableDialogueMovement(currentDialogue, headerHandle);
        }
        repositionDialogue();
    };

    // Public method to hide and clean up the dialogue
    const dismiss = () => {
        manageVeil('conceal');
    };

    // Public method to add an action button to the dialogue
    const addActionButton = (label, styleClass, actionHandler) => {
        return furnishButton(label, styleClass, actionHandler);
    };

    // Public method to update configuration settings
    const updateSettings = (newSettings) => {
        activeSettings = { ...activeSettings, ...newSettings };
    };

    return {
        presentDialogue,
        dismiss,
        addActionButton,
        updateSettings
    };
};