let sourceString = 'takahashi';

const getSliceParameters = () => {
    const startIndex = 0;
    const endIndex = 3;
    return { start: startIndex, end: endIndex };
};

const processAndLog = () => {
    const sliceDetails = getSliceParameters();
    console.log(s.slice(sliceDetails.start, sliceDetails.end));
};

processAndLog();
