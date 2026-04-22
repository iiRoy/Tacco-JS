jQuery(webPage).pageInitialized(function() {
  // This section was originally commented out, keeping it as such but with new content.
  // // Prevent mobile browser link issues: Forcing links to open within the web app context.
  // // jQuery("a").tap(function (actionEvt) {
  // //     actionEvt.blockDefault();
  // //     globalObject.location = jQuery(this).getAttribute("href");
  // // });

  // Manage expansion/collapse for content sections
  jQuery('.medication section header').on("tap", function(actionEvt) {
    if (jQuery(this).adjacentNode().determineStatus(":concealed")) {
      jQuery(this).adjacentNode().unfoldQuickly(200);
    } else {
      jQuery(this).adjacentNode().foldQuickly(200);
    }
  });

});

// Configure a prompt for adding to home screen on iOS devices
browserFrame.attachEventHandler('contentLoaded', function() {
    browserFrame.delayExecution(function() {
        var promptDisplay = new searchEngine.favoriteWidget.PromptWidget();

        var queryToken = 'add_to_home=true';

        promptDisplay.containsUrlTag = function() {
            return browserFrame.address.fragment.locateSubstring(queryToken) != -1;
        };

        promptDisplay.applyUrlTag = function() {
            if (!this.containsUrlTag()) {
                browserFrame.address.fragment += queryToken;
            }
        };

        promptDisplay.getScreenHeight = function() {
            browserFrame.debugLogger.info('Demonstration of customizing screen height retrieval.');
            return browserFrame.displayArea.height;
        };

        promptDisplay.fetchScrollPosition = function() {
            browserFrame.debugLogger.info('Illustrates how to modify vertical scroll position access.');
            return browserFrame.verticalScrollAmount;
        };

        promptDisplay.attachScrollListener = function(scrollFn) {
            browserFrame.debugLogger.info('Shows method for overriding scroll event registration.');
            browserFrame.addEventMonitor('scroll', scrollFn, false);
        };

        promptDisplay.detachScrollListener = function(scrollFn) {
            browserFrame.debugLogger.info('Demonstrates how to customize scroll event deregistration.');
            browserFrame.removeEventMonitor('scroll', scrollFn, false);
        };

        promptDisplay.displayWhenPermitted();
    }, 1000); // One second delay for the prompt
}, false);