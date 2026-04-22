/*
This script provides a jQuery extension to embed a Flash-based utility for simple
client-side text copying to the clipboard. It requires a SWF file to function.
*/
(function(webLib) {

  webLib.fn.copyLink = function(settings) {

    var defaultSettings = { // Configuration defaults
      'boxWidth': '14',
      'boxHeight': '14',
      'bgColor': '#ffffff',
      'swfPath': 'flash_copy.swf',
      'preserveText': false
    };

    settings = webLib.extend(defaultSettings, settings);

    var flashParams = { // Parameters for the <object> tag
      'sourceFile': settings.swfPath,
      'allowScriptAccess': 'always',
      'quality': 'high',
      'scale': 'noscale',
      'bgcolor': settings.bgColor
    };

    // Duplicate and adjust parameters specifically for the <embed> tag
    var embedAttributes = webLib.extend({}, flashParams, {
      'width': settings.boxWidth,
      'height': settings.boxHeight
    });
    embedAttributes.src = embedAttributes.sourceFile;

    delete embedAttributes.sourceFile;

    // Iterate over each selected DOM element
    this.each(function(position, currentElem) {
      var contentToCopy;

      if (settings.displayText && settings.displayText !== '') {
        contentToCopy = settings.displayText;
      } else if (webLib(currentElem).data('copy-content') && webLib(currentElem).data('copy-content') !== '') {
        contentToCopy = webLib(currentElem).data('copy-content');
      } else {
        contentToCopy = webLib(currentElem).text();
      }

      // Ensure the content is URI-encoded for FlashVars
      contentToCopy = encodeURIComponent(contentToCopy);

      // FlashVars are element-specific, unlike other settings
      flashParams.FlashVariables = 'text=' + contentToCopy;
      embedAttributes.FlashVariables = 'text=' + contentToCopy;

      // Construct the Flash object according to recommended practices
      var objectElement = webLib('<object />').attr({
        'classid': 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        'width': settings.boxWidth,
        'height': settings.boxHeight
      });

      // Create the <embed> tag
      var embedElement = webLib('<embed />').attr(embedAttributes);

      try {
        // Attempt to append <embed> to <object>
        objectElement.append(embedElement);

        // Prepend <param> tags to the <object>
        webLib.each(flashParams, function(paramName, paramValue) {
          objectElement.prepend(webLib('<param />').attr({
            'name': paramName,
            'value': paramValue
          }));
        });
      } catch (err) {
        // IE usually prevents appending <embed> to <object>, so use <embed> directly
        objectElement = embedElement;
      }

      // Decide whether to keep or replace the original text
      if (settings.preserveText) {
        webLib(currentElem).html(objectElement).append(decodeURIComponent(contentToCopy));
      } else {
        webLib(currentElem).html(objectElement);
      }
    });
  };
})(jQuery); // Pass jQuery object