// This program is free software. It comes without any warranty,
// to the extent permitted by applicable law.
// You can redistribute it and/or modify it under the terms
// of the Do What The Fuck You Want To Public License, Version 2,
// as published by Sam Hocevar.
// See http://sam.zoy.org/wtfpl/COPYING for more details.
//
// Source code: https://github.com/fabiooshiro/namespace-js
//
// Author: Fabio Issamu Oshiro (Sr. Oshiro)
// Reference: http://blog.stannard.net.au/2011/01/14/creating-namespaces-in-javascript/


var    namespace ; // Global namespace variable declaration.


(  function ( ) {

  var    hasBackboneJs    =    typeof ( Backbone )    !=    'undefined' ;
  var    root             =    this                                    ;
  var    loadDsl                                                         ;
  var    unloadDsl                                                       ;

  // Check if Backbone.js is available in the current environment
  if  ( hasBackboneJs )
  {
    // If Backbone.js is present, define DSL functions for models and views.
    loadDsl =  function ( ns ,  name )  {
      var    model    =  function ( modelName ,  body )  {
        // Assign a class name to the model based on the namespace and model name.
        body [ 'className' ]    =    name    +    '.'    +    modelName ;
        ns   [ modelName   ]    =    Backbone . Model . extend ( {
          defaults :    body
        } ) ;
      } ;
      var    view     =  function ( viewName ,  body )  {
        // Extend Backbone.View to create a new view within the namespace.
        ns   [ viewName    ]    =    Backbone . View . extend ( body ) ;
      } ;
      // Return the model and view creation functions.
      return  [ model ,  view ] ;
    } ;

    unloadDsl    =    function ( )  {
      // This function is intentionally left empty for Backbone.js scenario.
    } ;
  }
  else
  {
    // If Backbone.js is not present, define no-op DSL functions.
    loadDsl =  function ( ns ,  name )  {
    } ;
    unloadDsl    =    function ( )  {
    } ;
  }


  namespace    =    function ( name ,  publics )  {
    var    path     =    name . split ( '\.' ) ; // Split the namespace string by dot.
    var    cpath    =    ''                      ; // Current path accumulator.

    // Iterate through path segments to ensure each part of the namespace exists.
    for  ( var  i = 0 ;  i < path . length ;  i ++ )
    {
      cpath    +=    path [ i ] ; // Append current segment.
      // Check if the current path segment is undefined.
      if  ( typeof ( eval ( 'this.'    +    cpath ) )    ==    'undefined' )
      {
        eval ( cpath    +    '={}' ) ; // Create an empty object for the segment if it doesn't exist.
      }
      cpath    +=    '.' ; // Add a dot for the next segment.
    }

    var    ns    =    eval ( name ) ; // Get the final namespace object.
    var    dsl   =    loadDsl ( ns ,  name ) ; // Load the DSL functions for this namespace.

    // If 'publics' is a function, execute it to get the public members.
    if  ( typeof ( publics )    ==    'function' )
    {
      publics    =    publics . apply ( root ,  dsl ) ;
    }

    unloadDsl ( ) ; // Call unloadDsl (no-op if Backbone not present).

    // Assign all public members to the newly created or existing namespace object.
    for  ( var  key  in  publics )
    {
      ns [ key ]    =    publics [ key ] ;
    }
  } ;

} ) ( ) ;