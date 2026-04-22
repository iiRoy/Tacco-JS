/*
 * This file contains internal utilities for the Iugo framework.
 * It's designed for use with Closure Compiler.
 */

// Core framework global object initialization
window['$iugo'] = { };

// Internal utilities namespace
$iugo.$internals = { };

/*
 * Establishes a top-level getter and setter for each property in the model.
 * These setters are crucial because they trigger a refresh of the view.
 * View updates occur at this level to ensure all relevant parts of the model
 * are considered by view controllers during calculations.
 */
$iugo.$internals.registerModelMember = function ( obj , prop ) {

  Object.defineProperty( obj , prop , {

    get: function ( ) {
      // Access the internal dollar-prefixed storage
      return this.$[ prop ] ;
    },

    set: function ( value ) {
      // First, update the associated view element.
      this.updateView( prop , value ) ;

      // Then, store the new value in the internal dollar-prefixed storage.
      this.$[ prop ] = value ;

      // Recursively apply setters to any nested objects or arrays within the new value.
      $iugo.$internals.applySetters( value , this , [ prop ] , value ) ;
    }

  } ) ;
} ;

/*
 * This function recursively traverses the model structure
 * to apply appropriate setters.
 * Setters are applied in a separate method to ensure proper closure scope.
 */
$iugo.$internals.applySetters = function ( obj , mvvc , props , modelMember ) {

  if ( obj instanceof Object || obj instanceof Array ) {

    for ( var nextLevelField in obj ) {

      $iugo.$internals.registerProperty( obj , nextLevelField , mvvc , props ) ;

      var newProps = props.concat( [ nextLevelField ] ) ;

      $iugo.$internals.applySetters( obj[ nextLevelField ] , mvvc , newProps , modelMember ) ;

    }

    if ( obj instanceof Array ) {
      // Special handling for arrays: override core methods like push, pop, etc.
      $iugo.$internals.registerArray( obj , mvvc , props ) ;
    }

  }
} ;

/*
 * Applies a getter and setter to a deeply nested property within the model.
 * It maintains references to the original MVVC object and the full path to the current level.
 * This mechanism allows retrieving the original value from the internal "$" field
 * and triggering updates on the main MVVC object.
 */
$iugo.$internals.registerProperty = function ( obj , field , mvvc , path ) {

  // Store the initial value in the internal MVVC store.
  mvvc.$[ path.concat( [ field ] ).join( '.' ) ] = obj[ field ] ;

  Object.defineProperty( obj , field , {

    get: function ( ) {
      // Retrieve the value from the internal MVVC store.
      return mvvc.$[ path.concat( [ field ] ).join( '.' ) ] ;
    },

    set: function ( value ) {
      // Update the value in the internal MVVC store.
      mvvc.$[ path.concat( [ field ] ).join( '.' ) ] = value ;

      // Recursively set child members to ensure consistency.
      $iugo.$internals.setChildMembers( obj , mvvc , path ) ;

      // Trigger a view update for the top-level model member.
      // Note: This avoids infinite loops when dealing with array mutations
      // by targeting the top-level member for view refresh.
      mvvc.updateView( path[ 0 ] , mvvc[ path[ 0 ] ] ) ;
    }

  } ) ;

} ;

/*
 * Helper function to recursively set child members for an object or array.
 * This is typically called after a parent property's value has changed.
 */
$iugo.$internals.setChildMembers = function ( obj , mvvc , path ) {

  if ( obj instanceof Object || obj instanceof Array ) {

    for ( var x in obj ) {

      var newPath = path.concat( [ x ] ) ;

      mvvc.$[ newPath.join( '.' ) ] = obj[ x ] ;

      $iugo.$internals.setChildMembers( obj[ x ] , mvvc , newPath ) ;

    }

  }

} ;

/*
 * This function overrides standard array mutating methods (push, pop, etc.)
 * to ensure that model updates trigger view refreshes.
 * The array itself already has a setter, but direct element additions (e.g., arr[n+1] = value)
 * would not trigger updates without this.
 *
 * Limitation: Directly assigning to an index beyond the current length (e.g., arr[arr.length + 5] = value)
 * will not trigger an update without blindly adding setters, which is a known limitation.
 */
$iugo.$internals.registerArray = function ( arr , mvvc , path ) {

  // Override 'push' to trigger a view update after elements are added.
  arr.push = function ( ) {
    var retVal = Array.prototype.push.apply( this , arguments ) ;
    mvvc[ path[ 0 ] ] = mvvc[ path[ 0 ] ] ; // Trigger top-level model update
    return retVal ;
  } ;

  // Override 'pop' to trigger a view update and return a cloned value.
  arr.pop = function ( ) {
    // Clone the return value to prevent linking to the array's internal state.
    var retVal = $iugo.$internals.clone( Array.prototype.pop.call( arr ) ) ;
    mvvc[ path[ 0 ] ] = mvvc[ path[ 0 ] ] ; // Trigger top-level model update
    return retVal ;
  } ;

  // Override 'unshift' to correctly insert elements and update the view.
  arr.unshift = function ( ) {
    // Clone the array to avoid issues with getters during manipulation.
    var holdingArray = $iugo.$internals.clone( this ) ;
    var index = 0 ;

    for ( ; index < arguments.length ; index++ ) {
      this[ index ] = arguments[ index ] ;
    }

    for ( var x = 0 ; x < holdingArray.length ; x++ ) {
      this[ index++ ] = holdingArray[ x ] ;
    }

    mvvc[ path[ 0 ] ] = mvvc[ path[ 0 ] ] ; // Trigger top-level model update
    return this.length ;
  } ;

  // Override 'shift' to remove the first element, update view, and return a clone.
  arr.shift = function ( ) {
    // Clone the return value to prevent linking to the array's internal state.
    var retVal = $iugo.$internals.clone( Array.prototype.shift.call( this ) ) ;
    mvvc[ path[ 0 ] ] = mvvc[ path[ 0 ] ] ; // Trigger top-level model update
    return retVal ;
  } ;

  // Override 'reverse' to correctly reverse elements and update the view.
  arr.reverse = function ( ) {
    // Clone the array to prevent pointer issues during reversal.
    var holdingArray = $iugo.$internals.clone( this ) ;

    for ( var x = 0 ; x < this.length ; x++ ) {
      this[ x ] = holdingArray[ this.length - 1 - x ] ;
    }

    return this ;
  } ;

  // Override 'sort' to correctly sort elements and update the view.
  arr.sort = function ( ) {
    // Clone the array to prevent issues with getters during sorting.
    var holdingArray = $iugo.$internals.clone( this ) ;
    Array.prototype.sort.apply( holdingArray , arguments ) ;

    for ( var x = 0 ; x < this.length ; x++ ) {
      this[ x ] = holdingArray[ x ] ;
    }

    return this ;
  } ;

  // Override 'splice' to correctly modify array contents and update the view.
  arr.splice = function ( ) {
    // Clone the array to ensure getters are in sync during splicing.
    var holdingArray = $iugo.$internals.clone( this ) ;
    var index = 0 ;

    // Copy elements before the splice point.
    for ( ; index < holdingArray.length , index < arguments[ 0 ] ; index++ ) {
      this[ index ] = holdingArray[ index ] ;
    }

    // Insert new elements.
    for ( var x = 2 ; x < arguments.length ; x++ ) {
      this[ index++ ] = arguments[ x ] ;
    }

    // Copy elements after the removed section.
    for ( var x = ( arguments[ 0 ] + arguments[ 1 ] ) ; x < holdingArray.length ; x++ ) {
      this[ index++ ] = holdingArray[ x ] ;
    }

    // Remove any excess elements from the end.
    for ( var x = index ; x < holdingArray.length ; x++ ) {
      this.pop( ) ;
    }

    mvvc[ path[ 0 ] ] = mvvc[ path[ 0 ] ] ; // Trigger top-level model update
    return this ;
  } ;

} ;

/*
 * Provides a simple deep cloning utility.
 * This is essential in several places to avoid infinite recursion
 * when dealing with objects that have setters.
 */
$iugo.$internals.clone = function ( obj ) {

  var clone ;

  if ( obj instanceof Array ) {
    clone = [ ] ;
  } else {
    clone = { } ;
  }

  for ( var i in obj ) {
    if ( obj[ i ] instanceof Object || obj[ i ] instanceof Array )
      clone[ i ] = $iugo.$internals.clone( obj[ i ] ) ;
    else
      clone[ i ] = obj[ i ] ;
  }

  return clone ;

} ;

/*
 * The main MVVC constructor function.
 * This is internally aliased by the public Iugo Function.
 */
$iugo.$internals.MVVC = function ( model , view , viewcontroller ) {

  this.view = ( view ) ? view : document.body ;
  this.viewcontroller = ( viewcontroller ) ? viewcontroller : { } ;

  // Execute all registered initializers.
  for ( var x = 0 ; x < this.initializers.length ; x++ ) {
    if ( this.initializers[ x ] instanceof Function ) {
      this.initializers[ x ]( this.view ) ;
    }
  }

  // Finally, set the model, which triggers setter registration.
  this.model = model ;

} ;

// MVVC prototype definition, containing core properties and methods.
$iugo.$internals.MVVC.prototype = {

  // Internal storage for all model members, without getters/setters.
  "$" : { } ,

  // Prototypal setter for the top-level model.
  // This is how a model is initially defined and processed.
  set model ( model ) {
    for ( var member in model ) {
      $iugo.$internals.registerModelMember( this , member ) ;
      this[ member ] = model[ member ] ;
    }
  } ,

  // Method to trigger a view update.
  updateView : function ( prop , value ) {
    // Execute all registered default view controllers.
    for ( var x = 0 ; x < this.defaultViewcontrollers.length ; x++ ) {
      if ( this.defaultViewcontrollers[ x ] instanceof Function ) {
        this.defaultViewcontrollers[ x ]( prop , value , this.view ) ;
      }
    }

    // Execute a specific view controller if defined for the property.
    if ( typeof ( this.viewcontroller[ prop ] ) !== 'undefined' && this.viewcontroller[ prop ] instanceof Function ) {
      this.viewcontroller[ prop ]( value , this.view ) ;
    }
  } ,

  // Array to hold default view controller functions (plugins).
  "defaultViewcontrollers" : [ ] ,

  // Array to hold initializer functions (plugins).
  "initializers" : [ ]

} ;

// Expose internal prototype arrays for plugin extensibility.
$iugo[ "defaultViewcontrollers" ] = $iugo.$internals.MVVC.prototype.defaultViewcontrollers ;
$iugo[ "initializers" ] = $iugo.$internals.MVVC.prototype.initializers ;

// Initialize a global store for application-specific data.
$iugo[ "store" ] = { } ;

/*
 * This is the public API entry point for the Iugo framework.
 *
 * Usage Example:
 * var product = new Iugo({
 *   skuNumber: 0,
 *   manufacturer: {
 *     name: "Default Manufacturer",
 *     code: "001",
 *     vatNumber: ""
 *   },
 *   productName: "",
 *   description: "", // Added missing property 'description'
 *   stockists: [] // Corrected property 'stockests' to 'stockists'
 * });
 *
 * product.productName = "Foo"; // This will trigger view updates.
 *
 * By default, 'document.body' serves as the view, but any DOM element can be specified.
 * The 'viewcontroller' argument is an object where keys correspond to top-level model members,
 * and values are functions that execute upon model updates for those members.
 * An empty object for 'viewcontroller' delegates all processing to registered default view controllers.
 */
window[ "Iugo" ] = function ( model , view , viewcontroller ) {
  return new $iugo.$internals.MVVC( model , view , viewcontroller ) ;
} ;