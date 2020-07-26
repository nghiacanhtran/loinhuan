jQuery(document).ready(function () {
    $("#region-calculate_frm-money").on("keydown", function (e) {
        var keycode = (event.which) ? event.which : event.keyCode;
        if (e.shiftKey == true || e.ctrlKey == true) return false;
        if ([8, 110, 39, 37, 46].indexOf(keycode) >= 0 || // allow tab, dot, left and right arrows, delete keys
            (keycode == 190 && this.value.indexOf('.') === -1) || // allow dot if not exists in the value
            (keycode == 110 && this.value.indexOf('.') === -1) || // allow dot if not exists in the value
            (keycode >= 48 && keycode <= 57) || // allow numbers
            (keycode >= 96 && keycode <= 105)) { // allow numpad numbers
            // check for the decimals after dot and prevent any digits
            var parts = this.value.split('.');
            if (parts.length > 1 && // has decimals
                parts[1].length >= 2 && // should limit this
                (
                    (keycode >= 48 && keycode <= 57) || (keycode >= 96 && keycode <= 105)
                ) // requested key is a digit
            ) {
                return false;
            } else {
                if (keycode == 110) {
                    this.value += ".";
                    return false;
                }
                return true;
            }
        } else {
            return false;
        }
    }).on("keyup", function () {
        var parts = this.value.split('.');
        parts[0] = parts[0].replace(/,/g, '').replace(/^0+/g, '');
        if (parts[0] == "") parts[0] = "0";
        var calculated = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        if (parts.length >= 2) calculated += "." + parts[1].substring(0, 2);
        this.value = calculated;
        if (this.value == "NaN" || this.value == "") this.value = 0;
    });

    indexModule.validateFormCalculate();
});

var indexConfig = (function () {
    var configRate = {
        'Nghia': 2/3,
        'Dung': 1/3
    }

    var stringConstant = {
        messRequireInputMoney : 'Không được để trống trường này'
    };

    return {
        configRate: configRate,
        stringConstant: stringConstant
    };
})();

var indexModule = (function (config) {
    var configRate = config.configRate;
    var stringConstant = config.stringConstant;

    let calculateMoney = function () {
        let currency = $("#region-calculate_frm-money").val();
        let currencyNotDigit = Number(currency.replace(',', '') || '0');
        let interestRate = Number($('#region-calculate_frm-interest-rate').val());
        let viewMode = Number($('input[name="viewMode"]:checked').val());
        let moneyOfForexTeam = (currencyNotDigit * interestRate) / 100;//
        let moneyOfForexUser = currencyNotDigit - moneyOfForexTeam;

        switch (viewMode) {
            case 1: //normal
                genderGridReport({
                    viewMode: viewMode,
                    ForexTeamMoney: moneyOfForexTeam,
                    ForexUserMoney: moneyOfForexUser
                });
                break;
            case 2: //another
                let moneyOfNghiax = moneyOfForexUser * Number(configRate.Nghia);
                let moneyOfDung = moneyOfForexUser * Number(configRate.Dung);

                genderGridReport({
                    viewMode: viewMode,
                    ForexTeamMoney:moneyOfForexTeam,
                    ForexNghiaMoney: moneyOfNghiax, 
                    ForexDungMoney: moneyOfDung
                });
                break;
        }
    };

    let genderGridReport = function (option) {
        let viewMode = option.viewMode;
        let html = ``;

        switch (viewMode) {
            case 1:
                html = `
                        <tr>
                            <td>Forex Team</td>
                            <td>${option.ForexTeamMoney}$</td>
                        </tr>
                        <tr>
                            <td>Forex User</td>
                            <td>${option.ForexUserMoney}$</td>  
                        </tr>
                        `;
                break;
            case 2:
                html = `
                        <tr>
                            <td>Forex Team</td>
                            <td>${option.ForexTeamMoney}$</td>
                        </tr>
                        <tr>
                          <td>Forex Nghĩa</td>
                          <td>${option.ForexNghiaMoney}$</td>
                        </tr>
                        <tr>
                            <td>Forex Dũng</td>
                            <td>${option.ForexDungMoney}$</td>
                        </tr>
                `;
                break;
        }
        $('#grid-report').find('tbody').html(html);
        $('#report-region').removeClass('d-none');
    };

    let validateFormCalculate = function () {
        $('#region-calculate_frm').validate({
            rules: {
                'money': {
                    required: true
                }
            },
            messages: {
                'money': {
                    required: stringConstant.messRequireInputMoney
                }
            },
            errorPlacement: function(error, element) {
                $(error).insertAfter($(element).parent());
            },
            submitHandler: function () {
                calculateMoney();
                return false;
            }
        });
    }

    return {
        validateFormCalculate: validateFormCalculate
    }
})(indexConfig);