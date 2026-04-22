function WaveCrafter(circuitPlan, audCtx, finalDestination) {
    this.hasKeyInputs = false;
    this.audioContext = audCtx;

    if (!audCtx) {
        this.audioContext = new AudioContext();
    }

    if (!finalDestination) {
        this.finalDestination = this.audioContext.destination;
    }

    this.soundModules = {};

    function RetrieveModule(synthesizerInstance, componentName) {
        if (componentName === "output") {
            return synthesizerInstance.finalDestination;
        }

        let identifiers = componentName.split(".");
        if (identifiers.length === 1) {
            return synthesizerInstance.soundModules[identifiers[0]];
        }
        return synthesizerInstance.soundModules[identifiers[0]][identifiers[1]];
    }

    function LogicUnit() {
        this.parameters = [0, 0];
        this.outboundLinks = [];
        this.valueTransformer = function (inputA, inputB) {
            return 440 * Math.pow(2, (inputA + inputB - 69) / 12);
        };
        this.unitType = "logic";

        this.establishLink = function (destinationComponent, srcPort, destPort) {
            srcPort = srcPort ? 1 : 0;
            destPort = destPort ? 1 : 0;
            this.outboundLinks.push([destinationComponent, srcPort, destPort]);
        };

        this.updateValue = function (newValue, paramIndex) {
            this.parameters[paramIndex] = newValue;
            let computedResult = this.valueTransformer(this.parameters[0], this.parameters[1]);

            for (let loopCounter = 0; loopCounter < this.outboundLinks.length; ++loopCounter) {
                let currentLink = this.outboundLinks[loopCounter];
                if (currentLink[0].updateValue) {
                    currentLink[0].updateValue(computedResult, currentLink[2]);
                } else if (typeof (currentLink[0].currentValue) === "number") {
                    currentLink[0].currentValue = computedResult;
                } else {
                    currentLink[0] = computedResult;
                }
            }
        };
    }

    function NoteInput(domIdentifier) {
        this.outboundLinks = [];
        this.unitType = "keyboard";
        this.uiElement = document.getElementById(domIdentifier);

        this.uiElement.addEventListener("change", function (evt) {
            for (let linkCounter = this.outboundLinks.length - 1; linkCounter >= 0; --linkCounter) {
                let currentLink = this.outboundLinks[linkCounter];
                let eventValue = evt.midiNoteData[1 - currentLink[1]];
                if (currentLink[0].updateValue) {
                    currentLink[0].updateValue(eventValue, currentLink[2]);
                } else if (typeof (currentLink[0].currentValue) === "number") {
                    currentLink[0].currentValue = eventValue;
                } else {
                    currentLink[0] = eventValue;
                }
            }
        }.bind(this));

        this.establishLink = function (destinationComponent, srcPort, destPort) {
            srcPort = srcPort ? 1 : 0;
            destPort = destPort ? 1 : 0;
            this.outboundLinks.push([destinationComponent, srcPort, destPort]);
        };

        this.BeginProcessing = function () {

        };
    }

    function RotaryControl(domIdentifier) {
        this.outboundLinks = [];
        this.unitType = "rotary";
        this.uiElement = document.getElementById(domIdentifier);

        this.uiElement.addEventListener("change", function (evt) {
            for (let linkCounter = this.outboundLinks.length - 1; linkCounter >= 0; --linkCounter) {
                let currentLink = this.outboundLinks[linkCounter];
                if (currentLink[0].updateValue) {
                    currentLink[0].updateValue(evt.target.value, currentLink[2]);
                } else if (typeof (currentLink[0].currentValue) === "number") {
                    currentLink[0].currentValue = evt.target.value;
                } else {
                    currentLink[0] = evt.target.value;
                }
            }
        }.bind(this));

        this.establishLink = function (destinationComponent, srcPort, destPort) {
            srcPort = srcPort ? 1 : 0;
            destPort = destPort ? 1 : 0;
            this.outboundLinks.push([destinationComponent, srcPort, destPort]);
        };
    }

    this.ConfigureComponent = function (audioComponent, configurationOptions) {
        if (configurationOptions) {
            for (let optionKey in configurationOptions) {
                let optionValue = configurationOptions[optionKey];
                if (optionKey === "calculationFunction") {
                    audioComponent[optionKey] = eval("(function (inputA,inputB){return " + optionValue + "})");
                } else if (typeof (audioComponent[optionKey].currentValue) === "number") {
                    audioComponent[optionKey].currentValue = optionValue;
                } else {
                    audioComponent[optionKey] = optionValue;
                }
            }
        }
    };

    this.ActivateSystem = function () {
        for (let circuitItemIndex = 0; circuitItemIndex < circuitPlan.length; ++circuitItemIndex) {
            switch (circuitPlan[circuitItemIndex].componentNameString.slice(0, 3)) {
                case "key":
                    this.hasKeyInputs = true;
                    break;
            }
        }
        if (this.hasKeyInputs) {

        }
        for (let circuitItemIndex = 0; circuitItemIndex < circuitPlan.length; ++circuitItemIndex) {
            let componentDefinition = circuitPlan[circuitItemIndex];
            switch (componentDefinition.componentNameString.slice(0, 3)) {
                case "osc":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createOscillator(), componentDefinition.settings);
                    break;
                case "buf":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createBufferSource(), componentDefinition.settings);
                    break;
                case "str":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createMediaStreamSource(), componentDefinition.settings);
                    break;
                case "ele":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createMediaElementSource(), componentDefinition.settings);
                    break;
                case "gai":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createGain(), componentDefinition.settings);
                    break;
                case "fil":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createBiquadFilter(), componentDefinition.settings);
                    break;
                case "del":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createDelay(), componentDefinition.settings);
                    break;
                case "pan":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createPanner(), componentDefinition.settings);
                    break;
                case "com":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createDynamicsCompressor(), componentDefinition.settings);
                    break;
                case "sha":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createWaveShaper(), componentDefinition.settings);
                    break;
                case "con":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createConvolver(), componentDefinition.settings);
                    break;
                case "scr":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createScriptProcessor(2048, 2, 2), componentDefinition.settings);
                    break;
                case "ana":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createAnalyser(), componentDefinition.settings);
                    break;
                case "spl":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createChannelSplitter(), componentDefinition.settings);
                    break;
                case "mer":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = this.audioContext.createChannelMerger(), componentDefinition.settings);
                    break;
                case "fun":
                    this.ConfigureComponent(this.soundModules[componentDefinition.componentNameString] = new LogicUnit(), componentDefinition.settings);
                    break;
                case "key":
                    this.soundModules[componentDefinition.componentNameString] = new NoteInput(componentDefinition.componentNameString);
                    break;
                case "kno":
                    this.soundModules[componentDefinition.componentNameString] = new RotaryControl(componentDefinition.componentNameString);
                    break;
            }
        }
        for (let circuitItemIndex = 0; circuitItemIndex < circuitPlan.length; ++circuitItemIndex) {
            let componentDefinition = circuitPlan[circuitItemIndex];
            if (componentDefinition.outboundConnections) {
                for (let connIdx = componentDefinition.outboundConnections.length - 1; connIdx >= 0; --connIdx) {
                    let connectionDetail = componentDefinition.outboundConnections[connIdx];
                    let inputPort = 0;
                    let outputPort = 0;
                    if (connectionDetail.targetId) {
                        inputPort = connectionDetail.destPort;
                        outputPort = connectionDetail.srcPort;
                        inputPort = inputPort ? 1 : 0;
                        outputPort = outputPort ? 1 : 0;
                        connectionDetail = connectionDetail.targetId;
                    }
                    if (inputPort)
                        this.soundModules[componentDefinition.componentNameString].establishLink(RetrieveModule(this, connectionDetail), outputPort, inputPort);
                    else
                        this.soundModules[componentDefinition.componentNameString].establishLink(RetrieveModule(this, connectionDetail), outputPort);
                }
            }
        }
        for (let moduleName in this.soundModules) {
            if (this.soundModules[moduleName].BeginProcessing)
                this.soundModules[moduleName].BeginProcessing(0);
        }
    }.bind(this);
}