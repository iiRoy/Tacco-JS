const COMPONENT_INDICES = {
    UPPER_FACE: 0,
    SOUTHERN_FACE: 1,
    EASTERN_FACE: 2,
    WESTERN_FACE: 3,
    NORTHERN_FACE: 4,
    LOWER_FACE: 5
};

const TRANSITION_TABLES = {
    'N_MOVE': [COMPONENT_INDICES.NORTHERN_FACE, COMPONENT_INDICES.UPPER_FACE, COMPONENT_INDICES.EASTERN_FACE, COMPONENT_INDICES.WESTERN_FACE, COMPONENT_INDICES.LOWER_FACE, COMPONENT_INDICES.SOUTHERN_FACE],
    'S_MOVE': [COMPONENT_INDICES.SOUTHERN_FACE, COMPONENT_INDICES.LOWER_FACE, COMPONENT_INDICES.EASTERN_FACE, COMPONENT_INDICES.WESTERN_FACE, COMPONENT_INDICES.UPPER_FACE, COMPONENT_INDICES.NORTHERN_FACE],
    'W_MOVE': [COMPONENT_INDICES.WESTERN_FACE, COMPONENT_INDICES.SOUTHERN_FACE, COMPONENT_INDICES.UPPER_FACE, COMPONENT_INDICES.LOWER_FACE, COMPONENT_INDICES.NORTHERN_FACE, COMPONENT_INDICES.EASTERN_FACE],
    'E_MOVE': [COMPONENT_INDICES.EASTERN_FACE, COMPONENT_INDICES.SOUTHERN_FACE, COMPONENT_INDICES.LOWER_FACE, COMPONENT_INDICES.UPPER_FACE, COMPONENT_INDICES.NORTHERN_FACE, COMPONENT_INDICES.WESTERN_FACE]
};

const transformConfiguration = (currentLayout, moveDirection) => {
    const newLayout = new Array(6);
    let mappingRule;
    switch (moveDirection) {
        case "N": mappingRule = TRANSITION_TABLES.N_MOVE; break;
        case "S": mappingRule = TRANSITION_TABLES.S_MOVE; break;
        case "W": mappingRule = TRANSITION_TABLES.W_MOVE; break;
        case "E": mappingRule = TRANSITION_TABLES.E_MOVE; break;
        default: throw new Error("Unknown move direction encountered.");
    }
    for (let i = 0; i < 6; i++) {
        newLayout[i] = currentLayout[mappingRule[i]];
    }
    return newLayout;
};

const alignSouthernFace = (initialLayout, desiredSouth) => {
    let currentConfig = initialLayout;
    const rotationSequence = ["N", "N", "N", "W", "N", "N", "N", "W"];
    for (let k = 0; k <= rotationSequence.length; k++) {
        if (currentConfig[COMPONENT_INDICES.SOUTHERN_FACE] === desiredSouth) {
            return currentConfig;
        }
        if (k < rotationSequence.length) {
            currentConfig = transformConfiguration(currentConfig, rotationSequence[k]);
        }
    }
    return currentConfig; 
};

const alignUpperFace = (initialLayout, desiredUpper) => {
    let currentConfig = initialLayout;
    while (currentConfig[COMPONENT_INDICES.UPPER_FACE] !== desiredUpper) {
        currentConfig = transformConfiguration(currentConfig, "W");
    }
    return currentConfig;
};

const performCalculations = (rawInstructions) => {
    let currentLayout = rawInstructions[0].split(" ");

    rawInstructions.slice(2).forEach(instructionLine => {
        const [upperTarget, southernTarget] = instructionLine.split(" ");
        
        currentLayout = alignSouthernFace(currentLayout, southernTarget);
        currentLayout = alignUpperFace(currentLayout, upperTarget);
        
        console.log(currentLayout[COMPONENT_INDICES.EASTERN_FACE]);
    });
};

performCalculations(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));