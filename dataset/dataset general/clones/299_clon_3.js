// This module manages the core timing functions and registers for the emulated system.
// It handles the system clock division, internal timer increments, and interrupt generation.
const SYSTEM_CLOCK_CONTROLLER = {
  // --- Internal State Registers (Memory-Mapped) ---
  _divisorRegister: 0x00,          // Corresponds to DIV (0xFF04): System clock divisor counter.
  _activeTimerCounter: 0x00,       // Corresponds to TIMA (0xFF05): The primary timer counter.
  _timerModuloValue: 0x00,         // Corresponds to TMA (0xFF06): Value loaded into TIMA on overflow.
  _timerControlFlags: 0x00,        // Corresponds to TAC (0xFF07): Timer control (enable/frequency).

  // --- Internal Clock Tracking Units ---
  _internalClockProgress: {
    primaryClock: 0x00,      // Main clock counter, increments based on CPU machine cycles.
    fractionalCycle: 0x00,   // Accumulates CPU machine cycles before incrementing primaryClock.
    divisorTickCounter: 0x00 // Tracks ticks for the _divisorRegister increment.
  },

  // --- Configuration and Status Flags ---
  _systemUnitReady: false,         // Flag to indicate if the controller has been initialized.

  // --- Memory-Mapped Register Addresses (Constants) ---
  _REGISTER_MAP: {
    DIV_ADDR: 0xFF04,
    TIMA_ADDR: 0xFF05,
    TMA_ADDR: 0xFF06,
    TAC_ADDR: 0xFF07
  },

  /**
   * Initializes all internal timing components to their default power-on state.
   * This method should be invoked once at system startup.
   */
  initializeUnit: function() {
    this._divisorRegister = 0x00;
    this._activeTimerCounter = 0x00;
    this._timerModuloValue = 0x00;
    this._timerControlFlags = 0x00; // All bits cleared initially for TAC.

    this._internalClockProgress.primaryClock = 0x00;
    this._internalClockProgress.fractionalCycle = 0x00;
    this._internalClockProgress.divisorTickCounter = 0x00;

    this._systemUnitReady = true; // Mark the unit as initialized.

    // Optional logging for debugging purposes.
    if (typeof DEBUG_LOGGER !== 'undefined' && DEBUG_LOGGER.logMessage) {
      DEBUG_LOGGER.logMessage('SYSTEM_CLOCK_CONTROLLER', 'Timing unit successfully initialized.');
    }
  },

  /**
   * Internal helper function to manage the timer overflow event.
   * Reloads the active timer counter and signals a timer interrupt.
   */
  _triggerTimerOverflow: function() {
    this._activeTimerCounter = this._timerModuloValue; // Reload TIMA from TMA.
    // Signal the Timer interrupt (bit 2) to the Memory Management Unit.
    // This assumes MEMORY_CONTROLLER is a globally accessible object.
    if (typeof MEMORY_CONTROLLER !== 'undefined' && MEMORY_CONTROLLER.setInterruptFlag) {
      MEMORY_CONTROLLER.setInterruptFlag(0x04); // Set the Timer interrupt bit.
    } else if (typeof MEMORY_CONTROLLER !== 'undefined' && MEMORY_CONTROLLER.interruptFlags !== undefined) {
      // Fallback for direct flag manipulation if a dedicated setter isn't available.
      MEMORY_CONTROLLER.interruptFlags |= 0x04;
    }
  },

  /**
   * Advances the active timer counter (TIMA) by a single step.
   * This is triggered by conditions derived from the TAC register.
   */
  _advanceActiveTimer: function() {
    // Increment TIMA, ensuring it wraps around at 255 (8-bit counter).
    this._activeTimerCounter = (this._activeTimerCounter + 1) & 0xFF;
    this._internalClockProgress.primaryClock = 0x00; // Reset primary clock for the next timer period.

    // If TIMA wrapped from 255 to 0, an overflow occurred.
    if (this._activeTimerCounter === 0x00) {
      this._triggerTimerOverflow();
    }
  },

  /**
   * Processes a specified number of CPU machine cycles for the clock system.
   * This method should be called by the CPU emulation loop after each instruction.
   * @param {number} cycles - The number of machine cycles (M-cycles) to process.
   */
  processCpuCycles: function(cycles) {
    // Ensure the unit is initialized; perform lazy initialization if not.
    if (!this._systemUnitReady) {
      this.initializeUnit();
    }

    // Accumulate the incoming CPU machine cycles.
    this._internalClockProgress.fractionalCycle += cycles;

    // A main clock tick (T-cycle) occurs every 4 machine cycles.
    // Process all full T-cycles that have accumulated.
    while (this._internalClockProgress.fractionalCycle >= 0x04) {
      this._internalClockProgress.primaryClock = (this._internalClockProgress.primaryClock + 1) & 0xFF; // Increment primary clock.
      this._internalClockProgress.fractionalCycle -= 0x04; // Deduct 4 M-cycles.

      // Handle the DIV register (0xFF04) incrementation.
      // DIV increments every 16 T-cycles (which is 64 M-cycles).
      this._internalClockProgress.divisorTickCounter = (this._internalClockProgress.divisorTickCounter + 1) % 0x10; // Modulo 16.
      if (this._internalClockProgress.divisorTickCounter === 0x00) { // If it wrapped around (every 16th T-cycle).
        this._divisorRegister = (this._divisorRegister + 1) & 0xFF; // Increment DIV, wrapping at 255.
      }

      // Check if the timer is currently enabled (TAC bit 2).
      const isTimerActive = (this._timerControlFlags & 0x04) !== 0x00;
      if (isTimerActive) {
        // Determine the timer's frequency based on TAC bits 0 and 1.
        const timerFrequencySelect = this._timerControlFlags & 0x03;
        let clockThreshold = 0;

        // Map TAC bits 0-1 to the corresponding primary clock threshold.
        // These thresholds represent how many T-cycles pass before TIMA increments.
        switch (timerFrequencySelect) {
          case 0x00: clockThreshold = 0x40; break; // CPU Clock / 256 (64 T-cycles).
          case 0x01: clockThreshold = 0x01; break; // CPU Clock / 4   (1 T-cycle).
          case 0x02: clockThreshold = 0x04; break; // CPU Clock / 16  (4 T-cycles).
          case 0x03: clockThreshold = 0x10; break; // CPU Clock / 64  (16 T-cycles).
          default:
            // This case should ideally not be reached due to the 2-bit mask.
            if (typeof DEBUG_LOGGER !== 'undefined' && DEBUG_LOGGER.logMessage) {
                DEBUG_LOGGER.logMessage('SYSTEM_CLOCK_CONTROLLER', `Warning: Unknown timer frequency select value: ${timerFrequencySelect}`);
            }
            break;
        }

        // If the primary clock has reached or exceeded the determined threshold,
        // it's time to increment the active timer counter (TIMA).
        if (this._internalClockProgress.primaryClock >= clockThreshold) {
          this._advanceActiveTimer();
        }
      }
    }
  },

  /**
   * Reads a byte value from a specified memory-mapped timer register address.
   * @param {number} address - The 16-bit memory address to read from.
   * @returns {number} The 8-bit byte value read from the register.
   */
  fetchRegisterValue: function(address) {
    // Basic address validation could be added here if a broader range of addresses were expected.
    switch (address) {
      case this._REGISTER_MAP.DIV_ADDR:
        return this._divisorRegister;
      case this._REGISTER_MAP.TIMA_ADDR:
        return this._activeTimerCounter;
      case this._REGISTER_MAP.TMA_ADDR:
        return this._timerModuloValue;
      case this._REGISTER_MAP.TAC_ADDR:
        // The upper 5 bits of the TAC register are always read as 1.
        return this._timerControlFlags | 0xF8;
      default:
        // For unmapped or invalid timer addresses, typically return 0xFF.
        if (typeof DEBUG_LOGGER !== 'undefined' && DEBUG_LOGGER.logMessage) {
            DEBUG_LOGGER.logMessage('SYSTEM_CLOCK_CONTROLLER', `Attempted read from unmapped timer address: 0x${address.toString(16)}`);
        }
        return 0xFF;
    }
  },

  /**
   * Writes a byte value to a specified memory-mapped timer register address.
   * @param {number} address - The 16-bit memory address to write to.
   * @param {number} value - The 8-bit byte value to write.
   */
  updateRegisterValue: function(address, value) {
    // Ensure the input value is an 8-bit byte.
    const byteToWrite = value & 0xFF;

    switch (address) {
      case this._REGISTER_MAP.DIV_ADDR:
        // Writing any value to the DIV register resets it to 0.
        this._divisorRegister = 0x00;
        // Also reset the internal counter that drives DIV.
        this._internalClockProgress.divisorTickCounter = 0x00;
        break;
      case this._REGISTER_MAP.TIMA_ADDR:
        this._activeTimerCounter = byteToWrite;
        break;
      case this._REGISTER_MAP.TMA_ADDR:
        this._timerModuloValue = byteToWrite;
        break;
      case this._REGISTER_MAP.TAC_ADDR:
        // Only the lower 3 bits (0-2) of the TAC register are writable.
        this._timerControlFlags = byteToWrite & 0x07;
        break;
      default:
        // Log a warning for writes to unmapped timer addresses.
        if (typeof DEBUG_LOGGER !== 'undefined' && DEBUG_LOGGER.logMessage) {
            DEBUG_LOGGER.logMessage('SYSTEM_CLOCK_CONTROLLER', `Attempted write to unmapped timer address: 0x${address.toString(16)} with value 0x${byteToWrite.toString(16)}`);
        }
        // No action for unmapped writes.
        break;
    }
  }
};