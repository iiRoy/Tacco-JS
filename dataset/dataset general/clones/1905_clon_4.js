!function(externalJquery) {

    const componentRegistry = new WeakMap();

    const standardSettings = {
        visualStyle: null,
        itemLimit: 'automatic',
        caption: null,
        displayFormat: 'values',
        noItemsText: 'Nothing chosen',
        elementWidth: null,
        menuDesign: null,
        dropdownToggleSize: null
    };

    function combineConfigurations(...sources) {
        let target = {};
        for (const source of sources) {
            if (typeof source === 'object' && source !== null) {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }

    class EnhancedSelectorControl {
        constructor(originalDomElement, initialOptions, domEvent) {
            if (domEvent) {
                domEvent.stopPropagation();
                domEvent.preventDefault();
            }

            this.originalElementRef = externalJquery(originalDomElement);
            this.generatedContainer = null;
            this.triggerButton = null;

            this.config = combineConfigurations(
                standardSettings,
                this.originalElementRef.data(),
                typeof initialOptions === 'object' && initialOptions
            );

            if (this.config.caption === null) {
                this.config.caption = this.originalElementRef.attr('title');
            }

            this.initializeComponent();
        }

        initializeComponent() {
            this.originalElementRef.hide();
            this.isMultiChoice = this.originalElementRef.prop('multiple');

            const originalClassList = this.originalElementRef.attr('class') ? this.originalElementRef.attr('class').split(/\s+/) : [];
            const originalIdentifier = this.originalElementRef.attr('id');

            this.originalElementRef.after(this.buildVisualStructure());
            this.generatedContainer = this.originalElementRef.next('.visual-selector');
            const containerNode = this.generatedContainer;
            const dropdownMenu = this.generatedContainer.find('.selection-list');
            const menuPointer = this.generatedContainer.find('.menu-arrow');

            const itemHeight = containerNode.addClass('active-open').find('.selection-list > li > a').outerHeight();
            containerNode.removeClass('active-open');
            const separatorHeight = dropdownMenu.find('li .item-separator').outerHeight(true);

            const containerOffsetTop = this.generatedContainer.offset().top;
            const componentHeight = this.generatedContainer.outerHeight();
            this.triggerButton = this.generatedContainer.find('> button');

            if (originalIdentifier !== undefined) {
                this.triggerButton.attr('id', originalIdentifier);
                externalJquery('label[for="' + originalIdentifier + '"]').on('click', () => {
                    containerNode.find('button#' + originalIdentifier).focus();
                });
            }

            originalClassList.forEach(cssClass => {
                if (cssClass !== 'selectpicker') {
                    this.generatedContainer.addClass(cssClass);
                }
            });

            if (this.isMultiChoice) {
                this.generatedContainer.addClass('multi-choice-selector');
            }

            this.triggerButton.addClass(this.config.visualStyle);
            dropdownMenu.addClass(this.config.menuDesign);
            menuPointer.addClass(() => {
                if (this.config.menuDesign) {
                    return this.config.menuDesign.replace('dropdown-', 'arrow-for-');
                }
            });

            this.verifyUsabilityStatus();
            this.checkTabOrder();
            this.attachInteractionHandlers();

            const menuBorderPadding = parseInt(dropdownMenu.css('padding-top')) + parseInt(dropdownMenu.css('padding-bottom')) + parseInt(dropdownMenu.css('border-top-width')) + parseInt(dropdownMenu.css('border-bottom-width'));
            
            if (this.config.itemLimit === 'automatic') {
                const adjustMenuSize = () => {
                    const scrollOffsetTop = containerOffsetTop - externalJquery(window).scrollTop();
                    const viewportHeight = externalJquery(window).innerHeight();
                    const menuExtraSpace = menuBorderPadding + parseInt(dropdownMenu.css('margin-top')) + parseInt(dropdownMenu.css('margin-bottom')) + 2;
                    const availableSpaceBelow = viewportHeight - scrollOffsetTop - componentHeight - menuExtraSpace;
                    let calculatedMenuHeight = availableSpaceBelow;

                    if (containerNode.hasClass('drop-up')) {
                        calculatedMenuHeight = scrollOffsetTop - menuExtraSpace;
                    }
                    dropdownMenu.css({'max-height': calculatedMenuHeight + 'px', 'overflow-y': 'auto', 'min-height': itemHeight * 3 + 'px'});
                };
                adjustMenuSize();
                externalJquery(window).on('resize', adjustMenuSize);
                externalJquery(window).on('scroll', adjustMenuSize);

                const observer = new MutationObserver(() => adjustMenuSize());
                observer.observe(this.originalElementRef[0], { childList: true, subtree: true });
                this.domObserver = observer; 
            } else if (this.config.itemLimit && this.config.itemLimit !== 'automatic' && dropdownMenu.find('li').length > this.config.itemLimit) {
                const targetIndex = dropdownMenu.find("li > *").filter(':not(.item-separator)').slice(0, this.config.itemLimit).last().parent().index();
                const separatorCount = dropdownMenu.find("li").slice(0, targetIndex + 1).find('.item-separator').length;
                let currentMenuHeight = itemHeight * this.config.itemLimit + separatorCount * separatorHeight + menuBorderPadding;
                dropdownMenu.css({'max-height': currentMenuHeight + 'px', 'overflow-y': 'scroll'});
            }

            const listObserver = new MutationObserver(this.rebuildOptionList.bind(this));
            listObserver.observe(this.originalElementRef[0], { childList: true, subtree: true, attributes: true });
            this.listObserver = listObserver;

            this.updateVisuals();
        }

        buildBaseWrapper() {
            return externalJquery(
                "<div class='button-group visual-selector'>" +
                "<button class='control-button dropdown-toggle-trigger clear-fix' data-toggle='dropdown'>" +
                "<span class='text-display pull-left'></span>&nbsp;" +
                "<span class='caret-indicator'></span>" +
                "</button>" +
                "<span class='menu-arrow'></span>" +
                "<ul class='selection-list' role='menu'>" +
                "</ul>" +
                "</div>"
            );
        }

        buildVisualStructure() {
            const baseWrapper = this.buildBaseWrapper();
            const optionItems = this.buildOptionList();
            baseWrapper.find('ul').append(optionItems);
            return baseWrapper;
        }

        rebuildOptionList() {
            this.clearOptionList();
            const newOptionItems = this.buildOptionList();
            this.generatedContainer.find('ul').append(newOptionItems);
            this.updateVisuals();
        }

        clearOptionList() {
            this.generatedContainer.find('li').remove();
        }

        buildOptionList() {
            const generatedHtmlFragments = [];
            const optionElements = this.originalElementRef.find('option');

            optionElements.each((index, element) => {
                const $currentOption = externalJquery(element);
                const itemCssClass = $currentOption.attr("class") || '';
                let itemText = $currentOption.text();
                const itemSubtext = $currentOption.data('subtext') ? `<small class="muted-text">${$currentOption.data('subtext')}</small>` : '';

                itemText += itemSubtext;

                if ($currentOption.parent().is('optgroup') && !$currentOption.data('divider')) {
                    if ($currentOption.index() === 0) {
                        const groupLabel = $currentOption.parent().attr('label');
                        const groupSubtext = $currentOption.parent().data('subtext') ? `<small class="muted-text">${$currentOption.parent().data('subtext')}</small>` : '';
                        const fullGroupLabel = groupLabel + groupSubtext;

                        if (element.index !== 0) {
                            generatedHtmlFragments.push(
                                `<div class="item-separator"></div>` +
                                `<dt>${fullGroupLabel}</dt>` +
                                this.createAnchorMarkup(itemText, `group-item ${itemCssClass}`)
                            );
                        } else {
                            generatedHtmlFragments.push(
                                `<dt>${fullGroupLabel}</dt>` +
                                this.createAnchorMarkup(itemText, `group-item ${itemCssClass}`)
                            );
                        }
                    } else {
                        generatedHtmlFragments.push(this.createAnchorMarkup(itemText, `group-item ${itemCssClass}`));
                    }
                } else if ($currentOption.data('divider')) {
                    generatedHtmlFragments.push('<div class="item-separator"></div>');
                } else if ($currentOption.data('hidden')) {
                    generatedHtmlFragments.push('');
                } else {
                    generatedHtmlFragments.push(this.createAnchorMarkup(itemText, itemCssClass));
                }
            });

            let finalLiHtml = '';
            if (optionElements.length > 0) {
                for (let i = 0; i < optionElements.length; i++) {
                    finalLiHtml += `<li data-option-index="${i}">${generatedHtmlFragments[i]}</li>`;
                }
            }

            if (this.originalElementRef.find('option:selected').length === 0 && !this.config.caption) {
                this.originalElementRef.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
            }

            return externalJquery(finalLiHtml);
        }

        createAnchorMarkup(displayContent, extraClasses) {
            return `<a tabindex="-1" href="#" class="${extraClasses}">` +
                   `<span class="content-text pull-left">${displayContent}</span>` +
                   `</a>`;
        }

        updateVisuals() {
            if (this.config.elementWidth === 'automatic') {
                const menuWidth = this.generatedContainer.find('.selection-list').css('width');
                this.generatedContainer.css('width', menuWidth);
            } else if (this.config.elementWidth && this.config.elementWidth !== 'automatic') {
                this.generatedContainer.css('width', this.config.elementWidth);
            }

            this.originalElementRef.find('option').each((index, element) => {
                const $option = externalJquery(element);
                this.setOptionDisabledState(index, $option.is(':disabled') || $option.parent().is(':disabled'));
                this.setOptionSelectedState(index, $option.is(':selected'));
            });

            const chosenItems = this.originalElementRef.find('option:selected').map((index, value) => {
                const $selectedOption = externalJquery(value);
                return $selectedOption.attr('title') || $selectedOption.text();
            }).get();

            let displayedCaption = chosenItems.join(", ");

            if (this.isMultiChoice && this.config.displayFormat.includes('count')) {
                const formatParts = this.config.displayFormat.split(">");
                if ((formatParts.length > 1 && chosenItems.length > parseInt(formatParts[1])) || (formatParts.length === 1 && chosenItems.length >= 2)) {
                    displayedCaption = `${chosenItems.length} of ${this.originalElementRef.find('option').length} chosen`;
                }
            }

            if (!displayedCaption) {
                displayedCaption = this.config.caption || this.config.noItemsText;
            }

            this.originalElementRef.next('.visual-selector').find('.text-display').html(displayedCaption);
        }

        setOptionSelectedState(idx, chosen) {
            if (chosen) {
                this.generatedContainer.find('li').eq(idx).addClass('selected-item');
            } else {
                this.generatedContainer.find('li').eq(idx).removeClass('selected-item');
            }
        }

        setOptionDisabledState(idx, unavailable) {
            if (unavailable) {
                this.generatedContainer.find('li').eq(idx).addClass('unavailable-item');
            } else {
                this.generatedContainer.find('li').eq(idx).removeClass('unavailable-item');
            }
        }

        verifyUsabilityStatus() {
            if (this.originalElementRef.is(':disabled')) {
                this.triggerButton.addClass('unavailable-item');
                this.triggerButton.on('click', e => e.preventDefault());
            }
        }

        checkTabOrder() {
            if (this.originalElementRef.is('[tabindex]')) {
                const tabIndexValue = this.originalElementRef.attr("tabindex");
                this.triggerButton.attr('tabindex', tabIndexValue);
            }
        }

        attachInteractionHandlers() {
            externalJquery('body').on('touchstart.customdropdown', '.selection-list', e => e.stopPropagation());

            this.generatedContainer.on('click', 'li a', e => {
                const clickedItemIndex = externalJquery(e.currentTarget).parent().index();
                const $clickedListItem = externalJquery(e.currentTarget).parent();
                const $parentSelector = $clickedListItem.parents('.visual-selector');
                
                if (this.isMultiChoice) {
                    e.stopPropagation();
                }
                e.preventDefault();

                if (!$parentSelector.prev('select').is(':disabled') && !$clickedListItem.hasClass('unavailable-item')) {
                    if (!this.isMultiChoice) {
                        $parentSelector.prev('select').find('option').prop('selected', false);
                        $parentSelector.prev('select').find('option').eq(clickedItemIndex).prop('selected', true).attr('selected', 'selected');
                    } else {
                        const currentlySelected = $parentSelector.prev('select').find('option').eq(clickedItemIndex).prop('selected');
                        if (currentlySelected) {
                            $parentSelector.prev('select').find('option').eq(clickedItemIndex).prop('selected', false).removeAttr('selected');
                        } else {
                            $parentSelector.prev('select').find('option').eq(clickedItemIndex).prop('selected', true).attr('selected', 'selected');
                        }
                    }

                    $parentSelector.find('.text-display').html($clickedListItem.text());
                    $parentSelector.find('button').focus();

                    $parentSelector.prev('select').trigger('change');
                }
            });

            this.generatedContainer.on('click', 'li.unavailable-item a, li dt, li .item-separator', e => {
                e.preventDefault();
                e.stopPropagation();
                const $container = externalJquery(e.currentTarget).parents('.visual-selector');
                $container.find('button').focus();
            });

            this.originalElementRef.on('change', () => this.updateVisuals());
        }

        currentValue(newValue) {
            if (newValue !== undefined) {
                this.originalElementRef.val(newValue);
                this.originalElementRef.trigger('change');
                return this.originalElementRef;
            } else {
                return this.originalElementRef.val();
            }
        }
    }

    externalJquery.fn.fancySelector = function(actionOrOptions, eventObject) {
        let returnResult;
        const processedChain = this.each(function () {
            const $thisElement = externalJquery(this);
            let instance = componentRegistry.get(this);

            if (!instance) {
                instance = new EnhancedSelectorControl(this, actionOrOptions, eventObject);
                componentRegistry.set(this, instance);
            } else {
                if (typeof actionOrOptions === 'object' && actionOrOptions !== null) {
                    for(const prop in actionOrOptions) {
                        if (Object.prototype.hasOwnProperty.call(actionOrOptions, prop)) {
                            instance.config[prop] = actionOrOptions[prop];
                        }
                    }
                    instance.updateVisuals();
                }
            }

            if (typeof actionOrOptions === 'string') {
                const methodName = actionOrOptions;
                const methodArgs = Array.prototype.slice.call(arguments, 1);

                const methodMapping = {
                    'val': 'currentValue',
                    'render': 'updateVisuals',
                    'reloadLi': 'rebuildOptionList',
                    // Add other public methods if they were exposed
                };

                const internalMethodName = methodMapping[methodName] || methodName;

                if (typeof instance[internalMethodName] === 'function') {
                    returnResult = instance[internalMethodName].apply(instance, methodArgs);
                    if (returnResult !== undefined) {
                        return false;
                    }
                } else {
                    returnResult = instance[internalMethodName];
                    if (returnResult !== undefined) {
                        return false;
                    }
                }
            }
        });

        if (returnResult !== undefined) {
            return returnResult;
        } else {
            return processedChain;
        }
    };

    externalJquery.fn.fancySelector.defaultOptions = {
        visualStyle: null,
        itemLimit: 'automatic',
        caption: null,
        displayFormat: 'values',
        noItemsText: 'Nothing chosen',
        elementWidth: null,
        menuDesign: null,
        dropdownToggleSize: null
    };

}(window.jQuery);