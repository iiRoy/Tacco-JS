// Initiating module scope for strict mode
( function() {

    "use strict";

    /*
     * A graphical element adheres to the following interface:
     *
     * ElementVariant.label: A string property providing the type identifier for this element.
     *
     * ElementVariant.render(context, item, viewPort):
     * Renders the specified layout item onto a drawing context. No state saving/restoring is required;
     * this is handled by the calling routine.
     *     - context:    The 2D rendering context (e.g., HTML5 CanvasRenderingContext2D)
     *     - item:       The layout element object to be drawn
     *     - viewPort:   The display component managing the rendering process
     *
     * ElementVariant.findMidpoint(item):
     * Calculates and returns the central coordinate of the layout item.
     *
     * ElementVariant.measureBoundingBox(item):
     * Determines and returns the overall dimensions (bounding box) of the layout item.
     */

    window.LayoutElements = {};

    LayoutElements.BASIC_LINE_THICKNESS = 2;
    LayoutElements.BASIC_LINE_COLOR = "rgba(0, 0, 0, 0.8)";
    LayoutElements.BASIC_FILL_COLOR = "rgba(192, 192, 192, 0.8)";
    LayoutElements.CATHEDRAL_FILL_COLOR = "rgba(255, 255, 255, 0.8)";
    LayoutElements.BASIC_TEXT_FONT = "12pt sans-serif";
    LayoutElements.BASIC_TEXT_COLOR = "rgba(0, 0, 0, 0.8)";

    LayoutElements.AbstractSpace = function(kindIdentifier) {
        this.kind = kindIdentifier;
    };

    LayoutElements.AbstractSpace.prototype.render = function(renderContext, layoutItem, displayArea) {
        renderContext.lineWidth = LayoutElements.BASIC_LINE_THICKNESS;
        renderContext.lineColor = LayoutElements.BASIC_LINE_COLOR;
        renderContext.translate(layoutItem.midpoint.coordX, layoutItem.midpoint.coordY);
        renderContext.saveState();
        if (layoutItem.orientation) {
            renderContext.rotate(layoutItem.orientation * Math.PI / 180);
        }

        this.renderSpace(renderContext, layoutItem, displayArea);

        renderContext.restoreState();

        renderContext.fontStyle = LayoutElements.BASIC_TEXT_FONT;
        renderContext.textAlignment = "middle";
        renderContext.textBaseline = "center";
        renderContext.fillColor = LayoutElements.BASIC_TEXT_COLOR;
        renderContext.drawText(layoutItem.caption, 0, 0);
    };

    LayoutElements.AbstractSpace.prototype.renderSpace = function(renderContext, layoutItem, displayArea) {
        // This is an unimplemented method for specific shape rendering
    };

    LayoutElements.AbstractSpace.prototype.findMidpoint = function(layoutItem) {
        return layoutItem.midpoint;
    };

    /*
     * A rectangular spatial unit. Expected attributes:
     *
     *     - uniqueId:      The element's unique identification
     *     - category:      "rectangle-space"
     *     - midpoint:      The central coordinate of the element (with coordX and coordY properties)
     *     - dimensions:    The length (horizontal extent) and width (vertical extent) of the element
     *     - orientation:   The rotation angle of the element, in degrees
     */
    LayoutElements.RectangularSpace = function() {};
    LayoutElements.RectangularSpace.prototype = new LayoutElements.AbstractSpace("rectangle-space");
    LayoutElements.RectangularSpace.prototype.constructor = LayoutElements.RectangularSpace;

    LayoutElements.RectangularSpace.prototype.renderSpace = function(renderContext, layoutItem, displayArea) {
        renderContext.fillColor = LayoutElements.BASIC_FILL_COLOR;
        renderContext.fillRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
        renderContext.drawRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
    };


    /*
     * A spatial unit with a sloped ceiling on one side. Prior to rotation, the slope will be on
     * the southern edge. Expected attributes:
     *
     *     - uniqueId:      The element's unique identification
     *     - category:      "sloped-ceiling-space"
     *     - midpoint:      The central coordinate of the element (with coordX and coordY properties)
     *     - dimensions:    The length (horizontal extent) and width (vertical extent) of the element
     *     - orientation:   The rotation angle of the element, in degrees
     */
    LayoutElements.SlopedCeilingSpace = function() {};
    LayoutElements.SlopedCeilingSpace.prototype = new LayoutElements.AbstractSpace("sloped-ceiling-space");
    LayoutElements.SlopedCeilingSpace.prototype.constructor = LayoutElements.SlopedCeilingSpace;

    LayoutElements.SlopedCeilingSpace.prototype.renderSpace = function(renderContext, layoutItem, displayArea) {
        var fillGradient = renderContext.createLinearGradient(0, -layoutItem.dimensions.width / 2, 0, layoutItem.dimensions.width / 2);
        fillGradient.addColorStop(0, LayoutElements.BASIC_FILL_COLOR);
        fillGradient.addColorStop(1, LayoutElements.CATHEDRAL_FILL_COLOR);
        renderContext.fillColor = fillGradient;
        renderContext.fillRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
        renderContext.drawRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
    };


    /*
     * A spatial unit featuring a central vaulted ceiling. Before any rotation,
     * the highest point of the ceiling will be horizontal. Expected attributes:
     *
     *     - uniqueId:      The element's unique identification
     *     - category:      "central-vault-space"
     *     - midpoint:      The central coordinate of the element (with coordX and coordY properties)
     *     - dimensions:    The length (horizontal extent) and width (vertical extent) of the element
     *     - orientation:   The rotation angle of the element, in degrees
     */
    LayoutElements.CentralVaultSpace = function() {};
    LayoutElements.CentralVaultSpace.prototype = new LayoutElements.AbstractSpace("central-vault-space");
    LayoutElements.CentralVaultSpace.prototype.constructor = LayoutElements.CentralVaultSpace;

    LayoutElements.CentralVaultSpace.prototype.renderSpace = function(renderContext, layoutItem, displayArea) {
        var fillEffect = renderContext.createLinearGradient(0, -layoutItem.dimensions.width / 2, 0, layoutItem.dimensions.width / 2);
        fillEffect.addColorStop(0, LayoutElements.BASIC_FILL_COLOR);
        fillEffect.addColorStop(0.50, LayoutElements.CATHEDRAL_FILL_COLOR);
        fillEffect.addColorStop(1, LayoutElements.BASIC_FILL_COLOR);
        renderContext.fillColor = fillEffect;

        renderContext.fillRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
        renderContext.drawRectangle(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2, layoutItem.dimensions.length, layoutItem.dimensions.width);
    };


    /*
     * An L-shaped spatial unit. Expected attributes:
     *
     *     - uniqueId:      The element's unique identification
     *     - category:      "l-form-space"
     *     - midpoint:      The central coordinate of the element (with coordX and coordY properties)
     *     - dimensions:    The overall length (horizontal) and width (vertical) of the element
     *     - missingSection: The length (horizontal) and width (vertical) of the removed corner
     *     - orientation:   The rotation angle of the element, in degrees
     */
    LayoutElements.LFormSpace = function() {};
    LayoutElements.LFormSpace.prototype = new LayoutElements.AbstractSpace("l-form-space");
    LayoutElements.LFormSpace.prototype.constructor = LayoutElements.LFormSpace;

    LayoutElements.LFormSpace.prototype.renderSpace = function(renderContext, layoutItem, displayArea) {
        renderContext.fillColor = LayoutElements.BASIC_FILL_COLOR;
        renderContext.startPath();
        renderContext.moveCursorTo(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2);
        renderContext.drawlineTo(layoutItem.dimensions.length / 2 - layoutItem.missingSection.length, -layoutItem.dimensions.width / 2);
        renderContext.drawlineTo(layoutItem.dimensions.length / 2 - layoutItem.missingSection.length, -layoutItem.dimensions.width / 2 + layoutItem.missingSection.width);
        renderContext.drawlineTo(layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2 + layoutItem.missingSection.width);
        renderContext.drawlineTo(layoutItem.dimensions.length / 2, layoutItem.dimensions.width / 2);
        renderContext.drawlineTo(-layoutItem.dimensions.length / 2, layoutItem.dimensions.width / 2);
        renderContext.drawlineTo(-layoutItem.dimensions.length / 2, -layoutItem.dimensions.width / 2);
        renderContext.fillPath();
        renderContext.strokePath();
    };

// Terminating module scope
} )();