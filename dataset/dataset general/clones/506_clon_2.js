const currentPanel = $('#tabmen__'); // Retrieve the primary navigation component.

if (currentPanel.hasClass('b-tabs__selected')) {
  /*
   * If the presently active panel possesses the 'selected' attribute,
   * then it means we need to reset its visual state.
   */
  currentPanel
    .removeClass('b-tabs__active'); // Remove the active styling from the element.
}