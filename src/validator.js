import { parse } from './parser.js';
import { SEGMENT_FIELD_MAPS, getSegmentDef } from './definitions.js';

// --- Message type segment requirements ---

const MESSAGE_REQUIREMENTS = {
  'ADT^A01': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1', 'NTE'] },
  'ADT^A02': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'DG1', 'AL1'] },
  'ADT^A03': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'DG1', 'AL1'] },
  'ADT^A04': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1', 'NTE'] },
  'ADT^A05': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1'] },
  'ADT^A06': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1'] },
  'ADT^A07': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1'] },
  'ADT^A08': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1', 'NTE'] },
  'ADT^A11': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'DG1'] },
  'ADT^A12': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'DG1'] },
  'ADT^A13': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['PD1', 'NK1', 'PV2', 'DG1', 'AL1'] },
  'ADT^A28': { required: ['MSH', 'EVN', 'PID'], optional: ['PD1', 'NK1', 'PV1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1'] },
  'ADT^A31': { required: ['MSH', 'EVN', 'PID'], optional: ['PD1', 'NK1', 'PV1', 'PV2', 'IN1', 'GT1', 'DG1', 'AL1'] },
  'ORM^O01': { required: ['MSH', 'PID', 'ORC', 'OBR'], optional: ['PV1', 'NTE', 'IN1', 'DG1', 'OBX', 'AL1'] },
  'ORU^R01': { required: ['MSH', 'PID', 'OBR', 'OBX'], optional: ['PV1', 'ORC', 'NTE', 'NK1'] },
  'SIU^S12': { required: ['MSH', 'SCH'], optional: ['PID', 'PV1', 'NTE', 'DG1'] },
  'SIU^S13': { required: ['MSH', 'SCH'], optional: ['PID', 'PV1', 'NTE'] },
  'SIU^S14': { required: ['MSH', 'SCH'], optional: ['PID', 'PV1', 'NTE'] },
  'SIU^S15': { required: ['MSH', 'SCH'], optional: ['PID', 'PV1', 'NTE'] },
  'SIU^S26': { required: ['MSH', 'SCH'], optional: ['PID', 'PV1', 'NTE'] },
  'MDM^T02': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['ORC', 'OBR', 'OBX', 'NTE'] },
  'DFT^P03': { required: ['MSH', 'EVN', 'PID', 'FT1'], optional: ['PV1', 'PV2', 'DG1', 'IN1', 'GT1', 'PR1'] },
  'VXU^V04': { required: ['MSH', 'PID', 'RXA'], optional: ['PD1', 'NK1', 'PV1', 'IN1', 'ORC', 'OBX', 'NTE'] },
  'RDE^O11': { required: ['MSH', 'PID', 'ORC', 'RXE'], optional: ['PV1', 'NTE', 'RXA', 'OBX'] },
  'BAR^P01': { required: ['MSH', 'EVN', 'PID', 'PV1'], optional: ['DG1', 'PR1', 'IN1', 'GT1', 'FT1'] },
};

// --- Timestamp validation ---

const isValidTimestamp = (value) => {
  if (!value) { return true; } // Empty is OK for optional
  // HL7 timestamps: YYYY[MM[DD[HH[MM[SS[.S[S[S[S]]]]]]]]][+/-ZZZZ]
  return /^\d{4}(\d{2}(\d{2}(\d{2}(\d{2}(\d{2}(\.\d{1,4})?)?)?)?)?)?([+-]\d{4})?$/.test(value);
};

// --- Validate a parsed message ---

const validate = (rawMessage, version = null) => {
  const parsed = parse(rawMessage, version);
  if (parsed.error) {
    return { valid: false, issues: [{ severity: 'error', message: parsed.error }] };
  }

  const issues = [];
  const segIds = parsed.segments.map((s) => s.id);
  const msgKey = `${parsed.messageType.code}^${parsed.messageType.event}`;

  // 1. Check MSH is first
  if (segIds[0] !== 'MSH') {
    issues.push({ severity: 'error', segment: 'MSH', message: 'MSH must be the first segment' });
  }

  // 2. Check required segments for message type
  const reqs = MESSAGE_REQUIREMENTS[msgKey];
  if (reqs) {
    reqs.required.forEach((seg) => {
      if (!segIds.includes(seg)) {
        issues.push({
          severity: 'error',
          segment: seg,
          message: `Required segment ${seg} is missing for message type ${msgKey}`,
        });
      }
    });
  } else {
    issues.push({
      severity: 'warning',
      message: `Unknown message type ${msgKey} — cannot validate segment requirements`,
    });
  }

  // 3. Check required fields within known segments
  parsed.segments.forEach((seg) => {
    const segDef = getSegmentDef(seg.id, parsed.version);
    if (!segDef) { return; }

    segDef.forEach((fieldDef) => {
      if (fieldDef.optionality !== 'R') { return; }
      const field = seg.fields[String(fieldDef.num)];
      if (!field || !field.value) {
        issues.push({
          severity: 'error',
          segment: seg.id,
          field: fieldDef.num,
          fieldName: fieldDef.name,
          message: `Required field ${seg.id}-${fieldDef.num} (${fieldDef.name}) is empty or missing`,
        });
      }
    });
  });

  // 4. Validate timestamps
  parsed.segments.forEach((seg) => {
    const segDef = getSegmentDef(seg.id, parsed.version);
    if (!segDef) { return; }

    segDef.forEach((fieldDef) => {
      if (fieldDef.dataType !== 'TS' && fieldDef.dataType !== 'DTM') { return; }
      const field = seg.fields[String(fieldDef.num)];
      if (!field || !field.value) { return; }
      // Extract the first component (the actual timestamp)
      const tsValue = field.value.split('^')[0];
      if (tsValue && !isValidTimestamp(tsValue)) {
        issues.push({
          severity: 'warning',
          segment: seg.id,
          field: fieldDef.num,
          fieldName: fieldDef.name,
          message: `Field ${seg.id}-${fieldDef.num} (${fieldDef.name}) has invalid timestamp format: "${tsValue}"`,
        });
      }
    });
  });

  // 5. Check MSH required fields specifically
  const msh = parsed.segments.find((s) => s.id === 'MSH');
  if (msh) {
    if (!msh.fields['10']?.value) {
      issues.push({
        severity: 'error',
        segment: 'MSH',
        field: 10,
        message: 'MSH-10 (Message Control ID) is required',
      });
    }
    if (!msh.fields['9']?.value) {
      issues.push({
        severity: 'error',
        segment: 'MSH',
        field: 9,
        message: 'MSH-9 (Message Type) is required',
      });
    }
  }

  // 6. Check for unknown segments (info level)
  const knownSegments = new Set(Object.keys(SEGMENT_FIELD_MAPS));
  segIds.forEach((id) => {
    if (!knownSegments.has(id)) {
      issues.push({
        severity: 'info',
        segment: id,
        message: `Segment ${id} is not in the definitions database — fields will not have names or descriptions`,
      });
    }
  });

  // Deduplicate
  const seen = new Set();
  const unique = issues.filter((issue) => {
    const key = JSON.stringify(issue);
    if (seen.has(key)) { return false; }
    seen.add(key);
    return true;
  });

  const errorCount = unique.filter((i) => i.severity === 'error').length;
  const warningCount = unique.filter((i) => i.severity === 'warning').length;
  const infoCount = unique.filter((i) => i.severity === 'info').length;

  return {
    valid: errorCount === 0,
    messageType: msgKey,
    version: parsed.version,
    segmentCount: parsed.segmentCount,
    errorCount,
    warningCount,
    infoCount,
    issues: unique,
  };
};

export { validate, MESSAGE_REQUIREMENTS };
