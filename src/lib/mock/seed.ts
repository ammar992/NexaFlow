/**
 * Deterministic, clearly-fictional demo data.
 *
 * Every company, person and figure here is illustrative. A seeded PRNG keeps
 * the data stable per workspace so the demo looks the same on every reset.
 */
import type {
  Activity,
  Customer,
  CustomerCategory,
  CustomerStatus,
  Deal,
  DealStage,
  Department,
  Employee,
  Invoice,
  LineItem,
  MonthlyMetric,
  Notification,
  Payment,
  PermissionKey,
  PermissionMatrix,
  Priority,
  Project,
  ProjectStatus,
  Role,
  Task,
  TaskStatus,
  Workspace,
  WorkspaceData,
} from "@/types";

/* ----------------------------- PRNG ----------------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = ReturnType<typeof mulberry32>;
const pick = <T,>(r: Rng, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
const int = (r: Rng, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;
const chance = (r: Rng, p: number) => r() < p;
function weighted<T>(r: Rng, entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of entries) {
    x -= w;
    if (x <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY).toISOString();

/* ---------------------------- Word banks ------------------------------- */

const FIRST = [
  "Amara", "Theo", "Priya", "Mateo", "Hana", "Jonah", "Leila", "Ravi", "Sofia", "Kwame",
  "Elena", "Dmitri", "Aisha", "Callum", "Mei", "Oscar", "Noor", "Felix", "Yara", "Tomas",
  "Ines", "Kenji", "Zara", "Lucas", "Imani", "Arjun", "Clara", "Omar", "Freya", "Diego",
  "Saanvi", "Bastian", "Nia", "Hugo", "Lina", "Samir", "Maya", "Rowan", "Esme", "Tariq",
] as const;
const LAST = [
  "Okafor", "Lindqvist", "Raman", "Castillo", "Watanabe", "Brennan", "Haddad", "Iyer", "Moretti",
  "Mensah", "Petrova", "Novak", "Rahman", "Fraser", "Chen", "Albers", "Siddiqui", "Hartmann",
  "Duarte", "Kowalski", "Ferreira", "Sato", "Abara", "Laurent", "Nwosu", "Kapoor", "Vogel",
  "Aziz", "Holm", "Navarro", "Bose", "Keller", "Adeyemi", "Marchetti", "Osei", "Varga",
] as const;
const CO_A = [
  "Kestrel", "Juniper", "Halcyon", "Brightwater", "Copperleaf", "Alder", "Saltmarsh", "Ironbark",
  "Quillon", "Tidewell", "Fernway", "Oakhurst", "Silverpine", "Emberly", "Northgate", "Larkspur",
  "Bramble", "Cobalt Bay", "Wrenfield", "Sable Peak", "Marigold", "Driftwood", "Foxglove", "Harrow",
  "Orchard Lane", "Pebblestone", "Redwing", "Thornbury", "Willowmere", "Zephyr",
] as const;
const CO_B = [
  "Analytics", "Foods", "Labs", "Partners", "Outfitters", "Robotics", "Media", "Supply Co.",
  "Ventures", "Freight", "Realty", "Dental", "Architects", "Coffee", "Biotech", "Apparel",
  "Hospitality", "Energy", "Learning", "Fitness",
] as const;
const CITIES: [string, string][] = [
  ["Austin", "US"], ["Toronto", "CA"], ["Lisbon", "PT"], ["Berlin", "DE"], ["Melbourne", "AU"],
  ["Denver", "US"], ["Dublin", "IE"], ["Singapore", "SG"], ["Manchester", "UK"], ["Cape Town", "ZA"],
  ["Seattle", "US"], ["Amsterdam", "NL"], ["Nairobi", "KE"], ["Chicago", "US"], ["Dubai", "AE"],
];

/* --------------------------- Workspaces -------------------------------- */

interface WorkspaceProfile {
  workspace: Workspace;
  seed: number;
  customers: number;
  employees: number;
  revenueBase: number;
  growth: number;
  departments: Record<string, string[]>;
  projects: string[];
  services: [string, number][];
  taskBank: string[];
  dealBank: string[];
}

export const DEMO_USER = {
  id: "usr_demo",
  name: "Alex Morgan",
  email: "alex@nexaflow.demo",
  role: "Super Admin" as Role,
};

const PROFILES: WorkspaceProfile[] = [
  {
    seed: 1207,
    customers: 48,
    employees: 18,
    revenueBase: 86_000,
    growth: 0.034,
    workspace: {
      id: "ws_lumen",
      name: "Lumen & Pine Studio",
      slug: "lumen-pine",
      industry: "Creative agency",
      plan: "Growth",
      currency: "USD",
      color: "#795CFF",
      createdAt: daysAgo(640),
    },
    departments: {
      Design: ["Senior Product Designer", "Brand Designer", "Design Lead", "Motion Designer"],
      Engineering: ["Frontend Engineer", "Full-stack Engineer", "Engineering Manager"],
      Strategy: ["Strategist", "Account Director", "Producer"],
      Operations: ["Operations Manager", "Finance Associate"],
    },
    projects: [
      "Brand refresh — Kestrel Analytics",
      "E-commerce replatform",
      "Mobile onboarding redesign",
      "Q4 campaign toolkit",
      "Design system v3",
      "Investor deck & site",
      "Customer portal UX audit",
    ],
    services: [
      ["Brand identity package", 12_500], ["UX research sprint", 6_800], ["UI design — per screen", 450],
      ["Frontend development (hours)", 140], ["Motion design (hours)", 120], ["Retainer — monthly", 8_000],
      ["Workshop facilitation", 2_400], ["Copywriting (hours)", 95],
    ],
    taskBank: [
      "Moodboard round 2", "Stakeholder interviews", "Wireframe checkout flow", "Logo lockups", "Accessibility pass",
      "Component audit", "Hero animation", "Content inventory", "Usability test plan", "Prototype handoff",
      "Typography scale", "Icon set export", "QA on staging", "Analytics events spec", "Client review prep",
    ],
    dealBank: ["Website redesign", "Brand strategy", "Retainer renewal", "Product design sprint", "Campaign launch", "App MVP design"],
  },
  {
    seed: 4421,
    customers: 64,
    employees: 26,
    revenueBase: 212_000,
    growth: 0.022,
    workspace: {
      id: "ws_harbor",
      name: "Harborline Logistics",
      slug: "harborline",
      industry: "Freight & logistics",
      plan: "Scale",
      currency: "USD",
      color: "#3D8BFF",
      createdAt: daysAgo(1120),
    },
    departments: {
      Operations: ["Fleet Coordinator", "Dispatch Lead", "Operations Director", "Route Planner"],
      Sales: ["Account Executive", "Sales Manager", "Business Development Rep"],
      Warehouse: ["Warehouse Supervisor", "Inventory Analyst"],
      Finance: ["Billing Specialist", "Controller"],
      Technology: ["Systems Engineer", "Data Analyst"],
    },
    projects: [
      "Cold-chain expansion",
      "Driver app rollout",
      "Warehouse slotting optimisation",
      "Carrier onboarding portal",
      "Route analytics dashboard",
      "ISO audit preparation",
      "Last-mile pilot — Denver",
      "Customs documentation automation",
      "Fleet telematics upgrade",
    ],
    services: [
      ["FTL shipment", 3_400], ["LTL pallet", 260], ["Cold-chain surcharge", 480], ["Warehousing — pallet/month", 38],
      ["Customs brokerage", 650], ["Last-mile delivery", 24], ["Fuel surcharge", 180], ["Expedited handling", 320],
    ],
    taskBank: [
      "Vendor RFP review", "Driver training session", "Update SOP documents", "Dock scheduling review", "Rate card update",
      "Telematics install", "Safety inspection", "Carrier compliance check", "Pilot KPI report", "Integrate EDI feed",
      "Load-plan template", "Customer SLA review", "Inventory cycle count", "Claims backlog triage", "Route model tuning",
    ],
    dealBank: ["Annual freight contract", "Warehousing agreement", "Cold-chain lanes", "Regional distribution", "Cross-border program", "Peak season capacity"],
  },
  {
    seed: 9083,
    customers: 30,
    employees: 12,
    revenueBase: 41_500,
    growth: 0.041,
    workspace: {
      id: "ws_verdant",
      name: "Verdant Wellness Group",
      slug: "verdant-wellness",
      industry: "Health & wellness clinics",
      plan: "Starter",
      currency: "USD",
      color: "#14A38B",
      createdAt: daysAgo(310),
    },
    departments: {
      Clinical: ["Physiotherapist", "Nutritionist", "Clinical Lead"],
      "Front desk": ["Patient Coordinator", "Office Manager"],
      Marketing: ["Marketing Lead", "Community Manager"],
    },
    projects: [
      "New clinic fit-out — Lisbon",
      "Corporate wellness program",
      "Online booking launch",
      "Practitioner training cycle",
      "Membership pricing review",
    ],
    services: [
      ["Corporate wellness session", 1_200], ["Physiotherapy package (10)", 850], ["Nutrition program", 640],
      ["Workplace ergonomics audit", 1_900], ["Membership — quarterly", 420], ["Health screening day", 3_200],
    ],
    taskBank: [
      "Equipment order", "Update intake forms", "Practitioner rota", "Booking page copy", "Partner outreach",
      "Session feedback survey", "Price sheet draft", "Clinic signage", "Insurance paperwork", "Newsletter draft",
    ],
    dealBank: ["Corporate wellness contract", "Clinic partnership", "Membership bundle", "Screening day", "Ergonomics program"],
  },
];

export const DEMO_WORKSPACES: Workspace[] = PROFILES.map((p) => p.workspace);

/* --------------------------- Permissions ------------------------------- */

export const PERMISSION_GROUPS: { group: string; items: { key: PermissionKey; label: string; hint: string }[] }[] = [
  {
    group: "Customers & CRM",
    items: [
      { key: "customers.view", label: "View customers", hint: "See customer records, deals and notes" },
      { key: "customers.manage", label: "Manage customers", hint: "Create, edit and delete customers and deals" },
    ],
  },
  {
    group: "People",
    items: [
      { key: "employees.view", label: "View directory", hint: "Browse employees and departments" },
      { key: "employees.manage", label: "Manage employees", hint: "Invite, edit roles and deactivate people" },
    ],
  },
  {
    group: "Work",
    items: [
      { key: "projects.view", label: "View projects", hint: "See projects they are not a member of" },
      { key: "projects.manage", label: "Manage projects", hint: "Create projects and assign members" },
      { key: "tasks.manage", label: "Manage tasks", hint: "Create, move and reassign any task" },
    ],
  },
  {
    group: "Finance",
    items: [
      { key: "invoices.view", label: "View invoices", hint: "See invoices and payment history" },
      { key: "invoices.manage", label: "Manage invoices", hint: "Create, send and void invoices" },
      { key: "payments.refund", label: "Issue refunds", hint: "Refund captured payments" },
    ],
  },
  {
    group: "Insights & admin",
    items: [
      { key: "analytics.view", label: "View analytics", hint: "Access dashboards and trends" },
      { key: "reports.export", label: "Export reports", hint: "Download CSV and PDF exports" },
      { key: "settings.workspace", label: "Workspace settings", hint: "Edit workspace profile and integrations" },
      { key: "settings.billing", label: "Billing", hint: "Change plan and payment method" },
    ],
  },
];

const ALL_KEYS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export function defaultPermissions(): PermissionMatrix {
  const grant = (keys: PermissionKey[]) =>
    Object.fromEntries(ALL_KEYS.map((k) => [k, keys.includes(k)])) as Record<PermissionKey, boolean>;
  return {
    "Super Admin": grant(ALL_KEYS),
    "Company Admin": grant(ALL_KEYS.filter((k) => k !== "settings.billing")),
    Manager: grant([
      "customers.view", "customers.manage", "employees.view", "projects.view", "projects.manage",
      "tasks.manage", "invoices.view", "analytics.view", "reports.export",
    ]),
    Employee: grant(["customers.view", "employees.view", "projects.view", "tasks.manage"]),
  };
}

/* ----------------------------- Builder --------------------------------- */

function buildWorkspace(profile: WorkspaceProfile): WorkspaceData {
  const r = mulberry32(profile.seed);
  const wsId = profile.workspace.id;
  let n = 0;
  const id = (p: string) => `${p}_${wsId.slice(3)}_${(++n).toString(36)}`;
  const person = () => `${pick(r, FIRST)} ${pick(r, LAST)}`;
  const emailFor = (name: string, domain: string) =>
    `${name.toLowerCase().replace(/[^a-z ]/g, "").split(" ").join(".")}@${domain}`;

  /* departments & employees */
  const departments: Department[] = Object.keys(profile.departments).map((name) => ({
    id: id("dep"),
    workspaceId: wsId,
    name,
  }));

  const usedNames = new Set<string>([DEMO_USER.name]);
  const employees: Employee[] = [
    {
      id: `emp_${wsId.slice(3)}_owner`,
      workspaceId: wsId,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      title: "Managing Director",
      departmentId: departments[departments.length - 1].id,
      role: "Super Admin",
      status: "Active",
      location: CITIES[0][0],
      joinedAt: profile.workspace.createdAt,
      productivity: 88,
    },
  ];
  for (let i = 1; i < profile.employees; i++) {
    let name = person();
    while (usedNames.has(name)) name = person();
    usedNames.add(name);
    const dep = departments[i % departments.length];
    const titles = profile.departments[dep.name];
    const title = pick(r, titles);
    const role: Role = /Lead|Manager|Director|Controller|Supervisor/.test(title)
      ? i < 3 ? "Company Admin" : "Manager"
      : "Employee";
    employees.push({
      id: id("emp"),
      workspaceId: wsId,
      name,
      email: emailFor(name, `${profile.workspace.slug}.demo`),
      title,
      departmentId: dep.id,
      role,
      status: weighted(r, [["Active", 86], ["On leave", 6], ["Invited", 5], ["Inactive", 3]]),
      location: pick(r, CITIES)[0],
      joinedAt: daysAgo(int(r, 20, 900)),
      productivity: int(r, 58, 98),
    });
  }
  for (const dep of departments) {
    dep.leadId = employees.find((e) => e.departmentId === dep.id && e.role !== "Employee")?.id ??
      employees.find((e) => e.departmentId === dep.id)?.id;
  }
  const staff = employees.filter((e) => e.status === "Active");

  /* customers */
  const usedCo = new Set<string>();
  const customers: Customer[] = [];
  for (let i = 0; i < profile.customers; i++) {
    let company = `${pick(r, CO_A)} ${pick(r, CO_B)}`;
    while (usedCo.has(company)) company = `${pick(r, CO_A)} ${pick(r, CO_B)}`;
    usedCo.add(company);
    const name = person();
    const [city, country] = pick(r, CITIES);
    const status: CustomerStatus = weighted(r, [["Active", 58], ["Lead", 20], ["Inactive", 14], ["Churned", 8]]);
    const category: CustomerCategory = weighted(r, [["SMB", 40], ["Mid-market", 28], ["Startup", 20], ["Enterprise", 12]]);
    const domain = `${company.toLowerCase().replace(/[^a-z]/g, "").slice(0, 16)}.example`;
    const createdDays = int(r, 5, 720);
    const ltvScale = category === "Enterprise" ? 8 : category === "Mid-market" ? 4 : category === "SMB" ? 2 : 1.3;
    customers.push({
      id: id("cus"),
      workspaceId: wsId,
      name,
      company,
      email: emailFor(name, domain),
      phone: `+1 (555) ${int(r, 200, 989)}-${String(int(r, 1000, 9999))}`,
      status,
      category,
      ownerId: pick(r, staff).id,
      lifetimeValue: status === "Lead" ? 0 : Math.round((profile.revenueBase / 12) * ltvScale * (0.4 + r())),
      city,
      country,
      website: `https://${domain}`,
      industry: pick(r, CO_B),
      createdAt: daysAgo(createdDays),
      lastContactAt: daysAgo(int(r, 0, Math.min(60, createdDays))),
      notes: chance(r, 0.7)
        ? [
            {
              id: id("note"),
              body: pick(r, [
                "Prefers async updates over email; monthly check-in call works best.",
                "Interested in expanding scope next quarter — follow up after budget review.",
                "Procurement requires PO numbers on every invoice.",
                "Asked for a case-study style summary of results to share internally.",
                "Main decision maker is the COO; loop them into renewal conversations.",
              ]),
              author: pick(r, staff).name,
              createdAt: daysAgo(int(r, 1, 40)),
            },
          ]
        : [],
    });
  }
  const payingCustomers = customers.filter((c) => c.status === "Active" || c.status === "Inactive");

  /* deals */
  const deals: Deal[] = [];
  const dealCount = Math.round(profile.customers * 0.45);
  for (let i = 0; i < dealCount; i++) {
    const c = pick(r, customers);
    const stage: DealStage = weighted(r, [["Lead", 24], ["Qualified", 22], ["Proposal", 20], ["Negotiation", 16], ["Won", 18]]);
    deals.push({
      id: id("deal"),
      workspaceId: wsId,
      title: `${pick(r, profile.dealBank)} — ${c.company.split(" ")[0]}`,
      customerId: c.id,
      ownerId: pick(r, staff).id,
      value: Math.round((profile.revenueBase / 10) * (0.3 + r() * 1.6) / 100) * 100,
      stage,
      closeDate: stage === "Won" ? daysAgo(int(r, 2, 50)) : daysFromNow(int(r, 5, 80)),
    });
  }

  /* projects & tasks */
  const projects: Project[] = [];
  const tasks: Task[] = [];
  profile.projects.forEach((name, idx) => {
    const status: ProjectStatus = idx === profile.projects.length - 1
      ? "Completed"
      : idx === profile.projects.length - 2
        ? "On hold"
        : idx === 0 || idx === 3
          ? "Active"
          : weighted(r, [["Active", 60], ["Planning", 30], ["Completed", 10]]);
    const start = int(r, 20, 150);
    const memberIds = Array.from(new Set(Array.from({ length: int(r, 3, 6) }, () => pick(r, staff).id)));
    const project: Project = {
      id: id("prj"),
      workspaceId: wsId,
      name,
      description: `Illustrative ${profile.workspace.industry.toLowerCase()} initiative used to demonstrate planning, delivery tracking and team assignment in NexaFlow.`,
      customerId: chance(r, 0.75) ? pick(r, payingCustomers).id : undefined,
      status,
      priority: weighted<Priority>(r, [["Medium", 40], ["High", 30], ["Low", 15], ["Urgent", 15]]),
      startDate: daysAgo(start),
      dueDate: status === "Completed" ? daysAgo(int(r, 3, 15)) : daysFromNow(int(r, 6, 90)),
      memberIds,
      budget: Math.round((profile.revenueBase * (0.15 + r() * 0.5)) / 500) * 500,
    };
    projects.push(project);

    const count = int(r, 6, 11);
    const doneShare = status === "Completed" ? 1 : status === "Planning" ? 0.1 : status === "On hold" ? 0.35 : 0.2 + r() * 0.5;
    for (let t = 0; t < count; t++) {
      const roll = r();
      const tStatus: TaskStatus = roll < doneShare
        ? "completed"
        : weighted(r, [["todo", 40], ["in_progress", 35], ["in_review", 25]]);
      tasks.push({
        id: id("tsk"),
        workspaceId: wsId,
        projectId: project.id,
        title: pick(r, profile.taskBank),
        description: "Illustrative task. Details, acceptance criteria and links would live here.",
        status: tStatus,
        priority: weighted<Priority>(r, [["Medium", 45], ["High", 25], ["Low", 20], ["Urgent", 10]]),
        assigneeId: chance(r, 0.9) ? pick(r, memberIds) : undefined,
        dueDate: tStatus === "completed" ? daysAgo(int(r, 1, 30)) : daysFromNow(int(r, -4, 28)),
        createdAt: daysAgo(int(r, 1, start)),
      });
    }
  });

  /* invoices & payments */
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const invoiceCount = Math.round(profile.customers * 0.85);
  const year = new Date().getFullYear();
  for (let i = 0; i < invoiceCount; i++) {
    const c = pick(r, payingCustomers);
    const issued = int(r, 0, 170);
    const status = issued < 6
      ? weighted<Invoice["status"]>(r, [["Draft", 45], ["Pending", 55]])
      : weighted<Invoice["status"]>(r, [["Paid", 72], ["Pending", 28]]);
    const items: LineItem[] = Array.from({ length: int(r, 1, 4) }, () => {
      const [description, price] = pick(r, profile.services);
      const unitPrice = Math.round(price * (0.85 + r() * 0.3));
      const quantity = price < 500 ? int(r, 4, 40) : int(r, 1, 3);
      return { id: id("li"), description, quantity, unitPrice };
    });
    const inv: Invoice = {
      id: id("inv"),
      workspaceId: wsId,
      number: "",
      customerId: c.id,
      issueDate: daysAgo(issued),
      dueDate: daysAgo(issued - 30),
      status,
      items,
      taxRate: pick(r, [0, 5, 8.5, 10]),
      discount: chance(r, 0.25) ? pick(r, [5, 10]) : 0,
      notes: "Thank you for your business. Payment due within 30 days.",
    };
    invoices.push(inv);
  }
  invoices.sort((a, b) => a.issueDate.localeCompare(b.issueDate));
  invoices.forEach((inv, idx) => {
    inv.number = `INV-${year}-${String(idx + 1).padStart(4, "0")}`;
    const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const total = Math.round(subtotal * (1 - inv.discount / 100) * (1 + inv.taxRate / 100) * 100) / 100;
    const method = weighted<Payment["method"]>(r, [["Card", 55], ["ACH", 35], ["Wire", 10]]);
    const brand = pick(r, ["Visa", "Mastercard", "Amex"]);
    if (inv.status === "Paid") {
      const paidOffset = Math.max(0, Math.round((Date.now() - new Date(inv.issueDate).getTime()) / DAY) - int(r, 3, 28));
      inv.paidAt = daysAgo(paidOffset);
      payments.push({
        id: id("pay"),
        workspaceId: wsId,
        invoiceId: inv.id,
        customerId: inv.customerId,
        amount: total,
        method,
        status: chance(r, 0.04) ? "Refunded" : "Succeeded",
        reference: `pi_demo_${Math.floor(r() * 1e12).toString(36)}`,
        cardBrand: method === "Card" ? brand : undefined,
        last4: method === "Card" ? String(int(r, 1000, 9999)) : undefined,
        createdAt: inv.paidAt,
      });
    } else if (inv.status === "Pending" && chance(r, 0.18)) {
      payments.push({
        id: id("pay"),
        workspaceId: wsId,
        invoiceId: inv.id,
        customerId: inv.customerId,
        amount: total,
        method: "Card",
        status: chance(r, 0.5) ? "Failed" : "Processing",
        reference: `pi_demo_${Math.floor(r() * 1e12).toString(36)}`,
        cardBrand: brand,
        last4: String(int(r, 1000, 9999)),
        createdAt: daysAgo(int(r, 0, 5)),
      });
    }
  });
  payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  /* monthly metrics (12 months, oldest → newest) */
  const metrics: MonthlyMetric[] = [];
  const now = new Date();
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const i = 11 - m;
    const seasonal = 1 + Math.sin((d.getMonth() / 12) * Math.PI * 2) * 0.05;
    const revenue = Math.round(profile.revenueBase * (1 + profile.growth * i) * seasonal * (0.94 + r() * 0.12));
    const invoiced = Math.round(revenue * (1.02 + r() * 0.06));
    metrics.push({
      month: key,
      revenue,
      expenses: Math.round(revenue * (0.58 + r() * 0.1)),
      newCustomers: Math.round((profile.customers / 14) * (0.7 + r() * 0.8) + i * 0.2),
      churned: int(r, 0, Math.max(1, Math.round(profile.customers / 30))),
      invoiced,
      collected: Math.round(invoiced * (0.86 + r() * 0.11)),
    });
  }

  /* activity & notifications */
  const activityTemplates: [Activity["kind"], (a: string) => string][] = [
    ["customer", () => `added ${pick(r, customers).company} as a new customer`],
    ["deal", () => `moved “${pick(r, deals).title}” to ${pick(r, ["Proposal", "Negotiation", "Won"])}`],
    ["invoice", () => `sent ${pick(r, invoices).number} to ${pick(r, payingCustomers).company}`],
    ["payment", () => `recorded a payment from ${pick(r, payingCustomers).company}`],
    ["project", () => `updated the timeline for ${pick(r, projects).name}`],
    ["task", () => `completed “${pick(r, profile.taskBank)}”`],
    ["employee", () => `invited ${person()} to the workspace`],
  ];
  const activities: Activity[] = Array.from({ length: 24 }, (_, i) => {
    const [kind, msg] = pick(r, activityTemplates);
    const actor = pick(r, staff).name;
    return {
      id: id("act"),
      workspaceId: wsId,
      kind,
      actor,
      message: msg(actor),
      createdAt: daysAgo(i * 0.35 + r() * 0.3),
    };
  });

  const overdue = invoices.find((i) => i.status === "Pending" && new Date(i.dueDate).getTime() < Date.now());
  const notifications: Notification[] = [
    { id: id("ntf"), workspaceId: wsId, kind: "payment", title: "Payment received", body: `${payingCustomers[0]?.company} paid an invoice (simulated).`, read: false, createdAt: daysAgo(0.05) },
    { id: id("ntf"), workspaceId: wsId, kind: "task", title: "Task due tomorrow", body: `“${tasks.find((t) => t.status !== "completed")?.title}” is due soon.`, read: false, createdAt: daysAgo(0.3) },
    { id: id("ntf"), workspaceId: wsId, kind: "invoice", title: "Invoice overdue", body: `${overdue?.number ?? "An invoice"} is past its due date.`, read: false, createdAt: daysAgo(1.1) },
    { id: id("ntf"), workspaceId: wsId, kind: "deal", title: "Deal moved to Negotiation", body: deals.find((d) => d.stage === "Negotiation")?.title ?? "A deal advanced", read: true, createdAt: daysAgo(2) },
    { id: id("ntf"), workspaceId: wsId, kind: "employee", title: "New team member", body: `${employees[employees.length - 1].name} accepted their invite.`, read: true, createdAt: daysAgo(3.4) },
  ];

  return {
    customers,
    deals,
    departments,
    employees,
    projects,
    tasks,
    invoices,
    payments,
    activities,
    notifications,
    metrics,
    permissions: defaultPermissions(),
  };
}

export function buildDemoDatabase(): Record<string, WorkspaceData> {
  return Object.fromEntries(PROFILES.map((p) => [p.workspace.id, buildWorkspace(p)]));
}

/** Empty tenant for a workspace created during onboarding. */
export function buildEmptyWorkspace(owner: { name: string; email: string }, workspaceId: string, departmentNames: string[]): WorkspaceData {
  const departments: Department[] = departmentNames.map((name, i) => ({ id: `dep_${workspaceId.slice(3)}_${i}`, workspaceId, name }));
  const now = new Date();
  const metrics: MonthlyMetric[] = Array.from({ length: 12 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      revenue: 0, expenses: 0, newCustomers: 0, churned: 0, invoiced: 0, collected: 0,
    };
  });
  return {
    customers: [],
    deals: [],
    departments,
    employees: [
      {
        id: `emp_${workspaceId.slice(3)}_owner`,
        workspaceId,
        name: owner.name,
        email: owner.email,
        title: "Founder",
        departmentId: departments[0]?.id ?? "",
        role: "Super Admin",
        status: "Active",
        location: "—",
        joinedAt: now.toISOString(),
        productivity: 0,
      },
    ],
    projects: [],
    tasks: [],
    invoices: [],
    payments: [],
    activities: [],
    notifications: [
      { id: `ntf_${workspaceId}_welcome`, workspaceId, kind: "employee", title: "Workspace created", body: "Welcome to NexaFlow. Start by adding your first customer.", read: false, createdAt: now.toISOString() },
    ],
    metrics,
    permissions: defaultPermissions(),
  };
}
