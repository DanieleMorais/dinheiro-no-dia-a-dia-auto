// Monitor diário: checa Search Console + GA4 dos 2 blogs e manda resumo (e-mail via Resend, se houver chave).
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "REMOVIDO";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "REMOVIDO";
const RT = process.env.GOOGLE_REFRESH_TOKEN;
const RESEND = process.env.RESEND_API_KEY || "";
const EMAIL_TO = process.env.EMAIL_TO || "fadamadrinhadm@gmail.com";

if (!RT) { console.error("❌ Falta GOOGLE_REFRESH_TOKEN"); process.exit(1); }

const BLOGS = [
  { nome: "Dinheiro no Dia a Dia", site: "https://www.dinheironodiaadia.com/", ga4: "544267278" },
  { nome: "O Mundo da IA", site: "https://omundodaia.blogspot.com/", ga4: "544354894" },
];

async function tok() {
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: RT, grant_type: "refresh_token" }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j).slice(0, 120));
  return j.access_token;
}
function dias(n) { const d = new Date(Date.now() - n * 86400000); return d.toISOString().slice(0, 10); }

(async () => {
  const t = await tok();
  const H = { Authorization: "Bearer " + t }, HJ = { ...H, "Content-Type": "application/json" };
  let linhas = [];
  for (const b of BLOGS) {
    let sc = "sem dados ainda", ga = "sem dados ainda";
    try {
      const q = await (await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(b.site)}/searchAnalytics/query`, { method: "POST", headers: HJ, body: JSON.stringify({ startDate: dias(28), endDate: dias(0) }) })).json();
      if (q.rows && q.rows.length) { const r = q.rows[0]; sc = `${r.clicks} cliques, ${r.impressions} impressões (pos. ${r.position.toFixed(1)})`; }
    } catch {}
    try {
      const g = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${b.ga4}:runReport`, { method: "POST", headers: HJ, body: JSON.stringify({ dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }] })})).json();
      if (g.rows && g.rows.length) { const m = g.rows[0].metricValues; ga = `${m[0].value} usuários, ${m[1].value} páginas (7 dias)`; }
    } catch {}
    linhas.push(`📌 ${b.nome}\n   🔎 Google (28d): ${sc}\n   📊 Visitas: ${ga}`);
  }
  const hoje = new Date().toISOString().slice(0, 10);
  const corpo = `Relatório dos blogs — ${hoje}\n\n${linhas.join("\n\n")}\n\n— Robô de monitoramento 💜`;
  console.log(corpo);

  // Telegram (grupo Blogger)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const tr = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: "📊 " + corpo }) });
      console.log("telegram:", (await tr.json()).ok ? "✅ enviado" : "falhou");
    } catch (e) { console.log("telegram erro:", e.message); }
  }

  if (RESEND) {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Robô Fada Madrinha <onboarding@resend.dev>", to: [EMAIL_TO], subject: `📊 Blogs Fada Madrinha — ${hoje}`, text: corpo }) });
    console.log("e-mail:", r.ok ? "✅ enviado" : "status " + r.status);
  } else {
    console.log("\n(sem RESEND_API_KEY — só registrei no log. Adicione a chave pra receber por e-mail.)");
  }
})().catch(e => { console.error("FALHA:", e.message); process.exit(1); });
