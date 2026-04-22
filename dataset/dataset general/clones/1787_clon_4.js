document.addEventListener('DOMContentLoaded', function() {

    function notifyUserOfOutcome(displayContent) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) {
            console.error("Notification area element not found!");
            return;
        }

        notificationArea.innerHTML = displayContent;
        notificationArea.style.display = 'block';
        notificationArea.style.opacity = '0';

        let currentAlphaValue = 0;
        const fadeInterval = 100;
        const totalFadeDuration = 1000;
        const steps = totalFadeDuration / fadeInterval;
        const alphaIncrement = 1 / steps;

        const animationTrigger = setInterval(() => {
            if (currentAlphaValue < 1) {
                currentAlphaValue += alphaIncrement;
                notificationArea.style.opacity = Math.min(1, currentAlphaValue);
            } else {
                clearInterval(animationTrigger);
                notificationArea.style.opacity = '1';
            }
        }, fadeInterval);
    }

    const inquiryFormElement = document.getElementById('inquiry-form');
    if (!inquiryFormElement) {
        console.error("Inquiry form element not found!");
        return;
    }

    inquiryFormElement.addEventListener('submit', async function(submissionEvent) {
        submissionEvent.preventDefault();

        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            notificationArea.style.display = 'none';
            notificationArea.style.opacity = '0';
        }

        const formElements = new FormData(submissionEvent.target);
        const encodedFormPayload = new URLSearchParams(formElements).toString();

        try {
            const serverResponse = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: encodedFormPayload,
            });

            const rawResponseText = await serverResponse.text();

            const errorIndicatorMatch = rawResponseText.match(/<title>Error<\/title>/);

            if (errorIndicatorMatch) {
                const temporaryDocumentContainer = document.createElement('div');
                temporaryDocumentContainer.innerHTML = rawResponseText;
                const firstErrorListItem = temporaryDocumentContainer.querySelector('ul li:first-child');
                const extractedIssueDescription = firstErrorListItem ? firstErrorListItem.textContent.trim() : '';

                if (extractedIssueDescription === "A valid sender email is required") {
                    notifyUserOfOutcome("Kindly furnish your electronic mail address.");
                } else if (extractedIssueDescription === "Email Message is Required") {
                    notifyUserOfOutcome("A message is mandatory for submission.");
                } else {
                    notifyUserOfOutcome("An unidentified problem occurred during processing.");
                }
            } else {
                notifyUserOfOutcome("Your communication has been successfully delivered!");
            }

        } catch (operationFailure) {
            console.error("Communication failure:", operationFailure);
            notifyUserOfOutcome("Regrettably, a technical difficulty prevented your submission. Please contact us directly at 999-999-9999 for assistance.");
        }
    });
});