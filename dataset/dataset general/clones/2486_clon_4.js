if (Meteor.isClient) {
  Template.presenter.onCreated(function () {
    this.numericalState = new ReactiveVar(0);
  });

  Template.presenter.helpers({
    presentNumericalValue() {
      return Template.instance().numericalState.get();
    }
  });

  Template.presenter.events({
    'click button'(occasion, currentInstance) {
      const priorValue = currentInstance.numericalState.get();
      currentInstance.numericalState.set(priorValue + 1);
    }
  });
}

if (Meteor.isServer) {
  const serverInitializationRoutine = () => {
    // No specific server-side operations for this clone
  };
  Meteor.startup(serverInitializationRoutine);
}