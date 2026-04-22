/*
Copyright Jason E. Smith 2008
Permitted for use under the Apache License, version 2.0 (the "License");
You may acquire a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

/*
 * ACKNOWLEDGMENTS:
 * Special thanks to Kris Zyp from SitePen for providing the original base
 * for this standalone version of JSONQuery (derived from the dojox.json.query module).
 *
 * GENERAL DESCRIPTION:
 * DataPathProcessor.js is an independent adaptation of the dojox.json.query library.
 * It aims to be a self-contained solution without external dependencies.
 * This tool is designed to enhance and supersede the JSONPath API (http://goessner.net/articles/JsonPath/),
 * offering advanced and powerful data querying features akin to XQuery.
 *
 * ILLUSTRATIONS / HOW TO USE:
 * Refer to http://www.sitepen.com/blog/2008/07/16/jsonquery-data-querying-beyond-jsonpath/ for more details.
 *
 *     *Adapted from the initial source.
 *         DataPathProcessor(pathExpression, targetObject)
        and
        DataPathProcessor(pathExpression)(targetObject)
        yield identical outcomes. The former evaluates immediately, while the latter returns
        a function that can then be invoked with the target data.

      example:
        DataPathProcessor("itemProp", {itemProp: "value"})
        This will yield "value".

      example:
        queryEvaluator = DataPathProcessor("?propA='valueA'&level>3");
        This creates a callable entity that identifies all objects within an array
        possessing a property 'propA' equal to "valueA" and a 'level' property
        with a numeric value greater than 3.
        queryEvaluator([{propA:"valueA",level:4},{propA:"valueB",level:2}])
        This produces:
        {propA:"valueA",level:4}

      example:
        queryEvaluator = DataPathProcessor("$.[?price<15.00][\\rating][0:10]");
        This locates objects in an array where 'price' is less than 15.00, then sorts them
        by 'rating' (highest first), and finally returns the first ten entries from
        this filtered and ordered collection.

      example:
        var customerData = {clientList:[
          {name:"Sarah", orders:29},
          {name:"Kevin", orders:150},
          {name:"John", orders:27}
      ]};

      var resultSet = data.DataPathProcessor("$.clientList[?orders > 21 & name='John'][\\orders]", customerData);

      returns clientList sorted by the highest number of orders to the lowest.

*/

(function() {
  function transformElements( collection, operation /*, contextObject*/ ) {
    var collectionLength = collection.length;
    if ( typeof operation != "function" )
      throw new TypeError( );

    var resultList = new Array( collectionLength );
    var contextObject = arguments[2];
    for ( var idx = 0; idx < collectionLength; idx++ ) {
      if ( idx in collection )
        resultList[idx] = operation.call( contextObject, collection[idx], idx, collection );
    }

    return resultList;
  }

  function selectItems( collection, operation /*, contextObject*/ ) {
    var collectionLength = collection.length;
    if ( typeof operation != "function" )
      throw new TypeError( );

    var resultList = new Array( );
    var contextObject = arguments[2];
    for ( var idx = 0; idx < collectionLength; idx++ ) {
      if ( idx in collection ) {
        var currentValue = collection[idx]; // in case operation mutates this
        if ( operation.call( contextObject, currentValue, idx, collection ) )
          resultList.push( currentValue );
      }
    }

    return resultList;
  }

  function extractRange( targetObject, startIndex, endIndex, stepValue ) {
    // handles array slicing operations: [3:6:2]
    var objectLength = targetObject.length, collectedItems = [];
    endIndex = endIndex || objectLength;
    startIndex = ( startIndex < 0 ) ? Math.max( 0, startIndex + objectLength ) : Math.min( objectLength, startIndex );
    endIndex = ( endIndex < 0 ) ? Math.max( 0, endIndex + objectLength ) : Math.min( objectLength, endIndex );
     for ( var idx = startIndex; idx < endIndex; idx += stepValue ) {
       collectedItems.push( targetObject[idx] );
     }
    return collectedItems;
  }

  function traverseAndCollect( targetObject, searchKey ) {
    // handles ..propertyName, .*, [*], [value1,value2], [value]
    // searchKey can be a property to look for, undefined for full recursive scan, or an array for indexing
    var collectedItems = [];
    function exploreObject( currentObject ) {
      if ( searchKey ) {
        if ( searchKey === true && !( currentObject instanceof Array ) ) {
          // recursive object exploration
          collectedItems.push( currentObject );
        } else if ( currentObject[searchKey] ) {
          // found the searchKey, add to our results
          collectedItems.push( currentObject[searchKey] );
        }
      }
      for ( var prop in currentObject ) {
        var propertyValue = currentObject[prop];
        if ( !searchKey ) {
          // if we don't have a specific key, we're just gathering all property values (.* or [*])
          collectedItems.push( propertyValue );
        } else if ( propertyValue && typeof propertyValue == 'object' ) {

          exploreObject( propertyValue );
        }
      }
    }
    if ( searchKey instanceof Array ) {
      // this is invoked when multiple items are specified in brackets: [3,4,5]
      if ( searchKey.length == 1 ) {
        // this can occur if the parser gets confused by commas
        // inside brackets like [@.method(4,2)]. Fixing the parser for this
        // would require recursive analysis, which is very costly, but this approach
        // resolves the issue effectively.
        return targetObject[searchKey[0]];
      }
      for ( var idx = 0; idx < searchKey.length; idx++ ) {
        collectedItems.push( targetObject[searchKey[idx]] );
      }
    } else {
      // otherwise, we are performing an expansion
      exploreObject( targetObject );
    }
    return collectedItems;
  }

  function uniqueSelection( inputArray, predicateFunction ) {
    // performs filtering while removing duplicates in O(n) time
    var outputArray = [];
    var seenPrimitives = {};
    for ( var idx = 0, limit = inputArray.length; idx < limit; ++idx ) {
      var currentItem = inputArray[idx];
      if ( predicateFunction( currentItem, idx, inputArray ) ) {
        if ( ( typeof currentItem == 'object' ) && currentItem ) {
          // for objects, we prevent duplicates using a marker property
          if ( !currentItem.__included_flag ) {
            currentItem.__included_flag = true;
            outputArray.push( currentItem );
          }
        } else if ( !seenPrimitives[currentItem + typeof currentItem] ) {
          // for primitives, we prevent duplicates by storing them in a map
          seenPrimitives[currentItem + typeof currentItem] = true;
          outputArray.push( currentItem );
        }
      }
    }
    for ( idx = 0, limit = outputArray.length; idx < limit; ++idx ) {
      // clean up the marker properties
      if ( outputArray[idx] ) {
        delete outputArray[idx].__included_flag;
      }
    }
    return outputArray;
  }

  var DataPathProcessor = function ( /*String*/pathExpression, /*Object?*/targetObject ) {
    // summary:
    //     Executes a DataPath query on the provided object and returns the resulting data.
    //     If no target object is supplied (only a query string), it returns a "compiled" function
    //     that can then evaluate objects based on the specified query.
    // pathExpression:
    //     The query string itself.
    // targetObject:
    //     The data structure to apply the DataPath query against.
    //
    //  description:
    //    DataPathProcessor offers a comprehensive array of data querying functionalities,
    //    including filtering, deep recursive searching, sorting, data transformation,
    //    range selection, and powerful expressions supporting wildcard string comparisons
    //    and various operators. DataPathProcessor generally extends JSONPath and
    //    provides a syntax that closely mirrors and behaves like JavaScript whenever possible.
    //
    //    DataPath query evaluations commence with the initial object provided, which can be
    //    referenced using the '$' symbol. From this starting object, various operators
    //    can be applied sequentially, each operating on the outcome of the preceding operation.
    //
    //    Supported Operators:
    //    --------------------
    //    * .property - Retrieves the specified property of the object, functioning identically
    //     to JavaScript's dot notation.
    //    * [expression] - Fetches the property name or index determined by the evaluation of
    //     the given expression, mimicking JavaScript's bracket notation.
    //    * [?expression] - Performs a filtering operation on an array, returning all
    //     elements within the array that satisfy the provided expression. This operator
    //     can also be used without brackets as ?expression, but without containment,
    //     no subsequent operators can be applied.
    //    * [^?expression] - Executes a distinct filtering operation on an array. This behaves
    //     like [?expression] but also removes any duplicate values or objects from the
    //     resulting set.
    //    * [/expression], [\expression], [/expression, /expression] - Sorts an array based
    //     on the provided expression. Multiple comma-separated sort expressions can be
    //     supplied for multi-level sorting (the first having the highest priority).
    //     '/' denotes ascending order, and '\' denotes descending order.
    //    * [=expression] - Applies a mapping operation to an array, creating a new array
    //     where each item is the result of evaluating the expression for each item in the source array.
    //    * [start:end:step] - Executes an array slice or range operation, yielding elements
    //     from an optional start index to an optional end index, with an optional step value.
    //    * [expr,expr] - This is a union operator, returning an array containing all property/index
    //     values obtained from evaluating the comma-separated expressions.
    //    * .* or [*] - Retrieves the values of all properties of the current object.
    //    * $ - Represents the root object. If a DataPath expression does not begin with '$',
    //     it will be automatically inserted at the beginning.
    //    * @ - Refers to the current object within filter, sort, and map expressions. This is generally
    //     not strictly necessary, as names are automatically converted to property references of the
    //     current object in expressions.
    //    *  ..property - Conducts a recursive search for the specified property name, returning
    //     an array of all values possessing that property name within the current object and any sub-objects.
    //    * expr = expr - Performs a comparison (similar to JavaScript's ==). When comparing to
    //     a string, the comparison string may include wildcards '*' (matches any number of
    //     characters) and '?' (matches any single character).
    //    * expr ~ expr - Performs a string comparison that is case-insensitive.
    //    * ..[?expression] - Performs a deep-search filtering operation across all objects and
    //     sub-objects of the current data. Unlike array-only searches, this will inspect
    //     property values, arrays, and their nested children.
    //    * $1,$2,$3, etc. - These represent references to additional parameters passed to the query
    //     function or the evaluator function.
    //    * +, -, /, *, &, |, %, (, ), <, >, <=, >=, != - These operators function precisely as they do
    //     in JavaScript.
    //
    //
    //
    //   |  DataPathProcessor(pathExpression,targetObject)
    //      and
    //   |  DataPathProcessor(pathExpression)(targetObject)
    //      always produce identical outcomes. The first form evaluates immediately, the second returns a
    //      function that subsequently evaluates the object.
    //
    //   example:
    //   |  DataPathProcessor("someKey",{someKey:"data"})
    //      This will return "data".
    //
    //   example:
    //   |  evaluatorFunc = DataPathProcessor("?itemType='book'&price>10");
    //      This generates a function that locates all objects in an array with an 'itemType'
    //      property equal to "book" and a 'price' property greater than 10.
    //   |  evaluatorFunc([{itemType:"book",price:12},{itemType:"magazine",price:5}])
    //      This results in:
    //   |  {itemType:"book",price:12}
    //
    //  example:
    //   |  evaluatorFunc = DataPathProcessor("$[?stock<50][\\popularity][0:5]");
    //      This identifies objects in an array with 'stock' less than 50, then sorts them
    //      by 'popularity' (highest first), and returns the first five items from this
    //      filtered and sorted list.
    var tempTokens = [];
    var bracketDepth = 0;
    var stringLiterals = [];
    pathExpression = pathExpression.replace( /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|[\[\]]/g, function( token ) {
      bracketDepth += token == '[' ? 1 : token == ']' ? -1 : 0; // track bracket nesting level
      return ( token == ']' && bracketDepth > 0 ) ? '`]' : // mark all nested brackets as skippable
          ( token.charAt(0) == '"' || token.charAt(0) == "'" ) ? "`" + ( stringLiterals.push( token ) - 1 ) : // replace strings
            token;
    });
    var functionPrefix = '';
    function wrapWithCall( functionName ) {
      // constructs a function call, placing the current expression as a parameter
      functionPrefix = functionName + "(" + functionPrefix;
    }
    function createPatternMatcher( fullMatch, firstPart, secondPart, thirdPart, stringIndex ) {
      // generates a regular expression matcher for wildcard and case-insensitive comparisons
      return stringLiterals[stringIndex].match(/[\*\?]/) || thirdPart == '~' ?
          "/^" + stringLiterals[stringIndex].substring(1, stringLiterals[stringIndex].length - 1).replace(/\\([btnfr\\"'])|([^\w\*\?])/g, "\\$1$2").replace(/([\*\?])/g, ".$1") + ( thirdPart == '~' ? '$/i' : '$/' ) + ".test(" + firstPart + ")" :
          fullMatch;
    }
    pathExpression.replace( /(\]|\)|push|pop|shift|splice|sort|reverse)\s*\(/, function() {
      throw new Error( "Forbidden function invocation" );
    });

    pathExpression = pathExpression.replace( /([^<>=]=)([^=])/g, "$1=$2" ). // convert single equals to comparison
      replace( /@|(\.\s*)?[a-zA-Z\$_]+(\s*:)?/g, function( token ) {
        return token.charAt(0) == '.' ? token : // preserve .prop
          token == '@' ? "$currentDataItem" : // reference to the current data item
          ( token.match( /:|^(\$|Math|true|false|null)$/ ) ? "" : "$currentDataItem." ) + token; // bare names should be properties of current, unless they are object initializer labels
      }).
      replace( /\.?\.?\[(`\]|[^\]])*\]|\?.*|\.\.([\w\$_]+)|\.\*/g, function( token, matchPart1, matchPart2 ) {
        var operatorMatch = token.match( /^\.?\.?(\[\s*\^?\?|\^?\?|\[\s*==)(.*?)\]?$/ ); // [?expr], ?expr, [=expr, =expr
        if ( operatorMatch ) {
          var callPrefix = '';
          if ( token.match( /^\./ ) ) {
            // recursive object search
            wrapWithCall( "traverseAndCollect" );
            callPrefix = ",true)";
          }
          wrapWithCall( operatorMatch[1].match( /\=/ ) ? "transformElements" : operatorMatch[1].match( /\^/ ) ? "uniqueSelection" : "selectItems" );
          return callPrefix + ",function($currentDataItem){return " + operatorMatch[2] + "})";
        }
        operatorMatch = token.match( /^\[\s*([\/\\].*)\]/ ); // [/sortexpr,\sortexpr]
        if ( operatorMatch ) {
          // create a copy of the array and then sort it using the sorting expression
          return ".concat().sort(function(itemA,itemB){" + operatorMatch[1].replace( /\s*,?\s*([\/\\])\s*([^,\\\/]+)/g, function( subMatch, direction, sortProp ) {
              return "var valA= " + sortProp.replace( /\$currentDataItem/, "itemA" ) + ",valB= " + sortProp.replace( /\$currentDataItem/, "itemB" ) + // FIXME: Should verify that $currentDataItem is not followed by other characters
                  ";if(valA>valB||valB==null){return " + ( direction == "/" ? 1 : -1 ) +";}\n" +
                  "if(valB>valA||valA==null){return " + ( direction == "/" ? -1 : 1 ) +";}\n";
          }) + "})";
        }
        operatorMatch = token.match( /^\[(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)\]/ ); // slice [0:3]
        if ( operatorMatch ) {
          wrapWithCall( "extractRange" );
          return "," + ( operatorMatch[1] || 0 ) + "," + ( operatorMatch[2] || 0 ) + "," + ( operatorMatch[3] || 1 ) + ")";
        }
        if ( token.match( /^\.\.|\.\*|\[\s*\*\s*\]|,/ ) ) { // ..prop and [*]
          wrapWithCall( "traverseAndCollect" );
          return ( token.charAt(1) == '.' ?
              ",'" + matchPart2 + "'" : // ..prop
                token.match( /,/ ) ?
                  "," + token : // [prop1,prop2]
                  "" ) + ")"; // [*]
        }
        return token;
      }).
      replace( /(\$currentDataItem\s*(\.\s*[\w_$]+\s*)*)(==|~)\s*`([0-9]+)/g, createPatternMatcher ). // generate regex matching
      replace( /`([0-9]+)\s*(==|~)\s*(\$currentDataItem(\s*\.\s*[\w_$]+)*)/g, function( fullMatch, stringIndex, comparisonOp, thirdPart, fourthPart ) { // and for reversed comparison
        return createPatternMatcher( fullMatch, thirdPart, fourthPart, comparisonOp, stringIndex );
      });
    pathExpression = functionPrefix + ( pathExpression.charAt(0) == '$' ? "" : "$" ) + pathExpression.replace( /`([0-9]+|\])/g, function( token, indexOrBracket ) {
      // restore the original strings
      return indexOrBracket == ']' ? ']' : stringLiterals[indexOrBracket];
    });
    // construct a function within this scope (so it can utilize traverseAndCollect and extractRange)

    var evaluatorFunc = eval( "1&&function(inputData,param1,param2,param3,param4,param5,param6,param7,param8,param9){var $currentDataItem=inputData;return " + pathExpression + "}" );
    for ( var idx = 0; idx < arguments.length - 1; idx++ ) {
      arguments[idx] = arguments[idx+1];
    }
    return targetObject ? evaluatorFunc.apply( this, arguments ) : evaluatorFunc;
  };

  if ( typeof namespace == "function" ) {
    namespace( "data::DataPathProcessor", DataPathProcessor );
  }
  else {
    window["DataPathProcessor"] = DataPathProcessor;
  }
})();