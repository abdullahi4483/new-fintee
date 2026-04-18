import {
  apiRequest,
  formatApiDate,
  loadSession,
  pickArray,
  pickObject,
  readNumber,
  readString,
  unwrapData,
} from "./api";

const ADMIN_USERS_STORAGE_KEY = "fintech.admin.users";

export interface SummaryMetric {
  label: string;
  value: string;
  change?: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  growth: string;
  accountNumber: string;
}

export interface TransactionRecord {
  id: string;
  user?: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  description: string;
}

export interface CardRecord {
  id: string;
  cardHolder: string;
  last4: string;
  expiry: string;
  cvv: string;
  type: string;
  brand: string;
  spendingLimit: number;
  currentUsage: number;
  currency: string;
  frozen: boolean;
}

export interface SupportMessageRecord {
  id: string;
  user: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  date: string;
}

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PreferenceSettings {
  language: string;
  currency: string;
}

export interface AdminSettingsRecord {
  platformName: string;
  supportEmail: string;
  adminEmail: string;
  emailNotifications: boolean;
  withdrawalManualThreshold: string;
  autoApproveEnabled: boolean;
  autoApproveMaxAmount: string;
  sessionTimeoutMinutes: number;
  apiRateLimitPerHour: number;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  status: string;
  joined: string;
}

function toCurrency(value: unknown, fallback = "USD") {
  const raw = readString(value, fallback);
  return raw.toUpperCase();
}

function toMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function upper(value: unknown, fallback = "Unknown") {
  const text = readString(value, fallback);
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapAccount(raw: Record<string, unknown>, index = 0): AccountRecord {
  const balance = readNumber(raw.balance ?? raw.availableBalance ?? raw.amount);
  const currency = toCurrency(raw.currency);
  return {
    id: readString(raw.id ?? raw._id ?? raw.accountId, `account-${index + 1}`),
    name: readString(raw.name ?? raw.accountName, `Account ${index + 1}`),
    type: upper(raw.type, "Account"),
    balance,
    currency,
    growth: readString(raw.growth ?? raw.change ?? raw.performance ?? "0%"),
    accountNumber: readString(raw.accountNumber ?? raw.maskedAccountNumber ?? raw.number, "N/A"),
  };
}

function mapTransaction(raw: Record<string, unknown>, index = 0): TransactionRecord {
  return {
    id: readString(raw.id ?? raw._id ?? raw.transactionId, `txn-${index + 1}`),
    user: readString(
      (raw.user as Record<string, unknown> | undefined)?.fullName ??
        (raw.user as Record<string, unknown> | undefined)?.name ??
        raw.userName,
    ),
    date: formatApiDate(raw.createdAt ?? raw.date ?? raw.updatedAt),
    amount: readNumber(raw.amount),
    type: upper(raw.type, "Transaction"),
    status: upper(raw.status, "Unknown"),
    description: readString(raw.description ?? raw.narration ?? raw.reference ?? raw.type, "Transaction"),
  };
}

function mapCard(raw: Record<string, unknown>, index = 0): CardRecord {
  const spendingLimit = readNumber(raw.spendingLimit ?? raw.limit ?? raw.monthlyLimit);
  const currentUsage = readNumber(raw.currentUsage ?? raw.usedAmount ?? raw.spentAmount);
  return {
    id: readString(raw.id ?? raw._id ?? raw.cardId, `card-${index + 1}`),
    cardHolder: readString(raw.cardHolder ?? raw.holderName ?? raw.name, "Card Holder"),
    last4: readString(raw.last4 ?? raw.lastFour ?? raw.maskedNumber, "0000").slice(-4),
    expiry: readString(raw.expiryDate ?? raw.expiry ?? raw.expiresAt, "12/30"),
    cvv: readString(raw.cvv ?? raw.cvc ?? "***", "***"),
    type: upper(raw.type ?? raw.cardType, "Virtual"),
    brand: upper(raw.brand ?? raw.network, "Card"),
    spendingLimit,
    currentUsage,
    currency: toCurrency(raw.currency),
    frozen: Boolean(raw.isFrozen ?? raw.frozen ?? raw.status === "FROZEN"),
  };
}

function mapSupportMessage(raw: Record<string, unknown>, index = 0): SupportMessageRecord {
  const user = (raw.user as Record<string, unknown> | undefined) || {};
  return {
    id: readString(raw.id ?? raw._id ?? raw.messageId, `message-${index + 1}`),
    user: readString(user.fullName ?? user.name ?? raw.userName, "Customer"),
    email: readString(user.email ?? raw.email, "N/A"),
    category: upper(raw.category, "General"),
    subject: readString(raw.subject, "Support Request"),
    message: readString(raw.message ?? raw.body, ""),
    status: upper(raw.status, "Pending"),
    date: formatApiDate(raw.createdAt ?? raw.date ?? raw.updatedAt),
  };
}

function mapAdminSettings(raw: Record<string, unknown>): AdminSettingsRecord {
  return {
    platformName: readString(raw.platformName, "Fintech"),
    supportEmail: readString(raw.supportEmail, "support@fintech.com"),
    adminEmail: readString(raw.adminEmail, "admin@fintech.com"),
    emailNotifications: Boolean(raw.emailNotifications ?? raw.notificationsEnabled ?? raw.sendAdminEmails),
    withdrawalManualThreshold: String(raw.withdrawalManualThreshold ?? "10000"),
    autoApproveEnabled: Boolean(raw.autoApproveEnabled),
    autoApproveMaxAmount: String(raw.autoApproveMaxAmount ?? "1000"),
    sessionTimeoutMinutes: readNumber(raw.sessionTimeoutMinutes, 30),
    apiRateLimitPerHour: readNumber(raw.apiRateLimitPerHour, 1000),
  };
}

function loadStoredAdminUsers() {
  if (typeof window === "undefined") {
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
    return [] as AdminUserRecord[];
  }
}

function findCurrentClientOverride() {
  const session = loadSession();
  const storedUsers = loadStoredAdminUsers();

  return (
    storedUsers.find((user) => {
      if (session?.user?.id && user.id === session.user.id) {
        return true;
      }

      if (session?.user?.email && user.email.toLowerCase() === session.user.email.toLowerCase()) {
        return true;
      }

      return false;
    }) ?? null
  );
}

function applyClientBalanceOverrideToAccounts(accounts: AccountRecord[]) {
  const override = findCurrentClientOverride();
  if (!override || accounts.length === 0) {
    return accounts;
  }

  return accounts.map((account, index) =>
    index === 0
      ? {
          ...account,
          balance: override.balance,
        }
      : account,
  );
}

export const authService = {
  changePassword(input: { currentPassword: string; newPassword: string }) {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: input,
    });
  },
};

export const customerService = {
  async getDashboardSummary() {
    const payload = await apiRequest("/dashboard/summary");
    const summary = pickObject<Record<string, unknown>>(payload, ["summary", "dashboard"]);

    const accounts = applyClientBalanceOverrideToAccounts(
      pickArray<Record<string, unknown>>(payload, ["accounts"]).map(mapAccount),
    );
    const recentTransactions = pickArray<Record<string, unknown>>(payload, [
      "recentTransactions",
      "transactions",
    ]).map(mapTransaction);
    const override = findCurrentClientOverride();

    return {
      greetingName: readString(
        override?.name ?? summary.fullName ?? summary.name ?? summary.userName,
        "Customer",
      ),
      totalBalance: override?.balance ?? readNumber(summary.totalBalance ?? summary.balance),
      balanceChange: readString(summary.balanceChange ?? summary.change ?? "0%"),
      totalSpent: readNumber(summary.totalSpent ?? summary.monthlySpend),
      currency: toCurrency(summary.currency),
      accounts,
      recentTransactions,
    };
  },
  async getAccounts() {
    const payload = await apiRequest("/accounts");
    return applyClientBalanceOverrideToAccounts(
      pickArray<Record<string, unknown>>(payload, ["accounts"]).map(mapAccount),
    );
  },
  async getTransactions() {
    const payload = await apiRequest("/transactions?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["transactions"]).map(mapTransaction);
  },
  async getCards() {
    const payload = await apiRequest("/cards");
    return pickArray<Record<string, unknown>>(payload, ["cards"]).map(mapCard);
  },
  freezeCard(cardId: string) {
    return apiRequest(`/cards/${cardId}/freeze`, { method: "PATCH" });
  },
  unfreezeCard(cardId: string) {
    return apiRequest(`/cards/${cardId}/unfreeze`, { method: "PATCH" });
  },
  replaceCard(cardId: string, reason: string) {
    return apiRequest(`/cards/${cardId}/replace`, {
      method: "POST",
      body: { reason },
    });
  },
  createWithdrawal(input: { accountId: string; amount: string; currency: string }) {
    return apiRequest("/withdrawals", {
      method: "POST",
      body: input,
    });
  },
  async getWithdrawals() {
    const payload = await apiRequest("/withdrawals?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["withdrawals"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.withdrawalId, `withdrawal-${index + 1}`),
      amount: readNumber(raw.amount),
      currency: toCurrency(raw.currency),
      status: upper(raw.status, "Pending"),
      date: formatApiDate(raw.createdAt ?? raw.date),
      accountId: readString(raw.accountId),
    }));
  },
  async getSupportMessages() {
    const payload = await apiRequest("/support/messages?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["messages"]).map(mapSupportMessage);
  },
  sendSupportMessage(input: { category: string; subject: string; message: string }) {
    return apiRequest("/support/messages", {
      method: "POST",
      body: input,
    });
  },
  async getProfile() {
    const payload = await apiRequest("/settings/profile");
    const profile = pickObject<Record<string, unknown>>(payload, ["profile"]);
    return {
      fullName: readString(profile.fullName ?? profile.name),
      email: readString(profile.email),
      phone: readString(profile.phone),
    } satisfies ProfileSettings;
  },
  updateProfile(input: ProfileSettings) {
    return apiRequest("/settings/profile", {
      method: "PATCH",
      body: input,
    });
  },
  async getSecurity() {
    const payload = await apiRequest("/settings/security");
    const security = pickObject<Record<string, unknown>>(payload, ["security"]);
    return {
      twoFactorEnabled: Boolean(security.twoFactorEnabled),
    } satisfies SecuritySettings;
  },
  updateSecurity(input: SecuritySettings) {
    return apiRequest("/settings/security", {
      method: "PATCH",
      body: input,
    });
  },
  async getNotifications() {
    const payload = await apiRequest("/settings/notifications");
    const notifications = pickObject<Record<string, unknown>>(payload, ["notifications"]);
    return {
      emailNotifications: Boolean(notifications.emailNotifications),
      pushNotifications: Boolean(notifications.pushNotifications),
    } satisfies NotificationSettings;
  },
  updateNotifications(input: NotificationSettings) {
    return apiRequest("/settings/notifications", {
      method: "PATCH",
      body: input,
    });
  },
  async getPreferences() {
    const payload = await apiRequest("/settings/preferences");
    const preferences = pickObject<Record<string, unknown>>(payload, ["preferences"]);
    return {
      language: readString(preferences.language, "en"),
      currency: toCurrency(preferences.currency),
    } satisfies PreferenceSettings;
  },
  updatePreferences(input: PreferenceSettings) {
    return apiRequest("/settings/preferences", {
      method: "PATCH",
      body: input,
    });
  },
};

export const adminService = {
  async getDashboardSummary() {
    const payload = await apiRequest("/admin/dashboard/summary");
    const summary = pickObject<Record<string, unknown>>(payload, ["summary", "dashboard"]);
    const stats = pickArray<Record<string, unknown>>(payload, ["stats"]);
    const activity = pickArray<Record<string, unknown>>(payload, [
      "recentActivity",
      "activities",
      "recentEvents",
    ]);

    const metrics =
      stats.length > 0
        ? stats.map((raw, index) => ({
            label: readString(raw.label, `Metric ${index + 1}`),
            value: readString(raw.value, "0"),
            change: readString(raw.change),
          }))
        : [
            { label: "Total Users", value: String(summary.totalUsers ?? 0), change: readString(summary.usersChange) },
            { label: "Total Deposits", value: String(summary.totalDeposits ?? 0), change: readString(summary.depositsChange) },
            { label: "Pending Withdrawals", value: String(summary.pendingWithdrawals ?? 0), change: readString(summary.withdrawalsChange) },
            { label: "Revenue", value: String(summary.revenue ?? 0), change: readString(summary.revenueChange) },
          ];

    return {
      metrics,
      recentActivity: activity.map((raw, index) => ({
        id: readString(raw.id ?? raw._id, `activity-${index + 1}`),
        user: readString(raw.userName ?? (raw.user as Record<string, unknown> | undefined)?.fullName, "User"),
        action: readString(raw.action ?? raw.description, "Activity"),
        amount: readString(raw.amount, "-"),
        time: formatApiDate(raw.createdAt ?? raw.date),
      })),
    };
  },
  async getUsers() {
    const payload = await apiRequest("/admin/users?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["users"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.userId, `user-${index + 1}`),
      name: readString(raw.fullName ?? raw.name, "User"),
      email: readString(raw.email),
      phone: readString(raw.phone),
      balance: readNumber(raw.balance ?? raw.totalBalance),
      status: upper(raw.status, "Unknown"),
      joined: formatApiDate(raw.createdAt ?? raw.joinedAt),
    })) as AdminUserRecord[];
  },
  async getUserById(userId: string) {
    const payload = await apiRequest(`/admin/users/${userId}`);
    const raw = pickObject<Record<string, unknown>>(payload, ["user", "profile"]);
    return {
      id: readString(raw.id ?? raw._id ?? raw.userId, userId),
      name: readString(raw.fullName ?? raw.name, "User"),
      email: readString(raw.email),
      phone: readString(raw.phone),
      balance: readNumber(raw.balance ?? raw.totalBalance),
      status: upper(raw.status, "Unknown"),
      joined: formatApiDate(raw.createdAt ?? raw.joinedAt),
    } as AdminUserRecord;
  },
  updateUser(
    userId: string,
    input: { fullName: string; email: string; phone: string; amount: string },
  ) {
    return apiRequest(`/admin/users/${userId}`, {
      method: "PATCH",
      body: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        amount: input.amount,
      },
    });
  },
  updateUserStatus(userId: string, status: string) {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  createUser(input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    balance: string;
  }) {
    return apiRequest("/admin/users", {
      method: "POST",
      body: input,
    });
  },
  async getTransactions() {
    const payload = await apiRequest("/admin/transactions?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["transactions"]).map(mapTransaction);
  },
  async getWithdrawals() {
    const payload = await apiRequest("/admin/withdrawals?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["withdrawals"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.withdrawalId, `withdrawal-${index + 1}`),
      user: readString((raw.user as Record<string, unknown> | undefined)?.fullName ?? raw.userName, "Customer"),
      email: readString((raw.user as Record<string, unknown> | undefined)?.email ?? raw.email),
      amount: readNumber(raw.amount),
      date: formatApiDate(raw.createdAt ?? raw.date),
      status: upper(raw.status, "Pending"),
    }));
  },
  approveWithdrawal(withdrawalId: string) {
    return apiRequest(`/admin/withdrawals/${withdrawalId}/approve`, { method: "PATCH" });
  },
  rejectWithdrawal(withdrawalId: string, reason: string) {
    return apiRequest(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: "PATCH",
      body: { reason },
    });
  },
  async getMessages() {
    const payload = await apiRequest("/admin/messages?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["messages"]).map(mapSupportMessage);
  },
  replyToMessage(messageId: string, body: string) {
    return apiRequest(`/admin/messages/${messageId}/reply`, {
      method: "POST",
      body: { body },
    });
  },
  resolveMessage(messageId: string) {
    return apiRequest(`/admin/messages/${messageId}/resolve`, { method: "PATCH" });
  },
  async getSettings() {
    const payload = await apiRequest("/admin/settings");
    const settings = pickObject<Record<string, unknown>>(payload, ["settings"]);
    return mapAdminSettings(settings);
  },
  updateSettings(input: AdminSettingsRecord) {
    return apiRequest("/admin/settings", {
      method: "PATCH",
      body: input,
    });
  },
};

export const formatters = {
  money: toMoney,
  status: upper,
  date: formatApiDate,
};
