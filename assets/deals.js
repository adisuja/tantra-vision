/* The deal platform launch for today's Tantra (the outreach engine). Kept OUT of the revenue model:
   lifetime deals pay once, so nothing here feeds ARR, paying accounts or revenue in data.js.
   Platform list researched and checked on 4 Nov 2026. "Unclear" means we apply anyway and confirm. */
window.TANTRA_DEALS = (function () {
  const LTD = "Lifetime tiers: $69, $149, $299";
  const SUB = "50% off 6 months, or 30% off year one";
  const BF = "40% off year one, Black Friday only";
  const P = (name, url, type, submit, cut, status, note) => ({ name, url, type, submit, cut, status, note,
    offer: { "Lifetime deal marketplace": LTD, "Subscription discount marketplace": SUB, "Startup perk directory": SUB, "Deal directory or newsletter": LTD, "Black Friday directory": BF }[type],
    wave: { "Lifetime deal marketplace": "2", "Subscription discount marketplace": "1", "Startup perk directory": "1", "Deal directory or newsletter": "3", "Black Friday directory": "1" }[type] });
  const L = "Lifetime deal marketplace", S = "Subscription discount marketplace", K = "Startup perk directory", D = "Deal directory or newsletter", B = "Black Friday directory";
  const platforms = [
    P("AppSumo", "https://appsumo.com", L, "https://appsumo.com/select", "Self listed: keep 95% of your own buyers, 70% of AppSumo's", "Active", "The largest; Select is curated, self listing via the partner portal"),
    P("StackSocial", "https://www.stacksocial.com", L, "https://www.stackcommerce.com/contact", "Not published (reported 30 to 50%)", "Active", "7.9M registered shoppers, wide publisher syndication"),
    P("DealMirror", "https://dealmirror.com", L, "https://dealmirror.com/product-deal-request/", "Up to 70% to the vendor", "Active", ""),
    P("RocketHub", "https://www.rockethub.com", L, "https://www.rockethub.com/marketplace/how-it-works", "Marketplace 70% to the vendor", "Active", "Exclusive deals get a managed launch campaign"),
    P("Dealify", "https://dealify.com", L, "https://dealify.com/pages/partner-with-us", "Not published", "Active", ""),
    P("DealFuel", "https://www.dealfuel.com", L, "https://www.dealfuel.com/submit-deal/", "Not published", "Active", "Submission needs a free account"),
    P("Prime Club", "https://primeclub.co", L, "https://primeclub.co/partner-application-form/", "Not published", "Active", "Vetted; 8,000+ members"),
    P("Earlybird", "https://earlybird.so", L, "https://earlybird.so/partner/", "Not published", "Active", ""),
    P("GrabLTD", "https://grabltd.com", L, "https://grabltd.com/partners", "Lifetime: keep 65%; subscription listing $50 a month", "Active", "Also lists monthly plans with no commission"),
    P("SaaSZilla", "https://saaszilla.co", L, "https://saaszilla.co/partnership/", "Revenue share, not published", "Unclear", "No 2026 deal seen"),
    P("SaaS Mantra", "https://deals.saasmantra.com", L, "https://deals.saasmantra.com", "Reported 30 to 40%", "Unclear", "Main site is now a course; deals subdomain still live"),
    P("Secret", "https://www.joinsecret.com", S, "https://www.joinsecret.com/saas-partnerships", "Not published", "Active", "631 deals; funded startups"),
    P("NachoNacho", "https://nachonacho.com", S, "https://nachonacho.com/seller", "Revenue share on paid sales", "Active", "SMB buyers up to 500 staff"),
    P("JVZoo", "https://www.jvzoo.com", S, "https://www.jvzoo.com/register", "Not checked", "Active", "An affiliate checkout rather than a deal store"),
    P("FounderPass", "https://www.founderpass.com", K, "https://www.founderpass.com/partner-signup", "Reported 10 to 20%", "Active", ""),
    P("PerkBook", "https://perkbook.co", K, "https://perkbook.co/vendors", "Not published", "Active", "210+ perks"),
    P("Superscout", "https://superscout.co", K, "https://superscout.co/perks/start", "No fee shown", "Active", ""),
    P("StartupPerks", "https://startup-perks.com", K, "https://startup-perks.com", "Free", "Active", "Form on the homepage, or a pull request to its GitHub list"),
    P("RocketHub Perk Directory", "https://www.rockethub.com", K, "https://www.rockethub.com/startup-perk-partners", "Not published", "Active", ""),
    P("F6S Deals", "https://www.f6s.com/deals", K, "https://www.f6s.com/deals", "Not published", "Unclear", "6.2M members; no public vendor form, contact F6S"),
    P("Mercury Perks", "https://mercury.com/perks", K, "https://mercury.com/partnerships", "Not published", "Unclear", "Contact through partnerships"),
    P("Brex Partners", "https://www.brex.com/partners", K, "https://www.brex.com/partners", "Not published", "Unclear", ""),
    P("OpenVC Perks", "https://openvc.app/perks", K, "https://openvc.app/perks", "Not published", "Unclear", "No vendor form found; contact OpenVC"),
    P("StartGround", "https://startground.com", K, "https://startground.com", "Not published", "Unclear", "No vendor form found; contact them"),
    P("Bowora", "https://bowora.com", K, "https://bowora.com/submit", "Free", "Unclear", ""),
    P("SaaSPirate", "https://saaspirate.com", D, "https://saaspirate.com/submit-a-deal/", "Not published (affiliate links)", "Active", "576+ deals and a weekly newsletter; also takes Black Friday deals"),
    P("Only Lifetime Deals", "https://onlylifetimedeals.com", D, "https://onlylifetimedeals.com/submit-lifetime-deals/", "Not published", "Active", ""),
    P("Smol Launch", "https://smollaunch.com", D, "https://smollaunch.com/pricing", "Free, $19 or $39 a launch; newsletter $49 an issue", "Active", ""),
    P("First Launch", "https://firstlaunch.promo", D, "https://firstlaunch.promo/submit", "No cut", "Active", "Lists monthly plan discounts too"),
    P("LTD Blog", "https://www.ltdblog.com", D, "https://www.ltdblog.com/p/submit-lifetime-deal.html", "Free", "Unclear", ""),
    P("keeps.so", "https://keeps.so", D, "https://keeps.so/submit", "Not published", "Unclear", ""),
    P("Best Lifetime Deals", "https://bestlifetimedeals.com", D, "https://bestlifetimedeals.com/contact/", "Guest post $50", "Unclear", "Email; they ask for an affiliate link"),
    P("LTDHunt", "https://ltdhunt.com", D, "https://ltdhunt.com", "Not published", "Unclear", "Submit link redirects; contact them"),
    P("Lifetimo", "https://lifetimo.com", D, "https://lifetimo.com", "Not published", "Unclear", "Aggregator; no vendor form"),
    P("DealMango", "https://dealmango.com", D, "https://dealmango.com", "Not published", "Unclear", "Aggregator; no vendor form"),
    P("MSB Digital", "https://msbdigital.com", D, "https://msbdigital.com", "Not published", "Unclear", "Deal list and newsletter; contact them"),
    P("DealsBird", "https://dealsbird.com", D, "https://dealsbird.com", "Not published", "Unclear", "Site timed out when checked"),
    P("SellMicroSaaS", "https://sellmicrosaas.com", B, "https://sellmicrosaas.com/submit-black-friday-deal/", "Free", "Active", "200+ offers tracked for 2026"),
    P("Plerdy Black Friday list", "https://www.plerdy.com/blog/black-friday/", B, "https://www.plerdy.com/blog/black-friday/", "Not published", "Active", "Use Add your SaaS Deal on the page"),
    P("Awesome Black Friday Cyber Monday", "https://github.com/trungdq88/Awesome-Black-Friday-Cyber-Monday", B, "https://github.com/trungdq88/Awesome-Black-Friday-Cyber-Monday", "Free", "Active", "Open a pull request"),
    P("SaaS Friday Deals", "https://saasfridaydeals.com", B, "https://saasfridaydeals.com", "Not published", "Unclear", "Submit your deal on the homepage"),
    P("Black Friday App Deals", "https://blackfridayappdeals.com", B, "https://blackfridayappdeals.com", "Free", "Unclear", "Google Form linked on the site; still shows 2025")
  ];
  return {
    goal: 1000, goalDate: "31 March 2027", applyBy: "30 November 2026",
    offers: [
      { name: "Lifetime tier 1", where: "Lifetime deal marketplaces and deal directories", price: "$69 once", includes: "Today's Tantra for 1 workspace: unlimited email and calendar accounts, 1 LinkedIn or WhatsApp account, your own AI key" },
      { name: "Lifetime tier 2", where: "Same", price: "$149 once", includes: "Tier 1 with 3 LinkedIn or WhatsApp accounts" },
      { name: "Lifetime tier 3", where: "Same", price: "$299 once", includes: "Tier 1 with 8 LinkedIn or WhatsApp accounts and 3 workspaces" },
      { name: "Subscription discount", where: "Discount marketplaces and startup perk directories", price: "50% off Pro ($99) or Scale ($199) for 6 months, or 30% off year one on annual", includes: "The normal plan, so these buyers stay on a subscription" },
      { name: "Black Friday", where: "Black Friday directories, 27 to 30 November", price: "40% off year one", includes: "Pro or Scale, annual or monthly" }
    ],
    offerNote: "One list price on every platform, so no platform undercuts another. Lifetime tiers cover today's outreach engine only; the V2 to V4 funnel features are not included, and lifetime buyers get 50% off the funnel plans when they upgrade.",
    split: [
      { type: L, offer: LTD, goal: 650 },
      { type: S, offer: SUB, goal: 100 },
      { type: K, offer: SUB, goal: 100 },
      { type: D, offer: LTD, goal: 100 },
      { type: B, offer: BF, goal: 50 }
    ],
    waves: [
      { name: "1", when: "Listed by 20 Nov 2026, live 27 to 30 Nov", what: "Black Friday directories, startup perk directories and subscription discount marketplaces", owner: "Bhaskar" },
      { name: "2", when: "Applications by 30 Nov 2026, launches Dec 2026 to Jan 2027", what: "Every lifetime deal marketplace, launched as each one approves", owner: "Bhaskar, with Adi on terms" },
      { name: "3", when: "Feb to Mar 2027", what: "Deal directories and newsletters, and a second run on the best selling marketplaces", owner: "Bhaskar" }
    ],
    closed: "Checked and closed on 4 Nov 2026: PitchGround (now a paid ranking board), Lifetime Deal Club (domain gone), Product Hunt Founder Club (discontinued).",
    platforms
  };
})();
