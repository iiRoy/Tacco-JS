!function(jq) {

    var OptionSelector = function(hostElem, initialSettings, eventData) {
        if (eventData) {
            eventData.stopPropagation();
            eventData.preventDefault();
        }
        this.$hostElement = jq(hostElem);
        this.$displayWrapper = null;
        this.toggleBtn = null;

        this.userConfig = jq.extend({}, jq.fn.optionSelector.defaultPreferences, this.$hostElement.data(), typeof initialSettings == 'object' && initialSettings);

        if (this.userConfig.titleText == null) {
            this.userConfig.titleText = this.$hostElement.attr('title');
        }

        this.getValue = OptionSelector.prototype.getValue;
        this.updateDisplay = OptionSelector.prototype.updateDisplay;
        this.initializeComponent();
    };

    OptionSelector.prototype = {

        constructor: OptionSelector,

        initializeComponent: function(evt) {
            var instanceRef = this;
            this.$hostElement.hide();
            this.isMultiple = this.$hostElement.prop('multiple');


            var styleClasses = this.$hostElement.attr('class') !== undefined ? this.$hostElement.attr('class').split(/\s+/) : '';
            var elementId = this.$hostElement.attr('id');
            this.$hostElement.after(this.createVisualComponent());
            this.$displayWrapper = this.$hostElement.next('.select-wrapper');
            var componentNode = this.$displayWrapper;
            var dropdownMenu = this.$displayWrapper.find('.list-panel');
            var pointerIndicator = this.$displayWrapper.find('.panel-arrow');
            var itemActivators = dropdownMenu.find('li > a');
            var rowHeight = componentNode.addClass('open-state').find('.list-panel li > a').outerHeight();
            componentNode.removeClass('open-state');
            var separatorHeight = dropdownMenu.find('li .item-divider').outerHeight(true);
            var wrapperYOffset = this.$displayWrapper.offset().top;
            var displayLimit = 0;
            var panelHeight = 0;
            var wrapperFullHeight = this.$displayWrapper.outerHeight();
            this.toggleBtn = this.$displayWrapper.find('> button');
            if (elementId !== undefined) {
                this.toggleBtn.attr('id', elementId);
                jq('label[for="' + elementId + '"]').click(function() {
                    componentNode.find('button#' + elementId).focus();
                })
            }
            for (var idx = 0; idx < styleClasses.length; idx++) {
                if (styleClasses[idx] != 'selectpicker') {
                    this.$displayWrapper.addClass(styleClasses[idx]);
                }
            }
            if (this.isMultiple) {
                this.$displayWrapper.addClass('multi-choice');
            }
            this.toggleBtn.addClass(this.userConfig.buttonStyle);
            dropdownMenu.addClass(this.userConfig.listStyle);
            pointerIndicator.addClass(function() {
                if (instanceRef.userConfig.listStyle) {
                    return instanceRef.userConfig.listStyle.replace('dropdown-', 'panel-arrow-');
                }
            });
            this.checkToggleStatus();
            this.checkFocusOrder();
            this.setupInteractionHandlers();
            var panelTotalPadding = parseInt(dropdownMenu.css('padding-top')) + parseInt(dropdownMenu.css('padding-bottom')) + parseInt(dropdownMenu.css('border-top-width')) + parseInt(dropdownMenu.css('border-bottom-width'));
            if (this.userConfig.displaySize == 'auto') {
                function adjustPanelDimensions() {
                    var wrapperScrollAdjustedY = wrapperYOffset - jq(window).scrollTop();
                    var viewportHeight = jq(window).innerHeight;
                    var listExtraSpace = panelTotalPadding + parseInt(dropdownMenu.css('margin-top')) + parseInt(dropdownMenu.css('margin-bottom')) + 2;
                    var wrapperBottomClearance = viewportHeight - wrapperScrollAdjustedY - wrapperFullHeight - listExtraSpace;
                    panelHeight = wrapperBottomClearance;
                    if (componentNode.hasClass('dropup')) {
                        panelHeight = wrapperScrollAdjustedY - listExtraSpace;
                    }
                    dropdownMenu.css({
                        'max-height': panelHeight + 'px',
                        'overflow-y': 'auto',
                        'min-height': rowHeight * 3 + 'px'
                    });
                }
                adjustPanelDimensions();
                jq(window).resize(adjustPanelDimensions);
                jq(window).scroll(adjustPanelDimensions);
                this.$hostElement.bind('DOMNodeInserted', adjustPanelDimensions);
            } else if (this.userConfig.displaySize && this.userConfig.displaySize != 'auto' && dropdownMenu.find('li').length > this.userConfig.displaySize) {
                var itemIndex = dropdownMenu.find("li > *").filter(':not(.item-divider)').slice(0, this.userConfig.displaySize).last().parent().index();
                var separatorNum = dropdownMenu.find("li").slice(0, itemIndex + 1).find('.item-divider').length;
                panelHeight = rowHeight * this.userConfig.displaySize + separatorNum * separatorHeight + panelTotalPadding;
                dropdownMenu.css({
                    'max-height': panelHeight + 'px',
                    'overflow-y': 'scroll'
                });
            }

            this.$hostElement.bind('DOMNodeInserted', jq.proxy(this.refreshItems, this));

            this.updateDisplay();
        },

        createVisualComponent: function() {
            var widgetHtml =
                "<div class='btn-group select-wrapper'>" +
                "<button class='btn dropdown-toggle-btn clearfix' data-toggle='dropdown'>" +
                "<span class='selected-label pull-left'></span>&nbsp;" +
                "<span class='caret-icon'></span>" +
                "</button>" +
                "<span class='panel-arrow'></span>" +
                "<ul class='list-panel' role='menu'>" +
                "</ul>" +
                "</div>";

            return jq(widgetHtml);
        },


        createDisplayView: function() {
            var $widgetContainer = this.createVisualComponent();
            var $listItems = this.buildListElements();
            $widgetContainer.find('ul').append($listItems);
            return $widgetContainer;
        },

        refreshItems: function() {
            this.removeOptionElements();
            $listItems = this.buildListElements();
            this.$displayWrapper.find('ul').append($listItems);
            this.updateDisplay();
        },

        removeOptionElements: function() {
            this.$displayWrapper.find('li').remove();
        },

        buildListElements: function() {

            var instanceRef = this;
            var optionTexts = [];
            var itemLinkHtml = [];
            var combinedItemMarkup = '';

            this.$hostElement.find('option').each(function() {
                optionTexts.push(jq(this).text());
            });

            this.$hostElement.find('option').each(function(idx) {
                var entryCssClass = jq(this).attr("class") !== undefined ? jq(this).attr("class") : '';
                var itemText = jq(this).text();
                var additionalInfo = jq(this).data('secondary-text') !== undefined ? '<small class="muted-text">' + jq(this).data('secondary-text') + '</small>' : '';

                itemText += additionalInfo;

                if (jq(this).parent().is('optgroup') && jq(this).data('is-divider') != true) {
                    if (jq(this).index() == 0) {
                        var groupLabel = jq(this).parent().attr('label');
                        var groupExtraInfo = jq(this).parent().data('secondary-text') !== undefined ? '<small class="muted-text">' + jq(this).parent().data('secondary-text') + '</small>' : '';
                        groupLabel += groupExtraInfo;

                        if (jq(this)[0].index != 0) {
                            itemLinkHtml.push(
                                '<div class="item-divider"></div>' +
                                '<dt>' + groupLabel + '</dt>' +
                                instanceRef.generateClickableItem(itemText, "opt-item " + entryCssClass)
                            );
                        } else {
                            itemLinkHtml.push(
                                '<dt>' + groupLabel + '</dt>' +
                                instanceRef.generateClickableItem(itemText, "opt-item " + entryCssClass));
                        }
                    } else {
                        itemLinkHtml.push(instanceRef.generateClickableItem(itemText, "opt-item " + entryCssClass));
                    }
                } else if (jq(this).data('is-divider') == true) {
                    itemLinkHtml.push('<div class="item-divider"></div>');
                } else if (jq(this).data('is-hidden') == true) {
                    itemLinkHtml.push('');
                } else {
                    itemLinkHtml.push(instanceRef.generateClickableItem(itemText, entryCssClass));
                }
            });

            if (optionTexts.length > 0) {
                for (var counter = 0; counter < optionTexts.length; counter++) {
                    var $currentOption = this.$hostElement.find('option').eq(counter);
                    combinedItemMarkup += "<li data-rel=" + counter + ">" + itemLinkHtml[counter] + "</li>";
                }
            }

            if (this.$hostElement.find('option:selected').length == 0 && !instanceRef.userConfig.titleText) {
                this.$hostElement.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
            }

            return jq(combinedItemMarkup);
        },

        generateClickableItem: function(contentString, styleClasses) {
            return '<a tabindex="-1" href="#" class="' + styleClasses + '">' +
                '<span class="item-content pull-left">' + contentString + '</span>' +
                '</a>';

        },

        updateDisplay: function() {
            var instanceRef = this;

            if (this.userConfig.panelWidth == 'auto') {
                var ulWidth = this.$displayWrapper.find('.list-panel').css('width');
                this.$displayWrapper.css('width', ulWidth);
            } else if (this.userConfig.panelWidth && this.userConfig.panelWidth != 'auto') {
                this.$displayWrapper.css('width', this.userConfig.panelWidth);
            }

            this.$hostElement.find('option').each(function(idx) {
                instanceRef.updateSelectedState(idx, jq(this).is(':disabled') || jq(this).parent().is(':disabled'));
                instanceRef.updateActiveState(idx, jq(this).is(':selected'));
            });


            var chosenOptions = this.$hostElement.find('option:selected').map(function(idx, optionValue) {
                if (jq(this).attr('label-title') != undefined) {
                    return jq(this).attr('label-title');
                } else {
                    return jq(this).text();
                }
            }).toArray();

            var buttonLabel = chosenOptions.join(", ");

            if (instanceRef.isMultiple && instanceRef.userConfig.selectedLabelFormat.indexOf('count') > -1) {
                var limitArray = instanceRef.userConfig.selectedLabelFormat.split(">");
                if ((limitArray.length > 1 && chosenOptions.length > limitArray[1]) || (limitArray.length == 1 && chosenOptions.length >= 2)) {
                    buttonLabel = chosenOptions.length + ' of ' + this.$hostElement.find('option').length + ' chosen';
                }
            }

            if (!buttonLabel) {
                buttonLabel = instanceRef.userConfig.titleText != undefined ? instanceRef.userConfig.titleText : instanceRef.userConfig.nothingChosenText;
            }

            this.$hostElement.next('.select-wrapper').find('.selected-label').html(buttonLabel);
        },


        updateActiveState: function(idx, isActive) {
            if (isActive) {
                this.$displayWrapper.find('li').eq(idx).addClass('active-item');
            } else {
                this.$displayWrapper.find('li').eq(idx).removeClass('active-item');
            }
        },

        updateSelectedState: function(idx, isDisabled) {
            if (isDisabled) {
                this.$displayWrapper.find('li').eq(idx).addClass('item-disabled');
            } else {
                this.$displayWrapper.find('li').eq(idx).removeClass('item-disabled');
            }
        },

        checkToggleStatus: function() {
            if (this.$hostElement.is(':disabled')) {
                this.toggleBtn.addClass('disabled-button');
                this.toggleBtn.click(function(evt) {
                    evt.preventDefault();
                });
            }
        },

        checkFocusOrder: function() {
            if (this.$hostElement.is('[tabindex]')) {
                var focusIndex = this.$hostElement.attr("tabindex");
                this.toggleBtn.attr('tabindex', focusIndex);
            }
        },

        setupInteractionHandlers: function() {
            var instanceRef = this;

            jq('body').on('touchstart.customDropdown', '.list-panel', function(evt) {
                evt.stopPropagation();
            });


            this.$displayWrapper.on('click', 'li a', function(evt) {
                var clickedIndex = jq(this).parent().index(),
                    $clickedItem = jq(this).parent(),
                    $componentElem = $clickedItem.parents('.select-wrapper');


                if (instanceRef.isMultiple) {
                    evt.stopPropagation();
                }

                evt.preventDefault();

                if ($componentElem.prev('select').not(':disabled') && !$clickedItem.hasClass('item-disabled')) {
                    if (!instanceRef.isMultiple) {
                        $componentElem.prev('select').find('option').removeAttr('selected');
                        $componentElem.prev('select').find('option').eq(clickedIndex).prop('selected', true).attr('selected', 'selected');
                    } else {
                        var isCurrentlySelected = $componentElem.prev('select').find('option').eq(clickedIndex).prop('selected');

                        if (isCurrentlySelected) {
                            $componentElem.prev('select').find('option').eq(clickedIndex).removeAttr('selected');
                        } else {
                            $componentElem.prev('select').find('option').eq(clickedIndex).prop('selected', true).attr('selected', 'selected');
                        }
                    }


                    $componentElem.find('.selected-label').html($clickedItem.text());
                    $componentElem.find('button').focus();

                    $componentElem.prev('select').trigger('change');
                }

            });

            this.$displayWrapper.on('click', 'li.item-disabled a, li dt, li .item-divider', function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                $componentElem = jq(this).parent().parents('.select-wrapper');
                $componentElem.find('button').focus();
            });

            this.$hostElement.on('change', function(evt) {
                instanceRef.updateDisplay();
            });
        },

        getValue: function(newValue) {

            if (newValue != undefined) {
                this.$hostElement.val(newValue);

                this.$hostElement.trigger('change');
                return this.$hostElement;
            } else {
                return this.$hostElement.val();
            }
        }

    };

    jq.fn.optionSelector = function(configOrMethod, invocationArgs) {
        var allArgs = arguments;
        var methodReturnValue;
        var chainableResult = this.each(function() {
            var $currentElement = jq(this),
                instanceData = $currentElement.data('optionSelector'),
                settingsObject = typeof configOrMethod == 'object' && configOrMethod;

            if (!instanceData) {
                $currentElement.data('optionSelector', (instanceData = new OptionSelector(this, settingsObject, invocationArgs)));
            } else {
                for (var prop in configOrMethod) {
                    instanceData[prop] = configOrMethod[prop];
                }
            }

            if (typeof configOrMethod == 'string') {
                var methodName = configOrMethod;
                if (instanceData[methodName] instanceof Function) {
                    [].shift.apply(allArgs);
                    methodReturnValue = instanceData[methodName].apply(instanceData, allArgs);
                } else {
                    methodReturnValue = instanceData[methodName];
                }
            }
        });

        if (methodReturnValue != undefined) {
            return methodReturnValue;
        } else {
            return chainableResult;
        }
    };

    jq.fn.optionSelector.defaultPreferences = {
        buttonStyle: null,
        displaySize: 'auto',
        titleText: null,
        selectedLabelFormat: 'values',
        nothingChosenText: 'Nothing chosen',
        panelWidth: null,
        listStyle: null,
        toggleSize: null
    }

}(window.jQuery);