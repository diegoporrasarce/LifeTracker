/**
 * Derived data.
 *
 * All the maths around balances, portfolio evolution, expenses and debts
 * lives here so screens only have to render results.
 */

import { addMonths, currentMonthKey, monthKeyRange, type MonthKey } from '@/utils/date';

import type {
  Account,
  AccountSnapshot,
  Debt,
  FixedExpense,
  ID,
} from '@/store/types';

export interface AccountBalance {
  cash: number;
  invested: number;
  total: number;
  /** Month of the snapshot used, if any. */
  month?: MonthKey;
}

export interface PortfolioPoint extends AccountBalance {
  month: MonthKey;
}

function sortSnapshots(snapshots: AccountSnapshot[]): AccountSnapshot[] {
  return [...snapshots].sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));
}

/** Latest balance recorded for an account, whatever the month. */
export function latestSnapshot(account: Account): AccountSnapshot | undefined {
  const ordered = sortSnapshots(account.snapshots);
  return ordered.length > 0 ? ordered[ordered.length - 1] : undefined;
}

/**
 * Balance of an account for a given month, carrying the last known balance
 * forward. Accounts without any balance yet contribute nothing.
 */
export function balanceAt(account: Account, month: MonthKey): AccountBalance {
  const ordered = sortSnapshots(account.snapshots);
  let match: AccountSnapshot | undefined;
  for (const snapshot of ordered) {
    if (snapshot.month <= month) match = snapshot;
    else break;
  }
  if (!match) return { cash: 0, invested: 0, total: 0 };
  return {
    cash: match.cash,
    invested: match.invested,
    total: match.cash + match.invested,
    month: match.month,
  };
}

export function currentBalance(account: Account): AccountBalance {
  const latest = latestSnapshot(account);
  if (!latest) return { cash: 0, invested: 0, total: 0 };
  return {
    cash: latest.cash,
    invested: latest.invested,
    total: latest.cash + latest.invested,
    month: latest.month,
  };
}

export function portfolioTotals(accounts: Account[]): AccountBalance {
  return accounts.reduce<AccountBalance>(
    (total, account) => {
      const balance = currentBalance(account);
      return {
        cash: total.cash + balance.cash,
        invested: total.invested + balance.invested,
        total: total.total + balance.total,
      };
    },
    { cash: 0, invested: 0, total: 0 },
  );
}

/**
 * Monthly evolution of the whole portfolio. Every month between the first
 * recorded balance and today gets a point, so the chart never has holes.
 */
export function portfolioSeries(accounts: Account[], options?: { from?: MonthKey }): PortfolioPoint[] {
  const months = accounts.flatMap((account) => account.snapshots.map((snapshot) => snapshot.month));
  if (months.length === 0) return [];

  const earliest = months.reduce((min, month) => (month < min ? month : min));
  const latest = months.reduce((max, month) => (month > max ? month : max));
  const current = currentMonthKey();
  const end = latest > current ? latest : current;
  const start = options?.from && options.from > earliest ? options.from : earliest;

  return monthKeyRange(start, end).map((month) => {
    const totals = accounts.reduce(
      (accumulator, account) => {
        const balance = balanceAt(account, month);
        return {
          cash: accumulator.cash + balance.cash,
          invested: accumulator.invested + balance.invested,
        };
      },
      { cash: 0, invested: 0 },
    );

    return {
      month,
      cash: totals.cash,
      invested: totals.invested,
      total: totals.cash + totals.invested,
    };
  });
}

/** Percentage change of the portfolio compared to the previous month. */
export function monthlyChange(series: PortfolioPoint[]): { value: number; percentage: number } | null {
  if (series.length < 2) return null;
  const previous = series[series.length - 2];
  const current = series[series.length - 1];
  if (!previous || !current) return null;
  const value = current.total - previous.total;
  const percentage = previous.total === 0 ? 0 : (value / Math.abs(previous.total)) * 100;
  return { value, percentage };
}

export function expenseSummary(expenses: FixedExpense[]) {
  const active = expenses.filter((expense) => expense.active);
  const monthly = active.reduce((total, expense) => total + expense.amount, 0);

  const byCategory = new Map<string, number>();
  for (const expense of active) {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount);
  }

  return {
    monthly,
    annual: monthly * 12,
    byCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export function debtSummary(debts: Debt[]) {
  const open = debts.filter((debt) => !debt.settled);

  const receivable = open.filter((debt) => debt.direction === 'they_owe_me');
  const payable = open.filter((debt) => debt.direction === 'i_owe');

  const sumMoney = (list: Debt[]) =>
    list.reduce((total, debt) => total + (debt.kind === 'money' ? debt.amount ?? 0 : 0), 0);

  return {
    openCount: open.length,
    receivableMoney: sumMoney(receivable),
    payableMoney: sumMoney(payable),
    receivableCount: receivable.length,
    payableCount: payable.length,
    receivableOther: receivable.filter((debt) => debt.kind !== 'money').length,
    payableOther: payable.filter((debt) => debt.kind !== 'money').length,
  };
}

export function findAccount(accounts: Account[], id: ID | undefined): Account | undefined {
  if (!id) return undefined;
  return accounts.find((account) => account.id === id);
}

/** Months elapsed since the first recorded balance, used for the chart header. */
export function firstTrackedMonth(accounts: Account[]): MonthKey | undefined {
  const months = accounts.flatMap((account) => account.snapshots.map((snapshot) => snapshot.month));
  if (months.length === 0) return undefined;
  return months.reduce((min, month) => (month < min ? month : min));
}

export function previousMonth(month: MonthKey): MonthKey {
  return addMonths(month, -1);
}
