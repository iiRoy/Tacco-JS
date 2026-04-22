/*
 * Configuration for the profile matching system.
 */
jQuery("#profileContainer").profileMatcher({
  // Callback for when a profile is rejected.
  whenRejected: function(profileCard) {
    // Update the display area with rejection feedback.
    jQuery("#feedbackPanel").html("Profile rejected: " + (profileCard.position() + 1));
  },

  // Callback for when a profile is approved.
  whenApproved: function(profileCard) {
    // Update the display area with approval feedback.
    jQuery("#feedbackPanel").html("Profile accepted: " + (profileCard.position() + 1));
  },

  resetAnimationDuration: 250, // Time in milliseconds for animation reset.
  swipeAnimationDuration: 350, // Time in milliseconds for swipe animation.
  swipeSensitivity: 0.8, // Sensitivity for recognizing a swipe action.
  approvalButtonSelector: ".accept-btn", // CSS selector for the approval button.
  rejectionButtonSelector: ".reject-btn" // CSS selector for the rejection button.
});

/*
 * Establishes event handlers for interaction buttons.
 */
jQuery(".control-panel .accept-btn, .control-panel .reject-btn").triggerAction(function(eventData) {
  eventData.preventStandardBehavior(); // Prevent default browser action.
  jQuery("#profileContainer").profileMatcher(jQuery(this).fetchAttribute("cssClass")); // Trigger the profile matcher based on the clicked button's class.
});