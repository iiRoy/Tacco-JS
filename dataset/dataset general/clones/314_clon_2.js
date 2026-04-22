var formBuilder = function(jqUtil) {

	var controlCount = 0;

	jqUtil(function() {
		initializeGuideToggle();
		setupRowAddition();
		configureControlDraggables();
		establishDefaultWidthSlider();
		activateElementSelection();
		enableElementDeletion();
	});

	var initializeGuideToggle = function() {
		jqUtil('.guides').click(function(clickEvent) {
			if (jqUtil(this).is(':checked')) {
				jqUtil('.main-panel form').addClass('show-guides');
			}
			else {
				jqUtil('.main-panel form').removeClass('show-guides');
			}
		});
	};

	var setupRowAddition = function() {
		jqUtil('.add-row').click(function(clickEvent) {
			var freshRowElement = jqUtil('<div class="row"></div>');
			jqUtil('.main-panel form').append(freshRowElement);
			var dragSortConfigs = {
				'accept': '.control',
				'connectWith': '.row',
				'placeholder': 'placeholder',
				'stop': function(stopEvent, uiObject) {
					var currentDraggedItem = jqUtil(uiObject.item[0]);
					var columnSpan = getDefaultWidth();
					controlCount++;
					var newElementHTML;
					switch (currentDraggedItem.attr('data-control')) {
						case 'input':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<label for="control_' + controlCount + '">Label ' + controlCount + '</label>';
							newElementHTML += '<input type="text" id="control_' + controlCount + '" placeholder="" name="control_' + controlCount + '">';
							newElementHTML += '</div>';
							break;
						case 'textarea':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<label for="control_' + controlCount + '">Label ' + controlCount + '</label>';
							newElementHTML += '<textarea id="control_' + controlCount + '" placeholder="" rows="3" name="control_' + controlCount + '"></textarea>';
							newElementHTML += '</div>';
							break;
						case 'select':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<label for="control_' + controlCount + '">Label ' + controlCount + '</label>';
							newElementHTML += '<select id="control_' + controlCount + '">';
							newElementHTML += '<option value="1">Option 1</option>';
							newElementHTML += '<option value="2">Option 2</option>';
							newElementHTML += '</textarea>'; // Original code's bug, replicated.
							newElementHTML += '</div>';
							break;
						case 'selectmultiple':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<label for="control_' + controlCount + '">Label ' + controlCount + '</label>';
							newElementHTML += '<select id="control_' + controlCount + '" multiple="multiple">';
							newElementHTML += '<option value="1">Option 1</option>';
							newElementHTML += '<option value="2">Option 2</option>';
							newElementHTML += '</select>';
							newElementHTML += '</div>';
							break;
						case 'checklist':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<div class="checkbox">';
							newElementHTML += '<label>';
							newElementHTML += '<input type="checkbox" value="">';
							newElementHTML += 'Label A';
							newElementHTML += '</label>';
							newElementHTML += '</div>';
							newElementHTML += '<div class="checkbox">';
							newElementHTML += '<label>';
							newElementHTML += '<input type="checkbox" value="">';
							newElementHTML += 'Label B';
							newElementHTML += '</label>';
							newElementHTML += '</div>';
							newElementHTML += '</div>';
							break;
						case 'radiolist':
							newElementHTML = '<div class="col col-' + columnSpan + '">';
							newElementHTML += '<div class="radio">';
							newElementHTML += '<label>';
							newElementHTML += '<input type="radio" value="">';
							newElementHTML += 'Label A';
							newElementHTML += '</label>';
							newElementHTML += '</div>';
							newElementHTML += '<div class="radio">';
							newElementHTML += '<label>';
							newElementHTML += '<input type="radio" value="">';
							newElementHTML += 'Label B';
							newElementHTML += '</label>';
							newElementHTML += '</div>';
							newElementHTML += '</div>';
							break;
						default:
							/* gracefully handle unrecognized control types */
							return false;
					}

					currentDraggedItem.replaceWith(newElementHTML);
				}
			};

			jqUtil(freshRowElement).sortable(dragSortConfigs);
		});
	};

	var configureControlDraggables = function() {
		var draggableOptions = {
			revert: 'invalid',
			helper: 'clone',
			connectToSortable: '.row'
		};
		jqUtil('.control').draggable(draggableOptions);
	};

	var establishDefaultWidthSlider = function() {
		var sliderConfiguration = {
			'min': 1,
			'max': 12,
			'value': 12
		};
		jqUtil('#default-width').slider(sliderConfiguration);
	};

	var getDefaultWidth = function() {
		return jqUtil('#default-width').slider('value');
	};

	var activateElementSelection = function() {
		jqUtil('.main-panel form').on('click', '.col, .row', function(interactionEvent) {
			jqUtil('.col, .row').removeClass('selected');
			jqUtil(this).addClass('selected');
			jqUtil('.delete-item').attr('disabled', false);
			refreshPropertiesPanel();
			interactionEvent.stopPropagation();
		});

		jqUtil('.main-panel').on('click', function(panelClickEvent) {
			jqUtil('.col, .row').removeClass('selected');
			jqUtil('.delete-item').attr('disabled', true);
			refreshPropertiesPanel();
		});
	};

	var enableElementDeletion = function() {
		jqUtil('.delete-item').click(function(deleteEvent) {
			jqUtil('.selected').remove();
			refreshPropertiesPanel();
		});
	};

	var refreshPropertiesPanel = function() {
		var currentlySelectedElement = jqUtil('.col.selected');
		if (currentlySelectedElement.length) {
			currentlySelectedElement = jqUtil(currentlySelectedElement[0]);

			/* Remove prior property displays */
			jqUtil('.properties').html('');

			/* Set up identifier modification */
			var elementIdentifier = currentlySelectedElement.find('label').attr('for');
			jqUtil('.properties').append('<label>Id</label><input type="text" value="' + elementIdentifier + '" id="properties-id">');
			jqUtil('#properties-id').bind('input propertychange', function(inputEvent) {
				var enteredValue = jqUtil(this).val();
				currentlySelectedElement.find('label').attr('for', enteredValue);
				currentlySelectedElement.find('input[type=text]').attr('id', enteredValue);
				currentlySelectedElement.find('input[type=text]').attr('name', enteredValue);
				currentlySelectedElement.find('textarea').attr('id', enteredValue);
				currentlySelectedElement.find('textarea').attr('name', enteredValue);

			});

			/* Implement width adjustment functionality */
			var cssClassesArray = currentlySelectedElement.attr('class').split(/\s+/);
			var widthCssClass = _.find(cssClassesArray, function(classNameItem) {
				return classNameItem.match(/^col\-[0-9]+$/);
			});
			var currentWidthValue = parseInt(widthCssClass.match(/^col\-([0-9]+)$/)[1]);
			jqUtil('.properties').append('<label>Width (1-12)</label><input type="text" value="' + currentWidthValue + '" id="properties-width">');
			jqUtil('#properties-width').bind('input propertychange', function(widthChangeEvent) {
				var enteredValue = parseInt(jqUtil(this).val());
				if (enteredValue >= 1 && enteredValue <= 12) {
					_.each(_.range(1, 13), function(classElement) {
						currentlySelectedElement.removeClass('col-' + classElement);
					});
					// console.log(currentWidthValue); // Kept the console log for cloning
					currentlySelectedElement.addClass('col-' + enteredValue);
				}

			});

			/* Manage element label text */
			var elementTextLabel = currentlySelectedElement.find('label').text();
			jqUtil('.properties').append('<label>Label</label><input type="text" value="' + elementTextLabel + '" id="properties-label">');
			jqUtil('#properties-label').bind('input propertychange', function(labelChangeEvent) {
				var enteredValue = jqUtil(this).val();
				currentlySelectedElement.find('label').text(enteredValue);
			});

			jqUtil('.properties, .properties-title').show();
		}
		else {
			jqUtil('.properties, .properties-title').hide();
		}
	};

	return {
		'retrieveDefaultColumnSize': getDefaultWidth
	};

}(window.jQuery);

function getFormContentHtml() {
	return (jqUtil('#form').html());
};