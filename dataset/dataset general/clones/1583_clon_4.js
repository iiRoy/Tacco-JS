const visualSystem = {
    attachAsset: (item) => wade.addSceneObject(item),
    detachAsset: (item) => wade.removeSceneObject(item),
    clearCanvasLayer: (layerId) => wade.clearCanvas(layerId),
    removeLayerById: (layerId) => wade.removeLayer(layerId)
};

const GraphicComponent = Sprite;
const DisplayObject = SceneObject;
const createTileInstance = createToken;
const GridPanel = Board;
const arrangeGridElements = Layout;
const applyPanelFrame = boardFrame;

const PuzzleHost = function(challengeIdentifier) {
    this.currentGridManager = null;

    this.resetGameEnvironment = () => {
        if (this.currentGridManager && this.currentGridManager.frame) {
            visualSystem.detachAsset(this.currentGridManager.frame);
        }
        if (this.currentGridManager) {
            Object.values(this.currentGridManager.tokens).forEach(tokenRow => {
                Object.values(tokenRow).forEach(tokenItem => {
                    visualSystem.detachAsset(tokenItem);
                });
            });
        }
    };

    const challengeConfigurations = new Map([
        [1, {
            setup: (hostContext) => {
                const backgroundGraphic = new GraphicComponent("data/background.jpg", 5);
                const backgroundDisplay = new DisplayObject(backgroundGraphic);
                visualSystem.attachAsset(backgroundDisplay);

                const tileDefinition = createTileInstance("data/ChateauWRK.png", { x: 4, y: 4 });
                hostContext.currentGridManager = new GridPanel(hostContext, tileDefinition, 100, { col: 4, row: 4 }, "clickOnce");
                arrangeGridElements(hostContext.currentGridManager, "shuffle");
            },
            handler: (hostContext, interactionTarget) => {
                hostContext.currentGridManager.nextFrame(interactionTarget);
            }
        }],
        [2, {
            setup: (hostContext) => {
                const backgroundGraphic = new GraphicComponent("data/background.jpg", 5);
                const backgroundDisplay = new DisplayObject(backgroundGraphic);
                visualSystem.attachAsset(backgroundDisplay);

                const tileDefinition = createTileInstance("data/1to17.png", { x: 17, y: 1 });
                hostContext.currentGridManager = new GridPanel(hostContext, tileDefinition, 120, { col: 4, row: 4 }, "clickOnce");
                arrangeGridElements(hostContext.currentGridManager, "shuffle");
                hostContext.currentGridManager.setEmpty(hostContext.currentGridManager.tokens[1][2]);
            },
            handler: (hostContext, interactionTarget) => {
                const distanceMetric = hostContext.currentGridManager.tokenDistance(hostContext.currentGridManager.emptyToken, interactionTarget);
                console.log(distanceMetric);
                if (distanceMetric === 1) {
                    hostContext.currentGridManager.switchToken(hostContext.currentGridManager.emptyToken, interactionTarget);
                }
            }
        }],
        [3, {
            setup: (hostContext) => {
                const backgroundGraphic = new GraphicComponent("data/background.jpg", 5);
                const backgroundDisplay = new DisplayObject(backgroundGraphic);
                visualSystem.attachAsset(backgroundDisplay);

                const tileDefinition = createTileInstance("data/ChateauWRK.png", { x: 3, y: 3 });
                hostContext.currentGridManager = new GridPanel(hostContext, tileDefinition, 150, { col: 3, row: 3 }, "clickOnce", 1);
                arrangeGridElements(hostContext.currentGridManager, "shuffle");
                applyPanelFrame(hostContext.currentGridManager, 10);
                hostContext.currentGridManager.setEmpty(hostContext.currentGridManager.tokens[1][2]);
            },
            handler: (hostContext, interactionTarget) => {
                const distanceMetric = hostContext.currentGridManager.tokenDistance(hostContext.currentGridManager.emptyToken, interactionTarget);
                console.log(distanceMetric);
                if (distanceMetric === 1) {
                    hostContext.currentGridManager.switchToken(hostContext.currentGridManager.emptyToken, interactionTarget);
                }
            }
        }],
        [4, {
            setup: (hostContext) => {
                const backgroundGraphic = new GraphicComponent("data/background.jpg", 5);
                const backgroundDisplay = new DisplayObject(backgroundGraphic);
                visualSystem.attachAsset(backgroundDisplay);

                const tileDefinition = createTileInstance("data/ChateauWRK.png", { x: 4, y: 4 });
                hostContext.currentGridManager = new GridPanel(hostContext, tileDefinition, 150, { col: 4, row: 4 }, "clickFromTo", 1);
                arrangeGridElements(hostContext.currentGridManager, "shuffle");
                applyPanelFrame(hostContext.currentGridManager, 10);
            },
            handler: (hostContext, interactionTarget) => {
                hostContext.currentGridManager.switchFromTo();
            }
        }],
        [5, {
            setup: (hostContext) => {
                const backgroundGraphic = new GraphicComponent("data/background.jpg", 5);
                const backgroundDisplay = new DisplayObject(backgroundGraphic);
                visualSystem.attachAsset(backgroundDisplay);

                const tileDefinition = createTileInstance("data/blackAndWhite.png", { x: 2, y: 1 });
                hostContext.currentGridManager = new GridPanel(hostContext, tileDefinition, 150, { col: 4, row: 4 }, "clickFromTo", 1);
                arrangeGridElements(hostContext.currentGridManager, "random");
                applyPanelFrame(hostContext.currentGridManager, 10);
            },
            handler: (hostContext, interactionTarget) => {
                hostContext.currentGridManager.switchFromTo();
            }
        }]
    ]);

    const initializeChallengeSetup = () => {
        const configuration = challengeConfigurations.get(challengeIdentifier);
        if (configuration && configuration.setup) {
            this.resetGameEnvironment();
            configuration.setup(this);
        } else {
            console.error(`No setup defined for challenge ID: ${challengeIdentifier}`);
        }
    };

    this.processInteraction = (interactionTarget) => {
        const configuration = challengeConfigurations.get(challengeIdentifier);
        if (configuration && configuration.handler) {
            configuration.handler(this, interactionTarget);
        } else {
            console.error(`No interaction handler defined for challenge ID: ${challengeIdentifier}`);
        }
    };

    initializeChallengeSetup();
};