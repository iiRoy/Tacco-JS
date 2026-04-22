const globalUtilities = (function() {
    function checkBrowserPlugin(pluginKeyword) {
        if (navigator.plugins && navigator.plugins.length) {
            for (let k = 0; k < navigator.plugins.length; k++) {
                if (navigator.plugins[k].name.includes(pluginKeyword)) {
                    return true;
                }
            }
        }
        // Legacy ActiveX check for IE (highly unlikely to be relevant in modern browsers)
        if (window.ActiveXObject) {
            try {
                // Specific ActiveXObject names might be needed for full accuracy,
                // but this provides a generic attempt similar to original's intent.
                new ActiveXObject(pluginKeyword); 
                return true;
            } catch (e) {
                // Plugin not found
            }
        }
        return false;
    }

    function checkFlashPresence() {
        return checkBrowserPlugin('Flash');
    }

    function checkQuickTimePresence() {
        return checkBrowserPlugin('QuickTime');
    }

    function isMobileDeviceDetected() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|Windows Phone/i.test(navigator.userAgent);
    }

    return {
        supportsFlash: checkFlashPresence,
        supportsQuickTime: checkQuickTimePresence,
        isMobile: isMobileDeviceDetected
    };
})();

class CustomEventBroker {
    constructor() {
        this.subscriptions = {};
    }

    subscribe(topic, handler) {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = [];
        }
        this.subscriptions[topic].push(handler);
    }

    publish(topic, payload) {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].forEach(handler => handler(payload));
        }
    }
}

const createMediaDisplayModule = function(initialSettings) {
    const moduleSettings = {
        overlayOpacity: 0.85,
        backdropColor: '#000000',
        contentBackgroundColor: '#000000',
        captionLinkColour: '#999999',
        captionLinkHoverColour: '#ffffff',
        captionTextColour: '#000000',
        contentBorderPixelWidth: 5,
        baseContentWidth: 480,
        baseContentHeight: 320,
        defaultCaptionString: '',
        mediaIdentifier: 'mediaDisplayUnit' + Math.floor(Math.random() * (99999 - 10000 + 1) + 10000),
        showVideoControls: false,
        containerZIndex: 9999,
        transitionTimeMs: 300
    };

    Object.assign(moduleSettings, initialSettings);

    let currentMediaElement = null;
    let mediaSourceLocation = null;
    let currentContentDisplayWidth = moduleSettings.baseContentWidth;
    let currentContentDisplayHeight = moduleSettings.baseContentHeight;
    let currentContentType = false;
    let currentCaptionString = moduleSettings.defaultCaptionString;

    const VIEWER_STATUS = {
        UNINITIALIZED: 0,
        CLOSED: 1,
        OPEN: 2
    };
    let viewerCurrentStatus = VIEWER_STATUS.UNINITIALIZED;

    const flashEnabled = globalUtilities.supportsFlash();
    const quicktimeEnabled = globalUtilities.supportsQuickTime();
    const isMobileDeviceDetected = globalUtilities.isMobile();

    let mainContainerWrapper = null;
    let darkBackgroundOverlay = null;
    let mediaContentWrapper = null;
    let mediaDisplayArea = null;
    let mediaCaptionPanel = null;
    let mediaCaptionTextElement = null;
    let closeDisplayButton = null;

    const moduleEvents = new CustomEventBroker();

    function applyElementStyles(element, styles) {
        for (const property in styles) {
            element.style[property] = styles[property];
        }
    }

    function buildViewerElements() {
        mainContainerWrapper = document.createElement('div');
        applyElementStyles(mainContainerWrapper, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: moduleSettings.containerZIndex,
            display: 'none',
            overflow: 'auto',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0)'
        });
        document.body.appendChild(mainContainerWrapper);

        darkBackgroundOverlay = document.createElement('div');
        applyElementStyles(darkBackgroundOverlay, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: moduleSettings.backdropColor,
            opacity: 0,
            transition: `opacity ${moduleSettings.transitionTimeMs}ms ease-in-out`
        });
        mainContainerWrapper.appendChild(darkBackgroundOverlay);

        mediaContentWrapper = document.createElement('div');
        applyElementStyles(mediaContentWrapper, {
            position: 'absolute',
            backgroundColor: moduleSettings.contentBackgroundColor,
            border: `${moduleSettings.contentBorderPixelWidth}px solid ${moduleSettings.contentBackgroundColor}`,
            padding: '0',
            boxSizing: 'content-box',
            visibility: 'hidden',
            opacity: 0,
            transition: `opacity ${moduleSettings.transitionTimeMs}ms ease-in-out`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        });
        mainContainerWrapper.appendChild(mediaContentWrapper);

        mediaDisplayArea = document.createElement('div');
        applyElementStyles(mediaDisplayArea, {
            lineHeight: '0',
            position: 'relative',
            overflow: 'hidden'
        });
        mediaContentWrapper.appendChild(mediaDisplayArea);

        mediaCaptionPanel = document.createElement('div');
        applyElementStyles(mediaCaptionPanel, {
            textAlign: 'left',
            padding: '10px',
            backgroundColor: moduleSettings.contentBackgroundColor,
            color: moduleSettings.captionTextColour,
            fontSize: '12px'
        });
        mediaContentWrapper.appendChild(mediaCaptionPanel);

        mediaCaptionTextElement = document.createElement('span');
        mediaCaptionPanel.appendChild(mediaCaptionTextElement);

        closeDisplayButton = document.createElement('a');
        closeDisplayButton.href = '#';
        closeDisplayButton.textContent = 'close [esc]';
        applyElementStyles(closeDisplayButton, {
            color: moduleSettings.captionLinkColour,
            textDecoration: 'none',
            float: 'right',
            fontWeight: 'bold'
        });
        closeDisplayButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            hideMediaViewer();
        });
        mediaCaptionPanel.appendChild(closeDisplayButton);

        setupKeyboardListeners();
        viewerCurrentStatus = VIEWER_STATUS.CLOSED;
    }

    function updateCaptionDisplay() {
        mediaCaptionTextElement.innerHTML = currentCaptionString || moduleSettings.defaultCaptionString;
    }

    function setupKeyboardListeners() {
        document.addEventListener('keydown', (ev) => {
            if (viewerCurrentStatus === VIEWER_STATUS.OPEN && ev.key === 'Escape') {
                hideMediaViewer();
            }
        });
    }

    function convertMediaUrl(originalLink) {
        let convertedLink = false;
        const linkLower = originalLink.toLowerCase();

        if (linkLower.includes('youtube.com/watch?v=')) {
            convertedLink = originalLink.replace(/watch\?v=/i, 'embed/');
            const ampersandIndex = convertedLink.indexOf('&');
            if (ampersandIndex > -1) {
                convertedLink = convertedLink.substring(0, ampersandIndex);
            }
            convertedLink += '?autoplay=1&rel=0&hd=1';
        } else if (linkLower.includes('vimeo.com/')) {
            let cleanedLink = originalLink.replace('www.', '');
            convertedLink = cleanedLink.replace('vimeo.com/', 'player.vimeo.com/video/');
            convertedLink += '?title=1&byline=1&portrait=1&autoplay=1';
        } else if (linkLower.includes('vevo.com/watch')) {
            convertedLink = 'http://www.vevo.com/VideoPlayer/Embedded?videoId=';
            const lastSlashIdx = linkLower.lastIndexOf('/') + 1;
            convertedLink += linkLower.substring(lastSlashIdx, linkLower.length);
            convertedLink += '&autoplay=1&playerType=embedded&playlist=false';
        }
        return convertedLink;
    }

    function linkToMediaViewer(anchorElement) {
        if (isMobileDeviceDetected) return;

        const anchorLink = anchorElement.href;
        const anchorLinkLower = anchorLink.toLowerCase();
        const anchorTitle = anchorElement.title;
        const anchorRev = anchorElement.getAttribute('rev');

        let discoveredMediaType = false;
        let contentWidth = moduleSettings.baseContentWidth;
        let contentHeight = moduleSettings.baseContentHeight;

        if (anchorRev && anchorRev.includes('moviebox:')) {
            anchorRev.substring(9).split(',').forEach(param => {
                const parts = param.split('=');
                if (parts.length === 2) {
                    switch (parts[0].trim()) {
                        case 'width':
                            contentWidth = parseInt(parts[1].trim(), 10) || contentWidth;
                            break;
                        case 'height':
                            contentHeight = parseInt(parts[1].trim(), 10) || contentHeight;
                            break;
                    }
                }
            });
        }

        if ((anchorLinkLower.includes('.mov') || anchorLinkLower.includes('.mp4')) && quicktimeEnabled) {
            discoveredMediaType = 'qt';
            if (moduleSettings.showVideoControls) {
                contentHeight += 16;
            }
        } else if (anchorLinkLower.includes('youtube.com/watch?v=')) {
            discoveredMediaType = 'yt';
            contentHeight = Math.round(contentWidth * 0.5625) + 25;
        } else if (/\bvimeo\.com\/\d+\b/.test(anchorLinkLower)) {
            discoveredMediaType = 'vm';
        } else if (anchorLinkLower.includes('vevo.com/watch') && flashEnabled) {
            discoveredMediaType = 'vv';
        }

        if (discoveredMediaType) {
            anchorElement.addEventListener('click', (ev) => {
                ev.preventDefault();
                showMediaInViewer(discoveredMediaType, anchorTitle, anchorLink, contentWidth, contentHeight);
            });
        }
    }

    function showMediaInViewer(type, captionText, url, width, height) {
        currentContentType = type;
        currentCaptionString = captionText;
        mediaSourceLocation = url;
        currentContentDisplayWidth = width;
        currentContentDisplayHeight = height;

        if (viewerCurrentStatus === VIEWER_STATUS.UNINITIALIZED) {
            buildViewerElements();
        }
        revealMediaViewer();
    }

    function revealMediaViewer() {
        if (viewerCurrentStatus === VIEWER_STATUS.CLOSED) {
            if (window.soundSystem && typeof window.soundSystem.pauseCurrentSound === 'function') {
                window.soundSystem.pauseCurrentSound();
            }

            mainContainerWrapper.style.display = 'block';
            setTimeout(() => {
                darkBackgroundOverlay.style.opacity = moduleSettings.overlayOpacity;
                mediaContentWrapper.style.visibility = 'visible';
                mediaContentWrapper.style.opacity = 1;
                adjustContentWrapperDimensions();
            }, 10);

            insertMediaContent();
            viewerCurrentStatus = VIEWER_STATUS.OPEN;
        }
    }

    function adjustContentWrapperDimensions() {
        const totalContentWidth = currentContentDisplayWidth + (moduleSettings.contentBorderPixelWidth * 2);
        
        applyElementStyles(mediaContentWrapper, {
            width: `${currentContentDisplayWidth}px`,
            height: 'auto'
        });
        applyElementStyles(mediaDisplayArea, {
            width: `${currentContentDisplayWidth}px`,
            height: `${currentContentDisplayHeight}px`
        });
    }

    function insertMediaContent() {
        mediaDisplayArea.innerHTML = '';

        let contentHTML = '';
        if (currentContentType === 'qt') {
            contentHTML = `
                <object id="${moduleSettings.mediaIdentifier}" standby="loading quicktime..." type="video/quicktime"
                        codebase="http://www.apple.com/qtactivex/qtplugin.cab"
                        data="${mediaSourceLocation}" width="${currentContentDisplayWidth}" height="${currentContentDisplayHeight}">
                    <param name="src" value="${mediaSourceLocation}" />
                    <param name="scale" value="aspect" />
                    <param name="controller" value="${moduleSettings.showVideoControls}" />
                    <param name="cache" value="false" />
                    <param name="autoplay" value="true" />
                    <param name="bgcolor" value="${moduleSettings.contentBackgroundColor}" />
                    <param name="enablejavascript" value="true" />
                </object>`;
            mediaDisplayArea.innerHTML = contentHTML;
            currentMediaElement = document.getElementById(moduleSettings.mediaIdentifier);
            setTimeout(() => { /* Mimic original's delay for QT init */ }, 1200);
        } else if (currentContentType === 'yt' || currentContentType === 'vm') {
            const embedLink = convertMediaUrl(mediaSourceLocation);
            contentHTML = `
                <iframe src="${embedLink}" width="${currentContentDisplayWidth}" height="${currentContentDisplayHeight}"
                        frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>`;
            mediaDisplayArea.innerHTML = contentHTML;
            currentMediaElement = mediaDisplayArea.querySelector('iframe');
        } else if (currentContentType === 'vv') {
            const embedLink = convertMediaUrl(mediaSourceLocation);
            contentHTML = `
                <object id="${moduleSettings.mediaIdentifier}" standby="loading video..." type="application/x-shockwave-flash"
                        width="${currentContentDisplayWidth}" height="${currentContentDisplayHeight}" data="${embedLink}">
                    <param name="movie" value="${embedLink}" />
                    <param name="bgcolor" value="${moduleSettings.contentBackgroundColor}" />
                    <param name="allowFullScreen" value="true" />
                    <param name="wmode" value="window" />
                    <param name="allowScriptAccess" value="always" />
                </object>`;
            mediaDisplayArea.innerHTML = contentHTML;
            currentMediaElement = document.getElementById(moduleSettings.mediaIdentifier);
        }

        updateCaptionDisplay();
        moduleEvents.publish('mediaContentRendered', currentMediaElement);
    }

    function hideMediaViewer() {
        if (viewerCurrentStatus === VIEWER_STATUS.OPEN) {
            if (currentContentType === 'qt' && currentMediaElement && typeof currentMediaElement.Stop === 'function') {
                currentMediaElement.Stop();
                currentMediaElement.style.display = 'none';
            } else if (currentContentType === 'vv' && currentMediaElement) {
                if (currentMediaElement.parentNode) {
                    currentMediaElement.parentNode.removeChild(currentMediaElement);
                }
            }

            currentMediaElement = null;
            mediaDisplayArea.innerHTML = '';
            currentContentType = false;

            darkBackgroundOverlay.style.opacity = 0;
            mediaContentWrapper.style.opacity = 0;
            mediaContentWrapper.style.visibility = 'hidden';

            setTimeout(() => {
                mainContainerWrapper.style.display = 'none';
            }, moduleSettings.transitionTimeMs);

            viewerCurrentStatus = VIEWER_STATUS.CLOSED;
            moduleEvents.publish('viewerClosed');
        }
    }

    return {
        linkToMediaViewer: linkToMediaViewer,
        showMediaInViewer: showMediaInViewer,
        hideMediaViewer: hideMediaViewer,
        on: moduleEvents.subscribe.bind(moduleEvents),
        getViewerStatus: () => viewerCurrentStatus
    };
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.systemModules === 'undefined') {
        window.systemModules = {
            registry: {},
            registerModule: function(moduleInstance, name) {
                this.registry[name] = moduleInstance;
            },
            retrieveModule: function(name) {
                return this.registry[name];
            }
        };
    }

    let mediaHandlerInstance;
    if (window.systemModules) {
        mediaHandlerInstance = createMediaDisplayModule();
        window.systemModules.registerModule(mediaHandlerInstance, 'mediaViewer');
    } else {
        mediaHandlerInstance = createMediaDisplayModule();
    }

    const targetLinkSelectors = [
        'a[href$=".mov"]', 'a[href$=".mp4"]', 'a[href$=".MOV"]', 'a[href$=".MP4"]',
        'a[href^="http://www.youtube.com/watch?v"]', 'a[href^="http://youtube.com/watch?v"]',
        'a[href^="http://vimeo.com/"]', 'a[href^="http://www.vimeo.com/"]',
        'a[href^="http://www.vevo.com/watch"]'
    ];

    document.querySelectorAll(targetLinkSelectors.join(',')).forEach(element => {
        mediaHandlerInstance.linkToMediaViewer(element);
    });
});