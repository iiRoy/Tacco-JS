document.addEventListener('DOMContentLoaded', function domReadyHandler() {
 
    const mainNavigationTrigger = document.getElementById('nav-toggle');
    const menuSourceElement = document.getElementById('main-nav');

    if (mainNavigationTrigger) {
        mainNavigationTrigger.addEventListener('click', function sideMenuController(evt) {
            evt.preventDefault();
            if (menuSourceElement) {
                menuSourceElement.classList.toggle('menu-activated-panel');
                document.body.classList.toggle('shifted-content'); // Simulate body shift if sidr does this
            }
        });
    }

    const secondaryActionTrigger = document.getElementById('search-toggle');
    const toggleTargetElements = document.querySelectorAll('.search-container');

    if (secondaryActionTrigger) {
        secondaryActionTrigger.addEventListener('click', function visibilityChanger(evt) {
            evt.preventDefault();
            secondaryActionTrigger.classList.toggle('active-state-button');

            toggleTargetElements.forEach(function presenceModifier(item) {
                item.classList.toggle('container-active-class');
                
                // Emulate jQuery's .toggle()
                const currentDisplay = window.getComputedStyle(item).display;
                if (currentDisplay === 'none') {
                    item.style.display = 'block'; // Restore to block, common for containers
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});