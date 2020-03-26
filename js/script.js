class Application {
    constructor() { 
        document.getElementById('select-button').addEventListener('click', this.RUN);
    }

    RUN() {
        let validator = new Validator();                                //  Создание валидатора  
        let deposit = validator.verifyInputFields();                    //  Возвращение userDeposit и валидация с выводом ошибок ввода 
        if(!deposit) {                                                  //  Если валидатор вернул false
            alert("Неверный формат ввода");                             //  ALERT
            return;                                                     //  Конец Программы
        }
        let parser = new Parser();                                      //  Создание парсера для JSON -> Array
        let calculator = new Calculator(parser.getBankProducts());      //  Передача калькулятору PRODUCTS
        let products = calculator.filter(deposit);                      //  Получение фильтрованного массива PRODUCTS
        if(products.length == 0) {                                      //  Если фильтрованный массив пуст
            alert("Нет подходящих вариантов");                          //  ALERT                          
            return;                                                     //  Конец Программы
        }
        let result = calculator.preCalculate(deposit, products);        //  Получение массива рекомендаций
        result = calculator.prepare(result);                            //  Сортировка и подготовка массива рекомендаций
        let artisan = new Artisan();                                    //  Создание редактора html документа
        artisan.drawTable(result);                                      //  Отправка отсортированного массива в html документ 
        return;                                                         //  Конец Программы
    }
}

class Calculator {
    constructor(bankProducts) {
        this.bankProducts = bankProducts;
    }

    filter(deposit) {
        this.bankProducts = this.bankProducts.filter(perBank => perBank.currency == deposit.depositCurrency);                                   //  RUB/USD
        this.bankProducts = this.bankProducts.filter(perBank => perBank.sumMin <= deposit.initialAmount);                                       //  SUMMIN 
        this.bankProducts = this.bankProducts.filter(perBank => (perBank.sumMax == null) ? true : perBank.sumMax >= deposit.initialAmount);     //  SUMMAX         
        this.bankProducts = this.bankProducts.filter(perBank => perBank.termMin <= deposit.depositTerm);                                        //  TERMMIN
        this.bankProducts = this.bankProducts.filter(perBank => perBank.termMax >= deposit.depositTerm);                                        //  TERMMAX      
        if(deposit.monthlyReplenishment > 0) {
            this.bankProducts = this.bankProducts.filter(perBank => perBank.canDeposit);                                                        //  CANDEPOSIT
        }
        return this.bankProducts;
    }

    preCalculate(deposit, products) {
        let result = [];
        for(let product of products) {
            result.push(this.calculate(deposit, product));
        }
        return result;   
    }

    calculate(deposit, product) { 
        let bankName = product.bankName;
        let investName = product.investName;
        let incomeType = product.incomeType;        
        // Вычисление итоговой суммы           
        let totalAmount = deposit.initialAmount;                          
        let percentPerMounth  = incomeType / 100 / 12;
        for(let i = 0; i < deposit.depositTerm; i++) {
            totalAmount += (totalAmount * percentPerMounth) + deposit.monthlyReplenishment; 
        }
        totalAmount = Math.round(totalAmount);
        totalAmount -= deposit.monthlyReplenishment;
        return new RecommendedProduct(bankName, investName, incomeType, totalAmount);
    }

    prepare(recommendedProducts) {
        function compare(a, b) {
            if(a.totalAmount < b.totalAmount) {
                return 1;
            }
            if(a.totalAmount > b.totalAmount) {
                return -1;
            }
        }
        recommendedProducts = recommendedProducts.sort(compare);        // Сортировка callback функцией
        let max = recommendedProducts[0].totalAmount;
        let resultArray = [];
        for(let i=0; i<recommendedProducts.length; i++) {
            if(recommendedProducts[i].totalAmount == max) {
                resultArray.push(recommendedProducts[i]);
            }
        }
        return resultArray;
    }
}

class Deposit {
    constructor() {
        this.initialAmount          = Number(document.getElementById('initial-amount').value);                          //  Начальная сумма
        this.monthlyReplenishment   = Number(document.getElementById('amount-of-monthly-replenishment').value);         //  Сумма ежемесячного пополнения
        this.depositTerm            = Number(document.getElementById('deposit-term').value);                            //  Срок вклада  
        this.depositCurrency        = document.getElementById('deposit-currency').value;                                //  Валюта вклада   
    }
}

class BankProduct {
    constructor({bankName, investName, currency , incomeType, sumMin, sumMax, termMin, termMax, canDeposit}) {
        this.bankName   = bankName;                                                                         //  Название банка
        this.investName = investName;                                                                       //  Название вклада
        this.currency   = currency;                                                                         //  Валюта          
        this.incomeType = incomeType;                                                                       //  Доходность %
        this.sumMin     = sumMin;                                                                           //  Минимальная сумма
        this.sumMax     = sumMax;                                                                           //  Максимальная сумма
        this.termMin    = termMin;                                                                          //  Минимальный срок      
        this.termMax    = termMax;                                                                          //  Максимальный срок
        this.canDeposit = canDeposit;                                                                       //  Возможность пополнения
    }
}

class RecommendedProduct {
    constructor(bankName, investName, incomeType, totalAmount) {
        this.bankName       = bankName;                             // Название банка
        this.investName     = investName;                           // Название вклада
        this.incomeType     = incomeType;                           // Доходность %
        this.totalAmount    = totalAmount;                          // Итоговая сумма 
    }   
}

class Validator {
    constructor() {
        this.deposit = new Deposit(); 
    }
    verifyInputFields() {
        const errorArray = [];
        let artisan = new Artisan();
        artisan.drawErrors(errorArray);
        if((this.deposit.initialAmount >= 0) && (this.deposit.monthlyReplenishment >= 0) && (this.deposit.depositTerm > 0 && this.isInteger(this.deposit.depositTerm)) && (this.deposit.depositCurrency == 'RUB' || this.deposit.depositCurrency == 'USD')) {
           return this.deposit;
        } 
        if(!(this.deposit.initialAmount >= 0)) {
            errorArray.push("Неверный формат начальной суммы");
        }
        if(!(this.deposit.monthlyReplenishment >= 0)) {
            errorArray.push("Неверный формат суммы ежемесячного пополнения");
        }
        if(!(this.deposit.depositTerm > 0 && this.isInteger(this.deposit.depositTerm))) {
            errorArray.push("Неверный формат cрока вклада");
        }
        if(!(this.deposit.depositCurrency == 'RUB' || this.deposit.depositCurrency == 'USD')) {
            errorArray.push("Неверный формат валюты вклада");
        }
        artisan.drawErrors(errorArray);
        return false;
    }
    isInteger(number) {
        if(number % 1 == 0) {
            return true;
        }
        return false; 
    }
}

class Parser {
    constructor() {
        this.array = Array.from(globalArray);   // JSON -> Array
    } 
    getBankProducts() {
        for(let i = 0; i < this.array.length; i++) {
            this.array[i] = new BankProduct(this.array[i]);
        }
        return this.array;
    }
}

class Artisan {
    constructor() {
        this.tableId = document.getElementById('table');
    }

    drawTable(recommendedProducts) {
        let table = `
        <table>
            <tr>    
                <th>Название банка</th>
                <th>Вклад</th>
                <th>Процент</th>
                <th>Итоговая сумма</th>
            </tr>`;
            for(let i = 0; i < recommendedProducts.length; i++) {
                table += `
                <tr>
                    <td>${recommendedProducts[i].bankName}</td>
                    <td>${recommendedProducts[i].investName}</td>
                    <td>${recommendedProducts[i].incomeType}</td>
                    <td>${recommendedProducts[i].totalAmount}</td>
                </tr>`;
            }
        table += 
        `</table>`;
        document.getElementById('table-wrapper').innerHTML = table;
        return;
    }

    drawErrors(errorArray) {
        let errorList = ``;
        for(let i=0; i<errorArray.length; i++) {
            errorList += `<li class="error-list-item">${errorArray[i]}</li>`;
        }
        document.getElementById('error-list').innerHTML = errorList;
        return;
    }
}

new Application();