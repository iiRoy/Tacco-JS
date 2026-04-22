function mediaLocator(targetNode) {
    const findMediaSource = (rootElement) => {
        let videoElement = rootElement.querySelector('video');
        if (videoElement) {
            let mediaLink = videoElement.src;
            if (!mediaLink) {
                let sourceElement = videoElement.querySelector('source');
                if (sourceElement) {
                    mediaLink = sourceElement.src;
                }
            }
            return mediaLink || null;
        }
        return null;
    };

    let initialSource = findMediaSource(targetNode);
    if (initialSource) {
        return initialSource;
    }

    let alternateScripts = targetNode.querySelectorAll('noscript');
    for (let currentScriptBlock of alternateScripts) {
        try {
            const temporaryHolder = document.createElement('div');
            temporaryHolder.innerHTML = currentScriptBlock.innerHTML;
            let contentString = '';
            if (temporaryHolder.firstChild && temporaryHolder.firstChild.nodeValue) {
                contentString = temporaryHolder.firstChild.nodeValue;
            } else {
                contentString = currentScriptBlock.innerHTML;
            }

            if (contentString) {
                const htmlParser = new DOMParser();
                const parsedContent = htmlParser.parseFromString(contentString, 'text/html');
                let embeddedSource = findMediaSource(parsedContent);
                if (embeddedSource) {
                    return embeddedSource;
                }
            }
        } catch (error) {
            // Silently ignore malformed noscript content
        }
    }
    return null;
}

chrome.runtime.onMessage.addListener(
    function(messagePayload, messageOrigin, respondFunction) {
        const queryIdentifier = "MediaAssetQuery";
        if (messagePayload && messagePayload.query === queryIdentifier) {
            console.info('Media asset query received by content script.');
            const locatedAsset = mediaLocator(document);
            respondFunction({ retrievedAsset: locatedAsset });
            return true;
        }
    }
);

function contentActivationRoutine(initialEvent) {
    const maximumAttempts = 20;
    let currentAttemptCount = 0;
    const evaluationDelay = 111;

    const conductEvaluationCycle = () => {
        currentAttemptCount++;
        const currentDocumentUrl = new URL(window.location.href);
        const isVimeoHost = currentDocumentUrl.hostname.includes('vimeo.com');
        const hasInteractionTargets = document.querySelectorAll('.target').length > 0;

        if (!isVimeoHost || hasInteractionTargets || currentAttemptCount >= maximumAttempts) {
            processContentFeatures(currentDocumentUrl);
        } else {
            setTimeout(conductEvaluationCycle, evaluationDelay);
        }
    };

    const processContentFeatures = (urlContext) => {
        const isYouTubePlayback = urlContext.hostname.includes('youtube.com') && urlContext.pathname === '/watch' && urlContext.searchParams.has('v');
        const hasEmbeddedMedia = mediaLocator(document);

        if (isYouTubePlayback) {
            chrome.extension.sendRequest({}, () => {});
        } else if (hasEmbeddedMedia) {
            chrome.extension.sendRequest({}, () => {});
        } else if (urlContext.hostname.includes('vimeo.com')) {
            document.querySelectorAll('.target').forEach(element => {
                element.style.setProperty('z-index', '-1', 'important');
            });
            document.querySelectorAll('.video').forEach(element => {
                element.style.setProperty('z-index', '1000', 'important');
                element.setAttribute('class', 'activated-media-surface');
            });
            document.querySelectorAll('.video.cover').forEach(element => {
                element.setAttribute('class', 'activated-media-surface-with-cover');
            });
        }
    };

    conductEvaluationCycle();
}

document.addEventListener("DOMContentLoaded", () => contentActivationRoutine(null), false);