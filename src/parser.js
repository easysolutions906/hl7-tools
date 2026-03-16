import { SEGMENT_FIELD_MAPS, segmentNames } from './definitions.js';

// --- Encoding character detection ---

const DEFAULT_ENCODING = {
  fieldSep: '|',
  componentSep: '^',
  repeatSep: '~',
  escapeSep: '\\',
  subcomponentSep: '&',
};

const detectEncoding = (msh2) => {
  if (!msh2 || msh2.length < 4) { return DEFAULT_ENCODING; }
  return {
    fieldSep: '|',
    componentSep: msh2[0],
    repeatSep: msh2[1],
    escapeSep: msh2[2],
    subcomponentSep: msh2[3],
  };
};

// --- Splitting helpers ---

const splitComponents = (value, enc) => {
  if (!value || typeof value !== 'string') { return [value]; }
  return value.split(enc.componentSep).map((comp) =>
    comp.includes(enc.subcomponentSep) ? comp.split(enc.subcomponentSep) : comp,
  );
};

const splitRepeats = (value, enc) => {
  if (!value || typeof value !== 'string') { return [value]; }
  return value.split(enc.repeatSep);
};

// --- Build structured field ---

const buildField = (rawValue, fieldNum, segmentId, enc, version) => {
  const fieldMap = SEGMENT_FIELD_MAPS[segmentId];
  const def = fieldMap ? fieldMap[String(fieldNum)] : null;

  const result = {
    value: rawValue || '',
  };

  if (def) {
    result.name = def.name;
    result.dataType = def.dataType;
    result.description = def.description;
  }

  if (rawValue && rawValue.includes(enc.repeatSep)) {
    const repeats = splitRepeats(rawValue, enc);
    result.repeats = repeats.map((r) => {
      const comps = splitComponents(r, enc);
      return comps.length > 1 ? { value: r, components: comps } : { value: r };
    });
  } else if (rawValue && rawValue.includes(enc.componentSep)) {
    result.components = splitComponents(rawValue, enc);
  }

  return result;
};

// --- Main parser ---

const parse = (rawMessage, version = null) => {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return { error: 'No message provided' };
  }

  // Normalize line endings — HL7 uses \r, but messages may arrive with \n or \r\n
  const lines = rawMessage
    .replace(/\r\n/g, '\r')
    .replace(/\n/g, '\r')
    .split('\r')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { error: 'Empty message' };
  }

  // First segment must be MSH
  const firstLine = lines[0];
  if (!firstLine.startsWith('MSH')) {
    return { error: 'Message must start with MSH segment' };
  }

  // MSH-1 is the field separator (character at position 3)
  const fieldSep = firstLine[3];
  if (!fieldSep) {
    return { error: 'Cannot detect field separator from MSH segment' };
  }

  // MSH-2 is the encoding characters (positions 4-7)
  const mshFields = firstLine.split(fieldSep);
  // MSH is special: MSH-1 is the separator itself, MSH-2 starts at index 1
  const msh2 = mshFields[1]; // encoding characters
  const enc = detectEncoding(msh2);
  enc.fieldSep = fieldSep;

  // Detect version from MSH-12 if not provided
  const msh12 = mshFields[11] || '';
  const detectedVersion = version || msh12.split(enc.componentSep)[0] || '2.5.1';

  // Detect message type from MSH-9
  const msh9 = mshFields[8] || '';
  const msh9Parts = msh9.split(enc.componentSep);
  const messageType = {
    code: msh9Parts[0] || '',
    event: msh9Parts[1] || '',
    structure: msh9Parts[2] || '',
  };

  // Parse all segments
  const segments = lines.map((line) => {
    const segId = line.substring(0, 3);
    const isMSH = segId === 'MSH';

    let fields;
    if (isMSH) {
      // MSH is special: field separator is MSH-1, not a regular field split
      const rawFields = line.split(fieldSep);
      fields = {};

      // MSH-1: Field Separator
      fields['1'] = buildField(fieldSep, 1, 'MSH', enc, detectedVersion);

      // MSH-2: Encoding Characters
      fields['2'] = buildField(msh2, 2, 'MSH', enc, detectedVersion);

      // MSH-3 onwards: index in rawFields is fieldNum - 1 (because MSH-1 is the separator)
      rawFields.slice(2).forEach((val, idx) => {
        const fieldNum = idx + 3;
        fields[String(fieldNum)] = buildField(val, fieldNum, 'MSH', enc, detectedVersion);
      });
    } else {
      const rawFields = line.split(fieldSep);
      fields = {};
      rawFields.slice(1).forEach((val, idx) => {
        const fieldNum = idx + 1;
        fields[String(fieldNum)] = buildField(val, fieldNum, segId, enc, detectedVersion);
      });
    }

    return {
      id: segId,
      name: segmentNames[segId] || segId,
      fields,
    };
  });

  return {
    version: detectedVersion,
    messageType,
    encoding: enc,
    segmentCount: segments.length,
    segments,
    raw: rawMessage,
  };
};

// --- Explain: human-readable breakdown ---

const explain = (rawMessage, version = null) => {
  const parsed = parse(rawMessage, version);
  if (parsed.error) { return parsed; }

  const lines = [];
  lines.push(`HL7 v${parsed.version} Message: ${parsed.messageType.code}^${parsed.messageType.event}`);
  lines.push(`Segments: ${parsed.segmentCount}`);
  lines.push('');

  parsed.segments.forEach((seg) => {
    lines.push(`=== ${seg.id} — ${seg.name} ===`);
    Object.entries(seg.fields).forEach(([num, field]) => {
      if (!field.value && field.value !== 0) { return; }
      const label = field.name ? `${seg.id}-${num} ${field.name}` : `${seg.id}-${num}`;
      const dtype = field.dataType ? ` [${field.dataType}]` : '';
      lines.push(`  ${label}${dtype}: ${field.value}`);
      if (field.components) {
        field.components.forEach((comp, ci) => {
          const compVal = Array.isArray(comp) ? comp.join(' & ') : comp;
          if (compVal) {
            lines.push(`    .${ci + 1}: ${compVal}`);
          }
        });
      }
      if (field.repeats) {
        field.repeats.forEach((rep, ri) => {
          lines.push(`    ~${ri + 1}: ${rep.value}`);
        });
      }
    });
    lines.push('');
  });

  return {
    summary: `${parsed.messageType.code}^${parsed.messageType.event} (HL7 v${parsed.version}), ${parsed.segmentCount} segments`,
    explanation: lines.join('\n'),
    parsed,
  };
};

// --- Diff: compare two messages ---

const diff = (msg1, msg2, version = null) => {
  const p1 = parse(msg1, version);
  const p2 = parse(msg2, version);

  if (p1.error) { return { error: `Message 1: ${p1.error}` }; }
  if (p2.error) { return { error: `Message 2: ${p2.error}` }; }

  const differences = [];

  // Compare versions
  if (p1.version !== p2.version) {
    differences.push({ type: 'version', msg1: p1.version, msg2: p2.version });
  }

  // Compare message types
  if (p1.messageType.code !== p2.messageType.code || p1.messageType.event !== p2.messageType.event) {
    differences.push({
      type: 'messageType',
      msg1: `${p1.messageType.code}^${p1.messageType.event}`,
      msg2: `${p2.messageType.code}^${p2.messageType.event}`,
    });
  }

  // Build segment maps
  const buildSegMap = (parsed) => {
    const map = {};
    parsed.segments.forEach((seg, idx) => {
      const key = seg.id + (map[seg.id] ? `_${idx}` : '');
      map[key] = seg;
    });
    return map;
  };

  // Collect all segment IDs from both messages
  const seg1Ids = p1.segments.map((s) => s.id);
  const seg2Ids = p2.segments.map((s) => s.id);

  // Segments only in msg1
  const only1 = seg1Ids.filter((id, idx) => !seg2Ids.includes(id));
  const only2 = seg2Ids.filter((id, idx) => !seg1Ids.includes(id));

  only1.forEach((id) => differences.push({ type: 'segment_removed', segment: id }));
  only2.forEach((id) => differences.push({ type: 'segment_added', segment: id }));

  // Compare common segments field by field
  const maxLen = Math.max(p1.segments.length, p2.segments.length);
  const minLen = Math.min(p1.segments.length, p2.segments.length);

  p1.segments.forEach((seg1, idx) => {
    if (idx >= p2.segments.length) { return; }
    const seg2 = p2.segments[idx];
    if (seg1.id !== seg2.id) {
      differences.push({ type: 'segment_mismatch', position: idx, msg1: seg1.id, msg2: seg2.id });
      return;
    }

    const allFields = new Set([...Object.keys(seg1.fields), ...Object.keys(seg2.fields)]);
    allFields.forEach((fieldNum) => {
      const v1 = seg1.fields[fieldNum]?.value || '';
      const v2 = seg2.fields[fieldNum]?.value || '';
      if (v1 !== v2) {
        differences.push({
          type: 'field_changed',
          segment: seg1.id,
          field: fieldNum,
          fieldName: seg1.fields[fieldNum]?.name || seg2.fields[fieldNum]?.name || '',
          msg1: v1,
          msg2: v2,
        });
      }
    });
  });

  return {
    identical: differences.length === 0,
    differenceCount: differences.length,
    differences,
  };
};

export { parse, explain, diff, detectEncoding, splitComponents, splitRepeats };
