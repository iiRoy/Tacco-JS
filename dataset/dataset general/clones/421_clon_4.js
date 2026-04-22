const _entityRegistry = new Map();
const _blueprintCache = new Map();
const _layoutDefinitions = new Map();
const _materialSettings = {
    color: { red: 255, green: 255, blue: 255, opacity: 1.0 },
    shadingModel: "Transparent/Diffuse"
};

let _nextEntityId = 0;
function _produceUniqueIdentity(prefix = "element") {
    return `${prefix}_${_nextEntityId++}`;
}

function produceSpatialElement(identity, kind = 'unit', coordX = 0, coordY = 0, coordZ = 0) {
    const newElement = {
        identity: identity,
        category: kind,
        position: { x: coordX, y: coordY, z: coordZ },
        orientation: { angleX: 0, angleY: 0, angleZ: 0 },
        dimensions: { scaleX: 1, scaleY: 1, scaleZ: 1 },
        appearance: {
            color: { red: 255, green: 255, blue: 255, opacity: 1.0 },
            texture: { name: "", origin: "File", wrapMode: 1 },
            surface: { ..._materialSettings }
        },
        parentIdentifier: null,
        subElements: []
    };
    return newElement;
}

function retrieveElement(identity) {
    return _entityRegistry.get(identity);
}

function generateBasicUnit(label, posX, posY, posZ) {
    const newUnit = produceSpatialElement(label, 'unit', posX, posY, posZ);
    _entityRegistry.set(label, newUnit);
    return newUnit;
}

function constructTransientUnit(label, posX, posY, posZ) {
    return produceSpatialElement(label, 'unit', posX, posY, posZ);
}

function duplicateElementDeep(sourceElement, newIdentity, newX, newY, newZ) {
    const duplicated = JSON.parse(JSON.stringify(sourceElement));
    duplicated.identity = newIdentity;
    duplicated.position = { x: newX, y: newY, z: newZ };
    duplicated.parentIdentifier = null;
    duplicated.subElements = duplicated.subElements.map(child => {
        const childDuplicated = JSON.parse(JSON.stringify(child));
        childDuplicated.identity = _produceUniqueIdentity(`${newIdentity}_${child.identity}`);
        childDuplicated.parentIdentifier = duplicated.identity;
        return childDuplicated;
    });
    return duplicated;
}

function cloneElement(sourceElement, newTag, placeX, placeY, placeZ) {
    const cloned = duplicateElementDeep(sourceElement, newTag, placeX, placeY, placeZ);
    _entityRegistry.set(newTag, cloned);
    const registerSubElements = (element) => {
        element.subElements.forEach(child => {
            _entityRegistry.set(child.identity, child);
            registerSubElements(child);
        });
    };
    registerSubElements(cloned);
    return cloned;
}

function modifyOpacity(targetLabel, transparency) {
    const targetElement = retrieveElement(targetLabel);
    if (targetElement && targetElement.appearance) {
        targetElement.appearance.color.opacity = transparency;
    }
}

function createComponentBlueprint(label, x, y, z, r = 255, g = 255, b = 255, textureName = "", textureType = "File", opacity = 1.0, wrap = 1) {
    return {
        partIdentity: label,
        partX: x,
        partY: y,
        partZ: z,
        partRed: r,
        partGreen: g,
        partBlue: b,
        partTexture: textureName,
        partTextureSource: textureType,
        partOpacity: opacity,
        partWrap: wrap
    };
}

function composeAssembly(groupLabel, componentList, atX, atY, atZ) {
    const groupOrigin = produceSpatialElement(groupLabel, 'group', atX, atY, atZ);
    _entityRegistry.set(groupLabel, groupOrigin);

    const anchorDefinition = componentList.find(c => c.partIdentity === "AxisPoint");
    if (anchorDefinition) {
        modifyOpacity(groupLabel, 0.0);
    }
    
    componentList.forEach(spec => {
        if (spec.partIdentity === "AxisPoint") {
            return;
        }

        const childElement = constructTransientUnit(spec.partIdentity, spec.partX, spec.partY, spec.partZ);
        if (spec.partRed !== 255 || spec.partGreen !== 255 || spec.partBlue !== 255) {
            childElement.appearance.color = { red: spec.partRed, green: spec.partGreen, blue: spec.partBlue, opacity: childElement.appearance.color.opacity };
        }
        if (spec.partOpacity !== 1.0) {
            modifyOpacity(childElement.identity, spec.partOpacity);
        }
        if (spec.partTexture !== "") {
            childElement.appearance.texture = { name: spec.partTexture, origin: spec.partTextureSource, wrapMode: spec.partWrap };
        }

        if (spec.partIdentity.startsWith("collider")) {
            modifyOpacity(childElement.identity, 0.0);
        }
        
        childElement.parentIdentifier = groupOrigin.identity;
        groupOrigin.subElements.push(childElement);
        _entityRegistry.set(childElement.identity, childElement);
    });
    
    groupOrigin.position = { x: atX, y: atY, z: atZ };
    return groupOrigin;
}

const _virtualBinaryFiles = {
    "MyObject.bin": JSON.stringify([
        createComponentBlueprint("AxisPoint", 0, 0, 0),
        createComponentBlueprint("mainCube", 0, 0, 0, 255, 0, 0),
        createComponentBlueprint("subCube", 1, 1, 1, 0, 255, 0, "textureA.png", "Web", 0.5)
    ]),
    "AnotherObject.bin": JSON.stringify([
        createComponentBlueprint("AxisPoint", 0, 0, 0),
        createComponentBlueprint("baseUnit", 0, 0, 0, 0, 0, 255),
        createComponentBlueprint("topUnit", 0, 1, 0, 255, 255, 0)
    ])
};

const _virtualMarkupFiles = {
    "MyObject.xml": `
        <ElementList>
            <Element partIdentity="AxisPoint" partX="0" partY="0" partZ="0"/>
            <Element partIdentity="mainCube" partX="0" partY="0" partZ="0" partRed="255" partGreen="0" partBlue="0"/>
            <Element partIdentity="subCube" partX="1" partY="1" partZ="1" partRed="0" partGreen="255" partBlue="0" partTexture="textureA.png" partTextureSource="Web" partOpacity="0.5"/>
        </ElementList>
    `,
    "AnotherObject.xml": `
        <ElementList>
            <Element partIdentity="AxisPoint" partX="0" partY="0" partZ="0"/>
            <Element partIdentity="baseUnit" partX="0" partY="0" partZ="0" partRed="0" partGreen="0" partBlue="255"/>
            <Element partIdentity="topUnit" partX="0" partY="1" partZ="0" partRed="255" partGreen="255" partBlue="0"/>
        </ElementList>
    `
};

function parseMarkupString(markupString) {
    const componentBlueprints = [];
    const elementRegex = /<Element ([^>]+)\/>/g;
    let match;
    while ((match = elementRegex.exec(markupString)) !== null) {
        const attributeString = match[1];
        const attributes = {};
        const attributeRegex = /(\w+)="([^"]*)"/g;
        let attributeMatch;
        while ((attributeMatch = attributeRegex.exec(attributeString)) !== null) {
            attributes[attributeMatch[1]] = attributeMatch[2];
        }

        componentBlueprints.push(createComponentBlueprint(
            attributes.partIdentity || "",
            parseFloat(attributes.partX || 0),
            parseFloat(attributes.partY || 0),
            parseFloat(attributes.partZ || 0),
            parseInt(attributes.partRed || 255),
            parseInt(attributes.partGreen || 255),
            parseInt(attributes.partBlue || 255),
            attributes.partTexture || "",
            attributes.partTextureSource || "File",
            parseFloat(attributes.partOpacity || 1.0),
            parseInt(attributes.partWrap || 1)
        ));
    }
    return componentBlueprints;
}

function generateModel(modelKey, instanceTag, placeX, placeY, placeZ) {
    let blueprint = _blueprintCache.get(modelKey);
    let templateElement;

    if (!blueprint) {
        const fileContent = _virtualBinaryFiles[modelKey];
        if (!fileContent) {
            return null;
        }
        blueprint = JSON.parse(fileContent);
        
        templateElement = composeAssembly(`_template_${modelKey}`, blueprint, 0, 0, 1000000000);
        modifyOpacity(`_template_${modelKey}`, 0.0);
        _blueprintCache.set(modelKey, templateElement);
    } else {
        templateElement = blueprint;
    }

    const newInstance = cloneElement(templateElement, instanceTag, placeX, placeY, placeZ);
    return newInstance;
}

function generateModelFromMarkup(markupKey, instanceTag, placeX, placeY, placeZ) {
    let blueprint = _blueprintCache.get(markupKey);
    let templateElement;

    if (!blueprint) {
        const fileContent = _virtualMarkupFiles[markupKey];
        if (!fileContent) {
            return null;
        }
        blueprint = parseMarkupString(fileContent);
        
        templateElement = composeAssembly(`_template_${markupKey}`, blueprint, 0, 0, 1000000000);
        modifyOpacity(`_template_${markupKey}`, 0.0);
        _blueprintCache.set(markupKey, templateElement);
    } else {
        templateElement = blueprint;
    }

    const newInstance = cloneElement(templateElement, instanceTag, placeX, placeY, placeZ);
    return newInstance;
}

function createLayoutComponentBlueprint(objFile, instanceId, x, y, z, rotX, rotY, rotZ) {
    return {
        assetFile: objFile,
        assetInstance: instanceId,
        posX: x,
        posY: y,
        posZ: z,
        rotAngleX: rotX,
        rotAngleY: rotY,
        rotAngleZ: rotZ
    };
}

const _virtualLayoutFiles = {
    "MyMap.map": JSON.stringify([
        createLayoutComponentBlueprint("MyObject.bin", "mapItem1", 0, 0, 0, 0, 0, 0),
        createLayoutComponentBlueprint("AnotherObject.bin", "mapItem2", 5, 0, 0, 0, 90, 0),
        createLayoutComponentBlueprint("MyObject.bin", "mapItem3", -5, 0, 0, 0, 0, 45)
    ])
};

function buildSceneLayout(layoutSource, layoutInstance, placeX, placeY, placeZ) {
    let layoutConfig = _layoutDefinitions.get(layoutSource);
    let layoutParentElement;

    if (!layoutConfig) {
        const fileContent = _virtualLayoutFiles[layoutSource];
        if (!fileContent) {
            return null;
        }
        layoutConfig = JSON.parse(fileContent);
        _layoutDefinitions.set(layoutSource, layoutConfig);
    }

    layoutParentElement = generateBasicUnit("LayoutGroup_" + layoutInstance, placeX, placeY, placeZ);
    modifyOpacity("LayoutGroup_" + layoutInstance, 0.0);

    layoutConfig.forEach(mapItem => {
        let currentInstanceName = mapItem.assetInstance;
        if (layoutInstance !== "Original Names") {
            currentInstanceName = `${layoutInstance}_${mapItem.assetInstance}`;
        }
        
        const instantiatedAsset = generateModel(mapItem.assetFile, currentInstanceName, mapItem.posX, mapItem.posY, mapItem.posZ);
        if (instantiatedAsset) {
            instantiatedAsset.orientation = { angleX: mapItem.rotAngleX, angleY: mapItem.rotAngleY, angleZ: mapItem.rotAngleZ };
            instantiatedAsset.parentIdentifier = layoutParentElement.identity;
            layoutParentElement.subElements.push(instantiatedAsset);
        }
    });

    return layoutParentElement;
}