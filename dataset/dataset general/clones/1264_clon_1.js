THREE.MirrorRenderer = function ( renderer, camera, scene, options ) {
    
    // Call the Object3D constructor to inherit its properties and methods.
    // This makes MirrorRenderer behave like a Three.js object, allowing it to be part of a scene graph.
    THREE.Object3D.call( this );
    
    // Assign a unique name to this mirror instance for identification and debugging.
    this.name = 'mirror_' + this.id;

    /*
     * Helper function to provide default values for optional parameters.
     * If the 'value' is strictly undefined, 'defaultValue' is returned;
     * otherwise, the provided 'value' is used.
     */
    function optionalParameter ( value, defaultValue ) {
        return value !== undefined ? value : defaultValue;
    } // End of optionalParameter helper function definition.

    // Ensure the options object is initialized. If no options are provided, default to an empty object.
    options = options || {};
    
    // Flag to indicate that the mirror's internal matrices (especially the texture matrix) need to be re-calculated.
    this.matrixNeedsUpdate = true;
    
    // Retrieve texture dimensions from the options, or use default values (512x512 pixels).
    var width = optionalParameter( options.textureWidth, 512 );
    var height = optionalParameter( options.textureHeight, 512 );
    
    // Set the clip bias, a small offset applied to the clipping plane to prevent z-fighting or artifacts.
    this.clipBias = optionalParameter( options.clipBias, 0.0 );
    
    // Store references to the main WebGLRenderer and the scene this mirror will reflect.
    this.renderer = renderer;
    this.scene = scene;
    
    // Initialize various Three.js mathematical objects that will be used for reflection calculations.
    this.mirrorPlane = new THREE.Plane();           // Represents the geometric plane of the mirror's surface.
    this.normal = new THREE.Vector3( 0, 0, 1 );     // The normal vector pointing outwards from the mirror's surface.
    this.cameraWorldPosition = new THREE.Vector3(); // Stores the global position of the primary camera.
    this.rotationMatrix = new THREE.Matrix4();      // A matrix used to extract and apply rotations.
    this.lookAtPosition = new THREE.Vector3( 0, 0, -1 ); // A target vector for the mirror camera to look towards.
    this.clipPlane = new THREE.Vector4();          // Stores the final clipping plane parameters for the shader.
    
    // Check if the provided camera is a THREE.PerspectiveCamera.
    // The reflection logic relies on perspective projection properties.
    if ( camera instanceof THREE.PerspectiveCamera ) {
        this.camera = camera; // Use the application's primary perspective camera.
    }
    else {
        // If an incompatible camera type is provided, create a default PerspectiveCamera and log a warning.
        this.camera = new THREE.PerspectiveCamera();
        console.log( this.name + ': camera is not a Perspective Camera!' );
    }

    // Initialize the texture matrix, which maps world coordinates to UV coordinates on the reflection texture.
    this.textureMatrix = new THREE.Matrix4();

    // Create a clone of the main camera. This 'mirrorCamera' will be positioned and oriented
    // to render the reflected view.
    this.mirrorCamera = this.camera.clone();
    
    // Initialize a generic Object3D instance to represent the mirror's visual mesh within the scene.
    this.mesh = new THREE.Object3D();
    
    // Create two WebGL render targets:
    // - `texture`: The primary render target where the final reflection image is drawn.
    // - `tempTexture`: A temporary render target used for multi-mirror reflections or intermediate steps.
    this.texture = new THREE.WebGLRenderTarget( width, height );
    this.tempTexture = new THREE.WebGLRenderTarget( width, height );
    
    // If the texture dimensions are not powers of two, disable mipmap generation.
    // Mipmaps require power-of-two dimensions for proper generation and can cause issues otherwise.
    if ( !THREE.Math.isPowerOfTwo( width ) || !THREE.Math.isPowerOfTwo( height ) ) {
        this.texture.generateMipmaps = false;
        this.tempTexture.generateMipmaps = false;
    }

    // Perform initial setup: update the reflection matrices and render the mirror for the first time.
    this.updateTextureMatrix();
    this.render();
}; // End of THREE.MirrorRenderer constructor.


// Inherit prototype methods from THREE.Object3D.
// This allows MirrorRenderer instances to leverage Object3D's transformation and hierarchy features.
THREE.MirrorRenderer.prototype = Object.create( THREE.Object3D.prototype );


/*
 * Defines a method to render this mirror in conjunction with another mirror.
 * This is useful for scenarios where one mirror reflects another, requiring a specific rendering order.
 *
 * @param {THREE.MirrorRenderer} otherMirror - The other mirror instance to interact with.
 */
THREE.MirrorRenderer.prototype.renderWithMirror = function ( otherMirror ) {

    // First, update the texture matrix for the *current* mirror.
    // This ensures its reflection calculations are based on the latest scene state.
    this.updateTextureMatrix();
    
    // Mark the current mirror's matrix as updated, preventing redundant updates during this cycle.
    this.matrixNeedsUpdate = false;

    // Temporarily store the 'otherMirror's original camera.
    var tempCamera = otherMirror.camera;
    
    // Set the 'otherMirror's camera to *this* mirror's reflection camera.
    // This makes the 'otherMirror' render from the perspective of what *this* mirror sees.
    otherMirror.camera = this.mirrorCamera;

    // Render the 'otherMirror' into its temporary texture.
    // The 'true' argument ensures it renders to the temporary target.
    otherMirror.render( true );
    
    // Update the 'otherMirror's material to sample from its newly rendered temporary texture.
    otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

    // Now, render the *current* mirror. It will now correctly reflect the 'otherMirror'
    // using the image captured in 'otherMirror.tempTexture'.
    this.render();
    
    // Reset the matrix update flag for the current mirror, allowing it to update normally next frame.
    this.matrixNeedsUpdate = true;

    // Restore the 'otherMirror's material to sample from its main texture.
    otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
    
    // Restore the 'otherMirror's original camera.
    otherMirror.camera = tempCamera;

    // Finally, restore the texture matrix of the 'otherMirror' to its correct, independent state.
    otherMirror.updateTextureMatrix();
    
}; // End of renderWithMirror method.


/*
 * This crucial method calculates and updates all necessary matrices for the mirror reflection.
 * It determines the mirrored camera's position and orientation, constructs the reflection texture matrix,
 * and sets up an oblique projection matrix to correctly clip geometry at the mirror plane.
 */
THREE.MirrorRenderer.prototype.updateTextureMatrix = function ( ) {

    // If this MirrorRenderer instance is a child of another object, assume that parent is the actual mesh
    // representing the mirror's physical surface in the scene.
    if ( this.parent != undefined ) {
        this.mesh = this.parent;
    }

    // A small helper function to determine the sign of a number (1, -1, or 0).
    function sign ( x ) {
        return x ? ( x < 0 ? -1 : 1 ) : 0;
    }

    // Ensure the world matrices for both the mirror object itself and the main camera are up to date.
    this.updateMatrixWorld();
    this.camera.updateMatrixWorld();

    // Store the current world position of the main camera for use in reflection calculations.
    this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

    // Extract the rotation component from the mirror's current world matrix.
    this.rotationMatrix.extractRotation( this.matrixWorld );

    // Calculate the normal vector of the mirror plane.
    // It starts as a Y-up vector (0, 1, 0) and is then rotated by the mirror mesh's local rotation.
    this.normal = ( new THREE.Vector3( 0, 1, 0 ) ).applyEuler( this.mesh.rotation );
    
    // Determine the direction the main camera is currently looking.
    var cameraLookAt = ( new THREE.Vector3( 0, 0, 1 ) ).applyEuler( this.camera.rotation );
    
    // If the main camera is positioned "behind" the mirror (i.e., looking at the back face),
    // reflect the normal to ensure the reflection is calculated correctly from the front side.
    if ( this.normal.dot( cameraLookAt ) < 0 ) {
        var meshNormal = ( new THREE.Vector3( 0, 0, 1 ) ).applyEuler( this.mesh.rotation );
        this.normal.reflect( meshNormal );
    }

    // --- Calculate the reflected camera position (the 'view' point) ---
    // 1. Get the vector from the camera to the mirror's position.
    var view = this.mesh.position.clone().sub( this.cameraWorldPosition );
    
    // 2. Reflect this vector across the mirror's normal and then negate it.
    view.reflect( this.normal ).negate();
    
    // 3. Add the mirror's position back to get the final reflected camera position in world space.
    view.add( this.mesh.position );

    // Extract the rotation component from the main camera's world matrix.
    this.rotationMatrix.extractRotation( this.camera.matrixWorld );

    // --- Calculate the reflected 'lookAt' target for the mirror camera ---
    // 1. Start with a default forward vector (pointing along the negative Z-axis).
    this.lookAtPosition.set( 0, 0, -1 );
    
    // 2. Apply the main camera's rotation to this vector to get its world-space direction.
    this.lookAtPosition.applyMatrix4( this.rotationMatrix );
    
    // 3. Translate the vector to the main camera's actual world position.
    this.lookAtPosition.add( this.cameraWorldPosition );

    // 4. Determine the reflected target point:
    //    Get the vector from the lookAt position to the mirror's position.
    var target = this.mesh.position.clone().sub( this.lookAtPosition );
    
    //    Reflect this target vector across the mirror's normal and negate it.
    target.reflect( this.normal ).negate();
    
    //    Add the mirror's position to get the final reflected target in world space.
    target.add( this.mesh.position );

    // --- Calculate the reflected 'up' vector for the mirror camera ---
    // 1. Start with a default 'up' vector (pointing along the negative Y-axis).
    this.up.set( 0, -1, 0 );
    
    // 2. Apply the main camera's rotation to this vector.
    this.up.applyMatrix4( this.rotationMatrix );
    
    // 3. Reflect and negate the up vector to ensure it's correctly oriented for the reflection.
    this.up.reflect( this.normal ).negate();

    // --- Configure the mirror camera ---
    // Set the mirror camera's position to the calculated reflected view point.
    this.mirrorCamera.position.copy( view );
    
    // Assign the calculated reflected 'up' vector.
    this.mirrorCamera.up = this.up;
    
    // Point the mirror camera towards the calculated reflected target.
    this.mirrorCamera.lookAt( target );
    
    // Ensure the mirror camera's aspect ratio matches the main camera's aspect ratio.
    this.mirrorCamera.aspect = this.camera.aspect;

    // Update the mirror camera's internal projection and world matrices after changing its properties.
    this.mirrorCamera.updateProjectionMatrix();
    this.mirrorCamera.updateMatrixWorld();
    
    // Calculate the inverse of the mirror camera's world matrix, essential for view transformations.
    this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

    // --- Update the texture matrix ---
    // This matrix is used to transform world coordinates into texture coordinates for sampling the reflection.
    this.textureMatrix.set(
        0.5, 0.0, 0.0, 0.5, // First row of the texture matrix.
        0.0, 0.5, 0.0, 0.5, // Second row.
        0.0, 0.0, 0.5, 0.5, // Third row.
        0.0, 0.0, 0.0, 1.0  // Fourth row.
    );
    
    // Multiply the texture matrix by the mirror camera's projection matrix.
    this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
    
    // Then, multiply by the inverse of the mirror camera's world matrix.
    this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

    // --- Adjust the mirror camera's projection matrix with a new clip plane ---
    // This technique (described by Eric Lengyel at Terathon Software) modifies the projection matrix
    // to perform a clip against the mirror plane, preventing geometry behind the mirror from being rendered
    // into the reflection texture. This avoids visual artifacts.
    
    // Set the mirror plane using its normal and a point on the plane (the mirror's position).
    this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mesh.position );
    
    // Transform the mirror plane into the mirror camera's view space.
    this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

    // Convert the mirror plane into a THREE.Vector4 format suitable for clipping calculations.
    this.clipPlane.set(
        this.mirrorPlane.normal.x,
        this.mirrorPlane.normal.y,
        this.mirrorPlane.normal.z,
        this.mirrorPlane.constant
    );

    // Initialize a temporary vector 'q' and get a reference to the mirror camera's projection matrix.
    var q = new THREE.Vector4();
    var projectionMatrix = this.mirrorCamera.projectionMatrix;

    // Calculate the components of the 'q' vector based on the clip plane and current projection matrix.
    q.x = ( sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
    q.y = ( sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
    q.z = -1.0;
    q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

    // Calculate the scaled plane vector 'c'. This vector will replace a row in the projection matrix.
    var c = new THREE.Vector4();
    c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

    // Replace the third row (elements 2, 6, 10, 14) of the projection matrix with the components of 'c'.
    // This modification creates the oblique projection.
    projectionMatrix.elements[ 2 ] = c.x;
    projectionMatrix.elements[ 6 ] = c.y;
    projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias; // Apply the clip bias here.
    projectionMatrix.elements[ 14 ] = c.w;
    
    // Store the main camera's world coordinates in 'this.eye' for potential future use (e.g., shader uniforms).
    var worldCoordinates = new THREE.Vector3();
    worldCoordinates.setFromMatrixPosition( this.camera.matrixWorld );
    this.eye = worldCoordinates;
    
}; // End of updateTextureMatrix method.


/*
 * Renders the scene from the perspective of the mirror camera into a target texture.
 * This method is called to generate the reflection image.
 *
 * @param {boolean} [isTempTexture=false] - If true, the scene is rendered into the temporary texture.
 *                                          Otherwise, it renders into the main reflection texture.
 */
THREE.MirrorRenderer.prototype.render = function ( isTempTexture ) {

    // If the matrixNeedsUpdate flag is set, re-calculate all reflection matrices.
    // This ensures the reflection is up-to-date with any changes in camera or mirror position/orientation.
    if ( this.matrixNeedsUpdate ) {
        this.updateTextureMatrix();
    }

    // After rendering, set the flag back to true. This ensures that the matrices will be
    // updated again in the next frame, unless explicitly overridden (e.g., by renderWithMirror).
    this.matrixNeedsUpdate = true;

    // Only proceed with rendering if a scene is defined and is a valid THREE.Scene instance.
    if ( this.scene !== undefined && this.scene instanceof THREE.Scene ) {
        // Determine which render target to use based on the 'isTempTexture' parameter.
        var renderTexture = ( isTempTexture !== undefined && isTempTexture ) ? this.tempTexture : this.texture;
        
        // Perform the actual rendering operation:
        // - Use the provided main renderer.
        // - Render the associated scene.
        // - Use the specially configured mirrorCamera for the viewpoint.
        // - Render the output into the selected renderTexture.
        // - The 'true' argument indicates that the render target should be cleared before rendering.
        this.renderer.render( this.scene, this.mirrorCamera, renderTexture, true );
    }

}; // End of render method.