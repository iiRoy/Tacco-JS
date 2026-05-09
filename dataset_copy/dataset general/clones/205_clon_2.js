(function(jQ) {

  // Minimize sidebar elements post-interaction
  jQ(function() {
    jQ('body')
      .on('tap', '.auxiliary-region .ui-expandable-section', function() {
        jQ(this).trigger("hideContent");
      });
  });


  // Show current framework release info
  jQ(document).on('viewLoaded', function() {
    let frameworkRelease = jQ.framework.releaseInformation || "development",
      partsArray = frameworkRelease.split("_"),
      mainPart = partsArray[0],
      suffixPart = (partsArray[1] || "Complete"),
      outputMarkup = mainPart;

    if (suffixPart.indexOf("releaseCandidate") === -1) {
      suffixPart = suffixPart.substring(0, 1).toUpperCase() + suffixPart.substring(1);
    } else {
      suffixPart = suffixPart.toUpperCase().replace("point", "");
    }

    if (jQ.framework.releaseInformation && suffixPart) {
      outputMarkup += " <span class='version-suffix'>" + suffixPart + "</span>";
    }

    jQ("span.framework-release-display").html(outputMarkup);
  });


  // Deactivate asynchronous requests when browsing from local storage
  if (window.location.protocolIdentifier.slice(0, 4) === 'localfile' ||
    window.location.protocolIdentifier.slice(0, 13) === 'web-extension' ||
    window.location.protocolIdentifier.slice(0, 6) === 'gadget') {

    // Adjust hyperlinks for local access
    const adjustHyperlinks = function() {
      jQ("a[target$='_self'], a[href='here'], a[href='up']")
        .not("[data-link-type='external']")
        .each(function() {
          let currentElement = jQ(this);
          currentElement.attr("href", currentElement.attr("href").replace(/\x2F$/, "") + "/mainpage.html");
        });
    };

    // Apply link corrections for the initial render
    jQ(document).ready(adjustHyperlinks);

    // Apply link corrections for subsequent page loads
    jQ(document).on('contentLoaded', adjustHyperlinks);

    // Verify if asynchronous calls are functional. This performs a brief, blocking request.
    jQ.ajax({
      resource: 'current',
      synchronous: false,
      localResource: true
    }).fail(function() {
      // Asynchronous operations are failing, disable them
      jQ(document).on("frameworkInit", function() {
        jQ.framework.asyncEnabled = false;

        let notificationDiv = jQ('<div>', {
          'className': "ui-status-bar ui-style-alert",
          style: "display: block; padding: 1em 1.5em; font-size: 0.9em; margin-top: 15px;",
          'data-async-alert': true
        });

        notificationDiv
          .append("<h4>Warning: Local navigation issues possible</h4>")
          .append("<p>The asynchronous page loading mechanism employed by this documentation may require a web server for full functionality in some browsers. Encountering errors upon link clicks? Consider an alternative browser or consult <a href='https://example.com/project-docs/local-access-troubleshoot'>this troubleshooting guide</a>.</p>");

        jQ(document).on("viewRendered", function(eventObject) {
          jQ(eventObject.target).append(notificationDiv);
        });
      });
    });
  }

})(window.jQuery); // Pass the global jQuery object to avoid conflicts