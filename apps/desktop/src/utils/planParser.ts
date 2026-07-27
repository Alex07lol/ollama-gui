import type { Plan, PlanStep } from '../types';

export function parsePlan(text: string): Plan | null {
  if (!text) return null;

  // Search for sections
  const objectiveMatch = text.match(/(?:#|\*)*Objective(?:#|\*)*:?\s*([\s\S]*?)(?=(?:#|\*)*(?:Project Understanding|Understanding|Risks|Complexity|Stages|Stage)\b|$)/i);
  const understandingMatch = text.match(/(?:#|\*)*(?:Project Understanding|Understanding)(?:#|\*)*:?\s*([\s\S]*?)(?=(?:#|\*)*(?:Risks|Complexity|Stages|Stage|Objective)\b|$)/i);
  const risksMatch = text.match(/(?:#|\*)*Risks(?:#|\*)*:?\s*([\s\S]*?)(?=(?:#|\*)*(?:Complexity|Stages|Stage|Objective|Understanding)\b|$)/i);
  const complexityMatch = text.match(/(?:#|\*)*Complexity(?:#|\*)*:?\s*([\s\S]*?)(?=(?:#|\*)*(?:Stages|Stage|Objective|Understanding|Risks)\b|$)/i);

  const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
  const understanding = understandingMatch ? understandingMatch[1].trim() : '';

  const risks: string[] = [];
  if (risksMatch) {
    risksMatch[1].split('\n').forEach((line) => {
      const clean = line.replace(/^\s*[-*+]\s*|\s*\d+\.\s*/, '').trim();
      if (clean) risks.push(clean);
    });
  }

  const complexity = complexityMatch ? complexityMatch[1].trim() : 'Medium';

  // Parse stages and steps
  const stages: { title: string; steps: PlanStep[] }[] = [];
  const stageMatches = Array.from(
    text.matchAll(/(?:#|\*)*(Stage\s*\d+|Stage\s+[A-Za-z0-9]+|Stage\s*.*?)\s*:?\s*(.*?)\n([\s\S]*?)(?=(?:#|\*)*(?:Stage|Objective|Understanding|Risks|Complexity)\b|$)/gi)
  );

  let stepCounter = 1;

  for (const match of stageMatches) {
    const title = (match[1] + (match[2] ? ': ' + match[2] : '')).trim();
    const body = match[3];
    const steps: PlanStep[] = [];

    const lines = body.split('\n');
    for (const line of lines) {
      const bulletMatch = line.match(/^\s*[-*+]\s*(?:\[[\sX]*\])?\s*(.*)/i) || line.match(/^\s*\d+\.\s*(?:\[[\sX]*\])?\s*(.*)/i);
      if (bulletMatch) {
        const description = bulletMatch[1].trim();
        if (description) {
          let actionType: PlanStep['actionType'];
          let actionTarget = '';

          // Look for terminal commands or file creation signatures
          const cmdMatch = description.match(/(?:run|exec|execute|terminal)\s*`([^`]+)`/i) || description.match(/(?:run command|execute command|run|exec|execute)\s*:\s*([^\n]+)/i);
          const fileMatch = description.match(/(?:create|write|edit|modify)\s*`([^`]+)`/i) || description.match(/(?:create file|write file|create|write)\s*:\s*([^\n]+)/i);

          if (cmdMatch) {
            actionType = 'execute_command';
            actionTarget = cmdMatch[1].trim();
          } else if (fileMatch) {
            actionType = 'create_file';
            actionTarget = fileMatch[1].trim();
          }

          steps.push({
            id: `step-${stepCounter++}`,
            description,
            status: 'pending',
            actionType,
            actionTarget,
          });
        }
      }
    }

    if (steps.length > 0) {
      stages.push({ title, steps });
    }
  }

  // Fallback to extract bulleted items as checklist if no structured stages are parsed
  if (stages.length === 0) {
    const steps: PlanStep[] = [];
    text.split('\n').forEach((line) => {
      const bullet = line.match(/^\s*[-*+]\s*(?:\[[\sX]*\])?\s*(.*)/i) || line.match(/^\s*\d+\.\s*(?:\[[\sX]*\])?\s*(.*)/i);
      if (bullet) {
        const description = bullet[1].trim();
        if (description.length > 5 && (line.includes('[ ]') || line.includes('[x]') || description.toLowerCase().includes('run') || description.toLowerCase().includes('create') || description.toLowerCase().includes('file'))) {
          steps.push({
            id: `step-${stepCounter++}`,
            description,
            status: 'pending',
          });
        }
      }
    });

    if (steps.length > 0) {
      stages.push({ title: 'Plan Action Tasks', steps });
    }
  }

  if (!objective && !understanding && stages.length === 0) {
    return null;
  }

  return { objective, understanding, risks, complexity, stages };
}
