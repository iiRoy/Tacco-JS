class LightBoxPresenter {
    constructor(configurationOptions) {
        this.systemConfiguration = {
            contentWidth: '',
            contentHeight: '',
            contentPadding: '0',
            contentBgColor: '#ffffff',
            titleAttribute: 'title',
            showCounter: false,
            loopGallery: false,
            allowOverlayClose: true,
            ...configurationOptions
        };

        this.browserInfo = {
            isAppleDevice: /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
            isOlderIE: (document.all && !window.atob)
        };

        this.currentElement = null;
        this.currentScrollPosition = 0;
        this.isNavigationBlocked = false;
        this.currentItemCollection = [];
        this.nextItem = null;
        this.previousItem = null;

        this.pageContentWrapper = null;
        this.displayWindow = null;
        this.contentWrapper = null;
        this.innerContent = null;
        this.captionArea = null;
        this.counterInfo = null;
        this.loaderSign = null;
        this.forwardButton = null;
        this.backwardButton = null;
        this.closeButton = null;

        this.keyboardActionHandler = this.handleKeyboardInput.bind(this);
        this.transitionEndHandler = this.handleWindowTransitionEnd.bind(this);
        this.closeClickHandler = this.handleCloseClick.bind(this);
        this.forwardClickHandler = this.handleForwardNavigation.bind(this);
        this.backwardClickHandler = this.handleBackwardNavigation.bind(this);
    }

    initiate(selector) {
        const targetElements = document.querySelectorAll(selector);
        targetElements.forEach(element => {
            if (element.dataset.displayActive) {
                return;
            }
            element.classList.add('trigger-element');
            element.dataset.renderWidth = element.dataset.renderWidth || this.systemConfiguration.contentWidth;
            element.dataset.renderHeight = element.dataset.renderHeight || this.systemConfiguration.contentHeight;
            element.dataset.renderPadding = element.dataset.renderPadding || this.systemConfiguration.contentPadding;
            element.dataset.renderBackground = element.dataset.renderBackground || this.systemConfiguration.contentBgColor;
            element.dataset.showCount = element.dataset.showCount || this.systemConfiguration.showCounter;
            element.dataset.loopItems = element.dataset.loopItems || this.systemConfiguration.loopGallery;
            element.dataset.allowExit = element.dataset.allowExit || this.systemConfiguration.allowOverlayClose;
            element.dataset.displayActive = 'true';

            element.addEventListener('click', this.handleTriggerClick.bind(this));
        });
    }

    handleTriggerClick(event) {
        event.stopPropagation();
        event.preventDefault();

        this.currentElement = event.currentTarget;
        this.isNavigationBlocked = false;

        this.currentScrollPosition = window.scrollY;
        
        this.pageContentWrapper = document.createElement('div');
        this.pageContentWrapper.classList.add('page-scroll-wrapper');
        while (document.body.firstChild) {
            this.pageContentWrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(this.pageContentWrapper);

        this.createDisplayElements();

        this.displayWindow.style.minHeight = `${window.innerHeight}px`;
        const backdropColor = this.currentElement.dataset.windowBackdrop || '';

        if (this.browserInfo.isOlderIE) {
            this.displayWindow.style.opacity = '0';
            this.displayWindow.style.transition = 'none';
            this.displayWindow.style.backgroundColor = backdropColor;
            this.displayWindow.style.opacity = '1';
            this.prepareAndLoadContent();
        } else {
            this.displayWindow.style.opacity = '0';
            this.displayWindow.style.transition = 'opacity 0.25s ease-in-out';
            this.displayWindow.style.backgroundColor = backdropColor;
            this.displayWindow.addEventListener('transitionend', this.transitionEndHandler);
            requestAnimationFrame(() => {
                this.displayWindow.style.opacity = '1';
            });
        }

        if (this.browserInfo.isAppleDevice) {
            this.pageContentWrapper.style.position = 'fixed';
            this.pageContentWrapper.style.top = `-${this.currentScrollPosition}px`;
            this.pageContentWrapper.style.opacity = '0';
            this.pageContentWrapper.dataset.originalTop = `-${this.currentScrollPosition}`;
        } else {
            this.pageContentWrapper.style.position = 'fixed';
            this.pageContentWrapper.style.top = `-${this.currentScrollPosition}px`;
            window.scrollTo(0, 0);
        }

        this.updateNavigationControls();
        document.addEventListener('keydown', this.keyboardActionHandler);
    }

    createDisplayElements() {
        this.displayWindow = document.createElement('div');
        this.displayWindow.classList.add('display-window');
        if (this.currentElement.dataset.customStyle) {
            this.displayWindow.classList.add(this.currentElement.dataset.customStyle);
        }
        
        this.loaderSign = document.createElement('div');
        this.loaderSign.classList.add('loader-sign');
        this.loaderSign.textContent = 'Loading...';

        this.contentWrapper = document.createElement('div');
        this.contentWrapper.classList.add('content-wrapper');

        this.innerContent = document.createElement('div');
        this.innerContent.classList.add('inner-content');

        this.captionArea = document.createElement('div');
        this.captionArea.classList.add('caption-area');

        this.counterInfo = document.createElement('div');
        this.counterInfo.classList.add('counter-info');
        this.counterInfo.textContent = '0/0';

        this.closeButton = document.createElement('button');
        this.closeButton.classList.add('close-button');
        this.closeButton.textContent = 'X';
        this.closeButton.addEventListener('click', this.closeClickHandler);

        this.forwardButton = document.createElement('button');
        this.forwardButton.classList.add('forward-button');
        this.forwardButton.textContent = 'next';
        this.forwardButton.addEventListener('click', this.forwardClickHandler);

        this.backwardButton = document.createElement('button');
        this.backwardButton.classList.add('backward-button');
        this.backwardButton.textContent = 'prev';
        this.backwardButton.addEventListener('click', this.backwardClickHandler);

        this.contentWrapper.appendChild(this.innerContent);
        this.displayWindow.append(this.loaderSign, this.contentWrapper, this.captionArea, this.counterInfo, this.closeButton, this.forwardButton, this.backwardButton);
        document.body.appendChild(this.displayWindow);
    }

    handleWindowTransitionEnd(event) {
        if (event.target !== this.displayWindow) {
            return;
        }
        this.displayWindow.style.minHeight = `${window.innerHeight}px`;
        this.displayWindow.style.height = 'auto';
        this.displayWindow.removeEventListener('transitionend', this.transitionEndHandler);
        this.prepareAndLoadContent();
    }

    prepareAndLoadContent() {
        this.innerContent.innerHTML = '';
        this.innerContent.style.opacity = '0';
        this.loaderSign.style.display = 'block';

        const contentType = this.currentElement.dataset.contentSource;
        const targetSource = this.currentElement.getAttribute('href');

        switch (contentType) {
            case 'iframe':
                this.loadFrameContent(targetSource);
                break;
            case 'inline':
                this.loadLocalContent(targetSource);
                break;
            case 'ajax':
                this.retrieveRemoteContent(targetSource);
                break;
            case 'vimeo':
                this.loadEmbeddedVideo('vimeo', targetSource);
                break;
            case 'youtube':
                this.loadEmbeddedVideo('youtube', targetSource);
                break;
            default:
                this.loadImageContent(targetSource);
                break;
        }
    }

    updateNavigationControls() {
        const collectionId = this.currentElement.dataset.collectionId;
        this.currentItemCollection = collectionId ? Array.from(document.querySelectorAll(`.trigger-element[data-collection-id="${collectionId}"]`)) : [];

        const currentItemIndex = this.currentItemCollection.indexOf(this.currentElement);
        const totalItems = this.currentItemCollection.length;

        const showCount = this.currentElement.dataset.showCount === 'true';
        const loopItems = this.currentElement.dataset.loopItems === 'true';

        if (totalItems > 0 && showCount) {
            this.counterInfo.textContent = `${currentItemIndex + 1} / ${totalItems}`;
            this.counterInfo.style.display = 'block';
        } else {
            this.counterInfo.style.display = 'none';
        }

        const currentTitle = this.currentElement.getAttribute(this.systemConfiguration.titleAttribute);
        if (currentTitle) {
            this.captionArea.textContent = currentTitle;
            this.captionArea.style.display = 'block';
        } else {
            this.captionArea.textContent = '';
            this.captionArea.style.display = 'none';
        }

        let canGoNext = false;
        let canGoPrev = false;

        if (totalItems > 0) {
            this.nextItem = this.currentItemCollection[currentItemIndex + 1];
            this.previousItem = this.currentItemCollection[currentItemIndex - 1];

            if (loopItems) {
                canGoNext = true;
                canGoPrev = true;
                if (!this.nextItem) {
                    this.nextItem = this.currentItemCollection[0];
                }
                if (!this.previousItem) {
                    this.previousItem = this.currentItemCollection[totalItems - 1];
                }
            } else {
                canGoNext = !!this.nextItem;
                canGoPrev = !!this.previousItem;
            }
        }

        this.forwardButton.style.display = canGoNext ? 'block' : 'none';
        this.backwardButton.style.display = canGoPrev ? 'block' : 'none';
    }

    handleBackwardNavigation() {
        if (this.isNavigationBlocked || !this.previousItem) return;
        this.isNavigationBlocked = true;
        this.displayWindow.style.minHeight = `${window.innerHeight}px`;
        
        this.innerContent.style.opacity = '0';
        this.innerContent.addEventListener('transitionend', () => {
            this.displayWindow.style.backgroundColor = this.previousItem.dataset.windowBackdrop || '';
            this.currentElement = this.previousItem;
            this.updateNavigationControls();
            this.prepareAndLoadContent();
            this.isNavigationBlocked = false;
        }, { once: true });
    }

    handleForwardNavigation() {
        if (this.isNavigationBlocked || !this.nextItem) return;
        this.isNavigationBlocked = true;
        this.displayWindow.style.minHeight = `${window.innerHeight}px`;

        this.innerContent.style.opacity = '0';
        this.innerContent.addEventListener('transitionend', () => {
            this.displayWindow.style.backgroundColor = this.nextItem.dataset.windowBackdrop || '';
            this.currentElement = this.nextItem;
            this.updateNavigationControls();
            this.prepareAndLoadContent();
            this.isNavigationBlocked = false;
        }, { once: true });
    }

    retrieveRemoteContent(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok.');
                return response.text();
            })
            .then(data => {
                this.innerContent.innerHTML = `<div class="content-segment">${data}</div>`;
                this.finalizeContentDisplay(true);
            })
            .catch(() => {
                this.innerContent.innerHTML = '<div class="content-segment"><p>Error retrieving contents, please retry</p></div>';
                this.finalizeContentDisplay(true);
            });
    }

    loadFrameContent(url) {
        this.innerContent.innerHTML = `<iframe class="render-frame" src="${url}"></iframe>`;
        this.finalizeContentDisplay();
    }

    loadEmbeddedVideo(type, url) {
        const parts = url.split('/');
        const videoId = parts[parts.length - 1];
        
        let embedSrc = '';
        if (type === 'vimeo') {
            embedSrc = `//player.vimeo.com/video/${videoId}`;
        } else if (type === 'youtube') {
            embedSrc = `//www.youtube.com/embed/${videoId}`;
        }
        this.innerContent.innerHTML = `<iframe class="render-frame" allowfullscreen src="${embedSrc}"></iframe>`;
        this.finalizeContentDisplay();
    }

    loadLocalContent(selector) {
        const sourceElement = document.querySelector(selector);
        if (sourceElement) {
            this.innerContent.innerHTML = `<div class="content-segment">${sourceElement.innerHTML}</div>`;
        } else {
            this.innerContent.innerHTML = '<div class="content-segment"><p>Inline content not found.</p></div>';
        }
        this.finalizeContentDisplay();
    }

    loadImageContent(url) {
        const image = new Image();
        image.src = url;
        image.classList.add('render-image');
        image.onload = () => {
            this.innerContent.innerHTML = '';
            this.innerContent.appendChild(image);
            this.finalizeContentDisplay();
        };
        image.onerror = () => {
             this.innerContent.innerHTML = '<div class="content-segment"><p>Image failed to load.</p></div>';
             this.finalizeContentDisplay();
        };
    }

    finalizeContentDisplay(preventScrollReset = false) {
        this.loaderSign.style.display = 'none';
        if (!preventScrollReset) {
            window.scrollTo(0, 0);
        }

        const currentTitle = this.currentElement.getAttribute(this.systemConfiguration.titleAttribute);
        this.captionArea.textContent = currentTitle || '';
        this.captionArea.style.display = currentTitle ? 'block' : 'none';

        const childElement = this.innerContent.firstElementChild;
        if (childElement) {
            childElement.classList.add('displayed-segment');
            childElement.style.width = this.currentElement.dataset.renderWidth || this.systemConfiguration.contentWidth;
            childElement.style.height = this.currentElement.dataset.renderHeight || this.systemConfiguration.contentHeight;
            childElement.style.padding = this.currentElement.dataset.renderPadding || this.systemConfiguration.contentPadding;
            childElement.style.background = this.currentElement.dataset.renderBackground || this.systemConfiguration.contentBgColor;
        }

        const segmentHeight = this.innerContent.offsetHeight;
        const windowHeight = window.innerHeight;

        let verticalMargin = '40px';
        if (segmentHeight + 80 < windowHeight) {
            verticalMargin = `${(windowHeight - segmentHeight) / 2}px`;
        }
        this.innerContent.style.marginTop = verticalMargin;
        this.innerContent.style.marginBottom = verticalMargin;

        this.innerContent.style.transition = 'opacity 0.3s ease-in-out';
        this.innerContent.style.opacity = '1';
    }

    handleKeyboardInput(event) {
        if (event.key === 'Escape') {
            this.closeDisplay();
        } else if (event.key === 'ArrowLeft' && this.backwardButton.style.display === 'block') {
            this.handleBackwardNavigation();
        } else if (event.key === 'ArrowRight' && this.forwardButton.style.display === 'block') {
            this.handleForwardNavigation();
        }
    }

    handleCloseClick(event) {
        const allowExit = this.currentElement.dataset.allowExit === 'true';
        const isContent = event.target.closest('.displayed-segment') || event.target === this.forwardButton || event.target === this.backwardButton;

        if (event.target === this.closeButton || (allowExit && !isContent && event.target === this.displayWindow)) {
            this.closeDisplay();
        }
    }

    closeDisplay() {
        document.removeEventListener('keydown', this.keyboardActionHandler);
        
        if (this.browserInfo.isOlderIE) {
            this.displayWindow.style.opacity = '0';
            this.cleanUpDisplay();
        } else {
            this.displayWindow.style.transition = 'opacity 0.3s ease-in-out';
            this.displayWindow.style.opacity = '0';
            this.displayWindow.addEventListener('transitionend', (event) => {
                if (event.target === this.displayWindow) {
                    this.cleanUpDisplay();
                }
            }, { once: true });
        }
    }

    cleanUpDisplay() {
        if (this.displayWindow && this.displayWindow.parentNode) {
            this.displayWindow.parentNode.removeChild(this.displayWindow);
        }

        if (this.pageContentWrapper) {
            while (this.pageContentWrapper.firstChild) {
                document.body.appendChild(this.pageContentWrapper.firstChild);
            }
            document.body.removeChild(this.pageContentWrapper);
            this.pageContentWrapper = null;
        }

        if (this.browserInfo.isAppleDevice) {
            const originalTop = parseInt(this.pageContentWrapper.dataset.originalTop, 10);
            this.pageContentWrapper.style.transition = 'opacity 0.3s ease-in-out';
            this.pageContentWrapper.style.opacity = '1';
            this.pageContentWrapper.addEventListener('transitionend', () => {
                this.pageContentWrapper.style.position = '';
                this.pageContentWrapper.style.top = '';
                window.scrollTo(0, -originalTop);
                this.pageContentWrapper.style.transition = '';
            }, { once: true });
        } else {
            window.scrollTo(0, this.currentScrollPosition);
        }
        
        if (this.currentElement) {
            this.currentElement.focus();
        }

        this.currentElement = null;
        this.isNavigationBlocked = false;
        this.currentItemCollection = [];
        this.nextItem = null;
        this.previousItem = null;
        this.displayWindow = null;
        this.contentWrapper = null;
        this.innerContent = null;
        this.captionArea = null;
        this.counterInfo = null;
        this.loaderSign = null;
        this.forwardButton = null;
        this.backwardButton = null;
        this.closeButton = null;
    }
}

(function() {
    const createDisplaySystem = (elementSelector, initialSettings) => {
        const manager = new LightBoxPresenter(initialSettings);
        manager.initiate(elementSelector);
        return manager;
    };

    document.addEventListener('DOMContentLoaded', () => {
        createDisplaySystem('.display-activator', {
            contentWidth: '',
            contentHeight: '',
            contentPadding: '0',
            contentBgColor: '#ffffff',
            titleAttribute: 'title',
            showCounter: false,
            loopGallery: false,
            allowOverlayClose: true
        });
    });
})();