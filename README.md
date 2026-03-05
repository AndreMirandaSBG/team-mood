# Team Mood

Aplicação web PWA para recolha semanal e anónima do mood da equipa.

## Pré-requisitos

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Conta Google com um projecto Firebase (Blaze plan para Cloud Scheduler)

---

## Setup Firebase

### 1. Criar projecto Firebase

1. Vai a [console.firebase.google.com](https://console.firebase.google.com)
2. Cria um novo projecto (ou usa um existente)
3. Activa o **Blaze plan** (necessário para Cloud Scheduler e Functions)

### 2. Activar serviços

No Firebase Console, activa:
- **Authentication** → Sign-in method → Anonymous ✓
- **Firestore Database** → Criar base de dados (modo produção)
- **Hosting** ✓
- **Functions** ✓
- **Cloud Messaging** ✓

### 3. Obter configuração da web app

Firebase Console → Project Settings → Your apps → Add app → Web

Copia os valores para `web/.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. VAPID key (push notifications)

Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair

Adiciona ao `.env.local`:
```
VITE_FIREBASE_VAPID_KEY=...
```

### 5. Actualizar .firebaserc

```json
{
  "projects": {
    "default": "SEU_PROJECT_ID"
  }
}
```

---

## Desenvolvimento local

```bash
# Web
cd web
cp .env.example .env.local  # preenche os valores
npm install
npm run dev

# Emuladores Firebase (noutra aba)
cd ..
firebase emulators:start
```

---

## Deploy

```bash
# Build da web app
cd web && npm run build && cd ..

# Deploy tudo (hosting + functions + rules)
firebase deploy

# Ou separadamente:
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## Estrutura do projecto

```
team-mood/
├── firebase.json          # configuração Firebase
├── firestore.rules        # regras de segurança Firestore
├── firestore.indexes.json # índices Firestore
├── .firebaserc            # ID do projecto Firebase
├── functions/             # Cloud Functions (Node 20 + TypeScript)
│   └── src/
│       ├── aggregateStats.ts      # trigger on mood write → recalcula weekly_stats
│       └── sendWeeklyReminder.ts  # cron segundas 9h → FCM push notifications
└── web/                   # Frontend React + Vite + PWA
    └── src/
        ├── firebase.ts            # init Firebase SDK
        ├── App.tsx                # routing + anon auth + navbar
        ├── hooks/
        │   ├── useMood.ts         # submit mood, verificar semana atual
        │   ├── useWeeklyStats.ts  # ler weekly_stats do Firestore
        │   ├── useNotifications.ts# FCM permission + token management
        │   └── useWeekKey.ts      # ISO week key utilities
        ├── pages/
        │   ├── SubmitPage.tsx     # página principal de submissão
        │   ├── DashboardPage.tsx  # gráficos e distribuição
        │   └── SettingsPage.tsx   # notificações + info privacidade
        └── components/
            ├── MoodPicker.tsx     # selector 1-10 com feedback emoji
            ├── WeeklyChart.tsx    # gráfico de linha (Recharts)
            └── DistributionBar.tsx# barras de distribuição por score
```

---

## Privacidade & Anonimização

- O Firebase Anonymous Auth gera um `uid` persistido localmente (sem conta, sem email)
- Antes de guardar, o `uid` é transformado via `sha256(uid + projectId)` — **não reversível**
- O dashboard só mostra dados **agregados** — nunca individuais
- Semanas com **menos de 3 respostas** não aparecem no dashboard
- Os tokens FCM ficam numa colecção separada **sem ligação** ao uid de autenticação
- As Firestore Security Rules impedem leitura de entradas individuais de mood

---

## Ícones PWA

Cria os ficheiros em `web/public/icons/`:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

Usa um fundo sólido (cor `#4a52e8`) com ícone branco para funcionar como maskable icon.
Ferramenta recomendada: [maskable.app/editor](https://maskable.app/editor)
