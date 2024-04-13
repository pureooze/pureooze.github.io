---
layout: layouts/post.liquid
title: "Navigating Technical Debt"
thumbnail: /blog/img/2024-03-29-navigating-technical-debt/thumbnail.avif #TODO: make it dynamic type
tags: 
  - technical debt
  - csharp
---

## Introduction
We don't spend enough time doing maintenance! We have too much legacy code! We only build new features and never cleanup the old things we made! We have too much technical debt!
Sound familiar? If you have been involved in any meaningful software development project – especially one that is large – you will have heard complaints like this. 
It's a topic that many software developers (including yours truly) are passionate about.

I would be willing to bet that if you surveyed random developers at a conference, you would find that the majority of them consider technical debt to be a significant problem in their organization.
I would also be willing to bet that they could not agree on **what the problem is** and **how to address it**.
Some people may say they need dedicated time in sprints for maintenance, others may say they want dedicated sprints specifically for technical debt and some really radical individuals may even say they need to pause feature work to focus on tech debt!

The issue is further complicated by the fact that many businesses seem to not care about tech debt.
They view it as a waste of time because it doesn't create new value (features) for customers or reduce costs significantly.
It might seem unreasonable to many developers, but I can see why a business would have this point of view.
Why should we spend time doing things that don't improve the one thing companies actually care about: the bottom line.

So to make meaningful impact I think we need to focus on three things: have a definition for technical debt that illustrates its significance, create measurable ways to improve the technical debt and communicate this to the business effectively.

## What Is Technical Debt?
A surprising amount of people have differing definitions of "technical debt".
It is used to describe things from "we don't use the shiny new framework" to "this code is not written in the style I like" and even "I inherited the code from someone else".
Let's start by looking at Ward Cunningham's original definition:

> Shipping first-time code is like going into debt. A little debt speeds development so long as it is paid back promptly with refactoring. 
> The danger occurs when the debt is not repaid. 
> Every minute spent on code that is not quite right for the programming task of the moment counts as interest on that debt.
> Entire engineering organizations can be brought to a stand-still under the debt load of an unfactored implementation, object-oriented or otherwise. 
> 
> *- Ward Cunningham*

This definition focuses on the idea that technical debt is a trade-off **when developing new features** and that **it is not always bad**. 
As long as you are planning to pay of the debt promptly the "interest" will be manageable.
In this sense it can be good when we intentionally take on debt to speed up development.
For example, we could have an initial implementation that isn't ideal, but we merge it to unblock other developers.
Then we immediately focus on bringing the implementation closer to our ideal state.

The problem though is unlike financial debt – where creditors are responsible for determining if the debtor is able to take on more financial debt – who is responsible for making sure an organization can handle more technical debt?
When organizations start thinking of this in terms of "debt" they quickly realize that there don't seem to be any consequences of the debt.
I can hear them saying: *"Oh we took a shortcut on project XYZ, and it caused no issues but saved us months of work? Well we are going to do that again!"*.
This may be because the project hasn't been enabled in production long enough (or at all 😱) and given more time it will cause issues.

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

With these two definitions I think this is a good way to describe "tech debt":
> In order to deliver software on a given deadline we must incur some risk.
> This risk can present itself in several ways like a lack of tests, brittle code or a very confusing implementation[^1].
> We can choose to take on this risk for immediate gains as long as we intend to address it in the very near future.
> Putting off dealing with the risk for longer may cause an infinitely more expensive payment if unforeseen requirements – like regulatory changes – emerge.

Naturally this means we need a way to determine: Where are the risks? Are some parts riskier than others?
We should also be able to figure out any risks in the code we wrote in the past and the code we will write in the future.

## How Do We Improve Technical Debt
So how do we identify risks in our codebase?
There are many ways to measure it, but I think it can be helpful to focus on a few metrics that we can run quickly and frequently to have tight feedback loops on when things are getting out of hand.

Adam Tornhill has a great talk on ["Prioritizing Technical Debt"](https://www.youtube.com/watch?v=w9YhmMPLQ4U) where he talks about how we can use metrics to identify risks in our codebase.
If we have a way to find out **where to focus our efforts** we can get a lot more value out of the work we do – **allowing us to ship quicker and build high quality features**.
I really liked this talk and I recommend watching it on YouTube [here](https://www.youtube.com/watch?v=w9YhmMPLQ4U).

He has a few metrics that he uses to identify risks:
* **Commit Hotspots**: Files that are changed frequently
* **Hotspot Method X-Ray**: Methods in hotspot files that are changed frequently
* **Code Complexity**: Files that are hard for humans to understand

The first two (hotspots and method x-ray) are great metrics to start with, and it turns out it's not too hard to get these metrics out of a git repository.
The last one (code complexity) is a bit trickier, so I will leave that as an exercise for the reader (and for me at a later date 😉).

To help demonstrate the value of these metrics I am going to run them on the [TwitchEverywhere](https://github.com/pureooze/TwitchEverywhere) code – which is a C# library I wrote for a side project.
I also created a small .NET library called [DebtCollector.NET](https://github.com/pureooze/DebtCollector.NET) that can be used to get these metrics out of a C# git repository.
It's a simple library that uses `LibGit2Sharp` to extract data out of git and `Roslyn` to process code and output data for the metrics described above.

### Commit Hotspots
Let's start with commit hotspots. 
These are files that are changed frequently in a given time period (say the past year) which could mean we will continue to change them in the future.
And it turns out there is a simple bash command that can do this:

```bash
git log --since='1 year ago' --name-only --pretty=format: | sort | uniq -c | sort -nr
```

This is a language neutral way to get the hotspot data but if we use a language specific tool we can build on it to get more insights (more on that in a bit).
I'm going to focus on C# for these language specific examples to illustrate how it works, but this should be doable in other languages as well.

We can use `LibGit2Sharp` to get data out of `git` and then process it using LINQ:

<details>

<summary>C# example for GetFilesSortedByCommitCount for the last 365 days</summary>

```csharp
using LibGit2Sharp;

namespace CommitHotspots;

public abstract class CommitHotspots {

    public static IOrderedEnumerable<KeyValuePair<string,int>> GetCommitHotspotFiles( 
        string pathToRepo 
    ) {

        DateTimeOffset since = DateTimeOffset.Now.AddYears(-1);

        using Repository repo = new(pathToRepo);
        CommitFilter filter = new() {
            IncludeReachableFrom = repo.Branches
        };

        ICommitLog? commitLog = repo.Commits.QueryBy( filter );
        IEnumerable<Commit> commits = commitLog.Where( c => c.Committer.When > since );

        Dictionary<string, int> fileCommitCounts = new();
            
        foreach (Commit commit in commits) {
            foreach (Commit? parent in commit.Parents) {
                TreeChanges? changesSincePreviousCommit = repo.Diff.Compare<TreeChanges>( 
                    oldTree: parent.Tree, 
                    newTree: commit.Tree 
                );
                    
                foreach (TreeEntryChanges? change in changesSincePreviousCommit) {
                    if (!fileCommitCounts.TryAdd( change.Path, 1 )) {
                        fileCommitCounts[change.Path]++;
                    }
                }
            }
        }
        
        return fileCommitCounts.OrderByDescending( x => x.Value );
    }
}
```

</details>

<details>
<summary>Data results (top 20)</summary>

| Path                                                                 | Count |
|----------------------------------------------------------------------|-------|
| TwitchEverywhereCLI/TwitchConnection.cs                              | 82    |
| TwitchEverywhere/Implementation/TwitchConnector.cs                   | 61    |
| TwitchEverywhere.Benchmark/MsgBenchmark.cs                           | 38    |
| TwitchEverywhere/Implementation/MessagePlugins/MessagePluginUtils.cs | 34    |
| TwitchEverywhere/TwitchEverywhere.csproj                             | 31    |
| TwitchEverywhere/Implementation/MessageProcessor.cs                  | 27    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/NoticeTests.cs       | 26    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/PrivMsgTests.cs      | 25    |
| TwitchEverywhere/TwitchEverywhere.cs                                 | 25    |
| TwitchEverywhereCLI/Program.cs                                       | 23    |
| TwitchEverywhere/ITwitchConnector.cs                                 | 22    |
| TwitchEverywhere.Irc/Implementation/TwitchConnector.cs               | 21    |
| TwitchEverywhere.Rest/Implementation/RestApiService.cs               | 19    |
| TwitchEverywhere.Rest/RestClient.cs                                  | 19    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/ClearChatTests.cs    | 19    |
| TwitchEverywhere.Rest/IRestApiService.cs                             | 18    |
| TwitchEverywhere/Implementation/MessagePlugins/ClearChatPlugin.cs    | 17    |
| TwitchEverywhere/Types/PrivMsg.cs                                    | 17    |
| TwitchEverywhere/Implementation/MessagePlugins/PrivMsgPlugin.cs      | 16    |
| TwitchEverywhere.Irc/IrcClient.cs                                    | 15    |
| TwitchEverywhere/Implementation/MessagePlugins/ClearMsgPlugin.cs     | 15    |
| TwitchEverywhere.UnitTests/TwitchConnectorTests/ClearMsgTests.cs     | 15    |

</details>

The data returned from this method is nice, but it's hard to get a sense of the scale we are working on.
Let's use a small python and look at the top 20 entries in a horizontal bar chart:

<details>
<summary>Python script for plotting the csv to a horizontal bar chart</summary>

```python
import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV file
df = pd.read_csv("/path/to/file.csv")
df_filtered = df[df['Key'].str.endswith('.cs')]
df_sorted = df_filtered.sort_values(by='Value', ascending=False).head(20)

# Plotting
plt.figure(figsize=(20,10), dpi=100)
plt.barh(df_sorted['Key'], df_sorted['Value'])
plt.ylabel('Path')  # Adjust as necessary
plt.xlabel('Commit Count')
plt.title('Top 20: Number Of Commits In The Past Year Per File (.cs)')
plt.xticks(rotation='vertical')
plt.tight_layout()
plt.show()
```

</details>

And now we get this nice visualization:
{% image "/blog/img/2024-03-29-navigating-technical-debt/TwitchEverywhere-commit-count-per-file-cs" "Visualization of commit count per file as a bar chart" %}

### Hotspot Method X-Ray
The other metric that Adam Tornhill talks about is "hotspot x-ray".
This metric focuses on methods in hotspot files that are changed frequently.
If there are methods that change a lot – and especially if there are outliers – we should focus our efforts on them.

So from the previous example we saw that `TwitchConnection.cs` was by far the most commited to file in `TwitchEverywhere`.
We can use the following general algorithm to find these methods:
1. Get the commits for the file in the given time range
2. Get the changes for each commit
3. Compare the current commit and the next commit
4. Count the number of times each method was changed between commits
5. Sort the methods by the number of changes
6. Visualize the data

Figuring out what methods change between commits (steps 3 and 4) using git is a little tricky – since it does not track methods.
There are some hacky ways to try and work around this but in C# we can use Roslyn to get the changes for us.
We can compare the file contents between commits and ask Roslyn to determine if the method bodies are the same.
If there are any differences then a change must have taken place!

The implementation for this is a little more complex than the first example – so I won't share a code snippet – but you can find a working example [here](https://github.com/pureooze/DebtCollector.NET/blob/main/DebtCollector.NET/HotspotXray.cs).

{% image "/blog/img/2024-03-29-navigating-technical-debt/TwitchEverywhere-commit-count-per-method" "Visualization of commit count per method in the most committed file as a bar chart" %}

<details>
<summary>Data table for xray results</summary>

| Method Name          | Count |
|----------------------|-------|
| MessageCallback      | 25    |
| ConnectToRestClient  | 11    |
| PrivMessageCallback  | 8     |
| ClearChatCallback    | 7     |
| Connect              | 5     |
| ConnectToIrcClient   | 5     |
| NoticeMsgCallback    | 4     |
| ClearMsgCallback     | 4     |
| ConnectToIrcClientRx | 4     |
| WriteToStore         | 3     |
| SaveBufferToFile     | 3     |
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

{% image "/blog/img/2024-03-29-navigating-technical-debt/effort-vs-value" "Effort vs value of code coverage: As the coverage percent increases the effort increases exponentially" "https://jeroenmols.com/blog/2017/11/28/coveragproblem/" %}

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
In teams that I have been a part of we found a lot of success by making maintenance a part of the sprint planning process[^3].
We designate one developer – through a [rigorous selection process](https://wheelofnames.com/) – who is expected to work on tech debt one day that week.
There is a curated list of tasks that the team has prioritized and the lucky winner can choose from that list or something else they think is important.

This is where the hotspot metrics can be really useful.
The developer can run the report on a repo – or even a subset of the repo – and then focus on the areas that are most risky. It allows them to quickly answer the question: **Which part of this domain can I have the most impact on?**
Refactoring in hotspots is also satisfying because the work has a direct impact on the experience of other developers.

## Conclusion
Technical debt is a complex problem that can be hard to define and even harder to solve.
Focusing on hotspots should help us deliver high quality software quickly[^4].
We can use metrics to identify these risks and communicate them effectively to others.
By empowering developers we can make sure that the work is meaningful and impactful.

{% image "/blog/img/2024-03-29-navigating-technical-debt/tackling-technical-debt" "Tackling technical debt" %}

I hope this post has given you some ideas on how to navigate technical debt in your organization.
If you have any questions or comments feel free to reach out to me on [Mastodon](https://toot.community/@pureooze) or [GitHub](https://github.com/pureooze).

## Additional Notes
[^1]: This is not a comprehensive list, there are many other causes of risk
[^2]: Things like network errors, api contract changes, version mismatch, protocol mismatch, etc.
[^3]: I'm not a huge fan of sprint planning because there is a focus on things like story points or estimating work that has never been done before (so there is a lack of experience)... but oh well we can't have it all 😉
[^4]: If you implement the things described in this post, and it doesn't seem to work/be useful that can be a sign that your situation is different than what is described here
