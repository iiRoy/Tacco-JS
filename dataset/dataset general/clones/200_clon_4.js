class PowerUpItem {
    static _effectVarieties = {
        0: 'speed',
        1: 'bomb',
        2: 'fire'
    };

    activeEffect = '';
    spatialCoordinates = {};
    visualComponent = null;

    constructor(cellLocation, categoryIndex) {
        this.activeEffect = PowerUpItem._effectVarieties[categoryIndex];
        this.spatialCoordinates = cellLocation;

        this.visualComponent = new createjs.Bitmap(gGameEngine.bonusesImg);
        const pixelMetrics = Utils.convertToBitmapPosition(cellLocation);
        this.visualComponent.x = pixelMetrics.x;
        this.visualComponent.y = pixelMetrics.y;
        this.visualComponent.sourceRect = new createjs.Rectangle(categoryIndex * 32, 0, 32, 32);
        gGameEngine.stage.addChild(this.visualComponent);
    }

    dismantleDisplay() {
        gGameEngine.stage.removeChild(this.visualComponent);
        
        // Custom in-place array removal, functionally equivalent to Utils.removeFromArray
        const removeSpecificItem = (targetArray, itemToRemove) => {
            const elementIndex = targetArray.indexOf(itemToRemove);
            if (elementIndex > -1) {
                targetArray.splice(elementIndex, 1);
            }
        };
        removeSpecificItem(gGameEngine.bonuses, this);
    }
}