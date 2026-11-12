---
title: "Using Subagent Delegate with the Knowledge Tool"
thumbnail: 2026-09-22-my-wedding-invitations-became-an-experiment-in-ai-memory/thumbnail.svg
small-thumbnail: 2026-09-22-my-wedding-invitations-became-an-experiment-in-ai-memory/thumbnail.svg
tags:
  - pi
  - coding agents
  - knowledge graph
  - ai
---

In my [post about building a knowledge graph for Pi](/blog/posts/2026-09-22-my-wedding-invitations-became-an-experiment-in-ai-memory/), I described how often an agent had to rediscover project context. The knowledge tool helps it remember. The `delegate` tool solves a different problem: handing a bounded task to another worker.

Together, they let the main agent recover what it knows, brief a subagent, and review its work.

<!-- excerpt -->

## Remember enough to delegate

The knowledge graph connects project entities, claims and evidence. For example, the wedding site's RSVP flow spans invitation loading, event-specific guest limits, review and submission. Before changing one part, an agent can search for related decisions and evidence rather than treating that part in isolation.

Search results are a starting point, not an oracle. If evidence is missing or may be stale, check the current code. Then pass only the verified context the subagent needs—not the whole graph or conversation.

## Delegate a well-scoped task

A delegated worker does not automatically receive the parent conversation. The request needs to include the task, relevant files, constraints and what a useful result looks like. For example:

```text
Task: Trace how event-specific guest limits are enforced in the RSVP flow.
Type: explore
Files: [relevant RSVP and test files]
Context: [verified findings and citations]
Constraints: Don't change code; note any mismatch with the current implementation.
Acceptance criteria: Describe the enforcement points and suggest a focused test.
```

The worker can investigate, implement, test or fix. Keep the assignment narrow enough to review. If investigation leads to implementation, make that a separate handoff with the findings included.

## Search, delegate, verify

1. Search the graph for prior decisions and evidence.
2. Check the code where the knowledge is incomplete or uncertain.
3. Give the subagent a bounded task and the context it needs.
4. Review its report or diff, then run the relevant checks.
5. Record any durable, evidence-backed discovery for future sessions.

The main agent remains responsible for choosing what to delegate, integrating the result and deciding whether it is correct. A confident subagent report is not a substitute for checking the code and tests.

Memory also needs care. Claims can become stale, so verify them before relying on them. When work changes a fact, update the graph with evidence so the previous claim remains in its history. Knowledge-maintenance changes take effect immediately and are not undone by rewinding a Pi session, so save durable findings—not every intermediate thought.

The two tools complement each other: knowledge reduces repeated rediscovery; delegation lets an agent hand off a discrete task. Search for the context, pass along what matters, and verify what comes back.
