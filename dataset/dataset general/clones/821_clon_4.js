class CoreProcess {
    constructor() {
        this.identifier = Symbol('application_instance_id');
        this.bootTime = Date.now();
    }
}

const mainEngine = new CoreProcess();

module.exports = mainEngine;