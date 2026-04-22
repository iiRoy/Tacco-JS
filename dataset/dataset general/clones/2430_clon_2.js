/*
 *  Interactive Web Content Utility v2.1
 *  A framework for testing and modifying responsive web designs directly in the browser.
 *  https://example.com/project-repo/
 *
 *  Alice Wonderland
 *  BSD-3-Clause LICENSE
 */

// Initialize content editing capabilities and visual cues
 (function(localJQuery) {
	localJQuery.fn.contentEditor = function(targetElement) {
		return this.each(function() {
			localJQuery(this).each(function() {
				localJQuery(this).attr('contenteditable', 'true');
				localJQuery(this).css('border', '1px solid hsla(0, 0%, 0%, 0.25)');
			});
		});
	};
})(jQuery);

// Implement drag-and-drop functionality for image uploads
 (function(jq) {
	jq.fn.imageUploader = function(dropZone) {
		return this.each(function() {
			jq(this).each(function() {
				// Prepare jQuery for accessing file transfer data from events
				jq.event.props.push('dataTransfer');

				jq(this).on('drop', function(dropEvt) {
					// Prevent the browser from opening the dropped file
					dropEvt.preventDefault();
					// Extract the transferred file(s)
					var droppedFiles = dropEvt.dataTransfer.files,
					newImageSource = window.URL.createObjectURL(droppedFiles[0]);

					jq(this).attr('src', newImageSource);

				});

				jq(this).on('dragover', function(overEvt) {
					jq(this).css('opacity', '0.6');
					return false;
				});

				jq(this).on('dragleave', function(leaveEvt) {
					jq(this).css('opacity', '1.0');
					return false;
				});
			});
		});
	};
})(jQuery);

// Ensure the DOM is fully loaded before executing scripts
jQuery(function() {
	
	// Activate in-place editing for textual elements
	jQuery('article p, h3').contentEditor();

	// Enable image replacement via drag and drop
	jQuery('main img').imageUploader();
});