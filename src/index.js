const execa = require('execa');

const NUM_RUNS = process.env.NUM_RUNS || 10;
const JEST_BIN = process.env.JEST_BIN || 'node_modules/.bin/jest';

const args = process.argv.slice(2);
const times = (n, fn) => new Array(n).fill('').map(fn);

const runTests = () => {
  try {
    const { stdout } = execa.sync(JEST_BIN, [...args, '--useStderr', '--json']);
    const end = +new Date();
    const { startTime } = JSON.parse(stdout);
    return (end - startTime) / 1000;
  } catch (e) {
    console.log(e);

    console.log(`
jest-benchmarks is still really bad at reporing errors
 - Make sure that all the tests that you want to are passing
    `);

    process.exit(1);
  }
};

console.log('Warming up cache...');

// warm up cache
times(2, runTests);

console.log('Running tests...');

const results = times(NUM_RUNS, runTests);

const totalTime = results.reduce((sum, r) => sum + r, 0);
const average = (totalTime / NUM_RUNS).toFixed(3);
const max = results.reduce((max, r) => (r > max ? r : max), 0);
const min = results.reduce((min, r) => (r < min ? r : min), Infinity);

console.log();
console.log(`Command: jest ${args.join(' ')}`);
console.log(`Number of runs: ${NUM_RUNS}`);
console.log(`Average: ${average}s`);
console.log(`Max: ${min}s`);
console.log(`Min: ${max}s`);
