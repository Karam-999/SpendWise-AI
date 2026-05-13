# Prompts

## AI Summary Prompt

### Full prompt

```
You are a concise AI spend analyst writing for startup founders. Based on this audit:

Team size: {teamSize}
Use case: {useCase}
Total monthly savings: ${totalMonthlySavings}
AI Spend Score: {spendScore}/100
Recommendations:
{tool}: {recommendedAction} (saves ${savings}/mo)
...

Write a direct, actionable 80-100 word summary. Be specific about their tools and numbers. No generic advice. No bullet points. No greeting.
```

### Why this structure

- **Role framing ("concise AI spend analyst")**: Keeps the output professional and on-topic. Without a role, the model tends to add preamble or generic productivity advice.
- **Structured data over raw JSON**: Earlier versions passed `JSON.stringify(results)` directly. The model would sometimes repeat the JSON back or hallucinate field names. Formatting the data as labeled lines produces more consistent output.
- **Word count constraint (80-100)**: Without this, llama3-70b generates 200+ word responses. Too long for a summary card. The range gives the model some flexibility without producing walls of text.
- **Negative constraints ("no bullet points, no greeting")**: llama3-70b defaults to bullet lists and "Hello!" openers. Explicitly blocking these produces cleaner prose.
- **Conditional tone**: The prompt switches between "reassuring" (spending well) and "direct, actionable" (savings found). This prevents the model from being alarmist about optimal stacks or too soft about real waste.

### Fallback strategy

If Groq fails (network error, rate limit, missing API key), the `fallbackSummary()` function returns a template string built from the audit data. It's not as polished but covers the same information: total savings, top recommendation, spend score.

The fallback is always tested by temporarily removing `GROQ_API_KEY` from `.env.local`.

## Failed prompt iteration

### Attempt: Raw JSON dump

```
Based on this audit data: ${JSON.stringify(results)}
Write a personalized summary.
```

**Problem:** The model would sometimes repeat parts of the JSON, reference internal field names like `showConsultationCTA`, or produce unstructured output. One response started with "Based on the provided JSON data..." which is useless for a user-facing summary.

**Fix:** Switched to formatted, labeled data with explicit field descriptions. This gave the model context without exposing implementation details.

## Why audit logic is NOT AI-generated

The audit engine uses hardcoded rules with verified pricing data. This is deliberate:

1. **Defensibility**: Every recommendation traces back to a specific price comparison. A finance person can verify the math. AI-generated recommendations would need to be audited themselves.
2. **Determinism**: Same input always produces same output. No temperature or prompt variation. This is critical for a tool that gives financial advice.
3. **Speed**: The engine runs in <1ms. No API call needed for the core value, the audit itself.
4. **Cost**: Zero API spend for the main feature. Groq is only used for the summary paragraph, which is supplementary.

The AI summary is the one place where LLM generation adds value, turning structured data into natural language that's personalized and easy to read. The audit math itself should never be AI-generated.
