var PageNavAssist = {
    attachEvtHandler: function(elem, evtType, callback, useCaptureFlag) {
        useCaptureFlag = useCaptureFlag === true;
        if (elem.addEventListener) {
            elem.addEventListener(evtType, callback, useCaptureFlag);
            return true;
        } else if (elem.attachEvent) {
            return elem.attachEvent('on' + evtType, callback);
        } else {
            elem['on' + evtType] = callback;
            return true;
        }
    }
};

var NavTracker_multi_player = false; 

class NavTrackerService {
    constructor() {
        this.clientAgent = this.identifyClientAgent();
        this.initialAppFragment = '';
        this.currentDocumentHref = document.location.href;
        this.startDocumentHref = document.location.href;
        this.startDocumentHash = document.location.hash;
        this.historyFrameBaseSrc = '';
        this.lastHistoryLength = -1;
        this.fragmentHistory = [];
        this.pastNavigationStates = [];
        this.futureNavigationStates = [];
        this.activeObjectId = null;

        if (this.clientAgent.isExplorer && this.clientAgent.version === 7) {
            window["_explorer_first_load_flag"] = false;
        }

        this.initialAppState = this.createNavigationState(this.startDocumentHref, this.startDocumentHref + '#' + this.startDocumentHash, this.startDocumentHash);

        this.configureNavigationComponents();
        this.startUrlMonitoring();
    }

    identifyClientAgent() {
        const userAgentString = navigator.userAgent.toLowerCase();
        let agentProperties = {
            isExplorer: false,
            isFirefox: false,
            isSafari: false,
            isOpera: false,
            version: -1
        };

        const agentChecks = [
            { keyword: "opera", flag: "isOpera" },
            { keyword: "msie", flag: "isExplorer", versionExtract: (str, idx) => parseFloat(str.substring(idx + 4)) },
            { keyword: "safari", flag: "isSafari", versionExtract: (str, idx) => parseFloat(str.substring(idx + 7)) },
            { keyword: "gecko", flag: "isFirefox" }
        ];

        for (const check of agentChecks) {
            const index = userAgentString.indexOf(check.keyword);
            if (index !== -1) {
                agentProperties[check.flag] = true;
                if (check.versionExtract) {
                    agentProperties.version = check.versionExtract(userAgentString, index);
                }
                if (check.keyword === "opera" || check.keyword === "msie" || check.keyword === "safari") {
                    break;
                }
            }
        }
        return agentProperties;
    }

    retrieveHistoryFrame() {
        return document.getElementById('explorer_history_frame');
    }

    retrieveAnchorDiv() {
        return document.getElementById('firefox_anchor_container');
    }

    retrieveFormDiv() {
        return document.getElementById('safari_form_wrapper');
    }

    retrieveRememberField() {
        return document.getElementById("safari_remember_input");
    }

    getFlashPlayer(identity) {
        let candidateElements = [];
        if (identity && document.getElementById(identity)) {
            candidateElements.push(document.getElementById(identity));
        } else {
            candidateElements.push(...document.getElementsByTagName("object"));
            candidateElements.push(...document.getElementsByTagName("embed"));
        }

        for (const element of candidateElements) {
            if (typeof element.browserURLChange !== "undefined") {
                return element;
            }
            if (element.getElementsByTagName) {
                const nestedObjects = element.getElementsByTagName("object");
                const nestedEmbeds = element.getElementsByTagName("embed");
                for (const nestedElem of nestedObjects) {
                    if (typeof nestedElem.browserURLChange !== "undefined") return nestedElem;
                }
                for (const nestedElem of nestedEmbeds) {
                    if (typeof nestedElem.browserURLChange !== "undefined") return nestedElem;
                }
            }
        }
        return undefined;
    }

    getAllFlashPlayers() {
        const foundInstances = [];
        const allMediaElements = [...document.getElementsByTagName('object'), ...document.getElementsByTagName('embed')];

        for (const element of allMediaElements) {
            if (typeof element.browserURLChange !== "undefined") {
                foundInstances.push(element);
            }
        }
        return foundInstances;
    }

    getIframeHashValue() {
        const frameDocument = this.retrieveHistoryFrame().contentWindow.document;
        let hashValue = String(frameDocument.location.search);
        if (hashValue.length > 0 && hashValue.charAt(0) === "?") {
            hashValue = hashValue.substring(1);
        }
        return hashValue;
    }

    getCurrentDocumentFragment() {
        const hashPosition = document.location.href.indexOf('#');
        return (hashPosition >= 0) ? document.location.href.substring(hashPosition + 1) : '';
    }

    setDocumentFragment(fragmentString) {
        document.location.hash = (fragmentString === '') ? '#' : fragmentString;
    }

    createNavigationState(baseLink, fullLink, appLink) {
        return { 'basePath': baseLink, 'fullPath': fullLink, 'appPath': appLink, 'pageTitle': null };
    }

    addNavigationEntry(baseLink, fullLink, appLink) {
        this.futureNavigationStates = [];

        if (this.clientAgent.isExplorer) {
            if (appLink === this.initialAppFragment && document.location.href === this.startDocumentHref && window['_explorer_first_load_flag']) {
                this.currentDocumentHref = this.startDocumentHref;
                return;
            }
            if ((!appLink || appLink === this.initialAppFragment) && window['_explorer_first_load_flag']) {
                fullLink = baseLink + '#' + this.initialAppFragment;
                appLink = this.initialAppFragment;
            } else {
                this.retrieveHistoryFrame().src = this.historyFrameBaseSrc + appLink;
            }
            this.setDocumentFragment(appLink);
        } else {
            if (this.pastNavigationStates.length === 0 && this.initialAppState.appPath === appLink) {
                this.initialAppState = this.createNavigationState(baseLink, fullLink, appLink);
            } else if (this.pastNavigationStates.length > 0 && this.pastNavigationStates[this.pastNavigationStates.length - 1].appPath === appLink) {
                this.pastNavigationStates[this.pastNavigationStates.length - 1] = this.createNavigationState(baseLink, fullLink, appLink);
            }

            if (this.clientAgent.isSafari) {
                if (this.clientAgent.version <= 419.3) {
                    let currentPageFile = window.location.pathname.toString();
                    currentPageFile = currentPageFile.substring(currentPageFile.lastIndexOf("/") + 1);
                    const dynamicFormHtml = `<form name="nav_form" action="${currentPageFile}#${appLink}" method="GET"></form>`;
                    this.retrieveFormDiv().innerHTML = dynamicFormHtml;
                    const queryParameters = window.location.search.substring(1).split("&");
                    for (const paramPair of queryParameters) {
                        const [paramKey, paramValue] = paramPair.split("=");
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.name = paramKey;
                        hiddenInput.value = paramValue;
                        document.forms.nav_form.appendChild(hiddenInput);
                    }
                    document.forms.nav_form.submit();
                } else {
                    top.location.hash = appLink;
                }
                this.fragmentHistory[history.length] = appLink;
                this.saveNavigationStates();
            } else {
                this.addNavigationAnchor(appLink);
                this.setDocumentFragment(appLink);
            }
        }
        this.pastNavigationStates.push(this.createNavigationState(baseLink, fullLink, appLink));
    }

    saveNavigationStates() {
        if (this.clientAgent.isSafari) {
            this.retrieveRememberField().value = this.fragmentHistory.join(",");
        }
    }

    handleBackwardMovement() {
        const currentEntry = this.pastNavigationStates.pop();
        if (!currentEntry) { return; }
        this.futureNavigationStates.push(currentEntry);
    }

    handleForwardMovement() {
        const nextEntry = this.futureNavigationStates.pop();
        if (!nextEntry) { return; }
        this.pastNavigationStates.push(nextEntry);
    }

    handleDirectUrlChange() {
        this.futureNavigationStates = [];
    }

    monitorUrlChanges() {
        const currentFragment = this.getCurrentDocumentFragment();
        const currentUrl = document.location.href;

        if (this.clientAgent.isExplorer) {
            if (this.currentDocumentHref !== currentUrl && this.currentDocumentHref + '#' !== currentUrl) {
                if (this.clientAgent.version < 7) {
                    this.currentDocumentHref = currentUrl;
                    document.location.reload();
                } else {
                    if (currentFragment !== this.getIframeHashValue()) {
                        this.retrieveHistoryFrame().src = this.historyFrameBaseSrc + currentFragment;
                    }
                }
            }
        }

        if (this.clientAgent.isSafari) {
            if (this.lastHistoryLength >= 0 && history.length !== this.lastHistoryLength) {
                this.lastHistoryLength = history.length;
                let appFragment = this.fragmentHistory[this.lastHistoryLength];
                this.notifyPlayerOfUrlChange(appFragment);
                this.saveNavigationStates();
            }
        }

        if (this.clientAgent.isFirefox) {
            if (this.currentDocumentHref !== currentUrl) {
                const pastStatesCount = this.pastNavigationStates.length;
                let navigationActions = {
                    movedBack: false,
                    movedForward: false,
                    arbitraryChange: false
                };

                if ((window.location.hash === this.startDocumentHash || currentUrl === this.startDocumentHref) && (pastStatesCount === 1)) {
                    navigationActions.movedBack = true;
                    this.handleBackwardMovement();
                }

                if (this.futureNavigationStates.length > 0) {
                    if (this.futureNavigationStates[this.futureNavigationStates.length - 1].appPath === currentFragment) {
                        navigationActions.movedForward = true;
                        this.handleForwardMovement();
                    }
                }

                if ((pastStatesCount >= 2) && (this.pastNavigationStates[pastStatesCount - 2])) {
                    if (this.pastNavigationStates[pastStatesCount - 2].appPath === currentFragment) {
                        navigationActions.movedBack = true;
                        this.handleBackwardMovement();
                    }
                }

                if (!navigationActions.movedBack && !navigationActions.movedForward) {
                    let foundInPast = this.pastNavigationStates.some((state, idx) => state.appPath === currentFragment && idx !== (pastStatesCount - 2));
                    let foundInFuture = this.futureNavigationStates.some(state => state.appPath === currentFragment);
                    if (foundInPast || foundInFuture) {
                         navigationActions.arbitraryChange = true;
                    }
                    this.handleDirectUrlChange();
                }

                this.currentDocumentHref = currentUrl;
                let appFragment = currentFragment;
                this.notifyPlayerOfUrlChange(appFragment);
            }
        }
        setTimeout(() => this.monitorUrlChanges(), 60);
    }

    notifyPlayerOfUrlChange(fragment) {
        if (typeof NavTracker_multi_player !== "undefined" && NavTracker_multi_player === true) {
            const players = this.getAllFlashPlayers();
            for (const player of players) {
                player.browserURLChange(fragment);
            }
        } else {
            const player = this.getFlashPlayer();
            if (player) {
                player.browserURLChange(fragment);
            }
        }
    }

    addNavigationAnchor(appLink) {
        if (document.getElementsByName(appLink).length === 0) {
            this.retrieveAnchorDiv().insertAdjacentHTML('beforeend', `<a name="${appLink}">${appLink}</a>`);
        }
    }

    configureNavigationComponents() {
        if (this.clientAgent.isExplorer) {
            let iframePath = 'history/historyFrame.html';
            const allScripts = document.getElementsByTagName('script');
            for (let i = 0; i < allScripts.length; i++) {
                const scriptElement = allScripts[i];
                if (scriptElement.src && scriptElement.src.includes("history.js")) {
                    iframePath = scriptElement.src.replace("history.js", "historyFrame.html");
                    break;
                }
            }
            this.historyFrameBaseSrc = iframePath + "?";

            const iframeElement = document.createElement("iframe");
            iframeElement.id = 'explorer_history_frame';
            iframeElement.name = 'explorer_history_frame';
            iframeElement.src = 'javascript:false;';

            const appendIframe = () => {
                try {
                    document.body.appendChild(iframeElement);
                } catch (e) {
                    setTimeout(appendIframe, 0);
                }
            };
            appendIframe();
        }

        if (this.clientAgent.isSafari) {
            const rememberContainer = document.createElement("div");
            rememberContainer.id = 'safari_remember_container';
            document.body.appendChild(rememberContainer);
            rememberContainer.innerHTML = '<input type="text" id="safari_remember_input" style="width: 500px;">';

            const formContainer = document.createElement("div");
            formContainer.id = 'safari_form_wrapper';
            document.body.appendChild(formContainer);

            const reloaderWrapper = document.createElement('div');
            reloaderWrapper.id = 'safari_reloader_area';
            reloaderWrapper.innerHTML = `<iframe id="safari_reloader_iframe" src="about:blank" frameborder="no" scrolling="no"></iframe>`;
            document.body.appendChild(reloaderWrapper);
            Object.assign(reloaderWrapper.style, {
                position: 'absolute',
                left: '-9999px',
                top: '-9999px'
            });

            const rememberInput = this.retrieveRememberField();
            if (rememberInput && rememberInput.value !== "") {
                this.fragmentHistory = rememberInput.value.split(",");
            }
        }

        if (this.clientAgent.isFirefox) {
            const anchorContainer = document.createElement("div");
            anchorContainer.id = 'firefox_anchor_container';
            document.body.appendChild(anchorContainer);
        }
    }

    startUrlMonitoring() {
        setTimeout(() => this.monitorUrlChanges(), 60);
    }

    get currentFragmentHistory() { return this.fragmentHistory; }
    get getPreviousNavigationStates() { return () => this.pastNavigationStates; }
    get getNextNavigationStates() { return () => this.futureNavigationStates; }
    getFlashPlayerById(id) { return this.getFlashPlayer(id); }
    
    updateBrowserHistory(baseUrl, newUrl, flexAppUrl) {
        this.addNavigationEntry(baseUrl, newUrl, flexAppUrl);
    }
}

const NavigationServiceInstance = new NavTrackerService();

const PageHistoryController = {
    fragmentTimeline: NavigationServiceInstance.currentFragmentHistory,
    getPreviousStates: NavigationServiceInstance.getPreviousNavigationStates,
    getNextStates: NavigationServiceInstance.getNextNavigationStates,
    findPlayerInstance: (id) => NavigationServiceInstance.getFlashPlayerById(id),
    addNavigationEntry: (base, full, app) => NavigationServiceInstance.updateBrowserHistory(base, full, app)
};