import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Save, X, Check, Shield, Eye, Settings, User } from "lucide-react";

type Role = "Admin" | "Manager" | "Viewer";
type Status = "Active" | "Inactive";

interface GaushalasUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
  department: string;
}

const INITIAL_USERS: GaushalasUser[] = [
  {
    id: "u1",
    name: "Shri Prakashbhai Joshi",
    email: "prakash.joshi@somnathtemple.org",
    role: "Admin",
    status: "Active",
    lastLogin: "2026-02-26",
    department: "Administration",
  },
  {
    id: "u2",
    name: "Smt. Hemlata Patel",
    email: "hemlata.patel@somnathtemple.org",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-02-25",
    department: "Herd Management",
  },
  {
    id: "u3",
    name: "Shri Dineshbhai Chauhan",
    email: "dinesh.chauhan@somnathtemple.org",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-02-24",
    department: "Health & Veterinary",
  },
  {
    id: "u4",
    name: "Smt. Komalben Shah",
    email: "komal.shah@somnathtemple.org",
    role: "Viewer",
    status: "Active",
    lastLogin: "2026-02-20",
    department: "Accounting",
  },
  {
    id: "u5",
    name: "Shri Bhaveshbhai Trivedi",
    email: "bhavesh.trivedi@somnathtemple.org",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2026-01-15",
    department: "Records",
  },
];

const ROLE_CONFIG: Record<Role, { label: string; description: string; chip: string; icon: React.ReactNode }> = {
  Admin: {
    label: "Admin",
    description: "Full access: manage cows, users, all records, and system settings.",
    chip: "bg-saffron/10 text-saffron border-saffron/20",
    icon: <Settings className="w-2.5 h-2.5" strokeWidth={2} />,
  },
  Manager: {
    label: "Manager",
    description: "Can add & edit cow records, manage alerts, donations, and health data.",
    chip: "bg-navy/10 text-navy border-navy/20 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    icon: <Shield className="w-2.5 h-2.5" strokeWidth={2} />,
  },
  Viewer: {
    label: "Viewer",
    description: "Read-only access to all herd data, reports, and dashboards.",
    chip: "bg-muted text-muted-foreground border-border",
    icon: <Eye className="w-2.5 h-2.5" strokeWidth={2} />,
  },
};

const inputCls =
  "w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15 placeholder:text-muted-foreground/60";
const labelCls = "block text-[0.72rem] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={`chip ${cfg.chip} text-[0.7rem]`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`chip text-[0.7rem] ${
      status === "Active"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

interface UserFormState {
  name: string;
  email: string;
  role: Role;
  status: Status;
  department: string;
}

const EMPTY_USER_FORM: UserFormState = {
  name: "",
  email: "",
  role: "Viewer",
  status: "Active",
  department: "",
};

export function AdminUsers() {
  const [users, setUsers] = useState<GaushalasUser[]>(INITIAL_USERS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [editForm, setEditForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 4000);
  };

  const setField = (key: keyof UserFormState, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const setEditField = (key: keyof UserFormState, val: string) =>
    setEditForm(f => ({ ...f, [key]: val }));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: GaushalasUser = {
      id: `u${Date.now()}`,
      ...form,
      lastLogin: "—",
    };
    setUsers(u => [...u, newUser]);
    setForm(EMPTY_USER_FORM);
    setShowAddForm(false);
    showSaved(`User "${form.name}" added successfully.`);
  };

  const startEdit = (user: GaushalasUser) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(u =>
      u.map(user =>
        user.id === editingId ? { ...user, ...editForm } : user
      )
    );
    showSaved("User record updated successfully.");
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(u => u.filter(x => x.id !== id));
    setDeleteId(null);
    if (user) showSaved(`User "${user.name}" has been removed.`);
  };

  const adminCount = users.filter(u => u.role === "Admin" && u.status === "Active").length;
  const managerCount = users.filter(u => u.role === "Manager" && u.status === "Active").length;
  const viewerCount = users.filter(u => u.role === "Viewer" && u.status === "Active").length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-3"
      >
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] mt-1">
            User management
          </h1>
          <p className="text-[0.82rem] text-muted-foreground mt-1">
            Manage staff accounts, assign roles, and control access levels.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="h-8 px-3 rounded-md bg-foreground text-background text-[0.82rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3 h-3" strokeWidth={2} /> Add user
          </button>
        )}
      </motion.div>

      {savedMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20 rounded-lg px-4 py-3">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
          <p className="text-[0.85rem] font-medium">{savedMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Admins", count: adminCount, accent: "saffron", icon: Settings },
          { label: "Managers", count: managerCount, accent: "navy", icon: Shield },
          { label: "Viewers", count: viewerCount, accent: "slate", icon: Eye },
        ].map(s => {
          const ACC: Record<string, { bg: string; text: string; ring: string }> = {
            saffron: { bg: "bg-saffron/10", text: "text-saffron", ring: "ring-saffron/20" },
            navy:    { bg: "bg-navy/10", text: "text-navy dark:text-blue-300", ring: "ring-navy/20 dark:ring-blue-500/20" },
            slate:   { bg: "bg-slate-100 dark:bg-slate-500/15", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-200/60 dark:ring-slate-500/20" },
          };
          const a = ACC[s.accent];
          const Icon = s.icon;
          return (
            <div key={s.label} className="surface p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${a.bg} ${a.text} ring-1 ${a.ring} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[1.35rem] font-semibold text-foreground leading-none tabular">{s.count}</p>
                <p className="text-[0.72rem] text-muted-foreground mt-1.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="surface p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-foreground text-[0.95rem]">New user</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                required
                className={inputCls}
                placeholder="e.g. Shri Rameshbhai Patel"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                required
                type="email"
                className={inputCls}
                placeholder="name@somnathtemple.org"
                value={form.email}
                onChange={e => setField("email", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <input
                className={inputCls}
                placeholder="e.g. Herd Management"
                value={form.department}
                onChange={e => setField("department", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Role & Access Level</label>
              <select
                className={inputCls}
                value={form.role}
                onChange={e => setField("role", e.target.value as Role)}
              >
                {(["Admin", "Manager", "Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="surface-soft p-3">
            <p className="text-[0.78rem] text-muted-foreground">
              <span className="font-semibold text-foreground">{ROLE_CONFIG[form.role].label}:</span>{" "}
              {ROLE_CONFIG[form.role].description}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-9 px-4 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors text-[0.85rem] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-foreground text-background text-[0.85rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Create user
            </button>
          </div>
        </form>
      )}

      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-[0.95rem]">All users</h3>
          <span className="text-[0.78rem] text-muted-foreground tabular">{users.length} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-5 py-2.5 text-left text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">User</th>
                <th className="px-5 py-2.5 text-left text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">Department</th>
                <th className="px-5 py-2.5 text-left text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">Role</th>
                <th className="px-5 py-2.5 text-left text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">Status</th>
                <th className="px-5 py-2.5 text-left text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">Last Login</th>
                <th className="px-5 py-2.5 text-right text-muted-foreground font-medium uppercase tracking-wider text-[0.65rem]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                editingId === user.id ? (
                  <tr key={user.id} className="border-b border-border/60 bg-saffron/5">
                    <td colSpan={6} className="px-5 py-4">
                      <form onSubmit={handleEditSave}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <label className={labelCls}>Full Name</label>
                            <input
                              required
                              className={inputCls}
                              value={editForm.name}
                              onChange={e => setEditField("name", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Email</label>
                            <input
                              required
                              type="email"
                              className={inputCls}
                              value={editForm.email}
                              onChange={e => setEditField("email", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Department</label>
                            <input
                              className={inputCls}
                              value={editForm.department}
                              onChange={e => setEditField("department", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Role</label>
                            <select
                              className={inputCls}
                              value={editForm.role}
                              onChange={e => setEditField("role", e.target.value as Role)}
                            >
                              {(["Admin", "Manager", "Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Status</label>
                            <select
                              className={inputCls}
                              value={editForm.status}
                              onChange={e => setEditField("status", e.target.value as Status)}
                            >
                              <option>Active</option>
                              <option>Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="h-8 px-3.5 rounded-md bg-foreground text-background text-[0.82rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="h-8 px-3.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors text-[0.82rem] font-medium inline-flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={user.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy/10 text-navy dark:bg-blue-500/10 dark:text-blue-300 ring-1 ring-navy/20 dark:ring-blue-500/20 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-[0.85rem] truncate">{user.name}</p>
                          <p className="text-muted-foreground text-[0.72rem] truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[0.8rem] text-muted-foreground">{user.department || "—"}</td>
                    <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-5 py-3 text-[0.8rem] text-muted-foreground tabular">
                      {user.lastLogin === "—" ? "—" : new Date(user.lastLogin).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(user)}
                          className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                          title="Edit user"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleteId === user.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                              title="Confirm remove"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="h-7 w-7 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors flex items-center justify-center"
                            title="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-[0.85rem]">
              No users found.
            </div>
          )}
        </div>
      </div>

      <div className="surface p-5">
        <h4 className="font-semibold text-foreground mb-4 text-[0.95rem]">
          Access Level Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["Admin", "Manager", "Viewer"] as Role[]).map(role => {
            const cfg = ROLE_CONFIG[role];
            const permissions: Record<Role, string[]> = {
              Admin: [
                "Full dashboard & all reports",
                "Add, edit & delete cow records",
                "Manage alerts & vaccination schedules",
                "View & manage donation records",
                "Create, edit & remove users",
                "System configuration",
              ],
              Manager: [
                "Full dashboard & all reports",
                "Add & edit cow records",
                "Manage alerts & vaccination schedules",
                "View & manage donation records",
                "View user list (no edit)",
              ],
              Viewer: [
                "Full dashboard & all reports",
                "View cow records (read-only)",
                "View alerts (no edit)",
                "View donation records",
                "No access to administration",
              ],
            };
            return (
              <div key={role} className="rounded-lg bg-muted/20 border border-saffron/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <RoleBadge role={role} />
                </div>
                <ul className="space-y-1.5">
                  {permissions[role].map(p => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
