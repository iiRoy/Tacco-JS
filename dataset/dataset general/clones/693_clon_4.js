const obtainMessage = (key) => chrome.i18n.getMessage(key);
const generateElement = (tag, attributes = {}, children = []) => {
    const elem = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            elem.classList.add(...value.split(' '));
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => elem.dataset[dataKey] = dataValue);
        } else if (key === 'eventListeners') {
            Object.entries(value).forEach(([eventType, handler]) => elem.addEventListener(eventType, handler));
        } else {
            elem[key] = value;
        }
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            elem.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            elem.appendChild(child);
        }
    });
    return elem;
};
const globalStore = {
    isAjaxNavigation: false,
    featherModeActive: false,
    domChangeMonitor: null,
    initialPlayerRef: null,
    playerHostElement: null,
    contentSection: null,
    mediaPlaybackTime: 0,
    mediaPlaybackSpeed: 1,
    retryOnMediaError: false
};
const textResources = {
    toggleOff: obtainMessage("toggle_unchecked"),
    toggleOn: obtainMessage("toggle_checked"),
    toggleBlocked: obtainMessage("toggle_disabled"),
    srcLabel: obtainMessage("source"),
    refreshLabel: obtainMessage("reload"),
    downloadLabel: obtainMessage("download"),
    speedOff: obtainMessage("speed_unchecked"),
    speedOn: obtainMessage("speed_checked"),
    rateLabel: obtainMessage("rate"),
    sizeOff: obtainMessage("size_unchecked"),
    sizeOn: obtainMessage("size_checked")
};
class CustomMediaStation {
    constructor(configManager) {
        this.configMgr = configManager;
        this.displayHost = generateElement("div", {
            id: "enhancement-media-host",
            className: "player-height player-width off-screen-target watch-content player-api"
        });
        this.videoElement = generateElement("video", {
            id: "enhanced-video-playback",
            autoplay: true,
            controls: true,
            preload: "auto",
            eventListeners: {
                click: this.handleSingleClick.bind(this),
                dblclick: this.handleDoubleClick.bind(this),
                loadedmetadata: this.handleMetaLoad.bind(this),
                play: this.handleMediaPlay.bind(this),
                pause: this.handleMediaPause.bind(this),
                timeupdate: this.handleTimeUpdate.bind(this),
                seeked: this.handleSeekComplete.bind(this),
                stalled: this.handleMediaStall.bind(this),
                ended: this.handleMediaEnd.bind(this),
                error: this.handleMediaError.bind(this),
                volumechange: this.handleVolumeChange.bind(this)
            }
        });
        this.displayHost.appendChild(this.videoElement);
    }
    get element() { return this.displayHost; }
    get media() { return this.videoElement; }
    isInteractionArea(eventTarget, verticalOffset) {
        return (parseInt(window.getComputedStyle(eventTarget).getPropertyValue("height"), 10) - 40) > verticalOffset;
    }
    handleSingleClick(event) {
        if (this.isInteractionArea(this.media, event.offsetY)) {
            this.media.paused || this.media.ended ? this.media.play() : this.media.pause();
        }
    }
    handleDoubleClick(event) {
        if (this.isInteractionArea(this.media, event.offsetY)) {
            const requestFullscreen = this.media.requestFullscreen || this.media.webkitRequestFullscreen;
            requestFullscreen && requestFullscreen.call(this.media);
        }
    }
    handleMetaLoad() {
        let savedTime = parseInt(globalStore.mediaPlaybackTime, 10);
        if (!isNaN(savedTime) && savedTime > 0) {
            this.media.currentTime = savedTime;
        } else {
            const url = new URL(location.href);
            let timeParam = url.hash.match(/[#&]t=(\d+)(?:s|&|$)/) || url.search.match(/[?&]t=(\d+)(?:s|&|$)/);
            let minuteParam = url.hash.match(/[#&]t=(\d+)m/) || url.search.match(/[?&]t=(\d+)m/);
            let initialSeconds = timeParam ? parseInt(timeParam[1], 10) : 0;
            let initialMinutes = minuteParam ? parseInt(minuteParam[1], 10) : 0;
            this.media.currentTime = (initialMinutes * 60) + initialSeconds;
        }
    }
    updateTitleIcon(showPlayIcon) {
        const currentTitle = document.title.replace(/^\u25B6\s/, "");
        document.title = showPlayIcon ? "\u25B6 " + currentTitle : currentTitle;
    }
    markAsViewed() {
        try {
            const videoIdentifier = new URL(location.href).searchParams.get('v');
            if (videoIdentifier) {
                const viewerRequest = new XMLHttpRequest();
                viewerRequest.open("GET", `https://www.youtube.com/user_watch?video_id=${videoIdentifier}`);
                viewerRequest.send(null);
            }
        } catch (error) {}
    }
    handleMediaPlay() {
        if (document.body.contains(this.media)) {
            this.media.playbackRate = parseFloat(globalStore.mediaPlaybackSpeed) || 1;
            this.updateTitleIcon(true);
            this.markAsViewed();
        } else {
            this.media.pause();
        }
    }
    handleMediaPause() {
        if (document.body.contains(this.media)) {
            this.updateTitleIcon(false);
        }
    }
    handleTimeUpdate() {
        const currentProgress = parseInt(this.media.currentTime, 10);
        if (currentProgress > 0 && currentProgress % 5 === 0) {
            globalStore.mediaPlaybackTime = currentProgress;
        }
    }
    handleSeekComplete() {
        const adjustedTime = Math.max(parseInt(this.media.currentTime, 10) - 5, 0);
        globalStore.mediaPlaybackTime = adjustedTime;
    }
    handleMediaStall() {
        if (document.body.contains(this.media) && (!this.media.paused || !this.media.ended)) {
            this.media.load();
        }
    }
    handleMediaEnd() {
        this.updateTitleIcon(false);
        const nextInPlaylist = document.querySelector(".playlist-behavior-controls .next-playlist-list-item");
        const autoPlayToggle = document.querySelector(".playlist-nav-controls .toggle-autoplay");
        if (nextInPlaylist && nextInPlaylist.href && autoPlayToggle && autoPlayToggle.classList.contains("yt-uix-button-toggled")) {
            window.location.href = nextInPlaylist.href;
        }
    }
    handleMediaError(event) {
        if (globalStore.retryOnMediaError) {
            if (event.target.error.code === event.target.error.MEDIA_ERR_NETWORK) {
                this.media.load();
            }
        }
    }
    handleVolumeChange() {
        this.configMgr.saveSetting("mutedState", this.media.muted);
        this.configMgr.saveSetting("volumeLevel", this.media.volume);
    }
    setupKeyboardControls(event) {
        if (event.shiftKey && event.keyCode === 32) {
            this.media.paused || this.media.ended ? this.media.play() : this.media.pause();
        }
    }
    setupVisibilityControls() {
        const hiddenProp = (document.hidden === undefined) ? "webkitHidden" : "hidden";
        if (!document[hiddenProp] && document.body.contains(this.media) && this.media.autoplay && this.media.currentTime === 0) {
            this.media.play();
        }
    }
    preventPlayIfHidden(event) {
        const hiddenProp = (document.hidden === undefined) ? "webkitHidden" : "hidden";
        if (document[hiddenProp] && this.media.currentTime === 0) {
            this.media.pause();
            event.stopPropagation();
        }
    }
}
class InteractionHub {
    constructor(mediaComponent, configManager, orchestratorCallbacks) {
        this.mediaComp = mediaComponent;
        this.configMgr = configManager;
        this.orchestrator = orchestratorCallbacks;
        this.panelContainer = generateElement("div", { id: "enhancement-toolbar" });
        this.actionWrapper = generateElement("div", { id: "enhancement-actions" });
        this.playerSwapToggle = generateElement("input", {
            id: "enhancement-toggle",
            type: "checkbox",
            title: textResources.toggleOff,
            className: "enhancement-btn yt-uix-tooltip",
            dataset: { tooltipText: textResources.toggleOff },
            eventListeners: { change: this.handleToggleSwitch.bind(this) }
        });
        this.playerSwapLabel = generateElement("label", {
            htmlFor: "enhancement-toggle",
            textContent: textResources.toggleOff
        });
        this.mediaSourceSelector = generateElement("select", {
            id: "enhancement-source",
            title: textResources.srcLabel,
            className: "yt-uix-tooltip",
            dataset: { tooltipText: textResources.srcLabel },
            eventListeners: { change: this.handleSourceChange.bind(this) }
        });
        this.contentRefreshButton = generateElement("button", {
            id: "enhancement-reload",
            title: textResources.refreshLabel,
            className: "enhancement-btn yt-uix-tooltip",
            dataset: { tooltipText: textResources.refreshLabel },
            textContent: textResources.refreshLabel,
            eventListeners: { click: this.handleRefreshClick.bind(this) }
        });
        this.mediaDownloadLink = generateElement("a", {
            id: "enhancement-download",
            title: textResources.downloadLabel,
            className: "enhancement-btn yt-uix-tooltip",
            dataset: { tooltipText: textResources.downloadLabel },
            textContent: textResources.downloadLabel,
            eventListeners: { click: this.handleDownloadAction.bind(this) }
        });
        this.speedControlActivator = generateElement("input", {
            id: "enhancement-speed",
            type: "checkbox",
            title: textResources.speedOff,
            className: "enhancement-btn yt-uix-tooltip",
            dataset: { tooltipText: textResources.speedOff },
            eventListeners: { change: this.handleSpeedActivation.bind(this) }
        });
        this.speedControlLabel = generateElement("label", {
            htmlFor: "enhancement-speed",
            textContent: textResources.speedOff
        });
        this.playbackRateChooser = generateElement("select", {
            id: "enhancement-rate",
            title: textResources.rateLabel,
            className: "yt-uix-tooltip",
            dataset: { tooltipText: textResources.rateLabel },
            eventListeners: { change: this.handleRateChange.bind(this) }
        });
        ["0.25", "0.5", "1", "1.5", "2", "3"].forEach(rate => {
            const option = generateElement("option", { value: rate, textContent: `x${rate}` });
            if (rate === "1") option.selected = true;
            this.playbackRateChooser.appendChild(option);
        });
        this.displaySizeAdjuster = generateElement("input", {
            id: "enhancement-size",
            type: "checkbox",
            title: textResources.sizeOff,
            className: "enhancement-btn yt-uix-tooltip",
            dataset: { tooltipText: textResources.sizeOff },
            eventListeners: { change: this.handleSizeAdjustment.bind(this) }
        });
        this.displaySizeLabel = generateElement("label", {
            htmlFor: "enhancement-size",
            textContent: textResources.sizeOff
        });
        this.actionWrapper.append(
            this.playerSwapToggle, this.playerSwapLabel, this.mediaSourceSelector,
            this.contentRefreshButton, this.mediaDownloadLink,
            this.speedControlActivator, this.speedControlLabel, this.playbackRateChooser,
            this.displaySizeAdjuster, this.displaySizeLabel
        );
        this.panelContainer.appendChild(this.actionWrapper);
    }
    get element() { return this.panelContainer; }
    updateToggleState(isEnabled, isChecked) {
        this.playerSwapToggle.disabled = !isEnabled;
        this.playerSwapToggle.checked = isChecked;
        const text = !isEnabled ? textResources.toggleBlocked : (isChecked ? textResources.toggleOn : textResources.toggleOff);
        this.playerSwapToggle.title = text;
        this.playerSwapToggle.dataset.tooltipText = text;
        this.playerSwapLabel.textContent = text;
    }
    updateSpeedState(isChecked, currentRate) {
        this.speedControlActivator.checked = isChecked;
        const text = isChecked ? textResources.speedOn : textResources.speedOff;
        this.speedControlActivator.title = text;
        this.speedControlActivator.dataset.tooltipText = text;
        this.speedControlLabel.textContent = text;
        globalStore.mediaPlaybackSpeed = isChecked ? (parseFloat(currentRate) || 1) : 1;
        this.mediaComp.media.playbackRate = globalStore.mediaPlaybackSpeed;
    }
    updateSizeState(isChecked) {
        this.displaySizeAdjuster.checked = isChecked;
        const text = isChecked ? textResources.sizeOn : textResources.sizeOff;
        this.displaySizeAdjuster.title = text;
        this.displaySizeAdjuster.dataset.tooltipText = text;
        this.displaySizeLabel.textContent = text;
    }
    populateSourceOptions(streamData) {
        this.mediaSourceSelector.options.length = 0;
        Object.keys(streamData).forEach(key => {
            const stream = streamData[key];
            const option = generateElement("option", {
                value: stream.url,
                textContent: stream.label,
                dataset: { itag: stream.itag }
            });
            this.mediaSourceSelector.appendChild(option);
        });
    }
    handleToggleSwitch() {
        if (this.playerSwapToggle.disabled) {
            this.updateToggleState(false, this.playerSwapToggle.checked);
            return;
        }
        const activate = !document.body.contains(this.mediaComp.media);
        this.orchestrator.swapPlayers(activate);
        this.updateToggleState(true, activate);
    }
    handleSourceChange() {
        this.mediaComp.media.src = this.mediaSourceSelector.value;
    }
    handleRefreshClick() {
        if (this.mediaComp.media.ended) {
            this.mediaComp.media.currentTime = 0;
            this.mediaComp.media.play();
        } else {
            this.mediaComp.media.load();
        }
    }
    handleDownloadAction() {
        const selectedOption = this.mediaSourceSelector.options[this.mediaSourceSelector.selectedIndex];
        let fileExtension = "";
        const videoTitle = document.title.replace(/^\u25B6\s/, "").replace(/^YouTube\s-\s/, "");
        const itag = selectedOption ? selectedOption.dataset.itag : null;
        if (itag) {
            switch (itag) {
                case "18": case "22": case "37": case "38": case "135": case "137": case "138": case "264":
                    fileExtension = ".mp4"; break;
                case "43": case "44": case "45": case "46":
                    fileExtension = ".webm"; break;
                case "139": case "140": case "141":
                    fileExtension = ".m4a"; break;
            }
        }
        this.mediaDownloadLink.download = (videoTitle || "YouTube video") + fileExtension;
        this.mediaDownloadLink.href = this.mediaComp.media.src;
    }
    handleSpeedActivation() {
        this.updateSpeedState(this.speedControlActivator.checked, this.playbackRateChooser.value);
    }
    handleRateChange() {
        globalStore.mediaPlaybackSpeed = parseFloat(this.playbackRateChooser.value) || 1;
        this.mediaComp.media.playbackRate = globalStore.mediaPlaybackSpeed;
    }
    handleSizeAdjustment() {
        const enlarge = this.displaySizeAdjuster.checked;
        this.orchestrator.adjustPlayerDisplaySize(enlarge);
        this.updateSizeState(enlarge);
    }
}
class ConfigurationStore {
    constructor() {
        this.defaults = {
            mutedState: false,
            volumeLevel: 1,
            enlargedMode: false,
            visibilityOption: true,
            keyboardOption: true,
            audioOption: true,
            playerActiveOnLoad: false
        };
    }
    getSettings() {
        return new Promise(resolve => {
            chrome.storage.local.get(this.defaults, resolve);
        });
    }
    saveSetting(key, value) {
        chrome.storage.local.set({ [key]: value });
    }
}
class ContentPatcher {
    constructor(mediaComponent, interactionPanel, configManager) {
        this.mediaComp = mediaComponent;
        this.interactionPanel = interactionPanel;
        this.configMgr = configManager;
    }
    async locateAndInject(streamMap) {
        globalStore.initialPlayerRef = document.getElementById("movie_player").parentNode;
        globalStore.playerHostElement = globalStore.initialPlayerRef.parentNode;
        globalStore.contentSection = globalStore.playerHostElement.parentNode;
        if (!globalStore.contentSection) {
            throw new Error("Cannot locate main content area for YouTube player.");
        }
        let toolbarInsertionPoint = document.getElementById("watch7-content");
        if (toolbarInsertionPoint) {
            toolbarInsertionPoint.insertBefore(this.interactionPanel.element, toolbarInsertionPoint.firstElementChild);
            globalStore.featherModeActive = false;
            document.body.classList.remove("crxhtml5-feather", "crxhtml5-feather-wide");
        } else {
            toolbarInsertionPoint = document.getElementById("lc");
            if (toolbarInsertionPoint) {
                toolbarInsertionPoint.insertBefore(this.interactionPanel.element, document.getElementById("vc"));
                globalStore.featherModeActive = true;
                document.body.classList.add("crxhtml5-feather");
            } else {
                throw new Error("Failed to find a suitable location for toolbar insertion.");
            }
        }
        this.interactionPanel.populateSourceOptions(streamMap);
        if (this.interactionPanel.mediaSourceSelector.options.length > 0) {
            this.mediaComp.media.src = this.interactionPanel.mediaSourceSelector.options[0].value;
        }
        const settings = await this.configMgr.getSettings();
        if (settings.playerActiveOnLoad) {
            this.injectCustomPlayer();
            document.body.classList.add("crxhtml5");
        }
    }
    injectCustomPlayer() {
        if (globalStore.playerHostElement && globalStore.initialPlayerRef) {
            globalStore.playerHostElement.replaceChild(this.mediaComp.element, globalStore.initialPlayerRef);
        }
    }
    restoreOriginalPlayer() {
        if (globalStore.playerHostElement && globalStore.initialPlayerRef) {
            globalStore.playerHostElement.replaceChild(globalStore.initialPlayerRef, this.mediaComp.element);
        }
    }
    togglePlayerSize(enlarge) {
        const watchContainer = document.getElementById("watch7-container");
        if (globalStore.featherModeActive) {
            document.body.classList.toggle("crxhtml5-feather-wide", enlarge);
        } else if (globalStore.contentSection && watchContainer) {
            if (enlarge) {
                globalStore.contentSection.classList.remove("watch-small");
                globalStore.contentSection.classList.add("watch-medium", "watch-playlist-collapsed");
                watchContainer.classList.add("watch-wide");
            } else {
                watchContainer.classList.remove("watch-wide");
                globalStore.contentSection.classList.remove("watch-medium", "watch-large", "watch-playlist-collapsed");
                globalStore.contentSection.classList.add("watch-small");
            }
        }
    }
}
class EnhancementOrchestrator {
    constructor() {
        this.configMgr = new ConfigurationStore();
        this.mediaStation = new CustomMediaStation(this.configMgr);
        this.interactionHub = new InteractionHub(this.mediaStation, this.configMgr, {
            swapPlayers: this.swapPlayers.bind(this),
            adjustPlayerDisplaySize: this.adjustPlayerDisplaySize.bind(this)
        });
        this.contentPatcher = new ContentPatcher(this.mediaStation, this.interactionHub, this.configMgr);
        this.initApplication();
    }
    async initApplication() {
        globalStore.mediaPlaybackTime = 0;
        globalStore.mediaPlaybackSpeed = 1;
        const settings = await this.configMgr.getSettings();
        this.mediaStation.media.volume = settings.volumeLevel;
        this.mediaStation.media.muted = settings.mutedState;
        const visibilityEvent = (document.hidden === undefined) ? "visibilitychange" : "webkitvisibilitychange";
        if (settings.visibilityOption) {
            document.addEventListener(visibilityEvent, this.mediaStation.setupVisibilityControls.bind(this.mediaStation));
            this.mediaStation.media.addEventListener("play", this.mediaStation.preventPlayIfHidden.bind(this.mediaStation));
        }
        if (settings.keyboardOption) {
            document.addEventListener("keydown", this.mediaStation.setupKeyboardControls.bind(this.mediaStation));
        }
    }
    swapPlayers(activateCustom) {
        if (activateCustom) {
            this.contentPatcher.injectCustomPlayer();
            document.body.classList.add("crxhtml5");
            this.configMgr.saveSetting("playerActiveOnLoad", true);
            if (this.mediaStation.media.autoplay) {
                this.mediaStation.media.play();
            }
        } else {
            if (globalStore.isAjaxNavigation) {
                location.reload(true);
            }
            this.contentPatcher.restoreOriginalPlayer();
            document.body.classList.remove("crxhtml5");
            this.configMgr.saveSetting("playerActiveOnLoad", false);
            this.mediaStation.updateTitleIcon(false);
        }
    }
    adjustPlayerDisplaySize(enlarge) {
        this.contentPatcher.togglePlayerSize(enlarge);
        this.configMgr.saveSetting("enlargedMode", enlarge);
    }
    async startEnhancement(streamMap) {
        await this.contentPatcher.locateAndInject(streamMap);
        const settings = await this.configMgr.getSettings();
        this.interactionHub.updateToggleState(true, settings.playerActiveOnLoad);
        this.interactionHub.updateSpeedState(false, 1);
        this.interactionHub.playbackRateChooser.value = globalStore.mediaPlaybackSpeed;
        this.interactionHub.updateSizeState(settings.enlargedMode);
    }
    setupNavigationMonitor() {
        globalStore.domChangeMonitor = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const playerContainer = document.getElementById("movie_player");
                    if (playerContainer && !document.getElementById("enhancement-media-host")) {
                        globalStore.isAjaxNavigation = true;
                        location.reload(true);
                        return;
                    }
                }
            }
        });
        globalStore.domChangeMonitor.observe(document.body, { childList: true, subtree: true });
    }
}
const appInstance = new EnhancementOrchestrator();
appInstance.setupNavigationMonitor();