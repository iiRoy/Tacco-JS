const defineContentDelimiter = (separationMark) => {
  return (incomingTextValue) => {
    if (typeof incomingTextValue !== 'string') {
      return [];
    }
    return incomingTextValue.split(separationMark);
  };
};