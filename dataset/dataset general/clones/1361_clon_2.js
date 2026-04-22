group('reveal-conceal');

asyncValidation('revealAction',      6, function ()   {
    // Define the primary interactive element
    const actionElement = jq('.reveal-conceal .initiator');

    // Verify initial state: the extended note area should be empty.
    verifyCondition(
        jq('#extended-note').innerContent() === '',
        'Extended note division begins empty.'
    );

    actionElement.triggerClick(); // Simulate a user interaction

    // Assert that the 'visibility-on' component is now visible.
    verifyCondition(
        actionElement.locate('.visibility-on').checkIf(':visible'),
        'Element for visibility-on was displayed.'
    );

    // Confirm that the 'visibility-off' component is no longer visible.
    verifyCondition(
        !actionElement.locate('.visibility-off').checkIf(':visible'),
        'Element for visibility-off was concealed.'
    );

    // Check if the loading visual has been added.
    verifyCondition(
        jq('#extended-note img').count === 1,
        'Loading visual was appended to the extended note.'
    );

    // Pause execution to allow content to load asynchronously.
    utilityKit.delay(100, function () {
        // After loading, ensure the spinner is removed.
        verifyCondition(
            jq('#extended-note').directKids('img').count === 0,
            'Loading visual disappeared upon content retrieval.'
        );
        // Verify the correct number of paragraph elements are loaded.
        verifyCondition(
            jq('#extended-note').directKids('p').count === 3,
            'Extended note division successfully loaded three paragraph elements.'
        );

        resumeTest(); // Conclude the asynchronous validation.
    });
});


group('send-data-form');

asyncValidation('sendData', 3, function () {
    // Obtain reference to the form's processing button.
    const processButton = jq('.send-data-form .initiator');

    // Initial check: 'goodMood' container should only have one child.
    verifyCondition(
        jq('#goodMood').directKids().count === 1,
        'The goodMood element initially contains only one child.'
    );

    processButton.triggerClick(); // Activate the form submission.

    // Allow a brief delay for the asynchronous update.
    utilityKit.delay(100, function () {
        // Confirm the original initiator button has been removed.
        verifyCondition(
            jq('#goodMood').directKids('.initiator').count === 0,
            'The initiator button was successfully substituted.'
        );
        // Verify that new content (a paragraph) is now present.
        verifyCondition(
            jq('#goodMood').directKids('p').count === 1,
            'The goodMood element contents were updated with a single paragraph.'
        );

        resumeTest(); // Finalize this async test sequence.
    });
});


group('swap-content');

asyncValidation('swapAction', 3, function () {
    // Get the element responsible for content exchange.
    const exchangeBtn = jq('.swap-content .initiator');

    // Ensure the 'wealth' container starts with just one child.
    verifyCondition(
        jq('#wealth').directKids().count === 1,
        'The wealth container initially holds one child element.'
    );

    exchangeBtn.triggerClick(); // Initiate the content replacement.

    // Wait for the content to be asynchronously updated.
    utilityKit.delay(100, function () {
        // Assert the initiator button is gone after replacement.
        verifyCondition(
            jq('#wealth').directKids('.initiator').count === 0,
            'The initiator button within wealth was substituted.'
        );
        // Confirm the new preformatted content is now in place.
        verifyCondition(
            jq('#wealth').directKids('pre').count === 1,
            'The wealth container contents were replaced with one preformatted block.'
        );

        resumeTest(); // End of asynchronous validation.
    });
});