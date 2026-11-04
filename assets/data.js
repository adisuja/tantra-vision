/* The model. Every table, chart and [data-k] value on both pages is drawn from this file.
   Target: $100M ARR on 31 Dec 2031, reverse engineered month by month from Nov 2026.
   Acquisition: two webinars a week (Enterprise; Pro $99 plus the $999 course), fed by three traffic channels,
   plus the workshop series from the last week of Dec 2026. Counts are carried unrounded and rounded only for display. */
window.TANTRA = (function () {
  const A = {
    target: 30000,            // paying accounts on 31 Dec 2031 (self serve + Enterprise), solved below for $100M ARR
    entShare: 0.05,           // Enterprise clients per paying account (Adi: about 5 in 100)
    courseShare: 0.075,       // course buyers per new Pro buyer (Adi: 5 to 10 in 100)
    course: 999,
    arpaStart: 99, arpaEnd: 250,
    // Enterprise is a ONE TIME fee that includes 12 months of the platform. It is revenue, not ARR.
    fee: { 2026: 9999, 2027: 9999, 2028: 12500, 2029: 15000, 2030: 20000, 2031: 25000 },   // Adi's $9,999 to $25,000 range, by year end
    entConvert: 0.85,         // ASSUMPTION: Enterprise clients who move onto the platform plan after the included year
    entPlatform: 499,         // ASSUMPTION: Enterprise platform plan a month after year one (the earlier Done For You tier)
    entChurn: 0.022,          // ChartMogul median monthly churn for ARPA above $500
    // Self serve monthly churn: ChartMogul median by company ARR (6.5% under $300k, 3.7% at $1M to $3M, 3.1% above $8M)
    churnBands: [[3e5, 0.065], [1e6, 0.05], [3e6, 0.037], [8e6, 0.034], [Infinity, 0.031]],
    margin: 0.8,              // ASSUMPTION: gross margin
    attBuy: 91 / 3369,        // attendee to Pro buyer: ASSUMPTION, set equal to the 2025 attendee to booked call rate
    attCall: 91 / 3369,       // attendee to booked Enterprise call (sheet: 91 calls from 3,369 attendees)
    close: 0.10,              // ASSUMPTION: call to Enterprise deal (Adi's history: about 2 clients a month)
    lift: 0.01,               // rates improve by 1% of themselves per month from Jan 2027 (cold show-up is held flat)
    channels: {
      cold:    { name: "Cold outreach", note: "Calendar invites, email and LinkedIn from Tantra", unit: "invites", toReg: 4571 / 2153264, regAtt: 3369 / 4571, liftAtt: false, src: "sheet" },
      organic: { name: "Organic content", note: "LinkedIn posts, newsletter and video", unit: "page visits", toReg: 0.30, regAtt: 0.45, perImp: 0.006, liftAtt: true, src: "assumption" },
      ads:     { name: "Paid ads", note: "Meta and LinkedIn to the webinar page", unit: "page visits", toReg: 0.25, regAtt: 0.38, liftAtt: true, src: "assumption" }
    },
    cpv: { 2026: 3, 2027: 3, 2028: 3.3, 2029: 3.6, 2030: 4, 2031: 4.4 },   // ASSUMPTION: ad cost per page visit, rising about 10% a year
    mix: {   // ASSUMPTION: share of attendees from each channel
      2026: { cold: 0.70, organic: 0.15, ads: 0.15 }, 2027: { cold: 0.50, organic: 0.20, ads: 0.30 },
      2028: { cold: 0.35, organic: 0.25, ads: 0.40 }, 2029: { cold: 0.30, organic: 0.30, ads: 0.40 },
      2030: { cold: 0.25, organic: 0.30, ads: 0.45 }, 2031: { cold: 0.25, organic: 0.30, ads: 0.45 }
    },
    planMix: [   // ASSUMPTION: self serve plan mix that produces the average
      { y: 2027, pro: 0.75, scale: 0.20, funnel: 0.05 }, { y: 2029, pro: 0.50, scale: 0.25, funnel: 0.25 }, { y: 2031, pro: 0.35, scale: 0.23, funnel: 0.42 }
    ],
    prices: { pro: 99, scale: 199, funnel: 399 },
    gEnd: 0.025,
    fixed: { "2026-11": 18, "2026-12": 35, "2027-01": 50 },   // ASSUMPTION: 10 paying accounts today
    today: 10,
    seats: 98, wsShow: 0.6   // workshop series: 98 seat room, ASSUMPTION 6 in 10 attend
  };
  const YEARS = [2026, 2027, 2028, 2029, 2030, 2031];
  const months = [];
  for (let y = 2026, m = 10; ; m++) { if (m > 11) { m = 0; y++; } if (y > 2031) break; months.push(`${y}-${String(m + 1).padStart(2, "0")}`); }
  const yr = k => +k.slice(0, 4);
  const webinars = k => (k === "2026-11" ? 3 : 52 / 12);          // one of each webinar a week
  const series = k => (k === "2026-12" ? 1 : k < "2027-01" ? 0 : ({ 2027: 1, 2028: 2, 2029: 3, 2030: 4, 2031: 4 })[yr(k)]);
  const up = (r, i, cap) => Math.min(cap || 1, r * Math.pow(1 + A.lift, Math.max(0, i - 1)));

  // Growth eases exponentially; two anchors fix it: 500 paying on 30 Sep 2027 and the 31 Dec 2031 account target
  const N = months.length - months.indexOf("2027-01") - 1;
  const iM1 = months.indexOf("2027-09") - months.indexOf("2027-01");
  const g = (g0, tau, i) => A.gEnd + (g0 - A.gEnd) * Math.exp(-i / tau);
  const path = (g0, tau, upto) => { let n = 50; for (let i = 0; i < upto; i++) n *= 1 + g(g0, tau, i); return n; };
  const g0For = tau => { let lo = 0, hi = 1; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; path(m, tau, iM1) < 500 ? lo = m : hi = m; } return lo; };
  function makePath(target) {
    let tlo = 1, thi = 400;
    for (let k = 0; k < 60; k++) { const tm = (tlo + thi) / 2; path(g0For(tm), tm, N) < target ? tlo = tm : thi = tm; }
    const tau = tlo, g0 = g0For(tlo), out = [];
    let a = 0, gi = 0;
    months.forEach(k => { if (A.fixed[k] != null) a = A.fixed[k]; else { a *= 1 + g(g0, tau, gi); gi++; } out.push(a); });
    return { out, tau, g0 };
  }
  const churnAt = arr => A.churnBands.find(b => arr < b[0])[1];

  function build(accPath) {
    const rows = [];
    // Enterprise clients by start month: year one is prepaid in the fee; from month 13 a share moves to the platform plan
    const cohorts = [{ start: -6, n: A.today * A.entShare }];   // today's Enterprise share of the 10 accounts, signed in May 2026
    months.forEach((k, i) => {
      const y = yr(k), prev = i ? rows[i - 1] : null, mo = +k.slice(5);
      const acc = accPath[i];
      const entF = acc * A.entShare, selfF = acc - entF;
      const t = Math.max(0, i - months.indexOf("2027-01")) / N;
      const arpa = A.arpaStart + (A.arpaEnd - A.arpaStart) * t;
      const f0 = A.fee[y - 1] || A.fee[2026], f1 = A.fee[y], fee = f0 + (f1 - f0) * mo / 12;
      let lostEnt = 0, converting = 0;
      cohorts.forEach(c => {
        const age = i - c.start;
        if (age === 12) { converting += c.n * A.entConvert; lostEnt += c.n * (1 - A.entConvert); c.n *= A.entConvert; }
        else if (age > 12) { lostEnt += c.n * A.entChurn; c.n *= 1 - A.entChurn; }
      });
      const active = cohorts.reduce((s2, c) => s2 + c.n, 0);
      const newEnt = Math.max(0, entF - active);
      if (newEnt > 0) cohorts.push({ start: i, n: newEnt });
      const entYear1 = cohorts.filter(c => i - c.start < 12).reduce((s2, c) => s2 + c.n, 0);
      const entOnPlatform = cohorts.filter(c => i - c.start >= 12).reduce((s2, c) => s2 + c.n, 0);
      const pSelf = prev ? prev.self : A.today * (1 - A.entShare);
      const churnRate = churnAt(prev ? prev.arr : 0);
      const churned = pSelf * churnRate;
      const proNeed = Math.max(0, selfF - pSelf + churned);
      const attBuy = up(A.attBuy, i), attCall = up(A.attCall, i), close = up(A.close, i, 0.3);
      const wsBuyers = Math.min(proNeed, series(k) * A.seats * A.wsShow * attBuy);
      const proBuyers = proNeed - wsBuyers;
      const proAtt = proBuyers / attBuy, calls = newEnt / close, entAtt = calls / attCall, att = proAtt + entAtt;
      const mix = A.mix[y], ch = {};
      for (const c of ["cold", "organic", "ads"]) {
        const C = A.channels[c];
        const toReg = up(C.toReg, i, 0.5), regAtt = C.liftAtt ? up(C.regAtt, i, 0.9) : C.regAtt;
        const a2 = att * mix[c], regs = a2 / regAtt, top = regs / toReg;
        ch[c] = { att: a2, regs, top, toReg, regAtt };
      }
      ch.organic.imp = ch.organic.top / A.channels.organic.perImp;
      const cpv = A.cpv[y], adSpend = ch.ads.top * cpv;
      const courses = proNeed * A.courseShare;
      const selfMrr = selfF * arpa, entMrr = entOnPlatform * A.entPlatform;
      const mrr = selfMrr + entMrr;
      const feeRev = newEnt * fee, courseRev = courses * A.course;
      rows.push({
        k, y, accounts: acc, self: selfF, ent: entF, entYear1, entOnPlatform, arpa, fee, churnRate, churned, lostEnt, converting,
        proNeed, newEnt, wsBuyers, proBuyers, series: series(k), webinars: webinars(k), attBuy, attCall, close, proAtt, entAtt, att, calls, ch, cpv, adSpend, courses,
        regs: ch.cold.regs + ch.organic.regs + ch.ads.regs, gross: proNeed + newEnt, adBuyers: (proBuyers + newEnt) * mix.ads,
        selfMrr, entMrr, mrr, arr: mrr * 12, feeRev, courseRev, revenue: mrr + feeRev + courseRev,
        growth: prev ? acc / prev.accounts - 1 : null
      });
    });
    return rows;
  }
  // Solve the 31 Dec 2031 account count that makes ARR exactly $100M
  let lo = 20000, hi = 60000, P;
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; P = makePath(m); const r = build(P.out); r[r.length - 1].arr < 1e8 ? lo = m : hi = m; }
  A.target = lo; P = makePath(lo); A.tau = P.tau; A.gStart = P.g0;
  const rows = build(P.out);

  const years = YEARS.map(y => {
    const r = rows.filter(x => x.y === y), dec = r[r.length - 1];
    const sum = f => r.reduce((s, x) => s + f(x), 0);
    const v = { y, dec, months: r.length,
      proNeed: sum(x => x.proNeed), newEnt: sum(x => x.newEnt), lostEnt: sum(x => x.lostEnt), courses: sum(x => x.courses), wsBuyers: sum(x => x.wsBuyers),
      att: sum(x => x.att), regs: sum(x => x.regs), calls: sum(x => x.calls), cold: sum(x => x.ch.cold.top), organic: sum(x => x.ch.organic.top),
      imp: sum(x => x.ch.organic.imp), ads: sum(x => x.ch.ads.top), adSpend: sum(x => x.adSpend), adBuyers: sum(x => x.adBuyers),
      subRev: sum(x => x.mrr), feeRev: sum(x => x.feeRev), courseRev: sum(x => x.courseRev), revenue: sum(x => x.revenue), churned: sum(x => x.churned) };
    v.adCac = v.adSpend / Math.max(1, v.adBuyers);
    v.payback = v.adCac / (dec.arpa * A.margin);
    return v;
  });
  years.forEach((v, i) => { v.multiple = i ? v.dec.arr / years[i - 1].dec.arr : null; });
  const m1 = rows.find(r => r.accounts >= 499.5);
  const at = k => rows.find(r => r.k === k);
  const firstArr = v => rows.find(r => r.arr >= v);

  const team = [
    { q: "Dec 2026", n: 7, adds: "The three founders and four team members" },
    { q: "Jun 2027", n: 12, adds: "Webinar operations lead, paid ads lead, content lead, two engineers" },
    { q: "Dec 2027", n: 18, adds: "Head of Growth, customer success lead, Enterprise account executive, three engineers" },
    { q: "Dec 2028", n: 35, adds: "Enterprise team of 5, growth team of 6, engineering to 12" },
    { q: "Dec 2029", n: 70, adds: "VP Sales, compliance, regional leads for the UK and India" },
    { q: "Dec 2030", n: 120, adds: "Enterprise team of 20, Australia and Canada leads" },
    { q: "Dec 2031", n: 180, adds: "About $550k ARR per person" }
  ];
  const ys = y => years.find(v => v.y === y);
  const funding = [
    { round: "Seed", k: "2027-10", size: 3e6, use: `Team from 18 to 35 people and ${"$" + (ys(2028).adSpend / 1e6).toFixed(1)}M of ads through 2028` },
    { round: "Series A", k: "2029-03", size: 15e6, use: `Team from 35 to 120 people, ${"$" + ((ys(2029).adSpend + ys(2030).adSpend) / 1e6).toFixed(1)}M of ads in 2029 and 2030, compliance` },
    { round: "Series B", k: "2030-06", size: 40e6, use: "Team to 180 people, regional teams, Enterprise team of 20" }
  ];

  const fmt = {
    usd(n, d) {
      if (n >= 1e6) return "$" + (n / 1e6).toFixed(d == null ? 1 : d).replace(/\.0+$/, "") + "M";
      if (n >= 1e3) return "$" + Math.round(n / 1e3).toLocaleString("en-US") + "k";
      return "$" + Math.round(n).toLocaleString("en-US");
    },
    full(n) { return "$" + Math.round(n).toLocaleString("en-US"); },
    num(n) { return Math.round(n).toLocaleString("en-US"); },
    few(n) { return n < 9.95 ? (Math.round(n * 10) / 10).toString() : Math.round(n).toLocaleString("en-US"); },
    big(n) { return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M" : n >= 1e4 ? Math.round(n / 1e3) + "k" : Math.round(n).toLocaleString("en-US"); },
    pct(x, d) { return (x * 100).toFixed(d == null ? 1 : d).replace(/\.0+$/, "") + "%"; },
    month(k, long) { const [y, m] = k.split("-"); return new Date(+y, +m - 1, 1).toLocaleDateString("en-GB", { month: long ? "long" : "short", year: "numeric" }); }
  };
  const last = rows[rows.length - 1];
  const pro = rows.filter(r => r.y >= 2029).map(r => r.proAtt / r.webinars);
  const values = {
    arrT: fmt.usd(last.arr, 0), accT: fmt.num(last.accounts), selfT: fmt.num(last.self), entT: fmt.num(last.ent),
    arpaT: fmt.full(last.arpa), selfArrT: fmt.usd(last.selfMrr * 12), entArrT: fmt.usd(last.entMrr * 12), entPlatT: fmt.num(last.entOnPlatform), feeT: fmt.full(A.fee[2031]), fee31: fmt.usd(ys(2031).feeRev), rev31: fmt.usd(ys(2031).revenue),
    m1: fmt.month(m1.k, true), gStart: fmt.pct(A.gStart), gDec31: fmt.pct(last.growth),
    proAtt29lo: fmt.num(Math.min(...rows.filter(r => r.y === 2029).map(r => r.proAtt / r.webinars))), proAtt29hi: fmt.num(Math.max(...rows.filter(r => r.y === 2029).map(r => r.proAtt / r.webinars))), proAttMax: fmt.num(Math.max(...pro)),
    proAttDec26: fmt.num(at("2026-12").proAtt / at("2026-12").webinars), entConvert: fmt.pct(A.entConvert, 0), churn27: fmt.pct(at("2027-06").churnRate), churn31: fmt.pct(last.churnRate),
    coldWkMax: fmt.big(Math.max(...rows.map(r => r.ch.cold.top / r.webinars))), coldWkMaxK: fmt.month(rows.reduce((m, r) => (r.ch.cold.top / r.webinars > m.ch.cold.top / m.webinars ? r : m)).k, true), churned31: fmt.num(ys(2031).churned)
  };
  YEARS.forEach(y => { values["arr" + y] = fmt.usd(ys(y).dec.arr); values["acc" + y] = fmt.num(ys(y).dec.accounts); });
  const bind = () => document.querySelectorAll("[data-k]").forEach(el => { const v = values[el.dataset.k]; if (v != null) el.textContent = v; });
  if (typeof document !== "undefined" && document.querySelectorAll) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind(); }

  return { A, rows, years, years_: YEARS, m1, at, firstArr, team, funding, fmt, values, mlpDate: "2026-12-31", todayDate: "2026-11-04" };
})();
