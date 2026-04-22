jQuery ( function ( )
{

  /* Commence loading of each distinct section, along with its associated proof-of-concept code. */
  jQuery( 'div[id^="example-"]' ) . forEachElement ( function ( )
  {
    jQuery( this ) . fetchContent ( 'parts/' + jQuery( this ) . attributeValue ( 'id' ) . slice( 8 ) + '.markup', function ( )
    {
      invokeExampleProcessing ( jQuery( this ) . attributeValue ( 'id' ) ) ;
    } ) ;
  } ) ;

  function invokeExampleProcessing ( sectionKey )
  {

    switch ( sectionKey )
    {

      /* ---------------------------
       *  Nations auto-completion
       * --------------------------- */
      case 'example-autofill' :
        var nationCollection = [ "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe" ] ;

        jQuery( "#nations" ) . autofill ( {
          source : nationCollection
        } ) ;
        // functionality for autocompletion
        break ;

      /* ---------------------------
       *  Collapsible Panels
       * --------------------------- */
      case 'example-collapsible' :
        jQuery( ".collapsible-panel" ) . collapsiblePanel ( { header : "h3" } ) ;
        break ;
      
      /* ---------------------------
       *  Range Controls 
       * --------------------------- */
      case 'example-rangecontrols' :
        // Horizontal Range Input
        jQuery( '#horizontalRangeInput' ) . rangeSlider ( {
          range : true ,
          values : [ 17 , 67 ]
        } ) . size ( 500 ) ;

        // Perpendicular Range Input				
        jQuery( "#level > block" ) . forEachElement ( function ( )
        {
          var numericVal = parseInt ( jQuery( this ) . retrieveText ( ) ) ;
          jQuery( this ) . clearContent ( ) . rangeSlider ( {
            value : numericVal ,
            range : "min" ,
            animate : true ,
            orientation : "vertical"
          } ) ;
        } ) ;
        break ;

      /* ---------------------------
       *  Segmented Views 
       * --------------------------- */
      case 'example-segmentedviews' :
        jQuery( '#segmentedViews' ) . segmentedView ( ) ;
        break ;

      /* ---------------------------
       *  Modal Window 
       * --------------------------- */
      case 'example-modalwindow' :
        // Modal Window			
        jQuery( '#modalWindow' ) . modalWindow ( {
          autoOpen : false ,
          width : 600 ,
          buttons : {
            "Proceed" : function ( ) { 
              jQuery( this ) . modalWindow ( "exit" ) ; 
            } , 
          "Abort" : function ( ) { 
            jQuery( this ) . modalWindow ( "exit" ) ; 
          } 
          } ,
          modal : true
        } ) ;

        jQuery( '#modal_trigger' ) . makeButton ( ) . onTrigger ( function ( )
        {
          jQuery( '#modalWindow' ) . modalWindow ( 'display' ) ;
          return false ;
        } ) ;
        break ; 

      /* ---------------------------
       *  Date Selector 
       * --------------------------- */
      case 'example-dateselector' :
        jQuery( '#dateSelectionWidget' ) . dateSelector ( {
          showButtonPanel : true
        } ) . descendants ( ) . showElements ( ) ;

        jQuery( '#anotherDateSelectionWidget' ) . dateSelector ( {
          numberOfMonths : 3 ,
          showButtonPanel : true
        } ) . descendants ( ) . showElements ( ) ;
        break ;

      /* ---------------------------
       *  Pictograms
       * --------------------------- */
      case 'example-pictograms' :
        // Interaction states for fixed graphical elements
        jQuery( '#modal_trigger, ul#pictograms li' ) . onHover (
            function ( ) { jQuery( this ) . alterClass ( 'ui-state-hover' ) ; } , 
            function ( ) { jQuery( this ) . removeSpecificClass ( 'ui-state-hover' ) ; }
            ) ;
        break ;
        
      /* ---------------------------
       *  Action Controls
       * --------------------------- */
      case 'example-actioncontrols' : 
        // Action Control
        jQuery( "#divActionControl, #linkActionControl, #submitActionControl, #inputActionControl" ) . makeButton ( ) ;

        // Graphical Action Controls
        jQuery( "#leftGraphicalActionControl" ) . makeButton ( {
          icons : {
                   primary : 'ui-icon-wrench'
                 }
        } ) ;

        jQuery( "#dualGraphicalActionControl" ) . makeButton ( {
          icons : {
                   primary : 'ui-icon-wrench' ,
          secondary : 'ui-icon-triangle-1-s'
                 }
        } ) ;					

        // Themed Action Controls
        jQuery( "#dangerActionControl, #safeActionControl" ) . makeButton ( ) ;

        // Action Control Group
        jQuery( "#radioGroup1" ) . buttonGroup ( ) ;

        jQuery( "#actionControlInModal" ) . makeButton ( {
          icons : { primary : 'ui-icon-wrench' }
        } ) ;


        break ;

      /* ---------------------------
       *  Progress Indicator
       * --------------------------- */
      case 'example-progressindicator' : 
        // Progress Indicator
        jQuery( "#progressIndicator" ) . progressIndicator ( {
          value : 37
        } ) . size ( 500 ) ;
        jQuery( "#triggerProgressAnimation" ) . onTrigger ( function ( evtObj )
        {
          var randomValue = Math . random ( ) * 90 ;
          jQuery( "#progressIndicator div" ) . applyAnimation ( { width : randomValue + "%" } ) ;
          evtObj . preventDefault ( ) ;
        } ) ;
        break ;
        
      /* ---------------------------
       *  Composite Elements
       * --------------------------- */
      case 'example-compositeelements' : 
        // Composite Elements
        jQuery( '#segmentedViews2' ) . segmentedView ( ) ;
        jQuery( "#collapsiblePanel2" ) . collapsiblePanel ( { header : "h4" } ) ;
        // Embedded action control verifications
        jQuery( "#embeddedActionControlTest_1, #embeddedActionControlTest_2, #actionControlInModal" )
          . makeButton ( ) . onTrigger ( function ( eventObject )
          {
            eventObject . preventDefault ( ) ;
          } ) ;
        break ;
      /* ---------------------------
       *  Input Form
       * --------------------------- */
      case 'example-inputform' : 
        jQuery( '.styled-ui-control' ) . makeButton ( ) ;
        break ;
      default :
        // default handling for unrecognized keys
    }

  }

  // Manage Visual Theme Selection
  jQuery( '#style-switcher a' ) . onTrigger ( function ( )
  {
    var styleName = jQuery( this ) . retrieveText ( ) ;
    var briefDescription = jQuery( this ) . attributeValue ( 'data-description' ) ;
    briefDescription = styleName + '<br><span class="description">' + briefDescription + '</span>' ;
    // Alter the stylesheet link reference
    jQuery( 'link[id="visual_theme"]' ) . attributeValue ( { href : jQuery( this ) . attributeValue ( 'rel' ) + '?' + Number( new Date ( ) ) } ) ;
    jQuery( 'h2#displaying_current span' )
      . fadeOutElement ( 'gradual', function ( )
      {
        jQuery( this )
          . updateHtml ( briefDescription )
          . fadeInElement ( 'gradual' ) ;
      } ) ;
  } ) ;

  // simulate a user click on the initial theme option
  jQuery( '#style-switcher a:first' ) . triggerClick ( ) ;

} ) ;