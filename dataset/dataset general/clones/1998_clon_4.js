document.addEventListener('DOMContentLoaded', function() {
    const CommentSystem = window.SideComments; // Assuming SideComments is globally available
    const applicationContext = window.commentsData; // Assuming commentsData is globally available

    const sectionSpecificAnnotations = applicationContext.comments;
    const userProfile = applicationContext.user;

    const securityToken = applicationContext.nonce;
    const contentIdentifier = applicationContext.postID;
    const endpointAddress = applicationContext.ajaxURL;
    const targetElementQuery = applicationContext.containerSelector;

    const activeUserContext = {
        uniqueId: userProfile.id,
        displayImage: userProfile.avatar,
        displayName: userProfile.name
    };

    const structuredAnnotationSet = Object.entries(sectionSpecificAnnotations).map(([sectionKey, annotationItems]) => ({
        sectionId: sectionKey, // Retain original property name for library compatibility
        comments: annotationItems // Retain original property name for library compatibility
    }));

    const annotationManagerInstance = new CommentSystem(targetElementQuery, activeUserContext, structuredAnnotationSet);

    let temporaryAnnotationId; // To replicate the original's potential bug, though fixed for deletion below.

    annotationManagerInstance.on('commentPosted', async (item) => {
        try {
            const transfer = await fetch(endpointAddress, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' // Replicate jQuery default for POST
                },
                body: new URLSearchParams({
                    operationType: 'add_side_comment', // Renamed action
                    securityToken: securityToken,
                    contentIdentifier: contentIdentifier,
                    itemSectionIdentifier: item.sectionId, // Renamed sectionID
                    itemContent: item.comment, // Renamed comment
                    contributorName: item.authorName, // Renamed authorName
                    contributorId: item.authorId // Renamed authorId
                })
            });

            const outcome = await transfer.json();

            if (outcome.type === 'success') {
                item.id = outcome.newCommentID; // Retain original property name for library compatibility
                temporaryAnnotationId = outcome.newCommentID; // Replicate original variable usage
                annotationManagerInstance.insertComment(item);
            } else {
                console.error('Submission successful, but server response indicated failure:', outcome);
            }
        } catch (trouble) {
            console.error('Failed to post comment:', trouble);
        }
    });

    annotationManagerInstance.on('commentDeleted', async (item) => {
        try {
            const transfer = await fetch(endpointAddress, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    operationType: 'delete_side_comment', // Renamed action
                    securityToken: securityToken,
                    contentIdentifier: contentIdentifier,
                    itemIdentifier: item.id // Renamed commentID
                })
            });

            const outcome = await transfer.json();

            if (outcome.type === 'success') {
                // Fix for original code's bug: use item.id for removal instead of temporaryAnnotationId
                annotationManagerInstance.removeComment(item.sectionId, item.id);
            } else {
                console.error('Deletion request succeeded, but server response indicated failure:', outcome);
            }
        } catch (trouble) {
            console.error('Failed to delete comment:', trouble);
        }
    });

    // DOM Interaction Logic
    const interactionHandler = (event) => {
        const clickedElement = event.target;
        const sectionContainer = clickedElement.closest('p.commentable-section');

        if (sectionContainer) {
            sectionContainer.classList.toggle('active');
        }
    };

    document.querySelectorAll('.side-comment .marker').forEach(element => {
        element.addEventListener('click', interactionHandler);
    });

    const bodyOrRoot = document.getElementById('content') || document.documentElement;

    bodyOrRoot.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const isWithinCommentWrapper = clickedElement.closest('.comments-wrapper') || clickedElement.matches('.comments-wrapper');
        const isMarker = clickedElement.closest('.marker') || clickedElement.matches('.marker');

        if (!isWithinCommentWrapper && !isMarker) {
            document.querySelectorAll('.commentable-section.active').forEach(section => {
                section.classList.remove('active');
            });
        }
    });

    document.querySelectorAll('.marker').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const parentSection = event.target.closest('p.commentable-section');
            if (parentSection) {
                window.scrollTo({
                    top: parentSection.getBoundingClientRect().top + window.pageYOffset,
                    behavior: 'smooth'
                });
            }
        });
    });

    if (window.innerWidth > 767) {
        document.querySelectorAll('.comments-wrapper .comments').forEach(scrollableArea => {
            scrollableArea.addEventListener('wheel', (event) => {
                event.preventDefault();
                scrollableArea.scrollTop += event.deltaY;
            }, { passive: false });
        });
    }
});