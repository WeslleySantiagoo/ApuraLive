# ApuraLive — A apuração, em tempo real.

<div align="center">

[![Acessar ApuraLive](https://img.shields.io/badge/🟢%20ONLINE-Acessar%20ApuraLive-18181B?style=for-the-badge&logo=vercel&logoColor=white)](https://apura-live.vercel.app/)
[![API Backend](https://img.shields.io/badge/API-Render%20Web%20Service-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://apuralive.onrender.com/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg?style=for-the-badge)](LICENSE)

### 🌐 [https://apura-live.vercel.app/](https://apura-live.vercel.app/)
**Acompanhamento independente e em tempo real da apuração presidencial com dados oficiais do Tribunal Superior Eleitoral (TSE).**

---

<p align="center">
  <img src="docs/images/dashboard-full.png" alt="ApuraLive Dashboard Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

</div>

---

> [!IMPORTANT]
> **Aviso Editorial e Legal (Projeto Independente):**
> O **ApuraLive** é uma plataforma jornalística e tecnológica independente, sem qualquer afiliação institucional, patrocínio ou vínculo com o Tribunal Superior Eleitoral (TSE) ou partidos políticos. Os dados são obtidos diretamente das fontes públicas oficiais da Justiça Eleitoral. A proclamação e homologação dos resultados são atribuições exclusivas do TSE.

---

## ✨ Funcionalidades Principais

### 1. Placar Nacional em Tempo Real
- **Dados Oficiais**: Totalização de seções, votos válidos, brancos, nulos e abstenção diretamente da CDN oficial do TSE.
- **Identificação Visual**: Cores de referência oficial (**Vermelho `#E53935` para Lula** e **Azul `#2563EB` para Flávio Bolsonaro**) com fotografias e dados nominais atualizados.
- **Diferença Dinâmica**: Margem em votos e em pontos percentuais calculada em tempo real.

### 2. Análise Amigável de Irreversibilidade Matemática
- Abstrai a complexidade jurídica e matemática para responder à pergunta essencial: **"Quantos votos faltam para o líder garantir a vitória matemática?"**
- Calcula a barreira matemática intransponível sobre o teto conservador das urnas ainda por apurar:
  $$\text{Votos Necessários} = \max\left(1, \left\lfloor \frac{R - D}{2} \right\rfloor + 1\right)$$
  *(Onde $D$ é a vantagem atual do líder e $R$ é o teto de votos válidos das seções pendentes)*.

### 3. Mapa Eleitoral Interativo (Zero Flicker)
- **MapLibre GL JS**: Mapa vetorial otimizado com polígonos dos 27 estados da federação.
- **Atualização Fluida**: O mapa atualiza as cores dos estados vencedores dinamicamente via propriedades vetoriais **sem recriar o canvas e sem resetar zoom ou posição** enquanto o usuário navega.
- **Popup Detalhado**: Clique em qualquer estado para abrir imediatamente o modal com a barra de urnas apuradas e o placar nominal de votos daquele estado.

### 4. Acompanhamento Regional com Barra de Progresso
- Painel para as 5 macrorregiões brasileiras (*Norte, Nordeste, Centro-Oeste, Sudeste e Sul*).
- Sidebar detalhada comparando visualmente as **Urnas Apuradas** versus **Urnas Faltantes** da região selecionada.

### 5. Rankings Estaduais
- Tabela com ordenação instantânea por **Maior Margem** ou por **Volume de Votos Válidos**, com busca interativa por estado ou sigla (UF).

### 6. Simulador de Cenários Hipotéticos
- Posicionado na seção inferior, permite ao usuário mover sliders para projetar como ficaria o resultado final se os votos restantes fossem distribuídos em determinada proporção.
- Selo de integridade visível: *Simulação Hipotética — Não é Resultado Oficial*.

### 7. Exportação e Compartilhamento
- Exportação dos dados da apuração em tempo real nos formatos **JSON** e **CSV**.
- Botão rápido para copiar resumo formatado pronto para redes sociais.

---

## 🏛️ Arquitetura Técnica (Zero Banco de Dados)

```
                    ┌───────────────────────────────┐
                    │  CDN Oficial do TSE           │
                    │  (Arquivos EA14, EA20 JSON)   │
                    └───────────────▲───────────────┘
                                    │ HTTPX (Cache + ETag 304 + Single-Flight)
                    ┌───────────────┴───────────────┐
                    │  Backend FastAPI (Python)     │
                    │  Deploy: Render Web Service   │
                    │  https://apuralive.onrender.com│
                    └───────────────▲───────────────┘
                                    │ REST / CORS Universal
                    ┌───────────────┴───────────────┐
                    │  Frontend SPA (React 19 + TS) │
                    │  Deploy: Vercel               │
                    │  https://apura-live.vercel.app│
                    └───────────────────────────────┘
```

- **Resiliência contra Quedas**: Cache inteligente com single-flight (`asyncio.Lock`). Se 100 usuários acessarem a API simultaneamente, apenas 1 consulta externa ao TSE é executada.
- **Suporte a 304 Not Modified**: O cliente preserva os últimos dados válidos quando a fonte retorna 304, eliminando oscilações e respostas vazias na interface.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** 20+
- **Python** 3.11+

### 1. Clonar o Repositório
```bash
git clone https://github.com/WeslleySantiagoo/ApuraLive.git
cd ApuraLive
```

### 2. Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Iniciar servidor FastAPI na porta 8000
uvicorn app.main:app --reload --port 8000
```
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend (Vite + React)
```bash
cd frontend
npm install

# Iniciar em modo de desenvolvimento na porta 5173
npm run dev
```
Acesse [http://localhost:5173](http://localhost:5173).

### 4. Executar os Testes Automatizados
```bash
# Testes do Backend (pytest)
PYTHONPATH=backend ./backend/.venv/bin/pytest backend/tests -v

# Build de Produção do Frontend
cd frontend && npm run build
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE).
