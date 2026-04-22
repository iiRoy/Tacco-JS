class InformationHub {
    constructor() {
        this._fieldOne = 0;
        this._fieldTwo = 0;
        this._fieldThree = 0;
        this._observers = [];
    }

    accessFirst() { return this._fieldOne; }
    accessSecond() { return this._fieldTwo; }
    accessThird() { return this._fieldThree; }

    adjustFirst(val) {
        this._fieldOne = val;
        this.broadcastChange();
    }
    adjustSecond(val) {
        this._fieldTwo = val;
        this.broadcastChange();
    }
    adjustThird(val) {
        this._fieldThree = val;
        this.broadcastChange();
    }

    enrollObserver(callback) {
        this._observers.push(callback);
        callback({
            datumX: this._fieldOne,
            datumY: this._fieldTwo,
            datumZ: this._fieldThree
        });
    }

    broadcastChange() {
        const currentData = {
            datumX: this._fieldOne,
            datumY: this._fieldTwo,
            datumZ: this._fieldThree
        };
        this._observers.forEach(fn => fn(currentData));
    }
}

function assembleDisplayFacet(informationHubInstance, primaryIdentifierAlias) {
    const internalFacetState = {
        itemOne: 0,
        itemTwo: 0,
        itemThree: 0
    };

    const identifierToFieldMap = {
        'A': 'itemOne',
        'B': 'itemTwo',
        'C': 'itemThree'
    };

    const synchronizeView = (incomingData) => {
        internalFacetState.itemOne = incomingData.datumX;
        internalFacetState.itemTwo = incomingData.datumY;
        internalFacetState.itemThree = incomingData.datumZ;
    };

    informationHubInstance.enrollObserver(synchronizeView);

    return {
        obtainFacetState() {
            return { ...internalFacetState };
        },

        changeFacetValue(identifierAlias, newValue) {
            const actualFieldKey = identifierToFieldMap[identifierAlias];
            if (!actualFieldKey) return;

            internalFacetState[actualFieldKey] = newValue;

            if (identifierAlias === primaryIdentifierAlias) {
                if (identifierAlias === 'A') { informationHubInstance.adjustFirst(newValue); }
                else if (identifierAlias === 'B') { informationHubInstance.adjustSecond(newValue); }
                else if (identifierAlias === 'C') { informationHubInstance.adjustThird(newValue); }
            }
        }
    };
}