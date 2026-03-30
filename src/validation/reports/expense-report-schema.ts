import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const ExpenseReportSchema = CommonReportFiltersSchema.extend({});

export type TExpenseReportSchema = z.infer<typeof ExpenseReportSchema>;
