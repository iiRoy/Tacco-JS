/*
 * This is a Universal Module Definition (UMD) wrapper.
 * It ensures the code can run in various environments:
 * - CommonJS (Node.js)
 * - AMD (RequireJS)
 * - Browser global (window)
 */
!function ( e ) {
  if ( "object" === typeof exports ) {
    // CommonJS environment
    module.exports = e();
  } else if ( "function" === typeof define && define.amd ) {
    // AMD environment
    define( e );
  } else {
    // Browser global environment
    var f;
    if ( "undefined" !== typeof window ) {
      f = window;
    } else if ( "undefined" !== typeof global ) {
      f = global;
    } else if ( "undefined" !== typeof self ) {
      f = self;
    }
    f.YASQE = e();
  }
}( function () {
  // Local variables for module definition
  var define, module, exports;

  // This is a browserify-style module loader boilerplate
  return ( function e( t, n, r ) {
    function s( o, u ) {
      if ( !n[ o ] ) {
        if ( !t[ o ] ) {
          var a = typeof require == "function" && require;
          if ( !u && a ) {
            return a( o, true );
          }
          if ( i ) {
            return i( o, true );
          }
          var error = new Error( "Cannot find module '" + o + "'" );
          throw error;
        }
        var f = n[ o ] = { exports: {} };
        t[ o ][ 0 ].call( f.exports, function ( e ) {
          var n = t[ o ][ 1 ][ e ];
          return s( n ? n : e );
        }, f, f.exports, e, t, n, r );
      }
      return n[ o ].exports;
    }

    var i = typeof require == "function" && require;

    for ( var o = 0; o < r.length; o++ ) {
      s( r[ o ] );
    }

    return s;
  })( {
    1: [ function ( _dereq_, module, exports ) {
      /*
       * jQuery deparam is an extraction of the deparam method
       * from Ben Alman's jQuery BBQ plugin.
       * Original project: http://benalman.com/projects/jquery-bbq-plugin/
       */
      var $ = _dereq_( "jquery" );

      $.deparam = function ( params, coerce ) {
        var obj          = {},
            coerce_types = { 'true': !0, 'false': !1, 'null': null };

        // Iterate over all name=value pairs found in the input string.
        $.each( params.replace( /\+/g, ' ' ).split( '&' ), function ( j, v ) {
          var param     = v.split( '=' ),
              key       = decodeURIComponent( param[ 0 ] ),
              val,
              cur       = obj,
              i         = 0,

              // If the key is complex (e.g., 'a[]' or 'a[b][c]'),
              // split it into its component parts for processing.
              keys      = key.split( '][' ),
              keys_last = keys.length - 1;

          // Check if the first keys part contains '[' and the last ends with ']',
          // indicating correctly balanced square brackets.
          if ( /\[/.test( keys[ 0 ] ) && /\]$/.test( keys[ keys_last ] ) ) {
            // Remove the trailing ']' from the last keys part.
            keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

            // Split the first keys part into two parts on the '['
            // and add them back onto the beginning of the keys array.
            keys = keys.shift().split( '[' ).concat( keys );

            keys_last = keys.length - 1;
          } else {
            // This is a basic 'foo' style key; treat it as a single part.
            keys_last = 0;
          }

          // Determine if we are dealing with a name=value pair, or just a name.
          if ( param.length === 2 ) {
            val = decodeURIComponent( param[ 1 ] );

            // Coerce values to their appropriate types if 'coerce' is true.
            if ( coerce ) {
              val = val && !isNaN( val )              ? +val              // Convert to number
                  : val === 'undefined'             ? undefined         // Handle 'undefined' string
                  : coerce_types[ val ] !== undefined ? coerce_types[ val ] // Handle 'true', 'false', 'null' strings
                  : val;                                                // Default to string
            }

            // If it's a complex key with multiple parts.
            if ( keys_last ) {
              // Build a deep object structure based on these rules:
              // - The 'cur' pointer starts at the object's top-level.
              // - '[]' implies an array push (n is set to array length).
              // - '[n]' implies an array if n is numeric, otherwise an object.
              // - If at the last keys part, set the final value.
              // - For each keys part, if the current level is undefined,
              //   create an object or array based on the type of the next keys part.
              // - Move the 'cur' pointer to the next level and repeat.
              for ( ; i <= keys_last; i++ ) {
                key = keys[ i ] === '' ? cur.length : keys[ i ];
                cur = cur[ key ] = i < keys_last
                  ? cur[ key ] || ( keys[ i + 1 ] && isNaN( keys[ i + 1 ] ) ? {} : [] )
                  : val;
              }

            } else {
              // Simple key handling: only scalars and shallow arrays are allowed.

              if ( $.isArray( obj[ key ] ) ) {
                // The value is already an array, so push the new value onto it.
                obj[ key ].push( val );

              } else if ( obj[ key ] !== undefined ) {
                // The value isn't an array yet, but a second value has been specified,
                // so convert the existing value into an array and add the new one.
                obj[ key ] = [ obj[ key ], val ];

              } else {
                // The value is a scalar; simply assign it.
                obj[ key ] = val;
              }
            }

          } else if ( key ) {
            // No value was defined for this key, so set a meaningful default.
            obj[ key ] = coerce
              ? undefined
              : '';
          }
        });

        return obj;
      };

    }, { "jquery": 9 }],
    2: [ function ( _dereq_, module, exports ) {
      /*
       * CodeMirror module definition wrapper.
       * This pattern ensures compatibility with various module systems.
       */
      ( function ( mod ) {
        // Check for CommonJS environment (e.g., Node.js, Browserify)
        if ( typeof exports == "object" && typeof module == "object" ) {
          mod( _dereq_( "codemirror" ) );
        }
        // Check for AMD environment (e.g., RequireJS)
        else if ( typeof define == "function" && define.amd ) {
          define( [ "codemirror" ], mod );
        }
        // Fallback for plain browser environment (global CodeMirror object)
        else {
          mod( CodeMirror );
        }
      })( function ( CodeMirror ) {
        "use strict";

        /**
         * Defines the SPARQL 1.1 mode for CodeMirror.
         * This mode provides syntax highlighting and indentation for SPARQL queries.
         *
         * @param {object} config - The CodeMirror configuration object.
         * @param {object} parserConfig - Specific configuration for this parser.
         */
        CodeMirror.defineMode( "sparql11", function ( config, parserConfig ) {

          var indentUnit = config.indentUnit;

          // The ll1_table is automatically generated from the SPARQL grammar.
          // It defines the parsing rules and expected tokens for the SPARQL 1.1 syntax.
          // IMPORTANT: Do not edit this table manually, as it will be overwritten.
          // %%%table%%%
          var ll1_table =
          {
            "*[&&,valueLogical]": {
              "&&": [ "[&&,valueLogical]", "*[&&,valueLogical]" ],
              "AS": [],
              ")": [],
              ",": [],
              "||": [],
              ";": []
            },
            "*[,,expression]": {
              ",": [ "[,,expression]", "*[,,expression]" ],
              ")": []
            },
            "*[,,objectPath]": {
              ",": [ "[,,objectPath]", "*[,,objectPath]" ],
              ".": [],
              ";": [],
              "]": [],
              "{": [],
              "OPTIONAL": [],
              "MINUS": [],
              "GRAPH": [],
              "SERVICE": [],
              "FILTER": [],
              "BIND": [],
              "VALUES": [],
              "}": []
            },
            "*[,,object]": {
              ",": [ "[,,object]", "*[,,object]" ],
              ".": [],
              ";": [],
              "]": [],
              "}": [],
              "GRAPH": [],
              "{": [],
              "OPTIONAL": [],
              "MINUS": [],
              "SERVICE": [],
              "FILTER": [],
              "BIND": [],
              "VALUES": []
            },
            "*[/,pathEltOrInverse]": {
              "/": [ "[/,pathEltOrInverse]", "*[/,pathEltOrInverse]" ],
              "|": [],
              ")": [],
              "(": [],
              "[": [],
              "VAR1": [],
              "VAR2": [],
              "NIL": [],
              "IRI_REF": [],
              "TRUE": [],
              "FALSE": [],
              "BLANK_NODE_LABEL": [],
              "ANON": [],
              "PNAME_LN": [],
              "PNAME_NS": [],
              "STRING_LITERAL1": [],
              "STRING_LITERAL2": [],
              "STRING_LITERAL_LONG1": [],
              "STRING_LITERAL_LONG2": [],
              "INTEGER": [],
              "DECIMAL": [],
              "DOUBLE": [],
              "INTEGER_POSITIVE": [],
              "DECIMAL_POSITIVE": [],
              "DOUBLE_POSITIVE": [],
              "INTEGER_NEGATIVE": [],
              "DECIMAL_NEGATIVE": [],
              "DOUBLE_NEGATIVE": []
            },
            "*[;,?[or([verbPath,verbSimple]),objectList]]": {
              ";": [ "[;,?[or([verbPath,verbSimple]),objectList]]", "*[;,?[or([verbPath,verbSimple]),objectList]]" ],
              ".": [],
              "]": [],
              "{": [],
              "OPTIONAL": [],
              "MINUS": [],
              "GRAPH": [],
              "SERVICE": [],
              "FILTER": [],
              "BIND": [],
              "VALUES": [],
              "}": []
            },
            "*[;,?[verb,objectList]]": {
              ";": [ "[;,?[verb,objectList]]", "*[;,?[verb,objectList]]" ],
              ".": [],
              "]": [],
              "}": [],
              "GRAPH": [],
              "{": [],
              "OPTIONAL": [],
              "MINUS": [],
              "SERVICE": [],
              "FILTER": [],
              "BIND": [],
              "VALUES": []
            },
            "*[UNION,groupGraphPattern]": {
              "UNION": [ "[UNION,groupGraphPattern]", "*[UNION,groupGraphPattern]" ],
              "VAR1": [],
              "VAR2": [],
              "NIL": [],
              "(": [],
              "[": [],
              "IRI_REF": [],
              "TRUE": [],
              "FALSE": [],
              "BLANK_NODE_LABEL": [],
              "ANON": [],
              "PNAME_LN": [],
              "PNAME_NS": [],
              "STRING_LITERAL1": [],
              "STRING_LITERAL2": [],
              "STRING_LITERAL_LONG1": [],
              "STRING_LITERAL_LONG2": [],
              "INTEGER": [],
              "DECIMAL": [],
              "DOUBLE": [],
              "INTEGER_POSITIVE": [],
              "DECIMAL_POSITIVE": [],
              "DOUBLE_POSITIVE": [],
              "INTEGER_NEGATIVE": [],
              "DECIMAL_NEGATIVE": [],
              "DOUBLE_NEGATIVE": [],
              ".": [],
              "{": [],
              "OPTIONAL": [],
              "MINUS": [],
              "GRAPH": [],
              "SERVICE": [],
              "FILTER": [],
              "BIND": [],
              "VALUES": [],
              "}": []
            },
            "*[graphPatternNotTriples,?.,?triplesBlock]": {
              "{": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "OPTIONAL": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "MINUS": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "GRAPH": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "SERVICE": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "FILTER": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "BIND": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "VALUES": [ "[graphPatternNotTriples,?.,?triplesBlock]", "*[graphPatternNotTriples,?.,?triplesBlock]" ],
              "}": []
            },
            "*[quadsNotTriples,?.,?triplesTemplate]": {
              "GRAPH": [ "[quadsNotTriples,?.,?triplesTemplate]", "*[quadsNotTriples,?.,?triplesTemplate]" ],
              "}": []
            },
            "*[|,pathOneInPropertySet]": {
              "|": [ "[|,pathOneInPropertySet]", "*[|,pathOneInPropertySet]" ],
              ")": []
            },
            "*[|,pathSequence]": {
              "|": [ "[|,pathSequence]", "*[|,pathSequence]" ],
              ")": [],
              "(": [],
              "[": [],
              "VAR1": [],
              "VAR2": [],
              "NIL": [],
              "IRI_REF": [],
              "TRUE": [],
              "FALSE": [],
              "BLANK_NODE_LABEL": [],
              "ANON": [],
              "PNAME_LN": [],
              "PNAME_NS": [],
              "STRING_LITERAL1": [],
              "STRING_LITERAL2": [],
              "STRING_LITERAL_LONG1": [],
              "STRING_LITERAL_LONG2": [],
              "INTEGER": [],
              "DECIMAL": [],
              "DOUBLE": [],
              "INTEGER_POSITIVE": [],
              "DECIMAL_POSITIVE": [],
              "DOUBLE_POSITIVE": [],
              "INTEGER_NEGATIVE": [],
              "DECIMAL_NEGATIVE": [],
              "DOUBLE_NEGATIVE": []
            },
            "*[||,conditionalAndExpression]": {
              "||": [ "[||,conditionalAndExpression]", "*[||,conditionalAndExpression]" ],
              "AS": [],
              ")": [],
              ",": [],
              ";": []
            },
            "*dataBlockValue": {
              "UNDEF": [ "dataBlockValue", "*dataBlockValue" ],
              "IRI_REF": [ "dataBlockValue", "*dataBlockValue" ],
              "TRUE": [ "dataBlockValue", "*dataBlockValue" ],
              "FALSE": [ "dataBlockValue", "*dataBlockValue" ],
              "PNAME_LN": [ "dataBlockValue", "*dataBlockValue" ],
              "PNAME_NS": [ "dataBlockValue", "*dataBlockValue" ],
              "STRING_LITERAL1": [ "dataBlockValue", "*dataBlockValue" ],
              "STRING_LITERAL2": [ "dataBlockValue", "*dataBlockValue" ],
              "STRING_LITERAL_LONG1": [ "dataBlockValue", "*dataBlockValue" ],
              "STRING_LITERAL_LONG2": [ "dataBlockValue", "*dataBlockValue" ],
              "INTEGER": [ "dataBlockValue", "*dataBlockValue" ],
              "DECIMAL": [ "dataBlockValue", "*dataBlockValue" ],
              "DOUBLE": [ "dataBlockValue", "*dataBlockValue" ],
              "INTEGER_POSITIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "DECIMAL_POSITIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "DOUBLE_POSITIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "INTEGER_NEGATIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "DECIMAL_NEGATIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "DOUBLE_NEGATIVE": [ "dataBlockValue", "*dataBlockValue" ],
              "}": [],
              ")": []
            },
            "*datasetClause": {
              "FROM": [ "datasetClause", "*datasetClause" ],
              "WHERE": [],
              "{": []
            },
            "*describeDatasetClause": {
              "FROM": [ "describeDatasetClause", "*describeDatasetClause" ],
              "ORDER": [],
              "HAVING": [],
              "GROUP": [],
              "LIMIT": [],
              "OFFSET": [],
              "WHERE": [],
              "{": [],
              "VALUES": [],
              "$": []
            },
            "*graphNode": {
              "(": [ "graphNode", "*graphNode" ],
              "[": [ "graphNode", "*graphNode" ],
              "VAR1": [ "graphNode", "*graphNode" ],
              "VAR2": [ "graphNode", "*graphNode" ],
              "NIL": [ "graphNode", "*graphNode" ],
              "IRI_REF": [ "graphNode", "*graphNode" ],
              "TRUE": [ "graphNode", "*graphNode" ],
              "FALSE": [ "graphNode", "*graphNode" ],
              "BLANK_NODE_LABEL": [ "graphNode", "*graphNode" ],
              "ANON": [ "graphNode", "*graphNode" ],
              "PNAME_LN": [ "graphNode", "*graphNode" ],
              "PNAME_NS": [ "graphNode", "*graphNode" ],
              "STRING_LITERAL1": [ "graphNode", "*graphNode" ],
              "STRING_LITERAL2": [ "graphNode", "*graphNode" ],
              "STRING_LITERAL_LONG1": [ "graphNode", "*graphNode" ],
              "STRING_LITERAL_LONG2": [ "graphNode", "*graphNode" ],
              "INTEGER": [ "graphNode", "*graphNode" ],
              "DECIMAL": [ "graphNode", "*graphNode" ],
              "DOUBLE": [ "graphNode", "*graphNode" ],
              "INTEGER_POSITIVE": [ "graphNode", "*graphNode" ],
              "DECIMAL_POSITIVE": [ "graphNode", "*graphNode" ],
              "DOUBLE_POSITIVE": [ "graphNode", "*graphNode" ],
              "INTEGER_NEGATIVE": [ "graphNode", "*graphNode" ],
              "DECIMAL_NEGATIVE": [ "graphNode", "*graphNode" ],
              "DOUBLE_NEGATIVE": [ "graphNode", "*graphNode" ],
              ")": []
            },
            "*graphNodePath": {
              "(": [ "graphNodePath", "*graphNodePath" ],
              "[": [ "graphNodePath", "*graphNodePath" ],
              "VAR1": [ "graphNodePath", "*graphNodePath" ],
              "VAR2": [ "graphNodePath", "*graphNodePath" ],
              "NIL": [ "graphNodePath", "*graphNodePath" ],
              "IRI_REF": [ "graphNodePath", "*graphNodePath" ],
              "TRUE": [ "graphNodePath", "*graphNodePath" ],
              "FALSE": [ "graphNodePath", "*graphNodePath" ],
              "BLANK_NODE_LABEL": [ "graphNodePath", "*graphNodePath" ],
              "ANON": [ "graphNodePath", "*graphNodePath" ],
              "PNAME_LN": [ "graphNodePath", "*graphNodePath" ],
              "PNAME_NS": [ "graphNodePath", "*graphNodePath" ],
              "STRING_LITERAL1": [ "graphNodePath", "*graphNodePath" ],
              "STRING_LITERAL2": [ "graphNodePath", "*graphNodePath" ],
              "STRING_LITERAL_LONG1": [ "graphNodePath", "*graphNodePath" ],
              "STRING_LITERAL_LONG2": [ "graphNodePath", "*graphNodePath" ],
              "INTEGER": [ "graphNodePath", "*graphNodePath" ],
              "DECIMAL": [ "graphNodePath", "*graphNodePath" ],
              "DOUBLE": [ "graphNodePath", "*graphNodePath" ],
              "INTEGER_POSITIVE": [ "graphNodePath", "*graphNodePath" ],
              "DECIMAL_POSITIVE": [ "graphNodePath", "*graphNodePath" ],
              "DOUBLE_POSITIVE": [ "graphNodePath", "*graphNodePath" ],
              "INTEGER_NEGATIVE": [ "graphNodePath", "*graphNodePath" ],
              "DECIMAL_NEGATIVE": [ "graphNodePath", "*graphNodePath" ],
              "DOUBLE_NEGATIVE": [ "graphNodePath", "*graphNodePath" ],
              ")": []
            },
            "*groupCondition": {
              "(": [ "groupCondition", "*groupCondition" ],
              "STR": [ "groupCondition", "*groupCondition" ],
              "LANG": [ "groupCondition", "*groupCondition" ],
              "LANGMATCHES": [ "groupCondition", "*groupCondition" ],
              "DATATYPE": [ "groupCondition", "*groupCondition" ],
              "BOUND": [ "groupCondition", "*groupCondition" ],
              "IRI": [ "groupCondition", "*groupCondition" ],
              "URI": [ "groupCondition", "*groupCondition" ],
              "BNODE": [ "groupCondition", "*groupCondition" ],
              "RAND": [ "groupCondition", "*groupCondition" ],
              "ABS": [ "groupCondition", "*groupCondition" ],
              "CEIL": [ "groupCondition", "*groupCondition" ],
              "FLOOR": [ "groupCondition", "*groupCondition" ],
              "ROUND": [ "groupCondition", "*groupCondition" ],
              "CONCAT": [ "groupCondition", "*groupCondition" ],
              "STRLEN": [ "groupCondition", "*groupCondition" ],
              "UCASE": [ "groupCondition", "*groupCondition" ],
              "LCASE": [ "groupCondition", "*groupCondition" ],
              "ENCODE_FOR_URI": [ "groupCondition", "*groupCondition" ],
              "CONTAINS": [ "groupCondition", "*groupCondition" ],
              "STRSTARTS": [ "groupCondition", "*groupCondition" ],
              "STRENDS": [ "groupCondition", "*groupCondition" ],
              "STRBEFORE": [ "groupCondition", "*groupCondition" ],
              "STRAFTER": [ "groupCondition", "*groupCondition" ],
              "YEAR": [ "groupCondition", "*groupCondition" ],
              "MONTH": [ "groupCondition", "*groupCondition" ],
              "DAY": [ "groupCondition", "*groupCondition" ],
              "HOURS": [ "groupCondition", "*groupCondition" ],
              "MINUTES": [ "groupCondition", "*groupCondition" ],
              "SECONDS": [ "groupCondition", "*groupCondition" ],
              "TIMEZONE": [ "groupCondition", "*groupCondition" ],
              "TZ": [ "groupCondition", "*groupCondition" ],
              "NOW": [ "groupCondition", "*groupCondition" ],
              "UUID": [ "groupCondition", "*groupCondition" ],
              "STRUUID": [ "groupCondition", "*groupCondition" ],
              "MD5": [ "groupCondition", "*groupCondition" ],
              "SHA1": [ "groupCondition", "*groupCondition" ],
              "SHA256": [ "groupCondition", "*groupCondition" ],
              "SHA384": [ "groupCondition", "*groupCondition" ],
              "SHA512": [ "groupCondition", "*groupCondition" ],
              "COALESCE": [ "groupCondition", "*groupCondition" ],
              "IF": [ "groupCondition", "*groupCondition" ],
              "STRLANG": [ "groupCondition", "*groupCondition" ],
              "STRDT": [ "groupCondition", "*groupCondition" ],
              "SAMETERM": [ "groupCondition", "*groupCondition" ],
              "ISIRI": [ "groupCondition", "*groupCondition" ],
              "ISURI": [ "groupCondition", "*groupCondition" ],
              "ISBLANK": [ "groupCondition", "*groupCondition" ],
              "ISLITERAL": [ "groupCondition", "*groupCondition" ],
              "ISNUMERIC": [ "groupCondition", "*groupCondition" ],
              "VAR1": [ "groupCondition", "*groupCondition" ],
              "VAR2": [ "groupCondition", "*groupCondition" ],
              "SUBSTR": [ "groupCondition", "*groupCondition" ],
              "REPLACE": [ "groupCondition", "*groupCondition" ],
              "REGEX": [ "groupCondition", "*groupCondition" ],
              "EXISTS": [ "groupCondition", "*groupCondition" ],
              "NOT": [ "groupCondition", "*groupCondition" ],
              "IRI_REF": [ "groupCondition", "*groupCondition" ],
              "PNAME_LN": [ "groupCondition", "*groupCondition" ],
              "PNAME_NS": [ "groupCondition", "*groupCondition" ],
              "VALUES": [],
              "LIMIT": [],
              "OFFSET": [],
              "ORDER": [],
              "HAVING": [],
              "$": [],
              "}": []
            },
            "*havingCondition": {
              "(": [ "havingCondition", "*havingCondition" ],
              "STR": [ "havingCondition", "*havingCondition" ],
              "LANG": [ "havingCondition", "*havingCondition" ],
              "LANGMATCHES": [ "havingCondition", "*havingCondition" ],
              "DATATYPE": [ "havingCondition", "*havingCondition" ],
              "BOUND": [ "havingCondition", "*havingCondition" ],
              "IRI": [ "havingCondition", "*havingCondition" ],
              "URI": [ "havingCondition", "*havingCondition" ],
              "BNODE": [ "havingCondition", "*havingCondition" ],
              "RAND": [ "havingCondition", "*havingCondition" ],
              "ABS": [ "havingCondition", "*havingCondition" ],
              "CEIL": [ "havingCondition", "*havingCondition" ],
              "FLOOR": [ "havingCondition", "*havingCondition" ],
              "ROUND": [ "havingCondition", "*havingCondition" ],
              "CONCAT": [ "havingCondition", "*havingCondition" ],
              "STRLEN": [ "havingCondition", "*havingCondition" ],
              "UCASE": [ "havingCondition", "*havingCondition" ],
              "LCASE": [ "havingCondition", "*havingCondition" ],
              "ENCODE_FOR_URI": [ "havingCondition", "*havingCondition" ],
              "CONTAINS": [ "havingCondition", "*havingCondition" ],
              "STRSTARTS": [ "havingCondition", "*havingCondition" ],
              "STRENDS": [ "havingCondition", "*havingCondition" ],
              "STRBEFORE": [ "havingCondition", "*havingCondition" ],
              "STRAFTER": [ "havingCondition", "*havingCondition" ],
              "YEAR": [ "havingCondition", "*havingCondition" ],
              "MONTH": [ "havingCondition", "*havingCondition" ],
              "DAY": [ "havingCondition", "*havingCondition" ],
              "HOURS": [ "havingCondition", "*havingCondition" ],
              "MINUTES": [ "havingCondition", "*havingCondition" ],
              "SECONDS": [ "havingCondition", "*havingCondition" ],
              "TIMEZONE": [ "havingCondition", "*havingCondition" ],
              "TZ": [ "havingCondition", "*havingCondition" ],
              "NOW": [ "havingCondition", "*havingCondition" ],
              "UUID": [ "havingCondition", "*havingCondition" ],
              "STRUUID": [ "havingCondition", "*havingCondition" ],
              "MD5": [ "havingCondition", "*havingCondition" ],
              "SHA1": [ "havingCondition", "*havingCondition" ],
              "SHA256": [ "havingCondition", "*havingCondition" ],
              "SHA384": [ "havingCondition", "*havingCondition" ],
              "SHA512": [ "havingCondition", "*havingCondition" ],
              "COALESCE": [ "havingCondition", "*havingCondition" ],
              "IF": [ "havingCondition", "*havingCondition" ],