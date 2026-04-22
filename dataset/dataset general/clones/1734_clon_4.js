/* ContentDisplayManager - A Type IV clone of poptrox.js */

const getComputedStyleValue = (element, property) => window.getComputedStyle(element).getPropertyValue(property);

const setElementStyles = (element, styles) => {
    for (const prop in styles) {
        if (styles.hasOwnProperty(prop)) {
            element.style.setProperty(prop, styles[prop]);
        }
    }
};

const injectGlobalStyles = (id, cssRules) => {
    if (document.getElementById(id)) return;
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
};

const preventInteraction = (event) => {
    event.preventDefault();
    event.stopPropagation();
};

const dispatchCustomEvent = (element, eventName, detail = {}) => {
    const event = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
};

class ContentDisplayManager {
    constructor(targetDomElement, userConfiguration = {}) {
        if (!targetDomElement) {
            return;
        }

        this.hostElement = targetDomElement;
        this.currentOperationLocked = false;
        this.contentStore = [];
        this.currentContentIndex = 0;

        this.configuration = Object.assign({}, ContentDisplayManager.defaultConfiguration, userConfiguration);

        this.buildDisplayElements();
        this.applyBaseStyling();
        this.registerEventHandlers();
        this.collectLinkedContent(this.hostElement);
    }

    static defaultConfiguration = {
        preloadAssets: false,
        rootZIndex: 1000,
        animationDuration: 300,
        backdropColor: '#000000',
        backdropOpacity: 0.6,
        marginAroundWindow: 50,
        heightPadding: 0,
        linkSelector: 'a',
        captionSource: 'title', // 'title', 'data-caption', or a function
        placementParent: 'body',
        displayWidth: 200,
        displayHeight: 100,
        fixedDimensions: false,
        hideBodyScrollbar: false,
        easyDismissal: true,
        forceDismissal: false,
        showLoadingSpinner: true,
        showCloseControl: true,
        showContentTitle: false,
        showNavigationControls: false,
        useDefaultLayoutStyles: true,
        displayBgColor: '#FFFFFF',
        displayTxtColor: '#000000',
        loaderTxtSize: '2em',
        closeControlBgColor: '#000000',
        closeControlTxtColor: '#FFFFFF',
        closeControlTxtSize: '20px',
        displayPad: 10,
        titleBarHeight: 60,
        titleBarTxtSize: null,
        blankTitleText: '(untitled)',
        closeControlText: '&#215;',
        loaderAnimationText: '&bull;&bull;&bull;&bull;',
        onDisplayClosed: null,
        onDisplayOpened: null
    };

    buildDisplayElements() {
        const conf = this.configuration;

        this.backdropElement = document.createElement('div');
        this.backdropElement.className = 'content-display-backdrop';
        setElementStyles(this.backdropElement, {
            'position': 'fixed',
            'left': '0',
            'top': '0',
            'z-index': conf.rootZIndex,
            'width': '100%',
            'height': '100%',
            'text-align': 'center',
            'cursor': 'pointer',
            'opacity': '0',
            'pointer-events': 'none',
            'transition': `opacity ${conf.animationDuration}ms ease-in-out`
        });

        const verticalAlignHelper = document.createElement('div');
        setElementStyles(verticalAlignHelper, {
            'display': 'inline-block',
            'height': '100%',
            'vertical-align': 'middle'
        });
        this.backdropElement.appendChild(verticalAlignHelper);

        const overlayBg = document.createElement('div');
        setElementStyles(overlayBg, {
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'width': '100%',
            'height': '100%',
            'background': conf.backdropColor,
            'opacity': conf.backdropOpacity,
            'z-index': '-1'
        });
        this.backdropElement.appendChild(overlayBg);

        this.mainDisplayContainer = document.createElement('div');
        this.mainDisplayContainer.className = 'content-display-container';
        setElementStyles(this.mainDisplayContainer, {
            'display': 'inline-block',
            'vertical-align': 'middle',
            'position': 'relative',
            'z-index': conf.rootZIndex + 1,
            'opacity': '0',
            'transition': `opacity ${conf.animationDuration}ms ease-in-out, width ${conf.animationDuration}ms ease-in-out, height ${conf.animationDuration}ms ease-in-out`
        });
        this.backdropElement.appendChild(this.mainDisplayContainer);

        this.contentArea = document.createElement('div');
        this.contentArea.className = 'content-display-item-area';
        setElementStyles(this.contentArea, {
            'text-indent': '-9999px',
            'overflow': 'hidden',
            'position': 'relative'
        });
        this.mainDisplayContainer.appendChild(this.contentArea);

        if (conf.showLoadingSpinner) {
            this.loadingIndicator = document.createElement('div');
            this.loadingIndicator.className = 'content-display-loader';
            this.loadingIndicator.innerHTML = conf.loaderAnimationText;
            setElementStyles(this.loadingIndicator, { 'display': 'none' });
            this.mainDisplayContainer.appendChild(this.loadingIndicator);
        }

        if (conf.showContentTitle) {
            this.titleBar = document.createElement('div');
            this.titleBar.className = 'content-display-title-bar';
            setElementStyles(this.titleBar, { 'display': 'none' });
            this.mainDisplayContainer.appendChild(this.titleBar);
        }

        if (conf.showCloseControl) {
            this.closeControl = document.createElement('span');
            this.closeControl.className = 'content-display-close-control';
            this.closeControl.innerHTML = conf.closeControlText;
            setElementStyles(this.closeControl, { 'display': 'none' });
            this.mainDisplayContainer.appendChild(this.closeControl);
        }

        if (conf.showNavigationControls) {
            this.previousControl = document.createElement('div');
            this.previousControl.className = 'content-display-nav-previous';
            this.previousControl.innerHTML = '<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>';
            setElementStyles(this.previousControl, { 'display': 'none' });
            this.mainDisplayContainer.appendChild(this.previousControl);

            this.nextControl = document.createElement('div');
            this.nextControl.className = 'content-display-nav-next';
            this.nextControl.innerHTML = '<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>';
            setElementStyles(this.nextControl, { 'display': 'none' });
            this.mainDisplayContainer.appendChild(this.nextControl);
        }

        document.querySelector(conf.placementParent).appendChild(this.backdropElement);
    }

    applyBaseStyling() {
        const conf = this.configuration;

        const baseCss = `
            .content-display-backdrop {
                pointer-events: none;
            }
            .content-display-backdrop.is-active {
                pointer-events: auto;
                opacity: 1;
            }
            .content-display-container {
                opacity: 0;
            }
            .content-display-container.is-visible {
                opacity: 1;
            }
            .content-display-loader {
                position: relative;
                font-size: ${conf.loaderTxtSize};
                color: ${conf.displayTxtColor};
            }
            .content-display-close-control {
                cursor: pointer;
                font-size: ${conf.closeControlTxtSize};
                background: ${conf.closeControlBgColor};
                color: ${conf.closeControlTxtColor};
                display: block;
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                position: absolute;
                text-decoration: none;
                outline: 0;
                top: 0;
                right: -40px;
            }
            .content-display-nav-previous,
            .content-display-nav-next {
                font-size: 75px;
                text-align: center;
                color: #fff;
                text-shadow: none;
                height: 100%;
                position: absolute;
                top: 0;
                opacity: 0.35;
                cursor: pointer;
                box-shadow: inset 0px 0px 10px 0px rgba(0,0,0,0);
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                transition: opacity ${conf.animationDuration}ms ease-in-out;
            }
            .content-display-nav-previous:hover,
            .content-display-nav-next:hover {
                opacity: 0.7;
            }
            .content-display-nav-next {
                right: 0;
                width: ${conf.easyDismissal ? '100px' : '75%'};
            }
            .content-display-nav-previous {
                left: 0;
                width: ${conf.easyDismissal ? '100px' : '25%'};
            }
        `;
        injectGlobalStyles('content-display-manager-styles', baseCss);

        if (conf.useDefaultLayoutStyles) {
            setElementStyles(this.mainDisplayContainer, {
                'background': conf.displayBgColor,
                'color': conf.displayTxtColor,
                'padding': `${conf.displayPad}px`
            });

            if (this.titleBar) {
                setElementStyles(this.mainDisplayContainer, {
                    'padding-bottom': `${conf.titleBarHeight}px`
                });
                setElementStyles(this.titleBar, {
                    'position': 'absolute',
                    'left': '0',
                    'bottom': '0',
                    'width': '100%',
                    'text-align': 'center',
                    'height': `${conf.titleBarHeight}px`,
                    'line-height': `${conf.titleBarHeight}px`
                });
                if (conf.titleBarTxtSize) {
                    setElementStyles(this.titleBar, { 'font-size': conf.titleBarTxtSize });
                }
            }
        }
    }

    registerEventHandlers() {
        const conf = this.configuration;

        window.addEventListener('resize', () => this.recalculateDisplaySize());
        window.addEventListener('orientationchange', () => this.recalculateDisplaySize());

        if (this.closeControl) {
            this.closeControl.addEventListener('click', preventInteraction);
            this.closeControl.addEventListener('click', () => dispatchCustomEvent(this.mainDisplayContainer, 'display:close'));
        }

        if (this.nextControl) {
            this.nextControl.addEventListener('click', preventInteraction);
            this.nextControl.addEventListener('click', () => dispatchCustomEvent(this.mainDisplayContainer, 'display:next'));
        }

        if (this.previousControl) {
            this.previousControl.addEventListener('click', preventInteraction);
            this.previousControl.addEventListener('click', () => dispatchCustomEvent(this.mainDisplayContainer, 'display:previous'));
        }

        if (conf.easyDismissal) {
            this.backdropElement.addEventListener('click', preventInteraction);
            this.backdropElement.addEventListener('click', () => dispatchCustomEvent(this.mainDisplayContainer, 'display:close'));
            this.contentArea.addEventListener('click', preventInteraction);
            this.contentArea.addEventListener('click', () => dispatchCustomEvent(this.mainDisplayContainer, 'display:close'));
        }

        this.mainDisplayContainer.addEventListener('display:next', () => this.advanceContent());
        this.mainDisplayContainer.addEventListener('display:previous', () => this.retreatContent());
        this.mainDisplayContainer.addEventListener('display:reset', () => this.resetDisplayState());
        this.mainDisplayContainer.addEventListener('display:open', (evt) => this.openPresenter(evt.detail.index));
        this.mainDisplayContainer.addEventListener('display:switch', (evt) => this.switchContent(evt.detail.index, evt.detail.ignoreLock));
        this.mainDisplayContainer.addEventListener('display:close', () => this.dismissContent());
    }

    collectLinkedContent(rootElement) {
        const conf = this.configuration;
        const links = rootElement.querySelectorAll(conf.linkSelector);
        links.forEach((link, index) => {
            link.dataset.contentDisplayIndex = index;
            link.addEventListener('click', (e) => {
                preventInteraction(e);
                dispatchCustomEvent(this.mainDisplayContainer, 'display:open', { index });
            });

            const contentObject = {
                sourceUrl: link.href,
                contentType: this.determineContentType(link.href),
                captionText: this.getCaption(link),
                originalLink: link,
                elementReference: null
            };
            this.contentStore.push(contentObject);
        });
    }

    determineContentType(url) {
        if (/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) return 'image';
        if (/\.(mp4|webm|ogg)$/i.test(url)) return 'video';
        if (/\.(html|htm)$/i.test(url) || url.startsWith('/')) return 'ajax';
        return 'iframe';
    }

    getCaption(linkElement) {
        const conf = this.configuration;
        if (typeof conf.captionSource === 'function') {
            return conf.captionSource(linkElement);
        }
        if (conf.captionSource === 'data-caption') {
            return linkElement.dataset.caption || linkElement.title || conf.blankTitleText;
        }
        return linkElement.title || conf.blankTitleText;
    }

    recalculateDisplaySize() {
        const conf = this.configuration;
        const currentContent = this.contentStore[this.currentContentIndex];
        if (!currentContent || !currentContent.elementReference || !this.mainDisplayContainer.classList.contains('is-visible')) {
            return;
        }

        const browserWindowWidth = window.innerWidth;
        const browserWindowHeight = window.innerHeight + conf.heightPadding;

        const containerPaddingX = parseFloat(getComputedStyleValue(this.mainDisplayContainer, 'padding-left')) + parseFloat(getComputedStyleValue(this.mainDisplayContainer, 'padding-right'));
        const containerPaddingY = parseFloat(getComputedStyleValue(this.mainDisplayContainer, 'padding-top')) + parseFloat(getComputedStyleValue(this.mainDisplayContainer, 'padding-bottom'));

        let availableWidth = browserWindowWidth - (conf.marginAroundWindow * 2) - containerPaddingX;
        let availableHeight = browserWindowHeight - (conf.marginAroundWindow * 2) - containerPaddingY;

        if (this.titleBar && this.titleBar.style.display !== 'none') {
            availableHeight -= conf.titleBarHeight;
        }

        let contentWidth = currentContent.actualWidth || conf.displayWidth;
        let contentHeight = currentContent.actualHeight || conf.displayHeight;

        if (!conf.fixedDimensions) {
            if (contentWidth > availableWidth || contentHeight > availableHeight) {
                const widthRatio = availableWidth / contentWidth;
                const heightRatio = availableHeight / contentHeight;
                const scaleFactor = Math.min(widthRatio, heightRatio);

                contentWidth *= scaleFactor;
                contentHeight *= scaleFactor;
            }
        } else {
            contentWidth = conf.displayWidth;
            contentHeight = conf.displayHeight;
        }

        setElementStyles(currentContent.elementReference, {
            'max-width': `${contentWidth}px`,
            'max-height': `${contentHeight}px`,
            'width': 'auto',
            'height': 'auto'
        });

        this.mainDisplayContainer.style.width = `${contentWidth + containerPaddingX}px`;
        this.mainDisplayContainer.style.height = `${contentHeight + containerPaddingY}px`;
    }

    startLoadingSpinner() {
        if (!this.loadingIndicator) return;
        this.loadingIndicator.style.display = 'block';
        let frame = 0;
        const frames = ['&bull;&bull;&bull;&bull;', '&#8226;&bull;&bull;&bull;', '&#8226;&#8226;&bull;&bull;', '&#8226;&#8226;&#8226;&bull;'];
        this.spinnerInterval = setInterval(() => {
            this.loadingIndicator.innerHTML = frames[frame % frames.length];
            frame++;
        }, 300);
    }

    stopLoadingSpinner() {
        if (!this.loadingIndicator) return;
        clearInterval(this.spinnerInterval);
        this.loadingIndicator.style.display = 'none';
        this.loadingIndicator.innerHTML = this.configuration.loaderAnimationText;
    }

    resetDisplayState() {
        this.stopLoadingSpinner();
        if (this.titleBar) this.titleBar.style.display = 'none';
        if (this.closeControl) this.closeControl.style.display = 'none';
        if (this.nextControl) this.nextControl.style.display = 'none';
        if (this.previousControl) this.previousControl.style.display = 'none';

        if (this.currentActiveContentElement) {
            this.currentActiveContentElement.remove();
            this.currentActiveContentElement = null;
        }

        setElementStyles(this.mainDisplayContainer, {
            'width': `${this.configuration.displayWidth}px`,
            'height': `${this.configuration.displayHeight}px`
        });
    }

    openPresenter(initialIndex) {
        if (this.currentOperationLocked) return;
        this.currentOperationLocked = true;

        if (this.configuration.hideBodyScrollbar) {
            document.body.style.overflow = 'hidden';
        }
        if (this.configuration.onDisplayOpened) {
            this.configuration.onDisplayOpened();
        }

        this.backdropElement.classList.add('is-active');
        this.backdropElement.addEventListener('transitionend', function handler() {
            this.removeEventListener('transitionend', handler);
            dispatchCustomEvent(this.mainDisplayContainer, 'display:switch', { index: initialIndex, ignoreLock: true });
        }.bind(this));
    }

    dismissContent() {
        if (this.currentOperationLocked && !this.configuration.forceDismissal) return;

        this.currentOperationLocked = true;
        this.backdropElement.classList.remove('is-active');
        this.mainDisplayContainer.classList.remove('is-visible');

        this.backdropElement.addEventListener('transitionend', function handler() {
            this.removeEventListener('transitionend', handler);
            this.resetDisplayState();
            if (this.configuration.hideBodyScrollbar) {
                document.body.style.overflow = '';
            }
            if (this.configuration.onDisplayClosed) {
                this.configuration.onDisplayClosed();
            }
            this.currentOperationLocked = false;
        }.bind(this));
    }

    switchContent(index, ignoreLock = false) {
        if (!ignoreLock && this.currentOperationLocked) return;
        this.currentOperationLocked = true;

        this.currentContentIndex = index;
        const targetContent = this.contentStore[index];

        this.resetDisplayState();
        this.startLoadingSpinner();
        this.mainDisplayContainer.classList.add('is-visible');

        if (!targetContent) {
            this.currentOperationLocked = false;
            this.stopLoadingSpinner();
            return;
        }

        const contentElement = this.createContentElement(targetContent);
        this.currentActiveContentElement = contentElement;

        this.contentArea.style.textIndent = '-9999px';
        this.contentArea.appendChild(contentElement);

        const onContentReady = () => {
            this.stopLoadingSpinner();
            targetContent.actualWidth = contentElement.naturalWidth || contentElement.offsetWidth || this.configuration.displayWidth;
            targetContent.actualHeight = contentElement.naturalHeight || contentElement.offsetHeight || this.configuration.displayHeight;

            this.recalculateDisplaySize();
            this.mainDisplayContainer.style.opacity = '1';

            if (this.titleBar) {
                this.titleBar.textContent = targetContent.captionText;
                this.titleBar.style.display = 'block';
            }
            if (this.closeControl) this.closeControl.style.display = 'block';
            if (this.nextControl) this.nextControl.style.display = 'block';
            if (this.previousControl) this.previousControl.style.display = 'block';

            this.contentArea.style.textIndent = '0';
            this.currentOperationLocked = false;
        };

        if (targetContent.contentType === 'image') {
            if (contentElement.complete) {
                onContentReady();
            } else {
                contentElement.addEventListener('load', onContentReady);
                contentElement.addEventListener('error', () => {
                    this.currentOperationLocked = false;
                    this.stopLoadingSpinner();
                });
            }
        } else if (targetContent.contentType === 'ajax') {
            fetch(targetContent.sourceUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    contentElement.innerHTML = data;
                    onContentReady();
                })
                .catch(error => {
                    this.currentOperationLocked = false;
                    this.stopLoadingSpinner();
                });
        } else { // iframe or video
            contentElement.addEventListener('load', onContentReady);
            setTimeout(onContentReady, 1000);
        }
    }

    createContentElement(contentObject) {
        let element;
        switch (contentObject.contentType) {
            case 'image':
                element = document.createElement('img');
                element.src = contentObject.sourceUrl;
                setElementStyles(element, { 'display': 'block', 'max-width': '100%', 'max-height': '100%' });
                break;
            case 'video':
                element = document.createElement('video');
                element.src = contentObject.sourceUrl;
                element.controls = true;
                element.autoplay = true;
                element.loop = true;
                setElementStyles(element, { 'max-width': '100%', 'max-height': '100%' });
                break;
            case 'ajax':
                element = document.createElement('div');
                element.className = 'content-display-ajax-content';
                setElementStyles(element, { 'overflow': 'auto', 'max-width': '100%', 'max-height': '100%' });
                break;
            case 'iframe':
            default:
                element = document.createElement('iframe');
                element.src = contentObject.sourceUrl;
                element.frameBorder = '0';
                setElementStyles(element, { 'border': 'none', 'width': '100%', 'height': '100%' });
                break;
        }
        setElementStyles(element, {
            'position': 'relative',
            'outline': '0',
            'z-index': this.configuration.rootZIndex + 100
        });
        return element;
    }

    advanceContent() {
        let nextIndex = this.currentContentIndex + 1;
        if (nextIndex >= this.contentStore.length) {
            nextIndex = 0;
        }
        dispatchCustomEvent(this.mainDisplayContainer, 'display:switch', { index: nextIndex });
    }

    retreatContent() {
        let prevIndex = this.currentContentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.contentStore.length - 1;
        }
        dispatchCustomEvent(this.mainDisplayContainer, 'display:switch', { index: prevIndex });
    }
}

(function() {
    window.initializeContentGalleries = (cssSelector, configOptions = {}) => {
        const elementsToEnhance = document.querySelectorAll(cssSelector);

        if (elementsToEnhance.length === 0) {
            return;
        }

        elementsToEnhance.forEach(element => {
            new ContentDisplayManager(element, configOptions);
        });
    };
})();