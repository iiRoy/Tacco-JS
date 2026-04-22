class SiteParameters {
    constructor(initialParams) {
        this._displaySelectors = {
            mainArticle: initialParams.articleArea,
            sidePanel: initialParams.sidePanel,
            editControl: initialParams.editorButton,
            scrollUp: initialParams.topButton,
            progressIndicator: initialParams.loadStatus,
            issueDisplay: initialParams.errorDisplay,
        };

        this._featureFlags = {
            showSidePanel: initialParams.panelEnabled,
            showEditControl: initialParams.editorEnabled,
            showScrollUp: initialParams.topButtonEnabled,
            retainProgress: initialParams.progressRetention,
        };

        this._filePaths = {
            panelFile: initialParams.panelSource,
            baseAddress: initialParams.baseUrl,
            defaultIndex: initialParams.mainDoc,
            docTitle: initialParams.siteTitle,
        };

        this._externalContent = {
            commentSectionHtml: initialParams.commentHtml,
            commentServiceName: initialParams.disqusShortname || 'es6',
        };

        this._state = {
            cachedNavigation: [],
            currentLoadingId: null,
        };
    }

    getSelector(key) {
        return this._displaySelectors[key];
    }

    getFlag(key) {
        return this._featureFlags[key];
    }

    getPath(key) {
        return this._filePaths[key];
    }

    getExtContent(key) {
        return this._externalContent[key];
    }

    getState(key) {
        return this._state[key];
    }

    setState(key, value) {
        this._state[key] = value;
    }

    get allNavigationItems() {
        return this._state.cachedNavigation;
    }

    set allNavigationItems(items) {
        this._state.cachedNavigation = items;
    }
}

class ContentOrchestrator {
    constructor(configuration) {
        this._config = configuration;
        this._scrollDebounceTimer = null;

        this._attachGlobalListeners();
    }

    beginOperation() {
        this._configureInitialComponents();
        this._processCurrentRoute();
    }

    _attachGlobalListeners() {
        window.addEventListener('hashchange', this._processCurrentRoute.bind(this));
    }

    _configureInitialComponents() {
        if (this._config.getFlag('showSidePanel')) {
            this._setupSideNavigation();
        }

        if (this._config.getFlag('showScrollUp')) {
            this._setupScrollToTop();
        }

        if (this._config.getFlag('showEditControl')) {
            this._setupContentEditor();
        }
    }

    async _setupSideNavigation() {
        const panelElement = document.querySelector(this._config.getSelector('sidePanel'));
        if (!panelElement) return;

        try {
            const response = await fetch(this._config.getPath('panelFile'));
            if (!response.ok) throw new Error("Side panel source not found.");
            const rawData = await response.text();
            panelElement.innerHTML = marked(rawData);

            const navList = panelElement.querySelector('ol');
            if (navList) {
                navList.setAttribute('start', '0');
                const links = Array.from(navList.querySelectorAll('li a')).map(link =>
                    link.href.substring(link.href.indexOf('#'))
                );
                this._config.allNavigationItems = links;
            }

            this._attachNavigationPaginators(panelElement);

        } catch (err) {
            console.error("Failed to load side panel:", err);
            alert("Oops! Can't locate the side panel file for display!");
        }
    }

    _attachNavigationPaginators(panelElement) {
        const pageUpBtn = panelElement.querySelector('#pageup');
        const pageDownBtn = panelElement.querySelector('#pagedown');

        if (pageUpBtn) {
            pageUpBtn.addEventListener('click', () => this._navigateSection(-1));
        }
        if (pageDownBtn) {
            pageDownBtn.addEventListener('click', () => this._navigateSection(1));
        }
    }

    _navigateSection(direction) {
        const currentHash = location.hash;
        const navItems = this._config.allNavigationItems;
        let currentIndex = navItems.indexOf(currentHash);

        if (currentHash === '' && direction === 1) {
            currentIndex = -1;
        } else if (currentHash === '' && direction === -1) {
            return;
        }

        let targetIndex = currentIndex + direction;

        if (targetIndex >= 0 && targetIndex < navItems.length) {
            location.hash = navItems[targetIndex];
        }
    }

    _setupScrollToTop() {
        const scrollBtn = document.querySelector(this._config.getSelector('scrollUp'));
        if (!scrollBtn) return;
        scrollBtn.style.display = 'block';
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    _setupContentEditor() {
        if (!this._config.getPath('baseAddress')) {
            alert("Error! 'baseUrl' is not configured for the application!");
            return;
        }

        const editBtn = document.querySelector(this._config.getSelector('editControl'));
        if (!editBtn) return;
        editBtn.style.display = 'block';
        editBtn.addEventListener('click', () => {
            let currentPath = location.hash.replace("#", "/");
            if (currentPath === "/") {
                currentPath = "/" + this._config.getPath('defaultIndex').replace(".md", "");
            }
            window.open(this._config.getPath('baseAddress') + currentPath + ".md");
        });
    }

    _sanitizeString(inputString) {
        return inputString.replace(/[&\/\\#,+=()$~%.'":*?<>{}\ \]\[]/g, "_");
    }

    _createClickableAnchor(listItemElement, headingLevel) {
        const contentArea = document.querySelector(this._config.getSelector('mainArticle'));
        if (!contentArea) return;

        const safeId = this._sanitizeString(listItemElement.textContent);
        listItemElement.id = safeId;
        listItemElement.classList.add("link-item");

        listItemElement.addEventListener('click', () => {
            const targetHeader = contentArea.querySelector(`h${headingLevel}.${safeId}`);
            if (targetHeader) {
                targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const originalColor = targetHeader.style.color || window.getComputedStyle(targetHeader).color;
                targetHeader.style.transition = 'color 0.5s ease-in-out';
                targetHeader.style.color = "#ED1C24";

                setTimeout(() => {
                    targetHeader.style.transition = 'color 2.5s ease-in-out';
                    targetHeader.style.color = originalColor;
                }, 500);
            }
        });
    }

    _generatePageAnchors() {
        const contentArea = document.querySelector(this._config.getSelector('mainArticle'));
        if (!contentArea) return;

        for (let level = 1; level <= 4; level++) {
            const headers = Array.from(contentArea.querySelectorAll(`h${level}`));
            const headerTexts = [];

            headers.forEach(header => {
                const safeId = this._sanitizeString(header.textContent);
                headerTexts.push(header.textContent);
                header.classList.add(safeId);
                header.id = `h${level}-${safeId}`;
            });

            if (level === 2 && headerTexts.length > 0) {
                const firstH1 = contentArea.querySelector('h1');
                if (firstH1) {
                    const tocList = document.createElement('ol');
                    tocList.classList.add("article-toc");
                    tocList.id = 'article-table-of-contents';
                    firstH1.insertAdjacentElement('afterend', tocList);

                    headerTexts.forEach(text => {
                        const listItem = document.createElement('li');
                        listItem.textContent = text;
                        tocList.appendChild(listItem);
                        this._createClickableAnchor(listItem, level);
                    });
                }
            }
        }
    }

    _adjustImagePaths() {
        const contentArea = document.querySelector(this._config.getSelector('mainArticle'));
        if (!contentArea) return;

        Array.from(contentArea.querySelectorAll("img")).forEach(image => {
            let currentSrc = image.getAttribute("src");
            if (currentSrc && !currentSrc.startsWith("http") && !currentSrc.startsWith("//")) {
                let pathSegment = location.hash.replace("#", "");
                let pathParts = pathSegment.split("/");
                pathParts.pop();
                let baseDir = pathParts.join("/");

                if (currentSrc.startsWith("./")) {
                    currentSrc = currentSrc.substring(2);
                }
                image.setAttribute("src", `${baseDir ? baseDir + '/' : ''}${currentSrc}`);
            }
        });
    }

    _displayError() {
        console.error("An application error occurred.");
        const errorElem = document.querySelector(this._config.getSelector('issueDisplay'));
        if (errorElem) errorElem.style.display = 'block';
    }

    _showLoader() {
        const loaderElem = document.querySelector(this._config.getSelector('progressIndicator'));
        const contentElem = document.querySelector(this._config.getSelector('mainArticle'));

        if (loaderElem) loaderElem.style.display = 'block';
        if (contentElem) contentElem.innerHTML = "";

        const loadingInterval = setInterval(() => {
            if (loaderElem) {
                loaderElem.style.opacity = loaderElem.style.opacity === '0' ? '1' : '0';
            }
        }, 1000);

        this._config.setState('currentLoadingId', loadingInterval);
        return loadingInterval;
    }

    _hideLoader(intervalId) {
        clearInterval(intervalId || this._config.getState('currentLoadingId'));
        const loaderElem = document.querySelector(this._config.getSelector('progressIndicator'));
        if (loaderElem) {
            loaderElem.style.display = 'none';
            loaderElem.style.opacity = '1';
        }
        this._config.setState('currentLoadingId', null);
    }

    async _processCurrentRoute() {
        let currentHashPath = location.hash.replace("#", "");
        let filePath = '';

        if (this._config.getFlag('retainProgress')) {
            const storedHash = localStorage.getItem('nav-point');
            if (storedHash !== location.hash) {
                localStorage.setItem('nav-point', location.hash);
                localStorage.setItem('scroll-position-ratio', '0');
            }
        }

        if (location.pathname === "/index.html" || currentHashPath === "") {
            filePath = this._config.getPath('defaultIndex');
            if (location.pathname === "/index.html") {
                 filePath = location.pathname.replace("index.html", filePath);
            } else {
                 filePath = window.location.origin + window.location.pathname + filePath;
            }
        } else {
            filePath = currentHashPath + ".md";
        }

        window.removeEventListener('scroll', this._handleScrollProgress);

        const activeLoader = this._showLoader();
        const contentArea = document.querySelector(this._config.getSelector('mainArticle'));
        const errorDisplay = document.querySelector(this._config.getSelector('issueDisplay'));

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load content: ${response.statusText}`);
            const markdownContent = await response.text();

            if (errorDisplay) errorDisplay.style.display = 'none';
            if (contentArea) {
                contentArea.innerHTML = marked(markdownContent) + this._config.getExtContent('commentSectionHtml');
            }

            this._updatePageTitle(contentArea);
            this._adjustImagePaths();
            this._generatePageAnchors();
            this._highlightCodeBlocks(contentArea);
            this._initCommentSystem(contentArea);
            this._restoreScrollPosition(contentArea);
            this._updateNavigationButtonVisibility();

            window.addEventListener('scroll', this._handleScrollProgress.bind(this), { passive: true });

        } catch (error) {
            console.error("Content loading failed:", error);
            this._displayError();
        } finally {
            this._hideLoader(activeLoader);
        }
    }

    _updatePageTitle(contentArea) {
        const mainHeading = contentArea ? contentArea.querySelector("h1") : null;
        const pageTitle = mainHeading ? mainHeading.textContent : "";
        const siteTitle = this._config.getPath('docTitle');

        if (pageTitle === siteTitle) {
            document.title = siteTitle;
        } else if (pageTitle) {
            document.title = `${pageTitle} - ${siteTitle}`;
        } else {
            document.title = siteTitle;
        }
    }

    _highlightCodeBlocks(contentArea) {
        if (typeof Prism !== 'undefined' && contentArea) {
            Array.from(contentArea.querySelectorAll('code')).forEach(codeBlock => {
                Prism.highlightElement(codeBlock);
            });
        }
    }

    _initCommentSystem(contentArea) {
        if (!contentArea) return;

        const disqusShortname = this._config.getExtContent('commentServiceName');
        const disqusIdentifier = (location.hash ? location.hash.replace("#", "") : 'ROOT_DOC');
        const disqusTitle = contentArea.querySelector("h1") ? contentArea.querySelector("h1").textContent : "";
        const disqusUrl = 'http://es6.ruanyifeng.com/' + (location.hash ? location.hash.replace("#", "") : 'README');

        window.disqus_shortname = disqusShortname;
        window.disqus_identifier = disqusIdentifier;
        window.disqus_title = disqusTitle;
        window.disqus_url = disqusUrl;

        if (!document.getElementById('dsq-embed-js')) {
            const dsq = document.createElement('script');
            dsq.id = 'dsq-embed-js';
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = `http://${disqusShortname}.disqus.com/embed.js`;
            (document.head || document.body).appendChild(dsq);
        } else {
            if (typeof DISQUS !== 'undefined') {
                DISQUS.reset({
                    reload: true,
                    config: function () {
                        this.page.identifier = window.disqus_identifier;
                        this.page.url = window.disqus_url;
                        this.page.title = window.disqus_title;
                    }
                });
            }
        }
    }

    _restoreScrollPosition(contentArea) {
        if (!contentArea) return;

        let scrollRatio = this._config.getFlag('retainProgress') ? parseFloat(localStorage.getItem('scroll-position-ratio') || '0') : 0;

        if (location.hash !== '' || scrollRatio > 0) {
            if (scrollRatio === 0) {
                window.scrollTo({
                    top: contentArea.offsetTop,
                    behavior: 'smooth'
                });
            } else {
                const totalHeight = document.body.scrollHeight - window.innerHeight;
                window.scrollTo({
                    top: totalHeight * scrollRatio,
                    behavior: 'smooth'
                });
            }
        }
    }

    _updateNavigationButtonVisibility() {
        const currentHash = location.hash;
        const navItems = this._config.allNavigationItems;
        const pageUpBtn = document.querySelector('#pageup');
        const pageDownBtn = document.querySelector('#pagedown');

        if (pageUpBtn) {
            if (currentHash === '' || currentHash === navItems[0]) {
                pageUpBtn.style.display = 'none';
            } else {
                pageUpBtn.style.display = 'inline-block';
            }
        }

        if (pageDownBtn) {
            if (currentHash === navItems[navItems.length - 1]) {
                pageDownBtn.style.display = 'none';
            } else {
                pageDownBtn.style.display = 'inline-block';
            }
        }
    }

    _handleScrollProgress() {
        clearTimeout(this._scrollDebounceTimer);
        this._scrollDebounceTimer = setTimeout(() => {
            const scrollableHeight = document.body.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            let progressRatio = 0;

            if (scrollableHeight > 0) {
                progressRatio = Math.max(0, Math.min(1, currentScroll / scrollableHeight));
            }

            this._updateProgressIndicator(progressRatio);
            if (this._config.getFlag('retainProgress')) {
                localStorage.setItem('scroll-position-ratio', progressRatio.toString());
            }
        }, 100);
    }

    _updateProgressIndicator(ratio) {
        const progressBar = document.querySelector('.progress-indicator-2');
        if (progressBar) {
            progressBar.style.width = `${ratio * 100}%`;
        }
    }
}

const applicationLauncher = (params) => {
    const defaultParams = {
        articleArea: "#content",
        sidePanel: "#sidebar",
        editorButton: "#edit",
        topButton: "#back_to_top",
        loadStatus: "#loading",
        errorDisplay: "#error",

        panelEnabled: true,
        editorEnabled: true,
        topButtonEnabled: true,
        progressRetention: true,

        panelSource: null,
        baseUrl: null,
        mainDoc: "README.md",
        siteTitle: "Default Document Title",

        commentHtml: '<h3>Comments</h3><div id="disqus_thread"></div>',
        disqusShortname: 'es6',
    };

    const mergedParams = { ...defaultParams, ...params };
    const siteConfiguration = new SiteParameters(mergedParams);
    const orchestratorInstance = new ContentOrchestrator(siteConfiguration);

    return {
        start: () => orchestratorInstance.beginOperation(),
        settings: siteConfiguration,
    };
};

const documentationApp = applicationLauncher({
    articleArea: "#content",
    sidePanel: "#sidebar",
    editorButton: "#edit",
    topButton: "#back_to_top",
    loadStatus: "#loading",
    errorDisplay: "#error",

    panelEnabled: true,
    editorEnabled: true,
    topButtonEnabled: true,
    progressRetention: true,

    panelSource: "/path/to/sidebar.md", // Placeholder, adjust as needed
    baseUrl: "https://github.com/your-repo/edit/master/", // Placeholder, adjust as needed
    mainDoc: "index.md",
    siteTitle: "My Awesome Documentation",

    commentHtml: '<h3>Comments</h3><div id="disqus_thread"></div>',
    disqusShortname: 'es6',
});

documentationApp.start();