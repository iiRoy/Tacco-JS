(function() {
    let transformationInProgress = false;

    const platformConfigurations = new Map();

    const constructIconHtml = (keyIdentifier, imageFileName) => {
        const fullImageUrl = chrome.extension.getURL(imageFileName);
        return `<span style="display:none">${keyIdentifier}</span><img src="${fullImageUrl}" style="background-position: 0px 0px" alt=":${keyIdentifier}:">`;
    };

    const currentWebAddress = window.location.href;
    if (currentWebAddress.includes('facebook')) {
        platformConfigurations.set('mainConversation', {
            containerSelector: 'div.conversation',
            textNodeSelector: '.fbChatConvItem .messages span'
        });
        platformConfigurations.set('dockedChatWindow', {
            containerSelector: 'li.webMessengerMessageGroup',
            textNodeSelector: 'span'
        });
    } else {
        return;
    }

    const emojiPlaceholderPattern = /\[[a-z]+\]/g;

    const processContentNode = (contentElement) => {
        const originalHtmlContent = contentElement.innerHTML;
        let revisedHtmlContent = originalHtmlContent;
        const detectedPlaceholders = originalHtmlContent.match(emojiPlaceholderPattern);

        if (detectedPlaceholders && detectedPlaceholders.length > 0) {
            detectedPlaceholders.forEach(placeholderString => {
                const extractedKey = placeholderString.substring(1, placeholderString.length - 1);
                const correspondingImagePath = window.rages ? window.rages[extractedKey] : undefined;

                if (correspondingImagePath) {
                    revisedHtmlContent = revisedHtmlContent.replace(
                        new RegExp(`\\[${extractedKey}\\]`, 'g'),
                        constructIconHtml(extractedKey, correspondingImagePath)
                    );
                }
            });

            if (revisedHtmlContent !== originalHtmlContent) {
                contentElement.innerHTML = revisedHtmlContent;
            }
        }
    };

    const handleDomMutations = (mutationRecords, observerHandle) => {
        if (transformationInProgress) {
            return;
        }

        transformationInProgress = true;

        try {
            mutationRecords.forEach(record => {
                if (record.type === 'childList' && record.addedNodes.length > 0) {
                    record.addedNodes.forEach(addedNode => {
                        if (addedNode.nodeType === Node.ELEMENT_NODE) {
                            platformConfigurations.forEach(config => {
                                if (addedNode.matches(config.containerSelector)) {
                                    addedNode.querySelectorAll(config.textNodeSelector).forEach(processContentNode);
                                }
                                addedNode.querySelectorAll(config.containerSelector).forEach(nestedContainer => {
                                    nestedContainer.querySelectorAll(config.textNodeSelector).forEach(processContentNode);
                                });
                            });
                        }
                    });
                }
            });
        } finally {
            transformationInProgress = false;
        }
    };

    const documentChangeObserver = new MutationObserver(handleDomMutations);

    documentChangeObserver.observe(document.body, { childList: true, subtree: true });
})();