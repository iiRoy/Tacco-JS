/*
 * Javascript for kodango.com
 */

// A manager for elements designed to float when scrolled
function createFloatingElementController(targetIdentifier, verticalOffset) {
    let watchedElement = null;
    let actualFloatingOffset = verticalOffset || 0; // The desired distance from the top when fixed

    let recordedFixedScrollY = 0; // Stores the scroll position when the element first became fixed
    let precedingVisibleElement = null; // The element immediately preceding the target, used as an unstick reference
    let containingBlockUpperBoundary = 0; // The top edge of the parent container, used as another unstick reference
    let spacingPlaceholder = null; // A div inserted to prevent content reflow when the element becomes fixed

    let scrollActionHandler = null;
    let resizeActionHandler = null;

    // Utility to get an element's top position relative to the document
    function getAbsoluteTop(elem) {
        if (!elem) return 0;
        return elem.getBoundingClientRect().top + window.scrollY;
    }

    // Main routine to adjust the element's position based on scroll and resize
    function adjustElementPosition() {
        if (!watchedElement || window.getComputedStyle(watchedElement).display === 'none') {
            return; // Do nothing if element isn't found or is hidden
        }

        // Account for potential `top` CSS property on the body element
        const bodyTopStyle = parseFloat(window.getComputedStyle(document.body).top || '0');
        let currentEffectiveOffset = actualFloatingOffset;
        if (!isNaN(bodyTopStyle)) {
            currentEffectiveOffset += bodyTopStyle;
        }

        // Calculate the document scroll position where the element *should* become fixed
        const elementCurrentNaturalTop = getAbsoluteTop(watchedElement);
        const activationThresholdScroll = elementCurrentNaturalTop - currentEffectiveOffset;

        // Determine the document scroll position where the element *should* unfix
        let unfixReferenceScroll = 0;
        if (precedingVisibleElement) {
            unfixReferenceScroll = getAbsoluteTop(precedingVisibleElement) + precedingVisibleElement.offsetHeight;
        } else {
            unfixReferenceScroll = containingBlockUpperBoundary - currentEffectiveOffset;
        }
        
        const currentDocumentScrollPosition = window.scrollY || document.documentElement.scrollTop;
        const isElementCurrentlyFixed = watchedElement.style.position === 'fixed';

        // Logic for fixing the element
        if (currentDocumentScrollPosition > activationThresholdScroll) {
            if (!isElementCurrentlyFixed) {
                // Element should transition to fixed position
                recordedFixedScrollY = activationThresholdScroll; // Store the scroll position at which it became fixed

                // Create and insert a placeholder to maintain layout flow
                spacingPlaceholder = document.createElement('div');
                spacingPlaceholder.style.height = watchedElement.offsetHeight + 'px';
                spacingPlaceholder.style.width = watchedElement.offsetWidth + 'px'; // Preserve width
                watchedElement.parentNode.insertBefore(spacingPlaceholder, watchedElement);

                // Apply fixed positioning styles
                watchedElement.style.position = 'fixed';
                watchedElement.style.top = currentEffectiveOffset + 'px';
                watchedElement.style.left = watchedElement.getBoundingClientRect().left + 'px'; // Maintain horizontal position
                watchedElement.style.width = watchedElement.offsetWidth + 'px'; // Explicitly set width
            }
        } 
        // Logic for unfixing the element
        else if (isElementCurrentlyFixed) {
            // Element is currently fixed, check if it should revert to static
            // Original conditions: _self.cache.originalToTop > elementToTop || referenceToTop > elementToTop
            // Translates to: recordedFixedScrollY > activationThresholdScroll || unfixReferenceScroll > activationThresholdScroll
            if (recordedFixedScrollY > activationThresholdScroll || unfixReferenceScroll > activationThresholdScroll) {
                // Element should revert to static position
                if (spacingPlaceholder && spacingPlaceholder.parentNode) {
                    spacingPlaceholder.remove(); // Remove the placeholder
                }
                watchedElement.style.position = 'static';
                watchedElement.style.top = ''; // Clear fixed-position styles
                watchedElement.style.left = '';
                watchedElement.style.width = '';
            }
        }
    }

    // Function to initialize the tracking behavior
    function activateTracking() {
        watchedElement = document.querySelector(targetIdentifier);
        if (!watchedElement) {
            console.warn(`Floating element controller: Target element with selector "${targetIdentifier}" not found.`);
            return;
        }

        // Find the immediately preceding visible sibling
        let currentCandidate = watchedElement.previousElementSibling;
        while (currentCandidate && window.getComputedStyle(currentCandidate).display === 'none') {
            currentCandidate = currentCandidate.previousElementSibling;
        }
        precedingVisibleElement = currentCandidate;

        // Calculate the top boundary of the parent container
        const parentHost = watchedElement.parentElement;
        if (parentHost) {
            const parentBounds = parentHost.getBoundingClientRect();
            const parentStyles = window.getComputedStyle(parentHost);
            containingBlockUpperBoundary = parentBounds.top + window.scrollY +
                                            parseFloat(parentStyles.borderTopWidth || '0') +
                                            parseFloat(parentStyles.paddingTop || '0');
        } else {
            containingBlockUpperBoundary = 0; // Default if no parent
        }

        // Attach event listeners for scroll and resize
        scrollActionHandler = adjustElementPosition;
        resizeActionHandler = adjustElementPosition;
        window.addEventListener('scroll', scrollActionHandler);
        window.addEventListener('resize', resizeActionHandler);

        // Perform an initial position check
        adjustElementPosition();
    }

    // Function to stop the tracking behavior and clean up
    function deactivateTracking() {
        if (scrollActionHandler) {
            window.removeEventListener('scroll', scrollActionHandler);
        }
        if (resizeActionHandler) {
            window.removeEventListener('resize', resizeActionHandler);
        }
        // Ensure the element is reset to static if it was fixed
        if (watchedElement && watchedElement.style.position === 'fixed') {
            if (spacingPlaceholder && spacingPlaceholder.parentNode) {
                spacingPlaceholder.remove();
            }
            watchedElement.style.position = 'static';
            watchedElement.style.top = '';
            watchedElement.style.left = '';
            watchedElement.style.width = '';
        }
        // Clear all references
        watchedElement = null;
        precedingVisibleElement = null;
        spacingPlaceholder = null;
        scrollActionHandler = null;
        resizeActionHandler = null;
    }

    // Return an interface to control the element's floating behavior
    return {
        beginObserving: activateTracking,
        endObserving: deactivateTracking
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // scroll back to top
    document.querySelector(".backtop")?.addEventListener('click', function(event){
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Sidebar tabber widget
    document.querySelectorAll('.tabber-title li').forEach(function(tabItem) {
        tabItem.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                return;
            }

            const currentTab = this;
            const tabContainer = currentTab.closest('.widget-tabber');

            if (tabContainer) {
                tabContainer.querySelectorAll('.tabber-title li').forEach(item => item.classList.remove('selected'));
                currentTab.classList.add('selected');

                const contentLists = tabContainer.querySelectorAll('.tabber-content ul');
                const currentIndex = Array.from(tabContainer.querySelectorAll('.tabber-title li')).indexOf(currentTab);

                contentLists.forEach((list, index) => {
                    if (index === currentIndex) {
                        // Simplified animation from slideDown/Up to display block/none
                        list.style.display = 'block';
                    } else {
                        list.style.display = 'none';
                    }
                });
            }
        });
    });

    // Comment tabber
    document.getElementById('comments-tabber')?.addEventListener('click', function(event) {
        const targetLink = event.target.closest('a');
        if (targetLink && targetLink.parentElement === this) { // Ensure click is on a direct child <a>
            if (targetLink.classList.contains('curtab')) {
                return;
            }

            Array.from(this.children).forEach(child => {
                if (child.tagName === 'A') {
                    child.classList.remove('curtab');
                    child.classList.add('tab');
                }
            });
            targetLink.classList.remove('tab');
            targetLink.classList.add('curtab');

            let sibling = this.nextElementSibling;
            while (sibling) {
                if (sibling.style.display === 'none' || sibling.style.display === '') {
                    sibling.style.display = 'block';
                } else {
                    sibling.style.display = 'none';
                }
                sibling = sibling.nextElementSibling;
            }
        }
    });

    // Sidebar follow - Type IV clone instantiation
    const mainSidebarFollower = createFloatingElementController('#sidebar-follow', 70);
    mainSidebarFollower.beginObserving();

    // Mobile menu switch
    document.getElementById('mobile-menu')?.addEventListener('click', function() {
        const headerElement = document.getElementById('header');
        if (!headerElement) return;

        const menuElement = headerElement.querySelector('.header-menu');
        const searchBoxElement = headerElement.querySelector('.search-box');

        if (searchBoxElement) {
            if (searchBoxElement.style.display === 'none' || searchBoxElement.style.display === '') {
                searchBoxElement.style.opacity = '0';
                searchBoxElement.style.display = 'block';
                // Simple fade-in (no animation, just display)
                setTimeout(() => searchBoxElement.style.opacity = '1', 10);
            } else {
                searchBoxElement.style.opacity = '0';
                // Simple fade-out (no animation, just display)
                setTimeout(() => searchBoxElement.style.display = 'none', 10);
            }
        }

        if (menuElement) {
            if (headerElement.classList.contains('clicked')) {
                menuElement.style.display = 'none'; // Simplified slideToggle
                headerElement.classList.remove('clicked');
            } else {
                headerElement.classList.add('clicked');
                menuElement.style.display = 'block'; // Simplified slideToggle
            }
        }
    });

    // Toggle comment user
    document.getElementById('comments')?.addEventListener('click', function(event) {
        const toggleAuthorButton = event.target.closest('#toggle-author');
        if (toggleAuthorButton) {
            const authorInfoElement = document.getElementById('author-info');
            if (authorInfoElement) {
                if (authorInfoElement.style.display === 'none' || authorInfoElement.style.display === '') {
                    authorInfoElement.style.display = 'block'; // Simplified slideToggle
                    // Update author name
                    const welcomeLoginStrong = document.getElementById('welcome-login')?.querySelector('strong');
                    const authorInput = document.getElementById('author');
                    if (welcomeLoginStrong && authorInput) {
                        welcomeLoginStrong.textContent = authorInput.value;
                    }
                    // Update toggle action name
                    const toggleAuthorU = toggleAuthorButton.querySelector('u');
                    if (toggleAuthorU) toggleAuthorU.textContent = '隐藏';
                } else {
                    authorInfoElement.style.display = 'none'; // Simplified slideToggle
                    // Update toggle action name
                    const toggleAuthorU = toggleAuthorButton.querySelector('u');
                    if (toggleAuthorU) toggleAuthorU.textContent = '更改';
                }
            }
        }
    });
});