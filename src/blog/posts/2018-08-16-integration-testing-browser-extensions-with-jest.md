---
title: "Integration Testing Browser Extensions with Jest"
thumbnail: 2018-08-16-integration-testing-browser-extensions-with-jest/thumbnail.jpg #TODO: make it dynamic type
small-thumbnail: 2018-08-16-integration-testing-browser-extensions-with-jest/small-thumbnail.jpg #TODO: make it dynamic type
tags: 
  - Browser Extensions
  - TDD
  - Testing
  - Javascript
---

Previously I wrote about how I became the maintainer of Saka, an open source browser extension that allows users to search through and load open tabs, browsing history and bookmarks. I talked about how I came up with a solution for unit testing the extension to give me confidence with code changes. I also mentioned that there were issues with integration testing that I ran into which made it difficult to test components that relied on browser APIs.

<!-- excerpt -->

**This post was originally posted on August 6th 2017. Things may have changed since then, and this post may no longer be accurate. Proceed with caution.**

Today I am happy to report that I have found a way to perform integration testing on extensions and want to share it with you in this post. But before we go down that particular rabbit hole lets first discuss integration testing and why it is useful for validating software.

## The Testing Trophy
{% image "../img/2018-08-16-integration-testing-browser-extensions-with-jest/testing-trophy.webp" "" "" "https://twitter.com/kentcdodds/status/960723172591992832" %}

Kent C. Dodds has written about something he calls the ‘Testing Trophy’. If you have heard of the testing pyramid before this is a similar concept — it’s a visualization of how you should prioritize the different types of testing in applications. The title of Kent’s post says it all:

> Write tests. Not too many. Mostly integration.

Why does he say this? Kent notes the problem with unit tests is that they only prove individual units work as expected— they do not prove that the units can work together as a whole. Integration testing on the other hand proves that all the components in our project can actually work together as expected.

## The Need For Integration Testing
Let’s leave the world of software and look at a real world example. Suppose we wanted to build a sink for a bathroom. There are 4 components to this sink: the faucet, the basin, the drainage system and the water line. Since the drain and water line come with the building we only need to worry about adding the faucet and the basin.

We go to the store and pick a faucet and basin that we like. We bring them on site and assemble each individually. We confirm that the faucet and basin each work as expected and that they have no defects. Finally we assemble the full sink — hooking up the faucet to the water line and the basin to the drainage. After all our labor we are excited to see our sink in action so we turn on the faucet and what happens? Well…

{% image "../img/2018-08-16-integration-testing-browser-extensions-with-jest/sink.gif" "" "" "https://natooktesting.wordpress.com/2017/08/24/x-unit-tests-0-integration-tests/" %}

Oops! While we did check to see that the faucet and basin work on their own we forgot to check if the two were actually compatible. This is why integration testing is valuable — it proves that different components, modules and libraries work together as expected.

## Solution
Since writing my last post I have managed to get Jest working with Preact, the framework used to create Saka. Jest is a modern testing framework that can run in Node or JSDOM. I will also be using the dom-testing-library to perform the rendering and assertions on my components.

Just keep in mind that while my specific solutions will be tailored for Preact, they will still work for other frameworks — especially React — with slight modifications for framework specific libraries.

There is an example Preact extension with Jest setup for reference here: https://github.com/pureooze/extension-testing-example

### Installation
**You don’t need to install the preact packages if you use a different framework**

First you need to install the required dependencies:

```bash
yarn add --dev babel-jest babel-plugin-transform-class-properties babel-plugin-transform-react-jsx babel-preset-env babel-preset-react jest sinon-chrome
```

If you are using Preact you need to also run the following:

```bash
yarn add --dev preact-compat preact-render-to-string preact-test-utils preact-testing-library
```

Note that just like in the previous post we will be using sinon-chrome to mock all browser APIs.

### Configuration Jest (for Preact only, not required for React)
With Jest installed you now need to create a config to tell jest how to deal with parsing Preact. If you use another framework like React you don’t need to do this. Create a jest.config.js file in the root directory of your project with the following contents:

```js
module.exports = {
  moduleNameMapper: {
    "^react-dom/server$":
      "<rootDir>/node_modules/preact-render-to-string/dist/index.js",
    "^react-addons-test-utils$":
      "<rootDir>/node_modules/preact-test-utils/lib/index.js",
    "^react$": "<rootDir>/node_modules/preact-compat/lib/index.js",
    "^react-dom$": "<rootDir>/node_modules/preact-compat/lib/index.js"
  },
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.jsx?$": "<rootDir>/jest.transform.js"
  }
};
```

Notice the transform property is telling Jest to apply a custom transformer on all JSX files. To make it work we also need to create a jest.transform.js file:

```js
const babelOptions = {
  presets: [["env", { targets: { node: "8" } }], "react"],
  plugins: [
    [
      "transform-react-jsx",
      {
        pragma: "h"
      }
    ]
  ]
};
module.exports = require("babel-jest").createTransformer(babelOptions);
```

### Create The Commands
Add the following npm scripts to your package.json so that jest can be run from the command line:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Create The First Test
Jest is smart enough to scan your project and run any files it finds with the .test.js extension. Create a new file called Main.test.js in the tests directory of your project with the following contents where the import Main is the component you want to test:

```js
import { h } from "preact";
import { render, cleanup } from "preact-testing-library";
import Main from "../src/example/index";
import chrome from "sinon-chrome";

window.chrome = chrome;

test("should render Main component", () => {
  const getUrl = function() {
    return chrome.runtime.getURL("popup-content.html");
  };
  chrome.runtime.getURL.returns("http://localhost:1234/index.html");
  const { container } = render(<Main getUrl={getUrl} />);
  expect(container).toMatchSnapshot();
});
```

Once the file is created, open a terminal in the root of your project and run the command:

```bash
yarn test:watch
```

You should see jest output something similar to this (assuming the test you created passed):
    
{% image "../img/2018-08-16-integration-testing-browser-extensions-with-jest/jest-output.webp" "" "" "" %}

Congrats! Jest has successfully run and created a snapshot for the test. Jest has created a __snapshots__ directory where all the snapshots are stored. If you open one of them you will see something like this:

```js
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`should render Main component 1`] = `
<div>
  <div>
    <button
      id="changeColor"
    />
    <b>
      http://localhost:1234/index.html
    </b>
    ;
  </div>
</div>
`;
```

The next time the test runs, Jest will compare the existing snapshot to the snapshot it takes at runtime and notify you if a difference is detected.

## Conclusion
Integration testing is valuable when we want to assert the compatibility of the components we create. As Kent C. Dodds writes:

> Write tests. Not too many. Mostly integration.

You can use Jest to achieve this for modern Javascript projects and browser extensions are no different. With the help of sinon-chrome you can mock out any extension APIs that are used by your components.

