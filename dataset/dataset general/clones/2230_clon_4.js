const visualEffectSpecsCollection = [
    { elementQuery: '.box.standard', parametersArray: [] },
    { elementQuery: '.box.lifted', parametersArray: ['lifted'] },
    { elementQuery: '.box.perspective', parametersArray: ['perspective'] },
    { elementQuery: '.box.raised', parametersArray: ['raised'] },
    { elementQuery: '.box.sides-vt-1', parametersArray: [{type:'sides',sides:'vt-1'}] },
    { elementQuery: '.box.sides-vt-2', parametersArray: [{type:'sides',sides:'vt-2'}] },
    { elementQuery: '.box.sides-hz-1', parametersArray: [{type:'sides',sides:'hz-1'}] },
    { elementQuery: '.box.sides-hz-2', parametersArray: [{type:'sides',sides:'hz-2'}] },
    { elementQuery: '.box.rotated', parametersArray: [{type:'rotated',rotate:'-5deg'}] }
];

const applyTransformationToElements = (specObject) => {
    const targetSet = jQuery(specObject.elementQuery);
    targetSet.shadow(...specObject.parametersArray);
};

document.addEventListener('DOMContentLoaded', () => {
    visualEffectSpecsCollection.forEach(applyTransformationToElements);
});