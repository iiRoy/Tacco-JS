(function (docObj, mapLib) {

    const defaultViewSettings = {
        visuals: {
            latitudeValue: null,
            longitudeValue: null
        },
        displayPreferences: {
            centerPoint: null,
            magnificationLevel: 15,
            magnificationControlEnabled: true,
            magnificationControlStyle: mapLib.maps.ZoomControlStyle.SMALL,
            doubleClickMagnificationDisabled: false,
            displayTypeControlEnabled: true,
            scaleIndicatorEnabled: true,
            scrollInteractionEnabled: false,
            streetViewControlEnabled: false,
            dragFunctionalityEnabled: true,
            overviewDisplayControlEnabled: false,
            baseMapType: mapLib.maps.MapTypeId.ROADMAP,
            panControlActive: false,
            customAppearance: [
                {
                    featureType: 'water',
                    stylers: [
                        { color: '#badae7' },
                        { visibility: 'on' }
                    ]
                },
                {
                    featureType: "landscape",
                    stylers: [
                        { saturation: -150 },
                        { lightness: 15 },
                        { color: '#ececec' },
                        { visibility: 'on' }
                    ]
                },
                {
                    featureType: 'road',
                    stylers: [
                        { saturation: -100 },
                        { lightness: 45 }
                    ]
                },
                {
                    featureType: 'road.highway',
                    stylers: [
                        { visibility: 'simplified' }
                    ]
                },
                {
                    featureType: 'road.arterial',
                    elementType: 'labels.icon',
                    stylers: [
                        { visibility: 'on' }
                    ]
                },
                {
                    featureType: 'administrative',
                    elementType: 'labels.text.fill',
                    stylers: [
                        { color: '#444444' }
                    ]
                },
                {
                    featureType: 'poi',
                    stylers: [
                        { saturation: -100 },
                        { lightness: 51 },
                        { visibility: 'on' }
                    ]
                }
            ],
        },
        markerGraphicSource: null
    };

    const fetchElementAttribute = (targetHtmlElement, attributeName) => {
        if (targetHtmlElement.dataset !== undefined) {
            return targetHtmlElement.dataset[attributeName];
        } else {
            return targetHtmlElement.getAttribute(`data-${attributeName}`);
        }
    };

    class EarthDisplayManager {
        #configurationOptions;
        #mapContext;
        #locationIdentifier;
        #informationPopup;

        constructor(hostElement) {
            this.#configurationOptions = JSON.parse(JSON.stringify(defaultViewSettings));

            this.#configureFromElement(hostElement);
            this.#initializeMap(hostElement);
            this.#createLocationMarker();
            this.#setupInformationPopup();
            this.#attachEventHandlers();

            if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
                this.#mapContext.setOptions({ draggable: false });
                this.#mapContext.setOptions({ panControl: true });
                docObj.getElementById('map-link').style.display = 'block';
            }
        }

        #configureFromElement(element) {
            const latitudeString = fetchElementAttribute(element, 'lat');
            const longitudeString = fetchElementAttribute(element, 'lng');
            const iconString = fetchElementAttribute(element, 'icon');

            this.#configurationOptions.visuals.latitudeValue = parseFloat(latitudeString);
            this.#configurationOptions.visuals.longitudeValue = parseFloat(longitudeString);
            this.#configurationOptions.markerGraphicSource = iconString;

            this.#configurationOptions.displayPreferences.centerPoint = new mapLib.maps.LatLng(
                this.#configurationOptions.visuals.latitudeValue,
                this.#configurationOptions.visuals.longitudeValue
            );
        }

        #initializeMap(element) {
            const currentMapOptions = {
                center: this.#configurationOptions.displayPreferences.centerPoint,
                zoom: this.#configurationOptions.displayPreferences.magnificationLevel,
                zoomControl: this.#configurationOptions.displayPreferences.magnificationControlEnabled,
                zoomControlOptions: {
                    style: this.#configurationOptions.displayPreferences.magnificationControlStyle
                },
                disableDoubleClickZoom: this.#configurationOptions.displayPreferences.doubleClickMagnificationDisabled,
                mapTypeControl: this.#configurationOptions.displayPreferences.displayTypeControlEnabled,
                scaleControl: this.#configurationOptions.displayPreferences.scaleIndicatorEnabled,
                scrollwheel: this.#configurationOptions.displayPreferences.scrollInteractionEnabled,
                streetViewControl: this.#configurationOptions.displayPreferences.streetViewControlEnabled,
                draggable: this.#configurationOptions.displayPreferences.dragFunctionalityEnabled,
                overviewMapControl: this.#configurationOptions.displayPreferences.overviewDisplayControlEnabled,
                mapTypeId: this.#configurationOptions.displayPreferences.baseMapType,
                panControl: this.#configurationOptions.displayPreferences.panControlActive,
                styles: this.#configurationOptions.displayPreferences.customAppearance
            };
            this.#mapContext = new mapLib.maps.Map(element, currentMapOptions);
        }

        #createLocationMarker() {
            this.#locationIdentifier = new mapLib.maps.Marker({
                position: new mapLib.maps.LatLng(
                    this.#configurationOptions.visuals.latitudeValue,
                    this.#configurationOptions.visuals.longitudeValue
                ),
                map: this.#mapContext,
                icon: this.#configurationOptions.markerGraphicSource
            });
        }

        #setupInformationPopup() {
            const popupContentOrigin = docObj.querySelector('[data-map-tpl="true"]');
            const popupContentHtml = popupContentOrigin ? popupContentOrigin.innerHTML : '';

            this.#informationPopup = new mapLib.maps.InfoWindow({
                content: popupContentHtml
            });

            this.#informationPopup.open(this.#mapContext, this.#locationIdentifier);

            mapLib.maps.event.addListener(this.#locationIdentifier, 'click', () => {
                this.#informationPopup.open(this.#mapContext, this.#locationIdentifier);
            });
        }

        #attachEventHandlers() {
            window.onresize = () => this.#adjustViewOnResize();
        }

        #adjustViewOnResize() {
            this.#mapContext.setCenter(this.#locationIdentifier.getPosition());

            let contentVisualHeight = 0;
            const infoWindowContentElement = docObj.querySelector('.gm-style-iw-d');
            if (infoWindowContentElement) {
                contentVisualHeight = infoWindowContentElement.clientHeight;
            } else {
                // Fallback if the internal class is not found, to match original's behavior
                // The original implicitly assumes k.contentNode is always available and has clientHeight
                contentVisualHeight = 100;
            }

            this.#mapContext.panBy(0, -contentVisualHeight);
        }
    }

    docObj.addEventListener('DOMContentLoaded', () => {
        const potentialMapContainer = docObj.querySelector('[data-map="true"]');
        if (potentialMapContainer !== null) {
            new EarthDisplayManager(potentialMapContainer);
        }
    });

}(document, google));