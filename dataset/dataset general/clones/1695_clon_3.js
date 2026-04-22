(function(jq) {
    "use strict";

    // Configuration constants for various UI elements
    const UIElements = {
        mainBanner: '#banner',
        navTriggers: {
            showBanner: '#portfolio-t, #skills-experience-t, #contact-t',
            hideBanner: '#home-t'
        },
        flexSlider: '.flexslider',
        form: {
            nameField: '#form_name',
            emailField: '#form_email',
            subjectField: '#form_subject',
            messageField: '#form_message',
            responseArea: '#response'
        },
        tabs: {
            navList: 'ul.tabs',
            activeClass: 'active',
            contentPanelClass: 'tab-content-pane' // New class for content panels
        }
    };

    // --- Core Document Initialization ---
    // Ensure all critical DOM elements are loaded before attaching handlers.
    jq(document).on("DOMContentLoaded", function() {

        // Helper function for animating the main banner's visibility
        function toggleMainBanner(shouldDisplay) {
            const bannerRef = jq(UIElements.mainBanner);
            if (!bannerRef.length) {
                console.warn("Main banner element not found:", UIElements.mainBanner);
                return;
            }
            if (shouldDisplay) {
                bannerRef.stop(true, true).slideDown(500); // Stop previous animations
            } else {
                bannerRef.stop(true, true).slideUp(500);
            }
        }

        // Attach event listeners for navigation items to control banner visibility
        jq(document).on('click', UIElements.navTriggers.showBanner, function(evt) {
            evt.preventDefault(); // Prevent default link behavior if applicable
            toggleMainBanner(true);
        });

        jq(document).on('click', UIElements.navTriggers.hideBanner, function(evt) {
            evt.preventDefault();
            toggleMainBanner(false);
        });

        // Add a general check for banner presence and initial state
        if (!jq(UIElements.mainBanner).length) {
            console.log("Banner element missing. Skipping banner visibility controls.");
        }
    });

    // --- Media Content Loading and Plugin Initialization ---
    // Wait for all assets (images, etc.) to be fully loaded before initializing heavy plugins.
    jq(window).on("load", function() {
        const sliderTarget = jq(UIElements.flexSlider);
        if (sliderTarget.length && typeof sliderTarget.flexslider === 'function') {
            sliderTarget.flexslider({
                transitionEffect: "fade", // Renamed from 'animation'
                loopContinuously: true, // Renamed from 'animationLoop'
                slideshowSpeed: 7000, // Added new option
                pauseOnHover: true // Added new option
            });
            console.info("FlexSlider initialized successfully.");
        } else if (sliderTarget.length) {
            console.warn("FlexSlider plugin not found or not a function.");
        } else {
            console.log("No FlexSlider elements found on the page.");
        }
    });

    // --- Contact Submission Module ---
    // Function to handle the asynchronous submission of the contact form.
    window.dispatchMessage = function() { // Renamed from 'toSend'

        const formInputData = {
            senderName: jq(UIElements.form.nameField).val(),
            senderEmail: jq(UIElements.form.emailField).val(),
            msgSubject: jq(UIElements.form.subjectField).val(),
            msgBody: jq(UIElements.form.messageField).val()
        };

        // Basic client-side validation: check if essential fields are non-empty
        if (!formInputData.senderName || !formInputData.senderEmail || !formInputData.msgBody) {
            jq(UIElements.form.responseArea).html('<p class="error-msg">Please fill in all required fields.</p>').fadeIn();
            setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 3000);
            return; // Halt submission
        }

        // Display a temporary loading message
        jq(UIElements.form.responseArea).html('<p class="loading-msg">Sending message...</p>').fadeIn();

        // Helper to clear a field after a delay
        function clearInputFieldWithDelay(fieldSelector, delayMs = 1500) {
            setTimeout(() => jq(fieldSelector).val(''), delayMs);
        }

        // Perform the AJAX request for form submission
        jq.ajax({
            methodType: "POST", // Renamed from 'type'
            targetUrl: "mail.php", // Renamed from 'url'
            payloadData: formInputData, // Renamed from 'data'
            expectedResponse: "json", // Changed from 'text' to 'json' for better handling
            timeout: 10000, // Added timeout for robustness
            onSuccessCallback: function(serverReply) { // Renamed from 'success', 'html'
                if (serverReply) {
                    let parsedResponse;
                    try {
                        // Use JSON.parse for safer parsing, assuming serverReply is string JSON
                        parsedResponse = (typeof serverReply === 'string') ? JSON.parse(serverReply) : serverReply;
                    } catch (e) {
                        console.error("Error parsing server response:", e);
                        jq(UIElements.form.responseArea).html('<p class="error-msg">Server response format error.</p>').fadeIn();
                        setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 3000);
                        return;
                    }

                    // Process individual field updates from server response
                    if (parsedResponse.senderName) {
                        jq(UIElements.form.nameField).val(parsedResponse.senderName);
                        clearInputFieldWithDelay(UIElements.form.nameField);
                    }
                    if (parsedResponse.senderEmail) {
                        jq(UIElements.form.emailField).val(parsedResponse.senderEmail);
                        clearInputFieldWithDelay(UIElements.form.emailField);
                    }
                    if (parsedResponse.msgSubject) {
                        jq(UIElements.form.subjectField).val(parsedResponse.msgSubject);
                        clearInputFieldWithDelay(UIElements.form.subjectField);
                    }
                    if (parsedResponse.msgBody) {
                        jq(UIElements.form.messageField).val(parsedResponse.msgBody);
                        clearInputFieldWithDelay(UIElements.form.messageField);
                    }

                    // Display the main feedback message
                    if (parsedResponse.mainMessage) { // Renamed from 'main'
                        jq(UIElements.form.responseArea).html(parsedResponse.mainMessage).fadeIn();
                        setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 3000); // Increased delay
                    } else {
                        // Fallback message if no specific main message
                        jq(UIElements.form.responseArea).html('<p class="success-msg">Message sent successfully!</p>').fadeIn();
                        setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 3000);
                    }
                } else {
                    // No valid response, indicate a problem without reloading
                    jq(UIElements.form.responseArea).html('<p class="error-msg">An unexpected error occurred. Please try again.</p>').fadeIn();
                    setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 3000);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) { // Added error callback
                console.error("AJAX Error:", textStatus, errorThrown);
                let errMsg = '<p class="error-msg">Failed to send message. Server error or network issue.</p>';
                if (textStatus === 'timeout') {
                    errMsg = '<p class="error-msg">Request timed out. Please check your connection.</p>';
                }
                jq(UIElements.form.responseArea).html(errMsg).fadeIn();
                setTimeout(() => jq(UIElements.form.responseArea).fadeOut('slow'), 4000);
            }
        });
    };

    // --- Tabbed Content Navigation Module ---
    // Encapsulated module for managing tabbed content based on URL hash.
    (function(domUtil) { // Renamed jQuery alias to domUtil

        // A small utility to debounce function calls
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }

        // Function to update content based on URL fragment changes
        function handleUrlFragmentChange() { // Renamed from 'hashchange'
            const currentFragment = window.location.hash; // Renamed from 'hash'
            let activeTabLink = domUtil(UIElements.tabs.navList + ' [href*="' + currentFragment + '"]'); // Renamed from 'el'
            let targetContentPanel = domUtil(currentFragment); // Renamed from 'content'

            // Guard clause: ensure both link and content exist and link is not already active
            if (activeTabLink.length && !activeTabLink.hasClass(UIElements.tabs.activeClass) && targetContentPanel.length) {
                const parentTabContainer = activeTabLink.closest(UIElements.tabs.navList);

                // Deactivate previously active tab link
                parentTabContainer.find('.' + UIElements.tabs.activeClass).removeClass(UIElements.tabs.activeClass);
                // Activate the new tab link
                activeTabLink.addClass(UIElements.tabs.activeClass);

                // Animate content panel visibility
                targetContentPanel.siblings('.' + UIElements.tabs.contentPanelClass).removeClass(UIElements.tabs.activeClass).fadeOut(350, function() { // Added specific class for siblings
                    targetContentPanel.fadeIn(350).addClass(UIElements.tabs.activeClass); // Changed duration
                });
                console.log(`Tab activated: ${currentFragment}`);
            } else if (currentFragment && (!activeTabLink.length || !targetContentPanel.length)) {
                console.warn(`Tab link or content not found for hash: ${currentFragment}`);
            }
        }

        // Debounce the hash change handler to prevent rapid UI updates
        const debouncedHashChangeHandler = debounce(handleUrlFragmentChange, 100);

        // Attach event listener for URL hash changes using a custom namespace
        domUtil(window).on('hashchange.appNavigation', debouncedHashChangeHandler); // Changed namespace

        // Trigger the handler immediately upon script execution to set initial tab state
        debouncedHashChangeHandler();

        // Optional: Also trigger on document ready for initial rendering consistency
        domUtil(document).on('DOMContentLoaded', debouncedHashChangeHandler);

    })(jQuery); // Pass jQuery object with its original alias for this module

})(jQuery); // Pass jQuery to the main IIFE using 'jq' alias