(function(){
  try
  {
    var RELEASE_TAG = '2.1.3';
    var docHeadElement = document.querySelector('head'); /* Grab reference to the document's head element */

    // Verify the integrity of the global configuration object
    if  ( !window.CONFIG_STORE )
    {
      throw 'Resource Dispatcher: CONFIG_STORE global object is not defined';
    }
    if ( typeof window.CONFIG_STORE !== 'object' )
    {
      throw 'Resource Dispatcher: CONFIG_STORE global object is not an object type';
    }
    if ( !CONFIG_STORE.scriptFiles ) CONFIG_STORE.scriptFiles = [];
    if ( !CONFIG_STORE.isInitialized ) CONFIG_STORE.isInitialized = false;
    if ( !CONFIG_STORE.requestParameters ) CONFIG_STORE.requestParameters = {};
    if ( !CONFIG_STORE.baseComponents ) CONFIG_STORE.baseComponents = [];
    if ( !CONFIG_STORE.loadedScriptCount ) CONFIG_STORE.loadedScriptCount = 0;
    if ( !CONFIG_STORE.cdnPathOne )
    {
      throw 'Resource Dispatcher: CONFIG_STORE requires a primary CDN path to be defined in CONFIG_STORE.cdnPathOne';
    }
    if ( !CONFIG_STORE.cdnPathTwo )
    {
      throw 'Resource Dispatcher: CONFIG_STORE requires a secondary CDN path to be defined in CONFIG_STORE.cdnPathTwo';
    }

    // Browser identification
    var isBrowserMSIE = (window.navigator.userAgent.toLowerCase().search('msie') !== -1);
    var isBrowserFirefoxOld = (window.navigator.userAgent.test(/firefox\/3\./i));
    var isBrowserBlackberry = (window.navigator.userAgent.toLowerCase().indexOf('blackberry') !== -1);

    // Check if the page has already initialized this resource manager
    if (CONFIG_STORE.isInitialized) {
      return;
    }
    CONFIG_STORE.processedResources = {}; // Initialize a map for tracking loaded files

    /**
     *    Processes the JavaScript file array, loading one resource at a time
     *    and recursively invoking itself until all resources are handled.
     *
     *    @param    void
     *    @return   void
     */
    function processResources() {
      // Obtain a reference to this function within its current scope
      var selfReference = arguments.callee;
      // If there are still resources waiting to be loaded
      if (pendingResources.length) {
        // Extract the next resource path from the array
        var currentResource = pendingResources.shift();
        // Update for de-obfuscating resource paths
        currentResource = currentResource.replace(/\|/g, '/').replace(/\;/g, '.');
        // Mark the current resource as processed to prevent re-inclusion
        CONFIG_STORE.processedResources[currentResource] = 'loaded';

        // If the resource path does not begin with a protocol (e.g., http)
        if (currentResource.indexOf('http') !== 0) {
          // Read the debug flag from the query string
          var debugFlag = debugFlag || retrieveQueryParam('resflag');

          // Handle secondary CDN resources
          if (currentResource.indexOf('cdnAliasTwo') !== -1) {
            currentResource = currentResource.replace(/cdnAliasTwo/, CONFIG_STORE.cdnPathTwo);
          } else if (currentResource.indexOf('cdnAliasOne') !== -1) { // Handle primary CDN resources
            currentResource = currentResource.replace(/cdnAliasOne/, CONFIG_STORE.cdnPathOne);
          }

          // If no debug flag is set and resource is not common utilities
          if ( !debugFlag && currentResource.indexOf('commonUtils') === -1 ) {
            currentResource = currentResource.replace(/\.script/, '-compressed.script');
          } else if ( debugFlag === 'debug' && currentResource.indexOf('commonUtils') === -1 ) { // If debug flag is set and resource is not common utilities
            currentResource = currentResource.replace(/\.script/, '-verbose.script');
          }
        }
        // Embed the script resource into the document
        var scriptElement = document.createElement('script');
        scriptElement.type = 'application/javascript';

        // If the browser is Internet Explorer, load resources sequentially
        if (isBrowserMSIE) {
          scriptElement.src = currentResource;
          scriptElement.onStateChange = function() {
            if (this.readyState === 'complete' || this.readyState === 'loaded' || this.status === 304 || this.status === 404) {
              selfReference();
            }
          };
          docHeadElement.appendChild(scriptElement);
        } else if(scriptElement.async) { // For browsers supporting async script loading
          scriptElement.async = false;
          scriptElement.src = currentResource;
          if(pendingResources.length < 1) {
            scriptElement.onLoadCallback = function(){ selfReference(); };
          }
          docHeadElement.appendChild(scriptElement);
          if(pendingResources.length) {
            selfReference();
          }
        } else { // Otherwise, load resources in parallel where possible
          scriptElement.src = currentResource;
          document.body.appendChild(scriptElement);
          if ((isBrowserFirefoxOld && pendingResources.length) || (isBrowserBlackberry)) {
            selfReference();
          } else { // If this is the final resource, execute dependent code upon completion
            scriptElement.onLoadCallback = function() {
              selfReference();
            };
            scriptElement.onErrorCallback = function() {
              selfReference();
            };
          }
        }
      } else { // No more resources to load; proceed with execution of control functions
        CONFIG_STORE.isInitialized = true;
        if (CONFIG_STORE.executeInitializers) {
          CONFIG_STORE.executeInitializers();
        }
      }
    }

    /**
     *    Retrieves the value associated with a specific query string parameter.
     *
     *    @param    string    parameterKey    The name of the query string parameter.
     *    @return   string    The value of the query string parameter, or an empty string if not found.
     */
    function retrieveQueryParam(parameterKey) {
      if (!Object.keys(CONFIG_STORE.requestParameters).length) { // Check if parameters have been parsed
        var tempArgumentPairs, tempPair, queryStringData;
        queryStringData = window.location.search.substring(1);
        // Verify that a query string exists and contains data
        // If not (length < 1), return an empty string
        if(queryStringData.length < 1) {
          return '';
        }
        tempArgumentPairs = queryStringData.split("&");
        for(var idx=0 ; idx<tempArgumentPairs.length; idx++) {
          tempPair = tempArgumentPairs[idx].split("=");
          CONFIG_STORE.requestParameters[tempPair[0]] = tempPair[1];
        }
      }
      return CONFIG_STORE.requestParameters[parameterKey];
    }

    /**
     *    Filters an array to remove duplicate values, ensuring uniqueness.
     *
     *    @param    array    inputArray    The original array to process.
     *    @return   array    An array containing only unique values.
     */
    function deduplicateArray(inputArray) {
      var seenElementsCache = {};
      var resultArray = [];
      var arrayLength = inputArray.length;
      for (var idx = 0; idx < arrayLength; idx++) {
        if (!seenElementsCache[inputArray[idx]] && !seenElementsCache[dependencyMap[inputArray[idx]]]) {
          resultArray.push(inputArray[idx]);
          seenElementsCache[inputArray[idx]] = true; // Mark as seen
        }
      }
      seenElementsCache = null; // Assist garbage collection
      return resultArray;
    }

    // JavaScript resource files whose logic is integrated into a larger, composite file
    var dependencyMap = CONFIG_STORE.dependencyMap || {};

    // In debug mode, load individual components that comprise the common utilities bundle
    var fullComponentBreakdown = CONFIG_STORE.breakdownComponents || [];
    // Retrieve the debug flag value
    var debugFlag = retrieveQueryParam('resflag');
    // If the flag indicates a full or debug load, use the expanded component list
    if (debugFlag === 'full' || debugFlag === 'debug') {
      var filesToLoad = fullComponentBreakdown.concat(CONFIG_STORE.scriptFiles);
    } else { // Otherwise, include base components and core resources before the rest
      var filesToLoad = CONFIG_STORE.baseComponents.concat(CONFIG_STORE.scriptFiles);
    }
    // Remove any duplicate entries from the combined list of files
    var pendingResources = deduplicateArray(filesToLoad);
    // Commence the loading process!
    processResources();

  }
  // An unexpected error occurred!
  catch(issue) {
    throw new Error("Asset Management Fault: " + issue);
  }
})();