const globalAppState = {
    networkLink: null,
    updateIntervalHandle: null,
    mainPlayerCharacter: null,
    otherPlayerCharacters: {},
    playerConfig: {
        width: 64,
        height: 64,
        spriteSource: "hero_base_sprite"
    },
    resourceManifest: [
        { alias: "zone1_tiles", type: "image", location: "data/desert1.png" },
        { alias: "zone1_map", type: "tmx", location: "data/desert.tmx" },
        { alias: "hero_base_sprite", type: "image", location: "data/player_male_base.png" },
        { alias: "visibility_mask", type: "image", location: "data/fog.png" }
    ]
};

const globalFunctions = {};

globalFunctions.addNewAdventurer = (adventurerData) => {
    const visualConfig = {
        spritewidth: globalAppState.playerConfig.width,
        spriteheight: globalAppState.playerConfig.height,
        image: globalAppState.playerConfig.spriteSource
    };

    const newAdventurerInstance = new GamePawn(adventurerData.x, adventurerData.y, visualConfig);
    newAdventurerInstance.depth = 3;
    globalAppState.otherPlayerCharacters[adventurerData.id] = newAdventurerInstance;
    me.game.add(newAdventurerInstance);
    me.game.sort();
};

globalFunctions.heroInitialized = (heroEntity) => {
    globalAppState.mainPlayerCharacter = heroEntity;
    globalAppState.networkLink = io.connect();

    const networkEventHandlers = {
        'connect': () => {
            globalAppState.networkLink.emit('logon', globalAppState.mainPlayerCharacter.position);
        },
        'players': (playerList) => {
            console.log("Current adventurers: " + playerList);
            playerList.forEach(globalFunctions.addNewAdventurer);
            globalAppState.updateIntervalHandle = setTimeout(globalFunctions.transmitPosition, 200);
        },
        'moved': (adventurerData) => {
            const targetAdventurer = globalAppState.otherPlayerCharacters[adventurerData.id];
            if (targetAdventurer) {
                targetAdventurer.targetX = adventurerData.x;
                targetAdventurer.targetY = adventurerData.y;
            }
        },
        'connected': (newAdventurer) => {
            console.log("Adventurer joined: " + newAdventurer);
            globalFunctions.addNewAdventurer(newAdventurer);
        },
        'disconnected': (departedAdventurer) => {
            console.log("Adventurer departed: " + departedAdventurer);
            const removedAdventurer = globalAppState.otherPlayerCharacters[departedAdventurer.id];
            me.game.remove(removedAdventurer);
            delete globalAppState.otherPlayerCharacters[departedAdventurer.id];
        }
    };

    for (const eventName in networkEventHandlers) {
        globalAppState.networkLink.on(eventName, networkEventHandlers[eventName]);
    }

    globalFunctions.transmitPosition = () => {
        globalAppState.networkLink.emit('move', globalAppState.mainPlayerCharacter.position);
        globalAppState.updateIntervalHandle = setTimeout(globalFunctions.transmitPosition, 200);
    };
};

const applicationBootstrapper = {

    initiate: function() {
        if (!me.video.init('jsapp', 640, 384, false, 1.0))
        {
            alert("Sorry but your browser does not support html 5 canvas.");
            return;
        }

        me.audio.init("mp3,ogg");

        me.loader.onload = this.assetsReady.bind(this);

        me.loader.preload(globalAppState.resourceManifest);

        me.state.change(me.state.LOADING);
    },

    assetsReady: function() {
        me.state.set(me.state.PLAY, new GameDisplay());

        me.entityPool.add("mainPlayer", LocalHero);

        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,    "up");
        me.input.bindKey(me.input.KEY.DOWN,  "down");

        me.state.change(me.state.PLAY);
    }
};

const GameDisplay = me.ScreenObject.extend({

    onDisplayReset: function() {
        me.levelDirector.loadLevel("zone1_map");
    },

    onDisplayDestroy: function() {
    }

});

const GamePawn = me.ObjectEntity.extend({
    configure: function(x, y, visualSetup) {
        this.parent(x, y, visualSetup);

        this.setMotionRate(2.5, 2.5);

        this.setDrag(0.2, 0.2);

        this.adjustCollisionBox(20,24, 44, 16);

        this.gravity = 0;

        this.initialTicksRemaining = 2;
        this.orientation = 'down';
        this.targetX = x;
        this.targetY = y;

        this.defineVisualSequence("stand-down", [0]);
        this.defineVisualSequence("stand-left", [7]);
        this.defineVisualSequence("stand-up", [14]);
        this.defineVisualSequence("stand-right", [21]);
        this.defineVisualSequence("down", [1,2,3,4,5,6]);
        this.defineVisualSequence("left", [8,9,10,11,12,13]);
        this.defineVisualSequence("up", [15,16,17,18,19,20]);
        this.defineVisualSequence("right", [22,23,24,25,26,27]);
    },

    advanceFrame: function() {
        let wasMoving = this.velocity.y !== 0 || this.velocity.x !== 0;

        this.processCommands();

        let stateChanged = this.updateMovement();

        if (this.velocity.y === 0 && this.velocity.x === 0)
        {
            this.setVisualState('stand-' + this.orientation)
            if (wasMoving) {
                stateChanged = true;
            }
        }

        if (stateChanged)
        {
            this.parent(this);
        }
        return stateChanged;
    },

    processCommands: function() {
        const movementLogic = [
            { condition: () => this.targetX < this.position.x - 10, action: () => { this.velocity.x -= this.acceleration.x * me.timer.tick; this.setVisualState('left'); this.orientation = 'left'; } },
            { condition: () => this.targetX > this.position.x + 10, action: () => { this.velocity.x += this.acceleration.x * me.timer.tick; this.setVisualState('right'); this.orientation = 'right'; } },
            { condition: () => this.targetY < this.position.y - 10, action: () => { this.velocity.y = -this.acceleration.y * me.timer.tick; this.setVisualState('up'); this.orientation = 'up'; } },
            { condition: () => this.targetY > this.position.y + 10, action: () => { this.velocity.y = this.acceleration.y * me.timer.tick; this.setVisualState('down'); this.orientation = 'down'; } }
        ];

        movementLogic.forEach(rule => {
            if (rule.condition()) {
                rule.action();
            }
        });
    }
});

const LocalHero = GamePawn.extend({

    configure: function(x, y, visualSetup) {
        this.parent(x, y, visualSetup);

        me.game.viewport.follow(this.position, me.game.viewport.AXIS.BOTH);

        globalFunctions.heroInitialized(this);
    },

    processCommands: function() {
        const keyCommandMap = {
            'left': { action: (entity) => { entity.velocity.x -= entity.acceleration.x * me.timer.tick; entity.setVisualState('left'); entity.orientation = 'left'; } },
            'right': { action: (entity) => { entity.velocity.x += entity.acceleration.x * me.timer.tick; entity.setVisualState('right'); entity.orientation = 'right'; } },
            'up': { action: (entity) => { entity.velocity.y = -entity.acceleration.y * me.timer.tick; entity.setVisualState('up'); entity.orientation = 'up'; } },
            'down': { action: (entity) => { entity.velocity.y = entity.acceleration.y * me.timer.tick; entity.setVisualState('down'); entity.orientation = 'down'; } }
        };

        Object.keys(keyCommandMap).forEach(keyAlias => {
            if (me.input.isKeyPressed(keyAlias)) {
                keyCommandMap[keyAlias].action(this);
            }
        });
    }
});

window.onReady(function() {
    applicationBootstrapper.initiate();
});