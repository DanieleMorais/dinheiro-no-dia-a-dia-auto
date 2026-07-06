// Robô diário: publica 1 artigo premium de finanças no blog "Dinheiro no Dia a Dia".
// Rodado pelo GitHub Actions. Credenciais vêm de secrets (env). Sem Firebase, sem Vercel.
const CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;
const REFRESH = process.env.BLOGGER_REFRESH_TOKEN;
const BLOG_ID = process.env.BLOGGER_BLOG_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH || !BLOG_ID) {
  console.error("❌ Faltam secrets: BLOGGER_CLIENT_ID / BLOGGER_CLIENT_SECRET / BLOGGER_REFRESH_TOKEN / BLOGGER_BLOG_ID");
  process.exit(1);
}

const NEWS_Q = {
  Cartao: "cartão de crédito juros fatura", Emprestimo: "empréstimo consignado juros",
  Financiamento: "financiamento imóvel veículo juros", Dividas: "Desenrola renegociação dívidas Serasa",
  Investimentos: "Selic Copom investimentos renda fixa Tesouro", Conta: "Pix Open Finance conta digital",
  Seguranca: "golpe Pix fraude bancária Banco Central", Financas: "inflação orçamento salário mínimo",
  Impostos: "Imposto de Renda Receita Federal IPVA IPTU", Beneficios: "FGTS Bolsa Família PIS PASEP benefícios",
  Aposentadoria: "INSS aposentadoria BPC LOAS", Renda: "renda extra ganhar dinheiro internet",
};
const IMG_Q = {
  Cartao: "credit card finance", Emprestimo: "loan money calculator", Financiamento: "house car keys finance",
  Dividas: "debt planning money", Investimentos: "investment chart coins growth", Conta: "mobile banking payment phone",
  Seguranca: "security phone protection lock", Financas: "budget money home calculator", Impostos: "tax documents calculator",
  Beneficios: "money help government document", Aposentadoria: "retirement senior savings couple", Renda: "working home laptop money",
};
const CAT_LABEL = { Cartao: "Cartão de Crédito", Emprestimo: "Empréstimo", Financiamento: "Financiamento", Dividas: "Dívidas", Investimentos: "Investimentos", Conta: "Conta Digital", Seguranca: "Segurança Financeira", Financas: "Finanças Pessoais", Impostos: "Impostos", Beneficios: "Benefícios", Aposentadoria: "Aposentadoria", Renda: "Renda Extra" };

// Pool grande de temas — o robô escolhe um que ainda NÃO foi publicado (dedup pelo feed)
const POOL = [
  ["como declarar o Imposto de Renda 2026 pela primeira vez", "Impostos"],
  ["malha fina do IR: como evitar cair e o que fazer se cair", "Impostos"],
  ["IPVA 2026: como pagar mais barato, parcelar e conseguir isenção", "Impostos"],
  ["IPTU: como conseguir desconto e parcelar sem juros", "Impostos"],
  ["imposto de renda sobre investimentos: quanto você realmente paga", "Impostos"],
  ["como declarar ações e fundos imobiliários no Imposto de Renda", "Impostos"],
  ["LCI e LCA: renda fixa isenta de IR que rende mais que a poupança", "Investimentos"],
  ["fundos imobiliários (FIIs): como receber aluguel todo mês", "Investimentos"],
  ["como investir os primeiros R$ 100 e começar do zero", "Investimentos"],
  ["renda passiva: como construir uma que paga suas contas", "Investimentos"],
  ["Tesouro Direto: como funciona e qual título escolher", "Investimentos"],
  ["Tesouro IPCA+: como proteger seu dinheiro da inflação", "Investimentos"],
  ["reserva de emergência: quanto ter e onde guardar para render", "Investimentos"],
  ["como se proteger do câmbio investindo em dólar", "Investimentos"],
  ["dividendos: como montar uma carteira que paga renda mensal", "Investimentos"],
  ["previdência privada PGBL ou VGBL: qual escolher", "Investimentos"],
  ["como aumentar o limite do cartão de crédito com segurança", "Cartao"],
  ["cartão de crédito consignado: como funciona e quando vale a pena", "Cartao"],
  ["anuidade do cartão: como conseguir isenção", "Cartao"],
  ["como usar o cartão de crédito a seu favor e nunca pagar juros", "Cartao"],
  ["score de crédito: como aumentar rápido em 2026", "Financas"],
  ["como limpar o nome no Serasa e voltar a ter crédito", "Dividas"],
  ["portabilidade de dívida: como transferir e pagar menos juros", "Dividas"],
  ["como quitar dívidas usando o método bola de neve", "Dividas"],
  ["por que o rotativo do cartão é a dívida mais cara do Brasil", "Dividas"],
  ["como sair do cheque especial e nunca mais voltar", "Dividas"],
  ["empréstimo consignado: vantagens, riscos e cuidados", "Emprestimo"],
  ["empréstimo com garantia de imóvel: vale a pena?", "Emprestimo"],
  ["CET: como descobrir o custo real do seu empréstimo", "Emprestimo"],
  ["financiamento imobiliário: sistema SAC ou Price, qual escolher", "Financiamento"],
  ["como usar o FGTS na compra do imóvel e reduzir a parcela", "Financiamento"],
  ["financiamento de carro: como simular e pagar menos juros", "Financiamento"],
  ["consórcio ou financiamento: qual compensa mais", "Financiamento"],
  ["como sair do aluguel e comprar a casa própria", "Financiamento"],
  ["Open Finance: o que é e como usar a seu favor", "Conta"],
  ["conta digital x conta tradicional: qual vale mais a pena", "Conta"],
  ["Pix: limites, segurança e truques que você não conhece", "Conta"],
  ["salário mínimo 2026: novo valor e o que muda no seu bolso", "Financas"],
  ["como economizar na conta de luz com mudanças simples", "Financas"],
  ["planejamento financeiro para casais: como organizar as contas", "Financas"],
  ["como sair do vermelho e organizar as finanças em 90 dias", "Financas"],
  ["educação financeira infantil: como ensinar dinheiro aos filhos", "Financas"],
  ["como juntar dinheiro para viajar em 12 meses", "Financas"],
  ["regra 50-30-20: como dividir seu salário e sobrar dinheiro", "Financas"],
  ["como fazer um orçamento mensal que realmente funciona", "Financas"],
  ["abono salarial PIS/PASEP 2026: calendário e valores", "Beneficios"],
  ["Auxílio Gás e programas sociais 2026: quem tem direito", "Beneficios"],
  ["saque-aniversário do FGTS: vale a pena antecipar?", "Beneficios"],
  ["dinheiro esquecido no banco: como consultar e sacar", "Beneficios"],
  ["BPC/LOAS: quem tem direito ao benefício de um salário mínimo", "Aposentadoria"],
  ["aposentadoria por idade x tempo de contribuição: qual escolher", "Aposentadoria"],
  ["como consultar o extrato do INSS e simular sua aposentadoria", "Aposentadoria"],
  ["revisão da vida toda do INSS: o que é e quem pode pedir", "Aposentadoria"],
  ["como se aposentar mais cedo: estratégias legais", "Aposentadoria"],
  ["golpe do Pix: como se proteger e o que fazer se cair", "Seguranca"],
  ["golpe do falso boleto e da falsa central: como identificar", "Seguranca"],
  ["como recuperar dinheiro de golpe pelo MED do Banco Central", "Seguranca"],
  ["cartão clonado: o que fazer e como se proteger", "Seguranca"],
  ["como proteger suas senhas e dados bancários de golpistas", "Seguranca"],
  ["como ganhar dinheiro com marketing de afiliados em 2026", "Renda"],
  ["como vender na internet sem estoque do zero", "Renda"],
  ["trabalho remoto: profissões que pagam em dólar", "Renda"],
  ["como criar uma renda extra com pouco investimento", "Renda"],
  ["como transformar um hobby em fonte de renda", "Renda"],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

async function getToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH, grant_type: "refresh_token" }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j));
  return j.access_token;
}

async function titulosExistentes() {
  try {
    const r = await fetch(`https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=500`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const j = await r.json();
    return ((j.feed && j.feed.entry) || []).map(e => norm(e.title.$t));
  } catch { return []; }
}

async function buscarNoticias(catKey) {
  const query = NEWS_Q[catKey] || "economia finanças Brasil";
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:45d")}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(9000) });
    const xml = await r.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    return items.slice(0, 4).map(it => {
      const g = re => { const m = it.match(re); return m ? m[1] : ""; };
      return { titulo: (g(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || "").replace(/&amp;/g, "&"), fonte: g(/<source[^>]*>(.*?)<\/source>/) };
    }).filter(n => n.titulo);
  } catch { return []; }
}

// Chama a IA com cadeia de reforço: OpenRouter (gpt-4o-mini -> modelo grátis) -> Pollinations
async function callAI(prompt) {
  const OR = process.env.OPENROUTER_API_KEY;
  if (OR) {
    const models = ["openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct:free"];
    for (const model of models) {
      for (let t = 0; t < 3; t++) {
        try {
          const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: "Bearer " + OR, "Content-Type": "application/json", "HTTP-Referer": "https://dinheironodiaadia2026.blogspot.com", "X-Title": "Dinheiro no Dia a Dia" },
            body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.8, max_tokens: 3500 }),
            signal: AbortSignal.timeout(90000),
          });
          if (r.status === 429 || r.status >= 500) { await sleep(12000); continue; }
          if (!r.ok) break; // 401/402/404 -> próximo modelo
          const c = (await r.json()).choices?.[0]?.message?.content?.trim();
          if (c && c.length > 400) { console.log("IA: OpenRouter/" + model); return c; }
        } catch { await sleep(5000); }
      }
    }
  }
  // fallback: Pollinations (grátis, sem chave)
  for (let t = 0; t < 4; t++) {
    try {
      const r = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: "openai-fast", messages: [{ role: "user", content: prompt }], temperature: 0.78 }), signal: AbortSignal.timeout(90000) });
      if (r.status === 429) { await sleep(20000); continue; }
      if (!r.ok) { await sleep(8000); continue; }
      const c = (await r.json()).choices?.[0]?.message?.content?.trim();
      if (c && c.length > 400) { console.log("IA: Pollinations"); return c; }
      await sleep(6000);
    } catch { await sleep(6000); }
  }
  return null;
}

async function gerar(tema, noticias) {
  const ctx = noticias.length ? `\n\nNOTÍCIAS RECENTES DO BRASIL (use 1-2 como gancho na abertura, cite a fonte; NÃO invente números):\n${noticias.map(n => "- " + n.titulo + " (" + n.fonte + ")").join("\n")}` : "";
  const prompt = `Você é editor(a)-chefe de um portal premium de finanças pessoais no Brasil. Escreva um artigo EXTREMAMENTE PREMIUM, aprofundado e original em português sobre: "${tema}".${ctx}\n\nEXIGÊNCIAS: 1000-1500 palavras, denso e específico (passos, exemplos, faixas de valores). Abertura ancorada na atualidade. 5-7 <h2> com <h3>, <ul><li> e onde couber UMA <table>. Tom de autoridade, use você. Seção <h2>Perguntas frequentes</h2> com 4 <h3>. NÃO cite marcas específicas nem invente taxas exatas. NÃO se identifique como IA. NÃO escreva html/head/body/h1 nem markdown.\n\nFORMATO (exato):\nLinha 1: TITULO: <título até 65 caracteres>\nLinha 2: RESUMO: <1-2 frases valiosas>\nDepois: corpo em HTML puro (começando com <p>).`;
  const c = await callAI(prompt);
  if (!c) return null;
  const titulo = (c.match(/TITULO:\s*(.+)/i)?.[1] || tema).trim().replace(/^["#*\s]+|["*\s]+$/g, "").slice(0, 70);
  const resumo = (c.match(/RESUMO:\s*(.+)/i)?.[1] || "").trim();
  let corpo = /RESUMO:/i.test(c) ? c.replace(/^[\s\S]*?RESUMO:.*(?:\r?\n)+/i, "").trim() : c.replace(/^[\s\S]*?TITULO:.*(?:\r?\n)+/i, "").trim();
  corpo = corpo.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return corpo.length >= 500 ? { titulo, resumo, corpo } : null;
}

function montar(art, img, tema, noticias) {
  const alt = (tema || "finanças").replace(/"/g, "");
  const fig = `<figure style="margin:0 0 24px"><img src="${img}" alt="${alt}" style="width:100%;height:auto;border-radius:14px" /></figure>`;
  const tl = art.resumo ? `<div style="background:linear-gradient(135deg,#f0f7ff,#eef4ff);border-left:5px solid #1a73e8;padding:18px 22px;border-radius:12px;margin:0 0 26px;font-size:1.05em"><strong style="color:#1a4fa0">📌 Resumo rápido:</strong> ${art.resumo}</div>` : "";
  const fontes = noticias.length ? `\n<div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:14px 18px;margin:26px 0;font-size:.9em;color:#555"><strong>Contexto e atualidade:</strong> considera o noticiário econômico brasileiro recente${noticias[0]?.fonte ? " (como " + noticias[0].fonte + ")" : ""}.</div>` : "";
  const aviso = `\n<p style="font-size:.88em;color:#777;border-top:1px solid #eee;padding-top:14px;margin-top:28px"><em>Este conteúdo é informativo e não constitui recomendação financeira individual. Compare condições e, se possível, consulte um profissional.</em></p>`;
  return fig + tl + art.corpo + fontes + aviso;
}

(async () => {
  const existentes = await titulosExistentes();
  const jaTem = tema => { const w = norm(tema).split(" ").filter(x => x.length > 3); return existentes.some(t => w.filter(x => t.includes(x)).length >= Math.max(3, Math.ceil(w.length * 0.6))); };
  const candidatos = POOL.filter(([tema]) => !jaTem(tema));
  if (!candidatos.length) { console.log("Todos os temas do pool já foram publicados. Adicione novos temas ao POOL."); return; }
  // escolhe um tema aleatório entre os ainda NÃO publicados (garante variedade manhã/noite)
  const [tema, catKey] = candidatos[Math.floor(Math.random() * candidatos.length)];
  console.log("Tema escolhido:", tema, "| categoria:", catKey, "| candidatos:", candidatos.length);

  const noticias = await buscarNoticias(catKey);
  const art = await gerar(tema, noticias);
  if (!art) { console.error("❌ Geração de IA falhou após retries."); process.exit(1); }
  const seed = Math.floor((Date.now() % 999999));
  const img = "https://image.pollinations.ai/prompt/" + encodeURIComponent((IMG_Q[catKey] || "finance money") + " premium professional photography") + "?width=1200&height=630&seed=" + seed + "&nologo=true";
  const html = montar(art, img, tema, noticias);
  const label = CAT_LABEL[catKey] || "Finanças";

  const token = await getToken();
  const pr = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/?isDraft=false`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ kind: "blogger#post", title: art.titulo, content: html, labels: [label] }) });
  const pd = await pr.json();
  if (pd.url) { console.log("✅ PUBLICADO:", art.titulo, "→", pd.url); }
  else { console.error("❌ FALHA ao publicar:", JSON.stringify(pd.error?.message || pd).slice(0, 200)); process.exit(1); }
})().catch(e => { console.error("FALHA GERAL:", e.message); process.exit(1); });
