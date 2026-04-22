// This module manages the internal timer system of the simulated device.
// It includes several registers and a clock mechanism essential for timing-sensitive operations.

TIMER =
{
    // The DIV register (Divider Register).
    // This is an 8-bit free-running counter that increments at a fixed rate.
    _div : 0,


    // Timer Modulo Register (TMA).
    // An 8-bit register. When the TIMA register overflows (goes from 255 to 0),
    // it is reloaded with the value from TMA.
    _tma : 0,


    // Timer Counter Register (TIMA).
    // An 8-bit register that increments at a frequency determined by the TAC register.
    // It triggers an interrupt upon overflow.
    _tima : 0,


    // Timer Control Register (TAC).
    // An 8-bit register that controls the timer's operation:
    // Bit 2: Timer Stop (0=Stop, 1=Run)
    // Bits 0-1: Input Clock Select (00=4096 Hz, 01=262144 Hz, 10=65536 Hz, 11=16384 Hz)
    _tac : 0,


    // Internal clock components for precise timing simulation.
    // These counters are not directly accessible by the emulated CPU.
    _clock : {
        main : 0,  // Main clock counter, increments based on CPU cycles.
        sub  : 0,  // Sub-clock counter for finer granularity, accumulates CPU machine cycles.
        div  : 0   // Clock counter specifically for the DIV register.
    },


    /**
     * Resets all timer-related registers and internal clock counters to their initial states.
     * This function is typically invoked during system initialization or a hard reset.
     */
    reset : function ( )
    {
        // Reset all public timer registers to their default power-on values (usually zero).
        TIMER._div      = 0;
        TIMER._sdiv     = 0; // Note: _sdiv is not a standard Game Boy register and might be a custom extension or an unused variable.
        TIMER._tma      = 0;
        TIMER._tima     = 0;
        TIMER._tac      = 0;

        // Reset all internal clock counters to ensure a clean start.
        TIMER._clock.main = 0;
        TIMER._clock.sub  = 0;
        TIMER._clock.div  = 0;

        // Log the reset event to the console for debugging and status tracking.
        LOG.out ( 'TIMER', 'Reset.' );
    },


    /**
     * Increments the TIMA register and handles any overflow conditions,
     * including reloading from TMA and triggering an interrupt.
     * This function is called when the timer's input clock (determined by TAC) ticks.
     */
    step : function ( )
    {
        TIMER._tima++; // Increment the Timer Counter register by one.
        TIMER._clock.main = 0; // Reset the main clock counter after a successful timer step.

        // Check if TIMA has overflowed (exceeded its 8-bit capacity).
        if ( TIMER._tima > 255 ) {
            TIMER._tima = TIMER._tma; // Reload TIMA with the value from the TMA register.
            MMU._if     |= 4;         // Set the Timer Interrupt Request flag (bit 2) in the MMU's IF register.
        }
    },


    /**
     * Advances the internal timer system by a number of CPU cycles.
     * This function manages the DIV register, the TIMA register's increment,
     * and the timer's overall state based on the TAC settings.
     */
    inc : function ( )
    {
        // Store the current state of the main clock counter for potential future use or comparison.
        var oldclk = TIMER._clock.main;

        // Accumulate CPU machine cycles into the sub-clock counter.
        // Z80._r.m typically represents the number of machine cycles for the last instruction.
        TIMER._clock.sub += Z80._r.m;

        // If the sub-clock counter exceeds 3 (representing 4 CPU cycles, a single machine cycle),
        // then a main clock cycle has passed.
        if ( TIMER._clock.sub > 3 ) {
            TIMER._clock.main++;      // Increment the main clock counter.
            TIMER._clock.sub -= 4;    // Subtract 4 from the sub-clock to normalize it.

            // Increment the internal DIV clock counter.
            TIMER._clock.div++;

            // If the DIV clock counter reaches 16, it's time to increment the DIV register.
            // The DIV register increments at 16384 Hz, which corresponds to 16 machine cycles.
            if ( TIMER._clock.div == 16 ) {
                TIMER._clock.div = 0; // Reset the DIV clock counter.
                TIMER._div++;         // Increment the actual DIV register.
                TIMER._div &= 255;    // Ensure the DIV register wraps around at 255 (it's an 8-bit register).
            }
        }

        // Check if the timer is enabled (bit 2 of the TAC register is set).
        if ( TIMER._tac & 4 ) {
            // Determine the timer's input clock frequency based on bits 0-1 of TAC.
            switch ( TIMER._tac & 3 ) {
                case 0 : // Input Clock Select: 00 (CPU Clock / 1024, ~4096 Hz)
                    // The TIMA register increments every 64 main clock cycles.
                    if ( TIMER._clock.main >= 64 ) {
                        TIMER.step ( ); // Perform a timer step.
                    }
                    break;

                case 1 : // Input Clock Select: 01 (CPU Clock / 16, ~262144 Hz)
                    // The TIMA register increments every 1 main clock cycle.
                    if ( TIMER._clock.main >= 1 ) {
                        TIMER.step ( ); // Perform a timer step.
                    }
                    break;

                case 2 : // Input Clock Select: 10 (CPU Clock / 64, ~65536 Hz)
                    // The TIMA register increments every 4 main clock cycles.
                    if ( TIMER._clock.main >= 4 ) {
                        TIMER.step ( ); // Perform a timer step.
                    }
                    break;

                case 3 : // Input Clock Select: 11 (CPU Clock / 256, ~16384 Hz)
                    // The TIMA register increments every 16 main clock cycles.
                    if ( TIMER._clock.main >= 16 ) {
                        TIMER.step ( ); // Perform a timer step.
                    }
                    break;
            }
        }
    },


    /**
     * Reads a byte from the specified timer memory address (MMIO).
     * @param {number} addr - The 16-bit memory address to read from.
     * @returns {number} The 8-bit byte value stored in the register at `addr`.
     */
    rb : function ( addr )
    {
        // Use a switch statement to handle different timer register addresses.
        switch ( addr ) {
            case 0xFF04 :
                return TIMER._div;  // Return the current value of the DIV register.
            case 0xFF05 :
                return TIMER._tima; // Return the current value of the TIMA register.
            case 0xFF06 :
                return TIMER._tma;  // Return the current value of the TMA register.
            case 0xFF07 :
                return TIMER._tac;  // Return the current value of the TAC register.
        }
    },


    /**
     * Writes a byte to the specified timer memory address (MMIO).
     * @param {number} addr - The 16-bit memory address to write to.
     * @param {number} val  - The 8-bit byte value to write into the register.
     */
    wb : function ( addr, val )
    {
        // Use a switch statement to handle writes to different timer register addresses.
        switch ( addr ) {
            case 0xFF04 :
                TIMER._div = 0; // Writing any value to DIV resets it to 0.
                break;
            case 0xFF05 :
                TIMER._tima = val; // Write the provided value directly to the TIMA register.
                break;
            case 0xFF06 :
                TIMER._tma = val; // Write the provided value directly to the TMA register.
                break;
            case 0xFF07 :
                TIMER._tac = val & 7; // Only bits 0, 1, and 2 of TAC are writable; higher bits are ignored.
                break;
        }
    }
};