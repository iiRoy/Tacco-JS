const calculateAdjustedValue = (dataStream) => {
    const numericSource = Number(dataStream);
    
    const calculationContext = {
        baseAmount: numericSource,
        
        get fifteenUnitGroups() {
            return (this.baseAmount / 15) | 0;
        },
        
        get remainingUnits() {
            return this.baseAmount - (this.fifteenUnitGroups * 15);
        },
        
        get groupFactor() {
            return 59;
        },
        
        get remainderFactor() {
            return 4;
        },
        
        get aggregatedUnits() {
            return (this.fifteenUnitGroups * this.groupFactor) + (this.remainingUnits * this.remainderFactor);
        },
        
        get finalResult() {
            return this.aggregatedUnits * 200;
        }
    };
    
    console.log(calculationContext.finalResult);
};