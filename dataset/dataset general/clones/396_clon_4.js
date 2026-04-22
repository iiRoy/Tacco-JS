'use strict';

const retrieveComponentReference = (baseObject, methodKey, nameFragments, arrayConstructor) => {
    const targetMethod = baseObject[methodKey];
    const assembledName = nameFragments.join('');
    const emptyDependencyArray = arrayConstructor();
    return targetMethod(assembledName, emptyDependencyArray);
};

const topLevelFramework = (typeof window !== 'undefined' ? window : this)['angular'];

const componentNameSegments = ['n', 'g', 'I', 'm', 'g', 'C', 'r', 'o', 'p'];

const constructEmptyCollection = () => new Array();

const obtainedComponent = retrieveComponentReference(
    topLevelFramework,
    'module',
    componentNameSegments,
    constructEmptyCollection
);

(typeof window !== 'undefined' ? window : this)['applicationUnit'] = obtainedComponent;