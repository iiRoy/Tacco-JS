/*
 * @file mosync.resource.js - Resource Management Module
 * @author Ali Sarrafi - Original Author
 *
 * This JavaScript library facilitates the loading of image resources
 * for use within a MoSync application environment.
 * It is primarily designed to handle image assets and is intended to be
 * used in conjunction with the NativeUI library for display purposes.
 *
 * This file contains core functionalities related to image resource handling
 * and communication with the underlying native bridge.
 */


/**
 * The primary resource management submodule within the MoSync bridge.
 * All resource-related functionalities are encapsulated here.
 */
mosync.resource = {};


/**
 * A central hash table (object) storing all registered callback functions
 * that are associated with loadImage operations.
 * Each entry maps an imageID to its corresponding success callback.
 */
mosync.resource.imageCallBackTable = {};

/*
 * This table maps C++ image handles to their JavaScript image IDs.
 * Used during the remote image download process to resolve IDs.
 */
mosync.resource.imageIDTable = {};

/*
 * A queue for managing remote image downloads.
 * Ensures that remote images are downloaded sequentially.
 */
mosync.resource.imageDownloadQueue = [];


/**
 * Initiates the loading of an image resource from a local path
 * into a MoSync UI system.
 *
 * @param  {string} imagePath          The relative path to the image file
 *                                     within the application's resource bundle.
 * @param  {string} imageID            A unique, custom identifier
 *                                     for this image in JavaScript.
 * @param  {function} successCallback  A function to be invoked once the image
 *                                     has been successfully loaded and is ready.
 *                                     It receives (imageID, imageHandle) as arguments.
 */
mosync.resource.loadImage = function ( imagePath, imageID, successCallback )
{
	// Store the callback function, indexed by the image's ID.
	mosync.resource.imageCallBackTable [ imageID ] = successCallback;

	// Send a message to the native bridge to initiate the image load operation.
	mosync.bridge.send (
		[
			"Resource" ,
			"loadImage" ,
			imagePath ,
			imageID
		],
		null
	) ;
} ;


/**
 * Callback function invoked by the C++ native layer
 * to signal that an image has been successfully loaded.
 * It provides the JavaScript ID and the native handle for the loaded image.
 *
 * @param  {string} imageID      The JavaScript ID that was assigned to the image.
 * @param  {number} imageHandle  The C++ native handle for the loaded image,
 *                               which can be used for subsequent operations.
 */
mosync.resource.imageLoaded = function ( imageID, imageHandle )
{
	// Retrieve the associated callback function using the imageID.
	var callbackFun = mosync.resource.imageCallBackTable [ imageID ] ;

	// Check if a callback was registered for this image.
	if ( undefined != callbackFun )
	{
		// Prepare arguments for the callback function.
		var args = Array . prototype . slice . call ( arguments ) ;

		// Execute the registered callback function with the provided arguments.
		callbackFun . apply ( null , args ) ;
	}
} ;


/**
 * Loads an image from a remote URL into an image handle,
 * making it available for use in MoSync UI systems.
 * This process is asynchronous and uses a queue for sequential downloads.
 *
 * @param  {string} imageURL          The full URL to the remote image file.
 * @param  {string} imageID           A custom identifier for this image
 *                                    within the JavaScript context.
 * @param  {function} callBackFunction  A function that will be executed
 *                                      when the remote image is fully downloaded
 *                                      and ready for use.
 */
mosync.resource.loadRemoteImage = function ( imageURL , imageID , callBackFunction )
{
	// Save the callback function for later invocation.
	mosync.resource.imageCallBackTable [ imageID ] = callBackFunction ;

	// Construct the message payload for the native bridge.
	var message =
	[
		"Resource",
		"loadRemoteImage",
		imageURL,
		imageID
	] ;

	// Add the newly created message to the download queue.
	mosync.resource.imageDownloadQueue . push ( message ) ;

	// If this is the only item in the queue, start the download immediately.
	if ( 1 == mosync.resource.imageDownloadQueue . length )
	{
		mosync.bridge.send ( message , null ) ;
	}
} ;


/**
 * Notifies JavaScript that a remote image download has started.
 * This is called by the native bridge when the download process begins.
 *
 * @param  {string} imageID     The JavaScript identifier for the image.
 * @param  {number} imageHandle The native handle assigned to the image.
 */
mosync.resource.imageDownloadStarted = function ( imageID , imageHandle )
{
	// Store the mapping between the native handle and the JavaScript ID.
	mosync.resource.imageIDTable [ imageHandle ] = imageID ;
} ;


/**
 * Signals that a remote image download has completed.
 * This function is invoked by the native bridge upon successful download.
 * It also manages the download queue, sending the next item if available.
 *
 * @param  {number} imageHandle The native handle of the downloaded image.
 */
mosync.resource.imageDownloadFinished = function ( imageHandle )
{
	// Retrieve the JavaScript ID using the native image handle.
	var imageID = mosync.resource.imageIDTable [ imageHandle ] ;

	// Get the corresponding callback function.
	var callbackFun = mosync.resource.imageCallBackTable [ imageID ] ;

	// If a callback was provided, execute it.
	if ( undefined != callbackFun )
	{
		// Call the registered function with the image ID and handle.
		callbackFun ( imageID , imageHandle ) ;
	}

	// Remove the first message (the one that just finished) from the queue.
	if ( mosync.resource.imageDownloadQueue . length > 0 )
	{
		mosync.resource.imageDownloadQueue . shift ( ) ;
	}

	// If there are more items waiting in the download queue,
	// send the next message to the native bridge to start its download.
	if ( mosync.resource.imageDownloadQueue . length > 0 )
	{
		mosync.bridge.send (
			mosync.resource.imageDownloadQueue [ 0 ] ,
			null
		) ;
	}
} ;