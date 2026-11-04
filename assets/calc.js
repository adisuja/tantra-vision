/* Revenue calculator: every KPI of the funnel equations (webinar, reverse squeeze page, workshop series),
   six stages from traffic to the next 52 weeks, then revenue. Inputs are KPIs; computed numbers can be typed over. */
(function () {
  const $ = s => document.querySelector(s);
  const P = x => x / 100;

  /* ---------- Funnel shapes: the same maths, the stage 2 to 4 events renamed (from the funnel equations) ---------- */
  const SHAPES = {
    webinar: { name: "Webinar", att: "Attendees", attS: "A", s2: ["PAR", "Page-to-Attendee Rate", "attendees who signed up on the page ÷ page visits"], s3: ["SUR", "Show-Up Rate", "attendees ÷ registrants"], s4base: "attendees", live: "the live webinar" },
    rsp: { name: "Reverse squeeze page", att: "Half-watchers", attS: "HW", s2: ["HWR", "Half-Watch Rate", "watched more than half on first visit ÷ page visits"], s3: ["NHWR", "Nurtured Half-Watch Rate", "people brought past halfway ÷ remindable people"], s4base: "half-watchers", live: "the video" },
    workshop: { name: "Workshop series", att: "1.5-day attendees", attS: "DA", s2: ["PDHR", "Page-to-Day-and-a-Half Rate", "page sign-ups who attended 1.5+ days ÷ page visits"], s3: ["DHR", "Day-and-a-Half Rate", "attended 1.5+ days ÷ registrants"], s4base: "day-and-a-half attendees", live: "the workshop" }
  };

  /* ---------- Nodes. kind: in = a KPI you set; calc = computed, and can be typed over. fmt: pct num usd ---------- */
  const N = [];
  const add = (stage, group, id, code, name, def, kind, fmt, val) => N.push({ stage, group, id, code, name, def, kind, fmt, val });
  const I = (s, g, id, code, name, def, fmt, v) => add(s, g, id, code, name, def, "in", fmt, v);
  const C = (s, g, id, code, name, def, fmt, f) => add(s, g, id, code, name, def, "calc", fmt, f);

  // Stage 1: Traffic
  I(1, "Cold email", "PE", "PE", "People Emailed", "people sent the cold email", "num", 15000);
  I(1, "Cold email", "EDR", "EDR", "Email Delivery Rate", "emails delivered ÷ emails sent", "pct", 97);
  I(1, "Cold email", "EOR", "EOR", "Email Open Rate", "people who opened ÷ people who received it", "pct", 40);
  I(1, "Cold email", "ELCR", "ELCR", "Email Link Click Rate", "people who clicked ÷ people who opened", "pct", 2);
  I(1, "Calendar invites", "CIS", "CIS", "Calendar Invites Sent", "invites sent", "num", 166400);
  I(1, "Calendar invites", "IDR", "IDR", "Invite Delivery Rate", "invites delivered ÷ invites sent", "pct", 98);
  I(1, "Calendar invites", "ICR", "ICR", "Invite Click Rate", "clicks on the invite link ÷ invites delivered", "pct", 1.5);
  I(1, "LinkedIn outreach", "LRS", "LRS", "LinkedIn Requests Sent", "connection requests", "num", 2400);
  I(1, "LinkedIn outreach", "LAR", "LAR", "LinkedIn Acceptance Rate", "requests accepted ÷ requests sent", "pct", 32);
  I(1, "LinkedIn outreach", "LMR", "LMR", "LinkedIn Message Rate", "people messaged ÷ people who accepted", "pct", 90);
  I(1, "LinkedIn outreach", "LCR", "LCR", "LinkedIn Click Rate", "link clicks ÷ people messaged", "pct", 8);
  I(1, "WhatsApp invites", "WMS", "WMS", "WhatsApp Messages Sent", "invite messages sent from linked accounts", "num", 1000);
  I(1, "WhatsApp invites", "WMDR", "WMDR", "WhatsApp Message Delivery Rate", "delivered ÷ sent", "pct", 95);
  I(1, "WhatsApp invites", "WMRR", "WMRR", "WhatsApp Message Read Rate", "read ÷ delivered", "pct", 85);
  I(1, "WhatsApp invites", "WMCR", "WMCR", "WhatsApp Message Click Rate", "link clicks ÷ messages read", "pct", 5);
  I(1, "Paid ads", "ASP", "ASP", "Ad Spend", "spend for this webinar", "usd", 4100);
  I(1, "Paid ads", "CPM", "CPM", "Cost per Thousand Impressions", "ad spend ÷ impressions × 1,000", "usd", 25);
  C(1, "Paid ads", "AI", "AI", "Ad Impressions", "ad spend ÷ CPM × 1,000", "num", v => v.CPM ? v.ASP / v.CPM * 1000 : 0);
  I(1, "Paid ads", "ACTR", "ACTR", "Ad Click-Through Rate", "ad clicks ÷ impressions", "pct", 0.85);
  I(1, "Paid ads", "APVR", "APVR", "Ad Page View Rate", "page views ÷ ad clicks", "pct", 85);
  I(1, "Posts", "PI", "PI", "Post Impressions", "impressions of posts that link to the page", "num", 200000);
  I(1, "Posts", "PLCR", "PLCR", "Post Link Click Rate", "link clicks ÷ post impressions", "pct", 1.5);
  I(1, "Every channel", "PLR", "PLR", "Page Load Rate", "page visits ÷ link clicks (set by page speed)", "pct", 90);
  C(1, "Page visits by channel", "VRCE", "VRCE", "Visit Rate, Cold Email", "EDR × EOR × ELCR × PLR", "pct", v => v.EDR * v.EOR * v.ELCR * v.PLR);
  C(1, "Page visits by channel", "VRCI", "VRCI", "Visit Rate, Calendar Invites", "IDR × ICR × PLR", "pct", v => v.IDR * v.ICR * v.PLR);
  C(1, "Page visits by channel", "VRL", "VRL", "Visit Rate, LinkedIn", "LAR × LMR × LCR × PLR", "pct", v => v.LAR * v.LMR * v.LCR * v.PLR);
  C(1, "Page visits by channel", "VRW", "VRW", "Visit Rate, WhatsApp", "WMDR × WMRR × WMCR × PLR", "pct", v => v.WMDR * v.WMRR * v.WMCR * v.PLR);
  C(1, "Page visits by channel", "VRA", "VRA", "Visit Rate, Ads", "ACTR × APVR", "pct", v => v.ACTR * v.APVR);
  C(1, "Page visits by channel", "VRP", "VRP", "Visit Rate, Posts", "PLCR × PLR", "pct", v => v.PLCR * v.PLR);
  C(1, "Page visits by channel", "PVE", "PV", "Page visits from cold email", "PE × VRCE", "num", v => v.PE * v.VRCE);
  C(1, "Page visits by channel", "PVC", "PV", "Page visits from calendar invites", "CIS × VRCI", "num", v => v.CIS * v.VRCI);
  C(1, "Page visits by channel", "PVL", "PV", "Page visits from LinkedIn", "LRS × VRL", "num", v => v.LRS * v.VRL);
  C(1, "Page visits by channel", "PVW", "PV", "Page visits from WhatsApp", "WMS × VRW", "num", v => v.WMS * v.VRW);
  C(1, "Page visits by channel", "PVA", "PV", "Page visits from ads", "AI × VRA", "num", v => v.AI * v.VRA);
  C(1, "Page visits by channel", "PVP", "PV", "Page visits from posts", "PI × VRP", "num", v => v.PI * v.VRP);
  C(1, "Stage result", "REACH", "Reach", "People reached", "PE + CIS + LRS + WMS + AI + PI", "num", v => v.PE + v.CIS + v.LRS + v.WMS + v.AI + v.PI);
  C(1, "Stage result", "PV", "PV", "Page Visits", "the sum of every channel's page visits", "num", v => v.PVE + v.PVC + v.PVL + v.PVW + v.PVA + v.PVP);
  C(1, "Stage result", "VR", "VR", "Visit Rate", "page visits ÷ people reached, across every channel", "pct", v => v.REACH ? v.PV / v.REACH : 0);

  // Stage 2: Landing and sign-up
  I(2, "The page", "PSR", "PSR", "Page Stay Rate", "visits that stayed 10 seconds or more ÷ page visits", "pct", 70);
  I(2, "The page", "FVR", "FVR", "Form View Rate", "people who scrolled to the form ÷ people who stayed", "pct", 60);
  I(2, "The page", "FSR", "FSR", "Form Start Rate", "people who started the form ÷ people who saw it", "pct", 40);
  I(2, "The page", "FCR", "FCR", "Form Completion Rate", "people who submitted ÷ people who started", "pct", 60);
  C(2, "The page", "RR", "RR", "Registration Rate", "PSR × FVR × FSR × FCR: the landing page conversion rate", "pct", v => v.PSR * v.FVR * v.FSR * v.FCR);
  C(2, "The page", "PSU", "PSU", "Page Sign-Ups", "PV × RR", "num", v => v.PV * v.RR);
  I(2, "Thank you page", "TAR", "TAR", "Thank You Action Rate", "people who did the action ÷ people who saw the thank you page", "pct", 50);
  I(2, "Thank you page", "NASR", "NASR", "No-Action Show Rate", "show-up of page sign-ups who skipped the action", "pct", 30);
  I(2, "Thank you page", "ASR", "ASR", "Action Show Rate", "show-up of page sign-ups who added to calendar or joined WhatsApp", "pct", 55);
  C(2, "Thank you page", "PSSR", "PSSR", "Page Sign-Up Show Rate", "NASR × (1 − TAR) + ASR × TAR", "pct", v => v.NASR * (1 - v.TAR) + v.ASR * v.TAR);
  I(2, "Auto-registrants: calendar", "YR", "YR", "Yes Rate", "Yes ÷ invites delivered", "pct", 1.9);
  I(2, "Auto-registrants: calendar", "MR", "MR", "Maybe Rate", "Maybe ÷ invites delivered", "pct", 1);
  C(2, "Auto-registrants: calendar", "CSU", "CSU", "Calendar Sign-Ups", "CIS × IDR × (YR + MR)", "num", v => v.CIS * v.IDR * (v.YR + v.MR));
  I(2, "Auto-registrants: email", "ERR", "ERR", "Email Reply Rate", "people who replied ÷ people who received the email", "pct", 1.4);
  I(2, "Auto-registrants: email", "EIS", "EIS", "Email Interested Share", "interested replies ÷ all email replies", "pct", 50);
  C(2, "Auto-registrants: email", "ESU", "ESU", "Email Sign-Ups", "PE × EDR × ERR × EIS", "num", v => v.PE * v.EDR * v.ERR * v.EIS);
  I(2, "Auto-registrants: LinkedIn", "LRR", "LRR", "LinkedIn Reply Rate", "people who replied ÷ people messaged", "pct", 15);
  I(2, "Auto-registrants: LinkedIn", "LIS", "LIS", "LinkedIn Interested Share", "interested replies ÷ all LinkedIn replies", "pct", 40);
  C(2, "Auto-registrants: LinkedIn", "LSU", "LSU", "LinkedIn Sign-Ups", "LRS × LAR × LMR × LRR × LIS", "num", v => v.LRS * v.LAR * v.LMR * v.LRR * v.LIS);
  I(2, "Auto-registrants: WhatsApp", "WMRP", "WRPR", "WhatsApp Reply Rate", "people who replied ÷ messages read", "pct", 8);
  I(2, "Auto-registrants: WhatsApp", "WMIS", "WIS", "WhatsApp Interested Share", "interested replies ÷ all WhatsApp replies", "pct", 40);
  C(2, "Auto-registrants: WhatsApp", "WSU", "WSU", "WhatsApp Sign-Ups", "WMS × WMDR × WMRR × WRPR × WIS", "num", v => v.WMS * v.WMDR * v.WMRR * v.WMRP * v.WMIS);
  I(2, "Auto-registrants: inbound", "PER", "PER", "Post Engagement Rate", "likes, comments and shares ÷ post impressions", "pct", 3);
  I(2, "Auto-registrants: inbound", "IMR", "IMR", "Inbound Message Rate", "inbound messages ÷ engagements", "pct", 2);
  I(2, "Auto-registrants: inbound", "IRR", "IRR", "Inbound Registration Rate", "inbound people registered ÷ inbound messages", "pct", 40);
  C(2, "Auto-registrants: inbound", "ISU", "ISU", "Inbound Sign-Ups", "PI × PER × IMR × IRR", "num", v => v.PI * v.PER * v.IMR * v.IRR);
  C(2, "Stage result", "AR", "AR", "Auto-Registrants", "CSU + ESU + LSU + WSU + ISU", "num", v => v.CSU + v.ESU + v.LSU + v.WSU + v.ISU);
  C(2, "Stage result", "R", "R", "Registrants", "PV × RR + AR", "num", v => v.PSU + v.AR);
  C(2, "Stage result", "PAR", "PAR", "", "RR × PSSR", "pct", v => v.RR * v.PSSR);

  // Stage 3: Reminders and nurture
  I(3, "Direct", "DJR", "DJR", "Direct Join Rate", "joined without clicking any reminder ÷ registrants", "pct", 15);
  I(3, "Email reminders", "REDR", "REDR", "Reminder Email Delivery Rate", "delivered ÷ sent", "pct", 98);
  I(3, "Email reminders", "REOR", "REOR", "Reminder Email Open Rate", "people who opened a reminder ÷ people who got one", "pct", 45);
  I(3, "Email reminders", "EJCR", "EJCR", "Email Join Click Rate", "joined from an email link ÷ people who opened", "pct", 25);
  C(3, "Email reminders", "EJ", "EJ", "Email Joins", "REDR × REOR × EJCR", "pct", v => v.REDR * v.REOR * v.EJCR);
  I(3, "WhatsApp reminders", "WOR", "WOR", "WhatsApp Opt-In Rate", "people who opted in ÷ registrants", "pct", 60);
  I(3, "WhatsApp reminders", "WDR", "WDR", "WhatsApp Delivery Rate", "delivered ÷ sent", "pct", 97);
  I(3, "WhatsApp reminders", "WRR", "WRR", "WhatsApp Read Rate", "read ÷ delivered", "pct", 90);
  I(3, "WhatsApp reminders", "WJCR", "WJCR", "WhatsApp Join Click Rate", "joined from a WhatsApp link ÷ people who read", "pct", 25);
  C(3, "WhatsApp reminders", "WJ", "WJ", "WhatsApp Joins", "WOR × WDR × WRR × WJCR", "pct", v => v.WOR * v.WDR * v.WRR * v.WJCR);
  I(3, "SMS reminders", "SRR", "SRR", "SMS Reach Rate", "registrants with a phone and text consent ÷ registrants", "pct", 50);
  I(3, "SMS reminders", "SDR", "SDR", "SMS Delivery Rate", "delivered ÷ sent", "pct", 98);
  I(3, "SMS reminders", "SJCR", "SJCR", "SMS Join Click Rate", "joined from a text link ÷ texts delivered", "pct", 10);
  C(3, "SMS reminders", "SJ", "SJ", "SMS Joins", "SRR × SDR × SJCR", "pct", v => v.SRR * v.SDR * v.SJCR);
  I(3, "AI voice calls", "PS", "PS", "Phone Share", "registrants the AI caller can ring", "pct", 50);
  I(3, "AI voice calls", "CAR", "CAR", "Call Answer Rate", "answered ÷ called", "pct", 45);
  I(3, "AI voice calls", "CCR", "CCR", "Call Confirm Rate", "confirmed ÷ answered", "pct", 60);
  I(3, "AI voice calls", "CACR", "CACR", "Came After Confirming Rate", "people who joined ÷ people who confirmed", "pct", 70);
  C(3, "AI voice calls", "CJ", "CJ", "Call Joins", "PS × CAR × CCR × CACR", "pct", v => v.PS * v.CAR * v.CCR * v.CACR);
  C(3, "Stage result", "SUR", "SUR", "", "DJR + EJ + WJ + SJ + CJ", "pct", v => Math.min(1, v.DJR + v.EJ + v.WJ + v.SJ + v.CJ));
  C(3, "Stage result", "A", "A", "", "R × SUR", "num", v => v.R * v.SUR);

  // Stage 4: Booking the call (or checkout)
  I(4, "The offer, live", "OSR", "OSR", "Offer Stay Rate", "people present at the offer minute ÷ attendees", "pct", 60);
  I(4, "The offer, live", "ES", "ES", "Engaged Share", "answered a poll, asked a question or chatted ÷ people at the offer", "pct", 35);
  I(4, "The offer, live", "EOCR", "EOCR", "Engaged Offer Click Rate", "offer clicks ÷ engaged people at the offer", "pct", 12);
  I(4, "The offer, live", "QOCR", "QOCR", "Quiet Offer Click Rate", "offer clicks ÷ quiet people at the offer", "pct", 4);
  C(4, "The offer, live", "OCTR", "OCTR", "Offer Click-Through Rate", "ES × EOCR + (1 − ES) × QOCR", "pct", v => v.ES * v.EOCR + (1 - v.ES) * v.QOCR);
  I(4, "Booking", "BCR", "BCR", "Booking Completion Rate", "calls booked ÷ offer clicks", "pct", 60);
  C(4, "Booking", "LBR", "LBR", "Live Booking Rate", "OSR × OCTR × BCR", "pct", v => v.OSR * v.OCTR * v.BCR);
  I(4, "Booking", "FUCR", "FUCR", "Follow-Up Click Rate", "booking-link clicks from follow-up messages ÷ people who had not booked", "pct", 5);
  C(4, "Replay", "NSA", "NSA", "No-Shows per Attendee", "(registrants − attendees) ÷ attendees", "num2", v => v.A ? (v.R - v.A) / v.A : 0);
  I(4, "Replay", "RWR", "RWR", "Replay Watch Rate", "replay viewers ÷ no-shows", "pct", 30);
  I(4, "Replay", "RCR", "RCR", "Replay Click Rate", "offer clicks from the replay ÷ replay viewers", "pct", 4);
  C(4, "Stage result", "BR", "BR", "Booking Rate", "LBR + (1 − LBR) × FUCR × BCR + NSA × RWR × RCR × BCR", "pct", v => v.LBR + (1 - v.LBR) * v.FUCR * v.BCR + v.NSA * v.RWR * v.RCR * v.BCR);
  C(4, "Stage result", "CB", "CB", "Calls Booked", "A × BR", "num", v => v.A * v.BR);
  C(4, "Stage result", "CBL", "", "Booked live", "A × LBR", "num", v => v.A * v.LBR);
  I(4, "Direct checkout", "LCO", "LCOR", "Live Checkout Rate", "buyers at the offer ÷ attendees (for a buy now offer such as Pro)", "pct", 2.7);
  I(4, "Direct checkout", "RCO", "RCOR", "Replay Checkout Rate", "buyers from the replay ÷ replay viewers", "pct", 1);
  C(4, "Direct checkout", "DB", "DB", "Direct Buyers", "A × LCOR + (R − A) × RWR × RCOR", "num", v => v.A * v.LCO + Math.max(0, v.R - v.A) * v.RWR * v.RCO);

  // Stage 5: The sales pipeline
  I(5, "Call show: reminders", "USR", "USR", "Unprompted Show Rate", "showed with no reminder click ÷ calls booked", "pct", 50);
  I(5, "Call show: reminders", "CRDR", "CRDR", "Call Reminder Delivery Rate", "delivered ÷ sent", "pct", 98);
  I(5, "Call show: reminders", "CROR", "CROR", "Call Reminder Open Rate", "opened ÷ delivered", "pct", 60);
  I(5, "Call show: reminders", "ESCR", "ESCR", "Email Show Confirm Rate", "confirmed and showed ÷ people who opened", "pct", 15);
  C(5, "Call show: reminders", "ECS", "ECS", "Email Confirmed Shows", "CRDR × CROR × ESCR", "pct", v => v.CRDR * v.CROR * v.ESCR);
  I(5, "Call show: reminders", "BWR", "BWR", "Booked WhatsApp Reach", "booked contacts with WhatsApp ÷ calls booked", "pct", 70);
  I(5, "Call show: reminders", "PWDR", "WDR", "WhatsApp Delivery Rate", "delivered ÷ sent", "pct", 97);
  I(5, "Call show: reminders", "PWRR", "WRR", "WhatsApp Read Rate", "read ÷ delivered", "pct", 90);
  I(5, "Call show: reminders", "WSCR", "WSCR", "WhatsApp Show Confirm Rate", "confirmed and showed ÷ read", "pct", 15);
  C(5, "Call show: reminders", "WCS", "WCS", "WhatsApp Confirmed Shows", "BWR × WDR × WRR × WSCR", "pct", v => v.BWR * v.PWDR * v.PWRR * v.WSCR);
  I(5, "Call show: reminders", "BSR", "BSR", "Booked SMS Reach", "booked contacts with a phone and consent ÷ calls booked", "pct", 50);
  I(5, "Call show: reminders", "PSDR", "SDR", "SMS Delivery Rate", "delivered ÷ sent", "pct", 98);
  I(5, "Call show: reminders", "SSCR", "SSCR", "SMS Show Confirm Rate", "confirmed and showed ÷ delivered", "pct", 8);
  C(5, "Call show: reminders", "SCS", "SCS", "SMS Confirmed Shows", "BSR × SDR × SSCR", "pct", v => v.BSR * v.PSDR * v.SSCR);
  I(5, "Call show: reminders", "BPS", "BPS", "Booked Phone Share", "booked contacts the AI caller can ring ÷ calls booked", "pct", 50);
  I(5, "Call show: reminders", "RCAR", "RCAR", "Reminder Call Answer Rate", "answered ÷ called", "pct", 45);
  I(5, "Call show: reminders", "CSCR", "CSCR", "Call Show Confirm Rate", "confirmed and showed ÷ answered", "pct", 40);
  C(5, "Call show: reminders", "CCS", "CCS", "Call Confirmed Shows", "BPS × RCAR × CSCR", "pct", v => v.BPS * v.RCAR * v.CSCR);
  C(5, "Call show: reminders", "CSR", "CSR", "Call Show Rate", "USR + ECS + WCS + SCS + CCS", "pct", v => Math.min(1, v.USR + v.ECS + v.WCS + v.SCS + v.CCS));
  I(5, "No-show follow-ups", "NF1R", "NF1R", "No-Show Follow-Up 1 Rate", "rebooked after follow-up 1 (sent right away) ÷ no-shows", "pct", 8);
  I(5, "No-show follow-ups", "NF2R", "NF2R", "No-Show Follow-Up 2 Rate", "rebooked after follow-up 2 (3 days later) ÷ no-shows", "pct", 5);
  I(5, "No-show follow-ups", "NF3R", "NF3R", "No-Show Follow-Up 3 Rate", "rebooked after follow-up 3 (3 days after that) ÷ no-shows", "pct", 3);
  I(5, "No-show follow-ups", "NF4R", "NF4R", "No-Show Follow-Up 4 Rate", "rebooked after follow-up 4 (3 days after that) ÷ no-shows", "pct", 2);
  I(5, "No-show follow-ups", "NF5R", "NF5R", "No-Show Follow-Up 5 Rate", "rebooked after follow-up 5 (a week after that) ÷ no-shows", "pct", 2);
  C(5, "No-show follow-ups", "RBR", "RBR", "Rebook Rate", "NF1R + NF2R + NF3R + NF4R + NF5R", "pct", v => v.NF1R + v.NF2R + v.NF3R + v.NF4R + v.NF5R);
  C(5, "No-show follow-ups", "CHR", "CHR", "Calls Held Rate", "CSR + (1 − CSR) × RBR × CSR", "pct", v => v.CSR + (1 - v.CSR) * v.RBR * v.CSR);
  C(5, "Pipeline: deals at each stage", "CH", "CH", "Calls held", "CB × CHR", "num", v => v.CB * v.CHR);
  I(5, "Pipeline: deals at each stage", "QR", "QR", "Qualified Rate", "qualified ÷ calls held", "pct", 73);
  C(5, "Pipeline: deals at each stage", "Q", "Q", "Qualified", "CH × QR", "num", v => v.CH * v.QR);
  I(5, "Pipeline: deals at each stage", "PR", "PR", "Proposal Rate", "proposals sent ÷ qualified", "pct", 33);
  C(5, "Pipeline: deals at each stage", "PP", "P", "Proposals sent", "Q × PR", "num", v => v.Q * v.PR);
  I(5, "Deal follow-ups", "WWC", "WWC", "Win Without Chasing", "accepted with no chasing ÷ proposals sent", "pct", 50);
  I(5, "Deal follow-ups", "DF1R", "DF1R", "Deal Follow-Up 1 Rate", "accepted after deal follow-up 1 (day 3) ÷ proposals sent", "pct", 15);
  I(5, "Deal follow-ups", "DF2R", "DF2R", "Deal Follow-Up 2 Rate", "accepted after deal follow-up 2 (day 7) ÷ proposals sent", "pct", 10);
  I(5, "Deal follow-ups", "DF3R", "DF3R", "Deal Follow-Up 3 Rate", "accepted after deal follow-up 3 (day 12) ÷ proposals sent", "pct", 8);
  C(5, "Deal follow-ups", "WR", "WR", "Win Rate", "WWC + DF1R + DF2R + DF3R", "pct", v => Math.min(1, v.WWC + v.DF1R + v.DF2R + v.DF3R));
  C(5, "Pipeline: deals at each stage", "W", "W", "Proposals accepted", "P × WR", "num", v => v.PP * v.WR);
  I(5, "Pipeline: deals at each stage", "PCR", "PCR", "Payment Completion Rate", "payments completed ÷ proposals accepted", "pct", 93);
  C(5, "Pipeline: deals at each stage", "PAID", "Paid", "Paid", "W × PCR", "num", v => v.W * v.PCR);
  I(5, "Pipeline: deals at each stage", "OCR", "OCR", "Onboarding Completion Rate", "customers onboarded ÷ customers who paid", "pct", 100);
  C(5, "Stage result", "OC", "OC", "Onboarded Customers from calls", "PAID × OCR", "num", v => v.PAID * v.OCR);
  C(5, "Stage result", "CR", "CR", "Close Rate", "CHR × QR × PR × WR × PCR × OCR, or onboarded ÷ calls booked", "pct", v => v.CB ? v.OC / v.CB : 0);

  // Stage 6: The next 52 weeks
  C(6, "The list", "LS", "LS", "List Size", "registrants who did not become customers", "num", v => Math.max(0, v.R - v.OC - v.DB));
  I(6, "Weekly email", "WER", "WER", "Weekly Email Reach", "people who can get weekly email ÷ people on the list", "pct", 90);
  I(6, "Weekly email", "WES", "WES", "Weekly Email Sends", "sends per person per year", "num", 52);
  I(6, "Weekly email", "WEDR", "WEDR", "Weekly Email Delivery Rate", "delivered ÷ sent", "pct", 97);
  I(6, "Weekly email", "WEOR", "WEOR", "Weekly Email Open Rate", "opened ÷ delivered", "pct", 35);
  I(6, "Weekly email", "WECR", "WECR", "Weekly Email Click Rate", "clicks ÷ messages opened", "pct", 2);
  I(6, "Every channel", "CBR", "CBR", "Click-to-Booking Rate", "calls booked (or purchases) ÷ clicks from 52-week messages", "pct", 3);
  C(6, "Weekly email", "WEB", "WEB", "Weekly Email Bookings", "WER × WES × WEDR × WEOR × WECR × CBR", "pct", v => v.WER * v.WES * v.WEDR * v.WEOR * v.WECR * v.CBR);
  I(6, "AI newsletter", "ANR", "ANR", "AI Newsletter Reach", "people who can get the newsletter ÷ people on the list", "pct", 80);
  I(6, "AI newsletter", "ANS", "ANS", "AI Newsletter Sends", "sends per person per year", "num", 24);
  I(6, "AI newsletter", "ANDR", "ANDR", "AI Newsletter Delivery Rate", "delivered ÷ sent", "pct", 97);
  I(6, "AI newsletter", "ANOR", "ANOR", "AI Newsletter Open Rate", "opened ÷ delivered", "pct", 30);
  I(6, "AI newsletter", "ANCR", "ANCR", "AI Newsletter Click Rate", "clicks ÷ messages opened", "pct", 3);
  C(6, "AI newsletter", "ANB", "ANB", "AI Newsletter Bookings", "ANR × ANS × ANDR × ANOR × ANCR × CBR", "pct", v => v.ANR * v.ANS * v.ANDR * v.ANOR * v.ANCR * v.CBR);
  I(6, "Nurture WhatsApp", "NWR", "NWR", "Nurture WhatsApp Reach", "people who can get WhatsApp ÷ people on the list", "pct", 60);
  I(6, "Nurture WhatsApp", "NWS", "NWS", "Nurture WhatsApp Sends", "sends per person per year", "num", 12);
  I(6, "Nurture WhatsApp", "NWDR", "NWDR", "Nurture WhatsApp Delivery Rate", "delivered ÷ sent", "pct", 97);
  I(6, "Nurture WhatsApp", "NWRR", "NWRR", "Nurture WhatsApp Read Rate", "read ÷ delivered", "pct", 85);
  I(6, "Nurture WhatsApp", "NWCR", "NWCR", "Nurture WhatsApp Click Rate", "clicks ÷ messages read", "pct", 4);
  C(6, "Nurture WhatsApp", "NWB", "NWB", "Nurture WhatsApp Bookings", "NWR × NWS × NWDR × NWRR × NWCR × CBR", "pct", v => v.NWR * v.NWS * v.NWDR * v.NWRR * v.NWCR * v.CBR);
  I(6, "Nurture SMS", "NSR", "NSR", "Nurture SMS Reach", "people who can get SMS ÷ people on the list", "pct", 40);
  I(6, "Nurture SMS", "NSS", "NSS", "Nurture SMS Sends", "sends per person per year", "num", 6);
  I(6, "Nurture SMS", "NSDR", "NSDR", "Nurture SMS Delivery Rate", "delivered ÷ sent", "pct", 98);
  I(6, "Nurture SMS", "NSCR", "NSCR", "Nurture SMS Click Rate", "clicks ÷ texts delivered", "pct", 3);
  C(6, "Nurture SMS", "NSB", "NSB", "Nurture SMS Bookings", "NSR × NSS × NSDR × NSCR × CBR", "pct", v => v.NSR * v.NSS * v.NSDR * v.NSCR * v.CBR);
  I(6, "AI check-in calls", "CICR", "CICR", "Check-In Call Reach", "people the AI caller can ring ÷ people on the list", "pct", 50);
  I(6, "AI check-in calls", "CIC", "CIC", "Check-In Calls", "AI check-in calls per person per year", "num", 2);
  I(6, "AI check-in calls", "CIAR", "CIAR", "Check-In Answer Rate", "answered ÷ called", "pct", 40);
  I(6, "AI check-in calls", "CIBR", "CIBR", "Check-In Booking Rate", "calls booked ÷ check-in calls answered", "pct", 1);
  C(6, "AI check-in calls", "CICB", "CICB", "Check-In Call Bookings", "CICR × CIC × CIAR × CIBR", "pct", v => v.CICR * v.CIC * v.CIAR * v.CIBR);
  C(6, "Stage result", "YRR", "YRR", "Yearly Rebooking Rate", "WEB + ANB + NWB + NSB + CICB", "pct", v => v.WEB + v.ANB + v.NWB + v.NSB + v.CICB);
  C(6, "Stage result", "YCB", "YCB", "Yearly Calls Booked", "LS × YRR: calls booked (or purchases) from the 52 weeks", "num", v => v.LS * v.YRR);
  C(6, "Stage result", "YOC", "YOC", "Customers from the 52 weeks", "YCB × CR for a call offer; YCB for a buy now offer", "num", v => v.offer === "checkout" ? v.YCB : v.YCB * v.CR);

  // Revenue and cost
  I(7, "Call offer (Enterprise)", "DV", "DV", "Deal value, one time", "fee per customer won through a call", "usd", 9999);
  I(7, "Call offer (Enterprise)", "DVR", "DVR", "Platform plan a month, after the included year", "recurring fee once the prepaid year ends (not in the first 12 months)", "usd", 499);
  I(7, "Call offer (Enterprise)", "CONV", "CONV", "Move onto the platform plan", "call customers who keep the platform after the included year", "pct", 85);
  I(7, "Buy now offer (Pro)", "PRICE", "Price", "Subscription a month", "price per direct buyer", "usd", 99);
  I(7, "Buy now offer (Pro)", "CAT", "CAT", "Course Attach Rate", "buyers who also buy the course ÷ buyers", "pct", 7.5);
  I(7, "Buy now offer (Pro)", "CP", "CP", "Course price, one time", "", "usd", 999);
  I(7, "Retention", "CHURN", "Churn", "Monthly churn", "subscribers lost each month ÷ subscribers (ChartMogul median 3.1% to 6.5%)", "pct", 6.5);
  I(7, "Retention", "MARGIN", "GM", "Gross margin", "", "pct", 80);
  I(7, "Cost and cadence", "OTHER", "Other", "Other cost per webinar", "tools, team time, data lists", "usd", 0);
  I(7, "Cost and cadence", "WPM", "WPM", "Webinars per month", "", "num", 4.33);

  /* ---------- Presets ---------- */
  const DEFAULTS = Object.fromEntries(N.filter(n => n.kind === "in").map(n => [n.id, n.val]));
  const PRESETS = {
    playbook: { label: "Playbook example: Enterprise webinar", shape: "webinar", offer: "call", inputs: {}, over: {} },
    pro: { label: "Tantra Pro webinar (buy now)", shape: "webinar", offer: "checkout", inputs: { CIS: 60000, PE: 10000, LRS: 1500, ASP: 2000, PI: 100000 }, over: {} },
    floor: { label: "Your 2025 webinars (cold calendar only)", shape: "webinar", offer: "call", inputs: { PE: 0, LRS: 0, WMS: 0, ASP: 0, PI: 0, CIS: 59630 }, over: { R: 225, A: 178, CB: 4.6 } }
  };

  /* ---------- State ---------- */
  const KEY = "tantra-calc-v1";
  let S = load() || fresh("playbook");
  function fresh(p) { const pr = PRESETS[p]; return { preset: p, shape: pr.shape, offer: pr.offer, inputs: Object.assign({}, DEFAULTS, pr.inputs), over: Object.assign({}, pr.over) }; }
  function load() {
    try {
      if (location.hash.length > 3) return JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(1)))));
      const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

  /* ---------- Evaluate ---------- */
  function evaluate() {
    const v = { offer: S.offer };
    N.forEach(n => {
      let x;
      if (n.kind === "in") x = S.inputs[n.id] != null ? S.inputs[n.id] : n.val;
      else x = S.over[n.id] != null ? S.over[n.id] : n.val(v);
      if (n.kind === "in" && n.fmt === "pct") x = P(x);
      if (n.kind === "calc" && S.over[n.id] != null && n.fmt === "pct") x = P(S.over[n.id]);
      // Offer paths: a buy now offer books no calls; a call offer sells nothing at checkout
      if (n.id === "CB" && S.offer === "checkout") x = 0;
      if (n.id === "CBL" && S.offer === "checkout") x = 0;
      if (n.id === "DB" && S.offer === "call") x = 0;
      v[n.id] = isFinite(x) ? x : 0;
    });
    // Revenue
    const keep12 = (1 - Math.pow(1 - v.CHURN, 12)) / Math.max(v.CHURN, 1e-6);   // subscriber months paid in the first year
    const life = 1 / Math.max(v.CHURN, 1e-6);
    const callC = v.OC, buyC = v.DB, yc = v.YOC;
    const courses = (buyC + (S.offer === "checkout" ? yc : 0)) * v.CAT;
    const callAll = callC + (S.offer === "call" ? yc : 0), buyAll = buyC + (S.offer === "checkout" ? yc : 0);
    const oneTime = callAll * v.DV + courses * v.CP;
    const proMrr = buyAll * v.PRICE, entMrr = callAll * v.CONV * v.DVR;    // Enterprise platform plan starts in month 13
    const newMrr = proMrr + entMrr;
    const firstYear = oneTime + proMrr * keep12;
    const ltvSub = v.PRICE * v.MARGIN * life;
    const customers = callC + buyC;
    const cost = v.ASP + v.OTHER;
    const out = {
      customers, customers52: yc, courses, oneTime, newMrr, arrAdded: newMrr * 12, firstYear, lifetime: oneTime + newMrr * life,
      cost, cac: customers ? cost / customers : 0, roas: v.ASP ? firstYear / v.ASP : 0, ltvSub, keep12, life, proMrr, entMrr,
      payback: proMrr > 0 ? cost / Math.max(1e-6, proMrr * v.MARGIN) : 0
    };
    return { v, out };
  }

  /* ---------- Format ---------- */
  const fmtN = x => (Math.abs(x) >= 100 ? Math.round(x).toLocaleString("en-US") : Math.abs(x) >= 10 ? (Math.round(x * 10) / 10).toLocaleString("en-US") : (Math.round(x * 100) / 100).toLocaleString("en-US"));
  const fmtP = x => (x * 100 >= 10 ? (x * 100).toFixed(1) : (x * 100).toFixed(2)).replace(/\.?0+$/, "") + "%";
  const fmtU = x => "$" + Math.round(x).toLocaleString("en-US");
  const show = (n, x) => n.fmt === "pct" ? fmtP(x) : n.fmt === "usd" ? fmtU(x) : n.fmt === "num2" ? (Math.round(x * 100) / 100).toString() : fmtN(x);
  const shapeName = n => {
    const sh = SHAPES[S.shape];
    if (n.id === "PAR") return [sh.s2[0], sh.s2[1], sh.s2[2]];
    if (n.id === "SUR") return [sh.s3[0], sh.s3[1], sh.s3[2]];
    if (n.id === "A") return [sh.attS, sh.att, "R × " + sh.s3[0]];
    return [n.code, n.name, n.def];
  };

  /* ---------- Render inputs ---------- */
  const STAGES = { 1: "Traffic", 2: "Landing and sign-up", 3: "Reminders and nurture", 4: "Booking the call", 5: "The sales pipeline", 6: "The next 52 weeks", 7: "Revenue and cost" };
  const hideFor = n => (S.offer === "checkout" && (n.stage === 5 || ["BCR", "LBR", "FUCR", "RCR", "BR", "CB", "CBL", "DV", "DVR", "CONV"].includes(n.id))) || (S.offer === "call" && ["LCO", "RCO", "DB", "PRICE", "CAT", "CP"].includes(n.id));
  function renderForm() {
    const host = $("#calc-form"); let html = "";
    for (let st = 1; st <= 7; st++) {
      const ns = N.filter(n => n.stage === st && !hideFor(n));
      if (!ns.length) continue;
      const groups = [...new Set(ns.map(n => n.group))];
      html += `<details class="cs" ${st <= 2 ? "open" : ""} data-stage="${st}"><summary><span class="cs-n">${st <= 6 ? st : "$"}</span><span class="cs-t">${STAGES[st]}</span><span class="cs-m" id="sm-${st}"></span></summary>`;
      groups.forEach(g => {
        html += `<div class="cg"><h4>${g}</h4>`;
        ns.filter(n => n.group === g).forEach(n => {
          const [code, name, def] = shapeName(n);
          const isOver = n.kind === "calc" && S.over[n.id] != null;
          const step = n.fmt === "pct" ? "0.01" : n.fmt === "usd" ? "1" : "any";
          html += `<div class="kpi ${n.kind}${isOver ? " over" : ""}" data-id="${n.id}">
            <span class="code">${code || ""}</span>
            <label for="k-${n.id}"><b>${name}</b><span>${def}</span></label>
            <span class="field">${n.fmt === "usd" ? '<i>$</i>' : ""}<input id="k-${n.id}" type="number" inputmode="decimal" step="${step}" ${n.kind === "calc" && !isOver ? 'placeholder=""' : ""}>${n.fmt === "pct" ? "<i>%</i>" : ""}</span>
            ${n.kind === "calc" ? `<button type="button" class="reset" data-reset="${n.id}" ${isOver ? "" : "hidden"} aria-label="Go back to the calculated ${name}">Auto</button>` : ""}
          </div>`;
        });
        html += `</div>`;
      });
      html += `</details>`;
    }
    host.innerHTML = html;
    host.querySelectorAll("input").forEach(inp => {
      const id = inp.id.slice(2), n = N.find(x => x.id === id);
      inp.addEventListener("input", () => {
        const val = inp.value === "" ? null : parseFloat(inp.value);
        if (n.kind === "in") { S.inputs[id] = val == null ? n.val : val; }
        else { if (val == null) delete S.over[id]; else S.over[id] = val; inp.closest(".kpi").classList.toggle("over", val != null); inp.closest(".kpi").querySelector(".reset").hidden = val == null; }
        S.preset = "custom"; $("#preset").value = "custom"; save(); update(false);
      });
    });
    host.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => { delete S.over[b.dataset.reset]; save(); renderForm(); update(true); }));
  }

  /* ---------- Output and the funnel picture ---------- */
  function update(fillAll) {
    const { v, out } = evaluate();
    // Fill every field: inputs keep what was typed; computed fields show their live value unless typed over
    N.forEach(n => {
      const inp = document.getElementById("k-" + n.id); if (!inp) return;
      if (n.kind === "in") { if (fillAll || document.activeElement !== inp) inp.value = S.inputs[n.id] != null ? S.inputs[n.id] : n.val; }
      else if (S.over[n.id] != null) { if (fillAll || document.activeElement !== inp) inp.value = S.over[n.id]; }
      else { inp.value = ""; inp.placeholder = n.fmt === "pct" ? (v[n.id] * 100).toFixed(2).replace(/\.?0+$/, "") : n.fmt === "num2" ? (Math.round(v[n.id] * 100) / 100) : Math.round(v[n.id] * 10) / 10; }
    });
    const sh = SHAPES[S.shape], call = S.offer !== "checkout";
    // Stage headline metrics in each section's summary
    const sm = { 1: `${fmtN(v.PV)} page visits, VR ${fmtP(v.VR)}`, 2: `${fmtN(v.R)} registrants, RR ${fmtP(v.RR)}`, 3: `${fmtN(v.A)} ${sh.att.toLowerCase()}, ${sh.s3[0]} ${fmtP(v.SUR)}`, 4: call ? `${fmtN(v.CB)} calls booked, BR ${fmtP(v.BR)}` : `${fmtN(v.DB)} direct buyers`, 5: `${fmtN(v.OC)} customers, CR ${fmtP(v.CR)}`, 6: `${fmtN(v.YCB)} from the 52 weeks, YRR ${fmtP(v.YRR)}`, 7: `${fmtU(out.firstYear)} first year revenue` };
    Object.entries(sm).forEach(([k, t]) => { const e = document.getElementById("sm-" + k); if (e) e.textContent = t; });

    // Funnel picture: one row per stage. Bar length is on a log scale so every stage stays readable;
    // the step rate says what share of the stage above made it to this one.
    const rows = [
      { s: 1, l: "People reached", n: v.REACH, step: "", k: `VR ${fmtP(v.VR)}` },
      { s: 1, l: "Page visits", n: v.PV, step: `${fmtP(v.REACH ? v.PV / v.REACH : 0)} of people reached`, k: "" },
      { s: 2, l: "Registrants", n: v.R, step: `${fmtP(v.PV ? v.R / v.PV : 0)} of page visits, with auto-registrants`, k: `${sh.s2[0]} ${fmtP(v.PAR)}` },
      { s: 3, l: sh.att, n: v.A, step: `${fmtP(v.SUR)} of registrants`, k: sh.s3[0] },
      call ? { s: 4, l: "Calls booked", n: v.CB, step: `${fmtP(v.BR)} of ${sh.s4base}`, k: "BR" } : { s: 4, l: "Direct buyers", n: v.DB, step: `${fmtP(v.A ? v.DB / v.A : 0)} of ${sh.s4base}, live and replay`, k: "" },
      call ? { s: 5, l: "Customers", n: v.OC, step: `${fmtP(v.CR)} of calls booked`, k: "CR" } : null
    ].filter(Boolean);
    const max = Math.log10(Math.max(10, ...rows.map(r => r.n)) + 1);
    const bar = n => Math.max(1.5, Math.log10(n + 1) / max * 100).toFixed(1);
    $("#viz").innerHTML = `<ol class="frows">${rows.map(r => `<li class="s${r.s}"><span class="fr-l">${r.l}</span><span class="fr-n">${fmtN(r.n)}</span><span class="fr-bar"><i style="width:${bar(r.n)}%"></i></span><span class="fr-step">${r.step}</span></li>`).join("")}</ol>
      <div class="f52"><b>+ ${fmtN(v.YOC)}</b> customers from the next 52 weeks of nurture: ${fmtN(v.YCB)} ${call ? "calls booked" : "purchases"} from a list of ${fmtN(v.LS)} (YRR ${fmtP(v.YRR)})</div>
      <p class="small fr-note">Bar length uses a log scale, so a stage of 6,000 and one of 600 both stay visible.</p>`;

    // Pipeline picture for stage 5
    $("#pipe").innerHTML = call ? `<h3 class="c-h3">Stage 5, deal by deal</h3><div class="pipe">${[["Booked", v.CB], ["Held", v.CH], ["Qualified", v.Q], ["Proposal", v.PP], ["Accepted", v.W], ["Paid", v.PAID], ["Onboarded", v.OC]].map(([l, n]) => `<div><b>${fmtN(n)}</b><i style="width:${v.CB ? Math.max(3, n / v.CB * 100) : 3}%"></i><span>${l}</span></div>`).join("")}</div>` : "";

    // Revenue table
    const w = v.WPM, row = (l, x, f) => `<tr><td class="l">${l}</td><td>${f(x)}</td><td>${f(x * w)}</td><td>${f(x * w * 12)}</td></tr>`;
    $("#rev").innerHTML = `<table><thead><tr><th class="l"></th><th>Per ${sh.name.toLowerCase()}</th><th>Per month</th><th>Per year</th></tr></thead><tbody>
      ${row("New customers", out.customers, fmtN)}${row("Customers from the 52 weeks (each list, over the next year)", out.customers52, fmtN)}${row("Course sales", out.courses, fmtN)}
      ${row("One time revenue", out.oneTime, fmtU)}${row("New MRR from buy now subscribers", out.proMrr, fmtU)}${row("New MRR from month 13 (Enterprise platform plan)", out.entMrr, fmtU)}${row("Revenue in the first 12 months", out.firstYear, fmtU)}
      ${row("Ad spend and other cost", out.cost, fmtU)}</tbody></table>`;
    $("#big").innerHTML = `<div><b class="money">${fmtU(out.firstYear * w * 12)}</b><span>revenue in the first 12 months from a year of ${sh.name.toLowerCase()}s</span></div>
      <div><b>${fmtU(out.cac)}</b><span>cost per customer</span></div><div><b>${out.roas ? out.roas.toFixed(1) + "x" : "n/a"}</b><span>first year revenue ÷ ad spend</span></div>
      <div><b>${fmtU(out.newMrr * w * 12 * 12)}</b><span>ARR added by a year of ${sh.name.toLowerCase()}s, before churn</span></div>`;
    $("#note").textContent = `Subscribers pay for ${out.keep12.toFixed(1)} of their first 12 months at ${fmtP(v.CHURN)} monthly churn, and ${Math.round(out.life)} months on average over their life. Per month and per year multiply one ${sh.name.toLowerCase()} by ${w} a month.`;
    $("#share").dataset.state = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  }

  /* ---------- Controls ---------- */
  function controls() {
    $("#preset").innerHTML = Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join("") + `<option value="custom">Your numbers</option>`;
    $("#preset").value = PRESETS[S.preset] ? S.preset : "custom";
    $("#shape").value = S.shape; $("#offer").value = S.offer;
    $("#preset").addEventListener("change", e => { if (e.target.value === "custom") return; S = fresh(e.target.value); $("#shape").value = S.shape; $("#offer").value = S.offer; save(); renderForm(); update(true); });
    $("#shape").addEventListener("change", e => { S.shape = e.target.value; save(); renderForm(); update(true); });
    $("#offer").addEventListener("change", e => { S.offer = e.target.value; save(); renderForm(); update(true); });
    $("#reset").addEventListener("click", () => { S = fresh(PRESETS[S.preset] ? S.preset : "playbook"); history.replaceState(null, "", location.pathname); save(); controls2(); renderForm(); update(true); });
    $("#share").addEventListener("click", async () => {
      const url = location.origin + location.pathname + "#" + $("#share").dataset.state;
      try { await navigator.clipboard.writeText(url); $("#share").textContent = "Link copied"; } catch (e) { prompt("Copy this link", url); }
      setTimeout(() => { $("#share").textContent = "Copy a link with these numbers"; }, 1800);
    });
    $("#openall").addEventListener("click", () => { const all = document.querySelectorAll("details.cs"); const open = [...all].some(d => !d.open); all.forEach(d => d.open = open); $("#openall").textContent = open ? "Close every stage" : "Open every stage"; });
  }
  function controls2() { $("#preset").value = PRESETS[S.preset] ? S.preset : "custom"; $("#shape").value = S.shape; $("#offer").value = S.offer; }

  controls(); renderForm(); update(true);
})();
