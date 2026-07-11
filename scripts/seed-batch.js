// SEED one-time: publica até LIMIT posts evergreen dos temas de finanças MAIS BUSCADOS (PT-BR). Dispatch manual.
const CLIENT_ID = process.env.BLOGGER_CLIENT_ID, CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET, REFRESH = process.env.BLOGGER_REFRESH_TOKEN, BLOG_ID = process.env.BLOGGER_BLOG_ID;
const OR_KEY = process.env.OPENROUTER_API_KEY, IMG_BASE = process.env.IMG_BASE || "", SA_JSON = process.env.GOOGLE_SA_JSON || "", LIMIT = parseInt(process.env.LIMIT || "30", 10);
const crypto = require("crypto");
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH || !BLOG_ID) { console.error("Faltam secrets."); process.exit(1); }
const CAT = { Cartao: "Cartão de Crédito", Emprestimo: "Empréstimo", Financiamento: "Financiamento", Dividas: "Dívidas", Investimentos: "Investimentos", Conta: "Conta Digital", Seguranca: "Segurança Financeira", Financas: "Finanças Pessoais", Impostos: "Impostos", Beneficios: "Benefícios", Aposentadoria: "Aposentadoria", Renda: "Renda Extra" };
const IMGQ = { Cartao: "credit card finance", Emprestimo: "loan money calculator", Financiamento: "house car keys finance", Dividas: "debt planning money", Investimentos: "investment chart coins growth", Conta: "mobile banking payment phone", Seguranca: "security phone protection lock", Financas: "budget money home calculator", Impostos: "tax documents calculator", Beneficios: "money help government document", Aposentadoria: "retirement senior savings couple", Renda: "working home laptop money" };
const POOL = [
["como sair das dívidas rápido mesmo ganhando pouco","Dividas"],["como limpar o nome no Serasa de graça passo a passo","Dividas"],["Desenrola Brasil como renegociar dívidas com desconto","Dividas"],["como fazer um orçamento familiar que realmente funciona","Financas"],["regra 50 30 20 como organizar o salário","Financas"],["como juntar dinheiro ganhando pouco todo mês","Financas"],["como guardar dinheiro para uma reserva de emergência","Financas"],["melhores cartões de crédito sem anuidade em 2026","Cartao"],["como aumentar o limite do cartão de crédito","Cartao"],["cartão de crédito para negativado como conseguir","Cartao"],["como usar o cartão de crédito sem se endividar","Cartao"],["o que é e como funciona o rotativo do cartão","Cartao"],["empréstimo consignado vale a pena? cuidados","Emprestimo"],["como conseguir empréstimo com nome sujo","Emprestimo"],["diferença entre empréstimo pessoal e consignado","Emprestimo"],["como funciona o financiamento de imóvel pela Caixa","Financiamento"],["financiamento de carro como conseguir juros baixos","Financiamento"],["o que é a taxa Selic e como afeta seu bolso","Investimentos"],["como começar a investir com pouco dinheiro","Investimentos"],["Tesouro Direto como investir passo a passo para iniciantes","Investimentos"],["CDB, LCI e LCA qual o melhor investimento","Investimentos"],["renda fixa x renda variável qual escolher","Investimentos"],["como investir na poupança vale a pena ainda","Investimentos"],["Pix como usar com segurança e evitar golpes","Conta"],["melhores contas digitais gratuitas em 2026","Conta"],["como se proteger de golpes do Pix e do WhatsApp","Seguranca"],["como declarar Imposto de Renda passo a passo","Impostos"],["quem precisa declarar Imposto de Renda em 2026","Impostos"],["como consultar e sacar o FGTS pelo aplicativo","Beneficios"],["Bolsa Família como se inscrever e consultar","Beneficios"],["como dar entrada na aposentadoria pelo INSS","Aposentadoria"],["como consultar o tempo de contribuição do INSS","Aposentadoria"],["como ganhar dinheiro extra em casa pela internet","Renda"],["ideias de renda extra para começar hoje sem investir","Renda"],["como ganhar dinheiro com inteligência artificial","Renda"],
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const slugify = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "financas";
const b64url = x => Buffer.from(x).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
async function getToken() { const j = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH, grant_type: "refresh_token" }) })).json(); return j.access_token; }
async function existentes() { try { const r = await fetch(`https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=500`); return (((await r.json()).feed || {}).entry || []).map(e => norm(e.title.$t)); } catch { return []; } }
async function callAI(prompt) {
  if (OR_KEY) for (const model of ["openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct:free"]) for (let t = 0; t < 3; t++) { try { const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + OR_KEY, "Content-Type": "application/json", "HTTP-Referer": "https://dinheironodiaadia2026.blogspot.com", "X-Title": "Dinheiro no Dia a Dia" }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.85, max_tokens: 3500 }), signal: AbortSignal.timeout(90000) }); if (r.status === 429 || r.status >= 500) { await sleep(12000); continue; } if (!r.ok) break; const c = (await r.json()).choices?.[0]?.message?.content?.trim(); if (c && c.length > 400) return c; } catch { await sleep(5000); } }
  for (let t = 0; t < 4; t++) { try { const r = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: "openai-fast", messages: [{ role: "user", content: prompt }], temperature: 0.8 }), signal: AbortSignal.timeout(90000) }); if (r.status === 429) { await sleep(20000); continue; } if (!r.ok) { await sleep(8000); continue; } const c = (await r.json()).choices?.[0]?.message?.content?.trim(); if (c && c.length > 400) return c; } catch { await sleep(6000); } }
  return null;
}
async function gerar(tema) {
  const prompt = `Você é redator de um portal premium de finanças pessoais para o público brasileiro. Escreva um artigo EXCELENTE, original e prático sobre: "${tema}".\n\nREQUISITOS: 900-1400 palavras, didático e confiável, com passos e exemplos reais do Brasil (Pix, Serasa, Caixa, INSS, Tesouro etc. quando couber). 5-7 <h2> com <h3>, <ul><li> e onde couber UMA <table> (ex: comparativo). Tom acolhedor e acessível, fale com "você". Inclua uma seção <h2>Perguntas Frequentes</h2> com 4 <h3>. IMPORTANTE: não invente taxas/valores específicos que mudam; oriente a conferir nas fontes oficiais. Não dê conselho de investimento garantido. Não se identifique como IA. Não escreva html/head/body/h1 nem markdown.\n\nFORMATO (exato):\nLinha 1: TITULO: <título até 65 caracteres>\nLinha 2: RESUMO: <1-2 frases de valor>\nDepois: corpo em HTML puro (começando com <p>).`;
  const c = await callAI(prompt); if (!c) return null;
  const titulo = (c.match(/TITULO:\s*(.+)/i)?.[1] || tema).trim().replace(/^["#*\s]+|["*\s]+$/g, "").slice(0, 70);
  const resumo = (c.match(/RESUMO:\s*(.+)/i)?.[1] || "").trim();
  let corpo = /RESUMO:/i.test(c) ? c.replace(/^[\s\S]*?RESUMO:.*(?:\r?\n)+/i, "").trim() : c.replace(/^[\s\S]*?TITULO:.*(?:\r?\n)+/i, "").trim();
  corpo = corpo.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return corpo.length >= 500 ? { titulo, resumo, corpo } : null;
}
function montar(art, img, tema) {
  const alt = (art.titulo || tema || "finanças").replace(/"/g, "");
  const fig = `<figure style="margin:0 0 24px"><img src="${img}" alt="${alt}" title="${alt}" style="width:100%;height:auto;border-radius:14px" /></figure>`;
  const tl = art.resumo ? `<div style="background:linear-gradient(135deg,#f0f7ff,#eef4ff);border-left:5px solid #1a73e8;padding:18px 22px;border-radius:12px;margin:0 0 26px;font-size:1.05em"><strong style="color:#1a4fa0">📌 Resumo rápido:</strong> ${art.resumo}</div>` : "";
  const aviso = `\n<p style="font-size:.85em;color:#888;border-top:1px solid #eee;padding-top:14px;margin-top:26px"><em>Conteúdo informativo de educação financeira. Confira sempre as condições nas fontes oficiais. 💙</em></p>`;
  return fig + tl + art.corpo + aviso;
}
let saTok = null, saExp = 0;
async function notifyGoogle(url) { if (!SA_JSON) return; try { const sa = JSON.parse(SA_JSON); const now = Math.floor(Date.now() / 1000); if (!saTok || now > saExp) { const h = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })); const c = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/indexing", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })); const sig = b64url(crypto.sign("RSA-SHA256", Buffer.from(h + "." + c), sa.private_key)); const tr = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: h + "." + c + "." + sig }) })).json(); saTok = tr.access_token; saExp = now + 3000; } if (saTok) await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", { method: "POST", headers: { Authorization: "Bearer " + saTok, "Content-Type": "application/json" }, body: JSON.stringify({ url, type: "URL_UPDATED" }) }); } catch {} }
(async () => {
  const existe = await existentes();
  const jaTem = tema => { const w = norm(tema).split(" ").filter(x => x.length > 3); return existe.some(t => w.filter(x => t.includes(x)).length >= Math.max(4, Math.ceil(w.length * 0.7))); };
  const fila = POOL.filter(([t]) => !jaTem(t));
  console.log("candidatos:", fila.length, "| limite:", LIMIT, "| já no blog:", existe.length);
  let token = await getToken(); let ok = 0;
  for (let i = 0; i < fila.length && ok < LIMIT; i++) {
    const [tema, ck] = fila[i]; if (jaTem(tema)) continue;
    const art = await gerar(tema); if (!art || jaTem(art.titulo)) { console.log("pula:", tema.slice(0, 40)); continue; }
    const seed = Math.floor(Math.random() * 999999);
    const iq = IMGQ[ck] || "finance money brazil";
    const img = IMG_BASE ? `${IMG_BASE}/${slugify(art.titulo)}.webp?q=${encodeURIComponent(iq)}&s=${seed}` : `https://image.pollinations.ai/prompt/${encodeURIComponent(iq)}?width=1200&height=630&seed=${seed}&nologo=true`;
    const html = montar(art, img, tema); const label = CAT[ck] || "Finanças Pessoais";
    let done = false;
    for (let a = 0; a < 3 && !done; a++) { const pr = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/?isDraft=false`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ kind: "blogger#post", title: art.titulo, content: html, labels: [label] }) }); const pd = await pr.json(); if (pd.url) { ok++; done = true; existe.push(norm(art.titulo)); console.log(`${ok} OK: ${art.titulo.slice(0, 50)}`); notifyGoogle(pd.url); } else if (pr.status === 401) token = await getToken(); else if (pr.status === 403 || pr.status === 429) { console.log("quota, 45s..."); await sleep(45000); } else { done = true; console.log("FAIL:", JSON.stringify(pd.error?.message || pd).slice(0, 100)); } }
    await sleep(1200);
  }
  console.log(`\n=== ${ok} artigos publicados ===`);
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
