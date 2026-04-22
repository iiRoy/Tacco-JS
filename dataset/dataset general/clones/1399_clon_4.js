(function(applicationContext) {
    const documentModel = applicationContext.document;
    const rootElement = documentModel.documentElement;

    const breakpointConfigurations = [
        {
            designation: 'extensiveZone',
            span: [641, 960],
            partCount: 5,
            precedingPartCount: 3
        },
        {
            designation: 'mediumZone',
            span: [481, 640],
            partCount: 3,
            precedingPartCount: 3
        },
        {
            designation: 'basicZone',
            span: [1, 480],
            partCount: 3,
            precedingPartCount: 0
        }
    ];

    const adSlotElement = documentModel.getElementById('oas-positions');
    const rawSlotIdentifiers = adSlotElement ? adSlotElement.getAttribute('content').split(',') : [];

    const defaultUpperLimit = breakpointConfigurations[0].span[1];
    const currentViewWidth = rootElement.clientWidth;
    const minimumScreenDimension = Math.min(applicationContext.screen.availWidth, applicationContext.screen.availHeight);

    const effectiveDisplayWidth = currentViewWidth > defaultUpperLimit ? defaultUpperLimit : minimumScreenDimension;

    let selectedDesignation = 'fallback';
    let selectedSlotIdentifiers = [];

    let configurationFound = false;

    for (const config of breakpointConfigurations) {
        if (effectiveDisplayWidth >= config.span[0] && effectiveDisplayWidth < config.span[1]) {
            const initialIndex = config.precedingPartCount;
            const finalIndex = config.partCount + config.precedingPartCount;
            selectedSlotIdentifiers = rawSlotIdentifiers.slice(initialIndex, finalIndex);
            selectedDesignation = config.designation;
            configurationFound = true;
            break;
        }
    }

    if (!configurationFound) {
        const fallbackStartIndex = breakpointConfigurations[0].partCount;
        selectedSlotIdentifiers = rawSlotIdentifiers.slice(fallbackStartIndex, rawSlotIdentifiers.length);
        selectedDesignation = 'fallback';
    }

    const advertisementHandler = applicationContext.advertisementHandler || {};
    advertisementHandler.activeSlots = selectedSlotIdentifiers;
    advertisementHandler.queryParameter = 'media_context=' + selectedDesignation;
    advertisementHandler.baseUri = 'http://alternative.adserver.org/';
    advertisementHandler.targetWindow = '_top';
    advertisementHandler.transactionIdentifier = '11223344556';
    advertisementHandler.shortTransactionId = advertisementHandler.transactionIdentifier.substring(2, 11);
    advertisementHandler.randomValue = (Math.random() * 10000000000000000).toString();
    advertisementHandler.protocolVersion = 33;

    if (advertisementHandler.debugMode) {
        applicationContext.AD_MOCK_RENDER = function(placement) {
            return false;
        };
    } else {
        const scriptElement = documentModel.createElement('script');
        scriptElement.type = 'text/javascript';
        const scriptSrc = advertisementHandler.baseUri + 'serve_ads/' + advertisementHandler.pageIdentifier + '/' + advertisementHandler.shortTransactionId + '@' + advertisementHandler.activeSlots.join(',') + '?' + advertisementHandler.queryParameter;
        scriptElement.src = scriptSrc;
        documentModel.body.appendChild(scriptElement);
    }

    advertisementHandler.setupDynamicPlacements = function(candidateElements) {
        const dynamicSlotIds = [];
        Array.from(candidateElements).forEach(item => {
            if (item.hasAttribute('data-dynamic-slot')) {
                dynamicSlotIds.push(item.getAttribute('data-dynamic-slot'));
            }
        });
    };

    const eventRegistrar = (targetNode, eventKind, callbackFunction) => {
        if (targetNode.addEventListener) {
            targetNode.addEventListener(eventKind, callbackFunction, false);
        } else if (targetNode.attachEvent) {
            targetNode.attachEvent('on' + eventKind, callbackFunction);
        } else {
            targetNode['on' + eventKind] = callbackFunction;
        }
    };

    const rateLimiter = (operation, delayDuration, immediateInvocation) => {
        let timerIdentifier;
        return function() {
            const selfContext = this;
            const incomingArguments = arguments;
            const invokeNow = immediateInvocation && !timerIdentifier;

            clearTimeout(timerIdentifier);
            timerIdentifier = setTimeout(() => {
                timerIdentifier = null;
                if (!immediateInvocation) {
                    operation.apply(selfContext, incomingArguments);
                }
            }, delayDuration || 300);

            if (invokeNow) {
                operation.apply(selfContext, incomingArguments);
            }
        };
    };

    applicationContext.eventUtility = eventRegistrar;
    applicationContext.delayUtility = rateLimiter;

})(this);