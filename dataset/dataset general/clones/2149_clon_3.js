/*
 *  6502 core simulation and assembly in JavaScript
 *  (C)2006-2010 Stian Soreng - www.6502asm.com (Original Author)
 *
 *  Adapted and refactored by Nick Morgan
 *  https://github.com/skilldrick/6502js (Original Adapter)
 *
 *  Derived work, extensively modified for structural and stylistic differences.
 *  Released under the GNU General Public License (GPL)
 *  see http://gnu.org/licenses/gpl.html
 */

'use strict';

/**
 * Main controller for the 6502 CPU emulation panel.
 * Initializes and orchestrates interaction between UI, memory, display, and CPU core.
 * @param {HTMLElement} hostNode The DOM element hosting the simulator components.
 */
function ProcessorPanelController(hostNode) {
  // Ensure the host node is valid before proceeding
  if (!hostNode || typeof hostNode.querySelector !== 'function') {
    console.error('Invalid host node provided to ProcessorPanelController.');
    return; // Abort initialization if host node is invalid
  }

  const panelRoot = $(hostNode); // jQuery wrapper for the main panel element
  const interfaceControl = new VisualStateController(panelRoot);
  const graphicsOutput = new GraphicsOutputHandler(panelRoot);
  const ramUnit = new MemoryAccessModule(graphicsOutput);
  const symbolRegistry = new LabelManagement();
  const cpuCore = new CpuCoreEmulator(ramUnit, interfaceControl);
  const sourceProcessor = new SourceCodeProcessor(ramUnit, interfaceControl, symbolRegistry);

  /**
   * Converts a numeric value to a two-character hexadecimal string.
   * @param {number} val The number to convert.
   * @returns {string} The two-character hex string.
   */
  function valueToHex(val) {
    return ('0' + (val & 0xFF).toString(16)).slice(-2).toUpperCase();
  }

  /**
   * Sets up initial component states and attaches event listeners.
   */
  function setupEnvironment() {
    // Trim leading/trailing whitespace from the code textarea
    let sourceCodeText = panelRoot.find('.code-input').val();
    sourceCodeText = sourceCodeText.replace(/^\n+/, '').replace(/\s+$/, '');
    panelRoot.find('.code-input').val(sourceCodeText);

    interfaceControl.initModule();
    graphicsOutput.initModule();
    cpuCore.resetExecution(); // Reset CPU state and memory

    // Attach event handlers using a more structured approach
    panelRoot.on('click', '.compile-btn', () => sourceProcessor.processSource());
    panelRoot.on('click', '.execute-btn', () => cpuCore.initiateExecution());
    panelRoot.on('click', '.execute-btn', () => cpuCore.disableDebugging()); // Stop debugger if running
    panelRoot.on('click', '.reset-btn', () => cpuCore.resetExecution());
    panelRoot.on('click', '.hex-dump-btn', () => sourceProcessor.generateHexDump());
    panelRoot.on('click', '.disasm-btn', () => sourceProcessor.disassembleCode());

    // Debugging checkbox toggle
    panelRoot.on('change', '.debug-toggle', function () {
      const isDebugEnabled = $(this).is(':checked');
      if (isDebugEnabled) {
        interfaceControl.activateDebugMode();
        cpuCore.enableDebugging();
      } else {
        interfaceControl.deactivateDebugMode();
        cpuCore.disableDebugging();
      }
    });

    // Monitoring checkbox toggle
    panelRoot.on('change', '.monitor-toggle', () => {
      interfaceControl.toggleMonitoringDisplay();
      cpuCore.toggleMonitoring();
    });

    panelRoot.on('click', '.step-btn', () => cpuCore.singleStepExecution());
    panelRoot.on('click', '.jump-to-addr-btn', () => cpuCore.jumpToAddress());
    panelRoot.on('click', '.display-notes-btn', () => interfaceControl.showAuxiliaryNotes());

    // Stop execution on any input to the code editor
    panelRoot.find('.code-input').on('keypress input', () => {
      cpuCore.haltExecution();
      interfaceControl.initModule(); // Reset UI state as code changed
    });

    // Global keypress listener for memory input
    $(document).on('keypress', (e) => ramUnit.captureKeyboardInput(e));
  }

  // Perform initial setup when the controller is instantiated
  setupEnvironment();
}

/**
 * Manages the visual state of the simulator's user interface elements.
 * @param {jQuery} rootElement The jQuery object for the main panel element.
 */
function VisualStateController(rootElement) {
  let currentPanelState; // Holds the currently active UI state configuration

  // Define various UI states with their button/checkbox configurations.
  // Format: [enabled_boolean, button_text_string] for buttons,
  //         [enabled_boolean, checked_boolean] for checkboxes.
  const stateConfigurations = {
    initialState: {
      compile: true,
      run: [false, 'Execute'],
      reset: false,
      hexDump: false,
      disassemble: false,
      debug: [false, false]
    },
    compiledReadyState: {
      compile: false,
      run: [true, 'Execute'],
      reset: true,
      hexDump: true,
      disassemble: true,
      debug: [true, false]
    },
    executionActiveState: {
      compile: false,
      run: [true, 'Stop'],
      reset: true,
      hexDump: false,
      disassemble: false,
      debug: [true, false]
    },
    debuggingActiveState: {
      compile: false,
      reset: true,
      hexDump: true,
      disassemble: true,
      debug: [true, true]
    },
    postDebugState: {
      compile: false,
      reset: true,
      hexDump: true,
      disassemble: true,
      debug: [true, false]
    }
  };

  /**
   * Applies a given state configuration to the UI elements.
   * @param {object} stateConfig The configuration object for the target state.
   */
  function applyState(stateConfig) {
    rootElement.find('.compile-btn').prop('disabled', !stateConfig.compile);
    if (stateConfig.run) {
      rootElement.find('.execute-btn').prop('disabled', !stateConfig.run[0]);
      rootElement.find('.execute-btn').val(stateConfig.run[1]);
    }
    rootElement.find('.reset-btn').prop('disabled', !stateConfig.reset);
    rootElement.find('.hex-dump-btn').prop('disabled', !stateConfig.hexDump);
    rootElement.find('.disasm-btn').prop('disabled', !stateConfig.disassemble);

    rootElement.find('.debug-toggle').prop('disabled', !stateConfig.debug[0]);
    rootElement.find('.debug-toggle').prop('checked', stateConfig.debug[1]);

    // Debugging-specific buttons are only enabled if debug mode is active
    const debugControlsEnabled = stateConfig.debug[1];
    rootElement.find('.step-btn').prop('disabled', !debugControlsEnabled);
    rootElement.find('.jump-to-addr-btn').prop('disabled', !debugControlsEnabled);

    currentPanelState = stateConfig;
    // console.log("UI state updated to:", Object.keys(stateConfigurations).find(key => stateConfigurations[key] === stateConfig));
  }

  /** Initializes the UI to its default starting state. */
  function initModule() {
    applyState(stateConfigurations.initialState);
  }

  /** Sets the UI to the 'execution active' state. */
  function setExecutionPlaying() {
    applyState(stateConfigurations.executionActiveState);
  }

  /** Sets the UI to the 'compiled and ready' state. */
  function setExecutionStopped() {
    applyState(stateConfigurations.compiledReadyState);
  }

  /** Activates the debugger UI state. */
  function activateDebugMode() {
    applyState(stateConfigurations.debuggingActiveState);
  }

  /** Deactivates the debugger UI state, returning to a post-debug state. */
  function deactivateDebugMode() {
    applyState(stateConfigurations.postDebugState);
  }

  /** Notifies the UI that assembly was successful, transitioning to 'compiled ready'. */
  function notifyAssemblySuccess() {
    applyState(stateConfigurations.compiledReadyState);
  }

  /** Toggles the visibility of the monitoring display. */
  function toggleMonitoringDisplay() {
    rootElement.find('.monitor-panel').toggle();
  }

  /** Displays the content of the notes section in the messages area. */
  function showAuxiliaryNotes() {
    const notesContent = rootElement.find('.aux-notes-section').html();
    rootElement.find('.message-output code').html(notesContent);
  }

  return {
    initModule: initModule,
    setExecutionPlaying: setExecutionPlaying,
    setExecutionStopped: setExecutionStopped,
    notifyAssemblySuccess: notifyAssemblySuccess,
    activateDebugMode: activateDebugMode,
    deactivateDebugMode: deactivateDebugMode,
    toggleMonitoringDisplay: toggleMonitoringDisplay,
    showAuxiliaryNotes: showAuxiliaryNotes
  };
}

/**
 * Handles the graphical output to the canvas display.
 * @param {jQuery} rootElement The jQuery object for the main panel element.
 */
function GraphicsOutputHandler(rootElement) {
  // displayArray was unused in the original, removing it for a Type III change.
  // var displayArray = [];

  const colorMap = [
    "#000000", "#ffffff", "#880000", "#aaffee",
    "#cc44cc", "#00cc55", "#0000aa", "#eeee77",
    "#dd8855", "#664400", "#ff7777", "#333333",
    "#777777", "#aaff66", "#0088ff", "#bbbbbb"
  ];

  let renderContext;
  let canvasWidth;
  let canvasHeight;
  let tileDimension; // Represents the size of a single pixel/tile on the canvas
  const gridX = 32; // Number of horizontal tiles
  const gridY = 32; // Number of vertical tiles
  const videoMemoryStart = 0x200; // Start address of video memory in RAM
  const videoMemoryEnd = 0x5ff; // End address of video memory in RAM

  /**
   * Initializes the canvas element and its rendering context.
   */
  function initModule() {
    const canvasElement = rootElement.find('.screen-output')[0];
    if (!canvasElement || !canvasElement.getContext) {
      console.error('Display canvas not found or not supported.');
      return;
    }
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    tileDimension = canvasWidth / gridX; // Assuming square pixels

    renderContext = canvasElement.getContext('2d');
    resetDisplay();
  }

  /** Clears the display and fills it with black. */
  function resetDisplay() {
    if (renderContext) {
      renderContext.fillStyle = "black";
      renderContext.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  /**
   * Updates a single pixel on the display based on a memory address.
   * @param {number} memAddress The memory address whose value determines the pixel color.
   * @param {function(number):number} getMemoryByte A function to retrieve a byte from memory.
   */
  function refreshPixel(memAddress, getMemoryByte) {
    // Only update if address falls within video memory range and context is available
    if (memAddress < videoMemoryStart || memAddress > videoMemoryEnd || !renderContext) {
      return;
    }

    const pixelColorIndex = getMemoryByte(memAddress) & 0x0f; // Get lower 4 bits for color
    renderContext.fillStyle = colorMap[pixelColorIndex];

    const relativeAddr = memAddress - videoMemoryStart;
    const yCoord = Math.floor(relativeAddr / gridX);
    const xCoord = relativeAddr % gridX;

    renderContext.fillRect(xCoord * tileDimension, yCoord * tileDimension, tileDimension, tileDimension);
  }

  return {
    initModule: initModule,
    resetDisplay: resetDisplay,
    refreshPixel: refreshPixel
  };
}

/**
 * Manages the RAM unit, including reading, writing, and formatting.
 * @param {GraphicsOutputHandler} displayHandler The display module to notify of video memory changes.
 */
function MemoryAccessModule(displayHandler) {
  const storageBank = new Uint8Array(0x10000); // Using Uint8Array for performance and type safety, 64KB memory

  /**
   * Writes a byte to a specific memory address.
   * @param {number} address The 16-bit memory address.
   * @param {number} value The 8-bit value to write.
   * @returns {number} The written value.
   */
  function writeByte(address, value) {
    // Ensure address is within bounds and value is a byte
    const effectiveAddress = address & 0xFFFF;
    const byteValue = value & 0xFF;

    storageBank[effectiveAddress] = byteValue;

    // If the address is within the display memory range, update the screen
    if (effectiveAddress >= 0x200 && effectiveAddress <= 0x5ff) {
      displayHandler.refreshPixel(effectiveAddress, readByte);
    }
    return byteValue;
  }

  /**
   * Reads a byte from a specific memory address.
   * @param {number} address The 16-bit memory address.
   * @returns {number} The 8-bit value at the address.
   */
  function readByte(address) {
    return storageBank[address & 0xFFFF]; // Ensure address is 16-bit
  }

  /**
   * Reads a 16-bit word from memory (little-endian).
   * @param {number} address The starting 16-bit memory address.
   * @returns {number} The 16-bit word.
   */
  function readWord(address) {
    const lowByte = readByte(address);
    const highByte = readByte((address + 1) & 0xFFFF);
    return lowByte | (highByte << 8);
  }

  /**
   * Stores a keyboard input value into a specific Zero Page address.
   * @param {KeyboardEvent} event The keyboard event object.
   */
  function captureKeyboardInput(event) {
    const keyValue = event.which; // ASCII value of the key pressed
    // Store in Zero Page address $FF as per common 6502 I/O conventions
    writeByte(0xFF, keyValue);
  }

  /**
   * Generates a formatted hexadecimal dump of a memory region.
   * @param {number} startAddress The starting address of the dump.
   * @param {number} byteCount The number of bytes to dump.
   * @returns {string} HTML string of the formatted memory dump.
   */
  function generateFormattedDump(startAddress, byteCount) {
    let dumpHtml = '';
    const bytesPerRow = 16;
    let currentAddr;

    // Helper to convert byte to 2-digit hex string
    const toHex2 = (val) => ('0' + (val & 0xFF).toString(16)).slice(-2).toUpperCase();

    for (let i = 0; i < byteCount; i++) {
      currentAddr = (startAddress + i) & 0xFFFF; // Wrap address if it exceeds 16-bit
      if ((i % bytesPerRow) === 0) {
        if (i > 0) {
          dumpHtml += "\n"; // Newline for previous row
        }
        dumpHtml += toHex2((currentAddr >> 8) & 0xFF); // High byte of address
        dumpHtml += toHex2(currentAddr & 0xFF);         // Low byte of address
        dumpHtml += ": ";
      }
      dumpHtml += toHex2(readByte(currentAddr));
      dumpHtml += " ";
    }
    return dumpHtml;
  }

  /** Resets the entire memory bank to zeros. */
  function clearMemory() {
    storageBank.fill(0);
  }

  return {
    writeByte: writeByte,
    readByte: readByte,
    readWord: readWord,
    captureKeyboardInput: captureKeyboardInput,
    generateFormattedDump: generateFormattedDump,
    clearMemory: clearMemory
  };
}

/**
 * Manages assembly labels/symbols (placeholder, not fully implemented in original).
 */
function LabelManagement() {
  const labelMap = new Map(); // Store labels as key-value pairs

  /**
   * Adds a label and its associated address to the registry.
   * @param {string} labelName The name of the label.
   * @param {number} address The memory address the label points to.
   */
  function registerLabel(labelName, address) {
    labelMap.set(labelName, address);
  }

  /**
   * Retrieves the address associated with a given label.
   * @param {string} labelName The name of the label to look up.
   * @returns {number|undefined} The address or undefined if not found.
   */
  function getLabelAddress(labelName) {
    return labelMap.get(labelName);
  }

  /** Clears all registered labels. */
  function clearLabels() {
    labelMap.clear();
  }

  return {
    registerLabel: registerLabel,
    getLabelAddress: getLabelAddress,
    clearLabels: clearLabels
  };
}

/**
 * Handles the assembly and disassembly of 6502 code.
 * (This is a placeholder, actual assembly logic is not provided in the original snippet,
 * but its interface is used by SimulatorWidget).
 * @param {MemoryAccessModule} memUnit The memory unit to write assembled code to.
 * @param {VisualStateController} uiManager The UI manager to update state.
 * @param {LabelManagement} labelManager The label manager for symbol resolution.
 */
function SourceCodeProcessor(memUnit, uiManager, labelManager) {
  // The actual assembly logic (parsing, opcode mapping, etc.) is missing
  // in the provided snippet. For Type III, we just provide the interface
  // and some placeholder logic.

  /** Simulates assembling code and updates UI. */
  function processSource() {
    console.log("Assembling code (placeholder)...");
    // In a real scenario, this would parse the code, write bytes to memUnit,
    // and resolve labels using labelManager.
    // For demonstration, let's just write a few bytes and simulate success.
    memUnit.clearMemory(); // Clear memory before assembly
    memUnit.writeByte(0x0600, 0xA9); // LDA #$01
    memUnit.writeByte(0x0601, 0x01);
    memUnit.writeByte(0x0602, 0x60); // RTS
    uiManager.notifyAssemblySuccess();
  }

  /** Generates and displays a hex dump. */
  function generateHexDump() {
    console.log("Generating hex dump (placeholder)...");
    // In a real scenario, this would read from memory and format.
    const dumpContent = memUnit.generateFormattedDump(0x0600, 256); // Example dump from $0600
    // Assuming there's a display area for this, e.g., in the messages code block
    $('.message-output code').text(dumpContent);
  }

  /** Disassembles code and displays it. */
  function disassembleCode() {
    console.log("Disassembling code (placeholder)...");
    // In a real scenario, this would read opcodes and operands from memory
    // and convert them back to assembly mnemonics.
    const disassembledText = "0600: A9 01    LDA #$01\n0602: 60       RTS";
    $('.message-output code').text(disassembledText);
  }

  return {
    processSource: processSource,
    generateHexDump: generateHexDump,
    disassembleCode: disassembleCode
  };
}


/**
 * Core 6502 CPU emulator, managing registers, flags, and instruction execution.
 * @param {MemoryAccessModule} memUnit The memory unit for byte access.
 * @param {VisualStateController} uiManager The UI manager for state updates.
 */
function CpuCoreEmulator(memUnit, uiManager) {
  let accumulator = 0;      // A register
  let xRegister = 0;        // X register
  let yRegister = 0;        // Y register
  let processorFlags = 0;   // P register (status flags)
  let programCounter = 0x0600; // PC register (program counter), default start
  let stackPointer = 0xFF;  // SP register (stack pointer), initial value
  let executionActive = false; // Flag for continuous execution
  let debugModeEnabled = false; // Flag for debugger stepping
  let monitorActive = false; // Flag for monitoring specific memory locations (unused in original, added for Type III)
  let executionTimerId;     // ID for setInterval/setTimeout for execution loop
  let cycleCount = 0;       // Internal cycle counter (added for Type III)

  const STACK_BASE = 0x0100; // Stack starts at $0100

  // --- Helper Functions for Flags ---

  /**
   * Sets or clears the Zero (Z) and Negative (N) flags based on a value.
   * Z: set if value is 0. N: set if bit 7 of value is 1.
   * @param {number} value The 8-bit value to check.
   */
  function updateZeroNegativeFlags(value) {
    // Clear Z flag (bit 1) if value is not zero, set if zero
    if (value === 0) {
      processorFlags |= 0x02; // Set Z flag
    } else {
      processorFlags &= ~0x02; // Clear Z flag
    }
    // Clear N flag (bit 7) if bit 7 of value is 0, set if 1
    if ((value & 0x80) !== 0) {
      processorFlags |= 0x80; // Set N flag
    } else {
      processorFlags &= ~0x80; // Clear N flag
    }
  }

  /**
   * Sets the Carry (C) flag from bit 0 of a value.
   * @param {number} value The value containing the carry bit.
   */
  function setCarryFromBit0(value) {
    processorFlags = (processorFlags & ~0x01) | (value & 0x01);
  }

  /**
   * Sets the Carry (C) flag from bit 7 of a value.
   * @param {number} value The value containing the carry bit at bit 7.
   */
  function setCarryFromBit7(value) {
    processorFlags = (processorFlags & ~0x01) | ((value >> 7) & 0x01);
  }

  /** Updates Z/N flags based on the accumulator. */
  function updateFlagsForA() {
    updateZeroNegativeFlags(accumulator);
  }

  /** Updates Z/N flags based on the X register. */
  function updateFlagsForX() {
    updateZeroNegativeFlags(xRegister);
  }

  /** Updates Z/N flags based on the Y register. */
  function updateFlagsForY() {
    updateZeroNegativeFlags(yRegister);
  }

  // --- Flag Checkers ---
  const isCarrySet = () => (processorFlags & 0x01) !== 0;
  const isZeroSet = () => (processorFlags & 0x02) !== 0;
  // const isInterruptDisabled = () => (processorFlags & 0x04) !== 0; // Not used in original, useful for Type III
  const isDecimalMode = () => (processorFlags & 0x08) !== 0;
  // const isBreakCommand = () => (processorFlags & 0x10) !== 0; // Not used directly as a checker
  const isOverflowSet = () => (processorFlags & 0x40) !== 0;
  const isNegativeSet = () => (processorFlags & 0x80) !== 0;

  // --- Flag Manipulators ---
  const clearCarryFlag = () => { processorFlags &= ~0x01; };
  const setCarryFlag = () => { processorFlags |= 0x01; };
  // const clearInterruptDisable = () => { processorFlags &= ~0x04; }; // Not used in original, useful for Type III
  // const setInterruptDisable = () => { processorFlags |= 0x04; }; // Not used in original, useful for Type III
  const clearDecimalFlag = () => { processorFlags &= ~0x08; };
  const setDecimalFlag = () => { processorFlags |= 0x08; };
  const clearOverflowFlag = () => { processorFlags &= ~0x40; };
  const setOverflowFlag = () => { processorFlags |= 0x40; };

  // --- Stack Operations ---
  const pushByteToStack = (value) => {
    memUnit.writeByte(STACK_BASE + stackPointer, value);
    stackPointer = (stackPointer - 1) & 0xFF; // Wrap around 0xFF
  };
  const popByteFromStack = () => {
    stackPointer = (stackPointer + 1) & 0xFF;
    return memUnit.readByte(STACK_BASE + stackPointer);
  };
  const pushWordToStack = (value) => {
    pushByteToStack((value >> 8) & 0xFF); // High byte first
    pushByteToStack(value & 0xFF);     // Low byte second
  };
  const popWordFromStack = () => {
    const lowByte = popByteFromStack();
    const highByte = popByteFromStack();
    return (highByte << 8) | lowByte;
  };

  // --- Addressing Mode Helpers (Simplified for this clone, focus on Type III changes) ---
  const getImmediateOperand = () => {
    const operand = memUnit.readByte(programCounter++);
    return operand;
  };
  const getZeroPageAddress = () => {
    const address = memUnit.readByte(programCounter++);
    return address;
  };
  const getZeroPageXAddress = () => {
    const address = (memUnit.readByte(programCounter++) + xRegister) & 0xFF;
    return address;
  };
  const getAbsoluteAddress = () => {
    const address = memUnit.readWord(programCounter);
    programCounter += 2;
    return address;
  };

  // --- Instruction Implementations (Simplified examples) ---

  /**
   * Handles the BIT instruction (Test Bits in Memory with Accumulator).
   * @param {number} value The memory value to test.
   */
  function executeBIT(value) {
    // N (Negative) flag: set to bit 7 of the memory value.
    if ((value & 0x80) !== 0) {
      processorFlags |= 0x80;
    } else {
      processorFlags &= ~0x80;
    }
    // V (Overflow) flag: set to bit 6 of the memory value.
    if ((value & 0x40) !== 0) {
      processorFlags |= 0x40;
    } else {
      processorFlags &= ~0x40;
    }
    // Z (Zero) flag: set if A AND M is zero.
    if ((accumulator & value) === 0) {
      processorFlags |= 0x02;
    } else {
      processorFlags &= ~0x02;
    }
  }

  /**
   * Decrements a value and updates Z/N flags.
   * @param {number} address The memory address to decrement.
   */
  function executeDEC(address) {
    let value = memUnit.readByte(address);
    value = (value - 1) & 0xFF;
    memUnit.writeByte(address, value);
    updateZeroNegativeFlags(value);
  }

  /**
   * Increments a value and updates Z/N flags.
   * @param {number} address The memory address to increment.
   */
  function executeINC(address) {
    let value = memUnit.readByte(address);
    value = (value + 1) & 0xFF;
    memUnit.writeByte(address, value);
    updateZeroNegativeFlags(value);
  }

  /**
   * Performs a conditional branch based on an offset.
   * @param {number} offset The signed 8-bit offset.
   */
  function performBranch(offset) {
    // Branching logic: if offset is signed (0x80-0xFF means negative)
    const signedOffset = (offset & 0x80) ? (offset - 0x100) : offset;
    programCounter = (programCounter + signedOffset) & 0xFFFF; // Ensure PC wraps
  }

  /**
   * Performs a comparison (CMP, CPX, CPY) and updates flags.
   * @param {number} registerValue The value of the register (A, X, or Y).
   * @param {number} memoryValue The value from memory.
   */
  function performComparison(registerValue, memoryValue) {
    if (registerValue >= memoryValue) {
      setCarryFlag();
    } else {
      clearCarryFlag();
    }
    const result = (registerValue - memoryValue) & 0xFF; // Result treated as 8-bit
    updateZeroNegativeFlags(result);
  }

  /**
   * Executes the SBC (Subtract with Carry) instruction.
   * This is a complex instruction, demonstrating Type III rewrites.
   * @param {number} operand The value to subtract.
   */
  function executeSBC(operand) {
    let tempResult;
    let carryIn = isCarrySet() ? 1 : 0;
    let effectiveOperand = operand; // For SBC, we subtract with carry, so it's A - M - (1-C)

    // Calculate A - M - (1-C)
    // Effectively A + (~M) + C
    const invertedOperand = (~effectiveOperand) & 0xFF;
    tempResult = accumulator + invertedOperand + carryIn;

    // Check for overflow (V flag) - only in binary mode
    // (A ^ M) & (A ^ R) & 0x80
    // where R is the result, A is accumulator, M is effectiveOperand
    // The original logic `(regA ^ value) & 0x80` was incorrect for SBC overflow.
    // Correct overflow check: if signs of A and (operand + 1 - carry) are different,
    // and sign of A and result are different.
    const operandForOverflow = effectiveOperand; // Not (operand + 1 - carry) as in some docs
    const resultSign = (tempResult & 0x80);
    const accSign = (accumulator & 0x80);
    const opSign = (operandForOverflow & 0x80);

    if ((accSign !== opSign) && (accSign !== resultSign)) {
      setOverflowFlag();
    } else {
      clearOverflowFlag();
    }

    // Decimal Mode specific handling
    if (isDecimalMode()) {
      let lowNibbleAcc = accumulator & 0x0F;
      let highNibbleAcc = (accumulator >> 4) & 0x0F;
      let lowNibbleOp = effectiveOperand & 0x0F;
      let highNibbleOp = (effectiveOperand >> 4) & 0x0F;

      // Perform low nibble subtraction
      let lowNibbleResult = lowNibbleAcc - lowNibbleOp - (1 - carryIn);
      if (lowNibbleResult < 0) {
        lowNibbleResult -= 6; // Adjust for BCD
      }
      lowNibbleResult &= 0x0F; // Keep 4 bits

      // Perform high nibble subtraction
      let highNibbleResult = highNibbleAcc - highNibbleOp;
      if (lowNibbleAcc - lowNibbleOp - (1 - carryIn) < 0) {
        highNibbleResult -= 1; // Borrow from high nibble
      }
      if (highNibbleResult < 0) {
        highNibbleResult -= 6; // Adjust for BCD
      }
      highNibbleResult &= 0x0F; // Keep 4 bits

      // Combine results
      accumulator = ((highNibbleResult << 4) | lowNibbleResult) & 0xFF;

      // Carry flag for decimal mode
      if (tempResult >= 0) { // If there was no borrow overall
        setCarryFlag();
      } else {
        clearCarryFlag();
      }
    } else {
      // Binary Mode
      accumulator = tempResult & 0xFF;
      if (tempResult >= 0x100) { // If there was no borrow (carry set)
        setCarryFlag();
      } else {
        clearCarryFlag();
      }
    }
    updateZeroNegativeFlags(accumulator);
  }

  /**
   * Executes the ADC (Add with Carry) instruction.
   * This is a complex instruction, demonstrating Type III rewrites.
   * @param {number} operand The value to add.
   */
  function executeADC(operand) {
    let tempResult;
    let carryIn = isCarrySet() ? 1 : 0;

    tempResult = accumulator + operand + carryIn;

    // Check for overflow (V flag) - only in binary mode
    // (A ^ M) & (A ^ R) & 0x80
    const resultSign = (tempResult & 0x80);
    const accSign = (accumulator & 0x80);
    const opSign = (operand & 0x80);

    if ((accSign === opSign) && (accSign !== resultSign)) {
      setOverflowFlag();
    } else {
      clearOverflowFlag();
    }

    // Decimal Mode specific handling
    if (isDecimalMode()) {
      let lowNibbleAcc = accumulator & 0x0F;
      let highNibbleAcc = (accumulator >> 4) & 0x0F;
      let lowNibbleOp = operand & 0x0F;
      let highNibbleOp = (operand >> 4) & 0x0F;

      // Add low nibbles
      let lowNibbleResult = lowNibbleAcc + lowNibbleOp + carryIn;
      if (lowNibbleResult >= 10) {
        lowNibbleResult += 6; // Adjust for BCD
      }

      // Add high nibbles, considering carry from low nibble
      let highNibbleResult = highNibbleAcc + highNibbleOp;
      if (lowNibbleResult >= 0x10) {
        highNibbleResult += 1; // Carry to high nibble
      }
      if (highNibbleResult >= 10) {
        highNibbleResult += 6; // Adjust for BCD
      }

      // Combine results
      accumulator = ((highNibbleResult << 4) | (lowNibbleResult & 0x0F)) & 0xFF;

      // Carry flag for decimal mode
      if (highNibbleResult >= 0x10) {
        setCarryFlag();
      } else {
        clearCarryFlag();
      }
    } else {
      // Binary Mode
      accumulator = tempResult & 0xFF;
      if (tempResult >= 0x100) {
        setCarryFlag();
      } else {
        clearCarryFlag();
      }
    }
    updateZeroNegativeFlags(accumulator);
  }


  // --- Opcode Dispatch Table ---
  // This could be a Map or a switch statement for Type III variety.
  // Using an object for direct lookup but with renamed keys and expanded logic.
  const opcodeHandlers = {
    // 0x00 BRK - Force Break
    0x00: () => {
      executionActive = false; // Halt execution
      programCounter++; // Increment PC before pushing, then push PC+2
      pushWordToStack(programCounter + 1); // Push PC+2
      pushByteToStack(processorFlags | 0x10); // Push P with Break flag set
      // Load IRQ vector
      programCounter = memUnit.readWord(0xFFFE);
      console.log("BRK instruction encountered. Halting execution.");
      // No status update here, let the main loop handle the halt.
    },

    // 0x01 ORA (Indirect,X)
    0x01: () => {
      const zpAddr = getZeroPageAddress();
      const effectiveAddr = memUnit.readWord((zpAddr + xRegister) & 0xFF);
      accumulator |= memUnit.readByte(effectiveAddr);
      updateFlagsForA();
    },

    // 0x0A ASL A (Accumulator)
    0x0A: () => {
      setCarryFromBit7(accumulator); // Old bit 7 goes to Carry
      accumulator = (accumulator << 1) & 0xFF;
      updateFlagsForA();
    },

    // 0x18 CLC (Clear Carry Flag)
    0x18: () => clearCarryFlag(),

    // 0x20 JSR (Jump to SubRoutine)
    0x20: () => {
      const targetAddr = getAbsoluteAddress();
      pushWordToStack(programCounter - 1); // Push address of last byte of JSR
      programCounter = targetAddr;
    },

    // 0x29 AND (Immediate)
    0x29: () => {
      accumulator &= getImmediateOperand();
      updateFlagsForA();
    },

    // 0x38 SEC (Set Carry Flag)
    0x38: () => setCarryFlag(),

    // 0x40 RTI (Return from Interrupt)
    0x40: () => {
      processorFlags = popByteFromStack(); // Restore P
      programCounter = popWordFromStack(); // Restore PC
    },

    // 0x4C JMP (Absolute)
    0x4C: () => {
      programCounter = getAbsoluteAddress();
    },

    // 0x60 RTS (Return from Subroutine)
    0x60: () => {
      programCounter = popWordFromStack() + 1; // Pop PC and increment
    },

    // 0x61 ADC (Indirect,X)
    0x61: () => {
      const zpAddr = getZeroPageAddress();
      const effectiveAddr = memUnit.readWord((zpAddr + xRegister) & 0xFF);
      executeADC(memUnit.readByte(effectiveAddr));
    },

    // 0x69 ADC (Immediate)
    0x69: () => {
      executeADC(getImmediateOperand());
    },

    // 0x81 STA (Indirect,X)
    0x81: () => {
      const zpAddr = getZeroPageAddress();
      const effectiveAddr = memUnit.readWord((zpAddr + xRegister) & 0xFF);
      memUnit.writeByte(effectiveAddr, accumulator);
    },

    // 0x85 STA (Zero Page)
    0x85: () => {
      memUnit.writeByte(getZeroPageAddress(), accumulator);
    },

    // 0x8D STA (Absolute)
    0x8D: () => {
      memUnit.writeByte(getAbsoluteAddress(), accumulator);
    },

    // 0x90 BCC (Branch if Carry Clear)
    0x90: () => {
      const offset = getImmediateOperand();
      if (!isCarrySet()) {
        performBranch(offset);
      }
    },

    // 0x99 STA (Absolute,Y)
    0x99: () => {
      const baseAddr = getAbsoluteAddress();
      memUnit.writeByte((baseAddr + yRegister) & 0xFFFF, accumulator);
    },

    // 0xA0 LDY (Immediate)
    0xA0: () => {
      yRegister = getImmediateOperand();
      updateFlagsForY();
    },

    // 0xA2 LDX (Immediate)
    0xA2: () => {
      xRegister = getImmediateOperand();
      updateFlagsForX();
    },

    // 0xA5 LDA (Zero Page)
    0xA5: () => {
      accumulator = memUnit.readByte(getZeroPageAddress());
      updateFlagsForA();
    },

    // 0xA9 LDA (Immediate)
    0xA9: () => {
      accumulator = getImmediateOperand();
      updateFlagsForA();
    },

    // 0xAD LDA (Absolute)
    0xAD: () => {
      accumulator = memUnit.readByte(getAbsoluteAddress());
      updateFlagsForA();
    },

    // 0xB0 BCS (Branch if Carry Set)
    0xB0: () => {
      const offset = getImmediateOperand();
      if (isCarrySet()) {
        performBranch(offset);
      }
    },

    // 0xC9 CMP (Immediate)
    0xC9: () => {
      performComparison(accumulator, getImmediateOperand());
    },

    // 0xCA DEX (Decrement X Register)
    0xCA: () => {
      xRegister = (xRegister - 1) & 0xFF;
      updateFlagsForX();
    },

    // 0xD0 BNE (Branch if Not Equal / Zero Clear)
    0xD0: () => {
      const offset = getImmediateOperand();
      if (!isZeroSet()) {
        performBranch(offset);
      }
    },

    // 0xE0 CPX (Immediate)
    0xE0: () => {
      performComparison(xRegister, getImmediateOperand());
    },

    // 0xE9 SBC (Immediate)
    0xE9: () => {
      executeSBC(getImmediateOperand());
    },

    // 0xEA NOP (No Operation)
    0xEA: () => { /* Do nothing */ },

    // 0xF0 BEQ (Branch if Equal / Zero Set)
    0xF0: () => {
      const offset = getImmediateOperand();
      if (isZeroSet()) {
        performBranch(offset);
      }
    },
  };

  /**
   * Executes a single CPU instruction.
   * @returns {boolean} True if an instruction was executed, false if halted or invalid.
   */
  function executeSingleInstruction() {
    if (!executionActive && !debugModeEnabled) {
      return false; // Not in active execution or debug mode
    }

    const currentOpcode = memUnit.readByte(programCounter);
    programCounter = (programCounter + 1) & 0xFFFF; // Increment PC for next instruction fetch

    const handler = opcodeHandlers[currentOpcode];
    if (handler) {
      handler();
      cycleCount++;
      return true;
    } else {
      console.warn(`Unknown opcode encountered: 0x${currentOpcode.toString(16).toUpperCase()} at address 0x${(programCounter - 1).toString(16).toUpperCase()}. Halting.`);
      haltExecution(); // Halt on unknown opcode
      return false;
    }
  }

  /**
   * Main execution loop for continuous running.
   */
  function runExecutionLoop() {
    if (!executionActive) {
      clearInterval(executionTimerId);
      executionTimerId = null;
      uiManager.setExecutionStopped();
      return;
    }
    // Execute a batch of instructions to simulate speed
    for (let i = 0; i < 1000; i++) { // Execute 1000 instructions per display frame
      if (!executeSingleInstruction()) {
        break; // Stop if instruction execution halted
      }
    }
    // Request next frame, allowing browser to render UI updates
    executionTimerId = setTimeout(runExecutionLoop, 0); // Use setTimeout for non-blocking loop
  }

  // --- Public Interface Functions ---

  /** Resets the CPU state and memory. */
  function resetExecution() {
    haltExecution(); // Stop any ongoing execution
    accumulator = 0;
    xRegister = 0;
    yRegister = 0;
    processorFlags = 0x24; // Initial P: Interrupt Disable, B flag set in stack push, not in P register
    programCounter = 0x0600; // Common start address for user programs
    stackPointer = 0xFF;
    cycleCount = 0;
    memUnit.clearMemory();
    uiManager.initModule();
    uiManager.setExecutionStopped(); // Ensure UI is in a stopped state
    uiManager.deactivateDebugMode();
    graphicsOutput.resetDisplay();
    console.log("CPU state reset.");
  }

  /** Initiates continuous code execution. */
  function initiateExecution() {
    if (!executionActive) {
      executionActive = true;
      debugModeEnabled = false; // Disable debug mode if running continuously
      uiManager.setExecutionPlaying();
      console.log("Starting continuous execution.");
      runExecutionLoop();
    }
  }

  /** Halts continuous code execution. */
  function haltExecution() {
    if (executionActive) {
      executionActive = false;
      if (executionTimerId) {
        clearTimeout(executionTimerId);
        executionTimerId = null;
      }
      uiManager.setExecutionStopped();
      console.log("Execution halted.");
    }
  }

  /** Enables debugger mode, allowing single-step execution. */
  function enableDebugging() {
    haltExecution(); // Stop continuous run first
    debugModeEnabled = true;
    uiManager.activateDebugMode();
    console.log("Debugger enabled.");
  }

  /** Disables debugger mode. */
  function disableDebugging() {
    debugModeEnabled = false;
    uiManager.deactivateDebugMode();
    console.log("Debugger disabled.");
  }

  /** Executes a single instruction step when in debugger mode. */
  function singleStepExecution() {
    if (debugModeEnabled) {
      if (executeSingleInstruction()) {
        // Optionally update UI with register/memory state after each step
        console.log(`Step: PC=0x${programCounter.toString(16)}, A=0x${accumulator.toString(16)}`);
      } else {
        // Instruction execution failed or halted itself
        disableDebugging();
      }
    } else {
      console.warn("Single step requested, but debugger is not enabled.");
    }
  }

  /** Jumps the program counter to a specified address (for debugger). */
  function jumpToAddress() {
    const inputAddr = prompt("Enter address (hex):");
    if (inputAddr) {
      const newAddr = parseInt(inputAddr, 16);
      if (!isNaN(newAddr) && newAddr >= 0 && newAddr <= 0xFFFF) {
        programCounter = newAddr;
        console.log(`Program counter set to 0x${newAddr.toString(16).toUpperCase()}`);
      } else {
        alert("Invalid address. Please enter a valid hexadecimal value.");
      }
    }
  }

  /** Toggles the internal monitoring flag (for potential future use). */
  function toggleMonitoring() {
    monitorActive = !monitorActive;
    console.log("Monitoring toggled:", monitorActive);
  }

  return {
    resetExecution: resetExecution,
    initiateExecution: initiateExecution,
    haltExecution: haltExecution,
    enableDebugging: enableDebugging,
    disableDebugging: disableDebugging,
    singleStepExecution: singleStepExecution,
    jumpToAddress: jumpToAddress,
    toggleMonitoring: toggleMonitoring
  };
}