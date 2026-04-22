"use strict";

( function ( jQ, winEnv, docElem, undefVal ) {


  var autoSuggestCompName = "mailAddressSuggester";

  var initialOptions = {
    suggestionCSSClass: "mas-hint",
    emailProviders: [
      "yahoo.com",
      "hotmail.com",
      "gmail.com",
      "me.com",
      "aol.com",
      "mac.com",
      "live.com",
      "comcast.net",
      "googlemail.com",
      "msn.com",
      "hotmail.co.uk",
      "yahoo.co.uk",
      "facebook.com",
      "verizon.net",
      "sbcglobal.net",
      "att.net",
      "gmx.com",
      "outlook.com",
      "icloud.com"
    ]
  };


  function MailHintComponent( targetElement, configParams ) {

    this._targetInput = jQ( targetElement );
    this.componentOptions = jQ.extend( true, {}, initialOptions, configParams ); // Perform a deep merge
    this._baseConfig = initialOptions;
    this._providerList = this.componentOptions.emailProviders;

    this.initializeComponent();
  }


  MailHintComponent.prototype = {

    initializeComponent: function () {

      // Polyfill for Array.prototype.indexOf if missing
      if ( !Array.prototype.indexOf ) {
        this.provideIndexOfPolyfill();
      }

      // Calculate the total horizontal padding and border of the input for positioning
      this.inputHorizontalOffset = ( this._targetInput.outerWidth( true ) - this._targetInput.width() ) / 2;

      // Encase the target input element within a new container
      var _wrapperDiv = jQ( "<div class='mas-input-container' />" ).css( {
        display: this._targetInput.css( "display" ),
        position: "relative",
        fontSize: this._targetInput.css( "fontSize" )
      } );
      this._targetInput.wrap( _wrapperDiv );


      // Generate a hidden span to measure the width of the current input value
      this._currentValMeasurer = jQ( "<span class='mas-value-tester' />" ).css( {
        visibility: "hidden",
        position: "absolute",
        display: "inline-block",
        fontFamily: this._targetInput.css( "fontFamily" ),
        fontWeight: this._targetInput.css( "fontWeight" ),
        letterSpacing: this._targetInput.css( "letterSpacing" )
      } ).insertAfter( this._targetInput );


      // Instantiate the visual overlay for suggestions
      /* Note: touchstart event requires jQuery 1.7 or newer */
      var verticalPaddingBorder = ( this._targetInput.outerHeight( true ) - this._targetInput.height() ) / 2; // Padding + border combined
      this._suggestionDisplay = jQ( "<span class='" + this.componentOptions.suggestionCSSClass + "' />" ).css( {
        display: "block",
        "box-sizing": "content-box", // Standardize box model
        lineHeight: this._targetInput.css( 'lineHeight' ),
        paddingTop: verticalPaddingBorder + "px",
        paddingBottom: verticalPaddingBorder + "px",
        fontFamily: this._targetInput.css( "fontFamily" ),
        fontWeight: this._targetInput.css( "fontWeight" ),
        letterSpacing: this._targetInput.css( "letterSpacing" ),
        position: "absolute",
        top: 0,
        left: 0
      } ).insertAfter( this._targetInput );


      // Attach event listeners and their respective handlers
      this._targetInput.on( "keyup.mailAutosugg", jQ.proxy( this.showCompletionHint, this ) );

      this._targetInput.on( "keydown.mailAutosugg", jQ.proxy( function ( eventObj ) {
        if ( eventObj.which === 39 || eventObj.which === 9 ) {
          this.performAutoCompletion();
        }
      }, this ) );

      this._suggestionDisplay.on( "mousedown.mailAutosugg touchstart.mailAutosugg", jQ.proxy( this.performAutoCompletion, this ) );
    },


    generateHint: function ( inputString ) {

      var stringParts = inputString.split( "@" );
      if ( stringParts.length > 1 ) {
        var domainPart = stringParts.pop();
        if ( !domainPart.length ) {
          return "";
        }
      } else {
        return "";
      }

      var foundMatch = this._providerList.filter( function ( providerName ) {
        return 0 === providerName.indexOf( domainPart );
      } ).shift() || "";

      return foundMatch.replace( domainPart, "" );
    },


    performAutoCompletion: function () {
      if ( typeof this.currentHint === "undefVal" || this.currentHint.length < 1 ) {
        return false;
      }
      this._targetInput.val( this.currentValue + this.currentHint );
      this._suggestionDisplay.text( "" );
      this._currentValMeasurer.text( "" );
    },


    /**
     * Displays the suggestion, handler for field keyup event
     */
    showCompletionHint: function ( eventObject ) {
      this.currentValue = this._targetInput.val();
      this.currentHint = this.generateHint( this.currentValue );

      if ( !this.currentHint.length ) {
        this._suggestionDisplay.text( "" );
      } else {
        eventObject.preventDefault();
      }

      // Update with the new suggestion
      this._suggestionDisplay.text( this.currentHint );
      this._currentValMeasurer.text( this.currentValue );

      // Find the width of the current input value so we can offset the suggestion text
      var measuredValueWidth = this._currentValMeasurer.width();

      if ( this._targetInput.outerWidth() > measuredValueWidth ) {
        // Offset our suggestion container
        this._suggestionDisplay.css( 'left', this.inputHorizontalOffset + measuredValueWidth + "px" );
      }
    },


    /**
     * Polyfill implementation for Array.prototype.indexOf
     * Source: MDN Web Docs for Array.prototype.indexOf polyfill
     */
    provideIndexOfPolyfill: function () {

      Array.prototype.indexOf = function ( itemToFind, startIndex ) {
        if ( this === undefVal || this === null ) {
          throw new TypeError( '"this" is null or not defined' );
        }

        var arrayLength = this.length >>> 0; // Hack to convert object.length to a UInt32

        startIndex = +startIndex || 0;

        if ( Math.abs( startIndex ) === Infinity ) {
          startIndex = 0;
        }

        if ( startIndex < 0 ) {
          startIndex += arrayLength;
          if ( startIndex < 0 ) {
            startIndex = 0;
          }
        }

        for ( ; startIndex < arrayLength; startIndex++ ) {
          if ( this[ startIndex ] === itemToFind ) {
            return startIndex;
          }
        }

        return -1;
      };
    }
  };


  jQ.fn[ autoSuggestCompName ] = function ( initSettings ) {
    return this.each( function () {
      if ( !jQ.data( this, "my_prefix_" + autoSuggestCompName ) ) {
        jQ.data( this, "my_prefix_" + autoSuggestCompName, new MailHintComponent( this, initSettings ) );
      }
    } );
  };


} )( jQuery, window, document );