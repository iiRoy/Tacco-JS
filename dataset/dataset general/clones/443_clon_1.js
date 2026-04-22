/*
 * This file defines the Compositor object for the Steppe library.
 * It handles the creation and manipulation of texture maps and height maps.
 *
 * @author Andrew J. Baker (original author)
 * @version 1.0.1
 */

/*
 * The main Steppe namespace, ensuring it exists before extending.
 * @namespace Steppe
 */
var Steppe = (function( Steppe ) {


	/*
	 * Constructs a new Compositor instance.
	 *
	 * @class
	 * @memberof Steppe
	 * @param {undefined} undefined - Ensures 'undefined' is truly undefined locally.
	 */
	Steppe.Compositor = function( undefined ) {

		// Private internal data structures for the compositor.
		var _heightmap = [], /* Stores height data */
		    _outOfBoundsHeightmap = [], /* Stores height data for areas outside primary map */
		    _textureArray = []; /* An array to hold processed texture data */


		// The public API for the Compositor object.
		return {

			/**
			 * Adds a texture image to the internal texture array at a specific height.
			 * This texture will be used during the compositing process.
			 *
			 * @method
			 * @name addTexture
			 * @param {number} height The 'height' (0-255) at which this texture should be applied.
			 * @param {Image} textureImage The HTMLImageElement to be used as a texture.
			 * @returns {Steppe.Compositor} This Compositor instance for chaining fluent calls.
			 * @throws {string} If textureImage is not an HTMLImageElement.
			 * @throws {string} If height is outside the valid range of 0 to 255.
			 * @throws {string} If textureImage dimensions are not 256x256 pixels.
			 */
			addTexture: function ( height , textureImage ) {

				// Validate the provided texture image.
				if ( !( textureImage instanceof HTMLImageElement ) ) {
					throw ( 'Invalid textureImage: not an instance of ' +
					        'HTMLImageElement' );
				}

				// Validate the height value.
				if ( ( height < 0 ) || ( height > 255 ) ) {
					throw ( 'Invalid height; must be in the range 0..255' );
				}

				// Validate texture dimensions.
				if ( ( textureImage.width != 256 ) || ( textureImage.height != 256 ) ) {
					throw ( 'Invalid texture dimensions; must be 256x256' );
				}

				// Create a temporary canvas to extract image data.
				var textureCanvas = document.createElement( 'canvas' );
				textureCanvas.width = textureImage.width;
				textureCanvas.height = textureImage.height;

				// Get the 2D rendering context for the canvas.
				var textureContext = textureCanvas.getContext( '2d' );

				// Draw the image onto the canvas.
				textureContext.drawImage( textureImage , 0 , 0 ,
				                         textureCanvas.width , textureCanvas.height );

				// Store the image data in the texture array at the specified height.
				_textureArray[ height ] = {
					data: textureContext.getImageData( 0 , 0 ,
					                                   textureCanvas.width ,
					                                   textureCanvas.height ).data ,
					height: textureCanvas.height ,
					width: textureCanvas.width
				};

				return this; // Enable fluent interface.
			} ,

			/**
			 * Creates a composite texturemap on a given canvas using the loaded heightmap
			 * and the textures in the texture-array.
			 *
			 * @method
			 * @name composite
			 * @param {HTMLCanvasElement} texturemapCanvas The target canvas where the final
			 *                                             composite texturemap will be drawn.
			 * @throws {string} If texturemapCanvas is not an HTMLCanvasElement.
			 * @throws {string} If no texture has been added at height 255.
			 */
			composite: function ( texturemapCanvas ) {

				// Ensure the target canvas is valid.
				if ( !( texturemapCanvas instanceof HTMLCanvasElement ) ) {
					throw ( 'Invalid texturemapCanvas: not an instance of ' +
					        'HTMLCanvasElement' );
				}

				// Get the 2D context of the output canvas.
				var texturemapContext = texturemapCanvas.getContext( '2d' );

				// Create a scratch canvas (though not explicitly used in this iteration,
				// it might be for more complex texture processing).
				var textureCanvas = document.createElement( 'canvas' );
				textureCanvas.width = 256;
				textureCanvas.height = 256;

				var textureContext = textureCanvas.getContext( '2d' ); // Scratch context.

				// Ensure a texture exists at height 255, which is critical for the fill-down logic.
				if ( _textureArray[ 255 ] === undefined ) {
					throw ( 'No texture added at height 255; unable to ' +
					        'composite' );
				}

				// Propagate textures downwards: if a height has no texture, use the one from the height above it.
				for ( var i = 254 ; i >= 0 ; --i ) {
					if ( _textureArray[ i ] === undefined ) {
						_textureArray[ i ] = _textureArray[ i + 1 ];
					}
				}

				// Iterate over each pixel of the 1024x1024 heightmap.
				for ( var y = 0 ; y < 1024 ; ++y ) {
					for ( var x = 0 ; x < 1024 ; ++x ) {
						// Get the height value from the heightmap for the current pixel.
						var height = _heightmap[ ( y << 10 ) + x ];

						// Calculate the index for fetching texture data (based on 256x256 texture tiling).
						var index = ( ( y & 255 ) << 10 ) + ( ( x & 255 ) << 2 );

						// Set the fill style using RGB values from the corresponding texture.
						texturemapContext.fillStyle = 'rgb(' +
						                              _textureArray[ height ].data[ index ] + ',' +
						                              _textureArray[ height ].data[ index + 1 ] + ',' +
						                              _textureArray[ height ].data[ index + 2 ] + ')';

						// Draw a 1x1 pixel rectangle on the output canvas.
						texturemapContext.fillRect( x , y , 1 , 1 );
					}
				}
			} ,

			/**
			 * Retrieves the current heightmap as a flat array of height values.
			 *
			 * @method
			 * @name getHeightmap
			 * @returns {Array<number>} An array representing the heightmap data.
			 */
			getHeightmap: function ( ) {
				return _heightmap;
			} ,

			/**
			 * Retrieves the current out-of-bounds heightmap as a flat array.
			 * This map typically mirrors the main heightmap initially.
			 *
			 * @method
			 * @name getOutOfBoundsHeightmap
			 * @returns {Array<number>} An array representing the out-of-bounds heightmap data.
			 */
			getOutOfBoundsHeightmap: function ( ) {
				return _outOfBoundsHeightmap;
			} ,

			/**
			 * Applies a 2.5D sprite's heightmap (mask) onto the main heightmap at a specified location.
			 * The mask should be a greyscale image where pixel intensity corresponds to height.
			 *
			 * @method
			 * @name putMask
			 * @param {HTMLImageElement} mask The HTMLImageElement representing the sprite's heightmap.
			 * @param {number} x The x-coordinate on the main heightmap where the mask should be applied.
			 * @param {number} y The y-coordinate on the main heightmap where the mask should be applied.
			 * @param {number} scaleFactor A multiplier for the mask's height values.
			 * @returns {Steppe.Compositor} This Compositor instance for fluent chaining.
			 */
			putMask: function ( mask , x , y , scaleFactor ) {

				// Create a temporary canvas for the mask image.
				var maskCanvas = document.createElement( 'canvas' );
				maskCanvas.width = mask.width;
				maskCanvas.height = mask.height;

				// Get context and draw the mask.
				var maskContext = maskCanvas.getContext( '2d' );
				maskContext.drawImage( mask , 0 , 0 );

				// Get the pixel data from the mask.
				var data = maskContext.getImageData( 0 , 0 , maskCanvas.width ,
				                                     maskCanvas.height ).data;

				// Iterate over each pixel of the mask.
				for ( var y2 = 0 ; y2 < maskCanvas.height ; ++y2 ) {
					for ( var x2 = 0 ; x2 < maskCanvas.width ; ++x2 ) {
						// Calculate the index within the mask's pixel data.
						var index = y2 * maskCanvas.width + x2;

						// Check if the pixel is opaque (alpha channel).
						if ( data[ index * 4 + 3 ] ) {
							// Calculate the corresponding index in the main heightmap.
							var heightmapIndex = ( ( y2 + y ) << 10 ) + ( x2 + x );

							// Apply the mask's height value, scaled and offset.
							_heightmap[ heightmapIndex ] = 192 +
							                                data[ ( y2 * maskCanvas.width + x2 ) * 4 ] *
							                                scaleFactor;
						}
					}
				}

				return this; // Fluent interface.
			} ,

			/**
			 * Sets the primary heightmap and the out-of-bounds heightmap from a given canvas.
			 * The canvas should contain a greyscale image where pixel intensity represents height.
			 *
			 * @method
			 * @name setHeightmap
			 * @param {HTMLCanvasElement} heightmapCanvas The canvas containing the heightmap image (expected 1024x1024).
			 * @returns {Steppe.Compositor} This Compositor instance for fluent chaining.
			 */
			setHeightmap: function ( heightmapCanvas ) {

				// Extract pixel data from the heightmap canvas.
				var data = heightmapCanvas.getContext( '2d' )
				                          .getImageData( 0 , 0 , 1024 , 1024 ).data;

				// Populate both heightmap arrays.
				for ( var y = 0 ; y < 1024 ; ++y ) {
					for ( var x = 0 ; x < 1024 ; ++x ) {
						var index = ( y << 10 ) + x; // Calculate linear array index.

						// Store the red channel value as height.
						_heightmap[ index ] = data[ index << 2 ];
						// Out-of-bounds map initially mirrors the main heightmap.
						_outOfBoundsHeightmap[ index ] = _heightmap[ index ];
					}
				}

				return this; // Fluent interface.
			}
		};
	};

	// Return the modified Steppe object.
	return Steppe;

} ( Steppe || { } ) ); // Pass Steppe, creating it if it doesn't exist.