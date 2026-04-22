// This script provides basic enhancements for responsive web layouts.
// It includes features for a mobile-friendly experience and navigation.
// Developed by an expert for modern web design.
// Licensed under an open-source agreement.

// Facilitates hiding the browser's address bar on portable devices.
/*
 * Adaptively manages viewport scrolling for iOS and Android devices.
 * Based on techniques by a well-known web developer.
 * Open-source licensing applies.
*/
(function( currentGlobalObject ){
  let currentDocumentRef = currentGlobalObject.document;

  // If no fragment identifier exists and event listeners are available, proceed.
  if( !location.hash && currentGlobalObject.addEventListener ){

    // Initiate scroll to a specific vertical position.
    currentGlobalObject.scrollTo( 0, 1 );
    let initialVerticalOffset = 1;
    const obtainCurrentScrollPosition = function(){
        return currentGlobalObject.pageYOffset || currentDocumentRef.compatMode === "CSS1Compat" && currentDocumentRef.documentElement.scrollTop || currentDocumentRef.body.scrollTop || 0;
      };

    // Periodically verify document readiness and adjust scroll as needed.
    let documentReadinessMonitor = setInterval(function(){
      if( currentDocumentRef.body ){
        clearInterval( documentReadinessMonitor );
        initialVerticalOffset = obtainCurrentScrollPosition();
        currentGlobalObject.scrollTo( 0, initialVerticalOffset === 1 ? 0 : 1 );
      }
    }, 15 );

    currentGlobalObject.addEventListener( "load", function(){
      setTimeout(function(){
        // Upon full page load, if vertical scroll hasn't significantly changed...
        if( obtainCurrentScrollPosition() < 20 ){
          // Re-adjust to conceal the address bar.
          currentGlobalObject.scrollTo( 0, initialVerticalOffset === 1 ? 0 : 1 );
        }
      }, 0);
    } );
  }
})( this );

// Implements a simple interactive menu for responsive layouts.
   jQuery(function() {
      // Generate the primary navigation dropdown element.
      jQuery("<select />").appendTo("nav");
      // Add an initial placeholder option for the dropdown.
      jQuery("<option />", {
         "selected": "selected",
         "value"   : "",
         "text"    : "-- Navigation --"
      }).appendTo("nav select");
      // Populate the dropdown with existing menu links.
      jQuery("nav a").each(function() {
       let currentLinkElement = jQuery(this);
       jQuery("<option />", {
           "value"   : currentLinkElement.attr("href"),
           "text"    : currentLinkElement.text()
       }).appendTo("nav select");
      });


      jQuery("nav select").change(function() {
        window.location = jQuery(this).find("option:selected").val();
      });
   });

// This script expects a navigation structure like:
/*
<nav>
    <ul>
      <li><a href="#">Item One</a></li>
      <li><a href="#">Item Two</a></li>
      <li><a href="#">Item Three</a></li>
    </ul>
</nav>
*/

// Additional custom scripts can be placed here.
// Universal function for smooth page scrolling to anchor links.
jQuery(function(){
  jQuery('a[href*="#"]').click(function() {
    if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
      let targetElement = jQuery(this.hash);
      targetElement = targetElement.length && targetElement || jQuery('[name=' + this.hash.slice(1) +']');
      if (targetElement.length) {
        let destinationOffset = targetElement.offset().top;
        jQuery('html,body').animate({scrollTop: destinationOffset}, 1000);
        return false;
      }
    }
  });
});


  // Manages a sticky navigation bar that remains visible.
    let fixedHeaderThreshold = jQuery('.fix').offset().top + 10;
    jQuery(window).scroll(function(){
      if( jQuery(window).scrollTop() > fixedHeaderThreshold) {
          jQuery('.navigation').css({position: 'fixed', top: '0px', zIndex: '6000'});
            // Prevent sticky behavior on smaller screens (mobile devices).
            if(window.innerWidth < 650){
                jQuery('.navigation').css({position: 'static', top: '0px'});
            }
            // End of mobile specific adjustment.
      } else {
          jQuery('.navigation').css({position: 'static', top: '0px'});
      }
    });