class SystemClockManager {
  #systemDivisor = 0;
  #timerModulo = 0;
  #currentTimer = 0;
  #controlFlags = 0;

  #mainClockCycles = 0;
  #subClockCycles = 0;
  #divisorClockCycles = 0;

  #frequencyMap = [64, 1, 4, 16];

  #registerReaders = new Map();
  #registerWriters = new Map();

  constructor() {
    this.#initializeState();
    this.#setupRegisterAccess();
  }

  #initializeState() {
    this.#systemDivisor = 0;
    this.#timerModulo = 0;
    this.#currentTimer = 0;
    this.#controlFlags = 0;
    this.#mainClockCycles = 0;
    this.#subClockCycles = 0;
    this.#divisorClockCycles = 0;
  }

  #setupRegisterAccess() {
    this.#registerReaders.set(0xFF04, () => this.#systemDivisor);
    this.#registerReaders.set(0xFF05, () => this.#currentTimer);
    this.#registerReaders.set(0xFF06, () => this.#timerModulo);
    this.#registerReaders.set(0xFF07, () => this.#controlFlags);

    this.#registerWriters.set(0xFF04, () => { this.#systemDivisor = 0; });
    this.#registerWriters.set(0xFF05, (val) => { this.#currentTimer = val; });
    this.#registerWriters.set(0xFF06, (val) => { this.#timerModulo = val; });
    this.#registerWriters.set(0xFF07, (val) => { this.#controlFlags = val & 7; });
  }

  #executeTimerTick() {
    this.#currentTimer++;
    this.#mainClockCycles = 0;

    if (this.#currentTimer > 255) {
      this.#currentTimer = this.#timerModulo;
      // Assume 'GlobalInterruptBus' is the new 'MMU' and 'interruptRegister' is '_if'
      GlobalInterruptBus.interruptRegister |= 4;
    }
  }

  advanceClocks(cpuMachineCycles) { // 'cpuMachineCycles' corresponds to Z80._r.m
    this.#subClockCycles += cpuMachineCycles;

    while (this.#subClockCycles >= 4) {
      this.#subClockCycles -= 4;
      this.#mainClockCycles++;
      this.#divisorClockCycles++;
    }

    if (this.#divisorClockCycles >= 16) {
      this.#divisorClockCycles = 0;
      this.#systemDivisor = (this.#systemDivisor + 1) & 0xFF;
    }

    if ((this.#controlFlags & 4) !== 0) {
      const frequencySelection = this.#controlFlags & 3;
      const cycleThreshold = this.#frequencyMap[frequencySelection];

      if (this.#mainClockCycles >= cycleThreshold) {
        this.#executeTimerTick();
      }
    }
  }

  readByte(address) {
    const handler = this.#registerReaders.get(address);
    return handler ? handler() : 0xFF;
  }

  writeByte(address, value) {
    const handler = this.#registerWriters.get(address);
    if (handler) {
      handler(value);
    }
  }

  resetUnit() { // Public method for external reset, corresponds to TIMER.reset
    this.#initializeState();
  }
}

// Example global objects to satisfy dependencies, assuming they exist elsewhere:
// const GlobalInterruptBus = { interruptRegister: 0 };
// const CpuCore = { cyclesElapsed: 0 };