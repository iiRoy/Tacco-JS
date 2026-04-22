Raphael.extensionUtility = {
    drawingSurface: null,

    extractStructure: function() {
        this.drawingSurface = this;

        const shapeRegistry = [];

        const gatherVisualElements = (startingElement) => {
            const collectedElements = [];
            let currentElement = startingElement;
            while (currentElement) {
                if (currentElement && currentElement.type) {
                    collectedElements.push(currentElement);
                }
                currentElement = currentElement.nextSibling;
            }
            return collectedElements;
        };

        const allCanvasElements = gatherVisualElements(this.firstElement);

        const normalizeAttribute = (value, attributeName) => {
            if ((attributeName === 'stroke' || attributeName === 'fill') && value === 0) {
                return 'none';
            }
            return value;
        };

        const pathConverter = (pathData) => {
            if (typeof pathData === 'string') {
                return pathData;
            }
            return pathData.map(segmentGroup => {
                const [command, ...coordinates] = segmentGroup;
                return command + coordinates.join(',');
            }).join('');
        };

        const elementTransformers = {
            "image": (element) => ({
                kind: element.type,
                widthDimension: element.properties.width,
                heightDimension: element.properties.height,
                positionX: element.properties.x,
                positionY: element.properties.y,
                sourceURL: element.properties.src,
                transformationMatrix: element.transformArray ? element.transformArray.join(' ') : ''
            }),
            "ellipse": (element) => ({
                kind: element.type,
                radiusX: element.properties.rx,
                radiusY: element.properties.ry,
                centerX: element.properties.cx,
                centerY: element.properties.cy,
                lineColor: normalizeAttribute(element.properties.stroke, 'stroke'),
                lineWidth: element.properties['stroke-width'],
                fillColor: element.properties.fill
            }),
            "rect": (element) => ({
                kind: element.type,
                positionX: element.properties.x,
                positionY: element.properties.y,
                widthDimension: element.properties.width,
                heightDimension: element.properties.height,
                lineColor: normalizeAttribute(element.properties.stroke, 'stroke'),
                lineWidth: element.properties['stroke-width'],
                fillColor: element.properties.fill
            }),
            "text": (element) => ({
                kind: element.type,
                fontFamily: element.properties['font-family'],
                fontSize: element.properties['font-size'],
                lineColor: normalizeAttribute(element.properties.stroke, 'stroke'),
                fillColor: normalizeAttribute(element.properties.fill, 'fill'),
                lineWidth: element.properties['stroke-width'],
                positionX: element.properties.x,
                positionY: element.properties.y,
                textContent: element.properties.text,
                textAlignment: element.properties['text-anchor']
            }),
            "path": (element) => ({
                kind: element.type,
                fillColor: element.properties.fill,
                visualOpacity: element.properties.opacity,
                translationOffset: element.properties.translation,
                scaleFactor: element.properties.scale,
                pathDefinition: pathConverter(element.properties.path),
                lineColor: normalizeAttribute(element.properties.stroke, 'stroke'),
                lineWidth: element.properties['stroke-width'],
                transformationMatrix: element.transformArray ? element.transformArray.join(' ') : ''
            })
        };

        allCanvasElements.forEach(currentElement => {
            const handler = elementTransformers[currentElement.type];
            if (handler) {
                const transformedObject = handler(currentElement);
                shapeRegistry.push(transformedObject);
            }
        });

        return JSON.stringify(shapeRegistry);
    },

    importStructure: function(inputData) {
        this.drawingSurface = this;

        const parsedData = typeof inputData === "string" ? JSON.parse(inputData) : inputData;

        const collectionOfCreatedShapes = this.drawingSurface.set();

        const elementCreators = {
            "image": () => this.drawingSurface.image(),
            "ellipse": () => this.drawingSurface.ellipse(),
            "rect": () => this.drawingSurface.rect(),
            "text": () => this.drawingSurface.text(),
            "path": () => this.drawingSurface.path()
        };

        const denormalizeAttribute = (value) => {
            if (value === 'none') {
                return 0;
            }
            return value;
        };

        const reverseAttributeMapper = (originalAttrs) => {
            const mappedAttrs = {};
            for (const key in originalAttrs) {
                if (Object.prototype.hasOwnProperty.call(originalAttrs, key)) {
                    let newKey = key;
                    let newValue = originalAttrs[key];

                    switch (key) {
                        case 'kind': continue;
                        case 'widthDimension': newKey = 'width'; break;
                        case 'heightDimension': newKey = 'height'; break;
                        case 'positionX': newKey = 'x'; break;
                        case 'positionY': newKey = 'y'; break;
                        case 'sourceURL': newKey = 'src'; break;
                        case 'radiusX': newKey = 'rx'; break;
                        case 'radiusY': newKey = 'ry'; break;
                        case 'centerX': newKey = 'cx'; break;
                        case 'centerY': newKey = 'cy'; break;
                        case 'lineColor': newKey = 'stroke'; newValue = denormalizeAttribute(newValue); break;
                        case 'lineWidth': newKey = 'stroke-width'; break;
                        case 'fillColor': newKey = 'fill'; newValue = denormalizeAttribute(newValue); break;
                        case 'fontFamily': newKey = 'font-family'; break;
                        case 'fontSize': newKey = 'font-size'; break;
                        case 'textContent': newKey = 'text'; break;
                        case 'textAlignment': newKey = 'text-anchor'; break;
                        case 'visualOpacity': newKey = 'opacity'; break;
                        case 'translationOffset': newKey = 'translation'; break;
                        case 'scaleFactor': newKey = 'scale'; break;
                        case 'pathDefinition': newKey = 'path'; break;
                        case 'transformationMatrix': newKey = 'transform'; break;
                        default: break;
                    }
                    mappedAttrs[newKey] = newValue;
                }
            }
            return mappedAttrs;
        };

        parsedData.forEach(itemDescription => {
            try {
                const typeIdentifier = itemDescription.kind;
                const creatorFunction = elementCreators[typeIdentifier];

                if (creatorFunction) {
                    const elementInstance = creatorFunction();

                    const attributesToApply = reverseAttributeMapper(itemDescription);
                    elementInstance.attr(attributesToApply);

                    collectionOfCreatedShapes.push(elementInstance);
                }
            } catch (issue) {
            }
        });

        return collectionOfCreatedShapes;
    }
};