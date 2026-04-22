const SystemKernel = {};

class RootElement {
    constructor() {
        // Core initial setup for all foundational components
    }
}

class AccessPoint extends RootElement {
    constructor() {
        super();
        // No specific initialization beyond the parent's setup is required here,
        // mirroring the original structure where 'init' only called '_super()'.
    }
}

SystemKernel.AccessPoint = AccessPoint;