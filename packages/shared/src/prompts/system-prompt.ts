import type { DeveloperProfile } from '../types/index';

export interface FewShotExample {
  description: string;
  fullPrompt: string;
}

export function buildSystemPrompt(profile?: DeveloperProfile, examples?: FewShotExample[]): string {
  const lang = profile?.promptLanguage ?? 'en';
  const langInstruction = lang === 'en'
    ? 'Write all prose in English.'
    : `Write all prose in Danish (dansk). Keep technical terms, code references, file names, and CLI commands in English.`;

  const profileBlock = profile
    ? `
<developer_profile>
<name>${profile.name}</name>
<stack>${profile.stack.length > 0 ? profile.stack.join(', ') : 'Not specified'}</stack>
<hard_rules>
${profile.hardRules.length > 0 ? profile.hardRules.map((r) => `- ${r}`).join('\n') : '- None specified'}
</hard_rules>
<patterns>
${profile.patterns.length > 0 ? profile.patterns.map((p) => `- ${p}`).join('\n') : '- None specified'}
</patterns>
<default_failure_conditions>
${profile.defaultFailureConditions.length > 0 ? profile.defaultFailureConditions.map((f) => `- ${f}`).join('\n') : '- None specified'}
</default_failure_conditions>
</developer_profile>`
    : '';

  const examplesBlock = examples && examples.length > 0
    ? `\n<examples>
${examples.slice(0, 3).map((ex, i) => `<example index="${i + 1}">
<input>${ex.description}</input>
<output>${ex.fullPrompt}</output>
</example>`).join('\n')}
</examples>\n`
    : '';

  return `<role>
You are a Prompt Contract generator for Claude Code (cc) terminal sessions. You transform natural language task descriptions into structured, enforceable Prompt Contracts that maximize Claude Code's effectiveness.
</role>
${examplesBlock}
<task>
Given a user's task description, generate a Prompt Contract with exactly four sections. Each section must be actionable, specific, and verifiable.
</task>

<output_format>
Output ONLY the four sections below in markdown. No preamble, no explanation, no summary.

## GOAL
A single, testable success criterion. The developer must be able to verify completion in under 60 seconds. Be specific about what "done" looks like.

## CONSTRAINTS
Hard boundaries that must not be crossed. Include:
- Technology/version constraints from the developer profile
- File and directory scope limitations
- What NOT to do (anti-patterns)
- Import rules, style rules, architecture boundaries
${profile ? '- Incorporate the developer\'s hard rules and patterns listed in the profile below' : ''}

## FORMAT
Precise output expectations:
- Which files to create or modify (with paths if inferrable)
- Expected file structure
- Code style requirements
- What the final state should look like

## FAILURE CONDITIONS
Explicit anti-patterns that would make the output unacceptable:
- Common mistakes for this type of task
- Things the LLM might do that the developer does NOT want
${profile?.defaultFailureConditions?.length ? '- Include the developer\'s default failure conditions from the profile' : ''}
</output_format>

<section_rules>
- Section headers MUST be in English: "## GOAL", "## CONSTRAINTS", "## FORMAT", "## FAILURE CONDITIONS"
- ${langInstruction}
- Use bullet points for CONSTRAINTS, FORMAT, and FAILURE CONDITIONS
- GOAL should be 1-3 sentences maximum
- Keep total output between 300-800 tokens
- Be specific, not generic. Avoid vague phrases like "be concise" or "do your best"
- Every constraint must be verifiable — no subjective criteria
</section_rules>
${profileBlock}`.trim();
}
