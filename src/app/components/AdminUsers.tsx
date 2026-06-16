import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
  Shield,
  Eye,
  Settings,
  User,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

type Role = "admin" | "manager" | "viewer";

interface GaushalasUser {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    description: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  admin: {
    label: "Admin",
    description:
      "Full access: manage cows, users, all records, and system settings.",
    color: "bg-saffron/10 text-saffron border border-saffron/30",
    icon: <Settings className="w-3 h-3" />,
  },
  manager: {
    label: "Manager",
    description:
      "Can add & edit cow records, manage alerts, donations, and health data.",
    color: "bg-navy/10 text-navy border border-navy/20",
    icon: <Shield className="w-3 h-3" />,
  },
  viewer: {
    label: "Viewer",
    description:
      "Read-only access to all herd data, reports, and dashboards.",
    color: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: <Eye className="w-3 h-3" />,
  },
};

const inputCls =
  "w-full h-9 rounded-md border border-input bg-[#FFF8F0] px-3 py-1 text-sm text-foreground outline-none transition-[color,box-shadow] focus:ring-[3px] focus:ring-saffron/30 focus:border-saffron placeholder:text-muted-foreground/60";
const labelCls =
  "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";

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

function StatusBadge({ isVerified, isActive }: { isVerified: boolean; isActive: boolean }) {
  if (!isActive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-700 border border-red-200"
        style={{ fontSize: "0.7rem" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Inactive
      </span>
    );
  }
  if (!isVerified) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200"
        style={{ fontSize: "0.7rem" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200"
      style={{ fontSize: "0.7rem" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Approved
    </span>
  );
}

interface EditFormState {
  full_name: string;
  email: string;
  role: Role;
}

const EMPTY_EDIT_FORM: EditFormState = {
  full_name: "",
  email: "",
  role: "viewer",
};

export function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<GaushalasUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 4000);
  };

  const handleApprove = async (userId: string, approve: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_verified: approve }),
      });
      if (!res.ok) throw new Error("Failed to update approval");
      await fetchUsers();
      showSaved(approve ? "User approved successfully." : "User approval revoked.");
    } catch (err: any) {
      setError(err.message || "Operation failed");
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchUsers();
      showSaved(`User role updated to ${role}.`);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      setDeleteId(null);
      showSaved("User has been removed.");
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
  };

  const startEdit = (user: GaushalasUser) => {
    setEditingId(user.id);
    setEditForm({ full_name: user.full_name, email: user.email, role: user.role });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.role !== (users.find((u) => u.id === editingId)?.role)) {
      await handleRoleChange(editingId!, editForm.role);
    }
    setEditingId(null);
  };

  const adminCount = users.filter(
    (u) => u.role === "admin" && u.is_verified && u.is_active
  ).length;
  const managerCount = users.filter(
    (u) => u.role === "manager" && u.is_verified && u.is_active
  ).length;
  const viewerCount = users.filter(
    (u) => u.role === "viewer" && u.is_verified && u.is_active
  ).length;
  const pendingCount = users.filter((u) => !u.is_verified && u.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-saffron/30 border-t-saffron rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-foreground font-bold"
            style={{ fontSize: "1.4rem" }}
          >
            User Management
          </h1>
          <p
            className="text-muted-foreground mt-0.5"
            style={{ fontSize: "0.82rem" }}
          >
            Manage staff accounts, approve new users, assign roles, and control
            access levels.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p style={{ fontSize: "0.82rem" }}>{savedMsg}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <p style={{ fontSize: "0.82rem" }}>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Admins",
            count: adminCount,
            color: "from-saffron to-saffron-dark",
            icon: <Settings className="w-4 h-4 text-white" />,
          },
          {
            label: "Managers",
            count: managerCount,
            color: "from-navy to-navy-dark",
            icon: <Shield className="w-4 h-4 text-white" />,
          },
          {
            label: "Viewers",
            count: viewerCount,
            color: "from-gray-500 to-gray-700",
            icon: <Eye className="w-4 h-4 text-white" />,
          },
          {
            label: "Pending",
            count: pendingCount,
            color: "from-amber-400 to-amber-600",
            icon: <AlertTriangle className="w-4 h-4 text-white" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-saffron/10 p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}
            >
              {s.icon}
            </div>
            <div>
              <p
                className="font-bold text-foreground"
                style={{ fontSize: "1.3rem" }}
              >
                {s.count}
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.72rem" }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-saffron/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-saffron/10">
          <h3
            className="font-semibold text-foreground"
            style={{ fontSize: "0.9rem" }}
          >
            All Users
            <span
              className="ml-2 text-muted-foreground font-normal"
              style={{ fontSize: "0.78rem" }}
            >
              {users.length} accounts
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-saffron/10">
                <th
                  className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide"
                  style={{ fontSize: "0.68rem" }}
                >
                  User
                </th>
                <th
                  className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide"
                  style={{ fontSize: "0.68rem" }}
                >
                  Role
                </th>
                <th
                  className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide"
                  style={{ fontSize: "0.68rem" }}
                >
                  Status
                </th>
                <th
                  className="px-5 py-3 text-left text-muted-foreground font-medium uppercase tracking-wide"
                  style={{ fontSize: "0.68rem" }}
                >
                  Joined
                </th>
                <th
                  className="px-5 py-3 text-right text-muted-foreground font-medium uppercase tracking-wide"
                  style={{ fontSize: "0.68rem" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) =>
                editingId === user.id ? (
                  <tr
                    key={user.id}
                    className="border-b border-saffron/5 bg-saffron/5"
                  >
                    <td colSpan={5} className="px-5 py-4">
                      <form onSubmit={handleEditSave}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className={labelCls}>Name</label>
                            <input
                              required
                              className={inputCls}
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  full_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Email</label>
                            <input
                              required
                              type="email"
                              className={inputCls}
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Role</label>
                            <select
                              className={inputCls}
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  role: e.target.value as Role,
                                }))
                              }
                            >
                              {(["admin", "manager", "viewer"] as Role[]).map(
                                (r) => (
                                  <option key={r} value={r}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                  </option>
                                )
                              )}
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
                          <p
                            className="font-medium text-foreground"
                            style={{ fontSize: "0.82rem" }}
                          >
                            {user.full_name}
                          </p>
                          <p
                            className="text-muted-foreground"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        isVerified={user.is_verified}
                        isActive={user.is_active}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "0.78rem" }}
                      >
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
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
                        {!user.is_verified ? (
                          <button
                            onClick={() => handleApprove(user.id, true)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                            title="Approve user"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(user.id, false)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                            title="Revoke approval"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
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
              )}
            </tbody>
          </table>

          {users.length === 0 && (
            <div
              className="text-center py-12 text-muted-foreground"
              style={{ fontSize: "0.85rem" }}
            >
              No users found.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-saffron/10 p-5">
        <h4
          className="font-semibold text-foreground mb-4"
          style={{ fontSize: "0.9rem" }}
        >
          Access Level Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["admin", "manager", "viewer"] as Role[]).map((role) => {
            const cfg = ROLE_CONFIG[role];
            const permissions: Record<Role, string[]> = {
              admin: [
                "Full dashboard & all reports",
                "Add, edit & delete cow records",
                "Manage alerts & vaccination schedules",
                "View & manage donation records",
                "Approve, edit & remove users",
                "System configuration",
              ],
              manager: [
                "Full dashboard & all reports",
                "Add & edit cow records",
                "Manage alerts & vaccination schedules",
                "View & manage donation records",
                "View user list (no edit)",
              ],
              viewer: [
                "Full dashboard & all reports",
                "View cow records (read-only)",
                "View alerts (no edit)",
                "View donation records",
                "No access to administration",
              ],
            };
            return (
              <div
                key={role}
                className="rounded-lg bg-muted/20 border border-saffron/5 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <RoleBadge role={role} />
                </div>
                <ul className="space-y-1.5">
                  {permissions[role].map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "0.72rem" }}
                      >
                        {p}
                      </span>
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
