// Prepo.ai - AI Academy Course Data
// 10 Comprehensive, Student-Centric Modules with Book-Like Interactive Pages

export const AI_ACADEMY_MODULES = [
  {
    id: 'what-is-ai',
    moduleNumber: 1,
    title: 'What is AI?',
    subtitle: 'Demystifying Artificial Intelligence through daily life & relatable analogies',
    category: 'fundamentals',
    level: 'Beginner',
    readTime: '6 min read',
    icon: 'Bot',
    themeColor: {
      primary: '#2563eb', // blue
      badge: 'bg-blue-100 text-blue-800',
      spine: 'from-blue-700 to-blue-900',
      cover: 'from-blue-600 via-indigo-600 to-blue-800',
      accent: '#3b82f6'
    },
    summary: 'AI kya hai, traditional coding se kaise alag hai, aur hum roz ise Google Maps se lekar Netflix tak kaise anjaane me use karte hain.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Magic Behind the Screen',
        subtitle: 'AI vs Traditional Programs — Ek simple example',
        content: `
### AI Kya Hai Aur Ye Itna Special Kyun Hai?
Socho agar aap kisi 5 saal ke bachhe ko billi (cat) aur kutte (dog) me farak sikhana chahte ho. Kya aap uske dimag me 1000 rules likhte ho ki "agar kaan triangle ho, 4 pair ho, aur 2 aankhein ho toh billi hai"? 

**Nahi!** Aap use 10 billiyan aur 10 kutte dikha dete ho. Bachhe ka dimaag khud patterns identify kar leta hai ki billi kaise dikhti hai aur kutta kaise.

**Traditional Software vs AI:**
- **Traditional Software (Purana Tareeka):** Programmer har ek step ka exact rule likhta hai (\`If X happens, do Y\`). Agar koi aisi situation aa gayi jiska rule nahi likha, toh software crash ho jayega!
- **Artificial Intelligence (AI):** Hum computer ko millions of examples (data) dikhate hain, aur machine khud patterns learn karti hai. Is process ko hum **Machine Learning** kehte hain.
        `,
        analogy: {
          title: '🧠 Simple Analogy: Calculator vs Human Intern',
          text: 'Ek Calculator ko sirf wahi pata hai jo formula usme feed hai. Lekin ek smart Intern ko agar aap 100 sample letters dikha do, toh wo 101-wa letter khud samajh kar naya likh sakta hai. Modern AI wahi smart intern hai!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: AI in Your Everyday Life',
        subtitle: 'Aap anjaane me roz AI use kar rahe hain!',
        content: `
Kayi log sochte hain ki AI sirf humanoid robots ya sci-fi movies me hota hai. Asal me, aapke phone me pichhle 5 saal se AI chal raha hai:

1. 🗺️ **Google Maps (Traffic Prediction):**
   Google Maps ko kaise pata chalta hai ki 5 km aage red jam hai? Lakho phones ki live GPS speed track karke AI predict karta hai ki aage traffic kitna slow hoga aur fastest alternative route konsa hai.

2. 🎬 **YouTube & Netflix Recommendations:**
   Aapke homepage par aane wali videos koi human curate nahi karta. AI aapka watch time, skip rate aur taste analyze karke wahi videos show karta hai jo aapko pasand aayengi.

3. 📸 **Smartphone Camera (Portrait Mode):**
   Aapke phone ka single lens background ko DSLR jaisa blur (bokeh) kaise karta hai? AI neural network pehle insaan ke baalon aur kapdon ki boundary detect karta hai, fir background ko intelligently blur karta hai.

4. ✉️ **Gmail Smart Compose & Spam Filter:**
   "I hope this email finds you well" ka auto-suggestion aur 99.9% scam emails ko seedha Spam folder me fekna AI classification ka kamaal hai.
        `,
        keyTakeaway: 'AI koi futuristic dream nahi hai, ye already aapke pocket me chalne wali everyday technology hai.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Student Case Study',
        subtitle: 'Rahul ne AI ko apna homework assistant kaise banaya',
        caseStudy: {
          studentName: 'Rahul (Class 11th Student)',
          challenge: 'Physics me "Doppler Effect" textbook padh kar bilkul samajh nahi aa raha tha. Formulas yaad ho rahe the par visual concept clear nahi tha.',
          aiApproach: 'Rahul ne ChatGPT ko bola: "Explain Doppler Effect to me like I am sitting at a railway station waiting for a Rajdhani train."',
          result: 'AI ne train ke siren ki sound waves ke compression ka real-life railway station example diya. Rahul ko 5 minute me concept crystal clear ho gaya aur usne agle din class test me full marks score kiye!',
          quote: '"AI se jab maine apne daily life ke examples maange, toh mujhe laga jaise koi dost samjha raha ho!"'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Copy this prompt and test in ChatGPT or Gemini right now!',
        promptBox: {
          title: 'The "Explain Like I am 12" Prompt',
          description: 'Koi bhi complex topic (Photosynthesis, Inflation, Quantum Physics) ko instant simple Hindi/English me samjhein.',
          promptText: `Mera naam ek student hai aur mujhe [TOPIC: e.g. Black Holes / Inflation / Photosynthesis] samajhna hai.
Kripya ise ek 12 saal ke student ke liye samjhaiye:
1. Ek daily-life analogy (jaise cricket, chai ya mobile games) use karo
2. 3 sabse important points batao
3. End me 2 simple questions pucho taaki mai test kar saku ki mujhe samajh aaya ya nahi.
Language: Simple Hinglish (Hindi + English).`,
          tools: ['ChatGPT', 'Google Gemini', 'Claude']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Knowledge Checkpoint',
        subtitle: 'Test your understanding before moving to Module 2',
        quiz: {
          question: 'Traditional computer programming aur AI me sabse bada farak kya hai?',
          options: [
            'Traditional programs fast hote hain, AI slow hota hai',
            'Traditional programs me human har rule likhta hai, jabki AI data se pattern khud seekhta hai',
            'AI sirf robots me chalta hai, computer me nahi',
            'Dono me koi farak nahi hota'
          ],
          correctIndex: 1,
          explanation: 'Bilkul sahi! Traditional coding me step-by-step logic human likhta hai, jabki AI machine learning ke zariye patterns khud learn karta hai.'
        }
      }
    ]
  },
  {
    id: 'how-modern-ai-works',
    moduleNumber: 2,
    title: 'How Modern AI Works',
    subtitle: 'LLMs, Neural Networks, Tokens & Training explained simply',
    category: 'fundamentals',
    level: 'Beginner',
    readTime: '7 min read',
    icon: 'Brain',
    themeColor: {
      primary: '#7c3aed', // purple
      badge: 'bg-purple-100 text-purple-800',
      spine: 'from-purple-800 to-indigo-950',
      cover: 'from-purple-700 via-violet-600 to-indigo-800',
      accent: '#8b5cf6'
    },
    summary: 'LLM kya hota hai? AI words ko tokens me kaise todta hai aur agla shabd kaise predict karta hai.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Prediction Engine',
        subtitle: 'AI soochta nahi hai, predict karta hai!',
        content: `
### Large Language Models (LLM) Asal Me Kya Hain?
Jab aap ChatGPT ya Gemini me type karte ho, toh parde ke peeche kya hota hai?

Kya computer ke paas koi 'dimaag' hai jo insaan ki tarah sochta hai? **Nahi!**

Technically, ek LLM ek **"Super-Smart Next-Word Predictor"** hota hai. 
Aapke phone ke keyboard par jab aap type karte ho *"Main kal school..."* toh keyboard upar suggest karta hai: *"jaunga"*, *"nahi jaunga"*, *"gaya tha"*.

LLM isi auto-complete ko trillions of web pages, books, Wikipedia aur research papers ke data ke basis par karta hai!
        `,
        analogy: {
          title: '🧩 Analogy: Antakshari Champion',
          text: 'Socho ek aisa insaan jisne duniya ke saare 10 lakh gaane sun rakhe hain. Jaise hi aap "Mera joota hai..." bolte ho, wo turant statistical probability se "Japani" bol deta hai kyunki usne ye combination sabse zyada baar dekha hai!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: Tokens & The Secret Math',
        subtitle: 'AI text ko numbers me kaise convert karta hai',
        content: `
### 1. Tokens Kya Hote Hain?
AI seedha alphabet ya word nahi padhta. Wo text ko chhote tukdon me divide karta hai jise **Tokens** kehte hain.
- Normal English me: **1 Token ≈ 4 characters** ya **0.75 words**.
- 1000 Tokens lagbhag 750 words ke barabar hote hain.

\`"Prepo.ai is awesome"\` -> \`["Prep", "o", ".ai", " is", " awesome"]\`

### 2. Neural Weights (Dimaag ke Connections)
Jaise insaan ke dimaag me neurons hote hain jo electric signals pass karte hain, waise hi AI me artificial neural networks hote hain.
- GPT-4 me lagbhag **1 Trillion+ parameters (connections)** hain!
- Training ke dauran ye parameters adjust hote rehte hain jab tak AI accurate answers na dene lage.
        `,
        keyTakeaway: 'Tokens = Text ke atomic pieces. Parameters = Wo knobs jinko ghumakar AI ne patterns yaad kiye hain.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Why Hallucination Happens',
        subtitle: 'AI kabhi kabhi jhooth ya galat facts kyun bolta hai?',
        caseStudy: {
          studentName: 'Ananya (B.Tech 1st Year)',
          challenge: 'Ananya ne AI se ek unknown historical war ke baare me pucha, aur AI ne bhot confident hokar 2 jhoothe dates aur fake general ka naam likh kar de diya!',
          aiApproach: 'Ananya ne samjha ki AI search engine nahi hai jo fact check kare; AI statistical language predictor hai jo grammatically correct sounding jhooth bhi bol sakta hai.',
          result: 'Ananya ne prompt me rule add kiya: "Only cite verified historical facts. If you do not know with 100% certainty, say \'I do not have verified record\'."',
          quote: '"AI is confident, not always correct. Always verify key numbers and facts!"'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Test how AI predicts next steps systematically',
        promptBox: {
          title: 'Chain of Thought (CoT) Prompt',
          description: 'AI ko direct answer dene ki jagah step-by-step thinking karne ke liye force karein taaki accuracy 90% badh jaye.',
          promptText: `Please solve this problem step-by-step:
Problem: [PASTE YOUR MATHS OR LOGIC QUESTION HERE]

Important Instructions:
1. Don't jump directly to the final answer.
2. First write down "Given Facts".
3. Show your intermediate calculation for each step.
4. Double check your arithmetic before stating the "Final Answer".`,
          tools: ['ChatGPT', 'Google Gemini']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Can you crack this LLM concept question?',
        quiz: {
          question: 'AI text processing me "Token" ka kya matlab hai?',
          options: [
            'Ek crypto coin jisse AI ko payment hoti hai',
            'Text ka chhota tukda (sub-word/characters) jise model mathematical form me process karta hai',
            'Computer ka processor chip',
            'User ka password'
          ],
          correctIndex: 1,
          explanation: 'Right! Tokens are chunks of characters that LLMs convert into numbers (vectors) to predict what comes next.'
        }
      }
    ]
  },
  {
    id: 'meet-chatgpt-gemini-claude',
    moduleNumber: 3,
    title: 'Meet ChatGPT, Gemini & Claude',
    subtitle: 'Which AI tool should you use, when, and why?',
    category: 'tools',
    level: 'Beginner',
    readTime: '6 min read',
    icon: 'MessageSquare',
    themeColor: {
      primary: '#059669', // emerald
      badge: 'bg-emerald-100 text-emerald-800',
      spine: 'from-emerald-800 to-teal-950',
      cover: 'from-emerald-600 via-teal-600 to-green-800',
      accent: '#10b981'
    },
    summary: 'ChatGPT, Google Gemini aur Claude ka ultimate comparison. Logic ke liye kaun sa best hai aur writing ke liye kaun sa?',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Big Three of AI',
        subtitle: 'Har tool ka apna super-power hota hai',
        content: `
Duniya me 3 sabse famous AI models hain. Har model ka apna nature aur strength hai:

### 1. 🟢 ChatGPT (OpenAI) — The All-Rounder
- **Best For:** General problem solving, coding, reasoning, structured logic, and custom GPTs.
- **Vibe:** Ek brilliant senior engineer ya sharp consultant jise har field ki deep technical knowledge hai.

### 2. 🔵 Google Gemini — The Live Web & Research King
- **Best For:** Real-time information, YouTube video analysis, Google Workspace (Docs, Gmail) integration, and multimodal tasks (images, audio).
- **Vibe:** Ek researcher jo Google Search ke live data par baitha hai aur 1 million words ka context ek saath samajh sakta hai.

### 3. 🟠 Claude (Anthropic) — The Master Writer & Coder
- **Best For:** Human-like nuanced writing, creative essays, huge coding projects (Claude 3.5 Sonnet), and safety.
- **Vibe:** Ek Oxford literature professor jo coding me bhi master coder hai.
        `,
        analogy: {
          title: '🏎️ The Vehicle Analogy',
          text: 'ChatGPT ek Tesla car hai (smart & feature-packed), Gemini ek High-speed Bullet Train hai (connected to massive Google tracks), aur Claude ek luxury Rolls-Royce hai (smoothest writing style).'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The Right Tool for the Right Task',
        subtitle: 'Student Decision Matrix',
        content: `
| Student Task | Recommended Tool | Why? |
|---|---|---|
| **Coding & Debugging** | Claude 3.5 Sonnet or ChatGPT | Code clean likhte hain aur edge cases identify karte hain |
| **Latest News & Research** | Google Gemini | Seedha Google Search engine se live data fetch karta hai |
| **College Essay / Statement of Purpose (SOP)** | Claude | Robotic sounding nahi lagta, natural human tone hoti hai |
| **Maths & Step-by-step Science** | ChatGPT (o-series / 4o) | High reasoning benchmarks and LaTeX equations support |
| **YouTube Video Summaries** | Google Gemini | Direct YouTube link paste karke video ka chapter breakdown deta hai |
        `,
        keyTakeaway: 'Kabhi bhi sirf ek AI par dependent mat raho. Task ke hisaab se sahi tool pick karo!'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Real Workflow Showcase',
        subtitle: 'Kaise Shreya ne 3 AI tools combine karke presentation banayi',
        caseStudy: {
          studentName: 'Shreya (MBA Student)',
          challenge: '2 din me EV (Electric Vehicles) market par 20-slide research presentation deni thi.',
          aiApproach: '1. **Gemini** se latest 2024-2025 Indian EV sales data & government subsidies fetch kiye.\n2. **ChatGPT** se SWOT analysis aur business strategy framework build kiya.\n3. **Claude** se executive summary aur slide speech notes likhwaye.',
          result: 'Presentation top 3 rank me aayi aur professor ne research depth ki tareef ki.',
          quote: '"Combining the right tool for the right job saves 80% of your time."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Compare all 3 tools using this exact prompt',
        promptBox: {
          title: 'The AI Comparison Benchmark Prompt',
          description: 'Is prompt ko teeno tools me daalo aur dekho teeno ka style kaise alag hai!',
          promptText: `Act as a career mentor for a college student.
Topic: "Should a student learn AI development or focus on core Data Structures & Algorithms (DSA) first?"

Provide:
1. Short direct verdict (1 sentence)
2. Pros of focusing on DSA first
3. Pros of jumping into AI libraries early
4. Recommended balanced 6-month study roadmap for a college sophomore.
Tone: Practical, realistic, and inspiring.`,
          tools: ['ChatGPT', 'Google Gemini', 'Claude']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Which tool would you recommend?',
        quiz: {
          question: 'Agar aapko kisi YouTube video ka 5-minute summary chahiye bina poori 1 ghante ki video dekhe, toh konsa tool sabse best hai?',
          options: [
            'Offline Notepad',
            'Google Gemini (direct video link integration ke saath)',
            'Standard MS Word',
            'A calculator'
          ],
          correctIndex: 1,
          explanation: 'Google Gemini YouTube videos ke transcripts ko directly ingest karke high-quality summaries generate karne me expert hai.'
        }
      }
    ]
  },
  {
    id: 'prompt-engineering',
    moduleNumber: 4,
    title: 'Prompt Engineering',
    subtitle: 'Master the art of giving crystal-clear instructions to AI',
    category: 'productivity',
    level: 'Intermediate',
    readTime: '8 min read',
    icon: 'PenTool',
    themeColor: {
      primary: '#d97706', // amber
      badge: 'bg-amber-100 text-amber-800',
      spine: 'from-amber-800 to-amber-950',
      cover: 'from-amber-600 via-orange-600 to-yellow-800',
      accent: '#f59e0b'
    },
    summary: 'Bad prompt vs Good prompt ka farak samjhein. The 5-Part Perfect Prompt Formula jo aapko 10x better answers dega.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: Garbage In, Garbage Out',
        subtitle: 'Kyun 90% log AI se mediocre output paate hain?',
        content: `
Kayi log ChatGPT par jaate hain aur likhte hain:
> *"Write an essay on climate change"*

Aur fir bolte hain: *"Yaar AI toh bhot boring aur generic likhta hai!"*

Lekin sach ye hai: **AI utna hi smart hai jitna clear aapka instruction (prompt) hai.**

Agar aap chef ko bologe *"kuchh khana bana do"*, toh wo plain khichdi bana kar de dega. Lekin agar aap bologe *"mujhe spicy paneer tikka chahiye jisme kam tel ho aur thoda lemon sprinkle ho"*, tab wo world-class dish dega.

Yahi difference hai ek **Amateur Prompt** aur ek **Engineering-grade Prompt** me!
        `,
        analogy: {
          title: '🎬 The Film Director Analogy',
          text: 'Socho AI ek Oscar-winning actor hai. Agar director bolega "acting karo", actor confuse ho jayega. Lekin jab director bolega "tum ek retired detective ho jiska phone raat ke 2 baje baja hai, angry tone me bolo", tab magic banta hai!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The 5-Part Perfect Prompt Formula',
        subtitle: 'R-T-C-F-E Blueprint for unbeatable AI responses',
        content: `
Jab bhi koi serious prompt likho, ye 5 elements check karo:

1. **R — Role (Kaun bol raha hai?):**
   *Example:* "Act as an expert IIT Physics Professor with 20 years of teaching experience."
2. **T — Task (Exact kya karna hai?):**
   *Example:* "Explain Newton's Third Law of Motion."
3. **C — Context (Audience aur background kya hai?):**
   *Example:* "My audience is 10th class ICSE students who find math formulas intimidating."
4. **F — Format (Output kaisa dikhna chahiye?):**
   *Example:* "Use 1 real world sports example, bullet points, and a table comparing Action vs Reaction."
5. **E — Exclusions / Constraints (Kya NAHI karna hai?):**
   *Example:* "Do not use complex calculus derivatives. Keep word count strictly under 250 words."
        `,
        keyTakeaway: 'Role + Task + Context + Format + Constraints = Flawless output on the first try!'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Before vs After Transformation',
        subtitle: 'Dekhiye prompt change karne se output kaise badalta hai',
        caseStudy: {
          studentName: 'Vikram (Engineering Final Year)',
          challenge: 'Campus placement interview ke liye HR questions ki practice karni thi.',
          aiApproach: `❌ **Weak Prompt:** "Give me HR interview questions."
(Result: Generic 5 boring questions mil gaye jo sabko aate hain)

✅ **Power Prompt:** "Act as a tough Google Engineering HR Manager. Interview me for a Junior Backend Software Engineer role. Ask me one realistic question at a time. After I type my reply, evaluate my answer on a scale of 1-10, give 2 points of critical feedback, and then ask the next question."`,
          result: 'Vikram ne 10 interactive rounds ki mock practice ki aur real interview me confident hokar offer letter crack kiya!',
          quote: '"Interactive roleplaying prompts turn AI into an active sparring partner."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Copy the Ultimate Master Prompt Template',
        promptBox: {
          title: 'The Universal 5-Part Prompt Template',
          description: 'Ise copy karein aur square brackets [ ] ko apni zaroorat ke hisaab se customize karein.',
          promptText: `Act as an expert [ROLE: e.g. Senior Career Counselor / Academic Mentor / Tech Lead].

TASK: I need you to help me with [SPECIFIC TASK: e.g. prepare an SOP / understand a difficult syllabus chapter / plan a project].

CONTEXT:
- My current level: [e.g. 2nd Year Computer Science student]
- My goal: [e.g. getting an internship / scoring 90%+ in semester exams]

FORMAT & GUIDELINES:
1. Provide a step-by-step structured breakdown
2. Include at least 2 practical real-world examples
3. Use simple, conversational language without robotic jargon
4. Keep the response concise and actionable

CONSTRAINTS:
- Do not give generic high-level advice. Give specific actionable steps.`,
          tools: ['ChatGPT', 'Google Gemini', 'Claude']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Test your prompt mastery',
        quiz: {
          question: 'AI ko "hallucinate" (apne man se galat facts banana) karne se rokne ke liye prompt me kya constraint daalna chahiye?',
          options: [
            '"Please answer very quickly"',
            '"If you do not have verified facts, explicitly state that you don\'t know rather than guessing"',
            '"Write in all capital letters"',
            '"Use very complicated vocabulary"'
          ],
          correctIndex: 1,
          explanation: 'Explicitly telling the AI to admit uncertainty prevents it from filling gaps with fabricated details.'
        }
      }
    ]
  },
  {
    id: 'ai-for-research-learning',
    moduleNumber: 5,
    title: 'AI for Research & Learning',
    subtitle: 'Extract insights, summarize 50-page PDFs & cross-verify citations',
    category: 'productivity',
    level: 'Intermediate',
    readTime: '7 min read',
    icon: 'Search',
    themeColor: {
      primary: '#0891b2', // cyan
      badge: 'bg-cyan-100 text-cyan-800',
      spine: 'from-cyan-800 to-cyan-950',
      cover: 'from-cyan-600 via-teal-600 to-blue-800',
      accent: '#06b6d4'
    },
    summary: 'Research papers, long PDFs aur complex books ko 10x speed se summarize aur analyze karna seekhein.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Research Supercharger',
        subtitle: '50-page document ko 5 minute me digest karein',
        content: `
College aur competitive exams me sabse bada challenge hota hai: **Information Overload**.
Har semester me 500-page textbooks, lengthy research papers aur endless PDFs padhni hoti hain.

Lekin modern AI models (jaise NotebookLM, Gemini 1.5 Pro, Claude) 1 million+ words ka context ek saath read kar sakte hain!

Iska matlab:
- Aap 100-page PDF upload karke seedha puch sakte ho: *"Is paper me Author ka main hypothesis kya tha aur usne kya limitations mention ki hain?"*
- Aur AI exact page number reference ke saath aapko answer extract karke dega!
        `,
        analogy: {
          title: '📑 The Super-Librarian Analogy',
          text: 'Socho ek aisa librarian jo poori library ki har book ka har page yaad rakhta hai. Aap use bolo "page 42 aur page 108 me kya contradiction hai?", wo 2 second me dono passages nikal kar match kar dega.'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The Golden Rules of AI Research',
        subtitle: 'Fact-checking and citation verification methods',
        content: `
AI se research karte waqt ye 3 rules hamesha follow karein:

1. **Never Accept Raw Facts Blindly:**
   AI statistical text generate karta hai. Scientific numbers, historical dates aur legal citations ko hamesha original source se cross-check karein.

2. **Use "Grounded" Tools (NotebookLM / Perplexity):**
   - **NotebookLM (Google):** Sirf aapke upload kiye gaye documents ke basis par answer karta hai (Zero hallucination, 100% source citations).
   - **Perplexity.ai:** Live web search karta hai aur har statement ke aage footnote link deta hai.

3. **Ask for Counter-Arguments:**
   Research tab strong hoti hai jab aap dono sides dekhein. Prompt karein: *"What are the top 3 criticisms of this theory?"*
        `,
        keyTakeaway: 'Use AI to synthesize and navigate text, but use your own critical judgment to verify conclusions.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Real Research Case Study',
        subtitle: 'Pooja ne apni thesis literature review kaise complete ki',
        caseStudy: {
          studentName: 'Pooja (M.Sc Biotechnology)',
          challenge: '30 alag-alag international research papers ka comparative literature review banana tha jisme 3 hafte lagte.',
          aiApproach: 'Pooja ne papers ko NotebookLM me upload kiya aur prompt diya: "Create a comparative matrix table comparing: Author, Methodology Used, Sample Size, Key Finding, and Identified Limitations."',
          result: '1 ghante me accurate comparative table ready ho gayi, jisse Pooja ne 2 hafte ka time bacha liya!',
          quote: '"NotebookLM gave me direct quotes and page citations for every point. Zero guesswork."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Syllabus Deep-Dive & Synthesis Prompt',
        promptBox: {
          title: 'The Executive Research Synthesizer',
          description: 'Kisi bhi lambe text ya article ko deep actionable summary me convert karein.',
          promptText: `Act as a senior research analyst. Analyze the following text/document thoroughly:

[PASTE YOUR LONG TEXT / ARTICLE / CHAPTER HERE]

Deliver the output in this exact structure:
1. Executive Summary: The single core thesis in 2 sentences.
2. 5 Key Takeaways: Bulleted highlights with core reasoning.
3. Methodologies or Arguments: What evidence does the author provide?
4. Potential Blindspots / Counter-Perspectives: What did the author overlook?
5. Glossary: 3 complex terms explained in simple language.`,
          tools: ['Google Gemini', 'Claude', 'ChatGPT']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Test your academic AI ethics',
        quiz: {
          question: 'Kisi research paper ya study ko summarize karte waqt "Citation Hallucination" se bachne ka sabse safe tareeka kya hai?',
          options: [
            'AI se direct quote aur page number maang kar original document me verify karna',
            'AI par 100% bharosa karna',
            'Sirf summary padhna aur original file delete kar dena',
            'AI ko short answers dene ko bolna'
          ],
          correctIndex: 0,
          explanation: 'Always verify claims against original page citations provided in your source materials.'
        }
      }
    ]
  },
  {
    id: 'ai-as-personal-tutor',
    moduleNumber: 6,
    title: 'AI as Your Personal Tutor',
    subtitle: 'Learn difficult Maths, Physics, Chemistry & Coding concepts 24/7',
    category: 'productivity',
    level: 'Beginner',
    readTime: '7 min read',
    icon: 'GraduationCap',
    themeColor: {
      primary: '#4f46e5', // indigo
      badge: 'bg-indigo-100 text-indigo-800',
      spine: 'from-indigo-800 to-indigo-950',
      cover: 'from-indigo-600 via-blue-700 to-slate-900',
      accent: '#6366f1'
    },
    summary: 'AI ko ek Socratic tutor banayein jo seedha answer na dekar aapko step-by-step sochna sikhaye.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Infinite Patience Teacher',
        subtitle: 'Jo kabhi gussa nahi hota chahe aap 50 baar pucho',
        content: `
Har student ke saath ye hota hai: class me teacher ne derivation ya numerical samjhaya, baaki bachho ne bola *"yes sir samajh aa gaya"*, par aapko sharam aayi ki *"agar maine dubara pucha toh log sochenge mujhe itna bhi nahi aata!"*

**AI ke saath koi sharam nahi hai.**
- Aap AI ko bol sakte ho: *"Mujhe ye step samajh nahi aaya, ise kisi cricket match ke example se samjhao."*
- Agar fir bhi samajh na aaye, toh bolo: *"Abhi bhi clear nahi hua, aur simple tareeke se samjhao."*
- AI bina gussa huye, bina judge kiye, 100 alag tareeqon se samjhayega!
        `,
        analogy: {
          title: '🧘 The Zen Master Analogy',
          text: 'AI ek aisa 24/7 personal tutor hai jiske paas infinite patience hai. Wo raat ke 2 baje bhi wahi energy ke saath aapko Organic Chemistry mechanism sikhayega jo subah ke 10 baje!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The Socratic Method Technique',
        subtitle: 'Seedha answer copy mat karo — sochna seekho!',
        content: `
Sabse badi galti jo students karte hain:
> Question ka photo click kiya ya text paste kiya aur bola *"Give me the solution."*

Isse exam me marks nahi aayenge kyunki aapke dimaag ne mehnat nahi ki!

### The Socratic Prompt Method:
AI ko instruct karein:
> *"Do NOT give me the direct answer. Act as a Socrates tutor. Ask me guiding questions step-by-step to help me solve the problem myself. If I make a mistake, gently point out where my logic failed."*

Is tareeqe se aapka brain neural pathways build karta hai jo exams me yaad aate hain!
        `,
        keyTakeaway: 'The goal is not to get the homework done; the goal is to build the brain muscle that can solve it in the exam hall.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Student Breakthrough',
        subtitle: 'Karan ne Calculus integration me dar kaise khatam kiya',
        caseStudy: {
          studentName: 'Karan (12th CBSE Science)',
          challenge: 'Integration by Parts ke formulas samajh aate the par numericals me kaunsa function \'u\' maanna hai aur kaunsa \'v\' (ILATE rule) me hamesha confuse hota tha.',
          aiApproach: 'Karan ne AI ko apna Socratic Coach banaya. AI ne Karan ko 5 customized practice problems diye aur har step par pucha: "Yahan first function kya choose karoge aur kyun?"',
          result: '2 ghante ke interactive drill ke baad Karan ka confidence 100% ho gaya aur unit test me usne integration section me full marks score kiye.',
          quote: '"When AI prompts you to think rather than just handing you the answer key, true learning happens."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'The 24/7 Socratic Personal Tutor Prompt',
        promptBox: {
          title: 'The Socratic STEM Tutor Prompt',
          description: 'Is prompt ko copy karke kisi bhi tough question ke liye use karein.',
          promptText: `Act as my personal Socratic tutor for [SUBJECT: e.g. Organic Chemistry / Calculus / Physics / Data Structures].

Here is a problem I am struggling with:
"[PASTE QUESTION HERE]"

RULES FOR YOU AS MY TUTOR:
1. Do NOT reveal the full solution or final answer yet.
2. Tell me what fundamental concept or formula this question tests.
3. Ask me what the first step should be to solve it, and wait for my reply.
4. When I answer, give feedback on my step, correct any misconception, and guide me to the next step.
Language: Encouraging Hinglish.`,
          tools: ['ChatGPT', 'Google Gemini', 'Claude']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Check your study habits',
        quiz: {
          question: 'AI ko study assistant ki tarah use karne ka sabse effective tareeka kya hai?',
          options: [
            'Homework ka direct solution copy karke notebook me likhna',
            'AI se guiding questions aur step-by-step feedback le kar khud solve karna',
            'Question ko bina samjhe memorize karna',
            'AI par test ke din chupke se cheat karna'
          ],
          correctIndex: 1,
          explanation: 'Guided practice and Socratic inquiry build long-term retention and true conceptual understanding.'
        }
      }
    ]
  },
  {
    id: 'ai-for-writing',
    moduleNumber: 7,
    title: 'AI for Writing',
    subtitle: 'Draft stellar essays, professional emails, SOPs & presentations',
    category: 'productivity',
    level: 'Beginner',
    readTime: '6 min read',
    icon: 'FileText',
    themeColor: {
      primary: '#ea580c', // orange
      badge: 'bg-orange-100 text-orange-800',
      spine: 'from-orange-800 to-red-950',
      cover: 'from-orange-600 via-amber-600 to-red-800',
      accent: '#f97316'
    },
    summary: 'Robotic writing ko human aur persuasive banayein. Cold emails, internship applications aur essays likhne ka master framework.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: Escape the "AI Sounding" Trap',
        subtitle: 'Kyun log 1 second me pehchan jaate hain ki ye ChatGPT ne likha hai?',
        content: `
Aapne zaroor aisi writing dekhi hogi jisme ye words bhare hote hain:
- *"In this fast-paced digital era..."*
- *"Delve into the multifaceted tapestry..."*
- *"Moreover, it is crucial to acknowledge..."*
- *"Furthermore, in conclusion..."*

Ye sab classic **AI clichés** hain! HR managers, college professors aur recruiters in words ko dekhte hi application reject kar dete hain kyunki unhe lagta hai candidate ne zero effort lagaya.

Great writing hamesha **direct, punchy, aur authentic** hoti hai!
        `,
        analogy: {
          title: '🪞 The Makeup Analogy',
          text: 'AI writing ko ek editing mirror samjho. Agar aap pura synthetic makeup laga loge toh plastic lagega. Lekin agar aap apne real thoughts ko thoda polish aur groom karne ke liye use karoge, tab wo shining lagega!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The Human-First Writing Workflow',
        subtitle: '3-Step Process for World-Class Writing',
        content: `
### Step 1: Brain Dump (Aapka Input)
Kabhi bhi AI ko blank slate mat do. Pehle 3-4 rough bullet points khud likho ki aap kya kehna chahte ho:
- *"Main XYZ college ka 3rd year student hu"*
- *"Maine React me ye 2 projects banaye hain"*
- *"Mujhe unki company ka open-source tool pasand aaya"*

### Step 2: Structure & Polish (AI ka Kaam)
AI ko bolo:
> *"Transform these raw thoughts into a concise 120-word cold email. Keep the tone humble yet confident. Remove all generic buzzwords."*

### Step 3: Human Filter (Final Review)
Hamesha apne shabdon me read karo. Agar koi sentence lagta hai ki *"main real life me aisa kabhi nahi bolunga"*, use turant edit kardo!
        `,
        keyTakeaway: 'Your thoughts + AI\'s speed & grammar + Your voice = Unstoppable writing.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Cold Email Success Story',
        subtitle: 'Kaise Ritesh ne founder ko cold email bhej kar internship paayi',
        caseStudy: {
          studentName: 'Ritesh (Design Student)',
          challenge: 'Ek top SaaS startup ke Founder ko LinkedIn par outreach karke UI/UX design internship chahiye thi.',
          aiApproach: 'Generic template ki jagah Ritesh ne Founder ki recent LinkedIn post analyze ki aur Claude se prompt kiya: "Draft a 100-word outreach email complimenting their recent v2 redesign, highlighting 2 specific micro-improvements I created on Figma, with a link to my prototype."',
          result: 'Founder ne 4 ghante me reply kiya: "Loved the initiative. Let\'s get on a 15-min call tomorrow!"',
          quote: '"Hyper-personalized short emails always beat 500-word generic AI essays."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'The High-Conversion Cold Email / Application Prompt',
        promptBox: {
          title: 'The Anti-Robotic Cold Outreach Generator',
          description: 'Internships ya mentors ko contact karne ke liye crisp, authentic email taiyar karein.',
          promptText: `Act as an executive communication coach. Help me draft a high-impact cold email for [GOAL: e.g. an internship / research opportunity under a professor / mentorship].

KEY DETAILS:
- Recipient: [e.g. Founder at a FinTech startup / Professor at Delhi University]
- Who I am: [e.g. 2nd year CS undergrad with projects in Python & AI]
- The Value Hook: [e.g. I saw their recent paper/product and built a small demo addressing X]
- The Call to Action: [e.g. 15-minute quick virtual coffee chat]

CRITICAL WRITING CONSTRAINTS:
1. Maximum 120 words total.
2. Zero corporate buzzwords (no "delve", "tapestry", "plethora", "streamline").
3. Subject line must be punchy and under 7 words.
4. Tone: Respectful, direct, high-agency.`,
          tools: ['Claude', 'ChatGPT', 'Google Gemini']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Sharpen your editorial eye',
        quiz: {
          question: 'AI-generated cover letter ya essay ko professional banane ka sabse zaroori step kya hai?',
          options: [
            'Seedha PDF export karke bhej dena',
            'Apne personal specific experiences aur real metrics add karke generic buzzwords delete karna',
            'Font size badha dena',
            'Usme aur zyada complex vocabulary daalna'
          ],
          correctIndex: 1,
          explanation: 'Personal real metrics and authentic stories remove the generic AI feel and make your application stand out.'
        }
      }
    ]
  },
  {
    id: 'ai-graphic-designing',
    moduleNumber: 8,
    title: 'AI Graphic Designing',
    subtitle: 'Craft viral posters, thumbnails, branding & social media creatives',
    category: 'creative',
    level: 'Intermediate',
    readTime: '8 min read',
    icon: 'Palette',
    themeColor: {
      primary: '#db2777', // pink
      badge: 'bg-pink-100 text-pink-800',
      spine: 'from-pink-800 to-rose-950',
      cover: 'from-pink-600 via-rose-600 to-purple-800',
      accent: '#ec4899'
    },
    summary: 'Canva AI, Figma AI aur composition rules se professional event posters aur YouTube thumbnails banana seekhein.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Visual Revolution',
        subtitle: 'Aapko graphic designer banne ke liye 4 saal ka degree nahi chahiye!',
        content: `
Kuchh saal pehle tak, agar aapko college fest ke liye ek poster ya YouTube video ke liye click-worthy thumbnail banana hota tha, toh Photoshop khol kar ghanto layer masking aur pen tool seekhna padta tha.

Aaj AI tools ne graphic design ko democratize kar diya hai:
- **Canva Magic Studio:** Ek text prompt se poora layout, color palette aur social media post dimension taiyar.
- **Photoroom / Clipdrop:** Background remove karna, lighting change karna aur shadows add karna 1-click me.
- **Figma AI:** Wireframes aur UI components generate karna in seconds.

Lekin tools chahe kitne bhi smart ho jayein, **Design Sense** insaan ko hi guide karni padti hai!
        `,
        analogy: {
          title: '🎨 The Camera vs Photographer Analogy',
          text: 'Smartphone ka camera kitna bhi mehnga ho, achhi photo tab aati hai jab photographer ko angle, lighting aur rule-of-thirds pata ho. AI design tools aapka super-camera hain, par composition vision aapka hoga!'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The 4 Golden Rules of AI Graphic Design',
        subtitle: 'Aapka creative amateur se studio-grade kaise banega?',
        content: `
Jab bhi AI se banner, thumbnail ya poster generate ya assemble karein, ye 4 rules yaad rakhein:

1. **Visual Hierarchy (Aankh pehle kahan jayegi?):**
   Sabse important chiz (Headline ya Subject) sabse badi aur high-contrast honi chahiye. Agar sabkuchh bold hai, toh kuchh bhi bold nahi hai!

2. **The 60-30-10 Color Rule:**
   - 60% Dominant color (Clean background / canvas).
   - 30% Secondary color (Cards, containers, text).
   - 10% Accent color (CTA button ya key focal point, e.g. bright orange ya electric blue).

3. **High Contrast for Mobile Thumbnails:**
   85% audience mobile par scroll karti hai. Aisa text mat use karo jo background me blend ho jaye. Bold drop shadow ya solid container use karein.

4. **Negative Space (Khali Jagah):**
   Creative ko text aur stickers se bhar mat do. Design ko saans lene ki jagah do!
        `,
        keyTakeaway: 'Good design is not what you can add, it is when nothing more can be removed.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: YouTube Creator Case Study',
        subtitle: 'Arjun ne YouTube thumbnail CTR 3% se 9% kaise kiya',
        caseStudy: {
          studentName: 'Arjun (Tech YouTuber & Student)',
          challenge: 'Arjun ke coding tutorials acche the lekin click-through-rate (CTR) sirf 3% tha kyunki thumbnail text bohot chhota aur cluttered tha.',
          aiApproach: 'Arjun ne Midjourney se cinematic expressions aur Canva AI se bold 3-word title overlay design kiya ("AI Did THIS!"). Cluttered code snippets hata kar clean neon glow lighting use ki.',
          result: 'Nayi video ka CTR 9.4% cross kar gaya aur pehle 48 ghante me 50,000 views aaye!',
          quote: '"Simplicity and extreme contrast on mobile screens win every single time."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'The Professional Design Brief Generator',
        promptBox: {
          title: 'Design Concept & Layout Architect Prompt',
          description: 'Kisi bhi poster, thumbnail ya banner ke liye complete visual blueprint generate karein.',
          promptText: `Act as a senior Creative Director at a world-class advertising agency.
I need a design concept for: [EVENT / YOUTUBE THUMBNAIL / PRODUCT POSTER: e.g. Inter-College Hackathon 2025].

Provide a comprehensive visual blueprint:
1. Color Palette: 3 specific hex colors following the 60-30-10 rule with mood justification.
2. Focal Element: What should the viewer's eye look at in the first 0.5 seconds?
3. Typography Pairings: Recommended Header font style and Body font style.
4. Exact Copy Layout:
   - Primary Hook (max 4 words)
   - Supporting Detail
   - Date / Badge / CTA
5. Midjourney / DALL-E Background Prompt: Exact prompt to generate the cinematic background image.`,
          tools: ['ChatGPT', 'Claude', 'Google Gemini']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Test your design intuition',
        quiz: {
          question: 'Graphic design me 60-30-10 color rule ka kya matlab hai?',
          options: [
            '60% photos, 30% text, 10% blank space',
            '60% dominant background, 30% secondary structure, 10% high-impact accent color',
            '60 minutes me design banao, 30 minutes edit karo, 10 minutes post karo',
            '60 fonts, 30 icons, 10 colors'
          ],
          correctIndex: 1,
          explanation: 'The 60-30-10 rule ensures visual balance: 60% dominant base, 30% supporting structure, and 10% vibrant focal accents.'
        }
      }
    ]
  },
  {
    id: 'ai-image-generation',
    moduleNumber: 9,
    title: 'AI Image Generation',
    subtitle: 'Master Text-to-Image prompts: Lighting, camera lenses, styles & angles',
    category: 'creative',
    level: 'Intermediate',
    readTime: '8 min read',
    icon: 'Image',
    themeColor: {
      primary: '#0284c7', // sky
      badge: 'bg-sky-100 text-sky-800',
      spine: 'from-sky-800 to-blue-950',
      cover: 'from-sky-600 via-blue-600 to-indigo-800',
      accent: '#0284c7'
    },
    summary: 'Midjourney, DALL-E 3 aur Flux ke liye photorealistic aur artistic image prompts likhne ka formula.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: Painting with Words',
        subtitle: 'Text se photorealistic art kaise banta hai?',
        content: `
Text-to-Image models jaise **Midjourney**, **DALL-E 3 (ChatGPT)**, aur **Flux** ne duniya ko hairan kar diya hai. Aap ek sentence likhte ho aur 10 second me ek aisi image ban jaati hai jo lagta hai National Geographic photographer ne click ki ho!

Lekin agar aap sirf likhoge:
> *"A cool robot in a city"*

Toh AI ek basic cartoonish robot bana kar de dega.

Lekin jab aap prompt me cinematography ke shabad use karte ho — jaise **lighting, camera focal length, atmosphere, aur rendering engine** — tab output next-level photorealistic banta hai!
        `,
        analogy: {
          title: '📸 The Cinema Director Analogy',
          text: 'AI image generator ko ek blind cinematographer samjho jiske paas duniya ka sabse powerful lens aur studio hai. Wo wahi dekhega jo aap shabdon me describe karoge: roshni kahan se aa rahi hai, lens 85mm hai ya wide angle, aur background me foggy haze hai ya sunshine.'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The 5-Layer Image Prompt Formula',
        subtitle: 'Master Midjourney, DALL-E 3 & Flux prompt recipes',
        content: `
Photorealistic ya cinematic image banane ke liye ye 5 layers include karein:

1. **Subject & Action (Main kirdar kya kar raha hai?):**
   *Example:* "An Indian female software engineer in her late 20s smiling confidently while debugging code on multiple futuristic holograms."
2. **Environment & Setting (Aas-paas ka maahaul):**
   *Example:* "Modern glass cyber-security lab in Bengaluru at midnight, rain droplets on high glass windows overlooking city skyline."
3. **Lighting & Mood (Roshni aur rang):**
   *Example:* "Cinematic teal and orange neon rim lighting, volumetric fog, moody soft shadows, cyberpunk aesthetic."
4. **Camera & Lens Mechanics (Photography technical terms):**
   *Example:* "Shot on 85mm f/1.4 lens, shallow depth of field, sharp focus on eyes, creamy bokeh background."
5. **Quality & Render Engine:**
   *Example:* "Unreal Engine 5 render, award-winning photography, 8k resolution, hyper-detailed texture."
        `,
        keyTakeaway: 'Subject + Setting + Lighting + Camera Lens + Render Style = Studio Masterpiece.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Real Showcase',
        subtitle: 'Kaise ek student ne bina budget ke movie poster banaya',
        caseStudy: {
          studentName: 'Dev (Film Club Head)',
          challenge: 'College short film fest ke liye sci-fi psychological thriller ka official poster chahiye tha. Graphic designer hire karne ka budget zero tha.',
          aiApproach: 'Dev ne DALL-E 3 aur Flux ko cinematic prompt diya jisme silhouette lighting aur moody retro film grain specify kiya. Background me mysterious clock tower aur distorted reflections generate karwaye.',
          result: 'Poster itna professional bana ki fest committee ne use college ke main entrance par 10-foot hoarding par print karwaya!',
          quote: '"Precise lighting and camera keywords completely transform the realism of AI art."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'Hyper-Realistic Cinematic Recipe to Copy & Test',
        promptBox: {
          title: 'The Cinematic Portrait Master Prompt',
          description: 'Ise ChatGPT (DALL-E 3), Midjourney ya kisi bhi image generator me paste karein.',
          promptText: `A cinematic close-up portrait of [SUBJECT: e.g. an aspiring young Indian robotics inventor with subtle grease smudges on cheek], working inside [ENVIRONMENT: e.g. an organized garage laboratory surrounded by microchips, glowing circuits and metallic tools].

LIGHTING: Golden hour sunset light pouring through a high dust-flecked window on one side, contrasted with cold cyan LED workbench lighting on the other side.
CAMERA: Photographed on Sony A7R V with 50mm f/1.2 G Master lens, crisp tack-sharp focus on subject eyes, natural skin pores and realistic texture, smooth atmospheric depth of field.
STYLE: Hyper-realistic documentary photography, 8k resolution, authentic color grading, cinematic composition. --ar 16:9`,
          tools: ['DALL-E 3 (ChatGPT)', 'Midjourney', 'Flux / Ideogram']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Test your prompt vocabulary',
        quiz: {
          question: 'AI image me background ko blur karke subject ko stand out karne ke liye prompt me konsa camera keyword use karna chahiye?',
          options: [
            '"Shallow depth of field" ya "f/1.4 aperture"',
            '"Very high zoom 1000x"',
            '"No blur anywhere"',
            '"Black and white only"'
          ],
          correctIndex: 0,
          explanation: '"Shallow depth of field" and wide apertures (like f/1.4 or f/1.8) instruct the rendering engine to focus sharply on the subject while producing an artistic blurred bokeh background.'
        }
      }
    ]
  },
  {
    id: 'ai-for-video-audio',
    moduleNumber: 10,
    title: 'AI for Video & Audio',
    subtitle: 'Automate scripts, realistic voiceovers, animated avatars & subtitles',
    category: 'media',
    level: 'Advanced',
    readTime: '9 min read',
    icon: 'Video',
    themeColor: {
      primary: '#9333ea', // purple-violet
      badge: 'bg-fuchsia-100 text-fuchsia-800',
      spine: 'from-fuchsia-900 to-purple-950',
      cover: 'from-fuchsia-700 via-purple-700 to-violet-900',
      accent: '#a855f7'
    },
    summary: 'Scriptwriting se lekar AI voiceover (ElevenLabs), video clips (Runway/Kling) aur auto-captions (CapCut) ka complete pipeline.',
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: 'Chapter 1: The Modern Solo Media Studio',
        subtitle: 'Aap akele ek poore production house ke barabar hain',
        content: `
Pehle ek 60-second animated educational video banane ke liye kya chahiye hota tha?
1. Scriptwriter
2. Voiceover Artist with expensive microphone
3. Video Editor
4. Animator
5. Subtitle typist

**2025-2026 me ye saara kaam ek student akele apne laptop par 30 minute me kar sakta hai!**

AI audio aur video tools ne content creation ki boundary khatam kar di hai. Chahe aapko college presentation ke liye explainer video banana ho ya social media par educational channel start karna ho, pura pipeline AI se automate ho sakta hai.
        `,
        analogy: {
          title: '🎬 The Virtual Production Crew Analogy',
          text: 'Aap ab director ki chair par baithe hain. AI aapka scriptwriter hai (ChatGPT/Claude), aapka voice actor hai (ElevenLabs), aapka cameraman hai (Runway/Kling AI), aur aapka editor hai (CapCut AI).'
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: 'Chapter 2: The 4-Step Video Generation Pipeline',
        subtitle: 'From Blank Idea to 60-Second Viral Video',
        content: `
### Step 1: Hook-First Script (ChatGPT / Claude)
Video me pehle 3 seconds sabse critical hote hain. Script me pehle 3 second me ek unexpected question ya shocking statement hona chahiye ("Did you know...?").

### Step 2: Ultra-Realistic Voiceover (ElevenLabs)
Robot jaisi monotonous robotic awaaz bhool jao. ElevenLabs insaan ki tarah saans lene, pauses lene aur emotions express karne wali studio-quality Hindi/English audio generate karta hai.

### Step 3: B-Roll & Visuals (Kling / Runway Gen-3 / Pika)
Aapke script ke har scene ke liye 4-second video clips prompt karke generate kiye ja sakte hain bina kisi camera ke.

### Step 4: Auto-Captions & Sound Effects (CapCut / Clipchamp)
Dynamic animated captions (jaise Alex Hormozi style) generate karein jisme key words highlight hote hain.
        `,
        keyTakeaway: 'The magic is not in one tool, but in chaining the best AI tools together into a seamless workflow.'
      },
      {
        pageNumber: 3,
        type: 'case_study',
        title: 'Chapter 3: Campus Creator Spotlight',
        subtitle: 'Kaise Yash ne AI use karke college fest documentary banayi',
        caseStudy: {
          studentName: 'Yash (Media Studies Student)',
          challenge: 'College annual fest ke liye 2-minute promotional teaser banana tha par professional voiceover artist hire karne ke paise nahi the.',
          aiApproach: 'Yash ne Claude se cinematic trailer script likhwaya, ElevenLabs se deep dramatic movie trailer voice generate ki, aur campus drones shots ke saath mix kiya.',
          result: 'Teaser college ke official Instagram page par 45,000 views aur 2,000+ shares ke saath viral ho gaya!',
          quote: '"High-grade AI voiceovers completely elevate an ordinary video into an international-looking production."'
        }
      },
      {
        pageNumber: 4,
        type: 'prompt_lab',
        title: 'Chapter 4: Try It Yourself Lab 🧪',
        subtitle: 'The Viral 60-Second Short/Reel Script Scriptwriter',
        promptBox: {
          title: 'The Viral Educational Reel Script Framework',
          description: 'Instagram Reel ya YouTube Short ke liye timestamped script with visuals & voiceover.',
          promptText: `Act as a top viral video content strategist and scriptwriter.
Write a high-retention 60-second video script about: [TOPIC: e.g. How does WiFi work through walls? / 3 AI tools students are using to study faster].

Structure the script in a 3-column table:
1. Timestamp (e.g. 0:00 - 0:03)
2. Visual / B-Roll Instruction (What the viewer sees on screen)
3. Spoken Voiceover Script (Word-for-word spoken text, punchy, conversational, with dramatic pauses)

REQUIREMENTS:
- The first 3 seconds MUST have an irresistible hook that stops the scroll.
- Explain the core concept using a simple daily-life analogy.
- End with a clear, memorable punchline and call-to-action.
Language: Engaging Hinglish.`,
          tools: ['ChatGPT', 'Claude', 'Google Gemini']
        }
      },
      {
        pageNumber: 5,
        type: 'quiz_checkpoint',
        title: 'Chapter 5: Checkpoint Quiz',
        subtitle: 'Test your video creation mastery',
        quiz: {
          question: 'Short-form educational videos (Reels/Shorts) me audience ka retention sabse zyada kis cheez par depend karta hai?',
          options: [
            'Pehle 3 seconds ke hook aur continuous visual changes (b-rolls & subtitles) par',
            'Sirf video ke resolution 4k hone par',
            'Background music jitna loud ho sake utna rakhne par',
            'Boring 10-second logo animation se shuru karne par'
          ],
          correctIndex: 0,
          explanation: 'The first 3 seconds determine whether a viewer stays or swipes away. Dynamic hooks, fast visual changes, and clear subtitles maintain high engagement.'
        }
      }
    ]
  }
];

export const ACADEMY_CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'fundamentals', label: 'AI Fundamentals' },
  { id: 'tools', label: 'Tools & Comparison' },
  { id: 'productivity', label: 'Student Productivity' },
  { id: 'creative', label: 'Creative & Design' },
  { id: 'media', label: 'Video & Audio' }
];
