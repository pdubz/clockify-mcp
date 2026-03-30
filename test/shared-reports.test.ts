import { after, describe, it } from "node:test";
import { createMcpClient, TEST_WORKSPACE_ID } from "./setup";
import { McpResponse } from "../src/types";
import assert from "node:assert";

let createdReportId: string;

describe("Shared Reports MCP Tests", async () => {
  const client = await createMcpClient();

  after(async () => {
    await client.close();
  });

  it("List shared reports", async () => {
    const response = (await client.callTool({
      name: "list-shared-reports",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
      },
    })) as McpResponse;

    assert(response.content[0].type === "text");
    const data = JSON.parse(response.content[0].text as string);
    assert(Array.isArray(data));
  });

  it("Create a shared report", async () => {
    const response = (await client.callTool({
      name: "create-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        name: "MCP Test Shared Report",
        reportType: "SUMMARY",
        filter: {
          dateRangeStart: "2024-01-01T00:00:00.000Z",
          dateRangeEnd: "2024-12-31T23:59:59.000Z",
          summaryFilter: {
            groups: ["PROJECT"],
          },
        },
      },
    })) as McpResponse;

    assert((response.content[0].text as string).startsWith("Shared report created successfully"));

    const match = (response.content[0].text as string).match(/ID: ([^\s]+)/);
    if (match) {
      createdReportId = match[1];
    }
  });

  it("Get a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "get-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
      },
    })) as McpResponse;

    assert(response.content[0].type === "text");
    const data = JSON.parse(response.content[0].text as string);
    assert.strictEqual(data.id, createdReportId);
  });

  it("Update a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "update-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
        name: "MCP Test Shared Report Updated",
      },
    })) as McpResponse;

    assert((response.content[0].text as string).startsWith("Shared report updated successfully"));
  });

  it("Delete a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "delete-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
      },
    })) as McpResponse;

    assert((response.content[0].text as string).includes("deleted successfully"));
  });
});
