(function (globalScope) {

    let displayImageByWidth = function () {
        const viewportWidth = globalScope.document.documentElement.clientWidth;
        const largeScreenBuffer = 200;

        const mediaImages = Array.from(globalScope.document.querySelectorAll('img[srcset]'));

        mediaImages.forEach(function (currentImageElement) {
            const rawSrcsetString = currentImageElement.getAttribute('srcset');

            const candidateSources = rawSrcsetString.split(',')
                .map(entry => entry.trim().split(/\s+/))
                .map(parts => ({
                    sourceUrl: parts[0],
                    sourceWidth: parts[1] === undefined ? Infinity : parseInt(parts[1], 10)
                }))
                .sort((a, b) => a.sourceWidth - b.sourceWidth);

            let largestKnownWidth = 0;
            const infinityCandidate = candidateSources.find(s => s.sourceWidth === Infinity);

            if (candidateSources.length > 0) {
                largestKnownWidth = candidateSources
                    .filter(s => s.sourceWidth !== Infinity)
                    .reduce((max, s) => Math.max(max, s.sourceWidth), 0);
            }

            let finalImageUrl = '';

            const fittingCandidates = candidateSources.filter(s => s.sourceWidth <= viewportWidth && s.sourceWidth !== Infinity);

            if (fittingCandidates.length > 0) {
                finalImageUrl = fittingCandidates[fittingCandidates.length - 1].sourceUrl;
            }

            if (infinityCandidate && viewportWidth > (largestKnownWidth + largeScreenBuffer)) {
                finalImageUrl = infinityCandidate.sourceUrl;
            }

            currentImageElement.src = finalImageUrl;
        });
    };

    const eventManager = function (element, eventName, handlerCallback, remove = false) {
        if (eventName === "DOMContentLoaded" && element.attachEvent) {
            return;
        }

        if (element.addEventListener) {
            if (remove) {
                element.removeEventListener(eventName, handlerCallback, false);
            } else {
                element.addEventListener(eventName, handlerCallback, false);
            }
        } else if (element.attachEvent) {
            const ieEventName = 'on' + eventName;
            if (remove) {
                element.detachEvent(ieEventName, handlerCallback);
            } else {
                element.attachEvent(ieEventName, handlerCallback);
            }
        }
    };

    eventManager(globalScope, "resize", displayImageByWidth);

    const domReadyHandler = function () {
        displayImageByWidth();
        eventManager(globalScope, "load", displayImageByWidth, true);
    };

    eventManager(globalScope, "DOMContentLoaded", domReadyHandler);
    eventManager(globalScope, "load", displayImageByWidth);

})(this);