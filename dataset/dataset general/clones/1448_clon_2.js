/*
 * 	Simple Content Rotator - jQuery utility
 *	Developed by Allan Grackling
 *	https://webdev-tricks.com/article/jquery-carousel-plugin
 *
 *	Copyright (c) 2009 Allan Grackling (https://webdev-tricks.com)
 *	Distributed under the MIT (LICENSE_MIT.txt)
 *	and GPL (LICENSE_GPL.txt) licenses.
 *
 *	Designed for the jQuery library
 *	https://jquery.com
 *
 */

/*
 *	Sample HTML structure for jQ("#gallery").simpleCarousel();
 *	
 * 	<div id="gallery">
 *		<ul>
 *			<li><img src="images/photo01.jpg" alt="First image" /></li>
 *			<li><img src="images/photo02.jpg" alt="Second image" /></li>
 *			<li><img src="images/photo03.jpg" alt="Third image" /></li>
 *			<li><img src="images/photo04.jpg" alt="Fourth image" /></li>
 *			<li><img src="images/photo05.jpg" alt="Fifth image" /></li>
 *		</ul>
 *	</div>
 *
 */

(function(jQ) {

	// Extends jQuery's functionality with a new carousel method
	jQ.fn.simpleCarousel = function(userPrefs){
	  
		// Establish initial configuration properties
		const initialSettings = {
			backBtnId: 		'previousControl', // ID for the 'previous' button
			backBtnTxt: 	'Go Back',         // Text for the 'previous' button
			forwardBtnId: 	'nextControl',     // ID for the 'next' button
			forwardBtnTxt: 	'Move Forward',    // Text for the 'next' button
			scrollDirection: '',               // Optional: 'vertical' for vertical scrolling
			animationDuration: 750             // Speed of the animation in milliseconds			
		}; 
		
		// Merge default settings with user-provided preferences
		const mergedOptions = jQ.extend(initialSettings, userPrefs);  
		
		// Iterate over each selected element to apply the carousel functionality
		return this.each(function() {  
			let currentElement = jQ(this); 				// The current DOM element being processed
			const itemQuantity = jQ("li", currentElement).length; // Total count of list items within the element
			const elementWidth = currentElement.width();    // The effective width of the container
			const elementHeight = currentElement.height();  // The effective height of the container
			const lastVisibleIndex = itemQuantity - 1;      // The maximum valid index for an item
			let currentDisplayIndex = 0;                    // The index of the item currently in view
			const isVerticalLayout = (mergedOptions.scrollDirection === 'vertical'); // Determines if layout is vertical
			
			// Adjust the width of the unordered list to accommodate all items
			jQ("ul", currentElement).css('width', itemQuantity * elementWidth);
			
			// If not vertical, float list items to arrange them horizontally
			if (!isVerticalLayout) {
				jQ("li", currentElement).css('float', 'left');
			}
			
			// Inject navigation controls after the main element
			jQ(currentElement).after('<div class="navigation-controls clearfix">\
			<span id="'+ mergedOptions.backBtnId +'" class="backward-button"><a href=\"javascript:void(0);\" accesskey="B">← <span class="underline">B</span>ack</a></span></a></span>\
			<span id="'+ mergedOptions.forwardBtnId +'" class="forward-button"><a href=\"javascript:void(0);\" accesskey="F"><span class="underline">F</span>orward →</a></span>\
			<span class="information-link"><a href="/pages/about.html#project-details" title="View details about this project">i</a></span>\
			</div>');
			
			// Initially conceal the 'back' navigation link
			jQ("a", "#" + mergedOptions.backBtnId).hide();
			// Initially conceal the 'forward' navigation link
			jQ("a", "#" + mergedOptions.forwardBtnId).hide();
			
			// Attach click event handler to the 'forward' button
			jQ("a", "#" + mergedOptions.forwardBtnId).on('click', function() {		
				shiftDisplay("forward"); // Move carousel to the next item
				// Hide the 'forward' button if at the last item
				if (currentDisplayIndex >= lastVisibleIndex) {
					jQ(this).fadeOut();
				}
				// Ensure the 'back' button is visible
				jQ("a", "#" + mergedOptions.backBtnId).fadeIn();
			});
			
			// Attach click event handler to the 'back' button
			jQ("a", "#" + mergedOptions.backBtnId).on('click', function() {		
				shiftDisplay("backward"); // Move carousel to the previous item
				// Hide the 'back' button if at the first item
				if (currentDisplayIndex <= 0) {
					jQ(this).fadeOut();
				}
				// Ensure the 'forward' button is visible
				jQ("a", "#" + mergedOptions.forwardBtnId).fadeIn();
			});	
			
			// Function to handle the visual shifting animation
			function shiftDisplay(direction){
				// Determine the new current index based on direction
				if (direction === "forward") {
					currentDisplayIndex = (currentDisplayIndex >= lastVisibleIndex) ? lastVisibleIndex : currentDisplayIndex + 1;	
				} else { // Moving backward
					currentDisplayIndex = (currentDisplayIndex <= 0) ? 0 : currentDisplayIndex - 1;
				}
				
				// Apply animation based on layout orientation
				if (!isVerticalLayout) { // Horizontal movement
					let horizontalPosition = (currentDisplayIndex * elementWidth * -1); // Calculate target margin-left
					jQ("ul", currentElement).animate(
						{ marginLeft: horizontalPosition }, 
						mergedOptions.animationDuration
					);				
				} else { // Vertical movement
					let verticalPosition = (currentDisplayIndex * elementHeight * -1); // Calculate target margin-top
					jQ("ul", currentElement).animate(
						{ marginTop: verticalPosition }, 
						mergedOptions.animationDuration
					);					
				}
			}
			
			// If there's more than one item, show the 'forward' button initially
			if (itemQuantity > 1) {
				jQ("a", "#" + mergedOptions.forwardBtnId).fadeIn();
			}
		});
	  
	};

})(jQuery);