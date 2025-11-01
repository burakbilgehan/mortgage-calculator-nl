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
        
        this.monthlyInterestRate = this.interestRate / 100 / 12;
        this.totalMonths = this.mortgageTerm * 12;
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
        });

        return Object.values(yearlyData);
    }

    calculateTotalSummary() {
        const amortization = this.calculateSchedule();
        const totalInterest = amortization.totalInterest;
        const totalPayment = amortization.totalPayment;
        const taxDeduction = totalInterest * this.dutchTaxRate;
        
        return {
            principal: this.principal,
            totalInterest,
            totalPayment,
            taxDeduction,
            brutoPayment: totalPayment,
            netPayment: totalPayment - taxDeduction
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
        taxRate: document.getElementById('taxRate')
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

        calculator = new MortgageCalculator({
            principal,
            interestRate,
            paymentType,
            mortgageTerm,
            dutchTaxRate: taxRate
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
        row.innerHTML = `
            <td>${yearData.year}</td>
            <td>${formatCurrency(yearData.brutoPayment)}</td>
            <td>${formatCurrency(yearData.totalInterest)}</td>
            <td>${formatCurrency(yearData.totalPrincipal)}</td>
            <td style="color: #28a745;">${formatCurrency(yearData.taxDeduction)}</td>
            <td style="font-weight: 600;">${formatCurrency(yearData.netPayment)}</td>
            <td style="color: #dc3545; font-weight: 600;">${formatCurrency(yearData.remainingDebt)}</td>
        `;
        tbody.appendChild(row);
    });
    
    const totals = yearlySummary.reduce((acc, year) => ({
        bruto: acc.bruto + year.brutoPayment,
        interest: acc.interest + year.totalInterest,
        principal: acc.principal + year.totalPrincipal,
        taxDeduction: acc.taxDeduction + year.taxDeduction,
        net: acc.net + year.netPayment
    }), { bruto: 0, interest: 0, principal: 0, taxDeduction: 0, net: 0 });
    
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td><strong>Total</strong></td>
        <td><strong>${formatCurrency(totals.bruto)}</strong></td>
        <td><strong>${formatCurrency(totals.interest)}</strong></td>
        <td><strong>${formatCurrency(totals.principal)}</strong></td>
        <td style="color: #28a745;"><strong>${formatCurrency(totals.taxDeduction)}</strong></td>
        <td><strong>${formatCurrency(totals.net)}</strong></td>
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
            taxRate: elements.taxRate.value
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

