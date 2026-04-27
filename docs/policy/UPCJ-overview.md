# UPCJ — Unified Patient Claim Journey

**A patient-first open framework for the Indian health-insurance claim process.** Comparable in intent to ONDC for commerce or UPI for payments — a shared, machine-readable specification that any hospital, TPA, insurer, or patient app can adopt without forking. Licensed CC BY-SA 4.0.

## The problem

Indian patients experience a fragmented, opaque claim process. Across hospitals, third-party administrators (TPAs), and insurers, the same activity has different names, different forms, different SLAs, and different escalation paths. The patient — the least-informed actor — bears the cost of that fragmentation:

- **Pre-authorisation rejections** in 12–18% of cashless claims, often due to missing or inconsistent documentation that no one explained upfront.
- **Reimbursement claim cycles of 60–90 days** versus IRDAI's 30-day target. No shared audit trail makes the breach auditable.
- **Most grievances filed with IRDAI Bima Bharosa** cite SLA breaches that no party can prove or disprove because no shared chronological record of the claim exists.

The gap is not a tech gap; it is a **standards gap**. There is no shared vocabulary for "what is a claim?", "what document is needed at step N?", "who owes whom what by when?". Every adopter reinvents.

## What UPCJ provides

UPCJ formalises the claim journey as a public, machine-readable specification with five components:

1. **17-step journey map** — the canonical sequence from OPD consultation to final settlement, covering both cashless and reimbursement paths.
2. **Document registry** — 15 canonical documents (`DOC-001` … `DOC-015`) with critical-field schemas. Any provider can verify a document is "complete" against the same checklist.
3. **Ownership matrix** — RACI across six actors (Patient, Doctor, Hospital, Managed Care, TPA, Insurer) per step. Eliminates "not my job" ambiguity at handoffs.
4. **SLA registry** — 10 SLAs matching IRDAI's published deadlines, each with explicit escalation paths for breach.
5. **Claim Information Packet (CIP)** — a structured, timestamped audit trail. Every event identified, every actor named, every breach evidenced.

The framework is published as both human-readable documents and machine-readable JSON Schemas + state machines + a TypeScript reference implementation. It is **non-prescriptive**: it standardises the model, not the systems. Hospitals keep their EMRs, TPAs keep their adjudication engines, insurers keep their core platforms — UPCJ is the lingua franca between them.

---

## What is shipped (v1.0, April 2026)

| Artifact | Audience | Status |
|---|---|---|
| **Patient Starter Kit** — 38-page printable A4 companion the patient receives at admission | Patients | v1.0.1 live ([download](https://github.com/s1dd4rth/upcj/releases/latest/download/upcj-starter-kit.pdf)) |
| **`@upcj/engine`** — TypeScript reference implementation on npm | Hospital IT, TPA, insurer engineering teams | v1.0.0 published, OIDC-signed |
| **JSON spec** — 12 schemas, 3 lifecycles, 3 registries | Adopters in any programming language | v1 published, raw GitHub URLs |
| **Conformance suite** — 44 input/event/expected-output fixtures + 11 coverage rules | Cross-language interoperability | Required pass for any conformant implementation |

**Standards alignment:** WCAG 2.1 AA, GIGW 3.0 (Government of India web guidelines), PDF/UA-1, ISO 8601, JSON Schema 2020-12, RFC 8785 (canonical JSON for deterministic IDs).

**Governance lineage:** UPCJ's governance model is explicitly modelled on ONDC's principles — protocol over platform, network over hierarchy, voluntary participation over mandate.

## Why now

- **Bima Sugam** is establishing the digital backbone for Indian insurance. UPCJ is a candidate protocol-layer specification for one specific surface — the claim journey — that complements Bima Sugam's marketplace layer.
- **IRDAI's Cashless Everywhere directive** mandates faster, more transparent pre-authorisation. UPCJ's SLA registry and CIP audit trail give regulators and patients the same evidence base.
- **Patient outcomes:** claim disputes erode trust in private health insurance and push patients toward catastrophic out-of-pocket expenditure. A shared, auditable framework reduces friction at every handoff and concentrates accountability where it belongs.

## What we are asking for

Three forms of engagement, in increasing order of commitment:

1. **Review** — a 30-minute walkthrough with policy or technical staff. We want feedback on alignment with IRDAI guidelines and (if applicable) Bima Sugam's protocol stack.
2. **Pilot signal** — endorsement (formal or informal) that opens a pilot conversation with one or two hospitals or TPAs already in your network.
3. **Adoption pathway** — guidance on how UPCJ might be referenced in IRDAI consultation papers, recommended for Cashless Everywhere participants, or integrated as a Bima Sugam protocol annex.

## About

UPCJ is an open-source project licensed under CC BY-SA 4.0. Repository: [github.com/s1dd4rth/upcj](https://github.com/s1dd4rth/upcj). The reference engine is published as [`@upcj/engine`](https://www.npmjs.com/package/@upcj/engine) on npm. The framework is maintained by Siddarth Kengadaran and designed for community contribution.

**Contact:** [s1dd4rth@gmail.com](mailto:s1dd4rth@gmail.com) · github.com/s1dd4rth/upcj

---

*This 2-page overview is published at [github.com/s1dd4rth/upcj/blob/main/docs/policy/UPCJ-overview.md](https://github.com/s1dd4rth/upcj/blob/main/docs/policy/UPCJ-overview.md). For the full design spec, see [docs/superpowers/specs/2026-04-26-ontology-design.md](https://github.com/s1dd4rth/upcj/blob/main/docs/superpowers/specs/2026-04-26-ontology-design.md).*
