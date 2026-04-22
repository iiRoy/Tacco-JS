import FrameworkCore from 'ember';

// This module defines a foundational layout component for a responsive grid system.
// It allows dynamic adjustment of an element's width based on a column-based approach
// and optional viewport-specific modifications.
export default FrameworkCore.Component.extend({
  // Default number of columns this block should span within its parent grid.
  // Must be an integer between 1 and maxAllowedColumns.
  columnSpan: 12,

  // Base CSS classes always applied to this grid item.
  elementContainerClasses: ['flex-grid-item-container'],

  // Specifies which computed properties should be added to the element's class list dynamically.
  boundClassAttributes: ['calculatedLayoutClass'],

  // An optional identifier for the current responsive breakpoint (e.g., 'sm', 'md', 'lg').
  // This will append a specific suffix to the layout class.
  responsiveQualifier: '',

  // Defines the maximum number of columns available in the grid system.
  // This value is used for validation and class generation.
  gridSystemColumns: 12,

  // A helper property to define the base string for layout classes.
  layoutClassPrefix: 'grid-col-span',

  // Hook for lifecycle event: When the component has rendered.
  didRender() {
    // A simple log to demonstrate added functionality, could be more complex.
    // For example, it might trigger an analytics event or perform DOM manipulations.
    // console.log(`Grid item rendered with span: ${this.get('columnSpan')} and breakpoint: ${this.get('responsiveQualifier')}`);
  },

  // Computes the primary CSS class responsible for defining the element's width
  // within the grid layout. This class is based on the columnSpan and gridSystemColumns.
  calculatedLayoutClass: FrameworkCore.computed('columnSpan', 'responsiveQualifier', 'gridSystemColumns', 'layoutClassPrefix', function() {
    const currentSpan = this.get('columnSpan');
    const totalColumns = this.get('gridSystemColumns');
    const classBase = this.get('layoutClassPrefix');
    let effectiveSpan;

    // Validate the column span value. If invalid, default to the maximum allowed columns.
    // Replaced Ember.assert with internal validation and console.warn for softer error handling.
    if (typeof currentSpan !== 'number' || currentSpan < 1 || currentSpan > totalColumns) {
      FrameworkCore.warn(`Invalid 'columnSpan' value (${currentSpan}). It must be a number between 1 and ${totalColumns}. Defaulting to ${totalColumns}.`, {
        id: 'flex-grid-system.invalid-span-value'
      });
      effectiveSpan = totalColumns;
    } else {
      effectiveSpan = currentSpan;
    }

    let primaryLayoutSegment;
    // Rewritten if/else to use a template literal and a slightly different structure
    // for generating the class name, allowing for more descriptive classes.
    if (effectiveSpan === totalColumns) {
      primaryLayoutSegment = `${classBase}-full`; // Example: "grid-col-span-full"
    } else {
      primaryLayoutSegment = `${classBase}-${effectiveSpan}-of-${totalColumns}`; // Example: "grid-col-span-6-of-12"
    }

    // Retrieve the responsive suffix from another computed property.
    const breakpointSuffix = this.get('computedResponsiveSuffix');
    return `${primaryLayoutSegment}${breakpointSuffix}`;
  }),

  // Generates a suffix for the layout class based on the responsiveQualifier property.
  // This is used to apply breakpoint-specific styles (e.g., '_bp_md').
  computedResponsiveSuffix: FrameworkCore.computed('responsiveQualifier', function() {
    const activeBreakpoint = this.get('responsiveQualifier');
    let suffixString = ''; // Intermediate variable added for clarity.

    // Rewritten using a more explicit if statement and template literal,
    // including trimming and lowercasing for consistency.
    if (activeBreakpoint && typeof activeBreakpoint === 'string' && activeBreakpoint.trim() !== '') {
      suffixString = `_bp_${activeBreakpoint.trim().toLowerCase()}`; // Example: "_bp_medium"
    }

    return suffixString;
  })
});