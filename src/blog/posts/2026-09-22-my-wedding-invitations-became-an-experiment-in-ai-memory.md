---
title: "My Wedding Invitations Became an Experiment in AI Memory"
thumbnail: 2026-09-22-my-wedding-invitations-became-an-experiment-in-ai-memory/thumbnail.svg
small-thumbnail: 2026-09-22-my-wedding-invitations-became-an-experiment-in-ai-memory/thumbnail.svg
tags:
  - pi
  - coding agents
  - knowledge graph
  - ai
---
I ran into a very annoying issue while trying to build a website for my wedding invitations. Every time I sent a prompt to my LLM it would do one of two things:
1. Ask me lots of clarifying questions (annoying)
2. Spend lots of time and tokens searching the project (annoying and expensive!)

So I would either end up flustered at the amount of questions I was suddenly bombarded with, or run out of tokens before the agent even started the task I wanted to do.

I wanted the LLM to remember anything interesting that I told it or it discovered during exploration. Then when encountering ambiguiting it should **recover those pieces of knowledge on its own**.

That is what led me to build a knowledge graph extension for Pi.

<!-- excerpt -->

[Pi](https://pi.dev/) is a lightweight coding-agent harness, it manages the session and gives an LLM tools for working on the project. What's really awesome about Pi is that you can build your own custom tools that are tailored for your use cases and environments.

## Starting Over Got Expensive
Looking over my past conversations with LLMs I noticed there were certain types of questions I asked regularly:
- How does this project or feature work?
- Why does it work that way?
- Where did the previous session leave the work?
- How can we plan a fix and track its progress?
- Will this fix work with the changes in another branch?

In my case the challenge for the LLM was that the wedding site's full behavior is not explained in one place. The LLM has to connect the code that loads an invitation, decides which guests appear for each event, enforces the attendance limits, carries the selections into the review screen and displays a submitted response. A change near the start of that flow can affect everything after it. The individual pieces are simple, but assembling them into a reliable model takes time (and costs a lot of tokens). Incurring this cost multiple times, sometimes at the same time in multiple sessions started to get really expensive.

I wanted the LLM to answer those questions without rebuilding everything from zero.

## Remembering Facts Instead of Conversations
I built [`@pureooze/pi-knowledge-graph`](https://github.com/pureooze/pi-config/tree/main/packages/knowledge-graph) to fill this gap. It stores useful facts separately from a single conversation so they can be found again later.

The knowledge graph contains entities, claims and evidence. An entity might be the wedding project, its RSVP flow or a service it depends on. Claims record facts and relationships between those entities. Evidence points back to the file, command, user statement, URL or Pi session that supported a claim.

Evidence makes the stored facts easier to check. If the graph says that an event has an attendance limit, the search result can also show the LLM where that information came from. When the memory and current code disagree, the citation gives it a starting point for working out which one is stale.

The extension adds three tools that the LLM can call. `knowledge_search` finds relevant facts, `knowledge_get` opens a result when more detail is needed, and `knowledge_maintain` adds, updates or removes a record. When I ask about project facts, architecture or earlier decisions, the extension instructs the LLM to search the graph before using other discovery tools.

A useful result lets the LLM answer with citations to the claims and evidence it used. An incomplete result sends it back to the repository to investigate what is missing. This provides an incentive to achive a high "hit rate" in the graph, the more queries we can match to entities in the graph the more performant our agent can be!

## Why Use a Graph?
“Knowledge graph” sounds really fancy but at the root of it the relationships it enables between entities are the reason for using one. Projects contain features, features depend on services, decisions affect parts of the system, and evidence supports claims about all of them. Storing those facts as unrelated notes would lose many of the connections the LLM needs to understand the project model.

## How It Works
Now, when I start a new Pi session for the wedding site, I can ask:

> How does the invitation flow work, why does each event have its own guest limit, and where did the previous session leave the work?

The LLM calls `knowledge_search` with keywords generated based on my prompt. If earlier sessions saved the relevant facts, the LLM can answer the question quickly. Anything missing still has to be found in the project, but the LLM can focus that investigation on the gaps instead of repeating all of it.

To maintain the graph the LLM can call `knowledge_maintain` after discovering an interesting fact or reaching a meaningful point in work to commit it to the graph.

Recording information does introduce an issue: it becomes stale quickly. When the LLM updates a fact through `knowledge_maintain`, the extension stores a replacement claim and marks the old one as superseded. Normal searches return the current claim, while the previous claim and its evidence remain available as history. That gives “where did the previous session leave the work?” a current answer without pretending the answer has always been the same.

Remembered context is also useful when the work is finished. If I ask the LLM to draft a pull request, it can use the project history to explain why the change was needed. The current diff and actual test output still determine what changed and how it was tested but the graph provides context for the description like other approaches we tried before landing on the current one.

All of this stays local. The extension stores the database under `~/.pi/agent/knowledge-graph/` by default. Searching uses SQLite full-text search and can follow records that are directly connected in the graph; it does not require embeddings or additional model calls.

The database is shared across Pi sessions so moving a project or opening Pi from another directory does not hide what was learned. It acts as personal memory for Pi rather than a file attached to one repository.

## The Trade-offs
The benefit of durable memory is also its biggest risk: the LLM can preserve something that is wrong. `knowledge_maintain` makes immediate changes to the shared graph, and rewinding or branching a conversation does not undo them. Corrections keep the earlier history and records can be deleted, but the graph still needs the same skepticism as any other source of information.

## Trying It
Install the package with Pi:

```shell
pi install npm:@pureooze/pi-knowledge-graph
```

Restart Pi if the extension is not immediately available. It requires Pi `0.84.0` or newer and Node.js `24.14.1` or newer.

Once installed, `/knowledge-status` shows the database health and record counts, `/knowledge-export` creates a local export, and `/knowledge-forget <stable-id>` previews and confirms deletion of a record. The source and complete usage guide are in the [`pi-config` repository](https://github.com/pureooze/pi-config/tree/main/packages/knowledge-graph).
