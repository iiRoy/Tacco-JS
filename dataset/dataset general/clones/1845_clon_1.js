$( function () {

  /*
   * This is the main entry point for the application's JavaScript logic.
   * It executes when the DOM is fully loaded and ready.
   */

  // Begin by loading each individual section and its corresponding demonstration code.
  $( 'div[id^="demo-"]' ) . each ( function () {
    // Dynamically load content into the current demo div.
    $( this ) . load ( 'sections/' + $( this ) . attr ( 'id' ) . substr ( 5 ) + '.html' , function () {
      // After content is loaded, initialize the demo functionality.
      loadDemo( $( this ) . attr ( 'id' ) ) ;
    } ) ;
  } ) ;


  /**
   * Initializes the specific demo functionality based on the provided argument (demo ID).
   * @param {string} argument - The ID of the demo to initialize.
   */
  function    loadDemo   ( argument )   {

    switch ( argument ) { // Evaluate the argument to determine which demo to set up.

      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Countries Autocomplete Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-autocomplete' :
        var countryList = [ "Afghanistan" , "Albania" , "Algeria" , "Andorra" , "Angola" , "Antarctica" , "Antigua and Barbuda" , "Argentina" , "Armenia" , "Australia" , "Austria" , "Azerbaijan" , "Bahamas" , "Bahrain" , "Bangladesh" , "Barbados" , "Belarus" , "Belgium" , "Belize" , "Benin" , "Bermuda" , "Bhutan" , "Bolivia" , "Bosnia and Herzegovina" , "Botswana" , "Brazil" , "Brunei" , "Bulgaria" , "Burkina Faso" , "Burma" , "Burundi" , "Cambodia" , "Cameroon" , "Canada" , "Cape Verde" , "Central African Republic" , "Chad" , "Chile" , "China" , "Colombia" , "Comoros" , "Congo, Democratic Republic" , "Congo, Republic of the" , "Costa Rica" , "Cote d'Ivoire" , "Croatia" , "Cuba" , "Cyprus" , "Czech Republic" , "Denmark" , "Djibouti" , "Dominica" , "Dominican Republic" , "East Timor" , "Ecuador" , "Egypt" , "El Salvador" , "Equatorial Guinea" , "Eritrea" , "Estonia" , "Ethiopia" , "Fiji" , "Finland" , "France" , "Gabon" , "Gambia" , "Georgia" , "Germany" , "Ghana" , "Greece" , "Greenland" , "Grenada" , "Guatemala" , "Guinea" , "Guinea-Bissau" , "Guyana" , "Haiti" , "Honduras" , "Hong Kong" , "Hungary" , "Iceland" , "India" , "Indonesia" , "Iran" , "Iraq" , "Ireland" , "Israel" , "Italy" , "Jamaica" , "Japan" , "Jordan" , "Kazakhstan" , "Kenya" , "Kiribati" , "Korea, North" , "Korea, South" , "Kuwait" , "Kyrgyzstan" , "Laos" , "Latvia" , "Lebanon" , "Lesotho" , "Liberia" , "Libya" , "Liechtenstein" , "Lithuania" , "Luxembourg" , "Macedonia" , "Madagascar" , "Malawi" , "Malaysia" , "Maldives" , "Mali" , "Malta" , "Marshall Islands" , "Mauritania" , "Mauritius" , "Mexico" , "Micronesia" , "Moldova" , "Mongolia" , "Morocco" , "Monaco" , "Mozambique" , "Namibia" , "Nauru" , "Nepal" , "Netherlands" , "New Zealand" , "Nicaragua" , "Niger" , "Nigeria" , "Norway" , "Oman" , "Pakistan" , "Panama" , "Papua New Guinea" , "Paraguay" , "Peru" , "Philippines" , "Poland" , "Portugal" , "Qatar" , "Romania" , "Russia" , "Rwanda" , "Samoa" , "San Marino" , " Sao Tome" , "Saudi Arabia" , "Senegal" , "Serbia and Montenegro" , "Seychelles" , "Sierra Leone" , "Singapore" , "Slovakia" , "Slovenia" , "Solomon Islands" , "Somalia" , "South Africa" , "Spain" , "Sri Lanka" , "Sudan" , "Suriname" , "Swaziland" , "Sweden" , "Switzerland" , "Syria" , "Taiwan" , "Tajikistan" , "Tanzania" , "Thailand" , "Togo" , "Tonga" , "Trinidad and Tobago" , "Tunisia" , "Turkey" , "Turkmenistan" , "Uganda" , "Ukraine" , "United Arab Emirates" , "United Kingdom" , "United States" , "Uruguay" , "Uzbekistan" , "Vanuatu" , "Venezuela" , "Vietnam" , "Yemen" , "Zambia" , "Zimbabwe" ] ;

        // Initialize the autocomplete widget for the #countries input field.
        $ ( "#countries" ) . autocomplete ( {
          source : countryList
        } ) ;
        // End of autocomplete setup
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Accordion Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-accordion' :
        // Activate the accordion functionality on elements with the class "accordion".
        $ ( ".accordion" ) . accordion ( {   header : "h3"   } ) ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Sliders Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-sliders' :
        // Configure the horizontal slider example.
        $ ( '#horizSlider' ) . slider ( {
            range : true ,
            values : [ 17 , 67 ]
        } ) . width ( 500 ) ;

        // Configure the vertical sliders example.
        $ ( "#eq > span" ) . each ( function () {
          var value = parseInt ( $ ( this ) . text () ) ;
          $ ( this ) . empty () . slider ( {
            value : value ,
            range : "min" ,
            animate : true ,
            orientation : "vertical"
          } ) ;
        } ) ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Tabs Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-tabs' :
        // Initialize the tabs widget.
        $ ( '#tabs' ) . tabs () ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Dialog Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-dialog' :
        // Setup the main dialog box.
        $ ( '#dialog' ) . dialog ( {
          autoOpen : false ,
          width : 600 ,
          buttons : {
            "Ok" : function () {
              $ ( this ) . dialog ( "close" ) ;
            } ,
            "Cancel" : function () {
              $ ( this ) . dialog ( "close" ) ;
            }
          } ,
          modal : true
        } ) ;

        // Attach click handler to the link that opens the dialog.
        $ ( '#dialog_link' ) . button () . click ( function () {
          $ ( '#dialog' ) . dialog ( 'open' ) ;
          return false ;
        } ) ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Datepicker Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-datepicker' :
        // Initialize the first datepicker.
        $ ( '#datepicker' ) . datepicker ( {
          showButtonPanel : true
        } ) . children () . show () ;

        // Initialize the second datepicker with multiple months visible.
        $ ( '#datepicker2' ) . datepicker ( {
          numberOfMonths : 3 ,
          showButtonPanel : true
        } ) . children () . show () ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Icons Styling Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-icons' :
        // Apply hover states to static widgets for visual feedback.
        $ ( '#dialog_link, ul#icons li' ) . hover (
            function () {   $ ( this ) . addClass ( 'ui-state-hover' ) ;   } ,
            function () {   $ ( this ) . removeClass ( 'ui-state-hover' ) ;   }
            ) ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Buttons Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-buttons' :
        // Convert standard elements into jQuery UI buttons.
        $ ( "#divButton, #linkButton, #submitButton, #inputButton" ) . button () ;

        // Button with a left icon.
        $ ( "#leftIconButton" ) . button ( {
          icons : {
            primary : 'ui-icon-wrench' // Primary icon on the left.
          }
        } ) ;

        // Button with both primary and secondary icons.
        $ ( "#bothIconButton" ) . button ( {
          icons : {
            primary : 'ui-icon-wrench' ,
            secondary : 'ui-icon-triangle-1-s'
          }
        } ) ;

        // Apply button styling to danger and safe buttons.
        $ ( "#dangerButton, #safeButton" ) . button () ;

        // Initialize a button set for radio buttons.
        $ ( "#radio1" ) . buttonset () ;

        // Button specifically for use within a modal context.
        $ ( "#buttonInModal" ) . button ( {
          icons : { primary : 'ui-icon-wrench' }
        } ) ;

        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Progressbar Widget Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-progressbar' :
        // Initialize the progress bar with a default value.
        $ ( "#progressbar" ) . progressbar ( {
          value : 37
        } ) . width ( 500 ) ;

        // Add click handler to animate the progress bar.
        $ ( "#animateProgress" ) . click ( function ( event ) {
          var randNum = Math . random () * 90 ; // Generate a random percentage.
          $ ( "#progressbar div" ) . animate ( {   width : randNum + "%"   } ) ;
          event . preventDefault () ; // Prevent default link behavior.
        } ) ;
        break ;


      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Combinations Demo (Tabs and Accordion)
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-combinations' :
        // Initialize nested tabs.
        $ ( '#tabs2' ) . tabs () ;
        // Initialize nested accordion.
        $ ( "#accordion2" ) . accordion ( {   header : "h4"   } ) ;
        // Set up nested buttons and prevent default click action.
        $ ( "#nestedButtonTest_1, #nestedButtonTest_2, #buttonInModal" )
          . button () . click ( function ( e ) {
            e . preventDefault () ;
          } ) ;
        break ;
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      // Case: Form Elements Demo
      /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- */
      case   'demo-form' :
        // Apply button styling to form elements.
        $ ( '.format-ui-button' ) . button () ;
        break ;
      default :
        // No specific initialization required for other cases.
        // Additional code might go here if needed.
    }

  }


  // This section handles the functionality for switching between different CSS themes.
  $ ( '#toggle-css a' ) . click ( function () {
    var name = $ ( this ) . html () ; // Get the theme name from the link's HTML.
    var summary = $ ( this ) . attr ( 'data-summary' ) ; // Get the theme summary from the data attribute.
    // Construct the display string for the theme.
    summary = name + '<br><span class="summary">' + summary + '</span>' ;
    // Update the stylesheet link to apply the new theme, busting cache with a timestamp.
    $ ( 'link[id="theme"]' ) . attr ( { href : $ ( this ) . attr ( 'rel' ) + '?' + ( Number ( new Date() ) ) } ) ;
    // Animate the display of the new theme name and summary.
    $ ( 'h2#showing span' )
      . fadeOut ( 'slow' , function () {
        $ ( this )
          . html ( summary )
          . fadeIn ( 'slow' ) ;
      } ) ;
  } ) ;

  // Programmatically trigger a click on the very first theme choice to set an initial style.
  $ ( '#toggle-css a:first' ) . click () ;

} ) ;