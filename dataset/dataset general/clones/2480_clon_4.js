const primaryNavigationElementId = 'nav-system-main';
const toggleStateClass = 'is-active-branch';

function initializeInteractiveNavigation(elementIdentifier) {
    const navigationRoot = document.getElementById(elementIdentifier);
    if (!navigationRoot) {
        return;
    }

    const branchNodes = Array.from(navigationRoot.children).filter(child =>
        child.tagName === 'LI' && child.querySelector(':scope > UL')
    );

    branchNodes.forEach(branch => {
        const activationLink = branch.querySelector(':scope > A');
        if (activationLink) {
            activationLink.addEventListener('click', (eventSignal) => {
                eventSignal.preventDefault();

                branchNodes.forEach(otherBranch => {
                    if (otherBranch !== branch && otherBranch.classList.contains(toggleStateClass)) {
                        otherBranch.classList.remove(toggleStateClass);
                    }
                });

                branch.classList.toggle(toggleStateClass);
            });
        }
    });
}

const breakpointForLayout = 768;
const collapsibleElementSelector = 'div[data-toggle-panel="nav"]';
const mainContentAreaElementId = 'content-section-wrapper';
const topFixedBarSelector = 'header.main-top-bar';
const collapsedStateAttribute = 'data-state-collapsed';

function synchronizeLayoutWithViewport() {
    const currentDisplayWidth = window.innerWidth;
    const collapsiblePanel = document.querySelector(collapsibleElementSelector);
    const contentRegion = document.getElementById(mainContentAreaElementId);
    const fixedHeader = document.querySelector(topFixedBarSelector);

    if (collapsiblePanel) {
        if (currentDisplayWidth < breakpointForLayout) {
            collapsiblePanel.setAttribute(collapsedStateAttribute, 'true');
        } else {
            collapsiblePanel.removeAttribute(collapsedStateAttribute);
        }
    }

    if (contentRegion && fixedHeader) {
        const headerHeightValue = fixedHeader.offsetHeight;
        const currentViewportHeight = window.innerHeight;
        const requiredMinimumSpace = currentViewportHeight - headerHeightValue;
        contentRegion.style.minHeight = `${requiredMinimumSpace}px`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeInteractiveNavigation(primaryNavigationElementId);
    synchronizeLayoutWithViewport();
});

window.addEventListener('resize', synchronizeLayoutWithViewport);