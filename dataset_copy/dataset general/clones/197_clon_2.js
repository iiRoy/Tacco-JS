/*
 * This module provides a basic mechanism for detecting motion from a video
 * stream and using it to influence a virtual camera's orientation.
 * It processes frames, identifies active pixel regions, and calculates
 * an averaged center of movement to control a 3D viewpoint.
 */
function BasicMovementAnalyzer( targetItem ) {

	// Internal dimensions for the video frame sampling
	var HORIZ_SAMPLES = 50;
	var VERT_SAMPLES  = 50;
	
	// Dimensions for the visual feedback display window
	var DISPLAY_WIDTH = 245;
	var DISPLAY_HEIGHT= 200;

	// The 3D object this analyzer will manipulate (e.g., a THREE.Camera)
	this.trackedObj = targetItem;
	
	// Angular amplification factors for X and Y axes
	this.xFactor = 3.0;
	this.yFactor = 3.0;
	
	// Fixed angular offsets in degrees
	this.xOffset = 15.0;
	this.yOffset = 0.0;
	
	// Percentage of the vertical frame height to consider for motion detection
	this.scanBoundary = 0.66;
	
	// Brightness threshold for identifying 'active' pixels
	this.sensitivityLevel = 137;
	
	// Averaging filter for horizontal motion coordinate
	this.avgCoordX = new SmoothAverage( 500 );
	this.avgCoordX.setInitialValue( DISPLAY_WIDTH / 2 );
	
	// Averaging filter for vertical motion coordinate
	this.avgCoordY = new SmoothAverage( 500 );
	this.avgCoordY.setInitialValue( DISPLAY_HEIGHT / 2 );
		
	// Canvas for processing the raw video feed
	var sourceCanvas = document.createElement( 'canvas' );
	sourceCanvas.width = HORIZ_SAMPLES;
	sourceCanvas.height = VERT_SAMPLES;

	// Canvas for displaying visual feedback
	var outputCanvas = document.createElement( 'canvas' );
	outputCanvas.width = DISPLAY_WIDTH;
	outputCanvas.height = DISPLAY_HEIGHT;
	outputCanvas.style.position = 'absolute';
	outputCanvas.style.left = '0px';
	outputCanvas.style.top = '0px';
	
	// 2D rendering context for the source video canvas
	var sourceCtx = sourceCanvas.getContext( '2d' );
	
	// Global application state object
	var APP_STATE = {};
	
	// Reference to the current instance of BasicMovementAnalyzer
	var analyzerInstance;
	
	// Texture object for rendering to the output canvas
	var outputTexture = null;
	
	// 2D rendering context for the display canvas
	var displayCtx = outputCanvas.getContext( '2d' );
	
	// HTML5 video element for media input
	var sourceVideo;
	
	// Append the display canvas to the document body
	document.body.appendChild( outputCanvas );	
	
	BasicMovementAnalyzer.prototype.initialize = function() {	
		
		analyzerInstance = this;
	
		// Determine the appropriate getUserMedia function for cross-browser compatibility
		var acquireUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
							  || navigator.mozGetUserMedia || navigator.msGetUserMedia;
							  
		sourceVideo = document.createElement( 'video' );
		if ( acquireUserMedia ) { 
 			acquireUserMedia( { audio: false, video: true }, 
				function( mediaStream ) {
 				    sourceVideo.src = window.URL.createObjectURL( mediaStream );
					APP_STATE.mediaWidth = HORIZ_SAMPLES;
					APP_STATE.mediaHeight = VERT_SAMPLES;
					APP_STATE.displayBuffer = document.createElement( 'canvas' );
					APP_STATE.displayBuffer.width = APP_STATE.mediaWidth;
					APP_STATE.displayBuffer.height = APP_STATE.mediaHeight * 2;
					APP_STATE.bufferCtx = APP_STATE.displayBuffer.getContext( '2d' );
					APP_STATE.comparisonData = [];
					analyzerInstance.startProcessing( );
				}, 
				function( errorEvent ) {
					alert( 'Media acquisition failed.\n\nError Code: ' + errorEvent.code );
				}
			);
		} else {
 			alert( 'Browser lacks media stream support.' );
		}

		// Cross-browser requestAnimationFrame polyfill
		requestRenderFrame = ( function( ) {
 			return 	window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
   				window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
   				function( /* function RenderLoopCallback */ frameCallback, /* DOMElement TargetElement */ domElement ) {
    					window.setTimeout( frameCallback, 1000 / 60 );
   				};
		} )( );		
		
	}

	BasicMovementAnalyzer.prototype.analyzeFrameData = function() {			
 		sourceCtx.drawImage( outputCanvas, 0, 0 );
 		var pixelData = sourceCtx.getImageData( 0, 0, HORIZ_SAMPLES, VERT_SAMPLES ).data;

 		displayCtx.fillStyle = '#FFFFFF';
 		displayCtx.fillRect( 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT );
 		displayCtx.globalAlpha = 0.2;	

 		var blockWidth = DISPLAY_WIDTH / HORIZ_SAMPLES - 1 | 0;
		var blockHeight = DISPLAY_HEIGHT / VERT_SAMPLES - 1 | 0;
		
		var minYPosition = Number.MAX_VALUE;
		for ( var row = 0; row < VERT_SAMPLES - 1; row++ ) {
			for ( var col = 0; col < HORIZ_SAMPLES; col++ ) {
				if ( pixelData[col * 4 + row * HORIZ_SAMPLES * 4] > this.sensitivityLevel ) {
					var colPos = col * DISPLAY_WIDTH / HORIZ_SAMPLES;
					var rowPos = row * DISPLAY_HEIGHT / VERT_SAMPLES;						
					if ( row < VERT_SAMPLES * this.scanBoundary ) {
						if ( minYPosition >= Math.min( minYPosition, rowPos ) ) {
							minYPosition = rowPos;
							this.avgCoordX.updateValue( colPos );
							this.avgCoordY.updateValue( rowPos );							
							displayCtx.fillStyle = '#000000';
							displayCtx.fillRect( colPos, rowPos, blockWidth, blockHeight );
						}
						displayCtx.fillStyle = '#0000FF';
						displayCtx.fillRect( colPos, rowPos, blockWidth, blockHeight );		
					} else {
						displayCtx.fillStyle = '#00FF00';
						displayCtx.fillRect( colPos, rowPos, blockWidth, blockHeight );		
					}			
				}
			}		
		}

		// Indicate the estimated motion center with a crosshair
		displayCtx.fillStyle = '#FF0000';
		displayCtx.fillRect( analyzerInstance.avgCoordX.getCurrentValue( ) - blockWidth * 0.5, analyzerInstance.avgCoordY.getCurrentValue( ), blockWidth * 1.5, blockHeight * 0.5 );
		displayCtx.fillRect( analyzerInstance.avgCoordX.getCurrentValue( ), analyzerInstance.avgCoordY.getCurrentValue( ) - blockHeight * 0.5, blockWidth * 0.5, blockHeight * 1.5 );		
	}

	BasicMovementAnalyzer.prototype.adjustViewpoint = function() {		
		var xDistanceFromCenter = this.avgCoordX.getCurrentValue( ) * HORIZ_SAMPLES / DISPLAY_WIDTH - HORIZ_SAMPLES / 2;
		var angleX = this.xFactor * Math.asin( xDistanceFromCenter / HORIZ_SAMPLES ) + Math.PI / 180 * this.xOffset;

		var yDistanceFromCenter = ( VERT_SAMPLES / 2 - this.avgCoordY.getCurrentValue( ) / DISPLAY_HEIGHT * VERT_SAMPLES );
		var angleY = this.yFactor * Math.asin( yDistanceFromCenter / VERT_SAMPLES ) + Math.PI / 180 * this.yOffset;			
		
		var posX = this.trackedObj.position.x;
		var posZ = this.trackedObj.position.z;
		var posY = this.trackedObj.position.y;
		var sphereRadius = Math.sqrt( posX * posX + posY * posY + posZ * posZ );
			
		this.trackedObj.position.x = sphereRadius * Math.sin( angleX ) * Math.cos( angleY );
		this.trackedObj.position.z = sphereRadius * Math.cos( angleX ) * Math.cos( angleY );
		this.trackedObj.position.y = sphereRadius * Math.sin( angleY );
	
		this.trackedObj.lookAt( renderScene.position ); 
	}
	
	
	BasicMovementAnalyzer.prototype.processVideoFeed = function() {			
		requestRenderFrame( BasicMovementAnalyzer.prototype.processVideoFeed );			
		sourceCtx.drawImage( sourceVideo, 0, 0, HORIZ_SAMPLES, VERT_SAMPLES );
		APP_STATE.bufferCtx.drawImage( sourceCanvas, 0, 0 );
		outputTexture.loadFromCanvas( APP_STATE.displayBuffer );
		outputCanvas.render( outputTexture );
		outputCanvas.reflect( );
		outputCanvas.shift( );
		outputCanvas.refresh( );
			APP_STATE.bufferCtx.drawImage( sourceCanvas, 0, VERT_SAMPLES );  		
		analyzerInstance.analyzeFrameData( );
		analyzerInstance.adjustViewpoint( );
	}

	BasicMovementAnalyzer.prototype.startProcessing = function() {
		outputCanvas = fx.canvas( );
		outputTexture = outputCanvas.createTexture( APP_STATE.displayBuffer );
		sourceVideo.play( );
		this.processVideoFeed( ); 
	}		
	
	BasicMovementAnalyzer.prototype.displayElement = outputCanvas;
}