# Commerce Compass

COMMERCE INTELLIGENCE ENGINE

MASTER BUILD PROMPT — v1.0

Você é o arquiteto e desenvolvedor principal de um sistema proprietário de inteligência para criação, teste, validação e escala de marcas de e-commerce.

NÃO construa uma plataforma de e-commerce genérica.

NÃO recrie funcionalidades que já pertencem a plataformas especializadas.

O objetivo é construir uma camada proprietária de inteligência, operação e aprendizado que fique acima de:

Nuvemshop = commerce engine

Dropi = sourcing / fulfillment automation

fornecedores = product supply

n8n = automation layer

Meta / TikTok / Google = acquisition

Lovable = inteligência, experiência, experimentação e controle

1. VISÃO DO PRODUTO

O sistema deve funcionar como uma:

COMMERCE INTELLIGENCE ENGINE

Uma máquina capaz de:

descobrir oportunidades de produtos;

avaliar fornecedores;

calcular potencial econômico;

criar e administrar marcas;

estruturar produtos e ofertas;

criar landing pages;

organizar criativos;

lançar experimentos;

medir resultados;

identificar vencedores;

eliminar perdedores;

escalar vencedores;

acumular conhecimento proprietário;

permitir replicação para novas marcas.

A primeira operação será:

BRAND:
DOG CAR LIFE™

PRODUCT:
FUR RESCUE KIT

MARKET:
United States

LANGUAGE:
English / US

CURRENCY:
USD

2. PRINCÍPIO ARQUITETURAL

Não duplicar:

checkout;

pagamentos;

gestão de pedidos;

estoque operacional;

cálculo de frete;

emissão de pedidos ao fornecedor;

tracking operacional;

infraestrutura básica de loja.

Essas responsabilidades pertencem às plataformas externas.

O sistema deve apenas:

consumir dados;

organizar dados;

analisar dados;

tomar decisões;

disparar automações;

apresentar inteligência;

registrar aprendizado.

3. ARQUITETURA

Arquitetura conceitual:

                ┌─────────────────────┐
                │  PRODUCT DISCOVERY  │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │    PRODUCT LAB      │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │    BRAND LAB        │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │   CREATIVE LAB      │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │ EXPERIMENT ENGINE   │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │ ANALYTICS / LEARNING│
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │ SCALE / KILL        │
                └─────────────────────┘


External commerce infrastructure:

Lovable
↓
Nuvemshop
↓
Dropi
↓
Supplier / Fulfillment

Acquisition:

Meta
TikTok
Google

Automation:

n8n

4. TECNOLOGIA

Use a stack moderna e simples.

Preferencialmente:

React

TypeScript

Tailwind

Supabase

PostgreSQL

autenticação segura

APIs server-side

webhooks

edge/server functions quando necessário

Não colocar secrets ou API keys no frontend.

Criar arquitetura preparada para integrações reais, mas NÃO fingir que uma integração existe quando ela ainda não foi configurada.

Quando uma integração não estiver configurada:

mostrar claramente:

NOT CONFIGURED

Nunca criar dados fictícios como se fossem dados reais.

5. DASHBOARD PRINCIPAL

Criar um Command Center extremamente limpo.

Não quero dashboard cyberpunk.

Não quero dezenas de cards.

Não quero visual de software empresarial antigo.

Estética:

premium

minimalista

sofisticada

muito espaço

tipografia forte

poucos elementos

informação hierarquizada

desktop e mobile

dark/light mode se fizer sentido

O usuário deve entender o estado da operação em poucos segundos.

Mostrar:

BUSINESS

Revenue
Orders
AOV
CAC
ROAS
Contribution Margin
Refund Rate

PIPELINE

Ideas
Sourcing
Testing
Validated
Scaling
Killed

ATTENTION

produtos que precisam de decisão;

experimentos com dados insuficientes;

fornecedores problemáticos;

campanhas deteriorando;

produtos próximos de validação.

6. PRODUCT LAB

Este é um dos módulos mais importantes.

Criar um sistema para administrar oportunidades de produtos.

Cada produto deve possuir:

nome;

nome interno;

marca;

categoria;

subcategoria;

mercado;

país;

fornecedor;

supplier SKU;

URL do fornecedor;

custo;

frete;

fulfillment cost;

taxas;

custo total;

preço sugerido;

margem bruta;

margem de contribuição;

MOQ;

estoque;

localização do estoque;

prazo estimado;

shipping method;

tracking;

return policy;

private label;

custom packaging;

score;

observações;

documentos;

imagens;

vídeos.

7. PRODUCT LIFECYCLE

Criar exatamente estes estados:

IDEA

SOURCING

SAMPLE

CREATIVE TEST

LANDING TEST

PAID TEST

VALIDATED

SCALE

KILLED

Cada mudança de estado deve ser registrada no histórico.

Exemplo:

Fur Rescue Kit

IDEA
↓
SOURCING
↓
SAMPLE
↓
CREATIVE TEST
↓
PAID TEST
↓
VALIDATED

8. PRODUCT SCORE

Criar um score de 0–100.

Critérios:

Demand
Problem severity
Visual demonstration
Margin
Shipping
Competition
Differentiation
Content potential
Upsell potential
Private label potential
Return risk
Regulatory risk

Mostrar:

SCORE: 87/100

E explicar quais fatores puxaram o score para cima ou para baixo.

Nunca inventar dados.

Se determinado dado não existir:

UNKNOWN

9. SUPPLIER LAB

Criar cadastro de fornecedores.

Campos:

Supplier
Country
Marketplace
Source
Product
SKU
Cost
MOQ
Stock
Warehouse
Shipping
Delivery estimate
Tracking
Returns
Packaging
Private label
Customization
Response time
Reliability
Supplier score

Criar comparação entre fornecedores.

Exemplo:

Fur Rescue Kit

NocNoc EUA
CJ
Alibaba supplier
Direct supplier
3PL

Mostrar qual possui:

BEST COST

BEST DELIVERY

BEST MARGIN

BEST BRANDING

BEST OVERALL

Não escolher automaticamente sem dados suficientes.

10. SOURCE WAR

Criar uma funcionalidade chamada:

SOURCE WAR

Permitir comparar múltiplas fontes para o mesmo produto.

Exemplo:

PRODUCT:
Fur Rescue Kit

Supplier A
Supplier B
Supplier C

Comparar:

Product cost
Shipping
Total landed cost
Delivery
Margin
MOQ
Branding
Returns
Stock

Criar ranking.

Objetivo:

Encontrar continuamente a melhor fonte para cada produto.

11. BRAND LAB

Criar arquitetura multi-brand.

Primeira marca:

DOG CAR LIFE™

Mercado:

United States

Idioma:

English

Moeda:

USD

Não mostrar outras marcas publicamente ainda.

Mas o sistema deve permitir posteriormente:

CAR BRAND

HOME BRAND

TRAVEL BRAND

etc.

Cada marca deve possuir:

Name
Logo
Colors
Typography
Voice
Positioning
Audience
Market
Country
Domain
Social accounts
Brand assets
Products
Landing pages
Campaigns

12. DOG CAR LIFE

Criar a primeira marca no sistema.

Posicionamento:

Dog owners who want to travel and live with their dogs without turning their car into a mess.

Territory:

DOG + CAR + FREEDOM + CLEANLINESS

Não posicionar como simples pet shop.

A marca deve parecer especializada.

Não utilizar estética genérica de dropshipping.

Referência estética:

premium outdoor
automotive
pet lifestyle

Visual:

real dogs
real cars
real mess
real transformation

13. PRIMEIRO PRODUTO

Criar:

FUR RESCUE KIT™

Conceito:

A compact system for removing dog hair from cars, carpets, upholstery and other surfaces.

Componentes planejados:

01 — THE SCRAPER

02 — THE DETAIL BRUSH

03 — THE COLLECTOR / ROLLER

04 — CARRY POUCH

Processo:

SCRAPE
→
DETAIL
→
COLLECT
→
DONE

Importante:

Esses componentes são o conceito do produto.

NÃO afirmar que determinado fornecedor já possui exatamente esse kit.

O Product Lab deve permitir montar o kit a partir de componentes de fornecedores.

14. PRODUCT PAGE / LANDING PAGE ENGINE

Criar um construtor de landing pages orientado a conversão.

Não criar um page builder genérico complexo.

Criar blocos reutilizáveis:

Hero
Problem
Before / After
How it works
Product
Benefits
Demonstration
Social proof
FAQ
Guarantee
Shipping
CTA
Upsell
Cross-sell

Cada landing page deve estar vinculada a:

Brand
Product
Offer
Experiment

15. CREATIVE LAB

Criar biblioteca de criativos.

Tipos:

UGC
Demo
Before / After
Problem / Solution
Humor
Lifestyle
ASMR
Testimonial
Comparison
Founder
Educational

Cada criativo deve possuir:

Creative ID
Brand
Product
Concept
Hook
Script
Format
Platform
Audience
Status
URL
Thumbnail
Video
Performance
Notes

16. HOOK LIBRARY

Criar biblioteca de hooks.

Exemplos para o Fur Rescue Kit:

"Dog owners know this problem."

"Your dog isn't the problem. The fur is."

"Before you pay for another car detail..."

"Watch what happens to this car seat."

Não tratar esses exemplos como dados vencedores.

Eles são apenas hipóteses criativas.

Registrar performance depois.

17. EXPERIMENT ENGINE

Criar sistema de experimentos.

Cada experimento deve possuir:

Experiment ID
Brand
Product
Hypothesis
Audience
Creative
Landing
Offer
Traffic source
Budget
Start date
End date
Status
Result
Decision

Status:

DRAFT
RUNNING
PAUSED
COMPLETED

18. FUNIL

Rastrear:

PAGE_VIEW
VIEW_CONTENT
ADD_TO_CART
BEGIN_CHECKOUT
PURCHASE
REFUND

Também:

LEAD
EMAIL_SIGNUP
COUPON
UPSELL

UTM:

utm_source
utm_medium
utm_campaign
utm_content
utm_term

Preservar atribuição.

19. ANALYTICS

Criar cálculo para:

CTR
CPC
CPM
ATC rate
Checkout rate
Conversion rate
CAC
AOV
ROAS
Gross margin
Contribution margin
Refund rate

Nunca confundir:

Revenue

com:

Profit.

20. ECONOMIC ENGINE

Criar calculadora econômica por produto.

Fórmula conceitual:

Selling Price

Product Cost

Shipping

Payment Fees

Platform Fees

Fulfillment Fees

Refund Allowance

Contribution Before Advertising

Depois:

Contribution Before Advertising

CAC

Contribution After Advertising

Mostrar claramente.

Nunca assumir números desconhecidos.

21. DECISION ENGINE

Criar recomendações baseadas em dados.

Exemplo:

PRODUCT:
Fur Rescue Kit

Decision:

CONTINUE TESTING

ou

SCALE

ou

REWORK OFFER

ou

CHANGE CREATIVE

ou

CHANGE SUPPLIER

ou

KILL

Toda recomendação deve mostrar:

WHY

e os indicadores usados.

Não criar uma IA que simplesmente diga "parece bom".

22. LEARNING ENGINE

Este é um dos ativos mais importantes.

Cada experimento deve gerar conhecimento.

Registrar:

Winning hooks
Winning creatives
Winning audiences
Winning offers
Winning landing structures
Winning suppliers
Winning price ranges
Winning products
Failed products
Failed angles

Criar:

KNOWLEDGE BASE

Exemplo:

"Before/after creative performs better than static product image for pet hair removal."

Só registrar como aprendizado consolidado quando houver dados suficientes.

Não transformar uma observação isolada em regra universal.

23. INTEGRATION CENTER

Criar uma área:

INTEGRATIONS

Mostrar:

Nuvemshop
Dropi
NocNoc
n8n
Meta
TikTok
Google
GA4
Supabase

Cada integração possui status:

CONNECTED
NOT CONFIGURED
ERROR

Nunca simular conexão.

24. NUVEMSHOP

Nuvemshop é o commerce engine.

Preparar integração para:

Products
Variants
Orders
Customers
Coupons
Stock
Shipping
Tracking
Webhooks

Usar API oficial quando configurada.

Não recriar checkout.

Não recriar payment processing.

Não criar banco paralelo de pedidos como fonte oficial.

O banco local deve armazenar apenas dados necessários para inteligência, sincronização e analytics.

25. DROPI

Dropi será tratado como:

SOURCING / FULFILLMENT LAYER

Preparar arquitetura para:

Product import
Supplier mapping
Stock synchronization
Price synchronization
Order automation
Tracking

Não afirmar integração ativa antes de configurar credenciais e testar.

26. NOCNOC EUA

Tratar NocNoc EUA como:

SUPPLIER SOURCE

Não assumir:

estoque americano;

prazo;

preço;

embalagem;

private label;

devolução;

sem dados confirmados.

Criar campos para registrar essas informações.

27. n8n

Criar arquitetura de webhooks.

Eventos:

ORDER_CREATED
ORDER_PAID
ORDER_FULFILLED
ORDER_SHIPPED
ORDER_DELIVERED
ORDER_CANCELLED
ORDER_REFUNDED

Também:

PRODUCT_CREATED
PRODUCT_UPDATED
STOCK_UPDATED

E eventos de marketing:

PURCHASE
LEAD
EMAIL_SIGNUP

Permitir webhook URLs configuráveis.

28. ACQUISITION

Preparar integrações para:

META
TIKTOK
GOOGLE ADS
GOOGLE ANALYTICS

Não criar uma ferramenta de gerenciamento de anúncios completa.

Nosso sistema deve ser:

INTELLIGENCE LAYER

e não:

AD PLATFORM.

29. AI LAYER

Criar uma camada de IA abstrata.

Nunca prender o sistema a um único provedor.

Estrutura:

AI_PROVIDER
MODEL
PROMPT
TASK
INPUT
OUTPUT
CONFIDENCE
CREATED_AT

Casos:

Product analysis
Supplier comparison
Creative generation
Hook generation
Landing copy
Experiment analysis
Decision support

Todas as respostas de IA devem ser claramente identificadas como:

AI GENERATED

quando apropriado.

30. SECURITY

Obrigatório:

API keys server-side

secrets fora do frontend

autenticação

autorização

Row Level Security

logs

validação de input

rate limiting quando necessário

webhook verification

não expor tokens

não armazenar dados sensíveis desnecessários

31. MULTI-LANGUAGE

Primeiro:

English US

Segundo:

Portuguese Brazil

Preparar:

Spanish

Todo texto da interface deve utilizar sistema de tradução.

Não espalhar strings diretamente pelo código.

32. MULTI-CURRENCY

Primeiro:

USD

Preparar:

BRL
EUR

Não utilizar conversão fictícia.

33. MOBILE FIRST

O sistema deve funcionar perfeitamente em:

Desktop
Tablet
Mobile

O Command Center deve ser utilizável no celular.

34. DESIGN SYSTEM

Criar design system consistente.

Visual:

minimal
premium
quiet
modern
intelligent

Evitar:

neon
cyberpunk
excesso de gradientes
glassmorphism exagerado
bordas em excesso
dashboard congestionado
"AI everywhere"

A inteligência deve aparecer pela qualidade da experiência, não por efeitos visuais.

35. PRIMEIRO DATASET

Criar apenas dados reais/conceituais claramente identificados.

Brand:

DOG CAR LIFE™

Product:

FUR RESCUE KIT™

Market:

USA

Currency:

USD

Supplier candidates:

NocNoc EUA
CJ
Direct Supplier
3PL

Status inicial:

SOURCING

Não criar vendas fictícias.

Não criar ROAS fictício.

Não criar reviews fictícios.

Não criar número falso de clientes.

36. ADMIN / CONTROL CENTER

Criar:

Products
Brands
Suppliers
Experiments
Creatives
Landing Pages
Campaigns
Orders Analytics
Integrations
Settings
AI
Knowledge

Menu simples.

37. FUTURE ARCHITECTURE

Não construir agora, mas deixar arquitetura preparada para:

CAR BRAND

HOME BRAND

TRAVEL BRAND

Marketplace discovery

Automated product discovery

Supplier scoring

Creative generation

AI agent

Automatic experiment creation

Predictive product scoring

International expansion

Multiple storefronts

Multiple currencies

Multiple countries

38. REGRA FUNDAMENTAL

Não construir funcionalidades apenas porque elas parecem interessantes.

Antes de criar qualquer módulo perguntar:

Isso aumenta:

REVENUE?

MARGIN?

SPEED?

LEARNING?

SCALABILITY?

Se não aumentar nenhum deles, provavelmente não é prioridade.

39. PRINCÍPIO DE NÃO OVERBUILD

Primeira versão deve ser um:

OPERATING SYSTEM FOR PRODUCT VALIDATION

e não um software gigantesco.

Prioridade:

Product Lab

Supplier Lab

Brand Lab

Landing/Offer

Creative Lab

Experiment Engine

Analytics

Integrations

Learning

Depois adicionar automação avançada.

40. CRITICAL IMPLEMENTATION RULE

Não implemente tudo de uma vez.

Execute em fases.

PHASE 1

Foundation

database

authentication

design system

navigation

dashboard shell

brands

products

suppliers

PHASE 2

Product Lab

product lifecycle

scoring

sourcing

supplier comparison

Source War

PHASE 3

Brand + Landing

brand management

product pages

landing builder

offers

PHASE 4

Creative + Experiments

Creative Lab

Hook Library

Experiment Engine

tracking

PHASE 5

Analytics + Decision Engine

funnel

economics

attribution

decisions

learning

PHASE 6

Integrations

Nuvemshop

Dropi

n8n

Meta

TikTok

Google

41. FIRST BUILD TARGET

Ao terminar a primeira fase, deve ser possível abrir o sistema e ver:

DOG CAR LIFE™

FUR RESCUE KIT™

Status:
SOURCING

E abrir o produto para visualizar:

Product Score

Supplier candidates

Unit economics

Creative hypotheses

Landing hypothesis

Experiment status

Decision

42. QUALITY STANDARD

O resultado não pode parecer:

"mais um dashboard SaaS".

Deve parecer uma ferramenta proprietária criada para uma operação de e-commerce sofisticada.

Poucas coisas.

Muito bem feitas.

Excelente UX.

Velocidade.

Clareza.

Hierarquia.

43. IMPORTANT — DO NOT FAKE INTEGRATIONS

Se uma API ainda não estiver conectada:

mostrar:

NOT CONFIGURED

Se não houver dado:

NO DATA

Se um dado for estimado:

ESTIMATED

Se vier de IA:

AI GENERATED

Se vier de uma API:

SOURCE + TIMESTAMP

Nunca preencher lacunas com números inventados.

44. FINAL OBJECTIVE

Construir uma máquina que permita fazer:

DISCOVER

↓

SOURCE

↓

EVALUATE

↓

BRAND

↓

CREATE

↓

TEST

↓

MEASURE

↓

LEARN

↓

VALIDATE

↓

SCALE

↓

REPEAT

O objetivo final não é vender apenas o Fur Rescue Kit.

O objetivo é construir uma infraestrutura capaz de encontrar e escalar produtos vencedores repetidamente.

Comece agora pela PHASE 1.

Não avance automaticamente para fases posteriores.

Ao finalizar cada fase, mostre:

o que foi construído;

o que está funcionando;

o que ainda não está conectado;

quais decisões precisam ser tomadas;

quais são os próximos passos.

Não invente integrações, dados ou resultados.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bcb38216-3a21-4685-bd90-9662382fd7bc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
