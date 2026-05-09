const LayoutInitiator = (() => {
  const executeInitiation = () => {
    SurfaceComposer();
  };
  return {
    beginDesign: executeInitiation
  };
})();

const SurfaceComposer = (() => {
  function provisionDrawingSurface() {
    app.documents.length || app.documents.add(settings.width, settings.height, 72, "", NewDocumentMode.RGB);
    return app.activeDocument;
  }

  function drawReferenceLines(currentDoc, markerSpecs) {
    markerSpecs.horizontal.forEach(positionValue => {
      currentDoc.guides.add(Direction.HORIZONTAL, UnitValue(`${Math.round(positionValue)} pixels`));
    });
    markerSpecs.vertical.forEach(positionValue => {
      currentDoc.guides.add(Direction.VERTICAL, UnitValue(`${Math.round(positionValue)} pixels`));
    });
  }

  function buildStructureHierarchy(currentDoc, elementSpecs, containerNode = currentDoc) {
    return [...elementSpecs].reverse().map(elementConfig => {
      if (elementConfig.layers != null) {
        const groupNode = containerNode.layerSets.add();
        groupNode.name = elementConfig.name;
        return buildStructureHierarchy(currentDoc, elementConfig.layers, groupNode);
      } else {
        const itemNode = containerNode.artLayers.add();
        itemNode.name = elementConfig.name;
        return itemNode.name;
      }
    });
  }

  function configureCanvas(currentDoc) {
    drawReferenceLines(currentDoc, settings.guides);
    return buildStructureHierarchy(currentDoc, settings.layers);
  }

  const composerFunction = () => {
    const activeDrawingSurface = provisionDrawingSurface();
    app.activeDocument.suspendHistory("Setup Workflow", () => {
      configureCanvas(activeDrawingSurface);
    });
  };

  return composerFunction;
})();

const compositionProcess = LayoutInitiator.beginDesign();