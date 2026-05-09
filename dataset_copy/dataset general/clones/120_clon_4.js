document.addEventListener('DOMContentLoaded', function () {
    const presentationWrapper = document.getElementById('slides');
    const elementItems = Array.from(presentationWrapper.querySelectorAll('li'));
    const itemQuantity = elementItems.length;
    let currentItemReference = 0;

    elementItems.forEach((item, index) => {
        if (index === 0) {
            item.classList.add('current-display');
            item.classList.add('active-state');
        } else {
            item.classList.remove('current-display');
            item.classList.remove('active-state');
        }
    });

    window.setInterval(function () {
        const previousActiveVisual = elementItems[currentItemReference];
        
        currentItemReference = (currentItemReference + 1) % itemQuantity;
        const upcomingActiveVisual = elementItems[currentItemReference];

        upcomingActiveVisual.classList.add('current-display');

        previousActiveVisual.classList.remove('current-display');

        window.setTimeout(() => {
            previousActiveVisual.classList.remove('active-state');
            upcomingActiveVisual.classList.add('active-state');
        }, 500);

    }, 5000);
});