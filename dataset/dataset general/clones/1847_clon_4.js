if (document && document.getElementsByClassName) {
    var mainContainerHolder = document.getElementsByClassName('gallery');
    if (mainContainerHolder.length > 0) {
        var mainContainer = mainContainerHolder[0];

        mainContainer.classList.add('is-enhanced');

        var itemElements = Array.from(mainContainer.getElementsByTagName('figure'));
        var currentDisplayIndex = 0;

        var leftControl = document.createElement('span');
        leftControl.setAttribute('data-action', 'backward');
        leftControl.setAttribute('role', 'button');
        leftControl.setAttribute('aria-label', 'Go to prior image');
        leftControl.textContent = '❮';
        mainContainer.insertAdjacentElement('afterbegin', leftControl);

        var rightControl = document.createElement('span');
        rightControl.setAttribute('data-action', 'forward');
        rightControl.setAttribute('role', 'button');
        rightControl.setAttribute('aria-label', 'Go to next image');
        rightControl.textContent = '❯';
        mainContainer.insertAdjacentElement('beforeend', rightControl);

        function adjustVisibility(newIndex) {
            if (itemElements.length === 0) return;

            var finalIndex = (newIndex % itemElements.length + itemElements.length) % itemElements.length;

            if (finalIndex !== currentDisplayIndex) {
                if (itemElements[currentDisplayIndex]) {
                    itemElements[currentDisplayIndex].classList.remove('active');
                }
                itemElements[finalIndex].classList.add('active');
                currentDisplayIndex = finalIndex;
            }
        }

        mainContainer.addEventListener('click', function(eventObject) {
            var targetElement = eventObject.target;
            var actionType = targetElement.getAttribute('data-action');

            if (actionType === 'backward') {
                adjustVisibility(currentDisplayIndex - 1);
                eventObject.preventDefault();
            } else if (actionType === 'forward') {
                adjustVisibility(currentDisplayIndex + 1);
                eventObject.preventDefault();
            }
        });

        adjustVisibility(0);
    }
}