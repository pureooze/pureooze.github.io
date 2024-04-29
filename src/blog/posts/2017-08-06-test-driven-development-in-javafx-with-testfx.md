---
title: "Test Driven Development In JavaFX With TestFX"
thumbnail: 2017-08-06-test-driven-development-in-javafx-with-testfx/thumbnail.jpg #TODO: make it dynamic type
small-thumbnail: 2017-08-06-test-driven-development-in-javafx-with-testfx/small-thumbnail.jpg #TODO: make it dynamic type
tags: 
  - TestFX
  - TDD
  - Testing
  - JavaFX
---

A dive into how to test JavaFX applications using TestFX.

If you just want to read about how to use TestFX skip to the "Setting Up Our Application" section.

<!-- excerpt -->

**This post was originally posted on August 6th 2017. Things may have changed since then, and this post may no longer be accurate. Proceed with caution.**

I recently started working at a company that has a very heavy reliance on Java applications. 
As a primarily Python, Javascript and C++ developer, I had not used Java for a few years so given the obvious fact that I would have to get comfortable with using Java on a day to day basis, I decided to work on a small project in Java to get my feet wet.

## The Application
While thinking about possible project ideas for this Java application I browsed through my Github repos and saw an all too familiar project, a podcast feed aggregator/player that I had worked on with some friends. 
The application was written using Qt 5.8 and was capable of fetching RSS feeds for any audio podcast on iTunes, stream episodes and render the HTML contents associated to an individual episode. 
The links shown below in the right hand side widget would also open in the default system browser when clicked on by a user.

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/podcastfeed.webp" "" "" "Screenshot of the original PodcastFeed application. On the left is the podcast list, the middle is the episode list (contents change based on selected podcast) and the right is the description rendering for each individual episode." %}

While the application looks pretty simple (and it is) the fun of developing this came from working with two friends to learn Qt while also developing the application quickly and in a small amount of time. 
The reason I considered rewriting this application in Java was because the code we originally wrote had several flaws (keep in mind we developed it in a very short amount of time):

* We wrote zero tests for the application (Yikes!!)
* Classes were an after thought, they were not part of the initial design
* Due to the above the functions were very tightly coupled
* Tight Coupling made it very difficult to modify core processes of the application (like XML parsing) without breaking other features

## The Approach - TDD
Given the flaws mentioned above it became clear to me that I would need to take a different approach to this new application if I wanted any hope of being able to maintain it for any reasonable amount of time. 
For help with how to approach this application design I turned to a book I had been reading recently: _**Growing Object-Oriented Software, Guided by Tests by Steve Freeman and Nat Pryce**_.

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/goos.webp" "" "" "Tests are a core part of development, and this book is a great source of knowledge about how to create good tests." %}

This book is a fantastic read if you want to learn about what makes Test Driven Development a powerful tool for use in Object Oriented development. 
The authors provide a lot of deep insight on why tests are important, what kind of tests should be used when and how one writes expressive, easy to understand tests. 
I will spare the details on TDD but you can google it or read the book above to learn more about it.

The authors of the book continuously stress the importance of using End to End tests because of their ability to test the full development, integration and deployment processes in an organization. 
I myself do not have automated build systems such as Atlassian’s Bamboo system so my automation capabilities are limited, but I can make use of Unit tests to test individual functions and UI Tests to try and get as much End to End coverage (between the local application and the podcast data on the Internet) as possible.

## Setting Up Our Application
Getting a JavaFX project working with TestFX 4 is actually quite simple but a lot of the challenges working with TestFX actually come from the lack of documentation by the TestFX developers. 
TestFX 4 in particular has at the time of writing, almost no clear documentation available. Please note that for the rest of this post I will be using examples involving IntelliJ. 
If you use a different IDE you may have to adjust certain steps to match your environment.

To start off, lets create a JavaFX project in IntelliJ. 
Once the project is created, press `Shift + F10` to run it to make sure it is working. 
If you get an error at this step you may have configured your Java/JavaFX environment incorrectly.

The `Main.java` file is the one that will run at the very start of execution. 
It will kick off the application as well as create any widgets and scenes we specify. 
By default it looks something like this:

```java
package sample;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception{
        Parent root = FXMLLoader.load(getClass().getResource("sample.fxml"));
        primaryStage.setTitle("Hello World");
        primaryStage.setScene(new Scene(root, 300, 275));
        primaryStage.show();
    }


    public static void main(String[] args) {
        launch(args);
    }
}
```

Copy the following into the sample.fxml file, this will serve as the widget layout for the application:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<?import javafx.scene.control.Button?>
<?import javafx.scene.control.Label?>
<?import javafx.scene.control.TextField?>
<?import javafx.scene.layout.AnchorPane?>
<?import javafx.scene.layout.ColumnConstraints?>
<?import javafx.scene.layout.GridPane?>
<?import javafx.scene.layout.RowConstraints?>


<GridPane alignment="center" hgap="10" vgap="10" xmlns:fx="http://javafx.com/fxml/1" xmlns="http://javafx.com/javafx/8.0.111" fx:controller="sample.Controller">
   <children>
            <TextField layoutX="15.0" layoutY="25.0" fx:id="inputField" />
            <Label layoutX="15.0" layoutY="84.0" text="TEXT GOES HERE" fx:id="label" />
            <Button layoutX="124.0" layoutY="160.0" mnemonicParsing="false" text="Apply" onAction="#applyButtonClicked" fx:id="applyButton" />
   </children>
</GridPane>
```

Now copy the following into the Controller.java file. 
By binding the FXML file to the Controller with the use of the fx:controller tag, we can dictate behavior for our application using Java code.

```java
package sample;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;

public class Controller {

  @FXML
  TextField inputField;

  @FXML
  Label label;

  @FXML
  Button applyButton;

  public void applyButtonClicked () {
    label.setText(inputField.getText());
  }
}
```

Run the application again (press Shift + F10) and verify that entering text into the input field and then clicking the apply button causes it to be copied into the label like so:

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/app.webp" "" "" "" %}

It is clear the application runs in a very basic use case so TestFX can now be used to create UI tests to validate this belief.

## Setting Up TestFX
To start using TestFX the first step is to import the library into a project. 
IntelliJ makes this pretty easy, just click `File > Project Structure`. 
In the window that pops up, click `Libraries > the green plus sign > From Maven`. 
In the popup window search for testfx and select testfx-junit:4.0.6 like below and click OK:

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/download-library.webp" "" "" "" %}

Repeat the steps above and add _testfx-core:4.0.6_, _hamcrest-junit:2.0.0.0_, _junit:4.12_, _loadui:testFx:3.1.2_ and _guava:14.0.1_ to the project. 
You should have the following in the libraries pane now:

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/libraries.webp" "" "" "" %}

Now we need to create a directory to place our tests in. 
IntelliJ provides a really easy way to do this. 
Right click the project name in the `Project Pane > New > Directory` and name this new directory `tests`. 
Now right click this newly created directory and `Mark Directory As > Tests Sources Root`. 
Once that is done, open up `Main.java` and click on the class name:

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/main.java.webp" "" "" "" %}

Press `ALT + Enter > Create Test`. 
Now you can configure what you want to use to run these tests but for now the default will suffice. 
Click OK.

{% image "../img/2017-08-06-test-driven-development-in-javafx-with-testfx/create-test.webp" "" "" "" %}

There should now be a new file called MainTest.java in the tests directory. 
This file will should house all the tests related to the Main.java file (ie. the full UI application). 
To begin using TestFX we need to first make some changes to our test file. 
Recall that in Main.java, the Main class extends the Application class. 
Likewise when we want to use TestFX to perform testing of our Main class, we must extend the ApplicationTest class from the org.testfx.framework package.

IntelliJ now warns us that the ApplicationTest class requires that we implement a start(Stage) method, so lets do that:

```java
@Override
public void start (Stage stage) throws Exception {
  Parent mainNode = FXMLLoader.load(Main.class.getResource("sample.fxml"));
  stage.setScene(new Scene(mainNode));
  stage.show();
  stage.toFront();
}
```

We have to create mainNode in order to allow us to refresh the application after each test has run, this will ensure that we never have stale data from a previous test causing unexpected errors in our tests. 
Now we should implement our setUp and tearDown methods, to tell TestFX what it should do before and after it has run a test. 
Its important to do this because you want to ensure that your test environment is consistent with what you expect it to be “in the real world”. 
In our case the setUp method is empty as we don’t need to prep anything before we run a test, but as applications get more complex it becomes vital to make use of this method.

```java
@Before
public void setUp () throws Exception {
}

@After
public void tearDown () throws Exception {
  FxToolkit.hideStage();
  release(new KeyCode[]{});
  release(new MouseButton[]{});
}
```

## Writing Our First Test
At long last we can start writing a test! Lets begin with a simple one that just enters text into our inputField.

<details>
<summary>Click to see the code</summary>

```java
package sample;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import javafx.scene.input.MouseButton;
import javafx.stage.Stage;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.testfx.api.FxToolkit;
import org.testfx.framework.junit.ApplicationTest;

import static org.junit.Assert.*;

public class MainTest extends ApplicationTest {

  @Override
  public void start (Stage stage) throws Exception {
    Parent mainNode = FXMLLoader.load(Main.class.getResource("sample.fxml"));
    stage.setScene(new Scene(mainNode));
    stage.show();
    stage.toFront();
  }

  @Before
  public void setUp () throws Exception {
  }

  @After
  public void tearDown () throws Exception {
    FxToolkit.hideStage();
    release(new KeyCode[]{});
    release(new MouseButton[]{});
  }

  @Test
  public void testEnglishInput () {
    clickOn("#inputField");
    write("This is a test!");
  }

}
```

</details>

Now we can try running this test by right clicking the tests directory and clicking Run ‘All Tests’ and you should see something like this:

<video controls>
  <source src="../../../video/2017-08-06-test-driven-development-in-javafx-with-testfx/test-running.mp4" type="video/mp4">
</video>

Great! We just got our first UI test to work. Now lets actually make it test our applications functionality:

```java
@Test
public void testEnglishInput () {
  Label label = (Label) GuiTest.find("#label");

  clickOn("#inputField");
  write("This is a test!");
  clickOn("#applyButton");
  assertThat(label.getText(), is("This is a test!"));
}
```

This new version of the test will now click the Apply button after entering the text into our inputField and then attempt to assert that the label is actually set to the desired message (what we input) and not something else. 
Running this test now confirms our belief that our application functions as expected, thus ensuring that if we were to update our code the test would help us validate the functionality.

On a side note, notice that the assert statement is written in a format that reads very naturally in English. If we read it out we get something like "Assert that label.getText is MESSAGE". 
In the Growing Object Oriented book by Freeman and Pryce they discuss the importance of writing tests in this format to make them easy to read.

To finish off lets write some more tests for two additional cases. We will test French and numerical inputs.

```java
@Test
public void testFrenchInput () {
  Label label = (Label) GuiTest.find("#label");

  clickOn("#inputField");
  write("C'est un test!");
  clickOn("#applyButton");
  assertThat(label.getText(), is("C'est un test!"));
}

@Test
public void testNumericalInput () {
  Label label = (Label) GuiTest.find("#label");

  clickOn("#inputField");
  write("123456789");
  clickOn("#applyButton");
  assertThat(label.getText(), is("123456789"));
}
```

Now when we run all our tests TestFX will automatically reset our application state so that our changes from the previous test do not cause errors when then next test begins.

<video controls>
  <source src="../../../video/2017-08-06-test-driven-development-in-javafx-with-testfx/test-running2.mp4" type="video/mp4">
</video>

As we can see TestFX is a very powerful framework for testing JavaFX applications. 
While it does lack documentation, TestFX has in my own experience provided a lot of value when I am trying to ensure that the feature of my application are working as intended. 
Compared to my experiences in developing a UI with Qt and no UI Testing, this project with JavaFX and TestFX has been a far more enjoyable one.


