document.addEventListener('DOMContentLoaded', function () {
    toggleIncomeInput(); // 初始化时根据选择显示正确的输入框
});

// 控制收入类型选择的显示
function toggleIncomeInput() {
    var incomeType = document.getElementById('incomeType').value;
    document.getElementById('annualIncomeInput').style.display = incomeType === 'annual' ? 'block' : 'none';
    document.getElementById('monthlyIncomeInput').style.display = incomeType === 'annual' ? 'none' : 'block';
}

// 控制税务相关输入的显示
function toggleTaxationInput() {
    var taxationChecked = document.getElementById('taxation').checked;
    document.getElementById('taxInputs').style.display = taxationChecked ? 'block' : 'none';
}

// 主要的财务计算逻辑
function calculateFinances() {
    // 获取基本财务数据
    var currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
    var interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
    var retirementYears = parseInt(document.getElementById('retirementYears').value) || 0;
    var annualSpending = parseFloat(document.getElementById('annualSpending').value) || 0;

    //计税参数
    var taxation = document.getElementById('taxation').checked;
    var taxDeduction = parseFloat(document.getElementById('taxDeduction').value) || 0;

    //过程参数
    var socialSecurity = 0
    var housingFund = 0
    var tax = 0


    // 计算每年的财务情况并生成表格
    var table = "<table><tr><th>年份</th><th>年初存款总额</th><th>年末存款总额</th><th>年利息（收入）</th><th>税后年收入（收入）</th><th>年使用金额（支出）</th><th>社保</th><th>公积金</th><th>个税</th></tr>";
    var year = new Date().getFullYear();


    // 根据月收入或年收入计算年总收入
    var incomeType = document.getElementById('incomeType').value;
    var annualIncome;


    if (incomeType === 'annual') {
        annualIncome = parseFloat(document.getElementById('annualIncome').value);
    } else {
        var monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
        var totalMonths = parseInt(document.getElementById('totalMonths').value);
        console.log("月收入: " + monthlyIncome);
        console.log("总月份: " + totalMonths);
        annualIncome = monthlyIncome * totalMonths
    }
    financeData = calculateAnnualIncome(annualIncome, taxation, taxDeduction);
    annualIncome = financeData.annualIncome; // 从对象中提取年收入
    housingFund = financeData.housingFund; // 从对象中提取公积金
    socialSecurity = financeData.socialSecurity; // 从对象中提取社保

    console.log("计算的年收入: " + annualIncome);
    console.log("计算的公积金: " + housingFund);
    console.log("计算的社保: " + socialSecurity);


    //生成财务表格
    var futureSavings = currentSavings; // 确保currentSavings被正确获取

    for (var i = 0; i < retirementYears; i++) {
        var startOfYearSavings = futureSavings;
        futureSavings += (futureSavings * interestRate) + annualIncome - annualSpending;
        var interestEarned = futureSavings - startOfYearSavings - annualIncome + annualSpending;
        var annualIncomeDisplay = annualIncome;  // 年收入
        var socialSecurityDisplay = socialSecurity; // 社保扣除
        var housingFundDisplay = housingFund; // 公积金扣除
        var taxDisplay = tax; // 税款

        console.log("第 " + (i + 1) + " 年:");
        console.log(" - 年初存款总额: " + startOfYearSavings.toFixed(2));
        console.log(" - 年末存款总额: " + futureSavings.toFixed(2));
        console.log(" - 年利息收入: " + interestEarned.toFixed(2));
        table += "<tr><td>" + (year + i) + "</td><td>" + startOfYearSavings.toFixed(2) + "</td><td>" + futureSavings.toFixed(2) + "</td><td>" + interestEarned.toFixed(2) + "</td><td>" + annualIncomeDisplay.toFixed(2) + "</td><td>" + annualSpending.toFixed(2) + "</td><td>" + socialSecurityDisplay.toFixed(2) + "</td><td>" + housingFundDisplay.toFixed(2) + "</td><td>" + taxDisplay.toFixed(2) + "</td></tr>";
    }
    table += "</table>";



    // 添加结论判断
    // var retirementInterestIncome = futureSavings * interestRate;
    // var conclusion = retirementInterestIncome >= annualSpending
    //     ? "您的年利息收入可以覆盖您的年度支出，达到财务自由。"
    //     : "您的年利息收入无法覆盖年度支出，还需继续积累资金。";

    // table += "</table>";
    // table += "<p>" + conclusion + "</p>";
    // var resultElement = document.getElementById('result');
    // resultElement.innerHTML = table;

    var retirementInterestIncome = futureSavings * interestRate;
    var conclusion = "<p>退休当年的年利息所得: " + retirementInterestIncome.toFixed(2) + "<br>预计年支出: " + annualSpending.toFixed(2) + "<br>";
    conclusion += retirementInterestIncome >= annualSpending ? "年利息所得可以覆盖年支出，达到财务自由。" : "年利息所得无法覆盖年支出，还需继续积累资金。";
    conclusion += "</p>";

    var resultElement = document.getElementById('result');
    resultElement.innerHTML = table + conclusion;



    // 计算年度总收入，考虑税务情况
    function calculateAnnualIncome(annualIncome, taxation, taxDeduction) {
        // 根据用户的选择和专项附加扣除计算年收入
        console.log("初步计算的年收入: " + annualIncome);

        if (taxation) {
            var housingFundBase = parseFloat(document.getElementById('housingFundBase').value) || 0;
            var housingFundRate = parseFloat(document.getElementById('housingFundRate').value) / 100 || 0;
            var socialSecurityBase = parseFloat(document.getElementById('socialSecurityBase').value) || 0;
            var socialSecurityRate = parseFloat(document.getElementById('socialSecurityRate').value) / 100 || 0;

            housingFund = housingFundBase * housingFundRate;
            socialSecurity = socialSecurityBase * socialSecurityRate;

            var totalDeductions = (housingFund + socialSecurity) * 12;
            var taxableIncome = annualIncome - totalDeductions;
            console.log("公积金&社保全年: " + totalDeductions);
            console.log("计税前工资: " + taxableIncome);

            tax = calculateTax(taxableIncome, taxDeduction);
            console.log("个税: " + tax);

            annualIncome = taxableIncome - tax; // 计算税后收入时减去税款
        }


        console.log("考虑税务后的年收入: " + annualIncome);

        return {
            annualIncome: annualIncome,
            housingFund: housingFund,
            socialSecurity: socialSecurity
        };
    }

    // 计算税款
    function calculateTax(annualIncome, taxDeduction) {
        var basicDeduction = 60000; // 基本扣除
        var taxableIncome = annualIncome - basicDeduction - (taxDeduction * 12);

        if (taxableIncome <= 0) {
            return 0; // 不需纳税
        } else if (taxableIncome <= 36000) {
            return taxableIncome * 0.03;
        } else if (taxableIncome <= 144000) {
            return taxableIncome * 0.1 - 2520
        } else if (taxableIncome <= 300000) {
            return taxableIncome * 0.2 - 16920
        } else if (taxableIncome <= 420000) {
            return taxableIncome * 0.25 - 31920
        } else if (taxableIncome <= 660000) {
            return taxableIncome * 0.3 - 52920
        } else if (taxableIncome <= 960000) {
            return taxableIncome * 0.35 - 85920
        } else {
            return taxableIncome * 0.45 - 181920
        }

    }
    console.log("年收入: " + annualIncome);
    console.log("利率: " + interestRate);
    console.log("退休年数: " + retirementYears);
}
