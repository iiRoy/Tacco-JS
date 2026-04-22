var requestDataBlueprint;
var defaultRequestData =
{
    VerbType:       '',
    PathTemplate:   '',
    ExampleContent: {},
    PathParams:     [],
    RootEndpoint:   '/'
};

(
  function()
  {
    /* Function to construct the final URI path from a template and parameters. */
    function ConstructResourcePath(pathPattern, resourceParams)
    {
      var resultPath = pathPattern;

      // Iterate through each resource parameter
      for (var idx in resourceParams)
      {
        var currentParam = resourceParams[idx];
        if (currentParam.enabled())
        {
          var paramValue = currentParam.value();
          if (paramValue !== "")
          {
            // Replace placeholder with actual value
            var placeholder = '{' + currentParam.name + '}';
            resultPath = resultPath.replace(placeholder, paramValue);
          }
        }
        else
        {
          // Remove the parameter if it's disabled
          resultPath = CleanResourceParameter(resultPath, currentParam.name);
        }
      }

      // Perform path cleanup operations
      resultPath = resultPath.replace("/?", "?");
      resultPath = resultPath.replace("?&", "?");

      // Remove any trailing '?'
      if (resultPath.charAt(resultPath.length - 1) === '?')
      {
        resultPath = resultPath.substring(0, resultPath.length - 1);
      }
      // Remove any trailing '&'
      if (resultPath.charAt(resultPath.length - 1) === '&')
      {
        resultPath = resultPath.substring(0, resultPath.length - 1);
      }

      return resultPath;
    }

    /* Helper function to remove a specific parameter from a URI template. */
    function CleanResourceParameter(pathPattern, paramToErase)
    {
      var cleanedPath = pathPattern;
      var paramPlaceholder = '{' + paramToErase + '}';
      var paramString = paramToErase + '=' + paramPlaceholder; // For query string parameters
      cleanedPath = cleanedPath.replace(paramString, ""); // Remove full query param
      cleanedPath = cleanedPath.replace(paramPlaceholder, ""); // Remove path param placeholder
      return cleanedPath;
    }

    /* Main ViewModel for the API request client. */
    function ApiRequestViewModel(initialPayload)
    {
      const instance = this; // Self-reference for clarity

      // Initialize observable properties
      instance.HttpVerb = ko.observable(initialPayload.VerbType);
      instance.ResourceTemplate = initialPayload.PathTemplate;
      instance.CurrentResourcePath = ko.observable(instance.ResourceTemplate);

      instance.ResourceParameters = []; // Array to hold path parameters
      for (var idxParam in initialPayload.PathParams)
      {
        var singleParam = initialPayload.PathParams[idxParam];
        var paramObservableValue = ko.observable(singleParam.value);
        var paramActiveStatus = ko.observable(true);

        // Subscribe to changes to update the URI path
        paramObservableValue.subscribe(function()
        {
          instance.CurrentResourcePath(ConstructResourcePath(instance.ResourceTemplate, instance.ResourceParameters));
        });
        paramActiveStatus.subscribe(function()
        {
          instance.CurrentResourcePath(ConstructResourcePath(instance.ResourceTemplate, instance.ResourceParameters));
        });
        instance.ResourceParameters.push({ name: singleParam.name, value: paramObservableValue, enabled: paramActiveStatus });
      }

      instance.OutgoingHeaders = ko.observableArray(); // Dynamic list of request headers

      instance.ContentTypeSelection = ko.observable(); // Selected content type for the request body

      var availableContentFormats = [];
      for (var j in initialPayload.ExampleContent)
      {
        availableContentFormats.push(j);
      }
      instance.ContentFormatOptions = availableContentFormats;

      instance.DisplayPayloadField = ko.observable(availableContentFormats.length > 0); // Show/hide body input

      instance.OutgoingPayload = ko.observable(); // The actual request body content

      // Update request body and Content-Type header when content type changes
      instance.ContentTypeSelection.subscribe(function()
      {
        instance.OutgoingPayload(deserializeContent(initialPayload.ExampleContent[instance.ContentTypeSelection()]) || "");
        var headerCollection = instance.OutgoingHeaders;
        var selectedContentType = instance.ContentTypeSelection();
        if (selectedContentType && selectedContentType !== "")
        {
          updateOrCreateHeader(headerCollection, "content-type", selectedContentType);
        }
      });

      // Update Content-Length header when request body changes
      instance.OutgoingPayload.subscribe(function()
      {
        var headerCollection = instance.OutgoingHeaders;
        var payloadLength = instance.OutgoingPayload().length;
        updateOrCreateHeader(headerCollection, "content-length", payloadLength);
      });

      // Function to add a new empty header row
      instance.addNewHeader = function()
      {
        instance.OutgoingHeaders.splice(0, 0, { name: "", value: "" });
      };

      // Function to remove a header row
      instance.dropHeader = function(headerItem)
      {
        instance.OutgoingHeaders.remove(headerItem);
      };

      instance.ApiResponse = ko.observable(); // Holds the response from the API call

      // Function to dispatch the API request
      instance.dispatchApiCall = function()
      {
        var currentPath = instance.CurrentResourcePath();
        const httpPrefix = "http://";
        const httpsPrefix = "https://";

        // Determine the full URI, handling absolute paths
        var targetUri = (currentPath.slice(0, httpPrefix.length) === httpPrefix || currentPath.slice(0, httpsPrefix.length) === httpsPrefix) ?
                        currentPath :
                        initialPayload.RootEndpoint + currentPath;

        var methodType = instance.HttpVerb();
        var outgoingHeaders = instance.OutgoingHeaders();
        var payloadToSend = instance.DisplayPayloadField() ? instance.OutgoingPayload() : null;

        ExecuteHttpRequest(methodType, targetUri, outgoingHeaders, payloadToSend, function(xhrObject)
        {
          var apiResponse = parseHttpResponse(xhrObject);
          instance.ApiResponse(apiResponse);
          $("#testClientResponseDialog").dialog("open"); // Open response dialog
        });
      };

      // Initialize the main request dialog
      $("#testClientDialog").dialog({
        autoOpen: false,
        height: "auto",
        width: "700",
        modal: true,
        open: function()
        {
          jQuery('.ui-widget-overlay').bind('click', function()
          {
            jQuery('#testClientDialog').dialog('close');
          });
        },
        buttons: {
          "Send": function()
          {
            instance.dispatchApiCall();
          }
        }
      });

      // Initialize the response display dialog
      $("#testClientResponseDialog").dialog({
        autoOpen: false,
        height: "auto",
        width: "550",
        modal: true,
        open: function()
        {
          jQuery('.ui-widget-overlay').bind('click', function()
          {
            jQuery('#testClientResponseDialog').dialog('close');
          });
        }
      });

      // Event handler for the button to open the main dialog
      $("#testClientButton").click(function()
      {
        $("#testClientDialog").dialog("open");
      });
    }

    // Apply Knockout bindings to the ViewModel
    var startingData = requestDataBlueprint || defaultRequestData;
    ko.applyBindings(new ApiRequestViewModel(startingData));
  }
)(); // End of IIFE

/* Decodes an encoded sample string for display. */
function deserializeContent(encodedString)
{
  return unescape(encodedString).replace(/\+/gi, " ").replace(/\r\n/gi, "\n");
}

/* Adds a new header or updates an existing one in the observable array. */
function updateOrCreateHeader(headerListObs, keyName, valueData)
{
  var currentHeaders = headerListObs();
  for (var k in currentHeaders)
  {
    if (currentHeaders[k].name.toLowerCase() === keyName)
    {
      headerListObs.replace(currentHeaders[k], { name: currentHeaders[k].name, value: valueData });
      return;
    }
  }
  headerListObs.push({ name: keyName, value: valueData });
}

/* Executes an HTTP request using XMLHttpRequest. */
function ExecuteHttpRequest(methodIdentifier, targetUrl, outgoingHeaders, requestPayload, responseHandler)
{
  if (methodIdentifier.length === 0)
  {
    alert("HTTP Method cannot be empty.");
    return false;
  }

  if (targetUrl.length === 0)
  {
    alert("URL for the request cannot be empty.");
    return false;
  }

  var xhrObject = new XMLHttpRequest();
  try
  {
    xhrObject.open(methodIdentifier, encodeURI(targetUrl), false); // Synchronous request
  }
  catch (errorObject)
  {
    alert("Failed to send request. Browser security settings may prevent cross-domain requests.");
    return false;
  }

  try
  {
    for (var l in outgoingHeaders)
    {
      var headerEntry = outgoingHeaders[l];
      xhrObject.setRequestHeader(headerEntry.name, headerEntry.value);
    }
  }
  catch (errorObject)
  {
    alert("Invalid header provided.");
    return false;
  }

  // Define callback for state changes
  xhrObject.onreadystatechange = function()
  {
    switch (this.readyState)
    {
      case 4: // Request complete
        responseHandler(xhrObject);
        break;
      default:
        break;
    }
  };

  // Define callback for request timeout
  xhrObject.ontimeout = function()
  {
    alert("API request timed out.");
  };

  try
  {
    xhrObject.send(requestPayload); // Send the request
  }
  catch (errorObject)
  {
    alert(errorObject);
    return false;
  }

  return true;
}

/* Parses the raw XMLHttpRequest response into a structured object. */
function parseHttpResponse(xmlHttpRequest)
{
  var httpStatusCode = xmlHttpRequest.status;
  var httpStatusText = xmlHttpRequest.statusText;
  var allResponseHeaders = xmlHttpRequest.getAllResponseHeaders();
  var rawResponseData = xmlHttpRequest.responseText;

  // Handle specific IE status code quirk (1223 for 204 No Content)
  if (httpStatusCode === 1223)
  {
    httpStatusCode = 204;
    httpStatusText = "No Content";
  }

  var fullStatusString = httpStatusCode + "/" + httpStatusText;

  return { status: fullStatusString, headers: allResponseHeaders, content: rawResponseData };
}