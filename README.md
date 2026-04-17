# UPCJ — Unified Patient Claim Journey

An open-source framework for standardising the Indian health insurance claim experience.

Modelled on the governance patterns of [ONDC (Open Network for Digital Commerce)](https://www.ondc.org/). ONDC standardised how buyers and sellers transact across platforms. UPCJ standardises how patients navigate insurance claims across hospitals, TPAs, and insurers.

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

**Try it now:**
[Readable overview](docs/index.html) ·
[Interactive journey map](docs/framework/journey-map.html) ·
[Patient checklist](docs/framework/patient-checklist.html)

---

## The problem

When a patient is hospitalised in India, they enter an insurance claim process involving 6 actors, 12+ handoff points, and two different settlement paths. No hospital, insurer, TPA, or regulator provides the patient with a standardised guide to this process.

The consequences:

- Claims rejected because patients missed procedural steps they were never informed about
- Caregivers discover deadlines (24-hour intimation, 15-30 day filing window) only after they lapse
- Hospitals refuse to provide documents in the "correct format" because no standard format exists
- Nobody can answer the basic question: who is responsible for the next step?
- The patient is always the least informed actor, despite bearing both the health risk and the financial risk

The process itself is structurally identical across every insurer and TPA in India. It is already standardisable. What is missing is the mandate to communicate it.

## What UPCJ provides

### 1. Universal journey map
A 3-phase, 12-step visual flow covering both Cashless and Reimbursement paths. Applies to every insurer in India.
→ [framework/journey-map.html](docs/framework/journey-map.html)

### 2. Ownership matrix
A RACI-style responsibility map making explicit who owns, executes, is consulted, and is informed at every step — for every actor.
→ [framework/ownership-matrix.json](docs/framework/ownership-matrix.json)

### 3. Patient companion checklist
A practical, phase-by-phase checklist caregivers can follow in real-time during hospitalisation. Includes exact scripts for what to ask at each stage.
→ [framework/patient-checklist.html](docs/framework/patient-checklist.html)

### 4. Document registry
A canonical list of every document in the claim lifecycle — who generates it, who needs it, what fields it must contain, and when.
→ [framework/document-registry.json](docs/framework/document-registry.json)

### 5. Governance model (ONDC-inspired)
Six governance patterns adopted from ONDC, adapted for health insurance claims.
→ [framework/governance-model.md](docs/framework/governance-model.md)

## Governance model — adopted from ONDC

UPCJ adopts six structural patterns from the ONDC framework:

| ONDC pattern | UPCJ adoption |
|---|---|
| **Open protocol** (Beckn) — standardised API contracts | **Open claim specification** — standardised document formats and schemas |
| **Network registry** — who is on the network | **Actor registry** — which TPA services which insurer, which hospitals are in-network, named contacts |
| **NP agreement** — binding rules for participants | **SLA commitments** — mandated turnaround times at every handoff with enforcement |
| **Issue and grievance management** — 3-level escalation | **Claim grievance protocol** — Hospital → TPA → Insurer → IRDAI → Ombudsman, with Claim Information Packet |
| **Grievance redressal officer** — mandatory per participant | **Claim Resolution Officer** — named individual per hospital and TPA, publicly listed |
| **User council** — stakeholder governance body | **Patient Advisory Council** — policyholder-majority body under IRDAI |

The critical difference: ONDC had to build an entire technical infrastructure. UPCJ does not. The insurance claim process already exists and is already identical across providers. UPCJ only standardises the communication layer. UPI did not change how banks work — it standardised how users interact with banks. UPCJ does not change how insurance works — it standardises how patients interact with the claim process.

Full details: [framework/governance-model.md](docs/framework/governance-model.md)

## The three phases

```
PHASE 1: COMMON ENTRY (Diagnosis)
  ├─ OPD Consultation
  ├─ Diagnostic Workup
  └─ Admission Advice

════════ DECISION JUNCTION ════════
Network hospital? Cashless eligible? ID verified?

PHASE 2: PARALLEL PATHS
  ┌─ Path A: Cashless ──┐  ┌─ Path B: Reimbursement ──┐
  │ A.1 Pre-Auth Filing  │  │ B.1 Upfront Payment      │
  │ A.2 Query Loop       │  │ B.2 IPD Treatment        │
  │ A.3 Pre-Auth Approval│  │ B.3 Records Collection   │
  │ A.4 IPD Treatment    │  │ B.4 Claim Submission     │
  │ A.5 Enhancement Req  │  │ B.5 Query Loop           │
  └──────────────────────┘  └──────────────────────────┘

════════ PATHS CONVERGE ════════

PHASE 3: POST-DISCHARGE & SETTLEMENT
  ├─ Discharge Summary
  ├─ Claim Adjudication
  ├─ Post-Hospitalisation Recovery
  └─ Final Settlement
```

## The six actors

| Actor | Role | Primary responsibility |
|---|---|---|
| **Patient** | Policyholder | Initiates journey, provides consent, funds (reimbursement), files paperwork |
| **Doctor** | Clinical owner | Medical decisions, admission advice, treatment, discharge |
| **Hospital** | Service provider | Diagnostics, IPD care, pre-auth filing (cashless), billing |
| **Managed Care** | Support and coordination | Assists with paperwork, coordinates between patient and TPA |
| **TPA** | Claims administrator | Pre-authorisation, query management, claim adjudication |
| **Insurer** | Financial risk bearer | Final approval, settlement disbursement |

## Who should adopt UPCJ

- **Hospitals** — display the journey map at admission desks and insurance counters
- **Insurers and TPAs** — include the patient checklist with policy documents
- **Managed care providers** — use as onboarding material for new policyholders
- **Health-tech startups** — build digital tools on top of the framework
- **Patient advocacy groups** — distribute the checklist as a public good
- **IRDAI** — consider as a basis for standardised patient communication
- **Bima Sugam** — integrate patient journey guidance into India's upcoming digital insurance marketplace

## Repository structure

```
upcj/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── docs/                              # GitHub Pages site root
    ├── index.html                     # Readable framework overview
    └── framework/
        ├── journey-map.html           # Interactive visual journey map (GDS style)
        ├── patient-checklist.html     # Interactive patient companion checklist
        ├── ownership-matrix.json      # Machine-readable RACI data
        ├── document-registry.json     # Canonical document list with schemas
        └── governance-model.md        # ONDC-inspired governance framework
```

## Design principles

1. **Patient-first** — every decision optimises for the least informed actor in the system
2. **Universal** — works across all Indian insurers, TPAs, and hospital types
3. **Offline-ready** — core checklist must work without internet (printable, PWA)
4. **Multilingual** — framework is language-agnostic; translations are first-class
5. **Non-prescriptive** — describes the process, does not mandate specific forms or systems
6. **Open** — CC BY-SA 4.0 — anyone can use, modify, and redistribute
7. **ONDC-aligned** — governance patterns proven at national scale in Indian digital infrastructure

## Roadmap

- [x] v1.0 — Core framework (journey map + checklist + ownership matrix)
- [x] v1.1 — ONDC-inspired governance model, document registry
- [ ] v1.2 — Hindi and Tamil translations
- [ ] v1.3 — Printable A3 poster for hospital display
- [ ] v1.4 — WhatsApp bot template
- [ ] v2.0 — Group/corporate policy extensions
- [ ] v2.1 — Super top-up and floater policy logic
- [ ] v3.0 — Integration with ABHA (Ayushman Bharat Health Account)
- [ ] v3.1 — Bima Sugam integration specification

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. We welcome contributions in translations, validation from industry professionals, design improvements, integrations, and patient stories.

## License

This work is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

You are free to share and adapt this material for any purpose, including commercial, as long as you give appropriate credit and distribute your contributions under the same license.

---

*Created by [Siddarth](https://github.com/s1dd4rth). Built to make health insurance less hostile to the people it is supposed to protect.*
