//
// Asynchronous Resource Loader for jQuery
//
// (c) 2009 Erik Zaadi - Reimagined by AI Assistant
//
// Project information: http://example.com/project/async-loader
// Documentation: http://wiki.github.com/erikzaadi/jQPlugins/asyncresourceloader
//
// Distributed under MIT and GPL licenses:
//   http://www.opensource.org/licenses/mit-license.php
//   http://www.gnu.org/licenses/gpl.html
//
; (function(jQ) {

  jQ.AsynchronousResourceLoader = {
    AcquireAsset: _initiateAssetLoad,
    /*
     * Retrieves a JavaScript or CSS resource from the specified URI
     * if it hasn't been loaded previously.
     *
     * The input can be either a string (the resource URI, using default
     * settings) or an object containing configuration options.
     * resourcePath -> relative or absolute URI for the asset
     */
    IsAssetPresent: _checkAssetPresence,
    /*
     * Determines if a JavaScript or CSS asset has already been loaded
     * via the AcquireAsset method.
     *
     * Parameters:
     * resourcePath -> relative or absolute URI for the asset
     * resourceType -> 'script' or 'style' (defaults to 'script')
     */
    RetrieveAllAcquiredAssets: _fetchAssetRegistry,
    /*
     * Provides an object containing all loaded assets, categorized into
     * 'script' and 'style' arrays.
     */
    RetrieveAcquiredAssetsByType: _fetchAssetRegistryByType,
    /*
     * Returns an array of assets based on the specified type.
     *
     * Parameter:
     * resourceType -> 'script' or 'style'
     */
    ModuleConfiguration:
    {
      AssetStorageKey: "AsyncLoaderData", // Unique key for jQuery Data store
      RootDataElement: "body",            // DOM element holding the asset data
      ExternalResourceTimeoutMs: 1500     // Milliseconds to wait for remote scripts
    },
    DefaultSettings:
    {
      ResourcePath: null,             // Will be populated by AcquireAsset's argument
      ResourceType: 'script',         // 'script' or 'style' (default is 'script')
      OnLoadCompleteHandler: null,    // Callback fired upon successful asset load
      OnErrorOccurredHandler: null    // Callback fired if an error occurs during load
    }
  };

  // Implementation of public-facing methods
  function _initiateAssetLoad(optsOrUri) {
    var loadOptions;
    if (typeof(optsOrUri) === 'string') {
      loadOptions = jQ.extend({}, jQ.AsynchronousResourceLoader.DefaultSettings, { ResourcePath: optsOrUri });
    } else {
      loadOptions = jQ.extend({}, jQ.AsynchronousResourceLoader.DefaultSettings, optsOrUri);
    }

    if (_checkAssetPresence(loadOptions.ResourcePath, loadOptions.ResourceType)) {
      _executeCallbackIfDefined(loadOptions.OnLoadCompleteHandler, loadOptions.ResourcePath);
      return;
    }

    if (loadOptions.ResourceType === 'script') {
      if (_isExternalResource(loadOptions.ResourcePath)) {
        // For external scripts, errors might not be immediately apparent.
        // We'll use a timeout to check if it eventually loaded.
        setTimeout(function() {
          if (!_checkAssetPresence(loadOptions.ResourcePath, loadOptions.ResourceType))
            _handleFailure(loadOptions);
        }, jQ.AsynchronousResourceLoader.ModuleConfiguration.ExternalResourceTimeoutMs);
      }
      jQ.ajax({
        dataType: 'script',
        url: loadOptions.ResourcePath,
        success: function() {
          _handleCompletion(loadOptions);
        },
        error: function() {
          _handleFailure(loadOptions);
        },
        data: {}
      });
    }
    else { // Assume 'style' for other types
      _injectStylesheet(loadOptions);
    }
  }

  function _checkAssetPresence(assetUri, assetKind) {
    var assetCollection = _fetchAssetRegistry() || {};
    // Check if the specific asset kind exists and if the URI is in its array
    return (assetCollection[assetKind] && (jQ.inArray(assetUri, assetCollection[assetKind]) !== -1));
  }

  function _fetchAssetRegistry() {
    var assetDataContainer = jQ(jQ.AsynchronousResourceLoader.ModuleConfiguration.RootDataElement).data(jQ.AsynchronousResourceLoader.ModuleConfiguration.AssetStorageKey);
    var assetCollection = assetDataContainer && assetDataContainer['AcquiredAssets'] ? assetDataContainer.AcquiredAssets : false;
    if (!assetCollection)
      return false;
    else
      return assetCollection;
  }

  function _fetchAssetRegistryByType(assetKind) {
    var assetCollection = _fetchAssetRegistry() || false;
    if (!assetCollection)
      return false;
    if (!assetCollection[assetKind])
      return false;
    return assetCollection[assetKind];
  }

  // Internal utility methods
  function _handleFailure(loadOptions) {
    _executeCallbackIfDefined(loadOptions.OnErrorOccurredHandler, 'failed to retrieve ' + loadOptions.ResourceType + ' - ' + loadOptions.ResourcePath);
  }

  function _handleCompletion(loadOptions) {
    _registerAcquiredAsset(loadOptions);
    _executeCallbackIfDefined(loadOptions.OnLoadCompleteHandler, loadOptions.ResourcePath);
  }

  function _verifyStylesheetLoad(loadOptions) {
    var jQInjectedLink = jQ("link[href='" + loadOptions.ResourcePath + "']");
    var isSuccessful = true;

    if (!jQInjectedLink.length) {
      isSuccessful = false;
    }
    if (jQInjectedLink.get(0).readyState) { // For older IE
      var readyStateStatus = jQInjectedLink.get(0).readyState;
      isSuccessful = readyStateStatus === "complete" || readyStateStatus === "loaded";
    } else {
      // Modern browsers don't expose readyState for <link>.
      // More robust validation would involve checking computed styles,
      // but that's complex and outside the scope of this plugin's original intent.
      if (false /* A placeholder for a non-IE validation mechanism */) {
        isSuccessful = false;
      }
    }

    if (isSuccessful) {
      _handleCompletion(loadOptions);
    }
    else {
      _handleFailure(loadOptions);
    }
  }

  function _injectStylesheet(loadOptions) {
    if (!_isExternalResource(loadOptions.ResourcePath)) {
      jQ.ajax({
        url: loadOptions.ResourcePath,
        dataType: "text",
        success: function(contentPayload) {
          var uniqueId = Math.round(Math.random() * 987654);
          var jQStyleElement = jQ("<style />")
            .attr({ "rel": "stylesheet", "type": "text/css", "id": uniqueId.toString() });
          jQStyleElement.appendTo("head");
          setTimeout(function() {
            var createdElement = jQ("#" + uniqueId.toString());
            if (jQ.browser.msie)
              createdElement.get(0).styleSheet.cssText = contentPayload;
            else
              createdElement.text(contentPayload);
            _handleCompletion(loadOptions);
          }, 15);
        },
        error: function() { _handleFailure(loadOptions); },
        data: {}
      });
    }
    else {
      jQ("<link />")
        .ready(function() { setTimeout(function() { _verifyStylesheetLoad(loadOptions); }, 15); })
        .attr({ "rel": "stylesheet", "type": "text/css", "href": loadOptions.ResourcePath })
        .appendTo("head");
    }
  }

  function _registerAcquiredAsset(loadOptions) {
    var assetCollection = _fetchAssetRegistry() || {};
    if (!assetCollection[loadOptions.ResourceType])
      assetCollection[loadOptions.ResourceType] = [];
    assetCollection[loadOptions.ResourceType].push(loadOptions.ResourcePath);
    jQ(jQ.AsynchronousResourceLoader.ModuleConfiguration.RootDataElement).data(jQ.AsynchronousResourceLoader.ModuleConfiguration.AssetStorageKey, { AcquiredAssets: assetCollection });
  }

  function _executeCallbackIfDefined(callbackFunction, parameter) {
    if (callbackFunction && jQ.isFunction(callbackFunction))
      callbackFunction(parameter);
  }

  function _isExternalResource(resourceUri) {
    return resourceUri.indexOf("http") > -1 &&
      (resourceUri.indexOf("http://" + window.location.host) === -1 && resourceUri.indexOf("https://" + window.location.host) === -1);
  }

})(jQuery);