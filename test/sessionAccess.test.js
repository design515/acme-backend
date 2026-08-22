import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  registerSession,
  resetSessions,
  validateSession,
} from "../src/services/sessionService.js";
import { requireSession } from "../src/middleware/requireSession.js";

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("validateSession", () => {
  beforeEach(() => {
    resetSessions();
  });

  it("allows access with an active session token", () => {
    registerSession("active-token", Date.now() + 60_000);

    const result = validateSession("active-token");

    assert.equal(result.valid, true);
    assert.equal(result.session.token, "active-token");
  });

  it("rejects expired session tokens", () => {
    const now = Date.now();
    registerSession("expired-token", now - 1);

    const result = validateSession("expired-token", now);

    assert.equal(result.valid, false);
    assert.equal(result.error, "Session expired");
  });
});

describe("requireSession", () => {
  beforeEach(() => {
    resetSessions();
  });

  it("returns 401 when an expired session accesses orders", () => {
    const now = Date.now();
    registerSession("expired-token", now - 1);

    const req = { headers: { authorization: "Bearer expired-token" } };
    const res = createMockResponse();
    let nextCalled = false;

    requireSession(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "Session expired" });
  });

  it("allows the request to continue with a valid session", () => {
    registerSession("valid-token", Date.now() + 60_000);

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockResponse();
    let nextCalled = false;

    requireSession(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.session.token, "valid-token");
  });
});
