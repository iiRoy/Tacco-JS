const appConfig = {
    currentVersionIdentifier: "1",
    defaultLanguageCode: "en",
    trackingEndpoint: "https://stats.benjamin-erb.de/piwik/",
    googleSearchDomain: "http://www.google.com/search",
    repositoryLink: "http://github.com/berb/diploma-thesis/issues/",
    authorLink: "http://www.benjamin-erb.de",
    creativeCommonsLink: "http://creativecommons.org/licenses/by-sa/3.0/",
    piwikSiteId: 6,
    cssClasses: {
        infoBubble: "inner info_bubble",
        pageHeaderSpacer: "page_header_spacer inner",
        searchBox: "search_box",
        searchForm: "search",
        searchField: "search_field",
        searchButton: "search_btn",
        pageHeaderTitle: "page_header_title",
        logo: "logo",
        pageHeaderSub: "page_header_sub",
        sublogo: "sublogo",
        footerContainer: "container",
        mainContainer: "container",
        bodyContent: "body",
        noticeArea: "notice",
        innerWrapper: "inner wrap",
        sidebarArea: "sidebar",
        contentArea: "content body",
        contentFooter: "content_footer",
        anchorLink: "anchor",
        disabledLink: "disabled",
        sausageSpan: "sausage-span",
        completeFlag: "processed-document"
    }
};

const supportedLocales = {
    "en": "English",
    "de": "Deutsch"
};

const localizationStrings = {
    "en": {
        "editionTypeDraft": "Draft Release",
        "draftMessage": `This is a community-driven version. Please <a href='${appConfig.repositoryLink}'>contribute by creating a ticket or pull request</a> for any improvements or corrections.`,
        "documentEdition": "Document Edition",
        "editionInfo": "This is the original publication. An alternative collaborative version is also available.",
        "pageFooter": `Thesis by <a href='${appConfig.authorLink}'>Benjamin Erb</a>, distributed under a <a href='${appConfig.creativeCommonsLink}'>Creative Commons</a> license.`,
        "homeLinkText": "Home Page",
        "nextDocPage": "Next Document Page",
        "prevDocPage": "Previous Document Page",
        "searchButtonText": "Search Now",
        "mainTitle": "Concurrent Programming for Scalable Web Architectures",
        "subHeading": "Diploma Thesis by Benjamin Erb",
        "subHeadingLink": appConfig.authorLink,
        "tableOfContents": "Table of Contents"
    },
    "de": {
        "editionTypeDraft": "Entwurfsversion",
        "draftMessage": `Dies ist die Community-Version. Bitte <a href='${appConfig.repositoryLink}'>erstellen Sie ein Ticket oder einen Pull-Request</a> für Korrekturen, Vorschläge und Verbesserungen.`,
        "documentEdition": "Ausgabe",
        "editionInfo": "Dies ist die Originalversion der Arbeit. Eine alternative kollaborative Version ist ebenfalls verfügbar.",
        "pageFooter": `Diplomarbeit von <a href='${appConfig.authorLink}'>Benjamin Erb</a>, veröffentlicht unter einer <a href='${appConfig.creativeCommonsLink}'>Creative Commons</a> Lizenz.`,
        "homeLinkText": "Startseite",
        "nextDocPage": "Nächste Seite",
        "prevDocPage": "Vorherige Seite",
        "searchButtonText": "Suchen",
        "mainTitle": "Parallele Programmierung für Skalierbare Webarchitekturen",
        "subHeading": "Diplomarbeit von Benjamin Erb",
        "subHeadingLink": appConfig.authorLink,
        "tableOfContents": "Inhaltsverzeichnis"
    }
};

let currentLocale = appConfig.defaultLanguageCode;

const externalScripts = [
    "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js",
    "../script/all/jquery.sausage.js"
];

const ieConditionalAssets = [
    `<!--[if lte IE 8]><link rel='stylesheet' href='../style/all/lte/ie8.css'><![endif]-->`,
    `<!--[if lt IE 8]><link rel='stylesheet' href='../style/all/lt/ie8.css'><![endif]-->`
];

const pageRoutingRules = [
    [/\/(?:editions|versiones)\/(\d+)\/([a-z]{2})\/([a-z]+)\.html/, "processEditionPage"],
    [/\/(?:draft|borrador)\/([a-z]+)\.html/, "processDraftPage"],
    [/\/(?:original|originale)\/(\d+_)?([a-z]+)\.html/, "processEditionPage"],
    [/\/(?:community|communidad)\/(\d+_)?([a-z]+)\.html/, "processDraftPage"],
    [/\/index\.html/, "processIndexPage"]
];

const createDOMElement = (tagName, attributes = {}, content = '') => {
    const element = document.createElement(tagName);
    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            element.setAttribute(key, attributes[key]);
        }
    }
    element.innerHTML = content;
    return element;
};

const loadScript = (src, callback) => {
    const script = createDOMElement('script', { src, async: true });
    if (callback) {
        script.onload = script.onreadystatechange = function() {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                callback();
                script.onload = script.onreadystatechange = null;
            }
        };
    }
    document.head.appendChild(script);
};

const initializeDynamicAssets = () => {
    const piwikTrackerUrl = `${document.location.protocol === "https:" ? "https:" : "http:"}//${appConfig.trackingEndpoint.split('//')[1]}piwik.js`;
    externalScripts.push(piwikTrackerUrl);

    let scriptIndex = 0;
    const loadNextScript = () => {
        if (scriptIndex < externalScripts.length) {
            loadScript(externalScripts[scriptIndex], () => {
                scriptIndex++;
                loadNextScript();
            });
        }
    };
    loadNextScript();

    ieConditionalAssets.forEach(htmlString => {
        const tempDiv = createDOMElement('div', {}, htmlString);
        if (tempDiv.firstChild && tempDiv.firstChild.tagName === 'LINK') {
            document.head.appendChild(tempDiv.firstChild);
        }
    });
};

const getLocalizedString = (key) => {
    return localizationStrings[currentLocale]?.[key] || localizationStrings[appConfig.defaultLanguageCode][key] || `[${key}]`;
};

const createPageHeader = () => {
    const searchPlaceholder = getLocalizedString("searchButtonText");
    const mainTitle = getLocalizedString("mainTitle");
    const subHeading = getLocalizedString("subHeading");
    const subHeadingLink = getLocalizedString("subHeadingLink");

    return `
        <div class="${appConfig.cssClasses.pageHeaderSpacer}">
            <div class="${appConfig.cssClasses.searchBox}">
                <form class="${appConfig.cssClasses.searchForm}" action="${appConfig.googleSearchDomain}">
                    <input type="hidden" name="as_sitesearch" value="http://berb.github.com/diploma-thesis/">
                    <input type="text" name="as_q" value="" class="${appConfig.cssClasses.searchField}" placeholder="${searchPlaceholder}">
                    <button type="submit" class="${appConfig.cssClasses.searchButton}">${searchPlaceholder}</button>
                </form>
            </div>
        </div>
        <div class="${appConfig.cssClasses.pageHeaderTitle}">
            <h1 class="${appConfig.cssClasses.logo}">
                <a href="#" title="${getLocalizedString("homeLinkText")}">${mainTitle}</a>
            </h1>
        </div>
        <div class="${appConfig.cssClasses.pageHeaderSub}">
            <h1 class="${appConfig.cssClasses.sublogo}">
                <a href="${subHeadingLink}" title="${getLocalizedString("homeLinkText")}">${subHeading}</a>
            </h1>
        </div>
    `;
};

const createPageFooter = () => {
    const footerText = getLocalizedString("pageFooter");
    return `
        <footer class="site-footer">
            <div class="${appConfig.cssClasses.footerContainer}">
                <p>${footerText}</p>
            </div>
        </footer>
    `;
};

const applyPageTemplate = () => {
    const bodyElement = $("body");
    const initialBodyContents = bodyElement.contents();

    let templateHTML;
    if (bodyElement.hasClass("home")) {
        templateHTML = `
            <div class="${appConfig.cssClasses.mainContainer}">
                ${createPageHeader()}
                <main class="${appConfig.cssClasses.bodyContent}"></main>
            </div>
            ${createPageFooter()}
        `;
    } else {
        templateHTML = `
            <div class="${appConfig.cssClasses.mainContainer}">
                ${createPageHeader()}
                <aside class="${appConfig.cssClasses.noticeArea}"></aside>
                <div class="${appConfig.cssClasses.innerWrapper}">
                    <nav class="${appConfig.cssClasses.sidebarArea}"></nav>
                    <article class="${appConfig.cssClasses.contentArea}"></article>
                    <footer class="${appConfig.cssClasses.contentFooter}"></footer>
                </div>
            </div>
            ${createPageFooter()}
        `;
    }

    bodyElement.html(templateHTML);

    bodyElement.find(`.${appConfig.cssClasses.bodyContent}, .${appConfig.cssClasses.contentArea}`).html(initialBodyContents);

    const buyContainer = $("div.buy");
    if (buyContainer.length) {
        const buyIframe = createDOMElement('iframe', { id: "buy-frame", scrolling: "no", src: "buy.html" });
        buyContainer.empty().append(buyIframe);

        $(buyIframe).on("load", function() {
            try {
                $(this).contents().find("a").attr("target", "_blank");
            } catch (e) {
                console.warn("Could not modify iframe content (likely cross-origin restriction):", e);
            }
        });
    }
};

const updateLogoDestination = (targetUrl) => {
    $(`.${appConfig.cssClasses.logo} a`).attr("href", targetUrl);
};

const displayNotice = (messageHtml) => {
    $(`.${appConfig.cssClasses.noticeArea}`).append(messageHtml);
};

const displayDraftNotice = () => {
    displayNotice(`<p class="${appConfig.cssClasses.infoBubble}">${getLocalizedString("draftMessage")}</p>`);
};

const displayEditionNotice = (currentEditionId) => {
    if (currentEditionId !== appConfig.currentVersionIdentifier) {
        const currentHref = document.location.href;
        const latestEditionHref = currentHref.replace(
            `/${currentEditionId}/`, `/${appConfig.currentVersionIdentifier}/`
        );
        const noticeText = getLocalizedString("editionInfo").replace("alternative collaborative version", `<a href='${latestEditionHref}'>alternative collaborative version</a>`);
        displayNotice(`<p class="${appConfig.cssClasses.infoBubble}">${noticeText}</p>`);
    }
};

const addNavigationLink = (rel, translationKey) => {
    const linkElement = $(`link[rel='${rel}']`);
    const targetUrl = linkElement.attr("href");
    const linkText = getLocalizedString(translationKey);
    const sidebar = $(`.${appConfig.cssClasses.sidebarArea}`);

    if (targetUrl) {
        sidebar.append(`<h3><a href='${targetUrl}'>${linkText}</a></h3>`);
    } else {
        sidebar.append(`<h3 class='${appConfig.cssClasses.disabledLink}'>${linkText}</h3>`);
    }
};

const generateAndAddTableOfContents = () => {
    const contentHeadings = $(`.${appConfig.cssClasses.contentArea}`).find("h1, h2, h3, h4, h5, h6").filter("[id]");
    if (contentHeadings.length === 0) {
        return;
    }

    let tocHtml = `<h3>${getLocalizedString("tableOfContents")}</h3><ul class="toc-list">`;
    let currentDepth = 0;

    contentHeadings.each(function() {
        const $this = $(this);
        const headingId = $this.attr("id");
        const headingText = $this.text();
        const headingLevel = parseInt(this.tagName.substring(1));

        while (headingLevel > currentDepth) {
            tocHtml += '<li><ul>';
            currentDepth++;
        }
        while (headingLevel < currentDepth) {
            tocHtml += '</ul></li>';
            currentDepth--;
        }

        tocHtml += `<li><a href="#${headingId}">${headingText}</a>`;
    });

    while (currentDepth > 0) {
        tocHtml += '</ul></li>';
        currentDepth--;
    }
    tocHtml += '</ul>';

    $(`.${appConfig.cssClasses.sidebarArea}`).append(tocHtml);
};

const routePageContent = () => {
    const currentUrl = document.location.href;
    for (const [pattern, handlerName] of pageRoutingRules) {
        const matches = currentUrl.match(pattern);
        if (matches) {
            if (typeof window[handlerName] === 'function') {
                window[handlerName](matches);
                return;
            }
        }
    }
    console.warn("No matching routing rule found for URL:", currentUrl);
};

const processEditionPage = (matchResult) => {
    const editionId = matchResult[1];
    const languageCode = matchResult[2];
    const pageIdentifier = matchResult[3];

    if (supportedLocales[languageCode]) {
        currentLocale = languageCode;
    } else {
        console.warn(`Unsupported language code '${languageCode}', falling back to default.`);
        currentLocale = appConfig.defaultLanguageCode;
    }

    updateLogoDestination("../index.html");
    displayEditionNotice(editionId);

    const sidebar = $(`.${appConfig.cssClasses.sidebarArea}`);
    sidebar.append(`<h3><a href='../index.html'>${getLocalizedString("homeLinkText")}</a></h3>`);

    if (pageIdentifier === "index") {
        sidebar.append(`<h3>${getLocalizedString("documentEdition")} ${editionId} (${supportedLocales[currentLocale]})</h3>`);
    } else {
        sidebar.append(`<h3><a href='index.html'>${getLocalizedString("tableOfContents")}</a></h3>`);
    }

    addNavigationLink("prev", "prevDocPage");
    addNavigationLink("next", "nextDocPage");
    generateAndAddTableOfContents();
};

const processDraftPage = (matchResult) => {
    const pageIdentifier = matchResult[1];

    updateLogoDestination("../index.html");
    displayDraftNotice();

    const sidebar = $(`.${appConfig.cssClasses.sidebarArea}`);
    sidebar.append(`<h3><a href='../index.html'>${getLocalizedString("homeLinkText")}</a></h3>`);

    if (pageIdentifier === "index") {
        sidebar.append(`<h3>${getLocalizedString("editionTypeDraft")}</h3>`);
    } else {
        sidebar.append(`<h3><a href='index.html'>${getLocalizedString("tableOfContents")}</a></h3>`);
    }

    addNavigationLink("prev", "prevDocPage");
    addNavigationLink("next", "nextDocPage");
    generateAndAddTableOfContents();
};

const processIndexPage = (matchResult) => {
    updateLogoDestination("index.html");
};

const createPermalinkAnchors = () => {
    $(`.${appConfig.cssClasses.contentArea} [id]:not(.figure)`).each(function() {
        const $this = $(this);
        const elementId = $this.attr("id");
        if (!$this.closest('a.anchor').length) {
            $this.wrap(`<a class='${appConfig.cssClasses.anchorLink}' href='#${elementId}'></a>`);
        }
    });
};

const segmentContentIntoSections = () => {
    const contentDiv = $(`.${appConfig.cssClasses.contentArea}`);
    if (contentDiv.length === 0) return;

    const allContentChildren = contentDiv.children();
    const newSectionsContainer = $('<div class="segmented-content-wrapper"/>');
    let currentSection = $('<section/>');

    allContentChildren.each(function() {
        const $el = $(this);
        if ($el.hasClass(appConfig.cssClasses.anchorLink) || $el.is('h1, h2, h3, h4, h5, h6')) {
            if (currentSection.children().length > 0) {
                newSectionsContainer.append(currentSection);
            }
            currentSection = $('<section/>');
        }
        currentSection.append($el.clone(true, true));
    });

    if (currentSection.children().length > 0) {
        newSectionsContainer.append(currentSection);
    }

    contentDiv.empty().append(newSectionsContainer.children());
};

const activateSausagePlugin = () => {
    if (typeof $.fn.sausage === 'function' && $('section').length > 0) {
        $(window).sausage({
            page: "section",
            content: function(index, $pageElement) {
                const labelElement = $pageElement.find(`.${appConfig.cssClasses.anchorLink}`).first();
                if (labelElement.length) {
                    return `<span class='${appConfig.cssClasses.sausageSpan}'>${labelElement.text()}</span>`;
                }
                const headingElement = $pageElement.find('h1, h2, h3, h4, h5, h6').first();
                if (headingElement.length) {
                    return `<span class='${appConfig.cssClasses.sausageSpan}'>${headingElement.text()}</span>`;
                }
                return `<span class='${appConfig.cssClasses.sausageSpan}'>Section ${index + 1}</span>`;
            }
        });
    } else if (typeof $.fn.sausage === 'undefined') {
        console.warn("Sausage.js plugin not loaded or not available.");
    } else {
        console.info("No sections found to activate Sausage.js.");
    }
};

const determinePageLanguage = () => {
    const currentUrl = document.location.href;
    for (const [pattern] of pageRoutingRules) {
        const matches = currentUrl.match(pattern);
        if (matches && matches.length > 2 && supportedLocales[matches[2]]) {
            currentLocale = matches[2];
            return;
        }
    }
};

const initializeAnalyticsTracking = () => {
    const piwikPhpUrl = `${document.location.protocol === "https:" ? "https:" : "http:"}//${appConfig.trackingEndpoint.split('//')[1]}piwik.php`;

    if (typeof Piwik !== 'undefined' && typeof Piwik.getTracker === 'function') {
        try {
            const piwikTracker = Piwik.getTracker(piwikPhpUrl, appConfig.piwikSiteId);
            piwikTracker.trackPageView();
            piwikTracker.enableLinkTracking();
            console.log("Piwik tracking initialized.");
        } catch (error) {
            console.error("Error initializing Piwik tracking:", error);
        }
    } else {
        console.warn("Piwik global object not found. Tracking disabled.");
    }

    const noScriptImg = createDOMElement('noscript', {}, `<p><img src="${piwikPhpUrl}?idsite=${appConfig.piwikSiteId}" style="border:0" alt="" /></p>`);
    $("body").append(noScriptImg);
};

const handleKeyboardNavigation = (event) => {
    const keyPressed = event.key;
    const navLinks = document.querySelectorAll("link[rel='prev'], link[rel='next']");

    let prevLink = null;
    let nextLink = null;

    navLinks.forEach(link => {
        if (link.rel === 'prev') prevLink = link.href;
        if (link.rel === 'next') nextLink = link.href;
    });

    if (keyPressed === "ArrowLeft" && prevLink) {
        window.location.href = prevLink;
        event.preventDefault();
    } else if (keyPressed === "ArrowRight" && nextLink) {
        window.location.href = nextLink;
        event.preventDefault();
    }
};

const onDocumentReady = () => {
    document.body.classList.add(appConfig.cssClasses.completeFlag);

    try {
        determinePageLanguage();
        applyPageTemplate();
        routePageContent();
        createPermalinkAnchors();
        segmentContentIntoSections();
        activateSausagePlugin();
        initializeAnalyticsTracking();
    } catch (error) {
        console.error("An error occurred during document initialization:", error);
    }

    document.documentElement.addEventListener("keydown", handleKeyboardNavigation, true);
};

$(document).ready(() => {
    initializeDynamicAssets();
    onDocumentReady();
});