(($mainWrapper) => {
    "use strict"; // Enforce stricter parsing and error handling

    // Custom logging utility to replace direct console.log calls
    const logIssue = (message, details = null) => {
        if (typeof console !== 'undefined' && console.error) {
            console.error(`Feedback System Error: ${message}`, details);
        }
    };

    // Ensure the DOM is fully loaded before executing our script
    $mainWrapper(document).ready(function($) {

        // Check if essential global data is available
        if (typeof commentsData === 'undefined' || !commentsData) {
            logIssue('Critical site feedback data not found. Aborting initialization.');
            return;
        }

        // Load the external commentary management library
        const CommentaryManager = require('side-comments');

        // Extract configuration details from the global data object
        const applicationConfig = {
            sectionEntries: commentsData.comments || {},
            activeUser: commentsData.user || {},
            securityToken: commentsData.nonce || '',
            contentIdentifier: commentsData.postID || '',
            apiEndpoint: commentsData.ajaxURL || '',
            displayAreaSelector: commentsData.containerSelector || '.commentable-container'
        };

        // Basic validation for critical configuration parts
        if (!applicationConfig.apiEndpoint || !applicationConfig.contentIdentifier) {
            logIssue('Missing essential API endpoint or content identifier in configuration.', applicationConfig);
            return;
        }

        // Prepare the current user information for the commentary system
        const currentVisitorProfile = {
            id: applicationConfig.activeUser.id || 'anonymous',
            avatarUrl: applicationConfig.activeUser.avatar || '',
            name: applicationConfig.activeUser.name || 'Guest'
        };

        // Transform raw comment data into the format expected by the commentary system
        const preparedSectionData = Object.entries(applicationConfig.sectionEntries).map(([sectionId, commentsList]) => ({
            sectionId: sectionId,
            comments: commentsList
        }));

        // Initialize the core commentary instance
        const commentaryInstance = new CommentaryManager(
            applicationConfig.displayAreaSelector,
            currentVisitorProfile,
            preparedSectionData
        );

        // Helper function for making authenticated AJAX requests
        const sendAuthenticatedRequest = (actionType, payload, successCallback, errorCallback) => {
            if (!applicationConfig.securityToken || !applicationConfig.apiEndpoint) {
                logIssue('Cannot send request: Security token or API endpoint missing.');
                errorCallback(null, 'Authentication/Endpoint Missing', 'Configuration Error');
                return;
            }

            $.ajax({
                url: applicationConfig.apiEndpoint,
                dataType: 'json',
                type: 'POST',
                data: {
                    action: actionType,
                    nonce: applicationConfig.securityToken,
                    postID: applicationConfig.contentIdentifier,
                    ...payload // Merge additional payload data
                },
                success: (serverReply) => {
                    if (serverReply && serverReply.type === 'success') {
                        successCallback(serverReply);
                    } else {
                        logIssue(`Server reported non-success for action '${actionType}'.`, serverReply);
                        errorCallback(null, 'Server Status Not Success', serverReply);
                    }
                },
                error: (xhr, status, error) => {
                    logIssue(`AJAX request failed for action '${actionType}'.`, { xhr, status, error });
                    errorCallback(xhr, status, error);
                }
            });
        };

        let lastPostedCommentId = null; // Store the ID of the last successfully posted comment

        // Event handler for a new comment being submitted
        commentaryInstance.on('commentPosted', (submittedEntry) => {
            // Basic validation for the submitted comment
            if (!submittedEntry || !submittedEntry.comment || !submittedEntry.sectionId) {
                logIssue('Attempted to post an invalid comment entry.', submittedEntry);
                return;
            }

            sendAuthenticatedRequest(
                'add_side_comment', {
                    sectionID: submittedEntry.sectionId,
                    comment: submittedEntry.comment,
                    authorName: submittedEntry.authorName,
                    authorId: submittedEntry.authorId
                },
                (serverReply) => {
                    // Update the comment with the ID from the server and add it to the stream
                    const updatedEntry = { ...submittedEntry,
                        id: serverReply.newCommentID
                    };
                    lastPostedCommentId = serverReply.newCommentID; // Update our tracker
                    commentaryInstance.insertComment(updatedEntry);
                },
                (xhr, status, error) => {
                    // Handle error, maybe revert UI changes or show a message
                    logIssue('Failed to add new comment.', { xhr, status, error });
                }
            );
        });

        // Event handler for a comment being removed
        commentaryInstance.on('commentDeleted', (removedEntry) => {
            // Ensure we have a valid comment ID to delete
            if (!removedEntry || !removedEntry.id || !removedEntry.sectionId) {
                logIssue('Attempted to delete an invalid comment entry.', removedEntry);
                return;
            }

            sendAuthenticatedRequest(
                'delete_side_comment', {
                    commentID: removedEntry.id
                },
                () => {
                    // If successful, remove it from the UI stream
                    commentaryInstance.removeComment(removedEntry.sectionId, removedEntry.id);
                    // Clear the last posted ID if it matches the deleted one
                    if (lastPostedCommentId === removedEntry.id) {
                        lastPostedCommentId = null;
                    }
                },
                (xhr, status, error) => {
                    // Handle error
                    logIssue('Failed to delete comment.', { xhr, status, error });
                }
            );
        });

        // --- User Interface Interaction Enhancements ---

        // Toggle 'active' class on the parent section when a comment marker is clicked
        $mainWrapper(document).on('click', ".marker", function() {
            const $thisMarker = $mainWrapper(this);
            const $parentSection = $thisMarker.closest('p.commentable-section');

            if ($parentSection.length) {
                // Toggle the 'active' class on the closest commentable section
                $parentSection.toggleClass('active');

                // Animate scroll to the clicked marker's parent section
                $mainWrapper('html, body').animate({
                    scrollTop: $parentSection.offset().top
                }, 400); // Slightly faster animation
            } else {
                logIssue('Clicked marker not within a commentable section.', this);
            }
        });

        // Remove 'active' class from all commentable sections when clicking outside
        $mainWrapper(document).on('click', (event) => {
            const $clickedElement = $mainWrapper(event.target);

            // If the click is inside a comments wrapper or a marker, do nothing
            if ($clickedElement.is('.comments-wrapper, .marker') || $clickedElement.parents().is('.comments-wrapper, .marker')) {
                return;
            }

            // Otherwise, deactivate all commentable sections
            $mainWrapper(".commentable-section.active").removeClass("active");
        });

        // Prevent page scrolling when hovering over the comments panel on wider screens
        const disablePanelScrollThreshold = 767;
        if ($mainWrapper(window).width() > disablePanelScrollThreshold) {
            $mainWrapper('.comments-wrapper .comments').on('wheel', function(event) {
                const originalEvent = event.originalEvent;
                if (originalEvent) {
                    const scrollDirection = originalEvent.deltaY || -originalEvent.wheelDelta; // Normalize scroll direction
                    this.scrollTop += scrollDirection; // Apply scroll to the element
                    event.preventDefault(); // Stop the page from scrolling
                }
            });
        }
    });

})(jQuery); // Pass jQuery object for encapsulation and renaming within the IIFE