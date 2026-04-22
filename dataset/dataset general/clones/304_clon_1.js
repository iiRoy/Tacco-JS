// File: angular-modelizer.js - Version 0.2.24
// A JavaScript library for AngularJS models.
// Loosely inspired by Backbone, Restangular, and Ember Data.

'use strict' ;

; ( function ( root , factory )
{
  // Check for AMD loader like RequireJS
  if ( typeof define === 'function' && define.amd )
  {
    define ( [ 'angular' ] , function ( angular ) {
      return factory ( angular , document ) ;
    } ) ;
  }
  else
  {
    // Global angular variable is expected here
    /* global angular */
    factory ( angular , document ) ;
  }

} ( window , function ( angular , document , undefined ) {

  // This variable will hold the default model class once defined.
  var defaultModelClass ;

  // Utility function to throw an error.
  // This helps with JSHint, allowing errors to be thrown in conditions.
  var _error = function ( errorMessage ) {
    throw new Error ( errorMessage ) ;
  } ;

  // Internal utility methods, mimicking Underscore/Lodash
  // Only a necessary subset of functionalities is exposed.
  // This is similar to how Angular provides its own `jqLite` for internal use.
  // The supported (or partially supported) methods include:
  //  - isObject
  //  - isString
  //  - isArray
  //  - isArguments
  //  - isFunction
  //  - isNumber
  //  - isEqual
  //  - extend
  //  - has
  //  - indexOf
  //  - keys
  //  - values
  //  - pairs
  //  - contains
  //  - flatten
  //  - difference
  //  - without
  //  - map
  //  - iteratee
  //  - matches
  //  - any
  //  - filter
  //  - find
  //  - clone
  //  - uniqueId

  var _idCounter = 0 ; // Counter for generating unique IDs.

  var _ = { } ; // Our custom utility object.

  _.isString = function ( str ) {
    return angular.isString ( str ) ;
  } ;

  _.isNumber = function ( num ) {
    return angular.isNumber ( num ) ;
  } ;

  _.isObject = function ( value ) {
    var type = typeof value ;
    return type === 'function' || ( value && type === 'object' ) || false ;
  } ;

  _.isArray = function ( arr ) {
    return angular.isArray ( arr ) ;
  } ;

  _.isArguments = function ( arg ) {
    return Object.prototype.toString.call ( arg ) === '[object Arguments]' ;
  } ;

  _.isFunction = function ( fn ) {
    return angular.isFunction ( fn ) ;
  } ;

  _.isEqual = function ( o1 , o2 ) {
    return angular.equals ( o1 , o2 ) ;
  } ;

  _.isEmpty = function ( obj ) {
    if ( obj === null || obj === void 0 ) return true ;
    if ( _.isArray ( obj ) || _.isString ( obj ) || _.isArguments ( obj ) ) return obj.length === 0 ;
    for ( var key in obj ) if ( _.has ( obj , key ) ) return false ;
    return true ;
  } ;

  _.extend = function ( obj ) {
    if ( ! _.isObject ( obj ) ) return obj ;
    var source , prop ;
    for ( var i = 1 , length = arguments.length ; i < length ; i ++ ) {
      source = arguments [ i ] ;
      for ( prop in source ) {
        if ( ! Object.prototype.hasOwnProperty.call ( source , prop ) ) continue ;

        // Check for target object accessors that have only getters and not setters and ignore them
        var targetPropertyDescriptor = Object.getOwnPropertyDescriptor ( obj , prop ) ;
        if ( targetPropertyDescriptor && ( targetPropertyDescriptor.get && ! targetPropertyDescriptor.set ) ) continue ;

        obj [ prop ] = source [ prop ] ;
      }
    }

    return obj ;
  } ;

  _.has = function ( obj , key ) {
    return obj && Object.prototype.hasOwnProperty.call ( obj , key ) ;
  } ;

  _.indexOf = function ( arr , item ) {
    if ( ! arr || ! arr.length ) return -1 ;
    for ( var i = 0 ; i < arr.length ; i ++ ) if ( arr [ i ] === item ) return i ;
    return -1 ;
  } ;

  _.keys = function ( obj ) {
    if ( ! _.isObject ( obj ) ) return [ ] ;
    if ( Object.keys ) return Object.keys ( obj ) ;

    var keys = [ ] ;
    for ( var key in obj ) if ( _.has ( obj , key ) ) keys.push ( key ) ;

    return keys ;
  } ;

  _.values = function ( obj ) {
    var keys = _.keys ( obj ) ,
        length = keys.length ,
        values = new Array ( length ) ;

    for ( var i = 0 ; i < length ; i ++ ) {
      values [ i ] = obj [ keys [ i ] ] ;
    }

    return values ;
  } ;

  _.pairs = function ( obj ) {
    var keys = _.keys ( obj ) ;
    var length = keys.length ;
    var pairs = new Array ( length ) ;
    for ( var i = 0 ; i < length ; i ++ ) {
      pairs [ i ] = [ keys [ i ] , obj [ keys [ i ] ] ] ;
    }
    return pairs ;
  } ;

  _.contains = function ( obj , target ) {
    if ( ! obj ) return false ;
    if ( obj.length !== + obj.length ) obj = _.values ( obj ) ;
    return _.indexOf ( obj , target ) >= 0 ;
  } ;

  _.flatten = function ( input , shallow , strict , output ) {
    strict = !! strict ;
    output = output || [ ] ;

    if ( shallow && _.isArray ( input ) && input.length > 0 ) {
      var allArrays = true ;
      for ( var m = 0 ; m < input.length ; m ++ ) {
        if ( ! _.isArray ( input [ m ] ) ) {
          allArrays = false ;
          break ;
        }
      }

      if ( allArrays ) return Array.prototype.concat.apply ( output , input ) ;
    }

    for ( var i = 0 , length = input.length ; i < length ; i ++ ) {
      var value = input [ i ] ;
      if ( ! _.isArray ( value ) && ! _.isArguments ( value ) ) {
        if ( ! strict ) output.push ( value ) ;
      } else if ( shallow ) {
        Array.prototype.push.apply ( output , value ) ;
      } else {
        _.flatten ( value , shallow , strict , output ) ;
      }
    }

    return output ;
  } ;

  _.difference = function ( arr ) {
    var rest = _.flatten ( Array.prototype.slice.call ( arguments , 1 ) , true , true , [ ] ) ;
    return _.filter ( arr , function ( value ) {
      return ! _.contains ( rest , value ) ;
    } ) ;
  } ;

  _.without = function ( arr ) {
    return _.difference ( arr , Array.prototype.slice.call ( arguments , 1 ) ) ;
  } ;

  _.map = function ( obj , mapFn ) {
    return Array.prototype.map.call ( obj , mapFn ) ;
  } ;

  _.iteratee = function ( value ) {
    if ( ! value ) return angular.identity ;
    if ( _.isFunction ( value ) ) {
      var fn = value ;

      // This case is simpler than in Underscore/Lodash
      return function ( val , index , collection ) {
        return fn.call ( null , val , index , collection ) ;
      } ;
    }

    if ( _.isObject ( value ) ) {
      return _.matches ( value ) ;
    }

    var propFn = function ( key ) {
      return function ( obj ) {
        return obj [ key ] ;
      } ;
    } ;

    return propFn ( value ) ;
  } ;

  _.matches = function ( attrs ) {
    var pairs = _.pairs ( attrs ) ,
        length = pairs.length ;

    return function ( obj ) {
      if ( ! obj ) return ! length ;

      obj = new Object ( obj ) ;
      for ( var i = 0 ; i < length ; i ++ ) {
        var pair = pairs [ i ] ,
            key = pair [ 0 ] ;

        if ( pair [ 1 ] !== obj [ key ] || ! ( key in obj ) ) return false ;
      }

      return true ;
    } ;
  } ;

  _.any = function ( obj , predicate ) {
    if ( ! obj ) return false ;

    predicate = _.iteratee ( predicate ) ;

    var keys = obj.length !== + obj.length && _.keys ( obj ) ,
        length = ( keys || obj ).length ,
        index , currentKey ;

    for ( index = 0 ; index < length ; index ++ ) {
      currentKey = keys ? keys [ index ] : index ;
      if ( predicate ( obj [ currentKey ] , currentKey , obj ) ) return true ;
    }

    return false ;
  } ;

  _.find = function ( obj , predicate ) {
    var result ;

    predicate = _.iteratee ( predicate ) ;

    _.any ( obj , function ( value , index , list ) {
      if ( predicate ( value , index , list ) ) {
        result = value ;
        return true ;
      }
    } ) ;

    return result ;
  } ;

  _.filter = function ( obj , predicate ) {
    var results = [ ] ;
    if ( ! obj ) return results ;

    predicate = _.iteratee ( predicate ) ;

    angular.forEach ( obj , function ( value , index , list ) {
      if ( predicate ( value , index , list ) ) results.push ( value ) ;
    } ) ;

    return results ;
  } ;

  _.clone = function ( obj ) {
    if ( ! _.isObject ( obj ) ) return obj ;
    return _.isArray ( obj ) ? obj.slice ( ) : _.extend ( { } , obj ) ;
  } ;

  _.uniqueId = function ( prefix ) {
    var id = ++ _idCounter ;
    return String ( prefix === null ? '' : prefix ) + id ;
  } ;


  // Additional simple utility methods not directly from Underscore/Lodash.
  // These are often simplified versions to avoid importing large external code.

  // This function defines a getter/setter accessor from a source object (`src`)
  // to a destination object (`dst`) for a given `key`.
  // It returns `true` if the property is successfully defined as an accessor, `false` otherwise.
  var _defineAccessor = function ( dst , src , key ) {
    if ( ! _.isObject ( src ) || ! _.isObject ( dst ) || ! key ) return false ;

    var propertyDescriptor = Object.getOwnPropertyDescriptor ( src , key ) ;

    // If a getter or setter function is found in the property descriptor,
    if ( propertyDescriptor && ( propertyDescriptor.get || propertyDescriptor.set ) ) {
      // Manually copy the getter/setter definition.
      // A regular copy would evaluate the getter.
      // Ensure it's enumerable for proper mixin behavior.
      var getter = propertyDescriptor.get || undefined ,
          setter = propertyDescriptor.set || undefined ;

      Object.defineProperty (
        dst , key , { get : getter , set : setter , enumerable : true , configurable : true }
      ) ;

      return true ;
    }

    return false ;
  } ;

  // A simplified version of _.omit() that only handles string property names.
  var _omitProps = function ( obj ) {
    if ( ! obj ) return { } ;
    if ( ! _.isObject ( obj ) ) return obj ;

    var toOmit = Array.prototype.slice.call ( arguments , 1 ) ,
        keys = _.keys ( obj ) ,
        result = { } ;

    for ( var i = 0 ; i < keys.length ; i ++ ) {
      var key = keys [ i ] ;
      if ( key in obj && ! _.contains ( toOmit , key ) ) {
        if ( ! _defineAccessor ( result , obj , key ) ) {
          result [ key ] = obj [ key ] ;
        }
      }
    }

    return result ;
  } ;

  // Performs a half-deep clone.
  // This function works in conjunction with `_extendWithGetSet`.
  // It might be combined with `_extendWithGetSet` in future versions.
  var _deepClone = function ( value , extendFn ) {
    if ( ! value ) return value ;
    if ( ! extendFn || ! _.isFunction ( extendFn ) ) extendFn = _.extend ;

    if ( _.isArray ( value ) ) {
      var arr = _.clone ( value ) ;
      for ( var i = 0 ; i < arr.length ; i ++ ) {
        arr [ i ] = _deepClone ( arr [ i ] ) ;
      }

      return arr ;
    } else if ( _.isFunction ( value ) ) {
      return value ; // Functions are not cloned deeply.
    } else if ( _.isObject ( value ) ) {
      // Regular objects are extended using a "structured clone" approach,
      // potentially with a custom `extend` function.
      return extendFn ( { } , value ) ;
    } else {
      return value ; // Primitives are returned as-is.
    }
  } ;

  var _extendWithGetSet = function ( dst ) {
    dst = dst || { } ;
    angular.forEach ( arguments , function ( obj ) {
      if ( obj !== dst && _.isObject ( obj ) ) {
        for ( var key in obj ) {
          // Attempt to define properties as getter/setter.
          if ( ! _defineAccessor ( dst , obj , key ) ) {
            // If not a getter/setter, perform a full deep clone.
            dst [ key ] = _deepClone ( obj [ key ] , _extendWithGetSet ) ;
          }
        }
      }
    } ) ;

    return dst ;
  } ;


  // # Internal Helpers Section
  // ==========================

  // A helper object for URL-related operations.
  // This includes checks and transformations.
  var urlHelper = {
    isLikeUrl : function ( str ) {
      // A straightforward and basic check for URL-like strings.
      // Future improvement: may need to check for other characters like '%', '^', etc.
      return _.contains ( str , '/' ) || _.contains ( str , '-' ) ;
    } ,

    asUrl : function ( str ) {
      if ( ! str ) return '' ;
      return urlHelper.stripDoubleSlashes ( '/' + str ) ;
    } ,

    // This method accepts any number of URL segments as arguments.
    combineUrls : function ( url1 , url2 , url3 ) {
      var args = _.filter (
        Array.prototype.slice.call ( arguments ) ,
        function ( item ) { return !! item ; } ) ;

      return urlHelper.asUrl ( args.join ( '/' ) ) ;
    } ,

    stripDoubleSlashes : function ( url ) {
      if ( ! url ) return '' ;
      return url.replace ( /(\/)\/+/g , '$1' ) ;
    } ,

    // Removes both leading and trailing slashes from a URL string.
    trimSlashes : function ( url ) {
      return url.replace ( /^\/|\/$/g , '' ) ;
    } ,

    stripOverlap : function ( url , overlapUrl ) {
      if ( ! url || ! overlapUrl ) return url ;

      var urlSections = urlHelper.trimSlashes ( url ).split ( '/' ) ,
          otherUrlSections = urlHelper.trimSlashes ( overlapUrl ).split ( '/' ) ,
          intersection = [ ] ,
          isMatching = false ;

      // Normalize array lengths to match for comparison.
      if ( urlSections.length > otherUrlSections.length ) {
        // If 'urlSections' is longer, trim from its beginning.
        urlSections.splice ( 0 , urlSections.length - otherUrlSections.length ) ;
      } else {
        // If 'otherUrlSections' is longer, trim from its end.
        otherUrlSections.length = urlSections.length ;
      }

      // Find the common intersection between the URL segments.
      while ( urlSections.length ) {

        for ( var i = 0 ; i < urlSections.length ; i ++ ) {
          if ( urlSections [ i ] === otherUrlSections [ i ] ) {
            isMatching = true ;
            intersection.push ( urlSections [ i ] ) ;
          } else {
            intersection = [ ] ; // Reset intersection on mismatch.
            isMatching = false ;
            break ;
          }
        }

        if ( isMatching ) break ;

        urlSections.shift ( ) ;    // Remove from start of urlSections.
        otherUrlSections.pop ( ) ; // Remove from end of otherUrlSections.
      }

      // Construct the intersection string and cut it from the original `url`.
      var intersectionStr = urlHelper.asUrl ( intersection.join ( '/' ) ) ;
      return urlHelper.asUrl ( intersectionStr.length ? url.substring ( 0 , url.indexOf ( intersectionStr ) ) : url ) ;
    } ,

    // Helper method for URL parameters.
    // Replaces URL parameter names (e.g., `:id`) with their actual values from `params`.
    setUrlParams : function ( url , params , ignoreMissing ) {
      if ( ! url ) return url ;

      return url.replace ( /\:\_*[A-Za-z]+/g , function ( param ) {
        param = param.replace ( /\:*/ , '' ) ;
        if ( params [ param ] === undefined && ! ignoreMissing ) _error ( 'No parameter "' + param + '" is available for URL ' + url ) ;
        return params [ param ] ;
      } ) ;
    } ,

    // This function conventionally appends the model's `id` (or the attribute
    // specified by `idAttribute`) to a given "base" URL.