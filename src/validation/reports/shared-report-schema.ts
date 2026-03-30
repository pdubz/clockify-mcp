import { z } from "zod";

export const ListSharedReportsSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
});

export const GetSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report"),
});

export const CreateSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  name: z.string().describe("Name for the shared report"),
  reportType: z
    .enum(["DETAILED", "SUMMARY", "WEEKLY"])
    .describe("The type of report"),
  filter: z
    .record(z.any())
    .describe("Report filter configuration — the full report request body to save"),
});

export const UpdateSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report to update"),
  name: z.string().optional().describe("Updated name for the shared report"),
  filter: z
    .record(z.any())
    .optional()
    .describe("Updated report filter configuration"),
});

export const DeleteSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report to delete"),
});

export type TListSharedReportsSchema = z.infer<typeof ListSharedReportsSchema>;
export type TGetSharedReportSchema = z.infer<typeof GetSharedReportSchema>;
export type TCreateSharedReportSchema = z.infer<typeof CreateSharedReportSchema>;
export type TUpdateSharedReportSchema = z.infer<typeof UpdateSharedReportSchema>;
export type TDeleteSharedReportSchema = z.infer<typeof DeleteSharedReportSchema>;
