# Casa Vellumine — Sistema de Reservas & Gestão de Encomendas

Sistema completo e autônomo para reserva de velas e produtos aromáticos artesanais da **Casa Vellumine**, com gestão de estoque/catálogo, montagem personalizada de caixas de presente e painel administrativo integrado.

## Arquitetura Cloudflare

- **Hospedagem & CDN:** Cloudflare Workers com Assets Estáticos
- **Banco de Dados Persistente:** Cloudflare D1 (`vellumine-db` — SQLite Serverless nativo)
- **ID do Banco D1:** `38698442-91c2-44a4-a577-cee0db48d212`
- **Zero Risco de Pausa:** Ao contrário de soluções externas gratuitas que pausam por inatividade após 7 dias, o Cloudflare D1 é 100% permanente e gratuito.
- **Capacidade Gratuita:** Até 5 milhões de leituras e 100.000 gravações por dia (suporta dezenas de milhares de reservas por mês).

## Estrutura do Projeto

```
casa-vellumine/
├── index.html              # Aplicação cliente e painel administrativo (React SPA)
├── wrangler.toml           # Configuração de deployment e bindings do Cloudflare D1
├── wrangler.jsonc          # Metadados e schema do Wrangler
├── src/
│   ├── worker.js           # API REST dos Workers com consultas SQL no Cloudflare D1
│   ├── apiClient.js        # Utilitário de requisições à API
│   └── App.jsx             # Componente raiz
└── package.json            # Scripts de build e dependências
```

## Acesso do Lojista (Painel Administrativo)

- Acesse pelo link com hash: `/#admin` (ou pelo botão no rodapé do site).
- **E-mail:** `admin@casavellumine.com`
- **Senha:** `vellumine_admin_123` (ou a senha cadastrada no primeiro acesso)
