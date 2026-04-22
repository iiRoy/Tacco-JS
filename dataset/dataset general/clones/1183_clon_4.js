(function() {
    const createAndAppendDiv = (docCreator, targetDoc, divClass, textContent1, lineBreakTag, textContent2, linkHref, linkText) => {
        const warningDiv = docCreator.call(targetDoc, "div");
        warningDiv.className = divClass;

        const partOne = docCreator.call(targetDoc, "span");
        partOne.textContent = textContent1;

        const breakElement = docCreator.call(targetDoc, lineBreakTag);

        const partTwo = docCreator.call(targetDoc, "span");
        partTwo.textContent = textContent2;

        const anchorLink = docCreator.call(targetDoc, "a");
        anchorLink.href = linkHref;
        anchorLink.textContent = linkText;

        warningDiv.appendChild(partOne);
        warningDiv.appendChild(breakElement);
        warningDiv.appendChild(partTwo);
        warningDiv.appendChild(anchorLink);

        const deferAppend = (callback) => {
            if (targetDoc.body) {
                callback();
            } else {
                targetDoc.addEventListener("DOMContentLoaded", callback);
            }
        };

        deferAppend(() => {
            targetDoc.body.appendChild(warningDiv);
        });
    };

    const injectScriptAsset = (docCreator, targetDoc, sourceAttr, sourceVal, typeAttr, typeVal) => {
        const scriptElement = docCreator.call(targetDoc, "script");
        scriptElement.setAttribute(sourceAttr, sourceVal);
        scriptElement.setAttribute(typeAttr, typeVal);
        targetDoc.head.appendChild(scriptElement);
    };

    const executeStartup = (navRef, winRef, locRef, docRef) => {
        if (navRef.userAgent.includes("FramerStudio")) {
            return;
        }

        const needsWarning = (winRef.chrome !== undefined) && (locRef.protocol === "file:");

        needsWarning
            ? createAndAppendDiv(
                docRef.createElement,
                docRef,
                "warningBanner",
                "Notice: Local files in Chrome have security constraints. Safari functions reliably.",
                "br",
                "For Chrome compatibility, use a simple web server. ",
                "https://github.com/koenbok/Framer/wiki/LocalLoading",
                "Details here"
            )
            : injectScriptAsset(
                docRef.createElement,
                docRef,
                "src",
                "app.coffee",
                "type",
                "text/coffeescript"
            );
    };

    executeStartup(navigator, window, location, document);
})();