const contextHost = window;
const resultSink = console;

const domOperations = {
    initiateElement: (kindOfElement) => {
        const underlyingNode = contextHost.document.createElement(kindOfElement);
        return {
            applyProperties: (settings) => {
                Object.keys(settings).forEach(propKey => {
                    underlyingNode.setAttribute(propKey, settings[propKey]);
                });
                return this;
            },
            configureVisuals: (styles) => {
                Object.keys(styles).forEach(styleKey => {
                    underlyingNode.style.setProperty(styleKey, styles[styleKey]);
                });
                return this;
            },
            injectContent: (data) => {
                underlyingNode.textContent = data;
                return this;
            },
            addCategorization: (category) => {
                if (Array.isArray(category)) {
                    category.forEach(item => underlyingNode.classList.add(item));
                } else {
                    underlyingNode.classList.add(category);
                }
                return this;
            },
            retrieveFinalNode: () => underlyingNode
        };
    }
};

const elementConfiguration = {
    tag: 'h1',
    attributes: { 'n': 'v' },
    styling: { 'color': 'red' },
    textValue: 'w0f w0f',
    classes: 'cls'
};

const constructedComponent = domOperations.initiateElement(elementConfiguration.tag)
    .applyProperties(elementConfiguration.attributes)
    .configureVisuals(elementConfiguration.styling)
    .injectContent(elementConfiguration.textValue)
    .addCategorization(elementConfiguration.classes)
    .retrieveFinalNode();

resultSink.log(constructedComponent.toString());