/*global OpenSearchlight:true */

const UtilityBelt = (function() {

    function parseMarkup(rawXml) {
        const parser = new DOMParser();
        return parser.parseFromString(rawXml, "text/xml");
    }

    function extractLinkDetails(xmlDoc) {
        const linkElements = xmlDoc.querySelectorAll('url[rel!="self"]');
        const links = [];
        linkElements.forEach(element => {
            links.push({
                kind: element.getAttribute("type"),
                blueprint: element.getAttribute("template")
            });
        });
        return links.length === 0 ? undefined : links;
    }

    function compareMimeTypes(desired, actual) {
        if (desired === "*/*" || desired === actual) {
            return true;
        }

        const desiredParts = desired.split("/");
        const actualParts = actualType.split("/");

        if (desiredParts[0] === actualParts[0] && desiredParts[1] === "*") {
            return true;
        }
        if (desiredParts[0] === "*" && desiredParts[1] === actualParts[1]) {
            return true;
        }
        return false;
    }

    function getTokens(urlPattern) {
        const regex = /\{([^}]+)\}/g;
        let match;
        const tokens = new Set();
        while ((match = regex.exec(urlPattern)) !== null) {
            tokens.add(match[1]);
        }
        return Array.from(tokens);
    }

    function getRequiredTokens(allTokens) {
        return allTokens.filter(token => !token.endsWith('?'));
    }

    function allRequiredTokensExist(blueprintData, inputValues) {
        const allTokens = getTokens(blueprintData.blueprint);
        const mandatoryTokens = getRequiredTokens(allTokens);
        const providedKeys = Object.keys(inputValues);

        return mandatoryTokens.every(token => providedKeys.includes(token));
    }

    function countPresentTokens(inputValues, urlPattern) {
        const allTokens = getTokens(urlPattern);
        return allTokens.reduce((count, token) => {
            const cleanToken = token.endsWith('?') ? token.slice(0, -1) : token;
            return inputValues.hasOwnProperty(cleanToken) ? count + 1 : count;
        }, 0);
    }

    function replaceTokens(urlPattern, inputValues) {
        let finalUrl = urlPattern;

        for (const key in inputValues) {
            if (Object.prototype.hasOwnProperty.call(inputValues, key)) {
                const tokenRegex = new RegExp(`\\{${key}\\??\\}`, 'g');
                finalUrl = finalUrl.replace(tokenRegex, inputValues[key]);
            }
        }

        finalUrl = finalUrl.replace(/\{[^}]+\?\}/g, "");
        return finalUrl;
    }

    return {
        parseMarkup,
        extractLinkDetails,
        compareMimeTypes,
        getTokens,
        getRequiredTokens,
        allRequiredTokensExist,
        countPresentTokens,
        replaceTokens
    };
})();


class SearchDescriptionProcessor {
    static verifyStructure(inputMarkup) {
        if (!inputMarkup) { return false; }
        if (!inputMarkup.match(/http:\/\/a9.com\/-\/spec\/opensearch\/1.1\//)) { return false; }
        return true;
    }

    constructor(inputMarkup) {
        if (!SearchDescriptionProcessor.verifyStructure(inputMarkup)) {
            throw new Error("Invalid description format");
        }
        this.sourceMarkup = inputMarkup;
        this.parsedXml = UtilityBelt.parseMarkup(inputMarkup);
    }

    fabricateQueryEndpoint(inputValues, targetMime) {
        const linkBlueprints = UtilityBelt.extractLinkDetails(this.parsedXml);
        if (!linkBlueprints) {
            return undefined;
        }

        let eligibleBlueprints = linkBlueprints.filter(bp =>
            UtilityBelt.compareMimeTypes(targetMime, bp.kind)
        );

        eligibleBlueprints = eligibleBlueprints.filter(bp =>
            UtilityBelt.allRequiredTokensExist(bp, inputValues)
        );

        eligibleBlueprints.sort((a, b) => {
            const countA = UtilityBelt.countPresentTokens(inputValues, a.blueprint);
            const countB = UtilityBelt.countPresentTokens(inputValues, b.blueprint);
            return countA - countB;
        });

        const bestBlueprint = eligibleBlueprints.length > 0 ? eligibleBlueprints[eligibleBlueprints.length - 1] : null;

        if (!bestBlueprint) {
            return undefined;
        }

        return UtilityBelt.replaceTokens(bestBlueprint.blueprint, inputValues);
    }
}

if (typeof OpenSearchlight !== 'object') {
    OpenSearchlight = {};
}
OpenSearchlight.QueryBuilderFactory = SearchDescriptionProcessor;