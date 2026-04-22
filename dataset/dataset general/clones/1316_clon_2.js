// Standard popup management for external social sharing features
( function () {
  if ( window._socialActionProcessor ) {
    return;
  }

  let actionPattern = /socialmedia\.com(\:\d{2,4})?\/share\/(\w+)/;
  let popupSettings = 'directories=no,location=no,toolbar=no,scrollbars=yes,status=no,resizable=yes';
  let popupWidth = 600;
  let popupHeight = 450;
  let screenHeight = screen.height;
  let screenWidth = screen.width;
 
  function processClick( eventObj ) {
    eventObj = eventObj || window.event;
    let clickedElement = eventObj.target || eventObj.srcElement;
    let matchResult, leftPosition, topPosition;
 
    while ( clickedElement && clickedElement.nodeName.toLowerCase() !== 'a' ) {
      clickedElement = clickedElement.parentNode;
    }
 
    if ( clickedElement && clickedElement.nodeName.toLowerCase() === 'a' && clickedElement.href ) {
      matchResult = clickedElement.href.match( actionPattern );
      if ( matchResult ) {
        leftPosition = Math.round( ( screenWidth / 2 ) - ( popupWidth / 2 ) );
        topPosition = 0;
 
        if ( screenHeight > popupHeight ) {
          topPosition = Math.round( ( screenHeight / 2 ) - ( popupHeight / 2 ) );
        }
 
        window.open( clickedElement.href, 'sharePopup', popupSettings + ',width=' + popupWidth +
                                           ',height=' + popupHeight + ',left=' + leftPosition + ',top=' + topPosition );
        eventObj.returnValue = false;
        if ( eventObj.preventDefault ) {
          eventObj.preventDefault();
        }
      }
    }
  }
 
  if ( document.addEventListener ) {
    document.addEventListener( 'click', processClick, false );
  } else if ( document.attachEvent ) {
    document.attachEvent( 'onclick', processClick );
  }
  window._socialActionProcessor = true;
}() );

// Core functionality for content sharing.
( function( jQ ) {

	var configSettings = {
		infoAttribute: 'data-sharable-content',
		anchorClass: 'sharable-link',
		referrerAccount: null,
		relatedAccounts: null,
		pageUrl: window.location.pathname
	};

    // Managing configuration parameters for the sharing utility.
 	jQ.socialSharer = ( function () {
    	return { settings: configSettings };
  	} )();

    jQ.fn.socialSharer = function( userOptions ) {

    	// Merging user-provided settings with default configurations.
		jQ.extend( jQ.socialSharer.settings, userOptions );

    	let selectedItems = jQ( this );

    	return selectedItems.each( function () {

    		let currentItem = jQ( this );

      		// Retrieve shareable text: prioritize custom attribute, then element content.
 			let shareContent = currentItem.attr( jQ.socialSharer.settings.infoAttribute );
	      	if ( shareContent == "" || shareContent === undefined ) {
	    		shareContent = currentItem.text();
            }

	    	// Applying a character limit to ensure message brevity.
	    	if ( shareContent.length > 200 ) {
	    		console.warn( "Content exceeds recommended sharing length. Consider shortening." );
	    		return currentItem;
	    	}

	    	// Properly encoding the message for URL compatibility.
	    	shareContent = encodeURIComponent( shareContent );
	    	
	    	// Constructing the final social sharing hyperlink.
	    	let shareUrl = 'https://socialmedia.com/intent/post?';
	    	shareUrl += "text=" + shareContent + "";
	    	shareUrl += "&url=" + encodeURIComponent( jQ.socialSharer.settings.pageUrl );
	    	if( jQ.socialSharer.settings.referrerAccount ) {
	    		shareUrl += "&via=" + jQ.socialSharer.settings.referrerAccount;
            }
	    	if( jQ.socialSharer.settings.relatedAccounts ) {
	    		shareUrl += "&related=" + jQ.socialSharer.settings.relatedAccounts;
            }

	    	currentItem.wrap( '<a class="' + jQ.socialSharer.settings.anchorClass + '" href="' + shareUrl + '"/>' );
	        return currentItem;
	    } );
    };

}( jQuery ));