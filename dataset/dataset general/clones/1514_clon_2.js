var DisplayModules = DisplayModules || {};

DisplayModules.HoneycombGrid = _.extend(
    {
        gridCells: [],
        cellCount: 16,
        initialCellTransform: 'matrix(1, 0, 0, 1, 0, 0)',
        activeBackgroundMode: '',
        frameRate: 60,

        initializeDisplay: function() {
            // Set up all necessary DOM elements for the visualization.
            this.constructLayoutElements();
            // Apply a subtle shading effect to the grid elements.
            this.applySubtleGradient();
            // Update the background layers with initial colors.
            this.updateBackgroundColors();
            // Start a timer to periodically change the background colors.
            this.ColorRefreshInterval = setInterval(_.bind(this.updateBackgroundColors, this), 1e4);
        },

        constructLayoutElements: function() {
            var gridContainerElement = document.createElement('div'),
                backgroundLayerContainer = document.createElement('div'),
                solidColorLayer = document.createElement('div'),
                gradientColorLayer = document.createElement('div');

            gridContainerElement.id = 'grid-container';
            backgroundLayerContainer.id = 'background-container';
            solidColorLayer.id = 'solid-color-layer';
            gradientColorLayer.id = 'gradient-color-layer';
            solidColorLayer.className = 'visual-layer';
            gradientColorLayer.className = 'visual-layer';

            backgroundLayerContainer.appendChild(gradientColorLayer);
            backgroundLayerContainer.appendChild(solidColorLayer);

            this.mainDisplayArea.appendChild(backgroundLayerContainer);
            this.mainDisplayArea.appendChild(gridContainerElement);

            for (let k = 0; k < this.cellCount; k++) {
                var cellWrapperDiv = document.createElement('div'),
                    cellElement = document.createElement('div');

                cellWrapperDiv.appendChild(cellElement);
                cellElement.style[vendorPrefix.style + 'transform'] = this.initialCellTransform;

                cellWrapperDiv.className += ' grid-cell-wrapper';
                cellElement.className += ' grid-cell';

                gridContainerElement.appendChild(cellWrapperDiv);
            }

            this.gridContainerElement = gridContainerElement;
            this.backgroundLayerContainer = backgroundLayerContainer;
            this.solidColorLayer = solidColorLayer;
            this.gradientColorLayer = gradientColorLayer;

            // Retrieve all dynamically created grid cell elements.
            this.gridCells = document.querySelectorAll('.grid-cell');
        },

        applySubtleGradient: function() {
            var shadeColor = 'hsla(0, 0%, 100%, 0.07)';

            for (var m = 0; m < this.cellCount; m++) {
                let beforePseudoRule = '#cell' + m + ':before { border-bottom-color : ' + shadeColor + '}';
                let afterPseudoRule = '#cell' + m + ':after { border-top-color : ' + shadeColor + '}';

                this.gridCells[m].id = 'cell' + m;
                this.gridCells[m].style['backgroundColor'] = shadeColor;
                document.head.styleSheets[0].insertRule(beforePseudoRule, 0);
                document.head.styleSheets[0].insertRule(afterPseudoRule, 0);
            }
        },

        updateBackgroundColors: function() {
            // Future enhancement: Ensure broad compatibility for CSS opacity and gradients.

            const dynamicGradientString = vendorPrefix.style + "linear-gradient(-30deg, " + generateRandomHexColor() + " 0%," + generateRandomHexColor() + " 50%," + generateRandomHexColor() + " 100%)";
            if (this.activeBackgroundMode === 'gradient') {
                this.solidColorLayer.style['background'] = generateRandomHexColor();
                this.solidColorLayer.style.opacity = 1;
                this.gradientColorLayer.style.opacity = 0;
                this.activeBackgroundMode = 'color';
            } else if (this.activeBackgroundMode === 'color') {
                this.gradientColorLayer.style['background'] = dynamicGradientString;
                this.solidColorLayer.style.opacity = 0;
                this.gradientColorLayer.style.opacity = 1;
                this.activeBackgroundMode = 'gradient';
            } else {
                this.solidColorLayer.style.opacity = 0;
                this.gradientColorLayer.style['background'] = dynamicGradientString;
                this.activeBackgroundMode = 'gradient';
            }
        },

        reactToAudioSpectrum: function(audioDataArray) {
            var sampledAmplitudeValues = downsampleArray(audioDataArray, this.cellCount);

            for (var p = 0; p < this.cellCount; p++) {
                this.gridCells[p].parentNode.style[vendorPrefix.style + 'transform'] = this.initialCellTransform + ' scale(' + (sampledAmplitudeValues[p] * 100 + 1) + ')';
            }
        },

        cleanupDisplay: function() {
            // Stop the periodic color update timer.
            clearInterval(this.ColorRefreshInterval);
        }

    },
    DisplayModules.BaseComponent
);