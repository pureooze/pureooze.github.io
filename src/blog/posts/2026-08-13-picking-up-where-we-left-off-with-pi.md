---
title: "Picking Up Where the Previous Session Left Off: A Knowledge Graph for Pi"
thumbnail: 2026-08-13-picking-up-where-we-left-off-with-pi/thumbnail.svg
small-thumbnail: 2026-08-13-picking-up-where-we-left-off-with-pi/thumbnail.svg
tags:
  - pi
  - coding agents
  - knowledge graph
  - ai
---
Have you ever asked a coding agent to continue working on a project, only to watch it spend the first part of the session figuring out what it already learned last time?

I ran into this while using [Pi](https://pi.dev) to build a website for my wedding invitations. Pi is the coding-agent harness: it manages the session and gives an LLM tools for working on the project. The LLM is the part that reads the code, reasons about it and decides what to do next.

The wedding site gives each group of guests a personalized link where they can see their events and record who will attend.

While building the site, the LLM would first trace how the personalized link loaded the invitation data. Then it would work out how the guests, events and attendance limits shaped the RSVP form. From there it would follow the selections into the review screen, submission and the read-only summary shown afterwards. By the time it reached the part I wanted to change, it had built a useful model of the whole flow.

Then I would start a new Pi session and the same investigation would begin again. The LLM would reopen the same files, trace the same data and rediscover the same constraints before making the next change. I could describe the result I wanted, but that request did not include everything the previous session had uncovered. The LLM could always reconstruct the model from the repository, but repeatedly doing so felt wasteful after an earlier session had already followed the same path.

I wanted the LLM in the next session to recover useful things from earlier work without loading the entire conversation as permanent context. That is what led me to build a local knowledge graph extension for Pi.

<!-- excerpt -->

## Starting Over Gets Expensive
That repeated investigation is where the cost starts to add up. Most of the information the LLM needs is still in the repository. The current code shows how the system is implemented, and comments or documentation may explain some of the reasoning. What the repository usually cannot tell the LLM in a new session is which conclusions mattered during an earlier conversation, why the work stopped where it did, or what remained unfinished.

The wedding site's full behavior is not explained in one place. The LLM has to connect the code that loads an invitation, decides which guests appear for each event, enforces the attendance limits, carries the selections into the review screen and displays a submitted response. A change near the start of that flow can affect everything after it. The individual pieces are simple, but assembling them into a reliable model takes time.

I keep stable rules in the project documentation and in `AGENTS.md`, the file that gives coding agents instructions for the repository. That works well for information every contributor needs. It works less well for context gathered during a session: why a particular decision was made, how two parts of the system are related, or what remains unfinished. I am not going to stop after every conversation and turn all of that into project documentation.

The conversation history seems like the obvious place to look next. It helps when I continue the same session, but a useful fact may be buried in an older one. The LLM may also need a fact uncovered during work in a different repository.

So the information often exists, but it is not organized around the questions I want the LLM in a new Pi session to answer:

- How does this project or feature work?
- Why does it work that way?
- Where did the previous session leave the work?

I wanted the LLM to answer those questions without rebuilding everything from zero.

## Remembering Facts Instead of Conversations
That gap between project documentation and conversation history is what I built [`@pureooze/pi-knowledge-graph`](https://github.com/pureooze/pi-config/tree/main/packages/knowledge-graph) to fill. It stores useful facts separately from Pi's sessions so they can be found again later.

The graph contains entities, claims and evidence. An entity might be the wedding project, its RSVP flow or a service it depends on. Claims record facts and relationships between those entities. Evidence points back to the file, command, user statement, URL or Pi session that supported a claim.

Evidence makes the stored facts easier to check. If the graph says that an event has an attendance limit, the search result can also show the LLM where that information came from. When the memory and current code disagree, the citation gives it a starting point for working out which one is stale.

The extension adds three tools that the LLM can call. `knowledge_search` finds relevant facts, `knowledge_get` opens a result when more detail is needed, and `knowledge_maintain` adds, updates or removes a record. When I ask about project facts, architecture or earlier decisions, the extension instructs the LLM to search the graph before using Pi's file tools.

A useful result lets the LLM answer with citations to the claims and evidence it used. An incomplete result sends it back to the repository to investigate what is missing. Reading from the graph saves repeated work; it does not remove the need to read the code.

## Picking Up Where the Previous Session Left Off
Now, when I start a new Pi session for the wedding site, I can ask:

> How does the invitation flow work, why does each event have its own guest limit, and where did the previous session leave the work?

The LLM calls `knowledge_search` before opening the repository. If earlier sessions saved the relevant facts, the result can restore how the RSVP flow fits together, its recorded constraints and the last known state of the task. Anything missing still has to be found in the project, but the LLM can focus that investigation on the gaps instead of repeating all of it.

This only works if useful information reaches the graph in the first place. The LLM can call `knowledge_maintain` after discovering a durable fact or reaching a meaningful point in the work. The extension does not scrape the whole conversation automatically. Coding sessions contain guesses, dead ends and temporary notes, and I don't want those to become memory simply because they appeared in the chat.

Recording progress introduces another issue: it becomes stale quickly. When the LLM updates a fact through `knowledge_maintain`, the extension stores a replacement claim and marks the old one as superseded. Normal searches return the current claim, while the previous claim and its evidence remain available as history. That gives “where did the previous session leave the work?” a current answer without pretending the answer has always been the same.

Remembered context is also useful when the work is finished. If I ask the LLM to draft a pull request, it can use the project history to explain why the change was needed. The current diff and actual test output still determine what changed and how it was tested. The graph provides context for the description; it is not evidence that unperformed tests passed.

## Why Use a Graph?
“Knowledge graph” sounds grand for something stored in a local SQLite database, but the relationships are the reason for using one. Projects contain features, features depend on services, decisions affect parts of the system, and evidence supports claims about all of them. Storing those facts as unrelated notes would lose many of the connections the LLM needs to recover the project model.

That model would not help much if it disappeared with the session that created it. The database is shared across Pi sessions and working directories, so moving a project or opening Pi from another directory does not hide what was learned. It acts as personal memory for my Pi installation rather than a file attached to one repository.

All of this stays local. The extension stores the database under `~/.pi/agent/knowledge-graph/` by default and does not send it anywhere. Searching uses SQLite full-text search and can follow records that are directly connected in the graph; it does not require embeddings or additional model calls.

## The Trade-offs
The benefit of durable memory is also its biggest risk: the LLM can preserve something that is wrong. `knowledge_maintain` makes immediate changes to the shared graph, and rewinding or branching a conversation does not undo them. Corrections keep the earlier history and records can be deleted, but the graph still needs the same skepticism as any other source of information.

Evidence creates a privacy concern as well. The database may contain excerpts from files and the local paths those excerpts came from. The extension uses private filesystem permissions and scans evidence for secret-like values before saving it, but the scan cannot catch every secret and the SQLite database is not encrypted.

I kept the first version narrow so these trade-offs remain understandable. It is a local, single-user tool with no cloud sync or multi-user access controls, and it does not automatically turn conversations into memory. The aim is a store of evidence-backed project knowledge that I can inspect, export and delete.

## Trying It
Install the package with Pi:

```shell
pi install npm:@pureooze/pi-knowledge-graph
```

Restart Pi if the extension is not immediately available. It requires Pi `0.84.0` or newer and Node.js `24.14.1` or newer.

Once installed, `/knowledge-status` shows the database health and record counts, `/knowledge-export` creates a local export, and `/knowledge-forget <stable-id>` previews and confirms deletion of a record. The source and complete usage guide are in the [`pi-config` repository](https://github.com/pureooze/pi-config/tree/main/packages/knowledge-graph).

I don't need to feed every previous conversation back into the LLM. I want to start a new Pi session, describe the next task, and give the LLM enough stored project knowledge to continue from the last recorded state.
