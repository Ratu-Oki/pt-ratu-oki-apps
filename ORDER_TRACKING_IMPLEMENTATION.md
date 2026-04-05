# Order Tracking Component - Implementation Guide

## Overview
The Order Tracking UI feature includes three reusable components for displaying order status across the consumer application:

1. **OrderTracking** - Full detailed vertical timeline view
2. **OrderTrackingCompact** - Compact horizontal preview
3. Both use existing backend data without new hooks

---

## Component 1: OrderTracking (Full Version)

### Purpose
Displays complete order journey with timestamps and detailed status information.

### Location
```
src/pages/Consumer/components/OrderTracking.jsx
src/pages/Consumer/components/OrderTracking.module.css
```

### Props
```javascript
{
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
  timeline: Array<{
    title: string,
    time: string | null,
    description?: string,
    status: string,
    cancelled?: boolean
  }>,
  vertical: boolean,                    // true = vertical, false = horizontal
  showTimeline: boolean,                // Show timestamps
  className: string                     // Additional CSS class
}
```

### Steps Displayed
1. **Pesanan Dibuat** (pending) → Order created
2. **Pembayaran Dikonfirmasi** (paid) → Payment verified
3. **Sedang Dikirim** (shipped) → In transit
4. **Tiba di Tujuan** (completed) → Delivered

### Usage Example
```jsx
import OrderTracking from './components/OrderTracking';

// In StatusPesanan.jsx
<OrderTracking 
  status={order.status}
  timeline={order.timeline}
  vertical={true}
  showTimeline={true}
/>
```

### Step States
- ✓ **Finish** (Green) - Step completed
- ⏳ **Process** (Blue) - Current active step
- ⏸ **Wait** (Gray) - Pending
- ✗ **Error** (Red) - Order cancelled

---

## Component 2: OrderTrackingCompact (Preview Version)

### Purpose
Shows compact horizontal progress indicator for Cart and Checkout pages.

### Location
```
src/pages/Consumer/components/OrderTrackingCompact.jsx
src/pages/Consumer/components/OrderTrackingCompact.module.css
```

### Props
```javascript
{
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
  showLabel: boolean,     // true = show step names, false = icons only
  className: string       // Additional CSS class
}
```

### Steps Icons
- Step 1: ✓ Check (Diproses)
- Step 2: ⏱ Clock (Pembayaran)
- Step 3: 🚚 Car (Sedang Dikirim)
- Step 4: 🏠 Home (Tiba di Tujuan)

### Usage Examples

**In Cart.jsx - Show potential order flow:**
```jsx
import OrderTrackingCompact from './components/OrderTrackingCompact';

<OrderTrackingCompact status="pending" showLabel={true} />
```

**In Checkout.jsx - Show after successful payment:**
```jsx
{paymentComplete && (
  <>
    <Divider style={{ margin: '20px 0' }} />
    <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
      📍 Status Pesanan Anda:
    </p>
    <OrderTrackingCompact status="paid" showLabel={true} />
  </>
)}
```

---

## Integration Points

### 1. StatusPesanan.jsx (Status Page)
**File**: `src/pages/Consumer/StatusPesanan.jsx`

**What Changed:**
- Imported `OrderTracking` component
- Replaced inline `<Steps>` component with `<OrderTracking />`
- No changes to data fetching or business logic

**Implementation:**
```jsx
import OrderTracking from './components/OrderTracking';

// In renderOrderDetail())
<div className={styles.timelineSection}>
  <h3 className={styles.sectionTitle}>Status Pengiriman</h3>
  <OrderTracking 
    status={order.status}
    timeline={order.timeline}
    vertical={true}
    showTimeline={true}
  />
</div>
```

**Data Flow:**
```
API (/transactions/my-transactions)
  ↓
buildTimeline(tx) → Creates timeline array
  ↓
<OrderTracking status={tx.status} timeline={timeline} />
```

### 2. Cart.jsx (Shopping Cart Page)
**File**: `src/pages/Consumer/Cart.jsx`

**New Addition:**
- Shows order flow preview before checkout
- Helps user understand what happens after purchase

**Implementation:**
```jsx
import OrderTrackingCompact from './components/OrderTrackingCompact';

// In summary card, before checkout button
<div style={{ marginBottom: 16 }}>
  <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
    📍 Proses Pesanan Anda:
  </p>
  <OrderTrackingCompact status="pending" showLabel={true} />
</div>
```

### 3. Checkout.jsx (Payment Page)
**File**: `src/pages/Consumer/Checkout.jsx`

**New Addition:**
- Shows current order status after successful payment
- Motivates user by showing next steps

**Implementation:**
```jsx
import OrderTrackingCompact from './components/OrderTrackingCompact';

// In payment modal, after payment success
{paymentComplete && (
  <>
    <Divider style={{ margin: '20px 0' }} />
    <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
      📍 Status Pesanan Anda:
    </p>
    <OrderTrackingCompact status="paid" showLabel={true} />
  </>
)}
```

---

## Backend Integration

### API Endpoints Used
```
GET /transactions/my-transactions
  └─ Returns: Array of transaction objects with status field
  
GET /transactions/{id}
  └─ Returns: Single transaction with full details
```

### Required Response Fields
```javascript
{
  success: true,
  data: {
    transactions: [
      {
        id: number,
        invoice_number: string,
        status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
        tanggal_transaksi: ISO8601 date,
        updatedAt: ISO8601 date,
        createdAt: ISO8601 date,
        details: Array<{
          product: { nama_produk, berat, ... },
          ...
        }>
      }
    ]
  }
}
```

### Status Mapping
Backend status → Component display:
- `pending` → Step 0 (Pesanan Dibuat)
- `paid` → Step 1 (Pembayaran Dikonfirmasi)
- `shipped` → Step 2 (Sedang Dikirim)
- `completed` → Step 3 (Tiba di Tujuan)
- `cancelled` → Error state (all steps)

---

## Features & Behaviors

### Dynamic Step Updates
```javascript
// Component automatically updates based on status prop
status="pending"    → Shows: Step 0 active
status="paid"       → Shows: Step 0-1 completed, Step 1 active
status="shipped"    → Shows: Step 0-2 completed, Step 2 active
status="completed"  → Shows: All steps completed (finish state)
status="cancelled"  → Shows: Error state (red)
```

### Timeline Information
```javascript
// If timeline data includes time field:
timeline = [
  { title: "Pesanan Dibuat", time: "5 Apr 2026, 10:30" },
  { title: "Pembayaran", time: "5 Apr 2026, 10:35" },
  { title: "Dikirim", time: null },  // "Menunggu pembaruan..."
]

// Components auto-generate default steps if timeline not provided
<OrderTracking status="paid" /> 
// → Creates default 4-step timeline automatically
```

### Responsive Design
- **Desktop (768px+)**: Full timeline with timestamps
- **Tablet (480-768px)**: Compact timeline, smaller text
- **Mobile (<480px)**: Icons only, labels hidden in compact version

---

## Styling & Customization

### Color Scheme
```css
Primary Green: #2d7a52      (Current/active step)
Success Green: #52c41a      (Completed step)
Warning Yellow: #faad14     (In progress)
Error Red: #f5222d          (Cancelled)
```

### CSS Classes
- `.orderTrackingContainer` - Main wrapper
- `.stepIcon[0-3]` - Individual step icons
- `.timelineTime` - Timestamp text
- `.timelineDescription` - Step description
- `.trackingInfo` - Info section
- `.successText` / `.errorText` - Status messages

### Custom Styling
```jsx
<OrderTracking 
  status="shipped"
  timeline={data}
  className="my-custom-class"
/>

// In your CSS:
.my-custom-class :global(.ant-steps-item-process) {
  color: #custom-color;
}
```

---

## No New Hooks - Architecture

### Why No Hooks Needed?
1. **Data Comes from Parent**: Order status fetched by parent component
2. **Stateless Component**: OrderTracking is a pure presentation component
3. **Existing Service**: Uses `transactionService.getMyTransactions()` from api.js
4. **Props-Driven**: All logic controlled via props

### Data Flow Without Hooks
```
StatusPesanan.jsx (useCallback + transactionService.getMyTransactions)
  ↓
fetchOrders() calls backend API
  ↓
Transform response: buildTimeline(tx)
  ↓
Pass to <OrderTracking status={status} timeline={timeline} />
  ↓
OrderTracking renders (no hooks, just props to State)
```

### Why This Architecture?
- ✓ Reusable across multiple pages
- ✓ No duplicate data fetching
- ✓ Easier testing (props-based)
- ✓ Better performance (no extra hooks)
- ✓ Simpler state management

---

## Testing Checklist

- [ ] Open StatusPesanan page → See vertical timeline
- [ ] Click order → Expanded view shows OrderTracking
- [ ] In Cart page → See pending order flow
- [ ] After checkout → See "paid" status in compact view
- [ ] Cancel order (mock) → See error state
- [ ] Mobile view → Icons/labels responsive
- [ ] Refresh data → Timeline updates correctly

---

## Files Modified

```
CREATED:
├── src/pages/Consumer/components/OrderTracking.jsx
├── src/pages/Consumer/components/OrderTracking.module.css
├── src/pages/Consumer/components/OrderTrackingCompact.jsx
├── src/pages/Consumer/components/OrderTrackingCompact.module.css
└── src/pages/Consumer/components/ORDER_TRACKING_USAGE.md

MODIFIED:
├── src/pages/Consumer/StatusPesanan.jsx (Line 6, 195-207)
├── src/pages/Consumer/Cart.jsx (Line 6, 210-216)
└── src/pages/Consumer/Checkout.jsx (Line 7, 552-565)
```

---

## Example Timeline Data Structure

```javascript
// From buildTimeline(transaction)
{
  step: 0,
  title: "Pesanan Dibuat",
  time: "5 Apr 2026, 10:30",
  status: "pending"
},
{
  step: 1,
  title: "Pembayaran Dikonfirmasi",
  time: "5 Apr 2026, 10:35",
  status: "paid"
},
{
  step: 2,
  title: "Sedang Dikirim",
  time: null,  // Pending, shows "Menunggu pembaruan..."
  status: "shipped"
},
{
  step: 3,
  title: "Tiba di Tujuan",
  time: null,
  status: "completed"
}
```

---

## Future Enhancements

Possible extensions (no breaking changes):
- Add estimated delivery date to timeline
- Real-time WebSocket updates for step changes
- Order tracking number input
- Notification on step completion
- Custom step names per order type
- Multi-language support

---

**Version**: 1.0  
**Last Updated**: April 5, 2026  
**Status**: Production Ready
