// -----------------------------------------------------------------------------------
//
//	Visual Content Display Module v1.1.0
//	Developed by Synthetix Labs - http://www.synthetixlabs.com
//	Release Date: 2023-10-27
//
//	This module provides an interactive overlay for displaying images and media.
//	For licensing details, please refer to the project's official documentation.
//	
//	Special thanks to community contributors and open-source initiatives.
//
// -----------------------------------------------------------------------------------

//
//	Module Configuration Parameters
//
const assetLoaderIconPath = "/assets/img/spinner.gif";
const assetCloseButtonPath = "/assets/img/close_btn.png";

const overlayAlphaValue = 0.85;	// Controls the opacity of the background dimmer
const enableTransitions = true;	// Toggles visual animations for resizing and fading
const scaleAnimationFactor = 6;	// Defines speed for frame resizing (1=slowest, 10=fastest)
const frameMarginPx = 12;		// Padding around the displayed content within its frame

// -----------------------------------------------------------------------------------

//
//	Internal State Variables
//
let mediaCollection = [];
let currentMediaIndex = -1;

let overlayTransitionDurationSec = 0;
let frameTransitionDurationSec = 0;

// Initialize transition durations based on configuration
if (enableTransitions) {
    overlayTransitionDurationSec = 0.25;
    const effectiveScaleFactor = Math.max(1, Math.min(scaleAnimationFactor, 10)); // Clamp between 1 and 10
    frameTransitionDurationSec = (11 - effectiveScaleFactor) * 0.12;
} else {
    overlayTransitionDurationSec = 0;
    frameTransitionDurationSec = 0;
}

// -----------------------------------------------------------------------------------

//
//	DOM Manipulation Utilities
//	Encapsulates common DOM operations for cleaner code.
//
const DOMUtil = {
    // Retrieves an element by its ID.
    getById: (id) => document.getElementById(id),

    // Sets the width of an element.
    setWidth: (element, width) => {
        if (element) element.style.width = `${width}px`;
    },

    // Sets the height of an element.
    setHeight: (element, height) => {
        if (element) element.style.height = `${height}px`;
    },

    // Sets the top position of an element.
    setTop: (element, top) => {
        if (element) element.style.top = `${top}px`;
    },

    // Updates the source URL of an image element.
    setImageSource: (imgElement, src) => {
        if (imgElement) imgElement.src = src;
    },

    // Updates the href attribute of an anchor element.
    setLinkHref: (anchorElement, href) => {
        if (anchorElement) anchorElement.href = href;
    },

    // Sets the inner HTML content of an element.
    setMarkup: (element, content) => {
        if (element) element.innerHTML = content;
    },

    // Shows a DOM element by removing display: none.
    displayElement: (element) => {
        if (element) element.style.display = ''; // Reset to default display
    },

    // Hides a DOM element by setting display: none.
    concealElement: (element) => {
        if (element) element.style.display = 'none';
    },

    // Creates a new DOM element with optional attributes and children.
    createAndAppend: (parent, tag, id, className, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        if (id) element.id = id;
        if (className) element.className = className;
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }
        children.forEach(child => element.appendChild(child));
        parent.appendChild(element);
        return element;
    },

    // Adds a class to an element.
    addClass: (element, className) => {
        if (element && className) element.classList.add(className);
    },

    // Removes a class from an element.
    removeClass: (element, className) => {
        if (element && className) element.classList.remove(className);
    }
};

// -----------------------------------------------------------------------------------

//
//	Array Manipulation Helpers
//
const ArrayUtil = {
    // Removes duplicate entries from an array of objects based on a key property.
    // Assumes items are objects with a 'src' property for uniqueness.
    deduplicateMedia: (arr) => {
        const seen = new Set();
        return arr.filter(item => {
            const isDuplicate = seen.has(item.src);
            seen.add(item.src);
            return !isDuplicate;
        });
    },

    // Clears all elements from an array.
    clearArray: (arr) => {
        while (arr.length > 0) {
            arr.pop();
        }
    }
};

// -----------------------------------------------------------------------------------

//
//	Core MediaDisplay Class Definition
//	Manages the lifecycle and interactions of the visual content viewer.
//
class MediaDisplay {
    constructor() {
        this.viewerElements = {}; // Stores references to key DOM elements
        this.currentFrameWidth = 0;
        this.currentFrameHeight = 0;
        this.keyHandler = this.handleKeyPress.bind(this); // Bind once for event listeners

        this.setupViewer();
    }

    //
    //	setupViewer()
    //	Initializes the module by scanning the DOM for media links and
    //	dynamically inserting the necessary HTML structure for the viewer.
    //
    setupViewer() {
        if (!document.body) {
            console.error("MediaDisplay: Document body not found. Cannot initialize.");
            return;
        }

        // Scan for media links and attach event listeners
        const mediaLinkSelectors = 'a[rel*="lightbox"], area[rel*="lightbox"]';
        document.querySelectorAll(mediaLinkSelectors).forEach(link => {
            // Ensure the link has an href and the rel attribute contains 'lightbox'
            if (link.href && link.getAttribute('rel').toLowerCase().includes('lightbox')) {
                link.addEventListener('click', (evt) => {
                    evt.preventDefault(); // Prevent default link behavior
                    this.openMedia(link);
                });
            }
        });

        // Dynamically create and append viewer elements to the document body
        this.createDOMStructure(document.body);

        // Apply initial sizing for animated transitions
        if (enableTransitions) {
            DOMUtil.setWidth(this.viewerElements.outerFrame, 250);
            DOMUtil.setHeight(this.viewerElements.outerFrame, 250);
        } else {
            DOMUtil.setWidth(this.viewerElements.outerFrame, 1);
            DOMUtil.setHeight(this.viewerElements.outerFrame, 1);
        }

        // Configure CSS transitions if enabled
        if (enableTransitions) {
            const overlayElem = this.viewerElements.overlay;
            if (overlayElem) {
                overlayElem.style.transition = `opacity ${overlayTransitionDurationSec}s ease-in-out`;
            }
            const outerFrameElem = this.viewerElements.outerFrame;
            if (outerFrameElem) {
                outerFrameElem.style.transition = `width ${frameTransitionDurationSec}s ease-in-out, height ${frameTransitionDurationSec}s ease-in-out`;
            }
            const mediaContentElem = this.viewerElements.mediaContent;
            if (mediaContentElem) {
                mediaContentElem.style.transition = `opacity ${frameTransitionDurationSec}s ease-in-out`;
            }
            const metadataContainerElem = this.viewerElements.metadataContainer;
            if (metadataContainerElem) {
                metadataContainerElem.style.transition = `height ${frameTransitionDurationSec}s ease-in-out, opacity ${frameTransitionDurationSec}s ease-in-out`;
            }
        }
    }

    // Helper to create the entire DOM structure for the viewer
    createDOMStructure(bodyElement) {
        // Overlay
        this.viewerElements.overlay = DOMUtil.createAndAppend(bodyElement, 'div', 'viewerOverlay', null, { style: 'display:none; opacity:0;' });
        this.viewerElements.overlay.addEventListener('click', () => this.closeViewer());

        // Main Viewer Wrapper
        this.viewerElements.mainWrapper = DOMUtil.createAndAppend(bodyElement, 'div', 'mainViewerWrapper', null, { style: 'display:none;' });
        this.viewerElements.mainWrapper.addEventListener('click', (e) => {
            if (e.target.id === 'mainViewerWrapper') { // Only close if main wrapper itself is clicked
                this.closeViewer();
            }
        });

        // Outer Frame Container
        this.viewerElements.outerFrame = DOMUtil.createAndAppend(this.viewerElements.mainWrapper, 'div', 'contentFrameContainer');

        // Inner Media Container
        this.viewerElements.innerContainer = DOMUtil.createAndAppend(this.viewerElements.outerFrame, 'div', 'innerMediaContainer');

        // Media Content (Image/Video Placeholder)
        this.viewerElements.mediaContent = DOMUtil.createAndAppend(this.viewerElements.innerContainer, 'img', 'displayedMediaContent');

        // Navigation Overlay (Prev/Next)
        this.viewerElements.navOverlay = DOMUtil.createAndAppend(this.viewerElements.innerContainer, 'div', 'navigationOverlay');
        this.viewerElements.prevButton = DOMUtil.createAndAppend(this.viewerElements.navOverlay, 'a', 'prevMediaButton', null, { href: '#' });
        this.viewerElements.prevButton.addEventListener('click', (e) => { e.preventDefault(); this.navigateMedia(-1); });
        this.viewerElements.nextButton = DOMUtil.createAndAppend(this.viewerElements.navOverlay, 'a', 'nextMediaButton', null, { href: '#' });
        this.viewerElements.nextButton.addEventListener('click', (e) => { e.preventDefault(); this.navigateMedia(1); });

        // Loading Indicator
        this.viewerElements.loadingIndicator = DOMUtil.createAndAppend(this.viewerElements.innerContainer, 'div', 'loadingSpinner');
        const loadingLink = DOMUtil.createAndAppend(this.viewerElements.loadingIndicator, 'a', 'loadingSpinnerLink', null, { href: '#' });
        loadingLink.addEventListener('click', (e) => { e.preventDefault(); this.closeViewer(); });
        DOMUtil.createAndAppend(loadingLink, 'img', null, null, { src: assetLoaderIconPath });

        // Metadata and Controls Container
        this.viewerElements.metadataContainer = DOMUtil.createAndAppend(this.viewerElements.mainWrapper, 'div', 'mediaMetadataContainer');
        this.viewerElements.metadataWrapper = DOMUtil.createAndAppend(this.viewerElements.metadataContainer, 'div', 'metadataContentWrapper');

        // Details (Caption & Number)
        this.viewerElements.mediaDetails = DOMUtil.createAndAppend(this.viewerElements.metadataWrapper, 'div', 'mediaDetailsBlock');
        this.viewerElements.captionDisplay = DOMUtil.createAndAppend(this.viewerElements.mediaDetails, 'span', 'mediaCaption');
        this.viewerElements.indexDisplay = DOMUtil.createAndAppend(this.viewerElements.mediaDetails, 'span', 'mediaIndexDisplay');

        // Bottom Navigation (Close Button)
        this.viewerElements.bottomNav = DOMUtil.createAndAppend(this.viewerElements.metadataWrapper, 'div', 'bottomControls');
        const closeLink = DOMUtil.createAndAppend(this.viewerElements.bottomNav, 'a', 'closeViewerButton', null, { href: '#' });
        closeLink.addEventListener('click', (e) => { e.preventDefault(); this.closeViewer(); });
        DOMUtil.createAndAppend(closeLink, 'img', null, null, { src: assetCloseButtonPath });
    }

    //
    //	openMedia()
    //	Activates the viewer, populates the media collection, and displays the first item.
    //
    async openMedia(triggerElement) {
        this.concealSelectElements();
        this.concealFlashObjects();

        // Position viewer and show overlay
        const { pageWidth, pageHeight, scrollY } = this.getPageMetrics();
        DOMUtil.setHeight(this.viewerElements.overlay, pageHeight);
        
        // Use CSS classes for transitions
        DOMUtil.addClass(this.viewerElements.overlay, 'active-overlay'); // Triggers opacity transition
        this.viewerElements.overlay.style.opacity = overlayAlphaValue; // Ensure target opacity is set
        
        const viewerTopOffset = scrollY + (pageHeight / 10);
        DOMUtil.setTop(this.viewerElements.mainWrapper, viewerTopOffset);
        DOMUtil.displayElement(this.viewerElements.mainWrapper);

        // Populate mediaCollection
        mediaCollection = [];
        let currentMediaSrc = triggerElement.href;
        let currentMediaTitle = triggerElement.title || '';
        let relAttribute = triggerElement.getAttribute('rel');
        let mediaGroup = relAttribute.toLowerCase().match(/lightbox\[(.*?)\]/); // Extract group name if present

        if (mediaGroup) { // Part of a set
            const groupName = mediaGroup[1];
            const allGroupLinks = document.querySelectorAll(`a[rel*="lightbox[${groupName}]"], area[rel*="lightbox[${groupName}]"]`);
            allGroupLinks.forEach(link => {
                if (link.href) {
                    mediaCollection.push({ src: link.href, title: link.title || '' });
                }
            });
            mediaCollection = ArrayUtil.deduplicateMedia(mediaCollection);
            currentMediaIndex = mediaCollection.findIndex(item => item.src === currentMediaSrc);
            if (currentMediaIndex === -1) { // Fallback if not found (shouldn't happen)
                mediaCollection.unshift({ src: currentMediaSrc, title: currentMediaTitle });
                currentMediaIndex = 0;
            }
        } else { // Single media item
            mediaCollection.push({ src: currentMediaSrc, title: currentMediaTitle });
            currentMediaIndex = 0;
        }

        this.switchMediaItem(currentMediaIndex);
        this.enableKeyBindings();
    }

    //
    //	switchMediaItem()
    //	Hides current elements, preloads the new image, then resizes the container.
    //
    async switchMediaItem(targetIndex) {
        if (targetIndex < 0 || targetIndex >= mediaCollection.length) {
            console.warn(`MediaDisplay: Attempted to switch to invalid index ${targetIndex}.`);
            return;
        }

        currentMediaIndex = targetIndex; // Update global state
        const mediaItem = mediaCollection[currentMediaIndex];

        // Conceal current media and details for transition
        DOMUtil.displayElement(this.viewerElements.loadingIndicator);
        DOMUtil.concealElement(this.viewerElements.mediaContent);
        DOMUtil.concealElement(this.viewerElements.navOverlay);
        DOMUtil.concealElement(this.viewerElements.metadataContainer);
        DOMUtil.concealElement(this.viewerElements.indexDisplay);

        try {
            const { width, height } = await this.preloadMedia(mediaItem.src);
            DOMUtil.setImageSource(this.viewerElements.mediaContent, mediaItem.src);
            this.adjustFrameDimensions(width, height);
        } catch (error) {
            console.error(`MediaDisplay: Failed to load media ${mediaItem.src}`, error);
            // Optionally display an error image or close the viewer
            this.closeViewer();
        }
    }

    // Preloads an image and returns its dimensions.
    preloadMedia(src) {
        return new Promise((resolve, reject) => {
            const preloader = new Image();
            preloader.onload = () => resolve({ width: preloader.width, height: preloader.height });
            preloader.onerror = () => reject(new Error('Image preload failed'));
            preloader.src = src;
            if (preloader.complete) { // Handle cached images
                resolve({ width: preloader.width, height: preloader.height });
            }
        });
    }

    //
    //	adjustFrameDimensions()
    //	Resizes the outer frame to fit the new media content.
    //
    adjustFrameDimensions(contentW, contentH) {
        const outerFrameElement = this.viewerElements.outerFrame;
        if (!outerFrameElement) return;

        this.currentFrameWidth = outerFrameElement.offsetWidth;
        this.currentFrameHeight = outerFrameElement.offsetHeight;

        const desiredFrameW = contentW + (frameMarginPx * 2);
        const desiredFrameH = contentH + (frameMarginPx * 2);

        // Apply new dimensions. CSS transitions will handle the animation if enabled.
        DOMUtil.setWidth(outerFrameElement, desiredFrameW);
        DOMUtil.setHeight(outerFrameElement, desiredFrameH);

        // Adjust nav button heights
        DOMUtil.setHeight(this.viewerElements.prevButton, contentH);
        DOMUtil.setHeight(this.viewerElements.nextButton, contentH);

        // Adjust metadata container width
        DOMUtil.setWidth(this.viewerElements.metadataContainer, desiredFrameW);

        // Wait for potential CSS transition to complete before showing image
        if (enableTransitions && (desiredFrameW !== this.currentFrameWidth || desiredFrameH !== this.currentFrameHeight)) {
            const onTransitionEnd = () => {
                outerFrameElement.removeEventListener('transitionend', onTransitionEnd);
                this.presentMediaContent();
            };
            outerFrameElement.addEventListener('transitionend', onTransitionEnd);
        } else {
            // If no animation, or dimensions are same, show immediately
            setTimeout(() => this.presentMediaContent(), enableTransitions ? 100 : 0); // Small delay for consistency
        }
    }

    //
    //	presentMediaContent()
    //	Displays the media content and initiates preloading of adjacent items.
    //
    presentMediaContent() {
        DOMUtil.concealElement(this.viewerElements.loadingIndicator);
        DOMUtil.displayElement(this.viewerElements.mediaContent);
        this.viewerElements.mediaContent.style.opacity = 1; // Triggers opacity transition if enabled

        this.refreshMetadata();
        this.prefetchAdjacentMedia();
    }

    //
    //	refreshMetadata()
    //	Updates caption, index display, and bottom controls.
    //
    refreshMetadata() {
        const currentItem = mediaCollection[currentMediaIndex];
        if (!currentItem) return;

        DOMUtil.setMarkup(this.viewerElements.captionDisplay, currentItem.title);
        DOMUtil.displayElement(this.viewerElements.captionDisplay);

        if (mediaCollection.length > 1) {
            DOMUtil.setMarkup(this.viewerElements.indexDisplay, `Image ${currentMediaIndex + 1} of ${mediaCollection.length}`);
            DOMUtil.displayElement(this.viewerElements.indexDisplay);
        } else {
            DOMUtil.concealElement(this.viewerElements.indexDisplay);
        }

        // Show metadata container (will animate height/opacity if transitions enabled)
        DOMUtil.displayElement(this.viewerElements.metadataContainer);
        this.viewerElements.metadataContainer.style.opacity = 1; // Ensure target opacity is set
        this.viewerElements.metadataContainer.style.height = ''; // Let content determine height for slide-down effect

        // Synchronize navigation buttons after metadata is visible
        setTimeout(() => this.synchronizeControls(), frameTransitionDurationSec * 1000 + 50); // Small delay after metadata transition
    }

    //
    //	synchronizeControls()
    //	Manages visibility of previous/next navigation buttons.
    //
    synchronizeControls() {
        DOMUtil.displayElement(this.viewerElements.navOverlay);

        // Hide prev button if first item, show otherwise
        if (currentMediaIndex === 0) {
            DOMUtil.concealElement(this.viewerElements.prevButton);
        } else {
            DOMUtil.displayElement(this.viewerElements.prevButton);
            DOMUtil.setLinkHref(this.viewerElements.prevButton, '#'); // Reset href
        }

        // Hide next button if last item, show otherwise
        if (currentMediaIndex === mediaCollection.length - 1) {
            DOMUtil.concealElement(this.viewerElements.nextButton);
        } else {
            DOMUtil.displayElement(this.viewerElements.nextButton);
            DOMUtil.setLinkHref(this.viewerElements.nextButton, '#'); // Reset href
        }
    }

    //
    //	navigateMedia()
    //	Changes to the previous or next media item in the collection.
    //
    navigateMedia(direction) {
        let newIndex = currentMediaIndex + direction;
        if (newIndex >= 0 && newIndex < mediaCollection.length) {
            this.switchMediaItem(newIndex);
        }
    }

    //
    //	enableKeyBindings()
    //	Activates keyboard navigation for the viewer.
    //
    enableKeyBindings() {
        document.addEventListener('keydown', this.keyHandler);
    }

    //
    //	disableKeyBindings()
    //	Deactivates keyboard navigation.
    //
    disableKeyBindings() {
        document.removeEventListener('keydown', this.keyHandler);
    }

    //
    //	handleKeyPress()
    //	Processes keyboard events for navigation and closing.
    //
    handleKeyPress(event) {
        if (event.keyCode === 27) { // Escape key
            this.closeViewer();
        } else if (event.keyCode === 37) { // Left arrow
            this.navigateMedia(-1);
        } else if (event.keyCode === 39) { // Right arrow
            this.navigateMedia(1);
        }
    }

    //
    //	prefetchAdjacentMedia()
    //	Preloads the previous and next images to improve user experience.
    //
    prefetchAdjacentMedia() {
        // Prefetch previous image
        if (currentMediaIndex > 0) {
            const prevItem = mediaCollection[currentMediaIndex - 1];
            if (prevItem) {
                new Image().src = prevItem.src;
            }
        }
        // Prefetch next image
        if (currentMediaIndex < mediaCollection.length - 1) {
            const nextItem = mediaCollection[currentMediaIndex + 1];
            if (nextItem) {
                new Image().src = nextItem.src;
            }
        }
    }

    //
    //	closeViewer()
    //	Deactivates the viewer, fades out elements, and restores page state.
    //
    closeViewer() {
        this.disableKeyBindings();
        
        // Fade out metadata and main wrapper
        this.viewerElements.metadataContainer.style.opacity = 0;
        this.viewerElements.mainWrapper.style.opacity = 0;

        // Fade out overlay
        this.viewerElements.overlay.style.opacity = 0;

        const transitionEndHandler = () => {
            this.viewerElements.overlay.removeEventListener('transitionend', transitionEndHandler);
            DOMUtil.concealElement(this.viewerElements.mainWrapper);
            DOMUtil.concealElement(this.viewerElements.overlay);
            DOMUtil.removeClass(this.viewerElements.overlay, 'active-overlay'); // Remove class that sets opacity
            this.restoreSelectElements();
            this.restoreFlashObjects();
            ArrayUtil.clearArray(mediaCollection); // Clear media data
            currentMediaIndex = -1;
        };

        if (enableTransitions) {
            // Wait for the overlay fade-out to complete
            this.viewerElements.overlay.addEventListener('transitionend', transitionEndHandler);
        } else {
            // Immediately hide if no transitions
            transitionEndHandler();
        }
    }

    //
    //	Utility Functions for Page State Management
    //

    // Gets current page scroll and size metrics.
    getPageMetrics() {
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

        let pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // If page height is less than document height, use document height
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        pageHeight = Math.max(pageHeight, documentHeight);

        return { scrollX, scrollY, pageWidth, pageHeight };
    }

    // Hides select boxes (problematic in IE6 for overlays).
    concealSelectElements() {
        document.querySelectorAll('select').forEach(select => {
            select.dataset.originalVisibility = select.style.visibility; // Store original
            select.style.visibility = 'hidden';
        });
    }

    // Restores visibility of select boxes.
    restoreSelectElements() {
        document.querySelectorAll('select').forEach(select => {
            select.style.visibility = select.dataset.originalVisibility || ''; // Restore or clear
            delete select.dataset.originalVisibility;
        });
    }

    // Hides flash/object embeds (problematic in IE6 for overlays).
    concealFlashObjects() {
        document.querySelectorAll('object, embed').forEach(obj => {
            obj.dataset.originalVisibility = obj.style.visibility; // Store original
            obj.style.visibility = 'hidden';
        });
    }

    // Restores visibility of flash/object embeds.
    restoreFlashObjects() {
        document.querySelectorAll('object, embed').forEach(obj => {
            obj.style.visibility = obj.dataset.originalVisibility || ''; // Restore or clear
            delete obj.dataset.originalVisibility;
        });
    }
}

// -----------------------------------------------------------------------------------

//
//	Initialize the MediaDisplay module once the DOM is fully loaded.
//
document.addEventListener('DOMContentLoaded', () => {
    window.mediaViewerInstance = new MediaDisplay();
});