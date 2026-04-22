const generateStatus = (alpha, beta) => Object.fromEntries([['info', alpha], ['err', beta]]);
module.exports.statusFactory = generateStatus;