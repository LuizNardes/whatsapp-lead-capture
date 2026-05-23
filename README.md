# 📲 WhatsApp Lead Capture → Google Sheets

> Toda mensagem recebida no WhatsApp vira um lead organizado na planilha — sem copiar, sem perder contato, sem esforço manual.

![Status](https://img.shields.io/badge/status-funcionando-brightgreen)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Z-API](https://img.shields.io/badge/WhatsApp-Z--API-25D366?logo=whatsapp&logoColor=white)

---

## 🎯 Problema

Pequenas e médias empresas que vendem pelo WhatsApp enfrentam um problema silencioso: **leads se perdem no histórico de conversas**. A primeira mensagem chega, o atendente está ocupado, e quando lembra — o contato esfriou.

Além disso, não há registro centralizado de quem entrou em contato, quando, e o que perguntou. A única "memória" do negócio vive no celular do vendedor. Se ele sair da empresa, os dados vão junto.

O trabalho manual de copiar número, nome e mensagem para uma planilha é repetitivo, sujeito a erros e simplesmente não acontece quando o volume aumenta.

## 💡 Solução

Um servidor que fica ouvindo o WhatsApp e, a cada primeira mensagem de um novo contato, registra automaticamente na planilha:

- ✅ Captura o lead no momento exato em que ele entra em contato
- ✅ Registra nome, telefone, mensagem inicial e horário automaticamente
- ✅ Evita duplicatas — cada número é registrado uma única vez
- ✅ Ignora mensagens de grupos e mensagens enviadas pelo próprio número
- ✅ Planilha pronta para o time de vendas trabalhar, sem nenhum esforço manual

## 🛠 Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Servidor | Express |
| WhatsApp | Z-API (webhook) |
| Planilha | Google Sheets API v4 (Service Account) |
| Deploy | Railway |

## 🏗 Arquitetura

```mermaid
sequenceDiagram
    participant C as Cliente
    participant W as WhatsApp
    participant Z as Z-API
    participant S as Servidor Express
    participant G as Google Sheets

    C->>W: Envia mensagem
    W->>Z: Evento de mensagem recebida
    Z->>S: POST /webhook/zapi
    S->>S: Valida token + filtra duplicatas
    S->>G: Adiciona linha na aba "Leads"
    G-->>S: 200 OK
    S-->>Z: { ok: true }
```

## ⚙️ Como funciona

1. **Recepção:** O Z-API monitora o número de WhatsApp e dispara um webhook a cada mensagem recebida
2. **Validação:** O servidor verifica o `Client-Token` para garantir que a requisição veio do Z-API
3. **Filtragem:** Mensagens `fromMe`, de grupos e de números já registrados são descartadas
4. **Extração:** Nome (`senderName`), telefone (`phone`), texto da mensagem e timestamp são extraídos do payload
5. **Registro:** O lead é inserido via Google Sheets API na aba `Leads`, com status inicial `Novo`

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Conta Z-API com instância pareada ([z-api.io](https://z-api.io))
- Google Cloud Project com Sheets API ativada e Service Account criada

### Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/luizgnardes/wpp-lead-capture.git
cd wpp-lead-capture

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

### Variáveis de ambiente

```env
PORT=3000

# Z-API
ZAPI_INSTANCE_ID=seu-instance-id
ZAPI_TOKEN=seu-token
ZAPI_SECURITY_TOKEN=seu-security-token

# Google Sheets
GOOGLE_SHEET_ID=id-da-sua-planilha
GOOGLE_SERVICE_ACCOUNT_EMAIL=sua-conta@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Rodando

```bash
# Desenvolvimento (hot reload)
npm run dev

# Expor para a internet (necessário para receber webhooks)
ngrok http 3000
```

Configure a URL `https://sua-url.ngrok.io/webhook/zapi` no painel Z-API em **Webhooks → On Message Received**.

### Estrutura do projeto

```
src/
├── config/
│   └── env.ts          # Variáveis de ambiente tipadas
├── services/
│   ├── lead.ts         # Parse e filtragem do payload Z-API
│   └── sheets.ts       # Integração Google Sheets
├── types/
│   └── index.ts        # Tipos TypeScript
├── webhooks/
│   └── zapi.ts         # Rota POST /webhook/zapi
└── server.ts           # Entry point Express
```

## 📊 Potencial de impacto

- ⏱ Elimina 100% do trabalho manual de copiar leads para planilha
- 📉 Zero leads perdidos por esquecimento ou volume alto de mensagens
- 📈 Base de dados estruturada desde o primeiro contato, pronta para análise

## 📝 Aprendizados

**O maior desafio foi a configuração da infraestrutura.** Tentei usar Evolution API (self-hosted) com Docker, mas a v2.2.3 apresenta um bug em ambientes Windows/WSL2: o Baileys identifica o kernel do WSL2 como versão do Chrome, fazendo o WhatsApp rejeitar a conexão silenciosamente. A decisão de migrar para Z-API (SaaS) foi pragmática e permitiu focar no que realmente importa — a integração em si.

**Decisão técnica interessante:** a deduplicação de leads usa um `Set` em memória em vez de banco de dados. Para um MVP isso é suficiente e simples, mas em produção real precisaria de persistência (SQLite ou Redis) para sobreviver a restarts do servidor.

**Google Sheets como "banco de dados":** a escolha deliberada de usar planilha em vez de banco relacional torna o sistema imediatamente utilizável por qualquer pessoa do negócio, sem nenhuma curva de aprendizado.

---

📬 Desenvolvido por **Luiz Nardes** | [LinkedIn](https://linkedin.com/in/luizgnardes) | Disponível para projetos similares.
