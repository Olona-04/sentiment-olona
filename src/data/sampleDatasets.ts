export interface SampleDataset {
  id: string;
  name: string;
  category: string;
  description: string;
  comments: string[];
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'tech_reviews',
    name: 'Tech Gadget Reviews',
    category: 'E-Commerce',
    description: '12 authentic customer reviews for wireless noise-cancelling headphones.',
    comments: [
      'The soundstage on these headphones is absolute perfection! Highs are crisp, bass is deep without distortion. 10/10.',
      'Battery lasts a solid 32 hours and fast charging is a lifesaver. Extremely satisfied with this purchase.',
      'Build quality feels slightly cheap for a $350 device. The plastic hinges creak when adjusting the headband.',
      'Active noise cancellation is truly mind-blowing. Completely silenced my entire 11-hour flight to Tokyo.',
      'Microphone quality is utterly pathetic. Everyone on Zoom complains I sound like I am speaking underwater.',
      'Setup took literally 10 seconds via Bluetooth 5.3. Seamless pairing across both my laptop and phone.',
      'The companion app is clunky, buggy, and crashes whenever you try saving custom EQ profiles. Very frustrating.',
      'Comfort is top notch. Wore them for an 8-hour workday with zero ear fatigue or clamp pressure.',
      'Disappointed with firmware updates. The latest update introduced a subtle hissing noise in the left ear cup.',
      'Customer support replaced my defective unit in under 48 hours without asking any silly questions. Stellar service!',
      'Great aesthetics and modern packaging, but the sound profile is way too boomy and muddy for classical music.',
      'Worth every single penny. Best noise cancelling headphones on the market hands down.'
    ]
  },
  {
    id: 'sarcasm_bench',
    name: 'Sarcasm & Model Divergence Benchmark',
    category: 'NLP Research',
    description: '8 tricky comments demonstrating where VADER (lexicon) and Hugging Face (Transformer) diverge.',
    comments: [
      'Oh wonderful, another mandatory update that broke audio playback. Just what I wanted on a Monday morning!',
      'Love how this app freezes right when you are about to save your work. Truly a stroke of genius.',
      'Great, another 30-minute hold time with the automated bot. My favorite pastime.',
      'Despite the minor delay in shipping, the craftsmanship of this leather bag exceeded all my expectations.',
      'While the user interface is not the prettiest, the underlying analytics engine is remarkably powerful.',
      'Yeah right, as if paying $50 a month for basic cloud sync is a reasonable business model.',
      'The movie was not terrible, but calling it a masterpiece is an insane stretch.',
      'Killed it on stage tonight! The new guitar solos were totally sick!'
    ]
  },
  {
    id: 'app_launch',
    name: 'Mobile App Store Feedback',
    category: 'Social / Mobile',
    description: '14 user reviews from a newly launched photo editing app.',
    comments: [
      'The AI portrait relighting feature is pure magic 🔥🔥 Blown away by the fidelity!',
      'Too many intrusive popups asking for annual subscription before you even get to try one filter.',
      'Smooth performance, zero lag even when processing 48MP raw files. Super clean dark theme UI!',
      'Exporting 4K video crashes instantly on iPad Pro. Please fix this critical bug ASAP!',
      'Hands down the most intuitive photo editor in the App Store. Replaced Lightroom for my quick edits.',
      'Waste of time. Half the advertised features are locked behind an expensive paywall.',
      'Customer team responded to my bug report within 2 hours. Love the dedication!',
      'Cloud sync is sluggish and drains battery like crazy. Dropped from 90% to 40% in an hour.',
      'The minimalist design aesthetic is so refreshing. No clutter, just pure editing tools.',
      'I was skeptical at first, but after 3 weeks of daily use, this app is an indispensable part of my workflow.',
      'Filters look cheap and overly saturated. Ruins the natural color grading.',
      'Super easy batch exporting. Saved me hours of tedious work this weekend.',
      'Uninstalled after 5 minutes. Constant prompts begging for a 5-star review are unbearable.',
      'Five stars! The preset library is extensive and actually looks cinematic.'
    ]
  },
  {
    id: 'support_tickets',
    name: 'Customer Support Feedback',
    category: 'Operations',
    description: '10 post-resolution satisfaction surveys across enterprise IT accounts.',
    comments: [
      'Sarah was empathetic, patient, and solved our SSL certificate outage within 15 minutes. Exceptional help!',
      'Took 4 business days to get a reply to a priority 1 ticket. Unacceptable service level for an enterprise tier.',
      'The step-by-step documentation was clear and got our database cluster back online smoothly.',
      'Agent just copy-pasted generic scripts instead of actually listening to our technical issue.',
      'Smooth onboarding session. All questions were addressed with deep knowledge.',
      'Billing was resolved promptly with a full credit applied to next month. Thank you for making it right.',
      'Our team was left in the dark during the entire 3-hour downtime with zero status updates on the dashboard.',
      'Prompt, professional, and courteous engineers. Highly recommend their managed tier.',
      'Frustrating experience having to explain the same problem to three different support tiers.',
      'Immediate resolution via live chat. Very pleased with the turnaround time.'
    ]
  }
];

export const SINGLE_TEXT_PRESETS = [
  {
    label: 'Enthusiastic Praise',
    text: 'I am completely blown away by the quality of this tool! The interface is gorgeous, performance is lightning fast, and it saved our team dozens of hours. Highly recommended to anyone looking for top tier productivity!'
  },
  {
    label: 'Critical / Disappointed',
    text: 'Utterly terrible experience. The device arrived damaged, setup was an absolute nightmare, and customer support was completely rude and unhelpful. Total waste of money, returning immediately.'
  },
  {
    label: 'Sarcastic Review (Model Divergence)',
    text: 'Oh great, another mandatory software update that broke my audio drivers. Just what I needed right before my presentation. Truly brilliant engineering!'
  },
  {
    label: 'Nuanced Concessive Review',
    text: 'While the battery life is admittedly mediocre and requires charging every evening, the screen clarity, haptic feedback, and lightweight design make this a thoroughly enjoyable phone to use daily.'
  },
  {
    label: 'Informational / Neutral',
    text: 'The package arrived on Tuesday via standard ground delivery. The box contained the power adapter, USB-C cable, and a 12-page instruction manual in three languages.'
  }
];
