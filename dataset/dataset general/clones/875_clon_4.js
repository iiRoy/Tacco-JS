(function() {

    function acquirePhotoData(photoIdentifier) {
        return {
            mediaName: 'No-file',
            mediaCode: 'No-number',
            mediaSynopsis: 'No-description',
            referenceID: photoIdentifier
        };
    }

    function renderMediaDisplay(itemDetails) {
        const visualUnit = document.createElement('div');
        visualUnit.id = "visual-panel";
        let visualContent = `<img src="assets/photos/miike/${itemDetails.mediaName}">`;
        visualContent += `<h3>${itemDetails.mediaSynopsis}</h3>`;
        visualUnit.innerHTML = visualContent;
        return visualUnit;
    }

    function renderPortalContent() {
        const portalSection = document.createElement('div');
        portalSection.id = "main-entry-point";
        const portalHtml = `<div class="welcome-banner"><h1>We got pics.</h1>`
                         + `<p>Pics is a tool for sharing photos with anyone online.</p></div>`;
        portalSection.innerHTML = portalHtml;
        return portalSection;
    }

    const siteNavigator = (function() {
        const displayTarget = document.getElementById('console');

        function presentHomePage() {
            if (displayTarget) {
                displayTarget.innerHTML = '';
                displayTarget.appendChild(renderPortalContent());
            }
        }

        function presentImageView(identifierValue) {
            const currentItemData = acquirePhotoData(identifierValue);
            if (displayTarget) {
                displayTarget.innerHTML = '';
                displayTarget.appendChild(renderMediaDisplay(currentItemData));
            }
        }

        function processLocationChange() {
            const currentPath = window.location.hash.substring(1);
            if (currentPath === "") {
                presentHomePage();
            } else if (currentPath.startsWith("view/")) {
                const parts = currentPath.split("/");
                const imgIdentifier = parts[1];
                presentImageView(imgIdentifier);
            }
        }

        function commenceNavigation() {
            window.addEventListener('hashchange', processLocationChange);
            processLocationChange();
        }

        return {
            initiate: commenceNavigation
        };
    })();

    window.addEventListener('DOMContentLoaded', function() {
        siteNavigator.initiate();
    });

})();