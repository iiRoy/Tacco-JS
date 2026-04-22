const obtainContent = require('fs').readFileSync;

const UP = 't';
const FRONT = 'n';
const RIGHT = 'e';
const LEFT = 'w';
const BACK = 's';
const DOWN = 'b';

const makeSolid = (values) => ({
    [UP]: values[0],
    [FRONT]: values[1],
    [RIGHT]: values[2],
    [LEFT]: values[3],
    [BACK]: values[4],
    [DOWN]: values[5]
});

const serializeSolid = (solidForm) => [
    solidForm[UP], solidForm[FRONT], solidForm[RIGHT],
    solidForm[LEFT], solidForm[BACK], solidForm[DOWN]
];

const spatialTransforms = {
    'N': (c) => ({ [UP]: c[FRONT], [FRONT]: c[DOWN], [RIGHT]: c[RIGHT], [LEFT]: c[LEFT], [BACK]: c[UP], [DOWN]: c[BACK] }),
    'S': (c) => ({ [UP]: c[BACK], [FRONT]: c[UP], [RIGHT]: c[RIGHT], [LEFT]: c[LEFT], [BACK]: c[DOWN], [DOWN]: c[FRONT] }),
    'E': (c) => ({ [UP]: c[LEFT], [FRONT]: c[FRONT], [RIGHT]: c[UP], [LEFT]: c[DOWN], [BACK]: c[BACK], [DOWN]: c[RIGHT] }),
    'W': (c) => ({ [UP]: c[RIGHT], [FRONT]: c[FRONT], [RIGHT]: c[DOWN], [LEFT]: c[UP], [BACK]: c[BACK], [DOWN]: c[LEFT] })
};

const reorientSolid = (directionIdentifier, currentSolid) => spatialTransforms[directionIdentifier](currentSolid);

const rotateUpperFace = (currentSolid) => ({
    [UP]: currentSolid[UP],
    [FRONT]: currentSolid[RIGHT],
    [RIGHT]: currentSolid[BACK],
    [LEFT]: currentSolid[FRONT],
    [BACK]: currentSolid[LEFT],
    [DOWN]: currentSolid[DOWN]
});

class ConfigurationInspector {
    #recordedConfigurations;
    #foundCollision;

    constructor() {
        this.#recordedConfigurations = new Set();
        this.#foundCollision = false;
    }

    evaluateRotations(initialSolid) {
        if (this.#foundCollision) return;

        let workingSolid = initialSolid;
        const currentCycleStates = new Set();

        for (let j = 0; j < 4; j++) {
            const stringified = JSON.stringify(serializeSolid(workingSolid));
            currentCycleStates.add(stringified);
            workingSolid = rotateUpperFace(workingSolid);
        }

        for (const stateString of currentCycleStates) {
            if (this.#recordedConfigurations.has(stateString)) {
                this.#foundCollision = true;
                return;
            }
            this.#recordedConfigurations.add(stateString);
        }
    }

    hasCollision() {
        return this.#foundCollision;
    }
}

const mainProcessor = () => {
    const rawData = obtainContent('/dev/stdin', 'utf8');
    const lineSegments = rawData.trim().split('\n');
    const totalCount = parseInt(lineSegments.shift(), 10);

    const inspector = new ConfigurationInspector();

    for (let k = 0; k < totalCount; k++) {
        const initialValues = lineSegments[k].split(' ').map(Number);
        let currentSolid = makeSolid(initialValues);

        for (let l = 0; l < 4; l++) {
            inspector.evaluateRotations(currentSolid);
            if (inspector.hasCollision()) break;
            currentSolid = reorientSolid('N', currentSolid);
        }
        if (inspector.hasCollision()) break;

        currentSolid = reorientSolid('E', currentSolid);
        inspector.evaluateRotations(currentSolid);
        if (inspector.hasCollision()) break;

        currentSolid = reorientSolid('S', currentSolid);
        currentSolid = reorientSolid('S', currentSolid);
        inspector.evaluateRotations(currentSolid);
        if (inspector.hasCollision()) break;
    }

    console.log(inspector.hasCollision() ? 'No' : 'Yes');
};

mainProcessor();