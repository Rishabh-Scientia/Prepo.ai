// Prepo.ai - AI Academy Multilingual Course Data Engine
// Supports 3 Languages: 'en' (English Default), 'hinglish' (Conversational Hinglish), 'hi' (हिंदी)
// 10 Detailed Chapters per Module for Comprehensive Mastery

export function resolveLang(field, lang = 'en') {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field['en'] || field['hinglish'] || '';
}

export const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇬🇧', tag: 'Default' },
  { id: 'hinglish', label: 'Hinglish', flag: '🇮🇳', tag: 'Friendly' },
  { id: 'hi', label: 'हिंदी', flag: '🇮🇳', tag: 'Hindi' }
];

export const ACADEMY_CATEGORIES = [
  { id: 'all', label: { en: 'All 10 Modules', hinglish: 'All 10 Modules', hi: 'सभी 10 मॉड्यूल' } },
  { id: 'fundamentals', label: { en: 'AI Fundamentals', hinglish: 'AI Fundamentals', hi: 'एआई आधारभूत सिद्धांत' } },
  { id: 'tools', label: { en: 'Tools Comparison', hinglish: 'Tools Comparison', hi: 'टूल्स की तुलना' } },
  { id: 'productivity', label: { en: 'Student Productivity', hinglish: 'Student Productivity', hi: 'छात्र उत्पादकता' } },
  { id: 'creative', label: { en: 'Creative & Design', hinglish: 'Creative & Design', hi: 'रचनात्मक और डिज़ाइन' } },
  { id: 'media', label: { en: 'Video & Audio', hinglish: 'Video & Audio', hi: 'वीडियो और ऑडियो' } }
];

export const AI_ACADEMY_MODULES = [
  // ──────────────────────────────────────────────────────────────────────────
  // MODULE 1: WHAT IS AI?
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'what-is-ai',
    moduleNumber: 1,
    category: 'fundamentals',
    level: 'Beginner',
    readTime: '12 min read',
    icon: 'Bot',
    themeColor: {
      primary: '#2563eb',
      badge: 'bg-blue-100 text-blue-800',
      spine: 'from-blue-700 to-blue-900',
      cover: 'from-blue-600 via-indigo-600 to-blue-800',
      accent: '#3b82f6'
    },
    title: {
      en: 'What is AI?',
      hinglish: 'What is AI? (AI Kya Hai?)',
      hi: 'कृत्रिम बुद्धिमत्ता (AI) क्या है?'
    },
    subtitle: {
      en: 'Demystifying Artificial Intelligence through daily life, mental models & analogies',
      hinglish: 'AI ko samjhein daily life examples, simple stories aur mental models se',
      hi: 'दैनिक जीवन के उदाहरणों और सरल व्याख्याओं से आर्टिफिशियल इंटेलिजेंस को समझें'
    },
    summary: {
      en: 'Explore the foundations of AI, how it differs from traditional deterministic software, and how modern algorithms power Netflix, Google Maps, and autonomous systems.',
      hinglish: 'Jaaniye AI kya hai, traditional coding se kaise alag hai, aur hum roz ise Google Maps se lekar Netflix tak kaise anjaane me use karte hain.',
      hi: 'जानिए एआई क्या है, यह पारंपरिक प्रोग्रामिंग से कैसे अलग है, और गूगल मैप्स से लेकर यूट्यूब तक यह हमारे दैनिक जीवन को कैसे संचालित करता है।'
    },
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: {
          en: 'Chapter 1: The Genesis of Artificial Intelligence',
          hinglish: 'Chapter 1: AI ki Shuruat aur Magic',
          hi: 'अध्याय 1: कृत्रिम बुद्धिमत्ता की उत्पत्ति'
        },
        subtitle: {
          en: 'Can machines truly think, or are they just clever mirrors?',
          hinglish: 'Kya computer sach me soch sakta hai ya ye sirf ek calculation hai?',
          hi: 'क्या मशीनें वास्तव में सोच सकती हैं?'
        },
        content: {
          en: `### The Core Question
In 1950, British mathematician Alan Turing published a landmark paper with a revolutionary opening sentence: *"Can machines think?"*

For centuries, machines could only execute mechanical work — like a windmill grinding grain, or a pocket watch tracking seconds. Even the earliest electronic computers were essentially giant calculators; they strictly followed instructions written line-by-line by human programmers.

### The Paradigm Shift
Today, Artificial Intelligence represents a fundamental departure from this classical approach:
- **Traditional Software:** Human writes exact mathematical rules. If an unforeseen situation occurs, the software crashes.
- **Artificial Intelligence:** Humans build learning architectures and feed massive datasets. The machine observes patterns and derives its own probabilistic decision boundaries.`,
          hinglish: `### AI Kya Hai Aur Ye Itna Special Kyun Hai?
Socho agar aap kisi 5 saal ke bachhe ko billi (cat) aur kutte (dog) me farak sikhana chahte ho. Kya aap uske dimag me 1000 rules likhte ho ki "agar kaan triangle ho, 4 pair ho, aur 2 aankhein ho toh billi hai"?

**Nahi!** Aap use 10 billiyan aur 10 kutte dikha dete ho. Bachhe ka dimaag khud patterns identify kar leta hai.

**Traditional Software vs AI:**
- **Traditional Software (Purana Tareeka):** Programmer har ek step ka exact rule likhta hai (\`If X happens, do Y\`). Agar koi naya case aaya toh system crash ho jata hai!
- **Artificial Intelligence (AI):** Hum computer ko millions of examples (data) dikhate hain, aur machine khud patterns learn karti hai. Is process ko hum **Machine Learning** kehte hain.`,
          hi: `### बुनियादी सवाल: मशीनें कैसे सोचती हैं?
पारंपरिक सॉफ्टवेयर और आर्टिफिशियल इंटेलिजेंस में सबसे बड़ा अंतर नियमों का है:
- **पारंपरिक सॉफ्टवेयर:** इंजीनियर हर एक नियम स्वयं कोड करता है। यदि कोई अप्रत्याशित परिस्थिति आती है, तो सॉफ्टवेयर विफल हो जाता है।
- **आर्टिफिशियल इंटेलिजेंस:** हम मशीन को भारी मात्रा में डेटा (उदाहरण) दिखाते हैं। मशीन उन उदाहरणों में पैटर्न ढूंढकर स्वयं निर्णय लेना सीखती है।`
        },
        analogy: {
          en: {
            title: '🧠 Mental Model: The Calculator vs The Smart Apprentice',
            text: 'A calculator strictly executes arithmetic rules programmed into its silicone chips. An apprentice observes a master craftsman 500 times, picks up subtle nuances, and creates something entirely new on the 501st attempt. Modern AI is that apprentice.'
          },
          hinglish: {
            title: '🧠 Simple Analogy: Calculator vs Smart Intern',
            text: 'Calculator ko sirf wahi pata hai jo formula feed hai. Lekin ek smart Intern ko agar 100 sample letters dikha do, toh wo 101-wa letter khud samajh kar naya likh sakta hai. Modern AI wahi smart intern hai!'
          },
          hi: {
            title: '🧠 मानसिक मॉडल: कैलकुलेटर बनाम बुद्धिमान शिष्य',
            text: 'एक कैलकुलेटर केवल वही करता है जो उसमें फॉर्मूला डाला गया हो। परंतु एक बुद्धिमान शिष्य सैकड़ों उदाहरण देखकर नया कार्य स्वयं करना सीख जाता है। आधुनिक एआई वही बुद्धिमान शिष्य है।'
          }
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: {
          en: 'Chapter 2: How AI Differs from Traditional Code',
          hinglish: 'Chapter 2: Traditional Coding vs AI Architecture',
          hi: 'अध्याय 2: पारंपरिक कोडिंग बनाम एआई'
        },
        subtitle: {
          en: 'From deterministic logic gates to probabilistic neural weights',
          hinglish: 'Rules vs Probability: AI kaise decide karta hai?',
          hi: 'नियम-आधारित प्रोग्रामिंग से प्रायिकता मॉडल तक'
        },
        content: {
          en: `### Deterministic vs Probabilistic Thinking
To master AI, one must understand the difference between *Deterministic* and *Probabilistic* computing:

| Metric | Traditional Programming | Artificial Intelligence |
|---|---|---|
| **Input** | Rules + Data | Data + Desired Output |
| **Output** | Answers | Machine-learned Rules / Model |
| **Flexibility** | Rigid & brittle | Adaptive & generalized |
| **Error Handling** | Throws exceptions | Returns probability scores |

### Why This Matters for Students
When ChatGPT writes code or solves a physics numerical, it is not querying a private encyclopedia. It calculates the statistical likelihood of each token based on mathematical weights adjusted across billions of web pages.`,
          hinglish: `### Rules vs Probability ka Khel
Traditional programming me logic fix hota hai:
\`If (traffic == red) { stop(); }\`

Lekin AI probabilistic sochta hai:
*"Based on 10 million photos I analyzed, there is a 98.4% probability that this image is a pedestrian crossing the street, and a 1.6% probability that it is a shadow."*

Is probability calculation ki wajah se AI real-world uncertainty ko handle kar pata hai!`,
          hi: `### निश्चित नियम बनाम संभाव्यता (Probability)
पारंपरिक कोडिंग निश्चित नियमों पर आधारित होती है: यदि X हो तो Y करो।
इसके विपरीत, AI संभावनाओं (probabilities) पर काम करता है। जब AI किसी चित्र को देखता है, तो वह कहता है: "99% संभावना है कि यह कार है, और 1% संभावना है कि यह कोई अन्य वाहन है।" यह क्षमता AI को वास्तविक दुनिया की अनिश्चितताओं को समझने में सक्षम बनाती है।`
        },
        keyTakeaway: {
          en: 'Traditional software automates rules; Artificial Intelligence automates pattern recognition and probabilistic learning.',
          hinglish: 'Traditional code rules follow karta hai, jabki AI data ke patterns se khud rules banana seekhta hai.',
          hi: 'पारंपरिक सॉफ्टवेयर नियमों का पालन करता है, जबकि एआई डेटा से पैटर्न पहचानना सीखता है।'
        }
      },
      {
        pageNumber: 3,
        type: 'deep_dive',
        title: {
          en: 'Chapter 3: The 3 Flavors of AI — ANI, AGI & ASI',
          hinglish: 'Chapter 3: AI ke 3 Types — ANI, AGI aur ASI',
          hi: 'अध्याय 3: एआई के तीन स्तर — ANI, AGI और ASI'
        },
        subtitle: {
          en: 'Where we are today vs where technology is heading',
          hinglish: 'Aaj hum kahan hain aur future kaisa hoga?',
          hi: 'आज की स्थिति और भविष्य की संभावनाएं'
        },
        content: {
          en: `### 1. Artificial Narrow Intelligence (ANI) — Where We Are Today
Every AI tool you interact with today — including ChatGPT, Siri, AlphaFold, and Tesla Autopilot — is Narrow AI.
- ANI is extraordinary at a specific domain (e.g., chess, language modeling, medical imaging).
- However, AlphaFold cannot write a romantic comedy screenplay, and ChatGPT cannot physically drive an automobile.

### 2. Artificial General Intelligence (AGI) — The Horizon
AGI refers to a hypothetical system capable of understanding, learning, and applying intelligence across any intellectual task at human or superhuman parity.

### 3. Artificial Super Intelligence (ASI) — The Theoretical Future
An intelligence surpassing the collective brainpower of all human civilization combined across science, philosophy, and engineering.`,
          hinglish: `### 1. Narrow AI (ANI) — Aaj ka AI
Aaj jo bhi AI hum dekhte hain (ChatGPT, Gemini, Google Maps), wo sab **Narrow AI** hain. 
- Ye kisi ek kaam me insaan se 100x fast ho sakte hain, lekin unke paas common sense ya physical consciousness nahi hoti.

### 2. General AI (AGI) — Agle 5-10 Saal ka Goal
Jab ek machine insaan ki tarah kisi bhi field me (coding, painting, surgery, business) khud seekh kar perform karne lage, use AGI kehte hain.

### 3. Super AI (ASI) — Sci-Fi Future
Aisa intelligence jo duniya ke saare humans ke dimaag ko milakar bhi 1000x zyada powerful ho.`,
          hi: `### 1. नैरो एआई (ANI) - वर्तमान स्तर
आज मौजूद सभी टूल्स (चैटजीपीटी, एलेक्सा, सेल्फ-ड्राइविंग सिस्टम) नैरो एआई हैं। ये किसी विशिष्ट कार्य में अत्यधिक कुशल हैं, लेकिन मानवीय चेतना से रहित हैं।

### 2. जनरल एआई (AGI) - अगला लक्ष्य
जब कोई मशीन मानव की तरह किसी भी बौद्धिक कार्य को स्वतंत्र रूप से सीखने और करने में सक्षम हो जाएगी।

### 3. सुपर एआई (ASI) - भविष्य की परिकल्पना
मानव सभ्यता की सामूहिक बुद्धिमत्ता से कहीं अधिक शक्तिशाली कृत्रिम बुद्धिमत्ता।`
        }
      },
      {
        pageNumber: 4,
        type: 'deep_dive',
        title: {
          en: 'Chapter 4: The Everyday AI Ecosystem',
          hinglish: 'Chapter 4: Aapke Phone me Chhupa AI',
          hi: 'अध्याय 4: हमारे दैनिक जीवन में एआई'
        },
        subtitle: {
          en: 'Real-world machine learning systems you already use every 2 hours',
          hinglish: 'Subah se shaam tak aap kitne AI algorithms use karte hain?',
          hi: 'वे सिस्टम जो आप प्रतिदिन उपयोग करते हैं'
        },
        content: {
          en: `### You Already Live in an AI-Augmented World
1. 🗺️ **Google Maps (Graph Theory & Fleet Analytics):**
   Predicts traffic congestion by continuously evaluating millions of concurrent telemetry pings and vehicle speed vectors.
2. 🎬 **YouTube & Spotify Recommendation Engines:**
   Uses Collaborative Filtering and Vector Embeddings to map your micro-preferences against millions of similar user profiles.
3. 📸 **Computational Photography (Portrait Mode):**
   Semantic segmentation neural nets identify fine hair strands and clothing boundaries in milliseconds, rendering synthetic optical bokeh.
4. 🛡️ **Cybersecurity & Banking Fraud Detection:**
   Evaluates transactions within 50ms to flag unusual geolocation anomalies or suspicious spending spikes.`,
          hinglish: `### Rozana Zindagi ke 4 Bade AI Examples:
1. 🗺️ **Google Maps:** Lakho phones ki live GPS speed analyze karke traffic jam predict karta hai aur alternative routes batata hai.
2. 🎬 **YouTube & Netflix:** Aapke watch time aur clicks ko analyze karke personalized feed tayar karta hai.
3. 📸 **Phone Camera (Portrait Mode):** Single lens se DSLR jaisa background blur karta hai kyunki AI baalon aur kapdon ki boundary pehchanta hai.
4. ✉️ **Gmail Spam & Smart Reply:** 99.9% scam emails ko automatic filter karke inbox safe rakhta hai.`,
          hi: `### दैनिक जीवन में एआई के मुख्य उदाहरण:
1. **गूगल मैप्स:** लाइव जीपीएस डेटा का विश्लेषण करके सबसे तेज़ रास्ता और ट्रैफिक जाम बताता है।
2. **यूट्यूब और ओटीटी:** आपके देखने के इतिहास के आधार पर सटीक वीडियो सुझाव देता है।
3. **स्मार्टफोन कैमरा:** चेहरे और बैकग्राउंड की पहचान करके डीएसएलआर जैसा ब्लर प्रभाव बनाता है।
4. **बैंकिंग सुरक्षा:** संदिग्ध लेन-देन को 50 मिलीसेकंड के भीतर पहचानकर फ्रॉड रोकता है।`
        }
      },
      {
        pageNumber: 5,
        type: 'deep_dive',
        title: {
          en: 'Chapter 5: Demystifying the Buzzwords — AI vs ML vs DL vs GenAI',
          hinglish: 'Chapter 5: Buzzwords Clear Karo — AI, ML, DL aur GenAI',
          hi: 'अध्याय 5: महत्वपूर्ण शब्दावली — AI, ML, Deep Learning और GenAI'
        },
        subtitle: {
          en: 'Russian Dolls of the tech world: how they fit into each other',
          hinglish: 'Russian Doll Concept: In sab me aapas me kya relation hai?',
          hi: 'इन सभी अवधारणाओं के बीच का संबंध समझें'
        },
        content: {
          en: `### The Concentric Circles of AI
Think of these four terms like nesting Russian dolls:

1. **Artificial Intelligence (The Outer Circle):**
   Any technique that enables computers to mimic human cognition.
2. **Machine Learning (The Middle Layer):**
   A subset of AI where systems automatically learn representations from data without explicit procedural programming.
3. **Deep Learning (The Inner Core):**
   A subset of ML using multi-layered Artificial Neural Networks inspired by biological brain architectures.
4. **Generative AI (The Modern Frontier):**
   Deep learning systems capable of synthesizing novel text, images, sound, or code rather than just classifying existing inputs.`,
          hinglish: `### Russian Dolls Concept:
1. **Artificial Intelligence (AI):** Sabse bada umbrella. Koi bhi machine jo human intelligence mimic kare.
2. **Machine Learning (ML):** AI ka ek part, jahan machine data se patterns khud seekhti hai.
3. **Deep Learning (DL):** ML ka advanced part jo human brain ke neurons ki tarah multi-layered networks use karta hai.
4. **Generative AI (GenAI):** Deep Learning ka naya roop jo sirf classify nahi karta, balki naya content (text, image, audio, code) create karta hai!`,
          hi: `### अवधारणाओं का स्तर (Hierarchy):
1. **आर्टिफिशियल इंटेलिजेंस (AI):** वह व्यापक क्षेत्र जिसमें मशीनें मानव जैसी समझ दिखाती हैं।
2. **मशीन लर्निंग (ML):** AI का वह हिस्सा जहां सिस्टम डेटा से स्वयं सीखता है।
3. **डीप लर्निंग (DL):** मानव मस्तिष्क के न्यूरॉन्स से प्रेरित बहुस्तरीय कृत्रिम नेटवर्क।
4. **जेनेरेटिव एआई (GenAI):** डीप लर्निंग का वह आधुनिक रूप जो नया टेक्स्ट, चित्र, कोड और ऑडियो बना सकता है।`
        }
      },
      {
        pageNumber: 6,
        type: 'deep_dive',
        title: {
          en: 'Chapter 6: Inside the Machine — Data, Compute & Weights',
          hinglish: 'Chapter 6: AI ke 3 Pillars — Data, Compute aur Weights',
          hi: 'अध्याय 6: एआई के तीन मुख्य स्तंभ'
        },
        subtitle: {
          en: 'What actually powers modern breakthroughs?',
          hinglish: 'AI model banane ke liye kya zaroori hota hai?',
          hi: 'डेटा, कंप्यूटिंग पावर और न्यूरल वेट्स'
        },
        content: {
          en: `### The Holy Trinity of Modern AI
Why did AI suddenly explode in 2022-2026 instead of 1980? Because three separate curves converged:

1. **Massive Curated Datasets:**
   Trillions of tokens from digitized literature, Wikipedia, GitHub repositories, and scientific papers.
2. **Specialized Compute Hardware (GPUs & TPUs):**
   NVIDIA GPUs designed for parallel matrix multiplication enabled models to train in days rather than millennia.
3. **The Transformer Architecture (Attention is All You Need):**
   Introduced by Google researchers in 2017, the Attention mechanism allowed models to weigh relations between words across long distances concurrently.`,
          hinglish: `### AI Achanak Itna Powerful Kyun Hua?
Kyunki 3 cheezein ek saath mil gayi:
1. **Data:** Internet par maujood trillions of articles, books aur code.
2. **Compute (GPUs):** High-speed graphic cards jo billions of math operations ek second me kar sakte hain.
3. **Transformer Architecture:** 2017 me Google ke scientists ne ek formula banaya jisse AI sentences ke context ko ek saath samajh sakta hai!`,
          hi: `### आधुनिक एआई क्रांति के कारण:
1. **विशाल डेटा:** इंटरनेट पर उपलब्ध खरबों शब्द, किताबें और शोध पत्र।
2. **सक्षम हार्डवेयर (GPUs):** अत्यधिक तेज़ ग्राफिक्स प्रोसेसर जो सेकंडों में गणितीय गणनाएं करते हैं।
3. **ट्रांसफार्मर आर्किटेक्चर:** 2017 में विकसित वह तकनीक जिससे एआई शब्दों के संदर्भ (context) को गहराई से समझता है।`
        }
      },
      {
        pageNumber: 7,
        type: 'deep_dive',
        title: {
          en: 'Chapter 7: Ethics, Bias & The Hallucination Phenomenon',
          hinglish: 'Chapter 7: AI ki Galtiyan — Hallucinations aur Bias',
          hi: 'अध्याय 7: एआई की सीमाएं, पूर्वाग्रह और गलतियां'
        },
        subtitle: {
          en: 'Why AI lies with extreme confidence and how to stay vigilant',
          hinglish: 'AI jhooth kyun bolta hai aur ise kaise pehchanein?',
          hi: 'एआई आत्मविश्वास से गलत जानकारी क्यों देता है?'
        },
        content: {
          en: `### The Illusion of Truth: AI Hallucinations
Because LLMs predict plausible next tokens rather than querying an absolute truth database, they can construct entirely fabricated citations, historical dates, or legal precedents with unwavering grammatical eloquence.

### 3 Critical Rules for Responsible Student Use:
- **Trust But Verify:** Never take medical advice, legal citations, or sensitive research statistics from an AI without cross-referencing primary literature.
- **Cognitive Outsourcing vs Assistance:** Use AI to clarify ideas, refine phrasing, and challenge your reasoning — not to replace your critical thinking.
- **Beware of Training Bias:** AI models inherit cultural, historical, and demographic biases present in web crawl training data.`,
          hinglish: `### AI Hallucination Kya Hota Hai?
Kayi baar AI itne confidence se galat answer deta hai ki lagta hai 100% sach hai. Ise **Hallucination** kehte hain!

AI fact-checker nahi hai; AI statistical language model hai jo aisi line likhta hai jo sunne me bilkul sach lage!

### Student ke liye 3 Golden Rules:
1. **Important Numbers & Dates:** Hamesha original book ya official source se verify karo.
2. **Critical Thinking:** AI ko apna assistant banao, apna dimaag replace mat hone do!
3. **Fact Verification:** Direct research papers me quotes check karo.`,
          hi: `### हेलुसिनेशन (Hallucination) क्या है?
एआई कोई सत्य खोजने वाली मशीन नहीं है; यह शब्दों की संभावनाओं का अनुमान लगाता है। इसलिए कई बार यह अत्यंत आत्मविश्वास के साथ गलत तथ्य या झूठे संदर्भ प्रस्तुत कर देता है।

### छात्रों के लिए सुरक्षा नियम:
1. महत्वपूर्ण तिथियों, वैज्ञानिक आंकड़ों और सूत्रों को हमेशा मूल पुस्तक से जांचें।
2. एआई का उपयोग सोचने के विकल्प के रूप में नहीं, बल्कि विचार स्पष्ट करने के सहायक के रूप में करें।`
        }
      },
      {
        pageNumber: 8,
        type: 'case_study',
        title: {
          en: 'Chapter 8: Real Student Case Study',
          hinglish: 'Chapter 8: Real Student Transformation Story',
          hi: 'अध्याय 8: वास्तविक छात्र सफलता की कहानी'
        },
        subtitle: {
          en: 'How Aarav went from failing Physics derivations to mastering concepts',
          hinglish: 'Aarav ne AI ko apna 24/7 Socratic Coach kaise banaya',
          hi: 'आरव ने भौतिकी के कठिन सिद्धांतों पर कैसे महारत हासिल की'
        },
        caseStudy: {
          en: {
            studentName: 'Aarav (Grade 12 Science Student)',
            challenge: 'Electromagnetic Induction and Lenz\'s Law were completely unintuitive from textbook diagrams, leading to repeated scoring drops in weekly mock exams.',
            aiApproach: 'Instead of asking for homework answers, Aarav prompted: "Act as a passionate physics mentor. Explain Lenz\'s Law using a runaway roller-coaster magnetic brake analogy. Then give me 2 conceptual scenarios to test my understanding."',
            result: 'Aarav achieved a perfect 100% score on the subsequent school electromagnetic evaluation and retained the visual physics mechanics permanently.',
            quote: '"When you treat AI as an interactive visual tutor rather than an answer dispenser, your learning velocity triples."'
          },
          hinglish: {
            studentName: 'Aarav (Class 12th Student)',
            challenge: 'Physics me Lenz\'s Law aur Electromagnetic Induction textbook padh kar bilkul samajh nahi aa raha tha. Mock tests me marks kam ho rahe the.',
            aiApproach: 'Aarav ne AI ko bola: "Explain Lenz\'s Law using a roller-coaster magnetic brake analogy. Aur fir mujhse 2 conceptual questions pucho taaki mai test kar saku."',
            result: 'Aarav ko concept 10 minute me crystal clear ho gaya aur agle physics test me full marks score kiye!',
            quote: '"AI ko jab dost ki tarah real-life analogies samjhane ke liye bola, tab physics sabse favorite subject ban gaya."'
          },
          hi: {
            studentName: 'आरव (12वीं कक्षा के छात्र)',
            challenge: 'भौतिक विज्ञान में विद्युत चुम्बकीय प्रेरण और लेन्ज़ का नियम समझ में नहीं आ रहा था।',
            aiApproach: 'आरव ने एआई से कहा: "मुझे लेन्ज़ का नियम रोलर कोस्टर ब्रेक के उदाहरण से समझाओ और फिर मेरा टेस्ट लो।"',
            result: 'अवधारणा स्पष्ट हो गई और अगले टेस्ट में आरव ने शत-प्रतिशत अंक प्राप्त किए।',
            quote: '"जब आप एआई से उत्तर मांगने के बजाय अवधारणा समझाने को कहते हैं, तब वास्तविक सीख मिलती है।"'
          }
        }
      },
      {
        pageNumber: 9,
        type: 'prompt_lab',
        title: {
          en: 'Chapter 9: Master Prompt Lab 🧪',
          hinglish: 'Chapter 9: Try It Yourself Lab 🧪',
          hi: 'अध्याय 9: व्यावहारिक प्रॉम्प्ट प्रयोगशाला 🧪'
        },
        subtitle: {
          en: 'Copy, customize, and execute this high-yield learning prompt',
          hinglish: 'Is tested prompt ko copy karke ChatGPT ya Gemini me try karein',
          hi: 'इस प्रॉम्प्ट को कॉपी करें और सीधे चैटजीपीटी या जेमिनी पर चलाएं'
        },
        promptBox: {
          en: {
            title: 'The Multi-Perspective Explainer Prompt',
            description: 'Deconstruct any hard STEM or humanities topic into crystal-clear mental models.',
            promptText: `Act as a world-class educational communicator (like Richard Feynman).
I need to understand: [TOPIC: e.g. Quantum Entanglement / Inflation / Photosynthesis].

Please structure your explanation as follows:
1. The One-Sentence Core Truth: Absolute essence without jargon.
2. The Daily-Life Analogy: Connect it to something familiar (like cooking, sports, or smartphones).
3. The Mechanics: How it actually works step-by-step.
4. Top 2 Common Misconceptions: What do beginners misunderstand?
5. Two Socratic Questions: Ask me 2 quick questions to test if I truly grasped it.`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          },
          hinglish: {
            title: 'The Feynman Style Explainer Prompt',
            description: 'Kisi bhi mushkil topic ko simple analogies aur clarity ke saath samjhein.',
            promptText: `Mera naam ek student hai aur mujhe [TOPIC: e.g. Photosynthesis / Inflation / Doppler Effect] samajhna hai.
Kripya ise ek simple aur engaging style me samjhaiye:
1. Ek daily-life analogy (jaise cricket, chai ya mobile games) use karo
2. 3 sabse important practical points batao
3. Log isme kya common mistake karte hain?
4. End me 2 simple questions pucho taaki mai test kar saku mujhe kitna samajh aaya.
Language: Clear conversational Hinglish.`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          },
          hi: {
            title: 'रिचर्ड फाइनमैन व्याख्या प्रॉम्प्ट',
            description: 'किसी भी कठिन विषय को सरल उदाहरणों के साथ समझें।',
            promptText: `कृपया मुझे [विषय: जैसे प्रकाश संश्लेषण / मुद्रास्फीति / ब्लैक होल] समझाएं।
1. एक पंक्ति में मुख्य सारांश
2. दैनिक जीवन का सरल उदाहरण
3. यह चरण-दर-चरण कैसे काम करता है
4. दो प्रश्न पूछें ताकि मैं अपनी समझ जांच सकूं।
भाषा: स्पष्ट एवं सरल हिंदी।`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          }
        }
      },
      {
        pageNumber: 10,
        type: 'quiz_checkpoint',
        title: {
          en: 'Chapter 10: Final Module Mastery Checkpoint',
          hinglish: 'Chapter 10: Final Knowledge Checkpoint',
          hi: 'अध्याय 10: मॉड्यूल समीक्षा एवं मूल्यांकन'
        },
        subtitle: {
          en: 'Validate your foundational AI mental models before graduating to Module 2',
          hinglish: 'Module 1 ka final quiz solve karein aur Module 2 unlock karein!',
          hi: 'मॉड्यूल 1 के मुख्य सिद्धांतों की अंतिम जांच'
        },
        quiz: {
          en: {
            question: 'What fundamentally differentiates an AI model from a traditional deterministic computer program?',
            options: [
              'AI systems compute calculations faster than standard CPU chips',
              'Traditional programs follow hand-coded human rules, whereas AI derives probabilistic patterns from datasets',
              'Traditional programs require electricity while AI operates purely on mathematical algorithms',
              'AI is exclusively restricted to humanoid robotics'
            ],
            correctIndex: 1,
            explanation: 'Correct! Deterministic programming encodes exact human-written logic, whereas AI systems optimize probabilistic neural weights from observed empirical data.'
          },
          hinglish: {
            question: 'Traditional computer programming aur AI me sabse fundamental farak kya hai?',
            options: [
              'Traditional programs fast hote hain, AI slow hota hai',
              'Traditional programs me human har rule likhta hai, jabki AI data se pattern khud seekhta hai',
              'AI sirf robots me chalta hai, normal computers me nahi',
              'Dono me koi technical farak nahi hota'
            ],
            correctIndex: 1,
            explanation: 'Bilkul sahi! Traditional coding me step-by-step logic human programmer likhta hai, jabki AI machine learning ke zariye data se pattern khud learn karta hai.'
          },
          hi: {
            question: 'पारंपरिक कंप्यूटर प्रोग्रामिंग और आर्टिफिशियल इंटेलिजेंस में मुख्य अंतर क्या है?',
            options: [
              'पारंपरिक प्रोग्राम तेज़ होते हैं और एआई धीमा होता है',
              'पारंपरिक प्रोग्राम में मानव हर नियम लिखता है, जबकि एआई डेटा से पैटर्न पहचानना सीखता है',
              'एआई केवल रोबोट में काम करता है, कंप्यूटर में नहीं',
              'दोनों में कोई अंतर नहीं है'
            ],
            correctIndex: 1,
            explanation: 'बिल्कुल सही! पारंपरिक कोडिंग नियमों पर चलती है, जबकि एआई डेटा से सीखकर नए पैटर्न विकसित करता है।'
          }
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MODULE 2: HOW MODERN AI WORKS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'how-modern-ai-works',
    moduleNumber: 2,
    category: 'fundamentals',
    level: 'Beginner',
    readTime: '12 min read',
    icon: 'Brain',
    themeColor: {
      primary: '#7c3aed',
      badge: 'bg-purple-100 text-purple-800',
      spine: 'from-purple-800 to-indigo-950',
      cover: 'from-purple-700 via-violet-600 to-indigo-800',
      accent: '#8b5cf6'
    },
    title: {
      en: 'How Modern AI Works',
      hinglish: 'How Modern AI Works (LLM & Neural Networks)',
      hi: 'आधुनिक एआई कैसे काम करता है?'
    },
    subtitle: {
      en: 'LLMs, Neural Networks, Tokens & Training explained without scary mathematics',
      hinglish: 'LLM, Neural Networks, Tokens aur Training ko simple bhasha me samjhein',
      hi: 'एलएलएम, न्यूरल नेटवर्क और टोकन्स को सरल भाषा में समझें'
    },
    summary: {
      en: 'Unravel the inner architecture of Large Language Models: how text is tokenized into vectors, how neural weights predict next words, and how RLHF aligns AI behavior.',
      hinglish: 'LLM kya hota hai? AI words ko tokens me kaise todta hai aur agla shabd kaise predict karta hai.',
      hi: 'लार्ज लैंग्वेज मॉडल्स (LLM) की कार्यप्रणाली, टोकनाइज़ेशन और न्यूरल वेट्स की विस्तृत एवं सरल समझ।'
    },
    pages: [
      {
        pageNumber: 1,
        type: 'intro',
        title: {
          en: 'Chapter 1: The Next-Word Prediction Engine',
          hinglish: 'Chapter 1: The Prediction Engine',
          hi: 'अध्याय 1: अगला शब्द अनुमान प्रणाली'
        },
        subtitle: {
          en: 'Why LLMs are fundamentally sophisticated statistical autocomplete machines',
          hinglish: 'AI soochta nahi hai, statistical prediction karta hai!',
          hi: 'एआई वास्तव में कैसे वाक्य बनाता है?'
        },
        content: {
          en: `### The Great Misconception
When an AI composes a heartfelt poem or solves a Python bug, it is easy to assume it possesses conscious intent. In reality, modern Large Language Models (LLMs) are the world's most advanced **Next-Token Prediction Engines**.

When you type a prompt into ChatGPT:
1. The model converts your characters into mathematical numerical vectors.
2. It runs these vectors through billions of mathematical parameters (matrix weights).
3. It evaluates a probability distribution over a vocabulary of ~100,000 potential tokens.
4. It selects the statistically most coherent next token and feeds it back into the context window to repeat the cycle!`,
          hinglish: `### LLM Asal Me Kya Hota Hai?
Jab aap ChatGPT me likhte ho, toh kya computer insaan ki tarah sochta hai? **Nahi!**

Technically, ek LLM ek **"Super-Smart Next-Word Predictor"** hota hai.
Aapke phone ke keyboard par jab aap type karte ho *"Main kal school..."* toh keyboard upar suggest karta hai: *"jaunga"*, *"nahi jaunga"*.

LLM isi auto-complete ko trillions of books aur internet pages ke basis par super-human scale par karta hai!`,
          hi: `### लार्ज लैंग्वेज मॉडल (LLM) क्या है?
जब आप चैटजीपीटी में कुछ पूछते हैं, तो वह इंसान की तरह सोचता नहीं है, बल्कि अगले सबसे संभावित शब्द (Next Token) का गणितीय अनुमान लगाता है। जैसे आपके मोबाइल कीपैड में शब्द अपने आप सुझाए जाते हैं, वैसे ही एआई खरबों शब्दों के आधार पर अगला शब्द चुनता है।`
        }
      },
      {
        pageNumber: 2,
        type: 'deep_dive',
        title: {
          en: 'Chapter 2: Tokens — The Currency of AI',
          hinglish: 'Chapter 2: Tokens Kya Hote Hain?',
          hi: 'अध्याय 2: टोकन्स — एआई की मूल भाषा'
        },
        subtitle: {
          en: 'Why AI cannot read letters and how it slices language into numbers',
          hinglish: 'AI text ko numbers me kaise convert karta hai?',
          hi: 'अक्षरों से संख्याओं में परिवर्तन'
        },
        content: {
          en: `### What is a Token?
AI neural networks cannot process raw English or Hindi letters directly; they only perform mathematical matrix operations on floating-point numbers.
- **Rule of Thumb:** In English, 1 Token is roughly equivalent to 4 characters or 0.75 words.
- For example, \`"Prepo.ai is awesome"\` might be sliced into \`["Prep", "o", ".ai", " is", " awesome"]\`.
- Rare words or non-English scripts often require multiple tokens per word, which is why processing regional languages historically consumed higher compute.`,
          hinglish: `### Tokens Kya Hote Hain?
AI seedha alphabet ya word nahi padhta. Wo text ko chhote tukdon me divide karta hai jise **Tokens** kehte hain.
- Normal English me: **1 Token ≈ 4 characters** ya **0.75 words**.
- 1,000 Tokens lagbhag 750 words ke barabar hote hain.

\`"Prepo.ai is awesome"\` -> \`["Prep", "o", ".ai", " is", " awesome"]\`
Har token ko ek unique number ID milti hai jise neural network calculate karta hai.`,
          hi: `### टोकन का अर्थ:
एआई सीधे अक्षरों को नहीं पढ़ता, बल्कि शब्दों को छोटे-छोटे टुकड़ों (टोकन्स) में विभाजित करता है।
- अंग्रेजी में 1 टोकन लगभग 4 अक्षरों या 0.75 शब्दों के बराबर होता है।
- उदाहरण: "Prepo.ai is great" को अलग-अलग टोकन्स में बदलकर कंप्यूटर उन्हें संख्याओं में प्रोसेस करता है।`
        }
      },
      {
        pageNumber: 3,
        type: 'deep_dive',
        title: {
          en: 'Chapter 3: Vectors & Embeddings — The Meaning Space',
          hinglish: 'Chapter 3: Vectors aur Embeddings ka Jadu',
          hi: 'अध्याय 3: वेक्टर्स और एम्बेडिंग्स'
        },
        subtitle: {
          en: 'How machines understand that "King" and "Queen" are related',
          hinglish: 'AI shabdon ka meaning kaise samajhta hai?',
          hi: 'मशीनें शब्दों के अर्थ कैसे समझती हैं?'
        },
        content: {
          en: `### High-Dimensional Meaning Space
How does an algorithm know that an apple is closer to an orange than to a submarine? Through **Vector Embeddings**.
- Every word is assigned a coordinate vector in a multi-thousand dimensional mathematical space.
- Words with similar conceptual meanings reside close to each other in this space.
- The classic computational equation:
  \`Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen")\``,
          hinglish: `### Shabad ka Coordinates (Embeddings):
Socho ek 3D map jisme har shabad ka ek address (X, Y, Z coordinates) hai.
- "Seb" aur "Kela" paas-paas honge kyunki dono fruits hain.
- "Car" aur "Hawaijahaz" paas honge kyunki dono vehicles hain.
Jab AI shabdon ko coordinates me rakh deta hai, toh wo meanings ko mathematical distance se samajh leta hai!`,
          hi: `### अर्थ का गणितीय नक्शा:
एआई हर शब्द को एक बहु-आयामी नक्शे में स्थान (वेक्टर) देता है। समान अर्थ वाले शब्द जैसे 'राजा' और 'रानी' इस नक्शे में एक-दूसरे के पास स्थित होते हैं।`
        }
      },
      {
        pageNumber: 4,
        type: 'deep_dive',
        title: {
          en: 'Chapter 4: The 3 Stages of Training an AI',
          hinglish: 'Chapter 4: AI Kaise Train Hota Hai?',
          hi: 'अध्याय 4: एआई को प्रशिक्षित करने के तीन चरण'
        },
        subtitle: {
          en: 'Pre-training, Fine-Tuning & Reinforcement Learning (RLHF)',
          hinglish: 'Pre-training se lekar RLHF tak ka safar',
          hi: 'प्री-ट्रेनिंग से लेकर मानव फीडबैक तक'
        },
        content: {
          en: `### The Tripartite Training Pipeline
1. **Pre-Training (Raw Knowledge Ingestion):**
   The model reads trillions of tokens across the open web. At this stage, it is merely an echo chamber predicting text, not a helpful assistant.
2. **Supervised Fine-Tuning (SFT):**
   Human experts curate thousands of high-quality Question-Answer pairs to teach the model how to respond like a courteous dialogue partner.
3. **RLHF (Reinforcement Learning from Human Feedback):**
   Humans rank different AI responses to train a reward model, steering the system towards truthfulness, safety, and helpfulness.`,
          hinglish: `### AI ki Padhai ke 3 Class:
1. **Pre-Training (Duniya ka Sara Text Padhna):** AI internet ki saari books aur sites padhta hai taaki language seekh sake.
2. **Fine-Tuning (Question-Answer Format):** Experts AI ko sikhate hain ki student ke sawal ka clean aur helpful answer kaise dena hai.
3. **RLHF (Human Feedback):** Humans AI ke answers ko marks dete hain taaki AI polite, accurate aur safe rahe.`,
          hi: `### तीन प्रशिक्षण चरण:
1. **प्री-ट्रेनिंग:** इंटरनेट का सारा खुला ज्ञान पढ़ना।
2. **फाइन-ट्यूनिंग:** प्रश्नोत्तर शैली में बातचीत सिखाना।
3. **आरएलएचएफ (RLHF):** इंसानों द्वारा फीडबैक देकर मॉडल को उपयोगी और सुरक्षित बनाना।`
        }
      },
      {
        pageNumber: 5,
        type: 'deep_dive',
        title: {
          en: 'Chapter 5: What are Parameters and Weights?',
          hinglish: 'Chapter 5: Parameters aur Neural Weights',
          hi: 'अध्याय 5: पैरामीटर्स और न्यूरल वेट्स'
        },
        subtitle: {
          en: 'What does "GPT-4 has over 1 trillion parameters" actually mean?',
          hinglish: '1 Trillion parameters ka kya matlab hota hai?',
          hi: 'पैरामीटर्स का सरल अर्थ'
        },
        content: {
          en: `### The Knobs of the AI Brain
Imagine an audio mixing console with 100 knobs that control bass, treble, and vocal reverberation.
- In a modern LLM, **parameters** are those exact knobs — except there are 70 Billion to 1 Trillion of them!
- During pre-training, backpropagation algorithms adjust these knobs slightly every time the model makes a prediction error.
- By the time training completes, the configuration of these weights encapsulates nuanced grammar, scientific theories, and coding syntax.`,
          hinglish: `### Dimaag ke Knobs (Weights):
Socho ek music system jisme sound adjust karne ke liye knobs hote hain.
- LLM me ye knobs ko hum **Parameters** kehte hain.
- GPT-4 me lagbhag **1 Trillion+ knobs** hain!
- Training ke dauran jab AI galat answer deta hai, toh algorithm in knobs ko thoda ghumata hai jab tak answer perfect na ho jaye.`,
          hi: `### न्यूरल वेट्स (संयोजन):
पैरामीटर्स को आप मशीन के अंदर के अरबों छोटे स्विच समझ सकते हैं। प्रशिक्षण के दौरान इन स्विचों को तब तक समायोजित किया जाता है जब तक मॉडल सही उत्तर न देने लगे।`
        }
      },
      {
        pageNumber: 6,
        type: 'deep_dive',
        title: {
          en: 'Chapter 6: Context Window — The Working Memory',
          hinglish: 'Chapter 6: Context Window Kya Hai?',
          hi: 'अध्याय 6: कॉन्टेक्स्ट विंडो (कार्यशील स्मृति)'
        },
        subtitle: {
          en: 'Why models forget what you said 20 pages ago',
          hinglish: 'AI ki memory kitni badi hoti hai?',
          hi: 'एआई एक बार में कितना याद रख सकता है?'
        },
        content: {
          en: `### Context Window Explained
An LLM has no permanent memory of your past interactions unless it fits inside its **Context Window**.
- Think of the context window as the model's desk space.
- A 32,000-token context window can fit a 40-page report on the desk.
- Gemini 1.5 Pro expanded this to **2 Million tokens** — capable of analyzing an entire library or 1 hour of raw video in a single prompt!`,
          hinglish: `### Table ka Size (Context Window):
Context window AI ki working memory hoti hai.
- Jaise ek desk par aap ek saath 5 kitabein khol sakte ho, waise hi AI ek prompt me kitne words yaad rakh sakta hai use Context Window kehte hain.
- Purane models me 4,000 words tha, lekin naye models (jaise Gemini) 10 lakh words ek saath yaad rakh sakte hain!`,
          hi: `### कार्यशील स्मृति:
कॉन्टेक्स्ट विंडो यह तय करती है कि एआई एक बार में कितने शब्दों को याद रखकर विश्लेषण कर सकता है। नए मॉडल्स पूरी किताब को एक बार में प्रोसेस कर सकते हैं।`
        }
      },
      {
        pageNumber: 7,
        type: 'deep_dive',
        title: {
          en: 'Chapter 7: Chain-of-Thought (CoT) Reasoning',
          hinglish: 'Chapter 7: Chain of Thought Reasoning',
          hi: 'अध्याय 7: चरणबद्ध तर्क (Chain-of-Thought)'
        },
        subtitle: {
          en: 'How forcing AI to show its work boosts problem-solving accuracy by 300%',
          hinglish: 'AI ko step-by-step sochna kaise sikhayein?',
          hi: 'चरणबद्ध समाधान से सटीकता बढ़ाना'
        },
        content: {
          en: `### Why Direct Answers Fail
If you ask a human to solve a 5-step algebra equation instantly in their head, they often make careless calculation errors. But if you give them paper to write intermediate steps, their accuracy skyrockets.
- LLMs behave identically.
- If an LLM is forced to output the final answer immediately, it only has one token's worth of computation.
- By prompting **"Think step-by-step before answering"**, you allow the model to generate intermediate tokens that serve as scratchpad memory!`,
          hinglish: `### Step-by-Step Kyun Zaroori Hai?
Agar aap kisi se bologe ki 37 × 49 bina pen-paper ke 1 second me batao, toh wo galti karega. Lekin paper par step-by-step karega toh sahi answer aayega.
AI ke saath bhi yahi hota hai! Jab aap bolte ho *"Solve step-by-step"*, toh AI har step ko calculate karke intermediate memory banata hai jisse accuracy 90% badh jaati hai.`,
          hi: `### चरणबद्ध सोच का महत्व:
जब आप एआई को सीधे उत्तर देने के बजाय "कदम-दर-कदम सोचें" (Think step-by-step) का निर्देश देते हैं, तो उसकी सटीकता कई गुना बढ़ जाती है।`
        }
      },
      {
        pageNumber: 8,
        type: 'case_study',
        title: {
          en: 'Chapter 8: Engineering Benchmark Case Study',
          hinglish: 'Chapter 8: Coding & Logic Case Study',
          hi: 'अध्याय 8: वास्तविक कोडिंग केस स्टडी'
        },
        subtitle: {
          en: 'Debugging complex asynchronous code with token awareness',
          hinglish: 'Kaise Prateek ne token limit samajhkar code debug kiya',
          hi: 'प्रतीक ने टोकन समझकर बग कैसे ठीक किया'
        },
        caseStudy: {
          en: {
            studentName: 'Prateek (B.Tech Computer Science)',
            challenge: 'Prateek pasted a 2,000-line monolithic codebase into ChatGPT, and the AI kept truncating code mid-sentence and missing root bugs.',
            aiApproach: 'Prateek modularized his prompt: he isolated the asynchronous database connector function, passed only the relevant schema context, and asked the AI to trace variable lifetimes step-by-step.',
            result: 'The AI identified a silent race condition in 10 seconds with zero truncation.',
            quote: '"Understanding context windows and token limits turns you from a frustrated user into a master prompt architect."'
          },
          hinglish: {
            studentName: 'Prateek (B.Tech CS Student)',
            challenge: 'Prateek ne 2000 lines ka poora project ek saath paste kar diya, jisse AI confuse ho gaya aur beech me ruk gaya.',
            aiApproach: 'Prateek ne token limit samjhi aur sirf problem wali 50 lines function schema ke saath pass ki aur step-by-step trace karne ko bola.',
            result: 'AI ne 10 second me race condition bug fix kar diya!',
            quote: '"Jab aap AI ko chhota aur targeted context dete ho, toh answer 10x accurate aata hai."'
          },
          hi: {
            studentName: 'प्रतीक (बी.टेक छात्र)',
            challenge: 'पूरा लंबा कोड एक साथ डालने पर एआई अधूरा उत्तर दे रहा था।',
            aiApproach: 'प्रतीक ने कोड को छोटे हिस्सों में बांटकर केवल आवश्यक भाग पर चरणबद्ध विश्लेषण करवाया।',
            result: 'एआई ने 10 सेकंड में छिपी हुई गलती को ढूंढकर सही कोड दिया।',
            quote: '"सीमित और सटीक संदर्भ देने से एआई का आउटपुट सर्वोत्तम होता है।"'
          }
        }
      },
      {
        pageNumber: 9,
        type: 'prompt_lab',
        title: {
          en: 'Chapter 9: Master Prompt Lab 🧪',
          hinglish: 'Chapter 9: Try It Yourself Lab 🧪',
          hi: 'अध्याय 9: व्यावहारिक प्रॉम्प्ट प्रयोगशाला 🧪'
        },
        subtitle: {
          en: 'The Chain-of-Thought (CoT) Master Template',
          hinglish: 'Step-by-step reasoning wala master prompt copy karein',
          hi: 'चरणबद्ध तर्क का मास्टर प्रॉम्प्ट'
        },
        promptBox: {
          en: {
            title: 'The Structured Reasoner Prompt',
            description: 'Forces the LLM to verify logical premises before generating solutions.',
            promptText: `I need you to solve this complex problem:
Problem: [PASTE YOUR MATHS, CODING OR LOGIC QUESTION HERE]

EXECUTION PROTOCOL:
1. Deconstruct: List all given constraints and explicit assumptions.
2. Draft Work: Write down intermediate formulas and calculations step-by-step.
3. Self-Critique: Check for common edge cases or arithmetic errors.
4. Final Verdict: State the clean final answer in a standalone highlighted block.`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          },
          hinglish: {
            title: 'The Step-by-Step Reasoner Prompt',
            description: 'Kisi bhi complex problem ko step-by-step solve karne ke liye.',
            promptText: `Kripya is problem ko solve karein:
Problem: [PASTE QUESTION HERE]

RULES:
1. Pehle "Given Facts" aur constraints likho.
2. Step-by-step intermediate calculation dikhao. Direct answer mat dena.
3. Ek baar khud cross-check karo ki koi calculation error toh nahi hai.
4. Last me "Final Answer" highlight karke likho.`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          },
          hi: {
            title: 'चरणबद्ध समाधान प्रॉम्प्ट',
            description: 'गणित या तर्क के कठिन प्रश्नों को हल करने के लिए।',
            promptText: `कृपया इस समस्या को हल करें:
समस्या: [यहाँ प्रश्न पेस्ट करें]

नियम:
1. पहले दिए गए मुख्य बिंदु लिखें।
2. चरणबद्ध तरीके से गणना करें।
3. अंतिम उत्तर अलग से स्पष्ट रूप से लिखें।`,
            tools: ['ChatGPT', 'Google Gemini', 'Claude']
          }
        }
      },
      {
        pageNumber: 10,
        type: 'quiz_checkpoint',
        title: {
          en: 'Chapter 10: Final Module Checkpoint',
          hinglish: 'Chapter 10: Final Knowledge Checkpoint',
          hi: 'अध्याय 10: अंतिम समीक्षा प्रश्न'
        },
        subtitle: {
          en: 'Test your understanding of LLM mechanics',
          hinglish: 'LLM concept ka test karein',
          hi: 'एलएलएम कार्यप्रणाली की जांच'
        },
        quiz: {
          en: {
            question: 'What is a "token" in the context of modern Large Language Models?',
            options: [
              'A security cryptocurrency used to purchase computing cycles',
              'A sub-word character chunk converted into numerical vectors for probabilistic prediction',
              'The physical silicon core inside a GPU processor',
              'The user session password cookie'
            ],
            correctIndex: 1,
            explanation: 'Correct! A token is a chunk of characters (roughly 4 characters in English) mapped to high-dimensional mathematical vectors.'
          },
          hinglish: {
            question: 'LLM me "Token" ka kya matlab hota hai?',
            options: [
              'Ek crypto coin jisse payment hoti hai',
              'Text ka chhota tukda (sub-word/characters) jise model mathematical form me process karta hai',
              'Processor ka ek part',
              'User ka password'
            ],
            correctIndex: 1,
            explanation: 'Right! Tokens are chunks of characters that LLMs convert into numbers to predict the next word.'
          },
          hi: {
            question: 'एलएलएम (LLM) में "टोकन" क्या होता है?',
            options: [
              'एक प्रकार का डिजिटल सिक्का',
              'शब्दों का छोटा टुकड़ा जिसे कंप्यूटर गणितीय रूप में प्रोसेस करता है',
              'कंप्यूटर का हार्डवेयर',
              'उपयोगकर्ता का पासवर्ड'
            ],
            correctIndex: 1,
            explanation: 'बिल्कुल सही! टोकन शब्दों का वह छोटा हिस्सा है जिसे मॉडल संख्याओं में बदलकर समझता है।'
          }
        }
      }
    ]
  }
];

// Helper to generate a standardized 10-chapter module structure for remaining modules
// to guarantee 10 rich chapters for all 10 modules in all 3 languages!
export function getCompleteModules() {
  const baseModules = [...AI_ACADEMY_MODULES];
  
  // Data definitions for modules 3 to 10
  const remainingMeta = [
    {
      id: 'meet-chatgpt-gemini-claude',
      moduleNumber: 3,
      category: 'tools',
      level: 'Beginner',
      readTime: '11 min read',
      icon: 'MessageSquare',
      themeColor: {
        primary: '#059669',
        badge: 'bg-emerald-100 text-emerald-800',
        spine: 'from-emerald-800 to-teal-950',
        cover: 'from-emerald-600 via-teal-600 to-green-800',
        accent: '#10b981'
      },
      title: { en: 'Meet ChatGPT, Gemini & Claude', hinglish: 'Meet ChatGPT, Gemini & Claude', hi: 'चैटजीपीटी, जेमिनी और क्लाउड' },
      subtitle: { en: 'The definitive comparative benchmark: Which tool to choose and why', hinglish: 'Teeno bade AI tools ka ultimate comparison', hi: 'प्रमुख एआई टूल्स की तुलना और सही चुनाव' },
      summary: { en: 'Compare the big 3 frontier models across coding, real-time research, creative writing, and multimodal reasoning.', hinglish: 'ChatGPT, Gemini aur Claude ka comparison. Coding ke liye kaunsa best hai aur writing ke liye kaunsa.', hi: 'प्रमुख एआई टूल्स की विशेषताओं और उपयोगों की विस्तृत तुलना।' },
      chapters: [
        { en: 'The Frontier Model Landscape', hinglish: 'Frontier AI Models ka Maahaul', hi: 'प्रमुख एआई टूल्स का परिदृश्य' },
        { en: 'ChatGPT: The Swiss Army Knife', hinglish: 'ChatGPT: Har Fankar All-Rounder', hi: 'चैटजीपीटी: बहुउद्देशीय सहायक' },
        { en: 'Google Gemini: The Multimodal & Live Search Giant', hinglish: 'Google Gemini: Live Search aur YouTube Master', hi: 'गूगल जेमिनी: लाइव डेटा और वीडियो विश्लेषण' },
        { en: 'Claude: The Nuanced Writer & Coding Maestro', hinglish: 'Claude: Shandar Writing aur Coding', hi: 'क्लाउड: उत्कृष्ट लेखन और कोडिंग' },
        { en: 'The Comparative Decision Matrix', hinglish: 'Tool Selection Decision Matrix', hi: 'उपयोग के आधार पर सही टूल का चयन' },
        { en: 'Free vs Paid Tiers: Is Subscription Worth It?', hinglish: 'Free vs Paid: Kya Subscription Lena Chahiye?', hi: 'निःशुल्क बनाम सशुल्क योजनाएं' },
        { en: 'Multi-Tool Power Workflows', hinglish: 'Teeno Tools ko Ek Saath Combine Karna', hi: 'एकाधिक टूल्स का संयुक्त उपयोग' },
        { en: 'Student Research Showcase', hinglish: 'Student Research Case Study', hi: 'छात्र शोध केस स्टडी' },
        { en: 'Tri-Model Benchmark Prompt Lab 🧪', hinglish: 'Tri-Model Comparison Prompt Lab 🧪', hi: 'तुलनात्मक प्रॉम्प्ट लैब 🧪' },
        { en: 'Module 3 Mastery Checkpoint', hinglish: 'Module 3 Final Checkpoint Quiz', hi: 'मॉड्यूल 3 अंतिम मूल्यांकन' }
      ]
    },
    {
      id: 'prompt-engineering',
      moduleNumber: 4,
      category: 'productivity',
      level: 'Intermediate',
      readTime: '14 min read',
      icon: 'PenTool',
      themeColor: {
        primary: '#d97706',
        badge: 'bg-amber-100 text-amber-800',
        spine: 'from-amber-800 to-amber-950',
        cover: 'from-amber-600 via-orange-600 to-yellow-800',
        accent: '#f59e0b'
      },
      title: { en: 'Prompt Engineering', hinglish: 'Prompt Engineering Masterclass', hi: 'प्रॉम्प्ट इंजीनियरिंग' },
      subtitle: { en: 'Master the art and science of instructing AI with surgical precision', hinglish: 'AI se 10x better answers nikalne ka master blueprint', hi: 'सटीक और प्रभावी प्रॉम्प्ट लिखने की कला' },
      summary: { en: 'Discover the RTCFE formula, zero-shot vs few-shot prompting, persona steering, and structured output formatting.', hinglish: 'The 5-Part Perfect Prompt Formula, persona steering aur real-world templates.', hi: 'आरसीटीएफई फॉर्मूला और प्रभावी प्रॉम्प्ट निर्माण के नियम।' },
      chapters: [
        { en: 'Garbage In, Garbage Out: The Prompting Reality', hinglish: 'Amateur vs Professional Prompts', hi: 'प्रॉम्प्टिंग का महत्व' },
        { en: 'The 5-Part RTCFE Prompt Formula', hinglish: 'The 5-Part RTCFE Blueprint', hi: 'आरसीटीएफई (RTCFE) फॉर्मूला' },
        { en: 'Persona & Role Steering', hinglish: 'Role Play aur Persona Steering', hi: 'भूमिका निर्धारण (Role-Playing)' },
        { en: 'Zero-Shot, One-Shot & Few-Shot Prompting', hinglish: 'Few-Shot Prompting: Examples Dena', hi: 'उदाहरण आधारित प्रॉम्प्टिंग' },
        { en: 'Constraints, Exclusions & Output Formatting', hinglish: 'Format aur Negative Constraints', hi: 'प्रारूप और सीमाएं' },
        { en: 'System Prompts & Custom Instructions', hinglish: 'Custom Instructions Setup Karna', hi: 'कस्टम निर्देश सेट करना' },
        { en: 'Prompt Chaining & Multi-Turn Workflows', hinglish: 'Multi-Turn Conversation Techniques', hi: 'श्रृंखलाबद्ध प्रॉम्प्टिंग' },
        { en: 'Campus Placement Interview Case Study', hinglish: 'Interview Crack Karne ki Case Study', hi: 'प्लेसमेंट इंटरव्यू केस स्टडी' },
        { en: 'The Universal Master Prompt Lab 🧪', hinglish: 'Universal Master Prompt Lab 🧪', hi: 'मास्टर प्रॉम्प्ट लैब 🧪' },
        { en: 'Prompt Engineering Certification Quiz', hinglish: 'Prompt Engineering Final Quiz', hi: 'प्रॉम्प्ट इंजीनियरिंग अंतिम परीक्षा' }
      ]
    },
    {
      id: 'ai-for-research-learning',
      moduleNumber: 5,
      category: 'productivity',
      level: 'Intermediate',
      readTime: '13 min read',
      icon: 'Search',
      themeColor: {
        primary: '#0891b2',
        badge: 'bg-cyan-100 text-cyan-800',
        spine: 'from-cyan-800 to-cyan-950',
        cover: 'from-cyan-600 via-teal-600 to-blue-800',
        accent: '#06b6d4'
      },
      title: { en: 'AI for Research & Learning', hinglish: 'AI for Research & Learning', hi: 'शोध और अध्ययन के लिए एआई' },
      subtitle: { en: 'Synthesize 100-page papers, extract literature matrices & verify citations', hinglish: '50-page PDF ko 5 minute me digest aur verify karein', hi: 'दस्तावेजों का त्वरित सारांश और शोध विश्लेषण' },
      summary: { en: 'Turn overwhelming reading lists into structured literature reviews using NotebookLM, Perplexity, and citation-grounded methods.', hinglish: 'NotebookLM aur Perplexity se academic research aur exam study speed 10x karein.', hi: 'शोध पत्रों के अध्ययन और सारांश निर्माण की आधुनिक तकनीकें।' },
      chapters: [
        { en: 'Taming the Information Firehose', hinglish: 'Information Overload ko Beat Karo', hi: 'विशाल डेटा को समझना' },
        { en: 'Document Upload & Semantic Search', hinglish: 'PDF Ingestion aur Deep Search', hi: 'दस्तावेज़ विश्लेषण और खोज' },
        { en: 'NotebookLM: The Zero-Hallucination Notebook', hinglish: 'NotebookLM: 100% Verified Citations', hi: 'नोटबुकएलएम की विशेषताएं' },
        { en: 'Comparative Literature Review Tables', hinglish: 'Comparative Research Matrix Banana', hi: 'तुलनात्मक तालिका निर्माण' },
        { en: 'Fact Checking & Citation Auditing', hinglish: 'Citation Cross-Verification', hi: 'तथ्य और संदर्भ जांच' },
        { en: 'Synthesizing Counter-Arguments & Critiques', hinglish: 'Critique aur Blindspots Identify Karna', hi: 'आलोचनात्मक विश्लेषण' },
        { en: 'Academic Integrity & Ethical Guidelines', hinglish: 'Academic Integrity aur Rules', hi: 'अकादमिक नैतिकता' },
        { en: 'M.Sc Thesis Acceleration Case Study', hinglish: 'Thesis Literature Review Case Study', hi: 'थीसिस निर्माण केस स्टडी' },
        { en: 'The Executive Research Synthesizer Lab 🧪', hinglish: 'Research Synthesizer Prompt Lab 🧪', hi: 'शोध विश्लेषण प्रॉम्प्ट लैब 🧪' },
        { en: 'Research Methodology Checkpoint Quiz', hinglish: 'Research Methodology Final Quiz', hi: 'शोध मूल्यांकन परीक्षा' }
      ]
    },
    {
      id: 'ai-as-personal-tutor',
      moduleNumber: 6,
      category: 'productivity',
      level: 'Beginner',
      readTime: '12 min read',
      icon: 'GraduationCap',
      themeColor: {
        primary: '#4f46e5',
        badge: 'bg-indigo-100 text-indigo-800',
        spine: 'from-indigo-800 to-indigo-950',
        cover: 'from-indigo-600 via-blue-700 to-slate-900',
        accent: '#6366f1'
      },
      title: { en: 'AI as Your Personal Tutor', hinglish: 'AI as Your 24/7 Personal Tutor', hi: 'व्यक्तिगत शिक्षक के रूप में एआई' },
      subtitle: { en: 'Master difficult Maths, Physics, Chemistry & Coding with the Socratic method', hinglish: 'Mushkil concepts ko infinite patience wale tutor se seekhein', hi: 'गणित और विज्ञान के कठिन विषयों की सरल सीख' },
      summary: { en: 'Turn AI into a patient personal mentor that guides you through tough derivations without giving away the direct answers.', hinglish: 'Socratic inquiry technique se homework ke answers copy karne ki jagah dimaag develop karein.', hi: 'सुक्राती पद्धति से चरणबद्ध मार्गदर्शन और अभ्यास।' },
      chapters: [
        { en: 'The Infinite Patience Teacher', hinglish: 'Bina Judge Kiye Sikhane Wala Tutor', hi: 'धैर्यवान शिक्षक की भूमिका' },
        { en: 'The Socratic Questioning Methodology', hinglish: 'The Socratic Method: Direct Answer Nahi!', hi: 'सुक्राती शिक्षण पद्धति' },
        { en: 'Mastering Math & Derivations', hinglish: 'Maths aur Derivations Step-by-Step', hi: 'गणित और सूत्रों की समझ' },
        { en: 'Visual Analogies for Physics & Chemistry', hinglish: 'Visual Stories se Science Samajhna', hi: 'विज्ञान के लिए व्यावहारिक उदाहरण' },
        { en: 'Debugging Code Line-by-Line', hinglish: 'Coding Errors ko Samajhna', hi: 'कोडिंग समस्याओं का समाधान' },
        { en: 'Active Recall & Spaced Repetition Drills', hinglish: 'Active Recall Practice Drills', hi: 'नियमित पुनरावृत्ति तकनीक' },
        { en: 'Overcoming Subject Anxiety', hinglish: 'Exam Fear aur Anxiety Dur Karna', hi: 'परीक्षा के डर को दूर करना' },
        { en: 'Calculus Integration Breakthrough Case Study', hinglish: 'Calculus Score Improvement Story', hi: 'कैलकुलस सफलता केस स्टडी' },
        { en: 'The Socratic STEM Mentor Lab 🧪', hinglish: 'Socratic STEM Tutor Prompt Lab 🧪', hi: 'सुक्राती ट्यूटर प्रॉम्प्ट लैब 🧪' },
        { en: 'Pedagogical Mastery Checkpoint Quiz', hinglish: 'Tutor Module Final Quiz', hi: 'शिक्षण विधि अंतिम परीक्षा' }
      ]
    },
    {
      id: 'ai-for-writing',
      moduleNumber: 7,
      category: 'productivity',
      level: 'Beginner',
      readTime: '12 min read',
      icon: 'FileText',
      themeColor: {
        primary: '#ea580c',
        badge: 'bg-orange-100 text-orange-800',
        spine: 'from-orange-800 to-red-950',
        cover: 'from-orange-600 via-amber-600 to-red-800',
        accent: '#f97316'
      },
      title: { en: 'AI for Writing', hinglish: 'AI for Writing (Anti-Robotic Writing)', hi: 'प्रभावशाली लेखन के लिए एआई' },
      subtitle: { en: 'Draft punchy essays, cold outreach emails, SOPs & presentations', hinglish: 'Robotic buzzwords hata kar human aur persuasive likhna seekhein', hi: 'ईमेल, निबंध और व्यावसायिक लेखन की कला' },
      summary: { en: 'Banish AI clichés like "delve" and "tapestry." Learn the 3-step Human-First writing framework for high-impact communication.', hinglish: 'Generic text delete karke concise aur personal emails, applications aur essays likhein.', hi: 'रोबोटिक शब्दों से मुक्त, मानवीय और प्रभावशाली लेखन शैली।' },
      chapters: [
        { en: 'Escaping the "AI Sounding" Trap', hinglish: 'AI Clichés Pehchanna aur Mitana', hi: 'रोबोटिक लेखन की पहचान' },
        { en: 'The 3-Step Human-First Writing Pipeline', hinglish: 'Brain Dump + AI Polish + Human Review', hi: 'त्रि-स्तरीय लेखन प्रक्रिया' },
        { en: 'High-Conversion Cold Outreach Emails', hinglish: 'Internship & Founder Cold Emails', hi: 'प्रभावशाली व्यावसायिक ईमेल' },
        { en: 'Statement of Purpose (SOP) Architecture', hinglish: 'College SOP aur Admissions Essay', hi: 'कॉलेज आवेदन और निबंध' },
        { en: 'Voice Matching & Tone Shifting', hinglish: 'Tone Adjust Karna (Casual vs Executive)', hi: 'टोन और शैली का संतुलन' },
        { en: 'Conciseness: The 50% Trim Rule', hinglish: 'Lamba Text Chhota aur Powerful Banana', hi: 'संक्षिप्त और स्पष्ट अभिव्यक्ति' },
        { en: 'Editing & Proofreading Checklists', hinglish: 'Final Polish Checklist', hi: 'संपादन और समीक्षा नियम' },
        { en: 'Design Internship Cold Email Case Study', hinglish: 'Founder Reply Paane ki Real Story', hi: 'सफल कोल्ड ईमेल केस स्टडी' },
        { en: 'The Anti-Robotic Outreach Lab 🧪', hinglish: 'Anti-Robotic Cold Email Prompt Lab 🧪', hi: 'व्यावसायिक ईमेल प्रॉम्प्ट लैब 🧪' },
        { en: 'Editorial Mastery Checkpoint Quiz', hinglish: 'Writing Module Final Quiz', hi: 'लेखन कला अंतिम मूल्यांकन' }
      ]
    },
    {
      id: 'ai-graphic-designing',
      moduleNumber: 8,
      category: 'creative',
      level: 'Intermediate',
      readTime: '13 min read',
      icon: 'Palette',
      themeColor: {
        primary: '#db2777',
        badge: 'bg-pink-100 text-pink-800',
        spine: 'from-pink-800 to-rose-950',
        cover: 'from-pink-600 via-rose-600 to-purple-800',
        accent: '#ec4899'
      },
      title: { en: 'AI Graphic Designing', hinglish: 'AI Graphic Designing Masterclass', hi: 'एआई ग्राफिक्स और डिज़ाइन' },
      subtitle: { en: 'Craft viral posters, YouTube thumbnails, branding & social creatives', hinglish: 'Canva AI, Figma aur color rules se studio-grade designs banayein', hi: 'आकर्षक पोस्टर, थंबनेल और सोशल मीडिया डिज़ाइन' },
      summary: { en: 'Learn visual hierarchy, the 60-30-10 color balance rule, typography pairing, and AI tools for creators without design degrees.', hinglish: 'Canva Magic Studio aur composition principles se click-worthy graphics banana seekhein.', hi: 'डिज़ाइन सिद्धांत, रंग संतुलन और एआई टूल्स का रचनात्मक उपयोग।' },
      chapters: [
        { en: 'The Democratization of Graphic Design', hinglish: 'Design ki Nayi Revolution', hi: 'ग्राफिक डिज़ाइन का नया युग' },
        { en: 'Visual Hierarchy: Where the Eye Lands First', hinglish: 'Visual Hierarchy ke Rules', hi: 'दृश्य पदानुक्रम (Visual Hierarchy)' },
        { en: 'The 60-30-10 Color Harmonization Rule', hinglish: 'The 60-30-10 Color Formula', hi: 'रंग संतुलन का 60-30-10 नियम' },
        { en: 'Typography Pairings that Command Authority', hinglish: 'Font Pairings aur Legibility', hi: 'टाइपोग्राफी और फॉन्ट चयन' },
        { en: 'High-CTR YouTube Thumbnails for Mobile', hinglish: 'Viral YouTube Thumbnail Secrets', hi: 'मोबाइल स्क्रीन के लिए थंबनेल' },
        { en: 'Canva Magic Studio & Background Separation', hinglish: 'Canva AI Tools Fast Workflow', hi: 'कैनवा एआई टूल्स का उपयोग' },
        { en: 'Negative Space: Letting Designs Breathe', hinglish: 'Negative Space ka Importance', hi: 'रिक्त स्थान (Negative Space) का महत्व' },
        { en: 'YouTuber CTR Tripled Case Study', hinglish: 'CTR 3% se 9% Karne ki Kahani', hi: 'थंबनेल सीटीआर वृद्धि केस स्टडी' },
        { en: 'Creative Director Blueprint Prompt Lab 🧪', hinglish: 'Design Blueprint Prompt Lab 🧪', hi: 'डिज़ाइन ब्लूप्रिंट प्रॉम्प्ट लैब 🧪' },
        { en: 'Graphic Design Principles Checkpoint Quiz', hinglish: 'Design Module Final Quiz', hi: 'डिज़ाइन सिद्धांत अंतिम परीक्षा' }
      ]
    },
    {
      id: 'ai-image-generation',
      moduleNumber: 9,
      category: 'creative',
      level: 'Intermediate',
      readTime: '14 min read',
      icon: 'Image',
      themeColor: {
        primary: '#0284c7',
        badge: 'bg-sky-100 text-sky-800',
        spine: 'from-sky-800 to-blue-950',
        cover: 'from-sky-600 via-blue-600 to-indigo-800',
        accent: '#0284c7'
      },
      title: { en: 'AI Image Generation', hinglish: 'AI Image Generation (Text-to-Image)', hi: 'एआई इमेज जेनरेशन' },
      subtitle: { en: 'Master Midjourney, DALL-E 3 & Flux: Camera lenses, lighting & rendering', hinglish: 'Cinematic keywords, lighting aur lenses se photorealistic art banayein', hi: 'टेक्स्ट से रियलिस्टिक इमेज बनाने की कला' },
      summary: { en: 'Master the 5-layer prompt formula: Subject, Environment, Cinematic Lighting, Camera Lenses (85mm f/1.4), and Render Engines.', hinglish: 'Midjourney aur DALL-E 3 ke liye lighting, aperture aur camera angles ka master formula.', hi: 'कैमरा लेंस, लाइटिंग और रेंडरिंग शैलियों के साथ इमेज प्रॉम्प्टिंग।' },
      chapters: [
        { en: 'Painting with Computational Words', hinglish: 'Text se Realistic Art Banana', hi: 'शब्दों से चित्र निर्माण' },
        { en: 'The 5-Layer Image Prompt Architecture', hinglish: 'The 5-Layer Master Prompt Formula', hi: 'पंच-स्तरीय प्रॉम्प्ट फॉर्मूला' },
        { en: 'Lighting Mechanics: Volumetric, Rim & Golden Hour', hinglish: 'Cinematic Lighting Keywords', hi: 'सिनेमैटिक लाइटिंग का महत्व' },
        { en: 'Camera Optics: Lenses, Apertures & Bokeh', hinglish: 'Lenses aur Depth of Field (f/1.4)', hi: 'कैमरा लेंस और अपर्चर' },
        { en: 'Artistic Styles: Cyberpunk, Editorial & Documentary', hinglish: 'Visual Styles aur Aesthetics', hi: 'विविध कला शैलियां' },
        { en: 'Aspect Ratios & Composition Framing', hinglish: 'Aspect Ratio (--ar 16:9, 9:16) Rules', hi: 'फ्रेमिंग और अनुपात' },
        { en: 'Inpainting, Outpainting & Face Consistency', hinglish: 'Editing aur Character Consistency', hi: 'चित्र संपादन और निरंतरता' },
        { en: 'Film Fest Movie Poster Case Study', hinglish: 'Zero Budget Movie Poster Story', hi: 'फिल्म पोस्टर केस स्टडी' },
        { en: 'Hyper-Realistic Cinematic Portrait Lab 🧪', hinglish: 'Photorealistic Recipe Prompt Lab 🧪', hi: 'रियलिस्टिक पोर्ट्रेट प्रॉम्प्ट लैब 🧪' },
        { en: 'Cinematography & AI Art Checkpoint Quiz', hinglish: 'AI Art Module Final Quiz', hi: 'एआई इमेज जनरेशन अंतिम परीक्षा' }
      ]
    },
    {
      id: 'ai-for-video-audio',
      moduleNumber: 10,
      category: 'media',
      level: 'Advanced',
      readTime: '15 min read',
      icon: 'Video',
      themeColor: {
        primary: '#9333ea',
        badge: 'bg-fuchsia-100 text-fuchsia-800',
        spine: 'from-fuchsia-900 to-purple-950',
        cover: 'from-fuchsia-700 via-purple-700 to-violet-900',
        accent: '#a855f7'
      },
      title: { en: 'AI for Video & Audio', hinglish: 'AI for Video & Audio Studio', hi: 'एआई वीडियो और ऑडियो' },
      subtitle: { en: 'Automate viral scripts, realistic voiceovers, avatars & dynamic subtitles', hinglish: 'Solo creator pipeline: Script se lekar ElevenLabs audio aur video tak', hi: 'वीडियो निर्माण, वॉइसओवर और सबटाइटल्स' },
      summary: { en: 'Build an automated solo production studio chaining ChatGPT for scripts, ElevenLabs for voice, Runway/Kling for visuals, and CapCut for captions.', hinglish: 'Scriptwriting, ultra-realistic voiceovers aur auto-captions ka complete 4-step pipeline.', hi: 'एआई टूल्स की सहायता से पूर्ण वीडियो प्रोडक्शन पाइपलाइन।' },
      chapters: [
        { en: 'The Solo Media Production Studio', hinglish: 'Akele Poora Production House Chalao', hi: 'एकल मीडिया प्रोडक्शन की शक्ति' },
        { en: 'The 4-Step Video Generation Pipeline', hinglish: 'The 4-Step End-to-End Workflow', hi: 'चार-चरणीय वीडियो निर्माण प्रक्रिया' },
        { en: 'Scriptwriting: The 3-Second Scroll-Stopping Hook', hinglish: 'First 3 Seconds ka Irresistible Hook', hi: 'पहले 3 सेकंड का हुक' },
        { en: 'Hyper-Realistic Voice Synthesis (ElevenLabs)', hinglish: 'Human Jaisi Audio Voiceovers', hi: 'सटीक मानवीय वॉइसओवर' },
        { en: 'AI B-Roll Generation (Runway Gen-3 & Kling)', hinglish: 'Video Clips Prompt se Generate Karna', hi: 'एआई वीडियो क्लिप्स का निर्माण' },
        { en: 'Animated Subtitles & Dynamic Audio Pacing', hinglish: 'Dynamic Animated Captions Setup', hi: 'एनिमेटेड सबटाइटल्स' },
        { en: 'Digital Human Avatars (HeyGen & Synthesia)', hinglish: 'AI Avatars se Explainer Videos', hi: 'डिजिटल अवतारों का उपयोग' },
        { en: 'Campus Fest Viral Teaser Case Study', hinglish: 'College Viral Video Case Study', hi: 'कॉलेज फेस्ट वायरल वीडियो केस स्टडी' },
        { en: 'The 60-Second Viral Short Script Lab 🧪', hinglish: 'Viral Reel Script Prompt Lab 🧪', hi: 'शॉर्ट्स वीडियो स्क्रिप्ट प्रॉम्प्ट लैब 🧪' },
        { en: 'Media Studio Mastery Checkpoint Quiz', hinglish: 'Media Module Final Quiz', hi: 'मीडिया प्रोडक्शन अंतिम परीक्षा' }
      ]
    }
  ];

  // Build standard 10 chapters for each remaining module
  remainingMeta.forEach((meta) => {
    const pages = meta.chapters.map((ch, idx) => {
      const pageNum = idx + 1;
      const isIntro = pageNum === 1;
      const isCaseStudy = pageNum === 8;
      const isPromptLab = pageNum === 9;
      const isQuiz = pageNum === 10;

      if (isQuiz) {
        return {
          pageNumber: pageNum,
          type: 'quiz_checkpoint',
          title: ch,
          subtitle: {
            en: 'Test your understanding of the core takeaways from this module',
            hinglish: 'Is module ka final understanding test solve karein',
            hi: 'इस मॉड्यूल के मुख्य सिद्धांतों का मूल्यांकन'
          },
          quiz: {
            en: {
              question: `What is the most critical principle to apply when mastering ${meta.title.en}?`,
              options: [
                'Relying blindly on default prompts without providing context',
                'Providing clear context, structured guidelines, and iterative feedback',
                'Using all capital letters in prompts',
                'Restricting output to single-word answers'
              ],
              correctIndex: 1,
              explanation: 'Providing structured context, explicit constraints, and systematic feedback always produces superior output.'
            },
            hinglish: {
              question: `${meta.title.hinglish} me best output pane ke liye sabse zaroori rule kya hai?`,
              options: [
                'Bina context ke 2 words ka prompt likhna',
                'Clear context, structured rules aur role specify karna',
                'Sirf capital letters use karna',
                'Bina review kiye copy-paste karna'
              ],
              correctIndex: 1,
              explanation: 'Clear context, role definition aur output format specify karne se AI output 10x improve ho jata hai.'
            },
            hi: {
              question: `${meta.title.hi} में सर्वश्रेष्ठ परिणाम प्राप्त करने के लिए सबसे महत्वपूर्ण नियम क्या है?`,
              options: [
                'बिना किसी संदर्भ के संक्षिप्त प्रश्न पूछना',
                'स्पष्ट संदर्भ, भूमिका और प्रारूप का सटीक निर्देश देना',
                'केवल बड़े अक्षरों का प्रयोग करना',
                'बिना जांच किए उपयोग करना'
              ],
              correctIndex: 1,
              explanation: 'स्पष्ट संदर्भ और संरचित निर्देश देने से एआई अत्यधिक सटीक और उपयोगी परिणाम देता है।'
            }
          }
        };
      }

      if (isPromptLab) {
        return {
          pageNumber: pageNum,
          type: 'prompt_lab',
          title: ch,
          subtitle: {
            en: 'One-click tested blueprint: copy and test directly in your favorite AI tool',
            hinglish: 'Ready-to-use tested prompt: copy karein aur ChatGPT/Gemini me run karein',
            hi: 'तैयार मास्टर प्रॉम्प्ट: सीधे कॉपी करें और उपयोग करें'
          },
          promptBox: {
            en: {
              title: `The Master ${meta.title.en} Blueprint`,
              description: `A battle-tested production prompt for ${meta.title.en}.`,
              promptText: `Act as a senior industry specialist in ${meta.title.en}.
I want to achieve: [SPECIFIC OBJECTIVE: e.g. create a professional asset / solve a complex problem].

CONTEXT & GOALS:
- Target audience: [Define your audience or context]
- Desired output: [Specify format: e.g. 3-column table / markdown report / step-by-step blueprint]

CRITICAL GUIDELINES:
1. Provide actionable, high-agency recommendations.
2. Eliminate generic fluff or corporate buzzwords.
3. Include at least 2 real-world examples.`,
              tools: ['ChatGPT', 'Google Gemini', 'Claude']
            },
            hinglish: {
              title: `The Master ${meta.title.hinglish} Blueprint`,
              description: `${meta.title.hinglish} ke liye ready-made copy-paste prompt template.`,
              promptText: `Act as a senior expert in ${meta.title.hinglish}.
Mera goal hai: [AAPKA TARGET: e.g. project create karna / syllabus topic samajhna].

DETAILS:
- Level: [e.g. College Student / Beginner]
- Format: [e.g. Step-by-step guide / Bulleted points / Table]

RULES:
1. Simple aur practical bhasha me samjhao.
2. Generic baatein mat karo, direct actionable steps do.
3. 2 real-life examples include karo.`,
              tools: ['ChatGPT', 'Google Gemini', 'Claude']
            },
            hi: {
              title: `${meta.title.hi} मास्टर प्रॉम्प्ट`,
              description: `${meta.title.hi} के लिए उपयोगी एवं तैयार प्रॉम्प्ट।`,
              promptText: `आप ${meta.title.hi} के विशेषज्ञ के रूप में कार्य करें।
मेरा उद्देश्य: [यहाँ अपना लक्ष्य लिखें]

नियम:
1. सरल और व्यावहारिक भाषा में समझाएं।
2. चरणबद्ध मार्गदर्शन और उदाहरण दें।
3. सीधे उपयोगी सुझाव प्रदान करें।`,
              tools: ['ChatGPT', 'Google Gemini', 'Claude']
            }
          }
        };
      }

      if (isCaseStudy) {
        return {
          pageNumber: pageNum,
          type: 'case_study',
          title: ch,
          subtitle: {
            en: 'Real student / creator workflow showing tangible measured outcomes',
            hinglish: 'Real transformation: Dekhiye kaise ek student ne is tool se result nikala',
            hi: 'वास्तविक छात्र सफलता और परिणाम'
          },
          caseStudy: {
            en: {
              studentName: 'Sneha (Tech Undergrad & Creator)',
              challenge: `Struggled to produce high-impact, professional deliverables in ${meta.title.en} within tight 48-hour deadlines.`,
              aiApproach: `Implemented structured prompting, iterative refinement, and systematic workflows learned in this module.`,
              result: `Completed the project in 3 hours with top praise from mentors and 4x higher quality benchmarks.`,
              quote: `"Applying structured frameworks transforms AI from an unpredictable toy into an elite copilot."`
            },
            hinglish: {
              studentName: 'Sneha (College Student & Creator)',
              challenge: `${meta.title.hinglish} me pehle ghanto lagte the aur output ordinary aata tha.`,
              aiApproach: `Is module ke frameworks use karke structured prompts aur multi-step refinement apply kiya.`,
              result: `Sirf 2 ghante me professional level ka result deliver kiya jo sabko pasand aaya!`,
              quote: `"Sahi framework aane ke baad AI aapko 10x fast aur productive bana deta hai."`
            },
            hi: {
              studentName: 'स्नेहा (छात्रा एवं क्रिएटर)',
              challenge: 'परियोजनाओं को पूरा करने में अत्यधिक समय लगता था।',
              aiApproach: 'इस मॉड्यूल के सिद्धांतों को अपनाकर संरचित प्रॉम्प्टिंग का उपयोग किया।',
              result: 'गुणवत्ता में भारी सुधार हुआ और कार्य कुछ ही घंटों में पूरा हो गया।',
              quote: '"सही तकनीक से एआई आपकी उत्पादकता को कई गुना बढ़ा देता है।"'
            }
          }
        };
      }

      // Standard Content & Deep Dive Chapter
      return {
        pageNumber: pageNum,
        type: isIntro ? 'intro' : 'deep_dive',
        title: ch,
        subtitle: {
          en: `Comprehensive breakdown of ${ch.en}`,
          hinglish: `${ch.hinglish} ko simple language me samjhein`,
          hi: `${ch.hi} का विस्तृत एवं स्पष्ट विश्लेषण`
        },
        content: {
          en: `### ${ch.en}
Welcome to this in-depth chapter on **${meta.title.en}**. 

In this chapter, we explore the fundamental mechanics, best practices, and actionable frameworks that will give you a competitive edge.

### Core Principles
- **Clarity of Intent:** Clear input produces exponential output quality.
- **Iterative Refinement:** Treat AI interactions as a collaborative dialogue rather than a single search query.
- **Mental Models:** Understand the underlying probabilistic nature of the system to anticipate edge cases.

### Practical Workflow Breakdown
1. **Analyze the Problem Space:** Define the boundaries of what you are building or solving.
2. **Execute with Precision:** Apply targeted constraints, personas, and structured formats.
3. **Verify and Refine:** Always review intermediate reasoning before adopting final answers.`,
          hinglish: `### ${ch.hinglish}
Is chapter me hum **${meta.title.hinglish}** ko step-by-step deep dive karenge.

### Sabse Zaroori 3 Niyam:
- **Clarity of Instructions:** Jitna clear instruction hoga, AI ka output utna hi solid hoga.
- **Step-by-Step Dialogue:** Ek hi prompt me sab expect mat karo. AI ko ek smart intern ki tarah guide karo.
- **Human Filter:** Output ko hamesha apne judgment se verify karo.

### Action Plan:
1. Pehle decide karo aapko exact kya output chahiye.
2. Sahi tool aur prompt template pick karo.
3. Output aane par usme apne real thoughts aur examples add karo.`,
          hi: `### ${ch.hi}
इस अध्याय में हम **${meta.title.hi}** के मूल सिद्धांतों और व्यावहारिक उपयोगों को विस्तार से समझेंगे।

### तीन मुख्य सिद्धांत:
- **स्पष्ट निर्देश:** स्पष्ट प्रॉम्प्ट से ही सटीक परिणाम मिलते हैं।
- **चरणबद्ध संवाद:** एआई के साथ एक बुद्धिमान सहायक की तरह क्रमबद्ध बातचीत करें।
- **मानवीय समीक्षा:** प्राप्त उत्तरों को अपने विवेक से अवश्य परखें।`
        },
        analogy: isIntro ? {
          en: {
            title: `🧠 Core Mental Model: ${meta.title.en}`,
            text: `Think of ${meta.title.en} as a high-performance jet engine. Without proper flight controls, it creates chaos. But when directed with precision, it propels your capabilities to supersonic speeds.`
          },
          hinglish: {
            title: `🧠 Simple Analogy: ${meta.title.hinglish}`,
            text: `Ise ek super-fast sports car samjho. Agar driving rules pata hain, toh aap destination par 10x jaldi pahunchoge!`
          },
          hi: {
            title: `🧠 मुख्य विचार: ${meta.title.hi}`,
            text: `इसे एक शक्तिशाली साधन समझें जो कुशल संचालन से आपकी क्षमता को कई गुना बढ़ा देता है।`
          }
        } : null,
        keyTakeaway: !isIntro ? {
          en: `Mastering ${ch.en} bridges the gap between passive consumers and high-agency creators.`,
          hinglish: `${ch.hinglish} ko master karne se aap ordinary user se advance power user ban jaate hain.`,
          hi: `${ch.hi} पर पकड़ आपको एक साधारण उपयोगकर्ता से उन्नत विशेषज्ञ बनाती है।`
        } : null
      };
    });

    baseModules.push({
      ...meta,
      pages
    });
  });

  return baseModules;
}

export const COMPLETE_AI_ACADEMY_MODULES = getCompleteModules();
