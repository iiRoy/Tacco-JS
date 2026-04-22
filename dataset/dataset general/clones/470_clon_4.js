// Code for managing navigation bar appearance on scroll
function handleScrollingEffect() {
    const primaryNavigation = document.querySelector('.navbar');
    const fixedNavigation = document.querySelector('.navbar-fixed-top');
    const triggerThreshold = 50; 

    if (!primaryNavigation || !fixedNavigation) return;

    const currentPrimaryNavPosition = primaryNavigation.getBoundingClientRect().top + window.scrollY;

    if (currentPrimaryNavPosition > triggerThreshold) {
        fixedNavigation.classList.add('top-nav-collapse');
    } else {
        fixedNavigation.classList.remove('top-nav-collapse');
    }
}

let scrollTimerIdentifier;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimerIdentifier);
    scrollTimerIdentifier = setTimeout(handleScrollingEffect, 15); 
});

document.addEventListener('DOMContentLoaded', handleScrollingEffect); 

// Code for smooth page transitions upon link activation
const animateScroll = (targetPosition, durationTime, easingFunction) => {
    const initialPosition = window.scrollY || document.documentElement.scrollTop;
    const distance = targetPosition - initialPosition;
    let startTime = null;

    const stepAnimation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationTime, 1);
        const easedProgress = easingFunction(progress);

        window.scrollTo(0, initialPosition + distance * easedProgress);

        if (elapsed < durationTime) {
            window.requestAnimationFrame(stepAnimation);
        }
    };

    window.requestAnimationFrame(stepAnimation);
};

const customEaseExpo = (progress) => {
    if (progress === 0) return 0;
    if (progress === 1) return 1;
    if ((progress /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (progress - 1));
    return 0.5 * (-Math.pow(2, -10 * (progress - 1)) + 2);
};

document.addEventListener('DOMContentLoaded', () => {
    const scrollNavigationLinks = document.querySelectorAll('.page-scroll a');

    scrollNavigationLinks.forEach(linkElement => {
        linkElement.addEventListener('click', (interactionEvent) => {
            const destinationIdentifier = linkElement.getAttribute('href');
            if (!destinationIdentifier || destinationIdentifier === '#') return;

            const targetElement = document.querySelector(destinationIdentifier);
            if (targetElement) {
                interactionEvent.preventDefault();
                const targetVerticalPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const scrollMotionDuration = 1500;

                animateScroll(targetVerticalPosition, scrollMotionDuration, customEaseExpo);
            }
        });
    });
});

// Code for initializing Google Map with custom styling
const generateMapConfiguration = (latitudeCoordinate, longitudeCoordinate) => {
    const mapThemeElements = [
        { "feature": "water", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 17 }] },
        { "feature": "landscape", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 20 }] },
        { "feature": "road.highway", "element": "geometry.fill", "modifications": [{ "coloring": "#000000" }, { "brightness": 17 }] },
        { "feature": "road.highway", "element": "geometry.stroke", "modifications": [{ "coloring": "#000000" }, { "brightness": 29 }, { "thickness": 0.2 }] },
        { "feature": "road.arterial", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 18 }] },
        { "feature": "road.local", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 16 }] },
        { "feature": "poi", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 21 }] },
        { "element": "labels.text.stroke", "modifications": [{ "visibilityStatus": "on" }, { "coloring": "#000000" }, { "brightness": 16 }] },
        { "element": "labels.text.fill", "modifications": [{ "saturationLevel": 36 }, { "coloring": "#000000" }, { "brightness": 40 }] },
        { "element": "labels.icon", "modifications": [{ "visibilityStatus": "off" }] },
        { "feature": "transit", "element": "geometry", "modifications": [{ "coloring": "#000000" }, { "brightness": 19 }] },
        { "feature": "administrative", "element": "geometry.fill", "modifications": [{ "coloring": "#000000" }, { "brightness": 20 }] },
        { "feature": "administrative", "element": "geometry.stroke", "modifications": [{ "coloring": "#000000" }, { "brightness": 17 }, { "thickness": 1.2 }] }
    ];

    const formattedStyles = mapThemeElements.map(item => {
        const styleEntry = {};
        if (item.feature) styleEntry.featureType = item.feature;
        if (item.element) styleEntry.elementType = item.element;
        if (item.modifications) {
            styleEntry.stylers = item.modifications.map(mod => {
                const st = {};
                if (mod.coloring) st.color = mod.coloring;
                if (mod.brightness) st.lightness = mod.brightness;
                if (mod.thickness) st.weight = mod.thickness;
                if (mod.visibilityStatus) st.visibility = mod.visibilityStatus;
                if (mod.saturationLevel) st.saturation = mod.saturationLevel;
                return st;
            });
        }
        return styleEntry;
    });

    return {
        zoomLevel: 15,
        mapCenter: new google.maps.LatLng(latitudeCoordinate, longitudeCoordinate),
        displayType: google.maps.MapTypeId.ROADMAP,
        hideControls: true,
        customVisuals: formattedStyles
    };
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof google !== 'undefined' && google.maps) {
        const mapElementContainer = document.getElementById('map');
        if (mapElementContainer) {
            const configuration = generateMapConfiguration(53.385873, -1.471471);
            const generatedMapInstance = new google.maps.Map(mapElementContainer, {
                zoom: configuration.zoomLevel,
                center: configuration.mapCenter,
                mapTypeId: configuration.displayType,
                disableDefaultUI: configuration.hideControls,
                styles: configuration.customVisuals
            });
        }
    }
});