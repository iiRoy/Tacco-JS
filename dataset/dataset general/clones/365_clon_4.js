(function () {
    class ViewportMonitorWidget {
        constructor() {
            this.outputContainer = null;
            this.widthDisplay = null;
            this.heightDisplay = null;
            this.collapseControl = null;
            this.expandControl = null;
            this.dimensionsView = null;
            this.isFolded = false;

            this.initializeModule();
        }

        initializeModule() {
            // Ensure DOM is ready before proceeding
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.constructInterface.bind(this));
            } else {
                this.constructInterface();
            }
        }

        constructInterface() {
            // Main display panel
            this.outputContainer = document.createElement('div');
            this.outputContainer.className = 'vpmw-panel';
            Object.assign(this.outputContainer.style, {
                border: '1px solid #336699',
                backgroundColor: '#EAEFF5',
                position: 'fixed',
                left: '0px',
                bottom: '0px',
                padding: '10px',
                zIndex: '9999',
                fontFamily: 'sans-serif',
                fontSize: '14px'
            });

            // Wrapper for width/height display and close button
            this.dimensionsView = document.createElement('div');
            this.dimensionsView.className = 'vpmw-data-display';

            // Width information
            const widthLabel = document.createElement('b');
            widthLabel.textContent = 'Width: ';
            widthLabel.style.paddingLeft = '5px';
            this.widthDisplay = document.createElement('span');
            this.widthDisplay.className = 'vpmw-width-value';
            const widthUnit = document.createElement('span');
            widthUnit.textContent = 'px';
            this.dimensionsView.appendChild(widthLabel);
            this.dimensionsView.appendChild(this.widthDisplay);
            this.dimensionsView.appendChild(widthUnit);
            this.dimensionsView.appendChild(document.createElement('br'));

            // Height information
            const heightLabel = document.createElement('b');
            heightLabel.textContent = 'Height: ';
            heightLabel.style.paddingLeft = '5px';
            this.heightDisplay = document.createElement('span');
            this.heightDisplay.className = 'vpmw-height-value';
            const heightUnit = document.createElement('span');
            heightUnit.textContent = 'px';
            this.dimensionsView.appendChild(heightLabel);
            this.dimensionsView.appendChild(this.heightDisplay);
            this.dimensionsView.appendChild(heightUnit);

            // Collapse button
            this.collapseControl = document.createElement('a');
            this.collapseControl.href = '#';
            this.collapseControl.textContent = 'x';
            Object.assign(this.collapseControl.style, {
                color: 'red',
                textDecoration: 'none',
                position: 'absolute',
                top: '0',
                right: '0',
                lineHeight: '0.5em',
                fontSize: '1.2em',
                padding: '5px'
            });
            this.collapseControl.addEventListener('click', this.toggleViewState.bind(this));
            this.dimensionsView.appendChild(this.collapseControl);

            this.outputContainer.appendChild(this.dimensionsView);

            // Expand button (initially hidden)
            this.expandControl = document.createElement('a');
            this.expandControl.href = '#';
            this.expandControl.textContent = ' \u2197'; // Unicode for North East Arrow
            Object.assign(this.expandControl.style, {
                color: 'red',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'none', // Hidden by default
                padding: '5px'
            });
            this.expandControl.addEventListener('click', this.toggleViewState.bind(this));
            this.outputContainer.appendChild(this.expandControl);

            document.body.appendChild(this.outputContainer);

            this.updateMeasurements(); // Set initial values
            window.addEventListener('resize', this.updateMeasurements.bind(this));
        }

        updateMeasurements() {
            const currentClientWidth = window.innerWidth;
            const currentClientHeight = window.innerHeight;
            this.widthDisplay.textContent = currentClientWidth;
            this.heightDisplay.textContent = currentClientHeight;
        }

        toggleViewState(evt) {
            evt.preventDefault(); // Stop anchor default action

            this.isFolded = !this.isFolded;

            if (this.isFolded) {
                // Fold/minimize
                this.dimensionsView.style.display = 'none';
                this.expandControl.style.display = 'inline';
                this.outputContainer.style.padding = '5px';
            } else {
                // Unfold/restore
                this.dimensionsView.style.display = ''; // Restore default display
                this.expandControl.style.display = 'none';
                this.outputContainer.style.padding = '10px';
                this.updateMeasurements(); // Refresh values on restore
            }
        }
    }

    // Activate the monitoring widget
    new ViewportMonitorWidget();
})();