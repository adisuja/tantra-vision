(function () {
  const T = window.TANTRA, f = T.fmt, A = T.A, R = T.rows, MOVES = window.TANTRA_MOVES || {};
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const nowKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; })();
  const status = k => (k < nowKey ? "done" : k === nowKey ? "now" : "next");
  const last = R[R.length - 1];
  const YEARS = T.years_;

  /* ---------- Route line: the master timetable from today to the terminus ---------- */
  function route() {
    const host = $("#route");
    const s10 = T.firstArr(1e7), s50 = T.firstArr(5e7);
    const stops = [
      { k: "2026-11", t: "Today", s: "Nov 2026" },
      { k: "2026-12", t: "V4 live", s: "31 Dec 2026" },
      { k: T.m1.k, t: "500 paying", s: f.month(T.m1.k) },
      { k: "2027-10", t: "Seed $3M", s: "Oct 2027" },
      { k: s10.k, t: "$10M ARR", s: f.month(s10.k) },
      { k: "2029-03", t: "Series A $15M", s: "Mar 2029" },
      { k: "2030-06", t: "Series B $40M", s: "Jun 2030" },
      { k: s50.k, t: "$50M ARR", s: f.month(s50.k) },
      { k: last.k, t: "$100M ARR", s: "31 Dec 2031", term: true }
    ].sort((p, q) => (p.k < q.k ? -1 : p.k > q.k ? 1 : 0));
    // A line map, not a time axis: stations are evenly spaced so every name has room
    const W = 1240, H = 120, x0 = 50, x1 = W - 50, y = 40, gap = (x1 - x0) / (stops.length - 1);
    const st = k => (k === nowKey ? "now" : status(k));
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Route from November 2026 to $100M ARR in December 2031"><path class="track" d="M${x0} ${y}H${x1}"/><path class="run" d="M${x0} ${y}H${x1}" style="--len:${x1 - x0};--rest:0"/>`;
    stops.forEach((p, i) => {
      const x = x0 + i * gap, c = p.term ? "term" : st(p.k) === "done" ? "done" : "";
      svg += `<a href="#m-${p.k}" aria-label="${p.t}, ${p.s}"><circle class="stop ${c}" cx="${x}" cy="${y}" r="${p.term ? 13 : 10}"/><text class="lab" x="${x}" y="${y + 40}" text-anchor="middle">${p.t}</text><text class="sub" x="${x}" y="${y + 58}" text-anchor="middle">${p.s}</text></a>`;
    });
    svg += `<rect class="train" x="${x0 - 10}" y="${y - 8}" width="20" height="16" rx="4"/></svg>`;
    host.innerHTML = svg;
    $("#route-list").innerHTML = stops.map(p => `<li class="${p.term ? "term" : st(p.k)}"><b>${p.t}</b><span>${p.s}</span></li>`).join("");
    host.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      const k = a.getAttribute("href").slice(3); const tab = document.querySelector(`#months-tabs button[data-y="${k.slice(0, 4)}"]`);
      if (tab) tab.click();
    }));
  }

  /* ---------- Split flap for the headline ---------- */
  function flap(node, text) {
    node.innerHTML = [...text].map(c => `<span class="${/[0-9]/.test(c) ? "" : "sym"}">${c}</span>`).join("");
    node.setAttribute("aria-label", text);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [...node.querySelectorAll("span:not(.sym)")].forEach((s, i) => {
      const final = s.textContent; let n = 0; const turns = 8 + i * 4;
      const t = setInterval(() => { s.textContent = n >= turns ? final : String((+final + n + 1) % 10); if (++n > turns) clearInterval(t); }, 45);
    });
  }

  /* ---------- Tables and tabs ---------- */
  const table = (head, rows, opts = {}) => {
    const left = opts.left || [];
    const h = head.map((c, i) => `<th${i === 0 || left.includes(i) ? ' class="l"' : ""}>${c}</th>`).join("");
    const b = rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${r.cells.map((c, i) => `<td${i === 0 && opts.mo ? ' class="mo"' : left.includes(i) || i === 0 ? ' class="l"' : ""}>${c}</td>`).join("")}</tr>`).join("");
    return `<div class="tbl${opts.fit ? " fit" : ""}"><table><thead><tr>${h}</tr></thead><tbody>${b}</tbody>${opts.cap ? `<caption>${opts.cap}</caption>` : ""}</table></div>`;
  };
  function tabs(id, render) {
    const host = $("#" + id); if (!host) return;
    const bar = el("div", "tabs"); bar.setAttribute("role", "tablist"); bar.id = id + "-tabs"; bar.setAttribute("aria-label", "Year");
    const body = el("div"); body.setAttribute("role", "tabpanel");
    const first = YEARS.includes(+nowKey.slice(0, 4)) ? +nowKey.slice(0, 4) : YEARS[0];
    YEARS.forEach(y => {
      const b = el("button", "", String(y)); b.type = "button"; b.dataset.y = y; b.setAttribute("role", "tab");
      b.addEventListener("click", () => { bar.querySelectorAll("button").forEach(x => { x.setAttribute("aria-selected", x === b); x.tabIndex = x === b ? 0 : -1; }); body.innerHTML = render(y); });
      bar.appendChild(b);
    });
    bar.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const bs = [...bar.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
      const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
    host.append(bar, body);
    bar.querySelector(`[data-y="${first}"]`).click();
  }
  const rowsOf = y => R.filter(r => r.y === y);
  const cls = r => (r.k === nowKey ? "now" : "");

  /* ---------- Target breakdown ---------- */
  function target() {
    const selfArr = last.selfMrr * 12, entArr = last.entMrr * 12, tot = selfArr + entArr, Y31 = T.years[T.years.length - 1];
    $("#comp").innerHTML = `<div class="bars"><div class="seg" style="flex:${selfArr};background:var(--line)">${f.usd(selfArr)} self serve</div><div class="seg" style="flex:${entArr};background:var(--go)">${f.usd(entArr)}</div></div>
      <div class="k"><span><i style="background:var(--line)"></i>${f.num(last.self)} self serve accounts at ${f.full(last.arpa)} a month</span><span><i style="background:var(--go)"></i>${f.num(last.entOnPlatform)} Enterprise clients on the $${A.entPlatform} a month platform plan</span></div>`;
    $("#breakdown").innerHTML = table(["Line", "Accounts", "Price", "ARR, 31 Dec 2031", "Share"], [
      { cells: ["Self serve (Pro, Scale and funnel plans)", f.num(last.self), f.full(last.arpa) + " a month on average", f.full(selfArr), f.pct(selfArr / tot, 0)] },
      { cells: ["Enterprise platform plan, after the included year", f.num(last.entOnPlatform), f.full(A.entPlatform) + " a month", f.full(entArr), f.pct(entArr / tot, 0)] },
      { cls: "total", cells: ["Annual recurring revenue", f.num(last.self + last.entOnPlatform), "", f.full(tot), "100%"] }
    ], { fit: true, cap: `Not in ARR: Enterprise fees are one time (up to ${f.full(A.fee[2031])} in 2031, ${f.usd(Y31.feeRev)} that year from ${f.num(Y31.newEnt)} new clients, each including 12 months of the platform), and course sales are one time (${f.usd(Y31.courseRev)} in 2031). ${f.num(last.entYear1)} Enterprise clients are inside their prepaid year on 31 December 2031.` });
  }

  function yearly() {
    const cur = v => (v.y === +nowKey.slice(0, 4) ? "now" : "");
    $("#yearly").innerHTML = table(["Year end", "Paying accounts", "Self serve", "Enterprise clients", "On the platform plan", "Self serve average", "MRR", "ARR", "Growth"],
      T.years.map(v => ({ cls: cur(v), cells: [v.y, f.num(v.dec.accounts), f.num(v.dec.self), f.num(v.dec.ent), f.num(v.dec.entOnPlatform), f.full(v.dec.arpa), f.full(v.dec.mrr), `<b class="money">${f.usd(v.dec.arr)}</b>`, v.multiple && v.y > 2027 ? v.multiple.toFixed(1) + "x" : ""] })), { mo: true, cap: "2026 covers November and December only. ARR counts subscriptions only." });
    $("#yearly2").innerHTML = table(["Year", "New self serve buyers", "Lost to churn", "Churn a month (Dec)", "New Enterprise clients", "Enterprise fees", "Course sales", "Total revenue"],
      T.years.map(v => ({ cls: cur(v), cells: [v.y, f.num(v.proNeed), f.num(v.churned), f.pct(v.dec.churnRate), f.num(v.newEnt), f.usd(v.feeRev), f.usd(v.courseRev), `<b>${f.usd(v.revenue)}</b>`] })), { mo: true, cap: "Enterprise fees and course sales are one time. Total revenue adds subscription revenue earned in the year." });
  }


  /* ---------- Charts ---------- */
  function lineChart(host, pts, opt) {
    const W = Math.max(300, host.clientWidth - 36), H = W < 560 ? 240 : 300, P = { l: 52, r: 12, t: 14, b: 30 };
    const max = opt.max;
    const X = i => P.l + i / (pts.length - 1) * (W - P.l - P.r), Yv = v => H - P.b - v / max * (H - P.t - P.b);
    let g = `<g class="grid">${opt.ticks.map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${Yv(t)}" y2="${Yv(t)}"/>`).join("")}</g>`;
    g += `<g class="axis">${opt.ticks.map(t => `<text x="${P.l - 8}" y="${Yv(t) + 4}" text-anchor="end">${opt.fmtY(t)}</text>`).join("")}`;
    pts.forEach((p, i) => { if (p.k.endsWith("-01") && (W > 520 || +p.k.slice(0, 4) % 2)) g += `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${p.k.slice(0, 4)}</text>`; });
    g += "</g>";
    const d = pts.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Yv(p.v).toFixed(1)}`).join("");
    const area = `${d}L${X(pts.length - 1)} ${H - P.b}L${X(0)} ${H - P.b}Z`;
    const ni = pts.findIndex(p => p.k === nowKey);
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label}">${g}<path d="${area}" fill="var(--line)" opacity=".09"/><path d="${d}" fill="none" stroke="var(--line)" stroke-width="2.5" stroke-linejoin="round"/>${ni >= 0 ? `<circle cx="${X(ni)}" cy="${Yv(pts[ni].v)}" r="6" fill="var(--now)" stroke="var(--ink)" stroke-width="2"/>` : ""}<line class="xh" x1="0" x2="0" y1="${P.t}" y2="${H - P.b}" stroke="var(--ink)" stroke-dasharray="3 3" opacity="0"/><circle class="dot" r="5" fill="var(--line)" stroke="#fff" stroke-width="2" opacity="0"/><rect x="${P.l}" y="0" width="${W - P.l - P.r}" height="${H}" fill="transparent"/></svg><div class="tip"></div>`;
    const svg = host.querySelector("svg"), tip = host.querySelector(".tip"), xh = svg.querySelector(".xh"), dot = svg.querySelector(".dot");
    svg.addEventListener("pointermove", e => {
      const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round((sx - P.l) / (W - P.l - P.r) * (pts.length - 1))));
      const p = pts[i]; xh.setAttribute("x1", X(i)); xh.setAttribute("x2", X(i)); xh.setAttribute("opacity", 1);
      dot.setAttribute("cx", X(i)); dot.setAttribute("cy", Yv(p.v)); dot.setAttribute("opacity", 1);
      tip.innerHTML = opt.tip(p); tip.style.left = (X(i) / W * r.width + 18) + "px"; tip.style.top = (Yv(p.v) / H * r.height + 18) + "px"; tip.classList.add("on");
    });
    svg.addEventListener("pointerleave", () => { tip.classList.remove("on"); xh.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); });
  }

  function stackChart(host, pts, keys, opt) {
    const W = Math.max(300, host.clientWidth - 36), H = W < 560 ? 240 : 300, P = { l: 52, r: 12, t: 14, b: 30 };
    const bw = (W - P.l - P.r) / pts.length;
    const Yv = v => H - P.b - v / opt.max * (H - P.t - P.b);
    let g = `<g class="grid">${opt.ticks.map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${Yv(t)}" y2="${Yv(t)}"/>`).join("")}</g><g class="axis">${opt.ticks.map(t => `<text x="${P.l - 8}" y="${Yv(t) + 4}" text-anchor="end">${opt.fmtY(t)}</text>`).join("")}`;
    pts.forEach((p, i) => { if (p.k.endsWith("-01") && (W > 520 || +p.k.slice(0, 4) % 2)) g += `<text x="${P.l + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${p.k.slice(0, 4)}</text>`; });
    g += "</g>";
    let bars = "";
    pts.forEach((p, i) => {
      let acc = 0; const x = P.l + i * bw + 0.5;
      keys.forEach(kk => { const v = p[kk.id]; const y1 = Yv(acc + v), y0 = Yv(acc); bars += `<rect x="${x.toFixed(1)}" y="${(y1 + 1).toFixed(1)}" width="${Math.max(1, bw - 2).toFixed(1)}" height="${Math.max(0, y0 - y1 - 1).toFixed(1)}" rx="1" fill="${kk.color}"/>`; acc += v; });
      bars += `<rect class="hit" data-i="${i}" x="${(x - 0.5).toFixed(1)}" y="${P.t}" width="${bw.toFixed(1)}" height="${H - P.t - P.b}" fill="transparent"/>`;
    });
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label}">${g}${bars}</svg><div class="tip"></div>`;
    const svg = host.querySelector("svg"), tip = host.querySelector(".tip");
    svg.querySelectorAll(".hit").forEach(h => h.addEventListener("pointerenter", () => {
      const p = pts[+h.dataset.i], r = svg.getBoundingClientRect();
      tip.innerHTML = `<b>${f.month(p.k)}</b><br>` + keys.map(kk => `${kk.name}: ${f.num(p[kk.id])}`).join("<br>");
      tip.style.left = ((+h.getAttribute("x") + bw / 2) / W * r.width) + "px"; tip.style.top = "80px"; tip.classList.add("on");
    }));
    svg.addEventListener("pointerleave", () => tip.classList.remove("on"));
  }

  function monthlyArr(redraw) {
    lineChart($("#arr-chart"), R.map(r => ({ k: r.k, v: r.arr, r })), {
      max: 1e8, ticks: [0, 2.5e7, 5e7, 7.5e7, 1e8], fmtY: v => f.usd(v, 0), label: "ARR by month, November 2026 to December 2031",
      tip: p => `<b>${f.month(p.k)}</b><br>ARR ${f.usd(p.v)}<br>${f.num(p.r.accounts)} paying accounts`
    });
    if (!redraw) tabs("arr-tables", y => table(["Month", "Paying accounts", "Growth on last month", "Self serve", "Self serve churn", "Lost this month", "Enterprise clients", "On platform plan", "Self serve average", "MRR", "ARR", "Revenue this month"],
      rowsOf(y).map(r => ({ cls: cls(r), cells: [f.month(r.k), f.num(r.accounts), r.growth == null ? "" : f.pct(r.growth), f.num(r.self), f.pct(r.churnRate), f.num(r.churned), f.num(r.ent), f.few(r.entOnPlatform), f.full(r.arpa), f.full(r.mrr), `<b class="money">${f.usd(r.arr)}</b>`, f.full(r.revenue)] })), { mo: true, cap: "Revenue this month adds MRR, Enterprise fees and course sales." }));
  }

  function channels() {
    const C = A.channels;
    const per1000 = c => C[c].toReg * C[c].regAtt * 1000;
    $("#channel-rates").innerHTML = table(["Channel", "Top of funnel", "To registration", "Registration to attendee", "Attendees per 1,000 at the top", "Source"],
      ["cold", "organic", "ads"].map(c => ({ cells: [`<b>${C[c].name}</b><br><span class="small">${C[c].note}</span>`, C[c].unit, f.pct(C[c].toReg, 2), f.pct(C[c].regAtt), per1000(c).toFixed(1), C[c].src === "sheet" ? "Your 23 webinars, May to Oct 2025" : "Assumption: replace after 8 weeks"] })),
      { left: [5], cap: "Cold calendar registration to attendee reads high because accepted invites count as attendance without a registration: on 14 Aug 2025, 730 registrations and 886 attendees. Per person reached, cold outreach is the weakest channel by far." });
    const D = y => T.at(`${y}-12`), first = R[0], end = R[R.length - 1];
    $("#action-rates").innerHTML = table(["Webinar step", "Floor (2025 data)", "Dec 2027", "Dec 2029", "Dec 2031"], [
      { cells: ["Pro webinar: attendee to Pro buyer", f.pct(A.attBuy, 2), f.pct(D(2027).attBuy, 2), f.pct(D(2029).attBuy, 2), f.pct(D(2031).attBuy, 2)] },
      { cells: ["Enterprise webinar: attendee to booked call", f.pct(A.attCall, 2), f.pct(D(2027).attCall, 2), f.pct(D(2029).attCall, 2), f.pct(D(2031).attCall, 2)] },
      { cells: ["Enterprise call to deal", f.pct(A.close, 0), f.pct(D(2027).close, 1), f.pct(D(2029).close, 1), f.pct(D(2031).close, 1)] },
      { cells: ["Pro buyers who also buy the course", f.pct(A.courseShare), "Same", "Same", "Same"] }
    ], { cap: "The attendee to Pro buyer floor is set equal to the 2025 attendee to booked call rate, since no direct purchase data exists yet." });
    const coldPer = r => 1 / (r.ch.cold.toReg * r.ch.cold.regAtt * r.attBuy);
    $("#lift-note").innerHTML = `<b>What the 1% a month adds up to.</b> Each stage improves by 1% of itself a month from January 2027, and the stages multiply. Cold invites needed per Pro buyer fall from ${f.num(coldPer(first))} today to ${f.num(coldPer(end))} by December 2031, and the ad cost per customer falls from ${f.full(T.years[0].adCac)} in 2026 to ${f.full(T.years[T.years.length - 1].adCac)} in 2031, even with ad prices rising about 10% a year. Cold show-up is held flat at the 2025 figure, because accepted calendar invites inflate it.`;
    $("#mix").innerHTML = table(["Share of attendees", ...YEARS.map(String)], ["cold", "organic", "ads"].map(c => ({ cells: [C[c].name, ...YEARS.map(y => f.pct(A.mix[y][c], 0))] })), { cap: "Assumption: cold outreach carries the start; ads and content take over as budget and audience grow." });
  }

  function traffic(redraw) {
    const peak = Math.max(...R.map(r => r.att)), NICE = Math.ceil(peak / 15000) * 15000;
    const keys = [
      { id: "cold", name: "Cold outreach", color: "#6D4AFF" },
      { id: "organic", name: "Organic content", color: "#0E9AA7" },
      { id: "ads", name: "Paid ads", color: "#B57600" }
    ];
    stackChart($("#att-chart"), R.map(r => ({ k: r.k, cold: r.ch.cold.att, organic: r.ch.organic.att, ads: r.ch.ads.att })), keys, {
      max: NICE, ticks: [0, NICE / 3, NICE * 2 / 3, NICE], fmtY: v => f.big(v), label: "Webinar attendees needed each month, by channel"
    });
    $("#att-legend").innerHTML = keys.map(k => `<span><i style="background:${k.color};height:10px;width:10px;border-radius:2px;vertical-align:0"></i>${k.name}</span>`).join("");
    if (!redraw) tabs("traffic-tables", y => table(["Month", "Cold invites", "Organic page visits", "Content impressions", "Ad page visits", "Ad spend", "Registrations", "Attendees, Pro webinar", "Attendees, Enterprise webinar"],
      rowsOf(y).map(r => ({ cls: cls(r), cells: [f.month(r.k), f.num(r.ch.cold.top), f.num(r.ch.organic.top), f.big(r.ch.organic.imp), f.num(r.ch.ads.top), f.full(r.adSpend), f.num(r.regs), f.num(r.proAtt), f.num(r.entAtt)] })), { mo: true }) +
      table(["Month", "Pro buyers from webinars", "From workshop series", "Course sales", "Enterprise calls", "Enterprise deals", "Attendees a Pro webinar", "Attendees an Enterprise webinar", "Cold invites a week"],
      rowsOf(y).map(r => ({ cls: cls(r), cells: [f.month(r.k), f.num(r.proBuyers), f.few(r.wsBuyers), f.few(r.courses), f.few(r.calls), f.few(r.newEnt), f.num(r.proAtt / r.webinars), f.num(r.entAtt / r.webinars), f.num(r.ch.cold.top / r.webinars)] })), { mo: true }));
  }

  const WHO = { adi: "Adi", bharath: "Bharath", bhaskar: "Bhaskar", team: "All", hire: "Hire" };
  /* Shared ticks: one list for the whole team, stored by the tantra-plan-ticks Worker; this browser keeps a copy for offline reading */
  const TICKS = "https://tantra-plan-ticks.growthcluborg.workers.dev";
  const DONE_KEY = "tantra-plan-ticks-cache", NAME_KEY = "tantra-plan-name";
  let ticks = JSON.parse(localStorage.getItem(DONE_KEY) || "{}");   // id -> { by, at }
  const done = { has: id => !!ticks[id] };
  const byLine = id => ticks[id] ? `<span class="by">${ticks[id].by}, ${new Date(ticks[id].at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>` : "";
  const task = (who, txt, id) => `<li><label class="chk"><input type="checkbox" data-task="${id}"${done.has(id) ? " checked" : ""}><span class="who ${who}">${WHO[who]}</span><span class="tx">${txt}${byLine(id)}</span></label></li>`;
  function monthBlock(r) {
    const t = [];
    const id = i => `m:${r.k}:${i}`;
    (MOVES[r.k] || []).forEach(([w, x], i) => t.push(task(w, x, id("move" + i))));
    t.push(task("bhaskar", `Send ${f.num(r.ch.cold.top)} cold invites (${f.num(r.ch.cold.top / r.webinars)} a week) for ${f.num(r.ch.cold.regs)} registrations.`, id("cold")));
    t.push(task("bhaskar", `Drive ${f.num(r.ch.organic.top)} page visits from content (${f.big(r.ch.organic.imp)} impressions) and ${f.num(r.ch.ads.top)} from ads on a ${f.full(r.adSpend)} budget.`, id("visits")));
    t.push(task(r.k < "2027-07" ? "adi" : "team", `Pro webinar: ${f.num(r.proAtt / r.webinars)} attendees a week, ${f.num(r.proBuyers)} Pro buyers and ${f.few(r.courses)} course ${Math.round(r.courses) === 1 ? "sale" : "sales"} this month.`, id("pro")));
    t.push(task("adi", `Enterprise webinar: ${f.num(r.entAtt / r.webinars)} attendees a week, ${f.few(r.calls)} calls, ${f.few(r.newEnt)} new clients at ${f.full(r.fee)} each${r.converting > 0.05 ? `; ${f.few(r.converting)} move onto the platform plan` : ""}.`, id("ent")));
    if (r.series > 0) t.push(task("adi", `Workshop series: ${r.series} this month, about ${f.few(r.wsBuyers)} buyers.`, id("ws")));
    t.push(task("team", `Month end: ${f.num(r.accounts)} paying accounts and ${f.usd(r.arr)} ARR.`, id("out")));
    const st = status(r.k);
    return `<div class="month ${st}" id="m-${r.k}"><div class="when"><i class="mark" aria-hidden="true"></i><b>${f.month(r.k, true)}</b><span>${st === "now" ? "This month" : st === "done" ? "Passed" : ""}</span></div>
      <div><div class="outs"><div><b>${f.num(r.accounts)}</b>paying accounts</div><div><b class="money">${f.usd(r.arr)}</b>ARR</div><div><b>${f.num(r.gross)}</b>new customers</div><div><b>${f.few(r.newEnt)}</b>Enterprise clients</div><div><b>${f.full(r.revenue)}</b>revenue</div>${r.growth == null ? "" : `<div><b>${f.pct(r.growth)}</b>growth</div>`}</div>
      <ul class="tasks">${t.join("")}</ul></div></div>`;
  }
  function months() { tabs("months", y => `<div class="months">${rowsOf(y).map(monthBlock).join("")}</div>`); }


  /* ---------- Week by week: every week's milestones, checks and targets, each one checkable ---------- */
  const DATED = window.TANTRA_DATED || [];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const WEEKS = (() => {
    const out = []; let d = new Date(2026, 10, 2);   // Monday 2 November 2026
    const end = new Date(2031, 11, 31);
    while (d <= end) {
      const mon = new Date(d), sun = new Date(d); sun.setDate(sun.getDate() + 6);
      const thu = new Date(d); thu.setDate(thu.getDate() + 3);
      const k = `${thu.getFullYear()}-${String(thu.getMonth() + 1).padStart(2, "0")}`;
      out.push({ mon, sun, k, y: thu.getFullYear(), id: iso(mon) });
      d.setDate(d.getDate() + 7);
    }
    return out;
  })();
  // Paying accounts on a date: straight line between month ends
  const accountsOn = date => {
    const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const r = T.at(k); if (!r) return last.accounts;
    const i = R.indexOf(r), p = R[i - 1];
    const dim = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const p0 = p ? p.accounts : A.today;
    return p0 + (r.accounts - p0) * (date.getDate() / dim);
  };
  const short = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  function weekBlock(w) {
    const r = T.at(w.k), wk = r.webinars, t = [];
    const id = x => `w:${w.id}:${x}`;
    DATED.filter(([d]) => d >= w.id && d <= iso(w.sun)).forEach(([d, who, x], i) => t.push(task(who, `<b>${short(new Date(d + "T00:00:00"))}:</b> ${x}`, id("d" + i))));
    // ARR thresholds land in the last week of the month they are first crossed
    [[1e6, "$1M"], [1e7, "$10M"], [5e7, "$50M"]].forEach(([v, l], i) => { const m = T.firstArr(v); const lastWeekOfMonth = WEEKS.filter(x => x.k === m.k).pop(); if (lastWeekOfMonth && lastWeekOfMonth.id === w.id) t.push(task("team", `<b>Milestone:</b> ${l} ARR this month.`, id("arr" + i))); });
    if (w.id === WEEKS.filter(x => x.k === w.k)[0].id) (MOVES[w.k] || []).forEach(([who, x], i) => t.push(task(who, x, id("m" + i))));
    if (w.id >= "2026-11-09") {   // the week of 2 November sets up; the webinars start on 9 November
      t.push(task("adi", `Enterprise webinar: ${f.num(r.entAtt / wk)} attendees, ${f.few(r.calls / wk)} calls booked.`, id("ent")));
      t.push(task(w.k < "2027-07" ? "adi" : "team", `Pro webinar: ${f.num(r.proAtt / wk)} attendees, ${f.few(r.proBuyers / wk)} Pro buyers.`, id("pro")));
      t.push(task("bhaskar", `${f.num(r.ch.cold.top / wk)} cold invites, ${f.num((r.ch.organic.top + r.ch.ads.top) / wk)} page visits from content and ads (${f.full(r.adSpend / wk)} of ads).`, id("traffic")));
    }
    t.push(task("team", `Sunday ${short(w.sun)}: ${f.num(accountsOn(w.sun))} paying accounts.`, id("out")));
    const ids = t.map(x => x.match(/data-task="([^"]+)"/)[1]);
    const n = ids.filter(x => done.has(x)).length;
    const st = iso(w.sun) < iso(new Date()) ? "done" : (w.id <= iso(new Date()) ? "now" : "next");
    return `<div class="week ${st}" id="wk-${w.id}"><div class="when"><i class="mark" aria-hidden="true"></i><b>${short(w.mon)} to ${short(w.sun)}</b><span class="wk-count" data-week="${w.id}">${n} of ${ids.length} done</span></div><ul class="tasks">${t.join("")}</ul></div>`;
  }
  function weeks() {
    tabs("weeks", y => {
      const ws = WEEKS.filter(w => w.y === y), months = [...new Set(ws.map(w => w.k))];
      return months.map(k => `<details class="wk-month" ${k === nowKey || (y > +nowKey.slice(0, 4) && k === months[0]) ? "open" : ""}><summary><b>${f.month(k, true)}</b><span class="small">${ws.filter(w => w.k === k).length} weeks</span></summary>${ws.filter(w => w.k === k).map(weekBlock).join("")}</details>`).join("");
    });
  }
  // Paint the shared state onto whatever is on screen
  function applyTicks() {
    document.querySelectorAll("input[data-task]").forEach(c => {
      const id = c.dataset.task; if (c.dataset.busy) return;
      c.checked = !!ticks[id];
      const tx = c.parentElement.querySelector(".tx"); const old = tx.querySelector(".by"); if (old) old.remove();
      if (ticks[id]) tx.insertAdjacentHTML("beforeend", byLine(id));
    });
    document.querySelectorAll(".week").forEach(wkEl => { const all = wkEl.querySelectorAll("input[data-task]"); wkEl.querySelector(".wk-count").textContent = `${[...all].filter(x => x.checked).length} of ${all.length} done`; });
  }
  const tickStatus = (t, bad) => document.querySelectorAll(".tick-status").forEach(e => { e.textContent = t; e.classList.toggle("bad", !!bad); });
  async function pull() {
    try {
      const r = await fetch(TICKS + "/ticks", { cache: "no-store" });
      ticks = (await r.json()).ticks || {};
      localStorage.setItem(DONE_KEY, JSON.stringify(ticks));
      applyTicks(); tickStatus(`Shared with the team. Updated ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`);
    } catch (e) { tickStatus("Offline: showing the last saved ticks.", true); }
  }
  // Your name goes on every tick you make
  document.querySelectorAll(".tick-name").forEach(inp => {
    inp.value = localStorage.getItem(NAME_KEY) || "";
    inp.addEventListener("input", () => { localStorage.setItem(NAME_KEY, inp.value.trim()); document.querySelectorAll(".tick-name").forEach(o => { if (o !== inp) o.value = inp.value; }); });
  });
  document.addEventListener("change", async e => {
    const c = e.target.closest("input[data-task]"); if (!c) return;
    const name = (localStorage.getItem(NAME_KEY) || "").trim();
    if (!name) {
      c.checked = !c.checked;
      const box = c.closest(".part")?.querySelector(".tick-name") || document.querySelector(".tick-name");
      tickStatus("Add your name above first, so the team can see who ticked it.", true); box.focus(); return;
    }
    const id = c.dataset.task, want = c.checked;
    c.dataset.busy = "1";
    try {
      const r = await fetch(TICKS + "/tick", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done: want, by: name }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Not saved");
      if (want) ticks[id] = { by: j.by, at: j.at }; else delete ticks[id];
      localStorage.setItem(DONE_KEY, JSON.stringify(ticks));
      tickStatus(want ? `Ticked as ${name}.` : `Unticked by ${name}.`);
    } catch (err) { c.checked = !want; tickStatus(`Not saved: ${err.message}. Try again.`, true); }
    delete c.dataset.busy; applyTicks();
  });
  pull();
  setInterval(() => { if (!document.hidden) pull(); }, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });

  /* ---------- Deal platform launch: separate from the revenue model ---------- */
  function deals() {
    const D = window.TANTRA_DEALS; if (!D || !$("#deals-sec")) return;
    const ps = D.platforms, types = [...new Set(ps.map(p => p.type))];
    $("#deal-goal").innerHTML = `<div class="board">
      <div><b class="num">${f.num(D.goal)}</b><span>conversions across every deal platform by ${D.goalDate}</span></div>
      <div><b class="num">${ps.length}</b><span>platforms to apply to, ${ps.filter(p => p.status === "Active").length} confirmed active</span></div>
      <div><b class="num">${types.length}</b><span>kinds of platform, one offer for each kind</span></div>
      <div><b class="num">$0</b><span>counted in ARR or the revenue model</span></div></div>`;
    $("#deal-offers").innerHTML = table(["Offer", "Where", "Price", "What is included"], D.offers.map(o => ({ cells: [`<b>${o.name}</b>`, o.where, o.price, o.includes] })), { left: [1, 2, 3], fit: true, cap: D.offerNote });
    $("#deal-split").innerHTML = table(["Kind of platform", "Platforms", "Offer", "Conversion goal"], D.split.map(x => ({ cells: [x.type, ps.filter(p => p.type === x.type).length, x.offer, f.num(x.goal)] })).concat([{ cls: "total", cells: ["All platforms", ps.length, "", f.num(D.goal)] }]), { fit: true, cap: "The split is an assumption. Track real conversions per platform and move effort to the ones that sell." });
    $("#deal-waves").innerHTML = table(["Wave", "When", "What goes live", "Owner"], D.waves.map(w => ({ cells: [w.name, w.when, w.what, w.owner] })), { left: [2], fit: true });
    const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const box = (id, label) => `<label class="chk deal-chk"><input type="checkbox" data-task="${id}"${done.has(id) ? " checked" : ""}><span class="tx">${label}${byLine(id)}</span></label>`;
    $("#deal-closed").textContent = D.closed;
    tabsBy("deal-list", types, ty => table(["Platform", "Offer", "Their cut", "Status", "Wave", "Applied", "Live"],
      ps.filter(p => p.type === ty).map(p => ({ cells: [`<a href="${p.url}" target="_blank" rel="noopener">${p.name}</a><br><span class="small">${p.note || ""}</span>`, p.offer, p.cut, p.status, p.wave,
        box(`m:deal:${slug(p.name)}:applied`, `<a href="${p.submit}" target="_blank" rel="noopener">Apply</a>`), box(`m:deal:${slug(p.name)}:live`, "Live")] })), { left: [1, 2, 3] }));
  }
  // Tabs keyed by any list of labels (the year tabs use YEARS)
  function tabsBy(id, keys, render) {
    const host = $("#" + id); if (!host) return;
    const bar = el("div", "tabs"); bar.setAttribute("role", "tablist"); bar.setAttribute("aria-label", "Kind of platform");
    const body = el("div"); body.setAttribute("role", "tabpanel");
    keys.forEach((k, i) => {
      const b = el("button", "", k); b.type = "button"; b.setAttribute("role", "tab");
      b.addEventListener("click", () => { bar.querySelectorAll("button").forEach(x => x.setAttribute("aria-selected", x === b)); body.innerHTML = render(k); applyTicks && applyTicks(); });
      bar.appendChild(b); if (!i) setTimeout(() => b.click());
    });
    host.append(bar, body);
  }

  function money() {
    $("#team").innerHTML = table(["Date", "People", "Who joins"], T.team.map(t => ({ cells: [t.q, t.n, t.adds] })), { left: [2], mo: true });
    $("#funding").innerHTML = table(["Round", "When", "Size", "ARR that month", "Paying accounts", "Use"], T.funding.map(x => { const r = T.at(x.k); return { cells: [x.round, f.month(x.k), f.usd(x.size), f.usd(r.arr), f.num(r.accounts), x.use] }; }), { left: [5], cap: "Sizes are planning figures. Confirm them once monthly burn and cash are filled in." });
    $("#budget").innerHTML = table(["Year", "Ad spend", "Cost a page visit", "Ad cost per customer", "Months to pay it back", "Cold invites", "Content impressions", "Webinar attendees", "Total revenue"], T.years.map(v => ({ cells: [v.y, f.full(v.adSpend), "$" + A.cpv[v.y].toFixed(2), f.full(v.adCac), v.payback.toFixed(1), f.big(v.cold), f.big(v.imp), f.num(v.att), f.usd(v.revenue)] })), { mo: true, cap: `Ad cost per customer is ad spend divided by the customers the ads share of attendees produces. Payback uses the December self serve average at ${f.pct(A.margin, 0)} gross margin. Cold outreach and content costs sit in team cost.` });
    $("#planmix").innerHTML = table(["Year end", "Pro at $" + A.prices.pro, "Scale at $" + A.prices.scale, "Funnel plan at $" + A.prices.funnel, "From the mix", "In the model"], A.planMix.map(m => { const avg = m.pro * A.prices.pro + m.scale * A.prices.scale + m.funnel * A.prices.funnel; return { cells: [m.y, f.pct(m.pro, 0), f.pct(m.scale, 0), f.pct(m.funnel, 0), f.full(avg), f.full(T.at(`${m.y}-12`).arpa)] }; }), { mo: true, cap: "Assumption. The funnel plan launches with V4; the 2.7 in 100 buy rate was set for the $99 offer, so test it on each plan before relying on the mix.", fit: true });
  }

  function retention() {
    const bands = [["Under $300k ARR", A.churnBands[0][1], "ChartMogul median, companies under $300k ARR"], ["$300k to $1M", A.churnBands[1][1], "Between the two ChartMogul bands"], ["$1M to $3M", A.churnBands[2][1], "ChartMogul median"], ["$3M to $8M", A.churnBands[3][1], "Between the two ChartMogul bands"], ["Above $8M", A.churnBands[4][1], "ChartMogul median; also its median for $100 to $250 a month plans"]];
    $("#churn-bands").innerHTML = table(["Tantra ARR", "Churn a month", "Kept after 12 months", "Source"], bands.map(b => ({ cells: [b[0], f.pct(b[1]), f.pct(Math.pow(1 - b[1], 12), 0), b[2]] })), { left: [3], fit: true });
    $("#ent-retention").innerHTML = table(["Enterprise step", "Rate", "Source"], [
      { cells: ["Year one", "Prepaid inside the one time fee", "The Enterprise offer: fee includes 12 months of the platform"] },
      { cells: ["Move onto the platform plan at month 13", f.pct(A.entConvert, 0) + " at $" + A.entPlatform + " a month", "Assumption"] },
      { cells: ["Leave after that", f.pct(A.entChurn) + " a month", "ChartMogul median for plans above $500 a month"] }
    ], { left: [1, 2], fit: true });
  }

  // Charts redraw at the new width when the window changes size
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { monthlyArr(true); traffic(true); }, 200); });
  route();
  flap($("#flap"), "$100M");
  target(); yearly(); retention(); monthlyArr(); channels(); traffic(); months(); weeks(); money(); deals();

  const links = [...document.querySelectorAll(".p-toc a")];
  const secs = [...document.querySelectorAll("[data-toc]")];
  const mark = () => {
    const line = innerHeight * 0.3; let cur = secs[0];
    secs.forEach(sct => { if (sct.getBoundingClientRect().top < line) cur = sct; });
    links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + cur.id));
  };
  addEventListener("scroll", mark, { passive: true }); mark();
})();
