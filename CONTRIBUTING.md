# Contributing to UPCJ

Thank you for considering contributing to the Unified Patient Claim Journey framework.

## How to contribute

### Translations

The framework needs to reach patients in every Indian language. Translation files go in `/translations/{language-code}/`. Priority languages: Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Bengali (bn), Marathi (mr), Malayalam (ml).

### Validation

If you work in health insurance — as a hospital administrator, TPA processor, insurance claims manager, or managed care provider — your validation of the journey map, ownership matrix, governance model, and SLA commitments is invaluable. Open an issue describing any inaccuracies or missing steps.

We are particularly interested in validation of:

- The SLA turnaround times proposed in `framework/governance-model.md` — are they realistic? Too generous? Too strict?
- The document schemas in `framework/document-registry.json` — are the critical fields complete? Are there documents we have missed?
- The escalation path in the Claim Grievance Protocol — does it match how grievances actually flow in practice?

### Patient stories

If you have navigated the claim process as a patient or caregiver, your experience can help improve the checklist. Open an issue with the tag `patient-story`. Specific details that help: which steps were unclear, which documents were hard to obtain, where deadlines were missed, and where accountability broke down.

### Governance model review

If you have experience with ONDC, Beckn protocol, IRDAI regulation, or public digital infrastructure, we welcome review and critique of the governance model. The ONDC patterns have been adapted for health insurance but may need refinement from domain experts.

### Design and print

We need printable versions (A3 poster for hospital display, A4 checklist for patients). Contributions to `/assets/` are welcome.

### Code

The framework files are plain HTML with no build dependencies. Keep it that way. No frameworks, no build tools, no npm. These files must open in any browser, including older devices.

Design follows the GDS (Government Digital Service) pattern library — black and white, system fonts, no gradients, no shadows, maximum accessibility.

## Standards

- Keep all HTML accessible (semantic elements, sufficient contrast, keyboard navigable)
- Follow the GDS design patterns used in the existing files
- All text must be factually accurate against IRDAI regulations
- No branding, no advertising, no insurer-specific content
- All JSON schemas must be valid and well-documented
- Governance model changes should reference the ONDC pattern they adapt

## Process

1. Fork the repository
2. Create a branch (`feature/tamil-translation`, `fix/pre-auth-step`, `governance/sla-review`)
3. Make your changes
4. Open a pull request with a clear description

## Code of conduct

This is a patient welfare project. Be respectful, be accurate, be helpful.
