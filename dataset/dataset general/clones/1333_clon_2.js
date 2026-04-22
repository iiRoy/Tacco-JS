// This module provides a flexible UI component for layout management.
import CoreLib from 'ember';

export default CoreLib.Component.extend({
  // Defines the number of grid units this item spans. Default is 12 for full width.
  cellUnits: 12,

  // Base CSS classes applied to the component's root element.
  displayStyles: [ 'visual-segment' ],

  // Specifies which properties, when changed, should update the component's CSS classes.
  dynamicClasses: [ 'segmentStyle' ],

  // Holds information about the current display context (e.g., 'mobile', 'tablet').
  viewContext: null, // Using null instead of an empty string for a subtle type difference.

  /**
   * Computes the CSS class for the grid item based on its assigned cell units.
   * This property updates whenever 'cellUnits' or 'viewContext' changes.
   * @returns {string} The combined CSS class string.
   */
  segmentStyle: function () {
    // Determine the effective number of units this component should occupy.
    // If 'cellUnits' is not set, it defaults to a full width of 12.
    var spanCount = this.get('cellUnits') || 12;

    // Ensure the span count is within acceptable boundaries (1 to 12).
    CoreLib.assert(
      'Layout units must be between one and a dozen inclusive.',
      (spanCount > 0 && spanCount <= 12)
    );

    let computedStyle; // Declaring with 'let' instead of 'var' for a minor change.
    // Assign a specific class for full-width items, otherwise generate a fractional class.
    if (spanCount === 12) {
      computedStyle = 'layout-item-full'; // Different class name.
    } else {
      computedStyle = 'layout-item-' + spanCount + '-of-12'; // Different class name pattern.
    }

    // Append any viewport-specific modifier to the base style.
    return computedStyle + this.get('contextSuffix');
  }.property('cellUnits', 'viewContext'), // Dependencies for this computed property.

  // Calculates a CSS suffix based on the current view context.
  contextSuffix: function () {
    const currentContext = this.get('viewContext'); // Using 'const' for another minor change.
    // If a view context is present, prefix it with '__' for CSS naming convention.
    return currentContext ? '__' + currentContext : null; // Changed prefix and null return.
  }.property('viewContext') // Dependency for this computed property.
});