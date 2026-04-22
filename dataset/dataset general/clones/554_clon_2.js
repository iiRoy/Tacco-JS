// This file manages the client-side behavior for the thesis website.

// Configuration for the document's current revision.
const currentVersionNum = "1";

// The currently selected language for content display.
let activeLocale = "en";

// A mapping of language codes to their full names.
const supportedLocales = {
    "en": "English"
};

// Comprehensive localization data for various UI elements and messages.
const translationData = {
    "en": {
        "communityVersion": "Community edition", // Renamed key
        "draftNoticeText": "This is the collaborative community edition. Please <a href='http://github.com/berb/diploma-thesis/issues/'>submit issues or pull requests</a> for any improvements or fixes.", // Modified text and identifier
        "version": "Version", // Renamed key
        "versionNoticeText": "This represents the initial publication of the thesis. An <a href='%s'>openly editable version</a> is also available for community contributions.", // Modified text and identifier
        "pageFooter": "Academic Work by <a href='http://www.benjamin-erb.de'>Benjamin Erb</a>, licensed under <a href='http://creativecommons.org/licenses/by-sa/3.0/'>Creative Commons</a>", // Renamed key, modified text
        "homepage": "Homepage", // Renamed key
        "nextChapter": "Next Chapter", // Renamed key
        "prevChapter": "Previous Chapter", // Renamed key
        "searchContent": "Search Content", // Renamed key
        "mainTitle": "Concurrent Programming for Scalable Web Architectures", // Renamed key
        "subTitle": "Dissertation by Benjamin Erb", // Renamed key
        "subTitleLink": "http://www.benjamin-erb.de/" // Renamed key
    }
};

// List of external JavaScript resources to be dynamically loaded.
const externalResources = [
    "http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js",
    "../script/all/jquery.sausage.js"
    // "http://christophercliff.github.com/sausage/jquery.sausage.js" // Example of a commented-out resource
];

// Determine the base URL for the analytics tracking script based on protocol.
const analyticsEndpoint = (("https:" === document.location.protocol) ? "https://stats.benjamin-erb.de/piwik/" : "http://stats.benjamin-erb.de/piwik/");
// Append the analytics script to the list of resources.
externalResources.push(analyticsEndpoint + "piwik.js");

// Dynamically inject all required script tags into the document.
for (let resourceIndex = 0; resourceIndex < externalResources.length; resourceIndex++) {
    document.write("<script src='" + externalResources[resourceIndex] + "'></script>");
}

// Array of conditional HTML comments for IE-specific stylesheets.
const conditionalIncludes = [
    "<!--[if lte IE 8]><link rel='stylesheet' href='../style/all/lte/ie8.css'><![endif]-->",
    "<!--[if lt IE 8]><link rel='stylesheet' href='../style/all/lt/ie8.css'><![endif]-->"
];

// Insert the conditional comments into the document.
for (let commentIndex = 0; commentIndex < conditionalIncludes.length; commentIndex++) {
    document.write(conditionalIncludes[commentIndex]);
}

// Defines URL patterns and their corresponding handler functions.
const routingRules = [
    [".*/editions/([0-9]+)/([a-z]{2})/([a-z]+).html", "processEditionPage"],
    [".*/draft/([a-z]+).html", "processDraftPage"],
    [".*/original/([0-9]+_)?([a-z]+).html", "processEditionPage"],
    [".*/community/([0-9]+_)?([a-z]+).html", "processDraftPage"],
    [".*/index.html", "processHomePage"]
];

/**
 * Ensures that page processing has not already occurred.
 * Throws an error if the 'complete' class is found on the body element.
 */
function verifyStatus() {
    if (jQ("body").hasClass("complete")) {
        throw "Document content already processed.";
    }
}

/**
 * Marks the document as fully processed by adding a class to the body.
 */
function markProcessed() {
    jQ("body").addClass("complete");
}

/**
 * Constructs and returns the HTML string for the page header section.
 * This includes search functionality and main titles.
 * @returns {string} The HTML string for the header.
 */
function fetchPageHeader() {
    return '\
      <div class="page_header_spacer inner  ">\
        <div class="search_box">\
          <form class="search" action="http://www.google.com/search">\
            <input type="hidden" name="as_sitesearch" value="http://berb.github.com/diploma-thesis/">\
            <input type="text" name="as_q" value="" class="search_field">\
            <input type="submit" value="' + translationData[activeLocale].searchContent + '" class="search_btn" />\
          </form>\
      </div>\
      </div>\
      <div class="page_header_title ">\
        <h1 class="logo">\
          <a href="#" title="homepage">' + translationData[activeLocale].mainTitle + '</a>\
        </h1>\
      </div>\
      <div class="page_header_sub ">\
        <h1 class="sublogo">\
          <a href="' + translationData[activeLocale].subTitleLink + '" title="homepage">' + translationData[activeLocale].subTitle + '</a>\
        </h1>\
      </div>\
    ';
}

/**
 * Generates the HTML string for the page footer section, including copyright and licensing.
 * @returns {string} The HTML string for the footer.
 */
function fetchPageFooter() {
    return '\
      <div class="footer">\
        <div class="container"><p>' +
        translationData[activeLocale].pageFooter +
        '</p></div>\
      </div>\
    ';
}

/**
 * Applies a standard layout template to the page, wrapping existing content.
 * Distinguishes between homepage and other page layouts.
 */
function applyLayout() {
    const pageContent = jQ("body").contents(); // Capture existing body content.
    if (jQ(".home").length) { // Check if it's the homepage.
        jQ("body").html('\
          <div class="container">\
            ' + fetchPageHeader() + '\
            <div class="body">\
            </div>\
          </div>\
          ' + fetchPageFooter() + '\
        ');
    } else { // Standard page layout.
        jQ("body").html('\
          <div class="container">\
            ' + fetchPageHeader() + '\
            <div class="notice"></div>\
            <div class="inner wrap">\
              <div class="sidebar">\
              </div>\
              <div class="content body">\
              </div>\
              <div class="content_footer">\
              </div>\
            </div>\
          </div>\
          ' + fetchPageFooter() + '\
        ');
    }
    jQ("div.body").html(pageContent); // Reinsert original content into the new layout.
    jQ("div.buy").html(
        '<iframe id="buy" scrolling="no"></iframe>'
    );
    // Adjust links within the iframe to open in a new tab.
    jQ("#buy").on("load", function() { // Using 'on' for modern jQuery.
        jQ(this).contents().find("a").attr("target", "_blank");
    });
    jQ("#buy").attr("src", "buy.html"); // Set iframe source.
}

/**
 * Updates the href attribute of the main logo link.
 * @param {string} targetUrl - The new URL for the logo.
 */
function updateLogoLink(targetUrl) {
    jQ(".logo a").attr("href", targetUrl);
}

/**
 * Appends a given HTML string as a notice message to the '.notice' area.
 * @param {string} messageHtml - The HTML content for the notice.
 */
function displayMessage(messageHtml) {
    jQ(".notice").append(messageHtml);
}

/**
 * Displays a specific notice for draft/community editions.
 */
function displayDraftWarning() {
    displayMessage('<p class="inner info_bubble">' + translationData[activeLocale].draftNoticeText + '</p>');
}

/**
 * Displays information about the current document version, with a link to the latest if applicable.
 * @param {string} currentEdition - The identifier of the current edition being viewed.
 */
function displayVersionInfo(currentEdition) {
    let correctedHref = document.location.href.replace(
        "/editions/" + currentEdition + "/", "/editions/" + currentVersionNum + "/"
    );
    let versionMsg = translationData[activeLocale].versionNoticeText.replace("%s", correctedHref); // Corrected placeholder usage.
    if (currentEdition !== currentVersionNum) { // Check for strict inequality.
        displayMessage('<p class="inner info_bubble">' + versionMsg + '</p>'); // Use the modified message.
    }
}

/**
 * Adds a navigation link to the previous page in the sidebar.
 * If no previous page is found, a disabled placeholder is shown.
 */
function insertPreviousLink() {
    const previousUrl = jQ("link[rel='prev']").attr("href"); // Use attribute selector.
    if (previousUrl) {
        jQ(".sidebar").append(
            "<h3><a href='" + previousUrl + "'>" + translationData[activeLocale].prevChapter + "</a></h3>" // Updated translation key.
        );
    } else {
        jQ(".sidebar").append(
            "<h3 class='disabled'>" + translationData[activeLocale].prevChapter + "</h3>" // Updated translation key.
        );
    }
}

/**
 * Adds a navigation link to the next page in the sidebar.
 * If no next page is found, a disabled placeholder is shown.
 */
function insertNextLink() {
    const nextUrl = jQ("link[rel='next']").attr("href"); // Use attribute selector.
    if (nextUrl) {
        jQ(".sidebar").append(
            "<h3><a href='" + nextUrl + "'>" + translationData[activeLocale].nextChapter + "</a></h3>" // Updated translation key.
        );
    } else {
        jQ(".sidebar").append(
            "<h3 class='disabled'>" + translationData[activeLocale].nextChapter + "</h3>" // Updated translation key.
        );
    }
}

/**
 * Generates and appends a dynamic table of contents to the sidebar based on heading elements.
 */
function generateTableOfContents() {
    let currentDepth = 0;
    let tocHtml = "";
    // Select elements with an ID that are not empty string.
    jQ("*[id!='']").each(function(indexPos) {
        const elementId = jQ(this).attr("id");
        const nodeType = jQ(this)[0].nodeName;
        const elementText = jQ(this).text();
        // Only process H1-H6 headings.
        if (nodeType.length !== 2 || nodeType.slice(0, 1) !== "H") {
            return;
        }
        const newDepth = parseInt(nodeType.slice(1, 2)); // Convert heading level to number.
        if (newDepth > currentDepth) {
            tocHtml += "<ul>";
        } else if (newDepth < currentDepth) {
            tocHtml += "</li></ul></li>";
        } else {
            tocHtml += "</li>";
        }
        tocHtml += "<li><a href='#" + elementId + "'>" + elementText + "</a>";
        currentDepth = newDepth;
    });
    tocHtml += "</li></ul>"; // Close any remaining lists.
    jQ(".sidebar").append("<h3>Contents</h3>");
    jQ(".sidebar").append(tocHtml);
}

/**
 * Iterates through defined routing rules and executes the matching handler function.
 */
function processRouting() {
    for (let ruleIdx = 0; ruleIdx < routingRules.length; ruleIdx++) {
        const urlMatches = document.location.href.match(routingRules[ruleIdx][0]);
        if (urlMatches) {
            window[routingRules[ruleIdx][1]](urlMatches);
            break; // Stop after the first match.
        }
    }
}

/**
 * Handler for pages within an "edition" structure.
 * @param {Array<string>} matchDetails - Regex match results from the URL.
 */
function processEditionPage(matchDetails) {
    const specificEdition = matchDetails[1];
    const pageLanguage = supportedLocales[matchDetails[2]];
    const currentPage = matchDetails[3];
    const editionDescription = translationData[activeLocale].version + " " + specificEdition + " (" + pageLanguage + ")"; // Updated translation key.
    updateLogoLink("../index.html");
    displayVersionInfo(specificEdition);
    jQ(".sidebar").append("<h3><a href='../index.html'>" + translationData[activeLocale].homepage + "</a></h3>"); // Updated translation key.
    if (currentPage === "index") {
        jQ(".sidebar").append(
            "<h3>" + editionDescription + "</h3>"
        );
    } else {
        jQ(".sidebar").append(
            "<h3><a href='index.html'>Table of Contents</a></h3>"
        );
    }
    insertPreviousLink();
    insertNextLink();
    generateTableOfContents();
}

/**
 * Handler for pages within a "draft" or "community" structure.
 * @param {Array<string>} matchDetails - Regex match results from the URL.
 */
function processDraftPage(matchDetails) {
    const currentPage = matchDetails[1];
    updateLogoLink("../index.html");
    displayDraftWarning();
    jQ(".sidebar").append("<h3><a href='../index.html'>" + translationData[activeLocale].homepage + "</a></h3>"); // Updated translation key.
    if (currentPage === "index") {
        jQ(".sidebar").append(
            "<h3>" + translationData[activeLocale].communityVersion + "</h3>" // Updated translation key.
        );
    } else {
        jQ(".sidebar").append(
            "<h3><a href='index.html'>Table of Contents</a></h3>"
        );
    }
    insertPreviousLink();
    insertNextLink();
    generateTableOfContents();
}

/**
 * Handler for the main index page.
 * @param {Array<string>} matchDetails - Regex match results from the URL.
 */
function processHomePage(matchDetails) {
    updateLogoLink("index.html");
}

/**
 * Wraps elements with an ID (excluding figures) in an anchor tag for direct linking.
 */
function createAnchorLinks() {
    jQ("*[id!='']:not(.figure)").wrap(function() {
        return "<a class='anchor' href='#" + jQ(this).attr("id") + "' />";
    });
}

/**
 * Segments the main content area into individual <section> elements based on anchor points.
 */
function segmentContent() {
    const $mainContent = jQ(".content");
    const $contentSections = jQ("<div/>");
    const $contentAnchors = $mainContent.find("a.anchor");
    let currentSectionIdx = -1;

    // Create a section for each anchor.
    $contentAnchors.each(function(idx) {
        $contentSections.append("<section/>");
    });

    // Distribute children of the main content into the new sections.
    $mainContent.children().each(function(idx, element) {
        const $currentElement = jQ(element);
        let $targetSection;
        if ($currentElement.hasClass("anchor")) {
            currentSectionIdx++;
        }
        $targetSection = $contentSections.find("section").eq(currentSectionIdx) || $contentSections;
        $targetSection.append($currentElement.clone());
    });
    $mainContent.html($contentSections); // Replace original content with segmented content.
}

/**
 * Initializes the 'sausage' plugin for scroll progress indication.
 * Requires at least one 'section' element to be present.
 */
function initializeScrollProgress() {
    if (jQ("section").length < 1) {
        return; // No sections, no need for sausage.
    }
    jQ(window).sausage({
        page: "section",
        content: function(index, $pageElement) {
            return "<span class='sausage-span'>" +
                $pageElement.find(".anchor").first().text() +
                "</span>";
        }
    });
}

/**
 * Determines the active locale from the URL, defaulting to 'en'.
 */
function determineLocale() {
    const urlMatch = document.location.href.match(routingRules[0][0]);
    if (urlMatch && urlMatch.length > 2) {
        activeLocale = urlMatch[2];
    } else {
        activeLocale = "en";
    }
}

/**
 * Sends page view and link tracking data to the Piwik analytics server.
 * Includes a noscript fallback for tracking.
 */
function sendAnalytics() {
    try {
        const piwikTracker = Piwik.getTracker(analyticsEndpoint + "piwik.php", 6);
        piwikTracker.trackPageView();
        piwikTracker.enableLinkTracking();
    } catch (error) {
        // Analytics tracking might fail if Piwik is blocked or not loaded.
    }
    jQ("body").append('<noscript><p><img src="http://stats.benjamin-erb.de/piwik/piwik.php?idsite=6" style="border:0" alt="" /></p></noscript>');
}

/**
 * Handles keyboard events for page navigation (left/right arrow keys).
 * Navigates to previous/next page based on 'link rel' attributes.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleNavigationKeys(event) {
    const navLinks = document.getElementsByTagName("link");
    if (event.keyCode === 37) { // Left arrow key.
        if (navLinks.length > 1 && navLinks[1].href) { // Check if 'prev' link exists.
            location.href = navLinks[1].href;
        }
    }
    if (event.keyCode === 39) { // Right arrow key.
        if (navLinks.length > 2 && navLinks[2].href) { // Check if 'next' link exists.
            location.href = navLinks[2].href;
        }
    }
}

// Ensure all DOM manipulation and script execution happens after the document is ready.
// This uses a traditional event assignment, similar to the original 'document.onready'.
window.onload = function() {
    // Attach keydown listener for navigation.
    document.documentElement.addEventListener("keydown", handleNavigationKeys, true);
    try {
        verifyStatus(); // Check if processing has already occurred.
        markProcessed(); // Mark the document as being processed.
        determineLocale(); // Set the current language.
        applyLayout(); // Apply the page template.
        processRouting(); // Handle URL-based content building.
        createAnchorLinks(); // Add anchor links to headings.
        segmentContent(); // Break content into sections.
        sendAnalytics(); // Send tracking data.
        initializeScrollProgress(); // Set up scroll progress indicator.
    } catch (processingError) {
        // An error occurred during page setup, likely already processed.
        // This catch block prevents script from halting.
    }
};