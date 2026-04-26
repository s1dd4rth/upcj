import { addDuration } from "./duration.js";
import { SLAS } from "./registries.js";
import type { Claim, Interaction, SLAStatus, AdmissionType } from "./types.js";
import type { SLAEntry } from "./registries.js";

export function evaluateSLAs(claim: Claim, options: { now: string }): SLAStatus[] {
  return SLAS.map(sla => computeSLAStatus(sla, claim.interactions ?? [], options.now, claim.admissionType));
}

export function computeSLAStatus(
  sla: SLAEntry,
  interactions: Interaction[],
  now: string,
  admissionType: AdmissionType
): SLAStatus {
  const startInter = interactions.find(i => sla.startsOn.includes(i.eventName));
  if (!startInter) {
    return { id: sla.id, state: "pending", startedAt: null, deadline: null, endedAt: null };
  }
  const startedAt = startInter.timestamp;
  const duration = sla.duration ?? sla.durationByAdmissionType?.[admissionType];
  if (!duration) {
    throw new Error(`SLA ${sla.id} has no duration for admissionType ${admissionType}`);
  }
  const deadline = addDuration(startedAt, duration);

  const endInter = interactions.find(i =>
    Date.parse(i.timestamp) > Date.parse(startedAt) && sla.endsOn.includes(i.eventName)
  );

  if (endInter) {
    return Date.parse(endInter.timestamp) <= Date.parse(deadline)
      ? { id: sla.id, state: "completed", startedAt, deadline, endedAt: endInter.timestamp }
      : { id: sla.id, state: "breached",  startedAt, deadline, endedAt: endInter.timestamp, escalation: sla.escalation };
  }

  if (Date.parse(now) >= Date.parse(deadline)) {
    return { id: sla.id, state: "breached", startedAt, deadline, endedAt: null, escalation: sla.escalation };
  }

  return { id: sla.id, state: "active", startedAt, deadline, endedAt: null };
}
