const _randomSource = (function() {
    let _currentSeed = 12345;
    const _multiplier = 9301;
    const _increment = 49297;
    const _modulus = 233280;

    function _nextValue() {
        _currentSeed = (_currentSeed * _multiplier + _increment) % _modulus;
        return _currentSeed / _modulus;
    }
    return {
        getValue: _nextValue
    };
})();

function _obtainRandom(min = 0, max = 1) {
    return min + _randomSource.getValue() * (max - min);
}

class CoordinateSystemEntity {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }
    deduct(otherEntity) {
        return new CoordinateSystemEntity(this.coordX - otherEntity.coordX, this.coordY - otherEntity.coordY);
    }
    normalizeToUnit() {
        const magnitude = Math.sqrt(this.coordX * this.coordX + this.coordY * this.coordY);
        return magnitude === 0 ? new CoordinateSystemEntity(0, 0) : new CoordinateSystemEntity(this.coordX / magnitude, this.coordY / magnitude);
    }
    scaleBy(factor) {
        return new CoordinateSystemEntity(this.coordX * factor, this.coordY * factor);
    }
}

class WorldPerimeter {
    constructor(boundaryWidth, boundaryHeight, leftEdge, topEdge) {
        this.boundaryWidth = boundaryWidth;
        this.boundaryHeight = boundaryHeight;
        this.leftEdge = leftEdge;
        this.topEdge = topEdge;
    }
    generateInteriorLocation() {
        return new CoordinateSystemEntity(
            this.leftEdge + _obtainRandom(0, 1) * this.boundaryWidth,
            this.topEdge + _obtainRandom(0, 1) * this.boundaryHeight
        );
    }
}

function generateSpaceDebris(quantity, currentOccupancy, maxOccupancy, worldLimits, createObjectFn, addObjectToSystemFn) {
    if (currentOccupancy >= maxOccupancy) {
        return;
    }

    const produceSingleFormation = () => {
        const perimeterWidth = worldLimits.boundaryWidth;
        const perimeterHeight = worldLimits.boundaryHeight;
        const perimeterLeft = worldLimits.leftEdge;
        const perimeterTop = worldLimits.topEdge;

        let initialPosition;
        const spawnSideIndex = Math.floor(_obtainRandom(0, 4));
        const outwardOffset = _obtainRandom(perimeterWidth * 0.1, perimeterWidth * 0.3);

        switch (spawnSideIndex) {
            case 0:
                initialPosition = new CoordinateSystemEntity(_obtainRandom(perimeterLeft, perimeterLeft + perimeterWidth), perimeterTop - outwardOffset);
                break;
            case 1:
                initialPosition = new CoordinateSystemEntity(perimeterLeft + perimeterWidth + outwardOffset, _obtainRandom(perimeterTop, perimeterTop + perimeterHeight));
                break;
            case 2:
                initialPosition = new CoordinateSystemEntity(_obtainRandom(perimeterLeft, perimeterLeft + perimeterWidth), perimeterTop + perimeterHeight + outwardOffset);
                break;
            case 3:
                initialPosition = new CoordinateSystemEntity(perimeterLeft - outwardOffset, _obtainRandom(perimeterTop, perimeterTop + perimeterHeight));
                break;
            default:
                initialPosition = new CoordinateSystemEntity(perimeterLeft + perimeterWidth / 2, perimeterTop + perimeterHeight / 2);
        }

        const gravitationalAnchor = worldLimits.generateInteriorLocation();
        const attractiveForce = gravitationalAnchor.deduct(initialPosition).normalizeToUnit().scaleBy(_obtainRandom(1, 4));

        const createdEntity = createObjectFn({
            location: { x: initialPosition.coordX, y: initialPosition.coordY },
            motion: { x: attractiveForce.coordX, y: attractiveForce.coordY }
        });
        addObjectToSystemFn(createdEntity);
    };

    const recursiveGeneration = (remainingCount) => {
        if (remainingCount <= 0) {
            return;
        }
        produceSingleFormation();
        recursiveGeneration(remainingCount - 1);
    };

    recursiveGeneration(quantity || 1);
}