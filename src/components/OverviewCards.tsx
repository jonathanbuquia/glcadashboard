import {
  Banknote,
  CircleDollarSign,
  Gauge,
  GraduationCap,
  PiggyBank,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import type { DashboardMetrics } from '../types/payment';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { KPICard } from './KPICard';

interface OverviewCardsProps {
  metrics: DashboardMetrics;
  variant?: 'all' | 'revenue' | 'accounts';
}

export function OverviewCards({ metrics, variant = 'all' }: OverviewCardsProps) {
  const revenueCards = [
    <KPICard
      label="Total Expected Revenue"
      value={formatCurrency(metrics.totalExpectedRevenue)}
      detail="Target collectible amount"
      tone="info"
      icon={CircleDollarSign}
      key="expected"
    />,
    <KPICard
      label="Total Collected"
      value={formatCurrency(metrics.totalCollectedAmount)}
      detail={`${formatPercent(metrics.collectionRate)} collection rate`}
      tone="success"
      icon={Banknote}
      key="collected"
    />,
    <KPICard
      label="Remaining Collectible"
      value={formatCurrency(metrics.totalRemainingBalance)}
      detail={`${formatNumber(metrics.studentsWithBalance)} students with balance`}
      tone="warning"
      icon={WalletCards}
      key="remaining"
    />,
    <KPICard
      label="Collection Rate"
      value={formatPercent(metrics.collectionRate)}
      detail="Progress toward revenue target"
      icon={Gauge}
      key="rate"
    />,
  ];
  const accountCards = [
    <KPICard
      label="Overpayment"
      value={formatCurrency(metrics.totalOverpayment)}
      detail="Collected above expected amount"
      tone="info"
      icon={PiggyBank}
      key="overpayment"
    />,
    <KPICard
      label="Fully Paid Students"
      value={formatNumber(metrics.fullyPaidStudents)}
      detail="Students with zero balance"
      tone="success"
      icon={GraduationCap}
      key="fully-paid"
    />,
    <KPICard
      label="Students With Balance"
      value={formatNumber(metrics.studentsWithBalance)}
      detail="Accounts still collectible"
      tone="warning"
      icon={ReceiptText}
      key="with-balance"
    />,
  ];
  const cards =
    variant === 'revenue'
      ? revenueCards
      : variant === 'accounts'
        ? accountCards
        : [...revenueCards, ...accountCards];

  return (
    <>{cards}</>
  );
}
