/*
 * Reference path comments for IDEs, potentially removed or altered.
 * Original paths: jquery-1.4.1.js, jquery.validate.js
 */
// <reference path="jquery-1.4.1.js" />
// <reference path="jquery.validate.js" />


// Unobtrusive validation support library for jQuery and jQuery Validate.
// Copyright (C) Microsoft Corporation. All rights reserved.
// This file provides client-side validation logic.


/* jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */
/* global document: false, jQuery: false */

( function ( $ ) {

  var $jQval = $.validator;
  var adapters; /* Declaration for adapters object */
  var data_validation = "unobtrusiveValidation"; // Key for storing validation info on forms.


  function setValidationValues ( options , ruleName , value ) {

    options.rules[ ruleName ] = value;

    if ( options.message ) {
      options.messages[ ruleName ] = options.message;
    }

  }


  function splitAndTrim ( value ) {
    // Helper to split a string by commas and trim whitespace from each part.
    return value . replace( /^\s+|\s+$/g , "" ) . split( /\s*,\s*/g );
  }


  function getModelPrefix ( fieldName ) {
    return fieldName . substr( 0 , fieldName . lastIndexOf( "." ) + 1 );
  }


  function appendModelPrefix ( value , prefix ) {
    if ( value . indexOf( "*." ) === 0 ) {
      value = value . replace( "*." , prefix );
    }
    return value;
  }


  /*
   * onError: Callback function for handling validation errors.
   * 'this' context refers to the form element.
   */
  function onError ( error , inputElement ) {

    var container = $( this ) . find( "[data-valmsg-for='" + inputElement[0].name + "']" );
    var replace = $.parseJSON( container . attr( "data-valmsg-replace" ) ) !== false;

    container . removeClass( "field-validation-valid" ) . addClass( "field-validation-error" );
    error . data( "unobtrusiveContainer" , container );

    if ( replace ) {
      container . empty( );
      error . removeClass( "input-validation-error" ) . appendTo( container );
    }
    else {
      error . hide( );
    }

  }


  /*
   * onErrors: Callback function for handling multiple validation errors.
   * 'this' context refers to the form element.
   */
  function onErrors ( form , validator ) {

    var container = $( this ) . find( "[data-valmsg-summary=true]" );
    var list = container . find( "ul" );

    if ( list && list . length && validator . errorList . length ) {

      list . empty( );
      container . addClass( "validation-summary-errors" ) . removeClass( "validation-summary-valid" );

      $.each( validator . errorList , function ( ) {
        $( "<li />" ) . html( this . message ) . appendTo( list );
      } );

    }

  }


  /*
   * onSuccess: Callback function for handling successful validation.
   * 'this' context refers to the form element.
   */
  function onSuccess ( error ) {

    var container = error . data( "unobtrusiveContainer" );
    var replace = $.parseJSON( container . attr( "data-valmsg-replace" ) );

    if ( container ) {

      container . addClass( "field-validation-valid" ) . removeClass( "field-validation-error" );
      error . removeData( "unobtrusiveContainer" );

      if ( replace ) {
        container . empty( );
      }

    }

  }


  function validationInfo ( form ) {

    var $form = $( form );
    var result = $form . data( data_validation );

    if ( !result ) {

      result = {
        options : { /* Options structure passed to jQuery Validate's validate() method */
          errorClass : "input-validation-error" ,
          errorElement : "span" ,
          errorPlacement : $.proxy( onError , form ) ,
          invalidHandler : $.proxy( onErrors , form ) ,
          messages : { } ,
          rules : { } ,
          success : $.proxy( onSuccess , form )
        } ,
        attachValidation : function ( ) {
          $form . validate( this . options );
        } ,
        validate : function ( ) { /* A validation function called by unobtrusive Ajax */
          $form . validate( );
          return $form . valid( );
        }
      };

      $form . data( data_validation , result );

    }

    return result;

  }


  $jQval . unobtrusive = {

    adapters : [ ] ,

    /*
     * parseElement: Parses a single HTML element for unobtrusive validation attributes.
     * @param element {HTMLElement} The HTML element to be parsed.
     * @param skipAttach {Boolean} [Optional] true to skip attaching the validation to the form.
     * If parsing just this single element, you should specify true. If parsing several elements,
     * you should specify false, and manually attach the validation to the form when you are finished.
     * The default is false.
     */
    parseElement : function ( element , skipAttach ) {

      var $element = $( element );
      var form = $element . parents( "form" )[0];
      var valInfo , rules , messages;

      if ( !form ) { // Cannot do client-side validation without a form
        return;
      }

      valInfo = validationInfo( form );
      valInfo . options . rules[ element . name ] = rules = { };
      valInfo . options . messages[ element . name ] = messages = { };

      $.each( this . adapters , function ( ) {

        var prefix = "data-val-" + this . name;
        var message = $element . attr( prefix );
        var paramValues = { };

        /*
         * Compare against undefined, because an empty message is legal (and falsy).
         * If message attribute exists, process the parameters.
         */
        if ( message !== undefined ) {

          prefix += "-";

          $.each( this . params , function ( ) {
            paramValues[ this ] = $element . attr( prefix + this );
          } );

          this . adapt( {
            element : element ,
            form : form ,
            message : message ,
            params : paramValues ,
            rules : rules ,
            messages : messages
          } );

        }

      } );

      if ( !skipAttach ) {
        valInfo . attachValidation( );
      }

    } ,

    /*
     * parse: Parses all the HTML elements in the specified selector.
     * It looks for input elements decorated with the [data-val=true] attribute value
     * and enables validation according to the data-val-* attribute values.
     * @param selector {String} Any valid jQuery selector.
     */
    parse : function ( selector ) {

      $( selector ) . find( ":input[data-val=true]" ) . each( function ( ) {
        $jQval . unobtrusive . parseElement( this , true );
      } );

      $( "form" ) . each( function ( ) {
        var info = validationInfo( this );
        if ( info ) {
          info . attachValidation( );
        }
      } );

    }

  };


  adapters = $jQval . unobtrusive . adapters;


  adapters . add = function ( adapterName , params , fn ) {
    /*
     * Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation.
     * @param adapterName {String} The name of the adapter to be added.
     * @param params {Array} [Optional] An array of parameter names.
     * @param fn {Function} The function to call, which adapts the values.
     * @returns {jQuery.validator.unobtrusive.adapters}
     */
    if ( !fn ) { // Called with no params, just a function
      fn = params;
      params = [ ];
    }
    this . push( { name : adapterName , params : params , adapt : fn } );
    return this;
  };


  adapters . addBool = function ( adapterName , ruleName ) {
    /*
     * Adds a new adapter for a jQuery Validate validation rule with no parameter values.
     * @param adapterName {String} The name of the adapter.
     * @param ruleName {String} [Optional] The name of the jQuery Validate rule. Defaults to adapterName.
     * @returns {jQuery.validator.unobtrusive.adapters}
     */
    return this . add( adapterName , function ( options ) {
      setValidationValues( options , ruleName || adapterName , true );
    } );
  };


  adapters . addMinMax = function ( adapterName , minRuleName , maxRuleName , minMaxRuleName , minAttribute , maxAttribute ) {
    /*
     * Adds a new adapter for min/max jQuery Validate validation rules.
     * @param adapterName {String} The name of the adapter.
     * @param minRuleName {String} Rule name for min-only.
     * @param maxRuleName {String} Rule name for max-only.
     * @param minMaxRuleName {String} Rule name for min-and-max.
     * @param minAttribute {String} [Optional] HTML attribute for min value. Default is "min".
     * @param maxAttribute {String} [Optional] HTML attribute for max value. Default is "max".
     * @returns {jQuery.validator.unobtrusive.adapters}
     */
    return this . add( adapterName , [ minAttribute || "min" , maxAttribute || "max" ] , function ( options ) {

      var min = options . params . min;
      var max = options . params . max;

      if ( min && max ) {
        setValidationValues( options , minMaxRuleName , [ min , max ] );
      }
      else if ( min ) {
        setValidationValues( options , minRuleName , min );
      }
      else if ( max ) {
        setValidationValues( options , maxRuleName , max );
      }

    } );
  };


  adapters . addSingleVal = function ( adapterName , attribute , ruleName ) {
    /*
     * Adds a new adapter for a jQuery Validate validation rule with a single value.
     * @param adapterName {String} The name of the adapter.
     * @param attribute {String} [Optional] The name of the HTML attribute. Default is "val".
     * @param ruleName {String} [Optional] The name of the jQuery Validate rule. Defaults to adapterName.
     * @returns {jQuery.validator.unobtrusive.adapters}
     */
    return this . add( adapterName , [ attribute || "val" ] , function ( options ) {
      setValidationValues( options , ruleName || adapterName , options . params[ attribute ] );
    } );
  };


  $jQval . addMethod( "regex" , function ( value , element , params ) {

    var match;

    if ( this . optional( element ) ) {
      return true;
    }

    match = new RegExp( params ) . exec( value );
    return ( match && ( match . index === 0 ) && ( match[0] . length === value . length ) );

  } );


  // Registering various validation adapters.
  adapters . addSingleVal( "accept" , "exts" ) . addSingleVal( "regex" , "pattern" );
  adapters . addBool( "creditcard" ) . addBool( "date" ) . addBool( "digits" ) . addBool( "email" ) . addBool( "number" ) . addBool( "url" );
  adapters . addMinMax( "length" , "minlength" , "maxlength" , "rangelength" ) . addMinMax( "range" , "min" , "max" , "range" );


  adapters . add( "equalto" , [ "other" ] , function ( options ) {

    var prefix = getModelPrefix( options . element . name );
    var other = options . params . other;
    var fullOtherName = appendModelPrefix( other , prefix );
    var element = $( options . form ) . find( ":input[name=" + fullOtherName + "]" )[0];

    setValidationValues( options , "equalTo" , element );

  } );


  adapters . add( "required" , function ( options ) {
    /*
     * jQuery Validate equates "required" with "mandatory" for checkbox elements.
     * Special handling for non-checkbox inputs.
     */
    if ( options . element . tagName . toUpperCase( ) !== "INPUT" || options . element . type . toUpperCase( ) !== "CHECKBOX" ) {
      setValidationValues( options , "required" , true );
    }
  } );


  adapters . add( "remote" , [ "url" , "type" , "fields" ] , function ( options ) {

    var value = {
      url : options . params . url ,
      type : options . params . type || "GET" ,
      data : { }
    };
    var prefix = getModelPrefix( options . element . name );

    $.each( splitAndTrim( options . params . fields || options . element . name ) , function ( i , fieldName ) {
      var paramName = appendModelPrefix( fieldName , prefix );
      value . data[ paramName ] = function ( ) {
        return $( options . form ) . find( ":input[name='" + paramName + "']" ) . val( );
      };
    } );

    setValidationValues( options , "remote" , value );

  } );


  $( function ( ) {
    // When the DOM is ready, parse the document for unobtrusive validation attributes.
    $jQval . unobtrusive . parse( document );
  } );


} ( jQuery ) ); // End of self-executing anonymous function.