class InteractiveMapComponent {
    constructor(cfg) {
        this.componentConfiguration = {
            placement: 'topleft',
            labelContent: '',
            visualGlyph: 'fa-circle-o',
            executionCallback: () => { /* Placeholder, will be overridden */ },
            uniqueIdentifier: ''
        };
        Object.assign(this.componentConfiguration, cfg);

        this.interactiveAnchorElement = null;
    }

    assembleDisplayUnit() {
        const hostContainer = document.createElement('div');
        hostContainer.className = 'leaflet-bar leaflet-control';

        this.interactiveAnchorElement = document.createElement('a');
        this.interactiveAnchorElement.className = 'leaflet-bar-part';
        this.interactiveAnchorElement.href = '#';
        this.interactiveAnchorElement.title = this.componentConfiguration.labelContent;

        this.interactiveAnchorElement.addEventListener('click', (interactionEvent) => this.processInteraction(interactionEvent));

        this.composeVisualIndicator();

        hostContainer.appendChild(this.interactiveAnchorElement);
        return hostContainer;
    }

    processInteraction(interactionEvent) {
        interactionEvent.stopPropagation();
        interactionEvent.preventDefault();
        this.componentConfiguration.executionCallback();
    }

    composeVisualIndicator() {
        const supplementaryStyling = this.componentConfiguration.visualGlyph.startsWith('fa') ? ' fa fa-lg' : ' glyphicon';

        const indicatorGlyph = document.createElement('i');
        indicatorGlyph.className = this.componentConfiguration.visualGlyph + supplementaryStyling;
        if (this.componentConfiguration.uniqueIdentifier) {
            indicatorGlyph.id = this.componentConfiguration.uniqueIdentifier;
        }

        this.interactiveAnchorElement.appendChild(indicatorGlyph);
    }
}

function formLeafletActionButton(visualIdentifier, actionPerformer, descriptionText, leafletMapInstance, uniqueIdentifier) {
    const componentSettings = {};

    if (visualIdentifier) {
        componentSettings.visualGlyph = visualIdentifier;
    }
    if (uniqueIdentifier) {
        componentSettings.uniqueIdentifier = uniqueIdentifier;
    }

    // Default action, replicating original
    componentSettings.executionCallback = function() { alert('no function selected'); };
    if (typeof actionPerformer === 'function') {
        componentSettings.executionCallback = actionPerformer;
    }

    if (descriptionText) {
        componentSettings.labelContent = descriptionText;
    }

    const componentLogicInstance = new InteractiveMapComponent(componentSettings);

    const dynamicLeafletControl = L.Control.extend({
        options: {
            position: componentLogicInstance.componentConfiguration.placement
        },
        onAdd: function(mapRef) {
            return componentLogicInstance.assembleDisplayUnit();
        }
    });

    const generatedComponent = new dynamicLeafletControl();

    if (leafletMapInstance === '') {
        // skip auto addition
    } else if (leafletMapInstance) {
        leafletMapInstance.addControl(generatedComponent);
    } else {
        // Fallback to global map, replicating original behavior
        if (window.map) {
             window.map.addControl(generatedComponent);
        }
    }

    return generatedComponent;
}