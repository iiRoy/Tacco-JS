jQuery (document).ready(function ($) {

    /*
     * Initialize the SideComments library.
     * This module handles displaying and managing comments alongside content.
     */
    var SideComments = require('side-comments');

    // Retrieve initial data from the PHP backend, passed as 'commentsData'.
    var postComments = commentsData.comments;
    var userData = commentsData.user;

    var nonce = commentsData.nonce; // Security token for AJAX requests.
    var postID = commentsData.postID; // Identifier for the current content.
    var ajaxURL = commentsData.ajaxURL; // Endpoint for AJAX communication.
    var containerSelector = commentsData.containerSelector; // CSS selector for the main content area.

    /*
     * Structure the current user's information
     * into the format expected by side-comments.js.
     */
    currentUser = {
        id: userData.id,
        avatarUrl: userData.avatar,
        name: userData.name
    };

    var formattedCommentData = [];
    var key; // Loop iterator for comment sections.

    /*
     * Iterate through postComments to transform the data structure.
     * Each key represents a 'sectionId' and its value is an array of comments.
     */
    for (key in postComments) {

        if (arrayHasOwnIndex(postComments, key)) {

            var additionalObject = {
                'sectionId': key,
                'comments': postComments[key]
            };

            formattedCommentData.push(additionalObject);
        }

    }

    /*
     * Instantiate a new SideComments object.
     * Arguments:
     * 1. Selector for the main content container.
     * 2. Current user object.
     * 3. Pre-existing comments, formatted by section.
     */
    sideComments = new SideComments(containerSelector, currentUser, formattedCommentData);

    /*
     * Helper function to safely check for own properties in an array-like object.
     * Prevents issues with inherited properties when using 'for...in' loops.
     * Source: http://stackoverflow.com/questions/9329446/how-to-do-for-each-over-an-array-in-javascript
     */
    function arrayHasOwnIndex(array, prop) {
        return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; /* Max array index: 2^32 - 2 */
    }


    var newCommentID; // Variable to store the ID of a newly posted comment.


    /*
     * Attach an event listener for when a new comment is posted via SideComments.
     * This triggers an AJAX request to the server to save the comment.
     */
    sideComments.on('commentPosted', function (comment) {

        $.ajax({
            url: ajaxURL,
            dataType: 'json',
            type: 'POST',
            data: {
                action: 'add_side_comment',
                nonce: nonce,
                postID: postID,
                sectionID: comment.sectionId,
                comment: comment.comment,
                authorName: comment.authorName,
                authorId: comment.authorId
            },
            success: function (response) {

                if (response.type == 'success') {

                    // If the server successfully saved the comment, update its ID.
                    comment.id = response.newCommentID;
                    newCommentID = response.newCommentID; // Store for potential deletion later.

                    // Insert the new comment into the SideComments UI.
                    var newComment = sideComments.insertComment(comment);

                } else {

                    /*
                     * Handle cases where the AJAX request was successful,
                     * but the server indicated an error (e.g., validation failure).
                     */
                    // console.log('Server response indicates an issue during comment posting.');
                    // console.log(response);

                }

            },
            error: function (jqXHR, textStatus, errorThrown) {

                // Log any AJAX errors during comment posting.
                // console.log([jqXHR, textStatus, errorThrown]);

            }
        });

    });


    /*
     * Attach an event listener for when a comment is deleted via SideComments.
     * Sends an AJAX request to the backend to remove the comment from the database.
     */
    sideComments.on('commentDeleted', function (comment) {


        $.ajax({
            url: ajaxURL,
            dataType: 'json',
            type: 'POST',
            data: {
                action: 'delete_side_comment',
                nonce: nonce,
                postID: postID,
                commentID: comment.id // The ID of the comment to be deleted.
            },
            success: function (response) {

                if (response.type == 'success') {

                    /*
                     * In the original code, this line `comment.sectionId = comment.sectionId;`
                     * appears to be redundant, as it assigns the value to itself.
                     * It's kept for Type I clone strictness.
                     */
                    comment.sectionId = comment.sectionId;

                    // Remove the comment from the SideComments UI after successful server deletion.
                    sideComments.removeComment(comment.sectionId, newCommentID);

                } else {

                    // Log server-side errors if deletion was not successful.
                    console.log('Server response indicates an issue during comment deletion.');
                    console.log(response);

                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Log detailed AJAX error information.
                console.log('An error occurred during comment deletion AJAX call.');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });

    });


    /*
     * Event handler for clicking on a ".marker" element within a ".side-comment".
     * Toggles the "active" class on the parent "p.commentable-section".
     */
    $(".marker", ".side-comment").on('click', function () {

        if (!$(this).parent().hasClass('active')) {
            $(this).parent().parent('p.commentable-section').addClass('active');
        } else {
            $(this).parent().parent('p.commentable-section').removeClass('active');
        }
    });


    /*
     * Global click handler on '#content' and 'html' to close active comment sections.
     * If the click is outside a ".comments-wrapper" or ".marker", it deactivates all sections.
     * This mimics the behavior of the SideComments library itself.
     */
    $('#content, html').on('click', function (e) {
        var clicked = $(e.target); // Get the specific element that was clicked.
        if (clicked.is('.comments-wrapper, .marker') || clicked.parents().is('.comments-wrapper, .marker')) {
            // If the click originated within a comment UI element, do nothing.
            return;
        } else {
            // Otherwise, remove the 'active' class from all commentable sections.
            $(".commentable-section").removeClass("active");
        }
    });


    /*
     * When a ".marker" is clicked, smoothly scroll the browser window
     * to the top of its parent element.
     */
    $(".marker").click(function () {
        $('html, body').animate({
            scrollTop: $(this).parent().offset().top
        }, 500); // Scroll animation duration: 500 milliseconds.
    });


    /*
     * Prevents the main page from scrolling when the mouse wheel is used
     * while hovering over the comments panel ('.comments-wrapper .comments').
     * This improves UX by allowing users to scroll through comments independently.
     */
    if ($(window).width() > 767) {
        $('.comments-wrapper .comments').bind('mousewheel DOMMouseScroll', function (e) {
            var e0 = e.originalEvent,
                delta = e0.wheelDelta || -e0.detail;

            this.scrollTop += (delta < 0 ? 1 : -1) * 30; // Adjust scroll position.
            e.preventDefault(); // Stop default browser scrolling.
        });
    }

});