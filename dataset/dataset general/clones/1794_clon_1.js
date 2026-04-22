/*
 *   Global variables defined for OpenSearchlight library.
 *   This comment is for linting tools like JSHint or ESLint.
 */
/* global OpenSearchlight: true */


//  ----------------------------------------------------------------------------
//  Module: OpenSearchDescriptionDocument
//
//  This JavaScript module, `OpenSearchDescriptionDocument`, is designed
//  to parse and interpret an OpenSearch Description Document (OSDD).
//  Its primary function is to extract relevant information from the OSDD XML
//  and to construct appropriate query URLs based on user-provided parameters
//  and desired content types.
//
//  The design philosophy borrows from patterns seen in libraries like Backbone.js,
//  providing a clear separation between instance and class-level methods.
//  ----------------------------------------------------------------------------


//  Encapsulate all internal workings within an immediately invoked function
//  expression (IIFE) to prevent global namespace pollution.
//  The `jQuery` and `Underscore.js` libraries are injected as dependencies.
( function ( $, _ ) {


    //  A local reference to the `OpenSearchDescriptionDocument` constructor.
    //  This enhances readability and provides a convenient alias within the module.
    var OSDD;


    //  ------------------------------------------------------------------------
    //  Constructor Definition: OpenSearchDescriptionDocument
    //
    //  This function serves as the constructor for new OSDD objects.
    //  It initializes an instance by applying provided arguments to its
    //  `initialize` method, following a common object-oriented pattern.
    //  ------------------------------------------------------------------------
    OSDD = OpenSearchlight.OpenSearchDescriptionDocument = function ( osddXml ) {
        this.initialize.apply( this, arguments );
    };


    //  ------------------------------------------------------------------------
    //  Prototype Methods (Instance Methods)
    //
    //  These methods are added to the `OSDD.prototype`, making them available
    //  to all instances created by the `OSDD` constructor. They represent
    //  the core behaviors and operations that an individual OSDD object can perform.
    //  ------------------------------------------------------------------------
    _.extend( OSDD.prototype, {


        //  --------------------------------------------------------------------
        //  Method: initialize
        //
        //  The default initialization routine for an OSDD instance.
        //  It performs validation on the provided XML content and stores it
        //  for subsequent operations.
        //
        //  Parameters:
        //  - `osddXml`: The XML content of the OpenSearch Description Document,
        //               provided as a string.
        //  Throws:
        //  - `Error`: If the provided `osddXml` fails basic validation checks.
        //  --------------------------------------------------------------------
        initialize: function ( osddXml ) {
            //  Ensure the XML is valid before proceeding.
            if ( ! OSDD.validate( osddXml ) ) {
                throw new Error( "Error parsing xml" );
            }
            //  Store the valid OSDD XML content within the instance.
            this.osddXml = osddXml;
        },


        //  --------------------------------------------------------------------
        //  Method: getQueryUrl
        //
        //  Generates the most appropriate query URL based on the OSDD's
        //  template URLs, a set of search parameters, and a desired content type.
        //  The content type takes precedence in template selection.
        //  Parameters not found in the selected template are gracefully ignored.
        //
        //  Parameters:
        //  - `params`:      An object containing key-value pairs for template
        //                   parameters to be substituted into the URL.
        //  - `contentType`: A string specifying the preferred content type
        //                   (e.g., "text/xml", "application/json").
        //
        //  Returns:
        //  - A fully constructed query URL string, or potentially `undefined`
        //    if no suitable template can be found.
        //  --------------------------------------------------------------------
        getQueryUrl: function ( params, contentType ) {
            var urlTemplates, template, queryUrl;

            //  First, extract all available template URLs from the OSDD XML.
            urlTemplates = OSDD.extractTemplateUrls( this.osddXml );

            //  Then, determine the single best-fitting template based on criteria.
            template = OSDD.getBestTemplate( urlTemplates, contentType, params );

            //  Finally, substitute the provided parameters into the chosen template.
            queryUrl = OSDD.substituteTemplateParameters( template, params );

            //  Return the complete and ready-to-use query URL.
            return queryUrl;
        }

    } );


    //  ------------------------------------------------------------------------
    //  Static Methods (Class Methods)
    //
    //  These methods are directly attached to the `OSDD` constructor function.
    //  They serve as utility functions or operations that do not require
    //  an instance of `OSDD` to be performed. They are considered internal
    //  but are exposed for potential advanced customization or overriding.
    //  ------------------------------------------------------------------------
    _.extend( OSDD, {


        //  --------------------------------------------------------------------
        //  Method: validate
        //
        //  Performs a basic validation check on the provided OSDD XML string.
        //  Currently, this validation is quite rudimentary and primarily checks
        //  for the presence of a specific OpenSearch namespace URI.
        //
        //  Parameters:
        //  - `osddXml`: The XML content of the OSDD as a string.
        //
        //  Returns:
        //  - `true` if the XML passes the current validation rules, `false` otherwise.
        //  --------------------------------------------------------------------
        validate: function ( osddXml ) {
            //  An empty or null XML string is immediately invalid.
            if ( ! osddXml ) {
                return false;
            }

            //  This is a very simple check, looking for the OpenSearch 1.1 namespace.
            //  A more robust implementation would involve actual XML parsing and schema validation.
            if ( ! osddXml.match( /http:\/\/a9.com\/-\/spec\/opensearch\/1.1\// ) ) {
                return false;
            }

            //  If all checks pass, the XML is considered valid by this function.
            return true;
        },


        //  --------------------------------------------------------------------
        //  Method: extractTemplateUrls
        //
        //  Parses the OSDD XML to find and extract all template URLs.
        //  It specifically looks for `<Url>` elements that are not of `rel="self"`.
        //  Each extracted URL is returned as a structured object.
        //
        //  Parameters:
        //  - `osddXml`: The XML content of the OSDD as a string.
        //
        //  Returns:
        //  - An array of objects, where each object contains `type` (content type)
        //    and `template` (the URL template string).
        //  - `undefined` if no suitable template URLs are found in the XML.
        //  --------------------------------------------------------------------
        extractTemplateUrls: function ( osddXml ) {
            var templates   =   [],
                //  Note: This currently relies on jQuery for DOM manipulation.
                //  Future improvements might aim to remove this dependency.
                jqTemplates =   $( osddXml ).find( 'url[rel!=self]' );

            //  Iterate over each found URL element and extract its attributes.
            jqTemplates.each( function ( index, element ) {
                templates.push( {
                    type:     this.getAttribute( "type"     ),
                    template: this.getAttribute( "template" )
                } );
            } );

            //  Return the array of templates, or undefined if none were found.
            if ( templates.length === 0 ) {
                return undefined;
            } else {
                return templates;
            }
        },


        //  --------------------------------------------------------------------
        //  Method: getBestTemplate
        //
        //  Selects the optimal URL template from a given list, based on
        //  content type preference and the availability of required parameters.
        //
        //  Parameters:
        //  - `urlTemplates`:  An array of template objects, each with `type` and `template` properties.
        //  - `contentType`:   The desired content type (e.g., "application/json").
        //  - `params`:        An object containing search parameters.
        //
        //  Returns:
        //  - The `template` string of the best-matching URL template.
        //  --------------------------------------------------------------------
        getBestTemplate: function ( urlTemplates, contentType, params ) {
            var filteredByType, filteredByRequiredParams, bestMatch;

            //  First, filter templates by the requested content type.
            filteredByType         = OSDD.filterUrlTemplatesOnMimeType( urlTemplates, contentType );

            //  Next, refine the list by ensuring all required parameters are present.
            filteredByRequiredParams = OSDD.filterUrlTemplatesWithMissingRequiredParams( filteredByType, params );

            //  Finally, pick the template that matches the most optional parameters.
            bestMatch              = OSDD.findTemplateWithMostParamMatches( filteredByRequiredParams, params );

            return bestMatch.template;
        },


        //  --------------------------------------------------------------------
        //  Method: filterUrlTemplatesOnMimeType
        //
        //  Filters a list of URL templates, returning only those that match
        //  the specified content type.
        //
        //  Parameters:
        //  - `urlTemplates`: An array of URL template objects.
        //  - `type`:         The desired content type string to match against.
        //
        //  Returns:
        //  - A new array containing only the templates that match the given type.
        //  --------------------------------------------------------------------
        filterUrlTemplatesOnMimeType: function ( urlTemplates, type ) {
            return _.filter( urlTemplates, function ( urlTemplate ) {
                return OSDD.doesContentTypeMatch( type, urlTemplate.type );
            } );
        },


        //  --------------------------------------------------------------------
        //  Method: doesContentTypeMatch
        //
        //  Performs a flexible comparison between a content type matcher and
        //  an actual content type. Supports wildcards in the matcher.
        //
        //  Parameters:
        //  - `matcher`: The desired content type, which may include wildcards
        //               like `"*/*"` or `"text/*"`.
        //  - `type`:    The actual content type to be checked against the matcher.
        //
        //  Returns:
        //  - `true` if the `type` matches the `matcher`, `false` otherwise.
        //  --------------------------------------------------------------------
        doesContentTypeMatch: function ( matcher, type ) {
            var matcher_parts, type_parts;

            //  Handle the broadest wildcard case.
            if ( matcher === "*/*" ) {
                return true;
            }
            //  Handle exact string match.
            else if ( matcher === type ) {
                return true;
            }

            //  Split both types into primary and secondary parts for wildcard matching.
            matcher_parts = matcher.split( "/" );
            type_parts    = type.split( "/" );

            //  Check for primary type match with secondary wildcard (e.g., "text/*").
            if ( matcher_parts[ 0 ] === type_parts[ 0 ] && matcher_parts[ 1 ] === "*" ) {
                return true;
            }
            //  Check for primary wildcard with secondary type match (e.g., "*/xml").
            else if ( matcher_parts[ 0 ] === "*" && matcher_parts[ 1 ] === type_parts[ 1 ] ) {
                return true;
            }

            //  If no match conditions are met, return false.
            return false;
        },


        //  --------------------------------------------------------------------
        //  Method: filterUrlTemplatesWithMissingRequiredParams
        //
        //  Filters a collection of URL templates, retaining only those for
        //  which all *required* parameters are present in the provided `params` object.
        //
        //  Parameters:
        //  - `urlTemplates`: An array of URL template objects.
        //  - `params`:       An object containing available parameters.
        //
        //  Returns:
        //  - A filtered array of URL template objects.
        //  --------------------------------------------------------------------
        filterUrlTemplatesWithMissingRequiredParams: function ( urlTemplates, params ) {
            return _.filter( urlTemplates, function ( urlTemplate ) {
                return OSDD.areAllRequiredParamsPresent( urlTemplate, params );
            } );
        },


        //  --------------------------------------------------------------------
        //  Method: areAllRequiredParamsPresent
        //
        //  Determines if all required parameters specified within a given
        //  URL template string are available in the `params` object.
        //  Required parameters are those without a trailing `?`.
        //
        //  Parameters:
        //  - `template`: The URL template object containing the `template` string.
        //  - `params`:   An object where keys are available parameter names.
        //
        //  Returns:
        //  - `true` if all required parameters are present, `false` otherwise.
        //  --------------------------------------------------------------------
        areAllRequiredParamsPresent: function ( template, params ) {
            var allParams, requiredParams, actualParams;

            //  Extract all parameter placeholders from the template string.
            allParams = _.map(
                template.template.match( /\{[^}]*\}/g ),  // Find all {param} substrings
                function ( p ) {
                    return p.replace( /[{}]/g, '' );      // Remove curly braces
                }
            );

            //  Filter to identify only the required parameters (those without a trailing '?').
            requiredParams = _.filter(
                allParams,
                function ( param ) {
                    return param.substring( param.length - 1 ) !== "?";
                }
            );

            //  Get the keys of the parameters actually provided.
            actualParams = _.keys( params );

            //  Check if there are any required parameters that are NOT in the actual parameters.
            //  If the difference is empty, all required params are present.
            return ( ( _.difference( requiredParams, actualParams ) ).length === 0 );
        },


        //  --------------------------------------------------------------------
        //  Method: XareAllRequiredParamsPresent
        //
        //  An alternative implementation (possibly older or for specific cases)
        //  to check if all required parameters are present.
        //  This version uses a slightly different regex to identify required params.
        //
        //  Parameters:
        //  - `template`: The URL template object.
        //  - `params`:   The object of available parameters.
        //
        //  Returns:
        //  - `true` if all required parameters are present, `false` otherwise.
        //  --------------------------------------------------------------------
        XareAllRequiredParamsPresent: function ( template, params ) {
            var requiredParams, actualParams;

            //  Extract required parameters using a regex that specifically excludes trailing '?'.
            requiredParams = _.map(
                template.template.match( /\{.*?[^?]\}/g ),
                function ( p ) {
                    return p.replace( /[{}]/g, '' );
                }
            );

            //  Get the keys of the parameters actually provided.
            actualParams = _.keys( params );

            //  Compare the two sets of parameters.
            return ( ( _.difference( requiredParams, actualParams ) ).length === 0 );
        },


        //  --------------------------------------------------------------------
        //  Method: findTemplateWithMostParamMatches
        //
        //  Identifies the URL template that has the highest number of matching
        //  parameters from the provided `params` object. This is used as a
        //  tie-breaker after content type and required parameters have been filtered.
        //
        //  Parameters:
        //  - `templateUrls`: An array of URL template objects to evaluate.
        //  - `params`:       An object containing available parameters.
        //
        //  Returns:
        //  - The URL template object that best matches the provided parameters.
        //  --------------------------------------------------------------------
        findTemplateWithMostParamMatches: function ( templateUrls, params ) {
            //  Sort the templates by the count of parameters they match.
            var sortedTemplateUrls = _.sortBy(
                templateUrls,
                function ( urlTemplate ) {
                    return OSDD.countMatchingParams( params, urlTemplate.template );
                }
            );

            //  The last element in a sorted array is the one with the most matches.
            return _.last( sortedTemplateUrls );
        },


        //  --------------------------------------------------------------------
        //  Method: countMatchingParams
        //
        //  Counts how many parameters from the `params` object are present
        //  (i.e., defined) within a given `templateUrl` string.
        //
        //  Parameters:
        //  - `params`:        An object of available parameters.
        //  - `templateUrl`:   The URL template string to analyze.
        //
        //  Returns:
        //  - An integer representing the number of matched parameters.
        //  --------------------------------------------------------------------
        countMatchingParams: function ( params, templateUrl ) {
            var templateParams;

            //  Extract all parameter placeholders from the template string.
            templateParams = _.map(
                templateUrl.match( /\{.*?\}/g ),
                function ( param ) {
                    return param.replace( /[{}]/g, '' ); // Strip braces
                }
            );

            //  Reduce the list of template parameters to a count of those
            //  that exist as keys in the `params` object.
            return _.reduce(
                templateParams,
                function ( memo, item ) {
                    //  If `params[item]` is not `undefined`, it means the parameter exists.
                    return ( params[ item ] === undefined ) ? memo : memo + 1;
                },
                0 // Initial count is zero.
            );
        },


        //  --------------------------------------------------------------------
        //  Method: substituteTemplateParameters
        //
        //  Replaces placeholders in a `urlTemplate` string with corresponding
        //  values from the `params` object. Any template parameters that are
        //  not found in `params` (and are optional) will be removed.
        //
        //  Parameters:
        //  - `urlTemplate`: The URL template string containing placeholders (e.g., "{searchTerms}").
        //  - `params`:      An object of key-value pairs for parameter substitution.
        //
        //  Returns:
        //  - The fully formed URL string with all parameters substituted.
        //  --------------------------------------------------------------------
        substituteTemplateParameters: function ( urlTemplate, params ) {
            var url = urlTemplate;

            //  Iterate over each parameter in `params` and substitute its value
            //  into the URL template. This handles both required and optional parameters.
            _.each( params, function ( value, key ) {
                //  The regex matches '{key}' or '{key?}' to allow for optional parameters.
                url = url.replace( new RegExp( "{" + key + "\\??}" ), value );
            } );

            //  After substitution, remove any remaining optional template parameters
            //  that were not provided in `params`. These are identified by the trailing '?'.
            url = url.replace( /\{.*?\?\}/g, "" );

            return url;
        }

    } );


//  End of the IIFE. Pass jQuery and Underscore into the closure.
} ( jQuery, _ ) );