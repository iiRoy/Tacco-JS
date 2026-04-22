/**
 * This module exports initial blog content and a CouchDB design document configuration.
 * It also provides a utility class, `ContentDisplayHandler`, responsible for rendering
 * web pages and RSS feeds based on blog entry data.
 * The original content data is adapted from http://jwf.us, with permission from Jason Feinstein.
 */

/**
 * @type {Array<Object>}
 * An array containing predefined blog entry objects to serve as seed data for the application.
 * Each object represents a distinct blog post with various metadata.
 */
exports.initialBlogEntries = [
    {
        // Unique identifier for this particular blog entry.
        entryId: 'post_alpha_001',
        // The main headline or title of the blog post.
        headline: 'Exploring Advanced Developer Consoles in Modern Browsers',
        // The full HTML content of the blog post.
        contentHtml: '<p>A groundbreaking new competitor to established debugging tools like Firebug is on the horizon, promising to revolutionize web development workflows. This is indeed a thrilling prospect for the developer community!</p><blockquote>This forthcoming console offers a fully interactive environment designed to provide deep insights into every event that transpires during the lifecycle of a web page. Its features include time-stamped logs for errors, network requests, JavaScript execution, DOM modifications, and custom logging output. Additionally, it will integrate an interactive command-line interface for real-time JavaScript evaluation, alongside a dedicated workspace for developing and testing larger code snippets.</blockquote><p>While the primary focus for its developers (likely within the Mozilla/Firefox ecosystem) isn\'t broad cross-platform compatibility, a streamlined "lite" version, akin to <a href="http://getfirebug.com/firebuglite" target="_blank" rel="noopener noreferrer">Firebug Lite</a>, would significantly enhance its accessibility and utility across different browsers.</p>',
        // Categorization of the entry (e.g., 'tech_article', 'announcement').
        entryCategory: 'tech_article',
        // Timestamp indicating when the post was published.
        publicationTimestamp: 'Sun Apr 04 2010 01:37:38 GMT-0400 (EDT)',
        // Optional: The name of the author for this entry.
        authorName: 'Web Innovations Team'
    },
    {
        entryId: 'post_beta_002',
        headline: 'Introducing Project Willow: A JavaScript Logging Evolution',
        contentHtml: '<p>Project Willow is my latest open-source endeavor – a sophisticated JavaScript logging utility. It intelligently utilizes the dynamic capabilities of JavaScript\'s <code>arguments</code> object to embed rich, contextual information directly into log and trace messages, greatly enhancing their diagnostic value within tools like Firebug\'s console.</p><p>Currently, Willow is in an active development phase and not yet ready for its official public release. Consequently, I\'m limiting its detailed description for now. However, I am particularly interested in gathering community feedback: <b>What additional features or functionalities would developers find most useful, beyond what is already implemented?</b> Your insights are invaluable!</p><p>You can access the source code via the provided link. By following the straightforward build instructions in the README, you\'ll be able to explore various practical demonstrations of Willow\'s current capabilities.</p>',
        entryCategory: 'dev_project_update',
        publicationTimestamp: 'Sun Feb 07 2010 01:37:38 GMT-0400 (EDT)',
        // Optional: An array of descriptive tags.
        tags: ['javascript', 'logging', 'open-source', 'tooling']
    },
    {
        entryId: 'post_gamma_003',
        headline: 'Enhancing `alert()` Behavior: A `console.log()` Mimicry',
        contentHtml: '<p>A recent tweet from <a href="http://twitter.com/mrspeaker" target="_blank" rel="noopener noreferrer">@mrspeaker</a> sparked an intriguing idea: <a href="http://twitter.com/mrspeaker/status/6745908321" target="_blank" rel="noopener noreferrer">"c\'mon alert() - just magically be a _bit_ more like console.log and you\'d save me a lot of time"</a>. This inspired a rapid coding session to modify the default behavior of <code>alert()</code>. The resulting script enables <code>alert()</code> to redirect its output to <code>console.log()</code> (if a console is detected), rather than displaying a disruptive modal dialog.</p><p>Further refinement is needed to ensure full support for formatted strings within <code>alert()</code> when a console is unavailable. The overarching goal is to provide a more consistent and less intrusive debugging experience across a wider range of browser environments.</p><pre><code>// Store a reference to the original window.alert function to prevent recursion.\nconst originalWindowAlert = window.alert;\n\n// Override the global alert function with custom logic.\nwindow.alert = function(...messageSegments){\n    // Check for the availability of a browser console and its log method.\n    if (typeof console !== \'undefined\' && console.log) {\n        // If available, redirect the alert arguments to console.log.\n        console.log.apply(console, messageSegments);\n        // Prevent the original alert dialog from appearing.\n        return;\n    }\n    // If no console is found or console.log is missing, fall back to the original alert.\n    originalWindowAlert.apply(window, messageSegments);\n};\n</code></pre><p>This modification empowers developers to use <code>alert()</code> consistently throughout their codebase, mitigating concerns about JavaScript breakage in browsers that lack advanced debugging tools like Firebug or a native console, thereby improving cross-browser compatibility for debugging messages.</p><p>The complete source code for this small utility can be found on GitHub, accessible <a href="http://gist.github.com/258352" target="_blank" rel="noopener noreferrer">here</a>.</p>',
        entryCategory: 'javascript_utility',
        publicationTimestamp: 'Fri Dec 18 2009 01:37:38 GMT-0400 (EDT)',
        // Optional: Indicates if the entry is prominently featured.
        isFeatured: true
    }
];

/**
 * @type {Object}
 * Configuration object defining CouchDB design documents, including views for data indexing.
 */
exports.dbDesignConfig = {
    // The unique identifier for this design document within CouchDB.
    _designId: "_design/blog_application_views",
    // Specifies the language used for view functions.
    scriptingLanguage: "javascript",
    // Defines various data views for querying blog entries.
    dataViews: {
        // A view to list blog entries ordered chronologically (most recent first).
        chronologicalEntries: {
            mapperFunction: function(documentItem){
                // Only process documents categorized as 'blog_post' that have a valid publication timestamp.
                if (documentItem && documentItem.entryCategory === "blog_post" && documentItem.publicationTimestamp) {
                    const parsedDateTime = Date.parse(documentItem.publicationTimestamp); // Parse the date string into a timestamp.
                    if (!isNaN(parsedDateTime)) { // Ensure the parsing was successful.
                        // Emit the document with a negative timestamp to achieve reverse chronological order.
                        // The emitted value is a simplified object containing key entry details.
                        emit(-parsedDateTime, {
                            id: documentItem.entryId,
                            titleText: documentItem.headline,
                            publishedOn: documentItem.publicationTimestamp
                        });
                    }
                }
            }
        },
        // A new view to list all unique categories present in the blog entries.
        uniqueCategories: {
            mapperFunction: function(documentItem) {
                // If a document has an 'entryCategory', emit it as a key for indexing.
                if (documentItem && documentItem.entryCategory) {
                    emit(documentItem.entryCategory, null); // Emit category name, with null value.
                }
            }
        }
    }
};

/**
 * @class ContentDisplayHandler
 * @param {string} siteHeading - The primary title to be displayed across the blog/site. Defaults to "My Weblog".
 * @description
 * This class provides comprehensive functionalities for rendering blog content. It can generate
 * various output formats, including an RSS 2.0 feed, a main index page displaying all blog entries
 * in reverse chronological order, and individual pages for each blog post. It expects blog data
 * to conform to a structure similar to the `initialBlogEntries` provided.
 */
function ContentDisplayHandler(siteHeading) {
    // Initializes the main title for the blog, using a default if none is provided.
    this.mainSiteTitle = siteHeading || "My Dynamic Weblog";
    // Base URL for generating links within the rendered content.
    this.rootUrl = "http://localhost:8080";
    // A small internal counter, perhaps for unique element IDs in future.
    this._renderCounter = 0;
}

ContentDisplayHandler.prototype = {
    /**
     * Generates and writes an RSS 2.0 feed to the response stream.
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     * @param {Array<Object>} blogEntryCollection - A collection of blog entry objects to include in the feed.
     */
    generateRssFeed: function(requestContext, responseStream, blogEntryCollection) {
        // Guard clause: If no entries are provided, send a 204 No Content response.
        if (!Array.isArray(blogEntryCollection) || blogEntryCollection.length === 0) {
            responseStream.writeHead(204, { 'Content-Type': 'text/plain; charset=utf-8' });
            responseStream.end('No content to publish in RSS feed.');
            return;
        }

        responseStream.writeHead(200, {
            'Content-Type': 'application/rss+xml; charset=utf-8'
        });

        const currentTimestamp = new Date().toUTCString(); // Format current date for RSS.
        const blogBaseLink = this.rootUrl; // Retrieve base URL from instance property.

        responseStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
        responseStream.write('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'); // Added atom namespace.
        responseStream.write('<channel>\n');
        responseStream.write(`    <title>${this.mainSiteTitle} - Latest Updates</title>\n`);
        responseStream.write(`    <link>${blogBaseLink}</link>\n`);
        responseStream.write(`    <description>Recent articles and announcements from ${this.mainSiteTitle}.</description>\n`);
        responseStream.write(`    <pubDate>${currentTimestamp}</pubDate>\n`);
        responseStream.write(`    <lastBuildDate>${currentTimestamp}</lastBuildDate>\n`); // Added lastBuildDate.
        responseStream.write('    <generator>Custom Blog Engine v2.1</generator>\n'); // Updated generator info.
        responseStream.write('    <language>en-us</language>\n');
        responseStream.write(`    <atom:link href="${blogBaseLink}/feed" rel="self" type="application/rss+xml" />\n`); // Self-referencing atom link.

        blogEntryCollection.forEach((itemContainer) => { // Iterate over each entry.
            // Extract the actual blog entry data, accounting for potential wrapping (e.g., from CouchDB views).
            const entryData = itemContainer.dataPayload || itemContainer;
            // Basic validation for essential fields before including in feed.
            if (!entryData || !entryData.headline || !entryData.entryId || !entryData.publicationTimestamp || !entryData.contentHtml) {
                // Skip this item if critical data is missing. A more robust system might log this.
                return;
            }

            const entryPermalink = `${blogBaseLink}/articles/${entryData.entryId}`; // Construct entry's permanent link.
            const publishedDateUTC = new Date(entryData.publicationTimestamp).toUTCString(); // Format post date for RSS.

            responseStream.write('<item>\n');
            responseStream.write(`    <title><![CDATA[${entryData.headline}]]></title>\n`); // Use CDATA for title.
            responseStream.write(`    <link>${entryPermalink}</link>\n`);
            responseStream.write(`    <pubDate>${publishedDateUTC}</pubDate>\n`);
            responseStream.write(`    <guid isPermaLink="true">${entryPermalink}</guid>\n`);
            responseStream.write(`    <description><![CDATA[${entryData.contentHtml}]]></description>\n`); // Use CDATA for description.
            responseStream.write('</item>\n');
        });

        responseStream.write('</channel>\n');
        responseStream.write('</rss>\n');
        responseStream.end();
    },

    /**
     * Renders the main blog index page, displaying a list of all blog entries.
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     * @param {Array<Object>} blogEntryCollection - A collection of blog entry objects.
     */
    displayMainIndex: function(requestContext, responseStream, blogEntryCollection) {
        this.composeHtmlHeader(requestContext, responseStream, 'All Posts'); // Render page header.

        if (!Array.isArray(blogEntryCollection) || blogEntryCollection.length === 0) {
            // Display a message if there are no entries to show.
            responseStream.write('<section class="no-content-message"><h3>Currently, there are no blog entries available. Please check back later!</h3></section>\n');
        } else {
            // Iterate and render each individual blog entry snippet.
            blogEntryCollection.forEach((wrappedEntry) => {
                const actualEntry = wrappedEntry.dataPayload || wrappedEntry;
                this._renderEntrySnippet(requestContext, responseStream, actualEntry);
            });
        }

        this.composeHtmlFooter(requestContext, responseStream); // Render page footer.
    },

    /**
     * Renders a dedicated HTML page for a single blog post.
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     * @param {Object} individualEntryData - The specific blog entry object to render.
     */
    showIndividualArticle: function(requestContext, responseStream, individualEntryData) {
        if (!individualEntryData || !individualEntryData.headline) { // Guard for missing or invalid entry data.
            this.composeHtmlHeader(requestContext, responseStream, 'Article Not Found');
            responseStream.write('<section class="error-page"><h1>404 - Article Not Found</h1><p>The requested blog article could not be located or does not exist.</p></section>\n');
            this.composeHtmlFooter(requestContext, responseStream);
            return;
        }
        this.composeHtmlHeader(requestContext, responseStream, individualEntryData.headline); // Header with specific post title.
        this._renderEntrySnippet(requestContext, responseStream, individualEntryData); // Render the full entry.
        this.composeHtmlFooter(requestContext, responseStream); // Render page footer.
    },

    /**
     * Internal helper method to render the HTML structure for a single blog post snippet.
     * @private
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     * @param {Object} entryDetails - The detailed blog entry object.
     */
    _renderEntrySnippet: function(requestContext, responseStream, entryDetails) {
        // Basic validation for critical entry details.
        if (!entryDetails || !entryDetails.entryId || !entryDetails.headline || !entryDetails.contentHtml || !entryDetails.publicationTimestamp) {
            responseStream.write('<div class="render-error"><em>Error: Incomplete entry data provided for rendering.</em></div>\n');
            return;
        }
        const articleLink = `${this.rootUrl}/articles/${entryDetails.entryId}`; // Construct the URL for this article.
        const articleDate = new Date(entryDetails.publicationTimestamp); // Parse the date string.

        responseStream.write('<article class="blog-article">\n'); // Semantic <article> tag.
        responseStream.write(`    <h2 class="article-headline"><a href="${articleLink}">${entryDetails.headline}</a></h2>\n`);
        responseStream.write(`    <div class="article-body">${entryDetails.contentHtml}</div>\n`);
        responseStream.write(`    <footer class="article-meta">Published on: <time datetime="${articleDate.toISOString()}">${articleDate.toLocaleDateString()} at ${articleDate.toLocaleTimeString()}</time></footer>\n`); // Semantic <time> tag.
        responseStream.write('</article>\n');
        this._renderCounter++; // Increment an internal counter (e.g., for analytics or unique IDs).
    },

    /**
     * Composes and writes the common HTML page header, including doctype, meta tags, and main site navigation.
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     * @param {string} [specificPageTitle] - An optional, additional title for the current page.
     */
    composeHtmlHeader: function(requestContext, responseStream, specificPageTitle) {
        responseStream.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8' // Specify UTF-8 charset.
        });

        const completePageTitle = this.mainSiteTitle + (specificPageTitle ? " | " + specificPageTitle : ""); // Construct full page title.
        responseStream.write('<!DOCTYPE html>\n'); // HTML5 doctype.
        responseStream.write('<html lang="en">\n'); // Specify language.
        responseStream.write('<head>\n');
        responseStream.write('    <meta charset="UTF-8">\n'); // Character encoding.
        responseStream.write('    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'); // Responsive design meta tag.
        responseStream.write(`    <title>${completePageTitle}</title>\n`);
        responseStream.write('    <link rel="stylesheet" href="/assets/styles/global.css">\n'); // Link to external CSS stylesheet.
        responseStream.write('</head>\n');
        responseStream.write('<body>\n');
        responseStream.write('<div id="application-wrapper">\n'); // Main application wrapper div.
        responseStream.write('<header class="site-header">\n'); // Semantic <header> tag for site.
        responseStream.write(`    <h1 class="site-logo"><a href="/">${this.mainSiteTitle}</a></h1>\n`);
        responseStream.write('    <nav class="main-navigation">\n'); // Site navigation.
        responseStream.write('        <ul>\n');
        responseStream.write('            <li><a href="/">Home</a></li>\n');
        responseStream.write('            <li><a href="/feed">RSS Feed</a></li>\n');
        responseStream.write('            <li><a href="/about">About</a></li>\n'); // Added an 'About' link.
        responseStream.write('        </ul>\n');
        responseStream.write('    </nav>\n');
        responseStream.write('</header>\n');
        responseStream.write('<main class="content-area">\n'); // Semantic <main> tag for primary content.
    },

    /**
     * Composes and writes the common HTML page footer, including copyright and additional links.
     * @param {Object} requestContext - The HTTP request object.
     * @param {Object} responseStream - The HTTP response stream for output.
     */
    composeHtmlFooter: function(requestContext, responseStream) {
        responseStream.write('</main>\n'); // Close <main> content area.
        responseStream.write('<footer class="site-footer">\n'); // Semantic <footer> tag for site.
        responseStream.write('    <p>Further Reading: <a href="/feed">Subscribe to our RSS feed</a> | <a href="/privacy">Privacy Policy</a></p>\n'); // Updated footer links.
        responseStream.write(`    <p>&copy; ${new Date().getFullYear()} ${this.mainSiteTitle}. All rights reserved.</p>\n`); // Dynamic copyright year.
        responseStream.write('</footer>\n');
        responseStream.write('</div>\n'); // Close #application-wrapper.
        responseStream.write('</body>\n');
        responseStream.write('</html>\n');
        responseStream.end();
    }
};

/**
 * Exports the `ContentDisplayHandler` class, making it available for other modules.
 */
exports.ContentDisplayHandler = ContentDisplayHandler;