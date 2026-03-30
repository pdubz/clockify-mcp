import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const AttendanceReportSchema = CommonReportFiltersSchema.extend({});

export type TAttendanceReportSchema = z.infer<typeof AttendanceReportSchema>;
