import { HumanlyContext, HumanlyTone } from '../types/humanly.ts';

export interface SamplePreset {
  id: string;
  name: string;
  context: HumanlyContext;
  suggestedTone: HumanlyTone;
  protectedTerms: string[];
  description: string;
  roboticText: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'recruiter-feedback',
    name: 'Recruiter Feedback (Rejection & Guidance)',
    context: 'recruiter_feedback',
    suggestedTone: 'conversational',
    protectedTerms: ['Elena Rostova', 'Kubernetes', '3.5/5.0'],
    description: 'Robotic automated rejection with candidate score and technical requirements.',
    roboticText: `Dear Elena Rostova,

We acknowledge receipt of your candidacy regarding the Senior Cloud Architect vacancy. Furthermore, our evaluation matrix indicates that while your score of 3.5/5.0 in Kubernetes architecture was deemed satisfactory, it is imperative to state that other candidates demonstrated superior dimensional alignment. 

In conclusion, it is our duty to formally articulate that your profile will not be advanced further at this temporal juncture. Nevertheless, delve into our public repository to enhance your competencies for future iterations.

Best regards,
Automated Talent Acquisition System`,
  },
  {
    id: 'candidate-communication',
    name: 'Candidate Interview Invitation',
    context: 'candidate_communication',
    suggestedTone: 'polished',
    protectedTerms: ['Marcus Vance', 'October 16, 2026', '2:00 PM EST', 'Google Meet'],
    description: 'Stiff automated scheduling notification with precise dates and interview link.',
    roboticText: `Attention Marcus Vance:

This electronic transmission serves to officially confirm your upcoming technical synchronization session scheduled for October 16, 2026, commencing promptly at 2:00 PM EST via Google Meet.

It is paramount that you arrive 5 minutes prior to the designated timestamp. Failure to synchronize will result in automated disqualification per protocol §4B. Ensure your audio-visual peripherals are functional.

Sincerely,
Operations Protocol Unit`,
  },
  {
    id: 'interview-questions',
    name: 'System Design Interview Question',
    context: 'interview_questions',
    suggestedTone: 'conversational',
    protectedTerms: ['100,000 QPS', '99.99%', 'Redis', 'PostgreSQL'],
    description: 'Algorithmic, interrogative question with system scale metrics.',
    roboticText: `It is essential that the candidate now articulates an architectural framework to support a throughput of 100,000 QPS with an availability target of 99.99%. Furthermore, the candidate must delve into caching strategies involving Redis and persistent storage utilizing PostgreSQL. Enumerate all potential failure modes in a chronological paradigm.`,
  },
  {
    id: 'interview-summary',
    name: 'Debrief Evaluation Summary',
    context: 'interview_summaries',
    suggestedTone: 'professional',
    protectedTerms: ['Sophia Chen', 'GraphQL', 'AWS Lambda', '4.8/5.0', '$160,000'],
    description: 'Robotic interview debrief with candidate ratings and compensation tier.',
    roboticText: `Candidate Evaluation Report: Sophia Chen.
The interviewee was evaluated across multidimensional metrics. In the realm of GraphQL schema design, the subject attained an index of 4.8/5.0. Furthermore, regarding AWS Lambda serverless execution, the candidate showcased deep efficacy. Recommended compensation threshold: $160,000. It is therefore determined that the hiring committee should proceed with accession protocol.`,
  },
  {
    id: 'professional-report',
    name: 'Executive Quarterly Delivery Report',
    context: 'professional_reports',
    suggestedTone: 'polished',
    protectedTerms: ['Q3 2026', '$4.2M', '18.4%', 'Project Titan'],
    description: 'Bureaucratic corporate report with revenue metrics and project name.',
    roboticText: `Executive Memorandum: Performance Evaluation for Q3 2026.
In the tapestry of our strategic organizational objectives, Project Titan has yielded gross revenue of $4.2M, representing an 18.4% escalation year-over-year. It goes without saying that synergy across operational conduits facilitated these paradigms. Moving forward, stakeholders must leverage cross-functional bandwidth to optimize future vectors.`,
  },
  {
    id: 'general-professional',
    name: 'Project Delay Notification to Stakeholders',
    context: 'general_professional',
    suggestedTone: 'professional',
    protectedTerms: ['Sprint 42', 'November 3, 2026', 'CI/CD pipeline'],
    description: 'Machine-like status email with sprint numbers and release dates.',
    roboticText: `I hope this email finds you well. It is critical to communicate that Sprint 42 has encountered unforeseen impediments regarding the CI/CD pipeline. Consequently, release deployment is rescheduled to November 3, 2026. Delve into the attached Jira documentation for comprehensive granularity. We apologize for any inconvenience caused.`,
  },
];
