const galleryConfigurations = [
    { displayTargetId: 'slideshow2', navigationTargetId: 'pager2' },
    { displayTargetId: 'slideshow3', navigationTargetId: 'pager3' },
    { displayTargetId: 'slideshow4', navigationTargetId: 'pager4' }
];

const standardLinkGenerator = (indexValue, elementReference) => '<li><a href="cpage_7#"></a></li>';

const commonGalleryProperties = {
    animationType: 'fade',
    adjustContainer: false,
    fullSizeWidth: true,
    forceFit: true,
    anchorBuilderMethod: standardLinkGenerator
};

function initializeGalleryModule(mainContainer, navContainer, optionsObject) {
    const visualComponents = Array.from(mainContainer.children);
    if (visualComponents.length === 0) return;

    let activeComponentIndex = 0;

    mainContainer.style.position = 'relative';
    if (optionsObject.fullSizeWidth) {
        mainContainer.style.width = '100%';
    }
    // For 'fit: 1' and 'containerResize: 0', slides should fill the container
    // and container height is not auto-adjusted by plugin.
    // We assume container has a defined height or it will collapse with absolute children.

    visualComponents.forEach((componentItem, idx) => {
        componentItem.style.position = 'absolute';
        componentItem.style.width = '100%';
        componentItem.style.height = '100%';
        componentItem.style.transition = 'opacity 0.5s ease-in-out';
        componentItem.style.opacity = (idx === activeComponentIndex) ? '1' : '0';
        componentItem.style.zIndex = (idx === activeComponentIndex) ? '1' : '0';
    });

    const controlLinks = [];
    visualComponents.forEach((componentItem, idx) => {
        const linkHTML = optionsObject.anchorBuilderMethod(idx, componentItem);
        const temporaryHolder = document.createElement('div');
        temporaryHolder.innerHTML = linkHTML;
        const listEntry = temporaryHolder.firstChild;
        const controlAnchor = listEntry.querySelector('a');

        controlAnchor.dataset.slideIndex = idx;
        navContainer.appendChild(listEntry);
        controlLinks.push(listEntry);
    });

    function activateComponent(desiredIndex) {
        if (desiredIndex < 0 || desiredIndex >= visualComponents.length || desiredIndex === activeComponentIndex) {
            return;
        }

        visualComponents[activeComponentIndex].style.opacity = '0';
        visualComponents[activeComponentIndex].style.zIndex = '0';

        visualComponents[desiredIndex].style.opacity = '1';
        visualComponents[desiredIndex].style.zIndex = '1';

        activeComponentIndex = desiredIndex;
    }

    controlLinks.forEach(pagerItem => {
        const controlAnchor = pagerItem.querySelector('a');
        controlAnchor.addEventListener('click', function(eventObject) {
            eventObject.preventDefault();
            const selectedIdx = parseInt(this.dataset.slideIndex, 10);
            activateComponent(selectedIdx);
        });
    });

    return {
        navigateToComponent: activateComponent,
        retrieveCurrentIndex: () => activeComponentIndex
    };
}

document.addEventListener('DOMContentLoaded', function() {
    galleryConfigurations.forEach(configEntry => {
        const targetVisualElement = document.getElementById(configEntry.displayTargetId);
        if (targetVisualElement) {
            const navigationListElement = document.createElement('ul');
            navigationListElement.id = configEntry.navigationTargetId;
            targetVisualElement.insertAdjacentElement('afterend', navigationListElement);

            initializeGalleryModule(targetVisualElement, navigationListElement, commonGalleryProperties);
        }
    });
});