# UPCJ — Unified Patient Claim Journey

**An open-source framework for standardising the Indian health insurance claim experience.**

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

---

## The Problem

Every year, millions of Indian patients and their families navigate health insurance claims with **zero standardised guidance**. The process involves 6 actors (Patient, Doctor, Hospital, Managed Care, TPA, Insurer), 12+ handoff points, and two fundamentally different settlement paths — yet no hospital, insurer, or regulator provides a unified map of this journey.

The result:
- **Patients** don't know what documents to collect, when to collect them, or who is responsible for what
- **Caregivers** are forced to learn the system under extreme stress, often discovering critical steps too late
- **Claims get rejected** not because of medical invalidity, but because of process failures — missed deadlines, unsigned forms, missing original documents
- **Information asymmetry** means the patient is always the least informed actor in a 6-party system

## What UPCJ Is

UPCJ is a **process framework** — not software — that defines:

1. **The Universal Journey Map**: Every health insurance claim in India, regardless of insurer, TPA, or hospital, follows the same 3-phase, 12-step structural flow. UPCJ codifies this.

2. **The Ownership Matrix**: A RACI-style responsibility map that makes explicit who Owns, Executes, is Consulted, and is Informed at every step — for every actor.

3. **The Patient Companion Checklist**: A practical, phase-by-phase checklist that patients and caregivers can follow in real-time during hospitalisation.

4. **The Document Registry**: A canonical list of every document generated, who generates it, who needs it, and when.

## The Three Phases

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: COMMON ENTRY (Diagnosis)                      │
│  ├─ OPD Consultation                                    │
│  ├─ Diagnostic Workup                                   │
│  └─ Admission Advice                                    │
│                                                         │
│  ══════════ DECISION JUNCTION ══════════                │
│  Network hospital? Cashless eligible? ID verified?      │
│                                                         │
│  PHASE 2: PARALLEL PATHS                                │
│  ┌─ Path A: Cashless ──┐  ┌─ Path B: Reimbursement ──┐ │
│  │ A.1 Pre-Auth Filing  │  │ B.1 Upfront Payment      │ │
│  │ A.2 Query Loop       │  │ B.2 IPD Treatment        │ │
│  │ A.3 Pre-Auth Approval│  │ B.3 Records Collection   │ │
│  │ A.4 IPD Treatment    │  │ B.4 Claim Submission     │ │
│  │ A.5 Enhancement Req  │  │ B.5 Query Loop           │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                         │
│  ══════════ PATHS CONVERGE ══════════                   │
│                                                         │
│  PHASE 3: POST-DISCHARGE & SETTLEMENT                   │
│  ├─ Discharge Summary                                   │
│  ├─ Claim Adjudication                                  │
│  ├─ Post-Hospitalisation Recovery                       │
│  └─ Final Settlement                                    │
└─────────────────────────────────────────────────────────┘
```

## The Six Actors

| Actor | Role | Primary Responsibility |
|-------|------|----------------------|
| **Patient** | Policyholder | Initiates journey, provides consent, funds (reimbursement), files paperwork |
| **Doctor** | Clinical Owner | Medical decisions, admission advice, treatment, discharge |
| **Hospital** | Service Provider | Diagnostics, IPD care, pre-auth filing (cashless), billing |
| **Managed Care** | Support & Coordination | Assists with paperwork, coordinates between patient and TPA |
| **TPA** | Claims Administrator | Pre-authorisation, query management, claim adjudication |
| **Insurer** | Financial Risk Bearer | Final approval, settlement disbursement |

## Who Should Adopt UPCJ

- **Hospitals**: Display the journey map at admission desks and insurance counters
- **Insurers & TPAs**: Include the patient checklist with policy documents
- **Managed Care Providers**: Use as onboarding material for new policyholders
- **Health-tech Startups**: Build digital tools on top of the framework
- **Patient Advocacy Groups**: Distribute the checklist as a public good
- **IRDAI / Regulators**: Consider as a basis for standardised patient communication

## Repository Structure

```
upcj/
├── README.md                    # This file
├── LICENSE                      # CC BY-SA 4.0
├── framework/
│   ├── journey-map.html         # Interactive visual journey map
│   ├── patient-checklist.html   # Interactive patient companion checklist
│   ├── ownership-matrix.json    # Machine-readable RACI data
│   └── document-registry.json   # Canonical document list
├── assets/
│   ├── journey-poster-A3.pdf    # Printable poster for hospital display
│   ├── checklist-print.pdf      # Printable patient checklist
│   └── icons/                   # SVG icon set
├── translations/
│   ├── hi/                      # Hindi
│   ├── ta/                      # Tamil
│   ├── te/                      # Telugu
│   ├── kn/                      # Kannada
│   ├── bn/                      # Bengali
│   ├── mr/                      # Marathi
│   └── ml/                      # Malayalam
├── integrations/
│   ├── whatsapp-bot/            # WhatsApp checklist bot template
│   └── widget/                  # Embeddable web widget
└── CONTRIBUTING.md
```

## Design Principles

1. **Patient-first**: Every design decision optimises for the least informed actor in the system
2. **Universal**: Works across all Indian insurers, TPAs, and hospital types
3. **Offline-ready**: Core checklist must work without internet (printable, PWA)
4. **Multilingual**: Framework is language-agnostic; translations are first-class
5. **Non-prescriptive**: Describes the process, does not mandate specific forms or systems
6. **Open**: CC BY-SA 4.0 — anyone can use, modify, and redistribute

## Contributing

We welcome contributions in:
- **Translations**: Help us reach patients in every Indian language
- **Validation**: If you work in health insurance (hospital admin, TPA, insurer), validate and improve the journey map
- **Design**: Improve the visual assets, create print-ready materials
- **Integration**: Build bots, widgets, apps on top of the framework
- **Patient Stories**: Share real-world experiences that reveal gaps in the framework

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

- [ ] v1.0 — Core framework (journey map + checklist + ownership matrix)
- [ ] v1.1 — Hindi and Tamil translations
- [ ] v1.2 — Printable A3 poster for hospital display
- [ ] v1.3 — WhatsApp bot template
- [ ] v2.0 — Group/Corporate policy extensions
- [ ] v2.1 — Super top-up and floater policy logic
- [ ] v3.0 — Integration with ABHA (Ayushman Bharat Health Account)

## License

This work is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

You are free to share and adapt this material for any purpose, including commercial, as long as you give appropriate credit and distribute your contributions under the same license.

---

*Created by Siddarth. Built to make health insurance less hostile to the people it's supposed to protect.*
