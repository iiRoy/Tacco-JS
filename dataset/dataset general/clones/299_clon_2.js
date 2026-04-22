CLOCK_SUBSYSTEM = {
  // Represents the internal Divider Register (DIV) of the timer unit.
  _divisor_register: 0,
  // Holds the Timer Modulo (TMA) value, used for reloading the timer counter.
  _timer_modulo_register: 0,
  // This is the Timer Counter (TIMA) register, which increments based on frequency.
  _timer_counter_register: 0,
  // The Timer Control (TAC) register, enabling the timer and selecting its clock frequency.
  _timer_control_register: 0,

  // An internal collection of clock states for precise timing management.
  _internal_clock_states: {
    master_cycle_count: 0,    // Primary clock counter for frequency division.
    sub_cycle_accumulator: 0, // Accumulates CPU sub-cycles to tick the master clock.
    divider_clock_counter: 0  // Dedicated counter for the DIV register.
  },

  /**
   * Resets all components of the clock subsystem to their initial power-on state.
   * This includes all registers and internal clock accumulators.
   */
  initialize: function () {
    CLOCK_SUBSYSTEM._divisor_register = 0;
    CLOCK_SUBSYSTEM._sub_divisor_val = 0; // A secondary divisor value, not always used.
    CLOCK_SUBSYSTEM._timer_modulo_register = 0;
    CLOCK_SUBSYSTEM._timer_counter_register = 0;
    CLOCK_SUBSYSTEM._timer_control_register = 0;

    CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count = 0;
    CLOCK_SUBSYSTEM._internal_clock_states.sub_cycle_accumulator = 0;
    CLOCK_SUBSYSTEM._internal_clock_states.divider_clock_counter = 0;

    // Output a message to the debugging console indicating the timer module's reset.
    DEBUG_LOGGING_MODULE.output('CLOCK_SUBSYSTEM', 'Module state has been reinitialized.');
  },

  /**
   * Increments the Timer Counter (TIMA) register.
   * If TIMA overflows, it is reloaded with TMA and a timer interrupt is requested.
   */
  advance_timer_counter: function () {
    CLOCK_SUBSYSTEM._timer_counter_register++; // Increment the timer counter.
    CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count = 0; // Reset main clock upon TIMA increment.

    // Check if the timer counter has overflowed (exceeded its 8-bit capacity).
    if (CLOCK_SUBSYSTEM._timer_counter_register > 255) {
      CLOCK_SUBSYSTEM._timer_counter_register = CLOCK_SUBSYSTEM._timer_modulo_register; // Reload TIMA from TMA.
      SYSTEM_MEMORY_UNIT._interrupt_flags |= 0x04; // Set the Timer Interrupt flag (bit 2).
    }
  },

  /**
   * Processes CPU machine cycles and updates all internal clock and timer states accordingly.
   * This function is crucial for synchronizing the timer with the CPU's execution speed.
   */
  process_cpu_cycles: function () {
    // Store the current master clock value before potential modification.
    const previous_master_clock_state = CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count;

    // Accumulate sub-cycles based on the CPU's reported machine cycles.
    CLOCK_SUBSYSTEM._internal_clock_states.sub_cycle_accumulator += PROCESSOR_UNIT._cpu_registers.machine_cycles_elapsed;

    // If enough sub-cycles have accumulated, a main clock tick occurs.
    if (CLOCK_SUBSYSTEM._internal_clock_states.sub_cycle_accumulator > 3) {
      CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count++; // Increment the primary clock.
      CLOCK_SUBSYSTEM._internal_clock_states.sub_cycle_accumulator -= 4; // Deduct one main clock period.

      CLOCK_SUBSYSTEM._internal_clock_states.divider_clock_counter++; // Increment the internal DIV clock.
      if (CLOCK_SUBSYSTEM._internal_clock_states.divider_clock_counter === 16) {
        CLOCK_SUBSYSTEM._internal_clock_states.divider_clock_counter = 0; // Reset internal DIV clock.
        CLOCK_SUBSYSTEM._divisor_register++; // Increment the public DIV register.
        CLOCK_SUBSYSTEM._divisor_register &= 0xFF; // Ensure DIV register wraps around at 255 (8-bit).
      }
    }

    // Check if the timer itself is enabled (bit 2 of TAC is set).
    if (CLOCK_SUBSYSTEM._timer_control_register & 0x04) {
      // Determine the timer's frequency based on the lower two bits of TAC.
      switch (CLOCK_SUBSYSTEM._timer_control_register & 0x03) {
        case 0x00: // Frequency 0: TIMA increments every 64 master clock cycles.
          if (CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count >= 64)
            CLOCK_SUBSYSTEM.advance_timer_counter();
          break;
        case 0x01: // Frequency 1: TIMA increments every 1 master clock cycle.
          if (CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count >= 1)
            CLOCK_SUBSYSTEM.advance_timer_counter();
          break;
        case 0x02: // Frequency 2: TIMA increments every 4 master clock cycles.
          if (CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count >= 4)
            CLOCK_SUBSYSTEM.advance_timer_counter();
          break;
        case 0x03: // Frequency 3: TIMA increments every 16 master clock cycles.
          if (CLOCK_SUBSYSTEM._internal_clock_states.master_cycle_count >= 16)
            CLOCK_SUBSYSTEM.advance_timer_counter();
          break;
      }
    }
  },

  /**
   * Reads a byte from one of the timer's memory-mapped I/O registers.
   * @param {number} memory_address The 16-bit address of the register to read.
   * @returns {number} The 8-bit value stored in the specified register.
   */
  read_io_register: function (memory_address) {
    // Select the appropriate register based on the provided address.
    switch (memory_address) {
      case 0xFF04:
        return CLOCK_SUBSYSTEM._divisor_register; // DIV register.
      case 0xFF05:
        return CLOCK_SUBSYSTEM._timer_counter_register; // TIMA register.
      case 0xFF06:
        return CLOCK_SUBSYSTEM._timer_modulo_register; // TMA register.
      case 0xFF07:
        return CLOCK_SUBSYSTEM._timer_control_register; // TAC register.
    }
    // Default return for unrecognized addresses, though this path should ideally not be hit.
    return 0xFF;
  },

  /**
   * Writes a byte value to one of the timer's memory-mapped I/O registers.
   * @param {number} register_address The 16-bit address of the register to write to.
   * @param {number} byte_value The 8-bit value to write into the register.
   */
  write_io_register: function (register_address, byte_value) {
    // Select the appropriate register based on the provided address.
    switch (register_address) {
      case 0xFF04:
        CLOCK_SUBSYSTEM._divisor_register = 0; // Writing to DIV always resets it to zero.
        break;
      case 0xFF05:
        CLOCK_SUBSYSTEM._timer_counter_register = byte_value; // Directly sets the TIMA register.
        break;
      case 0xFF06:
        CLOCK_SUBSYSTEM._timer_modulo_register = byte_value; // Sets the TMA register.
        break;
      case 0xFF07:
        CLOCK_SUBSYSTEM._timer_control_register = byte_value & 0x07; // Only the lower 3 bits of TAC are writable.
        break;
    }
  }
};