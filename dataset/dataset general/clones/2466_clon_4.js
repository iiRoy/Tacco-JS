(function() {
    const DEFAULT_CONFIG = {
        elementIdentifier: false,
        visualTransition: "fade",
        transitionDurationMs: 300,
        swipeGesturesEnabled: true,
        keyboardNavigationEnabled: true,
        showSlideNumbers: true,
        showPaginationDots: true,
        slidesPerThumbnailPage: "all",
        maxThumbnailsDisplayed: "all",
        showImageCaptions: false,
        displayCurrentSlideCount: true,
        activationButton: false,
        spacingAllowance: 110,
        debugOutput: false
    };

    function getViewportDimensions() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    function scaleImageWithinBounds(imageElement, maxWidth, maxHeight) {
        if (!imageElement || !imageElement.naturalWidth || !imageElement.naturalHeight) {
            return;
        }
        let currentWidth = imageElement.naturalWidth;
        let currentHeight = imageElement.naturalHeight;

        let ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);

        imageElement.style.width = (currentWidth * ratio) + 'px';
        imageElement.style.height = (currentHeight * ratio) + 'px';
    }
    
    function loadMediaAsset(url) {
        return new Promise((resolve, reject) => {
            const mediaObject = new Image();
            mediaObject.onload = () => resolve(mediaObject);
            mediaObject.onerror = () => reject(new Error(`Failed to load media from ${url}`));
            mediaObject.src = url;
        });
    }

    function createVisualShowcase(mountPointElement, userConfig) {
        const config = Object.assign({}, DEFAULT_CONFIG, userConfig);

        const componentState = {
            mainContainer: mountPointElement,
            mediaItems: [],
            currentMediaIndex: 0,
            currentPageIndex: 0,
            totalMediaCount: 0,
            totalThumbnailPages: 0,
            viewportDimensions: getViewportDimensions(),
            isOverlayActive: false,
            isTransitionInProgress: false,
            overlayDisplay: null,
            contentFrame: null,
            loadingSpinner: null,
            paginationIndicators: [],
            thumbnailGrid: null,
            prevControl: null,
            nextControl: null,
            slideCounter: null,
            pageNumberDisplay: null,
            pageTotalDisplay: null,
            captionDisplay: null,
            closeButton: null,
            thumbnailElements: [],
        };

        const logMessage = (message) => {
            if (config.debugOutput) {
                console.log(`[VisualShowcase Debug]: ${message}`);
            }
        };

        const updateDimensions = () => {
            componentState.viewportDimensions = getViewportDimensions();
            if (componentState.contentFrame) {
                const borderSize = config.spacingAllowance;
                componentState.contentFrame.style.width = `${componentState.viewportDimensions.width - borderSize}px`;
                componentState.contentFrame.style.height = `${componentState.viewportDimensions.height - borderSize}px`;
            }
        };

        const scaleActiveMedia = () => {
            if (!componentState.overlayDisplay || !componentState.contentFrame) return;

            const activeImage = componentState.contentFrame.querySelector('img.current-media');
            if (activeImage) {
                const borderSize = config.spacingAllowance;
                scaleImageWithinBounds(
                    activeImage,
                    componentState.viewportDimensions.width - borderSize,
                    componentState.viewportDimensions.height - borderSize
                );
            }
        };

        const updateInterfaceStatus = () => {
            if (config.displayCurrentSlideCount && componentState.slideCounter) {
                componentState.slideCounter.textContent = `${componentState.currentMediaIndex + 1}/${componentState.totalMediaCount}`;
            }
            if (config.showSlideNumbers && componentState.pageNumberDisplay) {
                componentState.pageNumberDisplay.textContent = componentState.currentPageIndex + 1;
                componentState.pageTotalDisplay.textContent = componentState.totalThumbnailPages;
            }
            componentState.paginationIndicators.forEach((dot, idx) => {
                dot.classList.toggle('active-dot', idx === componentState.currentPageIndex);
            });
            if (config.showImageCaptions && componentState.captionDisplay) {
                componentState.captionDisplay.textContent = componentState.mediaItems[componentState.currentMediaIndex]?.caption || '';
            }
        };

        const insertMediaContent = (callback) => {
            componentState.loadingSpinner.style.display = 'block';
            const mediaData = componentState.mediaItems[componentState.currentMediaIndex];

            if (!mediaData || !mediaData.imageObject) {
                logMessage(`Media object not preloaded for index ${componentState.currentMediaIndex}. Attempting dynamic load.`);
                loadMediaAsset(mediaData.source)
                    .then(img => {
                        mediaData.imageObject = img;
                        renderMediaElement(img, callback);
                    })
                    .catch(error => {
                        logMessage(`Error loading media dynamically: ${error.message}`);
                        componentState.loadingSpinner.style.display = 'none';
                        callback();
                    });
            } else {
                renderMediaElement(mediaData.imageObject, callback);
            }
        };

        const renderMediaElement = (imgElement, callback) => {
            const existingMedia = componentState.contentFrame.querySelector('img.current-media');
            if (existingMedia) {
                existingMedia.remove();
            }

            const newMedia = imgElement.cloneNode(true);
            newMedia.classList.add('current-media');
            newMedia.style.display = 'none';

            componentState.contentFrame.appendChild(newMedia);
            newMedia.onload = () => {
                componentState.loadingSpinner.style.display = 'none';
                scaleActiveMedia();
                newMedia.style.display = 'block';
                callback();
            };
            if (newMedia.complete && newMedia.naturalWidth > 0) {
                newMedia.onload();
            }
        };


        const performTransition = (completionCallback) => {
            if (componentState.isTransitionInProgress) return;
            componentState.isTransitionInProgress = true;

            switch (config.visualTransition) {
                case "fade":
                    const currentMedia = componentState.contentFrame.querySelector('img.current-media');
                    if (currentMedia) {
                        currentMedia.style.transition = `opacity ${config.transitionDurationMs}ms ease-out`;
                        currentMedia.style.opacity = 0;
                        setTimeout(() => {
                            insertMediaContent(() => {
                                const newMedia = componentState.contentFrame.querySelector('img.current-media:last-child');
                                if (newMedia) {
                                    newMedia.style.transition = `opacity ${config.transitionDurationMs}ms ease-in`;
                                    newMedia.style.opacity = 1;
                                    setTimeout(() => {
                                        componentState.isTransitionInProgress = false;
                                        updateInterfaceStatus();
                                        if (completionCallback) completionCallback();
                                    }, config.transitionDurationMs);
                                } else {
                                    componentState.isTransitionInProgress = false;
                                    updateInterfaceStatus();
                                    if (completionCallback) completionCallback();
                                }
                            });
                        }, config.transitionDurationMs);
                    } else {
                        insertMediaContent(() => {
                            const newMedia = componentState.contentFrame.querySelector('img.current-media:last-child');
                            if (newMedia) {
                                newMedia.style.transition = `opacity ${config.transitionDurationMs}ms ease-in`;
                                newMedia.style.opacity = 1;
                            }
                            componentState.isTransitionInProgress = false;
                            updateInterfaceStatus();
                            if (completionCallback) completionCallback();
                        });
                    }
                    break;
                default:
                    logMessage("Unsupported transition type.");
                    insertMediaContent(() => {
                        componentState.isTransitionInProgress = false;
                        updateInterfaceStatus();
                        if (completionCallback) completionCallback();
                    });
            }
        };

        const advanceSlide = (direction) => {
            if (componentState.isTransitionInProgress || !componentState.isOverlayActive) return;

            let nextIndex = componentState.currentMediaIndex + direction;
            if (nextIndex >= componentState.totalMediaCount) {
                nextIndex = 0;
            } else if (nextIndex < 0) {
                nextIndex = componentState.totalMediaCount - 1;
            }
            componentState.currentMediaIndex = nextIndex;
            performTransition();
        };

        const jumpToSlide = (index) => {
            if (componentState.isTransitionInProgress || !componentState.isOverlayActive || index < 0 || index >= componentState.totalMediaCount) return;
            if (componentState.currentMediaIndex === index) return;
            componentState.currentMediaIndex = index;
            performTransition();
        };

        const advanceThumbnailPage = (direction) => {
            if (componentState.isTransitionInProgress || componentState.isOverlayActive) return;
            if (componentState.totalThumbnailPages <= 1) return;

            let nextPage = componentState.currentPageIndex + direction;
            if (nextPage >= componentState.totalThumbnailPages) {
                nextPage = 0;
            } else if (nextPage < 0) {
                nextPage = componentState.totalThumbnailPages - 1;
            }
            jumpToThumbnailPage(nextPage);
        };

        const jumpToThumbnailPage = (pageIndex) => {
            if (componentState.isTransitionInProgress || componentState.isOverlayActive || pageIndex < 0 || pageIndex >= componentState.totalThumbnailPages) return;
            if (componentState.currentPageIndex === pageIndex) return;

            componentState.currentPageIndex = pageIndex;
            const slidesPerPage = config.slidesPerThumbnailPage === "all" ? componentState.totalMediaCount : parseInt(config.slidesPerThumbnailPage);
            
            componentState.thumbnailElements.forEach((el, idx) => {
                const startIdx = pageIndex * slidesPerPage;
                const endIdx = startIdx + slidesPerPage;
                if (idx >= startIdx && idx < endIdx) {
                    el.style.display = 'block';
                } else {
                    el.style.display = 'none';
                }
            });
            updateInterfaceStatus();
        };

        const constructInterface = () => {
            componentState.overlayDisplay = document.createElement('div');
            componentState.overlayDisplay.classList.add('visual-showcase-overlay');
            componentState.overlayDisplay.style.display = 'none';

            componentState.contentFrame = document.createElement('div');
            componentState.contentFrame.classList.add('media-content-frame');
            componentState.overlayDisplay.appendChild(componentState.contentFrame);

            componentState.loadingSpinner = document.createElement('div');
            componentState.loadingSpinner.classList.add('loading-indicator');
            componentState.contentFrame.appendChild(componentState.loadingSpinner);

            componentState.prevControl = document.createElement('button');
            componentState.prevControl.classList.add('media-control', 'prev-media');
            componentState.prevControl.textContent = '‹';
            componentState.overlayDisplay.appendChild(componentState.prevControl);

            componentState.nextControl = document.createElement('button');
            componentState.nextControl.classList.add('media-control', 'next-media');
            componentState.nextControl.textContent = '›';
            componentState.overlayDisplay.appendChild(componentState.nextControl);

            componentState.closeButton = document.createElement('button');
            componentState.closeButton.classList.add('media-control', 'close-overlay');
            componentState.closeButton.textContent = '×';
            componentState.overlayDisplay.appendChild(componentState.closeButton);

            if (config.displayCurrentSlideCount) {
                componentState.slideCounter = document.createElement('div');
                componentState.slideCounter.classList.add('slide-counter');
                componentState.overlayDisplay.appendChild(componentState.slideCounter);
            }

            if (config.showImageCaptions) {
                componentState.captionDisplay = document.createElement('div');
                componentState.captionDisplay.classList.add('image-caption-text');
                componentState.contentFrame.appendChild(componentState.captionDisplay);
            }

            document.body.appendChild(componentState.overlayDisplay);

            if (config.slidesPerThumbnailPage !== "all") {
                componentState.thumbnailGrid = document.createElement('div');
                componentState.thumbnailGrid.classList.add('thumbnail-navigation');

                const thumbPrev = document.createElement('button');
                thumbPrev.classList.add('page-control', 'prev-page');
                thumbPrev.textContent = '‹';
                componentState.thumbnailGrid.appendChild(thumbPrev);
                thumbPrev.addEventListener('click', () => advanceThumbnailPage(-1));

                const thumbNext = document.createElement('button');
                thumbNext.classList.add('page-control', 'next-page');
                thumbNext.textContent = '›';
                componentState.thumbnailGrid.appendChild(thumbNext);
                thumbNext.addEventListener('click', () => advanceThumbnailPage(1));

                if (config.showSlideNumbers) {
                    const pageNumWrapper = document.createElement('div');
                    pageNumWrapper.classList.add('page-number-display');
                    componentState.pageNumberDisplay = document.createElement('span');
                    componentState.pageNumberDisplay.classList.add('current');
                    componentState.pageTotalDisplay = document.createElement('span');
                    componentState.pageTotalDisplay.classList.add('total');
                    pageNumWrapper.appendChild(componentState.pageNumberDisplay);
                    pageNumWrapper.appendChild(document.createTextNode('/'));
                    pageNumWrapper.appendChild(componentState.pageTotalDisplay);
                    componentState.thumbnailGrid.appendChild(pageNumWrapper);
                }

                if (config.showPaginationDots) {
                    const dotsWrapper = document.createElement('div');
                    dotsWrapper.classList.add('pagination-dots-container');
                    for (let i = 0; i < componentState.totalThumbnailPages; i++) {
                        const dot = document.createElement('span');
                        dot.classList.add('pagination-dot');
                        dot.dataset.pageIndex = i;
                        dot.addEventListener('click', () => jumpToThumbnailPage(i));
                        dotsWrapper.appendChild(dot);
                        componentState.paginationIndicators.push(dot);
                    }
                    componentState.thumbnailGrid.appendChild(dotsWrapper);
                }
                componentState.mainContainer.appendChild(componentState.thumbnailGrid);
            }
        };

        const setupGlobalListeners = () => {
            window.addEventListener('resize', () => {
                updateDimensions();
                scaleActiveMedia();
            });

            componentState.closeButton.addEventListener('click', dismissOverlay);
            componentState.prevControl.addEventListener('click', () => advanceSlide(-1));
            componentState.nextControl.addEventListener('click', () => advanceSlide(1));

            if (config.keyboardNavigationEnabled) {
                document.addEventListener('keydown', (e) => {
                    if (componentState.isOverlayActive) {
                        if (e.key === 'ArrowLeft') { e.preventDefault(); advanceSlide(-1); }
                        if (e.key === 'ArrowRight') { e.preventDefault(); advanceSlide(1); }
                        if (e.key === 'Escape') { e.preventDefault(); dismissOverlay(); }
                    } else {
                        if (e.key === 'ArrowLeft') { e.preventDefault(); advanceThumbnailPage(-1); }
                        if (e.key === 'ArrowRight') { e.preventDefault(); advanceThumbnailPage(1); }
                    }
                });
            }

            if (config.swipeGesturesEnabled) {
                let touchStartX = 0;
                let touchEndX = 0;
                const minSwipeDistance = 50;

                const handleTouchStart = (e) => {
                    touchStartX = e.touches[0].clientX;
                    touchEndX = 0;
                };

                const handleTouchMove = (e) => {
                    touchEndX = e.touches[0].clientX;
                };

                const handleTouchEnd = () => {
                    if (touchEndX === 0) return;
                    const swipeDistance = touchEndX - touchStartX;

                    if (componentState.isOverlayActive) {
                        if (swipeDistance > minSwipeDistance) {
                            advanceSlide(-1);
                        } else if (swipeDistance < -minSwipeDistance) {
                            advanceSlide(1);
                        }
                    } else {
                        if (swipeDistance > minSwipeDistance) {
                            advanceThumbnailPage(-1);
                        } else if (swipeDistance < -minSwipeDistance) {
                            advanceThumbnailPage(1);
                        }
                    }
                    touchStartX = 0;
                    touchEndX = 0;
                };

                componentState.overlayDisplay.addEventListener('touchstart', handleTouchStart);
                componentState.overlayDisplay.addEventListener('touchmove', handleTouchMove);
                componentState.overlayDisplay.addEventListener('touchend', handleTouchEnd);

                // Add touch listeners to the main container for thumbnail paging
                componentState.mainContainer.addEventListener('touchstart', handleTouchStart);
                componentState.mainContainer.addEventListener('touchmove', handleTouchMove);
                componentState.mainContainer.addEventListener('touchend', handleTouchEnd);
            }

            componentState.mediaItems.forEach((item, index) => {
                if (item.originalElement) {
                    item.originalElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        presentOverlay(index);
                    });
                }
            });

            if (config.activationButton) {
                const trigger = document.querySelector(config.activationButton);
                if (trigger) {
                    trigger.addEventListener('click', (e) => {
                        e.preventDefault();
                        presentOverlay(0);
                    });
                }
            }
        };

        const presentOverlay = (initialIndex) => {
            if (componentState.isTransitionInProgress) return;
            componentState.isTransitionInProgress = true;

            componentState.currentMediaIndex = initialIndex;
            updateDimensions();

            document.body.style.overflow = 'hidden';

            componentState.overlayDisplay.style.opacity = 0;
            componentState.overlayDisplay.style.display = 'flex';
            
            componentState.overlayDisplay.offsetWidth; 

            componentState.overlayDisplay.style.transition = `opacity ${config.transitionDurationMs}ms ease-in`;
            componentState.overlayDisplay.style.opacity = 1;

            const transitionEndHandler = function() {
                componentState.overlayDisplay.removeEventListener('transitionend', transitionEndHandler);
                componentState.isOverlayActive = true;
                componentState.isTransitionInProgress = false;
                insertMediaContent(() => {
                    updateInterfaceStatus();
                });
            };
            componentState.overlayDisplay.addEventListener('transitionend', transitionEndHandler);
            setTimeout(() => { // Fallback for transitionend not firing
                if (!componentState.isOverlayActive && componentState.isTransitionInProgress) {
                    transitionEndHandler();
                }
            }, config.transitionDurationMs + 50);
        };

        const dismissOverlay = () => {
            if (componentState.isTransitionInProgress || !componentState.isOverlayActive) return;
            componentState.isTransitionInProgress = true;

            componentState.overlayDisplay.style.transition = `opacity ${config.transitionDurationMs}ms ease-out`;
            componentState.overlayDisplay.style.opacity = 0;

            const transitionEndHandler = function() {
                componentState.overlayDisplay.removeEventListener('transitionend', transitionEndHandler);
                componentState.overlayDisplay.style.display = 'none';
                document.body.style.overflow = 'auto';
                componentState.isOverlayActive = false;
                componentState.isTransitionInProgress = false;
                const currentMedia = componentState.contentFrame.querySelector('img.current-media');
                if (currentMedia) currentMedia.remove();
            };
            componentState.overlayDisplay.addEventListener('transitionend', transitionEndHandler);
            setTimeout(() => { // Fallback for transitionend not firing
                if (componentState.isOverlayActive && componentState.isTransitionInProgress) {
                    transitionEndHandler();
                }
            }, config.transitionDurationMs + 50);
        };

        const initializeComponent = () => {
            const initialSourceImages = Array.from(mountPointElement.querySelectorAll('img'));
            let preliminaryMediaItems = [];

            initialSourceImages.forEach((imgElement, index) => {
                if ((config.maxThumbnailsDisplayed !== "all" && index >= parseInt(config.maxThumbnailsDisplayed)) || config.activationButton) {
                    if (imgElement.parentNode) {
                        imgElement.parentNode.removeChild(imgElement);
                    }
                    return;
                }
                preliminaryMediaItems.push({
                    originalElement: imgElement,
                    source: imgElement.getAttribute('data-img'),
                    caption: imgElement.getAttribute('data-comment') || '',
                    imageObject: null
                });
            });

            if (preliminaryMediaItems.length === 0) {
                logMessage("No media found to display after initial filtering.");
                return;
            }

            const preloadPromises = preliminaryMediaItems.map((item) =>
                loadMediaAsset(item.source)
                    .then(img => {
                        item.imageObject = img;
                        return item;
                    })
                    .catch(error => {
                        logMessage(`Failed to preload image ${item.source}: ${error.message}`);
                        if (item.originalElement && item.originalElement.parentNode) {
                            item.originalElement.parentNode.removeChild(item.originalElement);
                        }
                        return null;
                    })
            );

            Promise.all(preloadPromises).then(results => {
                componentState.mediaItems = results.filter(item => item !== null);
                componentState.totalMediaCount = componentState.mediaItems.length;

                if (componentState.totalMediaCount === 0) {
                    logMessage("All media failed to load or were filtered out.");
                    return;
                }

                componentState.thumbnailElements = componentState.mediaItems.map(item => item.originalElement).filter(el => el !== null);

                if (config.slidesPerThumbnailPage !== "all") {
                    const slidesPerPage = parseInt(config.slidesPerThumbnailPage);
                    componentState.totalThumbnailPages = Math.ceil(componentState.totalMediaCount / slidesPerPage);
                } else {
                    componentState.totalThumbnailPages = 1;
                }
                
                constructInterface();
                setupGlobalListeners();
                
                if (config.slidesPerThumbnailPage !== "all") {
                    jumpToThumbnailPage(0);
                } else {
                    componentState.thumbnailElements.forEach(el => el.style.display = 'block');
                }
                updateInterfaceStatus();
            });
        };

        initializeComponent();

        return {
            open: presentOverlay,
            close: dismissOverlay,
            next: () => advanceSlide(1),
            previous: () => advanceSlide(-1),
            goTo: jumpToSlide
        };
    }

    window.initVisualShowcase = function(selector, options) {
        const targetElement = document.querySelector(selector);
        if (!targetElement) {
            console.error(`VisualShowcase: No element found for selector "${selector}"`);
            return null;
        }
        return createVisualShowcase(targetElement, options);
    };

})();