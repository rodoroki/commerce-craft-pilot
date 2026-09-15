# Intelligence Core v2.1

## Goal
Upgrade the existing system from data display into an evidence-led decision loop, without redesigning the product or connecting external platforms.

## What will be built

1. **Evidence and confidence foundation**
   - Add structured evidence records with source, timestamp, status, confidence, and links to products, suppliers, experiments, and learnings.
   - Add structured decision records and learning-history records so conclusions and status changes remain auditable.
   - Preserve all existing product, supplier, experiment, metric, AI, and knowledge data; no duplicated operational commerce data.

2. **Shared intelligence engine**
   - Add deterministic rules that interpret existing facts into opportunity status, reasons, risks, unknowns, confidence, and next best action.
   - Derive confidence from evidence quality and completeness, never from an AI assertion.
   - Extend decision options to include audience, landing, verification, and waiting actions, always exposing why, evidence, unknowns, risk, next action, and confidence.
   - Add conservative capital-at-risk and learn-per-dollar views from recorded budgets/spend only.
   - Compare supplier sources across landed cost, delivery, MOQ, stock, warehouse, tracking, returns, branding, packaging, and reliability; no winner when required evidence is incomplete.

3. **Product intelligence view**
   - Extend the current product page with one structured intelligence section answering the ten acceptance questions.
   - Show provenance beside conclusions and allow evidence to be recorded without turning hypotheses or estimates into facts.
   - Keep the existing score, economics, sources, creatives, landing, experiments, and history interfaces.

4. **Command Center interpretation**
   - Reorganize the existing dashboard around: what matters now, what changed, blockers, next best action, capital at risk, learning, and approaching decisions.
   - Use existing products, stage history, experiments, metrics, suppliers, integrations, evidence, and knowledge records.
   - Continue showing explicit NO DATA, UNKNOWN, INSUFFICIENT DATA, and NOT CONFIGURED states.

5. **Learning and decisions**
   - Evolve knowledge entries through observation/signal/hypothesis/test/result/confidence/learning/next action while preserving history.
   - Save formal experiment decisions as auditable records instead of only writing a verdict string.
   - Keep the current minimum-evidence guard: isolated observations cannot become consolidated rules.

6. **Context-aware AI preparation**
   - Keep the current server-side AI service and logs.
   - Add structured context assembly from evidence, unknowns, metrics, economics, and source comparisons so AI output supports interpretation rather than acting as evidence.
   - Label every AI result AI GENERATED and keep its confidence unverified unless separately supported by evidence.

## Technical details
- Add one migration with explicit grants, row-level access rules, indexes, checks, and history triggers for every new public table.
- Refresh generated backend types after the migration and extend existing query helpers rather than creating a parallel data layer.
- Add pure, testable TypeScript intelligence functions and reuse them across product, dashboard, supplier, experiment, learning, and AI views.
- Reuse the current visual components and tokens; only small interface extensions are included.
- Add translated keys for English and Portuguese, with Spanish retaining the current fallback behavior.
- Validate the main authenticated flows at desktop and mobile sizes with real existing records and empty-data states.

## Out of scope
No full redesign, onboarding rebuild, external integrations, social commerce, multi-brand expansion, 3PL/private-label operations, or fabricated market/performance data.
