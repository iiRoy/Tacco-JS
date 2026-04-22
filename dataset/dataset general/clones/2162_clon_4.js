function Node(value) {
    this.value = value;
    this.next = null;
}

const taskMaster = {};

taskMaster.ProcessingEngine = function (emptySignal) {
    this.firstNode = null;
    this.lastNode = null;
    this.emptyHandler = emptySignal;
    this.operationRunning = false;

    this.boundCompletionNotifier = this.completionNotifier.bind(this);
};

taskMaster.ProcessingEngine.prototype = {
    enrollTask: function (jobFunction) {
        const newNode = new Node(jobFunction);
        if (this.lastNode) {
            this.lastNode.next = newNode;
            this.lastNode = newNode;
        } else {
            this.firstNode = newNode;
            this.lastNode = newNode;
        }

        if (this.firstNode === newNode && !this.operationRunning) {
            this.initiateProcessing();
        }
    },

    dequeueTask: function () {
        if (!this.firstNode) {
            return null;
        }
        const task = this.firstNode.value;
        this.firstNode = this.firstNode.next;
        if (!this.firstNode) {
            this.lastNode = null;
        }
        return task;
    },

    initiateProcessing: function () {
        if (!this.firstNode) {
            this.emptyHandler();
            return;
        }

        const currentTask = this.dequeueTask();
        this.operationRunning = true;

        currentTask(this.boundCompletionNotifier);
    },

    purgeAll: function () {
        this.firstNode = null;
        this.lastNode = null;
    },

    completionNotifier: function () {
        this.operationRunning = false;
        this.initiateProcessing();
    }
};