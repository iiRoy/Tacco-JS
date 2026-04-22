function adjustNavigationPanel(triggeringElement) {
    const navigationPanel = document.querySelector('.navbar');
    if (!navigationPanel) return;

    if (triggeringElement.matches('.btn.open')) {
        navigationPanel.style.left = '0px';
    } else if (triggeringElement.matches('.btn.close')) {
        navigationPanel.style.left = '-320px';
    }
    navigationPanel.style.transition = 'left 400ms ease-out';
}

function manageTableOfContentsEntry(partElement) {
    const childListContainer = partElement.querySelector(':scope > ol');
    if (childListContainer) {
        partElement.classList.toggle('section-expanded');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (evt) => {
        const clickedItem = evt.target;

        if (clickedItem.matches('.btn.open') || clickedItem.matches('.btn.close')) {
            adjustNavigationPanel(clickedItem);
        }

        const tocPartEntry = clickedItem.closest('nav[data-type="toc"] li[data-type="part"]');
        if (tocPartEntry) {
            manageTableOfContentsEntry(tocPartEntry);
        }
    });

    const contentDivisionElements = document.querySelectorAll('div[data-type="part"]');
    if (contentDivisionElements.length === 0) {
        const primaryPageTitleElement = document.querySelector('header h1');
        if (primaryPageTitleElement) {
            const currentDocumentTitle = primaryPageTitleElement.textContent.trim();
            const tocAnchorElements = document.querySelectorAll('nav[data-type="toc"] li a');

            for (const navAnchor of tocAnchorElements) {
                if (navAnchor.textContent.includes(currentDocumentTitle)) {
                    const containingListElement = navAnchor.closest('ol');
                    if (containingListElement) {
                        containingListElement.style.display = 'block';
                    }
                    const containingListItem = navAnchor.closest('li');
                    if (containingListItem) {
                        containingListItem.classList.add('current-active-item');
                    }
                    const containingPartListItem = navAnchor.closest('li[data-type="part"]');
                    if (containingPartListItem) {
                        containingPartListItem.classList.add('section-expanded');
                    }
                    break;
                }
            }
        }
    }
});

document.addEventListener('keydown', (keyboardAction) => {
    const keyActionMap = {
        'ArrowLeft': () => {
            const previousLinkContainer = document.getElementById('previous_page');
            if (previousLinkContainer && previousLinkContainer.firstElementChild) {
                previousLinkContainer.firstElementChild.click();
            }
        },
        'ArrowRight': () => {
            const nextLinkContainer = document.getElementById('next_page');
            if (nextLinkContainer && nextLinkContainer.firstElementChild) {
                nextLinkContainer.firstElementChild.click();
            }
        }
    };

    const specificAction = keyActionMap[keyboardAction.key];
    if (specificAction) {
        specificAction();
    }
});