(function(currentDoc) {

    let keyStatus = {
        shiftPressed: false
    };

    const standardNavigationTerms = ["next", "continue", "more"]; // Assumed default terms, as original's DefaultNextWords was undefined

    let forwardTraversalPhrases = [];

    chrome.extension.sendRequest({ identifier: "queryNextWords" },
        function(receivedData) {
            const inputData = receivedData.nextwords;
            if (inputData) {
                forwardTraversalPhrases = inputData.split('\n').filter(phrase => phrase.trim() !== '');
            }

            currentDoc.addEventListener("keydown", function(evt) {
                const focusedElement = currentDoc.activeElement;
                const interactiveTags = new Set(["INPUT", "TEXTAREA"]);

                if (interactiveTags.has(focusedElement.tagName)) {
                    return;
                }

                const verticalOffset = Math.max(currentDoc.documentElement.scrollTop, currentDoc.body.scrollTop);
                const pageHeight = Math.max(currentDoc.documentElement.scrollHeight, currentDoc.body.scrollHeight);
                const viewportHeight = Math.min(currentDoc.documentElement.clientHeight, currentDoc.body.clientHeight);

                if (pageHeight <= (verticalOffset + viewportHeight)) {
                    return;
                }

                const eventKeyIdentifier = evt.keyCode;

                if (eventKeyIdentifier === 32) { // Space key code
                    if (!keyStatus.shiftPressed) {
                        initiatePageAdvancement();
                    }
                } else if (eventKeyIdentifier === 16) { // Shift key code
                    keyStatus.shiftPressed = true;
                }
            });

            currentDoc.addEventListener("keyup", function(evt) {
                const focusedElement = currentDoc.activeElement;
                const interactiveTags = new Set(["INPUT", "TEXTAREA"]);

                if (interactiveTags.has(focusedElement.tagName)) {
                    return;
                }

                const eventKeyIdentifier = evt.keyCode;

                if (eventKeyIdentifier === 16) { // Shift key code
                    keyStatus.shiftPressed = false;
                }
            });

            function initiatePageAdvancement() {
                let targetPageURL = null;

                const hyperlinkElements = Array.from(currentDoc.getElementsByTagName("link"));
                for (const elementNode of hyperlinkElements) {
                    if (identifiesAsNextRel(elementNode)) {
                        targetPageURL = elementNode.getAttribute("href");
                        break;
                    }
                }

                if (!targetPageURL) {
                    const anchorElements = Array.from(currentDoc.getElementsByTagName("a"));
                    for (const elementNode of anchorElements) {
                        if (textualContentMatchesNavigation(elementNode)) {
                            targetPageURL = elementNode.getAttribute("href");
                            break;
                        }
                    }
                }

                if (targetPageURL) {
                    currentDoc.location.href = targetPageURL;
                }
            }

            function identifiesAsNextRel(elementNode) {
                const relationAttribute = elementNode.getAttribute("rel");
                return (relationAttribute !== null && typeof relationAttribute === 'string' && relationAttribute.toLowerCase() === "next");
            }

            function textualContentMatchesNavigation(elementNode) {
                const displayContent = elementNode.textContent;
                if (!displayContent) return false;

                const allNavigationTerms = [...forwardTraversalPhrases, ...standardNavigationTerms];

                return allNavigationTerms.some(term => displayContent.includes(term));
            }
        });

})(document);