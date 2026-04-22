class ImageExpander {
    #displayWrapper;
    #pointerElement;
    #controlPanel;
    #captionText;
    #actionStrip;
    #galleryStatus;
    #dismissButton;
    #contentArea;
    #spinnerIcon;
    #visualElement;
    #motionClip;
    #soundByte;

    #activationDelayIdentifier;
    #dismissalDelayIdentifier;
    #cursorCoordinates;
    #fullScreenActive;
    #currentGalleryItems;
    #galleryCurrentIndex;
    #isGalleryMode;
    #galleryBookmarks;
    #viewBoundarySize;

    #contentSourceHandlers;
    #hostDomainResolvers;

    constructor() {
        this.#activationDelayIdentifier = null;
        this.#dismissalDelayIdentifier = null;
        this.#cursorCoordinates = { x: 0, y: 0 };
        this.#fullScreenActive = false;
        this.#currentGalleryItems = [];
        this.#galleryCurrentIndex = 0;
        this.#isGalleryMode = false;
        this.#galleryBookmarks = new Map();
        this.#viewBoundarySize = 20;

        this.#contentSourceHandlers = [];
        this.#hostDomainResolvers = new Map();

        this.onHoverEntry = this.onHoverEntry.bind(this);
        this.onHoverExit = this.onHoverExit.bind(this);
        this.onMediaRendered = this.onMediaRendered.bind(this);
        this.updateCursorLocation = this.updateCursorLocation.bind(this);
        this.onKeyboardInput = this.onKeyboardInput.bind(this);
        this.dismissDisplay = this.dismissDisplay.bind(this);
        this.clearDismissalTimer = this.clearDismissalTimer.bind(this);
        this.clearActivationTimer = this.clearActivationTimer.bind(this);
    }

    initializeDisplay() {
        this.#constructInterfaceElements();
        this.#attachGlobalEventDelegation();
        this.#insertInterfaceIntoDOM();
    }

    #constructInterfaceElements() {
        this.#displayWrapper = document.createElement('div');
        this.#displayWrapper.id = 'ImageExpander-wrapper';
        this.#displayWrapper.addEventListener('mouseleave', this.onHoverExit);
        this.#displayWrapper.addEventListener('mouseover', this.clearDismissalTimer);

        this.#pointerElement = document.createElement('div');
        this.#pointerElement.id = 'ImageExpander-pointer';

        this.#controlPanel = document.createElement('div');
        this.#controlPanel.id = 'ImageExpander-controls';

        this.#captionText = document.createElement('span');
        this.#captionText.id = 'ImageExpander-caption';
        this.#captionText.textContent = 'ImageExpander';

        this.#actionStrip = document.createElement('div');
        this.#actionStrip.id = 'ImageExpander-actions';

        this.#galleryStatus = document.createElement('span');
        this.#galleryStatus.id = 'ImageExpander-galleryInfo';

        this.#dismissButton = document.createElement('div');
        this.#dismissButton.id = 'ImageExpander-close';
        this.#dismissButton.innerHTML = '&times;';
        this.#dismissButton.addEventListener('click', this.dismissDisplay);

        this.#controlPanel.append(this.#captionText, this.#actionStrip, this.#galleryStatus, this.#dismissButton);

        this.#contentArea = document.createElement('div');
        this.#contentArea.id = 'ImageExpander-content';

        this.#spinnerIcon = document.createElement('div');
        this.#spinnerIcon.id = 'ImageExpander-spinner';

        this.#visualElement = new Image();
        this.#visualElement.addEventListener('load', this.onMediaRendered);

        this.#motionClip = document.createElement('video');
        this.#soundByte = document.createElement('audio');

        this.#displayWrapper.append(this.#controlPanel, this.#contentArea);
    }

    #attachGlobalEventDelegation() {
        document.body.addEventListener('mouseover', this.#delegateHoverEvents);
        document.body.addEventListener('mouseout', this.#delegateHoverEvents);
        window.addEventListener('mousemove', this.updateCursorLocation);
    }

    #delegateHoverEvents = (event) => {
        const targetElement = event.target;
        if (targetElement.tagName === 'A' || targetElement.tagName === 'IMG') {
            if (event.type === 'mouseover') {
                this.onHoverEntry(event);
            } else if (event.type === 'mouseout') {
                this.onHoverExit(event);
            }
        }
    }

    #insertInterfaceIntoDOM() {
        document.body.append(this.#displayWrapper, this.#pointerElement);
    }

    updateCursorLocation(eventObject) {
        eventObject = eventObject || window.event;
        const currentPosition = { x: 0, y: 0 };
        if (eventObject.pageX || eventObject.pageY) {
            currentPosition.x = eventObject.pageX;
            currentPosition.y = eventObject.pageY;
        } else {
            currentPosition.x = eventObject.clientX +
                (document.documentElement.scrollLeft || document.body.scrollLeft) -
                document.documentElement.clientLeft;
            currentPosition.y = eventObject.clientY +
                (document.documentElement.scrollTop || document.body.scrollTop) -
                document.documentElement.clientTop;
        }
        this.#cursorCoordinates = { x: currentPosition.x, y: currentPosition.y };
    }

    onHoverEntry(eventObject) {
        this.clearActivationTimer();
        const targetElement = eventObject.target;
        this.#activationDelayIdentifier = setTimeout(() => {
            this.evaluateHyperlink(targetElement);
        }, 500);
    }

    evaluateHyperlink(element) {
        let actualElement = element;
        if (actualElement.target === undefined && actualElement.parentNode && actualElement.parentNode.target !== undefined) {
            actualElement = actualElement.parentNode;
        }

        this.examineGenericSource(actualElement)
            .then(mediaDetails => this.resolveMediaSource(mediaDetails))
            .then(mediaDetails => this.presentContent(mediaDetails))
            .catch(error => console.error('ImageExpander encountered an issue:', error));
    }

    onHoverExit(eventObject) {
        if (this.#fullScreenActive) {
            return;
        }
        this.clearActivationTimer();
        this.#dismissalDelayIdentifier = setTimeout(this.dismissDisplay, 500);
    }

    onMediaRendered(eventObject) {
        const visualWidth = eventObject ? eventObject.target.width : null;
        const visualHeight = eventObject ? eventObject.target.height : null;
        const presentationGeometry = this.calculatePresentationGeometry(visualWidth, visualHeight);

        if (this.#visualElement.src) {
            console.log('ImageExpander: Media source recorded to history:', this.#visualElement.src);
        }

        Object.assign(this.#displayWrapper.style, presentationGeometry.position);
        this.#displayWrapper.style.height = 'auto';
        this.#displayWrapper.style.width = 'auto';
        this.#displayWrapper.style.display = 'block';

        this.revealVisualContent();
    }

    revealVisualContent() {
        this.#spinnerIcon.style.display = 'none';
        this.#visualElement.style.display = 'block';
    }

    clearDismissalTimer() {
        if (this.#dismissalDelayIdentifier) {
            clearTimeout(this.#dismissalDelayIdentifier);
            this.#dismissalDelayIdentifier = null;
        }
    }

    clearActivationTimer() {
        if (this.#activationDelayIdentifier) {
            clearTimeout(this.#activationDelayIdentifier);
            this.#activationDelayIdentifier = null;
        }
    }

    calculatePresentationGeometry(mediaWidth, mediaHeight) {
        let maxDisplayWidth, maxDisplayHeight,
            verticalOffset, horizontalPosition, reverseHorizontalPosition, placementDirection,
            horizontalGap = 30,
            panelHeight = this.#controlPanel ? this.#controlPanel.offsetHeight : 60,
            viewportWidth = window.innerWidth,
            viewportHeight = window.innerHeight,
            viewportScrollTop = window.scrollY,
            viewportCenterX = window.scrollX + (viewportWidth / 2);

        if (this.#cursorCoordinates.x < viewportCenterX) {
            placementDirection = 'rightward';
            horizontalPosition = this.#cursorCoordinates.x + horizontalGap;
            reverseHorizontalPosition = null;
            maxDisplayWidth = viewportWidth - this.#cursorCoordinates.x - horizontalGap - this.#viewBoundarySize;
        } else {
            placementDirection = 'leftward';
            horizontalPosition = null;
            reverseHorizontalPosition = (viewportWidth - this.#cursorCoordinates.x) + horizontalGap - this.#viewBoundarySize;
            maxDisplayWidth = this.#cursorCoordinates.x - horizontalGap - this.#viewBoundarySize;
        }

        verticalOffset = viewportScrollTop + this.#viewBoundarySize;

        if (verticalOffset + (mediaHeight || this.#visualElement.height || 0) < this.#cursorCoordinates.y) {
            verticalOffset = this.#cursorCoordinates.y - (mediaHeight || this.#visualElement.height || 0);
        }

        maxDisplayHeight = viewportHeight - this.#viewBoundarySize - panelHeight;

        return {
            direction: placementDirection,
            position: {
                top: `${verticalOffset}px`,
                left: horizontalPosition !== null ? `${horizontalPosition}px` : null,
                right: reverseHorizontalPosition !== null ? `${reverseHorizontalPosition}px` : null,
            },
            sizing: {
                maxWidth: `${maxDisplayWidth}px`,
                maxHeight: `${maxDisplayHeight}px`
            }
        };
    }

    presentContent(mediaDetails) {
        if (!mediaDetails || !mediaDetails.contentType) {
            return;
        }
        this.#isGalleryMode = false;
        this.#galleryStatus.textContent = '';
        window.addEventListener('keydown', this.onKeyboardInput);

        const viewportScrollTop = window.scrollY;
        const presentationGeometry = this.calculatePresentationGeometry(null, null);
        let pointerPositioning;

        this.clearDismissalTimer();

        pointerPositioning = {
            top: `${Math.max(this.#cursorCoordinates.y, viewportScrollTop + this.#viewBoundarySize)}px`
        };

        if (presentationGeometry.direction === 'rightward') {
            pointerPositioning.left = `${this.#cursorCoordinates.x + 10}px`;
            pointerPositioning.right = null;
        } else {
            pointerPositioning.left = null;
            pointerPositioning.right = `${window.innerWidth - this.#cursorCoordinates.x - 10}px`;
        }

        Object.assign(this.#pointerElement.style, pointerPositioning);
        this.#pointerElement.style.display = 'block';
        this.#pointerElement.className = presentationGeometry.direction;

        if (mediaDetails.contentType === 'image') {
            this.renderVisualContent(presentationGeometry, mediaDetails.sourceURL, mediaDetails.description);
        } else if (mediaDetails.contentType === 'gallery') {
            this.#isGalleryMode = true;
            this.#currentGalleryItems = mediaDetails.items;
            const firstItemURL = mediaDetails.items[0].sourceURL;

            this.#galleryCurrentIndex = this.#galleryBookmarks.has(firstItemURL) ? this.#galleryBookmarks.get(firstItemURL) : 0;
            this.renderVisualContent(
                presentationGeometry,
                this.#currentGalleryItems[this.#galleryCurrentIndex].sourceURL,
                this.#currentGalleryItems[this.#galleryCurrentIndex].description
            );
            this.#galleryStatus.textContent = `${this.#galleryCurrentIndex + 1}/${this.#currentGalleryItems.length}`;
        }
        return true;
    }

    navigateGallery(step) {
        let newIndex = (this.#galleryCurrentIndex + step) % this.#currentGalleryItems.length;
        if (newIndex < 0) {
            newIndex = this.#currentGalleryItems.length - 1;
        }

        this.#galleryStatus.textContent = `${newIndex + 1}/${this.#currentGalleryItems.length}`;
        this.#galleryBookmarks.set(this.#currentGalleryItems[0].sourceURL, newIndex);
        this.#galleryCurrentIndex = newIndex;

        const presentationGeometry = this.calculatePresentationGeometry(null, null);
        this.renderVisualContent(
            presentationGeometry,
            this.#currentGalleryItems[this.#galleryCurrentIndex].sourceURL,
            this.#currentGalleryItems[this.#galleryCurrentIndex].description
        );
    }

    renderVisualContent(presentationGeometry, url, caption) {
        while (this.#contentArea.firstChild) {
            this.#contentArea.removeChild(this.#contentArea.firstChild);
        }

        this.#contentArea.append(this.#spinnerIcon);
        this.#contentArea.append(this.#visualElement);

        this.#visualElement.style.display = 'none';
        this.#visualElement.src = url;

        this.#captionText.textContent = caption || 'ImageExpander';

        Object.assign(this.#visualElement.style, presentationGeometry.sizing);

        Object.assign(this.#displayWrapper.style, presentationGeometry.position);
        this.#displayWrapper.style.display = 'block';

        if (this.#visualElement.naturalWidth > 0) {
            this.onMediaRendered();
        } else {
            this.#spinnerIcon.style.display = 'block';
        }
    }

    dismissDisplay() {
        this.#displayWrapper.style.display = 'none';
        this.#pointerElement.style.display = 'none';
        window.removeEventListener('keydown', this.onKeyboardInput);
        this.#fullScreenActive = false;
    }

    maximizeView() {
        this.#fullScreenActive = true;
        this.#pointerElement.style.display = 'none';

        const viewportScrollTop = window.scrollY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const panelHeight = this.#controlPanel ? this.#controlPanel.offsetHeight : 60;

        Object.assign(this.#displayWrapper.style, {
            top: `${this.#viewBoundarySize + viewportScrollTop}px`,
            left: `${this.#viewBoundarySize}px`,
            height: `${viewportHeight - (2 * this.#viewBoundarySize)}px`,
            width: `${viewportWidth - (2 * this.#viewBoundarySize)}px`,
            right: null
        });

        Object.assign(this.#visualElement.style, {
            maxHeight: `${viewportHeight - (2 * this.#viewBoundarySize) - panelHeight}px`,
            maxWidth: `${viewportWidth - (2 * this.#viewBoundarySize)}px`
        });
    }

    onKeyboardInput(eventObject) {
        switch (eventObject.key) {
            case 'Escape':
                this.dismissDisplay();
                break;
            case 'ArrowLeft':
                if (this.#isGalleryMode) {
                    this.navigateGallery(-1);
                }
                break;
            case 'ArrowRight':
                if (this.#isGalleryMode) {
                    this.navigateGallery(1);
                }
                break;
            case 'z':
            case 'Z':
                this.maximizeView();
                break;
            case 't':
            case 'T':
                if (this.#visualElement.src) {
                    window.open(this.#visualElement.src, '_blank');
                }
                break;
            default:
                break;
        }
    }

    registerContentSource(handlerObject) {
        this.#contentSourceHandlers.push(handlerObject);
        if (handlerObject.domains) {
            handlerObject.domains.forEach(domain => {
                this.#hostDomainResolvers.set(domain, handlerObject.id);
            });
        }
    }

    examineGenericSource(linkElement) {
        return new Promise(resolve => {
            const hyperlink = linkElement.href;
            if (!hyperlink) {
                return resolve({ link: linkElement });
            }
            const imageFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
            const url = new URL(hyperlink);
            const pathSegment = url.pathname.toLowerCase();
            const isDirectImageLink = imageFileTypes.some(ext => pathSegment.endsWith(ext));

            if (isDirectImageLink) {
                resolve({
                    link: linkElement,
                    contentType: 'image',
                    sourceURL: hyperlink,
                    description: linkElement.title || linkElement.alt || ''
                });
            } else {
                resolve({ link: linkElement });
            }
        });
    }

    resolveMediaSource(initialMediaDetails) {
        return new Promise(resolve => {
            const linkElement = initialMediaDetails.link;
            if (!linkElement || !linkElement.href) {
                return resolve(initialMediaDetails);
            }

            const url = new URL(linkElement.href);
            const hostname = url.hostname;

            let specificHandler = null;
            if (this.#hostDomainResolvers.has(hostname)) {
                const handlerId = this.#hostDomainResolvers.get(hostname);
                specificHandler = this.#contentSourceHandlers.find(h => h.id === handlerId);
            }

            if (specificHandler && specificHandler.check) {
                Promise.resolve(specificHandler.check(linkElement, initialMediaDetails))
                    .then(result => resolve(result || initialMediaDetails))
                    .catch(() => resolve(initialMediaDetails));
            } else {
                resolve(initialMediaDetails);
            }
        });
    }
}

const mediaExpanderInstance = new ImageExpander();
mediaExpanderInstance.initializeDisplay();