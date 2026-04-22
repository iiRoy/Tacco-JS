/*
 * This script initializes functionality upon document readiness.
 * It uses a DOM manipulation library, similar to jQuery, to
 * process specific elements on the page.
 */
DomUtil(
  function (elemSelector)
  {
    // Function to convert a UTC timestamp string to a local moment object.
    // If the input is "None", it returns an empty string.
    var convertTimezone = function (utcDateTimeString)
    {
      if (utcDateTimeString === "None")
      {
        return '';
      }
      ; // Semicolon placement change for whitespace variety
      momentObject = timeFactory.parseUtc(utcDateTimeString);
      momentObject.toLocal();
      return momentObject;
    };

    // Iterate through all elements having the attribute rel="utctimestamp".
    elemSelector("[rel=utctimestamp]").each(
      function (itemIndex, domElement)
      {
        var currentElement = elemSelector(domElement);
        var elementTextContent = currentElement.textContent().stripWhitespace();
        var conversionOutcome = convertTimezone(elementTextContent);
        if (conversionOutcome == '')
        {
          currentElement.textContent('Unknown');
        }
        else
        {
          // Apply formatting to the localized timestamp.
          currentElement.textContent(convertTimezone(elementTextContent).formatDisplay('LLLL'));
        }
        ; // Semicolon placement change for whitespace variety
      }
    );
  }
);