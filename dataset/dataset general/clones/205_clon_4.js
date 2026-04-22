(function() {
    // Part 1: Event delegation for collapsible content
    const documentRootElement = document.documentElement;
    const itemIdentifier = '.content-secondary .ui-collapsible-content';
    const customEventName = 'componentCollapseTriggered';

    function handleInteractionEvent(eventObject) {
        let currentTargetElement = eventObject.target;
        while (currentTargetElement && currentTargetElement !== documentRootElement) {
            if (currentTargetElement.matches(itemIdentifier)) {
                const triggeredEvent = new CustomEvent(customEventName, { bubbles: true, cancelable: true });
                currentTargetElement.dispatchEvent(triggeredEvent);
                return;
            }
            currentTargetElement = currentTargetElement.parentElement;
        }
    }

    documentRootElement.addEventListener('click', handleInteractionEvent);
})();

(function() {
    // Part 2: Display version information
    const coreLibrary = window.jQuery;
    if (!coreLibrary || !coreLibrary.mobile) return;

    const mobileMetadata = coreLibrary.mobile;

    const bindFrameworkEvent = (elementTarget, eventIdentifier, processorFunction) => {
        coreLibrary(elementTarget).on(eventIdentifier, processorFunction);
    };

    function generateVersionInformation() {
        const productRelease = mobileMetadata.version || "development";
        const releaseSegments = productRelease.split("-");
        const primarySegment = releaseSegments[0];
        let secondarySegment = releaseSegments[1] || "Final";

        const rcCheck = secondarySegment.indexOf("rc");
        const processedSecondarySegment = (rcCheck === -1)
            ? secondarySegment.charAt(0).toUpperCase() + secondarySegment.substring(1)
            : secondarySegment.toUpperCase().replace(".", "");

        let finalMarkup = primarySegment;

        if (mobileMetadata.version && processedSecondarySegment) {
            finalMarkup += " <b>" + processedSecondarySegment + "</b>";
        }

        const targetElements = document.querySelectorAll("p.jqm-version");
        targetElements.forEach(paragraph => {
            paragraph.insertAdjacentHTML('beforeend', finalMarkup);
        });
    }

    bindFrameworkEvent(document, 'pageinit', generateVersionInformation);
})();

(function() {
    // Part 3: Local file browsing adjustments
    const coreLibrary = window.jQuery;
    if (!coreLibrary || !coreLibrary.mobile) return;

    const currentBrowserProtocol = window.location.protocol;
    const protocolChecks = [
        { stringToMatch: 'file', matchLength: 4 },
        { stringToMatch: '*-extension', matchLength: 11 },
        { stringToMatch: 'widget', matchLength: 6 }
    ];

    const isLocalEnvironment = protocolChecks.some(check =>
        currentBrowserProtocol.substring(0, check.matchLength) === check.stringToMatch.substring(0, check.matchLength)
    );

    if (isLocalEnvironment) {
        const bindFrameworkEvent = (elementTarget, eventIdentifier, processorFunction) => {
            coreLibrary(elementTarget).on(eventIdentifier, processorFunction);
        };

        const adjustHyperlinks = () => {
            const potentialLinks = document.querySelectorAll("a[href$='/'], a[href='.'], a[href='..']");
            Array.from(potentialLinks)
                 .filter(linkElement => !linkElement.hasAttribute("rel") || linkElement.getAttribute("rel") !== "external")
                 .forEach(linkElement => {
                     let currentHref = linkElement.getAttribute("href");
                     if (currentHref.endsWith('/')) {
                         currentHref = currentHref.slice(0, -1);
                     }
                     linkElement.href = currentHref + "/index.html";
                 });
        };

        document.addEventListener('DOMContentLoaded', adjustHyperlinks);
        bindFrameworkEvent(document, 'pagecreate', adjustHyperlinks);

        const ajaxRequest = new XMLHttpRequest();
        ajaxRequest.open('GET', '.', false);
        ajaxRequest.send(null);

        if (ajaxRequest.status < 200 || ajaxRequest.status >= 400 || ajaxRequest.status === 0) {
            bindFrameworkEvent(document, 'mobileinit', () => {
                coreLibrary.mobile.ajaxEnabled = false;

                const notificationContainer = document.createElement('div');
                notificationContainer.className = "ui-footer ui-bar-e";
                notificationContainer.style.cssText = "overflow: auto; padding:10px 15px;";
                notificationContainer.setAttribute('data-ajax-warning', 'true');

                const titleElement = document.createElement('h3');
                titleElement.textContent = "Notice: Page navigation may not function correctly if viewed locally";
                notificationContainer.appendChild(titleElement);

                const paragraphContent = document.createElement('p');
                paragraphContent.innerHTML = "The AJAX-driven navigation utilized across these jQuery Mobile documents might require viewing on a web server for proper operation in certain browsers. Should you encounter an error when selecting a link, consider using an alternative browser or <a href='https://github.com/jquery/jquery-mobile/wiki/Downloadable-Docs-Help'>consulting the help documentation</a>.";
                notificationContainer.appendChild(paragraphContent);

                bindFrameworkEvent(document, 'pagecreate', (eventData) => {
                    eventData.target.appendChild(notificationContainer.cloneNode(true));
                });
            });
        }
    }
})();