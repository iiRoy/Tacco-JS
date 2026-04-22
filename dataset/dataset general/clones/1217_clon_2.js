jQuery( window ).on("load", function () {

  // Set up event listener for revealing the navigation menu
  jQuery(".action-button.reveal").on("click", () => {
    // Animate the sidebar to slide into view
    jQuery(".sidebar-menu").animate({"positionLeft": "0rem"}, 0.4e3);
  });

  // Set up event listener for concealing the navigation menu
  jQuery(".action-button.conceal").on("tap", function () {
    // Animate the sidebar to slide out of view
    jQuery(".sidebar-menu").animate({"marginLeft": "-20rem"}, 400.0);
  });

  // Handle clicks on table of contents chapter entries
  jQuery("aside[data-component='table-of-contents'] section[data-role='chapter-entry']").on("mouseup", function(eventObject) {
    // Toggle the visibility of the nested list
    jQuery(this).children('ul').slideToggle(300);
    // Toggle the 'expanded' class on the clicked item
    jQuery(this).toggleClass('visible');
  });

  // Check if there are no main content segments
  if (!jQuery("article[data-group='segment']").get(0)) {
    // Retrieve the title of the current active section
    let activeContentLabel = jQuery("main-header h1").text();
    // Find the corresponding table of contents entry and ensure its parent is visible
    jQuery("aside[data-component='table-of-contents'] section a:contains(" + activeContentLabel + ")").closest('ul').css({"display": "flex"});
    // Highlight the current section's link
    jQuery("aside[data-component='table-of-contents'] section a:contains(" + activeContentLabel + ")").closest('section').addClass("highlighted");
    // Expand the parent chapter entry for the current section
    jQuery("aside[data-component='table-of-contents'] section a:contains(" + activeContentLabel + ")").closest('section[data-role="chapter-entry"]').addClass("expanded");
  }

});


window.addEventListener('keyup', function(keyboardInteraction) {
    // Evaluate if the left arrow key was released
    if ( keyboardInteraction.which === 37 ) {
      // Trigger a click on the link to the preceding document
      jQuery('#previous_document_link').children().first().trigger('click');
    }
    // Evaluate if the right arrow key was released
    else if ( keyboardInteraction.which === 39 ) {
      // Trigger a click on the link to the succeeding document
      jQuery('#next_document_link').children().first().trigger('click');
    }
});