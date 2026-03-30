import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const DetailedReportSchema = CommonReportFiltersSchema.extend({
  page: z
    .number()
    .optional()
    .default(1)
    .describe("Page number for pagination (default: 1)"),
  pageSize: z
    .number()
    .optional()
    .default(1000)
    .describe("Number of entries per page (default: 1000)"),
  sortColumn: z
    .enum(["DATE", "DESCRIPTION", "USER", "PROJECT", "CLIENT", "DURATION", "TAG"])
    .optional()
    .default("DATE")
    .describe("Column to sort results by (default: DATE)"),
  sortOrder: z
    .enum(["ASCENDING", "DESCENDING"])
    .optional()
    .default("ASCENDING")
    .describe("Sort order (default: ASCENDING)"),
  autoPaginate: z
    .boolean()
    .optional()
    .default(false)
    .describe("When true, automatically fetches all pages and concatenates results"),
});

export type TDetailedReportSchema = z.infer<typeof DetailedReportSchema>;
