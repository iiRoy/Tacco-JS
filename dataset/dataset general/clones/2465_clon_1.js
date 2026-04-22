/*
 * This file contains the implementation of THREE.VRRenderer.
 * It provides functionality for rendering stereoscopic 3D content
 * suitable for Virtual Reality headsets using Three.js.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

"use strict" ;

THREE . VRRenderer = function ( renderer , hmd )
{

    // Store a reference to 'this' for use within nested functions.
    var self = this;


    self . initialize = function ( )
    {

        // Get the eye translation for the left eye from the HMD.
        var et = hmd . getEyeTranslation ( "left" ) ;

        /*
         * Calculate half of the Interpupillary Distance (IPD).
         * This is derived from the length of the eye translation vector.
         */
        self . halfIPD = new THREE . Vector3 ( et . x , et . y , et . z ) . length ( ) ;

        // Retrieve the recommended field of view for the left eye.
        self . fovLeft = hmd . getRecommendedEyeFieldOfView ( "left" ) ;

        // Retrieve the recommended field of view for the right eye.
        self . fovRight = hmd . getRecommendedEyeFieldOfView ( "right" ) ;
    } // End of initialize function.


    self . FovToNDCScaleOffset = function ( fov )
    {
        // Calculate the horizontal scale and offset for Normalized Device Coordinates (NDC).
        var pxscale = 2.0 / ( fov . leftTan + fov . rightTan ) ;
        var pxoffset = ( fov . leftTan - fov . rightTan ) * pxscale * 0.5 ;

        // Calculate the vertical scale and offset for NDC.
        var pyscale = 2.0 / ( fov . upTan + fov . downTan ) ;
        var pyoffset = ( fov . upTan - fov . downTan ) * pyscale * 0.5 ;


        // Return an object containing the calculated scale and offset arrays.
        return {
            scale : [ pxscale , pyscale ] ,
            offset : [ pxoffset , pyoffset ]
        } ;

    } // End of FovToNDCScaleOffset function.


    self . FovPortToProjection = function ( fov , rightHanded /* = true */ , zNear /* = 0.01 */ , zFar /* = 10000.0 */ )
    {

        // Default 'rightHanded' to true if not provided.
        rightHanded = rightHanded === undefined ? true : rightHanded ;

        // Default 'zNear' to 0.01 if not provided.
        zNear = zNear === undefined ? 0.01 : zNear ;

        // Default 'zFar' to 10000.0 if not provided.
        zFar = zFar === undefined ? 10000.0 : zFar ;

        // Determine the handedness scale for projection matrix.
        var handednessScale = rightHanded ? -1.0 : 1.0 ;


        var mobj = new THREE . Matrix4 ( ) ;
        var m = mobj . elements ;

        // Get the scale and offset values from the FOV.
        var scaleAndOffset = self . FovToNDCScaleOffset ( fov ) ;


        // Populate the projection matrix elements.
        m [ 0 * 4 + 0 ] = scaleAndOffset . scale [ 0 ] ;
        m [ 0 * 4 + 1 ] = 0.0 ;
        m [ 0 * 4 + 2 ] = scaleAndOffset . offset [ 0 ] * handednessScale ;
        m [ 0 * 4 + 3 ] = 0.0 ;

        m [ 1 * 4 + 0 ] = 0.0 ;
        m [ 1 * 4 + 1 ] = scaleAndOffset . scale [ 1 ] ;
        m [ 1 * 4 + 2 ] = - scaleAndOffset . offset [ 1 ] * handednessScale ;
        m [ 1 * 4 + 3 ] = 0.0 ;

        m [ 2 * 4 + 0 ] = 0.0 ;
        m [ 2 * 4 + 1 ] = 0.0 ;
        m [ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale ;
        m [ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar ) ;

        m [ 3 * 4 + 0 ] = 0.0 ;
        m [ 3 * 4 + 1 ] = 0.0 ;
        m [ 3 * 4 + 2 ] = handednessScale ;
        m [ 3 * 4 + 3 ] = 0.0 ;

        // Transpose the matrix to get the final projection matrix.
        mobj . transpose ( ) ;

        return mobj ;

    } // End of FovPortToProjection function.


    self . FovToProjection = function ( fov , rightHanded /* = true */ , zNear /* = 0.01 */ , zFar /* = 10000.0 */ )
    {
        // Convert FOV degrees to tangent values for projection calculation.
        var fovPort = {
            upTan : Math . tan ( fov . upDegrees * Math . PI / 180.0 ) ,
            downTan : Math . tan ( fov . downDegrees * Math . PI / 180.0 ) ,
            leftTan : Math . tan ( fov . leftDegrees * Math . PI / 180.0 ) ,
            rightTan : Math . tan ( fov . rightDegrees * Math . PI / 180.0 )
        } ;

        // Use the FovPortToProjection helper to create the actual projection matrix.
        return self . FovPortToProjection ( fovPort , rightHanded , zNear , zFar ) ;

    } // End of FovToProjection function.


    self . render = function ( scene , camera )
    {
        // Create separate cameras for left and right eyes by cloning the main camera.
        var cameraLeft = camera . clone ( ) ;
        var cameraRight = camera . clone ( ) ;

        // Set the projection matrix for the left eye camera based on its FOV.
        cameraLeft . projectionMatrix = self . FovToProjection ( self . fovLeft , true , camera . near , camera . far ) ;

        // Set the projection matrix for the right eye camera based on its FOV.
        cameraRight . projectionMatrix = self . FovToProjection ( self . fovRight , true , camera . near , camera . far ) ;

        // Get the 'right' vector from the camera's orientation.
        var right = new THREE . Vector3 ( 1 , 0 , 0 ) ;
        right . applyQuaternion ( camera . quaternion ) ;

        // Adjust left camera position by subtracting half IPD along the 'right' vector.
        cameraLeft . position . sub ( right . clone ( ) . multiplyScalar ( self . halfIPD ) ) ;

        // Adjust right camera position by adding half IPD along the 'right' vector.
        cameraRight . position . add ( right . clone ( ) . multiplyScalar ( self . halfIPD ) ) ;

        // Enable scissor test for rendering each eye separately.
        renderer . enableScissorTest ( true ) ;

        // Calculate viewport dimensions for each eye.
        var width = renderer . domElement . width / 2 ;
        var height = renderer . domElement . height ;


        // Render the left eye view.
        renderer . setViewport ( 0 , 0 , width , height ) ;
        renderer . setScissor ( 0 , 0 , width , height ) ;
        renderer . render ( scene , cameraLeft ) ;

        // Render the right eye view.
        renderer . setViewport ( width , 0 , width , height ) ;
        renderer . setScissor ( width , 0 , width , height ) ;
        renderer . render ( scene , cameraRight ) ;

    } // End of render function.


    // Initialize the VRRenderer when it is created.
    self . initialize ( ) ;

} // End of THREE.VRRenderer constructor.