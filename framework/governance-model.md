# UPCJ Governance Model

Adapted from the [ONDC (Open Network for Digital Commerce)](https://www.ondc.org/) framework. ONDC democratised e-commerce by creating an open protocol that decouples buyers and sellers from closed platforms. UPCJ applies the same structural principles to health insurance claims — decoupling the patient from the opacity of closed insurer-hospital-TPA systems.

## Design principle

UPI did not change how banks work. It standardised how users interact with banks. UPCJ does not change how insurance works. It standardises how patients interact with the insurance claim process.

---

## Six governance patterns adopted from ONDC

### 1. Open claim specification

**ONDC pattern**: The Beckn protocol defines open API specifications that standardise communication between buyer apps and seller apps, so any platform can interoperate with any other.

**UPCJ adoption**: Define canonical document schemas for every artefact exchanged between actors during a claim. Today, a hospital may refuse to issue a doctor's prescription because they "don't have a proper format." A TPA may reject a pre-auth because the admission advice note lacks specific fields. These failures happen because there is no mandated standard for what each document must contain.

**What this means in practice**:

- Admission advice note: must contain patient name, UHID, policy number, diagnosis (ICD-10 code), treating doctor name and registration number, reason for admission, estimated duration
- Pre-authorisation request: must contain admission advice reference, estimated cost breakup (room, procedure, pharmacy, consumables), patient ID verification status
- Discharge summary: must contain diagnosis, procedures performed, medications administered, follow-up instructions, treating doctor signature and registration number
- Claim submission form: must contain policy number, TPA ID, hospitalisation dates, itemised bill reference, list of attached original documents

These schemas should be published as open specifications that any hospital, TPA, or insurer can implement. Formats should be available in both human-readable (PDF/print) and machine-readable (JSON) versions.

### 2. Actor registry

**ONDC pattern**: ONDC maintains a network registry where every participant (buyer app, seller app, logistics provider) registers, authenticates, and publishes its capabilities and contact information.

**UPCJ adoption**: A public, queryable registry that answers the three questions every patient asks and currently cannot get answered without multiple phone calls:

- Which TPA services my insurer?
- Is this hospital in my insurer's network?
- Who is the named Claim Resolution Officer at this hospital and this TPA?

**Registry fields per actor**:

| Field | Hospital | TPA | Insurer |
|---|---|---|---|
| Name | Yes | Yes | Yes |
| Network empanelment list | Yes (which insurers) | Yes (which insurers) | Yes (which hospitals) |
| Claim Resolution Officer | Name, phone, email | Name, phone, email | Escalation contact |
| Cashless support | Yes/No per insurer | N/A | N/A |
| Pre-auth submission method | Online portal / email / physical | N/A | N/A |
| Average pre-auth turnaround | Published (hours) | Published (hours) | N/A |

This registry should be maintained by IRDAI or integrated into the Bima Sugam platform. It should be queryable by policy number — a patient enters their policy number and immediately sees their TPA, their network hospitals, and the contact details for each.

### 3. SLA commitments (Network Participant Agreement)

**ONDC pattern**: Every ONDC participant signs a Network Participant Agreement with binding rules on conduct, timelines, and fairness. Non-compliance has consequences ranging from warnings to termination from the network.

**UPCJ adoption**: Mandated turnaround times at every handoff in the claim process. Today, there are no enforceable timelines at most steps. A hospital can delay responding to a pre-auth email indefinitely. A TPA can sit on a query for weeks. The patient has no visibility into where their claim is or when they can expect a response.

**Proposed SLA schedule**:

| Step | Actor responsible | Maximum turnaround | Escalation if breached |
|---|---|---|---|
| Pre-auth submission | Hospital | Within 2 hours of admission advice | Patient can file directly with TPA |
| Pre-auth initial response | TPA | 4 hours (emergency), 12 hours (planned) | Auto-escalate to insurer |
| Query/deficiency response | Hospital + Doctor | 24 hours | TPA processes with available information |
| Pre-auth approval/rejection | TPA | 24 hours from complete submission | Auto-escalate to insurer |
| Enhancement request response | TPA | 4 hours | Auto-escalate to insurer |
| Discharge settlement (cashless) | TPA + Insurer | 7 days from discharge | Interest payable to hospital |
| Reimbursement settlement | Insurer | 30 days from complete submission | Interest payable to patient |
| Query response (reimbursement) | Patient | 15 days from query | Claim processed with available documents |
| Grievance acknowledgement | TPA/Insurer | 48 hours | Auto-escalate to IRDAI |
| Grievance resolution | TPA/Insurer | 15 days | Patient can approach Ombudsman |

Every SLA breach should generate a traceable record in the Claim Information Packet (see Pattern 4).

### 4. Claim grievance protocol (Issue and Grievance Management)

**ONDC pattern**: ONDC's IGM framework defines three escalation levels — interfacing app resolution, Grievance Redressal Officer intervention, and external Online Dispute Resolution. Every issue generates an Issue Information Packet (IIP) containing the original issue, history of attempted resolution, and timestamps.

**UPCJ adoption**: A structured escalation path with mandatory documentation at each level.

**Level 1 — Hospital/TPA resolution** (0-48 hours):
Patient raises issue with the hospital insurance desk or TPA helpline. The Claim Resolution Officer (see Pattern 5) must acknowledge within 48 hours and attempt resolution within 7 days.

**Level 2 — Insurer escalation** (7-15 days):
If unresolved at Level 1, the patient escalates to the insurer's grievance cell. The insurer must respond within 15 days. All Level 1 documentation transfers automatically.

**Level 3 — Regulatory escalation** (15-30 days):
If unresolved at Level 2, the patient can approach IRDAI (helpline 155255) or the Insurance Ombudsman. All documentation from Levels 1 and 2 transfers.

**Claim Information Packet (CIP)**: Every claim interaction — pre-auth filing, query raised, response submitted, approval, rejection, enhancement, settlement — must generate a timestamped record. These records form the CIP, which the patient can access at any time. The CIP serves as the evidentiary basis for any grievance or dispute.

CIP fields per interaction:

- Timestamp (IST)
- Actor who initiated the interaction
- Actor who is expected to respond
- Nature of interaction (filing, query, response, approval, rejection, enhancement, settlement)
- SLA deadline for response
- Actual response timestamp (or "pending")
- Outcome
- Documents attached

### 5. Claim Resolution Officer (Grievance Redressal Officer)

**ONDC pattern**: Every ONDC network participant must appoint a Grievance Redressal Officer. ONDC maintains their details in its registry. The GRO is the named, accountable individual for issue resolution.

**UPCJ adoption**: Every network hospital and every TPA must appoint a Claim Resolution Officer (CRO) — a named individual (not a helpline, not a department, not an email alias) who is personally accountable for claim process issues at that entity.

**CRO requirements**:

- Name, direct phone number, and email must be published in the Actor Registry
- Must be displayed at the hospital's insurance/TPA desk
- Must be included in every pre-auth approval letter and every claim acknowledgement
- Must acknowledge patient complaints within 48 hours
- Must provide a written response within 7 days
- CRO details must be updated in the registry within 24 hours of any change

The CRO is not a customer service agent. The CRO is the person the patient contacts when the process has failed — when the hospital hasn't filed the pre-auth, when the TPA hasn't responded to a query, when nobody can tell the patient who is responsible for the next step. The CRO's job is to own the resolution, not to redirect the patient to another number.

### 6. Patient Advisory Council (User Council)

**ONDC pattern**: ONDC constitutes a User Council consisting of representatives of network participants and members of civil society. The council reviews existing policies, advises on changes, and provides guidance on new procedures.

**UPCJ adoption**: IRDAI should constitute a Patient Advisory Council for health insurance claims, comprising:

- Policyholder representatives (minimum 50% of council)
- Hospital administration representatives
- TPA representatives
- Insurer representatives
- Patient advocacy group representatives
- Independent health policy experts

**Council responsibilities**:

- Review the UPCJ framework annually and recommend updates
- Review claim rejection and grievance data to identify systemic failures
- Advise IRDAI on changes to claim process regulations
- Publish an annual "State of Claim Transparency" report
- Evaluate whether SLA commitments are being met across the industry

The council must meet at least quarterly. Meeting minutes and recommendations must be published publicly.

---

## How this differs from ONDC

ONDC had to build an entire technical infrastructure — gateways, APIs, sandboxes, certification, reference applications. ONDC is a marketplace protocol that enables new kinds of transactions.

UPCJ does not need any of this. The health insurance claim process already exists and is already structurally identical across all providers. UPCJ is a communication standard, not a transaction protocol. It standardises how an existing process is explained, documented, and made accountable to the patient.

This means UPCJ is:

- Cheaper to implement (no technology infrastructure required)
- Faster to deploy (no integration or onboarding pipeline)
- Easier to mandate (IRDAI circular, not new legislation)
- More immediately impactful (benefits patients from day one of adoption)

The cost of not implementing it is borne entirely by patients — in rejected claims, missed deadlines, and lost money. The cost of implementing it is borne by hospitals, TPAs, and insurers — in standardised forms, published timelines, and named accountability. This asymmetry is why it requires a regulatory mandate.

---

## Regulatory implementation path

1. IRDAI issues a circular mandating the Open Claim Specification (document schemas) for all health insurers and TPAs
2. IRDAI mandates the Actor Registry as part of the Bima Sugam platform
3. IRDAI publishes the SLA schedule as a regulatory guideline with enforcement mechanisms
4. IRDAI mandates the Claim Information Packet as a policyholder right — every patient can request their CIP at any time
5. IRDAI mandates the appointment of Claim Resolution Officers at every network hospital and TPA
6. IRDAI constitutes the Patient Advisory Council

Steps 1-3 can be implemented via IRDAI circular without legislative action. Steps 4-5 can be implemented as amendments to existing IRDAI (Health Insurance) Regulations. Step 6 requires an administrative order.

---

## References

- [ONDC Network Policy](https://resources.ondc.org/ondc-network-policy)
- [ONDC Issue and Grievance Management Framework](https://resources.ondc.org/governance-and-policies)
- [Beckn Protocol Specification](https://developers.becknprotocol.io/)
- [IRDAI (Health Insurance) Regulations](https://irdai.gov.in/)
- [Insurance Ombudsman Rules, 2017](https://irdai.gov.in/)

---

*This governance model is part of the UPCJ (Unified Patient Claim Journey) framework. Licensed under CC BY-SA 4.0.*
