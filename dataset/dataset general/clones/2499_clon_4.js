const dataRepository = (() => {
    let internalState = 0;

    return {
        retrieveCurrent: () => internalState,
        adjustState: (newValue) => {
            internalState = newValue;
        }
    };
})();

module.exports = dataRepository;