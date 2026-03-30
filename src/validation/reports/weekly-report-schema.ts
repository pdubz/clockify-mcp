import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const WeeklyReportSchema = CommonReportFiltersSchema.extend({});

export type TWeeklyReportSchema = z.infer<typeof WeeklyReportSchema>;
