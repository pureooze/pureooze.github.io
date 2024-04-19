---
title: "Navigating Technical Debt"
thumbnail: 2024-03-29-navigating-technical-debt/thumbnail.avif #TODO: make it dynamic type
small-thumbnail: 2024-03-29-navigating-technical-debt/small-thumbnail.webp #TODO: make it dynamic type
tags: 
  - technical debt
  - csharp
---

We don't spend enough time doing maintenance! We have too much legacy code! We only build new features and never cleanup the old things we made! We have too much technical debt!
Sound familiar? If you have been involved in any meaningful software development project – especially one that is large – you will have heard complaints like this. 
It's a topic that many software developers (including yours truly) are passionate about.

<!-- excerpt -->

I would be willing to bet that if you surveyed random developers at a conference, you would find that the majority of them consider technical debt to be a significant problem in their organization.
I would also be willing to bet that they could not agree on **what the problem is** and **how to address it**.
The issue is further complicated by the fact that many businesses seem to not care about tech debt.


## What Is Technical Debt?
The term is used to describe things from "we don't use the shiny new framework" to "this code is not written in the style I like" and even "I inherited the code from someone else".
Let's start by looking at Ward Cunningham's original definition:

> Shipping first-time code is like going into debt. A little debt speeds development so long as it is paid back promptly with refactoring. 
> The danger occurs when the debt is not repaid. 
> Every minute spent on code that is not quite right for the programming task of the moment counts as interest on that debt.
> Entire engineering organizations can be brought to a stand-still under the debt load of an unfactored implementation, object-oriented or otherwise. 
> 
> *- Ward Cunningham*

This definition focuses on the idea that technical debt is a trade-off **when developing new features** and that **it is not always bad** as long as its addressed promptly. 
The problem though is that unlike financial debt – where creditors are responsible for determining if the debtor is able to take on more financial debt – who is responsible for making sure an organization can handle more technical debt?
Can an organization be "technical debt" bankrupt? 
When organizations start thinking of this in terms of "debt" they quickly realize that there don't *seem* to be any consequences of the debt, so they ignore it.

Steve Freeman (whose work I first encountered in the wonderful book [Growing Object-Oriented Software, Guided by Tests](https://github.com/sf105/goos-code)) describes technical debt as an ["Unhedged Call Option"](https://higherorderlogic.com/programming/2023/10/06/bad-code-isnt-technical-debt-its-an-unhedged-call-option.html):

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
I like this definition because it brings forth this idea that the cost can become due suddenly and without warning.
This means we need a quantifiable way to measure the risk in our codebase and understand where to focus our efforts because the "debt" is a disaster waiting to happen.

### Lensing To Understand Technical Debt
{% image "../img/2024-03-29-navigating-technical-debt/nasa-hubble-space-telescope-e9x-jhQgHZk-unsplash.jpg" "" "post-wide-image" "The Tarantula Nebula captured from The Hubble Space Telescope. – Photo by [NASA Hubble Space Telescope](https://unsplash.com/@hubblespacetelescope)" %}

The Hubble Space Telescope can capture images of all sorts of amazing things in space.
Among them are galaxies, nebulae and of course solar *systems*.
The data from the telescope can help us answer important questions like: which planets have water on them?
Instead of having to visit each planet, we can observe these interesting properties from a distance.

Michael Feathers made a blog post – [Lensing to Understand](https://michaelfeathers.substack.com/p/lensing-to-understand) – about how we change our focus to understand a system.
We focus on the high level system to identify potentially interesting areas and then drill down into details to investigate them.
Once we have a better understanding, we zoom back out to see how it affects the system as a whole.
The idea of "lensing" is really important when it comes to understanding technical debt.

> I mentioned that I’d love to have a tool that allows you to TL;DR articles at different levels of detail. 
> It would be like dynamically increasing and decreasing font size in an editor or a Kindle. 
> You adjust the size down when your vision is sharp and up when you are fatigued.
> 
> I’d love to be able to do this with detailed writing. 
> It would be great to be able to pull back and read a single page condensation of a 10 page article and then zoom in to see the concepts in 3 pages. 
> Yes, you can do that today with prompts in LLM chat interfaces but having a tool to do just that would be great.
>  
> *- Michael Feathers*

In previous attempts of tacking technical debt, I have made the mistake of *starting* with a focus on very specific parts of a system.
The code was weird/bad/confusing but there is often recency bias in the approach.
Starting with a systems view and then drilling down into the details may be a better way to understand the system.
Where do people encounter the most issues?
Are some parts of the system riskier than others?
What parts of the system are most likely to change in the future?

These are the kinds of questions we need to be asking.
Too often we focus on bits of code and forget the context of the systems it's used in – which is extremely important.

## How Do We Improve Technical Debt
So how do we identify risks in our codebase?
Adam Tornhill has a great talk on ["Prioritizing Technical Debt"](https://www.youtube.com/watch?v=w9YhmMPLQ4U) where he talks about how we can use metrics to identify risks in our codebase.
If we have a way to find out **where to focus our efforts** we can get a lot more value out of the work we do – **allowing us to ship quicker and build high quality features**.
I really liked this talk and I recommend watching it.

Adam has a few metrics that he uses to identify risks:
* **Commit Hotspots**: Files that are changed frequently
* **Hotspot Method X-Ray**: Methods in hotspot files that are changed frequently
* **Code Complexity**: Files that are hard for humans to understand

These are the different lenses we can use to understand the system.
They will help us identify *potential* risks in the system and give us a way to focus our efforts.

To help demonstrate application of these metrics I am going to run them on the [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) code – which is a C# library I wrote for a side project.

### Commit Hotspots
{% image "../img/2024-03-29-navigating-technical-debt/danny-mc-dAAdBZgREEg-unsplash.jpg" "" "post-wide-image" "Mountains in the distance – Photo by [Danny Mc](https://unsplash.com/@dannymc)" %}

Let's start with commit hotspots. 
These are files that are changed frequently in a given time period (say the past year) which could mean we will continue to change them in the future.
And it turns out there is a simple bash command that can do this:

```bash
git log --since='1 year ago' --name-only --pretty=format: | sort | uniq -c | sort -nr
```

Running this on the [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) code gives the following results:
<details>
<summary>Data results (top 20)</summary>

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

And now we get this nice visualization:
{% image "../img/2024-03-29-navigating-technical-debt/TwitchEverywhere-commit-count-per-file-cs.png" "Visualization of commit count per file for TwitchEverywhere as a bar chart" %}

Visualized like this there is a shocking revelation: a small percentage of files are responsible for the vast majority of commits!
If you are familiar with the [Pareto Principle](https://en.wikipedia.org/wiki/Pareto_principle) – a similar idea can be applied here.
You might think this pattern is specific to just the library that I ran this report against.

What if I told you this distribution is extremely common?
So common that it's a pattern that is seen in codebases regardless of factors like language, age, or size.
The only thing in common is that the code is written by humans.
Sounds crazy right? But we can test if it is true.
I ran this on the following codebases:
* [ASP.NET Core (.cs files)](https://github.com/dotnet/aspnetcore)
* [Roslyn (.cs files)](https://github.com/dotnet/roslyn)
* [Django (.py files)](https://github.com/django/django)
* [Linux (.c files)](https://github.com/torvalds/linux)

<details>
<summary>Results for ASP.NET Core, Roslyn, Django and Linux</summary>
{% image "../img/2024-03-29-navigating-technical-debt/commit-counter-results/other-projects-commit-per-file.png" "Results for ASP.NET Core, Roslyn, Django and Linux" %}
</details>

What an interesting result.
It seems regardless of language, author and purpose – the same pattern emerges.
But of course the big question is: why?
Something about this causes us to focus intensely on a small part of the codebase.

I've heard a story Michael Feathers once asked in a seminar: *"Is it easier for people to add code to existing place than to create a new method/class/etc? Why?"*
People do things because they are incentivized to do them.
Adding to existing places is easier because we don't have to think about the context of the code, and it's just faster to do.
The social system between developers and the codebase is the culprit.
There is a constant pressure to deliver features, and so the path of least resistance is very tempting.

But its worth mentioning: software is a living thing and so any analysis needs to be tempered with nuance.
Just because a file is changed frequently doesn't mean we should refactor it ASAP.
From my analysis of some of these projects the highest commited files are often code files, but they are also tests or files written in a different language/format (json, yml, etc.).
For example in `ASP.NET Core` the highest committed file is `FormWithParentBindingContextTest.cs`.

So there are two questions we can ask:
1. What parts of these files are being changed? 
   * Are all methods changed equally often?
   * In test files are there specific tests that are modified more often?
2. What is the temporal coupling between these files? (outside the scope of this post but an interesting question to ask!)

### Hotspot Methods
{% image "../img/2024-03-29-navigating-technical-debt/ash-hayes-MV5ro8zkXys-unsplash.jpg" "" "post-wide-image" "Insect wings through a microscope lens – Photo by [ Ash Hayes](https://unsplash.com/@ashley_hayes)" %}

The next metric on our list are method hotspots: if there are methods that change frequently we should focus our efforts on them.
It's costly to run this analysis on the whole codebase but once we have a few files to focus on (from the previous analysis), we can try and find the hotspots in them.

From the previous example we saw that `TwitchConnection.cs` was by far the most commited to file in `TwitchEverywhere`.
We can use the following algorithm to find its hotspot methods:
1. Get the commits for the file in the given time range
2. Get the changes for each commit
3. Compare the current commit and the next commit
4. Count the number of times each method was changed between commits
5. Sort the methods by the number of changes
6. Visualize the data

Finding method changes between commits (steps 3 and 4) using git is a little tricky – since it doesn't track methods.
There are some hacky ways to try and work around this but in C# we can use `Roslyn` to get the changes for us.
The implementation for this is a little more complex than the first example, so I created a small .NET project called [DebtCollector.NET](https://github.com/pureooze/DebtCollector.NET) that can be used for this.
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

With this data we can see the `MessageCallback` method is something that developers work with extremely often! 
So we can focus on that when looking to do refactors!

### Code Complexity
So what about code complexity?

## Communicate With Others

When it comes to **technical metrics** we need to be careful how we communicate them to others.
It's vital to ensure metrics don't become the goal – the goal is always to deliver software safer and faster.
If you've ever worked with code coverage you might have experienced the pain of people becoming obsessed with it to the point where it's no longer useful. Metrics are a tool to help us make decisions.

### Code Coverage
Relying on code coverage as an indicator of quality can lead to bad practices like writing tests that don't actually test anything or writing tests that are so brittle they break on every change.
To me code coverage is most effective when working on the edge of a system – like connecting to a database.
These areas are often high risk because a lot of things can go wrong talking to other systems [^2] and code coverage can help us be sure the system doesn't explode at these integration points.

But in the other parts of the system this can be harmful because it creates coupling to the current business logic – which will likely change in the future.
And when the time to change comes, the tests can be a hindrance rather than a help.

{% image "../img/2024-03-29-navigating-technical-debt/effort-vs-value.png" "Effort vs value of code coverage: As the coverage percent increases the effort increases exponentially" "" "[Jeroen Mols : The 100% code coverage problem](https://jeroenmols.com/blog/2017/11/28/coveragproblem/)" %}

### Context Is Key
If we focus on the metrics themselves we can lose sight of the goal: to deliver high quality software quickly.
Metrics should help us make decisions and not be a mandatory target we have to hit.
Ever have your boss say something like "We need to get our code coverage to 100%" because they equate it to quality?
We want to avoid that kind of misunderstanding.

When communicating "tech debt metrics" to others it's important to help them understand the context of the data.
To this extent you might not want dashboards for these metrics.
Instead, strive to have technical people involved in the conversation to help make decisions based on the data. Commit hotspots could be the result of a developer who likes to make a lot of commits.
Without technical context, it's hard to know if this is a problem in the specific situation.

### Empowering Developers
In teams that I have been a part of we found a lot of success by making maintenance a part of the planning process.
We designate one developer – through a [rigorous selection process](https://wheelofnames.com/) – who is expected to work on tech debt one day that week.
There is a curated list of tasks that the team has prioritized and the lucky winner can choose from that list or something else they think is important.

This is where the hotspot metrics can be really useful.
The developer can run the report on a repo – or even a subset of the repo – and then focus on the areas that are most risky. It allows them to quickly answer the question: **Which part of this domain can I have the most impact on?**
Refactoring in hotspots is also satisfying because the work has a direct impact on the experience of other developers.

## How can we use AI to help us with this process?

## Conclusion
Technical debt is a complex problem that can be hard to define and even harder to solve.
Focusing on hotspots should help us deliver high quality software quickly[^4].
We can use metrics to identify these risks and communicate them effectively to others.
By empowering developers we can make sure that the work is meaningful and impactful.

{% image "../img/2024-03-29-navigating-technical-debt/tackling-technical-debt.jpg" "Tackling technical debt" %}

I hope this post has given you some ideas on how to navigate technical debt in your organization.
If you have any questions or comments feel free to reach out to me on [Mastodon](https://toot.community/@pureooze) or [GitHub](https://github.com/pureooze).

## Additional Notes
[^1]: [https://science.nasa.gov/mission/hubble/observatory/design/optics/](https://science.nasa.gov/mission/hubble/observatory/design/optics/)
[^2]: Things like network errors, api contract changes, version mismatch, protocol mismatch, etc.
[^4]: If you implement the things described in this post, and it doesn't seem to work/be useful that can be a sign that your situation is different from what is described here
[^5]: There is also potential for "Temporal coupling" – when two things are coupled because they change at the same time. So if we change two files at the same time frequently it's likely there is some kind of coupling between them.
