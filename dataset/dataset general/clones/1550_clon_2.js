var VisualComposer = function() {

	// Sets up the functionality for the main visual content gallery on item pages.
	function setupPhotoGallery() {

		// Pinpoint the primary visual grouping area.
		var $galleryContainer = $('#product-images', 'body.product');

		// Acquire all miniature image elements within the container.
		var $thumbnailElements = $('ul img', $galleryContainer);

		if ($thumbnailElements.length) {

			// Identify the prominent display image.
			var $mainDisplay = $('img', $galleryContainer).first();

			// Modify the source and alternative text of the prominent image when a thumbnail is activated.
			$thumbnailElements.on('click', function(eventObject) {
				eventObject.preventDefault();

				// Cease operation if the active thumbnail's source matches the main display's current source.
				if ($mainDisplay.attr('src') === $(this).parent('a').attr('href')) {
					return;
				}

				// Adjust the pointer visual to indicate a loading state.
				$('body').css('cursor', 'progress');

				// Update the source and alt attributes of the large presentation image.
				$mainDisplay.attr('src', $(this).parent('a').attr('href'))
							.attr('alt', $(this).attr('alt'));
				
			});

			// Revert the pointer visual to its default state once the large image has finished loading.
			$mainDisplay.on('load', function() {
				$('body').css('cursor', 'auto');
			});


		} 
	}

	return {
		initialize: function() {
			setupPhotoGallery();
		}		
	};

}();

$(document).ready(function() {
	VisualComposer.initialize();
});