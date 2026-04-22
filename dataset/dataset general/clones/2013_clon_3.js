/*
 *  Dynamic Content Overlay Component (DCOC) for Prototype.js, version 1.5
 *  Authored by Alex G. - http://example.com/alexg
 *
 *  Inspired by the original Facebox implementation by Chris Wanstrath - http://famspam.com/facebox
 *  Prototype adaptation initially by Phil Burrows - http://blog.philburrows.com
 *
 *  Distributed under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  For support and community discussions, visit:
 *  http://groups.google.com/group/prototype-dev/
 *
 *  Prerequisites:  Prototype.js framework & Script.aculo.us effects library,
 *                  along with necessary styling and graphic assets.
 *  Usage:          Attach 'data-modal-target' attribute to an element to activate this component.
 *
 *--------------------------------------------------------------------------*/


var ModalDisplayHandler = Class.create({
    // Sets up the modal component with initial configuration.
    setupModalComponent: function(userProvidedOptions) {
        // Default configuration settings for the modal overlay.
        this.optionsConfig = {
            loadSpinnerPath:      '/assets/images/spinner.gif', // Path to the loading animation image.
            closeBtnImagePath:    '/assets/images/close_btn.gif', // Path to the close button image.
            supportedMediaRegex:  new RegExp('\\.' + ['png', 'jpg', 'jpeg', 'gif', 'webp'].join('|') + '$', 'i'), // Regex for image file types.
            isCurrentlyActive:    false, // Flag indicating if the modal is actively displayed.
            animationSpeed:       0.35, // Duration for show/hide animations in seconds.
            initialZIndex:        1000, // Base z-index for the modal overlay.
            modalMarkupTemplate:  `
                <div id="dynamic-content-overlay" style="display:none; position: fixed; z-index: ${this.initialZIndex};">
                    <div class="modal-popup-container">
                        <table class="modal-structure-table">
                            <tbody>
                                <tr>
                                    <td class="top-left-corner"/><td class="top-border"/><td class="top-right-corner"/>
                                </tr>
                                <tr>
                                    <td class="left-border"/>
                                    <td class="modal-body-area">
                                        <div class="modal-content-area">
                                            <!-- Content will be loaded here -->
                                        </div>
                                        <div class="modal-footer-section">
                                            <a href="#" class="modal-close-button" role="button" aria-label="Close dialog">
                                                <img src="/assets/images/close_btn.gif" alt="Close" class="modal-close-icon" />
                                            </a>
                                        </div>
                                    </td>
                                    <td class="right-border"/>
                                </tr>
                                <tr>
                                    <td class="bottom-left-corner"/><td class="bottom-border"/><td class="bottom-right-corner"/>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>`
        };

        // Merge user-provided options with defaults.
        if (userProvidedOptions) {
            Object.extend(this.optionsConfig, userProvidedOptions);
        }

        // Ensure document body is available before appending markup.
        if (!document.body) {
            console.error("DCOC: Document body not found. Cannot initialize modal.");
            return;
        }

        // Insert the modal HTML structure into the document body.
        $(document.body).insert({ bottom: this.optionsConfig.modalMarkupTemplate });

        // Preload essential images to avoid flickering.
        this.imagePreloader = [ new Image(), new Image() ];
        this.imagePreloader[0].src = this.optionsConfig.closeBtnImagePath;
        this.imagePreloader[1].src = this.optionsConfig.loadSpinnerPath;

        const instanceRef = this; // Reference to 'this' for nested functions.
        // Preload background images used in the modal's decorative corners/borders.
        $$('#dynamic-content-overlay .top-border, #dynamic-content-overlay .bottom-border, #dynamic-content-overlay .left-border, #dynamic-content-overlay .right-border, #dynamic-content-overlay .top-left-corner, #dynamic-content-overlay .top-right-corner, #dynamic-content-overlay .bottom-left-corner, #dynamic-content-overlay .bottom-right-corner').each(function(element){
            const bgImageStyle = element.getStyle('background-image');
            if (bgImageStyle && bgImageStyle.startsWith('url(')) {
                const imageUrl = bgImageStyle.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
                const img = new Image();
                img.src = imageUrl;
                instanceRef.imagePreloader.push(img);
            }
        });
        
        // Store a reference to the main modal element for frequent access.
        this.modalOverlayElement = $('dynamic-content-overlay');
        // Bind key press event handler to the instance for proper context.
        this.keyboardEventHandler = this.handleKeyboardEvents.bindAsEventListener(this);
        
        // Attach click event listeners to elements that trigger the modal.
        this.monitorTriggerElements();

        // Attach event listeners for closing the modal via internal buttons.
        const componentReference = this;
        // Close button within the modal footer.
        const closeLink = $$('#dynamic-content-overlay .modal-close-button').first();
        if (closeLink) {
            Event.observe(closeLink, 'click', function(eventObject){
                Event.stop(eventObject); // Prevent default link behavior.
                componentReference.hideModal();
            });
        }
        // Close image within the modal footer (redundant but kept for clone fidelity).
        const closeImage = $$('#dynamic-content-overlay .modal-close-icon').first();
        if (closeImage) {
            Event.observe(closeImage, 'click', function(eventObject){
                Event.stop(eventObject); // Prevent default link behavior.
                componentReference.hideModal();
            });
        }
    },
    
    // Handles keyboard events, specifically the Escape key for closing the modal.
    handleKeyboardEvents: function(eventObject) {
        // If the Escape key (keyCode 27) is pressed, close the modal.
        if (eventObject.keyCode === 27) {
            this.hideModal();
            return; // Exit after handling Escape key.
        }
        
        // If a click event outside the modal occurs, close it.
        // This check is combined for efficiency, but could be separated if needed.
        if (eventObject.type === 'click' && !Event.element(eventObject).descendantOf(this.modalOverlayElement)) {
            this.hideModal();
        }
    },
    
    // Attaches click event listeners to elements designed to open the modal.
    monitorTriggerElements: function() {
        const componentSelf = this;
        // Select all elements with the 'data-modal-target' attribute.
        const triggerElements = $$('a[data-modal-target], area[data-modal-target]');

        if (triggerElements.length === 0) {
            // console.warn("DCOC: No elements with 'data-modal-target' found to monitor.");
            return; // No triggers, nothing to do.
        }

        triggerElements.each(function(triggerElement){
            try {
                Event.observe(triggerElement, 'click', function(eventObject){
                    Event.stop(eventObject); // Prevent default link/area behavior.
                    componentSelf.processTriggerClick(triggerElement, eventObject);
                });
            } catch (error) {
                console.error("DCOC: Error observing trigger element click:", error);
            }
        });
    },
    
    // Displays a loading spinner inside the modal content area.
    showLoadingIndicator: function() {
        const modalContentContainer = $$('#dynamic-content-overlay .modal-content-area').first();
        if (!modalContentContainer) {
            console.error("DCOC: Modal content container not found for loading indicator.");
            return;
        }

        // Clear any existing content or previous loading indicators.
        modalContentContainer.childElements().each(function(childElem){
            childElem.remove();
        });

        // Insert the new loading spinner.
        const loadingSpinnerHTML = `<div class="modal-loading-spinner"><img src="${this.optionsConfig.loadSpinnerPath}" alt="Loading..." /></div>`;
        modalContentContainer.insert({ bottom: loadingSpinnerHTML });
        
        // Ensure the modal is visible before positioning it.
        if (!this.modalOverlayElement.visible()) {
            new Effect.Appear(this.modalOverlayElement, { duration: this.optionsConfig.animationSpeed, queue: 'end' });
        }

        // Calculate and apply modal position to center it approximately.
        const currentScrollPosition = document.viewport.getScrollOffsets();
        const viewportHeight = document.viewport.getHeight();
        const viewportWidth = document.viewport.getWidth();
        const modalWidth = this.modalOverlayElement.getWidth(); // Get width after content is in.

        // Position slightly above the vertical center.
        this.modalOverlayElement.setStyle({
            'top': (currentScrollPosition.top + (viewportHeight / 10)) + 'px',
            'left': (viewportWidth / 2 - (modalWidth / 2)) + 'px',
            'z-index': this.optionsConfig.initialZIndex + 1 // Bring to front
        });
        
        // Attach global event listeners for closing modal via keyboard or outside click.
        // Ensure they are attached only once when modal is active.
        if (!this.optionsConfig.isCurrentlyActive) {
            Event.observe(document, 'keypress', this.keyboardEventHandler);
            Event.observe(document, 'click', this.keyboardEventHandler);
            this.optionsConfig.isCurrentlyActive = true;
        }
    },
    
    // Displays the actual content within the modal.
    displayContent: function(contentToDisplay, customClassModifier) {
        const modalContentContainer = $$('#dynamic-content-overlay .modal-content-area').first();
        if (!modalContentContainer) {
            console.error("DCOC: Modal content container not found for displaying content.");
            return;
        }

        // Remove any existing loading indicator.
        const currentLoader = $$('#dynamic-content-overlay .modal-loading-spinner').first();
        if (currentLoader) {
            currentLoader.remove();
        }

        // Apply custom CSS class if provided.
        if (customClassModifier) {
            modalContentContainer.addClassName(customClassModifier);
        }

        // Insert the new content.
        if (typeof contentToDisplay === 'string' || contentToDisplay instanceof Element) {
             modalContentContainer.insert({ bottom: contentToDisplay });
        } else {
             console.error("DCOC: Invalid content type provided for displayContent.");
             modalContentContainer.insert({ bottom: "<p>Error: Could not load content.</p>" });
        }
       
        // Ensure all child elements within the body are visible (e.g., if hidden by previous state).
        $$('#dynamic-content-overlay .modal-body-area').first().childElements().each(function(childElem){
            childElem.show();
        });
        		
        // If modal is not yet visible, make it appear. This might happen if 'loading' wasn't explicitly called first.
        if (!this.modalOverlayElement.visible()) {
            new Effect.Appear(this.modalOverlayElement, { duration: this.optionsConfig.animationSpeed, queue: 'end' });
        }
        
        // Recalculate position as content might change modal dimensions.
        const viewportWidth = document.viewport.getWidth();
        const modalWidth = this.modalOverlayElement.getWidth();
        this.modalOverlayElement.setStyle({
            'left': (viewportWidth / 2 - (modalWidth / 2)) + 'px'
        });
        
        // Re-attach event listeners (defensive, should ideally be managed by isCurrentlyActive flag).
        // This ensures they are active even if 'showLoadingIndicator' was skipped.
        if (!this.optionsConfig.isCurrentlyActive) {
             Event.observe(document, 'keypress', this.keyboardEventHandler);
             Event.observe(document, 'click', this.keyboardEventHandler);
             this.optionsConfig.isCurrentlyActive = true;
        }
    },
    
    // Hides and closes the modal overlay.
    hideModal: function() {
        if (!this.modalOverlayElement || !this.modalOverlayElement.visible()) {
            // Modal is already hidden or not initialized.
            return;
        }
        
        // Fade out the modal element.
        new Effect.Fade(this.modalOverlayElement, { 
            duration: this.optionsConfig.animationSpeed,
            afterFinish: () => { // ES6 arrow function for 'this' context, if Prototype version allows.
                // Reset content area and remove custom classes.
                const modalContentContainer = $$('#dynamic-content-overlay .modal-content-area').first();
                if (modalContentContainer) {
                    modalContentContainer.childElements().each(elem => elem.remove());
                    modalContentContainer.removeClassName(); // Remove all custom classes.
                }

                // Remove global event listeners to prevent memory leaks.
                Event.stopObserving(document, 'keypress', this.keyboardEventHandler);
                Event.stopObserving(document, 'click', this.keyboardEventHandler);
                this.optionsConfig.isCurrentlyActive = false; // Mark modal as inactive.
            }
        });
    },
    
    // Processes the click event on a trigger element to determine content source and display it.
    processTriggerClick: function(triggerElement, eventObject) {
        this.showLoadingIndicator(); // Always show loading indicator first.
        
        // Extract custom class modifier from data attribute.
        const customClassModifier = triggerElement.readAttribute('data-modal-class');
        // Fallback to rel attribute if data-modal-class is not present.
        const relAttributeMatch = triggerElement.rel ? triggerElement.rel.match(/facebox\[\.(\w+)\]/) : null;
        const finalClassModifier = customClassModifier || (relAttributeMatch ? relAttributeMatch[1] : null);

        const resourceURL = triggerElement.href;
        if (!resourceURL) {
            console.error("DCOC: Trigger element has no href attribute.", triggerElement);
            this.displayContent("<p>Error: Missing content source.</p>", finalClassModifier);
            return;
        }

        // Check if the URL points to an internal anchor.
        if (resourceURL.match(/^#/)) {
            const targetElementId = resourceURL.substring(1); // Remove '#' prefix.
            const originalElement = $(targetElementId);

            if (originalElement) {
                // Create a deep clone of the target element to avoid modifying the original.
                // Using cloneNode(true) for a more robust copy.
                const contentToDisplay = new Element(originalElement.tagName);
                contentToDisplay.innerHTML = originalElement.innerHTML;
                this.displayContent(contentToDisplay, finalClassModifier);
            } else {
                this.displayContent("<p>Error: Internal target element not found.</p>", finalClassModifier);
            }
        } 
        // Check if the URL points to an image.
        else if (resourceURL.match(this.optionsConfig.supportedMediaRegex)) {
            const mediaObject = new Image();
            const componentInstance = this;

            mediaObject.onload = function() {
                componentInstance.displayContent(`<div class="image-wrapper"><img src="${mediaObject.src}" alt="Modal Image" /></div>`, finalClassModifier);
            };
            mediaObject.onerror = function() {
                console.error("DCOC: Failed to load image from URL:", mediaObject.src);
                componentInstance.displayContent("<p>Error: Could not load image.</p>", finalClassModifier);
            };
            mediaObject.src = resourceURL;
        } 
        // Otherwise, assume it's an AJAX request for external content.
        else {
            const componentInstance = this;
            new Ajax.Request(resourceURL, {
                method: 'get',
                onFailure: function(ajaxResponse) {
                    console.error("DCOC: AJAX request failed for URL:", resourceURL, ajaxResponse);
                    componentInstance.displayContent(`<p>Error loading content: ${ajaxResponse.statusText || 'Unknown error'}</p>`, finalClassModifier);
                },
                onSuccess: function(ajaxResponse) {
                    // Check for empty or invalid response.
                    if (!ajaxResponse.responseText || ajaxResponse.responseText.trim() === '') {
                        componentInstance.displayContent("<p>Warning: Received empty content.</p>", finalClassModifier);
                    } else {
                        componentInstance.displayContent(ajaxResponse.responseText, finalClassModifier);
                    }
                },
                onException: function(request, error) {
                    console.error("DCOC: AJAX request exception for URL:", resourceURL, error);
                    componentInstance.displayContent(`<p>An unexpected error occurred during content loading.</p>`, finalClassModifier);
                },
                // Add a timeout for robustness.
                timeout: 10000, // 10 seconds timeout.
                onTimeout: function() {
                    console.warn("DCOC: AJAX request timed out for URL:", resourceURL);
                    componentInstance.displayContent("<p>Error: Content loading timed out.</p>", finalClassModifier);
                }
            });
        }
    }
});

// Global instance of the ModalDisplayHandler.
var globalModalInstance;

// Initialize the modal component once the DOM is fully loaded.
document.observe('dom:loaded', function(){
    globalModalInstance = new ModalDisplayHandler();
});