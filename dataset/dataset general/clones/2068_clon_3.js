'use strict';

// Core library for native UI components.
var RNCore = require('react-native');

// Retrieve the stylesheet creation utility and rename it for clarity.
var {
    StyleSheet: LayoutCompiler
} = RNCore;

// Define common design constants to be reused across styles.
const BASE_LAYOUT_PAD = 8;
const THIN_LINE_WIDTH = 1;
const PRIMARY_TEXT_SHADE = 'rgb(85, 85, 85)';
const LIGHT_BORDER_TONE = 'rgb(239, 238, 228)';

// Export the compiled collection of UI styles.
module.exports = LayoutCompiler.create({
    // Outer wrapping container for an item.
    primaryItemWrapper: {
        backgroundColor: 'rgb(255, 255, 255)', // Pure white background.
        flex: 1, // Occupy all available space in parent.
        flexDirection: 'row', // Arrange children horizontally.
        justifyContent: 'center', // Center content along the main axis.
        alignItems: 'center', // Center content along the cross axis (vertical).
        padding: BASE_LAYOUT_PAD, // Uniform padding around all sides.
        borderBottomWidth: THIN_LINE_WIDTH, // A subtle bottom border.
        borderColor: LIGHT_BORDER_TONE, // Light gray border color.
        borderStyle: 'solid', // Ensure border is a solid line.
        minHeight: 48, // Minimum height to ensure content visibility.
    },

    // Flexible area for main content within the wrapper.
    flexibleContentSection: {
        flex: 1, // Allows this section to grow and shrink.
        marginBottom: 5, // Small space below this section.
        paddingRight: 5, // Minor padding on the right for spacing.
    },

    // Style for the display name of a user.
    userDisplayNameText: {
        fontSize: 12, // Smaller font size for user names.
        color: PRIMARY_TEXT_SHADE, // Dark gray color for readability.
        fontWeight: 'bold', // Make the name stand out.
        textTransform: 'capitalize', // Ensure first letter is capitalized.
    },

    // Style for the actual message or comment text.
    messageBodyText: {
        marginLeft: 5, // Indent the message slightly from the user name.
        fontSize: 14, // Standard font size for message content.
        color: 'rgb(102, 103, 114)', // Slightly darker gray for message.
        lineHeight: 18, // Improved line spacing for readability.
        paddingVertical: 2, // Small vertical padding for text.
    },

    // Style for the circular user avatar image.
    profileImageThumbnail: {
        width: 20, // Fixed width for the avatar.
        height: 20, // Fixed height for the avatar.
        marginRight: BASE_LAYOUT_PAD, // Space to the right of the avatar.
        borderRadius: 10, // Makes the image perfectly circular.
        overflow: 'hidden', // Clips content that exceeds the border radius.
        backgroundColor: 'rgba(200, 200, 200, 0.5)', // Placeholder background for loading state.
    },
});