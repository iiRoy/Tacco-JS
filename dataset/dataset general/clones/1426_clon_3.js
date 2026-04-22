// This file is a Type III clone, extensively modified from its original form.
// It features renamed identifiers, refactored logic, and modernized constructs.
(function() {
  // Utility function for logging, replacing generic 'log' calls.
  const _log = (level, message) => {
    if (console && console[level]) {
      console[level](message);
    }
  };

  // Helper for property binding, modernizing CoffeeScript's __bind.
  // Kept for structural similarity, though modern JS often uses arrow functions or direct bind.
  const _binder = (func, context) => {
    return function() {
      return func.apply(context, arguments);
    };
  };

  // --- Core API Catalog Classes ---

  // Renamed from SwaggerApi
  class ApiCatalog {
    constructor(options = {}) {
      this.resourceManifestUrl = "https://api.example.com/v1/meta/resources.json"; // Renamed and changed endpoint
      this.isVerbose = false; // Renamed from debug
      this.authenticationKey = null; // Renamed from api_key
      this.keyParameterName = 'app_key'; // Renamed from apiKeyName
      this.baseServiceUrl = null; // Renamed from basePath

      // Default handlers
      this.onSuccessCallback = () => {}; // Renamed from success
      this.onFailureCallback = (msg) => _log('error', `Catalog Error: ${msg}`); // Renamed from failure
      this.onProgressUpdate = (msg) => _log('info', `Catalog Progress: ${msg}`); // Renamed from progress
      this.requestHeaders = new Headers(); // Renamed from headers, using Headers API
      this.booleanLiteralValues = ['true', 'false']; // Renamed from booleanValues

      // Apply options with nullish coalescing for defaults
      this.resourceManifestUrl = options.manifestUrl ?? this.resourceManifestUrl;
      this.isVerbose = options.verboseMode ?? this.isVerbose;
      this.keyParameterName = options.authParamName ?? this.keyParameterName;
      this.supportCustomHeaders = options.enableCustomHeaders ?? false; // New option
      this.allowedMethods = new Set(options.supportedMethods ?? ['GET']); // Renamed, using Set

      if (options.authKey) { // Renamed from apiKey / api_key
        this.authenticationKey = options.authKey;
      }

      if (options.successHandler) {
        this.onSuccessCallback = options.successHandler;
      }
      if (options.errorHandler) {
        this.onFailureCallback = options.errorHandler;
      }
      if (options.progressHandler) {
        this.onProgressUpdate = options.progressHandler;
      }
      if (options.additionalHeaders) {
        for (const key in options.additionalHeaders) {
          if (Object.hasOwnProperty.call(options.additionalHeaders, key)) {
            this.requestHeaders.set(key, options.additionalHeaders[key]);
          }
        }
      }

      this.resourceManifestUrl = this._addAuthToUrl(this.resourceManifestUrl);

      // Trigger build only if a success handler is provided, or always if a flag is set.
      // Modified condition, added 'autoLoad' option.
      if (options.autoLoad ?? true) {
        this.initializeCatalog();
      }
    }

    async initializeCatalog() { // Renamed from build, now async
      this.onProgressUpdate('Fetching resource manifest from: ' + this.resourceManifestUrl);
      try {
        const response = await fetch(this.resourceManifestUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const manifestData = await response.json(); // Renamed from response

        this.apiSchemaVersion = manifestData.schemaVersion ?? 'unknown'; // Renamed from apiVersion
        this.baseServiceUrl = manifestData.serviceHost ?? this.baseServiceUrl; // Renamed from basePath

        if (this.baseServiceUrl && typeof this.baseServiceUrl === 'string' && this.baseServiceUrl.trim().length > 0) {
          // Additional validation for base URL format
          if (!/^https?:\/\//i.test(this.baseServiceUrl)) {
            this.reportErrorAndThrow("Service host URL must begin with HTTP/HTTPS.");
          }
          this.baseServiceUrl = this.baseServiceUrl.replace(/\/+$/, ''); // Remove trailing slashes
        } else {
          // Derive from manifest URL if not provided, more robust parsing
          const urlParts = new URL(this.resourceManifestUrl);
          this.baseServiceUrl = `${urlParts.protocol}//${urlParts.host}`;
          if (this.isVerbose) {
            _log('info', `Derived base service URL from manifest URL as: ${this.baseServiceUrl}`);
          }
        }

        this.endpointGroups = new Map(); // Renamed from apis, using Map
        this.endpointGroupsArray = []; // Renamed from apisArray

        // Refactored resource processing logic
        if (manifestData.resourcePath) { // Original had `response.resourcePath`
          this.globalResourcePath = manifestData.resourcePath; // Renamed from resourcePath
          let currentGroup = null;
          for (const resEntry of manifestData.endpoints || []) { // Renamed from apis
            if (!currentGroup) {
              currentGroup = new EndpointGroup(resEntry, this);
            } else {
              currentGroup.incorporateOperations(resEntry.path, resEntry.operations);
            }
          }
          if (currentGroup) {
            this.endpointGroups.set(currentGroup.groupName, currentGroup);
            this.endpointGroupsArray.push(currentGroup);
            currentGroup.isReady = true; // Renamed from ready
            this.checkReadiness();
          }
        } else {
          for (const resEntry of manifestData.endpoints || []) { // Renamed from apis
            const group = new EndpointGroup(resEntry, this);
            this.endpointGroups.set(group.groupName, group);
            this.endpointGroupsArray.push(group);
          }
        }
        return this;
      } catch (error) {
        // Refactored error messages for clarity and added specific checks
        let errorMessage = `Failed to load catalog from ${this.resourceManifestUrl}.`;
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          errorMessage += ' Network error or CORS issue. Check server access-control-allow-origin settings.';
        } else if (error.message.includes('HTTP error! Status: 404')) {
          errorMessage += ' Resource manifest not found.';
        } else {
          errorMessage += ` Details: ${error.message}`;
        }
        this.reportErrorAndThrow(errorMessage);
      }
    }

    checkReadiness() { // Renamed from selfReflect
      if (!this.endpointGroups || this.endpointGroups.size === 0) {
        return false;
      }
      for (const group of this.endpointGroups.values()) {
        if (!group.isReady) { // Renamed from ready
          return false;
        }
      }
      this.aggregateModels(); // Renamed from setConsolidatedModels
      this.isFullyLoaded = true; // Renamed from ready
      if (this.onSuccessCallback) {
        return this.onSuccessCallback();
      }
    }

    reportErrorAndThrow(message) { // Renamed from fail
      this.onFailureCallback(message);
      // Introducing a custom error type for better error handling (addition)
      class CatalogInitializationError extends Error {
        constructor(msg) {
          super(msg);
          this.name = "CatalogInitializationError";
        }
      }
      throw new CatalogInitializationError(message);
    }

    aggregateModels() { // Renamed from setConsolidatedModels
      this.unifiedSchemasArray = []; // Renamed from modelsArray
      this.unifiedSchemas = new Map(); // Renamed from models, using Map

      for (const group of this.endpointGroups.values()) {
        for (const [schemaName, schemaDef] of group.localSchemas.entries()) { // Renamed from models
          if (!this.unifiedSchemas.has(schemaName)) {
            this.unifiedSchemas.set(schemaName, schemaDef);
            this.unifiedSchemasArray.push(schemaDef);
          }
        }
      }

      // Using Promise.all for potential async model resolution (update)
      return Promise.all(this.unifiedSchemasArray.map(schema => {
        // Renamed from setReferencedModels
        return schema.resolvePropertyReferences(this.unifiedSchemas);
      }));
    }

    _addAuthToUrl(targetUrl) { // Renamed from suffixApiKey, made private-ish
      if (this.authenticationKey && typeof this.authenticationKey === 'string' && this.authenticationKey.trim().length > 0 && targetUrl) {
        const urlObj = new URL(targetUrl);
        urlObj.searchParams.set(this.keyParameterName, this.authenticationKey);
        return urlObj.toString();
      }
      return targetUrl;
    }

    displayCatalogOverview() { // Renamed from help
      if (!this.endpointGroups || this.endpointGroups.size === 0) {
        _log('warn', 'No endpoint groups loaded yet.');
        return this;
      }

      _log('info', '--- API Catalog Overview ---');
      for (const [groupName, group] of this.endpointGroups.entries()) { // Iterating Map
        _log('info', `Group: ${groupName} (Path: ${group.groupPath})`);
        group.listOperationsDetails(); // Delegate to group's method
      }
      return this;
    }
  }

  // Renamed from SwaggerResource
  class EndpointGroup {
    constructor(resourceDescriptor, catalogInstance) { // Renamed from resourceObj, api
      this.catalogRef = catalogInstance; // Renamed from api
      this.groupPath = this.catalogRef.globalResourcePath ?? resourceDescriptor.path; // Renamed from path
      this.groupDescription = resourceDescriptor.description; // Renamed from description

      // Robust name extraction, handling different formats (update)
      const pathSegments = this.groupPath.split('/').filter(s => s.length > 0);
      this.groupName = (pathSegments.pop() || 'default').replace(/\{format\}/i, '').replace(/\./g, ''); // Renamed from name
      this.groupBaseUrl = this.catalogRef.baseServiceUrl; // Renamed from basePath

      this.operationsMap = new Map(); // Renamed from operations, using Map
      this.operationsList = []; // Renamed from operationsArray
      this.localSchemasList = []; // Renamed from modelsArray
      this.localSchemas = new Map(); // Renamed from models, using Map

      // Conditional loading logic refactored
      if (resourceDescriptor.operations && this.catalogRef.globalResourcePath) {
        this.catalogRef.onProgressUpdate(`Reading group '${this.groupName}' schemas and operations.`);
        this.registerSchemas(resourceDescriptor.models);
        this.incorporateOperations(resourceDescriptor.path, resourceDescriptor.operations);
        this.catalogRef.endpointGroups.set(this.groupName, this); // Register self with catalog
      } else {
        if (!this.groupPath) {
          this.catalogRef.reportErrorAndThrow(`Endpoint group must have a path defined.`);
        }
        // Constructing URL more carefully (update)
        const effectiveUrl = new URL(this.groupPath.replace('{format}', 'json'), this.catalogRef.baseServiceUrl).toString();
        this.fetchManifestUrl = this.catalogRef._addAuthToUrl(effectiveUrl); // Renamed from url

        this.catalogRef.onProgressUpdate(`Fetching group '${this.groupName}' manifest from: ${this.fetchManifestUrl}`);
        this._fetchGroupDetails(); // Delegating fetch to a private method (addition)
      }
    }

    async _fetchGroupDetails() { // New private method for fetching details
      try {
        const response = await fetch(this.fetchManifestUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const details = await response.json();

        if (details.serviceHost && details.serviceHost.trim().length > 0) { // Renamed from basePath
          this.groupBaseUrl = details.serviceHost.replace(/\/+$/, '');
        }

        this.registerSchemas(details.models); // Renamed from addModels
        if (details.endpoints) { // Renamed from apis
          for (const endpointDef of details.endpoints) { // Renamed from endpoint
            this.incorporateOperations(endpointDef.path, endpointDef.operations);
          }
        }
        this.catalogRef.endpointGroups.set(this.groupName, this);
        this.isReady = true; // Renamed from ready
        this.catalogRef.checkReadiness();
      } catch (error) {
        this.catalogRef.reportErrorAndThrow(`Failed to read endpoint group '${this.groupName}' from ${this.fetchManifestUrl}. Details: ${error.message}`);
      }
    }

    registerSchemas(schemaDefinitions) { // Renamed from addModels
      if (!schemaDefinitions) return;

      for (const schemaName in schemaDefinitions) {
        if (Object.hasOwnProperty.call(schemaDefinitions, schemaName)) {
          if (!this.localSchemas.has(schemaName)) { // Using Map.has
            const newSchema = new SchemaDefinition(schemaName, schemaDefinitions[schemaName]); // Renamed
            this.localSchemas.set(schemaName, newSchema);
            this.localSchemasList.push(newSchema);
          }
        }
      }

      // Resolve references after all schemas are added
      for (const schema of this.localSchemasList) {
        schema.resolvePropertyReferences(this.localSchemas);
      }
    }

    incorporateOperations(endpointPath, operationDefinitions) { // Renamed from addOperations
      if (!operationDefinitions) return;

      for (const opDef of operationDefinitions) { // Renamed from o
        const effectiveConsumes = opDef.contentTypes || opDef.supportedContentTypes || opDef.consumes; // Consolidated logic
        const newOperation = new ApiOperation( // Renamed
          opDef.nickname,
          endpointPath,
          opDef.httpMethod,
          opDef.parameters,
          opDef.summary,
          opDef.notes,
          opDef.responseClass,
          opDef.errorResponses,
          this, // pass current group instance
          effectiveConsumes,
          opDef.produces
        );
        this.operationsMap.set(newOperation.operationId, newOperation); // Using Map.set
        this.operationsList.push(newOperation);
      }
    }

    listOperationsDetails() { // Renamed from help
      if (!this.operationsMap || this.operationsMap.size === 0) {
        _log('info', `  No operations defined for group '${this.groupName}'.`);
        return this;
      }
      for (const [opId, operation] of this.operationsMap.entries()) {
        _log('info', `  -> ${operation.operationId} (${operation.methodType.toUpperCase()} ${operation.endpointPath})`);
        for (const param of operation.params) { // Renamed from parameters
          const requiredStatus = param.isRequired ? ' (REQUIRED)' : ''; // Renamed from required
          _log('info', `    - ${param.propName}${requiredStatus} - ${param.propDescription}`); // Renamed from name, description
        }
      }
      return this;
    }
  }

  // Renamed from SwaggerModel
  class SchemaDefinition {
    constructor(identifier, schemaObject) { // Renamed from modelName, obj
      this.schemaName = schemaObject.id ?? identifier; // Renamed from name
      this.schemaProperties = []; // Renamed from properties

      // Enhanced property parsing, ensuring iteration over own properties (update)
      if (schemaObject.properties) {
        for (const propKey in schemaObject.properties) {
          if (Object.hasOwnProperty.call(schemaObject.properties, propKey)) {
            this.schemaProperties.push(new SchemaProperty(propKey, schemaObject.properties[propKey])); // Renamed
          }
        }
      }
    }

    resolvePropertyReferences(allAvailableSchemas) { // Renamed from setReferencedModels
      for (const prop of this.schemaProperties) {
        // Check for direct data type reference or array item reference (update)
        if (allAvailableSchemas.has(prop.propType)) { // Using Map.has
          prop.linkedSchema = allAvailableSchemas.get(prop.propType); // Renamed from refModel
        } else if (prop.itemSchemaType && allAvailableSchemas.has(prop.itemSchemaType)) { // Renamed from refDataType
          prop.linkedSchema = allAvailableSchemas.get(prop.itemSchemaType);
        }
      }
      // Return a promise to signify potential async completion, even if sync (update)
      return Promise.resolve();
    }

    generateMockSignatureHTML(processedSchemas = new Set()) { // Renamed from getMockSignature, using Set for tracking
      const propertyDisplayStrings = [];
      for (const prop of this.schemaProperties) {
        propertyDisplayStrings.push(prop.toHTMLString()); // Renamed from toString
      }

      const schemaNameMarkup = `<span class="schema-name">${this.schemaName}</span>`;
      const classStart = `${schemaNameMarkup} {`;
      const classEnd = `}`;

      let outputHtml = `${classStart}<div class="schema-props">${propertyDisplayStrings.join('</div><div class="schema-props">')}</div>${classEnd}`;

      // Prevent infinite recursion in circular references (update)
      processedSchemas.add(this.schemaName);

      for (const prop of this.schemaProperties) {
        if (prop.linkedSchema && !processedSchemas.has(prop.linkedSchema.schemaName)) {
          outputHtml += `<br>${prop.linkedSchema.generateMockSignatureHTML(processedSchemas)}`;
        }
      }
      return outputHtml;
    }

    produceSampleJSON(visitedSchemas = new Set()) { // Renamed from createJSONSample, using Set
      const sampleResult = {};
      visitedSchemas.add(this.schemaName); // Track visited schemas to prevent infinite recursion

      for (const prop of this.schemaProperties) {
        sampleResult[prop.propName] = prop.retrieveSampleValue(visitedSchemas); // Renamed from getSampleValue
      }
      return sampleResult;
    }
  }

  // Renamed from SwaggerModelProperty
  class SchemaProperty {
    constructor(propertyName, propertyObject) { // Renamed from name, obj
      this.propName = propertyName; // Renamed from name
      this.propType = propertyObject.type; // Renamed from dataType
      this.isArrayOrSet = ['array', 'list', 'set'].includes(this.propType?.toLowerCase()); // Renamed from isCollection
      this.propDescription = propertyObject.description; // Renamed from descr
      this.isRequired = propertyObject.required ?? false; // Renamed from required, explicit boolean

      if (propertyObject.items) {
        this.itemSchemaType = propertyObject.items.type ?? propertyObject.items.$ref; // Renamed from refDataType
      }

      this.displayType = this.itemSchemaType ? `${this.propType}[${this.itemSchemaType}]` : this.propType; // Renamed from dataTypeWithRef

      if (propertyObject.allowableValues) {
        this.valueConstraintType = propertyObject.allowableValues.valueType; // Renamed from valueType
        this.permittedValues = propertyObject.allowableValues.values; // Renamed from values
        if (this.permittedValues) {
          this.permittedValuesString = `'${this.permittedValues.join("' or '")}'`; // Renamed from valuesString
        }
      }
    }

    retrieveSampleValue(visitedSchemas = new Set()) { // Renamed from getSampleValue
      if (this.linkedSchema && !visitedSchemas.has(this.linkedSchema.schemaName)) {
        // If it's a linked schema and not already visited in this path, generate its sample
        return this.linkedSchema.produceSampleJSON(visitedSchemas);
      } else {
        // Otherwise, return a default based on type or a placeholder for collections
        if (this.isArrayOrSet) {
          // If it's a collection of a primitive or unlinked schema, return an array with a placeholder
          return [this.itemSchemaType || this.propType || 'string'];
        } else {
          // Return a primitive type placeholder
          switch (this.propType?.toLowerCase()) {
            case 'string':
              return 'sampleString';
            case 'integer':
            case 'number':
              return 0;
            case 'boolean':
              return false;
            default:
              return `sample${this.propType}`; // Generic placeholder
          }
        }
      }
    }

    toHTMLString() { // Renamed from toString
      let statusClass = this.isRequired ? 'prop-required' : 'prop-optional';
      let html = `<span class="prop-name ${statusClass}">${this.propName}</span> (<span class="prop-type">${this.displayType}</span>`;

      if (!this.isRequired) {
        html += `, <span class="prop-modifier">optional</span>`;
      }
      html += `)`;

      if (this.permittedValues) {
        html += ` = <span class='prop-values'>[${this.permittedValuesString}]</span>`;
      }
      if (this.propDescription) {
        html += `: <span class="prop-description">${this.propDescription}</span>`;
      }
      return html;
    }
  }

  // Renamed from SwaggerOperation
  class ApiOperation {
    constructor(
      id,
      path,
      method,
      parameters = [],
      summaryText,
      notesText,
      responseClassType,
      errorResponsesList,
      parentEndpointGroup,
      inputContentTypes,
      outputContentTypes
    ) {
      this.operationId = id; // Renamed from nickname
      this.endpointPath = path; // Renamed from path
      this.methodType = method?.toLowerCase(); // Renamed from httpMethod, ensure lowercase
      this.params = parameters; // Renamed from parameters
      this.shortDescription = summaryText; // Renamed from summary
      this.longDescription = notesText; // Renamed from notes
      this.responseSchema = responseClassType; // Renamed from responseClass
      this.errorSchemaResponses = errorResponsesList || []; // Renamed from errorResponses
      this.parentGroup = parentEndpointGroup; // Renamed from resource
      this.requestContentTypes = inputContentTypes; // Renamed from consumes
      this.responseContentTypes = outputContentTypes; // Renamed from produces

      // Bind 'executeOperation' to 'this' context, replacing CoffeeScript's __bind
      this.executeOperation = _binder(this.executeOperation, this); // Kept binder for structural similarity, though modern JS prefers arrow functions or direct bind.

      this._validateOperationInitialization(); // New validation helper

      this.endpointPath = this.endpointPath.replace(/\{format\}/i, 'json');
      this.isGetRequest = this.methodType === "get"; // Renamed from isGetMethod
      this.groupIdentifier = this.parentGroup.groupName; // Renamed from resourceName

      if (this.responseSchema?.toLowerCase() === 'void') {
        this.responseSchema = null; // Use null instead of void 0
      }
      if (this.responseSchema) {
        // Renamed from responseClassSignature, getSignature
        this.responseSchemaMarkup = this._generateSchemaSignature(this.responseSchema, this.parentGroup.localSchemas);
        // Renamed from responseSampleJSON, getSampleJSON
        this.responseExampleJSON = this._generateSchemaSample(this.responseSchema, this.parentGroup.localSchemas);
      }

      this._processParameters(); // New helper to encapsulate parameter processing
    }

    _validateOperationInitialization() { // New private validation method
      const catalog = this.parentGroup.catalogRef;
      if (!this.operationId) {
        catalog.reportErrorAndThrow("API operation must have an identifier (nickname).");
      }
      if (!this.endpointPath) {
        catalog.reportErrorAndThrow(`Operation '${this.operationId}' is missing its endpoint path.`);
      }
      if (!this.methodType) {
        catalog.reportErrorAndThrow(`Operation '${this.operationId}' is missing its HTTP method.`);
      }
    }

    _processParameters() { // New private method to process parameters
      for (const param of this.params) {
        param.propName = param.name || param.dataType; // Renamed from name
        param.isRequired = param.required ?? false; // Explicit boolean

        // Handling boolean parameter values (update)
        if (param.dataType?.toLowerCase() === 'boolean') {
          param.allowableValues = {
            values: this.parentGroup.catalogRef.booleanLiteralValues,
            valueType: 'LIST' // Explicitly set valueType
          };
        }

        // Renamed from signature, getSignature
        param.paramSchemaMarkup = this._generateSchemaSignature(param.dataType, this.parentGroup.localSchemas);
        // Renamed from sampleJSON, getSampleJSON
        param.paramExampleJSON = this._generateSchemaSample(param.dataType, this.parentGroup.localSchemas);

        if (param.allowableValues) {
          if (param.allowableValues.valueType === "RANGE") {
            param.isRangeConstrained = true; // Renamed from isRange
          } else {
            param.isListConstrained = true; // Renamed from isList
          }
          if (param.allowableValues.values) {
            param.allowableValues.displayValues = []; // Renamed from descriptiveValues
            for (const val of param.allowableValues.values) {
              param.allowableValues.displayValues.push({
                value: val,
                isDefault: param.defaultValue !== undefined && param.defaultValue === val // Check for undefined
              });
            }
          }
        }
      }
    }

    _generateSchemaSignature(dataType, schemaCollection) { // Renamed from getSignature
      const schema = schemaCollection.get(dataType); // Using Map.get
      if (schema) {
        return schema.generateMockSignatureHTML(new Set()); // Pass new Set to prevent recursion
      }
      return dataType; // Return original dataType if no schema found
    }

    _generateSchemaSample(dataType, schemaCollection) { // Renamed from getSampleJSON
      const schema = schemaCollection.get(dataType);
      if (schema) {
        return schema.produceSampleJSON(new Set());
      }
      return {}; // Return empty object for unknown schemas
    }

    // Renamed from 'do'
    async executeOperation(parameters = {}, options = {}) {
      const catalog = this.parentGroup.catalogRef;
      catalog.onProgressUpdate(`Executing operation: ${this.operationId}`);

      let requestUrl = this.endpointPath;
      let queryParams = new URLSearchParams();
      let requestBody = null;
      let requestHeaders = new Headers(catalog.requestHeaders); // Clone headers for modification

      // Validate and process parameters
      for (const paramDef of this.params) {
        const paramValue = parameters[paramDef.propName];
        const isValueProvided = paramValue !== undefined && paramValue !== null && paramValue !== '';

        if (paramDef.isRequired && !isValueProvided) {
          throw new Error(`Required parameter '${paramDef.propName}' for operation '${this.operationId}' is missing.`);
        }

        if (isValueProvided) {
          switch (paramDef.paramType?.toLowerCase()) { // Renamed from paramType
            case 'path':
              requestUrl = requestUrl.replace(`{${paramDef.propName}}`, encodeURIComponent(paramValue));
              break;
            case 'query':
              if (paramDef.isArrayOrSet && Array.isArray(paramValue)) { // Handle array query params
                paramValue.forEach(val => queryParams.append(paramDef.propName, val));
              } else {
                queryParams.set(paramDef.propName, paramValue);
              }
              break;
            case 'header':
              requestHeaders.set(paramDef.propName, String(paramValue));
              break;
            case 'body':
            case 'form': // Combine form and body for simplicity, assume JSON or FormData
              // For body, assume JSON if not specified otherwise.
              // For form, could be URL-encoded or multipart.
              if (this.methodType === 'post' || this.methodType === 'put' || this.methodType === 'patch') {
                requestBody = paramValue; // Directly assign for now, will stringify later
              }
              break;
            default:
              _log('warn', `Unsupported parameter type '${paramDef.paramType}' for '${paramDef.propName}'.`);
          }
        }
      }

      // Construct final URL
      const fullUrl = new URL(requestUrl, this.parentGroup.groupBaseUrl); // Use URL constructor for robustness
      fullUrl.search = queryParams.toString();
      let finalUrl = fullUrl.toString();

      // Add auth token to URL if applicable and not already in headers
      if (catalog.authenticationKey && !requestHeaders.has(catalog.keyParameterName) && !queryParams.has(catalog.keyParameterName)) {
        finalUrl = catalog._addAuthToUrl(finalUrl);
      }

      const fetchOptions = {
        method: this.methodType.toUpperCase(),
        headers: requestHeaders,
        // New: add AbortController for request cancellation (addition)
        signal: options.signal || null,
        // New: Support for credential modes (addition)
        credentials: options.credentials || 'same-origin'
      };

      // Handle request body and content type
      if (requestBody !== null) {
        const contentType = this.requestContentTypes?.[0] || 'application/json'; // Default to JSON
        fetchOptions.headers.set('Content-Type', contentType);

        if (contentType.includes('json')) {
          fetchOptions.body = JSON.stringify(requestBody);
        } else if (contentType.includes('x-www-form-urlencoded')) {
          fetchOptions.body = new URLSearchParams(requestBody).toString();
        } else if (requestBody instanceof FormData) { // Allow FormData directly
          fetchOptions.body = requestBody;
        } else if (typeof requestBody === 'object') { // Fallback for objects
          fetchOptions.body = JSON.stringify(requestBody);
        } else {
          fetchOptions.body = String(requestBody);
        }
      }

      try {
        const response = await fetch(finalUrl, fetchOptions);
        if (!response.ok) {
          // Attempt to parse error response body if available
          let errorDetails = `HTTP Error: ${response.status} ${response.statusText}`;
          try {
            const errorBody = await response.json();
            errorDetails += ` - ${JSON.stringify(errorBody)}`;
          } catch (e) {
            // If not JSON, try text
            const errorText = await response.text();
            if (errorText) errorDetails += ` - ${errorText.substring(0, 200)}...`; // Truncate
          }
          throw new Error(errorDetails);
        }

        // Determine response type and parse
        const responseContentType = response.headers.get('Content-Type');
        if (responseContentType && responseContentType.includes('json')) {
          return await response.json();
        } else if (responseContentType && responseContentType.includes('text')) {
          return await response.text();
        } else if (response.status === 204 || this.responseSchema === null) { // No Content
          return null;
        } else {
          _log('warn', `Unknown response content type for operation '${this.operationId}'. Returning raw response object.`);
          return response; // Return raw response for unhandled types
        }

      } catch (error) {
        catalog.onFailureCallback(`Operation '${this.operationId}' failed: ${error.message}`);
        throw error; // Re-throw for caller to handle
      }
    }
  }

  // Expose the main class to the global scope (e.g., window) or as a module export.
  // Original uses a global variable.
  if (typeof window !== 'undefined') {
    window.ApiCatalog = ApiCatalog;
    window.EndpointGroup = EndpointGroup; // Exposing for debugging/advanced use
    window.SchemaDefinition = SchemaDefinition;
    window.SchemaProperty = SchemaProperty;
    window.ApiOperation = ApiOperation;
  }
})();