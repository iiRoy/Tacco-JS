// product-rotator-module.js

// A utility object to hold various easing functions.
const AnimationEasings = {
  // Smoothly accelerates then decelerates.
  outQuadratic: (progression, initialVal, changeInVal, totalDuration) => {
    progression /= totalDuration;
    return -changeInVal * progression * (progression - 2) + initialVal;
  },
  // Stronger deceleration effect.
  outQuartic: (progression, initialVal, changeInVal, totalDuration) => {
    progression = progression / totalDuration - 1;
    return -changeInVal * (progression * progression * progression * progression - 1) + initialVal;
  },
  // Exponential deceleration, starts fast, ends very slow.
  outExponential: (progression, initialVal, changeInVal, totalDuration) => {
    return changeInVal * (-Math.pow(2, -10 * progression / totalDuration) + 1) + initialVal;
  }
};

// Provides a cross-browser requestAnimationFrame polyfill.
const getAnimationFrameRequester = () => {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         ((callback) => window.setTimeout(callback, 1000 / 60)); // Standard 60 FPS fallback
};

// Constants for configuration and internal logic.
const FRAME_SPEED_MULTIPLIER = 0.05;
const INERTIA_TIME_INCREMENT = 0.04; // Roughly 25 FPS update for inertia logic simulation
const MIN_FRAME_SPEED_THRESHOLD = 1; // Minimum speed for inertia to continue
const MIN_DRAG_DISTANCE_PX = 3; // Minimum pixel drag before frame change is considered

// The core class for the interactive 360-degree product viewer.
class ProductRotator {
  // Static property for requestAnimationFrame.
  static animationFrameRequest = getAnimationFrameRequester();

  /**
   * Initializes a new ProductRotator instance.
   * @param {string} containerId - The ID of the HTML element to contain the viewer.
   * @param {string} imageTemplate - The template string for image URLs (e.g., 'path/to/image-{i}.jpg').
   * @param {number} totalImages - The total number of frames/images in the sequence.
   */
  constructor(containerId, imageTemplate, totalImages) {
    this.viewerElement = document.getElementById(containerId);
    if (!this.viewerElement) {
      console.error(`ProductRotator: Container element with ID '${containerId}' not found.`);
      throw new Error('Viewer container not found.');
    }

    // Core configuration properties
    this.imagePathTemplate = imageTemplate;
    this.frameQuantity = totalImages;

    // State variables for loading and display
    this.loadedImageCount = 0;
    this.currentFrameIdx = 1;
    this.previousFrameIdx = 1;
    this.preloadedImages = []; // Stores Image objects for preloading
    this.imageElementCache = []; // Stores actual <img> DOM elements for display

    // State variables for user interaction (dragging)
    this.isInteracting = false;
    this.lastPointerX = 0;
    this.scrollDirection = null; // 'left' or 'right'
    this.currentSpeedFactor = 0; // Speed derived from user drag

    // State variables for inertia animation
    this.inertiaEffectDuration = 0;
    this.inertiaElapsedTime = 0;
    this.accumulatedInertiaOffset = 0; // Fractional frame offset for smooth inertia
    this.isAnimationActive = false; // Flag to control RAF loop

    // Immediately set up the viewer.
    this.initializeViewer();
  }

  /**
   * Performs initial setup, including preloading images and binding events.
   */
  initializeViewer() {
    // Ensure the container has a 'product-rotator-container' class for styling
    this.viewerElement.classList.add('product-rotator-container');

    // Create a loading indicator if it doesn't exist
    let loadingSpinner = this.viewerElement.querySelector('.loading-spinner');
    if (!loadingSpinner) {
      loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'loading-spinner';
      loadingSpinner.textContent = 'Loading...'; // Or add more complex spinner HTML
      this.viewerElement.prepend(loadingSpinner);
    }
    this.loadingIndicator = loadingSpinner;

    this.preloadImages();
  }

  /**
   * Preloads all image frames to ensure smooth rotation.
   */
  preloadImages() {
    for (let i = 1; i <= this.frameQuantity; i++) {
      const img = new Image();
      img.src = this.imagePathTemplate.replace('{i}', i);
      img.onload = () => {
        this.loadedImageCount++;
        // Check if all images have loaded
        if (this.loadedImageCount === this.frameQuantity) {
          this.displayInitialFrame();
        }
      };
      img.onerror = () => {
        console.warn(`ProductRotator: Failed to load image: ${img.src}`);
        // Optionally handle error, e.g., show a placeholder or mark as loaded to proceed.
        this.loadedImageCount++;
        if (this.loadedImageCount === this.frameQuantity) {
          this.displayInitialFrame();
        }
      };
      this.preloadedImages[i] = img;
    }
  }

  /**
   * Once images are preloaded, this method renders them into the DOM
   * and sets up the initial display state.
   */
  displayInitialFrame() {
    // Hide the loading indicator
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
    }

    // Create and append all image elements to the container.
    // Only the first one is initially visible.
    for (let i = 1; i <= this.frameQuantity; i++) {
      const frameImage = document.createElement('img');
      frameImage.src = this.preloadedImages[i].src; // Use preloaded src
      frameImage.alt = `Product view frame ${i}`;
      frameImage.dataset.frameIndex = i; // Store index for quick lookup
      frameImage.style.display = (i === this.currentFrameIdx) ? 'block' : 'none';
      frameImage.classList.add('rotator-frame'); // Add a class for styling
      this.viewerElement.appendChild(frameImage);
      this.imageElementCache[i] = frameImage; // Cache the DOM element
    }
    this.bindInteractionEvents();
  }

  /**
   * Attaches event listeners for mouse and touch interactions.
   */
  bindInteractionEvents() {
    // Determine if touch events are supported.
    const isTouchDevice = 'ontouchstart' in document.documentElement;

    // Unified event handler for pointer down.
    const handleDown = (event) => {
      event.preventDefault(); // Prevent default browser behavior (e.g., image drag)
      const clientX = isTouchDevice ? event.touches[0].clientX : event.clientX;
      this.handlePointerDown(clientX);
    };

    // Unified event handler for pointer move.
    const handleMove = (event) => {
      if (!this.isInteracting) return;
      event.preventDefault();
      const clientX = isTouchDevice ? event.touches[0].clientX : event.clientX;
      this.handlePointerMove(clientX);
    };

    // Unified event handler for pointer up/cancel.
    const handleUp = (event) => {
      if (!this.isInteracting) return;
      event.preventDefault();
      this.handlePointerUp();
    };

    // Touch event listeners
    if (isTouchDevice) {
      this.viewerElement.addEventListener('touchstart', handleDown, { passive: false });
      this.viewerElement.addEventListener('touchmove', handleMove, { passive: false });
      this.viewerElement.addEventListener('touchend', handleUp, { passive: false });
      this.viewerElement.addEventListener('touchcancel', handleUp, { passive: false });
    }

    // Mouse event listeners
    this.viewerElement.addEventListener('mousedown', handleDown, { passive: false });
    // Mousemove and mouseup listeners are added to the document to ensure
    // tracking continues even if the pointer leaves the viewer element.
    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleUp, { passive: false });

    // Mouseout handler for the viewer element to stop interaction if pointer leaves
    this.viewerElement.addEventListener('mouseout', (event) => {
      // Check if the related target is outside the viewer or its child images
      const relatedTarget = event.relatedTarget || event.toElement;
      if (!this.viewerElement.contains(relatedTarget)) {
        this.handlePointerUp(); // Treat as an 'up' event if pointer leaves the element entirely
      }
    });
  }

  /**
   * Initiates the dragging state when a pointer (mouse or touch) goes down.
   * @param {number} xCoordinate - The X coordinate of the pointer.
   */
  handlePointerDown(xCoordinate) {
    // Only start interaction if not already interacting.
    if (this.isInteracting) return;
    this.isInteracting = true;
    this.lastPointerX = xCoordinate;
    this.haltInertiaMotion(); // Stop any ongoing inertia animation.
  }

  /**
   * Handles pointer movement, updating the displayed frame based on drag.
   * @param {number} xCoordinate - The current X coordinate of the pointer.
   */
  handlePointerMove(xCoordinate) {
    if (!this.isInteracting) return;

    const dragDistance = xCoordinate - this.lastPointerX;
    const absDragDistance = Math.abs(dragDistance);

    // Only update frame if sufficient drag has occurred.
    if (absDragDistance < MIN_DRAG_DISTANCE_PX) {
      return;
    }

    this.currentSpeedFactor = Math.max(
      MIN_FRAME_SPEED_THRESHOLD,
      Math.floor(absDragDistance * FRAME_SPEED_MULTIPLIER)
    );

    this.previousFrameIdx = this.currentFrameIdx;

    if (dragDistance > 0) { // Moving right, rotate left (decrease frame index)
      this.currentFrameIdx -= this.currentSpeedFactor;
      this.scrollDirection = 'left';
    } else { // Moving left, rotate right (increase frame index)
      this.currentFrameIdx += this.currentSpeedFactor;
      this.scrollDirection = 'right';
    }

    // Wrap frame index around the total number of frames.
    this.currentFrameIdx = (this.currentFrameIdx - 1 + this.frameQuantity) % this.frameQuantity + 1;

    // Only update display if the frame index has actually changed.
    if (this.currentFrameIdx !== this.previousFrameIdx) {
      this.updateDisplayedFrame();
    }

    this.lastPointerX = xCoordinate;
  }

  /**
   * Ends the dragging state and potentially starts an inertia animation.
   */
  handlePointerUp() {
    if (!this.isInteracting) return; // Guard clause
    this.isInteracting = false;
    // If there was significant speed during the drag, initiate inertia.
    if (this.currentSpeedFactor > MIN_FRAME_SPEED_THRESHOLD) {
      this.startInertiaAnimation();
    }
  }

  /**
   * Initiates the inertia animation sequence.
   */
  startInertiaAnimation() {
    this.inertiaEffectDuration = this.currentSpeedFactor;
    this.inertiaElapsedTime = 0;
    this.accumulatedInertiaOffset = 0;

    // If animation is not already active, start the RAF loop.
    if (!this.isAnimationActive) {
      this.isAnimationActive = true;
      ProductRotator.animationFrameRequest(this.animateInertiaFrame.bind(this));
    }
  }

  /**
   * Recursive function for the inertia animation, driven by requestAnimationFrame.
   * Uses an easing function to gradually slow down the rotation.
   */
  animateInertiaFrame() {
    if (!this.isAnimationActive) return; // Ensure animation is still active

    this.inertiaElapsedTime += INERTIA_TIME_INCREMENT;

    // Calculate the current frame speed using an easing function.
    // Using outQuartic for a strong deceleration.
    const easedSpeed = this.inertiaEffectDuration - AnimationEasings.outQuartic(
      this.inertiaElapsedTime, 0, this.inertiaEffectDuration, this.inertiaEffectDuration
    );

    this.currentSpeedFactor = easedSpeed;
    this.accumulatedInertiaOffset += easedSpeed;

    // If accumulated offset is enough for at least one frame change.
    if (this.accumulatedInertiaOffset >= MIN_FRAME_SPEED_THRESHOLD) {
      this.previousFrameIdx = this.currentFrameIdx;
      const frameAdvance = Math.floor(this.accumulatedInertiaOffset);

      if (this.scrollDirection === "right") {
        this.currentFrameIdx += frameAdvance;
      } else {
        this.currentFrameIdx -= frameAdvance;
      }

      // Wrap frame index around.
      this.currentFrameIdx = (this.currentFrameIdx - 1 + this.frameQuantity) % this.frameQuantity + 1;
      this.accumulatedInertiaOffset = 0; // Reset fractional offset

      // Update the display if the frame has changed.
      if (this.currentFrameIdx !== this.previousFrameIdx) {
        this.updateDisplayedFrame();
      }
    }

    // Continue animation if time hasn't run out and speed is above threshold.
    if (this.inertiaElapsedTime < this.inertiaEffectDuration && this.currentSpeedFactor > MIN_FRAME_SPEED_THRESHOLD) {
      ProductRotator.animationFrameRequest(this.animateInertiaFrame.bind(this));
    } else {
      this.haltInertiaMotion(); // Stop when inertia fades or duration ends.
    }
  }

  /**
   * Stops any ongoing inertia animation and resets related state variables.
   */
  haltInertiaMotion() {
    if (!this.isAnimationActive) return; // Guard clause
    this.inertiaElapsedTime = 0;
    this.inertiaEffectDuration = 0;
    this.accumulatedInertiaOffset = 0;
    this.currentSpeedFactor = 0;
    this.isAnimationActive = false;
  }

  /**
   * Updates the visibility of the image frames to show the current frame
   * and hide the previous one.
   */
  updateDisplayedFrame() {
    // Hide the previously active frame using the cached element.
    const prevFrameElement = this.imageElementCache[this.previousFrameIdx];
    if (prevFrameElement) {
      prevFrameElement.style.display = 'none';
    }

    // Show the newly active frame using the cached element.
    const currentFrameElement = this.imageElementCache[this.currentFrameIdx];
    if (currentFrameElement) {
      currentFrameElement.style.display = 'block';
    }
  }
}

/**
 * Factory function to create and initialize a ProductRotator instance.
 * @param {string} containerSelector - The ID of the HTML element to contain the viewer.
 * @param {string} imagePathPattern - The template string for image URLs (e.g., 'assets/product-{i}.jpg').
 * @param {number} numberOfFrames - The total count of image frames.
 * @returns {ProductRotator} A new instance of the ProductRotator.
 */
const createProductRotator = (containerSelector, imagePathPattern, numberOfFrames) => {
  // Basic validation for input parameters.
  if (typeof containerSelector !== 'string' || containerSelector.trim() === '') {
    console.error('createProductRotator: Invalid container ID provided.');
    throw new Error('Container ID must be a non-empty string.');
  }
  if (typeof imagePathPattern !== 'string' || !imagePathPattern.includes('{i}')) {
    console.error('createProductRotator: Invalid image path pattern. Must contain "{i}".');
    throw new Error('Image path pattern must be a string containing "{i}".');
  }
  if (typeof numberOfFrames !== 'number' || numberOfFrames < 1) {
    console.error('createProductRotator: Invalid number of frames. Must be a positive number.');
    throw new Error('Number of frames must be a positive integer.');
  }

  return new ProductRotator(containerSelector, imagePathPattern, numberOfFrames);
};

export { createProductRotator };