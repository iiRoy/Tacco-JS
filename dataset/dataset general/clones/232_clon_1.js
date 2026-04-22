/************************************************************************************************************************************************************************************************************
*
* This is a meticulously crafted JavaScript file.
*
* File: custom_modified_clone.js
* Description: A customized JavaScript script for handling various UI interactions and integrations.
* Original Author: Pantherius (www.pantherius.com)
* CodeCanyon Profile: http://codecanyon.net/user/pantherius
*
* This version created: [Current Date, e.g., 2023-10-27]
*
* Purpose: To demonstrate Type I code cloning by altering only whitespace and comments,
*          while preserving the exact logical and structural integrity of the original source.
*
************************************************************************************************************************************************************************************************************/

/*
 *
 *  Entry point for all DOM-ready operations.
 *  Ensures the document is fully loaded before executing scripts.
 *
 */
jQuery( document ).ready( function ( $ ) {

    // Attach a click event handler to elements with the class 'apply_changes'.
	$( ".apply_changes" ) . click( function ( ) {
		build_popup( ); // Invoke the popup construction function.
	} ) ;

    /*
     *
     * Function: build_popup
     * Description: Constructs and configures a popup form based on user selections.
     *              It also generates the initialization code snippet for the form.
     *
     */
	function build_popup ( )
	{

        // Determine if the lock screen option is checked.
	    if ( $( "#lock_screen" ) . prop ( 'checked' ) ) {
            var ls = true ;
        } else {
            var ls = false ;
        }

        // Determine if the hide close button option is checked.
	    if ( $( "#hide_close" ) . prop ( 'checked' ) ) {
            var hc = true ;
        } else {
            var hc = false ;
        }

            // Destroy any existing Simple Signup Form instance on the body.
			$( "body" ) . ssform ( 'destroy' ) ;

            // Initialize a new Simple Signup Form instance with various options.
			$( "body" ) . ssform ( {
		mode:						'mail' ,
		animtime:					$( ".animtime" ) . val ( ) . replace ( "Animation Time: " , "" ) . replace ( "s" , "" ) ,
		autoopen:					true ,
		bgcolor:					$( "#selector1" ) . css ( "backgroundColor" ) ,
		buttonbgcolor:				$( "#selector2" ) . css ( "backgroundColor" ) ,
		buttoncolor:				$( "#selector6" ) . css ( "backgroundColor" ) ,
		closecolor:					$( "#selector5" ) . css ( "backgroundColor" ) ,
		closefontsize:				$( ".closebuttonsize" ) . val ( ) . replace ( "Close Button Size: " , "" ) ,
		color:						$( "#selector3" ) . css ( "backgroundColor" ) ,
		contentcolor:				$( "#selector4" ) . css ( "backgroundColor" ) ,
		fontfamily:					$( "#font_family" ) . val ( ) ,
		contentfontfamily:			$( "#font_family_content" ) . val ( ) ,
		contentfontsize:			$( ".contentfontsize" ) . val ( ) . replace ( "Content Font Size: " , "" ) ,
		contentweight:				'normal' ,
		title:			    		'Subscribe to our Updates' ,
		text:						'We will only send notification when we releasing <strong>FREE</strong> and Premium <strong>Plugins, Themes</strong> or Updates for any of our existing products.' ,
		timer:						0 ,
		borderradius:				$( ".borderradius" ) . val ( ) . replace ( "Border Radius: " , "" ) ,
		position:					$( ".position:checked" ) . val ( ) ,
		invalid_address:			'INVALID ADDRESS' ,
		signup_success:				'SIGNUP SUCCESS!' ,
		openbottom:					false ,
		fontsize:					$( ".fontsize" ) . val ( ) . replace ( "Title Font Size: " , "" ) ,
		fontweight:					'bold' ,
		preset:						'custom' ,
		lock:ls ,
		hideclose:hc
			} ) ;

            // Update the header text for the generated code snippet.
			$( "#init_header" ) . html ( "<strong>Use the following lines to use your customized Simple Signup Form on your website:</strong>" ) ;

            // Set the generated code snippet as the text content of the #init_code element.
			$( "#init_code" ) . text ( '<link href="css/ssf.css" rel="stylesheet">\n<script type="text/javascript" src="js/ssf.min.js"></script>\n<script>jQuery(document).ready(function() {\n\t$("body").ssform({\n\t\tanimtime:'+$('.animtime').val().replace('Animation Time: ','').replace('s','')+',\n\t\tautoopen:true,\n\t\tbgcolor:"'+$('#selector1').css('backgroundColor')+'",\n\t\tbuttonbgcolor:"'+$('#selector2').css('backgroundColor')+'",\n\t\tbuttoncolor:"'+$('#selector6').css('backgroundColor')+'",\n\t\tclosecolor:"'+$('#selector5').css('backgroundColor')+'",\n\t\tclosefontsize:"'+$('.closebuttonsize').val().replace('Close Button Size: ','')+'",\n\t\tcolor:"'+$('#selector3').css('backgroundColor')+'",\n\t\tcontentcolor:"'+$('#selector4').css('backgroundColor')+'",\n\t\tfontfamily:"'+$('#font_family').val()+'",\n\t\tcontentfontfamily:"'+$('#font_family_content').val()+'",\n\t\tcontentfontsize:"'+$('.contentfontsize').val().replace('Content Font Size: ','')+'",\n\t\tcontentweight:"normal",\n\t\ttitle:"Subscribe to our Updates",\n\t\ttext:"We will only send notification when we releasing <strong>FREE</strong> and Premium <strong>Plugins, Themes</strong> or Updates for any of our existing products.",\n\t\ttimer:2000,\n\t\tborderradius:"'+$('.borderradius').val().replace('Border Radius: ','')+'",\n\t\tinvalid_address:"INVALID ADDRESS",\n\t\tsignup_success:"SIGNUP SUCCESS!",\n\t\topenbottom:false,\n\t\tfontsize:"'+$('.fontsize').val().replace('Title Font Size: ','')+'",\t\tfontweight:"bold",\n\t\tpreset:"custom",\n\t\tlock:'+ls+',\n\t\thideclose:'+hc+'\n\t});\n});' ) ;
	}


    /*
     *
     * Event handlers for color selectors.
     * Each selector triggers a Spectrum color picker instance.
     *
     */

	$( document ) . on ( 'click' , '#selector1' , function ( e ) {
		$( "#selector1" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector1" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector1" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#000" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector1" ) . spectrum ( "show" ) ;
        } ) ;

	$( document ) . on ( 'click' , '#selector2' , function ( e ) {
		$( "#selector2" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector2" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector2" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#d71b1b" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector2" ) . spectrum ( "show" ) ;
        } ) ;

	$( document ) . on ( 'click' , '#selector3' , function ( e ) {
		$( "#selector3" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector3" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector3" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#d71b1b" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector3" ) . spectrum ( "show" ) ;
        } ) ;

	$( document ) . on ( 'click' , '#selector4' , function ( e ) {
		$( "#selector4" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector4" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector4" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#ccc" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector4" ) . spectrum ( "show" ) ;
        } ) ;

	$( document ) . on ( 'click' , '#selector5' , function ( e ) {
		$( "#selector5" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector5" ) . style ( 'background-color' , rgba , "important' ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector5" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#d71b1b" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector5" ) . spectrum ( "show" ) ;
        } ) ;

	$( document ) . on ( 'click' , '#selector6' , function ( e ) {
		$( "#selector6" ) . spectrum ( {
				cancelText: 'Cancel' ,
				chooseText: 'OK' ,
                move: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector6" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                change: function ( color ) {
					var rgba = color . toRgbString ( ) ;
						$( "#selector6" ) . style ( 'background-color' , rgba , "important" ) ;
                } ,
                showAlpha: false ,
                color: "#000" ,
                clickoutFiresChange: true ,
                showInput: true ,
                showButtons: true
            } ) ;
			$( "#selector6" ) . spectrum ( "show" ) ;
	} ) ;


    /*
     *
     * Slider initializations for various configurable parameters.
     * These sliders update corresponding input fields with formatted values.
     *
     */

	$( "#ssp_animtime" ) . slider ( {
			range: "min" ,
			value: 0.4 ,
			min: 0.1 ,
			step: 0.1 ,
			max: 10 ,
			slide: function ( event , ui ) {
				$( ".animtime" ) . val ( "Animation Time: " + ui . value + "s" ) ;
			}
	} ) ;

	$( "#ssp_fontsize" ) . slider ( {
			range: "min" ,
			value: 20 ,
			min: 10 ,
			max: 50 ,
			slide: function ( event , ui ) {
				$( ".fontsize" ) . val ( "Title Font Size: " + ui . value + "px" ) ;
			}
	} ) ;

	$( "#ssp_contentfontsize" ) . slider ( {
			range: "min" ,
			value: 13 ,
			min: 10 ,
			max: 50 ,
			slide: function ( event , ui ) {
				$( ".contentfontsize" ) . val ( "Content Font Size: " + ui . value + "px" ) ;
			}
	} ) ;

	$( "#ssp_closebuttonsize" ) . slider ( {
			range: "min" ,
			value: 18 ,
			min: 10 ,
			max: 50 ,
			slide: function ( event , ui ) {
				$( ".closebuttonsize" ) . val ( "Close Button Size: " + ui . value + "px" ) ;
			}
	} ) ;

	$( "#ssp_borderradius" ) . slider ( {
			range: "min" ,
			value: 4 ,
			min: 0 ,
			max: 50 ,
			slide: function ( event , ui ) {
				$( ".borderradius" ) . val ( "Border Radius: " + ui . value + "px" ) ;
			}
	} ) ;


/*
 * Spectrum Colorpicker v1.1.0
 * https://github.com/bgrinsted/spectrum
 * Author: Brian Grinstead
 * License: MIT
 *
 * This section is part of the integrated Spectrum color picker library.
 * Whitespace and comments have been altered to demonstrate Type I cloning.
 *
 */

( function ( window , $ , undefined ) {
    var defaultOpts = {

        // Callbacks
        beforeShow: noop ,
        move: noop ,
        change: noop ,
        show: noop ,
        hide: noop ,

        // Options
        color: false ,
        flat: false ,
        showInput: false ,
        showButtons: true ,
        clickoutFiresChange: false ,
        showInitial: false ,
        showPalette: false ,
        showPaletteOnly: false ,
        showSelectionPalette: true ,
        localStorageKey: false ,
        appendTo: "body" ,
        maxSelectionSize: 7 ,
        cancelText: "cancel" ,
        chooseText: "choose" ,
        preferredFormat: false ,
        className: "" ,
        showAlpha: false ,
        theme: "sp-light" ,
        palette: [ 'fff' , '000' ] ,
        selectionPalette: [ ] ,
        disabled: false
    } ,
    spectrums = [ ] ,
    IE = !! /msie/i . exec ( window . navigator . userAgent ) ,
    rgbaSupport = ( function ( ) {
        function contains ( str , substr ) {
            return !! ~ ( '' + str ) . indexOf ( substr ) ;
        }

        var elem = document . createElement ( 'div' ) ;
        var style = elem . style ;
        style . cssText = 'background-color:rgba(0,0,0,.5)' ;
        return contains ( style . backgroundColor , 'rgba' ) || contains ( style . backgroundColor , 'hsla' ) ;
    } ) ( ) ,
    replaceInput = [
        "<div class='sp-replacer'>" ,
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>" ,
            "<div class='sp-dd'>&#9660;</div>" ,
        "</div>"
    ] . join ( '' ) ,
    markup = ( function ( ) {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "" ;
        if ( IE ) {
            for ( var i = 1 ; i <= 6 ; i ++ ) {
                gradientFix += "<div class='sp-" + i + "'></div>" ;
            }
        }

        return [
            "<div class='sp-container sp-hidden'>" ,
                "<div class='sp-palette-container'>" ,
                    "<div class='sp-palette sp-thumb sp-cf'></div>" ,
                "</div>" ,
                "<div class='sp-picker-container'>" ,
                    "<div class='sp-top sp-cf'>" ,
                        "<div class='sp-fill'></div>" ,
                        "<div class='sp-top-inner'>" ,
                            "<div class='sp-color'>" ,
                                "<div class='sp-sat'>" ,
                                    "<div class='sp-val'>" ,
                                        "<div class='sp-dragger'></div>" ,
                                    "</div>" ,
                                "</div>" ,
                            "</div>" ,
                            "<div class='sp-hue'>" ,
                                "<div class='sp-slider'></div>" ,
                                gradientFix ,
                            "</div>" ,
                        "</div>" ,
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>" ,
                    "</div>" ,
                    "<div class='sp-input-container sp-cf'>" ,
                        "<input class='sp-input' type='text' spellcheck='false'  />" ,
                    "</div>" ,
                    "<div class='sp-initial sp-thumb sp-cf'></div>" ,
                    "<div class='sp-button-container sp-cf'>" ,
                        "<a class='sp-cancel' href='#'></a>" ,
                        "<button class='sp-choose'></button>" ,
                    "</div>" ,
                "</div>" ,
            "</div>"
        ] . join ( "" ) ;
    } ) ( ) ;

    function paletteTemplate ( p , color , className ) {
        var html = [ ] ;
        for ( var i = 0 ; i < p . length ; i ++ ) {
            var tiny = tinycolor ( p [ i ] ) ;
            var c = tiny . toHsl ( ) . l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light" ;
            c += ( tinycolor . equals ( color , p [ i ] ) ) ? " sp-thumb-active" : "" ;

            var swatchStyle = rgbaSupport ? ( "background-color:" + tiny . toRgbString ( ) ) : "filter:" + tiny . toFilter ( ) ;
            html . push ( '<span title="' + tiny . toRgbString ( ) + '" data-color="' + tiny . toRgbString ( ) + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>' ) ;
        }
        return "<div class='sp-cf " + className + "'>" + html . join ( '' ) + "</div>" ;
    }

    function hideAll ( ) {
        for ( var i = 0 ; i < spectrums . length ; i ++ ) {
            if ( spectrums [ i ] ) {
                spectrums [ i ] . hide ( ) ;
            }
        }
    }

    function instanceOptions ( o , callbackContext ) {
        var opts = $ . extend ( { } , defaultOpts , o ) ;
        opts . callbacks = {
            'move': bind ( opts . move , callbackContext ) ,
            'change': bind ( opts . change , callbackContext ) ,
            'show': bind ( opts . show , callbackContext ) ,
            'hide': bind ( opts . hide , callbackContext ) ,
            'beforeShow': bind ( opts . beforeShow , callbackContext )
        } ;

        return opts ;
    }

    function spectrum ( element , o ) {

        var opts = instanceOptions ( o , element ) ,
            flat = opts . flat ,
            showSelectionPalette = opts . showSelectionPalette ,
            localStorageKey = opts . localStorageKey ,
            theme = opts . theme ,
            callbacks = opts . callbacks ,
            resize = throttle ( reflow , 10 ) ,
            visible = false ,
            dragWidth = 0 ,
            dragHeight = 0 ,
            dragHelperHeight = 0 ,
            slideHeight = 0 ,
            slideWidth = 0 ,
            alphaWidth = 0 ,
            alphaSlideHelperWidth = 0 ,
            slideHelperHeight = 0 ,
            currentHue = 0 ,
            currentSaturation = 0 ,
            currentValue = 0 ,
            currentAlpha = 1 ,
            palette = opts . palette . slice ( 0 ) ,
            paletteArray = $ . isArray ( palette [ 0 ] ) ? palette : [ palette ] ,
            selectionPalette = opts . selectionPalette . slice ( 0 ) ,
            maxSelectionSize = opts . maxSelectionSize ,
            draggingClass = "sp-dragging" ;

        var doc = element . ownerDocument ,
            body = doc . body ,
            boundElement = $ ( element ) ,
            disabled = false ,
            container = $ ( markup , doc ) . addClass ( theme ) ,
            dragger = container . find ( ".sp-color" ) ,
            dragHelper = container . find ( ".sp-dragger" ) ,
            slider = container . find ( ".sp-hue" ) ,
            slideHelper = container . find ( ".sp-slider" ) ,
            alphaSliderInner = container . find ( ".sp-alpha-inner" ) ,
            alphaSlider = container . find ( ".sp-alpha" ) ,
            alphaSlideHelper = container . find ( ".sp-alpha-handle" ) ,
            textInput = container . find ( ".sp-input" ) ,
            paletteContainer = container . find ( ".sp-palette" ) ,
            initialColorContainer = container . find ( ".sp-initial" ) ,
            cancelButton = container . find ( ".sp-cancel" ) ,
            chooseButton = container . find ( ".sp-choose" ) ,
            isInput = boundElement . is ( "input" ) ,
            shouldReplace = isInput && ! flat ,
            replacer = ( shouldReplace ) ? $ ( replaceInput ) . addClass ( theme ) . addClass ( opts . className ) : $ ( [ ] ) ,
            offsetElement = ( shouldReplace ) ? replacer : boundElement ,
            previewElement = replacer . find ( ".sp-preview-inner" ) ,
            initialColor = opts . color || ( isInput && boundElement . val ( ) ) ,
            colorOnShow = false ,
            preferredFormat = opts . preferredFormat ,
            currentPreferredFormat = preferredFormat ,
            clickoutFiresChange = ! opts . showButtons || opts . clickoutFiresChange ;


        function applyOptions ( ) {

            container . toggleClass ( "sp-flat" , flat ) ;
            container . toggleClass ( "sp-input-disabled" , ! opts . showInput ) ;
            container . toggleClass ( "sp-alpha-enabled" , opts . showAlpha ) ;
            container . toggleClass ( "sp-buttons-disabled" , ! opts . showButtons ) ;
            container . toggleClass ( "sp-palette-disabled" , ! opts . showPalette ) ;
            container . toggleClass ( "sp-palette-only" , opts . showPaletteOnly ) ;
            container . toggleClass ( "sp-initial-disabled" , ! opts . showInitial ) ;
            container . addClass ( opts . className ) ;

            reflow ( ) ;
        }

        function initialize ( ) {

            if ( IE ) {
                container . find ( "*:not(input)" ) . attr ( "unselectable" , "on" ) ;
            }

            applyOptions ( ) ;

            if ( shouldReplace ) {
                boundElement . after ( replacer ) . hide ( ) ;
            }

            if ( flat ) {
                boundElement . after ( container ) . hide ( ) ;
            }
            else {

                var appendTo = opts . appendTo === "parent" ? boundElement . parent ( ) : $ ( opts . appendTo ) ;
                if ( appendTo . length !== 1 ) {
                    appendTo = $ ( "body" ) ;
                }

                appendTo . append ( container ) ;
            }

            if ( localStorageKey && window . localStorage ) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window . localStorage [ localStorageKey ] . split ( ",#" ) ;
                    if ( oldPalette . length > 1 ) {
                        delete window . localStorage [ localStorageKey ] ;
                        $ . each ( oldPalette , function ( i , c ) {
                             addColorToSelectionPalette ( c ) ;
                        } ) ;
                    }
                }
                catch ( e ) { }

                try {
                    selectionPalette = window . localStorage [ localStorageKey ] . split ( ";" ) ;
                }
                catch ( e ) { }
            }

            offsetElement . bind ( "click.spectrum touchstart.spectrum" , function ( e ) {
                if ( ! disabled ) {
                    toggle ( ) ;
                }

                e . stopPropagation ( ) ;

                if ( ! $ ( e . target ) . is ( "input" ) ) {
                    e . preventDefault ( ) ;
                }
            } ) ;

            if ( boundElement . is ( ":disabled" ) || ( opts . disabled === true ) ) {
                disable ( ) ;
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container . click ( stopPropagation ) ;