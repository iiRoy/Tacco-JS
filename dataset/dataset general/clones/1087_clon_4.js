((domContentReadyCallback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', domContentReadyCallback);
    } else {
        domContentReadyCallback();
    }
})(function() {
    // Relocate secondary navigation entries
    const primaryMenuSource = document.querySelector('#top_navigation ul.menu li.expanded ul');

    if (primaryMenuSource) {
        const extractedFragment = primaryMenuSource.innerHTML;
        primaryMenuSource.parentNode.removeChild(primaryMenuSource);

        const targetContainer = document.getElementById('sec_menu_container');
        if (targetContainer) {
            targetContainer.insertAdjacentHTML('beforeend', `<ul class="menu">${extractedFragment}</ul>`);
        }
    }

    // Adjust main content area layout based on side column presence
    const leftColumnElement = document.getElementById('leftCol');
    const rightColumnElement = document.getElementById('rightCol_1');
    const mainContentArea = document.getElementById('content');

    const checkContentExistence = (elementRef) => elementRef && elementRef.textContent.trim().length > 0;

    const leftPresent = checkContentExistence(leftColumnElement);
    const rightPresent = checkContentExistence(rightColumnElement);

    if (mainContentArea) {
        if (!leftPresent && !rightPresent) {
            mainContentArea.className = 'sixteen columns';
        } else if (leftPresent && rightPresent) {
            mainContentArea.className = 'eight columns';
        } else {
            if (!leftPresent && leftColumnElement) {
                leftColumnElement.classList.add('hidden');
            }
            if (!rightPresent && rightColumnElement) {
                rightColumnElement.classList.add('hidden');
            }
            mainContentArea.className = 'twelve columns';
        }
    }

    // Conceal heading elements without visible text
    const allH3Elements = document.querySelectorAll('h3');

    Array.from(allH3Elements).forEach((currentHeaderNode) => {
        const textualContent = currentHeaderNode.textContent;
        if (textualContent && textualContent.trim().length === 0) {
            currentHeaderNode.classList.add('hidden');
        }
    });
});