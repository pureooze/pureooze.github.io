---
title: "Unit Testing Browser Extensions"
thumbnail: 2018-05-21-unit-testing-browser-extensions/thumbnail.jpg #TODO: make it dynamic type
small-thumbnail: 2018-05-21-unit-testing-browser-extensions/small-thumbnail.jpg #TODO: make it dynamic type
tags: 
  - Browser Extensions
  - TDD
  - Testing
  - Javascript
---

In April I became the maintainer of Saka, a browser extension that allows users to search through their tabs, bookmarks and history. The original goal of Saka was to provide an elegant tab search but this soon evolved to include recently closed tabs, bookmarks and history when the original maintainer eejdoowad recognized that users search for tabs the same way they search bookmarks and history. This was an important insight and it has helped make Saka a valuable productivity tool.

When I became the maintainer I was surprised at the absence of tests in the project. There were several components with complicated logic but no tests to be found anywhere. One of the most important things I have learned as a developer is that tests are the easiest ways to write reliable, easy to refactor code. Was the old maintainer just lazy? Did he simply not care about the quality of his code? No. The opposite in fact, he cared a lot.

<!-- excerpt -->

**This post was originally posted on August 6th 2017. Things may have changed since then, and this post may no longer be accurate. Proceed with caution.**

{% image "../img/2018-05-21-unit-testing-browser-extensions/saka.gif" "" "" "Saka, a browser extension for searching tabs, recently closed, bookmarks and history." %}

The issue is that the lack of documentation on the topic means that almost no one is able to test their extension. Having no confidence in my ability to make changes without breaking the code, this was a big problem. But as fate would have it after trying a dozen different approaches I ended up finding a solution.

## Why We Test
As developers we want to be sure that the code we write today is not going to become a burden to maintain later in the lifetime of the application. One way we avoid creating these burdens is by writing tests. The great thing about tests is that outside of just verifying the behavior of functions, tests allow us to provide documentation for future developers. For example by creating unit tests we declare the valid inputs and outputs for a given function. This makes it easier to refactor code because we can have confidence that our code is working correctly when all our tests pass.

### The Testing Approach
This post will focus on setting up the environment and writing some basic unit tests. I have a separate post at [this link](../2018-08-16-integration-testing-browser-extensions-with-jest) which you can use to perform integration testing.

## Solution
In my search for a solution to testing Saka, I went through several different testing libraries like Jest, Mocha and Jasmine. One of the biggest challenges for me was that Saka is written using Preact, which causes compatibility issues with other libraries. But after following several examples online, I was finally able to put together a solution using Karma and Jasmine.

### Pre-requisites
In order to use this solution, your project should use Webpack. The example uses version 4 but this may still work with older versions. While I have not tried, it should be possible to make this work with Gulp after some configuration to make sure everything is bundled properly. You can find a sample webpack config [here](https://github.com/pureooze/extension-testing-example/blob/37e5a82cc436fc8256110600255145ad347340f1/webpack.config.js).

{% image "../img/2018-05-21-unit-testing-browser-extensions/tools.webp" "" "" "" %}

### Karma + Jasmine
If you are not already familiar with it, Karma is a tool that allows executing JavaScript code in a browser for testing purposes. While it can execute code, it is not capable of testing the code and instead relies on third party libraries like Jasmine and Mocha. When developing Saka I chose Jasmine because I had previous experience using it in other projects.

The first step to getting Karma and Jasmine setup is to install them:

```bash
yarn add jasmine karma karma-chrome-launcher karma-jasmine karma-spec-reporter karma-webpack babel-loader --dev
```

Before Karma can start running tests it needs to know what configuration parameters to use. In order to provide these, create a karma.conf.js file in the root of the project. I have provided a sample config here. Note that Karma is capable of running Jasmine on its own, it just needs to be told to use it via the frameworks configuration property.

### Chrome
Those of you who actually read the karma config may notice that it specifies Chrome as a requirement:

```bash
browsers: ["ChromeHeadless"]
```

As I mentioned earlier, Karma requires an actual browser to run the JavaScript code. This line tells Karma that it should look for Chrome on the system it is running on and launch it in headless mode. The benefits of using headless mode are that you can use the system when the tests are running, instead of being interrupted every 2 seconds when a new test starts to run. Seemed like an obvious win to me.

### Adding A Test
To start adding tests, create a JavaScript module using the code in [this example](https://github.com/pureooze/extension-testing-example/blob/4f047127a0735c5d97f3b4c6f2b46b063de61d55/src/simpleModule.js) under the src directory of your project. 
As the name suggests the sum function will simply add up all values passed to it and return the sum.

Create a test directory in the root of your project — this is where all the tests will live. 
Take a look at the karma config file and note [this line](https://github.com/pureooze/extension-testing-example/blob/4f047127a0735c5d97f3b4c6f2b46b063de61d55/karma.conf.js#L4).
It tells karma that to load the tests it must use the test/index.test.js file as the entry point. 
In the index.test.js file add [the following code](https://github.com/pureooze/extension-testing-example/blob/4f047127a0735c5d97f3b4c6f2b46b063de61d55/test/index.test.js) to import all files inside the test directory ending in .test.js.

With the config out of the way, add a new file simpleModule.test.js in the test directory with [the following code](https://github.com/pureooze/extension-testing-example/blob/4f047127a0735c5d97f3b4c6f2b46b063de61d55/test/simpleModule.test.js). 
This file will house the tests for all the functions in the simpleModule.js file. 
The describe blocks are used to categorize the tests in the Jasmine logs so that it is easier to tell which modules have failures. 
Individual tests are located within the it() function which needs a description as the first argument and the test function as the second argument. 
To learn more about how to write tests using Jasmine you can consult [the documentation](https://jasmine.github.io/api/3.0/global).

### Running Tests
In order to run tests the karma executable can be called directly with the path to the config file passed in as an argument. While this works, a more elegant solution is to add the command to the npm scripts in the package.json file like this. You should now be able to just run yarn test and see the output from Karma like below.

{% image "../img/2018-05-21-unit-testing-browser-extensions/runlog.webp" "" "" "" %}

### Testing With WebExtension APIs
The problem that developers run into when attempting to test extensions is having to deal with the WebExtension APIs in tests. The problem is that the environment the tests run in — that is as a webpage in chrome — does not have access to the APIs. This becomes an issue as Jasmine will throw an error because anything with browser.* will be undefined.

To overcome this issue you need to install [sinon-chrome](https://github.com/acvetkov/sinon-chrome), a library which enables mocking out these APIs.

```bash
yarn add sinon-chrome --dev
```

Create a new module in the src directory called popup.js with [the following code](https://github.com/pureooze/extension-testing-example/blob/master/src/popup.js). Notice how the getUrl function relies on the browser.runtime.getURL API. We are going to use sinon-chrome to mock the response the browser would return.

Create a new file called popup.test.js in the test directory to store all the tests for the popup.js file you just created. Add the following code to the test file and notice how the browser API is mocked by sinon-chrome. For every test that uses the WebExtension APIs, you must specify what each API should return when the test runner (Chrome) encounters it, allowing you to bypass the issue with the APIs not being defined.

Run yarn test and you should see the following results from the tests:

{% image "../img/2018-05-21-unit-testing-browser-extensions/runlog2.webp" "" "" "" %}

And there you are, free to test your chrome extension without having to fear the extension APIs.

## Future Work
While this setup with Karma, Jasmine and Chrome works, it is not an ideal solution. There are some benefits in using Jest, a modern testing library that runs entirely in Node thus eliminating the need for a test runner and browser. Unfortunately, Jest has some compatibility issues with Preact so for the time being I have put it on the back burner. Hopefully I can find some time to migrate the tests to use Jest because I think it will make for a good blog post.



