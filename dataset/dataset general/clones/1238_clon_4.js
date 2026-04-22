(function() {
    'use strict';

    const inquireAncestry = (currentPoint, pattern) => {
        let currentParent = currentPoint.parentElement;
        while (currentParent) {
            if (currentParent.matches(pattern)) {
                return true;
            }
            currentParent = currentParent.parentElement;
        }
        return false;
    };

    const obtainStyle = (subject, characteristic) => {
        return window.getComputedStyle(subject).getPropertyValue(characteristic);
    };

    const obtainAttribute = (subject, characteristic) => {
        return subject.getAttribute(characteristic);
    };

    const assignAttribute = (subject, characteristic, importance) => {
        subject.setAttribute(characteristic, importance);
    };

    const discardAttributes = (subject, characteristics) => {
        characteristics.forEach(attr => subject.removeAttribute(attr));
    };

    const encaseElement = (subject, exteriorTag, exteriorClass) => {
        const exteriorContainer = document.createElement(exteriorTag);
        exteriorContainer.className = exteriorClass;
        subject.parentNode.insertBefore(exteriorContainer, subject);
        exteriorContainer.appendChild(subject);
        return exteriorContainer;
    };

    const injectStylesheet = (uniqueIdentifier, styleRules) => {
        if (!document.getElementById(uniqueIdentifier)) {
            const documentHead = document.head || document.getElementsByTagName('head')[0];
            const styleElement = document.createElement('style');
            styleElement.id = uniqueIdentifier;
            styleElement.textContent = styleRules;
            documentHead.appendChild(styleElement);
        }
    };

    const identifyElements = (contextualBase, queryPattern) => {
        return contextualBase.querySelectorAll(queryPattern);
    };

    const normalizeTargets = (input) => {
        if (!input) return [];
        if (input instanceof NodeList || input instanceof HTMLCollection) {
            return Array.from(input);
        }
        if (Array.isArray(input)) {
            return input;
        }
        if (input.nodeType === 1) {
            return [input];
        }
        return [];
    };

    const adaptMediaContainers = (targetElements, externalOptions) => {
        const configuration = {
            additionalInclusions: null,
            exclusionCriteria: null
        };

        if (externalOptions) {
            Object.assign(configuration, externalOptions);
        }

        injectStylesheet('aspect-ratio-style', '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}');

        const processingTargets = normalizeTargets(targetElements);

        processingTargets.forEach(currentContainer => {
            if (!currentContainer || currentContainer.nodeType !== 1) return;

            let primarySelectors = [
                'iframe[src*="player.vimeo.com"]',
                'iframe[src*="youtube.com"]',
                'iframe[src*="youtube-nocookie.com"]',
                'iframe[src*="kickstarter.com"][src*="video.html"]',
                'object',
                'embed'
            ];

            if (configuration.additionalInclusions) {
                primarySelectors.push(configuration.additionalInclusions);
            }

            let exclusionPattern = '.responsive-media-ignore';
            if (configuration.exclusionCriteria) {
                exclusionPattern += ', ' + configuration.exclusionCriteria;
            }

            let potentialMedia = Array.from(identifyElements(currentContainer, primarySelectors.join(',')));

            let eligibleMedia = potentialMedia.filter(mediaItem => {
                if (mediaItem.matches(exclusionPattern) || inquireAncestry(mediaItem, exclusionPattern)) {
                    return false;
                }
                if (mediaItem.tagName.toLowerCase() === 'object' && mediaItem.parentElement && mediaItem.parentElement.tagName.toLowerCase() === 'object') {
                    return false;
                }
                return true;
            });

            eligibleMedia.forEach(mediaUnit => {
                if ((mediaUnit.tagName.toLowerCase() === 'embed' && mediaUnit.parentElement && mediaUnit.parentElement.tagName.toLowerCase() === 'object') || (mediaUnit.parentElement && mediaUnit.parentElement.classList.contains('fluid-width-video-wrapper'))) {
                    return;
                }

                const hasNoAttrHeight = isNaN(parseInt(obtainAttribute(mediaUnit, 'height'), 10));
                const hasNoAttrWidth = isNaN(parseInt(obtainAttribute(mediaUnit, 'width'), 10));
                const hasNoComputedHeight = !obtainStyle(mediaUnit, 'height') || parseInt(obtainStyle(mediaUnit, 'height'), 10) === 0;
                const hasNoComputedWidth = !obtainStyle(mediaUnit, 'width') || parseInt(obtainStyle(mediaUnit, 'width'), 10) === 0;

                if ((hasNoComputedHeight && hasNoComputedWidth) && (hasNoAttrHeight || hasNoAttrWidth)) {
                    assignAttribute(mediaUnit, 'height', 9);
                    assignAttribute(mediaUnit, 'width', 16);
                }

                const mediaTag = mediaUnit.tagName.toLowerCase();

                const determinedHeight = (mediaTag === 'object' || (obtainAttribute(mediaUnit, 'height') && !isNaN(parseInt(obtainAttribute(mediaUnit, 'height'), 10))))
                    ? parseInt(obtainAttribute(mediaUnit, 'height'), 10)
                    : parseInt(obtainStyle(mediaUnit, 'height'), 10);

                const determinedWidth = (!isNaN(parseInt(obtainAttribute(mediaUnit, 'width'), 10)))
                    ? parseInt(obtainAttribute(mediaUnit, 'width'), 10)
                    : parseInt(obtainStyle(mediaUnit, 'width'), 10);

                const proportionalRatio = determinedHeight / determinedWidth;

                if (!obtainAttribute(mediaUnit, 'id')) {
                    const uniqueIdentifier = 'mediaAdapt' + Math.floor(Math.random() * 999999);
                    assignAttribute(mediaUnit, 'id', uniqueIdentifier);
                }

                const containerWrapper = encaseElement(mediaUnit, 'div', 'fluid-width-video-wrapper');
                containerWrapper.style.paddingTop = (proportionalRatio * 100) + '%';

                discardAttributes(mediaUnit, ['height', 'width']);
            });
        });
    };

    window.ResponsiveMediaAdapter = adaptMediaContainers;

})();