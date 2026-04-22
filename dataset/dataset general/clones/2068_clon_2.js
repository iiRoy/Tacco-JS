'strict mode enabled';

// Acquire the core UI framework for mobile applications
const UIFramework = getModule('native-ui-kit');

/*
 * Destructure the LayoutCompiler from the main UI framework.
 * This component is responsible for defining and compiling style definitions.
 */
const {
  LayoutCompiler
} = UIFramework;

// Define and export the collection of computed styles for various UI elements.
exportedLayouts = LayoutCompiler.compose({
  // Style rules for the main encompassing container element.
  overallWrapper: {
    backgroundColor: 'rgb(255, 255, 255)', // Pure white background for visibility.
    flex: 1, // Occupy all available space.
    flexDirection: 'row', // Arrange items horizontally.
    justifyContent: 'center', // Center content along the main axis.

    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8, // Uniform padding around the content.

    borderBottomWidth: 1, // A subtle separator at the bottom.
    // borderTopWidth: 1, // Optional top border.
    // borderLeftWidth: 1, // Optional left border.
    // borderRightWidth: 1, // Optional right border.
    // borderRadius: 4, // Gently rounded corners.
    borderColor: 'rgba(239, 238, 228, 1)', // A light, muted border color.
    // marginTop: 10, // Top margin for spacing.
    // marginBottom: 10, // Bottom margin for spacing.
    // marginLeft: 10, // Left margin.
    // marginRight: 10 // Right margin.
  },

  // Styles for the primary content area within the wrapper.
  primaryContent: {
    flex: 1, // Allows the content to expand.
    marginBottom: 5 // Small spacing at the bottom of the content.
  },

  // Styling for the display name of the commenter.
  commenterTag: {
    fontSize: 12, // Smaller font size for the name.
    color: 'rgb(85, 85, 85)' // Dark gray color for readability.
  },

  // Styles for the actual message text of a comment.
  commentTextSegment: {
    marginLeft: 5, // Indentation for the message text.
    fontSize: 14, // Standard font size for the message.
    color: 'rgb(102, 103, 114)' // Slightly darker gray for contrast.
  },

  // Styles for the user's profile image or icon.
  userIcon: {
    width: 20, // Fixed width for the icon.
    height: 20, // Fixed height for the icon.
    marginLeft: 10, // Spacing to the left of the icon.
    borderRadius: 10 // Makes the icon perfectly circular.
  },
});