# Order & Subscription Data Model Documentation

## Overview

This document outlines the redesigned order and subscription system for OptimusAI, including detailed specifications for statuses, workflows, and UI presentation.

---

## ORDERS SYSTEM

### Order Definition

An **Order** is created when:
- A user adds physical robots (e.g., SA-101 Robot Arm) or ODIN subscription downloads to their cart
- The order is automatically assigned a unique `orderNumber` upon creation
- Order status is initially set to **"Cart"**

### Order Statuses

Orders progress through these statuses:

| Status | Description | Transition | Notes |
|--------|-------------|-----------|-------|
| **Cart** | Items added to cart, awaiting payment | Initial state | User can modify items |
| **Awaiting Shipping** | Payment completed, preparing shipment | After payment success | Physical robots only |
| **Shipped** | Order in transit (physical) or download link provided (ODIN) | After shipment pickup | Tracking number available |
| **Delivered** | Item received or ODIN binaries downloaded | After delivery/download | Final state |
| **Cancelled** | Order cancelled by user or admin | From any state | Cancellation reason recorded |

### Order Status Flow Diagram

```
Cart 
  ↓ (Payment completed)
Awaiting Shipping
  ↓ (Item packed & handed to courier)
Shipped
  ↓ (Item received or binary downloaded)
Delivered
  ↓ (Final state)
[END]

(Cancelled can be triggered from Cart or Awaiting Shipping)
```

### Order Payment Statuses

| Payment Status | Meaning |
|---|---|
| **pending** | Payment not yet processed or user still in checkout |
| **completed** | Payment successful - order moves to "Awaiting Shipping" |
| **failed** | Payment declined - order remains in "Cart" |
| **refunded** | Refund issued for completed payment |

### Orderable Products

#### 1. Physical Robots
- Examples: SA-101 Robot Arm, SA-202 Gripper, etc.
- Require: Shipping address, physical delivery tracking
- Status progression: Cart → Awaiting Shipping → Shipped → Delivered

#### 2. ODIN Subscriptions (One-Time Downloads)
- Status in Orders: Cart, Awaiting Shipping (metaphorically), Shipped (download provided), Delivered (downloaded)
- Do NOT require shipping address for "Awaiting Shipping" status
- Transition to "Shipped" when download binaries are provided
- Mark as "Delivered" once user downloads

### Order Data Structure

```javascript
Order {
  id: INTEGER (PK),
  orderNumber: STRING (unique) // e.g., "ORD-1763888264774-001"
  userId: INTEGER (FK to User),
  items: JSON Array [
    {
      productId: STRING,
      productName: STRING, // e.g., "SA-101 Robot Arm" or "ODIN Pro"
      productType: 'robot' | 'odin_subscription', // NEW FIELD
      quantity: INTEGER,
      unitPrice: DECIMAL,
      description: STRING
    }
  ],
  subtotal: DECIMAL,
  shipping: DECIMAL,
  tax: DECIMAL,
  total: DECIMAL,
  paymentMethod: ENUM('credit_card', 'paypal', 'bank_transfer'),
  paymentStatus: ENUM('pending', 'completed', 'failed', 'refunded'),
  orderStatus: ENUM('cart', 'awaiting_shipping', 'shipped', 'delivered', 'cancelled'),
  productType: ENUM('robot', 'odin_subscription'), // NEW: Determines item type
  shippingAddress: JSON {
    name: STRING,
    street: STRING,
    city: STRING,
    state: STRING,
    zip: STRING,
    country: STRING
  },
  billingAddress: JSON,
  trackingNumber: STRING,
  notes: TEXT,
  cancelledAt: DATE,
  cancelReason: STRING,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Order Admin Panel Features

#### Summary Cards (Clickable to Filter)

**Product Types:**
- Robots: Count of all robot orders
- ODIN Subscriptions: Count of ODIN subscription orders
- Click any card to filter the table by that product type

**Order Status Distribution:**
- Cart: Number of orders in cart
- Awaiting Shipping: Orders with completed payment
- Shipped: Orders in transit or downloads provided
- Delivered: Completed orders
- Cancelled: Cancelled orders
- Click any card to filter by status

#### Table Columns
1. Order #
2. Customer (Name)
3. Email
4. Phone (NEW)
5. Product Type (Robot / ODIN)
6. Items
7. Total
8. Order Status
9. Date
10. Actions

#### Expandable Row Details
- Order items with quantities and prices
- Subtotal, shipping, tax breakdown
- Customer information (name, email, phone)
- Shipping address
- Order status dropdown for updates
- Status change confirmation modal

#### Search Filters
- By order number, customer email, customer name, or phone number
- By product type (Robots / ODIN Subscriptions)
- By order status (Cart, Awaiting Shipping, Shipped, Delivered, Cancelled)

---

## SUBSCRIPTIONS SYSTEM

### Subscription Definition

A **Subscription** is:
- A recurring billing arrangement for RAAS or SAAS services
- Created when user adds it to cart and initiates checkout
- Initial status: **"Cart"**
- Becomes "Active" only after successful payment

### Subscription Statuses

| Status | Description | Trigger | Auto-transition |
|--------|-------------|---------|-----------------|
| **Cart** | In cart, awaiting payment | Initial state | None |
| **Active** | Payment received, subscription is active | Payment success | None (manual action required for renewal) |
| **Awaiting Renewal** | Renewal date reached, awaiting renewal payment | Date trigger | Auto if auto-renew enabled AND within 7 days after renewalDate |
| **Cancelled** | Subscription cancelled by user/admin | Manual | Cannot reactivate same ID; must create new subscription |

### Subscription Status Flow Diagram

```
Cart
  ↓ (Payment completed)
Active
  ↓ (Renewal date passed)
Awaiting Renewal
  ↓ (Renewal payment accepted OR subscription ends)
[Active again OR Ended]

(Cancelled can be triggered from Cart or Active)
```

### Subscription Types

| Type | Description | Billing | Renewal |
|------|-------------|---------|---------|
| **RAAS** | Robotics-as-a-Service | Monthly or Annual | Auto at renewal date + time |
| **SAAS** | Software-as-a-Service | Monthly or Annual | Auto at renewal date + time |

### Renewal Date Calculation

**Critical Requirement:** Renewal dates are EXACT timestamps including time.

**Example:**
- User subscribes: Nov 23, 2025 at 14:35:27
- Plan: Professional (Monthly)
- Renewal date: Dec 23, 2025 at 14:35:27 (exactly 30 days later at same time)

**Annual:**
- Subscription date: Nov 23, 2025 at 14:35:27
- Annual plan
- Renewal date: Nov 23, 2026 at 14:35:27

### Subscription Data Structure

```javascript
Subscription {
  id: INTEGER (PK),
  userId: INTEGER (FK to User),
  planName: ENUM('free', 'starter', 'professional', 'enterprise'),
  type: ENUM('RAAS', 'SAAS'),
  billingCycle: ENUM('monthly', 'annual'),
  price: DECIMAL,
  subscriptionDate: DATE, // NEW: Exact timestamp when user subscribed
  startDate: DATE, // Date when subscription became active (after payment)
  endDate: DATE, // Optional: If subscription has ended
  renewalDate: DATE, // EXACT timestamp when subscription is due for renewal
  autoRenew: BOOLEAN, // Only meaningful if status is Active or Awaiting Renewal
  status: ENUM('cart', 'active', 'awaiting_renewal', 'cancelled'),
  features: JSON Array,
  usageStats: JSON {
    requestsUsed: INTEGER,
    requestsLimit: INTEGER,
    storageUsed: INTEGER,
    storageLimit: INTEGER
  },
  paymentMethod: ENUM('credit_card', 'bank_transfer', 'paypal'),
  stripeSubscriptionId: STRING,
  cancelledAt: DATE,
  cancelReason: STRING,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Subscription Admin Panel Features

#### Summary Cards (Clickable to Filter)

**Plan Types (grouped by billing cycle):**
- Starter (Monthly): Count
- Starter (Annual): Count
- Professional (Monthly): Count
- Professional (Annual): Count
- Enterprise (Monthly): Count
- Enterprise (Annual): Count
- Click any card to filter subscriptions

**Subscription Status Distribution:**
- Cart: Pending payment
- Active: Currently active subscriptions
- Awaiting Renewal: Due for renewal
- Cancelled: Cancelled subscriptions
- Click any card to filter by status

#### Table Columns
1. Customer (Name)
2. Email
3. Phone (NEW)
4. Plan (Starter, Professional, etc.)
5. Type (RAAS / SAAS)
6. Billing Cycle (Monthly / Annual)
7. Price
8. Status
9. Renewal Date (EXACT timestamp)
10. Auto Renew (Yes / No)
11. Actions

#### Expandable Row Details
- Plan details (name, type, billing cycle, price)
- Subscription dates (subscription date + time, renewal date + time)
- Customer information (name, email, phone)
- Current status
- Auto-renew setting
- Management buttons:
  - Cancel (available if status is Active or Awaiting Renewal)
  - Pause (optional, based on business logic)
  - Resume (optional, based on business logic)

#### Search Filters
- By customer email, name, phone, or plan name
- By subscription status (Cart, Active, Awaiting Renewal, Cancelled)
- By plan type and billing cycle

---

## DATABASE MIGRATIONS

### Order Model Changes

```javascript
// Updated fields in Order model
orderStatus: {
  type: DataTypes.ENUM('cart', 'awaiting_shipping', 'shipped', 'delivered', 'cancelled'),
  defaultValue: 'cart',
},
productType: { // NEW FIELD
  type: DataTypes.ENUM('robot', 'odin_subscription'),
  defaultValue: 'robot',
},
```

### Subscription Model Changes

```javascript
// New field in Subscription model
subscriptionDate: {
  type: DataTypes.DATE,
  defaultValue: DataTypes.NOW,
  comment: 'Complete timestamp when subscription was created',
},

// Updated field
status: {
  type: DataTypes.ENUM('cart', 'active', 'awaiting_renewal', 'cancelled'),
  defaultValue: 'cart',
  comment: 'cart: Awaiting payment, active: Payment received, awaiting_renewal: Renewal due, cancelled: Cancelled',
},

// Updated field
renewalDate: {
  type: DataTypes.DATE,
  allowNull: false,
  comment: 'EXACT date and time when subscription is due for renewal (includes time down to seconds)',
},
```

---

## WORKFLOW EXAMPLES

### Example 1: Robot Purchase Workflow

1. **User adds SA-101 Robot Arm to cart**
   - Order created: Status = "Cart", orderStatus = "cart"
   - Order contains item with productType = "robot"

2. **User completes payment**
   - Payment succeeds
   - orderStatus changes to "awaiting_shipping"
   - paymentStatus = "completed"
   - User receives confirmation email

3. **Admin packs and ships**
   - orderStatus changes to "shipped"
   - trackingNumber added (e.g., "1Z999AA10123456784")

4. **Order delivered**
   - orderStatus changes to "delivered"
   - Order marked as complete

### Example 2: ODIN Subscription Download Workflow

1. **User adds ODIN Professional (Annual) to cart**
   - Subscription created: status = "cart"
   - Order created with productType = "odin_subscription"

2. **User makes payment**
   - Both subscription and order payment succeed
   - Subscription status changes to "active"
   - Order status changes to "awaiting_shipping" (metaphorically)
   - User receives download link

3. **User downloads binaries**
   - Order status changes to "shipped" (download provided)
   - Order status changes to "delivered" (download completed)

4. **After 1 year (renewal date)**
   - Subscription status changes to "awaiting_renewal"
   - If auto-renew enabled and payment succeeds, reverts to "active"
   - New renewal date set for 1 year later

---

## IMPLEMENTATION CHECKLIST

- [x] Update Order model with new statuses and productType field
- [x] Update Subscription model with subscriptionDate and new statuses
- [x] Create enhanced AdminOrders component with summary cards and filtering
- [x] Create enhanced AdminSubscriptions component with summary cards and filtering
- [ ] Update seedTestData.js with proper status examples
- [ ] Create API endpoints for status transitions
- [ ] Implement auto-renewal logic (backend cron job or scheduled task)
- [ ] Create customer-facing order and subscription management pages
- [ ] Add email notifications for status changes

---

## Notes for Future Development

1. **Automatic Renewal:** Implement a scheduled job to automatically transition subscriptions from "Active" → "Awaiting Renewal" when renewalDate is reached
2. **Payment Integration:** Connect to Stripe or PayPal for automatic renewal payments
3. **Customer Portal:** Allow customers to view their orders and subscriptions, manage renewals
4. **Admin Reports:** Generate reports on revenue by product type, subscription churn rate, etc.
5. **Backup Handling:** For ODIN products, consider storing download links with expiration dates
