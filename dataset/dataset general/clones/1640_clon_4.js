const PresentationNavigator = (function() {
    let currentSlideIndex = 0;
    let allSlides = [];
    let totalSlideCount = 0;

    let uiElements = {}; // Store references to frequently used DOM elements

    // --- Utility Functions ---

    // Equivalent to $(document).ready / $(function(){})
    function executeOnLoad(callback) {
        document.addEventListener('DOMContentLoaded', callback);
    }

    // Equivalent to $(selector)
    function queryElement(selector) {
        return document.querySelector(selector);
    }

    // Equivalent to $(selector).each()
    function queryAllElements(selector, callback) {
        const elements = document.querySelectorAll(selector);
        if (callback) {
            elements.forEach(callback);
        }
        return elements;
    }

    // Equivalent to $(element).hide()
    function hideElement(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    // Equivalent to $(element).show()
    function showElement(element, displayType = '') { // Use '' to revert to default display
        if (element) {
            element.style.display = displayType;
        }
    }

    // Custom fade out (equivalent to fadeOut('slow'))
    function animateHide(element, duration = 600) {
        if (!element || element.style.display === 'none') return;
        element.style.transition = `opacity ${duration / 1000}s ease-out`;
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = ''; // Clean up transition
            element.style.opacity = '1'; // Reset opacity for next show
        }, duration);
    }

    // Custom fade in (equivalent to fadeIn('slow'))
    function animateShow(element, duration = 600, displayType = '') {
        if (!element || element.style.display !== 'none') return;
        element.style.opacity = '0';
        element.style.display = displayType;
        element.style.transition = `opacity ${duration / 1000}s ease-in`;
        // Force reflow to ensure transition works from 0 opacity
        element.offsetHeight; 
        element.style.opacity = '1';
        setTimeout(() => {
            element.style.transition = ''; // Clean up transition
        }, duration);
    }
    
    // Custom toggle (equivalent to toggle('fast'))
    function quickToggle(element, displayType = '') {
        if (!element) return;
        const animationDuration = 200; // 'fast' duration
        if (element.style.display === 'none') {
            element.style.opacity = '0';
            element.style.display = displayType;
            element.style.transition = `opacity ${animationDuration / 1000}s ease-in`;
            element.offsetHeight; 
            element.style.opacity = '1';
            setTimeout(() => { element.style.transition = ''; }, animationDuration);
        } else {
            element.style.transition = `opacity ${animationDuration / 1000}s ease-out`;
            element.style.opacity = '0';
            setTimeout(() => { 
                element.style.display = 'none'; 
                element.style.transition = ''; 
                element.style.opacity = '1'; 
            }, animationDuration);
        }
    }


    // --- Core Presentation Logic ---

    // Update the visibility of slides
    function swapPresentationSections(oldSectionIndex, newSectionIndex) {
        if (oldSectionIndex >= 0 && oldSectionIndex < totalSlideCount) {
            const oldSection = allSlides[oldSectionIndex];
            hideElement(oldSection);
            oldSection.classList.remove('activeSection');
        }
        if (newSectionIndex >= 0 && newSectionIndex < totalSlideCount) {
            const newSection = allSlides[newSectionIndex];
            animateShow(newSection, 600, 'block'); // assuming articles are block elements
            newSection.classList.add('activeSection');
            currentSlideIndex = newSectionIndex;
        }
        refreshNavigationIndicators();
    }

    // Advance to the next slide
    function moveNext() {
        hideElement(uiElements.contentPanel);
        if (currentSlideIndex < totalSlideCount - 1) {
            swapPresentationSections(currentSlideIndex, currentSlideIndex + 1);
            hideAssistancePanel();
            hideNotificationDisplay();
        } else {
            displayNotification('End of presentation reached...');
        }
    }

    // Go back to the previous slide
    function movePrevious() {
        hideElement(uiElements.contentPanel);
        if (currentSlideIndex > 0) {
            swapPresentationSections(currentSlideIndex, currentSlideIndex - 1);
            hideAssistancePanel();
            hideNotificationDisplay();
        } else {
            displayNotification('Beginning of presentation reached...');
        }
    }

    // Update UI elements based on current slide
    function refreshNavigationIndicators() {
        if (uiElements.currentSectionCounter) {
            uiElements.currentSectionCounter.textContent = currentSlideIndex + 1;
        }
        markActiveContentEntry(currentSlideIndex);
        controlPreviousButtonVisibility(currentSlideIndex);
    }

    // Highlight the active entry in the table of contents
    function markActiveContentEntry(idx) {
        queryAllElements('.slide-index-list .current-entry', (el) => el.classList.remove('current-entry'));
        const targetEntry = queryElement(`.slide-index-list li:nth-child(${idx + 1}) a`);
        if (targetEntry) {
            targetEntry.classList.add('current-entry');
        }
    }

    // Show/hide the back button
    function controlPreviousButtonVisibility(idx) {
        if (uiElements.previousControl) {
            if (idx === 0) {
                hideElement(uiElements.previousControl);
            } else {
                showElement(uiElements.previousControl, 'block');
            }
        }
    }

    // --- Help System ---

    function showAssistancePanel() {
        if (!uiElements.assistancePanel) {
            uiElements.assistancePanel = document.createElement('div');
            uiElements.assistancePanel.id = 'guide-panel';
            uiElements.assistancePanel.style.display = 'none'; // Initially hidden
            queryElement('#main-wrapper').appendChild(uiElements.assistancePanel);
        }
        
        quickToggle(uiElements.assistancePanel, 'block');

        if (uiElements.assistancePanel.style.display !== 'none' && uiElements.assistancePanel.innerHTML.trim() === '') {
            fetch('../../meta/core/hilfe.html')
                .then(response => response.text())
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const helpContent = tempDiv.querySelector('article.hilfe');
                    if (helpContent) {
                        uiElements.assistancePanel.innerHTML = ''; // Clear existing content
                        uiElements.assistancePanel.appendChild(helpContent);
                    }
                })
                .catch(error => console.error('Failed to load help content:', error));
        }
    }

    function hideAssistancePanel() {
        if (uiElements.assistancePanel && uiElements.assistancePanel.style.display !== 'none') {
            const helpArticle = uiElements.assistancePanel.querySelector('article');
            if (helpArticle) {
                animateHide(helpArticle);
            } else {
                hideElement(uiElements.assistancePanel);
            }
        }
    }

    // --- Notification System ---

    function setupNotificationSystem() {
        uiElements.notificationDisplay = document.createElement('div');
        uiElements.notificationDisplay.id = 'status-alert';
        const paragraph = document.createElement('p');
        uiElements.notificationDisplay.appendChild(paragraph);
        document.body.appendChild(uiElements.notificationDisplay);
        hideElement(uiElements.notificationDisplay);

        paragraph.addEventListener('click', hideNotificationDisplay);
    }

    function displayNotification(message) {
        if (uiElements.notificationDisplay) {
            uiElements.notificationDisplay.querySelector('p').textContent = message;
            animateShow(uiElements.notificationDisplay, 400, 'block');
        }
    }

    function hideNotificationDisplay() {
        if (uiElements.notificationDisplay) {
            animateHide(uiElements.notificationDisplay, 400);
        }
    }

    // --- Table of Contents (TOC) Generation ---

    function generateContentList() {
        const tocList = document.createElement('ul');
        tocList.className = 'slide-index-list';
        uiElements.contentPanel.appendChild(tocList);

        allSlides.forEach((slide, index) => {
            slide.id = `section-${index}`; // Assign new IDs
            const slideTitle = slide.querySelector('h1');
            if (slideTitle) {
                const listItem = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = `#section-${index}`;
                anchor.title = 'Jump to this presentation slide';
                anchor.textContent = slideTitle.textContent; 
                
                anchor.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default hash behavior
                    hideNotificationDisplay();
                    hideElement(uiElements.contentPanel);
                    swapPresentationSections(currentSlideIndex, index);
                });

                listItem.appendChild(anchor);
                tocList.appendChild(listItem);
            }
        });

        // Update total slide count display
        if (uiElements.totalSectionCount) {
            uiElements.totalSectionCount.textContent = totalSlideCount;
        }

        // Add class for compact display if many entries
        if (totalSlideCount >= 15) {
            uiElements.contentPanel.classList.add('compact-entries');
        }
    }

    // --- Event Handlers ---

    // Keyboard navigation using a lookup table for divergence
    const keyboardActionMap = {
        'ArrowRight': moveNext, 
        'ArrowLeft': movePrevious,    
        'Space': (e) => {             
            e.preventDefault(); // Prevent scrolling
            quickToggle(uiElements.contentPanel, 'block');
            hideAssistancePanel();
            hideNotificationDisplay();
        },
        'Digit0': () => {             
            queryAllElements('.activeSection', (el) => {
                hideElement(el);
                el.classList.remove('activeSection');
            });
            animateShow(allSlides[0], 600, 'block');
            allSlides[0].classList.add('activeSection');
            currentSlideIndex = 0;
            hideNotificationDisplay();
            hideAssistancePanel();
            refreshNavigationIndicators();
        },
        'KeyC': () => {               
            const activeSection = queryElement('.activeSection');
            if (activeSection) {
                activeSection.classList.toggle('focusPointer');
            }
        },
        'Minus': showAssistancePanel,       
        'NumpadSubtract': showAssistancePanel 
    };

    function handleKeyboardInput(event) {
        const action = keyboardActionMap[event.key];
        if (action) {
            action(event);
        } else if (event.key === '0' && event.code === 'Numpad0') { 
            keyboardActionMap['Digit0'](event);
        } else if (event.key === '?' && (event.keyCode === 189 || event.keyCode === 0)) { // Original specific keycode check for '?'
            showAssistancePanel();
        }
    }

    // Stop propagation for specific interactive elements
    function haltEventPropagation(event) {
        event.stopPropagation();
    }
    
    // --- Initial Setup and Event Binding ---

    function standardizeLinks() {
        queryAllElements('article a[href]', (link) => {
            link.classList.add('external-reference');
            link.setAttribute('target', '_blank');
        });
    }

    function processURLFragment() {
        const fragment = window.location.hash;
        if (fragment.length > 0) {
            const fragmentIdentifier = fragment.substring(1); 
            const match = fragmentIdentifier.match(/^section-(\d+)$/);
            if (match && match[1]) {
                const targetIndex = parseInt(match[1], 10);
                if (targetIndex >= 0 && targetIndex < totalSlideCount) {
                    swapPresentationSections(currentSlideIndex, targetIndex);
                    hideNotificationDisplay();
                }
            }
        }
    }

    function initialApplicationSetup() {
        // Add a class to HTML element indicating JS is active
        document.documentElement.classList.add('scriptActive');

        // Get all slides and initial state
        allSlides = Array.from(queryAllElements('#main-wrapper article'));
        totalSlideCount = allSlides.length;

        // Store UI element references
        uiElements.mainTitle = queryElement('h1#main-heading'); 
        uiElements.contentPanel = queryElement('#content-summary'); 
        uiElements.indexButton = queryElement('#panel-trigger'); 
        uiElements.previousControl = queryElement('#prev-control'); 
        uiElements.currentSectionCounter = queryElement('#page-display span'); 
        uiElements.totalSectionCount = queryElement('#page-display strong'); 
        uiElements.mainWrapper = queryElement('#main-wrapper'); 

        // Initial slide visibility
        if (totalSlideCount > 0) {
            allSlides.forEach((slide, index) => {
                if (index === 0) {
                    slide.classList.add('activeSection');
                    showElement(slide, 'block');
                } else {
                    hideElement(slide);
                }
            });
        }

        // Set up event listeners
        queryAllElements('body a, body div#panel-trigger, body p#prev-control, form, video, audio', (el) => {
            el.addEventListener('click', haltEventPropagation);
        });

        queryAllElements('article', (art) => {
            art.addEventListener('click', moveNext);
        });

        document.addEventListener('keydown', handleKeyboardInput);

        if (uiElements.mainTitle) {
            uiElements.mainTitle.addEventListener('click', showAssistancePanel);
        }

        if (uiElements.indexButton) {
            uiElements.indexButton.addEventListener('click', () => {
                hideNotificationDisplay();
                quickToggle(uiElements.contentPanel, 'block');
            });
        }
        hideElement(uiElements.contentPanel); // Ensure content panel is initially hidden

        if (uiElements.previousControl) {
            uiElements.previousControl.addEventListener('click', movePrevious);
        }

        // Build TOC, setup warning system, normalize links, handle hash
        generateContentList();
        setupNotificationSystem();
        standardizeLinks();
        processURLFragment(); 
        refreshNavigationIndicators(); 
    }

    // Public API (if needed, otherwise just run initialSetup)
    return {
        start: initialApplicationSetup
    };

})();

// Execute initialization when DOM is ready
PresentationNavigator.start();