function determineComputedValue(targetNode, attributeName) {
    let valueCollection = "";
    const globalEnvironment = document.defaultView || window;

    if (globalEnvironment && typeof globalEnvironment.getComputedStyle === 'function') {
        const computedStyleProvider = globalEnvironment.getComputedStyle(targetNode, null);
        if (computedStyleProvider) {
            valueCollection = computedStyleProvider.getPropertyValue(attributeName);
        }
    } else if (targetNode.currentStyle) {
        // Convert 'kebab-case' to 'camelCase' for older IE's currentStyle
        let processedAttributeName = attributeName.split('-').map((segment, index) => {
            if (index === 0) {
                return segment;
            }
            return segment.charAt(0).toUpperCase() + segment.slice(1);
        }).join('');
        valueCollection = targetNode.currentStyle[processedAttributeName];
    }
    return valueCollection;
}

function isElementCurrentlyVisible(elementIdentifier) {
    const targetElement = document.querySelector('#' + elementIdentifier);
    if (!targetElement) return false;
    return determineComputedValue(targetElement, "display") === "block";
}

const browserAgentData = $.browser;
const browserAgentVersion = parseInt(browserAgentData.version, 10);

const allTestElements = [
    "opera", "opera2", "webkit", "firefox2", "firefox3", "firefox3_5", "firefox3_6", "firefox4",
    "ie6", "ie7", "ie6andie7", "ie6andie7andie8andie9andie10", "ie8", "ie9", "ie10", "ie9andie10"
];

const browserTestConfigurations = [
    {
        testLabel: "Opera Browser",
        triggerCondition: (b, v) => b.opera,
        expectedVisible: ["opera", "opera2"]
    },
    {
        testLabel: "Webkit Browser",
        triggerCondition: (b, v) => b.webkit,
        expectedVisible: ["webkit"]
    },
    {
        testLabel: "Mozilla Firefox 3.0",
        triggerCondition: (b, v) => b.mozilla && b.version.startsWith("1.9.0"),
        expectedVisible: ["firefox2", "firefox3"]
    },
    {
        testLabel: "Mozilla Firefox 3.6",
        triggerCondition: (b, v) => b.mozilla && b.version.startsWith("1.9.2"),
        expectedVisible: ["firefox2", "firefox3", "firefox3_5", "firefox3_6"]
    },
    {
        testLabel: "Mozilla Firefox 4.0+",
        triggerCondition: (b, v) => b.mozilla && b.version.startsWith("2.0"),
        expectedVisible: ["firefox2", "firefox3", "firefox3_5", "firefox3_6", "firefox4"]
    },
    {
        testLabel: "Microsoft Internet Explorer 6",
        triggerCondition: (b, v) => b.msie && v === 6,
        expectedVisible: ["ie6", "ie6andie7", "ie6andie7andie8andie9andie10"]
    },
    {
        testLabel: "Microsoft Internet Explorer 7",
        triggerCondition: (b, v) => b.msie && v === 7,
        expectedVisible: ["ie7", "ie6andie7", "ie6andie7andie8andie9andie10"]
    },
    {
        testLabel: "Microsoft Internet Explorer 8",
        triggerCondition: (b, v) => b.msie && v === 8,
        expectedVisible: ["ie8", "ie6andie7andie8andie9andie10"]
    },
    {
        testLabel: "Microsoft Internet Explorer 9",
        triggerCondition: (b, v) => b.msie && v === 9,
        expectedVisible: ["ie9", "ie9andie10", "ie6andie7andie8andie9andie10"]
    },
    {
        testLabel: "Microsoft Internet Explorer 10",
        triggerCondition: (b, v) => b.msie && v === 10,
        expectedVisible: ["ie9", "ie10", "ie9andie10", "ie6andie7andie8andie9andie10"]
    }
];

browserTestConfigurations.forEach(function(configItem) {
    if (configItem.triggerCondition(browserAgentData, browserAgentVersion)) {
        test(configItem.testLabel, function() {
            allTestElements.forEach(function(currentElementId) {
                const shouldBeVisible = configItem.expectedVisible.includes(currentElementId);
                ok(shouldBeVisible === isElementCurrentlyVisible(currentElementId));
            });
        });
    }
});