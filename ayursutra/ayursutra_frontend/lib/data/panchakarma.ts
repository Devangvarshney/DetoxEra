export interface PanchakarmaTherapy {
  id: string;
  name: string;
  sanskrit: string;
  meaning: string;
  dosha: "Kapha" | "Pitta" | "Vata" | "Head & Neck (Kapha/Vata)" | "Rakta & Pitta";
  doshaColor: string;
  badgeBg: string;
  image: string;
  summary: string;
  clinicalExplanation: string;
  keyBenefits: string[];
  indications: string[];
  types?: { name: string; desc: string }[];
  duration: string;
  purvakarma: string;
  pradhanakarma: string;
  paschatkarma: string;
  associatedTreatments: string[];
  videoUrl?: string;
  videoEmbedUrl?: string;
}

export const PANCHAKARMA_THERAPIES: PanchakarmaTherapy[] = [
  {
    id: "vamana",
    name: "Vamana Therapy",
    sanskrit: "वमन कर्म",
    meaning: "Therapeutic Emesis / Gastric Cleansing",
    dosha: "Kapha",
    doshaColor: "text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    image: "/panchakarma/vamana.jpg",
    summary:
      "Vamana is a controlled therapeutic process that eliminates excess Kapha from the body, primarily working through induced emesis under strict medical supervision.",
    clinicalExplanation:
      "This therapy is often recommended for individuals experiencing respiratory congestion, chronic allergies, asthma, or metabolic heaviness. It helps clear mucus accumulation and dramatically improves breathing capacity. Vamana is not a harsh procedure when done correctly — it is carefully prepared with oleation (Snehana) and monitored to ensure that only deep-seated morbid toxins (Ama) are expelled while preserving core vital strength (Ojas).",
    keyBenefits: [
      "Eliminates deep-rooted Kapha toxins from the chest and stomach",
      "Clears mucus accumulation and restores lung & breathing capacity",
      "Relieves chronic sinus, bronchitis, and allergic rhinitis",
      "Boosts metabolism, regulates weight, and clears lethargy",
      "Enhances sensory organ clarity and mental freshness",
    ],
    indications: [
      "Respiratory Congestion & Asthma",
      "Chronic Allergies & Sinusitis",
      "Metabolic Heaviness & Obesity",
      "Chronic Hyperacidity (Kapha-type)",
      "Vitiligo & Psoriasis (Kapha involvement)",
    ],
    duration: "7 - 14 Days (including preparatory oleation)",
    purvakarma: "Internal Snehana (drinking medicated ghee daily in increasing doses) followed by whole-body Abhyanga and herbal steam (Swedana).",
    pradhanakarma: "Administration of Madanaphala decoction, licorice tea, and warm water under doctor supervision to induce therapeutic vomiting.",
    paschatkarma: "Strict gradual diet regimen (Samsarjana Krama) starting from Peya (thin rice gruel) to solid nutritious Ayurvedic meals.",
    associatedTreatments: ["Ayurvedic Respiratory Care", "Immune Rehabilitation", "Metabolic Reset"],
    videoUrl: "/videos/vamana.mp4",
    videoEmbedUrl: "/videos/vamana.mp4",
  },
  {
    id: "virechana",
    name: "Virechana Therapy",
    sanskrit: "विरेचन कर्म",
    meaning: "Therapeutic Purgation / Liver Cleansing",
    dosha: "Pitta",
    doshaColor: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    image: "/panchakarma/virechana.jpg",
    summary:
      "Virechana focuses on cleansing the digestive tract and liver, especially beneficial for Pitta-related conditions and inflammatory heat.",
    clinicalExplanation:
      "This therapy uses specialized herbal formulations to induce controlled purgation, safely purging accumulated toxins associated with excessive heat, bile, and inflammation from the liver, gallbladder, and small intestine. It is widely recommended for stubborn skin disorders, hyperacidity, liver imbalances, and chronic digestive disturbances. After Virechana, individuals experience remarkably lighter digestion, radiant clear skin, balanced hormonal cycles, and renewed cellular energy.",
    keyBenefits: [
      "Purges toxic Pitta and morbid bile from the liver and small intestine",
      "Cools systemic inflammation and relieves burning sensations",
      "Restores normal enzymatic digestion (Agni) and healthy appetite",
      "Clears persistent skin eruptions, dermatitis, and acne",
      "Promotes deep liver detoxification and metabolic revitalization",
    ],
    indications: [
      "Chronic Skin Disorders & Eczema",
      "Acid Peptic Disease & GERD",
      "Fatty Liver & Hepatic Congestion",
      "Chronic Headaches & Migraines (Pitta)",
      "Hormonal Imbalances & PCOS",
    ],
    duration: "7 - 10 Days",
    purvakarma: "5–7 days of medicated ghee ingestion (Tikta Ghrita), followed by Abhyanga and herbal steam to mobilize toxins to the digestive tract.",
    pradhanakarma: "Administration of customized purgative herbs (such as Eranda taila, Triphala, or Avipattikar churna) in the morning.",
    paschatkarma: "Supervised hydration, digestive tea, and Samsarjana Krama to rekindle digestion and rebuild tissue vitality.",
    associatedTreatments: ["Ayurvedic Liver Detox", "Skin Rejuvenation Protocol", "Pitta Pacification"],
    videoUrl: "/videos/virechana.mp4",
    videoEmbedUrl: "/videos/virechana.mp4",
  },
  {
    id: "basti",
    name: "Basti Therapy",
    sanskrit: "बस्ति कर्म",
    meaning: "Medicated Colon Enema & Rejuvenation",
    dosha: "Vata",
    doshaColor: "text-purple-700 dark:text-purple-300",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-300",
    image: "/panchakarma/basti.jpg",
    summary:
      "Widely regarded as the 'Ardha Chikitsa' (half of all medicine) and the most powerful among all Panchakarma therapies, Basti directly targets Vata dosha and the central nervous system.",
    clinicalExplanation:
      "Basti involves the gentle administration of medicated herbal oils or decoctions through the rectum into the colon. The colon is the primary seat of Vata dosha, which governs all somatic and autonomic nerve impulses. Basti simultaneously nourishes depleted tissues while expelling metabolic wastes. It is the gold-standard therapy for severe joint pain, degenerative arthritis, neurological conditions, sciatica, chronic dryness, and chronic fatigue. Basti is universally recognized in supportive care for fibromyalgia due to its profound capacity to soothe chronic nerve pain and balance Vata.",
    types: [
      {
        name: "Anuvasana / Sneha Basti (Oil-based)",
        desc: "Medicated warm oils or herbal ghee that deeply lubricate, nourish depleted tissues, calm nerve hyperactivity, and rebuild bone strength.",
      },
      {
        name: "Niruha / Kashaya Basti (Decoction-based)",
        desc: "Specialized emulsion of herbal honey, rock salt, medicated pastes, and decoctions that eliminates deep colon toxins, reduces joint swelling, and restores bowel regularity.",
      },
    ],
    keyBenefits: [
      "Restores normal Vata function across the entire nervous and musculoskeletal system",
      "Reverses chronic joint degeneration, stiffness, and arthritis pain",
      "Soothes neuropathic pain, sciatica, and neuromuscular spasms",
      "Rehydrates internal dryness, chronic constipation, and colon inflammation",
      "Extensively documented in Ayurvedic care for fibromyalgia, ME/CFS, and motor deficits",
    ],
    indications: [
      "Arthritis, Spondylosis & Sciatica",
      "Neurological Disorders & Parkinson's support",
      "Fibromyalgia & Chronic Pain Syndromes",
      "Chronic Constipation & IBS",
      "Osteoporosis & Bone Density Loss",
    ],
    duration: "8 (Yoga Basti), 15 (Kala Basti), or 30 Days (Karma Basti)",
    purvakarma: "Localized lower back & abdominal Abhyanga followed by Nadi Sweda (tubular herbal steam).",
    pradhanakarma: "Sterile, painless administration of medicated decoction or warm herbal taila via classical Basti Netra or disposable catheter.",
    paschatkarma: "Rest in a warm room, light warm soup (Yusha) or Moong dal khichdi, avoid cold exposure and vigorous physical strain.",
    associatedTreatments: [
      "Ayurvedic Treatment for Fibromyalgia",
      "Spine & Joint Care Protocol",
      "Neurological Rejuvenation",
    ],
    videoUrl: "/videos/basti.mp4",
    videoEmbedUrl: "/videos/basti.mp4",
  },
  {
    id: "nasya",
    name: "Nasya Therapy",
    sanskrit: "नस्य कर्म",
    meaning: "Nasal Administration of Medicated Oils",
    dosha: "Head & Neck (Kapha/Vata)",
    doshaColor: "text-teal-700 dark:text-teal-300",
    badgeBg: "bg-teal-100 text-teal-800 border-teal-300",
    image: "/panchakarma/nasya.jpg",
    summary:
      "Nasya involves the gentle administration of herbal oils or powders through the nasal passages to cleanse and rejuvenate the head, neck, and brain.",
    clinicalExplanation:
      "As classical texts state: 'Nasa Hi Shiraso Dvaram' — the nose is the direct portal to the brain and consciousness. Nasya therapy clears blocked sinus cavities, nourishes cranial nerves, relieves persistent headaches, eliminates mental fog, and alleviates sleep disturbances. It is remarkably soothing for individuals enduring high stress, burnout, tension headaches, and sensory fatigue. Nasya is a cornerstone therapy for emotional wellness, anxiety relief, and circadian sleep balance.",
    keyBenefits: [
      "Decongests nasal cavities and cures chronic sinusitis & rhinitis",
      "Alleviates tension headaches, migraines, and cervical neck tension",
      "Dispels brain fog, elevates mental alertness, memory, and concentration",
      "Regulates neuro-endocrine pathways, easing stress, anxiety, and insomnia",
      "Strengthens hair roots, prevents premature greying, and rejuvenates facial skin",
    ],
    indications: [
      "Chronic Sinusitis, Allergies & Polyps",
      "Migraines & Tension-type Headaches",
      "Insomnia, Stress & Anxiety Syndromes",
      "Cervical Spondylosis & Frozen Shoulder",
      "Memory Fatigue & Brain Fog",
    ],
    duration: "7 - 14 Days",
    purvakarma: "Gentle facial massage with warm herbal oil (Mukhabhyanga) followed by facial steam towel (Swedana) to liquefy cranial toxins.",
    pradhanakarma: "Instillation of calibrated warm herbal drops (e.g. Anu Taila, Shadbindu Taila, or Ksheerabala) into each nostril with slow rhythmic breathing.",
    paschatkarma: "Warm saline gargle, medicated herbal smoke inhalation (Dhumapana) to clear throat secretions, and rest away from drafts.",
    associatedTreatments: [
      "Ayurvedic Treatment for Anxiety",
      "Ayurvedic Treatment for Stress",
      "Shirodhara Synergy Protocol",
    ],
    videoUrl: "/videos/nasya.mp4",
    videoEmbedUrl: "/videos/nasya.mp4",
  },
  {
    id: "raktamokshana",
    name: "Raktamokshana Therapy",
    sanskrit: "रक्तमोक्षण कर्म",
    meaning: "Therapeutic Blood Purification",
    dosha: "Rakta & Pitta",
    doshaColor: "text-rose-700 dark:text-rose-300",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
    image: "/panchakarma/raktamokshana.jpg",
    summary:
      "Raktamokshana is a specialised classical detox therapy aimed at purifying vitiated blood and clearing deep microcirculatory stagnation.",
    clinicalExplanation:
      "Classical Ayurveda considers Rakta (blood) as the fourth vital dosha when impure. Raktamokshana removes localized stagnant, toxified blood that causes persistent burning, chronic skin lesions, and vascular congestion that do not respond to other conservative treatments. Carried out by qualified Ayurvedic surgeons using traditional methods such as Jalaukavacharana (medicinal leech therapy) or Siravedha (therapeutic venesection), this therapy provides rapid clinical relief for severe eczema, varicose ulcers, gout, and chronic vascular inflammation.",
    types: [
      {
        name: "Jalaukavacharana (Medicinal Leech Therapy)",
        desc: "Application of sterile medicinal leeches (Hirudo medicinalis) that naturally secrete hirudin, natural vasodilators, and anti-inflammatory enzymes into localized inflamed lesions.",
      },
      {
        name: "Siravedha (Venesection Cleansing)",
        desc: "Puncturing of a specific localized superficial vein under aseptic conditions to drain morbid Pitta-vitiated blood quickly and safely.",
      },
    ],
    keyBenefits: [
      "Expels toxic Pitta and metabolic debris directly from circulation",
      "Dramatically reduces chronic skin inflammation, burning, and itching",
      "Alleviates venous congestion, vascular pain, and varicose vein discomfort",
      "Promotes tissue regeneration and acceleration of chronic non-healing ulcers",
      "Balances systemic immune response in chronic dermatological conditions",
    ],
    indications: [
      "Psoriasis, Chronic Eczema & Dermatitis",
      "Varicose Veins & Venous Stasis Ulcers",
      "Gout (Vatarakta) & Inflammatory Arthritis",
      "Alopecia Areata & Severe Acne Vulgaris",
      "Chronic Non-Healing Wounds",
    ],
    duration: "Single or intermittent sessions (as guided by practitioner)",
    purvakarma: "Gentle local fomentation, cleansing with turmeric and sterile decoction of Triphala water.",
    pradhanakarma: "Aseptic application of purified Jalauka (leeches) or precision Siravedha on designated classical Marmas/veins.",
    paschatkarma: "Dressing with antiseptic turmeric (Haridra) paste and Shatadhouta Ghrita, rest, and cooling Pitta-pacifying herbal teas.",
    associatedTreatments: [
      "Ayurvedic Treatment for Varicose Veins",
      "Chronic Dermatology Care",
      "Vascular Health Protocol",
    ],
    videoUrl: "/videos/raktamokshana.mp4",
    videoEmbedUrl: "/videos/raktamokshana.mp4",
  },
];
