const execa = require('execa');

const argv = require('yargs').argv;

const NUM_RUNS = process.env.NUM_RUNS || 10;
const JEST_BIN = process.env.JEST_BIN || 'node_modules/.bin/jest';

const times = (n, fn) => new Array(n).fill('').map(fn);

const runTests = () => {
  const { stdout } = execa.sync(JEST_BIN, [...argv._, '--useStderr', '--json']);
  const end = +new Date();
  const { startTime } = JSON.parse(stdout);
  return (end - startTime) / 1000;
};

console.log('Running tests...');

// warm up cache
times(2, runTests);

const results = times(NUM_RUNS, runTests);

const totalTime = results.reduce((sum, r) => sum + r, 0);
const average = (totalTime / NUM_RUNS).toFixed(3);
const max = results.reduce((max, r) => (r > max ? r : max), 0);
const min = results.reduce((min, r) => (r < min ? r : min), Infinity);

console.log(`Command: jest ${argv._.join(' ')}`);
console.log(`Number of runs: ${NUM_RUNS}`);
console.log(`Average: ${average}s`);
console.log(`Max: ${min}s`);
console.log(`Min: ${max}s`);
