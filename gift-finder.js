/**
 * Bloom & Box - Intelligent Gift Finder Recommendation Engine
 * Transparent, deterministic matching algorithm connecting recipient, occasion, budget & style.
 */

const QUIZ_QUESTIONS = [
  {
    id: "recipient",
    title: "Who is this thoughtful gift for?",
    subtitle: "Every bond speaks a distinct floral and sentiment dialect.",
    options: [
      { id: "partner", label: "Partner / Spouse", icon: "favorite", hint: "Romantic roses & keepsake treasures" },
      { id: "mother", label: "Mother / Family", icon: "cottage", hint: "Gentle pastels & serene spa hampers" },
      { id: "friend", label: "Close Friend", icon: "celebration", hint: "Radiant sunflowers & sweet indulgences" },
      { id: "colleague", label: "Colleague / Client", icon: "business_center", hint: "Architectural orchids & executive crates" },
      { id: "myself", label: "Myself (Self-Love)", icon: "spa", hint: "Botanical mists & bedroom blooms" }
    ]
  },
  {
    id: "occasion",
    title: "What milestone are you celebrating?",
    subtitle: "We align floral symbolism with life's poignant chapters.",
    options: [
      { id: "romance", label: "Anniversary & Romance", icon: "loyalty", hint: "Preserved blooms & red roses" },
      { id: "birthday", label: "Birthday Joy", icon: "cake", hint: "Vibrant palettes & chocolate crates" },
      { id: "wedding", label: "Nuptials & Wedding", icon: "diamond", hint: "Pure white orchids & luxury hampers" },
      { id: "congratulations", label: "Congratulations & New Born", icon: "auto_awesome", hint: "Golden blossoms & celebration sets" },
      { id: "thankyou", label: "Gratitude & Thank You", icon: "handshake", hint: "Earthy botanical trays & tea" },
      { id: "justbecause", label: "Just Because / Thinking of You", icon: "local_florist", hint: "Surprise doorstep warmth" }
    ]
  },
  {
    id: "budget",
    title: "What is your comfortable investment?",
    subtitle: "Handcrafted quality at every tier — delivery included above ₨5,000.",
    options: [
      { id: "tier1", label: "Under ₨4,000", min: 0, max: 4000, icon: "payments", hint: "Fresh hand-tied seasonal posies" },
      { id: "tier2", label: "₨4,000 — ₨7,000", min: 4000, max: 7000, icon: "payments", hint: "Signature 24-stem roses & spa boxes" },
      { id: "tier3", label: "₨7,000 — ₨12,000", min: 7000, max: 12000, icon: "payments", hint: "Curated gourmet hampers & vow trunks" },
      { id: "tier4", label: "Luxury ₨12,000+", min: 12000, max: 100000, icon: "hotel_class", hint: "24K gold dipped heirloom roses" }
    ]
  },
  {
    id: "style",
    title: "What aesthetic format suits their style best?",
    subtitle: "Choose between fresh fragrance, gourmet delights, or permanent keepsakes.",
    options: [
      { id: "bouquets", label: "Fresh Hand-Tied Bouquets", icon: "filter_vintage", hint: "Aromatic morning blooms wrapped in silk" },
      { id: "hampers", label: "Curated Gourmet Hampers", icon: "shopping_basket", hint: "Chocolates, sparkling reserve & wellness" },
      { id: "keepsakes", label: "Everlasting Heirloom Keepsakes", icon: "lock_clock", hint: "Objects designed to last years or decades" },
      { id: "any", label: "Surprise Me (Best Match)", icon: "magic_button", hint: "Let our lead florist recommend the highest-rated" }
    ]
  }
];

let quizState = {
  currentStep: 0,
  answers: {
    recipient: null,
    occasion: null,
    budget: null,
    style: null
  }
};

function initGiftFinder() {
  const container = document.getElementById('gift-finder-wizard');
  if (!container) return;
  renderQuizStep();
}

function renderQuizStep() {
  const container = document.getElementById('gift-finder-wizard');
  if (!container) return;

  const currentQ = QUIZ_QUESTIONS[quizState.currentStep];
  const totalSteps = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((quizState.currentStep + 1) / totalSteps) * 100);

  container.innerHTML = `
    <div class="max-w-2xl mx-auto bg-white rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl border border-[#E8C9C9]/50">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#B97980] mb-2">
          <span>Step ${quizState.currentStep + 1} of ${totalSteps}</span>
          <span>${progressPercent}% Complete</span>
        </div>
        <div class="w-full h-2 bg-[#F7EDEB] rounded-full overflow-hidden">
          <div class="h-full bg-[#B97980] transition-all duration-500 rounded-full" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <!-- Question Heading -->
      <div class="text-center mb-8 space-y-2">
        <h3 class="font-serif font-bold text-2xl sm:text-3xl text-[#443535] leading-tight">${currentQ.title}</h3>
        <p class="text-xs sm:text-sm text-[#443535]/70 max-w-md mx-auto leading-relaxed">${currentQ.subtitle}</p>
      </div>

      <!-- Options Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        ${currentQ.options.map(opt => {
          const isSelected = quizState.answers[currentQ.id] === opt.id;
          return `
            <button onclick="selectQuizOption('${currentQ.id}', '${opt.id}')"
                    class="p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer
                    ${isSelected ? 'bg-[#F7EDEB] border-[#B97980] ring-2 ring-[#B97980]/30 shadow-md' : 'bg-white border-[#E8C9C9]/60 hover:border-[#B97980] hover:bg-[#F7EDEB]/40'}">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                          ${isSelected ? 'bg-[#B97980] text-white' : 'bg-[#F7EDEB] text-[#B97980] group-hover:bg-[#B97980] group-hover:text-white'}">
                <span class="material-symbols-outlined text-[20px]">${opt.icon}</span>
              </div>
              <div class="flex-1">
                <span class="block font-serif font-semibold text-sm text-[#443535]">${opt.label}</span>
                <span class="block text-[11px] text-[#443535]/65 mt-0.5">${opt.hint}</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Navigation Controls -->
      <div class="flex items-center justify-between pt-4 border-t border-[#F7EDEB]">
        ${quizState.currentStep > 0 ? `
          <button onclick="prevQuizStep()" class="px-5 py-2.5 rounded-full border border-[#E8C9C9] text-xs font-semibold text-[#443535] hover:bg-[#F7EDEB] transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back
          </button>
        ` : '<div></div>'}

        <button onclick="nextQuizStep()"
                ${!quizState.answers[currentQ.id] ? 'disabled class="opacity-50 cursor-not-allowed px-6 py-2.5 rounded-full bg-[#B97980] text-white text-xs font-semibold uppercase tracking-wider shadow"' : 'class="px-6 py-2.5 rounded-full bg-[#B97980] hover:bg-[#443535] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-1 cursor-pointer"'}>
          <span>${quizState.currentStep === totalSteps - 1 ? 'Reveal Recommendations' : 'Continue'}</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  `;
}

function selectQuizOption(questionId, optionId) {
  quizState.answers[questionId] = optionId;
  renderQuizStep();
}

function nextQuizStep() {
  const currentQ = QUIZ_QUESTIONS[quizState.currentStep];
  if (!quizState.answers[currentQ.id]) return;

  if (quizState.currentStep < QUIZ_QUESTIONS.length - 1) {
    quizState.currentStep++;
    renderQuizStep();
  } else {
    calculateQuizRecommendations();
  }
}

function prevQuizStep() {
  if (quizState.currentStep > 0) {
    quizState.currentStep--;
    renderQuizStep();
  }
}

function resetQuiz() {
  quizState = {
    currentStep: 0,
    answers: { recipient: null, occasion: null, budget: null, style: null }
  };
  renderQuizStep();
}

// Transparent recommendation calculation
function calculateQuizRecommendations() {
  const container = document.getElementById('gift-finder-wizard');
  if (!container) return;

  const all = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const { recipient, occasion, budget, style } = quizState.answers;

  const budgetOption = QUIZ_QUESTIONS.find(q => q.id === 'budget').options.find(b => b.id === budget);
  const minPrice = budgetOption ? budgetOption.min : 0;
  const maxPrice = budgetOption ? budgetOption.max : 100000;

  // Score each product based on criteria
  const scored = all.map(product => {
    let score = 0;
    let reasons = [];

    // Category / Style match (+40)
    if (style === 'any' || product.category === style) {
      score += 40;
      if (style !== 'any') reasons.push(`Matches your requested "${product.category}" gifting format`);
    }

    // Budget match (+30)
    if (product.price >= minPrice && product.price <= maxPrice) {
      score += 30;
      reasons.push(`Perfect fit for your ₨${product.price.toLocaleString('en-PK')} budget`);
    } else {
      // Partial score for proximity
      const diff = Math.min(Math.abs(product.price - minPrice), Math.abs(product.price - maxPrice));
      if (diff < 1500) score += 15;
    }

    // Occasion match (+25)
    if (product.occasion === occasion) {
      score += 25;
      reasons.push(`Curated specifically for ${occasion.toUpperCase()} celebrations`);
    }

    // Bestseller boost (+10)
    if (product.isBestSeller) {
      score += 10;
      reasons.push(`Ranked #${product.rating}★ by verified recipients`);
    }

    return { product, score, reasons };
  });

  // Sort descending
  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, 3);

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <!-- Result Banner -->
      <div class="text-center space-y-2 bg-[#F7EDEB] p-8 rounded-3xl border border-[#E8C9C9]">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8C9C9] text-[#B97980] text-xs font-semibold uppercase tracking-widest">
          <span class="material-symbols-outlined text-[16px]">verified</span> Curated Matches Just For You
        </span>
        <h3 class="font-serif font-bold text-2xl sm:text-3xl text-[#443535]">Your Bespoke Gift Shortlist</h3>
        <p class="text-xs sm:text-sm text-[#443535]/80 max-w-lg mx-auto">
          Based on your milestone celebration, budget tier, and aesthetic preferences, our master florist team recommends:
        </p>
      </div>

      <!-- Matched Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${topMatches.map((match, i) => `
          <div class="bg-white rounded-3xl p-5 shadow-lg border border-[#E8C9C9]/50 flex flex-col justify-between hover:shadow-2xl transition-all relative group">
            ${i === 0 ? `
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B97980] text-white px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow">
                ★ Top Match
              </div>
            ` : ''}

            <div>
              <div class="relative h-60 rounded-2xl overflow-hidden mb-4 bg-[#F7EDEB]">
                <img src="${match.product.images[0]}" alt="${match.product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-[#443535]">
                  ${match.product.category.toUpperCase()}
                </span>
                <span class="absolute bottom-3 right-3 bg-[#443535] text-white px-3 py-1 rounded-full text-xs font-bold font-serif">
                  ₨${match.product.price.toLocaleString('en-PK')}
                </span>
              </div>

              <div class="flex items-center gap-1 text-[#B97980] text-xs font-bold mb-1">
                <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">star</span>
                <span>${match.product.rating} (${match.product.reviewCount} reviews)</span>
              </div>

              <h4 class="font-serif font-bold text-lg text-[#443535] group-hover:text-[#B97980] transition-colors leading-snug">
                ${match.product.name}
              </h4>
              <p class="text-xs text-[#443535]/70 mt-2 line-clamp-2 leading-relaxed">${match.product.description}</p>

              <!-- Why this matched -->
              <div class="mt-3 p-2.5 rounded-xl bg-[#F7EDEB] space-y-1">
                <span class="text-[10px] uppercase font-bold text-[#B97980] block">Why we selected this:</span>
                ${match.reasons.slice(0, 2).map(r => `
                  <p class="text-[11px] text-[#443535]/80 flex items-start gap-1">
                    <span class="material-symbols-outlined text-[13px] text-emerald-700 mt-0.5">check</span>
                    <span>${r}</span>
                  </p>
                `).join('')}
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-[#F7EDEB] flex items-center gap-2">
              <button onclick="addToCart('${match.product.id}')" class="flex-1 py-2.5 rounded-full bg-[#B97980] hover:bg-[#443535] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">shopping_bag</span> Add to Bag
              </button>
              <a href="product.html?id=${match.product.id}" class="w-9 h-9 rounded-full bg-[#F7EDEB] text-[#443535] hover:bg-[#E8C9C9] flex items-center justify-center transition-colors" title="View full details">
                <span class="material-symbols-outlined text-[18px]">visibility</span>
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Retake Quiz Button -->
      <div class="text-center pt-4">
        <button onclick="resetQuiz()" class="px-6 py-2.5 rounded-full border border-[#B97980] text-[#B97980] hover:bg-[#B97980] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider">
          ↺ Retake Gift Finder Quiz
        </button>
      </div>
    </div>
  `;
}
