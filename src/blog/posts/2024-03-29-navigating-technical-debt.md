---
title: "Navigating Technical Debt"
thumbnail: 2024-03-29-navigating-technical-debt/thumbnail.avif #TODO: make it dynamic type
small-thumbnail: 2024-03-29-navigating-technical-debt/small-thumbnail.webp #TODO: make it dynamic type
tags: 
  - technical debt
  - csharp
  - python
  - git
---

We don't spend enough time doing maintenance! We have too much legacy code! We only build new features and never cleanup the old things we made! We have too much technical debt!
Sound familiar? If you have been involved in any meaningful software development project – especially one that is large – you will have heard complaints like this. 
It's a topic that many software developers (including yours truly) are passionate about.

<!-- excerpt -->

I would be willing to bet that if you surveyed random developers at a conference, you would find that the majority of them consider technical debt to be a significant problem in their organization.
I would also be willing to bet that they could not agree on **what the problem is** and **how to address it**.
The issue is further complicated by the fact that many businesses seem to not care about tech debt.

In this post I want to explore the idea of technical debt. What is it? Can we measure it? What can we do about it?

## What Is Technical Debt?
The term is used to describe things from "we don't use the shiny new framework" to "this code is not written in the style I like" and even "I inherited the code from someone else".
Let's start by looking at Ward Cunningham's original definition:

> Shipping first-time code is like going into debt. A little debt speeds development so long as it is paid back promptly with refactoring. 
> The danger occurs when the debt is not repaid. 
> Every minute spent on code that is not quite right for the programming task of the moment counts as interest on that debt.
> Entire engineering organizations can be brought to a stand-still under the debt load of an unfactored implementation, object-oriented or otherwise. 
> 
> *- Ward Cunningham*

This definition focuses on technical debt being a trade-off **when developing new features** and that **it is not always bad** as long as its addressed promptly. 
The problem though is that unlike financial debt, who is responsible for making sure an organization can handle more technical debt?
Can an organization be "technical debt" bankrupt? 
When organizations start thinking of this in terms of "debt" they quickly realize that there don't *seem* to be any consequences of the debt, so they ignore it.

Steve Freeman (whose work I first encountered in the wonderful book [Growing Object-Oriented Software, Guided by Tests](https://github.com/sf105/goos-code)) describes technical debt as an ["Unhedged Call Option"](https://higherorderlogic.com/programming/2023/10/06/bad-code-isnt-technical-debt-its-an-unhedged-call-option.html).

> Call options are a better model than debt for cruddy code (without tests) because they capture the unpredictability of what we do.
> If I pop in a feature without cleaning up then I get the benefit immediately, I collect the premium.
> If I never see that code again, then I’m ahead and, in retrospect, it would have been foolish to have spent time cleaning it up.
> 
> On the other hand, if a radical new feature comes in that I have to do, all those quick fixes suddenly become very expensive to work with. 
> Examples I’ve seen are a big new client that requires a port to a different platform, or a new regulatory requirement that needs a new report.
> I get equivalent problems if there’s a failure I have to interpret and fix just before a deadline, or the team members turn over completely and no-one remembers the tacit knowledge that helps the code make sense.
> The market has moved away from where I thought it was going to be and my option has been called.
> 
> *- Steve Freeman*

This definition highlights the **unpredictability of cost**.
Unlike debt – where we know what the interest rate will be – options could be infinitely more costly than doing the work in the first place.
I like this definition because it brings forth this idea that the cost can become due suddenly and without warning, and we need to understand where to focus our efforts because the "debt" is a disaster waiting to happen.


## Lensing To Understand Technical Debt
{% image "../img/2024-03-29-navigating-technical-debt/nasa-hubble-space-telescope-e9x-jhQgHZk-unsplash.jpg" "" "" "The Tarantula Nebula captured from The Hubble Space Telescope. – Photo by [NASA Hubble Space Telescope](https://unsplash.com/@hubblespacetelescope)" %}

Michael Feathers has a great post – [Lensing to Understand](https://michaelfeathers.substack.com/p/lensing-to-understand) – about how we change our focus to understand a system.
We focus on the high level system to identify potentially interesting areas and then drill down into details to investigate them.
Once we have a better understanding, we zoom back out to see how it affects the system as a whole.
The idea of "lensing" is really important when it comes to understanding technical debt.

In previous attempts of tacking technical debt, I have made the mistake of *starting* with a focus on very specific parts of a system.
Starting with a systems view and then drilling down into the details may be a better way to understand the system.
Where do people encounter the most issues?
Are some parts of the system riskier than others?
What parts of the system are most likely to change in the future?

These are the kinds of questions we need to be asking.
Too often we focus on bits of code and forget the context of the systems it's used in – which is extremely important.

So how do we identify risks in our codebase?
Adam Tornhill has a great talk on ["Prioritizing Technical Debt"](https://www.youtube.com/watch?v=w9YhmMPLQ4U) where he talks about how we can use metrics to identify risks in our codebase.
If we have a way to find out **where to focus our efforts** we can get a lot more value out of the work we do – **allowing us to ship quicker and build high quality features**.
I really liked this talk and I recommend watching it.

Adam has a few metrics that he uses to identify risks:
* **File Hotspots**: Files that are changed frequently
* **Method Hotspots**: Methods in hotspot files that are changed frequently
* **Complexity**: Files that are hard for humans to understand

If we find places that meet all three of these criteria we have a high risk area that we should focus on.

## Hotspot Analysis
To demonstrate application of these metrics I am going to run them on the [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) code – which is a C# library I wrote for a side project.

### File Hotspots
{% image "../img/2024-03-29-navigating-technical-debt/danny-mc-dAAdBZgREEg-unsplash.jpg" "" "" "Mountains in the distance – Photo by [Danny Mc](https://unsplash.com/@dannymc)" %}

Let's start with file hotspots.
I'm going to look at commits from the past year and see which files have been changed the most.
Turns out there is a simple bash command that can do this:

```bash
git log --since='1 year ago' --name-only --pretty=format: | sort | uniq -c | sort -nr
```

Running this on the [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) code gives the following results:
<details>
<summary>Data results (top 20, commit count per file for past year)</summary>

| Path                                                                 | Count |
|----------------------------------------------------------------------|-------|
| TwitchEverywhereCLI/TwitchConnection.cs                              | 46    |
| TwitchEverywhere/Implementation/TwitchConnector.cs                   | 36    |
| TwitchEverywhere.Benchmark/MsgBenchmark.cs                           | 20    |
| TwitchEverywhere/Implementation/MessagePlugins/MessagePluginUtils.cs | 18    |
| TwitchEverywhere/TwitchEverywhere.cs                                 | 14    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/NoticeTests.cs       | 13    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/PrivMsgTests.cs      | 13    |
| TwitchEverywhere/Implementation/MessageProcessor.cs                  | 13    |
| TwitchEverywhereCLI/Program.cs                                       | 12    |
| TwitchEverywhere.Rest/Implementation/RestApiService.cs               | 11    |
| TwitchEverywhere.Rest/RestClient.cs                                  | 11    |
| TwitchEverywhere/ITwitchConnector.cs                                 | 11    |
| TwitchEverywhere.Irc/Implementation/TwitchConnector.cs               | 10    |
| TwitchEverywhere.Rest/IRestApiService.cs                             | 10    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/ClearChatTests.cs    | 10    |
| TwitchEverywhere.Irc/Implementation/MessageProcessor.cs              | 9     |
| TwitchEverywhere/Implementation/MessagePlugins/ClearChatPlugin.cs    | 9     |
| TwitchEverywhere/Implementation/MessagePlugins/PrivMsgPlugin.cs      | 9     |
| TwitchEverywhere/Types/PrivMsg.cs                                    | 9     |
| TwitchEverywhere.Irc/ITwitchConnector.cs                             | 8     |

</details>

Data is nice, but it's hard to get a sense of the scale we are dealing with.
Let's use a small python script to create a visualization of these file commit counts sorted from highest to lowest:

<details>
<summary>Python script for plotting the csv to a horizontal bar chart</summary>

```python
import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV file
df = pd.read_csv("myFile.csv")

df_filtered = df[df['Key'].str.endswith('.cs')]
df_sorted = df_filtered.sort_values(by='Value', ascending=False)

# Plotting
plt.figure(figsize=(25,10), dpi=50)
plt.bar(df_sorted['Key'], df_sorted['Value'], color='#26196f')
plt.xlabel('File')
plt.ylabel('Number Of Commits')
plt.title('Most Modified File By Commit Count')
plt.xticks(ticks=plt.xticks()[0], labels=[''] * len(plt.xticks()[0])) # hide labels on x-axis
plt.show()
```

</details>

{% image "../img/2024-03-29-navigating-technical-debt/TwitchEverywhere-commit-count-per-file-cs.png" "Visualization of commit count per file for TwitchEverywhere as a bar chart" %}

Visualized like this there is a shocking revelation: a small percentage of files are responsible for the vast majority of commits!
What if I told you that the distribution of commits per file in a codebase is common across most codebases?
So common that it's a pattern that is seen regardless of factors like language, age, or size.
Sounds crazy right? But we can test if it is true.
I ran the file hotspot analysis on the following codebases:
* [ASP.NET Core (.cs files)](https://github.com/dotnet/aspnetcore)
* [Roslyn (.cs files)](https://github.com/dotnet/roslyn)
* [Django (.py files)](https://github.com/django/django)
* [Linux (.c files)](https://github.com/torvalds/linux)

<details>
<summary>Results for ASP.NET Core, Roslyn, Django and Linux</summary>
{% image "../img/2024-03-29-navigating-technical-debt/commit-counter-results/other-projects-commit-per-file.png" "Results for ASP.NET Core, Roslyn, Django and Linux showing very similar distributions" ""%}
</details>

What an interesting result.
If you are familiar with the [Pareto Principle](https://en.wikipedia.org/wiki/Pareto_principle) – these distributions certainly seems to resemble it.
It seems regardless of language, author, age and purpose – the same pattern emerges.
Why do you think this is the case?

People do things because they are incentivized to do them.
Adding to existing places is easier because we don't have to think about context, so it's faster to do.
The social system incentivizes us to do things fast, but it comes at the cost of other things.
There is a constant pressure to deliver features, and so the path of least resistance is very tempting.[^easier-to-add]

### Method Hotspots
{% image "../img/2024-03-29-navigating-technical-debt/ash-hayes-MV5ro8zkXys-unsplash.jpg" "" "" "Insect wings through a microscope lens – Photo by [Ash Hayes](https://unsplash.com/@ashley_hayes)" %}

From the previous example we saw that `TwitchConnection.cs` was by far the most commited to file in `TwitchEverywhere`.
We can use the following algorithm to find its hotspot methods:
1. Get the commits for the file in the given time range
2. Get the changes for the file in each commit
3. Compare the current commit and the next commit
4. Count the number of times each method was changed between commits
5. Sort the methods by the number of changes
6. Visualize the data

Finding method changes between commits (steps 3 and 4) using git is a little tricky – since it doesn't track methods.
In C# we can use `Roslyn` to get the changes for us and I created a small .NET project called [DebtCollector.NET](https://github.com/pureooze/DebtCollector.NET) that can be used for this.
It's a simple library that uses `LibGit2Sharp` to extract data out of git and `Roslyn` to process the code.

These are the results for the `TwitchConnection.cs` file:
{% image "../img/2024-03-29-navigating-technical-debt/TwitchEverywhere-commit-count-per-method.png" "Visualization of commit count per method in the most committed file as a bar chart" %}

<details>
<summary>Data table for xray results</summary>

| Method Name          | Count |
|----------------------|-------|
| MessageCallback      | 25    |
| ConnectToRestClient  | 11    |
| PrivMessageCallback  | 7     |
| ClearChatCallback    | 7     |
| Connect              | 5     |
| ConnectToIrcClient   | 5     |
| NoticeMsgCallback    | 4     |
| ClearMsgCallback     | 4     |
| WriteToStore         | 3     |
| SaveBufferToFile     | 3     |
| ConnectToIrcClientRx | 3     |
| WriteMessagesToStore | 2     |
| ClearMessageCallback | 2     |
| SaveBinaryDataToFile | 2     |

</details>

With this data its obvious I modify `MessageCallback` extremely often.
So this could be an interesting place to focus on during a refactoring session.

### Code Complexity
{% image "../img/2024-03-29-navigating-technical-debt/code-complexity.png" "" "" "Code complexity of the MessageCallback method with a score of 18 (mildly complex)" %}

Doing a cyclomatic complexity analysis on the `MessageCallback` method in [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) gives a score of 18 (mildly complex).
It's not too complex, but I know from experience that this method is modified a lot because I was lazy and didn't make separate methods for each message type.
The method signature even gives a hint to this.
Instead, all the logic is in one method and ends up being changed really often.
So that's something I can focus on when I refactor this file.

## Lensing With AI
What if we could use AI to connect the dots between the different lenses we have?
Like linking complexity ➡ global hotspots ➡ local hotspots.
Then we could view the system at a distance, ask questions about the different kinds of risks and then zoom in to see the details.

We have this kind of thing in photography already. We can take [extremely high resolution photographs](https://pf.bigpixel.cn/en-US.html)[^bigpixel] and have people zoom in and out as they please.
Why can't the same be done for code?

{% image "../img/2024-03-29-navigating-technical-debt/shanghai.jpg" "" "" "\"195 Billion Pixels to see Shanghai\" by BigPixel, Source: [https://pf.bigpixel.cn/en-US/pano/772196334345129984.html](https://pf.bigpixel.cn/en-US/pano/772196334345129984.html)[^bigpixel]" %}

Imagine being able to make a visualization of a codebase and then being able to zoom in and out to see different levels of detail.
This isn't a far-fetched idea and could be implemented using a "zoomable circle packing" chart with [D3.js](https://observablehq.com/@d3/zoomable-circle-packing).
And then being able to link relationships between files – like temporal coupling[^temporalcoupling] – could help us quickly understand the relationship between domains.

## No Silver Bullets
From experience, we have learned that a codebase with 100% coverage does not mean it is good.
Depending on code coverage as the sign of quality leads to tests that don't actually test anything or tests that were so brittle they broke on every change.
**There are no silver bullets when it comes to software development.**

Commit hotspots could be the result of a developer who likes to make a lot of commits.
Without context, it's hard to know if this is a problem in the specific situation.
Technical debt is a complex problem that can be hard to define and even harder to solve.
We can use metrics to identify these risks and communicate them effectively to others.
By empowering developers we make sure that the work is meaningful and impactful.

I hope this post has given you some ideas on how to navigate technical debt in your organization.
If you have any questions or comments feel free to reach out to me on [Mastodon](https://toot.community/@pureooze) or [GitHub](https://github.com/pureooze).

{% image "../img/2024-03-29-navigating-technical-debt/tackling-technical-debt.jpg" "Tackling technical debt" %}

## Additional Notes
[^wheatandchaff]: [to judge which people or things in a group are bad and which ones are good](https://www.merriam-webster.com/dictionary/separate%20the%20wheat%20from%20the%20chaff)
[^easier-to-add]: [Notes from Michael Feathers’ Brutal Refactoring](https://www.thekua.com/atwork/2011/05/notes-from-michael-feathers-brutal-refactoring/)
[^bigpixel]: This seems to only work in some browsers so if it doesn't work try a different browser (FWIW it worked in Firefox for me)
[^temporalcoupling]: When two things are considered coupled because they change at the same time. So if we change two files at the same time frequently it's likely there is some kind of coupling between them.