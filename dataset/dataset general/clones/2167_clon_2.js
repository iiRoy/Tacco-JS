/*
 *  -------------------------------------------------------------------------------
 *
 *  	Image Display Utility v2.03.2
 *  	developed by Lokesh Dhakar - http://www.huddletogether.com
 *  	Date: 2006-04-30
 *
 *  	For comprehensive details on this utility, refer to:
 *  	http://huddletogether.com/projects/lightbox2/
 *
 *  	Distributed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
 *
 *  	Special acknowledgments to contributors, inspirers, and those who shared their code publicly:
 *  	Including: Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.org), Thomas Fuchs(mir.aculo.us), among others.
 *
 *
 *  -------------------------------------------------------------------------------
 */
/*

	Content Structure
	-------------------
	Configuration Options
	Global Scope Variables

	Extending Base Objects
	- ObjectFactory.extend(DomElement)
	- Array.prototype.eliminateRedundancies()
	- Array.prototype.clearAll()

	MediaViewer Class Definition
	- initiate()
	- beginDisplay()
	- switchMedia()
	- adjustMediaContainerSize()
	- revealMedia()
	- refreshDetails()
	- refreshNavigation()
	- activateKeyboardControls()
	- deactivateKeyboardControls()
	- handleKeyboardInput()
	- prepareAdjacentMedia()
	- concludeDisplay()

	Auxiliary Functions
	- getScrollCoordinates()
	- getViewportDimensions()
	- getPressedKey()
	- monitorKeyPress()
	- displayDropdowns()
	- concealDropdowns()
	- displayFlashElements()
	- concealFlashElements()
	- delayExecution()
	- initiateMediaViewer()

	Execution Calls
	- attachLoadHandler(initiateMediaViewer)

*/
/* ------------------------------------------------------------------------------- */

//
//	Configuration Options for the MediaViewer
//
var loaderGraphicPath = "/assets/loading_spinner.gif";
var closeButtonGraphic = "/ui/close_btn.png";

var backdropTransparency = 0.75;	// controls opacity of the background layer

var useAnimations = true;			// toggles resizing animation effects
var scalingVelocity = 6;		// determines the speed of image resizing animations (1=slowest, 10=fastest)

var framePadding = 12;		// if CSS padding is altered, this variable must be updated

/* ------------------------------------------------------------------------------- */

//
//	Global Scope Variables for the application
//
var mediaCollection = new Array();
var currentMediaIndex;

if (useAnimations === true) {
	backdropFadeTime = 0.2;	// background layer fade in/out duration
	if (scalingVelocity > 10) { scalingVelocity = 10; }
	if (scalingVelocity < 1) { scalingVelocity = 1; }
	scalingDuration = (11 - scalingVelocity) * 0.15;
} else {
	backdropFadeTime = 0;
	scalingDuration = 0;
}

/* ------------------------------------------------------------------------------- */

//
//	Extended methods for DomElement, initially by SU, Couloir
//	- further additions by Lokesh Dhakar (huddletogether.com)
//
ObjectFactory.extend(DomElement, {

	fetchWidth: function(targetNode) {
		targetNode = $(targetNode);
		return targetNode.offsetWidth;
	},

	assignWidth: function(targetNode, newWidth) {
		targetNode = $(targetNode);
		targetNode.style.width = newWidth + "px";
	},

	assignHeight: function(targetNode, newHeight) {
		targetNode = $(targetNode);
		targetNode.style.height = newHeight + "px";
	},

	assignTopPosition: function(targetNode, topCoordinate) {
		targetNode = $(targetNode);
		targetNode.style.top = topCoordinate + "px";
	},

	assignSource: function(targetNode, sourceURL) {
		targetNode = $(targetNode);
		targetNode.src = sourceURL;
	},

	assignLinkTarget: function(targetNode, linkURL) {
		targetNode = $(targetNode);
		targetNode.href = linkURL;
	},

	assignContent: function(targetNode, htmlContent) {
		targetNode = $(targetNode);
		targetNode.innerHTML = htmlContent;
	}
});

/* ------------------------------------------------------------------------------- */

//
//	Extensions for the built-in Array object
//	- array.eliminateRedundancies()
//	- array.clearAll()
//
Array.prototype.eliminateRedundancies = function () {
	for (idx = 0; idx < this.length; idx++) {
		for (jdx = this.length - 1; jdx > idx; jdx--) {
			if (this[idx][0] === this[jdx][0]) {
				this.splice(jdx, 1);
			}
		}
	}
};

/* ------------------------------------------------------------------------------- */

Array.prototype.clearAll = function () {
	for (idx = 0; idx <= this.length; idx++) {
		this.shift();
	}
};

/* ------------------------------------------------------------------------------- */

//
//	MediaViewer Class Definition
//	- initiate()
//	- beginDisplay()
//	- switchMedia()
//	- adjustMediaContainerSize()
//	- revealMedia()
//	- refreshDetails()
//	- refreshNavigation()
//	- activateKeyboardControls()
//	- deactivateKeyboardControls()
//	- handleKeyboardInput()
//	- prepareAdjacentMedia()
//	- concludeDisplay()
//
//	Code structure influenced by Scott Upton (http://www.uptonic.com/)
//
var MediaViewer = ObjectFactory.create();

MediaViewer.prototype = {

	// initiate()
	// Constructor executed upon DOM loading completion. Iterates through anchor tags to find
	// 'mediaview' references and attaches click events to relevant links. The subsequent part
	// of the function injects HTML at the document's end to render the background layer
	// and the main media container.
	//
	initiate: function() {
		if (!document.getElementsByTagName) { return; }
		var linkElements = document.getElementsByTagName('a');
		var regionElements = document.getElementsByTagName('area');

		// iterate through all anchor tags
		for (var idx = 0; idx < linkElements.length; idx++) {
			var currentLink = linkElements[idx];

			var relationshipProperty = String(currentLink.getAttribute('rel'));

			// utilize string.match() to identify 'mediaview' references within the rel attribute
			if (currentLink.getAttribute('href') && (relationshipProperty.toLowerCase().match('mediaview'))) {
				currentLink.onclick = function () { globalViewer.beginDisplay(this); return false; };
			}
		}

		// iterate through all area tags
		// TODO: merge anchor and area tag processing
		for (var idx = 0; idx < regionElements.length; idx++) {
			var currentRegion = regionElements[idx];

			var relationshipProperty = String(currentRegion.getAttribute('rel'));

			// utilize string.match() to identify 'mediaview' references within the rel attribute
			if (currentRegion.getAttribute('href') && (relationshipProperty.toLowerCase().match('mediaview'))) {
				currentRegion.onclick = function () { globalViewer.beginDisplay(this); return false; };
			}
		}

		// The remaining code injects HTML at the page bottom, structured similarly to this:
		//
		//	<div id="backgroundLayer"></div>
		//	<div id="mediaViewer">
		//		<div id="outerMediaWrapper">
		//			<div id="innerMediaWrapper">
		//				<img id="displayMediaImage">
		//				<div style="" id="navigationOverlay">
		//					<a href="#" id="previousNavButton"></a>
		//					<a href="#" id="nextNavButton"></a>
		//				</div>
		//				<div id="loadingIndicator">
		//					<a href="#" id="loadingCloseLink">
		//						<img src="assets/loading_spinner.gif">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//		<div id="mediaDetailsContainer">
		//			<div id="mediaDetailsBlock">
		//				<div id="imageInfoSection">
		//					<span id="mediaCaption"></span>
		//					<span id="countDisplay"></span>
		//				</div>
		//				<div id="bottomNavigation">
		//					<a href="#" id="bottomNavCloseButton">
		//						<img src="ui/close_btn.png">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//	</div>


		var documentBody = document.getElementsByTagName("body").item(0);

		var backdropElement = document.createElement("div");
		backdropElement.setAttribute('id', 'backgroundLayer');
		backdropElement.style.display = 'none';
		backdropElement.onclick = function() { globalViewer.concludeDisplay(); };
		documentBody.appendChild(backdropElement);

		var viewerContainer = document.createElement("div");
		viewerContainer.setAttribute('id', 'mediaViewer');
		viewerContainer.style.display = 'none';
		viewerContainer.onclick = function(eventObject) {	// close viewer if user clicks background layer
			if (!eventObject) { var eventObject = window.event; }
			var clickedItemId = Event.element(eventObject).id;
			if (clickedItemId === 'mediaViewer') {
				globalViewer.concludeDisplay();
			}
		};
		documentBody.appendChild(viewerContainer);

		var outerMediaWrapper = document.createElement("div");
		outerMediaWrapper.setAttribute('id', 'outerMediaWrapper');
		viewerContainer.appendChild(outerMediaWrapper);

		// When MediaViewer starts, it will resize itself from 250x250 to the current media's dimensions.
		// If animations are off, it will be hidden to prevent a flicker of a
		// white 250x250 box.
		if (useAnimations) {
			DomElement.assignWidth('outerMediaWrapper', 250);
			DomElement.assignHeight('outerMediaWrapper', 250);
		} else {
			DomElement.assignWidth('outerMediaWrapper', 1);
			DomElement.assignHeight('outerMediaWrapper', 1);
		}

		var innerMediaWrapper = document.createElement("div");
		innerMediaWrapper.setAttribute('id', 'innerMediaWrapper');
		outerMediaWrapper.appendChild(innerMediaWrapper);

		var displayMediaImage = document.createElement("img");
		displayMediaImage.setAttribute('id', 'displayMediaImage');
		innerMediaWrapper.appendChild(displayMediaImage);

		var navigationOverlay = document.createElement("div");
		navigationOverlay.setAttribute('id', 'navigationOverlay');
		innerMediaWrapper.appendChild(navigationOverlay);

		var previousNavButton = document.createElement("a");
		previousNavButton.setAttribute('id', 'previousNavButton');
		previousNavButton.setAttribute('href', '#');
		navigationOverlay.appendChild(previousNavButton);

		var nextNavButton = document.createElement("a");
		nextNavButton.setAttribute('id', 'nextNavButton');
		nextNavButton.setAttribute('href', '#');
		navigationOverlay.appendChild(nextNavButton);

		var loadingIndicator = document.createElement("div");
		loadingIndicator.setAttribute('id', 'loadingIndicator');
		innerMediaWrapper.appendChild(loadingIndicator);

		var loadingCloseLink = document.createElement("a");
		loadingCloseLink.setAttribute('id', 'loadingCloseLink');
		loadingCloseLink.setAttribute('href', '#');
		loadingCloseLink.onclick = function() { globalViewer.concludeDisplay(); return false; };
		loadingIndicator.appendChild(loadingCloseLink);

		var loadingGraphic = document.createElement("img");
		loadingGraphic.setAttribute('src', loaderGraphicPath);
		loadingCloseLink.appendChild(loadingGraphic);

		var mediaDetailsContainer = document.createElement("div");
		mediaDetailsContainer.setAttribute('id', 'mediaDetailsContainer');
		viewerContainer.appendChild(mediaDetailsContainer);

		var mediaDetailsBlock = document.createElement("div");
		mediaDetailsBlock.setAttribute('id', 'mediaDetailsBlock');
		mediaDetailsContainer.appendChild(mediaDetailsBlock);

		var imageInfoSection = document.createElement("div");
		imageInfoSection.setAttribute('id', 'imageInfoSection');
		mediaDetailsBlock.appendChild(imageInfoSection);

		var mediaCaption = document.createElement("span");
		mediaCaption.setAttribute('id', 'mediaCaption');
		imageInfoSection.appendChild(mediaCaption);

		var countDisplay = document.createElement("span");
		countDisplay.setAttribute('id', 'countDisplay');
		imageInfoSection.appendChild(countDisplay);

		var bottomNavigation = document.createElement("div");
		bottomNavigation.setAttribute('id', 'bottomNavigation');
		mediaDetailsBlock.appendChild(bottomNavigation);

		var bottomNavCloseButton = document.createElement("a");
		bottomNavCloseButton.setAttribute('id', 'bottomNavCloseButton');
		bottomNavCloseButton.setAttribute('href', '#');
		bottomNavCloseButton.onclick = function() { globalViewer.concludeDisplay(); return false; };
		bottomNavigation.appendChild(bottomNavCloseButton);

		var closeButtonGraphicElement = document.createElement("img");
		closeButtonGraphicElement.setAttribute('src', closeButtonGraphic);
		bottomNavCloseButton.appendChild(closeButtonGraphicElement);
	},

	//
	//	beginDisplay()
	//	Activates the background layer and the media viewer. If the media is part of a series,
	//	its siblings are added to the mediaCollection.
	//
	beginDisplay: function(clickedResource) {

		concealDropdowns();
		concealFlashElements();

		// expand background layer to fill page and fade in
		var viewportDimensions = getViewportDimensions();
		DomElement.assignHeight('backgroundLayer', viewportDimensions[1]);

		new Animation.Appear('backgroundLayer', { duration: backdropFadeTime, from: 0.0, to: backdropTransparency });

		mediaCollection = [];
		currentResourceIndex = 0;

		if (!document.getElementsByTagName) { return; }
		var relevantLinks = document.getElementsByTagName(clickedResource.tagName);

		// if media is NOT part of a set..
		if ((clickedResource.getAttribute('rel') === 'mediaview')) {
			// add single media item to mediaCollection
			mediaCollection.push(new Array(clickedResource.getAttribute('href'), clickedResource.getAttribute('title')));
		} else {
			// if media is part of a set..

			// iterate through links, find other media in the set, and add them to mediaCollection
			for (var idx = 0; idx < relevantLinks.length; idx++) {
				var currentLink = relevantLinks[idx];
				if (currentLink.getAttribute('href') && (currentLink.getAttribute('rel') === clickedResource.getAttribute('rel'))) {
					mediaCollection.push(new Array(currentLink.getAttribute('href'), currentLink.getAttribute('title')));
				}
			}
			mediaCollection.eliminateRedundancies();
			while (mediaCollection[currentResourceIndex][0] !== clickedResource.getAttribute('href')) { currentResourceIndex++; }
		}

		// calculate top offset for the media viewer and display
		var scrollOffsets = getScrollCoordinates();
		var viewerTopPosition = scrollOffsets[1] + (viewportDimensions[3] / 10);

		DomElement.assignTopPosition('mediaViewer', viewerTopPosition);
		DomElement.show('mediaViewer');

		this.switchMedia(currentResourceIndex);
	},

	//
	//	switchMedia()
	//	Conceals most elements and preloads the media in preparation for adjusting the container size.
	//
	switchMedia: function(targetIndex) {

		currentMediaIndex = targetIndex;	// update global variable

		// hide elements during transition
		if (useAnimations) { DomElement.show('loadingIndicator'); }
		DomElement.hide('displayMediaImage');
		DomElement.hide('navigationOverlay');
		DomElement.hide('previousNavButton');
		DomElement.hide('nextNavButton');
		DomElement.hide('mediaDetailsContainer');
		DomElement.hide('countDisplay');

		mediaPreloader = new Image();

		// once media is preloaded, adjust media container size
		mediaPreloader.onload = function() {
			DomElement.assignSource('displayMediaImage', mediaCollection[currentMediaIndex][0]);
			globalViewer.adjustMediaContainerSize(mediaPreloader.naturalWidth, mediaPreloader.naturalHeight);

			mediaPreloader.onload = function() {};	// clear onLoad, IE behaves erratically with animated gifs otherwise
		};
		mediaPreloader.src = mediaCollection[currentMediaIndex][0];
	},

	//
	//	adjustMediaContainerSize()
	//
	adjustMediaContainerSize: function(newMediaWidth, newMediaHeight) {

		// retrieve current width and height
		this.currentContainerWidth = DomElement.fetchWidth('outerMediaWrapper');
		this.currentContainerHeight = DomElement.fetchHeight('outerMediaWrapper');

		// retrieve new width and height
		var calculatedWidth = (newMediaWidth + (framePadding * 2));
		var calculatedHeight = (newMediaHeight + (framePadding * 2));

		// factors based on change from old to new
		this.horizontalScaleFactor = (calculatedWidth / this.currentContainerWidth) * 100;
		this.verticalScaleFactor = (calculatedHeight / this.currentContainerHeight) * 100;

		// calculate size difference between new and old media, and resize if necessary
		var widthDifference = this.currentContainerWidth - calculatedWidth;
		var heightDifference = this.currentContainerHeight - calculatedHeight;

		if (!(heightDifference === 0)) { new Animation.Scale('outerMediaWrapper', this.verticalScaleFactor, {scaleX: false, duration: scalingDuration, queue: 'front'}); }
		if (!(widthDifference === 0)) { new Animation.Scale('outerMediaWrapper', this.horizontalScaleFactor, {scaleY: false, delay: scalingDuration, duration: scalingDuration}); }

		// if new and old media are same size and no scaling transition is required,
		// introduce a brief pause to prevent media flicker.
		if ((heightDifference === 0) && (widthDifference === 0)) {
			if (navigator.appVersion.indexOf("MSIE") !== -1) { delayExecution(250); } else { delayExecution(100); }
		}

		DomElement.assignHeight('previousNavButton', newMediaHeight);
		DomElement.assignHeight('nextNavButton', newMediaHeight);
		DomElement.assignWidth('mediaDetailsContainer', calculatedWidth);

		this.revealMedia();
	},

	//
	//	revealMedia()
	//	Displays the media and initiates preloading of adjacent items.
	//
	revealMedia: function() {
		DomElement.hide('loadingIndicator');
		new Animation.Appear('displayMediaImage', { duration: scalingDuration, queue: 'end', afterFinish: function() { globalViewer.refreshDetails(); } });
		this.prepareAdjacentMedia();
	},

	//
	//	refreshDetails()
	//	Displays the caption, media count, and bottom navigation.
	//
	refreshDetails: function() {

		DomElement.show('mediaCaption');
		DomElement.assignContent('mediaCaption', mediaCollection[currentMediaIndex][1]);

		// if media is part of a set, display 'Item x of x'
		if (mediaCollection.length > 1) {
			DomElement.show('countDisplay');
			DomElement.assignContent('countDisplay', "Item " + (currentMediaIndex + 1) + " of " + mediaCollection.length);
		}

		new Animation.Parallel(
			[ new Animation.SlideDown('mediaDetailsContainer', { sync: true, duration: scalingDuration, from: 0.0, to: 1.0 }),
			  new Animation.Appear('mediaDetailsContainer', { sync: true, duration: scalingDuration }) ],
			{ duration: scalingDuration, afterFinish: function() {
				// update background layer size and navigation
				var viewportDimensions = getViewportDimensions();
				DomElement.assignHeight('backgroundLayer', viewportDimensions[1]);
				globalViewer.refreshNavigation();
			} }
		);
	},

	//
	//	refreshNavigation()
	//	Updates next and previous navigation links.
	//
	refreshNavigation: function() {
		DomElement.show('navigationOverlay');
		this.activateKeyboardControls();

		// if not the first image in set, display prev image button
		if (currentMediaIndex !== 0) {
			DomElement.assignLinkTarget('previousNavButton', mediaCollection[currentMediaIndex - 1][0]);
			DomElement.show('previousNavButton');
		}

		// if not the last image in set, display next image button
		if (currentMediaIndex !== (mediaCollection.length - 1)) {
			DomElement.assignLinkTarget('nextNavButton', mediaCollection[currentMediaIndex + 1][0]);
			DomElement.show('nextNavButton');
		}

		this.enableNavigationClicks();
	},

	//
	//	enableNavigationClicks()
	//	Attaches click handlers to the navigation buttons.
	//
	enableNavigationClicks: function() {
		DomElement.onclick('previousNavButton', function() { globalViewer.switchMedia(currentMediaIndex - 1); return false; });
		DomElement.onclick('nextNavButton', function() { globalViewer.switchMedia(currentMediaIndex + 1); return false; });
	},

	//
	//	activateKeyboardControls()
	//	Enables keyboard navigation.
	//
	activateKeyboardControls: function() {
		document.onkeydown = this.handleKeyboardInput;
	},

	//
	//	deactivateKeyboardControls()
	//	Disables keyboard navigation.
	//
	deactivateKeyboardControls: function() {
		document.onkeydown = '';
	},

	//
	//	handleKeyboardInput()
	//	Handles keyboard actions (left arrow, right arrow, escape).
	//
	handleKeyboardInput: function(keyboardEvent) {
		if (typeof keyboardEvent === 'undefined') { keyboardEvent = window.event; }
		var pressedKey = keyboardEvent.keyCode ? keyboardEvent.keyCode : keyboardEvent.which;

		var escapeKey = 27;
		var leftArrow = 37;
		var rightArrow = 39;

		switch (pressedKey) {
			case escapeKey:
				globalViewer.concludeDisplay();
				break;
			case leftArrow:
				if (currentMediaIndex !== 0) {
					globalViewer.deactivateKeyboardControls();
					globalViewer.switchMedia(currentMediaIndex - 1);
				}
				break;
			case rightArrow:
				if (currentMediaIndex !== (mediaCollection.length - 1)) {
					globalViewer.deactivateKeyboardControls();
					globalViewer.switchMedia(currentMediaIndex + 1);
				}
				break;
		}
	},

	//
	//	prepareAdjacentMedia()
	//	Preloads the previous and next media items in the collection.
	//
	prepareAdjacentMedia: function() {
		var preloaderPrevious = new Image();
		var preloaderNext = new Image();

		if (currentMediaIndex !== 0) {
			preloaderPrevious.src = mediaCollection[currentMediaIndex - 1][0];
		}
		if (currentMediaIndex !== (mediaCollection.length - 1)) {
			preloaderNext.src = mediaCollection[currentMediaIndex + 1][0];
		}
	},

	//
	//	concludeDisplay()
	//	Hides the media viewer and background layer.
	//
	concludeDisplay: function() {
		this.deactivateKeyboardControls();
		DomElement.hide('mediaViewer');
		new Animation.Fade('backgroundLayer', { duration: backdropFadeTime });
		displayDropdowns();
		displayFlashElements();
	}
};

/* ------------------------------------------------------------------------------- */

//
//	Auxiliary Functions
//

//
//	getScrollCoordinates()
//	Retrieves the current scroll position of the page.
//
function getScrollCoordinates() {
	var xScroll, yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
		xScroll = self.pageXOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
		xScroll = document.documentElement.scrollLeft;
	} else if (document.body) { // all other Explorers
		yScroll = document.body.scrollTop;
		xScroll = document.body.scrollLeft;
	}
	return new Array(xScroll, yScroll);
}

//
//	getViewportDimensions()
//	Calculates and returns the dimensions of the browser viewport.
//
function getViewportDimensions() {
	var windowWidth, windowHeight, pageHeight, pageWidth;

	if (self.innerHeight) {	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}

	// for small pages with total height less then height of the viewport
	if (windowHeight > document.body.scrollHeight) {
		pageHeight = windowHeight;
	} else {
		pageHeight = document.body.scrollHeight;
	}

	// for small pages with total width less then width of the viewport
	if (windowWidth > document.body.scrollWidth) {
		pageWidth = windowWidth;
	} else {
		pageWidth = document.body.scrollWidth;
	}

	return new Array(pageWidth, pageHeight, windowWidth, windowHeight);
}

//
//	getPressedKey()
//	(Deprecated - replaced by direct event object access in handleKeyboardInput)
//
function getPressedKey(eventObject) {
	if (eventObject === null) {
		return window.event.keyCode;
	} else {
		return eventObject.keyCode;
	}
}

//
//	monitorKeyPress()
//	(Original function, now handled directly by onkeydown in MediaViewer)
//
function monitorKeyPress(eventObject) {
	globalViewer.handleKeyboardInput(eventObject);
}

//
//	displayDropdowns()
//	Makes select boxes visible again.
//
function displayDropdowns() {
	var selectElements = document.getElementsByTagName('select');
	for (var idx = 0; idx < selectElements.length; idx++) {
		selectElements[idx].style.visibility = 'visible';
	}
}

//
//	concealDropdowns()
//	Hides select boxes to prevent them from appearing over the viewer.
//
function concealDropdowns() {
	var selectElements = document.getElementsByTagName('select');
	for (var idx = 0; idx < selectElements.length; idx++) {
		selectElements[idx].style.visibility = 'hidden';
	}
}

//
//	displayFlashElements()
//	Reveals Flash objects after viewer closes.
//
function displayFlashElements() {
	var objectElements = document.getElementsByTagName('object');
	for (var idx = 0; idx < objectElements.length; idx++) {
		objectElements[idx].style.visibility = 'visible';
	}
	var embedElements = document.getElementsByTagName('embed');
	for (var idx = 0; idx < embedElements.length; idx++) {
		embedElements[idx].style.visibility = 'visible';
	}
}

//
//	concealFlashElements()
//	Hides Flash objects to prevent display issues.
//
function concealFlashElements() {
	var objectElements = document.getElementsByTagName('object');
	for (var idx = 0; idx < objectElements.length; idx++) {
		objectElements[idx].style.visibility = 'hidden';
	}
	var embedElements = document.getElementsByTagName('embed');
	for (var idx = 0; idx < embedElements.length; idx++) {
		embedElements[idx].style.visibility = 'hidden';
	}
}

//
//	delayExecution()
//	Pauses script execution for a specified duration.
//
function delayExecution(milliseconds) {
	var currentTime = new Date();
	var endTime = currentTime.getTime() + milliseconds;
	while (currentTime.getTime() < endTime) {
		currentTime = new Date();
	}
}

//
//	initiateMediaViewer()
//	Initializes the MediaViewer instance.
//
function initiateMediaViewer() {
	globalViewer = new MediaViewer();
}

/* ------------------------------------------------------------------------------- */

//
//	Function Calls
//	Attaches the initialization routine to the page load event.
//
attachLoadHandler(initiateMediaViewer);