import path from 'path';

const env = process.env.NODE_ENV || 'development';
console.log(`Loading the initial Environment ${env}`);
const config = require(`./${env}`); //eslint-disable-line

const defaults = {
  root: path.join(__dirname, '/..')
};

export default Object.assign(defaults, config);
