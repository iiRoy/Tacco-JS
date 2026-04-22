const convertByteToHex = (value) => {
    const hexString = value.toString(16).toUpperCase();
    return hexString.length === 1 ? '0' + hexString : hexString;
};

class UserInterfaceManager {
    #elementReferences;
    #controlStateDefinitions;
    #currentControlConfiguration;

    constructor(domElements) {
        this.#elementReferences = domElements;
        this.#controlStateDefinitions = {
            initialControls: {
                canCompile: true,
                runConfig: [false, 'Run'],
                canReset: false,
                canDump: false,
                canDecompile: false,
                debugOptions: [false, false]
            },
            compiledControls: {
                canCompile: false,
                runConfig: [true, 'Run'],
                canReset: true,
                canDump: true,
                canDecompile: true,
                debugOptions: [true, false]
            },
            activeExecutionControls: {
                canCompile: false,
                runConfig: [true, 'Stop'],
                canReset: true,
                canDump: false,
                canDecompile: false,
                debugOptions: [true, false]
            },
            debugActiveControls: {
                canCompile: false,
                canReset: true,
                canDump: true,
                canDecompile: true,
                debugOptions: [true, true]
            },
            debugFinishedControls: {
                canCompile: false,
                canReset: true,
                canDump: true,
                canDecompile: true,
                debugOptions: [true, false]
            }
        };
        this.#currentControlConfiguration = this.#controlStateDefinitions.initialControls;
    }

    #applyControlConfiguration(config) {
        this.#elementReferences.compileButton.disabled = !config.canCompile;
        if (config.runConfig) {
            this.#elementReferences.executeButton.disabled = !config.runConfig[0];
            this.#elementReferences.executeButton.value = config.runConfig[1];
        }
        this.#elementReferences.resetButton.disabled = !config.canReset;
        this.#elementReferences.hexDumpButton.disabled = !config.canDump;
        this.#elementReferences.disassembleButton.disabled = !config.canDecompile;
        this.#elementReferences.debugCheckbox.disabled = !config.debugOptions[0];
        this.#elementReferences.debugCheckbox.checked = config.debugOptions[1];
        this.#elementReferences.stepButton.disabled = !config.debugOptions[1];
        this.#elementReferences.gotoButton.disabled = !config.debugOptions[1];
        this.#currentControlConfiguration = config;
    }

    configureInitialState() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.initialControls);
    }

    activateExecution() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.activeExecutionControls);
    }

    pauseExecution() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.compiledControls);
    }

    activateDebugMode() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.debugActiveControls);
    }

    deactivateDebugMode() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.debugFinishedControls);
    }

    compilerSuccess() {
        this.#applyControlConfiguration(this.#controlStateDefinitions.compiledControls);
    }

    toggleMonitorDisplay() {
        const currentDisplay = this.#elementReferences.monitorPanel.style.display;
        this.#elementReferences.monitorPanel.style.display = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
    }

    displayInformation() {
        this.#elementReferences.messageAreaCode.innerHTML = this.#elementReferences.notesContent.innerHTML;
    }
}

class GraphicsRenderer {
    #renderContext;
    #canvasWidth;
    #canvasHeight;
    #pixelDimension;
    #gridColumns = 32;
    #gridRows = 32;
    #colorSpectrum = [
        "#000000", "#ffffff", "#880000", "#aaffee",
        "#cc44cc", "#00cc55", "#0000aa", "#eeee77",
        "#dd8855", "#664400", "#ff7777", "#333333",
        "#777777", "#aaff66", "#0088ff", "#bbbbbb"
    ];
    #dataLink; // Reference to DataStorage

    constructor(domElements, dataStorageRef) {
        this.#dataLink = dataStorageRef;
        const canvasElement = domElements.displayCanvas;
        this.#canvasWidth = canvasElement.width;
        this.#canvasHeight = canvasElement.height;
        this.#pixelDimension = this.#canvasWidth / this.#gridColumns;
        this.#renderContext = canvasElement.getContext('2d');
    }

    setupCanvas() {
        this.clearScreen();
    }

    clearScreen() {
        this.#renderContext.fillStyle = "black";
        this.#renderContext.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);
    }

    updateSinglePixel(address) {
        this.#renderContext.fillStyle = this.#colorSpectrum[this.#dataLink.retrieveByteValue(address) & 0x0f];
        const yCoord = Math.floor((address - 0x200) / 32);
        const xCoord = (address - 0x200) % 32;
        this.#renderContext.fillRect(xCoord * this.#pixelDimension, yCoord * this.#pixelDimension, this.#pixelDimension, this.#pixelDimension);
    }
}

class DataStorage {
    #byteContainer;
    #pixelUpdateTrigger = null;

    constructor() {
        this.#byteContainer = new Uint8Array(0x600);
    }

    setPixelUpdateTrigger(rendererRef) {
        this.#pixelUpdateTrigger = rendererRef;
    }

    writeMemoryByte(address, value) {
        this.#byteContainer[address] = value & 0xFF;
        if (this.#pixelUpdateTrigger && address >= 0x200 && address <= 0x5ff) {
            this.#pixelUpdateTrigger.updateSinglePixel(address);
        }
    }

    retrieveByteValue(address) {
        return this.#byteContainer[address];
    }

    retrieveWordValue(address) {
        return this.retrieveByteValue(address) + (this.retrieveByteValue(address + 1) << 8);
    }

    captureKeyboardInput(event) {
        const keyValue = event.which;
        this.writeMemoryByte(0xff, keyValue);
    }

    formatMemoryRegion(startingAddress, regionLength) {
        let outputHtml = '';
        let currentAddress;

        for (let idx = 0; idx < regionLength; idx++) {
            if ((idx & 15) === 0) {
                if (idx > 0) { outputHtml += "\n"; }
                currentAddress = (startingAddress + idx);
                outputHtml += convertByteToHex((currentAddress >> 8) & 0xff);
                outputHtml += convertByteToHex(currentAddress & 0xff);
                outputHtml += ": ";
            }
            outputHtml += convertByteToHex(this.retrieveByteValue(startingAddress + idx));
            outputHtml += " ";
        }
        return outputHtml;
    }
}

class CentralProcessingUnit {
    #accumulatorRegister;
    #indexRegisterX;
    #indexRegisterY;
    #statusFlagsRegister;
    #programCounterRegister;
    #stackPointerRegister;

    #isExecutionActive;
    #isDebugMode;
    #isMonitoringActive;
    #executionTimerId;

    #dataAccessUnit;
    #interfaceControlUnit;

    #opcodeHandlers;

    constructor(dataRef, uiRef) {
        this.#dataAccessUnit = dataRef;
        this.#interfaceControlUnit = uiRef;
        this.#opcodeHandlers = this.#constructInstructionSet();
    }

    resetProcessorState() {
        this.#accumulatorRegister = 0;
        this.#indexRegisterX = 0;
        this.#indexRegisterY = 0;
        this.#statusFlagsRegister = 0;
        this.#programCounterRegister = 0x600;
        this.#stackPointerRegister = 0xff;
        this.#isExecutionActive = false;
        this.#isDebugMode = false;
        this.deactivateDebugger();
        this.#interfaceControlUnit.pauseExecution();
        this.#dataAccessUnit.writeMemoryByte(0xff, 0);
    }

    startBinaryExecution() {
        if (!this.#isExecutionActive) {
            this.#isExecutionActive = true;
            this.#interfaceControlUnit.activateExecution();
            this.#executionTimerId = setInterval(() => this.#executeInstructionCycle(), 1);
        } else {
            this.haltExecution();
        }
    }

    haltExecution() {
        if (this.#isExecutionActive) {
            clearInterval(this.#executionTimerId);
            this.#isExecutionActive = false;
            this.#interfaceControlUnit.pauseExecution();
        }
    }

    activateDebugger() {
        this.#isDebugMode = true;
        this.haltExecution();
        this.#interfaceControlUnit.activateDebugMode();
    }

    deactivateDebugger() {
        this.#isDebugMode = false;
        this.#interfaceControlUnit.deactivateDebugMode();
    }

    executeDebuggerStep() {
        if (this.#isDebugMode) {
            this.#executeInstructionCycle();
        }
    }

    jumpToAddress() {
        const addressInput = prompt('Enter address (hex):');
        if (addressInput) {
            const newAddress = parseInt(addressInput, 16);
            if (!isNaN(newAddress) && newAddress >= 0 && newAddress <= 0xFFFF) {
                this.#programCounterRegister = newAddress;
            } else {
                alert('Invalid address.');
            }
        }
    }

    toggleMonitoringState() {
        this.#isMonitoringActive = !this.#isMonitoringActive;
    }

    #adjustZeroNegativeFlags(value) {
        if (value === 0) {
            this.#statusFlagsRegister |= 0x02;
        } else {
            this.#statusFlagsRegister &= ~0x02;
        }
        if ((value & 0x80) !== 0) {
            this.#statusFlagsRegister |= 0x80;
        } else {
            this.#statusFlagsRegister &= ~0x80;
        }
    }

    #setCarryFromBitZero(value) {
        this.#statusFlagsRegister = (this.#statusFlagsRegister & ~0x01) | (value & 0x01);
    }

    #setCarryFromBitSeven(value) {
        this.#statusFlagsRegister = (this.#statusFlagsRegister & ~0x01) | ((value >> 7) & 0x01);
    }

    #updateFlagsForAccumulator() {
        this.#adjustZeroNegativeFlags(this.#accumulatorRegister);
    }

    #updateFlagsForIndexX() {
        this.#adjustZeroNegativeFlags(this.#indexRegisterX);
    }

    #updateFlagsForIndexY() {
        this.#adjustZeroNegativeFlags(this.#indexRegisterY);
    }

    #clearCarryFlag() {
        this.#statusFlagsRegister &= ~0x01;
    }

    #setCarryFlag() {
        this.#statusFlagsRegister |= 0x01;
    }

    #clearOverflowFlag() {
        this.#statusFlagsRegister &= ~0x40;
    }

    #activateOverflowFlag() {
        this.#statusFlagsRegister |= 0x40;
    }

    #performRelativeBranch(offsetValue) {
        if ((offsetValue & 0x80) !== 0) {
            this.#programCounterRegister = (this.#programCounterRegister - (0x100 - offsetValue)) & 0xFFFF;
        } else {
            this.#programCounterRegister = (this.#programCounterRegister + offsetValue) & 0xFFFF;
        }
    }

    #isCarrySet() { return (this.#statusFlagsRegister & 0x01) !== 0; }
    #isZeroSet() { return (this.#statusFlagsRegister & 0x02) !== 0; }
    #isNegativeSet() { return (this.#statusFlagsRegister & 0x80) !== 0; }
    #isOverflowSet() { return (this.#statusFlagsRegister & 0x40) !== 0; }
    #isDecimalMode() { return (this.#statusFlagsRegister & 0x08) !== 0; }

    #performComparison(registerValue, operandValue) {
        if (registerValue >= operandValue) {
            this.#setCarryFlag();
        } else {
            this.#clearCarryFlag();
        }
        const result = (registerValue - operandValue) & 0xFF;
        this.#adjustZeroNegativeFlags(result);
    }

    #subtractWithCarryLogic(operandValue) {
        let tempVal, interimResult;

        if ((this.#accumulatorRegister ^ operandValue) & 0x80) {
            this.#activateOverflowFlag();
        } else {
            this.#clearOverflowFlag();
        }

        if (this.#isDecimalMode()) {
            tempVal = 0xf + (this.#accumulatorRegister & 0xf) - (operandValue & 0xf) + this.#isCarrySet();
            if (tempVal < 0x10) {
                interimResult = 0;
                tempVal -= 6;
            } else {
                interimResult = 0x10;
                tempVal -= 0x10;
            }
            interimResult += 0xf0 + (this.#accumulatorRegister & 0xf0) - (operandValue & 0xf0);
            if (interimResult < 0x100) {
                this.#clearCarryFlag();
                if (this.#isOverflowSet() && interimResult < 0x80) { this.#clearOverflowFlag(); }
                interimResult -= 0x60;
            } else {
                this.#setCarryFlag();
                if (this.#isOverflowSet() && interimResult >= 0x180) { this.#clearOverflowFlag(); }
            }
            interimResult += tempVal;
        } else {
            interimResult = 0xff + this.#accumulatorRegister - operandValue + this.#isCarrySet();
            if (interimResult < 0x100) {
                this.#clearCarryFlag();
                if (this.#isOverflowSet() && interimResult < 0x80) { this.#clearOverflowFlag(); }
            } else {
                this.#setCarryFlag();
                if (this.#isOverflowSet() && interimResult >= 0x180) { this.#clearOverflowFlag(); }
            }
        }
        this.#accumulatorRegister = interimResult & 0xff;
        this.#updateFlagsForAccumulator();
    }

    #addWithCarryLogic(operandValue) {
        let tempVal;
        if ((this.#accumulatorRegister ^ operandValue) & 0x80) {
            this.#clearOverflowFlag();
        } else {
            this.#activateOverflowFlag();
        }

        if (this.#isDecimalMode()) {
            tempVal = (this.#accumulatorRegister & 0xf) + (operandValue & 0xf) + this.#isCarrySet();
            if (tempVal >= 10) {
                tempVal = 0x10 | ((tempVal + 6) & 0xf);
            }
            tempVal += (this.#accumulatorRegister & 0xf0) + (operandValue & 0xf0);
            if (tempVal >= 160) {
                this.#setCarryFlag();
                if (this.#isOverflowSet() && tempVal >= 0x180) { this.#clearOverflowFlag(); }
                tempVal += 0x60;
            } else {
                this.#clearCarryFlag();
                if (this.#isOverflowSet() && tempVal < 0x80) { this.#clearOverflowFlag(); }
            }
        } else {
            tempVal = this.#accumulatorRegister + operandValue + this.#isCarrySet();
            if (tempVal >= 0x100) {
                this.#setCarryFlag();
                if (this.#isOverflowSet() && tempVal >= 0x180) { this.#clearOverflowFlag(); }
            } else {
                this.#clearCarryFlag();
                if (this.#isOverflowSet() && tempVal < 0x80) { this.#clearOverflowFlag(); }
            }
        }
        this.#accumulatorRegister = tempVal & 0xff;
        this.#updateFlagsForAccumulator();
    }

    #executeBRK_00() {
        this.#isExecutionActive = false;
    }

    #executeORA_IndirectX_01() {
        const zeroPageBase = (this.#dataAccessUnit.retrieveByteValue(this.#programCounterRegister++) + this.#indexRegisterX) & 0xFF;
        const indirectAddr = this.#dataAccessUnit.retrieveWordValue(zeroPageBase);
        this.#accumulatorRegister |= this.#dataAccessUnit.retrieveByteValue(indirectAddr);
        this.#updateFlagsForAccumulator();
    }

    #executeJSR_20() {
        const targetAddress = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
        this.#programCounterRegister += 2;
        const returnAddress = this.#programCounterRegister - 1;
        this.#dataAccessUnit.writeMemoryByte(0x0100 + this.#stackPointerRegister--, (returnAddress >> 8) & 0xFF);
        this.#dataAccessUnit.writeMemoryByte(0x0100 + this.#stackPointerRegister--, returnAddress & 0xFF);
        this.#programCounterRegister = targetAddress;
    }

    #executeBIT_Absolute_2C() {
        const address = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
        this.#programCounterRegister += 2;
        const memoryValue = this.#dataAccessUnit.retrieveByteValue(address);

        if ((memoryValue & 0x80) !== 0) {
            this.#statusFlagsRegister |= 0x80;
        } else {
            this.#statusFlagsRegister &= ~0x80;
        }
        if ((memoryValue & 0x40) !== 0) {
            this.#statusFlagsRegister |= 0x40;
        } else {
            this.#statusFlagsRegister &= ~0x40;
        }
        if ((this.#accumulatorRegister & memoryValue) === 0) {
            this.#statusFlagsRegister |= 0x02;
        } else {
            this.#statusFlagsRegister &= ~0x02;
        }
    }

    #executeJMP_Absolute_4C() {
        this.#programCounterRegister = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
    }

    #executeJMP_Indirect_6C() {
        const ptrAddress = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
        let actualAddress;
        if ((ptrAddress & 0x00FF) === 0x00FF) {
            actualAddress = (this.#dataAccessUnit.retrieveByteValue(ptrAddress & 0xFF00) << 8) | this.#dataAccessUnit.retrieveByteValue(ptrAddress);
        } else {
            actualAddress = this.#dataAccessUnit.retrieveWordValue(ptrAddress);
        }
        this.#programCounterRegister = actualAddress;
    }

    #executeSEC_38() { this.#setCarryFlag(); }
    #executeCLC_18() { this.#clearCarryFlag(); }
    #executeSEI_78() { this.#statusFlagsRegister |= 0x04; }
    #executeCLI_58() { this.#statusFlagsRegister &= ~0x04; }
    #executeCLV_B8() { this.#clearOverflowFlag(); }
    #executeSED_F8() { this.#statusFlagsRegister |= 0x08; }
    #executeCLD_D8() { this.#statusFlagsRegister &= ~0x08; }

    #executeSBC_Immediate_E9() {
        const operand = this.#dataAccessUnit.retrieveByteValue(this.#programCounterRegister++);
        this.#subtractWithCarryLogic(operand);
    }
    #executeADC_Immediate_69() {
        const operand = this.#dataAccessUnit.retrieveByteValue(this.#programCounterRegister++);
        this.#addWithCarryLogic(operand);
    }

    #executeINC_Absolute_EE() {
        const address = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
        this.#programCounterRegister += 2;
        let value = this.#dataAccessUnit.retrieveByteValue(address);
        value = (value + 1) & 0xFF;
        this.#dataAccessUnit.writeMemoryByte(address, value);
        this.#adjustZeroNegativeFlags(value);
    }

    #executeDEC_Absolute_CE() {
        const address = this.#dataAccessUnit.retrieveWordValue(this.#programCounterRegister);
        this.#programCounterRegister += 2;
        let value = this.#dataAccessUnit.retrieveByteValue(address);
        value = (value - 1) & 0xFF;
        this.#dataAccessUnit.writeMemoryByte(address, value);
        this.#adjustZeroNegativeFlags(value);
    }

    #executeInstructionCycle() {
        if (!this.#isExecutionActive && !this.#isDebugMode) {
            return;
        }

        const currentOpcode = this.#dataAccessUnit.retrieveByteValue(this.#programCounterRegister++);
        const handler = this.#opcodeHandlers.get(currentOpcode);

        if (handler) {
            handler();
        } else {
            console.warn(`Unknown opcode: ${convertByteToHex(currentOpcode)} at $${convertByteToHex(this.#programCounterRegister - 1)}`);
            this.haltExecution();
        }
    }

    #constructInstructionSet() {
        const handlers = new Map();

        handlers.set(0x00, this.#executeBRK_00.bind(this));
        handlers.set(0x01, this.#executeORA_IndirectX_01.bind(this));
        handlers.set(0x20, this.#executeJSR_20.bind(this));
        handlers.set(0x2C, this.#executeBIT_Absolute_2C.bind(this));
        handlers.set(0x4C, this.#executeJMP_Absolute_4C.bind(this));
        handlers.set(0x6C, this.#executeJMP_Indirect_6C.bind(this));
        handlers.set(0x38, this.#executeSEC_38.bind(this));
        handlers.set(0x18, this.#executeCLC_18.bind(this));
        handlers.set(0x78, this.#executeSEI_78.bind(this));
        handlers.set(0x58, this.#executeCLI_58.bind(this));
        handlers.set(0xB8, this.#executeCLV_B8.bind(this));
        handlers.set(0xF8, this.#executeSED_F8.bind(this));
        handlers.set(0xD8, this.#executeCLD_D8.bind(this));
        handlers.set(0xE9, this.#executeSBC_Immediate_E9.bind(this));
        handlers.set(0x69, this.#executeADC_Immediate_69.bind(this));
        handlers.set(0xEE, this.#executeINC_Absolute_EE.bind(this));
        handlers.set(0xCE, this.#executeDEC_Absolute_CE.bind(this));

        for (let i = 0; i < 256; i++) {
            if (!handlers.has(i)) {
                handlers.set(i, () => {
                    console.warn(`Unimplemented opcode: ${convertByteToHex(i)} at $${convertByteToHex(this.#programCounterRegister - 1)}`);
                    this.haltExecution();
                });
            }
        }

        return handlers;
    }
}

class CodeCompiler {
    #dataTargetUnit;
    #uiFeedbackUnit;
    #sourceEditorElement;

    constructor(dataRef, uiRef, domElements) {
        this.#dataTargetUnit = dataRef;
        this.#uiFeedbackUnit = uiRef;
        this.#sourceEditorElement = domElements.codeEditor;
    }

    processSourceCode() {
        console.log("Simulating assembly process...");
        this.#dataTargetUnit.writeMemoryByte(0x600, 0xA9);
        this.#dataTargetUnit.writeMemoryByte(0x601, 0x01);
        this.#dataTargetUnit.writeMemoryByte(0x602, 0xEA); // NOP
        this.#uiFeedbackUnit.compilerSuccess();
    }

    displayHexDump() {
        const dumpContent = this.#dataTargetUnit.formatMemoryRegion(0x0000, 0x0600);
        this.#uiFeedbackUnit.#elementReferences.messageAreaCode.textContent = dumpContent;
    }

    showDisassembly() {
        console.log("Simulating disassembly process...");
        this.#uiFeedbackUnit.#elementReferences.messageAreaCode.textContent = "Disassembly output simulated.";
    }
}

class ProcessorUnitHost {
    #hostElementRef;
    #domElementCache;

    #interfaceControl;
    #visualOutput;
    #dataStore;
    #coreProcessor;
    #codeCompiler;

    constructor(domElement) {
        this.#hostElementRef = domElement;
        this.#domElementCache = this.#gatherDOMReferences();

        this.#interfaceControl = new UserInterfaceManager(this.#domElementCache);
        this.#dataStore = new DataStorage();
        this.#visualOutput = new GraphicsRenderer(this.#domElementCache, this.#dataStore);
        this.#dataStore.setPixelUpdateTrigger(this.#visualOutput);

        this.#coreProcessor = new CentralProcessingUnit(this.#dataStore, this.#interfaceControl);
        this.#codeCompiler = new CodeCompiler(this.#dataStore, this.#interfaceControl, this.#domElementCache);

        this.#performInitialSetup();
    }

    #gatherDOMReferences() {
        const cache = {};
        cache.codeEditor = this.#hostElementRef.querySelector('.code');
        cache.assembleButton = this.#hostElementRef.querySelector('.assembleButton');
        cache.executeButton = this.#hostElementRef.querySelector('.runButton');
        cache.resetButton = this.#hostElementRef.querySelector('.resetButton');
        cache.hexDumpButton = this.#hostElementRef.querySelector('.hexdumpButton');
        cache.disassembleButton = this.#hostElementRef.querySelector('.disassembleButton');
        cache.debugCheckbox = this.#hostElementRef.querySelector('.debug');
        cache.monitorToggle = this.#hostElementRef.querySelector('.monitoring');
        cache.stepButton = this.#hostElementRef.querySelector('.stepButton');
        cache.gotoButton = this.#hostElementRef.querySelector('.gotoButton');
        cache.infoButton = this.#hostElementRef.querySelector('.notesButton');
        cache.monitorPanel = this.#hostElementRef.querySelector('.monitor');
        cache.messageAreaCode = this.#hostElementRef.querySelector('.messages code');
        cache.notesContent = this.#hostElementRef.querySelector('.notes');
        cache.displayCanvas = this.#hostElementRef.querySelector('.screen');
        return cache;
    }

    #performInitialSetup() {
        this.#cleanCodeInput();
        this.#interfaceControl.configureInitialState();
        this.#visualOutput.setupCanvas();
        this.#coreProcessor.resetProcessorState();
        this.#bindEventHandlers();
    }

    #cleanCodeInput() {
        let textContent = this.#domElementCache.codeEditor.value;
        textContent = textContent.replace(/^\n+/, '').replace(/\s+$/, '');
        this.#domElementCache.codeEditor.value = textContent;
    }

    #bindEventHandlers() {
        this.#domElementCache.assembleButton.addEventListener('click', () => this.#codeCompiler.processSourceCode());
        this.#domElementCache.executeButton.addEventListener('click', () => {
            this.#coreProcessor.startBinaryExecution();
            this.#coreProcessor.deactivateDebugger();
        });
        this.#domElementCache.resetButton.addEventListener('click', () => this.#coreProcessor.resetProcessorState());
        this.#domElementCache.hexDumpButton.addEventListener('click', () => this.#codeCompiler.displayHexDump());
        this.#domElementCache.disassembleButton.addEventListener('click', () => this.#codeCompiler.showDisassembly());
        this.#domElementCache.debugCheckbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            if (isChecked) {
                this.#interfaceControl.activateDebugMode();
                this.#coreProcessor.activateDebugger();
            } else {
                this.#interfaceControl.deactivateDebugMode();
                this.#coreProcessor.deactivateDebugger();
            }
        });
        this.#domElementCache.monitorToggle.addEventListener('change', () => {
            this.#interfaceControl.toggleMonitorDisplay();
            this.#coreProcessor.toggleMonitoringState();
        });
        this.#domElementCache.stepButton.addEventListener('click', () => this.#coreProcessor.executeDebuggerStep());
        this.#domElementCache.gotoButton.addEventListener('click', () => this.#coreProcessor.jumpToAddress());
        this.#domElementCache.infoButton.addEventListener('click', () => this.#interfaceControl.displayInformation());

        this.#domElementCache.codeEditor.addEventListener('keypress', () => {
            this.#coreProcessor.haltExecution();
            this.#interfaceControl.configureInitialState();
        });
        this.#domElementCache.codeEditor.addEventListener('input', () => {
            this.#coreProcessor.haltExecution();
            this.#interfaceControl.configureInitialState();
        });

        document.addEventListener('keypress', (event) => this.#dataStore.captureKeyboardInput(event));
    }
}