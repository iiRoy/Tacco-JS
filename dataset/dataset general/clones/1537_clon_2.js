/*
 * This JavaScript module facilitates a sliding side panel functionality.
 * Inspired by common responsive navigation patterns.
 */
jQuery( function()
{
  var panelVisibilityStatus = 0; // 0 for hidden, 1 for visible - represents the state of the side panel
  var slideAnimationDuration = 300; // Time in milliseconds for the panel's slide transitions

  jQuery( ".menu-activation-button" ).on( 'click', function()
  {
    var currentPanelDimension = jQuery( '.side-panel-wrapper .navigation-links' ).width(); // Determine the width of the navigation component

    if ( panelVisibilityStatus === 0 ) // Check if the side panel is currently closed
    {
      jQuery( ".side-panel-wrapper" ).animate(
        {
          width: currentPanelDimension + 'px',
        },
        slideAnimationDuration
      );

      jQuery( "body" ).animate(
        {
          marginLeft: currentPanelDimension + 'px',
          marginRight: '-' + currentPanelDimension + 'px',
        },
        slideAnimationDuration,
        function()
        {
          panelVisibilityStatus = 1; // Update status to open after animation concludes
        }
      );
      return false; // Stop further event propagation
    }
    else // The side panel is currently open, initiate closing sequence
    {
      jQuery( ".side-panel-wrapper" ).animate(
        {
          width: 0
        },
        slideAnimationDuration,
        function()
        {
          jQuery( this ).css( "width", "" ); // Clear the inline width to allow CSS to take over
        }
      );

      jQuery( "body" ).animate(
        {
          marginLeft: '0px',
          marginRight: '0px',
        },
        slideAnimationDuration,
        function()
        {
          panelVisibilityStatus = 0; // Revert status to closed
        }
      );
      return false; // Prevent default browser action
    }
  } );
} );