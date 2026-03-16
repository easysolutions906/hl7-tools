// HL7 v2.x segment and field definitions
// Base version: 2.5.1 (most common in production)
// Naming follows CARISTIX conventions

// --- Data type abbreviations ---
// ST = String, ID = Coded value (HL7 table), IS = Coded value (user table),
// CX = Extended Composite ID, XPN = Extended Person Name, XAD = Extended Address,
// XTN = Extended Telecommunication Number, TS = Timestamp, DTM = Date/Time,
// CE = Coded Element, CWE = Coded With Exceptions, CNE = Coded No Exceptions,
// NM = Numeric, SI = Sequence ID, HD = Hierarchic Designator,
// MSG = Message Type, PT = Processing Type, VID = Version Identifier,
// EI = Entity Identifier, PL = Person Location, XCN = Extended Composite Name,
// FC = Financial Class, DLD = Discharge to Location, CP = Composite Price,
// MO = Money, DR = Date/Time Range, NDL = Name with Date and Location,
// JCC = Job Code/Class, CCD = Charge Code and Date, DIN = Date and Institution,
// AUI = Authorization Information, RMC = Room Coverage, OSD = Order Sequence Definition,
// OSP = Occurrence Span Code and Date, RPT = Repeat Pattern, TQ = Timing/Quantity

// --- Helper to build field definition ---
const f = (num, name, dataType, opt, rep, desc) => ({
  num, name, dataType, optionality: opt, repeating: rep, description: desc,
});

// =============================================================================
// MSH — Message Header
// =============================================================================
const MSH = [
  f(1, 'Field Separator', 'ST', 'R', 'N', 'Separator between fields (always |)'),
  f(2, 'Encoding Characters', 'ST', 'R', 'N', 'Component, repetition, escape, subcomponent separators (^~\\&)'),
  f(3, 'Sending Application', 'HD', 'O', 'N', 'Application that sent the message'),
  f(4, 'Sending Facility', 'HD', 'O', 'N', 'Facility that sent the message'),
  f(5, 'Receiving Application', 'HD', 'O', 'N', 'Application intended to receive the message'),
  f(6, 'Receiving Facility', 'HD', 'O', 'N', 'Facility intended to receive the message'),
  f(7, 'Date/Time of Message', 'TS', 'R', 'N', 'Date and time the message was created'),
  f(8, 'Security', 'ST', 'O', 'N', 'Security classification of the message'),
  f(9, 'Message Type', 'MSG', 'R', 'N', 'Message type, trigger event, and message structure (e.g., ADT^A01^ADT_A01)'),
  f(10, 'Message Control ID', 'ST', 'R', 'N', 'Unique identifier for this message instance'),
  f(11, 'Processing ID', 'PT', 'R', 'N', 'Processing mode: P=Production, T=Training, D=Debugging'),
  f(12, 'Version ID', 'VID', 'R', 'N', 'HL7 version (e.g., 2.5.1)'),
  f(13, 'Sequence Number', 'NM', 'O', 'N', 'Sequence number for continuous transmission'),
  f(14, 'Continuation Pointer', 'ST', 'O', 'N', 'Continuation pointer for fragmented messages'),
  f(15, 'Accept Acknowledgment Type', 'ID', 'O', 'N', 'Conditions under which accept acknowledgments are required'),
  f(16, 'Application Acknowledgment Type', 'ID', 'O', 'N', 'Conditions under which application acknowledgments are required'),
  f(17, 'Country Code', 'ID', 'O', 'N', 'Country of origin (ISO 3166)'),
  f(18, 'Character Set', 'ID', 'O', 'Y', 'Character set(s) used in the message'),
  f(19, 'Principal Language of Message', 'CE', 'O', 'N', 'Principal language of the message'),
  f(20, 'Alternate Character Set Handling Scheme', 'ID', 'O', 'N', 'Scheme for switching between character sets'),
  f(21, 'Message Profile Identifier', 'EI', 'O', 'Y', 'Conformance profile(s) the message conforms to'),
];

// =============================================================================
// EVN — Event Type
// =============================================================================
const EVN = [
  f(1, 'Event Type Code', 'ID', 'O', 'N', 'Event type that triggered this message (deprecated — use MSH-9)'),
  f(2, 'Recorded Date/Time', 'TS', 'O', 'N', 'Date/time the event was recorded in the system'),
  f(3, 'Date/Time Planned Event', 'TS', 'O', 'N', 'Date/time the event is planned to occur'),
  f(4, 'Event Reason Code', 'IS', 'O', 'N', 'Reason for the event (user-defined table 0062)'),
  f(5, 'Operator ID', 'XCN', 'O', 'Y', 'Operator/user who triggered the event'),
  f(6, 'Event Occurred', 'TS', 'O', 'N', 'Date/time the event actually occurred'),
  f(7, 'Event Facility', 'HD', 'O', 'N', 'Facility where the event occurred'),
];

// =============================================================================
// PID — Patient Identification
// =============================================================================
const PID = [
  f(1, 'Set ID - PID', 'SI', 'O', 'N', 'Sequence number for multiple PID segments'),
  f(2, 'Patient ID', 'CX', 'O', 'N', 'External patient identifier (deprecated in v2.3.1+, use PID-3)'),
  f(3, 'Patient Identifier List', 'CX', 'R', 'Y', 'List of patient identifiers (MRN, SSN, etc.)'),
  f(4, 'Alternate Patient ID - PID', 'CX', 'O', 'Y', 'Alternate patient identifiers (deprecated in v2.3.1+)'),
  f(5, 'Patient Name', 'XPN', 'R', 'Y', 'Legal name and aliases of the patient'),
  f(6, 'Mother\'s Maiden Name', 'XPN', 'O', 'Y', 'Mother\'s maiden name, used for identity verification'),
  f(7, 'Date/Time of Birth', 'TS', 'O', 'N', 'Patient date of birth'),
  f(8, 'Administrative Sex', 'IS', 'O', 'N', 'Patient administrative sex (F, M, O, U, A, N)'),
  f(9, 'Patient Alias', 'XPN', 'O', 'Y', 'Patient aliases (deprecated in v2.4+)'),
  f(10, 'Race', 'CE', 'O', 'Y', 'Patient race (HL7 table 0005)'),
  f(11, 'Patient Address', 'XAD', 'O', 'Y', 'Patient mailing and residential addresses'),
  f(12, 'County Code', 'IS', 'O', 'N', 'Patient county code (deprecated — use PID-11 component)'),
  f(13, 'Phone Number - Home', 'XTN', 'O', 'Y', 'Patient home phone number(s)'),
  f(14, 'Phone Number - Business', 'XTN', 'O', 'Y', 'Patient business phone number(s)'),
  f(15, 'Primary Language', 'CE', 'O', 'N', 'Patient primary spoken language'),
  f(16, 'Marital Status', 'CE', 'O', 'N', 'Patient marital status (HL7 table 0002)'),
  f(17, 'Religion', 'CE', 'O', 'N', 'Patient religion (HL7 table 0006)'),
  f(18, 'Patient Account Number', 'CX', 'O', 'N', 'Primary account number for the patient visit'),
  f(19, 'SSN Number - Patient', 'ST', 'O', 'N', 'Social Security Number (deprecated — use PID-3)'),
  f(20, 'Driver\'s License Number - Patient', 'DLN', 'O', 'N', 'Driver\'s license number (deprecated in v2.5+)'),
  f(21, 'Mother\'s Identifier', 'CX', 'O', 'Y', 'Identifier(s) of the patient\'s mother'),
  f(22, 'Ethnic Group', 'CE', 'O', 'Y', 'Patient ethnic group (HL7 table 0189)'),
  f(23, 'Birth Place', 'ST', 'O', 'N', 'City and state/province of birth'),
  f(24, 'Multiple Birth Indicator', 'ID', 'O', 'N', 'Whether patient was part of a multiple birth (Y/N)'),
  f(25, 'Birth Order', 'NM', 'O', 'N', 'Birth order for multiple births'),
  f(26, 'Citizenship', 'CE', 'O', 'Y', 'Patient citizenship(s) (HL7 table 0171)'),
  f(27, 'Veterans Military Status', 'CE', 'O', 'N', 'Military status of a veteran (HL7 table 0172)'),
  f(28, 'Nationality', 'CE', 'O', 'N', 'Patient nationality (deprecated in v2.4+)'),
  f(29, 'Patient Death Date and Time', 'TS', 'O', 'N', 'Date and time of patient death'),
  f(30, 'Patient Death Indicator', 'ID', 'O', 'N', 'Whether patient is deceased (Y/N)'),
  f(31, 'Identity Unknown Indicator', 'ID', 'O', 'N', 'Whether patient identity is unknown (Y/N)'),
  f(32, 'Identity Reliability Code', 'IS', 'O', 'Y', 'Reliability of patient identifying data'),
  f(33, 'Last Update Date/Time', 'TS', 'O', 'N', 'Date/time of last update to the patient record'),
  f(34, 'Last Update Facility', 'HD', 'O', 'N', 'Facility that last updated the patient record'),
  f(35, 'Species Code', 'CE', 'O', 'N', 'Species code for veterinary use'),
  f(36, 'Breed Code', 'CE', 'O', 'N', 'Breed code for veterinary use'),
  f(37, 'Strain', 'ST', 'O', 'N', 'Strain description for veterinary use'),
  f(38, 'Production Class Code', 'CE', 'O', 'N', 'Production class for veterinary use'),
  f(39, 'Tribal Citizenship', 'CWE', 'O', 'Y', 'Tribal citizenship (added in v2.5)'),
];

// =============================================================================
// PD1 — Patient Additional Demographics
// =============================================================================
const PD1 = [
  f(1, 'Living Dependency', 'IS', 'O', 'Y', 'Living arrangement dependency (e.g., spouse, alone)'),
  f(2, 'Living Arrangement', 'IS', 'O', 'N', 'Situation of the patient\'s residential environment'),
  f(3, 'Patient Primary Facility', 'XON', 'O', 'Y', 'Patient\'s primary care facility'),
  f(4, 'Patient Primary Care Provider Name & ID No.', 'XCN', 'O', 'Y', 'Primary care provider name and identifier'),
  f(5, 'Student Indicator', 'IS', 'O', 'N', 'Whether patient is a student (F=Full time, P=Part time, N=Not)'),
  f(6, 'Handicap', 'IS', 'O', 'N', 'Nature of patient handicap'),
  f(7, 'Living Will Code', 'IS', 'O', 'N', 'Whether patient has a living will (Y/F/N/I/U)'),
  f(8, 'Organ Donor Code', 'IS', 'O', 'N', 'Whether patient is a designated organ donor'),
  f(9, 'Separate Bill', 'ID', 'O', 'N', 'Whether patient wants a separate bill'),
  f(10, 'Duplicate Patient', 'CX', 'O', 'Y', 'Identifiers of patients considered duplicates'),
  f(11, 'Publicity Code', 'CE', 'O', 'N', 'Publicity/privacy restriction code'),
  f(12, 'Protection Indicator', 'ID', 'O', 'N', 'Whether the patient record should be protected (Y/N)'),
  f(13, 'Protection Indicator Effective Date', 'DT', 'O', 'N', 'Date protection indicator becomes effective'),
  f(14, 'Place of Worship', 'XON', 'O', 'Y', 'Patient\'s place of worship'),
  f(15, 'Advance Directive Code', 'CE', 'O', 'Y', 'Type(s) of advance directive filed'),
  f(16, 'Immunization Registry Status', 'IS', 'O', 'N', 'Patient\'s immunization registry status'),
  f(17, 'Immunization Registry Status Effective Date', 'DT', 'O', 'N', 'Date immunization registry status became effective'),
  f(18, 'Publicity Code Effective Date', 'DT', 'O', 'N', 'Date publicity code became effective'),
  f(19, 'Military Branch', 'IS', 'O', 'N', 'Branch of military service'),
  f(20, 'Military Rank/Grade', 'IS', 'O', 'N', 'Military rank or grade'),
  f(21, 'Military Status', 'IS', 'O', 'N', 'Military status (active, retired, etc.)'),
];

// =============================================================================
// NK1 — Next of Kin / Associated Parties
// =============================================================================
const NK1 = [
  f(1, 'Set ID - NK1', 'SI', 'R', 'N', 'Sequence number for multiple NK1 segments'),
  f(2, 'NK Name', 'XPN', 'O', 'Y', 'Name(s) of the next of kin / associated party'),
  f(3, 'Relationship', 'CE', 'O', 'N', 'Relationship to the patient (HL7 table 0063)'),
  f(4, 'Address', 'XAD', 'O', 'Y', 'Address of the next of kin'),
  f(5, 'Phone Number', 'XTN', 'O', 'Y', 'Phone number(s) of the next of kin'),
  f(6, 'Business Phone Number', 'XTN', 'O', 'Y', 'Business phone number(s)'),
  f(7, 'Contact Role', 'CE', 'O', 'N', 'Role of the contact (e.g., emergency contact, employer)'),
  f(8, 'Start Date', 'DT', 'O', 'N', 'Start date of the contact relationship'),
  f(9, 'End Date', 'DT', 'O', 'N', 'End date of the contact relationship'),
  f(10, 'Next of Kin / Associated Parties Job Title', 'ST', 'O', 'N', 'Job title of the NK1'),
  f(11, 'Next of Kin / Associated Parties Job Code/Class', 'JCC', 'O', 'N', 'Job code and employee classification'),
  f(12, 'Next of Kin / Associated Parties Employee Number', 'CX', 'O', 'N', 'Employee number of the NK1'),
  f(13, 'Organization Name - NK1', 'XON', 'O', 'Y', 'Organization name of the NK1'),
  f(14, 'Marital Status', 'CE', 'O', 'N', 'Marital status of the NK1'),
  f(15, 'Administrative Sex', 'IS', 'O', 'N', 'Administrative sex of the NK1'),
  f(16, 'Date/Time of Birth', 'TS', 'O', 'N', 'Date of birth of the NK1'),
  f(17, 'Living Dependency', 'IS', 'O', 'Y', 'Living dependency of the NK1'),
  f(18, 'Ambulatory Status', 'IS', 'O', 'Y', 'Ambulatory status of the NK1'),
  f(19, 'Citizenship', 'CE', 'O', 'Y', 'Citizenship of the NK1'),
  f(20, 'Primary Language', 'CE', 'O', 'N', 'Primary language of the NK1'),
  f(21, 'Living Arrangement', 'IS', 'O', 'N', 'Living arrangement of the NK1'),
  f(22, 'Publicity Code', 'CE', 'O', 'N', 'Publicity/privacy code for the NK1'),
  f(23, 'Protection Indicator', 'ID', 'O', 'N', 'Whether NK1 record is protected'),
  f(24, 'Student Indicator', 'IS', 'O', 'N', 'Student status of the NK1'),
  f(25, 'Religion', 'CE', 'O', 'N', 'Religion of the NK1'),
  f(26, 'Mother\'s Maiden Name', 'XPN', 'O', 'Y', 'Mother\'s maiden name of the NK1'),
  f(27, 'Nationality', 'CE', 'O', 'N', 'Nationality of the NK1'),
  f(28, 'Ethnic Group', 'CE', 'O', 'Y', 'Ethnic group of the NK1'),
  f(29, 'Contact Reason', 'CE', 'O', 'Y', 'Reason for contacting the NK1'),
  f(30, 'Contact Person\'s Name', 'XPN', 'O', 'Y', 'Name of the person to contact'),
  f(31, 'Contact Person\'s Telephone Number', 'XTN', 'O', 'Y', 'Phone number of the contact person'),
  f(32, 'Contact Person\'s Address', 'XAD', 'O', 'Y', 'Address of the contact person'),
  f(33, 'Next of Kin / Associated Party\'s Identifiers', 'CX', 'O', 'Y', 'Identifiers for the NK1'),
  f(34, 'Job Status', 'IS', 'O', 'N', 'Job status of the NK1'),
  f(35, 'Race', 'CE', 'O', 'Y', 'Race of the NK1'),
  f(36, 'Handicap', 'IS', 'O', 'N', 'Handicap of the NK1'),
  f(37, 'Contact Person Social Security Number', 'ST', 'O', 'N', 'SSN of the contact person'),
  f(38, 'Next of Kin Birth Place', 'ST', 'O', 'N', 'Birth place of the NK1'),
  f(39, 'VIP Indicator', 'IS', 'O', 'N', 'VIP indicator for the NK1'),
];

// =============================================================================
// PV1 — Patient Visit
// =============================================================================
const PV1 = [
  f(1, 'Set ID - PV1', 'SI', 'O', 'N', 'Sequence number for multiple PV1 segments'),
  f(2, 'Patient Class', 'IS', 'R', 'N', 'Patient classification (I=Inpatient, O=Outpatient, E=Emergency, P=Preadmit, R=Recurring, B=Obstetrics)'),
  f(3, 'Assigned Patient Location', 'PL', 'O', 'N', 'Patient\'s initial assigned location (point of care, room, bed)'),
  f(4, 'Admission Type', 'IS', 'O', 'N', 'Type of admission (A=Accident, E=Emergency, L=Labor, R=Routine, N=Newborn, U=Urgent)'),
  f(5, 'Preadmit Number', 'CX', 'O', 'N', 'Preadmit number assigned prior to admission'),
  f(6, 'Prior Patient Location', 'PL', 'O', 'N', 'Patient\'s previous assigned location'),
  f(7, 'Attending Doctor', 'XCN', 'O', 'Y', 'Attending physician for the visit'),
  f(8, 'Referring Doctor', 'XCN', 'O', 'Y', 'Referring physician'),
  f(9, 'Consulting Doctor', 'XCN', 'O', 'Y', 'Consulting physician(s)'),
  f(10, 'Hospital Service', 'IS', 'O', 'N', 'Hospital service (e.g., MED, SUR, URO, CAR)'),
  f(11, 'Temporary Location', 'PL', 'O', 'N', 'Temporary patient location (e.g., OR, radiology)'),
  f(12, 'Preadmit Test Indicator', 'IS', 'O', 'N', 'Whether preadmit testing is required'),
  f(13, 'Re-admission Indicator', 'IS', 'O', 'N', 'Whether this is a readmission'),
  f(14, 'Admit Source', 'IS', 'O', 'N', 'Source of the admission (e.g., physician referral, transfer, ER)'),
  f(15, 'Ambulatory Status', 'IS', 'O', 'Y', 'Ambulatory status of the patient'),
  f(16, 'VIP Indicator', 'IS', 'O', 'N', 'VIP indicator for the patient visit'),
  f(17, 'Admitting Doctor', 'XCN', 'O', 'Y', 'Admitting physician'),
  f(18, 'Patient Type', 'IS', 'O', 'N', 'Type of patient for billing/reimbursement'),
  f(19, 'Visit Number', 'CX', 'O', 'N', 'Unique identifier for this patient visit'),
  f(20, 'Financial Class', 'FC', 'O', 'Y', 'Primary financial class for the visit'),
  f(21, 'Charge Price Indicator', 'IS', 'O', 'N', 'Charge price indicator for the visit'),
  f(22, 'Courtesy Code', 'IS', 'O', 'N', 'Courtesy extended (e.g., employee, board member)'),
  f(23, 'Credit Rating', 'IS', 'O', 'N', 'Patient credit rating'),
  f(24, 'Contract Code', 'IS', 'O', 'Y', 'Contract code(s) for the visit'),
  f(25, 'Contract Effective Date', 'DT', 'O', 'Y', 'Effective date of the contract'),
  f(26, 'Contract Amount', 'NM', 'O', 'Y', 'Contract amount'),
  f(27, 'Contract Period', 'NM', 'O', 'Y', 'Contract period in days'),
  f(28, 'Interest Code', 'IS', 'O', 'N', 'Interest code for the account'),
  f(29, 'Transfer to Bad Debt Code', 'IS', 'O', 'N', 'Whether account has been transferred to bad debt'),
  f(30, 'Transfer to Bad Debt Date', 'DT', 'O', 'N', 'Date account was transferred to bad debt'),
  f(31, 'Bad Debt Agency Code', 'IS', 'O', 'N', 'Bad debt agency identifier'),
  f(32, 'Bad Debt Transfer Amount', 'NM', 'O', 'N', 'Amount transferred to bad debt'),
  f(33, 'Bad Debt Recovery Amount', 'NM', 'O', 'N', 'Amount recovered from bad debt'),
  f(34, 'Delete Account Indicator', 'IS', 'O', 'N', 'Whether to delete the account'),
  f(35, 'Delete Account Date', 'DT', 'O', 'N', 'Date account was deleted'),
  f(36, 'Discharge Disposition', 'IS', 'O', 'N', 'Disposition of the patient at discharge'),
  f(37, 'Discharged to Location', 'DLD', 'O', 'N', 'Facility/location patient was discharged to'),
  f(38, 'Diet Type', 'CE', 'O', 'N', 'Diet type prescribed for the patient'),
  f(39, 'Servicing Facility', 'IS', 'O', 'N', 'Healthcare facility providing the service'),
  f(40, 'Bed Status', 'IS', 'O', 'N', 'Status of the bed (deprecated in v2.3)'),
  f(41, 'Account Status', 'IS', 'O', 'N', 'Status of the account'),
  f(42, 'Pending Location', 'PL', 'O', 'N', 'Location to which the patient is being moved'),
  f(43, 'Prior Temporary Location', 'PL', 'O', 'N', 'Patient\'s prior temporary location'),
  f(44, 'Admit Date/Time', 'TS', 'O', 'N', 'Date and time of patient admission'),
  f(45, 'Discharge Date/Time', 'TS', 'O', 'Y', 'Date and time of patient discharge'),
  f(46, 'Current Patient Balance', 'NM', 'O', 'N', 'Current outstanding balance for the visit'),
  f(47, 'Total Charges', 'NM', 'O', 'N', 'Total charges for the visit'),
  f(48, 'Total Adjustments', 'NM', 'O', 'N', 'Total adjustments for the visit'),
  f(49, 'Total Payments', 'NM', 'O', 'N', 'Total payments for the visit'),
  f(50, 'Alternate Visit ID', 'CX', 'O', 'N', 'Alternate identifier for the visit'),
  f(51, 'Visit Indicator', 'IS', 'O', 'N', 'Whether this PV1 represents the visit-level or account-level data'),
  f(52, 'Other Healthcare Provider', 'XCN', 'O', 'Y', 'Other healthcare providers (deprecated in v2.4)'),
];

// =============================================================================
// PV2 — Patient Visit Additional Information
// =============================================================================
const PV2 = [
  f(1, 'Prior Pending Location', 'PL', 'O', 'N', 'Previous pending patient location'),
  f(2, 'Accommodation Code', 'CE', 'O', 'N', 'Type of accommodation (private, semi-private, ward)'),
  f(3, 'Admit Reason', 'CE', 'O', 'N', 'Reason for admission'),
  f(4, 'Transfer Reason', 'CE', 'O', 'N', 'Reason for transfer'),
  f(5, 'Patient Valuables', 'ST', 'O', 'Y', 'Patient valuables stored'),
  f(6, 'Patient Valuables Location', 'ST', 'O', 'N', 'Location of stored valuables'),
  f(7, 'Visit User Code', 'IS', 'O', 'Y', 'User-defined visit code'),
  f(8, 'Expected Admit Date/Time', 'TS', 'O', 'N', 'Expected date/time of admission'),
  f(9, 'Expected Discharge Date/Time', 'TS', 'O', 'N', 'Expected date/time of discharge'),
  f(10, 'Estimated Length of Inpatient Stay', 'NM', 'O', 'N', 'Estimated length of stay in days'),
  f(11, 'Actual Length of Inpatient Stay', 'NM', 'O', 'N', 'Actual length of stay in days'),
  f(12, 'Visit Description', 'ST', 'O', 'N', 'Free-text description of the visit'),
  f(13, 'Referral Source Code', 'XCN', 'O', 'Y', 'Referral source for the visit'),
  f(14, 'Previous Service Date', 'DT', 'O', 'N', 'Date of previous service'),
  f(15, 'Employment Illness Related Indicator', 'ID', 'O', 'N', 'Whether visit is related to employment illness'),
  f(16, 'Purge Status Code', 'IS', 'O', 'N', 'Purge status of the visit record'),
  f(17, 'Purge Status Date', 'DT', 'O', 'N', 'Date of purge status'),
  f(18, 'Special Program Code', 'IS', 'O', 'N', 'Special program code (e.g., Child Health, EPSDT)'),
  f(19, 'Retention Indicator', 'ID', 'O', 'N', 'Whether to retain the visit record'),
  f(20, 'Expected Number of Insurance Plans', 'NM', 'O', 'N', 'Expected number of insurance plans'),
  f(21, 'Visit Publicity Code', 'IS', 'O', 'N', 'Publicity code for the visit'),
  f(22, 'Visit Protection Indicator', 'ID', 'O', 'N', 'Protection indicator for the visit'),
  f(23, 'Clinic Organization Name', 'XON', 'O', 'Y', 'Name of clinic organization'),
  f(24, 'Patient Status Code', 'IS', 'O', 'N', 'Patient status at time of visit'),
  f(25, 'Visit Priority Code', 'IS', 'O', 'N', 'Priority of the visit'),
  f(26, 'Previous Treatment Date', 'DT', 'O', 'N', 'Date of previous treatment'),
  f(27, 'Expected Discharge Disposition', 'IS', 'O', 'N', 'Expected discharge disposition'),
  f(28, 'Signature on File Date', 'DT', 'O', 'N', 'Date patient signed consent'),
  f(29, 'First Similar Illness Date', 'DT', 'O', 'N', 'Date of first similar illness'),
  f(30, 'Patient Charge Adjustment Code', 'CE', 'O', 'N', 'Charge adjustment code for the patient'),
  f(31, 'Recurring Service Code', 'IS', 'O', 'N', 'Whether this is a recurring service'),
  f(32, 'Billing Media Code', 'ID', 'O', 'N', 'Billing media code'),
  f(33, 'Expected Surgery Date & Time', 'TS', 'O', 'N', 'Expected surgery date and time'),
  f(34, 'Military Partnership Code', 'ID', 'O', 'N', 'Military partnership code'),
  f(35, 'Military Non-Availability Code', 'ID', 'O', 'N', 'Military non-availability code'),
  f(36, 'Newborn Baby Indicator', 'ID', 'O', 'N', 'Whether patient is a newborn'),
  f(37, 'Baby Detained Indicator', 'ID', 'O', 'N', 'Whether baby is detained'),
  f(38, 'Mode of Arrival Code', 'CE', 'O', 'N', 'How patient arrived (ambulance, walk-in, etc.)'),
  f(39, 'Recreational Drug Use Code', 'CE', 'O', 'Y', 'Recreational drug use codes'),
  f(40, 'Admission Level of Care Code', 'CE', 'O', 'N', 'Admission level of care'),
  f(41, 'Precaution Code', 'CE', 'O', 'Y', 'Precaution codes (isolation, fall risk, etc.)'),
  f(42, 'Patient Condition Code', 'CE', 'O', 'N', 'Patient condition code'),
  f(43, 'Living Will Code', 'IS', 'O', 'N', 'Living will code'),
  f(44, 'Organ Donor Code', 'IS', 'O', 'N', 'Organ donor code'),
  f(45, 'Advance Directive Code', 'CE', 'O', 'Y', 'Advance directive codes'),
  f(46, 'Patient Status Effective Date', 'DT', 'O', 'N', 'Date patient status became effective'),
  f(47, 'Expected LOA Return Date/Time', 'TS', 'O', 'N', 'Expected return date from leave of absence'),
  f(48, 'Expected Pre-admission Testing Date/Time', 'TS', 'O', 'N', 'Expected preadmission testing date'),
  f(49, 'Notify Clergy Code', 'IS', 'O', 'Y', 'Whether to notify clergy'),
];

// =============================================================================
// IN1 — Insurance
// =============================================================================
const IN1 = [
  f(1, 'Set ID - IN1', 'SI', 'R', 'N', 'Sequence number for multiple IN1 segments'),
  f(2, 'Insurance Plan ID', 'CE', 'R', 'N', 'Identifier for the insurance plan'),
  f(3, 'Insurance Company ID', 'CX', 'R', 'Y', 'Identifier(s) of the insurance company'),
  f(4, 'Insurance Company Name', 'XON', 'O', 'Y', 'Name of the insurance company'),
  f(5, 'Insurance Company Address', 'XAD', 'O', 'Y', 'Address of the insurance company'),
  f(6, 'Insurance Co Contact Person', 'XPN', 'O', 'Y', 'Contact person at the insurance company'),
  f(7, 'Insurance Co Phone Number', 'XTN', 'O', 'Y', 'Phone number(s) of the insurance company'),
  f(8, 'Group Number', 'ST', 'O', 'N', 'Insurance group number'),
  f(9, 'Group Name', 'XON', 'O', 'Y', 'Insurance group name'),
  f(10, 'Insured\'s Group Emp ID', 'CX', 'O', 'Y', 'Insured\'s group employer ID'),
  f(11, 'Insured\'s Group Emp Name', 'XON', 'O', 'Y', 'Insured\'s group employer name'),
  f(12, 'Plan Effective Date', 'DT', 'O', 'N', 'Date insurance plan became effective'),
  f(13, 'Plan Expiration Date', 'DT', 'O', 'N', 'Date insurance plan expires'),
  f(14, 'Authorization Information', 'AUI', 'O', 'N', 'Authorization information for the plan'),
  f(15, 'Plan Type', 'IS', 'O', 'N', 'Type of insurance plan'),
  f(16, 'Name of Insured', 'XPN', 'O', 'Y', 'Name of the insured person'),
  f(17, 'Insured\'s Relationship to Patient', 'CE', 'O', 'N', 'Relationship of insured to patient'),
  f(18, 'Insured\'s Date of Birth', 'TS', 'O', 'N', 'Date of birth of the insured'),
  f(19, 'Insured\'s Address', 'XAD', 'O', 'Y', 'Address of the insured'),
  f(20, 'Assignment of Benefits', 'IS', 'O', 'N', 'Whether benefits are assigned to the provider'),
  f(21, 'Coordination of Benefits', 'IS', 'O', 'N', 'Coordination of benefits priority'),
  f(22, 'Coord of Ben. Priority', 'ST', 'O', 'N', 'Coordination of benefits priority sequence'),
  f(23, 'Notice of Admission Flag', 'ID', 'O', 'N', 'Whether notice of admission is required'),
  f(24, 'Notice of Admission Date', 'DT', 'O', 'N', 'Date notice of admission was given'),
  f(25, 'Report of Eligibility Flag', 'ID', 'O', 'N', 'Whether eligibility report is on file'),
  f(26, 'Report of Eligibility Date', 'DT', 'O', 'N', 'Date of eligibility report'),
  f(27, 'Release Information Code', 'IS', 'O', 'N', 'Whether release of information is on file'),
  f(28, 'Pre-Admit Cert (PAC)', 'ST', 'O', 'N', 'Pre-admission certification number'),
  f(29, 'Verification Date/Time', 'TS', 'O', 'N', 'Date/time insurance was verified'),
  f(30, 'Verification By', 'XCN', 'O', 'Y', 'Person who verified the insurance'),
  f(31, 'Type of Agreement Code', 'IS', 'O', 'N', 'Type of agreement (standard, unified, maternity)'),
  f(32, 'Billing Status', 'IS', 'O', 'N', 'Billing status of the insurance'),
  f(33, 'Lifetime Reserve Days', 'NM', 'O', 'N', 'Number of lifetime reserve days remaining'),
  f(34, 'Delay Before L.R. Day', 'NM', 'O', 'N', 'Number of days before lifetime reserve days begin'),
  f(35, 'Company Plan Code', 'IS', 'O', 'N', 'Company-specific plan code'),
  f(36, 'Policy Number', 'ST', 'O', 'N', 'Insurance policy number'),
  f(37, 'Policy Deductible', 'CP', 'O', 'N', 'Policy deductible amount'),
  f(38, 'Policy Limit - Amount', 'CP', 'O', 'N', 'Policy limit amount (deprecated — use IN2-29)'),
  f(39, 'Policy Limit - Days', 'NM', 'O', 'N', 'Policy limit in days'),
  f(40, 'Room Rate - Semi-Private', 'CP', 'O', 'N', 'Semi-private room rate (deprecated — use IN2-28)'),
  f(41, 'Room Rate - Private', 'CP', 'O', 'N', 'Private room rate (deprecated — use IN2-28)'),
  f(42, 'Insured\'s Employment Status', 'CE', 'O', 'N', 'Employment status of the insured'),
  f(43, 'Insured\'s Administrative Sex', 'IS', 'O', 'N', 'Administrative sex of the insured'),
  f(44, 'Insured\'s Employer\'s Address', 'XAD', 'O', 'Y', 'Employer address of the insured'),
  f(45, 'Verification Status', 'ST', 'O', 'N', 'Status of insurance verification'),
  f(46, 'Prior Insurance Plan ID', 'IS', 'O', 'N', 'Prior insurance plan identifier'),
  f(47, 'Coverage Type', 'IS', 'O', 'N', 'Type of coverage'),
  f(48, 'Handicap', 'IS', 'O', 'N', 'Handicap indicator'),
  f(49, 'Insured\'s ID Number', 'CX', 'O', 'Y', 'Identifier(s) of the insured'),
  f(50, 'Signature Code', 'IS', 'O', 'N', 'Type of signature on file'),
  f(51, 'Signature Code Date', 'DT', 'O', 'N', 'Date signature was obtained'),
  f(52, 'Insured\'s Birth Place', 'ST', 'O', 'N', 'Birth place of the insured'),
  f(53, 'VIP Indicator', 'IS', 'O', 'N', 'VIP indicator for the insured'),
];

// =============================================================================
// GT1 — Guarantor
// =============================================================================
const GT1 = [
  f(1, 'Set ID - GT1', 'SI', 'R', 'N', 'Sequence number for multiple GT1 segments'),
  f(2, 'Guarantor Number', 'CX', 'O', 'Y', 'Identifier(s) for the guarantor'),
  f(3, 'Guarantor Name', 'XPN', 'R', 'Y', 'Name(s) of the guarantor'),
  f(4, 'Guarantor Spouse Name', 'XPN', 'O', 'Y', 'Spouse name of the guarantor'),
  f(5, 'Guarantor Address', 'XAD', 'O', 'Y', 'Address of the guarantor'),
  f(6, 'Guarantor Ph Num - Home', 'XTN', 'O', 'Y', 'Home phone number(s) of the guarantor'),
  f(7, 'Guarantor Ph Num - Business', 'XTN', 'O', 'Y', 'Business phone number(s) of the guarantor'),
  f(8, 'Guarantor Date/Time of Birth', 'TS', 'O', 'N', 'Date of birth of the guarantor'),
  f(9, 'Guarantor Administrative Sex', 'IS', 'O', 'N', 'Administrative sex of the guarantor'),
  f(10, 'Guarantor Type', 'IS', 'O', 'N', 'Type of guarantor'),
  f(11, 'Guarantor Relationship', 'CE', 'O', 'N', 'Relationship of guarantor to patient'),
  f(12, 'Guarantor SSN', 'ST', 'O', 'N', 'Social Security Number of the guarantor'),
  f(13, 'Guarantor Date - Begin', 'DT', 'O', 'N', 'Start date of guarantor responsibility'),
  f(14, 'Guarantor Date - End', 'DT', 'O', 'N', 'End date of guarantor responsibility'),
  f(15, 'Guarantor Priority', 'NM', 'O', 'N', 'Priority of the guarantor'),
  f(16, 'Guarantor Employer Name', 'XPN', 'O', 'Y', 'Employer name of the guarantor'),
  f(17, 'Guarantor Employer Address', 'XAD', 'O', 'Y', 'Employer address of the guarantor'),
  f(18, 'Guarantor Employer Phone Number', 'XTN', 'O', 'Y', 'Employer phone number of the guarantor'),
  f(19, 'Guarantor Employee ID Number', 'CX', 'O', 'Y', 'Employee ID of the guarantor'),
  f(20, 'Guarantor Employment Status', 'IS', 'O', 'N', 'Employment status of the guarantor'),
  f(21, 'Guarantor Organization Name', 'XON', 'O', 'Y', 'Organization name of the guarantor'),
  f(22, 'Guarantor Billing Hold Flag', 'ID', 'O', 'N', 'Whether billing is on hold for the guarantor'),
  f(23, 'Guarantor Credit Rating Code', 'CE', 'O', 'N', 'Credit rating of the guarantor'),
  f(24, 'Guarantor Death Date and Time', 'TS', 'O', 'N', 'Date and time of guarantor death'),
  f(25, 'Guarantor Death Flag', 'ID', 'O', 'N', 'Whether guarantor is deceased'),
  f(26, 'Guarantor Charge Adjustment Code', 'CE', 'O', 'N', 'Charge adjustment code for the guarantor'),
  f(27, 'Guarantor Household Annual Income', 'CP', 'O', 'N', 'Household annual income'),
  f(28, 'Guarantor Household Size', 'NM', 'O', 'N', 'Number of people in household'),
  f(29, 'Guarantor Employer ID Number', 'CX', 'O', 'Y', 'Employer identifier of the guarantor'),
  f(30, 'Guarantor Marital Status Code', 'CE', 'O', 'N', 'Marital status of the guarantor'),
  f(31, 'Guarantor Hire Effective Date', 'DT', 'O', 'N', 'Date guarantor was hired'),
  f(32, 'Employment Stop Date', 'DT', 'O', 'N', 'Date employment ended'),
  f(33, 'Living Dependency', 'IS', 'O', 'N', 'Living dependency of the guarantor'),
  f(34, 'Ambulatory Status', 'IS', 'O', 'Y', 'Ambulatory status of the guarantor'),
  f(35, 'Citizenship', 'CE', 'O', 'Y', 'Citizenship of the guarantor'),
  f(36, 'Primary Language', 'CE', 'O', 'N', 'Primary language of the guarantor'),
  f(37, 'Living Arrangement', 'IS', 'O', 'N', 'Living arrangement of the guarantor'),
  f(38, 'Publicity Code', 'CE', 'O', 'N', 'Publicity code for the guarantor'),
  f(39, 'Protection Indicator', 'ID', 'O', 'N', 'Protection indicator for the guarantor'),
  f(40, 'Student Indicator', 'IS', 'O', 'N', 'Student indicator for the guarantor'),
  f(41, 'Religion', 'CE', 'O', 'N', 'Religion of the guarantor'),
  f(42, 'Mother\'s Maiden Name', 'XPN', 'O', 'Y', 'Mother\'s maiden name of the guarantor'),
  f(43, 'Nationality', 'CE', 'O', 'N', 'Nationality of the guarantor'),
  f(44, 'Ethnic Group', 'CE', 'O', 'Y', 'Ethnic group of the guarantor'),
  f(45, 'Contact Person\'s Name', 'XPN', 'O', 'Y', 'Contact person for the guarantor'),
  f(46, 'Contact Person\'s Telephone Number', 'XTN', 'O', 'Y', 'Phone number of contact person'),
  f(47, 'Contact Reason', 'CE', 'O', 'N', 'Reason for contacting'),
  f(48, 'Contact Relationship', 'IS', 'O', 'N', 'Relationship of contact person'),
  f(49, 'Job Title', 'ST', 'O', 'N', 'Job title of the guarantor'),
  f(50, 'Job Code/Class', 'JCC', 'O', 'N', 'Job code and class of the guarantor'),
  f(51, 'Guarantor Employer\'s Organization Name', 'XON', 'O', 'Y', 'Organization name of employer'),
  f(52, 'Handicap', 'IS', 'O', 'N', 'Handicap indicator for the guarantor'),
  f(53, 'Job Status', 'IS', 'O', 'N', 'Job status of the guarantor'),
  f(54, 'Guarantor Financial Class', 'FC', 'O', 'N', 'Financial class of the guarantor'),
  f(55, 'Guarantor Race', 'CE', 'O', 'Y', 'Race of the guarantor'),
];

// =============================================================================
// DG1 — Diagnosis
// =============================================================================
const DG1 = [
  f(1, 'Set ID - DG1', 'SI', 'R', 'N', 'Sequence number for multiple DG1 segments'),
  f(2, 'Diagnosis Coding Method', 'ID', 'O', 'N', 'Coding method used (deprecated in v2.3)'),
  f(3, 'Diagnosis Code - DG1', 'CE', 'O', 'N', 'Diagnosis code (ICD-9, ICD-10, etc.)'),
  f(4, 'Diagnosis Description', 'ST', 'O', 'N', 'Free-text diagnosis description (deprecated — use DG1-3)'),
  f(5, 'Diagnosis Date/Time', 'TS', 'O', 'N', 'Date/time the diagnosis was made'),
  f(6, 'Diagnosis Type', 'IS', 'R', 'N', 'Type of diagnosis (A=Admitting, F=Final, W=Working)'),
  f(7, 'Major Diagnostic Category', 'CE', 'O', 'N', 'Major diagnostic category (DRG)'),
  f(8, 'Diagnostic Related Group', 'CE', 'O', 'N', 'DRG for the diagnosis'),
  f(9, 'DRG Approval Indicator', 'ID', 'O', 'N', 'Whether DRG approval was obtained'),
  f(10, 'DRG Grouper Review Code', 'IS', 'O', 'N', 'DRG grouper review code'),
  f(11, 'Outlier Type', 'CE', 'O', 'N', 'Type of outlier (cost, day)'),
  f(12, 'Outlier Days', 'NM', 'O', 'N', 'Number of outlier days'),
  f(13, 'Outlier Cost', 'CP', 'O', 'N', 'Outlier cost amount'),
  f(14, 'Grouper Version and Type', 'ST', 'O', 'N', 'DRG grouper version and type'),
  f(15, 'Diagnosis Priority', 'ID', 'O', 'N', 'Priority ranking of the diagnosis (1=primary)'),
  f(16, 'Diagnosing Clinician', 'XCN', 'O', 'Y', 'Clinician who made the diagnosis'),
  f(17, 'Diagnosis Classification', 'IS', 'O', 'N', 'Classification of the diagnosis'),
  f(18, 'Confidential Indicator', 'ID', 'O', 'N', 'Whether diagnosis is confidential'),
  f(19, 'Attestation Date/Time', 'TS', 'O', 'N', 'Date/time the diagnosis was attested'),
  f(20, 'Diagnosis Identifier', 'EI', 'O', 'N', 'Unique identifier for this diagnosis'),
  f(21, 'Diagnosis Action Code', 'ID', 'O', 'N', 'Action to take (A=Add, D=Delete, U=Update)'),
];

// =============================================================================
// ORC — Common Order
// =============================================================================
const ORC = [
  f(1, 'Order Control', 'ID', 'R', 'N', 'Order control code (NW=New, CA=Cancel, SC=Status Changed, etc.)'),
  f(2, 'Placer Order Number', 'EI', 'O', 'N', 'Order number assigned by the placer/requester'),
  f(3, 'Filler Order Number', 'EI', 'O', 'N', 'Order number assigned by the filler/performer'),
  f(4, 'Placer Group Number', 'EI', 'O', 'N', 'Group number for a set of related placer orders'),
  f(5, 'Order Status', 'ID', 'O', 'N', 'Status of the order (A=Some but not all, CA=Canceled, CM=Completed, etc.)'),
  f(6, 'Response Flag', 'ID', 'O', 'N', 'Level of detail in response'),
  f(7, 'Quantity/Timing', 'TQ', 'O', 'Y', 'Quantity and timing of the order (deprecated — use TQ1/TQ2)'),
  f(8, 'Parent', 'EIP', 'O', 'N', 'Parent order identifier for child orders'),
  f(9, 'Date/Time of Transaction', 'TS', 'O', 'N', 'Date/time the order transaction occurred'),
  f(10, 'Entered By', 'XCN', 'O', 'Y', 'Person who entered the order'),
  f(11, 'Verified By', 'XCN', 'O', 'Y', 'Person who verified the order'),
  f(12, 'Ordering Provider', 'XCN', 'O', 'Y', 'Provider who placed the order'),
  f(13, 'Enterer\'s Location', 'PL', 'O', 'N', 'Location of the person who entered the order'),
  f(14, 'Call Back Phone Number', 'XTN', 'O', 'Y', 'Callback phone number for order questions'),
  f(15, 'Order Effective Date/Time', 'TS', 'O', 'N', 'Date/time the order becomes effective'),
  f(16, 'Order Control Code Reason', 'CE', 'O', 'N', 'Reason for the order control action'),
  f(17, 'Entering Organization', 'CE', 'O', 'N', 'Organization where the order was entered'),
  f(18, 'Entering Device', 'CE', 'O', 'N', 'Device used to enter the order'),
  f(19, 'Action By', 'XCN', 'O', 'Y', 'Person who performed the action'),
  f(20, 'Advanced Beneficiary Notice Code', 'CE', 'O', 'N', 'ABN code for Medicare coverage determination'),
  f(21, 'Ordering Facility Name', 'XON', 'O', 'Y', 'Name of the facility placing the order'),
  f(22, 'Ordering Facility Address', 'XAD', 'O', 'Y', 'Address of the facility placing the order'),
  f(23, 'Ordering Facility Phone Number', 'XTN', 'O', 'Y', 'Phone number of the ordering facility'),
  f(24, 'Ordering Provider Address', 'XAD', 'O', 'Y', 'Address of the ordering provider'),
  f(25, 'Order Status Modifier', 'CWE', 'O', 'N', 'Additional information about the order status'),
  f(26, 'Advanced Beneficiary Notice Override Reason', 'CWE', 'O', 'N', 'Reason for ABN override'),
  f(27, 'Filler\'s Expected Availability Date/Time', 'TS', 'O', 'N', 'Date/time filler expects to have results'),
  f(28, 'Confidentiality Code', 'CWE', 'O', 'N', 'Confidentiality level of the order'),
  f(29, 'Order Type', 'CWE', 'O', 'N', 'Whether order is inpatient or outpatient'),
  f(30, 'Enterer Authorization Mode', 'CNE', 'O', 'N', 'How the order entry was authorized'),
  f(31, 'Parent Universal Service Identifier', 'CWE', 'O', 'N', 'Universal service ID of the parent order'),
];

// =============================================================================
// OBR — Observation Request
// =============================================================================
const OBR = [
  f(1, 'Set ID - OBR', 'SI', 'O', 'N', 'Sequence number for multiple OBR segments'),
  f(2, 'Placer Order Number', 'EI', 'O', 'N', 'Order number assigned by the placer'),
  f(3, 'Filler Order Number', 'EI', 'O', 'N', 'Order number assigned by the filler'),
  f(4, 'Universal Service Identifier', 'CE', 'R', 'N', 'Identifier for the test/procedure ordered (e.g., LOINC code)'),
  f(5, 'Priority - OBR', 'ID', 'O', 'N', 'Priority of the observation request (deprecated)'),
  f(6, 'Requested Date/Time', 'TS', 'O', 'N', 'Requested date/time for the observation (deprecated)'),
  f(7, 'Observation Date/Time', 'TS', 'O', 'N', 'Date/time the observation was started or specimen collected'),
  f(8, 'Observation End Date/Time', 'TS', 'O', 'N', 'Date/time the observation ended'),
  f(9, 'Collection Volume', 'CQ', 'O', 'N', 'Volume of specimen collected'),
  f(10, 'Collector Identifier', 'XCN', 'O', 'Y', 'Person who collected the specimen'),
  f(11, 'Specimen Action Code', 'ID', 'O', 'N', 'Action to take on the specimen (A=Add, G=Generated, L=Lab, etc.)'),
  f(12, 'Danger Code', 'CE', 'O', 'N', 'Code indicating danger associated with the specimen'),
  f(13, 'Relevant Clinical Information', 'ST', 'O', 'N', 'Relevant clinical information for interpretation'),
  f(14, 'Specimen Received Date/Time', 'TS', 'O', 'N', 'Date/time the specimen was received by the lab'),
  f(15, 'Specimen Source', 'SPS', 'O', 'N', 'Source of the specimen (deprecated — use SPM segment)'),
  f(16, 'Ordering Provider', 'XCN', 'O', 'Y', 'Provider who ordered the observation'),
  f(17, 'Order Callback Phone Number', 'XTN', 'O', 'Y', 'Callback phone number for results'),
  f(18, 'Placer Field 1', 'ST', 'O', 'N', 'Placer-defined field 1'),
  f(19, 'Placer Field 2', 'ST', 'O', 'N', 'Placer-defined field 2'),
  f(20, 'Filler Field 1', 'ST', 'O', 'N', 'Filler-defined field 1'),
  f(21, 'Filler Field 2', 'ST', 'O', 'N', 'Filler-defined field 2'),
  f(22, 'Results Rpt/Status Chng - Date/Time', 'TS', 'O', 'N', 'Date/time results were reported or status changed'),
  f(23, 'Charge to Practice', 'MOC', 'O', 'N', 'Charge to practice for the observation'),
  f(24, 'Diagnostic Serv Sect ID', 'ID', 'O', 'N', 'Diagnostic service section (e.g., HM=Hematology, CH=Chemistry)'),
  f(25, 'Result Status', 'ID', 'O', 'N', 'Status of results (F=Final, P=Preliminary, C=Corrected, X=Canceled)'),
  f(26, 'Parent Result', 'PRL', 'O', 'N', 'Link to parent result for reflex/cascade orders'),
  f(27, 'Quantity/Timing', 'TQ', 'O', 'Y', 'Quantity and timing (deprecated — use TQ1/TQ2)'),
  f(28, 'Result Copies To', 'XCN', 'O', 'Y', 'Providers who should receive copies of results'),
  f(29, 'Parent', 'EIP', 'O', 'N', 'Parent order identifier'),
  f(30, 'Transportation Mode', 'ID', 'O', 'N', 'How the specimen was transported'),
  f(31, 'Reason for Study', 'CE', 'O', 'Y', 'Reason the study was ordered'),
  f(32, 'Principal Result Interpreter', 'NDL', 'O', 'N', 'Principal interpreter of the results'),
  f(33, 'Assistant Result Interpreter', 'NDL', 'O', 'Y', 'Assistant interpreter(s) of the results'),
  f(34, 'Technician', 'NDL', 'O', 'Y', 'Technician(s) who performed the observation'),
  f(35, 'Transcriptionist', 'NDL', 'O', 'Y', 'Transcriptionist(s) who transcribed the results'),
  f(36, 'Scheduled Date/Time', 'TS', 'O', 'N', 'Date/time the observation is scheduled'),
  f(37, 'Number of Sample Containers', 'NM', 'O', 'N', 'Number of sample containers'),
  f(38, 'Transport Logistics of Collected Sample', 'CE', 'O', 'Y', 'Transport logistics information'),
  f(39, 'Collector\'s Comment', 'CE', 'O', 'Y', 'Comments from the specimen collector'),
  f(40, 'Transport Arrangement Responsibility', 'CE', 'O', 'N', 'Who is responsible for transport'),
  f(41, 'Transport Arranged', 'ID', 'O', 'N', 'Whether transport has been arranged'),
  f(42, 'Escort Required', 'ID', 'O', 'N', 'Whether an escort is required'),
  f(43, 'Planned Patient Transport Comment', 'CE', 'O', 'Y', 'Comments about planned patient transport'),
  f(44, 'Procedure Code', 'CE', 'O', 'N', 'CPT/procedure code'),
  f(45, 'Procedure Code Modifier', 'CE', 'O', 'Y', 'Modifier(s) for the procedure code'),
  f(46, 'Placer Supplemental Service Information', 'CE', 'O', 'Y', 'Supplemental service information from placer'),
  f(47, 'Filler Supplemental Service Information', 'CE', 'O', 'Y', 'Supplemental service information from filler'),
  f(48, 'Medically Necessary Duplicate Procedure Reason', 'CWE', 'O', 'N', 'Reason for medically necessary duplicate'),
  f(49, 'Result Handling', 'IS', 'O', 'N', 'How results should be handled'),
];

// =============================================================================
// OBX — Observation/Result
// =============================================================================
const OBX = [
  f(1, 'Set ID - OBX', 'SI', 'O', 'N', 'Sequence number for multiple OBX segments'),
  f(2, 'Value Type', 'ID', 'O', 'N', 'Data type of the observation value (NM, ST, CE, TX, FT, CWE, etc.)'),
  f(3, 'Observation Identifier', 'CE', 'R', 'N', 'Identifier for the observation (e.g., LOINC code)'),
  f(4, 'Observation Sub-ID', 'ST', 'O', 'N', 'Sub-identifier to distinguish multiple OBX with same OBX-3'),
  f(5, 'Observation Value', 'VARIES', 'O', 'Y', 'Actual value of the observation (type determined by OBX-2)'),
  f(6, 'Units', 'CE', 'O', 'N', 'Units of measurement for the observation value'),
  f(7, 'References Range', 'ST', 'O', 'N', 'Normal reference range for the observation'),
  f(8, 'Abnormal Flags', 'IS', 'O', 'Y', 'Abnormality flags (H=High, L=Low, A=Abnormal, N=Normal, etc.)'),
  f(9, 'Probability', 'NM', 'O', 'N', 'Probability of the observation being true (0-1)'),
  f(10, 'Nature of Abnormal Test', 'ID', 'O', 'Y', 'Nature of the abnormal test (A=Age-based, S=Sex-based, R=Race-based)'),
  f(11, 'Observation Result Status', 'ID', 'R', 'N', 'Status of the result (F=Final, P=Preliminary, C=Corrected, D=Delete, X=Cannot obtain)'),
  f(12, 'Effective Date of Reference Range', 'TS', 'O', 'N', 'Date the reference range became effective'),
  f(13, 'User Defined Access Checks', 'ST', 'O', 'N', 'User-defined access checks'),
  f(14, 'Date/Time of the Observation', 'TS', 'O', 'N', 'Date/time the observation was made'),
  f(15, 'Producer\'s ID', 'CE', 'O', 'N', 'Identifier of the observation producer (lab, device, etc.)'),
  f(16, 'Responsible Observer', 'XCN', 'O', 'Y', 'Person responsible for the observation'),
  f(17, 'Observation Method', 'CE', 'O', 'Y', 'Method used to produce the observation'),
  f(18, 'Equipment Instance Identifier', 'EI', 'O', 'Y', 'Identifier of the equipment that produced the result'),
  f(19, 'Date/Time of the Analysis', 'TS', 'O', 'N', 'Date/time the analysis was performed'),
  f(20, 'Observation Site', 'CWE', 'O', 'Y', 'Body site of the observation'),
  f(21, 'Observation Instance Identifier', 'EI', 'O', 'N', 'Unique identifier for this observation instance'),
  f(22, 'Mood Code', 'CNE', 'O', 'N', 'Mood of the observation (EVN=Event, GOL=Goal, INT=Intent)'),
  f(23, 'Performing Organization Name', 'XON', 'O', 'N', 'Name of the performing organization'),
  f(24, 'Performing Organization Address', 'XAD', 'O', 'N', 'Address of the performing organization'),
  f(25, 'Performing Organization Medical Director', 'XCN', 'O', 'N', 'Medical director of the performing organization'),
];

// =============================================================================
// AL1 — Patient Allergy Information
// =============================================================================
const AL1 = [
  f(1, 'Set ID - AL1', 'SI', 'R', 'N', 'Sequence number for multiple AL1 segments'),
  f(2, 'Allergen Type Code', 'CE', 'O', 'N', 'Type of allergen (DA=Drug Allergy, FA=Food Allergy, MA=Misc Allergy, MC=Misc Contraindication, EA=Environmental Allergy, AA=Animal Allergy, PA=Plant Allergy, LA=Pollen Allergy)'),
  f(3, 'Allergen Code/Mnemonic/Description', 'CE', 'R', 'N', 'Code or description of the allergen'),
  f(4, 'Allergy Severity Code', 'CE', 'O', 'N', 'Severity of the allergy (SV=Severe, MO=Moderate, MI=Mild, U=Unknown)'),
  f(5, 'Allergy Reaction Code', 'ST', 'O', 'Y', 'Reaction(s) to the allergen (e.g., hives, anaphylaxis)'),
  f(6, 'Identification Date', 'DT', 'O', 'N', 'Date allergy was identified'),
];

// =============================================================================
// SCH — Scheduling Activity Information
// =============================================================================
const SCH = [
  f(1, 'Placer Appointment ID', 'EI', 'O', 'N', 'Appointment identifier assigned by the placer'),
  f(2, 'Filler Appointment ID', 'EI', 'O', 'N', 'Appointment identifier assigned by the filler'),
  f(3, 'Occurrence Number', 'NM', 'O', 'N', 'Occurrence number of a recurring appointment'),
  f(4, 'Placer Group Number', 'EI', 'O', 'N', 'Group number for related appointments'),
  f(5, 'Schedule ID', 'CE', 'O', 'N', 'Identifier for the schedule'),
  f(6, 'Event Reason', 'CE', 'R', 'N', 'Reason for the scheduling event'),
  f(7, 'Appointment Reason', 'CE', 'O', 'N', 'Reason for the appointment'),
  f(8, 'Appointment Type', 'CE', 'O', 'N', 'Type of appointment (Normal, Tentative, Complete)'),
  f(9, 'Appointment Duration', 'NM', 'O', 'N', 'Duration of the appointment'),
  f(10, 'Appointment Duration Units', 'CE', 'O', 'N', 'Units for appointment duration (min, hr)'),
  f(11, 'Appointment Timing Quantity', 'TQ', 'O', 'Y', 'Timing/quantity for the appointment (deprecated — use TQ1/TQ2)'),
  f(12, 'Placer Contact Person', 'XCN', 'O', 'Y', 'Contact person from the placer'),
  f(13, 'Placer Contact Phone Number', 'XTN', 'O', 'N', 'Phone number for the placer contact'),
  f(14, 'Placer Contact Address', 'XAD', 'O', 'Y', 'Address of the placer contact'),
  f(15, 'Placer Contact Location', 'PL', 'O', 'N', 'Location of the placer contact'),
  f(16, 'Filler Contact Person', 'XCN', 'O', 'Y', 'Contact person from the filler'),
  f(17, 'Filler Contact Phone Number', 'XTN', 'O', 'N', 'Phone number for the filler contact'),
  f(18, 'Filler Contact Address', 'XAD', 'O', 'Y', 'Address of the filler contact'),
  f(19, 'Filler Contact Location', 'PL', 'O', 'N', 'Location of the filler contact'),
  f(20, 'Entered By Person', 'XCN', 'O', 'Y', 'Person who entered the scheduling information'),
  f(21, 'Entered By Phone Number', 'XTN', 'O', 'Y', 'Phone number of the person who entered the schedule'),
  f(22, 'Entered By Location', 'PL', 'O', 'N', 'Location where the schedule was entered'),
  f(23, 'Parent Placer Appointment ID', 'EI', 'O', 'N', 'Parent appointment ID from the placer'),
  f(24, 'Parent Filler Appointment ID', 'EI', 'O', 'N', 'Parent appointment ID from the filler'),
  f(25, 'Filler Status Code', 'CE', 'O', 'N', 'Status of the appointment as determined by the filler'),
  f(26, 'Placer Order Number', 'EI', 'O', 'Y', 'Placer order number for the appointment'),
  f(27, 'Filler Order Number', 'EI', 'O', 'Y', 'Filler order number for the appointment'),
];

// =============================================================================
// NTE — Notes and Comments
// =============================================================================
const NTE = [
  f(1, 'Set ID - NTE', 'SI', 'O', 'N', 'Sequence number for multiple NTE segments'),
  f(2, 'Source of Comment', 'ID', 'O', 'N', 'Source of the comment (L=Filler/Lab, P=Placer/Ordering Provider, O=Other)'),
  f(3, 'Comment', 'FT', 'O', 'Y', 'Free-text comment'),
  f(4, 'Comment Type', 'CE', 'O', 'N', 'Type of comment (PI=Patient Instructions, AI=Ancillary Instructions, GI=General Instructions, RE=Remark, DR=Duplicate/Interaction Reason)'),
  f(5, 'Entered By', 'XCN', 'O', 'N', 'Person who entered the comment'),
];

// =============================================================================
// FT1 — Financial Transaction
// =============================================================================
const FT1 = [
  f(1, 'Set ID - FT1', 'SI', 'O', 'N', 'Sequence number for multiple FT1 segments'),
  f(2, 'Transaction ID', 'ST', 'O', 'N', 'Unique identifier for this transaction'),
  f(3, 'Transaction Batch ID', 'ST', 'O', 'N', 'Identifier for the transaction batch'),
  f(4, 'Transaction Date', 'DR', 'R', 'N', 'Date/time range of the transaction'),
  f(5, 'Transaction Posting Date', 'TS', 'O', 'N', 'Date the transaction was posted'),
  f(6, 'Transaction Type', 'IS', 'R', 'N', 'Type of transaction (CG=Charge, CD=Credit, PY=Payment, AJ=Adjustment)'),
  f(7, 'Transaction Code', 'CE', 'R', 'N', 'Code for the transaction (CPT, HCPCS, etc.)'),
  f(8, 'Transaction Description', 'ST', 'O', 'N', 'Description of the transaction (deprecated — use FT1-7)'),
  f(9, 'Transaction Description - Alt', 'ST', 'O', 'N', 'Alternate description (deprecated)'),
  f(10, 'Transaction Quantity', 'NM', 'O', 'N', 'Quantity of items in the transaction'),
  f(11, 'Transaction Amount - Extended', 'CP', 'O', 'N', 'Extended amount (quantity x unit price)'),
  f(12, 'Transaction Amount - Unit', 'CP', 'O', 'N', 'Unit price of the transaction'),
  f(13, 'Department Code', 'CE', 'O', 'N', 'Department code for the transaction'),
  f(14, 'Insurance Plan ID', 'CE', 'O', 'N', 'Insurance plan identifier'),
  f(15, 'Insurance Amount', 'CP', 'O', 'N', 'Amount covered by insurance'),
  f(16, 'Assigned Patient Location', 'PL', 'O', 'N', 'Patient location when transaction occurred'),
  f(17, 'Fee Schedule', 'IS', 'O', 'N', 'Fee schedule used'),
  f(18, 'Patient Type', 'IS', 'O', 'N', 'Patient type for billing'),
  f(19, 'Diagnosis Code - FT1', 'CE', 'O', 'Y', 'Diagnosis code(s) for the transaction'),
  f(20, 'Performed By Code', 'XCN', 'O', 'Y', 'Provider who performed the service'),
  f(21, 'Ordered By Code', 'XCN', 'O', 'Y', 'Provider who ordered the service'),
  f(22, 'Unit Cost', 'CP', 'O', 'N', 'Unit cost of the service'),
  f(23, 'Filler Order Number', 'EI', 'O', 'N', 'Filler order number'),
  f(24, 'Entered By Code', 'XCN', 'O', 'Y', 'Person who entered the transaction'),
  f(25, 'Procedure Code', 'CE', 'O', 'N', 'Procedure code for the transaction'),
  f(26, 'Procedure Code Modifier', 'CE', 'O', 'Y', 'Modifier(s) for the procedure code'),
  f(27, 'Advanced Beneficiary Notice Code', 'CE', 'O', 'N', 'ABN code'),
  f(28, 'Medically Necessary Duplicate Procedure Reason', 'CWE', 'O', 'N', 'Reason for duplicate procedure'),
  f(29, 'NDC Code', 'CWE', 'O', 'N', 'National Drug Code for the transaction'),
  f(30, 'Payment Reference ID', 'CX', 'O', 'N', 'Reference ID for payment'),
  f(31, 'Transaction Reference Key', 'SI', 'O', 'Y', 'Reference key(s) for the transaction'),
];

// =============================================================================
// PR1 — Procedures
// =============================================================================
const PR1 = [
  f(1, 'Set ID - PR1', 'SI', 'R', 'N', 'Sequence number for multiple PR1 segments'),
  f(2, 'Procedure Coding Method', 'IS', 'O', 'N', 'Coding method used (deprecated)'),
  f(3, 'Procedure Code', 'CE', 'R', 'N', 'Procedure code (ICD-10-PCS, CPT, HCPCS)'),
  f(4, 'Procedure Description', 'ST', 'O', 'N', 'Free-text procedure description (deprecated — use PR1-3)'),
  f(5, 'Procedure Date/Time', 'TS', 'R', 'N', 'Date/time the procedure was performed'),
  f(6, 'Procedure Functional Type', 'IS', 'O', 'N', 'Functional type (A=Anesthesia, P=Procedure, I=Invasive)'),
  f(7, 'Procedure Minutes', 'NM', 'O', 'N', 'Duration of the procedure in minutes'),
  f(8, 'Anesthesiologist', 'XCN', 'O', 'Y', 'Anesthesiologist for the procedure (deprecated)'),
  f(9, 'Anesthesia Code', 'IS', 'O', 'N', 'Type of anesthesia used'),
  f(10, 'Anesthesia Minutes', 'NM', 'O', 'N', 'Duration of anesthesia in minutes'),
  f(11, 'Surgeon', 'XCN', 'O', 'Y', 'Surgeon who performed the procedure (deprecated)'),
  f(12, 'Procedure Practitioner', 'XCN', 'O', 'Y', 'Practitioner(s) involved in the procedure (deprecated)'),
  f(13, 'Consent Code', 'CE', 'O', 'N', 'Code indicating consent status'),
  f(14, 'Procedure Priority', 'ID', 'O', 'N', 'Priority of the procedure (0=Not included, 1=Primary, 2+=Secondary)'),
  f(15, 'Associated Diagnosis Code', 'CE', 'O', 'N', 'Diagnosis code associated with the procedure'),
  f(16, 'Procedure Code Modifier', 'CE', 'O', 'Y', 'Modifier(s) for the procedure code'),
  f(17, 'Procedure DRG Type', 'IS', 'O', 'N', 'DRG type for the procedure'),
  f(18, 'Tissue Type Code', 'CE', 'O', 'Y', 'Tissue type codes for the procedure'),
  f(19, 'Procedure Identifier', 'EI', 'O', 'N', 'Unique identifier for this procedure'),
  f(20, 'Procedure Action Code', 'ID', 'O', 'N', 'Action code (A=Add, D=Delete, U=Update)'),
  f(21, 'DRG Procedure Determination Status', 'IS', 'O', 'N', 'DRG procedure determination status'),
];

// =============================================================================
// RXA — Pharmacy/Treatment Administration
// =============================================================================
const RXA = [
  f(1, 'Give Sub-ID Counter', 'NM', 'R', 'N', 'Sequential counter for administration events'),
  f(2, 'Administration Sub-ID Counter', 'NM', 'R', 'N', 'Sequential counter within an order'),
  f(3, 'Date/Time Start of Administration', 'TS', 'R', 'N', 'Date/time administration started'),
  f(4, 'Date/Time End of Administration', 'TS', 'R', 'N', 'Date/time administration ended'),
  f(5, 'Administered Code', 'CE', 'R', 'N', 'Code for the administered substance (CVX for vaccines, NDC for drugs)'),
  f(6, 'Administered Amount', 'NM', 'R', 'N', 'Amount administered'),
  f(7, 'Administered Units', 'CE', 'O', 'N', 'Units for the administered amount'),
  f(8, 'Administered Dosage Form', 'CE', 'O', 'N', 'Dosage form of the administered substance'),
  f(9, 'Administration Notes', 'CE', 'O', 'Y', 'Notes about the administration'),
  f(10, 'Administering Provider', 'XCN', 'O', 'Y', 'Provider who administered the substance'),
  f(11, 'Administered-at Location', 'LA2', 'O', 'N', 'Location where administration occurred'),
  f(12, 'Administered Per (Time Unit)', 'ST', 'O', 'N', 'Rate per time unit'),
  f(13, 'Administered Strength', 'NM', 'O', 'N', 'Strength of the administered substance'),
  f(14, 'Administered Strength Units', 'CE', 'O', 'N', 'Units for administered strength'),
  f(15, 'Substance Lot Number', 'ST', 'O', 'Y', 'Lot number(s) of the substance'),
  f(16, 'Substance Expiration Date', 'TS', 'O', 'Y', 'Expiration date(s) of the substance'),
  f(17, 'Substance Manufacturer Name', 'CE', 'O', 'Y', 'Manufacturer(s) of the substance'),
  f(18, 'Substance/Treatment Refusal Reason', 'CE', 'O', 'Y', 'Reason for refusal'),
  f(19, 'Indication', 'CE', 'O', 'Y', 'Indication for the administration'),
  f(20, 'Completion Status', 'ID', 'O', 'N', 'Completion status (CP=Complete, RE=Refused, NA=Not Administered, PA=Partially Administered)'),
  f(21, 'Action Code - RXA', 'ID', 'O', 'N', 'Action to take (A=Add, D=Delete, U=Update)'),
  f(22, 'System Entry Date/Time', 'TS', 'O', 'N', 'Date/time the record was entered'),
  f(23, 'Administered Drug Strength Volume', 'NM', 'O', 'N', 'Drug strength volume'),
  f(24, 'Administered Drug Strength Volume Units', 'CWE', 'O', 'N', 'Units for drug strength volume'),
  f(25, 'Administered Barcode Identifier', 'CWE', 'O', 'N', 'Barcode identifier of the administered substance'),
  f(26, 'Pharmacy Order Type', 'ID', 'O', 'N', 'Type of pharmacy order'),
];

// =============================================================================
// RXE — Pharmacy/Treatment Encoded Order
// =============================================================================
const RXE = [
  f(1, 'Quantity/Timing', 'TQ', 'O', 'N', 'Quantity and timing (deprecated — use TQ1/TQ2)'),
  f(2, 'Give Code', 'CE', 'R', 'N', 'Code for the drug/treatment to give'),
  f(3, 'Give Amount - Minimum', 'NM', 'R', 'N', 'Minimum amount to give'),
  f(4, 'Give Amount - Maximum', 'NM', 'O', 'N', 'Maximum amount to give'),
  f(5, 'Give Units', 'CE', 'R', 'N', 'Units for the give amount'),
  f(6, 'Give Dosage Form', 'CE', 'O', 'N', 'Dosage form (tablet, capsule, injection, etc.)'),
  f(7, 'Provider\'s Administration Instructions', 'CE', 'O', 'Y', 'Instructions from provider to person administering'),
  f(8, 'Deliver-To Location', 'LA1', 'O', 'N', 'Location to deliver the medication (deprecated)'),
  f(9, 'Substitution Status', 'ID', 'O', 'N', 'Substitution status (N=No substitute, G=Generic, T=Therapeutic)'),
  f(10, 'Dispense Amount', 'NM', 'O', 'N', 'Amount to dispense'),
  f(11, 'Dispense Units', 'CE', 'O', 'N', 'Units for the dispense amount'),
  f(12, 'Number of Refills', 'NM', 'O', 'N', 'Number of refills authorized'),
  f(13, 'Ordering Provider\'s DEA Number', 'XCN', 'O', 'Y', 'DEA number of the ordering provider'),
  f(14, 'Pharmacist/Treatment Supplier\'s Verifier ID', 'XCN', 'O', 'Y', 'ID of the pharmacist who verified the order'),
  f(15, 'Prescription Number', 'ST', 'O', 'N', 'Prescription number'),
  f(16, 'Number of Refills Remaining', 'NM', 'O', 'N', 'Number of refills remaining'),
  f(17, 'Number of Refills/Doses Dispensed', 'NM', 'O', 'N', 'Number of refills or doses dispensed'),
  f(18, 'D/T of Most Recent Refill or Dose Dispensed', 'TS', 'O', 'N', 'Date/time of most recent refill or dose'),
  f(19, 'Total Daily Dose', 'CQ', 'O', 'N', 'Total daily dose'),
  f(20, 'Needs Human Review', 'ID', 'O', 'N', 'Whether the order needs human review (Y/N)'),
  f(21, 'Pharmacy/Treatment Supplier\'s Special Dispensing Instructions', 'CE', 'O', 'Y', 'Special dispensing instructions'),
  f(22, 'Give Per (Time Unit)', 'ST', 'O', 'N', 'Rate per time unit for administration'),
  f(23, 'Give Rate Amount', 'ST', 'O', 'N', 'Rate amount for administration'),
  f(24, 'Give Rate Units', 'CE', 'O', 'N', 'Units for the give rate'),
  f(25, 'Give Strength', 'NM', 'O', 'N', 'Strength of the medication'),
  f(26, 'Give Strength Units', 'CE', 'O', 'N', 'Units for the give strength'),
  f(27, 'Give Indication', 'CE', 'O', 'Y', 'Indication for the medication'),
  f(28, 'Dispense Package Size', 'NM', 'O', 'N', 'Size of the dispense package'),
  f(29, 'Dispense Package Size Unit', 'CE', 'O', 'N', 'Units for the dispense package size'),
  f(30, 'Dispense Package Method', 'ID', 'O', 'N', 'Method of dispensing (TR=Traditional, UD=Unit Dose, F=Floor Stock)'),
  f(31, 'Supplementary Code', 'CE', 'O', 'Y', 'Supplementary drug codes'),
  f(32, 'Original Order Date/Time', 'TS', 'O', 'N', 'Date/time of the original order'),
  f(33, 'Give Drug Strength Volume', 'NM', 'O', 'N', 'Drug strength volume'),
  f(34, 'Give Drug Strength Volume Units', 'CWE', 'O', 'N', 'Units for drug strength volume'),
  f(35, 'Controlled Substance Schedule', 'CWE', 'O', 'N', 'DEA schedule classification'),
  f(36, 'Formulary Status', 'ID', 'O', 'N', 'Whether drug is on formulary'),
  f(37, 'Pharmaceutical Substance Alternative', 'CWE', 'O', 'Y', 'Alternative substances'),
  f(38, 'Pharmacy of Most Recent Fill', 'CWE', 'O', 'N', 'Pharmacy of most recent fill'),
  f(39, 'Initial Dispense Amount', 'NM', 'O', 'N', 'Initial dispense amount'),
  f(40, 'Dispensing Pharmacy', 'CWE', 'O', 'N', 'Dispensing pharmacy'),
  f(41, 'Dispensing Pharmacy Address', 'XAD', 'O', 'N', 'Address of dispensing pharmacy'),
  f(42, 'Deliver-to Patient Location', 'PL', 'O', 'N', 'Patient location for delivery'),
  f(43, 'Deliver-to Address', 'XAD', 'O', 'N', 'Address for delivery'),
  f(44, 'Pharmacy Order Type', 'ID', 'O', 'N', 'Type of pharmacy order'),
];

// =============================================================================
// Segment registry — base definitions (v2.5.1)
// =============================================================================

const BASE_SEGMENTS = {
  MSH, EVN, PID, PD1, NK1, PV1, PV2, IN1, GT1, DG1,
  ORC, OBR, OBX, AL1, SCH, NTE, FT1, PR1, RXA, RXE,
};

// Build lookup maps: segment -> { fieldNum -> definition }
const buildFieldMap = (fields) =>
  Object.fromEntries(fields.map((fld) => [String(fld.num), fld]));

const SEGMENT_FIELD_MAPS = Object.fromEntries(
  Object.entries(BASE_SEGMENTS).map(([seg, fields]) => [seg, buildFieldMap(fields)]),
);

// =============================================================================
// Version support
// Versions 2.3 through 2.8 share the same base definitions.
// Version-specific differences are minor (field additions in later versions,
// deprecations noted in descriptions). The base set covers all.
// =============================================================================

const SUPPORTED_VERSIONS = ['2.3', '2.3.1', '2.4', '2.5', '2.5.1', '2.6', '2.7', '2.8'];

const getSegmentDef = (segmentId, _version = '2.5.1') => {
  // All supported versions use the same base definitions.
  // Version-specific overrides can be layered here in the future.
  return BASE_SEGMENTS[segmentId] || null;
};

const getFieldDef = (segmentId, fieldNum, _version = '2.5.1') => {
  const map = SEGMENT_FIELD_MAPS[segmentId];
  if (!map) { return null; }
  return map[String(fieldNum)] || null;
};

const listSegments = (_version = '2.5.1') =>
  Object.entries(BASE_SEGMENTS).map(([id, fields]) => ({
    id,
    name: fields[0] ? segmentNames[id] || id : id,
    fieldCount: fields.length,
  }));

const segmentNames = {
  MSH: 'Message Header',
  EVN: 'Event Type',
  PID: 'Patient Identification',
  PD1: 'Patient Additional Demographics',
  NK1: 'Next of Kin / Associated Parties',
  PV1: 'Patient Visit',
  PV2: 'Patient Visit - Additional Information',
  IN1: 'Insurance',
  GT1: 'Guarantor',
  DG1: 'Diagnosis',
  ORC: 'Common Order',
  OBR: 'Observation Request',
  OBX: 'Observation/Result',
  AL1: 'Patient Allergy Information',
  SCH: 'Scheduling Activity Information',
  NTE: 'Notes and Comments',
  FT1: 'Financial Transaction',
  PR1: 'Procedures',
  RXA: 'Pharmacy/Treatment Administration',
  RXE: 'Pharmacy/Treatment Encoded Order',
};

export {
  BASE_SEGMENTS,
  SEGMENT_FIELD_MAPS,
  SUPPORTED_VERSIONS,
  getSegmentDef,
  getFieldDef,
  listSegments,
  segmentNames,
  buildFieldMap,
};
