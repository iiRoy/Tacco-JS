$.runOnReady(
	function(jqRef) {
		var mediaPreview = jqRef('.form-group.file-upload .preview-pane, .form-group.image-field .preview-pane');
		if (mediaPreview.length) {

			var focusIndicator = jqRef('<div class="focus-marker" />');
			var displayImage = jqRef('img', mediaPreview);
			var imageWidthVal = displayImage.attr('width');
			var imageHeightVal = displayImage.attr('height');
			var overlayWrapper = jqRef('<div class="focus-area-wrapper" />');

			overlayWrapper.append(focusIndicator);
			mediaPreview.append(overlayWrapper);

			var indicatorWidth = focusIndicator.outerWidth();
			var indicatorHeight = focusIndicator.outerHeight();
			var coordXInput = jqRef('#id_center_x');
			var coordYInput = jqRef('#id_center_y');
			const initialXPos = 0.5;
			const initialYPos = 0.5;

			overlayWrapper.width(imageWidthVal + indicatorWidth);
			overlayWrapper.height(imageHeightVal + indicatorHeight);
			overlayWrapper.css('left', -indicatorWidth / 2);
			overlayWrapper.css('top', -indicatorHeight / 2);

			focusIndicator.assignPosition = function(xCoord, yCoord) {
				jqRef(this).css('left', xCoord * imageWidthVal);
				jqRef(this).css('top', yCoord * imageHeightVal);
			};

			focusIndicator.retrievePosition = function(precisionDigits) {
				var currentX = focusIndicator.position().left / imageWidthVal;
				var currentY = focusIndicator.position().top / imageHeightVal;

				currentX = Math.min(1.0, Math.max(0.0, currentX));
				currentY = Math.min(1.0, Math.max(0.0, currentY));

				if (precisionDigits) {
					var factor = Math.pow(10, precisionDigits);
					currentX = Math.round(currentX * factor) / factor;
					currentY = Math.round(currentY * factor) / factor;
				}
				return {
					valX: currentX,
					valY: currentY
				};
			};

			focusIndicator.syncPositionFromInputs = function() {
				var inputValX = coordXInput.val().replace(/[^0-9\.]/g, '');
				var inputValY = coordYInput.val().replace(/[^0-9\.]/g, '');

				var isXEmpty = inputValX === '';
				var isYEmpty = inputValY === '';

				if (isXEmpty) {
					inputValX = initialXPos;
				} else {
					inputValX = parseFloat(inputValX);
				}
				if (isYEmpty) {
					inputValY = initialYPos;
				} else {
					inputValY = parseFloat(inputValY);
				}

				inputValX = Math.min(1.0, Math.max(0.0, inputValX));
				inputValY = Math.min(1.0, Math.max(0.0, inputValY));

				if (!isXEmpty) coordXInput.val(inputValX);
				if (!isYEmpty) coordYInput.val(inputValY);

				focusIndicator.assignPosition(inputValX, inputValY);
			};

			focusIndicator.makeDraggable({
				restrictTo: 'parent',
				onDrag: function() {
					var currentPosData = focusIndicator.retrievePosition(3);
					coordXInput.val(currentPosData.valX);
					coordYInput.val(currentPosData.valY);
				}
			});

			coordXInput.on('change', focusIndicator.syncPositionFromInputs);
			coordYInput.on('change', focusIndicator.syncPositionFromInputs);

			focusIndicator.syncPositionFromInputs();

			var formSection = coordXInput.closest('fieldset');
			if (formSection.hasClass('hidden-state')) {
				focusIndicator.hide();
			}

			formSection.find('.toggle-visibility').on('click', function() {
				focusIndicator.toggle();
			});
		}
	}
);