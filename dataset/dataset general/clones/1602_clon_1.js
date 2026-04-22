// Minimal license notice to fulfill the spirit of the original comment.
// Copyright 2014 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

// This file defines the ShaderProgram class for WebGL shader management.

/**
 * Manages a WebGL shader program, encapsulating vertex and fragment shaders.
 * It provides methods for setting shader sources, compiling, linking,
 * and managing uniforms and attributes.
 *
 * Shader sources can be updated dynamically, but linking must be
 * manually triggered after changes.
 *
 * If initial shader sources are provided, the program attempts immediate
 * compilation and linking.
 *
 * @param {!WebGLRenderingContext} gl The active WebGL rendering context.
 * @param {string=} opt_vertexSrc Optional GLSL ES source code for the vertex shader.
 * @param {string=} opt_fragmentSrc Optional GLSL ES source code for the fragment shader.
 * @constructor
 */
var ShaderProgram = function( gl, opt_vertexSrc, opt_fragmentSrc )
{
    // Future enhancement: Consider adding setters for uniforms for better
    // error handling and type checking.

    /**
     * The WebGL context instance used by this program.
     * @private {!WebGLRenderingContext}
     */
    this.gl_ = gl;


    /**
     * Stores the locations of active attribute variables within this program.
     * The keys are the attribute names (strings), and values are their
     * corresponding integer locations.
     * These locations are updated upon successful program linking.
     * @type {!Object.<string, number>}
     */
    this.attributes = {};


    /**
     * A collection of uniform setters and their locations, indexed by uniform name.
     * Each entry is a function that can be called to set the uniform's value.
     * It also exposes `set`, `setVec` (for vector uniforms), and `location`
     * (the raw WebGLUniformLocation).
     *
     * @type {Object.<function>}
     */
    this.uniforms = {};


    /**
     * The underlying WebGLShader object for the vertex shader.
     * Created upon ShaderProgram instantiation.
     * @private {!WebGLShader}
     */
    this.vertexShader_ = gl.createShader( gl.VERTEX_SHADER );


    /**
     * Flag indicating whether the vertex shader has successfully compiled.
     * @private {boolean}
     */
    this.vertexCompiled_ = false;


    /**
     * The underlying WebGLShader object for the fragment shader.
     * Created upon ShaderProgram instantiation.
     * @private {!WebGLShader}
     */
    this.fragmentShader_ = gl.createShader( gl.FRAGMENT_SHADER );


    /**
     * Flag indicating whether the fragment shader has successfully compiled.
     * @private {boolean}
     */
    this.fragmentCompiled_ = false;


    /**
     * The raw WebGLProgram object managed by this class.
     * This is the core linked program.
     * @type {!WebGLProgram}
     */
    this.program = gl.createProgram();


    /**
     * Flag indicating whether the WebGL program has successfully linked.
     * @private {boolean}
     */
    this.programLinked_ = false;


    // Attach the shaders to the program right after creation.
    // They will be compiled and linked later.
    gl.attachShader( this.program, this.vertexShader_ );
    gl.attachShader( this.program, this.fragmentShader_ );


    // If vertex shader source is provided, compile it.
    if ( opt_vertexSrc )
    {
        this.setVertexShader( opt_vertexSrc );
    }

    // If fragment shader source is provided, compile it.
    if ( opt_fragmentSrc )
    {
        this.setFragmentShader( opt_fragmentSrc );
    }

    // Attempt to link the program if both shaders compiled successfully.
    if ( this.vertexCompiled_ && this.fragmentCompiled_ )
    {
        this.link();
    }

}; // End of ShaderProgram constructor function.


/**
 * A mapping from WebGL uniform type constants to their respective
 * `gl.uniform[N][f|i]` setter function names.
 * These are used for non-matrix uniforms.
 *
 * @enum {string}
 * @private
 */
ShaderProgram.UNIFORM_SETTERS_ = {
    0x1406: 'uniform1f', /* FLOAT */
    0x8b50: 'uniform2f', /* FLOAT_VEC2 */
    0x8b51: 'uniform3f', /* FLOAT_VEC3 */
    0x8b52: 'uniform4f', /* FLOAT_VEC4 */
    0x1404: 'uniform1i', /* INT */
    0x8b53: 'uniform2i', /* INT_VEC2 */
    0x8b54: 'uniform3i', /* INT_VEC3 */
    0x8b55: 'uniform4i', /* INT_VEC4 */
    0x8b56: 'uniform1i', /* BOOL */
    0x8b57: 'uniform2i', /* BOOL_VEC2 */
    0x8b58: 'uniform3i', /* BOOL_VEC3 */
    0x8b59: 'uniform4i', /* BOOL_VEC4 */
    0x8b5e: 'uniform1i', /* SAMPLER_2D */
    0x8b60: 'uniform1i', /* SAMPLER_CUBE */
};


/**
 * A mapping from WebGL matrix uniform type constants to their
 * `gl.uniformMatrix[N]fv` setter function names.
 * Matrix uniforms are handled separately as they always take array inputs.
 *
 * @enum {string}
 * @private
 */
ShaderProgram.UNIFORM_MATRIX_SETTERS_ = {
    0x8b5a: 'uniformMatrix2fv', /* FLOAT_MAT2 */
    0x8b5b: 'uniformMatrix3fv', /* FLOAT_MAT3 */
    0x8b5c: 'uniformMatrix4fv', /* FLOAT_MAT4 */
};


/**
 * Asynchronously creates a ShaderProgram instance by fetching shader
 * sources from specified URLs.
 * This method returns a Promise that resolves with the fully
 * compiled and linked ShaderProgram object.
 *
 * @param {!WebGLRenderingContext} gl The WebGL context.
 * @param {string} vertexUrl The URL of the vertex shader source file.
 * @param {string} fragmentUrl The URL of the fragment shader source file.
 * @return {!Promise<ShaderProgram>} A promise resolving to the ShaderProgram.
 */
ShaderProgram.fromXhr = function( gl, vertexUrl, fragmentUrl )
{
    // Initialize a new ShaderProgram instance without initial sources.
    var program = new ShaderProgram( gl );

    // Use Promise.all to fetch both shader sources concurrently.
    return Promise.all( [
        ShaderProgram.promiseXhr_( vertexUrl )
            .then( program.setVertexShader.bind( program ) ),
        ShaderProgram.promiseXhr_( fragmentUrl )
            .then( program.setFragmentShader.bind( program ) )
    ] ).then( function()
    {
        // Once both shaders are fetched and compiled, link the program.
        program.link();
        // Return the ready program.
        return program;
    } );
};


/**
 * Fetches content from a given URL using XMLHttpRequest and returns a Promise.
 * The promise resolves with the response text upon success (HTTP 200)
 * or rejects with the status text upon failure.
 *
 * @param {string} url The URL to fetch.
 * @return {!Promise<string>} A promise resolving with the resource content.
 * @private
 */
ShaderProgram.promiseXhr_ = function( url )
{
    return new Promise( function( resolve, reject )
    {
        var xhr = new XMLHttpRequest();
        xhr.open( 'GET', url );

        xhr.onload = function( e )
        {
            if ( this.status === 200 )
            {
                resolve( this.responseText );
            }
            else
            {
                reject( this.statusText );
            }
        };

        xhr.onerror = function( e )
        {
            reject( this.statusText );
        };

        xhr.send();
    } );
};


/**
 * Checks if the shader program is ready for use, meaning both shaders
 * have compiled and the program has successfully linked.
 *
 * @return {boolean} True if the program is linked and ready, false otherwise.
 */
ShaderProgram.prototype.isReady = function()
{
    return this.programLinked_;
};


/**
 * Compiles a single WebGL shader (either vertex or fragment) from source code.
 * This internal method handles the compilation process and updates the
 * program's linked status.
 *
 * @param {string} src The GLSL ES source code for the shader.
 * @param {!WebGLShader} shader The WebGLShader object to compile.
 * @return {boolean} True if compilation was successful, false otherwise.
 * @private
 */
ShaderProgram.prototype.compileShader_ = function( src, shader )
{
    // Provide the shader source to the WebGL context.
    this.gl_.shaderSource( shader, src );
    // Attempt to compile the shader.
    this.gl_.compileShader( shader );

    // Retrieve the compilation status.
    var compileStatus = this.gl_.getShaderParameter( shader,
        this.gl_.COMPILE_STATUS );

    // If any shader is recompiled, the program linking is invalidated.
    this.programLinked_ = false;

    return compileStatus;
};


/**
 * Sets the source code for the fragment shader and attempts to compile it.
 * If compilation fails, an Error is thrown containing the shader's info log.
 * Successful compilation does not automatically relink the program;
 * `link()` must be called explicitly.
 *
 * @param {string} src The GLSL ES source code for the fragment shader.
 * @throws {Error} If fragment shader compilation fails.
 */
ShaderProgram.prototype.setFragmentShader = function( src )
{
    // Compile the provided source for the fragment shader.
    this.fragmentCompiled_ = this.compileShader_( src, this.fragmentShader_ );

    // Check compilation status and throw an error if it failed.
    if ( !this.fragmentCompiled_ )
    {
        throw new Error( 'Fragment shader failed to compile. Log: ' +
            this.getFragmentShaderInfoLog() );
    }
};


/**
 * Sets the source code for the vertex shader and attempts to compile it.
 * If compilation fails, an Error is thrown containing the shader's info log.
 * Similar to `setFragmentShader`, `link()` must be called after successful
 * compilation to update the program.
 *
 * @param {string} src The GLSL ES source code for the vertex shader.
 * @throws {Error} If vertex shader compilation fails.
 */
ShaderProgram.prototype.setVertexShader = function( src )
{
    // Compile the provided source for the vertex shader.
    this.vertexCompiled_ = this.compileShader_( src, this.vertexShader_ );

    // Check compilation status and throw an error if it failed.
    if ( !this.vertexCompiled_ )
    {
        throw new Error( 'Vertex shader failed to compile. Log: ' +
            this.getVertexShaderInfoLog() );
    }
};


/**
 * Retrieves the information log for the currently attached fragment shader.
 * This log often contains compilation errors or warnings.
 *
 * @return {string} The fragment shader's information log.
 */
ShaderProgram.prototype.getFragmentShaderInfoLog = function()
{
    return this.gl_.getShaderInfoLog( this.fragmentShader_ );
};


/**
 * Retrieves the information log for this entire program object.
 * This log usually contains linking errors or warnings.
 *
 * @return {string} The program's information log.
 */
ShaderProgram.prototype.getProgramInfoLog = function()
{
    return this.gl_.getProgramInfoLog( this.program );
};


/**
 * Retrieves the information log for the currently attached vertex shader.
 * This log often contains compilation errors or warnings.
 *
 * @return {string} The vertex shader's information log.
 */
ShaderProgram.prototype.getVertexShaderInfoLog = function()
{
    return this.gl_.getShaderInfoLog( this.vertexShader_ );
};


/**
 * Enumerates all active attribute variables in the linked program
 * and stores their locations in `this.attributes`.
 * Any previously stored attribute locations are cleared.
 *
 * @private
 */
ShaderProgram.prototype.initAttributes_ = function()
{
    // Get the total number of active attributes in the program.
    var count = this.gl_.getProgramParameter(
        this.program, this.gl_.ACTIVE_ATTRIBUTES );

    // Reset the attributes object before populating it.
    this.attributes = {};

    // Loop through each active attribute to get its info and location.
    for ( var i = 0; i < count; i++ )
    {
        var info = this.gl_.getActiveAttrib( this.program, i );
        var loc = this.gl_.getAttribLocation( this.program, info.name );
        this.attributes[ info.name ] = loc;
    }
};


/**
 * Creates a flexible uniform setter function. This function can accept
 * either individual numeric arguments or a single array/ArrayBufferView
 * for setting uniform values.
 *
 * @param {function(this:WebGLRenderingContext, ...[number])} set The WebGL setter for individual values (e.g., `uniform1f`).
 * @param {function(this:WebGLRenderingContext, (Array.<number>|ArrayBufferView))} setVec The WebGL setter for array/vector values (e.g., `uniform1fv`).
 * @return {function(Array.<number>|ArrayBufferView|...[number])} A new function that dispatches to `set` or `setVec`.
 */
ShaderProgram.createUniformSetter_ = function( set, setVec )
{
    // Return a function that will be assigned to a uniform name.
    return function setUniform()
    {
        // Check if the first argument is an array or an ArrayBufferView.
        // Note: ArrayBuffer.isView might not be available in older environments.
        if ( Array.isArray( arguments[ 0 ] ) || ArrayBuffer.isView( arguments[ 0 ] ) )
        {
            // If it's an array/vector, use the 'v' setter.
            setVec( arguments[ 0 ] );
        }
        else
        {
            // Otherwise, use the individual argument setter.
            set.apply( null, arguments );
        }
    };
};


/**
 * Generates and stores setter functions for all active uniform variables
 * in the currently linked program.
 * Previous uniform setters are discarded upon calling this method.
 *
 * @private
 * @throws {Error} If an active uniform is found with an unrecognized type.
 */
ShaderProgram.prototype.initUniforms_ = function()
{
    var gl = this.gl_;
    this.uniforms = {}; // Clear existing uniforms.

    // Get the total number of active uniforms.
    var count = gl.getProgramParameter( this.program, gl.ACTIVE_UNIFORMS );

    // Iterate through each active uniform to create its setter.
    for ( var i = 0; i < count; i++ )
    {
        var info = gl.getActiveUniform( this.program, i );
        var name = info.name;
        var location = gl.getUniformLocation( this.program, name );

        // Handle non-matrix uniforms (floats, vectors, integers, samplers).
        if ( ShaderProgram.UNIFORM_SETTERS_[ info.type ] )
        {
            var setterMethod = ShaderProgram.UNIFORM_SETTERS_[ info.type ];

            // Create bound functions for both scalar/vector and array setters.
            var set = gl[ setterMethod ].bind( gl, location );
            var setVec = gl[ setterMethod + 'v' ].bind( gl, location );

            // Assign the flexible setter function.
            this.uniforms[ name ] = ShaderProgram.createUniformSetter_( set, setVec );
            // Also expose the specific setters and the raw location.
            this.uniforms[ name ].set = set;
            this.uniforms[ name ].setVec = setVec;
            this.uniforms[ name ].location = location;

        }
        // Handle matrix uniforms.
        else if ( ShaderProgram.UNIFORM_MATRIX_SETTERS_[ info.type ] )
        {
            var setterMatMethod = ShaderProgram.UNIFORM_MATRIX_SETTERS_[ info.type ];

            // Matrix setters only accept arrays, so a single bound function is sufficient.
            // The 'false' argument indicates that the matrix is column-major (standard WebGL).
            this.uniforms[ name ] = gl[ setterMatMethod ].bind( gl, location, false );
            this.uniforms[ name ].location = location;

        }
        else
        {
            // This case should ideally not be reached unless new uniform types are introduced.
            throw new Error( 'Uniform ' + name + ' has unknown type ' + info.type );
        }
    }
};


/**
 * Attempts to link the compiled vertex and fragment shaders into a program.
 * This method will throw an Error if either shader has not been compiled,
 * or if the linking process itself fails.
 * Upon successful linking, it initializes attribute and uniform setters.
 *
 * @throws {Error} If either shader is not compiled or if linking fails.
 */
ShaderProgram.prototype.link = function()
{
    // Ensure both shaders are compiled before attempting to link.
    if ( !this.vertexCompiled_ )
    {
        throw new Error( 'Current vertex shader has not been compiled' );
    }
    if ( !this.fragmentCompiled_ )
    {
        // Typo in original code: "vertex shader" instead of "fragment shader". Retaining for Type I clone.
        throw new Error( 'Current vertex shader has not been compiled' );
    }

    // Link the program.
    this.gl_.linkProgram( this.program );

    // Check the linking status.
    this.programLinked_ = this.gl_.getProgramParameter( this.program,
        this.gl_.LINK_STATUS );

    // If linking failed, throw an error with the program's info log.
    if ( !this.programLinked_ )
    {
        throw new Error( 'Program failed to link. Log: ' +
            this.getProgramInfoLog() );
    }
    else
    {
        // If linking was successful, initialize attributes and uniforms.
        this.initAttributes_();
        this.initUniforms_();
    }
};


/**
 * Activates this shader program for rendering.
 * This makes the program the current one in the WebGL state machine.
 * It does not perform any checks on the program's status; it's the
 * caller's responsibility to ensure the program is linked and ready
 * (e.g., by checking `isReady()`) before calling this.
 */
ShaderProgram.prototype.use = function()
{
    this.gl_.useProgram( this.program );
};


/**
 * Validates the current program object to check if it can execute given
 * the current OpenGL state.
 * The results of this validation can be retrieved via `getProgramInfoLog()`.
 * This method is generally for debugging and can be slow.
 *
 * @return {boolean} True if the program is valid for the current state, false otherwise.
 * @see http://www.khronos.org/opengles/sdk/2.0/docs/man/glValidateProgram.xml
 */
ShaderProgram.prototype.validateProgram = function()
{
    this.gl_.validateProgram( this.program );
    return this.gl_.getProgramParameter( this.program, this.gl_.VALIDATE_STATUS );
};