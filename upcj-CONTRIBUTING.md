# Contributing to UPCJ

Thank you for considering contributing to the Unified Patient Claim Journey framework.

## How to contribute

### Translations
The framework needs to reach patients in every Indian language. Translation files go in `/translations/{language-code}/`. Priority languages: Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Bengali (bn), Marathi (mr), Malayalam (ml).

### Validation
If you work in health insurance — as a hospital administrator, TPA processor, insurance claims manager, or managed care provider — your validation of the journey map and ownership matrix is invaluable. Open an issue describing any inaccuracies or missing steps.

### Patient stories
If you have navigated the claim process as a patient or caregiver, your experience can help improve the checklist. Open an issue with the tag `patient-story`.

### Design and print
We need printable versions (A3 poster for hospital display, A4 checklist for patients). Contributions to `/assets/` are welcome.

### Code
The framework files are plain HTML with no build dependencies. Keep it that way. No frameworks, no build tools, no npm. These files must open in any browser, including older devices.

## Standards

- Keep all HTML accessible (semantic elements, sufficient contrast, keyboard navigable)
- Follow the GDS (Government Digital Service) design patterns used in the existing files
- All text must be factually accurate against IRDAI regulations
- No branding, no advertising, no insurer-specific content

## Process

1. Fork the repository
2. Create a branch (`feature/tamil-translation`, `fix/pre-auth-step`)
3. Make your changes
4. Open a pull request with a clear description

## Code of conduct

This is a patient welfare project. Be respectful, be accurate, be helpful.
