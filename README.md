# HL7 Tools — MCP Server + REST API

HL7 v2.x parser, viewer, validator, test message generator, and FHIR R4 converter.

## Features

- **Parse** raw HL7 v2 pipe-delimited messages into structured JSON with named fields
- **Explain** messages with human-readable field descriptions (CARISTIX-style)
- **Validate** messages against segment/field requirements for 20+ message types
- **Generate** realistic test messages for ADT, ORM, ORU, SIU, MDM, DFT, VXU
- **Diff** two HL7 messages to find field-level differences
- **Convert** HL7 v2 to FHIR R4 Bundles (10 resource mappings)
- **Convert** FHIR R4 Bundles back to HL7 v2
- **Look up** any segment or field definition across versions 2.3–2.8

## Supported Segments (20 with full definitions)

MSH, EVN, PID, PD1, NK1, PV1, PV2, IN1, GT1, DG1, ORC, OBR, OBX, AL1, SCH, NTE, FT1, PR1, RXA, RXE

## Quick Start

```bash
npm install
npm run dev       # HTTP mode on port 3200
npm start         # stdio mode (for MCP clients)
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `hl7_parse` | Parse HL7 v2 message to structured JSON |
| `hl7_explain` | Human-readable explanation of every field |
| `hl7_validate` | Validate message structure and required fields |
| `hl7_generate` | Generate sample messages with fake data |
| `hl7_diff` | Compare two messages field by field |
| `hl7_to_fhir` | Convert HL7 v2 to FHIR R4 Bundle |
| `fhir_to_hl7` | Convert FHIR R4 Bundle to HL7 v2 |
| `hl7_segments` | List all segments and field counts |
| `hl7_field_info` | Look up a specific field definition |

## REST API

```
POST /parse       — Parse a message
POST /explain     — Explain a message
POST /validate    — Validate a message
POST /generate    — Generate a test message
POST /diff        — Diff two messages
POST /to-fhir     — Convert HL7 to FHIR
POST /to-hl7      — Convert FHIR to HL7
GET  /segments    — List segments (?version=2.5.1)
GET  /field       — Field info (?segment=PID&field=3)
GET  /health      — Health check
GET  /            — API info
```
