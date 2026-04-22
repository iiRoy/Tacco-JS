(function() {
    function segmentRenderer(segmentIdentifier) {
        const displayContainer = document.getElementById('content');
        if (!displayContainer) {
            console.error("Target content element not found.");
            return;
        }

        const dataSource = `${segmentIdentifier}.html`;

        fetch(dataSource)
            .then(webResponse => {
                if (!webResponse.ok) {
                    throw new Error(`Failed to retrieve: ${webResponse.status}`);
                }
                return webResponse.text();
            })
            .then(htmlContent => {
                displayContainer.innerHTML = htmlContent;
            })
            .catch(issue => {
                console.error('Error fetching content:', issue);
                displayContainer.innerHTML = `<p>Content load error: ${issue.message}</p>`;
            });
    }

    function pageFragmentController() {
        let currentFragment = window.location.hash.substring(1);
        if (currentFragment === '') {
            currentFragment = '1';
        }
        segmentRenderer(currentFragment);
    }

    function fragmentNavigator(newFragmentValue) {
        window.location.hash = newFragmentValue;
    }

    document.addEventListener('DOMContentLoaded', function() {
        pageFragmentController();

        window.addEventListener('hashchange', pageFragmentController);

        document.addEventListener('click', function(interactionEvent) {
            const clickedElement = interactionEvent.target;

            if (clickedElement.tagName === 'A') {
                let parentSearch = clickedElement;
                let isRelevantLink = false;
                while (parentSearch && parentSearch !== document) {
                    if (parentSearch.id === 'ajax-links') {
                        isRelevantLink = true;
                        break;
                    }
                    parentSearch = parentSearch.parentNode;
                }

                if (isRelevantLink) {
                    interactionEvent.preventDefault();
                    const hyperlinkAddress = clickedElement.getAttribute('href');
                    const extractedFragment = new URL(hyperlinkAddress, window.location.origin).hash.substring(1);
                    fragmentNavigator(extractedFragment);
                }
            }
        });
    });
})();