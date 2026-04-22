'use strict';

/* Module for managing application-wide media assets */

var mediaManagementModule = angular.module('mediaManagementModule', ['fileUploadService']);

mediaManagementModule.controller('mediaUploadControllerJQuery',
  ['$appScope', '$globalScope', '$routeInfo', '$navigator', /* Processing uploads via jQuery component */
  function($appScope, $globalScope, $routeInfo, $navigator) {

    $appScope.inputFiles = {};

    $appScope.modifyMetadata = function() {
      // Retrieve current form parameters and update the context
      var uploadSettings = $appScope.componentInstance.fileupload('option', 'formData');
      uploadSettings["custom_context"] = "item=" + $appScope.itemTitle;
      $appScope.componentInstance.fileupload('option', 'formData', uploadSettings);
    };

    $appScope.componentInstance = $(".media_upload_input")
      .unsigned_cloud_media_upload($.cloudMedia.configuration().upload_preset_key, {labels: 'my_media_collection', custom_context:'item='}, {
        // Optional client-side image processing and validation settings can be enabled here.
        // Ensure that the 'cloudmedia/processing' script is included.
        // For example:
        // resizeImages: true,
        // imageMaximumWidth: 900,
        // imageMaximumHeight: 700,
        // acceptedFileTypes: /(\.|\/)(jpeg|jpg|png|gif|bmp)$/i,
        // maximumFileSize: 25000000, // 25MB
        dropArea: "#direct_upload_area",
        begin: function(eventSignal) {
          $appScope.currentState = "Initiating transfer...";
          $appScope.inputFiles = {};
          $appScope.$apply();
        },
        failure: function(eventSignal, transferData) {
          $appScope.currentState = "Transfer failed";
          $appScope.$apply();
        }
      })
      .on("cloudmediaprogress", function(eventSignal, transferData) {
        var assetName = transferData.files[0].name;
        var assetItem = $appScope.inputFiles[assetName] || {};
        assetItem.completion = Math.round((transferData.loaded * 100.0) / transferData.total);
        assetItem.state = "Transferring... " + assetItem.completion + "%";
        $appScope.inputFiles[assetName] = assetItem;
        $appScope.$apply();
      })
      .on("cloudmediaprogressall", function(eventSignal, transferData) {
        $appScope.overallCompletion = Math.round((transferData.loaded * 100.0) / transferData.total);
        $appScope.currentState = "Overall transfer... " + $appScope.overallCompletion + "%";
        $appScope.$apply();
      })
      .on("cloudmediacomplete", function(eventSignal, transferData) {
        $globalScope.mediaAssets = $globalScope.mediaAssets || [];
        transferData.outcome.custom_context = {metadata_key: {item: $appScope.itemTitle}};
        $appScope.finalResult = transferData.outcome;
        var assetName = transferData.files[0].name;
        var assetItem = $appScope.inputFiles[assetName] || {};
        assetItem.name = assetName;
        assetItem.outcome = transferData.outcome;
        $appScope.inputFiles[assetName] = assetItem;
        $globalScope.mediaAssets.push(transferData.outcome);
        $appScope.$apply();
      });
  }
]).controller('mediaUploadControllerAngular', ['$appScope', '$globalScope', '$routeInfo', '$navigator', '$uploader', // Uploading files using the Angular service
  function($appScope, $globalScope, $routeInfo, $navigator, $uploader) {

    $appScope.$observe('inputs', function() {
      if (!$appScope.inputs) return;

      $appScope.inputs.forEach(function(item) {
        $appScope.activeUpload = $uploader.transmit({
          targetUrl: "https://api.cloudmedia.com/v2_0/" + $.cloudMedia.configuration().account_id + "/upload",
          payload: {preset_key: $.cloudMedia.configuration().upload_preset_key, labels: 'my_media_collection', metadata: 'item=' + $appScope.itemTitle},
          sourceFile: item
        }).monitorProgress(function(eventData) {
          item.completion = Math.round((eventData.loaded * 100.0) / eventData.total);
          item.state = "Transferring... " + item.completion + "%";
          if (!$appScope.$$phase) {
            $appScope.$apply();
          }
        }).onSuccess(function(responseData, httpStatus, responseHeaders, requestConfig) {
          $globalScope.mediaAssets = $globalScope.mediaAssets || [];
          responseData.metadata = {metadata_key: {item: $appScope.itemTitle}};
          item.outcome = responseData;
          $globalScope.mediaAssets.push(responseData);
          if (!$appScope.$$phase) {
            $appScope.$apply();
          }
        });
      });
    });

    // Determines the CSS class for the dropzone area based on drag event
    $appScope.getDragOverStyle = function(dragEvent) {
      var transferItems = dragEvent.dataTransfer.items;
      var containsFile = false;

      if (transferItems != null) {
        for (var idx = 0; idx < transferItems.length; idx++) {
          if (transferItems[idx].kind == 'file') {
            containsFile = true;
            break;
          }
        }
      } else {
        containsFile = true; // Fallback for browsers not providing items array
      }

      return containsFile ? "dropzone-active" : "dropzone-error";
    };
  }
]);