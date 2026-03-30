import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const SummaryReportSchema = CommonReportFiltersSchema.extend({
  groups: z
    .array(z.enum(["PROJECT", "USER", "CLIENT", "TAG", "DATE", "TIMEENTRY", "MONTH"]))
    .min(1)
    .max(3)
    .describe("Grouping levels for the summary (1-3 levels, e.g. ['PROJECT', 'USER'])"),
  sortColumn: z
    .enum(["GROUP", "DURATION", "AMOUNT"])
    .optional()
    .default("GROUP")
    .describe("Column to sort results by (default: GROUP)"),
});

export type TSummaryReportSchema = z.infer<typeof SummaryReportSchema>;
