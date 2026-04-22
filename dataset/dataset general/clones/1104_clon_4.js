(function (globalReference) {

    const productValidator = (candidateProduct) => {
        const requiredProductAttributes = [
            'id', 'name', 'startAmount', 'unitsSold', 'licencePrize', 'published',
            'platformRetireDate', 'developmentCosts', 'genreWeightings',
            'audienceWeightings', 'techLevel', 'iconUri'
        ];

        const validationSequence = [
            (item) => globalReference.Checks.checkPropertiesPresent(item, requiredProductAttributes),
            (item) => globalReference.Checks.checkUniqueness(item, 'id', globalReference.Platforms.allPlatforms),
            (item) => globalReference.Checks.checkAudienceWeightings(item.audienceWeightings),
            (item) => globalReference.Checks.checkGenreWeightings(item.genreWeightings),
            (item) => globalReference.Checks.checkDate(item.published) && globalReference.Checks.checkDate(item.platformRetireDate),
            (item) => {
                if (!item.marketPoints) {
                    return true;
                }
                return item.marketPoints.every(pointData => globalReference.Checks.checkDate(pointData.date));
            }
        ];

        return validationSequence.every(checkFunction => checkFunction(candidateProduct));
    };

    globalReference.GDT.addPlatform = function (productObjectToRegister) {
        if (!productValidator(productObjectToRegister)) {
            return;
        }

        globalReference.Platforms.allPlatforms.push(productObjectToRegister);

        if (productObjectToRegister.events) {
            productObjectToRegister.events.forEach(associatedEvent => {
                globalReference.GDT.addEvent(associatedEvent);
            });
        }
    };

})(this);