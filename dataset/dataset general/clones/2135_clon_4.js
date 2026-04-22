const geoTools = org.polymaps;

function createNonileClassifier(inputDataMap, numberOfQuantiles, outputStartValue) {
    const allNumericValues = Object.values(inputDataMap).filter(val => typeof val === 'number' && !isNaN(val));

    if (allNumericValues.length === 0) {
        return () => outputStartValue;
    }

    const orderedValues = [...allNumericValues].sort((valA, valB) => valA - valB);
    const totalValueCount = orderedValues.length;
    const divisionPoints = [];

    for (let k = 1; k < numberOfQuantiles; k++) {
        const valueIndex = Math.floor(k * totalValueCount / numberOfQuantiles);
        divisionPoints.push(orderedValues[valueIndex]);
    }

    return function(inputValue) {
        if (typeof inputValue !== 'number' || isNaN(inputValue)) {
            return outputStartValue;
        }
        for (let i = 0; i < divisionPoints.length; i++) {
            if (inputValue <= divisionPoints[i]) {
                return outputStartValue + i;
            }
        }
        return outputStartValue + (numberOfQuantiles - 1);
    };
}

const dataClassifier = createNonileClassifier(unemployment, 9, 0);

const displayAtlas = geoTools.map()
    .container(document.getElementById("map").appendChild(geoTools.svg("svg")))
    .center({lat: 39, lon: -96})
    .zoom(4)
    .zoomRange([3, 7])
    .add(geoTools.interact());

const mapLayers = [
    geoTools.image()
        .url(geoTools.url("http://{S}tile.cloudmade.com"
            + "/1a1b06b230af4efdbb989ea99e9841af"
            + "/20760/256/{Z}/{X}/{Y}.png")
            .hosts(["a.", "b.", "c.", ""])),
    geoTools.geoJson()
        .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
        .on("load", processGeoElements)
        .id("county"),
    geoTools.geoJson()
        .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
        .id("state"),
    geoTools.compass()
        .pan("none")
];

mapLayers.forEach(layer => displayAtlas.add(layer));

function processGeoElements(eventPayload) {
    eventPayload.features.forEach(mapEntity => {
        const countySuffix = mapEntity.data.id.substring(9);
        if (countySuffix === "000") {
            return;
        }

        const dataLookupKey = mapEntity.data.id.substring(7);
        const measurement = unemployment[dataLookupKey];

        const assignedClassOrdinal = dataClassifier(measurement);
        mapEntity.element.setAttribute("class", `q${assignedClassOrdinal}-9`);

        const titleHolder = geoTools.svg("title");
        const descriptiveText = `${mapEntity.data.properties.name}: ${measurement}%`;
        titleHolder.appendChild(document.createTextNode(descriptiveText));
        mapEntity.element.appendChild(titleHolder);
    });
}

displayAtlas.container().setAttribute("class", "Blues");