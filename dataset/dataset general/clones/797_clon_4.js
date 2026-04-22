const rootPage = document;

const activateScrollMotion = () => {
    const navigationLinks = rootPage.querySelectorAll('.housing a');

    const initiateFluidTraversal = (actionEvent) => {
        actionEvent.preventDefault();

        const targetDestination = actionEvent.currentTarget.getAttribute('href');
        if (!targetDestination || targetDestination[0] !== '#') {
            return;
        }

        const landingSpot = rootPage.querySelector(targetDestination);

        if (landingSpot) {
            window.scrollTo({
                top: landingSpot.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    navigationLinks.forEach(elementItem => {
        elementItem.addEventListener('click', initiateFluidTraversal);
    });
};

rootPage.addEventListener('DOMContentLoaded', activateScrollMotion);