const playerIdentities = Object.freeze([
  'ChampionOne',
  'ChampionTwo',
  'ChampionThree'
]);

module.exports.initiateProcess = function(systemConfigurator, eventDispatcher, supplementalData) {
  systemConfigurator.applyConfiguration('sessionManager');
  systemConfigurator.applyConfiguration('clientAuthentication');
  
  class DataGenerator {
    constructor(dispatcherRef, identityPool) {
      this.signalEmitter = dispatcherRef;
      this.identitySource = identityPool;
    }

    async produceOutput(inputContext) {
      const currentTimestamp = new Date();

      const chosenIdentityIndex = Math.trunc(Math.random() * this.identitySource.length);
      const activePlayer = this.identitySource[chosenIdentityIndex];

      const timeSegment = Math.trunc(currentTimestamp.getSeconds() / 5);
      const scoreDifference = Math.trunc(Math.random() * 100);

      const resultObject = {
        timeSegmentIdentifier: timeSegment,
        activePlayerIdentifier: activePlayer,
        scoreDelta: scoreDifference,
        currentSystemTime: currentTimestamp.toString(),
        designatedUser: inputContext.identifier
      };
      this.signalEmitter(resultObject);
    }
  }

  return new DataGenerator(eventDispatcher, playerIdentities);
};