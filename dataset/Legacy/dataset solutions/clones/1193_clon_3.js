function DieObject(initialFaces) {
    this.upperFace = initialFaces[0];
    this.rearFace = initialFaces[1];
    this.rightFace = initialFaces[2];
    this.leftFace = initialFaces[3];
    this.frontFace = initialFaces[4];
    this.lowerFace = initialFaces[5];
}

DieObject.prototype._cycleFaces = function(faceKey1, faceKey2, faceKey3, faceKey4) {
    const tempValue = this[faceKey1];
    this[faceKey1] = this[faceKey2];
    this[faceKey2] = this[faceKey3];
    this[faceKey3] = this[faceKey4];
    this[faceKey4] = tempValue;
};

DieObject.prototype.performRotation = function(rotationDirection) {
    switch (rotationDirection) {
        case 'W':
            this._cycleFaces('leftFace', 'upperFace', 'rightFace', 'lowerFace');
            break;
        case 'N':
            this._cycleFaces('frontFace', 'upperFace', 'rearFace', 'lowerFace');
            break;
        case 'E':
            this._cycleFaces('rightFace', 'upperFace', 'leftFace', 'lowerFace');
            break;
        case 'S':
            this._cycleFaces('rearFace', 'upperFace', 'frontFace', 'lowerFace');
            break;
    }
};

DieObject.prototype.createCopy = function() {
    const currentFaceValues = [
        this.upperFace,
        this.rearFace,
        this.rightFace,
        this.leftFace,
        this.frontFace,
        this.lowerFace
    ];
    return new DieObject(currentFaceValues);
};

DieObject.prototype._ensureTopFace = function(desiredTopValue) {
    if (this.upperFace === desiredTopValue) {
        return;
    }
    if (this.frontFace === desiredTopValue) {
        this.performRotation('S');
        return;
    }
    if (this.rearFace === desiredTopValue) {
        this.performRotation('N');
        return;
    }
    if (this.rightFace === desiredTopValue) {
        this.performRotation('W');
        return;
    }
    if (this.leftFace === desiredTopValue) {
        this.performRotation('E');
        return;
    }
    this.performRotation('N');
    this.performRotation('N');
};

DieObject.prototype._rotateAroundVerticalAxis = function() {
    this._cycleFaces('frontFace', 'rightFace', 'rearFace', 'leftFace');
};

DieObject.prototype.getRightFaceForOrientation = function(targetTop, targetBack) {
    const temporaryDie = this.createCopy();

    temporaryDie._ensureTopFace(targetTop);

    for (let i = 0; i < 4; i++) {
        if (temporaryDie.rearFace === targetBack) {
            return temporaryDie.rightFace;
        }
        temporaryDie._rotateAroundVerticalAxis();
    }
    return temporaryDie.rightFace;
};

DieObject.prototype.checkEquivalence = function(comparedDie) {
    return this.rightFace === comparedDie.getRightFaceForOrientation(this.upperFace, this.rearFace);
};

(function(rawData) {
    const inputLines = rawData.split('\n');

    const parseFaceLabels = (lineString) => lineString.split(' ').map(Number);

    const firstDieLabels = parseFaceLabels(inputLines.shift());
    const secondDieLabels = parseFaceLabels(inputLines.shift());

    const dieA = new DieObject(firstDieLabels);
    const dieB = new DieObject(secondDieLabels);

    const equivalenceOutcome = dieA.checkEquivalence(dieB) ? 'Yes' : 'No';
    console.log(equivalenceOutcome);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
