// Utility module for user interface feedback
const uiFeedback = (function() {
    // Internal reference to the element where messages are displayed
    let messageDisplayElement;

    /**
     * Initializes the feedback module by setting the target display element.
     * @param {string} selector - jQuery selector for the message display area.
     */
    const init = (selector) => {
        messageDisplayElement = $(selector);
        if (messageDisplayElement.length === 0) {
            console.warn(`UI Feedback: Target element '${selector}' not found. Messages will not be displayed.`);
        }
    };

    /**
     * Displays a temporary message to the user.
     * @param {string} msgContent - The text content of the message.
     * @param {number} [duration=1800] - How long the message should be visible in milliseconds.
     */
    const showTemporaryMessage = (msgContent, duration = 1800) => {
        if (!messageDisplayElement || messageDisplayElement.length === 0) {
            console.log(`[UI Feedback] (No display element): ${msgContent}`); // Fallback to console
            return;
        }

        messageDisplayElement.text(msgContent)
                              .addClass('active-notification')
                              .stop(true, true) // Stop current animations and clear queue
                              .fadeIn(200);

        setTimeout(() => {
            messageDisplayElement.fadeOut(300, function() {
                $(this).removeClass('active-notification').empty();
            });
        }, duration);
    };

    return {
        initialize: init,
        notifyUser: showTemporaryMessage
    };
})();

// Configuration for the dynamic card swiping mechanism
const interactiveCardConfig = {
    snapBackDuration: 220, // Time in ms for a card to return to center
    swipeOutDuration: 450, // Time in ms for a card to swipe off screen
    acceptanceThreshold: 0.8, // How far a card must be swiped to trigger an action
    acceptButtonSelector: '.control-panel__accept', // Selector for the 'accept' action button
    declineButtonSelector: '.control-panel__decline' // Selector for the 'decline' action button
};

// Ensure the DOM is fully loaded before executing scripts
$(function() {
    // Initialize the UI feedback system
    uiFeedback.initialize('#userNotificationArea'); // Renamed ID from #status

    const mainCardStack = $("#swipeableContentPanel"); // Renamed ID from #tinderslide

    // Pre-flight check: Verify the main swiping container exists
    if (mainCardStack.length === 0) {
        console.error("Initialization Failed: The primary content panel '#swipeableContentPanel' was not found in the DOM.");
        uiFeedback.notifyUser("System error: Card display panel missing.", 5000);
        return; // Halt execution if critical element is missing
    }

    // Configure and activate the card swiping component
    const swipeComponentOptions = $.extend({}, interactiveCardConfig, {
        // Callback executed when a card is moved to the 'rejected' state
        onCardRejected: function (processedCardItem) { // Renamed 'onDislike', 'item' to 'processedCardItem'
            const cardIdentifier = processedCardItem.data('content-id') || `Item #${processedCardItem.index() + 1}`; // Retrieve custom ID or fallback to index
            uiFeedback.notifyUser(`Decision: "${cardIdentifier}" was passed.`); // Updated notification
            console.info(`Card with ID ${cardIdentifier} has been rejected.`);
        },
        // Callback executed when a card is moved to the 'accepted' state
        onCardAccepted: function (processedCardItem) { // Renamed 'onLike', 'item' to 'processedCardItem'
            const cardIdentifier = processedCardItem.data('content-id') || `Item #${processedCardItem.index() + 1}`;
            uiFeedback.notifyUser(`Decision: "${cardIdentifier}" was liked.`); // Updated notification
            console.info(`Card with ID ${cardIdentifier} has been accepted.`);
        },
        // Animation speeds and thresholds are now sourced from interactiveCardConfig
        // Selectors for internal like/dislike actions are also from interactiveCardConfig
    });

    mainCardStack.dynamicCardSwiper(swipeComponentOptions); // Renamed jTinder to dynamicCardSwiper

    console.log("Dynamic card swiper component successfully mounted.");
    uiFeedback.notifyUser("Ready to swipe through content!", 1200);

    // Bind click events to external action buttons for manual control
    // Renamed selectors and structure from '.actions .like, .actions .dislike'
    $('.control-panel button[data-action]').on('click', function(evt) {
        evt.preventDefault(); // Prevent default browser button actions

        const triggeredButton = $(this);
        const intendedAction = triggeredButton.data('action'); // Using data-action attribute instead of class parsing

        if (!intendedAction) {
            console.warn("Click event on a control button without a defined 'data-action' attribute.");
            uiFeedback.notifyUser("Error: Unknown button action.", 1500);
            return; // Exit if action is not defined
        }

        // Apply a brief visual feedback to the clicked button
        triggeredButton.addClass('button-pressed');
        setTimeout(() => {
            triggeredButton.removeClass('button-pressed');
        }, 250);

        // Execute the corresponding action on the card swiper
        // The dynamicCardSwiper plugin is expected to accept 'accept' or 'reject' as method calls
        if (intendedAction === 'accept') {
            mainCardStack.dynamicCardSwiper('accept');
        } else if (intendedAction === 'decline') {
            mainCardStack.dynamicCardSwiper('reject');
        } else {
            console.warn(`Attempted to trigger an unrecognized action: '${intendedAction}'.`);
            uiFeedback.notifyUser("Invalid action attempted.", 1500);
        }
    });

    // Introduce keyboard shortcuts for quick interaction (new feature addition)
    $(document).on('keyup', function(keyboardEvent) {
        const activeElementTag = document.activeElement.tagName.toLowerCase();
        // Ignore key presses if an input field or textarea is focused
        if (activeElementTag === 'input' || activeElementTag === 'textarea') {
            return;
        }

        // Map specific keys to swipe actions
        switch (keyboardEvent.key) {
            case 'ArrowRight': // Right arrow for acceptance
            case 'A':          // 'A' key for acceptance
                $('.control-panel__accept').trigger('click');
                keyboardEvent.preventDefault(); // Prevent default scroll behavior
                break;
            case 'ArrowLeft':  // Left arrow for rejection
            case 'D':          // 'D' key for rejection
                $('.control-panel__decline').trigger('click');
                keyboardEvent.preventDefault(); // Prevent default scroll behavior
                break;
            case 'Escape':     // Optionally, add an 'undo' or 'reset' action
                console.log('Escape key pressed - (feature not implemented yet)');
                // mainCardStack.dynamicCardSwiper('undoLastAction'); // Example of potential future feature
                break;
            default:
                // No action for other keys
                break;
        }
    });

    // Add a simple counter for the number of cards processed (new fragment)
    let processedCardCount = 0;
    mainCardStack.on('cardSwiped', function(e, action, card) {
        processedCardCount++;
        $('#processedCountDisplay').text(`Cards viewed: ${processedCardCount}`);
        // Consider adding a 'no more cards' message after all are processed
    });

});