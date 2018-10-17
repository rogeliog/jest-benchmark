# jest-benchmarks

A simple way to run benchmarks on Jest

```
npx jest-benchmarks
```

Number of runs: 1 Average: 2.879s Max: 2.879s Min: 2.879s

## Options

### args

Any arguments provided will be passed to the jest process.

For example

```
npx jest-benchmarks my-tests
```

will run only the tests matching `my-tests`

### NUM_RUNS

By default `jest-benchmarks` runs the tests 10 times. You can modify with the `NUM_RUNS` environment variable

```
NUM_RUNS=100 npx jest-benchmarks
```

### JEST_BIN

By default `jest-benchmarks` uses `node_modules/.bin/jest` as the Jest binary. You can modify with the `JEST_BIN` environment variable

```
JEST_BIN=/usr/local/bin/jest npx jest-benchmarks
```
