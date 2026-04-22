(function($){
    // Enhances jQuery functionality with our media carousel plugin.
    $.fn.mediaCarousel = function(customConfig){
        // Ensure configuration object exists.
        const effectiveConfig = customConfig || {};
        // Iterate over each selected DOM element to apply the carousel.
        return this.each(function() {
            // Pass the current DOM element as the container to the carousel instance.
            effectiveConfig.containerElement = this;
            new MediaCarousel(effectiveConfig);
        });
    };
}(jQuery));

/**
 * @class MediaCarousel
 * @description Manages a responsive image/media gallery with navigation, transitions, and touch support.
 */
class MediaCarousel {
    /**
     * @constructor
     * @param {object} initConfig - Configuration options for the carousel.
     */
    constructor(initConfig) {
        // Merge default settings with user-provided configuration.
        this.config = $.extend({
            elementId: false,               // Optional ID selector for the container if not passed as element.
            containerElement: false,        // The DOM element hosting the carousel.
            transitionStyle: "fade",        // Animation type: "fade" (currently only one supported).
            transitionDurationMs: 300,      // Speed of transitions in milliseconds.
            enableTouchGestures: true,      // Allow swiping for navigation.
            enableKeyboardNavigation: true, // Allow arrow keys for navigation.
            displayPageCounter: true,       // Show current page number (e.g., 1/3).
            displayNavigationDots: true,    // Show clickable dots for page navigation.
            thumbsPerPage: "all",           // Number of thumbnails to show per page, or "all".
            maxProcessedMedia: "all",       // Maximum number of media items to process from the DOM.
            displayCaptions: false,         // Show comments/captions for media items.
            displayImageIndex: true,        // Show current media item index (e.g., 1/10) in modal view.
            triggerElement: false,          // Selector for an external button to open the modal viewer.
            paddingOffset: 110,             // Padding around the media in modal view.
            debugMode: false                // Enable console logging for debugging.
        }, initConfig);

        // Initialize internal state variables.
        this.currentMediaIndex = 0;             // Index of the currently displayed media item in the viewer.
        this.mediaItems = [];                   // Array to store processed media data (src, thumb, comment).
        this.totalMediaCount = 0;               // Total number of media items available.
        this.currentPageNumber = 1;             // Current page number in thumbnail view.
        this.totalPageCount = 0;                // Total number of pages in thumbnail view.
        this.viewportWidth = $(window).width(); // Current window width.
        this.viewportHeight = $(window).height(); // Current window height.

        this.thumbnailElements = null;          // jQuery collection of thumbnail images.
        this.mainDisplayArea = null;            // jQuery object for the main media display container in modal.
        this.loadingIndicator = null;           // jQuery object for the loading spinner.
        this.navigationDots = null;             // jQuery object for page navigation dots.

        this.isPageTransitionActive = false;    // Flag to prevent rapid page changes.
        this.isModalOpen = false;               // Flag indicating if the media viewer is open.
        this.isModalTransitionActive = false;   // Flag to prevent rapid modal open/close.
        this.isContentTransitionActive = false; // Flag to prevent rapid media content changes.

        this.touchStartX = null;                // X-coordinate for touch start.
        this.touchEndX = null;                  // X-coordinate for touch end.

        // Start the carousel initialization process.
        this.initialize();
    }

    /**
     * @private
     * @description Initializes the carousel by setting up the container, parsing media, and loading assets.
     */
    initialize() {
        // Determine the target container element.
        if (this.config.containerElement) {
            this.containerElement = $(this.config.containerElement);
        } else if (this.config.elementId) {
            this.containerElement = $(this.config.elementId);
        } else {
            this.logDebugMessage("Error: No container element or ID provided for MediaCarousel.");
            return; // Abort if no container is found.
        }

        // Find all images within the container to be used as thumbnails.
        this.thumbnailElements = this.containerElement.find("img");
        let initialImageCount = this.thumbnailElements.length;

        // Process each thumbnail to extract media data.
        this.thumbnailElements.each((idx, thumbEl) => {
            // Apply maxProcessedMedia limit if specified.
            if (this.config.maxProcessedMedia !== "all" && idx >= this.config.maxProcessedMedia) {
                $(thumbEl).parent("div").remove(); // Remove parent div if it exists.
                $(thumbEl).remove(); // Remove the thumbnail itself.
                return; // Skip processing this thumbnail.
            }

            const mediaSrc = $(thumbEl).attr("data-img");
            // If essential data is missing, log an error and skip.
            if (!mediaSrc) {
                this.logDebugMessage(`Warning: Thumbnail at index ${idx} missing 'data-img' attribute.`);
                $(thumbEl).parent("div").remove();
                $(thumbEl).remove();
                return;
            }

            this.mediaItems.push({
                sourceUrl: mediaSrc,
                thumbnailRef: thumbEl,
                captionText: $(thumbEl).attr("data-comment") || "",
                actualHeight: 0,
                actualWidth: 0
            });
        });

        // Update the total count of valid media items.
        this.totalMediaCount = this.mediaItems.length;

        // If no media items are found after processing, stop initialization.
        if (this.totalMediaCount === 0) {
            this.logDebugMessage("No valid media items found to initialize MediaCarousel.");
            return;
        }

        // Calculate total pages for thumbnail view.
        this.totalPageCount = this.config.thumbsPerPage === "all"
            ? 1
            : Math.ceil(this.totalMediaCount / this.config.thumbsPerPage);

        // Preload all media assets to ensure smooth transitions later.
        this.preloadMedia();
    }

    /**
     * @private
     * @description Asynchronously loads all media items to cache them.
     */
    preloadMedia() {
        let loadedCount = 0;
        const mediaLoadPromises = this.mediaItems.map((media, idx) => {
            return new Promise((resolve, reject) => {
                this.loadImageAsync(media.sourceUrl, (img) => {
                    media.actualWidth = img.naturalWidth;
                    media.actualHeight = img.naturalHeight;
                    loadedCount++;
                    resolve();
                }, () => {
                    this.logDebugMessage(`Error loading media item: ${media.sourceUrl}`);
                    // Mark as loaded even on error to continue the process.
                    // A more robust solution might remove failed items or replace with a placeholder.
                    loadedCount++;
                    resolve();
                });
            });
        });

        // Once all media items are processed (loaded or failed), build the DOM.
        Promise.all(mediaLoadPromises).then(() => {
            this.constructDOM();
        });
    }

    /**
     * @private
     * @description Constructs the necessary DOM elements for the carousel.
     */
    constructDOM() {
        let domStructure = "";

        // Thumbnail navigation (prev/next buttons)
        domStructure += `
            <div class='carousel-navigation'>
                <div class='nav-button prev-page'></div>
                <div class='nav-button next-page'></div>
            </div>
        `;

        // Page number display for thumbnail view.
        if (this.config.displayPageCounter && this.config.thumbsPerPage !== "all") {
            domStructure += `
                <div class='page-counter'>
                    <span class='current-page-num'>${this.currentPageNumber}</span> / <span class='total-page-count'>${this.totalPageCount}</span>
                </div>
            `;
        }

        // Navigation dots for thumbnail pages.
        if (this.config.displayNavigationDots && this.config.thumbsPerPage !== "all") {
            domStructure += `<div class='page-dots-container'><div class='dots-wrapper'>`;
            for (let i = 1; i <= this.totalPageCount; i++) {
                domStructure += `<div class='page-dot' data-page='${i}'><span>${i}</span></div>`;
            }
            domStructure += `</div></div>`;
        }

        // Main viewer overlay structure.
        domStructure += `
            <div class='media-viewer-overlay'>
                <div class='viewer-content-wrapper'></div>
                <div class='loading-spinner'></div>
                <div class='close-viewer-button'></div>
        `;

        // Image index display in modal.
        if (this.config.displayImageIndex) {
            domStructure += `
                <div class='media-index-display'>
                    <span class='current-media-idx'>${this.currentMediaIndex + 1}</span> / <span class='total-media-count'>${this.totalMediaCount}</span>
                </div>
            `;
        }
        domStructure += `</div>`; // Close media-viewer-overlay

        // Append the generated HTML to the container.
        this.containerElement.append(domStructure);

        // Store references to key DOM elements.
        this.mainDisplayArea = this.containerElement.find(".media-viewer-overlay .viewer-content-wrapper");
        this.loadingIndicator = this.containerElement.find(".media-viewer-overlay .loading-spinner");
        this.navigationDots = this.containerElement.find(".page-dots-container .page-dot");

        // Set initial active state for navigation dots.
        if (this.config.displayNavigationDots && this.config.thumbsPerPage !== "all") {
            this.navigationDots.eq(this.currentPageNumber - 1).addClass("active-dot");
        }

        // Attach all event handlers.
        this.attachEventHandlers();
    }

    /**
     * @private
     * @description Attaches all necessary event listeners to DOM elements.
     */
    attachEventHandlers() {
        // Use 'instance' for 'this' context within callbacks.
        const instance = this;

        // Window resize handler for responsive layout.
        $(window).on("resize", () => {
            instance.adjustViewerDimensions();
            instance.scaleMediaContent();
        });

        // External trigger element to open the viewer.
        if (this.config.triggerElement) {
            $(this.config.triggerElement).on("click", () => instance.openViewer(0));
        }

        // Click on a thumbnail to open the viewer.
        this.thumbnailElements.on("click", function() {
            // Find the index of the clicked thumbnail within the processed media items.
            const clickedThumbRef = this;
            const mediaIndex = instance.mediaItems.findIndex(item => item.thumbnailRef === clickedThumbRef);
            if (mediaIndex !== -1) {
                instance.openViewer(mediaIndex);
            }
        });

        // Click on the overlay (but not on content/nav buttons) to close the viewer.
        this.containerElement.find(".media-viewer-overlay").on("click", function(event) {
            const targetClass = $(event.target).attr("class");
            // Only close if click is on the overlay background, not interactive elements.
            if (!targetClass || (!targetClass.includes("nav-button") && !targetClass.includes("viewer-media-element"))) {
                instance.closeViewer();
            }
        });

        // Next/Prev buttons for the thumbnail view (if applicable) and modal view.
        this.containerElement.find(".carousel-navigation .next-page").on("click", () => {
            if (instance.isModalOpen) {
                instance.showNextMedia();
            } else {
                instance.showNextPage();
            }
        });

        this.containerElement.find(".carousel-navigation .prev-page").on("click", () => {
            if (instance.isModalOpen) {
                instance.showPreviousMedia();
            } else {
                instance.showPreviousPage();
            }
        });

        // Page navigation dots click handler.
        this.navigationDots.on("click", function() {
            const pageNumber = parseInt($(this).attr("data-page"), 10);
            instance.jumpToPage(pageNumber);
        });

        // Close button for the modal viewer.
        this.containerElement.find(".close-viewer-button").on("click", () => instance.closeViewer());

        // Touch gesture support.
        if (this.config.enableTouchGestures) {
            this.containerElement.on('touchstart', (e) => {
                instance.touchStartX = e.originalEvent?.touches[0]?.pageX || 0;
                instance.touchEndX = 0; // Reset end position.
            });
            this.containerElement.on('touchmove', (e) => {
                instance.touchEndX = e.originalEvent?.touches[0]?.pageX || 0;
            });
            this.containerElement.on('touchend', () => {
                if (instance.touchStartX && instance.touchEndX) {
                    const swipeDistance = instance.touchEndX - instance.touchStartX;
                    const minSwipeThreshold = 50; // Minimum pixel distance for a swipe to register.

                    if (instance.isModalOpen) {
                        if (swipeDistance < -minSwipeThreshold) { instance.showNextMedia(); }
                        if (swipeDistance > minSwipeThreshold) { instance.showPreviousMedia(); }
                    } else {
                        if (swipeDistance < -minSwipeThreshold) { instance.showNextPage(); }
                        if (swipeDistance > minSwipeThreshold) { instance.showPreviousPage(); }
                    }
                }
                instance.touchStartX = null; // Reset for next gesture.
                instance.touchEndX = null;
            });
        }

        // Keyboard navigation support.
        if (this.config.enableKeyboardNavigation) {
            $(document).on("keydown", (e) => {
                if (instance.isModalOpen) {
                    if (e.key === "ArrowLeft") { e.preventDefault(); instance.showPreviousMedia(); }
                    if (e.key === "ArrowRight") { e.preventDefault(); instance.showNextMedia(); }
                    if (e.key === "Escape") { e.preventDefault(); instance.closeViewer(); }
                } else {
                    if (e.key === "ArrowLeft") { e.preventDefault(); instance.showPreviousPage(); }
                    if (e.key === "ArrowRight") { e.preventDefault(); instance.showNextPage(); }
                }
            });
        }

        // Initial display of thumbnails based on `thumbsPerPage`.
        if (this.config.thumbsPerPage === "all") {
            this.thumbnailElements.fadeIn(this.config.transitionDurationMs);
        } else {
            this.thumbnailElements.hide();
            this.thumbnailElements.slice(0, this.config.thumbsPerPage).show();
        }
    }

    /**
     * @public
     * @description Opens the media viewer modal and displays the specified media item.
     * @param {number} mediaIdx - The index of the media item to display.
     */
    openViewer(mediaIdx) {
        // Validate media index.
        if (mediaIdx < 0 || mediaIdx >= this.totalMediaCount) {
            this.logDebugMessage(`Attempted to open viewer with invalid media index: ${mediaIdx}`);
            return;
        }

        // Prevent opening if already in transition.
        if (this.isModalTransitionActive) {
            return;
        }
        this.isModalTransitionActive = true;

        this.currentMediaIndex = mediaIdx;
        this.updateViewerStatus(); // Update index display.
        this.adjustViewerDimensions(); // Set initial size.

        $("body").css("overflow", "hidden"); // Prevent body scroll when modal is open.
        this.mainDisplayArea.css("opacity", 0); // Start with hidden content.

        // Fade in the overlay.
        this.containerElement.find(".media-viewer-overlay").fadeIn(this.config.transitionDurationMs, () => {
            // Once overlay is visible, render the media content.
            this.renderMediaContent(() => {
                this.renderCaption();
                // Animate the media content into view.
                this.mainDisplayArea.animate({ opacity: 1 }, this.config.transitionDurationMs, () => {
                    this.isModalOpen = true;
                    this.isModalTransitionActive = false;
                });
            });
        });
    }

    /**
     * @public
     * @description Closes the media viewer modal.
     */
    closeViewer() {
        // Prevent closing if already in transition.
        if (this.isModalTransitionActive) {
            return;
        }
        this.isModalTransitionActive = true;

        this.isModalOpen = false; // Update state immediately.

        // Animate content out, then fade out the overlay.
        this.mainDisplayArea.animate({ opacity: 0 }, this.config.transitionDurationMs / 2, () => {
            this.containerElement.find(".media-viewer-overlay").fadeOut(this.config.transitionDurationMs, () => {
                $("body").css("overflow", "auto"); // Restore body scroll.
                this.isModalTransitionActive = false;
            });
        });
    }

    /**
     * @private
     * @description Performs a transition between media items.
     * @param {function} onComplete - Callback function to execute after the transition finishes.
     */
    performTransition(onComplete) {
        const instance = this;
        switch (this.config.transitionStyle) {
            case "fade":
                this.mainDisplayArea.animate({ opacity: 0 }, this.config.transitionDurationMs, () => {
                    instance.renderMediaContent(() => {
                        instance.renderCaption();
                        instance.mainDisplayArea.animate({ opacity: 1 }, instance.config.transitionDurationMs, () => {
                            if (onComplete) { onComplete(); }
                        });
                    });
                });
                break;
            default:
                this.logDebugMessage(`Unsupported transition style: ${this.config.transitionStyle}`);
                // If unsupported, just render without animation.
                this.renderMediaContent(() => {
                    this.renderCaption();
                    if (onComplete) { onComplete(); }
                });
        }
    }

    /**
     * @public
     * @description Displays the next media item in the viewer.
     */
    showNextMedia() {
        if (this.isContentTransitionActive) { return; }
        this.isContentTransitionActive = true;

        this.currentMediaIndex = (this.currentMediaIndex + 1) % this.totalMediaCount;
        this.performTransition(() => {
            this.updateViewerStatus();
            this.isContentTransitionActive = false;
        });
    }

    /**
     * @public
     * @description Displays the previous media item in the viewer.
     */
    showPreviousMedia() {
        if (this.isContentTransitionActive) { return; }
        this.isContentTransitionActive = true;

        this.currentMediaIndex = (this.currentMediaIndex - 1 + this.totalMediaCount) % this.totalMediaCount;
        this.performTransition(() => {
            this.updateViewerStatus();
            this.isContentTransitionActive = false;
        });
    }

    /**
     * @public
     * @description Jumps to a specific media item in the viewer.
     * @param {number} mediaIdx - The index of the media item to jump to.
     * @param {function} [onComplete] - Optional callback after the jump.
     */
    jumpToMedia(mediaIdx, onComplete) {
        if (this.isContentTransitionActive || mediaIdx < 0 || mediaIdx >= this.totalMediaCount) { return; }
        this.isContentTransitionActive = true;

        this.currentMediaIndex = mediaIdx;
        this.performTransition(() => {
            this.updateViewerStatus();
            this.isContentTransitionActive = false;
            if (onComplete) { onComplete(); }
        });
    }

    /**
     * @private
     * @description Renders the current media item (image) into the viewer.
     * @param {function} onRendered - Callback function after the media is appended and sized.
     */
    renderMediaContent(onRendered) {
        this.loadingIndicator.fadeIn(this.config.transitionDurationMs / 2); // Show loader.

        const currentMedia = this.mediaItems[this.currentMediaIndex];
        // Create a new image element to load the high-res source.
        this.loadImageAsync(currentMedia.sourceUrl, (loadedImg) => {
            this.loadingIndicator.fadeOut(this.config.transitionDurationMs / 2); // Hide loader.
            this.mainDisplayArea.empty(); // Clear previous content.

            const imgElement = $(`<img class='viewer-media-element' src='${loadedImg.src}' alt='${currentMedia.captionText}' />`);
            this.mainDisplayArea.append(imgElement);
            this.scaleMediaContent(); // Adjust size to fit viewer.
            if (onRendered) { onRendered(); }
        }, () => {
            this.loadingIndicator.fadeOut(this.config.transitionDurationMs / 2);
            this.logDebugMessage(`Failed to load media: ${currentMedia.sourceUrl}`);
            this.mainDisplayArea.empty().append("<p class='media-error-message'>Failed to load image.</p>");
            if (onRendered) { onRendered(); }
        });
    }

    /**
     * @private
     * @description Renders the caption/comment for the current media item.
     */
    renderCaption() {
        if (this.config.displayCaptions) {
            const currentMedia = this.mediaItems[this.currentMediaIndex];
            this.mainDisplayArea.find(".media-caption").remove(); // Remove existing caption.
            if (currentMedia.captionText) {
                this.mainDisplayArea.append(`<div class='media-caption'>${currentMedia.captionText}</div>`);
            }
        }
    }

    /**
     * @public
     * @description Moves to the next page of thumbnails.
     */
    showNextPage() {
        if (this.isPageTransitionActive || this.config.thumbsPerPage === "all") { return; }
        this.isPageTransitionActive = true;

        this.currentPageNumber = (this.currentPageNumber % this.totalPageCount) + 1;
        this.jumpToPage(this.currentPageNumber, () => {
            this.updateViewerStatus();
            this.isPageTransitionActive = false;
        });
    }

    /**
     * @public
     * @description Moves to the previous page of thumbnails.
     */
    showPreviousPage() {
        if (this.isPageTransitionActive || this.config.thumbsPerPage === "all") { return; }
        this.isPageTransitionActive = true;

        this.currentPageNumber = (this.currentPageNumber - 2 + this.totalPageCount) % this.totalPageCount + 1;
        this.jumpToPage(this.currentPageNumber, () => {
            this.updateViewerStatus();
            this.isPageTransitionActive = false;
        });
    }

    /**
     * @public
     * @description Jumps to a specific page of thumbnails.
     * @param {number} pageNum - The page number to display (1-indexed).
     * @param {function} [onComplete] - Optional callback after the page transition.
     */
    jumpToPage(pageNum, onComplete) {
        if (pageNum < 1 || pageNum > this.totalPageCount || this.config.thumbsPerPage === "all") { return; }

        this.currentPageNumber = pageNum;
        this.containerElement.find(".page-counter .current-page-num").text(this.currentPageNumber);

        // Update active navigation dot.
        this.navigationDots.removeClass("active-dot").eq(this.currentPageNumber - 1).addClass("active-dot");

        // Hide all thumbnails, then show only those for the current page.
        this.thumbnailElements.hide();
        const startIndex = (this.currentPageNumber - 1) * this.config.thumbsPerPage;
        const endIndex = startIndex + this.config.thumbsPerPage;
        this.thumbnailElements.slice(startIndex, endIndex).show();

        this.updateViewerStatus();
        if (onComplete) { onComplete(); }
    }

    /**
     * @private
     * @description Loads an image asynchronously using a new Image object.
     * @param {string} src - The source URL of the image.
     * @param {function} onSuccess - Callback when image loads successfully.
     * @param {function} onError - Callback when image fails to load.
     */
    loadImageAsync(src, onSuccess, onError) {
        const img = new Image();
        img.onload = () => onSuccess(img);
        img.onerror = () => onError();
        img.src = src;
    }

    /**
     * @private
     * @description Adjusts the dimensions of the main viewer area based on window size and padding.
     */
    adjustViewerDimensions() {
        this.viewportWidth = $(window).width();
        this.viewportHeight = $(window).height();

        const adjustedWidth = this.viewportWidth - this.config.paddingOffset;
        const adjustedHeight = this.viewportHeight - this.config.paddingOffset;

        this.mainDisplayArea.css({
            "width": adjustedWidth,
            "height": adjustedHeight
        });
    }

    /**
     * @private
     * @description Scales the currently displayed media content (image) to fit within the viewer area.
     */
    scaleMediaContent() {
        const mediaElement = this.mainDisplayArea.find(".viewer-media-element");
        if (!mediaElement.length) { return; }

        // Reset dimensions to allow natural calculation.
        mediaElement.css({ "height": "", "width": "" });

        const containerWidth = this.mainDisplayArea.width();
        const containerHeight = this.mainDisplayArea.height();

        // If image width exceeds container, scale down width.
        mediaElement.width(containerWidth);
        // If scaled height still exceeds container height, scale down height instead.
        if (mediaElement.height() > containerHeight) {
            mediaElement.width(""); // Clear width to let height dictate.
            mediaElement.height(containerHeight);
        }
    }

    /**
     * @private
     * @description Updates dynamic information displayed in the viewer (e.g., current image index).
     */
    updateViewerStatus() {
        // Update media index display in modal.
        if (this.config.displayImageIndex) {
            this.containerElement.find(".media-viewer-overlay .current-media-idx").text(this.currentMediaIndex + 1);
            this.containerElement.find(".media-viewer-overlay .total-media-count").text(this.totalMediaCount);
        }
        // Update page counter for thumbnail view.
        if (this.config.displayPageCounter && this.config.thumbsPerPage !== "all") {
             this.containerElement.find(".page-counter .current-page-num").text(this.currentPageNumber);
             this.containerElement.find(".page-counter .total-page-count").text(this.totalPageCount);
        }
    }

    /**
     * @private
     * @description Logs messages to the console if debugMode is enabled.
     * @param {string} message - The message to log.
     */
    logDebugMessage(message) {
        if (this.config.debugMode) {
            console.log(`[MediaCarousel Debug]: ${message}`);
        }
    }
}