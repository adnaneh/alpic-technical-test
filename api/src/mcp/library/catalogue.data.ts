export type Chapter = {
  chap_id: number;
  title: string;
  start_sec: number;
  part?: string;
};

export type Book = {
  book_id: number;
  title: string;
  author: string;
  audio_url: string;
  chapters: Chapter[];
};

export const BOOKS: Book[] = [
  {
    book_id: 1,
    title: "AI Engineering: Building Applications with Foundation Models",
    author: "Chip Huyen",
    audio_url: "https://adnane-alpic-audiobooks.s3.amazonaws.com/ai-engineering.m4a",
    chapters: [
      { chap_id: 1, title: "Preface", start_sec: 0 },
      {
        chap_id: 2,
        title:
          "1. Introduction to Building AI Applications with Foundation Models",
        start_sec: 1390,
      },
      { chap_id: 3, title: "1.1 The Rise of AI Engineering", start_sec: 1580 },
      { chap_id: 4, title: "1.2 Foundation Model Use Cases", start_sec: 3640 },
      { chap_id: 5, title: "1.3 Planning AI Applications", start_sec: 5665 },
      { chap_id: 6, title: "1.4 The AI Engineering Stack", start_sec: 6836 },
      { chap_id: 7, title: "1.5 Summary", start_sec: 8590 },
      {
        chap_id: 8,
        title: "2. Understanding Foundation Models",
        start_sec: 8786,
      },
      { chap_id: 9, title: "2.1 Training Data", start_sec: 9017 },
      { chap_id: 10, title: "2.2 Modeling", start_sec: 9917 },
      { chap_id: 11, title: "2.3 Post-Training", start_sec: 13186 },
      { chap_id: 12, title: "2.4 Sampling", start_sec: 14667 },
      { chap_id: 13, title: "2.5 Summary", start_sec: 17810 },
      { chap_id: 14, title: "3. Evaluation Methodology", start_sec: 18036 },
      {
        chap_id: 15,
        title: "3.1 Challenges of Evaluating Foundation Models",
        start_sec: 18297,
      },
      {
        chap_id: 16,
        title: "3.2 Understanding Language Modeling Metrics",
        start_sec: 18762,
      },
      { chap_id: 17, title: "3.3 Exact Evaluation", start_sec: 20087 },
      { chap_id: 18, title: "3.4 AI as a Judge", start_sec: 21882 },
      {
        chap_id: 19,
        title: "3.5 Ranking Models with Comparative Evaluation",
        start_sec: 23856,
      },
      { chap_id: 20, title: "3.6 Summary", start_sec: 25275 },
      { chap_id: 21, title: "4. Evaluate AI Systems", start_sec: 25481 },
      { chap_id: 22, title: "4.1 Evaluation Criteria", start_sec: 25606 },
      { chap_id: 23, title: "4.2 Model Selection", start_sec: 28794 },
      {
        chap_id: 24,
        title: "4.3 Design Your Evaluation Pipeline",
        start_sec: 32316,
      },
      { chap_id: 25, title: "4.4 Summary", start_sec: 33903 },
      { chap_id: 26, title: "5. Prompt Engineering", start_sec: 34137 },
      { chap_id: 27, title: "5.1 Introduction to Prompting", start_sec: 34314 },
      {
        chap_id: 28,
        title: "5.2 Prompt Engineering Best Practices",
        start_sec: 35437,
      },
      {
        chap_id: 29,
        title: "5.3 Defensive Prompt Engineering",
        start_sec: 37154,
      },
      { chap_id: 30, title: "5.4 Summary", start_sec: 39505 },
      { chap_id: 31, title: "6. RAG and Agents", start_sec: 39645 },
      { chap_id: 32, title: "6.1 RAG", start_sec: 39761 },
      {
        chap_id: 33,
        title: "6.2 Comparing Retrieval Algorithms",
        start_sec: 41557,
      },
      { chap_id: 34, title: "6.3 Agents", start_sec: 43396 },
      { chap_id: 35, title: "6.4 Plan Generation", start_sec: 45306 },
      { chap_id: 36, title: "6.5 Memory", start_sec: 47111 },
      { chap_id: 37, title: "6.6 Summary", start_sec: 47767 },
      { chap_id: 38, title: "7. Finetuning", start_sec: 48001 },
      { chap_id: 39, title: "7.1 Finetuning Overview", start_sec: 48126 },
      { chap_id: 40, title: "7.2 When to Finetune", start_sec: 48746 },
      { chap_id: 41, title: "7.3 Memory Bottlenecks", start_sec: 50296 },
      { chap_id: 42, title: "7.4 Finetuning Techniques", start_sec: 52159 },
      {
        chap_id: 43,
        title: "7.5 Model Merging and Multi-task Fine Tuning",
        start_sec: 54436,
      },
      { chap_id: 44, title: "7.6 Summary", start_sec: 56400 },
      { chap_id: 45, title: "8. Dataset Engineering", start_sec: 56597 },
      { chap_id: 46, title: "8.1 Data Curation", start_sec: 56986 },
      {
        chap_id: 47,
        title: "8.2 Data Augmentation and Synthesis",
        start_sec: 59375,
      },
      { chap_id: 48, title: "8.3 Data Processing", start_sec: 62410 },
      { chap_id: 49, title: "8.4 Summary", start_sec: 63351 },
      { chap_id: 50, title: "9. Inference Optimization", start_sec: 63556 },
      {
        chap_id: 51,
        title: "9.1 Understanding Inference Optimization",
        start_sec: 63730,
      },
      { chap_id: 52, title: "9.2 Inference Optimization", start_sec: 66944 },
      { chap_id: 53, title: "9.3 Summary", start_sec: 69957 },
      {
        chap_id: 54,
        title: "10. AI Engineering Architecture and User Feedback",
        start_sec: 70248,
      },
      {
        chap_id: 55,
        title: "10.1 AI Engineering Architecture",
        start_sec: 70339,
      },
      { chap_id: 56, title: "10.2 User Feedback", start_sec: 73604 },
      { chap_id: 57, title: "10.3 Summary", start_sec: 75966 },
    ],
  },
  {
    book_id: 2,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    audio_url: "https://adnane-alpic-audiobooks.s3.amazonaws.com/ddia.m4a",
    chapters: [
      { chap_id: 58, title: "Preface", start_sec: 116 },
      {
        chap_id: 59,
        title: "Reliable, Scalable, and Maintainable Applications",
        start_sec: 882,
        part: "Part I. Foundations of Data Systems",
      },
      {
        chap_id: 60,
        title: "Data Models and Query Languages",
        start_sec: 4301,
        part: "Part I. Foundations of Data Systems",
      },
      {
        chap_id: 61,
        title: "Storage and Retrieval",
        start_sec: 9025,
        part: "Part I. Foundations of Data Systems",
      },
      {
        chap_id: 62,
        title: "Encoding and Evolution",
        start_sec: 14293,
        part: "Part I. Foundations of Data Systems",
      },
      {
        chap_id: 63,
        title: "Replication",
        start_sec: 18693,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 64,
        title: "Partitioning",
        start_sec: 25407,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 65,
        title: "Transactions",
        start_sec: 28197,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 66,
        title: "The Trouble with Distributed Systems",
        start_sec: 35239,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 67,
        title: "Consistency and Consensus",
        start_sec: 42080,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 68,
        title: "Using total order broadcast",
        start_sec: 46448,
        part: "Part II. Distributed Data",
      },
      {
        chap_id: 69,
        title: "Batch Processing",
        start_sec: 51166,
        part: "Part III. Derived Data",
      },
      {
        chap_id: 70,
        title: "The output of batch workflows",
        start_sec: 54809,
        part: "Part III. Derived Data",
      },
      {
        chap_id: 71,
        title: "Stream Processing",
        start_sec: 58467,
        part: "Part III. Derived Data",
      },
      {
        chap_id: 72,
        title: "The Future of Data Systems",
        start_sec: 65488,
        part: "Part III. Derived Data",
      },
      {
        chap_id: 73,
        title: "Duplicate suppression",
        start_sec: 70357,
        part: "Part III. Derived Data",
      },
    ],
  },
  {
    book_id: 3,
    title: "Inspired: How to Create Tech Products Customers Love",
    author: "Marty Cagan",
    audio_url: "https://adnane-alpic-audiobooks.s3.amazonaws.com/inspired.m4a",
    chapters: [
      {
        chap_id: 74,
        title: "Preface",
        start_sec: 0,
      },
      {
        chap_id: 76,
        title: "PART I LESSONS FROM TOP TECH COMPANIES",
        start_sec: 252,
      },
      {
        chap_id: 77,
        title: "Behind Every Great Product",
        start_sec: 540,
      },
      {
        chap_id: 78,
        title: "Technology-Powered Products and Services",
        start_sec: 663,
      },
      {
        chap_id: 79,
        title: "Startups: Getting to Product/Marketing Fit",
        start_sec: 775,
      },
      {
        chap_id: 80,
        title: "Growth-Stage Companies: Scaling to Success",
        start_sec: 901,
      },
      {
        chap_id: 81,
        title: "Enterprise Companies: Consistent Product Innovation",
        start_sec: 1025,
      },
      {
        chap_id: 82,
        title: "The Root Causes of Failed Product Efforts",
        start_sec: 1199,
      },
      {
        chap_id: 83,
        title: "Beyond Lean and Agile",
        start_sec: 1946,
      },
      {
        chap_id: 84,
        title: "Key Concepts",
        start_sec: 2176,
      },
      {
        chap_id: 85,
        title: "PART II THE RIGHT PEOPLE",
        start_sec: 2767,
      },
      {
        chap_id: 86,
        title: "Principles of Strong Product Teams",
        start_sec: 2833,
      },
      {
        chap_id: 87,
        title: "The Product Manager",
        start_sec: 3692,
      },
      {
        chap_id: 88,
        title: "The Product Designer",
        start_sec: 4996,
      },
      {
        chap_id: 89,
        title: "The Engineers",
        start_sec: 5631,
      },
      {
        chap_id: 90,
        title: "Product Marketing Managers",
        start_sec: 5998,
      },
      {
        chap_id: 91,
        title: "The Supporting Roles",
        start_sec: 6258,
      },
      {
        chap_id: 92,
        title: "Profile: Jane Manning of Google",
        start_sec: 6548,
      },
      {
        chap_id: 93,
        title: "The Role of Leadership",
        start_sec: 6825,
      },
      {
        chap_id: 94,
        title: "The Head of Product Role",
        start_sec: 7243,
      },
      {
        chap_id: 95,
        title: "The Head of Technology Role",
        start_sec: 7990,
      },
      {
        chap_id: 96,
        title: "The Delivery Manager Role",
        start_sec: 8324,
      },
      {
        chap_id: 97,
        title: "Principles of Structuring Product Teams",
        start_sec: 8441,
      },
      {
        chap_id: 98,
        title: "Profile: Lea Hickman of Adobe",
        start_sec: 9457,
      },
      {
        chap_id: 99,
        title: "PART III THE RIGHT PRODUCT",
        start_sec: 9845,
      },
      {
        chap_id: 100,
        title: "The Problems with Product Roadmaps",
        start_sec: 10016,
      },
      {
        chap_id: 101,
        title: "The Alternative to Roadmaps",
        start_sec: 10253,
      },
      {
        chap_id: 102,
        title: "Product Vision and Product Strategy",
        start_sec: 10816,
      },
      {
        chap_id: 103,
        title: "Principles of Product Vision",
        start_sec: 11310,
      },
      {
        chap_id: 104,
        title: "Principles of Product Strategy",
        start_sec: 11549,
      },
      {
        chap_id: 105,
        title: "Product Principles",
        start_sec: 11678,
      },
      {
        chap_id: 106,
        title: "The OKR Technique",
        start_sec: 11948,
      },
      {
        chap_id: 107,
        title: "Product Team Objectives",
        start_sec: 12183,
      },
      {
        chap_id: 108,
        title: "Product Objectives @ Scale",
        start_sec: 12604,
      },
      {
        chap_id: 109,
        title: "Product Evangelism",
        start_sec: 12861,
      },
      {
        chap_id: 110,
        title: "Profile: Alex Pressland of the BBC",
        start_sec: 13153,
      },
      {
        chap_id: 111,
        title: "PART IV THE RIGHT PROCESS",
        start_sec: 13377,
      },
      {
        chap_id: 112,
        title: "Principles of Product Discovery",
        start_sec: 13792,
      },
      {
        chap_id: 113,
        title: "Discovery Techniques Overview",
        start_sec: 14396,
      },
      {
        chap_id: 114,
        title: "Opportunity Assessment Technique",
        start_sec: 15119,
      },
      {
        chap_id: 115,
        title: "Customer Letter Technique",
        start_sec: 15330,
      },
      {
        chap_id: 116,
        title: "Startup Canvas Technique",
        start_sec: 15603,
      },
      {
        chap_id: 117,
        title: "Story Map Technique",
        start_sec: 16110,
      },
      {
        chap_id: 118,
        title: "Customer Discovery Program Technique",
        start_sec: 16296,
      },
      {
        chap_id: 119,
        title: "Profile: Martina Lauchengco of Microsoft",
        start_sec: 17490,
      },
      {
        chap_id: 120,
        title: "Customer Interviews",
        start_sec: 17921,
      },
      {
        chap_id: 121,
        title: "Concierge Test Technique",
        start_sec: 18195,
      },
      {
        chap_id: 122,
        title: "The Power of Customer Misbehavior",
        start_sec: 18313,
      },
      {
        chap_id: 123,
        title: "Hack Days",
        start_sec: 18590,
      },
      {
        chap_id: 124,
        title: "Principles of Prototypes",
        start_sec: 18959,
      },
      {
        chap_id: 125,
        title: "Feasibility Prototype Technique",
        start_sec: 19124,
      },
      {
        chap_id: 126,
        title: "User Prototype Technique",
        start_sec: 19332,
      },
      {
        chap_id: 127,
        title: "Live-Data Prototype Technique",
        start_sec: 19562,
      },
      {
        chap_id: 128,
        title: "Hybrid Prototype Technique",
        start_sec: 19771,
      },
      {
        chap_id: 129,
        title: "Testing Usability",
        start_sec: 20094,
      },
      {
        chap_id: 130,
        title: "Testing Value",
        start_sec: 20909,
      },
      {
        chap_id: 131,
        title: "Demand Testing Techniques",
        start_sec: 21089,
      },
      {
        chap_id: 132,
        title: "Qualitative Value Testing Techniques",
        start_sec: 21697,
      },
      {
        chap_id: 133,
        title: "Quantitative Value Testing Techniques",
        start_sec: 22184,
      },
      {
        chap_id: 134,
        title: "Testing Feasibility",
        start_sec: 23088,
      },
      {
        chap_id: 135,
        title: "Testing Business Viability",
        start_sec: 23425,
      },
      {
        chap_id: 136,
        title: "Profile: Kate Arnold of Netflix",
        start_sec: 24032,
      },
      {
        chap_id: 137,
        title: "Discovery Sprint Technique",
        start_sec: 24391,
      },
      {
        chap_id: 138,
        title: "Pilot Team Technique",
        start_sec: 24856,
      },
      {
        chap_id: 139,
        title: "Weaning an Organization Off Roadmaps",
        start_sec: 25004,
      },
      {
        chap_id: 140,
        title: "Managing Stakeholders",
        start_sec: 25281,
      },
      {
        chap_id: 141,
        title: "Communicating Product Learnings",
        start_sec: 26103,
      },
      {
        chap_id: 142,
        title: "Profile: Camille Hearst of Apple",
        start_sec: 26250,
      },
      {
        chap_id: 143,
        title: "PART V THE RIGHT CULTURE",
        start_sec: 26455,
      },
      {
        chap_id: 144,
        title: "Good Product Team/Bad Product Team",
        start_sec: 26510,
      },
      {
        chap_id: 145,
        title: "Top Reasons for Loss of Innovation",
        start_sec: 26870,
      },
      {
        chap_id: 146,
        title: "Top Reasons for Loss of Velocity",
        start_sec: 27193,
      },
      {
        chap_id: 147,
        title: "Establishing a Strong Product Culture",
        start_sec: 27423,
      },
      {
        chap_id: 148,
        title: "Acknowledgments",
        start_sec: 27747,
      },
    ],
  },
];
