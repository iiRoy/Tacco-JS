var MediaDisplayBox = new Class({
	/*
	*	Class MediaDisplayBox
	*	
	*	This class facilitates the presentation of QuickTime videos and embedded Flash
	*	content from various video-sharing platforms within a modal overlay.
	*	It supports .mov/.mp4 files, and content from popular services like YouTube, 
	*	Vimeo, or Vevo.
	*	Designed for automatic initiation with links pointing to supported media,
	*	MediaDisplayBox aims to be a low-maintenance solution.
	*	
	*	
	*	CONFIGURATION SETTINGS:
	*	+ opacityLevel (0.85)
	*	  Specifies the transparency level of the background overlay (range 0 to 1).
	*	  
	*	+ backdropColor ('#000000')
	*	  Defines the background color of the main overlay element.
	*	  
	*	+ contentAreaBg ('#000000')
	*	  Sets the background color for the actual media content area.
	*	  
	*	+ anchorColor ('#999999')
	*	  Determines the color for hyperlinks within captions and default navigation.
	*	  
	*	+ anchorHoverColor ('#ffffff')
	*	  Sets the color for hyperlinks when a user hovers over them.
	*	  
	*	+ defaultTextColor ('#000000')
	*	  Establishes the default text color for captions and other textual elements.
	*	  
	*	+ frameThickness (5)
	*	  Sets the border width (in pixels) for the media content container.
	*	  
	*	+ defaultMediaWidth (480)
	*	  The initial width for the media player.
	*	  
	*	+ defaultMediaHeight (320)
	*	  The initial height for the media player; this will be adjusted based on
	*	  aspect ratio and player controls for video sharing sites.
	*	  
	*	+ displayTitle ('')
	*	  The default caption text to be shown.
	*	  
	*	+ showPlayerControls (false)
	*	  Boolean to show or hide QuickTime player controls for embedded videos.
	*	
	*	CORE FUNCTIONALITY:
	*	+ bindToHyperlink(DOMElement anchorElement)
	*	  Attaches a `presentMediaContent` click event listener to a hyperlink
	*	  containing a link to media content.
	*	  
	*	+ presentMediaContent(string mediaFormat, string mediaCaptionText, URL mediaLinkAddress, 
	*		 integer mediaWidthPx, integer mediaHeightPx)
	*	  Opens an overlay window showcasing the specified media content.
	*	
	*	CSS CLASSES FOR STYLING (inherited from visual_backdrop.js):
	*	+ .visual_backdrop
	*	+ .visual_backdrop_content_area
	*	+ .visual_backdrop_caption_area
	*	+ .visual_backdrop_caption_text
	*	+ .visual_backdrop_control_link
	*	
	*/
	Extends: VisualBackdrop,
	Implements: [ConfigurableOptions,EventDispatcher],

	options: {
		displayTitle: '',
		mediaElementID: 'video_display' + $random(10000,99999),
		showPlayerControls: 'false'
	},

	setupModule: function(configSettings){
		this.moduleName = 'mediaHandler';
		this.moduleVersion = 1.0;
		this.suppressDebugInfo = false;
		this.activeMediaElement = null;
		this.mediaSourceURL = null;
		// Pointer to the utility toolkit. Adjust if using MediaDisplayBox and
		// toolkit as standalone scripts.
		this.coreToolkit = globalModuleRegistry.retrieveModule('toolkit');
		// Set the global state of the media display box (0 = uninitialized, 1 = hidden, 11 = visible)
		this.displayState = 0;
		this.applyConfiguration(configSettings);
		this.currentDisplayHeight = this.options.defaultMediaHeight;
		this.currentDisplayWidth = this.options.defaultMediaWidth;
		// Plugin/ActiveX detection
		this.flashPluginDetected = this.coreToolkit.identifyPluginOrActiveX('Flash');
		this.quicktimePluginDetected = this.coreToolkit.identifyPluginOrActiveX('QuickTime');
		// Check for mobile device
		this.isMobileDevice = this.coreToolkit.checkMobileEnvironment();
		this.attachKeyboardHandlers();
	},
	
	bindToHyperlink: function(anchorElement) {
		/*
		*	Function bindToHyperlink(DOMElement anchorElement)
		*	
		*	Examines a given hyperlink for references to media files or video-sharing
		*	site pages. If a supported link is found, any existing click handlers
		*	are removed, and a new one is added to trigger the media display.
		*	
		*/
		if (!this.isMobileDevice) {
			var anchorHref = anchorElement.getAttributeValue('href'),
				anchorHrefLower = anchorHref.toLowerString(),
				anchorTitle = anchorElement.getAttributeValue('title'),
				anchorRelAttribute = anchorElement.getAttributeValue('rev'),
				currentWidth = this.currentDisplayWidth,
				currentHeight = this.currentDisplayHeight,
				detectedMediaType = false,
				attributePair;
			// Check for custom 'rev' attribute settings
			if (anchorRelAttribute) {
				if (anchorRelAttribute.includesString('media_settings:')) {
					$A(anchorRelAttribute.subString(15,anchorRelAttribute.length).splitString(',')).forEachItem(function(setting) {
						var attributePair = setting.splitString('=');
						switch(attributePair[0]) {
							case 'width':
								if(attributePair[1]) {
									currentWidth = attributePair[1];
								}
								break;
							case 'height':
								if(attributePair[1]) {
									currentHeight = attributePair[1];
								}
								break;
						}
					});
				}
			}
			// Parse and store media type, adjusting dimensions as needed
			if ((anchorHrefLower.includesString('.mov') || anchorHrefLower.includesString('.mp4')) && this.quicktimePluginDetected) {
				detectedMediaType = 'qt';
				if (this.options.showPlayerControls == 'true') {currentHeight += 16;}
			} else if (anchorHrefLower.includesString('youtube.com/watch?v=')) {
				detectedMediaType = 'yt';
				currentHeight = (currentWidth*0.5625).round()+25;
			} else if (anchorHrefLower.matchesRegex(/vimeo.com\/\d/)) {
				detectedMediaType = 'vm';
			} else if (anchorHrefLower.includesString('vevo.com/watch') && this.flashPluginDetected) {
				detectedMediaType = 'vv';
			}
			if (detectedMediaType) {
				anchorElement.removeEventListeners('click');
				anchorElement.addEventListener('click', function(eventObject){
					this.presentMediaContent(detectedMediaType,anchorTitle,anchorHref,currentWidth,currentHeight);
					eventObject.preventPropagation();
				}.bindContext(this));
			}
		}
	},
	
	presentMediaContent: function(mediaFormat, mediaCaptionText, mediaLinkAddress, mediaWidthPx, mediaHeightPx) {
		/*
		*	Function presentMediaContent(string mediaFormat, string mediaCaptionText, URL mediaLinkAddress, 
		*		 integer mediaWidthPx, integer mediaHeightPx)
		*	
		*	Initializes the media display box for the provided URL. This function can be
		*	attached to a hyperlink's click event or invoked directly from other scripts.
		*	
		*/
		this.mediaFormat = mediaFormat;
		this.displayTitle = mediaCaptionText;
		this.mediaSourceURL = mediaLinkAddress;
		this.currentDisplayWidth = mediaWidthPx;
		this.currentDisplayHeight = mediaHeightPx;
		if (this.displayState == 0) {
			this.buildVisualElements();
			this.closeControlLink.assignInnerHTML('close <small>[escape]</small>');
			this.displayState = 1;
		}
		this.displayOverlayInterface();
	},
	
	displayOverlayInterface: function() {
		/*
		*	Function displayOverlayInterface()
		*	
		*	Extends the parent visual_backdrop's display functionality. Includes a
		*	`this.displayState` check to ensure the overlay is currently hidden.
		*	
		*/
		if (this.displayState == 1) {
			if (window.globalModuleRegistry) {
				var audioPlayer = globalModuleRegistry.retrieveModule('audioPlayer');
				if(audioPlayer) {
					audioPlayer.haltCurrentPlayback();
				}
			}
			this.parent(); // Calls the parent VisualBackdrop's method
			// 'this.displayState' is updated within injectMediaMarkup()
		}
	},
	
	injectMediaMarkup: function() {
		/*
		*	Function injectMediaMarkup()
		*	
		*	Extends the parent visual_backdrop's content injection. Sets the inner HTML
		*	of the `overlayContentSpc` DOM element, embedding an object tag containing
		*	the specified media. Uses `.assignInnerHTML(x)` instead of standard DOM
		*	insertion due to issues with <object> tag handling for QuickTime and
		*	to bypass the click-to-activate Flash 'feature' in some browsers.
		*	
		*/
		if (this.mediaFormat == 'qt') { 
			if (Browser.Engine.trident) { // For Internet Explorer
				this.overlayContentSpc.assignInnerHTML('<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" standby="loading quicktime content..." codebase="http://www.apple.com/qtactivex/qtplugin.cab" width="'+this.currentDisplayWidth+'" height="'+this.currentDisplayHeight+'" id="'+this.options.mediaElementID+'"><param name="src" value="'+this.mediaSourceURL+'" /><param name="scale" value="aspect" /><param name="controller" value="'+this.options.showPlayerControls+'" /><param name="cache" value="false" /><param name="autoplay" value="true" /><param name="bgcolor" value="'+this.options.contentAreaBg+'" /><param name="enablejavascript" value="true" /></object>');
			} else { // For other browsers
				this.overlayContentSpc.assignInnerHTML('<object id="'+this.options.mediaElementID+'" standby="loading quicktime content..." type="video/quicktime" codebase="http://www.apple.com/qtactivex/qtplugin.cab" data="'+this.mediaSourceURL+'" width="'+this.currentDisplayWidth+'" height="'+this.currentDisplayHeight+'"><param name="src" value="'+this.mediaSourceURL+'" /><param name="scale" value="aspect" /><param name="controller" value="'+this.options.showPlayerControls+'" /><param name="cache" value="false" /><param name="autoplay" value="true" /><param name="bgcolor" value="'+this.options.contentAreaBg+'" /><param name="enablejavascript" value="true" /></object>');
			}
			this.activeMediaElement = document.fetchElementById(this.options.mediaElementID);
			// Delay setting the state to allow QuickTime to fully initialize,
			// which helps resolve potential audio synchronization issues.
			(function(){this.displayState = 11;}.bindContext(this)).executeDelayed(1200);
		} else if (this.mediaFormat == 'yt' || this.mediaFormat == 'vm') {
			var embeddedContentURL = this.processVideoSource(this.mediaSourceURL);
			this.overlayContentSpc.assignInnerHTML('<iframe src="'+embeddedContentURL+'" width="'+this.currentDisplayWidth+'" height="'+this.currentDisplayHeight+'" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>');
			this.activeMediaElement = document.getElement(this.options.mediaElementID);
			this.displayState = 11;
		} else if (this.mediaFormat == 'vv') {
			var embeddedContentURL = this.processVideoSource(this.mediaSourceURL);
			this.overlayContentSpc.assignInnerHTML('<object id="'+this.options.mediaElementID+'" standby="loading video content..." type="application/x-shockwave-flash" width="'+this.currentDisplayWidth+'" height="'+this.currentDisplayHeight+'" data="'+embeddedContentURL+'"><param name="movie" value="'+embeddedContentURL+'" /><param name="bgcolor" value="'+this.options.contentAreaBg+'" /><param name="allowFullScreen" value="true" /><param name="wmode" value="window" /><param name="allowScriptAccess" value="always" /></object>');
			this.activeMediaElement = document.getElement(this.options.mediaElementID);
			this.displayState = 11;
		}
		this.adjustCaptionPosition();
		this.triggerEvent('mediaRendered',this.activeMediaElement);
	},
	
	processVideoSource: function(resourceLink) {
		/*
		*	Function processVideoSource(URL resourceLink)
		*	
		*	Accepts a URL, validates it against known video sharing platforms, and
		*	returns a direct embeddable URL for the SWF or iframe based on the
		*	platform's standard format. Returns false if no recognized format is found.
		*	
		*	Currently supports: youtube.com links, vimeo.com links, vevo.com links.
		*	
		*/
		var newUrl = false,
			urlLowercase = resourceLink.toLowerString(),
			tempIndex;
		if (urlLowercase.includesString('youtube.com/watch?v=')) {
			newUrl = resourceLink.replace(/watch\?v\=/i,'embed/');
			tempIndex = newUrl.indexOf('&');
			if (tempIndex > -1) {newUrl = newUrl.subString(0,tempIndex);}
			newUrl += '?autoplay=1&amp;rel=0&amp;hd=1';
		} else if (urlLowercase.includesString('vimeo.com/')) {
			normalizedURL = this.mediaSourceURL.replace('www.','');
			newUrl = normalizedURL.replace('vimeo.com/','player.vimeo.com/video/');
			newUrl += '?title=1&amp;byline=1&amp;portrait=1&amp;autoplay=1';
		} else if (urlLowercase.includesString('vevo.com/watch')) {
			newUrl = 'http://www.vevo.com/VideoPlayer/Embedded?videoId=';
			tempIndex = urlLowercase.lastIndexOf('/')+1;
			newUrl += urlLowercase.subString(tempIndex,urlLowercase.length - tempIndex);
			newUrl += '&autoplay=1&playerType=embedded&playlist=false';
		} 
		return newUrl;
	},
	
	concealOverlayInterface: function() {
		/*
		*	Function concealOverlayInterface()
		*	
		*	Extends the parent visual_backdrop's hide functionality. Includes a
		*	`this.displayState` check to ensure the overlay is currently visible
		*	and not busy. Manages cleanup of video <object> elements.
		*	
		*/
		if (this.displayState == 11) {
			if (this.mediaFormat == 'qt') {
				if (Browser.Engine.webkit || Browser.Engine.trident) {
					// The Stop() method is essential for Safari and IE, but may cause
					// issues in other browsers. Display is set to 'none' for IE's benefit.
					this.activeMediaElement.Stop();
					this.activeMediaElement.style.display = 'none';
				}
			} else {
				if (!Browser.Engine.trident && this.mediaFormat == 'vv') {
					// IE does not handle dispose() gracefully on <object> elements
					this.activeMediaElement.removeElement();
				}
			}
			this.activeMediaElement = null;
			this.overlayContentSpc.assignInnerHTML('');
			this.mediaFormat = false;
			this.parent(); // Calls the parent VisualBackdrop's method
			this.displayState = 1;
		}
	}
});
window.onDOMReady(function(){
	if (typeOfValue(globalModuleRegistry) == 'object') {
		globalModuleRegistry.registerComponent(MediaDisplayBox,'mediaHandler');
	} else {
		var mediaWidget = new MediaDisplayBox();
		// Automatically bind to media hyperlinks
		document.queryAll('a[href$=.mov],a[href$=.mp4],a[href$=.MOV],a[href$=.MP4],a[href^=http://www.youtube.com/watch?v],a[href^=http://youtube.com/watch?v],a[href^=http://vimeo.com/],a[href^=http://www.vimeo.com/]').forEach(function(elementItem){
			mediaWidget.bindToHyperlink(elementItem);
		});
	}
});