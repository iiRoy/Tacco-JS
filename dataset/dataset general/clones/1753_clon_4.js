class SchedulingService {
    constructor(hostEnvironment) {
        this.platformTimerApi = hostEnvironment.vertx;
    }

    registerExecution(routine, timePeriod) {
        return this.platformTimerApi.setTimer(timePeriod, routine);
    }

    deregisterExecution(taskHandle) {
        if (taskHandle === null || taskHandle === undefined) {
            return undefined;
        }
        return this.platformTimerApi.cancelTimer(taskHandle);
    }
}

const globalScheduler = new SchedulingService(this);
this.initiateProcedure = globalScheduler.registerExecution.bind(globalScheduler);
this.terminateProcedure = globalScheduler.deregisterExecution.bind(globalScheduler);