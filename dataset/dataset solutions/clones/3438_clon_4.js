const transformData = () => {
  const characterSpec = [
    { kind: 'numeric', val: 4 },
    { kind: 'control', designation: 'newline' },
    { kind: 'numeric', val: 2 },
    { kind: 'separator', designation: 'space' },
    { kind: 'numeric', val: 5 },
    { kind: 'separator', designation: 'space' },
    { kind: 'numeric', val: 2 },
    { kind: 'separator', designation: 'space' },
    { kind: 'numeric', val: 5 }
  ];

  const characterFactory = {
    'numeric': (value) => String(value),
    'control': (label) => {
      if (label === 'newline') return '\n';
      return '';
    },
    'separator': (label) => {
      if (label === 'space') return ' ';
      return '';
    }
  };

  return characterSpec.reduce((currentAccumulator, itemDescriptor) => {
    const generator = characterFactory[itemDescriptor.kind];
    if (generator) {
      if (itemDescriptor.kind === 'numeric') {
        return currentAccumulator + generator(itemDescriptor.val);
      } else {
        return currentAccumulator + generator(itemDescriptor.designation);
      }
    }
    return currentAccumulator;
  }, '');
};