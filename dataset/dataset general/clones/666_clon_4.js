const DisplayMode = {
    FLASH_BASED: 'flash',
    HTML5_BASED: 'html5'
};

const assetPaths = {
    legacyIcon: chrome.runtime.getURL('../images/htmlify.png'),
    modernIcon: chrome.runtime.getURL('../images/htmlhov.png')
};

const mediaPlaybackController = {
    activeDisplayMode: DisplayMode.FLASH_BASED,
    cachedLegacyView: '',
    authenticationToken: null,
    uiComponents: {
        playbackSwitchButton: null,
        mediaHostElement: null,
        interactionArea: null
    }
};

const httpRequestService = {
    async performRequest(urlAddress, methodType = 'GET', requestBody = null, requestHeaders = {}) {
        const fetchOptions = { method: methodType, headers: requestHeaders };
        if (requestBody) {
            fetchOptions.body = requestBody;
        }
        const responseData = await fetch(urlAddress, fetchOptions);
        if (!responseData.ok) {
            throw new Error(`Connection error! Status: ${responseData.status}`);
        }
        return responseData.text();
    },

    async obtainAuthToken(successCallback) {
        try {
            const pageMarkup = await this.performRequest('http://www.youtube.com/html5');
            if (pageMarkup.includes("disable_html5")) {
                return; // HTML5 already enabled, no token needed for activation
            }

            const tokenMatch = pageMarkup.match(/'XSRF_TOKEN': '([^']+)'/);
            if (tokenMatch && tokenMatch[1]) {
                mediaPlaybackController.authenticationToken = tokenMatch[1];
                successCallback(mediaPlaybackController.authenticationToken);
            }
        } catch (errorDetails) {
            console.error('Error acquiring authentication token:', errorDetails);
        }
    },

    async sendActivationRequest(securityKey) {
        const payloadData = new URLSearchParams({
            enable_html5: 'true',
            session_token: securityKey
        }).toString();

        try {
            await this.performRequest('http://www.youtube.com/html5', 'POST', payloadData, {
                'Content-Type': 'application/x-www-form-urlencoded'
            });
        } catch (errorDetails) {
            console.error('Error dispatching HTML5 activation request:', errorDetails);
        }
    }
};

const uiManipulator = {
    createImageButton(elementId, initialSource, clickAction) {
        const controlButton = document.createElement('img');
        controlButton.setAttribute('class', 'yt-uix-button yt-uix-button-icon yt-uix-button-empty');
        controlButton.setAttribute('type', 'image');
        controlButton.setAttribute('id', elementId);
        controlButton.setAttribute('src', initialSource);
        controlButton.setAttribute('value', 'HTML5 me baby');
        controlButton.style.borderStyle = 'none';
        controlButton.style.paddingBottom = '5px';
        controlButton.addEventListener('click', clickAction);
        return controlButton;
    },

    configureButtonHover(targetElement, currentDisplayMode) {
        targetElement.style.content = `url(${currentDisplayMode === DisplayMode.HTML5_BASED ? assetPaths.modernIcon : assetPaths.legacyIcon})`;
        targetElement.style.borderBottomColor = '#FFF';

        if (!targetElement._hoverInteractionSetup) {
            targetElement.addEventListener('mouseenter', () => {
                const activeMode = mediaPlaybackController.activeDisplayMode;
                targetElement.style.content = `url(${activeMode === DisplayMode.HTML5_BASED ? assetPaths.legacyIcon : assetPaths.modernIcon})`;
                targetElement.style.borderBottom = '3px solid #930';
                targetElement.style.borderRadius = '0px';
            });
            targetElement.addEventListener('mouseleave', () => {
                const activeMode = mediaPlaybackController.activeDisplayMode;
                targetElement.style.content = `url(${activeMode === DisplayMode.HTML5_BASED ? assetPaths.modernIcon : assetPaths.legacyIcon})`;
                targetElement.style.borderBottomColor = '#FFF';
            });
            targetElement._hoverInteractionSetup = true;
        }
    },

    assembleMediaFrame(frameTag, frameIdentifier, mediaSourceURL) {
        const mediaFrame = document.createElement(frameTag);
        mediaFrame.setAttribute('style', 'width:100%; height:100%;');
        mediaFrame.setAttribute('src', mediaSourceURL);
        mediaFrame.setAttribute('id', frameIdentifier);
        mediaFrame.setAttribute('frameborder', '0');
        mediaFrame.setAttribute('allowfullscreen', '');
        return mediaFrame;
    }
};

const mediaProcessor = {
    retrieveMediaIdentifier() {
        const currentBrowserURL = new URL(window.location.href);
        return currentBrowserURL.searchParams.get('v');
    },

    displayModernAlert() {
        window.alert("This content is already playing in HTML5 format!");
    },

    cycleDisplayMode() {
        const hostElement = mediaPlaybackController.uiComponents.mediaHostElement;
        let nextMode;

        if (mediaPlaybackController.activeDisplayMode === DisplayMode.HTML5_BASED) {
            const modernFrame = document.getElementById('modernContentFrame');
            if (modernFrame) {
                modernFrame.remove();
            }

            if (mediaPlaybackController.cachedLegacyView) {
                hostElement.innerHTML = mediaPlaybackController.cachedLegacyView;
            }
            nextMode = DisplayMode.FLASH_BASED;
        } else {
            mediaPlaybackController.cachedLegacyView = hostElement.innerHTML;

            const legacyFrame = document.getElementById('legacyContentFrame');
            if (legacyFrame) {
                legacyFrame.remove();
            }
            const oldPlayerElement = document.getElementById('movie_player');
            if (oldPlayerElement) {
                oldPlayerElement.remove();
            }

            const videoID = this.retrieveMediaIdentifier();
            const modernSource = `http://www.youtube.com/embed/${videoID}?feature=player_detailpage&html5=1&autoplay=1&cc_load_policy=1`;
            const newPlayerFrame = uiManipulator.assembleMediaFrame('iframe', 'modernContentFrame', modernSource);

            hostElement.innerHTML = '';
            hostElement.appendChild(newPlayerFrame);
            nextMode = DisplayMode.HTML5_BASED;
        }

        mediaPlaybackController.activeDisplayMode = nextMode;
        uiManipulator.configureButtonHover(
            mediaPlaybackController.uiComponents.playbackSwitchButton,
            mediaPlaybackController.activeDisplayMode
        );
    }
};

(async () => {
    mediaPlaybackController.uiComponents.mediaHostElement = document.getElementById('player-api');
    mediaPlaybackController.uiComponents.interactionArea = document.getElementById('watch-like-dislike-buttons');

    await httpRequestService.obtainAuthToken(httpRequestService.sendActivationRequest.bind(httpRequestService));

    const currentHTML5Player = document.querySelector('.html5-video-player');
    let currentButtonIcon;
    let initialInteraction;

    if (currentHTML5Player) {
        currentButtonIcon = assetPaths.modernIcon;
        initialInteraction = mediaProcessor.displayModernAlert;
        mediaPlaybackController.activeDisplayMode = DisplayMode.HTML5_BASED;
    } else {
        currentButtonIcon = assetPaths.legacyIcon;
        initialInteraction = mediaProcessor.cycleDisplayMode;
        mediaPlaybackController.activeDisplayMode = DisplayMode.FLASH_BASED;
    }

    const switchControl = uiManipulator.createImageButton(
        'playbackSwitchControl',
        currentButtonIcon,
        initialInteraction
    );

    mediaPlaybackController.uiComponents.playbackSwitchButton = switchControl;
    mediaPlaybackController.uiComponents.interactionArea.appendChild(switchControl);

    uiManipulator.configureButtonHover(switchControl, mediaPlaybackController.activeDisplayMode);
})();