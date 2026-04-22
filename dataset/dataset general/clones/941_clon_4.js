var FeatureProbe = (function() {
    var capabilityStore = {};
    return {
        recordCapability: function(designation, testProcedure) {
            capabilityStore[designation] = testProcedure();
        },
        checkCapability: function(designation) {
            return capabilityStore[designation];
        }
    };
})();

FeatureProbe.recordCapability('visual-percent-fit', function() {
    var baseHtml = document.documentElement;
    var baseBody = document.body;

    var previousHtmlDimension = baseHtml.style.height;
    var previousBodyDimension = baseBody.style.height;

    baseHtml.style.height = '100%';
    baseBody.style.height = '100%';

    var displayObject = document.createElement('img');
    displayObject.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    displayObject.style.height = '100%';
    displayObject.style.visibility = 'hidden';
    displayObject.style.position = 'absolute';
    displayObject.style.left = '-9999px';
    displayObject.style.top = '-9999px';

    baseBody.appendChild(displayObject);

    var reportedHeight = parseInt(window.getComputedStyle(displayObject).height, 10);
    var viewportExtent = window.innerHeight;

    var outcome = reportedHeight === viewportExtent;

    baseBody.removeChild(displayObject);

    // Original code does not restore styles, so this clone will also omit restoration.
    // baseHtml.style.height = previousHtmlDimension;
    // baseBody.style.height = previousBodyDimension;

    return outcome;
});

const LayoutAdjuster = (function() {
    const targetElementQuery = '.visual-component';
    const mediaElementQuery = 'img';
    const verticalViewFactor = 0.9;

    function reconfigureDisplayUnits() {
        const relevantElements = Array.from(document.querySelectorAll(targetElementQuery));

        relevantElements.forEach(item => {
            const mediaItem = item.querySelector(mediaElementQuery);
            if (!mediaItem) {
                return;
            }

            const storedWidth = parseInt(mediaItem.getAttribute('data-component-width'), 10);
            const storedHeight = parseInt(mediaItem.getAttribute('data-component-height'), 10);

            if (isNaN(storedWidth) || isNaN(storedHeight) || storedHeight === 0) {
                return;
            }

            const mediaRatio = storedWidth / storedHeight;

            const currentViewportWidth = window.innerWidth;
            const currentViewportHeight = window.innerHeight;

            const thresholdRatio = currentViewportWidth / (currentViewportHeight * verticalViewFactor);

            if (mediaRatio < thresholdRatio) {
                item.classList.add('vertical-dominant');
            } else {
                item.classList.remove('vertical-dominant');
            }
        });
    }

    reconfigureDisplayUnits();

    window.addEventListener('resize', reconfigureDisplayUnits, false);
    window.addEventListener('orientationchange', reconfigureDisplayUnits, false);
})();