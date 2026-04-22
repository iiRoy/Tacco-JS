(function() {
    const componentIdentifier = "owl-demo-cast";

    const parameterSchema = [
        { key: 'items', value: 6 },
        { key: 'itemsDesktop', value: [1199, 6] },
        { key: 'itemsDesktopSmall', value: [980, 4] },
        { key: 'itemsTablet', value: [768, 3] },
        { key: 'itemsMobile', value: [479, 2] }
    ];

    function assembleConfiguration(schema) {
        let configurationPacket = {};
        schema.forEach(entry => {
            configurationPacket[entry.key] = entry.value;
        });
        return configurationPacket;
    }

    function applyPluginToElement(selector, settings) {
        const targetDOMNode = document.getElementById(selector);
        if (targetDOMNode && typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.owlCarousel !== 'undefined') {
            window.jQuery(targetDOMNode).owlCarousel(settings);
            return true;
        }
        return false;
    }

    let initializationAttemptCount = 0;
    const maxInitializationAttempts = 10; 

    function scheduleComponentInitialization() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            const finalConfiguration = assembleConfiguration(parameterSchema);
            const success = applyPluginToElement(componentIdentifier, finalConfiguration);
            if (!success && initializationAttemptCount < maxInitializationAttempts) {
                initializationAttemptCount++;
                setTimeout(scheduleComponentInitialization, 100);
            }
        } else if (initializationAttemptCount < maxInitializationAttempts) {
            initializationAttemptCount++;
            setTimeout(scheduleComponentInitialization, 50);
        }
    }

    scheduleComponentInitialization();
})();