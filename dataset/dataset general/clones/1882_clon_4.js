let htmlContentCache = "";
let documentReference = document;
let storedFacts = [];
let licenseStatusIndicator = false;

chrome.runtime.onMessage.addListener(function(incomingRequest, sendingContext, replyFunction) {
    chrome.runtime.sendMessage({ desiredInfo: "page_address", currentAddress: document.location.href });
});

function recordStatement(statementItem) {
    const statementSubject = statementItem[0];
    const statementPredicate = statementItem[1];
    const statementObject = statementItem[2];

    if (storedFacts.length === 0) {
        storedFacts.push(statementItem);
        if (statementPredicate === "license") {
            licenseStatusIndicator = true;
            chrome.runtime.sendMessage({ licenseKey: "context", resourceLink: statementObject, sourceSite: statementSubject });
        }
        return;
    }

    let potentialAdditionRequired = false;

    for (let currentIdx = 0; currentIdx < storedFacts.length; currentIdx++) {
        const existingFact = storedFacts[currentIdx];
        const existingSubject = existingFact[0];
        const existingPredicate = existingFact[1];

        if (existingSubject !== statementSubject) {
            storedFacts.push(statementItem);
            potentialAdditionRequired = false;
            if (statementPredicate === "license") {
                licenseStatusIndicator = true;
                chrome.runtime.sendMessage({ licenseKey: "context", resourceLink: statementObject, sourceSite: statementSubject });
            }
            return;
        }

        if (existingPredicate !== statementPredicate) {
            potentialAdditionRequired = true;
        } else {
            potentialAdditionRequired = false;
            break;
        }
    }

    if (potentialAdditionRequired) {
        storedFacts.push(statementItem);
        if (statementPredicate === "license") {
            licenseStatusIndicator = true;
            chrome.runtime.sendMessage({ licenseKey: "context", resourceLink: statementObject, sourceSite: statementSubject });
        }
    }
}

chrome.runtime.sendMessage({ dataType: "uri", uriValue: document.location.href });
chrome.runtime.sendMessage({ dataType: "pageTitle", titleText: document.title, uriValue: document.location.href });

setTimeout(function performAnalysis() {
    processDocumentMarkup();
}, 7000);

function processDocumentMarkup() {
    const mainEntityElement = documentReference.querySelector('[about]');
    let resolvedUri = document.location.href;

    if (mainEntityElement) {
        let aboutAttributeValue = mainEntityElement.getAttribute('about');
        if (aboutAttributeValue) {
            if (!aboutAttributeValue.startsWith("http")) {
                resolvedUri = document.location.href;
            } else {
                resolvedUri = aboutAttributeValue;
            }
        }

        const licenseRelElement = mainEntityElement.querySelector('[rel*="license"]');
        if (licenseRelElement) {
            recordStatement([resolvedUri, "license", licenseRelElement.href]);
            licenseStatusIndicator = true;
        }

        const attributionURLElement = mainEntityElement.querySelector('[rel="cc:attributionURL"]');
        if (attributionURLElement) {
            recordStatement([resolvedUri, "attributionName", attributionURLElement.href]);
        }

        const attributionNameElement = mainEntityElement.querySelector('[property="cc:attributionName"]');
        if (attributionNameElement) {
            recordStatement([resolvedUri, "attributionName", attributionNameElement.innerHTML]);
        }
    }

    const allLicenseRels = documentReference.querySelectorAll('[rel*="license"]');
    if (allLicenseRels.length > 0) {
        let targetLicenseElement;
        if (document.location.href.includes("wikipedia.org")) {
            targetLicenseElement = allLicenseRels[1];
        } else {
            targetLicenseElement = allLicenseRels[0];
        }
        if (targetLicenseElement && targetLicenseElement.href) {
            recordStatement([document.location.href, "license", targetLicenseElement.href]);
            licenseStatusIndicator = true;
        }
    }

    const globalAttributionURLElement = documentReference.querySelector('[rel="cc:attributionURL"]');
    if (globalAttributionURLElement && globalAttributionURLElement.href) {
        recordStatement([document.location.href, "attributionURL", globalAttributionURLElement.href]);
    }

    const globalAttributionNameElement = documentReference.querySelector('[property="cc:attributionName"]');
    if (globalAttributionNameElement && globalAttributionNameElement.innerHTML) {
        recordStatement([document.location.href, "attributionName", globalAttributionNameElement.innerHTML]);
    }

    const charmLicenseElement = documentReference.querySelector(".charm-item-license-url");
    if (charmLicenseElement && charmLicenseElement.href) {
        recordStatement([document.location.href, "license", charmLicenseElement.href]);
    }

    const urlParts = document.location.href.split('.');
    const domainSegment = urlParts.length > 1 ? urlParts[1] : '';

    const domainHandlers = new Map([
        ["flickr", () => {
            let pageAuthor = documentReference.querySelector('.owner-name')?.innerHTML;
            if (!pageAuthor) {
                pageAuthor = documentReference.querySelector('.photo-name-line-1')?.firstElementChild?.innerHTML;
            }

            if (pageAuthor && pageAuthor.length !== 1) {
                const authorStatement = [document.location.href, "author", pageAuthor];
                recordStatement(authorStatement);
            }
        }]
    ]);

    const handler = domainHandlers.get(domainSegment);
    if (handler) {
        handler();
    }

    if (licenseStatusIndicator) {
        chrome.runtime.sendMessage({ displayAddress: document.location.href, showInterface: "icon", collectedData: storedFacts });
    }
}