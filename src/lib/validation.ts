import { z } from "zod";

/**
 * Shared Zod schemas. In production the API validates with the same schemas
 * (shared package), so client validation is a UX convenience, not a control.
 */

const email = z.string().trim().min(1, "Email is required").max(254).pipe(z.email("Enter a valid email address"));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
  remember: z.boolean(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Use 128 characters or fewer")
  .regex(/[a-z]/i, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email,
  password: passwordSchema,
  terms: z.literal(true, { error: "Please accept the terms to continue" }),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const companySchema = z.object({
  company: z.string().trim().min(2, "Enter your company name").max(80),
  industry: z.string().min(1, "Choose an industry"),
  size: z.string().min(1, "Choose a team size"),
});
export const workspaceSchema = z.object({
  workspace: z.string().trim().min(2, "Name your workspace").max(60),
  slug: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  plan: z.enum(["Starter", "Growth", "Scale"]),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter a contact name").max(80),
  company: z.string().trim().min(2, "Enter a company name").max(80),
  email,
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+()\d\s.-]*$/, "Use digits, spaces and + ( ) - only"),
  status: z.enum(["Lead", "Active", "Inactive", "Churned"]),
  category: z.enum(["Enterprise", "Mid-market", "SMB", "Startup"]),
  ownerId: z.string().min(1, "Choose an owner"),
  city: z.string().trim().max(60),
  country: z.string().trim().max(60),
  website: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" })]),
  industry: z.string().trim().max(60),
  lifetimeValue: z.number({ error: "Enter a number" }).min(0, "Can’t be negative").max(100_000_000),
});
export type CustomerValues = z.infer<typeof customerSchema>;

export const employeeSchema = z.object({
  name: z.string().trim().min(2, "Enter a full name").max(80),
  email,
  title: z.string().trim().min(2, "Enter a job title").max(80),
  departmentId: z.string().min(1, "Choose a department"),
  role: z.enum(["Super Admin", "Company Admin", "Manager", "Employee"]),
  status: z.enum(["Active", "On leave", "Invited", "Inactive"]),
  location: z.string().trim().max(60),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;

export const projectSchema = z
  .object({
    name: z.string().trim().min(3, "Give the project a name").max(90),
    description: z.string().trim().max(600),
    customerId: z.string(),
    status: z.enum(["Planning", "Active", "On hold", "Completed"]),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]),
    startDate: z.string().min(1, "Pick a start date"),
    dueDate: z.string().min(1, "Pick a deadline"),
    budget: z.number({ error: "Enter a number" }).min(0).max(100_000_000),
    memberIds: z.array(z.string()),
  })
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    path: ["dueDate"],
    message: "Deadline must be after the start date",
  });
export type ProjectValues = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Give the task a title").max(120),
  description: z.string().trim().max(1000),
  projectId: z.string().min(1, "Choose a project"),
  status: z.enum(["todo", "in_progress", "in_review", "completed"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  assigneeId: z.string(),
  dueDate: z.string().min(1, "Pick a due date"),
});
export type TaskValues = z.infer<typeof taskSchema>;

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().trim().min(1, "Describe the item").max(140),
  quantity: z.number({ error: "Qty" }).positive("> 0").max(1_000_000),
  unitPrice: z.number({ error: "Price" }).min(0, "≥ 0").max(10_000_000),
});

export const invoiceSchema = z
  .object({
    customerId: z.string().min(1, "Choose a customer"),
    issueDate: z.string().min(1, "Pick an issue date"),
    dueDate: z.string().min(1, "Pick a due date"),
    taxRate: z.number({ error: "Enter a rate" }).min(0).max(100),
    discount: z.number({ error: "Enter a discount" }).min(0).max(100),
    notes: z.string().max(800),
    items: z.array(lineItemSchema).min(1, "Add at least one line item"),
  })
  .refine((v) => v.dueDate >= v.issueDate, { path: ["dueDate"], message: "Due date can’t be before the issue date" });
export type InvoiceValues = z.infer<typeof invoiceSchema>;

export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const level = Math.min(4, score);
  return { level, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][level] };
}

/** Only allow same-origin relative redirects (prevents open-redirect via ?next=). */
export function safeNext(next: string | null | undefined, fallback = "/app") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
