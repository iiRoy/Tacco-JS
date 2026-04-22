(function() {
    const standardVisualSettings = {
        visualElements: ['http://dharmmotyar.googlecode.com/svn/trunk/images/spark.png', 'http://dharmmotyar.googlecode.com/svn/trunk/images//spark2.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark3.png', 'http://dharmmotyar.googlecode.com/svn/trunk/images/spark4.png'],
        luminosityCount: 10,
        containerTarget: 'document.body',
        flickerFactor: 0.2
    };

    class AetherGlowEmitter {
        constructor(userOptions) {
            this._currentConfiguration = Object.assign({}, standardVisualSettings, userOptions);
            this._displayContainer = null;
            this._containerTopOffset = 0;
            this._containerLeftOffset = 0;
            this._containerSpaceHeight = 0;
            this._containerSpaceWidth = 0;
            this._activeLuminaries = [];
            this._animationIdentifier = null;

            this.establishEnvironment();
            this.loadVisualAssets().then(() => {
                this.generateAllLuminaries();
                this.beginLuminosityMovement();
            }).catch(err => {
                console.error("AetherGlowEmitter encountered an error during setup:", err);
            });
        }

        establishEnvironment() {
            if (this._currentConfiguration.containerTarget === 'document.body') {
                this._displayContainer = document.body;
                this._containerTopOffset = 0;
                this._containerLeftOffset = 0;
                this._containerSpaceHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
                this._containerSpaceWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.body.clientWidth, document.documentElement.clientWidth);
            } else {
                this._displayContainer = document.querySelector(this._currentConfiguration.containerTarget);
                if (!this._displayContainer) {
                    throw new Error("AetherGlowEmitter: Specified container element not found: " + this._currentConfiguration.containerTarget);
                }
                const boundingBox = this._displayContainer.getBoundingClientRect();
                this._containerTopOffset = boundingBox.top + window.scrollY;
                this._containerLeftOffset = boundingBox.left + window.scrollX;

                const computedStyling = window.getComputedStyle(this._displayContainer);
                this._containerSpaceHeight = parseFloat(computedStyling.height);
                this._containerSpaceWidth = parseFloat(computedStyling.width);

                if (isNaN(this._containerSpaceHeight) || this._containerSpaceHeight <= 0) {
                    this._containerSpaceHeight = this._displayContainer.clientHeight;
                }
                if (isNaN(this._containerSpaceWidth) || this._containerSpaceWidth <= 0) {
                    this._containerSpaceWidth = this._displayContainer.clientWidth;
                }
            }
        }

        loadVisualAssets() {
            const assetPromises = this._currentConfiguration.visualElements.map(source => {
                return new Promise((resolve, reject) => {
                    const visualAsset = new Image();
                    visualAsset.onload = () => resolve(visualAsset);
                    visualAsset.onerror = () => reject(new Error(`Failed to load asset: ${source}`));
                    visualAsset.src = source;
                });
            });
            return Promise.all(assetPromises);
        }

        generateAllLuminaries() {
            for (let j = 0; j < this._currentConfiguration.luminosityCount; j++) {
                const selectedImageIndex = this.getVariedNumeric(this._currentConfiguration.visualElements.length);
                const imagePath = this._currentConfiguration.visualElements[selectedImageIndex];
                this.createIndividualLuminary(imagePath);
            }
        }

        createIndividualLuminary(imagePath) {
            const luminaryElement = document.createElement('img');
            luminaryElement.src = imagePath;
            luminaryElement.style.position = 'absolute';
            luminaryElement.style.zIndex = (-1 * this.getVariedNumeric(20)).toString();
            luminaryElement.style.display = 'none';

            this._displayContainer.appendChild(luminaryElement);

            const initialXCoord = this._containerLeftOffset + this.getVariedNumeric(this._containerSpaceWidth - 50);
            const initialYCoord = this._containerTopOffset + this.getVariedNumeric(this._containerSpaceHeight - 50);

            luminaryElement.style.left = initialXCoord + 'px';
            luminaryElement.style.top = initialYCoord + 'px';
            luminaryElement.style.opacity = this.determineVisibilityLevel(this._currentConfiguration.flickerFactor);

            luminaryElement.style.display = 'block';

            const targetXCoord = this._containerLeftOffset + this.getVariedNumeric(this._containerSpaceWidth - 50);
            const targetYCoord = this._containerTopOffset + this.getVariiedNumeric(this._containerSpaceHeight - 50);

            const newLuminary = {
                graphicElement: luminaryElement,
                currentX: initialXCoord,
                currentY: initialYCoord,
                motionStartX: initialXCoord,
                motionStartY: initialYCoord,
                motionStartTime: performance.now(),
                motionDuration: (this.getVariedNumeric(10) + 5) * 2000,
                targetX: targetXCoord,
                targetY: targetYCoord,
                finalOpacity: parseFloat(luminaryElement.style.opacity)
            };
            this._activeLuminaries.push(newLuminary);
        }

        beginLuminosityMovement() {
            if (!this._animationIdentifier) {
                this._animationIdentifier = requestAnimationFrame(this.processAnimationFrame.bind(this));
            }
        }

        processAnimationFrame(currentTime) {
            this._activeLuminaries.forEach(luminary => {
                let timeElapsed = currentTime - luminary.motionStartTime;

                if (timeElapsed >= luminary.motionDuration) {
                    luminary.motionStartX = luminary.targetX;
                    luminary.motionStartY = luminary.targetY;
                    luminary.motionStartTime = currentTime;
                    luminary.motionDuration = (this.getVariedNumeric(10) + 5) * 2000;
                    luminary.targetX = this._containerLeftOffset + this.getVariedNumeric(this._containerSpaceWidth - 50);
                    luminary.targetY = this._containerTopOffset + this.getVariedNumeric(this._containerSpaceHeight - 50);
                    luminary.finalOpacity = this.determineVisibilityLevel(this._currentConfiguration.flickerFactor);
                    timeElapsed = 0;
                }

                const progressRatio = Math.min(timeElapsed / luminary.motionDuration, 1);
                const currentXPos = luminary.motionStartX + (luminary.targetX - luminary.motionStartX) * progressRatio;
                const currentYPos = luminary.motionStartY + (luminary.targetY - luminary.motionStartY) * progressRatio;

                luminary.graphicElement.style.left = currentXPos + 'px';
                luminary.graphicElement.style.top = currentYPos + 'px';
                luminary.graphicElement.style.opacity = luminary.finalOpacity;

                luminary.currentX = currentXPos;
                luminary.currentY = currentYPos;
            });

            this._animationIdentifier = requestAnimationFrame(this.processAnimationFrame.bind(this));
        }

        getVariedNumeric(maximumValue) {
            return Math.ceil(Math.random() * maximumValue) - 1;
        }

        determineVisibilityLevel(flickerThreshold) {
            const randomProbability = Math.random();
            return randomProbability < flickerThreshold ? 0 : 1;
        }
    }

    window.initiateAetherGlow = function(userSettings) {
        return new AetherGlowEmitter(userSettings);
    };
})();