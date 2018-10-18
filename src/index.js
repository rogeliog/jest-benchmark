import execa from 'execa';
import ansiEscapes from 'ansi-escapes';
import ora from 'ora';

const NUM_RUNS = process.env.NUM_RUNS || 10;
const JEST_BIN = process.env.JEST_BIN || 'node_modules/.bin/jest';

const args = process.argv.slice(2);

const printOnCurrentLine = text => {
  process.stdout.write(ansiEscapes.eraseLine);
  process.stdout.write(ansiEscapes.cursorLeft);
  process.stdout.write(text);
};

const runJest = async () =>
  execa.stdout(JEST_BIN, [...args, '--useStderr', '--json']);

const runTests = async ({
  times,
  results = [],
  onTestRunCompleted = () => {},
}) => {
  if (times <= 0) {
    return results;
  }
  try {
    const stdout = await runJest();
    const end = +new Date();
    const { startTime } = JSON.parse(stdout);
    const duration = (end - startTime) / 1000;

    onTestRunCompleted({ times });

    return runTests({
      times: times - 1,
      results: results.concat([duration]),
      onTestRunCompleted,
    });
  } catch (e) {
    console.log(e);
    console.log(`
jest-benchmarks is still really bad at reporing errors
 - Make sure that all the tests that you want to are passing
    `);

    process.exit(1);
  }
};

const executeBenchmark = async () => {
  const cacheSpinner = ora('Warming up cache').start();
  // warm up cache
  await runTests({ times: 2 });
  cacheSpinner.succeed();

  const testRunsSpinner = ora(`Test runs completed: 0/${NUM_RUNS}`).start();
  const results = await runTests({
    times: NUM_RUNS,
    onTestRunCompleted: ({ times }) => {
      testRunsSpinner.text = `Test runs completed: ${NUM_RUNS -
        times +
        1}/${NUM_RUNS}`;
    },
  });

  testRunsSpinner.succeed();

  const totalTime = results.reduce((sum, r) => sum + r, 0);
  const average = (totalTime / NUM_RUNS).toFixed(3);
  const max = results.reduce((max, r) => (r > max ? r : max), 0);
  const min = results.reduce((min, r) => (r < min ? r : min), Infinity);

  console.log();
  console.log(`Command: jest ${args.join(' ')}`);
  console.log(`Number of runs: ${NUM_RUNS}`);
  console.log(`Average: ${average}s`);
  console.log(`Max: ${max}s`);
  console.log(`Min: ${min}s`);
};

executeBenchmark();
