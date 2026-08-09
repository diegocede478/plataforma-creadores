/* ========================================
   Creata - Wallet View
   ======================================== */

import { useState, type FormEvent } from 'react';
import {
  Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, DollarSign,
  TrendingUp, Repeat, Sparkles, Package, CreditCard, Lock
} from 'lucide-react';
import { useWallet, useTransactions, useDeposit, useWithdraw } from '../hooks';
import { Button, Card, Badge, Input, Modal, Pagination, SkeletonCard } from '../components/ui';
import type { Transaction } from '../types';
import './Wallet.css';

const TRANSACTION_LABELS: Record<Transaction['type'], string> = {
  deposit: 'Depósito',
  withdrawal: 'Retiro',
  subscription: 'Suscripción',
  post_unlock: 'Desbloqueo de post',
  service_purchase: 'Compra de servicio',
  service_sale: 'Venta de servicio',
  payout: 'Pago',
};

const TRANSACTION_ICONS: Record<Transaction['type'], React.ReactNode> = {
  deposit: <ArrowDownToLine size={18} />,
  withdrawal: <ArrowUpFromLine size={18} />,
  subscription: <Repeat size={18} />,
  post_unlock: <Sparkles size={18} />,
  service_purchase: <Package size={18} />,
  service_sale: <TrendingUp size={18} />,
  payout: <CreditCard size={18} />,
};

// Which transaction types are income vs expense
const isIncome = (type: Transaction['type']): boolean =>
  type === 'deposit' || type === 'service_sale' || type === 'post_unlock' || type === 'subscription';

export function Wallet() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [modal, setModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');

  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactionsData, isLoading: txLoading } = useTransactions({ page, limit });
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;
  const isLoading = walletLoading || txLoading;

  const openModal = (type: 'deposit' | 'withdraw') => {
    setModal(type);
    setAmount('');
  };

  const closeModal = () => {
    if (deposit.isPending || withdraw.isPending) return;
    setModal(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    if (modal === 'deposit') {
      deposit.mutate(value, { onSuccess: () => setModal(null) });
    } else if (modal === 'withdraw') {
      withdraw.mutate(value, { onSuccess: () => setModal(null) });
    }
  };

  const balance = wallet?.balance ?? 0;
  const isSubmitting = deposit.isPending || withdraw.isPending;
  const maxWithdraw = wallet?.balance ?? 0;

  return (
    <div className="wallet">
      {/* Balance Card */}
      <section className="wallet__balance-card" aria-label="Balance de la wallet">
        <div className="wallet__balance-header">
          <div className="wallet__balance-label">
            <WalletIcon size={20} />
            Saldo disponible
          </div>
          <Badge variant="success" size="sm" className="wallet__balance-badge">
            <Lock size={12} /> Fondos seguros
          </Badge>
        </div>
        <p className="wallet__balance-amount">
          <DollarSign size={28} />
          {isLoading ? '...' : balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="wallet__balance-actions">
          <Button variant="primary" onClick={() => openModal('deposit')} leftIcon={<ArrowDownToLine size={16} />} disabled={isLoading}>
            Depositar
          </Button>
          <Button variant="outline" onClick={() => openModal('withdraw')} leftIcon={<ArrowUpFromLine size={16} />} disabled={isLoading || balance <= 0}>
            Retirar
          </Button>
        </div>
      </section>

      {/* Transactions */}
      <section className="wallet__transactions" aria-label="Historial de transacciones">
        <h2 className="wallet__section-title">Historial de transacciones</h2>

        {isLoading ? (
          <div className="wallet__tx-skeleton">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card variant="glass" className="wallet__empty">
            <div className="wallet__empty-icon">
              <Repeat size={48} />
            </div>
            <h3>Sin transacciones</h3>
            <p>Cuando realices depósitos, retiros o ventas, aparecerán aquí.</p>
          </Card>
        ) : (
          <>
            <div className="wallet__tx-list">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="wallet__pagination">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  showTotal={pagination.total}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Deposit / Withdraw Modal */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={modal === 'deposit' ? 'Depositar fondos' : 'Retirar fondos'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="wallet__form">
          <p className="wallet__form-desc">
            {modal === 'deposit'
              ? 'Simula una carga de fondos a tu wallet. El saldo se actualizará al instante.'
              : `Retira hasta $${maxWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de tu saldo disponible.`}
          </p>
          <div className="wallet__form-group">
            <Input
              label="Monto (USD)"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50.00"
              leftIcon={<DollarSign size={16} />}
              autoFocus
              required
            />
            {modal === 'withdraw' && Number(amount) > maxWithdraw && (
              <p className="wallet__form-error">El monto excede tu saldo disponible.</p>
            )}
          </div>
          <div className="wallet__quick-amounts">
            {[10, 25, 50, 100].map((quick) => (
              <button
                key={quick}
                type="button"
                className="wallet__quick-amount"
                onClick={() => setAmount(String(quick))}
                disabled={modal === 'withdraw' && quick > maxWithdraw}
              >
                ${quick}
              </button>
            ))}
          </div>
          <div className="wallet__form-actions">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !amount || Number(amount) <= 0 || (modal === 'withdraw' && Number(amount) > maxWithdraw)}
              leftIcon={modal === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
            >
              {isSubmitting
                ? 'Procesando...'
                : modal === 'deposit' ? 'Depositar' : 'Retirar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Transaction Row Component
interface TransactionRowProps {
  tx: Transaction;
}

function TransactionRow({ tx }: TransactionRowProps) {
  const income = isIncome(tx.type);
  const formattedDate = new Date(tx.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="wallet__tx-row">
      <div className={`wallet__tx-icon ${income ? 'wallet__tx-icon--income' : 'wallet__tx-icon--expense'}`}>
        {TRANSACTION_ICONS[tx.type]}
      </div>
      <div className="wallet__tx-content">
        <p className="wallet__tx-title">{TRANSACTION_LABELS[tx.type]}</p>
        <p className="wallet__tx-meta">{formattedDate}</p>
      </div>
      <span className={`wallet__tx-amount ${income ? 'wallet__tx-amount--income' : 'wallet__tx-amount--expense'}`}>
        {income ? '+' : '−'}${tx.amount.toFixed(2)}
      </span>
    </div>
  );
}

export default Wallet;
