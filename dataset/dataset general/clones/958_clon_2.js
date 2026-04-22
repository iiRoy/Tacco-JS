function GeometricObject()
{
	// This method handles the setup of shader attribute and uniform locations
	// once a shader program has been successfully compiled and linked.
	this.shaderCompiled = function(shader)
	{
		shader.vertexPosAttrib = gl.getAttribLocation(shader, 'vPos');
		shader.vertexNormAttrib = gl.getAttribLocation(shader, 'vNorm');
		shader.vertexTexCoordAttrib = gl.getAttribLocation(shader, 'vTex');

		shader.modelMatUniform = gl.getUniformLocation(shader, 'modelMatrix');
		shader.projMatUniform = gl.getUniformLocation(shader, 'projectionMatrix');
		shader.viewMatUniform = gl.getUniformLocation(shader, 'viewMatrix');

		shader.diffuseSamplerUniform = gl.getUniformLocation(shader, 'diffuseTextureSampler');
		shader.emissiveSamplerUniform = gl.getUniformLocation(shader, 'emissiveTextureSampler');

		// Decrement the counter for pending material loads.
		// If all materials are loaded, invoke the completion callback.
		if (--this.remainingLoads === 0)
		{
			this.completionHandler();
		}
	};

	// Loads an image from the specified path and creates a WebGL texture from it.
	this.acquireTexture = function(imagePath)
	{
		const newTexture = gl.createTexture();
		const imageAsset = new Image();

		// Set the onload handler for the image to process it into a texture.
		imageAsset.onload = function()
		{
			gl.bindTexture(gl.TEXTURE_2D, newTexture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip image vertically for WebGL
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageAsset);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D); // Generate mipmaps for better quality at different distances
			gl.bindTexture(gl.TEXTURE0, null); // Unbind the texture
		};

		imageAsset.src = imagePath; // Start loading the image
		return newTexture; // Return the texture object immediately
	};

	// Initializes the geometric object from a JSON string containing model data.
	this.initialize = function(jsonDataString)
	{
		const parsedModelData = JSON.parse(jsonDataString);

		// Setup buffer for vertex positions
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedModelData.vertexPositions), gl.STATIC_DRAW);

		// Setup buffer for element indices
		this.elementBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parsedModelData.indices), gl.STATIC_DRAW);

		// If normals are present, create and populate their buffer
		if (parsedModelData.vertexNormals)
		{
			this.normalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedModelData.vertexNormals), gl.STATIC_DRAW);
		}

		// If texture coordinates are present, create and populate their buffer
		if (parsedModelData.vertexTextureCoords)
		{
			this.texCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedModelData.vertexTextureCoords), gl.STATIC_DRAW);
		}

		// Initialize material and shader program loading
		this.remainingLoads = parsedModelData.materials.length;
		this.shaderPrograms = [];
		const selfRef = this; // Store a reference to 'this' for use in callbacks

		// Iterate through each material to load shaders and textures
		for (const matKey in parsedModelData.materials)
		{
			const surfaceMaterial = parsedModelData.materials[matKey];
			const currentShader = loadProgram(
				surfaceMaterial.vertexshader,
				surfaceMaterial.fragmentshader,
				function(compiledShader) { selfRef.shaderCompiled(compiledShader); } // Callback when shader is ready
			);

			currentShader.elementCount = surfaceMaterial.numindices; // Store number of indices for drawing

			// Load diffuse texture if specified
			if (surfaceMaterial.diffuse)
			{
				currentShader.diffuseMap = this.acquireTexture(surfaceMaterial.diffuse);
			}

			// Load emissive texture if specified
			if (surfaceMaterial.emissive)
			{
				currentShader.emissiveMap = this.acquireTexture(surfaceMaterial.emissive);
			}

			this.shaderPrograms.push(currentShader); // Add the configured shader to the list
		}
	};

	// Initiates the loading process for the model data from a file.
	this.loadModelData = function(modelPath, onCompletion)
	{
		this.completionHandler = onCompletion; // Set the callback to be invoked after all loading is complete
		const instanceRef = this; // Store reference for the callback scope

		// Use an external utility function to load the file content.
		loadFile(modelPath, function(content) { instanceRef.initialize(content); }, false, true);
	};

	// Updates the uniform matrices (model, projection, view) for a given shader program.
	this.updateShaderMatrices = function(targetShader)
	{
		gl.uniformMatrix4fv(targetShader.modelMatUniform, false, modelMatrix().d);
		gl.uniformMatrix4fv(targetShader.projMatUniform, false, projectionMatrix().d);
		gl.uniformMatrix4fv(targetShader.viewMatUniform, false, viewMatrix().d);
	};

	// Renders the geometric object.
	this.render = function()
	{
		let offsetIndex = 0; // Tracks the starting index for drawing elements for each material

		// Loop through each shader program associated with the object's materials
		for (const progKey in this.shaderPrograms)
		{
			const currentProgram = this.shaderPrograms[progKey];

			gl.useProgram(currentProgram); // Activate the current shader program

			// Enable and bind vertex position attribute
			gl.enableVertexAttribArray(currentProgram.vertexPosAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
			gl.vertexAttribPointer(currentProgram.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);

			// If normals exist, enable and bind vertex normal attribute
			if (currentProgram.vertexNormAttrib !== -1)
			{
				gl.enableVertexAttribArray(currentProgram.vertexNormAttrib);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
				gl.vertexAttribPointer(currentProgram.vertexNormAttrib, 3, gl.FLOAT, false, 0, 0);
			}

			// If texture coordinates exist, enable and bind texture coordinate attribute
			if (currentProgram.vertexTexCoordAttrib !== -1)
			{
				gl.enableVertexAttribArray(currentProgram.vertexTexCoordAttrib);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
				gl.vertexAttribPointer(currentProgram.vertexTexCoordAttrib, 2, gl.FLOAT, false, 0, 0);
			}

			// Activate and bind diffuse texture if available
			if (currentProgram.diffuseMap)
			{
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, currentProgram.diffuseMap);
				gl.uniform1i(currentProgram.diffuseSamplerUniform, 0);
			}

			// Activate and bind emissive texture if available
			if (currentProgram.emissiveMap)
			{
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, currentProgram.emissiveMap);
				gl.uniform1i(currentProgram.emissiveSamplerUniform, 1);
			}

			// Update transformation matrices for the current shader
			this.updateShaderMatrices(currentProgram);

			// Draw the elements for the current material
			gl.drawElements(gl.TRIANGLES, currentProgram.elementCount, gl.UNSIGNED_SHORT, offsetIndex * 2);

			// Increment the offset for the next material's elements
			offsetIndex += currentProgram.elementCount;
		}
	};
}