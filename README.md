# Dinheiro no Dia a Dia — Robô Diário 🤖

Publica **1 artigo premium de finanças por dia** no blog automaticamente, via GitHub Actions.
Independente do Vercel e do Firebase. 100% grátis.

## Como funciona
- Todo dia às **09:00 (Brasília)** o GitHub Actions roda `scripts/daily-post.js`
- Escolhe um tema do pool que **ainda não foi publicado** (dedup pelo feed do blog)
- Gera um artigo premium com IA grátis (Pollinations) + notícia real (Google News)
- Publica direto pela API do Blogger

## Secrets necessários (Settings → Secrets and variables → Actions)
- `BLOGGER_CLIENT_ID`
- `BLOGGER_CLIENT_SECRET`
- `BLOGGER_REFRESH_TOKEN`
- `BLOGGER_BLOG_ID`

## Rodar manualmente
Aba **Actions** → **Post diário no blog** → **Run workflow**.

## Adicionar mais temas
Edite o array `POOL` em `scripts/daily-post.js`.
