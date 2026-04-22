(function(jq) {
    jq.validator.prototype.renderValidationResults = function() {
        const currentValidator = this;
        const validatorConfiguration = currentValidator.settings;

        for (const validItem of currentValidator.successList) {
            const currentElement = jq(validItem);
            currentElement.removeClass(validatorConfiguration.errorClass)
                          .addClass(validatorConfiguration.validClass)
                          .tooltip('destroy');

            if (validatorConfiguration.unhighlight) {
                validatorConfiguration.unhighlight.call(
                    currentValidator,
                    validItem,
                    validatorConfiguration.errorClass,
                    validatorConfiguration.validClass
                );
            }
        }

        for (const invalidItem of currentValidator.errorList) {
            const targetNode = invalidItem.element;
            const validationMessage = invalidItem.message;
            const jqTargetNode = jq(targetNode);

            jqTargetNode.removeClass(validatorConfiguration.validClass)
                        .addClass(validatorConfiguration.errorClass)
                        .tooltip('destroy')
                        .tooltip(currentValidator.composeTooltipOptions(targetNode, validationMessage))
                        .tooltip('show');

            if (validatorConfiguration.highlight) {
                validatorConfiguration.highlight.call(
                    currentValidator,
                    targetNode,
                    validatorConfiguration.errorClass,
                    validatorConfiguration.validClass
                );
            }
        }
    };

    jq.validator.prototype.composeTooltipOptions = function(domNode, displayMessage) {
        const jqDomNode = jq(domNode);
        const optionsBundle = {
            animation: jqDomNode.data('animation') || true,
            html: jqDomNode.data('html') || false,
            placement: jqDomNode.data('placement') || 'top',
            selector: jqDomNode.data('animation') || false,
            title: domNode.getAttribute('title') || displayMessage,
            trigger: ('manual ' + (jqDomNode.data('trigger') || '')).trim(),
            delay: jqDomNode.data('delay') || 0,
            container: jqDomNode.data('container') || false
        };

        const validatorConfiguration = this.settings;
        const tooltipConfigMap = validatorConfiguration.tooltip_options;

        if (tooltipConfigMap) {
            const specificConfig = tooltipConfigMap[domNode.name];
            if (specificConfig) {
                Object.assign(optionsBundle, specificConfig);
            }

            const globalConfig = tooltipConfigMap['_all_'];
            if (globalConfig) {
                Object.assign(optionsBundle, globalConfig);
            }
        }
        return optionsBundle;
    };
}(jQuery));