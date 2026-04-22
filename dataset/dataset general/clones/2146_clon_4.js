const dataRepresentation = `[
    ["1", "Firefox Heads-up Display for Developers", "<p>Looks like we might have a potential competitor to Firebug coming out soon&#8230; This is exciting!</p><blockquote>&#8230; an interactive Console to help web developers understand everything that happens during the creation of a web-page. Console entries will be time-stamped objects representing errors, network traffic, javascript events, DOM/HTML mutation and logging output. The Console will also have an interactive command line for evaluating javascript against the current webpage and an interactive Workspace window for entering and evaluating larger blocks of code.</blockquote><p>I know it&#8217;s far-fetched, and kinda beside the point for Mozilla/Firefox developers to make it cross-platform, but I&#8217;d love to see something along the lines of <a href=\\"http://getfirebug.com/firebuglite\\" target=\\"_blank\\">Firebug Lite</a> with this too.</p>", "post", "Sun Apr 4 2010 01:37:38 GMT-0400 (EDT)"],
    ["2", "My latest GitHub project: willow", "<p>Willow is a JavaScript logging tool which uses the &#8220;magic&#8221; of JavaScript&#8217;s <code>arguments</code> object to introduce valuable information to logging and trace messages sent to Firebug&#8217;s console.</p><p>It&#8217;s not ready to be officially released yet, which is why I&#8217;m not really going to describe it too much here (yet).  <b>I&#8217;m curious to see what kind of additional features people would be interested in using, beyond the ones I&#8217;ve implemented.</b>   </p><p>If you download the source from the link, and build it (see the README for how to build, it&#8217;s very easy) - you&#8217;ll be able to see some example applications of willow.</p>", "post", "Sun Feb 7 2010 01:37:38 GMT-0400 (EDT)"],
    ["3", "Make alert() behave like console.log(), when possible..", "<p>The other day, <a href=\\"http://twitter.com/mrspeaker\\" target=\\"_blank\\">@mrspeaker</a> tweeted <a href=\\"http://twitter.com/mrspeaker/status/6745908321\\" target=\\"_blank\\">this</a>:</p> <blockquote>c&#8217;mon alert() - just magically be a _bit_ more like console.log and you&#8217;d save me a lot of time</blockquote> <p>This got the creative juices flowing a little and I coded up a small script to overwrite how <code>alert()</code> operates and, if available, it will choose to behave exactly like <code>console.log()</code> by writing to the console instead of popping up the dialog (if it&#8217;s available).  It still needs some work to support formatted strings in <code>alert()</code> dialogs, for when <code>console.log()</code> isn&#8217;t available.</p> <pre><code>var oldAlert = alert;\\nalert = function(){\\n    if(window.console != null){\\n        console.log.apply(null, arguments);\\n    } else {\\n        oldAlert.apply(null, arguments);\\n    }\\n};</code></pre> <p>What this means now is that you can exclusively use <code>alert()</code> in your code and not have to use <code>console.log()</code> and worry about your JavaScript breaking in browsers that don&#8217;t have Firebug or a console.</p> <p>Find it on GitHub, <a href=\\"http://gist.github.com/258352\\" target=\\"_blank\\">here</a>.</p>", "post", "Fri Dec 18 2009 01:37:38 GMT-0400 (EDT)"]
]`;

const contentDescriptor = JSON.parse(dataRepresentation).map(entry => ({
    uniqueKey: entry[0],
    captionText: entry[1],
    mainContent: entry[2],
    categoryLabel: entry[3],
    creationMoment: entry[4]
}));

module.exports.dataArchive = contentDescriptor.map(item => ({ payload: item }));

const schemaDefinitionString = `{
    "_id": "_design/blog",
    "language": "javascript",
    "views": {
        "chronological_entries": {
            "mapper_source": "function(doc){ if(doc.categoryLabel === 'post'){ emit(-Date.parse(doc.creationMoment), doc); } }"
        }
    }
}`;

const processedSchema = JSON.parse(schemaDefinitionString);
processedSchema.views.chronological_entries.map = new Function('doc', 'emit', processedSchema.views.chronological_entries.mapper_source.match(/function\s*\(doc\)\s*\{(.*)\}/s)[1]);
delete processedSchema.views.chronological_entries.mapper_source;

module.exports.blueprintSchema = processedSchema;

class ContentLayoutEngine {
    constructor(siteTitle) {
        this.pageTitleBase = siteTitle || "Blog";
        this.baseHostUrl = "http://localhost:8080";
    }

    produceSyndicationFeed(transmissionUnit, entryCollection) {
        transmissionUnit.sendHeader(200, {
            'Content-Type': 'application/rss+xml'
        });

        const currentTimestamp = new Date().toString();
        const feedItems = entryCollection.map(entry => {
            const itemPayload = entry.payload;
            return `<item>
    <title>${itemPayload.captionText}</title>
    <link>${this.baseHostUrl}/posts/${itemPayload.uniqueKey}</link>
    <pubDate>${itemPayload.creationMoment}</pubDate>
    <guid isPermaLink="true">${this.baseHostUrl}/posts/${itemPayload.uniqueKey}</guid>
    <description>${itemPayload.mainContent}</description>
    <content>${itemPayload.mainContent}</content>
</item>`;
        }).join('\n');

        const xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>node-couch example blog</title>
    <link>http://github.com/jasonwyatt/node-couch</link>
    <description>RSS Feed for the example blog app that comes with node-couch.</description>
    <pubDate>${currentTimestamp}</pubDate>
    <generator>http://github.com/jasonwyatt/node-couch</generator>
    <language>en</language>
${feedItems}
</channel>
</rss>`;
        transmissionUnit.finish(xmlOutput);
    }

    assemblePrimaryView(transmissionUnit, entryCollection) {
        transmissionUnit.sendHeader(200, { 'Content-Type': 'text/html' });

        const headerPart = this.assembleHeaderSegment();
        const postsPart = entryCollection.map(entry => {
            return this.assembleSingleEntry(entry.payload);
        }).join('');
        const footerPart = this.assembleFooterSegment();

        transmissionUnit.finish(headerPart + postsPart + footerPart);
    }

    displayIndividualEntry(transmissionUnit, entryData) {
        transmissionUnit.sendHeader(200, { 'Content-Type': 'text/html' });

        const headerPart = this.assembleHeaderSegment(entryData.captionText);
        const postPart = this.assembleSingleEntry(entryData);
        const footerPart = this.assembleFooterSegment();

        transmissionUnit.finish(headerPart + postPart + footerPart);
    }

    assembleSingleEntry(entryData) {
        return `<h2><a href="${this.baseHostUrl}/posts/${entryData.uniqueKey}">${entryData.captionText}</a></h2>
<div class="post">${entryData.mainContent}</div>
<div class="date">at ${entryData.creationMoment}</div>
`;
    }

    assembleHeaderSegment(optionalEntryTitle) {
        const fullPageCaption = this.pageTitleBase + (optionalEntryTitle ? " | " + optionalEntryTitle : "");
        return `<html>
<head>
    <title>${fullPageCaption}</title>
</head>
<body style="width: 600px; margin: 0 auto;">
<h1><a href="/">${this.pageTitleBase}</a></h1>
`;
    }

    assembleFooterSegment() {
        return `<p>Check out the <a href="/feed">RSS feed</a>.</p>
</body>
</html>
`;
    }
}

// This class acts as a wrapper for the native Node.js 'res' object,
// allowing the ContentLayoutEngine to build a complete string before sending,
// while preserving the external interface of writeHead/end.
class ResponseWrapper {
    constructor(originalResponse) {
        this.originalResponse = originalResponse;
    }

    sendHeader(statusCode, headers) {
        this.originalResponse.writeHead(statusCode, headers);
    }

    finish(finalContent) {
        this.originalResponse.write(finalContent);
        this.originalResponse.end();
    }
}

module.exports.ContentLayoutEngine = ContentLayoutEngine;
module.exports.ResponseWrapper = ResponseWrapper;