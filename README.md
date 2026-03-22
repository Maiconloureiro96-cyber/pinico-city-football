# Pinico City FC — Sorteio de Times

Aplicação web para montar **times equilibrados** nas peladas do grupo: cada jogador tem **habilidade de 1 a 5 estrelas** e o sorteio tenta deixar a **soma de estrelas** parecida entre os times.

## Funcionalidades

- **Cadastro** de jogadores com nome e estrelas (1–5).
- **Importação de lista** no estilo WhatsApp (títulos e linhas vazias são ignorados; formato `01 - Nome` suportado).
- Após colar a lista, use **Analisar lista** para **classificar cada jogador** com as estrelas antes de importar.
- **Ordem da lista importada** define prioridade para entrar em campo quando há **banco** (mais jogadores que vagas).
- **Sorteio** com algoritmo que equilibra força entre os times e mostra totais por time.
- **Timer de partida** na página inicial.
- Dados salvos no **navegador** (localStorage).

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router, export estático)
- React, TypeScript, Tailwind CSS
- Deploy: **GitHub Pages** via GitHub Actions

## Rodar localmente

Requisitos: Node.js 20+ (recomendado).

```bash
pnpm install
# ou: npm install

pnpm dev
# ou: npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Build de produção (gera a pasta `out/`):

```bash
pnpm build
```

## Publicação no GitHub Pages

O repositório inclui workflow em `.github/workflows/deploy.yml`. Ao fazer **push** na branch `main`, o site é gerado e publicado automaticamente (se o GitHub Pages estiver configurado para **GitHub Actions** nas configurações do repositório).

A URL do site segue o padrão:

`https://<usuario>.github.io/<nome-do-repositorio>/`

O `basePath` é definido no build a partir do [configure-pages](https://github.com/actions/configure-pages) (`BASE_PATH`), para que assets e rotas funcionem na subpasta do Pages.

## Licença

Uso interno do grupo / projeto particular, salvo definição contrária pelo mantenedor.
