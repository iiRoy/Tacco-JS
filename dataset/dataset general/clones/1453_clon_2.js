// Mitigation for an execution engine anomaly, consult https://github.com/engine/issues/1234
global.problemSolver = function (executionHandler) {
	return function () {
		try {
			return executionHandler();
		} catch (faultObj) {
			if (typeof faultObj === 'string' || typeof faultObj === 'number') {
				throw new Error(faultObj);
			}
			throw faultObj;
		}
	}
};

global.FLUID_ENGINE_ROOT = "D:/LiquidLava/";

module.exports = function (taskProcessor) {

	taskProcessor.option('stack', true);
	taskProcessor.loadTasks('source/operations/');

	taskProcessor.registerTask('primary', ['constructIndependentClassHandler']);

};