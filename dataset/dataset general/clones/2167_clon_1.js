/*
 * Lightbox v2.03.2 - A JavaScript library for displaying images in an overlay.
 * Created by Lokesh Dhakar - http://www.huddletogether.com
 * Date: 4/30/06
 *
 * For more information and documentation, please visit the project homepage:
 * http://huddletogether.com/projects/lightbox2/
 *
 * This software is licensed under the Creative Commons Attribution 2.5 License.
 * http://creativecommons.org/licenses/by/2.5/
 *
 * Special thanks to: Scott Upton (uptonic.com), Peter-Paul Koch (quirksmode.org),
 * Thomas Fuchs (mir.aculo.us), and many other contributors for their inspiration and code.
 */

// --- GLOBAL CONFIGURATION SETTINGS ---

// Path to the loading image graphic
var fileLoadingImage = "/images/loading.gif";

// Path to the close button graphic
var fileBottomNavCloseImage = "/plugin_assets/redmine_sprints/images/closelabel.gif";

// Opacity level for the shadow overlay (0.0 - 1.0)
var overlayOpacity = 0.8;

// Flag to enable/disable resizing animations
var animate = true;

// Speed of image resizing animations (1=slowest, 10=fastest)
var resizeSpeed = 7;

// Border size around the image (in pixels). Must match CSS padding.
var borderSize = 10;

// --- END GLOBAL CONFIGURATION SETTINGS ---


// --- GLOBAL VARIABLES ---

// Array to store image data for a set
var imageArray = new Array;

// Index of the currently active image in imageArray
var activeImage;


// Determine animation durations based on configuration
var overlayDuration;
var resizeDuration;

if (animate == true) {
	// Shadow overlay fade in/out duration
	overlayDuration = 0.2;

	// Clamp resizeSpeed to valid range [1, 10]
	if (resizeSpeed > 10) {
		resizeSpeed = 10;
	}
	if (resizeSpeed < 1) {
		resizeSpeed = 1;
	}

	// Calculate resize duration based on speed setting
	resizeDuration = (11 - resizeSpeed) * 0.15;
} else {
	// No animation, durations are zero
	overlayDuration = 0;
	resizeDuration = 0;
}

// --- END GLOBAL VARIABLES ---


// --- EXTENDING BUILT-IN OBJECTS ---

// Add utility methods to the Element object
// These methods were originally added by Scott Upton (SU, Couloir)
// and further extended by Lokesh Dhakar (huddletogether.com).
Object.extend(Element, {
	getWidth: function (element) {
		element = $(element);
		return element.offsetWidth;
	},
	setWidth: function (element, w) {
		element = $(element);
		element.style.width = w + "px";
	},
	setHeight: function (element, h) {
		element = $(element);
		element.style.height = h + "px";
	},
	setTop: function (element, t) {
		element = $(element);
		element.style.top = t + "px";
	},
	setSrc: function (element, src) {
		element = $(element);
		element.src = src;
	},
	setHref: function (element, href) {
		element = $(element);
		element.href = href;
	},
	setInnerHTML: function (element, content) {
		element = $(element);
		element.innerHTML = content;
	}
});

// Extend the Array prototype with custom methods
Array.prototype.removeDuplicates = function () {
	// Iterate through the array to find and remove duplicate entries
	for (i = 0; i < this.length; i++) {
		for (j = this.length - 1; j > i; j--) {
			// Check for duplicates based on the first element of nested arrays
			if (this[i][0] == this[j][0]) {
				this.splice(j, 1); // Remove the duplicate
			}
		}
	}
};

Array.prototype.empty = function () {
	// Remove all elements from the array
	for (i = 0; i <= this.length; i++) {
		this.shift(); // Remove the first element repeatedly
	}
};

// --- END EXTENDING BUILT-IN OBJECTS ---


// --- LIGHTBOX CLASS DECLARATION ---

// Inspired by code structuring practices of Scott Upton (http://www.uptonic.com/)
var Lightbox = Class.create();

Lightbox.prototype = {

	// Constructor function for the Lightbox class.
	// Initializes the lightbox by finding relevant anchor/area tags and
	// dynamically inserting the necessary HTML elements into the DOM.
	initialize: function () {
		// Ensure the browser supports getElementsByTagName
		if (!document.getElementsByTagName) {
			return;
		}

		// Get all anchor and area tags on the page
		var anchors = document.getElementsByTagName('a');
		var areas = document.getElementsByTagName('area');

		// Loop through anchor tags to find lightbox links
		for (var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			var relAttribute = String(anchor.getAttribute('rel'));

			// If href exists and rel attribute contains 'lightbox', attach onclick event
			if (anchor.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))) {
				anchor.onclick = function () {
					myLightbox.start(this);
					return false;
				};
			}
		}

		// Loop through area tags (e.g., image maps) to find lightbox links
		for (var i = 0; i < areas.length; i++) {
			var area = areas[i];
			var relAttribute = String(area.getAttribute('rel'));

			// If href exists and rel attribute contains 'lightbox', attach onclick event
			if (area.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))) {
				area.onclick = function () {
					myLightbox.start(this);
					return false;
				};
			}
		}

		// Dynamically create and append the Lightbox HTML structure to the document body.
		// This structure includes the overlay, main lightbox container, image container,
		// navigation elements, and image data display.

		var objBody = document.getElementsByTagName("body").item(0);

		// Create the overlay div
		var objOverlay = document.createElement("div");
		objOverlay.setAttribute('id', 'overlay');
		objOverlay.style.display = 'none'; // Hidden by default
		objOverlay.onclick = function () {
			myLightbox.end();
		}; // Close on overlay click
		objBody.appendChild(objOverlay);

		// Create the main lightbox container div
		var objLightbox = document.createElement("div");
		objLightbox.setAttribute('id', 'lightbox');
		objLightbox.style.display = 'none'; // Hidden by default
		objLightbox.onclick = function (e) {
			// Handle clicks within the lightbox to close it if the background is clicked
			if (!e) var e = window.event;
			var clickObj = Event.element(e).id;
			if (clickObj == 'lightbox') {
				myLightbox.end();
			}
		};
		objBody.appendChild(objLightbox);

		// Create the outer image container
		var objOuterImageContainer = document.createElement("div");
		objOuterImageContainer.setAttribute('id', 'outerImageContainer');
		objLightbox.appendChild(objOuterImageContainer);

		// Set initial dimensions for the outer image container.
		// If animations are off, set to 1x1 to prevent flicker.
		if (animate) {
			Element.setWidth('outerImageContainer', 250);
			Element.setHeight('outerImageContainer', 250);
		} else {
			Element.setWidth('outerImageContainer', 1);
			Element.setHeight('outerImageContainer', 1);
		}

		// Create the inner image container
		var objImageContainer = document.createElement("div");
		objImageContainer.setAttribute('id', 'imageContainer');
		objOuterImageContainer.appendChild(objImageContainer);

		// Create the image element itself
		var objLightboxImage = document.createElement("img");
		objLightboxImage.setAttribute('id', 'lightboxImage');
		objImageContainer.appendChild(objLightboxImage);

		// Create the hover navigation div
		var objHoverNav = document.createElement("div");
		objHoverNav.setAttribute('id', 'hoverNav');
		objImageContainer.appendChild(objHoverNav);

		// Create the previous link
		var objPrevLink = document.createElement("a");
		objPrevLink.setAttribute('id', 'prevLink');
		objPrevLink.setAttribute('href', '#');
		objHoverNav.appendChild(objPrevLink);

		// Create the next link
		var objNextLink = document.createElement("a");
		objNextLink.setAttribute('id', 'nextLink');
		objNextLink.setAttribute('href', '#');
		objHoverNav.appendChild(objNextLink);

		// Create the loading indicator div
		var objLoading = document.createElement("div");
		objLoading.setAttribute('id', 'loading');
		objImageContainer.appendChild(objLoading);

		// Create the loading link (to close lightbox if loading fails/is cancelled)
		var objLoadingLink = document.createElement("a");
		objLoadingLink.setAttribute('id', 'loadingLink');
		objLoadingLink.setAttribute('href', '#');
		objLoadingLink.onclick = function () {
			myLightbox.end();
			return false;
		};
		objLoading.appendChild(objLoadingLink);

		// Create the loading image
		var objLoadingImage = document.createElement("img");
		objLoadingImage.setAttribute('src', fileLoadingImage);
		objLoadingLink.appendChild(objLoadingImage);

		// Create the image data container (for caption, number display, and bottom nav)
		var objImageDataContainer = document.createElement("div");
		objImageDataContainer.setAttribute('id', 'imageDataContainer');
		objLightbox.appendChild(objImageDataContainer);

		// Create the image data div
		var objImageData = document.createElement("div");
		objImageData.setAttribute('id', 'imageData');
		objImageDataContainer.appendChild(objImageData);

		// Create the image details div
		var objImageDetails = document.createElement("div");
		objImageDetails.setAttribute('id', 'imageDetails');
		objImageData.appendChild(objImageDetails);

		// Create the caption span
		var objCaption = document.createElement("span");
		objCaption.setAttribute('id', 'caption');
		objImageDetails.appendChild(objCaption);

		// Create the number display span (e.g., "Image 1 of 5")
		var objNumberDisplay = document.createElement("span");
		objNumberDisplay.setAttribute('id', 'numberDisplay');
		objImageDetails.appendChild(objNumberDisplay);

		// Create the bottom navigation div
		var objBottomNav = document.createElement("div");
		objBottomNav.setAttribute('id', 'bottomNav');
		objImageData.appendChild(objBottomNav);

		// Create the close link in the bottom navigation
		var objBottomNavCloseLink = document.createElement("a");
		objBottomNavCloseLink.setAttribute('id', 'bottomNavClose');
		objBottomNavCloseLink.setAttribute('href', '#');
		objBottomNavCloseLink.onclick = function () {
			myLightbox.end();
			return false;
		};
		objBottomNav.appendChild(objBottomNavCloseLink);

		// Create the close image for the bottom navigation
		var objBottomNavCloseImage = document.createElement("img");
		objBottomNavCloseImage.setAttribute('src', fileBottomNavCloseImage);
		objBottomNavCloseLink.appendChild(objBottomNavCloseImage);
	},


	// Initiates the lightbox display.
	// Hides select boxes and flash objects, sets up the overlay,
	// populates the image array, and begins loading the first image.
	start: function (imageLink) {

		// Temporarily hide select boxes and flash content to prevent them from
		// appearing on top of the lightbox overlay in some browsers.
		hideSelectBoxes();
		hideFlash();

		// Get current page dimensions to size the overlay correctly
		var arrayPageSize = getPageSize();
		Element.setHeight('overlay', arrayPageSize[1]);

		// Fade in the overlay
		new Effect.Appear('overlay', {
			duration: overlayDuration,
			from: 0.0,
			to: overlayOpacity
		});

		// Reset image array and active image index
		imageArray = [];
		imageNum = 0;

		// Check for browser support
		if (!document.getElementsByTagName) {
			return;
		}

		// Get all elements of the same tag type as the clicked image link
		var anchors = document.getElementsByTagName(imageLink.tagName);

		// Determine if the image is part of a set or a single image
		if ((imageLink.getAttribute('rel') == 'lightbox')) {
			// Single image: add only this image to the array
			imageArray.push(new Array(imageLink.getAttribute('href'), imageLink.getAttribute('title')));
		} else {
			// Image is part of a set: find all images with the same 'rel' attribute
			for (var i = 0; i < anchors.length; i++) {
				var anchor = anchors[i];
				if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))) {
					imageArray.push(new Array(anchor.getAttribute('href'), anchor.getAttribute('title')));
				}
			}
			// Remove any duplicate entries in the image array
			imageArray.removeDuplicates();

			// Find the index of the clicked image within the image array
			while (imageArray[imageNum][0] != imageLink.getAttribute('href')) {
				imageNum++;
			}
		}

		// Calculate the vertical position for the lightbox
		var arrayPageScroll = getPageScroll();
		var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);

		// Position and show the lightbox container
		Element.setTop('lightbox', lightboxTop);
		Element.show('lightbox');

		// Proceed to change the image to the active one
		this.changeImage(imageNum);
	},


	// Changes the currently displayed image in the lightbox.
	// Hides various elements, preloads the new image, and then
	// calls resizeImageContainer once the image is loaded.
	changeImage: function (imageNum) {

		activeImage = imageNum; // Update the global active image index

		// Hide specific elements to prepare for the image transition
		if (animate) {
			Element.show('loading');
		} // Show loading indicator if animating
		Element.hide('lightboxImage');
		Element.hide('hoverNav');
		Element.hide('prevLink');
		Element.hide('nextLink');
		Element.hide('imageDataContainer');
		Element.hide('numberDisplay');

		// Create a new Image object for preloading
		imgPreloader = new Image();

		// Set the onload event handler for the preloader.
		// Once the image is loaded, set the lightbox image src and resize the container.
		imgPreloader.onload = function () {
			Element.setSrc('lightboxImage', imageArray[activeImage][0]);
			myLightbox.resizeImageContainer(imgPreloader.width, imgPreloader.height);

			// Clear the onload handler to prevent erratic behavior with animated GIFs in IE
			imgPreloader.onload = function () {};
		};

		// Start preloading the image by setting its src
		imgPreloader.src = imageArray[activeImage][0];
	},


	// Resizes the image container to fit the new image dimensions.
	// Applies animation if 'animate' is true.
	resizeImageContainer: function (imgWidth, imgHeight) {

		// Get current width and height of the outer image container
		this.widthCurrent = Element.getWidth('outerImageContainer');
		this.heightCurrent = Element.getHeight('outerImageContainer');

		// Calculate new width and height including border size
		var widthNew = (imgWidth + (borderSize * 2));
		var heightNew = (imgHeight + (borderSize * 2));

		// Calculate scaling factors for animation
		this.xScale = (widthNew / this.widthCurrent) * 100;
		this.yScale = (heightNew / this.heightCurrent) * 100;

		// Calculate differences between current and new dimensions
		wDiff = this.widthCurrent - widthNew;
		hDiff = this.heightCurrent - heightNew;

		// Perform vertical scaling animation if height changed
		if (!(hDiff == 0)) {
			new Effect.Scale('outerImageContainer', this.yScale, {
				scaleX: false,
				duration: resizeDuration,
				queue: 'front'
			});
		}

		// Perform horizontal scaling animation if width changed (after vertical, if any)
		if (!(wDiff == 0)) {
			new Effect.Scale('outerImageContainer', this.xScale, {
				scaleY: false,
				delay: resizeDuration,
				duration: resizeDuration
			});
		}

		// If no scaling is needed (image is same size), pause briefly to prevent flicker
		if ((hDiff == 0) && (wDiff == 0)) {
			if (navigator.appVersion.indexOf("MSIE") != -1) {
				pause(250);
			} else {
				pause(100);
			}
		}

		// Adjust height of navigation links to match new image height
		Element.setHeight('prevLink', imgHeight);
		Element.setHeight('nextLink', imgHeight);

		// Set the width of the image data container
		Element.setWidth('imageDataContainer', widthNew);

		// After resizing, show the image
		this.showImage();
	},


	// Displays the image and initiates preloading of neighboring images.
	showImage: function () {
		Element.hide('loading'); // Hide the loading indicator

		// Fade in the lightbox image, then update details after animation completes
		new Effect.Appear('lightboxImage', {
			duration: resizeDuration,
			queue: 'end',
			afterFinish: function () {
				myLightbox.updateDetails();
			}
		});

		// Start preloading the next and previous images in the set
		this.preloadNeighborImages();
	},


	// Updates the caption, image number display, and bottom navigation.
	updateDetails: function () {

		Element.show('caption');
		Element.setInnerHTML('caption', imageArray[activeImage][1]); // Set image caption

		// If there's more than one image in the set, display "Image X of Y"
		if (imageArray.length > 1) {
			Element.show('numberDisplay');
			Element.setInnerHTML('numberDisplay', "Image " + eval(activeImage + 1) + " of " + imageArray.length);
		}

		// Parallel animation for sliding down and appearing the image data container
		new Effect.Parallel(
			[new Effect.SlideDown('imageDataContainer', {
				sync: true,
				duration: resizeDuration,
				from: 0.0,
				to: 1.0
			}),
				new Effect.Appear('imageDataContainer', {
					sync: true,
					duration: resizeDuration
				})
			], {
				duration: resizeDuration,
				afterFinish: function () {
					// After animation, update overlay size and navigation
					var arrayPageSize = getPageSize();
					Element.setHeight('overlay', arrayPageSize[1]);
					myLightbox.updateNav();
				}
			}
		);
	},


	// Updates the previous/next navigation links based on the current image.
	updateNav: function () {

		Element.show('hoverNav'); // Ensure hover navigation is visible

		// Check if there's a previous image
		if (activeImage != 0) {
			Element.show('prevLink');
			document.getElementById('prevLink').onclick = function () {
				myLightbox.changeImage(activeImage - 1);
				return false;
			};
		}

		// Check if there's a next image
		if (activeImage != (imageArray.length - 1)) {
			Element.show('nextLink');
			document.getElementById('nextLink').onclick = function () {
				myLightbox.changeImage(activeImage + 1);
				return false;
			};
		}

		this.enableKeyboardNav(); // Enable keyboard navigation for the current image
	},


	// Enables keyboard navigation (left arrow for previous, right arrow for next, 'x' or 'c' or ESC for close).
	enableKeyboardNav: function () {
		document.onkeydown = this.keyboardAction;
	},


	// Disables keyboard navigation.
	disableKeyboardNav: function () {
		document.onkeydown = '';
	},


	// Handles keyboard input for navigation.
	keyboardAction: function (e) {
		if (e == null) { // If event object is null, use window.event (IE)
			keycode = window.event.keyCode;
		} else { // W3C (Firefox, Safari, etc.)
			keycode = e.keyCode;
		}

		key = String.fromCharCode(keycode).toLowerCase();

		// Check for 'x', 'c', or ESC key to close lightbox
		if (key == 'x' || key == 'c' || keycode == 27) {
			myLightbox.end();
		} else if (key == 'p' || keycode == 37) { // Left arrow or 'p' for previous image
			if (activeImage != 0) {
				myLightbox.disableKeyboardNav();
				myLightbox.changeImage(activeImage - 1);
			}
		} else if (key == 'n' || keycode == 39) { // Right arrow or 'n' for next image
			if (activeImage != (imageArray.length - 1)) {
				myLightbox.disableKeyboardNav();
				myLightbox.changeImage(activeImage + 1);
			}
		}
	},


	// Preloads the next and previous images in the set to improve user experience.
	preloadNeighborImages: function () {

		// Preload previous image
		if ((imageArray.length - 1) > activeImage) {
			preloadNextImage = new Image();
			preloadNextImage.src = imageArray[activeImage + 1][0];
		}

		// Preload next image
		if (activeImage > 0) {
			preloadPrevImage = new Image();
			preloadPrevImage.src = imageArray[activeImage - 1][0];
		}
	},


	// Closes the lightbox and restores the page to its original state.
	end: function () {
		this.disableKeyboardNav(); // Disable keyboard navigation
		Element.hide('lightbox'); // Hide the lightbox container

		// Fade out the overlay
		new Effect.Fade('overlay', {
			duration: overlayDuration
		});

		showSelectBoxes(); // Show previously hidden select boxes
		showFlash(); // Show previously hidden flash objects
	}
};

// --- END LIGHTBOX CLASS DECLARATION ---


// --- MISCELLANEOUS HELPER FUNCTIONS ---

// Returns the current scroll position of the page.
// [scrollX, scrollY]
function getPageScroll() {
	var xScroll, yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
		xScroll = self.pageXOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
		xScroll = document.documentElement.scrollLeft;
	} else if (document.body) { // All other Explorers
		yScroll = document.body.scrollTop;
		xScroll = document.body.scrollLeft;
	}
	return new Array(xScroll, yScroll);
}


// Returns the dimensions of the page.
// [windowWidth, windowHeight, pageHeight, pageWidth]
function getPageSize() {
	var xScroll, yScroll;

	if (window.innerHeight && window.scrollMaxY) {
		xScroll = window.innerWidth + window.scrollMaxX;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight) { // All but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}

	var windowWidth, windowHeight;
	if (self.innerHeight) { // All modern browsers
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // Other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}

	// For small pages with total size less then the viewport dimensions:
	var pageWidth = (xScroll < windowWidth) ? windowWidth : xScroll;
	var pageHeight = (yScroll < windowHeight) ? windowHeight : yScroll;

	return new Array(pageWidth, pageHeight, windowWidth, windowHeight);
}


// IE-specific function to hide select boxes.
// Prevents them from showing above the overlay.
function hideSelectBoxes() {
	if (navigator.userAgent.match(/MSIE/)) {
		var els = document.getElementsByTagName("select");
		for (i = 0; i < els.length; i++) {
			els[i].style.visibility = "hidden";
		}
	}
}


// IE-specific function to show select boxes.
function showSelectBoxes() {
	if (navigator.userAgent.match(/MSIE/)) {
		var els = document.getElementsByTagName("select");
		for (i = 0; i < els.length; i++) {
			els[i].style.visibility = "visible";
		}
	}
}


// Hides Flash objects (embed/object tags).
function hideFlash() {
	var els = document.getElementsByTagName("embed");
	for (i = 0; i < els.length; i++) {
		els[i].style.visibility = "hidden";
	}
	var els = document.getElementsByTagName("object");
	for (i = 0; i < els.length; i++) {
		els[i].style.visibility = "hidden";
	}
}


// Shows Flash objects.
function showFlash() {
	var els = document.getElementsByTagName("embed");
	for (i = 0; i < els.length; i++) {
		els[i].style.visibility = "visible";
	}
	var els = document.getElementsByTagName("object");
	for (i = 0; i < els.length; i++) {
		els[i].style.visibility = "visible";
	}
}


// Cross-browser pause function.
function pause(milliseconds) {
	var date = new Date();
	var curDate = null;
	do {
		curDate = new Date();
	} while (curDate - date < milliseconds);
}


// Initializes the lightbox by creating a new instance.
function initLightbox() {
	myLightbox = new Lightbox();
}


// Registers a function to be called when the window finishes loading.
// Inspired by Simon Willison (http://simon.incutio.com/archive/2004/05/26/addLoadEvent)
function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function () {
			oldonload();
			func();
		};
	}
}

// --- END MISCELLANEOUS HELPER FUNCTIONS ---


// --- INITIALIZATION ---

// Add initLightbox to the window's load event queue
addLoadEvent(initLightbox);

// --- END INITIALIZATION ---