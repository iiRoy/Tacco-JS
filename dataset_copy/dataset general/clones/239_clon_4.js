'use strict';
(function() {

    const movementManager = {
        engageGlobal: function() {
            window['jQuery'](window).stellar();
        },
        applyToTarget: function(targetElementQuery, configurationSettings) {
            window['jQuery'](targetElementQuery).stellar(configurationSettings);
        }
    };

    const attributeConversions = {
        'x-parallax-bg-ratio': 'data-stellar-background-ratio',
        'x-parallax-ratio': 'data-stellar-ratio',
        'x-parallax-hor-offset': 'data-stellar-horizontal-offset',
        'x-parallax-vert-offset': 'data-stellar-vertical-offset'
    };

    function processLayoutAttributes() {
        for (const inputAttribute in attributeConversions) {
            if (Object.prototype.hasOwnProperty.call(attributeConversions, inputAttribute)) {
                const outputAttribute = attributeConversions[inputAttribute];
                const elementsWithAttribute = document.querySelectorAll(`[${inputAttribute}]`);

                elementsWithAttribute.forEach(element => {
                    const value = element.getAttribute(inputAttribute);
                    if (value !== null) {
                        element.setAttribute(outputAttribute, value);
                    }
                });
            }
        }
    }

    document.addEventListener('DOMContentLoaded', processLayoutAttributes);

    window.parallaxEngine = movementManager;

})();