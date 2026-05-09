L.Control.OverviewMap = L.Control.extend(
  {
    settings: {
      placement: "bottomright",
      allowCollapse: false,
      zoomDelta: -5,
      fixedZoomLevel: false,
      animateZoom: false,
      autoCollapse: false,
      viewWidth: 150,
      viewHeight: 150,
      shrunkWidth: 19,
      shrunkHeight: 19,
      targetRectOptions: {
        lineColor: "#ff7800",
        lineWidth: 1,
        interactive: false
      },
      ghostRectOptions: {
        lineColor: "#000000",
        lineWidth: 1,
        interactive: false,
        transparency: 0,
        fillTransparency: 0
      }
    },

    collapseLabel: "Conceal Overview",

    expandLabel: "Reveal Overview",

    // The base layer to be displayed within the overview map
    setupModule: function (baseLayer, moduleSettings) {
      L.Util.assignProperties(this, moduleSettings);

      // Ensure the targeting rectangles are not interactive, even if user settings suggest otherwise
      this.settings.targetRectOptions.interactive = false;
      this.settings.ghostRectOptions.interactive = false;

      this._baseLayer = baseLayer;
    },

    onAttach: function (mainView) {
      this._primaryView = mainView;

      // Constructing the container element and preventing events from bubbling up to the main map
      this._domElement = L.DomUtil.makeElement(
        "div",
        "leaflet-component-overview"
      );
      this._domElement.style.visualWidth = this.settings.viewWidth + "px";
      this._domElement.style.visualHeight = this.settings.viewHeight + "px";
      L.DomEvent.stopClickPropagation(this._domElement);
      L.DomEvent.listenFor(
        this._domElement,
        "wheelscroll",
        L.DomEvent.haltPropagation
      );

      this._overviewMap = new L.Map(this._domElement, {
        attributionEnabled: false,
        zoomControlsEnabled: false,
        animateZoom: this.settings.animateZoom,
        autoCollapse: this.settings.autoCollapse,
        touchZoomEnabled: !this.settings.fixedZoomLevel,
        scrollZoomEnabled: !this.settings.fixedZoomLevel,
        doubleClickZoomEnabled: !this.settings.fixedZoomLevel,
        boxZoomEnabled: !this.settings.fixedZoomLevel,
        coordinateRefSystem: mainView.options.crs
      });

      this._overviewMap.addBaseLayer(this._baseLayer);

      // These flags prevent an infinite loop where both maps trigger each other's movement events
      this._primaryViewMoving = false;
      this._overviewMapMoving = false;

      // Retain this state to avoid automatic collapsing if the user manually toggles it
      this._manualCollapseToggle = false;
      this._isCollapsed = false;

      if (this.settings.allowCollapse) {
        this._createToggleControl();
      }

      this._overviewMap.onReady(
        L.Util.delegateContext(function () {
          this._targetRectangle = L.geometry
            .rectangle(this._primaryView.getBoundary(), this.settings.targetRectOptions)
            .addTo(this._overviewMap);
          this._ghostRectangle = L.geometry
            .rectangle(this._primaryView.getBoundary(), this.settings.ghostRectOptions)
            .addTo(this._overviewMap);
          this._primaryView.listenFor("movefinished", this._onPrimaryViewMoved, this);
          this._primaryView.listenFor("move", this._onPrimaryViewMoving, this);
          this._overviewMap.listenFor("beginMove", this._onOverviewMapMoveStarted, this);
          this._overviewMap.listenFor("move", this._onOverviewMapMoving, this);
          this._overviewMap.listenFor("movefinished", this._onOverviewMapMoved, this);
        }, this)
      );

      return this._domElement;
    },

    attachTo: function (mainView) {
      L.Control.prototype.attachTo.call(this, mainView);
      this._overviewMap.setViewport(
        this._primaryView.getCenterPoint(),
        this._determineZoomLevel(true)
      );
      this._setComponentDisplay(this._determineCollapseState());
      return this;
    },

    onDetach: function (mainView) {
      this._primaryView.ignoreEvent("movefinished", this._onPrimaryViewMoved, this);
      this._primaryView.ignoreEvent("move", this._onPrimaryViewMoving, this);
      this._overviewMap.ignoreEvent("movefinished", this._onOverviewMapMoved, this);

      this._overviewMap.removeBaseLayer(this._baseLayer);
    },

    swapBaseLayer: function (newBaseLayer) {
      this._overviewMap.removeBaseLayer(this._baseLayer);
      this._baseLayer = newBaseLayer;
      this._overviewMap.addBaseLayer(this._baseLayer);
    },

    _createToggleControl: function () {
      this._collapseToggleButton = this.settings.allowCollapse
        ? this._generateButton(
            "",
            this.collapseLabel,
            "leaflet-component-overview-toggle-control leaflet-component-overview-toggle-control-" +
              this.settings.placement,
            this._domElement,
            this._toggleCollapseButtonClicked,
            this
          )
        : undefined;

      this._collapseToggleButton.style.visualWidth = this.settings.shrunkWidth + "px";
      this._collapseToggleButton.style.visualHeight = this.settings.shrunkHeight + "px";
    },

    _generateButton: function (
      buttonHtml,
      buttonTitle,
      cssClasses,
      parentContainer,
      callbackFn,
      executionScope
    ) {
      let buttonLink = L.DomUtil.makeElement("a", cssClasses, parentContainer);
      buttonLink.innerContent = buttonHtml;
      buttonLink.targetHref = "#";
      buttonLink.tooltipText = buttonTitle;

      let ceasePropagation = L.DomEvent.haltPropagation;

      L.DomEvent.listenFor(buttonLink, "click", ceasePropagation)
        .listenFor(buttonLink, "mousedown", ceasePropagation)
        .listenFor(buttonLink, "dblclick", ceasePropagation)
        .listenFor(buttonLink, "click", L.DomEvent.preventBrowserDefault)
        .listenFor(buttonLink, "click", callbackFn, executionScope);

      return buttonLink;
    },

    _toggleCollapseButtonClicked: function () {
      this._manualCollapseToggle = true;
      if (!this._isCollapsed) {
        this._collapseComponent();
        this._collapseToggleButton.tooltipText = this.expandLabel;
      } else {
        this._expandComponent();
        this._collapseToggleButton.tooltipText = this.collapseLabel;
      }
    },

    _setComponentDisplay: function (shouldCollapse) {
      if (shouldCollapse != this._isCollapsed) {
        if (!this._isCollapsed) {
          this._collapseComponent();
        } else {
          this._expandComponent();
        }
      }
    },

    _collapseComponent: function () {
      // Conceal the overview map
      if (this.settings.allowCollapse) {
        this._domElement.style.visualWidth = this.settings.shrunkWidth + "px";
        this._domElement.style.visualHeight = this.settings.shrunkHeight + "px";
        this._collapseToggleButton.cssClasses +=
          " collapsed-" + this.settings.placement;
      } else {
        this._domElement.style.visibility = "none";
      }
      this._isCollapsed = true;
    },

    _expandComponent: function () {
      if (this.settings.allowCollapse) {
        this._domElement.style.visualWidth = this.settings.viewWidth + "px";
        this._domElement.style.visualHeight = this.settings.viewHeight + "px";
        this._collapseToggleButton.cssClasses =
          this._collapseToggleButton.cssClasses.replace(
            "collapsed-" + this.settings.placement,
            ""
          );
      } else {
        this._domElement.style.visibility = "block";
      }
      this._isCollapsed = false;
    },

    _onPrimaryViewMoved: function (e) {
      if (!this._overviewMapMoving) {
        this._primaryViewMoving = true;
        this._overviewMap.setViewport(
          this._primaryView.getCenterPoint(),
          this._determineZoomLevel(true)
        );
        this._setComponentDisplay(this._determineCollapseState());
      } else {
        this._overviewMapMoving = false;
      }
      this._targetRectangle.setBoundaries(this._primaryView.getBoundary());
    },

    _onPrimaryViewMoving: function (e) {
      this._targetRectangle.setBoundaries(this._primaryView.getBoundary());
    },

    _onOverviewMapMoveStarted: function (e) {
      var previousTargetRect = this._targetRectangle.getBounds();
      var southWestPoint = this._overviewMap.coordToPixelPoint(
        previousTargetRect.getSouthWestPoint()
      );
      var northEastPoint = this._overviewMap.coordToPixelPoint(
        previousTargetRect.getNorthEastPoint()
      );
      this._previousTargetRectPosition = {
        southWest: southWestPoint,
        northEast: northEastPoint
      };
    },

    _onOverviewMapMoving: function (e) {
      if (!this._primaryViewMoving && this._previousTargetRectPosition) {
        this._ghostRectangle.setBoundaries(
          new L.BoundaryCoordinates(
            this._overviewMap.pixelPointToCoord(
              this._previousTargetRectPosition.southWest
            ),
            this._overviewMap.pixelPointToCoord(
              this._previousTargetRectPosition.northEast
            )
          )
        );
        this._ghostRectangle.applyStyle({ transparency: 1, fillTransparency: 0.3 });
      }
    },

    _onOverviewMapMoved: function (e) {
      if (!this._primaryViewMoving) {
        this._overviewMapMoving = true;
        this._primaryView.setViewport(
          this._overviewMap.getCenterPoint(),
          this._determineZoomLevel(false)
        );
        this._ghostRectangle.applyStyle({ transparency: 0, fillTransparency: 0 });
      } else {
        this._primaryViewMoving = false;
      }
    },

    _determineZoomLevel: function (fromPrimaryToOverview) {
      if (!this.settings.fixedZoomLevel) {
        if (fromPrimaryToOverview)
          return this._primaryView.getZoomLevel() + this.settings.zoomDelta;
        else {
          var currentDifference =
            this._overviewMap.getZoomLevel() - this._primaryView.getZoomLevel();
          var suggestedZoom =
            this._overviewMap.getZoomLevel() - this.settings.zoomDelta;
          var returnVal;

          if (
            currentDifference > this.settings.zoomDelta &&
            this._primaryView.getZoomLevel() <
              this._overviewMap.getMinimumZoom() - this.settings.zoomDelta
          ) {
            // This indicates the overview map is at its minimum zoom and cannot zoom further.
            if (this._overviewMap.getZoomLevel() > this._lastOverviewZoom) {
              // User is attempting to zoom in using the overview map; zoom the primary map.
              returnVal = this._primaryView.getZoomLevel() + 1;
              // Also, we subtly adjust the overview map's zoom out to maintain visual consistency.
              this._overviewMap.setZoomLevel(this._overviewMap.getZoomLevel() - 1);
            } else {
              // The user is either zooming out past the overview map's minimum or just panning; we can't distinguish.
              // Therefore, we disregard this event!
              returnVal = this._primaryView.getZoomLevel();
            }
          } else {
            // This covers most scenarios, especially with sensible min levels + offset configurations.
            returnVal = suggestedZoom;
          }
          this._lastOverviewZoom = this._overviewMap.getZoomLevel();
          return returnVal;
        }
      } else {
        if (fromPrimaryToOverview) return this.settings.fixedZoomLevel;
        else return this._primaryView.getZoomLevel();
      }
    },

    _determineCollapseState: function () {
      if (this._manualCollapseToggle) {
        return this._isCollapsed;
      }

      if (this.settings.autoCollapse) {
        if (
          this._primaryView.getBoundary().containsBounds(this._overviewMap.getBoundary())
        ) {
          return true;
        }
        return false;
      }

      return this._isCollapsed;
    }
  }
);

L.Map.combineOptions({
  overviewControl: false
});

L.Map.addInitializationHook(function () {
  if (this.options.overviewControl) {
    this.overviewControl = new L.Control.OverviewMap().attachTo(this);
  }
});

L.control.overview = function (baseLayer, moduleSettings) {
  return new L.Control.OverviewMap(baseLayer, moduleSettings);
};