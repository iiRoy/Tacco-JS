/*
 * flower_moviebox.js - Version 1.3
 *
 * This script provides a MooTools-based lightbox-style solution for displaying
 * movie links and various streaming content directly within an overlay.
 * It is an integral part of the CASH Music Flower code distribution.
 *
 * For more detailed information and to download the latest versions,
 * please visit: http://cashmusic.org/tools/
 *
 * Inspiration for this module was drawn from the excellent Slimbox versions
 * developed by Christophe Beyls (http://www.digitalia.be)
 * and Aaron Newton (http://clientside.cnet.com/).
 *
 * Prerequisites for proper functionality:
 * + MooTools Core Library v1.2.4 or higher
 * + flower_overlay.js v1.0 or higher
 *
 * License Information:
 * This software is distributed under a BSD license.
 *
 * Copyright (c) 2010, CASH Music
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions, and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions, and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of CASH Music nor the names of its contributors may be used
 *    to endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 */

var FlowerMoviebox = new Class(
{
	/**
	 * Class FlowerMoviebox
	 *
	 * The Flower Moviebox class is designed to display Quicktime videos and
	 * embedded Flash content from popular video-sharing sites within an
	 * elegant overlay box. It supports direct .mov/.mp4 movie files,
	 * as well as content from YouTube, MySpace TV, Google Video, and Vimeo.com.
	 * The script is intended for auto-initiation with links pointing to
	 * supported media, aiming to be a low-maintenance addition to web pages.
	 *
	 *
	 * CONFIGURATION OPTIONS:
	 *
	 * + fadelevel (default: 0.85)
	 *   Specifies the opacity level of the background overlay (value between 0 and 1).
	 *
	 * + overlaycolor (default: '#000000')
	 *   Defines the hexadecimal background color of the overlay.
	 *
	 * + contentspcbg (default: '#000000')
	 *   Sets the background color for the content display area within the box.
	 *
	 * + linkcolor (default: '#999999')
	 *   Determines the color for links found in captions and default pagination controls.
	 *
	 * + linkovercolor (default: '#ffffff')
	 *   Sets the hover color for interactive links.
	 *
	 * + textcolor (default: '#000000')
	 *   Establishes the default text color for captions and other text elements.
	 *
	 * + borderwidth (default: 5)
	 *   Sets the width (in pixels) of the border surrounding the content space.
	 *
	 * + boxwidth (default: 480)
	 *   The default width for the movie display area.
	 *
	 * + boxheight (default: 320)
	 *   The default height for the movie display area. This value will be
	 *   automatically adjusted to maintain aspect ratio and accommodate
	 *   player controls for various video-sharing platforms.
	 *
	 * + caption (default: '')
	 *   The default caption text to be displayed below the movie.
	 *
	 * + showcontrols (default: false)
	 *   A boolean flag to show or hide QuickTime player controls for embedded movies.
	 *
	 *
	 * KEY PUBLIC METHODS:
	 *
	 * + attachToElement(anchor element el)
	 *   This method binds a 'showMovie' click event handler to an anchor element,
	 *   assuming the anchor contains a link to a supported movie or video service.
	 *
	 * + showMovie(string movType, string movCaption, url movUrl,
	 *             integer movWidth, integer movHeight)
	 *   Opens an overlay window and displays the specified movie content.
	 *   This method can be called directly or triggered by an attached click event.
	 *
	 *
	 * CSS CLASSES AVAILABLE FOR CUSTOM STYLING (inherited/provided by flower_overlay.js):
	 *
	 * + .flower_overlay
	 * + .flower_overlaycontentspc
	 * + .flower_overlaycaptionspc
	 * + .flower_overlaycaption
	 * + .flower_overlaycontrollink
	 *
	 */
	Extends   : FlowerOverlay,
	Implements: [Options, Events],

	options: {
		caption       : '',
		movieObjectID : 'moviebox' + $random(10000, 99999), // Unique ID for movie objects
		showcontrols  : 'false'                              // Controls visibility for QT
	},


	initialize: function (options)
	{
		this.name                  = 'moviebox';
		this.version               = 1.3;
		this.donotdebugoptions     = false;
		this.currentMovie          = null;
		this.movieurl              = null;

		// Pointer to the utility object.
		// Note: If using moviebox and utility as standalone scripts,
		//       this line might need adjustment from flowerUID.getModule.
		this.flower_utility        = flowerUID.getModule('utility');

		// Set the global state of the moviebox instance:
		// 0 = uninitiated (DOM elements not yet created)
		// 1 = hidden (DOM elements exist, but overlay is not visible)
		// 11 = visible (overlay is currently displayed)
		this.state                 = 0;

		// Apply user-defined options, overriding defaults
		this.setOptions(options);

		// Initialize rendering dimensions based on options
		this.renderboxheight       = this.options.boxheight;
		this.renderboxwidth        = this.options.boxwidth;

		// Plugin/ActiveXObject detection for Flash and QuickTime
		this.flashDetected         = this.flower_utility.detectPluginOrAxo('Flash');
		this.qtDetected            = this.flower_utility.detectPluginOrAxo('QuickTime');

		// Check if the current environment is a mobile device
		this.ismobile              = this.flower_utility.checkForMobile();

		// Add keyboard event listeners (e.g., for ESC key to close)
		this.addKeyEvents();
	},


	attachToElement: function (el)
	{
		/*
		 * Function attachToElement(anchor element el)
		 *
		 * This function inspects a given anchor element for links that point to
		 * movies or video pages on supported video sharing platforms.
		 * If a compatible link is found, any pre-existing click events on the
		 * anchor are removed, and a new click event is added to trigger
		 * the display of the linked video within the moviebox.
		 *
		 */
		if (!this.ismobile)
		{
			var elLink       = el.getProperty('href'),
				elLinkLc     = elLink.toLowerCase(),
				elTitle      = el.getProperty('title'),
				elRev        = el.getProperty('rev'),
				elWidth      = this.renderboxwidth,
				elHeight     = this.renderboxheight,
				elMovieType  = false,
				splitArgument;

			// Check for custom 'rev' settings, which can override default dimensions.
			if (elRev)
			{
				if (elRev.contains('moviebox:'))
				{
					// Parse arguments like 'width=XXX,height=YYY'
					$A(elRev.substring(9, elRev.length).split(',')).each(function (argument)
					{
						var splitArgument = argument.split('=');
						switch (splitArgument[0])
						{
							case 'width':
								if (splitArgument[1])
								{
									elWidth = splitArgument[1];
								}
								break;
							case 'height':
								if (splitArgument[1])
								{
									elHeight = splitArgument[1];
								}
								break;
						}
					});
				}
			}

			// Parse the movie type and adjust dimensions if necessary.
			// QuickTime/MP4 detection
			if ((elLinkLc.contains('.mov') || elLinkLc.contains('.mp4')) && this.qtDetected)
			{
				elMovieType = 'qt';
				if (this.options.showcontrols == 'true')
				{
					elHeight += 16; // Add space for QuickTime controls
				}
			}
			// YouTube detection
			else if (elLinkLc.contains('youtube.com/watch?v='))
			{
				elMovieType = 'yt';
				elHeight = (elWidth * 0.5625).round() + 25; // YouTube aspect ratio + controls
			}
			// Vimeo detection
			else if (elLinkLc.test(/vimeo.com\/\d/))
			{
				elMovieType = 'vm';
			}
			// Vevo detection
			else if (elLinkLc.contains('vevo.com/watch') && this.flashDetected)
			{
				elMovieType = 'vv';
			}

			// If a supported movie type is identified, attach the click event.
			if (elMovieType)
			{
				el.removeEvents('click'); // Prevent multiple bindings
				el.addEvent('click', function (e)
				{
					this.showMovie(elMovieType, elTitle, elLink, elWidth, elHeight);
					e.stop(); // Prevent default link behavior
				}.bind(this));
			}
		}
	},


	showMovie: function (movType, movCaption, movUrl, movWidth, movHeight)
	{
		/*
		 * Function showMovie(string movType, string movCaption, url movUrl,
		 *                     integer movWidth, integer movHeight)
		 *
		 * This function initializes the moviebox to display the specified movie URL.
		 * It can be directly called from an external script or triggered by
		 * an anchor click event (as set up by attachToElement).
		 *
		 */
		this.movieType      = movType;
		this.caption        = movCaption;
		this.movieurl       = movUrl;
		this.renderboxwidth = movWidth;
		this.renderboxheight= movHeight;

		if (this.state == 0)
		{
			this.createDomElements(); // Create overlay DOM elements if not already present
			this.overlayCloseLink.set('html', 'close <small>[esc]</small>');
			this.state = 1; // Set state to hidden
		}
		this.showOverlay(); // Display the overlay
	},


	showOverlay: function ()
	{
		/*
		 * Function showOverlay()
		 *
		 * This method overrides the parent flower_overlay's showOverlay function.
		 * It includes an additional `this.state` check to ensure the overlay
		 * is currently hidden before attempting to display it.
		 * It also pauses any currently playing sound via flowerUID's soundplayer.
		 *
		 */
		if (this.state == 1)
		{
			// If a soundplayer module exists and is active, pause current sound.
			if (window.flowerUID)
			{
				var sp = flowerUID.getModule('soundplayer');
				if (sp)
				{
					sp.pauseCurrentSound();
				}
			}
			this.parent(); // Call the parent class's showOverlay method
			// The state will be updated to 11 (visible) in showContent()
		}
	},


	showContent: function ()
	{
		/*
		 * Function showContent()
		 *
		 * This method overrides the parent flower_overlay's showContent function.
		 * It populates the `overlayContentSpc` DOM element with an appropriate
		 * object or iframe tag containing the specified movie.
		 * It uses `.set('html', x)` for insertion, which helps bypass buggy
		 * <object> insertion behavior for QuickTime and works around
		 * the "click-to-enable-Flash" feature in some browsers.
		 *
		 */
		if (this.movieType == 'qt')
		{
			if (Browser.Engine.trident)
			{
				// Internet Explorer specific object tag for QuickTime
				this.overlayContentSpc.set('html', '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" standby="loading quicktime..." codebase="http://www.apple.com/qtactivex/qtplugin.cab" width="' + this.renderboxwidth + '" height="' + this.renderboxheight + '" id="' + this.options.movieObjectID + '"><param name="src" value="' + this.movieurl + '" /><param name="scale" value="aspect" /><param name="controller" value="' + this.options.showcontrols + '" /><param name="cache" value="false" /><param name="autoplay" value="true" /><param name="bgcolor" value="' + this.options.contentspcbg + '" /><param name="enablejavascript" value="true" /></object>');
			}
			else
			{
				// Standard object tag for QuickTime for other browsers
				this.overlayContentSpc.set('html', '<object id="' + this.options.movieObjectID + '" standby="loading quicktime..." type="video/quicktime" codebase="http://www.apple.com/qtactivex/qtplugin.cab" data="' + this.movieurl + '" width="' + this.renderboxwidth + '" height="' + this.renderboxheight + '"><param name="src" value="' + this.movieurl + '" /><param name="scale" value="aspect" /><param name="controller" value="' + this.options.showcontrols + '" /><param name="cache" value="false" /><param name="autoplay" value="true" /><param name="bgcolor" value="' + this.options.contentspcbg + '" /><param name="enablejavascript" value="true" /></object>');
			}
			this.currentMovie = document.getElementById(this.options.movieObjectID);
			// Delay setting the state to allow QuickTime to fully initialize.
			// This helps to fix a potential audio bug in some environments.
			(function ()
			{
				this.state = 11;
			}.bind(this)).delay(1200);
		}
		else if (this.movieType == 'yt' || this.movieType == 'vm')
		{
			// YouTube or Vimeo embedded via iframe
			var videoObjURL = this.parseVideoURL(this.movieurl);
			this.overlayContentSpc.set('html', '<iframe src="' + videoObjURL + '" width="' + this.renderboxwidth + '" height="' + this.renderboxheight + '" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>');
			this.currentMovie = document.id(this.options.movieObjectID); // This might be null for iframes, but not critical
			this.state = 11;
		}
		else if (this.movieType == 'vv')
		{
			// Vevo embedded via Flash object
			var videoObjURL = this.parseVideoURL(this.movieurl);
			this.overlayContentSpc.set('html', '<object id="' + this.options.movieObjectID + '" standby="loading video..." type="application/x-shockwave-flash" width="' + this.renderboxwidth + '" height="' + this.renderboxheight + '" data="' + videoObjURL + '"><param name="movie" value="' + videoObjURL + '" /><param name="bgcolor" value="' + this.options.contentspcbg + '" /><param name="allowFullScreen" value="true" /><param name="wmode" value="window" /><param name="allowScriptAccess" value="always" /></object>');
			this.currentMovie = document.id(this.options.movieObjectID);
			this.state = 11;
		}

		this.positionCaption(); // Position the caption below the content
		this.fireEvent('videoCreated', this.currentMovie); // Custom event for when video is created
	},


	parseVideoURL: function (url)
	{
		/*
		 * Function parseVideoURL(url url)
		 *
		 * This function accepts a raw URL string. It then checks the validity
		 * of the URL against known patterns for popular video sharing sites.
		 * If a match is found, it returns a direct URL suitable for embedding
		 * the SWF or iframe content, based on that site's standard embed format.
		 * If no known format is detected, the function returns `false`.
		 *
		 * Currently supports:
		 * - youtube.com links
		 * - vimeo.com links
		 * - vevo.com links
		 *
		 */
		var newUrl   = false,
			urlLc    = url.toLowerCase(),
			miscVar;

		if (urlLc.contains('youtube.com/watch?v='))
		{
			newUrl = url.replace(/watch\?v\=/i, 'embed/');
			miscVar = newUrl.indexOf('&');
			if (miscVar > -1)
			{
				newUrl = newUrl.substr(0, miscVar); // Remove extra URL parameters
			}
			newUrl += '?autoplay=1&amp;rel=0&amp;hd=1'; // Append autoplay and other parameters
		}
		else if (urlLc.contains('vimeo.com/'))
		{
			cleanedUrl = this.movieurl.replace('www.', ''); // Remove 'www.' if present
			newUrl = cleanedUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
			newUrl += '?title=1&amp;byline=1&amp;portrait=1&amp;autoplay=1'; // Vimeo specific parameters
		}
		else if (urlLc.contains('vevo.com/watch'))
		{
			newUrl = 'http://www.vevo.com/VideoPlayer/Embedded?videoId=';
			miscVar = urlLc.lastIndexOf('/') + 1;
			newUrl += urlLc.substr(miscVar, urlLc.length - miscVar); // Extract video ID
			newUrl += '&autoplay=1&playerType=embedded&playlist=false'; // Vevo specific parameters
		}
		return newUrl;
	},


	hideOverlay: function ()
	{
		/*
		 * Function hideOverlay()
		 *
		 * This method extends the parent flower_overlay's hideOverlay function.
		 * It adds a `this.state` check to ensure the overlay is currently
		 * visible and not in a busy state. It also handles the necessary
		 * cleanup for embedded video <object> or <iframe> elements
		 * before hiding the overlay.
		 *
		 */
		if (this.state == 11)
		{
			if (this.movieType == 'qt')
			{
				if (Browser.Engine.webkit || Browser.Engine.trident)
				{
					// The Stop() method is required for Safari and Internet Explorer
					// but can cause issues in other browsers.
					// For IE, 'display: none' is also applied as it sometimes
					// struggles to release the object otherwise.
					this.currentMovie.Stop();
					this.currentMovie.style.display = 'none';
				}
			}
			else
			{
				// For non-IE browsers and Vevo (Flash) objects,
				// dispose() is used for proper cleanup.
				if (!Browser.Engine.trident && this.movieType == 'vv')
				{
					this.currentMovie.dispose();
				}
			}
			this.currentMovie = null; // Clear the reference to the movie object
			this.overlayContentSpc.set('html', ''); // Clear the content area
			this.movieType = false; // Reset movie type
			this.parent(); // Call the parent class's hideOverlay method
			this.state = 1; // Set state to hidden
		}
	}
});


// DOM Ready Event Listener
window.addEvent('domready', function ()
{
	// Check if the flowerUID global object exists
	if (typeof (flowerUID) == 'object')
	{
		// If flowerUID is available, register FlowerMoviebox as a module
		flowerUID.registerModule(FlowerMoviebox, 'moviebox');
	}
	else
	{
		// If flowerUID is not present, instantiate FlowerMoviebox directly
		var moviebox = new FlowerMoviebox();

		// Automatically attach to movie links found in the DOM.
		// This selects anchor tags linking to .mov, .mp4, YouTube, Vimeo, and Vevo.
		$$('a[href$=.mov],a[href$=.mp4],a[href$=.MOV],a[href$=.MP4],a[href^=http://www.youtube.com/watch?v],a[href^=http://youtube.com/watch?v],a[href^=http://vimeo.com/],a[href^=http://www.vimeo.com/],a[href^=http://www.youtube.com/watch?v]').each(function (element)
		{
			moviebox.attachToElement(element); // Attach moviebox functionality to each matching element
		});
	}
});