document.addEventListener('DOMContentLoaded', function() {

    let initialColorOffset = 0;

    const displaySections = document.getElementsByClassName('slide');

    for (let currentSectionIndex = 0; currentSectionIndex < displaySections.length; currentSectionIndex++) {
        const currentSection = displaySections[currentSectionIndex];

        const sequentialLabel = document.createElement('article');
        sequentialLabel.className = 'sequence-label';
        sequentialLabel.textContent = String(currentSectionIndex + 1);

        currentSection.appendChild(sequentialLabel);

        const calculatedHue = (initialColorOffset + (currentSectionIndex * 222.5)) % 360;
        currentSection.style.setProperty('background-color', `hsla(${calculatedHue}, 75%, 50%, 0.5)`);
    }

    const mainContentArea = document.body;
    const directionalMarkersMarkup = `
        <div class="navigation-marker marker-left"></div>
        <div class="navigation-marker marker-top"></div>
        <div class="navigation-marker marker-right"></div>
        <div class="navigation-marker marker-bottom"></div>
    `;
    mainContentArea.insertAdjacentHTML('afterbegin', directionalMarkersMarkup);

    window.setTimeout(() => {
        const allDirectionalMarkers = document.querySelectorAll('.navigation-marker');
        allDirectionalMarkers.forEach(markerElement => {
            markerElement.style.transition = 'opacity 900ms ease-out';
            markerElement.style.opacity = '0';
            window.setTimeout(() => {
                markerElement.style.display = 'none';
            }, 900);
        });
    }, 3000);

    const interactiveContainer = document.getElementById('slides');
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.slideToucher === 'function') {
        jQuery(interactiveContainer).slideToucher({
            vertical: true,
            horizontal: true
        });
    }
});