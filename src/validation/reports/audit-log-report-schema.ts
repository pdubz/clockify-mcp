import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const AuditLogReportSchema = CommonReportFiltersSchema.extend({});

export type TAuditLogReportSchema = z.infer<typeof AuditLogReportSchema>;
