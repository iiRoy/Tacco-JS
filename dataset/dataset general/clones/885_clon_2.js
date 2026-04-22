(function (jq) {
  function activateVisuals(vizInstance) {
    var chosenZone = {
      initialPos: { xCoord: -1, yCoord: -1 },
      finalPos: { xCoord: -1, yCoord: -1 },
      displayActive: false,
      isEngaged: false
    };
    var highlightOverlay = null;
    var retainedListeners = {};
    var pointerUpCallback = null;

    function processCursorMotion(evtData) {
      if (chosenZone.isEngaged) {
        adjustCurrentArea(evtData);
        vizInstance.getPlaceholder().trigger("plotselecting", [fetchCurrentArea()]);
      }
    }

    function processCursorClick(evtData) {
      if (evtData.which !== 1)
        return;

      document.body.focus();

      if (document.onselectstart !== undefined && retainedListeners.onselectstart == null) {
        retainedListeners.onselectstart = document.onselectstart;
        document.onselectstart = function () { return false; };
      }
      if (document.ondrag !== undefined && retainedListeners.ondrag == null) {
        retainedListeners.ondrag = document.ondrag;
        document.ondrag = function () { return false; };
      }

      positionActiveRegion(chosenZone.initialPos, evtData);

      chosenZone.isEngaged = true;

      pointerUpCallback = function (eventObj) { processCursorRelease(eventObj); };

      jq(document).one("mouseup", pointerUpCallback);
    }

    function processCursorRelease(evtData) {
      pointerUpCallback = null;

      if (document.onselectstart !== undefined)
        document.onselectstart = retainedListeners.onselectstart;
      if (document.ondrag !== undefined)
        document.ondrag = retainedListeners.ondrag;

      chosenZone.isEngaged = false;
      adjustCurrentArea(evtData);

      if (isRegionValid())
        emitRegionChosen();
      else {
        vizInstance.getPlaceholder().trigger("plotunselected", []);
        vizInstance.getPlaceholder().trigger("plotselecting", [null]);
      }

      return false;
    }

    function fetchCurrentArea() {
      if (!isRegionValid())
        return null;

      var outputBounds = {}, point1 = chosenZone.initialPos, point2 = chosenZone.finalPos;
      jq.each(vizInstance.getAxes(), function (axisName, axisObject) {
        if (axisObject.used) {
          var val1 = axisObject.c2p(point1[axisObject.orientation]), val2 = axisObject.c2p(point2[axisObject.orientation]);
          outputBounds[axisName] = { startVal: Math.min(val1, val2), endVal: Math.max(val1, val2) };
        }
      });
      return outputBounds;
    }

    function emitRegionChosen() {
      var resultRange = fetchCurrentArea();

      vizInstance.getPlaceholder().trigger("plotselected", [resultRange]);

      if (resultRange.xaxis && resultRange.yaxis)
        vizInstance.getPlaceholder().trigger("selected", [{ x1: resultRange.xaxis.startVal, y1: resultRange.yaxis.startVal, x2: resultRange.xaxis.endVal, y2: resultRange.yaxis.endVal }]);
    }

    function constrainValue(lowerBound, currentValue, upperBound) {
      return currentValue < lowerBound ? lowerBound : (currentValue > upperBound ? upperBound : currentValue);
    }

    function positionActiveRegion(posObj, evtData) {
      var cfgObj = vizInstance.getOptions();
      var containerOffset = vizInstance.getPlaceholder().offset();
      var drawingOffset = vizInstance.getPlotOffset();
      posObj.xCoord = constrainValue(0, evtData.pageX - containerOffset.left - drawingOffset.left, vizInstance.width());
      posObj.yCoord = constrainValue(0, evtData.pageY - containerOffset.top - drawingOffset.top, vizInstance.height());

      if (cfgObj.selection.mode === "y")
        posObj.xCoord = posObj === chosenZone.initialPos ? 0 : vizInstance.width();

      if (cfgObj.selection.mode === "x")
        posObj.yCoord = posObj === chosenZone.initialPos ? 0 : vizInstance.height();
    }

    function adjustCurrentArea(evtData) {
      if (evtData.pageX == null)
        return;

      positionActiveRegion(chosenZone.finalPos, evtData);
      if (isRegionValid()) {
        chosenZone.displayActive = true;
        vizInstance.triggerRedrawOverlay();
      }
      else
        eraseCurrentArea(true);
    }

    function eraseCurrentArea(suppressEvent) {
      if (chosenZone.displayActive) {
        chosenZone.displayActive = false;
        vizInstance.triggerRedrawOverlay();
        if (!suppressEvent)
          vizInstance.getPlaceholder().trigger("plotunselected", []);
      }
    }

    function deriveAxisRange(boundsObj, dimensionKey) {
      var axisObject, startVal, endVal, rangeKey, allAxes = vizInstance.getAxes();

      for (var k in allAxes) {
        axisObject = allAxes[k];
        if (axisObject.orientation === dimensionKey) {
          rangeKey = dimensionKey + axisObject.n + "axis";
          if (!boundsObj[rangeKey] && axisObject.n === 1)
            rangeKey = dimensionKey + "axis";
          if (boundsObj[rangeKey]) {
            startVal = boundsObj[rangeKey].startVal;
            endVal = boundsObj[rangeKey].endVal;
            break;
          }
        }
      }

      if (!boundsObj[rangeKey]) {
        axisObject = dimensionKey === "x" ? vizInstance.getXAxes()[0] : vizInstance.getYAxes()[0];
        startVal = boundsObj[dimensionKey + "1"];
        endVal = boundsObj[dimensionKey + "2"];
      }

      if (startVal != null && endVal != null && startVal > endVal) {
        var tempValue = startVal;
        startVal = endVal;
        endVal = tempValue;
      }

      return { startVal: startVal, endVal: endVal, axisObject: axisObject };
    }

    function defineActiveRegion(boundsObj, suppressEvent) {
      var axisObject, axisRange, cfgObj = vizInstance.getOptions();

      if (cfgObj.selection.mode === "y") {
        chosenZone.initialPos.xCoord = 0;
        chosenZone.finalPos.xCoord = vizInstance.width();
      }
      else {
        axisRange = deriveAxisRange(boundsObj, "x");

        chosenZone.initialPos.xCoord = axisRange.axisObject.p2c(axisRange.startVal);
        chosenZone.finalPos.xCoord = axisRange.axisObject.p2c(axisRange.endVal);
      }

      if (cfgObj.selection.mode === "x") {
        chosenZone.initialPos.yCoord = 0;
        chosenZone.finalPos.yCoord = vizInstance.height();
      }
      else {
        axisRange = deriveAxisRange(boundsObj, "y");

        chosenZone.initialPos.yCoord = axisRange.axisObject.p2c(axisRange.startVal);
        chosenZone.finalPos.yCoord = axisRange.axisObject.p2c(axisRange.endVal);
      }

      chosenZone.displayActive = true;
      vizInstance.triggerRedrawOverlay();
      if (!suppressEvent && isRegionValid())
        emitRegionChosen();
    }

    function isRegionValid() {
      var minimumDimension = 5;
      return Math.abs(chosenZone.finalPos.xCoord - chosenZone.initialPos.xCoord) >= minimumDimension &&
        Math.abs(chosenZone.finalPos.yCoord - chosenZone.initialPos.yCoord) >= minimumDimension;
    }

    vizInstance.clearSelection = eraseCurrentArea;
    vizInstance.setSelection = defineActiveRegion;
    vizInstance.getSelection = fetchCurrentArea;

    vizInstance.hooks.bindEvents.push(function (graphInst, listenerTarget) {
      var cfgObj = graphInst.getOptions();
      if (cfgObj.selection.mode != null) {
        listenerTarget.mousemove(processCursorMotion);
        listenerTarget.mousedown(processCursorClick);
      }
    });

    vizInstance.hooks.drawOverlay.push(function (graphInst, drawingSurface) {
      if (chosenZone.displayActive && isRegionValid()) {
        var drawingOffset = graphInst.getPlotOffset();
        var cfgObj = graphInst.getOptions();

        var colorObj = jq.color.parse(cfgObj.selection.color);

        var rectX = Math.min(chosenZone.initialPos.xCoord, chosenZone.finalPos.xCoord),
          rectY = Math.min(chosenZone.initialPos.yCoord, chosenZone.finalPos.yCoord),
          rectWidth = Math.abs(chosenZone.finalPos.xCoord - chosenZone.initialPos.xCoord),
          rectHeight = Math.abs(chosenZone.finalPos.yCoord - chosenZone.initialPos.yCoord);

        if (highlightOverlay) {
          highlightOverlay.attr({
            "x": rectX + drawingOffset.left,
            "y": rectY + drawingOffset.top,
            "width": rectWidth,
            "height": rectHeight
          });
        } else {
          highlightOverlay = drawingSurface.rect(rectX, rectY, rectWidth, rectHeight).attr({
            "stroke": "#AAAACC",
            "stroke-opacity": 1,
            "stroke-width": 1,
            "stroke-linejoin": "round",
            "fill": "#DDDDFF",
            "fill-opacity": 0.2
          }).translate(drawingOffset.left, drawingOffset.top);
        }
      }
    });

    vizInstance.hooks.shutdown.push(function (graphInst, listenerTarget) {
      listenerTarget.unbind("mousemove", processCursorMotion);
      listenerTarget.unbind("mousedown", processCursorClick);
      if (pointerUpCallback)
        jq(document).unbind("mouseup", pointerUpCallback);
    });
  }

  jq.plot.plugins.push({
    init: activateVisuals,
    options: {
      selection: {
        mode: null,
        color: "#d0e0f0"
      }
    },
    name: 'regionSelect',
    version: '1.1'
  });
})(jQuery);