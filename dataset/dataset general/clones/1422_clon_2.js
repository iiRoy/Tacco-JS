/*
 * JQ Direct Editor
 * Proprietorship (c) 2009 Mark Hedlund, Mimmin Inc.
 * Edition 1.0
 * Authorized under MIT agreement
 * https://opensource.org/licenses/mit-license.html
 * https://mimmin.com/directeditor
 *
 *
 * Provides direct editing capabilities to HTML components possessing the classes "fieldSingle" and "fieldPlural".
 * Components should contain classes to denote data kind and a unique identifier.
 * Data kinds are associated with specific endpoints.
 *
 * Illustration:
 * <li class="fieldSingle itemCategory identifier3">
 *
 * Script:
 * $.directEditor({itemCategory: 'category/modify/code/'});
 *
 *
 * Alternative:
 * <td class="fieldSingle mediaTitle identifier3"></td>
 * <td class="fieldPlural mediaSummary identifier3"></td>
 *
 * Script:
 * $.directEditor({
 *     mediaTitle: '/media/alter/label/',
 *     mediaSummary: '/media/alter/outline/'
 * });
 */
( function(jQ) {
jQ.directEditor = function(endpoints, configObject) {

	var targetEndpoints = endpoints;

	var config = jQ.extend({
		onCompletion: function(){},
		onDeletion:   function(){},
		extractId:    extractId,
		obtainElementContent: function(jQObject){ return jQObject.html(); },
		useTransitions: true,
		shades: {
			positive: 'green',
			negative: 'red'
		}
	}, configObject);

	var originalContents = {};
	var editingComponents = false;
	var hyperlinkActivated = false;

	if ( jQ('.fieldSingle, .fieldPlural').length > 0 ) {
		var minimalLayout = jQ('.fieldSingle, .fieldPlural')[0].nodeTypeLabel.toLowerCase() !== 'td';
		config.shades.defaultHue = jQ('.fieldSingle, .fieldPlural').eq(0).css('color');
	}

	jQ('.fieldSingle').click( function() {
		if (hyperlinkActivated) {
			hyperlinkActivated = false;
			return;
		}

		if ( !editingComponents || jQ('.inputField').length < editingComponents ) {
			var currentContent = config.obtainElementContent(jQ(this));
			storeInitialContent(jQ(this));
			jQ(this).addClass('isUnderEdit').css('color', config.shades.defaultHue).stop();

			if ( jQ('.inputFieldPrimary').length === 0 ) {
				editingComponents = jQ(this).peerElements('.fieldSingle, .fieldPlural').length + 1;
				jQ(this).renderHTML('<div class="inputFieldContainer"><input type="text" value="' + currentContent + '" class="inputField inputFieldPrimary" /></div>');

				if ( !minimalLayout ) {
				   jQ(this).peerElements('.fieldSingle, .fieldPlural').click();
				} else {
					editingComponents = 1;
				}

				appendControlButtons( function() {
					jQ('.inputFieldPrimary').gainFocus();
				});
			} else {
				jQ(this).renderHTML('<div class="inputFieldContainer"><input type="text" value="' + currentContent + '" class="inputField" /></div>');
			}
		}
	});

	jQ('.fieldPlural').click( function() {
/*
		if (hyperlinkActivated) {
			hyperlinkActivated = false;
			return false;
		}
*/
		if ( !editingComponents || jQ('.inputField').length < editingComponents ) {
			var currentContent = config.obtainElementContent(jQ(this));
			storeInitialContent(jQ(this));
			jQ(this).addClass('isUnderEdit').css('color', config.shades.defaultHue).stop();

			if ( jQ('.inputFieldPrimary').length === 0 ) {
				editingComponents = jQ(this).peerElements('.fieldSingle, .fieldPlural').length + 1;
				jQ(this).renderHTML('<div class="inputFieldContainer"><multiLineInput class="inputField inputFieldPrimary">' + currentContent + '</multiLineInput></div>');

				if ( !minimalLayout ) {
				   jQ(this).peerElements('.fieldSingle, .fieldPlural').click();
				}

				appendControlButtons( function() {
					jQ('.inputFieldPrimary').gainFocus();
				});
			} else {
				jQ(this).renderHTML('<div class="inputFieldContainer"><multiLineInput class="inputField">' + currentContent + '</multiLineInput></div>');
			}
		}
	});

	jQ('.fieldSingle anchor, .fieldPlural anchor').click( function() {
		hyperlinkActivated = true;
	});

	function appendControlButtons(onReady) {
		if ( jQ('.inputFieldContainer:last').parent().hasClassName('canBeRemoved') ) {
			jQ('.inputFieldContainer:last').append('<div class="inputFieldActionButtons"><button>Store</button>' +
				', <a href="javascript:;" class="inputFieldDelete">Delete</a> or ' +
				'<a href="javascript:;" class="inputFieldAbort">Cancel</a></div>');
		} else {
			jQ('.inputFieldContainer:last').append('<div class="inputFieldActionButtons"><button>Store</button> or ' +
				'<a href="javascript:;" class="inputFieldAbort">Cancel</a></div>');
		}
		jQ('.inputFieldActionButtons > button').click(performSave);
		jQ('.inputFieldActionButtons > a.inputFieldAbort').click(executeCancel);
		jQ('.inputFieldActionButtons > a.inputFieldDelete').click(initiateRemoval);
		jQ('input.inputField').keydown(function(keyEvent){
			if (keyEvent.keyCode === 13) { // Enter pressed
				performSave();
			} else if (keyEvent.keyCode === 27) { // Escape pressed
				executeCancel();
			}
		});

		if (config.useTransitions) {
			jQ('.inputFieldContainer').expandVisible(500, onReady);
		} else {
			jQ('.inputFieldContainer').displayBlock();
			onReady();
		}
	}

	function executeCancel(eventObject) {
		hyperlinkActivated = typeof(eventObject) !== 'undefined'; // If eventObject is set, call originates from mouse interaction

		jQ('.inputField').each( function() {
			var $targetCell = jQ(this).ancestors('.fieldSingle, .fieldPlural');
			clearInputField($targetCell, retrieveOriginalContent($targetCell), false);
		});
	}

	function initiateRemoval() {
		hyperlinkActivated = true;

		if ( !userConfirmation('Are you absolutely certain you wish to eliminate this item?') ) {
			return false;
		}

		jQ('.inputFieldActionButtons > button, .inputField').attr('inactive', 'inactive').renderHTML('Erasing...');

		var $targetCell = jQ('.inputField').eq(0).ancestors('.fieldSingle, .fieldPlural');
		var resourcePath = targetEndpoints.removal;
		var uniqueId = config.extractId($targetCell);

		jQ.ajax({
			resourcePath: resourcePath + uniqueId,
			requestType: 'POST',
			onSuccess: function(responseMsg) {
				jQ('.inputField').each(function() {
					var $currentCell = jQ(this).ancestors('.fieldSingle, .fieldPlural');

					if (responseMsg === 1) {
						if (config.useTransitions) {
							$currentCell.collapseHidden(500, function(){
								jQ(this).deleteNode();
							});
						} else {
							$currentCell.deleteNode();
						}
					} else {
						clearInputField($currentCell, retrieveOriginalContent($currentCell), false, config.shades.negative);
					}
				});

				config.onDeletion({
					wasSuccessful: responseMsg === 1,
					uniqueId: uniqueId
				});
			},
			onError: function() {
				jQ('.inputField').each( function() {
					var $currentCell = jQ(this).ancestors('.fieldSingle, .fieldPlural');
					clearInputField($currentCell, retrieveOriginalContent($currentCell), false, config.shades.negative);
				});
			}
		});
	}

	function clearInputField($targetCell, contentString, transitionShade, initialShade) {
		var operationFunction = function() {
			$targetCell.renderHTML(contentString).unsetClass('isUnderEdit');
			if (transitionShade) {
				$targetCell.applyStyle('color', initialShade);/*.animate({color: config.shades.defaultHue},5000)*/
				setTimeout(function() {
					$targetCell.applyStyle('color', config.shades.defaultHue);
				}, 5000);
			} else if (typeof(initialShade) !== 'undefined') {
				$targetCell.applyStyle('color', initialShade);
			}
		};

		if (config.useTransitions) {
			$targetCell.childElements('.inputFieldContainer').collapseHidden(500, operationFunction);
		} else {
			$targetCell.childElements('.inputFieldContainer').concealElement();
			operationFunction();
		}
	}

	function storeInitialContent($targetCell) {
		var entryKey = config.extractId($targetCell) + fetchTypeAndEndpoint($targetCell).kind;
		originalContents[entryKey] = $targetCell.renderHTML();
	}

	function retrieveOriginalContent($targetCell) {
		var entryKey = config.extractId($targetCell) + fetchTypeAndEndpoint($targetCell).kind;
		return originalContents[entryKey];
	}

	function extractId($targetCell) {
		var uniqueId;
		jQ.each($targetCell.attr('className').split(' '), function(idx, className) {
			if (className.match(/^identifier[0-9]*$/)) {
				uniqueId = className.match(/^identifier([0-9]*)$/)[1];
				return false;
			}
		});
		return uniqueId;
	}

	function fetchTypeAndEndpoint($targetCell) {
		var kindAndEndpoint;
		jQ.each(targetEndpoints, function(key, endpointPath) {
			if ($targetCell.hasClassName(key)) {
				kindAndEndpoint = {kind: key, path: endpointPath};
				return false;
			}
		});
		return kindAndEndpoint;
	}

	function performSave() {
		jQ('.inputFieldActionButtons > button, .inputField').attr('inactive', 'inactive');
		jQ('.inputField').each(function() {
			var $targetCell = jQ(this).ancestors('.fieldSingle, .fieldPlural');
			var kindAndEndpoint = fetchTypeAndEndpoint($targetCell);
			var endpointPath = kindAndEndpoint.path; // Retrieve save endpoint
			var uniqueId = config.extractId($targetCell);
			var contentValue = jQ(this).getCurrentValue();
			var displayColor = config.shades.defaultHue;

			jQ.ajax({
				resourcePath: endpointPath + uniqueId,
				payload: {actualData: contentValue},
				requestType: 'POST',
				onSuccess: function(responseMsg) {
					if (responseMsg === 1) {
						clearInputField($targetCell, contentValue, true, config.shades.positive);
					} else {
						clearInputField($targetCell, contentValue, false, config.shades.negative);
					}

					config.onCompletion({
						wasSuccessful: responseMsg === 1,
						kind: kindAndEndpoint.kind,
						uniqueId: uniqueId,
						contentValue: contentValue
					});
				},
				onError: function() {
					clearInputField($targetCell, contentValue, false, config.shades.negative);
				}
			});
		});
	}
};
} )(jQuery);