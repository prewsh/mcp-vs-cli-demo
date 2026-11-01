# If AI Agents Can Already Use CLIs, Why Do We Need MCP?

*I gave the same AI agent my live backend twice, once through a CLI and once through MCP, and watched what it actually did.*

By Precious Ngwube, Developer Relations Manager at PipeOps. Published on Prompt Africa on 1 November 2026: [promptafrica.substack.com/p/if-ai-agents-can-already-use-clis](https://promptafrica.substack.com/p/if-ai-agents-can-already-use-clis). This is a text mirror of the published article; the evidence behind it is in this repository ([README](README.md), [RESULTS](RESULTS.md), [METHOD](METHOD.md)).

---

Months ago, I asked on X: "If agents can use CLIs, why do we need MCP?" I've seen a lot of opinions on this since then, so I decided to do some deep research.

Claude Code, Codex and other coding agents can use my computer. They have access to my terminal and they can run commands. If I install a CLI on my computer, the agent can use it. It can run `--help` and take actions the same way a developer would. If that's possible, why do we still need MCP?

So I ran a test. I took my live backend for mungopark.io, gave the same AI agent the same questions about it twice, once through a CLI and once through an MCP server, and watched what it actually did. I wanted to see the differences in how an agent works with each one, and whether those differences answer the question in my post.

## The case for the CLI is real

The people asking this question are not just being contrarian. In March 2026, Perplexity's CTO Denis Yarats [said at the company's Ask 2026 conference](https://awesomeagents.ai/news/perplexity-agent-api-mcp-shift/) that Perplexity was moving away from MCP internally, towards APIs and CLIs. The reasons reported were how much of the context window MCP tool definitions take up and how clunky the authentication is. Perplexity still runs an MCP server for developers who want one, but that announcement kicked off a big CLI versus MCP debate on X (Twitter).

[Scalekit ran 75 benchmark runs](https://scalekit.com/blog/mcp-vs-cli-use) with Claude Sonnet 4 on five read-only GitHub tasks, comparing the `gh` CLI with GitHub's MCP server. On one task, the CLI used 1,365 tokens, and MCP used 44,026. Across the five tasks, MCP used between 4 and 32 times more tokens, mostly because all 43 of the server's tool definitions were sent along in every conversation. The CLI also completed all 25 of its runs, while MCP completed 18 of 25. All seven MCP failures were connection timeouts to GitHub's remote server, not tool errors.

If you look at that benchmark closely, you'll notice something. The model already knows `gh`. It has seen `git`, `gh`, `docker`, and `kubectl` all over its training data, so it doesn't need to discover anything. It just types the command. Scalekit's own conclusion was that the CLI is the right choice when you're the developer working for yourself, and MCP earns its cost when agents act on behalf of customers.

So the people saying "just use the CLI" are describing a situation where a developer, on their own machine, is using tools the model already knows. So my question became: what happens outside that situation?

## How an agent uses a CLI, and how it uses MCP

When an agent uses a CLI, it needs a terminal first. Then it has to know the commands, either from training or by running `--help` and reading what comes back. It runs a command as a string of text, gets text back (or JSON, if the CLI offers it and the agent thinks to ask), and works out the next step from there. And whatever the CLI can do, the agent can do, because it runs with whatever login is on that machine. Usually that's yours.

MCP, the Model Context Protocol, works differently. An MCP server describes its tools up front: each tool has a name, a description, and a schema saying what arguments it takes. When the agent's client connects, it receives that list, so the agent can call `get_project` with a `project_id` instead of figuring out command syntax. Results come back as structured data. The server decides which tools exist, and the credential the client connects with, such as an OAuth login or a scoped token, decides what those tools are allowed to do. It also works in apps that have no terminal at all, like ChatGPT or Claude in the browser.

MCP has real costs too. Those tool definitions take up space in the agent's context, which is the Perplexity complaint. [Anthropic's engineering team wrote about this](https://www.anthropic.com/engineering/code-execution-with-mcp) last year and showed that loading tools only when the agent needs them, instead of all up front, cut one workflow from about 150,000 tokens to about 2,000. So the MCP community knows the cost is real and is working on it.

That's the theory. I wanted to see it for myself, so I ran my own test.

## The test

Mungo Park is a community analytics tool I built earlier this year, and a few weeks ago I moved its backend hosting to PipeOps. I picked PipeOps for this experiment because it has both a CLI and an MCP server, and my Codex agent already had access to both. There's a second reason. Unlike the `gh` CLI in Scalekit's benchmark, PipeOps CLI commands are new to Codex. They're very unlikely to be in its training data the way `gh` is, and I believe that's true of most companies' CLIs.

I used:

- Codex (version 0.166.0-alpha.5.1)
- The gpt-6.1-sol model, with high reasoning effort, for every run
- PipeOps CLI (version 0.2.104)

In the MCP runs, the `pipeops` CLI was removed from the agent's path, so it could only use MCP. In the CLI runs, there was no MCP server connected at all.

I gave the agent three read-only questions, one after the other in the same session:

1. What's the status of the latest deployment?
2. What do the recent runtime logs say?
3. What triggered the last three deployments?

Then I ran one small write: add an unused environment variable to the project. Because this is a live service, the read questions told the agent not to change anything, and I watched every run as it happened.

This is one run per setup, not a benchmark. The same agent could behave differently tomorrow. Treat what follows as what I saw, with the traces to back it up, not as a law.

## What happened

### The CLI agent didn't find the CLI

In the first round, both agents got the exact same prompt, which said "PipeOps tools are available in this session."

The MCP agent's first move was `get_project` with the project name. Then `list_project_deployments`. Then `get_project_logs`. It answered all three questions correctly, and on the third one it noticed that two PipeOps listings didn't agree with each other, so it pulled the audit log to work out the real last three deployments.

The CLI agent never ran `pipeops`.

Not once, not even `pipeops --help`. It checked for MCP resources, found none, and asked me to enable a connector. On the third question it went looking for a browser tool, didn't find one, and gave up. When I ran the write test with the same wording, it happened again: "PipeOps tools aren't exposed in this session, so I couldn't add `AGENT_EXPERIMENT_A=1`."

To be fair to the CLI, my wording probably nudged the agent towards looking for MCP tools. But that's also the point. An MCP server announces itself: the moment the session starts, the agent has a list of what it can do. A CLI sitting on your machine is invisible until somebody tells the agent it's there. That's a gap someone has to fill by hand, usually with a line in the prompt or an `AGENTS.md` file, for every CLI the agent should use.

### Once I named the CLI, it worked, with a lot of looking around

So I ran the CLI version again with one change: "The PipeOps CLI (`pipeops`) is installed and logged in on this machine."

This time the agent started with `pipeops --help`, searched for an `AGENTS.md`, then ran `pipeops list --help`. On the first question alone, it ran eight shell commands, five of them help or discovery. I expected it to learn the CLI once and then speed up, but that's not what happened. Each new question needed new commands, so it kept checking help: two discovery commands on the logs question, four on the deployments question. Across the three questions it ran 26 shell commands, against 7 tool calls in the MCP session.

It also wrote little Python scripts to parse the CLI's output, and one of them crashed on a timestamp format (`ValueError: Invalid isoformat string`). The agent recovered and got the deployment answers right.

The logs were even more interesting. Both CLI log commands returned an empty placeholder, `0001-01-01 00:00:00 INFO map[entries:<nil> streams:<nil>]`, and both exited successfully. The agent didn't make anything up. It said it couldn't count errors from what came back. That's good behaviour, but it also shows something the shell can't tell you on its own: exit code 0 only means the command ran, not that the data came back. The MCP agent did read the logs, though at a different time, so this isn't a side-by-side test of the same query.

### The CLI wasn't cheaper in my experiment

This part, I didn't expect, given the benchmarks. Here are the input tokens Codex reported for each question, in the session where the agent knew the CLI existed, against the MCP session:

- Latest deployment: CLI 75,470, MCP 88,182
- Runtime logs: CLI 263,601, MCP 199,844
- Last three deployments: CLI 462,829, MCP 441,048

The MCP server I was using offers 144 tools, so its definitions are not small. The CLI session still used more tokens on two of the three questions, because all that help-reading and output-parsing costs tokens too. I want to be careful with this, though. The sessions ran at different times with different context building up, it's one run for each, and Codex caches a lot of the input. What these numbers do show is that on a CLI the model has never seen, the CLI's token advantage from Scalekit's GitHub benchmark didn't show up.

MCP had its own failure too. One MCP session failed to start because fetching the tool list from PipeOps' server timed out after 30 seconds (`pipeops: timed out awaiting tools/list after 30s`). A retry worked. That matches what Scalekit saw: remote MCP servers add a network dependency that a local CLI doesn't have.

### The write test: who decides what the agent can do

The last test was one small write: add an unused environment variable to the project. Through the CLI, once it knew the CLI existed, the agent read the help and ran:

```
pipeops project env set <project-id> AGENT_EXPERIMENT_A=1 --merge
[OK] Project environment variables merged
```

Then it told me: "No deployment was triggered." That was wrong. On PipeOps, changing an environment variable redeploys the app, and my production backend redeployed (22 seconds, back up and running). The agent wasn't lying. The CLI printed "merged" and said nothing about a redeploy, so the agent had no way to know. It was acting with my full personal login, and the only thing between it and my production config was a sentence in my prompt.

The MCP runs went differently. I tried two PipeOps service tokens, one scoped to read only and one with write access. Both MCP agents called `update_project_env_variables` with the right arguments, and both times PipeOps itself refused with `401 invalid or unauthorized service account token`. Nothing changed, nothing redeployed.

[PipeOps' MCP documentation](https://docs.pipeops.io/docs/integrations/pipeops-mcp) says changing environment variables is blocked for service tokens, no matter what scopes you grant. The refusals match that, although the error message itself doesn't name the reason, and it was the same for both tokens. What these runs show is another difference between MCP and the CLI. With the CLI, the agent was me. With MCP, the agent was a separate identity, and PipeOps got to decide what each identity, me or my agent, could do.

The same pattern shows up in what each side offers. The CLI can change a project's description. PipeOps' MCP server simply doesn't offer that: its `update_project` tool says "description updates are unsupported." The platform chose what to put on the agent's menu.

One thing MCP didn't fix: the `update_project_env_variables` tool description says nothing about redeploying either. Neither interface told the agent about the side effect. That's not a protocol problem; it's a writing problem, and it's on whoever builds the tools.

## So why do we need MCP?

After all this, I don't think the useful question is "CLI or MCP?" The CLI did the job once it knew the CLI existed, and if your agent has a terminal, works on your own machine, and uses tools it already knows like `git` or `gh`, the CLI is often the better choice. It's cheap, it's fast, and the benchmarks back that up.

But "just use the CLI" quietly assumes three things: that the agent knows the CLI is there, that it has a terminal to run it in, and that it's fine for the agent to act as you. In my test, the first one failed until I fixed it by hand. The third one meant an agent changed my production config and confidently told me something that wasn't true about it. And the second one rules out every agent that doesn't have a shell at all, which is a lot of them.

That's where MCP comes in. The tools announce themselves, so the agent doesn't need to be told what exists or go hunting through help text. It works in apps with no terminal. And the agent acts as its own identity, so the platform, not a sentence in your prompt, decides what it's allowed to touch. MCP has costs, the context it takes up and the extra network hop. But it solves problems the CLI was never designed to solve.

If you build a platform, my takeaway is to ship both, and to write both for agents. Make the CLI's output say what actually happened, including side effects like a redeploy. Make your MCP tool descriptions say it too. In my test, neither did.

An AI agent can learn twenty different CLIs. MCP asks whether it should have to.

## How I ran it

The test ran on 31 October 2026 against my live Mungo Park backend on PipeOps, with Codex 0.166.0-alpha.5.1, the same model and high reasoning effort for every run, and PipeOps CLI 0.2.104. Each run used a fresh `codex exec` session with its own clean configuration, so my usual settings and other MCP servers couldn't leak in. The CLI runs used my normal `pipeops login`. The MCP runs connected to `https://mcp.pipeops.app/mcp` with PipeOps service tokens, and the `pipeops` binary was removed from their path. Every step was recorded as a JSON trace. I've kept the raw traces private because they come from a production backend.

The three read-only questions, asked in order in one session:

1. "My backend for Mungo Park is deployed on PipeOps as the project "mungo-park", and PipeOps tools are available in this session. This is a live production service: only read, never deploy, restart, stop or change anything. Find the project and tell me the status of its latest deployment and when it happened."
2. "Now read its recent runtime logs. Report any errors or warnings (how many, and the most common), or tell me there are none. Don't quote personal data."
3. "Look at its last 3 deployments. For each one, tell me what triggered it, when, and its status. If any failed, find out why."

For the second CLI round, "PipeOps tools are available in this session" became "The PipeOps CLI (`pipeops`) is installed and logged in on this machine." The write test asked the agent to add one unused environment variable, merging with the existing ones, without reading or changing any other variable. Afterwards I removed the test variable and revoked both tokens.

If you want to try this on your own project, the prompts above are all you need. Pick a CLI your model doesn't already know, and see how many `--help` calls it takes before the real work starts.
