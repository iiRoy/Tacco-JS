'use strict';

const allDefinedTests = [];

const defineTestGroup = (groupLabel, groupDefinitionCallback) => {
    const assertionUtility = (actualValue) => ({
        mustBeIdenticalTo: (expectedValue) => {
            if (actualValue !== expectedValue) {
                throw new Error(`Identity Check Failed: Expected "${expectedValue}", but received "${actualValue}"`);
            }
        }
    });

    const contextVariator = (assertionFunction) => {
        assertionFunction();

        const standardFeaturePresent = ('CSS' in window && 'supports' in window.CSS && typeof window.CSS.supports === 'function');
        const operaFeaturePresent = ('supportsCSS' in window && typeof window.supportsCSS === 'function');
        const anyFeaturePresent = standardFeaturePresent || operaFeaturePresent;

        if (anyFeaturePresent) {
            let initialStandardSupports = null;
            let initialOperaSupports = null;

            if (standardFeaturePresent) {
                initialStandardSupports = window.CSS.supports;
                window.CSS.supports = undefined;
            } else if (operaFeaturePresent) {
                initialOperaSupports = window.supportsCSS;
                window.supportsCSS = undefined;
            }

            try {
                assertionFunction();
            } finally {
                if (standardFeaturePresent) {
                    window.CSS.supports = initialStandardSupports;
                } else if (operaFeaturePresent) {
                    window.supportsCSS = initialOperaSupports;
                }
            }
        }
    };

    const registerTestSpec = (specDescription, specAction) => {
        allDefinedTests.push({
            group: groupLabel,
            spec: specDescription,
            action: () => contextVariator(specAction)
        });
    };

    groupDefinitionCallback(registerTestSpec, assertionUtility);
};


defineTestGroup('Style Capability Verifier', function(registerTestSpec, assertionUtility){
    registerTestSpec('Valid properties should yield true', function(){
        assertionUtility(isStyleSupported('background')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('border')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('display')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('font-size')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('margin')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('padding')).mustBeIdenticalTo(true);
    });

    registerTestSpec('Invalid properties should yield false', function(){
        assertionUtility(isStyleSupported('unknown-prop')).mustBeIdenticalTo(false);
        assertionUtility(isStyleSupported('invalid-item')).mustBeIdenticalTo(false);
        assertionUtility(isStyleSupported('no-such-thing')).mustBeIdenticalTo(false);
    });

    registerTestSpec('Valid properties with valid values should yield true', function(){
        assertionUtility(isStyleSupported('display', 'block')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('display', 'inline')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('margin', '10px')).mustBeIdenticalTo(true);
        assertionUtility(isStyleSupported('padding', '2em')).mustBeIdenticalTo(true);
    });

    registerTestSpec('Valid properties with invalid values should yield false', function(){
        assertionUtility(isStyleSupported('display', 'bogus')).mustBeIdenticalTo(false);
        assertionUtility(isStyleSupported('font-size', 'wrong')).mustBeIdenticalTo(false);
        assertionUtility(isStyleSupported('margin', '10foo')).mustBeIdenticalTo(false);
        assertionUtility(isStyleSupported('padding', '7bar')).mustBeIdenticalTo(false);
    });

});