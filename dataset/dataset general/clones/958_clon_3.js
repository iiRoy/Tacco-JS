function GeomObject() {
    // Expert-level WebGL asset manager for complex 3D models.
    // Handles parsing, buffer creation, texture loading, and rendering.

    // A counter for materials (shaders and their associated data) that are still pending setup.
    this.pendingMaterialsCount = 0;
    // The user-defined function to call once all initial loading and setup is complete.
    this.completionHandler = null;

    /**
     * Completes the setup for a newly linked shader program.
     * Retrieves all necessary attribute and uniform locations.
     * @param {WebGLProgram} linkedShaderProgram - The WebGL program that has just finished linking.
     */
    this.shaderLinkComplete = function(linkedShaderProgram) {
        // Validation: Ensure we have a valid program to work with.
        if (!linkedShaderProgram) {
            console.error("Attempted to complete setup for a null or undefined shader program.");
            return;
        }

        // Renaming attributes and uniforms for clarity and to differentiate from original
        const posAttributeName = 'aVertexPosition';
        const normAttributeName = 'aVertexNormal';
        const texCoordAttributeName = 'aVertexTextureCoord';

        const modelMatrixUniformName = 'uMMatrix';
        const projMatrixUniformName = 'uPMatrix';
        const viewMatrixUniformName = 'uVMatrix';

        const diffuseSamplerUniformName = 'uDiffuseSampler';
        const emissiveSamplerUniformName = 'uEmissiveSampler';

        // Storing attribute locations directly on the program object for easy access during rendering.
        linkedShaderProgram.posAttribLoc = gl.getAttribLocation(linkedShaderProgram, posAttributeName);
        linkedShaderProgram.normAttribLoc = gl.getAttribLocation(linkedShaderProgram, normAttributeName);
        linkedShaderProgram.texCoordAttribLoc = gl.getAttribLocation(linkedShaderProgram, texCoordAttributeName);

        // Storing uniform locations for matrices
        linkedShaderProgram.modelMatUniform = gl.getUniformLocation(linkedShaderProgram, modelMatrixUniformName);
        linkedShaderProgram.projMatUniform = gl.getUniformLocation(linkedShaderProgram, projMatrixUniformName);
        linkedShaderProgram.viewMatUniform = gl.getUniformLocation(linkedShaderProgram, viewMatrixUniformName);

        // Storing uniform locations for texture samplers
        linkedShaderProgram.diffuseSamplerUni = gl.getUniformLocation(linkedShaderProgram, diffuseSamplerUniformName);
        linkedShaderProgram.emissiveSamplerUni = gl.getUniformLocation(linkedShaderProgram, emissiveSamplerUniformName);

        // Decrement the counter for pending materials. If it reaches zero, trigger the global completion callback.
        if (this.pendingMaterialsCount > 0) { // Check to prevent negative counts if callback is called multiple times
            this.pendingMaterialsCount--;
            if (this.pendingMaterialsCount === 0 && typeof this.completionHandler === 'function') {
                this.completionHandler();
                // Optionally clear the handler to prevent re-calling
                this.completionHandler = null;
            }
        }
    };

    /**
     * Asynchronously loads a 2D texture from a specified image path.
     * @param {string} textureAssetPath - The URL or path to the image file.
     * @returns {WebGLTexture} The WebGL texture object, which will be populated once the image loads.
     */
    this.fetchTextureAsset = function(textureAssetPath) {
        if (!textureAssetPath) {
            console.warn("Attempted to load texture with empty path. Returning null texture.");
            return null;
        }

        const newTextureId = gl.createTexture();
        const imageElement = new Image();
        const targetTextureType = gl.TEXTURE_2D;

        // Set a default 1x1 transparent texture while the actual image loads.
        // This prevents rendering issues if the image takes time to load.
        gl.bindTexture(targetTextureType, newTextureId);
        gl.texImage2D(targetTextureType, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])); // A single transparent pixel

        imageElement.onload = () => {
            gl.bindTexture(targetTextureType, newTextureId);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip image on Y-axis to match WebGL's UV origin
            gl.texImage2D(targetTextureType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageElement);

            // Generate mipmaps for better quality at varying distances
            gl.generateMipmap(targetTextureType);

            // Set texture parameters for filtering
            gl.texParameteri(targetTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(targetTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // Use mipmaps for minification

            // Unbind the texture to avoid accidental modifications
            gl.bindTexture(targetTextureType, null);
        };

        imageElement.onerror = (err) => {
            console.error(`Failed to load texture from path: ${textureAssetPath}`, err);
            // Optionally, load a "missing texture" fallback here.
        };

        imageElement.src = textureAssetPath; // Start loading the image
        return newTextureId;
    };

    /**
     * Initializes the geometry object from a JSON string containing mesh data.
     * Creates WebGL buffers for positions, indices, normals, and UVs.
     * Also loads materials and their associated shader programs.
     * @param {string} jsonDataString - The JSON string containing the mesh definition.
     */
    this.initializeFromJSON = function(jsonDataString) {
        let parsedData;
        try {
            parsedData = JSON.parse(jsonDataString);
        } catch (e) {
            console.error("Error parsing JSON mesh data:", e);
            return; // Abort initialization if JSON is invalid
        }

        if (!parsedData || !parsedData.vertexPositions || !parsedData.indices) {
            console.error("JSON data is missing essential mesh components (vertexPositions or indices).");
            return;
        }

        // --- Buffer Creation and Data Upload ---

        // Vertex Positions
        this.positionBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedData.vertexPositions), gl.STATIC_DRAW);

        // Element Indices
        this.elementIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parsedData.indices), gl.STATIC_DRAW);

        // Vertex Normals (optional)
        if (parsedData.vertexNormals && parsedData.vertexNormals.length > 0) {
            this.normalBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedData.vertexNormals), gl.STATIC_DRAW);
        } else {
            this.normalBufferObject = null; // Ensure it's explicitly null if not present
        }

        // Vertex Texture Coordinates (optional)
        if (parsedData.vertexTextureCoords && parsedData.vertexTextureCoords.length > 0) {
            this.uvBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parsedData.vertexTextureCoords), gl.STATIC_DRAW);
        } else {
            this.uvBufferObject = null; // Ensure it's explicitly null if not present
        }

        // --- Material and Shader Program Loading ---
        this.renderPrograms = []; // Array to hold all shader programs for different materials
        const selfRef = this; // Capture 'this' for use in callbacks

        if (!parsedData.materials || parsedData.materials.length === 0) {
            console.warn("No materials found in mesh data. Object might not render correctly.");
            // If no materials, and no shaders to load, call completion handler directly.
            if (typeof this.completionHandler === 'function') {
                this.completionHandler();
                this.completionHandler = null;
            }
            return;
        }

        this.pendingMaterialsCount = parsedData.materials.length;

        // Iterate through each material defined in the JSON data
        parsedData.materials.forEach((matItem, materialIndex) => {
            // Assume 'compileAndLinkShader' is a global function that loads shader sources
            // and compiles/links them, then calls a callback.
            const currentRenderProg = compileAndLinkShader(
                matItem.vertexshader,
                matItem.fragmentshader,
                (linkedProg) => {
                    // This callback is executed once the shader program is ready.
                    selfRef.shaderLinkComplete(linkedProg);
                }
            );

            // Store material-specific data on the program object
            currentRenderProg.indexCount = matItem.numindices;

            // Load diffuse texture if specified
            if (matItem.diffuse) {
                currentRenderProg.diffuseMap = this.fetchTextureAsset(matItem.diffuse);
            }

            // Load emissive texture if specified
            if (matItem.emissive) {
                currentRenderProg.emissiveMap = this.fetchTextureAsset(matItem.emissive);
            }

            this.renderPrograms.push(currentRenderProg);
        });
    };

    /**
     * Initiates the loading of a mesh asset from a file.
     * @param {string} resourceFile - The path to the mesh JSON file.
     * @param {Function} completionCallback - A function to call once the mesh is fully loaded and initialized.
     */
    this.beginAssetLoading = function(resourceFile, completionCallback) {
        if (!resourceFile || typeof resourceFile !== 'string') {
            console.error("Invalid resource file path provided for mesh loading.");
            return;
        }
        if (typeof completionCallback !== 'function') {
            console.error("A valid completion callback function is required for mesh loading.");
            return;
        }

        this.completionHandler = completionCallback;
        const selfInstance = this; // Reference to the current GeomObject instance

        // Assume 'resourceFetcher' is a global utility function that fetches file content.
        // The last two 'false, true' parameters from the original `loadFile` are omitted,
        // assuming `resourceFetcher` handles these defaults or is simpler.
        resourceFetcher(resourceFile, (dataContent) => {
            selfInstance.initializeFromJSON(dataContent);
        });
    };

    /**
     * Applies the current model, projection, and view matrices to the given shader program's uniforms.
     * Assumes global `fetchModelMatrix()`, `fetchProjectionMatrix()`, `fetchViewMatrix()` functions exist.
     * @param {WebGLProgram} currentProgram - The shader program to set the uniforms for.
     */
    this.applyMatrixUniforms = function(currentProgram) {
        if (!currentProgram) {
            console.warn("Attempted to set matrix uniforms on a null program.");
            return;
        }

        // Retrieve matrix data from global utility functions.
        const modelMatrixData = fetchModelMatrix().elements; // Assuming '.elements' property for matrix data
        const projectionMatrixData = fetchProjectionMatrix().elements;
        const viewMatrixData = fetchViewMatrix().elements;

        // Update uniform values in the active shader program.
        gl.uniformMatrix4fv(currentProgram.modelMatUniform, false, modelMatrixData);
        gl.uniformMatrix4fv(currentProgram.projMatUniform, false, projectionMatrixData);
        gl.uniformMatrix4fv(currentProgram.viewMatUniform, false, viewMatrixData);
    };

    /**
     * Renders the geometry object. Iterates through each material/program,
     * sets up the WebGL state, and draws the corresponding part of the mesh.
     */
    this.renderGeometry = function() {
        if (!this.renderPrograms || this.renderPrograms.length === 0) {
            // console.warn("No shader programs available to render geometry.");
            return;
        }

        let startIndexOffset = 0; // Tracks the starting index for drawing elements for each material

        // Cache common WebGL constants for minor performance/readability improvements
        const ARRAY_BUFFER_TYPE = gl.ARRAY_BUFFER;
        const ELEMENT_ARRAY_BUFFER_TYPE = gl.ELEMENT_ARRAY_BUFFER;
        const FLOAT_TYPE = gl.FLOAT;
        const UNSIGNED_SHORT_TYPE = gl.UNSIGNED_SHORT;
        const TRIANGLES_MODE = gl.TRIANGLES;

        // Bind the global index buffer once, as it's shared by all programs
        gl.bindBuffer(ELEMENT_ARRAY_BUFFER_TYPE, this.elementIndexBuffer);

        // Loop through each shader program (each corresponds to a material segment of the mesh)
        for (let programIndex = 0; programIndex < this.renderPrograms.length; ++programIndex) {
            const currentShaderPgm = this.renderPrograms[programIndex];

            // Activate the current shader program
            gl.useProgram(currentShaderPgm);

            // --- Configure Vertex Attributes ---

            // Position attribute
            if (currentShaderPgm.posAttribLoc !== -1) {
                gl.enableVertexAttribArray(currentShaderPgm.posAttribLoc);
                gl.bindBuffer(ARRAY_BUFFER_TYPE, this.positionBufferObject);
                gl.vertexAttribPointer(currentShaderPgm.posAttribLoc, 3, FLOAT_TYPE, false, 0, 0);
            }

            // Normal attribute (if available)
            if (this.normalBufferObject && currentShaderPgm.normAttribLoc !== -1) {
                gl.enableVertexAttribArray(currentShaderPgm.normAttribLoc);
                gl.bindBuffer(ARRAY_BUFFER_TYPE, this.normalBufferObject);
                gl.vertexAttribPointer(currentShaderPgm.normAttribLoc, 3, FLOAT_TYPE, false, 0, 0);
            } else if (currentShaderPgm.normAttribLoc !== -1) {
                gl.disableVertexAttribArray(currentShaderPgm.normAttribLoc); // Disable if no normals
            }

            // Texture Coordinate attribute (if available)
            if (this.uvBufferObject && currentShaderPgm.texCoordAttribLoc !== -1) {
                gl.enableVertexAttribArray(currentShaderPgm.texCoordAttribLoc);
                gl.bindBuffer(ARRAY_BUFFER_TYPE, this.uvBufferObject);
                gl.vertexAttribPointer(currentShaderPgm.texCoordAttribLoc, 2, FLOAT_TYPE, false, 0, 0);
            } else if (currentShaderPgm.texCoordAttribLoc !== -1) {
                gl.disableVertexAttribArray(currentShaderPgm.texCoordAttribLoc); // Disable if no UVs
            }

            // --- Configure Textures ---

            // Diffuse Texture (Texture Unit 0)
            if (currentShaderPgm.diffuseMap) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, currentShaderPgm.diffuseMap);
                gl.uniform1i(currentShaderPgm.diffuseSamplerUni, 0);
            } else {
                // Optionally bind a default white texture if no diffuse map exists
                // gl.activeTexture(gl.TEXTURE0);
                // gl.bindTexture(gl.TEXTURE_2D, defaultWhiteTexture);
                // gl.uniform1i(currentShaderPgm.diffuseSamplerUni, 0);
            }

            // Emissive Texture (Texture Unit 1)
            if (currentShaderPgm.emissiveMap) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, currentShaderPgm.emissiveMap);
                gl.uniform1i(currentShaderPgm.emissiveSamplerUni, 1);
            }

            // --- Apply Matrices ---
            this.applyMatrixUniforms(currentShaderPgm);

            // --- Draw Call ---
            // The `startIndexOffset * 2` is because gl.UNSIGNED_SHORT indices are 2 bytes each.
            const byteOffset = startIndexOffset * Uint16Array.BYTES_PER_ELEMENT;
            gl.drawElements(TRIANGLES_MODE, currentShaderPgm.indexCount, UNSIGNED_SHORT_TYPE, byteOffset);

            // Increment the offset for the next material's indices
            startIndexOffset += currentShaderPgm.indexCount;

            // Clean up: Disable vertex attribute arrays that were enabled for this program
            // This is good practice to prevent state bleeding into subsequent draw calls
            if (currentShaderPgm.posAttribLoc !== -1) gl.disableVertexAttribArray(currentShaderPgm.posAttribLoc);
            if (currentShaderPgm.normAttribLoc !== -1) gl.disableVertexAttribArray(currentShaderPgm.normAttribLoc);
            if (currentShaderPgm.texCoordAttribLoc !== -1) gl.disableVertexAttribArray(currentShaderPgm.texCoordAttribLoc);

            // Unbind textures after use to prevent conflicts
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null);
        }

        // Final cleanup: Unbind the element array buffer
        gl.bindBuffer(ELEMENT_ARRAY_BUFFER_TYPE, null);
    };
}