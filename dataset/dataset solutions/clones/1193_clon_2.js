function Polyhedron(facetValues) {
    this.summit = facetValues[0];
    this.rearSide = facetValues[1];
    this.starboard = facetValues[2];
    this.port = facetValues[3];
    this.anterior = facetValues[4];
    this.base = facetValues[5];
}

Polyhedron.prototype.orientate = function(movementAxis) {
    /* This method adjusts the orientation of the polyhedron based on a given axis of rotation. */
    switch (movementAxis) {
        case 'LEFTWARD_MOVE':
            // Simulates a roll towards the left side (West).
            var temporaryHolder = this.port;
            this.port = this.summit;
            this.summit = this.starboard;
            this.starboard = this.base;
            this.base = temporaryHolder;
            break;

        case 'UPWARD_MOVE':
            // Simulates a roll towards the front side (North).
            var temporaryHolder = this.anterior;
            this.anterior = this.summit;
            this.summit = this.rearSide;
            this.rearSide = this.base;
            this.base = temporaryHolder;
            break;

        case 'RIGHTWARD_MOVE':
            // Simulates a roll towards the right side (East).
            var temporaryHolder = this.starboard;
            this.starboard = this.summit;
            this.summit = this.port;
            this.port = this.base;
            this.base = temporaryHolder;
            break;

        case 'DOWNWARD_MOVE':
            // Simulates a roll towards the back side (South).
            var temporaryHolder = this.rearSide;
            this.rearSide = this.summit;
            this.summit = this.anterior;
            this.anterior = this.base;
            this.base = temporaryHolder;
            break;
    }
};

Polyhedron.prototype.alignToSummit = function(targetSummitValue) {
    // Reorients the polyhedron so that a specific face value becomes the new summit.
    if (targetSummitValue === this.starboard) {
        this.orientate('LEFTWARD_MOVE');
    } else if (targetSummitValue === this.port) {
        this.orientate('RIGHTWARD_MOVE');
    } else if (targetSummitValue === this.rearSide) {
        this.orientate('UPWARD_MOVE');
    } else if (targetSummitValue === this.anterior) {
        this.orientate('DOWNWARD_MOVE');
    }
};

Polyhedron.prototype.retrieveStarboardFace = function(currentSummitValue, currentRearValue) {
    // Given the values on the summit and rear faces, this function determines the value on the starboard face.
    if (currentSummitValue === this.summit) {
        if (currentRearValue === this.rearSide) {
            return this.starboard;
        }
        if (currentRearValue === this.port) {
            return this.rearSide;
        }
        if (currentRearValue === this.anterior) {
            return this.port;
        }
        if (currentRearValue === this.starboard) {
            return this.anterior;
        }
    }
    if (currentSummitValue === this.anterior) {
        if (currentRearValue === this.summit) {
            return this.starboard;
        }
        if (currentRearValue === this.port) {
            return this.summit;
        }
        if (currentRearValue === this.base) {
            return this.port;
        }
        if (currentRearValue === this.starboard) {
            return this.base;
        }
    }
    if (currentSummitValue === this.base) {
        if (currentRearValue === this.anterior) {
            return this.starboard;
        }
        if (currentRearValue === this.port) {
            return this.anterior;
        }
        if (currentRearValue === this.rearSide) {
            return this.port;
        }
        if (currentRearValue === this.starboard) {
            return this.rearSide;
        }
    }
    if (currentSummitValue === this.rearSide) {
        if (currentRearValue === this.base) {
            return this.starboard;
        }
        if (currentRearValue === this.port) {
            return this.base;
        }
        if (currentRearValue === this.summit) {
            return this.port;
        }
        if (currentRearValue === this.starboard) {
            return this.summit;
        }
    }
    if (currentSummitValue === this.starboard) {
        if (currentRearValue === this.base) {
            return this.anterior;
        }
        if (currentRearValue === this.rearSide) {
            return this.base;
        }
        if (currentRearValue === this.summit) {
            return this.rearSide;
        }
        if (currentRearValue === this.anterior) {
            return this.summit;
        }
    }
    if (currentSummitValue === this.port) {
        if (currentRearValue === this.summit) {
            return this.anterior;
        }
        if (currentRearValue === this.anterior) {
            return this.base;
        }
        if (currentRearValue === this.base) {
            return this.rearSide;
        }
        if (currentRearValue === this.rearSide) {
            return this.summit;
        }
    }
};

Polyhedron.prototype.areBlocksCongruent = function(anotherPolyhedron) {
    // Compares the current polyhedron with another to check if they are identical in orientation and values.
    return this.starboard === anotherPolyhedron.retrieveStarboardFace(this.summit, this.rearSide);
};

( function(rawInputData) {
    // This immediately-invoked function expression processes the input data.
    var processedLines = rawInputData.split('\n');

    // Extract and parse the numerical facet values for the first polyhedron.
    var firstBlockFacets = processedLines.shift().split(' ').map(Number);

    // Extract and parse the numerical facet values for the second polyhedron.
    var secondBlockFacets = processedLines.shift().split(' ').map(Number);

    // Create instances of the Polyhedron object.
    var blockOne = new Polyhedron(firstBlockFacets);
    var blockTwo = new Polyhedron(secondBlockFacets);

    // Output whether the two polyhedrons are congruent.
    console.log(blockOne.areBlocksCongruent(blockTwo) ? 'Yes' : 'No');
} )( require('fs').readFileSync('/dev/stdin', 'utf8') );