process.stdin.setEncoding("utf8");
process.stdin.on("data", payload => {
  const fields = payload.split(" ");
  const A = fields[0];
  const B = fields[1];
  const H = fields[2];
  const M = fields[3];

  const signedAngles = [
    { value: (Math.PI * 2.0 * M) / 60, sign: 1 },
    { value: Math.PI * 2 * (H / 12 + M / 60 / 12), sign: -1 },
  ];

  const separation = signedAngles.reduce((total, item) => {
    return total + item.value * item.sign;
  }, 0);

  const contributions = [
    A * A,
    B * B,
    -2 * A * B * Math.cos(separation),
  ];

  const squaredLength = contributions.reduce((total, value) => {
    return total + value;
  }, 0);

  console.log(Math.sqrt(squaredLength));
});
