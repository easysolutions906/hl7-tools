// HL7 v2 <-> FHIR R4 converter
// Produces valid FHIR R4 JSON Bundles from parsed HL7 v2 messages
// and converts FHIR R4 Bundles back to HL7 v2

import { parse } from './parser.js';
import { randomUUID } from 'node:crypto';

// --- Helpers ---

const uuid = () => randomUUID();

const hl7DateToFhir = (hl7Date) => {
  if (!hl7Date) { return null; }
  const d = hl7Date.replace(/[+-]\d{4}$/, ''); // strip timezone
  if (d.length >= 14) { return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(8, 10)}:${d.slice(10, 12)}:${d.slice(12, 14)}`; }
  if (d.length >= 8) { return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`; }
  if (d.length >= 6) { return `${d.slice(0, 4)}-${d.slice(4, 6)}`; }
  return d.slice(0, 4);
};

const fhirDateToHl7 = (fhirDate) => {
  if (!fhirDate) { return ''; }
  return fhirDate.replace(/[-T:]/g, '').slice(0, 14);
};

const getFieldValue = (seg, fieldNum) => {
  const field = seg?.fields?.[String(fieldNum)];
  return field?.value || '';
};

const getComponent = (seg, fieldNum, compIdx) => {
  const field = seg?.fields?.[String(fieldNum)];
  if (!field) { return ''; }
  if (field.components) {
    const comp = field.components[compIdx - 1];
    return Array.isArray(comp) ? comp[0] : (comp || '');
  }
  return compIdx === 1 ? (field.value || '') : '';
};

const findSegment = (segments, id) => segments.find((s) => s.id === id);
const findAllSegments = (segments, id) => segments.filter((s) => s.id === id);

// --- HL7 v2 -> FHIR R4 ---

const pidToPatient = (pid) => {
  if (!pid) { return null; }

  const patient = {
    resourceType: 'Patient',
    id: uuid(),
    identifier: [],
    name: [],
    telecom: [],
    address: [],
  };

  // PID-3: Patient Identifier List
  const mrn = getFieldValue(pid, 3);
  if (mrn) {
    const mrnParts = mrn.split('^');
    patient.identifier.push({
      use: 'usual',
      type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical Record Number' }] },
      value: mrnParts[0],
      ...(mrnParts[3] ? { assigner: { display: mrnParts[3] } } : {}),
    });
  }

  // PID-5: Patient Name
  const name = getFieldValue(pid, 5);
  if (name) {
    const parts = name.split('^');
    patient.name.push({
      use: 'official',
      family: parts[0] || undefined,
      given: [parts[1], parts[2]].filter(Boolean),
      prefix: parts[5] ? [parts[5]] : undefined,
      suffix: parts[4] ? [parts[4]] : undefined,
    });
  }

  // PID-7: Date of Birth
  const dob = getComponent(pid, 7, 1);
  if (dob) { patient.birthDate = hl7DateToFhir(dob); }

  // PID-8: Administrative Sex
  const sexMap = { M: 'male', F: 'female', O: 'other', U: 'unknown', A: 'other', N: 'unknown' };
  const sex = getFieldValue(pid, 8);
  if (sex) { patient.gender = sexMap[sex.toUpperCase()] || 'unknown'; }

  // PID-11: Patient Address
  const addr = getFieldValue(pid, 11);
  if (addr) {
    const parts = addr.split('^');
    patient.address.push({
      use: 'home',
      line: [parts[0]].filter(Boolean),
      city: parts[2] || undefined,
      state: parts[3] || undefined,
      postalCode: parts[4] || undefined,
      country: parts[5] || undefined,
    });
  }

  // PID-13: Home Phone
  const homePhone = getFieldValue(pid, 13);
  if (homePhone) {
    patient.telecom.push({ system: 'phone', value: homePhone, use: 'home' });
  }

  // PID-14: Business Phone
  const bizPhone = getFieldValue(pid, 14);
  if (bizPhone) {
    patient.telecom.push({ system: 'phone', value: bizPhone, use: 'work' });
  }

  // PID-10: Race
  const race = getComponent(pid, 10, 1);
  if (race) {
    patient.extension = patient.extension || [];
    patient.extension.push({
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
      extension: [{
        url: 'ombCategory',
        valueCoding: { system: 'urn:oid:2.16.840.1.113883.6.238', code: race, display: getComponent(pid, 10, 2) },
      }],
    });
  }

  // PID-16: Marital Status
  const marital = getComponent(pid, 16, 1);
  if (marital) {
    patient.maritalStatus = {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus', code: marital }],
    };
  }

  // PID-29/30: Death
  const deathDate = getComponent(pid, 29, 1);
  const deathInd = getFieldValue(pid, 30);
  if (deathInd === 'Y') { patient.deceasedBoolean = true; }
  if (deathDate) { patient.deceasedDateTime = hl7DateToFhir(deathDate); }

  // PID-15: Primary Language
  const lang = getComponent(pid, 15, 1);
  if (lang) {
    patient.communication = [{ language: { coding: [{ code: lang }] }, preferred: true }];
  }

  // Clean empty arrays
  if (!patient.identifier.length) { delete patient.identifier; }
  if (!patient.name.length) { delete patient.name; }
  if (!patient.telecom.length) { delete patient.telecom; }
  if (!patient.address.length) { delete patient.address; }

  return patient;
};

const pv1ToEncounter = (pv1, patientRef) => {
  if (!pv1) { return null; }

  const classMap = {
    I: { code: 'IMP', display: 'inpatient encounter' },
    O: { code: 'AMB', display: 'ambulatory' },
    E: { code: 'EMER', display: 'emergency' },
    P: { code: 'PRENC', display: 'pre-admission' },
    R: { code: 'AMB', display: 'ambulatory' },
    B: { code: 'IMP', display: 'inpatient encounter' },
  };

  const patClass = getFieldValue(pv1, 2);
  const cls = classMap[patClass] || { code: 'AMB', display: 'ambulatory' };

  const encounter = {
    resourceType: 'Encounter',
    id: uuid(),
    status: 'in-progress',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: cls.code, display: cls.display },
    subject: { reference: patientRef },
    participant: [],
    period: {},
  };

  // PV1-3: Location
  const location = getFieldValue(pv1, 3);
  if (location) {
    const parts = location.split('^');
    encounter.location = [{
      location: { display: [parts[0], parts[1], parts[2]].filter(Boolean).join(' ') },
      status: 'active',
    }];
  }

  // PV1-7: Attending Doctor
  const attending = getFieldValue(pv1, 7);
  if (attending) {
    const parts = attending.split('^');
    encounter.participant.push({
      type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }],
      individual: { display: `${parts[1] || ''} ${parts[0] || ''}`.trim(), identifier: parts[0] ? { value: parts[0] } : undefined },
    });
  }

  // PV1-17: Admitting Doctor
  const admitting = getFieldValue(pv1, 17);
  if (admitting) {
    const parts = admitting.split('^');
    encounter.participant.push({
      type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ADM', display: 'admitter' }] }],
      individual: { display: `${parts[1] || ''} ${parts[0] || ''}`.trim() },
    });
  }

  // PV1-44: Admit Date/Time
  const admitDt = getComponent(pv1, 44, 1);
  if (admitDt) { encounter.period.start = hl7DateToFhir(admitDt); }

  // PV1-45: Discharge Date/Time
  const dischDt = getComponent(pv1, 45, 1);
  if (dischDt) {
    encounter.period.end = hl7DateToFhir(dischDt);
    encounter.status = 'finished';
  }

  // PV1-19: Visit Number
  const visitNum = getFieldValue(pv1, 19);
  if (visitNum) {
    encounter.identifier = [{ use: 'official', value: visitNum.split('^')[0] }];
  }

  if (!encounter.participant.length) { delete encounter.participant; }
  if (!encounter.period.start && !encounter.period.end) { delete encounter.period; }

  return encounter;
};

const dg1ToCondition = (dg1, patientRef, encounterRef) => {
  if (!dg1) { return null; }

  const condition = {
    resourceType: 'Condition',
    id: uuid(),
    subject: { reference: patientRef },
    ...(encounterRef ? { encounter: { reference: encounterRef } } : {}),
  };

  // DG1-3: Diagnosis Code
  const dxCode = getFieldValue(dg1, 3);
  if (dxCode) {
    const parts = dxCode.split('^');
    condition.code = {
      coding: [{
        system: 'http://hl7.org/fhir/sid/icd-10-cm',
        code: parts[0],
        display: parts[1] || undefined,
      }],
      text: parts[1] || parts[0],
    };
  }

  // DG1-5: Diagnosis Date/Time
  const dxDate = getComponent(dg1, 5, 1);
  if (dxDate) { condition.onsetDateTime = hl7DateToFhir(dxDate); }

  // DG1-6: Diagnosis Type
  const typeMap = { A: 'encounter-diagnosis', F: 'encounter-diagnosis', W: 'problem-list-item' };
  const dxType = getFieldValue(dg1, 6);
  condition.category = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/condition-category',
      code: typeMap[dxType] || 'encounter-diagnosis',
    }],
  }];

  condition.clinicalStatus = {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
  };

  condition.verificationStatus = {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: dxType === 'F' ? 'confirmed' : 'provisional' }],
  };

  return condition;
};

const obxToObservation = (obx, patientRef, encounterRef) => {
  if (!obx) { return null; }

  const observation = {
    resourceType: 'Observation',
    id: uuid(),
    status: 'final',
    subject: { reference: patientRef },
    ...(encounterRef ? { encounter: { reference: encounterRef } } : {}),
  };

  // OBX-3: Observation Identifier
  const obsId = getFieldValue(obx, 3);
  if (obsId) {
    const parts = obsId.split('^');
    observation.code = {
      coding: [{
        system: parts[2] === 'LN' ? 'http://loinc.org' : 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: parts[0],
        display: parts[1] || undefined,
      }],
      text: parts[1] || parts[0],
    };
  }

  // OBX-2 + OBX-5: Value
  const valueType = getFieldValue(obx, 2);
  const rawValue = getFieldValue(obx, 5);
  if (rawValue) {
    const typeHandlers = {
      NM: () => { observation.valueQuantity = { value: parseFloat(rawValue) }; },
      ST: () => { observation.valueString = rawValue; },
      TX: () => { observation.valueString = rawValue; },
      FT: () => { observation.valueString = rawValue; },
      CE: () => {
        const parts = rawValue.split('^');
        observation.valueCodeableConcept = { coding: [{ code: parts[0], display: parts[1] }], text: parts[1] || parts[0] };
      },
      CWE: () => {
        const parts = rawValue.split('^');
        observation.valueCodeableConcept = { coding: [{ code: parts[0], display: parts[1] }], text: parts[1] || parts[0] };
      },
    };
    const handler = typeHandlers[valueType];
    if (handler) { handler(); }
    else { observation.valueString = rawValue; }
  }

  // OBX-6: Units (for numeric)
  const units = getFieldValue(obx, 6);
  if (units && observation.valueQuantity) {
    observation.valueQuantity.unit = units;
    observation.valueQuantity.system = 'http://unitsofmeasure.org';
    observation.valueQuantity.code = units;
  }

  // OBX-7: Reference Range
  const refRange = getFieldValue(obx, 7);
  if (refRange) {
    const parts = refRange.split('-');
    observation.referenceRange = [{
      ...(parts[0] ? { low: { value: parseFloat(parts[0]) } } : {}),
      ...(parts[1] ? { high: { value: parseFloat(parts[1]) } } : {}),
      text: refRange,
    }];
  }

  // OBX-8: Abnormal Flags
  const flagMap = { H: 'H', L: 'L', A: 'A', N: 'N', HH: 'HH', LL: 'LL' };
  const flag = getFieldValue(obx, 8);
  if (flag && flagMap[flag]) {
    observation.interpretation = [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: flagMap[flag],
      }],
    }];
  }

  // OBX-11: Result Status
  const statusMap = { F: 'final', P: 'preliminary', C: 'corrected', D: 'cancelled', X: 'cancelled', R: 'registered', I: 'registered' };
  const obxStatus = getFieldValue(obx, 11);
  if (obxStatus) { observation.status = statusMap[obxStatus] || 'final'; }

  // OBX-14: Date/Time of Observation
  const obsDt = getComponent(obx, 14, 1);
  if (obsDt) { observation.effectiveDateTime = hl7DateToFhir(obsDt); }

  return observation;
};

const obrToDiagnosticReport = (obr, patientRef, encounterRef) => {
  if (!obr) { return null; }

  const report = {
    resourceType: 'DiagnosticReport',
    id: uuid(),
    status: 'final',
    subject: { reference: patientRef },
    ...(encounterRef ? { encounter: { reference: encounterRef } } : {}),
    result: [],
  };

  // OBR-4: Universal Service Identifier
  const svcId = getFieldValue(obr, 4);
  if (svcId) {
    const parts = svcId.split('^');
    report.code = {
      coding: [{
        system: parts[2] === 'LN' ? 'http://loinc.org' : undefined,
        code: parts[0],
        display: parts[1] || undefined,
      }],
      text: parts[1] || parts[0],
    };
  }

  // OBR-7: Observation Date/Time
  const obsDt = getComponent(obr, 7, 1);
  if (obsDt) { report.effectiveDateTime = hl7DateToFhir(obsDt); }

  // OBR-22: Results Rpt/Status Change Date/Time
  const rptDt = getComponent(obr, 22, 1);
  if (rptDt) { report.issued = hl7DateToFhir(rptDt); }

  // OBR-25: Result Status
  const statusMap = { F: 'final', P: 'preliminary', C: 'corrected', X: 'cancelled', R: 'registered' };
  const status = getFieldValue(obr, 25);
  if (status) { report.status = statusMap[status] || 'final'; }

  return report;
};

const al1ToAllergyIntolerance = (al1, patientRef) => {
  if (!al1) { return null; }

  const allergy = {
    resourceType: 'AllergyIntolerance',
    id: uuid(),
    patient: { reference: patientRef },
    clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
    verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }] },
  };

  // AL1-2: Allergen Type
  const typeMap = { DA: 'medication', FA: 'food', MA: 'environment', EA: 'environment', AA: 'environment', PA: 'environment', LA: 'environment' };
  const allergenType = getComponent(al1, 2, 1);
  if (allergenType) {
    allergy.category = [typeMap[allergenType] || 'medication'];
    allergy.type = allergenType === 'DA' || allergenType === 'MC' ? 'allergy' : 'intolerance';
  }

  // AL1-3: Allergen Code/Description
  const allergen = getFieldValue(al1, 3);
  if (allergen) {
    const parts = allergen.split('^');
    allergy.code = {
      coding: [{ code: parts[0], display: parts[1] || parts[0] }],
      text: parts[1] || parts[0],
    };
  }

  // AL1-4: Severity
  const sevMap = { SV: 'severe', MO: 'moderate', MI: 'mild' };
  const severity = getComponent(al1, 4, 1);
  if (severity) { allergy.criticality = sevMap[severity] === 'severe' ? 'high' : 'low'; }

  // AL1-5: Reaction
  const reaction = getFieldValue(al1, 5);
  if (reaction) {
    allergy.reaction = [{ manifestation: [{ coding: [{ display: reaction }], text: reaction }] }];
  }

  // AL1-6: Identification Date
  const idDate = getFieldValue(al1, 6);
  if (idDate) { allergy.onsetDateTime = hl7DateToFhir(idDate); }

  return allergy;
};

const in1ToCoverage = (in1, patientRef) => {
  if (!in1) { return null; }

  const coverage = {
    resourceType: 'Coverage',
    id: uuid(),
    status: 'active',
    beneficiary: { reference: patientRef },
  };

  // IN1-2: Insurance Plan ID
  const planId = getFieldValue(in1, 2);
  if (planId) {
    const parts = planId.split('^');
    coverage.type = { coding: [{ code: parts[0], display: parts[1] || parts[0] }] };
  }

  // IN1-3: Insurance Company ID
  const insId = getFieldValue(in1, 3);
  if (insId) {
    coverage.identifier = [{ value: insId.split('^')[0] }];
  }

  // IN1-4: Insurance Company Name
  const insName = getFieldValue(in1, 4);
  if (insName) {
    coverage.payor = [{ display: insName.split('^')[0] }];
  }

  // IN1-8: Group Number
  const groupNum = getFieldValue(in1, 8);
  if (groupNum) {
    coverage.class = [{ type: { coding: [{ code: 'group' }] }, value: groupNum }];
  }

  // IN1-12/13: Plan Effective/Expiration Date
  const effDate = getFieldValue(in1, 12);
  const expDate = getFieldValue(in1, 13);
  if (effDate || expDate) {
    coverage.period = {};
    if (effDate) { coverage.period.start = hl7DateToFhir(effDate); }
    if (expDate) { coverage.period.end = hl7DateToFhir(expDate); }
  }

  // IN1-36: Policy Number
  const policyNum = getFieldValue(in1, 36);
  if (policyNum) {
    coverage.subscriberId = policyNum;
  }

  return coverage;
};

const rxaToImmunization = (rxa, patientRef) => {
  if (!rxa) { return null; }

  const immunization = {
    resourceType: 'Immunization',
    id: uuid(),
    status: 'completed',
    patient: { reference: patientRef },
  };

  // RXA-5: Administered Code
  const adminCode = getFieldValue(rxa, 5);
  if (adminCode) {
    const parts = adminCode.split('^');
    const system = parts[2] === 'CVX' ? 'http://hl7.org/fhir/sid/cvx' : undefined;
    immunization.vaccineCode = {
      coding: [{ system, code: parts[0], display: parts[1] || undefined }],
      text: parts[1] || parts[0],
    };
  }

  // RXA-3: Date/Time Start of Administration
  const adminDt = getComponent(rxa, 3, 1);
  if (adminDt) { immunization.occurrenceDateTime = hl7DateToFhir(adminDt); }

  // RXA-6: Administered Amount
  const amount = getFieldValue(rxa, 6);
  if (amount && amount !== '999') {
    immunization.doseQuantity = { value: parseFloat(amount) };
    const units = getFieldValue(rxa, 7);
    if (units) {
      const uParts = units.split('^');
      immunization.doseQuantity.unit = uParts[1] || uParts[0];
    }
  }

  // RXA-15: Substance Lot Number
  const lotNum = getFieldValue(rxa, 15);
  if (lotNum) { immunization.lotNumber = lotNum; }

  // RXA-16: Substance Expiration Date
  const expDt = getComponent(rxa, 16, 1);
  if (expDt) { immunization.expirationDate = hl7DateToFhir(expDt); }

  // RXA-17: Substance Manufacturer
  const mfr = getFieldValue(rxa, 17);
  if (mfr) {
    const parts = mfr.split('^');
    immunization.manufacturer = { display: parts[1] || parts[0] };
  }

  // RXA-10: Administering Provider
  const provider = getFieldValue(rxa, 10);
  if (provider) {
    const parts = provider.split('^');
    immunization.performer = [{
      function: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0443', code: 'AP', display: 'Administering Provider' }] },
      actor: { display: `${parts[1] || ''} ${parts[0] || ''}`.trim() },
    }];
  }

  // RXA-20: Completion Status
  const compStatus = getFieldValue(rxa, 20);
  const statusMap = { CP: 'completed', RE: 'not-done', NA: 'not-done', PA: 'completed' };
  if (compStatus) { immunization.status = statusMap[compStatus] || 'completed'; }

  // RXA-9: Administration Notes (for historical vs administered)
  const adminNotes = getFieldValue(rxa, 9);
  if (adminNotes) {
    const parts = adminNotes.split('^');
    immunization.primarySource = parts[0] !== '01'; // 01 = Historical
  }

  return immunization;
};

const orcToServiceRequest = (orc, patientRef, encounterRef) => {
  if (!orc) { return null; }

  const request = {
    resourceType: 'ServiceRequest',
    id: uuid(),
    status: 'active',
    intent: 'order',
    subject: { reference: patientRef },
    ...(encounterRef ? { encounter: { reference: encounterRef } } : {}),
  };

  // ORC-1: Order Control -> status
  const ctrlMap = { NW: 'active', CA: 'revoked', SC: 'active', RE: 'completed', DC: 'revoked', OC: 'revoked' };
  const orderCtrl = getFieldValue(orc, 1);
  if (orderCtrl) { request.status = ctrlMap[orderCtrl] || 'active'; }

  // ORC-2: Placer Order Number
  const placerNum = getFieldValue(orc, 2);
  if (placerNum) {
    request.identifier = [{ type: { coding: [{ code: 'PLAC' }] }, value: placerNum.split('^')[0] }];
  }

  // ORC-3: Filler Order Number
  const fillerNum = getFieldValue(orc, 3);
  if (fillerNum) {
    request.identifier = request.identifier || [];
    request.identifier.push({ type: { coding: [{ code: 'FILL' }] }, value: fillerNum.split('^')[0] });
  }

  // ORC-9: Date/Time of Transaction
  const txDt = getComponent(orc, 9, 1);
  if (txDt) { request.authoredOn = hl7DateToFhir(txDt); }

  // ORC-12: Ordering Provider
  const orderingProv = getFieldValue(orc, 12);
  if (orderingProv) {
    const parts = orderingProv.split('^');
    request.requester = { display: `${parts[1] || ''} ${parts[0] || ''}`.trim() };
  }

  return request;
};

const mshToMessageHeader = (msh) => {
  if (!msh) { return null; }

  const header = {
    resourceType: 'MessageHeader',
    id: uuid(),
  };

  // MSH-9: Message Type
  const msgType = getFieldValue(msh, 9);
  if (msgType) {
    const parts = msgType.split('^');
    header.eventCoding = {
      system: 'http://terminology.hl7.org/CodeSystem/v2-0003',
      code: `${parts[0]}_${parts[1] || ''}`,
      display: `${parts[0]}^${parts[1] || ''}`,
    };
  }

  // MSH-3: Sending Application
  const sendApp = getFieldValue(msh, 3);
  if (sendApp) {
    header.source = { name: sendApp.split('^')[0], endpoint: 'urn:oid:unknown' };
  }

  // MSH-5: Receiving Application
  const recvApp = getFieldValue(msh, 5);
  if (recvApp) {
    header.destination = [{ name: recvApp.split('^')[0], endpoint: 'urn:oid:unknown' }];
  }

  return header;
};

// --- Main converter: HL7 v2 -> FHIR R4 Bundle ---

const toFhir = (rawMessage, version = null) => {
  const parsed = parse(rawMessage, version);
  if (parsed.error) { return { error: parsed.error }; }

  const bundle = {
    resourceType: 'Bundle',
    id: uuid(),
    type: 'message',
    timestamp: new Date().toISOString(),
    entry: [],
  };

  const addEntry = (resource) => {
    if (!resource) { return null; }
    const fullUrl = `urn:uuid:${resource.id}`;
    bundle.entry.push({ fullUrl, resource });
    return fullUrl;
  };

  const { segments } = parsed;
  const msh = findSegment(segments, 'MSH');
  const pid = findSegment(segments, 'PID');
  const pv1 = findSegment(segments, 'PV1');

  // MessageHeader
  addEntry(mshToMessageHeader(msh));

  // Patient
  const patient = pidToPatient(pid);
  const patientRef = addEntry(patient);

  // Encounter
  const encounter = pv1ToEncounter(pv1, patientRef);
  const encounterRef = addEntry(encounter);

  // Diagnoses
  findAllSegments(segments, 'DG1').forEach((dg1) => {
    addEntry(dg1ToCondition(dg1, patientRef, encounterRef));
  });

  // Observations
  findAllSegments(segments, 'OBX').forEach((obx) => {
    const obsRef = addEntry(obxToObservation(obx, patientRef, encounterRef));
    // Link to DiagnosticReport if present
  });

  // Observation Requests / Diagnostic Reports
  findAllSegments(segments, 'OBR').forEach((obr) => {
    addEntry(obrToDiagnosticReport(obr, patientRef, encounterRef));
  });

  // Allergies
  findAllSegments(segments, 'AL1').forEach((al1) => {
    addEntry(al1ToAllergyIntolerance(al1, patientRef));
  });

  // Insurance / Coverage
  findAllSegments(segments, 'IN1').forEach((in1) => {
    addEntry(in1ToCoverage(in1, patientRef));
  });

  // Immunizations
  findAllSegments(segments, 'RXA').forEach((rxa) => {
    addEntry(rxaToImmunization(rxa, patientRef));
  });

  // Orders / ServiceRequests
  findAllSegments(segments, 'ORC').forEach((orc) => {
    addEntry(orcToServiceRequest(orc, patientRef, encounterRef));
  });

  return {
    messageType: `${parsed.messageType.code}^${parsed.messageType.event}`,
    version: parsed.version,
    resourceCount: bundle.entry.length,
    bundle,
  };
};

// --- FHIR R4 -> HL7 v2 ---

const findResource = (bundle, resourceType) =>
  bundle.entry?.find((e) => e.resource?.resourceType === resourceType)?.resource;

const findAllResources = (bundle, resourceType) =>
  (bundle.entry || []).filter((e) => e.resource?.resourceType === resourceType).map((e) => e.resource);

const patientToPID = (patient) => {
  if (!patient) { return ''; }

  const fields = new Array(39).fill('');

  // PID-1
  fields[0] = '1';

  // PID-3: Identifier
  const mrId = patient.identifier?.find((id) =>
    id.type?.coding?.some((c) => c.code === 'MR'),
  ) || patient.identifier?.[0];
  if (mrId) {
    fields[2] = `${mrId.value || ''}^^^${mrId.assigner?.display || ''}^MR`;
  }

  // PID-5: Name
  const name = patient.name?.find((n) => n.use === 'official') || patient.name?.[0];
  if (name) {
    const given = name.given || [];
    fields[4] = `${name.family || ''}^${given[0] || ''}^${given[1] || ''}^^${(name.prefix || [])[0] || ''}^${(name.suffix || [])[0] || ''}`;
  }

  // PID-7: DOB
  if (patient.birthDate) { fields[6] = fhirDateToHl7(patient.birthDate); }

  // PID-8: Gender
  const genderMap = { male: 'M', female: 'F', other: 'O', unknown: 'U' };
  if (patient.gender) { fields[7] = genderMap[patient.gender] || 'U'; }

  // PID-11: Address
  const addr = patient.address?.[0];
  if (addr) {
    fields[10] = `${(addr.line || [])[0] || ''}^^${addr.city || ''}^${addr.state || ''}^${addr.postalCode || ''}^${addr.country || ''}`;
  }

  // PID-13: Home Phone
  const homePhone = patient.telecom?.find((t) => t.system === 'phone' && t.use === 'home');
  if (homePhone) { fields[12] = homePhone.value; }

  // PID-14: Work Phone
  const workPhone = patient.telecom?.find((t) => t.system === 'phone' && t.use === 'work');
  if (workPhone) { fields[13] = workPhone.value; }

  return `PID|${fields.join('|')}`;
};

const encounterToPV1 = (encounter) => {
  if (!encounter) { return ''; }

  const fields = new Array(52).fill('');
  fields[0] = '1';

  // PV1-2: Patient Class
  const classMap = { IMP: 'I', AMB: 'O', EMER: 'E', PRENC: 'P' };
  const cls = encounter.class?.code;
  fields[1] = classMap[cls] || 'O';

  // PV1-3: Location
  const loc = encounter.location?.[0]?.location?.display;
  if (loc) { fields[2] = loc; }

  // PV1-44/45: Admit/Discharge dates
  if (encounter.period?.start) { fields[43] = fhirDateToHl7(encounter.period.start); }
  if (encounter.period?.end) { fields[44] = fhirDateToHl7(encounter.period.end); }

  // PV1-19: Visit Number
  const visitId = encounter.identifier?.[0]?.value;
  if (visitId) { fields[18] = visitId; }

  return `PV1|${fields.join('|')}`;
};

const conditionToDG1 = (condition, setId = 1) => {
  if (!condition) { return ''; }

  const fields = new Array(21).fill('');
  fields[0] = String(setId);

  // DG1-3: Diagnosis Code
  const coding = condition.code?.coding?.[0];
  if (coding) {
    fields[2] = `${coding.code || ''}^${coding.display || ''}^I10`;
  }

  // DG1-5: Diagnosis Date
  if (condition.onsetDateTime) { fields[4] = fhirDateToHl7(condition.onsetDateTime); }

  // DG1-6: Diagnosis Type
  const catCode = condition.category?.[0]?.coding?.[0]?.code;
  fields[5] = catCode === 'problem-list-item' ? 'W' : 'F';

  return `DG1|${fields.join('|')}`;
};

const observationToOBX = (observation, setId = 1) => {
  if (!observation) { return ''; }

  const fields = new Array(25).fill('');
  fields[0] = String(setId);

  // OBX-2: Value Type
  let valueType = 'ST';
  let value = '';
  if (observation.valueQuantity) {
    valueType = 'NM';
    value = String(observation.valueQuantity.value);
  } else if (observation.valueString) {
    valueType = 'ST';
    value = observation.valueString;
  } else if (observation.valueCodeableConcept) {
    valueType = 'CE';
    const coding = observation.valueCodeableConcept.coding?.[0];
    value = coding ? `${coding.code || ''}^${coding.display || ''}` : '';
  }
  fields[1] = valueType;

  // OBX-3: Observation Identifier
  const coding = observation.code?.coding?.[0];
  if (coding) {
    const sys = coding.system === 'http://loinc.org' ? 'LN' : '';
    fields[2] = `${coding.code || ''}^${coding.display || ''}^${sys}`;
  }

  // OBX-5: Value
  fields[4] = value;

  // OBX-6: Units
  if (observation.valueQuantity?.unit) {
    fields[5] = observation.valueQuantity.unit;
  }

  // OBX-7: Reference Range
  const range = observation.referenceRange?.[0];
  if (range) {
    fields[6] = range.text || `${range.low?.value || ''}-${range.high?.value || ''}`;
  }

  // OBX-8: Abnormal Flags
  const interp = observation.interpretation?.[0]?.coding?.[0]?.code;
  if (interp) { fields[7] = interp; }

  // OBX-11: Result Status
  const statusMap = { final: 'F', preliminary: 'P', corrected: 'C', cancelled: 'X', registered: 'R' };
  fields[10] = statusMap[observation.status] || 'F';

  // OBX-14: Effective DateTime
  if (observation.effectiveDateTime) { fields[13] = fhirDateToHl7(observation.effectiveDateTime); }

  return `OBX|${fields.join('|')}`;
};

// --- Main converter: FHIR R4 -> HL7 v2 ---

const toHl7 = (fhirBundle) => {
  if (!fhirBundle || !fhirBundle.entry) {
    return { error: 'Invalid FHIR Bundle — must have entry array' };
  }

  const patient = findResource(fhirBundle, 'Patient');
  const encounter = findResource(fhirBundle, 'Encounter');
  const conditions = findAllResources(fhirBundle, 'Condition');
  const observations = findAllResources(fhirBundle, 'Observation');
  const messageHeader = findResource(fhirBundle, 'MessageHeader');

  // Build MSH
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const ctrlId = uuid().replace(/-/g, '').substring(0, 20).toUpperCase();

  let msgType = 'ADT^A08^ADT_A08';
  if (messageHeader?.eventCoding?.code) {
    const code = messageHeader.eventCoding.code.replace('_', '^');
    msgType = `${code}^${code.replace('^', '_')}`;
  }

  const sendApp = messageHeader?.source?.name || 'FHIR_CONVERTER';
  const recvApp = messageHeader?.destination?.[0]?.name || 'RECEIVER';

  const segments = [
    `MSH|^~\\&|${sendApp}||${recvApp}||${ts}||${msgType}|${ctrlId}|P|2.5.1`,
    `EVN|${msgType.split('^')[1] || 'A08'}|${ts}`,
  ];

  // PID
  if (patient) { segments.push(patientToPID(patient)); }

  // PV1
  if (encounter) { segments.push(encounterToPV1(encounter)); }

  // DG1
  conditions.forEach((cond, idx) => {
    const seg = conditionToDG1(cond, idx + 1);
    if (seg) { segments.push(seg); }
  });

  // OBX
  observations.forEach((obs, idx) => {
    const seg = observationToOBX(obs, idx + 1);
    if (seg) { segments.push(seg); }
  });

  return {
    segmentCount: segments.length,
    message: segments.join('\r'),
  };
};

export { toFhir, toHl7 };
