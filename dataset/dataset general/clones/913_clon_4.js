const VisualAssetGrid = class {
    #sourceImageElement;
    #overallWidth;
    #overallHeight;

    constructor(graphicResource) {
        this.#sourceImageElement = graphicResource;
        this.#overallWidth = graphicResource.width;
        this.#overallHeight = graphicResource.height;
    }

    determineCellPosition(elementIndex, cellDimensionX, cellDimensionY) {
        const cellsAcrossRow = this.#overallWidth / cellDimensionX;

        const rowNumber = (elementIndex / cellsAcrossRow) | 0;
        const columnNumber = elementIndex % cellsAcrossRow;

        const finalXCoord = columnNumber * cellDimensionY;
        const finalYCoord = rowNumber * cellDimensionX;

        return { x: finalXCoord, y: finalYCoord };
    }
};