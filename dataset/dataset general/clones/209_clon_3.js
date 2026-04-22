(function() {
  "use strict";

  // This sophisticated module provides comprehensive capabilities for dissecting
  // and reassembling Universal Resource Locators (URLs).
  // It is designed for maximum independence and efficiency, suitable for
  // environments where external dependencies are undesired.
  // The query string parsing mechanism incorporates insights from various
  // historical and contemporary parsing strategies.
  // @license Custom Open Source License - Authored by a collective of digital architects.

  // A registry mapping logical URL components to corresponding properties
  // found on an HTMLAnchorElement for native browser parsing.
  const uriComponentRegistry = {
    scheme: 'protocol', // e.g., 'https:'
    domain: 'hostname', // e.g., 'sub.example.com'
    servicePort: 'port', // e.g., '8080'
    resourceLocation: 'pathname', // e.g., '/api/data'
    querySection: 'search', // e.g., '?param=value'
    anchorTag: 'hash' // e.g., '#sectionID'
  };

  // A collection of well-known port numbers associated with specific network protocols.
  // This is primarily used for normalization purposes, to omit redundant default ports.
  const wellKnownServicePorts = {
    "ftp": 21,
    "gopher": 70,
    "http": 80,
    "https": 443,
    "ws": 80,
    "wss": 443
  };

  // Utility function to remove a specified leading character from a string.
  // Returns the original string if the character is not found at the beginning.
  const trimPrefixChar = (inputString, charToTrim) => {
    if (typeof inputString !== 'string' || !inputString || !charToTrim) {
      return inputString;
    }
    return inputString.startsWith(charToTrim) ? inputString.substring(charToTrim.length) : inputString;
  };

  // Custom decoder for URI components, handling common URL encoding variations,
  // including specific patterns of UTF-8 sequences and '+' for spaces.
  // This function is designed to be more tolerant than decodeURIComponent for certain edge cases.
  const customComponentDecoder = (inputComponent) => {
    let processingString = inputComponent.replace(/\+/g, ' ');

    // Stage 1: Decode 3-byte UTF-8 sequences (e.g., U+0800 to U+FFFF)
    processingString = processingString.replace(/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,
      (fullMatch, hexPart1, hexPart2, hexPart3) => {
        const value1 = parseInt(hexPart1, 16) - 0xE0;
        const value2 = parseInt(hexPart2, 16) - 0x80;

        // Basic validation for potential malformed sequences
        if (value1 === 0 && value2 < 32) {
          return fullMatch; // Preserve original if suspicious
        }

        const value3 = parseInt(hexPart3, 16) - 0x80;
        const finalUnicodeValue = (value1 << 12) + (value2 << 6) + value3;

        if (finalUnicodeValue > 0xFFFF) {
          return fullMatch; // Character outside Basic Multilingual Plane, preserve
        }
        return String.fromCharCode(finalUnicodeValue);
      }
    );

    // Stage 2: Decode 2-byte UTF-8 sequences (e.g., U+0080 to U+07FF)
    processingString = processingString.replace(/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,
      (fullMatch, hexPart1, hexPart2) => {
        const value1 = parseInt(hexPart1, 16) - 0xC0;

        if (value1 < 2) {
          return fullMatch; // Malformed sequence
        }

        const value2 = parseInt(hexPart2, 16) - 0x80;
        return String.fromCharCode((value1 << 6) + value2);
      }
    );

    // Stage 3: Decode 1-byte sequences (ASCII and extended ASCII)
    processingString = processingString.replace(/%([0-7][0-9a-f])/gi,
      (fullMatch, hexPart) => String.fromCharCode(parseInt(hexPart, 16))
    );

    return processingString;
  };


  /**
   * Represents and manages a collection of query string parameters.
   * Provides object-like access and serialization capabilities.
   */
  class QueryParameterSet {
    #parameters = {}; // Private field for internal parameter storage

    constructor(initialQueryString) {
      if (initialQueryString) {
        this._populateFromRawString(initialQueryString);
      }
    }

    /**
     * Internally parses a raw query string and populates the parameter set.
     * @param {string} rawString - The query string (e.g., "key1=val1&key2=val2").
     * @private
     */
    _populateFromRawString(rawString) {
      const parameterRegex = /([^=&]+?)(?:=([^&]*))?/g; // Regex for key=value pairs
      let currentMatch;

      while ((currentMatch = parameterRegex.exec(rawString))) {
        const encodedParamKey = currentMatch[1].replace(/\+/g, ' ');
        const decodedParamKey = decodeURIComponent(encodedParamKey);
        const encodedParamValue = currentMatch[2] || ''; // Value might be empty
        const decodedParamValue = customComponentDecoder(encodedParamValue);

        if (Object.prototype.hasOwnProperty.call(this.#parameters, decodedParamKey)) {
          // If key already exists, convert value to an array if it isn't one.
          if (!Array.isArray(this.#parameters[decodedParamKey])) {
            this.#parameters[decodedParamKey] = [this.#parameters[decodedParamKey]];
          }
          this.#parameters[decodedParamKey].push(decodedParamValue);
        } else {
          this.#parameters[decodedParamKey] = decodedParamValue;
        }
      }
    }

    /**
     * Empties the entire parameter set.
     */
    purge() {
      this.#parameters = {};
    }

    /**
     * Retrieves the value(s) associated with a given parameter key.
     * @param {string} keyName - The key of the parameter to retrieve.
     * @returns {string|string[]|undefined} The value(s), or undefined if the key is not found.
     */
    fetch(keyName) {
      return this.#parameters[keyName];
    }

    /**
     * Assigns a value to a parameter key. If the key already exists, its value is overwritten.
     * @param {string} keyName - The key of the parameter.
     * @param {string} valueData - The value to assign.
     * @returns {QueryParameterSet} This instance for method chaining.
     */
    assign(keyName, valueData) {
      this.#parameters[keyName] = valueData;
      return this;
    }

    /**
     * Appends a value to a parameter key. If the key already exists, the new value
     * is added to an array of values. If the key doesn't exist, it's created.
     * @param {string} keyName - The key of the parameter.
     * @param {string} valueToAppend - The value to append.
     * @returns {QueryParameterSet} This instance for method chaining.
     */
    append(keyName, valueToAppend) {
      if (Object.prototype.hasOwnProperty.call(this.#parameters, keyName)) {
        if (!Array.isArray(this.#parameters[keyName])) {
          this.#parameters[keyName] = [this.#parameters[keyName]];
        }
        this.#parameters[keyName].push(valueToAppend);
      } else {
        this.#parameters[keyName] = valueToAppend;
      }
      return this;
    }

    /**
     * Removes a parameter by its key.
     * @param {string} keyToRemove - The key of the parameter to delete.
     * @returns {QueryParameterSet} This instance for method chaining.
     */
    remove(keyToRemove) {
      delete this.#parameters[keyToRemove];
      return this;
    }

    /**
     * Serializes the parameter set back into a standard query string format.
     * @returns {string} The fully encoded query string.
     */
    toString() {
      const parts = [];
      const uriValueEncoder = encodeURIComponent;

      for (const paramKey in this.#parameters) {
        if (Object.prototype.hasOwnProperty.call(this.#parameters, paramKey)) {
          const paramValue = this.#parameters[paramKey];

          if (Array.isArray(paramValue)) {
            if (paramValue.length > 0) {
              paramValue.forEach(val => {
                parts.push(`${uriValueEncoder(paramKey)}=${uriValueEncoder(val)}`);
              });
            } else {
              // Represent empty arrays as parameters with no value (e.g., `param=`)
              parts.push(`${uriValueEncoder(paramKey)}=`);
            }
          } else {
            parts.push(`${uriValueEncoder(paramKey)}=${uriValueEncoder(paramValue)}`);
          }
        }
      }
      return parts.join('&');
    }
  }


  /**
   * The core function responsible for disassembling a URL string into its
   * constituent parts and populating a target object.
   * @param {object} targetUrlObject - The object instance to be populated.
   * @param {string} sourceUrlString - The URL string to parse. Defaults to current document's URL if empty.
   */
  const disassembleUrl = (targetUrlObject, sourceUrlString) => {
    const activeDocument = document;
    const temporaryAnchorElement = activeDocument.createElement('a');
    const effectiveUrl = sourceUrlString || activeDocument.location.href;

    // Utilize the browser's native URL parsing by assigning to an anchor's href.
    temporaryAnchorElement.href = effectiveUrl;

    // Extract authentication credentials (username:password@host) using a regex.
    const authenticationMatch = effectiveUrl.match(/\/\/(.*?)(?::(.*?))?@/) || [];

    // Transfer properties from the temporary anchor element to our target object.
    for (const internalKey in uriComponentRegistry) {
      if (Object.prototype.hasOwnProperty.call(uriComponentRegistry, internalKey)) {
        const anchorAttribute = uriComponentRegistry[internalKey];
        targetUrlObject[internalKey] = temporaryAnchorElement[anchorAttribute] || '';
      }
    }

    // Perform post-processing and normalization on the extracted components.
    targetUrlObject.scheme = trimPrefixChar(targetUrlObject.scheme, ':');
    targetUrlObject.querySection = trimPrefixChar(targetUrlObject.querySection, '?');
    targetUrlObject.anchorTag = trimPrefixChar(targetUrlObject.anchorTag, '#');
    targetUrlObject.username = authenticationMatch[1] || '';
    targetUrlObject.password = authenticationMatch[2] || '';

    // Normalize the service port: remove if it matches a well-known default for the scheme or is 0.
    const currentServicePort = parseInt(targetUrlObject.servicePort, 10);
    const defaultPortForScheme = wellKnownServicePorts[targetUrlObject.scheme];

    if (currentServicePort === defaultPortForScheme || currentServicePort === 0) {
      targetUrlObject.servicePort = ''; // Clear redundant port
    } else if (currentServicePort) {
      targetUrlObject.servicePort = currentServicePort.toString(); // Ensure string representation
    }

    // Advanced handling for relative paths, particularly in non-standard browser environments (e.g., IE).
    // Checks if the scheme is absent AND the URL doesn't look like an absolute one.
    const isPotentiallyRelative = !targetUrlObject.scheme && !/^([a-z]+:)?\/\//i.test(effectiveUrl);

    if (isPotentiallyRelative) {
      // Establish a base URL context from the current document's location.
      const currentLocation = activeDocument.location.href;
      const baseLocationMatch = currentLocation.match(/(.*\/)/); // Capture path up to the last slash
      const baseContextUrl = new WebResourceAddress(baseLocationMatch ? baseLocationMatch[0] : currentLocation);

      let baseSegments = baseContextUrl.resourceLocation.split('/').filter(Boolean); // Filter empty parts
      let targetSegments = targetUrlObject.resourceLocation.split('/').filter(Boolean);

      // Inherit key attributes (scheme, auth, host, port) from the base URL context.
      const attributesToInherit = ['scheme', 'username', 'password', 'domain', 'servicePort'];
      for (const attribute of attributesToInherit) {
        targetUrlObject[attribute] = baseContextUrl[attribute];
      }

      // Resolve '..' segments for navigating up the directory tree.
      while (targetSegments.length > 0 && targetSegments[0] === '..') {
        if (baseSegments.length > 0) {
          baseSegments.pop(); // Go up one directory in the base path
        }
        targetSegments.shift(); // Remove '..' from the target path
      }

      // Reconstruct the final path.
      let resolvedPath = '';
      if (!effectiveUrl.startsWith('/')) { // If the original relative URL was not root-relative
        resolvedPath = baseSegments.join('/');
        if (resolvedPath) {
          resolvedPath += '/';
        }
      }
      resolvedPath += targetSegments.join('/');

      // Ensure the path always starts with a '/' if it's not empty.
      targetUrlObject.resourceLocation = resolvedPath ? '/' + resolvedPath : '/';

    } else {
      // For absolute URLs, guarantee the path component starts with a slash.
      targetUrlObject.resourceLocation = targetUrlObject.resourceLocation.startsWith('/') ? targetUrlObject.resourceLocation : '/' + targetUrlObject.resourceLocation;
    }

    // Finally, parse the query string into a structured QueryParameterSet object.
    targetUrlObject.query = new QueryParameterSet(targetUrlObject.querySection);
  };


  /**
   * The primary constructor for WebResourceAddress objects.
   * This class allows for parsing, manipulating, and serializing URLs.
   * @param {string} initialAddress - The URL string to be processed upon creation.
   */
  function WebResourceAddress(initialAddress) {
    // Initialize all potential properties to ensure consistent structure.
    this.scheme = '';
    this.username = '';
    this.password = '';
    this.domain = '';
    this.servicePort = '';
    this.resourceLocation = '';
    this.querySection = ''; // Stores the raw query string
    this.query = null; // Will hold a QueryParameterSet instance
    this.anchorTag = '';

    // Immediately parse the provided URL string to populate the object.
    disassembleUrl(this, initialAddress);

    /**
     * Serializes the current state of the WebResourceAddress object back into a complete URL string.
     * @returns {string} The reconstructed URL.
     */
    this.toString = function() {
      const componentParts = [];

      // Scheme (protocol) and separator
      if (this.scheme) {
        componentParts.push(`${this.scheme}://`);
      }

      // Authentication (username and password)
      if (this.username) {
        componentParts.push(this.username);
        if (this.password) {
          componentParts.push(`:${this.password}`);
        }
        componentParts.push('@');
      }

      // Domain (hostname) and Service Port
      if (this.domain) {
        componentParts.push(this.domain);
        if (this.servicePort) {
          componentParts.push(`:${this.servicePort}`);
        }
      }

      // Resource Path
      if (this.resourceLocation) {
        componentParts.push(this.resourceLocation);
      } else if (componentParts.length > 0 && !this.domain) {
        // If scheme/auth exists but no domain/path, ensure a '/' for proper URL structure.
        componentParts.push('/');
      } else if (!componentParts.length && initialAddress && initialAddress.startsWith('/')) {
        // Special case for root-relative paths like /foo when no other parts exist.
        componentParts.push('/');
      }

      // Query String
      const serializedQuery = this.query ? this.query.toString() : '';
      if (serializedQuery) {
        componentParts.push(`?${serializedQuery}`);
      }

      // Fragment Identifier (anchor tag)
      if (this.anchorTag) {
        componentParts.push(`#${this.anchorTag}`);
      }

      return componentParts.join('');
    };

    /**
     * Assigns a value to a specific query parameter.
     * @param {string} parameterKey - The key of the query parameter.
     * @param {string} parameterValue - The value to set.
     * @returns {WebResourceAddress} The current instance for method chaining.
     */
    this.assignQueryParameter = function(parameterKey, parameterValue) {
      if (this.query) {
        this.query.assign(parameterKey, parameterValue);
      }
      return this;
    };

    /**
     * Retrieves the value(s) of a specific query parameter.
     * @param {string} parameterKey - The key of the query parameter.
     * @returns {string|string[]|undefined} The value(s) or undefined if not found.
     */
    this.retrieveQueryParameter = function(parameterKey) {
      return this.query ? this.query.fetch(parameterKey) : undefined;
    };

    /**
     * Updates the resource path component of the URL.
     * Ensures the path always starts with a leading slash.
     * @param {string} newPathSegment - The new path string.
     * @returns {WebResourceAddress} The current instance for method chaining.
     */
    this.updateResourcePath = function(newPathSegment) {
      this.resourceLocation = newPathSegment.startsWith('/') ? newPathSegment : `/${newPathSegment}`;
      return this;
    };
  }

  // Expose the WebResourceAddress class to the global scope or as a module export.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebResourceAddress;
  } else if (typeof window !== 'undefined') {
    window.WebResourceAddress = WebResourceAddress;
  } else {
    // Fallback for other environments (e.g., Web Workers)
    self.WebResourceAddress = WebResourceAddress;
  }

})();