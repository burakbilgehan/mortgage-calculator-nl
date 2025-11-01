/**
 * Mortgage Calculator for Netherlands
 * Complete implementation with all calculations and UI
 */

// Mortgage Calculator Class
class MortgageCalculator {
    constructor(options) {
        this.principal = options.principal || 0;
        this.interestRate = options.interestRate || 0;
        this.paymentType = options.paymentType || 'annuity';
        this.mortgageTerm = options.mortgageTerm || 30;
        this.dutchTaxRate = options.dutchTaxRate || 0.37;
        this.inflationRate = options.inflationRate || 0;
        
        this.monthlyInterestRate = this.interestRate / 100 / 12;
        this.totalMonths = this.mortgageTerm * 12;
        this.inflationFactor = 1 + (this.inflationRate / 100);
    }

    calculateAnnuityMonthlyPayment() {
        if (this.monthlyInterestRate === 0) {
            return this.principal / this.totalMonths;
        }
        const factor = Math.pow(1 + this.monthlyInterestRate, this.totalMonths);
        return this.principal * (this.monthlyInterestRate * factor) / (factor - 1);
    }

    calculateSchedule() {
        const schedule = [];
        let remainingPrincipal = this.principal;
        let totalInterest = 0;
        let totalPrincipal = 0;

        if (this.paymentType === 'annuity') {
            const monthlyPayment = this.calculateAnnuityMonthlyPayment();
            
            for (let month = 1; month <= this.totalMonths; month++) {
                const interestPayment = remainingPrincipal * this.monthlyInterestRate;
                const principalPayment = monthlyPayment - interestPayment;
                remainingPrincipal -= principalPayment;
                
                totalInterest += interestPayment;
                totalPrincipal += principalPayment;
                
                schedule.push({
                    month,
                    payment: monthlyPayment,
                    interest: interestPayment,
                    principal: principalPayment,
                    remaining: Math.max(0, remainingPrincipal),
                    year: Math.ceil(month / 12)
                });
            }
        } else {
            const monthlyPrincipal = this.principal / this.totalMonths;
            
            for (let month = 1; month <= this.totalMonths; month++) {
                const interestPayment = remainingPrincipal * this.monthlyInterestRate;
                const principalPayment = monthlyPrincipal;
                const monthlyPayment = principalPayment + interestPayment;
                remainingPrincipal -= principalPayment;
                
                totalInterest += interestPayment;
                totalPrincipal += principalPayment;
                
                schedule.push({
                    month,
                    payment: monthlyPayment,
                    interest: interestPayment,
                    principal: principalPayment,
                    remaining: Math.max(0, remainingPrincipal),
                    year: Math.ceil(month / 12)
                });
            }
        }

        return {
            schedule,
            totalInterest,
            totalPrincipal,
            totalPayment: totalInterest + totalPrincipal
        };
    }

    calculateYearlySummary() {
        const amortization = this.calculateSchedule();
        const yearlyData = {};
        
        amortization.schedule.forEach(entry => {
            const year = entry.year;
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    year,
                    totalPayment: 0,
                    totalInterest: 0,
                    totalPrincipal: 0,
                    remainingDebt: 0
                };
            }
            
            yearlyData[year].totalPayment += entry.payment;
            yearlyData[year].totalInterest += entry.interest;
            yearlyData[year].totalPrincipal += entry.principal;
            // Store remaining debt - since we process months sequentially,
            // the last entry for each year will be the end-of-year remaining debt
            yearlyData[year].remainingDebt = entry.remaining;
        });

        Object.keys(yearlyData).forEach(year => {
            const data = yearlyData[year];
            const taxDeduction = data.totalInterest * this.dutchTaxRate;
            data.brutoPayment = data.totalPayment;
            data.netPayment = data.totalPayment - taxDeduction;
            data.taxDeduction = taxDeduction;
            
            // Calculate real (inflation-adjusted) values
            // Year 1 money is worth more than Year 30 money due to inflation
            // Real value = Nominal value / (1 + inflation)^(year - 1)
            const yearsFromStart = parseInt(year) - 1;
            const inflationMultiplier = Math.pow(this.inflationFactor, yearsFromStart);
            data.brutoPaymentReal = data.brutoPayment / inflationMultiplier;
            data.netPaymentReal = data.netPayment / inflationMultiplier;
            data.taxDeductionReal = data.taxDeduction / inflationMultiplier;
            data.totalInterestReal = data.totalInterest / inflationMultiplier;
            data.totalPrincipalReal = data.totalPrincipal / inflationMultiplier;
        });

        return Object.values(yearlyData);
    }

    calculateTotalSummary() {
        const amortization = this.calculateSchedule();
        const totalInterest = amortization.totalInterest;
        const totalPayment = amortization.totalPayment;
        const taxDeduction = totalInterest * this.dutchTaxRate;
        
        // Calculate cumulative real values for totals
        const yearlySummary = this.calculateYearlySummary();
        let totalBrutoPaymentReal = 0;
        let totalNetPaymentReal = 0;
        let totalTaxDeductionReal = 0;
        let totalInterestReal = 0;
        let totalPrincipalReal = 0;
        
        yearlySummary.forEach(year => {
            totalBrutoPaymentReal += year.brutoPaymentReal || 0;
            totalNetPaymentReal += year.netPaymentReal || 0;
            totalTaxDeductionReal += year.taxDeductionReal || 0;
            totalInterestReal += year.totalInterestReal || 0;
            totalPrincipalReal += year.totalPrincipalReal || 0;
        });
        
        return {
            principal: this.principal,
            totalInterest,
            totalPayment,
            taxDeduction,
            brutoPayment: totalPayment,
            netPayment: totalPayment - taxDeduction,
            // Real values (cumulative)
            totalBrutoPaymentReal,
            totalNetPaymentReal,
            totalTaxDeductionReal,
            totalInterestReal,
            totalPrincipalReal
        };
    }

    getFirstMonthPayment() {
        if (this.paymentType === 'annuity') {
            const monthlyPayment = this.calculateAnnuityMonthlyPayment();
            const interestPayment = this.principal * this.monthlyInterestRate;
            const principalPayment = monthlyPayment - interestPayment;
            
            return {
                payment: monthlyPayment,
                interest: interestPayment,
                principal: principalPayment
            };
        } else {
            const monthlyPrincipal = this.principal / this.totalMonths;
            const interestPayment = this.principal * this.monthlyInterestRate;
            
            return {
                payment: monthlyPrincipal + interestPayment,
                interest: interestPayment,
                principal: monthlyPrincipal
            };
        }
    }
}

// Application State
let calculator = null;
let distributionChart = null;
let yearlyChart = null;

// Utility Functions
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '€0';
    }
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(numAmount)) {
        return '€0';
    }
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

// Form Handling
function getFormElements() {
    return {
        principal: document.getElementById('principal'),
        interestRate: document.getElementById('interestRate'),
        paymentType: document.getElementById('paymentType'),
        mortgageTerm: document.getElementById('mortgageTerm'),
        taxRate: document.getElementById('taxRate'),
        inflationRate: document.getElementById('inflationRate')
    };
}

function validateElements(elements) {
    const missing = Object.entries(elements)
        .filter(([key, el]) => !el)
        .map(([key]) => key);
    
    if (missing.length > 0) {
        console.error('Missing form elements:', missing);
        return false;
    }
    return true;
}

function calculateMortgage() {
    const elements = getFormElements();
    
    if (!validateElements(elements)) {
        alert('Error: Form elements not found. Please refresh the page.');
        return;
    }

    try {
        const principal = parseFloat(elements.principal.value);
        const interestRate = parseFloat(elements.interestRate.value);
        const paymentType = elements.paymentType.value;
        const mortgageTerm = parseFloat(elements.mortgageTerm.value);
        const taxRate = parseFloat(elements.taxRate.value) / 100;
        const inflationRate = parseFloat(elements.inflationRate.value);

        if (isNaN(principal) || principal <= 0) {
            alert('Please enter a valid mortgage amount');
            return;
        }
        if (isNaN(interestRate) || interestRate < 0) {
            alert('Please enter a valid interest rate');
            return;
        }
        if (isNaN(mortgageTerm) || mortgageTerm <= 0) {
            alert('Please enter a valid mortgage term');
            return;
        }
        if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
            alert('Please enter a valid tax rate (0-100)');
            return;
        }
        if (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 20) {
            alert('Please enter a valid inflation rate (0-20)');
            return;
        }

        calculator = new MortgageCalculator({
            principal,
            interestRate,
            paymentType,
            mortgageTerm,
            dutchTaxRate: taxRate,
            inflationRate: inflationRate
        });

        displayResults();
        saveFormValues(elements);

    } catch (error) {
        console.error('Error calculating mortgage:', error);
        alert('An error occurred: ' + error.message);
    }
}

function displayResults() {
    if (!calculator) return;

    try {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        const firstMonth = calculator.getFirstMonthPayment();
        const totalSummary = calculator.calculateTotalSummary();
        const yearlySummary = calculator.calculateYearlySummary();
        const firstYear = yearlySummary[0];
        
        const totalMonths = calculator.totalMonths;
        const avgMonthlyBruto = totalSummary.brutoPayment / totalMonths;
        const avgMonthlyNet = totalSummary.netPayment / totalMonths;
        const avgMonthlyTaxDeduction = totalSummary.taxDeduction / totalMonths;

        updateElement('avgMonthlyPayment', avgMonthlyBruto);
        updateElement('avgMonthlyBruto', avgMonthlyBruto);
        updateElement('avgMonthlyNet', avgMonthlyNet);
        updateElement('avgMonthlyTaxDeduction', avgMonthlyTaxDeduction);

        updateElement('monthlyPayment', firstMonth.payment);
        updateElement('monthlyInterest', firstMonth.interest);
        updateElement('monthlyPrincipal', firstMonth.principal);

        updateElement('yearlyPayment', firstYear.totalPayment);
        updateElement('yearlyBruto', firstYear.brutoPayment);
        updateElement('yearlyNet', firstYear.netPayment);
        updateElement('yearlyTaxDeduction', firstYear.taxDeduction);

        updateElement('totalPayment', totalSummary.totalPayment);
        updateElement('totalBruto', totalSummary.brutoPayment);
        updateElement('totalNet', totalSummary.netPayment);
        updateElement('totalTaxDeduction', totalSummary.taxDeduction);

        displayYearlyTable(yearlySummary);
        displayDistributionChart(totalSummary);
        displayYearlyChart(yearlySummary);

    } catch (error) {
        console.error('Error displaying results:', error);
        alert('Error displaying results: ' + error.message);
    }
}

function displayYearlyTable(yearlySummary) {
    const tbody = document.getElementById('yearlyTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    yearlySummary.forEach(yearData => {
        const row = document.createElement('tr');
        const inflationRate = calculator.inflationRate;
        const showReal = inflationRate > 0;
        
        // Format with real values in parentheses if inflation is set
        const formatWithReal = (nominal, real) => {
            if (showReal && real !== undefined && !isNaN(real)) {
                return `${formatCurrency(nominal)} <span style="color: #888; font-size: 0.9em;">(${formatCurrency(real)})</span>`;
            }
            return formatCurrency(nominal);
        };
        
        row.innerHTML = `
            <td>${yearData.year}</td>
            <td>${formatWithReal(yearData.brutoPayment, yearData.brutoPaymentReal)}</td>
            <td>${formatWithReal(yearData.totalInterest, yearData.totalInterestReal)}</td>
            <td>${formatWithReal(yearData.totalPrincipal, yearData.totalPrincipalReal)}</td>
            <td style="color: #28a745;">${formatWithReal(yearData.taxDeduction, yearData.taxDeductionReal)}</td>
            <td style="font-weight: 600;">${formatWithReal(yearData.netPayment, yearData.netPaymentReal)}</td>
            <td style="color: #dc3545; font-weight: 600;">${formatCurrency(yearData.remainingDebt)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Get totals - use totalSummary for real values which are already calculated
    const totalSummary = calculator.calculateTotalSummary();
    const totals = {
        bruto: totalSummary.brutoPayment,
        interest: totalSummary.totalInterest,
        principal: totalSummary.principal,
        taxDeduction: totalSummary.taxDeduction,
        net: totalSummary.netPayment,
        brutoReal: totalSummary.totalBrutoPaymentReal,
        interestReal: totalSummary.totalInterestReal,
        principalReal: totalSummary.totalPrincipalReal,
        taxDeductionReal: totalSummary.totalTaxDeductionReal,
        netReal: totalSummary.totalNetPaymentReal
    };
    
    const inflationRate = calculator.inflationRate;
    const showReal = inflationRate > 0;
    const formatWithReal = (nominal, real) => {
        if (showReal && real !== undefined && !isNaN(real)) {
            return `<strong>${formatCurrency(nominal)}</strong> <span style="color: #888; font-size: 0.9em;">(${formatCurrency(real)})</span>`;
        }
        return `<strong>${formatCurrency(nominal)}</strong>`;
    };
    
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td><strong>Total</strong></td>
        <td>${formatWithReal(totals.bruto, totals.brutoReal)}</td>
        <td>${formatWithReal(totals.interest, totals.interestReal)}</td>
        <td>${formatWithReal(totals.principal, totals.principalReal)}</td>
        <td style="color: #28a745;">${formatWithReal(totals.taxDeduction, totals.taxDeductionReal)}</td>
        <td>${formatWithReal(totals.net, totals.netReal)}</td>
        <td><strong>-</strong></td>
    `;
    tbody.appendChild(totalRow);
}

function displayDistributionChart(totalSummary) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    try {
        if (distributionChart) {
            distributionChart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        distributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [totalSummary.principal, totalSummary.totalInterest],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating distribution chart:', error);
    }
}

function displayYearlyChart(yearlySummary) {
    const canvas = document.getElementById('yearlyChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    try {
        if (yearlyChart) {
            yearlyChart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        const years = yearlySummary.map(y => y.year);
        const brutoPayments = yearlySummary.map(y => y.brutoPayment);
        const netPayments = yearlySummary.map(y => y.netPayment);
        const interestPayments = yearlySummary.map(y => y.totalInterest);
        const principalPayments = yearlySummary.map(y => y.totalPrincipal);
        
        yearlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Bruto Payment',
                        data: brutoPayments,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Net Payment',
                        data: netPayments,
                        borderColor: 'rgba(40, 167, 69, 1)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Interest',
                        data: interestPayments,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Principal',
                        data: principalPayments,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating yearly chart:', error);
    }
}

// LocalStorage Functions
function saveFormValues(elements) {
    try {
        if (!elements) {
            elements = getFormElements();
        }
        if (!validateElements(elements)) return;

        const formData = {
            principal: elements.principal.value,
            interestRate: elements.interestRate.value,
            paymentType: elements.paymentType.value,
            mortgageTerm: elements.mortgageTerm.value,
            taxRate: elements.taxRate.value,
            inflationRate: elements.inflationRate.value
        };
        
        localStorage.setItem('mortgageCalculatorConfig', JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving form values:', error);
    }
}

function loadFormValues() {
    try {
        const saved = localStorage.getItem('mortgageCalculatorConfig');
        if (!saved) return;
        
        const formData = JSON.parse(saved);
        const elements = getFormElements();
        
        if (elements.principal && formData.principal) elements.principal.value = formData.principal;
        if (elements.interestRate && formData.interestRate) elements.interestRate.value = formData.interestRate;
        if (elements.paymentType && formData.paymentType) elements.paymentType.value = formData.paymentType;
        if (elements.mortgageTerm && formData.mortgageTerm) elements.mortgageTerm.value = formData.mortgageTerm;
        if (elements.taxRate && formData.taxRate) elements.taxRate.value = formData.taxRate;
        if (elements.inflationRate && formData.inflationRate) elements.inflationRate.value = formData.inflationRate;
        
    } catch (error) {
        console.error('Error loading form values:', error);
        localStorage.removeItem('mortgageCalculatorConfig');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadFormValues();
    
    const form = document.getElementById('mortgageForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateMortgage();
        });
        
        form.addEventListener('input', () => {
            saveFormValues();
        });
    }
});

