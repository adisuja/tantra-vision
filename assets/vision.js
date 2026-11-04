(function () {
  const T = window.TANTRA, f = T.fmt, R = T.rows;
  const main = document.getElementById("main");
  const last = R[R.length - 1];
  const nowKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; })();
  const nowRow = T.at(nowKey) || R[0];
  const Y = y => T.years.find(v => v.y === y);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const goal = (n, g, sub, owner, money) => `<li><span class="n${money ? " money" : ""}">${n}</span><span class="g">${g}${sub ? `<span>${sub}</span>` : ""}</span>${owner ? `<span class="o">${owner}</span>` : "<span></span>"}</li>`;
  const slide = (id, title, sub, goals, viz, one) => `<section class="slide${one ? " one" : ""}" id="${id}" aria-labelledby="${id}-h">
    <div class="rail"><a href="#${id}" aria-label="${title}"></a></div>
    <div class="slide-in"><div><h2 id="${id}-h">${title}${sub ? `<small>${sub}</small>` : ""}</h2>${goals.length ? `<ul class="goals">${goals.join("")}</ul>` : ""}</div>${viz ? `<div>${viz}</div>` : ""}</div></section>`;

  // The whole ARR curve with one year's stretch lit, like a route map with the current section highlighted
  function arrViz(year) {
    const W = 560, H = 260, P = { l: 48, r: 10, t: 30, b: 26 };
    const X = i => P.l + i / (R.length - 1) * (W - P.l - P.r), Yv = v => H - P.b - v / 1e8 * (H - P.t - P.b);
    const d = R.map((r, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Yv(r.arr).toFixed(1)}`).join("");
    const seg = R.map((r, i) => ({ r, i })).filter(o => o.r.y === year);
    const ds = seg.map((o, j) => `${j ? "L" : "M"}${X(o.i).toFixed(1)} ${Yv(o.r.arr).toFixed(1)}`).join("");
    const e = seg[seg.length - 1];
    const grid = [0, 5e7, 1e8].map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${Yv(t)}" y2="${Yv(t)}"/>`).join("");
    const labs = [0, 5e7, 1e8].map(t => `<text x="${P.l - 8}" y="${Yv(t) + 4}" text-anchor="end">${f.usd(t, 0)}</text>`).join("") +
      T.years_.filter(y => y > 2026).map(y => { const i = R.findIndex(r => r.k === `${y}-01`); return `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${y}</text>`; }).join("");
    return `<div class="viz"><h3>ARR on the way to $100M, ${year} lit</h3><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ARR curve with ${year} highlighted, reaching ${f.usd(e.r.arr)}"><g class="grid">${grid}</g><g class="axis">${labs}</g>
      <path d="${d}" fill="none" stroke="#2A3350" stroke-width="5" stroke-linecap="round"/><path d="${ds}" fill="none" stroke="#6D4AFF" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${X(e.i)}" cy="${Yv(e.r.arr)}" r="8" fill="#E0A100" stroke="#fff" stroke-width="2.5"/><text x="${Math.min(X(e.i), W - 60)}" y="${Yv(e.r.arr) - 16}" text-anchor="middle" fill="#fff" style="font:800 20px var(--display)">${f.usd(e.r.arr)}</text></svg></div>`;
  }

  // Paying accounts by month inside one year, Milestone 1 marked
  function accViz(year) {
    const rs = R.filter(r => r.y === year), W = 560, H = 240, P = { l: 48, r: 10, t: 16, b: 26 };
    const max = Math.ceil(Math.max(...rs.map(r => r.accounts)) / 250) * 250, bw = (W - P.l - P.r) / rs.length;
    const Yv = v => H - P.b - v / max * (H - P.t - P.b);
    let s = `<g class="grid"><line x1="${P.l}" x2="${W - P.r}" y1="${Yv(max)}" y2="${Yv(max)}"/><line x1="${P.l}" x2="${W - P.r}" y1="${Yv(0)}" y2="${Yv(0)}"/></g><g class="axis"><text x="${P.l - 8}" y="${Yv(max) + 4}" text-anchor="end">${f.num(max)}</text><text x="${P.l - 8}" y="${Yv(0) + 4}" text-anchor="end">0</text>`;
    rs.forEach((r, i) => { s += `<text x="${P.l + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${f.month(r.k).slice(0, 3)}</text>`; });
    s += "</g>";
    rs.forEach((r, i) => { const m = r.k === T.m1.k; s += `<rect x="${P.l + i * bw + 3}" y="${Yv(r.accounts)}" width="${bw - 6}" height="${Yv(0) - Yv(r.accounts)}" rx="4" fill="${m ? "#E0A100" : "#6D4AFF"}"><title>${f.month(r.k)}: ${f.num(r.accounts)}</title></rect>`; });
    if (rs.some(r => r.k === T.m1.k)) s += `<line x1="${P.l}" x2="${W - P.r}" y1="${Yv(500)}" y2="${Yv(500)}" stroke="#E0A100" stroke-dasharray="4 4"/><text x="${P.l + 6}" y="${Yv(500) - 6}" fill="#E0A100" style="font:700 13px var(--body)">500: Milestone 1</text>`;
    return `<div class="viz"><h3>Paying accounts by month, ${year}</h3><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Paying accounts by month in ${year}, reaching ${f.num(rs[rs.length - 1].accounts)}">${s}</svg></div>`;
  }

  // One Pro webinar in a given month, top to bottom
  function funnelViz(r) {
    const w = r.webinars, c = r.ch, share = r.proAtt / r.att;
    const stages = [
      ["Cold invites", c.cold.top * share / w], ["Page visits from content and ads", (c.organic.top + c.ads.top) * share / w],
      ["Registrations", r.regs * share / w], ["Attendees", r.proAtt / w], ["Pro buyers", r.proBuyers / w]
    ];
    const widths = [100, 84, 68, 54, 42];
    return `<div class="viz"><h3>One Pro webinar in ${f.month(r.k, true)}</h3><div class="fun">${stages.map((s, i) => `<div class="${i === stages.length - 1 ? "pay" : ""}" style="--w:${widths[i]}%"><span>${s[0]}</span><b>${f.num(s[1])}</b></div>`).join("")}</div></div>`;
  }

  const countdown = () => {
    const mlp = new Date(2026, 11, 31), start = new Date(2026, 10, 4), today = new Date(new Date().toDateString());
    const left = Math.max(0, Math.round((mlp - today) / 864e5)), done = Math.min(1, Math.max(0, (today - start) / (mlp - start)));
    return `<div class="viz"><div class="count">${left}<small>days until V4 ships on 31 December 2026</small></div><div class="track-bar" aria-hidden="true"><div style="width:${(done * 100).toFixed(1)}%"></div></div></div>`;
  };

  const comp = () => {
    const sa = last.selfMrr * 12, ea = last.entMrr * 12;
    return `<div class="viz"><h3>Where the $100M ARR comes from</h3><div class="comp" style="margin:0"><div class="bars"><div class="seg" style="flex:${sa};background:#6D4AFF">${f.usd(sa)}</div><div class="seg" style="flex:${ea};background:#0A8F5B">${f.usd(ea)}</div></div><div class="k"><span><i style="background:#6D4AFF"></i>Self serve</span><span><i style="background:#0A8F5B"></i>Enterprise platform plan</span></div></div></div>`;
  };

  const yGoals = (y, extra) => {
    const v = Y(y);
    return [
      goal(f.num(v.dec.accounts), `paying accounts by 31 December ${y}`, `${f.num(v.dec.self)} self serve, ${f.num(v.dec.ent)} Enterprise`, "Adi"),
      goal(f.usd(v.dec.arr), `ARR on 31 December ${y}`, y > 2027 ? `${v.multiple.toFixed(1)} times the year before` : `from ${f.usd(Y(2026).dec.arr)} in December 2026`, "All", true),
      goal(f.num(v.proNeed), "new self serve buyers", `replacing ${f.num(v.churned)} lost to churn`, "Adi"),
      goal(f.num(v.newEnt), "new Enterprise clients", `${f.usd(v.feeRev)} in one time fees`, "Adi"),
      goal(f.big(v.att), "webinar attendees", `${f.big(v.cold)} cold invites, ${f.big(v.organic + v.ads)} page visits`, "Bhaskar"),
      ...extra
    ];
  };
  const team = q => T.team.find(t => t.q === q);
  const fund = r => T.funding.find(x => x.round === r);

  main.innerHTML = [
    slide("s-target", "$100M ARR", "by 31 December 2031", [
      goal(f.num(last.accounts), "paying accounts", "", "All"),
      goal(f.usd(last.selfMrr * 12), `${f.num(last.self)} self serve accounts`, `at ${f.full(last.arpa)} a month on average`, "Adi", true),
      goal(f.usd(last.entMrr * 12), `${f.num(last.entOnPlatform)} Enterprise clients on the platform plan`, `at $${T.A.entPlatform} a month, after the included year`, "Adi", true),
      goal(f.usd(Y(2031).feeRev), "of one time Enterprise fees in 2031", `${f.num(Y(2031).newEnt)} new clients at up to ${f.full(T.A.fee[2031])}`, "Adi", true),
      goal(f.pct(last.churnRate), "self serve churn a month or lower", "the market median for our size", "Bharath"),
      goal(String(team("Dec 2031").n), "people on the team", "about $550k ARR per person", "Adi")
    ], comp()),
    slide("s-product", "The product", "all four versions by 31 December 2026", [
      goal("V1", "An agent runs the outreach engine from a chat", "30 November 2026", "Bharath"),
      goal("V2", "Every funnel element built from a chat", "14 December 2026", "Bharath"),
      goal("V3", "The funnel tests and fixes itself", "23 December 2026", "Bharath"),
      goal("V4", "The whole revenue funnel, run by agents", "31 December 2026", "All")
    ], countdown()),
    slide("s-now", "This quarter", "November and December 2026", [
      goal("2", "webinars every week", "Enterprise, and Pro with the course, from the week of 9 November", "Bhaskar"),
      goal(f.num(T.at("2026-12").accounts), "paying accounts by 31 December", `then ${f.num(T.at("2027-01").accounts)} by 31 January`, "Adi"),
      goal(f.few(Y(2026).newEnt), "new Enterprise clients", `from ${f.num(Y(2026).calls)} booked calls`, "Adi"),
      goal(f.big(Y(2026).cold), "cold invites across the two months", `plus ${f.num(Y(2026).organic + Y(2026).ads)} page visits from content and ads`, "Bhaskar"),
      goal("28 Dec", "the workshop series launches", "the last week of December", "Adi"),
      ...(window.TANTRA_DEALS ? [goal(String(window.TANTRA_DEALS.platforms.length), "deal platforms applied to", "Black Friday listings live 27 to 30 November", "Bhaskar")] : []),
      goal("4", "missing numbers filled in", "burn, cash, paying customers today, churn", "Adi")
    ], funnelViz(T.at("2026-12"))),
    (window.TANTRA_DEALS ? (() => { const D = window.TANTRA_DEALS, ps = D.platforms;
      const byType = D.split.map(x => ({ t: x.type, n: ps.filter(p => p.type === x.type).length, g: x.goal }));
      const max = Math.max(...byType.map(b => b.g));
      const viz = `<div class="viz"><h3>The 1,000, by kind of platform</h3><div class="dl-bars">${byType.map(b => `<div><span>${b.t}<small>${b.n} platforms</small></span><i style="width:${(b.g / max * 100).toFixed(1)}%"></i><b>${f.num(b.g)}</b></div>`).join("")}</div><p class="small" style="color:var(--night-muted);margin-top:12px">Not counted in ARR: lifetime deals pay once.</p></div>`;
      return slide("s-deals", "Deal platform launch", "today's Tantra on every deal platform", [
        goal(f.num(D.goal), "conversions across every deal platform", `by ${D.goalDate}`, "Bhaskar"),
        goal(String(ps.length), "deal platforms applied to", `by ${D.applyBy}`, "Bhaskar"),
        goal(D.offers[0].price, "lowest lifetime deal tier", D.offers[0].includes, "Adi"),
        goal(D.waves.length + " waves", "of launches", "Black Friday 27 to 30 Nov 2026, lifetime deals Dec 2026 to Jan 2027, directories Feb to Mar 2027", "Bhaskar"),
        goal("$0", "counted in ARR", "conversions and reviews are the goal, not revenue", "All")
      ], viz); })() : ""),
    slide("s-2027", "2027", "Milestone 1 and the seed round", yGoals(2027, [
      goal("500", `paying customers by ${f.month(T.m1.k, true)}`, "Milestone 1", "All"),
      goal(f.usd(fund("Seed").size), "seed round", `${f.month(fund("Seed").k, true)}; team of ${team("Dec 2027").n} by December`, "Adi", true)
    ]), accViz(2027)),
    slide("s-2028", "2028", "New regions and Enterprise trust", yGoals(2028, [
      goal("3", "new regions open", "Australia, Canada and New Zealand, from January", "Bhaskar"),
      goal("SOC 2", "Type I in place by April", `for Enterprise procurement; team of ${team("Dec 2028").n} by December`, "Bharath")
    ]), arrViz(2028)),
    slide("s-2029", "2029", "Series A and the sales team", yGoals(2029, [
      goal(f.usd(fund("Series A").size), "Series A", `${f.month(fund("Series A").k, true)}; VP Sales from April`, "Adi", true),
      goal(String(team("Dec 2029").n), "people by December", "UK and India leads", "Adi")
    ]), arrViz(2029)),
    slide("s-2030", "2030", "Series B and scale", yGoals(2030, [
      goal(f.usd(fund("Series B").size), "Series B", f.month(fund("Series B").k, true), "Adi", true),
      goal(String(team("Dec 2030").n), "people by December", "Australia and Canada leads", "Adi")
    ]), arrViz(2030)),
    slide("s-2031", "2031", "The terminus", yGoals(2031, [
      goal("20", "Enterprise account executives", `from January; team of ${team("Dec 2031").n} by December`, "Adi")
    ]), arrViz(2031)),
    slide("s-monday", "Every Monday", `this month: ${f.month(nowRow.k, true)}`, [
      goal(f.num(nowRow.accounts), "paying accounts by month end", "", "Adi"),
      goal(f.num(nowRow.gross), "new customers this month", `${f.num(nowRow.proBuyers)} from the Pro webinar, ${f.few(nowRow.newEnt)} Enterprise`, "Adi"),
      goal(f.num(nowRow.proAtt / nowRow.webinars), "attendees each Pro webinar", "", "Bhaskar"),
      goal(f.num(nowRow.entAtt / nowRow.webinars), "attendees each Enterprise webinar", `${f.few(nowRow.calls)} calls this month`, "Bhaskar"),
      goal(f.num(nowRow.ch.cold.top / nowRow.webinars), "cold invites a week", `${f.full(nowRow.adSpend)} ad budget this month`, "Bhaskar")
    ], `<form class="viz tracker" onsubmit="return false"><h3>Where are we right now?</h3><label for="t-actual">Paying accounts today</label><input id="t-actual" type="number" inputmode="numeric" min="0" placeholder="0"><p class="verdict" id="t-verdict" aria-live="polite">Type a number to compare with today's point on the curve.</p></form>`),
    slide("s-reel", "The plan in 25 seconds", "", [], `<div class="reel"><video src="../assets/reel.mp4?v=10" poster="../assets/reel-poster.jpg?v=10" controls muted playsinline preload="metadata" aria-label="The Tantra plan reel"></video></div>`, true)
  ].join("");

  // Stations light up as the board moves past them: "here" is the slide under the middle of the screen
  const slides = [...document.querySelectorAll(".slide")];
  const light = () => {
    const mid = innerHeight / 2; let i = 0;
    slides.forEach((sl, j) => { if (sl.getBoundingClientRect().top < mid) i = j; });
    slides.forEach((sl, j) => { sl.classList.toggle("passed", j < i); sl.classList.toggle("here", j === i); });
  };
  addEventListener("scroll", light, { passive: true }); addEventListener("resize", light); light();

  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea, video, button")) return;
    const i = Math.max(0, slides.findIndex(s => s.classList.contains("here")));
    const go = n => slides[Math.max(0, Math.min(slides.length - 1, n))].scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    if (["ArrowDown", "PageDown", "j"].includes(e.key)) { e.preventDefault(); go(i + 1); }
    if (["ArrowUp", "PageUp", "k"].includes(e.key)) { e.preventDefault(); go(i - 1); }
  });

  // Monday tracker: compare today's count with today's point on the curve
  const input = document.getElementById("t-actual"), verdict = document.getElementById("t-verdict"), KEY = "tantra-vision-actual";
  const i0 = R.indexOf(nowRow), prev = R[i0 - 1], d = new Date();
  const frac = d.getDate() / new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const target = Math.round((prev ? prev.accounts : T.A.today) + (nowRow.accounts - (prev ? prev.accounts : T.A.today)) * frac);
  function judge() {
    const v = parseInt(input.value, 10);
    if (isNaN(v)) { verdict.textContent = "Type a number to compare with today's point on the curve."; verdict.className = "verdict"; return; }
    localStorage.setItem(KEY, v);
    const gap = v - target;
    verdict.textContent = gap >= 0 ? `On track: ${f.num(gap)} ahead of today's point on the curve (${f.num(target)}).` : `Behind by ${f.num(-gap)}: today's point on the curve is ${f.num(target)}. Name the stage that leaked.`;
    verdict.className = "verdict " + (gap >= 0 ? "ok" : "behind");
  }
  input.addEventListener("input", judge);
  if (localStorage.getItem(KEY) !== null) { input.value = localStorage.getItem(KEY); judge(); }
})();
