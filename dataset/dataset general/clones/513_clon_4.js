const entryCollection = new Meteor.Collection("records", { connection: null });

const createDisplayTracker = () => {
  let observationCounter = 0;
  return () => {
    observationCounter++;
    console.log(`View Update Cycle #${observationCounter}`);
  };
};
const viewUpdateObserver = createDisplayTracker();

Template.displayArea.getEntries = () => entryCollection.find();

Template.displayArea.onRendered(function() {
  viewUpdateObserver();
});

const possibleLabels = ["first", "second", "third"];
const pickRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const activateDataFlow = () => {
  setInterval(() => {
    const selectedLabel = pickRandomElement(possibleLabels);
    entryCollection.insert({ item_label: selectedLabel });
  }, 1000);
};

activateDataFlow();