/*
	Token Input Interface 1.0.0

	Copyright (c) 2023 CodeForge Corp

	Documentation for this module lives here:
	https://codeforge.com/docs/token-input-interface

	Permitted under the Apache 2.0 license:
	https://www.apache.org/licenses/LICENSE-2.0

	dev@codeforge.com

*/

(function(jq) {

	var tokenSeparators = [];
	var inputEventHandlers = [];
	jq.fn.performAutoAdjust = function(optionsObject){
	    var minimumWidth = jq(this).data('min_width_limit'),
	        maximumWidth = jq(this).data('max_width_limit'),
	        currentValue = '',
	        currentInput = jq(this),
	        sizingReference = jq('#'+jq(this).data('reference_element_id'));

	    if (currentValue === (currentValue = currentInput.val())) {return;}

	    // Populate the reference element with the input's content
	    var sanitizedContent = currentValue.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    sizingReference.html(sanitizedContent);
	    // Determine new dimensions + whether a change is warranted
	    var referenceWidth = sizingReference.width(),
	        calculatedWidth = (referenceWidth + optionsObject.paddingOffset) >= minimumWidth ? referenceWidth + optionsObject.paddingOffset : minimumWidth,
	        actualWidth = currentInput.width(),
	        isSizeChangeValid = (calculatedWidth < actualWidth && calculatedWidth >= minimumWidth)
	                             || (calculatedWidth > minimumWidth && calculatedWidth < maximumWidth);

	    // Apply width adjustment
	    if (isSizeChangeValid) {
	        currentInput.width(calculatedWidth);
	    }


  };
  jq.fn.resetInputSizing = function(config){
    // Trace: console.log(JSON.stringify(config));
    var initialMinWidth =  jq(this).data('min_width_limit') || config.minimumInputWidth || jq(this).width(),
        initialMaxWidth = jq(this).data('max_width_limit') || config.maximumInputWidth || (jq(this).closest('.token-editor').width() - config.inputHorizontalPadding),
        currentValue = '',
        inputElement = jq(this),
        referenceProbe = jq('<span/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: inputElement.css('fontSize'),
            fontFamily: inputElement.css('fontFamily'),
            fontWeight: inputElement.css('fontWeight'),
            letterSpacing: inputElement.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        probeIdentifier = jq(this).attr('id')+'_size_probe';
    if(! jq('#'+probeIdentifier).length > 0){
      referenceProbe.attr('id', probeIdentifier);
      referenceProbe.appendTo('body');
    }

    inputElement.data('min_width_limit', initialMinWidth);
    inputElement.data('max_width_limit', initialMaxWidth);
    inputElement.data('reference_element_id', probeIdentifier);
    inputElement.css('width', initialMinWidth);
  };

	jq.fn.addInputToken = function(tokenVal,tokenOptions) {
			tokenOptions = jQuery.extend({shouldFocus:false,triggerCallback:true},tokenOptions);
			this.each(function() {
				var elementId = jq(this).attr('id');

				var currentTokenList = jq(this).val().split(tokenSeparators[elementId]);
				if (currentTokenList[0] == '') {
					currentTokenList = [];
				}

				tokenVal = jQuery.trim(tokenVal);

				if (tokenOptions.unique) {
					var tokenExists = jq(this).checkTokenExistence(tokenVal);
					if(tokenExists == true) {
					    // Mark the fake input for visual feedback
    				    jq('#'+elementId+'_input').addClass('invalid_token');
    				}
				} else {
					var tokenExists = false;
				}

				if (tokenVal !='' && tokenExists != true) {
                    jq('<span>').addClass('token_item').append(
                        jq('<span>').text(tokenVal).append('&nbsp;&nbsp;'),
                        jq('<a>', {
                            href  : '#',
                            title : 'Remove token',
                            text  : 'x'
                        }).click(function () {
                            return jq('#' + elementId).removeInputToken(escape(tokenVal));
                        })
                    ).insertBefore('#' + elementId + '_addTokenField');

					currentTokenList.push(tokenVal);

					jq('#'+elementId+'_input').val('');
					if (tokenOptions.shouldFocus) {
						jq('#'+elementId+'_input').focus();
					} else {
						jq('#'+elementId+'_input').blur();
					}

					jq.fn.tokenInputInterface.updateHiddenField(this,currentTokenList);

					if (tokenOptions.triggerCallback && inputEventHandlers[elementId] && inputEventHandlers[elementId]['onTokenAdded']) {
						var handlerFunction = inputEventHandlers[elementId]['onTokenAdded'];
						handlerFunction.call(this, tokenVal);
					}
					if(inputEventHandlers[elementId] && inputEventHandlers[elementId]['onTokenListChange'])
					{
						var lastIndex = currentTokenList.length;
						var changeHandler = inputEventHandlers[elementId]['onTokenListChange'];
						changeHandler.call(this, jq(this), currentTokenList[lastIndex-1]);
					}
				}

			});

			return false;
		};

	jq.fn.removeInputToken = function(tokenToRemove) {
			tokenToRemove = unescape(tokenToRemove);
			this.each(function() {
				var elementId = jq(this).attr('id');

				var existingTokens = jq(this).val().split(tokenSeparators[elementId]);

				jq('#'+elementId+'_token_editor .token_item').remove();
				var newTokenString = '';
				for (var tokenIndex=0; tokenIndex< existingTokens.length; tokenIndex++) {
					if (existingTokens[tokenIndex]!=tokenToRemove) {
						newTokenString = newTokenString + tokenSeparators[elementId] + existingTokens[tokenIndex];
					}
				}

				jq.fn.tokenInputInterface.loadTokensFromString(this,newTokenString);

				if (inputEventHandlers[elementId] && inputEventHandlers[elementId]['onTokenRemoved']) {
					var removalHandler = inputEventHandlers[elementId]['onTokenRemoved'];
					removalHandler.call(this, tokenToRemove);
				}
			});

			return false;
		};

	jq.fn.checkTokenExistence = function(valueToCheck) {
		var elementId = jq(this).attr('id');
		var currentTokenList = jq(this).val().split(tokenSeparators[elementId]);
		return (jQuery.inArray(valueToCheck, currentTokenList) >= 0); // true if token exists, false otherwise
	};

	// Clear all existing tokens and load new ones from a provided string
	jq.fn.reloadTokens = function(tokenString) {
                var elementId = jq(this).attr('id');
		jq('#'+elementId+'_token_editor .token_item').remove();
		jq.fn.tokenInputInterface.loadTokensFromString(this,tokenString);
	}

	jq.fn.tokenInputInterface = function(interfaceOptions) {
    var configSettings = jQuery.extend({
      isInteractive:true,
      defaultPrompt:'add a token',
      minimumCharacters:0,
      containerWidth:'300px',
      containerHeight:'100px',
      autoCompletion: {selectFirst: false },
      hideOriginal:true,
      tokenSeparator: ',',
      requireUnique:true,
      removeOnBackspace:true,
      promptColor:'#666666',
      autoResizeInput: true,
      paddingOffset: 20,
      inputHorizontalPadding: 12
    },interfaceOptions);

		this.each(function() {
			if (configSettings.hideOriginal) {
				jq(this).hide();
			}
			var elementId = jq(this).attr('id');
			if (!elementId || tokenSeparators[jq(this).attr('id')]) {
				elementId = jq(this).attr('id', 'token_field_' + new Date().getTime()).attr('id');
			}

			var componentData = jQuery.extend({
				parentIdentifier:elementId,
				hidden_input_field: '#'+elementId,
				main_container: '#'+elementId+'_token_editor',
				input_wrap_area: '#'+elementId+'_addTokenField',
				visible_input_field: '#'+elementId+'_input'
			},configSettings);

			tokenSeparators[elementId] = componentData.tokenSeparator;

			if (configSettings.onTokenAdded || configSettings.onTokenRemoved || configSettings.onTokenListChange) {
				inputEventHandlers[elementId] = [];
				inputEventHandlers[elementId]['onTokenAdded'] = configSettings.onTokenAdded;
				inputEventHandlers[elementId]['onTokenRemoved'] = configSettings.onTokenRemoved;
				inputEventHandlers[elementId]['onTokenListChange'] = configSettings.onTokenListChange;
			}

			var editorMarkup = '<div id="'+elementId+'_token_editor" class="token-editor"><div id="'+elementId+'_addTokenField">';

			if (configSettings.isInteractive) {
				editorMarkup = editorMarkup + '<input id="'+elementId+'_input" value="" data-default="'+configSettings.defaultPrompt+'" />';
			}

			editorMarkup = editorMarkup + '</div><div class="clear_tokens"></div></div>';

			jq(editorMarkup).insertAfter(this);

			jq(componentData.main_container).css('width',configSettings.containerWidth);
			jq(componentData.main_container).css('min-height',configSettings.containerHeight);
			jq(componentData.main_container).css('height',configSettings.containerHeight);

			if (jq(componentData.hidden_input_field).val()!='') {
				jq.fn.tokenInputInterface.loadTokensFromString(jq(componentData.hidden_input_field),jq(componentData.hidden_input_field).val());
			}
			if (configSettings.isInteractive) {
				jq(componentData.visible_input_field).val(jq(componentData.visible_input_field).attr('data-default'));
				jq(componentData.visible_input_field).css('color',configSettings.promptColor);
		        jq(componentData.visible_input_field).resetInputSizing(configSettings);

				jq(componentData.main_container).bind('click',componentData,function(eventTrigger) {
					jq(eventTrigger.data.visible_input_field).focus();
				});

				jq(componentData.visible_input_field).bind('focus',componentData,function(eventTrigger) {
					if (jq(eventTrigger.data.visible_input_field).val()==jq(eventTrigger.data.visible_input_field).attr('data-default')) {
						jq(eventTrigger.data.visible_input_field).val('');
					}
					jq(eventTrigger.data.visible_input_field).css('color','#000000');
				});

				if (configSettings.autocomplete_source != undefined) {
					var autocompleteOptions = {source: configSettings.autocomplete_source};
					for (var optionKey in configSettings.autoCompletion) {
						autocompleteOptions[optionKey] = configSettings.autoCompletion[optionKey];
					}

					if (jQuery.Autocompleter !== undefined) {
						jq(componentData.visible_input_field).autocomplete(configSettings.autocomplete_source, configSettings.autoCompletion);
						jq(componentData.visible_input_field).bind('result',componentData,function(eventTrigger,resultData,formattedResult) {
							if (resultData) {
								jq('#'+elementId).addInputToken(resultData[0] + "",{shouldFocus:true,unique:(configSettings.requireUnique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						jq(componentData.visible_input_field).autocomplete(autocompleteOptions);
						jq(componentData.visible_input_field).bind('autocompleteselect',componentData,function(eventTrigger,uiItem) {
							jq(eventTrigger.data.hidden_input_field).addInputToken(uiItem.item.value,{shouldFocus:true,unique:(configSettings.requireUnique)});
							return false;
						});
					}


				} else {
						// If a user tabs out of the input, create a new token
						// This behavior is only available when autocomplete is not in use.
						jq(componentData.visible_input_field).bind('blur',componentData,function(eventTrigger) {
							var defaultVal = jq(this).attr('data-default');
							if (jq(eventTrigger.data.visible_input_field).val()!='' && jq(eventTrigger.data.visible_input_field).val()!=defaultVal) {
								if( (eventTrigger.data.minimumCharacters <= jq(eventTrigger.data.visible_input_field).val().length) && (!eventTrigger.data.maxCharacters || (eventTrigger.data.maxCharacters >= jq(eventTrigger.data.visible_input_field).val().length)) )
									jq(eventTrigger.data.hidden_input_field).addInputToken(jq(eventTrigger.data.visible_input_field).val(),{shouldFocus:true,unique:(configSettings.requireUnique)});
							} else {
								jq(eventTrigger.data.visible_input_field).val(jq(eventTrigger.data.visible_input_field).attr('data-default'));
								jq(eventTrigger.data.visible_input_field).css('color',configSettings.promptColor);
							}
							return false;
						});

				}
				// If user types a configured token separator (e.g., comma, semicolon), create a new token
				jq(componentData.visible_input_field).bind('keypress',componentData,function(eventTrigger) {
					if (_checkTokenSeparator(eventTrigger)) {
					    eventTrigger.preventDefault();
						if( (eventTrigger.data.minimumCharacters <= jq(eventTrigger.data.visible_input_field).val().length) && (!eventTrigger.data.maxCharacters || (eventTrigger.data.maxCharacters >= jq(eventTrigger.data.visible_input_field).val().length)) )
							jq(eventTrigger.data.hidden_input_field).addInputToken(jq(eventTrigger.data.visible_input_field).val(),{shouldFocus:true,unique:(configSettings.requireUnique)});
					  	jq(eventTrigger.data.visible_input_field).resetInputSizing(configSettings);
						return false;
					} else if (eventTrigger.data.autoResizeInput) {
			            jq(eventTrigger.data.visible_input_field).performAutoAdjust(configSettings);

          			}
				});
				// Delete the last token on backspace press
				configSettings.removeOnBackspace && jq(componentData.visible_input_field).bind('keydown', function(eventTrigger)
				{
					if(eventTrigger.keyCode == 8 && jq(this).val() == '')
					{
						 eventTrigger.preventDefault();
						 var lastTokenText = jq(this).closest('.token-editor').find('.token_item:last').text();
						 var currentId = jq(this).attr('id').replace(/_input$/, '');
						 lastTokenText = lastTokenText.replace(/[\s]+x$/, '');
						 jq('#' + currentId).removeInputToken(escape(lastTokenText));
						 jq(this).trigger('focus');
					}
				});
				jq(componentData.visible_input_field).blur();

				// Remove the 'invalid_token' class when user modifies the visible input field
				if(componentData.requireUnique) {
				    jq(componentData.visible_input_field).keydown(function(eventTrigger){
				        if(eventTrigger.keyCode == 8 || String.fromCharCode(eventTrigger.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            jq(this).removeClass('invalid_token');
				        }
				    });
				}
			} // End if configSettings.isInteractive
		});

		return this;

	};

	jq.fn.tokenInputInterface.updateHiddenField = function(targetElement,tokenArray) {
		var elementId = jq(targetElement).attr('id');
		jq(targetElement).val(tokenArray.join(tokenSeparators[elementId]));
	};

	jq.fn.tokenInputInterface.loadTokensFromString = function(targetElement,tokenString) {
		jq(targetElement).val('');
		var elementId = jq(targetElement).attr('id');
		var tokens = tokenString.split(tokenSeparators[elementId]);
		for (var tokenIndex=0; tokenIndex<tokens.length; tokenIndex++) {
			jq(targetElement).addInputToken(tokens[tokenIndex],{shouldFocus:false,triggerCallback:false});
		}
		if(inputEventHandlers[elementId] && inputEventHandlers[elementId]['onTokenListChange'])
		{
			var changeHandler = inputEventHandlers[elementId]['onTokenListChange'];
			changeHandler.call(targetElement, targetElement, tokens[tokenIndex]);
		}
	};

    /**
     * Determine if the event key matches a configured token separator
     * @param {object} eventTrigger - The keyboard event object
     * @returns {boolean} - True if a separator is matched, false otherwise
     * @private
     */
    var _checkTokenSeparator = function(eventTrigger){
        var matchFound = false; // Default: no match

        if(eventTrigger.which == 13){ // Enter key
            matchFound = true;
        }

        jq.each(eventTrigger.data.tokenSeparator ,function(index, separatorChar) {
            if(eventTrigger.which == separatorChar.charCodeAt(0)){
                matchFound = true;
            }
        });

        return matchFound;
    }
})(jQuery);