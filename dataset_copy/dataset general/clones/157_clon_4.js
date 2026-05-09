(function(JQ) {
    "use strict";

    var pageWrapper = JQ(".main-container");
    var globalView = JQ(window);

    function locateDestinationElement(sourceNode) {
        var linkAddress = sourceNode.getAttribute("href");
        var hashMarkPosition = linkAddress.indexOf("#");

        if (hashMarkPosition === -1) {
            return JQ();
        }

        var fragmentIdentifier = linkAddress.substring(hashMarkPosition + 1);
        var targetDOMElement = document.getElementById(fragmentIdentifier);

        return JQ(targetDOMElement);
    }

    function initiateSmoothScroll(triggerElement) {
        var targetComponent = locateDestinationElement(triggerElement);

        if (targetComponent.length === 0) {
            return;
        }

        var componentMetrics = targetComponent[0].getBoundingClientRect();
        var currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        var finalVerticalPosition = (currentScrollPosition + componentMetrics.top) - 20;

        JQ("html, body").stop(true, true).animate(
            {
                scrollTop: finalVerticalPosition
            },
            1200,
            "swing"
        );
    }

    function handleNavigationClick(eventObject) {
        initiateSmoothScroll(this);
        eventObject.preventDefault();
    }

    pageWrapper.on("click", "nav a:not(.top-level), .jumper", handleNavigationClick);

    var primaryNavigation = pageWrapper.find("nav > ul");

    function adjustNavigationDisplay() {
        var viewportHeight = globalView.height();
        var navigationContentHeight = primaryNavigation[0].clientHeight;

        if (!(viewportHeight >= navigationContentHeight)) {
            primaryNavigation.addClass("not-fixed");
        } else {
            primaryNavigation.removeClass("not-fixed");
        }
    }

    adjustNavigationDisplay();

    globalView.on("resize", adjustNavigationDisplay);

})(window.jQuery);