import { useState } from "react";
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

const ROLE_CONFIG: Record<Role, { label: string; description: string; color: string; icon: React.ReactNode }> = {
  Admin: {
    label: "Admin",
    description: "Full access: manage cows, users, all records, and system settings.",
    color: "bg-saffron/10 text-saffron border border-saffron/30",
    icon: <Settings className="w-3 h-3" />,
  },
  Manager: {
    label: "Manager",
    description: "Can add & edit cow records, manage alerts, donations, and health data.",
    color: "bg-navy/10 text-navy border border-navy/20",
    icon: <Shield className="w-3 h-3" />,
  },
  Viewer: {
    label: "Viewer",
    description: "Read-only access to all herd data, reports, and dashboards.",
    color: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: <Eye className="w-3 h-3" />,
  },
};

const inputCls =
  "w-full h-9 rounded-md border border-input bg-[#FFF8F0] px-3 py-1 text-sm text-foreground outline-none transition-[color,box-shadow] focus:ring-[3px] focus:ring-saffron/30 focus:border-saffron placeholder:text-muted-foreground/60";
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${cfg.color}`}
      style={{ fontSize: "0.7rem" }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
        status === "Active"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
      style={{ fontSize: "0.7rem" }}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
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
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground font-bold" style={{ fontSize: "1.4rem" }}>
            User Management
          </h1>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.82rem" }}>
            Manage staff accounts, assign roles, and control access levels for the GauShala system.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-saffron/20 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Save Banner */}
      {savedMsg && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p style={{ fontSize: "0.82rem" }}>{savedMsg}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Admins", count: adminCount, color: "from-saffron to-saffron-dark", icon: <Settings className="w-4 h-4 text-white" /> },
          { label: "Managers", count: managerCount, color: "from-navy to-navy-dark", icon: <Shield className="w-4 h-4 text-white" /> },
          { label: "Viewers", count: viewerCount, color: "from-gray-500 to-gray-700", icon: <Eye className="w-4 h-4 text-white" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-saffron/10 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="font-bold text-foreground" style={{ fontSize: "1.3rem" }}>{s.count}</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-saffron/10 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-foreground" style={{ fontSize: "0.9rem" }}>
              New User
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
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

          {/* Role explanation */}
          <div className="bg-muted/30 rounded-lg p-3 border border-saffron/5">
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
              <span className="font-semibold text-foreground">{ROLE_CONFIG[form.role].label}:</span>{" "}
              {ROLE_CONFIG[form.role].description}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-saffron/20 text-muted-foreground hover:bg-muted/30 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md shadow-saffron/20 text-sm"
            >
              <Save className="w-4 h-4" /> Create User
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-saffron/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-saffron/10">
          <h3 className="font-semibold text-foreground" style={{ fontSize: "0.9rem" }}>
            All Users
            <span className="ml-2 text-muted-foreground font-normal" style={{ fontSize: "0.78rem" }}>
              {users.length} accounts
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-saffron/10">
                <th className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>User</th>
                <th className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>Department</th>
                <th className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>Role</th>
                <th className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>Status</th>
                <th className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>Last Login</th>
                <th className="px-5 py-3 text-right text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: "0.68rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                editingId === user.id ? (
                  /* Inline edit row */
                  <tr key={user.id} className="border-b border-saffron/5 bg-saffron/5">
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
                            className="flex items-center gap-1.5 bg-saffron hover:bg-saffron-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-saffron/20 text-muted-foreground hover:bg-muted/30 transition-colors text-sm"
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
                    className="border-b border-saffron/5 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground" style={{ fontSize: "0.82rem" }}>{user.name}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "0.68rem" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-muted-foreground" style={{ fontSize: "0.78rem" }}>
                        {user.department || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-muted-foreground" style={{ fontSize: "0.78rem" }}>
                        {user.lastLogin === "—" ? "—" : new Date(user.lastLogin).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-saffron/10 text-muted-foreground hover:text-saffron transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleteId === user.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Confirm remove"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
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
            <div className="text-center py-12 text-muted-foreground" style={{ fontSize: "0.85rem" }}>
              No users found.
            </div>
          )}
        </div>
      </div>

      {/* Access Level Reference */}
      <div className="bg-white rounded-xl border border-saffron/10 p-5">
        <h4 className="font-semibold text-foreground mb-4" style={{ fontSize: "0.9rem" }}>
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
