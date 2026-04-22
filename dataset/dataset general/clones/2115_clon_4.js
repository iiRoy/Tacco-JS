(function() {
    "use strict";

    // Standard configuration for the slideshow component.
    const standardSettings = {
        slideContentClass: 'slide-item', // Renamed from carouselItemCls
        slideMediaClass: 'slide-item-media', // Renamed from carouselItemMediaCls
        slideTrackClass: 'slide-items-wrap', // Renamed from carouselItemsWrapCls
        navLinkClass: 'slide-nav-item', // Renamed from carouselNavItemCls
        nextControlClass: 'slide-next-btn', // Renamed from nextLinkCls
        prevControlClass: 'slide-prev-btn', // Renamed from prevLinkCls
        activeSlideClass: 'active-slide', // Renamed from activeCls
        croppedSlideClass: 'cropped-content', // Renamed from croppedCls
        scaledSlideClass: 'scaled-content', // Renamed from scaledCls
        slideSpacing: 'css', // Renamed from carouselItemSpace
        movementDuration: 800, // Renamed from animSpeed
        alignmentStyle: 'center', // Renamed from alignment
        clonesPerSide: 1, // Renamed from setsEachSide
        heightDetermination: 'shortest', // Renamed from carouselHtType
        resizeHandling: 'cropped-resize' // Renamed from carouselResizeType
    };

    /**
     * Initializes and controls a slideshow carousel on a given HTML element.
     * @param {HTMLElement} containerElement The main container element for the slideshow.
     * @param {object} customOptions Optional settings to override standard defaults.
     */
    function slideshowManager(containerElement, customOptions) {
        if (!containerElement || !(containerElement instanceof HTMLElement)) {
            console.error("The provided container element is invalid.");
            return;
        }

        const currentConfig = { ...standardSettings, ...customOptions };

        // Internal state of the slideshow.
        const presentState = {
            viewportWidth: 0,
            viewportHeight: 0,
            isHighDPI: false,
            isAnimating: false,
            contentHasBeenCropped: false,
            contentHasBeenScaled: false,
            hasThumbnailNavigation: false,
            containerTotalWidth: 0,
            containerTotalHeight: 0,
            totalSourceSetWidth: 0, // Renamed from setWid
            calculatedSlideHeight: 0,
            targetTranslateX: 0,
            currentSlideIndex: 0,
            computedAlignmentOffset: 0,
            firstSlideAlignmentOffset: 0,
            lastSlideAlignmentOffset: 0,
            loadedImageCount: 0,
            sourceItemMeasurements: [], // Renamed from itemDetailsArr
            resizeCheckTimer: null // For the continuous resize check
        };

        // References to key DOM elements.
        const domReferences = {
            mainContainer: containerElement,
            slideTrack: null,
            sourceItems: [], // Original slide items
            allDisplayItems: [], // All slide items (originals + clones)
            navigationLinks: [],
            nextControl: null,
            prevControl: null,
            activeSlideElement: null
        };

        // Derived CSS class names for consistency and renaming.
        const componentClasses = {
            slideContent: currentConfig.slideContentClass,
            slideMedia: currentConfig.slideMediaClass,
            slideTrack: currentConfig.slideTrackClass,
            navLink: currentConfig.navLinkClass,
            nextControl: currentConfig.nextControlClass,
            prevControl: currentConfig.prevControlClass,
            activeSlide: currentConfig.activeSlideClass,
            croppedSlide: currentConfig.croppedSlideClass,
            scaledSlide: currentConfig.scaledSlideClass,
            sourceItem: currentConfig.slideContentClass + '-source', // Renamed from origItemCls
            videoWrapper: currentConfig.slideContentClass + '-video-wrapper', // Renamed from videoFoundationElCls
            videoContent: currentConfig.slideContentClass + '-video', // Renamed from videoCls
            visibleSlide: currentConfig.slideContentClass + '-visible', // Renamed from itemVisibleCls
            cropComponent: currentConfig.slideContentClass + '-crop-component', // Renamed from cropCompCls
            slideIndexPrefix: currentConfig.slideContentClass + '-' // Renamed from carouselItemNumPrefix
        };

        // Derived data attributes for consistency and renaming.
        const componentAttributes = {
            originalAspectRatio: 'data-original-aspect-ratio', // Renamed from origRatioAttr
            slideIndex: 'data-slide-index' // Renamed from itemNumAttr
        };

        // --- DOM Utility Functions ---

        function findElements(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        }

        function findElement(selector, parent = document) {
            return parent.querySelector(selector);
        }

        function getComputedPixelValue(element, property) {
            return parseFloat(window.getComputedStyle(element)[property]);
        }

        function applyTranslateX(element, value, transitionDuration = 0) {
            element.style.transitionDuration = `${transitionDuration}ms`;
            element.style.transform = `translateX(${value}px)`;
        }

        // --- Core Slideshow Logic ---

        function recordViewportDimensions() {
            presentState.viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            presentState.viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        }

        function detectHighDPI() {
            presentState.isHighDPI = (window.devicePixelRatio && window.devicePixelRatio > 1);
        }

        function processSpacingSetting() {
            // If slideSpacing is not 'css', it implies a fixed pixel value for margin-right.
            // This is handled when marking source items.
        }

        function checkNavPresence() {
            domReferences.navigationLinks = findElements(`.${componentClasses.navLink}`, domReferences.mainContainer.nextElementSibling || domReferences.mainContainer.parentNode);
            presentState.hasThumbnailNavigation = domReferences.navigationLinks.length > 0;
        }

        function resetHeightCalculation() {
            if (currentConfig.heightDetermination === 'shortest') {
                presentState.calculatedSlideHeight = 9999;
            } else if (currentConfig.heightDetermination === 'longest') {
                presentState.calculatedSlideHeight = 0;
            } else {
                presentState.calculatedSlideHeight = parseFloat(currentConfig.heightDetermination);
            }
        }

        function tagVideoElements() {
            findElements('iframe', domReferences.slideTrack).forEach(vid => {
                vid.classList.add(componentClasses.slideMedia);
            });
        }

        function setupSourceItems() {
            domReferences.sourceItems = findElements(`.${componentClasses.slideContent}`, domReferences.mainContainer);
            domReferences.sourceItems.forEach(item => {
                item.classList.add(componentClasses.sourceItem);
                if (currentConfig.slideSpacing !== 'css') {
                    item.style.marginRight = currentConfig.slideSpacing;
                }
            });
        }

        function activateSlide(targetSlideElement) {
            if (domReferences.activeSlideElement) {
                domReferences.activeSlideElement.classList.remove(componentClasses.activeSlide);
            }
            domReferences.activeSlideElement = targetSlideElement;
            domReferences.activeSlideElement.classList.add(componentClasses.activeSlide);
            presentState.currentSlideIndex = parseInt(domReferences.activeSlideElement.getAttribute(componentAttributes.slideIndex), 10);

            if (presentState.hasThumbnailNavigation) {
                const activeNavLink = findElement(`[${componentAttributes.slideIndex}="${presentState.currentSlideIndex}"]`, domReferences.mainContainer.nextElementSibling || domReferences.mainContainer.parentNode);
                findElements(`.${componentClasses.activeSlide}`, domReferences.mainContainer.nextElementSibling || domReferences.mainContainer.parentNode).forEach(link => link.classList.remove(componentClasses.activeSlide));
                if (activeNavLink) {
                    activeNavLink.classList.add(componentClasses.activeSlide);
                }
            }
        }

        function saveMediaAspectRatio(containerItem, mediaItem) {
            let ratio;
            if (mediaItem.tagName === 'IMG') {
                ratio = mediaItem.naturalWidth / mediaItem.naturalHeight;
            } else if (mediaItem.tagName === 'IFRAME') {
                const widthAttr = mediaItem.getAttribute('width');
                const heightAttr = mediaItem.getAttribute('height');
                if (widthAttr && heightAttr) {
                    ratio = parseFloat(widthAttr) / parseFloat(heightAttr);
                } else {
                    ratio = containerItem.offsetWidth / containerItem.offsetHeight; // Fallback
                }
            } else {
                ratio = containerItem.offsetWidth / containerItem.offsetHeight; // Generic fallback
            }
            mediaItem.setAttribute(componentAttributes.originalAspectRatio, ratio.toFixed(3));
        }

        function loadMediaContent(itemElement) {
            const imgElement = findElement(`img.${componentClasses.slideMedia}`, itemElement);
            if (imgElement) {
                const hdSrc = imgElement.getAttribute('data-src-2x');
                const standardSrc = imgElement.getAttribute('data-src');
                const finalSource = (presentState.isHighDPI && hdSrc) ? hdSrc : standardSrc;

                if (finalSource) {
                    imgElement.removeAttribute('data-src');
                    imgElement.removeAttribute('data-src-2x');
                    const tempImage = new Image();
                    tempImage.onload = () => {
                        imgElement.src = finalSource;
                        presentState.loadedImageCount++;
                        if (presentState.loadedImageCount === domReferences.sourceItems.length) {
                            finalizeInitialSetup();
                        }
                    };
                    tempImage.onerror = () => {
                        console.warn(`Error loading image: ${finalSource}`);
                        presentState.loadedImageCount++;
                        if (presentState.loadedImageCount === domReferences.sourceItems.length) {
                            finalizeInitialSetup();
                        }
                    };
                    tempImage.src = finalSource;
                } else {
                    presentState.loadedImageCount++;
                    if (presentState.loadedImageCount === domReferences.sourceItems.length) {
                        finalizeInitialSetup();
                    }
                }
            } else {
                presentState.loadedImageCount++;
                if (presentState.loadedImageCount === domReferences.sourceItems.length) {
                    finalizeInitialSetup();
                }
            }
        }

        function evaluateSlideHeight(itemElement) {
            const currentHeight = itemElement.offsetHeight;
            if (currentConfig.heightDetermination === 'shortest') {
                presentState.calculatedSlideHeight = Math.min(presentState.calculatedSlideHeight, currentHeight);
            } else if (currentConfig.heightDetermination === 'longest') {
                presentState.calculatedSlideHeight = Math.max(presentState.calculatedSlideHeight, currentHeight);
            }
        }

        function compileSourceItemMeasurements() {
            presentState.sourceItemMeasurements = []; // Reset
            presentState.totalSourceSetWidth = 0; // Reset
            let currentAccumulatedOffset = 0;

            domReferences.sourceItems.forEach((item, index) => {
                item.setAttribute(componentAttributes.slideIndex, index);
                item.classList.add(`${componentClasses.slideIndexPrefix}${index}`);

                const mediaItem = findElement(`.${componentClasses.slideMedia}`, item);
                if (mediaItem) {
                    saveMediaAspectRatio(item, mediaItem);
                }

                const itemWidth = item.offsetWidth;
                const itemHeight = item.offsetHeight;

                presentState.sourceItemMeasurements.push({
                    index: index,
                    width: itemWidth,
                    height: itemHeight,
                    offsetFromStart: currentAccumulatedOffset
                });
                currentAccumulatedOffset += itemWidth + getComputedPixelValue(item, 'marginRight');
            });
            presentState.totalSourceSetWidth = currentAccumulatedOffset;
            domReferences.mainContainer.style.height = `${presentState.calculatedSlideHeight}px`; // Apply calculated height
        }

        function finalizeInitialSetup() {
            // Called after all original images are loaded.
            resetHeightCalculation();
            compileSourceItemMeasurements(); // Recalculate with actual image dimensions
            initializeVideoScaling();
            createClonedSets();
            adjustTrackDimensions();
            setInitialSlidePosition();
            revealSlideshow();
        }

        function initializeVideoScaling() {
            presentState.sourceItemMeasurements.forEach((details, index) => {
                const originalItem = domReferences.sourceItems[index];
                const videoElement = findElement('iframe', originalItem);
                if (videoElement) {
                    scaleVideoContent(videoElement, true);
                }
            });
        }

        function scaleVideoContent(videoElement, isInitialCall = false) {
            const aspectRatio = parseFloat(videoElement.getAttribute(componentAttributes.originalAspectRatio));
            if (!isNaN(aspectRatio) && presentState.calculatedSlideHeight > 0) {
                const videoWidth = presentState.calculatedSlideHeight * aspectRatio;
                videoElement.setAttribute('height', presentState.calculatedSlideHeight);
                videoElement.setAttribute('width', videoWidth);

                if (isInitialCall) {
                    insertVideoWrapper(videoElement, videoWidth);
                }
            }
        }

        function insertVideoWrapper(videoElement, videoWidth) {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.width = `${videoWidth}px`;
            wrapperDiv.style.height = `${presentState.calculatedSlideHeight}px`;
            wrapperDiv.classList.add(componentClasses.videoWrapper);
            videoElement.before(wrapperDiv);
            videoElement.classList.add(componentClasses.videoContent);
        }

        function ceaseVideoPlayback(slideIndex) {
            // Prevents video reset if the item is still active.
            if (slideIndex !== presentState.currentSlideIndex) {
                const slideElement = findElement(`.${componentClasses.slideIndexPrefix}${slideIndex}`, domReferences.slideTrack);
                if (slideElement) {
                    const videoElement = findElement('iframe', slideElement);
                    if (videoElement) {
                        const originalSrc = videoElement.getAttribute('src');
                        videoElement.setAttribute('src', ''); // Stop playback
                        videoElement.setAttribute('src', originalSrc); // Reset src for next play
                    }
                }
            }
        }

        function createClonedSets() {
            // Remove any previously generated clones before regenerating.
            findElements(`.${componentClasses.slideContent}:not(.${componentClasses.sourceItem})`, domReferences.slideTrack).forEach(el => el.remove());

            const allClones = [];

            // Add clones before the original set.
            for (let i = 0; i < currentConfig.clonesPerSide; i++) {
                domReferences.sourceItems.slice().reverse().forEach(sourceItem => {
                    const clone = sourceItem.cloneNode(true);
                    clone.classList.remove(componentClasses.activeSlide);
                    clone.classList.remove(componentClasses.sourceItem);
                    // Remove specific numbered classes from clones.
                    clone.classList.forEach(cls => {
                        if (cls.startsWith(componentClasses.slideIndexPrefix) && cls !== componentClasses.slideIndexPrefix) {
                            clone.classList.remove(cls);
                        }
                    });
                    allClones.unshift(clone); // Add to the beginning of the list.
                });
            }

            allClones.forEach(clone => domReferences.slideTrack.prepend(clone));

            // Add clones after the original set.
            for (let i = 0; i < currentConfig.clonesPerSide; i++) {
                domReferences.sourceItems.forEach(sourceItem => {
                    const clone = sourceItem.cloneNode(true);
                    clone.classList.remove(componentClasses.activeSlide);
                    clone.classList.remove(componentClasses.sourceItem);
                    clone.classList.forEach(cls => {
                        if (cls.startsWith(componentClasses.slideIndexPrefix) && cls !== componentClasses.slideIndexPrefix) {
                            clone.classList.remove(cls);
                        }
                    });
                    domReferences.slideTrack.appendChild(clone);
                });
            }

            // Re-collect all slide items (originals + clones) in their final order.
            domReferences.allDisplayItems = findElements(`.${componentClasses.slideContent}`, domReferences.slideTrack);
        }

        function recordContainerDimensions() {
            presentState.containerTotalWidth = domReferences.mainContainer.offsetWidth;
            presentState.containerTotalHeight = domReferences.mainContainer.offsetHeight;
        }

        function adjustTrackDimensions() {
            let overallTrackWidth = 0;
            domReferences.allDisplayItems.forEach(item => {
                overallTrackWidth += item.offsetWidth + getComputedPixelValue(item, 'marginRight');
            });
            domReferences.slideTrack.style.width = `${overallTrackWidth}px`;
        }

        function setInitialSlidePosition() {
            activateSlide(domReferences.sourceItems[0]); // First original item is active
            calculateMovementOffset(0); // Determine initial position for the first slide
            applySlideMovement(0); // Apply instantly without animation
        }

        function attachThumbnailNavListeners() {
            domReferences.navigationLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (presentState.isAnimating) return;
                    const targetIndex = parseInt(link.getAttribute(componentAttributes.slideIndex), 10);
                    if (!isNaN(targetIndex) && targetIndex !== presentState.currentSlideIndex) {
                        transitionSlideshow(targetIndex);
                    }
                });
            });
        }

        function attachControlNavListeners() {
            domReferences.nextControl = findElement(`.${componentClasses.nextControl}`, domReferences.mainContainer);
            domReferences.prevControl = findElement(`.${componentClasses.prevControl}`, domReferences.mainContainer);

            if (domReferences.nextControl) {
                domReferences.nextControl.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (presentState.isAnimating) return;
                    transitionSlideshow(presentState.currentSlideIndex + 1, 'forward');
                });
            }
            if (domReferences.prevControl) {
                domReferences.prevControl.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (presentState.isAnimating) return;
                    transitionSlideshow(presentState.currentSlideIndex - 1, 'backward');
                });
            }
        }

        function revealSlideshow() {
            // Placeholder: If the carousel is initially hidden (e.g., via CSS opacity:0),
            // this is where it would be made visible.
            // domReferences.mainContainer.style.opacity = '1';
        }

        function transitionSlideshow(targetIndex, direction = null) {
            calculateMovementOffset(targetIndex, direction);
            applySlideMovement(currentConfig.movementDuration);
        }

        function calculateMovementOffset(targetIndex, direction = null) {
            const previousActiveIndex = presentState.currentSlideIndex;
            let offsetBeforeAlignment = 0; // The base translate X value before alignment adjustment.

            // Logic for infinite loop teleportation (forward wrap-around).
            if (direction === 'forward' && previousActiveIndex === presentState.sourceItemMeasurements.length - 1) {
                activateSlide(domReferences.sourceItems[0]); // Set active to first original item.
                calculateAlignmentOffset('last'); // Calculate alignment for the *last* item of the original set.
                teleportToClonedStart(); // Instantly jump to the visual equivalent of the last original item in the *first* cloned set.
                offsetBeforeAlignment = -(presentState.totalSourceSetWidth * currentConfig.clonesPerSide);
                presentState.targetTranslateX = offsetBeforeAlignment + presentState.computedAlignmentOffset;
                return; // Exit early as jump is handled.
            }
            // Logic for infinite loop teleportation (backward wrap-around).
            else if (direction === 'backward' && previousActiveIndex === 0) {
                activateSlide(domReferences.sourceItems[presentState.sourceItemMeasurements.length - 1]); // Set active to last original item.
                calculateAlignmentOffset('first'); // Calculate alignment for the *first* item of the original set.
                teleportToClonedEnd(); // Instantly jump to the visual equivalent of the first original item in the *last* cloned set.
                offsetBeforeAlignment = -presentState.totalSourceSetWidth - (presentState.totalSourceSetWidth * currentConfig.clonesPerSide) + presentState.sourceItemMeasurements[presentState.sourceItemMeasurements.length - 1].width;
                presentState.targetTranslateX = offsetBeforeAlignment + presentState.computedAlignmentOffset;
                return; // Exit early as jump is handled.
            }
            // Normal slide movement.
            else {
                let actualTargetIndex = targetIndex;
                if (actualTargetIndex < 0) actualTargetIndex = 0;
                if (actualTargetIndex >= presentState.sourceItemMeasurements.length) actualTargetIndex = presentState.sourceItemMeasurements.length - 1;

                if (actualTargetIndex > 0) {
                    // Position is sum of widths and margins of all items before the target.
                    offsetBeforeAlignment = presentState.sourceItemMeasurements[actualTargetIndex - 1].offsetFromStart + presentState.sourceItemMeasurements[actualTargetIndex - 1].width + getComputedPixelValue(domReferences.sourceItems[actualTargetIndex - 1], 'marginRight');
                }

                activateSlide(domReferences.sourceItems[actualTargetIndex]);
                calculateAlignmentOffset();
                offsetBeforeAlignment = -(offsetBeforeAlignment + (presentState.totalSourceSetWidth * currentConfig.clonesPerSide));
                presentState.targetTranslateX = offsetBeforeAlignment + presentState.computedAlignmentOffset;
            }

            ceaseVideoPlayback(previousActiveIndex);
        }

        function calculateAlignmentOffset(overridePos = null) {
            const activeItemDetails = presentState.sourceItemMeasurements[presentState.currentSlideIndex];
            if (!activeItemDetails) {
                presentState.computedAlignmentOffset = 0;
                return;
            }

            if (currentConfig.alignmentStyle === 'center') {
                const centerPoint = presentState.containerTotalWidth / 2;
                presentState.computedAlignmentOffset = centerPoint - (activeItemDetails.width / 2);
                if (overridePos === 'first') {
                    presentState.firstSlideAlignmentOffset = centerPoint - (presentState.sourceItemMeasurements[0].width / 2);
                } else if (overridePos === 'last') {
                    presentState.lastSlideAlignmentOffset = centerPoint - (presentState.sourceItemMeasurements[presentState.sourceItemMeasurements.length - 1].width / 2);
                }
            } else if (currentConfig.alignmentStyle === 'right') {
                presentState.computedAlignmentOffset = presentState.containerTotalWidth - activeItemDetails.width;
                if (overridePos === 'first') {
                    presentState.firstSlideAlignmentOffset = presentState.containerTotalWidth - presentState.sourceItemMeasurements[0].width;
                } else if (overridePos === 'last') {
                    presentState.lastSlideAlignmentOffset = presentState.containerTotalWidth - presentState.sourceItemMeasurements[presentState.sourceItemMeasurements.length - 1].width;
                }
            } else {
                presentState.computedAlignmentOffset = 0; // 'left' or other values
            }
        }

        function teleportToClonedStart() {
            // Jump to the last item of the first cloned set (before the originals).
            // This gives the impression of wrapping around from the last original item.
            const lastOriginalItem = presentState.sourceItemMeasurements[presentState.sourceItemMeasurements.length - 1];
            const jumpPosition = -presentState.totalSourceSetWidth + lastOriginalItem.width + presentState.lastSlideAlignmentOffset;
            applyTranslateX(domReferences.slideTrack, jumpPosition, 0); // Instant jump.
        }

        function teleportToClonedEnd() {
            // Jump to the first item of the last cloned set (after the originals).
            // This gives the impression of wrapping around from the first original item.
            const jumpPosition = -(presentState.totalSourceSetWidth * (currentConfig.clonesPerSide + 1)) + presentState.firstSlideAlignmentOffset;
            applyTranslateX(domReferences.slideTrack, jumpPosition, 0); // Instant jump.
        }

        function applySlideMovement(duration) {
            presentState.isAnimating = true;
            applyTranslateX(domReferences.slideTrack, presentState.targetTranslateX, duration);

            if (duration > 0) {
                const onTransitionEnd = () => {
                    domReferences.slideTrack.removeEventListener('transitionend', onTransitionEnd);
                    presentState.isAnimating = false;
                };
                domReferences.slideTrack.addEventListener('transitionend', onTransitionEnd);
            } else {
                presentState.isAnimating = false;
            }
        }

        // --- Event Handlers ---

        function handleWindowResizingEvent() {
            // Replicates the original's specific debouncing pattern (one-time listener + setTimeout re-bind).
            if (presentState.resizeCheckTimer) {
                clearTimeout(presentState.resizeCheckTimer);
            }

            window.addEventListener("resize", function _oneShotResize() {
                window.removeEventListener("resize", _oneShotResize); // Unbinds itself after firing.

                const newViewportHeight = window.innerHeight || document.documentElement.clientHeight;
                const newViewportWidth = window.innerWidth || document.documentElement.clientWidth;

                // Only recalculate if dimensions have actually changed.
                if (newViewportWidth !== presentState.viewportWidth || newViewportHeight !== presentState.viewportHeight) {
                    recordViewportDimensions();
                    recordContainerDimensions();
                    resetHeightCalculation();
                    compileSourceItemMeasurements();
                    initializeVideoScaling();
                    adjustTrackDimensions();
                    calculateMovementOffset(presentState.currentSlideIndex); // Recalculate position for current slide.
                    applySlideMovement(0); // Apply instantly.
                }
                presentState.resizeCheckTimer = setTimeout(handleWindowResizingEvent, 100); // Re-binds itself for continuous checking.
            }, { once: true }); // Use { once: true } for modern equivalent of jQuery .one().
        }

        // --- Initialization Sequence ---
        function initSlideshow() {
            domReferences.slideTrack = findElement(`.${componentClasses.slideTrack}`, domReferences.mainContainer);
            if (!domReferences.slideTrack) {
                console.error(`Slideshow track element with class .${componentClasses.slideTrack} not found within the container.`);
                return;
            }

            recordViewportDimensions();
            detectHighDPI();
            processSpacingSetting();
            checkNavPresence();
            resetHeightCalculation();
            tagVideoElements();
            setupSourceItems();

            // Load images first to ensure correct dimensions for subsequent calculations.
            presentState.loadedImageCount = 0;
            domReferences.sourceItems.forEach(loadMediaContent);

            // If no images or all images load synchronously, proceed with final setup.
            if (presentState.loadedImageCount === domReferences.sourceItems.length) {
                finalizeInitialSetup();
            }

            attachControlNavListeners();
            attachThumbnailNavListeners();

            // Begin the continuous resize monitoring.
            presentState.resizeCheckTimer = setTimeout(handleWindowResizingEvent, 100);
        }

        // Execute the initialization.
        initSlideshow();

        // Return a public API for external control (optional, but good practice for a reusable component).
        return {
            goToSlide: (index) => {
                if (index >= 0 && index < presentState.sourceItemMeasurements.length) {
                    transitionSlideshow(index);
                }
            },
            showNext: () => transitionSlideshow(presentState.currentSlideIndex + 1, 'forward'),
            showPrevious: () => transitionSlideshow(presentState.currentSlideIndex - 1, 'backward'),
            getCurrentSlide: () => presentState.currentSlideIndex
        };
    }

    // Expose the slideshow manager function globally so it can be instantiated by user code.
    window.initializeCustomSlideshow = slideshowManager;

})();