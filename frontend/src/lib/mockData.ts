import { Job, MatchResult } from "./types";

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    location: "New York, NY",
    seniority: "Senior",
    skills: ["React", "TypeScript", "Node.js", "AWS"],
    department: "Engineering",
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "Product Designer",
    location: "San Francisco, CA",
    seniority: "Mid",
    skills: ["Figma", "Design Systems", "Prototyping"],
    department: "Design",
    posted: "1 day ago",
  },
  {
    id: "3",
    title: "Data Scientist",
    location: "Remote",
    seniority: "Senior",
    skills: ["Python", "ML", "TensorFlow", "SQL"],
    department: "Data",
    posted: "3 days ago",
  },
  {
    id: "4",
    title: "Marketing Coordinator",
    location: "Chicago, IL",
    seniority: "Entry",
    skills: ["Content Strategy", "Analytics", "SEO"],
    department: "Marketing",
    posted: "5 days ago",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    location: "Austin, TX",
    seniority: "Mid",
    skills: ["Kubernetes", "Terraform", "CI/CD", "Docker"],
    department: "Infrastructure",
    posted: "1 day ago",
  },
  {
    id: "6",
    title: "Frontend Developer",
    location: "Remote",
    seniority: "Mid",
    skills: ["Vue.js", "CSS", "JavaScript", "GraphQL"],
    department: "Engineering",
    posted: "4 days ago",
  },
  {
    id: "7",
    title: "Technical Program Manager",
    location: "Seattle, WA",
    seniority: "Senior",
    skills: ["Agile", "Roadmapping", "Stakeholder Mgmt"],
    department: "Product",
    posted: "2 days ago",
  },
  {
    id: "8",
    title: "Junior Analyst",
    location: "Boston, MA",
    seniority: "Entry",
    skills: ["Excel", "SQL", "Tableau"],
    department: "Finance",
    posted: "6 days ago",
  },
  {
    id: "9",
    title: "Cloud Architect",
    location: "Denver, CO",
    seniority: "Senior",
    skills: ["AWS", "Azure", "Microservices", "Security"],
    department: "Infrastructure",
    posted: "1 day ago",
  },
];

export const mockMatchResults: MatchResult[] = [
  {
    job: mockJobs[0],
    score: 95,
    reasoning:
      "Your 7+ years of experience with React and TypeScript directly aligns with this role's core requirements. Your background in building scalable distributed systems at your current company demonstrates the architectural thinking needed for this senior position. Additionally, your AWS certifications and experience with CI/CD pipelines match the infrastructure expectations outlined in the job description.",
  },
  {
    job: mockJobs[4],
    score: 87,
    reasoning:
      "Your containerization experience and familiarity with infrastructure-as-code tools make you a strong candidate. Your background in CI/CD pipeline design is particularly relevant.",
  },
  {
    job: mockJobs[8],
    score: 82,
    reasoning:
      "Your AWS expertise and microservices experience align well with this cloud architecture role. Your security certifications add additional value.",
  },
  {
    job: mockJobs[6],
    score: 74,
    reasoning:
      "Your cross-functional collaboration skills and technical background make you a viable candidate for this program management position.",
  },
];
