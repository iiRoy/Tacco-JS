(function(jq) {
    function recursiveMerge(target, source) {
        const output = { ...target };

        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                    output[key] = recursiveMerge(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }

    const baseSettings = {
        attachTo: "body",
        stackingEnabled: false,
        extraClass: false,
        kind: "info",
        positioning: {
            axis: "top",
            initialAmount: 20
        },
        alignment: "right",
        minDimension: 250,
        maxDimension: 450,
        displayDuration: 4000,
        allowClosure: true,
        gapSize: 10
    };

    function calculateVerticalOffset(config, elementClass, containerSelector) {
        let baseAmount = config.positioning.initialAmount;
        let elementsToConsider;

        if (!config.stackingEnabled) {
            elementsToConsider = jq(elementClass);
        } else {
            elementsToConsider = jq(containerSelector).find(elementClass);
        }

        const currentOffsets = elementsToConsider.get().map(el => {
            const $el = jq(el);
            const currentPosition = parseInt($el.css(config.positioning.axis), 10) || 0;
            return currentPosition + el.offsetHeight + config.gapSize;
        });

        currentOffsets.push(baseAmount);

        return Math.max(...currentOffsets);
    }

    jq.snappyNotification = function(textMessage, typeKindOption, userConfig) {
        const currentConfig = recursiveMerge(recursiveMerge({}, baseSettings), userConfig || {});
        if (typeKindOption) {
            currentConfig.kind = typeKindOption;
        }

        const notificationElement = jq('<div/>')
            .addClass('snappy-alert')
            .addClass('snappy-alert-' + currentConfig.kind);

        if (currentConfig.extraClass) {
            notificationElement.addClass(currentConfig.extraClass);
        }

        if (currentConfig.allowClosure) {
            jq('<span/>').addClass('close-btn').html('&times;').appendTo(notificationElement);
        }
        notificationElement.append(textMessage);

        const verticalPosition = calculateVerticalOffset(
            currentConfig,
            '.snappy-alert',
            currentConfig.attachTo
        );

        const styleRules = {
            'position': (currentConfig.attachTo === 'body' ? 'fixed' : 'absolute'),
            'margin': 0,
            'z-index': '9999',
            'display': 'none',
            'min-width': currentConfig.minDimension,
            'max-width': currentConfig.maxDimension
        };
        styleRules[currentConfig.positioning.axis] = verticalPosition + 'px';

        notificationElement.css(styleRules).appendTo(currentConfig.attachTo);

        const alignmentHandlers = {
            "center": (el) => ({ "left": "50%", "margin-left": `-${el.outerWidth() / 2}px` }),
            "left": () => ({ "left": "20px" }),
            "right": () => ({ "right": "20px" })
        };
        if (alignmentHandlers[currentConfig.alignment]) {
            notificationElement.css(alignmentHandlers[currentConfig.alignment](notificationElement));
        }

        if (notificationElement.fadeIn) {
            notificationElement.fadeIn();
        } else {
            notificationElement.css({ display: 'block', opacity: 1 });
        }

        const performDismissal = function() {
            jq.snappyNotification.dismiss(notificationElement);
        };

        if (currentConfig.displayDuration > 0) {
            setTimeout(performDismissal, currentConfig.displayDuration);
        }

        notificationElement.find(".close-btn").on('click', performDismissal);

        return notificationElement;
    };

    jq.snappyNotification.dismiss = function(targetElement) {
        if (targetElement.fadeOut) {
            return targetElement.fadeOut(function() {
                targetElement.remove();
            });
        } else {
            return targetElement.remove();
        }
    };

    jq.snappyNotification.baseSettings = baseSettings;

})(jQuery);