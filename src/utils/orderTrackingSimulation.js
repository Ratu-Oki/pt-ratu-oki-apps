const PROCESSING_DURATION_MS = 15 * 1000;
const PACKING_DURATION_MS = 10 * 1000;
const SHIPPING_DURATION_MS = 20 * 1000;

const SIMULATION_SOURCE_STATUSES = new Set(['paid', 'Diproses/Dikemas']);

const TRACKING_STATUS_CONFIG = {
  pending: {
    color: 'default',
    label: 'Menunggu Pembayaran',
  },
  processing: {
    color: 'processing',
    label: 'Diproses',
  },
  packed: {
    color: 'warning',
    label: 'Dikemas',
  },
  shipped: {
    color: 'success',
    label: 'Dikirim',
  },
  awaiting_approval: {
    color: 'processing',
    label: 'Menunggu Persetujuan',
  },
  completed: {
    color: 'success',
    label: 'Selesai',
  },
  cancelled: {
    color: 'error',
    label: 'Dibatalkan',
  },
};

const TRACKING_STEPS = [
  { key: 'created', title: 'Pesanan Dibuat' },
  { key: 'processing', title: 'Diproses' },
  { key: 'packed', title: 'Dikemas' },
  { key: 'shipped', title: 'Dikirim' },
  { key: 'completed', title: 'Diterima' },
];

const parseTimestamp = (value) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const resolveCreatedAt = (transaction) => (
  parseTimestamp(transaction?.tanggal_transaksi)
  || parseTimestamp(transaction?.createdAt)
  || parseTimestamp(transaction?.updatedAt)
);

const resolveSimulationStartAt = (transaction) => (
  parseTimestamp(transaction?.updatedAt)
  || resolveCreatedAt(transaction)
  || Date.now()
);

const defaultFormatDateTime = (timestamp) => {
  if (!timestamp) return null;

  return new Date(timestamp).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const TRACKING_SIMULATION_DURATIONS = {
  processing: PROCESSING_DURATION_MS,
  packed: PACKING_DURATION_MS,
  shipped: SHIPPING_DURATION_MS,
};

export const getTrackingStatusConfig = (status) => (
  TRACKING_STATUS_CONFIG[status]
  || TRACKING_STATUS_CONFIG.pending
);

export const getTrackingDisplayStatus = (transaction, now = Date.now()) => {
  const actualStatus = transaction?.status;

  if (!actualStatus) return 'pending';

  if (actualStatus === 'completed' || actualStatus === 'cancelled') {
    return actualStatus;
  }

  if (actualStatus === 'shipped') {
    const shippedAt = resolveSimulationStartAt(transaction);
    const shippedElapsed = Math.max(0, now - shippedAt);

    if (shippedElapsed < SHIPPING_DURATION_MS) {
      return 'shipped';
    }

    return 'awaiting_approval';
  }

  if (!SIMULATION_SOURCE_STATUSES.has(actualStatus)) {
    return actualStatus;
  }

  const startAt = resolveSimulationStartAt(transaction);
  const elapsed = Math.max(0, now - startAt);

  if (elapsed < PROCESSING_DURATION_MS) {
    return 'processing';
  }

  if (elapsed < PROCESSING_DURATION_MS + PACKING_DURATION_MS) {
    return 'packed';
  }

  if (elapsed < PROCESSING_DURATION_MS + PACKING_DURATION_MS + SHIPPING_DURATION_MS) {
    return 'shipped';
  }

  return 'awaiting_approval';
};

export const buildTrackingTimeline = (
  transaction,
  now = Date.now(),
  formatDateTime = defaultFormatDateTime,
) => {
  const displayStatus = getTrackingDisplayStatus(transaction, now);
  const actualStatus = transaction?.status;
  const createdAt = resolveCreatedAt(transaction);
  const progressStartAt = SIMULATION_SOURCE_STATUSES.has(actualStatus)
    ? resolveSimulationStartAt(transaction)
    : (createdAt || resolveSimulationStartAt(transaction));
  const completedAt = parseTimestamp(transaction?.updatedAt);

  const reachedSteps = {
    created: Boolean(createdAt),
    processing: displayStatus !== 'pending' && displayStatus !== 'cancelled',
    packed: ['packed', 'shipped', 'awaiting_approval', 'completed'].includes(displayStatus),
    shipped: ['shipped', 'awaiting_approval', 'completed'].includes(displayStatus),
    completed: actualStatus === 'completed',
  };

  const stepTimes = {
    created: createdAt,
    processing: reachedSteps.processing ? progressStartAt : null,
    packed: reachedSteps.packed ? progressStartAt + PROCESSING_DURATION_MS : null,
    shipped: reachedSteps.shipped ? progressStartAt + PROCESSING_DURATION_MS + PACKING_DURATION_MS : null,
    completed: reachedSteps.completed ? completedAt : null,
  };

  return TRACKING_STEPS.map((step, index) => ({
    step: index,
    title: step.title,
    time: stepTimes[step.key] ? formatDateTime(stepTimes[step.key]) : null,
    pending: !reachedSteps[step.key],
    cancelled: actualStatus === 'cancelled' && step.key !== 'created',
  }));
};
