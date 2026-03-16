// HL7 v2 test message generator
// Produces realistic but fake data for common message types

import { randomUUID } from 'node:crypto';

// --- Random data pools ---

const LAST_NAMES = [
  'SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS',
  'RODRIGUEZ', 'MARTINEZ', 'HERNANDEZ', 'LOPEZ', 'GONZALEZ', 'WILSON', 'ANDERSON',
  'THOMAS', 'TAYLOR', 'MOORE', 'JACKSON', 'MARTIN', 'LEE', 'PEREZ', 'THOMPSON',
  'WHITE', 'HARRIS', 'SANCHEZ', 'CLARK', 'RAMIREZ', 'LEWIS', 'ROBINSON',
];

const FIRST_NAMES_F = [
  'MARY', 'PATRICIA', 'JENNIFER', 'LINDA', 'BARBARA', 'ELIZABETH', 'SUSAN', 'JESSICA',
  'SARAH', 'KAREN', 'LISA', 'NANCY', 'BETTY', 'MARGARET', 'SANDRA', 'ASHLEY',
  'DOROTHY', 'KIMBERLY', 'EMILY', 'DONNA', 'MICHELLE', 'CAROL', 'AMANDA', 'MELISSA',
];

const FIRST_NAMES_M = [
  'JAMES', 'ROBERT', 'JOHN', 'MICHAEL', 'DAVID', 'WILLIAM', 'RICHARD', 'JOSEPH',
  'THOMAS', 'CHARLES', 'CHRISTOPHER', 'DANIEL', 'MATTHEW', 'ANTHONY', 'MARK', 'DONALD',
  'STEVEN', 'PAUL', 'ANDREW', 'JOSHUA', 'KENNETH', 'KEVIN', 'BRIAN', 'GEORGE',
];

const STREETS = [
  '123 Main St', '456 Oak Ave', '789 Elm Blvd', '321 Pine Rd', '654 Maple Dr',
  '987 Cedar Ln', '111 Birch Way', '222 Walnut Ct', '333 Spruce St', '444 Ash Ave',
  '555 Hickory Pl', '666 Willow Rd', '777 Cherry Dr', '888 Poplar Ln', '999 Juniper Way',
];

const CITIES = [
  'SPRINGFIELD', 'PORTLAND', 'FRANKLIN', 'GREENVILLE', 'BRISTOL',
  'FAIRVIEW', 'RIVERSIDE', 'MADISON', 'GEORGETOWN', 'CENTERVILLE',
  'SALEM', 'CHESTER', 'MILFORD', 'SHELBY', 'ASHLAND',
];

const STATES = [
  'IL', 'OR', 'TN', 'SC', 'CT', 'VA', 'CA', 'WI', 'KY', 'OH',
  'MA', 'PA', 'MI', 'NC', 'TX', 'NY', 'FL', 'GA', 'AZ', 'CO',
];

const FACILITIES = [
  'GENERAL HOSPITAL', 'COMMUNITY MEDICAL CENTER', 'REGIONAL HEALTH SYSTEM',
  'UNIVERSITY HOSPITAL', 'MEMORIAL MEDICAL CENTER', 'ST MARY HOSPITAL',
  'MERCY HEALTH', 'GOOD SAMARITAN HOSPITAL', 'PROVIDENCE MEDICAL CENTER',
];

const SENDING_APPS = ['EPIC', 'CERNER', 'MEDITECH', 'ALLSCRIPTS', 'ATHENA', 'NEXTGEN'];

const DOCTOR_LAST = [
  'PATEL', 'CHEN', 'JOHNSON', 'KIM', 'NGUYEN', 'GARCIA', 'SMITH', 'WILLIAMS',
  'SINGH', 'JONES', 'BROWN', 'DAVIS', 'MILLER', 'WILSON', 'MOORE',
];

const DOCTOR_FIRST = [
  'ANIL', 'WEI', 'SARAH', 'JIN', 'TRAN', 'MARIA', 'ROBERT', 'JAMES',
  'PRIYA', 'DAVID', 'LISA', 'MICHAEL', 'JENNIFER', 'THOMAS', 'SUSAN',
];

const LOINC_CODES = [
  { code: '2093-3', name: 'Cholesterol [Mass/Vol]', unit: 'mg/dL', low: 125, high: 200 },
  { code: '2571-8', name: 'Triglyceride [Mass/Vol]', unit: 'mg/dL', low: 50, high: 150 },
  { code: '2085-9', name: 'HDL Cholesterol [Mass/Vol]', unit: 'mg/dL', low: 40, high: 60 },
  { code: '2089-1', name: 'LDL Cholesterol [Mass/Vol]', unit: 'mg/dL', low: 50, high: 100 },
  { code: '2345-7', name: 'Glucose [Mass/Vol]', unit: 'mg/dL', low: 70, high: 100 },
  { code: '718-7', name: 'Hemoglobin [Mass/Vol]', unit: 'g/dL', low: 12.0, high: 17.5 },
  { code: '4544-3', name: 'Hematocrit [Volume Fraction]', unit: '%', low: 36, high: 52 },
  { code: '6690-2', name: 'WBC [#/Vol]', unit: '10*3/uL', low: 4.5, high: 11.0 },
  { code: '789-8', name: 'RBC [#/Vol]', unit: '10*6/uL', low: 4.2, high: 5.9 },
  { code: '787-2', name: 'MCV [Entitic Vol]', unit: 'fL', low: 80, high: 100 },
  { code: '785-6', name: 'MCH [Entitic Mass]', unit: 'pg', low: 27, high: 31 },
  { code: '786-4', name: 'MCHC [Mass/Vol]', unit: 'g/dL', low: 32, high: 36 },
  { code: '777-3', name: 'Platelet [#/Vol]', unit: '10*3/uL', low: 150, high: 400 },
  { code: '2160-0', name: 'Creatinine [Mass/Vol]', unit: 'mg/dL', low: 0.6, high: 1.2 },
  { code: '3094-0', name: 'BUN [Mass/Vol]', unit: 'mg/dL', low: 7, high: 20 },
  { code: '2951-2', name: 'Sodium [Moles/Vol]', unit: 'mmol/L', low: 136, high: 145 },
  { code: '2823-3', name: 'Potassium [Moles/Vol]', unit: 'mmol/L', low: 3.5, high: 5.1 },
  { code: '2075-0', name: 'Chloride [Moles/Vol]', unit: 'mmol/L', low: 98, high: 106 },
  { code: '2028-9', name: 'CO2 [Moles/Vol]', unit: 'mmol/L', low: 22, high: 29 },
  { code: '17861-6', name: 'Calcium [Mass/Vol]', unit: 'mg/dL', low: 8.5, high: 10.5 },
];

const ALLERGENS = [
  { code: 'Z88.0', name: 'PENICILLIN', type: 'DA', reaction: 'HIVES' },
  { code: 'Z88.1', name: 'SULFONAMIDES', type: 'DA', reaction: 'RASH' },
  { code: 'Z88.2', name: 'ASPIRIN', type: 'DA', reaction: 'ANAPHYLAXIS' },
  { code: 'Z91.010', name: 'PEANUTS', type: 'FA', reaction: 'ANAPHYLAXIS' },
  { code: 'Z91.010', name: 'SHELLFISH', type: 'FA', reaction: 'HIVES' },
  { code: 'Z88.5', name: 'CODEINE', type: 'DA', reaction: 'NAUSEA' },
  { code: 'Z91.030', name: 'LATEX', type: 'MA', reaction: 'CONTACT DERMATITIS' },
  { code: 'Z88.8', name: 'IODINE', type: 'DA', reaction: 'RASH' },
];

const ICD10_CODES = [
  { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified' },
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', desc: 'Essential (primary) hypertension' },
  { code: 'M54.5', desc: 'Low back pain' },
  { code: 'J18.9', desc: 'Pneumonia, unspecified organism' },
  { code: 'K21.0', desc: 'Gastro-esophageal reflux disease with esophagitis' },
  { code: 'N39.0', desc: 'Urinary tract infection, site not specified' },
  { code: 'R10.9', desc: 'Unspecified abdominal pain' },
  { code: 'R50.9', desc: 'Fever, unspecified' },
  { code: 'Z00.00', desc: 'Encounter for general adult medical examination' },
];

const CVX_CODES = [
  { code: '08', name: 'Hep B, adolescent or pediatric' },
  { code: '115', name: 'Tdap' },
  { code: '140', name: 'Influenza, seasonal, injectable, preservative free' },
  { code: '197', name: 'influenza, high-dose, quadrivalent' },
  { code: '207', name: 'COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5mL dose' },
  { code: '208', name: 'COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose' },
  { code: '03', name: 'MMR' },
  { code: '21', name: 'Varicella' },
  { code: '33', name: 'Pneumococcal polysaccharide PPV23' },
  { code: '187', name: 'Recombinant Zoster' },
];

const VACCINE_MANUFACTURERS = [
  { code: 'PMC', name: 'Pfizer' },
  { code: 'MOD', name: 'Moderna' },
  { code: 'MSD', name: 'Merck' },
  { code: 'SKB', name: 'GlaxoSmithKline' },
  { code: 'PFR', name: 'Pfizer' },
];

// --- Utility ---

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, len = 2) => String(n).padStart(len, '0');

const randMRN = () => String(randInt(1000000, 9999999));
const randAcct = () => String(randInt(100000000, 999999999));
const randCtrlId = () => randomUUID().replace(/-/g, '').substring(0, 20).toUpperCase();
const randNPI = () => String(randInt(1000000000, 1999999999));
const randVisitNum = () => `V${randInt(10000, 99999)}`;

const randDate = (yearsBack = 80) => {
  const now = new Date();
  const past = new Date(now.getFullYear() - yearsBack, 0, 1);
  const ts = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  const d = new Date(ts);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

const randDOB = () => randDate(80);

const nowTS = () => {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const recentTS = (hoursBack = 48) => {
  const d = new Date(Date.now() - Math.random() * hoursBack * 3600000);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const randZip = () => `${randInt(10000, 99999)}`;

const randGender = () => (Math.random() > 0.5 ? 'M' : 'F');

const randPatient = () => {
  const gender = randGender();
  const firstName = pick(gender === 'M' ? FIRST_NAMES_M : FIRST_NAMES_F);
  const lastName = pick(LAST_NAMES);
  const dob = randDOB();
  const mrn = randMRN();
  const acct = randAcct();
  const addr = `${pick(STREETS)}^^${pick(CITIES)}^${pick(STATES)}^${randZip()}`;
  const phone = `(${randInt(200, 999)})${randInt(200, 999)}-${pad(randInt(0, 9999), 4)}`;
  return { firstName, lastName, gender, dob, mrn, acct, addr, phone };
};

const randDoctor = () => {
  const last = pick(DOCTOR_LAST);
  const first = pick(DOCTOR_FIRST);
  const npi = randNPI();
  return { last, first, npi };
};

// --- MSH builder ---

const buildMSH = (msgType, event, sendApp, sendFac, recvApp, recvFac, version = '2.5.1') => {
  const ts = nowTS();
  const ctrlId = randCtrlId();
  return `MSH|^~\\&|${sendApp}|${sendFac}|${recvApp}|${recvFac}|${ts}||${msgType}^${event}^${msgType}_${event}|${ctrlId}|P|${version}`;
};

// --- Message generators ---

const generators = {
  'ADT^A01': (opts = {}) => {
    const pat = randPatient();
    const attending = randDoctor();
    const admitting = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const recvApp = opts.receivingApplication || pick(SENDING_APPS);
    const recvFac = opts.receivingFacility || pick(FACILITIES);
    const dx = pick(ICD10_CODES);
    const allergy = pick(ALLERGENS);

    const segments = [
      buildMSH('ADT', 'A01', sendApp, sendFac, recvApp, recvFac, opts.version),
      `EVN|A01|${nowTS()}|||${admitting.npi}^${admitting.last}^${admitting.first}`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}||2106-3^White^HL70005|${pat.addr}||${pat.phone}||||||||${pat.acct}`,
      `NK1|1|${pick(LAST_NAMES)}^${pick(FIRST_NAMES_F)}|SPO^Spouse^HL70063|${pick(STREETS)}^^${pick(CITIES)}^${pick(STATES)}^${randZip()}|${pat.phone}`,
      `PV1|1|I|${pick(['4E', '3W', '5N', 'ICU', '2S'])}^${randInt(100, 999)}^${randInt(1, 4)}^^^${sendFac}|E|||${attending.npi}^${attending.last}^${attending.first}^^^MD|||MED|||1|||${admitting.npi}^${admitting.last}^${admitting.first}^^^MD||${randVisitNum()}|||||||||||||||||||||||||${recentTS(24)}`,
      `DG1|1||${dx.code}^${dx.desc}^I10||${recentTS(24)}|A`,
      `AL1|1|${allergy.type}|${allergy.code}^${allergy.name}|MO|${allergy.reaction}|${randDate(10)}`,
    ];

    return segments.join('\r');
  },

  'ADT^A08': (opts = {}) => {
    const pat = randPatient();
    const attending = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);

    const segments = [
      buildMSH('ADT', 'A08', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `EVN|A08|${nowTS()}`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}||${pat.phone}||||||||${pat.acct}`,
      `PV1|1|O|${pick(['CLINIC', 'ENDO', 'CARDIO', 'PCP'])}^^^^^${sendFac}|R|||${attending.npi}^${attending.last}^${attending.first}^^^MD`,
    ];

    return segments.join('\r');
  },

  'ADT^A04': (opts = {}) => {
    const pat = randPatient();
    const attending = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);

    const segments = [
      buildMSH('ADT', 'A04', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `EVN|A04|${nowTS()}`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}||${pat.phone}||||||||${pat.acct}`,
      `PV1|1|O|${pick(['REG', 'CLINIC', 'URG'])}^^^^^${sendFac}|R|||${attending.npi}^${attending.last}^${attending.first}^^^MD||||||||||${randVisitNum()}`,
    ];

    return segments.join('\r');
  },

  'ORM^O01': (opts = {}) => {
    const pat = randPatient();
    const ordering = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const test = pick(LOINC_CODES);
    const orderNum = `ORD${randInt(100000, 999999)}`;

    const segments = [
      buildMSH('ORM', 'O01', sendApp, sendFac, 'LAB', sendFac, opts.version),
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}`,
      `PV1|1|O|${pick(['CLINIC', 'ER', 'LAB'])}^^^^^${sendFac}`,
      `ORC|NW|${orderNum}||${orderNum}_GRP|||^^^${nowTS()}^^R||${nowTS()}|${ordering.npi}^${ordering.last}^${ordering.first}^^^MD||${ordering.npi}^${ordering.last}^${ordering.first}^^^MD`,
      `OBR|1|${orderNum}||${test.code}^${test.name}^LN|||${recentTS(2)}||||||||${ordering.npi}^${ordering.last}^${ordering.first}^^^MD`,
    ];

    return segments.join('\r');
  },

  'ORU^R01': (opts = {}) => {
    const pat = randPatient();
    const ordering = randDoctor();
    const sendApp = opts.sendingApplication || 'LAB';
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const orderNum = `ORD${randInt(100000, 999999)}`;
    const fillerNum = `FIL${randInt(100000, 999999)}`;

    // Generate 3-6 random lab results
    const numResults = randInt(3, 6);
    const tests = [];
    const used = new Set();
    while (tests.length < numResults) {
      const t = pick(LOINC_CODES);
      if (!used.has(t.code)) {
        used.add(t.code);
        tests.push(t);
      }
    }

    const segments = [
      buildMSH('ORU', 'R01', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}`,
      `PV1|1|O|LAB^^^^^${sendFac}`,
      `ORC|RE|${orderNum}|${fillerNum}||||^^^${recentTS(4)}^^R||${nowTS()}|||${ordering.npi}^${ordering.last}^${ordering.first}^^^MD`,
      `OBR|1|${orderNum}|${fillerNum}|${tests[0].code}^${tests[0].name}^LN|||${recentTS(4)}|||||||||${ordering.npi}^${ordering.last}^${ordering.first}^^^MD||||||${nowTS()}|||F`,
    ];

    tests.forEach((test, idx) => {
      const value = (Math.random() * (test.high * 1.3 - test.low * 0.7) + test.low * 0.7).toFixed(1);
      const numVal = parseFloat(value);
      const flag = numVal > test.high ? 'H' : numVal < test.low ? 'L' : 'N';
      segments.push(
        `OBX|${idx + 1}|NM|${test.code}^${test.name}^LN||${value}|${test.unit}|${test.low}-${test.high}|${flag}|||F|||${recentTS(2)}`,
      );
    });

    return segments.join('\r');
  },

  'SIU^S12': (opts = {}) => {
    const pat = randPatient();
    const provider = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const apptId = `APPT${randInt(100000, 999999)}`;
    const reasons = ['FOLLOWUP', 'NEW PATIENT', 'ANNUAL EXAM', 'URGENT', 'CONSULT', 'PROCEDURE'];

    const segments = [
      buildMSH('SIU', 'S12', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `SCH|${apptId}|${apptId}|||||${pick(reasons)}^${pick(reasons)}|NORMAL^Normal^HL70277|30|MIN|^^^${recentTS(0)}^^${recentTS(0)}|${provider.npi}^${provider.last}^${provider.first}^^^MD`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}||${pat.phone}`,
      `PV1|1|O|${pick(['CLINIC', 'PCP', 'SPEC'])}^^^^^${sendFac}||||${provider.npi}^${provider.last}^${provider.first}^^^MD`,
    ];

    return segments.join('\r');
  },

  'MDM^T02': (opts = {}) => {
    const pat = randPatient();
    const author = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);

    const segments = [
      buildMSH('MDM', 'T02', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `EVN|T02|${nowTS()}`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}`,
      `PV1|1|O|${pick(['CLINIC', 'PCP'])}^^^^^${sendFac}||||${author.npi}^${author.last}^${author.first}^^^MD`,
      `ORC|RE|||||||||||${author.npi}^${author.last}^${author.first}^^^MD`,
      `OBR|1|||11488-4^Consultation Note^LN|||${recentTS(2)}`,
      `OBX|1|TX|11488-4^Consultation Note^LN||Patient presents for follow-up visit. Vitals stable. Continue current medications.||||||F`,
    ];

    return segments.join('\r');
  },

  'DFT^P03': (opts = {}) => {
    const pat = randPatient();
    const provider = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const cptCodes = [
      { code: '99213', desc: 'Office visit, established, level 3' },
      { code: '99214', desc: 'Office visit, established, level 4' },
      { code: '99203', desc: 'Office visit, new patient, level 3' },
      { code: '36415', desc: 'Routine venipuncture' },
      { code: '80053', desc: 'Comprehensive metabolic panel' },
      { code: '85025', desc: 'Complete blood count with differential' },
    ];
    const cpt = pick(cptCodes);
    const dx = pick(ICD10_CODES);

    const segments = [
      buildMSH('DFT', 'P03', sendApp, sendFac, pick(SENDING_APPS), pick(FACILITIES), opts.version),
      `EVN|P03|${nowTS()}`,
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}||||||||${pat.acct}`,
      `PV1|1|O|${pick(['CLINIC', 'PCP'])}^^^^^${sendFac}||||${provider.npi}^${provider.last}^${provider.first}^^^MD||||||||||${randVisitNum()}`,
      `FT1|1||${randInt(10000, 99999)}|${recentTS(2)}|${nowTS()}|CG|${cpt.code}^${cpt.desc}^CPT||||1|||||||||||${provider.npi}^${provider.last}^${provider.first}^^^MD`,
      `DG1|1||${dx.code}^${dx.desc}^I10||${recentTS(24)}|F`,
    ];

    return segments.join('\r');
  },

  'VXU^V04': (opts = {}) => {
    const pat = randPatient();
    const admin = randDoctor();
    const sendApp = opts.sendingApplication || pick(SENDING_APPS);
    const sendFac = opts.sendingFacility || pick(FACILITIES);
    const vaccine = pick(CVX_CODES);
    const mfr = pick(VACCINE_MANUFACTURERS);
    const lotNum = `${String.fromCharCode(randInt(65, 90))}${randInt(10000, 99999)}`;

    const segments = [
      buildMSH('VXU', 'V04', sendApp, sendFac, pick(SENDING_APPS), 'IIS', opts.version),
      `PID|1||${pat.mrn}^^^${sendFac}^MR||${pat.lastName}^${pat.firstName}||${pat.dob}|${pat.gender}|||${pat.addr}||${pat.phone}`,
      `PD1||||${admin.npi}^${admin.last}^${admin.first}^^^MD`,
      `NK1|1|${pick(LAST_NAMES)}^${pick(FIRST_NAMES_F)}|MTH^Mother^HL70063`,
      `ORC|RE|||||||||||${admin.npi}^${admin.last}^${admin.first}^^^MD`,
      `RXA|0|1|${recentTS(24)}|${recentTS(24)}|${vaccine.code}^${vaccine.name}^CVX|999|||01^Historical^NIP001||||${lotNum}||${mfr.code}^${mfr.name}^MVX|||CP|A`,
      `OBX|1|CE|64994-7^Vaccine funding program eligibility category^LN||V02^VFC eligible - Medicaid/Medicaid Managed Care^HL70064||||||F`,
    ];

    return segments.join('\r');
  },
};

// --- Public API ---

const SUPPORTED_TYPES = Object.keys(generators);

const generate = (messageType, opts = {}) => {
  const normalized = messageType.toUpperCase().replace(/\s+/g, '');
  const gen = generators[normalized];

  if (!gen) {
    return {
      error: `Unsupported message type: ${messageType}`,
      supportedTypes: SUPPORTED_TYPES,
    };
  }

  return {
    messageType: normalized,
    message: gen(opts),
    note: 'Generated test message with realistic but fake data. Do NOT use in production systems.',
  };
};

export { generate, SUPPORTED_TYPES };
