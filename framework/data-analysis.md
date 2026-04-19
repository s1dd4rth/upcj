# UPCJ Data Model

The objects, relationships, actions, and attributes that define the UPCJ framework. This is a **domain model** — it describes the "things" (nouns) in the patient claim journey, how they connect, what people do with them, and the data they hold.

**Why this exists.** An open framework needs a shared vocabulary. Whether someone is building a web app, designing a paper checklist, writing a policy circular, or training hospital staff, they need the same words for the same things. This document is that vocabulary.

**Who this is for.**
- **Product and design teams** — use these objects as the basis for UI, screens, and data schemas.
- **Policy writers and regulators** — use the vocabulary to draft consistent circulars and mandates.
- **Hospital, TPA, and insurer operations** — align internal forms and workflows to these objects.
- **Patient advocacy groups** — use the same language when educating patients.

**Methodology.** Derived via an OOUX ORCA process (Objects, Relationships, Calls-to-Action, Attributes), then audited independently for gaps. 14 objects identified in total: 8 describing the process itself and 6 describing the people and organisations involved.

---

## At a glance

**Process objects (8)** — the things that happen or exist because of a claim.

| # | Object | One-line description |
|---|---|---|
| 1 | Claim | A patient's single insurance claim, from admission to settlement. |
| 2 | Policy | The insurance contract that defines what's covered. |
| 3 | Document | Any paper or digital artefact in the claim (15 types defined). |
| 4 | Step | A stage in the journey map. |
| 5 | Query | A request from the TPA for more information. |
| 6 | Interaction | A single timestamped event in the claim's audit trail (CIP). |
| 7 | SLA | A turnaround commitment at a specific handoff. |
| 8 | Grievance | A complaint escalated when the process has failed. |

**Actor objects (6)** — the people and organisations a claim involves.

| # | Object | One-line description |
|---|---|---|
| 9 | Patient | The policyholder or insured person. |
| 10 | Doctor | The treating physician. |
| 11 | Hospital | The service provider where treatment happens. |
| 12 | Managed Care | Optional support provider assisting the patient. |
| 13 | TPA | Third-party administrator; handles pre-auth and adjudication. |
| 14 | Insurer | The company bearing financial risk; final approver. |

**Relationship map (simplified):**

```
                        ┌── Doctor
                        │
Policy ─── Patient ─────┼── Hospital (has CRO)
   │          │         │
   │          │         ├── Managed Care
   │        CLAIM ──────┤
   │        / | \ \     ├── TPA (has CRO)
   │       /  |  \ \    │
   │   Step  Doc Query  └── Insurer
   │     |    |   |
   │    SLA   └─Doc  ┌── Grievance
   │     |           │
   └─────┴── Interaction (CIP) ─┘
```

Every object has four things:
- **Attributes** — the data fields it carries.
- **Relationships** — how it connects to other objects.
- **Actions in an app** — what a digital product would let users do.
- **Actions without an app** — the equivalent in a non-digital (paper, phone, desk) setting.

The non-app column is not an afterthought. It is a first-class design principle: the framework must work for patients with no smartphone, no internet, and no digital literacy.

---

## Process objects

### 1. Claim

The central object. Every other object exists because of a claim.

**Attributes**
- Claim ID
- Status: *pre-admission → admitted → in-treatment → discharged → in adjudication → settled / rejected*
- Path: *cashless / reimbursement / undecided*
- Admission type: *planned / emergency*
- Current step: `1.1`–`1.3`, `A.1`–`A.5` (cashless), `B.1`–`B.5` (reimbursement), `3.1`–`3.4`
- Date created
- Intimation date (when the TPA was informed)
- Intimation method (phone / online portal / hospital desk)
- Admission date
- Discharge date
- Total amount claimed
- Amount approved
- Deductions (itemised, with reasons)
- Co-pay amount
- Settlement amount
- Settlement date

**Relationships**
- belongs to a **Patient**
- is covered by a **Policy**
- takes place at a **Hospital**
- is treated by a **Doctor**
- is coordinated by **Managed Care** (optional)
- is administered by a **TPA**
- is insured by an **Insurer**
- has many **Documents**
- has many **Interactions** (forms the CIP)
- has many **Queries**
- is governed by **SLAs** (per step)
- may have a **Grievance**

**Actions in an app**
- Intimate hospitalisation to the TPA
- Determine claim path (guided decision flow)
- Start claim (attach admission advice)
- Track status with a live step indicator
- View the full timeline (CIP)
- Export CIP as PDF

**Actions without an app**
- Call the TPA helpline to inform them of admission; note the reference number
- Ask the hospital insurance desk: "Am I eligible for cashless?"
- Submit policy card + ID at the hospital insurance desk
- Call the TPA weekly with the claim reference for status
- Request the CIP in writing from the TPA

---

### 2. Policy

The insurance contract. Determines coverage, limits, and claim-path eligibility.

**Attributes**
- Policy number
- Insurer name
- TPA name
- TPA helpline number
- Sum insured
- Policy period (start date, end date)
- Insured members (names, relationships, dates of birth)
- Room rent sub-limits (per day, by category)
- Co-pay percentage
- Pre-hospitalisation window (days — typically 30-60)
- Post-hospitalisation window (days — typically 60-90)
- Waiting periods (initial, specific illness)
- Exclusions list
- Network hospital list
- Reimbursement claim submission deadline (days after discharge)

**Relationships**
- belongs to a **Patient**
- is issued by an **Insurer**
- is administered by a **TPA**
- covers many **Claims**
- defines the network of **Hospitals**

**Actions in an app**
- Look up my policy (auto-populate from policy number)
- Check if a hospital is in my network
- View coverage limits and sub-limits
- Search exclusions by diagnosis

**Actions without an app**
- Read the policy card for the core details
- Call the TPA: "Is [hospital] in my network?"
- Read the policy schedule of benefits
- Call the TPA: "Is [condition] covered?"

---

### 3. Document

Any paper or digital artefact generated, submitted, or required during a claim. Fifteen canonical documents are defined in `document-registry.json`.

**Attributes**
- Document ID (DOC-001 through DOC-015)
- Name
- Generated by (which actor)
- Held by (which actor)
- Needed at (which step)
- Path: *cashless / reimbursement / both*
- Format: *physical / digital / both*
- Critical fields required (the minimum data the document must contain)
- Collected? (yes/no)
- Date collected
- Original or photocopy
- Validated? (yes/no — are all critical fields present and correct)
- Depends on (other document IDs)

**Relationships**
- belongs to a **Claim**
- is generated by one of: **Doctor, Hospital, TPA, Insurer, Patient**
- is required at a **Step**
- is attached to **Interactions**
- depends on other **Documents** (e.g. the enhancement request references the approval letter; the reimbursement form lists the enclosed originals)

**Actions in an app**
- Mark document as collected (progress tracker)
- Scan or photograph the document
- Validate that all critical fields are present
- See which documents this one depends on
- Receive a reminder before a document is needed

**Actions without an app**
- Tick off on the printed checklist
- Make a photocopy at the hospital; keep the original in a folder
- Check the document against the printed "critical fields" list before leaving the hospital
- Reference the document registry printout
- Set a phone alarm for deadlines

---

### 4. Step

A stage in the journey map. The structural unit of the process.

**Attributes**
- Step ID: `1.1`, `1.2`, `1.3`, `A.1`–`A.5` (cashless), `B.1`–`B.5` (reimbursement), `3.1`–`3.4`
- Name
- Phase: *1 (Common entry) / 2 (Parallel paths) / 3 (Post-discharge)*
- Path: *common / cashless / reimbursement*
- Is decision junction? (true between Phase 1 and Phase 2)
- Junction questions (if applicable): network status, cashless eligibility, ID match
- Owner (the actor accountable per the ownership matrix)
- Executor (the actor who performs the work)
- Consulted actors
- Informed actors
- Documents generated at this step
- Documents required at this step
- Linked SLA
- Next step (may branch at the junction)

**Relationships**
- is part of a **Claim**
- is followed by another **Step** (linear), or branches to **Step A.1 / Step B.1** at the decision junction
- is governed by an **SLA**
- produces **Documents**
- requires **Documents**
- is owned by an **Actor**
- is executed by an **Actor**

**Actions in an app**
- View the current step highlighted on the journey map
- See who is responsible at this step (ownership display)
- Check the SLA countdown for this step
- Determine claim path at the decision junction (guided flow)
- Trigger escalation if the SLA has been breached

**Actions without an app**
- Reference the printed journey map poster at the hospital
- Read the ownership matrix to know who to ask
- Call the TPA: "When should I expect a response?"
- Ask the hospital insurance desk: "Am I eligible for cashless?"
- Call the escalation target named in the SLA schedule

---

### 5. Query (Deficiency)

A request from the TPA for additional information or documents. In a typical claim this happens once or twice; in a poorly filed claim it can happen many times.

**Attributes**
- Query ID
- Claim reference
- Raised by: TPA
- Raised on (date)
- Directed to: *Hospital* (cashless path, step A.2) or *Patient* (reimbursement path, step B.5)
- Path context: *cashless / reimbursement*
- Description
- Documents requested
- SLA deadline for response: *24 hours (hospital, cashless)* / *15 days (patient, reimbursement)*
- Response date
- Response content
- Documents submitted in response
- Status: *open → responded → resolved / escalated*

**Relationships**
- belongs to a **Claim**
- is raised by a **TPA**
- is directed to a **Hospital** (cashless) or **Patient** (reimbursement)
- references **Documents** that are requested
- is responded with **Documents** submitted
- is governed by an **SLA**
- is logged in an **Interaction**
- may trigger a **Grievance** if the SLA is breached

**Actions in an app**
- View the query details with a live deadline countdown
- (Patient, reimbursement) Scan and upload the requested documents
- (Patient, cashless) Check whether the hospital has responded
- Receive a push notification at 50% and 90% of the SLA deadline
- Flag an SLA breach if the query is overdue

**Actions without an app**
- Read the deficiency letter (received by post or email)
- Gather the requested originals and courier them with tracking
- Ask the hospital insurance desk: "Has the TPA query been answered?"
- Mark the deadline on a calendar
- Call the TPA: "Query [ID] is past the deadline"

---

### 6. Interaction (Claim Information Packet entry)

A single timestamped event in the CIP — the complete audit trail of a claim. Every filing, query, response, approval, rejection, enhancement, and settlement creates one Interaction.

**Attributes**
- Interaction ID
- Claim reference
- Timestamp (IST)
- Initiating actor
- Responding actor (or "pending")
- Nature: *intimation / filing / query / response / approval / rejection / enhancement / settlement / grievance*
- Linked SLA
- SLA deadline
- Actual response timestamp
- SLA status: *within SLA / breached*
- Outcome
- Documents attached

**Relationships**
- belongs to a **Claim** (all Interactions together form that claim's CIP)
- involves one or more **Actors**
- references **Documents**
- is governed by an **SLA**
- may trigger a **Query**
- may trigger a **Grievance**
- evidences an SLA breach if there is one

**Actions in an app**
- View the full chronological timeline with SLA status badges
- Filter the timeline by actor
- Filter to show only breached SLAs
- Export the timeline as PDF

**Actions without an app**
- Request a printed CIP from the TPA
- Review the CIP printout and highlight any overdue items
- Keep a personal diary: call date, person spoken to, reference number given

---

### 7. SLA (Service Level Agreement)

A turnaround commitment at a specific handoff. SLAs make the process enforceable: every handoff has a deadline, every breach has a consequence.

**Attributes**
- SLA ID
- Linked step ID
- Actor responsible
- Maximum turnaround (value + unit — e.g. `4 hours`, `30 days`)
- Admission type modifier (where applicable, e.g. pre-auth response: *4 hours emergency / 12 hours planned*)
- Escalation action if breached (e.g. "auto-escalate to insurer", "interest payable to patient")
- Escalation target (the actor to escalate to)

**The ten SLAs defined in the governance model**

| SLA | Step | Actor | Turnaround | If breached |
|---|---|---|---|---|
| Pre-auth submission | A.1 | Hospital | 2 hours of admission advice | Patient can file directly with TPA |
| Pre-auth response | A.3 | TPA | 4 h (emergency) / 12 h (planned) | Auto-escalate to insurer |
| Query response (cashless) | A.2 | Hospital + Doctor | 24 hours | TPA processes with available information |
| Pre-auth approval | A.3 | TPA | 24 h from complete submission | Auto-escalate to insurer |
| Enhancement response | A.5 | TPA | 4 hours | Auto-escalate to insurer |
| Discharge settlement | 3.4 | TPA + Insurer | 7 days from discharge | Interest payable to hospital |
| Reimbursement settlement | 3.4 | Insurer | 30 days from complete submission | Interest payable to patient |
| Query response (reimbursement) | B.5 | Patient | 15 days | Claim processed with available documents |
| Grievance acknowledgement | — | TPA / Insurer | 48 hours | Auto-escalate to IRDAI |
| Grievance resolution | — | TPA / Insurer | 15 days | Patient can approach the Ombudsman |

**Relationships**
- governs a **Step**
- is assigned to an **Actor**
- breach is logged in an **Interaction**
- breach triggers an escalation to an **Actor**
- breach evidences a **Grievance**

**Actions in an app**
- View all active SLAs for the claim with live countdowns
- See a red/green indicator for each SLA
- Trigger escalation in one tap, with CIP evidence auto-attached

**Actions without an app**
- Reference the printed SLA schedule
- Call the TPA: "When was the pre-auth filed? It's been [X] hours."
- Call the escalation target named in the schedule

---

### 8. Grievance

An escalation raised when the process has failed at any level. Grievances follow a three-level escalation path.

**Attributes**
- Grievance ID
- Claim reference
- Filed by: Patient
- Filed against: *Hospital / TPA / Insurer*
- Level: *1 (Hospital / TPA) → 2 (Insurer) → 3 (IRDAI / Ombudsman)*
- Date filed
- Description
- SLA breaches cited (list of SLA IDs)
- CIP attached? (yes/no)
- Acknowledgement SLA: 48 hours
- Resolution SLA: 15 days
- Acknowledgement date
- Resolution date
- Outcome
- Escalation history (Level 1 → 2 → 3, with dates)

**Relationships**
- belongs to a **Claim**
- is filed against a **Hospital / TPA / Insurer**
- is handled by a CRO (Level 1) → insurer grievance cell (Level 2) → IRDAI or Ombudsman (Level 3)
- is evidenced by **Interactions** (the CIP)
- references **SLA** breaches
- is governed by its own **SLAs** (acknowledgement and resolution)

**Actions in an app**
- File a grievance (auto-attach the CIP and cited SLA breaches)
- Escalate to the next level in one tap (Level 1 documents auto-forwarded)
- Track the grievance status with SLA countdown
- Attach evidence (photos, documents, CIP export)

**Actions without an app**
- Write to the CRO with a documented timeline
- Write to the insurer grievance cell; enclose Level 1 correspondence
- Call IRDAI on 155255, or write to the Insurance Ombudsman
- Photocopy every piece of correspondence for your records

---

## Actor objects

The six people and organisations a claim involves. All six are first-class objects because each has its own attributes (the Actor Registry defines different fields for each) and its own set of actions a patient needs to take.

### 9. Patient

The policyholder or insured person — the person navigating the system. In the framework's design principles, the patient is the **least informed actor**, so every feature must optimise for their clarity first.

**Attributes**
- Name
- Policyholder name (if different from the patient)
- Relationship to policyholder (self / spouse / parent / child)
- Phone number
- Email
- Photo ID type (Aadhaar / PAN / Passport)
- Photo ID number
- Policy number
- UHID (assigned at the hospital)
- Bank account details (for reimbursement settlement)
- Intimation deadline awareness: *planned — 48–72 h before, emergency — 24 h after*

**Relationships**
- has a **Policy**
- files a **Claim**
- collects **Documents**
- responds to **Queries** (in the reimbursement path)
- contacts the **Hospital, TPA, Insurer, Managed Care, CRO**
- may file a **Grievance**

**Actions in an app**
- Intimate hospitalisation with a countdown reminder
- View all my claims with status badges
- Upload and auto-tag documents
- Respond to a query (upload documents; track deadline)
- File a grievance; the app auto-attaches the CIP
- Tap to call or email the CRO

**Actions without an app**
- Carry the policy card at all times
- Visit the hospital insurance desk
- Call the TPA helpline to intimate admission
- Fill out paper claim forms
- Gather original documents in a physical folder
- Write to the CRO, then the insurer, then IRDAI

---

### 10. Doctor

The treating physician. Clinical owner of the patient's care and author of the most critical documents in the claim (admission advice note, discharge summary).

**Attributes**
- Name
- Registration number (Medical Council)
- Department / speciality
- Hospital affiliation
- Phone or extension at the hospital
- Role in the claim: *treating doctor / referring doctor / surgeon*

**Relationships**
- treats the **Patient** (via the Claim)
- works at a **Hospital**
- owns Steps 1.1, 1.2, 1.3, A.4, B.2, 3.1 (per the ownership matrix)
- is consulted at Steps A.1, A.2, A.5, 3.3
- generates **Documents**: prescription, admission advice note, discharge summary

**Actions in an app**
- Record the treating doctor's details on the claim
- Request a document from the doctor via the hospital portal

**Actions without an app**
- Write down the doctor's name and registration number from the nameplate or ID badge
- Ask the nursing station if unsure
- Ask the doctor directly: "Can I have a copy of the admission advice note?"

---

### 11. Hospital

The service provider where treatment takes place. Executes most operational steps and generates the majority of documents.

**Attributes**
- Name
- Address
- ROHINI ID (if empanelled under the ROHINI system)
- Network empanelment list (which insurers)
- Cashless support per insurer (yes / no)
- Pre-auth submission method (*online portal / email / physical*)
- Average pre-auth turnaround (published, in hours)
- Insurance desk location (floor / counter)
- **CRO (Claim Resolution Officer)** name — named individual
- CRO direct phone number
- CRO email
- UHID format

**Relationships**
- is empanelled by one or more **Insurers**
- has **Doctors**
- has a **CRO**
- executes Steps A.1, A.2, A.5, B.3, 3.1 (per the ownership matrix)
- generates **Documents**: pre-auth form, enhancement form, bills, lab reports
- hosts the **Patient** (via the Claim)

**Actions in an app**
- Check empanelment (search by insurer and hospital name)
- Locate the insurance desk (in-app map / directions)
- Tap to call or email the CRO
- Verify pre-auth has been filed
- Report an unresponsive hospital; the report is timestamped

**Actions without an app**
- Call the TPA or check the insurer's website to confirm empanelment
- Ask at reception where the insurance desk is
- Ask at the insurance desk for the CRO by name
- Ask the insurance desk: "Has the pre-auth been submitted?"
- Escalate to the TPA or file a grievance

---

### 12. Managed Care

An optional support provider that assists the patient with paperwork and navigation. Particularly valuable in the reimbursement path, where the patient must assemble and submit the claim themselves.

**Attributes**
- Provider name
- Contact person name
- Phone number
- Email
- Services offered (claim assistance / hospital coordination / document collection)
- Assigned to this policy? (yes / no)

**Relationships**
- assists the **Patient**
- coordinates between the **Patient** and the **TPA**
- is consulted at Steps A.1 (pre-auth coordination), B.4 (claim submission assistance), 3.3 (post-hospitalisation)
- is informed at Steps 1.1 and 1.3

**Actions in an app**
- Tap to call or email the managed care provider
- Raise an in-app help request

**Actions without an app**
- Call the provider number
- Ask: "Can you help me file my reimbursement claim?"
- The provider calls the TPA on the patient's behalf

---

### 13. TPA (Third Party Administrator)

The claims administrator. Owns pre-authorisation, query management, and claim adjudication.

**Attributes**
- Name
- Helpline number
- Online portal URL
- Email for claims
- Network empanelment list (which insurers)
- **CRO** name — named individual
- CRO direct phone number
- CRO email
- Average pre-auth turnaround (published, in hours)
- Average settlement turnaround (published, in days)

**Relationships**
- administers a **Policy**
- administers a **Claim**
- is appointed by an **Insurer**
- owns Steps A.1, A.2, A.3, A.5, B.4, B.5, 3.2 (per the ownership matrix)
- raises **Queries**
- issues **Documents**: approval letter, settlement letter
- has a **CRO**

**Actions in an app**
- Tap to call the helpline
- Check claim status in-app (via API)
- Tap to call or email the CRO
- Submit documents via the portal

**Actions without an app**
- Call the helpline number on the policy card
- Call the helpline with the claim reference number
- Ask for the CRO by name when calling
- Courier original documents with a tracking number

---

### 14. Insurer

The company bearing financial risk. Final approval authority and disburser of settlements.

**Attributes**
- Name
- IRDAI registration number
- Customer care helpline
- Grievance cell contact
- Email
- Portal URL
- Network hospital list
- TPAs appointed
- Escalation contact (for SLA breaches)

**Relationships**
- issues a **Policy**
- appoints a **TPA**
- empanels **Hospitals**
- owns Step 3.4 (Final Settlement)
- is consulted at Step 3.2 (Claim Adjudication, for escalations)
- settles the **Claim**
- handles **Grievances** at Level 2

**Actions in an app**
- Tap to call or email the insurer
- File a Level 2 grievance (Level 1 documents auto-forwarded)
- View the settlement letter and itemised deduction breakup

**Actions without an app**
- Call customer care
- Write to the grievance cell enclosing Level 1 correspondence
- Call for settlement status; request the settlement letter

---

## How to use this document

### For product and design teams
Treat each object as a screen or domain model. The attributes become fields. The relationships become navigation links and foreign keys. The app actions become buttons and interactions. The non-app actions are the baseline UX — the app should never make a patient worse off than someone using the non-app path.

### For policy writers and regulators
Each object is a handle for regulation. "Every TPA must publish a CRO" becomes a field on the **TPA** object. "Every claim must have a CIP" becomes a property of the **Claim**. A circular can mandate specific attributes rather than entire new processes.

### For hospital, TPA, and insurer operations
Map internal systems to these objects. If the framework says a discharge summary has 11 critical fields, the hospital's EMR template must produce a document that has all 11.

### For patient advocacy groups and educators
Teach patients the vocabulary. "You are in **Step A.2** — the query loop." "This is an **Interaction** in your CIP." "The **SLA** has been breached." A shared vocabulary turns patients from confused subjects into informed participants.

---

## Changes from the ORCA process

This data model is the result of a two-pass OOUX ORCA exercise with an independent audit between passes. The audit identified 13 issues across three severity levels. All were addressed.

**Critical fixes**
- Hospital and Managed Care were originally missing as first-class objects. Added.
- Intimation to the TPA — a top cause of claim rejection — was missing as an action. Added to Patient and Claim.

**Important fixes**
- The old "Contact" object merged four structurally different actor types. Decomposed into Hospital, TPA, Insurer, with CRO as a named attribute on Hospital and TPA.
- SLA was buried as an attribute on other objects. Promoted to its own first-class object with all ten SLA commitments.
- Claim now carries intimation date and admission type (planned / emergency), which together determine which SLA applies.
- Decision junction (the cashless-vs-reimbursement choice between Phase 1 and Phase 2) now has an explicit action.
- Query now distinguishes who responds based on path (Hospital in cashless A.2; Patient in reimbursement B.5).

**Minor fixes**
- Document now has a *Validated?* field — the whole point of the Open Claim Specification is to check critical fields are present.
- Document-to-Document dependencies are modelled explicitly.
- Step numbering preserves the branching structure (`A.1`–`A.5`, `B.1`–`B.5`) rather than a misleading flat range.
- Every object now has parallel app and non-app actions.

---

*Part of the UPCJ framework. Licensed under CC BY-SA 4.0.*
