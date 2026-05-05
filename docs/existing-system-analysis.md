# Existing System Analysis

## System Overview
The current Raffle system is a 3-tier application built for **Marassi Galleria** (a shopping mall in Bahrain).

## Components

### 1. Customer Portal (raffle_app_v2)
- React 19 + TypeScript + Vite + MUI v7 (PWA)
- OTP-based auth (Infinito SMS)
- 22 pages (16 customer + 6 CSR)
- Receipt upload with AI OCR, loyalty points, raffle, coupons

### 2. Backend API (Raffle_API)
- ASP.NET Core 6.0, SQL Server, 60+ endpoints
- Azure Form Recognizer (OCR), SendGrid, Infinito SMS

### 3. Admin Application (Raffle)
- ASP.NET MVC 4 / .NET Framework 4.5 (LEGACY)
- ADO.NET with stored procedures, RDLC reports

## Business Logic
- Vouchers: Transaction Amount / Eligible Amount = Voucher Count
- Loyalty Points: 30 points per 1 BHD spent (configurable)
- OCR Match: Invoice# + Date + Amount must all match for auto-approval

## Stats
- 10,000+ registered customers
- 100,000+ vouchers processed
- 2,000 receipts/day at peak

## Strengths to Carry Forward
1. Proven OCR receipt scanning pipeline
2. Solid loyalty points engine with configurable rules
3. Bilingual (EN/AR) with proper RTL support
4. CSR workflow for receipt approval
5. Comprehensive reporting
6. Partner bonus system
7. Customer-to-customer point transfers

## Weaknesses to Address in Rally
1. Mall-only (hardcoded)
2. Single tenant
3. Legacy admin (.NET Framework 4.5)
4. Monolithic API (single 6,608-line controller)
5. Security gaps (JWT in localStorage, hardcoded keys)
6. No native mobile app
7. No AI beyond OCR
8. Limited communications
9. No gamification
10. Stored procedures (hard to version/test)
