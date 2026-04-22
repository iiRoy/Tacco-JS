((globalScope) => {
  // --- Fundamental Utility Functions ---

  // Determines if a value is a plain JavaScript object.
  const checkPlainObject = (candidate) => {
    if (typeof candidate !== 'object' || candidate === null) {
      return false;
    }
    const prototype = Object.getPrototypeOf(candidate);
    return prototype === null || prototype === Object.prototype;
  };

  // Checks if a value is an array.
  const checkArray = Array.isArray;

  // Verifies if a plain object has no enumerable properties.
  const checkEmptyObject = (candidate) => {
    if (!checkPlainObject(candidate)) {
      return false;
    }
    return Object.keys(candidate).length === 0;
  };

  // Converts a dot-separated string path into an array of segments.
  const transformPath = (inputPath) => {
    if (typeof inputPath !== 'string') {
      return [];
    }
    return inputPath.split('.').filter(segment => segment.length > 0);
  };

  // Safely retrieves a nested value from an object given a path array.
  const extractNestedValue = (sourceObject, pathSegments) => {
    let current = sourceObject;
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (current === null || typeof current !== 'object' || !(Object.prototype.hasOwnProperty.call(current, segment))) {
        throw new ReferenceError(pathSegments.slice(0, i + 1).join('.') + ' is not present in this vault');
      }
      current = current[segment];
    }
    return current;
  };

  // Safely assigns a nested value in an object given a path array.
  const injectNestedValue = (targetObject, pathSegments, newValue) => {
    let current = targetObject;
    const lastIndex = pathSegments.length - 1;

    for (let i = 0; i < lastIndex; i++) {
      const segment = pathSegments[i];
      if (!checkPlainObject(current[segment])) {
        current[segment] = {};
      }
      current = current[segment];
    }
    current[pathSegments[lastIndex]] = newValue;
  };

  // Safely deletes a nested value in an object given a path array.
  const removeNestedEntry = (targetObject, pathSegments) => {
    let current = targetObject;
    const lastIndex = pathSegments.length - 1;

    for (let i = 0; i < lastIndex; i++) {
      const segment = pathSegments[i];
      if (!checkPlainObject(current[segment])) {
        return; // Path does not exist or is not an object, nothing to delete further down.
      }
      current = current[segment];
    }
    delete current[pathSegments[lastIndex]];
  };

  // Prepares data for storage by stringifying objects, or converting primitives to string.
  const prepareForStorage = (data) => {
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data);
    }
    return String(data);
  };

  // Retrieves data from storage, attempting to parse JSON or returning raw string.
  const retrieveFromStorage = (storedValue) => {
    if (storedValue === null || storedValue === undefined) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(storedValue);
      return parsed;
    } catch (e) {
      return storedValue;
    }
  };

  // --- Cookie Fallback Implementation ---

  // Generates a unique session identifier for cookie-based session storage simulation.
  let sessionIdentifier = globalScope.name || (globalScope.name = `js_session_${Math.floor(Math.random() * 100000000)}`);

  // Prefixes for cookie-based local and session storage.
  const cookieLocalPrefix = 'ls_';
  const cookieSessionPrefix = `ss_${sessionIdentifier}_`;

  // Extracts a cookie value by its label.
  const obtainCookie = (label) => {
    const allCookies = document.cookie.split(';');
    for (let i = 0; i < allCookies.length; i++) {
      let cookie = allCookies[i].trim();
      if (cookie.startsWith(label + '=')) {
        return decodeURIComponent(cookie.substring(label.length + 1));
      }
    }
    return null;
  };

  // Sets a cookie with specified options.
  const establishCookie = (label, value, options = {}) => {
    let cookieString = `${label}=${encodeURIComponent(value)}`;
    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    document.cookie = cookieString;
  };

  // Deletes a cookie by setting its expiration to the past.
  const abolishCookie = (label, options = {}) => {
    establishCookie(label, '', { ...options,
      expires: -1
    });
  };

  // Mimics the Storage API (setItem, getItem, removeItem, clear) using cookies.
  class CookieMimic {
    constructor(config = {}) {
      this.keyPrefix = config.prefix || '';
      this.expiration = config.expires || null; // in days
      this.route = config.path || null;
      this.webDomain = config.domain || null;
    }

    setEntry(key, value) {
      establishCookie(this.keyPrefix + key, value, {
        expires: this.expiration,
        path: this.route,
        domain: this.webDomain
      });
    }

    getEntry(key) {
      return obtainCookie(this.keyPrefix + key);
    }

    removeEntry(key) {
      abolishCookie(this.keyPrefix + key, {
        path: this.route,
        domain: this.webDomain
      });
    }

    clearEntries() {
      const allCookies = document.cookie.split(';');
      for (let i = 0; i < allCookies.length; i++) {
        let cookie = allCookies[i].trim();
        const cookieNameEnd = cookie.indexOf('=');
        if (cookieNameEnd > -1) {
          const name = cookie.substring(0, cookieNameEnd);
          // Only clear cookies with the specific prefix, or all if no prefix is set
          // and they are not prefixed by other storage types.
          if ((!this.keyPrefix && name.indexOf(cookieLocalPrefix) === -1 && name.indexOf(cookieSessionPrefix) === -1) ||
            (this.keyPrefix && name.indexOf(this.keyPrefix) === 0)) {
            abolishCookie(name, {
              path: this.route,
              domain: this.webDomain
            });
          }
        }
      }
    }

    setExpiration(days) {
      this.expiration = days;
      return this;
    }
    setRoute(path) {
      this.route = path;
      return this;
    }
    setWebDomain(domain) {
      this.webDomain = domain;
      return this;
    }
    configureSettings(settings) {
      if (settings.path) this.route = settings.path;
      if (settings.domain) this.webDomain = settings.domain;
      if (settings.expires) this.expiration = settings.expires;
      return this;
    }
    resetSettings() {
      this.route = this.webDomain = this.expiration = null;
    }
  }

  // --- Storage Availability Check ---
  const isStorageAvailable = (name) => {
    try {
      const testKey = 'test_key';
      if (!globalScope[name]) return false;
      globalScope[name].setItem(testKey, testKey);
      globalScope[name].removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  const supportsNativeStorage = isStorageAvailable('localStorage');

  // --- Main Vault Class for Storage Abstraction ---
  class DataVault {
    constructor(storageMechanism, vaultKind, namespaceIdentifier = '') {
      this.store = storageMechanism;
      this.kind = vaultKind;
      this.context = namespaceIdentifier; // Namespace name if this is a namespaced vault
    }

    // Internal helper to normalize arguments into a path array for internal use.
    _normalizeAccessPath(args) {
      let accessArgs = Array.from(args);
      // If this vault is namespaced, prepend its context to the path.
      if (this.context) {
        accessArgs.unshift(this.context);
      }

      const firstArg = accessArgs[0];
      // If the first argument is a dot-separated string, split it into segments.
      if (typeof firstArg === 'string' && firstArg.includes('.')) {
        const parts = transformPath(firstArg);
        accessArgs.splice(0, 1, ...parts);
      }
      return accessArgs;
    }

    // Retrieves data from the vault.
    pull(...args) {
      // Handle the special case where no arguments are given to a namespaced vault.
      if (args.length === 0) {
        if (this.context) {
          const storedContent = this.store.getEntry(this.context);
          return retrieveFromStorage(storedContent);
        } else {
          throw new Error('At least one parameter is required.');
        }
      }

      const normalizedArgs = this._normalizeAccessPath(args);
      const primaryKey = normalizedArgs[0];
      const pathSegments = normalizedArgs.slice(1);

      if (checkArray(primaryKey)) {
        // If the first argument is an array of keys, retrieve each individually.
        const resultCollection = {};
        for (const singleKey of primaryKey) {
          try {
            const storedContent = this.store.getEntry(singleKey);
            resultCollection[singleKey] = retrieveFromStorage(storedContent);
          } catch (e) {
            resultCollection[singleKey] = undefined;
          }
        }
        return resultCollection;
      } else if (pathSegments.length === 0) {
        // Single top-level key retrieval.
        const storedContent = this.store.getEntry(primaryKey);
        return retrieveFromStorage(storedContent);
      } else {
        // Nested path access.
        const rootStored = this.store.getEntry(primaryKey);
        if (rootStored === null) {
          throw new ReferenceError(primaryKey + ' is not present in this vault');
        }
        const rootObject = retrieveFromStorage(rootStored);
        if (!checkPlainObject(rootObject)) {
          throw new ReferenceError(primaryKey + ' is not present in this vault');
        }

        const lastSegment = pathSegments[pathSegments.length - 1];
        if (checkArray(lastSegment)) {
          // Nested path ending with an array of keys.
          const intermediateObject = extractNestedValue(rootObject, pathSegments.slice(0, -1));
          const finalCollection = {};
          if (intermediateObject && typeof intermediateObject === 'object') {
            for (const itemKey of lastSegment) {
              if (Object.prototype.hasOwnProperty.call(intermediateObject, itemKey)) {
                finalCollection[itemKey] = intermediateObject[itemKey];
              } else {
                finalCollection[itemKey] = undefined;
              }
            }
          }
          return finalCollection;
        } else {
          // Standard nested path retrieval.
          return extractNestedValue(rootObject, pathSegments);
        }
      }
    }

    // Stores data in the vault.
    place(...args) {
      const numArgs = args.length;

      if (numArgs < 1 || (!checkPlainObject(args[0]) && numArgs < 2)) {
        throw new Error('At least two parameters are required, or the first parameter must be an object.');
      }

      if (checkPlainObject(args[0])) {
        // If the first argument is an object of key-value pairs.
        const dataObject = args[0];
        if (this.context) {
          // If a namespaced vault, update the namespace's object.
          const currentNamespaceData = retrieveFromStorage(this.store.getEntry(this.context)) || {};
          Object.assign(currentNamespaceData, dataObject);
          this.store.setEntry(this.context, prepareForStorage(currentNamespaceData));
          return dataObject;
        } else {
          // Not namespaced, set each top-level key individually.
          for (const key in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
              this.store.setEntry(key, prepareForStorage(dataObject[key]));
            }
          }
          return dataObject;
        }
      } else {
        // Single key-value pair or nested path with a value.
        const normalizedArgs = this._normalizeAccessPath(args);
        const primaryKey = normalizedArgs[0];
        const valueToStore = normalizedArgs[normalizedArgs.length - 1];
        const pathSegments = normalizedArgs.slice(1, -1);

        if (pathSegments.length === 0) {
          // Single top-level key-value pair.
          this.store.setEntry(primaryKey, prepareForStorage(valueToStore));
          return valueToStore;
        } else {
          // Nested path with value.
          let currentData = retrieveFromStorage(this.store.getEntry(primaryKey)) || {};
          if (!checkPlainObject(currentData) && currentData !== null) {
            currentData = {}; // If existing data isn't an object, overwrite it for nesting.
          }
          injectNestedValue(currentData, pathSegments, valueToStore);
          this.store.setEntry(primaryKey, prepareForStorage(currentData));
          return currentData; // Return the updated root object.
        }
      }
    }

    // Removes data from the vault.
    obliterate(...args) {
      const normalizedArgs = this._normalizeAccessPath(args);
      const numNormalizedArgs = normalizedArgs.length;

      if (numNormalizedArgs < 1) {
        throw new Error('At least one parameter is required.');
      }

      const primaryKey = normalizedArgs[0];
      const pathSegments = normalizedArgs.slice(1);

      if (checkArray(primaryKey)) {
        // Array of top-level keys to remove.
        for (const singleKey of primaryKey) {
          this.store.removeEntry(singleKey);
        }
        return true;
      } else if (pathSegments.length === 0) {
        // Single top-level key to remove.
        this.store.removeEntry(primaryKey);
        return true;
      } else {
        // Nested path or nested path ending with an array of keys to remove.
        const rootStored = this.store.getEntry(primaryKey);
        if (rootStored === null) {
          throw new ReferenceError(primaryKey + ' is not present in this vault');
        }
        let rootObject = retrieveFromStorage(rootStored);
        if (!checkPlainObject(rootObject)) {
          throw new ReferenceError(primaryKey + ' is not present in this vault');
        }

        const lastSegment = pathSegments[pathSegments.length - 1];
        if (checkArray(lastSegment)) {
          // Nested path ending with an array of keys.
          const intermediatePath = pathSegments.slice(0, -1);
          let intermediateObject = extractNestedValue(rootObject, intermediatePath);
          if (intermediateObject && typeof intermediateObject === 'object') {
            for (const itemKey of lastSegment) {
              delete intermediateObject[itemKey];
            }
          }
        } else {
          // Standard nested path deletion.
          removeNestedEntry(rootObject, pathSegments);
        }
        this.store.setEntry(primaryKey, prepareForStorage(rootObject));
        return true;
      }
    }

    // Removes all data from this vault (or namespace).
    clearAll(reinitializeNamespaces = false) {
      if (this.context) {
        // If namespaced, clear its content by setting it to an empty object.
        this.store.setEntry(this.context, prepareForStorage({}));
        return true;
      } else {
        // Clear all items in the underlying storage.
        this.store.clearEntries();
        if (reinitializeNamespaces) {
          for (const nsName in registeredDomainVaults) {
            if (Object.prototype.hasOwnProperty.call(registeredDomainVaults, nsName)) {
              establishDomain(nsName); // Re-create all registered namespaces.
            }
          }
        }
        return true;
      }
    }

    // Checks if items are empty.
    checkEmptiness(...args) {
      const normalizedArgs = this._normalizeAccessPath(args);
      const numNormalizedArgs = normalizedArgs.length;

      if (args.length === 0) { // Check if the vault itself (or namespace) is empty.
        if (this.context) {
          const nsData = retrieveFromStorage(this.store.getEntry(this.context));
          return checkEmptyObject(nsData);
        } else {
          return this.listKeys().length === 0;
        }
      }

      const primaryKey = normalizedArgs[0];
      if (checkArray(primaryKey)) {
        // Test if all items in an array are empty.
        for (const singleKey of primaryKey) {
          if (!this.checkEmptiness(singleKey)) return false;
        }
        return true;
      } else {
        // Test a single item or a nested path.
        try {
          let value = this.pull(...args);
          // If the last argument was not an array, normalize the single value to an object for consistent iteration.
          if (!checkArray(normalizedArgs[numNormalizedArgs - 1])) {
            value = {
              _test_val_: value
            };
          }
          for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
              const item = value[prop];
              // Original uses `!v[i]`, which considers 0, false, null, undefined, '' as empty.
              if (item) return false;
            }
          }
          return true;
        } catch (e) {
          return true; // If value not found, it's considered empty.
        }
      }
    }

    // Checks if items exist (are set).
    checkPresence(...args) {
      const normalizedArgs = this._normalizeAccessPath(args);
      const numNormalizedArgs = normalizedArgs.length;

      if (numNormalizedArgs < 1) {
        throw new Error('At least one parameter is required.');
      }

      const primaryKey = normalizedArgs[0];
      if (checkArray(primaryKey)) {
        // Test if all items in an array exist.
        for (const singleKey of primaryKey) {
          if (!this.checkPresence(singleKey)) return false;
        }
        return true;
      } else {
        // Test a single item or a nested path.
        try {
          let value = this.pull(...args);
          // Normalize single value to an object for consistent iteration.
          if (!checkArray(normalizedArgs[numNormalizedArgs - 1])) {
            value = {
              _test_val_: value
            };
          }
          for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
              const item = value[prop];
              if (item === undefined || item === null) return false;
            }
          }
          return true;
        } catch (e) {
          return false; // If value not found, it's not set.
        }
      }
    }

    // Retrieves keys of items in the vault or a nested object.
    listKeys(...args) {
      const normalizedArgs = this._normalizeAccessPath(args);
      const numNormalizedArgs = normalizedArgs.length;

      if (numNormalizedArgs > 0) {
        // Get keys of a nested object.
        try {
          const targetObject = this.pull(...args);
          if (checkPlainObject(targetObject)) {
            return Object.keys(targetObject);
          }
          return []; // If not an object, it has no keys.
        } catch (e) {
          return []; // If path doesn't exist, no keys.
        }
      } else {
        // Get keys of the top-level storage (or namespace).
        if (this.store instanceof CookieMimic) {
          const allCookies = document.cookie.split(';');
          const keys = [];
          for (let i = 0; i < allCookies.length; i++) {
            let cookie = allCookies[i].trim();
            const cookieNameEnd = cookie.indexOf('=');
            if (cookieNameEnd > -1) {
              const name = cookie.substring(0, cookieNameEnd);
              if (name.startsWith(this.store.keyPrefix)) {
                keys.push(name.substring(this.store.keyPrefix.length));
              }
            }
          }
          return keys;
        } else {
          const keys = [];
          for (let i = 0; i < this.store.length; i++) {
            keys.push(this.store.key(i));
          }
          return keys;
        }
      }
    }

    // Cookie-specific configuration methods (only applicable to CookieMimic instances).
    setExpiration(days) {
      if (this.store instanceof CookieMimic) {
        this.store.setExpiration(days);
      }
      return this;
    }
    setRoute(path) {
      if (this.store instanceof CookieMimic) {
        this.store.setRoute(path);
      }
      return this;
    }
    setWebDomain(domain) {
      if (this.store instanceof CookieMimic) {
        this.store.setWebDomain(domain);
      }
      return this;
    }
    configureSettings(settings) {
      if (this.store instanceof CookieMimic) {
        this.store.configureSettings(settings);
      }
      return this;
    }
    resetSettings() {
      if (this.store instanceof CookieMimic) {
        this.store.resetSettings();
      }
      return this;
    }
  }

  // --- Global Vault Instances and Namespace Management ---

  const globalVaults = {};
  const registeredDomainVaults = {}; // Registry of all created namespace instances.

  // Initialize the main storage access points (local, session, and universal cookie).
  if (supportsNativeStorage) {
    globalVaults.local = new DataVault(globalScope.localStorage, 'localStorage');
    globalVaults.session = new DataVault(globalScope.sessionStorage, 'sessionStorage');
  } else {
    // Fallback to cookie-based storage if native storage is unavailable.
    globalScope.localCookieVault = new CookieMimic({
      prefix: cookieLocalPrefix,
      expires: 365 * 10
    });
    globalScope.sessionCookieVault = new CookieMimic({
      prefix: cookieSessionPrefix
    });

    globalVaults.local = new DataVault(globalScope.localCookieVault, 'localCookieVault');
    globalVaults.session = new DataVault(globalScope.sessionCookieVault, 'sessionCookieVault');
  }

  // Universal cookie vault (always available if cookies are generally supported).
  globalScope.universalCookieVault = new CookieMimic();
  globalVaults.universalCookie = new DataVault(globalScope.universalCookieVault, 'universalCookieVault');


  // Function to create and register a new namespace vault.
  const establishDomain = (domainName) => {
    if (!domainName || typeof domainName !== 'string') {
      throw new Error('The initial parameter must be a string.');
    }

    // Ensure the top-level namespace key exists as an empty object in underlying storage.
    if (supportsNativeStorage) {
      if (globalScope.localStorage.getItem(domainName) === null) globalScope.localStorage.setItem(domainName, '{}');
      if (globalScope.sessionStorage.getItem(domainName) === null) globalScope.sessionStorage.setItem(domainName, '{}');
    } else {
      if (globalScope.localCookieVault.getEntry(domainName) === null) globalScope.localCookieVault.setEntry(domainName, '{}');
      if (globalScope.sessionCookieVault.getEntry(domainName) === null) globalScope.sessionCookieVault.setEntry(domainName, '{}');
    }

    if (globalVaults.universalCookie) {
      if (globalScope.universalCookieVault.getEntry(domainName) === null) globalScope.universalCookieVault.setEntry(domainName, '{}');
    }

    const domainCollection = {
      local: new DataVault(globalVaults.local.store, 'localStorage', domainName),
      session: new DataVault(globalVaults.session.store, 'sessionStorage', domainName),
    };

    if (globalVaults.universalCookie) {
      domainCollection.universalCookie = new DataVault(globalVaults.universalCookie.store, 'universalCookieVault', domainName);
      // Delegate cookie-specific configuration methods to the base cookie vault.
      domainCollection.universalCookie.setExpiration = function(e) {
        globalScope.universalCookieVault.setExpiration(e);
        return this;
      };
      domainCollection.universalCookie.setRoute = function(p) {
        globalScope.universalCookieVault.setRoute(p);
        return this;
      };
      domainCollection.universalCookie.setWebDomain = function(d) {
        globalScope.universalCookieVault.setWebDomain(d);
        return this;
      };
      domainCollection.universalCookie.configureSettings = function(c) {
        globalScope.universalCookieVault.configureSettings(c);
        return this;
      };
      domainCollection.universalCookie.resetSettings = function() {
        globalScope.universalCookieVault.resetSettings();
        return this;
      };
    }

    registeredDomainVaults[domainName] = domainCollection;
    return domainCollection;
  };

  // Function to remove all items from all storage types.
  const clearAllVaults = (reinitializeNamespaces = false) => {
    globalVaults.local.clearAll(reinitializeNamespaces);
    globalVaults.session.clearAll(reinitializeNamespaces);
    if (globalVaults.universalCookie) globalVaults.universalCookie.clearAll(reinitializeNamespaces);

    if (!reinitializeNamespaces) {
      // If not reinitializing, explicitly remove namespace data from base storages
      // and then clear the registry of namespace instances.
      for (const nsName in registeredDomainVaults) {
        if (Object.prototype.hasOwnProperty.call(registeredDomainVaults, nsName)) {
          globalVaults.local.obliterate(nsName);
          globalVaults.session.obliterate(nsName);
          if (globalVaults.universalCookie) globalVaults.universalCookie.obliterate(nsName);
        }
      }
      for (const nsName in registeredDomainVaults) {
        delete registeredDomainVaults[nsName];
      }
    }
  };

  // --- Export the API to the global scope ---
  const customStorageAPI = {
    localVault: globalVaults.local,
    sessionVault: globalVaults.session,
    createDomainVault: establishDomain,
    clearAllVaults: clearAllVaults,
    registeredDomainVaults: registeredDomainVaults
  };

  if (globalVaults.universalCookie) {
    customStorageAPI.universalCookieVault = globalVaults.universalCookie;
  }

  // Expose the custom storage API globally under a new name.
  globalScope.AppVault = customStorageAPI;

})(typeof window !== 'undefined' ? window : global);