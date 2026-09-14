# Casa Vellumine — Sistema de Reserva de Produtos

Sistema completo e responsivo de catálogo, reservas de produtos e montagem de embalagens para presente da **Casa Vellumine**, com painel administrativo integrado ao **Supabase**.

---

## 🚀 Como Executar Imediatamente (Sem Instalação)

O projeto conta com uma versão standalone autônoma que não exige Node.js, Python ou instalação de dependências:

1. Acesse a pasta do projeto:
   ```
   C:\Users\Ideapad\.gemini\antigravity\scratch\casa-vellumine
   ```
2. Dê um **duplo clique no arquivo `index.html`** (ou abra com Google Chrome, Microsoft Edge ou Firefox).
3. A aplicação carregará instantaneamente com o catálogo de velas, aromas, carrinho interativo, sistema de embalagens e painel do lojista!

> 💡 **Recomendação**: Defina a pasta `C:\Users\Ideapad\.gemini\antigravity\scratch\casa-vellumine` como sua área de trabalho ativa para fácil acesso.

---

## ✨ Recursos Implementados

### 1. Experiência do Cliente
- **Catálogo de Velas e Aromas**: Filtro por categorias (*Vela Aromática, Home Spray, Difusor de Varetas, Wax Melts*), barra de pesquisa em tempo real e galeria de fotos com carrossel interativo.
- **Carrinho Dinâmico**: Controle de quantidade e cálculo automático de subtotais e valor total.
- **Módulo de Embalagens para Presente**: Permite que o cliente divida os itens do carrinho em diferentes caixas de presente (Caixa 1, Caixa 2, etc.), com indicador de itens alocados vs disponíveis.
- **Checkout Rápido**: Coleta simplificada de Nome, WhatsApp (com máscara automática) e observações de retirada.
- **Integração com WhatsApp**: Na tela de confirmação, um botão **"Enviar Pedido no WhatsApp da Loja"** abre diretamente o WhatsApp com uma mensagem pré-formatada contendo código do pedido, lista de produtos, detalhes de embalagens e total.

### 2. Painel do Administrador (Lojista)
- **Login Seguro**: Autenticação via Supabase Auth (e botão de acesso em *Modo Demonstração* para testes imediatos sem necessidade de conta prévia).
- **Dashboard com Métricas em Tempo Real**: Total de reservas, clientes únicos, total de peças reservadas, faturamento estimado e ranking dos 5 produtos mais pedidos.
- **Gestão de Produtos**: Cadastro, edição, ativação/inativação no catálogo, upload de fotos (via URL ou arquivo do computador), foto principal e criação dinâmica de novas categorias.
- **Reservas por Cliente**: Acompanhamento detalhado de pedidos, alteração de status (*Pendente, Confirmada, Pronta para Retirada, Concluída, Cancelada*) e botão direto para conversar com o cliente no WhatsApp em 1 clique.
- **Separação por Item (Produção)**: Consolidação automática de quantas unidades de cada aroma e tamanho precisam ser separadas/fabricadas.
- **Exportação CSV**: Download de relatório completo de reservas para Excel ou Google Planilhas.
- **Resiliência e Modo Híbrido**: Caso o Supabase esteja offline ou as tabelas ainda não tenham sido criadas, o sistema salva e recupera dados no `localStorage`, garantindo zero interrupções.

---

## 🗄️ Configuração do Banco de Dados Supabase

Para conectar o sistema ao seu próprio banco de dados Supabase na nuvem:

1. Acesse o painel do [Supabase](https://supabase.com) e entre no seu projeto.
2. No menu lateral esquerdo, vá em **SQL Editor**.
3. Clique em **New query**, cole todo o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) e clique em **Run**.
   - Isso criará as tabelas `products`, `categories` e `reservations`.
   - Aplicará as políticas de segurança (Row Level Security - RLS).
   - Inserirá o catálogo inicial de produtos com fotos em alta resolução.
4. Para criar o usuário do administrador:
   - Vá em **Authentication > Users > Add user > Create user**.
   - Digite o e-mail e senha desejados (ex: `admin@casavellumine.com`).
5. No painel administrativo da aplicação, vá na aba **"Conexão & Banco"** e insira a URL e Chave Pública (Publishable Key) do seu projeto se desejar customizar.

---

## 📁 Estrutura de Arquivos

```
casa-vellumine/
├── index.html              # Aplicação completa pronta para uso no navegador
├── supabase_schema.sql     # Script SQL para o banco de dados Supabase
├── README.md               # Documentação completa de uso
├── package.json            # Configuração para desenvolvimento com Vite/React
└── src/
    └── supabaseClient.js   # Módulo com chamadas REST e Auth
```
