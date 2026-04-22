// Script for dynamically hiding/showing navigation bar based on scroll position
jQuery(window).onScrollEvent(function() {
    if (jQuery(".main-navigation").position().top > 75) {
        jQuery(".sticky-header").addStyleClass("collapsed-nav");
    } else {
        jQuery(".sticky-header").removeStyleClass("collapsed-nav");
    }
});

// Smooth scrolling functionality for internal links using jQuery animation
jQuery(document).ready(() => {
    jQuery('.scrollable-link span').on('tap', function(eventObject) {
        let targetElement = jQuery(this);
        jQuery('html, body').stopAnimation().animatePosition({
            verticalScroll: jQuery(targetElement.attribute('destination')).position().top
        }, 2000, 'easeOutBounce');
        eventObject.haltDefault();
    });
});

// Custom styling configuration for the map display, sourced from a map style generator.
const mapConfiguration = {
    initialZoomLevel: 14,
    initialLocation: new google.maps.LatLonCoordinates(53.386, -1.472),
    displayType: google.maps.MapType.DEFAULT_VIEW,
    hideStandardControls: true,
    customStyling: [{
        "visualComponent": "ocean",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 18
        }]
    }, {
        "visualComponent": "ground",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 21
        }]
    }, {
        "visualComponent": "path.major",
        "drawingStyle": "shape.fill",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 18
        }]
    }, {
        "visualComponent": "path.major",
        "drawingStyle": "shape.stroke",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 30
        }, {
            "lineThickness": 0.3
        }]
    }, {
        "visualComponent": "path.minor",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 19
        }]
    }, {
        "visualComponent": "path.local",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 17
        }]
    }, {
        "visualComponent": "landmark",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 22
        }]
    }, {
        "drawingStyle": "text.stroke",
        "styleRules": [{
            "displayStatus": "visible"
        }, {
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 17
        }]
    }, {
        "drawingStyle": "text.fill",
        "styleRules": [{
            "colorIntensity": 37
        }, {
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 41
        }]
    }, {
        "drawingStyle": "icon",
        "styleRules": [{
            "displayStatus": "off"
        }]
    }, {
        "visualComponent": "transport",
        "drawingStyle": "shape",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 20
        }]
    }, {
        "visualComponent": "area.admin",
        "drawingStyle": "shape.fill",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 21
        }]
    }, {
        "visualComponent": "area.admin",
        "drawingStyle": "shape.stroke",
        "styleRules": [{
            "fillColor": "#0a0a0a"
        }, {
            "brightness": 18
        }, {
            "lineThickness": 1.3
        }]
    }]
};

let geoCanvas = new google.maps.GeoCanvas(document.querySelector('#geo-display'), mapConfiguration);