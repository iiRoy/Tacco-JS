/*
 * This file contains a Type I clone of a JavaScript code snippet.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to make the code look visually different while maintaining identical functionality.
 *
 */

( function () {

    var SwaggerApi, SwaggerModel, SwaggerModelProperty, SwaggerOperation, SwaggerRequest, SwaggerResource,

        /*
         * Helper function to bind a function's context.
         * This ensures `this` refers to the correct object within the function.
         */
        __bind = function ( fn, me ) {
            return function () {
                return fn.apply( me, arguments );
            };
        };

    // Definition of the SwaggerApi class.
    SwaggerApi = ( function () {

        // Default URL for discovering API resources.
        SwaggerApi.prototype.discoveryUrl = "http://api.wordnik.com/v4/resources.json";

        // Debug mode flag.
        SwaggerApi.prototype.debug = false;

        // API key for authentication.
        SwaggerApi.prototype.api_key = null;

        // Base path for the API.
        SwaggerApi.prototype.basePath = null;

        /*
         * Constructor for SwaggerApi.
         * Initializes the API client with various options.
         *
         * @param {Object} options - Configuration options for the API.
         */
        function SwaggerApi( options ) {

            if ( options == null ) {

                options = {};

            }

            // Set discovery URL if provided in options.
            if ( options.discoveryUrl != null ) {

                this.discoveryUrl = options.discoveryUrl;

            }

            // Set debug flag if provided.
            if ( options.debug != null ) {

                this.debug = options.debug;

            }

            // Determine API key name, default to 'api_key'.
            this.apiKeyName = options.apiKeyName != null ? options.apiKeyName : 'api_key';

            // Set API key from options, checking both 'apiKey' and 'api_key'.
            if ( options.apiKey != null ) {

                this.api_key = options.apiKey;

            }

            if ( options.api_key != null ) {

                this.api_key = options.api_key;

            }

            // Set verbose flag if provided.
            if ( options.verbose != null ) {

                this.verbose = options.verbose;

            }

            // Support for header parameters.
            this.supportHeaderParams = options.supportHeaderParams != null ? options.supportHeaderParams : false;

            // Supported HTTP methods for submission.
            this.supportedSubmitMethods = options.supportedSubmitMethods != null ? options.supportedSubmitMethods : [ 'get' ];

            // Callback for successful API initialization.
            if ( options.success != null ) {

                this.success = options.success;

            }

            // Callback for API initialization failure.
            this.failure = options.failure != null ? options.failure : function () {
            };

            // Callback for progress updates.
            this.progress = options.progress != null ? options.progress : function () {
            };

            // Custom headers to be sent with requests.
            this.headers = options.headers != null ? options.headers : {};

            // Boolean values recognized by the API.
            this.booleanValues = options.booleanValues != null ? options.booleanValues : new Array( 'true', 'false' );

            // Suffix the API key to the discovery URL.
            this.discoveryUrl = this.suffixApiKey( this.discoveryUrl );

            // If a success callback is provided, immediately start building the API.
            if ( options.success != null ) {

                this.build();

            }

        }

        /*
         * Initiates the API discovery process.
         * Fetches the resource list from the discovery URL.
         */
        SwaggerApi.prototype.build = function () {

            var _this = this;

            this.progress( 'fetching resource list: ' + this.discoveryUrl );

            // Use jQuery to fetch the JSON resource list.
            return jQuery.getJSON( this.discoveryUrl, function ( response ) {

                var res, resource, _i, _j, _len, _len1, _ref, _ref1;

                // Determine basePath from response or discovery URL.
                if ( ( response.basePath != null ) && jQuery.trim( response.basePath ).length > 0 ) {

                    _this.basePath = response.basePath;

                    if ( _this.basePath.match( /^HTTP/i ) == null ) {

                        _this.fail( "discoveryUrl basePath must be a URL." );

                    }

                    _this.basePath = _this.basePath.replace( /\/$/, '' );

                } else {

                    _this.basePath = _this.discoveryUrl.substring( 0, _this.discoveryUrl.lastIndexOf( '/' ) );

                    log( 'derived basepath from discoveryUrl as ' + _this.basePath );

                }

                _this.resources = {};

                _this.resourcesArray = [];

                // Process resources based on whether resourcePath is defined.
                if ( response.resourcePath != null ) {

                    _this.resourcePath = response.resourcePath;

                    res = null;

                    _ref = response.apis;

                    for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                        resource = _ref[ _i ];

                        if ( res === null ) {

                            res = new SwaggerResource( resource, _this );

                        } else {

                            res.addOperations( resource.path, resource.operations );

                        }

                    }

                    if ( res != null ) {

                        _this.resources[ res.name ] = res;

                        _this.resourcesArray.push( res );

                        res.ready = true;

                        _this.selfReflect();

                    }

                } else {

                    _ref1 = response.apis;

                    for ( _j = 0, _len1 = _ref1.length; _j < _len1; _j ++ ) {

                        resource = _ref1[ _j ];

                        res = new SwaggerResource( resource, _this );

                        _this.resources[ res.name ] = res;

                        _this.resourcesArray.push( res );

                    }

                }

                return _this;

            } ).error( function ( error ) {

                // Handle errors during resource list fetching.
                return _this.fail( error.status + ' : ' + error.statusText + ' ' + _this.discoveryUrl );

            } );

        };

        /*
         * Checks if all resources are ready and then processes models.
         */
        SwaggerApi.prototype.selfReflect = function () {

            var resource, resource_name, _ref;

            if ( this.resources == null ) {

                return false;

            }

            _ref = this.resources;

            for ( resource_name in _ref ) {

                resource = _ref[ resource_name ];

                if ( resource.ready == null ) {

                    return false;

                }

            }

            this.setConsolidatedModels();

            this.ready = true;

            if ( this.success != null ) {

                return this.success();

            }

        };

        /*
         * Handles API failure by calling the failure callback and throwing an error.
         *
         * @param {string} message - The error message.
         */
        SwaggerApi.prototype.fail = function ( message ) {

            this.failure( message );

            throw message;

        };

        /*
         * Consolidates models from all discovered resources.
         */
        SwaggerApi.prototype.setConsolidatedModels = function () {

            var model, modelName, resource, resource_name, _i, _len, _ref, _ref1, _results;

            this.modelsArray = [];

            this.models = {};

            _ref = this.resources;

            for ( resource_name in _ref ) {

                resource = _ref[ resource_name ];

                for ( modelName in resource.models ) {

                    if ( ! ( this.models[ modelName ] != null ) ) {

                        this.models[ modelName ] = resource.models[ modelName ];

                        this.modelsArray.push( resource.models[ modelName ] );

                    }

                }

            }

            _ref1 = this.modelsArray;

            _results = [];

            for ( _i = 0, _len = _ref1.length; _i < _len; _i ++ ) {

                model = _ref1[ _i ];

                _results.push( model.setReferencedModels( this.models ) );

            }

            return _results;

        };

        /*
         * Appends the API key to a given URL if available.
         *
         * @param {string} url - The URL to modify.
         * @returns {string} The modified URL with the API key.
         */
        SwaggerApi.prototype.suffixApiKey = function ( url ) {

            var sep;

            if ( ( this.api_key != null ) && jQuery.trim( this.api_key ).length > 0 && ( url != null ) ) {

                sep = url.indexOf( '?' ) > 0 ? '&' : '?';

                return url + sep + this.apiKeyName + '=' + this.api_key;

            } else {

                return url;

            }

        };

        /*
         * Provides a console log of all available resources and their operations.
         * This is intended for debugging and exploration.
         */
        SwaggerApi.prototype.help = function () {

            var operation, operation_name, parameter, resource, resource_name, _i, _len, _ref, _ref1, _ref2;

            _ref = this.resources;

            for ( resource_name in _ref ) {

                resource = _ref[ resource_name ];

                console.log( resource_name );

                _ref1 = resource.operations;

                for ( operation_name in _ref1 ) {

                    operation = _ref1[ operation_name ];

                    console.log( "  " + operation.nickname );

                    _ref2 = operation.parameters;

                    for ( _i = 0, _len = _ref2.length; _i < _len; _i ++ ) {

                        parameter = _ref2[ _i ];

                        console.log( "    " + parameter.name + ( parameter.required ? ' (required)' : '' ) + " - " + parameter.description );

                    }

                }

            }

            return this;

        };

        return SwaggerApi;

    } )();

    // Definition of the SwaggerResource class.
    SwaggerResource = ( function () {

        /*
         * Constructor for SwaggerResource.
         * Represents a single resource (e.g., /users, /products) in the API.
         *
         * @param {Object} resourceObj - The raw resource object from the API definition.
         * @param {SwaggerApi} api - The parent SwaggerApi instance.
         */
        function SwaggerResource( resourceObj, api ) {

            var parts,

                _this = this;

            this.api = api;

            this.path = this.api.resourcePath != null ? this.api.resourcePath : resourceObj.path;

            this.description = resourceObj.description;

            parts = this.path.split( "/" );

            this.name = parts[ parts.length - 1 ].replace( '.{format}', '' );

            this.basePath = this.api.basePath;

            this.operations = {};

            this.operationsArray = [];

            this.modelsArray = [];

            this.models = {};

            // If resourcePath is defined, operations and models are already available.
            if ( ( resourceObj.operations != null ) && ( this.api.resourcePath != null ) ) {

                this.api.progress( 'reading resource ' + this.name + ' models and operations' );

                this.addModels( resourceObj.models );

                this.addOperations( resourceObj.path, resourceObj.operations );

                this.api[ this.name ] = this;

            } else {

                // Otherwise, fetch the resource definition from its URL.
                if ( this.path == null ) {

                    this.api.fail( "SwaggerResources must have a path." );

                }

                this.url = this.api.suffixApiKey( this.api.basePath + this.path.replace( '{format}', 'json' ) );

                this.api.progress( 'fetching resource ' + this.name + ': ' + this.url );

                jQuery.getJSON( this.url, function ( response ) {

                    var endpoint, _i, _len, _ref;

                    if ( ( response.basePath != null ) && jQuery.trim( response.basePath ).length > 0 ) {

                        _this.basePath = response.basePath;

                        _this.basePath = _this.basePath.replace( /\/$/, '' );

                    }

                    _this.addModels( response.models );

                    if ( response.apis ) {

                        _ref = response.apis;

                        for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                            endpoint = _ref[ _i ];

                            _this.addOperations( endpoint.path, endpoint.operations );

                        }

                    }

                    _this.api[ _this.name ] = _this;

                    _this.ready = true;

                    return _this.api.selfReflect();

                } ).error( function ( error ) {

                    return _this.api.fail( error.status + ' : ' + error.statusText + ' ' + _this.url );

                } );

            }

        }

        /*
         * Adds models defined within this resource to its collection.
         *
         * @param {Object} models - A map of model definitions.
         */
        SwaggerResource.prototype.addModels = function ( models ) {

            var model, modelName, swaggerModel, _i, _len, _ref, _results;

            if ( models != null ) {

                for ( modelName in models ) {

                    swaggerModel = new SwaggerModel( modelName, models[ modelName ] );

                    this.modelsArray.push( swaggerModel );

                    this.models[ modelName ] = swaggerModel;

                }

                _ref = this.modelsArray;

                _results = [];

                for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                    model = _ref[ _i ];

                    _results.push( model.setReferencedModels( this.models ) );

                }

                return _results;

            }

        };

        /*
         * Adds operations defined within this resource.
         *
         * @param {string} resource_path - The path of the resource.
         * @param {Array} ops - An array of operation definitions.
         */
        SwaggerResource.prototype.addOperations = function ( resource_path, ops ) {

            var o, op, _i, _len, _results;

            if ( ops ) {

                _results = [];

                for ( _i = 0, _len = ops.length; _i < _len; _i ++ ) {

                    o = ops[ _i ];

                    op = new SwaggerOperation( o.nickname, resource_path, o.httpMethod, o.parameters, o.summary, o.notes, o.responseClass, this );

                    this.operations[ op.nickname ] = op;

                    _results.push( this.operationsArray.push( op ) );

                }

                return _results;

            }

        };

        /*
         * Provides a console log of all operations within this resource.
         */
        SwaggerResource.prototype.help = function () {

            var operation, operation_name, parameter, _i, _len, _ref, _ref1;

            _ref = this.operations;

            for ( operation_name in _ref ) {

                operation = _ref[ operation_name ];

                console.log( "  " + operation.nickname );

                _ref1 = operation.parameters;

                for ( _i = 0, _len = _ref1.length; _i < _len; _i ++ ) {

                    parameter = _ref1[ _i ];

                    console.log( "    " + parameter.name + ( parameter.required ? ' (required)' : '' ) + " - " + parameter.description );

                }

            }

            return this;

        };

        return SwaggerResource;

    } )();

    // Definition of the SwaggerModel class.
    SwaggerModel = ( function () {

        /*
         * Constructor for SwaggerModel.
         * Represents a data model defined in the API.
         *
         * @param {string} modelName - The name of the model.
         * @param {Object} obj - The raw model definition object.
         */
        function SwaggerModel( modelName, obj ) {

            var propertyName;

            this.name = obj.id != null ? obj.id : modelName;

            this.properties = [];

            for ( propertyName in obj.properties ) {

                this.properties.push( new SwaggerModelProperty( propertyName, obj.properties[ propertyName ] ) );

            }

        }

        /*
         * Sets references to other models for properties that are complex types.
         *
         * @param {Object} allModels - A map of all available SwaggerModel instances.
         */
        SwaggerModel.prototype.setReferencedModels = function ( allModels ) {

            var prop, _i, _len, _ref, _results;

            _ref = this.properties;

            _results = [];

            for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                prop = _ref[ _i ];

                if ( allModels[ prop.dataType ] != null ) {

                    _results.push( prop.refModel = allModels[ prop.dataType ] );

                } else if ( ( prop.refDataType != null ) && ( allModels[ prop.refDataType ] != null ) ) {

                    _results.push( prop.refModel = allModels[ prop.refDataType ] );

                } else {

                    _results.push( void 0 );

                }

            }

            return _results;

        };

        /*
         * Generates a mock signature for the model, useful for documentation.
         *
         * @param {string} prefix - Optional prefix for the model name.
         * @param {SwaggerModel} modelToIgnore - A model to avoid infinite recursion.
         * @returns {string} An HTML string representing the model's structure.
         */
        SwaggerModel.prototype.getMockSignature = function ( prefix, modelToIgnore ) {

            var classClose, classOpen, prop, propertiesStr, returnVal, strong, strongClose, stronger, _i, _j, _len, _len1, _ref, _ref1;

            propertiesStr = [];

            _ref = this.properties;

            for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                prop = _ref[ _i ];

                propertiesStr.push( prop.name + ': <tag>' + prop.dataType + '</tag>' );

            }

            strong = '<span style="font-weight: bold; color: #000; font-size: 1.0em">';

            stronger = '<span style="font-weight: bold; color: #000; font-size: 1.1em">';

            strongClose = '</span>';

            classOpen = strong + ' ' + ( prefix != null ? prefix : this.name ) + ' ( ' + strongClose;

            classClose = strong + ' )' + strongClose;

            returnVal = classOpen + '<span>' + propertiesStr.join( '</span>, <span>' ) + '</span>' + classClose;

            _ref1 = this.properties;

            for ( _j = 0, _len1 = _ref1.length; _j < _len1; _j ++ ) {

                prop = _ref1[ _j ];

                if ( ( prop.refModel != null ) && ( ! ( prop.refModel === modelToIgnore ) ) ) {

                    returnVal = returnVal + ( '<br>' + prop.refModel.getMockSignature( void 0, this ) );

                }

            }

            return returnVal;

        };

        return SwaggerModel;

    } )();

    // Definition of the SwaggerModelProperty class.
    SwaggerModelProperty = ( function () {

        /*
         * Constructor for SwaggerModelProperty.
         * Represents a single property within a SwaggerModel.
         *
         * @param {string} name - The name of the property.
         * @param {Object} obj - The raw property definition object.
         */
        function SwaggerModelProperty( name, obj ) {

            this.name = name;

            this.dataType = obj.type;

            this.isArray = this.dataType.toLowerCase() === 'array';

            this.descr = obj.description;

            if ( obj.items != null ) {

                if ( obj.items.type != null ) {

                    this.refDataType = obj.items.type;

                }

                if ( obj.items.$ref != null ) {

                    this.refDataType = obj.items.$ref;

                }

            }

            this.dataTypeWithRef = this.refDataType != null ? this.dataType + '[' + this.refDataType + ']' : this.dataType;

            if ( obj.allowableValues != null ) {

                this.valueType = obj.allowableValues.valueType;

                this.values = obj.allowableValues.values;

                if ( this.values != null ) {

                    this.valuesString = "'" + this.values.join( "' or '" ) + "'";

                }

            }

        }

        /*
         * Returns a string representation of the model property.
         *
         * @returns {string} The string representation.
         */
        SwaggerModelProperty.prototype.toString = function () {

            var str;

            str = this.name + ': ' + this.dataTypeWithRef;

            if ( this.values != null ) {

                str += " = ['" + this.values.join( "' or '" ) + "']";

            }

            if ( this.descr != null ) {

                str += ' {' + this.descr + '}';

            }

            return str;

        };

        return SwaggerModelProperty;

    } )();

    // Definition of the SwaggerOperation class.
    SwaggerOperation = ( function () {

        /*
         * Constructor for SwaggerOperation.
         * Represents a single API operation (e.g., GET /users/{id}).
         *
         * @param {string} nickname - A unique identifier for the operation.
         * @param {string} path - The relative path for the operation.
         * @param {string} httpMethod - The HTTP method (GET, POST, etc.).
         * @param {Array} parameters - An array of parameter definitions.
         * @param {string} summary - A short summary of the operation.
         * @param {string} notes - Detailed notes about the operation.
         * @param {string} responseClass - The data type of the response.
         * @param {SwaggerResource} resource - The parent SwaggerResource instance.
         */
        function SwaggerOperation( nickname, path, httpMethod, parameters, summary, notes, responseClass, resource ) {

            var parameter, v, _i, _j, _len, _len1, _ref, _ref1,

                _this = this;

            this.nickname = nickname;

            this.path = path;

            this.httpMethod = httpMethod;

            this.parameters = parameters != null ? parameters : [];

            this.summary = summary;

            this.notes = notes;

            this.responseClass = responseClass;

            this.resource = resource;

            this[ "do" ] = __bind( this[ "do" ], this );

            // Validate essential properties.
            if ( this.nickname == null ) {

                this.resource.api.fail( "SwaggerOperations must have a nickname." );

            }

            if ( this.path == null ) {

                this.resource.api.fail( "SwaggerOperation " + nickname + " is missing path." );

            }

            if ( this.httpMethod == null ) {

                this.resource.api.fail( "SwaggerOperation " + nickname + " is missing httpMethod." );

            }

            this.path = this.path.replace( '{format}', 'json' );

            this.httpMethod = this.httpMethod.toLowerCase();

            this.isGetMethod = this.httpMethod === "get";

            this.resourceName = this.resource.name;

            // Handle 'void' response class.
            if ( this.responseClass.toLowerCase() === 'void' ) {

                this.responseClass = void 0;

            }

            if ( this.responseClass != null ) {

                this.responseClassSignature = this.getSignature( this.responseClass, this.resource.models );

            }

            // Process each parameter.
            _ref = this.parameters;

            for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

                parameter = _ref[ _i ];

                parameter.name = parameter.name || parameter.dataType;

                if ( parameter.dataType.toLowerCase() === 'boolean' ) {

                    parameter.allowableValues = {};

                    parameter.allowableValues.values = this.resource.api.booleanValues;

                }

                parameter.signature = this.getSignature( parameter.dataType, this.resource.models );

                if ( parameter.allowableValues != null ) {

                    if ( parameter.allowableValues.valueType === "RANGE" ) {

                        parameter.isRange = true;

                    } else {

                        parameter.isList = true;

                    }

                    if ( parameter.allowableValues.values != null ) {

                        parameter.allowableValues.descriptiveValues = [];

                        _ref1 = parameter.allowableValues.values;

                        for ( _j = 0, _len1 = _ref1.length; _j < _len1; _j ++ ) {

                            v = _ref1[ _j ];

                            if ( ( parameter.defaultValue != null ) && parameter.defaultValue === v ) {

                                parameter.allowableValues.descriptiveValues.push( {
                                    value: v,
                                    isDefault: true
                                } );

                            } else {

                                parameter.allowableValues.descriptiveValues.push( {
                                    value: v,
                                    isDefault: false
                                } );

                            }

                        }

                    }

                }

            }

            // Expose the operation directly on the resource object.
            this.resource[ this.nickname ] = function ( args, callback, error ) {

                return _this[ "do" ]( args, callback, error );

            };

        }

        /*
         * Checks if a data type represents a list and extracts the item type if it does.
         *
         * @param {string} dataType - The data type string.
         * @returns {string|undefined} The item type for lists, or undefined otherwise.
         */
        SwaggerOperation.prototype.isListType = function ( dataType ) {

            if ( dataType.indexOf( '[' ) >= 0 ) {

                return dataType.substring( dataType.indexOf( '[' ) + 1, dataType.indexOf( ']' ) );

            } else {

                return void 0;

            }

        };

        /*
         * Gets the signature (mock representation) for a data type.
         *
         * @param {string} dataType - The data type to get the signature for.
         * @param {Object} models - A map of all available models.
         * @returns {string} The signature of the data type.
         */
        SwaggerOperation.prototype.getSignature = function ( dataType, models ) {

            var isPrimitive, listType;

            listType = this.isListType( dataType );

            isPrimitive = ( ( listType != null ) && models[ listType ] ) || ( models[ dataType ] != null ) ? false : true;

            if ( isPrimitive ) {

                return dataType;

            } else {

                if ( listType != null ) {

                    return models[ listType ].getMockSignature( dataType );

                } else {

                    return models[ dataType ].getMockSignature( dataType );

                }

            }

        };

        /*
         * Executes the API operation.
         *
         * @param {Object} args - Arguments for the operation (parameters, headers, body).
         * @param {Function} callback - Callback function for success.
         * @param {Function} error - Callback function for error.
         */
        SwaggerOperation.prototype[ "do" ] = function ( args, callback, error ) {

            var body, headers;

            if ( args == null ) {

                args = {};

            }

            if ( ( typeof args ) === "function" ) {

                error = callback;

                callback = args;

                args = {};

            }

            if ( error == null ) {

                error = function ( xhr, textStatus, error ) {

                    return console.log( xhr, textStatus, error );

                };

            }

            if ( callback == null ) {

                callback = function ( data ) {

                    return console.log( data );

                };

            }

            if ( args.headers != null ) {

                headers = args.headers;

                delete args.headers;

            }

            if ( args.body != null ) { /* more code follows here in original */ }

        };

        return SwaggerOperation;

    } )();

} ).call( this );