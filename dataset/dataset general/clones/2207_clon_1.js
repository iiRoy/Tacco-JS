// This is the main constructor function for the WebCLGLUtils class.
/*
 * It initializes an instance of the utility class
 * with a WebGL rendering context.
 */
WebCLGLUtils = function( gl )
{
	// Store the WebGL context as a property of the instance.
	this.gl = gl ;
} ; // End of WebCLGLUtils constructor definition.


/**
 * @private
 * This method is intended for internal use only within the WebCLGLUtils class.
 * It generates vertex, texture, and index data for a 2D quad.
 *
 * @param {object} node A placeholder argument, not used internally.
 * @param {number} [length] The half-length of the quad. Defaults to 0.5.
 * @param {number} [height] The half-height of the quad. Defaults to 0.5.
 * @returns {object} An object containing the vertex, texture, and index arrays,
 *                   along with their item sizes and number of items (which are
 *                   not explicitly set here but are part of the original structure).
 */
WebCLGLUtils.prototype.loadQuad = function( node , length , height )
{
	// Determine the half-length and half-height of the quad.
	// Default to 0.5 if length or height are not provided.
	var l = ( length == undefined ) ? 0.5 : length ;
	var h = ( height == undefined ) ? 0.5 : height ;


	// Define the vertex coordinates for the quad.
	// Vertices are ordered counter-clockwise starting from bottom-left.
	this.vertexArray = [
		-l , -h , 0.0 ,   // Bottom-left vertex (x, y, z)
		 l , -h , 0.0 ,   // Bottom-right vertex
		 l ,  h , 0.0 ,   // Top-right vertex
		-l ,  h , 0.0     // Top-left vertex
	] ;

	// Define the texture coordinates for the quad.
	// Corresponds to the vertex order, often (u, v, w) where w is usually 0.0 for 2D textures.
	this.textureArray = [
		0.0 , 0.0 , 0.0 ,  // Bottom-left texture coord
		1.0 , 0.0 , 0.0 ,  // Bottom-right texture coord
		1.0 , 1.0 , 0.0 ,  // Top-right texture coord
		0.0 , 1.0 , 0.0    // Top-left texture coord
	] ;

	// Define the index array for drawing the quad as two triangles.
	// Triangle 1: (vertex 0, vertex 1, vertex 2)
	// Triangle 2: (vertex 0, vertex 2, vertex 3)
	this.indexArray = [ 0 , 1 , 2 ,      0 , 2 , 3 ] ;

	// Create a new object to hold the mesh data.
	var meshObject = new Object ;

	// Assign vertex related data to the mesh object.
	meshObject.vertexArray = this.vertexArray ;
	meshObject.vertexItemSize = this.vertexItemSize ; // This might be undefined in the original context, but kept as is for clone.
	meshObject.vertexNumItems = this.vertexNumItems ; // This might be undefined in the original context, but kept as is for clone.

	// Assign texture related data to the mesh object.
	meshObject.textureArray = this.textureArray ;
	meshObject.textureItemSize = this.textureItemSize ; // Kept as is.
	meshObject.textureNumItems = this.textureNumItems ; // Kept as is.

	// Assign index related data to the mesh object.
	meshObject.indexArray = this.indexArray ;
	meshObject.indexItemSize = this.indexItemSize ; // Kept as is.
	meshObject.indexNumItems = this.indexNumItems ; // Kept as is.

	// Return the populated mesh object.
	return meshObject ;
} ; // End of loadQuad method.

/**
 * @private
 * This function handles the creation, compilation, and linking of
 * WebGL vertex and fragment shaders into a program.
 * It provides detailed error logging for compilation and linking failures.
 *
 * @param {string} name A descriptive name for the shader program, used in error messages.
 * @param {string} sourceVertex The GLSL source code for the vertex shader.
 * @param {string} sourceFragment The GLSL source code for the fragment shader.
 * @param {WebGLProgram} shaderProgram The WebGL program object to attach and link shaders to.
 */
WebCLGLUtils.prototype.createShader = function ( name , sourceVertex , sourceFragment , shaderProgram )
{
	// Flags to track successful compilation of vertex and fragment shaders.
	var _sv = false , _sf = false ;

	// --- Vertex Shader Compilation ---
	var shaderVertex = this.gl.createShader( this.gl.VERTEX_SHADER ) ;
	this.gl.shaderSource( shaderVertex , sourceVertex ) ;
	this.gl.compileShader( shaderVertex ) ;

	// Check if vertex shader compilation was successful.
	if ( ! this.gl.getShaderParameter( shaderVertex , this.gl.COMPILE_STATUS ) )
	{
		// Log and alert about vertex shader compilation errors.
		alert( 'Error sourceVertex of shader ' + name + '. See console.' ) ;
		console.log( 'Error vertex-shader ' + name + ':\n ' + this.gl.getShaderInfoLog( shaderVertex ) ) ;

		// Provide more detailed info if available.
		if ( this.gl.getShaderInfoLog( shaderVertex ) != undefined )
		{
			console.log( this.gl.getShaderInfoLog( shaderVertex ) ) ;
		}
	}
	else  // If vertex shader compiled successfully.
	{
		// Attach the vertex shader to the program.
		this.gl.attachShader( shaderProgram , shaderVertex ) ;
		_sv = true ; // Mark vertex shader as successfully processed.
	}


	// --- Fragment Shader Compilation ---
	var shaderFragment = this.gl.createShader( this.gl.FRAGMENT_SHADER ) ;
	this.gl.shaderSource( shaderFragment , sourceFragment ) ;
	this.gl.compileShader( shaderFragment ) ;

	// Check if fragment shader compilation was successful.
	if ( ! this.gl.getShaderParameter( shaderFragment , this.gl.COMPILE_STATUS ) )
	{
		// Log and alert about fragment shader compilation errors.
		alert( 'Error sourceFragment of shader ' + name + '. See console.' ) ;
		var infoLog = this.gl.getShaderInfoLog( shaderFragment ) ;
		console.log( 'Error fragment-shader ' + name + ':\n ' + infoLog ) ;

		// Detailed error parsing and logging for fragment shader.
		if ( infoLog != undefined )
		{
			console.log( infoLog ) ;
			var arrErrors = [ ] ;
			var errors = infoLog.split( "\n" ) ;

			// Parse each error line from the info log.
			for ( var n = 0 , f = errors.length ; n < f ; n ++ )
			{
				if ( errors[ n ].match( /^ERROR/gim ) != null )
				{
					var expl = errors[ n ].split( ':' ) ;
					var line = parseInt( expl[ 2 ] ) ;
					arrErrors.push( [ line , errors[ n ] ] ) ;
				}
			}

			// Retrieve and display the shader source with error indicators.
			var sour = this.gl.getShaderSource( shaderFragment ).split( "\n" ) ;
			sour.unshift( "" ) ; // Add an empty string at the beginning to align line numbers correctly (GLSL lines are 1-indexed).

			for ( var n = 0 , f = sour.length ; n < f ; n ++ )
			{
				var lineWithError = false ;
				var errorStr = '' ;

				// Check if the current line number corresponds to an error.
				for ( var e = 0 , fe = arrErrors.length ; e < fe ; e ++ )
				{
					if ( n == arrErrors[ e ][ 0 ] )
					{
						lineWithError = true ;
						errorStr = arrErrors[ e ][ 1 ] ;
						break ;
					}
				}

				// Log the line, indicating if an error is present.
				if ( lineWithError == false )
				{
					console.log( n + ' ' + sour[ n ] ) ;
				}
				else
				{
					console.log( '►►' + n + ' ' + sour[ n ] + '\n' + errorStr ) ;
				}
			}
		}
	}
	else // If fragment shader compiled successfully.
	{
		// Attach the fragment shader to the program.
		this.gl.attachShader( shaderProgram , shaderFragment ) ;
		_sf = true ; // Mark fragment shader as successfully processed.
	}


	// --- Program Linking ---
	// Link the program only if both shaders compiled successfully.
	if ( _sv == true && _sf == true )
	{
		this.gl.linkProgram( shaderProgram ) ;

		// Check if the shader program linking was successful.
		if ( ! this.gl.getProgramParameter( shaderProgram , this.gl.LINK_STATUS ) )
		{
			// Log and alert about program linking errors.
			alert( 'Error in shader ' + name ) ;
			console.log( 'Error shader program ' + name + ':\n ' ) ;

			// Provide more detailed info if available.
			if ( this.gl.getProgramInfoLog( shaderProgram ) != undefined )
			{
				console.log( this.gl.getProgramInfoLog( shaderProgram ) ) ;
			}
		}
	}
} ; // End of createShader method.


/**
 * Converts an HTMLImageElement into a Uint8Array of pixel data.
 * This is useful for processing image data with WebGL textures.
 *
 * @returns {Uint8Array} The raw pixel data (RGBA) from the image.
 * @param {HTMLImageElement} imageElement The source image element.
 */
WebCLGLUtils.prototype.getUint8ArrayFromHTMLImageElement = function ( imageElement )
{
	// Create a temporary canvas element to draw the image onto.
	var e = document.createElement( 'canvas' ) ;

	// Set the canvas dimensions to match the image.
	e.width = imageElement.width ;
	e.height = imageElement.height ;

	// Get the 2D rendering context of the canvas.
	var ctx2D_tex = e.getContext( "2d" ) ;

	// Draw the image onto the canvas at position (0,0).
	ctx2D_tex.drawImage( imageElement , 0 , 0 ) ;

	// Retrieve the pixel data from the canvas for the entire image area.
	var arrayTex = ctx2D_tex.getImageData( 0 , 0 , imageElement.width , imageElement.height ) ;

    // Return the data property, which is a Uint8ClampedArray (a type of Uint8Array)
    // containing the RGBA pixel values.
    return arrayTex.data ;
} ; // End of getUint8ArrayFromHTMLImageElement method.


/**
 * @private
 * Calculates the dot product of two 4-component vectors.
 * Each component is a float.
 * @param {Array<number>} vector4A The first 4-component vector.
 * @param {Array<number>} vector4B The second 4-component vector.
 * @returns {number} The scalar dot product of the two vectors.
 */
WebCLGLUtils.prototype.dot4 = function ( vector4A , vector4B )
{
	// Perform the dot product calculation by summing the products of corresponding components.
	return vector4A[ 0 ] * vector4B[ 0 ] +
	       vector4A[ 1 ] * vector4B[ 1 ] +
	       vector4A[ 2 ] * vector4B[ 2 ] +
	       vector4A[ 3 ] * vector4B[ 3 ] ;
} ; // End of dot4 method.


/**
 * @private
 * Computes the fractional part of a given number.
 * For example, fract(3.14159) would return 0.14159.
 * This is equivalent to `number % 1` for positive numbers, but works correctly for negative numbers as well.
 * @param {number} number The input number.
 * @returns {number} The fractional part of the number.
 */
WebCLGLUtils.prototype.fract = function ( number )
{
	// The fractional part is the number minus its floor (the largest integer less than or equal to the number).
	return number - Math.floor( number ) ;
} ; // End of fract method.


/**
 * @private
 * Packs a single float value (expected range 0.0-1.0) into a 4-component RGBA float array.
 * This is typically used for encoding high-precision depth values into textures
 * where a single float texture format might not be available or desired.
 * @param {number} v The float value to pack.
 * @returns {Array<number>} A 4-component RGBA array, where each component is in the range 0.0-1.0.
 */
WebCLGLUtils.prototype.pack = function ( v )
{
	// Define a bias vector used in the packing process to prevent precision issues.
	var bias = [ 1.0 / 255.0 , 1.0 / 255.0 , 1.0 / 255.0 , 0.0 ] ;

	// Extract the individual RGBA components using the fract function.
	// This process effectively "shifts" the bits of the float into different color channels.
	var r = v ;
	var g = this.fract( r * 255.0 ) ;
	var b = this.fract( g * 255.0 ) ;
	var a = this.fract( b * 255.0 ) ;

	// Assemble the raw color components into an array.
	var colour = [ r , g , b , a ] ;

	// Calculate the "dd" (delta-delta?) components by multiplying specific color channels with the bias.
	var dd = [ colour[ 1 ] * bias[ 0 ] ,
	           colour[ 2 ] * bias[ 1 ] ,
	           colour[ 3 ] * bias[ 2 ] ,
	           colour[ 3 ] * bias[ 3 ]
	         ] ;

	// Return the final packed color by subtracting the dd components, which helps with precision.
	return [ colour[ 0 ] - dd[ 0 ] ,
	         colour[ 1 ] - dd[ 1 ] ,
	         colour[ 2 ] - dd[ 2 ] ,
	         colour[ 3 ] - dd[ 3 ]
	       ] ;
} ; // End of pack method.


/**
 * @private
 * Unpacks a 4-component RGBA float array (each 0.0-1.0) back into a single float value.
 * This is the reverse operation of the `pack` function, used for decoding depth values
 * or other packed floats from textures.
 * @param {Array<number>} colour The 4-component RGBA array to unpack.
 * @returns {number} The original float value (expected range 0.0-1.0).
 */
WebCLGLUtils.prototype.unpack = function ( colour )
{
	// Define the bit shift values used for unpacking. These are powers of 255.
	var bitShifts = [
		1.0 ,                      // Corresponds to the 'r' component
		1.0 / 255.0 ,              // Corresponds to the 'g' component
		1.0 / ( 255.0 * 255.0 ) ,  // Corresponds to the 'b' component
		1.0 / ( 255.0 * 255.0 * 255.0 ) // Corresponds to the 'a' component
	] ;

	// Perform a dot product with the color and bit shifts to reconstruct the original float.
	return this.dot4( colour , bitShifts ) ;
} ; // End of unpack method.


/**
 * Generates the GLSL source code string for the `pack` function.
 * This function encodes a single float depth value into a vec4 color for use in shaders.
 *
 * @returns {String} The GLSL function string for packing a float.
 */
WebCLGLUtils.prototype.packGLSLFunctionString = function ( )
{
	// Returns a multi-line string representing the GLSL pack function.
	return 'vec4 pack (float depth) {' +
	       '    const vec4 bias = vec4(1.0 / 255.0,' +
	       '                          1.0 / 255.0,' +
	       '                          1.0 / 255.0,' +
	       '                          0.0);' +
	       '' + // Added a blank line for visual separation in the GLSL string.
	       '    float r = depth;' +
	       '    float g = fract(r * 255.0);' +
	       '    float b = fract(g * 255.0);' +
	       '    float a = fract(b * 255.0);' +
	       '    vec4 colour = vec4(r, g, b, a);' +
	       '    ' + // Another blank line.
	       '    return colour - (colour.yzww * bias);' +
	       '}' ;
} ; // End of packGLSLFunctionString method.


/**
 * Generates the GLSL source code string for the `unpack` function.
 * This function decodes a vec4 color back into a single float depth value for use in shaders.
 *
 * @returns {String} The GLSL function string for unpacking a float.
 */
WebCLGLUtils.prototype.unpackGLSLFunctionString = function ( )
{
	// Returns a multi-line string representing the GLSL unpack function.
	return 'float unpack (vec4 colour) {' +
	       '    const vec4 bitShifts = vec4(1.0,' +
	       '                                1.0 / 255.0,' +
	       '                                1.0 / (255.0 * 255.0),' +
	       '                                1.0 / (255.0 * 255.0 * 255.0));' +
	       '    return dot(colour, bitShifts);' +
	       '}' ;
} ; // End of unpackGLSLFunctionString method.