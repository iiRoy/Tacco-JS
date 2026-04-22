const DEFERRED_MEDIA_BOX_CLASS = 'deferred-media-box';
const VIDEO_PREVIEW_IMAGE_CLASS = 'video-preview-image';
const PLAYBACK_INITIATOR_CLASS = 'playback-initiator';
const TITLE_OVERLAY_PANEL_CLASS = 'title-overlay-panel';
const VIDEO_TITLE_AREA_CLASS = 'video-title-area';
const TITLE_CONTENT_WRAPPER_CLASS = 'title-content-wrapper';
const DESCRIPTIVE_TEXT_LINK_CLASS = 'descriptive-text-link';
const PREVIEW_READY_CLASS = 'preview-ready';
const EMBED_ACTIVE_CLASS = 'embed-active';

const YOUTUBE_IMAGE_BASE = 'http://img.youtube.com/vi/';
const YOUTUBE_EMBED_BASE = '//www.youtube.com/embed/';
const YOUTUBE_GDATA_API = 'https://gdata.youtube.com/feeds/api/videos/';

const DEFAULT_PROMPT_TEXT = 'Loading media...';
const DEFAULT_ASPECT_RATIO = '16:9';

const PLAYBACK_BUTTON_GRAPHIC = `
    <svg>
        <path fill-rule="evenodd" clip-rule="evenodd" fill="#1F1F1F" class="ytp-large-play-button-svg" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>
        <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>
    </svg>
`;

const RESOLUTION_MAP = new Map([
    [640, 'maxresdefault.jpg'],
    [480, 'sddefault.jpg'],
    [320, 'hqdefault.jpg'],
    [120, 'mqdefault.jpg'],
    [0, 'default.jpg']
]);

function fetchThumbnailKey(currentVisualWidth) {
    if (currentVisualWidth === 0) {
        return 'hqdefault.jpg';
    }
    const thresholds = Array.from(RESOLUTION_MAP.keys()).sort((a, b) => b - a);
    for (const threshold of thresholds) {
        if (currentVisualWidth > threshold) {
            return RESOLUTION_MAP.get(threshold);
        }
    }
    return RESOLUTION_MAP.get(0);
}

class MediaEmbedHandler {
    constructor(hostNode, configuration = {}) {
        this.hostNode = hostNode;
        this.config = {
            initialPrompt: DEFAULT_PROMPT_TEXT,
            fallbackAspect: DEFAULT_ASPECT_RATIO,
            onReadyAction: null,
            wrapperStyleClass: DEFERRED_MEDIA_BOX_CLASS,
            ...configuration
        };

        this.mediaIdentifier = this.hostNode.dataset.youtubeId;
        this.extraParams = this.hostNode.dataset.parameters || '';
        this.proportionality = (this.hostNode.dataset.ratio || this.config.fallbackAspect).split(":");
        this.initialWidth = parseFloat(this.hostNode.dataset.width);
        this.initialHeight = parseFloat(this.hostNode.dataset.height);
        this.placeholderText = this.hostNode.textContent.trim() || this.config.initialPrompt;

        this.hostNode.classList.add(this.config.wrapperStyleClass);
        this.previewElement = null;
    }

    async initiateDisplay() {
        if (!this.mediaIdentifier) {
            console.warn('No YouTube ID found for element:', this.hostNode);
            return;
        }

        const calculatedDimensions = this.deriveDimensions();
        if (calculatedDimensions.effectiveWidthCss) {
            this.hostNode.style.width = calculatedDimensions.effectiveWidthCss;
        }
        this.hostNode.style.paddingBottom = calculatedDimensions.bottomSpacingCss;

        this.renderInitialContent(calculatedDimensions.effectiveWidth);

        await this.obtainVideoTitle();
    }

    deriveDimensions() {
        let currentVisualWidth;
        let bottomSpacing;
        const ratioNumerator = parseFloat(this.proportionality[0]);
        const ratioDenominator = parseFloat(this.proportionality[1]);

        if (!isNaN(this.initialWidth) && !isNaN(this.initialHeight)) {
            currentVisualWidth = this.initialWidth;
            bottomSpacing = this.initialHeight + 'px';
        } else if (!isNaN(this.initialWidth)) {
            currentVisualWidth = this.initialWidth;
            bottomSpacing = (currentVisualWidth * ratioDenominator / ratioNumerator) + 'px';
        } else {
            currentVisualWidth = this.hostNode.clientWidth;
            if (currentVisualWidth === 0 && this.hostNode.parentElement) {
                currentVisualWidth = this.hostNode.parentElement.clientWidth;
            }
            bottomSpacing = (ratioDenominator / ratioNumerator * 100) + '%';
        }
        
        return {
            effectiveWidth: currentVisualWidth,
            effectiveWidthCss: currentVisualWidth > 0 ? currentVisualWidth + 'px' : '',
            bottomSpacingCss: bottomSpacing
        };
    }

    renderInitialContent(currentVisualWidth) {
        const videoImageKey = fetchThumbnailKey(currentVisualWidth);
        const playButtonScale = currentVisualWidth <= 640 ? ' style="transform: scale(0.563888888888889);"' : '';

        const initialMarkup = `
            <div class="${VIDEO_PREVIEW_IMAGE_CLASS}">
                <div class="${PLAYBACK_INITIATOR_CLASS}"${playButtonScale}>
                    ${PLAYBACK_BUTTON_GRAPHIC}
                </div>
            </div>
            <div class="${TITLE_OVERLAY_PANEL_CLASS}">
                <div class="${VIDEO_TITLE_AREA_CLASS}">
                    <div class="${TITLE_CONTENT_WRAPPER_CLASS}">
                        <a id="media-title-${this.mediaIdentifier}" class="${DESCRIPTIVE_TEXT_LINK_CLASS}" target="_blank" tabindex="3100" href="https://www.youtube.com/watch?v=${this.mediaIdentifier}">
                            ${this.placeholderText}
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.hostNode.innerHTML = initialMarkup;

        this.previewElement = this.hostNode.querySelector(`.${VIDEO_PREVIEW_IMAGE_CLASS}`);
        if (this.previewElement) {
            this.previewElement.style.backgroundImage = `url(${YOUTUBE_IMAGE_BASE}${this.mediaIdentifier}/${videoImageKey})`;
            this.previewElement.classList.add(PREVIEW_READY_CLASS);
            this.previewElement.addEventListener('click', this.activateVideoEmbed.bind(this));
        }
    }

    activateVideoEmbed(event) {
        event.preventDefault();
        if (!this.hostNode.classList.contains(EMBED_ACTIVE_CLASS) && this.previewElement.classList.contains(PREVIEW_READY_CLASS)) {
            const embedSrc = `${YOUTUBE_EMBED_BASE}${this.mediaIdentifier}?autoplay=1&${this.extraParams}`;
            this.hostNode.innerHTML = `<iframe src="${embedSrc}" frameborder="0" allowfullscreen></iframe>`;
            this.hostNode.classList.add(EMBED_ACTIVE_CLASS);
        }
    }

    async obtainVideoTitle() {
        try {
            const response = await fetch(`${YOUTUBE_GDATA_API}${this.mediaIdentifier}?v=2&alt=json`);
            const data = await response.json();
            const titleLink = this.hostNode.querySelector(`#media-title-${this.mediaIdentifier}`);
            if (titleLink && data && data.entry && data.entry.title && data.entry.title.$t) {
                titleLink.textContent = data.entry.title.$t;
            }
        } catch (error) {
            // Original code does not handle or log fetch errors, so we match that behavior.
        }
    }
}

function deferVideoLoad(selector, customConfig) {
    document.querySelectorAll(selector).forEach(element => {
        new MediaEmbedHandler(element, customConfig).initiateDisplay();
    });
}

window.deferVideoLoad = deferVideoLoad;