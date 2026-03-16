#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { parse, explain, diff } from './parser.js';
import { validate } from './validator.js';
import { generate, SUPPORTED_TYPES } from './generator.js';
import { toFhir, toHl7 } from './fhir-converter.js';
import { getSegmentDef, getFieldDef, listSegments, SUPPORTED_VERSIONS, segmentNames } from './definitions.js';
import { authMiddleware, createKey, revokeKey, PLANS } from './keys.js';
import { createCheckoutSession, handleWebhook } from './stripe.js';

// --- MCP Server ---

const server = new McpServer({
  name: 'hl7-tools',
  version: '1.0.0',
});

// Tool 1: hl7_parse
server.tool(
  'hl7_parse',
  'Parse a raw HL7 v2 pipe-delimited message into structured JSON with named fields, data types, and descriptions. Supports versions 2.3 through 2.8.',
  {
    message: z.string().describe('Raw HL7 v2 message (pipe-delimited, segments separated by \\r or \\n)'),
    version: z.string().optional().describe('HL7 version override (auto-detected from MSH-12 if omitted)'),
  },
  async ({ message, version }) => ({
    content: [{ type: 'text', text: JSON.stringify(parse(message, version), null, 2) }],
  }),
);

// Tool 2: hl7_explain
server.tool(
  'hl7_explain',
  'Parse an HL7 v2 message and return a human-readable explanation of every segment, field name, data type, and value. Great for understanding unfamiliar messages.',
  {
    message: z.string().describe('Raw HL7 v2 message'),
    version: z.string().optional().describe('HL7 version override'),
  },
  async ({ message, version }) => ({
    content: [{ type: 'text', text: JSON.stringify(explain(message, version), null, 2) }],
  }),
);

// Tool 3: hl7_validate
server.tool(
  'hl7_validate',
  'Validate an HL7 v2 message: checks required segments for the message type, required fields, timestamp formats, and segment ordering. Returns issues with severity levels (error/warning/info).',
  {
    message: z.string().describe('Raw HL7 v2 message to validate'),
    version: z.string().optional().describe('HL7 version override'),
  },
  async ({ message, version }) => ({
    content: [{ type: 'text', text: JSON.stringify(validate(message, version), null, 2) }],
  }),
);

// Tool 4: hl7_generate
server.tool(
  'hl7_generate',
  `Generate a sample HL7 v2 message with realistic but fake test data. Supported types: ${SUPPORTED_TYPES.join(', ')}`,
  {
    messageType: z.string().describe('Message type to generate (e.g., "ADT^A01", "ORU^R01", "ORM^O01", "VXU^V04")'),
    version: z.string().optional().describe('HL7 version (default 2.5.1)'),
    sendingApplication: z.string().optional().describe('Sending application name'),
    sendingFacility: z.string().optional().describe('Sending facility name'),
  },
  async ({ messageType, version, sendingApplication, sendingFacility }) => ({
    content: [{ type: 'text', text: JSON.stringify(generate(messageType, { version, sendingApplication, sendingFacility }), null, 2) }],
  }),
);

// Tool 5: hl7_diff
server.tool(
  'hl7_diff',
  'Compare two HL7 v2 messages and return all differences: version, message type, segment additions/removals, and field-level changes with named fields.',
  {
    message1: z.string().describe('First HL7 v2 message'),
    message2: z.string().describe('Second HL7 v2 message'),
    version: z.string().optional().describe('HL7 version override'),
  },
  async ({ message1, message2, version }) => ({
    content: [{ type: 'text', text: JSON.stringify(diff(message1, message2, version), null, 2) }],
  }),
);

// Tool 6: hl7_to_fhir
server.tool(
  'hl7_to_fhir',
  'Convert an HL7 v2 message to a FHIR R4 Bundle. Maps PID->Patient, PV1->Encounter, DG1->Condition, OBX->Observation, OBR->DiagnosticReport, AL1->AllergyIntolerance, IN1->Coverage, RXA->Immunization, ORC->ServiceRequest, MSH->MessageHeader.',
  {
    message: z.string().describe('Raw HL7 v2 message to convert'),
    version: z.string().optional().describe('HL7 version override'),
  },
  async ({ message, version }) => ({
    content: [{ type: 'text', text: JSON.stringify(toFhir(message, version), null, 2) }],
  }),
);

// Tool 7: fhir_to_hl7
server.tool(
  'fhir_to_hl7',
  'Convert a FHIR R4 Bundle back to an HL7 v2 message. Maps Patient->PID, Encounter->PV1, Condition->DG1, Observation->OBX.',
  {
    bundle: z.string().describe('FHIR R4 Bundle as JSON string'),
  },
  async ({ bundle }) => {
    try {
      const fhirBundle = JSON.parse(bundle);
      return { content: [{ type: 'text', text: JSON.stringify(toHl7(fhirBundle), null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Invalid JSON: ${err.message}` }) }] };
    }
  },
);

// Tool 8: hl7_segments
server.tool(
  'hl7_segments',
  'List all known HL7 v2 segments with their field counts. Use to discover available segments for a given version.',
  {
    version: z.string().optional().describe('HL7 version (default 2.5.1)'),
  },
  async ({ version }) => ({
    content: [{ type: 'text', text: JSON.stringify(listSegments(version), null, 2) }],
  }),
);

// Tool 9: hl7_field_info
server.tool(
  'hl7_field_info',
  'Look up a specific HL7 field definition by segment and field number. Returns the field name, data type, optionality, repetition, and description. Example: segment="PID", field=3 returns "Patient Identifier List".',
  {
    segment: z.string().describe('Segment ID (e.g., "PID", "OBX", "MSH")'),
    field: z.number().describe('Field number (1-based, e.g., 3 for PID-3)'),
    version: z.string().optional().describe('HL7 version (default 2.5.1)'),
  },
  async ({ segment, field, version }) => {
    const fieldDef = getFieldDef(segment.toUpperCase(), field, version);
    if (!fieldDef) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Field ${segment}-${field} not found` }) }] };
    }
    const segName = segmentNames[segment.toUpperCase()] || segment;
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          segment: segment.toUpperCase(),
          segmentName: segName,
          field: fieldDef.num,
          path: `${segment.toUpperCase()}-${fieldDef.num}`,
          name: fieldDef.name,
          dataType: fieldDef.dataType,
          optionality: fieldDef.optionality,
          optionalityDesc: { R: 'Required', O: 'Optional', C: 'Conditional' }[fieldDef.optionality] || fieldDef.optionality,
          repeating: fieldDef.repeating,
          description: fieldDef.description,
          version: version || '2.5.1',
        }, null, 2),
      }],
    };
  },
);

const TOOL_COUNT = 9;

// --- Start ---

const main = async () => {
  const port = process.env.PORT;

  if (port) {
    const app = express();
    app.use(express.json({ limit: '5mb' }));

    // --- Health / Info ---
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', tools: TOOL_COUNT, supportedVersions: SUPPORTED_VERSIONS });
    });

    app.get('/', (_req, res) => {
      res.json({
        name: 'hl7-tools',
        version: '1.0.0',
        description: 'HL7 v2.x parser, viewer, validator, generator, and FHIR R4 converter',
        tools: TOOL_COUNT,
        transport: 'streamable-http',
        supportedVersions: SUPPORTED_VERSIONS,
        supportedMessageTypes: SUPPORTED_TYPES,
        plans: PLANS,
        endpoints: {
          'POST /parse': 'Parse an HL7 v2 message',
          'POST /explain': 'Explain an HL7 v2 message',
          'POST /validate': 'Validate an HL7 v2 message',
          'POST /generate': 'Generate a test HL7 v2 message',
          'POST /diff': 'Compare two HL7 v2 messages',
          'POST /to-fhir': 'Convert HL7 v2 to FHIR R4',
          'POST /to-hl7': 'Convert FHIR R4 to HL7 v2',
          'GET /segments': 'List segments for a version',
          'GET /field': 'Look up a field definition',
        },
      });
    });

    // --- API Routes (key-gated) ---

    app.post('/parse', authMiddleware, (req, res) => {
      const { message, version } = req.body;
      if (!message) { return res.status(400).json({ error: 'message is required' }); }
      res.json(parse(message, version));
    });

    app.post('/explain', authMiddleware, (req, res) => {
      const { message, version } = req.body;
      if (!message) { return res.status(400).json({ error: 'message is required' }); }
      res.json(explain(message, version));
    });

    app.post('/validate', authMiddleware, (req, res) => {
      const { message, version } = req.body;
      if (!message) { return res.status(400).json({ error: 'message is required' }); }
      res.json(validate(message, version));
    });

    app.post('/generate', authMiddleware, (req, res) => {
      const { messageType, version, sendingApplication, sendingFacility } = req.body;
      if (!messageType) { return res.status(400).json({ error: 'messageType is required', supportedTypes: SUPPORTED_TYPES }); }
      res.json(generate(messageType, { version, sendingApplication, sendingFacility }));
    });

    app.post('/diff', authMiddleware, (req, res) => {
      const { message1, message2, version } = req.body;
      if (!message1 || !message2) { return res.status(400).json({ error: 'message1 and message2 are required' }); }
      res.json(diff(message1, message2, version));
    });

    app.post('/to-fhir', authMiddleware, (req, res) => {
      const { message, version } = req.body;
      if (!message) { return res.status(400).json({ error: 'message is required' }); }
      res.json(toFhir(message, version));
    });

    app.post('/to-hl7', authMiddleware, (req, res) => {
      const { bundle } = req.body;
      if (!bundle) { return res.status(400).json({ error: 'bundle is required (FHIR R4 Bundle object)' }); }
      const fhirBundle = typeof bundle === 'string' ? JSON.parse(bundle) : bundle;
      res.json(toHl7(fhirBundle));
    });

    app.get('/segments', authMiddleware, (req, res) => {
      const version = req.query.version || '2.5.1';
      res.json({ version, segments: listSegments(version) });
    });

    app.get('/field', authMiddleware, (req, res) => {
      const { segment, field, version } = req.query;
      if (!segment || !field) { return res.status(400).json({ error: 'segment and field query params are required' }); }
      const def = getFieldDef(segment.toUpperCase(), parseInt(field, 10), version);
      if (!def) { return res.status(404).json({ error: `Field ${segment}-${field} not found` }); }
      res.json({
        segment: segment.toUpperCase(),
        segmentName: segmentNames[segment.toUpperCase()] || segment,
        ...def,
        version: version || '2.5.1',
      });
    });

    // --- Stripe ---

    app.post('/checkout', async (req, res) => {
      try {
        const { plan, success_url, cancel_url } = req.body;
        const session = await createCheckoutSession(plan, success_url, cancel_url);
        res.json(session);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
      try {
        const result = handleWebhook(req.body, req.headers['stripe-signature']);
        res.json({ received: true, result });
      } catch (err) {
        console.error('[webhook] Error:', err.message);
        res.status(400).json({ error: err.message });
      }
    });

    // --- Admin key management ---

    const adminAuth = (req, res, next) => {
      const secret = process.env.ADMIN_SECRET;
      if (!secret || req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    };

    app.post('/admin/keys', adminAuth, (req, res) => {
      const { plan, email } = req.body;
      res.json(createKey(plan, email));
    });

    app.delete('/admin/keys/:key', adminAuth, (req, res) => {
      res.json({ revoked: revokeKey(req.params.key) });
    });

    // --- MCP over HTTP ---

    const transports = {};

    app.post('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      let transport = transports[sessionId];

      if (!transport) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
        });
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };
        await server.connect(transport);
        transports[transport.sessionId] = transport;
      }

      await transport.handleRequest(req, res, req.body);
    });

    app.get('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      const transport = transports[sessionId];
      if (!transport) {
        return res.status(400).json({ error: 'No active session. Send a POST to /mcp first.' });
      }
      await transport.handleRequest(req, res);
    });

    app.delete('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      const transport = transports[sessionId];
      if (!transport) {
        return res.status(400).json({ error: 'No active session.' });
      }
      await transport.handleRequest(req, res);
    });

    app.listen(parseInt(port, 10), () => {
      console.log(`HL7 Tools MCP server running on HTTP port ${port}`);
      console.log(`  ${TOOL_COUNT} tools | ${SUPPORTED_VERSIONS.length} HL7 versions | ${SUPPORTED_TYPES.length} message generators`);
    });
  } else {
    // stdio mode for MCP client integration
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
};

main().catch((err) => {
  console.error('Failed to start HL7 Tools server:', err);
  process.exit(1);
});
