# Mortgage Calculator - Netherlands

A parametric mortgage calculator for Netherlands that calculates mortgage payments with Dutch tax deductions (bruto vs net).

## Features

- **Payment Types**: Supports both annuity and linear mortgage calculations
- **Dutch Tax Integration**: Calculates bruto vs net payments with mortgage interest tax deduction
- **Comprehensive Breakdown**: Shows monthly, yearly, and total payments
- **Interest vs Principal**: Visual breakdown of interest and principal payments
- **Yearly Analysis**: Detailed yearly breakdown table showing tax deductions
- **Visual Charts**: Interactive charts showing payment distribution and trends over time

## Parameters

- **Mortgage Amount**: Total loan amount
- **Payment Type**: Annuity (fixed monthly payment) or Linear (fixed principal, decreasing interest)
- **Interest Rate**: Annual interest rate percentage
- **Interest Period**: Frequency of interest calculation (typically 12 for monthly)
- **Mortgage Term**: Loan duration in years
- **Dutch Tax Rate**: Your income tax rate for mortgage interest deduction

## Getting Started

### Option 1: Using npm script

```bash
npm install
npm start
```

This will start a local server at `http://localhost:8080` and open it in your browser.

### Option 2: Using Python (if you have Python installed)

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3: Direct file opening

Simply open `index.html` in your browser (some features may be limited due to CORS restrictions).

## How It Works

### Annuity Mortgage
- Fixed monthly payment throughout the loan term
- Interest portion decreases over time, principal portion increases

### Linear Mortgage
- Fixed principal repayment each month
- Interest decreases as principal is paid down
- Monthly payment decreases over time

### Dutch Tax Deduction
In the Netherlands, mortgage interest is tax-deductible. The calculator:
- Calculates total interest paid
- Applies your tax rate to determine tax deduction
- Shows both bruto (gross) and net (after tax deduction) payments

## Files Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `app.js` - Main application logic and UI handlers
- `mortgageCalculator.js` - Core calculation engine
- `package.json` - Project configuration

## Browser Compatibility

Works in all modern browsers that support ES6 JavaScript and Canvas API.

## License

MIT

