class OverlayWindowController {
    // A simple mixin for handling options, replacing MooTools Implements: [Options]
    static Configurable = class {
        constructor(defaultSettings, initialSettings = {}) {
            this.settings = { ...defaultSettings, ...initialSettings };
        }
        updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings };
        }
    };

    // Internal state properties
    #currentRequest = null;
    #registeredButtons = [];
    #isOpen = false;
    #resizeHandlerRef = null;
    #escapeKeyHandlerRef = null;
    #dialogElement = null;
    #backdropElement = null;

    // Default configuration for the overlay dialog
    static DEFAULT_SETTINGS = {
        onDisplayComplete: () => {}, // Callback when dialog content is injected
        verticalOffset: null,
        backdropTransparency: 0.35,
        backdropColor: "#000000",
        dialogWidth: 420,
        isDraggable: true,
        enableEscapeKey: true,
        dismissOnBackdropClick: true,
        showCloseButton: true,
        hideTitleBar: false,
        hideFootbar: false,
        confirmLabel: "Confirm",
        cancelLabel: "Dismiss",
        dialogMarkup: `<div class="dialog-header"><h1>{_HEADING_}</h1></div><div class="dialog-body"><div class="content-wrapper">{_CONTENT_AREA_}</div></div><div class="dialog-footbar"></div>`
    };

    /**
     * Initializes the overlay dialog controller.
     * @param {object} initialConfiguration - User-provided settings to override defaults.
     */
    constructor(initialConfiguration) {
        this.config = new OverlayWindowController.Configurable(OverlayWindowController.DEFAULT_SETTINGS, initialConfiguration);
    }

    /**
     * Creates a DOM element with given tag, attributes, and content.
     * @param {string} tagName - The tag name of the element.
     * @param {object} attributes - Object of attributes to set.
     * @param {string} innerHTML - Inner HTML content.
     * @returns {HTMLElement} The created DOM element.
     */
    #createElement(tagName, attributes = {}, innerHTML = '') {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                if (key === 'class') {
                    element.className = attributes[key];
                } else if (key === 'events') {
                    for (const eventType in attributes[key]) {
                        element.addEventListener(eventType, attributes[key][eventType]);
                    }
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            }
        }
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        return element;
    }

    /**
     * Public method to display the modal dialog.
     * @param {object} displayOptions - Options specific to this display instance.
     */
    display(displayOptions = {}) {
        if (this.#isOpen) {
            console.warn("Overlay dialog is already open. Hiding existing before displaying new.");
            this.conceal();
        }

        // Merge instance settings with display-specific options
        const currentDisplaySettings = { ...this.config.settings, ...displayOptions };

        this.#manageBackdrop('show', currentDisplaySettings);
        this.#registeredButtons = []; // Clear previous buttons

        let dialogType = currentDisplaySettings.model || "alert"; // Default to alert

        switch (dialogType) {
            case "confirm":
                this.registerActionBtn(currentDisplaySettings.confirmLabel, "action-btn primary-btn margin-right", () => {
                    try { currentDisplaySettings.callback && currentDisplaySettings.callback(); } catch (error) { console.error("Confirm callback error:", error); }
                    this.conceal();
                });
                this.registerActionBtn(currentDisplaySettings.cancelLabel, "action-btn secondary-btn");
                break;
            case "modal":
                // No default buttons, custom buttons expected externally
                break;
            case "modal-async": // Renamed from modal-ajax
                // No default buttons, custom buttons expected externally
                break;
            case "alert":
            default:
                this.registerActionBtn(currentDisplaySettings.confirmLabel, "action-btn primary-btn");
                break;
        }

        this.#dialogElement = this.#constructDialogElement(currentDisplaySettings);
        document.body.appendChild(this.#dialogElement);

        this.#dialogElement.style.width = `${currentDisplaySettings.dialogWidth}px`;

        if (currentDisplaySettings.hideTitleBar) this.#dialogElement.classList.add("hide-title-bar");
        if (currentDisplaySettings.hideFootbar) this.#dialogElement.classList.add("hide-footbar");

        if (currentDisplaySettings.showCloseButton) this.#attachDismissButton();

        if (currentDisplaySettings.isDraggable) {
            this.#enableDragging(this.#dialogElement, this.#dialogElement.querySelector(".dialog-header"));
            this.#dialogElement.classList.add("is-draggable");
        }

        // Handle async content loading if applicable
        if (dialogType === "modal-async") {
            const fetchParams = currentDisplaySettings.param || {};
            this.#fetchRemoteContent({
                url: fetchParams.url || "",
                onContentLoaded: fetchParams.onRequestComplete || (() => {})
            });
        } else {
            // For non-async modals, ensure initial positioning is applied
            this.#repositionElement();
        }

        this.#enableEscapeDismissal();
        this.#isOpen = true;

        this.config.settings.onDisplayComplete();
    }

    /**
     * Public method to hide the modal dialog.
     */
    conceal() {
        if (!this.#isOpen) return;

        if (this.#currentRequest) {
            try {
                this.#currentRequest.abort(); // Use abort if available, or cancel
            } catch (err) {
                console.warn("Could not abort pending request:", err);
            }
            this.#currentRequest = null;
        }

        this.#manageBackdrop('hide');
        this.#isOpen = false;
        // Clean up event listeners
        window.removeEventListener("resize", this.#resizeHandlerRef);
        window.removeEventListener("keydown", this.#escapeKeyHandlerRef);

        this.#dialogElement = null; // Clear reference
        this.#backdropElement = null; // Clear reference
    }

    /**
     * Registers an action button to be added to the modal's footer.
     * @param {string} buttonLabel - Text label for the button.
     * @param {string} cssClasses - CSS classes for styling the button.
     * @param {function} clickAction - Function to execute on button click. Defaults to hiding the modal.
     * @returns {HTMLElement} The created button element.
     */
    registerActionBtn(buttonLabel, cssClasses, clickAction) {
        const controlBtn = this.#createElement('button', {
            type: "button",
            title: buttonLabel,
            class: cssClasses,
            events: {
                click: clickAction ? clickAction.bind(this) : this.conceal.bind(this)
            }
        }, buttonLabel);
        this.#registeredButtons.push(controlBtn);
        return controlBtn;
    }

    /**
     * Constructs the main dialog element and inserts content.
     * @param {object} dialogConfig - Configuration for the current dialog instance.
     * @returns {HTMLElement} The constructed dialog element.
     */
    #constructDialogElement(dialogConfig) {
        const dialogElement = this.#createElement("div", { id: "overlay-dialog", class: "overlay-dialog" });
        const markupString = this.#renderTemplateString(dialogConfig.dialogMarkup, {
            _HEADING_: dialogConfig.title || "Untitled",
            _CONTENT_AREA_: dialogConfig.contents || ""
        });
        dialogElement.innerHTML = markupString;

        this.#placeActionButtons(dialogElement);
        return dialogElement;
    }

    /**
     * Injects all registered action buttons into the dialog's footer.
     * @param {HTMLElement} dialogEl - The main dialog element.
     */
    #placeActionButtons(dialogEl) {
        const footbar = dialogEl.querySelector(".dialog-footbar");
        if (footbar) {
            this.#registeredButtons.forEach(btn => footbar.appendChild(btn));
        } else {
            console.warn("Dialog footer element not found for button injection.");
        }
    }

    /**
     * Attaches a dismiss ('X') button to the dialog.
     */
    #attachDismissButton() {
        const dismissBtn = this.#createElement("a", { class: "dialog-dismiss-btn", href: "#", title: "Close" }, "x");
        const header = this.#dialogElement.querySelector(".dialog-header");
        if (header) {
            header.insertBefore(dismissBtn, header.firstChild); // Inject at the beginning of the header
        } else {
            this.#dialogElement.prepend(dismissBtn); // Fallback if no header
        }

        dismissBtn.addEventListener("click", (event) => {
            event.preventDefault();
            this.conceal();
        });
    }

    /**
     * Manages the overlay/backdrop element.
     * @param {string} action - 'show' or 'hide'.
     * @param {object} currentSettings - Current settings for this display action.
     */
    #manageBackdrop(action, currentSettings = this.config.settings) {
        switch (action) {
            case 'show':
                this.#manageBackdrop('hide'); // Ensure existing backdrop is removed
                this.#backdropElement = this.#createElement("div", { id: "overlay-backdrop" });
                document.body.appendChild(this.#backdropElement);
                this.#backdropElement.style.backgroundColor = currentSettings.backdropColor;
                this.#backdropElement.style.opacity = '0';
                this.#backdropElement.style.transition = 'opacity 0.2s ease-in-out';

                // Trigger fade-in after a slight delay to allow CSS transition
                setTimeout(() => {
                    this.#backdropElement.style.opacity = currentSettings.backdropTransparency;
                }, 10);

                if (currentSettings.dismissOnBackdropClick) {
                    this.#backdropElement.addEventListener("click", (event) => {
                        event.preventDefault();
                        this.conceal();
                    });
                }

                this.#resizeHandlerRef = this.#repositionElement.bind(this);
                window.addEventListener("resize", this.#resizeHandlerRef);
                break;
            case 'hide':
                if (this.#backdropElement) {
                    this.#backdropElement.style.opacity = '0';
                    this.#backdropElement.addEventListener('transitionend', () => {
                        if (this.#backdropElement && this.#backdropElement.parentNode) {
                            this.#backdropElement.parentNode.removeChild(this.#backdropElement);
                        }
                        this.#backdropElement = null;
                    }, { once: true });
                }
                if (this.#dialogElement && this.#dialogElement.parentNode) {
                    this.#dialogElement.parentNode.removeChild(this.#dialogElement);
                }
                break;
        }
    }

    /**
     * Fetches remote content for modal-async type dialogs.
     * @param {object} fetchParameters - Object containing url and onContentLoaded callback.
     */
    #fetchRemoteContent(fetchParameters) {
        if (!this.#dialogElement) return;

        this.#dialogElement.classList.add("is-loading");
        const contentArea = this.#dialogElement.querySelector(".content-wrapper");
        if (!contentArea) {
            console.error("Content wrapper not found for remote content.");
            this.#dialogElement.classList.remove("is-loading");
            return;
        }
        contentArea.innerHTML = ""; // Clear previous content

        const imagePattern = /\.(jpg|png|gif|webp)$/i; // Added webp
        if (fetchParameters.url.match(imagePattern)) {
            this.#dialogElement.classList.add("hide-footbar"); // Hide footer for images
            if (this.#backdropElement) {
                this.#backdropElement.replaceWith(this.#backdropElement.cloneNode(true)); // Re-clone to remove all events
                this.#backdropElement = document.getElementById("overlay-backdrop"); // Re-get reference
                if (this.config.settings.dismissOnBackdropClick) {
                    this.#backdropElement.addEventListener("click", (event) => {
                        event.preventDefault();
                        this.conceal();
                    });
                }
            }

            const img = new Image();
            img.onload = () => {
                this.#dialogElement.classList.remove("is-loading");
                contentArea.innerHTML = ''; // Clear any loading indicators
                contentArea.appendChild(img);
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease-in';
                setTimeout(() => img.style.opacity = '1', 50); // Fade in image

                const computedStyle = window.getComputedStyle(contentArea);
                const paddingLeft = parseFloat(computedStyle.paddingLeft);
                const paddingRight = parseFloat(computedStyle.paddingRight);
                const paddingTop = parseFloat(computedStyle.paddingTop);
                const paddingBottom = parseFloat(computedStyle.paddingBottom);

                const targetWidth = img.naturalWidth + paddingLeft + paddingRight;
                const targetHeight = img.naturalHeight + paddingTop + paddingBottom;

                // Directly set styles for width, height, and recalculate position
                this.#dialogElement.style.width = `${targetWidth}px`;
                contentArea.style.height = `${targetHeight}px`; // Adjust content area height
                this.#repositionElement();
                this.#enableEscapeDismissal();
                fetchParameters.onContentLoaded();
            };
            img.onerror = () => {
                this.#dialogElement.classList.remove("is-loading");
                contentArea.innerHTML = "Image failed to load.";
                this.#repositionElement();
            };
            img.src = fetchParameters.url;
            this.#currentRequest = img; // Store image for aborting if needed
        } else {
            // Fetch HTML content
            const xhr = new XMLHttpRequest();
            xhr.open('GET', fetchParameters.url, true);
            xhr.onload = () => {
                this.#dialogElement.classList.remove("is-loading");
                if (xhr.status >= 200 && xhr.status < 400) {
                    const responseHTML = xhr.responseText;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(responseHTML, 'text/html');
                    const scripts = doc.querySelectorAll('script');

                    // Extract and execute scripts
                    let scriptContent = '';
                    scripts.forEach(script => {
                        if (script.src) {
                            // For external scripts, consider dynamic loading or warning
                            console.warn(`External script from ${script.src} not executed directly for security.`);
                        } else {
                            scriptContent += script.textContent + '\n';
                        }
                        script.parentNode.removeChild(script); // Remove script tags from parsed HTML
                    });

                    contentArea.innerHTML = doc.body.innerHTML;
                    fetchParameters.onContentLoaded();
                    try {
                        // Using Function constructor for script execution, safer than eval
                        new Function(scriptContent)();
                    } catch (e) {
                        console.error("Error executing inline scripts from fetched content:", e);
                    }

                    this.#repositionElement();
                    this.#enableEscapeDismissal();
                } else {
                    contentArea.innerHTML = "Error loading content: " + xhr.statusText;
                }
            };
            xhr.onerror = () => {
                this.#dialogElement.classList.remove("is-loading");
                contentArea.innerHTML = "Network error loading content.";
            };
            xhr.send();
            this.#currentRequest = xhr;
        }
    }

    /**
     * Repositions the dialog and updates backdrop height on resize or content change.
     */
    #repositionElement() {
        if (!this.#dialogElement || !this.#backdropElement) return;

        // Update backdrop height to cover full scrollable area
        this.#backdropElement.style.height = `${Math.max(document.body.scrollHeight, window.innerHeight)}px`;

        const dialogRect = this.#dialogElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const defaultOffset = 40;
        const topPosition = this.config.settings.verticalOffset !== null
            ? this.config.settings.verticalOffset
            : window.scrollY + defaultOffset;

        this.#dialogElement.style.top = `${topPosition}px`;
        this.#dialogElement.style.left = `${(viewportWidth - dialogRect.width) / 2}px`;
    }

    /**
     * Enables basic drag functionality for the dialog element.
     * @param {HTMLElement} elementToDrag - The element that will be moved.
     * @param {HTMLElement} handleElement - The element that initiates the drag.
     */
    #enableDragging(elementToDrag, handleElement) {
        if (!handleElement) {
            console.warn("Drag handle not found, dragging disabled.");
            return;
        }
        handleElement.style.cursor = "grab";

        let isDragging = false;
        let offset = { x: 0, y: 0 };

        const onMouseDown = (e) => {
            if (e.target !== handleElement && !handleElement.contains(e.target)) return; // Only drag if clicking handle
            isDragging = true;
            elementToDrag.style.position = 'absolute'; // Ensure position is absolute
            elementToDrag.style.zIndex = '10000'; // Bring to front

            const rect = elementToDrag.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            handleElement.style.cursor = "grabbing";
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            elementToDrag.style.left = `${e.clientX - offset.x}px`;
            elementToDrag.style.top = `${e.clientY - offset.y}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            handleElement.style.cursor = "grab";
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handleElement.addEventListener('mousedown', onMouseDown);
    }

    /**
     * Adds an event listener for the Escape key to close the modal.
     */
    #enableEscapeDismissal() {
        if (this.config.settings.enableEscapeKey) {
            this.#escapeKeyHandlerRef = (event) => {
                if (event.key === "Escape") {
                    this.conceal();
                }
            };
            window.addEventListener("keydown", this.#escapeKeyHandlerRef);
        }
    }

    /**
     * Simple template engine to replace placeholders in a string.
     * @param {string} templateString - The string containing placeholders like {_KEY_}.
     * @param {object} data - Object with key-value pairs for replacement.
     * @returns {string} The processed string.
     */
    #renderTemplateString(templateString, data) {
        let result = templateString;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result = result.replace(new RegExp(`{${key}}`, 'g'), data[key]);
            }
        }
        return result;
    }
}