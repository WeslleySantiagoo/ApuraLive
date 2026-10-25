# ApuraLive — A apuração, em tempo real.

O **ApuraLive** é uma aplicação independente para acompanhar a apuração das eleições presidenciais brasileiras em tempo real, utilizando dados oficiais do Tribunal Superior Eleitoral (TSE), mapas eleitorais interativos e cálculos matemáticos de irreversibilidade dos resultados.

> **Aviso Importante / Disclaimer:**
> O ApuraLive é um projeto jornalístico e tecnológico independente, sem qualquer afiliação institucional, patrocínio ou vínculo com o Tribunal Superior Eleitoral (TSE) ou com a Justiça Eleitoral brasileira. A proclamação oficial dos eleitos é atribuição constitucional exclusiva da Justiça Eleitoral.

---

## 🏛️ Arquitetura Técnica (Zero Banco de Dados)

A aplicação foi projetada para ser simples de manter, de custo zero e de alta resiliência:
- **Backend (Python 3.13 + FastAPI)**: consome arquivos oficiais do TSE (EA14, EA20), normaliza os campos, calcula margens e irreversibilidade, mantendo cache em memória com controle de concorrência (*single-flight*) para não sobrecarregar os servidores públicos.
- **Frontend (Vite + React 19 + TypeScript + Tailwind CSS)**: interface jornalística em tema escuro, mapas interativos com MapLibre GL JS (geometrias particionadas sob demanda), rankings, gráficos com Recharts e simulador de cenários 100% no cliente.
- **Armazenamento**: Zero banco de dados persistente. O cache reside exclusivamente na memória do processo com expiração automática (TTL).

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ (recomendado 20+)
- Python 3.11+ (recomendado 3.13)

### 2. Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Executar a API na porta 8000
uvicorn app.main:app --reload --port 8000
```
- Documentação interativa Swagger: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Resultados oficiais: `http://localhost:8000/api/v1/results/brazil`

### 3. Frontend (Vite)
```bash
cd frontend
npm install

# Iniciar servidor de desenvolvimento na porta 5173
npm run dev
```
Acesse `http://localhost:5173`.

### 4. Executando os Testes Automatizados
```bash
# Testes unitários do Backend (pytest)
PYTHONPATH=backend ./backend/.venv/bin/pytest backend/tests -v

# Validação e Build de Produção do Frontend (TypeScript + Vite)
cd frontend && npm run build
```

---

## 📐 Regras Matemáticas de Irreversibilidade

As fórmulas são processadas em módulo isolado (`backend/app/calculations/irreversibility.py`):

1. **Diferença de votos ($D$)**:
   $$D = V_A - V_B$$
2. **Critério de 2º Turno ($D > R$)**:
   - $R$ é o teto conservador superior de votos válidos ainda possíveis das seções pendentes de apuração.
   - Se $D > R$, a vitória é **matematicamente irreversível** (mesmo que 100% dos votos pendentes fossem atribuídos ao 2º colocado).
   - Se $D = R$, a disputa permanece aberta pois um empate exato ainda é matematicamente possível.
3. **Critério de 1º Turno**:
   $$V_A > \frac{V_{\text{válidos apurados}} + R}{2}$$
   O líder precisa ter mais da metade do total final máximo possível de votos válidos para garantir vitória em 1º turno.

---

## 🌐 Deploy em Serviços Gratuitos

### Frontend — Cloudflare Pages ou Vercel
1. Conecte o repositório Git.
2. Defina o diretório raiz como `frontend`.
3. Comando de build: `npm run build`.
4. Diretório de saída: `dist`.
5. Variável de ambiente:
   `VITE_API_URL=https://sua-api-no-render.onrender.com`

### Backend — Render Web Service
1. Crie um novo Web Service a partir do repositório Git.
2. Defina o Root Directory como `backend`.
3. Runtime: `Python 3`.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Variáveis de ambiente:
   - `TSE_ENV=live`
   - `CORS_ORIGINS=["https://seu-site.pages.dev"]`
