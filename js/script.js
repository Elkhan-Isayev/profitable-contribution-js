"use strict";

/**
 * Profitable Contribution
 * A small vanilla-JS app that picks the bank deposit(s) yielding the highest
 * projected balance for a given initial amount, monthly top-up, term and currency.
 */

class Application {
    constructor() {
        const form = document.getElementById("deposit-form");
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.run();
        });
    }

    run() {
        const artisan = new Artisan();
        artisan.drawTable([]);              // Clear the table from the previous run
        artisan.drawMessage("");            // Clear any previous message

        const validator = new Validator();
        const deposit = validator.verifyInputFields();   // Validate and surface input errors
        if (!deposit) {
            return;
        }

        const parser = new Parser();
        const calculator = new Calculator(parser.getBankProducts());

        const products = calculator.filter(deposit);     // Keep only matching products
        if (products.length === 0) {
            artisan.drawMessage("No deposits match your criteria. Try adjusting the amount, term or currency.");
            return;
        }

        let result = calculator.preCalculate(deposit, products);   // Project the final balance
        result = calculator.prepare(result);                       // Sort and keep the best option(s)
        artisan.drawTable(result);
    }
}

class Calculator {
    constructor(bankProducts) {
        this.bankProducts = bankProducts;
    }

    filter(deposit) {
        let products = this.bankProducts.filter((p) => p.currency === deposit.depositCurrency);
        products = products.filter((p) => p.sumMin <= deposit.initialAmount);
        products = products.filter((p) => (p.sumMax === null ? true : p.sumMax >= deposit.initialAmount));
        products = products.filter((p) => p.termMin <= deposit.depositTerm);
        products = products.filter((p) => p.termMax >= deposit.depositTerm);
        if (deposit.monthlyReplenishment > 0) {
            products = products.filter((p) => p.canDeposit);
        }
        return products;
    }

    preCalculate(deposit, products) {
        return products.map((product) => this.calculate(deposit, product));
    }

    calculate(deposit, product) {
        const monthlyRate = product.incomeType / 100 / 12;
        let totalAmount = deposit.initialAmount;
        for (let i = 0; i < deposit.depositTerm; i++) {
            totalAmount += totalAmount * monthlyRate + deposit.monthlyReplenishment;
        }
        totalAmount = Math.round(totalAmount) - deposit.monthlyReplenishment;
        return new RecommendedProduct(product.bankName, product.investName, product.incomeType, totalAmount);
    }

    prepare(recommendedProducts) {
        recommendedProducts.sort((a, b) => b.totalAmount - a.totalAmount);
        const max = recommendedProducts[0].totalAmount;
        return recommendedProducts.filter((p) => p.totalAmount === max);
    }
}

class Deposit {
    constructor() {
        this.initialAmount = Number(document.getElementById("initial-amount").value);
        this.monthlyReplenishment = Number(document.getElementById("amount-of-monthly-replenishment").value);
        this.depositTerm = Number(document.getElementById("deposit-term").value);
        this.depositCurrency = document.getElementById("deposit-currency").value.trim().toUpperCase();
    }
}

class BankProduct {
    constructor({ bankName, investName, currency, incomeType, sumMin, sumMax, termMin, termMax, canDeposit }) {
        this.bankName = bankName;       // Bank name
        this.investName = investName;   // Deposit name
        this.currency = currency;       // Currency
        this.incomeType = incomeType;   // Annual interest rate, %
        this.sumMin = sumMin;           // Minimum amount
        this.sumMax = sumMax;           // Maximum amount (null = unlimited)
        this.termMin = termMin;         // Minimum term, months
        this.termMax = termMax;         // Maximum term, months
        this.canDeposit = canDeposit;   // Whether top-ups are allowed
    }
}

class RecommendedProduct {
    constructor(bankName, investName, incomeType, totalAmount) {
        this.bankName = bankName;
        this.investName = investName;
        this.incomeType = incomeType;
        this.totalAmount = totalAmount;
    }
}

class Validator {
    constructor() {
        this.deposit = new Deposit();
    }

    verifyInputFields() {
        const errors = [];
        const artisan = new Artisan();

        if (!(this.deposit.initialAmount >= 0)) {
            errors.push("Initial amount must be a non-negative number.");
        }
        if (!(this.deposit.monthlyReplenishment >= 0)) {
            errors.push("Monthly top-up must be a non-negative number.");
        }
        if (!(this.deposit.depositTerm > 0 && this.isInteger(this.deposit.depositTerm))) {
            errors.push("Term must be a positive whole number of months.");
        }
        if (!(this.deposit.depositCurrency === "RUB" || this.deposit.depositCurrency === "USD")) {
            errors.push("Currency must be either RUB or USD.");
        }

        artisan.drawErrors(errors);
        return errors.length === 0 ? this.deposit : false;
    }

    isInteger(number) {
        return Number.isInteger(number);
    }
}

class Parser {
    constructor() {
        this.array = Array.from(bankProductsData);   // Raw data -> array
    }

    getBankProducts() {
        return this.array.map((item) => new BankProduct(item));
    }
}

class Artisan {
    drawTable(recommendedProducts) {
        const wrapper = document.getElementById("table-wrapper");
        if (recommendedProducts.length === 0) {
            wrapper.innerHTML = "";
            return;
        }

        const rows = recommendedProducts
            .map(
                (p) => `
                <tr>
                    <td>${p.bankName}</td>
                    <td>${p.investName}</td>
                    <td>${p.incomeType}%</td>
                    <td class="amount">${p.totalAmount.toLocaleString("en-US")}</td>
                </tr>`
            )
            .join("");

        wrapper.innerHTML = `
            <table>
                <tr>
                    <th>Bank</th>
                    <th>Deposit</th>
                    <th>Rate</th>
                    <th>Projected balance</th>
                </tr>
                ${rows}
            </table>`;
    }

    drawMessage(message) {
        const wrapper = document.getElementById("table-wrapper");
        wrapper.innerHTML = message ? `<p class="message">${message}</p>` : "";
    }

    drawErrors(errors) {
        const list = errors.map((error) => `<li class="error-list-item">${error}</li>`).join("");
        document.getElementById("error-list").innerHTML = list;
    }
}

// Stamp the current year in the footer and boot the app.
document.querySelector(".copyright-year").textContent = new Date().getFullYear();
new Application();
