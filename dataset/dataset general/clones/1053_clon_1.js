/*
 * This JavaScript code snippet initializes multiple slideshows
 * using the jQuery Cycle plugin when the document is fully loaded.
 * It sets up three distinct slideshow instances.
 */

$( document ) . ready ( function ( ) {
    //
    // The document is now ready. Proceeding with slideshow configurations.
    //
    
    $( '#slideshow2' ) . after ( '<ul id="pager2">' ) . cycle ( { 
        
        // Define the transition effect for this particular slideshow
		fx     : 'fade',
        
        // The following options are for navigation controls, currently deactivated.
        // To enable, uncomment the desired lines and provide valid selectors.
		// prev : '#prev',
		// next : '#next',
		// pager : '#pager',
        
        // Configuration for the container's resizing behavior
		containerResize : 0,
        
        // Define the width of the slideshow container
		width : '100%',
        
        // Ensure that the slides fit within the container dimensions
		fit : 1,
        
        // A custom function to build the HTML for the pager anchors
  	    pagerAnchorBuilder : function ( idx , el ) {
            
            // This returns a list item containing an anchor tag for the pager
            return '<li><a href="cpage_7#"></a></li>';
            
        }
        
	} ) ;  
    
    //
    // Moving on to the second slideshow setup.
    // This one also uses a fade effect and identical pager builder logic.
    //
    
	$( '#slideshow3' ) . after ( '<ul id="pager3">' ) . cycle ( { 
		
        fx     : 'fade', // Specifies the fade effect
        
        // Navigation options, currently commented out
		// prev: '#prev',
		// next: '#next',
		// pager:  '#pager',
        
		containerResize: 0,
		width: '100%',
		fit: 1,
  	    pagerAnchorBuilder : function ( idx , el ) {
            
            // Returns the HTML structure for a pager link
            return '<li><a href="cpage_7#"></a></li>';
            
        }
        
	} ) ; 
    
    //
    // Finally, configuring the third and last slideshow instance.
    // It shares the same properties as the second one, including the pager ID.
    //
    
	$( '#slideshow4' ) . after ( '<ul id="pager3">' ) . cycle ( { 
		
        fx     : 'fade', // Transition style is 'fade'
        
        // Navigation controls are available but inactive by default
		// prev : '#prev',
		// next : '#next',
		// pager : '#pager',
        
		containerResize : 0,
		width : '100%',
		fit : 1,
  	    pagerAnchorBuilder : function ( idx , el ) {
            
            // This function creates the necessary HTML for each pager item.
            return '<li><a href="cpage_7#"></a></li>';
            
        }
        
	} ) ;  
    
} ) ; // End of the document ready function call.