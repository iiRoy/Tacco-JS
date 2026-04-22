const DisplayEngine = {
    _componentRegistry: new Map(),
    compose: function(configurationObject) {
        const ComponentConstructor = function(initialProps = {}, childElements = []) {
            this.properties = initialProps;
            this.containedElements = childElements;
            if (typeof configurationObject.composeOutput === 'function') {
                this.composeOutput = configurationObject.composeOutput.bind(this);
            }
        };
        ComponentConstructor.uniqueIdentifier = `ENTITY_${Math.random().toString(36).substring(2, 9)}`;
        return ComponentConstructor;
    },
    create: function(ComponentType, initialProps, ...additionalChildren) {
        const generatedInstance = new ComponentType(initialProps, additionalChildren);
        if (typeof generatedInstance.composeOutput === 'function') {
            // The return value of composeOutput (render in original) is typically consumed by the framework,
            // not directly by DisplayEngine.create itself.
            generatedInstance.composeOutput();
        }
        return generatedInstance;
    },
    render: function(RootComponentType, targetDomElement) {
        const rootInstance = DisplayEngine.create(RootComponentType, {});
        // In a full framework, this would traverse the component tree and mount to the DOM.
        // For a Type IV clone, we ensure the root component's logic is executed.
        if (rootInstance && typeof rootInstance.composeOutput === 'function') {
            rootInstance.composeOutput();
        }
    }
};

const Widget = DisplayEngine.compose({
    composeOutput: function() {
        return {};
    }
});

const CanvasRenderer = DisplayEngine.compose({
    composeOutput: function() {
        const initialElementIdentifiers = [
            "journey", "celestial", "dark_matter", "cosmic_dust", "stellar_flare",
            "nebula", "galaxy_core", "black_hole_sun", "supernova_blast",
            "comet_trail", "asteroid_field"
        ];

        let extendedElementIdentifiers = initialElementIdentifiers;
        // Replicates the original's single array duplication (repeats = 2, while(--repeats) runs once)
        extendedElementIdentifiers = extendedElementIdentifiers.concat(initialElementIdentifiers);

        const textureUnitWidth = 186;
        const textureUnitHeight = 270;
        const resizeFactor = 0.5;

        const drawnElementWidth = textureUnitWidth * resizeFactor;
        const drawnElementHeight = textureUnitHeight * resizeFactor;

        const containerWidth = 1000;
        const containerHeight = 700;

        const { graphicEntities } = extendedElementIdentifiers.reduce((accumulator, currentIdentifier) => {
            let { currentHorizontalPosition, currentVerticalPosition, collection } = accumulator;

            const newGraphicEntity = DisplayEngine.create(Widget, {
                topOffset: currentVerticalPosition,
                leftOffset: currentHorizontalPosition,
                visibleWidth: drawnElementWidth,
                visibleHeight: drawnElementHeight,
                imagePath: `assets/image_${currentIdentifier}.webp`
            });

            collection.push(newGraphicEntity);

            currentHorizontalPosition += drawnElementWidth;
            if (currentHorizontalPosition > (containerWidth - drawnElementWidth)) {
                currentHorizontalPosition = 0;
                currentVerticalPosition += drawnElementHeight;
            }

            return { currentHorizontalPosition, currentVerticalPosition, collection };
        }, { currentHorizontalPosition: 0, currentVerticalPosition: 0, collection: [] });

        const finalCompositionArguments = [
            Widget,
            {
                elementIdentifier: "backdrop-fill",
                topOffset: 0,
                leftOffset: 0,
                visibleWidth: containerWidth,
                visibleHeight: containerHeight
            }
        ].concat(graphicEntities);

        return DisplayEngine.create.apply(this, finalCompositionArguments);
    }
});

DisplayEngine.render(CanvasRenderer, document.getElementById("applicationContainer"));

const frameRateIndicator = document.getElementById("frameRateDisplay");