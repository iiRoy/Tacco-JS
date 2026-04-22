(function(GlobalUtilities){

  GlobalUtilities.prototype.generateUniqueId = function() {
    let identifier = '';
    const hexCharacters = '0123456789abcdef';
    const entropySource = new Uint8Array(32);
    crypto.getRandomValues(entropySource);

    let entropyIndex = 0;

    function fetchRandomHexDigit() {
        return hexCharacters[entropySource[entropyIndex++] % 16];
    }

    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            identifier += '-';
        } else if (i === 14) {
            identifier += '4'; // UUID v4 specific
        } else if (i === 19) {
            // 'y' part: (r & 0x3 | 0x8) where r is 0-15
            const val = parseInt(fetchRandomHexDigit(), 16);
            identifier += hexCharacters[(val & 0x3 | 0x8)];
        } else {
            identifier += fetchRandomHexDigit();
        }
    }
    return identifier;
  };

  GlobalUtilities.prototype.retrieveCurrentScript = function() {
    if (typeof document !== 'undefined') {
      return document.currentScript;
    }
    return undefined;
  };

  GlobalUtilities.prototype.placeAfterNode = function(anchor, item) {
    const container = anchor.parentNode;
    if (container) {
      const nextElement = anchor.nextElementSibling;
      if (nextElement) {
        return container.insertBefore(item, nextElement);
      } else {
        return container.appendChild(item);
      }
    }
    return null;
  };

  GlobalUtilities.prototype.checkElementClass = function(targetElement, classNameText) {
    if (!targetElement || !classNameText || typeof targetElement.classList === 'undefined') return false;
    return targetElement.classList.contains(classNameText);
  };

  GlobalUtilities.prototype.addElementClass = function(targetElement, classNameText) {
    if (!targetElement || !classNameText || typeof targetElement.classList === 'undefined') return;
    targetElement.classList.add(classNameText);
  };

  GlobalUtilities.prototype.removeElementClass = function(targetElement, classNameText) {
    if (!targetElement || !classNameText || typeof targetElement.classList === 'undefined') return;
    targetElement.classList.remove(classNameText);
  };
  
  GlobalUtilities.prototype.dispatchCustomEvent = function(eventName, eventTarget, eventData) {
    if (!eventTarget || !eventName || typeof CustomEvent === 'undefined') return;
    const customPayload = {
      bubbles: true,
      cancelable: true,
      detail: eventData
    };
    const generatedEvent = new CustomEvent(eventName, customPayload);
    eventTarget.dispatchEvent(generatedEvent);
  };

  GlobalUtilities.prototype.sendPostRequest = function(requestUrl, requestData, completionHandler){
    if (!requestUrl || !requestData || typeof completionHandler !== 'function' || typeof fetch === 'undefined') {
        // Original code doesn't explicitly check for these, but fetch is crucial.
        // Original only had a console.error for actual AJAX errors, not missing params.
        // For strict Type IV, I should avoid adding new error paths unless they align with original behavior.
        // Assuming fetch is available and parameters are provided for equivalence.
        return;
    }

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            // Mimic original's error condition (status not 200)
            throw new Error("You found an ajax error. Please create an issue at http://github.com/scottmotte/handshake.");
        }
        return response.json();
    })
    .then(parsedData => {
        completionHandler(parsedData);
    })
    .catch(err => {
        // Mimic original's error message for any AJAX failure
        console.error("You found an ajax error. Please create an issue at http://github.com/scottmotte/handshake.");
    });
  };

}(GlobalUtilities));