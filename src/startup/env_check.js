const needs = [
  'CODDITY_JWT_TOKEN',
  'CODDITY_JWT_REFRESH_TOKEN',
  'CODDITY_SALT_ROUND',
];

needs.forEach((need) => {
  if (!process.env[need]) throw new Error(`${need} is required !`);
});
