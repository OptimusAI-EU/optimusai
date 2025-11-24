# Order & Subscription System - Quick Reference

## 🛒 ORDERS QUICK REFERENCE

### Order Statuses
```
Cart (initial)
    ↓
Awaiting Shipping (after payment)
    ↓
Shipped (after pickup)
    ↓
Delivered (final)
```
**Can be Cancelled from any state**

### What Can Be Ordered?
1. **Physical Robots** - SA-101 Robot Arm, SA-202 Gripper, etc.
   - Requires shipping address
   - Tracking number provided
   
2. **ODIN Subscriptions** - One-time binary downloads
   - No physical shipping needed
   - Status transitions metaphorically (Cart → Awaiting Shipping → Shipped when download provided → Delivered when downloaded)

### Order Workflow Example
```
User adds SA-101 to cart
↓
Order created (Status: Cart)
↓
User pays
↓
Payment succeeds (Status: Awaiting Shipping)
↓
Admin ships
↓
Status: Shipped (with tracking #)
↓
Customer receives
↓
Status: Delivered
```

### Admin Orders Panel Summary Cards
- **Product Types:** Count of Robots vs ODIN Subscriptions
- **Order Status:** Count by Cart, Awaiting Shipping, Shipped, Delivered, Cancelled
- **Click any card** to filter table by that category

---

## 📋 SUBSCRIPTIONS QUICK REFERENCE

### Subscription Statuses
```
Cart (initial - awaiting payment)
    ↓
Active (after payment)
    ↓
Awaiting Renewal (renewal date reached)
    ↓
Active (after renewal payment)
```
**Can be Cancelled from any state**

### Subscription Types
- **RAAS** - Robotics-as-a-Service (monthly or annual)
- **SAAS** - Software-as-a-Service (monthly or annual)

### Critical: Renewal Date Calculation
**Renewal dates are EXACT timestamps including time of day**

Examples:
- Subscribed: Nov 23, 2025 at 14:35:27
- Monthly plan → Renewal: Dec 23, 2025 at 14:35:27
- Annual plan → Renewal: Nov 23, 2026 at 14:35:27

### Subscription Workflow Example
```
User adds Professional (Monthly) to cart
↓
Subscription created (Status: Cart)
↓
User pays
↓
Payment succeeds (Status: Active)
↓
[30 days pass]
↓
Renewal date reached (Status: Awaiting Renewal)
↓
Auto-renew enabled → payment processes
↓
Status: Active again (new renewal date set)
```

### Admin Subscriptions Panel Summary Cards
- **Plan Types:** Count by plan name + billing cycle
  - Starter (Monthly), Starter (Annual), Professional (Monthly), etc.
- **Status Distribution:** Count by Cart, Active, Awaiting Renewal, Cancelled
- **Click any card** to filter table by that category

---

## 📊 ADMIN PANELS - NEW FEATURES

### AdminOrders Enhancements
✅ **Summary Statistics:** Product type and status distribution  
✅ **Phone Column:** Customer contact information  
✅ **Product Type Display:** Robot vs ODIN with color-coded badges  
✅ **Updated Statuses:** Cart, Awaiting Shipping, Shipped, Delivered, Cancelled  
✅ **Clickable Cards:** Click summary cards to filter table  
✅ **Search Filters:** By order #, email, name, phone  

**Table Columns:**
| Order # | Customer | Email | Phone | Product Type | Items | Total | Status | Date | Actions |
|---------|----------|-------|-------|--------------|-------|-------|--------|------|---------|

### AdminSubscriptions Enhancements
✅ **Summary Statistics:** Plan types (with billing cycle) and status distribution  
✅ **Phone Column:** Customer contact information  
✅ **Subscription Date:** Complete timestamp when user subscribed (NEW)  
✅ **Renewal Date Timestamps:** Shows exact date + time for renewal  
✅ **Updated Statuses:** Cart, Active, Awaiting Renewal, Cancelled  
✅ **Clickable Cards:** Click summary cards to filter table  
✅ **Search Filters:** By email, name, phone, plan name  

**Table Columns:**
| Customer | Email | Phone | Plan | Type | Billing Cycle | Price | Status | Renewal Date | Auto Renew | Actions |
|----------|-------|-------|------|------|---------------|-------|--------|--------------|-----------|---------|

---

## 💾 DATABASE SCHEMA CHANGES

### Order Model
```javascript
// New field
productType: ENUM('robot', 'odin_subscription')

// Changed statuses
orderStatus: ENUM(
  'cart',              // Initial
  'awaiting_shipping', // Payment complete
  'shipped',           // In transit or download provided
  'delivered',         // Received or downloaded
  'cancelled'          // Cancelled
)
```

### Subscription Model
```javascript
// New field
subscriptionDate: DATE // Complete timestamp when subscribed

// Changed statuses
status: ENUM(
  'cart',              // Initial - awaiting payment
  'active',            // Active subscription
  'awaiting_renewal',  // Renewal due
  'cancelled'          // Cancelled
)

// Now allows NULL
endDate: DATE (nullable)

// Exact timestamp for renewal
renewalDate: DATE // Includes time of day
```

---

## 🚀 NEXT IMPLEMENTATION STEPS

1. **Update seedTestData.js** with new status values
   ```bash
   cd backend && node scripts/seedTestData.js
   ```

2. **Test Admin Panels**
   - Verify summary cards display correctly
   - Test filtering by clicking summary cards
   - Test search by phone number
   - Verify timestamp formatting on renewals

3. **Backend Enhancements** (Future)
   - Automatic renewal scheduler (cron job)
   - Payment processor integration (Stripe/PayPal)
   - Email notifications for status changes
   - Customer portal for order/subscription management

---

## 📝 NOTES

- **Order numbers** are auto-generated (e.g., ORD-1763888264774-001)
- **Phone numbers** are now captured for better customer communication
- **Exact timestamps** on renewal dates ensure precise billing cycles
- **Summary cards are interactive** - click to filter the table
- **Status transitions** are manual (admin-controlled) not automatic
- **Auto-renew** only applies when subscription is Active or Awaiting Renewal

---

## 📖 DETAILED DOCUMENTATION

For comprehensive documentation including:
- Complete workflow diagrams
- Full data structure specifications
- Implementation checklist
- Future development roadmap

See: `DATA_MODEL.md`

For summary of all changes made:
See: `CHANGES.md`
