import { useEffect, useMemo, useState } from 'react';
import { Search, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminService, AdminUserRecord } from '../../lib/services';

const ADMIN_USERS_STORAGE_KEY = 'fintech.admin.users';

interface CreateUserFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  balance: string;
}

interface EditUserFormState {
  fullName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  balance: string;
}

const INITIAL_CREATE_FORM: CreateUserFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  balance: '0',
};

function loadStoredUsers() {
  if (typeof window === 'undefined') {
    return [] as AdminUserRecord[];
  }

  const raw = window.localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
  if (!raw) {
    return [] as AdminUserRecord[];
  }

  try {
    const parsed = JSON.parse(raw) as AdminUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(ADMIN_USERS_STORAGE_KEY);
    return [] as AdminUserRecord[];
  }
}

function saveStoredUsers(users: AdminUserRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
}

function mergeUsers(remoteUsers: AdminUserRecord[], storedUsers: AdminUserRecord[]) {
  const merged = new Map<string, AdminUserRecord>();

  for (const user of remoteUsers) {
    merged.set(user.id, user);
  }

  for (const user of storedUsers) {
    merged.set(user.id, user);
  }

  return Array.from(merged.values());
}

export function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(INITIAL_CREATE_FORM);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditUserFormState>({
    fullName: '',
    email: '',
    phone: '',
    status: 'Active',
    balance: '0',
  });
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminService.getUsers();
        const storedUsers = loadStoredUsers();

        if (!active) {
          return;
        }

        setUsers(mergeUsers(data, storedUsers));
      } catch (err) {
        if (active) {
          const storedUsers = loadStoredUsers();
          setUsers(storedUsers);
          setError(
            storedUsers.length > 0
              ? 'Loaded saved browser data because the server users request failed.'
              : err instanceof Error
                ? err.message
                : 'Unable to load users.',
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  async function reloadUsers() {
    try {
      const data = await adminService.getUsers();
      const storedUsers = loadStoredUsers();
      setUsers(mergeUsers(data, storedUsers));
    } catch {
      setUsers(loadStoredUsers());
    }
  }

  function upsertStoredUser(nextUser: AdminUserRecord) {
    const storedUsers = loadStoredUsers();
    const nextStoredUsers = mergeUsers(
      storedUsers.filter((user) => user.id !== nextUser.id),
      [nextUser],
    );
    saveStoredUsers(nextStoredUsers);
    setUsers((current) => mergeUsers(current.filter((user) => user.id !== nextUser.id), [nextUser]));
  }

  async function toggleStatus(userId: string, status: string) {
    const nextStatus = status === 'Active' ? 'SUSPENDED' : 'ACTIVE';
    const nextLabel = nextStatus === 'ACTIVE' ? 'Active' : 'Suspended';
    const currentUser = users.find((user) => user.id === userId);

    if (!currentUser) {
      return;
    }

    try {
      setError('');
      upsertStoredUser({ ...currentUser, status: nextLabel });
      try {
        await adminService.updateUserStatus(userId, nextStatus);
      } catch {
        setError('Status updated locally and saved in your browser.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user status.');
    }
  }

  async function openEditModal(user: AdminUserRecord) {
    setEditingUserId(user.id);
    setEditForm({
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status === 'Suspended' ? 'Suspended' : 'Active',
      balance: String(user.balance),
    });

    try {
      setEditError('');
      const details = await adminService.getUserById(user.id);
      setEditForm({
        fullName: details.name,
        email: details.email,
        phone: details.phone,
        status: details.status === 'Suspended' ? 'Suspended' : 'Active',
        balance: String(details.balance),
      });
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Unable to load user details.');
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();

    if (!editingUserId) {
      return;
    }

    const balance = Number(editForm.balance);
    if (!Number.isFinite(balance) || balance < 0) {
      setEditError('Balance must be a valid non-negative number.');
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError('');
      const currentUser = users.find((user) => user.id === editingUserId) ?? null;
      const updatedUser: AdminUserRecord = {
        id: editingUserId,
        name: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        balance,
        status: editForm.status,
        joined: currentUser?.joined ?? new Date().toLocaleString(),
      };

      upsertStoredUser(updatedUser);

      try {
        await adminService.updateUser(editingUserId, {
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          amount: balance.toFixed(2),
        });
      } catch {
        setEditError('Saved locally in your browser. Server update failed.');
      }

      const nextStatus = editForm.status === 'Active' ? 'ACTIVE' : 'SUSPENDED';
      const currentStatus = currentUser?.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE';
      if (currentUser && currentStatus !== nextStatus) {
        try {
          await adminService.updateUserStatus(editingUserId, nextStatus);
        } catch {
          setEditError('Saved locally in your browser. Server update failed.');
        }
      }

      setEditingUserId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Unable to update user.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    const balance = Number(createForm.balance);
    if (!Number.isFinite(balance) || balance < 0) {
      setCreateError('Balance must be a valid non-negative number.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      const createdUser: AdminUserRecord = {
        id: `local-${Date.now()}`,
        name: createForm.fullName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        balance,
        status: 'Active',
        joined: new Date().toLocaleString(),
      };

      upsertStoredUser(createdUser);

      try {
        await adminService.createUser({
          fullName: createForm.fullName.trim(),
          email: createForm.email.trim(),
          phone: createForm.phone.trim(),
          password: createForm.password,
          balance: balance.toFixed(2),
        });
        await reloadUsers();
      } catch {
        setCreateError('User saved locally in your browser. Server create request failed.');
      }

      setShowCreateModal(false);
      setCreateForm(INITIAL_CREATE_FORM);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to create user.');
    } finally {
      setIsCreating(false);
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, users],
  );
  const selectedUser = selectedUserId ? users.find((user) => user.id === selectedUserId) ?? null : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Users Management
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage all user accounts</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setShowCreateModal(true);
          }}
          className="px-6 py-3 rounded-lg bg-[#c9a84c] text-[#0a0e1a] hover:bg-[#b89640] transition-all hover:scale-105"
        >
          Add User
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Name
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Email
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Balance
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Joined
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading users...
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No users found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4" style={{ color: '#ffffff' }}>
                      {user.name}
                    </td>
                    <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {user.email}
                    </td>
                    <td className="p-4 text-right" style={{ color: '#c9a84c' }}>
                      ${user.balance.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-[#ef4444]/20 text-[#ef4444]'
                        }`}
                        style={{ fontSize: '14px' }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {user.joined}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="px-3 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => void toggleStatus(user.id, user.status)}
                          className="px-3 py-1 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm"
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/15 transition-all text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="p-2 rounded hover:bg-white/10 transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedUserId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32] to-[#0a0e1a] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  User Details
                </h2>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>Name</div>
                  <div style={{ color: '#ffffff' }}>{selectedUser.name}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>Email</div>
                  <div style={{ color: '#ffffff' }}>{selectedUser.email}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>Status</div>
                    <div style={{ color: selectedUser.status === 'Active' ? '#10b981' : '#ef4444' }}>
                      {selectedUser.status}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>Joined</div>
                    <div style={{ color: '#ffffff' }}>{selectedUser.joined}</div>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>Balance</div>
                  <div style={{ color: '#c9a84c' }}>${selectedUser.balance.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg bg-[#c9a84c] px-5 py-2 font-medium text-[#0a0e1a] transition-colors hover:bg-[#b89640]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32] to-[#0a0e1a] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  Add User
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {createError && (
                  <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Full Name
                  </label>
                  <input
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm((current) => ({ ...current, fullName: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((current) => ({ ...current, email: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.balance}
                    onChange={(e) => setCreateForm((current) => ({ ...current, balance: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Phone Number
                  </label>
                  <input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((current) => ({ ...current, phone: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="+1 555 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((current) => ({ ...current, password: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="Set temporary password"
                    required
                    minLength={8}
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-white/80 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-lg bg-[#c9a84c] px-5 py-2 font-medium text-[#0a0e1a] transition-colors hover:bg-[#b89640] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCreating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {editingUserId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setEditingUserId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32] to-[#0a0e1a] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  Edit User
                </h2>
                <button
                  onClick={() => setEditingUserId(null)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                {editError && (
                  <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Full Name
                  </label>
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((current) => ({ ...current, fullName: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((current) => ({ ...current, email: e.target.value }))}
                    className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          status: e.target.value === 'Suspended' ? 'Suspended' : 'Active',
                        }))
                      }
                      className="w-full rounded-lg border border-[#c9a84c]/20 bg-[#141e32] px-4 py-3 text-white focus:border-[#c9a84c] focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      Balance
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.balance}
                      onChange={(e) => setEditForm((current) => ({ ...current, balance: e.target.value }))}
                      className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-white/80 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="rounded-lg bg-[#c9a84c] px-5 py-2 font-medium text-[#0a0e1a] transition-colors hover:bg-[#b89640] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
