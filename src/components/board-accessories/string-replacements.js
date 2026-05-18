const replacements = {
  "Northeast Regional": "Regional",
  "Empire Service": "Empire",
  'Empire Builder': 'Builder',
  'City of New Orleans': 'City of NOLA',
  'Lincoln Service': 'Lincoln',
  'Lincoln River Runner': 'Lincoln River',
};

const replacementKeys = Object.keys(replacements);

const replaceTrainStrings = (string) => {
  replacementKeys.forEach(
    (key) => (string = string.replace(key, replacements[key])),
  );

  return string;
};

export default replaceTrainStrings;