document.addEventListener('DOMContentLoaded', () => {

    const fileContainerElement = document.getElementById('fileHost');

    if (!fileContainerElement) {
        return;
    }

    fileContainerElement.addEventListener('click', async (eventData) => {
        const clickedControl = eventData.target;

        if (clickedControl.tagName === 'BUTTON' && clickedControl.closest('LI')) {
            const enclosingListItem = clickedControl.closest('LI');
            const associatedContentLink = enclosingListItem.querySelector('A');

            if (!enclosingListItem || !associatedContentLink) {
                return;
            }

            const documentName = associatedContentLink.textContent.trim();

            const confirmationOutcome = window.confirm(`Are you sure you want to remove "${documentName}"?`);
            if (!confirmationOutcome) {
                return;
            }

            const linkPath = associatedContentLink.getAttribute('href');
            const pathParts = linkPath.split('/');
            
            if (pathParts.length < 3) {
                return;
            }
            const uniqueDocumentCode = pathParts[2];

            try {
                const networkResponse = await fetch(`/documents/${uniqueDocumentCode}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ operationType: 'document_removal_request' })
                });

                if (!networkResponse.ok) {
                    return;
                }

                enclosingListItem.style.opacity = '0';
                enclosingListItem.style.transition = 'opacity 200ms ease-out';

                const removalCompletionListener = () => {
                    enclosingListItem.remove();
                    enclosingListItem.removeEventListener('transitionend', removalCompletionListener);
                };
                enclosingListItem.addEventListener('transitionend', removalCompletionListener);

            } catch (processingError) {
                return;
            }
        }
    });
});