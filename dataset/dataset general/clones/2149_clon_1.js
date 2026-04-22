//
// This JavaScript file contains the core logic for a 6502 assembler and simulator.
//
// Original work by Stian Soreng (C)2006-2010, available at www.6502asm.com.
// Further adaptations and enhancements by Nick Morgan, hosted at https://github.com/skilldrick/6502js.
//
// This software is distributed under the terms of the GNU General Public License.
// For full license details, please refer to http://gnu.org/licenses/gpl.html.
//
// A Type I clone implies only changes to whitespace and comments.
// No functional changes are made.
//

'use strict'; // Enforces strict mode for cleaner code and fewer errors.


function SimulatorWidget(node) { // Main wrapper function for the simulator UI.

  var $node = $(node); // jQuery wrapper for the main DOM element.

  var ui = UI(); // User Interface component.
  var display = Display(); // Screen display component.
  var memory = Memory(); // Memory management component.
  var labels = Labels(); // Label management component (not shown in provided code, but referenced).
  var simulator = Simulator(); // Core 6502 CPU simulator.
  var assembler = Assembler(); // Assembly code to binary converter.


  /**
   * Initializes the simulator widget, setting up UI elements and event handlers.
   * This function is called once when the widget is loaded.
   */
  function initialize() {

    stripText(); // Clean up initial text in the code area.

    ui.initialize(); // Initialize the user interface state.
    display.initialize(); // Prepare the display canvas.
    simulator.reset(); // Reset the simulator's internal state.

    // Set up event listeners for various buttons and UI elements.

    $node.find('.assembleButton').click(
      function() {
        assembler.assembleCode(); // Trigger assembly process.
      }
    );

    $node.find('.runButton').click(simulator.runBinary); // Start program execution.
    $node.find('.runButton').click(simulator.stopDebugger); // Ensure debugger is off when running normally.
    $node.find('.resetButton').click(simulator.reset); // Reset the entire simulation.
    $node.find('.hexdumpButton').click(assembler.hexdump); // Generate and display a hexadecimal memory dump.
    $node.find('.disassembleButton').click(assembler.disassemble); // Disassemble the loaded binary.

    $node.find('.debug').change( // Handle changes to the debug checkbox.
      function() {
        var debug = $(this).is(':checked'); // Check if the debug mode is activated.
        if (debug) { // Debug mode is ON.
          ui.debugOn(); // Update UI for debug mode.
          simulator.enableDebugger(); // Activate simulator debugger.
        } else { // Debug mode is OFF.
          ui.debugOff(); // Update UI for normal mode.
          simulator.stopDebugger(); // Deactivate simulator debugger.
        }
      }
    );

    $node.find('.monitoring').change( // Handle changes to the monitoring checkbox.
      function() {
        ui.toggleMonitor(); // Toggle UI monitor display.
        simulator.toggleMonitor(); // Toggle simulator's monitoring state.
      }
    );

    $node.find('.stepButton').click(simulator.debugExec); // Execute a single step in debug mode.
    $node.find('.gotoButton').click(simulator.gotoAddr); // Jump to a specific address in debug mode.
    $node.find('.notesButton').click(ui.showNotes); // Display notes or messages.

    $node.find('.code').on('keypress input', simulator.stop); // Stop simulation on code input.
    $node.find('.code').on('keypress input', ui.initialize); // Re-initialize UI on code input.

    $(document).keypress(memory.storeKeypress); // Global keypress handler for memory input.
  }


  /**
   * Cleans up leading and trailing whitespace from the code textarea.
   */
  function stripText() { // Method to normalize the text input.
    // Remove leading and trailing newline/space characters from the textarea content.
    var text = $node.find('.code').val(); // Get current text value.
    text = text.replace(/^\n+/, '').replace(/\s+$/, ''); // Perform replacements.
    $node.find('.code').val(text); // Set the cleaned text back.
  }


  /**
   * Manages the user interface state and element interactions.
   * @returns {object} Public interface for UI functions.
   */
  function UI() {

    var currentState; // Holds the current state of the UI buttons.

    // Define various UI states for different operational modes.

    var start = { // Initial state when the application loads.
      assemble: true, // Assemble button is enabled.
      run: [false, 'Run'], // Run button is disabled, text 'Run'.
      reset: false, // Reset button is disabled.
      hexdump: false, // Hexdump button disabled.
      disassemble: false, // Disassemble button disabled.
      debug: [false, false] // Debug checkbox disabled and unchecked.
    };

    var assembled = { // State after successful assembly.
      assemble: false, // Assemble button disabled.
      run: [true, 'Run'], // Run button enabled.
      reset: true, // Reset button enabled.
      hexdump: true, // Hexdump enabled.
      disassemble: true, // Disassemble enabled.
      debug: [true, false] // Debug checkbox enabled but unchecked.
    };

    var running = { // State when the simulator is actively running code.
      assemble: false, // Assemble disabled.
      run: [true, 'Stop'], // Run button enabled, text changed to 'Stop'.
      reset: true, // Reset enabled.
      hexdump: false, // Hexdump disabled.
      disassemble: false, // Disassemble disabled.
      debug: [true, false] // Debug checkbox enabled but unchecked.
    };

    var debugging = { // State when the debugger is active.
      assemble: false, // Assemble disabled.
      reset: true, // Reset enabled.
      hexdump: true, // Hexdump enabled.
      disassemble: true, // Disassemble enabled.
      debug: [true, true] // Debug checkbox enabled and checked.
    };

    var postDebugging = { // State after debugging session has ended.
      assemble: false, // Assemble disabled.
      reset: true, // Reset enabled.
      hexdump: true, // Hexdump enabled.
      disassemble: true, // Disassemble enabled.
      debug: [true, false] // Debug checkbox enabled but unchecked.
    };


    /**
     * Applies a given state configuration to the UI elements.
     * @param {object} state - The state object to apply.
     */
    function setState(state) {
      $node.find('.assembleButton').attr('disabled', !state.assemble); // Update assemble button.
      if (state.run) { // Check if run button state is defined.
        $node.find('.runButton').attr('disabled', !state.run[0]); // Update run button enabled state.
        $node.find('.runButton').val(state.run[1]); // Update run button text.
      }
      $node.find('.resetButton').attr('disabled', !state.reset); // Update reset button.
      $node.find('.hexdumpButton').attr('disabled', !state.hexdump); // Update hexdump button.
      $node.find('.disassembleButton').attr('disabled', !state.disassemble); // Update disassemble button.
      $node.find('.debug').attr('disabled', !state.debug[0]); // Update debug checkbox enabled state.
      $node.find('.debug').attr('checked', state.debug[1]); // Update debug checkbox checked state.
      $node.find('.stepButton').attr('disabled', !state.debug[1]); // Update step button based on debug checked state.
      $node.find('.gotoButton').attr('disabled', !state.debug[1]); // Update goto button based on debug checked state.
      currentState = state; // Store the currently active state.
    }


    /**
     * Initializes the UI to its default 'start' state.
     */
    function initialize() {
      setState(start); // Apply the initial UI state.
    }


    /**
     * Sets the UI to the 'running' state.
     */
    function play() {
      setState(running); // Switch to running UI state.
    }


    /**
     * Sets the UI to the 'assembled' state, typically after stopping execution.
     */
    function stop() {
      setState(assembled); // Switch to assembled UI state.
    }


    /**
     * Sets the UI to the 'debugging' state.
     */
    function debugOn() {
      setState(debugging); // Switch to debugging UI state.
    }


    /**
     * Sets the UI to the 'postDebugging' state.
     */
    function debugOff() {
      setState(postDebugging); // Switch to post-debugging UI state.
    }


    /**
     * Sets the UI to the 'assembled' state upon successful assembly.
     */
    function assembleSuccess() {
      setState(assembled); // Switch to assembled UI state after successful assembly.
    }


    /**
     * Toggles the visibility of the monitoring panel.
     */
    function toggleMonitor() {
      $node.find('.monitor').toggle(); // Show or hide the monitor element.
    }


    /**
     * Displays predefined notes in the messages area.
     */
    function showNotes() {
      $node.find('.messages code').html($node.find('.notes').html()); // Copy notes content to messages.
    }


    return { // Public API for the UI component.
      initialize: initialize, // Initialize UI.
      play: play, // Set UI to play state.
      stop: stop, // Set UI to stop state.
      assembleSuccess: assembleSuccess, // Set UI after successful assembly.
      debugOn: debugOn, // Set UI for debug mode on.
      debugOff: debugOff, // Set UI for debug mode off.
      toggleMonitor: toggleMonitor, // Toggle monitor visibility.
      showNotes: showNotes // Display notes.
    };
  }


  /**
   * Manages the graphical display (canvas) for the simulator.
   * @returns {object} Public interface for Display functions.
   */
  function Display() {

    var displayArray = []; // Placeholder for display pixel data (not used in provided code).

    var palette = [ // 16-color palette for the display.
      "#000000", "#ffffff", "#880000", "#aaffee", // 0-3
      "#cc44cc", "#00cc55", "#0000aa", "#eeee77", // 4-7
      "#dd8855", "#664400", "#ff7777", "#333333", // 8-11
      "#777777", "#aaff66", "#0088ff", "#bbbbbb" // 12-15
    ];

    var ctx; // 2D rendering context of the canvas.
    var width; // Width of the canvas.
    var height; // Height of the canvas.
    var pixelSize; // Size of a single simulated pixel.
    var numX = 32; // Number of pixels horizontally.
    var numY = 32; // Number of pixels vertically.


    /**
     * Initializes the canvas and drawing context.
     */
    function initialize() {
      var canvas = $node.find('.screen')[0]; // Get the canvas DOM element.
      width = canvas.width; // Store canvas width.
      height = canvas.height; // Store canvas height.
      pixelSize = width / numX; // Calculate individual pixel size.
      ctx = canvas.getContext('2d'); // Get 2D drawing context.
      reset(); // Clear the canvas.
    }


    /**
     * Resets the display, filling it with black.
     */
    function reset() {
      ctx.fillStyle = "black"; // Set fill color to black.
      ctx.fillRect(0, 0, width, height); // Fill the entire canvas.
    }


    /**
     * Updates a single pixel on the display based on memory address content.
     * @param {number} addr - The memory address corresponding to the pixel.
     */
    function updatePixel(addr) {
      ctx.fillStyle = palette[memory.get(addr) & 0x0f]; // Get color from palette based on lower 4 bits of memory value.
      var y = Math.floor((addr - 0x200) / 32); // Calculate Y coordinate.
      var x = (addr - 0x200) % 32; // Calculate X coordinate.
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize); // Draw the pixel.
    }


    return { // Public API for the Display component.
      initialize: initialize, // Initialize display.
      reset: reset, // Reset display.
      updatePixel: updatePixel // Update a specific pixel.
    };
  }


  /**
   * Manages the simulated 6502 memory.
   * @returns {object} Public interface for Memory functions.
   */
  function Memory() {

    // Initialize memory array with a size of 0x600 bytes.
    var memArray = new Array(0x600);


    /**
     * Sets a byte value at a specific memory address.
     * @param {number} addr - The memory address.
     * @param {number} val - The byte value to set.
     * @returns {number} The value that was set.
     */
    function set(addr, val) {
      return memArray[addr] = val; // Assign value and return it.
    }


    /**
     * Gets a byte value from a specific memory address.
     * @param {number} addr - The memory address.
     * @returns {number} The byte value at the address.
     */
    function get(addr) {
      return memArray[addr]; // Retrieve value from memory.
    }


    /**
     * Gets a 16-bit word from two consecutive memory addresses (little-endian).
     * @param {number} addr - The starting memory address.
     * @returns {number} The 16-bit word.
     */
    function getWord(addr) {
      return get(addr) + (get(addr + 1) << 8); // Combine two bytes into a word.
    }


    /**
     * Stores a byte in memory and updates the display if it's in the screen memory region.
     * @param {number} addr - The memory address.
     * @param {number} value - The byte value to store.
     */
    function storeByte(addr, value) { // Poke a byte, without affecting registers.
      set(addr, value & 0xff); // Store the byte, ensuring it's 8-bit.
      if ((addr >= 0x200) && (addr <= 0x5ff)) { // Check if address is within screen memory range.
        display.updatePixel(addr); // Update the corresponding pixel on screen.
      }
    }


    /**
     * Event handler for keypresses, stores the keycode in ZP $ff.
     * @param {Event} e - The keypress event object.
     */
    function storeKeypress(e) { // Store keycode into ZP $ff for emulation.
      var value = e.which; // Get the ASCII value of the pressed key.
      memory.storeByte(0xff, value); // Store it in zero page address $ff.
    }


    /**
     * Formats a section of memory into a hexadecimal string.
     * @param {number} start - The starting address.
     * @param {number} length - The number of bytes to format.
     * @returns {string} The formatted hexadecimal string.
     */
    function format(start, length) {
      var html = ''; // Initialize an empty string for the output.
      var n; // Temporary variable for address calculation.

      for (var x = 0; x < length; x++) { // Loop through the specified memory range.
        if ((x & 15) === 0) { // Every 16 bytes, start a new line and show address.
          if (x > 0) {
            html += "\n";
          } // Add newline if not the very first line.
          n = (start + x); // Calculate current memory address.
          html += num2hex(((n >> 8) & 0xff)); // Add high byte of address.
          html += num2hex((n & 0xff)); // Add low byte of address.
          html += ": "; // Separator.
        }
        html += num2hex(memory.get(start + x)); // Add the hex value of the byte.
        html += " "; // Space separator.
      }
      return html; // Return the complete formatted string.
    }


    return { // Public API for the Memory component.
      set: set, // Set a byte in memory.
      get: get, // Get a byte from memory.
      getWord: getWord, // Get a word from memory.
      storeByte: storeByte, // Store a byte and potentially update display.
      storeKeypress: storeKeypress, // Handle keypress events.
      format: format // Format memory into a hex string.
    };
  }


  /**
   * Core 6502 CPU simulator logic.
   * @returns {object} Public interface for Simulator functions.
   */
  function Simulator() {

    // 6502 CPU Registers.
    var regA = 0; // Accumulator.
    var regX = 0; // Index Register X.
    var regY = 0; // Index Register Y.
    var regP = 0; // Processor Status Register (flags).
    var regPC = 0x600; // Program Counter, initialized to $0600.
    var regSP = 0xff; // Stack Pointer, initialized to $01FF (relative to $0100).

    var codeRunning = false; // Flag to indicate if code is currently executing.
    var debug = false; // Flag for debug mode.
    var monitoring = false; // Flag for monitoring (e.g., memory updates).
    var executeId; // ID for setTimeout/setInterval, used for stopping execution.


    /**
     * Sets or clears the Zero (Z) and Negative (N) processor flags based on a value.
     * @param {number} value - The value to check for Z and N flags.
     */
    function setNVflags(value) {
      if (value) { // If value is non-zero, clear Z flag.
        regP &= 0xfd; // Clear bit 1 (Z flag).
      } else { // If value is zero, set Z flag.
        regP |= 0x02; // Set bit 1 (Z flag).
      }
      if (value & 0x80) { // If bit 7 is set, set N flag.
        regP |= 0x80; // Set bit 7 (N flag).
      } else { // If bit 7 is clear, clear N flag.
        regP &= 0x7f; // Clear bit 7 (N flag).
      }
    }


    /**
     * Sets the Carry (C) flag based on the LSB (bit 0) of a value.
     * @param {number} value - The value whose LSB determines the C flag.
     */
    function setCarryFlagFromBit0(value) {
      regP = (regP & 0xfe) | (value & 1); // Clear C flag, then set it if bit 0 is 1.
    }


    /**
     * Sets the Carry (C) flag based on the MSB (bit 7) of a value.
     * @param {number} value - The value whose MSB determines the C flag.
     */
    function setCarryFlagFromBit7(value) {
      regP = (regP & 0xfe) | ((value >> 7) & 1); // Clear C flag, then set it if bit 7 is 1.
    }


    /**
     * Sets the Zero and Negative flags based on the Accumulator (regA).
     */
    function setNVflagsForRegA() {
      setNVflags(regA); // Apply Z/N logic to regA.
    }


    /**
     * Sets the Zero and Negative flags based on Index Register X (regX).
     */
    function setNVflagsForRegX() {
      setNVflags(regX); // Apply Z/N logic to regX.
    }


    /**
     * Sets the Zero and Negative flags based on Index Register Y (regY).
     */
    function setNVflagsForRegY() {
      setNVflags(regY); // Apply Z/N logic to regY.
    }


    // Aliases for common flag setting operations.
    var ORA = setNVflagsForRegA; // Logical OR Accumulator.
    var AND = setNVflagsForRegA; // Logical AND Accumulator.
    var EOR = setNVflagsForRegA; // Exclusive OR Accumulator.
    var ASL = setNVflags; // Arithmetic Shift Left.
    var LSR = setNVflags; // Logical Shift Right.
    var ROL = setNVflags; // Rotate Left.
    var ROR = setNVflags; // Rotate Right.
    var LDA = setNVflagsForRegA; // Load Accumulator.
    var LDX = setNVflagsForRegX; // Load Index X.
    var LDY = setNVflagsForRegY; // Load Index Y.


    /**
     * Implements the BIT instruction, setting N, V, and Z flags.
     * @param {number} value - The memory value to test.
     */
    function BIT(value) {
      if (value & 0x80) { // Check bit 7 of value for N flag.
        regP |= 0x80; // Set N flag.
      } else {
        regP &= 0x7f; // Clear N flag.
      }
      if (value & 0x40) { // Check bit 6 of value for V flag.
        regP |= 0x40; // Set V flag.
      } else {
        regP &= ~0x40; // Clear V flag.
      }
      if (regA & value) { // Check result of A AND value for Z flag.
        regP &= 0xfd; // Clear Z flag if result is non-zero.
      } else {
        regP |= 0x02; // Set Z flag if result is zero.
      }
    }


    /**
     * Clears the Carry (C) flag.
     */
    function CLC() {
      regP &= 0xfe; // Clear bit 0 (C flag).
    }


    /**
     * Sets the Carry (C) flag.
     */
    function SEC() {
      regP |= 1; // Set bit 0 (C flag).
    }


    /**
     * Clears the Overflow (V) flag.
     */
    function CLV() {
      regP &= 0xbf; // Clear bit 6 (V flag).
    }


    /**
     * Sets the Overflow (V) flag.
     */
    function setOverflow() {
      regP |= 0x40; // Set bit 6 (V flag).
    }


    /**
     * Decrements a byte in memory and updates Z/N flags.
     * @param {number} addr - The memory address to decrement.
     */
    function DEC(addr) {
      var value = memory.get(addr); // Get current value.
      value--; // Decrement.
      value &= 0xff; // Wrap around (0 becomes 255).
      memory.storeByte(addr, value); // Store new value.
      setNVflags(value); // Update Z/N flags.
    }


    /**
     * Increments a byte in memory and updates Z/N flags.
     * @param {number} addr - The memory address to increment.
     */
    function INC(addr) {
      var value = memory.get(addr); // Get current value.
      value++; // Increment.
      value &= 0xff; // Wrap around (255 becomes 0).
      memory.storeByte(addr, value); // Store new value.
      setNVflags(value); // Update Z/N flags.
    }


    /**
     * Performs a relative jump for branch instructions.
     * @param {number} offset - The signed 8-bit offset.
     */
    function jumpBranch(offset) {
      if (offset > 0x7f) { // If offset is negative (MSB set).
        regPC = (regPC - (0x100 - offset)); // Subtract the two's complement.
      } else { // If offset is positive.
        regPC = (regPC + offset); // Add directly.
      }
    }


    /**
     * Checks if the Overflow (V) flag is set.
     * @returns {boolean} True if V flag is set, false otherwise.
     */
    function overflowSet() {
      return regP & 0x40; // Check bit 6.
    }


    /**
     * Checks if Decimal Mode (D) flag is set.
     * @returns {boolean} True if D flag is set, false otherwise.
     */
    function decimalMode() {
      return regP & 8; // Check bit 3.
    }


    /**
     * Checks if Carry (C) flag is set.
     * @returns {boolean} True if C flag is set, false otherwise.
     */
    function carrySet() {
      return regP & 1; // Check bit 0.
    }


    /**
     * Checks if Negative (N) flag is set.
     * @returns {boolean} True if N flag is set, false otherwise.
     */
    function negativeSet() {
      return regP & 0x80; // Check bit 7.
    }


    /**
     * Checks if Zero (Z) flag is set.
     * @returns {boolean} True if Z flag is set, false otherwise.
     */
    function zeroSet() {
      return regP & 0x02; // Check bit 1.
    }


    /**
     * Performs a comparison operation (CMP, CPX, CPY).
     * @param {number} reg - The register value (A, X, or Y).
     * @param {number} val - The value to compare against.
     */
    function doCompare(reg, val) {
      if (reg >= val) { // If register value is greater than or equal, set Carry.
        SEC(); // Set C flag.
      } else {
        CLC(); // Clear C flag.
      }
      val = (reg - val); // Calculate difference for Z/N flags.
      setNVflags(val); // Update Z/N flags based on difference.
    }


    /**
     * Simulates the Subtract with Carry (SBC) instruction.
     * @param {number} value - The value to subtract.
     */
    function testSBC(value) {
      var tmp, w; // Temporary variables.
      if ((regA ^ value) & 0x80) { // Check for sign bit difference (potential overflow).
        setOverflow(); // Set V flag.
      } else {
        CLV(); // Clear V flag.
      }

      if (decimalMode()) { // Handle BCD arithmetic if decimal mode is enabled.
        tmp = 0xf + (regA & 0xf) - (value & 0xf) + carrySet(); // Calculate low nibble.
        if (tmp < 0x10) { // If no borrow from high nibble.
          w = 0;
          tmp -= 6; // Adjust for BCD.
        } else { // Borrow from high nibble.
          w = 0x10;
          tmp -= 0x10; // Adjust for BCD.
        }
        w += 0xf0 + (regA & 0xf0) - (value & 0xf0); // Calculate high nibble.
        if (w < 0x100) { // If no borrow from C flag.
          CLC(); // Clear C flag.
          if (overflowSet() && w < 0x80) {
            CLV();
          } // Adjust V flag.
          w -= 0x60; // Adjust for BCD.
        } else { // Borrow from C flag.
          SEC(); // Set C flag.
          if (overflowSet() && w >= 0x180) {
            CLV();
          } // Adjust V flag.
        }
        w += tmp; // Combine nibbles.
      } else { // Standard binary arithmetic.
        w = 0xff + regA - value + carrySet(); // Calculate result (including carry).
        if (w < 0x100) { // If no carry/borrow.
          CLC(); // Clear C flag.
          if (overflowSet() && w < 0x80) {
            CLV();
          } // Adjust V flag.
        } else { // If carry/borrow.
          SEC(); // Set C flag.
          if (overflowSet() && w >= 0x180) {
            CLV();
          } // Adjust V flag.
        }
      }
      regA = w & 0xff; // Store result in accumulator, masked to 8 bits.
      setNVflagsForRegA(); // Update Z/N flags based on regA.
    }


    /**
     * Simulates the Add with Carry (ADC) instruction.
     * @param {number} value - The value to add.
     */
    function testADC(value) {
      var tmp; // Temporary variable.
      if ((regA ^ value) & 0x80) { // Check for sign bit difference (potential overflow).
        CLV(); // Clear V flag.
      } else {
        setOverflow(); // Set V flag.
      }

      if (decimalMode()) { // Handle BCD arithmetic if decimal mode is enabled.
        tmp = (regA & 0xf) + (value & 0xf) + carrySet(); // Add low nibbles.
        if (tmp >= 10) { // If decimal carry from low nibble.
          tmp = 0x10 | ((tmp + 6) & 0xf); // Adjust for BCD.
        }
        tmp += (regA & 0xf0) + (value & 0xf0); // Add high nibbles.
        if (tmp >= 160) { // If decimal carry from high nibble.
          SEC(); // Set C flag.
          if (overflowSet() && tmp >= 0x180) {
            CLV();
          } // Adjust V flag.
          tmp += 0x60; // Adjust for BCD.
        } else { // No decimal carry from high nibble.
          CLC(); // Clear C flag.
          if (overflowSet() && tmp < 0x80) {
            CLV();
          } // Adjust V flag.
        }
      } else { // Standard binary arithmetic.
        tmp = regA + value + carrySet(); // Calculate sum (including carry).
        if (tmp >= 0x100) { // If binary carry.
          SEC(); // Set C flag.
          if (overflowSet() && tmp >= 0x180) {
            CLV();
          } // Adjust V flag.
        } else { // No binary carry.
          CLC(); // Clear C flag.
          if (overflowSet() && tmp < 0x80) {
            CLV();
          } // Adjust V flag.
        }
      }
      regA = tmp & 0xff; // Store result in accumulator, masked to 8 bits.
      setNVflagsForRegA(); // Update Z/N flags based on regA.
    }


    // Object mapping 6502 opcodes to their JavaScript implementation functions.
    // Each function simulates the effect of the corresponding 6502 instruction.
    var instructions = {
      i00: function() { // BRK instruction (Force Break).
        codeRunning = false; // Stop execution.
        // BRK also pushes PC+2 and P to stack, and sets I and B flags, then loads IRQ vector.
        // Simplified here for basic simulation.
      },

      i01: function() { // ORA (operand,X) - OR with Accumulator, Zero Page Indexed Indirect.
        var zp = (popByte() + regX) & 0xff; // Calculate zero page address.
        // Further implementation for ORA with indirect X addressing.
      },
      // ... and so on for all 256 opcodes.
      // (The provided snippet only includes i00 and i01)
      // The full implementation would contain all 256 opcode handlers.
    };
    // The rest of the simulator functions and the return object would follow here.
    // As per the request, only the provided code segment is cloned.
  }