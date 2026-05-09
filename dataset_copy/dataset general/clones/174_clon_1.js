exports.parse = function( fname,
                                     callback ) { /* This is the main parsing function for configuration files.
                                                     It reads the file, processes its content line by line,
                                                     and constructs a structured configuration object. */
    require( 'fs' ).readFile(
        fname,
        'utf8',
        function( err,
                  config )
        {
            // If there's an error reading the file, we immediately return it.
            if ( err ) {

                return callback( err );
            }


            var result = {
                modifiers: [],
                rules:     [],
                sections:  [],
                sslHosts:  []
            };
            var currentSection;
            var currentRules;
            var skiping = false; /* Flag to indicate if the current section should be skipped.
                                    This happens for sections starting with '#'. */
            config.split( '\n' ).forEach(
                function( line ) {

                    line = line.trim(); /* Remove leading/trailing whitespace from the line for easier processing. */

                    // Process only non-empty lines that are not comments (starting with '#').
                    if ( line && line.indexOf( '#' ) != 0 ) {

                        // Check for section definition: [sectionName]
                        if ( line.indexOf( '[' ) == 0 && line.indexOf( ']' ) == line.length - 1 ) {

                            var sectionName = line.slice( 1, -1 ).trim(); // Extract the name of the section.
                            skiping = sectionName.indexOf( '#' ) == 0; // Determine if this section should be skipped.
                            currentSection = {
                                modifiers: [],
                                rules:     []
                            };
                            result.sections.push( currentSection );
                            currentRules = null; // Reset currentRules when a new section begins.

                        } else if ( !skiping ) {
                            // If not skipping the current section, process rules and modifiers.

                            // Handle $UseSSLFor directive for SSL hosts.
                            if ( line.indexOf( '$UseSSLFor ' ) == 0 ) {

                                line.split( /\s+/ ).slice( 1 ).forEach(
                                    function( host ) {
                                        result.sslHosts.push( host );
                                    }
                                );

                            } else if ( line.indexOf( '$' ) == 0 ) {
                                // Handle general modifiers starting with '$'.

                                var modifier = createModifier( line.slice( 1 ) );
                                if ( modifier ) {
                                    if ( currentRules ) {
                                        // If there are specific rules being defined, apply modifier to them.
                                        currentRules.forEach(
                                            function( rule ) {
                                                rule.modifiers.push( modifier );
                                            }
                                        );
                                    } else {
                                        // Otherwise, apply modifier to the current section or global result.
                                        ( currentSection || result ).modifiers.push( modifier );
                                    }
                                }

                            } else if ( line.indexOf( '=>' ) > -1 ) {
                                // Handle rule definitions with '=>' (pattern => action).

                                var operands = line.split( '=>' ).map(
                                    function( operand ) {
                                        return operand.trim();
                                    }
                                );
                                var patterns = createPatterns( operands[0] );
                                currentRules = []; // Initialize currentRules for this set of patterns.
                                patterns.forEach(
                                    function( pattern ) {
                                        var rule = {
                                            pattern:   pattern,
                                            action:    createAction( pattern.url || pattern.urlStart, operands[1] ),
                                            modifiers: []
                                        };
                                        currentRules.push( rule );
                                        ( currentSection || result ).rules.push( rule );
                                    }
                                );
                            }

                        }
                    }
                }
            );
            // After processing all lines, call the callback with the parsed result.
            callback( null, result );
        }
    );
}; // End of exports.parse function.


// Helper function to create patterns based on the source string.
function createPatterns( source ) {

    if ( source[0] == '/' && source[source.length - 1] == '/' ) {
        // If source is a regex pattern (e.g., /pattern/i).
        return [{
            url: new RegExp( source.substr( 1, source.length - 2 ), 'i' )
        }];
    } else if ( source[0] == '!' ) {
        // If source starts with '!', it's an exact URL match.
        return normalizeUrl( source.slice( 1 ) ).map(
            function( url ) {
                return {
                    url: url
                };
            }
        );
    } else {
        // Otherwise, it's a URL prefix match.
        return normalizeUrl( source ).map(
            function( url ) {
                return {
                    urlStart: url
                };
            }
        );
    }
}


// Helper function to normalize URLs, adding http/https if missing and converting to punycode.
function normalizeUrl( url ) {

    var urls = [url];
    if ( !/^https?:\/\//.test( url ) ) {
        urls = ['http://' + url, 'https://' + url]; // Prepend http and https if protocol is missing.
    }
    return urls.map(
        function( url ) {
            // Using parse-format combination, Cyrillic domains are converted to punycode.
            var normalizedUrl = require( 'url' ).format( require( 'url' ).parse( url ) );
            if ( url.lastIndexOf( '/' ) != url.length - 1 ) {
                normalizedUrl = normalizedUrl.replace( /\/$/, '' ); // Remove trailing slash if original didn't have one.
            }
            return normalizedUrl;
        }
    );
}


// Helper function to create an action based on the replacement string.
function createAction( pattern, replacement ) {

    if ( replacement == '$' ) {
        return createDefaultAction(); // Default action: do original request.
    } else if ( replacement == '' ) {
        return createAbortAction(); // Abort action: stop the request.
    } else if ( replacement.match( /^data:(?:([a-zA-Z/-]+);)?(base64,)?(.*)/ ) ) {
        // Data URI action.
        return createDataAction( pattern, RegExp.$3 || '', RegExp.$1 || 'text/plain', !!RegExp.$2 );
    } else if ( replacement.indexOf( 'file://' ) == 0 ) {
        // File system action.
        return createFileAction( pattern, replacement.slice( 7 ) );
    } else if ( replacement.indexOf( 'proxy:' ) == 0 ) {
        // Proxy action.
        return createProxyAction( replacement.slice( 6 ).trim() );
    } else if ( replacement.indexOf( 'bin:' ) == 0 ) {
        // Binary command execution action.
        return createBinAction( pattern, replacement.slice( 4 ).trim() );
    } else {
        // Standard action: redirect or modify URL.
        return createStandardAction( pattern, replacement );
    }
}


// Action: Continue with the original request.
function createDefaultAction() {
    return function( state ) {
        state.doRequest();
    };
}


// Action: Abort the request.
function createAbortAction() {
    return function( state ) {
        state.abort();
    };
}


// Action: Respond with data URI content.
function createDataAction( pattern, tpl, contentType, isBase64 ) {
    return function( state ) {
        var content = tpl;
        if ( !isBase64 ) {
            content = applyTemplate( tpl, state, pattern ); // Apply template if not base64.
        }
        content = new Buffer( content, isBase64 ? 'base64' : 'utf8' );
        state.setResponseType( contentType );
        state.send( content );
    };
}


// Action: Serve a file from the file system.
function createFileAction( pattern, fnameTemplate ) {
    return function( state ) {
        var tpl = fnameTemplate;
        if ( typeof pattern == 'string' ) {
            // If pattern is a string, append the rest of the URL to the template.
            tpl = require( 'path' ).join( tpl, state.getRequestUrl().slice( pattern.length ) );
        }
        var fname = applyTemplate( tpl, state, pattern ).split( '?' )[0]; // Apply template and remove query string.
        fname = fname.replace( /~/g, state.get( 'documentRoot', '' ) ); // Replace '~' with document root.
        state.sendFile( fname );
    };
}


// Action: Route request through a proxy.
function createProxyAction( proxyParam ) {
    var proxy;
    if ( proxyParam && proxyParam.match( /^(?:([^:]*):([^@]*)@)?([^:]*):([0-9]*)$/ ) ) {
        // Parse proxy parameters (user:password@host:port).
        proxy = {
            user:     RegExp.$1,
            password: RegExp.$2,
            host:     RegExp.$3,
            port:     RegExp.$4
        };
    }
    return function( state ) {
        state.setProxy( proxy );
        state.doRequest(); // Continue request via proxy.
    };
}


// Action: Execute a shell command and return its output.
function createBinAction( pattern, commandTpl ) {
    return function( state ) {
        var command = applyTemplate( commandTpl, state, pattern );
        require( 'child_process' ).exec(
            command,
            { encoding: 'binary', maxBuffer: 1024 * 1024 },
            function( err, stdout, stderr ) {
                if ( err ) {
                    return state.error( err );
                }
                state.send( stdout || stderr ); // Send stdout or stderr as response.
            }
        );
    };
}


// Action: Redirect or modify the request URL.
function createStandardAction( pattern, urlTemplate ) {
    return function( state ) {
        var url = applyTemplate( urlTemplate, state, pattern );
        // Ensure URL has a protocol, defaulting to current request's protocol.
        url = url.replace( /^(?!https?:\/\/)/, state.getRequestProtocol() + '//' );
        if ( typeof pattern == 'string' ) {
            url += state.getRequestUrl().slice( pattern.length ); // Append remaining URL path if pattern is string.
        }
        state.setRequestUrl( url );
        state.doRequest(); // Continue request with new URL.
    };
}


// Helper function to apply template variables to a string.
function applyTemplate( tpl, state, pattern ) {
    var args = [];
    if ( typeof pattern != 'string' ) {
        // If pattern is a regex, extract matched groups.
        args = state.getRequestUrl().match( pattern );
    }
    return tpl.replace( /(?:(~)|\$(?:(\d+)|\{(&)?([^}]+)\}))/g,
        function( ignore, tilde, num, escape, varname ) {
            if ( tilde ) {
                return state.get( 'documentRoot' ); // '~' maps to document root.
            } else if ( num ) {
                return args[num] || ''; // '$N' maps to regex group N.
            } else {
                var result = '';
                var method = {
                    url:   'getRequestUrl',
                    host:  'getRequestHost',
                    port:  'getRequestPort',
                    path:  'getRequestPath',
                    query: 'getQueryString'
                }[varname];
                if ( method ) {
                    result = state[method](); // Built-in state methods.
                } else if ( varname.indexOf( 'header:' ) == 0 ) {
                    result = state.getRequestHeader( varname.slice( 7 ) ); // Request header.
                } else if ( varname.indexOf( 'param:' ) == 0 ) {
                    result = state.getQueryParam( varname.slice( 6 ) ); // Query parameter.
                } else if ( varname.indexOf( 'cookie:' ) == 0 ) { // Fix: original had `varname.indexOf('cookie:')`
                    result = state.getCookie( varname.slice( 7 ) ); // Cookie value.
                }
                if ( escape ) {
                    result = encodeURIComponent( result ); // URL-encode if '&' is present.
                }
                return result;
            }
        }
    );
}


// Helper function to create a modifier action.
function createModifier( command ) {
    var args = command.split( /\s+/ );
    var commandName = args.shift();
    var methodName = commandName[0].toLowerCase() + commandName.slice( 1 );
    var commandArg = args.join( ' ' );

    // Modifiers for setting headers, query params, or cookies.
    if ( /^(SetRequestHeader|SetResponseHeader|SetQueryParam|SetCookie)$/.test( commandName ) ) {
        var argsSeparator = ':';
        if ( commandName == 'SetQueryParam' || commandName == 'SetCookie' ) {
            argsSeparator = '='; // Use '=' for query params and cookies.
        }
        var setArgs = commandArg.split( argsSeparator );
        var setArgName = setArgs.shift().trim();
        var setArgValue = setArgs.join( argsSeparator ).trim();
        return function( state ) {
            state[methodName]( setArgName, applyTemplate( setArgValue, state, '' ) );
        };
    }

    // Modifiers for removing headers, query params, or cookies.
    if ( /^(RemoveRequestHeader|RemoveResponseHeader|RemoveQueryParam|RemoveCookie)$/.test( commandName ) ) {
        return function( state ) {
            state[methodName]( commandArg );
        };
    }

    // Modifier for setting HTTP status code.
    if ( commandName == 'StatusCode' ) {
        var statusCode = +commandArg;
        if ( statusCode ) {
            return function( state ) {
                state.overwriteResponseStatus( statusCode );
            };
        }
    }

    // Modifier for introducing a delay.
    if ( commandName == 'Delay' ) {
        var timeout = +commandArg;
        if ( timeout ) {
            return function( state ) {
                state.set( 'delay', timeout );
            };
        }
    }

    // Modifier for setting the document root.
    if ( commandName == 'SetDocumentRoot' ) {
        var documentRoot = commandArg;
        return function( state ) {
            state.set( 'documentRoot', applyTemplate( documentRoot, state, '' ) );
        };
    }

    // Log unknown modifiers for debugging purposes.
    console.log( 'Unknown modifier ' + commandName );
}