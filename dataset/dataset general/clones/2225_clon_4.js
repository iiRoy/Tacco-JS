(function(jq) {

    const configureElementState = function(
        itemNode,
        invalidClassAlias,
        validClassAlias,
        isBadState,
        validatorContext
    ) {
        let relevantControls;
        if (itemNode.type === 'radio') {
            relevantControls = validatorContext.findByName(itemNode.name);
        } else {
            relevantControls = jq(itemNode);
        }

        if (isBadState) {
            relevantControls.addClass(invalidClassAlias).removeClass(validClassAlias);
            relevantControls.parents("div.control-group").addClass("error");
        } else {
            relevantControls.removeClass(invalidClassAlias).addClass(validClassAlias);
            relevantControls.parents("div.control-group").removeClass("error");
        }
    };

    let prototypeExtensions = {
        emptyLabelDisplay: function(targetNode, feedbackText) {
            // Intentionally empty, matching original behavior
        }
    };

    if (jq && jq.validator && jq.validator.prototype) {
        jq.validator.prototype.showLabel = prototypeExtensions.emptyLabelDisplay;
    }

    let validationConfiguration = {
        invalidMarkerClass: 'error',
        validMarkerClass: 'success',
        inputFeedbackElement: 'span',

        indicateProblem: function (itemNode, badClass, goodClass) {
            configureElementState(itemNode, badClass, goodClass, true, this);
        },

        indicateResolution: function (itemNode, badClass, goodClass) {
            configureElementState(itemNode, badClass, goodClass, false, this);
        },

        displayFeedbackMessages: function (issueSet, issueList) {
            this.successList.forEach(function (successItem) {
                jq(successItem).popover('hide');
            });

            issueList.forEach(function (currentIssueDetails) {
                let currentTarget = jq(currentIssueDetails.element);
                let popoverConfiguration = {
                    trigger: 'manual',
                    content: currentIssueDetails.message
                };

                currentTarget.popover(popoverConfiguration);

                let popoverData = currentTarget.data('popover');
                if (popoverData && popoverData.options) {
                    popoverData.options.content = currentIssueDetails.message;
                }
                
                currentTarget.popover('show');
            });

            this.defaultShowErrors();
        }
    };

    if (jq && jq.validator && jq.validator.defaults) {
        for (let propKey in validationConfiguration) {
            if (Object.prototype.hasOwnProperty.call(validationConfiguration, propKey)) {
                jq.validator.defaults[propKey] = validationConfiguration[propKey];
            }
        }
    }

}(jQuery));