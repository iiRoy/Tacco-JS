const applicationConfiguration = (() => {
    const currentProtocol = window.location.protocol;
    const piwikTrackerBase = ((currentProtocol === "https:") ? "https://stats.benjamin-erb.de/piwik/" : "http://stats.benjamin-erb.de/piwik/");

    return {
        latestDocumentVersion: "1",
        currentLanguageCode: "en",
        supportedLocales: new Map([
            ["en", "English"]
        ]),
        localeData: new Map([
            ["en", {
                "draftEdition": "Draft edition",
                "draftNotice": "This is the community edition. Please <a href='http://github.com/berb/diploma-thesis/issues/'>create a ticket or pull request</a> for any corrections, suggestions and enhancements. ",
                "editionLabel": "Edition",
                "editionNotice": "This is the original version of the thesis. There is also an <a href='../community/index.html'>alternative version</a> that can be collaboratively extended.",
                "footerText": "Diploma Thesis by <a href='http://www.benjamin-erb.de'>Benjamin Erb</a>, released under a <a href='http://creativecommons.org/licenses/by-sa/3.0/'>Creative Commons</a> license",
                "homeLink": "Home",
                "nextItem": "Next Page",
                "previousItem": "Previous Page",
                "searchAction": "Search",
                "documentTitle": "Concurrent Programming for Scalable Web Architectures",
                "documentSubtitle": "Diploma Thesis by Benjamin Erb",
                "subtitleTarget": "http://www.benjamin-erb.de/",
                "tableOfContents": "Table of Contents"
            }]
        ]),
        externalResourceSources: [
            "http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js",
            "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js",
            "../script/all/jquery.sausage.js"
        ],
        conditionalStyleDeclarations: [
            "<!--[if lte IE 8]><link rel='stylesheet' href='../style/all/lte/ie8.css'><![endif]-->",
            "<!--[if lt IE 8]><link rel='stylesheet' href='../style/all/lt/ie8.css'><![endif]-->"
        ],
        pageRoutingRules: new Map([
            [new RegExp(".*/editions/([0-9]+)/([a-z]{2})/([a-z]+).html"), "handleEditionPage"],
            [new RegExp(".*/draft/([a-z]+).html"), "handleDraftPage"],
            [new RegExp(".*/original/([0-9]+_)?([a-z]+).html"), "handleEditionPage"],
            [new RegExp(".*/community/([0-9]+_)?([a-z]+).html"), "handleDraftPage"],
            [new RegExp(".*/index.html"), "handleIndexPage"]
        ]),
        piwikBase: piwikTrackerBase,
        piwikScript: piwikTrackerBase + "piwik.js"
    };
})();

const utilityFunctions = (() => {
    let processingCompleted = false;

    const retrieveLocalizedText = (key) => {
        const langData = applicationConfiguration.localeData.get(applicationConfiguration.currentLanguageCode);
        return langData ? langData[key] : "";
    };

    const createElementWithClass = (tagName, className) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        return element;
    };

    const appendChildren = (parent, children) => {
        children.forEach(child => parent.appendChild(child));
    };

    const loadExternalScript = (scriptUrl) => {
        return new Promise((resolve, reject) => {
            const scriptTag = document.createElement("script");
            scriptTag.src = scriptUrl;
            scriptTag.onload = resolve;
            scriptTag.onerror = reject;
            document.head.appendChild(scriptTag);
        });
    };

    const loadConditionalStyles = (styleComments) => {
        styleComments.forEach(commentHtml => {
            // document.write is used in original, which directly injects the HTML.
            // For a Type IV clone, we should replicate the *effect* of the conditional comment,
            // which is to include the stylesheet for specific IE versions.
            // Since modern browsers ignore these comments, the simplest functional equivalent
            // for the intended old-IE effect is to directly create the link tag if possible,
            // or literally output the comment as HTML if we want it in the DOM source.
            // Given the original uses document.write, it means the browser *would* parse it.
            // For a faithful reproduction of the DOM effect, we could parse the comment.
            // However, a simpler and functionally equivalent approach for old IE is to create the link.
            // For this clone, we'll assume the original's intent was to inject the stylesheet
            // if the condition was met, and for modern browsers, these are just comments.
            // To ensure the actual link elements are present as they would be in old IE,
            // we will parse the comment and inject the link.
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = commentHtml;
            Array.from(tempDiv.children).forEach(child => {
                if (child.tagName === 'LINK') {
                    document.head.appendChild(child);
                }
            });
        });
    };

    const checkDocumentState = () => {
        if (processingCompleted) {
            console.warn("Document initialization has already been performed."); // Changed from throw to warn
            return false;
        }
        return true;
    };

    const markDocumentState = () => {
        document.body.classList.add("initialization-complete");
        processingCompleted = true;
    };

    const constructPageHeader = () => {
        const headerContainer = createElementWithClass("div", "page_header_spacer inner");
        const searchBox = createElementWithClass("div", "search_box");
        const searchForm = document.createElement("form");
        searchForm.className = "search";
        searchForm.action = "http://www.google.com/search";
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "as_sitesearch";
        hiddenInput.value = "http://berb.github.com/diploma-thesis/";
        const searchField = createElementWithClass("input", "search_field");
        searchField.type = "text";
        searchField.name = "as_q";
        searchField.value = "";
        const submitButton = createElementWithClass("input", "search_btn");
        submitButton.type = "submit";
        submitButton.value = retrieveLocalizedText("searchAction");

        appendChildren(searchForm, [hiddenInput, searchField, submitButton]);
        searchBox.appendChild(searchForm);
        headerContainer.appendChild(searchBox);

        const titleDiv = createElementWithClass("div", "page_header_title");
        const logoHeading = createElementWithClass("h1", "logo");
        const logoLink = document.createElement("a");
        logoLink.href = "#";
        logoLink.title = retrieveLocalizedText("homeLink");
        logoLink.textContent = retrieveLocalizedText("documentTitle");
        logoHeading.appendChild(logoLink);
        titleDiv.appendChild(logoHeading);

        const subtitleDiv = createElementWithClass("div", "page_header_sub");
        const sublogoHeading = createElementWithClass("h1", "sublogo");
        const sublogoLink = document.createElement("a");
        sublogoLink.href = retrieveLocalizedText("subtitleTarget");
        sublogoLink.title = retrieveLocalizedText("homeLink");
        sublogoLink.textContent = retrieveLocalizedText("documentSubtitle");
        sublogoHeading.appendChild(sublogoLink);
        subtitleDiv.appendChild(sublogoHeading);

        const fragment = document.createDocumentFragment();
        appendChildren(fragment, [headerContainer, titleDiv, subtitleDiv]);
        return fragment;
    };

    const constructPageFooter = () => {
        const footerDiv = createElementWithClass("div", "footer");
        const containerDiv = createElementWithClass("div", "container");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = retrieveLocalizedText("footerText"); // Use innerHTML for rich text
        containerDiv.appendChild(paragraph);
        footerDiv.appendChild(containerDiv);
        return footerDiv;
    };

    const applyPageTemplate = () => {
        const currentBodyContent = Array.from(document.body.childNodes);
        document.body.innerHTML = ""; // Clear body before rebuilding

        const mainContainer = createElementWithClass("div", "container");
        const headerFragment = constructPageHeader();
        mainContainer.appendChild(headerFragment);

        const isHomePage = document.body.classList.contains("home");
        const mainBodyArea = createElementWithClass("div", "body");

        if (isHomePage) {
            mainContainer.appendChild(mainBodyArea);
        } else {
            const noticeArea = createElementWithClass("div", "notification-area"); // Renamed from .notice
            const innerWrap = createElementWithClass("div", "inner wrap");
            const sidebar = createElementWithClass("div", "sidebar-nav"); // Renamed from .sidebar
            const contentBody = createElementWithClass("div", "content primary-body"); // Renamed from .content .body
            const contentFooter = createElementWithClass("div", "content-bottom"); // Renamed from .content_footer

            appendChildren(innerWrap, [sidebar, contentBody, contentFooter]);
            appendChildren(mainContainer, [noticeArea, innerWrap]);
            mainBodyArea.classList.remove("body"); // Ensure it doesn't conflict
            mainBodyArea.classList.add("content"); // If contentBody is the target for original content
        }

        const footerFragment = constructPageFooter();

        appendChildren(document.body, [mainContainer, footerFragment]);

        // Reinsert original content
        const targetContentArea = isHomePage ? mainContainer.querySelector(".body") : mainContainer.querySelector(".content.primary-body");
        if (targetContentArea) {
            currentBodyContent.forEach(node => targetContentArea.appendChild(node));
        }

        const buySection = createElementWithClass("div", "buy-section"); // Renamed from .buy
        document.body.appendChild(buySection); // Assuming 'buy' is appended to body, not inside container

        const purchaseFrame = document.createElement("iframe");
        purchaseFrame.id = "purchase-frame"; // Renamed from #buy
        purchaseFrame.scrolling = "no";
        buySection.appendChild(purchaseFrame);

        purchaseFrame.addEventListener("load", () => {
            try {
                const frameDoc = purchaseFrame.contentDocument || purchaseFrame.contentWindow.document;
                Array.from(frameDoc.querySelectorAll("a")).forEach(anchor => {
                    anchor.setAttribute("target", "_blank");
                });
            } catch (e) {
                console.warn("Could not modify iframe contents due to same-origin policy:", e);
            }
        });
        purchaseFrame.src = "buy.html";
    };

    const updateLogoLinkTarget = (destinationUrl) => {
        const logoAnchor = document.querySelector(".logo a");
        if (logoAnchor) {
            logoAnchor.href = destinationUrl;
        }
    };

    const displayPageNotification = (messageHtml) => {
        const noticeContainer = document.querySelector(".notification-area");
        if (noticeContainer) {
            const paragraph = createElementWithClass("p", "inner info_bubble");
            paragraph.innerHTML = messageHtml;
            noticeContainer.appendChild(paragraph);
        }
    };

    const displayDraftNotification = () => {
        displayPageNotification(retrieveLocalizedText("draftNotice"));
    };

    const displayEditionNotification = (currentEdition) => {
        const currentPath = document.location.href;
        const latestEdition = applicationConfiguration.latestDocumentVersion;
        let noticeText = retrieveLocalizedText("editionNotice");

        if (currentEdition !== latestEdition) {
            const updatedHref = currentPath.replace(
                `/editions/${currentEdition}/`,
                `/editions/${latestEdition}/`
            );
            noticeText = noticeText.replace("%s", updatedHref);
            displayPageNotification(noticeText);
        }
    };

    const addNavigationLink = (isPrev, targetUrl, labelKey) => {
        const sidebar = document.querySelector(".sidebar-nav");
        if (!sidebar) return;

        const heading = document.createElement("h3");
        if (targetUrl) {
            const link = document.createElement("a");
            link.href = targetUrl;
            link.textContent = retrieveLocalizedText(labelKey);
            heading.appendChild(link);
        } else {
            heading.classList.add("disabled");
            heading.textContent = retrieveLocalizedText(labelKey);
        }
        sidebar.appendChild(heading);
    };

    const addPreviousPageLink = () => {
        const prevLinkElement = document.querySelector("link[rel='prev']");
        addNavigationLink(true, prevLinkElement ? prevLinkElement.href : null, "previousItem");
    };

    const addNextPageLink = () => {
        const nextLinkElement = document.querySelector("link[rel='next']");
        addNavigationLink(false, nextLinkElement ? nextLinkElement.href : null, "nextItem");
    };

    const generateDocumentOutline = () => {
        const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter(h => h.id);
        if (headings.length === 0) return;

        const sidebar = document.querySelector(".sidebar-nav");
        if (!sidebar) return;

        const headingTitle = document.createElement("h3");
        headingTitle.textContent = "Contents"; // Hardcoded in original
        sidebar.appendChild(headingTitle);

        let currentList = document.createElement("ul");
        let currentDepth = 0;
        const depthStack = [currentList];

        headings.forEach(heading => {
            const newDepth = parseInt(heading.tagName.substring(1));
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            listItem.appendChild(link);

            if (newDepth > currentDepth) {
                const newList = document.createElement("ul");
                currentList.appendChild(listItem);
                listItem.appendChild(newList);
                depthStack.push(newList);
                currentList = newList;
            } else if (newDepth < currentDepth) {
                while (newDepth < currentDepth && depthStack.length > 1) {
                    depthStack.pop();
                    currentList = depthStack[depthStack.length - 1];
                    currentDepth = parseInt(currentList.parentElement.tagName.substring(1)) || 0; // Adjust depth based on parent heading
                }
                currentList.appendChild(listItem);
            } else { // Same depth
                currentList.parentElement.appendChild(listItem); // Append to the list that contains the previous item
            }
            currentDepth = newDepth;
        });

        const rootList = depthStack[0];
        if (rootList.children.length > 0) {
             // Find the true root UL. The initial currentList might be nested.
            let topLevelList = rootList;
            while(topLevelList.parentElement && topLevelList.parentElement.tagName === 'LI') {
                topLevelList = topLevelList.parentElement.parentElement; // Go up to UL
            }
            sidebar.appendChild(topLevelList);
        }
    };


    const processUrlRouting = () => {
        const currentUrl = document.location.href;
        for (const [pattern, handlerName] of applicationConfiguration.pageRoutingRules.entries()) {
            const matches = pattern.exec(currentUrl);
            if (matches) {
                // Call the corresponding handler function dynamically
                if (typeof mainAppLogic[handlerName] === 'function') {
                    mainAppLogic[handlerName](matches);
                }
                break;
            }
        }
    };

    const addIdAnchors = () => {
        Array.from(document.querySelectorAll("[id]:not(.figure)")).forEach(element => {
            const wrapperLink = document.createElement("a");
            wrapperLink.className = "anchor-link"; // Renamed from .anchor
            wrapperLink.href = `#${element.id}`;
            element.parentNode.insertBefore(wrapperLink, element);
            wrapperLink.appendChild(element);
        });
    };

    const segmentPageContent = () => {
        const contentArea = document.querySelector(".content.primary-body"); // Target the content div
        if (!contentArea) return;

        const contentChildren = Array.from(contentArea.children);
        const sectionsContainer = document.createElement("div"); // New container for sections
        let currentSection = null;

        contentChildren.forEach(child => {
            if (child.classList.contains("anchor-link")) { // If it's an anchor wrapper
                if (currentSection) {
                    sectionsContainer.appendChild(currentSection);
                }
                currentSection = document.createElement("section");
            }
            if (currentSection) {
                currentSection.appendChild(child.cloneNode(true)); // Clone to avoid moving original
            }
        });

        if (currentSection) {
            sectionsContainer.appendChild(currentSection);
        }
        contentArea.innerHTML = ''; // Clear original content
        contentArea.appendChild(sectionsContainer); // Append new sections
    };

    const initializeScrollNavigation = () => {
        const sections = document.querySelectorAll("section");
        if (sections.length < 1) return;

        // Clone of jquery.sausage.js functionality
        const scrollNavContainer = createElementWithClass("div", "scroll-nav-bar"); // Custom element for the scroll nav
        document.body.appendChild(scrollNavContainer);

        const navItems = Array.from(sections).map(section => {
            const navLink = createElementWithClass("a", "scroll-nav-item");
            const firstAnchor = section.querySelector(".anchor-link");
            if (firstAnchor) {
                navLink.textContent = firstAnchor.textContent;
                navLink.href = `#${firstAnchor.children[0].id}`; // Link to the actual heading ID
            } else {
                navLink.textContent = "Untitled";
            }
            scrollNavContainer.appendChild(navLink);
            return { section, navLink };
        });

        let activeIndex = -1;

        const updateActiveSection = () => {
            const viewportHeight = window.innerHeight;
            let currentActive = -1;

            for (let i = 0; i < navItems.length; i++) {
                const rect = navItems[i].section.getBoundingClientRect();
                // Consider a section "active" if its top is within the viewport,
                // or if it's the first section and its top is above the viewport.
                if (rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
                    currentActive = i;
                    break;
                }
            }

            if (currentActive !== activeIndex) {
                if (activeIndex !== -1) {
                    navItems[activeIndex].navLink.classList.remove("active");
                }
                if (currentActive !== -1) {
                    navItems[currentActive].navLink.classList.add("active");
                }
                activeIndex = currentActive;
            }
        };

        window.addEventListener("scroll", updateActiveSection);
        updateActiveSection(); // Initial call
    };

    const determineCurrentLanguage = () => {
        const currentUrl = document.location.href;
        // Use the first routing rule that matches language pattern
        for (const [pattern] of applicationConfiguration.pageRoutingRules.entries()) {
            const matches = pattern.exec(currentUrl);
            if (matches && matches.length > 2) {
                const langCode = matches[2];
                if (applicationConfiguration.supportedLocales.has(langCode)) {
                    applicationConfiguration.currentLanguageCode = langCode;
                    return;
                }
            }
        }
        applicationConfiguration.currentLanguageCode = "en"; // Default
    };

    const setupAnalyticsTracking = () => {
        loadExternalScript(applicationConfiguration.piwikScript).then(() => {
            try {
                if (window.Piwik) {
                    const pageTracker = window.Piwik.getTracker(applicationConfiguration.piwikBase + "piwik.php", 6);
                    pageTracker.trackPageView();
                    pageTracker.enableLinkTracking();
                }
            } catch (err) {
                console.warn("Piwik tracking error:", err);
            }
        }).catch(err => {
            console.error("Failed to load Piwik script:", err);
        });

        // Add noscript tag using DOM API
        const noscriptElement = document.createElement("noscript");
        const paragraph = document.createElement("p");
        const image = document.createElement("img");
        image.src = "http://stats.benjamin-erb.de/piwik/piwik.php?idsite=6";
        image.style.border = "0";
        image.alt = "";
        paragraph.appendChild(image);
        noscriptElement.appendChild(paragraph);
        document.body.appendChild(noscriptElement);
    };

    const handleKeyboardNavigation = (keyboardEvent) => {
        const previousPageLink = document.querySelector("link[rel='prev']");
        const nextPageLink = document.querySelector("link[rel='next']");

        if (keyboardEvent.keyCode === 37 && previousPageLink) { // Left arrow
            window.location.href = previousPageLink.href;
        } else if (keyboardEvent.keyCode === 39 && nextPageLink) { // Right arrow
            window.location.href = nextPageLink.href;
        }
    };

    return {
        checkDocumentState,
        markDocumentState,
        retrieveLocalizedText,
        loadExternalScript,
        loadConditionalStyles,
        applyPageTemplate,
        updateLogoLinkTarget,
        displayPageNotification,
        displayDraftNotification,
        displayEditionNotification,
        addPreviousPageLink,
        addNextPageLink,
        generateDocumentOutline,
        processUrlRouting,
        addIdAnchors,
        segmentPageContent,
        initializeScrollNavigation,
        determineCurrentLanguage,
        setupAnalyticsTracking,
        handleKeyboardNavigation
    };
})();

const mainAppLogic = (() => {
    const handleEditionPage = (matchGroups) => {
        const currentEdition = matchGroups[1];
        const languageCode = matchGroups[2];
        const pageIdentifier = matchGroups[3];

        const localeName = applicationConfiguration.supportedLocales.get(languageCode) || languageCode;
        const editionDisplay = `${utilityFunctions.retrieveLocalizedText("editionLabel")} ${currentEdition} (${localeName})`;

        utilityFunctions.updateLogoLinkTarget("../index.html");
        utilityFunctions.displayEditionNotification(currentEdition);

        const sidebar = document.querySelector(".sidebar-nav");
        if (sidebar) {
            const homeLinkHeading = utilityFunctions.createElementWithClass("h3");
            const homeLink = document.createElement("a");
            homeLink.href = "../index.html";
            homeLink.textContent = utilityFunctions.retrieveLocalizedText("homeLink");
            homeLinkHeading.appendChild(homeLink);
            sidebar.appendChild(homeLinkHeading);

            const contentLinkHeading = utilityFunctions.createElementWithClass("h3");
            if (pageIdentifier === "index") {
                contentLinkHeading.textContent = editionDisplay;
            } else {
                const tocLink = document.createElement("a");
                tocLink.href = "index.html";
                tocLink.textContent = utilityFunctions.retrieveLocalizedText("tableOfContents");
                contentLinkHeading.appendChild(tocLink);
            }
            sidebar.appendChild(contentLinkHeading);
        }

        utilityFunctions.addPreviousPageLink();
        utilityFunctions.addNextPageLink();
        utilityFunctions.generateDocumentOutline();
    };

    const handleDraftPage = (matchGroups) => {
        const pageIdentifier = matchGroups[1];

        utilityFunctions.updateLogoLinkTarget("../index.html");
        utilityFunctions.displayDraftNotification();

        const sidebar = document.querySelector(".sidebar-nav");
        if (sidebar) {
            const homeLinkHeading = utilityFunctions.createElementWithClass("h3");
            const homeLink = document.createElement("a");
            homeLink.href = "../index.html";
            homeLink.textContent = utilityFunctions.retrieveLocalizedText("homeLink");
            homeLinkHeading.appendChild(homeLink);
            sidebar.appendChild(homeLinkHeading);

            const contentLinkHeading = utilityFunctions.createElementWithClass("h3");
            if (pageIdentifier === "index") {
                contentLinkHeading.textContent = utilityFunctions.retrieveLocalizedText("draftEdition");
            } else {
                const tocLink = document.createElement("a");
                tocLink.href = "index.html";
                tocLink.textContent = utilityFunctions.retrieveLocalizedText("tableOfContents");
                contentLinkHeading.appendChild(tocLink);
            }
            sidebar.appendChild(contentLinkHeading);
        }

        utilityFunctions.addPreviousPageLink();
        utilityFunctions.addNextPageLink();
        utilityFunctions.generateDocumentOutline();
    };

    const handleIndexPage = (matchGroups) => {
        utilityFunctions.updateLogoLinkTarget("index.html");
    };

    return {
        handleEditionPage,
        handleDraftPage,
        handleIndexPage
    };
})();

document.addEventListener("DOMContentLoaded", async () => {
    // Load scripts first, some might be needed for DOM manipulation or plugins
    const scriptsToLoad = [...applicationConfiguration.externalResourceSources, applicationConfiguration.piwikScript];
    try {
        await Promise.all(scriptsToLoad.map(url => utilityFunctions.loadExternalScript(url)));
    } catch (error) {
        console.error("Failed to load some external scripts:", error);
    }

    // Load conditional styles
    utilityFunctions.loadConditionalStyles(applicationConfiguration.conditionalStyleDeclarations);

    // Main application flow
    if (!utilityFunctions.checkDocumentState()) {
        return;
    }

    try {
        utilityFunctions.markDocumentState();
        utilityFunctions.determineCurrentLanguage();
        utilityFunctions.applyPageTemplate();
        utilityFunctions.processUrlRouting();
        utilityFunctions.addIdAnchors();
        utilityFunctions.segmentPageContent();
        utilityFunctions.setupAnalyticsTracking();
        utilityFunctions.initializeScrollNavigation();
    } catch (error) {
        console.error("An error occurred during application initialization:", error);
    }

    document.documentElement.addEventListener("keydown", utilityFunctions.handleKeyboardNavigation, true);
});