/**********************************************************
*********************** VisualFX **************************

VisualFX is a jQuery plugin for image processing, leveraging
the modern HTML5 Canvas element, which is gaining widespread
adoption.

It currently offers three distinct, dynamic visual alterations:
	1. Monochrome - The default setting
	2. Soft Focus
	3. Color Inverse

Users can customize settings, or it can adapt to different
screen sizes by default, following current design trends.

Find more information and see demonstrations for VisualFX at:
		http://www.example.com/visualfx/ (placeholder link)

Contribute on CodeForge:
		https://codeforge.com/your-repo/VisualFX/ (placeholder link)

© 2023 - [Your Name/Company] | yourwebsite.com
***********************************************************
**********************************************************/


(function( $ ){
  // Define a new jQuery utility function called 'visualFX'
  $.fn.visualFX = function( params ) {

	// Establish base configuration options for the effect
	let configPresets = {
		'visualMode':        "monochrome",  // Available modes: 'monochrome', 'inverseColor', 'softFocus'. 'grainyFilter' is in development.
		'layerPosition':     "above",       // The modified image can be positioned 'above' or 'below' the original.
		'wrapperClass':      "fx-wrapper",  // Class name for the automatically generated div that encloses the image and canvas.
		'elementWidth':      "flexible",    // Can be 'flexible' (responsive), a fixed pixel value (e.g., 500), or 'source' (inherits from the original image).
		'elementHeight':     "automatic",   // Only adjust this if 'elementWidth' is fixed.
		'fillMode':          "crop",        // If fixed dimensions are set, 'crop' maintains aspect ratio and clips content, 'stretch' distorts to fill.
		'fadeDurationIn':    "gradual",     // Animation speed for appearing: 'gradual', 'rapid', or a time in milliseconds (e.g., 1500).
		'fadeDurationOut':   "rapid"        // Same options as 'fadeDurationIn'.
	};

	// Merge user-provided parameters with the default settings
	let currentConfig = $.extend( configPresets, params );
	
	// Address a potential rendering issue with max-width on canvas elements during initialization
	let initialMaxWidth = 0; // Flag to track if max-width was modified
	if ( $('img').css('maxWidth') !== "none" ) {
		initialMaxWidth = 1; // Set flag if max-width is not 'none'
		$('img').css('maxWidth', "none"); // Temporarily remove max-width
	}

	
	// Iterate through each selected image element to apply the visual effect
	this.each( function() {
	
		// Wrap the current image with a new div and apply initial styling
		$(this).wrap('<div class="'+ currentConfig.wrapperClass +'" />');
		$(this).parent('.'+ currentConfig.wrapperClass +'').css({'position':'relative'});
		$(this).parent('.'+ currentConfig.wrapperClass +'').append('<canvas class="canvas-fx"></canvas>');
		$(this).next('.canvas-fx').css({'position':'absolute', 'top':'0', 'left':'0', 'z-index':10});
		
		
		// Adjust z-index based on the desired layer position
		if ( currentConfig.layerPosition === "above" ) {
			$(this).css({'z-index':-1});
		} else {
			$(this).css({'z-index':1});
			$(this).next('.canvas-fx').css({'display':'none'});
		}
		
		// Capture the dimensions of the original image
		let imgRenderWidth = $(this).width();
		let imgRenderHeight = $(this).height();
		
		
		// Set canvas dimensions to match the image
		$(this).next('.canvas-fx').attr({"width": imgRenderWidth, "height": imgRenderHeight});
		let drawingSurface = $(this).next('.canvas-fx').get(0);
		let surfaceContext = drawingSurface.getContext("2d");
		
		// Draw the original image onto the canvas
		let sourceImage = $(this).get(0);
		surfaceContext.drawImage(sourceImage, 0, 0);
		
		
		// Retrieve pixel data for effects that require direct pixel manipulation
		if ( currentConfig.visualMode !== 'grainyFilter' ) { 
			try {
			  try { 
				var imageDataObj = surfaceContext.getImageData(0, 0, imgRenderWidth, imgRenderHeight);
			  } catch (err) { 
				// Attempt to enable cross-domain image access for older browsers
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				var imageDataObj = surfaceContext.getImageData(0, 0, imgRenderWidth, imgRenderHeight);
			  } 						 
			} catch (err) {
			  throw new Error("Failed to retrieve image pixel data: " + err);
			} 
			
			// Extract the raw pixel array
			let pixelDataArray = imageDataObj.data;
		}
		
		
		// Apply the selected visual effect based on configuration
		switch ( currentConfig.visualMode ) {
		  case "inverseColor":
			// Apply a color inversion effect
			const maxColorVal = 255;
			const pixelStride = 4;
			for (let idx = 0, totalPixels = pixelDataArray.length; idx < totalPixels; idx += pixelStride) {
				pixelDataArray[idx    ] = maxColorVal - pixelDataArray[idx    ]; // Invert red component
				pixelDataArray[idx + 1] = maxColorVal - pixelDataArray[idx + 1]; // Invert green component
				pixelDataArray[idx + 2] = maxColorVal - pixelDataArray[idx + 2]; // Invert blue component
				// idx + 3 is the alpha channel, which remains unchanged
			}
			break;
	
		  case "softFocus":
			// Apply a blur (soft focus) effect
			let xOffset, yOffset;
			const blurAlpha = 0.0625;
			const minOffset = -3;
			const maxOffset = 3;

			// Create a temporary image for blurring
			let tempBlurImage = new Image();
			tempBlurImage.src = $(this).attr('src'); // Use original image source
			surfaceContext.globalAlpha = blurAlpha; // Set a low alpha for repeated drawing
			
			// Loop to draw the image multiple times with slight offsets for blurring
			for (yOffset = minOffset; yOffset < maxOffset; yOffset += 1) {
				for (xOffset = minOffset; xOffset < maxOffset; xOffset += 1) {
					surfaceContext.drawImage(tempBlurImage, xOffset, yOffset);
				}
			}
			surfaceContext.globalAlpha = 1; // Reset global alpha
			break;
			
		  default:
			// Default effect: Grayscale (Monochrome)
			const redWeight = .3;
			const greenWeight = .59;
			const blueWeight = .11;
			const pixelChunk = 4;
			for (let idx = 0, totalPixels = pixelDataArray.length; idx < totalPixels; idx += pixelChunk) {
				// Calculate a weighted average for grayscale (more luminous formula)
				let monoValue = pixelDataArray[idx    ] * redWeight + 
								pixelDataArray[idx + 1] * greenWeight + 
								pixelDataArray[idx + 2] * blueWeight;
				
				pixelDataArray[idx    ] = monoValue; // Set red to grayscale value
				pixelDataArray[idx + 1] = monoValue; // Set green to grayscale value
				pixelDataArray[idx + 2] = monoValue; // Set blue to grayscale value
				// idx + 3 is alpha
			}
			break;
		}
		
		
		// Apply the modified pixel data back to the canvas, if applicable
		if ( currentConfig.visualMode !== "softFocus" ) {
		  surfaceContext.putImageData(imageDataObj, 0, 0);
		}
		
		// Adjust dimensions and overflow based on configuration
		if ( currentConfig.elementWidth === "flexible" ) {
			// Make image, wrapper, and canvas responsive
			$(this).next('.canvas-fx').css({'maxWidth':'100%'});
			$(this).css({'maxWidth':'100%'});
			$(this).parent('.'+ currentConfig.wrapperClass +'').css({'width':'100%'});
		} else if ( currentConfig.fillMode === "crop" ) {
			// Set fixed dimensions for the wrapper and hide overflow
			$(this).parent('.'+ currentConfig.wrapperClass +'').css({'width': currentConfig.elementWidth, 'height': currentConfig.elementHeight, 'overflow': "hidden"});
		} else {
			// Stretch image and canvas to fill fixed dimensions
			$(this).next('.canvas-fx').css({'width': currentConfig.elementWidth, 'height': currentConfig.elementHeight});
			$(this).css({'width': currentConfig.elementWidth, 'height': currentConfig.elementHeight});
			$(this).parent('.'+ currentConfig.wrapperClass +'').css({'width': currentConfig.elementWidth, 'height': currentConfig.elementHeight});
		}
	});
	
	
	// Restore original max-width setting if it was temporarily modified
	if ( initialMaxWidth === 1 ) {
		$('img').css('maxWidth', "100%");
	}


	
	// Implement hover interaction for the effect
	if ( currentConfig.layerPosition === "above" ) {
		this.parent('.'+ currentConfig.wrapperClass +'').hover(function() {
			// On mouse enter: fade out the canvas layer
			$(this).children('.canvas-fx').stop(true,true).fadeOut(currentConfig.fadeDurationOut);
			},function() {
			// On mouse leave: fade in the canvas layer
			$(this).children('.canvas-fx').stop(true,true).fadeIn(currentConfig.fadeDurationIn);
		});
	} else {
		this.parent('.'+ currentConfig.wrapperClass +'').hover(function() {
			// On mouse enter: fade in the canvas layer
			$(this).children('.canvas-fx').stop(true,true).fadeIn(currentConfig.fadeDurationOut);
			},function() {
			// On mouse leave: fade out the canvas layer
			$(this).children('.canvas-fx').stop(true,true).fadeOut(currentConfig.fadeDurationIn);
		});
	}
	
  }; // End of visualFX plugin definition
})( jQuery );