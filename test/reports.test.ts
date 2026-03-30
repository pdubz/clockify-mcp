import { describe, it } from "node:test";
import assert from "node:assert";
import { buildReportRequestBody } from "../src/clockify-sdk/reports";

describe("buildReportRequestBody", () => {
  it("builds body with required fields only", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
    });

    assert.strictEqual(body.dateRangeStart, "2024-01-01T00:00:00.000Z");
    assert.strictEqual(body.dateRangeEnd, "2024-12-31T23:59:59.000Z");
    assert.strictEqual(body.exportType, "JSON");
    assert.strictEqual(body.projects, undefined);
    assert.strictEqual(body.clients, undefined);
    assert.strictEqual(body.users, undefined);
    assert.strictEqual(body.tags, undefined);
  });

  it("maps projectIds into nested project filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: ["p1", "p2"],
    });

    assert.deepStrictEqual(body.projects, {
      ids: ["p1", "p2"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps clientIds into nested client filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      clientIds: ["c1"],
    });

    assert.deepStrictEqual(body.clients, {
      ids: ["c1"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps userIds into nested user filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      userIds: ["u1", "u2"],
    });

    assert.deepStrictEqual(body.users, {
      ids: ["u1", "u2"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps tagIds into nested tag filter with containedInTimeentry", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      tagIds: ["t1"],
    });

    assert.deepStrictEqual(body.tags, {
      ids: ["t1"],
      containedInTimeentry: "CONTAINS",
      status: "ALL",
    });
  });

  it("does not include workspaceId in the body", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
    });

    assert.strictEqual(body.workspaceId, undefined);
  });

  it("rawFilters override constructed fields", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: ["p1"],
      rawFilters: {
        projects: { ids: ["p_override"], contains: "DOES_NOT_CONTAIN", status: "ACTIVE" },
        approvalState: "APPROVED",
      },
    });

    assert.deepStrictEqual(body.projects, {
      ids: ["p_override"],
      contains: "DOES_NOT_CONTAIN",
      status: "ACTIVE",
    });
    assert.strictEqual(body.approvalState, "APPROVED");
  });

  it("skips empty filter arrays", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: [],
      clientIds: [],
    });

    assert.strictEqual(body.projects, undefined);
    assert.strictEqual(body.clients, undefined);
  });
});
