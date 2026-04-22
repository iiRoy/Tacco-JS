'use strict'; // Enforce modern JavaScript best practices for cleaner, safer code execution.

/**
 * @module visualContentManager
 * @description
 * This core Angular module is dedicated to managing all aspects of visual content within the application,
 * including uploads, asset tracking, and user interface interactions related to media files.
 * It depends on 'angularFileUpload' for handling file transfer capabilities.
 */
var visualContentManager = angular.module('visualContentManager', ['angularFileUpload']);

/**
 * @controller jQueryBasedMediaUploader
 * @description
 * Manages the upload of media assets using the jQuery File Upload plugin, specifically configured
 * for direct, unsigned uploads to Cloudinary. It handles progress tracking, status updates,
 * and integration with the application's global state.
 *
 * @param {object} dataContext - The controller's local scope (`$scope`) for data binding and event handling.
 * @param {object} globalAppState - The application's root scope (`$rootScope`) for shared state.
 * @param {object} urlPathInfo - Parameters extracted from the current URL route (`$routeParams`).
 * @param {object} browserNavigation - Service for interacting with the browser's URL (`$location`).
 */
visualContentManager.controller('jQueryBasedMediaUploader', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  function(dataContext, globalAppState, urlPathInfo, browserNavigation) {
    // An object to store detailed information for each file currently in the upload pipeline.
    dataContext.pendingUploads = {};
    // A string representing the current high-level status of the upload operation.
    dataContext.operationStatus = 'Ready to begin.';
    // A numerical value (0-100) indicating the combined progress of all active uploads.
    dataContext.aggregateProgress = 0;
    // Holds the result data from the most recently completed upload.
    dataContext.uploadResultData = null;
    // User-provided text description for the uploaded asset.
    dataContext.assetDescription = '';

    /**
     * Resets all relevant upload state variables on the dataContext to their initial values.
     * This ensures a clean slate before a new set of upload operations commences.
     */
    const clearUploadProcessState = function() {
        dataContext.pendingUploads = {};
        dataContext.operationStatus = 'Awaiting file selection...';
        dataContext.aggregateProgress = 0;
        dataContext.uploadResultData = null;
        // The assetDescription might persist if it's meant for the next upload too, or cleared.
        // For now, let's keep it until explicitly changed by the user.
    };

    // Initialize the controller's state upon loading.
    clearUploadProcessState();

    /**
     * Updates the custom context data that will be sent with the Cloudinary upload request.
     * This allows attaching application-specific metadata, such as a user-defined caption,
     * to the uploaded asset on Cloudinary.
     */
    dataContext.assignMetadata = function() {
      // It's crucial that the upload widget instance exists before attempting to configure it.
      if (!dataContext.uploadWidgetInstance) {
          console.error("Upload widget not initialized. Cannot assign metadata.");
          dataContext.operationStatus = "Error: Uploader not ready.";
          return;
      }

      // Retrieve the current formData options from the jQuery File Upload widget.
      // This ensures we don't overwrite other existing parameters.
      let currentUploadConfiguration = dataContext.uploadWidgetInstance.fileupload('option', 'formData');
      // If formData hasn't been set yet, initialize it as an empty object.
      currentUploadConfiguration = currentUploadConfiguration || {};
      
      // Construct the 'context' string for Cloudinary. The key 'photo' is used here
      // to match a convention, but could be 'caption' or any other custom key.
      const contextValue = dataContext.assetDescription && dataContext.assetDescription.trim() !== '' 
                           ? dataContext.assetDescription.trim() 
                           : 'unspecified_caption';
      currentUploadConfiguration["context"] = "photo=" + contextValue;
      
      // Apply the updated formData back to the widget's options.
      dataContext.uploadWidgetInstance.fileupload('option', 'formData', currentUploadConfiguration);
      console.info('Cloudinary upload context metadata updated:', currentUploadConfiguration["context"]);
      dataContext.operationStatus = `Metadata set: '${contextValue}'`;
    };

    // Standard options for Cloudinary unsigned uploads. These can be extended.
    const cloudinaryUploadSetup = {
        tags: ['web_app_upload', 'user_generated_content'], // More explicit tagging
        // Additional custom context for tracking origin or user.
        context: { app_origin: 'angular_jquery_uploader', uploader_id: globalAppState.activeUser ? globalAppState.activeUser.profileId : 'guest' },
        // Client-side image processing settings can be uncommented and configured here:
        // disableImageResize: false,
        // imageMaxWidth: 1600,
        // imageMaxHeight: 1200,
        // acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|svg|webp)$/i, // Added SVG and WEBP
        // maxFileSize: 30000000, // 30MB file size limit
        dropZone: "#media_drop_area_jquery", // Custom ID for the drop zone element
        autoUpload: true // Automatically start upload after file selection
    };

    // Attempt to retrieve Cloudinary configuration. Critical for uploads.
    const cloudServiceConfig = $.cloudinary.config();
    if (!cloudServiceConfig || !cloudServiceConfig.upload_preset) {
        console.error("Critical Cloudinary configuration (upload_preset) is missing. Upload functionality is disabled.");
        dataContext.operationStatus = "Configuration Error: Cloudinary setup incomplete. Please check console.";
        return; // Halt controller execution if Cloudinary isn't configured.
    }

    // Initialize the jQuery File Upload widget, binding it to a specific input element.
    dataContext.uploadWidgetInstance = $(".cloudinary_file_input_element") // Target a distinct input class
      .unsigned_cloudinary_upload(cloudServiceConfig.upload_preset, cloudinaryUploadSetup, {
          // jQuery File Upload callback for when an upload starts.
          start: function(eventTrigger, transferData) {
            dataContext.operationStatus = "Beginning asset transfer...";
            clearUploadProcessState(); // Reset state for a fresh upload session.
            dataContext.$apply(); // Trigger Angular digest cycle to update UI.
          },
          // jQuery File Upload callback for when an upload fails.
          fail: function(eventTrigger, transferData) {
            const failedAssetName = transferData.files[0] ? transferData.files[0].name : 'Unknown File';
            console.error(`Upload failure for ${failedAssetName}:`, transferData.errorThrown, transferData.textStatus);
            dataContext.operationStatus = `Transfer failed for ${failedAssetName}: ${transferData.errorThrown || transferData.textStatus || "Unknown error."}`;
            // Store detailed error information for the specific file.
            dataContext.pendingUploads[failedAssetName] = {
                progress: 0,
                detailedMessage: dataContext.operationStatus,
                errorDetails: transferData.errorThrown || transferData.textStatus
            };
            dataContext.$apply();
          }
      })
      // Cloudinary-specific event handler for individual file progress updates.
      .on("cloudinaryprogress", function(eventTrigger, transferData) {
        const currentAssetName = transferData.files[0].name;
        let assetEntry = dataContext.pendingUploads[currentAssetName] || {};
        assetEntry.progress = Math.round((transferData.loaded * 100.0) / transferData.total);
        assetEntry.detailedMessage = `Uploading: ${assetEntry.progress}%`;
        dataContext.pendingUploads[currentAssetName] = assetEntry;
        dataContext.$apply();
      })
      // Cloudinary-specific event handler for overall progress across all files.
      .on("cloudinaryprogressall", function(eventTrigger, transferData) {
        dataContext.aggregateProgress = Math.round((transferData.loaded * 100.0) / transferData.total);
        dataContext.operationStatus = `Overall progress: ${dataContext.aggregateProgress}%`;
        dataContext.$apply();
      })
      // Cloudinary-specific event handler when an upload completes successfully.
      .on("cloudinarydone", function(eventTrigger, transferData) {
        // Initialize the global collection if it doesn't exist yet.
        globalAppState.uploadedAssetsCollection = globalAppState.uploadedAssetsCollection || [];
        
        // Enhance the Cloudinary result with custom application-specific context.
        transferData.result.customAppMetadata = { 
            caption: dataContext.assetDescription || 'no_user_caption',
            uploadedBy: globalAppState.activeUser ? globalAppState.activeUser.username : 'anonymous_user'
        };
        
        dataContext.uploadResultData = transferData.result; // Store the final result for the UI.
        const completedAssetName = transferData.files[0].name;
        let completedAssetEntry = dataContext.pendingUploads[completedAssetName] || {};
        completedAssetEntry.originalFileName = completedAssetName;
        completedAssetEntry.cloudinaryResponse = transferData.result;
        completedAssetEntry.detailedMessage = "Upload completed successfully!";
        completedAssetEntry.progress = 100; // Ensure progress is 100% on success.
        dataContext.pendingUploads[completedAssetName] = completedAssetEntry;

        globalAppState.uploadedAssetsCollection.push(transferData.result);
        dataContext.operationStatus = `Successfully uploaded: ${completedAssetName}`;
        dataContext.$apply();
      });
  }
]).controller('angularBasedMediaUploader', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  '$upload',
  /**
   * @controller angularBasedMediaUploader
   * @description
   * Manages media asset uploads using the Angular File Upload library, directly interacting
   * with the Cloudinary API. This controller provides more granular control over individual
   * file uploads and robust client-side validations.
   *
   * @param {object} vm - The ViewModel scope for this controller (`$scope`).
   * @param {object} appGlobalState - The application's root scope (`$rootScope`).
   * @param {object} routerParameters - Route parameters from the URL (`$routeParams`).
   * @param {object} pathNavigator - Service for managing browser location (`$location`).
   * @param {object} fileTransferSvc - The Angular File Upload service (`$upload`).
   */
  function(vm, appGlobalState, routerParameters, pathNavigator, fileTransferSvc) {
    // Base URL for Cloudinary's upload API.
    const CLOUDINARY_UPLOAD_ENDPOINT = "https://api.cloudinary.com/v1_1/";
    // Maximum allowed file size for uploads (e.g., 20 MB).
    const MAXIMUM_FILE_SIZE_BYTES = 20 * 1024 * 1024; 

    vm.activeUploads = []; // Array to track individual upload objects and their states.
    vm.globalUploadStateMessage = 'Ready for file input.'; // General status message for the UI.
    vm.isAnyTransferActive = false; // Flag to indicate if any upload process is currently running.
    vm.assetCaptionInput = ''; // User input for the asset's caption.

    /**
     * Internal helper function to consistently update the status and progress of a file item.
     * Ensures the Angular digest cycle is run if needed to reflect changes in the UI.
     *
     * @param {object} fileEntry - The individual file object being tracked.
     * @param {number} currentProgress - The calculated progress percentage (0-100).
     * @param {string} statusDescription - A descriptive status message for the file.
     */
    const updateFileStatusDisplay = function(fileEntry, currentProgress, statusDescription) {
        fileEntry.progressPercentage = currentProgress;
        fileEntry.displayStatus = statusDescription;
        if(!vm.$$phase) { // Check if a digest cycle is already in progress.
            vm.$apply(); // Manually trigger a digest cycle if not.
        }
    };

    /**
     * Initiates the upload process for a given array of files. This function performs
     * client-side validation and then dispatches each file to Cloudinary.
     *
     * @param {Array<File>} selectedFilesList - An array of File objects obtained from an input.
     */
    vm.initiateAssetUploads = function(selectedFilesList) {
      if (!selectedFilesList || selectedFilesList.length === 0) {
        vm.globalUploadStateMessage = 'No files were provided for upload.';
        return;
      }

      vm.isAnyTransferActive = true;
      vm.globalUploadStateMessage = 'Preparing files for transfer...';
      vm.activeUploads = []; // Clear previous uploads to start fresh.

      const cloudConfiguration = $.cloudinary.config();
      if (!cloudConfiguration || !cloudConfiguration.cloud_name || !cloudConfiguration.upload_preset) {
          console.error("Cloudinary configuration (cloud_name or upload_preset) is missing. Cannot proceed with uploads.");
          vm.globalUploadStateMessage = "Error: Cloudinary service not configured.";
          vm.isAnyTransferActive = false;
          return;
      }

      selectedFilesList.forEach(function(individualAssetFile) {
        // Pre-upload validation: Check file size.
        if (individualAssetFile.size > MAXIMUM_FILE_SIZE_BYTES) {
            individualAssetFile.displayStatus = `Error: File size (${(individualAssetFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds ${MAXIMUM_FILE_SIZE_BYTES / (1024 * 1024)}MB limit.`;
            individualAssetFile.progressPercentage = 0;
            vm.activeUploads.push(individualAssetFile); // Add to list to show the error.
            console.warn(`File "${individualAssetFile.name}" skipped due to size.`);
            return; // Skip this file and proceed to the next.
        }

        // Prepare the payload data for Cloudinary's upload API.
        const uploadRequestData = {
          upload_preset: cloudConfiguration.upload_preset,
          tags: 'ng_app_uploads, media_library', // Updated and more specific tags.
          // Custom context, using the user's caption or the original file name as fallback.
          context: 'user_caption=' + (vm.assetCaptionInput || individualAssetFile.name) 
        };

        // Create an upload task using the Angular File Upload service.
        const uploadTask = fileTransferSvc.upload({
          url: CLOUDINARY_UPLOAD_ENDPOINT + cloudConfiguration.cloud_name + "/upload",
          data: uploadRequestData,
          file: individualAssetFile // The actual File object to be uploaded.
        });

        vm.activeUploads.push(individualAssetFile); // Add the file to our tracking list.
        individualAssetFile.displayStatus = 'Queued for transfer...';
        individualAssetFile.progressPercentage = 0;

        // Attach progress event handler.
        uploadTask.progress(function (progressEvent) {
          const calculatedProgress = Math.round((progressEvent.loaded * 100.0) / progressEvent.total);
          updateFileStatusDisplay(individualAssetFile, calculatedProgress, `Uploading: ${calculatedProgress}%`);
          // Update overall state based on count of active uploads.
          vm.globalUploadStateMessage = `Uploading ${vm.activeUploads.filter(f => f.displayStatus.startsWith('Uploading')).length} of ${vm.activeUploads.length} assets.`;
        }).success(function (apiResponseData, httpStatusCode, httpHeaders, requestConfiguration) {
          appGlobalState.uploadedAssetsCollection = appGlobalState.uploadedAssetsCollection || [];
          
          // Attach additional custom metadata to the Cloudinary response for application use.
          apiResponseData.appMetadata = {
              userProvidedCaption: vm.assetCaptionInput || individualAssetFile.name,
              originalFileName: individualAssetFile.name,
              uploadTimestamp: new Date().toISOString()
          };
          individualAssetFile.uploadResponse = apiResponseData; // Store full response with the file.
          individualAssetFile.displayStatus = "Transfer successful!";
          individualAssetFile.progressPercentage = 100;
          appGlobalState.uploadedAssetsCollection.push(apiResponseData);

          // Check if all uploads have completed (success or failure).
          const allTasksFinished = vm.activeUploads.every(f => 
            f.displayStatus === "Transfer successful!" || f.displayStatus.startsWith("Error:")
          );
          if (allTasksFinished) {
              vm.isAnyTransferActive = false;
              vm.globalUploadStateMessage = 'All asset transfers completed.';
          }
          if(!vm.$$phase) {
            vm.$apply();
          }
        }).error(function(errorResponseData, httpStatusCode, httpHeaders, requestConfiguration) {
            individualAssetFile.displayStatus = `Transfer failed: HTTP ${httpStatusCode}.`;
            individualAssetFile.progressPercentage = 0;
            console.error(`Upload error for "${individualAssetFile.name}":`, errorResponseData);
            vm.globalUploadStateMessage = 'Some asset transfers encountered errors.';
            vm.isAnyTransferActive = false; // Consider overall transfer inactive on first error.
            if(!vm.$$phase) {
                vm.$apply();
            }
        });
      });
    };

    // Instead of watching a generic 'files' array, we watch a specific property
    // that would be bound to an <input type="file" ng-model="selectedFileInputs">
    // This provides a more explicit trigger for the upload process.
    vm.$watch('selectedFileInputs', function(newlySelectedFiles) {
        if (newlySelectedFiles && newlySelectedFiles.length > 0) {
            vm.initiateAssetUploads(newlySelectedFiles);
            // Optionally clear the input model after processing to allow re-selection of the same files.
            vm.selectedFileInputs = null; 
        }
    });

    /**
     * Provides a CSS class string for a drag-and-drop zone, offering visual feedback
     * when files are being dragged over it.
     *
     * @param {Event} dragEvent - The original drag event object.
     * @returns {string} A CSS class name: 'dropzone-active' if files are being dragged,
     *                   'dropzone-error' if non-file content is dragged, or an empty string.
     */
    vm.getDropZoneStyle = function(dragEvent) {
      // Guard clause for invalid event or missing dataTransfer object.
      if (!dragEvent || !dragEvent.dataTransfer || !dragEvent.dataTransfer.items) {
        return ''; 
      }

      const draggedItems = dragEvent.dataTransfer.items;
      let containsDroppableFile = false;

      // Iterate through the dragged items to determine if any are files.
      // This is a more precise check than just checking for `items.length`.
      for (let i = 0; i < draggedItems.length; i++) {
        if (draggedItems[i].kind === 'file') {
          containsDroppableFile = true;
          break; // Found a file, no need to check further.
        }
      }
      
      // Return appropriate CSS class based on content.
      return containsDroppableFile ? "dropzone-active" : "dropzone-error-content";
    };
  }
]);