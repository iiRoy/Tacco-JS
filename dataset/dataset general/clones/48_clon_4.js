"use strict";

class VisualCarousel {
    constructor(viewpointContainerSelector, initialSourceManifest) {
        this.viewpointContainer = document.querySelector(viewpointContainerSelector);
        if (!this.viewpointContainer) {
            console.error("Target container for visual content not found:", viewpointContainerSelector);
            return;
        }

        this.sourceManifest = initialSourceManifest; // Array of image paths
        this.visualAssets = []; // Stores actual HTMLImageElements
        this.currentVisualIndex = 0;
        this.isContentReady = false;

        this.principalVisualElement = null; // The <img> element currently displayed

        // Bind 'this' context for event handlers
        this.establishEventObservers = this.establishEventObservers.bind(this);
        this.progressView = this.progressView.bind(this);
        this.regressView = this.regressView.bind(this);
        this.handlePointerInteraction = this.handlePointerInteraction.bind(this);
        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.suppressContextMenu = this.suppressContextMenu.bind(this);
    }

    // Asynchronously loads all images using Promises
    async loadContentAssets() {
        if (this.sourceManifest.length === 0) {
            this.viewpointContainer.innerHTML = '<p><strong>No visual content paths were provided.</strong></p>';
            return false;
        }

        const assetLoadPromises = this.sourceManifest.map(path => {
            return new Promise((resolve, reject) => {
                const mediaItem = new Image();
                mediaItem.onload = () => resolve(mediaItem);
                mediaItem.onerror = () => reject(new Error(`Failed to load visual asset: ${path}`));
                mediaItem.src = path;
            });
        });

        try {
            this.visualAssets = await Promise.all(assetLoadPromises);
            return true;
        } catch (error) {
            console.error("Error during visual asset loading:", error);
            this.viewpointContainer.innerHTML = `<p><strong>An error prevented content loading: ${error.message}</strong></p>`;
            return false;
        }
    }

    // Initializes the carousel display and attaches event listeners
    async commenceDisplay() {
        const preloaderOverlay = document.getElementById('preloadingImages');
        if (preloaderOverlay) {
            preloaderOverlay.style.display = 'block';
        }

        const assetsLoadedSuccessfully = await this.loadContentAssets();

        if (assetsLoadedSuccessfully) {
            if (preloaderOverlay) {
                preloaderOverlay.style.display = 'none';
            }
            this.isContentReady = true;

            // Dynamically create and append the initial image element
            this.principalVisualElement = document.createElement('img');
            this.principalVisualElement.id = 'mainContentVisual'; // Unique identifier
            this.principalVisualElement.alt = `visual item ${this.currentVisualIndex}`;
            this.refreshVisualDisplay(); // Set src and other attributes for the first image

            this.viewpointContainer.appendChild(this.principalVisualElement);

            this.establishEventObservers();
        } else {
            if (preloaderOverlay) {
                preloaderOverlay.style.display = 'none';
            }
            // Error message is already set by loadContentAssets if it failed
        }
    }

    // Updates the currently displayed image based on currentVisualIndex
    refreshVisualDisplay() {
        if (!this.isContentReady || !this.principalVisualElement || this.visualAssets.length === 0) {
            return;
        }
        const currentAsset = this.visualAssets[this.currentVisualIndex];
        this.principalVisualElement.src = currentAsset.src;
        // Replicate initial width/height setting for the first image only
        if (this.currentVisualIndex === 0 && currentAsset.width && currentAsset.height) {
             this.principalVisualElement.width = currentAsset.width;
             this.principalVisualElement.height = currentAsset.height;
        }
        this.principalVisualElement.alt = `visual item ${this.currentVisualIndex}`;
    }

    // Advances to the subsequent image in a cyclical sequence
    progressView() {
        if (!this.isContentReady) return;
        this.currentVisualIndex = (this.currentVisualIndex + 1) % this.visualAssets.length;
        this.refreshVisualDisplay();
    }

    // Recedes to the preceding image in a cyclical sequence
    regressView() {
        if (!this.isContentReady) return;
        this.currentVisualIndex = (this.currentVisualIndex - 1 + this.visualAssets.length) % this.visualAssets.length;
        this.refreshVisualDisplay();
    }

    // Configures all necessary event listeners
    establishEventObservers() {
        // Prevent browser's default context menu
        document.addEventListener('contextmenu', this.suppressContextMenu);

        // Mouse interaction on the main visual element
        if (this.principalVisualElement) {
            this.principalVisualElement.addEventListener('mousedown', this.handlePointerInteraction);
        }

        // Keyboard interaction across the document
        document.addEventListener('keydown', this.handleKeyboardInput);
    }

    // Manages mouse button interactions on the visual display
    handlePointerInteraction(event) {
        if (!this.isContentReady) return;
        event.preventDefault(); // Prevent default actions like image dragging

        // Map mouse button codes to specific actions
        const pointerActionMap = {
            0: () => this.progressView(), // Left click (button 0)
            2: () => this.regressView()   // Right click (button 2)
            // Middle click (button 1) is intentionally ignored, matching original behavior
        };

        const desiredAction = pointerActionMap[event.button];
        if (desiredAction) {
            desiredAction();
        }
    }

    // Manages keyboard input for navigation
    handleKeyboardInput(event) {
        if (!this.isContentReady) return;
        event.preventDefault(); // Prevent default browser actions for arrow keys

        // Map key codes/names to navigation actions
        const keyboardActionMap = {
            'ArrowLeft': () => this.regressView(),
            'ArrowUp': () => this.regressView(),
            'ArrowRight': () => this.progressView(),
            'ArrowDown': () => this.progressView(),
            37: () => this.regressView(), // Fallback for keyCode
            38: () => this.regressView(),
            39: () => this.progressView(),
            40: () => this.progressView()
        };

        const desiredAction = keyboardActionMap[event.key] || keyboardActionMap[event.keyCode];
        if (desiredAction) {
            desiredAction();
        }
    }

    // Prevents the browser's default context menu from appearing
    suppressContextMenu(event) {
        event.preventDefault();
    }
}

// Collection of initial visual content paths
const mediaContentSources = [
    "img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg"
];

// Execute logic once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the visual carousel with its target container and content sources
    const displayEngine = new VisualCarousel('#container', mediaContentSources);
    displayEngine.commenceDisplay();
});