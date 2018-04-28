# testcafe-reporter-toucan
[![Build Status](https://travis-ci.org/djbreen7/testcafe-reporter-toucan.svg)](https://travis-ci.org/djbreen7/testcafe-reporter-toucan)

This is the **toucan** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/djbreen7/testcafe-reporter-toucan/master/media/preview.png" alt="preview" />
</p>

## IMPORTANT
This reporter only works with an organization's private application software. You won't be able to use this successfull unless you're one of my 19 co-workers. :). Maybe someday!

## Install

```
npm i testcafe-reporter-toucan
```

## TODO
- Automate getting ToucanTesting Token:  
A script can probably be run TeamCity that gets the token and passes it in rather than having to manually enter it.
- Automate getting TestSuiteId and Remove from Arguments
- Automate getting TestModuleId and Remove from Arguments
- Research better methods for associating a TestCase with its TestResult

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter toucan
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('toucan') // <-
    .run();
```

## Author
Daniel Breen (http://toucantesting.com)
