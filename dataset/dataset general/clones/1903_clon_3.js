class DialogService {
  // Configurable options for the dialog behavior and appearance
  #settings = {
    onRenderComplete:    () => {}, // Callback invoked after dialog is added to DOM
    verticalOffset:      40,       // Top offset in pixels
    backdropAlpha:       0.3,      // Opacity of the background overlay
    backdropColor:       "#000000",// Color of the background overlay
    dialogWidth:         400,      // Default width of the dialog
    isDraggable:         true,     // Allow dragging the dialog by its header
    closeOnEscape:       true,     // Close dialog when ESC key is pressed
    closeOnBackdropClick:true,     // Close dialog when clicking the overlay
    forceImageDisplay:   true,     // Always display lightbox as image
    showCloseButton:     true,     // Display the 'X' close button
    omitHeader:          false,    // Hide the dialog header
    omitFooter:          false,    // Hide the dialog footer
    imageExtraWidth:     40,       // Additional width for lightbox images (padding, border)
    imageExtraHeight:    120,      // Additional height for lightbox images (padding, border)
    confirmLabel:        "Confirm",// Label for the affirmative button
    cancelLabel:         "Abort",  // Label for the negative button
    markupTemplate:      `
      <div class="modal-header-area">
        <h1>{_DIALOG_TITLE_}</h1>
      </div>
      <div class="modal-body-content">
        <div class="display-area">{_MAIN_CONTENT_}</div>
      </div>
      <div class="modal-footer-controls"></div>
    `
  };

  #activeAjaxRequest = null; // Stores the current AJAX request object
  #controlButtons = [];      // Array to hold action buttons for the dialog
  #mediaViewerState = {};    // State for lightbox functionality
  #dialogContainer = null;   // Reference to the main dialog DOM element
  #backdropElement = null;   // Reference to the overlay DOM element
  #resizeHandler = null;     // Stored reference for window resize event listener
  #escapeKeyHandler = null;  // Stored reference for escape key event listener

  /**
   * Initializes the DialogService with custom settings.
   * @param {object} userSettings - Optional settings to override defaults.
   */
  constructor(userSettings = {}) {
    Object.assign(this.#settings, userSettings);
  }

  /**
   * Public method to present a dialog window.
   * @param {object} options - Configuration for the specific dialog instance.
   * @returns {HTMLElement} The created dialog DOM element.
   */
  presentDialog(options = {}) {
    // Ensure essential options are present for basic operation
    if (!options || typeof options !== 'object') {
      console.error("DialogService: Invalid options provided to presentDialog.");
      return null;
    }

    // Determine if a full redraw is needed, or just content update
    const needsRedraw = options.redraw === undefined ? true : options.redraw;

    // Display the overlay if a full redraw is required
    if (needsRedraw) {
      this.#manageBackdrop("show");
    }

    // Handle different dialog types based on the 'model' option
    switch (options.model) {
      case "confirm":
        // Add a confirmation button
        this.createActionButton(this.#settings.confirmLabel, "btn-primary-action btn-spacing", () => {
          try {
            options.callback(); // Execute the callback for confirmation
          } catch (error) {
            console.error("DialogService: Error in confirm callback:", error);
          }
          this.dismissModal(); // Close the dialog after action
        });

        // Add a cancellation button
        this.createActionButton(this.#settings.cancelLabel, "btn-secondary-action");

        // Render the dialog structure
        this.#dialogContainer = this.#constructDialogElement(options);

        // Register ESC key behavior
        this.#registerEscapeHandler();
        break;

      case "modal":
        // Render a generic modal dialog
        this.#dialogContainer = this.#constructDialogElement(options);

        // Register ESC key behavior
        this.#registerEscapeHandler();
        break;

      case "modal-ajax":
        // Render a modal that fetches content asynchronously
        this.#dialogContainer = this.#constructDialogElement(options);

        // Fetch content from the specified URL
        this.#fetchContentAsync({
          url: options.params?.url || "",
          onComplete: options.params?.onComplete || (() => {})
        });
        break;

      case "media-viewer": // Renamed from 'lightbox'
        // Media viewer requires navigation arrows
        options.showArrows = true;

        // Store media viewer specific state
        this.#mediaViewerState = {
          itemElement: options.media?.itemElement,
          groupName: options.media?.groupName,
          currentIndex: options.media?.currentIndex
        };

        // Render the dialog structure
        this.#dialogContainer = this.#constructDialogElement(options);

        // Fetch media content
        this.#fetchContentAsync({
          url: options.params?.url || "",
          currentIndex: this.#mediaViewerState.currentIndex,
          redraw: options.redraw,
          onComplete: options.params?.onComplete || (() => {})
        });
        break;

      default: // Default case acts as an alert dialog
        // Add a single OK button
        this.createActionButton(this.#settings.confirmLabel, "btn-primary-action");

        // Render the dialog structure
        this.#dialogContainer = this.#constructDialogElement(options);

        // Register ESC key behavior
        this.#registerEscapeHandler();
        break;
    }

    // Apply custom width
    if (this.#dialogContainer) {
      this.#dialogContainer.style.width = `${this.#settings.dialogWidth}px`;

      // Apply header/footer visibility settings
      if (this.#settings.omitHeader) this.#dialogContainer.classList.add("no-header-display");
      if (this.#settings.omitFooter) this.#dialogContainer.classList.add("no-footer-display");

      // Add the 'X' close button if enabled
      if (this.#settings.showCloseButton) this.#insertDismissButton();

      // Enable dragging if configured
      if (this.#settings.isDraggable) {
        const dragHandle = this.#dialogContainer.querySelector(".modal-header-area");
        if (dragHandle) {
          this.#initiateDrag(this.#dialogContainer, dragHandle);
          dragHandle.style.cursor = "grab";
          this.#dialogContainer.classList.add("is-draggable");
        }
      }

      // Position and resize the dialog
      this.#positionAndResize();
    }

    return this.#dialogContainer;
  }

  /**
   * Public method to close and remove the dialog window.
   */
  dismissModal() {
    // Attempt to cancel any pending AJAX request
    if (this.#activeAjaxRequest && typeof this.#activeAjaxRequest.abort === 'function') {
      try {
        this.#activeAjaxRequest.abort();
      } catch (e) {
        console.warn("DialogService: Failed to abort AJAX request:", e);
      }
    }

    this.#manageBackdrop('hide'); // Hide and clean up the overlay
    this.#resetState();          // Reset internal state variables
  }

  /**
   * Private method to render the main dialog structure.
   * @param {object} dialogOptions - Options for the current dialog instance.
   * @returns {HTMLElement} The main dialog container element.
   */
  #constructDialogElement(dialogOptions) {
    let dialogElement;

    if (dialogOptions.redraw) {
      // If a full redraw is requested, create a new element
      dialogElement = document.createElement("div");
      dialogElement.id = "active-dialog-popup";
      dialogElement.className = "dialog-wrapper";
      document.body.appendChild(dialogElement);
    } else {
      // Otherwise, find the existing dialog element
      dialogElement = document.getElementById("active-dialog-popup");
      if (!dialogElement) {
        console.error("DialogService: Attempted to update non-existent dialog without redraw.");
        return null;
      }
    }

    // Apply template with dynamic content
    const htmlContent = this.#applyTemplateVariables(this.#settings.markupTemplate, {
      _DIALOG_TITLE_: dialogOptions.title || "Untitled Dialog",
      _MAIN_CONTENT_: dialogOptions.content || ""
    });

    dialogElement.innerHTML = htmlContent;

    // Inject all accumulated action buttons into the footer
    this.#attachControlsToFooter(dialogElement);

    // Add navigation arrows if required (for media viewer)
    if (dialogOptions.showArrows) {
      this.#addNavigationArrows(dialogElement);
    }

    // Execute the onRenderComplete callback
    this.#settings.onRenderComplete();

    return dialogElement;
  }

  /**
   * Public method to create and add a button to the dialog.
   * @param {string} label - Text label for the button.
   * @param {string} cssClass - CSS class(es) for styling the button.
   * @param {Function} clickHandler - Function to execute when the button is clicked.
   * @returns {HTMLElement} The created button element.
   */
  createActionButton(label, cssClass, clickHandler) {
    const buttonElement = document.createElement('a');
    buttonElement.title = label;
    buttonElement.textContent = label;
    buttonElement.className = cssClass;
    buttonElement.href = "#"; // Make it a clickable link

    // Use an arrow function for the click handler to maintain `this` context
    buttonElement.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      (clickHandler || this.dismissModal)(); // Execute handler or dismiss modal
    });

    this.#controlButtons.push(buttonElement);
    return buttonElement;
  }

  /**
   * Private method to inject all created buttons into the dialog's footer.
   * @param {HTMLElement} dialogElement - The main dialog container.
   */
  #attachControlsToFooter(dialogElement) {
    const footer = dialogElement.querySelector(".modal-footer-controls");
    if (footer) {
      this.#controlButtons.forEach(button => {
        footer.appendChild(button);
      });
    }
  }

  /**
   * Private method to add the 'X' close button to the dialog.
   */
  #insertDismissButton() {
    if (!this.#dialogContainer) return;

    const closeBtn = document.createElement("a");
    closeBtn.className = "dialog-close-btn";
    closeBtn.href = "#";
    closeBtn.innerHTML = "&times;"; // HTML entity for 'x'

    this.#dialogContainer.prepend(closeBtn); // Add to the top of the dialog

    // Event listener for the close button
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      this.dismissModal();
    });
  }

  /**
   * Private method to add navigation arrows for media viewer.
   * @param {HTMLElement} dialogElement - The main dialog container.
   */
  #addNavigationArrows(dialogElement) {
    // Create and inject the next image button
    const nextArrow = document.createElement("a");
    nextArrow.className = "next-media-item";
    nextArrow.style.display = "none"; // Initially hidden
    nextArrow.href = "#";
    nextArrow.innerHTML = "&raquo;"; // Right arrow

    dialogElement.prepend(nextArrow);

    nextArrow.addEventListener("click", (event) => {
      event.preventDefault();
      this.#showNextMedia();
    });

    // Create and inject the previous image button
    const prevArrow = document.createElement("a");
    prevArrow.className = "prev-media-item";
    prevArrow.style.display = "none"; // Initially hidden
    prevArrow.href = "#";
    prevArrow.innerHTML = "&laquo;"; // Left arrow

    dialogElement.prepend(prevArrow);

    prevArrow.addEventListener("click", (event) => {
      event.preventDefault();
      this.#showPreviousMedia();
    });

    // Set initial visibility of arrows
    this.#updateArrowVisibility();
  }

  /**
   * Private method to navigate to the next media item in a group.
   */
  #showNextMedia() {
    const groupItems = this.#getMediaItemsByGroup(this.#mediaViewerState.groupName);

    // Guard clause: no items or already at the end
    if (!groupItems || groupItems.length === 0 || this.#mediaViewerState.currentIndex >= groupItems.length - 1) {
      return;
    }

    this.#mediaViewerState.currentIndex++;
    const nextItem = groupItems[this.#mediaViewerState.currentIndex];

    // Re-present the dialog with the next item's content, without full redraw
    this.presentDialog({
      model: "media-viewer",
      title: nextItem.title,
      redraw: false, // Only update content, not the entire modal structure
      params: {
        url: nextItem.href,
        onComplete: () => {}
      },
      media: {
        itemElement: nextItem,
        groupName: this.#mediaViewerState.groupName,
        currentIndex: this.#mediaViewerState.currentIndex
      }
    });
  }

  /**
   * Private method to navigate to the previous media item in a group.
   */
  #showPreviousMedia() {
    const groupItems = this.#getMediaItemsByGroup(this.#mediaViewerState.groupName);

    // Guard clause: no items or already at the beginning
    if (!groupItems || groupItems.length === 0 || this.#mediaViewerState.currentIndex <= 0) {
      return;
    }

    this.#mediaViewerState.currentIndex--;
    const previousItem = groupItems[this.#mediaViewerState.currentIndex];

    // Re-present the dialog with the previous item's content, without full redraw
    this.presentDialog({
      model: "media-viewer",
      title: previousItem.title,
      redraw: false, // Only update content, not the entire modal structure
      params: {
        url: previousItem.href,
        onComplete: () => {}
      },
      media: {
        itemElement: previousItem,
        groupName: this.#mediaViewerState.groupName,
        currentIndex: this.#mediaViewerState.currentIndex
      }
    });
  }

  /**
   * Private method to control the visibility of navigation arrows.
   */
  #updateArrowVisibility() {
    if (!this.#dialogContainer) return;

    const leftArrow = this.#dialogContainer.querySelector('.prev-media-item');
    const rightArrow = this.#dialogContainer.querySelector('.next-media-item');

    if (!leftArrow || !rightArrow) return; // Guard against missing arrows

    const totalItems = this.countMediaItemsInGroup(this.#mediaViewerState.groupName);

    // Set visibility for the left (previous) arrow
    leftArrow.style.display = (this.#mediaViewerState.currentIndex === 0) ? 'none' : 'inline-block';

    // Set visibility for the right (next) arrow
    rightArrow.style.display = (totalItems > 0 && this.#mediaViewerState.currentIndex < totalItems - 1) ? 'inline-block' : 'none';
  }

  /**
   * Private method to retrieve all media elements belonging to a specific group.
   * @param {string} groupName - The name of the media group.
   * @returns {Array<HTMLElement>} An array of matching DOM elements.
   */
  #getMediaItemsByGroup(groupName) {
    // Select all <a> tags with a 'rel' attribute containing 'dialog-media[groupName]'
    const mediaLinks = Array.from(document.querySelectorAll("a[rel]")).filter(el =>
      el.getAttribute('rel')?.includes(`dialog-media[${groupName}]`)
    );
    return mediaLinks;
  }

  /**
   * Public method to count the number of media items in a specific group.
   * @param {string} groupName - The name of the media group.
   * @returns {number} The count of media items.
   */
  countMediaItemsInGroup(groupName) {
    return this.#getMediaItemsByGroup(groupName).length;
  }

  /**
   * Private method to manage the background overlay.
   * @param {'show'|'hide'} action - Action to perform on the overlay.
   */
  #manageBackdrop(action) {
    switch (action) {
      case 'show':
        // Ensure any previous overlay is hidden/removed before showing a new one
        this.#manageBackdrop('hide');

        this.#backdropElement = document.createElement("div");
        this.#backdropElement.id = "dialog-backdrop-overlay";
        this.#backdropElement.style.backgroundColor = this.#settings.backdropColor;
        this.#backdropElement.style.opacity = "0"; // Start invisible for fade-in
        document.body.appendChild(this.#backdropElement);

        // Simple fade-in effect
        setTimeout(() => {
          if (this.#backdropElement) {
            this.#backdropElement.style.transition = "opacity 0.2s ease-in-out";
            this.#backdropElement.style.opacity = String(this.#settings.backdropAlpha);
          }
        }, 10); // Small delay to allow CSS transition to apply

        // Add click behavior to backdrop if enabled
        if (this.#settings.closeOnBackdropClick) {
          this.#backdropElement.addEventListener("click", this.dismissModal.bind(this));
        }

        // Add window resize listener to reposition dialog
        this.#resizeHandler = this.#positionAndResize.bind(this);
        window.addEventListener("resize", this.#resizeHandler);
        break;

      case 'hide':
        // Remove event listeners
        if (this.#resizeHandler) {
          window.removeEventListener("resize", this.#resizeHandler);
          this.#resizeHandler = null;
        }
        if (this.#escapeKeyHandler) {
          window.removeEventListener("keydown", this.#escapeKeyHandler);
          this.#escapeKeyHandler = null;
        }

        // Remove overlay element
        if (this.#backdropElement) {
          this.#backdropElement.style.opacity = "0"; // Start fade-out
          this.#backdropElement.addEventListener('transitionend', () => {
            if (this.#backdropElement && this.#backdropElement.parentNode) {
              this.#backdropElement.parentNode.removeChild(this.#backdropElement);
            }
            this.#backdropElement = null;
          }, { once: true });
        } else {
            // If no transition, remove immediately
            const existingBackdrop = document.getElementById("dialog-backdrop-overlay");
            if (existingBackdrop && existingBackdrop.parentNode) {
                existingBackdrop.parentNode.removeChild(existingBackdrop);
            }
        }


        // Remove dialog element
        if (this.#dialogContainer && this.#dialogContainer.parentNode) {
          this.#dialogContainer.parentNode.removeChild(this.#dialogContainer);
          this.#dialogContainer = null;
        } else {
            // If no transition, remove immediately
            const existingDialog = document.getElementById("active-dialog-popup");
            if (existingDialog && existingDialog.parentNode) {
                existingDialog.parentNode.removeChild(existingDialog);
            }
        }
        break;
    }
  }

  /**
   * Private method to register the ESC key handler.
   */
  #registerEscapeHandler() {
    if (this.#settings.closeOnEscape && !this.#escapeKeyHandler) {
      this.#escapeKeyHandler = (event) => {
        if (event.key === "Escape") {
          this.dismissModal();
        }
      };
      window.addEventListener("keydown", this.#escapeKeyHandler);
    }
  }

  /**
   * Private method to fetch content asynchronously via AJAX.
   * @param {object} params - Object containing url and onComplete callback.
   */
  #fetchContentAsync(params) {
    if (!this.#dialogContainer) return;

    const contentArea = this.#dialogContainer.querySelector(".display-area");
    if (!contentArea) {
      console.error("DialogService: Content display area not found in dialog template.");
      return;
    }

    // Clear previous content and show a loading indicator
    contentArea.innerHTML = "<div class='loading-indicator'>Loading...</div>";

    this.#activeAjaxRequest = new XMLHttpRequest();
    this.#activeAjaxRequest.open("GET", params.url, true);
    this.#activeAjaxRequest.onreadystatechange = () => {
      if (this.#activeAjaxRequest.readyState === 4) {
        if (this.#activeAjaxRequest.status >= 200 && this.#activeAjaxRequest.status < 300) {
          // Success
          contentArea.innerHTML = this.#activeAjaxRequest.responseText;
          params.onComplete(this.#activeAjaxRequest.responseText);

          // If it's a media viewer, try to resize after content loads
          if (this.#mediaViewerState.groupName) {
            this.#positionAndResize();
          }
        } else {
          // Error
          contentArea.innerHTML = "<div class='error-message'>Failed to load content.</div>";
          console.error("DialogService: AJAX content load failed with status:", this.#activeAjaxRequest.status);
          params.onComplete(null, new Error("AJAX failed"));
        }
        this.#activeAjaxRequest = null; // Clear reference
      }
    };
    this.#activeAjaxRequest.send();
  }

  /**
   * Private method for simple string templating.
   * @param {string} templateString - The template string with placeholders like {_KEY_}.
   * @param {object} data - An object where keys match placeholders.
   * @returns {string} The processed string.
   */
  #applyTemplateVariables(templateString, data) {
    let result = templateString;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), data[key]);
      }
    }
    return result;
  }

  /**
   * Private method to position and resize the dialog centrally.
   */
  #positionAndResize() {
    if (!this.#dialogContainer) return;

    // Ensure display is block for correct measurements
    this.#dialogContainer.style.display = 'block';

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Recalculate dimensions for potential image content
    let currentDialogWidth = this.#dialogContainer.offsetWidth;
    let currentDialogHeight = this.#dialogContainer.offsetHeight;

    // Adjust for lightbox images
    if (this.#mediaViewerState.groupName) {
      const img = this.#dialogContainer.querySelector('.display-area img');
      if (img && img.naturalWidth && img.naturalHeight) {
        let naturalW = img.naturalWidth;
        let naturalH = img.naturalHeight;

        // Calculate max dimensions considering viewport and excess
        const maxW = viewportWidth - this.#settings.imageExtraWidth;
        const maxH = viewportHeight - this.#settings.imageExtraHeight;

        let newW = naturalW;
        let newH = naturalH;

        // Scale down if image is too large
        if (naturalW > maxW) {
          newW = maxW;
          newH = (naturalH * maxW) / naturalW;
        }
        if (newH > maxH) {
          newH = maxH;
          newW = (naturalW * maxH) / naturalH;
        }

        img.style.width = `${newW}px`;
        img.style.height = `${newH}px`;

        // Update dialog dimensions based on scaled image
        currentDialogWidth = newW + this.#settings.imageExtraWidth;
        currentDialogHeight = newH + this.#settings.imageExtraHeight;

        this.#dialogContainer.style.width = `${currentDialogWidth}px`;
      }
    }


    const topPosition = Math.max(this.#settings.verticalOffset, (viewportHeight - currentDialogHeight) / 2);
    const leftPosition = (viewportWidth - currentDialogWidth) / 2;

    this.#dialogContainer.style.top = `${topPosition}px`;
    this.#dialogContainer.style.left = `${leftPosition}px`;
    this.#dialogContainer.style.position = "fixed"; // Ensure it stays in place
    this.#dialogContainer.style.zIndex = "10001"; // Above backdrop
  }

  /**
   * Private method to implement basic drag functionality for the dialog.
   * @param {HTMLElement} element - The element to be dragged.
   * @param {HTMLElement} handle - The element that acts as the drag handle.
   */
  #initiateDrag(element, handle) {
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
      e.preventDefault();
      isDragging = true;
      element.style.cursor = "grabbing";
      handle.style.cursor = "grabbing";

      // Calculate initial offset relative to the element's position
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      // Add event listeners to the document to handle dragging outside the element
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', endDrag);
    };

    const dragMove = (e) => {
      if (!isDragging) return;
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
    };

    const endDrag = () => {
      isDragging = false;
      element.style.cursor = "default";
      handle.style.cursor = "grab";

      // Remove document-level event listeners
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', endDrag);
    };

    handle.addEventListener('mousedown', startDrag);
  }

  /**
   * Private method to reset the internal state of the dialog service.
   * Called after closing a dialog to prepare for the next one.
   */
  #resetState() {
    this.#controlButtons = [];
    this.#mediaViewerState = {};
    this.#activeAjaxRequest = null;
    // dialogContainer and backdropElement are nulled in #manageBackdrop('hide')
  }
}