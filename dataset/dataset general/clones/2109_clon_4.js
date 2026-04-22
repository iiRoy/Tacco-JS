const constructUri = (protocol, domain, route, parameters) => {
    console.log('this hnappen ' + parameters);

    const baseSegment = `${protocol}://${domain}${route}`;

    const querySegment = parameters.length
        ? `?${parameters.join('&')}`
        : '';

    return `${baseSegment}${querySegment}`;
};

const displayProperties = (item) => {
    const formattedRepresentation = Object.entries(item)
        .map(([key, value]) => `${key}: ${value}; \n`)
        .join('');

    console.log(formattedRepresentation);
};

const embellishString = (content) => {
    return `<h1 style="color:red;">${content}</h1>`;
};

module.exports = {
    constructUri,
    displayProperties,
    embellishString
};